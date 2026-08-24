// KLA-551 (connector export failsafe) DB layer: pending-mappings queue + attention flag on the
// connector row, and the retryable export_outbox. Hermetic — own local libsql file (matches
// db.connectors.test.ts).
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-failsafe-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const {
  reconnectDb, applySchema, migrateV2,
  createConnector, getConnectorById,
  recordConnectorPendingMappings, clearConnectorPendingMapping,
  enqueueExportOutbox, listDueExportOutbox, listExportOutboxForProject,
  markExportOutboxDone, bumpExportOutboxAttempt,
  markExportOutboxInFlight, listStaleInFlightExportOutbox, markExportOutboxNeedsReview,
  pauseExportOutbox, resumePausedExportOutbox,
  addTicketExport, findPriorSuccessfulExport,
} = await import("./db")

let db: any
beforeAll(async () => {
  db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

async function seedConnector(project = "proj_fs"): Promise<string> {
  return await createConnector(project, {
    type: "jira", name: "Jira", config: { host: "https://x", project_key: "P" }, autoCopy: false, createdBy: "a@b.c",
  })
}

test("recordConnectorPendingMappings persists queue, raises needs_attention, firstEver only once", async () => {
  const cid = await seedConnector()
  const first = await recordConnectorPendingMappings(cid, [{ field: "state", requested_name: "Done" }], "fb1")
  expect(first.firstEver).toBe(true)
  const c1 = await getConnectorById("proj_fs", cid)
  expect(c1?.needsAttention).toBe(true)
  expect(c1?.pendingMappings).toEqual([
    { field: "state", requested_name: "Done", first_seen: expect.any(Number), count: 1, sample_finding_id: "fb1" },
  ])

  // Second time — not firstEver; same entry bumps count (deduped).
  const second = await recordConnectorPendingMappings(cid, [{ field: "state", requested_name: "Done" }], "fb2")
  expect(second.firstEver).toBe(false)
  const c2 = await getConnectorById("proj_fs", cid)
  expect(c2?.pendingMappings.length).toBe(1)
  expect(c2?.pendingMappings[0].count).toBe(2)
})

test("clearConnectorPendingMapping removes an entry and clears the flag when empty", async () => {
  const cid = await seedConnector()
  await recordConnectorPendingMappings(cid, [{ field: "state", requested_name: "Done" }, { field: "label", requested_name: "Bug" }], "fb1")
  let remaining = await clearConnectorPendingMapping("proj_fs", cid, "state", "done")
  expect(remaining.map((p) => p.requested_name)).toEqual(["Bug"])
  const still = await getConnectorById("proj_fs", cid)
  expect(still?.needsAttention).toBe(true) // one left

  remaining = await clearConnectorPendingMapping("proj_fs", cid, "label", "Bug")
  expect(remaining).toEqual([])
  const cleared = await getConnectorById("proj_fs", cid)
  expect(cleared?.needsAttention).toBe(false)
})

test("export outbox: enqueue is idempotent per (feedback,connector) while pending", async () => {
  const id1 = await enqueueExportOutbox({ feedbackId: "fbX", projectId: "proj_ob", connectorId: "connX", type: "jira", error: "boom", nextAttemptAt: 1 })
  const id2 = await enqueueExportOutbox({ feedbackId: "fbX", projectId: "proj_ob", connectorId: "connX", type: "jira", error: "again", nextAttemptAt: 1 })
  expect(id1).toBe(id2) // same row re-armed, no duplicate
  const proj = await listExportOutboxForProject("proj_ob")
  expect(proj.length).toBe(1)
  expect(proj[0].lastError).toBe("again")
})

test("export outbox: due listing, markDone, and bump→backoff→dead", async () => {
  const id = await enqueueExportOutbox({ feedbackId: "fbY", projectId: "proj_ob2", connectorId: "connY", type: "plane", nextAttemptAt: 1 })
  const due = await listDueExportOutbox(10, Date.now())
  expect(due.some((r) => r.id === id)).toBe(true)

  // Bump increments attempts + arms backoff; not yet dead.
  const after1 = await bumpExportOutboxAttempt(id, "still failing", { maxAttempts: 2 })
  expect(after1?.attempts).toBe(1)
  expect(after1?.status).toBe("pending")
  expect(after1?.nextAttemptAt).toBeGreaterThan(Date.now())

  // Reaching maxAttempts marks it dead (but still visible for a human).
  const after2 = await bumpExportOutboxAttempt(id, "gave up", { maxAttempts: 2 })
  expect(after2?.status).toBe("dead")
  const visible = await listExportOutboxForProject("proj_ob2")
  expect(visible.find((r) => r.id === id)?.status).toBe("dead")

  // markDone removes it from the visible (non-done) list.
  const doneId = await enqueueExportOutbox({ feedbackId: "fbZ", projectId: "proj_ob2", connectorId: "connZ", type: "github", nextAttemptAt: 1 })
  await markExportOutboxDone(doneId)
  const visible2 = await listExportOutboxForProject("proj_ob2")
  expect(visible2.some((r) => r.id === doneId)).toBe(false)
})

// ── KLA-577: never double-file on partial success + don't drop retries on a disabled connector ──

// (a) createIssue SUCCEEDS but the ticket_exports write / process dies before markDone. The row is
// left 'in_flight' (NOT still-pending) so the next sweep can't blindly re-file it. Reconciliation then
// resolves it WITHOUT creating a second external ticket.
test("in_flight marker: a claimed row is invisible to the due-scan (no blind re-file)", async () => {
  const id = await enqueueExportOutbox({ feedbackId: "fbIF1", projectId: "proj_if", connectorId: "connIF", type: "jira", nextAttemptAt: 1 })
  // Sweep claims it right before calling createIssue.
  expect(await markExportOutboxInFlight(id, 1000)).toBe(true)
  // Simulate crash between createIssue-success and the DB write: nothing else happens.
  const due = await listDueExportOutbox(50, Date.now())
  expect(due.some((r) => r.id === id)).toBe(false) // would-be second sweep does NOT pick it up
  // The claim is single-use: a concurrent claimer cannot re-claim an already in_flight row.
  expect(await markExportOutboxInFlight(id, 2000)).toBe(false)
})

test("reconcile: stale in_flight with a prior successful export is retired (write landed late)", async () => {
  const id = await enqueueExportOutbox({ feedbackId: "fbIF2", projectId: "proj_if", connectorId: "connIF2", type: "plane", nextAttemptAt: 1 })
  await markExportOutboxInFlight(id, 1000)
  // The ticket_exports write DID land (crash happened after it, before markDone).
  await addTicketExport({ feedbackId: "fbIF2", projectId: "proj_if", connectorId: "connIF2", type: "plane", externalKey: "PLANE-9", externalUrl: "http://x/9", status: "ok", error: null, createdBy: null })
  const stale = await listStaleInFlightExportOutbox(60_000, 1000 + 120_000)
  expect(stale.some((r) => r.id === id)).toBe(true)
  // Reconcile: prior export exists → retire, DO NOT re-file.
  const prior = await findPriorSuccessfulExport("fbIF2", "connIF2")
  expect(prior?.externalKey).toBe("PLANE-9")
  await markExportOutboxDone(id)
  const visible = await listExportOutboxForProject("proj_if")
  expect(visible.some((r) => r.id === id)).toBe(false)
})

test("reconcile: ambiguous stale in_flight (no prior export) is parked needs_review, never re-filed", async () => {
  const id = await enqueueExportOutbox({ feedbackId: "fbIF3", projectId: "proj_if2", connectorId: "connIF3", type: "github", nextAttemptAt: 1 })
  await markExportOutboxInFlight(id, 1000)
  const stale = await listStaleInFlightExportOutbox(60_000, 1000 + 120_000)
  expect(stale.some((r) => r.id === id)).toBe(true)
  // No prior successful export → we can't prove the tracker didn't get an issue → surface, don't re-file.
  expect(await findPriorSuccessfulExport("fbIF3", "connIF3")).toBeNull()
  await markExportOutboxNeedsReview(id, "stale in_flight — manual review")
  // Parked: visible to the admin, but NOT re-armed to pending (so no sweep ever re-creates it).
  const due = await listDueExportOutbox(50, Date.now())
  expect(due.some((r) => r.id === id)).toBe(false)
  const visible = await listExportOutboxForProject("proj_if2")
  expect(visible.find((r) => r.id === id)?.status).toBe("needs_review")
})

// (b) A merely DISABLED connector must NOT mark its pending exports done — they pause and resume.
test("disabled connector: rows pause (stay visible, off the due-scan) and resume on re-enable", async () => {
  const id = await enqueueExportOutbox({ feedbackId: "fbP1", projectId: "proj_pause", connectorId: "connPause", type: "jira", nextAttemptAt: 1 })
  // Sweep sees connector.enabled === false → pause (NOT markDone).
  await pauseExportOutbox(id, "connector disabled")
  // Off the due-scan while disabled...
  const dueWhilePaused = await listDueExportOutbox(50, Date.now())
  expect(dueWhilePaused.some((r) => r.id === id)).toBe(false)
  // ...but still VISIBLE to the admin (not silently dropped as 'done').
  const visible = await listExportOutboxForProject("proj_pause")
  expect(visible.find((r) => r.id === id)?.status).toBe("paused")

  // Re-enabling the connector re-arms every paused row → retryable again.
  const resumed = await resumePausedExportOutbox("connPause")
  expect(resumed).toBe(1)
  const dueAfter = await listDueExportOutbox(50, Date.now())
  expect(dueAfter.some((r) => r.id === id)).toBe(true)
})
