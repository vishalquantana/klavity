// Regression guard for fix(KLAVITYKLA-717): "GET /api/dashboard must 401 an unresolved session,
// not silently 302→/login (which fetch follows into a 200 HTML page) nor 200-empty."
//
// Root cause: the SPA (dashboard.html) polls /api/dashboard via fetch() and only self-heals on a
// 401 (refreshAll: `if (r.status === 401) location.href="/login"`). For a null/expired session the
// generic GET gate redirected to /login (302); fetch() silently follows the redirect into a 200
// HTML page, so the SPA never sees an auth failure → paints an EMPTY switcher + "Couldn't load your
// project" that only a full reload/re-login fixes.
//
// Fix: /api/dashboard returns a real `{error:"unauthenticated"}` 401 for a falsy session — but ONLY
// for a falsy session. An authenticated user with ZERO projects must STILL get 200 {projects:[]}.
//
// NEGATIVE CONTROL: T1 asserts 401 for a null session. Against the UNFIXED server the same request
// returns a 302 redirect to /login (status 3xx, not 401) → T1 fails. That proves the test exercises
// the real code path and would not pass without the guard. T2 is the over-rotation guard: an authed
// user with zero projects still gets 200.
//
// Pattern: hermetic subprocess + temp DB, same as server.stuck-loading.test.ts.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-dash401-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(55)).toString("base64")

const rawClient = createClient({ url: "file:" + DB_FILE })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function raw(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema (matches the tables the /api/dashboard path touches).
for (const ddl of [
  `CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`,
  `CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`,
  `CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`,
  `CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS review_counts (project_id TEXT NOT NULL, day TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (project_id, day))`,
  `CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`,
]) { await raw(ddl) }

// ── Fixtures ──────────────────────────────────────────────────────────────────
// User A: has a project (regression: normal 200 with projects).
const OWNER_A = `owner-a-${ts}@test.local`
const SESS_A  = `sess_a_${ts}`
const ACCT_A  = `acct_a_${ts}`
const PROJ_A  = `proj_a_${ts}`
// User B: authenticated but owns ZERO projects (over-rotation guard: must still 200).
const OWNER_B = `owner-b-${ts}@test.local`
const SESS_B  = `sess_b_${ts}`
const NOW = Date.now()

await raw(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OWNER_A, NOW])
await raw(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCT_A, "Dash401 A", OWNER_A, NOW])
await raw(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_a_${ts}`, ACCT_A, OWNER_A, "owner", NOW])
await raw(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJ_A, ACCT_A, "Dash401 Project A", "active", "auto", 200, "named", NOW, NOW])
await raw(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_a_${ts}`, PROJ_A, OWNER_A, "admin", null, NOW])
await raw(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [SESS_A, OWNER_A, NOW, NOW + 86_400_000])

// User B — a valid session, valid user, but no account/project membership at all.
await raw(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OWNER_B, NOW])
await raw(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [SESS_B, OWNER_B, NOW, NOW + 86_400_000])

// ── Server subprocess ─────────────────────────────────────────────────────────
let srvProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  const port = 44950 + Math.floor(Math.random() * 200)
  BASE = `http://localhost:${port}`
  srvProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch {}
    await Bun.sleep(150)
  }
}, 15_000)

afterAll(() => { srvProc?.kill(); rawClient.close() })

// ════════════════════════════════════════════════════════════════════════════
// T1 — NEGATIVE CONTROL: null/expired session → 401 JSON (NOT a 302 redirect).
// Against the unfixed server this request 302-redirects to /login → status 3xx,
// not 401 → this test fails, proving it reproduces the real bug path.
// ════════════════════════════════════════════════════════════════════════════
test("T1: GET /api/dashboard with NO session → 401 JSON (never a redirect / 200)", async () => {
  // redirect:"manual" so a stray 302 is observed verbatim instead of being followed into /login (200 HTML).
  const r = await fetch(`${BASE}/api/dashboard`, { redirect: "manual" })
  expect(r.status).toBe(401)
  const body = await r.json()
  expect(body).toHaveProperty("error")
}, 10_000)

test("T1b: GET /api/dashboard with an EXPIRED/unknown session cookie → 401 JSON", async () => {
  const r = await fetch(`${BASE}/api/dashboard`, {
    headers: { Cookie: `klav_session=sess_does_not_exist_${ts}` },
    redirect: "manual",
  })
  expect(r.status).toBe(401)
  const body = await r.json()
  expect(body).toHaveProperty("error")
}, 10_000)

// ════════════════════════════════════════════════════════════════════════════
// T2 — OVER-ROTATION GUARD: an AUTHENTICATED user with ZERO projects still gets
// the normal 200 {projects:[], active:null} shape. The 401 guard must fire only
// for a falsy session, never conflate "no session" with "no projects".
// ════════════════════════════════════════════════════════════════════════════
test("T2: GET /api/dashboard authed with ZERO projects → 200 {projects:[], active:null}", async () => {
  const r = await fetch(`${BASE}/api/dashboard`, {
    headers: { Cookie: `klav_session=${SESS_B}` },
    redirect: "manual",
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(Array.isArray(body.projects)).toBe(true)
  expect(body.projects.length).toBe(0)
  expect(body.active).toBeNull()
}, 10_000)

// ════════════════════════════════════════════════════════════════════════════
// T3 — REGRESSION: an authed user WITH a project still gets a populated 200.
// ════════════════════════════════════════════════════════════════════════════
test("T3: GET /api/dashboard authed with a project → 200 with projects populated", async () => {
  const r = await fetch(`${BASE}/api/dashboard`, {
    headers: { Cookie: `klav_session=${SESS_A}` },
    redirect: "manual",
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(Array.isArray(body.projects)).toBe(true)
  expect(body.projects.length).toBeGreaterThan(0)
  expect(body.active && body.active.id).toBe(PROJ_A)
}, 10_000)
