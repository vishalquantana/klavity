// KLAVITYKLA-209 — Comment + assignment notifications (JTBD 2.12)
//
// When someone comments on a ticket, the assignee + prior commenters + the
// reporter (watchers) should hear about it. Historically nothing was sent, so
// people missed replies. This helper collects the interested parties, dedupes
// them, drops the actor (never notify yourself about your own action), and
// dispatches a best-effort email (SendGrid) plus an optional Slack ping.
//
// Every send is fire-and-forget: notifyTicketComment resolves after kicking off
// the work and NEVER throws into the request path. When SENDGRID_API_KEY / the
// Slack webhook are unset the corresponding channel is silently skipped.
//
// (Assignment notifications already ship via notifyTicketAssignee in server.ts;
// this module adds the missing comment channel and is written so the same
// recipient/dedupe helpers can back assignment Slack later.)

import { sendReportAlertEmail } from "./mail"
import { safeFetch } from "./safe-fetch"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Lowercase + validate a single address; returns null when it is not a usable email. */
export function normalizeEmail(value: unknown): string | null {
  if (value == null) return null
  const e = String(value).trim().toLowerCase()
  return EMAIL_RE.test(e) ? e : null
}

export interface CommentRecipientInput {
  /** Actor who wrote the comment — always excluded from the recipient set. */
  author?: string | null
  /** Current ticket assignee, if any. */
  assignee?: string | null
  /** Reporter / contact for the ticket — treated as a watcher. */
  contactEmail?: string | null
  /** Authors of earlier comments on this ticket (watchers by participation). */
  priorCommenters?: (string | null | undefined)[]
}

/**
 * Interested parties for a new comment, minus the actor, deduped and normalized.
 * Order is stable: assignee first, then reporter, then prior commenters.
 */
export function commentRecipients(input: CommentRecipientInput): string[] {
  const author = normalizeEmail(input.author)
  const out: string[] = []
  const seen = new Set<string>()
  const add = (v: unknown) => {
    const e = normalizeEmail(v)
    if (!e) return
    if (author && e === author) return // never notify the actor about their own comment
    if (seen.has(e)) return
    seen.add(e)
    out.push(e)
  }
  add(input.assignee)
  add(input.contactEmail)
  for (const c of input.priorCommenters ?? []) add(c)
  return out
}

function esc(s: string): string {
  return String(s).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string))
}

export interface CommentNotifyInput extends CommentRecipientInput {
  feedbackId: string
  ticketTitle?: string | null
  projectName?: string | null
  commentBody: string
  /** Deep link to the ticket in the dashboard. */
  ticketUrl: string
}

// Injectable side-effects so tests stay hermetic (no network, no SendGrid, no db).
export interface NotifyDeps {
  sendEmail?: (to: string[], subject: string, html: string, text: string) => Promise<void>
  postSlack?: (payload: unknown) => Promise<void>
  /** Overridable env probes (default read process.env). */
  hasEmail?: () => boolean
  slackWebhook?: () => string | null
}

function defaultSlackWebhook(): string | null {
  return (
    process.env.SLACK_TICKET_WEBHOOK_URL ||
    process.env.SLACK_ALERT_WEBHOOK_URL ||
    process.env.SLACK_SIGNUP_WEBHOOK_URL ||
    null
  )
}

async function defaultPostSlack(payload: unknown): Promise<void> {
  const webhook = defaultSlackWebhook()
  if (!webhook) return
  const res = await safeFetch(
    webhook,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) },
    { allowHosts: ["hooks.slack.com"] },
  )
  if (!res.ok) console.error(`comment slack notify: webhook returned ${res.status}`)
}

/** Build the Slack Block-Kit payload for a new comment (exported for testing). */
export function buildCommentSlackPayload(input: CommentNotifyInput, recipients: string[]): unknown {
  const title = input.ticketTitle?.trim() || `Ticket ${input.feedbackId}`
  const who = input.author || "someone"
  const preview = input.commentBody.length > 280 ? input.commentBody.slice(0, 277) + "…" : input.commentBody
  const proj = input.projectName ? ` in *${input.projectName}*` : ""
  return {
    text: `💬 New comment on "${title}"${input.projectName ? ` in ${input.projectName}` : ""}`,
    blocks: [
      { type: "section", text: { type: "mrkdwn", text: `💬 *${who}* commented on *${title}*${proj}` } },
      { type: "section", text: { type: "mrkdwn", text: preview || "_(empty)_" } },
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: recipients.length ? `Notifying: ${recipients.join(", ")}` : "No watchers to notify" },
        ],
      },
      { type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "Open ticket" }, url: input.ticketUrl }] },
    ],
  }
}

function buildCommentEmail(input: CommentNotifyInput): { subject: string; html: string; text: string } {
  const title = input.ticketTitle?.trim() || `Ticket ${input.feedbackId}`
  const who = input.author || "Someone"
  const projLine = input.projectName ? ` (${input.projectName})` : ""
  const subject = `💬 New comment on "${title}"${projLine}`
  const text =
    `${who} commented on "${title}"${projLine}:\n\n${input.commentBody}\n\nOpen the ticket: ${input.ticketUrl}`
  const html =
    `<div style="font-family:system-ui,sans-serif;color:#1d1d1f">
       <p><b>${esc(who)}</b> commented on <b>${esc(title)}</b>${input.projectName ? ` in ${esc(input.projectName)}` : ""}.</p>
       <blockquote style="margin:12px 0;padding:8px 12px;border-left:3px solid #6d28d9;color:#333">${esc(input.commentBody).replace(/\n/g, "<br>")}</blockquote>
       <p><a href="${esc(input.ticketUrl)}">Open the ticket →</a></p>
     </div>`
  return { subject, html, text }
}

/**
 * Best-effort, non-blocking. Emails every watcher (except the actor) and pings
 * Slack. Resolves to what was attempted; never rejects. Callers should NOT await
 * this in a way that blocks the response — `void notifyTicketComment(...)`.
 */
export async function notifyTicketComment(
  input: CommentNotifyInput,
  deps: NotifyDeps = {},
): Promise<{ recipients: string[]; emailAttempted: boolean; slackAttempted: boolean }> {
  const recipients = commentRecipients(input)
  const hasEmail = deps.hasEmail ? deps.hasEmail() : !!process.env.SENDGRID_API_KEY
  const slackWebhook = deps.slackWebhook ? deps.slackWebhook() : defaultSlackWebhook()
  let emailAttempted = false
  let slackAttempted = false

  if (recipients.length && hasEmail) {
    emailAttempted = true
    const { subject, html, text } = buildCommentEmail(input)
    const send = deps.sendEmail ?? sendReportAlertEmail
    try {
      await send(recipients, subject, html, text)
    } catch (e: any) {
      console.warn("comment notify email skipped:", e?.message || e)
    }
  }

  if (slackWebhook || deps.postSlack) {
    slackAttempted = true
    const post = deps.postSlack ?? defaultPostSlack
    try {
      await post(buildCommentSlackPayload(input, recipients))
    } catch (e: any) {
      console.warn("comment notify slack skipped:", e?.message || e)
    }
  }

  return { recipients, emailAttempted, slackAttempted }
}
