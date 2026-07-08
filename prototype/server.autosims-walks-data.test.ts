// Task 1: Guard tests for /autosims/walks page — static source assertions + route test.
// Hermetic subprocess pattern mirroring server.autosims-page.test.ts.
// Asserts: (a) page fetches /api/trails/dashboard (not just /api/dashboard) for walks,
//          (b) recentWalks is read from the trails endpoint response,
//          (c) GET /autosims/walks is auth-gated (200 authed, 302 anon).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { readFileSync } from "node:fs"

// ── Dedicated temp DB ─────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-autosims-walks-data-${ts}.db`)

const TEST_SECRET = Buffer.alloc(32, 9).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// ── Minimal schema ────────────────────────────────────────────────────────────
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS trails (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, intent TEXT NOT NULL DEFAULT '', base_url TEXT NOT NULL, baseline_ref TEXT, author_kind TEXT NOT NULL DEFAULT 'human', status TEXT NOT NULL DEFAULT 'draft', created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trail_runs (id TEXT PRIMARY KEY, trail_id TEXT NOT NULL, project_id TEXT NOT NULL, trigger TEXT NOT NULL DEFAULT 'manual', status TEXT NOT NULL DEFAULT 'running', llm_calls INTEGER NOT NULL DEFAULT 0, summary_json TEXT, started_at INTEGER NOT NULL, finished_at INTEGER)`)
await rawExec(`CREATE TABLE IF NOT EXISTS run_steps (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, trail_id TEXT NOT NULL, step_id TEXT NOT NULL, project_id TEXT NOT NULL, idx INTEGER NOT NULL, tier TEXT NOT NULL DEFAULT 'none', verdict TEXT NOT NULL DEFAULT 'skip', confidence REAL NOT NULL DEFAULT 0, diagnosis TEXT, healed INTEGER NOT NULL DEFAULT 0, evidence_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS walk_replays (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, project_id TEXT NOT NULL, segments_gz TEXT NOT NULL, n_segments INTEGER, n_events INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS findings (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, run_id TEXT NOT NULL, step_id TEXT, trail_id TEXT NOT NULL, kind TEXT NOT NULL, title TEXT NOT NULL, evidence_json TEXT, ground_quote TEXT, confidence REAL NOT NULL DEFAULT 0, dedup_key TEXT NOT NULL, recurrence INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'queued', connector_ref TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS locator_cache (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, trail_id TEXT NOT NULL, step_id TEXT NOT NULL, cache_key TEXT NOT NULL, resolved_selector TEXT NOT NULL, fingerprint_json TEXT, confidence REAL NOT NULL DEFAULT 1.0, source TEXT NOT NULL DEFAULT 'crystallize', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE UNIQUE INDEX IF NOT EXISTS lc_key_uq ON locator_cache(project_id, step_id)`)

// ── Seed fixtures ─────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `admin-awd-${ts}@test.local`
const ADMIN_SID = `sess_awd_admin_${ts}`
const ACCOUNT_ID = `acct_awd_${ts}`
const PROJECT_ID = `proj_awd_${ts}`
const TRAIL_ID = `trail_awd_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCOUNT_ID, "AWD Workspace", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_awd_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "AWD Project", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_awd_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO trails (id, project_id, name, intent, base_url, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [TRAIL_ID, PROJECT_ID, "AWD Trail", "test intent", "https://example.com", "active", NOW, NOW])
// Seed 15 walks so pagination has data across two pages (default limit=20 → page 1: 10, page 2: 5 when limit=10)
for (let i = 0; i < 15; i++) {
  await rawExec(`INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, started_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [`run_awd_${ts}_${i}`, TRAIL_ID, PROJECT_ID, "manual", i % 2 === 0 ? "green" : "amber", i, NOW - i * 1000])
}

// ── Spawn the server on a random port ─────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let base: string
const adminCookie = `klav_session=${ADMIN_SID}`

beforeAll(async () => {
  serverPort = 47000 + Math.floor(Math.random() * 1000)
  base = `http://localhost:${serverPort}`

  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(serverPort),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: base,
      KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
    },
    stdout: "pipe",
    stderr: "pipe",
  })

  // Wait until the server is ready (max 10s)
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${base}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready yet */ }
    await Bun.sleep(150)
  }
})

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

// ── Static source assertions ───────────────────────────────────────────────────

test("autosims-walks.html static: fetches /api/trails/dashboard for walk data", () => {
  const src = readFileSync(new URL("../prototype/public/autosims-walks.html", import.meta.url), "utf8")
  // Must reference the trails dashboard endpoint (for trail name lookup)
  expect(src).toContain("/api/trails/dashboard")
})

test("autosims-walks.html static: does NOT read recentWalks off the /api/dashboard response", () => {
  const src = readFileSync(new URL("../prototype/public/autosims-walks.html", import.meta.url), "utf8")
  // The old buggy pattern: `d.recentWalks` where d is the /api/dashboard response.
  expect(src).not.toContain("d.recentWalks")
})

test("autosims-walks.html static: uses paginated /api/trails/walks endpoint", () => {
  const src = readFileSync(new URL("../prototype/public/autosims-walks.html", import.meta.url), "utf8")
  expect(src).toContain("/api/trails/walks")
  // Pagination controls present
  expect(src).toContain("prevBtn")
  expect(src).toContain("nextBtn")
  expect(src).toContain("pager")
})

test("autosims-walks.html static: no duplicate /api/trails/dashboard fetch", () => {
  const src = readFileSync(new URL("../prototype/public/autosims-walks.html", import.meta.url), "utf8")
  // The old code fetched /api/trails/dashboard twice. Count occurrences — must be exactly one.
  const count = (src.match(/\/api\/trails\/dashboard/g) || []).length
  expect(count).toBe(1)
})

test("autosims-walks.html static: has live refresh (setInterval)", () => {
  const src = readFileSync(new URL("../prototype/public/autosims-walks.html", import.meta.url), "utf8")
  expect(src).toContain("setInterval")
})

// ── Route tests ───────────────────────────────────────────────────────────────

test("GET /autosims/walks serves the All Walks page for a session; anon redirects to /login", async () => {
  const authed = await fetch(`${base}/autosims/walks`, { headers: { cookie: adminCookie }, redirect: "manual" })
  expect(authed.status).toBe(200)
  expect(await authed.text()).toContain("All Walks")
  const anon = await fetch(`${base}/autosims/walks`, { redirect: "manual" })
  expect(anon.status).toBe(302)
})

test("GET /api/trails/walks returns 401 for unauthenticated requests", async () => {
  const r = await fetch(`${base}/api/trails/walks?project=${PROJECT_ID}`)
  expect(r.status).toBe(401)
})

test("GET /api/trails/walks returns paginated walks with correct shape", async () => {
  const r = await fetch(`${base}/api/trails/walks?project=${PROJECT_ID}&page=1&limit=20`, {
    headers: { cookie: adminCookie },
  })
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d).toHaveProperty("walks")
  expect(d).toHaveProperty("total")
  expect(d).toHaveProperty("page")
  expect(d).toHaveProperty("pages")
  expect(Array.isArray(d.walks)).toBe(true)
  expect(d.total).toBe(15)
  expect(d.page).toBe(1)
  expect(d.walks.length).toBe(15) // 15 total, all fit in limit=20
})

test("GET /api/trails/walks respects limit and offset for page 2", async () => {
  // Server clamps limit to [10, 50]. With 15 walks and limit=10: page 1 has 10, page 2 has 5.
  const r = await fetch(`${base}/api/trails/walks?project=${PROJECT_ID}&page=2&limit=10`, {
    headers: { cookie: adminCookie },
  })
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.page).toBe(2)
  expect(d.total).toBe(15)
  expect(d.pages).toBe(2)
  expect(d.walks.length).toBe(5) // 15 total, 10 on page 1, 5 on page 2
})
