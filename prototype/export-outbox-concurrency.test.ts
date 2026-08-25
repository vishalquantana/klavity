// P2 (QA): duplicate ticket exports. runExportOutboxSweep runs every 60s but a single slow sweep (a
// timing-out tracker × up to 25 rows) can exceed 60s, so two sweeps overlap and both listDueExportOutbox
// the SAME pending row. This file proves the two guards that make that safe:
//   (b) atomic row-claim — only ONE of two concurrent claims of a row wins, so only one createIssue /
//       addTicketExport ever fires for a given outbox row.
//   release-on-failure — a claimed-but-failed row is returned to 'pending' (never stranded in_flight).
//   P3 — two concurrent enqueues of the same (feedback,connector) leave exactly ONE pending row.
// In-process against a temp libSQL file DB (no server spawn), mirroring cost-events.test.ts.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB = join(tmpdir(), `klav-outbox-conc-${RUN}.db`)
function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB + s) } catch {} } }
rmDb()

process.env.TURSO_DATABASE_URL = "file:" + DB
process.env.TURSO_AUTH_TOKEN = ""

const db = await import("./lib/db")

// Unique ids so rows never collide with other in-process db tests sharing the db module singleton.
const PROJ = "proj_conc_" + RUN
const CONN = "conn_conc_" + RUN
const FB = "fb_conc_" + RUN

beforeAll(async () => { await db.initDb() })
afterAll(() => { rmDb() })

test("atomic claim: two overlapping sweeps claim the same row — only one wins", async () => {
  const id = await db.enqueueExportOutbox({ feedbackId: FB, projectId: PROJ, connectorId: CONN, type: "jira", nextAttemptAt: Date.now() - 1000 })

  // Both "sweeps" list the row as due (pending) — this is exactly the overlap window.
  const dueA = await db.listDueExportOutbox(25)
  const dueB = await db.listDueExportOutbox(25)
  expect(dueA.some((r) => r.id === id)).toBe(true)
  expect(dueB.some((r) => r.id === id)).toBe(true)

  // Both attempt to claim it before either createIssue runs. Exactly one claim may succeed; the loser
  // gets false and `continue`s in the sweep — so exactly one createIssue/addTicketExport fires.
  const [claimA, claimB] = await Promise.all([
    db.markExportOutboxInFlight(id),
    db.markExportOutboxInFlight(id),
  ])
  expect([claimA, claimB].filter(Boolean).length).toBe(1)

  // A third claim (a later sweep) also loses — the row is no longer 'pending'.
  expect(await db.markExportOutboxInFlight(id)).toBe(false)
})

test("release-on-failure: a claimed row whose createIssue throws returns to 'pending'", async () => {
  const fid = FB + "_rel"
  const id = await db.enqueueExportOutbox({ feedbackId: fid, projectId: PROJ, connectorId: CONN, type: "jira", nextAttemptAt: Date.now() - 1000 })
  expect(await db.markExportOutboxInFlight(id)).toBe(true) // claimed → in_flight

  // Sweep's catch-path on a createIssue throw: bump releases the row back to pending (with backoff) so a
  // later sweep retries it — a throw means no external issue was created, so no strand + no dup.
  const after = await db.bumpExportOutboxAttempt(id, "tracker 503", { now: Date.now() })
  expect(after?.status).toBe("pending")
  expect(after?.attempts).toBe(1)
  // It's now re-claimable (not permanently stranded in_flight).
  const nextNow = (after?.nextAttemptAt ?? 0) + 1
  const due = await db.listDueExportOutbox(25, nextNow)
  expect(due.some((r) => r.id === id)).toBe(true)
})

test("P3 enqueue dedup: concurrent enqueues of the same (feedback,connector) leave one pending row", async () => {
  const fid = FB + "_dedup"
  const [a, b, c] = await Promise.all([
    db.enqueueExportOutbox({ feedbackId: fid, projectId: PROJ, connectorId: CONN, type: "jira" }),
    db.enqueueExportOutbox({ feedbackId: fid, projectId: PROJ, connectorId: CONN, type: "jira" }),
    db.enqueueExportOutbox({ feedbackId: fid, projectId: PROJ, connectorId: CONN, type: "jira" }),
  ])
  // All calls resolve to the SAME winning row id (idempotent) — none dropped, none duplicated.
  expect(a).toBe(b)
  expect(b).toBe(c)

  const rows = await db.listExportOutboxForProject(PROJ)
  const pending = rows.filter((r) => r.feedbackId === fid && r.status === "pending")
  expect(pending.length).toBe(1)
})
