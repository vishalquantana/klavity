// KD-3121: Sims Studio entry points (top-bar button + "Launch the Sims studio" links) follow the same Snap-only
// gate as the Sims / AutoSims pages — locked + upgrade drawer on click. Source pins on public/dashboard.html.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
const i = HTML.indexOf("function applyNavLocks()")
const body = HTML.slice(i, HTML.indexOf("window.applyNavLocks = applyNavLocks", i))

test("applyNavLocks locks the studio nav button and both Launch-studio links", () => {
  expect(body).toContain('$("studioNavBtn")')
  expect(body).toContain('$("checklistStudioLink")')
  expect(body).toContain('.card[data-view~="sims"] a[href^="/app"]')
  expect(body).toContain('setAttribute("data-snap-locked", "studio")')
  expect(body).toContain('removeAttribute("data-snap-locked")')
})

test("locked studio links are intercepted by the capture-phase upgrade-drawer handler", () => {
  expect(HTML).toContain('e.target.closest("[data-snap-locked]")')
  expect(HTML).toContain("openPlanDrawer()")
})

test("clicking a locked studio entry point opens the same upgrade card as Sims/AutoSims (popup, not the Settings drawer)", () => {
  expect(HTML).toContain('data-snap-locked", "studio")')
  expect(HTML).toContain('t.getAttribute("data-snap-locked") === "studio"')
  expect(HTML).toContain('renderUpgradeWall("Sims Studio"')
  expect(HTML).not.toContain("uw-close")
  expect(HTML).toContain('$("upgradeWallOverlay")')
})

test("Sims-only overview widgets are hidden on a Snap-only project", () => {
  expect(HTML).toContain("body.snap-only .sims-only { display: none !important }")
  expect(body).toContain('document.body.classList.toggle("snap-only", gated)')
  // Sims stat tile + Your Sims + Live activity + What your Sims are saying
  expect((HTML.match(/class="(?:stat|card|card full) sims-only"/g) || []).length).toBe(4)
})

test("Settings drawers for Sims/AutoSims features are hidden on a Snap-only project", () => {
  for (const id of ["liveDrawer", "obsDrawer", "taccDrawer", "trailsAutofileDrawer", "aiInstrDrawer"]) {
    expect(HTML).toContain(`body.snap-only #${id}`)
    expect(HTML).toContain(`id="${id}"`)
  }
})

test("Sim Reports (triage view) is gated like Sims/AutoSims: upgrade wall + nav lock", () => {
  expect(HTML).toContain('(view === "sims" || view === "autosims" || view === "triage") && snapOnly()')
  expect(HTML).toContain('view === "triage" ? "Sim Reports"')
  expect(body).toContain('.side .nv[data-go="triage"]')
})

test("Plan & billing stays visible on a Snap-only project (target of Upgrade to unlock)", () => {
  expect(HTML).not.toContain("body.snap-only #planDrawer")
  expect(HTML).toContain('id="planDrawer"')
})

test("Sims Studio nav button keeps its label on one line", () => {
  expect(HTML).toContain(".bar-left .nav-studio, .nav-studio-lbl { white-space: nowrap; flex-shrink: 0; }")
  expect(HTML).toContain(".bar-left .nav-studio { width: auto; min-width: 122px;")
})

test("every upgrade popup covers the content area only (not the sidebar or top bar), card centred", () => {
  expect(HTML).toContain(".upgrade-wall.show { position: fixed; top: 49px; right: 0; bottom: 0; left: 214px; z-index: 25;")
  expect(HTML).toContain("body.side-collapsed .upgrade-wall.show { left: 64px }")
})
