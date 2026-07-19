// Monthly client-shareable Guarded Flows report — KLAVITYKLA-279 [JTBD 4.15]
//
// A per-project, per-month, read-only summary of guarded-flow (Trail / AutoSim) runs:
// pass / warn / fail counts, regressions caught, and per-flow health for the reporting
// month. Rendered on a public page reachable with the project's existing client share
// token (see project-status-portal.ts) — the same unguessable link a client already has
// for the status portal also opens their monthly report. No PII, no cross-project data,
// no internal config is exposed.
//
// Windowing is UTC-calendar-month based so the numbers are stable and testable:
//   month "2026-07" → [2026-07-01T00:00Z, 2026-08-01T00:00Z)
// A run/regression counts toward a month by its terminal timestamp (trail_runs.finished_at
// for runs; findings.created_at for regressions).

import { projectById } from "./db"
import { gatherPortalBranding, type PortalBranding } from "./project-status-portal"

export type FlowVerdict = "green" | "amber" | "red" | "none"

export interface FlowMonthSummary {
  trailId: string
  trailName: string
  totalRuns: number
  passed: number
  warned: number
  failed: number
  /** passed / (passed+warned+failed), 0..1; 0 when no terminal runs this month. */
  passRate: number
  /** Regressions (findings kind='regression') first raised on this flow during the month. */
  regressionsCaught: number
  lastRunAt: number | null
  lastVerdict: FlowVerdict
  /** Worst outcome seen this month: red > amber > green > none. */
  health: FlowVerdict
}

export interface GuardedFlowsReportData {
  projectName: string
  branding: PortalBranding
  /** Reporting month in "YYYY-MM" (UTC). */
  month: string
  /** Human label, e.g. "July 2026". */
  monthLabel: string
  generatedAt: number
  windowStart: number
  windowEnd: number
  totals: {
    totalRuns: number
    passed: number
    warned: number
    failed: number
    /** passed / total terminal runs, 0..1. */
    passRate: number
    regressionsCaught: number
    /** flows that had at least one terminal run this month. */
    activeFlows: number
  }
  flows: FlowMonthSummary[]
  /** Months (desc, "YYYY-MM") that have at least one terminal run — for navigation. */
  availableMonths: string[]
}

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

/** Resolve a "YYYY-MM" (UTC) month window. Invalid/missing → the current UTC month.
 *  Exported for testing. */
export function resolveMonthWindow(month?: string | null, nowMs: number = Date.now()): {
  month: string
  monthLabel: string
  start: number
  end: number
} {
  let y: number, m: number // m is 0-based
  if (month && MONTH_RE.test(month)) {
    y = Number(month.slice(0, 4))
    m = Number(month.slice(5, 7)) - 1
  } else {
    const d = new Date(nowMs)
    y = d.getUTCFullYear()
    m = d.getUTCMonth()
  }
  const start = Date.UTC(y, m, 1)
  const end = Date.UTC(y, m + 1, 1)
  const mm = String(m + 1).padStart(2, "0")
  return {
    month: `${y}-${mm}`,
    monthLabel: `${MONTH_NAMES[m]} ${y}`,
    start,
    end,
  }
}

function pickHealth(passed: number, warned: number, failed: number): FlowVerdict {
  if (failed > 0) return "red"
  if (warned > 0) return "amber"
  if (passed > 0) return "green"
  return "none"
}

function pct(pass: number, total: number): number {
  return total > 0 ? Math.round((pass / total) * 1000) / 1000 : 0
}

/** Assemble the monthly guarded-flows report for a project. Returns null if the project
 *  does not exist or the DB is unavailable. No PII / no cross-project data. */
export async function gatherGuardedFlowsReport(
  projectId: string,
  month?: string | null,
  nowMs: number = Date.now(),
): Promise<GuardedFlowsReportData | null> {
  const proj = await projectById(projectId)
  if (!proj) return null

  const { db } = await import("./db")
  if (!db) return null

  const win = resolveMonthWindow(month, nowMs)
  const branding = await gatherPortalBranding(projectId)

  // Per-flow run tallies for the month (terminal runs only). LEFT JOIN so a configured
  // trail with zero runs this month still appears (health 'none').
  const runsR = await db.execute({
    sql: `SELECT t.id AS trail_id, t.name AS trail_name,
                 SUM(CASE WHEN tr.status='green' THEN 1 ELSE 0 END) AS passed,
                 SUM(CASE WHEN tr.status='amber' THEN 1 ELSE 0 END) AS warned,
                 SUM(CASE WHEN tr.status='red'   THEN 1 ELSE 0 END) AS failed,
                 MAX(CASE WHEN tr.status IN ('green','amber','red') THEN tr.finished_at END) AS last_run_at
          FROM trails t
          LEFT JOIN trail_runs tr
            ON tr.trail_id = t.id AND tr.project_id = t.project_id
           AND tr.status IN ('green','amber','red')
           AND tr.finished_at >= ? AND tr.finished_at < ?
          WHERE t.project_id = ? AND t.status != 'archived'
          GROUP BY t.id, t.name
          ORDER BY t.created_at ASC`,
    args: [win.start, win.end, projectId],
  })

  // Last verdict per flow within the window (separate lookup keeps the aggregate query simple).
  const lastVerdictByTrail = new Map<string, FlowVerdict>()
  const lastR = await db.execute({
    sql: `SELECT tr.trail_id, tr.status, tr.finished_at
          FROM trail_runs tr
          WHERE tr.project_id = ?
            AND tr.status IN ('green','amber','red')
            AND tr.finished_at >= ? AND tr.finished_at < ?
          ORDER BY tr.finished_at DESC`,
    args: [projectId, win.start, win.end],
  })
  for (const row of lastR.rows as any[]) {
    const tid = String(row.trail_id)
    if (!lastVerdictByTrail.has(tid)) lastVerdictByTrail.set(tid, String(row.status) as FlowVerdict)
  }

  // Regressions caught per flow this month.
  const regByTrail = new Map<string, number>()
  const regR = await db.execute({
    sql: `SELECT trail_id, COUNT(*) AS n
          FROM findings
          WHERE project_id = ? AND kind='regression'
            AND created_at >= ? AND created_at < ?
          GROUP BY trail_id`,
    args: [projectId, win.start, win.end],
  })
  for (const row of regR.rows as any[]) {
    regByTrail.set(String(row.trail_id), Number(row.n ?? 0))
  }

  let totPassed = 0, totWarned = 0, totFailed = 0, totReg = 0, activeFlows = 0
  const flows: FlowMonthSummary[] = (runsR.rows as any[]).map((row) => {
    const tid = String(row.trail_id)
    const passed = Number(row.passed ?? 0)
    const warned = Number(row.warned ?? 0)
    const failed = Number(row.failed ?? 0)
    const total = passed + warned + failed
    const regressionsCaught = regByTrail.get(tid) ?? 0
    totPassed += passed; totWarned += warned; totFailed += failed; totReg += regressionsCaught
    if (total > 0) activeFlows += 1
    return {
      trailId: tid,
      trailName: String(row.trail_name),
      totalRuns: total,
      passed, warned, failed,
      passRate: pct(passed, total),
      regressionsCaught,
      lastRunAt: row.last_run_at != null ? Number(row.last_run_at) : null,
      lastVerdict: lastVerdictByTrail.get(tid) ?? "none",
      health: pickHealth(passed, warned, failed),
    }
  })

  const totalRuns = totPassed + totWarned + totFailed

  // Distinct months with terminal runs (desc) for the month picker.
  const monthsR = await db.execute({
    sql: `SELECT DISTINCT strftime('%Y-%m', CAST(finished_at AS REAL) / 1000, 'unixepoch') AS ym
          FROM trail_runs
          WHERE project_id = ? AND status IN ('green','amber','red') AND finished_at IS NOT NULL
          ORDER BY ym DESC`,
    args: [projectId],
  })
  const availableMonths = (monthsR.rows as any[])
    .map((r) => String(r.ym))
    .filter((s) => MONTH_RE.test(s))

  return {
    projectName: proj.name,
    branding,
    month: win.month,
    monthLabel: win.monthLabel,
    generatedAt: nowMs,
    windowStart: win.start,
    windowEnd: win.end,
    totals: {
      totalRuns,
      passed: totPassed,
      warned: totWarned,
      failed: totFailed,
      passRate: pct(totPassed, totalRuns),
      regressionsCaught: totReg,
      activeFlows,
    },
    flows,
    availableMonths,
  }
}
