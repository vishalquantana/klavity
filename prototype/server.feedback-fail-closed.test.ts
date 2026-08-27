// KLA-730 (P1 negative control): POST /api/feedback must FAIL CLOSED when the PRIMARY feedback-row
// insert itself fails (DB constraint / RAISE(ABORT) trigger / read-only or full DB / insertFeedback
// rejection). Before the fix the persist exception was swallowed as "non-fatal" and the handler still
// returned HTTP 200 {id:"", saved:true} — the composer told the user the report was saved while NO row
// was written (silent report loss, violates the persist-first guarantee).
//
// Harness mirrors server.feedback-anon.test.ts: raw-seed a temp SQLite DB, spawn the real server, hit it
// over HTTP. We install a BEFORE INSERT ON feedback trigger scoped to a dedicated project ('pfail') that
// RAISE(ABORT)s — so inserts into 'pfail' always throw while inserts into 'p1' (happy path) succeed. This
// lets both the fail-closed path and the preserved success path run against the SAME server + DB.
//
// NEG-CONTROL proof: against the pre-fix code the "must return non-2xx" assertion FAILS (it returns 200
// saved:true). Against the fix it PASSES (500 saved:false, no row written). The happy-path test guards
// that the normal success shape (200 + real id) is unchanged.

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __net from "node:net"
function __freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-ffc-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema — only the tables the /api/feedback handler touches.
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, widget_report_gate TEXT NOT NULL DEFAULT 'anonymous', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, contact_email TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS ticket_exports (id TEXT PRIMARY KEY, feedback_id TEXT NOT NULL, project_id TEXT NOT NULL, connector_id TEXT NOT NULL, type TEXT NOT NULL, external_key TEXT, external_url TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)

// ── The negative-control lever: make the PRIMARY feedback insert throw for project 'pfail' only ──
// A BEFORE INSERT trigger that RAISE(ABORT)s reproduces the real failure surface named in KLA-730 (DB
// constraint / read-only / full-disk → insertFeedback rejects). Scoped by project_id so 'p1' still works.
await rawExec(`CREATE TRIGGER IF NOT EXISTS feedback_force_fail
  BEFORE INSERT ON feedback
  WHEN NEW.project_id = 'pfail'
  BEGIN
    SELECT RAISE(ABORT, 'KLA-730 forced feedback insert failure');
  END`)

const now = Date.now()
await rawExec(`INSERT INTO accounts (id, name, owner_email, domain, plan, created_at) VALUES ('a1', 'Test Account', 'owner@test.local', 'test.local', 'free', ?)`, [now])
// p1 = normal project (happy path). pfail = every insert aborts (fail-closed path). Both anonymous-gated.
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, observability_mode, modal_config_json, widget_mode, widget_report_gate, created_at, updated_at) VALUES ('p1', 'a1', 'Good Project', 'active', 'auto', 'named', '{}', 'leadgen', 'anonymous', ?, ?)`, [now, now])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, observability_mode, modal_config_json, widget_mode, widget_report_gate, created_at, updated_at) VALUES ('pfail', 'a1', 'Failing Project', 'active', 'auto', 'named', '{}', 'leadgen', 'anonymous', ?, ?)`, [now, now])

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = await __freePort()
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

// ── NEGATIVE CONTROL: primary insert fails → must NOT report success ──────────────────────────────
// This is the assertion that FAILS against the pre-fix code (which returns 200 {saved:true, id:""}).
test("KLA-730 neg-control: a failed primary feedback insert returns a non-2xx and does NOT report saved:true", async () => {
  const before = await rawClient.execute({ sql: "SELECT COUNT(*) c FROM feedback WHERE project_id=?", args: ["pfail"] })
  const fd = new FormData()
  fd.set("description", "this report can never be persisted (trigger aborts)")
  fd.set("project_id", "pfail")
  fd.set("page_url", "https://customer.example/broken")
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { origin: "https://customer.example" } })

  // FAIL CLOSED: the composer treats any 2xx as success, so a failed persist MUST surface as non-2xx.
  expect(r.ok).toBe(false)
  expect(r.status).toBeGreaterThanOrEqual(500)

  const j = await r.json().catch(() => ({}))
  expect(j.saved).not.toBe(true)   // never claim saved when no row was written
  expect(j.id).toBeFalsy()         // never hand back a (truthy) id for a non-existent row

  // And prove the persist-first guarantee: no row landed for the aborted project.
  const after = await rawClient.execute({ sql: "SELECT COUNT(*) c FROM feedback WHERE project_id=?", args: ["pfail"] })
  expect(Number(after.rows[0].c)).toBe(Number(before.rows[0].c))
})

// ── PATH A neg-control: a NON-throwing skip (unresolved project) must also fail closed ────────────
// An anonymous submit with NO Origin/auth and an unknown project_id never resolves a project, so the
// whole persist body is skipped WITHOUT any exception (the catch never runs). Before the success-exit
// guard this hit the success return and answered 200 {id:"", saved:true} with ZERO rows written. It must
// now fail closed. This assertion FAILS against pre-fix code (200 saved:true).
test("KLA-730 PATH A neg-control: anon submit to an unknown project (no Origin) fails closed with 0 rows", async () => {
  const before = await rawClient.execute({ sql: "SELECT COUNT(*) c FROM feedback" })
  const fd = new FormData()
  fd.set("description", "report for a project that does not exist")
  fd.set("project_id", "ghost-project-does-not-exist")
  // NO origin header, no auth → actor/firstParty/anonWidgetAllowed all falsy → resolved stays null.
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd })
  expect(r.ok).toBe(false)
  expect(r.status).toBeGreaterThanOrEqual(500)
  const j = await r.json().catch(() => ({}))
  expect(j.saved).not.toBe(true)
  expect(j.id).toBeFalsy()
  // Nothing persisted anywhere.
  const after = await rawClient.execute({ sql: "SELECT COUNT(*) c FROM feedback" })
  expect(Number(after.rows[0].c)).toBe(Number(before.rows[0].c))
})

// ── Preserve the success path: a normal insert still returns 200 with a real id + a persisted row ──
test("KLA-730: the normal success path is unchanged — 200 with a real id and a persisted row", async () => {
  const fd = new FormData()
  fd.set("description", "[bug] the Save button spins forever")
  fd.set("project_id", "p1")
  fd.set("page_url", "https://customer.example/settings")
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { origin: "https://customer.example" } })
  expect(r.status).toBe(200)
  const j = await r.json()
  expect(j.saved).toBe(true)
  expect(j.id).toBeTruthy()
  const row = await rawClient.execute({ sql: "SELECT project_id FROM feedback WHERE id=?", args: [j.id] })
  expect(row.rows[0]?.project_id).toBe("p1")
})
