// lib/quota.ts — KLAVITYKLA-306
//
// checkQuota(): compare current-period usage against the account's plan limit and return a
// DEGRADE signal. NEVER throws, NEVER hard-blocks. The caller decides what (if anything) to do.
//
// CRITICAL SAFETY — SHIP DARK: the entire enforcement path is gated behind the env flag
// KLAV_ENFORCE_QUOTA. When that flag is absent or !== "1", every call returns allow=true
// with no degradation, so this code has zero runtime impact until enforcement is deliberately
// enabled after plan limits + system stability are confirmed.
//
// Wired (read-only, non-blocking) at:
//   • lib/sim-review.ts  — metric "sim_review"  (one per Sim that ran)
//   • lib/trails-runner.ts — metric "autosim_walk" (one per AutoSim/Trail walk)
//
// The PLAN_QUOTAS source-of-truth lives in lib/billing.ts (already shipped). This file maps
// the billing quota keys onto the UsageMeterMetric names so the two stay in sync.

import { normalizePlan, PLAN_QUOTAS } from "./billing"
import { accountPlan, accountIdForProject, getAccountUsageMap } from "./db"

// ─── Supported metered metrics ───────────────────────────────────────────────

// UsageMeterMetric is defined in db.ts; re-declare here for the narrowed type so callers can
// import just from this module.
export type QuotaMetric = "sim_review" | "autosim_walk"

// ─── Metric → plan quota key mapping ─────────────────────────────────────────
//
// PLAN_QUOTAS shape (from billing.ts):
//   simReactionsMonthly — monthly cap for "sim_review" events
//   autosimFlows        — monthly cap for "autosim_walk" events
//
// null means unlimited (scale/partner — also handled via planIsUnlimited branch below).

const METRIC_TO_QUOTA_KEY: Record<QuotaMetric, keyof typeof PLAN_QUOTAS[keyof typeof PLAN_QUOTAS]> = {
  sim_review:    "simReactionsMonthly",
  autosim_walk:  "autosimFlows",
}

// ─── Result type ─────────────────────────────────────────────────────────────

export type QuotaResult = {
  /** Whether the action is allowed (always true when KLAV_ENFORCE_QUOTA is off). */
  allow: boolean
  /** True only when enforcement is on AND the account has exceeded its plan limit. */
  degraded: boolean
  /** Human-readable explanation — always set when degraded, optional otherwise. */
  reason?: string
  /** Current-period usage count for the metric. */
  usage: number
  /** Plan limit for the metric (null = unlimited). */
  limit: number | null
  /** The resolved plan slug. */
  plan: string
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Returns true only when KLAV_ENFORCE_QUOTA=1 is explicitly set in the environment. */
export function quotaEnforcementEnabled(): boolean {
  return process.env.KLAV_ENFORCE_QUOTA === "1"
}

/**
 * checkQuota(accountId, metric) — soft quota signal.
 *
 * When KLAV_ENFORCE_QUOTA is off (the default, ship-dark state):
 *   → always { allow: true, degraded: false, usage, limit, plan }
 *
 * When KLAV_ENFORCE_QUOTA=1:
 *   → reads account plan + current-period usage, compares against PLAN_QUOTAS.
 *   → over limit: { allow: true, degraded: true, reason, usage, limit, plan }
 *     (allow is still true — caller decides to degrade/warn, NOT hard-block)
 *   → under limit or unlimited plan: { allow: true, degraded: false, usage, limit, plan }
 *
 * Never throws. On any unexpected error returns a safe allow=true result.
 */
export async function checkQuota(
  accountId: string,
  metric: QuotaMetric,
): Promise<QuotaResult> {
  try {
    // ── Fast path: flag off → always allow ──────────────────────────────────
    if (!quotaEnforcementEnabled()) {
      return { allow: true, degraded: false, usage: 0, limit: null, plan: "unknown" }
    }

    // ── Read plan + usage ────────────────────────────────────────────────────
    const [rawPlan, usageMap] = await Promise.all([
      accountPlan(accountId),
      getAccountUsageMap(accountId),
    ])

    const plan = normalizePlan(rawPlan)
    const quotas = PLAN_QUOTAS[plan]
    const quotaKey = METRIC_TO_QUOTA_KEY[metric]
    const limit: number | null = (quotas as any)[quotaKey] ?? null
    const usage = usageMap[metric] ?? 0

    // ── Unlimited plan (scale/partner) → always allow ────────────────────────
    if (limit === null) {
      return { allow: true, degraded: false, usage, limit: null, plan }
    }

    // ── Compare usage against limit ──────────────────────────────────────────
    if (usage >= limit) {
      return {
        allow: true,          // NEVER hard-block — always true
        degraded: true,
        reason: `${metric} quota reached: ${usage}/${limit} for plan "${plan}" this period`,
        usage,
        limit,
        plan,
      }
    }

    return { allow: true, degraded: false, usage, limit, plan }
  } catch (e: any) {
    // Safety net: any DB or unexpected error → allow through (degrade-not-block)
    console.warn("[checkQuota] error (defaulting to allow):", e?.message || e)
    return { allow: true, degraded: false, usage: 0, limit: null, plan: "unknown" }
  }
}

/**
 * checkQuotaForProject(projectId, metric) — convenience wrapper.
 *
 * Resolves the owning accountId from a projectId then delegates to checkQuota().
 * Use at call-sites (sim-review, trails-runner) that only have a projectId in scope.
 * If the project cannot be resolved the call is silently allowed (same degrade-not-block policy).
 *
 * The result is purely informational while KLAV_ENFORCE_QUOTA is off.
 */
export async function checkQuotaForProject(
  projectId: string,
  metric: QuotaMetric,
): Promise<QuotaResult> {
  try {
    const accountId = await accountIdForProject(projectId)
    if (!accountId) {
      // Unknown project — allow through (can't enforce what we can't attribute)
      return { allow: true, degraded: false, usage: 0, limit: null, plan: "unknown" }
    }
    return checkQuota(accountId, metric)
  } catch (e: any) {
    console.warn("[checkQuotaForProject] error (defaulting to allow):", e?.message || e)
    return { allow: true, degraded: false, usage: 0, limit: null, plan: "unknown" }
  }
}
