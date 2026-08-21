import { test, expect } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-triage-rec-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { db, applySchema, migrateV2, insertFeedback, bumpFeedbackRecurrence, feedbackById } = await import("./db")
await applySchema(db!)
await migrateV2(db!)

const P = `proj_rec_${Date.now()}`

// #534 recurrence hardening (Codex re-review): promotion now requires the caller to vouch for TRUSTED,
// non-quarantined provenance via { allowPromote: true }. A trusted recurring report still advances at the
// count≥3 threshold.
test("a 'new' item with TRUSTED provenance is promoted to 'open' when recurrence reaches 3", async () => {
  const id = await insertFeedback({ projectId: P, observation: "low sev recurring", priority: "low", issueKey: "rk1" })
  expect((await feedbackById(P, id)).status).toBe("new")
  await bumpFeedbackRecurrence(id, 1, { allowPromote: true })   // count 2, still new
  expect((await feedbackById(P, id)).status).toBe("new")
  await bumpFeedbackRecurrence(id, 2, { allowPromote: true })   // count 3 -> promote
  expect((await feedbackById(P, id)).status).toBe("open")
})

// #534 recurrence hardening: an UNTRUSTED recurrence (no allowPromote — anonymous/cross-origin) must NOT
// auto-advance onto the board even at the threshold; it stays 'new' for human triage.
test("an UNTRUSTED 'new' item is NOT promoted by recurrence (stays 'new' for triage)", async () => {
  const id = await insertFeedback({ projectId: P, observation: "anon recurring", priority: "low", issueKey: "rk1b" })
  await bumpFeedbackRecurrence(id, 1)                 // default: allowPromote absent → untrusted
  await bumpFeedbackRecurrence(id, 2)                 // count 3, but untrusted
  expect((await feedbackById(P, id)).status).toBe("new")
})

// #534 recurrence hardening: a quarantined source (studio-demo / any NON_HUMAN source) is NEVER promoted,
// even when the caller mis-vouches with allowPromote — the head-row source guard blocks it.
test("a quarantined (studio-demo) 'new' item is NEVER promoted by recurrence", async () => {
  const id = await insertFeedback({ projectId: P, observation: "demo recurring", priority: "low", issueKey: "rk1c", source: "studio-demo" })
  await bumpFeedbackRecurrence(id, 1, { allowPromote: true })
  await bumpFeedbackRecurrence(id, 2, { allowPromote: true })   // count 3, but quarantined head
  expect((await feedbackById(P, id)).status).toBe("new")
})

// #544 follow-up (Codex re-review): the head-source quarantine guard must cover EVERY non-human marker,
// not just studio-demo. A head created with source='autosim' (or any NON_HUMAN_FEEDBACK_SOURCES marker)
// must NOT be promoted even when 3 TRUSTED (authenticated-member) recurrences vouch with allowPromote —
// otherwise a non-studio quarantine head could be laundered onto the board.
test("a head with source='autosim' is NEVER promoted by trusted recurrences (Fix 2 laundering guard)", async () => {
  const id = await insertFeedback({ projectId: P, observation: "autosim recurring", priority: "low", issueKey: "rk3", source: "autosim" })
  expect((await feedbackById(P, id)).status).toBe("new")
  await bumpFeedbackRecurrence(id, 1, { allowPromote: true })
  await bumpFeedbackRecurrence(id, 2, { allowPromote: true })   // count 3, trusted vouch, but quarantined head
  expect((await feedbackById(P, id)).status).toBe("new")
})

// #544 follow-up: a 'sim'-marked head is equally protected (belt for the whole NON_HUMAN set).
test("a head with source='sim' is NEVER promoted by trusted recurrences", async () => {
  const id = await insertFeedback({ projectId: P, observation: "sim recurring", priority: "low", issueKey: "rk4", source: "sim" })
  await bumpFeedbackRecurrence(id, 1, { allowPromote: true })
  await bumpFeedbackRecurrence(id, 2, { allowPromote: true })
  expect((await feedbackById(P, id)).status).toBe("new")
})

test("recurrence never resurrects a dismissed item", async () => {
  const id = await insertFeedback({ projectId: P, observation: "dismissed recurring", priority: "low", issueKey: "rk2" })
  // simulate a triage dismiss
  await db!.execute({ sql: "UPDATE feedback SET status='dismissed' WHERE id=?", args: [id] })
  await bumpFeedbackRecurrence(id, 1)
  await bumpFeedbackRecurrence(id, 2)   // count 3, but dismissed
  expect((await feedbackById(P, id)).status).toBe("dismissed")
})
