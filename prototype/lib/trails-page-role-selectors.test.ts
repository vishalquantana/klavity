// PX4 "complete a action" AutoSim: the model wrote heading:has-text("Completed Actions") (matched 0 -> stall) and named an
// <input type=checkbox> "checkbox" / "1st check box ..." (rejected as a target mismatch 4 times). Real-browser test through the
// Puppeteer adapter (works under Bun on Windows); runs only when KLAV_E2E=1 like the other browser tests.
import { describe, test, expect, afterAll } from "bun:test"
import { acquireBrowser, type BrowserHandle } from "./trails-browser-page"

const RUN = !!process.env.KLAV_E2E
const HTML = `<!doctype html><html><body>
  <ul class="nav"><li><a href="/x">Completed Actions</a></li></ul>
  <h4 class="title">Completed Actions</h4>
  <table><thead><tr><th><input type="checkbox" id="select_all"></th><th>Action</th></tr></thead><tbody>
    <tr><td><input type="checkbox" class="checkbox" name="selected_actions[]" id="c1"></td><td>Action one</td></tr>
    <tr><td><input type="checkbox" class="checkbox" name="selected_actions[]" id="c2"></td><td>Action two</td></tr>
  </tbody></table>
  <button id="go">Save</button>
</body></html>`

let bh: BrowserHandle | null = null
async function open() {
  bh ??= await acquireBrowser({ headless: true })
  const page: any = await bh.newPage({ width: 1280, height: 720 })
  await page.goto("data:text/html," + encodeURIComponent(HTML), 15_000)
  return page
}
afterAll(async () => { await bh?.close().catch(() => {}) })

describe.skipIf(!RUN)("role words as selector bases (real browser)", () => {
  test("heading / link / button resolve to the single matching element", async () => {
    const page = await open()
    expect((await page.krefFor('heading:has-text("Completed Actions")')).count).toBe(1) // the h4, not the nav link
    expect((await page.krefFor('link:has-text("Completed Actions")')).count).toBe(1)    // the nav <a>
    expect((await page.krefFor('button:has-text("Save")')).count).toBe(1)
    expect((await page.krefFor('h4:has-text("Completed Actions")')).count).toBe(1)      // plain tags unchanged
  })
})

describe.skipIf(!RUN)("checkbox target check (real browser)", () => {
  test("accepts role phrases for a checkbox, still rejects wrong labels", async () => {
    const page = await open()
    for (const label of ["checkbox", "checkbox selected_actions[]", "1st check box on the pending actions page"]) {
      expect((await page.targetCheck("#c1", label)).ok).toBe(true)
    }
    expect((await page.targetCheck("#c1", "Save")).ok).toBe(false)
    expect((await page.targetCheck("#go", "check box")).ok).toBe(false) // a button is not a checkbox
  })

  test('"1st check box" is the first ROW checkbox, never the select-all header (a live run completed every action)', async () => {
    const page = await open()
    expect((await page.targetCheck("#c1", "1st check box on the pending actions page")).ok).toBe(true)
    expect((await page.targetCheck("#c2", "1st check box on the pending actions page")).ok).toBe(false)         // second row
    expect((await page.targetCheck("#select_all", "1st check box on the pending actions page")).ok).toBe(false) // header toggle
    expect((await page.targetCheck("#select_all", "checkbox")).ok).toBe(false)                                    // never, even without an ordinal
    expect((await page.targetCheck("#c2", "checkbox")).ok).toBe(true)                                              // any row box by role is fine
  })
})

describe.skipIf(!RUN)("fieldValue (real browser)", () => {
  test("reads a field's current value so an already-filled field is not typed again", async () => {
    const page = await open()
    await page.fill("#c1", "x", 2_000).catch(() => {})            // a checkbox ignores text; value stays its default
    await page.goto("data:text/html," + encodeURIComponent('<input id="e" value="a@b.co"><input id="p" type="password"><button id="b">x</button>'), 15_000)
    expect(await page.fieldValue("#e")).toBe("a@b.co")
    expect(await page.fieldValue("#p")).toBe("")                  // empty field -> "" (caller treats as 'not already filled')
    expect(await page.fieldValue("#b")).toBe("")                  // a <button> has a string .value too
    expect(await page.fieldValue("#missing")).toBeNull()
  })
})
