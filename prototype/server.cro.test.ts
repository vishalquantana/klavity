// CRO Sim endpoints — route serving + input validation (no LLM path). Subprocess-against-temp-DB
// pattern, mirrors server.widget-lead.test.ts. Every case here returns BEFORE the LLM call, so the
// tests are deterministic without a real OpenRouter key: analyze rejects missing/unreachable URLs at
// the fetch guard; unlock validates the email + reportId before touching anything.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-cro-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema so the server boots (same core tables as the widget-lead test).
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)

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
    } catch { /* not ready */ }
    await Bun.sleep(150)
  }
})

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
})

test("GET /cro serves the front-door page", async () => {
  const r = await fetch(`${BASE}/cro`)
  expect(r.status).toBe(200)
  const html = await r.text()
  expect(html).toContain("Send the Sim")
  expect(html).toContain("/api/cro/analyze")
})

test("GET /roast is an alias for the same page", async () => {
  const r = await fetch(`${BASE}/roast`)
  expect(r.status).toBe(200)
  expect(await r.text()).toContain("CRO Sim")
})

test("analyze rejects a missing URL", async () => {
  const r = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "" }),
  })
  expect(r.status).toBe(400)
})

test("analyze rejects an unreachable / loopback URL before the LLM", async () => {
  // SSRF guard rejects loopback → safeFetch throws → handler returns 400. Never reaches the model.
  const r = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ url: "http://127.0.0.1:1/" }),
  })
  expect(r.status).toBe(400)
})

test("unlock requires a reportId", async () => {
  const r = await fetch(`${BASE}/api/cro/unlock`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "buyer@co.com" }),
  })
  expect(r.status).toBe(400)
})

test("unlock rejects a bad email", async () => {
  const r = await fetch(`${BASE}/api/cro/unlock`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ reportId: "whatever", email: "nope" }),
  })
  expect(r.status).toBe(400)
})

test("unlock returns 410 for an unknown / expired reportId", async () => {
  const r = await fetch(`${BASE}/api/cro/unlock`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ reportId: "does-not-exist", email: "buyer@co.com" }),
  })
  expect(r.status).toBe(410)
})
