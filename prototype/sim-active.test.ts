// WP-S2 — Sim Active / Deactivate: every path that RUNS or OFFERS Sims must skip inactive Sims, and the toggle must be
// admin-only, audited and project-scoped. (Data-layer behaviour is covered with a real DB in lib/persona-active.test.ts.)
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"

const SERVER = readFileSync(new URL("./server.ts", import.meta.url), "utf8")
const DASH = readFileSync(new URL("./public/dashboard.html", import.meta.url), "utf8")
const SCHED = readFileSync(new URL("./lib/sim-review-schedule.ts", import.meta.url), "utf8")

function block(src: string, start: string, len = 4000): string {
  const i = src.indexOf(start)
  if (i < 0) throw new Error("missing " + start)
  return src.slice(i, i + len)
}

// ── server: every run/offer path opts in to activeOnly ─────────────────────────────────────────────────────────────────
test("dashboard URL preview runs only active Sims, and says so when every Sim is inactive", () => {
  const b = block(SERVER, 'path === "/api/sim/preview"', 9000)
  expect(b).toContain("pvAllSims.filter((p) => p.active !== false)")
  expect(b).toContain("inactive")
  // the picker's selection is validated against the ACTIVE list, so an inactive Sim cannot be picked
  expect(b.indexOf("projectSims = pvAllSims.filter")).toBeLessThan(b.indexOf("selectPreviewSims(projectSims, pvSimIds"))
})

test("extension / widget reviews (/api/sim/review) never run an inactive Sim, even if named in simIds", () => {
  const b = block(SERVER, "const projectSims = await listPersonasForProject(projectId", 400)
  expect(b).toContain("{ activeOnly: true }")
})

test("scheduled reviews skip inactive Sims", () => {
  expect(SCHED).toContain("listPersonas(schedule.projectId, { activeOnly: true })")
})

test("the widget Sim chips and the extension Sim list only offer active Sims", () => {
  expect(block(SERVER, 'path === "/api/widget/sims"', 900)).toContain("listPersonas(projectId, { activeOnly: true })")
  expect(block(SERVER, "const personas = await listPersonas(projS.id", 200)).toContain("{ activeOnly: true }")
})

test("management views keep every Sim: the personas list, dashboard state and id lookups are not filtered", () => {
  expect(block(SERVER, 'req.method === "GET" && path === "/api/personas"', 700)).toContain("listPersonasForProject(wid)")
  expect(SERVER).toContain("          listPersonas(wid),") // dashboard state.sims source: unfiltered
  expect(SERVER).toContain("active: p.active !== false") // dashboard state.sims carries the flag for the UI
})

// ── server: the toggle route ────────────────────────────────────────────────────────────────────────────────────────────
test("PATCH /api/personas/:id/active is admin-only, validated, project-scoped and audited", () => {
  const b = block(SERVER, "const activeMatch = path.match", 1800)
  expect(b).toContain('proj2.access !== "admin"')
  expect(b).toContain("403")
  expect(b).toContain('typeof body.active !== "boolean"')
  expect(b).toContain("(await listPersonas(wid)).find(p => p.id === pid)") // home-project Sim only
  expect(b).toContain("setPersonaActive(pid, wid, body.active)")
  expect(b).toContain('field: "active"')                                    // persona_edits audit
})

test("Baseline QA can be deactivated but not deleted", () => {
  const b = block(SERVER, 'if (req.method === "DELETE") {', 900)
  expect(b).toContain('pid.startsWith("sim_baseline_")')
  expect(b.indexOf("sim_baseline_")).toBeLessThan(b.indexOf("deletePersona(pid, wid)"))
})

// ── dashboard ──────────────────────────────────────────────────────────────────────────────────────────────────────────
test("Sim cards show Active/Inactive, a Deactivate/Activate button (admins), a confirmation, and grey the inactive Sim", () => {
  for (const s of ['class="sf-state"', "Deactivate", "Activate", "is-inactive", "data-sim-toggle", "toggleSimActive("]) expect(DASH).toContain(s)
  const t = block(DASH, "async function toggleSimActive(", 1800)
  expect(t).toContain("klavConfirm(")                       // confirm before deactivating
  expect(t).toContain('method: "PATCH"')
  expect(DASH).toContain("canToggle")                       // admin-only control
})

// Matches the Figma design: the header count is the total number of Sims, the Active/Inactive badge sits on the right of the
// card header (after the observations pill, before the button), and the Preview a URL card comes above Your Sims.
test("Sims page layout follows the design: total count, badge after the observations pill, Preview card above Your Sims", () => {
  expect(DASH).toContain('countEl.textContent = sims.length ? String(sims.length) : ""')
  expect(DASH).not.toContain('" of " + sims.length + " active"')
  expect(DASH.indexOf('<span class="sf-badge">${badge}</span>')).toBeLessThan(DASH.indexOf('<span class="sf-state">'))
  expect(DASH.indexOf('<span class="sf-state">')).toBeLessThan(DASH.indexOf("${toggleBtn}"))
  expect(DASH.indexOf('id="simUrlPreviewCard"')).toBeLessThan(DASH.indexOf('class="card full sims-hero"'))
})

test("the Run Sims picker offers only active Sims, and Run Sims is disabled when every Sim is inactive", () => {
  expect(block(DASH, "function supPickSims()", 250)).toContain("x.active !== false")
  const r = block(DASH, "function supPickRefresh()", 2200)
  expect(r).toContain("allInactive")
  expect(r).toContain("runBtn.disabled = !!spinning || needPick || allInactive")
  expect(r).toContain("All your Sims are inactive")
})
