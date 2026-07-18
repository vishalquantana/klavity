// lib/growth-scorecard.ts — Weekly GTM growth scorecard (KLAVITYKLA-332).
//
// Produces 8-week cohort rows for the /opsadmin Growth tab:
//   Reach → Runs → Completion% → Leads → Activation% → New Paid → MRR → D30 Retained → Best Channel
//
// Data sources:
//   funnel_events  — reach/runs/leads/activation events
//   accounts       — signup cohorts, D30 retention (billing_status='active'), utm_source
//   funnel_events  — subscription_created for new paid + channel attribution
//
// MRR is estimated from the accounts.plan column using hard-coded plan prices.
// Architecture: injectable client, pure aggregation in TypeScript (hermetic tests).

import type { Client } from "@libsql/client"

// Monthly plan value in USD. Matches klavity_pricing.md.
const PLAN_MRR: Record<string, number> = { free: 0, pro: 29, team: 99, scale: 0 }

export const SCORECARD_WEEKS = 8
const EIGHT_WEEKS_MS = SCORECARD_WEEKS * 7 * 24 * 60 * 60 * 1000
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export interface WeekRow {
  week: string           // "2026-W28"
  reach: number          // check_started events
  runs: number           // check_completed events
  completionPct: string  // "72%" or "—"
  leads: number          // distinct lead_captured actors
  activationPct: string  // "34%" or "—"
  newPaid: number        // distinct subscription_created accounts
  mrrUsd: number         // estimated MRR added (USD)
  d30RetainedPct: string // "67%" | "< 30d" | "—"
  bestChannel: string    // top source for paid conversions, or "—"
}

export interface GrowthScorecardResult {
  weeks: WeekRow[]
  since: number   // epoch ms — start of the query window
  generatedAt: number
}

/**
 * Gather 8 weeks of growth scorecard data.
 * @param c  libSQL client (shared singleton or injectable test client)
 * @param nowMs  Override Date.now() for deterministic tests
 */
export async function gatherGrowthScorecard(c: Client, nowMs?: number): Promise<GrowthScorecardResult> {
  const now = nowMs ?? Date.now()
  const since = now - EIGHT_WEEKS_MS

  // ── Query 1: Funnel events ────────────────────────────────────────────────
  // reach (check_started), runs (check_completed), leads (lead_captured distinct),
  // activated (app_connected | continuous_enabled distinct) — all per ISO week.
  const funnelR = await c.execute({
    sql: `SELECT
            strftime('%Y-W%W', created_at/1000, 'unixepoch')       AS week,
            SUM(CASE WHEN event='check_started'   THEN 1 ELSE 0 END) AS reach,
            SUM(CASE WHEN event='check_completed' THEN 1 ELSE 0 END) AS runs,
            COUNT(DISTINCT CASE WHEN event='lead_captured'
              THEN COALESCE(email, anon_id) END)                     AS leads,
            COUNT(DISTINCT CASE WHEN event IN ('app_connected','continuous_enabled')
              THEN COALESCE(email, anon_id) END)                     AS activated
          FROM funnel_events
          WHERE created_at >= ? AND created_at <= ?
            AND event IN ('check_started','check_completed','lead_captured',
                          'app_connected','continuous_enabled')
          GROUP BY week
          ORDER BY week DESC`,
    args: [since, now],
  })

  // ── Query 2: Paid subscriptions ───────────────────────────────────────────
  // One row per subscription_created event, joined to accounts for plan + channel.
  // We dedupe by account_id in TypeScript so double-fires don't inflate counts.
  const paidR = await c.execute({
    sql: `SELECT
            strftime('%Y-W%W', fe.created_at/1000, 'unixepoch')   AS week,
            fe.account_id,
            COALESCE(fe.source, a.utm_source, 'direct')           AS channel,
            COALESCE(a.plan, 'free')                              AS plan,
            COALESCE(a.billing_interval, 'month')                 AS billing_interval
          FROM funnel_events fe
          LEFT JOIN accounts a ON a.id = fe.account_id
          WHERE fe.event = 'subscription_created'
            AND fe.created_at >= ? AND fe.created_at <= ?
          ORDER BY week DESC`,
    args: [since, now],
  })

  // ── Query 3: Account signup cohorts for D30 retention ─────────────────────
  const retR = await c.execute({
    sql: `SELECT
            strftime('%Y-W%W', created_at/1000, 'unixepoch') AS week,
            MIN(created_at)                                  AS week_start_ms,
            COUNT(*)                                         AS cohort_size,
            SUM(CASE WHEN billing_status='active' THEN 1 ELSE 0 END) AS active_count
          FROM accounts
          WHERE created_at >= ? AND created_at <= ?
          GROUP BY week
          ORDER BY week DESC`,
    args: [since, now],
  })

  // ── Aggregate in TypeScript ───────────────────────────────────────────────

  // Funnel map
  const funnelMap = new Map<string, { reach: number; runs: number; leads: number; activated: number }>()
  for (const r of funnelR.rows as any[]) {
    funnelMap.set(String(r.week), {
      reach: Number(r.reach || 0),
      runs: Number(r.runs || 0),
      leads: Number(r.leads || 0),
      activated: Number(r.activated || 0),
    })
  }

  // Paid map — dedupe by account_id per week
  interface PaidWeekData { seenAccounts: Set<string>; channelCount: Map<string, number>; mrrUsd: number }
  const paidMap = new Map<string, PaidWeekData>()
  for (const r of paidR.rows as any[]) {
    const week = String(r.week)
    const accountId = String(r.account_id || "")
    if (!accountId) continue
    if (!paidMap.has(week)) paidMap.set(week, { seenAccounts: new Set(), channelCount: new Map(), mrrUsd: 0 })
    const wd = paidMap.get(week)!
    if (!wd.seenAccounts.has(accountId)) {
      wd.seenAccounts.add(accountId)
      const plan = String(r.plan || "free").toLowerCase()
      wd.mrrUsd += PLAN_MRR[plan] ?? 0
      const ch = String(r.channel || "direct")
      wd.channelCount.set(ch, (wd.channelCount.get(ch) ?? 0) + 1)
    }
  }

  // Retention map
  const retMap = new Map<string, { weekStartMs: number; cohortSize: number; activeCount: number }>()
  for (const r of retR.rows as any[]) {
    retMap.set(String(r.week), {
      weekStartMs: Number(r.week_start_ms || now),
      cohortSize: Number(r.cohort_size || 0),
      activeCount: Number(r.active_count || 0),
    })
  }

  // Union of all weeks across all queries
  const allWeeks = new Set([...funnelMap.keys(), ...paidMap.keys(), ...retMap.keys()])
  const sortedWeeks = [...allWeeks].sort().reverse()

  const weeks: WeekRow[] = sortedWeeks.map((week) => {
    const f = funnelMap.get(week) ?? { reach: 0, runs: 0, leads: 0, activated: 0 }
    const p = paidMap.get(week)
    const r = retMap.get(week)

    const newPaid = p ? p.seenAccounts.size : 0
    const mrrUsd = p ? p.mrrUsd : 0
    const bestChannel = (p && p.channelCount.size > 0)
      ? [...p.channelCount.entries()].sort((a, b) => b[1] - a[1])[0][0]
      : "—"

    const completionPct = f.reach > 0 ? `${Math.round((f.runs / f.reach) * 100)}%` : "—"
    const activationPct = f.leads > 0 ? `${Math.round((f.activated / f.leads) * 100)}%` : "—"

    let d30RetainedPct = "—"
    if (r && r.cohortSize > 0) {
      const ageMs = now - r.weekStartMs
      d30RetainedPct = ageMs >= THIRTY_DAYS_MS
        ? `${Math.round((r.activeCount / r.cohortSize) * 100)}%`
        : "< 30d"
    }

    return { week, reach: f.reach, runs: f.runs, completionPct, leads: f.leads, activationPct, newPaid, mrrUsd, d30RetainedPct, bestChannel }
  })

  return { weeks, since, generatedAt: now }
}
