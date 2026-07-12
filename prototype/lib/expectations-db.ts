// prototype/lib/expectations-db.ts
import type { Client } from "@libsql/client"
import { mergeSource, nextStatus, matchExpectationWithNearMisses, trailUrlPathScore,
  type SourceRef, type Corroboration, type ExpStatus, type TrailForPick } from "./expectations"
import { logNearMisses, embeddingsRematch, embeddingsEnabled } from "./expectations-nearmiss"

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
  /** KLA-245 (B.5): held as validated-awaiting-Trail — Enforce offer suppressed until a matching Trail exists. */
  awaitingTrail: boolean
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
    awaitingTrail: !!Number(x.awaiting_trail ?? 0),
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
}): Promise<ExpectationRow> {
  const now = Date.now()
  // 1) exact dedup_key match in-project
  const exact = await c.execute({ sql: "SELECT * FROM expectations WHERE project_id=? AND dedup_key=? LIMIT 1", args: [input.projectId, input.dedupKey] })
  let existing: ExpectationRow | null = exact.rows.length ? rowTo(exact.rows[0]) : null
  // 2) else lexical near-duplicate over same-project titles.
  // KLA-251 (B.11): use the near-miss-collecting matcher. `matchId` is IDENTICAL to the old
  // matchExpectation(...) (≥ 0.82 accept behavior unchanged) — the extra return is the set of
  // DECLINED pairs in the near-miss band, which we log for cross-source-matching measurement.
  if (!existing) {
    const all = await listExpectations(c, input.projectId)
    const cands = all.map((e) => ({ id: e.id, title: e.title }))
    const { matchId, nearMisses } = matchExpectationWithNearMisses({ title: input.title }, cands)
    if (matchId) {
      existing = all.find((e) => e.id === matchId) ?? null
    } else {
      // No lexical match. Log the near-misses (best-effort, never throws) so we can measure
      // how often the 0.82 thread under-matches before shipping the embeddings upgrade.
      if (nearMisses.length) {
        await logNearMisses(c, {
          projectId: input.projectId,
          candTitle: input.title,
          candKind: input.source.kind,
          existingKinds: [...new Set(all.flatMap((e) => e.sourceRefs.map((r) => r.kind)))],
          nearMisses,
          threshold: 0.82,
        })
      }
      // Phase 2 (flag-gated, default OFF): embeddings second pass over the lexically-unmatched
      // candidates. Only runs when KLAV_EXP_EMBEDDINGS=1; a hit collapses the same as a lexical hit.
      if (embeddingsEnabled() && cands.length) {
        const hit = await embeddingsRematch({ candTitle: input.title, existing: cands })
        if (hit) existing = all.find((e) => e.id === hit.matchId) ?? null
      }
    }
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
    const updateArgs: (string | number)[] = [JSON.stringify(corr), JSON.stringify(refs), status, now]
    if (input.sourceTicketId && !existing.sourceTicketId) updateArgs.push(input.sourceTicketId)
    updateArgs.push(existing.id)
    await c.execute({
      sql: `UPDATE expectations SET corroboration_json=?, source_refs_json=?, status=?, updated_at=?${ticketColUpdate} WHERE id=?`,
      args: updateArgs,
    })
    return (await getExpectation(c, existing.id))!
  }
  const id = "exp_" + crypto.randomUUID()
  const corr = mergeSource({ snap: false, sim: false, recurrence: 0 }, input.source.kind)
  const status = nextStatus("candidate", corr)
  await c.execute({
    sql: `INSERT INTO expectations (id,project_id,title,area,url_path,status,source_refs_json,corroboration_json,dedup_key,enforced_step_id,source_ticket_id,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    args: [id, input.projectId, input.title, input.area ?? null, input.urlPath ?? null, status,
           JSON.stringify([input.source]), JSON.stringify(corr), input.dedupKey, null,
           input.sourceTicketId ?? null, now, now],
  })
  return (await getExpectation(c, id))!
}

export async function setExpectationStatus(c: Client, id: string, status: ExpStatus): Promise<void> {
  await c.execute({ sql: "UPDATE expectations SET status=?, updated_at=? WHERE id=?", args: [status, Date.now(), id] })
}

export async function setExpectationEnforced(c: Client, id: string, enforcedStepId: string): Promise<void> {
  // KLA-245 (B.5): enforcing always clears any awaiting-Trail hold (best-effort — old schemas
  // without the column still enforce, just without touching the flag).
  await c.execute({ sql: "UPDATE expectations SET status='enforced', enforced_step_id=?, awaiting_trail=0, updated_at=? WHERE id=?", args: [enforcedStepId, Date.now(), id] })
    .catch(async (e: any) => {
      if (!String(e?.message || e).includes("awaiting_trail")) throw e
      await c.execute({ sql: "UPDATE expectations SET status='enforced', enforced_step_id=?, updated_at=? WHERE id=?", args: [enforcedStepId, Date.now(), id] })
    })
}

/**
 * KLA-245 (B.5): "Hold as validated-awaiting-Trail" — the user hit Enforce but the project has no
 * Trail (or none covering the path) to attach an assert step to. We keep the expectation validated
 * and set awaiting_trail=1 so the board can show a "waiting for a Trail" state and suppress the
 * Enforce offer until a matching Trail is created (see resumeAwaitingTrailExpectations).
 */
export async function setExpectationAwaitingTrail(c: Client, id: string, awaiting: boolean): Promise<void> {
  await c.execute({ sql: "UPDATE expectations SET awaiting_trail=?, updated_at=? WHERE id=?", args: [awaiting ? 1 : 0, Date.now(), id] })
    .catch((e: any) => { if (!String(e?.message || e).includes("awaiting_trail")) throw e })
}

/**
 * KLA-245 (B.5): resume awaiting-Trail expectations whose urlPath is now covered by an existing
 * Trail. Called lazily by the enforce list route so the Enforce offer resurfaces regardless of HOW
 * the covering Trail was created (approve / author / seed). Clears awaiting_trail for each matching
 * expectation and returns the count resumed. No-op (returns 0) when the column is absent.
 */
export async function resumeAwaitingTrailExpectations(
  c: Client,
  projectId: string,
  trails: TrailForPick[],
): Promise<number> {
  if (!trails.length) return 0
  let rows: any[]
  try {
    const r = await c.execute({
      sql: "SELECT id, url_path FROM expectations WHERE project_id=? AND status='validated' AND awaiting_trail=1",
      args: [projectId],
    })
    rows = r.rows as any[]
  } catch (e: any) {
    if (String(e?.message || e).includes("awaiting_trail")) return 0
    throw e
  }
  let resumed = 0
  for (const row of rows) {
    const covered = trails.some((t) => trailUrlPathScore(row.url_path ?? null, t) > 0)
    if (covered) { await setExpectationAwaitingTrail(c, String(row.id), false); resumed++ }
  }
  return resumed
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
