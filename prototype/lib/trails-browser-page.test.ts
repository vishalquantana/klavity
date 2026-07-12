// Adapter behavior test for the DEFAULT (Playwright) impl. Guards that the evaluate bodies extracted
// into trails-browser-page.ts (kref snapshot / fingerprint / stable selector) behave as before, and
// that selector-based click/fill/assert work against a real fixture. The Puppeteer-Steel impl is
// exercised by the live spike (needs network + key), not unit-tested here.
// acquirePlaywrightBrowser (used by the walker) is also tested here for its local/fallback path.
import { describe, test, expect, afterAll } from "bun:test"
import { acquireBrowser, acquirePlaywrightBrowser, createSteelSession, launchLocalChromium, BrowserLaunchError, playwrightContextOptionsForTrailViewport, startCdpScreencast, safeClose, type BrowserHandle, type PlaywrightBrowserHandle } from "./trails-browser-page"

// Real-browser tests only run when KLAV_E2E=1 (browsers installed). CI default suite is hermetic.
const RUN_BROWSER = !!process.env.KLAV_E2E

const FIXTURE = "data:text/html," + encodeURIComponent(`<!doctype html><html><body>
  <h1>Sign up</h1>
  <input id="email" aria-label="Email" placeholder="you@co.com" />
  <select id="plan"><option value="free">Free</option><option value="pro">Pro</option></select>
  <button id="go" data-testid="submit">Continue</button>
  <button data-testid="cancel">Cancel</button>
  <a id="tos" href="/tos">Terms</a>
</body></html>`)

let handle: BrowserHandle
let pwHandle: PlaywrightBrowserHandle
afterAll(async () => {
  await handle?.close()
  await pwHandle?.close()
})

describe.if(RUN_BROWSER)("PlaywrightPage adapter (default)", () => {
  test("acquireBrowser() with no AUTOSIM_CDP_URL → local Playwright handle", async () => {
    delete process.env.AUTOSIM_CDP_URL
    handle = await acquireBrowser({ headless: true })
    expect(handle.kind).toBe("local")
  })

  test("krefSnapshot stamps refs on interactive elements", async () => {
    const page = await handle.newPage()
    await page.goto(FIXTURE, 20_000)
    const snap = await page.krefSnapshot()
    expect(snap).toContain('textbox "Email" [ref=e')
    expect(snap).toContain('button "Continue" [ref=e')
    expect(snap).toContain('link "Terms" [ref=e')
    // heading has a role but is NOT interactive → labelled but no ref
    expect(snap).toContain('heading "Sign up"')
  })

  test("count / stableSelector / fingerprint", async () => {
    const page = await handle.newPage()
    await page.goto(FIXTURE, 20_000)
    expect(await page.count("#email")).toBe(1)
    expect(await page.count("#missing")).toBe(0)
    expect(await page.stableSelector("#email")).toBe("#email")                       // id wins
    expect(await page.stableSelector("#go")).toBe("#go")                             // id beats testid
    expect(await page.stableSelector('[data-testid="cancel"]')).toBe('[data-testid="cancel"]') // testid when no id
    const fp = await page.fingerprint("#email")
    expect(fp.testId).toBeUndefined()
    expect(fp.accessibleName).toBe("Email")
    expect(fp.domPath).toContain("input")
  })

  test("fill replaces value; selectOption; click; assertVisible", async () => {
    const page = await handle.newPage()
    await page.goto(FIXTURE, 20_000)
    await page.fill("#email", "vishal@quantana.com.au", 10_000)
    await page.selectOption("#plan", "pro", 10_000)
    await page.assertVisible("#go", 10_000)
    await page.click("#go", 10_000)
    // page still alive + selectors resolve after the interactions
    expect(await page.count("#email")).toBe(1)
    expect(await page.count("#plan")).toBe(1)
  })

  test("newPage applies a requested Trail viewport", async () => {
    const page = await handle.newPage({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 })
    await page.goto(FIXTURE, 20_000)
    expect(await page.count("#email")).toBe(1)
    expect(playwrightContextOptionsForTrailViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 })).toEqual({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    })
  })
})

describe.if(RUN_BROWSER)("acquirePlaywrightBrowser (walker seam)", () => {
  test("no AUTOSIM_CDP_URL → local kind, native Playwright Browser", async () => {
    delete process.env.AUTOSIM_CDP_URL
    delete process.env.STEEL_API_KEY
    pwHandle = await acquirePlaywrightBrowser({ headless: true })
    expect(pwHandle.kind).toBe("local")
    // Verify it is a real Playwright Browser with newPage() / newContext()
    expect(typeof pwHandle.browser.newPage).toBe("function")
    expect(typeof pwHandle.browser.newContext).toBe("function")
  })

  test("local Playwright Browser can navigate and evaluate DOM", async () => {
    const page = await pwHandle.browser.newPage()
    await page.goto(FIXTURE, { timeout: 20_000 })
    const title = await page.evaluate(() => document.querySelector("h1")?.textContent)
    expect(title).toBe("Sign up")
    const emailCount = await page.locator("#email").count()
    expect(emailCount).toBe(1)
    await page.close()
  })

  test("with invalid AUTOSIM_CDP_URL (no key) → dead remote, falls back to a LOCAL browser", async () => {
    // KLA-278: an unreachable remote endpoint must NOT become a missed guard — it falls back to local.
    process.env.AUTOSIM_CDP_URL = "ws://127.0.0.1:19999/devtools/browser/nonexistent"
    delete process.env.STEEL_API_KEY
    delete process.env.AUTOSIM_CDP_NO_FALLBACK
    const h = await acquirePlaywrightBrowser({ headless: true })
    try {
      expect(h.kind).toBe("local-fallback")
      expect(typeof h.browser.newPage).toBe("function")
    } finally {
      await h.close()
      delete process.env.AUTOSIM_CDP_URL
    }
  })

  test("with invalid AUTOSIM_CDP_URL + AUTOSIM_CDP_NO_FALLBACK=1 → throws, no local fallback", async () => {
    process.env.AUTOSIM_CDP_URL = "ws://127.0.0.1:19999/devtools/browser/nonexistent"
    process.env.AUTOSIM_CDP_NO_FALLBACK = "1"
    delete process.env.STEEL_API_KEY
    let threw = false
    try { await acquirePlaywrightBrowser({ headless: true }) } catch { threw = true }
    expect(threw).toBe(true)
    delete process.env.AUTOSIM_CDP_URL
    delete process.env.AUTOSIM_CDP_NO_FALLBACK
  })
})

// ── acquirePlaywrightBrowser: health-check + remote→local fallback (hermetic, injected deps) ─────────
// KLA-278: the scheduled/CI walk seam must run remote when AUTOSIM_CDP_URL is set, but a DEAD remote
// endpoint must fall back to a LOCAL browser (not a missed guard). These tests inject fake
// remote-acquire / local-open impls so the routing + fallback logic is proven WITHOUT a real browser.
describe("acquirePlaywrightBrowser routing + fallback (hermetic)", () => {
  const origCdp = process.env.AUTOSIM_CDP_URL
  const origNoFallback = process.env.AUTOSIM_CDP_NO_FALLBACK
  const fakeHandle = (kind: string): PlaywrightBrowserHandle =>
    ({ browser: {} as any, close: async () => {}, kind })

  afterAll(() => {
    if (origCdp === undefined) delete process.env.AUTOSIM_CDP_URL; else process.env.AUTOSIM_CDP_URL = origCdp
    if (origNoFallback === undefined) delete process.env.AUTOSIM_CDP_NO_FALLBACK; else process.env.AUTOSIM_CDP_NO_FALLBACK = origNoFallback
  })

  test("AUTOSIM_CDP_URL unset → opens LOCAL, never touches remote (byte-for-byte default)", async () => {
    delete process.env.AUTOSIM_CDP_URL
    delete process.env.AUTOSIM_CDP_NO_FALLBACK
    let remoteCalls = 0
    const kinds: string[] = []
    const h = await acquirePlaywrightBrowser({}, {
      acquireRemote: async () => { remoteCalls++; return fakeHandle("steel:iad") },
      openLocal: async (_o, kind) => { kinds.push(kind); return fakeHandle(kind) },
    })
    expect(remoteCalls).toBe(0)     // remote path never invoked when unset
    expect(kinds).toEqual(["local"])
    expect(h.kind).toBe("local")
  })

  test("AUTOSIM_CDP_URL set + remote healthy → uses REMOTE, no local fallback", async () => {
    process.env.AUTOSIM_CDP_URL = "wss://connect.steel.dev"
    delete process.env.AUTOSIM_CDP_NO_FALLBACK
    let localCalls = 0
    const h = await acquirePlaywrightBrowser({}, {
      acquireRemote: async () => fakeHandle("steel:iad"),
      openLocal: async (_o, kind) => { localCalls++; return fakeHandle(kind) },
    })
    expect(h.kind).toBe("steel:iad")
    expect(localCalls).toBe(0)      // healthy remote → no fallback
  })

  test("AUTOSIM_CDP_URL set + remote DEAD → falls back to LOCAL, kind=local-fallback", async () => {
    process.env.AUTOSIM_CDP_URL = "wss://connect.steel.dev"
    delete process.env.AUTOSIM_CDP_NO_FALLBACK
    const kinds: string[] = []
    const h = await acquirePlaywrightBrowser({}, {
      acquireRemote: async () => { throw new BrowserLaunchError("Steel session create failed (503)") },
      openLocal: async (_o, kind) => { kinds.push(kind); return fakeHandle(kind) },
    })
    expect(kinds).toEqual(["local-fallback"])  // fell back to local
    expect(h.kind).toBe("local-fallback")      // visible on the handle → surfaced in walk evidence
  })

  test("AUTOSIM_CDP_URL set + remote DEAD + AUTOSIM_CDP_NO_FALLBACK=1 → propagates the error", async () => {
    process.env.AUTOSIM_CDP_URL = "wss://connect.steel.dev"
    process.env.AUTOSIM_CDP_NO_FALLBACK = "1"
    let localCalls = 0
    let err: unknown
    try {
      await acquirePlaywrightBrowser({}, {
        acquireRemote: async () => { throw new BrowserLaunchError("unreachable") },
        openLocal: async (_o, kind) => { localCalls++; return fakeHandle(kind) },
      })
    } catch (e) { err = e }
    expect(err).toBeInstanceOf(BrowserLaunchError)
    expect(localCalls).toBe(0)      // strict remote-only → NO local fallback
  })
})

// ── launchLocalChromium: headless-shell → full-chromium fallback + actionable error (hermetic) ──
// These use a fake `chromium` so they run WITHOUT a real browser (the instant-RED prod bug is a
// launch failure — we must be able to reproduce the failure classification without Chromium).
describe("launchLocalChromium fallback + BrowserLaunchError", () => {
  test("first launch succeeds → returns that browser, no fallback", async () => {
    let calls = 0
    const fakeBrowser = { id: "b1" } as any
    const chromium = {
      async launch() { calls++; return fakeBrowser },
      executablePath() { return "/nope" },
    } as any
    const b = await launchLocalChromium(chromium, { headless: true })
    expect(b).toBe(fakeBrowser)
    expect(calls).toBe(1)
  })

  test("first launch fails (headless-shell missing) → retries with executablePath and succeeds", async () => {
    let calls = 0
    const fakeBrowser = { id: "b2" } as any
    const chromium = {
      async launch(o: any) {
        calls++
        if (!o?.executablePath) throw new Error("Executable doesn't exist: chrome-headless-shell")
        return fakeBrowser
      },
      executablePath() { return "/full/chromium" },
    } as any
    const b = await launchLocalChromium(chromium, { headless: true })
    expect(b).toBe(fakeBrowser)
    expect(calls).toBe(2)
  })

  test("both launches fail → BrowserLaunchError with actionable message (install / AUTOSIM_CDP_URL)", async () => {
    const chromium = {
      async launch() { throw new Error("spawn ENOMEM") },
      executablePath() { return "/full/chromium" },
    } as any
    let err: unknown
    try { await launchLocalChromium(chromium, { headless: true }) } catch (e) { err = e }
    expect(err).toBeInstanceOf(BrowserLaunchError)
    const msg = String((err as Error).message)
    expect(msg).toContain("Could not start a local browser")
    expect(msg).toContain("playwright install chromium")
    expect(msg).toContain("AUTOSIM_CDP_URL")
  })
})

test("startCdpScreencast starts, ACKs frames, publishes data URLs, and stops cleanly", async () => {
  const sent: Array<{ method: string; payload?: any }> = []
  const handlers: Record<string, (ev: any) => void> = {}
  const session = {
    on(event: string, fn: (ev: any) => void) { handlers[event] = fn },
    off(event: string) { delete handlers[event] },
    async send(method: string, payload?: any) { sent.push({ method, payload }) },
    async detach() { sent.push({ method: "detach" }) },
  }
  const fakePage = {
    context() {
      return { async newCDPSession() { return session } }
    },
  }
  const frames: any[] = []

  const stop = await startCdpScreencast(fakePage as any, (frame) => frames.push(frame), {
    quality: 30,
    maxWidth: 640,
    maxHeight: 360,
    everyNthFrame: 3,
  })
  handlers["Page.screencastFrame"]({ data: "abc", sessionId: 42, metadata: { timestamp: 1 } })
  await stop()

  expect(sent.some((s) => s.method === "Page.enable")).toBe(true)
  expect(sent).toContainEqual({
    method: "Page.startScreencast",
    payload: { format: "jpeg", quality: 30, maxWidth: 640, maxHeight: 360, everyNthFrame: 3 },
  })
  expect(sent).toContainEqual({ method: "Page.screencastFrameAck", payload: { sessionId: 42 } })
  expect(sent.some((s) => s.method === "Page.stopScreencast")).toBe(true)
  expect(frames[0].dataUrl).toBe("data:image/jpeg;base64,abc")
})

// ── Cleanup safety tests (no real browser needed) ──────────────────────────────────────────────────

test("safeClose: resolves within timeout even if the wrapped promise never settles", async () => {
  const hung = new Promise<void>(() => {}) // intentionally never resolves
  const t0 = Date.now()
  await safeClose(hung, 50) // 50ms for test speed
  expect(Date.now() - t0).toBeLessThan(500)
}, 2000)

test("safeClose: resolves immediately when the wrapped promise resolves normally", async () => {
  const t0 = Date.now()
  await safeClose(Promise.resolve(), 5_000)
  expect(Date.now() - t0).toBeLessThan(200)
})

test("safeClose: resolves without throwing even if the wrapped promise rejects", async () => {
  await safeClose(Promise.reject(new Error("close error")), 5_000)
  // no throw — close errors are silenced, caller just proceeds
})

// ── createSteelSession: region + websocketUrl handling (hermetic, mocked fetch) ────────────────────
describe("createSteelSession", () => {
  const realFetch = globalThis.fetch
  const origRegion = process.env.STEEL_REGION
  const origApiUrl = process.env.STEEL_API_URL

  function mockCreate(sessionBody: Record<string, unknown>, captured?: { body?: string }) {
    globalThis.fetch = (async (url: string, opts?: any) => {
      if (typeof url === "string" && url.includes("/v1/sessions") && opts?.method === "POST" && !url.includes("/release")) {
        if (captured) captured.body = opts?.body
        return { ok: true, json: async () => sessionBody } as any
      }
      if (typeof url === "string" && url.includes("/release")) return { ok: true } as any
      return realFetch(url as any, opts as any)
    }) as typeof fetch
  }

  afterAll(() => {
    globalThis.fetch = realFetch
    if (origRegion === undefined) delete process.env.STEEL_REGION; else process.env.STEEL_REGION = origRegion
    if (origApiUrl === undefined) delete process.env.STEEL_API_URL; else process.env.STEEL_API_URL = origApiUrl
  })

  test("prefers API-provided websocketUrl (region-correct) and appends apiKey", async () => {
    delete process.env.STEEL_REGION
    mockCreate({ id: "s1", region: "lax", websocketUrl: "wss://lax.connect.steel.dev/session/s1" })
    const s = await createSteelSession("wss://connect.steel.dev", "KEY123")
    expect(s.id).toBe("s1")
    expect(s.region).toBe("lax")
    expect(s.connectUrl).toBe("wss://lax.connect.steel.dev/session/s1?apiKey=KEY123")
    globalThis.fetch = realFetch
  })

  test("falls back to assembled cdpBase?apiKey&sessionId when websocketUrl absent", async () => {
    delete process.env.STEEL_REGION
    mockCreate({ id: "s2", region: "iad" })
    const s = await createSteelSession("wss://connect.steel.dev", "KEY123")
    expect(s.connectUrl).toBe("wss://connect.steel.dev?apiKey=KEY123&sessionId=s2")
    expect(s.region).toBe("iad")
    globalThis.fetch = realFetch
  })

  test("sends STEEL_REGION in the create body", async () => {
    process.env.STEEL_REGION = "lax"
    const captured: { body?: string } = {}
    mockCreate({ id: "s3", region: "lax" }, captured)
    await createSteelSession("wss://connect.steel.dev", "KEY123")
    expect(captured.body).toContain("lax")
    expect(JSON.parse(captured.body!)).toEqual({ region: "lax" })
    globalThis.fetch = realFetch
    delete process.env.STEEL_REGION
  })

  test("throws BrowserLaunchError on non-ok session create", async () => {
    delete process.env.STEEL_REGION
    globalThis.fetch = (async () => ({ ok: false, status: 401, statusText: "Unauthorized", text: async () => "bad key" })) as any
    let err: unknown
    try { await createSteelSession("wss://connect.steel.dev", "BADKEY") } catch (e) { err = e }
    expect(err).toBeInstanceOf(BrowserLaunchError)
    expect(String((err as Error).message)).toContain("Steel session create failed")
    globalThis.fetch = realFetch
  })
})

test("acquireBrowser Steel path: releases session when connectOverCDP fails", async () => {
  let released = false
  const realFetch = globalThis.fetch
  globalThis.fetch = (async (url: string, opts?: any) => {
    if (typeof url === "string" && url.includes("/v1/sessions") && opts?.method === "POST" && !url.includes("/release")) {
      return { ok: true, json: async () => ({ id: "sess_leak_test", region: "us-test" }) } as any
    }
    if (typeof url === "string" && url.includes("/v1/sessions/sess_leak_test/release")) {
      released = true
      return { ok: true } as any
    }
    return realFetch(url as any, opts as any)
  }) as typeof fetch

  process.env.AUTOSIM_CDP_URL = "wss://127.0.0.1:1/nonexistent" // unreachable
  process.env.STEEL_API_KEY = "test-key-kla62"
  try {
    await acquireBrowser()
  } catch {
    // expected — connect to port 1 will fail
  } finally {
    globalThis.fetch = realFetch
    delete process.env.AUTOSIM_CDP_URL
    delete process.env.STEEL_API_KEY
  }
  expect(released).toBe(true)
}, 10_000)
