// #654 / #655 / #658: the ~25s liveness poll (and the window-focus refresh) must NOT re-fire the ~12
// Settings/Sims/trend network sub-loaders, and those sub-loaders must load lazily+once when their host
// view is first shown — not eagerly on first paint. This guard pins BOTH the wiring (source-level) and
// the behaviour (a spy proves the once-guard + that an overview/poll refresh never touches Settings).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

// The exact loader calls that used to fire eagerly in render()'s `if(!fromCache)` block.
const SUBLOADERS = [
  "loadConnectors(", "loadLabelRules(", "loadLabels(", "loadAppearance()",
  "loadLive()", "loadObs()", "taccRender()", "loadTrailsAutofile()", "loadTrends()",
]

test("render() no longer fires any Settings/Sims/trend sub-loaders (they moved out of render)", () => {
  const start = html.indexOf("function render(fromCache, poll)")
  expect(start).toBeGreaterThan(0)
  // render() ends right before the trend-chart section block.
  const end = html.indexOf("dashboard trend chart", start)
  expect(end).toBeGreaterThan(start)
  const renderSrc = html.slice(start, end)
  for (const call of SUBLOADERS) {
    expect(renderSrc).not.toContain(call)
  }
})

test("the poll path is scoped and never re-fires sub-loaders", () => {
  // dashLiveTick (the 25s poll + focus/visibility refresh) calls refreshAll(true) …
  expect(html).toContain("refreshAll(true)")
  // … refreshAll renders scoped-to-view on a poll, full on a mutation …
  expect(html).toContain("render(false, isPoll === true)")
  // … and refreshAll does NOT call loadViewData (sub-loaders never run on the poll).
  const rStart = html.indexOf("async function refreshAll(isPoll)")
  const rEnd = html.indexOf("dashboard liveness", rStart)   // comment block immediately after refreshAll
  expect(rStart).toBeGreaterThan(0)
  expect(rEnd).toBeGreaterThan(rStart)
  expect(html.slice(rStart, rEnd)).not.toContain("loadViewData")
})

test("sub-loaders are hydrated lazily via loadViewData on navigation + first-shown view", () => {
  // setView() calls loadViewData(v) on every navigation.
  expect(html).toContain("window.loadViewData(v)")
  // load()'s fresh path hydrates the initially-shown view once state exists.
  expect(html).toContain('loadViewData(document.body.getAttribute("data-view")')
})

// ── Behavioural: extract the real _subOnce + loadViewData and drive them with spy loaders ──────────
function extractLazyLoaders(): string {
  const start = html.indexOf("function _subOnce(key, fn)")
  const end = html.indexOf("window.loadViewData = loadViewData")
  if (start < 0 || end < 0) throw new Error("could not locate lazy-loader source")
  return html.slice(start, end)
}

function buildLoadViewData(role = "admin") {
  const calls: Record<string, number> = {}
  const spy = (name: string) => () => { calls[name] = (calls[name] || 0) + 1 }
  const win: any = { __klavSubLoaded: {} }
  const deps = {
    wireTrends: spy("wireTrends"), loadTrends: spy("loadTrends"),
    loadConnectors: spy("loadConnectors"), loadLabelRules: spy("loadLabelRules"),
    loadLabels: spy("loadLabels"), loadAppearance: spy("loadAppearance"),
    loadLive: spy("loadLive"), loadObs: spy("loadObs"),
    taccRender: spy("taccRender"), ciRender: spy("ciRender"),
    loadTrailsAutofile: spy("loadTrailsAutofile"),
  }
  const factory = new Function(
    "window", "state", ...Object.keys(deps),
    extractLazyLoaders() + "\nreturn loadViewData;",
  )
  const state = { active: { role } }
  const loadViewData = factory(win, state, ...Object.values(deps))
  return { loadViewData, calls }
}

test("overview refresh fires ONLY the trend loaders — never any Settings sub-loader", () => {
  const { loadViewData, calls } = buildLoadViewData()
  loadViewData("overview")
  expect(calls.loadTrends).toBe(1)
  expect(calls.wireTrends).toBe(1)
  // The Settings/Sims sub-loaders stay untouched — this is the poll/focus regression that #654 fixes.
  for (const k of ["loadConnectors", "loadLabelRules", "loadLabels", "loadAppearance", "loadLive", "loadObs", "taccRender", "ciRender", "loadTrailsAutofile"]) {
    expect(calls[k]).toBeUndefined()
  }
})

test("opening Settings hydrates every sub-loader exactly once; re-entry refetches nothing", () => {
  const { loadViewData, calls } = buildLoadViewData()
  loadViewData("settings")
  const settingsLoaders = ["loadConnectors", "loadLabelRules", "loadLabels", "loadAppearance", "loadLive", "loadObs", "taccRender", "ciRender", "loadTrailsAutofile"]
  for (const k of settingsLoaders) expect(calls[k]).toBe(1)
  // Re-navigating to Settings (or a later poll-driven re-render) must not refetch — the once-guard holds.
  loadViewData("settings")
  loadViewData("settings")
  for (const k of settingsLoaders) expect(calls[k]).toBe(1)
})

test("repeated overview entry (poll churn) never re-fires the trend loaders", () => {
  const { loadViewData, calls } = buildLoadViewData()
  loadViewData("overview")
  loadViewData("overview")
  loadViewData("overview")
  expect(calls.loadTrends).toBe(1)
  expect(calls.wireTrends).toBe(1)
})

test("non-admin never triggers admin-only Sims/Settings loaders", () => {
  const { loadViewData, calls } = buildLoadViewData("user")
  loadViewData("sims")
  loadViewData("settings")
  for (const k of ["loadLive", "loadObs", "taccRender", "ciRender", "loadTrailsAutofile"]) {
    expect(calls[k]).toBeUndefined()
  }
  // Non-admin still gets the connector/label group (each internally hides admin-only affordances).
  expect(calls.loadConnectors).toBe(1)
})
