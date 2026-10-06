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
type Anc = { overflowY: string; top: number; bottom: number; overflowX?: string; left?: number; right?: number; head?: { bottom: number } }
function boundsWith(ancestors: Anc[], vh = 695, vw = 1000) {
  const chain: any[] = ancestors.map(a => ({ _a: a, parentElement: null,
    getBoundingClientRect: () => ({ top: a.top, bottom: a.bottom, left: a.left ?? 0, right: a.right ?? vw }),
    querySelector: (sel: string) => (sel === ":scope > .tkt-panel-head" && a.head ? { getBoundingClientRect: () => ({ bottom: a.head!.bottom }) } : null) }))
  const el: any = { parentElement: chain[0] || null }
  chain.forEach((c, i) => { c.parentElement = chain[i + 1] || null })
  const root = {}
  const fn = new Function("window", "document", "getComputedStyle", extractFn(HTML, "function visibleBoundsFor(") + "\nreturn visibleBoundsFor")(
    { innerHeight: vh, innerWidth: vw }, { documentElement: root }, (a: any) => ({ overflowY: a._a.overflowY, overflowX: a._a.overflowX || "visible" })) as (e: any) => { top: number; bottom: number; left: number; right: number }
  return fn(el)
}
test("visibleBoundsFor: with no clipping ancestors it is the viewport", () => {
  expect(boundsWith([])).toEqual({ top: 0, bottom: 695, left: 0, right: 1000 })
  expect(boundsWith([{ overflowY: "visible", top: 50, bottom: 400 }])).toEqual({ top: 0, bottom: 695, left: 0, right: 1000 })   // visible overflow doesn't clip
})
test("visibleBoundsFor: intersects the viewport with every auto/scroll/hidden/clip ancestor", () => {
  expect(boundsWith([{ overflowY: "auto", top: 0, bottom: 695 }])).toEqual({ top: 0, bottom: 695, left: 0, right: 1000 })       // the ticket panel
  expect(boundsWith([{ overflowY: "auto", top: 80, bottom: 600 }, { overflowY: "hidden", top: 40, bottom: 650 }])).toEqual({ top: 80, bottom: 600, left: 0, right: 1000 })
  expect(boundsWith([{ overflowY: "hidden", top: -20, bottom: 900 }])).toEqual({ top: 0, bottom: 695, left: 0, right: 1000 })   // taller than the viewport → viewport wins
})
test("visibleBoundsFor: horizontal clipping (overflow-x) narrows left/right — e.g. a side panel narrower than the screen", () => {
  expect(boundsWith([{ overflowY: "auto", overflowX: "hidden", top: 0, bottom: 695, left: 313, right: 753 }])).toEqual({ top: 0, bottom: 695, left: 313, right: 753 })
  expect(boundsWith([{ overflowY: "visible", overflowX: "hidden", top: 0, bottom: 100, left: -20, right: 2000 }])).toEqual({ top: 0, bottom: 695, left: 0, right: 1000 })   // wider than the viewport → viewport wins
})
test("visibleBoundsFor: the panel's sticky header is excluded from the top, so a popover opening upward never paints over Close / Full page", () => {
  expect(boundsWith([{ overflowY: "auto", top: 0, bottom: 695, head: { bottom: 58 } }])).toEqual({ top: 58, bottom: 695, left: 0, right: 1000 })
  expect(boundsWith([{ overflowY: "auto", top: 100, bottom: 695, head: { bottom: 58 } }]).top).toBe(100)    // the clip edge is already below the header
})

// ── horizontal placement (responsive) ─────────────────────────────────────────────────────────────────────────────────
const shift = new Function(extractFn(HTML, "function popoverHorizontalShift(") + "\nreturn popoverHorizontalShift")() as () => never as unknown as
  (l: number, r: number, bl: number, br: number, m?: number) => number
test("popoverHorizontalShift: no nudge when it fits; nudges left / right to keep an 8px margin", () => {
  expect(shift(100, 364, 0, 1000)).toBe(0)
  expect(shift(800, 1064, 0, 1000)).toBe(-72)       // 1064 → 992 (= 1000 - 8)
  expect(shift(-42, 220, 0, 320)).toBe(50)          // 320px phone: control half off-screen left → pull right to x=8
  expect(shift(-42, 220, 0, 320, 0)).toBe(42)       // custom margin
})
test("popoverHorizontalShift: wider than the visible area → pinned to the left margin (the caller narrows it)", () => {
  expect(shift(60, 400, 0, 300)).toBe(-52)          // 340px wide in 284px of room → left edge at 8
  expect(shift(300, 600, 0, 300)).toBe(-292)
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

test("responsive CSS: the ticket panel can no longer be wider than the screen; popover width/size/touch rules", () => {
  // min-width:440px used to beat max-width/width on phones → the panel (and its dropdowns) were pushed off the left edge
  expect(HTML).toContain("@media(max-width:640px){#ticketSingle.tkt-panel{width:100%;min-width:0;max-width:100%;padding:0 16px 32px}}")
  expect(HTML).toContain(".tkt-assignee-pop{max-width:min(300px,calc(100vw - 24px))}")
  expect(HTML).toContain("@media(max-width:640px){.tkt-assignee-pop .tap-search{font-size:16px}}")        // no iOS zoom-on-focus
  expect(HTML).toContain("@media(pointer:coarse){.tkt-assignee-pop .tap-opt,.tkt-assignee-pop .tap-invite{min-height:40px}}")
})

test("_positionAssigneePop also places horizontally (narrow + nudge) and resets left/width on close", () => {
  const fn = extractFn(HTML, "function _positionAssigneePop(")
  expect(fn).toContain('_aPop.style.left = ""; _aPop.style.width = ""')                 // measure from the CSS default each time
  expect(fn).toContain("popoverHorizontalShift(pr.left, pr.right, b.left, b.right, 8)")
  expect(fn).toContain("_aPop.style.width = Math.max(180, Math.floor(avail)) + \"px\"")   // never wider than the visible area
  expect(extractFn(HTML, "function _closeAssigneePop(")).toContain('_aPop.style.left = ""; _aPop.style.width = ""')
})
