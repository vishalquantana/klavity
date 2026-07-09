export type BillingPlan = "free" | "pro" | "team" | "scale" | "partner"
export type BillingInterval = "month" | "year"

export const STRIPE_PRICE_CATALOG: Record<Exclude<BillingPlan, "free" | "scale" | "partner">, Record<BillingInterval, { lookupKey: string; unitAmount: number; label: string }>> = {
  pro: {
    month: { lookupKey: "klavity_pro_monthly_29", unitAmount: 2900, label: "Klavity Pro" },
    year: { lookupKey: "klavity_pro_annual_290", unitAmount: 29000, label: "Klavity Pro" },
  },
  team: {
    month: { lookupKey: "klavity_team_monthly_99", unitAmount: 9900, label: "Klavity Team" },
    year: { lookupKey: "klavity_team_annual_990", unitAmount: 99000, label: "Klavity Team" },
  },
}

export const PLAN_QUOTAS: Record<BillingPlan, { projects: number | null; sims: number | null; simReactionsMonthly: number | null; autosimFlows: number | null; autosimCadence: string }> = {
  free: { projects: 1, sims: 1, simReactionsMonthly: 25, autosimFlows: 1, autosimCadence: "weekly" },
  pro: { projects: 5, sims: 5, simReactionsMonthly: 500, autosimFlows: 5, autosimCadence: "daily" },
  team: { projects: null, sims: 20, simReactionsMonthly: 2500, autosimFlows: 20, autosimCadence: "on-deploy/hourly" },
  scale: { projects: null, sims: null, simReactionsMonthly: null, autosimFlows: null, autosimCadence: "custom" },
  partner: { projects: null, sims: null, simReactionsMonthly: null, autosimFlows: null, autosimCadence: "unlimited" },
}

export function billingEnforcementEnabled(): boolean {
  return process.env.KLAV_BILLING_ENFORCEMENT === "1"
}

export function quotasForPlan(plan: string | null | undefined) {
  const p = normalizePlan(plan)
  return { plan: p, enforcement: billingEnforcementEnabled(), quotas: PLAN_QUOTAS[p] }
}

export function normalizePlan(plan: string | null | undefined): BillingPlan {
  return plan === "pro" || plan === "team" || plan === "scale" || plan === "partner" ? plan : "free"
}

export function normalizeInterval(interval: string | null | undefined): BillingInterval {
  return interval === "year" || interval === "annual" ? "year" : "month"
}

export function planFromLookupKey(lookupKey: string | null | undefined): BillingPlan | null {
  const key = String(lookupKey || "")
  for (const [plan, intervals] of Object.entries(STRIPE_PRICE_CATALOG)) {
    if (Object.values(intervals).some((entry) => entry.lookupKey === key)) return plan as BillingPlan
  }
  return null
}

export function intervalFromLookupKey(lookupKey: string | null | undefined): BillingInterval | null {
  const key = String(lookupKey || "")
  for (const intervals of Object.values(STRIPE_PRICE_CATALOG)) {
    for (const [interval, entry] of Object.entries(intervals)) {
      if (entry.lookupKey === key) return interval as BillingInterval
    }
  }
  return null
}

function stripeKey(): string {
  const key = process.env.STRIPE_SECRET_KEY || ""
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  return key
}

function stripeBase(): string {
  return (process.env.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/+$/, "")
}

async function stripeRequest(path: string, params: URLSearchParams, method = "POST"): Promise<any> {
  const url = `${stripeBase()}${path}${method === "GET" && params.toString() ? `?${params}` : ""}`
  const res = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${stripeKey()}`,
      ...(method === "POST" ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" ? params : undefined,
  })
  const text = await res.text()
  const body = text ? JSON.parse(text) : {}
  if (!res.ok) throw new Error(body?.error?.message || `Stripe HTTP ${res.status}`)
  return body
}

export async function ensureStripePrice(plan: "pro" | "team", interval: BillingInterval): Promise<string> {
  const entry = STRIPE_PRICE_CATALOG[plan][interval]
  const lookup = new URLSearchParams()
  lookup.append("lookup_keys[]", entry.lookupKey)
  lookup.set("active", "true")
  const existing = await stripeRequest("/v1/prices", lookup, "GET")
  const found = Array.isArray(existing?.data) ? existing.data.find((p: any) => p?.lookup_key === entry.lookupKey) : null
  if (found?.id) return String(found.id)

  const product = await stripeRequest("/v1/products", new URLSearchParams({
    name: entry.label,
    "metadata[klavity_plan]": plan,
  }))
  const created = await stripeRequest("/v1/prices", new URLSearchParams({
    currency: "usd",
    unit_amount: String(entry.unitAmount),
    product: String(product.id),
    lookup_key: entry.lookupKey,
    "recurring[interval]": interval,
    "metadata[klavity_plan]": plan,
    "metadata[klavity_interval]": interval,
  }))
  return String(created.id)
}

export async function createStripeCheckoutSession(input: {
  accountId: string
  email: string
  plan: "pro" | "team"
  interval: BillingInterval
  successUrl: string
  cancelUrl: string
  customerId?: string | null
}): Promise<{ id: string; url: string; customerId?: string | null }> {
  const priceId = await ensureStripePrice(input.plan, input.interval)
  const params = new URLSearchParams({
    mode: "subscription",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    client_reference_id: input.accountId,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    allow_promotion_codes: "true",
    "metadata[account_id]": input.accountId,
    "metadata[plan]": input.plan,
    "metadata[interval]": input.interval,
    "subscription_data[metadata][account_id]": input.accountId,
    "subscription_data[metadata][plan]": input.plan,
    "subscription_data[metadata][interval]": input.interval,
  })
  if (input.customerId) params.set("customer", input.customerId)
  else params.set("customer_email", input.email)
  const session = await stripeRequest("/v1/checkout/sessions", params)
  return { id: String(session.id), url: String(session.url || ""), customerId: session.customer ? String(session.customer) : null }
}

export async function createStripePortalSession(input: { customerId: string; returnUrl: string }): Promise<{ id: string; url: string }> {
  const session = await stripeRequest("/v1/billing_portal/sessions", new URLSearchParams({
    customer: input.customerId,
    return_url: input.returnUrl,
  }))
  return { id: String(session.id), url: String(session.url || "") }
}

export async function retrieveStripeSubscription(subscriptionId: string): Promise<any> {
  const params = new URLSearchParams()
  params.append("expand[]", "items.data.price")
  return stripeRequest(`/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, params, "GET")
}

function hexToBytes(hex: string): Uint8Array {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2) return new Uint8Array()
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}

function timingSafeBytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export async function verifyStripeWebhook(rawBody: string, sigHeader: string | null, secret = process.env.STRIPE_WEBHOOK_SECRET || "", toleranceMs = 5 * 60 * 1000): Promise<any> {
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set")
  const parts = String(sigHeader || "").split(",").reduce<Record<string, string[]>>((acc, part) => {
    const [k, v] = part.split("=")
    if (k && v) (acc[k] ||= []).push(v)
    return acc
  }, {})
  const ts = parts.t?.[0]
  const signatures = parts.v1 || []
  if (!ts || !signatures.length) throw new Error("Missing Stripe signature")
  const timestampMs = Number(ts) * 1000
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > toleranceMs) throw new Error("Stale Stripe signature")
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ts}.${rawBody}`)))
  if (!signatures.some((sig) => timingSafeBytesEqual(mac, hexToBytes(sig)))) throw new Error("Bad Stripe signature")
  return JSON.parse(rawBody)
}
