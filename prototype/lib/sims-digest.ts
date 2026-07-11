// lib/sims-digest.ts — Daily per-project Sims digest (KLAVITYKLA-261).
//
// Sends a client-forwardable daily summary of what the standing Sim QA panel found
// in the last 24 hours, per project:
//   • Pages / Sim review sessions run
//   • Issues found (Sim feedback rows created in the window)
//   • How many are recurring (recurrence > 1)
//   • Regressions re-confirmed (AutoSim trail runs that finished with findings)
//
// Architecture:
//   • gatherSimsDigest() — pure DB read, injectable Client, hermetic in tests.
//   • buildSimsDigestHtml() / buildSimsDigestText() — pure renderers (no I/O).
//   • buildSimsDigestSlackPayload() — compact Block-Kit payload.
//   • sendSimsDigest() — gather + email + Slack, records last_sent marker.
//   • startSimsDigestScheduler() — mirrors startTrailScheduler() pattern:
//       setInterval that ticks every hour; skips projects with zero activity or
//       a last_sent marker < 24 h ago.  Guards by NODE_ENV !== 'test' at the
//       call-site (server.ts).
//
// last_sent marker lives in projects.modal_config_json["sims_digest_last_sent_at"]
// — no migration needed (same key-in-JSON pattern as trust-report.ts).
//
// Scheduling note: server.ts wires startSimsDigestScheduler() in the same
// `if (db && process.env.NODE_ENV !== 'test')` block that starts startTrailScheduler()
// and startCrashReaper().
//
// Deps are fully injectable so every function can be unit-tested heretically.

import type { Client } from "@libsql/client"

// ── Constants ─────────────────────────────────────────────────────────────────

export const SIMS_DIGEST_LAST_SENT_KEY = "sims_digest_last_sent_at"
export const DAY_MS = 24 * 60 * 60 * 1000
/** Scheduler tick interval — 1 hour.  Same cadence as trail scheduler. */
export const DIGEST_TICK_MS = 60 * 60 * 1000

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SimsDigestData {
  projectId: string
  projectName: string
  windowStart: Date
  windowEnd: Date
  /** Distinct Sim review sessions that ran in the window (sim_runs rows). */
  reviewSessionsTotal: number
  /** Distinct pages reviewed (distinct url_path values). */
  pagesReviewedTotal: number
  /** Sim feedback rows created in the window (sim_id IS NOT NULL). */
  issuesFoundTotal: number
  /** Issues where recurrence_count > 1 (seen before and re-surfaced). */
  recurringIssuesTotal: number
  /** Top-3 issue highlights for the email body. */
  issueHighlights: SimsDigestIssueHighlight[]
  /** AutoSim trail runs that finished in the window WITH at least one finding. */
  regressionsReconfirmedTotal: number
  /** Top-3 regression titles. */
  regressionHighlights: string[]
  /** True when there was zero Sim/AutoSim activity in the window. */
  isQuietDay: boolean
}

export interface SimsDigestIssueHighlight {
  title: string
  simName: string | null
  isRecurring: boolean
}

export interface SimsDigestDeps {
  /** libSQL client (the shared singleton or a test-injected in-memory client). */
  db: Client
  /** Send an email. Matches the signature of sendReportAlertEmail in lib/mail.ts. */
  sendEmail: (to: string[], subject: string, html: string, text: string) => Promise<void>
  /** POST to a Slack incoming-webhook URL. Defaults to safeFetch over hooks.slack.com. */
  postSlack?: (webhookUrl: string, payload: unknown) => Promise<void>
}

// ── Data gathering ────────────────────────────────────────────────────────────

/**
 * Aggregate the last-24 h Sim activity for a project.
 * Pure DB reads — no side-effects. Fully injectable Client so tests are hermetic.
 */
export async function gatherSimsDigest(
  c: Client,
  projectId: string,
  windowStart: number,
  windowEnd: number,
): Promise<SimsDigestData> {
  // 1. Project name
  const projRow = await c.execute({ sql: "SELECT name FROM projects WHERE id=?", args: [projectId] })
  const projectName = projRow.rows.length ? String((projRow.rows[0] as any).name) : projectId

  // 2. Sim review sessions (sim_runs rows finished in the window for this project).
  //    sim_runs.status can be 'done' | 'error' | other — count all finished rows.
  let reviewSessionsTotal = 0
  let pagesReviewedTotal = 0
  try {
    const simRunsR = await c.execute({
      sql: `SELECT id, url FROM sim_runs
            WHERE project_id=? AND finished_at>=? AND finished_at<?
            ORDER BY finished_at DESC`,
      args: [projectId, windowStart, windowEnd],
    })
    reviewSessionsTotal = simRunsR.rows.length
    const distinctUrls = new Set<string>((simRunsR.rows as any[]).map((r) => String(r.url || "")).filter(Boolean))
    pagesReviewedTotal = distinctUrls.size
  } catch {
    // sim_runs may not exist in older test DBs — gracefully degrade.
    reviewSessionsTotal = 0
    pagesReviewedTotal = 0
  }

  // 3. Sim feedback rows created in the window (sim_id IS NOT NULL).
  const simFbR = await c.execute({
    sql: `SELECT f.observation, f.suggested_bug_json, f.sim_id,
                 COALESCE(f.recurrence_count, 1) AS rc,
                 p.name AS sim_name
          FROM feedback f
          LEFT JOIN personas p ON p.id = f.sim_id AND p.project_id = f.project_id
          WHERE f.project_id=? AND f.created_at>=? AND f.created_at<?
            AND f.sim_id IS NOT NULL AND f.sim_id != ''
          ORDER BY COALESCE(f.recurrence_count, 1) DESC, f.created_at DESC`,
    args: [projectId, windowStart, windowEnd],
  })
  const issuesFoundTotal = simFbR.rows.length
  const recurringIssuesTotal = (simFbR.rows as any[]).filter((r) => Number(r.rc || 1) > 1).length

  const issueHighlights: SimsDigestIssueHighlight[] = (simFbR.rows as any[]).slice(0, 3).map((r) => ({
    title: extractTitle(r),
    simName: r.sim_name != null ? String(r.sim_name) : null,
    isRecurring: Number(r.rc || 1) > 1,
  }))

  // 4. AutoSim trail runs that finished in the window with at least one finding (re-confirmed regressions).
  const walksR = await c.execute({
    sql: `SELECT id FROM trail_runs
          WHERE project_id=? AND finished_at>=? AND finished_at<?
            AND status IN ('pass','fail','done')
          ORDER BY finished_at DESC`,
    args: [projectId, windowStart, windowEnd],
  })
  const runIds = (walksR.rows as any[]).map((r) => String(r.id))

  let regressionsReconfirmedTotal = 0
  const regressionHighlights: string[] = []

  if (runIds.length > 0) {
    const placeholders = runIds.map(() => "?").join(",")
    const findingsR = await c.execute({
      sql: `SELECT run_id, title FROM findings
            WHERE project_id=? AND run_id IN (${placeholders})
            ORDER BY created_at ASC`,
      args: [projectId, ...runIds],
    })
    const runsWithFindings = new Set((findingsR.rows as any[]).map((r) => String(r.run_id)))
    regressionsReconfirmedTotal = runsWithFindings.size
    const seen = new Set<string>()
    for (const r of findingsR.rows as any[]) {
      const t = String(r.title || "").trim()
      if (t && !seen.has(t)) { seen.add(t); regressionHighlights.push(t) }
      if (regressionHighlights.length >= 3) break
    }
  }

  const isQuietDay =
    issuesFoundTotal === 0 &&
    reviewSessionsTotal === 0 &&
    regressionsReconfirmedTotal === 0

  return {
    projectId,
    projectName,
    windowStart: new Date(windowStart),
    windowEnd: new Date(windowEnd),
    reviewSessionsTotal,
    pagesReviewedTotal,
    issuesFoundTotal,
    recurringIssuesTotal,
    issueHighlights,
    regressionsReconfirmedTotal,
    regressionHighlights,
    isQuietDay,
  }
}

function extractTitle(r: any): string {
  try {
    const parsed = JSON.parse(r.suggested_bug_json || "{}")
    const t = String(parsed?.title || "").trim()
    if (t) return t
  } catch { /* fall through */ }
  const obs = r.observation != null ? String(r.observation).trim() : ""
  return obs ? obs.slice(0, 90) : "(untitled)"
}

// ── HTML email rendering ──────────────────────────────────────────────────────

const F = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"

function esc(s: string): string {
  return String(s || "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string))
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function metricCell(label: string, value: number, accent: string): string {
  return `
    <td align="center" style="padding:12px 10px">
      <div style="${F};font-size:30px;font-weight:800;color:${accent}">${value}</div>
      <div style="${F};font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#6b6678;margin-top:3px">${esc(label)}</div>
    </td>`
}

function issueRow(h: SimsDigestIssueHighlight): string {
  const badge = h.isRecurring ? "recurring" : (h.simName ? `via ${h.simName}` : "")
  return `
    <tr><td style="padding:6px 0;border-bottom:1px solid #f0eef8">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="${F};font-size:13px;color:#3f3a52;line-height:1.4">${esc(h.title)}${h.simName && !h.isRecurring ? `<span style="font-size:11px;color:#a0a0b0"> · ${esc(h.simName)}</span>` : ""}</td>
          ${badge ? `<td align="right" style="padding-left:8px;white-space:nowrap"><span style="background:${h.isRecurring ? "#fef3c7" : "#f3f1ff"};color:${h.isRecurring ? "#b45309" : "#4f46e5"};${F};font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px">${esc(badge)}</span></td>` : ""}
        </tr>
      </table>
    </td></tr>`
}

/**
 * Build the branded HTML email for the daily Sims digest.
 * Client-forwardable: project name in header, Klavity branding in footer.
 * Pure — no I/O.
 */
export function buildSimsDigestHtml(data: SimsDigestData): string {
  const dateLabel = fmtDate(data.windowEnd)

  const metricsRow = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e6f5;border-radius:12px;background:#fff;margin-bottom:18px">
      <tr>
        ${metricCell("Pages reviewed", data.pagesReviewedTotal, "#6366f1")}
        <td style="border-left:1px solid #f0eef8"></td>
        ${metricCell("Issues found", data.issuesFoundTotal, "#f59e0b")}
        <td style="border-left:1px solid #f0eef8"></td>
        ${metricCell("Recurring", data.recurringIssuesTotal, "#ef4444")}
        <td style="border-left:1px solid #f0eef8"></td>
        ${metricCell("Regressions re-confirmed", data.regressionsReconfirmedTotal, "#22c55e")}
      </tr>
    </table>`

  const quietBanner = data.isQuietDay
    ? `<div style="${F};font-size:14px;color:#7c7890;background:#f7f6ff;border:1px solid #e8e6f5;border-radius:10px;padding:14px 16px;margin-bottom:18px;text-align:center;font-style:italic">
        Quiet day — no Sim reviews or AutoSim runs. Your product is holding up.
      </div>`
    : ""

  // Summary sentence for the top of the body
  let summaryLine = ""
  if (!data.isQuietDay) {
    const parts: string[] = []
    if (data.reviewSessionsTotal > 0) {
      parts.push(`${data.reviewSessionsTotal} Sim review session${data.reviewSessionsTotal !== 1 ? "s" : ""} covering ${data.pagesReviewedTotal} page${data.pagesReviewedTotal !== 1 ? "s" : ""}`)
    }
    if (data.issuesFoundTotal > 0) {
      const recNote = data.recurringIssuesTotal > 0 ? `, ${data.recurringIssuesTotal} recurring` : ""
      parts.push(`${data.issuesFoundTotal} issue${data.issuesFoundTotal !== 1 ? "s" : ""} found${recNote}`)
    }
    if (data.regressionsReconfirmedTotal > 0) {
      parts.push(`${data.regressionsReconfirmedTotal} regression${data.regressionsReconfirmedTotal !== 1 ? "s" : ""} re-confirmed`)
    }
    if (parts.length) {
      summaryLine = `<div style="${F};font-size:14px;color:#3f3a52;margin-bottom:18px;line-height:1.6">
        Your Sim QA panel ran ${esc(parts.join(" · "))} in the last 24 h.
      </div>`
    }
  }

  // Issues section
  const issueRows = data.issueHighlights.map(issueRow).join("")
  const issueSection = data.issueHighlights.length ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;background:#faf9ff;border:1px solid #e8e6f5;border-radius:12px;overflow:hidden">
      <tr><td style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:10px 16px">
        <span style="${F};font-size:12px;font-weight:700;color:#fff;letter-spacing:.06em;text-transform:uppercase">Issues Found</span>
      </td></tr>
      <tr><td style="padding:12px 16px">
        <table role="presentation" width="100%">${issueRows}</table>
        ${data.issuesFoundTotal > 3 ? `<div style="${F};font-size:12px;color:#a3a0ad;margin-top:6px">+ ${data.issuesFoundTotal - 3} more issues</div>` : ""}
      </td></tr>
    </table>` : ""

  // Regressions section
  const regSection = data.regressionHighlights.length ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;background:#faf9ff;border:1px solid #e8e6f5;border-radius:12px;overflow:hidden">
      <tr><td style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:10px 16px">
        <span style="${F};font-size:12px;font-weight:700;color:#fff;letter-spacing:.06em;text-transform:uppercase">Regressions Re-confirmed</span>
      </td></tr>
      <tr><td style="padding:12px 16px">
        <table role="presentation" width="100%">
          ${data.regressionHighlights.map((t) => `<tr><td style="padding:6px 0;${F};font-size:13px;color:#3f3a52;border-bottom:1px solid #f0eef8">${esc(t)}</td></tr>`).join("")}
        </table>
        ${data.regressionsReconfirmedTotal > 3 ? `<div style="${F};font-size:12px;color:#a3a0ad;margin-top:6px">+ ${data.regressionsReconfirmedTotal - 3} more</div>` : ""}
      </td></tr>
    </table>` : ""

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f3f7">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f7">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 2px 10px rgba(20,16,40,.10)">

        <!-- dark brand band -->
        <tr><td align="center" style="background:#1e1b4b;padding:26px 28px 18px">
          <div style="${F};font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-.02em">Klavity</div>
          <div style="${F};font-size:12px;font-weight:600;color:#a5b4fc;letter-spacing:.16em;text-transform:uppercase;margin-top:4px">Daily Sims Digest</div>
        </td></tr>

        <!-- accent header -->
        <tr><td style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:18px 28px">
          <div style="${F};font-size:18px;font-weight:700;color:#ffffff">${esc(data.projectName)}</div>
          <div style="${F};font-size:13px;color:#c7d2fe;margin-top:4px">As of ${esc(dateLabel)}</div>
        </td></tr>

        <!-- body -->
        <tr><td style="padding:24px 24px 8px">
          ${quietBanner}
          ${summaryLine}
          ${metricsRow}
          ${issueSection}
          ${regSection}
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:8px 24px 28px;text-align:center">
          <a href="https://klavity.in/dashboard?project=${encodeURIComponent(data.projectId)}#tickets"
             style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;${F};font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px">
            View all in Dashboard →
          </a>
        </td></tr>

        <!-- footer -->
        <tr><td style="padding:0 24px 24px">
          <div style="border-top:1px solid #eceaf2;padding-top:14px">
            <p style="margin:0;${F};font-size:11px;color:#a3a0ad;line-height:1.6">
              This is your daily Sims digest from Klavity — forwarded from your QA panel to you.
              Your standing Sims reviewed <strong>${data.projectName}</strong> in the last 24 h.
            </p>
          </div>
        </td></tr>

      </table>
      <p style="margin:18px 0 0;${F};font-size:11px;color:#b6b3c0">Sent by Klavity · <a href="https://klavity.in" style="color:#b6b3c0">klavity.in</a></p>
    </td></tr>
  </table>
</body></html>`
}

/** Build the plain-text version. Pure — no I/O. */
export function buildSimsDigestText(data: SimsDigestData): string {
  const dateLabel = fmtDate(data.windowEnd)
  const lines: string[] = [
    `Klavity Daily Sims Digest — ${data.projectName}`,
    `As of ${dateLabel}`,
    `${"─".repeat(52)}`,
    "",
  ]

  if (data.isQuietDay) {
    lines.push("Quiet day — no Sim reviews or AutoSim runs. Your product is holding up.", "")
  }

  lines.push(
    "METRICS",
    `  Pages reviewed:           ${data.pagesReviewedTotal}`,
    `  Review sessions run:      ${data.reviewSessionsTotal}`,
    `  Issues found:             ${data.issuesFoundTotal}`,
    `  Recurring issues:         ${data.recurringIssuesTotal}`,
    `  Regressions re-confirmed: ${data.regressionsReconfirmedTotal}`,
    "",
  )

  if (data.issueHighlights.length) {
    lines.push("ISSUES FOUND")
    for (const h of data.issueHighlights) {
      const tags: string[] = []
      if (h.isRecurring) tags.push("recurring")
      if (h.simName) tags.push(`via ${h.simName}`)
      lines.push(`  • ${h.title}${tags.length ? ` [${tags.join(", ")}]` : ""}`)
    }
    if (data.issuesFoundTotal > 3) lines.push(`  + ${data.issuesFoundTotal - 3} more`)
    lines.push("")
  }

  if (data.regressionHighlights.length) {
    lines.push("REGRESSIONS RE-CONFIRMED")
    for (const t of data.regressionHighlights) lines.push(`  • ${t}`)
    if (data.regressionsReconfirmedTotal > 3) lines.push(`  + ${data.regressionsReconfirmedTotal - 3} more`)
    lines.push("")
  }

  lines.push(
    "─".repeat(52),
    `View your dashboard: https://klavity.in/dashboard?project=${encodeURIComponent(data.projectId)}#tickets`,
    "Sent by Klavity — klavity.in",
  )

  return lines.join("\n")
}

// ── Slack Block-Kit payload ───────────────────────────────────────────────────

function trunc(s: string, n: number): string {
  const t = String(s || "")
  return t.length > n ? t.slice(0, n - 3) + "..." : t
}

/**
 * Build a compact Slack Block-Kit payload for the daily digest.
 * Follows the same shape as buildReportSlackPayload() in lib/report-alert.ts.
 * Pure — no I/O.
 */
export function buildSimsDigestSlackPayload(data: SimsDigestData): { text: string; blocks: unknown[] } {
  const dateLabel = fmtDate(data.windowEnd)
  const dashUrl = `https://klavity.in/dashboard?project=${encodeURIComponent(data.projectId)}#tickets`

  if (data.isQuietDay) {
    return {
      text: `Klavity Sims digest: ${data.projectName} — quiet day (${dateLabel})`,
      blocks: [
        { type: "header", text: { type: "plain_text", text: `Sims digest: ${trunc(data.projectName, 50)} — quiet day`, emoji: false } },
        { type: "section", text: { type: "mrkdwn", text: `No Sim reviews or AutoSim runs in the last 24 h. Your product is holding up.` } },
        { type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "Open Dashboard", emoji: false }, url: dashUrl }] },
      ],
    }
  }

  const fields: Array<{ type: string; text: string }> = [
    { type: "mrkdwn", text: `*Pages reviewed*\n${data.pagesReviewedTotal}` },
    { type: "mrkdwn", text: `*Issues found*\n${data.issuesFoundTotal}` },
  ]
  if (data.recurringIssuesTotal > 0) {
    fields.push({ type: "mrkdwn", text: `*Recurring issues*\n${data.recurringIssuesTotal}` })
  }
  if (data.regressionsReconfirmedTotal > 0) {
    fields.push({ type: "mrkdwn", text: `*Regressions re-confirmed*\n${data.regressionsReconfirmedTotal}` })
  }

  const topIssueLine = data.issueHighlights.length
    ? `\n\n*Top issues:*\n${data.issueHighlights.map((h) => `• ${trunc(h.title, 80)}${h.isRecurring ? " _(recurring)_" : h.simName ? ` _(${trunc(h.simName, 30)})_` : ""}`).join("\n")}`
    : ""

  const headerText = `Sims digest: ${trunc(data.projectName, 50)} — ${data.issuesFoundTotal} issue${data.issuesFoundTotal !== 1 ? "s" : ""}${data.regressionsReconfirmedTotal > 0 ? `, ${data.regressionsReconfirmedTotal} regression${data.regressionsReconfirmedTotal !== 1 ? "s" : ""} re-confirmed` : ""}`

  return {
    text: `Klavity Sims digest (${dateLabel}): ${data.projectName} — ${data.issuesFoundTotal} issues, ${data.regressionsReconfirmedTotal} regressions`,
    blocks: [
      { type: "header", text: { type: "plain_text", text: headerText, emoji: false } },
      { type: "section", text: { type: "mrkdwn", text: `*${esc(data.projectName)}* · ${dateLabel}${topIssueLine}` } },
      { type: "section", fields },
      { type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "View in Dashboard", emoji: false }, url: dashUrl }] },
    ],
  }
}

// ── last-sent marker (modal_config_json, no migration needed) ─────────────────

export async function getSimsDigestLastSent(c: Client, projectId: string): Promise<number | null> {
  const r = await c.execute({ sql: "SELECT modal_config_json FROM projects WHERE id=?", args: [projectId] })
  if (!r.rows.length) return null
  try {
    const cfg = JSON.parse(String((r.rows[0] as any).modal_config_json || "{}")) || {}
    const v = cfg[SIMS_DIGEST_LAST_SENT_KEY]
    return typeof v === "number" ? v : null
  } catch { return null }
}

export async function setSimsDigestLastSent(c: Client, projectId: string, at: number): Promise<void> {
  const r = await c.execute({ sql: "SELECT modal_config_json FROM projects WHERE id=?", args: [projectId] })
  let cfg: Record<string, unknown> = {}
  if (r.rows.length) {
    try { cfg = JSON.parse(String((r.rows[0] as any).modal_config_json || "{}")) || {} } catch { /* ignore */ }
  }
  cfg[SIMS_DIGEST_LAST_SENT_KEY] = at
  await c.execute({ sql: "UPDATE projects SET modal_config_json=?, updated_at=? WHERE id=?", args: [JSON.stringify(cfg), Date.now(), projectId] })
}

// ── Recipient resolution ──────────────────────────────────────────────────────

/** Resolve email recipients for a project: account owner + admins, deduplicated. */
export async function resolveDigestRecipients(c: Client, accountId: string): Promise<string[]> {
  const r = await c.execute({
    sql: `SELECT email FROM account_members
          WHERE account_id=? AND account_role IN ('owner','admin')
          ORDER BY CASE account_role WHEN 'owner' THEN 0 ELSE 1 END, created_at ASC, email ASC`,
    args: [accountId],
  })
  let to = (r.rows as any[]).map((x) => String(x.email).trim().toLowerCase()).filter(Boolean)
  if (!to.length) {
    const o = await c.execute({ sql: "SELECT owner_email FROM accounts WHERE id=?", args: [accountId] })
    const owner = o.rows.length ? String((o.rows[0] as any).owner_email || "").trim().toLowerCase() : ""
    if (owner) to = [owner]
  }
  return [...new Set(to)]
}

// ── Slack webhook for a project ───────────────────────────────────────────────

async function defaultPostSlack(webhookUrl: string, payload: unknown): Promise<void> {
  // Only allow hooks.slack.com to prevent SSRF (matches report-alert.ts pattern).
  if (!/^https:\/\/hooks\.slack\.com\//.test(webhookUrl)) return
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) console.error(`[sims-digest] slack webhook returned ${res.status}`)
}

async function getProjectSlackWebhook(c: Client, projectId: string): Promise<string | null> {
  try {
    const r = await c.execute({ sql: "SELECT modal_config_json FROM projects WHERE id=?", args: [projectId] })
    if (!r.rows.length) return null
    const cfg = JSON.parse(String((r.rows[0] as any).modal_config_json || "{}")) || {}
    const raw = typeof cfg.slack_webhook_url === "string" ? cfg.slack_webhook_url.trim() : ""
    return /^https:\/\/hooks\.slack\.com\//.test(raw) && raw.length <= 500 ? raw : null
  } catch { return null }
}

// ── Top-level: gather + send ──────────────────────────────────────────────────

export interface SendSimsDigestResult {
  sent: boolean
  to: string[]
  slackSent: boolean
  data: SimsDigestData
}

/**
 * Gather digest data for [windowStart, windowEnd), then send email + Slack.
 * Opt-in / safe:
 *   • Returns { sent: false } when there are no recipients.
 *   • Skips delivery silently when data.isQuietDay is true (caller can override
 *     by passing forceQuiet: true — used by the manual /send endpoint).
 *   • Records last_sent marker after successful delivery.
 */
export async function sendSimsDigest(
  deps: SimsDigestDeps,
  projectId: string,
  accountId: string,
  windowStart: number,
  windowEnd: number,
  opts: { skipIfQuiet?: boolean } = {},
): Promise<SendSimsDigestResult> {
  const data = await gatherSimsDigest(deps.db, projectId, windowStart, windowEnd)

  // Default: skip if there was zero activity. The scheduler passes skipIfQuiet:true;
  // the manual /send endpoint doesn't, so admins can always force-send.
  if (opts.skipIfQuiet !== false && data.isQuietDay) {
    return { sent: false, to: [], slackSent: false, data }
  }

  // Resolve recipients
  const to = await resolveDigestRecipients(deps.db, accountId)
  if (!to.length) return { sent: false, to: [], slackSent: false, data }

  const dateLabel = fmtDate(data.windowEnd)
  const subject = data.isQuietDay
    ? `Klavity Sims digest: ${data.projectName} — quiet day`
    : `Klavity Sims digest: ${data.projectName} — ${data.issuesFoundTotal} issue${data.issuesFoundTotal !== 1 ? "s" : ""}${data.regressionsReconfirmedTotal > 0 ? `, ${data.regressionsReconfirmedTotal} regression${data.regressionsReconfirmedTotal !== 1 ? "s" : ""} re-confirmed` : ""} (${dateLabel})`

  const html = buildSimsDigestHtml(data)
  const text = buildSimsDigestText(data)

  await deps.sendEmail(to, subject, html, text)
  await setSimsDigestLastSent(deps.db, projectId, Date.now())

  // Slack (best-effort, never throws)
  let slackSent = false
  try {
    const webhookUrl = await getProjectSlackWebhook(deps.db, projectId)
    if (webhookUrl) {
      const poster = deps.postSlack ?? defaultPostSlack
      const payload = buildSimsDigestSlackPayload(data)
      await poster(webhookUrl, payload)
      slackSent = true
    }
  } catch (e: any) {
    console.warn("[sims-digest] slack delivery failed (non-fatal):", e?.message || e)
  }

  return { sent: true, to, slackSent, data }
}

// ── Scheduler ─────────────────────────────────────────────────────────────────

export interface SimsDigestSchedulerDeps extends SimsDigestDeps {
  /** Override Date.now() — for tests and simulation. */
  nowMs?: () => number
}

/**
 * Run one digest tick: iterate all active projects, fire digests where due.
 * "Due" = lastSentAt is null OR lastSentAt < now - 24 h.
 * Skips projects with zero Sim activity in the window.
 *
 * Called by startSimsDigestScheduler() once per hour.
 * Exported so tests can call it directly without a real setInterval.
 */
export async function tickSimsDigest(deps: SimsDigestSchedulerDeps): Promise<void> {
  const nowMs = deps.nowMs ? deps.nowMs() : Date.now()
  const windowStart = nowMs - DAY_MS
  const windowEnd = nowMs

  // Fetch all active projects with their account ids.
  let projects: Array<{ id: string; accountId: string }>
  try {
    const r = await deps.db.execute({
      sql: `SELECT id, account_id FROM projects WHERE status='active' ORDER BY created_at ASC`,
      args: [],
    })
    projects = (r.rows as any[]).map((x) => ({ id: String(x.id), accountId: String(x.account_id) }))
  } catch (e: any) {
    console.warn("[sims-digest] failed to list projects:", e?.message || e)
    return
  }

  for (const { id: projectId, accountId } of projects) {
    try {
      // Check if digest was already sent in the last 24 h.
      const lastSent = await getSimsDigestLastSent(deps.db, projectId)
      if (lastSent !== null && lastSent >= windowStart) continue  // already sent today

      const result = await sendSimsDigest(
        deps,
        projectId,
        accountId,
        windowStart,
        windowEnd,
        { skipIfQuiet: true },
      )

      if (result.sent) {
        console.log(`[sims-digest] sent for project=${projectId} to=[${result.to.join(",")}] issues=${result.data.issuesFoundTotal} regressions=${result.data.regressionsReconfirmedTotal} slack=${result.slackSent}`)
      }
      // If isQuietDay → sent:false, we silently skip (no log noise for quiet projects).
    } catch (e: any) {
      console.warn(`[sims-digest] error for project ${projectId}:`, e?.message || e)
    }
  }
}

/**
 * Start the daily Sims digest scheduler. Mirrors startTrailScheduler() from
 * lib/trails-scheduler.ts — returns the setInterval handle.
 *
 * Wire in server.ts inside the `if (db && process.env.NODE_ENV !== 'test')` block
 * alongside startTrailScheduler() and startCrashReaper().
 *
 * @param deps  Injectable deps (sendEmail, db, optional postSlack).
 *              In production, pass { db: db!, sendEmail: sendReportAlertEmail }.
 */
export function startSimsDigestScheduler(deps: SimsDigestSchedulerDeps): ReturnType<typeof setInterval> {
  return setInterval(() => {
    tickSimsDigest(deps).catch((e) => console.warn("[sims-digest] tick crashed:", String((e as any)?.message || e)))
  }, DIGEST_TICK_MS)
}
