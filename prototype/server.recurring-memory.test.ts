import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${randomUUID()}`
const DB_FILE = join(tmpdir(), `klav-recurring-memory-${RUN}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(68)).toString("base64")

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const rawClient = createClient({ url: "file:" + DB_FILE })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

const OWNER_EMAIL = `owner-memory-${RUN}@test.local`
const OUTSIDER_EMAIL = `outsider-memory-${RUN}@test.local`
const OWNER_SID = `sess_owner_memory_${RUN}`
const OUTSIDER_SID = `sess_outsider_memory_${RUN}`
const ACCOUNT_ID = `acct_memory_${RUN}`
const PROJECT_ID = `proj_memory_${RUN}`
const FOREIGN_ACCOUNT_ID = `acct_memory_foreign_${RUN}`
const FOREIGN_PROJECT_ID = `proj_memory_foreign_${RUN}`
const SIM_ID = `sim_memory_${RUN}`
const FEEDBACK_ID = `fb_memory_${RUN}`
const ONE_OFF_ID = `fb_memory_oneoff_${RUN}`
const FOREIGN_FEEDBACK_ID = `fb_memory_foreign_${RUN}`
const ISSUE_KEY = `issue_checkout_submit_${RUN}`
const NOW = Date.now()
const FIRST = Date.UTC(2026, 3, 2)
const RESOLVED = Date.UTC(2026, 3, 5)
const RESURFACED = Date.UTC(2026, 3, 9)

async function seed() {
  await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
  await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
  await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
  await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT NOT NULL, domain TEXT, created_at INTEGER NOT NULL)`)
  await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
  await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', url_patterns_json TEXT, review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER DEFAULT 200, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
  await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL, invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
  await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
  await rawExec(`CREATE TABLE IF NOT EXISTS expectations (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, dedup_key TEXT NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'candidate', source_json TEXT NOT NULL DEFAULT '{}', corroboration_json TEXT NOT NULL DEFAULT '{}', url_path TEXT, issue_type TEXT, cited_trait_ids_json TEXT, enforced_trail_id TEXT, enforced_step_id TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, UNIQUE(project_id, dedup_key))`)
  await rawExec(`CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT,
    observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT,
    source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT,
    status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, issue_key TEXT, recurrence_count INTEGER NOT NULL DEFAULT 1,
    recurrence_dates_json TEXT, last_seen_at INTEGER, resolved_at INTEGER, client_context_json TEXT, annotations_json TEXT,
    updated_at INTEGER, created_at INTEGER NOT NULL
  )`)

  await rawExec(`INSERT INTO users (email, name, created_at) VALUES (?, ?, ?)`, [OWNER_EMAIL, "Owner", NOW])
  await rawExec(`INSERT INTO users (email, name, created_at) VALUES (?, ?, ?)`, [OUTSIDER_EMAIL, "Outsider", NOW])
  await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [OWNER_SID, OWNER_EMAIL, NOW, NOW + 86_400_000])
  await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [OUTSIDER_SID, OUTSIDER_EMAIL, NOW, NOW + 86_400_000])

  await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "Memory Account", OWNER_EMAIL, NOW])
  await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_memory_${RUN}`, ACCOUNT_ID, OWNER_EMAIL, "owner", NOW])
  await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "Memory Project", "active", "auto", 200, "named", NOW, NOW])
  await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_memory_${RUN}`, PROJECT_ID, OWNER_EMAIL, "admin", null, NOW])
  await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [SIM_ID, PROJECT_ID, "Alice QA", "QA Lead", "client", "AQ", "#6366f1", "Finds regressions.", "[]", NOW, NOW])
  await rawExec(`INSERT INTO expectations (id, project_id, dedup_key, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`, [`exp_memory_${RUN}`, PROJECT_ID, ISSUE_KEY, "Checkout submit breaks", "validated", NOW, NOW])

  await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [FOREIGN_ACCOUNT_ID, "Foreign", OUTSIDER_EMAIL, NOW])
  await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [FOREIGN_PROJECT_ID, FOREIGN_ACCOUNT_ID, "Foreign Project", "active", "auto", 200, "named", NOW, NOW])

  await rawExec(`INSERT INTO feedback (id, project_id, sim_id, observation, priority, suggested_bug_json, status, issue_key, recurrence_count, recurrence_dates_json, last_seen_at, resolved_at, updated_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    FEEDBACK_ID, PROJECT_ID, SIM_ID, "Checkout submit button stops responding", "high",
    JSON.stringify({ title: "Checkout submit breaks" }), "done", ISSUE_KEY, 3,
    JSON.stringify([FIRST, RESOLVED, RESURFACED]), RESURFACED, RESOLVED, RESOLVED, FIRST,
  ])
  await rawExec(`INSERT INTO feedback (id, project_id, observation, priority, suggested_bug_json, status, issue_key, recurrence_count, recurrence_dates_json, last_seen_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    ONE_OFF_ID, PROJECT_ID, "One-off copy nit", "low", JSON.stringify({ title: "Copy nit" }), "open", null, 1, JSON.stringify([NOW]), NOW, NOW,
  ])
  await rawExec(`INSERT INTO feedback (id, project_id, observation, priority, suggested_bug_json, status, issue_key, recurrence_count, recurrence_dates_json, last_seen_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    FOREIGN_FEEDBACK_ID, FOREIGN_PROJECT_ID, "Foreign recurring issue", "high", JSON.stringify({ title: "Foreign recurring" }), "open", `foreign_${ISSUE_KEY}`, 9, JSON.stringify([FIRST, RESURFACED]), RESURFACED, FIRST,
  ])
}

let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  await seed()
  const port = 45000 + Math.floor(Math.random() * 1000)
  BASE = `http://localhost:${port}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: BASE,
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
})

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
  rmDb()
})

function authed(path: string, sid = OWNER_SID) {
  return fetch(`${BASE}${path}`, { headers: { cookie: `klav_session=${sid}` } })
}

test("GET /api/feedback/:id/memory returns dated recurrence and regression history", async () => {
  const r = await authed(`/api/feedback/${encodeURIComponent(FEEDBACK_ID)}/memory`)
  expect(r.status).toBe(200)
  const body = await r.json()

  expect(body.memory).toMatchObject({
    feedbackId: FEEDBACK_ID,
    issueKey: ISSUE_KEY,
    count: 3,
    firstSeenAt: FIRST,
    lastSeenAt: RESURFACED,
    resolvedAt: RESOLVED,
    regressed: true,
    expectationStatus: "validated",
    citedSimId: SIM_ID,
    citedSimName: "Alice QA",
  })
  expect(body.memory.dates).toEqual([FIRST, RESOLVED, RESURFACED])
  expect(body.memory.occurrences.map((o: any) => o.seenAt)).toEqual([FIRST, RESOLVED, RESURFACED])
  expect(body.memory.summary).toContain("3rd occurrence")
})

test("GET /api/projects/:id/recurring lists project-scoped recurring issues only", async () => {
  const r = await authed(`/api/projects/${encodeURIComponent(PROJECT_ID)}/recurring`)
  expect(r.status).toBe(200)
  const body = await r.json()

  expect(body.projectId).toBe(PROJECT_ID)
  expect(body.recurring).toHaveLength(1)
  expect(body.recurring[0]).toMatchObject({
    feedbackId: FEEDBACK_ID,
    issueKey: ISSUE_KEY,
    title: "Checkout submit breaks",
    count: 3,
    regressed: true,
  })
  expect(JSON.stringify(body.recurring)).not.toContain(ONE_OFF_ID)
  expect(JSON.stringify(body.recurring)).not.toContain(FOREIGN_FEEDBACK_ID)
})

test("recurring memory is project-access scoped", async () => {
  const projectRes = await authed(`/api/projects/${encodeURIComponent(PROJECT_ID)}/recurring`, OUTSIDER_SID)
  expect(projectRes.status).toBe(403)

  const feedbackRes = await authed(`/api/feedback/${encodeURIComponent(FEEDBACK_ID)}/memory`, OUTSIDER_SID)
  expect(feedbackRes.status).toBe(404)
})
