// PX4 "complete a action" AutoSim: the model wrote heading:has-text("Completed Actions") (matched 0 -> stall) and named an
// <input type=checkbox> "checkbox" / "1st check box ..." (rejected as a target mismatch 4 times). Real-browser test through the
// Puppeteer adapter (works under Bun on Windows); runs only when KLAV_E2E=1 like the other browser tests.
import { describe, test, expect, afterAll } from "bun:test"
import { acquireBrowser, type BrowserHandle } from "./trails-browser-page"

const RUN = !!process.env.KLAV_E2E
const HTML = `<!doctype html><html><body>
  <div style="display:none"><input type="checkbox" id="hidden_modal_box"></div>
  <label><input type="checkbox" id="filter_box"> only mine</label>
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

describe.skipIf(!RUN)("fingerprint.allToggle (real browser)", () => {
  test("flags the select-all header checkbox, not row checkboxes or other inputs", async () => {
    const page = await open()
    expect((await page.fingerprint("#select_all")).allToggle).toBe(true)
    expect((await page.fingerprint("#c1")).allToggle).toBeUndefined()
    expect((await page.fingerprint("#c2")).allToggle).toBeUndefined()
    expect((await page.fingerprint("#go")).allToggle).toBeUndefined()
  })
})

describe.skipIf(!RUN)("isChecked (real browser)", () => {
  test("reports a checkbox's live state, null for non-checkboxes", async () => {
    const page = await open()
    expect(await page.isChecked("#c1")).toBe(false)
    await page.click("#c1", 3_000)
    expect(await page.isChecked("#c1")).toBe(true)
    await page.click("#c1", 3_000)
    expect(await page.isChecked("#c1")).toBe(false) // a second click un-selects: the author loop must NOT re-click only while it is true
    expect(await page.isChecked("#go")).toBeNull()
    expect(await page.isChecked("#missing")).toBeNull()
  })
})

// These fixtures use IDENTICAL link names on purpose: a link with a unique visible name now gets a role=link[name=…s] selector
// (covered in trails-semantic-selectors.test.ts), and page.count() here is plain CSS. Identical names leave only the positional path.
describe.skipIf(!RUN)("stableSelector last-resort path (real browser)", () => {
  // PX4 project list: bare links in repeated wrappers have no id/name/aria-label. The saved selector must match exactly ONE element.
  const LIST = `<!doctype html><html><body><div class="wrap">
    <section><div class="row"><div class="cell"><div class="name"><a href="/p/1">Open</a></div></div></div></section>
    <section><div class="row"><div class="cell"><div class="name"><a href="/p/2">Open</a></div></div></div></section>
    <section><div class="row"><div class="cell"><div class="name"><a href="/p/3">Open</a></div></div></div></section>
  </div></body></html>`
  test("a bare link in a repeated list gets a selector that resolves to exactly that link", async () => {
    const page = await open()
    await page.goto("data:text/html," + encodeURIComponent(LIST), 15_000)
    const first = await page.stableSelector("a[href='/p/1']")
    expect(first).not.toBeNull()
    expect(await page.count(first!)).toBe(1)
    expect(await page.fingerprint("a[href='/p/1']")).toBeTruthy()
    const third = await page.stableSelector("a[href='/p/3']")
    expect(await page.count(third!)).toBe(1)
    expect(third).not.toBe(first)
    // the fingerprint's own 4-level domPath is what used to be saved: it is NOT unique
    const dp = (await page.fingerprint("a[href='/p/1']")).domPath!
    expect(await page.count(dp)).toBeGreaterThan(1)
  })
  test("anchors on the nearest ancestor with a unique id", async () => {
    const page = await open()
    await page.goto("data:text/html," + encodeURIComponent('<div id="list"><div><span><a href="/x">go</a></span></div><div><span><a href="/y">go</a></span></div></div>'), 15_000)
    const s = await page.stableSelector("a[href='/y']")
    expect(s!.startsWith("body>")).toBe(false)
    expect(await page.count(s!)).toBe(1)
  })
  test("uses the shortest unique path, so a shifted body-level div does not break it (v15 Projects-nav drift)", async () => {
    const NAV = (extra: string) => `<!doctype html><html><body>${extra}<div><p>a</p></div><div><nav><ul><li><a href="/h">Open</a></li><li><a href="/p">Open</a></li></ul></nav></div><div><p>b</p></div></body></html>`
    const page = await open()
    await page.goto("data:text/html," + encodeURIComponent(NAV("")), 15_000)
    const s = await page.stableSelector("a[href='/p']")
    expect(s).not.toBeNull()
    expect(s!.startsWith("body>")).toBe(false)
    expect(await page.count(s!)).toBe(1)
    // replay page: an extra overlay div shifts every body-level nth-of-type; the saved selector must still resolve to the same link
    await page.goto("data:text/html," + encodeURIComponent(NAV("<div class='overlay'></div>")), 15_000)
    expect(await page.count(s!)).toBe(1)
  })
})
