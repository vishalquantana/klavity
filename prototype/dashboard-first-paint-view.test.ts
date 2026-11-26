// KD-3158: refreshing Tickets (or any view) flashed the dashboard Overview first. The body starts as
// data-view="overview" and the boot routing that reads the #hash runs at the very END of the page, so the browser
// painted Overview until then. An early inline script now applies the URL's view right after <body> opens.
// Verified in Chromium: #tickets/#triage/#settings/#autosims and a /t/<id> permalink show the right view from the
// first frame (before: overview → view ~130–300ms later), and the sidebar, title and board are set up as before.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")
const bodyAt = html.indexOf('<body data-view="overview">')
const scriptStart = html.indexOf("<script>(function () {", bodyAt)
const early = html.slice(scriptStart, html.indexOf("</script>", scriptStart))

// Run the early script against a fake page: returns what the body ends up as.
function run(hash: string, opts: { meta?: boolean } = {}) {
  const attrs: Record<string, string> = { "data-view": "overview" }
  const classes = new Set<string>()
  const body = {
    setAttribute: (k: string, v: string) => { attrs[k] = v },
    classList: { add: (c: string) => classes.add(c) },
  }
  const document = { body, querySelector: (sel: string) => (opts.meta && sel.includes("klav-boot-ticket") ? {} : null) }
  const location = { hash }
  new Function("document", "location", early.replace("<script>", ""))(document, location)
  return { view: attrs["data-view"], preset: attrs["data-view-preset"] === "1", tktPage: classes.has("tkt-page-open") }
}

test("the early script sits right after <body> opens (before any content paints)", () => {
  expect(bodyAt).toBeGreaterThan(-1)
  expect(scriptStart - bodyAt).toBeLessThan(1500)
  expect(early).toContain("'tickets', 'triage'")
})

test("a #<view> hash starts on that view and marks it as a preset", () => {
  for (const v of ["tickets", "triage", "settings", "autosims", "sims", "team", "recurring", "snap", "guards", "pagebugs"]) {
    expect(run("#" + v)).toEqual({ view: v, preset: true, tktPage: false })
  }
  expect(run("#autosims?asp=1").view).toBe("autosims")
  expect(run("#triage/fb_1").view).toBe("triage")
})

test("ticket deep links start on the ticket page (not the board, not Overview)", () => {
  expect(run("#tickets/fb_123")).toEqual({ view: "tickets", preset: true, tktPage: true })
  expect(run("", { meta: true })).toEqual({ view: "tickets", preset: true, tktPage: true })   // /t/<id> permalink
  expect(run("#tickets").tktPage).toBe(false)                                                // plain board
})

test("no hash, #overview or an unknown hash leave the default Overview untouched", () => {
  for (const h of ["", "#overview", "#nope", "#"]) expect(run(h)).toEqual({ view: "overview", preset: false, tktPage: false })
})

test("setView clears the preset, and the ticket render does not mistake the preset for a set-up view", () => {
  expect(html).toContain("function setView(v) {\n                document.body.removeAttribute('data-view-preset');")
  const guard = '(document.body.getAttribute("data-view") !== "tickets" || document.body.hasAttribute("data-view-preset"))'
  expect(html.split(guard).length - 1).toBe(2)
})

// Follow-up: the CONTENT was right from the first paint, but the sidebar still highlighted "Overview" and the heading
// read "Dashboard" until the boot routing ran — which still looked like a trip through Overview.
test("right after the sidebar, a refreshed view moves the sidebar highlight to itself", () => {
  const asideEnd = html.indexOf("</aside>")
  const s = html.slice(asideEnd, html.indexOf("</script>", asideEnd))
  expect(s).toContain("if (!b.hasAttribute('data-view-preset')) return;")
  expect(s).toContain("n.classList.toggle('active', n.getAttribute('data-go') === v)")
  expect(asideEnd).toBeLessThan(html.indexOf('<h1 id="hello">'))
})

test("while the view is booting, the static 'Dashboard' heading is hidden (no wrong title flashes)", () => {
  expect(html).toMatch(/body\[data-view-preset\] #hello,\s*\n\s*body\[data-view-preset\] #lead \{\s*\n\s*visibility: hidden/)
})
