// KLAVITYKLA-440 — server-side ingest capture of client IP + page URL over HTTP.
// Asserts that POST /api/feedback ALWAYS records, server-side:
//   • report_ip  — derived via the trusted-proxy X-Forwarded-For helper (loopback peer → XFF trusted),
//     with a safe fallback to the socket peer when no XFF header is present (never null/"unknown").
//   • report_url — the top-level page the report was filed from (page_url payload or Referer header),
//     with query + fragment stripped (privacy by structure).
// Subprocess-against-temp-DB pattern, mirrors server.feedback-replay.test.ts. The server's initDb →
// applySchema ALTERs the report_ip / report_url / report_geo_json columns onto the minimal feedback
// table on boot, so the raw fixture schema below does not need them.

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __netKLA719 from "node:net"
// KLA-719: OS-assigned free port (replaces a crowded random base that let co-scheduled
// server suites collide and answer each other's requests → spurious 401/404/no-such-table).
function __freePortKLA719(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __netKLA719.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-urlip-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema — the tables the /api/feedback + dashboard paths touch. report_ip/report_url/
// report_geo_json are ADDED by the server's applySchema migration on boot (see file header).
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS login_otps (email TEXT NOT NULL, code TEXT NOT NULL, expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0)`)
await rawExec(`CREATE TABLE IF NOT EXISTS memberships (id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(workspace_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS workspaces (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, contact_email TEXT, recurrence_count INTEGER NOT NULL DEFAULT 1, recurrence_dates_json TEXT, last_seen_at INTEGER, issue_key TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)

const now = Date.now()
await rawExec(`INSERT INTO accounts (id, name, owner_email, domain, plan, created_at) VALUES ('a1','Acct','owner@test.local','test.local','free',?)`, [now])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES ('am1','a1','owner@test.local','admin',?)`, [now])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES ('p1','a1','Proj','active','auto','named','{}','support',?,?)`, [now, now])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, created_at) VALUES ('pm1','p1','owner@test.local','admin',?)`, [now])
await rawExec(`INSERT INTO users (email, name, created_at) VALUES ('owner@test.local','Owner',?)`, [now])

let serverPort: number, serverProc: ReturnType<typeof Bun.spawn>, BASE: string, sessionCookie = ""

beforeAll(async () => {
  serverPort = await __freePortKLA719()
  BASE = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: { ...process.env, PORT: String(serverPort), TURSO_DATABASE_URL: "file:" + srvDbFile, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local", KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", OPENROUTER_API_KEY: "test-key" },
    stdout: "pipe", stderr: "pipe",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch {}
    await Bun.sleep(150)
  }
  const reqRes = await fetch(`${BASE}/api/auth/request`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "owner@test.local" }) })
  const reqJson = await reqRes.json()
  const code = String(reqJson.devCode || "")
  const ver = await fetch(`${BASE}/api/auth/verify`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "owner@test.local", code }) })
  sessionCookie = (ver.headers.get("set-cookie") || "").split(";")[0]
})

afterAll(() => { serverProc?.kill(); rawClient.close() })

test("login produced a session cookie", () => { expect(sessionCookie).toContain("klav_session=") })

test("XFF header → report_ip is the first hop; report_url captured (query/fragment stripped)", async () => {
  const fd = new FormData()
  fd.set("description", "checkout is broken"); fd.set("page_url", "https://shop.test.local/cart?token=secret#frag"); fd.set("project_id", "p1")
  // Loopback socket peer is a trusted reverse proxy, so the server trusts the first X-Forwarded-For hop.
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { cookie: sessionCookie, "x-forwarded-for": "203.0.113.9, 10.0.0.1" } })
  expect(r.status).toBe(200)
  const j = await r.json(); expect(j.saved).toBe(true); expect(j.id).toBeTruthy()

  const row = await rawClient.execute({ sql: "SELECT report_ip, report_url FROM feedback WHERE id=?", args: [j.id] })
  expect(row.rows.length).toBe(1)
  expect(String(row.rows[0].report_ip)).toBe("203.0.113.9")           // first XFF hop, server-derived
  expect(String(row.rows[0].report_url)).toBe("https://shop.test.local/cart") // query+fragment stripped
})

test("missing XFF → report_ip falls back safely to the socket peer (never null/unknown)", async () => {
  const fd = new FormData()
  fd.set("description", "no xff bug"); fd.set("page_url", "https://shop.test.local/checkout"); fd.set("project_id", "p1")
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { cookie: sessionCookie } })
  expect(r.status).toBe(200)
  const j = await r.json(); expect(j.saved).toBe(true)

  const row = await rawClient.execute({ sql: "SELECT report_ip, report_url FROM feedback WHERE id=?", args: [j.id] })
  const ip = row.rows[0].report_ip
  expect(ip).not.toBeNull()
  expect(String(ip)).not.toBe("unknown")
  expect(String(ip)).not.toBe("203.0.113.9")     // no XFF supplied → must NOT reuse the earlier header value
  expect(/(^127\.|^::1$|^::ffff:127\.)/.test(String(ip))).toBe(true) // loopback socket peer
  expect(String(row.rows[0].report_url)).toBe("https://shop.test.local/checkout")
})

test("no page_url → report_url falls back to the Referer header", async () => {
  const fd = new FormData()
  fd.set("description", "referer fallback bug"); fd.set("project_id", "p1")
  const r = await fetch(`${BASE}/api/feedback`, { method: "POST", body: fd, headers: { cookie: sessionCookie, referer: "https://shop.test.local/pricing?utm=x" } })
  expect(r.status).toBe(200)
  const j = await r.json(); expect(j.saved).toBe(true)

  const row = await rawClient.execute({ sql: "SELECT report_url FROM feedback WHERE id=?", args: [j.id] })
  expect(String(row.rows[0].report_url)).toBe("https://shop.test.local/pricing") // Referer, query stripped
})
