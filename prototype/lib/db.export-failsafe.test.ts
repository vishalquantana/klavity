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
