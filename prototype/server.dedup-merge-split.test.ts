// A.10 merge/split dedup overrides: an operator can MERGE two tickets the matcher missed (preserving
// recurrence counts + every reporter email) and SPLIT a wrongly-collapsed occurrence into its own
// standalone ticket (carrying that occurrence's date/evidence/email), and a split pair must not be
// re-merged by the next intake dedup pass. Mirrors the subprocess-free temp-DB harness of
// server.occurrence-receipts.test.ts: exercises the db + dedup helpers directly rather than over HTTP.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  reconnectDb, applySchema, insertFeedback, feedbackById, bumpFeedbackRecurrence,
  insertFeedbackOccurrence, listFeedbackOccurrences,
  mergeFeedbackClusters, splitOccurrenceToNewTicket, addDedupExclusion, excludedDedupIds,
  findFeedbackByIssueKey, listRecentFeedbackForDedup,
  insertTicketComment, listTicketComments, listFeedback,
} from "./lib/db"
import { buildRecurrenceMemory } from "./lib/recurrence-memory"
import { issueKeyFor, humanReportIssueKeyFor, chooseDedup } from "./lib/dedup"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const dbFile = join(tmpdir(), `klav-mergesplit-${ts}.db`)
const rawClient = createClient({ url: "file:" + dbFile })
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

const NOW = Date.now()
const P = `proj_ms_${ts}`

beforeAll(async () => {
  reconnectDb("file:" + dbFile)
  const c = createClient({ url: "file:" + dbFile })
  await applySchema(c)
  c.close()
  await rawExec(
    `CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  )
  await rawExec(`INSERT OR IGNORE INTO projects (id, account_id, name, created_at, updated_at) VALUES (?,?,?,?,?)`, [P, "acct_test", "Merge/Split Project", NOW, NOW])
})

afterAll(() => { rawClient.close() })

function keyFor(urlPath: string, trait: string): string {
  return issueKeyFor({ projectId: P, urlPath, issueType: "flow", citedTraitIds: [trait] })
}

test("merge sums recurrence counts and unions every reporter email across the surviving cluster", async () => {
  // Survivor cluster: original + one deduped repeat (count 2), with a reporter email on the repeat.
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/pay", observation: "payment declined with no error",
    suggestedBug: { title: "Pay declines", body: "b", priority: "high" },
    issueKey: keyFor("/pay", "TA"),
  })
  await rawExec(`UPDATE feedback SET contact_email=? WHERE id=?`, ["alice@example.com", survivor])
  const s2 = NOW + 1 * 86_400_000
  await bumpFeedbackRecurrence(survivor, s2)
  await insertFeedbackOccurrence({ feedbackId: survivor, projectId: P, seenAt: s2, observation: "pay still fails", reporterEmail: "bob@example.com" })

  // A separate cluster the matcher missed (different wording/key), also count 2, different reporter.
  const missed = await insertFeedback({
    projectId: P, urlPath: "/pay", observation: "checkout hangs forever on submit",
    suggestedBug: { title: "Checkout hangs", body: "b", priority: "high" },
    issueKey: keyFor("/pay", "TB"),
  })
  await rawExec(`UPDATE feedback SET contact_email=? WHERE id=?`, ["carol@example.com", missed])
  const m2 = NOW + 2 * 86_400_000
  await bumpFeedbackRecurrence(missed, m2)
  await insertFeedbackOccurrence({ feedbackId: missed, projectId: P, seenAt: m2, observation: "hangs again", reporterEmail: "dave@example.com" })

  const result = await mergeFeedbackClusters(P, survivor, missed, "op@example.com")
  expect(result).not.toBeNull()
  // Combined recurrence count == sum of both cluster counts.
  expect(result!.recurrenceCount).toBe(4)

  // Survivor row now carries the summed count.
  const survRow = await feedbackById(P, survivor)
  expect(survRow.recurrenceCount).toBe(4)
  expect(survRow.issueKey).toBe(keyFor("/pay", "TA"))   // survivor keeps its key for future intake dedup
  // KLA-780: the merged ticket is NOT deleted — it survives, marked 'merged' with a merged_into pointer
  // to the survivor (non-destructive fold, reversible), so nothing is lost.
  const mergedRow = await feedbackById(P, missed)
  expect(mergedRow).not.toBeNull()
  expect(mergedRow.status).toBe("merged")
  expect(mergedRow.mergedInto).toBe(survivor)

  // Every reporter email (survivor contact + both occurrence reporters + merged contact) is preserved.
  expect(result!.contactEmails.sort()).toEqual(
    ["alice@example.com", "bob@example.com", "carol@example.com", "dave@example.com"].sort(),
  )

  // Recurrence memory reflects the merged cluster: count 4, dates unioned.
  const mem = await buildRecurrenceMemory(rawClient, survivor, P)
  expect(mem!.count).toBe(4)
})

test("split extracts an occurrence into a standalone ticket carrying its date/evidence/email; source count drops", async () => {
  const head = await insertFeedback({
    projectId: P, urlPath: "/search", observation: "search returns no results",
    suggestedBug: { title: "Search empty", body: "b", priority: "medium" },
    issueKey: keyFor("/search", "TS"),
  })
  const t2 = NOW + 3 * 86_400_000
  await bumpFeedbackRecurrence(head, t2)
  const occId = await insertFeedbackOccurrence({
    feedbackId: head, projectId: P, seenAt: t2,
    observation: "actually the FILTER dropdown is broken",   // distinct bug wrongly collapsed in
    screenshotId: "shot_filter", reporterEmail: "erin@example.com",
  })
  // Sanity: head count is 2 before split.
  expect((await feedbackById(P, head)).recurrenceCount).toBe(2)

  const contentKey = humanReportIssueKeyFor({ projectId: P, urlPath: "/search", text: "actually the FILTER dropdown is broken" })
  const result = await splitOccurrenceToNewTicket(P, head, occId, { actor: "op@example.com", issueKey: contentKey })
  expect(result).not.toBeNull()

  // Source cluster count decreased by one.
  expect(result!.sourceRecurrenceCount).toBe(1)
  const headAfter = await feedbackById(P, head)
  expect(headAfter.recurrenceCount).toBe(1)

  // The standalone ticket carries the occurrence's OWN date, evidence and reporter email.
  const child = await feedbackById(P, result!.newFeedbackId)
  expect(child.observation).toBe("actually the FILTER dropdown is broken")
  expect(child.screenshotId).toBe("shot_filter")
  expect(child.contactEmail).toBe("erin@example.com")
  expect(child.createdAt).toBe(t2)
  expect(child.issueKey).toBe(contentKey)

  // The occurrence no longer belongs to the source head.
  const remaining = await listFeedbackOccurrences(head)
  expect(remaining.find((o) => o.id === occId)).toBeUndefined()
})

test("a split pair is not re-merged by the next intake dedup pass", async () => {
  const head = await insertFeedback({
    projectId: P, urlPath: "/login", observation: "cannot log in at all",
    suggestedBug: { title: "Login broken", body: "b", priority: "high" },
    issueKey: keyFor("/login", "TL"),
  })
  const t2 = NOW + 4 * 86_400_000
  await bumpFeedbackRecurrence(head, t2)
  const occId = await insertFeedbackOccurrence({
    feedbackId: head, projectId: P, seenAt: t2,
    observation: "password reset email never arrives", reporterEmail: "frank@example.com",
  })
  const contentKey = humanReportIssueKeyFor({ projectId: P, urlPath: "/login", text: "password reset email never arrives" })
  const result = await splitOccurrenceToNewTicket(P, head, occId, { actor: "op@example.com", issueKey: contentKey })
  expect(result).not.toBeNull()
  const childId = result!.newFeedbackId

  // The manual split recorded a dedup exclusion between the head and the new standalone ticket.
  const excluded = await excludedDedupIds(P, head)
  expect(excluded.has(childId)).toBe(true)

  // Simulate the intake dedup decision for the SAME split-out content. Its exact issue_key now resolves
  // to the standalone ticket (which owns that content key) — NOT the head. So the repeat lands on the
  // child, honouring the split, instead of re-collapsing into the head.
  const exact = await findFeedbackByIssueKey(P, contentKey)
  expect(exact).not.toBeNull()
  expect(exact!.id).toBe(childId)
  const recent = await listRecentFeedbackForDedup(P, 50)
  const decision = chooseDedup(
    { title: "password reset email never arrives", observation: "password reset email never arrives" },
    exact, recent, 0.82,
  )
  // The next intake pass routes this repeat to the split-out ticket, NOT back into the head.
  expect(decision).toBe(childId)
  expect(decision).not.toBe(head)

  // Separately, excludeIds is the lexical-fallback safety net: an excluded target is skipped by
  // chooseDedup even when its wording would otherwise clear the similarity threshold.
  const recentWithHead = [{ id: head, title: "cannot log in at all", observation: "password reset email never arrives" }]
  // Without the exclusion, the head is a strong lexical match at a low threshold.
  expect(chooseDedup(
    { title: "password reset email never arrives", observation: "password reset email never arrives" },
    null, recentWithHead, 0.5,
  )).toBe(head)
  // With the head excluded, chooseDedup refuses to collapse into it.
  expect(chooseDedup(
    { title: "password reset email never arrives", observation: "password reset email never arrives" },
    null, recentWithHead, 0.5, new Set([head]),
  )).toBeNull()
})

test("addDedupExclusion is order-independent (either side lookup hits)", async () => {
  const a = "fb_excl_a_" + ts
  const b = "fb_excl_b_" + ts
  await addDedupExclusion(P, a, b, { reason: "manual-split", createdBy: "op@example.com" })
  expect((await excludedDedupIds(P, a)).has(b)).toBe(true)
  expect((await excludedDedupIds(P, b)).has(a)).toBe(true)
})

// KLA-780: merging must FOLD one ticket into another, never DESTROY it. These tests pin the
// non-destructive contract: comments/occurrences absorbed onto the survivor, the merged row marked
// (not deleted) so the fold is reversible, hidden from the board + dedup, and idempotent on re-run.
test("KLA-780: merge re-homes the merged ticket's comments onto the survivor (no comment loss)", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/reports", observation: "report export fails",
    suggestedBug: { title: "Export fails", body: "b", priority: "high" }, issueKey: keyFor("/reports", "CA"),
  })
  const doomed = await insertFeedback({
    projectId: P, urlPath: "/reports", observation: "download button does nothing",
    suggestedBug: { title: "Download dead", body: "b", priority: "high" }, issueKey: keyFor("/reports", "CB"),
  })
  await insertTicketComment(survivor, "op@example.com", "looking into the export path")
  await insertTicketComment(doomed, "carol@example.com", "same for me on Safari")
  await insertTicketComment(doomed, "op@example.com", "repro'd, tracking here")

  const result = await mergeFeedbackClusters(P, survivor, doomed, "op@example.com")
  expect(result).not.toBeNull()

  // Both of the merged ticket's comments now live on the survivor (survivor had 1, gains 2 → 3), in order.
  const survComments = await listTicketComments(survivor)
  expect(survComments.length).toBe(3)
  const bodies = survComments.map((c) => c.body)
  expect(bodies).toContain("same for me on Safari")
  expect(bodies).toContain("repro'd, tracking here")
  // The merged row keeps none of its own comments (they moved to the survivor) and is not deleted.
  expect(await listTicketComments(doomed)).toHaveLength(0)
  const doomedRow = await feedbackById(P, doomed)
  expect(doomedRow).not.toBeNull()
  expect(doomedRow.mergedInto).toBe(survivor)
})

test("KLA-780: a merged ticket is hidden from the board list and never a dedup target", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/nav", observation: "nav menu overlaps content",
    suggestedBug: { title: "Nav overlap", body: "b", priority: "medium" }, issueKey: keyFor("/nav", "DA"),
  })
  const dupKey = keyFor("/nav", "DB")
  const dup = await insertFeedback({
    projectId: P, urlPath: "/nav", observation: "menu covers the page on mobile",
    suggestedBug: { title: "Menu covers page", body: "b", priority: "medium" }, issueKey: dupKey,
  })
  // Before merge, the dup's exact key resolves to itself.
  expect((await findFeedbackByIssueKey(P, dupKey))?.id).toBe(dup)

  await mergeFeedbackClusters(P, survivor, dup, "op@example.com")

  // The merged row no longer appears on the board list…
  const boardIds = (await listFeedback(P, { limit: 500 })).map((f) => f.id)
  expect(boardIds).toContain(survivor)
  expect(boardIds).not.toContain(dup)
  // …and a repeat report on its exact key must NOT re-collapse onto the dead ticket.
  expect(await findFeedbackByIssueKey(P, dupKey)).toBeNull()
  const recentIds = (await listRecentFeedbackForDedup(P, 500)).map((r) => r.id)
  expect(recentIds).not.toContain(dup)
})

test("KLA-780: merge is idempotent and refuses self-merge", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/cart", observation: "cart total wrong",
    suggestedBug: { title: "Cart total", body: "b", priority: "high" }, issueKey: keyFor("/cart", "EA"),
  })
  const other = await insertFeedback({
    projectId: P, urlPath: "/cart", observation: "quantity resets to 1",
    suggestedBug: { title: "Qty resets", body: "b", priority: "high" }, issueKey: keyFor("/cart", "EB"),
  })
  await bumpFeedbackRecurrence(other, NOW + 86_400_000) // other = count 2

  const first = await mergeFeedbackClusters(P, survivor, other, "op@example.com")
  expect(first!.recurrenceCount).toBe(3) // 1 (survivor) + 2 (other)
  const afterFirst = (await feedbackById(P, survivor)).recurrenceCount

  // Re-running the SAME merge must not double-absorb — survivor count is unchanged.
  const second = await mergeFeedbackClusters(P, survivor, other, "op@example.com")
  expect(second).not.toBeNull()
  expect((await feedbackById(P, survivor)).recurrenceCount).toBe(afterFirst)

  // A ticket can never be merged into itself.
  expect(await mergeFeedbackClusters(P, survivor, survivor, "op@example.com")).toBeNull()
})
