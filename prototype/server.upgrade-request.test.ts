// KLA-612: POST /api/upgrade-request — a guest/anon reporter who hits a cap requests an upgrade; the server
// validates + rate-limits + dispatches an attributed admin nudge (best-effort), and NEVER 500s. Subprocess-
// against-temp-DB pattern (mirrors server.widget-lead.test.ts): raw-seed a temp SQLite DB, spawn the real
// server, hit it over HTTP. No SENDGRID/Slack configured → the fire-and-forget dispatch no-ops but the
// endpoint still returns 200 (the request is best-effort by contract).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-upreq-${ts}.db`)
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
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)

const now = Date.now()
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES ('a1', 'Test Account', 'owner@test.com', 'free', ?)`, [now])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES ('m1','a1','owner@test.com','owner',?)`, [now])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES ('p1', 'a1', 'Test Project', 'active', 'auto', 'named', '{}', 'leadgen', ?, ?)`, [now, now])

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
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch { /* not ready */ }
    await Bun.sleep(150)
  }
})

afterAll(() => { serverProc?.kill(); rawClient.close() })

test("a valid guest upgrade request returns { ok: true } and never 500s (best-effort dispatch)", async () => {
  const r = await fetch(`${BASE}/api/upgrade-request`, {
    method: "POST", headers: { "content-type": "application/json", origin: "https://customer.example" },
    body: JSON.stringify({ projectId: "p1", reason: "storage_over_cap", context: { page: "https://customer.example/x", fileMeta: { name: "big.mp4", sizeMb: 150 } } }),
  })
  expect(r.status).toBe(200)
  expect((await r.json()).ok).toBe(true)
  // Cross-origin: the widget runs on the customer's site → CORS must reflect the origin.
  expect(r.headers.get("access-control-allow-origin")).toBe("https://customer.example")
})

test("unknown project → 404 (no leak, no dispatch)", async () => {
  const r = await fetch(`${BASE}/api/upgrade-request`, {
    method: "POST", headers: { "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ projectId: "nope", reason: "storage_over_cap" }),
  })
  expect(r.status).toBe(404)
})

test("missing projectId → 400", async () => {
  const r = await fetch(`${BASE}/api/upgrade-request`, {
    method: "POST", headers: { "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ reason: "storage_over_cap" }),
  })
  expect(r.status).toBe(400)
})

test("rate-limited per (workspace, IP): the 4th request in the window is 429", async () => {
  // Same project + same source IP (loopback). Cap is 3/hour.
  const post = () => fetch(`${BASE}/api/upgrade-request`, {
    method: "POST", headers: { "content-type": "application/json", origin: BASE },
    body: JSON.stringify({ projectId: "p1", reason: "credit_wall" }),
  })
  const statuses: number[] = []
  for (let i = 0; i < 4; i++) statuses.push((await post()).status)
  // At least one 429 appears once the 3/hour cap is exhausted (earlier oks may be consumed by prior tests).
  expect(statuses).toContain(429)
})
