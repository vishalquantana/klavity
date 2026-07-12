// JTBD 3.10 (triage hygiene): Studio drafts must route through the SAME issueKey/fuzzy dedup as
// review findings, so saving the same finding twice bumps recurrence instead of inserting a second
// row. Studio drafts POST /api/feedback WITHOUT a suggested_bug (just observation text), so they
// take the human-report dedup branch: humanReportIssueKeyFor → findFeedbackByIssueKey (exact key)
// → bumpFeedbackRecurrence, else insertFeedback. This test mirrors that branch directly against a
// temp DB (same in-process harness as server.triage-list.test.ts / server.dedup.test.ts) rather
// than driving HTTP, so we can assert on the persisted row without a live server.

import { test, expect } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-studio-dedup-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const {
  db, applySchema, migrateV2,
  insertFeedback, feedbackById,
  findFeedbackByIssueKey, listRecentFeedbackForDedup, bumpFeedbackRecurrence,
} = await import("./lib/db")
const { humanReportIssueKeyFor, chooseDedup } = await import("./lib/dedup")

await applySchema(db!)
await migrateV2(db!)

const P = `proj_studio_dedup_${Date.now()}`

// Mirrors the /api/feedback human-report dedup branch (server.ts): exact issueKey match wins,
// else best fuzzy match ≥ threshold over recent rows.
async function fileStudioDraft(args: { observation: string; urlPath: string; simId?: string }): Promise<string> {
  const issueKey = humanReportIssueKeyFor({ projectId: P, urlPath: args.urlPath, text: args.observation })
  const exact = await findFeedbackByIssueKey(P, issueKey)
  const recent = exact ? [] : await listRecentFeedbackForDedup(P, 50)
  const dedupedInto = chooseDedup(
    { title: args.observation.slice(0, 120), observation: args.observation },
    exact,
    recent,
  )
  if (dedupedInto) {
    await bumpFeedbackRecurrence(dedupedInto, Date.now())
    return dedupedInto
  }
  return insertFeedback({
    projectId: P,
    simId: args.simId ?? null,
    urlPath: args.urlPath,
    observation: args.observation,
    // Studio drafts with no suggested_bug are low priority → stay 'new' (needs triage), matching
    // the human-report path in the feedback endpoint.
    priority: "low",
    issueKey,
  })
}

test("same Studio finding saved twice → one feedback row, recurrence bumped to 2", async () => {
  const first = await fileStudioDraft({
    observation: "The date picker resets to today after I pick a range.",
    urlPath: "/reports",
    simId: "sim_finance",
  })
  const second = await fileStudioDraft({
    observation: "The date picker resets to today after I pick a range.",
    urlPath: "/reports",
    simId: "sim_finance",
  })
  expect(second).toBe(first) // collapsed into the same row, not a new one
  const row = await feedbackById(P, first)
  expect(row).not.toBeNull()
  expect(row.recurrenceCount ?? row.recurrence_count).toBe(2)
})

test("volatile ids/numbers/timestamps in the finding text still dedup (normalized key)", async () => {
  const a = await fileStudioDraft({
    observation: "Order 10231 failed to export at 2026-07-12T09:15:00Z.",
    urlPath: "/exports",
  })
  const b = await fileStudioDraft({
    // Different concrete order id + timestamp, same underlying finding.
    observation: "Order 99887 failed to export at 2026-07-12T14:42:11Z.",
    urlPath: "/exports",
  })
  expect(b).toBe(a)
  const row = await feedbackById(P, a)
  expect(row.recurrenceCount ?? row.recurrence_count).toBe(2)
})

test("a genuinely different finding on the same page → a new row", async () => {
  const a = await fileStudioDraft({
    observation: "Export button is greyed out with no tooltip.",
    urlPath: "/settings",
  })
  const b = await fileStudioDraft({
    observation: "Timezone dropdown is empty on first load.",
    urlPath: "/settings",
  })
  expect(b).not.toBe(a)
})
