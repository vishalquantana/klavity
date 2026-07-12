// Task: RIGHT-CLICK MENU config setting (JTBD 1.6 / KLAVITYKLA-220) — server config
// endpoint coverage. Tests that POST /api/projects/:id/config accepts + persists the
// rightClickMode field (full | reportOnly | off) into modal_config_json, sanitises bad
// values (unknown mode) rather than persisting them, and that the public (unauthenticated,
// CORS-open) GET echoes the persisted value back via resolveModalConfig — so the widget can
// learn its right-click mode before any auth. Default (omitted) preserves 'full' behavior.
//
// Self-contained hermetic pattern mirroring server.projects-launcher-config.test.ts:
// a real server subprocess against a fresh temp DB.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

// ── Dedicated temp DB for the subprocess ─────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-rightclick-cfg-${ts}.db`)

// 32-byte AES-GCM key for this test run (all-42 bytes)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// Minimal schema (mirrors applySchema from db.ts).
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, widget_report_gate TEXT NOT NULL DEFAULT 'email', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, contact_email TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS monitored_urls (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, url_pattern TEXT NOT NULL, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, UNIQUE(project_id, url_pattern))`)
await rawExec(`CREATE TABLE IF NOT EXISTS monitoring_consent (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, status TEXT NOT NULL, granted_at INTEGER, updated_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT, created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_connectors_project ON connectors(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS mon_url_proj_idx ON monitored_urls(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS ext_tok_email_idx ON extension_tokens(email)`)

// ── Seed fixtures ─────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `admin-rightclick-${ts}@test.local`
const ADMIN_SID = `sess_rightclick_admin_${ts}`
const ACCOUNT_ID = `acct_rightclick_${ts}`
const PROJECT_ID = `proj_rightclick_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCOUNT_ID, "RightClick Workspace", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_r_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(
  `INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, widget_cta_url, widget_notify_email, widget_report_gate, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJECT_ID, ACCOUNT_ID, "RightClick Project", "active", "auto", 200, "named", "{}", "support", null, null, "email", NOW, NOW]
)
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_r_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

// ── Spawn the server on a random port ─────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 41000 + Math.floor(Math.random() * 1000)
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
    } catch { /* not ready yet */ }
    await Bun.sleep(150)
  }
})

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function authCookie(sid: string) { return `klav_session=${sid}` }

async function apiPost(path: string, body: any, sid?: string) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sid ? { Cookie: authCookie(sid) } : {}),
    },
    body: JSON.stringify(body),
  })
}

async function publicConfig() {
  // The widget's unauthenticated GET — returns resolveModalConfig(...) as modalConfig.
  const r = await fetch(`${BASE}/api/projects/${PROJECT_ID}/config`)
  expect(r.status).toBe(200)
  return (await r.json()) as any
}

async function dbModalConfig(): Promise<Record<string, unknown>> {
  const r = await rawClient.execute({
    sql: "SELECT modal_config_json FROM projects WHERE id=?",
    args: [PROJECT_ID],
  })
  return JSON.parse(String((r.rows[0] as any).modal_config_json || "{}"))
}

// ── Tests: accept + persist each valid rightClickMode ─────────────────────────

test("default project (no rightClickMode set) omits the field — widget falls back to 'full'", async () => {
  const body = await publicConfig()
  // Never persisted → not echoed. The widget defaults to 'full' when absent.
  expect(body.modalConfig.rightClickMode).toBeUndefined()
})

test("POST /api/projects/:id/config persists rightClickMode into modal_config_json", async () => {
  const r = await apiPost(`/api/projects/${PROJECT_ID}/config`, {
    theme: "light",
    rightClickMode: "reportOnly",
  }, ADMIN_SID)
  expect(r.status).toBe(200)
  const body = await r.json() as any
  expect(body.ok).toBe(true)
  expect(body.modalConfig.rightClickMode).toBe("reportOnly")

  // Persisted to the DB.
  const mc = await dbModalConfig()
  expect(mc.rightClickMode).toBe("reportOnly")
})

test("public GET echoes the persisted rightClickMode (widget reads it pre-auth, CORS-open)", async () => {
  const body = await publicConfig()
  expect(body.modalConfig.rightClickMode).toBe("reportOnly")
})

test("each valid rightClickMode is accepted and persisted", async () => {
  for (const mode of ["full", "reportOnly", "off"] as const) {
    const r = await apiPost(`/api/projects/${PROJECT_ID}/config`, {
      theme: "light",
      rightClickMode: mode,
    }, ADMIN_SID)
    expect(r.status).toBe(200)
    const mc = await dbModalConfig()
    expect(mc.rightClickMode).toBe(mode)
  }
})

test("rightClickMode clears back to default when omitted (partial update)", async () => {
  // Set it, then POST without the field — validateModalConfigInput only includes
  // rightClickMode when present + valid, so omitting it drops the key (→ widget default 'full').
  await apiPost(`/api/projects/${PROJECT_ID}/config`, {
    theme: "light", rightClickMode: "off",
  }, ADMIN_SID)
  expect((await dbModalConfig()).rightClickMode).toBe("off")

  await apiPost(`/api/projects/${PROJECT_ID}/config`, {
    theme: "light",
  }, ADMIN_SID)
  const mc = await dbModalConfig()
  expect(mc.rightClickMode).toBeUndefined()
})

// ── Tests: sanitise bad values (not reject) ───────────────────────────────────

test("unknown rightClickMode is dropped (sanitised), not persisted or rejected", async () => {
  // An invalid mode must NOT cause a 400 (only an unknown theme does); it's silently dropped.
  const r = await apiPost(`/api/projects/${PROJECT_ID}/config`, {
    theme: "light",
    rightClickMode: "sims-only",
  }, ADMIN_SID)
  expect(r.status).toBe(200)
  const body = await r.json() as any
  expect(body.modalConfig.rightClickMode).toBeUndefined()
  const mc = await dbModalConfig()
  expect(mc.rightClickMode).toBeUndefined()
})

test("rightClickMode survives alongside the launcher fields (coexistence)", async () => {
  const r = await apiPost(`/api/projects/${PROJECT_ID}/config`, {
    theme: "dark",
    launcherMode: "icon",
    rightClickMode: "reportOnly",
  }, ADMIN_SID)
  expect(r.status).toBe(200)
  const body = await r.json() as any
  expect(body.modalConfig.launcherMode).toBe("icon")
  expect(body.modalConfig.rightClickMode).toBe("reportOnly")
  const mc = await dbModalConfig()
  expect(mc.launcherMode).toBe("icon")
  expect(mc.rightClickMode).toBe("reportOnly")
})

test("unknown theme still rejects with 400 and rightClickMode is not persisted", async () => {
  // Confirms the theme gate fires FIRST; a bad theme must 400 and write nothing.
  // First set a known-good baseline so we can prove the 400 write is rejected.
  await apiPost(`/api/projects/${PROJECT_ID}/config`, { theme: "light" }, ADMIN_SID)
  const r = await apiPost(`/api/projects/${PROJECT_ID}/config`, {
    theme: "invalid-theme",
    rightClickMode: "off",
  }, ADMIN_SID)
  expect(r.status).toBe(400)
  const mc = await dbModalConfig()
  expect(mc.rightClickMode).toBeUndefined()
})
