// KLA-214: Tests for the public /r/:token report status page.
// Hermetic subprocess-server pattern (mirrors server.walk-report.route.test.ts).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Dedicated temp DB ─────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-public-report-status-${ts}.db`)

const TEST_SECRET = Buffer.alloc(32, 7).toString("base64")

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
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, widget_report_gate TEXT NOT NULL DEFAULT 'email', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  sim_id TEXT,
  actor_email TEXT,
  url_host TEXT,
  url_path TEXT,
  observation TEXT,
  sentiment TEXT,
  severity TEXT,
  priority TEXT,
  screenshot_id TEXT,
  suggested_bug_json TEXT,
  cited_trait_ids_json TEXT,
  source_quote TEXT,
  source_transcript_id TEXT,
  source_date INTEGER,
  plane_issue_key TEXT,
  plane_issue_url TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  assignee TEXT,
  notes TEXT,
  updated_at INTEGER,
  contact_email TEXT,
  source_referrer TEXT,
  issue_key TEXT,
  recurrence_count INTEGER NOT NULL DEFAULT 1,
  recurrence_dates_json TEXT,
  last_seen_at INTEGER,
  client_context_json TEXT,
  annotations_json TEXT,
  source TEXT,
  suggested_label_ids_json TEXT,
  public_token TEXT,
  created_at INTEGER NOT NULL
)`)
await rawExec(`CREATE UNIQUE INDEX IF NOT EXISTS feedback_public_token_idx ON feedback (public_token) WHERE public_token IS NOT NULL`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT, created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0)`)
await rawExec(`CREATE INDEX IF NOT EXISTS ext_tok_email_idx ON extension_tokens(email)`)
await rawExec(`CREATE TABLE IF NOT EXISTS monitored_urls (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, url_pattern TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, UNIQUE(project_id, url_pattern))`)
await rawExec(`CREATE TABLE IF NOT EXISTS monitoring_consent (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, status TEXT NOT NULL, granted_at INTEGER, updated_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS review_counts (project_id TEXT NOT NULL, day TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (project_id, day))`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_connectors_project ON connectors(project_id)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS screenshots (id TEXT PRIMARY KEY, project_id TEXT, s3_key TEXT NOT NULL, bucket TEXT NOT NULL, content_type TEXT NOT NULL, acl TEXT NOT NULL DEFAULT 'private', bytes INTEGER, owner_email TEXT, expires_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS widget_pings (project_id TEXT NOT NULL, host TEXT NOT NULL, first_seen INTEGER NOT NULL, last_seen INTEGER NOT NULL, hits INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(project_id, host))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback_replays (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, events_gz TEXT NOT NULL, n_events INTEGER, bytes INTEGER, trimmed INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS expectations (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, title TEXT NOT NULL, area TEXT, url_path TEXT, status TEXT NOT NULL DEFAULT 'candidate', source_refs_json TEXT NOT NULL DEFAULT '[]', corroboration_json TEXT NOT NULL DEFAULT '{}', dedup_key TEXT NOT NULL, enforced_step_id TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS labels (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#6366f1', created_at INTEGER NOT NULL, UNIQUE(project_id, name))`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_labels (label_id TEXT NOT NULL, feedback_id TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(label_id, feedback_id))`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_comments (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, author TEXT, body TEXT NOT NULL, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_assignment_invites (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, invited_by TEXT, feedback_id TEXT, status TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL, last_sent_at INTEGER, accepted_at INTEGER, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS ai_calls (id TEXT PRIMARY KEY, created_at INTEGER NOT NULL, type TEXT NOT NULL, model TEXT NOT NULL, account_id TEXT, feature TEXT, actor_email TEXT, project_id TEXT, input_tokens INTEGER, output_tokens INTEGER, cost_usd REAL, ok INTEGER NOT NULL DEFAULT 1)`)
await rawExec(`CREATE TABLE IF NOT EXISTS daily_ai_spend (day TEXT PRIMARY KEY, reserved_usd REAL NOT NULL DEFAULT 0)`)
await rawExec(`CREATE TABLE IF NOT EXISTS error_tickets (signature TEXT PRIMARY KEY, ticket_key TEXT, ticket_url TEXT, count INTEGER NOT NULL DEFAULT 1, first_seen INTEGER NOT NULL, last_seen INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_migrations (key TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS walk_share_tokens (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, run_id TEXT NOT NULL, project_id TEXT NOT NULL, created_by TEXT, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS wst_token_hash_idx ON walk_share_tokens (token_hash)`)

// ── Fixtures ──────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `admin-prs-${ts}@test.local`
const ADMIN_SID = `sess_prs_admin_${ts}`
const ACCOUNT_ID = `acct_prs_${ts}`
const PROJECT_ID = `proj_prs_${ts}`
const OTHER_PROJECT_ID = `proj_prs_other_${ts}`
const OTHER_ACCOUNT_ID = `acct_prs_other_${ts}`
const OTHER_EMAIL = `other-prs-${ts}@test.local`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCOUNT_ID, "PRS Test Account", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_prs_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, widget_report_gate, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "PRS Route Project", "active", "auto", 200, "named", '{}', "support", "anonymous", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_prs_admin_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OTHER_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [OTHER_ACCOUNT_ID, "PRS Other Account", OTHER_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_prs_other_${ts}`, OTHER_ACCOUNT_ID, OTHER_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, widget_report_gate, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [OTHER_PROJECT_ID, OTHER_ACCOUNT_ID, "PRS Other Project", "active", "auto", 200, "named", '{}', "support", "anonymous", NOW, NOW])

// ── Seed some feedback rows with known public tokens ──────────────────────────
// Report A: a "new" report (received, not yet triaged)
const REPORT_A_TOKEN = "a".repeat(64)  // valid 64-char hex pattern (all 'a')
const REPORT_A_ID = `fb_prs_a_${ts}`
await rawExec(
  `INSERT INTO feedback (id, project_id, actor_email, url_host, url_path, observation, suggested_bug_json, status, priority, recurrence_count, recurrence_dates_json, last_seen_at, created_at, public_token)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [REPORT_A_ID, PROJECT_ID, null, "app.example.com", "/dashboard", "The login button does nothing on mobile.", '{"title":"Login button unresponsive on mobile"}', "new", "high", 1, JSON.stringify([NOW]), NOW, NOW, REPORT_A_TOKEN],
)

// Report B: an "open" report (triaged/in-progress)
const REPORT_B_TOKEN = "b".repeat(64)
const REPORT_B_ID = `fb_prs_b_${ts}`
await rawExec(
  `INSERT INTO feedback (id, project_id, actor_email, url_host, url_path, observation, status, priority, recurrence_count, recurrence_dates_json, last_seen_at, plane_issue_key, created_at, public_token)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [REPORT_B_ID, PROJECT_ID, null, "app.example.com", "/settings", "Settings page crashes on save.", "open", "medium", 3, JSON.stringify([NOW, NOW, NOW]), NOW, "KLAVITYKLA-42", NOW, REPORT_B_TOKEN],
)

// Report C: a "done" report (fixed)
const REPORT_C_TOKEN = "c".repeat(64)
const REPORT_C_ID = `fb_prs_c_${ts}`
await rawExec(
  `INSERT INTO feedback (id, project_id, actor_email, url_host, url_path, observation, status, priority, recurrence_count, recurrence_dates_json, last_seen_at, created_at, public_token)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [REPORT_C_ID, PROJECT_ID, null, "app.example.com", "/reports", "Export to CSV silently fails.", "done", "low", 1, JSON.stringify([NOW]), NOW, NOW, REPORT_C_TOKEN],
)

// Report D: belongs to OTHER project (cross-project isolation check)
const REPORT_D_TOKEN = "d".repeat(64)
const REPORT_D_ID = `fb_prs_d_${ts}`
await rawExec(
  `INSERT INTO feedback (id, project_id, actor_email, url_host, url_path, observation, status, priority, recurrence_count, recurrence_dates_json, last_seen_at, created_at, public_token)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [REPORT_D_ID, OTHER_PROJECT_ID, null, "other.example.com", "/other", "Unrelated report from another project.", "new", "low", 1, JSON.stringify([NOW]), NOW, NOW, REPORT_D_TOKEN],
)

// ── Connect db in same process (so db.ts exports are ready for applySchema) ──
process.env.KLAV_SECRET = TEST_SECRET
process.env.TURSO_DATABASE_URL = "file:" + srvDbFile
process.env.TURSO_AUTH_TOKEN = ""

const { reconnectDb, applySchema } = await import("./lib/db")
const _db = reconnectDb("file:" + srvDbFile)
await applySchema(_db)

// ── Spawn subprocess server ────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let base: string

beforeAll(async () => {
  serverPort = 46100 + Math.floor(Math.random() * 900)
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
      OPENROUTER_API_KEY: undefined as any,
    },
    stdout: "pipe",
    stderr: "pipe",
  })

  // Wait for server ready (max 10s)
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

// ── Tests ─────────────────────────────────────────────────────────────────────

test("GET /r/<valid-token> returns 200 HTML status page", async () => {
  const res = await fetch(`${base}/r/${REPORT_A_TOKEN}`)
  expect(res.status).toBe(200)
  expect(res.headers.get("content-type")).toContain("text/html")
  const body = await res.text()
  expect(body).toContain("<!DOCTYPE html>")
  expect(body).toContain("Klavity")
  // Title derived from suggestedBug.title
  expect(body).toContain("Login button unresponsive on mobile")
  // Should show submitted date
  expect(body).toContain("Submitted")
  // Timeline present
  expect(body).toContain("Received")
  expect(body).toContain("Triaged")
  expect(body).toContain("In progress")
})

test("GET /r/<valid-token> for 'new' status shows Received as active step", async () => {
  const res = await fetch(`${base}/r/${REPORT_A_TOKEN}`)
  const body = await res.text()
  // The 'new' status means "Received" is the active step
  expect(body).toContain("Received")
  // High priority badge should appear
  expect(body).toContain("high")
})

test("GET /r/<valid-token> for 'open' status shows In progress step", async () => {
  const res = await fetch(`${base}/r/${REPORT_B_TOKEN}`)
  expect(res.status).toBe(200)
  const body = await res.text()
  expect(body).toContain("Settings page crashes on save")
  // Open = In progress active
  expect(body).toContain("In progress")
  // Has plane issue key tracker ref
  expect(body).toContain("KLAVITYKLA-42")
  // Recurrence note for 3 occurrences
  expect(body).toContain("3 times")
})

test("GET /r/<valid-token> for 'done' status shows Fixed step", async () => {
  const res = await fetch(`${base}/r/${REPORT_C_TOKEN}`)
  expect(res.status).toBe(200)
  const body = await res.text()
  expect(body).toContain("Export to CSV silently fails")
  expect(body).toContain("Fixed")
})

test("GET /r/<unknown-token> returns 404", async () => {
  const unknownToken = "e".repeat(64)
  const res = await fetch(`${base}/r/${unknownToken}`)
  expect(res.status).toBe(404)
})

test("GET /r/<malformed-token> returns 404 (not 500)", async () => {
  // Short token — should 404 cleanly (no DB query)
  const res = await fetch(`${base}/r/abc123`)
  expect(res.status).toBe(404)
  // Contains path that doesn't match regex at all
  const res2 = await fetch(`${base}/r/`)
  // Trailing slash — no match → 404
  expect(res2.status).toBe(404)
})

test("GET /r/<valid-token> for other project token returns 200 (no cross-project info leak)", async () => {
  // Token D belongs to OTHER_PROJECT — /r/ lookup is by token only (no project scope),
  // so it must resolve correctly without leaking the project_id or any other project's data.
  const res = await fetch(`${base}/r/${REPORT_D_TOKEN}`)
  expect(res.status).toBe(200)
  const body = await res.text()
  // Only D's own observation is shown — not A/B/C observations
  expect(body).toContain("Unrelated report from another project")
  expect(body).not.toContain("Login button")
  expect(body).not.toContain("Settings page crashes")
})

test("GET /r/ route does not expose session-protected dashboard internals", async () => {
  const res = await fetch(`${base}/r/${REPORT_A_TOKEN}`)
  const body = await res.text()
  // Must not contain project IDs, account IDs, internal routes
  expect(body).not.toContain(PROJECT_ID)
  expect(body).not.toContain(ACCOUNT_ID)
  // Must not expose internal dashboard query-param links or API routes
  expect(body).not.toContain("/dashboard?project=")
  expect(body).not.toContain("/api/")
  // Must not contain actor_email (null in our fixture) or any PII not submitted by reporter
  expect(body).not.toContain(ADMIN_EMAIL)
})

test("GET /r/ page has cache-control: no-store header (status may change)", async () => {
  const res = await fetch(`${base}/r/${REPORT_A_TOKEN}`)
  expect(res.headers.get("cache-control")).toBe("no-store")
})

test("GET /r/ page has noindex robots meta tag", async () => {
  const res = await fetch(`${base}/r/${REPORT_A_TOKEN}`)
  const body = await res.text()
  expect(body).toContain("noindex")
})

// ── DB unit: feedbackByPublicToken lookup ──────────────────────────────────────
test("feedbackByPublicToken: resolves correct row by token", async () => {
  const { feedbackByPublicToken } = await import("./lib/db")
  const report = await feedbackByPublicToken(REPORT_A_TOKEN)
  expect(report).not.toBeNull()
  expect(report!.title).toBe("Login button unresponsive on mobile")
  expect(report!.status).toBe("new")
  expect(report!.priority).toBe("high")
  expect(report!.urlHost).toBe("app.example.com")
})

test("feedbackByPublicToken: returns null for unknown token", async () => {
  const { feedbackByPublicToken } = await import("./lib/db")
  const report = await feedbackByPublicToken("f".repeat(64))
  expect(report).toBeNull()
})

test("feedbackByPublicToken: returns null for malformed token (not 64 hex chars)", async () => {
  const { feedbackByPublicToken } = await import("./lib/db")
  expect(await feedbackByPublicToken("")).toBeNull()
  expect(await feedbackByPublicToken("abc")).toBeNull()
  expect(await feedbackByPublicToken("a".repeat(63))).toBeNull()
  expect(await feedbackByPublicToken("Z".repeat(64))).toBeNull() // uppercase not allowed
})

test("feedbackByPublicToken: does not expose actor_email", async () => {
  const { feedbackByPublicToken } = await import("./lib/db")
  const report = await feedbackByPublicToken(REPORT_A_TOKEN)
  expect(report).not.toBeNull()
  // PublicReportStatus type has no actorEmail field
  expect((report as any).actorEmail).toBeUndefined()
  expect((report as any).actor_email).toBeUndefined()
})

test("getFeedbackPublicToken: returns token for known feedback id", async () => {
  const { getFeedbackPublicToken } = await import("./lib/db")
  const tok = await getFeedbackPublicToken(REPORT_A_ID)
  expect(tok).toBe(REPORT_A_TOKEN)
})

test("getFeedbackPublicToken: returns null for unknown feedback id", async () => {
  const { getFeedbackPublicToken } = await import("./lib/db")
  const tok = await getFeedbackPublicToken("fb_nonexistent")
  expect(tok).toBeNull()
})

// ── Integration: authenticated submit creates a public_token and returns status_url ──
// An authed (session-cookie) submission → resolved project → feedback persisted → status_url returned.
test("POST /api/feedback (authed) creates report with public_token and returns status_url", async () => {
  const form = new FormData()
  form.append("project_id", PROJECT_ID)
  form.append("description", "Test report for public token check")
  form.append("page_url", "https://app.example.com/some-page")

  const res = await fetch(`${base}/api/feedback`, {
    method: "POST",
    headers: { "Cookie": `klav_session=${ADMIN_SID}` },
    body: form,
  })
  expect(res.status).toBe(200)
  const data = await res.json() as any
  expect(data.saved).toBe(true)
  // status_url must be present and point to /r/<64-hex>
  expect(data.status_url).toBeDefined()
  expect(data.status_url).toMatch(/\/r\/[0-9a-f]{64}$/)

  // Follow the status_url — must return 200 HTML
  const statusRes = await fetch(data.status_url)
  expect(statusRes.status).toBe(200)
  expect(statusRes.headers.get("content-type")).toContain("text/html")
})
