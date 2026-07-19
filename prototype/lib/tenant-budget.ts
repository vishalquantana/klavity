// lib/tenant-budget.ts — KLAVITYKLA-314 (JTBD 8.10)
//
// Per-tenant AI budget that lives UNDER the global daily cap (OPS_DAILY_CAP_USD). Each account gets
// a daily AI budget (env default + optional per-account override). When a tenant's spend-in-window
// exceeds its budget, that tenant's AI-consuming operations are soft-blocked (402) — while every
// OTHER tenant is unaffected. This protects the shared global cap from a single runaway account.
//
// CRITICAL SAFETY — SHIP DARK: enforcement is gated behind KLAV_TENANT_BUDGET_ENFORCEMENT. When that
// flag is absent or !== "1", checkTenantBudget() ALWAYS allows (no block) and the gate is a no-op, so
// shipping this changes NO prod behaviour until enforcement is deliberately enabled (mirrors how
// KLAV_BILLING_ENFORCEMENT / KLAV_ENFORCE_QUOTA gate their enforcement paths).
//
// The window (UTC day) and spend source (ai_calls SUM cost_usd for today) intentionally match the
// global daily cap, so the per-tenant budget is a strict sub-slice of the same accounting.

import { tenantTodaySpend, getTenantBudgetOverride } from "./db"

// Default per-tenant DAILY AI budget (USD). Kept well under a typical OPS_DAILY_CAP_USD (default $50)
// so many tenants fit beneath the global cap. Overridable per-account via tenant_ai_budgets.
export const DEFAULT_TENANT_DAILY_BUDGET_USD = 5

/** Returns true only when KLAV_TENANT_BUDGET_ENFORCEMENT=1 is explicitly set. */
export function tenantBudgetEnforcementEnabled(): boolean {
  return process.env.KLAV_TENANT_BUDGET_ENFORCEMENT === "1"
}

/** The configured default daily budget (env KLAV_TENANT_DAILY_BUDGET_USD, else the constant). */
export function defaultTenantDailyBudget(): number {
  const raw = Number(process.env.KLAV_TENANT_DAILY_BUDGET_USD)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TENANT_DAILY_BUDGET_USD
}

export type TenantBudget = {
  /** Resolved daily budget for this tenant (override ?? env default). */
  budget: number
  /** Real spend already recorded for this tenant today (from ai_calls). */
  spent: number
  /** budget - spent, clamped at >= 0. */
  remaining: number
  /** True when the tenant has met or exceeded its budget for the window. */
  overBudget: boolean
}

/**
 * tenantBudgetRemaining(accountId) — how much of THIS tenant's daily AI budget is left.
 * Read-only, never throws (returns a safe "plenty remaining" result on error so a DB hiccup can
 * never accidentally hard-block a tenant). Resolution: per-account override, else the env default.
 */
export async function tenantBudgetRemaining(accountId: string): Promise<TenantBudget> {
  const budget = defaultTenantDailyBudget()
  try {
    const [override, spent] = await Promise.all([
      getTenantBudgetOverride(accountId),
      tenantTodaySpend(accountId),
    ])
    const resolved = override != null && Number.isFinite(override) && override >= 0 ? override : budget
    const remaining = Math.max(0, resolved - spent)
    return { budget: resolved, spent, remaining, overBudget: spent >= resolved }
  } catch (e: any) {
    console.warn("[tenant-budget] remaining check errored (defaulting to allow):", e?.message || e)
    return { budget, spent: 0, remaining: budget, overBudget: false }
  }
}

export type TenantBudgetCheck = TenantBudget & {
  /** Whether the AI call is allowed. Always true when enforcement is OFF. */
  allow: boolean
  /** True only when enforcement is ON and the tenant is over budget. */
  blocked: boolean
  /** Human-readable explanation — set when blocked. */
  reason?: string
}

/**
 * checkTenantBudget(accountId) — soft-block gate for the AI-call entry point.
 *   • KLAV_TENANT_BUDGET_ENFORCEMENT off (default) → always { allow: true, blocked: false }.
 *   • On + tenant over budget → { allow: false, blocked: true, reason }.
 *   • On + under budget → { allow: true, blocked: false }.
 * Never throws.
 */
export async function checkTenantBudget(accountId: string): Promise<TenantBudgetCheck> {
  const r = await tenantBudgetRemaining(accountId)
  if (!tenantBudgetEnforcementEnabled() || !accountId) {
    return { ...r, allow: true, blocked: false }
  }
  if (r.remaining <= 0) {
    return {
      ...r,
      allow: false,
      blocked: true,
      reason: `AI budget reached for this account ($${r.budget.toFixed(2)}/day, spent $${r.spent.toFixed(4)}). ` +
        `Try again tomorrow or raise the budget.`,
    }
  }
  return { ...r, allow: true, blocked: false }
}

/** Marker error thrown by the AI-call gate when a tenant is over budget (HTTP 402 semantics). */
export class TenantBudgetExceededError extends Error {
  status = 402
  code = "TENANT_BUDGET_EXCEEDED"
  constructor(message: string) {
    super(message)
    this.name = "TenantBudgetExceededError"
  }
}
