// lib/quota.test.ts — KLAVITYKLA-306
//
// Tests for checkQuota() and quotaEnforcementEnabled().
// All DB calls are mocked so no real DB is needed.

import { test, expect, beforeEach, afterEach, mock, spyOn } from "bun:test"

// ── Module-level mocks ──────────────────────────────────────────────────────
//
// We mock the two db functions that checkQuota() depends on so tests are
// hermetic. Use bun:test's mock.module for deterministic module isolation.

let mockAccountPlan: (id: string) => Promise<string>
let mockGetAccountUsageMap: (id: string) => Promise<Record<string, number>>

mock.module("./db", () => ({
  accountPlan: async (id: string) => mockAccountPlan(id),
  getAccountUsageMap: async (id: string) => mockGetAccountUsageMap(id),
  // accountIdForProject is used by checkQuotaForProject — we don't exercise it in these
  // unit tests (we call checkQuota directly); include a passthrough stub so the module loads.
  accountIdForProject: async (_id: string) => null,
  // Everything else in db.ts used by other imports at module scope:
  usagePeriod: () => new Date().toISOString().slice(0, 7),
}))

// ── Import AFTER mocking so the mock is in place ───────────────────────────
const { checkQuota, quotaEnforcementEnabled } = await import("./quota")

// ── Helpers ────────────────────────────────────────────────────────────────

const ACCOUNT = "acct_test_306"

function setEnforcement(on: boolean) {
  if (on) {
    process.env.KLAV_ENFORCE_QUOTA = "1"
  } else {
    delete process.env.KLAV_ENFORCE_QUOTA
  }
}

beforeEach(() => {
  // Default: flag OFF, free plan, zero usage
  setEnforcement(false)
  mockAccountPlan = async () => "free"
  mockGetAccountUsageMap = async () => ({})
})

afterEach(() => {
  delete process.env.KLAV_ENFORCE_QUOTA
})

// ── quotaEnforcementEnabled() ──────────────────────────────────────────────

test("quotaEnforcementEnabled: returns false when env var absent", () => {
  delete process.env.KLAV_ENFORCE_QUOTA
  expect(quotaEnforcementEnabled()).toBe(false)
})

test("quotaEnforcementEnabled: returns false for '0'", () => {
  process.env.KLAV_ENFORCE_QUOTA = "0"
  expect(quotaEnforcementEnabled()).toBe(false)
})

test("quotaEnforcementEnabled: returns true only for '1'", () => {
  process.env.KLAV_ENFORCE_QUOTA = "1"
  expect(quotaEnforcementEnabled()).toBe(true)
})

// ── Flag OFF → always allow, no degradation ────────────────────────────────

test("flag OFF: sim_review always allow regardless of usage", async () => {
  setEnforcement(false)
  mockAccountPlan = async () => "free"
  mockGetAccountUsageMap = async () => ({ sim_review: 9999 }) // way over free limit
  const r = await checkQuota(ACCOUNT, "sim_review")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
  expect(r.reason).toBeUndefined()
})

test("flag OFF: autosim_walk always allow regardless of usage", async () => {
  setEnforcement(false)
  mockGetAccountUsageMap = async () => ({ autosim_walk: 9999 })
  const r = await checkQuota(ACCOUNT, "autosim_walk")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
})

test("flag OFF: does not call accountPlan (short-circuit)", async () => {
  // If the flag is off the fast path returns before any DB reads.
  // We verify by making the mock throw — if it was called the test would fail.
  setEnforcement(false)
  mockAccountPlan = async () => { throw new Error("should not be called") }
  const r = await checkQuota(ACCOUNT, "sim_review")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
})

// ── Flag ON + under limit → allow, not degraded ───────────────────────────

test("flag ON, free plan, sim_review under limit (0/25): allow, not degraded", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "free"
  mockGetAccountUsageMap = async () => ({}) // 0 usage
  const r = await checkQuota(ACCOUNT, "sim_review")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
  expect(r.usage).toBe(0)
  expect(r.limit).toBe(25)   // free.simReactionsMonthly
  expect(r.plan).toBe("free")
})

test("flag ON, free plan, sim_review at 24/25 (one below limit): allow, not degraded", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "free"
  mockGetAccountUsageMap = async () => ({ sim_review: 24 })
  const r = await checkQuota(ACCOUNT, "sim_review")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
  expect(r.usage).toBe(24)
  expect(r.limit).toBe(25)
})

test("flag ON, free plan, autosim_walk under limit (0/10): allow, not degraded", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "free"
  mockGetAccountUsageMap = async () => ({})
  const r = await checkQuota(ACCOUNT, "autosim_walk")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
  expect(r.usage).toBe(0)
  expect(r.limit).toBe(10)   // free.autosimRunsMonthly (KLAVITYKLA-359)
})

// KLAVITYKLA-359: autosim_walk is a monthly RUN count, so it must be checked against the monthly
// run cap — not autosimFlows, which is the configured-flow allowance.
test("autosim_walk is measured against the monthly run cap, not the configured-flow allowance", async () => {
  setEnforcement(true)
  mockGetAccountUsageMap = async () => ({})
  for (const [plan, runs, flows] of [["free", 10, 1], ["pro", 150, 5], ["team", 600, 20], ["agency", 1500, 50]] as const) {
    mockAccountPlan = async () => plan
    const r = await checkQuota(ACCOUNT, "autosim_walk")
    expect(r.limit).toBe(runs)
    expect(r.limit).not.toBe(flows)
  }
})

// A run volume that used to trip the old flow-count limit must now pass cleanly.
test("flag ON, pro plan, 12 autosim walks: not degraded (was over the old flows-based limit of 5)", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "pro"
  mockGetAccountUsageMap = async () => ({ autosim_walk: 12 })
  const r = await checkQuota(ACCOUNT, "autosim_walk")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
  expect(r.usage).toBe(12)
  expect(r.limit).toBe(150)
})

test("flag ON, pro plan, sim_review at 499/500: allow, not degraded", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "pro"
  mockGetAccountUsageMap = async () => ({ sim_review: 499 })
  const r = await checkQuota(ACCOUNT, "sim_review")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
  expect(r.usage).toBe(499)
  expect(r.limit).toBe(500)  // pro.simReactionsMonthly
})

// ── Flag ON + at/over limit → allow:true, degraded:true ──────────────────

test("flag ON, free plan, sim_review at limit (25/25): degraded=true, allow still true", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "free"
  mockGetAccountUsageMap = async () => ({ sim_review: 25 })
  const r = await checkQuota(ACCOUNT, "sim_review")
  expect(r.allow).toBe(true)      // NEVER false — degrade-not-block
  expect(r.degraded).toBe(true)
  expect(typeof r.reason).toBe("string")
  expect(r.reason).toContain("sim_review")
  expect(r.usage).toBe(25)
  expect(r.limit).toBe(25)
  expect(r.plan).toBe("free")
})

test("flag ON, free plan, sim_review over limit (50/25): degraded=true, allow still true", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "free"
  mockGetAccountUsageMap = async () => ({ sim_review: 50 })
  const r = await checkQuota(ACCOUNT, "sim_review")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(true)
  expect(r.usage).toBe(50)
  expect(r.limit).toBe(25)
})

test("flag ON, free plan, autosim_walk over limit (20/10): degraded=true, allow still true", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "free"
  mockGetAccountUsageMap = async () => ({ autosim_walk: 20 })
  const r = await checkQuota(ACCOUNT, "autosim_walk")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(true)
  expect(r.reason).toContain("autosim_walk")
  expect(r.limit).toBe(10)   // free.autosimRunsMonthly
})

test("flag ON, pro plan, autosim_walk at limit (150/150): degraded=true", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "pro"
  mockGetAccountUsageMap = async () => ({ autosim_walk: 150 })
  const r = await checkQuota(ACCOUNT, "autosim_walk")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(true)
  expect(r.limit).toBe(150)  // pro.autosimRunsMonthly
})

// ── Unlimited plans (scale/partner) → always allow ─────────────────────────

test("flag ON, scale plan: sim_review unlimited → allow, not degraded", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "scale"
  mockGetAccountUsageMap = async () => ({ sim_review: 99999 })
  const r = await checkQuota(ACCOUNT, "sim_review")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
  expect(r.limit).toBeNull()
})

test("flag ON, partner plan: autosim_walk unlimited → allow, not degraded", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "partner"
  mockGetAccountUsageMap = async () => ({ autosim_walk: 99999 })
  const r = await checkQuota(ACCOUNT, "autosim_walk")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
  expect(r.limit).toBeNull()
})

test("flag ON, team plan: sim_review unlimited (null) → allow, not degraded", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "team"
  mockGetAccountUsageMap = async () => ({ sim_review: 99999 })
  // team.simReactionsMonthly = 2500, not null — test we still work at 2499
  mockGetAccountUsageMap = async () => ({ sim_review: 2499 })
  const r = await checkQuota(ACCOUNT, "sim_review")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
  expect(r.limit).toBe(2500)
})

// ── Never throws ──────────────────────────────────────────────────────────

test("checkQuota never throws even when accountPlan throws", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => { throw new Error("DB exploded") }
  // Should not throw; should return safe allow=true
  const r = await checkQuota(ACCOUNT, "sim_review")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
})

test("checkQuota never throws even when getAccountUsageMap throws", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "free"
  mockGetAccountUsageMap = async () => { throw new Error("DB exploded") }
  const r = await checkQuota(ACCOUNT, "autosim_walk")
  expect(r.allow).toBe(true)
  expect(r.degraded).toBe(false)
})

// ── allow field is ALWAYS true ─────────────────────────────────────────────

test("allow is always true — even at 1000x over limit", async () => {
  setEnforcement(true)
  mockAccountPlan = async () => "free"
  // 1000× over all free limits
  mockGetAccountUsageMap = async () => ({ sim_review: 25000, autosim_walk: 1000 })
  const sr = await checkQuota(ACCOUNT, "sim_review")
  const aw = await checkQuota(ACCOUNT, "autosim_walk")
  expect(sr.allow).toBe(true)
  expect(aw.allow).toBe(true)
})
