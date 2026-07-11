// KLAVITYKLA-205: Route tests for the client status portal.
// Tests:
//   (A) GET /shared/project/:token — valid token serves the project-status HTML
//   (B) GET /shared/project/:token/data — valid token returns JSON portal data
//   (C) GET /shared/project/<bad-token> → 404 (unknown / bad format)
//   (D) No cross-project data leak: token for project A cannot fetch project B data
//   (E) POST /api/projects/:pid/share-token — generates token (admin only)
//   (F) GET  /api/projects/:pid/share-token — returns hasToken (admin only)
//   (G) DELETE /api/projects/:pid/share-token — revokes token; subsequent portal GET → 404
//   (H) Non-admin cannot manage share token (403)
//   (I) Token format guard: garbage strings → 404 before DB hit
//   (J) Rate limit integration: excessive requests → 429

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Dedicated temp DB ─────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-proj-portal-${ts}.db`)
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
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, contact_email TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trails (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, intent TEXT NOT NULL DEFAULT '', base_url TEXT NOT NULL, baseline_ref TEXT, author_kind TEXT NOT NULL DEFAULT 'human', status TEXT NOT NULL DEFAULT 'draft', created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trail_steps (id TEXT PRIMARY KEY, trail_id TEXT NOT NULL, project_id TEXT NOT NULL, idx INTEGER NOT NULL, action TEXT NOT NULL, action_value TEXT, target_json TEXT, checkpoint_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trail_runs (id TEXT PRIMARY KEY, trail_id TEXT NOT NULL, project_id TEXT NOT NULL, trigger TEXT NOT NULL DEFAULT 'manual', status TEXT NOT NULL DEFAULT 'running', llm_calls INTEGER NOT NULL DEFAULT 0, summary_json TEXT, started_at INTEGER NOT NULL, finished_at INTEGER)`)
await rawExec(`CREATE TABLE IF NOT EXISTS run_steps (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, trail_id TEXT NOT NULL, step_id TEXT NOT NULL, project_id TEXT NOT NULL, idx INTEGER NOT NULL, tier TEXT NOT NULL DEFAULT 'none', verdict TEXT NOT NULL DEFAULT 'skip', confidence REAL NOT NULL DEFAULT 0, diagnosis TEXT, healed INTEGER NOT NULL DEFAULT 0, evidence_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS locator_cache (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, trail_id TEXT NOT NULL, step_id TEXT NOT NULL, cache_key TEXT NOT NULL, resolved_selector TEXT NOT NULL, fingerprint_json TEXT, confidence REAL NOT NULL DEFAULT 1.0, source TEXT NOT NULL DEFAULT 'crystallize', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE UNIQUE INDEX IF NOT EXISTS lc_key_uq ON locator_cache(project_id, step_id)`)
await rawExec(`CREATE TABLE IF NOT EXISTS author_sessions (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, objective TEXT NOT NULL, base_url TEXT NOT NULL, test_account TEXT, status TEXT NOT NULL DEFAULT 'running', steps_json TEXT NOT NULL DEFAULT '[]', stall_reason TEXT, trail_id TEXT, verification_run_id TEXT, verification_verdict TEXT, llm_calls INTEGER NOT NULL DEFAULT 0, cost_usd REAL NOT NULL DEFAULT 0, created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS findings (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, run_id TEXT NOT NULL, step_id TEXT, trail_id TEXT NOT NULL, kind TEXT NOT NULL, title TEXT NOT NULL, evidence_json TEXT, ground_quote TEXT, confidence REAL NOT NULL DEFAULT 0, dedup_key TEXT NOT NULL, recurrence INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'queued', connector_ref TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS monitored_urls (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, url_pattern TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, UNIQUE(project_id, url_pattern))`)
await rawExec(`CREATE TABLE IF NOT EXISTS monitoring_consent (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, status TEXT NOT NULL, granted_at INTEGER, updated_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT, created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0)`)
await rawExec(`CREATE TABLE IF NOT EXISTS test_accounts (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, login_email TEXT NOT NULL, password_enc TEXT NOT NULL, created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, UNIQUE(project_id, name))`)
await rawExec(`CREATE INDEX IF NOT EXISTS test_acc_proj_idx ON test_accounts (project_id)`)
await rawExec(`CREATE TABLE IF NOT EXISTS walk_share_tokens (id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, run_id TEXT NOT NULL, project_id TEXT NOT NULL, created_by TEXT, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS wst_token_hash_idx ON walk_share_tokens (token_hash)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_connectors_project ON connectors(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS mon_url_proj_idx ON monitored_urls(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS ext_tok_email_idx ON extension_tokens(email)`)

// ── Fixtures ──────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `admin-pp-${ts}@test.local`
const ADMIN_SID   = `sess_pp_admin_${ts}`
const MEMBER_EMAIL = `member-pp-${ts}@test.local`
const MEMBER_SID   = `sess_pp_member_${ts}`
const OTHER_EMAIL  = `other-pp-${ts}@test.local`
const OTHER_SID    = `sess_pp_other_${ts}`
const ACCOUNT_ID   = `acct_pp_${ts}`
const PROJECT_ID   = `proj_pp_${ts}`
const OTHER_ACCOUNT_ID = `acct_pp_other_${ts}`
const OTHER_PROJECT_ID = `proj_pp_other_${ts}`
const NOW = Date.now()

// Main project + admin
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCOUNT_ID, "PP Test Workspace", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_pp_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "Acme App", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_pp_admin_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])

// Non-admin member on the same project
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [MEMBER_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_pp_m_${ts}`, ACCOUNT_ID, MEMBER_EMAIL, "member", NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_pp_member_${ts}`, PROJECT_ID, MEMBER_EMAIL, "member", null, NOW])

// Other user / project (for cross-project leak test)
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OTHER_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [OTHER_ACCOUNT_ID, "PP Other Workspace", OTHER_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_pp_other_${ts}`, OTHER_ACCOUNT_ID, OTHER_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [OTHER_PROJECT_ID, OTHER_ACCOUNT_ID, "Other Corp App", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_pp_other_${ts}`, OTHER_PROJECT_ID, OTHER_EMAIL, "admin", null, NOW])

await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [MEMBER_SID, MEMBER_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [OTHER_SID, OTHER_EMAIL, NOW, NOW + 86400_000])

// Seed some trail runs for the main project
await rawExec(`INSERT INTO trails (id, project_id, name, intent, base_url, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [`trail_pp_${ts}`, PROJECT_ID, "Login flow", "reach dashboard", "https://acme.test/", "active", NOW, NOW])
await rawExec(`INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, started_at, finished_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [`run_pp_${ts}`, `trail_pp_${ts}`, PROJECT_ID, "manual", "green", 2, NOW - 3600_000, NOW - 3500_000])

// Seed a finding
await rawExec(`INSERT INTO findings (id, project_id, run_id, trail_id, kind, title, dedup_key, confidence, recurrence, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [`find_pp_${ts}`, PROJECT_ID, `run_pp_${ts}`, `trail_pp_${ts}`, "regression", "Button missing", `dm:pp:${ts}`, 0.9, 1, "queued", NOW, NOW])

// ── Bootstrap db + schema ─────────────────────────────────────────────────────
process.env.KLAV_SECRET = TEST_SECRET
process.env.TURSO_DATABASE_URL = "file:" + srvDbFile
process.env.TURSO_AUTH_TOKEN = ""

const { reconnectDb, applySchema } = await import("./lib/db")
const _db = reconnectDb("file:" + srvDbFile)
await applySchema(_db)

// ── Spawn subprocess server ───────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let base: string

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
      OPENROUTER_API_KEY: undefined as any,
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  // Wait for server ready (max 15s)
  const deadline = Date.now() + 15_000
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

function cookie(sid: string) {
  return { headers: { Cookie: `klav_session=${sid}` } }
}

// Helper: generate a share token via API
async function genToken(): Promise<{ shareUrl: string; token: string }> {
  const r = await fetch(`${base}/api/projects/${PROJECT_ID}/share-token`, {
    method: "POST",
    ...cookie(ADMIN_SID),
  })
  expect(r.status).toBe(201)
  return r.json()
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test("(E) POST /api/projects/:pid/share-token — admin generates a share token", async () => {
  const r = await fetch(`${base}/api/projects/${PROJECT_ID}/share-token`, {
    method: "POST",
    ...cookie(ADMIN_SID),
  })
  expect(r.status).toBe(201)
  const body = await r.json()
  expect(body.ok).toBe(true)
  expect(typeof body.token).toBe("string")
  expect(body.token).toMatch(/^[a-f0-9]{64}$/)
  expect(body.shareUrl).toContain("/shared/project/")
  expect(body.shareUrl).toContain(body.token)
})

test("(F) GET /api/projects/:pid/share-token — admin can check if token exists", async () => {
  // Ensure a token exists
  await genToken()
  const r = await fetch(`${base}/api/projects/${PROJECT_ID}/share-token`, cookie(ADMIN_SID))
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.hasToken).toBe(true)
})

test("(A) GET /shared/project/:token — valid token serves HTML portal page", async () => {
  const { token } = await genToken()
  const r = await fetch(`${base}/shared/project/${token}`)
  expect(r.status).toBe(200)
  expect(r.headers.get("content-type")).toContain("text/html")
  const body = await r.text()
  expect(body).toContain("Klavity")
  // Must have noindex header
  expect(r.headers.get("x-robots-tag")).toContain("noindex")
  // Must have no-store cache-control
  expect(r.headers.get("cache-control")).toContain("no-store")
})

test("(B) GET /shared/project/:token/data — valid token returns JSON portal data", async () => {
  const { token } = await genToken()
  const r = await fetch(`${base}/shared/project/${token}/data`)
  expect(r.status).toBe(200)
  expect(r.headers.get("content-type")).toContain("application/json")
  const body = await r.json()

  // Data shape checks
  expect(typeof body.projectName).toBe("string")
  expect(body.projectName).toBe("Acme App")
  expect(typeof body.generatedAt).toBe("number")
  expect(Array.isArray(body.trails)).toBe(true)
  expect(typeof body.counts).toBe("object")
  expect(typeof body.counts.bugsReported).toBe("number")
  expect(typeof body.counts.regressionsFound).toBe("number")
  expect(Array.isArray(body.recentActivity)).toBe(true)

  // Security: no account internals
  expect(body).not.toHaveProperty("accountId")
  expect(body).not.toHaveProperty("modal_config_json")
  expect(body).not.toHaveProperty("client_portal_token_hash")

  // Trail data present
  expect(body.trails.length).toBeGreaterThanOrEqual(1)
  const trail = body.trails[0]
  expect(trail.trailName).toBe("Login flow")
  expect(["green","amber","red","none"]).toContain(trail.health)

  // Cache headers
  expect(r.headers.get("cache-control")).toContain("no-store")
})

test("(C) GET /shared/project/<unknown-token> → 404", async () => {
  // A valid-format but unknown token
  const fakeToken = "a".repeat(64)
  const r = await fetch(`${base}/shared/project/${fakeToken}`)
  expect(r.status).toBe(404)
})

test("(I) Token format guard — garbage token → 404 (short, non-hex)", async () => {
  const garbage = "not-a-token"
  const r = await fetch(`${base}/shared/project/${garbage}`)
  expect(r.status).toBe(404)
})

test("(I) Token format guard — SQL injection attempt → 404", async () => {
  const injection = "' OR '1'='1"
  const r = await fetch(`${base}/shared/project/${encodeURIComponent(injection)}`)
  expect(r.status).toBe(404)
})

test("(D) No cross-project data leak — token resolves only its own project", async () => {
  // Generate a token for Project A
  const { token: tokenA } = await genToken()

  // Verify it returns Project A data
  const r = await fetch(`${base}/shared/project/${tokenA}/data`)
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.projectName).toBe("Acme App")

  // The other project's name must NOT appear in the response
  expect(JSON.stringify(body)).not.toContain("Other Corp App")
})

test("(G) DELETE /api/projects/:pid/share-token — revokes token; portal → 404", async () => {
  const { token } = await genToken()

  // Verify it works before revocation
  const before = await fetch(`${base}/shared/project/${token}`)
  expect(before.status).toBe(200)

  // Revoke
  const del = await fetch(`${base}/api/projects/${PROJECT_ID}/share-token`, {
    method: "DELETE",
    ...cookie(ADMIN_SID),
  })
  expect(del.status).toBe(200)
  const delBody = await del.json()
  expect(delBody.ok).toBe(true)
  expect(delBody.revoked).toBe(true)

  // Portal should now 404
  const after = await fetch(`${base}/shared/project/${token}`)
  expect(after.status).toBe(404)
})

test("(H) Non-admin member cannot manage share token — 403", async () => {
  const r = await fetch(`${base}/api/projects/${PROJECT_ID}/share-token`, {
    method: "POST",
    ...cookie(MEMBER_SID),
  })
  expect(r.status).toBe(403)
})

test("(H) Other-project admin cannot manage this project's share token — 403", async () => {
  const r = await fetch(`${base}/api/projects/${PROJECT_ID}/share-token`, {
    method: "POST",
    ...cookie(OTHER_SID),
  })
  expect(r.status).toBe(403)
})

test("(E) Regenerating the token invalidates the old token", async () => {
  const { token: token1 } = await genToken()
  const { token: token2 } = await genToken()

  // token1 should no longer work
  const r1 = await fetch(`${base}/shared/project/${token1}`)
  expect(r1.status).toBe(404)

  // token2 should work
  const r2 = await fetch(`${base}/shared/project/${token2}`)
  expect(r2.status).toBe(200)
})

test("(J) Rate limit: excessive requests to portal page endpoint → 429", async () => {
  const { token } = await genToken()
  // Use the page endpoint (same 120/min rate limit). Send 130 sequential requests
  // so we're guaranteed to exceed the 120/min window without relying on parallel timing.
  let got429 = false
  for (let i = 0; i < 130; i++) {
    const r = await fetch(`${base}/shared/project/${token}`)
    if (r.status === 429) {
      got429 = true
      break
    }
  }
  expect(got429).toBe(true)
})
