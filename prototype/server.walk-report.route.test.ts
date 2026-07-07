// Task 3: Route tests for walk-report PDF + share-link endpoints.
// Hermetic subprocess-server pattern (mirrors server.trails-author.route.test.ts).
// PDF renderer is stubbed via KLAV_TEST_FAKE_PDF=1 in the child process env — no Chromium in route tests.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Dedicated temp DB ─────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-walk-report-route-${ts}.db`)

const TEST_SECRET = Buffer.alloc(32, 9).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// ── Schema ────────────────────────────────────────────────────────────────────
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, contact_email TEXT, created_at INTEGER NOT NULL)`)
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
await rawExec(`CREATE TABLE IF NOT EXISTS findings (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, run_id TEXT NOT NULL, step_id TEXT, trail_id TEXT NOT NULL, kind TEXT NOT NULL, title TEXT NOT NULL, evidence_json TEXT, ground_quote TEXT, confidence REAL NOT NULL DEFAULT 0, dedup_key TEXT NOT NULL, recurrence INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'queued', connector_ref TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
// Walk share tokens table
await rawExec(`CREATE TABLE IF NOT EXISTS walk_share_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  run_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  created_by TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
)`)
await rawExec(`CREATE INDEX IF NOT EXISTS wst_token_hash_idx ON walk_share_tokens (token_hash)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_connectors_project ON connectors(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS mon_url_proj_idx ON monitored_urls(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS ext_tok_email_idx ON extension_tokens(email)`)

// ── Fixtures ──────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `admin-wr-${ts}@test.local`
const ADMIN_SID = `sess_wr_admin_${ts}`
const OTHER_EMAIL = `other-wr-${ts}@test.local`
const OTHER_SID = `sess_wr_other_${ts}`
const ACCOUNT_ID = `acct_wr_${ts}`
const PROJECT_ID = `proj_wr_${ts}`
const OTHER_ACCOUNT_ID = `acct_wr_other_${ts}`
const OTHER_PROJECT_ID = `proj_wr_other_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCOUNT_ID, "WR Test Workspace", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_wr_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "WR Route Project", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_wr_admin_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OTHER_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [OTHER_ACCOUNT_ID, "WR Other Workspace", OTHER_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_wr_other_${ts}`, OTHER_ACCOUNT_ID, OTHER_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [OTHER_PROJECT_ID, OTHER_ACCOUNT_ID, "WR Other Project", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_wr_other_${ts}`, OTHER_PROJECT_ID, OTHER_EMAIL, "admin", null, NOW])

await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [OTHER_SID, OTHER_EMAIL, NOW, NOW + 86400_000])

// ── Lib seeding ───────────────────────────────────────────────────────────────
process.env.KLAV_SECRET = TEST_SECRET
process.env.TURSO_DATABASE_URL = "file:" + srvDbFile
process.env.TURSO_AUTH_TOKEN = ""

const { reconnectDb, applySchema } = await import("./lib/db")
const _db = reconnectDb("file:" + srvDbFile)
await applySchema(_db)

// Seed a walk using trails lib directly
const T = await import("./lib/trails")

async function seedWalk(): Promise<{ runId: string; trailId: string }> {
  const trailId = await T.createTrail(PROJECT_ID, { name: "Login smoke", intent: "reach dashboard", baseUrl: "https://x.test/" })
  await T.setTrailStatus(PROJECT_ID, trailId, "active")
  const stepId = await T.addTrailStep(PROJECT_ID, trailId, { idx: 0, action: "click" })
  const runId = await T.startWalk(PROJECT_ID, trailId)
  await T.addRunStep(PROJECT_ID, { runId, trailId, stepId, idx: 0, tier: "cache", verdict: "green", confidence: 1 })
  await T.finishWalk(PROJECT_ID, runId, { status: "green", llmCalls: 1 })
  return { runId, trailId }
}

const { runId: WALK_RUN_ID } = await seedWalk()

// ── Spawn subprocess server ────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let base: string

beforeAll(async () => {
  serverPort = 46000 + Math.floor(Math.random() * 1000)
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
      // Stub the PDF renderer — fake %PDF bytes, no Chromium launched in route tests
      KLAV_TEST_FAKE_PDF: "1",
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const pid = PROJECT_ID
const otherPid = OTHER_PROJECT_ID
const adminCookie = `klav_session=${ADMIN_SID}`
const otherCookie = `klav_session=${OTHER_SID}`

// ── Tests ─────────────────────────────────────────────────────────────────────

test("GET /api/trails/walks/:runId/report.pdf — authed download returns 200 + application/pdf", async () => {
  const r = await fetch(`${base}/api/trails/walks/${WALK_RUN_ID}/report.pdf?project=${pid}`, {
    headers: { cookie: adminCookie },
  })
  expect(r.status).toBe(200)
  expect(r.headers.get("content-type")).toContain("application/pdf")
  const body = await r.text()
  // KLAV_TEST_FAKE_PDF stub returns %PDF-fake-for-tests <runId>
  expect(body).toContain("%PDF-fake-for-tests")
  expect(body).toContain(WALK_RUN_ID)
  expect(r.headers.get("content-disposition")).toContain("attachment")
})

test("GET /api/trails/walks/:runId/report.pdf — cross-project walk returns 404", async () => {
  // OTHER project tries to access ADMIN project's walk
  const r = await fetch(`${base}/api/trails/walks/${WALK_RUN_ID}/report.pdf?project=${otherPid}`, {
    headers: { cookie: otherCookie },
  })
  expect(r.status).toBe(404)
})

test("GET /api/trails/walks/:runId/report.pdf — unauthenticated returns 401", async () => {
  const r = await fetch(`${base}/api/trails/walks/${WALK_RUN_ID}/report.pdf?project=${pid}`)
  expect(r.status).toBe(401)
})

test("POST /api/trails/walks/:runId/share — mint share token returns URL with expiresAt", async () => {
  const r = await fetch(`${base}/api/trails/walks/${WALK_RUN_ID}/share?project=${pid}`, {
    method: "POST",
    headers: { cookie: adminCookie },
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(typeof body.url).toBe("string")
  expect(body.url).toContain("/shared/walk-report/")
  expect(typeof body.expiresAt).toBe("number")
  expect(body.expiresAt).toBeGreaterThan(Date.now())
})

test("GET /shared/walk-report/:token — valid token serves inline PDF (no auth required)", async () => {
  // Mint a token via the API first
  const mintR = await fetch(`${base}/api/trails/walks/${WALK_RUN_ID}/share?project=${pid}`, {
    method: "POST",
    headers: { cookie: adminCookie },
  })
  const { url: shareUrl } = await mintR.json()

  // Access via the share URL without any session cookie
  const r = await fetch(shareUrl)
  expect(r.status).toBe(200)
  expect(r.headers.get("content-type")).toContain("application/pdf")
  expect(r.headers.get("content-disposition")).toContain("inline")
  const body = await r.text()
  expect(body).toContain("%PDF-fake-for-tests")
})

test("GET /shared/walk-report/:token — tampered token returns 404", async () => {
  // A 64-char hex string that is not a real token
  const fakeToken = "a".repeat(64)
  const r = await fetch(`${base}/shared/walk-report/${fakeToken}`)
  expect(r.status).toBe(404)
})

test("GET /shared/walk-report/:token — expired token returns 404", async () => {
  // Mint a token with ttlMs=1 directly into the DB (expired by the time we query)
  const { mintShareToken: mint } = await import("./lib/trails-share")
  // Connect to the same DB
  const { reconnectDb: rDb } = await import("./lib/db")
  rDb("file:" + srvDbFile)
  const rawToken = await mint(PROJECT_ID, WALK_RUN_ID, undefined, 1)
  // Sleep 5ms to let the 1ms TTL expire
  await Bun.sleep(5)

  const r = await fetch(`${base}/shared/walk-report/${rawToken}`)
  expect(r.status).toBe(404)
})

test("POST /api/trails/walks/:runId/share — unauthenticated returns 401", async () => {
  const r = await fetch(`${base}/api/trails/walks/${WALK_RUN_ID}/share?project=${pid}`, {
    method: "POST",
  })
  expect(r.status).toBe(401)
})

test("POST /api/trails/walks/:runId/share — cross-project walk returns 404", async () => {
  const r = await fetch(`${base}/api/trails/walks/${WALK_RUN_ID}/share?project=${otherPid}`, {
    method: "POST",
    headers: { cookie: otherCookie },
  })
  expect(r.status).toBe(404)
})

test("GET /shared/walk-report/:token — rate-limited after 30 rapid requests", async () => {
  // Mint a token via the API first
  const mintR = await fetch(`${base}/api/trails/walks/${WALK_RUN_ID}/share?project=${pid}`, {
    method: "POST",
    headers: { cookie: adminCookie },
  })
  const { url: shareUrl } = await mintR.json()

  // Hit the shared URL 31 times rapidly
  let got429 = false
  for (let i = 0; i < 31; i++) {
    const r = await fetch(shareUrl)
    if (r.status === 429) {
      got429 = true
      break
    }
  }
  expect(got429).toBe(true)
})

test("GET /shared/walk-report/:token & /api/.../report.pdf — returns 429 Retry-After: 5 when PDF is busy (KLA-59)", async () => {
  const tempPort = 47000 + Math.floor(Math.random() * 1000)
  const tempProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(tempPort),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: `http://localhost:${tempPort}`,
      KLAV_TEST_FAKE_PDF: "1",
      KLAV_TEST_FAKE_PDF_DELAY: "1000",
    }
  })

  // Wait for server ready
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://localhost:${tempPort}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch {}
    await Bun.sleep(150)
  }

  // Mint a share token
  const mintR = await fetch(`http://localhost:${tempPort}/api/trails/walks/${WALK_RUN_ID}/share?project=${pid}`, {
    method: "POST",
    headers: { cookie: adminCookie },
  })
  const { url: shareUrl } = await mintR.json()

  // 1. Concurrent requests to shared walk-report endpoint
  const [res1, res2] = await Promise.all([
    fetch(shareUrl),
    Bun.sleep(50).then(() => fetch(shareUrl))
  ])

  expect([res1.status, res2.status]).toContain(200)
  expect([res1.status, res2.status]).toContain(429)

  const busyRes = res1.status === 429 ? res1 : res2
  expect(busyRes.headers.get("retry-after")).toBe("5")

  // 2. Concurrent requests to authed download endpoint
  const pdfUrl = `http://localhost:${tempPort}/api/trails/walks/${WALK_RUN_ID}/report.pdf?project=${pid}`
  const [authedRes1, authedRes2] = await Promise.all([
    fetch(pdfUrl, { headers: { cookie: adminCookie } }),
    Bun.sleep(50).then(() => fetch(pdfUrl, { headers: { cookie: adminCookie } }))
  ])

  expect([authedRes1.status, authedRes2.status]).toContain(200)
  expect([authedRes1.status, authedRes2.status]).toContain(429)

  const authedBusyRes = authedRes1.status === 429 ? authedRes1 : authedRes2
  expect(authedBusyRes.headers.get("retry-after")).toBe("5")
  const jsonBody = await authedBusyRes.json()
  expect(jsonBody.error).toBe("PDF generator busy")

  tempProc.kill()
})

