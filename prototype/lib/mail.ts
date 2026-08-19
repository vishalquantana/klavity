import { logOutboundEmail } from "./db"

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
}): Promise<void> {
  const key = process.env.SENDGRID_API_KEY
  if (!key) throw new Error("SENDGRID_API_KEY not set")
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      personalizations: params.to.map((email) => ({ to: [{ email }] })),
      from: params.from,
      subject: params.subject,
      content: params.content,
    }),
  })
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
  if (!res.ok) throw new Error(`SendGrid ${res.status}: ${errorText}`)
}

// Email OTP via SendGrid (raw API; no SDK). Requires a VERIFIED sender.
export async function sendOtp(to: string, code: string) {
  const from = process.env.KLAV_MAIL_FROM || "noreply@klavity.in"
  if (!process.env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not set")
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
  if (!process.env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not set")
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
  if (!process.env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not set")
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
  if (!key) throw new Error("SENDGRID_API_KEY not set")
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
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: "Klavity" },
      subject,
      content: [{ type: "text/plain", value: text }, { type: "text/html", value: html }],
    }),
  })
  if (!res.ok) throw new Error(`SendGrid ${res.status}: ${(await res.text()).slice(0, 200)}`)
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
  if (!process.env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not set")
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
  if (!process.env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not set")
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
  if (!process.env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not set")
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
  })
}

export type TicketAssignmentInviteEmail = TicketAssignmentEmail & {
  joinUrl: string
}

export async function sendTicketAssignmentInviteEmail(input: TicketAssignmentInviteEmail) {
  const from = process.env.KLAV_MAIL_FROM || "noreply@klavity.in"
  if (!process.env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY not set")
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
