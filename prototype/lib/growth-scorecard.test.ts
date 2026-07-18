// KLAVITYKLA-332 — weekly GTM growth scorecard tests.
// Verifies SQL correctness (no column errors), week bucketing, MRR estimation,
// D30 retention guard, and best-channel selection.
import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { gatherGrowthScorecard, SCORECARD_WEEKS } from "./growth-scorecard"

const { getClient } = useIsolatedDb("klav-growth-scorecard")

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

// Helper: insert a funnel event
async function trackEvent(opts: {
  event: string
  email?: string
  anon_id?: string
  source?: string
  account_id?: string
  created_at: number
}) {
  const c = getClient()
  const id = `fe_${Math.random().toString(36).slice(2)}`
  await c.execute({
    sql: `INSERT INTO funnel_events (id, event, email, anon_id, account_id, source, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, opts.event, opts.email ?? null, opts.anon_id ?? null, opts.account_id ?? null, opts.source ?? null, opts.created_at],
  })
}

// Helper: insert an account
async function mkAccount(id: string, opts: { plan?: string; billingStatus?: string; utmSource?: string; createdAt: number }) {
  const c = getClient()
  await c.execute({
    sql: `INSERT INTO accounts (id, name, owner_email, plan, billing_status, utm_source, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, `Acct ${id}`, `owner@${id}.com`, opts.plan ?? "free", opts.billingStatus ?? null, opts.utmSource ?? null, opts.createdAt],
  })
}

// ── Empty DB — no SQL / column errors ────────────────────────────────────────

test("gatherGrowthScorecard: returns empty weeks on fresh DB without throwing", async () => {
  const result = await gatherGrowthScorecard(getClient(), Date.now())
  expect(Array.isArray(result.weeks)).toBe(true)
  expect(result.weeks.length).toBe(0)
  expect(typeof result.since).toBe("number")
  expect(typeof result.generatedAt).toBe("number")
})

// ── Reach + Runs + Completion% ────────────────────────────────────────────────

test("reach counts check_started; runs counts check_completed; completion% is computed", async () => {
  const now = Date.now()
  const thisWeek = now - 2 * DAY_MS   // within current week

  await trackEvent({ event: "check_started",   anon_id: "a1", created_at: thisWeek })
  await trackEvent({ event: "check_started",   anon_id: "a2", created_at: thisWeek })
  await trackEvent({ event: "check_completed", anon_id: "a1", created_at: thisWeek })

  const result = await gatherGrowthScorecard(getClient(), now)
  expect(result.weeks.length).toBeGreaterThan(0)
  const w = result.weeks[0]
  expect(w.reach).toBe(2)
  expect(w.runs).toBe(1)
  expect(w.completionPct).toBe("50%")
})

// ── Leads + Activation% ───────────────────────────────────────────────────────

test("leads dedupes by email; activation% = activated / leads", async () => {
  const now = Date.now()
  const t = now - 1 * DAY_MS

  // 2 unique leads
  await trackEvent({ event: "lead_captured", email: "alice@example.com", created_at: t })
  await trackEvent({ event: "lead_captured", email: "alice@example.com", created_at: t })  // dup
  await trackEvent({ event: "lead_captured", email: "bob@example.com", created_at: t })
  // 1 activated
  await trackEvent({ event: "app_connected", email: "alice@example.com", created_at: t })

  const result = await gatherGrowthScorecard(getClient(), now)
  const w = result.weeks[0]
  expect(w.leads).toBe(2)
  expect(w.activationPct).toBe("50%")
})

test("activation% shows — when leads = 0", async () => {
  // Use a fixed past timestamp (Jan 2001) so no data from other tests bleeds into this window.
  const BASE = 978307200000  // 2001-01-01
  const now = BASE + 7 * DAY_MS
  await trackEvent({ event: "check_started", anon_id: "unique-nolead", created_at: BASE + DAY_MS })
  const result = await gatherGrowthScorecard(getClient(), now)
  const w = result.weeks[0]
  expect(w.leads).toBe(0)
  expect(w.activationPct).toBe("—")
})

// ── New Paid + MRR + Best Channel ─────────────────────────────────────────────

test("new paid dedupes account_id; MRR estimated from plan; best channel is top source", async () => {
  const now = Date.now()
  const t = now - 1 * DAY_MS

  await mkAccount("acct_pro1", { plan: "pro", billingStatus: "active", utmSource: "google", createdAt: t })
  await mkAccount("acct_pro2", { plan: "pro", billingStatus: "active", utmSource: "twitter", createdAt: t })
  await mkAccount("acct_team", { plan: "team", billingStatus: "active", utmSource: "google", createdAt: t })

  // 2 google paid, 1 twitter paid
  await trackEvent({ event: "subscription_created", account_id: "acct_pro1", source: "google",  created_at: t })
  await trackEvent({ event: "subscription_created", account_id: "acct_pro1", source: "google",  created_at: t })  // duplicate event
  await trackEvent({ event: "subscription_created", account_id: "acct_pro2", source: "twitter", created_at: t })
  await trackEvent({ event: "subscription_created", account_id: "acct_team", source: "google",  created_at: t })

  const result = await gatherGrowthScorecard(getClient(), now)
  const w = result.weeks[0]
  expect(w.newPaid).toBe(3)             // 3 distinct accounts
  expect(w.mrrUsd).toBe(29 + 29 + 99)  // pro+pro+team
  expect(w.bestChannel).toBe("google")  // 2 vs 1
})

// ── D30 Retention ─────────────────────────────────────────────────────────────

test("d30RetainedPct shows '< 30d' for cohorts younger than 30 days", async () => {
  const now = Date.now()
  await mkAccount("acct_new", { plan: "pro", billingStatus: "active", createdAt: now - 5 * DAY_MS })

  const result = await gatherGrowthScorecard(getClient(), now)
  const w = result.weeks.find(r => r.d30RetainedPct !== "—")
  expect(w?.d30RetainedPct).toBe("< 30d")
})

test("d30RetainedPct computes % for cohorts 30+ days old", async () => {
  const now = Date.now()
  const fortyDaysAgo = now - 40 * DAY_MS

  // 2 accounts signed up 40 days ago; 1 still active, 1 inactive
  await mkAccount("acct_ret1", { plan: "pro", billingStatus: "active",   createdAt: fortyDaysAgo })
  await mkAccount("acct_ret2", { plan: "pro", billingStatus: "canceled", createdAt: fortyDaysAgo })

  const result = await gatherGrowthScorecard(getClient(), now)
  const w = result.weeks.find(r => r.d30RetainedPct.endsWith("%") && !r.d30RetainedPct.startsWith("<"))
  expect(w).toBeDefined()
  expect(w!.d30RetainedPct).toBe("50%")
})

// ── SCORECARD_WEEKS constant ──────────────────────────────────────────────────

test("SCORECARD_WEEKS is 8", () => {
  expect(SCORECARD_WEEKS).toBe(8)
})

// ── Events older than 8 weeks are excluded ────────────────────────────────────

test("events outside the 8-week window are excluded", async () => {
  // Use a fixed past window (Jul 2001) isolated from other tests that use Date.now() (~2026).
  const BASE = 994723200000  // 2001-07-10
  const now = BASE
  const ninetyDaysAgo = BASE - 90 * DAY_MS  // Apr 10, 2001 — outside 8-week window

  await trackEvent({ event: "check_started", anon_id: "old-unique-2001", created_at: ninetyDaysAgo })

  const result = await gatherGrowthScorecard(getClient(), now)
  const allReach = result.weeks.reduce((s, w) => s + w.reach, 0)
  expect(allReach).toBe(0)
})
