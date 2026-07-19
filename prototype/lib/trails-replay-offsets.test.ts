// KLAVITYKLA-221 (JTBD 7.9) — "link findings to the replay moment".
// findingReplayOffsets resolves each queued finding → the run_step `idx` (the replay seek offset)
// it was raised at, so the dashboard can open the Walk player already seeked to that moment.
// Hermetic local libsql, seeded via Layer A helpers (mirrors trails-dashboard.test.ts).
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-roff-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })
const T = await import("./trails")
const R = await import("./trails-replay")

test("findingReplayOffsets maps each finding to the run_step idx it was raised at", async () => {
  const proj = "proj_roff"
  const trail = await T.createTrail(proj, { name: "Checkout", baseUrl: "https://x.test" })
  const walk = await T.startWalk(proj, trail)
  // Two run steps at different idx / step_id.
  await T.addRunStep(proj, { runId: walk, trailId: trail, stepId: "s_open", idx: 0, tier: "none", verdict: "green" })
  await T.addRunStep(proj, { runId: walk, trailId: trail, stepId: "s_pay", idx: 3, tier: "none", verdict: "red" })
  await T.finishWalk(proj, walk, { status: "red", llmCalls: 1 })

  // A finding on the failing step (idx 3), one on the opening step (idx 0), one with no step at all.
  const fPay = await T.recordFinding(proj, { runId: walk, trailId: trail, stepId: "s_pay", kind: "regression", title: "pay broke", confidence: 0.9, dedupKey: "p1" })
  const fOpen = await T.recordFinding(proj, { runId: walk, trailId: trail, stepId: "s_open", kind: "visual", title: "logo shift", confidence: 0.6, dedupKey: "o1" })
  const fNone = await T.recordFinding(proj, { runId: walk, trailId: trail, kind: "amber_heal", title: "no step", confidence: 0.5, dedupKey: "n1" })

  const offsets = await R.findingReplayOffsets(proj, [
    { id: fPay.id, runId: walk, stepId: "s_pay" },
    { id: fOpen.id, runId: walk, stepId: "s_open" },
    { id: fNone.id, runId: walk, stepId: null },
  ])
  expect(offsets.get(fPay.id)).toBe(3)
  expect(offsets.get(fOpen.id)).toBe(0)
  expect(offsets.has(fNone.id)).toBe(false)   // no stepId → no replay offset
})

test("findingReplayOffsets is project-scoped and ignores unknown steps", async () => {
  const proj = "proj_roff_iso"
  const trail = await T.createTrail(proj, { name: "T", baseUrl: "https://y.test" })
  const walk = await T.startWalk(proj, trail)
  await T.addRunStep(proj, { runId: walk, trailId: trail, stepId: "s_real", idx: 2, tier: "none", verdict: "green" })
  await T.finishWalk(proj, walk, { status: "green", llmCalls: 0 })

  const offsets = await R.findingReplayOffsets(proj, [
    { id: "f_ok", runId: walk, stepId: "s_real" },
    { id: "f_ghost", runId: walk, stepId: "s_missing" },       // step not in run_steps
    { id: "f_foreign", runId: "walk_other", stepId: "s_real" }, // step from a run with no rows here
  ])
  expect(offsets.get("f_ok")).toBe(2)
  expect(offsets.has("f_ghost")).toBe(false)
  expect(offsets.has("f_foreign")).toBe(false)
})

test("findingReplayOffsets returns an empty map for no findings (no query needed)", async () => {
  const offsets = await R.findingReplayOffsets("proj_roff", [])
  expect(offsets.size).toBe(0)
})
