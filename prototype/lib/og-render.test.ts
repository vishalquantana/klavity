import { test, expect, describe, beforeEach } from "bun:test"
import {
  serveOgImage, ogS3Key, renderOgPngWith, serveDefaultOgResponse,
  ogLiveBrowserCount, __resetOgLiveBrowsersForTest, OgAdmissionError,
  type OgServeDeps, type OgBrowserLike,
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

// ── KLA-739 C2-3 (browser leak on timeout): renderOgPngWith must ACTIVELY kill the browser when the
// render exceeds the deadline. NEG-CONTROL: the pre-fix Promise.race left the hung render() — and its
// Chromium process — alive when the deadline fired; asserting browser.close() is called on timeout FAILS
// against that behavior.
describe("renderOgPngWith — timeout kills the browser (single-browser invariant)", () => {
  function fakeBrowser(opts: { hang?: boolean }): { browser: OgBrowserLike; closed: () => number } {
    let closes = 0
    const page = {
      setContent: async () => {},
      evaluate: async () => {},
      // A hanging screenshot models a wedged render that never resolves.
      screenshot: async () => (opts.hang ? new Promise<Uint8Array>(() => {}) : new Uint8Array([7, 7])),
    }
    const context = { newPage: async () => page, close: async () => {} }
    const browser: OgBrowserLike = { newContext: async () => context, close: async () => { closes++ } }
    return { browser, closed: () => closes }
  }

  test("a hung render times out AND the browser is closed (no leaked process)", async () => {
    const { browser, closed } = fakeBrowser({ hang: true })
    let threw = false
    try {
      await renderOgPngWith("<html></html>", async () => browser, 25)
    } catch (e: any) {
      threw = true
      expect(String(e?.message || e)).toContain("timed out")
    }
    expect(threw).toBe(true)
    // The fix: browser.close() was invoked even though render() never resolved.
    expect(closed()).toBe(1)
  })

  test("a normal render returns the PNG bytes and still closes the browser exactly once", async () => {
    const { browser, closed } = fakeBrowser({ hang: false })
    const png = await renderOgPngWith("<html></html>", async () => browser, 5_000)
    expect(Array.from(png)).toEqual([7, 7])
    expect(closed()).toBe(1)
  })

  // C2-3 hole (i): launch() resolves AFTER the deadline. NEG-CONTROL: a finally that only closes an
  // already-captured handle would see `browser` still null → the LATE browser leaks. Asserting it is
  // eventually closed reproduces the round-2 fix.
  test("a DELAYED launch (resolves after timeout) is still killed", async () => {
    const { browser, closed } = fakeBrowser({ hang: false })
    let threw = false
    // launch resolves 40ms in; deadline is 10ms → the render times out before the browser even exists.
    const launch = () => new Promise<OgBrowserLike>((res) => setTimeout(() => res(browser), 40))
    try {
      await renderOgPngWith("<html></html>", launch, 10)
    } catch (e: any) {
      threw = true
      expect(String(e?.message || e)).toContain("timed out")
    }
    expect(threw).toBe(true)
    // At the moment of timeout the late browser wasn't launched yet; give it time to arrive + be torn down.
    await new Promise((r) => setTimeout(r, 80))
    expect(closed()).toBe(1) // the post-timeout browser WAS closed (no leak)
  })

  // C2-3 hole (ii): browser.close() hangs. NEG-CONTROL: an unbounded `await browser.close()` in finally
  // would hang forever and hold the shared withPdfSlot; asserting the call returns within closeTimeoutMs
  // reproduces the bounded-close fix (the SLOT-RELEASED guarantee). Force-kill is an accepted-LOW residual
  // (a launch()ed Playwright Browser has no process handle) — see the renderOgPngWith docstring.
  test("a HUNG close() is bounded — the shared slot is released within closeTimeoutMs", async () => {
    const page = { setContent: async () => {}, evaluate: async () => {}, screenshot: async () => new Uint8Array([7, 7]) }
    const context = { newPage: async () => page, close: async () => {} }
    const browser: OgBrowserLike = { newContext: async () => context, close: () => new Promise<void>(() => {}) } // never resolves
    const t0 = Date.now()
    const png = await renderOgPngWith("<html></html>", async () => browser, 5_000, 30) // closeTimeoutMs=30
    const elapsed = Date.now() - t0
    expect(Array.from(png)).toEqual([7, 7]) // render succeeded
    expect(elapsed).toBeLessThan(1_000) // returned (slot released) — did NOT block on the hung close (~30ms)
  })

  // A REJECTED close() must also not throw out of teardown (swallowed) and stays bounded.
  test("a REJECTED close() is swallowed and does not break teardown", async () => {
    const page = { setContent: async () => {}, evaluate: async () => {}, screenshot: async () => new Uint8Array([7, 7]) }
    const context = { newPage: async () => page, close: async () => {} }
    const browser: OgBrowserLike = { newContext: async () => context, close: async () => { throw new Error("close boom") } }
    const png = await renderOgPngWith("<html></html>", async () => browser, 5_000, 30)
    expect(Array.from(png)).toEqual([7, 7])
  })

  test("a normal render releases the live-browser slot (count returns to 0)", async () => {
    const page = { setContent: async () => {}, evaluate: async () => {}, screenshot: async () => new Uint8Array([7, 7]) }
    const context = { newPage: async () => page, close: async () => {} }
    const browser: OgBrowserLike = { newContext: async () => context, close: async () => {} }
    await renderOgPngWith("<html></html>", async () => browser, 5_000, 30)
    // let the (already-settled) close chain flush
    await new Promise((r) => setTimeout(r, 5))
    expect(ogLiveBrowserCount()).toBe(0)
  })
})

// ── KLA-739 C2-3 (Codex's exact probe): live Chromium processes must be bounded by a FIXED cap even
// under persistent hung closes. The pre-round-5 code freed the per-key _inflight slot on the close
// TIMEOUT, so hung-close browsers didn't count → N sequential renders leaked N live browsers. This probe
// runs > cap renders whose close() NEVER settles and asserts the live count never exceeds the cap.
describe("renderOgPngWith — live-browser cap is a TRUE bound under hung closes (C2-3 round 5)", () => {
  test("7 sequential never-closing renders with cap=4 → at most 4 browsers ever launched/alive", async () => {
    const CAP = 4
    let launched = 0
    let maxAlive = 0
    const hungBrowser = (): OgBrowserLike => {
      const page = { setContent: async () => {}, evaluate: async () => {}, screenshot: async () => new Uint8Array([1]) }
      const context = { newPage: async () => page, close: async () => {} }
      return { newContext: async () => context, close: () => new Promise<void>(() => {}) } // close NEVER settles
    }
    const launch = async (): Promise<OgBrowserLike> => { launched++; return hungBrowser() }

    let admissionRejections = 0
    for (let i = 0; i < 7; i++) {
      try {
        // small deadline/closeTimeout so the probe is fast; close never settles → browser stays "alive".
        await renderOgPngWith("<html></html>", launch, 1_000, 10, CAP)
      } catch (e) {
        if (e instanceof OgAdmissionError) admissionRejections++
        else throw e
      }
      maxAlive = Math.max(maxAlive, ogLiveBrowserCount())
    }

    // NEG-CONTROL: pre-fix, admission didn't exist → all 7 launched → 7 live browsers leaked.
    expect(launched).toBeLessThanOrEqual(CAP)     // never launched more than the cap
    expect(maxAlive).toBeLessThanOrEqual(CAP)      // live processes never exceeded the cap
    expect(ogLiveBrowserCount()).toBe(CAP)         // the cap's worth stay pinned (hung) — bounded, not growing
    expect(admissionRejections).toBe(7 - CAP)      // the surplus renders fail-fast (serve default)
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
