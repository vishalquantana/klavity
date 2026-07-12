// Budget-resume request notifications (server.ts → POST /api/sim/request-resume).
//
// When the daily Sim review budget is exhausted the whole project's review_mode is auto-paused
// (server.ts /api/sim/review, gate f). Only an admin can resume — so a member who hits the wall
// has no path forward and, until now, the admin was never told. This lib is the member's escape
// hatch: a "request resume" that notifies a project admin so they can un-pause without SSH/API
// surgery (JTBD 3.11 — "unblock the budget dead-end").
//
// Two channels, both best-effort and invoked fire-and-forget — a notification failure must NEVER
// fail the member's request (same contract as lib/report-alert.ts / lib/signup-alert.ts):
//
//   1. EMAIL to the project's account owner/admins (fallback: accounts.owner_email), via the same
//      SendGrid transport the report alert uses (lib/mail.ts sendReportAlertEmail). Flood-controlled:
//      at most ONE email per project per RESUME_ALERT_WINDOW_MS (10 min) so a member re-clicking
//      "request resume" can't spam admins. Requests inside the window bump a DB-backed pending
//      counter; the next sent email says "+N more members are waiting". State lives in the
//      `budget_resume_alert_state` table (NOT memory) so it survives deploy restarts.
//
//   2. Optional per-project SLACK webhook (modal_config_json.slack_webhook_url, admin-set) — one
//      compact Block-Kit message per request. SSRF posture: only https://hooks.slack.com/... URLs
//      are honored and the outbound POST goes through safeFetch with an allowHosts pin.
//
// Every DB/network dependency is injectable so tests run hermetically (no SendGrid, no Slack).

import type { Client } from "@libsql/client"
import { db } from "./db"
import { sendReportAlertEmail } from "./mail"
import { safeFetch } from "./safe-fetch"

export const RESUME_ALERT_WINDOW_MS = 10 * 60 * 1000 // 1 email per project per 10 minutes

export interface ResumeAlertInput {
  projectId: string
  projectName: string
  /** projects.account_id — drives the owner/admin recipient lookup. */
  accountId: string
  /** The member who hit the exhausted budget and asked for a resume. */
  requesterEmail: string
  /** The page the member was on when they were blocked (best-effort, may be null). */
  pageUrl: string | null
  /** Server BASE (KLAV_BASE_URL) — the dashboard settings/resume link is derived from it. */
  baseUrl: string
  /** epoch ms of the request */
  at: number
}

export interface ResumeAlertDeps {
  db: Client
  sendEmail: (to: string[], subject: string, html: string, text: string) => Promise<void>
  postSlack: (webhookUrl: string, payload: unknown) => Promise<void>
  windowMs: number
}

// ── throttle state (DB-backed so it survives restarts) ───────────────────────────
// One row per project: last_email_at = when we last actually sent, pending_count = requests that
// arrived (and were skipped) since then.
const ensured = new WeakSet<Client>()
export async function ensureResumeAlertTable(c: Client): Promise<void> {
  if (ensured.has(c)) return
  await c.execute(
    `CREATE TABLE IF NOT EXISTS budget_resume_alert_state (
       project_id TEXT PRIMARY KEY,
       last_email_at INTEGER NOT NULL DEFAULT 0,
       pending_count INTEGER NOT NULL DEFAULT 0
     )`,
  )
  ensured.add(c)
}

/**
 * Decide whether THIS resume request may send an email for the project. Mirrors report-alert's
 * claimAlertSlot: atomic conditional-UPDATE claim so two racing members can't both send, window
 * elapsed → send (missedSinceLast = requests skipped since the previous email), otherwise bump
 * the pending counter.
 */
export async function claimResumeSlot(
  c: Client, projectId: string, now: number, windowMs: number = RESUME_ALERT_WINDOW_MS,
): Promise<{ send: boolean; missedSinceLast: number }> {
  await ensureResumeAlertTable(c)
  await c.execute({
    sql: "INSERT OR IGNORE INTO budget_resume_alert_state (project_id, last_email_at, pending_count) VALUES (?, 0, 0)",
    args: [projectId],
  })
  const cur = await c.execute({
    sql: "SELECT last_email_at, pending_count FROM budget_resume_alert_state WHERE project_id=?",
    args: [projectId],
  })
  const last = Number((cur.rows[0] as any)?.last_email_at || 0)
  const pending = Number((cur.rows[0] as any)?.pending_count || 0)

  // last=0 means "never emailed for this project" → always send (don't treat epoch 0 as recent).
  if (last === 0 || now - last >= windowMs) {
    const claim = await c.execute({
      sql: "UPDATE budget_resume_alert_state SET last_email_at=?, pending_count=0 WHERE project_id=? AND last_email_at=?",
      args: [now, projectId, last],
    })
    if ((claim.rowsAffected ?? 0) > 0) return { send: true, missedSinceLast: pending }
    // Lost the race — a concurrent request just claimed the slot; this one becomes a pending bump.
  }
  await c.execute({
    sql: "UPDATE budget_resume_alert_state SET pending_count=pending_count+1 WHERE project_id=?",
    args: [projectId],
  })
  return { send: false, missedSinceLast: 0 }
}

// ── recipients: account owner + admins; fallback to accounts.owner_email ─────────
// (Same query as report-alert.alertRecipients — the resume request goes to whoever can un-pause.)
export async function resumeRecipients(c: Client, accountId: string): Promise<string[]> {
  const r = await c.execute({
    sql: `SELECT email FROM account_members WHERE account_id=? AND account_role IN ('owner','admin')
          ORDER BY CASE account_role WHEN 'owner' THEN 0 ELSE 1 END, created_at ASC, email ASC`,
    args: [accountId],
  })
  let emails = r.rows.map((x: any) => String(x.email).trim().toLowerCase()).filter(Boolean)
  if (!emails.length) {
    const o = await c.execute({ sql: "SELECT owner_email FROM accounts WHERE id=?", args: [accountId] })
    const owner = o.rows.length ? String((o.rows[0] as any).owner_email || "").trim().toLowerCase() : ""
    if (owner) emails = [owner]
  }
  return [...new Set(emails)]
}

// ── per-project Slack webhook (modal_config_json.slack_webhook_url) ──────────────
export async function projectSlackWebhook(c: Client, projectId: string): Promise<string | null> {
  try {
    const r = await c.execute({ sql: "SELECT modal_config_json FROM projects WHERE id=?", args: [projectId] })
    if (!r.rows.length) return null
    const cfg = JSON.parse(String((r.rows[0] as any).modal_config_json || "{}")) || {}
    const raw = typeof cfg.slack_webhook_url === "string" ? cfg.slack_webhook_url.trim() : ""
    return /^https:\/\/hooks\.slack\.com\//.test(raw) && raw.length <= 500 ? raw : null
  } catch {
    return null
  }
}

// ── formatting ────────────────────────────────────────────────────────────────────
function escapeHtml(s: string): string {
  return String(s || "").replace(/[<>&"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[ch] as string))
}

function truncate(s: string, n: number): string {
  const t = String(s || "")
  return t.length > n ? t.slice(0, n - 3) + "..." : t
}

// The dashboard's project Settings view is hash-routed; the admin resumes there (or via the
// per-project pause/resume affordance). Same query-param + hash shape as report-alert's ticketUrl.
export function resumeUrl(input: Pick<ResumeAlertInput, "baseUrl" | "projectId">): string {
  return `${input.baseUrl.replace(/\/+$/, "")}/dashboard?project=${encodeURIComponent(input.projectId)}#settings`
}

export function buildResumeEmail(
  input: ResumeAlertInput, missedSinceLast: number,
): { subject: string; html: string; text: string } {
  const link = resumeUrl(input)
  const more = missedSinceLast > 0 ? `+${missedSinceLast} more members are waiting` : ""
  const subject = `Sim reviews paused on ${input.projectName} — a member asked you to resume`

  const textLines = [
    `Sim reviews are paused on ${input.projectName}.`,
    "",
    `The daily Sim review budget was reached, so Klavity auto-paused reviews for this project.`,
    `${input.requesterEmail} is trying to run Sims and asked you to resume.`,
    "",
    input.pageUrl ? `They were on: ${input.pageUrl}` : "",
    more,
    "",
    `Resume reviews: ${link}`,
    `(You can also raise the daily review budget in the same Settings view.)`,
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "")
  const text = textLines.join("\n")

  const f = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
  const html = `<div style="${f};color:#1d1d24;max-width:560px">
  <p style="margin:0 0 12px;font-size:15px">Sim reviews are <b>paused</b> on <b>${escapeHtml(input.projectName)}</b>.</p>
  <div style="border:1px solid #e6e4ff;background:#f7f6ff;border-radius:10px;padding:14px 16px;margin:0 0 14px">
    <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#3f3a52">The project reached today's Sim review budget, so Klavity auto-paused reviews to cap AI spend.</p>
    <p style="margin:0;font-size:14px;line-height:1.55;color:#3f3a52"><b>${escapeHtml(input.requesterEmail)}</b> is trying to run Sims and asked you to resume.</p>
  </div>
  ${input.pageUrl ? `<p style="margin:0 0 6px;font-size:13px;color:#6b6678">They were on: ${escapeHtml(input.pageUrl)}</p>` : ""}
  ${more ? `<p style="margin:0 0 6px;font-size:13px;color:#6366f1"><b>${escapeHtml(more)}</b></p>` : ""}
  <p style="margin:16px 0 0"><a href="${escapeHtml(link)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px">Resume reviews</a></p>
  <p style="margin:12px 0 0;font-size:13px;color:#6b6678">You can also raise the daily review budget in the same Settings view.</p>
  <p style="margin:18px 0 0;font-size:11px;color:#b6b3c0">Sent by Klavity when a member asks to resume paused Sim reviews. At most one email per project every 10 minutes.</p>
</div>`

  return { subject, html, text }
}

// Compact Block-Kit payload (no emoji — CI guard), modeled on report-alert.buildReportSlackPayload.
export function buildResumeSlackPayload(input: ResumeAlertInput): { text: string; blocks: unknown[] } {
  const link = resumeUrl(input)
  const fields: Array<{ type: string; text: string }> = [
    { type: "mrkdwn", text: `*Project*\n${input.projectName}` },
    { type: "mrkdwn", text: `*Requested by*\n${input.requesterEmail}` },
  ]
  if (input.pageUrl) fields.push({ type: "mrkdwn", text: `*Page*\n${truncate(input.pageUrl, 120)}` })
  return {
    text: `${input.requesterEmail} asked you to resume paused Sim reviews on ${input.projectName}`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: `Resume Sim reviews: ${input.projectName}`, emoji: false } },
      { type: "section", text: { type: "mrkdwn", text: `The daily Sim review budget was reached and reviews were auto-paused. A member is waiting to run Sims.` } },
      { type: "section", fields },
      { type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "Resume in Klavity", emoji: false }, url: link }] },
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
  if (!res.ok) console.error(`budget resume slack alert: webhook returned ${res.status}`)
}

// ── orchestration ──────────────────────────────────────────────────────────────────
/**
 * Fire-and-forget entrypoint called from POST /api/sim/request-resume after access is verified.
 * NEVER throws — every path (throttle DB, SendGrid, Slack) is guarded independently so a
 * notification failure can't fail the member's request, and an email failure can't stop Slack.
 * Returns whether an email was actually sent (for the route to shape a helpful response).
 */
export async function notifyBudgetResumeRequest(
  input: ResumeAlertInput, overrides: Partial<ResumeAlertDeps> = {},
): Promise<{ emailed: boolean; recipients: number }> {
  let emailed = false
  let recipients = 0
  try {
    const c = overrides.db ?? db
    if (!c) return { emailed, recipients } // no DB configured → nothing to do
    const windowMs = overrides.windowMs ?? RESUME_ALERT_WINDOW_MS
    const sendEmail = overrides.sendEmail ?? sendReportAlertEmail
    const postSlack = overrides.postSlack ?? defaultPostSlack

    // 1. Email — throttled per project (DB-backed, restart-safe).
    try {
      const slot = await claimResumeSlot(c, input.projectId, input.at, windowMs)
      if (slot.send) {
        const to = await resumeRecipients(c, input.accountId)
        recipients = to.length
        if (to.length) {
          const { subject, html, text } = buildResumeEmail(input, slot.missedSinceLast)
          await sendEmail(to, subject, html, text)
          emailed = true
        }
      }
    } catch (err: any) {
      console.error("budget resume alert email (non-fatal):", err?.message || err)
    }

    // 2. Slack — per request, only when the project config carries a hooks.slack.com URL.
    try {
      const hook = await projectSlackWebhook(c, input.projectId)
      if (hook) await postSlack(hook, buildResumeSlackPayload(input))
    } catch (err: any) {
      console.error("budget resume alert slack (non-fatal):", err?.message || err)
    }
  } catch (err: any) {
    console.error("budget resume alert (non-fatal):", err?.message || err)
  }
  return { emailed, recipients }
}
