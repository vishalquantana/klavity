import { test, expect } from "bun:test"

const DASHBOARD = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const TRAILS = await Bun.file(import.meta.dir + "/public/trails.html").text()
const STUDIO = await Bun.file(import.meta.dir + "/public/index.html").text()

test("dashboard header disambiguates the Sims Studio shortcut", () => {
  expect(DASHBOARD).toContain('id="studioNavBtn" aria-label="Sims Studio')
  expect(DASHBOARD).toContain('<span class="nav-studio-lbl">Sims Studio</span>')
  expect(DASHBOARD).not.toContain('<span class="nav-studio-lbl">Studio</span>')
})

test("AutoSims first-run state leads with the create wizard CTA", () => {
  const primary = TRAILS.indexOf('class="ob-primary"')
  const explainer = TRAILS.indexOf('<div class="ob-head">How AutoSims work</div>')
  const wizardCta = TRAILS.indexOf('<button class="btn btn-indigo" onclick="openWizard()">Create your first AutoSim</button>')

  expect(primary).toBeGreaterThan(-1)
  expect(wizardCta).toBeGreaterThan(primary)
  expect(primary).toBeLessThan(explainer)
  expect(wizardCta).toBeLessThan(explainer)
})

test("Sims Studio tour stays manual and does not auto-cover create controls", () => {
  expect(STUDIO).toContain('id="ssNewSave">Create Sim</button>')
  expect(STUDIO).toContain('window.maybeStartTour = function () {}')
  expect(STUDIO).toContain('tb.addEventListener("click", function () { startTour() })')
  expect(STUDIO).toContain("loadSavedSims()")
  expect(STUDIO).not.toContain("loadSavedSims().then(function () { if (window.maybeStartTour) window.maybeStartTour() })")
})
