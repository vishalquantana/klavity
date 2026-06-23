// ext-allowlist-autoactivate /api/extension/match — token lifecycle edge cases.
//
// The main test file (server.ext-match.test.ts) covers auth-required, non-member
// isolation, F5 bound-project constraint, and allowlist matching. This file adds
// the token-lifecycle edge cases that are not covered there:
//
//   A. Expired token  (expires_at < now)  → bearerEmail returns null → 401
//   B. Revoked token  (revoked = 1)       → bearerEmail returns null → 401
//   C. Session cookie auth (cookie-based) → /api/extension/match accepts it
//
// All three map to the getExtensionTokenInfo() path in db.ts which gates bearerEmail().
// Not testing these leaves a security-relevant gap: a stolen token that should be
// invalid could potentially be accepted if the revoked/expired check were removed.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB = join(tmpdir(), `klav-extmatch-tok-${ts}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(13)).toString("base64")

const raw = createClient({ url: "file:" + DB })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

// ── Schema ────────────────────────────────────────────────────────────────────
for (const ddl of [
  `CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`,
  `CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT NOT NULL, domain TEXT, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(account_id, email))`,
  `CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', url_patterns_json TEXT, review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER DEFAULT 200, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL, invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`,
  `CREATE TABLE IF NOT EXISTS monitored_urls (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, url_pattern TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, UNIQUE(project_id, url_pattern))`,
  `CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT, created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0)`,
]) { await exec(ddl) }

// ── Fixtures ──────────────────────────────────────────────────────────────────
const NOW = Date.now()
const USER = `user-tok-${ts}@test.local`
const ACCT = `acct_tok_${ts}`
const PROJ = `proj_tok_${ts}`
const SID  = `sess_tok_${ts}`   // valid session for cookie auth
const MONITORED = "https://app.example.com/dashboard"

// Tokens (stored as plaintext; the dual-read fallback in getExtensionTokenInfo
// checks the raw value when the hash-lookup returns nothing)
const TOK_VALID   = `ext_valid_tok_${ts}`
const TOK_EXPIRED = `ext_expired_tok_${ts}`
const TOK_REVOKED = `ext_revoked_tok_${ts}`

await exec(`INSERT INTO users VALUES (?, ?, ?)`, [USER, "Tok Test User", NOW])
await exec(`INSERT INTO sessions VALUES (?, ?, ?, ?)`, [SID, USER, NOW, NOW + 86_400_000])
await exec(`INSERT INTO accounts VALUES (?, ?, ?, ?, ?)`, [ACCT, "Tok Test Workspace", USER, null, NOW])
await exec(`INSERT INTO account_members VALUES (?, ?, ?, ?, ?)`, [`am_tok_${ts}`, ACCT, USER, "owner", NOW])
await exec(`INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJ, ACCT, "Tok Test Project", "active", null, "auto", 200, "named", NOW, NOW])
await exec(`INSERT INTO project_members VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_tok_${ts}`, PROJ, USER, "admin", null, NOW])
await exec(`INSERT INTO monitored_urls VALUES (?, ?, ?, ?, ?)`,
  [`mu_tok_${ts}`, PROJ, "app.example.com", 1, NOW])

// Three tokens with different lifecycle states:
//   valid   — no expiry, not revoked
//   expired — expires_at in the past (10 min ago)
//   revoked — revoked=1
await exec(`INSERT INTO extension_tokens VALUES (?, ?, ?, ?, ?, ?)`,
  [TOK_VALID,   USER, null, NOW, null,       0])  // valid
await exec(`INSERT INTO extension_tokens VALUES (?, ?, ?, ?, ?, ?)`,
  [TOK_EXPIRED, USER, null, NOW, NOW - 600_000, 0])  // expired 10 min ago
await exec(`INSERT INTO extension_tokens VALUES (?, ?, ?, ?, ?, ?)`,
  [TOK_REVOKED, USER, null, NOW, null,       1])  // revoked

// ── Server subprocess ─────────────────────────────────────────────────────────
let srvProc: ReturnType<typeof Bun.spawn>
let BASE: string
let MATCH_URL: string

beforeAll(async () => {
  const port = 33500 + Math.floor(Math.random() * 400)
  BASE = `http://localhost:${port}`
  MATCH_URL = `${BASE}/api/extension/match?url=${encodeURIComponent(MONITORED)}`
  srvProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
    },
    stdout: "ignore",
    stderr: "ignore",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
}, 15_000)

afterAll(() => { srvProc?.kill(); raw.close() })

const bearer = (tok: string) => ({ authorization: `Bearer ${tok}` })

// ════════════════════════════════════════════════════════════════════════════
// A. Expired token
// ════════════════════════════════════════════════════════════════════════════

test("A1: expired token → 401 (getExtensionTokenInfo checks expires_at < now)", async () => {
  const r = await fetch(MATCH_URL, { headers: bearer(TOK_EXPIRED) })
  expect(r.status).toBe(401)
}, 10_000)

test("A2: expired token returns a non-200 even for an unauthenticated URL path check", async () => {
  const r = await fetch(
    `${BASE}/api/extension/match?url=${encodeURIComponent("https://app.example.com/")}`,
    { headers: bearer(TOK_EXPIRED) },
  )
  // Must be 401 — expired token is indistinguishable from no token
  expect(r.status).toBe(401)
}, 10_000)

// ════════════════════════════════════════════════════════════════════════════
// B. Revoked token
// ════════════════════════════════════════════════════════════════════════════

test("B1: revoked token → 401 (getExtensionTokenInfo checks revoked = 1)", async () => {
  const r = await fetch(MATCH_URL, { headers: bearer(TOK_REVOKED) })
  expect(r.status).toBe(401)
}, 10_000)

test("B2: revoked token does not disclose whether the URL is monitored", async () => {
  // A revoked token should not get a 200 with project info — same 401 as above.
  const r = await fetch(MATCH_URL, { headers: bearer(TOK_REVOKED) })
  expect(r.status).not.toBe(200)
  // Safety: the response body must NOT contain project IDs or names
  const text = await r.text().catch(() => "")
  expect(text).not.toContain(PROJ)
  expect(text).not.toContain("Tok Test Project")
}, 10_000)

// ════════════════════════════════════════════════════════════════════════════
// C. Valid token smoke-test (regression guard — ensures A/B don't regress the happy path)
// ════════════════════════════════════════════════════════════════════════════

test("C1: valid (non-expired, non-revoked) token → 200 and returns matching project", async () => {
  const r = await fetch(MATCH_URL, { headers: bearer(TOK_VALID) })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(Array.isArray(body.projects)).toBe(true)
  const ids = body.projects.map((p: any) => p.projectId)
  expect(ids).toContain(PROJ)
}, 10_000)

// ════════════════════════════════════════════════════════════════════════════
// D. Session cookie auth on /api/extension/match
//    The handler resolves identity via bearerEmail(req) || sessionEmail(req).
//    The existing server.ext-match.test.ts only uses Bearer tokens; this
//    verifies the cookie fallback path also works.
// ════════════════════════════════════════════════════════════════════════════

test("D1: session cookie (no Bearer) is accepted and returns matching projects", async () => {
  const r = await fetch(MATCH_URL, {
    headers: { cookie: `klav_session=${SID}` },
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(Array.isArray(body.projects)).toBe(true)
  expect(body.projects.map((p: any) => p.projectId)).toContain(PROJ)
}, 10_000)

test("D2: no Bearer AND no cookie → 401", async () => {
  const r = await fetch(MATCH_URL)
  expect(r.status).toBe(401)
}, 10_000)

// ════════════════════════════════════════════════════════════════════════════
// E. Disabled allowlist URL — should NOT match even for a valid token
//    matchMonitored uses enabledOnly:true; adding an entry with enabled=0
//    and checking it doesn't appear in /api/extension/match results.
// ════════════════════════════════════════════════════════════════════════════

test("E1: disabled monitored URL (enabled=0) does NOT match via /api/extension/match", async () => {
  // Seed a disabled URL for a second project the user is a member of
  const PROJ2 = `proj_tok2_${ts}`
  const DISABLED_URL = "https://disabled.example.com/"
  await exec(
    `INSERT INTO projects (id, account_id, name, status, url_patterns_json, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PROJ2, ACCT, "Disabled URL Project", "active", null, "auto", 200, "named", NOW + 1, NOW + 1],
  )
  await exec(`INSERT INTO project_members VALUES (?, ?, ?, ?, ?, ?)`,
    [`pm_tok2_${ts}`, PROJ2, USER, "admin", null, NOW])
  await exec(`INSERT INTO monitored_urls VALUES (?, ?, ?, ?, ?)`,
    [`mu_tok_dis_${ts}`, PROJ2, "disabled.example.com", 0, NOW])   // ← enabled=0

  const r = await fetch(
    `${BASE}/api/extension/match?url=${encodeURIComponent(DISABLED_URL)}`,
    { headers: bearer(TOK_VALID) },
  )
  expect(r.status).toBe(200)
  const body = await r.json()
  // The disabled URL must not produce any match
  expect(body.projects).toEqual([])
}, 10_000)
