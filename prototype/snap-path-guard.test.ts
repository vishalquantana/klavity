// Regression guard for the Snap path being first-class (KLAVITYKLA-293).
//
// Before this fix the Snap option was collapsed behind a "More ways to set up"
// toggle in onboarding, the dashboard had no Snap nav entry, and the first-run
// checklist started with Sims not widget install.  This test pins the key
// surface-level markers that were changed so a future stale-base merge can't
// silently revert them.

import { test, expect } from "bun:test"

const ONBOARDING = await Bun.file(import.meta.dir + "/../site/onboarding.html").text()
const DASHBOARD  = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

// ── Onboarding: Snap must be a first-class goal choice (not hidden) ────────────
// KLA-719: onboarding.html was redesigned from the old "More ways to set up" collapse
// (mw-toggle / mwBody / goaltile) into a stepped wizard. The KLA-293 INTENT is unchanged
// and re-pinned against the new wizard's markers: Snap is a top-level goal/fork choice,
// offered alongside Sims, and NOT collapsed behind a toggle.
test("onboarding: Snap is a top-level goal choice (not collapsed behind a toggle)", () => {
  // Snap is a first-class goal in the wizard's goal step…
  expect(ONBOARDING).toContain('data-goal="snap"')
  // …and the old show/hide collapse toggle is gone entirely.
  expect(ONBOARDING).not.toContain(".more-ways .mw-toggle")
})

test("onboarding: Snap fork is offered directly on the goal step", () => {
  // The Snap path is a direct fork the user can pick at load — no expand-to-reveal step.
  expect(ONBOARDING).toContain('data-fork="snap"')
})

test("onboarding: Snap goal tile is present and visible", () => {
  // The Snap tile's label is directly present in the markup.
  expect(ONBOARDING).toContain("Snap — a one-click bug button, free forever")
})

test("onboarding: goal step offers both Snap and Sims paths", () => {
  // Both forks are offered so Snap is not buried beneath a Sims-only hero.
  expect(ONBOARDING).toContain('data-fork="snap"')
  expect(ONBOARDING).toContain('data-fork="sims"')
})

// ── Dashboard: Snap nav entry must exist in the sidebar ───────────────────────
test("dashboard: Snap nav entry exists in sidebar", () => {
  expect(DASHBOARD).toContain('data-go="snap"')
})

test("dashboard: 'snap' is registered in the VIEWS array", () => {
  expect(DASHBOARD).toMatch(/VIEWS\s*=\s*\[.*'snap'.*\]/)
})

test("dashboard: body[data-view='snap'] CSS rule hides non-snap content", () => {
  expect(DASHBOARD).toContain('body[data-view="snap"] [data-view]:not([data-view~="snap"])')
})

test("dashboard: Snap nav-bar shortcut button exists", () => {
  expect(DASHBOARD).toContain('class="nav-snap mi"')
  expect(DASHBOARD).toContain("Report widget")
})

test("dashboard: Snap view panel exists with embed snippet element", () => {
  expect(DASHBOARD).toContain('data-view="snap"')
  expect(DASHBOARD).toContain('id="snapViewSnippet"')
  expect(DASHBOARD).toContain('id="snapViewCopy"')
  expect(DASHBOARD).toContain('id="snapViewDetect"')
})

test("dashboard: renderSnapView is wired into setView", () => {
  expect(DASHBOARD).toContain("if(v==='snap')")
  expect(DASHBOARD).toContain("window.renderSnapView")
})

// ── Dashboard checklist: Snap (widget install) must be the FIRST item ─────────
test("dashboard checklist: widget-install step appears before see-a-Sim step", () => {
  const connectPos  = DASHBOARD.indexOf('id="clConnect"')
  const seeReactPos = DASHBOARD.indexOf('id="clSeeReact"')
  expect(connectPos).toBeGreaterThan(-1)
  expect(seeReactPos).toBeGreaterThan(-1)
  // clConnect (install widget) must come before clSeeReact (Sims)
  expect(connectPos).toBeLessThan(seeReactPos)
})
