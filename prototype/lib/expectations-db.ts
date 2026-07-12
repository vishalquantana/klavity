// prototype/lib/expectations-db.ts
import type { Client } from "@libsql/client"
import { mergeSource, nextStatus, matchExpectation,
  type SourceRef, type Corroboration, type ExpStatus } from "./expectations"

/**
 * Maximum number of source refs stored per expectation row.
 * Each call to upsertExpectation appends a SourceRef to source_refs_json; without
 * a bound the JSON blob grows indefinitely as a popular issue is repeatedly ingested
 * (e.g. every continuous Sim-review firing on the same expectation).
 * We keep the MOST RECENT SOURCE_REFS_MAX refs after deduplicating by source id, so
 * the column stays O(1) in size while preserving the most useful attribution data.
 */
export const SOURCE_REFS_MAX = 50

export type ExpectationRow = {
  id: string; projectId: string; title: string; area: string | null; urlPath: string | null
  status: ExpStatus; sourceRefs: SourceRef[]; corroboration: Corroboration
  dedupKey: string; enforcedStepId: string | null; createdAt: number; updatedAt: number
  /** KLA-243: number of times this enforced guard has caught a regression */
  savesCount: number
  /** KLA-242: feedback ticket id this guard was created from via "Guard this fix" */
  sourceTicketId: string | null
  /** B.13: the verbatim complaint/evidence this expectation was born from. NULL on legacy rows. */
  sourceQuote: string | null
  /** B.13: 1=verified against source text, 0=present-but-unverified, null=no quote. */
  sourceQuoteVerified: boolean | null
  /** B.13: source ref id (feedback/finding id) the quote came from, for auditability. */
  sourceQuoteRef: string | null
}

function rowTo(x: any): ExpectationRow {
  return {
    id: x.id, projectId: x.project_id, title: x.title, area: x.area ?? null, urlPath: x.url_path ?? null,
    status: x.status, sourceRefs: JSON.parse(x.source_refs_json || "[]"),
    corroboration: JSON.parse(x.corroboration_json || "{}"),
    dedupKey: x.dedup_key, enforcedStepId: x.enforced_step_id ?? null,
    createdAt: Number(x.created_at), updatedAt: Number(x.updated_at),
    savesCount: Number(x.saves_count ?? 0),
    sourceTicketId: x.source_ticket_id ?? null,
    sourceQuote: x.source_quote ?? null,
    sourceQuoteVerified: x.source_quote_verified == null ? null : Number(x.source_quote_verified) === 1,
    sourceQuoteRef: x.source_quote_ref ?? null,
  }
}

export async function getExpectation(c: Client, id: string): Promise<ExpectationRow | null> {
  const r = await c.execute({ sql: "SELECT * FROM expectations WHERE id=?", args: [id] })
  return r.rows.length ? rowTo(r.rows[0]) : null
}

export async function listExpectations(c: Client, projectId: string, status?: ExpStatus): Promise<ExpectationRow[]> {
  const r = status
    ? await c.execute({ sql: "SELECT * FROM expectations WHERE project_id=? AND status=? ORDER BY updated_at DESC", args: [projectId, status] })
    : await c.execute({ sql: "SELECT * FROM expectations WHERE project_id=? ORDER BY updated_at DESC", args: [projectId] })
  return r.rows.map(rowTo)
}

export async function upsertExpectation(c: Client, input: {
  projectId: string; title: string; area?: string | null; urlPath?: string | null; dedupKey: string; source: SourceRef
  /** KLA-242: feedback ticket id when created via "Guard this fix" */
  sourceTicketId?: string | null
  /** B.13: originating grounded quote + its verification state + the ref id it came from. */
  sourceQuote?: string | null
  sourceQuoteVerified?: boolean | null
}): Promise<ExpectationRow> {
  const now = Date.now()
  // 1) exact dedup_key match in-project
  const exact = await c.execute({ sql: "SELECT * FROM expectations WHERE project_id=? AND dedup_key=? LIMIT 1", args: [input.projectId, input.dedupKey] })
  let existing: ExpectationRow | null = exact.rows.length ? rowTo(exact.rows[0]) : null
  // 2) else lexical near-duplicate over same-project titles
  if (!existing) {
    const all = await listExpectations(c, input.projectId)
    const matchId = matchExpectation({ title: input.title }, all.map((e) => ({ id: e.id, title: e.title })))
    if (matchId) existing = all.find((e) => e.id === matchId) ?? null
  }
  if (existing) {
    const corr = mergeSource(existing.corroboration, input.source.kind)
    // Append the new source ref, deduplicate by id (exact same feedback never stored twice),
    // then cap to SOURCE_REFS_MAX most-recent entries to prevent unbounded JSON blob growth.
    const seenIds = new Set<string>()
    const deduped = [...existing.sourceRefs, input.source].filter((r) => {
      if (seenIds.has(r.id)) return false
      seenIds.add(r.id)
      return true
    })
    const refs = deduped.length > SOURCE_REFS_MAX ? deduped.slice(-SOURCE_REFS_MAX) : deduped
    const status = nextStatus(existing.status, corr)
    // KLA-242: back-fill source_ticket_id if provided and not already set.
    const ticketColUpdate = (input.sourceTicketId && !existing.sourceTicketId)
      ? ", source_ticket_id=?" : ""
    // B.13: back-fill the originating grounded quote the FIRST time one arrives (the row's
    // birth quote is the most faithful complaint; later corroborations don't overwrite it).
    const backfillQuote = (input.sourceQuote != null && input.sourceQuote !== "" && existing.sourceQuote == null)
    const quoteColUpdate = backfillQuote ? ", source_quote=?, source_quote_verified=?, source_quote_ref=?" : ""
    const updateArgs: (string | number | null)[] = [JSON.stringify(corr), JSON.stringify(refs), status, now]
    if (input.sourceTicketId && !existing.sourceTicketId) updateArgs.push(input.sourceTicketId)
    if (backfillQuote) {
      updateArgs.push(input.sourceQuote!)
      updateArgs.push(input.sourceQuoteVerified == null ? null : (input.sourceQuoteVerified ? 1 : 0))
      updateArgs.push(input.source.id)
    }
    updateArgs.push(existing.id)
    await c.execute({
      sql: `UPDATE expectations SET corroboration_json=?, source_refs_json=?, status=?, updated_at=?${ticketColUpdate}${quoteColUpdate} WHERE id=?`,
      args: updateArgs,
    })
    return (await getExpectation(c, existing.id))!
  }
  const id = "exp_" + crypto.randomUUID()
  const corr = mergeSource({ snap: false, sim: false, recurrence: 0 }, input.source.kind)
  const status = nextStatus("candidate", corr)
  const hasQuote = input.sourceQuote != null && input.sourceQuote !== ""
  await c.execute({
    sql: `INSERT INTO expectations (id,project_id,title,area,url_path,status,source_refs_json,corroboration_json,dedup_key,enforced_step_id,source_ticket_id,source_quote,source_quote_verified,source_quote_ref,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, input.projectId, input.title, input.area ?? null, input.urlPath ?? null, status,
           JSON.stringify([input.source]), JSON.stringify(corr), input.dedupKey, null,
           input.sourceTicketId ?? null,
           hasQuote ? input.sourceQuote! : null,
           hasQuote ? (input.sourceQuoteVerified == null ? null : (input.sourceQuoteVerified ? 1 : 0)) : null,
           hasQuote ? input.source.id : null,
           now, now],
  })
  return (await getExpectation(c, id))!
}

export async function setExpectationStatus(c: Client, id: string, status: ExpStatus): Promise<void> {
  await c.execute({ sql: "UPDATE expectations SET status=?, updated_at=? WHERE id=?", args: [status, Date.now(), id] })
}

export async function setExpectationEnforced(c: Client, id: string, enforcedStepId: string): Promise<void> {
  await c.execute({ sql: "UPDATE expectations SET status='enforced', enforced_step_id=?, updated_at=? WHERE id=?", args: [enforcedStepId, Date.now(), id] })
}

/**
 * KLA-243: Increment the saves_count for an expectation when a guard catches a regression.
 * Called by recordFinding when a finding is linked to an enforced expectation.
 */
export async function incrementExpectationSaves(c: Client, id: string): Promise<void> {
  await c.execute({ sql: "UPDATE expectations SET saves_count=saves_count+1, updated_at=? WHERE id=?", args: [Date.now(), id] })
}

/**
 * KLA-242: "Guard this fix" — create or upsert an expectation from a resolved ticket.
 * The ticket's title becomes the guard description; status is immediately "validated"
 * (human has confirmed the fix, so it's ready to enforce).
 * Returns the expectation row.
 */
export async function upsertExpectationFromTicket(c: Client, args: {
  projectId: string
  feedbackId: string
  title: string
  urlPath?: string | null
  area?: string | null
}): Promise<ExpectationRow> {
  const dedupKey = "ticket:" + args.feedbackId
  const exp = await upsertExpectation(c, {
    projectId: args.projectId,
    title: args.title.slice(0, 200),
    area: args.area ?? null,
    urlPath: args.urlPath ?? null,
    dedupKey,
    source: { kind: "snap", id: args.feedbackId },
    sourceTicketId: args.feedbackId,
  })
  // Ensure it's at least "validated" so it's ready to enforce immediately.
  if (exp.status === "candidate") {
    await setExpectationStatus(c, exp.id, "validated")
    return (await getExpectation(c, exp.id))!
  }
  return exp
}
