// WP-S1 — Sim picker on "Preview a URL": choose which Sims a preview run uses.
//   server: POST /api/sim/preview accepts `simIds` (omitted = all Sims, unchanged); validated BEFORE any SSRF/browser work.
//   client: with 2+ Sims the first "Run Sims" click opens the picker; at least one Sim must be ticked; the run is limited to the ticked Sims.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { selectPreviewSims } from "./lib/sim-preview"

const SERVER = readFileSync(new URL("./server.ts", import.meta.url), "utf8")
const DASH = readFileSync(new URL("./public/dashboard.html", import.meta.url), "utf8")

const sims = [{ id: "a", name: "Alex" }, { id: "b", name: "Baseline QA" }, { id: "c", name: "Cara" }]

// ── server: selection rules ────────────────────────────────────────────────────────────────────────────────────────────
test("omitted simIds = every Sim (existing callers unchanged)", () => {
  for (const v of [undefined, null]) {
    const r = selectPreviewSims(sims, v)
    expect(r).toEqual({ ok: true, sims, simIds: null })
  }
})

test("a picked subset runs only those Sims, in the project's own order, and reports the ids", () => {
  const r = selectPreviewSims(sims, ["c", "a"])
  expect(r.ok).toBe(true)
  if (r.ok) { expect(r.sims.map((s) => s.id)).toEqual(["a", "c"]); expect(r.simIds).toEqual(["a", "c"]) }
})

test("picking every Sim is the same as 'all' (recorded as null), and duplicates are ignored", () => {
  const r = selectPreviewSims(sims, ["a", "a", "b", "c", " c "])
  expect(r.ok).toBe(true)
  if (r.ok) { expect(r.sims).toHaveLength(3); expect(r.simIds).toBeNull() }
})

test("an empty selection is rejected with the picker's message", () => {
  expect(selectPreviewSims(sims, [])).toEqual({ ok: false, error: "Select at least one Sim to run." })
  expect(selectPreviewSims(sims, ["", "  ", null as any])).toEqual({ ok: false, error: "Select at least one Sim to run." })
})

test("an id that is not one of this project's Sims is rejected (no cross-project Sim can be run)", () => {
  const r = selectPreviewSims(sims, ["a", "sim_from_another_project"])
  expect(r.ok).toBe(false)
  if (!r.ok) expect(r.error).toMatch(/aren't in this project/)
})

test("a non-list simIds is rejected", () => {
  for (const v of ["a", 5, {}, true]) expect(selectPreviewSims(sims, v).ok).toBe(false)
})

// ── server: wiring ─────────────────────────────────────────────────────────────────────────────────────────────────────
test("/api/sim/preview validates the selection before any SSRF/screenshot work, then runs and records only the picked Sims", () => {
  const i = SERVER.indexOf('path === "/api/sim/preview"')
  const body = SERVER.slice(i, i + 9000)
  expect(body).toContain("simIds: pvSimIds")
  const sel = body.indexOf("selectPreviewSims(projectSims, pvSimIds")
  const ssrf = body.indexOf("SSRF preflight: reuse")
  expect(sel).toBeGreaterThan(0)
  expect(ssrf).toBeGreaterThan(sel)                          // bad selection never burns a browser slot or an AI call
  expect(body).toContain("targetSims: pvSelectedSims")
  expect(body).toContain("simIds: pvSubsetIds")              // run history records exactly the picked Sims (null = all)
  expect(body).not.toContain("targetSims: projectSims")
})

// ── client: the Run Sims decision ──────────────────────────────────────────────────────────────────────────────────────
function fn(src: string, start: string): string {
  const i = src.indexOf(start)
  if (i < 0) throw new Error("missing " + start)
  let d = 0
  for (let k = src.indexOf("{", i); k < src.length; k++) {
    if (src[k] === "{") d++
    else if (src[k] === "}" && --d === 0) return src.slice(i, k + 1)
  }
  throw new Error("unbalanced " + start)
}
const decide = new Function(fn(DASH, "function supPickDecide(") + "; return supPickDecide")() as (s: any[], sel: Set<string>, open: boolean) => any

test("0 or 1 Sim: nothing to choose, Run Sims just runs", () => {
  expect(decide([], new Set(), false)).toEqual({ action: "run", simIds: null })
  expect(decide([{ id: "a" }], new Set(), false)).toEqual({ action: "run", simIds: null })
})

test("2+ Sims: the first click opens the picker with the 'select at least one' message", () => {
  expect(decide(sims, new Set(), false)).toEqual({ action: "open", message: "Select at least one Sim to run." })
})

test("picker open with nothing ticked: error, no run", () => {
  expect(decide(sims, new Set(), true)).toEqual({ action: "error", message: "Select at least one Sim to run." })
})

test("picker open with Sims ticked: runs exactly those, in list order; stale ids are ignored", () => {
  expect(decide(sims, new Set(["c", "a", "gone"]), true)).toEqual({ action: "run", simIds: ["a", "c"] })
  expect(decide(sims, new Set(["gone"]), true).action).toBe("error")
})

test("the request carries simIds only when the picker chose them", () => {
  expect(DASH).toContain("pick.simIds ? { url: pvUrl, projectId: pid, env: env, simIds: pick.simIds } : { url: pvUrl, projectId: pid, env: env }")
})

test("picker markup: search, Select all, selected count, per-Sim checkboxes", () => {
  for (const s of ['id="supPicker"', 'id="supPickSearch"', "Select all Sims", "No Sims selected", 'id="supPickAll"', "Search Sims…"]) expect(DASH).toContain(s)
})

// ── regression: a successful run must not be reported as a "Network error" ─────────────────────────────────────────────
test("URL preview renders sentiment with helpers that exist, and a display failure is not reported as a network error", () => {
  const body = fn(DASH, "async function runSimUrlPreview(")
  expect(body).not.toContain("normSentiment(")                 // was never defined: threw on every observation with a sentiment
  expect(body).toContain("gotResponse = true")                 // set once the server has answered
  expect(body).toContain("gotResponse ? ")                     // catch distinguishes display failure from network failure
  expect(DASH).not.toMatch(/normSentiment\(/)
})

// ── picker appears once a URL is entered; Run Sims disabled until a Sim is ticked ─────────────────────────────────────
test("picker shows when a URL is typed (2+ Sims) and Run Sims is disabled until a Sim is ticked", () => {
  const refresh = fn(DASH, "function supPickRefresh(")
  expect(refresh).toContain("multi && hasUrl")                            // picker opens as soon as there is a URL and 2+ Sims
  expect(refresh).toContain("_supPick.selected.size === 0")               // nothing ticked => disabled
  expect(refresh).toContain("runBtn.disabled = !!spinning || needPick")
  expect(DASH).toContain('inp.addEventListener("input", supPickRefresh)') // typing in the URL box drives it
  const run = fn(DASH, "async function runSimUrlPreview(")
  expect(run).toContain("finally {")                                      // button state re-applied after a run
  expect(run).toContain("supPickRefresh()")
})
