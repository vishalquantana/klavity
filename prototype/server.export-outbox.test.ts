// KLA-577: the admin-gated export-outbox surface + resume-on-re-enable wiring.
// Spins a real server subprocess against a fresh temp DB and hits it over HTTP.
// Mirrors the hermetic pattern in server.connectors.test.ts — fresh file DB, unique ids, raw seeding
// (never touches the shared db module singleton).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-outbox-srv-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema (mirrors applySchema for the tables we touch). The server also runs applySchema on
// boot with CREATE TABLE IF NOT EXISTS, so these are just to let us pre-seed rows.
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS export_outbox (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0, last_error TEXT, next_attempt_at INTEGER NOT NULL, created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)

const ADMIN_EMAIL = `admin-${ts}@test.local`
const MEMBER_EMAIL = `member-${ts}@test.local`
const ADMIN_SID = `sess_admin_${ts}`
const MEMBER_SID = `sess_member_${ts}`
const ACCOUNT_ID = `acct_${ts}`
const PROJECT_ID = `proj_${ACCOUNT_ID}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "Test Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_${ACCOUNT_ID}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "Default Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_admin_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [MEMBER_EMAIL, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_member_${ts}`, PROJECT_ID, MEMBER_EMAIL, "member", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [MEMBER_SID, MEMBER_EMAIL, NOW, NOW + 86400_000])

// A DISABLED connector with a PAUSED outbox row (as the sweep would leave it while disabled).
const DISABLED_CID = `conn_disabled_${ts}`
await rawExec(`INSERT INTO connectors (id, project_id, type, name, config, auto_copy, enabled, created_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [DISABLED_CID, PROJECT_ID, "jira", "Jira (disabled)", JSON.stringify({ host: "https://x", project_key: "P" }), 0, 0, NOW, ADMIN_EMAIL])
const PAUSED_ROW = `outbox_paused_${ts}`
await rawExec(`INSERT INTO export_outbox (id, feedback_id, project_id, connector_id, type, status, attempts, last_error, next_attempt_at, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
  [PAUSED_ROW, `fb_paused_${ts}`, PROJECT_ID, DISABLED_CID, "jira", "paused", 0, "connector disabled", NOW, ADMIN_EMAIL, NOW, NOW])
// A separate 'dead' row on a different connector, to confirm the outbox surfaces all non-done rows.
const DEAD_ROW = `outbox_dead_${ts}`
await rawExec(`INSERT INTO export_outbox (id, feedback_id, project_id, connector_id, type, status, attempts, last_error, next_attempt_at, created_by, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
  [DEAD_ROW, `fb_dead_${ts}`, PROJECT_ID, `conn_gone_${ts}`, "github", "dead", 6, "gave up", NOW, ADMIN_EMAIL, NOW, NOW])

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
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
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

// (c) — the new endpoint is admin-gated and surfaces every non-done row.
test("GET /export-outbox returns the queue for an admin", async () => {
  const r = await api("GET", `/api/projects/${PROJECT_ID}/export-outbox`, null, ADMIN_SID)
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(Array.isArray(body.outbox)).toBe(true)
  const ids = body.outbox.map((x: any) => x.id)
  expect(ids).toContain(PAUSED_ROW)
  expect(ids).toContain(DEAD_ROW)
  expect(body.counts.paused).toBe(1)
  expect(body.counts.dead).toBe(1)
})

test("GET /export-outbox is 403 for a non-admin member", async () => {
  const r = await api("GET", `/api/projects/${PROJECT_ID}/export-outbox`, null, MEMBER_SID)
  expect(r.status).toBe(403)
})

// (b) — re-enabling the disabled connector re-arms its paused rows (they become retryable again).
test("PATCH connector enabled=true resumes its paused outbox rows", async () => {
  const r = await api("PATCH", `/api/projects/${PROJECT_ID}/connectors/${DISABLED_CID}`, { enabled: true }, ADMIN_SID)
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  expect(body.resumedExports).toBe(1)

  // The paused row is now pending again (retryable), still visible on the outbox surface.
  const list = await api("GET", `/api/projects/${PROJECT_ID}/export-outbox`, null, ADMIN_SID)
  const lb = await list.json()
  const row = lb.outbox.find((x: any) => x.id === PAUSED_ROW)
  expect(row?.status).toBe("pending")
})
