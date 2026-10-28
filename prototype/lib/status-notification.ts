// KD-221 — Status-change emails to the ticket's assignee and reporter.
//
// When a ticket's status changes, email the people who care about it: its ASSIGNEE and its REPORTER —
// but never the person who made the change. So when the assignee moves a ticket, only the reporter hears
// about it; when the reporter moves it, only the assignee; when anyone else moves it, both. One person in
// both roles gets one email.
//
// The reporter is the address shown as "Reporter" on the ticket: the composer's contact email, else
// whoever filed it. A reporter about to get the existing "Fixed" email (lib/fixed-notification.ts) for this
// same transition is skipped here, so nobody gets two emails for one change.
//
// Every send is best-effort and never throws into the request path. No SENDGRID_API_KEY → nothing is sent.

import { shouldNotifyReporterOnFix } from "./fixed-notification"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const norm = (v: unknown): string | null => {
  const e = v == null ? "" : String(v).trim().toLowerCase()
  return EMAIL_RE.test(e) ? e : null
}

// Mirrors STATUS_LABELS in public/dashboard.html so the email names a status the way the board does.
export const STATUS_EMAIL_LABELS: Record<string, string> = {
  open: "Open", new: "To Do", in_progress: "In Progress", blocked: "Blocked",
  ready_for_deployment: "Ready for Deployment", deployed: "Deployed", qa_review: "QA Review",
  done: "Done", dismissed: "Dismissed",
}
export const statusLabel = (s: string | null | undefined): string =>
  s ? (STATUS_EMAIL_LABELS[s] || s.replace(/_/g, " ")) : "None"

export type StatusRecipient = { email: string; role: "assignee" | "reporter" }

export function statusChangeRecipients(input: {
  actorEmail?: string | null
  assignee?: string | null
  reporter?: string | null
  /** Skip the reporter (they're already getting the "Fixed" email for this transition). */
  skipReporter?: boolean
}): StatusRecipient[] {
  const actor = norm(input.actorEmail)
  const out: StatusRecipient[] = []
  const assignee = norm(input.assignee)
  const reporter = norm(input.reporter)
  if (assignee && assignee !== actor) out.push({ email: assignee, role: "assignee" })
  if (reporter && reporter !== actor && reporter !== assignee && !input.skipReporter) out.push({ email: reporter, role: "reporter" })
  return out
}

export type StatusChangeEmailInput = {
  role: "assignee" | "reporter"
  ticketTitle: string
  projectName?: string | null
  fromStatus?: string | null
  toStatus: string
  changedBy?: string | null
  ticketUrl: string
}

const escHtml = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string))

export function buildStatusChangeEmail(i: StatusChangeEmailInput): { subject: string; text: string; html: string } {
  const to = statusLabel(i.toStatus)
  const from = i.fromStatus ? statusLabel(i.fromStatus) : null
  const by = i.changedBy ? ` by ${i.changedBy}` : ""
  const whose = i.role === "assignee" ? "A ticket assigned to you" : "A ticket you reported"
  const proj = i.projectName ? ` in ${i.projectName}` : ""
  const subject = `Status changed to ${to}: ${i.ticketTitle}`
  const text = [
    `${whose}${proj} moved ${from ? `from ${from} ` : ""}to ${to}${by}.`,
    "",
    i.ticketTitle,
    "",
    `Open the ticket: ${i.ticketUrl}`,
  ].join("\n")
  const f = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"
  const pill = (s: string, strong: boolean) =>
    `<span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:13px;font-weight:600;${strong ? "background:#4f46e5;color:#fff" : "background:#eeedf5;color:#3f3a52"}">${escHtml(s)}</span>`
  const html = `<div style="${f};color:#1d1d24;max-width:560px;line-height:1.5">
  <p style="margin:0 0 12px;font-size:15px">${escHtml(whose)}${i.projectName ? ` in <b>${escHtml(i.projectName)}</b>` : ""} has a new status${i.changedBy ? ` — changed by ${escHtml(i.changedBy)}` : ""}.</p>
  <div style="border:1px solid #e6e4ff;background:#f7f6ff;border-radius:10px;padding:14px 16px;margin:0 0 14px">
    <p style="margin:0 0 10px;font-size:15px;font-weight:600;color:#1d1d24">${escHtml(i.ticketTitle)}</p>
    <p style="margin:0">${from ? `${pill(from, false)} <span style="color:#8a86a0">→</span> ` : ""}${pill(to, true)}</p>
  </div>
  <p style="margin:16px 0 0"><a href="${escHtml(i.ticketUrl)}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px">View ticket</a></p>
  <p style="margin:18px 0 0;font-size:11px;color:#b6b3c0">Sent by Klavity because you're the ${i.role} of this ticket.</p>
</div>`
  return { subject, text, html }
}

export type StatusChangeNotifyInput = {
  actorEmail?: string | null
  assignee?: string | null
  /** Reporter shown on the ticket (contactEmail || actorEmail of the report). */
  reporter?: string | null
  /** The report's contact email — the address the existing "Fixed" email goes to. */
  contactEmail?: string | null
  fromStatus?: string | null
  toStatus: string
  ticketTitle: string
  projectName?: string | null
}

export type StatusChangeNotifyDeps = {
  send: (to: string, mail: { subject: string; text: string; html: string }) => Promise<void>
  /** Ticket link for this recipient (members get the pretty permalink, outside reporters the /t/<id> one). */
  linkFor: (email: string) => Promise<string>
  canEmail?: () => boolean
  warn?: (...args: any[]) => void
}

/** Sends the status-change emails; resolves to the recipients that were emailed. Never throws. */
export async function notifyStatusChange(input: StatusChangeNotifyInput, deps: StatusChangeNotifyDeps): Promise<StatusRecipient[]> {
  const warn = deps.warn ?? console.warn
  if (!input.toStatus || input.toStatus === input.fromStatus) return []
  const canEmail = deps.canEmail ? deps.canEmail() : !!process.env.SENDGRID_API_KEY
  if (!canEmail) return []
  // The "Fixed" email already covers the reporter on a →done transition when they're its contact address.
  const fixedCoversReporter = shouldNotifyReporterOnFix({ contactEmail: input.contactEmail, previousStatus: input.fromStatus, nextStatus: input.toStatus, actorEmail: input.actorEmail })
    && norm(input.contactEmail) === norm(input.reporter)
  const recipients = statusChangeRecipients({ actorEmail: input.actorEmail, assignee: input.assignee, reporter: input.reporter, skipReporter: fixedCoversReporter })
  const sent: StatusRecipient[] = []
  for (const r of recipients) {
    try {
      const mail = buildStatusChangeEmail({
        role: r.role, ticketTitle: input.ticketTitle, projectName: input.projectName ?? null,
        fromStatus: input.fromStatus ?? null, toStatus: input.toStatus, changedBy: input.actorEmail ?? null,
        ticketUrl: await deps.linkFor(r.email),
      })
      await deps.send(r.email, mail)
      sent.push(r)
    } catch (e: any) {
      warn("status-change email skipped:", e?.message || e)
    }
  }
  return sent
}
