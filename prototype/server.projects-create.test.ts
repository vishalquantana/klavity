// KLA-292: New client project flow — tests for POST /api/projects.
// Verifies: project creation (name only + with siteUrl), tenant isolation,
// auth guard, role guard, and URL validation.
// Hermetic: spins a real server subprocess against a fresh temp DB.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Dedicated temp DB ────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-projects-create-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(17)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// Minimal schema — mirrors applySchema from db.ts (only what the routes need).
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', url_patterns_json TEXT, review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', autosim_auth_status TEXT NOT NULL DEFAULT 'unregistered', billing_plan TEXT NOT NULL DEFAULT 'free', billing_status TEXT, billing_updated_at INTEGER, modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, widget_report_gate TEXT NOT NULL DEFAULT 'email', instructions_md TEXT, trails_autofile_enabled INTEGER NOT NULL DEFAULT 0, site_url TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, contact_email TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS project_acct_idx ON projects (account_id, created_at)`)

// ── Seed fixtures ─────────────────────────────────────────────────────────────
const NOW = Date.now()

// Account A — the main admin we test with.
const ACCT_A = `acct_a_${ts}`
const ADMIN_EMAIL = `admin-np-${ts}@test.local`
const ADMIN_SID = `sess_adm_${ts}`

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCT_A, "Workspace A", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_adm_${ts}`, ACCT_A, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

// Account B — a completely separate account/tenant (tenant-isolation check).
const ACCT_B = `acct_b_${ts}`
const ADMIN_B_EMAIL = `admin-np-b-${ts}@test.local`
const ADMIN_B_SID = `sess_adm_b_${ts}`

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_B_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCT_B, "Workspace B", ADMIN_B_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_b_${ts}`, ACCT_B, ADMIN_B_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_B_SID, ADMIN_B_EMAIL, NOW, NOW + 86400_000])

// A plain member (non-admin) of Account A — cannot create projects.
const MEMBER_EMAIL = `member-np-${ts}@test.local`
const MEMBER_SID = `sess_mem_${ts}`
const PROJ_A_EXISTING = `proj_existing_${ts}`

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [MEMBER_EMAIL, NOW])
// Add member to account_members with 'member' role so membershipsFor returns the account
// and the role-check in POST /api/projects can return 403 (not 400 "No account").
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`,
  [`am_mem_${ts}`, ACCT_A, MEMBER_EMAIL, "member", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJ_A_EXISTING, ACCT_A, "Existing Project A", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_mem_${ts}`, PROJ_A_EXISTING, MEMBER_EMAIL, "member", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [MEMBER_SID, MEMBER_EMAIL, NOW, NOW + 86400_000])

// ── Spawn server ──────────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 41200 + Math.floor(Math.random() * 800)
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

  // Wait until the server is ready (max 12s)
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
    await Bun.sleep(150)
  }
})

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function authCookie(sid: string) { return `klav_session=${sid}` }

async function post(path: string, body: any, sid?: string) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sid ? { Cookie: authCookie(sid) } : {}),
    },
    body: JSON.stringify(body),
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test("unauthenticated POST /api/projects returns 401", async () => {
  const r = await post("/api/projects", { name: "Ghost Project" })
  expect(r.status).toBe(401)
})

test("member (non-admin) POST /api/projects returns 403", async () => {
  const r = await post("/api/projects", { name: "Sneaky Project" }, MEMBER_SID)
  expect(r.status).toBe(403)
  const body = await r.json() as any
  expect(body.error).toMatch(/owner|admin/i)
})

test("POST /api/projects without a name returns 400", async () => {
  const r = await post("/api/projects", { name: "" }, ADMIN_SID)
  expect(r.status).toBe(400)
  const body = await r.json() as any
  expect(body.error).toMatch(/name/i)
})

test("admin creates project (name only) → 201 with project payload", async () => {
  const r = await post("/api/projects", { name: "Acme Corp Q3 Audit" }, ADMIN_SID)
  expect(r.status).toBe(201)
  const body = await r.json() as any
  expect(body.project).toBeTruthy()
  expect(body.project.name).toBe("Acme Corp Q3 Audit")
  expect(body.project.id).toMatch(/^proj_/)
  expect(body.project.status).toBe("active")
  expect(body.project.role).toBe("admin")
  // No site URL sent → siteUrl should be null or absent
  expect(body.project.siteUrl ?? null).toBeNull()
})

test("admin creates project with siteUrl → stored and returned", async () => {
  const r = await post("/api/projects", { name: "TechCorp Rebrand", siteUrl: "https://techcorp.io" }, ADMIN_SID)
  expect(r.status).toBe(201)
  const body = await r.json() as any
  expect(body.project.name).toBe("TechCorp Rebrand")
  expect(body.project.siteUrl).toBe("https://techcorp.io")

  // Verify the value is persisted in the DB.
  const dbRow = await rawClient.execute({ sql: "SELECT site_url FROM projects WHERE id=?", args: [body.project.id] })
  expect(String(dbRow.rows[0]!.site_url)).toBe("https://techcorp.io")
})

test("siteUrl without scheme is normalised to https://", async () => {
  const r = await post("/api/projects", { name: "No-Scheme Client", siteUrl: "example.com/path" }, ADMIN_SID)
  expect(r.status).toBe(201)
  const body = await r.json() as any
  expect(body.project.siteUrl).toBe("https://example.com/path")
})

test("invalid siteUrl returns 400", async () => {
  const r = await post("/api/projects", { name: "Bad URL Project", siteUrl: "not a url at all !@#$" }, ADMIN_SID)
  expect(r.status).toBe(400)
  const body = await r.json() as any
  expect(body.error).toMatch(/url/i)
})

test("tenant isolation: project created by account A is not accessible by account B", async () => {
  // Create a project as admin A.
  const createRes = await post("/api/projects", { name: "Secret A Project" }, ADMIN_SID)
  expect(createRes.status).toBe(201)
  const { project } = await createRes.json() as any

  // Verify the project's account_id is ACCT_A, not ACCT_B.
  const dbRow = await rawClient.execute({ sql: "SELECT account_id FROM projects WHERE id=?", args: [project.id] })
  expect(String(dbRow.rows[0]!.account_id)).toBe(ACCT_A)

  // Account B admin cannot access the project via its detail endpoint.
  const detailRes = await fetch(`${BASE}/api/projects/${project.id}`, {
    headers: { Cookie: authCookie(ADMIN_B_SID) },
  })
  expect(detailRes.status).toBe(403)
})

test("admin B can still create their own project in account B", async () => {
  const r = await post("/api/projects", { name: "B Corp Project" }, ADMIN_B_SID)
  expect(r.status).toBe(201)
  const body = await r.json() as any
  const dbRow = await rawClient.execute({ sql: "SELECT account_id FROM projects WHERE id=?", args: [body.project.id] })
  expect(String(dbRow.rows[0]!.account_id)).toBe(ACCT_B)
})
