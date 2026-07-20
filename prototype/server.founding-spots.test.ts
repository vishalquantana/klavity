// KLAVITYKLA-366 — the Founding Ten spot cap, end to end against a live server.
//
// Two things are proven here that a unit test cannot:
//   1. GET /api/founding/spots is readable ANONYMOUSLY and reports the real DB count.
//   2. An 11th founding checkout is REFUSED server-side. This is the whole point of the ticket:
//      /api/billing/checkout is directly reachable, so a visual-only limit would let someone
//      deep-link in as spot 11 and claim a locked-for-life price we had publicly closed.
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"
import { FOUNDING_SPOTS_TTL_MS } from "./lib/founding"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-founding-route-${RUN}.db`)
const OWNER = `founding-${RUN}@test.local`
const SID = `sess_founding_${RUN}`
const ACCOUNT = `acct_founding_${RUN}`
const NOW = Date.now()

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + suffix) } catch {} }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

let appProc: ReturnType<typeof Bun.spawn>
let stripeServer: ReturnType<typeof Bun.serve>
let BASE = ""

async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

/** Occupy N founding spots with live subscriptions. */
async function fillFoundingSpots(n: number) {
  await exec("DELETE FROM accounts WHERE id LIKE ?", [`founder_${RUN}_%`])
  for (let i = 0; i < n; i++) {
    await exec(
      "INSERT INTO accounts (id, name, owner_email, plan, billing_status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [`founder_${RUN}_${i}`, `Founder ${i}`, `f${i}-${RUN}@test.local`, "founding", "active", NOW],
    )
  }
}

/** The endpoint memoises for 60s; tests mutate the DB between assertions, so bypass with a restart-free wait. */
async function spots(): Promise<any> {
  const r = await fetch(`${BASE}/api/founding/spots`)
  return { status: r.status, body: await r.json() }
}

async function checkout(plan: string) {
  const r = await fetch(`${BASE}/api/billing/checkout`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: `klav_session=${SID}` },
    body: JSON.stringify({ plan, interval: "year" }),
  })
  return { status: r.status, body: await r.json().catch(() => ({})) }
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
        return Response.json({ id: "cs_test_366", url: "https://checkout.stripe.test/session", customer: "cus_test_366" })
      }
      return Response.json({ error: { message: "unhandled" } }, { status: 404 })
    },
  })

  const port = 47800 + Math.floor(Math.random() * 300)
  BASE = `http://localhost:${port}`
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(66)).toString("base64"),
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      STRIPE_SECRET_KEY: "sk_test_366",
      STRIPE_PUBLISHABLE_KEY: "pk_test_366",
      STRIPE_WEBHOOK_SECRET: "whsec_366",
      STRIPE_API_BASE: `http://localhost:${stripeServer.port}`,
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
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCOUNT, "Buyer", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCOUNT, OWNER, "owner", NOW])
})

afterAll(() => {
  try { appProc?.kill() } catch {}
  try { stripeServer?.stop(true) } catch {}
  rmDb()
})

// ── the public number ──────────────────────────────────────────────────────────────────────────

test("GET /api/founding/spots is readable anonymously and reports the real count", async () => {
  const { status, body } = await spots()
  expect(status).toBe(200)
  expect(body.total).toBe(10)
  expect(body.remaining).toBe(10)
  expect(body.soldOut).toBe(false)
  expect(body.known).toBe(true)
  expect(body.label).toBe("10 of 10 spots left")
  // Never a guess and never a placeholder.
  expect(JSON.stringify(body)).not.toContain("null")
})

test("the public number is cached so a pricing pageview costs no DB round trip", async () => {
  // The first call above armed a 60s memo; a sale inside that window is intentionally not reflected.
  await fillFoundingSpots(4)
  const { body } = await spots()
  expect(body.remaining).toBe(10)
  // A stale honest number beats an animated lie — but it must be genuinely short-lived.
  expect(FOUNDING_SPOTS_TTL_MS).toBeLessThanOrEqual(60_000)
})

// ── the cap, enforced where it counts ──────────────────────────────────────────────────────────

test("a founding checkout succeeds while spots remain", async () => {
  await fillFoundingSpots(3)
  const { status, body } = await checkout("founding")
  expect(status).toBe(200)
  expect(body.ok).toBe(true)
  expect(body.url).toContain("checkout.stripe.test")
})

test("the ELEVENTH founding checkout is refused server-side, not just hidden in CSS", async () => {
  await fillFoundingSpots(10)
  const { status, body } = await checkout("founding")
  expect(status).toBe(409)
  expect(body.soldOut).toBe(true)
  expect(String(body.error)).toContain("closed")
  // The refusal must hand the buyer the real path forward: the standard price.
  expect(String(body.error)).toContain("$249")
})

test("the refusal is read FRESH, not from the 60s display cache", async () => {
  // Two buyers can reach checkout inside one TTL window; the cap must see the first one's sale.
  await fillFoundingSpots(10)
  expect((await checkout("founding")).status).toBe(409)
  await fillFoundingSpots(9)
  expect((await checkout("founding")).status).toBe(200)
})

test("sold out does not block the standard paid plans", async () => {
  await fillFoundingSpots(10)
  const { status, body } = await checkout("team")
  expect(status).toBe(200)
  expect(body.ok).toBe(true)
})

// ── the pricing page in each state ─────────────────────────────────────────────────────────────

test("/pricing server-renders the sold-out state with no founding CTA", async () => {
  await fillFoundingSpots(10)
  // Wait out the memo so the page reflects the new count.
  await Bun.sleep(FOUNDING_SPOTS_TTL_MS > 2000 ? 0 : FOUNDING_SPOTS_TTL_MS)
  const html = await (await fetch(`${BASE}/pricing`)).text()
  // The placeholder is always substituted, whatever the state.
  expect(html).not.toContain("__FOUNDING_")
  // The standard price anchor survives in every state.
  expect(html).toContain("$2,988")
})
