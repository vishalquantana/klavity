// KLA-282: Triage-gated auto-copy tests.
// Verifies that:
//  1. Auto-copy fires ONLY when a report is triage-accepted (PATCH status → "open"), NOT on raw submit.
//  2. Priority-threshold gating works: feedback below the connector's min priority is skipped.
//  3. Manual copy (POST /api/feedback/:id/export) still works regardless of triage state.
//
// Pattern: spawn real server process against a fresh temp DB, exercise via HTTP.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-triage-ac-${ts}.db`)

const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(55)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// Minimal schema (mirrors applySchema from db.ts — only tables the handlers touch).
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
const ADMIN_SID = `sess_ac_admin_${ts}`
const ACCOUNT_ID = `acct_ac_${ts}`
const PROJECT_ID = `proj_ac_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "AC Test Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_ac_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [PROJECT_ID, ACCOUNT_ID, "AC Test Project", "active", "auto", 200, "named", "{}", "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  [`pm_ac_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

// ── Server spawn ────────────────────────────────────────────────────────────
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 46000 + Math.floor(Math.random() * 1000)
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
      KLAV_TEST_ALLOW_LOOPBACK: "1",  // allow webhook to local test server
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 12_000
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

// Wait for async fire-and-forget to settle (max waitMs).
async function waitForExport(connectorId: string, count = 1, waitMs = 4000): Promise<any[]> {
  const deadline = Date.now() + waitMs
  while (Date.now() < deadline) {
    const rows = await exportRows(connectorId)
    if (rows.length >= count) return rows
    await Bun.sleep(60)
  }
  return exportRows(connectorId)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

// ── T1: Raw submit does NOT trigger auto-copy ─────────────────────────────────
// Even with an auto_copy connector present, filing via POST /api/feedback must NOT
// immediately copy to the external tracker. Copy happens on triage-accept only.
test("raw POST /api/feedback does not trigger auto-copy even with auto_copy connector", async () => {
  let hits = 0
  const recv = Bun.serve({
    port: 0,
    fetch() { hits++; return new Response(JSON.stringify({ id: "hit1" }), { status: 201 }) },
  })
  try {
    // Create an auto_copy webhook connector.
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook",
      name: "AC No-Submit Webhook",
      config: { url: `http://localhost:${recv.port}/hook` },
      autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)

    // File a raw feedback via POST /api/feedback.
    const fd = new FormData()
    fd.set("description", `no-submit autocopy test ${ts}`)
    fd.set("project_id", PROJECT_ID)
    const fr = await fetch(`${BASE}/api/feedback`, {
      method: "POST",
      headers: authHeader(ADMIN_SID),
      body: fd,
    })
    expect(fr.ok).toBe(true)

    // Wait long enough for a fire-and-forget to have arrived IF it was triggered.
    await Bun.sleep(800)
    // Must be zero hits — auto-copy is triage-gated; raw submit must NOT call the webhook.
    expect(hits).toBe(0)
  } finally {
    recv.stop(true)
  }
}, 12000)


// ── T2: Triage-accept (PATCH status=open from new) triggers auto-copy ─────────
test("PATCH status=open from new triggers auto-copy to webhook connector", async () => {
  let hits = 0
  const recv = Bun.serve({
    port: 0,
    fetch() { hits++; return new Response(JSON.stringify({ id: "triage-hit-1" }), { status: 201 }) },
  })
  try {
    // Create a new auto_copy connector for this test.
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook",
      name: "AC Triage Webhook",
      config: { url: `http://localhost:${recv.port}/hook` },
      autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    // Insert a feedback row with status="new" (simulating a raw/Sim-filed report awaiting triage).
    const fid = `fb_triage_ac_${ts}`
    await rawExec(
      `INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [fid, PROJECT_ID, "Triage-accept autocopy test bug", "high", "new", NOW],
    )

    // Triage-accept: PATCH status → open.
    const pr = await api("PATCH", `/api/feedback/${fid}`, { status: "open" }, ADMIN_SID)
    expect(pr.status).toBe(200)

    // Wait for the fire-and-forget export row to land.
    const landed = await waitForExport(cid, 1, 5000)
    expect(landed.length).toBe(1)
    expect(String(landed[0].status)).toBe("ok")
    expect(hits).toBe(1)
  } finally {
    recv.stop(true)
  }
}, 15000)


// ── T3: Priority threshold — below threshold is skipped ───────────────────────
// Connector has auto_copy_min_priority=high. Feedback priority=low → should NOT copy.
test("feedback below auto_copy_min_priority threshold is skipped on triage-accept", async () => {
  let hits = 0
  const recv = Bun.serve({
    port: 0,
    fetch() { hits++; return new Response(JSON.stringify({ id: "thresh-hit" }), { status: 201 }) },
  })
  try {
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook",
      name: "AC Threshold Webhook",
      config: { url: `http://localhost:${recv.port}/hook`, auto_copy_min_priority: "high" },
      autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)

    const fid = `fb_thresh_lo_${ts}`
    await rawExec(
      `INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [fid, PROJECT_ID, "Low priority bug that should not copy", "low", "new", NOW],
    )

    // Triage-accept.
    const pr = await api("PATCH", `/api/feedback/${fid}`, { status: "open" }, ADMIN_SID)
    expect(pr.status).toBe(200)

    // Wait — no export should arrive.
    await Bun.sleep(800)
    expect(hits).toBe(0)
  } finally {
    recv.stop(true)
  }
}, 12000)


// ── T4: Priority threshold — meets threshold copies ───────────────────────────
// Connector has auto_copy_min_priority=high. Feedback priority=urgent → should copy.
test("feedback meeting auto_copy_min_priority threshold copies on triage-accept", async () => {
  let hits = 0
  const recv = Bun.serve({
    port: 0,
    fetch() { hits++; return new Response(JSON.stringify({ id: "thresh-urgent" }), { status: 201 }) },
  })
  try {
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook",
      name: "AC Threshold High+ Webhook",
      config: { url: `http://localhost:${recv.port}/hook`, auto_copy_min_priority: "high" },
      autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    const fid = `fb_thresh_urg_${ts}`
    await rawExec(
      `INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [fid, PROJECT_ID, "Urgent bug that meets threshold", "urgent", "new", NOW],
    )

    const pr = await api("PATCH", `/api/feedback/${fid}`, { status: "open" }, ADMIN_SID)
    expect(pr.status).toBe(200)

    const landed = await waitForExport(cid, 1, 5000)
    expect(landed.length).toBe(1)
    expect(String(landed[0].status)).toBe("ok")
    expect(hits).toBe(1)
  } finally {
    recv.stop(true)
  }
}, 15000)


// ── T5: Not-yet-triaged (status stays new) → does NOT copy ────────────────────
// PATCH that changes priority but not status must NOT trigger auto-copy.
test("PATCH that changes priority only (status stays new) does not trigger auto-copy", async () => {
  let hits = 0
  const recv = Bun.serve({
    port: 0,
    fetch() { hits++; return new Response(JSON.stringify({ id: "no-trigger" }), { status: 201 }) },
  })
  try {
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook",
      name: "AC Priority-Only Webhook",
      config: { url: `http://localhost:${recv.port}/hook` },
      autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)

    const fid = `fb_notriage_${ts}`
    await rawExec(
      `INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [fid, PROJECT_ID, "Bug not yet triaged", "low", "new", NOW],
    )

    // PATCH only changes priority — does NOT change status → "open".
    const pr = await api("PATCH", `/api/feedback/${fid}`, { priority: "urgent" }, ADMIN_SID)
    expect(pr.status).toBe(200)

    await Bun.sleep(700)
    expect(hits).toBe(0)
  } finally {
    recv.stop(true)
  }
}, 12000)


// ── T6: Manual export (POST /api/feedback/:id/export) still works ─────────────
// The manual export path is unchanged — admin can export any ticket on demand.
test("manual POST /api/feedback/:id/export still works regardless of triage state", async () => {
  let hits = 0
  const recv = Bun.serve({
    port: 0,
    fetch() { hits++; return new Response(JSON.stringify({ id: "manual-export" }), { status: 201 }) },
  })
  try {
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook",
      name: "Manual Export Webhook",
      config: { url: `http://localhost:${recv.port}/hook` },
      autoCopy: false,  // auto_copy OFF — manual only
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    const fid = `fb_manual_export_${ts}`
    await rawExec(
      `INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [fid, PROJECT_ID, "Manual export test bug", "medium", "new", NOW],
    )

    // Manually export without triaging first.
    const er = await api("POST", `/api/feedback/${fid}/export`, { connectorId: cid }, ADMIN_SID)
    expect(er.status).toBe(200)
    expect(hits).toBe(1)

    // Check export row was created.
    const rows = await exportRows(cid)
    expect(rows.length).toBe(1)
    expect(String(rows[0].status)).toBe("ok")
  } finally {
    recv.stop(true)
  }
}, 12000)


// ─ T7: Triage from dismissed also triggers auto-copy (re-accept) ─────────────
test("PATCH status=open from dismissed (re-accept) also triggers auto-copy", async () => {
  let hits = 0
  const recv = Bun.serve({
    port: 0,
    fetch() { hits++; return new Response(JSON.stringify({ id: "reaccept" }), { status: 201 }) },
  })
  try {
    const cr = await api("POST", `/api/projects/${PROJECT_ID}/connectors`, {
      type: "webhook",
      name: "AC ReAccept Webhook",
      config: { url: `http://localhost:${recv.port}/hook` },
      autoCopy: true,
    }, ADMIN_SID)
    expect(cr.status).toBe(201)
    const cid = (await cr.json()).connector.id

    const fid = `fb_reaccept_${ts}`
    await rawExec(
      `INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [fid, PROJECT_ID, "Re-accept bug", "medium", "dismissed", NOW],
    )

    const pr = await api("PATCH", `/api/feedback/${fid}`, { status: "open" }, ADMIN_SID)
    expect(pr.status).toBe(200)

    const landed = await waitForExport(cid, 1, 5000)
    expect(landed.length).toBe(1)
    expect(String(landed[0].status)).toBe("ok")
    expect(hits).toBe(1)
  } finally {
    recv.stop(true)
  }
}, 15000)
