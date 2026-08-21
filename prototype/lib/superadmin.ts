// KLAVITYKLA-486 — per-workspace P&L for the OPS_ADMIN_EMAILS-gated superadmin dashboard.
//
// Reads-only. Assembles, for every account (= workspace = billing unit):
//   revenue (MRR)  −  COGS (LLM$ + storage$ + browser$ + email$)  =  margin
// plus a CAC card driven by the pre-signup marketing bucket + captured free-tool leads (#487).
//
// Revenue is per-ACCOUNT (Stripe customer/subscription live on `accounts`). COGS is tagged by
// project_id: ai_calls already carry account_id; cost_events carry project_id → projects.account_id.
// The marketing pre-signup bucket (proj_marketing_presignup) has no account and is excluded from
// per-workspace COGS — it is the CAC numerator instead.

import { db } from "./db"
import { STRIPE_PRICE_CATALOG, PLAN_DISPLAY_NAMES, normalizePlan, isEntitledSubscriptionStatus, type BillingPlan } from "./billing"
import { MARKETING_PRESIGNUP_PROJECT_ID } from "./freetool-guard"

const DAY_MS = 86_400_000

/** Monthlyized recurring revenue (USD) for one account. $0 for free/partner or a non-entitled
 *  subscription status (lapsed/canceled). Annual subs are divided by 12. Derived from the canonical
 *  STRIPE_PRICE_CATALOG (cents), never the stale growth-scorecard PLAN_MRR map. */
export function accountMonthlyMrrUsd(plan: string | null | undefined, interval: string | null | undefined, status: string | null | undefined): number {
  const p: BillingPlan = normalizePlan(plan)
  if (p === "free" || p === "partner") return 0
  if (!isEntitledSubscriptionStatus(status)) return 0
  const cat = (STRIPE_PRICE_CATALOG as any)[p]
  if (!cat) return 0
  const wantYear = interval === "year"
  const entry = (wantYear ? cat.year : cat.month) || cat.month || cat.year
  if (!entry) return 0
  const dollars = Number(entry.unitAmount) / 100
  // If we fell back to the annual entry (or the sub is annual), monthlyize.
  const usedYear = entry === cat.year
  return usedYear ? dollars / 12 : dollars
}

export type WorkspacePLRow = {
  accountId: string
  name: string
  owner: string
  plan: string           // internal slug
  planLabel: string      // display name (Solo/Team/…)
  snapOnlyOrFree: boolean // MRR is $0 (Snap-only / free / lapsed)
  mrr: number
  llmCost: number
  storageCost: number
  browserCost: number
  emailCost: number
  totalCogs: number
  margin: number
  usage: {
    sims: number
    autosimRuns: number
    autosimSteps: number
    reports: number
    recordingMinutes: number
    seats: number
  }
}

export type CacView = {
  freeToolSpend30d: number
  freeToolSpendAllTime: number
  leadsCaptured: number         // distinct lead emails (all-time)
  leadsCaptured30d: number
  convertedSignups: number      // leads whose email later became an account owner
  leadToSignupPct: number       // convertedSignups / leadsCaptured × 100
  cac: number | null            // freeToolSpendAllTime / convertedSignups (null if 0 conversions)
  cac30d: number | null         // freeToolSpend30d / convertedSignups
}

export type SuperadminPL = {
  generatedAt: number
  summary: { mrr: number; cogs: number; grossMargin: number; grossMarginPct: number; workspaces: number }
  cac: CacView
  workspaces: WorkspacePLRow[]
  rates: { s3GbMonthUsd: number; s3EgressGbUsd: number; browserMinUsd: number; emailSendUsd: number }
}

async function q(sql: string, args: any[] = []): Promise<any[]> {
  const r = await db!.execute({ sql, args })
  return r.rows as any[]
}

/** Build the full per-workspace P&L payload. */
export async function buildSuperadminPL(now: number = Date.now()): Promise<SuperadminPL> {
  const cut30 = now - 30 * DAY_MS

  // 1) Accounts (billing units)
  const accounts = await q(
    `SELECT id, name, owner_email, plan, billing_interval, billing_status, created_at FROM accounts`)

  // 2) LLM $ per account (ai_calls already resolves account_id). Exclude the marketing bucket (its
  //    account_id is null anyway) so it never lands on a workspace.
  const llmByAcct = new Map<string, number>()
  for (const r of await q(
    `SELECT account_id AS aid, COALESCE(SUM(cost_usd),0) AS cost FROM ai_calls
     WHERE account_id IS NOT NULL GROUP BY account_id`)) {
    llmByAcct.set(String(r.aid), Number(r.cost))
  }

  // 3) cost_events $ per account × kind (project_id → projects.account_id).
  const ceByAcct = new Map<string, { storage: number; browser: number; email: number }>()
  for (const r of await q(
    `SELECT p.account_id AS aid, c.kind AS kind, COALESCE(SUM(c.cost_usd),0) AS cost
     FROM cost_events c JOIN projects p ON p.id = c.project_id
     GROUP BY p.account_id, c.kind`)) {
    const aid = String(r.aid)
    const cur = ceByAcct.get(aid) || { storage: 0, browser: 0, email: 0 }
    if (r.kind === "s3_storage") cur.storage += Number(r.cost)
    else if (r.kind === "s3_egress") cur.storage += Number(r.cost)
    else if (r.kind === "browser_min") cur.browser += Number(r.cost)
    else if (r.kind === "email_send") cur.email += Number(r.cost)
    ceByAcct.set(aid, cur)
  }

  // 4) Usage counts per account.
  const countMap = async (sql: string): Promise<Map<string, number>> => {
    const m = new Map<string, number>()
    for (const r of await q(sql)) m.set(String(r.aid), Number(r.n))
    return m
  }
  const sims = await countMap(
    `SELECT p.account_id AS aid, COUNT(*) AS n FROM personas x JOIN projects p ON p.id = x.project_id GROUP BY p.account_id`)
  const runs = await countMap(
    `SELECT p.account_id AS aid, COUNT(*) AS n FROM trail_runs x JOIN projects p ON p.id = x.project_id GROUP BY p.account_id`)
  const steps = await countMap(
    `SELECT p.account_id AS aid, COUNT(*) AS n FROM run_steps x JOIN projects p ON p.id = x.project_id GROUP BY p.account_id`)
  const reports = await countMap(
    `SELECT p.account_id AS aid, COUNT(*) AS n FROM feedback x JOIN projects p ON p.id = x.project_id GROUP BY p.account_id`)
  const seats = await countMap(
    `SELECT account_id AS aid, COUNT(*) AS n FROM account_members GROUP BY account_id`)

  // Recording minutes: durationMs lives inside feedback.recordings_json (JSON array). Sum in JS over
  // the (few) rows that carry recordings.
  const recMinByAcct = new Map<string, number>()
  for (const r of await q(
    `SELECT p.account_id AS aid, x.recordings_json AS rj FROM feedback x JOIN projects p ON p.id = x.project_id
     WHERE x.recordings_json IS NOT NULL`)) {
    let ms = 0
    try { const arr = JSON.parse(String(r.rj)); if (Array.isArray(arr)) for (const c of arr) ms += Number(c?.durationMs) || 0 } catch {}
    if (ms > 0) recMinByAcct.set(String(r.aid), (recMinByAcct.get(String(r.aid)) || 0) + ms / 60000)
  }

  // 5) Assemble per-workspace rows.
  const workspaces: WorkspacePLRow[] = accounts.map((a: any) => {
    const aid = String(a.id)
    const mrr = accountMonthlyMrrUsd(a.plan, a.billing_interval, a.billing_status)
    const llmCost = llmByAcct.get(aid) || 0
    const ce = ceByAcct.get(aid) || { storage: 0, browser: 0, email: 0 }
    const totalCogs = llmCost + ce.storage + ce.browser + ce.email
    return {
      accountId: aid,
      name: String(a.name || aid),
      owner: String(a.owner_email || ""),
      plan: normalizePlan(a.plan),
      planLabel: PLAN_DISPLAY_NAMES[normalizePlan(a.plan)],
      snapOnlyOrFree: mrr <= 0,
      mrr,
      llmCost,
      storageCost: ce.storage,
      browserCost: ce.browser,
      emailCost: ce.email,
      totalCogs,
      margin: mrr - totalCogs,
      usage: {
        sims: sims.get(aid) || 0,
        autosimRuns: runs.get(aid) || 0,
        autosimSteps: steps.get(aid) || 0,
        reports: reports.get(aid) || 0,
        recordingMinutes: Math.round((recMinByAcct.get(aid) || 0) * 10) / 10,
        seats: seats.get(aid) || 0,
      },
    }
  })
  workspaces.sort((x, y) => y.margin - x.margin)

  // 6) Summary.
  const totalMrr = workspaces.reduce((s, w) => s + w.mrr, 0)
  const totalCogs = workspaces.reduce((s, w) => s + w.totalCogs, 0)
  const grossMargin = totalMrr - totalCogs
  const grossMarginPct = totalMrr > 0 ? (grossMargin / totalMrr) * 100 : 0

  // 7) CAC — the marketing pre-signup bucket ÷ leads that became accounts.
  const bucket = MARKETING_PRESIGNUP_PROJECT_ID
  const spendAll = Number((await q(
    `SELECT COALESCE(SUM(cost_usd),0) AS c FROM ai_calls WHERE project_id = ?`, [bucket]))[0]?.c || 0)
    + Number((await q(
    `SELECT COALESCE(SUM(cost_usd),0) AS c FROM cost_events WHERE project_id = ?`, [bucket]))[0]?.c || 0)
  const spend30 = Number((await q(
    `SELECT COALESCE(SUM(cost_usd),0) AS c FROM ai_calls WHERE project_id = ? AND created_at >= ?`, [bucket, cut30]))[0]?.c || 0)
    + Number((await q(
    `SELECT COALESCE(SUM(cost_usd),0) AS c FROM cost_events WHERE project_id = ? AND created_at >= ?`, [bucket, cut30]))[0]?.c || 0)

  const leadsCaptured = Number((await q(
    `SELECT COUNT(DISTINCT lower(email)) AS n FROM funnel_events WHERE event='lead_captured' AND email IS NOT NULL AND email <> ''`))[0]?.n || 0)
  const leadsCaptured30d = Number((await q(
    `SELECT COUNT(DISTINCT lower(email)) AS n FROM funnel_events WHERE event='lead_captured' AND email IS NOT NULL AND email <> '' AND created_at >= ?`, [cut30]))[0]?.n || 0)
  // Converted = distinct captured lead emails that later became an account owner.
  const convertedSignups = Number((await q(
    `SELECT COUNT(DISTINCT lower(fe.email)) AS n
     FROM funnel_events fe JOIN accounts a ON lower(a.owner_email) = lower(fe.email)
     WHERE fe.event='lead_captured' AND fe.email IS NOT NULL AND fe.email <> ''`))[0]?.n || 0)

  const cac: CacView = {
    freeToolSpend30d: spend30,
    freeToolSpendAllTime: spendAll,
    leadsCaptured,
    leadsCaptured30d,
    convertedSignups,
    leadToSignupPct: leadsCaptured > 0 ? (convertedSignups / leadsCaptured) * 100 : 0,
    cac: convertedSignups > 0 ? spendAll / convertedSignups : null,
    cac30d: convertedSignups > 0 ? spend30 / convertedSignups : null,
  }

  return {
    generatedAt: now,
    summary: { mrr: totalMrr, cogs: totalCogs, grossMargin, grossMarginPct, workspaces: workspaces.length },
    cac,
    workspaces,
    rates: {
      s3GbMonthUsd: Number(process.env.KLAV_S3_GB_MONTH_USD) || 0.023,
      s3EgressGbUsd: Number(process.env.KLAV_S3_EGRESS_GB_USD) || 0.09,
      browserMinUsd: Number(process.env.KLAV_BROWSER_MIN_USD) || 0.005,
      emailSendUsd: Number(process.env.KLAV_EMAIL_SEND_USD) || 0.0006,
    },
  }
}
