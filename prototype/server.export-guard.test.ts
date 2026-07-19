// KLA-283 (JTBD 5.4): already-exported guard + retry.
//
// Regression coverage for the bug: re-clicking "Copy to…" on a ticket that was ALREADY exported
// to a connector silently created a SECOND external issue. The export endpoint now refuses a
// duplicate manual export with 409 + the prior export's key/url, and only proceeds on an explicit
// { force: true }. Failed exports are NOT treated as prior exports (they produced nothing to
// duplicate), so Retry stays friction-free.
//
// Hermetic pattern mirrors server.connectors.test.ts: dedicated temp DB file + a real server
// subprocess, seeded via a raw createClient so the shared db module singleton is never touched.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-expguard-${ts}.db`)
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
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_connectors_project ON connectors(project_id)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_texports_feedback ON ticket_exports(feedback_id)`)

const ADMIN_EMAIL = `admin-${ts}@test.local`
const ADMIN_SID = `sess_admin_${ts}`
const ACCOUNT_ID = `acct_${ts}`
const PROJECT_ID = `proj_${ACCOUNT_ID}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "Test Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_${ACCOUNT_ID}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "Default Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_admin_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

// Two independent tickets so the guard tests don't interfere with each other.
const FID_DUP = `fb_dup_${ts}`      // already exported successfully → guard must fire
const FID_FAIL = `fb_fail_${ts}`    // only a FAILED prior export → guard must NOT fire
await rawExec(`INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [FID_DUP, PROJECT_ID, "Already exported bug", "high", "open", NOW])
await rawExec(`INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [FID_FAIL, PROJECT_ID, "Failed export bug", "high", "open", NOW])

// One connector, shared. Its webhook URL is unreachable, so any export that ACTUALLY runs comes
// back status:"failed" — which is exactly what we want: it proves the guard let the call through.
const CONNECTOR_ID = `conn_${ts}`
await rawExec(
  `INSERT INTO connectors (id, project_id, type, name, config, auto_copy, enabled, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [CONNECTOR_ID, PROJECT_ID, "webhook", "Acme Tracker",
   JSON.stringify({ url: "https://this-host-definitely-does-not-exist-12345.invalid/hook" }), 0, 1, NOW, ADMIN_EMAIL]
)

// Prior SUCCESSFUL export of FID_DUP to that connector (as if a human clicked "Copy to…" once).
await rawExec(
  `INSERT INTO ticket_exports (id, feedback_id, project_id, connector_id, type, external_key, external_url, status, error, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [`exp_ok_${ts}`, FID_DUP, PROJECT_ID, CONNECTOR_ID, "webhook", "ACME-42", "https://acme.example/browse/ACME-42", "ok", null, NOW, ADMIN_EMAIL]
)
// Prior FAILED export of FID_FAIL to the same connector.
await rawExec(
  `INSERT INTO ticket_exports (id, feedback_id, project_id, connector_id, type, external_key, external_url, status, error, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [`exp_bad_${ts}`, FID_FAIL, PROJECT_ID, CONNECTOR_ID, "webhook", null, null, "failed", "boom", NOW, ADMIN_EMAIL]
)

let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  const serverPort = 33000 + Math.floor(Math.random() * 1000)
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

async function api(method: string, path: string, body: any) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: `klav_session=${ADMIN_SID}` },
    body: body != null ? JSON.stringify(body) : undefined,
  })
}

async function exportRowCount(feedbackId: string) {
  const r = await rawClient.execute({ sql: "SELECT COUNT(*) AS n FROM ticket_exports WHERE feedback_id=?", args: [feedbackId] })
  return Number((r.rows[0] as any).n)
}

// ── The regression: a repeat manual export must NOT silently duplicate ────────

test("re-exporting an already-exported ticket is refused with 409 + the prior external key", async () => {
  const before = await exportRowCount(FID_DUP)
  const r = await api("POST", `/api/feedback/${FID_DUP}/export`, { connectorId: CONNECTOR_ID })
  expect(r.status).toBe(409)
  const body = await r.json()
  expect(body.alreadyExported).toBeTruthy()
  expect(body.alreadyExported.externalKey).toBe("ACME-42")
  expect(body.alreadyExported.externalUrl).toBe("https://acme.example/browse/ACME-42")
  expect(body.alreadyExported.connectorName).toBe("Acme Tracker")
  expect(String(body.error)).toContain("ACME-42")
  // Nothing ran: no new external issue, no new export row.
  expect(await exportRowCount(FID_DUP)).toBe(before)
})

test("force:true overrides the guard and proceeds (and still records the attempt)", async () => {
  const before = await exportRowCount(FID_DUP)
  const r = await api("POST", `/api/feedback/${FID_DUP}/export`, { connectorId: CONNECTOR_ID, force: true })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  // The connector URL is unreachable, so the export ran and failed — proof the guard let it through.
  expect(body.export.status).toBe("failed")
  expect(await exportRowCount(FID_DUP)).toBe(before + 1)
})

test("a prior FAILED export is not treated as already-exported — retry needs no force", async () => {
  const before = await exportRowCount(FID_FAIL)
  const r = await api("POST", `/api/feedback/${FID_FAIL}/export`, { connectorId: CONNECTOR_ID })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  expect(await exportRowCount(FID_FAIL)).toBe(before + 1)
})

test("a first-time export is unaffected by the guard (no extra friction)", async () => {
  const fresh = `fb_fresh_${ts}`
  await rawExec(`INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [fresh, PROJECT_ID, "Fresh bug", "high", "open", Date.now()])
  const r = await api("POST", `/api/feedback/${fresh}/export`, { connectorId: CONNECTOR_ID })
  expect(r.status).toBe(200)
  expect((await r.json()).ok).toBe(true)
})

// ── Dashboard payload must carry what the Retry button needs ─────────────────

test("GET /api/dashboard exports carry connectorId + status, and a success outranks a later failure", async () => {
  const r = await api("GET", `/api/dashboard?project=${PROJECT_ID}`, null)
  expect(r.status).toBe(200)
  const body = await r.json()
  const tickets = body.tickets || []

  // FID_DUP: exported ok, then a forced retry failed. The badge must still show the live issue.
  const dup = tickets.find((t: any) => t.id === FID_DUP)
  expect(dup).toBeTruthy()
  const dupExp = (dup.exports || []).find((e: any) => e.connectorId === CONNECTOR_ID)
  expect(dupExp).toBeTruthy()
  expect(dupExp.status).toBe("ok")
  expect(dupExp.externalKey).toBe("ACME-42")

  // FID_FAIL: only failures — surfaced (with connectorId) so the UI can render a Retry button.
  const failed = tickets.find((t: any) => t.id === FID_FAIL)
  expect(failed).toBeTruthy()
  const failExp = (failed.exports || []).find((e: any) => e.connectorId === CONNECTOR_ID)
  expect(failExp).toBeTruthy()
  expect(failExp.status).toBe("failed")
  expect(failExp.externalUrl).toBeNull()
})
