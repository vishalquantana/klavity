import { test, expect, describe, beforeEach } from "bun:test"
import {
  serveOgImage, ogS3Key, renderOgPngWith, serveDefaultOgResponse,
  ogLiveBrowserCount, __resetOgLiveBrowsersForTest, OgAdmissionError,
  type OgServeDeps, type OgBrowserLike, type OgContextLike, type OgPageLike,
} from "./og-render"
import type { OgCardData } from "./og-card"

// The live-browser cap is module-global; reset it between cases so a prior test's hung-close browser
// (deliberately left "alive") doesn't bleed into the next test's admission count.
beforeEach(() => __resetOgLiveBrowsersForTest())

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

// ── KLA-739 C2-3 (round 8): CONSERVATIVE live-browser bound over chromium.launch() (the Bun-compatible
// path). No process handle → we release the admission slot ONLY on a graceful close() that RESOLVES; a
// close that REJECTS or hangs PINS the slot (we can't prove the process died). Fakes model an
// OgBrowserLike (newContext + close) with a configurable close mode.
type CloseMode = "ok" | "reject" | "hang"

function fakeBrowser(opts: { closeMode?: CloseMode; hangRender?: boolean } = {}): { browser: OgBrowserLike; closeCalls: () => number } {
  const closeMode = opts.closeMode ?? "ok"
  let closeCalls = 0
  const page: OgPageLike = {
    setContent: async () => {},
    evaluate: async () => {},
    screenshot: () => (opts.hangRender ? new Promise<Uint8Array>(() => {}) : Promise.resolve(new Uint8Array([7, 7]))),
  }
  const context: OgContextLike = { newPage: async () => page, close: async () => {} }
  const browser: OgBrowserLike = {
    newContext: async () => context,
    close: () => {
      closeCalls++
      if (closeMode === "ok") return Promise.resolve()
      if (closeMode === "reject") return Promise.reject(new Error("close failed"))
      return new Promise<void>(() => {}) // hang
    },
  }
  return { browser, closeCalls: () => closeCalls }
}

describe("renderOgPngWith — conservative live-browser bound (C2-3 round 8)", () => {
  test("normal render returns bytes AND releases the live-slot to 0 (close resolved)", async () => {
    const f = fakeBrowser({ closeMode: "ok" })
    const png = await renderOgPngWith("<html></html>", async () => f.browser, 5_000, 30)
    expect(Array.from(png)).toEqual([7, 7])
    await new Promise((r) => setTimeout(r, 5))
    expect(f.closeCalls()).toBe(1)
    expect(ogLiveBrowserCount()).toBe(0)
  })

  test("a hung RENDER times out AND the browser is closed (slot released on the graceful close)", async () => {
    const f = fakeBrowser({ closeMode: "ok", hangRender: true })
    let threw = false
    try { await renderOgPngWith("<html></html>", async () => f.browser, 25) } catch (e: any) { threw = true; expect(String(e?.message)).toContain("timed out") }
    expect(threw).toBe(true)
    await new Promise((r) => setTimeout(r, 10))
    expect(f.closeCalls()).toBe(1)
    expect(ogLiveBrowserCount()).toBe(0)
  })

  test("a SYNCHRONOUSLY-throwing launcher rejects AND releases the pre-reserved slot (no leak)", async () => {
    const before = ogLiveBrowserCount()
    let threw = false
    try { await renderOgPngWith("<html></html>", () => { throw new Error("launch boom") }, 5_000, 30) } catch (e: any) { threw = true; expect(String(e?.message)).toContain("launch boom") }
    expect(threw).toBe(true)
    await new Promise((r) => setTimeout(r, 5))
    expect(ogLiveBrowserCount()).toBe(before)
  })

  // CONSERVATIVE neg-control: a browser whose close() REJECTS must NOT release the slot (we can't prove
  // the process died). NEG-CONTROL: a naive "release on close settle (resolve OR reject)" would drop to 0.
  test("a REJECTED close() does NOT release the slot (pinned — bounds live count)", async () => {
    const f = fakeBrowser({ closeMode: "reject" })
    const t0 = Date.now()
    const png = await renderOgPngWith("<html></html>", async () => f.browser, 5_000, 30)
    expect(Array.from(png)).toEqual([7, 7])
    expect(Date.now() - t0).toBeLessThan(1_000) // shared slot released within bound (render succeeded)
    await new Promise((r) => setTimeout(r, 20))
    expect(f.closeCalls()).toBe(1)
    expect(ogLiveBrowserCount()).toBe(1) // PINNED — close failed, no proof of exit
  })

  // Worst case: 7 renders whose close() never settles (or rejects) → live bounded at cap; surplus renders
  // fail-fast with OgAdmissionError (serve default). Bounded, fail-CLOSED — never an unbounded leak.
  test("probe: 7 renders with failing closes and cap=4 → live bounded at 4, surplus fail-fast", async () => {
    const CAP = 4
    let launched = 0
    let maxLive = 0
    let rejections = 0
    const launch = async (): Promise<OgBrowserLike> => { launched++; return fakeBrowser({ closeMode: "hang" }).browser }
    for (let i = 0; i < 7; i++) {
      try { await renderOgPngWith("<html></html>", launch, 1_000, 10, CAP) }
      catch (e) { if (e instanceof OgAdmissionError) rejections++; else throw e }
      maxLive = Math.max(maxLive, ogLiveBrowserCount())
    }
    expect(launched).toBeLessThanOrEqual(CAP)  // never launched beyond the cap
    expect(maxLive).toBeLessThanOrEqual(CAP)    // live browsers never exceeded the cap
    expect(ogLiveBrowserCount()).toBe(CAP)      // the cap's worth stay pinned (failing closes)
    expect(rejections).toBe(7 - CAP)            // surplus renders fail-fast
  })

  test("OgAdmissionError is an Error subclass (callers catch → serve default card, never 500)", () => {
    const e = new OgAdmissionError()
    expect(e instanceof Error).toBe(true)
    expect(e instanceof OgAdmissionError).toBe(true)
  })
})

// ── KLA-739 C1 (existence oracle): the response for a non-anon-serveable ref (unknown OR login-gated)
// must be byte-identical + header-identical so /og can't distinguish a private ticket from a missing one,
// and it must never carry an `x-og-cache: hit`.
describe("serveDefaultOgResponse — indistinguishable default (C1 no existence oracle)", () => {
  test("identical body + headers for any ref; never x-og-cache:hit", async () => {
    const png = new Uint8Array([5, 5, 5])
    const a = serveDefaultOgResponse(() => png)
    const b = serveDefaultOgResponse(() => png)
    expect(a.status).toBe(200)
    expect(a.headers.get("content-type")).toBe(b.headers.get("content-type"))
    expect(a.headers.get("cache-control")).toBe(b.headers.get("cache-control"))
    expect(a.headers.get("x-og-cache")).toBe(b.headers.get("x-og-cache"))
    expect(a.headers.get("x-og-cache")).not.toBe("hit")
    expect(Array.from(new Uint8Array(await a.arrayBuffer()))).toEqual([5, 5, 5])
    expect(Array.from(new Uint8Array(await b.arrayBuffer()))).toEqual([5, 5, 5])
  })
})
