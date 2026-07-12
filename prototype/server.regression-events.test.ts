// server.regression-events.test.ts — B.6 unified Regression alarm READ/ACK route over real HTTP.
//
// Hermetic: real server subprocess + temp SQLite DB. Seeds two regression_events rows directly and
// asserts:
//   • GET  /api/projects/:id/regression-events           returns the unacknowledged feed (newest-first)
//   • GET  ...?all=1                                      includes acknowledged events
//   • POST /api/projects/:id/regression-events/:eid/ack   dismisses one, dropping it from the default feed
//   • cross-project + auth isolation
//
// Wiring of the three DETECTORS (memory / sim-reopen / guard) into publishRegressionEvent is proven
// hermetically in lib/regression-events.test.ts; this file locks the HTTP contract of the feed the
// dashboard banner consumes.

import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { unlinkSync } from "node:fs"

const RUN     = `${Date.now()}-${randomUUID()}`
const DB_FILE = join(tmpdir(), `klav-regevt-${RUN}.db`)
const SECRET  = Buffer.from(new Uint8Array(32).fill(88)).toString("base64")

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

const OWNER   = `owner-regevt-${RUN}@test.local`
const OUTSIDE = `outside-regevt-${RUN}@test.local`
const SID     = `sess_regevt_owner_${RUN}`
const SID_OUT = `sess_regevt_outside_${RUN}`
const ACCT    = `acct_regevt_${RUN}`
const PROJ    = `proj_regevt_${RUN}`
const PROJ2   = `proj_regevt_other_${RUN}`
const NOW     = Date.now()

const EVT_MEMORY = `reg_memory_${RUN}`
const EVT_GUARD  = `reg_guard_${RUN}`
const EVT_ACKED  = `reg_acked_${RUN}`
const EVT_OTHER  = `reg_other_${RUN}` // belongs to PROJ2

await exec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await exec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await exec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await exec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT NOT NULL, domain TEXT, created_at INTEGER NOT NULL)`)
await exec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await exec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', url_patterns_json TEXT, review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER DEFAULT 200, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await exec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL, invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await exec(`CREATE TABLE IF NOT EXISTS regression_events (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, issue_key TEXT NOT NULL, source TEXT NOT NULL,
  title TEXT NOT NULL, feedback_id TEXT, expectation_id TEXT, first_fixed_at INTEGER,
  evidence_json TEXT, created_at INTEGER NOT NULL, acknowledged_at INTEGER
)`)

await exec(`INSERT INTO users VALUES (?, ?, ?)`, [OWNER, "Owner", NOW])
await exec(`INSERT INTO users VALUES (?, ?, ?)`, [OUTSIDE, "Outside", NOW])
await exec(`INSERT INTO sessions VALUES (?, ?, ?, ?)`, [SID, OWNER, NOW, NOW + 86_400_000])
await exec(`INSERT INTO sessions VALUES (?, ?, ?, ?)`, [SID_OUT, OUTSIDE, NOW, NOW + 86_400_000])
await exec(`INSERT INTO accounts VALUES (?, ?, ?, ?, ?)`, [ACCT, "Regevt Acct", OWNER, null, NOW])
await exec(`INSERT INTO account_members VALUES (?, ?, ?, ?, ?)`, [`am_regevt_${RUN}`, ACCT, OWNER, "owner", NOW])
await exec(`INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJ, ACCT, "Regevt Project", "active", null, "auto", 200, "named", NOW, NOW])
await exec(`INSERT INTO projects VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJ2, ACCT, "Regevt Other", "active", null, "auto", 200, "named", NOW, NOW])
await exec(`INSERT INTO project_members VALUES (?, ?, ?, ?, ?, ?)`, [`pm_regevt_${RUN}`, PROJ, OWNER, "admin", null, NOW])
await exec(`INSERT INTO project_members VALUES (?, ?, ?, ?, ?, ?)`, [`pm_regevt2_${RUN}`, PROJ2, OWNER, "admin", null, NOW])

// Two live events on PROJ (guard newest), one already-acknowledged, one on PROJ2.
await exec(`INSERT INTO regression_events (id,project_id,issue_key,source,title,feedback_id,expectation_id,first_fixed_at,evidence_json,created_at,acknowledged_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [EVT_MEMORY, PROJ, "ik_signup", "memory", "signup broken again", "fb_signup", null, NOW - 30 * 86_400_000, JSON.stringify({ occurrences: 3 }), NOW - 3600_000, null])
await exec(`INSERT INTO regression_events (id,project_id,issue_key,source,title,feedback_id,expectation_id,first_fixed_at,evidence_json,created_at,acknowledged_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [EVT_GUARD, PROJ, "guard:trail_1", "guard", "checkout trail regression", "fb_checkout", "exp_checkout", NOW - 10 * 86_400_000, JSON.stringify({ runId: "run_1" }), NOW - 60_000, null])
await exec(`INSERT INTO regression_events (id,project_id,issue_key,source,title,feedback_id,expectation_id,first_fixed_at,evidence_json,created_at,acknowledged_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [EVT_ACKED, PROJ, "ik_old", "sim-reopen", "already dismissed", null, null, null, null, NOW - 2 * 3600_000, NOW - 3000_000])
await exec(`INSERT INTO regression_events (id,project_id,issue_key,source,title,feedback_id,expectation_id,first_fixed_at,evidence_json,created_at,acknowledged_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
  [EVT_OTHER, PROJ2, "ik_other", "memory", "other project issue", null, null, null, null, NOW - 30_000, null])

let srv: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  const port = 46900 + Math.floor(Math.random() * 600)
  BASE = `http://localhost:${port}`
  srv = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE, KLAV_DEV_SHOW_OTP: "1", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
    },
    stdout: "ignore", stderr: "ignore",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
})

afterAll(() => { srv?.kill(); raw.close(); rmDb() })

function get(path: string, sid = SID) { return fetch(`${BASE}${path}`, { headers: { cookie: `klav_session=${sid}` } }) }
function post(path: string, sid = SID) { return fetch(`${BASE}${path}`, { method: "POST", headers: { cookie: `klav_session=${sid}` } }) }

test("GET regression-events returns un-dismissed events newest-first with links", async () => {
  const r = await get(`/api/projects/${encodeURIComponent(PROJ)}/regression-events`)
  expect(r.status).toBe(200)
  const d = await r.json()
  const ids = d.events.map((e: any) => e.id)
  expect(ids).toContain(EVT_MEMORY)
  expect(ids).toContain(EVT_GUARD)
  expect(ids).not.toContain(EVT_ACKED)   // acknowledged → hidden by default
  expect(ids).not.toContain(EVT_OTHER)   // other project → not leaked
  // Newest-first: the guard event (60s ago) precedes the memory event (1h ago).
  expect(ids.indexOf(EVT_GUARD)).toBeLessThan(ids.indexOf(EVT_MEMORY))
  const guard = d.events.find((e: any) => e.id === EVT_GUARD)
  expect(guard.source).toBe("guard")
  expect(guard.feedbackId).toBe("fb_checkout")
  expect(guard.expectationId).toBe("exp_checkout")
})

test("GET regression-events?all=1 includes acknowledged events", async () => {
  const r = await get(`/api/projects/${encodeURIComponent(PROJ)}/regression-events?all=1`)
  const d = await r.json()
  const ids = d.events.map((e: any) => e.id)
  expect(ids).toContain(EVT_ACKED)
})

test("POST .../regression-events/:id/ack dismisses one and drops it from the default feed", async () => {
  const before = await (await get(`/api/projects/${encodeURIComponent(PROJ)}/regression-events`)).json()
  expect(before.events.map((e: any) => e.id)).toContain(EVT_MEMORY)

  const ack = await post(`/api/projects/${encodeURIComponent(PROJ)}/regression-events/${encodeURIComponent(EVT_MEMORY)}/ack`)
  expect(ack.status).toBe(200)
  expect((await ack.json()).ok).toBe(true)

  const after = await (await get(`/api/projects/${encodeURIComponent(PROJ)}/regression-events`)).json()
  expect(after.events.map((e: any) => e.id)).not.toContain(EVT_MEMORY)
})

test("ack of an unknown event id returns 404", async () => {
  const r = await post(`/api/projects/${encodeURIComponent(PROJ)}/regression-events/reg_does_not_exist/ack`)
  expect(r.status).toBe(404)
})

test("regression-events is access-controlled — outsider gets 403", async () => {
  const r = await get(`/api/projects/${encodeURIComponent(PROJ)}/regression-events`, SID_OUT)
  expect(r.status).toBe(403)
})
