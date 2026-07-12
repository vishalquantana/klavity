// lib/regression-events.ts — Unified Regression alarm (JTBD B.6 / KLAVITYKLA-246).
//
// Klavity has THREE independent regression detectors that each fired in a separate surface with no
// shared event, notification, or feed:
//   • memory      — recurrence-memory computes regressed = (resolvedAt != null && lastSeenAt > resolvedAt)
//                    when a report deduplicates back onto a cluster that was already resolved.
//   • sim-reopen  — the reconcile pipeline emits a `reopen` trait op when a Sim transcript shows a
//                    previously-superseded complaint returning.
//   • guard       — an AutoSim walk finishes RED on a real expectation failure (checkpoint gone).
//
// This module gives all three ONE place to publish a shared "regression event": a durable row in
// `regression_events` carrying the issue/expectation link, the source, and evidence refs. On publish
// it fires a founder notification (Slack + throttled email) so the agency hears about a regression
// WITHIN THE HOUR instead of after the angry client email.
//
// Dedup: multiple detectors firing on the SAME issue within REGRESSION_DEDUP_WINDOW_MS collapse into
// one alarm (no duplicate banners / no duplicate emails). The cluster key is (project_id, issue_key).
//
// Everything DB/network is injectable so tests run hermetically (no SendGrid, no Slack). A publish or
// notification failure NEVER throws — a regression alarm must not be able to break the caller's flow
// (a feedback insert, a reconcile op, or a walk finish).

import type { Client } from "@libsql/client"
import { db } from "./db"
import { alertRecipients, projectSlackWebhook } from "./report-alert"
import { sendReportAlertEmail } from "./mail"
import { safeFetch } from "./safe-fetch"

export type RegressionSource = "memory" | "sim-reopen" | "guard"

// Collapse repeat detections of the same issue inside this window into a single alarm.
export const REGRESSION_DEDUP_WINDOW_MS = 60 * 60 * 1000 // 1 hour

export interface RegressionEventInput {
  projectId: string
  /** Stable issue identity — the recurrence issue_key / expectation dedup_key / trail-scoped key. */
  issueKey: string
  source: RegressionSource
  /** Short human summary, e.g. "signup regression, first fixed Mar 12". */
  title: string
  feedbackId?: string | null
  expectationId?: string | null
  /** When the original fix landed (drives "first fixed …" copy). epoch ms. */
  firstFixedAt?: number | null
  /** Free-form evidence refs (runId, traitId, occurrence ids, reasons) — stored as JSON. */
  evidence?: Record<string, unknown> | null
  /** epoch ms of detection. */
  at: number
  /** Server BASE (KLAV_BASE_URL) — deep-links are derived from it. */
  baseUrl?: string
}

export interface RegressionEventRow {
  id: string
  projectId: string
  issueKey: string
  source: RegressionSource
  title: string
  feedbackId: string | null
  expectationId: string | null
  firstFixedAt: number | null
  evidence: Record<string, unknown> | null
  createdAt: number
  acknowledgedAt: number | null
}

export interface RegressionEventDeps {
  db: Client
  sendEmail: (to: string[], subject: string, html: string, text: string) => Promise<void>
  postSlack: (webhookUrl: string, payload: unknown) => Promise<void>
  dedupWindowMs: number
  /** Skip the founder notification (used by tests / silent backfills). */
  notify: boolean
}

// ── schema (idempotent, additive) ────────────────────────────────────────────────
const ensured = new WeakSet<Client>()
export async function ensureRegressionEventsTable(c: Client): Promise<void> {
  if (ensured.has(c)) return
  await c.execute(
    `CREATE TABLE IF NOT EXISTS regression_events (
       id TEXT PRIMARY KEY,
       project_id TEXT NOT NULL,
       issue_key TEXT NOT NULL,
       source TEXT NOT NULL,
       title TEXT NOT NULL,
       feedback_id TEXT,
       expectation_id TEXT,
       first_fixed_at INTEGER,
       evidence_json TEXT,
       created_at INTEGER NOT NULL,
       acknowledged_at INTEGER
     )`,
  )
  await c.execute(
    `CREATE INDEX IF NOT EXISTS regression_events_proj_idx ON regression_events (project_id, created_at)`,
  ).catch(() => {})
  ensured.add(c)
}

function newId(): string {
  return "reg_" + (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random().toString(16).slice(2)}`)
}

function rowToEvent(x: any): RegressionEventRow {
  let evidence: Record<string, unknown> | null = null
  try { evidence = x.evidence_json ? JSON.parse(String(x.evidence_json)) : null } catch { evidence = null }
  return {
    id: String(x.id),
    projectId: String(x.project_id),
    issueKey: String(x.issue_key),
    source: String(x.source) as RegressionSource,
    title: String(x.title),
    feedbackId: x.feedback_id != null ? String(x.feedback_id) : null,
    expectationId: x.expectation_id != null ? String(x.expectation_id) : null,
    firstFixedAt: x.first_fixed_at != null ? Number(x.first_fixed_at) : null,
    evidence,
    createdAt: Number(x.created_at),
    acknowledgedAt: x.acknowledged_at != null ? Number(x.acknowledged_at) : null,
  }
}

/**
 * Was this issue ALREADY alarmed inside the dedup window? Any of the three detectors firing on the
 * same (project, issue) within the window collapses into the first event — no duplicate alarm.
 */
export async function recentEventForIssue(
  c: Client, projectId: string, issueKey: string, now: number, windowMs: number,
): Promise<RegressionEventRow | null> {
  await ensureRegressionEventsTable(c)
  const r = await c.execute({
    sql: `SELECT * FROM regression_events
          WHERE project_id=? AND issue_key=? AND created_at >= ?
          ORDER BY created_at DESC LIMIT 1`,
    args: [projectId, issueKey, now - windowMs],
  })
  return r.rows.length ? rowToEvent(r.rows[0]) : null
}

/**
 * Publish a regression event into the unified stream. Returns { published, deduped, event }:
 *   • published=true, deduped=false  → a fresh alarm (row inserted + notification fired).
 *   • published=false, deduped=true  → collapsed into an existing recent event (no new alarm).
 * NEVER throws — a regression alarm must not be able to fail the caller's flow.
 */
export async function publishRegressionEvent(
  input: RegressionEventInput, overrides: Partial<RegressionEventDeps> = {},
): Promise<{ published: boolean; deduped: boolean; event: RegressionEventRow | null }> {
  try {
    const c = overrides.db ?? db
    if (!c) return { published: false, deduped: false, event: null } // no DB (local dev) → nothing to do
    if (!input.projectId || !input.issueKey) return { published: false, deduped: false, event: null }
    const windowMs = overrides.dedupWindowMs ?? REGRESSION_DEDUP_WINDOW_MS
    const notify = overrides.notify ?? true

    const existing = await recentEventForIssue(c, input.projectId, input.issueKey, input.at, windowMs)
    if (existing) return { published: false, deduped: true, event: existing }

    const id = newId()
    await c.execute({
      sql: `INSERT INTO regression_events
              (id, project_id, issue_key, source, title, feedback_id, expectation_id, first_fixed_at, evidence_json, created_at, acknowledged_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      args: [
        id, input.projectId, input.issueKey, input.source, input.title.slice(0, 300),
        input.feedbackId ?? null, input.expectationId ?? null, input.firstFixedAt ?? null,
        input.evidence ? JSON.stringify(input.evidence) : null, input.at,
      ],
    })
    const event = rowToEvent({
      id, project_id: input.projectId, issue_key: input.issueKey, source: input.source,
      title: input.title, feedback_id: input.feedbackId ?? null, expectation_id: input.expectationId ?? null,
      first_fixed_at: input.firstFixedAt ?? null, evidence_json: input.evidence ? JSON.stringify(input.evidence) : null,
      created_at: input.at, acknowledged_at: null,
    })

    if (notify) await notifyRegression(c, input, overrides).catch((e: any) =>
      console.error("regression notify (non-fatal):", e?.message || e))

    return { published: true, deduped: false, event }
  } catch (err: any) {
    console.error("publishRegressionEvent (non-fatal):", err?.message || err)
    return { published: false, deduped: false, event: null }
  }
}

/** Recent regression events for a project's dashboard banner feed, newest-first. */
export async function listRegressionEvents(
  c: Client, projectId: string, opts: { limit?: number; sinceMs?: number; includeAcknowledged?: boolean } = {},
): Promise<RegressionEventRow[]> {
  await ensureRegressionEventsTable(c)
  const limit = Math.min(100, Math.max(1, opts.limit ?? 20))
  const since = opts.sinceMs != null ? opts.sinceMs : 0
  const ackClause = opts.includeAcknowledged ? "" : " AND acknowledged_at IS NULL"
  const r = await c.execute({
    sql: `SELECT * FROM regression_events
          WHERE project_id=? AND created_at >= ?${ackClause}
          ORDER BY created_at DESC LIMIT ?`,
    args: [projectId, since, limit],
  })
  return (r.rows as any[]).map(rowToEvent)
}

/** Dismiss a regression banner (marks acknowledged so it drops out of the default feed). */
export async function acknowledgeRegressionEvent(
  c: Client, projectId: string, eventId: string, now: number,
): Promise<boolean> {
  await ensureRegressionEventsTable(c)
  const r = await c.execute({
    sql: `UPDATE regression_events SET acknowledged_at=? WHERE id=? AND project_id=? AND acknowledged_at IS NULL`,
    args: [now, eventId, projectId],
  })
  return (r.rowsAffected ?? 0) > 0
}

// ── deep-links (mirror lib/report-alert.ts ticketUrl shape) ──────────────────────
function base(baseUrl?: string): string {
  return (baseUrl || "").replace(/\/+$/, "")
}
export function regressionTicketUrl(input: Pick<RegressionEventInput, "baseUrl" | "projectId" | "feedbackId">): string | null {
  if (!input.feedbackId) return `${base(input.baseUrl)}/dashboard?project=${encodeURIComponent(input.projectId)}#tickets`
  return `${base(input.baseUrl)}/dashboard?project=${encodeURIComponent(input.projectId)}&ticket=${encodeURIComponent(input.feedbackId)}#tickets`
}
/** Deep-link to the guard/expectations board. When no guard exists yet, this is the "Guard this" CTA
 *  pre-scoped to the issue (the B.1 guard flow reads ?guard=<feedbackId>). */
export function regressionGuardUrl(input: Pick<RegressionEventInput, "baseUrl" | "projectId" | "expectationId" | "feedbackId">): string {
  const b = `${base(input.baseUrl)}/dashboard?project=${encodeURIComponent(input.projectId)}`
  if (input.expectationId) return `${b}&expectation=${encodeURIComponent(input.expectationId)}#settings`
  if (input.feedbackId) return `${b}&guard=${encodeURIComponent(input.feedbackId)}#tickets`
  return `${b}#settings`
}

// ── formatting ────────────────────────────────────────────────────────────────────
function escapeHtml(s: string): string {
  return String(s || "").replace(/[<>&"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[ch] as string))
}

const SOURCE_LABEL: Record<RegressionSource, string> = {
  memory: "reported again after it was fixed",
  "sim-reopen": "a Sim raised it again after it was resolved",
  guard: "an AutoSim guard caught it",
}

export function regressionHeadline(input: RegressionEventInput): string {
  const fixed = input.firstFixedAt ? `, first fixed ${new Date(input.firstFixedAt).toISOString().slice(0, 10)}` : ""
  const verb = input.source === "guard" ? "Guard fired" : "Regression"
  return `${verb}: ${input.title}${fixed}`
}

export function buildRegressionEmail(input: RegressionEventInput): { subject: string; html: string; text: string } {
  const headline = regressionHeadline(input)
  const cause = SOURCE_LABEL[input.source]
  const ticket = regressionTicketUrl(input)
  const guard = regressionGuardUrl(input)
  const subject = `Regression detected on ${input.title}`.slice(0, 120)

  const text = [
    headline,
    "",
    `Why: ${cause}.`,
    ticket ? `Open the ticket: ${ticket}` : "",
    `Open the guard: ${guard}`,
  ].filter(Boolean).join("\n")

  const f = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
  const btn = (href: string, label: string, primary: boolean) =>
    `<a href="${escapeHtml(href)}" style="display:inline-block;margin:0 8px 0 0;background:${primary ? "#dc2626" : "#4f46e5"};color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px">${escapeHtml(label)}</a>`
  const html = `<div style="${f};color:#1d1d24;max-width:560px">
  <p style="margin:0 0 12px;font-size:15px"><b style="color:#dc2626">Regression detected</b></p>
  <div style="border:1px solid #fecaca;background:#fef2f2;border-radius:10px;padding:14px 16px;margin:0 0 14px">
    <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#7f1d1d">${escapeHtml(headline)}</p>
    <p style="margin:0;font-size:13px;color:#9a3412">Why it fired: ${escapeHtml(cause)}.</p>
  </div>
  <p style="margin:16px 0 0">${ticket ? btn(ticket, "Open the ticket", true) : ""}${btn(guard, input.expectationId ? "Open the guard" : "Guard this", false)}</p>
  <p style="margin:18px 0 0;font-size:11px;color:#b6b3c0">Sent by Klavity the moment a regression is detected. One alarm per issue per hour.</p>
</div>`

  return { subject, html, text }
}

// Compact Block-Kit payload (no emoji — CI guard).
export function buildRegressionSlackPayload(input: RegressionEventInput): { text: string; blocks: unknown[] } {
  const headline = regressionHeadline(input)
  const cause = SOURCE_LABEL[input.source]
  const ticket = regressionTicketUrl(input)
  const guard = regressionGuardUrl(input)
  const elements: Array<Record<string, unknown>> = []
  if (ticket) elements.push({ type: "button", text: { type: "plain_text", text: "Open the ticket", emoji: false }, url: ticket })
  elements.push({ type: "button", text: { type: "plain_text", text: input.expectationId ? "Open the guard" : "Guard this", emoji: false }, url: guard })
  return {
    text: headline,
    blocks: [
      { type: "header", text: { type: "plain_text", text: "Regression detected", emoji: false } },
      { type: "section", text: { type: "mrkdwn", text: `*${headline}*\n${cause}.` } },
      { type: "actions", elements },
    ],
  }
}

// ── default transports ────────────────────────────────────────────────────────────
async function defaultPostSlack(webhookUrl: string, payload: unknown): Promise<void> {
  const res = await safeFetch(
    webhookUrl,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) },
    { allowHosts: ["hooks.slack.com"] },
  )
  if (!res.ok) console.error(`regression slack alert: webhook returned ${res.status}`)
}

/**
 * Fire the founder notification for a fresh regression event. Both channels are best-effort and
 * independent — an email failure must not stop Slack, and neither can throw out of publish.
 * Email recipients come from the project's account owner/admins; Slack from the project webhook —
 * the SAME lookups the new-report alarm (lib/report-alert.ts) uses.
 */
async function notifyRegression(
  c: Client, input: RegressionEventInput, overrides: Partial<RegressionEventDeps>,
): Promise<void> {
  const sendEmail = overrides.sendEmail ?? sendReportAlertEmail
  const postSlack = overrides.postSlack ?? defaultPostSlack

  // Resolve the account for recipient lookup (falls back gracefully if the project row is gone).
  let accountId: string | null = null
  try {
    const r = await c.execute({ sql: "SELECT account_id FROM projects WHERE id=?", args: [input.projectId] })
    accountId = r.rows.length ? String((r.rows[0] as any).account_id ?? "") || null : null
  } catch { accountId = null }

  // 1. Email — to account owner/admins (NOT throttled: a regression is rare and always worth an email).
  try {
    if (accountId) {
      const to = await alertRecipients(c, accountId)
      if (to.length) {
        const { subject, html, text } = buildRegressionEmail(input)
        await sendEmail(to, subject, html, text)
      }
    }
  } catch (err: any) {
    console.error("regression alert email (non-fatal):", err?.message || err)
  }

  // 2. Slack — per project webhook (hooks.slack.com only, validated by projectSlackWebhook).
  try {
    const hook = await projectSlackWebhook(c, input.projectId)
    if (hook) await postSlack(hook, buildRegressionSlackPayload(input))
  } catch (err: any) {
    console.error("regression alert slack (non-fatal):", err?.message || err)
  }
}
