// KD-2877: the Sim Runs page no longer chains on the heavy /api/dashboard, loads a slim list, loads one run's full reactions on select,
// and can never sit on "Loading Sim Runs…" forever (abortable requests → the existing error + Retry view).
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/sim-runs.html").text()
const scripts = [...HTML.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([^]*?)<\/script>/g)].map((m) => m[1])
const PAGE = scripts.reduce((a, b) => (b.length > a.length ? b : a), "")

function body(marker: string): string {
  const i = PAGE.indexOf(marker)
  if (i < 0) throw new Error("marker not found: " + marker)
  let j = i; while (PAGE[j] !== "{") j++
  let d = 0
  for (; j < PAGE.length; j++) { if (PAGE[j] === "{") d++; else if (PAGE[j] === "}") { d--; if (d === 0) return PAGE.slice(i, j + 1) } }
  throw new Error("unbalanced: " + marker)
}

test("the page script still parses", () => {
  expect(() => new Function(PAGE)).not.toThrow()
})

test("load() no longer waits on /api/dashboard: runs, projects and the user are requested together", () => {
  const load = body("async function load()")
  expect(load).not.toContain("/api/dashboard")
  expect(load).toContain('timedFetch("/api/projects")')
  expect(load).toContain('timedFetch("/api/me")')
  expect(load).toContain("await fetchRuns(pid)")
  // fetchRuns is fired without awaiting the other two first
  expect(load.indexOf("await fetchRuns(pid)")).toBeGreaterThan(load.indexOf('timedFetch("/api/me")'))
})

test("the list asks for the slim payload and learns the active project from the response", () => {
  const fr = body("async function fetchRuns(")
  expect(fr).toContain("&slim=1")
  expect(fr).toContain("d.projectId")
  expect(fr).toContain("No active project found.")
})

test("selecting a slim run loads its full reactions once (cached), and shows a loading state meanwhile", () => {
  const sr = body("function showRun(")
  expect(sr).toContain("fullRuns[run.id]")
  expect(sr).toContain("fetchFullRun(run.id)")
  expect(sr).toContain("Loading run")
  expect(PAGE).toContain('"/api/sims/runs/" + encodeURIComponent(id)')
  // both selection paths go through showRun
  expect(body("function selectRun(")).toContain("showRun(activeRun || null)")
  expect(body("function renderRuns(")).toContain("showRun(activeRun || null)")
})

test("every load request is abortable and a timeout lands on the existing error + Retry view (never a forever spinner)", () => {
  const tf = body("function timedFetch(")
  expect(tf).toContain("AbortController")
  expect(tf).toContain("signal")
  expect(body("async function fetchRuns(")).toContain("renderLoadError(")
  expect(body("function renderLoadError(")).toContain("loadRetry")
})

test("the list pill and avatars read the slim fields, with the old full-reactions shape still working", () => {
  const rr = body("function renderRuns(")
  expect(rr).toContain("run.issueCount")
  expect(rr).toContain("run.sims")
  expect(rr).toContain("run.reactions")
})
