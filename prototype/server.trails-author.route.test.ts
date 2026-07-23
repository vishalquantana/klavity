// AutoSims F1: Route tests for POST /api/trails/author, GET /api/trails/author/:id,
// and POST /api/trails/:id/approve.
// Hermetic subprocess-server pattern matching server.test-accounts.route.test.ts.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Dedicated temp DB ─────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-author-route-${ts}.db`)

const TEST_SECRET = Buffer.alloc(32, 7).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// ── Schema (minimal, mirrors applySchema from db.ts) ─────────────────────────
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, contact_email TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS monitored_urls (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, url_pattern TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, UNIQUE(project_id, url_pattern))`)
await rawExec(`CREATE TABLE IF NOT EXISTS monitoring_consent (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, status TEXT NOT NULL, granted_at INTEGER, updated_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT, created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0)`)
await rawExec(`CREATE TABLE IF NOT EXISTS test_accounts (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL,
  login_email TEXT NOT NULL, password_enc TEXT NOT NULL,
  created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  UNIQUE(project_id, name))`)
await rawExec(`CREATE INDEX IF NOT EXISTS test_acc_proj_idx ON test_accounts (project_id)`)
// Trails + author_sessions tables
await rawExec(`CREATE TABLE IF NOT EXISTS trails (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, intent TEXT NOT NULL DEFAULT '', base_url TEXT NOT NULL, baseline_ref TEXT, author_kind TEXT NOT NULL DEFAULT 'human', status TEXT NOT NULL DEFAULT 'draft', created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trail_steps (id TEXT PRIMARY KEY, trail_id TEXT NOT NULL, project_id TEXT NOT NULL, idx INTEGER NOT NULL, action TEXT NOT NULL, action_value TEXT, target_json TEXT, checkpoint_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trail_runs (id TEXT PRIMARY KEY, trail_id TEXT NOT NULL, project_id TEXT NOT NULL, trigger TEXT NOT NULL DEFAULT 'manual', status TEXT NOT NULL DEFAULT 'running', llm_calls INTEGER NOT NULL DEFAULT 0, summary_json TEXT, started_at INTEGER NOT NULL, finished_at INTEGER)`)
await rawExec(`CREATE TABLE IF NOT EXISTS run_steps (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, trail_id TEXT NOT NULL, step_id TEXT NOT NULL, project_id TEXT NOT NULL, idx INTEGER NOT NULL, tier TEXT NOT NULL DEFAULT 'none', verdict TEXT NOT NULL DEFAULT 'skip', confidence REAL NOT NULL DEFAULT 0, diagnosis TEXT, healed INTEGER NOT NULL DEFAULT 0, evidence_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS locator_cache (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, trail_id TEXT NOT NULL, step_id TEXT NOT NULL, cache_key TEXT NOT NULL, resolved_selector TEXT NOT NULL, fingerprint_json TEXT, confidence REAL NOT NULL DEFAULT 1.0, source TEXT NOT NULL DEFAULT 'crystallize', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE UNIQUE INDEX IF NOT EXISTS lc_key_uq ON locator_cache(project_id, step_id)`)
await rawExec(`CREATE TABLE IF NOT EXISTS author_sessions (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, objective TEXT NOT NULL,
  base_url TEXT NOT NULL, test_account TEXT, status TEXT NOT NULL DEFAULT 'running',
  steps_json TEXT NOT NULL DEFAULT '[]', stall_reason TEXT, trail_id TEXT,
  verification_run_id TEXT, verification_verdict TEXT,
  llm_calls INTEGER NOT NULL DEFAULT 0, cost_usd REAL NOT NULL DEFAULT 0,
  created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS author_sess_proj_idx ON author_sessions (project_id, created_at)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_connectors_project ON connectors(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS mon_url_proj_idx ON monitored_urls(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS ext_tok_email_idx ON extension_tokens(email)`)

// ── Seed fixtures ─────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `admin-au-${ts}@test.local`
const ADMIN_SID = `sess_au_admin_${ts}`

const ACCOUNT_ID = `acct_au_${ts}`
const PROJECT_ID = `proj_au_${ts}`
const OTHER_PROJECT_ID = `proj_au_other_${ts}`
const OTHER_ACCOUNT_ID = `acct_au_other_${ts}`
const OTHER_EMAIL = `other-au-${ts}@test.local`
const OTHER_SID = `sess_au_other_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCOUNT_ID, "AU Test Workspace", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_au_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "Author Route Project", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_au_admin_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])

// Other project (for IDOR tests)
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OTHER_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [OTHER_ACCOUNT_ID, "Other AU Workspace", OTHER_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_au_other_${ts}`, OTHER_ACCOUNT_ID, OTHER_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [OTHER_PROJECT_ID, OTHER_ACCOUNT_ID, "Other AU Project", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_au_other_${ts}`, OTHER_PROJECT_ID, OTHER_EMAIL, "admin", null, NOW])

// Sessions
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [OTHER_SID, OTHER_EMAIL, NOW, NOW + 86400_000])

// ── Lib imports for approve test (must use env vars set before server boot) ───
// We import the lib functions directly to seed data (crystallize → trail → approve via route).
// Env is set before any import so the db singleton uses the test DB.
process.env.KLAV_SECRET = TEST_SECRET
process.env.TURSO_DATABASE_URL = "file:" + srvDbFile
process.env.TURSO_AUTH_TOKEN = ""

const { reconnectDb, applySchema } = await import("./lib/db")
const { crystallize } = await import("./lib/trails-crystallize")
const { setTrailStatus, getTrail } = await import("./lib/trails")
const { createAuthorSession, getAuthorSession } = await import("./lib/trails-author")

// Initialize the shared db singleton to point at the test DB.
const _db = reconnectDb("file:" + srvDbFile)
await applySchema(_db)

// Minimal 2-step trajectory for crystallize (from trails-creds.test.ts pattern).
function tinyTrajectory() {
  return {
    name: "Login smoke",
    intent: "log in and reach the dashboard",
    baseUrl: "https://example.com",
    authorKind: "llm" as const,
    steps: [
      {
        action: "navigate" as const,
        actionValue: "https://example.com",
        url: "https://example.com",
        domHash: "abc",
      },
      {
        action: "click" as const,
        target: { role: "button", accessibleName: "Sign in", resolvedSelector: "#sign-in" },
        url: "https://example.com",
        domHash: "def",
      },
    ],
  }
}

// ── Spawn the server on a random port ─────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let base: string

beforeAll(async () => {
  serverPort = 45000 + Math.floor(Math.random() * 1000)
  base = `http://localhost:${serverPort}`

  // NOTE: OPENROUTER_API_KEY is intentionally ABSENT so the poll test can see
  // a fast "failed" status with stallReason containing "OPENROUTER".
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
      OPENROUTER_API_KEY: undefined as any, // ensure absent
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const pid = PROJECT_ID
const otherPid = OTHER_PROJECT_ID
const adminCookie = `klav_session=${ADMIN_SID}`
const otherCookie = `klav_session=${OTHER_SID}`

// ── Tests ─────────────────────────────────────────────────────────────────────

const RUN_BROWSER = !!process.env.KLAV_E2E

test.if(RUN_BROWSER)("POST /api/trails/author validates and returns a pollable session", async () => {
  const r = await fetch(`${base}/api/trails/author?project=${pid}`, {
    method: "POST", headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ name: "Login", objective: "log in and reach the dashboard", base_url: "https://example.com" }),
  })
  expect(r.status).toBe(202)
  const { sessionId } = await r.json()
  expect(typeof sessionId).toBe("string")
  // poll: with no OPENROUTER key the session lands on failed/stalled with a clear reason — proves plumbing
  for (let i = 0; i < 40; i++) {
    const s = await (await fetch(`${base}/api/trails/author/${sessionId}?project=${pid}`, { headers: { cookie: adminCookie } })).json()
    if (s.status !== "running") {
      expect(["failed", "stalled"]).toContain(s.status)
      expect(s.stallReason).toContain("OPENROUTER")
      return
    }
    await new Promise((res) => setTimeout(res, 250))
  }
  throw new Error("never finished")
}, 15_000)

test("validation: objective 10-2000 chars, base_url http(s), unknown test_account 400", async () => {
  const bad1 = await fetch(`${base}/api/trails/author?project=${pid}`, { method: "POST", headers: { cookie: adminCookie, "content-type": "application/json" }, body: JSON.stringify({ name: "x", objective: "short", base_url: "https://a.b" }) })
  expect(bad1.status).toBe(400)
  const bad2 = await fetch(`${base}/api/trails/author?project=${pid}`, { method: "POST", headers: { cookie: adminCookie, "content-type": "application/json" }, body: JSON.stringify({ name: "x", objective: "a".repeat(20), base_url: "ftp://a.b" }) })
  expect(bad2.status).toBe(400)
  const bad3 = await fetch(`${base}/api/trails/author?project=${pid}`, { method: "POST", headers: { cookie: adminCookie, "content-type": "application/json" }, body: JSON.stringify({ name: "x", objective: "a".repeat(20), base_url: "https://a.b", test_account: "ghost" }) })
  expect(bad3.status).toBe(400)
})

// KLAVITYKLA-149: the wizard's "Who reviews it?" step (`sim_name`) must NOT be silently dropped.
// An unknown reviewer Sim is rejected with 400 — proving the field is read server-side. (A valid one
// is exercised at the lib layer below, since a browserless POST cannot run the crystallize drive.)
test("sim_name: unknown reviewer Sim → 400 (field is honored, not dropped)", async () => {
  const bad = await fetch(`${base}/api/trails/author?project=${pid}`, {
    method: "POST", headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ name: "x", objective: "a".repeat(20), base_url: "https://a.b", sim_name: "Nonexistent Reviewer" }),
  })
  expect(bad.status).toBe(400)
  expect((await bad.json()).error).toContain("Nonexistent Reviewer")
})

// KLAVITYKLA-149: a picked reviewer Sim rides the trajectory into the crystallized Trail as its
// judge persona (reused by the Judge-voice selector + run judge), so the wizard step is no longer theater.
test("crystallize persists judgePersonaId from the trajectory onto the Trail", async () => {
  const personaId = `persona_jp_${ts}`
  await rawExec(`INSERT INTO personas (id, project_id, name, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`, [personaId, pid, "Picky Reviewer", "client", NOW, NOW])
  const { trailId } = await crystallize(pid, { ...tinyTrajectory(), judgePersonaId: personaId })
  const trail = await getTrail(pid, trailId)
  expect(trail!.judgePersonaId).toBe(personaId)
})

// KLAVITYKLA-149: the reviewer survives a resume — createAuthorSession stores judge_persona_id so a
// resumed drive re-crystallizes with the same judge persona instead of dropping it.
test("createAuthorSession round-trips judgePersonaId (survives resume)", async () => {
  const personaId = `persona_sess_${ts}`
  await rawExec(`INSERT INTO personas (id, project_id, name, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`, [personaId, pid, "Session Reviewer", "client", NOW, NOW])
  const sid = await createAuthorSession(pid, { name: "s", objective: "log in and reach dashboard", baseUrl: "https://example.com", judgePersonaId: personaId })
  const s = await getAuthorSession(pid, sid)
  expect(s!.judgePersonaId).toBe(personaId)
})

test("approve: draft→active once; second approve 409; cross-project 404; unauth 401", async () => {
  // seed a draft trail directly via lib
  const { trailId } = await crystallize(pid, tinyTrajectory())
  await setTrailStatus(pid, trailId, "draft")
  const ok = await fetch(`${base}/api/trails/${trailId}/approve?project=${pid}`, { method: "POST", headers: { cookie: adminCookie } })
  expect(ok.status).toBe(200)
  expect((await ok.json()).ok).toBe(true)
  expect((await getTrail(pid, trailId))!.status).toBe("active")
  // second approve → 409 (no longer draft)
  expect((await fetch(`${base}/api/trails/${trailId}/approve?project=${pid}`, { method: "POST", headers: { cookie: adminCookie } })).status).toBe(409)
  // cross-project → 404
  expect((await fetch(`${base}/api/trails/${trailId}/approve?project=${otherPid}`, { method: "POST", headers: { cookie: otherCookie } })).status).toBe(404)
  // unauth → 401
  expect((await fetch(`${base}/api/trails/${trailId}/approve?project=${pid}`, { method: "POST" })).status).toBe(401)
})

test("GET session is project-scoped (IDOR)", async () => {
  const r = await fetch(`${base}/api/trails/author?project=${pid}`, {
    method: "POST", headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ name: "x", objective: "a".repeat(20), base_url: "https://a.b" }),
  })
  expect(r.status).toBe(202)
  const { sessionId } = await r.json()
  const foreign = await fetch(`${base}/api/trails/author/${sessionId}?project=${otherPid}`, { headers: { cookie: otherCookie } })
  expect(foreign.status).toBe(404)
})

test("GET /api/trails/author/active: 200 { active:null } when none running; 200 with running session; project-scoped", async () => {
  // Seed a running author_session row directly (no OPENROUTER key — any POST would fail quickly)
  const sessionTs = Date.now()
  const activeSid = `auth_active_test_${ts}`
  await rawExec(
    `INSERT INTO author_sessions (id,project_id,name,objective,base_url,status,created_by,created_at,updated_at) VALUES (?,?,?,?,?,'running',?,?,?)`,
    [activeSid, PROJECT_ID, "Active Session", "some long enough objective", "https://example.com", ADMIN_EMAIL, sessionTs, sessionTs],
  )

  // Our project sees it
  const r1 = await fetch(`${base}/api/trails/author/active?project=${pid}`, { headers: { cookie: adminCookie } })
  expect(r1.status).toBe(200)
  const body = await r1.json()
  expect(body.id).toBe(activeSid)
  expect(body.status).toBe("running")
  expect(body.name).toBe("Active Session")
  expect(body.active).toBe(true)

  // Other project does NOT see it → 200 with active:null (NOT a 404, which spammed the console).
  const r2 = await fetch(`${base}/api/trails/author/active?project=${otherPid}`, { headers: { cookie: otherCookie } })
  expect(r2.status).toBe(200)
  expect((await r2.json()).active).toBeNull()

  // Unauth → 401
  const r3 = await fetch(`${base}/api/trails/author/active?project=${pid}`)
  expect(r3.status).toBe(401)

  // Mark ALL running sessions for this project non-running → still 200, active:null.
  await rawExec(`UPDATE author_sessions SET status='stalled' WHERE project_id=? AND status='running'`, [PROJECT_ID])
  const r4 = await fetch(`${base}/api/trails/author/active?project=${pid}`, { headers: { cookie: adminCookie } })
  expect(r4.status).toBe(200)
  expect((await r4.json()).active).toBeNull()
})
