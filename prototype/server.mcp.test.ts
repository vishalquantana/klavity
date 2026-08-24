// KLA-550 — /mcp Streamable-HTTP JSON-RPC integration tests via the subprocess-server harness.
// Bootstrap copied inline from server.v1-authored.test.ts (spawn real server, seed a project, mint a
// kci_ token via POST /api/ci/token). Auth mirrors /api/v1/runs (kci_ bearer).
//
// NON-HANGING NOTE: these tests assert the JSON-RPC SHAPE only — initialize / tools.list / a
// cross-project tools/call that is rejected by requireProject BEFORE any I/O. No test calls a tool
// that actually starts a walk/author drive, so nothing launches a real browser/LLM. The server is
// spawned WITHOUT OPENROUTER_API_KEY as a belt-and-braces guard.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-mcp-srv-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// ── Schema (only the tables this suite touches; the booting server adds the rest via applySchema). ──
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT, created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0)`)
await rawExec(`CREATE INDEX IF NOT EXISTS ext_tok_email_idx ON extension_tokens (email)`)

// ── Fixtures ──
const ADMIN_EMAIL = `admin-mcp-${ts}@test.local`
const ADMIN_SID = `sess_admin_mcp_${ts}`
const ACCOUNT_ID = `acct_mcp_${ts}`
const PROJECT_ID = `proj_mcp_${ACCOUNT_ID}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "MCP Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_mcp_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "MCP Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_mcp_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

// ── Spawn the server ──
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  // 47xxx band — distinct from server.v1-runs (44xxx) and server.v1-authored (46xxx).
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
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      // OPENROUTER_API_KEY intentionally ABSENT — no test triggers a drive, but belt-and-braces.
      OPENROUTER_API_KEY: undefined as any,
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

afterAll(() => { serverProc?.kill(); rawClient.close() })

const cookie = (sid: string) => `klav_session=${sid}`

// Mint a kci_ token for ADMIN/PROJECT_ID via the existing CI endpoint (v1/MCP reuse these tokens).
let CI_TOKEN: string
beforeAll(async () => {
  const r = await fetch(`${BASE}/api/ci/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie(ADMIN_SID) },
    body: JSON.stringify({ project: PROJECT_ID }),
  })
  const b = await r.json() as any
  CI_TOKEN = b.token
})

const rpc = (bodyObj: any, tok = CI_TOKEN) => fetch(BASE + "/mcp", {
  method: "POST",
  headers: { authorization: `Bearer ${tok}`, "content-type": "application/json" },
  body: JSON.stringify(bodyObj),
})

test("unauthenticated /mcp → 401", async () => {
  const r = await fetch(BASE + "/mcp", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })
  expect(r.status).toBe(401)
})

test("initialize handshake over HTTP", async () => {
  const r = await rpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} })
  expect(r.status).toBe(200)
  const j = await r.json() as any
  expect(j.result.protocolVersion).toBe("2025-06-18")
})

test("tools/list over HTTP", async () => {
  const r = await rpc({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} })
  const j = await r.json() as any
  expect(j.result.tools.map((t: any) => t.name)).toContain("start_authored_run")
})

test("tools/call get_qa_run with cross-project arg is reported isError, not 500", async () => {
  const r = await rpc({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_qa_run", arguments: { project_id: "proj_other", run_id: "x" } } })
  expect(r.status).toBe(200)
  const j = await r.json() as any
  expect(j.result.isError).toBe(true)
})
