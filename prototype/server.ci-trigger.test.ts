// KLA-91 — CI API route tests via the subprocess-server harness.
// Covers: token issuance (session-gated), walk trigger (bearer-gated), verdict poll, and
// IDOR guards (cross-project). Uses a stub walk (unreachable base_url) so no Chromium runs.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-ci-srv-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(99)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// ── Schema (only the tables this suite touches) ──
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS trails (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, intent TEXT NOT NULL DEFAULT '', base_url TEXT NOT NULL, baseline_ref TEXT, author_kind TEXT NOT NULL DEFAULT 'human', status TEXT NOT NULL DEFAULT 'draft', created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trail_runs (id TEXT PRIMARY KEY, trail_id TEXT NOT NULL, project_id TEXT NOT NULL, trigger TEXT NOT NULL DEFAULT 'manual', status TEXT NOT NULL DEFAULT 'running', llm_calls INTEGER NOT NULL DEFAULT 0, summary_json TEXT, started_at INTEGER NOT NULL, finished_at INTEGER)`)
await rawExec(`CREATE TABLE IF NOT EXISTS findings (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, run_id TEXT NOT NULL, step_id TEXT, trail_id TEXT NOT NULL, kind TEXT NOT NULL, title TEXT NOT NULL, evidence_json TEXT, ground_quote TEXT, confidence REAL NOT NULL DEFAULT 0, dedup_key TEXT NOT NULL, recurrence INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'queued', connector_ref TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS run_steps (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, trail_id TEXT NOT NULL, step_id TEXT NOT NULL, project_id TEXT NOT NULL, idx INTEGER NOT NULL, tier TEXT NOT NULL DEFAULT 'none', verdict TEXT NOT NULL DEFAULT 'skip', confidence REAL NOT NULL DEFAULT 0, diagnosis TEXT, healed INTEGER NOT NULL DEFAULT 0, evidence_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS walk_replays (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, project_id TEXT NOT NULL, segments_gz TEXT NOT NULL, n_segments INTEGER, n_events INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT, created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0)`)
await rawExec(`CREATE INDEX IF NOT EXISTS ext_tok_email_idx ON extension_tokens (email)`)

// ── Fixtures ──
const ADMIN_EMAIL = `admin-ci-${ts}@test.local`
const ADMIN_SID = `sess_admin_ci_${ts}`
const ACCOUNT_ID = `acct_ci_${ts}`
const PROJECT_ID = `proj_ci_${ACCOUNT_ID}`
const TRAIL_ID = `trl_ci_${ts}`
// A finished walk already in the DB (for poll tests).
const FINISHED_WALK_ID = `walk_ci_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "CI Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_ci_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "CI Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_ci_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
// Trail with an unreachable URL so the background walk fails fast without Chromium.
await rawExec(`INSERT INTO trails (id, project_id, name, intent, base_url, author_kind, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [TRAIL_ID, PROJECT_ID, "CI smoke", "", "https://unreachable.ci.test/", "human", "active", ADMIN_EMAIL, NOW, NOW])
// A pre-finished green walk for poll tests.
await rawExec(`INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, summary_json, started_at, finished_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [FINISHED_WALK_ID, TRAIL_ID, PROJECT_ID, "ci", "green", 0, null, NOW, NOW + 5000])

// ── Second project B (IDOR target — ADMIN_EMAIL is NOT a member) ──
const ACCOUNT_B_ID = `acct_ci_b_${ts}`
const PROJECT_B_ID = `proj_ci_b_${ts}`
const OWNER_B_EMAIL = `ownerB-ci-${ts}@test.local`
const TRAIL_B_ID = `trl_ci_b_${ts}`
const WALK_B_ID = `walk_ci_b_${ts}`
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OWNER_B_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_B_ID, "Other", OWNER_B_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_ci_b_${ts}`, ACCOUNT_B_ID, OWNER_B_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_B_ID, ACCOUNT_B_ID, "Other Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_ci_b_${ts}`, PROJECT_B_ID, OWNER_B_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO trails (id, project_id, name, intent, base_url, author_kind, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [TRAIL_B_ID, PROJECT_B_ID, "B Trail", "", "https://b.test/", "human", "active", OWNER_B_EMAIL, NOW, NOW])
await rawExec(`INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, summary_json, started_at, finished_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [WALK_B_ID, TRAIL_B_ID, PROJECT_B_ID, "ci", "green", 0, null, NOW, NOW + 1000])

// ── Spawn the server ──
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  // 43xxx band — distinct from all other suites (server.trails 41xxx, server.connectors 19xxx, etc.)
  serverPort = 43000 + Math.floor(Math.random() * 1000)
  BASE = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(serverPort),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
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
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
    await Bun.sleep(150)
  }
})

afterAll(() => { serverProc?.kill(); rawClient.close() })

function cookie(sid: string) { return `klav_session=${sid}` }
function bearer(tok: string) { return `Bearer ${tok}` }

// ── Token issuance ──

test("POST /api/ci/token — session-gated, returns kci_* token bound to project", async () => {
  const r = await fetch(`${BASE}/api/ci/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie(ADMIN_SID) },
    body: JSON.stringify({ project: PROJECT_ID }),
  })
  expect(r.status).toBe(201)
  const b = await r.json() as any
  expect(b.token).toMatch(/^kci_/)
  expect(b.project).toBe(PROJECT_ID)
})

test("POST /api/ci/token — 401 without a session", async () => {
  const r = await fetch(`${BASE}/api/ci/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project: PROJECT_ID }),
  })
  expect(r.status).toBe(401)
})

test("POST /api/ci/token — 403 when project does not belong to the session user", async () => {
  const r = await fetch(`${BASE}/api/ci/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie(ADMIN_SID) },
    body: JSON.stringify({ project: PROJECT_B_ID }),
  })
  expect(r.status).toBe(403)
})

// ── Helper: issue a CI token for ADMIN_EMAIL/PROJECT_ID via the API (reuse across tests) ──
let sharedCIToken: string
beforeAll(async () => {
  const r = await fetch(`${BASE}/api/ci/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie(ADMIN_SID) },
    body: JSON.stringify({ project: PROJECT_ID }),
  })
  const b = await r.json() as any
  sharedCIToken = b.token
})

// ── Walk trigger ──

test("POST /api/ci/trails/:id/trigger — 401 without bearer token", async () => {
  const r = await fetch(`${BASE}/api/ci/trails/${TRAIL_ID}/trigger?project=${PROJECT_ID}`, { method: "POST" })
  expect(r.status).toBe(401)
})

test("POST /api/ci/trails/:id/trigger — 401 with invalid bearer token", async () => {
  const r = await fetch(`${BASE}/api/ci/trails/${TRAIL_ID}/trigger?project=${PROJECT_ID}`, {
    method: "POST",
    headers: { Authorization: bearer("kci_notarealtoken") },
  })
  expect(r.status).toBe(401)
})

test("POST /api/ci/trails/:id/trigger — 202 returns runId with valid token", async () => {
  const r = await fetch(`${BASE}/api/ci/trails/${TRAIL_ID}/trigger?project=${PROJECT_ID}`, {
    method: "POST",
    headers: { Authorization: bearer(sharedCIToken) },
  })
  expect(r.status).toBe(202)
  const b = await r.json() as any
  expect(b.runId).toMatch(/^walk_/)
})

test("POST /api/ci/trails/:id/trigger — 404 for unknown trail", async () => {
  const r = await fetch(`${BASE}/api/ci/trails/trl_doesnotexist/trigger?project=${PROJECT_ID}`, {
    method: "POST",
    headers: { Authorization: bearer(sharedCIToken) },
  })
  expect(r.status).toBe(404)
})

test("POST /api/ci/trails/:id/trigger — 403 IDOR: token owner can't trigger trail in project B", async () => {
  const r = await fetch(`${BASE}/api/ci/trails/${TRAIL_B_ID}/trigger?project=${PROJECT_B_ID}`, {
    method: "POST",
    headers: { Authorization: bearer(sharedCIToken) },
  })
  // Token is bound to PROJECT_ID; PROJECT_B_ID is a different project the caller can't access.
  expect(r.status).toBe(403)
})

// ── Verdict poll ──

test("GET /api/ci/runs/:runId — 401 without bearer token", async () => {
  const r = await fetch(`${BASE}/api/ci/runs/${FINISHED_WALK_ID}?project=${PROJECT_ID}`)
  expect(r.status).toBe(401)
})

test("GET /api/ci/runs/:runId — returns status/verdict for a finished walk", async () => {
  const r = await fetch(`${BASE}/api/ci/runs/${FINISHED_WALK_ID}?project=${PROJECT_ID}`, {
    headers: { Authorization: bearer(sharedCIToken) },
  })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.runId).toBe(FINISHED_WALK_ID)
  expect(b.status).toBe("green")
  expect(typeof b.finishedAt).toBe("number")
})

test("GET /api/ci/runs/:runId — 404 for unknown run", async () => {
  const r = await fetch(`${BASE}/api/ci/runs/walk_doesnotexist?project=${PROJECT_ID}`, {
    headers: { Authorization: bearer(sharedCIToken) },
  })
  expect(r.status).toBe(404)
})

test("GET /api/ci/runs/:runId — 404 IDOR: can't read project B's walk", async () => {
  const r = await fetch(`${BASE}/api/ci/runs/${WALK_B_ID}?project=${PROJECT_ID}`, {
    headers: { Authorization: bearer(sharedCIToken) },
  })
  // WALK_B_ID lives in PROJECT_B_ID; sharedCIToken is bound to PROJECT_ID only.
  expect(r.status).toBe(404)
})
