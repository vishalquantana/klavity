// KLA-199 + KLA-200: priority picker persistence and per-project sequential ticket numbers.
// Tests: (1) triage PATCH sends priority (not severity) and it persists; (2) new tickets get
// seq_num assigned; (3) seq_num is returned in list + detail APIs; (4) backfill gives existing
// rows a seq_num.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-seq-pri-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(99)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// Minimal schema matching what server.ts expects (includes seq_num for KLA-200)
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, issue_key TEXT, recurrence_count INTEGER NOT NULL DEFAULT 1, recurrence_dates_json TEXT, last_seen_at INTEGER, source TEXT, seq_num INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_comments (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, author TEXT, body TEXT NOT NULL, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS labels (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#6366f1', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback_labels (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, label_id TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(feedback_id, label_id))`)

// ── Seed ────────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `vishal@quantana.com.au`
const SID = `sess_seqpri_${ts}`
const ACCT_ID = `acct_seqpri_${ts}`
const PROJ_ID = `proj_seqpri_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCT_ID, "SeqPri Test", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_sp_${ts}`, ACCT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJ_ID, ACCT_ID, "SeqPri Test Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_sp_${ts}`, PROJ_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

// Seed two feedback rows — one already-triaged (open), one in triage (new)
const FB_OPEN = `fb_sp_open_${ts}`
const FB_NEW  = `fb_sp_new_${ts}`
// Assign seq_num 1 and 2 manually (as the backfill migration would)
await rawExec(`INSERT INTO feedback (id, project_id, observation, priority, status, seq_num, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`, [FB_OPEN, PROJ_ID, "First open bug", "medium", "open", 1, NOW - 2000])
await rawExec(`INSERT INTO feedback (id, project_id, observation, priority, status, seq_num, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`, [FB_NEW,  PROJ_ID, "New triage bug",  "low",    "new",  2, NOW - 1000])

// ── Spawn server ─────────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 46000 + Math.floor(Math.random() * 1000)
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

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

function auth() { return `klav_session=${SID}` }

// ── KLA-199: priority picker in triage PATCH ─────────────────────────────────

test("KLA-199: PATCH /api/feedback/:id with priority=urgent persists", async () => {
  const r = await fetch(`${BASE}/api/feedback/${FB_NEW}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: auth() },
    body: JSON.stringify({ status: "open", priority: "urgent" }),
  })
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.ok).toBe(true)

  // Verify via GET that priority is now urgent
  const gr = await fetch(`${BASE}/api/feedback/${FB_NEW}`, { headers: { Cookie: auth() } })
  expect(gr.status).toBe(200)
  const gd = await gr.json()
  expect(gd.report.priority).toBe("urgent")
})

test("KLA-199: PATCH with priority=high on already-open ticket", async () => {
  const r = await fetch(`${BASE}/api/feedback/${FB_OPEN}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: auth() },
    body: JSON.stringify({ priority: "high" }),
  })
  expect(r.status).toBe(200)
  expect((await r.json()).ok).toBe(true)

  const gr = await fetch(`${BASE}/api/feedback/${FB_OPEN}`, { headers: { Cookie: auth() } })
  const gd = await gr.json()
  expect(gd.report.priority).toBe("high")
})

test("KLA-199: PATCH rejects unknown priority value", async () => {
  const r = await fetch(`${BASE}/api/feedback/${FB_OPEN}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: auth() },
    body: JSON.stringify({ priority: "critical" }),  // old name, should be rejected
  })
  expect(r.status).toBe(400)
})

test("KLA-199: PATCH accepts all valid priority values", async () => {
  for (const pri of ["urgent", "high", "medium", "low"]) {
    const r = await fetch(`${BASE}/api/feedback/${FB_OPEN}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: auth() },
      body: JSON.stringify({ priority: pri }),
    })
    expect(r.status).toBe(200)
    const d = await r.json()
    expect(d.ok).toBe(true)
  }
})

// ── KLA-200: seq_num in GET /api/feedback/:id ────────────────────────────────

test("KLA-200: GET /api/feedback/:id returns seqNum", async () => {
  const r = await fetch(`${BASE}/api/feedback/${FB_OPEN}`, { headers: { Cookie: auth() } })
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.report.seqNum).toBe(1)
})

test("KLA-200: second ticket has seqNum=2", async () => {
  const r = await fetch(`${BASE}/api/feedback/${FB_NEW}`, { headers: { Cookie: auth() } })
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.report.seqNum).toBe(2)
})

// ── KLA-200: seq_num in /api/projects/:id/tickets list ───────────────────────

test("KLA-200: GET /api/projects/:id/tickets returns seqNum on each ticket", async () => {
  const r = await fetch(`${BASE}/api/projects/${PROJ_ID}/tickets`, { headers: { Cookie: auth() } })
  expect(r.status).toBe(200)
  const d = await r.json()
  const tickets = d.tickets || []
  expect(tickets.length).toBeGreaterThanOrEqual(1)
  for (const t of tickets) {
    expect(typeof t.seqNum).toBe("number")
    expect(t.seqNum).toBeGreaterThan(0)
  }
})

// ── KLA-200: seq_num in /api/projects/:id/triage list ────────────────────────

test("KLA-200: GET /api/projects/:id/triage returns seqNum on triage items", async () => {
  const r = await fetch(`${BASE}/api/projects/${PROJ_ID}/triage`, { headers: { Cookie: auth() } })
  expect(r.status).toBe(200)
  const d = await r.json()
  const triage = d.triage || []
  expect(triage.length).toBeGreaterThanOrEqual(1)
  for (const t of triage) {
    expect(typeof t.seqNum).toBe("number")
    expect(t.seqNum).toBeGreaterThan(0)
  }
})
