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

// ── Onboarding: Snap tiles must NOT be hidden inside a collapsed toggle ────────
test("onboarding: mw-toggle is hidden by CSS (Snap visible by default)", () => {
  // The toggle that used to show/hide the two paths must be display:none
  expect(ONBOARDING).toContain(".more-ways .mw-toggle{display:none}")
})

test("onboarding: mw-body is NOT marked hide at load time", () => {
  // The body wrapping the two goal tiles must be open on page load
  expect(ONBOARDING).toContain('<div class="mw-body" id="mwBody">')
  // It must NOT include the 'hide' class in its initial HTML
  const mwBodyTag = ONBOARDING.match(/<div class="mw-body[^"]*" id="mwBody">/)
  expect(mwBodyTag).toBeTruthy()
  expect((mwBodyTag![0] || "")).not.toContain("hide")
})

test("onboarding: Snap goal tile is present and visible (not in a collapsed section)", () => {
  expect(ONBOARDING).toContain('class="goaltile snap"')
  // The Snap tile's label must be directly visible (not inside an aria-hidden wrapper)
  expect(ONBOARDING).toContain("Catch bugs from real visitors")
})

test("onboarding: hero subtitle mentions both Snap and Sims", () => {
  // The URL hero should no longer be "Meet your Sims" only
  expect(ONBOARDING).toContain("Start with")
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
