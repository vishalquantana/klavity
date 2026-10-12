// Idempotent report submissions (POST /api/feedback).
//
// A client sends ONE `submission_key` (UUID) per report and reuses it on every attempt — the widget's automatic retries and its manual
// Retry button included. The server records the key in `submission_keys` (primary key (project_id, submission_key)) and so can tell a
// repeat of a submission it already handled from a new report, which makes a retry after a lost response / timeout / crash safe:
// it returns the SAME ticket instead of creating a second one.
//
// The DATABASE is the only source of truth (no in-memory map), so this holds across several server processes and across restarts:
//
//   claim  → INSERT … ON CONFLICT DO NOTHING (state 'pending', owned by this process, stamped claimed_at). Exactly one caller wins.
//   done   → written ATOMICALLY with the ticket itself (one db.batch: key done + ticket-number bump + feedback row — see
//            insertFeedbackForSubmission in lib/db.ts), so "ticket exists" and "key recorded" can never disagree. A crash after the
//            ticket was created therefore cannot leave a recorded ticket without its key, nor a key pointing at no ticket.
//   crash before the ticket exists → the claim stays 'pending'. Once it is older than SUBMISSION_STALE_MS a retry TAKES IT OVER with a
//            compare-and-swap on claimed_at (two retries cannot both win). A claim whose request is still alive refreshes claimed_at
//            during long uploads, so it is not stolen mid-flight; and even if it were, the guarded final batch only creates the ticket
//            for the CURRENT owner.
//   a retry while the original is still running → 'in_progress' (the client waits and retries).
//   a different principal using the same key → 'conflict' (never returns another caller's ticket).
import { createHash } from "node:crypto"
import { db } from "./db"

/** A pending claim older than this is considered abandoned (its request crashed) and may be taken over. */
export const SUBMISSION_STALE_MS = Number(process.env.KLAV_SUBMISSION_STALE_MS) || 60_000
/** How long finished keys are kept before opportunistic pruning (a client retries within minutes, not weeks). */
export const SUBMISSION_KEEP_MS = 14 * 24 * 60 * 60 * 1000
/** Identifies THIS server process; stored on a claim so a takeover / refresh / release only acts on a claim it owns. */
export const PROCESS_OWNER = "own_" + crypto.randomUUID()

// ── pure helpers ────────────────────────────────────────────────────────────────────────────────────────────────

/** Client-chosen key: 16–64 chars of [A-Za-z0-9_-] (a UUID fits). Returns null when absent, "invalid" when present but malformed. */
export function parseSubmissionKey(v: unknown): string | null | "invalid" {
  if (v == null) return null
  const s = String(v).trim()
  if (!s) return null
  return /^[A-Za-z0-9_-]{16,64}$/.test(s) ? s : "invalid"
}

/** Evidence slots: shot:N (screenshot), file:N (attachment), rec:N (recording), replay. N is the part's position in the ORIGINAL submission. */
const SLOT_RE = /^(?:(?:shot|file|rec):\d{1,2}|replay)$/
export const isSlot = (s: unknown): s is string => typeof s === "string" && SLOT_RE.test(s)

export type SlotFields = "screenshots" | "thumbs" | "files" | "recording"
export type SlotMap = Partial<Record<SlotFields, string[]>>

/** `slot_map` form field: which original slot each uploaded part carries (lets a repair resend only the missing parts). */
export function parseSlotMap(raw: unknown): SlotMap {
  if (typeof raw !== "string" || !raw) return {}
  let j: any
  try { j = JSON.parse(raw) } catch { return {} }
  if (!j || typeof j !== "object") return {}
  const out: SlotMap = {}
  for (const k of ["screenshots", "thumbs", "files", "recording"] as SlotFields[]) {
    const a = j[k]
    if (Array.isArray(a) && a.length <= 12 && a.every(isSlot)) out[k] = a as string[]
  }
  return out
}

/** The slot of the i-th part of `field`: from the client's slot_map when it supplied one, else its position (the original submission). */
export function slotFor(map: SlotMap, field: SlotFields, index: number): string {
  const given = map[field]?.[index]
  if (given) return given
  const kind = field === "screenshots" || field === "thumbs" ? "shot" : field === "files" ? "file" : "rec"
  return `${kind}:${index}`
}

/** `repair_slots` form field: the slots a repair request wants to (re)upload. */
export function parseRepairSlots(raw: unknown): string[] | null {
  if (typeof raw !== "string" || !raw) return null
  try { const a = JSON.parse(raw); return Array.isArray(a) && a.length <= 16 && a.every(isSlot) ? Array.from(new Set(a as string[])) : null } catch { return null }
}

/** Unguessable per-(project, key, slot) id used as the stable object key and screenshot id, so a retry overwrites instead of orphaning. */
export function deterministicId(projectId: string, submissionKey: string, slot: string): string {
  return createHash("sha256").update(`${projectId}\n${submissionKey}\n${slot}`).digest("hex").slice(0, 32)
}

export type EvidenceState = Record<string, "ok" | "failed" | "pending">
export const missingSlots = (e: EvidenceState): string[] => Object.keys(e).filter((k) => e[k] !== "ok").sort()
export function parseEvidence(raw: unknown): EvidenceState {
  if (typeof raw !== "string" || !raw) return {}
  try {
    const j = JSON.parse(raw)
    const out: EvidenceState = {}
    if (j && typeof j === "object") for (const [k, v] of Object.entries(j)) if (isSlot(k) && (v === "ok" || v === "failed" || v === "pending")) out[k] = v
    return out
  } catch { return {} }
}

// ── DB ──────────────────────────────────────────────────────────────────────────────────────────────────────────

export type ClaimResult =
  | { kind: "claimed"; createdAt: number; takeover: boolean }
  | { kind: "replay"; feedbackId: string; deduped: boolean; evidence: EvidenceState; createdAt: number }
  | { kind: "in_progress"; retryAfterSec: number; staleInSec: number }
  | { kind: "conflict" }

/** Retry-After for an in-progress submission: just after the claim turns stale (so the retry that takes it over arrives promptly), within [1, 15] s. */
export function pendingHint(staleInMs: number): { retryAfterSec: number; staleInSec: number } {
  const staleInSec = Math.max(0, Math.ceil(staleInMs / 1000))
  return { retryAfterSec: Math.min(15, Math.max(1, staleInSec + 1)), staleInSec }
}

const lc = (s: string | null | undefined) => (s == null ? null : String(s).trim().toLowerCase())

/**
 * Claim (project, key) for this request, or learn what happened to an earlier claim. `actor` is the authenticated email (null for an
 * anonymous widget reporter); a stored claim only answers the SAME principal. Throws on a database error — the caller decides whether
 * to fail open (the submission then simply has no idempotency protection).
 */
export async function claimSubmission(a: { projectId: string; key: string; actor: string | null; owner?: string; now?: number; staleMs?: number }): Promise<ClaimResult> {
  const owner = a.owner ?? PROCESS_OWNER, now = a.now ?? Date.now(), staleMs = a.staleMs ?? SUBMISSION_STALE_MS
  const actor = lc(a.actor)
  for (let attempt = 0; attempt < 4; attempt++) {
    const ins = await db!.execute({
      sql: `INSERT INTO submission_keys (project_id, submission_key, state, owner, actor_email, created_at, claimed_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(project_id, submission_key) DO NOTHING`,
      args: [a.projectId, a.key, "pending", owner, actor, now, now, now],
    })
    if (Number(ins.rowsAffected || 0) === 1) return { kind: "claimed", createdAt: now, takeover: false }

    const r = await db!.execute({
      sql: `SELECT state, owner, actor_email, feedback_id, deduped, evidence_json, created_at, claimed_at FROM submission_keys WHERE project_id=? AND submission_key=?`,
      args: [a.projectId, a.key],
    })
    const row = r.rows[0] as any
    if (!row) continue                                              // pruned between our insert and read → try to claim again
    if (lc(row.actor_email) !== actor) return { kind: "conflict" }  // a different principal's key — never hand out its ticket
    const createdAt = Number(row.created_at)

    if (String(row.state) === "done") {
      const fb = await db!.execute({ sql: "SELECT 1 AS x FROM feedback WHERE id=? AND project_id=? LIMIT 1", args: [row.feedback_id, a.projectId] })
      if (fb.rows.length) return { kind: "replay", feedbackId: String(row.feedback_id), deduped: Number(row.deduped) === 1, evidence: parseEvidence(row.evidence_json), createdAt }
      // The ticket this key produced was deleted → the key is spent on nothing. Reopen it (CAS on the stale feedback_id) and create afresh.
      const re = await db!.execute({
        sql: `UPDATE submission_keys SET state='pending', owner=?, claimed_at=?, feedback_id=NULL, deduped=0, evidence_json=NULL, updated_at=?
              WHERE project_id=? AND submission_key=? AND state='done' AND feedback_id=?`,
        args: [owner, now, now, a.projectId, a.key, row.feedback_id],
      })
      if (Number(re.rowsAffected || 0) === 1) return { kind: "claimed", createdAt, takeover: true }
      continue
    }

    const claimedAt = Number(row.claimed_at)
    // Still within the stale window: tell the client when to look again — roughly when the claim becomes takeover-able (capped, so it
    // keeps polling while the original request may yet finish) — instead of a fixed guess.
    if (now - claimedAt <= staleMs) return { kind: "in_progress", ...pendingHint(staleMs - (now - claimedAt)) }
    // Abandoned claim (its request crashed / stalled past the stale window): take it over. claimed_at is the CAS token, so of several
    // simultaneous retries exactly one UPDATE matches.
    const to = await db!.execute({
      sql: `UPDATE submission_keys SET owner=?, claimed_at=?, updated_at=? WHERE project_id=? AND submission_key=? AND state='pending' AND claimed_at=?`,
      args: [owner, now, now, a.projectId, a.key, claimedAt],
    })
    if (Number(to.rowsAffected || 0) === 1) return { kind: "claimed", createdAt, takeover: true }
  }
  return { kind: "in_progress", ...pendingHint(0) }
}

/** Keep a live claim fresh during a long request. Returns false when the claim is no longer ours (taken over) → the caller must stop. */
export async function refreshClaim(projectId: string, key: string, owner: string = PROCESS_OWNER, now: number = Date.now()): Promise<boolean> {
  const r = await db!.execute({
    sql: `UPDATE submission_keys SET claimed_at=?, updated_at=? WHERE project_id=? AND submission_key=? AND owner=? AND state='pending'`,
    args: [now, now, projectId, key, owner],
  })
  return Number(r.rowsAffected || 0) === 1
}

/** Give up a claim we own that produced no ticket (request failed) so an immediate retry is not made to wait for the stale window. */
export async function releaseClaim(projectId: string, key: string, owner: string = PROCESS_OWNER): Promise<void> {
  await db!.execute({ sql: `DELETE FROM submission_keys WHERE project_id=? AND submission_key=? AND owner=? AND state='pending'`, args: [projectId, key, owner] })
}

/** Finish a claim whose report was merged into an existing ticket (no new ticket row). Guarded by owner + 'pending'. */
export async function finishDedupedSubmission(a: { projectId: string; key: string; owner?: string; feedbackId: string; evidence: EvidenceState; now?: number }): Promise<boolean> {
  const r = await db!.execute({
    sql: `UPDATE submission_keys SET state='done', feedback_id=?, deduped=1, evidence_json=?, updated_at=? WHERE project_id=? AND submission_key=? AND owner=? AND state='pending'`,
    args: [a.feedbackId, JSON.stringify(a.evidence), a.now ?? Date.now(), a.projectId, a.key, a.owner ?? PROCESS_OWNER],
  })
  return Number(r.rowsAffected || 0) === 1
}

/** The evidence-state UPDATE as a statement, so a caller can commit it in the same batch as another write (saves a round trip). */
export function evidenceStateStatement(projectId: string, key: string, evidence: EvidenceState, now: number = Date.now()): { sql: string; args: any[] } {
  return { sql: `UPDATE submission_keys SET evidence_json=?, updated_at=? WHERE project_id=? AND submission_key=? AND state='done'`, args: [JSON.stringify(evidence), now, projectId, key] }
}

/** Persist the current per-slot evidence state of a finished submission (used after the replay save and after a repair). */
export async function saveEvidenceState(projectId: string, key: string, evidence: EvidenceState, now: number = Date.now()): Promise<void> {
  await db!.execute({ sql: `UPDATE submission_keys SET evidence_json=?, updated_at=? WHERE project_id=? AND submission_key=? AND state='done'`, args: [JSON.stringify(evidence), now, projectId, key] })
}

/** Drop old finished keys. Best-effort housekeeping, called occasionally. */
export async function pruneSubmissionKeys(maxAgeMs: number = SUBMISSION_KEEP_MS, now: number = Date.now()): Promise<number> {
  const r = await db!.execute({ sql: `DELETE FROM submission_keys WHERE state='done' AND created_at < ?`, args: [now - maxAgeMs] })
  return Number(r.rowsAffected || 0)
}
