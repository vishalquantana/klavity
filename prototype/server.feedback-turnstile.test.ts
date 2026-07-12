// JTBD 1.7 — server-level Turnstile enforcement on the anonymous /api/feedback path.
// Spawns the real server WITH TURNSTILE_SECRET_KEY set. The "missing token → 403" path fails closed
// WITHOUT any Cloudflare network call, so this stays fully hermetic (no real siteverify hit).
// Mirrors the subprocess-against-temp-DB pattern of server.feedback-anon.test.ts.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-fturnstile-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, widget_report_gate TEXT NOT NULL DEFAULT 'anonymous', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, contact_email TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS connectors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, type TEXT NOT NULL, name TEXT NOT NULL, config TEXT NOT NULL DEFAULT '{}', auto_copy INTEGER NOT NULL DEFAULT 0, enabled INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, created_by TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sim_traits (id TEXT PRIMARY KEY, sim_id TEXT NOT NULL, project_id TEXT NOT NULL, kind TEXT NOT NULL, text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', strength INTEGER NOT NULL DEFAULT 1, src_transcript_id TEXT NOT NULL, src_quote TEXT NOT NULL, src_quote_offset INTEGER, src_speaker TEXT, area TEXT, issue_type TEXT, severity TEXT, priority TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)

const now = Date.now()
await rawExec(`INSERT INTO accounts (id, name, owner_email, domain, plan, created_at) VALUES ('a1', 'Test Account', 'owner@test.local', 'test.local', 'free', ?)`, [now])
// Default-anonymous project → Turnstile enforcement applies to its anonymous submits.
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, observability_mode, modal_config_json, widget_mode, widget_cta_url, widget_notify_email, widget_report_gate, created_at, updated_at) VALUES ('p1', 'a1', 'Anon Project', 'active', 'auto', 'named', '{}', 'support', 'https://klavity.in/onboarding', NULL, 'anonymous', ?, ?)`, [now, now])
// Explicit email-gated project → carries its own identity, so Turnstile is NOT required there.
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, observability_mode, modal_config_json, widget_mode, widget_cta_url, widget_notify_email, widget_report_gate, created_at, updated_at) VALUES ('p2', 'a1', 'Email Project', 'active', 'auto', 'named', '{}', 'support', 'https://klavity.in/onboarding', NULL, 'email', ?, ?)`, [now, now])

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  serverPort = 35000 + Math.floor(Math.random() * 1000)
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
      // Turnstile ENABLED for this server. The "no token" path fails closed with NO Cloudflare call.
      TURNSTILE_SECRET_KEY: "sk_test_hermetic",
      TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch {}
    await Bun.sleep(150)
  }
})

afterAll(() => { serverProc?.kill(); rawClient.close() })

// ── anonymous submit with Turnstile ENABLED but NO token → 403 (fails closed, no network) ──
test("Turnstile enabled: anonymous cross-origin submit WITHOUT a token is rejected (403)", async () => {
  const before = await rawClient.execute({ sql: "SELECT COUNT(*) c FROM feedback WHERE project_id='p1'" })
  const fd = new FormData()
  fd.set("description", "no turnstile token"); fd.set("project_id", "p1")
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { origin: "https://customer.example" } })
  expect(r.status).toBe(403)
  const after = await rawClient.execute({ sql: "SELECT COUNT(*) c FROM feedback WHERE project_id='p1'" })
  expect(Number(after.rows[0].c)).toBe(Number(before.rows[0].c)) // nothing persisted
})

// ── the config GET exposes the public site key so the widget knows to render a challenge ──
test("config GET exposes the public turnstileSiteKey", async () => {
  const r = await fetch(`${BASE}/api/projects/p1/config`, { headers: { origin: "https://customer.example" } })
  expect(r.status).toBe(200)
  const j = await r.json()
  expect(j.turnstileSiteKey).toBe("1x00000000000000000000AA")
  expect(j.widget.reportGate).toBe("anonymous")
})

// ── explicit email gate: Turnstile is NOT required (identity already demanded) — no-email still 400 ──
// Proves Turnstile only guards the anonymous path; the email gate keeps its own (unchanged) behavior.
test("email-gated project: no token needed; a no-email submit still fails on the email gate (400)", async () => {
  const fd = new FormData()
  fd.set("description", "email-gated, no token"); fd.set("project_id", "p2")
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { origin: "https://customer.example" } })
  expect(r.status).toBe(400) // rejected by the email gate, NOT the Turnstile check
})

// ── first-party anonymous (our own origin) is NOT the gated cross-origin path → Turnstile not applied ──
test("first-party anonymous submit still succeeds (Turnstile only guards cross-origin anonymous)", async () => {
  const fd = new FormData()
  fd.set("description", "first-party anon"); fd.set("project_id", "p1")
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { origin: BASE } })
  expect(r.status).toBe(200)
  const j = await r.json(); expect(j.saved).toBe(true)
})
