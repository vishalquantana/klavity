import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// KD-239 (follow-up): commenting on a ticket, the page sometimes jumped to the top and the half-typed comment
// vanished. openSingleTicket() renders from cache, then re-renders when GET /api/feedback/:id returns — 2–3s later
// on the hosted DB, by which time the user has often scrolled down and started typing. That second render rebuilt
// the detail (comment box included) and ended with scrollTo(0,0) / single.scrollTop = 0.
const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")
const slice = (from: string, len: number) => {
  const i = html.indexOf(from)
  expect(i).toBeGreaterThan(-1)
  return html.slice(i, i + len)
}

test("the cache→fresh re-render keeps the user's place instead of rebuilding from the top", () => {
  const open = slice("    async function openSingleTicket(id, mode) {", 4000)
  const rerender = open.slice(open.indexOf("const single = $(\"ticketSingle\")"))
  expect(rerender).toContain("const keep = captureTktDetailState(single)")
  expect(rerender).toContain("if (keep.busy) return")
  expect(rerender).toContain("_renderSingleTicket(id, { keepScroll: true })")
  expect(rerender).toContain("restoreTktDetailState(single, keep)")
  // capture happens before the rebuild, restore after it
  expect(rerender.indexOf("captureTktDetailState")).toBeLessThan(rerender.indexOf("_renderSingleTicket(id, { keepScroll: true })"))
  expect(rerender.indexOf("_renderSingleTicket(id, { keepScroll: true })")).toBeLessThan(rerender.indexOf("restoreTktDetailState(single, keep)"))
})

test("a first open still scrolls to the top; only a keepScroll re-render skips it", () => {
  const render = slice("    function _renderSingleTicket(id, opts) {", 30000)
  const tail = render.slice(render.indexOf("// Panel scrolls itself to top"))
  expect(tail).toContain("if (!(opts && opts.keepScroll)) {")
  expect(tail.indexOf("if (!(opts && opts.keepScroll)) {")).toBeLessThan(tail.indexOf("window.scrollTo(0, 0)"))
})

test("capture records scroll, tab, comment text/caret and flags edits a rebuild can't restore", () => {
  const cap = slice("    function captureTktDetailState(single) {", 1600)
  for (const k of ["winY:", "panelY:", "tab:", "text:", "focused:", "selStart:", "selEnd:", "busy:"]) expect(cap).toContain(k)
  expect(cap).toContain("(isField && ae !== ta)")   // editing another field → skip the re-render
  expect(cap).toContain(".tkt-cmt-chips")           // queued comment attachments → skip the re-render
})

test("restore puts the comment back, refocuses without scrolling, and re-applies scroll as content loads", () => {
  const res = slice("    function restoreTktDetailState(single, keep) {", 2200)
  expect(res).toContain("ta.value = keep.text")
  expect(res).toContain("ta.focus({ preventScroll: true })")
  expect(res).toContain("ta.setSelectionRange(keep.selStart, keep.selEnd)")
  expect(res).toContain("[50, 150, 400, 800, 1500]")
  expect(res).toContain("if (Math.abs(now - last) > 2") // stops once the user scrolls themselves
})
