// #722-fix2 (Codex QA round 2) — real-path tests for the 3 residuals:
//   1. GUARANTEE the UNIQUE finding_dedup index (exercise the REAL applySchema + a REAL Trails
//      ON CONFLICT dedup write — a non-unique index is NOT a working ON CONFLICT target).
//   2. Global-monotonic generation guard (no ABA when the gen map is pruned past its threshold),
//      for BOTH dashboardCounts and computeDashboardInsights.
//   3. GDPR erase derives its invalidation set from the rows the DELETE actually removed (RETURNING).
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  reconnectDb, initDb, applySchema, db,
  dashboardCounts, computeDashboardInsights, invalidateDashboardCache,
  insertFeedback, eraseUser,
} from "./lib/db"
import { recordFinding } from "./lib/trails"

const dbFile = join(tmpdir(), `klav-dbperffix2-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)

beforeAll(async () => {
  reconnectDb("file:" + dbFile)
  await initDb()
})

let seq = 0
const rid = (p: string) => `${p}_${Date.now()}_${seq++}_${Math.random().toString(36).slice(2)}`

// raw feedback insert that DOES NOT go through insertFeedback (so it never invalidates the cache) —
// used by the generation-race tests which need a project that starts with generation 0.
async function rawFeedback(projectId: string, status = "open") {
  await db!.execute({
    sql: "INSERT INTO feedback (id, project_id, observation, status, created_at) VALUES (?,?,?,?,?)",
    args: [rid("fb"), projectId, "raw row", status, Date.now()],
  })
}

// ── Finding 1: the UNIQUE index is guaranteed & ON CONFLICT dedup actually works ──────────────────
test("Finding 1: a real Trails ON CONFLICT dedup write succeeds against the guaranteed unique index", async () => {
  const pid = rid("proj_uq")
  const key = "dedupkey-" + rid("k")
  const base = { runId: rid("run"), trailId: rid("trail"), kind: "regression" as const, title: "flaky login", confidence: 0.9, dedupKey: key }

  const first = await recordFinding(pid, base)
  expect(first.deduped).toBe(false)
  expect(first.recurrence).toBe(1)

  // Same (project_id, dedup_key) → the ON CONFLICT DO UPDATE path must fire (requires a UNIQUE index).
  const second = await recordFinding(pid, { ...base, runId: rid("run") })
  expect(second.deduped).toBe(true)
  expect(second.recurrence).toBe(2)

  // Exactly one row survived — the write path deduped rather than inserting a duplicate.
  const rows = await db!.execute({ sql: "SELECT COUNT(*) n FROM findings WHERE project_id=? AND dedup_key=?", args: [pid, key] })
  expect(Number((rows.rows[0] as any).n)).toBe(1)
})

test("Finding 1: applySchema RECOVERS the unique index when duplicate rows exist + a non-unique index is present", async () => {
  const pid = rid("proj_recover")
  const key = "dupkey-" + rid("k")
  // Simulate a legacy/other-instance DB that lost finding_dedup_uq and accumulated duplicate rows, with
  // only the (useless-for-ON-CONFLICT) non-unique index present.
  await db!.execute("DROP INDEX IF EXISTS finding_dedup_uq")
  await db!.execute("CREATE INDEX IF NOT EXISTS finding_dedup_idx ON findings(project_id, dedup_key)")
  const mk = (id: string, rec: number) => db!.execute({
    sql: "INSERT INTO findings (id, project_id, run_id, step_id, trail_id, kind, title, confidence, dedup_key, recurrence, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
    args: [id, pid, rid("run"), null, rid("trail"), "regression", "dup", 0.9, key, rec, "queued", Date.now(), Date.now()],
  })
  await mk("keep_" + rid("a"), 5) // oldest rowid — the one the collapse keeps
  await mk("dup_" + rid("b"), 1)
  await mk("dup_" + rid("c"), 1)

  // Run the REAL migration code (applySchema contains the guaranteed-uq block): it must collapse the
  // duplicates, (re)create finding_dedup_uq, and drop the redundant non-unique index.
  await applySchema(db!)

  const idx = await db!.execute("SELECT name FROM sqlite_master WHERE type='index' AND name IN ('finding_dedup_uq','finding_dedup_idx')")
  const names = idx.rows.map((r: any) => String(r.name))
  expect(names).toContain("finding_dedup_uq")     // the app-critical unique index is guaranteed present
  expect(names).not.toContain("finding_dedup_idx") // redundant non-unique index dropped once uq confirmed

  const collapsed = await db!.execute({ sql: "SELECT COUNT(*) n FROM findings WHERE project_id=? AND dedup_key=?", args: [pid, key] })
  expect(Number((collapsed.rows[0] as any).n)).toBe(1) // duplicates collapsed to one

  // And the recovered unique index actually WORKS for ON CONFLICT — a real dedup write bumps recurrence.
  const res = await recordFinding(pid, { runId: rid("run"), trailId: rid("trail"), kind: "regression", title: "dup", confidence: 0.9, dedupKey: key })
  expect(res.deduped).toBe(true)
})

// ── Finding 2: global-monotonic generation guard survives the 5000-entry prune (no ABA) ───────────
test("Finding 2: a racing count read invalidated across the gen-map prune threshold does NOT pin stale data", async () => {
  const pid = rid("proj_aba_counts")
  await rawFeedback(pid) // true feedback count = 1; pid never invalidated → starts at generation floor

  // Start the read but do NOT await — it snapshots the global sequence and dispatches its COUNTs (→ 1).
  const racing = dashboardCounts(pid)
  // A mutation for pid fires DURING the read, and the gen map is then pruned past its 5000 cap by other
  // projects' invalidations. All synchronous, so they complete before the racing read resumes.
  invalidateDashboardCache(pid)
  for (let i = 0; i < 5001; i++) invalidateDashboardCache("bulk_counts_" + i)
  const racedVal = await racing
  expect(racedVal.feedback).toBe(1) // it returns what it computed; it just must not CACHE it

  // Expose any stale pin: delete the row WITHOUT invalidating pid. With the monotonic-gen + floor guard
  // the racing read declined to cache, so this recompute reads the true 0. The OLD per-project counter
  // (reset to 0 on prune) would have matched the captured 0 and cached the stale 1 here.
  await db!.execute({ sql: "DELETE FROM feedback WHERE project_id=?", args: [pid] })
  const fresh = await dashboardCounts(pid)
  expect(fresh.feedback).toBe(0)
})

test("Finding 2: the SAME guard protects the insights cache across the prune threshold", async () => {
  const pid = rid("proj_aba_insights")
  await rawFeedback(pid, "new") // needsTriage counts status='new' → 1

  const racing = computeDashboardInsights(pid)
  invalidateDashboardCache(pid)
  for (let i = 0; i < 5001; i++) invalidateDashboardCache("bulk_insights_" + i)
  const racedVal = await racing
  expect(racedVal.needsTriage).toBe(1)

  await db!.execute({ sql: "DELETE FROM feedback WHERE project_id=?", args: [pid] })
  const fresh = await computeDashboardInsights(pid)
  expect(fresh.needsTriage).toBe(0)
})

// ── Finding 3: erase invalidates every project whose feedback the DELETE actually removed ──────────
test("Finding 3: eraseUser busts the cache of every project it deleted the user's feedback from", async () => {
  const pidA = rid("proj_eraseA")
  const pidB = rid("proj_eraseB")
  const email = rid("gdpr") + "@x.io"
  await insertFeedback({ projectId: pidA, observation: "A", actorEmail: email })
  await insertFeedback({ projectId: pidB, observation: "B", actorEmail: email })

  // Prime BOTH caches at feedback=1.
  expect((await dashboardCounts(pidA)).feedback).toBe(1)
  expect((await dashboardCounts(pidB)).feedback).toBe(1)

  await eraseUser(email)

  // Both caches must reflect the deletion (0) — the invalidation set came from DELETE ... RETURNING,
  // i.e. exactly the projects whose rows were removed.
  expect((await dashboardCounts(pidA)).feedback).toBe(0)
  expect((await dashboardCounts(pidB)).feedback).toBe(0)
})
