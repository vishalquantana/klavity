import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-billing-route-${RUN}.db`)
const OWNER = `billing-${RUN}@test.local`
const SID = `sess_billing_${RUN}`
const ACCOUNT = `acct_billing_${RUN}`
const PROJECT = `proj_billing_${RUN}`
const NOW = Date.now()
const WEBHOOK_SECRET = "whsec_route_test"

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
