export type BillingPlan = "free" | "pro" | "team" | "agency" | "founding" | "scale" | "partner"
export type BillingInterval = "month" | "year"

// "founding" (Founding Team) is an annual-only supporter tier sold exclusively via a hosted Stripe
// Payment Link (see STRIPE_PRICE_IDS below) — it has no "month" entry, hence Partial<...> here.
export const STRIPE_PRICE_CATALOG: Record<Exclude<BillingPlan, "free" | "scale" | "partner">, Partial<Record<BillingInterval, { lookupKey: string; unitAmount: number; label: string }>>> = {
  founding: {
    year: { lookupKey: "klavity_founding_annual_290", unitAmount: 29000, label: "Klavity Founding Team" },
  },
  pro: {
    month: { lookupKey: "klavity_pro_monthly_29", unitAmount: 2900, label: "Klavity Pro" },
    year: { lookupKey: "klavity_pro_annual_290", unitAmount: 29000, label: "Klavity Pro" },
  },
  team: {
    month: { lookupKey: "klavity_team_monthly_99", unitAmount: 9900, label: "Klavity Team" },
    year: { lookupKey: "klavity_team_annual_990", unitAmount: 99000, label: "Klavity Team" },
  },
  // Agency (KLAVITYKLA-310): for agencies/consultancies running Klavity across many CLIENT sites.
  // Each client is a project — the plan lifts the per-account project cap and adds the per-client
  // usage & outcomes rollup report. Annual = two months free (10× monthly), same as Pro/Team.
  agency: {
    month: { lookupKey: "klavity_agency_monthly_249", unitAmount: 24900, label: "Klavity Agency" },
    year: { lookupKey: "klavity_agency_annual_2490", unitAmount: 249000, label: "Klavity Agency" },
  },
}

// founding mirrors Pro's quotas (same $290/yr price point as Pro annual) — at-or-above Pro per
// KLAVITYKLA-336. Bump independently later if Founding members should get more.
export const PLAN_QUOTAS: Record<BillingPlan, { projects: number | null; sims: number | null; simReactionsMonthly: number | null; autosimFlows: number | null; autosimCadence: string }> = {
  free: { projects: 1, sims: 1, simReactionsMonthly: 25, autosimFlows: 1, autosimCadence: "weekly" },
  pro: { projects: 5, sims: 5, simReactionsMonthly: 500, autosimFlows: 5, autosimCadence: "daily" },
  founding: { projects: 5, sims: 5, simReactionsMonthly: 500, autosimFlows: 5, autosimCadence: "daily" },
  team: { projects: null, sims: 20, simReactionsMonthly: 2500, autosimFlows: 20, autosimCadence: "on-deploy/hourly" },
  // Agency (KLAVITYKLA-310): unlimited client projects; Sims/AutoSim allowances above Team so an
  // agency can cover many clients without immediately hitting Scale.
  agency: { projects: null, sims: 50, simReactionsMonthly: 5000, autosimFlows: 50, autosimCadence: "on-deploy/hourly" },
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

// ── Customer-facing usage meters (KLAVITYKLA-309) ───────────────────────────────────────────────
// Maps the current-period metered value-metric counts (from getAccountUsage: 'sim_review' +
// 'autosim_walk') onto the account plan's monthly allowance so the billing drawer can draw
// "used / limit" progress bars. DISPLAY ONLY — no enforcement/blocking/charge happens here.
export type UsageMeterView = {
  key: "sims" | "autosim"
  metric: "sim_review" | "autosim_walk"
  label: string
  used: number
  limit: number | null // null → unlimited on this plan
  unlimited: boolean
  pct: number // 0..100, clamped; 0 when unlimited
  overLimit: boolean
}

export function buildUsageMeters(plan: string | null | undefined, usage: Record<string, number> = {}): UsageMeterView[] {
  const q = PLAN_QUOTAS[normalizePlan(plan)]
  const defs: Array<{ key: UsageMeterView["key"]; metric: UsageMeterView["metric"]; label: string; limit: number | null }> = [
    { key: "sims", metric: "sim_review", label: "Sim reviews", limit: q.simReactionsMonthly },
    { key: "autosim", metric: "autosim_walk", label: "AutoSim runs", limit: q.autosimFlows },
  ]
  return defs.map((d) => {
    const raw = Number(usage?.[d.metric])
    const used = Number.isFinite(raw) && raw > 0 ? Math.trunc(raw) : 0
    const unlimited = d.limit == null
    const limit = d.limit
    const pct = unlimited ? 0 : limit && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : used > 0 ? 100 : 0
    const overLimit = !unlimited && limit != null && used > limit
    return { key: d.key, metric: d.metric, label: d.label, used, limit, unlimited, pct, overLimit }
  })
}

// ── Per-project usage + cost breakdown (KLAVITYKLA-276) ─────────────────────────────────────────
// Merges per-project usage rows (getAccountUsageByProject) with per-project AI spend rows
// (tenantTodaySpendByProject) into one display row per project for the billing drawer, so a
// customer can see WHICH project is consuming the account's metered allowance and what it cost
// today. DISPLAY ONLY — the plan quota is account-wide; this attributes usage/cost, it does not
// enforce a per-project limit.
export type ProjectUsageView = {
  projectId: string
  name: string
  simReviews: number
  autosimWalks: number
  costToday: number // USD AI spend today attributed to this project
}

export function buildProjectUsage(
  usageRows: Array<{ projectId: string; name: string | null; metric: string; count: number }> = [],
  spendRows: Array<{ projectId: string; cost: number }> = [],
): ProjectUsageView[] {
  const byProject = new Map<string, ProjectUsageView>()
  const ensure = (pidRaw: string, name: string | null): ProjectUsageView => {
    const pid = String(pidRaw || "")
    let v = byProject.get(pid)
    if (!v) {
      v = { projectId: pid, name: name || (pid || "Unattributed"), simReviews: 0, autosimWalks: 0, costToday: 0 }
      byProject.set(pid, v)
    } else if (name && (!v.name || v.name === v.projectId)) {
      v.name = name // fill in a real name if an earlier row only had the id
    }
    return v
  }
  for (const r of usageRows) {
    const v = ensure(r.projectId, r.name)
    const c = Number.isFinite(r.count) && r.count > 0 ? Math.trunc(r.count) : 0
    if (r.metric === "sim_review") v.simReviews += c
    else if (r.metric === "autosim_walk") v.autosimWalks += c
  }
  for (const s of spendRows) {
    const v = ensure(s.projectId, null)
    v.costToday += Number.isFinite(s.cost) && s.cost > 0 ? s.cost : 0
  }
  // Busiest projects first (metered activity, then cost, then name) so the drawer leads with signal.
  return Array.from(byProject.values()).sort((a, b) => {
    const au = a.simReviews + a.autosimWalks, bu = b.simReviews + b.autosimWalks
    if (bu !== au) return bu - au
    if (b.costToday !== a.costToday) return b.costToday - a.costToday
    return a.name.localeCompare(b.name)
  })
}

// ── Agency per-client usage & OUTCOMES rollup (KLAVITYKLA-310) ──────────────────────────────────
// For an Agency-tier account, roll every CLIENT (= project) up into one report row combining
// metered usage (Sim reviews, AutoSim runs) with the trust-loop OUTCOMES that justify the retainer:
//   • reportsFound        — bugs surfaced (Snap + Sim feedback) in the window
//   • guardedPassRate     — guarded-flow (AutoSim/Trail) walk pass rate: green / (green+amber+red)
//   • regressionsCaught   — findings flagged as regressions ("fixed things breaking again")
// Pure merge of already-authorised rows — DISPLAY ONLY, no enforcement.
export type AgencyClientOutcomeRow = {
  projectId: string
  reportsFound: number
  regressionsCaught: number
  guardedGreen: number
  guardedAmber: number
  guardedRed: number
  guardedTotal: number
}

export type AgencyClientView = {
  projectId: string
  name: string
  simReviews: number
  autosimWalks: number
  reportsFound: number
  regressionsCaught: number
  guardedRuns: number
  guardedPassRate: number | null // 0..1, null when no guarded runs in window
}

export function buildAgencyClientReport(
  projects: Array<{ projectId: string; name: string | null }> = [],
  usageRows: Array<{ projectId: string; name?: string | null; metric: string; count: number }> = [],
  outcomeRows: AgencyClientOutcomeRow[] = [],
): AgencyClientView[] {
  const byProject = new Map<string, AgencyClientView>()
  const ensure = (pidRaw: string, name: string | null): AgencyClientView => {
    const pid = String(pidRaw || "")
    let v = byProject.get(pid)
    if (!v) {
      v = {
        projectId: pid, name: name || (pid || "Unattributed"),
        simReviews: 0, autosimWalks: 0, reportsFound: 0, regressionsCaught: 0,
        guardedRuns: 0, guardedPassRate: null,
      }
      byProject.set(pid, v)
    } else if (name && (!v.name || v.name === v.projectId)) {
      v.name = name
    }
    return v
  }
  // Seed one row per known client so a project with outcomes but no metered usage still shows.
  for (const p of projects) ensure(p.projectId, p.name)
  for (const r of usageRows) {
    const v = ensure(r.projectId, r.name ?? null)
    const c = Number.isFinite(r.count) && r.count > 0 ? Math.trunc(r.count) : 0
    if (r.metric === "sim_review") v.simReviews += c
    else if (r.metric === "autosim_walk") v.autosimWalks += c
  }
  const num = (n: unknown) => (Number.isFinite(Number(n)) && Number(n) > 0 ? Math.trunc(Number(n)) : 0)
  const greenByProject = new Map<string, number>()
  for (const o of outcomeRows) {
    const v = ensure(o.projectId, null)
    v.reportsFound += num(o.reportsFound)
    v.regressionsCaught += num(o.regressionsCaught)
    const green = num(o.guardedGreen), amber = num(o.guardedAmber), red = num(o.guardedRed)
    const total = num(o.guardedTotal) || green + amber + red
    v.guardedRuns += total
    greenByProject.set(v.projectId, (greenByProject.get(v.projectId) ?? 0) + green)
  }
  // Pass rate = green / total across the window; null when there were no guarded runs.
  for (const v of byProject.values()) {
    v.guardedPassRate = v.guardedRuns > 0 ? (greenByProject.get(v.projectId) ?? 0) / v.guardedRuns : null
  }
  // Lead with the clients that show the most trust-loop signal (outcomes first, then usage, then name).
  return Array.from(byProject.values()).sort((a, b) => {
    const ao = a.reportsFound + a.regressionsCaught, bo = b.reportsFound + b.regressionsCaught
    if (bo !== ao) return bo - ao
    const au = a.simReviews + a.autosimWalks + a.guardedRuns, bu = b.simReviews + b.autosimWalks + b.guardedRuns
    if (bu !== au) return bu - au
    return a.name.localeCompare(b.name)
  })
}

export function normalizePlan(plan: string | null | undefined): BillingPlan {
  return plan === "pro" || plan === "team" || plan === "agency" || plan === "founding" || plan === "scale" || plan === "partner" ? plan : "free"
}

// Agency-tier entitlement (KLAVITYKLA-310). The per-client usage & outcomes rollup is gated to
// accounts on the Agency plan (or any unlimited/enterprise tier, which the caller passes as
// `unlimited`). Pure — no DB — so routes and the UI can share one predicate.
export function isAgencyEntitled(plan: string | null | undefined, unlimited = false): boolean {
  const p = normalizePlan(plan)
  return unlimited || p === "agency" || p === "scale" || p === "partner"
}

export function normalizeInterval(interval: string | null | undefined): BillingInterval {
  return interval === "year" || interval === "annual" ? "year" : "month"
}

export function planFromLookupKey(lookupKey: string | null | undefined): BillingPlan | null {
  const key = String(lookupKey || "")
  if (!key) return null
  for (const [plan, intervals] of Object.entries(STRIPE_PRICE_CATALOG)) {
    if (Object.values(intervals).some((entry) => entry?.lookupKey === key)) return plan as BillingPlan
  }
  return null
}

export function intervalFromLookupKey(lookupKey: string | null | undefined): BillingInterval | null {
  const key = String(lookupKey || "")
  if (!key) return null
  for (const intervals of Object.values(STRIPE_PRICE_CATALOG)) {
    for (const [interval, entry] of Object.entries(intervals)) {
      if (entry?.lookupKey === key) return interval as BillingInterval
    }
  }
  return null
}

// ── Live Stripe price ID → plan/interval (KLAVITYKLA-336) ──────────────────────────────────────
// Webhook subscription/invoice/checkout-session payloads carry a Stripe price.id, not our internal
// lookup_key (lookup_key is only set on prices *we* create via ensureStripePrice for the self-serve
// /api/billing/checkout flow). These are the live production Stripe price IDs for the public Klavity
// catalog — PUBLIC identifiers, not secrets — safe to hardcode. Keep in lockstep with the Stripe
// Dashboard if a price is ever repriced (Stripe prices are immutable; a repriced plan gets a new ID).
export const STRIPE_PRICE_IDS: Record<string, { plan: Exclude<BillingPlan, "free" | "scale" | "partner">; interval: BillingInterval }> = {
  // Founding Team — annual only, $290/yr
  price_1TuhSqDWQd30h1DiyqjXQ3NC: { plan: "founding", interval: "year" },
  // Pro — $29/mo, $290/yr
  price_1TuhSrDWQd30h1DivfC0EMKT: { plan: "pro", interval: "month" },
  price_1TuhSrDWQd30h1DiTy9eSe5p: { plan: "pro", interval: "year" },
  // Team — $99/mo, $990/yr
  price_1TuhSsDWQd30h1DiU5g7VDZo: { plan: "team", interval: "month" },
  price_1TuhStDWQd30h1DiRzJCtPsF: { plan: "team", interval: "year" },
}

export function planFromPriceId(priceId: string | null | undefined): BillingPlan | null {
  const id = String(priceId || "")
  if (!id) return null
  return STRIPE_PRICE_IDS[id]?.plan ?? null
}

export function intervalFromPriceId(priceId: string | null | undefined): BillingInterval | null {
  const id = String(priceId || "")
  if (!id) return null
  return STRIPE_PRICE_IDS[id]?.interval ?? null
}

// Combined resolver used at every webhook callsite: try the live price-ID map first (works for both
// self-serve checkout AND hosted Payment Link purchases, since Payment Links use these same live
// price IDs), then fall back to lookup_key (covers prices created by ensureStripePrice in Stripe test
// mode, which don't have one of the live IDs above), then Stripe's own `recurring.interval` for interval.
type StripePriceLike = { id?: string | null; lookup_key?: string | null; recurring?: { interval?: string | null } | null } | null | undefined

export function planFromPrice(price: StripePriceLike): BillingPlan | null {
  if (!price) return null
  return planFromPriceId(price.id) ?? planFromLookupKey(price.lookup_key)
}

export function intervalFromPrice(price: StripePriceLike): BillingInterval | null {
  if (!price) return null
  return (
    intervalFromPriceId(price.id) ??
    intervalFromLookupKey(price.lookup_key) ??
    (price.recurring?.interval ? normalizeInterval(String(price.recurring.interval)) : null)
  )
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

export async function ensureStripePrice(plan: "pro" | "team" | "agency" | "founding", interval: BillingInterval): Promise<string> {
  // pro/team define both month + year; "founding" is annual-only (the checkout route forces its
  // interval to "year"), so guard instead of asserting.
  const entry = STRIPE_PRICE_CATALOG[plan][interval]
  if (!entry) throw new Error(`No ${plan} price for interval "${interval}"`)
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
  plan: "pro" | "team" | "agency" | "founding"
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
