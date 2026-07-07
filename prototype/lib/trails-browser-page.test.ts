// Adapter behavior test for the DEFAULT (Playwright) impl. Guards that the evaluate bodies extracted
// into trails-browser-page.ts (kref snapshot / fingerprint / stable selector) behave as before, and
// that selector-based click/fill/assert work against a real fixture. The Puppeteer-Steel impl is
// exercised by the live spike (needs network + key), not unit-tested here.
// acquirePlaywrightBrowser (used by the walker) is also tested here for its local/fallback path.
import { describe, test, expect, afterAll } from "bun:test"
import { acquireBrowser, acquirePlaywrightBrowser, startCdpScreencast, type BrowserHandle, type PlaywrightBrowserHandle } from "./trails-browser-page"

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

describe("PlaywrightPage adapter (default)", () => {
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
})

describe("acquirePlaywrightBrowser (walker seam)", () => {
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

  test("with invalid AUTOSIM_CDP_URL (no key) → connectOverCDP throws, not local launch", async () => {
    process.env.AUTOSIM_CDP_URL = "ws://127.0.0.1:19999/devtools/browser/nonexistent"
    delete process.env.STEEL_API_KEY
    let threw = false
    try { await acquirePlaywrightBrowser({ headless: true }) } catch { threw = true }
    expect(threw).toBe(true)
    delete process.env.AUTOSIM_CDP_URL
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
