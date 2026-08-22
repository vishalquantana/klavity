import { test, expect, afterEach } from "bun:test"
import { buildGa4PurchasePayload, sendGa4Purchase, syntheticClientId, purchaseMirrorFromSession, GA4_MEASUREMENT_ID } from "./ga4-mp"

const catalog = (plan: string, interval: string) =>
  ({ team: { month: 24900, year: 249000 }, pro: { month: 4900 }, founding: { month: 29900 } } as any)?.[plan]?.[interval]

afterEach(() => {
  delete process.env.KLAV_GA4_API_SECRET
  // @ts-expect-error restore global fetch if a test replaced it
  if (globalThis.__origFetch) { globalThis.fetch = globalThis.__origFetch; delete globalThis.__origFetch }
})

test("buildGa4PurchasePayload builds the correct MP purchase shape", () => {
  const p = buildGa4PurchasePayload({
    clientId: "123.456",
    transactionId: "sub_ABC",
    valueCents: 24900,
    currency: "usd",
    plan: "team",
    interval: "month",
  })
  expect(p).toEqual({
    client_id: "123.456",
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: "sub_ABC",
          value: 249,
          currency: "usd",
          items: [{ item_id: "team", item_name: "team", price: 249 }],
        },
      },
    ],
  })
})

test("value converts cents to a 2dp major-unit amount", () => {
  const p = buildGa4PurchasePayload({ clientId: "c", transactionId: "t", valueCents: 4900, currency: "usd", plan: "pro" })
  expect(p.events[0].params.value).toBe(49)
  expect(p.events[0].params.items[0].price).toBe(49)
})

test("syntheticClientId is deterministic + GA-shaped (digits.digits)", () => {
  const a = syntheticClientId("cus_123")
  const b = syntheticClientId("cus_123")
  const c = syntheticClientId("cus_999")
  expect(a).toBe(b)
  expect(a).not.toBe(c)
  expect(a).toMatch(/^\d+\.\d+$/)
})

test("sendGa4Purchase NO-OPs without KLAV_GA4_API_SECRET (no fetch)", async () => {
  delete process.env.KLAV_GA4_API_SECRET
  let called = false
  // @ts-expect-error stash
  globalThis.__origFetch = globalThis.fetch
  globalThis.fetch = (async () => { called = true; return new Response("{}") }) as any
  await sendGa4Purchase({ clientId: "c", transactionId: "t", valueCents: 100, currency: "usd", plan: "pro" })
  expect(called).toBe(false)
})

test("sendGa4Purchase POSTs to MP with measurement_id + api_secret when secret set", async () => {
  process.env.KLAV_GA4_API_SECRET = "secret123"
  let seenUrl = ""
  let seenBody: any = null
  // @ts-expect-error stash
  globalThis.__origFetch = globalThis.fetch
  globalThis.fetch = (async (u: string, init: any) => {
    seenUrl = String(u); seenBody = JSON.parse(init.body)
    return new Response("{}")
  }) as any
  await sendGa4Purchase({ clientId: "c", transactionId: "sub_1", valueCents: 29900, currency: "usd", plan: "founding" })
  expect(seenUrl).toContain(`measurement_id=${GA4_MEASUREMENT_ID}`)
  expect(seenUrl).toContain("api_secret=secret123")
  expect(seenBody.events[0].name).toBe("purchase")
  expect(seenBody.events[0].params.transaction_id).toBe("sub_1")
  expect(seenBody.events[0].params.value).toBe(299)
})

test("purchaseMirrorFromSession: uses amount_total + subscription id + customer-derived clientId", () => {
  const m = purchaseMirrorFromSession(
    { amount_total: 24900, currency: "usd", subscription: "sub_LIVE", id: "cs_1", customer: "cus_9", metadata: { plan: "team", interval: "month" } },
    "acct_x",
    catalog,
  )
  expect(m).not.toBeNull()
  expect(m!.transactionId).toBe("sub_LIVE") // stable → GA4 dedupe with the client
  expect(m!.valueCents).toBe(24900)
  expect(m!.currency).toBe("usd")
  expect(m!.plan).toBe("team")
  expect(m!.interval).toBe("month")
  expect(m!.clientId).toBe(syntheticClientId("cus_9"))
})

test("purchaseMirrorFromSession: falls back to catalog unit_amount + session id + account id", () => {
  const m = purchaseMirrorFromSession(
    { amount_total: null, currency: null, subscription: null, id: "cs_ABC", customer: null, metadata: { plan: "pro", interval: "month" } },
    "acct_x",
    catalog,
  )
  expect(m!.valueCents).toBe(4900) // from catalog
  expect(m!.currency).toBe("usd") // defaulted
  expect(m!.transactionId).toBe("cs_ABC") // session id fallback
  expect(m!.clientId).toBe(syntheticClientId("acct_x")) // account id fallback
})

test("purchaseMirrorFromSession: returns null when no txn id or zero value", () => {
  expect(purchaseMirrorFromSession({ amount_total: 24900, id: null, subscription: null, metadata: { plan: "team", interval: "month" } }, "acct_x", catalog)).toBeNull()
  expect(purchaseMirrorFromSession({ amount_total: null, id: "cs_1", metadata: { plan: "unknown", interval: "month" } }, "acct_x", catalog)).toBeNull()
})

test("sendGa4Purchase never throws even if fetch rejects", async () => {
  process.env.KLAV_GA4_API_SECRET = "secret123"
  // @ts-expect-error stash
  globalThis.__origFetch = globalThis.fetch
  globalThis.fetch = (async () => { throw new Error("network down") }) as any
  await expect(sendGa4Purchase({ clientId: "c", transactionId: "t", valueCents: 100, currency: "usd", plan: "pro" })).resolves.toBeUndefined()
})
