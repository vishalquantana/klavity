import { expect, test } from "bun:test"
import {
  buildAgencyClientReport,
  buildProjectUsage,
  buildUsageMeters,
  isAgencyEntitled,
  intervalFromLookupKey,
  intervalFromPrice,
  intervalFromPriceId,
  normalizeInterval,
  normalizePlan,
  planFromLookupKey,
  planFromPrice,
  planFromPriceId,
  PLAN_QUOTAS,
  PAST_DUE_GRACE_DAYS,
  quotasForPlan,
  resolveBillingGrace,
  STRIPE_PRICE_CATALOG,
  STRIPE_PRICE_IDS,
  verifyStripeWebhook,
} from "./billing"

async function stripeSig(raw: string, secret: string, ts = Math.floor(Date.now() / 1000)): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ts}.${raw}`)))
  const hex = Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("")
  return `t=${ts},v1=${hex}`
}

test("Stripe catalog encodes Pro/Team monthly and two-months-free annual prices", () => {
  expect(STRIPE_PRICE_CATALOG.pro.month.unitAmount).toBe(2900)
  expect(STRIPE_PRICE_CATALOG.pro.year.unitAmount).toBe(29000)
  expect(STRIPE_PRICE_CATALOG.team.month.unitAmount).toBe(9900)
  expect(STRIPE_PRICE_CATALOG.team.year.unitAmount).toBe(99000)
  expect(planFromLookupKey(STRIPE_PRICE_CATALOG.team.year.lookupKey)).toBe("team")
  expect(intervalFromLookupKey(STRIPE_PRICE_CATALOG.pro.year.lookupKey)).toBe("year")
})

test("billing quotas are dark by default unless the enforcement flag is enabled", () => {
  const prev = process.env.KLAV_BILLING_ENFORCEMENT
  delete process.env.KLAV_BILLING_ENFORCEMENT
  expect(quotasForPlan("free").enforcement).toBe(false)
  process.env.KLAV_BILLING_ENFORCEMENT = "1"
  expect(quotasForPlan("pro").enforcement).toBe(true)
  expect(quotasForPlan("team").quotas.autosimFlows).toBe(20)
  if (prev == null) delete process.env.KLAV_BILLING_ENFORCEMENT
  else process.env.KLAV_BILLING_ENFORCEMENT = prev
})

// ── KLAVITYKLA-309: customer-facing usage meters ────────────────────────────────────────────────

test("buildUsageMeters maps current-period usage onto the plan's Sim/AutoSim allowance", () => {
  const meters = buildUsageMeters("pro", { sim_review: 125, autosim_walk: 2 })
  const sims = meters.find((m) => m.key === "sims")!
  const auto = meters.find((m) => m.key === "autosim")!
  // Pro: 500 Sim reviews/mo, 5 AutoSim flows.
  expect(sims.used).toBe(125)
  expect(sims.limit).toBe(500)
  expect(sims.pct).toBe(25)
  expect(sims.unlimited).toBe(false)
  expect(sims.overLimit).toBe(false)
  expect(auto.used).toBe(2)
  // KLAVITYKLA-359: AutoSim runs are metered against the MONTHLY RUN cap (pro: 150), not the
  // configured-flow allowance (pro: 5).
  expect(auto.limit).toBe(150)
  expect(auto.pct).toBe(1)
})

// ── KLAVITYKLA-359: dedicated monthly AutoSim-run quota ─────────────────────────────────────────

test("PLAN_QUOTAS carries a monthly AutoSim-run cap distinct from the configured-flow allowance", () => {
  const plans = ["free", "pro", "team", "agency", "founding", "scale", "partner"] as const
  for (const plan of plans) {
    const q = PLAN_QUOTAS[plan]
    expect(q).toHaveProperty("autosimRunsMonthly")
    // Unlimited tiers are null on BOTH keys; metered tiers must allow more runs than they allow
    // configured flows (each flow is expected to run many times a month).
    if (q.autosimFlows == null) expect(q.autosimRunsMonthly).toBeNull()
    else expect(q.autosimRunsMonthly!).toBeGreaterThan(q.autosimFlows)
  }
})

test("monthly AutoSim-run caps increase monotonically up the plan ladder", () => {
  const { free, pro, founding, team, agency, scale, partner } = PLAN_QUOTAS
  expect(free.autosimRunsMonthly).toBe(10)
  expect(pro.autosimRunsMonthly).toBe(150)
  expect(founding.autosimRunsMonthly!).toBeGreaterThanOrEqual(pro.autosimRunsMonthly!)
  expect(team.autosimRunsMonthly!).toBeGreaterThan(pro.autosimRunsMonthly!)
  expect(agency.autosimRunsMonthly!).toBeGreaterThan(team.autosimRunsMonthly!)
  expect(scale.autosimRunsMonthly).toBeNull()
  expect(partner.autosimRunsMonthly).toBeNull()
})

test("the AutoSim meter compares monthly runs against the monthly run cap, not the flow count", () => {
  // The KLAVITYKLA-309 bug: 12 runs on Free rendered as "12 / 1" (runs vs configured flows).
  const auto = buildUsageMeters("free", { autosim_walk: 12 }).find((m) => m.key === "autosim")!
  expect(auto.limit).toBe(PLAN_QUOTAS.free.autosimRunsMonthly)
  expect(auto.limit).not.toBe(PLAN_QUOTAS.free.autosimFlows)
  expect(auto.used).toBe(12)
  expect(auto.overLimit).toBe(true) // 12 > 10 — still over, but now against a like-for-like cap
  expect(auto.pct).toBe(100)
})

test("the AutoSim meter stays well under 100% for ordinary run volumes on paid plans", () => {
  const auto = buildUsageMeters("team", { autosim_walk: 60 }).find((m) => m.key === "autosim")!
  expect(auto.limit).toBe(600)
  expect(auto.pct).toBe(10)
  expect(auto.overLimit).toBe(false)
})

test("buildUsageMeters clamps to 100% and flags over-limit usage", () => {
  const sims = buildUsageMeters("free", { sim_review: 40 }).find((m) => m.key === "sims")!
  // Free: 25 Sim reviews/mo — 40 used is over the cap.
  expect(sims.pct).toBe(100)
  expect(sims.overLimit).toBe(true)
})

test("buildUsageMeters reports unlimited plans without a bar percentage", () => {
  const meters = buildUsageMeters("scale", { sim_review: 9999, autosim_walk: 9999 })
  for (const m of meters) {
    expect(m.limit).toBeNull()
    expect(m.unlimited).toBe(true)
    expect(m.pct).toBe(0)
    expect(m.overLimit).toBe(false)
  }
})

test("buildUsageMeters defaults missing/garbage metric counts to zero", () => {
  const meters = buildUsageMeters("pro", { sim_review: NaN as any })
  const sims = meters.find((m) => m.key === "sims")!
  const auto = meters.find((m) => m.key === "autosim")!
  expect(sims.used).toBe(0)
  expect(sims.pct).toBe(0)
  expect(auto.used).toBe(0)
})

test("buildUsageMeters normalizes unknown plan strings to Free limits", () => {
  const sims = buildUsageMeters("mystery" as any, { sim_review: 10 }).find((m) => m.key === "sims")!
  expect(sims.limit).toBe(25)
})

// ── KLAVITYKLA-276: per-project usage + cost breakdown ──────────────────────────────────────────
test("buildProjectUsage merges usage + spend rows into one row per project", () => {
  const rows = buildProjectUsage(
    [
      { projectId: "p1", name: "Alpha", metric: "sim_review", count: 12 },
      { projectId: "p1", name: "Alpha", metric: "autosim_walk", count: 3 },
      { projectId: "p2", name: "Beta", metric: "sim_review", count: 2 },
    ],
    [
      { projectId: "p1", cost: 0.42 },
      { projectId: "p2", cost: 0.05 },
    ],
  )
  const p1 = rows.find((r) => r.projectId === "p1")!
  const p2 = rows.find((r) => r.projectId === "p2")!
  expect(p1.name).toBe("Alpha")
  expect(p1.simReviews).toBe(12)
  expect(p1.autosimWalks).toBe(3)
  expect(p1.costToday).toBeCloseTo(0.42)
  expect(p2.simReviews).toBe(2)
  expect(p2.autosimWalks).toBe(0)
  expect(p2.costToday).toBeCloseTo(0.05)
})

test("buildProjectUsage sorts busiest (most metered activity) project first, then cost", () => {
  const rows = buildProjectUsage(
    [
      { projectId: "quiet", name: "Quiet", metric: "sim_review", count: 1 },
      { projectId: "busy", name: "Busy", metric: "sim_review", count: 40 },
    ],
    [{ projectId: "quiet", cost: 9 }],
  )
  expect(rows[0].projectId).toBe("busy")
})

test("buildProjectUsage labels unattributed ('' project) and cost-only projects", () => {
  const rows = buildProjectUsage(
    [{ projectId: "", name: null, metric: "autosim_walk", count: 4 }],
    [{ projectId: "orphan", cost: 0.1 }],
  )
  const unattributed = rows.find((r) => r.projectId === "")!
  expect(unattributed.name).toBe("Unattributed")
  expect(unattributed.autosimWalks).toBe(4)
  // a project that only appears in spend rows (no usage) still shows up, named by its id
  const orphan = rows.find((r) => r.projectId === "orphan")!
  expect(orphan.name).toBe("orphan")
  expect(orphan.costToday).toBeCloseTo(0.1)
  expect(orphan.simReviews).toBe(0)
})

test("buildProjectUsage ignores garbage counts/costs and fills a name from a later row", () => {
  const rows = buildProjectUsage(
    [
      { projectId: "p1", name: null, metric: "sim_review", count: NaN as any },
      { projectId: "p1", name: "RealName", metric: "autosim_walk", count: -5 },
    ],
    [{ projectId: "p1", cost: NaN as any }],
  )
  const p1 = rows[0]
  expect(p1.name).toBe("RealName")
  expect(p1.simReviews).toBe(0)
  expect(p1.autosimWalks).toBe(0)
  expect(p1.costToday).toBe(0)
})

test("buildProjectUsage tolerates empty inputs", () => {
  expect(buildProjectUsage()).toEqual([])
  expect(buildProjectUsage([], [])).toEqual([])
})

// ── KLAVITYKLA-336: live price-ID resolver ──────────────────────────────────────────────────────

test("every live Stripe price ID resolves to the right {plan, interval}", () => {
  const expectations: Array<[string, "founding" | "pro" | "team", "month" | "year"]> = [
    ["price_1TuhSqDWQd30h1DiyqjXQ3NC", "founding", "year"],
    ["price_1TuhSrDWQd30h1DivfC0EMKT", "pro", "month"],
    ["price_1TuhSrDWQd30h1DiTy9eSe5p", "pro", "year"],
    ["price_1TuhSsDWQd30h1DiU5g7VDZo", "team", "month"],
    ["price_1TuhStDWQd30h1DiRzJCtPsF", "team", "year"],
  ]
  for (const [id, plan, interval] of expectations) {
    expect(planFromPriceId(id)).toBe(plan)
    expect(intervalFromPriceId(id)).toBe(interval)
    expect(STRIPE_PRICE_IDS[id]).toEqual({ plan, interval })
  }
})

test("unknown or missing price IDs resolve to null, not a throw", () => {
  expect(planFromPriceId("price_does_not_exist")).toBeNull()
  expect(intervalFromPriceId("price_does_not_exist")).toBeNull()
  expect(planFromPriceId(null)).toBeNull()
  expect(planFromPriceId(undefined)).toBeNull()
  expect(planFromPriceId("")).toBeNull()
})

test("planFromPrice/intervalFromPrice try the live price ID first, then fall back to lookup_key", () => {
  // Live price ID takes priority even if a (bogus) lookup_key is also present.
  expect(planFromPrice({ id: "price_1TuhSsDWQd30h1DiU5g7VDZo", lookup_key: "totally_unrelated" })).toBe("team")
  expect(intervalFromPrice({ id: "price_1TuhSsDWQd30h1DiU5g7VDZo", lookup_key: "totally_unrelated" })).toBe("month")

  // No matching price ID → falls back to lookup_key (the Stripe-test-mode / self-serve catalog path).
  expect(planFromPrice({ id: "price_unrecognized", lookup_key: STRIPE_PRICE_CATALOG.team.year!.lookupKey })).toBe("team")
  expect(intervalFromPrice({ id: "price_unrecognized", lookup_key: STRIPE_PRICE_CATALOG.team.year!.lookupKey })).toBe("year")

  // No price ID or lookup_key match → falls back to Stripe's own recurring.interval, plan stays null.
  expect(planFromPrice({ id: "price_unrecognized", lookup_key: null })).toBeNull()
  expect(intervalFromPrice({ id: "price_unrecognized", lookup_key: null, recurring: { interval: "year" } })).toBe("year")

  // Fully empty price → null, no throw.
  expect(planFromPrice(null)).toBeNull()
  expect(intervalFromPrice(undefined)).toBeNull()
})

// ── KLAVITYKLA-336: Founding Team tier ──────────────────────────────────────────────────────────

test("founding tier normalizes correctly and carries at-or-above-Pro quotas", () => {
  expect(normalizePlan("founding")).toBe("founding")
  expect(normalizePlan("not-a-real-plan")).toBe("free")

  const founding = quotasForPlan("founding").quotas
  const pro = PLAN_QUOTAS.pro
  expect(quotasForPlan("founding").plan).toBe("founding")
  expect(founding.simReactionsMonthly).toBeGreaterThanOrEqual(pro.simReactionsMonthly!)
  expect(founding.autosimFlows).toBeGreaterThanOrEqual(pro.autosimFlows!)
  expect(founding.autosimRunsMonthly).toBeGreaterThanOrEqual(pro.autosimRunsMonthly!)
  expect(founding.projects === null || founding.projects >= pro.projects!).toBe(true)
  expect(founding.sims === null || founding.sims >= pro.sims!).toBe(true)
})

test("founding is annual-only in the price catalog (no monthly entry) at $290/yr", () => {
  expect(STRIPE_PRICE_CATALOG.founding.year?.unitAmount).toBe(29000)
  expect(STRIPE_PRICE_CATALOG.founding.month).toBeUndefined()
})

test("PLAN_QUOTAS covers every BillingPlan value (type exhaustiveness holds at runtime too)", () => {
  const plans = ["free", "pro", "team", "agency", "founding", "scale", "partner"] as const
  for (const plan of plans) {
    expect(PLAN_QUOTAS[plan]).toBeDefined()
  }
})

test("Founding/Pro/Team catalog amounts stay correct", () => {
  expect(STRIPE_PRICE_CATALOG.founding.year?.unitAmount).toBe(29000)
  expect(STRIPE_PRICE_CATALOG.pro.month?.unitAmount).toBe(2900)
  expect(STRIPE_PRICE_CATALOG.pro.year?.unitAmount).toBe(29000)
  expect(STRIPE_PRICE_CATALOG.team.month?.unitAmount).toBe(9900)
  expect(STRIPE_PRICE_CATALOG.team.year?.unitAmount).toBe(99000)
})

// ── KLAVITYKLA-310: Agency tier + per-client usage & outcomes rollup ────────────────────────────

test("agency tier normalizes and carries unlimited projects at-or-above Team allowances", () => {
  expect(normalizePlan("agency")).toBe("agency")
  const agency = PLAN_QUOTAS.agency, team = PLAN_QUOTAS.team
  expect(agency.projects).toBeNull() // unlimited client sites
  expect(agency.sims!).toBeGreaterThanOrEqual(team.sims!)
  expect(agency.simReactionsMonthly!).toBeGreaterThanOrEqual(team.simReactionsMonthly!)
  expect(agency.autosimFlows!).toBeGreaterThanOrEqual(team.autosimFlows!)
  expect(agency.autosimRunsMonthly!).toBeGreaterThanOrEqual(team.autosimRunsMonthly!)
})

test("agency price catalog encodes monthly + two-months-free annual", () => {
  expect(STRIPE_PRICE_CATALOG.agency.month?.unitAmount).toBe(24900)
  expect(STRIPE_PRICE_CATALOG.agency.year?.unitAmount).toBe(249000)
  expect(STRIPE_PRICE_CATALOG.agency.year!.unitAmount).toBe(STRIPE_PRICE_CATALOG.agency.month!.unitAmount * 10)
})

test("isAgencyEntitled gates on agency/scale/partner or an unlimited flag", () => {
  expect(isAgencyEntitled("agency")).toBe(true)
  expect(isAgencyEntitled("scale")).toBe(true)
  expect(isAgencyEntitled("partner")).toBe(true)
  expect(isAgencyEntitled("free")).toBe(false)
  expect(isAgencyEntitled("pro")).toBe(false)
  expect(isAgencyEntitled("team")).toBe(false)
  expect(isAgencyEntitled("free", true)).toBe(true) // unlimited override
  expect(isAgencyEntitled(null)).toBe(false)
})

test("buildAgencyClientReport merges usage + outcomes into one row per client", () => {
  const rows = buildAgencyClientReport(
    [{ projectId: "p1", name: "Acme" }, { projectId: "p2", name: "Beta" }],
    [
      { projectId: "p1", metric: "sim_review", count: 4 },
      { projectId: "p1", metric: "autosim_walk", count: 2 },
      { projectId: "p2", metric: "sim_review", count: 1 },
    ],
    [
      { projectId: "p1", reportsFound: 7, regressionsCaught: 3, guardedGreen: 8, guardedAmber: 1, guardedRed: 1, guardedTotal: 10 },
      { projectId: "p2", reportsFound: 0, regressionsCaught: 0, guardedGreen: 0, guardedAmber: 0, guardedRed: 0, guardedTotal: 0 },
    ],
  )
  const p1 = rows.find((r) => r.projectId === "p1")!
  expect(p1.name).toBe("Acme")
  expect(p1.simReviews).toBe(4)
  expect(p1.autosimWalks).toBe(2)
  expect(p1.reportsFound).toBe(7)
  expect(p1.regressionsCaught).toBe(3)
  expect(p1.guardedRuns).toBe(10)
  expect(p1.guardedPassRate).toBeCloseTo(0.8)
  const p2 = rows.find((r) => r.projectId === "p2")!
  expect(p2.guardedRuns).toBe(0)
  expect(p2.guardedPassRate).toBeNull() // no guarded runs → null, not 0
})

test("buildAgencyClientReport sorts most-outcomes-first, then usage, then name", () => {
  const rows = buildAgencyClientReport(
    [{ projectId: "a", name: "A" }, { projectId: "b", name: "B" }, { projectId: "c", name: "C" }],
    [{ projectId: "b", metric: "sim_review", count: 9 }],
    [
      { projectId: "a", reportsFound: 5, regressionsCaught: 0, guardedGreen: 0, guardedAmber: 0, guardedRed: 0, guardedTotal: 0 },
      { projectId: "b", reportsFound: 0, regressionsCaught: 0, guardedGreen: 0, guardedAmber: 0, guardedRed: 0, guardedTotal: 0 },
      { projectId: "c", reportsFound: 0, regressionsCaught: 0, guardedGreen: 0, guardedAmber: 0, guardedRed: 0, guardedTotal: 0 },
    ],
  )
  // 'a' leads (most outcomes), then 'b' (has usage), then 'c' (nothing).
  expect(rows.map((r) => r.projectId)).toEqual(["a", "b", "c"])
})

test("buildAgencyClientReport falls back to green+amber+red when guardedTotal is missing", () => {
  const rows = buildAgencyClientReport(
    [{ projectId: "p", name: "P" }],
    [],
    [{ projectId: "p", reportsFound: 0, regressionsCaught: 0, guardedGreen: 3, guardedAmber: 0, guardedRed: 1, guardedTotal: 0 }],
  )
  expect(rows[0].guardedRuns).toBe(4)
  expect(rows[0].guardedPassRate).toBeCloseTo(0.75)
})

test("buildAgencyClientReport tolerates empty inputs and garbage counts", () => {
  expect(buildAgencyClientReport()).toEqual([])
  const rows = buildAgencyClientReport(
    [{ projectId: "p", name: null }],
    [{ projectId: "p", metric: "sim_review", count: -5 as any }],
    [{ projectId: "p", reportsFound: NaN as any, regressionsCaught: -1 as any, guardedGreen: 0, guardedAmber: 0, guardedRed: 0, guardedTotal: 0 }],
  )
  expect(rows[0].simReviews).toBe(0)
  expect(rows[0].reportsFound).toBe(0)
  expect(rows[0].regressionsCaught).toBe(0)
  expect(rows[0].name).toBe("p") // falls back to id when name is null
})

test("normalizes Stripe intervals and verifies signed webhook payloads", async () => {
  expect(normalizeInterval("annual")).toBe("year")
  const raw = JSON.stringify({ id: "evt_1", type: "customer.subscription.updated", data: { object: { id: "sub_1" } } })
  const header = await stripeSig(raw, "whsec_test")
  const event = await verifyStripeWebhook(raw, header, "whsec_test")
  expect(event.type).toBe("customer.subscription.updated")
  await expect(verifyStripeWebhook(raw, header.replace(/.$/, "0"), "whsec_test")).rejects.toThrow()
  const oldHeader = await stripeSig(raw, "whsec_test", Math.floor(Date.now() / 1000) - 10_000)
  await expect(verifyStripeWebhook(raw, oldHeader, "whsec_test")).rejects.toThrow()
})

// ── KLAVITYKLA-313: past_due grace-degrade ───────────────────────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000

test("resolveBillingGrace: non-past_due statuses never restrict", () => {
  for (const s of [null, undefined, "active", "canceled", "checkout_completed", "unpaid"]) {
    const g = resolveBillingGrace(s as any, Date.now())
    expect(g.pastDue).toBe(false)
    expect(g.inGrace).toBe(false)
    expect(g.graceExpired).toBe(false)
    expect(g.restrictPremium).toBe(false)
    expect(g.daysRemaining).toBe(0)
    expect(g.graceEndsAt).toBeNull()
  }
})

test("resolveBillingGrace: past_due within window stays in grace with no restriction", () => {
  const now = 1_000_000_000_000
  const since = now - 2 * DAY // 2 days into a 7-day window
  const g = resolveBillingGrace("past_due", since, now)
  expect(g.pastDue).toBe(true)
  expect(g.inGrace).toBe(true)
  expect(g.graceExpired).toBe(false)
  expect(g.restrictPremium).toBe(false)
  expect(g.daysRemaining).toBe(5) // 7 - 2
  expect(g.graceEndsAt).toBe(since + PAST_DUE_GRACE_DAYS * DAY)
})

test("resolveBillingGrace: past_due after the window expires and restricts premium", () => {
  const now = 1_000_000_000_000
  const since = now - (PAST_DUE_GRACE_DAYS + 1) * DAY
  const g = resolveBillingGrace("past_due", since, now)
  expect(g.pastDue).toBe(true)
  expect(g.inGrace).toBe(false)
  expect(g.graceExpired).toBe(true)
  expect(g.restrictPremium).toBe(true)
  expect(g.daysRemaining).toBe(0)
})

test("resolveBillingGrace: boundary — exactly at grace end is expired (msLeft <= 0)", () => {
  const now = 1_000_000_000_000
  const since = now - PAST_DUE_GRACE_DAYS * DAY // window ends exactly now
  const g = resolveBillingGrace("past_due", since, now)
  expect(g.inGrace).toBe(false)
  expect(g.restrictPremium).toBe(true)
})

test("resolveBillingGrace: missing/zero anchor grants a full grace window (never instant-expire)", () => {
  const now = 1_000_000_000_000
  for (const bad of [null, undefined, 0, -5, NaN]) {
    const g = resolveBillingGrace("past_due", bad as any, now)
    expect(g.inGrace).toBe(true)
    expect(g.restrictPremium).toBe(false)
    expect(g.daysRemaining).toBe(PAST_DUE_GRACE_DAYS)
    expect(g.graceEndsAt).toBe(now + PAST_DUE_GRACE_DAYS * DAY)
  }
})

test("resolveBillingGrace: custom graceDays honored; invalid falls back to default", () => {
  const now = 1_000_000_000_000
  const since = now - 1 * DAY
  expect(resolveBillingGrace("past_due", since, now, 3).daysRemaining).toBe(2)
  // invalid graceDays → default window
  expect(resolveBillingGrace("past_due", now, now, 0).daysRemaining).toBe(PAST_DUE_GRACE_DAYS)
  expect(resolveBillingGrace("past_due", now, now, -1).daysRemaining).toBe(PAST_DUE_GRACE_DAYS)
})
