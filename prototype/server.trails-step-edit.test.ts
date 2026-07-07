// KLA-99: Route tests for PATCH /api/trails/:id/steps/:stepId and
// DELETE /api/trails/:id/steps/:stepId — editable draft trail steps.
// Hermetic subprocess-server pattern matching server.trails-author.route.test.ts.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Dedicated temp DB ─────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-step-edit-${ts}.db`)
const TEST_SECRET = Buffer.alloc(32, 11).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// ── Schema (mirrors applySchema from db.ts) ───────────────────────────────────
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
await rawExec(`CREATE TABLE IF NOT EXISTS test_accounts (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, login_email TEXT NOT NULL, password_enc TEXT NOT NULL, created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, UNIQUE(project_id, name))`)
await rawExec(`CREATE INDEX IF NOT EXISTS test_acc_proj_idx ON test_accounts (project_id)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trails (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, intent TEXT NOT NULL DEFAULT '', base_url TEXT NOT NULL, baseline_ref TEXT, author_kind TEXT NOT NULL DEFAULT 'human', status TEXT NOT NULL DEFAULT 'draft', created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trail_steps (id TEXT PRIMARY KEY, trail_id TEXT NOT NULL, project_id TEXT NOT NULL, idx INTEGER NOT NULL, action TEXT NOT NULL, action_value TEXT, target_json TEXT, checkpoint_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trail_runs (id TEXT PRIMARY KEY, trail_id TEXT NOT NULL, project_id TEXT NOT NULL, trigger TEXT NOT NULL DEFAULT 'manual', status TEXT NOT NULL DEFAULT 'running', llm_calls INTEGER NOT NULL DEFAULT 0, summary_json TEXT, started_at INTEGER NOT NULL, finished_at INTEGER)`)
await rawExec(`CREATE TABLE IF NOT EXISTS run_steps (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, trail_id TEXT NOT NULL, step_id TEXT NOT NULL, project_id TEXT NOT NULL, idx INTEGER NOT NULL, tier TEXT NOT NULL DEFAULT 'none', verdict TEXT NOT NULL DEFAULT 'skip', confidence REAL NOT NULL DEFAULT 0, diagnosis TEXT, healed INTEGER NOT NULL DEFAULT 0, evidence_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS locator_cache (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, trail_id TEXT NOT NULL, step_id TEXT NOT NULL, cache_key TEXT NOT NULL, resolved_selector TEXT NOT NULL, fingerprint_json TEXT, confidence REAL NOT NULL DEFAULT 1.0, source TEXT NOT NULL DEFAULT 'crystallize', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE UNIQUE INDEX IF NOT EXISTS lc_key_uq ON locator_cache(project_id, step_id)`)
await rawExec(`CREATE TABLE IF NOT EXISTS author_sessions (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, objective TEXT NOT NULL, base_url TEXT NOT NULL, test_account TEXT, status TEXT NOT NULL DEFAULT 'running', steps_json TEXT NOT NULL DEFAULT '[]', stall_reason TEXT, trail_id TEXT, verification_run_id TEXT, verification_verdict TEXT, llm_calls INTEGER NOT NULL DEFAULT 0, cost_usd REAL NOT NULL DEFAULT 0, created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS author_sess_proj_idx ON author_sessions (project_id, created_at)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_connectors_project ON connectors(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS mon_url_proj_idx ON monitored_urls(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS ext_tok_email_idx ON extension_tokens(email)`)

// ── Fixtures ──────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `admin-se-${ts}@test.local`
const ADMIN_SID = `sess_se_admin_${ts}`
const ACCOUNT_ID = `acct_se_${ts}`
const PROJECT_ID = `proj_se_${ts}`
const OTHER_EMAIL = `other-se-${ts}@test.local`
const OTHER_SID = `sess_se_other_${ts}`
const OTHER_ACCOUNT_ID = `acct_se_other_${ts}`
const OTHER_PROJECT_ID = `proj_se_other_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCOUNT_ID, "SE Workspace", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_se_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "SE Project", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_se_admin_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OTHER_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [OTHER_ACCOUNT_ID, "SE Other Workspace", OTHER_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_se_other_${ts}`, OTHER_ACCOUNT_ID, OTHER_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [OTHER_PROJECT_ID, OTHER_ACCOUNT_ID, "SE Other Project", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_se_other_${ts}`, OTHER_PROJECT_ID, OTHER_EMAIL, "admin", null, NOW])

await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [OTHER_SID, OTHER_EMAIL, NOW, NOW + 86400_000])

// ── Shared DB for seeding via lib ─────────────────────────────────────────────
process.env.KLAV_SECRET = TEST_SECRET
process.env.TURSO_DATABASE_URL = "file:" + srvDbFile
process.env.TURSO_AUTH_TOKEN = ""

const { reconnectDb, applySchema } = await import("./lib/db")
const { crystallize } = await import("./lib/trails-crystallize")
const { setTrailStatus, listTrailSteps } = await import("./lib/trails")

const _db = reconnectDb("file:" + srvDbFile)
await applySchema(_db)

// ── Server subprocess ─────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let base: string

beforeAll(async () => {
  serverPort = 45100 + Math.floor(Math.random() * 900)
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
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${base}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
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

function tinyTrajectory(name = "Step edit test trail") {
  return {
    name,
    intent: "navigate and click",
    baseUrl: "https://example.com",
    authorKind: "llm" as const,
    steps: [
      { action: "navigate" as const, actionValue: "https://example.com", url: "https://example.com", domHash: "h1" },
      { action: "click" as const, target: { role: "button", accessibleName: "Sign in", resolvedSelector: "#btn" }, url: "https://example.com", domHash: "h2" },
      { action: "type" as const, actionValue: "hello@test.com", target: { role: "textbox", accessibleName: "Email", resolvedSelector: "#email" }, url: "https://example.com", domHash: "h3" },
      { action: "assert" as const, target: { role: "heading", accessibleName: "Dashboard", resolvedSelector: "h1" }, checkpoint: { description: "Dashboard heading visible" }, url: "https://example.com/dash", domHash: "h4" },
    ],
  }
}

// ── Tests: PATCH /api/trails/:id/steps/:stepId ────────────────────────────────

test("PATCH step: edit actionValue on navigate step", async () => {
  const { trailId } = await crystallize(pid, tinyTrajectory("nav-edit"))
  const steps = await listTrailSteps(pid, trailId)
  const navStep = steps.find((s) => s.action === "navigate")!

  const r = await fetch(`${base}/api/trails/${trailId}/steps/${navStep.id}?project=${pid}`, {
    method: "PATCH",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ actionValue: "https://example.com/new" }),
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)

  // verify via GET /api/trails/:id/steps
  const rSteps = await fetch(`${base}/api/trails/${trailId}/steps?project=${pid}`, { headers: { cookie: adminCookie } })
  const { steps: fetched } = await rSteps.json()
  const updated = fetched.find((s: any) => s.id === navStep.id)
  expect(updated.actionValue).toBe("https://example.com/new")
})

test("PATCH step: edit actionValue on type step", async () => {
  const { trailId } = await crystallize(pid, tinyTrajectory("type-edit"))
  const steps = await listTrailSteps(pid, trailId)
  const typeStep = steps.find((s) => s.action === "type")!

  const r = await fetch(`${base}/api/trails/${trailId}/steps/${typeStep.id}?project=${pid}`, {
    method: "PATCH",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ actionValue: "new@example.com" }),
  })
  expect(r.status).toBe(200)

  const rSteps = await fetch(`${base}/api/trails/${trailId}/steps?project=${pid}`, { headers: { cookie: adminCookie } })
  const { steps: fetched } = await rSteps.json()
  expect(fetched.find((s: any) => s.id === typeStep.id).actionValue).toBe("new@example.com")
})

test("PATCH step: edit checkpoint description on assert step", async () => {
  const { trailId } = await crystallize(pid, tinyTrajectory("assert-edit"))
  const steps = await listTrailSteps(pid, trailId)
  const assertStep = steps.find((s) => s.action === "assert")!

  const r = await fetch(`${base}/api/trails/${trailId}/steps/${assertStep.id}?project=${pid}`, {
    method: "PATCH",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ checkpoint: { description: "Main header is visible on the page" } }),
  })
  expect(r.status).toBe(200)

  const rSteps = await fetch(`${base}/api/trails/${trailId}/steps?project=${pid}`, { headers: { cookie: adminCookie } })
  const { steps: fetched } = await rSteps.json()
  const updated = fetched.find((s: any) => s.id === assertStep.id)
  expect(updated.checkpoint?.description).toBe("Main header is visible on the page")
})

test("PATCH step 400: empty body", async () => {
  const { trailId } = await crystallize(pid, tinyTrajectory("patch-empty"))
  const steps = await listTrailSteps(pid, trailId)
  const navStep = steps.find((s) => s.action === "navigate")!

  const r = await fetch(`${base}/api/trails/${trailId}/steps/${navStep.id}?project=${pid}`, {
    method: "PATCH",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({}),
  })
  expect(r.status).toBe(400)
})

test("PATCH step 400: malformed checkpoint", async () => {
  const { trailId } = await crystallize(pid, tinyTrajectory("patch-bad-cp"))
  const steps = await listTrailSteps(pid, trailId)
  const assertStep = steps.find((s) => s.action === "assert")!

  const r = await fetch(`${base}/api/trails/${trailId}/steps/${assertStep.id}?project=${pid}`, {
    method: "PATCH",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ checkpoint: "not an object" }),
  })
  expect(r.status).toBe(400)
})

test("PATCH step 404: unknown trail", async () => {
  const r = await fetch(`${base}/api/trails/trl_ghost/steps/ts_ghost?project=${pid}`, {
    method: "PATCH",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ actionValue: "x" }),
  })
  expect(r.status).toBe(404)
})

test("PATCH step 404: unknown step on real draft trail", async () => {
  const { trailId } = await crystallize(pid, tinyTrajectory("patch-ghost-step"))

  const r = await fetch(`${base}/api/trails/${trailId}/steps/ts_ghost_step?project=${pid}`, {
    method: "PATCH",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ actionValue: "x" }),
  })
  expect(r.status).toBe(404)
})

test("PATCH step 409: trail is active (not draft)", async () => {
  const { trailId } = await crystallize(pid, tinyTrajectory("patch-active"))
  const steps = await listTrailSteps(pid, trailId)
  const navStep = steps.find((s) => s.action === "navigate")!
  await setTrailStatus(pid, trailId, "active")

  const r = await fetch(`${base}/api/trails/${trailId}/steps/${navStep.id}?project=${pid}`, {
    method: "PATCH",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ actionValue: "https://example.com/x" }),
  })
  expect(r.status).toBe(409)
})

test("PATCH step IDOR: cannot edit step from another project", async () => {
  // seed a trail in the OTHER project
  const { trailId: otherTrail } = await crystallize(OTHER_PROJECT_ID, tinyTrajectory("idor-patch"))
  const otherSteps = await listTrailSteps(OTHER_PROJECT_ID, otherTrail)
  const otherNav = otherSteps.find((s) => s.action === "navigate")!

  // admin tries to edit it using their own project param
  const r = await fetch(`${base}/api/trails/${otherTrail}/steps/${otherNav.id}?project=${pid}`, {
    method: "PATCH",
    headers: { cookie: adminCookie, "content-type": "application/json" },
    body: JSON.stringify({ actionValue: "https://evil.com" }),
  })
  // trail not found in admin's project
  expect(r.status).toBe(404)
})

test("PATCH step 401: unauthenticated", async () => {
  const { trailId } = await crystallize(pid, tinyTrajectory("patch-unauth"))
  const steps = await listTrailSteps(pid, trailId)
  const navStep = steps.find((s) => s.action === "navigate")!

  const r = await fetch(`${base}/api/trails/${trailId}/steps/${navStep.id}?project=${pid}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actionValue: "x" }),
  })
  expect(r.status).toBe(401)
})

// ── Tests: DELETE /api/trails/:id/steps/:stepId ───────────────────────────────

test("DELETE step: removes the step from a draft trail", async () => {
  const { trailId } = await crystallize(pid, tinyTrajectory("del-basic"))
  const stepsBefore = await listTrailSteps(pid, trailId)
  const toDelete = stepsBefore.find((s) => s.action === "click")!
  const countBefore = stepsBefore.length

  const r = await fetch(`${base}/api/trails/${trailId}/steps/${toDelete.id}?project=${pid}`, {
    method: "DELETE",
    headers: { cookie: adminCookie },
  })
  expect(r.status).toBe(200)
  expect((await r.json()).ok).toBe(true)

  // verify via GET /api/trails/:id/steps
  const rSteps = await fetch(`${base}/api/trails/${trailId}/steps?project=${pid}`, { headers: { cookie: adminCookie } })
  const { steps: stepsAfter } = await rSteps.json()
  expect(stepsAfter.length).toBe(countBefore - 1)
  expect(stepsAfter.find((s: any) => s.id === toDelete.id)).toBeUndefined()
})

test("DELETE step 404: unknown step on real draft trail", async () => {
  const { trailId } = await crystallize(pid, tinyTrajectory("del-ghost"))

  const r = await fetch(`${base}/api/trails/${trailId}/steps/ts_ghost_del?project=${pid}`, {
    method: "DELETE",
    headers: { cookie: adminCookie },
  })
  expect(r.status).toBe(404)
})

test("DELETE step 404: unknown trail", async () => {
  const r = await fetch(`${base}/api/trails/trl_ghost_del/steps/ts_x?project=${pid}`, {
    method: "DELETE",
    headers: { cookie: adminCookie },
  })
  expect(r.status).toBe(404)
})

test("DELETE step 409: trail is active (not draft)", async () => {
  const { trailId } = await crystallize(pid, tinyTrajectory("del-active"))
  const steps = await listTrailSteps(pid, trailId)
  const clickStep = steps.find((s) => s.action === "click")!
  await setTrailStatus(pid, trailId, "active")

  const r = await fetch(`${base}/api/trails/${trailId}/steps/${clickStep.id}?project=${pid}`, {
    method: "DELETE",
    headers: { cookie: adminCookie },
  })
  expect(r.status).toBe(409)
})

test("DELETE step IDOR: cannot delete step from another project", async () => {
  const { trailId: otherTrail } = await crystallize(OTHER_PROJECT_ID, tinyTrajectory("idor-del"))
  const otherSteps = await listTrailSteps(OTHER_PROJECT_ID, otherTrail)
  const otherStep = otherSteps.find((s) => s.action === "click")!

  const r = await fetch(`${base}/api/trails/${otherTrail}/steps/${otherStep.id}?project=${pid}`, {
    method: "DELETE",
    headers: { cookie: adminCookie },
  })
  expect(r.status).toBe(404)
})

test("DELETE step 401: unauthenticated", async () => {
  const { trailId } = await crystallize(pid, tinyTrajectory("del-unauth"))
  const steps = await listTrailSteps(pid, trailId)
  const navStep = steps.find((s) => s.action === "navigate")!

  const r = await fetch(`${base}/api/trails/${trailId}/steps/${navStep.id}?project=${pid}`, {
    method: "DELETE",
  })
  expect(r.status).toBe(401)
})
