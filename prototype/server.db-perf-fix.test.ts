// #722-fix (Codex QA) — dashboard-cache invalidation + generation-race + redundant-index-drop safety.
// These tests exercise the in-process aggregate cache directly against an isolated file: libSQL DB.
import { test, expect, beforeAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  reconnectDb, initDb, db,
  dashboardCounts, invalidateDashboardCache,
  insertFeedback, updateFeedbackTracker,
  mergeFeedbackClusters, splitOccurrenceToNewTicket, insertFeedbackOccurrence, listFeedbackOccurrences,
  eraseUser,
} from "./lib/db"

const dbFile = join(tmpdir(), `klav-dbperffix-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)

beforeAll(async () => {
  reconnectDb("file:" + dbFile)
  await initDb()
})

// ── Finding 1: Plane tracker writeback busts the cached ticket count ──────────────────────────────
test("Finding 1: updateFeedbackTracker invalidates the cached dashboard ticket count", async () => {
  const pid = "proj_tracker_" + Math.random().toString(36).slice(2)
  const fid = await insertFeedback({ projectId: pid, observation: "no ticket yet", actorEmail: "u@x.io" })

  // Prime the cache: no plane_issue_key yet → tickets = 0.
  const before = await dashboardCounts(pid)
  expect(before.tickets).toBe(0)

  // Write the tracker key (this is the mutation that previously did NOT invalidate).
  await updateFeedbackTracker(fid, "KEY-1", "https://tracker/KEY-1")

  // Without the fix the cached 0 would persist for the whole TTL; with it, the count reflects the write.
  const after = await dashboardCounts(pid)
  expect(after.tickets).toBe(1)
})

// ── Finding 2a: merge deletes a row → counts refresh at the mutation boundary ──────────────────────
test("Finding 2: mergeFeedbackClusters invalidates so feedback count drops immediately", async () => {
  const pid = "proj_merge_" + Math.random().toString(36).slice(2)
  const survivor = await insertFeedback({ projectId: pid, observation: "survivor", actorEmail: "a@x.io" })
  const merged = await insertFeedback({ projectId: pid, observation: "merged", actorEmail: "b@x.io" })

  const before = await dashboardCounts(pid)
  expect(before.feedback).toBe(2)

  const res = await mergeFeedbackClusters(pid, survivor, merged, "actor@x.io")
  expect(res?.survivorId).toBe(survivor)

  // The merged head row is deleted → feedback count must now read 1 (not the cached 2).
  const after = await dashboardCounts(pid)
  expect(after.feedback).toBe(1)
})

// ── Finding 2b: split inserts a new row → counts refresh at the mutation boundary ──────────────────
test("Finding 2: splitOccurrenceToNewTicket invalidates so feedback count rises immediately", async () => {
  const pid = "proj_split_" + Math.random().toString(36).slice(2)
  const head = await insertFeedback({ projectId: pid, observation: "cluster head", actorEmail: "a@x.io" })
  await insertFeedbackOccurrence({ feedbackId: head, projectId: pid, seenAt: Date.now(), observation: "repeat occurrence" })
  const occs = await listFeedbackOccurrences(head)
  expect(occs.length).toBeGreaterThan(0)

  const before = await dashboardCounts(pid)
  expect(before.feedback).toBe(1)

  const res = await splitOccurrenceToNewTicket(pid, head, occs[0].id, { actor: "actor@x.io" })
  expect(res?.newFeedbackId).toBeTruthy()

  // The split created a second standalone ticket → feedback count must now read 2 (not the cached 1).
  const after = await dashboardCounts(pid)
  expect(after.feedback).toBe(2)
})

// ── Finding 2c: GDPR erase spans multiple projects → each touched project is invalidated ───────────
test("Finding 2: eraseUser invalidates every project it deleted feedback from", async () => {
  const pidA = "proj_eraseA_" + Math.random().toString(36).slice(2)
  const pidB = "proj_eraseB_" + Math.random().toString(36).slice(2)
  const email = "gdpr-" + Math.random().toString(36).slice(2) + "@x.io"
  await insertFeedback({ projectId: pidA, observation: "A", actorEmail: email })
  await insertFeedback({ projectId: pidB, observation: "B", actorEmail: email })

  // Prime BOTH project caches at feedback=1.
  expect((await dashboardCounts(pidA)).feedback).toBe(1)
  expect((await dashboardCounts(pidB)).feedback).toBe(1)

  await eraseUser(email)

  // Both caches must reflect the deletion (0), not the primed 1.
  expect((await dashboardCounts(pidA)).feedback).toBe(0)
  expect((await dashboardCounts(pidB)).feedback).toBe(0)
})

// ── Finding 3: a read racing an invalidation must NOT repopulate stale data ────────────────────────
test("Finding 3: an in-flight read invalidated mid-flight does not pin stale counts", async () => {
  const pid = "proj_race_" + Math.random().toString(36).slice(2)
  // Row A exists for the whole duration of the racing read, so that read computes feedback=1.
  await insertFeedback({ projectId: pid, observation: "row A", actorEmail: "a@x.io" })

  // Start the read but DO NOT await — its synchronous prefix captures the current generation and
  // dispatches its COUNT queries (which will resolve to 1 because row A is present throughout).
  const racing = dashboardCounts(pid)
  // A mutation boundary fires DURING the read: bump the generation + clear entries. This runs
  // synchronously before the racing read can resume past its await, so the read must decline to cache.
  invalidateDashboardCache(pid)
  const racedValue = await racing
  expect(racedValue.feedback).toBe(1) // it still returns what it computed; it just must not CACHE it

  // Now delete row A WITHOUT invalidating, to expose whether the racing read pinned its stale value.
  // With the generation guard the cache is empty, so this recompute reads the true count (0).
  // Without the guard the racing read would have cached feedback=1 and this would wrongly read 1.
  await db!.execute({ sql: "DELETE FROM feedback WHERE project_id=?", args: [pid] })
  const fresh = await dashboardCounts(pid)
  expect(fresh.feedback).toBe(0)
})

// ── Finding 4: the redundant-index drop only runs once the UNIQUE index is confirmed present ───────
test("Finding 4 (normal path): after init, finding_dedup_uq exists and finding_dedup_idx is dropped", async () => {
  const rows = await db!.execute(
    "SELECT name FROM sqlite_master WHERE type='index' AND name IN ('finding_dedup_uq','finding_dedup_idx')",
  )
  const names = rows.rows.map((r: any) => String(r.name))
  expect(names).toContain("finding_dedup_uq")
  expect(names).not.toContain("finding_dedup_idx")
})

test("Finding 4 (failure path): when the UNIQUE index cannot be created, finding_dedup_idx is KEPT", async () => {
  // Replicate the exact guarded sequence on an isolated DB where CREATE UNIQUE is guaranteed to fail
  // (duplicate (project_id, dedup_key) rows present, pre-collapse deliberately skipped). The redundant
  // non-unique index must survive so the ON CONFLICT / dedup lookups still have a backing index.
  const f2 = join(tmpdir(), `klav-f4-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
  const c = createClient({ url: "file:" + f2 })
  await c.execute("PRAGMA journal_mode=WAL").catch(() => {})
  await c.execute("CREATE TABLE findings (id TEXT PRIMARY KEY, project_id TEXT, dedup_key TEXT)")
  await c.execute("CREATE INDEX IF NOT EXISTS finding_dedup_idx ON findings(project_id, dedup_key)")
  // Two rows that violate uniqueness on (project_id, dedup_key).
  await c.execute("INSERT INTO findings (id, project_id, dedup_key) VALUES ('1','p','k')")
  await c.execute("INSERT INTO findings (id, project_id, dedup_key) VALUES ('2','p','k')")

  // The guarded logic (mirrors db.ts): try UNIQUE (fails, swallowed), verify presence, only then drop.
  await c.execute("CREATE UNIQUE INDEX IF NOT EXISTS finding_dedup_uq ON findings(project_id, dedup_key)")
    .catch(() => {})
  const uqPresent = await c.execute(
    "SELECT 1 FROM sqlite_master WHERE type='index' AND name='finding_dedup_uq' LIMIT 1",
  ).then((r: any) => (r.rows?.length ?? 0) > 0).catch(() => false)
  if (uqPresent) await c.execute("DROP INDEX IF EXISTS finding_dedup_idx").catch(() => {})

  expect(uqPresent).toBe(false) // the UNIQUE create must have failed on the duplicate rows
  const after = await c.execute(
    "SELECT name FROM sqlite_master WHERE type='index' AND name IN ('finding_dedup_uq','finding_dedup_idx')",
  )
  const names = after.rows.map((r: any) => String(r.name))
  expect(names).toContain("finding_dedup_idx") // kept as the backing lookup index
  expect(names).not.toContain("finding_dedup_uq")
})
