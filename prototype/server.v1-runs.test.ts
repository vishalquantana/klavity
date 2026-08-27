// KLA-550 — /api/v1/runs REST API route tests via the subprocess-server harness.
// Covers: 202 create + response shape, Idempotency-Key replay (same key → same run_id, 200),
// AI-consumable report payload shape, auth rejection (missing/wrong-project), 404 unknown run,
// status shape (+ git echo), list, and cancel semantics. Uses an unreachable trail base_url so the
// single real create's background walk fails fast without a usable browser (mirrors server.ci-trigger).

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __netKLA719 from "node:net"
// KLA-719: OS-assigned free port (replaces a crowded random base that let co-scheduled
// server suites collide and answer each other's requests → spurious 401/404/no-such-table).
function __freePortKLA719(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __netKLA719.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-v1runs-srv-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// ── Schema (only the tables this suite touches; the booting server adds git_json + api_idempotency). ──
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
const ADMIN_EMAIL = `admin-v1-${ts}@test.local`
const ADMIN_SID = `sess_admin_v1_${ts}`
const ACCOUNT_ID = `acct_v1_${ts}`
const PROJECT_ID = `proj_v1_${ACCOUNT_ID}`
const TRAIL_ID = `trl_v1_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "V1 Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_v1_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "V1 Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_v1_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
// Trail with an unreachable URL so the one real create's background walk fails fast without a browser.
await rawExec(`INSERT INTO trails (id, project_id, name, intent, base_url, author_kind, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [TRAIL_ID, PROJECT_ID, "V1 smoke", "", "https://unreachable.v1.test/", "human", "active", ADMIN_EMAIL, NOW, NOW])

// A pre-finished RED walk + a regression finding, for status/report shape tests (no walk launched).
const RED_WALK_ID = `walk_v1_red_${ts}`
const RED_FINDING_ID = `find_v1_${ts}`
await rawExec(`INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, summary_json, started_at, finished_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [RED_WALK_ID, TRAIL_ID, PROJECT_ID, "manual", "red", 1, null, NOW, NOW + 4000])
await rawExec(`INSERT INTO findings (id, project_id, run_id, step_id, trail_id, kind, title, evidence_json, ground_quote, confidence, dedup_key, recurrence, status, connector_ref, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [RED_FINDING_ID, PROJECT_ID, RED_WALK_ID, null, TRAIL_ID, "regression", "Checkout button removed", JSON.stringify({ selector: "#checkout", pageUrl: "https://unreachable.v1.test/cart", reason: "element_gone" }), "The checkout button is missing from the cart page", 0.95, `v1:${ts}:checkout`, 1, "queued", null, NOW, NOW])

// ── Second project B (IDOR/forbidden target — ADMIN is NOT a member) ──
const ACCOUNT_B_ID = `acct_v1_b_${ts}`
const PROJECT_B_ID = `proj_v1_b_${ts}`
const OWNER_B_EMAIL = `ownerB-v1-${ts}@test.local`
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OWNER_B_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_B_ID, "Other", OWNER_B_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_v1_b_${ts}`, ACCOUNT_B_ID, OWNER_B_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_B_ID, ACCOUNT_B_ID, "Other Project", "active", "auto", 200, "named", NOW, NOW])

// ── Spawn the server ──
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  // 44xxx band — distinct from server.ci-trigger (43xxx) and the trails/connectors suites.
  serverPort = await __freePortKLA719()
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

// Mint a kci_ token for ADMIN/PROJECT_ID via the existing CI endpoint (v1 reuses these tokens).
let CI_TOKEN: string
beforeAll(async () => {
  const r = await fetch(`${BASE}/api/ci/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie(ADMIN_SID) },
    body: JSON.stringify({ project: PROJECT_ID }),
  })
  const b = await r.json() as any
  CI_TOKEN = b.token
})

// ── Auth ──

test("POST /api/v1/runs — 401 without a bearer token", async () => {
  const r = await fetch(`${BASE}/api/v1/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ project_id: PROJECT_ID, trail_id: TRAIL_ID }),
  })
  expect(r.status).toBe(401)
  const b = await r.json() as any
  expect(b.error.code).toBe("unauthorized")
  expect(typeof b.error.request_id).toBe("string")
})

test("POST /api/v1/runs — 403 when body project_id != token's bound project", async () => {
  const r = await fetch(`${BASE}/api/v1/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: JSON.stringify({ project_id: PROJECT_B_ID, trail_id: TRAIL_ID }),
  })
  expect(r.status).toBe(403)
  const b = await r.json() as any
  expect(b.error.code).toBe("forbidden")
})

test("POST /api/v1/runs — 400 when trail_id is missing", async () => {
  const r = await fetch(`${BASE}/api/v1/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: JSON.stringify({ project_id: PROJECT_ID }),
  })
  expect(r.status).toBe(400)
})

test("POST /api/v1/runs — 404 for unknown trail", async () => {
  const r = await fetch(`${BASE}/api/v1/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN) },
    body: JSON.stringify({ project_id: PROJECT_ID, trail_id: "trl_nope" }),
  })
  expect(r.status).toBe(404)
  const b = await r.json() as any
  expect(b.error.code).toBe("not_found")
})

// ── Create + idempotency (the ONE real walk this suite launches) ──

const IDEM_KEY = `idem-${ts}`
let CREATED_RUN_ID: string

test("POST /api/v1/runs — 202 create returns run_id + status_url + report_url + echoed git", async () => {
  const r = await fetch(`${BASE}/api/v1/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN), "Idempotency-Key": IDEM_KEY },
    body: JSON.stringify({ project_id: PROJECT_ID, trail_id: TRAIL_ID, git: { sha: "abc123", pr: 42, branch: "feat/x" } }),
  })
  expect(r.status).toBe(202)
  const b = await r.json() as any
  expect(b.run_id).toMatch(/^walk_/)
  expect(b.status).toBe("queued")
  expect(b.status_url).toBe(`/api/v1/runs/${b.run_id}`)
  expect(b.report_url).toBe(`/api/v1/runs/${b.run_id}/report`)
  expect(b.git).toEqual({ sha: "abc123", pr: 42, branch: "feat/x" })
  CREATED_RUN_ID = b.run_id
})

test("POST /api/v1/runs — Idempotency-Key replay returns the ORIGINAL run with 200", async () => {
  const r = await fetch(`${BASE}/api/v1/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(CI_TOKEN), "Idempotency-Key": IDEM_KEY },
    body: JSON.stringify({ project_id: PROJECT_ID, trail_id: TRAIL_ID, git: { sha: "abc123", pr: 42, branch: "feat/x" } }),
  })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.run_id).toBe(CREATED_RUN_ID)
  expect(b.idempotent_replay).toBe(true)
})

test("GET /api/v1/runs/:id — persisted git metadata is echoed on the created run", async () => {
  const r = await fetch(`${BASE}/api/v1/runs/${CREATED_RUN_ID}?project=${PROJECT_ID}`, {
    headers: { Authorization: bearer(CI_TOKEN) },
  })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.run_id).toBe(CREATED_RUN_ID)
  expect(b.git).toEqual({ sha: "abc123", pr: 42, branch: "feat/x" })
})

// ── Status ──

test("GET /api/v1/runs/:id — status shape maps a RED walk to failed + severity summary", async () => {
  const r = await fetch(`${BASE}/api/v1/runs/${RED_WALK_ID}?project=${PROJECT_ID}`, {
    headers: { Authorization: bearer(CI_TOKEN) },
  })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.run_id).toBe(RED_WALK_ID)
  expect(b.status).toBe("failed")
  expect(b.verdict).toBe("red")
  expect(typeof b.started_at).toBe("number")
  expect(typeof b.finished_at).toBe("number")
  expect(b.summary.counts_by_severity.high).toBe(1)
})

test("GET /api/v1/runs/:id — 404 for unknown run", async () => {
  const r = await fetch(`${BASE}/api/v1/runs/walk_nope_${ts}?project=${PROJECT_ID}`, {
    headers: { Authorization: bearer(CI_TOKEN) },
  })
  expect(r.status).toBe(404)
})

test("GET /api/v1/runs/:id — 403 when ?project mismatches the token", async () => {
  const r = await fetch(`${BASE}/api/v1/runs/${RED_WALK_ID}?project=${PROJECT_B_ID}`, {
    headers: { Authorization: bearer(CI_TOKEN) },
  })
  expect(r.status).toBe(403)
})

// ── Report ──

test("GET /api/v1/runs/:id/report — AI-consumable issue payload shape", async () => {
  const r = await fetch(`${BASE}/api/v1/runs/${RED_WALK_ID}/report?project=${PROJECT_ID}`, {
    headers: { Authorization: bearer(CI_TOKEN) },
  })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.run_id).toBe(RED_WALK_ID)
  expect(b.verdict).toBe("red")
  expect(Array.isArray(b.issues)).toBe(true)
  expect(b.issues.length).toBe(1)
  const iss = b.issues[0]
  expect(iss.id).toBe(RED_FINDING_ID)
  expect(iss.title).toBe("Checkout button removed")
  expect(iss.severity).toBe("high")
  expect(iss.priority).toBe("high")
  expect(iss.target.selector).toBe("#checkout")
  expect(iss.target.url).toBe("https://unreachable.v1.test/cart")
  expect(iss.ground_quote).toBe("The checkout button is missing from the cart page")
  expect(typeof iss.evidence.timestamp).toBe("number")
  // Optional fields we don't have are absent (never fabricated).
  expect(iss.expected).toBeUndefined()
  expect(iss.suggested_fix).toBeUndefined()
  // Single page → no further cursor.
  expect(b.next_cursor).toBeNull()
})

test("GET /api/v1/runs/:id/report — cursor pagination returns next_cursor when limit < total", async () => {
  const r = await fetch(`${BASE}/api/v1/runs/${RED_WALK_ID}/report?project=${PROJECT_ID}&limit=1`, {
    headers: { Authorization: bearer(CI_TOKEN) },
  })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  // Only one finding exists → still the last page even at limit=1.
  expect(b.issues.length).toBe(1)
  expect(b.next_cursor).toBeNull()
})

// ── List ──

test("GET /api/v1/runs — lists recent runs with mapped status/verdict", async () => {
  const r = await fetch(`${BASE}/api/v1/runs?project=${PROJECT_ID}`, {
    headers: { Authorization: bearer(CI_TOKEN) },
  })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(Array.isArray(b.runs)).toBe(true)
  const red = b.runs.find((x: any) => x.run_id === RED_WALK_ID)
  expect(red).toBeTruthy()
  expect(red.status).toBe("failed")
  expect(red.verdict).toBe("red")
})

// ── Cancel ──

test("POST /api/v1/runs/:id/cancel — finished run reports cancel_requested:false (best-effort truth)", async () => {
  const r = await fetch(`${BASE}/api/v1/runs/${RED_WALK_ID}/cancel?project=${PROJECT_ID}`, {
    method: "POST",
    headers: { Authorization: bearer(CI_TOKEN) },
  })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.run_id).toBe(RED_WALK_ID)
  expect(b.cancel_requested).toBe(false)
  expect(b.status).toBe("failed")
})

test("POST /api/v1/runs/:id/cancel — 404 for unknown run", async () => {
  const r = await fetch(`${BASE}/api/v1/runs/walk_nope_${ts}/cancel?project=${PROJECT_ID}`, {
    method: "POST",
    headers: { Authorization: bearer(CI_TOKEN) },
  })
  expect(r.status).toBe(404)
})
