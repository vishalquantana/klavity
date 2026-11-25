// Live-driver snapshot + HTML target cross-check on a PX4-like header (nav "Projects" link vs the
// header Add dropdown's "Project" item, both rendered as untyped divs with click handlers).
import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { chromium, type Browser, type Page } from "playwright"
import { krefSnapshotBody, targetCheckBody } from "./trails-browser-page"

const PX4 = `<!doctype html><html><body>
  <div class="header">
    <div class="logo">PX4</div>
    <div class="icon_wrapper" id="add" style="cursor:pointer"><span>Add</span></div>
    <div class="add_dropdown_menu" id="menu" style="display:none">
      <div class="add_dropdown_item" onclick="location.hash='new-project'">Project</div>
      <div class="add_dropdown_item" onclick="location.hash='new-resource'">Resource</div>
    </div>
  </div>
  <nav><a href="/index.php/Projects">Projects</a><a href="/index.php/Resources">Resources</a></nav>
  <form><input type="password" id="pw" value="S3cretValue!" aria-label="Password"></form>
  <script>document.getElementById('add').addEventListener('click',()=>{document.getElementById('menu').style.display='block'})</script>
</body></html>`

let browser: Browser, page: Page
beforeAll(async () => {
  browser = await chromium.launch()
  page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage()
  await page.setContent(PX4)
}, 60_000)
afterAll(async () => { await browser.close() })

const refOf = (snap: string, re: RegExp) => snap.split("\n").find((l) => re.test(l))?.match(/\[ref=(e\d+)\]/)?.[1]

describe("live krefSnapshotBody", () => {
  test("untyped Add control gets a ref; nav link carries an href hint", async () => {
    const snap = await page.evaluate(krefSnapshotBody)
    expect(refOf(snap, /"Add"/)).toBeDefined()
    expect(snap).toMatch(/link "Projects" \[ref=e\d+\] <a href=\/index\.php\/Projects>/)
    expect(snap).not.toContain("S3cretValue")
  })
  test("after opening Add, Project appears as a menuitem with its HTML class", async () => {
    let snap = await page.evaluate(krefSnapshotBody)
    await page.click(`[data-kref="${refOf(snap, /"Add"/)}"]`)
    snap = await page.evaluate(krefSnapshotBody)
    expect(snap).toMatch(/menuitem "Project" \[ref=e\d+\] <div\.add_dropdown_item>/)
  })
})

describe("targetCheckBody", () => {
  test("rejects nav 'Projects' when the target is 'Project' and lists the dropdown item", async () => {
    const snap = await page.evaluate(krefSnapshotBody)
    const navRef = refOf(snap, /link "Projects"/)!
    const r = await page.evaluate(targetCheckBody, { selector: `[data-kref="${navRef}"]`, label: "Project" })
    expect(r.ok).toBe(false)
    expect(r.html).toContain('href="/index.php/Projects"')
    expect(r.candidates.length).toBe(1)
    expect(r.candidates[0]).toContain("add_dropdown_item")
  })
  test("accepts an exact label match (case/whitespace-insensitive)", async () => {
    const r = await page.evaluate(targetCheckBody, { selector: ".add_dropdown_item", label: "  project " })
    expect(r.ok).toBe(true)
  })
  test("never echoes field values in the HTML description", async () => {
    const r = await page.evaluate(targetCheckBody, { selector: "#pw", label: "Project" })
    expect(r.ok).toBe(false)
    expect(r.html).not.toContain("S3cretValue")
    expect(JSON.stringify(r)).not.toContain("S3cretValue")
  })
})
