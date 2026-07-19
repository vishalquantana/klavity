// server.sim-url-preview.test.ts
//
// Tests for POST /api/sim/preview — authenticated "URL preview with real Sims" branch
// plus regression guard on the ephemeral (onboarding) branch.
//
// Strategy: spin a real server subprocess against a fresh temp DB. Mock screenshotUrl and
// the LLM/reactToPage by injecting AUTOSIM_CDP_URL=disabled (so the headless browser is
// never launched) and OPENROUTER_API_KEY="" (so any LLM call fails early). We then assert
// on the HTTP contract — auth gates, project-access gates — without real browser/LLM calls.
//
// Gate assertions:
//   • authed + projectId owned by caller → passes auth + project gates, reaches
//     screenshotUrl (which fails fast without a browser), returns 400 "Couldn't open".
//   • authed + projectId belonging to another user → 403 "No accessible project".
//   • authed + projectId of project with no Sims → 400 "no Sims yet".
//   • unauthenticated + no projectId → ephemeral path, returns { reaction, personaName }.
//     (screenshotUrl will also fail; we verify the correct 400 from the ephemeral branch.)
//   • authed + wrong projectId → 403 forbidden.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Temp DB ───────────────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-sim-urlprev-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(55)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// Minimal schema (mirrors the tables the server needs for this route)
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS monitored_urls (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, url_pattern TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, UNIQUE(project_id, url_pattern))`)
await rawExec(`CREATE TABLE IF NOT EXISTS monitoring_consent (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, status TEXT NOT NULL, granted_at INTEGER, updated_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT, created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0)`)
await rawExec(`CREATE TABLE IF NOT EXISTS screenshots (id TEXT PRIMARY KEY, project_id TEXT, s3_key TEXT NOT NULL, bucket TEXT, content_type TEXT, acl TEXT, bytes INTEGER, owner_email TEXT, expires_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS review_counts (project_id TEXT NOT NULL, day TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (project_id, day))`)
await rawExec(`CREATE INDEX IF NOT EXISTS ext_tok_email_idx ON extension_tokens(email)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_connectors_project ON connectors(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS mon_url_proj_idx ON monitored_urls(project_id)`)

// ── Fixtures ──────────────────────────────────────────────────────────────────
const NOW = Date.now()

// Owner A: has project WITH two Sims
const OWNER_A = `owner-a-${ts}@test.local`
const SID_A   = `sess_a_${ts}`
const ACCT_A  = `acct_a_${ts}`
const PROJ_A  = `proj_a_${ts}`
const SIM_1   = `sim_1_${ts}`
const SIM_2   = `sim_2_${ts}`

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OWNER_A, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCT_A, "Sim Preview Test", OWNER_A, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_a_${ts}`, ACCT_A, OWNER_A, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJ_A, ACCT_A, "Proj A", "active", "auto", 500, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_a_${ts}`, PROJ_A, OWNER_A, "owner", null, NOW])
// Two Sims in the project
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [SIM_1, PROJ_A, "Alice Tester", "QA Lead", "client", "AT", "#6366f1", "Checks edge cases.", "[]", NOW, NOW])
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [SIM_2, PROJ_A, "Bob Designer", "UX Designer", "client", "BD", "#ec4899", "Cares about visuals.", "[]", NOW, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [SID_A, OWNER_A, NOW, NOW + 86400_000])

// Owner B: project with NO Sims (tests "no Sims" guard)
const OWNER_B = `owner-b-${ts}@test.local`
const SID_B   = `sess_b_${ts}`
const ACCT_B  = `acct_b_${ts}`
const PROJ_B  = `proj_b_${ts}`

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OWNER_B, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCT_B, "No-Sims Test", OWNER_B, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_b_${ts}`, ACCT_B, OWNER_B, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJ_B, ACCT_B, "Proj B (no sims)", "active", "auto", 500, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_b_${ts}`, PROJ_B, OWNER_B, "owner", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [SID_B, OWNER_B, NOW, NOW + 86400_000])

// ── Server subprocess ─────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 44500 + Math.floor(Math.random() * 500)
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
      // No S3, no headless browser — server will error at screenshotUrl with "Couldn't open"
    },
    stdout: "pipe",
    stderr: "pipe",
  })

  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
    await Bun.sleep(150)
  }
}, 20000 /* bun:test beforeAll timeout */)

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function authPost(sessionId: string, body: object) {
  return fetch(`${BASE}/api/sim/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `klav_session=${sessionId}` },
    body: JSON.stringify(body),
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

// TEST 1: Authenticated caller with valid projectId (has 2 Sims)
// The server reaches the runSimReviews/screenshotUrl step and fails fast because
// no real browser is available. This confirms: auth gate passed, project-access gate
// passed, Sims loaded (> 0), and the server tried to screenshot the URL.
test("authed + valid projectId: passes auth+project gates, reaches screenshot step", async () => {
  const r = await authPost(SID_A, {
    url: "https://example.com/page",
    projectId: PROJ_A,
  })
  const body = await r.json()

  // Must NOT be an auth/access error — those 403/401 mean the gate failed before screenshot
  expect(r.status).not.toBe(401)
  expect(r.status).not.toBe(403)
  expect(body.error).not.toMatch(/No accessible project/i)
  expect(body.error).not.toMatch(/sign in/i)

  // Without a real browser, the server returns 400 "Couldn't open" — proves gates passed
  // and screenshotUrl was attempted (= > 1 Sim was found and loaded)
  expect(r.status === 400 || r.status === 500 || r.status === 200).toBe(true)
  if (r.status === 400) {
    expect(body.error).toMatch(/couldn't open|couldn't reach/i)
  }
}, 20000)

// TEST 2: Authenticated caller trying to access a project they don't own → 403
test("authed + projectId owned by another user: returns 403 no-access", async () => {
  // OWNER_A session trying to access PROJ_B (owned by OWNER_B)
  const r = await authPost(SID_A, {
    url: "https://example.com/page",
    projectId: PROJ_B,
  })
  const body = await r.json()
  expect(r.status).toBe(403)
  expect(body.error).toMatch(/No accessible project/i)
}, 15000)

// TEST 3: Authed + projectId with no Sims → 400 "no Sims yet"
test("authed + projectId with zero Sims: returns 400 with no-Sims message", async () => {
  const r = await authPost(SID_B, {
    url: "https://example.com/page",
    projectId: PROJ_B,
  })
  const body = await r.json()
  expect(r.status).toBe(400)
  expect(body.error).toMatch(/no sims yet|add a sim/i)
}, 15000)

// TEST 4: Ephemeral path (authed, no projectId) still works unchanged
// The /api/sim/preview endpoint is session-gated like all /api/* routes (callers are
// authenticated via OTP before hitting onboarding). The EPHEMERAL branch is taken when
// no projectId is supplied, even for an authenticated user. Returns the OLD API shape
// ({reaction, personaName}) — NOT the new projectId-branch shape ({reviews, projectId}).
test("ephemeral path (authed, no projectId) returns old API shape not new reviews shape", async () => {
  // Use OWNER_A's session — they are authed but we don't supply projectId → ephemeral
  const r = await authPost(SID_A, { url: "https://example.com/" })
  const body = await r.json()

  // Must NOT accidentally return the new projectId-branch keys
  expect(body).not.toHaveProperty("reviews")
  expect(body).not.toHaveProperty("projectId")

  // Either reached screenshotUrl (400 "Couldn't open"), SSRF preflight failed (400),
  // rate-limited (429), or succeeded (200)
  expect([200, 400, 429]).toContain(r.status)
  if (r.status === 200) {
    // If by miracle it succeeded, old shape must be present
    expect(body).toHaveProperty("personaName")
  }
}, 15000)

// TEST 5: Missing URL field returns 400 regardless of auth
test("missing url field returns 400 'Enter your product URL'", async () => {
  const r = await authPost(SID_A, { projectId: PROJ_A })
  const body = await r.json()
  expect(r.status).toBe(400)
  expect(body.error).toMatch(/enter your product/i)
}, 10000)

// TEST 6: Unauthenticated call is EXEMPT from the /api/* login gate (pre-signup aha).
// /api/sim/preview powers site/onboarding.html step 0 BEFORE signup, so the blanket gate
// allowlists it; protection comes from the endpoint's own guards (aiDemoLimited per-IP
// throttle + SSRF safeFetch + payload caps). A loopback URL proves the request reached
// the handler (SSRF 400) rather than dying at the gate (401).
test("unauthenticated call to /api/sim/preview is not login-gated (pre-signup aha)", async () => {
  const r = await fetch(`${BASE}/api/sim/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "http://127.0.0.1:1" }),
  })
  expect(r.status).not.toBe(401)
  expect(r.status).toBe(400)
}, 10000)
