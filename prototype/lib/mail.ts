import { logOutboundEmail } from "./db"
import { recordEmailSend } from "./cost-events"

// ── Outbound-email failure alerting (KLAVITYKLA-405/406) ───────────────────────
// A silent mail outage (e.g. the SendGrid OTP incident) must never go unnoticed.
// Whenever a send through sgSend() FAILS — a non-2xx SendGrid response OR a thrown
// error — we post a best-effort Slack alert so on-call sees it immediately. This is
// strictly additive: it NEVER throws, NEVER blocks the caller, and NEVER changes the
// send result. If no webhook is configured it is a silent no-op (console.error still
// happens upstream). Privacy: we send the recipient DOMAIN only, never the address.

const MAIL_ALERT_WINDOW_MS = 10 * 60 * 1000 // one alert per (type,status) per 10 min

// In-memory de-dup so a mass outage (hundreds of failing sends) posts at most one
// Slack alert per (type,status) per window instead of flooding the channel.
const mailAlertLast = new Map<string, number>()

// Test hook: the most recently fired (fire-and-forget) alert promise, so a test can
// deterministically await the async Slack post. Not used in production code paths.
let _lastMailAlertPromise: Promise<void> = Promise.resolve()
export function __mailAlertTail(): Promise<void> {
  return _lastMailAlertPromise
}
export function __resetMailAlertDedup(): void {
  mailAlertLast.clear()
}

function mailAlertWebhook(): string | null {
  return (
    process.env.SLACK_MAIL_ALERT_WEBHOOK_URL ||
    process.env.SLACK_ALERT_WEBHOOK_URL ||
    process.env.SLACK_SIGNUP_WEBHOOK_URL ||
    null
  )
}

function shouldMailAlert(key: string, now: number): boolean {
  const last = mailAlertLast.get(key)
  if (last != null && now - last < MAIL_ALERT_WINDOW_MS) return false
  mailAlertLast.set(key, now)
  return true
}

/** Unique recipient DOMAINS ("@example.com"), never the local part — privacy. */
function recipientDomains(to: string[]): string {
  const set = new Set<string>()
  for (const a of to) {
    const at = String(a).lastIndexOf("@")
    set.add(at >= 0 ? String(a).slice(at).toLowerCase() : "@unknown")
  }
  return Array.from(set).join(", ") || "@unknown"
}

/** Short, log-safe reason: strip any addresses/bearer tokens, cap length. */
function sanitizeReason(reason: string | null | undefined): string {
  if (!reason) return "(no detail)"
  return String(reason)
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    // Redact the local-part of ANY local@domain token, keeping only the domain — privacy.
    // The domain is intentionally NOT required to contain a dot: a bare intranet address like
    // "secretuser@test" must have its local-part stripped just as "x@y.com" does, or the
    // sensitive local-part leaks into the Slack payload.
    .replace(/[^\s@]+@([^\s@]+)/g, "@$1")
    .slice(0, 200)
}

export interface MailFailure {
  type: string
  to: string[]
  status: number // SendGrid HTTP status, or 0 for a thrown/network error
  reason?: string | null
}

/** Slack Block-Kit payload for a failed send (exported for testing). */
export function buildMailFailurePayload(f: MailFailure, whenIso: string): unknown {
  const domain = recipientDomains(f.to)
  const statusLabel = f.status ? String(f.status) : "network error"
  const reason = sanitizeReason(f.reason)
  return {
    text: `📪 Klavity email FAILED to send: ${f.type} -> ${domain} (${statusLabel})`,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: "📪 *Outbound email failed* — a transactional mail did not go out." } },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Type:*\n${f.type}` },
          { type: "mrkdwn", text: `*Recipient domain:*\n${domain}` },
          { type: "mrkdwn", text: `*SendGrid status:*\n${statusLabel}` },
          { type: "mrkdwn", text: `*When:*\n${whenIso}` },
        ],
      },
      { type: "context", elements: [{ type: "mrkdwn", text: `Reason: \`${reason}\`` }] },
    ],
  }
}

/**
 * Best-effort Slack alert for a failed outbound email. NEVER throws, NEVER blocks
 * the caller (fire-and-forget), NEVER exposes a full address. No-op when no webhook
 * is configured or when the (type,status) was already alerted inside the window.
 */
export async function alertMailFailure(f: MailFailure): Promise<void> {
  try {
    const webhook = mailAlertWebhook()
    if (!webhook) return
    const now = Date.now()
    if (!shouldMailAlert(`${f.type}:${f.status}`, now)) return
    const payload = buildMailFailurePayload(f, new Date(now).toISOString())
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) console.error(`mail-fail slack alert: webhook returned ${res.status}`)
  } catch (err: any) {
    console.error("mail-fail slack alert (non-fatal):", err?.message || err)
  }
}

/** Fire the alert without blocking or affecting the caller; records the promise for tests. */
function fireMailFailure(f: MailFailure): void {
  _lastMailAlertPromise = alertMailFailure(f)
  void _lastMailAlertPromise
}

// ── Evidence-drop alerting (KLAVITYKLA-453) ────────────────────────────────────
// When a report's screenshot / attachment / recording BYTES fail to upload to object
// storage (S3 unconfigured, or a write error), the report still persists but that
// evidence is silently dropped — no `screenshots` row / empty `attachments_json`. On a
// misconfigured prod that is silent evidence loss: the exact "I told you multiple times"
// failure. Whenever the ingest handler drops evidence it fires a best-effort Slack alert
// so on-call sees it immediately. Strictly additive: it NEVER throws, NEVER blocks the
// caller (fire-and-forget), and NEVER changes the ingest result. No-op when no webhook is
// configured. Reuses the mail webhook resolution + the same secret redactor (sanitizeReason).

const EVIDENCE_ALERT_WINDOW_MS = 10 * 60 * 1000 // one alert per (project,reason) per 10 min

// In-memory de-dup so a broken S3 (every report dropping evidence) posts at most one Slack
// alert per (project,reason) per window instead of flooding the channel.
const evidenceAlertLast = new Map<string, number>()

// Test hook: the most recently fired (fire-and-forget) evidence-drop alert promise, so a
// test can deterministically await the async Slack post. Not used in production code paths.
let _lastEvidenceAlertPromise: Promise<void> = Promise.resolve()
export function __evidenceAlertTail(): Promise<void> {
  return _lastEvidenceAlertPromise
}
export function __resetEvidenceAlertDedup(): void {
  evidenceAlertLast.clear()
}

function shouldEvidenceAlert(key: string, now: number): boolean {
  const last = evidenceAlertLast.get(key)
  if (last != null && now - last < EVIDENCE_ALERT_WINDOW_MS) return false
  evidenceAlertLast.set(key, now)
  return true
}

export interface EvidenceDropped {
  projectId: string
  feedbackId?: string | null
  screenshots: number
  attachments: number
  recordings: number
  reason?: string | null // sanitized here — any secret/address is redacted before it leaves
}

/** Slack Block-Kit payload for dropped report evidence (exported for testing). */
export function buildEvidenceDroppedPayload(e: EvidenceDropped, whenIso: string): unknown {
  const reason = sanitizeReason(e.reason)
  const total = e.screenshots + e.attachments + e.recordings
  const droppedLine = `${e.screenshots} screenshot(s), ${e.attachments} attachment(s), ${e.recordings} recording(s)`
  return {
    text: `🗑️ Klavity DROPPED ${total} evidence item(s) on report ${e.feedbackId || "(not persisted)"} — object storage upload failed`,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: "🗑️ *Report evidence dropped* — screenshot/attachment/recording bytes failed to store. The report was saved WITHOUT them (silent evidence loss — check object-storage config)." } },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Project:*\n${e.projectId}` },
          { type: "mrkdwn", text: `*Feedback:*\n${e.feedbackId || "(not persisted)"}` },
          { type: "mrkdwn", text: `*Dropped:*\n${droppedLine}` },
          { type: "mrkdwn", text: `*When:*\n${whenIso}` },
        ],
      },
      { type: "context", elements: [{ type: "mrkdwn", text: `Reason: \`${reason}\`` }] },
    ],
  }
}

/**
 * Best-effort Slack alert for dropped report evidence. NEVER throws, NEVER blocks the
 * caller (fire-and-forget). No-op when no webhook is configured, when nothing was actually
 * dropped, or when the (project,reason) was already alerted inside the window.
 */
export async function alertEvidenceDropped(e: EvidenceDropped): Promise<void> {
  try {
    const total = e.screenshots + e.attachments + e.recordings
    if (total <= 0) return
    const webhook = mailAlertWebhook()
    if (!webhook) return
    const now = Date.now()
    // Dedup keyed on project + SANITIZED reason so a broken S3 doesn't spam the channel.
    const reason = sanitizeReason(e.reason)
    if (!shouldEvidenceAlert(`${e.projectId}:${reason}`, now)) return
    const payload = buildEvidenceDroppedPayload(e, new Date(now).toISOString())
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) console.error(`evidence-drop slack alert: webhook returned ${res.status}`)
  } catch (err: any) {
    console.error("evidence-drop slack alert (non-fatal):", err?.message || err)
  }
}

/** Fire the evidence-drop alert without blocking or affecting the caller; records the promise for tests. */
export function fireEvidenceDropped(e: EvidenceDropped): void {
  _lastEvidenceAlertPromise = alertEvidenceDropped(e)
  void _lastEvidenceAlertPromise
}

// A short, on-brand line under the code — picks one deterministically from the
// code so it varies between sends but stays stable for a given code (testable,
// no Math.random). Same energy as a sign-in email that doesn't feel robotic.
const OTP_NOTES = [
  "It's not a bug — it's an undocumented feature. Let's go document it.",
  "The best time to catch a bug was in staging. The second best is now.",
  "Behind every clean release is a great bug report someone filed.",
  "Ship fast. Klavity catches what slips.",
  "Every flaky test has a story. We're here to read it.",
]
function pickNote(code: string): string {
  let h = 0
  for (const c of code) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return OTP_NOTES[h % OTP_NOTES.length]
}

// Branded, email-client-safe OTP template. Table-based + inline styles only
// (no flexbox/grid) so it renders consistently in Gmail / Outlook / Apple Mail.
// Indigo #6366f1 is the Klavity brand accent (see tokens.css --indigo).
export function otpEmailHtml(code: string): string {
  const f = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f3f7">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f7">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 2px 10px rgba(20,16,40,.10)">
        <!-- dark brand band -->
        <tr><td align="center" style="background:#1e1b4b;padding:26px 28px 18px">
          <div style="${f};font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-.02em">Klavity</div>
          <div style="${f};font-size:12px;font-weight:600;color:#a5b4fc;letter-spacing:.16em;text-transform:uppercase;margin-top:4px">AI Bug Reporter</div>
        </td></tr>
        <!-- accent band -->
        <tr><td align="center" style="background:#4f46e5;background:linear-gradient(135deg,#6366f1,#4f46e5);padding:18px 28px">
          <div style="${f};font-size:19px;font-weight:700;color:#ffffff">Your sign-in code</div>
        </td></tr>
        <!-- code -->
        <tr><td style="padding:34px 32px 6px">
          <div style="border:1px solid #e6e4ff;background:#f7f6ff;border-radius:14px;padding:26px 16px;text-align:center">
            <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:40px;font-weight:700;letter-spacing:.32em;color:#4338ca">${code}</span>
          </div>
          <p style="margin:18px 0 0;${f};font-size:13px;color:#8a8696;text-align:center">Enter it to finish signing in — it works once and expires in <strong style="color:#6b6678">10 minutes</strong>.</p>
        </td></tr>
        <!-- personality callout -->
        <tr><td style="padding:22px 32px 4px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f1ff;border-left:3px solid #6366f1;border-radius:8px">
            <tr><td style="padding:14px 16px">
              <div style="${f};font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6366f1">✦ From the team</div>
              <div style="${f};font-size:14px;line-height:1.5;color:#3f3a52;margin-top:5px;font-style:italic">${pickNote(code)}</div>
            </td></tr>
          </table>
        </td></tr>
        <!-- footer -->
        <tr><td style="padding:18px 32px 28px">
          <div style="border-top:1px solid #eceaf2;padding-top:16px">
            <p style="margin:0;${f};font-size:12px;line-height:1.6;color:#a3a0ad">Didn't request this? You can safely ignore this email — no one can sign in without the code above.</p>
          </div>
        </td></tr>
      </table>
      <p style="margin:18px 0 0;${f};font-size:11px;color:#b6b3c0">Sent by Klavity · AI that finds your bugs before your users do</p>
    </td></tr>
  </table>
</body></html>`
}

// Shared SendGrid transport for every transactional send in this file. Does the single fetch,
// captures the response status + SendGrid's x-message-id header, and best-effort logs one
// email_log row PER RECIPIENT (so a multi-personalization send like sendReportAlertEmail gets
// one row per address) — success or failure. Preserves the pre-existing contract: throws
// `SendGrid ${status}: ${body}` on a non-2xx response, after logging.
async function sgSend(params: {
  from: { email: string; name: string }
  to: string[]
  subject: string
  content: Array<{ type: string; value: string }>
  type: string
  // KLAVITYKLA-486: optional project attribution for email-send COGS. Null for pre-account sends
  // (e.g. OTP) — those still count toward total email COGS but attribute to no workspace.
  projectId?: string | null
}): Promise<void> {
  const key = process.env.SENDGRID_API_KEY
  if (!key) {
    // Missing key = the send definitely did not go out (the exact SendGrid outage class this alert
    // exists for). Alert on-call BEFORE throwing, so a misconfigured/rotated-out key never fails silently.
    fireMailFailure({ type: params.type, to: params.to, status: 0, reason: "SENDGRID_API_KEY not set" })
    throw new Error("SENDGRID_API_KEY not set")
  }
  let res: Response
  try {
    res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: params.to.map((email) => ({ to: [{ email }] })),
        from: params.from,
        subject: params.subject,
        content: params.content,
      }),
    })
  } catch (err: any) {
    // Network/transport error — the send definitely did not go out. Alert, then rethrow
    // so the caller's contract is unchanged.
    fireMailFailure({ type: params.type, to: params.to, status: 0, reason: err?.message || String(err) })
    throw err
  }
  const messageId = res.headers.get("x-message-id")
  const errorText = res.ok ? null : (await res.text()).slice(0, 200)
  await Promise.all(
    params.to.map((email) =>
      logOutboundEmail({
        type: params.type,
        to: email,
        subject: params.subject,
        messageId,
        httpStatus: res.status,
        status: res.ok ? "sent" : "failed",
        error: errorText,
      }),
    ),
  )
  if (!res.ok) {
    // Non-2xx from SendGrid — surface it to on-call before rethrowing (unchanged contract).
    fireMailFailure({ type: params.type, to: params.to, status: res.status, reason: errorText })
    throw new Error(`SendGrid ${res.status}: ${errorText}`)
  }
  // KLAVITYKLA-486: email-send COGS — one billable message per recipient. Fire-and-forget.
  void recordEmailSend({ projectId: params.projectId ?? null, count: params.to.length, meta: { type: params.type } })
}

// Email OTP via SendGrid (raw API; no SDK). Requires a VERIFIED sender.
export async function sendOtp(to: string, code: string) {
  const from = process.env.KLAV_MAIL_FROM || "noreply@klavity.in"
  await sgSend({
    to: [to],
    from: { email: from, name: "Klavity" },
    subject: `Your Klavity code: ${code}`,
    content: [
      { type: "text/plain", value: `Your Klavity sign-in code is ${code}\n\nIt expires in 10 minutes. If you didn't request it, ignore this email.` },
      { type: "text/html", value: otpEmailHtml(code) },
    ],
    type: "otp",
  })
}

// Founder alert on new bug/feature reports (lib/report-alert.ts). Same SendGrid transport as the
// OTP mail above; one API call, individual copies per recipient (separate personalizations so
// member addresses aren't exposed to each other in the To header).
export async function sendReportAlertEmail(to: string[], subject: string, html: string, text: string) {
  const from = process.env.KLAV_MAIL_FROM || "noreply@klavity.in"
  if (!to.length) return
  await sgSend({
    to,
    from: { email: from, name: "Klavity" },
    subject,
    content: [
      { type: "text/plain", value: text },
      { type: "text/html", value: html },
    ],
    type: "report_alert",
  })
}

export async function sendLeadAlert(to: string, lead: { email: string; description: string; pageUrl: string; referrer?: string; projectName: string; feedbackUrl: string }) {
  const from = process.env.KLAV_MAIL_FROM || "noreply@klavity.in"
  const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string))
  await sgSend({
    to: [to],
    from: { email: from, name: "Klavity Leads" },
    subject: `🌱 New Klavity lead: ${lead.email}`,
    content: [{ type: "text/html", value:
      `<div style="font-family:system-ui,sans-serif;color:#1d1d1f">
       <p><b>New lead</b> from the ${esc(lead.projectName)} widget.</p>
       <p>Email: <b>${esc(lead.email)}</b></p>
       <p>They reported: ${esc(lead.description)}</p>
       <p>Page: ${esc(lead.pageUrl)}</p>
       ${lead.referrer ? `<p>Came from: ${esc(lead.referrer)}</p>` : ""}
       <p><a href="${esc(lead.feedbackUrl)}">Open in Klavity →</a></p></div>` }],
    type: "lead_alert",
  })
}

// notify-on-fix: sent to the bug reporter (contact_email) when their ticket is marked done/fixed
// (either by an inbound connector webhook or a manual status change).
export async function sendFixedNotification(
  to: string,
  ticket: { title: string; projectName: string; ticketUrl: string },
) {
  const key = process.env.SENDGRID_API_KEY
  const from = process.env.KLAV_MAIL_FROM || "noreply@klavity.in"
  if (!key) {
    // Missing key -> the notification did not go out. Alert on-call before throwing (this path does
    // not go through sgSend, so it needs its own alert to avoid a silent miss).
    fireMailFailure({ type: "notify_fixed", to: [to], status: 0, reason: "SENDGRID_API_KEY not set" })
    throw new Error("SENDGRID_API_KEY not set")
  }
  const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string))
  const subject = `Fixed: ${ticket.title}`
  const text = [
    `Your bug report on ${ticket.projectName} has been marked as fixed.`,
    "",
    `"${ticket.title}"`,
    "",
    `View the ticket: ${ticket.ticketUrl}`,
  ].join("\n")
  const f = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
  const html = `<div style="${f};color:#1d1d24;max-width:560px">
  <p style="margin:0 0 12px;font-size:15px">Your bug report on <b>${esc(ticket.projectName)}</b> has been marked as fixed.</p>
  <div style="border:1px solid #e6e4ff;background:#f7f6ff;border-radius:10px;padding:14px 16px;margin:0 0 16px">
    <p style="margin:0;font-size:14px;color:#3f3a52">${esc(ticket.title)}</p>
  </div>
  <p style="margin:16px 0 0"><a href="${esc(ticket.ticketUrl)}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px">View ticket</a></p>
  <p style="margin:18px 0 0;font-size:11px;color:#b6b3c0">Sent by Klavity when a bug you reported is resolved.</p>
</div>`
  let res: Response
  try {
    res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from, name: "Klavity" },
        subject,
        content: [{ type: "text/plain", value: text }, { type: "text/html", value: html }],
      }),
    })
  } catch (err: any) {
    // Network/DNS/transport error — the send definitely did not go out. Alert, then rethrow so the
    // caller's contract is unchanged. Without this, a network exception would bypass the alert entirely.
    fireMailFailure({ type: "notify_fixed", to: [to], status: 0, reason: err?.message || String(err) })
    throw err
  }
  if (!res.ok) {
    const errorText = (await res.text()).slice(0, 200)
    fireMailFailure({ type: "notify_fixed", to: [to], status: res.status, reason: errorText })
    throw new Error(`SendGrid ${res.status}: ${errorText}`)
  }
}

export type TicketAssignmentEmail = {
  to: string
  ticketTitle: string
  projectName?: string | null
  assignedBy?: string | null
  ticketUrl: string
}

function escMail(s: string): string {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string))
}

export async function sendTicketAssignmentEmail(input: TicketAssignmentEmail) {
  const from = process.env.KLAV_MAIL_FROM || "noreply@klavity.in"
  const project = input.projectName ? ` in ${input.projectName}` : ""
  const actor = input.assignedBy ? ` by ${input.assignedBy}` : ""
  const subject = `Klavity ticket assigned to you${project}`
  const text = [
    `A Klavity ticket was assigned to you${actor}.`,
    "",
    input.ticketTitle,
    "",
    `Open the ticket: ${input.ticketUrl}`,
  ].join("\n")
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1d1d1f;line-height:1.5">
    <p>A Klavity ticket was assigned to you${escMail(actor)}.</p>
    <p style="font-size:16px"><b>${escMail(input.ticketTitle)}</b></p>
    ${input.projectName ? `<p>Project: ${escMail(input.projectName)}</p>` : ""}
    <p><a href="${escMail(input.ticketUrl)}">Open ticket</a></p>
  </div>`
  await sgSend({
    to: [input.to],
    from: { email: from, name: "Klavity" },
    subject,
    content: [
      { type: "text/plain", value: text },
      { type: "text/html", value: html },
    ],
    type: "ticket_assignment",
  })
}

// ── First-class member invite (KLAVITYKLA-294, JTBD 6.4) ──
// A pure "join the team" invite (no ticket attached). Reuses the same SendGrid path as the other
// mails; distinct copy so an invited teammate isn't told a ticket was "assigned" to them.
export type MemberInviteEmail = {
  to: string
  projectName?: string | null
  invitedBy?: string | null
  role?: string | null
  joinUrl: string
}

export async function sendMemberInviteEmail(input: MemberInviteEmail) {
  const from = process.env.KLAV_MAIL_FROM || "noreply@klavity.in"
  const projectPlain = input.projectName || "Klavity"
  const inviterPlain = input.invitedBy || "A teammate"
  const project = input.projectName ? ` to ${input.projectName}` : ""
  const asRole = input.role === "admin" ? " as an admin" : ""
  const subject = `You're invited${project} on Klavity`
  const text = [
    `${inviterPlain} invited you to collaborate on ${projectPlain} in Klavity${asRole}. No password — you sign in with a one-time email code.`,
    "",
    `Accept the invite and sign in: ${input.joinUrl}`,
    "",
    "What is Klavity?",
    "- Snap: one-click bug reports with screenshot, console logs & network activity, filed straight into your tracker.",
    "- Sims: AI customer personas built from your real call transcripts that browse your live site and file grounded bugs.",
    "- AutoSim: re-runs the flows that matter (checkout, sign-up) so fixed things stay fixed.",
    "",
    "Didn't expect this invite? You can safely ignore this email — you won't be added to anything unless you sign in.",
  ].join("\n")
  // Branded, email-client-safe invite (table-based + inline styles only), matching otpEmailHtml so
  // the two feel like one system. Dynamic: inviter, project, join URL.
  const f = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
  const projName = escMail(input.projectName || "Klavity")
  const inviter = escMail(input.invitedBy || "A teammate")
  const joinUrl = escMail(input.joinUrl)
  const benefit = (title: string, body: string) => `
    <tr><td style="padding:0 0 14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="30" valign="top" style="${f};font-size:15px;color:#6366f1;font-weight:800;line-height:1.5">&#8250;</td>
      <td style="${f};font-size:14px;line-height:1.55;color:#3f3a52"><strong style="color:#1e1b4b">${title}</strong> &mdash; ${body}</td>
    </tr></table></td></tr>`
  const html = `<body style="margin:0;padding:0;background:#f4f3f7">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f7"><tr><td align="center" style="padding:32px 16px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 2px 10px rgba(20,16,40,.10)">
      <tr><td align="center" style="background:#1e1b4b;padding:26px 28px 18px">
        <div style="${f};font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-.02em">Klavity</div>
        <div style="${f};font-size:12px;font-weight:600;color:#a5b4fc;letter-spacing:.16em;text-transform:uppercase;margin-top:4px">AI Bug Reporter</div>
      </td></tr>
      <tr><td align="center" style="background:#4f46e5;background:linear-gradient(135deg,#6366f1,#4f46e5);padding:18px 28px">
        <div style="${f};font-size:19px;font-weight:700;color:#ffffff">You're invited to <b>${projName}</b></div>
      </td></tr>
      <tr><td style="padding:30px 32px 6px">
        <p style="margin:0 0 20px;${f};font-size:15px;line-height:1.55;color:#3f3a52"><strong style="color:#1e1b4b">${inviter}</strong> invited you to collaborate on <strong style="color:#1e1b4b">${projName}</strong> in Klavity. No password &mdash; you sign in with a one-time email code.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px"><tr><td align="center" bgcolor="#4f46e5" style="border-radius:12px;background:linear-gradient(135deg,#6366f1,#4f46e5)">
          <a href="${joinUrl}" style="${f};display:inline-block;padding:14px 34px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px">Accept invite &amp; sign in &#8594;</a>
        </td></tr></table>
      </td></tr>
      <tr><td style="padding:20px 32px 4px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6ff;border:1px solid #e6e4ff;border-radius:12px"><tr><td style="padding:18px 18px 6px">
          <div style="${f};font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6366f1;margin-bottom:12px">&#10022; What is Klavity?</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${benefit("Snap", "one-click bug reports with screenshot, console logs &amp; network activity, filed straight into your tracker.")}
            ${benefit("Sims", "AI customer personas built from your real call transcripts that browse your live site and file grounded bugs &mdash; even on pages no one has visited.")}
            ${benefit("AutoSim", "re-runs the flows that matter &mdash; checkout, sign-up &mdash; so fixed things stay fixed.")}
          </table>
        </td></tr></table>
      </td></tr>
      <tr><td style="padding:18px 32px 28px">
        <div style="border-top:1px solid #eceaf2;padding-top:16px">
          <p style="margin:0;${f};font-size:12px;line-height:1.6;color:#a3a0ad">Didn't expect this invite? You can safely ignore this email &mdash; you won't be added to anything unless you sign in.</p>
        </div>
      </td></tr>
    </table>
    <p style="margin:18px 0 0;${f};font-size:11px;color:#b6b3c0">Sent by Klavity &middot; AI that finds your bugs before your users do</p>
  </td></tr></table>
</body>`
  await sgSend({
    to: [input.to],
    from: { email: from, name: "Klavity" },
    subject,
    content: [
      { type: "text/plain", value: text },
      { type: "text/html", value: html },
    ],
    type: "member_invite",
  })
}

// Onboarding hand-off: a non-technical user emails the widget install snippet to their developer.
export type InstallInstructionsEmail = {
  to: string
  projectId: string
  widgetHost: string              // public origin serving /widget.js, e.g. https://klavity.in
  projectName?: string | null
  senderEmail?: string | null
  dashboardUrl?: string | null
}

export async function sendInstallInstructionsEmail(input: InstallInstructionsEmail) {
  const from = process.env.KLAV_MAIL_FROM || "noreply@klavity.in"
  const host = input.widgetHost.replace(/\/+$/, "")
  const snippet = `<script src="${host}/widget.js" data-project="${input.projectId}" defer></script>`
  const who = input.senderEmail ? `${input.senderEmail} asked you` : "You've been asked"
  const proj = input.projectName ? ` for ${input.projectName}` : ""
  const subject = `Add the Klavity bug-report widget to your site${proj}`
  const text = [
    `${who} to add the Klavity bug-report widget to your site${proj}.`,
    ``,
    `Paste this one line just before </body> on every page you want covered:`,
    ``,
    snippet,
    ``,
    `That's it — visitors report bugs with one click, and each report arrives with a screenshot, console logs and network activity attached.`,
    input.dashboardUrl ? `` : ``,
    input.dashboardUrl ? `Manage reports in Klavity: ${input.dashboardUrl}` : ``,
  ].filter((l) => l !== undefined).join("\n")
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1d1d1f;line-height:1.55;max-width:560px">
    <p>${escMail(who)} to add the <b>Klavity</b> bug-report widget to your site${input.projectName ? ` for <b>${escMail(input.projectName)}</b>` : ""}.</p>
    <p>Paste this one line just before <code>&lt;/body&gt;</code> on every page you want covered:</p>
    <pre style="background:#f6f6f9;border:1px solid #e6e4ef;border-radius:8px;padding:12px;font-size:12.5px;overflow:auto;white-space:pre-wrap;word-break:break-all">${escMail(snippet)}</pre>
    <p style="color:#555">That's it — visitors report bugs with one click, and each report arrives with a screenshot, console logs and network activity attached.</p>
    ${input.dashboardUrl ? `<p><a href="${escMail(input.dashboardUrl)}">Manage reports in Klavity →</a></p>` : ""}
  </div>`
  await sgSend({
    to: [input.to],
    from: { email: from, name: "Klavity" },
    subject,
    content: [
      { type: "text/plain", value: text },
      { type: "text/html", value: html },
    ],
    type: "install",
    projectId: input.projectId, // KLAVITYKLA-486: attribute install-email COGS to the workspace
  })
}

export type TicketAssignmentInviteEmail = TicketAssignmentEmail & {
  joinUrl: string
}

export async function sendTicketAssignmentInviteEmail(input: TicketAssignmentInviteEmail) {
  const from = process.env.KLAV_MAIL_FROM || "noreply@klavity.in"
  const project = input.projectName ? ` to ${input.projectName}` : ""
  const actor = input.assignedBy ? ` by ${input.assignedBy}` : ""
  const subject = `You're invited${project} on Klavity`
  const text = [
    `You were assigned a Klavity ticket${actor}.`,
    "",
    input.ticketTitle,
    "",
    `Join and view the ticket: ${input.joinUrl}`,
  ].join("\n")
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1d1d1f;line-height:1.5">
    <p>You were assigned a Klavity ticket${escMail(actor)}.</p>
    <p style="font-size:16px"><b>${escMail(input.ticketTitle)}</b></p>
    ${input.projectName ? `<p>Project: ${escMail(input.projectName)}</p>` : ""}
    <p><a href="${escMail(input.joinUrl)}">Join and view the ticket</a></p>
  </div>`
  await sgSend({
    to: [input.to],
    from: { email: from, name: "Klavity" },
    subject,
    content: [
      { type: "text/plain", value: text },
      { type: "text/html", value: html },
    ],
    type: "ticket_assignment_invite",
  })
}
