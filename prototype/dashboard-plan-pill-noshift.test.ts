// #742 — Sidebar "Free plan · Upgrade" pill must NOT cause a layout shift.
//
// The bug: #planPill started life with class `hide` (→ display:none), so it took up zero space
// until plan data loaded ~1s later. When it flipped visible it PUSHED every sidebar nav item
// down — a visible jump. The fix (reserve-space, keep-in-sidebar):
//   • Markup renders the pill default-visible with a sensible default ("Free plan · Upgrade") so
//     its row occupies space from the very first paint — no `hide` class.
//   • _wirePlan updates the text/state IN PLACE. For paid/unlimited accounts (where the pill
//     shouldn't show) it toggles `pill-reserved` — which is visibility:hidden, NOT display:none —
//     so the row keeps its height and the nav never reflows.
//   • A fixed min-height keeps every text state (Free / Snap) the same height.
//
// These are string/structure guards on the REAL shipped markup + CSS + wiring in dashboard.html.

import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

// Isolate the pill's markup (the <button id="planPill" ...>...</button>).
const pillTag = (HTML.match(/<button[^>]*id="planPill"[^>]*>[^<]*(?:<[^>]+>[^<]*)*<\/button>/) || [])[0]
expect(pillTag).toBeTruthy()

test("#742 pill renders default-visible: no `hide` class in the markup", () => {
  // The class attribute must be exactly the base class, never carrying `hide` (display:none),
  // which is what created the collapsed-then-expand jump.
  const cls = (pillTag.match(/class="([^"]*)"/) || [])[1] || ""
  expect(cls.split(/\s+/)).toContain("side-plan-pill")
  expect(cls.split(/\s+/)).not.toContain("hide")
})

test("#742 pill ships a sensible default label so the row is populated on first paint", () => {
  expect(pillTag).toContain("Free plan")
  expect(pillTag).toContain("<b>Upgrade</b>")
  // Upgrade click still opens the plan drawer.
  expect(pillTag).toContain("openPlanDrawer()")
})

test("#742 hidden state reserves space (visibility), never display:none", () => {
  // The reserve-space class must use visibility:hidden — display:none would reflow the nav.
  const reserveRule = (HTML.match(/\.side-plan-pill\.pill-reserved\{[^}]*\}/) || [])[0]
  expect(reserveRule).toBeTruthy()
  expect(reserveRule).toContain("visibility:hidden")
  expect(reserveRule).not.toContain("display:none")
})

test("#742 pill has a fixed min-height so Free/Snap text states are the same height", () => {
  const baseRule = (HTML.match(/\.side-plan-pill\{[^}]*\}/) || [])[0]
  expect(baseRule).toBeTruthy()
  expect(baseRule).toMatch(/min-height:\s*\d/)
  expect(baseRule).toContain("box-sizing:border-box")
})

test("#742 _wirePlan toggles the reserve-space class, not `hide` (display:none)", () => {
  // Pin the exact wiring line so a refactor can't reintroduce a reflow via display:none.
  const i = HTML.indexOf('var pill = $("planPill")')
  expect(i).toBeGreaterThan(-1)
  const block = HTML.slice(i, i + 600)
  expect(block).toContain('pill.classList.toggle("pill-reserved"')
  // It must NOT go back to toggling display:none via the `hide` class.
  expect(block).not.toContain('pill.classList.toggle("hide"')
  // Still updates text in place for the free vs snap-only copy.
  expect(block).toContain("Snap plan · <b>Upgrade</b>")
  expect(block).toContain("Free plan · <b>Upgrade</b>")
})
