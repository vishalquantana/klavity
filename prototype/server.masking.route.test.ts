// prototype/server.masking.route.test.ts — CHOKE-POINT tests for PII/data masking (KLAVITYKLA-353).
//
// WHY THIS FILE EXISTS: lib/data-masking.test.ts is pure-unit only. It proved the masking FUNCTIONS
// worked while the public share-link PDF never called them — the feature shipped protecting the
// authenticated owner's copy and leaking the client's copy. Unit tests can never catch that. These
// tests assert the WIRING at every choke point, in both flag states:
//
//   /shared/walk-report/:token   (PUBLIC pdf)   masked ✓  / unmasked when off ✓
//   /shared/walk/:token/data     (PUBLIC json)  masked ✓  / unmasked when off ✓
//   /api/trails/walks/:id/report.pdf (authed)   masked ✓  / unmasked when off ✓
//   /api/team/export             (roster)       masked ✓  / unmasked when off ✓
//
// Plus the setting's WRITER (L9): before this, piiMasking could only be set by hand-editing
// projects.modal_config_json, so the whole feature was unreachable.
//
// Hermetic subprocess-server pattern. KLAV_TEST_FAKE_PDF=1 makes renderWalkPdf serialize the
// (transformed) report data into the fake PDF bytes, which is what makes masking observable here.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Dedicated temp DB ─────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-masking-route-${ts}.db`)

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
const ADMIN_EMAIL = `admin-mask-${ts}@test.local`
const ADMIN_SID = `sess_mask_admin_${ts}`
const OTHER_EMAIL = `other-mask-${ts}@test.local`
const OTHER_SID = `sess_mask_other_${ts}`
const ACCOUNT_ID = `acct_mask_${ts}`
const PROJECT_ID = `proj_mask_${ts}`
const OTHER_ACCOUNT_ID = `acct_mask_other_${ts}`
const OTHER_PROJECT_ID = `proj_mask_other_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCOUNT_ID, "Masking Test Workspace", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_mask_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "Masking Route Project", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_mask_admin_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OTHER_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [OTHER_ACCOUNT_ID, "Masking Other Workspace", OTHER_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_mask_other_${ts}`, OTHER_ACCOUNT_ID, OTHER_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [OTHER_PROJECT_ID, OTHER_ACCOUNT_ID, "Masking Other Project", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_mask_other_${ts}`, OTHER_PROJECT_ID, OTHER_EMAIL, "admin", null, NOW])

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

// ── PII fixtures ──────────────────────────────────────────────────────────────
// A finding whose title / ground quote / evidence all carry real-looking PII, plus a CSS selector
// that MUST survive masking intact (M3: over-masking corrupts the report).
const PII_EMAIL = "priya.sharma@clientco.com"
const PII_PHONE = "415-555-0100"
const PII_IP = "203.0.113.42"
const SAFE_SELECTOR = "#api_reference_guide_container"

const PII_FINDING_ID = `find_mask_${ts}`
await rawExec(
  `INSERT INTO findings (id, project_id, run_id, trail_id, kind, title, evidence_json, ground_quote, confidence, dedup_key, recurrence, status, created_at, updated_at)
   SELECT ?, ?, ?, trail_id, 'regression', ?, ?, ?, 0.9, ?, 1, 'queued', ?, ?
   FROM trail_runs WHERE id=?`,
  [
    PII_FINDING_ID, PROJECT_ID, WALK_RUN_ID,
    `Checkout failed for ${PII_EMAIL}`,
    JSON.stringify({ detail: `caller ${PII_PHONE} from ${PII_IP}`, selector: SAFE_SELECTOR }),
    `Support line ${PII_PHONE} shown to ${PII_EMAIL}`,
    `mask:${ts}`, NOW, NOW, WALK_RUN_ID,
  ],
)

// Two roster members that differ only in local part + one that shares a first letter (M7).
const MEMBER_A = `alice-${ts}@clientco.com`
const MEMBER_B = `bob-${ts}@clientco.com`
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_mask_a_${ts}`, PROJECT_ID, MEMBER_A, "member", null, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_mask_b_${ts}`, PROJECT_ID, MEMBER_B, "member", null, NOW])

// ── Spawn subprocess server ───────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let base: string

beforeAll(async () => {
  serverPort = 47200 + Math.floor(Math.random() * 600)
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
      KLAV_TEST_FAKE_PDF: "1",
    },
    stdout: "pipe",
    stderr: "pipe",
  })

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
const adminCookie = `klav_session=${ADMIN_SID}`
const otherCookie = `klav_session=${OTHER_SID}`

// Flip the setting through the REAL writer (the admin /config endpoint), not by hand-editing the DB —
// so every masked/unmasked assertion below also exercises the L9 fix.
async function setMasking(on: boolean): Promise<Response> {
  return fetch(`${base}/api/projects/${pid}/config`, {
    method: "POST",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ theme: "light", piiMasking: on }),
  })
}

async function mintShare(): Promise<{ url: string; pdfUrl: string }> {
  const r = await fetch(`${base}/api/trails/walks/${WALK_RUN_ID}/share?project=${pid}`, {
    method: "POST",
    headers: { cookie: adminCookie },
  })
  return r.json()
}

// ─────────────────────────────────────────────────────────────────────────────
// L9 — the setting now HAS a writer.
// ─────────────────────────────────────────────────────────────────────────────
test("L9: piiMasking defaults OFF and is readable by an admin", async () => {
  const r = await fetch(`${base}/api/projects/${pid}/config?admin=1`, { headers: { cookie: adminCookie } })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.piiMasking).toBe(false)
})

test("L9: an admin can turn piiMasking ON and read it back", async () => {
  expect((await setMasking(true)).status).toBe(200)
  const r = await fetch(`${base}/api/projects/${pid}/config?admin=1`, { headers: { cookie: adminCookie } })
  expect((await r.json()).piiMasking).toBe(true)
})

test("L9: an appearance-only save does NOT silently turn masking back off", async () => {
  await setMasking(true)
  // No piiMasking key at all — the validator strips unknown keys, so this is the regression that
  // would have wiped the setting on every theme change.
  const r = await fetch(`${base}/api/projects/${pid}/config`, {
    method: "POST",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ theme: "dark" }),
  })
  expect(r.status).toBe(200)
  const cfg = await (await fetch(`${base}/api/projects/${pid}/config?admin=1`, { headers: { cookie: adminCookie } })).json()
  expect(cfg.piiMasking).toBe(true)
  await setMasking(false)
})

test("L9: an admin can turn piiMasking back OFF", async () => {
  await setMasking(true)
  expect((await setMasking(false)).status).toBe(200)
  const cfg = await (await fetch(`${base}/api/projects/${pid}/config?admin=1`, { headers: { cookie: adminCookie } })).json()
  expect(cfg.piiMasking).toBe(false)
})

test("L9: a non-member cannot write piiMasking", async () => {
  const r = await fetch(`${base}/api/projects/${pid}/config`, {
    method: "POST",
    headers: { cookie: otherCookie, "content-type": "application/json" },
    body: JSON.stringify({ theme: "light", piiMasking: true }),
  })
  expect(r.status).toBe(403)
})

// ─────────────────────────────────────────────────────────────────────────────
// H1 — the PUBLIC share-link PDF. This is the finding that motivated the file.
// ─────────────────────────────────────────────────────────────────────────────
test("H1: GET /shared/walk-report/:token — PUBLIC pdf is MASKED when piiMasking is on", async () => {
  await setMasking(true)
  const { pdfUrl } = await mintShare()
  const r = await fetch(pdfUrl) // deliberately NO cookie — this route is unauthenticated
  expect(r.status).toBe(200)
  expect(r.headers.get("content-type")).toContain("application/pdf")
  const body = await r.text()
  expect(body).toContain("%PDF-fake-for-tests")
  expect(body).not.toContain(PII_EMAIL)
  expect(body).not.toContain(PII_PHONE)
  expect(body).not.toContain(PII_IP)
  expect(body).toContain("[EMAIL]")
})

test("H1: the public PDF is UNMASKED when piiMasking is off (proves the test can tell)", async () => {
  await setMasking(false)
  const { pdfUrl } = await mintShare()
  const body = await (await fetch(pdfUrl)).text()
  expect(body).toContain(PII_EMAIL)
  expect(body).not.toContain("[EMAIL]")
})

test("M3: the public masked PDF keeps CSS selectors intact (masking must not corrupt the report)", async () => {
  await setMasking(true)
  const { pdfUrl } = await mintShare()
  const body = await (await fetch(pdfUrl)).text()
  expect(body).toContain(SAFE_SELECTOR)
  expect(body).not.toContain("[TOKEN]")
})

// ─────────────────────────────────────────────────────────────────────────────
// The PUBLIC share JSON — the interactive shared page renders from this, so masking the
// PDF alone would still have leaked everything.
// ─────────────────────────────────────────────────────────────────────────────
test("GET /shared/walk/:token/data — PUBLIC json is MASKED when piiMasking is on", async () => {
  await setMasking(true)
  const { url: shareUrl } = await mintShare()
  const r = await fetch(shareUrl + "/data")
  expect(r.status).toBe(200)
  const raw = JSON.stringify(await r.json())
  expect(raw).not.toContain(PII_EMAIL)
  expect(raw).not.toContain(PII_PHONE)
  expect(raw).toContain("[EMAIL]")
})

test("GET /shared/walk/:token/data — PUBLIC json is UNMASKED when piiMasking is off", async () => {
  await setMasking(false)
  const { url: shareUrl } = await mintShare()
  const raw = JSON.stringify(await (await fetch(shareUrl + "/data")).json())
  expect(raw).toContain(PII_EMAIL)
})

// ─────────────────────────────────────────────────────────────────────────────
// The AUTHENTICATED walk PDF (already wired — locked down so it stays wired).
// ─────────────────────────────────────────────────────────────────────────────
test("GET /api/trails/walks/:id/report.pdf — authed pdf is MASKED when piiMasking is on", async () => {
  await setMasking(true)
  const r = await fetch(`${base}/api/trails/walks/${WALK_RUN_ID}/report.pdf?project=${pid}`, {
    headers: { cookie: adminCookie },
  })
  expect(r.status).toBe(200)
  const body = await r.text()
  expect(body).not.toContain(PII_EMAIL)
  expect(body).toContain("[EMAIL]")
})

test("GET /api/trails/walks/:id/report.pdf — authed pdf is UNMASKED when piiMasking is off", async () => {
  await setMasking(false)
  const body = await (await fetch(`${base}/api/trails/walks/${WALK_RUN_ID}/report.pdf?project=${pid}`, {
    headers: { cookie: adminCookie },
  })).text()
  expect(body).toContain(PII_EMAIL)
})

// ─────────────────────────────────────────────────────────────────────────────
// M7 — the member roster export.
// ─────────────────────────────────────────────────────────────────────────────
test("M7: GET /api/team/export — masked roster still DISTINGUISHES members", async () => {
  await setMasking(true)
  const r = await fetch(`${base}/api/team/export?project=${pid}&format=json`, { headers: { cookie: adminCookie } })
  expect(r.status).toBe(200)
  const { members } = await r.json()
  const emails = members.map((m: any) => m.email)
  // No verbatim addresses…
  expect(emails).not.toContain(MEMBER_A)
  expect(emails).not.toContain(MEMBER_B)
  // …and no two rows collapsed onto the same literal (the old "[EMAIL]" behavior).
  expect(new Set(emails).size).toBe(emails.length)
  expect(emails.every((e: string) => e.endsWith("@clientco.com") || e.endsWith("@test.local"))).toBe(true)
})

test("M7: the masked CSV is still a usable roster (one distinct row per member)", async () => {
  await setMasking(true)
  const csv = await (await fetch(`${base}/api/team/export?project=${pid}`, { headers: { cookie: adminCookie } })).text()
  expect(csv).not.toContain(MEMBER_A)
  const dataLines = csv.trim().split("\r\n").slice(1).filter(Boolean)
  const cells = dataLines.map((l) => l.split(",")[0])
  expect(new Set(cells).size).toBe(cells.length)
})

test("GET /api/team/export — roster is UNMASKED when piiMasking is off", async () => {
  await setMasking(false)
  const { members } = await (await fetch(`${base}/api/team/export?project=${pid}&format=json`, {
    headers: { cookie: adminCookie },
  })).json()
  expect(members.map((m: any) => m.email)).toContain(MEMBER_A)
})
