import { expect, test } from "bun:test"
import { intervalFromLookupKey, normalizeInterval, planFromLookupKey, quotasForPlan, STRIPE_PRICE_CATALOG, verifyStripeWebhook } from "./billing"

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
