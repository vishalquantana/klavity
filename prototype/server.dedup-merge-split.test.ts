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
  listTicketsPaginated, resolveFeedbackRef, db,
  updateFeedbackMeta, setFeedbackContactEmail, liveFeedbackId,
} from "./lib/db"
import { buildRecurrenceMemory } from "./lib/recurrence-memory"
import { issueKeyFor, humanReportIssueKeyFor, chooseDedup } from "./lib/dedup"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const dbFile = join(tmpdir(), `klav-mergesplit-${ts}.db`)
const rawClient = createClient({ url: "file:" + dbFile })
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }
// Return the first column of the first row (or null) — for asserting a re-homed feedback_id.
async function rawClientQuery(sql: string, args: any[] = []): Promise<any> {
  const r = await rawClient.execute({ sql, args })
  if (!r.rows.length) return null
  const row = r.rows[0] as any
  const k = Object.keys(row)[0]
  return row[k] != null ? String(row[k]) : null
}

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

// ══ KLA-780 round-2 (codex QA) — the fold must be complete: hidden from EVERY board/aggregate/permalink,
// chain-safe, atomic, and concurrency-safe. One test per finding. ═════════════════════════════════════

test("KLA-780 r2 (C1-1): listTicketsPaginated excludes a merged row even with statuses:['merged']", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/tix", observation: "tickets board survivor", priority: "high",
    suggestedBug: { title: "Board survivor", body: "b", priority: "high" }, issueKey: keyFor("/tix", "PA"),
  })
  const folded = await insertFeedback({
    projectId: P, urlPath: "/tix", observation: "tickets board folded dup", priority: "high",
    suggestedBug: { title: "Board dup", body: "b", priority: "high" }, issueKey: keyFor("/tix", "PB"),
  })
  await mergeFeedbackClusters(P, survivor, folded, "op@example.com")

  // Default list (status != 'new'): survivor present, folded row absent, and it does not inflate total.
  const def = await listTicketsPaginated(P, { limit: 200 })
  const defIds = def.tickets.map((t) => t.id)
  expect(defIds).toContain(survivor)
  expect(defIds).not.toContain(folded)
  expect(def.tickets.every((t) => t.id !== folded)).toBe(true)

  // Even an EXPLICIT statuses:['merged'] filter must not resurface it — the live-row predicate is
  // independent of the status filter. No merged rows are ever returned, so total is 0.
  const asMerged = await listTicketsPaginated(P, { statuses: ["merged"], limit: 200 })
  expect(asMerged.tickets.map((t) => t.id)).not.toContain(folded)
  expect(asMerged.total).toBe(0)
})

test("KLA-780 r2 (C1-2): a merge CHAIN resolves to the live root — C's data lands on A, not hidden B", async () => {
  const A = await insertFeedback({
    projectId: P, urlPath: "/chain", observation: "root A survivor",
    suggestedBug: { title: "Root A", body: "b", priority: "high" }, issueKey: keyFor("/chain", "QA"),
  })
  const B = await insertFeedback({
    projectId: P, urlPath: "/chain", observation: "middle B",
    suggestedBug: { title: "Mid B", body: "b", priority: "high" }, issueKey: keyFor("/chain", "QB"),
  })
  const C = await insertFeedback({
    projectId: P, urlPath: "/chain", observation: "leaf C unique evidence",
    suggestedBug: { title: "Leaf C", body: "b", priority: "high" }, issueKey: keyFor("/chain", "QC"),
  })
  // 1) B folds into A → B is now hidden, merged_into=A.
  await mergeFeedbackClusters(P, A, B, "op@example.com")
  expect((await feedbackById(P, B)).mergedInto).toBe(A)

  // 2) Now merge C into the (already-hidden) B. The survivor must resolve to the LIVE root A.
  const res = await mergeFeedbackClusters(P, B, C, "op@example.com")
  expect(res).not.toBeNull()
  expect(res!.survivorId).toBe(A)                       // resolved past hidden B
  expect((await feedbackById(P, C)).mergedInto).toBe(A) // C points at the live root, not hidden B

  // C's own evidence is carried as an occurrence on A (never stranded on hidden B).
  const aObs = (await listFeedbackOccurrences(A)).map((o) => o.observation)
  expect(aObs).toContain("leaf C unique evidence")
  const bObs = (await listFeedbackOccurrences(B)).map((o) => o.observation)
  expect(bObs).not.toContain("leaf C unique evidence")
})

test("KLA-780 r2 (C2-atomicity): a forced re-home failure rolls back — the row is NOT marked merged", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/atomic", observation: "atomic survivor",
    suggestedBug: { title: "Atomic survivor", body: "b", priority: "high" }, issueKey: keyFor("/atomic", "RA"),
  })
  const folded = await insertFeedback({
    projectId: P, urlPath: "/atomic", observation: "atomic dup with a comment",
    suggestedBug: { title: "Atomic dup", body: "b", priority: "high" }, issueKey: keyFor("/atomic", "RB"),
  })
  await insertTicketComment(folded, "carol@example.com", "keep my comment safe")

  // Force the absorption transaction to fail by making db.batch throw exactly once.
  const origBatch = db!.batch.bind(db)
  let calls = 0
  ;(db as any).batch = (...a: any[]) => { calls++; throw new Error("forced re-home failure") }
  let result: any
  try {
    result = await mergeFeedbackClusters(P, survivor, folded, "op@example.com")
  } finally {
    ;(db as any).batch = origBatch
  }
  expect(calls).toBe(1)         // the absorption really did attempt the batch
  expect(result).toBeNull()      // merge reports failure (route → 500), not a false success

  // Row NOT marked merged (claim rolled back): still live, status restored, comment intact on it.
  const foldedRow = await feedbackById(P, folded)
  expect(foldedRow.mergedInto).toBeNull()
  expect(foldedRow.status).not.toBe("merged")
  expect((await listTicketComments(folded)).length).toBe(1) // comment NOT stranded/lost
  // Survivor did not silently absorb anything (no head-occurrence for the folded body).
  const sObs = (await listFeedbackOccurrences(survivor)).map((o) => o.observation)
  expect(sObs).not.toContain("atomic dup with a comment")

  // And a normal retry now succeeds cleanly.
  const retry = await mergeFeedbackClusters(P, survivor, folded, "op@example.com")
  expect(retry).not.toBeNull()
  expect((await feedbackById(P, folded)).mergedInto).toBe(survivor)
  expect((await listTicketComments(survivor)).map((c) => c.body)).toContain("keep my comment safe")
})

test("KLA-780 r2 (C2-concurrency): two concurrent merges of the same pair don't double-absorb", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/race", observation: "race survivor",
    suggestedBug: { title: "Race survivor", body: "b", priority: "high" }, issueKey: keyFor("/race", "SA"),
  })
  const folded = await insertFeedback({
    projectId: P, urlPath: "/race", observation: "race dup unique body",
    suggestedBug: { title: "Race dup", body: "b", priority: "high" }, issueKey: keyFor("/race", "SB"),
  })
  // Fire both merges of the SAME pair concurrently — only ONE may absorb (guarded claim).
  const [r1, r2] = await Promise.all([
    mergeFeedbackClusters(P, survivor, folded, "op@example.com"),
    mergeFeedbackClusters(P, survivor, folded, "op@example.com"),
  ])
  expect(r1).not.toBeNull()
  expect(r2).not.toBeNull()
  // The folded row's body is carried as EXACTLY ONE head occurrence on the survivor (never duplicated).
  const dupHeadOccs = (await listFeedbackOccurrences(survivor)).filter((o) => o.observation === "race dup unique body")
  expect(dupHeadOccs.length).toBe(1)
  // Recurrence summed exactly once (1 + 1), not 1 + 1 + 1.
  expect((await feedbackById(P, survivor)).recurrenceCount).toBe(2)
  expect((await feedbackById(P, folded)).mergedInto).toBe(survivor)
})

test("KLA-780 r2 (C2-resolvers): resolveFeedbackRef of a merged ref returns the survivor", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/ref", observation: "ref survivor",
    suggestedBug: { title: "Ref survivor", body: "b", priority: "high" }, issueKey: keyFor("/ref", "TA2"),
  })
  const folded = await insertFeedback({
    projectId: P, urlPath: "/ref", observation: "ref folded",
    suggestedBug: { title: "Ref folded", body: "b", priority: "high" }, issueKey: keyFor("/ref", "TB2"),
  })
  // Before merge, the folded ref resolves to itself.
  expect((await resolveFeedbackRef(folded))?.id).toBe(folded)

  await mergeFeedbackClusters(P, survivor, folded, "op@example.com")

  // An old fb_<folded> deep-link now lands on the canonical survivor, not the hidden folded row.
  const resolved = await resolveFeedbackRef(folded)
  expect(resolved).not.toBeNull()
  expect(resolved!.id).toBe(survivor)
  expect(resolved!.projectId).toBe(P)
  // The survivor's own ref still resolves to itself.
  expect((await resolveFeedbackRef(survivor))?.id).toBe(survivor)
})

// ── KLA-780 round-3: data-durability hardening (repair-on-retry, full re-home, mutation redirect) ──

test("KLA-780 r3 (crash window): a claimed-but-unabsorbed row is REPAIRED on retry, not falsely succeeded", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/crash", observation: "crash survivor",
    suggestedBug: { title: "Crash survivor", body: "b", priority: "high" }, issueKey: keyFor("/crash", "CA"),
  })
  const folded = await insertFeedback({
    projectId: P, urlPath: "/crash", observation: "crash dup body",
    suggestedBug: { title: "Crash dup", body: "b", priority: "high" }, issueKey: keyFor("/crash", "CB"),
  })
  await insertTicketComment(folded, "carol@example.com", "crash-window comment")

  // Simulate a CRASH between the claim and the absorb: mark folded as merged (claim committed) but move
  // NO data. This is exactly the stranded state the old code returned "idempotent success" for.
  await rawExec(`UPDATE feedback SET merged_into=?, status='merged' WHERE id=?`, [survivor, folded])
  // Precondition: data is still stranded on the hidden folded row (absorb never ran).
  expect((await listTicketComments(folded)).length).toBe(1)
  expect((await listFeedbackOccurrences(survivor)).map((o) => o.observation)).not.toContain("crash dup body")

  // Retry the merge — must REPAIR (complete the absorb), not return a bare success.
  const res = await mergeFeedbackClusters(P, survivor, folded, "op@example.com")
  expect(res).not.toBeNull()
  expect(res!.survivorId).toBe(survivor)
  // Comment re-homed + head-occ receipt now on the survivor; folded's data no longer stranded.
  expect((await listTicketComments(survivor)).map((c) => c.body)).toContain("crash-window comment")
  expect((await listFeedbackOccurrences(survivor)).map((o) => o.observation)).toContain("crash dup body")
  expect((await listTicketComments(folded)).length).toBe(0)
  // Recurrence summed exactly once even though the row was pre-marked merged.
  expect((await feedbackById(P, survivor)).recurrenceCount).toBe(2)

  // A second retry is a clean no-op (idempotent) — no double count, still exactly one head-occ receipt.
  const again = await mergeFeedbackClusters(P, survivor, folded, "op@example.com")
  expect(again).not.toBeNull()
  expect((await feedbackById(P, survivor)).recurrenceCount).toBe(2)
  const marker = (await listFeedbackOccurrences(survivor)).filter((o) => o.observation === "crash dup body")
  expect(marker.length).toBe(1)
})

test("KLA-780 r3 (re-home): exports / labels / replays / activity all follow the survivor after merge", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/rehome", observation: "rehome survivor",
    suggestedBug: { title: "Rehome survivor", body: "b", priority: "high" }, issueKey: keyFor("/rehome", "HA"),
  })
  const folded = await insertFeedback({
    projectId: P, urlPath: "/rehome", observation: "rehome dup",
    suggestedBug: { title: "Rehome dup", body: "b", priority: "high" }, issueKey: keyFor("/rehome", "HB"),
  })
  const now = Date.now()
  await rawExec(`INSERT INTO ticket_exports (id,feedback_id,project_id,connector_id,type,status,created_at) VALUES (?,?,?,?,?,?,?)`,
    ["exp_r3", folded, P, "conn1", "issue", "done", now])
  await rawExec(`INSERT INTO ticket_labels (label_id,feedback_id,created_at) VALUES (?,?,?)`, ["lbl_r3", folded, now])
  await rawExec(`INSERT INTO feedback_replays (id,feedback_id,project_id,events_gz,n_events,bytes,trimmed,created_at) VALUES (?,?,?,?,?,?,?,?)`,
    ["rep_r3", folded, P, "Z", 3, 10, 0, now])
  await rawExec(`INSERT INTO activity_events (id,project_id,type,feedback_id,created_at) VALUES (?,?,?,?,?)`,
    ["act_r3", P, "comment", folded, now])

  await mergeFeedbackClusters(P, survivor, folded, "op@example.com")

  expect(await rawClientQuery(`SELECT feedback_id FROM ticket_exports WHERE id='exp_r3'`)).toBe(survivor)
  expect(await rawClientQuery(`SELECT feedback_id FROM ticket_labels WHERE label_id='lbl_r3'`)).toBe(survivor)
  expect(await rawClientQuery(`SELECT feedback_id FROM feedback_replays WHERE id='rep_r3'`)).toBe(survivor)
  expect(await rawClientQuery(`SELECT feedback_id FROM activity_events WHERE id='act_r3'`)).toBe(survivor)
})

test("KLA-780 r3 (mutation redirect): comment / recurrence bump / meta / contact-email on a merged id land on the survivor", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/mut", observation: "mut survivor",
    suggestedBug: { title: "Mut survivor", body: "b", priority: "high" }, issueKey: keyFor("/mut", "MA"),
  })
  const folded = await insertFeedback({
    projectId: P, urlPath: "/mut", observation: "mut dup",
    suggestedBug: { title: "Mut dup", body: "b", priority: "high" }, issueKey: keyFor("/mut", "MB"),
  })
  await mergeFeedbackClusters(P, survivor, folded, "op@example.com")
  const baseCount = (await feedbackById(P, survivor)).recurrenceCount

  // Comment on the (now hidden) merged id → lands on survivor.
  await insertTicketComment(folded, "dan@example.com", "redirected comment")
  expect((await listTicketComments(survivor)).map((c) => c.body)).toContain("redirected comment")
  expect((await listTicketComments(folded)).length).toBe(0)

  // Recurrence bump on the merged id → increments the survivor, not the hidden row.
  await bumpFeedbackRecurrence(folded, Date.now())
  expect((await feedbackById(P, survivor)).recurrenceCount).toBe(baseCount + 1)

  // Meta edit on the merged id → applies to the survivor.
  await updateFeedbackMeta(P, folded, { status: "done" })
  expect((await feedbackById(P, survivor)).status).toBe("done")

  // Contact-email set on the merged id → attaches to the survivor.
  await setFeedbackContactEmail(folded, P, "erin@example.com")
  expect((await feedbackById(P, survivor)).contactEmail).toBe("erin@example.com")
})

test("KLA-780 r4 (route-boundary live-id): liveFeedbackId redirects a merged id (and a chain) to the live survivor", async () => {
  // This is the id the HTTP handlers now resolve ONCE at the route boundary and feed to EVERY downstream
  // side-effect (pushCommentToLinkedIssues, insertActivity, syncTicketFields, notify, v1 response reload).
  const A = await insertFeedback({
    projectId: P, urlPath: "/live", observation: "live root A",
    suggestedBug: { title: "Live A", body: "b", priority: "high" }, issueKey: keyFor("/live", "LA"),
  })
  const B = await insertFeedback({
    projectId: P, urlPath: "/live", observation: "live mid B",
    suggestedBug: { title: "Live B", body: "b", priority: "high" }, issueKey: keyFor("/live", "LB"),
  })
  const C = await insertFeedback({
    projectId: P, urlPath: "/live", observation: "live leaf C",
    suggestedBug: { title: "Live C", body: "b", priority: "high" }, issueKey: keyFor("/live", "LC"),
  })
  // A live id resolves to itself.
  expect(await liveFeedbackId(P, A)).toBe(A)
  // B folds into A → the merged id B now resolves to survivor A.
  await mergeFeedbackClusters(P, A, B, "op@example.com")
  expect(await liveFeedbackId(P, B)).toBe(A)
  // Chain: C folds into (hidden) B → resolves past B to the live root A.
  await mergeFeedbackClusters(P, B, C, "op@example.com")
  expect(await liveFeedbackId(P, C)).toBe(A)

  // Concretely: a comment POSTed to the merged id B lands on the survivor A, and the id the route uses for
  // pushCommentToLinkedIssues/insertActivity (liveFeedbackId(B)) is A — so the linked-issue push + the
  // activity/audit event target the survivor, never the hidden id.
  const comment = await insertTicketComment(B, "carl@example.com", "boundary comment")
  const routeId = await liveFeedbackId(P, B)
  expect(routeId).toBe(A)
  expect((await listTicketComments(routeId)).map((c) => c.id)).toContain(comment.id)
  expect((await listTicketComments(B)).length).toBe(0)

  // A PATCH-equivalent status change on the merged id updates the survivor, and the v1 response reload
  // (feedbackById on the resolved id) reflects the survivor's new status — never the hidden row.
  await updateFeedbackMeta(P, B, { status: "wont_fix" })
  expect((await feedbackById(P, routeId)).status).toBe("wont_fix")
})

test("KLA-780 r4 (leftover cleanup): pending export_outbox + assignment-invite rows on the hidden id are DELETED (no double-file)", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/leftover", observation: "leftover survivor",
    suggestedBug: { title: "Leftover survivor", body: "b", priority: "high" }, issueKey: keyFor("/leftover", "OA"),
  })
  const folded = await insertFeedback({
    projectId: P, urlPath: "/leftover", observation: "leftover dup",
    suggestedBug: { title: "Leftover dup", body: "b", priority: "high" }, issueKey: keyFor("/leftover", "OB"),
  })
  const now = Date.now()
  // Colliding PENDING outbox rows for the SAME connector on BOTH tickets: the survivor's row wins the
  // partial-unique OR IGNORE; the folded row must be DELETED, not stranded on the hidden id (else the
  // project/status-scoped sweep would double-file the same external issue).
  await rawExec(`INSERT INTO export_outbox (id,feedback_id,project_id,connector_id,type,status,next_attempt_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    ["ob_surv", survivor, P, "conn_x", "issue", "pending", now, now, now])
  await rawExec(`INSERT INTO export_outbox (id,feedback_id,project_id,connector_id,type,status,next_attempt_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    ["ob_fold", folded, P, "conn_x", "issue", "pending", now, now, now])
  // Assignment invites: the schema's global UNIQUE(project_id,email) makes a same-email collision on two
  // rows physically unreachable, so the leftover-DELETE is defensive there. With distinct emails the folded
  // invite must re-home onto the survivor and leave NO orphan on the hidden id (invite lookup by (project,
  // email) must never resolve to a merged ticket).
  await rawExec(`INSERT INTO ticket_assignment_invites (id,project_id,email,feedback_id,status,created_at) VALUES (?,?,?,?,?,?)`,
    ["inv_surv", P, "surv-assignee@example.com", survivor, "pending", now])
  await rawExec(`INSERT INTO ticket_assignment_invites (id,project_id,email,feedback_id,status,created_at) VALUES (?,?,?,?,?,?)`,
    ["inv_fold", P, "fold-assignee@example.com", folded, "pending", now])

  await mergeFeedbackClusters(P, survivor, folded, "op@example.com")

  // No outbox/invite row remains on the hidden folded id.
  expect(await rawClientQuery(`SELECT COUNT(*) FROM export_outbox WHERE feedback_id=?`, [folded])).toBe("0")
  expect(await rawClientQuery(`SELECT COUNT(*) FROM ticket_assignment_invites WHERE feedback_id=?`, [folded])).toBe("0")
  // The survivor keeps its own pending outbox row (the folded outbox row COLLIDED on the partial unique and
  // was DELETED, not double-filed), and now owns both re-homed invites.
  expect(await rawClientQuery(`SELECT COUNT(*) FROM export_outbox WHERE feedback_id=? AND status='pending'`, [survivor])).toBe("1")
  expect(await rawClientQuery(`SELECT COUNT(*) FROM ticket_assignment_invites WHERE feedback_id=?`, [survivor])).toBe("2")
})

test("KLA-784 (mixed outbox states): a survivor IN_FLIGHT row + merged PENDING row for the same connector reconcile to ONE (no double-file)", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/mixob", observation: "mixed survivor",
    suggestedBug: { title: "Mixed survivor", body: "b", priority: "high" }, issueKey: keyFor("/mixob", "MA"),
  })
  const folded = await insertFeedback({
    projectId: P, urlPath: "/mixob", observation: "mixed dup",
    suggestedBug: { title: "Mixed dup", body: "b", priority: "high" }, issueKey: keyFor("/mixob", "MB"),
  })
  const now = Date.now()
  // The partial UNIQUE only covers status='pending', so an IN_FLIGHT survivor row does NOT collide with a
  // merged PENDING row for the same connector — the pre-784 code left BOTH on the survivor and the sweep
  // double-filed. Also give the folded ticket a PENDING row on a connector the survivor does NOT have (must
  // re-home cleanly).
  await rawExec(`INSERT INTO export_outbox (id,feedback_id,project_id,connector_id,type,status,next_attempt_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    ["ob_surv_if", survivor, P, "conn_x", "issue", "in_flight", now, now, now])
  await rawExec(`INSERT INTO export_outbox (id,feedback_id,project_id,connector_id,type,status,next_attempt_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    ["ob_fold_pend", folded, P, "conn_x", "issue", "pending", now, now, now])
  await rawExec(`INSERT INTO export_outbox (id,feedback_id,project_id,connector_id,type,status,next_attempt_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    ["ob_fold_other", folded, P, "conn_y", "issue", "pending", now, now, now])

  await mergeFeedbackClusters(P, survivor, folded, "op@example.com")

  // Nothing left on the hidden id.
  expect(await rawClientQuery(`SELECT COUNT(*) FROM export_outbox WHERE feedback_id=?`, [folded])).toBe("0")
  // Survivor has exactly ONE row for conn_x (its original in_flight — the merged pending was dropped, NOT
  // moved alongside it), so the sweep can't double-file conn_x.
  expect(await rawClientQuery(`SELECT COUNT(*) FROM export_outbox WHERE feedback_id=? AND connector_id='conn_x'`, [survivor])).toBe("1")
  expect(await rawClientQuery(`SELECT status FROM export_outbox WHERE feedback_id=? AND connector_id='conn_x'`, [survivor])).toBe("in_flight")
  // The connector the survivor had NONE for re-homed cleanly.
  expect(await rawClientQuery(`SELECT COUNT(*) FROM export_outbox WHERE feedback_id=? AND connector_id='conn_y'`, [survivor])).toBe("1")
})

test("KLA-780 r4 (artifact carry): merged ticket's attachments/recordings union onto the survivor; annotations carried when survivor has none", async () => {
  const survivor = await insertFeedback({
    projectId: P, urlPath: "/artifacts", observation: "artifacts survivor",
    suggestedBug: { title: "Artifacts survivor", body: "b", priority: "high" }, issueKey: keyFor("/artifacts", "PA"),
  })
  const folded = await insertFeedback({
    projectId: P, urlPath: "/artifacts", observation: "artifacts dup",
    suggestedBug: { title: "Artifacts dup", body: "b", priority: "high" }, issueKey: keyFor("/artifacts", "PB"),
  })
  // Survivor already has one attachment + one recording; the folded ticket has distinct ones + annotations.
  await rawExec(`UPDATE feedback SET attachments_json=?, recordings_json=?, annotations_json=NULL WHERE id=?`,
    [JSON.stringify([{ key: "surv-a", filename: "s.png" }]), JSON.stringify([{ id: "surv-rec" }]), survivor])
  await rawExec(`UPDATE feedback SET attachments_json=?, recordings_json=?, annotations_json=? WHERE id=?`,
    [JSON.stringify([{ key: "fold-a", filename: "f.png" }, { key: "surv-a", filename: "dupe" }]),
     JSON.stringify([{ id: "fold-rec" }]),
     JSON.stringify({ w: 100, h: 50, shapes: [{ type: "rect", x: 1, y: 2 }] }), folded])

  await mergeFeedbackClusters(P, survivor, folded, "op@example.com")

  const surv = await feedbackById(P, survivor)
  // Attachments: union survivor + folded, deduped by key → surv-a, fold-a (the "surv-a" dupe collapses).
  const attKeys = (surv.attachments as any[]).map((a) => a.key).sort()
  expect(attKeys).toEqual(["fold-a", "surv-a"])
  // Recordings: union survivor + folded, deduped by id.
  const recIds = (surv.recordings as any[]).map((r) => r.id).sort()
  expect(recIds).toEqual(["fold-rec", "surv-rec"])
  // Annotations: survivor had none → the folded ticket's markup layer is carried onto the survivor.
  // (feedbackById doesn't surface annotations, so read the raw column.)
  const survAnnRaw = await rawClientQuery(`SELECT annotations_json FROM feedback WHERE id=?`, [survivor])
  expect(survAnnRaw).not.toBeNull()
  expect(JSON.parse(survAnnRaw!).shapes[0].type).toBe("rect")
})
