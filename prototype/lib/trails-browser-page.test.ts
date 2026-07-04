// Adapter behavior test for the DEFAULT (Playwright) impl. Guards that the evaluate bodies extracted
// into trails-browser-page.ts (kref snapshot / fingerprint / stable selector) behave as before, and
// that selector-based click/fill/assert work against a real fixture. The Puppeteer-Steel impl is
// exercised by the live spike (needs network + key), not unit-tested here.
import { describe, test, expect, afterAll } from "bun:test"
import { acquireBrowser, type BrowserHandle } from "./trails-browser-page"

const FIXTURE = "data:text/html," + encodeURIComponent(`<!doctype html><html><body>
  <h1>Sign up</h1>
  <input id="email" aria-label="Email" placeholder="you@co.com" />
  <select id="plan"><option value="free">Free</option><option value="pro">Pro</option></select>
  <button id="go" data-testid="submit">Continue</button>
  <button data-testid="cancel">Cancel</button>
  <a id="tos" href="/tos">Terms</a>
</body></html>`)

let handle: BrowserHandle
afterAll(async () => { await handle?.close() })

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
