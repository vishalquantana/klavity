// KLAVITYKLA-287 (JTBD 5.8): per-project export policy + member export requests.
//
// The manual "Copy to…" export used to be hard admin-only. This suite exercises the three policies:
//   admins_only     — only admins may export directly (members 403)
//   members_export  — members may export directly
//   members_request — members raise a request an admin approves with one click
//
// Hermetic pattern mirrors server.export-guard.test.ts: dedicated temp DB file + a real server
// subprocess, seeded via a raw createClient. The server's applySchema (run on boot) adds the new
// export_policy column + export_requests table onto the seeded DB, so we set policy via the API.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-exppolicy-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

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

const ADMIN_EMAIL = `admin-${ts}@test.local`
const MEMBER_EMAIL = `member-${ts}@test.local`
const ADMIN_SID = `sess_admin_${ts}`
const MEMBER_SID = `sess_member_${ts}`
const ACCOUNT_ID = `acct_${ts}`
const PROJECT_ID = `proj_${ACCOUNT_ID}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [MEMBER_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "Test Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_admin_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_member_${ts}`, ACCOUNT_ID, MEMBER_EMAIL, "member", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "Default Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_admin_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_member_${ts}`, PROJECT_ID, MEMBER_EMAIL, "member", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [MEMBER_SID, MEMBER_EMAIL, NOW, NOW + 86400_000])

// One connector — unreachable URL, so any export that ACTUALLY runs returns status:"failed".
// That's fine: a 200 with { ok:true } proves the POLICY let the request through (the point of
// these tests). The connector's presence also lets a member SEE a destination.
const CONNECTOR_ID = `conn_${ts}`
await rawExec(
  `INSERT INTO connectors (id, project_id, type, name, config, auto_copy, enabled, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [CONNECTOR_ID, PROJECT_ID, "webhook", "Acme Tracker",
   JSON.stringify({ url: "https://this-host-definitely-does-not-exist-12345.invalid/hook" }), 0, 1, NOW, ADMIN_EMAIL]
)

// A distinct ticket per policy scenario so they don't cross-contaminate the export/request tables.
const FID_ADMIN_ONLY = `fb_ao_${ts}`
const FID_MEMBERS_EXPORT = `fb_me_${ts}`
const FID_MEMBERS_REQUEST = `fb_mr_${ts}`
const FID_REJECT = `fb_rej_${ts}`
for (const [fid, obs] of [[FID_ADMIN_ONLY, "admins-only bug"], [FID_MEMBERS_EXPORT, "members-export bug"], [FID_MEMBERS_REQUEST, "members-request bug"], [FID_REJECT, "reject bug"]] as const) {
  await rawExec(`INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [fid, PROJECT_ID, obs, "high", "open", NOW])
}

let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  const serverPort = 34000 + Math.floor(Math.random() * 1000)
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
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
})

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

function api(method: string, path: string, sid: string, body?: any) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: `klav_session=${sid}` },
    body: body != null ? JSON.stringify(body) : undefined,
  })
}
const admin = (m: string, p: string, b?: any) => api(m, p, ADMIN_SID, b)
const member = (m: string, p: string, b?: any) => api(m, p, MEMBER_SID, b)

async function setPolicy(policy: string) {
  const r = await admin("POST", `/api/projects/${PROJECT_ID}/export-policy`, { policy })
  expect(r.status).toBe(200)
  expect((await r.json()).exportPolicy).toBe(policy)
}
async function pendingCount() {
  const r = await rawClient.execute({ sql: "SELECT COUNT(*) AS n FROM export_requests WHERE project_id=? AND status='pending'", args: [PROJECT_ID] })
  return Number((r.rows[0] as any).n)
}

// ── default policy is admins_only ───────────────────────────────────────────

test("default export policy is admins_only and is member-readable via /connectors", async () => {
  const r = await member("GET", `/api/projects/${PROJECT_ID}/connectors`)
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.exportPolicy).toBe("admins_only")
  // Requirement 4: a non-admin member can SEE the destinations.
  expect((d.connectors || []).some((c: any) => c.id === CONNECTOR_ID)).toBe(true)
})

// ── admins_only ─────────────────────────────────────────────────────────────

test("admins_only: a member cannot export directly (403)", async () => {
  await setPolicy("admins_only")
  const r = await member("POST", `/api/feedback/${FID_ADMIN_ONLY}/export`, { connectorId: CONNECTOR_ID })
  expect(r.status).toBe(403)
  expect((await r.json()).exportPolicy).toBe("admins_only")
})

test("admins_only: an admin can export directly (policy lets it through)", async () => {
  const r = await admin("POST", `/api/feedback/${FID_ADMIN_ONLY}/export`, { connectorId: CONNECTOR_ID })
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.ok).toBe(true)
  // Unreachable connector → status "failed", which still proves the export CALL ran (not gated).
  expect(d.export.status).toBe("failed")
})

test("admins_only: a member's request path is refused (requests not enabled)", async () => {
  const r = await member("POST", `/api/feedback/${FID_ADMIN_ONLY}/export-request`, { connectorId: CONNECTOR_ID })
  expect(r.status).toBe(400)
})

// ── members_export ──────────────────────────────────────────────────────────

test("members_export: a member CAN export directly", async () => {
  await setPolicy("members_export")
  const r = await member("POST", `/api/feedback/${FID_MEMBERS_EXPORT}/export`, { connectorId: CONNECTOR_ID })
  expect(r.status).toBe(200)
  expect((await r.json()).ok).toBe(true)
})

// ── members_request ─────────────────────────────────────────────────────────

test("members_request: a member cannot export directly, but is told it's requestable (403)", async () => {
  await setPolicy("members_request")
  const r = await member("POST", `/api/feedback/${FID_MEMBERS_REQUEST}/export`, { connectorId: CONNECTOR_ID })
  expect(r.status).toBe(403)
  const d = await r.json()
  expect(d.requestable).toBe(true)
  expect(d.exportPolicy).toBe("members_request")
})

test("members_request: a member creates an export request an admin can see", async () => {
  const before = await pendingCount()
  const r = await member("POST", `/api/feedback/${FID_MEMBERS_REQUEST}/export-request`, { connectorId: CONNECTOR_ID })
  expect(r.status).toBe(201)
  const d = await r.json()
  expect(d.ok).toBe(true)
  expect(d.request.status).toBe("pending")
  expect(await pendingCount()).toBe(before + 1)

  // Admin sees it in the pending list, enriched with the ticket title + destination.
  const lr = await admin("GET", `/api/projects/${PROJECT_ID}/export-requests`)
  expect(lr.status).toBe(200)
  const list = (await lr.json()).requests || []
  const mine = list.find((x: any) => x.feedbackId === FID_MEMBERS_REQUEST)
  expect(mine).toBeTruthy()
  expect(mine.requestedBy).toBe(MEMBER_EMAIL)
  expect(mine.connectorName).toBe("Acme Tracker")
})

test("members_request: a non-admin cannot list or approve requests", async () => {
  const lr = await member("GET", `/api/projects/${PROJECT_ID}/export-requests`)
  expect(lr.status).toBe(403)
})

test("members_request: an admin approves a request — it exports and the request resolves", async () => {
  const lr = await admin("GET", `/api/projects/${PROJECT_ID}/export-requests`)
  const rid = ((await lr.json()).requests || []).find((x: any) => x.feedbackId === FID_MEMBERS_REQUEST).id
  const before = await pendingCount()

  const ar = await admin("POST", `/api/projects/${PROJECT_ID}/export-requests/${rid}/approve`)
  expect(ar.status).toBe(200)
  const d = await ar.json()
  expect(d.ok).toBe(true)
  expect(d.status).toBe("approved")
  expect(d.export).toBeTruthy() // export ran (status failed on the unreachable connector, but it ran)
  // The request is no longer pending, and it linked to a ticket_exports row.
  expect(await pendingCount()).toBe(before - 1)
  const row = await rawClient.execute({ sql: "SELECT status, export_id FROM export_requests WHERE id=?", args: [rid] })
  expect(String((row.rows[0] as any).status)).toBe("approved")
  expect((row.rows[0] as any).export_id).toBeTruthy()
})

test("members_request: approving an already-resolved request is refused (409)", async () => {
  const lr = await admin("GET", `/api/projects/${PROJECT_ID}/export-requests`)
  // The approved one is gone from pending; re-approving by a stale id must 404/409, never re-export.
  const stale = await rawClient.execute({ sql: "SELECT id FROM export_requests WHERE feedback_id=? AND status='approved' LIMIT 1", args: [FID_MEMBERS_REQUEST] })
  const rid = String((stale.rows[0] as any).id)
  const ar = await admin("POST", `/api/projects/${PROJECT_ID}/export-requests/${rid}/approve`)
  expect(ar.status).toBe(409)
})

test("members_request: an admin can reject a request without exporting", async () => {
  // Member raises a request on a different ticket, admin rejects it.
  const cr = await member("POST", `/api/feedback/${FID_REJECT}/export-request`, { connectorId: CONNECTOR_ID })
  expect(cr.status).toBe(201)
  const rid = (await cr.json()).request.id
  const exportsBefore = await rawClient.execute({ sql: "SELECT COUNT(*) AS n FROM ticket_exports WHERE feedback_id=?", args: [FID_REJECT] })
  const nBefore = Number((exportsBefore.rows[0] as any).n)

  const rr = await admin("POST", `/api/projects/${PROJECT_ID}/export-requests/${rid}/reject`)
  expect(rr.status).toBe(200)
  expect((await rr.json()).status).toBe("rejected")
  // No export was produced by a reject.
  const exportsAfter = await rawClient.execute({ sql: "SELECT COUNT(*) AS n FROM ticket_exports WHERE feedback_id=?", args: [FID_REJECT] })
  expect(Number((exportsAfter.rows[0] as any).n)).toBe(nBefore)
})

// ── policy validation ─────────────────────────────────────────────────────────

test("setting an invalid policy is rejected (400)", async () => {
  const r = await admin("POST", `/api/projects/${PROJECT_ID}/export-policy`, { policy: "everyone_lol" })
  expect(r.status).toBe(400)
})

test("a member cannot change the export policy (403)", async () => {
  const r = await member("POST", `/api/projects/${PROJECT_ID}/export-policy`, { policy: "members_export" })
  expect(r.status).toBe(403)
})
