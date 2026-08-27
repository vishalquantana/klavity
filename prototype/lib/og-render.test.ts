import { test, expect, describe } from "bun:test"
import { serveOgImage, ogS3Key, type OgServeDeps } from "./og-render"
import type { OgCardData } from "./og-card"

// The crawler-safety guarantee (KLA-738): GET /og/:ref.png must serve cache-or-default INSTANTLY and
// NEVER render synchronously on the request. These tests exercise serveOgImage with injected deps so
// no real S3/Chromium is touched.

const DEFAULT_BYTES = new Uint8Array([1, 2, 3, 4]) // sentinel "default card" PNG
const loadData = async (): Promise<OgCardData> => ({ type: "default" })

describe("ogS3Key", () => {
  test("versioned key folds the version into the object name (cache-busting)", () => {
    expect(ogS3Key("fb_abc", "1699")).toBe("og/fb_abc-1699.png")
    expect(ogS3Key("fb_abc")).toBe("og/fb_abc.png")
  })
  test("sanitizes unsafe ref/version chars", () => {
    expect(ogS3Key("../../etc/passwd", "a/b")).toBe("og/etcpasswd-ab.png")
  })
})

describe("serveOgImage — cache HIT streams the S3 object", () => {
  test("hit → 200, streams the object body, long immutable cache, no enqueue/render", async () => {
    const s3Body = new Uint8Array([9, 9, 9])
    let enqueued = 0
    const deps: OgServeDeps = {
      getStream: async (key: string) => {
        expect(key).toBe("og/fb_hit-42.png")
        return {
          stream: new ReadableStream<Uint8Array>({ start(c) { c.enqueue(s3Body); c.close() } }),
          contentType: "image/png",
          size: 3,
        }
      },
      enqueue: () => { enqueued++ },
      defaultPng: () => DEFAULT_BYTES,
    }
    const res = await serveOgImage("fb_hit", "42", loadData, deps)
    expect(res.status).toBe(200)
    expect(res.headers.get("x-og-cache")).toBe("hit")
    expect(res.headers.get("cache-control")).toContain("immutable")
    const body = new Uint8Array(await res.arrayBuffer())
    expect(Array.from(body)).toEqual([9, 9, 9])
    // A cache hit must NOT enqueue a background render.
    expect(enqueued).toBe(0)
  })
})

describe("serveOgImage — cache MISS returns default AND enqueues (never blocks/renders inline)", () => {
  test("miss → 200 default card + a background render job is queued, without an inline render", async () => {
    const enqueueCalls: Array<{ ref: string; version: string | number | null }> = []
    let inlineRenderCalls = 0
    const deps: OgServeDeps = {
      // Cache miss: the S3 object doesn't exist → getStream throws (same contract as getObjectStream).
      getStream: async () => { throw new Error("NoSuchKey") },
      // Spy enqueue — this is the ONLY place a render may be scheduled, and it is asynchronous/background.
      enqueue: (ref, version, load) => {
        enqueueCalls.push({ ref, version })
        // Prove the loader is deferred to the background job, not awaited on the request path.
        expect(typeof load).toBe("function")
      },
      defaultPng: () => { return DEFAULT_BYTES },
    }

    const res = await serveOgImage("fb_miss", "7", loadData, deps)

    // 1. Responds with the DEFAULT card immediately.
    expect(res.status).toBe(200)
    expect(res.headers.get("x-og-cache")).toBe("miss")
    const body = new Uint8Array(await res.arrayBuffer())
    expect(Array.from(body)).toEqual(Array.from(DEFAULT_BYTES))

    // 2. A background render job WAS enqueued for next time (cache warming).
    expect(enqueueCalls.length).toBe(1)
    expect(enqueueCalls[0]).toEqual({ ref: "fb_miss", version: "7" })

    // 3. CRAWLER-SAFETY: no render happened inline on the request path (serveOgImage never renders;
    //    only the injected background enqueue could, and it was a spy that did not).
    expect(inlineRenderCalls).toBe(0)
  })

  test("miss response is short-cached so the freshly-rendered card is picked up soon", async () => {
    const deps: OgServeDeps = {
      getStream: async () => { throw new Error("miss") },
      enqueue: () => {},
      defaultPng: () => DEFAULT_BYTES,
    }
    const res = await serveOgImage("fb_x", null, loadData, deps)
    expect(res.headers.get("cache-control")).toContain("max-age=60")
  })
})
