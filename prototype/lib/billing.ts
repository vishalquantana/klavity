export type BillingPlan = "free" | "pro" | "team" | "agency" | "founding" | "scale" | "partner"
export type BillingInterval = "month" | "year"

// ── KLAVITYKLA-379: the upmarket ladder (founder decision 2026-07-20) ───────────────────────────
// "founding" (Founding Team) is an annual-only supporter tier sold exclusively via a hosted Stripe
// Payment Link (see STRIPE_PRICE_IDS below) — it has no "month" entry, hence Partial<...> here.
//
// Free $0 · Solo $49/mo · Team $249/mo · Scale $599/mo (PUBLISHED) · Founding Ten $490/yr.
// Annual = two months free (10× monthly) on every self-serve tier, unchanged.
//
// NOTE ON THE "SOLO" RENAME: "Pro" became the customer-facing name "Solo", but the internal PLAN
// SLUG stays `pro` — it is the value stored in the accounts table, sent to Stripe metadata, and
// carried by every existing subscription. Only the DISPLAY name changed (see PLAN_DISPLAY_NAMES
// below). Do NOT rename the slug; there is no migration and none is wanted.
export const STRIPE_PRICE_CATALOG: Record<Exclude<BillingPlan, "free" | "partner">, Partial<Record<BillingInterval, { lookupKey: string; unitAmount: number; label: string }>>> = {
  founding: {
    year: { lookupKey: "klavity_founding_annual_490", unitAmount: 49000, label: "Klavity Founding Team" },
  },
  pro: {
    month: { lookupKey: "klavity_solo_monthly_49", unitAmount: 4900, label: "Klavity Solo" },
    year: { lookupKey: "klavity_solo_annual_490", unitAmount: 49000, label: "Klavity Solo" },
  },
  team: {
    month: { lookupKey: "klavity_team_monthly_249", unitAmount: 24900, label: "Klavity Team" },
    year: { lookupKey: "klavity_team_annual_2490", unitAmount: 249000, label: "Klavity Team" },
  },
  // Scale (KLAVITYKLA-379): the price is now PUBLISHED ($599/mo) instead of "Custom", because nine
  // of sixteen AI-QA competitors hide theirs and publishing wins the "<product> pricing" search
  // lane. The catalog entry exists so the number has ONE source of truth that the pricing page and
  // the dashboard both quote. Self-serve checkout is still intentionally CLOSED for scale (see the
  // narrower plan union on ensureStripePrice / createStripeCheckoutSession and the explicit reject
  // in /api/billing/checkout): scale grants unlimited quotas, so it stays sales-assisted. True
  // enterprise (SSO/SAML, self-host, SLA) remains contact-us on top of this published floor.
  scale: {
    month: { lookupKey: "klavity_scale_monthly_599", unitAmount: 59900, label: "Klavity Scale" },
    year: { lookupKey: "klavity_scale_annual_5990", unitAmount: 599000, label: "Klavity Scale" },
  },
  // Agency (KLAVITYKLA-310): for agencies/consultancies running Klavity across many CLIENT sites.
  // Each client is a project — the plan lifts the per-account project cap and adds the per-client
  // usage & outcomes rollup report. Annual = two months free (10× monthly), same as Pro/Team.
  agency: {
    month: { lookupKey: "klavity_agency_monthly_249", unitAmount: 24900, label: "Klavity Agency" },
    year: { lookupKey: "klavity_agency_annual_2490", unitAmount: 249000, label: "Klavity Agency" },
  },
}

// ── SUPERSEDED lookup keys (KLAVITYKLA-379) ────────────────────────────────────────────────────
// Repricing does NOT delete the old Stripe prices — Stripe prices are immutable, so every existing
// subscriber is still billed against the price object (and lookup_key) they signed up on. The
// catalog above only governs what a NEW checkout creates; these are the retired keys, kept
// resolvable so a webhook for a grandfathered subscriber still maps to the right {plan, interval}
// instead of silently returning null and dropping them to `free`.
//
// NEVER remove an entry from this map. Add to it every time a price is retired.
export const SUPERSEDED_LOOKUP_KEYS: Record<string, { plan: BillingPlan; interval: BillingInterval }> = {
  // Founding Ten at $290/yr — superseded by klavity_founding_annual_490 on 2026-07-20.
  klavity_founding_annual_290: { plan: "founding", interval: "year" },
  // "Pro" at $29/mo · $290/yr — superseded by the Solo $49/mo · $490/yr keys.
  klavity_pro_monthly_29: { plan: "pro", interval: "month" },
  klavity_pro_annual_290: { plan: "pro", interval: "year" },
  // Team at $99/mo · $990/yr — superseded by the $249/mo · $2,490/yr keys.
  klavity_team_monthly_99: { plan: "team", interval: "month" },
  klavity_team_annual_990: { plan: "team", interval: "year" },
}

// ── Customer-facing plan DISPLAY names (KLAVITYKLA-379) ────────────────────────────────────────
// The keys here are the internal plan SLUGS (what lives in the DB, in Stripe metadata and in every
// API payload). The values are what a human is allowed to see. These two deliberately disagree for
// `pro`, which is displayed as "Solo": the ladder was renamed for customers without touching any
// stored value, so no migration was needed and existing subscriptions kept working untouched.
// Render plan names through planDisplayName() — never print a raw slug at a customer.
export const PLAN_DISPLAY_NAMES: Record<BillingPlan, string> = {
  free: "Free",
  pro: "Solo", // slug stays `pro` — display only. See the note above.
  team: "Team",
  agency: "Agency",
  founding: "Founding Ten",
  scale: "Scale",
  partner: "Partner · Unlimited",
}

export function planDisplayName(plan: string | null | undefined): string {
  return PLAN_DISPLAY_NAMES[normalizePlan(plan)]
}

// founding gets TEAM-level entitlements (KLAVITYKLA-365). The Founding Ten offer promises Team
// limits at the $490/yr Founding price (KLAVITYKLA-379) — with ONE deliberate exception, the
// AutoSim cadence; see the margin note on PLAN_QUOTAS.founding below. (It previously mirrored Pro,
// which under-delivered against what Founding buyers were sold; the pricing page in KLA-368
// advertises Team limits.)
//
// AutoSim is a PAID feature (KLAVITYKLA-365): free.autosimFlows = 0 and free.autosimRunsMonthly = 0.
// Free accounts may not CONFIGURE a new AutoSim flow. Accounts that already had a flow configured
// before this change are GRANDFATHERED so their existing flow keeps running — see
// FREE_GRANDFATHERED_AUTOSIM_RUNS_MONTHLY below and lib/quota.ts.
//
// Two DIFFERENT AutoSim allowances live here — don't confuse them (KLAVITYKLA-359):
//   • autosimFlows        — how many AutoSim/Trail flows you may have CONFIGURED at once (a stock).
//   • autosimRunsMonthly  — how many AutoSim walks may EXECUTE in a calendar month (a flow).
// The metered "autosim_walk" counter is a monthly RUN count, so it must be measured against
// autosimRunsMonthly; measuring it against autosimFlows produced nonsense meters like "12 / 5 flows".
//
// autosimRunsMonthly is derived from flows × the plan's cadence, with headroom for manual re-runs:
//   free   0 flows × none                   → 0    (AutoSim is a paid feature — KLAVITYKLA-365;
//                                                   pre-existing Free flows are grandfathered to
//                                                   FREE_GRANDFATHERED_AUTOSIM_RUNS_MONTHLY)
//   pro    5 flows × daily  (~30 runs/mo)   → 150  (5 × 30)
//   team   20 flows × ~daily                → 600  (kept at ~30/flow so an hourly cadence can't
//                                                   silently blow the unit economics)
//   agency 50 flows × ~daily                → 1500 (50 × 30)
// Ratio to simReactionsMonthly stays sane across tiers (~2.5–3.3× reviews per run allowance).
export const PLAN_QUOTAS: Record<BillingPlan, { projects: number | null; sims: number | null; simReactionsMonthly: number | null; autosimFlows: number | null; autosimRunsMonthly: number | null; autosimCadence: string }> = {
  free: { projects: 1, sims: 1, simReactionsMonthly: 25, autosimFlows: 0, autosimRunsMonthly: 0, autosimCadence: "none" },
  pro: { projects: 5, sims: 5, simReactionsMonthly: 500, autosimFlows: 5, autosimRunsMonthly: 150, autosimCadence: "daily" },
  // KLAVITYKLA-365: founding gets Team's LIMITS (Founding Ten buyers were promised Team limits).
  //
  // KLAVITYKLA-379 — DO NOT "FIX" THIS BACK TO HOURLY. 
  // founding matches team on every LIMIT above, but its cadence is deliberately "daily", NOT
  // "on-deploy/hourly". KLA-365 originally copied Team byte-for-byte including the hourly cadence,
  // which is loss-making AND the Founding price is locked FOR LIFE:
  //   20 flows × hourly ≈ 14,400 replays/mo ≈ $72/mo (at ~$0.005/replay, measured via the ai_calls
  //   ledger), plus 2,500 page reviews at $17–50/mo  →  $90–120/mo COGS
  //   against $490/yr = $40.83/mo revenue. Every founding customer would lose money, permanently.
  // Daily cadence removes ~95% of that exposure, keeps the offer genuinely generous, and leaves
  // hourly/on-deploy as a real upsell into paid Team. Revisit only when KLAVITYKLA-364 has
  // instrumented the true per-replay cost — not before, and not on vibes.
  founding: { projects: null, sims: 20, simReactionsMonthly: 2500, autosimFlows: 20, autosimRunsMonthly: 600, autosimCadence: "daily" },
  team: { projects: null, sims: 20, simReactionsMonthly: 2500, autosimFlows: 20, autosimRunsMonthly: 600, autosimCadence: "on-deploy/hourly" },
  // Agency (KLAVITYKLA-310): unlimited client projects; Sims/AutoSim allowances above Team so an
  // agency can cover many clients without immediately hitting Scale.
  agency: { projects: null, sims: 50, simReactionsMonthly: 5000, autosimFlows: 50, autosimRunsMonthly: 1500, autosimCadence: "on-deploy/hourly" },
  scale: { projects: null, sims: null, simReactionsMonthly: null, autosimFlows: null, autosimRunsMonthly: null, autosimCadence: "custom" },
  partner: { projects: null, sims: null, simReactionsMonthly: null, autosimFlows: null, autosimRunsMonthly: null, autosimCadence: "unlimited" },
}

/**
 * KLAVITYKLA-365 — grandfathering allowance for Free accounts that ALREADY had an AutoSim flow
 * configured when AutoSim was removed from Free.
 *
 * Removing AutoSim from Free must not retroactively break somebody's working flow. Because
 * free.autosimFlows is now 0, NO new flow can be created on Free — therefore any Free account that
 * still has a configured (non-demo) flow necessarily created it BEFORE this change. That invariant
 * is what identifies a grandfathered account; no migration or flag column is needed.
 *
 * For those accounts the monthly AutoSim-run cap falls back to the previous Free allowance (10)
 * instead of 0, so their existing flow and its scheduled runs keep executing unchanged.
 */
export const FREE_GRANDFATHERED_AUTOSIM_RUNS_MONTHLY = 10

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
    // KLAVITYKLA-359: autosim_walk is a MONTHLY RUN count, so it goes against autosimRunsMonthly —
    // the monthly run cap — NOT autosimFlows (the configured-flow allowance). The flows allowance is
    // still shown as its own line in the plan-limits copy; it is not a denominator for runs.
    { key: "autosim", metric: "autosim_walk", label: "AutoSim runs", limit: q.autosimRunsMonthly },
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

// ── past_due grace-degrade (KLAVITYKLA-313) ─────────────────────────────────────────────────────
// When a subscription's billing_status flips to "past_due" (a renewal charge failed; Stripe is still
// Smart-Retrying), we DO NOT hard-lock the account. Instead we grace-degrade: keep read access + core
// working, show a banner, and only restrict premium metered actions once a grace window elapses. This
// is the "don't punish a customer for a card that expired" promise (JTBD 8.9). Pure — no DB — so the
// entitlement path, routes, and the UI can all share one predicate.
export const PAST_DUE_GRACE_DAYS = 7
const GRACE_DAY_MS = 24 * 60 * 60 * 1000

export type BillingGraceState = {
  status: string | null
  pastDue: boolean          // billing_status === "past_due"
  inGrace: boolean          // pastDue AND still within the grace window
  graceExpired: boolean     // pastDue AND the grace window has elapsed
  daysRemaining: number     // whole days left in grace (0 when not past_due or expired)
  graceEndsAt: number | null // ms epoch the grace window ends (null when not past_due)
  restrictPremium: boolean  // true ONLY once grace has expired — the signal to degrade premium actions
}

// resolveBillingGrace — given the stored billing_status and the timestamp it last changed
// (billing_updated_at, which is stamped when the account flipped to past_due), compute the grace
// state. `now` and `graceDays` are injectable for tests. Any non-past_due status returns a benign
// "no restriction" state, so callers can invoke this unconditionally.
export function resolveBillingGrace(
  billingStatus: string | null | undefined,
  since: number | null | undefined,
  now: number = Date.now(),
  graceDays: number = PAST_DUE_GRACE_DAYS,
): BillingGraceState {
  const status = billingStatus != null ? String(billingStatus) : null
  if (status !== "past_due") {
    return { status, pastDue: false, inGrace: false, graceExpired: false, daysRemaining: 0, graceEndsAt: null, restrictPremium: false }
  }
  const days = Number.isFinite(graceDays) && graceDays > 0 ? graceDays : PAST_DUE_GRACE_DAYS
  // Anchor the window at when the account went past_due; fall back to `now` if we have no timestamp
  // (a missing anchor should grant the full grace window, never instantly expire it).
  const anchor = Number.isFinite(Number(since)) && Number(since) > 0 ? Number(since) : now
  const graceEndsAt = anchor + days * GRACE_DAY_MS
  const msLeft = graceEndsAt - now
  const inGrace = msLeft > 0
  return {
    status,
    pastDue: true,
    inGrace,
    graceExpired: !inGrace,
    daysRemaining: inGrace ? Math.ceil(msLeft / GRACE_DAY_MS) : 0,
    graceEndsAt,
    restrictPremium: !inGrace,
  }
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
  // KLAVITYKLA-379: fall back to retired keys so grandfathered subscribers keep resolving.
  return SUPERSEDED_LOOKUP_KEYS[key]?.plan ?? null
}

export function intervalFromLookupKey(lookupKey: string | null | undefined): BillingInterval | null {
  const key = String(lookupKey || "")
  if (!key) return null
  for (const intervals of Object.values(STRIPE_PRICE_CATALOG)) {
    for (const [interval, entry] of Object.entries(intervals)) {
      if (entry?.lookupKey === key) return interval as BillingInterval
    }
  }
  // KLAVITYKLA-379: retired keys still carry a valid interval.
  return SUPERSEDED_LOOKUP_KEYS[key]?.interval ?? null
}

// ── Live Stripe price ID → plan/interval (KLAVITYKLA-336) ──────────────────────────────────────
// Webhook subscription/invoice/checkout-session payloads carry a Stripe price.id, not our internal
// lookup_key (lookup_key is only set on prices *we* create via ensureStripePrice for the self-serve
// /api/billing/checkout flow). These are the live production Stripe price IDs for the public Klavity
// catalog — PUBLIC identifiers, not secrets — safe to hardcode. Keep in lockstep with the Stripe
// Dashboard if a price is ever repriced (Stripe prices are immutable; a repriced plan gets a new ID).
export const STRIPE_PRICE_IDS: Record<string, { plan: Exclude<BillingPlan, "free" | "scale" | "partner">; interval: BillingInterval }> = {
  // Founding Team — annual only, $490/yr (KLAVITYKLA-379). This is the live Payment Link price.
  price_1TuhSqDWQd30h1DiyqjXQ3NC: { plan: "founding", interval: "year" },
  // ── SUPERSEDED price IDs (KLAVITYKLA-379 reprice) ──
  // These are the OLD "Pro" $29/mo·$290/yr and Team $99/mo·$990/yr price objects. Stripe prices are
  // immutable, so anyone who subscribed before the reprice is still billed against these IDs and
  // their webhooks still arrive carrying them. They MUST keep resolving or a grandfathered customer
  // silently drops to `free`. New checkouts never touch these — ensureStripePrice resolves the new
  // catalog lookup keys and creates fresh price objects, which resolve via the lookup_key fallback.
  price_1TuhSrDWQd30h1DivfC0EMKT: { plan: "pro", interval: "month" },
  price_1TuhSrDWQd30h1DiTy9eSe5p: { plan: "pro", interval: "year" },
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
