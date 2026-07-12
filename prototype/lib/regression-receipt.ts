// lib/regression-receipt.ts — Client regression-caught receipt (JTBD B.7 / KLAVITYKLA-247).
//
// Closes the commercial loop of the guard: when an agency FIXES a regression that an enforced AutoSim
// assert caught (a "checkpoint gone" hard RED at confidence 1), the person who originally reported the
// underlying issue never hears about it — the whole "we caught it before it reached your users" payoff
// is invisible. This module lets the closer, on marking such a ticket done, send a ONE-CLICK forwardable
// "regression caught & fixed" receipt to that original reporter (the artifact agencies forward to clients
// in a monthly report).
//
// Linkage chain (all data already exists — B.2 + B.6):
//   ticket.issue_key  ==  expectations.dedup_key        (recurrence-memory join)
//   guard finding      →  findings.expectation_id       (B.2: findings carry expectation_id)
//   guard alarm        →  regression_events.source='guard' with feedback_id / expectation_id (B.6)
// A ticket is "guard-caught" when a GUARD regression event exists for its expectation/issue. The
// recipients are the original reporter contact_email(s) on the dedup cluster of that issue — the head
// row's contact_email plus every feedback_occurrences.reporter_email (the same fan-out A.4/merge use).
//
// The send is OPT-IN per close (offer, not silent auto-send) and reuses A.4's mail transport
// (sendReportAlertEmail) rather than building a second sender. Every send is recorded in
// regression_receipts (idempotent additive table) so it's auditable + visible on the ticket/Guard.
//
// Everything DB/mail is injectable so tests run hermetically. A resolve/send failure NEVER throws into
// the caller's status-change flow.

import type { Client } from "@libsql/client"
import { db } from "./db"
import { sendReportAlertEmail } from "./mail"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── schema (idempotent, additive; WeakSet-guarded like regression_events) ─────────────
const ensured = new WeakSet<Client>()
export async function ensureRegressionReceiptsTable(c: Client): Promise<void> {
  if (ensured.has(c)) return
  await c.execute(
    `CREATE TABLE IF NOT EXISTS regression_receipts (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       feedback_id TEXT NOT NULL,
       issue_key TEXT,
       expectation_id TEXT,
       recipients_json TEXT NOT NULL,
       first_fixed_at INTEGER,
       caught_at INTEGER,
       sent_at INTEGER NOT NULL,
       sent_by TEXT
     )`,
  )
  await c.execute(
    `CREATE INDEX IF NOT EXISTS regression_receipts_fb_idx ON regression_receipts (project_id, feedback_id)`,
  ).catch(() => {})
  ensured.add(c)
}

export interface GuardCaughtInfo {
  guardCaught: boolean
  issueKey: string | null
  expectationId: string | null
  /** epoch ms the guard alarm fired (catch time). */
  caughtAt: number | null
  /** epoch ms of the original fix that the guard was protecting (from the regression event). */
  firstFixedAt: number | null
  title: string | null
}

/**
 * Was this ticket auto-filed from a guard-caught (checkpoint-gone) regression? Resolves the ticket's
 * expectation (issue_key == expectations.dedup_key) and looks for a GUARD regression event on that
 * expectation OR issue_key. Returns { guardCaught:false } for ordinary tickets. NEVER throws.
 */
export async function guardCaughtForFeedback(
  c: Client, projectId: string, feedbackId: string,
): Promise<GuardCaughtInfo> {
  const none: GuardCaughtInfo = { guardCaught: false, issueKey: null, expectationId: null, caughtAt: null, firstFixedAt: null, title: null }
  try {
    const fb = await c.execute({ sql: `SELECT issue_key FROM feedback WHERE id=? AND project_id=?`, args: [feedbackId, projectId] })
    if (!fb.rows.length) return none
    const issueKey = (fb.rows[0] as any).issue_key != null ? String((fb.rows[0] as any).issue_key) : null

    // Resolve the linked expectation (dedup_key == issue_key). B.2 findings carry expectation_id;
    // the ticket reaches its expectation through the same issue-identity join recurrence-memory uses.
    let expectationId: string | null = null
    if (issueKey) {
      try {
        const er = await c.execute({ sql: `SELECT id FROM expectations WHERE project_id=? AND dedup_key=? LIMIT 1`, args: [projectId, issueKey] })
        if (er.rows.length) expectationId = String((er.rows[0] as any).id)
      } catch { /* older DB without expectations */ }
    }

    // A guard event links the expectation OR the issue_key. Look it up in the unified regression stream.
    await ensureRegressionReceiptsGuardTable(c)
    const clauses: string[] = []
    const args: any[] = [projectId]
    if (expectationId) { clauses.push("expectation_id=?"); args.push(expectationId) }
    if (issueKey) { clauses.push("issue_key=?"); args.push(issueKey) }
    if (!clauses.length) return none
    const ev = await c.execute({
      sql: `SELECT title, first_fixed_at, created_at FROM regression_events
            WHERE project_id=? AND source='guard' AND (${clauses.join(" OR ")})
            ORDER BY created_at DESC LIMIT 1`,
      args,
    })
    if (!ev.rows.length) return { ...none, issueKey, expectationId }
    const row = ev.rows[0] as any
    return {
      guardCaught: true,
      issueKey,
      expectationId,
      caughtAt: row.created_at != null ? Number(row.created_at) : null,
      firstFixedAt: row.first_fixed_at != null ? Number(row.first_fixed_at) : null,
      title: row.title != null ? String(row.title) : null,
    }
  } catch (e: any) {
    console.warn("guardCaughtForFeedback (non-fatal):", e?.message || e)
    return none
  }
}

// The guard-event table lives in lib/regression-events.ts; ensure it exists before we read it so a
// minimal test DB (or a project that never emitted a guard alarm) reads an empty set instead of erroring.
async function ensureRegressionReceiptsGuardTable(c: Client): Promise<void> {
  await c.execute(
    `CREATE TABLE IF NOT EXISTS regression_events (
       id TEXT PRIMARY KEY, project_id TEXT NOT NULL, issue_key TEXT NOT NULL, source TEXT NOT NULL,
       title TEXT NOT NULL, feedback_id TEXT, expectation_id TEXT, first_fixed_at INTEGER,
       evidence_json TEXT, created_at INTEGER NOT NULL, acknowledged_at INTEGER)`,
  ).catch(() => {})
}

/**
 * The original reporter contact(s) for a ticket's dedup cluster: the head feedback row's contact_email
 * plus every stored feedback_occurrences.reporter_email (occurrences 2..N of the cluster). De-duped and
 * validated. This is the SAME fan-out the merge path (db.mergeFeedbackClusters) and A.4 notify-on-fix
 * use, so every reporter who ever hit this issue is reached. Empty array when no contact exists.
 */
export async function resolveReceiptRecipients(
  c: Client, projectId: string, feedbackId: string,
): Promise<string[]> {
  const emails = new Set<string>()
  try {
    const head = await c.execute({ sql: `SELECT contact_email FROM feedback WHERE id=? AND project_id=?`, args: [feedbackId, projectId] })
    if (head.rows.length) {
      const ce = (head.rows[0] as any).contact_email
      if (ce != null && String(ce).trim()) emails.add(String(ce).trim())
    }
    const occ = await c.execute({ sql: `SELECT reporter_email FROM feedback_occurrences WHERE feedback_id=? AND project_id=?`, args: [feedbackId, projectId] }).catch(() => ({ rows: [] as any[] }))
    for (const r of occ.rows as any[]) {
      const re = (r as any).reporter_email
      if (re != null && String(re).trim()) emails.add(String(re).trim())
    }
  } catch (e: any) {
    console.warn("resolveReceiptRecipients (non-fatal):", e?.message || e)
  }
  return [...emails].filter((e) => EMAIL_RE.test(e))
}

// ── receipt email copy (forwardable: agency → client monthly report) ──────────────────
function esc(s: string): string {
  return String(s || "").replace(/[<>&"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[ch] as string))
}
function fmtDate(ms: number | null | undefined): string | null {
  if (ms == null || !Number.isFinite(ms)) return null
  return new Date(ms).toISOString().slice(0, 10)
}
/** "within the hour" / "within 3 hours" — the guard catch-time story. */
function catchWindow(firstFixedAt: number | null, caughtAt: number | null): string {
  if (firstFixedAt == null || caughtAt == null || caughtAt < firstFixedAt) return "automatically, before it affected users"
  const hrs = (caughtAt - firstFixedAt) / 3_600_000
  if (hrs <= 1) return "within the hour"
  if (hrs <= 24) return `within ${Math.round(hrs)} hours`
  const days = Math.round(hrs / 24)
  return `within ${days} day${days === 1 ? "" : "s"}`
}

export interface ReceiptCopyInput {
  title: string
  projectName: string
  firstFixedAt: number | null
  caughtAt: number | null
  fixedAt: number
}

export function buildReceiptEmail(input: ReceiptCopyInput): { subject: string; html: string; text: string } {
  const issue = input.title?.trim() || "an issue you reported"
  const firstFixed = fmtDate(input.firstFixedAt)
  const caught = fmtDate(input.caughtAt)
  const fixed = fmtDate(input.fixedAt) || fmtDate(Date.now())
  const window = catchWindow(input.firstFixedAt, input.caughtAt)

  const subject = `Caught & fixed before it reached you: ${issue}`.slice(0, 120)

  const firstLine = firstFixed
    ? `The issue you reported${firstFixed ? ` (first fixed ${firstFixed})` : ""} — "${issue}" — briefly recurred after a recent deploy.`
    : `The issue you reported — "${issue}" — briefly recurred after a recent deploy.`
  const catchLine = `Our automated guard caught it ${window}${caught ? ` on ${caught}` : ""}, and it was fixed before it affected users.`
  const facts = [
    firstFixed ? `First fixed: ${firstFixed}` : null,
    caught ? `Caught by guard: ${caught}` : null,
    `Re-fixed & confirmed: ${fixed}`,
  ].filter(Boolean) as string[]

  const text = [
    firstLine,
    "",
    catchLine,
    "",
    ...facts,
    "",
    `— ${input.projectName}`,
  ].join("\n")

  const f = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
  const html = `<div style="${f};color:#1d1d24;max-width:560px">
  <p style="margin:0 0 12px;font-size:15px"><b style="color:#16a34a">Caught and fixed before it reached your users</b></p>
  <p style="margin:0 0 12px;font-size:15px">${esc(firstLine)}</p>
  <div style="border:1px solid #bbf7d0;background:#f0fdf4;border-radius:10px;padding:14px 16px;margin:0 0 14px">
    <p style="margin:0 0 6px;font-size:14px;color:#166534">${esc(catchLine)}</p>
    <p style="margin:0;font-size:12px;color:#3f6212">${facts.map((x) => esc(x)).join(" &nbsp;·&nbsp; ")}</p>
  </div>
  <p style="margin:16px 0 0;font-size:13px;color:#6b6678">Thanks for reporting it — that's what let us guard against it coming back.</p>
  <p style="margin:14px 0 0;font-size:12px;color:#8a8696">— ${esc(input.projectName)}</p>
  <p style="margin:18px 0 0;font-size:11px;color:#b6b3c0">Sent by Klavity on behalf of ${esc(input.projectName)} · an automated guard caught this regression.</p>
</div>`

  return { subject, html, text }
}

// ── record (audit) ────────────────────────────────────────────────────────────────────
export interface ReceiptRecord {
  id: string
  projectId: string
  feedbackId: string
  issueKey: string | null
  expectationId: string | null
  recipients: string[]
  firstFixedAt: number | null
  caughtAt: number | null
  sentAt: number
  sentBy: string | null
}

function newId(): string {
  return "rcpt_" + (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random().toString(16).slice(2)}`)
}

export async function recordReceiptSent(
  c: Client,
  rec: Omit<ReceiptRecord, "id" | "sentAt"> & { sentAt?: number },
): Promise<ReceiptRecord> {
  await ensureRegressionReceiptsTable(c)
  const id = newId()
  const sentAt = rec.sentAt ?? Date.now()
  await c.execute({
    sql: `INSERT INTO regression_receipts
            (id, project_id, feedback_id, issue_key, expectation_id, recipients_json, first_fixed_at, caught_at, sent_at, sent_by)
          VALUES (?,?,?,?,?,?,?,?,?,?)`,
    args: [
      id, rec.projectId, rec.feedbackId, rec.issueKey ?? null, rec.expectationId ?? null,
      JSON.stringify(rec.recipients ?? []), rec.firstFixedAt ?? null, rec.caughtAt ?? null, sentAt, rec.sentBy ?? null,
    ],
  })
  return { id, sentAt, ...rec, recipients: rec.recipients ?? [] }
}

/** The most-recent receipt sent for a ticket (for the UI "receipt sent" state), or null. NEVER throws. */
export async function latestReceiptForFeedback(
  c: Client, projectId: string, feedbackId: string,
): Promise<ReceiptRecord | null> {
  try {
    await ensureRegressionReceiptsTable(c)
    const r = await c.execute({
      sql: `SELECT * FROM regression_receipts WHERE project_id=? AND feedback_id=? ORDER BY sent_at DESC LIMIT 1`,
      args: [projectId, feedbackId],
    })
    if (!r.rows.length) return null
    const x = r.rows[0] as any
    let recipients: string[] = []
    try { recipients = JSON.parse(String(x.recipients_json || "[]")) } catch { recipients = [] }
    return {
      id: String(x.id), projectId: String(x.project_id), feedbackId: String(x.feedback_id),
      issueKey: x.issue_key != null ? String(x.issue_key) : null,
      expectationId: x.expectation_id != null ? String(x.expectation_id) : null,
      recipients: Array.isArray(recipients) ? recipients : [],
      firstFixedAt: x.first_fixed_at != null ? Number(x.first_fixed_at) : null,
      caughtAt: x.caught_at != null ? Number(x.caught_at) : null,
      sentAt: Number(x.sent_at), sentBy: x.sent_by != null ? String(x.sent_by) : null,
    }
  } catch { return null }
}

export type ReceiptSendResult =
  | { ok: true; sent: true; recipients: string[]; record: ReceiptRecord }
  | { ok: true; sent: false; reason: "not_guard_caught" | "no_recipient" }
  | { ok: false; error: string }

export interface ReceiptDeps {
  db?: Client | null
  sendEmail?: (to: string[], subject: string, html: string, text: string) => Promise<void>
}

/**
 * Send a regression-caught receipt for a just-closed ticket. Explicit (one-click) — the caller invokes
 * this only when the closer opts in. Verifies the ticket is guard-caught, resolves the reporter
 * recipients, sends via A.4's transport, and records the send for audit. Gracefully SKIPS (sent:false)
 * when the ticket isn't guard-caught or has no reporter contact — surfaced to the UI. NEVER throws.
 */
export async function sendRegressionCaughtReceipt(
  input: { projectId: string; feedbackId: string; projectName: string; ticketTitle: string; sentBy?: string | null; fixedAt?: number },
  deps: ReceiptDeps = {},
): Promise<ReceiptSendResult> {
  const c = deps.db ?? db
  if (!c) return { ok: false, error: "Database unavailable." }
  try {
    const guard = await guardCaughtForFeedback(c, input.projectId, input.feedbackId)
    if (!guard.guardCaught) return { ok: true, sent: false, reason: "not_guard_caught" }

    const recipients = await resolveReceiptRecipients(c, input.projectId, input.feedbackId)
    if (!recipients.length) return { ok: true, sent: false, reason: "no_recipient" }

    const { subject, html, text } = buildReceiptEmail({
      title: guard.title || input.ticketTitle,
      projectName: input.projectName,
      firstFixedAt: guard.firstFixedAt,
      caughtAt: guard.caughtAt,
      fixedAt: input.fixedAt ?? Date.now(),
    })

    // Only actually transmit when SendGrid is configured; recording still happens (audit) so the UI
    // reflects the intent in dev/test. The transport itself is the A.4 sender (individual copies).
    if (process.env.SENDGRID_API_KEY || deps.sendEmail) {
      const send = deps.sendEmail ?? sendReportAlertEmail
      await send(recipients, subject, html, text)
    }

    const record = await recordReceiptSent(c, {
      projectId: input.projectId, feedbackId: input.feedbackId,
      issueKey: guard.issueKey, expectationId: guard.expectationId,
      recipients, firstFixedAt: guard.firstFixedAt, caughtAt: guard.caughtAt,
      sentBy: input.sentBy ?? null, sentAt: input.fixedAt,
    })
    return { ok: true, sent: true, recipients, record }
  } catch (e: any) {
    console.error("sendRegressionCaughtReceipt (non-fatal):", e?.message || e)
    return { ok: false, error: e?.message || "Could not send receipt." }
  }
}
