// KD-2861: a deactivated Sim must look deactivated at once and STAY that way — no flip back to Active for ~10s.
// The dashboard script can't be driven by jsdom, so (like the other dashboard-*.test.ts guards) this extracts the
// shipped functions from dashboard.html: the pure guard logic is executed, the wiring is asserted on source.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

function extractFn(src: string, marker: string): string {
  const i = src.indexOf(marker)
  if (i < 0) throw new Error("marker not found: " + marker)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + marker)
}

// Load the real guard functions into a sandbox with a fake window.
function guards() {
  const code = ["function recordSimEdit", "function confirmSimEdit", "function clearSimEdit", "function simEditGuarding", "function mergeLocalSimEdits"]
    .map((m) => extractFn(HTML, m)).join("\n")
  const win: any = { __klavSimEdits: {} }
  const f = new Function("window", `${code}; return { recordSimEdit, confirmSimEdit, clearSimEdit, simEditGuarding, mergeLocalSimEdits }`)
  return { win, ...(f(win) as any) }
}

test("a pending edit protects against any read, however it started", () => {
  const g = guards()
  g.recordSimEdit("s1", false)
  expect(g.simEditGuarding("s1", Date.now() + 5000)?.active).toBe(false)
  expect(g.simEditGuarding("s1", undefined)?.active).toBe(false)
})

test("a confirmed edit protects against reads that began BEFORE it, not after", () => {
  const g = guards()
  g.recordSimEdit("s1", false)
  const readStartedBefore = Date.now() - 50
  g.confirmSimEdit("s1")
  expect(g.simEditGuarding("s1", readStartedBefore)?.active).toBe(false)   // stale in-flight read → ignored
  expect(g.simEditGuarding("s1", Date.now() + 10)).toBeNull()              // a later read is trusted again
  expect(g.simEditGuarding("s1", undefined)).toBeNull()
})

test("a failed request clears the edit so nothing is protected", () => {
  const g = guards()
  g.recordSimEdit("s1", false)
  g.clearSimEdit("s1")
  expect(g.simEditGuarding("s1", 0)).toBeNull()
})

test("an old edit expires after 60s", () => {
  const g = guards()
  g.recordSimEdit("s1", false); g.confirmSimEdit("s1")
  g.win.__klavSimEdits.s1.ts = Date.now() - 61_000
  expect(g.simEditGuarding("s1", 0)).toBeNull()
})

test("the dashboard poll can't revert a just-made (de)activate; other Sims are untouched", () => {
  const g = guards()
  g.recordSimEdit("s1", false)
  const t0 = Date.now() - 100                      // the poll's request began before the change
  g.confirmSimEdit("s1")
  const stale = { sims: [{ id: "s1", active: true }, { id: "s2", active: true }] }
  g.mergeLocalSimEdits(stale, t0)
  expect(stale.sims).toEqual([{ id: "s1", active: false }, { id: "s2", active: true }])
  const fresh = { sims: [{ id: "s1", active: false }, { id: "s2", active: true }] }
  g.mergeLocalSimEdits(fresh, Date.now() + 10)     // a poll that began after the change is left as the server says
  expect(fresh.sims[0].active).toBe(false)
})

test("wiring: toggleSimActive flips the card before the request and reverts only on failure", () => {
  const fn = extractFn(HTML, "async function toggleSimActive")
  const flip = fn.indexOf("applySimActiveOptimistic(sim, makeActive)")
  const req = fn.indexOf('fetch("/api/personas/"')
  expect(flip).toBeGreaterThan(-1)
  expect(req).toBeGreaterThan(flip)                         // the optimistic flip happens before the PATCH
  const opt = extractFn(HTML, "function applySimActiveOptimistic")
  expect(opt.indexOf("recordSimEdit(simId, makeActive)")).toBeGreaterThan(-1)
  expect(opt.indexOf("renderSimsFeed()")).toBeGreaterThan(opt.indexOf("recordSimEdit("))   // paints immediately
  expect(opt).toContain("clearSimEdit(simId)")              // the revert path
  expect(fn).toContain("revertToggle(")
  expect(fn).toContain("confirmSimEdit(simId)")
  expect(fn).toContain("__klavMutating")
})

test("wiring: both background reads honour a newer local edit", () => {
  expect(extractFn(HTML, "async function loadSimExecStates")).toContain("simExecStore(pid, data.sims, startedAt)")
  expect(extractFn(HTML, "function simExecStore")).toContain("simEditGuarding(s.id, fetchStart)")
  expect(extractFn(HTML, "async function refreshAll")).toContain("mergeLocalSimEdits(data, fetchStart)")
})
