// Ticket-detail Assignee popover: it used to open BELOW the control no matter what, so in the sliding ticket panel its
// bottom rows ("Invite by email…") were cut off by the panel edge. It now flips above / caps its height to stay inside the
// visible area. The real placement helpers are extracted from public/dashboard.html.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const place = new Function(extractFn(HTML, "function popoverPlacement(") + "\nreturn popoverPlacement")() as () => never as unknown as
  (ctrlTop: number, ctrlBottom: number, bTop: number, bBottom: number, need: number, gap?: number, minH?: number) => { up: boolean; maxHeight: number | null }

test("opens BELOW when it fits (no cap)", () => {
  expect(place(100, 130, 0, 695, 247)).toEqual({ up: false, maxHeight: null })
})

test("the reported case: control at y≈447–477 in a 695px viewport, popover 247px → flips ABOVE and fits uncapped", () => {
  // below = 695-477-8 = 210 < 247; above = 447-0-8 = 439 → up
  expect(place(447, 477, 0, 695, 247)).toEqual({ up: true, maxHeight: null })
})

test("exact fit stays below; one pixel short flips up (when above has more room)", () => {
  // below room = boundsBottom - ctrlBottom - 8
  expect(place(300, 330, 0, 585, 247)).toEqual({ up: false, maxHeight: null })   // 585-330-8 = 247 → fits
  expect(place(300, 330, 0, 584, 247)).toEqual({ up: true, maxHeight: null })    // 246 < 247 and above (292) is larger
})

test("neither side fits → takes the larger side and caps the height (the popover scrolls inside)", () => {
  // below = 400-320-8 = 72, above = 290-0-8 = 282 → up, need 600 > 282 → capped to 282
  expect(place(290, 320, 0, 400, 600)).toEqual({ up: true, maxHeight: 282 })
  // below larger than above → stays down, capped to below room
  expect(place(40, 70, 0, 500, 900)).toEqual({ up: false, maxHeight: 422 })
})

test("never caps below a usable minimum height", () => {
  expect(place(30, 60, 0, 120, 247).maxHeight).toBe(140)          // both sides tiny → floor at 140
  expect(place(30, 60, 0, 120, 247, 8, 200).maxHeight).toBe(200)  // custom floor
})

test("a clipping ancestor's bounds (not just the viewport) decide the room: panel ends at 300 → flips up", () => {
  expect(place(200, 230, 0, 300, 150)).toEqual({ up: true, maxHeight: null })   // below = 62, above = 192 ≥ 150 → up, fits
  expect(place(200, 230, 0, 300, 247)).toEqual({ up: true, maxHeight: 192 })    // taller than the 192px above → capped to it
})

test("ties go below (up only when there is MORE room above)", () => {
  // below = 200, above = 200, need 300 → not up; capped to 200
  expect(place(208, 292, 0, 500, 300)).toEqual({ up: false, maxHeight: 200 })
})

// ── visibleBoundsFor: viewport ∩ every scrolling/clipping ancestor ────────────────────────────────────────────────
function boundsWith(ancestors: { overflowY: string; top: number; bottom: number }[], vh = 695) {
  const chain: any[] = ancestors.map(a => ({ _a: a, parentElement: null, getBoundingClientRect: () => ({ top: a.top, bottom: a.bottom }) }))
  const el: any = { parentElement: chain[0] || null }
  chain.forEach((c, i) => { c.parentElement = chain[i + 1] || null })
  const root = {}
  const fn = new Function("window", "document", "getComputedStyle", extractFn(HTML, "function visibleBoundsFor(") + "\nreturn visibleBoundsFor")(
    { innerHeight: vh }, { documentElement: root }, (a: any) => ({ overflowY: a._a.overflowY })) as (e: any) => { top: number; bottom: number }
  return fn(el)
}
test("visibleBoundsFor: with no clipping ancestors it is the viewport", () => {
  expect(boundsWith([])).toEqual({ top: 0, bottom: 695 })
  expect(boundsWith([{ overflowY: "visible", top: 50, bottom: 400 }])).toEqual({ top: 0, bottom: 695 })   // visible overflow doesn't clip
})
test("visibleBoundsFor: intersects the viewport with every auto/scroll/hidden/clip ancestor", () => {
  expect(boundsWith([{ overflowY: "auto", top: 0, bottom: 695 }])).toEqual({ top: 0, bottom: 695 })       // the ticket panel
  expect(boundsWith([{ overflowY: "auto", top: 80, bottom: 600 }, { overflowY: "hidden", top: 40, bottom: 650 }])).toEqual({ top: 80, bottom: 600 })
  expect(boundsWith([{ overflowY: "hidden", top: -20, bottom: 900 }])).toEqual({ top: 0, bottom: 695 })   // taller than the viewport → viewport wins
})

// ── wiring pins (needs the real page) ─────────────────────────────────────────────────────────────────────────────
test("CSS: the popover scrolls when height-capped and has an upward variant anchored above the control", () => {
  expect(HTML).toContain(".tkt-assignee-pop{overflow-y:auto;overscroll-behavior:contain}")
  expect(HTML).toContain(".tkt-assignee-pop.up{top:auto;bottom:calc(100% + 4px)}")
})

test("wiring: positioned on open, on search, on invite-row reveal, and on scroll/resize while open; cleaned up on close", () => {
  const open = extractFn(HTML, "function _openAssigneePop(")
  expect(open).toContain("_positionAssigneePop()")
  expect(open).toContain('window.addEventListener("resize", _positionAssigneePop)')
  expect(open).toContain('document.addEventListener("scroll", _positionAssigneePop, true)')   // capture: catches the panel's scroll
  expect(open).toContain("focus({ preventScroll: true })")                                      // focusing the search must not scroll the panel
  const close = extractFn(HTML, "function _closeAssigneePop(")
  expect(close).toContain('window.removeEventListener("resize", _positionAssigneePop)')
  expect(close).toContain('document.removeEventListener("scroll", _positionAssigneePop, true)')
  expect(close).toContain('_aPop.classList.remove("up"); _aPop.style.maxHeight = ""')           // reset so the next open measures fresh
  expect(HTML).toMatch(/_renderAssigneeMembers\(_aSearch\.value\)\n\s+_positionAssigneePop\(\)/)             // list height changes with the filter
  expect(HTML).toMatch(/_aInviteRow\.classList\.remove\("hide"\)\n\s+_positionAssigneePop\(\)/)               // invite row adds height
})

test("_positionAssigneePop measures the natural height, uses the visible bounds, and ignores a closed popover", () => {
  const fn = extractFn(HTML, "function _positionAssigneePop(")
  expect(fn).toContain('_aPop.classList.contains("hide")')
  expect(fn).toContain('_aPop.classList.remove("up"); _aPop.style.maxHeight = ""')   // measure unconstrained
  expect(fn).toContain("visibleBoundsFor(_assigneeCtrlBtn)")
  expect(fn).toContain("popoverPlacement(cr.top, cr.bottom, b.top, b.bottom, _aPop.scrollHeight)")
})
