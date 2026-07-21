// lib/quota-meter-agreement.test.ts — KLAVITYKLA-309 follow-up
//
// CROSS-MODULE REGRESSION: the customer-facing usage meter (buildUsageMeters in lib/billing.ts)
// and the enforcement path (checkQuota in lib/quota.ts) must agree on WHEN an account is over its
// allowance. They drifted once: the meter flagged only `used > limit` while checkQuota degraded at
// `usage >= limit`, so an account sitting exactly AT its limit saw a calm meter while enforcement
// was already degrading it.
//
// These tests drive BOTH modules over the same plan/usage matrix and assert meter.overLimit ===
// quota.degraded for every case, plus that the metric → PLAN_QUOTAS mapping is literally one
// shared object rather than two copies.

import { test, expect, afterEach, mock } from "bun:test"

let mockAccountPlan: (id: string) => Promise<string>
let mockGetAccountUsageMap: (id: string) => Promise<Record<string, number>>

mock.module("./db", () => ({
  accountPlan: async (id: string) => mockAccountPlan(id),
  getAccountUsageMap: async (id: string) => mockGetAccountUsageMap(id),
  accountIdForProject: async (_id: string) => null,
  usagePeriod: () => new Date().toISOString().slice(0, 7),
}))

const { checkQuota, METRIC_TO_QUOTA_KEY: QUOTA_MAP } = await import("./quota")
import type { QuotaMetric } from "./billing"
const { buildUsageMeters, METRIC_TO_QUOTA_KEY: BILLING_MAP, PLAN_QUOTAS } = await import("./billing")

const ACCOUNT = "acct_meter_agreement"

afterEach(() => {
  delete process.env.KLAV_ENFORCE_QUOTA
})

// ── Single source of truth for the metric → quota key mapping ───────────────────────────────────

test("quota.ts re-exports billing.ts's METRIC_TO_QUOTA_KEY (no duplicated mapping)", () => {
  // Identity, not deep-equality: two separate object literals would silently drift.
  expect(QUOTA_MAP).toBe(BILLING_MAP)
  expect(BILLING_MAP).toEqual({ sim_review: "simReactionsMonthly", autosim_walk: "autosimFlows" })
})

test("buildUsageMeters reads each metric's limit through the shared mapping", () => {
  for (const plan of Object.keys(PLAN_QUOTAS)) {
    const meters = buildUsageMeters(plan, {})
    for (const m of meters) {
      const expected = (PLAN_QUOTAS as any)[plan][BILLING_MAP[m.metric]] ?? null
      expect(m.limit).toBe(expected)
    }
  }
})

// ── Threshold agreement across every plan × metric × boundary ───────────────────────────────────

test("meter overLimit agrees with checkQuota degraded at, below and above the limit", async () => {
  process.env.KLAV_ENFORCE_QUOTA = "1"
  const metrics: QuotaMetric[] = ["sim_review", "autosim_walk"]

  for (const plan of Object.keys(PLAN_QUOTAS)) {
    for (const metric of metrics) {
      const limit: number | null = (PLAN_QUOTAS as any)[plan][BILLING_MAP[metric]] ?? null
      // Unlimited plans still need a probe; everything else gets under / exactly-at / over.
      const samples = limit == null ? [0, 9999] : [Math.max(0, limit - 1), limit, limit + 1]

      for (const used of samples) {
        mockAccountPlan = async () => plan
        mockGetAccountUsageMap = async () => ({ [metric]: used })

        const enforced = await checkQuota(ACCOUNT, metric)
        const meter = buildUsageMeters(plan, { [metric]: used }).find((m) => m.metric === metric)!

        expect(`${plan}/${metric}/${used} meter=${meter.overLimit}`)
          .toBe(`${plan}/${metric}/${used} meter=${enforced.degraded}`)
        expect(meter.limit).toBe(enforced.limit)
      }
    }
  }
})

test("an account exactly AT its limit is flagged by BOTH the meter and enforcement", async () => {
  process.env.KLAV_ENFORCE_QUOTA = "1"
  // Free plan: 25 sim reviews/month. 25 used == the cap.
  mockAccountPlan = async () => "free"
  mockGetAccountUsageMap = async () => ({ sim_review: 25 })

  const enforced = await checkQuota(ACCOUNT, "sim_review")
  expect(enforced.degraded).toBe(true)

  const meter = buildUsageMeters("free", { sim_review: 25 }).find((m) => m.key === "sims")!
  expect(meter.used).toBe(25)
  expect(meter.limit).toBe(25)
  expect(meter.pct).toBe(100)
  expect(meter.overLimit).toBe(true) // was false before the fix — the drift this test pins down
})

test("one under the limit stays calm in both modules", async () => {
  process.env.KLAV_ENFORCE_QUOTA = "1"
  mockAccountPlan = async () => "free"
  mockGetAccountUsageMap = async () => ({ sim_review: 24 })

  expect((await checkQuota(ACCOUNT, "sim_review")).degraded).toBe(false)
  expect(buildUsageMeters("free", { sim_review: 24 }).find((m) => m.key === "sims")!.overLimit).toBe(false)
})
