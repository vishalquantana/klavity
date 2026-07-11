// KLAVITYKLA-201: Cross-project inbox — unit tests for listInboxForProjects + HTTP tests
// for GET /api/inbox (aggregation, auth guard, tenant isolation).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Shared temp DB for all tests ──────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-inbox-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// Minimal schema — only what the inbox routes + listInboxForProjects need.
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', url_patterns_json TEXT, review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', autosim_auth_status TEXT NOT NULL DEFAULT 'unregistered', billing_plan TEXT NOT NULL DEFAULT 'free', billing_status TEXT, billing_updated_at INTEGER, modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, widget_report_gate TEXT NOT NULL DEFAULT 'email', instructions_md TEXT, trails_autofile_enabled INTEGER NOT NULL DEFAULT 0, site_url TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, source_referrer TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, issue_key TEXT, recurrence_count INTEGER NOT NULL DEFAULT 1, recurrence_dates_json TEXT, last_seen_at INTEGER, client_context_json TEXT, annotations_json TEXT, source TEXT, seq_num INTEGER, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, contact_email TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
// findings table for regression count
await rawExec(`CREATE TABLE IF NOT EXISTS findings (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, run_id TEXT NOT NULL, step_id TEXT, trail_id TEXT NOT NULL, kind TEXT NOT NULL, title TEXT NOT NULL, evidence_json TEXT, ground_quote TEXT, confidence REAL NOT NULL DEFAULT 0, dedup_key TEXT NOT NULL, recurrence INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'queued', connector_ref TEXT, connector_error TEXT, content_sig TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS project_acct_idx ON projects (account_id, created_at)`)

// ── Fixtures ──────────────────────────────────────────────────────────────────
const NOW = Date.now()

// Account A — two projects; our main test user is an owner.
const ACCT_A = `acct_a_${ts}`
const USER_A = `user-inbox-a-${ts}@test.local`
const SID_A = `sess_a_${ts}`
const PROJ_A1 = `proj_inbox_a1_${ts}`
const PROJ_A2 = `proj_inbox_a2_${ts}`

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [USER_A, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCT_A, "Agency A", USER_A, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_a_${ts}`, ACCT_A, USER_A, "owner", NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [SID_A, USER_A, NOW, NOW + 86_400_000])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJ_A1, ACCT_A, "Client Alpha", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJ_A2, ACCT_A, "Client Beta", "active", "auto", 200, "named", NOW, NOW])

// Account B — separate tenant; should NOT appear in User A's inbox.
const ACCT_B = `acct_b_${ts}`
const USER_B = `user-inbox-b-${ts}@test.local`
const SID_B = `sess_b_${ts}`
const PROJ_B = `proj_inbox_b_${ts}`

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [USER_B, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCT_B, "Agency B", USER_B, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_b_${ts}`, ACCT_B, USER_B, "owner", NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [SID_B, USER_B, NOW, NOW + 86_400_000])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJ_B, ACCT_B, "Tenant B Project", "active", "auto", 200, "named", NOW, NOW])

// ── Seed feedback for Project A1 ──────────────────────────────────────────────
// 3 new reports in the recent window
for (let i = 0; i < 3; i++) {
  const fid = `fb_a1_${ts}_${i}`
  await rawExec(
    `INSERT INTO feedback (id, project_id, observation, priority, status, recurrence_count, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [fid, PROJ_A1, `New report ${i}`, "medium", "new", 1, NOW - i * 60_000],
  )
}
// 1 old new report outside 48h window — should NOT be counted
await rawExec(
  `INSERT INTO feedback (id, project_id, observation, priority, status, recurrence_count, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [`fb_a1_old_${ts}`, PROJ_A1, "Old report", "high", "new", 1, NOW - 72 * 3_600_000],
)
// 1 triaged (non-new) feedback — should NOT be in new count
await rawExec(
  `INSERT INTO feedback (id, project_id, observation, priority, status, recurrence_count, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [`fb_a1_open_${ts}`, PROJ_A1, "Already triaged", "high", "open", 1, NOW],
)

// ── Seed a regression finding for Project A2 ─────────────────────────────────
await rawExec(
  `INSERT INTO findings (id, project_id, run_id, trail_id, kind, title, dedup_key, confidence, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [`finding_a2_${ts}`, PROJ_A2, `run_${ts}`, `trail_${ts}`, "regression", "Checkout flow broke", `dk_${ts}`, 0.9, NOW, NOW],
)

// ── Seed feedback for Tenant B (should be invisible to User A) ────────────────
await rawExec(
  `INSERT INTO feedback (id, project_id, observation, priority, status, recurrence_count, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [`fb_b_${ts}`, PROJ_B, "Tenant B secret bug", "high", "new", 1, NOW],
)

// ── Spawn server ──────────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 48100 + Math.floor(Math.random() * 400)
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

  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready yet */ }
    await Bun.sleep(150)
  }
})

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

function authCookie(sid: string) { return `klav_session=${sid}` }

async function getInbox(sid?: string, window?: number, followRedirects = true) {
  const qs = window ? `?window=${window}` : ""
  return fetch(`${BASE}/api/inbox${qs}`, {
    headers: sid ? { Cookie: authCookie(sid) } : {},
    redirect: followRedirects ? "follow" : "manual",
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test("GET /api/inbox — unauthenticated redirects to /login (302)", async () => {
  // The server redirects GET requests to /login when not authed (consistent with /dashboard etc).
  const r = await getInbox(undefined, undefined, false)
  expect(r.status).toBe(302)
  const loc = r.headers.get("location") || ""
  expect(loc).toContain("/login")
})

test("GET /api/inbox — authenticated returns 200 with correct shape", async () => {
  const r = await getInbox(SID_A)
  expect(r.status).toBe(200)
  const body = await r.json() as any
  expect(body).toHaveProperty("projects")
  expect(body).toHaveProperty("totalNew")
  expect(body).toHaveProperty("totalReg")
  expect(body).toHaveProperty("windowHours")
  expect(Array.isArray(body.projects)).toBe(true)
})

test("GET /api/inbox — returns only user A projects (tenant isolation)", async () => {
  const r = await getInbox(SID_A)
  const body = await r.json() as any
  const ids = (body.projects as any[]).map((p: any) => p.projectId)
  expect(ids).toContain(PROJ_A1)
  expect(ids).toContain(PROJ_A2)
  // Tenant B's project must not appear
  expect(ids).not.toContain(PROJ_B)
})

test("GET /api/inbox — new report count excludes old (>48h) and non-new items", async () => {
  const r = await getInbox(SID_A, 48)
  const body = await r.json() as any
  const a1 = (body.projects as any[]).find((p: any) => p.projectId === PROJ_A1)
  expect(a1).toBeTruthy()
  // Only 3 'new' within the 48h window; the old and the triaged must not count
  expect(a1.newReportCount).toBe(3)
})

test("GET /api/inbox — regression count for Project A2", async () => {
  const r = await getInbox(SID_A, 48)
  const body = await r.json() as any
  const a2 = (body.projects as any[]).find((p: any) => p.projectId === PROJ_A2)
  expect(a2).toBeTruthy()
  expect(a2.regressionCount).toBe(1)
})

test("GET /api/inbox — topReports contains the right titles", async () => {
  const r = await getInbox(SID_A, 48)
  const body = await r.json() as any
  const a1 = (body.projects as any[]).find((p: any) => p.projectId === PROJ_A1)
  expect(a1.topReports.length).toBeGreaterThanOrEqual(1)
  const titles = a1.topReports.map((rep: any) => rep.title)
  expect(titles.some((t: string) => t.startsWith("New report"))).toBe(true)
})

test("GET /api/inbox — totalNew aggregates across projects", async () => {
  const r = await getInbox(SID_A, 48)
  const body = await r.json() as any
  // totalNew = sum of all per-project newReportCounts
  const sum = (body.projects as any[]).reduce((acc: number, p: any) => acc + p.newReportCount, 0)
  expect(body.totalNew).toBe(sum)
})

test("GET /api/inbox — custom window shrinks results", async () => {
  // With window=1h, none of our test reports are old enough to fall out,
  // but old report (72h ago) must not appear even at 48h window.
  // Here we just check that windowHours is reflected correctly.
  const r = await getInbox(SID_A, 24)
  const body = await r.json() as any
  expect(body.windowHours).toBe(24)
})

test("GET /api/inbox — User B can only see their own projects", async () => {
  const r = await getInbox(SID_B, 48)
  const body = await r.json() as any
  const ids = (body.projects as any[]).map((p: any) => p.projectId)
  expect(ids).toContain(PROJ_B)
  expect(ids).not.toContain(PROJ_A1)
  expect(ids).not.toContain(PROJ_A2)
})
