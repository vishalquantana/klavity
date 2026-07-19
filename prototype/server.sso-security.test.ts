// KLAVITYKLA-9 — SSO authentication-bypass fixes, at the HTTP layer.
//
// The shipped OIDC feature let ANY account owner set allowedDomain to a domain they did not
// own. Because /auth/sso/callback mints a GLOBAL, email-keyed session for whatever email the
// (account-controlled) IdP asserts, that was a full account-takeover primitive: configure your
// own IdP with allowedDomain=victim.com, assert email=ceo@victim.com, get a session as them.
//
// This suite pins the two HTTP-level defences:
//   1. KLAV_SSO_ENABLED kill switch — every SSO route 404s unless explicitly enabled.
//   2. Domain-ownership gate — an allowedDomain that has not been DNS-TXT verified cannot
//      start a login, and public mailbox domains cannot be configured at all.
//
// Hermetic: temp DB file + real server subprocesses, seeded via a raw client (never touches the
// shared db module singleton). No network to any real IdP.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-ssosec-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_oidc_configs (
   account_id TEXT PRIMARY KEY, issuer TEXT NOT NULL, client_id TEXT NOT NULL,
   client_secret_enc TEXT NOT NULL, allowed_domain TEXT NOT NULL,
   domain_verify_token TEXT, domain_verified_at INTEGER,
   created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sso_states (state TEXT PRIMARY KEY, account_id TEXT NOT NULL, nonce TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)

const OWNER_EMAIL = `owner-${ts}@test.local`
const OWNER_SID = `sess_owner_${ts}`
const ACCOUNT_ID = `acct_${ts}`
const PROJECT_ID = `proj_${ACCOUNT_ID}`
const NOW = Date.now()

// The domain the attacker wants to hijack. They do NOT control DNS for it.
const VICTIM_DOMAIN = "victim-corp.example"

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OWNER_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "Attacker Workspace", OWNER_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_${ACCOUNT_ID}`, ACCOUNT_ID, OWNER_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)`, [PROJECT_ID, ACCOUNT_ID, "Default Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?,?,?,?,?,?)`, [`pm_${ts}`, PROJECT_ID, OWNER_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [OWNER_SID, OWNER_EMAIL, NOW, NOW + 86400_000])

// An UNVERIFIED config claiming the victim's domain — exactly the state the old code happily
// honoured. domain_verified_at IS NULL, so nothing may be granted from it.
await rawExec(
  `INSERT INTO account_oidc_configs (account_id, issuer, client_id, client_secret_enc, allowed_domain, domain_verify_token, domain_verified_at, created_by, created_at, updated_at)
   VALUES (?,?,?,?,?,?,NULL,?,?,?)`,
  [ACCOUNT_ID, "https://idp.attacker.example", "attacker-client", "enc:dummy", VICTIM_DOMAIN, "t".repeat(32), OWNER_EMAIL, NOW, NOW],
)

// ── Two servers: one with the kill switch OFF (default), one with it ON ──────

let procOff: ReturnType<typeof Bun.spawn>
let procOn: ReturnType<typeof Bun.spawn>
let BASE_OFF = ""
let BASE_ON = ""

function spawnServer(port: number, extraEnv: Record<string, string>) {
  return Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: `http://localhost:${port}`,
      KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
      ...extraEnv,
    },
    stdout: "pipe",
    stderr: "pipe",
  })
}

async function waitReady(base: string) {
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${base}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) return
    await Bun.sleep(150)
  }
}

beforeAll(async () => {
  // Private port band: every other server-spawning suite lives in 30000–39400, and these two
  // processes hold their ports for the whole suite run, so overlapping would kill other tests'
  // servers. 39500–39799 is unclaimed.
  const portOff = 39500 + Math.floor(Math.random() * 100)
  const portOn = 39650 + Math.floor(Math.random() * 100)
  BASE_OFF = `http://localhost:${portOff}`
  BASE_ON = `http://localhost:${portOn}`
  // No KLAV_SSO_ENABLED at all → feature must be OFF by default.
  procOff = spawnServer(portOff, {})
  procOn = spawnServer(portOn, { KLAV_SSO_ENABLED: "1" })
  await waitReady(BASE_OFF)
  await waitReady(BASE_ON)
})

afterAll(() => {
  procOff?.kill()
  procOn?.kill()
  rawClient.close()
})

const authed = { cookie: `klav_session=${OWNER_SID}` }

// ── 1. Kill switch ───────────────────────────────────────────────────────────

test("SECURITY: with KLAV_SSO_ENABLED unset, every SSO route 404s", async () => {
  const cases: [string, string][] = [
    ["GET", "/api/sso/config"],
    ["POST", "/api/sso/config"],
    ["DELETE", "/api/sso/config"],
    ["POST", "/api/sso/verify-domain"],
    ["GET", `/auth/sso/login?domain=${VICTIM_DOMAIN}`],
    ["GET", "/auth/sso/callback?code=abc&state=xyz"],
  ]
  for (const [method, p] of cases) {
    const res = await fetch(`${BASE_OFF}${p}`, {
      method,
      headers: { ...authed, "Content-Type": "application/json" },
      body: method === "GET" ? undefined : "{}",
      redirect: "manual",
    })
    expect(res.status, `${method} ${p} should 404 when SSO is disabled`).toBe(404)
  }
})

test("the kill switch does not break unrelated routes", async () => {
  const res = await fetch(`${BASE_OFF}/favicon.svg`)
  expect(res.status).toBeLessThan(400)
})

// ── 2. Domain-ownership gate (server enabled) ────────────────────────────────

test("SECURITY: login for an UNVERIFIED allowedDomain is refused (the takeover attempt)", async () => {
  // The attacker's config for victim-corp.example exists but was never DNS-verified.
  // Before the fix this redirected to the attacker's IdP and ended in a victim session.
  const res = await fetch(`${BASE_ON}/auth/sso/login?domain=${VICTIM_DOMAIN}`, { redirect: "manual" })
  expect(res.status).toBe(302)
  const loc = res.headers.get("location") || ""
  expect(loc).toContain("/login?error=")
  expect(loc).toContain("sso_not_configured")
  // Crucially: we never got redirected to the attacker's IdP.
  expect(loc).not.toContain("idp.attacker.example")
})

test("SECURITY: login for a PUBLIC mailbox domain is refused outright", async () => {
  for (const d of ["gmail.com", "outlook.com", "yahoo.com", "proton.me"]) {
    const res = await fetch(`${BASE_ON}/auth/sso/login?domain=${d}`, { redirect: "manual" })
    expect(res.status).toBe(302)
    expect(res.headers.get("location") || "").toContain("sso_domain_not_eligible")
  }
})

test("SECURITY: saving a config with a public mailbox domain is rejected with 400", async () => {
  const res = await fetch(`${BASE_ON}/api/sso/config`, {
    method: "POST",
    headers: { ...authed, "Content-Type": "application/json" },
    body: JSON.stringify({
      issuer: "https://idp.attacker.example",
      clientId: "c", clientSecret: "s", allowedDomain: "gmail.com",
    }),
  })
  expect(res.status).toBe(400)
  const body = await res.json()
  // Rejected on the domain policy, NOT merely because discovery was unreachable.
  expect(body.error).toMatch(/Public email providers/)
})

test("SECURITY: saving a config with a single-label domain is rejected with 400", async () => {
  const res = await fetch(`${BASE_ON}/api/sso/config`, {
    method: "POST",
    headers: { ...authed, "Content-Type": "application/json" },
    body: JSON.stringify({
      issuer: "https://idp.attacker.example",
      clientId: "c", clientSecret: "s", allowedDomain: "localhost",
    }),
  })
  expect(res.status).toBe(400)
  expect((await res.json()).error).toMatch(/valid domain name/)
})

test("GET /api/sso/config reports the domain as unverified and returns TXT instructions", async () => {
  const res = await fetch(`${BASE_ON}/api/sso/config`, { headers: authed })
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(body.enabled).toBe(true)
  expect(body.allowedDomain).toBe(VICTIM_DOMAIN)
  expect(body.domainVerified).toBe(false)
  expect(body.domainVerification?.recordType).toBe("TXT")
  expect(body.domainVerification?.value).toContain("klavity-sso-verify=")
})

test("SECURITY: verify-domain refuses when the TXT record is absent", async () => {
  // No DNS record exists for victim-corp.example, so ownership cannot be proven.
  const res = await fetch(`${BASE_ON}/api/sso/verify-domain`, {
    method: "POST",
    headers: { ...authed, "Content-Type": "application/json" },
    body: "{}",
  })
  expect(res.status).toBe(400)
  const body = await res.json()
  expect(body.domainVerified).toBe(false)

  // And the DB flag stayed NULL.
  const r = await rawClient.execute({
    sql: "SELECT domain_verified_at FROM account_oidc_configs WHERE account_id=?",
    args: [ACCOUNT_ID],
  })
  expect((r.rows[0] as any).domain_verified_at).toBeNull()
})

// ── 3. Past the gate: a VERIFIED domain behaves differently ──────────────────

test("a VERIFIED domain gets past the ownership gate (reaches the IdP step)", async () => {
  // Flip the verified flag as the verify endpoint would after a successful DNS check.
  await rawExec("UPDATE account_oidc_configs SET domain_verified_at=? WHERE account_id=?", [Date.now(), ACCOUNT_ID])

  const res = await fetch(`${BASE_ON}/auth/sso/login?domain=${VICTIM_DOMAIN}`, { redirect: "manual" })
  expect(res.status).toBe(302)
  const loc = res.headers.get("location") || ""
  // The issuer is unreachable in tests, so we land on sso_idp_unreachable — the point is that
  // it is NO LONGER sso_not_configured, proving the ownership gate was the thing blocking it.
  expect(loc).toContain("sso_idp_unreachable")
  expect(loc).not.toContain("sso_not_configured")

  // Restore the unverified state for isolation.
  await rawExec("UPDATE account_oidc_configs SET domain_verified_at=NULL WHERE account_id=?", [ACCOUNT_ID])
})

// ── 4. Login-CSRF: callback requires the pre-auth state cookie ───────────────

test("SECURITY: callback rejects a state with no matching pre-auth cookie (login CSRF)", async () => {
  const state = `st_${ts}`
  await rawExec(
    "INSERT INTO sso_states (state, account_id, nonce, created_at, expires_at) VALUES (?,?,?,?,?)",
    [state, ACCOUNT_ID, "nonce-1", Date.now(), Date.now() + 600_000],
  )
  const res = await fetch(`${BASE_ON}/auth/sso/callback?code=abc&state=${state}`, { redirect: "manual" })
  expect(res.status).toBe(302)
  expect(res.headers.get("location") || "").toContain("sso_state_mismatch")
})
