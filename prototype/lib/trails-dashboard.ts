// Layer E — Trails dashboard aggregator. One project-scoped read used by GET /api/trails/dashboard
// and unit-testable without HTTP. Surfaces: the project's Trails, its recent Walks (verdict pills),
// the review queue (queued findings), and the published precision metric (legit-bug rate).

import type { Trail, Walk, Finding } from "./trails-types"
import { listTrails, listRecentWalks, listFindings, computeScheduleCoverage } from "./trails"
import type { ScheduleCoverage } from "./trails"
import { projectPrecision } from "./trails-findings-gate"
import type { Client } from "@libsql/client"

export interface TrailsDashboard {
  trails: Trail[]
  recentWalks: Walk[]
  queue: Finding[]
  precision: { filed: number; dismissed: number; precision: number | null }
  /** KLA-216: per-project schedule-health coverage over the last 7 days ("13 of 14 scheduled walks ran"). */
  coverage: ScheduleCoverage
}

export async function trailsDashboardData(projectId: string): Promise<TrailsDashboard> {
  const [raw, recentWalks, queue, precision, coverage] = await Promise.all([
    listTrails(projectId),
    listRecentWalks(projectId, 20),
    listFindings(projectId, { status: "queued", limit: 50 }),
    projectPrecision(projectId),
    computeScheduleCoverage(projectId),
  ])
  // Hide archived trails from the main dashboard by default (KLA-160).
  const trails = raw.filter((t) => t.status !== "archived")
  return { trails, recentWalks, queue, precision, coverage }
}

// ── KLA-78: Walk trend over time ──────────────────────────────────────────────────────────────────
// Groups terminal walks (green/amber/red) into per-day buckets ordered oldest→newest.
// Each bucket carries raw counts + a passRate (green / total). Running walks are excluded
// (they're not terminal). bucketDays defaults to 30; pass a smaller value (e.g. 14) for the UI.
// Optional trailId scopes to a single Trail.

export interface TrendBucket {
  day: string           // YYYY-MM-DD (UTC)
  green: number
  amber: number
  red: number
  total: number
  passRate: number | null  // green / total; null when total === 0
}

export async function walkTrends(
  projectId: string,
  opts: { trailId?: string; bucketDays?: number } = {},
  _db?: Client,          // injectable for tests
): Promise<TrendBucket[]> {
  const { db } = await import("./db")
  const client = _db ?? db!
  if (!client) return []

  const bucketDays = Math.max(1, Math.min(365, opts.bucketDays ?? 30))
  const sinceMs = Date.now() - bucketDays * 24 * 3600 * 1000

  const trailClause = opts.trailId ? "AND trail_id = ?" : ""
  const args: (string | number)[] = [projectId, sinceMs]
  if (opts.trailId) args.push(opts.trailId)

  const r = await client.execute({
    sql: `SELECT
            strftime('%Y-%m-%d', CAST(started_at AS REAL) / 1000, 'unixepoch') AS day,
            SUM(CASE WHEN status='green' THEN 1 ELSE 0 END)  AS n_green,
            SUM(CASE WHEN status='amber' THEN 1 ELSE 0 END)  AS n_amber,
            SUM(CASE WHEN status='red'   THEN 1 ELSE 0 END)  AS n_red,
            COUNT(*) AS n_total
          FROM trail_runs
          WHERE project_id = ?
            AND status IN ('green', 'amber', 'red')
            AND started_at >= ?
            ${trailClause}
          GROUP BY day
          ORDER BY day ASC`,
    args,
  })

  return r.rows.map((row: any) => {
    const green = Number(row.n_green ?? 0)
    const amber = Number(row.n_amber ?? 0)
    const red   = Number(row.n_red   ?? 0)
    const total = Number(row.n_total ?? 0)
    return {
      day:      String(row.day),
      green, amber, red, total,
      passRate: total > 0 ? green / total : null,
    }
  })
}
