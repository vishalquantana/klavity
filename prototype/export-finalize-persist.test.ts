// KLA-718 — "no lost report" / persist-first invariant.
//
// Ground truth: a support-mode widget report to a project with an auto_copy Plane connector produced an
// external Plane ticket, but the report was left invisible on Klavity's Tickets board. The confirmed
// mechanism: an autofiled human Snap whose FIRST export attempt fails is queued to the export_outbox; when
// a later sweep succeeds it creates the external ticket, but the retry sweep only wrote the tracker key and
// NEVER advanced the feedback row out of 'new'. So the row stayed in the triage inbox at status='new' —
// filed to Plane, yet looking untriaged/lost on our board.
//
// finalizeSuccessfulExport() is the shared finalization (used by BOTH the inline auto-copy success path and
// the export-outbox retry sweep) that makes a successfully-filed report (1) carry its Plane key and
// (2) leave 'New Reports' for the Tickets board. This suite is the NEGATIVE CONTROL: the first test
// reproduces the pre-fix behavior (tracker writeback only → row STRANDED at 'new') and then asserts the
// fix flips the outcome to 'open'. Against the unfixed sweep (no advance) the "row becomes visible" branch
// fails; with finalizeSuccessfulExport it passes.
//
// In-process against a temp libSQL file DB (no server spawn), mirroring export-outbox-concurrency.test.ts.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB = join(tmpdir(), `klav-export-finalize-${RUN}.db`)
function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB + s) } catch {} } }
rmDb()

process.env.TURSO_DATABASE_URL = "file:" + DB
process.env.TURSO_AUTH_TOKEN = ""

const db = await import("./lib/db")
const { finalizeSuccessfulExport } = await import("./lib/export-finalize")

const PROJ = "proj_finalize_" + RUN

beforeAll(async () => { await db.initDb() })
afterAll(() => { rmDb() })

// Insert a freshly-submitted, autofiled HUMAN Snap: untrusted/anon intake is pinned to status='new'
// (forceNewStatus), i.e. it starts life in the triage inbox exactly as a support-mode widget report does.
async function insertAutofiledSnap(observation: string): Promise<string> {
  return db.insertFeedback({
    projectId: PROJ,
    observation,
    source: "widget",
    reportType: "bug",
    priority: null,        // no priority → would-be 'new' anyway…
    forceNewStatus: true,  // …and untrusted anon intake pins it to 'new' regardless.
  })
}

test("NEGATIVE CONTROL: pre-fix retry (tracker writeback only) strands the report at 'new'", async () => {
  const fid = await insertAutofiledSnap("stranded report — Testinggg")
  // Sanity: the report IS persisted and sitting in the triage inbox.
  let row = await db.feedbackById(PROJ, fid)
  expect(row).not.toBeNull()
  expect(row.status).toBe("new")

  // Reproduce the OLD sweep's success bookkeeping: it stamped the Plane key but did NOT advance status.
  await db.updateFeedbackTracker(fid, "TRACQ-3906", "https://plane.example/TRACQ-3906")

  row = await db.feedbackById(PROJ, fid)
  // BUG: filed to Plane, but still 'new' → invisible on the Tickets board (the "you lost my report" failure).
  expect(row.planeIssueKey).toBe("TRACQ-3906")
  expect(row.status).toBe("new")

  // THE FIX: finalizeSuccessfulExport advances the row so it is no longer stranded.
  await finalizeSuccessfulExport({
    feedbackId: fid, projectId: PROJ,
    connectorType: "plane", externalKey: "TRACQ-3906", externalUrl: "https://plane.example/TRACQ-3906",
    hasExistingTrackerKey: true, // key already stamped above
  })
  row = await db.feedbackById(PROJ, fid)
  expect(row.status).toBe("open")           // now visible on the Tickets board
  expect(row.planeIssueKey).toBe("TRACQ-3906")
})

test("finalizeSuccessfulExport stamps the Plane key AND advances 'new'→'open' in one step", async () => {
  const fid = await insertAutofiledSnap("first-try-on-retry report")
  let row = await db.feedbackById(PROJ, fid)
  expect(row.status).toBe("new")
  expect(row.planeIssueKey).toBeNull()

  await finalizeSuccessfulExport({
    feedbackId: fid, projectId: PROJ,
    connectorType: "plane", externalKey: "TRACQ-4200", externalUrl: "https://plane.example/TRACQ-4200",
    hasExistingTrackerKey: false, // no key yet → writeback fires
  })

  row = await db.feedbackById(PROJ, fid)
  expect(row.planeIssueKey).toBe("TRACQ-4200")
  expect(row.status).toBe("open")
})

test("idempotent + never downgrades: a manual-export row already 'open' is left untouched", async () => {
  const fid = await insertAutofiledSnap("already-open report")
  // Simulate triage-accept having already opened the row (manual-export-origin outbox rows are like this).
  await db.updateFeedbackMeta(PROJ, fid, { status: "in_progress" })
  let row = await db.feedbackById(PROJ, fid)
  expect(row.status).toBe("in_progress")

  await finalizeSuccessfulExport({
    feedbackId: fid, projectId: PROJ,
    connectorType: "jira", externalKey: "PROJ-1", externalUrl: null, hasExistingTrackerKey: false,
  })

  row = await db.feedbackById(PROJ, fid)
  // advanceFeedbackToOpenIfNew is WHERE status='new' → an in_progress row is NOT downgraded to 'open'.
  expect(row.status).toBe("in_progress")
  // A non-plane connector never overwrites the primary Plane tracker key.
  expect(row.planeIssueKey).toBeNull()
})

test("best-effort: a failing status-advance dep is swallowed (a filed ticket never becomes an error)", async () => {
  const fid = await insertAutofiledSnap("dep-failure report")
  let threw = false
  await finalizeSuccessfulExport(
    { feedbackId: fid, projectId: PROJ, connectorType: "plane", externalKey: "X-1", externalUrl: null, hasExistingTrackerKey: true },
    {
      updateFeedbackTracker: (async () => { throw new Error("tracker down") }) as any,
      advanceFeedbackToOpenIfNew: (async () => { throw new Error("db down") }) as any,
    },
  ).catch(() => { threw = true })
  expect(threw).toBe(false) // never throws — bookkeeping failure is logged, not propagated
})
