import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"
import { buildUsageMeters, normalizePlan, PLAN_QUOTAS, STRIPE_PRICE_IDS } from "./lib/billing"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-billing-route-${RUN}.db`)
const OWNER = `billing-${RUN}@test.local`
const SID = `sess_billing_${RUN}`
const ACCOUNT = `acct_billing_${RUN}`
const PROJECT = `proj_billing_${RUN}`
const NOW = Date.now()
const WEBHOOK_SECRET = "whsec_route_test"

// Live Founding Team price ID (KLAVITYKLA-336) — pulled from the real catalog so this test can't
// silently drift from the price map it's exercising.
const FOUNDING_PRICE_ID = Object.entries(STRIPE_PRICE_IDS).find(([, v]) => v.plan === "founding")![0]
const LINK_BUYER_EMAIL = `founding-link-${RUN}@test.local`
const WALI_BUYER_EMAIL = `wali-buyer-${RUN}@test.local`

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

let appProc: ReturnType<typeof Bun.spawn>
let stripeServer: ReturnType<typeof Bun.serve>
let BASE = ""
let STRIPE_BASE = ""

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

async function stripeSig(rawBody: string, secret: string, ts = Math.floor(Date.now() / 1000)): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ts}.${rawBody}`)))
  return `t=${ts},v1=${Array.from(mac, (b) => b.toString(16).padStart(2, "0")).join("")}`
}

beforeAll(async () => {
  stripeServer = Bun.serve({
    port: 0,
    async fetch(req) {
      const url = new URL(req.url)
      if (req.method === "GET" && url.pathname === "/v1/prices") return Response.json({ data: [] })
      if (req.method === "POST" && url.pathname === "/v1/products") return Response.json({ id: "prod_test" })
      if (req.method === "POST" && url.pathname === "/v1/prices") {
        const body = new URLSearchParams(await req.text())
        return Response.json({ id: `price_${body.get("lookup_key")}`, lookup_key: body.get("lookup_key") })
      }
      if (req.method === "POST" && url.pathname === "/v1/checkout/sessions") {
        const body = new URLSearchParams(await req.text())
        return Response.json({ id: "cs_test_123", url: "https://checkout.stripe.test/session", customer: body.get("customer") || "cus_test_123" })
      }
      if (req.method === "POST" && url.pathname === "/v1/billing_portal/sessions") {
        return Response.json({ id: "bps_test_123", url: "https://billing.stripe.test/portal" })
      }
      if (req.method === "GET" && url.pathname === "/v1/subscriptions/sub_test_123") {
        return Response.json({
          id: "sub_test_123",
          customer: "cus_test_123",
          status: "active",
          current_period_end: 2000000000,
          cancel_at_period_end: false,
          metadata: { account_id: ACCOUNT, plan: "team", interval: "year" },
          items: { data: [{ price: { lookup_key: "klavity_team_annual_990", recurring: { interval: "year" } } }] },
        })
      }
      // Hosted Payment-Link purchase (KLAVITYKLA-336): the subscription behind a cold Payment-Link
      // buy carries NO account_id metadata (unlike our own /api/billing/checkout flow above) — only
      // the live price ID identifies the plan.
      if (req.method === "GET" && url.pathname === "/v1/subscriptions/sub_founding_link") {
        return Response.json({
          id: "sub_founding_link",
          customer: "cus_founding_link_buyer",
          status: "active",
          current_period_end: 2000000000,
          cancel_at_period_end: false,
          metadata: {},
          items: { data: [{ price: { id: FOUNDING_PRICE_ID, recurring: { interval: "year" } } }] },
        })
      }
      // A same-account Payment Link for an unrelated Stripe product (WALI) — not a Klavity price,
      // no account_id metadata, no klavity tag. Must be ignored, never entitled.
      if (req.method === "GET" && url.pathname === "/v1/subscriptions/sub_wali_999") {
        return Response.json({
          id: "sub_wali_999",
          customer: "cus_wali_buyer",
          status: "active",
          current_period_end: 2000000000,
          cancel_at_period_end: false,
          metadata: {},
          items: { data: [{ price: { id: "price_wali_unrelated", recurring: { interval: "month" } } }] },
        })
      }
      return Response.json({ error: { message: `unhandled ${req.method} ${url.pathname}` } }, { status: 404 })
    },
  })
  STRIPE_BASE = `http://localhost:${stripeServer.port}`

  const port = 47400 + Math.floor(Math.random() * 300)
  BASE = `http://localhost:${port}`
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(83)).toString("base64"),
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      STRIPE_SECRET_KEY: "sk_test_route",
      STRIPE_PUBLISHABLE_KEY: "pk_test_route",
      STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
      STRIPE_API_BASE: STRIPE_BASE,
    },
    stdout: "ignore",
    stderr: "ignore",
  })
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }

  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCOUNT, "Billing Route", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCOUNT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", [PROJECT, ACCOUNT, "Billing Project", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJECT, OWNER, "admin", null, NOW])
})

afterAll(() => {
  appProc?.kill()
  stripeServer?.stop(true)
  raw.close()
  rmDb()
})

function authed(path: string, init: RequestInit = {}) {
  return fetch(`${BASE}${path}`, { ...init, headers: { cookie: `klav_session=${SID}`, ...(init.headers || {}) } })
}

test("billing checkout creates a Stripe session for Pro/Team and rejects Scale self-serve", async () => {
  const scale = await authed("/api/billing/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plan: "scale", interval: "month" }),
  })
  expect(scale.status).toBe(400)

  const r = await authed("/api/billing/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plan: "team", interval: "year" }),
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.url).toBe("https://checkout.stripe.test/session")
})

test("billing portal opens for an account with a Stripe customer", async () => {
  await exec("UPDATE accounts SET stripe_customer_id='cus_test_123' WHERE id=?", [ACCOUNT])
  const r = await authed("/api/billing/portal", { method: "POST" })
  expect(r.status).toBe(200)
  expect((await r.json()).url).toBe("https://billing.stripe.test/portal")
})

test("signed Stripe webhook updates account and project plan state", async () => {
  const event = {
    id: "evt_test_123",
    type: "customer.subscription.updated",
    data: {
      object: {
        id: "sub_test_123",
        customer: "cus_test_123",
        status: "active",
        current_period_end: 2000000000,
        cancel_at_period_end: false,
        metadata: { account_id: ACCOUNT, plan: "team", interval: "year" },
        items: { data: [{ price: { lookup_key: "klavity_team_annual_990", recurring: { interval: "year" } } }] },
      },
    },
  }
  const rawBody = JSON.stringify(event)
  const r = await fetch(`${BASE}/api/billing/webhook`, {
    method: "POST",
    headers: { "stripe-signature": await stripeSig(rawBody, WEBHOOK_SECRET), "content-type": "application/json" },
    body: rawBody,
  })
  expect(r.status).toBe(200)

  const acct = await raw.execute({ sql: "SELECT plan, stripe_subscription_id, billing_status, billing_interval FROM accounts WHERE id=?", args: [ACCOUNT] })
  expect(acct.rows[0]).toMatchObject({ plan: "team", stripe_subscription_id: "sub_test_123", billing_status: "active", billing_interval: "year" })
  const project = await raw.execute({ sql: "SELECT billing_plan, billing_status FROM projects WHERE id=?", args: [PROJECT] })
  expect(project.rows[0]).toMatchObject({ billing_plan: "team", billing_status: "active" })
})

// ── GTM funnel events — KLAVITYKLA-328 ──────────────────────────────────────────────────────────

test("POST /api/billing/checkout inserts a checkout_started funnel row", async () => {
  const r = await authed("/api/billing/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plan: "pro", interval: "month" }),
  })
  expect(r.status).toBe(200)
  await Bun.sleep(300)
  const rows = await raw.execute({
    sql: "SELECT * FROM funnel_events WHERE account_id=? AND event='checkout_started' ORDER BY created_at DESC LIMIT 1",
    args: [ACCOUNT],
  })
  expect(rows.rows.length).toBeGreaterThan(0)
  const row = rows.rows[0] as any
  expect(row.email).toBe(OWNER)
  const props = JSON.parse(row.props_json)
  expect(props.plan).toBe("pro")
  expect(props.interval).toBe("month")
})

test("checkout.session.completed webhook inserts a subscription_created funnel row", async () => {
  const event = {
    id: "evt_checkout_completed",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_funnel",
        subscription: "sub_test_123",
        client_reference_id: ACCOUNT,
        customer: "cus_test_123",
        customer_details: { email: OWNER },
        metadata: { account_id: ACCOUNT, plan: "team", interval: "year" },
      },
    },
  }
  const rawBody = JSON.stringify(event)
  const r = await fetch(`${BASE}/api/billing/webhook`, {
    method: "POST",
    headers: { "stripe-signature": await stripeSig(rawBody, WEBHOOK_SECRET), "content-type": "application/json" },
    body: rawBody,
  })
  expect(r.status).toBe(200)
  await Bun.sleep(300)
  const rows = await raw.execute({
    sql: "SELECT * FROM funnel_events WHERE account_id=? AND event='subscription_created'",
    args: [ACCOUNT],
  })
  expect(rows.rows.length).toBeGreaterThan(0)
  const row = rows.rows[0] as any
  expect(row.email).toBe(OWNER)
  const props = JSON.parse(row.props_json)
  expect(props.plan).toBe("team")
})

test("customer.subscription.deleted webhook inserts a subscription_canceled funnel row", async () => {
  const event = {
    id: "evt_sub_deleted",
    type: "customer.subscription.deleted",
    data: {
      object: {
        id: "sub_test_123",
        customer: "cus_test_123",
        status: "canceled",
        current_period_end: 2000000000,
        cancel_at_period_end: false,
        metadata: { account_id: ACCOUNT, plan: "team", interval: "year" },
        items: { data: [{ price: { lookup_key: "klavity_team_annual_990", recurring: { interval: "year" } } }] },
      },
    },
  }
  const rawBody = JSON.stringify(event)
  const r = await fetch(`${BASE}/api/billing/webhook`, {
    method: "POST",
    headers: { "stripe-signature": await stripeSig(rawBody, WEBHOOK_SECRET), "content-type": "application/json" },
    body: rawBody,
  })
  expect(r.status).toBe(200)
  await Bun.sleep(300)
  const rows = await raw.execute({
    sql: "SELECT * FROM funnel_events WHERE account_id=? AND event='subscription_canceled'",
    args: [ACCOUNT],
  })
  expect(rows.rows.length).toBeGreaterThan(0)
  const row = rows.rows[0] as any
  const props = JSON.parse(row.props_json)
  expect(props.plan).toBe("team")
})

test("past_due Stripe webhook records status but does not grant paid entitlements", async () => {
  const event = {
    id: "evt_test_past_due",
    type: "customer.subscription.updated",
    data: {
      object: {
        id: "sub_test_123",
        customer: "cus_test_123",
        status: "past_due",
        current_period_end: 2000000000,
        cancel_at_period_end: false,
        metadata: { account_id: ACCOUNT, plan: "team", interval: "year" },
        items: { data: [{ price: { lookup_key: "klavity_team_annual_990", recurring: { interval: "year" } } }] },
      },
    },
  }
  const rawBody = JSON.stringify(event)
  const r = await fetch(`${BASE}/api/billing/webhook`, {
    method: "POST",
    headers: { "stripe-signature": await stripeSig(rawBody, WEBHOOK_SECRET), "content-type": "application/json" },
    body: rawBody,
  })
  expect(r.status).toBe(200)

  const acct = await raw.execute({ sql: "SELECT plan, billing_status FROM accounts WHERE id=?", args: [ACCOUNT] })
  expect(acct.rows[0]).toMatchObject({ plan: "free", billing_status: "past_due" })
  const project = await raw.execute({ sql: "SELECT billing_plan, billing_status FROM projects WHERE id=?", args: [PROJECT] })
  expect(project.rows[0]).toMatchObject({ billing_plan: "free", billing_status: "past_due" })
})

// ── KLAVITYKLA-336: invoice events ──────────────────────────────────────────────────────────────

test("invoice.paid refreshes billing_status to active and the period end, keeping the current plan", async () => {
  // Put the account back into an active team subscription (it ended the previous test as
  // plan=free/past_due) — the account's stripe_subscription_id is still sub_test_123 throughout.
  await exec("UPDATE accounts SET plan='team', billing_status='past_due', billing_interval='year', stripe_subscription_id='sub_test_123' WHERE id=?", [ACCOUNT])

  const event = {
    id: "evt_invoice_paid",
    type: "invoice.paid",
    data: {
      object: {
        id: "in_test_paid",
        customer: "cus_test_123",
        subscription: "sub_test_123",
        lines: { data: [{ period: { end: 1999999999 } }] },
      },
    },
  }
  const rawBody = JSON.stringify(event)
  const r = await fetch(`${BASE}/api/billing/webhook`, {
    method: "POST",
    headers: { "stripe-signature": await stripeSig(rawBody, WEBHOOK_SECRET), "content-type": "application/json" },
    body: rawBody,
  })
  expect(r.status).toBe(200)

  const acct = await raw.execute({ sql: "SELECT plan, billing_status, billing_current_period_end FROM accounts WHERE id=?", args: [ACCOUNT] })
  expect(acct.rows[0]).toMatchObject({ plan: "team", billing_status: "active", billing_current_period_end: 1999999999000 })
})

test("invoice.payment_failed sets billing_status to past_due WITHOUT downgrading the plan", async () => {
  await exec("UPDATE accounts SET plan='team', billing_status='active', stripe_subscription_id='sub_test_123' WHERE id=?", [ACCOUNT])

  const event = {
    id: "evt_invoice_failed",
    type: "invoice.payment_failed",
    data: {
      object: {
        id: "in_test_failed",
        customer: "cus_test_123",
        subscription: "sub_test_123",
      },
    },
  }
  const rawBody = JSON.stringify(event)
  const r = await fetch(`${BASE}/api/billing/webhook`, {
    method: "POST",
    headers: { "stripe-signature": await stripeSig(rawBody, WEBHOOK_SECRET), "content-type": "application/json" },
    body: rawBody,
  })
  expect(r.status).toBe(200)

  const acct = await raw.execute({ sql: "SELECT plan, billing_status FROM accounts WHERE id=?", args: [ACCOUNT] })
  // Plan must NOT be reset to free — Stripe retries payment_failed invoices; only an eventual
  // customer.subscription.deleted/updated(status=canceled) should ever downgrade the plan.
  expect(acct.rows[0]).toMatchObject({ plan: "team", billing_status: "past_due" })
})

// ── KLAVITYKLA-336: hosted Payment-Link provisioning ────────────────────────────────────────────

test("a klavity Payment-Link checkout.session.completed with NO account_id but a known email provisions and entitles a brand-new account", async () => {
  const preExisting = await raw.execute({ sql: "SELECT id FROM accounts WHERE owner_email=?", args: [LINK_BUYER_EMAIL] })
  expect(preExisting.rows.length).toBe(0)

  const event = {
    id: "evt_founding_link",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_founding_link",
        subscription: "sub_founding_link",
        customer: "cus_founding_link_buyer",
        // NO account_id / client_reference_id — this is what a hosted Payment Link session looks like.
        customer_details: { email: LINK_BUYER_EMAIL },
        metadata: {},
      },
    },
  }
  const rawBody = JSON.stringify(event)
  const r = await fetch(`${BASE}/api/billing/webhook`, {
    method: "POST",
    headers: { "stripe-signature": await stripeSig(rawBody, WEBHOOK_SECRET), "content-type": "application/json" },
    body: rawBody,
  })
  expect(r.status).toBe(200)

  const acct = await raw.execute({ sql: "SELECT id, plan, billing_status, billing_interval, stripe_customer_id, stripe_subscription_id FROM accounts WHERE owner_email=?", args: [LINK_BUYER_EMAIL] })
  expect(acct.rows.length).toBe(1)
  expect(acct.rows[0]).toMatchObject({
    plan: "founding",
    billing_status: "active",
    billing_interval: "year",
    stripe_customer_id: "cus_founding_link_buyer",
    stripe_subscription_id: "sub_founding_link",
  })

  // A default project must exist too (ensureAccount's normal side effect) — a cold Payment-Link
  // buyer lands on a working dashboard, not an empty account with no project.
  const newAccountId = String((acct.rows[0] as any).id)
  const projects = await raw.execute({ sql: "SELECT id FROM projects WHERE account_id=?", args: [newAccountId] })
  expect(projects.rows.length).toBeGreaterThan(0)
})

test("a non-klavity checkout.session.completed (no account_id, unmappable price) is ignored: 200, no throw, no account created", async () => {
  const event = {
    id: "evt_wali_session",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_wali_other_product",
        subscription: "sub_wali_999",
        customer: "cus_wali_buyer",
        customer_details: { email: WALI_BUYER_EMAIL },
        metadata: {},
      },
    },
  }
  const rawBody = JSON.stringify(event)
  const r = await fetch(`${BASE}/api/billing/webhook`, {
    method: "POST",
    headers: { "stripe-signature": await stripeSig(rawBody, WEBHOOK_SECRET), "content-type": "application/json" },
    body: rawBody,
  })
  // Must 200 (not throw/500) so Stripe never hammers retries on a session we can't/shouldn't map.
  expect(r.status).toBe(200)
  expect(await r.json()).toMatchObject({ received: true })

  const acct = await raw.execute({ sql: "SELECT id FROM accounts WHERE owner_email=?", args: [WALI_BUYER_EMAIL] })
  expect(acct.rows.length).toBe(0)
})

// ── GTM round 2: Founding Team buyable self-serve ───────────────────────────────────────────────

test("POST /api/billing/checkout accepts plan=founding and coerces the interval to year", async () => {
  // Deliberately send interval:"month" — founding is annual-only, so the server must force "year"
  // rather than reject or fall through to a missing catalog entry.
  const r = await authed("/api/billing/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plan: "founding", interval: "month" }),
  })
  // NOT the 400 "Choose ..." plan rejection — the mock Stripe backend serves the session fine.
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.url).toBe("https://checkout.stripe.test/session")

  // The coerced interval is observable via the checkout_started funnel row.
  await Bun.sleep(300)
  const rows = await raw.execute({
    sql: "SELECT props_json FROM funnel_events WHERE account_id=? AND event='checkout_started' ORDER BY created_at DESC LIMIT 1",
    args: [ACCOUNT],
  })
  expect(rows.rows.length).toBeGreaterThan(0)
  const props = JSON.parse(String((rows.rows[0] as any).props_json))
  expect(props.plan).toBe("founding")
  expect(props.interval).toBe("year")
})

test("POST /api/billing/checkout still rejects unknown plans, with Founding in the copy", async () => {
  const r = await authed("/api/billing/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ plan: "basic", interval: "month" }),
  })
  expect(r.status).toBe(400)
  expect((await r.json()).error).toBe("Choose Pro, Team, Agency, or Founding.")
})

// ── Usage meters route — KLAVITYKLA-309 ─────────────────────────────────────────────────────────
//
// The billing drawer renders its usage bars entirely from this single call, so the route must
// return BOTH the resolved plan and the per-metric meters — and those meters must match what
// buildUsageMeters() produces for that plan (the drawer does no limit math of its own).

test("GET /api/account/usage returns the plan plus per-metric usage meters", async () => {
  const period = new Date().toISOString().slice(0, 7)
  const now = Date.now()
  await exec(
    "INSERT OR REPLACE INTO usage_meters (account_id, project_id, period, metric, count, first_at, last_at) VALUES (?,?,?,?,?,?,?)",
    [ACCOUNT, PROJECT, period, "sim_review", 7, now, now],
  )
  await exec(
    "INSERT OR REPLACE INTO usage_meters (account_id, project_id, period, metric, count, first_at, last_at) VALUES (?,?,?,?,?,?,?)",
    [ACCOUNT, PROJECT, period, "autosim_walk", 2, now, now],
  )

  const r = await authed("/api/account/usage")
  expect(r.status).toBe(200)
  const body = await r.json()

  expect(body.accountId).toBe(ACCOUNT)
  expect(body.period).toBe(period)
  // Plan is present and is a real plan slug (the webhook test above moved this account to "team").
  expect(typeof body.plan).toBe("string")
  expect(Object.keys(PLAN_QUOTAS)).toContain(normalizePlan(body.plan))

  expect(Array.isArray(body.meters)).toBe(true)
  expect(body.meters.map((m: any) => m.key).sort()).toEqual(["autosim", "sims"])
  expect(body.usage.sim_review).toBe(7)
  expect(body.usage.autosim_walk).toBe(2)

  // The route's meters must be exactly buildUsageMeters(plan, usage) — no drift between the
  // server response and the shared meter builder the threshold fix lives in.
  expect(body.meters).toEqual(buildUsageMeters(body.plan, body.usage) as any)

  const sims = body.meters.find((m: any) => m.key === "sims")
  expect(sims.used).toBe(7)
  expect(sims.metric).toBe("sim_review")
  expect(sims.overLimit).toBe(false)
})

test("GET /api/account/usage flags a meter as overLimit once usage reaches the plan allowance", async () => {
  const period = new Date().toISOString().slice(0, 7)
  const now = Date.now()
  const plan = normalizePlan(String((await raw.execute({ sql: "SELECT plan FROM accounts WHERE id=?", args: [ACCOUNT] })).rows[0]?.plan ?? "free"))
  const limit = PLAN_QUOTAS[plan].simReactionsMonthly
  expect(limit).not.toBeNull() // this account is on a metered plan

  // Exactly AT the allowance — enforcement (checkQuota) degrades here, so the meter must say so.
  await exec(
    "INSERT OR REPLACE INTO usage_meters (account_id, project_id, period, metric, count, first_at, last_at) VALUES (?,?,?,?,?,?,?)",
    [ACCOUNT, PROJECT, period, "sim_review", limit, now, now],
  )

  const r = await authed("/api/account/usage")
  expect(r.status).toBe(200)
  const sims = (await r.json()).meters.find((m: any) => m.key === "sims")
  expect(sims.used).toBe(limit)
  expect(sims.pct).toBe(100)
  expect(sims.overLimit).toBe(true)
})
