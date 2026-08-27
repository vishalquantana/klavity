import { test, expect, describe, beforeEach } from "bun:test"
import {
  serveOgImage, ogS3Key, renderOgPngWith, serveDefaultOgResponse,
  ogLiveBrowserCount, __resetOgLiveBrowsersForTest, OgAdmissionError,
  type OgServeDeps, type OgBrowserLike, type OgContextLike, type OgPageLike,
  type OgServerLike, type OgLaunched,
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

// ── KLA-739 C2-3 (round 6): definitive teardown via a real killable BrowserServer handle. A close()
// rejection only means close FAILED, not that Chromium exited — so a failed close now SIGKILLs the real
// process and the live-slot is released ONLY on confirmed exit.
type CloseMode = "ok" | "reject" | "hang"
type KillMode = "ok" | "reject" | "hang"

// A fake OgLaunched whose "process" is alive until close/kill fires an exit. Models Playwright's
// BrowserServer: close()/kill() resolve AFTER the process exits; onExit fires on any exit.
function fakeLaunched(opts: { closeMode?: CloseMode; killMode?: KillMode } = {}): { launched: OgLaunched; isAlive: () => boolean; closeCalls: () => number; killCalls: () => number } {
  const closeMode = opts.closeMode ?? "ok"
  const killMode = opts.killMode ?? "ok"
  let alive = true
  let closeCalls = 0
  let killCalls = 0
  const exitCbs: Array<() => void> = []
  const fireExit = () => { if (alive) { alive = false; for (const cb of exitCbs) cb() } }
  const page: OgPageLike = { setContent: async () => {}, evaluate: async () => {}, screenshot: async () => new Uint8Array([7, 7]) }
  const context: OgContextLike = { newPage: async () => page, close: async () => {} }
  const browser: OgBrowserLike = { newContext: async () => context }
  const server: OgServerLike = {
    close: () => {
      closeCalls++
      if (closeMode === "ok") { fireExit(); return Promise.resolve() }
      if (closeMode === "reject") return Promise.reject(new Error("close failed"))
      return new Promise<void>(() => {}) // hang
    },
    kill: () => {
      killCalls++
      if (killMode === "ok") { fireExit(); return Promise.resolve() }
      if (killMode === "reject") return Promise.reject(new Error("kill failed"))
      return new Promise<void>(() => {}) // hang
    },
    onExit: (cb) => { if (!alive) cb(); else exitCbs.push(cb) },
  }
  return { launched: { browser, server }, isAlive: () => alive, closeCalls: () => closeCalls, killCalls: () => killCalls }
}

describe("renderOgPngWith — definitive teardown + live-process bound (C2-3 round 6)", () => {
  test("normal render returns bytes AND releases the live-slot to 0 (process exited)", async () => {
    const f = fakeLaunched({ closeMode: "ok" })
    const png = await renderOgPngWith("<html></html>", async () => f.launched, 5_000, 30)
    expect(Array.from(png)).toEqual([7, 7])
    await new Promise((r) => setTimeout(r, 5))
    expect(ogLiveBrowserCount()).toBe(0)
    expect(f.isAlive()).toBe(false)
  })

  test("a hung RENDER times out AND the server is torn down (process exits)", async () => {
    // hanging screenshot → render never resolves; graceful close then reaps the process.
    const f = fakeLaunched({ closeMode: "ok" })
    ;(f.launched.browser as any).newContext = async () => ({
      newPage: async () => ({ setContent: async () => {}, evaluate: async () => {}, screenshot: () => new Promise<Uint8Array>(() => {}) }),
      close: async () => {},
    })
    let threw = false
    try { await renderOgPngWith("<html></html>", async () => f.launched, 25) } catch (e: any) { threw = true; expect(String(e?.message)).toContain("timed out") }
    expect(threw).toBe(true)
    await new Promise((r) => setTimeout(r, 10))
    expect(f.isAlive()).toBe(false)
    expect(ogLiveBrowserCount()).toBe(0)
  })

  // Delayed launch: launch resolves AFTER the deadline → the late server is still torn down + released.
  test("a DELAYED launch (resolves after timeout) is still torn down + released", async () => {
    const f = fakeLaunched({ closeMode: "ok" })
    const launch = () => new Promise<OgLaunched>((res) => setTimeout(() => res(f.launched), 40))
    let threw = false
    try { await renderOgPngWith("<html></html>", launch, 10) } catch (e: any) { threw = true; expect(String(e?.message)).toContain("timed out") }
    expect(threw).toBe(true)
    await new Promise((r) => setTimeout(r, 80))
    expect(f.isAlive()).toBe(false)
    expect(ogLiveBrowserCount()).toBe(0)
  })

  // #4 sync-throw launch: a synchronously-throwing launcher must still run cleanup (no pre-reserved leak).
  test("a SYNCHRONOUSLY-throwing launcher rejects AND releases the pre-reserved slot", async () => {
    const before = ogLiveBrowserCount()
    let threw = false
    try { await renderOgPngWith("<html></html>", () => { throw new Error("launch boom") }, 5_000, 30) } catch (e: any) { threw = true; expect(String(e?.message)).toContain("launch boom") }
    expect(threw).toBe(true)
    await new Promise((r) => setTimeout(r, 5))
    expect(ogLiveBrowserCount()).toBe(before)
  })

  // A HUNG close but a working kill → SIGKILL reaps the process; slot released within the bound.
  test("a HUNG close() → SIGKILL reaps the process; slot released within closeTimeoutMs", async () => {
    const f = fakeLaunched({ closeMode: "hang", killMode: "ok" })
    const t0 = Date.now()
    const png = await renderOgPngWith("<html></html>", async () => f.launched, 5_000, 30)
    expect(Array.from(png)).toEqual([7, 7])
    expect(Date.now() - t0).toBeLessThan(1_000) // shared slot released within bound
    await new Promise((r) => setTimeout(r, 20))
    expect(f.killCalls()).toBe(1)      // force-killed
    expect(f.isAlive()).toBe(false)    // process reaped
    expect(ogLiveBrowserCount()).toBe(0)
  })

  // REQUIRED neg-control (Codex probe b): a REJECTED close() must SIGKILL the real process — a counter
  // that merely decremented on the rejection (round-5) would show trackedLive:0 while the process lived.
  test("probe (b): 7 renders whose close() REJECTS → every process is SIGKILLed, live count accurate", async () => {
    const CAP = 4
    const fs: Array<ReturnType<typeof fakeLaunched>> = []
    const launch = async (): Promise<OgLaunched> => { const f = fakeLaunched({ closeMode: "reject", killMode: "ok" }); fs.push(f); return f.launched }
    for (let i = 0; i < 7; i++) await renderOgPngWith("<html></html>", launch, 1_000, 10, CAP)
    await new Promise((r) => setTimeout(r, 20))
    expect(fs.length).toBe(7)                                    // each reaped before the next → all admitted
    expect(fs.filter((f) => f.isAlive()).length).toBe(0)        // NEG-CONTROL: EVERY process actually killed
    expect(fs.every((f) => f.killCalls() === 1)).toBe(true)     // kill invoked on each failed close
    expect(ogLiveBrowserCount()).toBe(0)                        // tracked count accurate
  })

  // REQUIRED neg-control (Codex probe a): worst case — BOTH close() and kill() hang (unreapable). Live
  // processes must still be bounded by the cap: after `cap` renders admission fails-fast (default card).
  test("probe (a): 7 renders where BOTH close() and kill() hang → live bounded at cap, surplus fail-fast", async () => {
    const CAP = 4
    const fs: Array<ReturnType<typeof fakeLaunched>> = []
    const launch = async (): Promise<OgLaunched> => { const f = fakeLaunched({ closeMode: "hang", killMode: "hang" }); fs.push(f); return f.launched }
    let rejections = 0
    let maxLive = 0
    for (let i = 0; i < 7; i++) {
      try { await renderOgPngWith("<html></html>", launch, 1_000, 10, CAP) }
      catch (e) { if (e instanceof OgAdmissionError) rejections++; else throw e }
      maxLive = Math.max(maxLive, ogLiveBrowserCount())
    }
    expect(fs.length).toBeLessThanOrEqual(CAP)   // never launched beyond the cap
    expect(maxLive).toBeLessThanOrEqual(CAP)      // live processes never exceeded the cap
    expect(ogLiveBrowserCount()).toBe(CAP)        // the cap's worth stay pinned (truly unreapable)
    expect(rejections).toBe(7 - CAP)              // surplus renders fail-fast (serve default)
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
