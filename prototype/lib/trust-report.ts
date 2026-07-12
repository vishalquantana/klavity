// lib/trust-report.ts — Weekly "Trust Report" digest for a project.
//
// Generates a branded weekly summary of Klavity's value for the project owner:
//   • Bug reports filed (Snap)
//   • AutoSim regressions caught (trail_runs verdicts with findings)
//   • Sim findings (feedback rows from Sims)
//   • Recurring issues (recurrence > 1)
//
// Fully injectable: all DB access uses a Client arg so tests run hermetically.
// No DB migration needed: last_sent marker stored in projects.modal_config_json.
// Delivery: POST /api/projects/:id/trust-report/send (manual trigger, admin-only).
// Scheduling note: a weekly cron can call notifyTrustReport(projectId) directly
//   from a setInterval / bun.cron in server.ts — suggested follow-up in KLAVITYKLA-203.

import type { Client } from "@libsql/client"
import { resolveBranding, brandingFooterHtml, brandingFooterText, escapeBranding, type ResolvedBranding } from "./trails-branding"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TrustReportData {
  projectId: string
  projectName: string
  weekStart: Date
  weekEnd: Date
  /** Human bug/feature reports filed via widget or extension */
  snapReportsTotal: number
  /** Snap reports: [{title,url,severity}] top-3 by created_at */
  snapHighlights: SnapHighlight[]
  /** AutoSim walk runs that finished (pass or fail) in the window */
  autoSimRunsTotal: number
  /** AutoSim walks that caught at least one finding (regression caught) */
  regressionsTotal: number
  /** Individual regression titles (top 3) */
  regressionHighlights: string[]
  /** Sim-authored feedback rows (sim_id IS NOT NULL) */
  simFindingsTotal: number
  /** Sim finding titles (top 3) */
  simFindingHighlights: SimFindingHighlight[]
  /** Issues seen more than once during the window */
  recurringIssuesTotal: number
  /** Top-3 recurring issue titles with count */
  recurringHighlights: RecurringHighlight[]
  /** True when zero activity across all dimensions */
  isQuietWeek: boolean
  /** KLA-216: honest schedule-health coverage over the window — scheduled walks that actually ran. */
  scheduleCoverage: { scheduled: number; ran: number; skippedOrMissed: number; coverage: number | null }
  /** KLAVITYKLA-223: per-project agency branding (render-ready). Unbranded default renders as before. */
  branding: ResolvedBranding
}

export interface SnapHighlight {
  title: string
  urlPath: string | null
  severity: string | null
}

export interface SimFindingHighlight {
  title: string
  simName: string | null
}

export interface RecurringHighlight {
  title: string
  count: number
}

export interface TrustReportDeps {
  db: Client
  sendEmail: (to: string[], subject: string, html: string, text: string) => Promise<void>
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const TRUST_REPORT_LAST_SENT_KEY = "trust_report_last_sent_at"
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000

// ── Data gathering ────────────────────────────────────────────────────────────

/**
 * Gather all raw data for a project's trust report over [windowStart, windowEnd).
 * Pure DB reads — no side-effects.
 */
export async function gatherTrustReport(
  c: Client,
  projectId: string,
  windowStart: number,
  windowEnd: number,
): Promise<TrustReportData> {
  // 1. Project name
  const projRow = await c.execute({ sql: "SELECT name FROM projects WHERE id=?", args: [projectId] })
  const projectName = projRow.rows.length ? String((projRow.rows[0] as any).name) : projectId

  const weekStart = new Date(windowStart)
  const weekEnd = new Date(windowEnd)

  // 2. Snap reports: feedback rows NOT from a Sim (sim_id IS NULL)
  const snapR = await c.execute({
    sql: `SELECT observation, suggested_bug_json, url_path, severity
          FROM feedback
          WHERE project_id=? AND created_at>=? AND created_at<? AND (sim_id IS NULL OR sim_id='')
          ORDER BY created_at DESC`,
    args: [projectId, windowStart, windowEnd],
  })
  const snapReportsTotal = snapR.rows.length
  const snapHighlights: SnapHighlight[] = (snapR.rows as any[]).slice(0, 3).map((r) => ({
    title: extractTitle(r),
    urlPath: r.url_path != null ? String(r.url_path) : null,
    severity: r.severity != null ? String(r.severity) : null,
  }))

  // 3. Sim findings: feedback rows from a Sim (sim_id IS NOT NULL)
  const simR = await c.execute({
    sql: `SELECT f.observation, f.suggested_bug_json, f.url_path, f.sim_id, p.name AS sim_name
          FROM feedback f
          LEFT JOIN personas p ON p.id=f.sim_id AND p.project_id=f.project_id
          WHERE f.project_id=? AND f.created_at>=? AND f.created_at<? AND f.sim_id IS NOT NULL AND f.sim_id!=''
          ORDER BY f.created_at DESC`,
    args: [projectId, windowStart, windowEnd],
  })
  const simFindingsTotal = simR.rows.length
  const simFindingHighlights: SimFindingHighlight[] = (simR.rows as any[]).slice(0, 3).map((r) => ({
    title: extractTitle(r),
    simName: r.sim_name != null ? String(r.sim_name) : null,
  }))

  // 4. AutoSim walks that finished in the window
  const walksR = await c.execute({
    sql: `SELECT id, status FROM trail_runs
          WHERE project_id=? AND finished_at>=? AND finished_at<? AND status IN ('pass','fail','done')
          ORDER BY finished_at DESC`,
    args: [projectId, windowStart, windowEnd],
  })
  const autoSimRunsTotal = walksR.rows.length

  // 5. Walks with ≥1 finding = regressions caught
  const runIds = (walksR.rows as any[]).map((r) => String(r.id))
  let regressionsTotal = 0
  const regressionHighlights: string[] = []
  if (runIds.length > 0) {
    // We query per-runId for findings — SQLite IN clause; safe because runIds are internal UUIDs.
    const placeholders = runIds.map(() => "?").join(",")
    const findingsR = await c.execute({
      sql: `SELECT run_id, title FROM findings WHERE project_id=? AND run_id IN (${placeholders}) ORDER BY created_at ASC`,
      args: [projectId, ...runIds],
    })
    const runsWithFindings = new Set((findingsR.rows as any[]).map((r) => String(r.run_id)))
    regressionsTotal = runsWithFindings.size
    // Collect unique finding titles (top 3)
    const seen = new Set<string>()
    for (const r of findingsR.rows as any[]) {
      const t = String(r.title || "").trim()
      if (t && !seen.has(t)) { seen.add(t); regressionHighlights.push(t) }
      if (regressionHighlights.length >= 3) break
    }
  }

  // 6. Recurring issues: feedback rows in the window that are part of a recurrence cluster
  //    (issue_key IS NOT NULL OR recurrence_count > 1)
  const recurR = await c.execute({
    sql: `SELECT observation, suggested_bug_json, COALESCE(recurrence_count, 1) AS rc
          FROM feedback
          WHERE project_id=? AND created_at>=? AND created_at<? AND (
            (issue_key IS NOT NULL AND issue_key!='') OR COALESCE(recurrence_count,1)>1
          )
          ORDER BY COALESCE(recurrence_count,1) DESC, created_at DESC`,
    args: [projectId, windowStart, windowEnd],
  })
  const recurringIssuesTotal = recurR.rows.length
  const recurringHighlights: RecurringHighlight[] = (recurR.rows as any[]).slice(0, 3).map((r) => ({
    title: extractTitle(r),
    count: Math.max(1, Number(r.rc || 1)),
  }))

  // 7. KLA-216: schedule-health coverage — scheduled walks that actually ran vs. skipped/missed,
  //    so the digest never claims "guarded daily" while the scheduler was silently skipping.
  const covR = await c.execute({
    sql: `SELECT status, COUNT(*) AS n FROM trail_runs
          WHERE project_id=? AND trigger='scheduled' AND started_at>=? AND started_at<?
          GROUP BY status`,
    args: [projectId, windowStart, windowEnd],
  })
  let covScheduled = 0, covSkippedOrMissed = 0
  for (const row of covR.rows as any[]) {
    const n = Number(row.n || 0)
    covScheduled += n
    if (row.status === "skipped" || row.status === "missed") covSkippedOrMissed += n
  }
  const covRan = covScheduled - covSkippedOrMissed
  const scheduleCoverage = {
    scheduled: covScheduled,
    ran: covRan,
    skippedOrMissed: covSkippedOrMissed,
    coverage: covScheduled > 0 ? covRan / covScheduled : null,
  }

  const isQuietWeek =
    snapReportsTotal === 0 &&
    autoSimRunsTotal === 0 &&
    simFindingsTotal === 0 &&
    recurringIssuesTotal === 0

  // 8. KLAVITYKLA-223: agency branding — read from the same injectable client so the digest
  //    skins to the agency (logo/accent/footer) while staying hermetic in tests.
  let branding = resolveBranding(null)
  try {
    const brR = await c.execute({ sql: "SELECT modal_config_json FROM projects WHERE id=?", args: [projectId] })
    if (brR.rows.length) {
      const cfg = JSON.parse(String((brR.rows[0] as any).modal_config_json || "{}")) || {}
      branding = resolveBranding(cfg.agency_branding)
    }
  } catch { /* unbranded default */ }

  return {
    projectId,
    projectName,
    weekStart,
    weekEnd,
    snapReportsTotal,
    snapHighlights,
    autoSimRunsTotal,
    regressionsTotal,
    regressionHighlights,
    simFindingsTotal,
    simFindingHighlights,
    recurringIssuesTotal,
    recurringHighlights,
    isQuietWeek,
    scheduleCoverage,
    branding,
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

// ── HTML/text rendering ────────────────────────────────────────────────────────

const f = "font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif"

function esc(s: string): string {
  return String(s || "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] as string))
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function metricCell(label: string, value: number, accent: string): string {
  return `
    <td align="center" style="padding:12px 10px">
      <div style="${f};font-size:32px;font-weight:800;color:${accent}">${value}</div>
      <div style="${f};font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#6b6678;margin-top:3px">${esc(label)}</div>
    </td>`
}

function highlightRow(text: string, badge?: string): string {
  return `
    <tr><td style="padding:6px 0;border-bottom:1px solid #f0eef8">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="${f};font-size:13px;color:#3f3a52;line-height:1.4">${esc(text)}</td>
          ${badge ? `<td align="right" style="padding-left:8px;white-space:nowrap"><span style="background:#f3f1ff;color:#4f46e5;${f};font-size:10px;font-weight:700;padding:2px 7px;border-radius:10px">${esc(badge)}</span></td>` : ""}
        </tr>
      </table>
    </td></tr>`
}

function sectionCard(title: string, icon: string, rows: string, emptyMsg: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;background:#faf9ff;border:1px solid #e8e6f5;border-radius:12px;overflow:hidden">
      <tr><td style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:10px 16px">
        <span style="${f};font-size:12px;font-weight:700;color:#fff;letter-spacing:.06em;text-transform:uppercase">${icon} ${esc(title)}</span>
      </td></tr>
      <tr><td style="padding:12px 16px">
        ${rows || `<div style="${f};font-size:13px;color:#a0a0b0;font-style:italic">${esc(emptyMsg)}</div>`}
      </td></tr>
    </table>`
}

/** Build the branded HTML email body for the trust report. Pure — no I/O. */
export function buildTrustReportHtml(data: TrustReportData): string {
  const dateRange = `${fmtDate(data.weekStart)} – ${fmtDate(data.weekEnd)}`

  // KLAVITYKLA-223: agency branding — logo + name + accent skin the header band; the footer carries
  // the "Monitored by <Agency> · powered by Klavity" PLG line. Unbranded projects render as before.
  const branding = data.branding ?? resolveBranding(null)
  const bAccent = branding.accent
  const brandHeader = branding.logoDataUrl
    ? `<img src="${escapeBranding(branding.logoDataUrl)}" alt="${escapeBranding(branding.name || "Agency")} logo" style="max-height:40px;max-width:200px;display:block;margin:0 auto 6px;object-fit:contain" />`
    : `<div style="${f};font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-.02em">${escapeBranding(branding.name || "Klavity")}</div>`

  // Metrics row
  const metricsRow = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e6f5;border-radius:12px;background:#fff;margin-bottom:18px">
      <tr>
        ${metricCell("Reports filed", data.snapReportsTotal, "#6366f1")}
        <td style="border-left:1px solid #f0eef8"></td>
        ${metricCell("Regressions caught", data.regressionsTotal, "#22c55e")}
        <td style="border-left:1px solid #f0eef8"></td>
        ${metricCell("Sim findings", data.simFindingsTotal, "#f59e0b")}
        <td style="border-left:1px solid #f0eef8"></td>
        ${metricCell("Recurring issues", data.recurringIssuesTotal, "#ef4444")}
      </tr>
    </table>`

  // KLA-216: honest schedule-coverage line — only shown when the project had scheduled walks in the
  // window. Green when fully covered; amber warning when any scheduled walk did not run.
  const sc = data.scheduleCoverage
  const coverageBanner = (sc && sc.scheduled > 0)
    ? (() => {
        const pct = sc.coverage == null ? "—" : `${Math.round(sc.coverage * 100)}%`
        const ok = sc.skippedOrMissed === 0
        const accent = ok ? "#22c55e" : "#f59e0b"
        const bg = ok ? "#f0fdf4" : "#fffbeb"
        const border = ok ? "#bbf7d0" : "#fde68a"
        const line = ok
          ? `All ${sc.scheduled} scheduled walk${sc.scheduled !== 1 ? "s" : ""} ran (${pct}). Guarded as promised.`
          : `${sc.ran} of ${sc.scheduled} scheduled walks ran (${pct}) — ${sc.skippedOrMissed} did not run this week.`
        return `<div style="${f};font-size:13px;color:${accent};background:${bg};border:1px solid ${border};border-radius:10px;padding:12px 16px;margin-bottom:18px">
          <strong>Schedule health:</strong> ${esc(line)}
        </div>`
      })()
    : ""

  // Quiet week notice
  const quietBanner = data.isQuietWeek
    ? `<div style="${f};font-size:14px;color:#7c7890;background:#f7f6ff;border:1px solid #e8e6f5;border-radius:10px;padding:14px 16px;margin-bottom:18px;text-align:center;font-style:italic">
        Quiet week — no reports, Sim findings, or AutoSim runs. Your product behaved! ✦
      </div>`
    : ""

  // Snap reports section
  const snapRows = data.snapHighlights.map((h) => {
    const badge = h.severity ? String(h.severity) : ""
    return highlightRow(h.title + (h.urlPath ? ` · ${h.urlPath}` : ""), badge || undefined)
  }).join("")
  const snapSection = sectionCard(
    "Bug Reports (Snap)",
    "▸",
    data.snapHighlights.length
      ? `<table role="presentation" width="100%">${snapRows}</table>${data.snapReportsTotal > 3 ? `<div style="${f};font-size:12px;color:#a3a0ad;margin-top:6px">+ ${data.snapReportsTotal - 3} more reports this week</div>` : ""}`
      : "",
    "No reports this week",
  )

  // Regressions section
  const regRows = data.regressionHighlights.map((t) => highlightRow(t)).join("")
  const regSection = sectionCard(
    "Regressions Caught (AutoSim)",
    "⚡",
    data.regressionHighlights.length
      ? `<table role="presentation" width="100%">${regRows}</table>${data.autoSimRunsTotal > 0 ? `<div style="${f};font-size:12px;color:#a3a0ad;margin-top:6px">${data.autoSimRunsTotal} AutoSim run${data.autoSimRunsTotal !== 1 ? "s" : ""} completed · ${data.regressionsTotal} caught regression${data.regressionsTotal !== 1 ? "s" : ""}</div>` : ""}`
      : (data.autoSimRunsTotal > 0 ? `<div style="${f};font-size:13px;color:#22c55e">All ${data.autoSimRunsTotal} AutoSim run${data.autoSimRunsTotal !== 1 ? "s" : ""} passed — no regressions found.</div>` : ""),
    "No AutoSim runs this week",
  )

  // Sim findings section
  const simRows = data.simFindingHighlights.map((h) =>
    highlightRow(h.title, h.simName ? `via ${h.simName}` : undefined),
  ).join("")
  const simSection = sectionCard(
    "Sim Findings",
    "◈",
    data.simFindingHighlights.length
      ? `<table role="presentation" width="100%">${simRows}</table>${data.simFindingsTotal > 3 ? `<div style="${f};font-size:12px;color:#a3a0ad;margin-top:6px">+ ${data.simFindingsTotal - 3} more findings</div>` : ""}`
      : "",
    "No Sim findings this week",
  )

  // Recurring issues section
  const recurRows = data.recurringHighlights.map((h) =>
    highlightRow(h.title, `×${h.count}`),
  ).join("")
  const recurSection = sectionCard(
    "Recurring Issues",
    "↻",
    data.recurringHighlights.length
      ? `<table role="presentation" width="100%">${recurRows}</table>${data.recurringIssuesTotal > 3 ? `<div style="${f};font-size:12px;color:#a3a0ad;margin-top:6px">+ ${data.recurringIssuesTotal - 3} more recurring issues</div>` : ""}`
      : "",
    "No recurring issues this week",
  )

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f3f7">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3f7">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 2px 10px rgba(20,16,40,.10)">

        <!-- dark brand band (agency-branded when configured) -->
        <tr><td align="center" style="background:#1e1b4b;padding:26px 28px 18px">
          ${brandHeader}
          <div style="${f};font-size:12px;font-weight:600;color:#a5b4fc;letter-spacing:.16em;text-transform:uppercase;margin-top:4px">Weekly Trust Report</div>
        </td></tr>

        <!-- accent header -->
        <tr><td style="background:${esc(bAccent)};padding:18px 28px">
          <div style="${f};font-size:18px;font-weight:700;color:#ffffff">${esc(data.projectName)}</div>
          <div style="${f};font-size:13px;color:#c7d2fe;margin-top:4px">${esc(dateRange)}</div>
        </td></tr>

        <!-- body -->
        <tr><td style="padding:24px 24px 8px">
          ${quietBanner}
          ${coverageBanner}
          ${metricsRow}
          ${snapSection}
          ${regSection}
          ${simSection}
          ${recurSection}
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:8px 24px 28px;text-align:center">
          <a href="https://klavity.in/dashboard?project=${encodeURIComponent(data.projectId)}#tickets"
             style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;${f};font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px">
            Open Dashboard →
          </a>
        </td></tr>

        <!-- footer — carries the agency + Klavity PLG backlink line (KLAVITYKLA-223) -->
        <tr><td style="padding:0 24px 24px">
          <div style="border-top:1px solid #eceaf2;padding-top:14px">
            <p style="margin:0;${f};font-size:11px;color:#a3a0ad;line-height:1.6">
              This is your weekly digest${branding.whiteLabel ? "" : " from Klavity — AI that catches bugs before your users do"}.
              You're receiving this because you own the <strong>${esc(data.projectName)}</strong> project.
            </p>
          </div>
        </td></tr>

      </table>
      <p style="margin:18px 0 0;${f};font-size:11px;color:#b6b3c0">${brandingFooterHtml(branding, { linkColor: "#b6b3c0" })}</p>
    </td></tr>
  </table>
</body></html>`
}

/** Build the plain-text version. Pure — no I/O. */
export function buildTrustReportText(data: TrustReportData): string {
  const dateRange = `${fmtDate(data.weekStart)} – ${fmtDate(data.weekEnd)}`
  const lines: string[] = [
    `Klavity Weekly Trust Report — ${data.projectName}`,
    `${dateRange}`,
    `${"─".repeat(52)}`,
    "",
  ]

  if (data.isQuietWeek) {
    lines.push("Quiet week — no reports, Sim findings, or AutoSim runs. Your product behaved!", "")
  }

  const sc = data.scheduleCoverage
  if (sc && sc.scheduled > 0) {
    const pct = sc.coverage == null ? "—" : `${Math.round(sc.coverage * 100)}%`
    if (sc.skippedOrMissed === 0) {
      lines.push(`SCHEDULE HEALTH: All ${sc.scheduled} scheduled walk(s) ran (${pct}). Guarded as promised.`, "")
    } else {
      lines.push(`SCHEDULE HEALTH: ${sc.ran} of ${sc.scheduled} scheduled walks ran (${pct}) — ${sc.skippedOrMissed} did not run this week.`, "")
    }
  }

  lines.push(
    `METRICS`,
    `  Bug reports filed:      ${data.snapReportsTotal}`,
    `  Regressions caught:     ${data.regressionsTotal}`,
    `  Sim findings:           ${data.simFindingsTotal}`,
    `  Recurring issues:       ${data.recurringIssuesTotal}`,
    "",
  )

  if (data.snapHighlights.length) {
    lines.push("BUG REPORTS (Snap)")
    for (const h of data.snapHighlights) {
      lines.push(`  • ${h.title}${h.severity ? ` [${h.severity}]` : ""}`)
    }
    if (data.snapReportsTotal > 3) lines.push(`  + ${data.snapReportsTotal - 3} more`)
    lines.push("")
  }

  if (data.regressionHighlights.length) {
    lines.push("REGRESSIONS CAUGHT (AutoSim)")
    for (const t of data.regressionHighlights) lines.push(`  • ${t}`)
    lines.push(`  ${data.autoSimRunsTotal} run(s) completed, ${data.regressionsTotal} regression(s) caught`, "")
  } else if (data.autoSimRunsTotal > 0) {
    lines.push(`AUTOSIM: All ${data.autoSimRunsTotal} run(s) passed — no regressions found.`, "")
  }

  if (data.simFindingHighlights.length) {
    lines.push("SIM FINDINGS")
    for (const h of data.simFindingHighlights) {
      lines.push(`  • ${h.title}${h.simName ? ` (via ${h.simName})` : ""}`)
    }
    if (data.simFindingsTotal > 3) lines.push(`  + ${data.simFindingsTotal - 3} more`)
    lines.push("")
  }

  if (data.recurringHighlights.length) {
    lines.push("RECURRING ISSUES")
    for (const h of data.recurringHighlights) lines.push(`  • ${h.title} (×${h.count})`)
    if (data.recurringIssuesTotal > 3) lines.push(`  + ${data.recurringIssuesTotal - 3} more`)
    lines.push("")
  }

  // KLAVITYKLA-223: footer carries the "Monitored by <Agency> · powered by Klavity" PLG line.
  const branding = data.branding ?? resolveBranding(null)
  lines.push(
    "─".repeat(52),
    `View your dashboard: https://klavity.in/dashboard?project=${encodeURIComponent(data.projectId)}#tickets`,
    brandingFooterText(branding),
  )

  return lines.join("\n")
}

// ── last-sent marker (stored in modal_config_json, no migration needed) ────────

export async function getTrustReportLastSent(c: Client, projectId: string): Promise<number | null> {
  const r = await c.execute({ sql: "SELECT modal_config_json FROM projects WHERE id=?", args: [projectId] })
  if (!r.rows.length) return null
  try {
    const cfg = JSON.parse(String((r.rows[0] as any).modal_config_json || "{}")) || {}
    const v = cfg[TRUST_REPORT_LAST_SENT_KEY]
    return typeof v === "number" ? v : null
  } catch { return null }
}

export async function setTrustReportLastSent(c: Client, projectId: string, at: number): Promise<void> {
  // Read-modify-write: preserve all other modal_config_json keys.
  const r = await c.execute({ sql: "SELECT modal_config_json FROM projects WHERE id=?", args: [projectId] })
  let cfg: Record<string, unknown> = {}
  if (r.rows.length) {
    try { cfg = JSON.parse(String((r.rows[0] as any).modal_config_json || "{}")) || {} } catch { /* ignore */ }
  }
  cfg[TRUST_REPORT_LAST_SENT_KEY] = at
  await c.execute({ sql: "UPDATE projects SET modal_config_json=?, updated_at=? WHERE id=?", args: [JSON.stringify(cfg), Date.now(), projectId] })
}

// ── Top-level: gather + send ───────────────────────────────────────────────────

export async function sendTrustReport(
  deps: TrustReportDeps,
  projectId: string,
  accountId: string,
  windowStart: number,
  windowEnd: number,
): Promise<{ sent: boolean; to: string[]; data: TrustReportData }> {
  const data = await gatherTrustReport(deps.db, projectId, windowStart, windowEnd)

  // Resolve recipients: account owner + admins (same logic as report-alert.ts)
  const r = await deps.db.execute({
    sql: `SELECT email FROM account_members WHERE account_id=? AND account_role IN ('owner','admin')
          ORDER BY CASE account_role WHEN 'owner' THEN 0 ELSE 1 END, created_at ASC, email ASC`,
    args: [accountId],
  })
  let to = r.rows.map((x: any) => String(x.email).trim().toLowerCase()).filter(Boolean)
  if (!to.length) {
    const o = await deps.db.execute({ sql: "SELECT owner_email FROM accounts WHERE id=?", args: [accountId] })
    const owner = o.rows.length ? String((o.rows[0] as any).owner_email || "").trim().toLowerCase() : ""
    if (owner) to = [owner]
  }
  to = [...new Set(to)]

  if (!to.length) return { sent: false, to: [], data }

  const weekLabel = fmtDate(data.weekStart)
  const subject = data.isQuietWeek
    ? `Klavity weekly digest: ${data.projectName} — quiet week`
    : `Klavity weekly digest: ${data.projectName} — ${data.snapReportsTotal + data.simFindingsTotal + data.regressionsTotal} signals this week`

  const html = buildTrustReportHtml(data)
  const text = buildTrustReportText(data)

  await deps.sendEmail(to, subject, html, text)
  await setTrustReportLastSent(deps.db, projectId, Date.now())

  return { sent: true, to, data }
}
