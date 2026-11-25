// KD-2255: `select` on select2-style widgets used to throw "Element is not a <select> element".
import { test, expect, beforeAll, afterAll } from "bun:test"
import { chromium, type Browser, type Page } from "playwright"
import { selectOptionAnyWidget } from "./trails-click"
import { krefSnapshotBody, selectCheckBody, targetCheckBody } from "./trails-browser-page"

const FIXTURE = `<!doctype html><body>
  <select id="jurisdiction" style="display:none"><option value="">Select</option><option value="AK">Alaska</option></select>
  <span class="select2-container"><span role="combobox" aria-labelledby="select2-jurisdiction-container">
    <span id="select2-jurisdiction-container" role="textbox">Select</span></span></span>
  <select id="plain"><option>One</option><option>Two</option></select>
  <div id="custom" role="combobox" onclick="document.getElementById('lb').hidden=false">Pick</div>
  <ul id="lb" role="listbox" hidden><li role="option" onclick="document.getElementById('custom').textContent='Beta'">Beta</li></ul>
  <script>
    document.getElementById('jurisdiction').addEventListener('change', e =>
      document.getElementById('select2-jurisdiction-container').textContent = e.target.selectedOptions[0].text)
  </script>
</body>`

let browser: Browser, page: Page
beforeAll(async () => { browser = await chromium.launch(); page = await browser.newPage(); await page.setContent(FIXTURE) })
afterAll(async () => { await browser.close() })

test("select2 inner textbox and outer combobox both resolve the hidden <select>", async () => {
  await selectOptionAnyWidget(page.locator("#select2-jurisdiction-container"), "Alaska", 3000)
  expect(await page.locator("#jurisdiction").inputValue()).toBe("AK")
  expect(await page.locator("#select2-jurisdiction-container").textContent()).toBe("Alaska")
  await page.locator("#jurisdiction").selectOption("")
  await selectOptionAnyWidget(page.locator("[role=combobox][aria-labelledby]"), "Alaska", 3000)
  expect(await page.locator("#jurisdiction").inputValue()).toBe("AK")
})

test("plain <select> still works", async () => {
  await selectOptionAnyWidget(page.locator("#plain"), "Two", 3000)
  expect(await page.locator("#plain").inputValue()).toBe("Two")
})

test("custom listbox with no <select>: opens and clicks the option", async () => {
  await selectOptionAnyWidget(page.locator("#custom"), "Beta", 3000)
  expect(await page.locator("#custom").textContent()).toBe("Beta")
})

// Two select2 boxes that both read "Select": the snapshot must say which field each is, and the
// pre-select HTML check must reject an option that lives in the other field.
const s2 = (id: string, label: string, opts: string[]) => `<div><label>${label}</label>
  <select id="${id}" style="display:none"><option value="">Select</option>${opts.map((o, i) => `<option value="${i + 1}">${o}</option>`).join("")}</select>
  <span class="select2-container"><span role="combobox" aria-labelledby="select2-${id}-container"><span id="select2-${id}-container">Select</span></span></span></div>`

test("snapshot exposes field + options; selectCheck redirects to the right field", async () => {
  await page.setContent(s2("jurisdiction", "Jurisdiction", ["Alaska"]) + s2("mgmt", "Management Grouping", ["[KSG] test"]))
  const snap = await page.evaluate(krefSnapshotBody)
  const line = (f: string) => snap.split("\n").find((l) => l.includes(`{field: "${f}"}`))!
  expect(line("Jurisdiction")).toContain(`{options: "Select" | "Alaska"}`)
  const ref = line("Jurisdiction").match(/ref=(e\d+)/)![1]
  const chk = (v: string) => page.evaluate(selectCheckBody, { selector: `[data-kref="${ref}"]`, value: v })
  expect((await chk("Alaska")).ok).toBe(true)
  const bad = await chk("[KSG] test")
  expect(bad.ok).toBe(false)
  expect(bad.candidates).toEqual([`field "Management Grouping"`])
})

test("targetCheck: a field matches its unlinked sibling label, never a neighbour's", async () => {
  await page.setContent(`<div><label>Project Name</label><input name="project_name" id="pn"></div>
    <div><label>Two</label><input id="a"><input id="b"></div>`)
  const ok = (sel: string, label: string) => page.evaluate(targetCheckBody, { selector: sel, label }).then((r) => r.ok)
  expect(await ok("#pn", "Project Name")).toBe(true)
  expect(await ok("#pn", "project_name")).toBe(true)
  expect(await ok("#a", "Two")).toBe(false)
})
