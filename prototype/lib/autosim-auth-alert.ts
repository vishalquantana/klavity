// KLA-179: founder-style alert when an AutoSim run gets stopped at an auth gate (login form, OTP
// prompt, or an OAuth-only wall) and the project has no verified auth method to get past it.
//
// The run does NOT fail — the driver classifies the page as an auth gate, suspends the session in a
// resumable `needs_auth` state (step position + checkpoint persisted, see trails-author.ts), and we
// fire this best-effort alert so the founder can hand their Sim a key.
//
// Two channels, both fire-and-forget — a notification failure must NEVER affect the run or the DB
// record (same contract as lib/report-alert.ts / lib/signup-alert.ts):
//
//   1. EMAIL to the project's owner/admins (fallback: accounts.owner_email), via the same SendGrid
//      transport the report/OTP flows use (lib/mail.ts).
//   2. SLACK to the global SLACK_ALERT_WEBHOOK_URL (fallback SLACK_SIGNUP_WEBHOOK_URL), same channel
//      walk-red-alert posts to.
//
// Both share ONE throttle slot: at most ONE alert per project per DAY for this cause. The auth-gate
// situation is sticky (the run stays paused until a human acts), so re-alerting every run would just
// be noise. State lives in the `autosim_auth_alert_state` table (NOT memory) so the throttle
// survives deploy restarts. Every DB/network dependency is injectable so tests run hermetically.
//
// The deep link points at the AT2 router screen at /autosims (project-scoped) — that's where the
// founder attaches a test account / verified auth method and resumes the paused Sim.

import type { Client } from "@libsql/client"
import { db } from "./db"
import { sendReportAlertEmail } from "./mail"
import { alertRecipients } from "./report-alert"
import { safeFetch } from "./safe-fetch"

// One alert per project per DAY for the auth-gate cause.
export const AUTOSIM_AUTH_ALERT_WINDOW_MS = 24 * 60 * 60 * 1000

export interface AutosimAuthAlertInput {
  projectId: string
  projectName: string
  /** projects.account_id — drives the owner/admin recipient lookup. */
  accountId: string
  /** author_sessions.id of the paused run (context for the alert, not the deep-link target). */
  sessionId: string
  /** URL of the auth gate the Sim stopped at. */
  pageUrl: string
  /** One-sentence model rationale ("this is a login form", etc.). */
  rationale: string
  /** Server BASE (KLAV_BASE_URL) — the /autosims deep link is derived from it. */
  baseUrl: string
  /** epoch ms when the run hit the gate */
  at: number
}

export interface AutosimAuthAlertDeps {
  db: Client
  sendEmail: (to: string[], subject: string, html: string, text: string) => Promise<void>
  postSlack: (webhookUrl: string, payload: unknown) => Promise<void>
  /** Global Slack webhook; defaults to SLACK_ALERT_WEBHOOK_URL || SLACK_SIGNUP_WEBHOOK_URL. */
  slackWebhook: string | null
  windowMs: number
}

// ── throttle state (DB-backed so it survives restarts) ───────────────────────────
const ensured = new WeakSet<Client>()
export async function ensureAutosimAuthAlertTable(c: Client): Promise<void> {
  if (ensured.has(c)) return
  await c.execute(
    `CREATE TABLE IF NOT EXISTS autosim_auth_alert_state (
       project_id TEXT PRIMARY KEY,
       last_alert_at INTEGER NOT NULL DEFAULT 0
     )`,
  )
  ensured.add(c)
}

/**
 * Decide whether THIS run may fire an auth-gate alert for the project. Returns true once per
 * `windowMs` (default 1 day); atomically stamps the row (conditional UPDATE on the prior
 * last_alert_at) so two racing runs can't both claim the slot. last=0 means "never alerted" → send.
 */
export async function claimAuthAlertSlot(
  c: Client, projectId: string, now: number, windowMs: number = AUTOSIM_AUTH_ALERT_WINDOW_MS,
): Promise<boolean> {
  await ensureAutosimAuthAlertTable(c)
  await c.execute({
    sql: "INSERT OR IGNORE INTO autosim_auth_alert_state (project_id, last_alert_at) VALUES (?, 0)",
    args: [projectId],
  })
  const cur = await c.execute({
    sql: "SELECT last_alert_at FROM autosim_auth_alert_state WHERE project_id=?",
    args: [projectId],
  })
  const last = Number((cur.rows[0] as any)?.last_alert_at || 0)
  if (last !== 0 && now - last < windowMs) return false
  const claim = await c.execute({
    sql: "UPDATE autosim_auth_alert_state SET last_alert_at=? WHERE project_id=? AND last_alert_at=?",
    args: [now, projectId, last],
  })
  return (claim.rowsAffected ?? 0) > 0
}

// ── deep link → AT2 router screen (/autosims) ───────────────────────────────────
export function autosimRouterUrl(input: Pick<AutosimAuthAlertInput, "baseUrl" | "projectId">): string {
  return `${input.baseUrl.replace(/\/+$/, "")}/autosims?project=${encodeURIComponent(input.projectId)}`
}

// ── formatting ──────────────────────────────────────────────────────────────────
export function truncate(s: string, n: number): string {
  const t = String(s || "")
  return t.length > n ? t.slice(0, n - 3) + "..." : t
}

function escapeHtml(s: string): string {
  return String(s || "").replace(/[<>&"]/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[ch] as string))
}

// Founder-voice copy: "Your Sim got stopped at the door, give it a key."
export function buildAuthGateEmail(input: AutosimAuthAlertInput): { subject: string; html: string; text: string } {
  const link = autosimRouterUrl(input)
  const gate = truncate(input.pageUrl, 120)
  const subject = `Your Sim got stopped at the door on ${input.projectName} — give it a key`

  const textLines = [
    `Your Sim got stopped at the door on ${input.projectName}.`,
    "",
    `It was exploring, hit a login screen, and there's no verified auth method on this project to get`,
    `past it. So instead of failing the run, we paused it — it's waiting right where it stopped.`,
    "",
    `Where it stopped: ${gate}`,
    input.rationale ? `Why: ${truncate(input.rationale, 160)}` : "",
    "",
    `Give it a key: add a test account / verified auth method and resume the Sim.`,
    `Open AutoSims: ${link}`,
  ].filter((l, i, a) => l !== "" || a[i - 1] !== "")
  const text = textLines.join("\n")

  const f = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
  const html = `<div style="${f};color:#1d1d24;max-width:560px">
  <p style="margin:0 0 12px;font-size:15px"><b>Your Sim got stopped at the door on ${escapeHtml(input.projectName)}.</b></p>
  <p style="margin:0 0 14px;font-size:14px;line-height:1.55;color:#3f3a52">It was exploring, hit a login screen, and there's no verified auth method on this project to get past it. So instead of failing the run, we <b>paused</b> it — it's waiting right where it stopped.</p>
  <div style="border:1px solid #e6e4ff;background:#f7f6ff;border-radius:10px;padding:14px 16px;margin:0 0 14px">
    <p style="margin:0 0 6px;font-size:13px;color:#6b6678">Where it stopped: <b>${escapeHtml(gate)}</b></p>
    ${input.rationale ? `<p style="margin:0;font-size:13px;color:#6b6678">Why: ${escapeHtml(truncate(input.rationale, 160))}</p>` : ""}
  </div>
  <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#3f3a52">Give it a key: add a test account / verified auth method and resume the Sim.</p>
  <p style="margin:16px 0 0"><a href="${escapeHtml(link)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px">Give it a key</a></p>
  <p style="margin:18px 0 0;font-size:11px;color:#b6b3c0">Sent by Klavity when a Sim gets stopped at an auth gate. At most one email per project per day for this.</p>
</div>`

  return { subject, html, text }
}

// Compact Block-Kit payload (no emoji — CI guard, mirrors report-alert.ts).
export function buildAuthGateSlackPayload(input: AutosimAuthAlertInput): { text: string; blocks: unknown[] } {
  const link = autosimRouterUrl(input)
  const fields: Array<{ type: string; text: string }> = [
    { type: "mrkdwn", text: `*Project*\n${input.projectName}` },
    { type: "mrkdwn", text: `*Stopped at*\n${truncate(input.pageUrl, 120)}` },
  ]
  if (input.rationale) fields.push({ type: "mrkdwn", text: `*Why*\n${truncate(input.rationale, 160)}` })
  return {
    text: `Your Sim got stopped at the door on ${input.projectName} — give it a key`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: "AutoSim paused: stopped at the door", emoji: false } },
      { type: "section", text: { type: "mrkdwn", text: `A Sim on *${input.projectName}* hit a login screen with no verified auth method. It's paused (not failed) and waiting for a key.` } },
      { type: "section", fields },
      { type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "Give it a key", emoji: false }, url: link }] },
      { type: "context", elements: [{ type: "mrkdwn", text: `Run \`${input.sessionId}\` · Project \`${input.projectId}\`` }] },
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
  if (!res.ok) console.error(`autosim auth alert slack: webhook returned ${res.status}`)
}

// ── orchestration ──────────────────────────────────────────────────────────────────
/**
 * Fire-and-forget entrypoint, called from runAuthorNow's onNeedsAuth hook. NEVER throws — every
 * path (throttle DB, SendGrid, Slack) is guarded independently. One throttle slot gates BOTH
 * channels: max one alert per project per day for the auth-gate cause.
 */
export async function notifyAutosimNeedsAuth(
  input: AutosimAuthAlertInput, overrides: Partial<AutosimAuthAlertDeps> = {},
): Promise<void> {
  try {
    const c = overrides.db ?? db
    if (!c) return // no DB configured (local dev without Turso) → nothing to do
    const windowMs = overrides.windowMs ?? AUTOSIM_AUTH_ALERT_WINDOW_MS
    const sendEmail = overrides.sendEmail ?? sendReportAlertEmail
    const postSlack = overrides.postSlack ?? defaultPostSlack
    const slackWebhook = overrides.slackWebhook !== undefined
      ? overrides.slackWebhook
      : (process.env.SLACK_ALERT_WEBHOOK_URL || process.env.SLACK_SIGNUP_WEBHOOK_URL || null)

    // Single throttle slot for the whole alert (email + slack) — 1 per project per day.
    const send = await claimAuthAlertSlot(c, input.projectId, input.at, windowMs)
    if (!send) return

    // 1. Email — owner/admins of the account.
    try {
      const to = await alertRecipients(c, input.accountId)
      if (to.length) {
        const { subject, html, text } = buildAuthGateEmail(input)
        await sendEmail(to, subject, html, text)
      }
    } catch (err: any) {
      console.error("autosim auth alert email (non-fatal):", err?.message || err)
    }

    // 2. Slack — global alert channel.
    try {
      if (slackWebhook) await postSlack(slackWebhook, buildAuthGateSlackPayload(input))
    } catch (err: any) {
      console.error("autosim auth alert slack (non-fatal):", err?.message || err)
    }
  } catch (err: any) {
    console.error("autosim auth alert (non-fatal):", err?.message || err)
  }
}
