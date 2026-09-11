// KLA-837 — CLASS "dead-end load screen" (KLA-829 class-2): a data-load FAILURE left a page unusable
// with no recovery affordance ("only browser Back / hard refresh fixes it"). The reference good-pattern
// is dashboard.html's swrSection (auto-retry + inline Retry button). These pages have no build step, so —
// like the sibling dashboard-*.test.ts files — their DOM/JS contract is asserted from source. Each
// assertion is a negative control: it FAILS against the pre-fix source (no Retry/recover control on the
// failure path).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const read = (f: string) => readFileSync(join(import.meta.dir, "public", f), "utf8")
// Pull the body of a named function so an assertion proves the string lives on the FAILURE path,
// not merely somewhere else on the page.
function fnBody(html: string, marker: string, len = 900): string {
  const i = html.indexOf(marker)
  expect(i).toBeGreaterThan(-1)
  return html.slice(i, i + len)
}

// ── Finding 1 — sim-runs.html: load() failure painted no switcher / no retry ────────────────────────────
test("sim-runs load() failure paths route through a Retry affordance (renderLoadError)", () => {
  const html = read("sim-runs.html")
  // A shared helper renders the message + an inline Retry that re-invokes load().
  expect(html).toContain("function renderLoadError(")
  const helper = fnBody(html, "function renderLoadError(", 600)
  expect(helper).toContain('id="loadRetry"')
  expect(helper).toContain("Retry")
  expect(helper).toContain("load()")
  // Both the !r.ok and the catch path now go through it (no bare textContent dead-ends).
  const load = fnBody(html, "async function load()", 900)
  expect(load).toContain('renderLoadError("Error loading project.")')
  expect(load).toContain('renderLoadError("Network error loading page.")')
})

// ── Finding 2 — trails.html: loadData() null → terminal "Couldn't load AutoSims." ───────────────────────
test("trails load() failure offers an inline Retry (renderLoadError)", () => {
  const html = read("trails.html")
  const load = fnBody(html, "async function load(){", 400)
  expect(load).toContain("renderLoadError(")
  const helper = fnBody(html, "function renderLoadError(", 400)
  expect(helper).toContain('id="loadRetry"')
  expect(helper).toContain("Retry")
  expect(helper).toContain("load()")
})

// ── Finding 3 — dashboard.html ticket list + board: "Failed to load tickets." had no Retry ──────────────
test("dashboard ticket list + board failure states carry a Retry that re-runs the fetch", () => {
  const html = read("dashboard.html")
  const list = fnBody(html, "async function fetchAndRenderTktList()", 3000)
  expect(list).toContain('onclick="fetchAndRenderTktList()"')
  expect(list).toMatch(/Failed to load tickets\.[\s\S]*Retry/)
  const board = fnBody(html, "async function fetchAndRenderTktBoard()", 4000)
  expect(board).toContain('onclick="fetchAndRenderTktBoard()"')
  expect(board).toMatch(/Failed to load tickets\.[\s\S]*Retry/)
})

// ── Finding 4 — shared pages: transient 500/network now offers a Reload (404 stays terminal) ────────────
test("project-status.html transient error shows a Reload, terminal 404 does not", () => {
  const html = read("project-status.html")
  // Both showError copies gate the button on a non-'notfound' type.
  const matches = html.match(/location\.reload\(\)/g) || []
  expect(matches.length).toBeGreaterThanOrEqual(2)
  expect(html).toMatch(/type === 'notfound' \? '' : '<button[^>]*location\.reload\(\)/)
})

test("guarded-flows-report.html transient error shows a Reload, terminal 404 does not", () => {
  const html = read("guarded-flows-report.html")
  expect(html).toContain("location.reload()")
  expect(html).toMatch(/type === 'notfound' \? '' :/)
})

// ── Finding 5a — inbox.html: error banner now carries a same-window Retry ────────────────────────────────
test("inbox load error offers a Retry that re-loads the current window", () => {
  const html = read("inbox.html")
  const load = fnBody(html, "async function loadInbox(", 1400)
  expect(load).toContain('id="inboxRetry"')
  expect(load).toContain("loadInbox(windowHours)")
})

// ── Finding 5b — autosims-walks.html: stuck "Loading walks…" + no retry ─────────────────────────────────
test("autosims-walks load failure clears the stuck skeleton and offers a Retry", () => {
  const html = read("autosims-walks.html")
  const helper = fnBody(html, "function renderLoadError(", 700)
  expect(helper).toContain('id="walksRetry"')
  expect(helper).toContain("load()")
  // It repaints #walkList (so "Loading walks…" is never left stuck).
  expect(helper).toContain("walkList")
  const load = fnBody(html, "async function load(){", 1000)
  expect(load).toContain('renderLoadError("Error loading project.")')
  expect(load).toContain('renderLoadError("Network error.")')
})

// ── Finding 5c — superadmin.html: catch wiped both tabs with no recovery ────────────────────────────────
test("superadmin P&L transient failure offers a Reload; a real 403 stays terminal", () => {
  const html = read("superadmin.html")
  // 403 is flagged terminal so the Reload button is suppressed only for it.
  expect(html).toContain("fe.terminal = true")
  expect(html).toContain("e.terminal")
  expect(html).toContain("location.reload()")
})

// ── Finding 5d — autosims-walk.html: transient 5xx showed misleading "Walk not found." ──────────────────
test("autosims-walk distinguishes a real 404 from a transient failure (Retry)", () => {
  const html = read("autosims-walk.html")
  const load = fnBody(html, "async function load(){", 1300)
  // 404 stays "Walk not found."; everything else routes to a Retry affordance.
  expect(load).toContain("r.status===404")
  expect(load).toContain('walkLoadError("Couldn\'t load this walk.")')
  expect(load).toContain('walkLoadError("Network error loading walk.")')
  const helper = fnBody(html, "function walkLoadError(", 500)
  expect(helper).toContain('id="walkRetry"')
  expect(helper).toContain("load()")
})

// ── Finding 5e — autosims-walk-report.html: transient 5xx showed "not found" ────────────────────────────
test("autosims-walk-report distinguishes a real 404 from a transient failure (Retry)", () => {
  const html = read("autosims-walk-report.html")
  const load = fnBody(html, "async function load(){", 900)
  expect(load).toContain("r.status===404")
  expect(load).toContain('reportLoadError("Couldn\'t load this report.")')
  const helper = fnBody(html, "function reportLoadError(", 500)
  expect(helper).toContain('id="reportRetry"')
  expect(helper).toContain("load()")
})

// ── Finding 6 — dashboard.html openConvertAutosim: null-state guard on state.sims ───────────────────────
test("openConvertAutosim guards state.sims against a null state", () => {
  const html = read("dashboard.html")
  const fn = fnBody(html, "function openConvertAutosim(", 200)
  expect(fn).toContain("(state && state.sims)")
})
