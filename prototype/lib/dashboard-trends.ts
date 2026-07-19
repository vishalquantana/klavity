// KLAVITYKLA-225 (JTBD 7.11) — Dashboard trend aggregate + drill-down.
// Buckets a project's feedback into per-day counts over the last N days so the overview
// can draw a trend chart, and lets the UI drill from a single day/series back to the
// underlying reports. Pure and unit-testable without HTTP (inject a Client for tests).
//
// Series definitions (kept in lockstep with the dashboard's own vocabulary):
//   • reports     — every inbound feedback row, keyed on created_at.
//   • findings    — reports that carry a suggested bug (suggested_bug_json), keyed on created_at.
//                   This is the actionable subset the triage queue turns into tickets.
//   • regressions — a resolved report that reappeared (last_seen_at > resolved_at), keyed on the
//                   day it recurred (last_seen_at). Mirrors the dashboard's isRegression flag.

import type { Client } from "@libsql/client"

export type TrendSeries = "reports" | "findings" | "regressions"
export const TREND_SERIES: TrendSeries[] = ["reports", "findings", "regressions"]

export interface DashboardTrendBucket {
  day: string          // YYYY-MM-DD (UTC)
  reports: number
  findings: number
  regressions: number
}

export interface DashboardTrends {
  days: number
  buckets: DashboardTrendBucket[]                              // oldest → newest, gaps zero-filled
  totals: { reports: number; findings: number; regressions: number }
}

const DAY_MS = 24 * 3600 * 1000

function clampDays(days?: number): number {
  const n = Math.floor(Number(days))
  if (!Number.isFinite(n)) return 30
  return Math.max(1, Math.min(365, n))
}

// Midnight-UTC ms for the day `offset` days before today (offset 0 = today's midnight UTC).
function utcDayStart(atMs: number): number {
  const d = new Date(atMs)
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

// Build a continuous, zero-filled day axis of `days` entries ending today (UTC).
function emptyAxis(days: number, nowMs: number): Map<string, DashboardTrendBucket> {
  const todayStart = utcDayStart(nowMs)
  const axis = new Map<string, DashboardTrendBucket>()
  for (let i = days - 1; i >= 0; i--) {
    const key = dayKey(todayStart - i * DAY_MS)
    axis.set(key, { day: key, reports: 0, findings: 0, regressions: 0 })
  }
  return axis
}

export async function dashboardTrends(
  projectId: string,
  opts: { days?: number; now?: number } = {},
  _db?: Client,
): Promise<DashboardTrends> {
  const days = clampDays(opts.days)
  const nowMs = opts.now ?? Date.now()
  const axis = emptyAxis(days, nowMs)
  const totals = { reports: 0, findings: 0, regressions: 0 }
  const done = () => ({ days, buckets: [...axis.values()], totals })

  const { db } = await import("./db")
  const client = _db ?? db!
  if (!client) return done()

  // Window start = midnight UTC of the earliest day in the axis.
  const sinceMs = utcDayStart(nowMs) - (days - 1) * DAY_MS

  // reports + findings, keyed on created_at.
  const r1 = await client.execute({
    sql: `SELECT strftime('%Y-%m-%d', CAST(created_at AS REAL) / 1000, 'unixepoch') AS day,
                 COUNT(*) AS n_reports,
                 SUM(CASE WHEN suggested_bug_json IS NOT NULL AND suggested_bug_json != '' THEN 1 ELSE 0 END) AS n_findings
          FROM feedback
          WHERE project_id = ? AND created_at >= ?
          GROUP BY day`,
    args: [projectId, sinceMs],
  })
  for (const row of r1.rows as any[]) {
    const b = axis.get(String(row.day))
    if (!b) continue
    b.reports = Number(row.n_reports ?? 0)
    b.findings = Number(row.n_findings ?? 0)
  }

  // regressions — resolved reports that reappeared, keyed on the recur day (last_seen_at).
  const r2 = await client.execute({
    sql: `SELECT strftime('%Y-%m-%d', CAST(last_seen_at AS REAL) / 1000, 'unixepoch') AS day,
                 COUNT(*) AS n_regr
          FROM feedback
          WHERE project_id = ?
            AND resolved_at IS NOT NULL AND last_seen_at IS NOT NULL
            AND last_seen_at > resolved_at
            AND last_seen_at >= ?
          GROUP BY day`,
    args: [projectId, sinceMs],
  })
  for (const row of r2.rows as any[]) {
    const b = axis.get(String(row.day))
    if (!b) continue
    b.regressions = Number(row.n_regr ?? 0)
  }

  for (const b of axis.values()) {
    totals.reports += b.reports
    totals.findings += b.findings
    totals.regressions += b.regressions
  }
  return done()
}

export interface TrendDrillItem {
  id: string
  title: string | null
  priority: string | null
  status: string
  urlPath: string | null
  simId: string | null
  createdAt: number
}

// The reports behind a single clicked day + series — the drill-down list.
// `day` is a YYYY-MM-DD UTC key (as emitted in buckets). Newest-first, capped.
export async function dashboardTrendDrill(
  projectId: string,
  opts: { day: string; series: TrendSeries; limit?: number },
  _db?: Client,
): Promise<TrendDrillItem[]> {
  const { db } = await import("./db")
  const client = _db ?? db!
  if (!client) return []

  const dayStart = Date.parse(opts.day + "T00:00:00.000Z")
  if (!Number.isFinite(dayStart)) return []
  const dayEnd = dayStart + DAY_MS
  const limit = Math.max(1, Math.min(200, Math.floor(opts.limit ?? 50)))
  const series: TrendSeries = TREND_SERIES.includes(opts.series) ? opts.series : "reports"

  let where: string
  if (series === "regressions") {
    where = `project_id = ? AND resolved_at IS NOT NULL AND last_seen_at IS NOT NULL
             AND last_seen_at > resolved_at AND last_seen_at >= ? AND last_seen_at < ?`
  } else if (series === "findings") {
    where = `project_id = ? AND created_at >= ? AND created_at < ?
             AND suggested_bug_json IS NOT NULL AND suggested_bug_json != ''`
  } else {
    where = `project_id = ? AND created_at >= ? AND created_at < ?`
  }
  const orderCol = series === "regressions" ? "last_seen_at" : "created_at"

  const r = await client.execute({
    sql: `SELECT id, observation, COALESCE(priority, severity) AS priority,
                 COALESCE(status, 'new') AS status, url_path, sim_id, created_at
          FROM feedback
          WHERE ${where}
          ORDER BY ${orderCol} DESC
          LIMIT ?`,
    args: [projectId, dayStart, dayEnd, limit],
  })
  return (r.rows as any[]).map((x) => ({
    id: String(x.id),
    title: x.observation != null ? String(x.observation) : null,
    priority: x.priority != null ? String(x.priority) : null,
    status: String(x.status || "new"),
    urlPath: x.url_path != null ? String(x.url_path) : null,
    simId: x.sim_id != null ? String(x.sim_id) : null,
    createdAt: Number(x.created_at),
  }))
}
