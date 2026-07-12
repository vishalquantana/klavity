// Layer E — Expectations graduation endpoints (enforce/confirm/retire) via subprocess-server harness.
// Mirrors server.trails.test.ts exactly: a dedicated temp DB seeded via a RAW createClient (never
// the shared db singleton), the server subprocess spawned against the same file: DB, and HTTP hits with
// a klav_session cookie. The /enforce route calls OpenRouter — that route is NOT exercised here.
// We only test: GET expectations, POST enforce/confirm (hand-built draft), and POST retire.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-expectations-srv-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
// SQLITE_BUSY guard: the spawned server and this rawClient write the same file: DB concurrently;
// WAL + a 5s busy_timeout make writers WAIT for the lock instead of erroring under CI contention.
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// ── Schema (mirrors applySchema/migrateV2 DDL — only tables this suite needs) ──
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS trails (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, intent TEXT NOT NULL DEFAULT '', base_url TEXT NOT NULL, baseline_ref TEXT, author_kind TEXT NOT NULL DEFAULT 'human', status TEXT NOT NULL DEFAULT 'draft', created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trail_runs (id TEXT PRIMARY KEY, trail_id TEXT NOT NULL, project_id TEXT NOT NULL, trigger TEXT NOT NULL DEFAULT 'manual', status TEXT NOT NULL DEFAULT 'running', llm_calls INTEGER NOT NULL DEFAULT 0, summary_json TEXT, started_at INTEGER NOT NULL, finished_at INTEGER)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trail_steps (id TEXT PRIMARY KEY, trail_id TEXT NOT NULL, project_id TEXT NOT NULL, idx INTEGER NOT NULL, action TEXT NOT NULL, action_value TEXT, target_json TEXT, checkpoint_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS findings (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, run_id TEXT NOT NULL, step_id TEXT, trail_id TEXT NOT NULL, kind TEXT NOT NULL, title TEXT NOT NULL, evidence_json TEXT, ground_quote TEXT, confidence REAL NOT NULL DEFAULT 0, dedup_key TEXT NOT NULL, recurrence INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'queued', connector_ref TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS run_steps (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, trail_id TEXT NOT NULL, step_id TEXT NOT NULL, project_id TEXT NOT NULL, idx INTEGER NOT NULL, tier TEXT NOT NULL DEFAULT 'none', verdict TEXT NOT NULL DEFAULT 'skip', confidence REAL NOT NULL DEFAULT 0, diagnosis TEXT, healed INTEGER NOT NULL DEFAULT 0, evidence_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS walk_replays (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, project_id TEXT NOT NULL, segments_gz TEXT NOT NULL, n_segments INTEGER, n_events INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS expectations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  area TEXT,
  url_path TEXT,
  status TEXT NOT NULL DEFAULT 'candidate',
  source_refs_json TEXT NOT NULL DEFAULT '[]',
  corroboration_json TEXT NOT NULL DEFAULT '{}',
  dedup_key TEXT NOT NULL,
  enforced_step_id TEXT,
  awaiting_trail INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)`)
// KLA-251 (B.11): near-miss log table (mirrors applySchema DDL) for the ops-report route test.
await rawExec(`CREATE TABLE IF NOT EXISTS expectation_near_misses (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  cand_title TEXT NOT NULL,
  existing_id TEXT NOT NULL,
  existing_title TEXT NOT NULL,
  cand_kind TEXT,
  existing_kinds_json TEXT,
  score REAL NOT NULL,
  threshold REAL NOT NULL,
  created_at INTEGER NOT NULL
)`)

// ── Fixtures ─────────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `admin-${ts}@test.local`
const ADMIN_SID = `sess_admin_${ts}`
const ACCOUNT_ID = `acct_${ts}`
const PROJECT_ID = `proj_${ACCOUNT_ID}`
const TRAIL_ID = `trl_${ts}`
const STEP_ID = `ts_seed_${ts}`
const STEP_ID_1 = `ts_seed1_${ts}`
const EXP_VALIDATED_ID = `exp_val_${ts}`
const EXP_RETIRE_ID = `exp_ret_${ts}`
const EXP_ENFORCED_ID = `exp_enf_${ts}`
const ENFORCED_STEP_ID = `ts_enforced_seed_${ts}`
const NOW = Date.now()

// Users, account, project, session
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "Test Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_${ACCOUNT_ID}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "Default Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_admin_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

// A trail with two steps (idx 0 and 1) for idx-ordering tests
await rawExec(`INSERT INTO trails (id, project_id, name, intent, base_url, author_kind, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [TRAIL_ID, PROJECT_ID, "Checkout", "log in and check out", "https://shop.test", "human", "active", ADMIN_EMAIL, NOW, NOW])
await rawExec(`INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [STEP_ID, TRAIL_ID, PROJECT_ID, 0, "click", null, JSON.stringify({ role: "button", name: "Checkout" }), null, NOW])
await rawExec(`INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [STEP_ID_1, TRAIL_ID, PROJECT_ID, 1, "navigate", "https://shop.test/confirm", null, null, NOW])

// B.5: a SECOND trail whose steps navigate to /signup — used to test urlPath-match default
// preselection and repoint-to-a-non-first-Trail. Created AFTER the Checkout trail, so it is NOT
// the "first" trail (listTrails orders newest-first → this one sorts first; the OLD code's silent
// first-Trail would pick THIS regardless of path — we assert the default is now path-driven).
const TRAIL_SIGNUP_ID = `trl_signup_${ts}`
const SIGNUP_STEP_ID = `ts_signup0_${ts}`
await rawExec(`INSERT INTO trails (id, project_id, name, intent, base_url, author_kind, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [TRAIL_SIGNUP_ID, PROJECT_ID, "Signup", "sign up a new user", "https://shop.test", "human", "active", ADMIN_EMAIL, NOW + 1000, NOW + 1000])
await rawExec(`INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [SIGNUP_STEP_ID, TRAIL_SIGNUP_ID, PROJECT_ID, 0, "navigate", "https://shop.test/signup", null, null, NOW])

// A pre-enforced step for the retire-removes-step test
await rawExec(`INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [ENFORCED_STEP_ID, TRAIL_ID, PROJECT_ID, 99, "assert", null, JSON.stringify({ role: "button", name: "Cart" }), JSON.stringify({ kind: "visible", description: "Cart count visible" }), NOW])

// A validated expectation (to test enforce/confirm)
await rawExec(
  `INSERT INTO expectations (id, project_id, title, area, url_path, status, source_refs_json, corroboration_json, dedup_key, enforced_step_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [EXP_VALIDATED_ID, PROJECT_ID, "Finish button must be visible after checkout", "checkout", "/checkout", "validated",
   JSON.stringify([{ kind: "snap", id: "snap1" }, { kind: "sim", id: "sim1" }]),
   JSON.stringify({ snap: true, sim: true, recurrence: 0 }),
   `dedup_val_${ts}`, null, NOW, NOW]
)

// A second validated expectation (to test retire — no enforced step)
await rawExec(
  `INSERT INTO expectations (id, project_id, title, area, url_path, status, source_refs_json, corroboration_json, dedup_key, enforced_step_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [EXP_RETIRE_ID, PROJECT_ID, "Cart count must be visible in header", "cart", "/cart", "validated",
   JSON.stringify([{ kind: "snap", id: "snap2" }, { kind: "sim", id: "sim2" }]),
   JSON.stringify({ snap: true, sim: true, recurrence: 0 }),
   `dedup_ret_${ts}`, null, NOW, NOW]
)

// A pre-enforced expectation (to test retire removes the trail step)
await rawExec(
  `INSERT INTO expectations (id, project_id, title, area, url_path, status, source_refs_json, corroboration_json, dedup_key, enforced_step_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [EXP_ENFORCED_ID, PROJECT_ID, "Cart badge must be visible in header", "cart", "/cart", "enforced",
   JSON.stringify([{ kind: "snap", id: "snap3" }, { kind: "sim", id: "sim3" }]),
   JSON.stringify({ snap: true, sim: true, recurrence: 0 }),
   `dedup_enf_${ts}`, ENFORCED_STEP_ID, NOW, NOW]
)

// ── B.5 (KLA-245): a SECOND account+project that has ZERO trails, for the zero-Trail fallback +
// awaiting-Trail resume tests. Keeping it isolated means adding a trail here can't perturb the
// primary project's trail-picker tests.
const ACCT_ZT = `acct_zt_${ts}`
const PROJ_ZT = `proj_zt_${ts}`
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCT_ZT, "Zero-Trail WS", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_${ACCT_ZT}`, ACCT_ZT, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJ_ZT, ACCT_ZT, "Zero-Trail Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_zt_${ts}`, PROJ_ZT, ADMIN_EMAIL, "admin", null, NOW])
// A validated expectation in the zero-Trail project (urlPath /pricing).
const EXP_ZT_ID = `exp_zt_${ts}`
await rawExec(
  `INSERT INTO expectations (id, project_id, title, area, url_path, status, source_refs_json, corroboration_json, dedup_key, enforced_step_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [EXP_ZT_ID, PROJ_ZT, "Pricing table must render three tiers", "pricing", "/pricing", "validated",
   JSON.stringify([{ kind: "snap", id: "snapzt" }, { kind: "sim", id: "simzt" }]),
   JSON.stringify({ snap: true, sim: true, recurrence: 0 }),
   `dedup_zt_${ts}`, null, NOW, NOW]
)

// KLA-251 (B.11): a seeded near-miss row for the ops-report route test.
await rawExec(
  `INSERT INTO expectation_near_misses (id, project_id, cand_title, existing_id, existing_title, cand_kind, existing_kinds_json, score, threshold, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [`nm_${ts}`, PROJECT_ID, "Submit button missing on onboarding page", EXP_VALIDATED_ID,
   "Finish button missing on onboarding page", "snap", JSON.stringify(["autosim"]), 0.78, 0.82, NOW]
)

// ── Spawn the server ──────────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 33000 + Math.floor(Math.random() * 1000)
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

afterAll(() => { serverProc?.kill(); rawClient.close() })

function authCookie(sid: string) { return `klav_session=${sid}` }
async function api(method: string, path: string, body: any, sid: string) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: authCookie(sid) },
    body: body != null ? JSON.stringify(body) : undefined,
  })
}

// ── Tests ──────────────────────────────────────────────────────────────────────────

test("GET /api/expectations?status=validated returns the seeded validated expectation", async () => {
  const r = await api("GET", `/api/expectations?project=${PROJECT_ID}&status=validated`, null, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(Array.isArray(b.expectations)).toBe(true)
  expect(b.expectations.some((e: any) => e.id === EXP_VALIDATED_ID)).toBe(true)
  expect(b.expectations.some((e: any) => e.id === EXP_RETIRE_ID)).toBe(true)
  expect(b.expectations.every((e: any) => e.status === "validated")).toBe(true)
})

test("GET /api/expectations is 401 without a session", async () => {
  const r = await fetch(`${BASE}/api/expectations?project=${PROJECT_ID}`)
  expect(r.status).toBe(401)
})

test("GET /api/expectations returns all expectations when no status filter", async () => {
  const r = await api("GET", `/api/expectations?project=${PROJECT_ID}`, null, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(Array.isArray(b.expectations)).toBe(true)
  expect(b.expectations.length).toBeGreaterThanOrEqual(2)
})

test("POST /api/expectations/:id/enforce/confirm writes an assert step and flips status to enforced", async () => {
  // Hand-built valid draft (no network call needed)
  const draft = {
    trailId: TRAIL_ID,
    afterStepIdx: 0,
    action: "assert",
    target: { role: "button", name: "Finish" },
    checkpoint: { kind: "visible", description: "Finish button is visible after checkout" },
  }

  const r = await api("POST", `/api/expectations/${EXP_VALIDATED_ID}/enforce/confirm?project=${PROJECT_ID}`, { draft }, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(typeof b.stepId).toBe("string")
  expect(b.stepId).toMatch(/^ts_/)

  // Verify the trail_steps row was inserted with action='assert' and checkpoint_json containing "visible"
  const stepRow = await rawClient.execute({ sql: "SELECT * FROM trail_steps WHERE id=?", args: [b.stepId] })
  expect(stepRow.rows.length).toBe(1)
  const step = stepRow.rows[0] as any
  expect(step.action).toBe("assert")
  expect(step.checkpoint_json).toContain("visible")
  expect(step.trail_id).toBe(TRAIL_ID)
  expect(step.project_id).toBe(PROJECT_ID)
  expect(Number(step.idx)).toBe(1) // afterStepIdx 0 → idx 1

  // Verify target_json
  const target = JSON.parse(step.target_json)
  expect(target.role).toBe("button")
  expect(target.name).toBe("Finish")
})

test("GET /api/expectations?status=enforced includes the expectation after confirm", async () => {
  const r = await api("GET", `/api/expectations?project=${PROJECT_ID}&status=enforced`, null, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(Array.isArray(b.expectations)).toBe(true)
  expect(b.expectations.some((e: any) => e.id === EXP_VALIDATED_ID)).toBe(true)
  const exp = b.expectations.find((e: any) => e.id === EXP_VALIDATED_ID)
  expect(exp.status).toBe("enforced")
  expect(typeof exp.enforcedStepId).toBe("string")
})

test("POST /api/expectations/:id/enforce/confirm with invalid draft returns 400", async () => {
  // Missing action field → validateAssertionDraft returns null
  const r = await api("POST", `/api/expectations/${EXP_RETIRE_ID}/enforce/confirm?project=${PROJECT_ID}`, { draft: { trailId: TRAIL_ID, afterStepIdx: 0 } }, ADMIN_SID)
  expect(r.status).toBe(400)
})

test("POST /api/expectations/:id/enforce/confirm a second time returns 409", async () => {
  // The EXP_VALIDATED_ID was already confirmed in an earlier test, so it is now status='enforced'.
  // Try to confirm it again with a valid draft — should reject with 409.
  const draft = {
    trailId: TRAIL_ID,
    afterStepIdx: 0,
    action: "assert",
    target: { role: "button", name: "Retry" },
    checkpoint: { kind: "visible", description: "Retry button is visible" },
  }
  const r = await api("POST", `/api/expectations/${EXP_VALIDATED_ID}/enforce/confirm?project=${PROJECT_ID}`, { draft }, ADMIN_SID)
  expect(r.status).toBe(409)
  expect((await r.json()).error).toBe("not validated")
})

test("POST /api/expectations/:id/retire flips status to retired", async () => {
  const r = await api("POST", `/api/expectations/${EXP_RETIRE_ID}/retire?project=${PROJECT_ID}`, {}, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(b.ok).toBe(true)

  // Verify status in DB
  const row = await rawClient.execute({ sql: "SELECT status FROM expectations WHERE id=?", args: [EXP_RETIRE_ID] })
  expect(String((row.rows[0] as any).status)).toBe("retired")
})

test("GET /api/expectations?status=retired includes the retired expectation", async () => {
  const r = await api("GET", `/api/expectations?project=${PROJECT_ID}&status=retired`, null, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(Array.isArray(b.expectations)).toBe(true)
  expect(b.expectations.some((e: any) => e.id === EXP_RETIRE_ID)).toBe(true)
})

test("POST /api/expectations/:id/enforce/confirm is 404 for a non-existent expectation", async () => {
  const draft = {
    trailId: TRAIL_ID,
    afterStepIdx: 0,
    action: "assert",
    target: { role: "button", name: "Finish" },
    checkpoint: { kind: "visible", description: "Finish visible" },
  }
  const r = await api("POST", `/api/expectations/exp_nope_${ts}/enforce/confirm?project=${PROJECT_ID}`, { draft }, ADMIN_SID)
  expect(r.status).toBe(404)
})

test("POST /api/expectations/:id/retire is 401 without a session", async () => {
  const r = await fetch(`${BASE}/api/expectations/${EXP_RETIRE_ID}/retire?project=${PROJECT_ID}`, { method: "POST" })
  expect(r.status).toBe(401)
})

test("idx ordering on graduation: afterStepIdx:0 shifts existing idx-1 step to idx-2, new step at idx-1, no duplicate idx", async () => {
  // EXP_VALIDATED_ID was already confirmed in earlier tests — use a fresh validated expectation
  const EXP_IDX_ID = `exp_idx_${ts}`
  await rawClient.execute({
    sql: `INSERT INTO expectations (id, project_id, title, area, url_path, status, source_refs_json, corroboration_json, dedup_key, enforced_step_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [EXP_IDX_ID, PROJECT_ID, "Idx ordering test expectation", "test", "/test", "validated",
      JSON.stringify([{ kind: "snap", id: "snap_idx" }]),
      JSON.stringify({ snap: true, sim: false, recurrence: 0 }),
      `dedup_idx_${ts}`, null, NOW, NOW],
  })
  const draft = {
    trailId: TRAIL_ID,
    afterStepIdx: 0,
    action: "assert",
    target: { role: "button", name: "Order Summary" },
    checkpoint: { kind: "visible", description: "Order Summary visible after click" },
  }
  const r = await api("POST", `/api/expectations/${EXP_IDX_ID}/enforce/confirm?project=${PROJECT_ID}`, { draft }, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(typeof b.stepId).toBe("string")

  // Query all steps for this trail ordered by idx
  const stepsRes = await rawClient.execute({ sql: "SELECT id, idx FROM trail_steps WHERE trail_id=? AND project_id=? ORDER BY idx ASC", args: [TRAIL_ID, PROJECT_ID] })
  const steps = stepsRes.rows as any[]

  // The new assert step should be at idx 1
  const newStep = steps.find((s: any) => s.id === b.stepId)
  expect(newStep).toBeDefined()
  expect(Number(newStep.idx)).toBe(1)

  // The originally-idx-1 step (STEP_ID_1) must have shifted to idx 2
  const shiftedStep = steps.find((s: any) => s.id === STEP_ID_1)
  expect(shiftedStep).toBeDefined()
  expect(Number(shiftedStep.idx)).toBeGreaterThanOrEqual(2)

  // No two steps share an idx
  const idxValues = steps.map((s: any) => Number(s.idx))
  const uniqueIdxValues = new Set(idxValues)
  expect(uniqueIdxValues.size).toBe(idxValues.length)
})

test("foreign trailId in enforce/confirm returns 422", async () => {
  // Seed a fresh validated expectation to avoid 409 from a prior confirm
  const EXP_FOREIGN_ID = `exp_foreign_${ts}`
  await rawClient.execute({
    sql: `INSERT INTO expectations (id, project_id, title, area, url_path, status, source_refs_json, corroboration_json, dedup_key, enforced_step_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [EXP_FOREIGN_ID, PROJECT_ID, "Foreign trail test expectation", "test", "/test", "validated",
      JSON.stringify([{ kind: "snap", id: "snap_foreign" }]),
      JSON.stringify({ snap: true, sim: false, recurrence: 0 }),
      `dedup_foreign_${ts}`, null, NOW, NOW],
  })
  const draft = {
    trailId: "trl_nonexistent_foreign_garbage",
    afterStepIdx: 0,
    action: "assert",
    target: { role: "button", name: "Pay" },
    checkpoint: { kind: "visible", description: "Pay button visible" },
  }
  const r = await api("POST", `/api/expectations/${EXP_FOREIGN_ID}/enforce/confirm?project=${PROJECT_ID}`, { draft }, ADMIN_SID)
  expect(r.status).toBe(422)
  const b = await r.json()
  expect(b.error).toBe("trail not found")
})

test("retire removes the enforced trail step from trail_steps", async () => {
  // Verify the enforced step exists before retire
  const beforeRes = await rawClient.execute({ sql: "SELECT id FROM trail_steps WHERE id=? AND project_id=?", args: [ENFORCED_STEP_ID, PROJECT_ID] })
  expect(beforeRes.rows.length).toBe(1)

  const r = await api("POST", `/api/expectations/${EXP_ENFORCED_ID}/retire?project=${PROJECT_ID}`, {}, ADMIN_SID)
  expect(r.status).toBe(200)
  expect((await r.json()).ok).toBe(true)

  // The enforced step should be gone
  const afterRes = await rawClient.execute({ sql: "SELECT id FROM trail_steps WHERE id=? AND project_id=?", args: [ENFORCED_STEP_ID, PROJECT_ID] })
  expect(afterRes.rows.length).toBe(0)

  // The expectation should be retired
  const expRes = await rawClient.execute({ sql: "SELECT status FROM expectations WHERE id=?", args: [EXP_ENFORCED_ID] })
  expect(String((expRes.rows[0] as any).status)).toBe("retired")
})

// ── B.9 (KLA-249): guard lifecycle — un-enforce, edit-in-place, retire (incl. 409 edges) ──────

// Seed a fresh enforced expectation with a real assert step to exercise the lifecycle routes
// independently of the earlier tests' mutations.
async function seedEnforcedExpectation(suffix: string) {
  const expId = `exp_life_${suffix}_${ts}`
  const stepId = `ts_life_${suffix}_${ts}`
  await rawClient.execute({
    sql: `INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [stepId, TRAIL_ID, PROJECT_ID, 50 + Math.floor(Math.random() * 40), "assert", null,
      JSON.stringify({ role: "button", name: "Save" }), JSON.stringify({ kind: "visible", description: "Save visible" }), NOW],
  })
  await rawClient.execute({
    sql: `INSERT INTO expectations (id, project_id, title, area, url_path, status, source_refs_json, corroboration_json, dedup_key, enforced_step_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [expId, PROJECT_ID, `Lifecycle guard ${suffix}`, "settings", "/settings", "enforced",
      JSON.stringify([{ kind: "snap", id: `snap_${suffix}` }, { kind: "sim", id: `sim_${suffix}` }]),
      JSON.stringify({ snap: true, sim: true, recurrence: 2 }),
      `dedup_life_${suffix}_${ts}`, stepId, NOW, NOW],
  })
  return { expId, stepId }
}

test("B.9 un-enforce: demotes enforced → validated, removes the assert step, keeps history", async () => {
  const { expId, stepId } = await seedEnforcedExpectation("unenf")
  // Precondition: the assert step exists.
  const before = await rawClient.execute({ sql: "SELECT id FROM trail_steps WHERE id=? AND project_id=?", args: [stepId, PROJECT_ID] })
  expect(before.rows.length).toBe(1)

  const r = await api("POST", `/api/expectations/${expId}/unenforce?project=${PROJECT_ID}`, {}, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(b.ok).toBe(true)
  expect(b.status).toBe("validated")

  // The assert step is gone (the Trail no longer runs the check).
  const after = await rawClient.execute({ sql: "SELECT id FROM trail_steps WHERE id=? AND project_id=?", args: [stepId, PROJECT_ID] })
  expect(after.rows.length).toBe(0)

  // The expectation is validated, enforced_step_id cleared, but history (corroboration/source_refs) intact.
  const row = await rawClient.execute({ sql: "SELECT status, enforced_step_id, corroboration_json, source_refs_json FROM expectations WHERE id=?", args: [expId] })
  const rec = row.rows[0] as any
  expect(String(rec.status)).toBe("validated")
  expect(rec.enforced_step_id).toBe(null)
  expect(JSON.parse(String(rec.corroboration_json)).recurrence).toBe(2)
  expect(JSON.parse(String(rec.source_refs_json)).length).toBe(2)
})

test("B.9 un-enforce: 409 when the expectation is not enforced", async () => {
  // EXP_RETIRE_ID is retired (validated → retired earlier). Un-enforce must reject with 409.
  const r = await api("POST", `/api/expectations/${EXP_RETIRE_ID}/unenforce?project=${PROJECT_ID}`, {}, ADMIN_SID)
  expect(r.status).toBe(409)
  expect((await r.json()).error).toBe("not enforced")
})

test("B.9 un-enforce: 404 for a non-existent expectation", async () => {
  const r = await api("POST", `/api/expectations/exp_missing_${ts}/unenforce?project=${PROJECT_ID}`, {}, ADMIN_SID)
  expect(r.status).toBe(404)
})

test("B.9 un-enforce: 401 without a session", async () => {
  const { expId } = await seedEnforcedExpectation("unenf401")
  const r = await fetch(`${BASE}/api/expectations/${expId}/unenforce?project=${PROJECT_ID}`, { method: "POST" })
  expect(r.status).toBe(401)
})

test("B.9 edit guard: PATCH updates the enforced assert step IN PLACE (same step id survives)", async () => {
  const { expId, stepId } = await seedEnforcedExpectation("edit")
  const r = await api("PATCH", `/api/expectations/${expId}/guard-step?project=${PROJECT_ID}`,
    { target: { role: "button", name: "Save changes" }, checkpoint: { description: "Save-changes button is visible" } }, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(b.ok).toBe(true)
  expect(b.stepId).toBe(stepId) // edited in place — NOT retire-and-recreate

  // The step row reflects the edit; the expectation stays enforced on the SAME step.
  const step = (await rawClient.execute({ sql: "SELECT target_json, checkpoint_json, action FROM trail_steps WHERE id=?", args: [stepId] })).rows[0] as any
  expect(String(step.action)).toBe("assert")
  expect(JSON.parse(String(step.target_json)).name).toBe("Save changes")
  expect(String(step.checkpoint_json)).toContain("Save-changes button is visible")
  const exp = (await rawClient.execute({ sql: "SELECT status, enforced_step_id FROM expectations WHERE id=?", args: [expId] })).rows[0] as any
  expect(String(exp.status)).toBe("enforced")
  expect(String(exp.enforced_step_id)).toBe(stepId)
})

test("B.9 edit guard: 409 when the expectation is not enforced", async () => {
  // Seed a validated (not enforced) expectation.
  const EXP_EDIT_VAL = `exp_editval_${ts}`
  await rawClient.execute({
    sql: `INSERT INTO expectations (id, project_id, title, area, url_path, status, source_refs_json, corroboration_json, dedup_key, enforced_step_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [EXP_EDIT_VAL, PROJECT_ID, "Not enforced yet", "x", "/x", "validated",
      JSON.stringify([{ kind: "snap", id: "s" }]), JSON.stringify({ snap: true, sim: false, recurrence: 3 }),
      `dedup_editval_${ts}`, null, NOW, NOW],
  })
  const r = await api("PATCH", `/api/expectations/${EXP_EDIT_VAL}/guard-step?project=${PROJECT_ID}`, { checkpoint: { description: "nope" } }, ADMIN_SID)
  expect(r.status).toBe(409)
  expect((await r.json()).error).toBe("not enforced")
})

test("B.9 edit guard: 400 when the patch is empty", async () => {
  const { expId } = await seedEnforcedExpectation("editempty")
  const r = await api("PATCH", `/api/expectations/${expId}/guard-step?project=${PROJECT_ID}`, {}, ADMIN_SID)
  expect(r.status).toBe(400)
  expect((await r.json()).error).toBe("nothing to edit")
})

test("B.9 edit guard: 401 without a session", async () => {
  const { expId } = await seedEnforcedExpectation("edit401")
  const r = await fetch(`${BASE}/api/expectations/${expId}/guard-step?project=${PROJECT_ID}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checkpoint: { description: "x" } }) })
  expect(r.status).toBe(401)
})

test("B.9 retire then re-enforce path: an un-enforced guard can be enforced again (validated is actionable)", async () => {
  const { expId } = await seedEnforcedExpectation("reenf")
  // Un-enforce → validated.
  const un = await api("POST", `/api/expectations/${expId}/unenforce?project=${PROJECT_ID}`, {}, ADMIN_SID)
  expect(un.status).toBe(200)
  // Now enforce/confirm again with a fresh draft — the demoted row is enforceable (status validated).
  const draft = { trailId: TRAIL_ID, afterStepIdx: 0, action: "assert", target: { role: "button", name: "Save" }, checkpoint: { kind: "visible", description: "Save visible again" } }
  const re = await api("POST", `/api/expectations/${expId}/enforce/confirm?project=${PROJECT_ID}`, { draft }, ADMIN_SID)
  expect(re.status).toBe(200)
  const rb = await re.json()
  expect(typeof rb.stepId).toBe("string")
  const row = (await rawClient.execute({ sql: "SELECT status FROM expectations WHERE id=?", args: [expId] })).rows[0] as any
  expect(String(row.status)).toBe("enforced")
})

// ── KLA-251 (B.11): cross-source-matching near-miss ops report ────────────────────────────
test("GET /api/expectations/near-misses summarizes declined near-misses for the project", async () => {
  const r = await api("GET", `/api/expectations/near-misses?project=${PROJECT_ID}`, null, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(b.summary).toBeDefined()
  expect(b.summary.projectId).toBe(PROJECT_ID)
  expect(b.summary.count).toBe(1)
  expect(b.summary.avgScore).toBeCloseTo(0.78, 5)
  expect(b.summary.samples.length).toBe(1)
  expect(b.summary.samples[0].candTitle).toBe("Submit button missing on onboarding page")
  expect(b.summary.samples[0].existingKinds).toContain("autosim")
  // The "near-misses" segment must NOT be swallowed by the /:id route (would 404).
  expect(b.error).toBeUndefined()
})

test("GET /api/expectations/near-misses is 401 without a session", async () => {
  const r = await fetch(`${BASE}/api/expectations/near-misses?project=${PROJECT_ID}`)
  expect(r.status).toBe(401)
})

// ── B.5 (KLA-245): Trail picker + zero-Trail fallback ──────────────────────────────────────

test("B.5 repoint: enforce/confirm lands the assert in the EXPLICITLY-chosen non-first Trail", async () => {
  // Fresh validated expectation; hand-built draft targeting the Checkout (older, non-first) trail.
  const EXP_REPOINT_ID = `exp_repoint_${ts}`
  await rawClient.execute({
    sql: `INSERT INTO expectations (id, project_id, title, area, url_path, status, source_refs_json, corroboration_json, dedup_key, enforced_step_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [EXP_REPOINT_ID, PROJECT_ID, "Repoint target expectation", "signup", "/signup", "validated",
      JSON.stringify([{ kind: "snap", id: "snap_rp" }]),
      JSON.stringify({ snap: true, sim: false, recurrence: 3 }),
      `dedup_rp_${ts}`, null, NOW, NOW],
  })
  // The user repointed to the SIGNUP trail (which is the newest/first, but we assert the server
  // honors the explicit draft.trailId rather than any first-Trail default).
  const draft = {
    trailId: TRAIL_SIGNUP_ID,
    afterStepIdx: 0,
    action: "assert",
    target: { role: "heading", name: "Welcome" },
    checkpoint: { kind: "visible", description: "Welcome heading visible after signup" },
  }
  const r = await api("POST", `/api/expectations/${EXP_REPOINT_ID}/enforce/confirm?project=${PROJECT_ID}`, { draft }, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(b.trailId).toBe(TRAIL_SIGNUP_ID)
  // The new assert step must belong to the chosen trail, not the Checkout trail.
  const stepRow = await rawClient.execute({ sql: "SELECT trail_id, action FROM trail_steps WHERE id=?", args: [b.stepId] })
  expect(stepRow.rows.length).toBe(1)
  expect(String((stepRow.rows[0] as any).trail_id)).toBe(TRAIL_SIGNUP_ID)
  expect(String((stepRow.rows[0] as any).action)).toBe("assert")
})

test("B.5 zero-Trail: enforce returns zeroTrails:true (200), NOT a 422 dead end", async () => {
  const r = await api("POST", `/api/expectations/${EXP_ZT_ID}/enforce?project=${PROJ_ZT}`, {}, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(b.zeroTrails).toBe(true)
  expect(b.draft).toBeUndefined()
  expect(Array.isArray(b.trails)).toBe(true)
  expect(b.trails.length).toBe(0)
})

test("B.5 hold-awaiting-trail: flags the expectation and suppresses the Enforce offer", async () => {
  const r = await api("POST", `/api/expectations/${EXP_ZT_ID}/hold-awaiting-trail?project=${PROJ_ZT}`, {}, ADMIN_SID)
  expect(r.status).toBe(200)
  expect((await r.json()).awaitingTrail).toBe(true)

  // The expectation is still validated but now carries awaitingTrail=true in the list.
  const list = await api("GET", `/api/expectations?project=${PROJ_ZT}`, null, ADMIN_SID)
  const lb = await list.json()
  const exp = lb.expectations.find((e: any) => e.id === EXP_ZT_ID)
  expect(exp).toBeDefined()
  expect(exp.status).toBe("validated")
  expect(exp.awaitingTrail).toBe(true)

  // DB row reflects the hold.
  const row = await rawClient.execute({ sql: "SELECT awaiting_trail FROM expectations WHERE id=?", args: [EXP_ZT_ID] })
  expect(Number((row.rows[0] as any).awaiting_trail)).toBe(1)
})

test("B.5 awaiting-Trail resume: creating a Trail covering the path clears the hold on next list load", async () => {
  // Precondition: EXP_ZT_ID (urlPath /pricing) is held awaiting a Trail from the prior test.
  const pre = await rawClient.execute({ sql: "SELECT awaiting_trail FROM expectations WHERE id=?", args: [EXP_ZT_ID] })
  expect(Number((pre.rows[0] as any).awaiting_trail)).toBe(1)

  // Create a Trail in the zero-Trail project whose step navigates to /pricing.
  const ZT_TRAIL_ID = `trl_zt_${ts}`
  await rawClient.execute({
    sql: `INSERT INTO trails (id, project_id, name, intent, base_url, author_kind, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [ZT_TRAIL_ID, PROJ_ZT, "Pricing tour", "browse pricing", "https://shop.test", "human", "active", ADMIN_EMAIL, NOW, NOW],
  })
  await rawClient.execute({
    sql: `INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [`ts_ztp_${ts}`, ZT_TRAIL_ID, PROJ_ZT, 0, "navigate", "https://shop.test/pricing", null, null, NOW],
  })

  // Loading the expectations board resumes the hold (server clears awaiting_trail for covered paths).
  const list = await api("GET", `/api/expectations?project=${PROJ_ZT}`, null, ADMIN_SID)
  const lb = await list.json()
  const exp = lb.expectations.find((e: any) => e.id === EXP_ZT_ID)
  expect(exp).toBeDefined()
  expect(exp.awaitingTrail).toBe(false)

  const row = await rawClient.execute({ sql: "SELECT awaiting_trail FROM expectations WHERE id=?", args: [EXP_ZT_ID] })
  expect(Number((row.rows[0] as any).awaiting_trail)).toBe(0)
})

// ── B.10 (KLA-250): TRULY enriched GET /api/expectations/:id ──────────────────────────────────
// The route must hydrate source refs → linkable report/finding evidence (title + grounded quote),
// resolve the enforced guard's step id → its Trail NAME + step POSITION ("step N of M", never the
// raw ts_ UUID), and expose a progress-to-Confirmed hint for a Seen-once (candidate) row.

// Seed a finding (findings table exists in the harness schema) + a CANDIDATE expectation that
// references it as a source, with a single-source corroboration so a progress hint is meaningful.
const FINDING_ID = `find_b10_${ts}`
await rawExec(
  `INSERT INTO findings (id, project_id, run_id, step_id, trail_id, kind, title, evidence_json, ground_quote, confidence, dedup_key, recurrence, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [FINDING_ID, PROJECT_ID, `run_b10_${ts}`, null, TRAIL_ID, "assertion_failed", "Finish button missing after checkout",
    null, "The Finish button never rendered on /checkout", 0.9, `fdedup_b10_${ts}`, 1, "queued", NOW, NOW]
)
const EXP_CAND_B10 = `exp_cand_b10_${ts}`
await rawExec(
  `INSERT INTO expectations (id, project_id, title, area, url_path, status, source_refs_json, corroboration_json, dedup_key, enforced_step_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [EXP_CAND_B10, PROJECT_ID, "Finish button must render after checkout", "checkout", "/checkout", "candidate",
    JSON.stringify([{ kind: "finding", id: FINDING_ID }]),
    JSON.stringify({ snap: false, sim: true, recurrence: 1 }),
    `dedup_cand_b10_${ts}`, null, NOW, NOW]
)

// A DEDICATED trail with exactly 2 recorded steps + 1 enforced assert step, so the enriched
// step-position ("step 3 of 3") is deterministic (isolated from other tests' step mutations).
const TRAIL_B10_ID = `trl_b10_${ts}`
const STEP_B10_ENF = `ts_b10_enf_${ts}`
await rawExec(`INSERT INTO trails (id, project_id, name, intent, base_url, author_kind, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [TRAIL_B10_ID, PROJECT_ID, "Guarded Signup", "sign up", "https://shop.test", "human", "active", ADMIN_EMAIL, NOW, NOW])
await rawExec(`INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [`ts_b10_0_${ts}`, TRAIL_B10_ID, PROJECT_ID, 0, "navigate", "https://shop.test/signup", null, null, NOW])
await rawExec(`INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [`ts_b10_1_${ts}`, TRAIL_B10_ID, PROJECT_ID, 1, "click", null, JSON.stringify({ role: "button", name: "Sign up" }), null, NOW])
await rawExec(`INSERT INTO trail_steps (id, trail_id, project_id, idx, action, action_value, target_json, checkpoint_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [STEP_B10_ENF, TRAIL_B10_ID, PROJECT_ID, 2, "assert", null, JSON.stringify({ role: "heading", name: "Welcome" }), JSON.stringify({ kind: "visible", description: "Welcome heading visible" }), NOW])
const EXP_GUARDED_B10 = `exp_guarded_b10_${ts}`
await rawExec(
  `INSERT INTO expectations (id, project_id, title, area, url_path, status, source_refs_json, corroboration_json, dedup_key, enforced_step_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [EXP_GUARDED_B10, PROJECT_ID, "Welcome heading visible after signup", "signup", "/signup", "enforced",
    JSON.stringify([{ kind: "snap", id: "snap_g" }, { kind: "sim", id: "sim_g" }]),
    JSON.stringify({ snap: true, sim: true, recurrence: 2 }),
    `dedup_guarded_b10_${ts}`, STEP_B10_ENF, NOW, NOW]
)

test("B.10 enriched GET resolves a finding source ref → title + grounded quote + finding bucket", async () => {
  const r = await api("GET", `/api/expectations/${EXP_CAND_B10}?project=${PROJECT_ID}`, null, ADMIN_SID)
  expect(r.status).toBe(200)
  const b = await r.json()
  const exp = b.expectation
  expect(exp.id).toBe(EXP_CAND_B10)
  expect(Array.isArray(exp.sources)).toBe(true)
  expect(exp.sources.length).toBe(1)
  const src = exp.sources[0]
  expect(src.kind).toBe("finding")
  expect(src.resolved).toBe(true)
  expect(src.title).toBe("Finish button missing after checkout")
  expect(src.groundedQuote).toBe("The Finish button never rendered on /checkout")
})

test("B.10 enriched GET gives a Seen-once (candidate) row a progress-to-Confirmed hint", async () => {
  const r = await api("GET", `/api/expectations/${EXP_CAND_B10}?project=${PROJECT_ID}`, null, ADMIN_SID)
  const b = await r.json()
  const p = b.expectation.progress
  expect(p).toBeTruthy()
  expect(p.ready).toBe(false)
  // sim present, snap absent, recurrence 1 → "needs a second source (a human report) — or 2 more sightings"
  expect(p.hint).toContain("a human report")
  expect(p.hint.toLowerCase()).toContain("sighting")
})

test("B.10 enriched GET resolves an enforced guard's step → Trail NAME + step POSITION (no ts_ UUID)", async () => {
  const r = await api("GET", `/api/expectations/${EXP_GUARDED_B10}?project=${PROJECT_ID}`, null, ADMIN_SID)
  expect(r.status).toBe(200)
  const exp = (await r.json()).expectation
  expect(exp.linkedTrail).toBeTruthy()
  expect(exp.linkedTrail.trailName).toBe("Guarded Signup")
  expect(exp.linkedTrail.stepId).toBe(STEP_B10_ENF)
  // The dedicated trail has steps at idx 0,1 + the assert step at idx 2 → the guard is 3rd of 3.
  expect(exp.linkedTrail.stepPosition).toBe(3)
  expect(exp.linkedTrail.stepCount).toBe(3)
  // An enforced (Guarded) row carries no progress hint.
  expect(exp.progress).toBeNull()
})

test("B.10 list GET returns enriched rows (linkedTrail on the guarded one, progress on the candidate)", async () => {
  const r = await api("GET", `/api/expectations?project=${PROJECT_ID}`, null, ADMIN_SID)
  expect(r.status).toBe(200)
  const rows = (await r.json()).expectations as any[]
  const guarded = rows.find((e) => e.id === EXP_GUARDED_B10)
  expect(guarded).toBeDefined()
  expect(guarded.linkedTrail?.trailName).toBe("Guarded Signup")
  const cand = rows.find((e) => e.id === EXP_CAND_B10)
  expect(cand).toBeDefined()
  expect(cand.progress?.ready).toBe(false)
  expect(Array.isArray(cand.sources)).toBe(true)
})
