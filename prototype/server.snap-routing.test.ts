// Snap routing (human-Snap auto-file vs review-first) — HTTP integration tests.
// Verifies:
//  1. autofile mode (DEFAULT): a HUMAN Snap (POST /api/feedback, no sim_id) with an auto_copy tracker
//     exports to the tracker IMMEDIATELY on submit — reusing the existing auto-copy path.
//  2. review mode: a human Snap does NOT auto-export on submit; the manual export endpoint
//     (POST /api/feedback/:id/export) still sends it.
//  3. Sim/AutoSim reports are UNAFFECTED: a report attributed to a Sim (sim_id set) does NOT autofile
//     on submit even in autofile mode (it keeps its triage-gated behavior).
//  4. The setting persists + defaults to autofile via GET /api/projects/:id/snap-routing.
//
// Pattern mirrors server.triage-autocopy.test.ts: spawn the real server against a fresh temp DB,
// exercise via HTTP. applySchema (run on boot) ALTER-adds the snap_routing column to the seeded
// projects table (default 'autofile').

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-snap-routing-${ts}.db`)

const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(55)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// Minimal schema (mirrors server.triage-autocopy.test.ts). applySchema fills the rest on boot.
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'new', assignee TEXT, notes TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_connectors_project ON connectors(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_texports_feedback ON ticket_exports(feedback_id)`)

// ── Fixtures ────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `vishal@quantana.com.au`
const ADMIN_SID = `sess_sr_admin_${ts}`
const ACCOUNT_ID = `acct_sr_${ts}`
const PROJECT_ID = `proj_sr_${ts}`
const SIM_ID = `sim_sr_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "SR Test Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_sr_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJECT_ID, ACCOUNT_ID, "SR Test Project", "active", "auto", 200, "named", "{}", "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_sr_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
// A Sim persona so a report can be attributed to it (sim_id) and prove Sim reports are unaffected.
await rawExec(`INSERT INTO personas (id, project_id, name, role, type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [SIM_ID, PROJECT_ID, "Test Sim", "buyer", "client", NOW, NOW])

// ── Server spawn ────────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 47000 + Math.floor(Math.random() * 1000)
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
      KLAV_TEST_ALLOW_LOOPBACK: "1",
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 12_000
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

// ── Helpers ──────────────────────────────────────────────────────────────────
function authHeader(sid: string) { return { Authorization: `Bearer ${sid}`, Cookie: `klav_session=${sid}` } }
async function api(method: string, path: string, body: any, sid: string) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeader(sid) },
    body: body != null ? JSON.stringify(body) : undefined,
  })
}
async function exportRows(connectorId: string) {
  const r = await rawClient.execute({
    sql: "SELECT status, feedback_id FROM ticket_exports WHERE connector_id=? ORDER BY rowid ASC",
    args: [connectorId],
  })
  return r.rows as any[]
}
async function waitForExport(connectorId: string, count = 1, waitMs = 4000): Promise<any[]> {
  const deadline = Date.now() + waitMs
  while (Date.now() < deadline) {
    const rows = await exportRows(connectorId)
    if (rows.length >= count) return rows
    await Bun.sleep(60)
  }
  return exportRows(connectorId)
}
async function submitHumanSnap(desc: string, extra: Record<string, string> = {}) {
  const fd = new FormData()
  fd.set("description", desc)
  fd.set("project_id", PROJECT_ID)
  for (const [k, v] of Object.entries(extra)) fd.set(k, v)
  return fetch(`${BASE}/api/feedback`, { method: "POST", headers: authHeader(ADMIN_SID), body: fd })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

// The setting defaults to autofile (fresh project, column added by applySchema on boot).
test("snap-routing defaults to autofile and persists a POST'd change", async () => {
  const g = await api("GET", `/api/projects/${PROJECT_ID}/snap-routing`, null, ADMIN_SID)
  expect(g.status).toBe(200)
  const gd = await g.json()
  expect(gd.snapRouting).toBe("autofile")
  expect(gd.modes).toEqual(["autofile", "review"])

  const p = await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
  expect(p.status).toBe(200)
  expect((await p.json()).snapRouting).toBe("review")

  const g2 = await api("GET", `/api/projects/${PROJECT_ID}/snap-routing`, null, ADMIN_SID)
  expect((await g2.json()).snapRouting).toBe("review")

  // Restore to autofile for the following tests.
  await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
})

// AUTOFILE (default): a human Snap with an auto_copy tracker exports on SUBMIT.
test("autofile mode: human Snap auto-files to the tracker on submit", async () => {
  let hits = 0
  const recv = Bun.serve({ port: 0, fetch() { hits++; return new Response(JSON.stringify({ id: "af1" }), { status: 201 }) } })
  try {
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "SR Autofile Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    const fr = await submitHumanSnap(`autofile human snap ${ts}`)
    expect(fr.ok).toBe(true)

    const landed = await waitForExport(cid, 1, 5000)
    expect(landed.length).toBe(1)
    expect(String(landed[0].status)).toBe("ok")
    expect(hits).toBe(1)
  } finally { recv.stop(true) }
}, 15000)

// REVIEW mode: a human Snap does NOT auto-export on submit; manual export sends it.
test("review mode: human Snap does not auto-export on submit; manual export sends it", async () => {
  let hits = 0
  const recv = Bun.serve({ port: 0, fetch() { hits++; return new Response(JSON.stringify({ id: "rv1" }), { status: 201 }) } })
  try {
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "review" }, ADMIN_SID)
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "SR Review Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    const fr = await submitHumanSnap(`review human snap ${ts}`)
    expect(fr.ok).toBe(true)
    const fid = (await fr.json()).id
    expect(fid).toBeTruthy()

    // No auto-export on submit in review mode.
    await Bun.sleep(900)
    expect(hits).toBe(0)
    expect((await exportRows(cid)).length).toBe(0)

    // Manual "Send to Jira": POST /api/feedback/:id/export sends it now.
    const ex = await api("POST", `/api/feedback/${fid}/export`, { connectorId: cid }, ADMIN_SID)
    expect(ex.status).toBe(200)
    const landed = await waitForExport(cid, 1, 5000)
    expect(landed.length).toBe(1)
    expect(String(landed[0].status)).toBe("ok")
    expect(hits).toBe(1)
  } finally { recv.stop(true) }
}, 15000)

// Sim/AutoSim reports are UNAFFECTED: attributed to a Sim, no autofile on submit even in autofile mode.
test("autofile mode: a Sim-attributed report does NOT auto-file on submit", async () => {
  let hits = 0
  const recv = Bun.serve({ port: 0, fetch() { hits++; return new Response(JSON.stringify({ id: "sim1" }), { status: 201 }) } })
  try {
    await api("POST", `/api/projects/${PROJECT_ID}/snap-routing`, { snapRouting: "autofile" }, ADMIN_SID)
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook", name: "SR Sim Webhook",
      config: { url: `http://localhost:${recv.port}/hook` }, autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)

    // Report attributed to a Sim persona → sim_id set → NOT a human Snap → no autofile on submit.
    const fr = await submitHumanSnap(`sim attributed report ${ts}`, { sim_id: SIM_ID })
    expect(fr.ok).toBe(true)

    await Bun.sleep(900)
    expect(hits).toBe(0)
  } finally { recv.stop(true) }
}, 15000)
