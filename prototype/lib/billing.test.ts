import { expect, test } from "bun:test"
import {
  buildUsageMeters,
  intervalFromLookupKey,
  intervalFromPrice,
  intervalFromPriceId,
  normalizeInterval,
  normalizePlan,
  planFromLookupKey,
  planFromPrice,
  planFromPriceId,
  PLAN_QUOTAS,
  quotasForPlan,
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
  expect(auto.limit).toBe(5)
  expect(auto.pct).toBe(40)
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
  expect(founding.projects === null || founding.projects >= pro.projects!).toBe(true)
  expect(founding.sims === null || founding.sims >= pro.sims!).toBe(true)
})

test("founding is annual-only in the price catalog (no monthly entry) at $290/yr", () => {
  expect(STRIPE_PRICE_CATALOG.founding.year?.unitAmount).toBe(29000)
  expect(STRIPE_PRICE_CATALOG.founding.month).toBeUndefined()
})

test("PLAN_QUOTAS covers every BillingPlan value (type exhaustiveness holds at runtime too)", () => {
  const plans = ["free", "pro", "team", "founding", "scale", "partner"] as const
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
