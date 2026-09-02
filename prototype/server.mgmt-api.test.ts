// Account-scoped MANAGEMENT API tests via the subprocess-server harness (modeled on
// server.v1-tickets.test.ts). Covers: minting a kma_ token (session endpoint), list/create projects
// scoped to the token's account, a cross-account project id → 404 (IDOR), invite member, GET members,
// and auth: kci_ rejected on mgmt routes (401), a revoked-owner token → 403, non-admin role → 403 on
// create. Plus the mcp-admin JSON-RPC endpoint (create_project / list_projects / IDOR get_project).

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __net from "node:net"
import { createHash } from "node:crypto"
function __freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}
function sha256hex(s: string) { return createHash("sha256").update(s).digest("hex") }

import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-mgmtapi-srv-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(88)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT, account_id TEXT, created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0, id TEXT, name TEXT, token_prefix TEXT, kind TEXT, last_used_at INTEGER)`)

const NOW = Date.now()

// ── Account A (owner OWNER_A has a session; MEMBER_A is a plain account member) ──
const ACCOUNT_A = `acct_mgmt_a_${ts}`
const OWNER_A = `owner-a-${ts}@test.local`
const OWNER_A_SID = `sess_owner_a_${ts}`
const MEMBER_A = `member-a-${ts}@test.local`
const REVOKED_OWNER = `revoked-owner-${ts}@test.local`
const PROJECT_A = `proj_mgmt_a_${ts}`

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OWNER_A, NOW])
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [MEMBER_A, NOW])
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [REVOKED_OWNER, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_A, "Workspace A", OWNER_A, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_a_owner_${ts}`, ACCOUNT_A, OWNER_A, "owner", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_a_member_${ts}`, ACCOUNT_A, MEMBER_A, "member", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_a_revoked_${ts}`, ACCOUNT_A, REVOKED_OWNER, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_A, ACCOUNT_A, "Alpha", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_a_${ts}`, PROJECT_A, OWNER_A, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [OWNER_A_SID, OWNER_A, NOW, NOW + 86400_000])

// ── Account B (IDOR target — OWNER_A is NOT a member) ──
const ACCOUNT_B = `acct_mgmt_b_${ts}`
const OWNER_B = `owner-b-${ts}@test.local`
const PROJECT_B = `proj_mgmt_b_${ts}`
await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [OWNER_B, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_B, "Workspace B", OWNER_B, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_b_${ts}`, ACCOUNT_B, OWNER_B, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_B, ACCOUNT_B, "Bravo", "active", "auto", 200, "named", NOW, NOW])

// ── Directly-inserted kma_ tokens (hashed, like the server stores them) ──
// A member-role token (mint endpoint would 403; we insert to exercise the create 403 path), and a
// token whose owner we later remove from the account (revoked-owner → 403 via the live accountRole check).
const KMA_MEMBER = "kma_" + "m".repeat(48) + ts.replace(/[^a-z0-9]/g, "")
const KMA_REVOKED = "kma_" + "r".repeat(48) + ts.replace(/[^a-z0-9]/g, "")
await rawExec(`INSERT INTO extension_tokens (token, email, project_id, account_id, created_at, expires_at, revoked, id, name, token_prefix, kind) VALUES (?,?,?,?,?,?,0,?,?,?,?)`,
  [sha256hex(KMA_MEMBER), MEMBER_A, null, ACCOUNT_A, NOW, null, `kmt_member_${ts}`, "member tok", KMA_MEMBER.slice(0, 10), "kma"])
await rawExec(`INSERT INTO extension_tokens (token, email, project_id, account_id, created_at, expires_at, revoked, id, name, token_prefix, kind) VALUES (?,?,?,?,?,?,0,?,?,?,?)`,
  [sha256hex(KMA_REVOKED), REVOKED_OWNER, null, ACCOUNT_A, NOW, null, `kmt_revoked_${ts}`, "revoked tok", KMA_REVOKED.slice(0, 10), "kma"])

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
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
    await Bun.sleep(150)
  }
})

afterAll(() => { serverProc?.kill(); rawClient.close() })

function cookie(sid: string) { return `klav_session=${sid}` }
function bearer(tok: string) { return `Bearer ${tok}` }

// ── Mint a kma_ token via the session endpoint (owner/admin gated) ──
let KMA_TOKEN: string
test("POST /api/account/management-tokens — owner mints a kma_ token (copy-once)", async () => {
  const r = await fetch(`${BASE}/api/account/management-tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie(OWNER_A_SID) },
    body: JSON.stringify({ name: "provisioning bot" }),
  })
  expect(r.status).toBe(201)
  const b = await r.json() as any
  expect(typeof b.token).toBe("string")
  expect(b.token.startsWith("kma_")).toBe(true)
  expect(b.prefix.startsWith("kma_")).toBe(true)
  KMA_TOKEN = b.token
})

test("GET /api/account/management-tokens — lists metadata only (no token/hash)", async () => {
  const r = await fetch(`${BASE}/api/account/management-tokens`, { headers: { Cookie: cookie(OWNER_A_SID) } })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(Array.isArray(b.tokens)).toBe(true)
  expect(b.tokens.length).toBeGreaterThanOrEqual(1)
  for (const t of b.tokens) { expect(t.token).toBeUndefined() }
})

// ── Auth ──
test("GET /api/v1/projects — 401 without a bearer token", async () => {
  const r = await fetch(`${BASE}/api/v1/projects`)
  expect(r.status).toBe(401)
  const b = await r.json() as any
  expect(b.error.code).toBe("unauthorized")
})

test("GET /api/v1/projects — 401 when a kci_ project token is used (wrong token type)", async () => {
  // Mint a project-scoped kci_ token for OWNER_A/PROJECT_A, then try it on a management route.
  const ci = await fetch(`${BASE}/api/ci/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie(OWNER_A_SID) },
    body: JSON.stringify({ project: PROJECT_A }),
  })
  const cib = await ci.json() as any
  const r = await fetch(`${BASE}/api/v1/projects`, { headers: { Authorization: bearer(cib.token) } })
  expect(r.status).toBe(401)
})

// ── Projects: list / create / detail / IDOR ──
test("GET /api/v1/projects — lists only the token account's projects", async () => {
  const r = await fetch(`${BASE}/api/v1/projects`, { headers: { Authorization: bearer(KMA_TOKEN) } })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  const ids = b.projects.map((p: any) => p.id)
  expect(ids).toContain(PROJECT_A)
  expect(ids).not.toContain(PROJECT_B)
})

let CREATED_PID: string
test("POST /api/v1/projects — create returns 201 and appears in list", async () => {
  const r = await fetch(`${BASE}/api/v1/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(KMA_TOKEN) },
    body: JSON.stringify({ name: "Created via API", site_url: "https://example.com" }),
  })
  expect(r.status).toBe(201)
  const b = await r.json() as any
  expect(typeof b.project.id).toBe("string")
  CREATED_PID = b.project.id
  const list = await (await fetch(`${BASE}/api/v1/projects`, { headers: { Authorization: bearer(KMA_TOKEN) } })).json() as any
  expect(list.projects.map((p: any) => p.id)).toContain(CREATED_PID)
})

test("POST /api/v1/projects — 400 on a missing name", async () => {
  const r = await fetch(`${BASE}/api/v1/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(KMA_TOKEN) },
    body: JSON.stringify({ site_url: "https://example.com" }),
  })
  expect(r.status).toBe(400)
})

// QA C3-1: a JSON `null` body must return a structured 400, not an unhandled 500.
test("POST /api/v1/projects — 400 on a null JSON body", async () => {
  const r = await fetch(`${BASE}/api/v1/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(KMA_TOKEN) },
    body: "null",
  })
  expect(r.status).toBe(400)
})

// QA C3-2: a malformed email must be rejected (was: any string with '@' accepted).
test("POST /api/v1/projects/:id/members — 400 on a malformed email", async () => {
  const r = await fetch(`${BASE}/api/v1/projects/${encodeURIComponent(PROJECT_A)}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(KMA_TOKEN) },
    body: JSON.stringify({ email: "a@", role: "member" }),
  })
  expect(r.status).toBe(400)
})

test("GET /api/v1/projects/:id — detail for an owned project", async () => {
  const r = await fetch(`${BASE}/api/v1/projects/${encodeURIComponent(PROJECT_A)}`, { headers: { Authorization: bearer(KMA_TOKEN) } })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.id).toBe(PROJECT_A)
  expect(typeof b.members_count).toBe("number")
})

test("GET /api/v1/projects/:id — 404 on a cross-account project id (IDOR guard)", async () => {
  const r = await fetch(`${BASE}/api/v1/projects/${encodeURIComponent(PROJECT_B)}`, { headers: { Authorization: bearer(KMA_TOKEN) } })
  expect(r.status).toBe(404)
})

// ── Members: invite + list ──
test("POST /api/v1/projects/:id/members — invite returns 201", async () => {
  const r = await fetch(`${BASE}/api/v1/projects/${encodeURIComponent(PROJECT_A)}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(KMA_TOKEN) },
    body: JSON.stringify({ email: "invitee@test.local", role: "member" }),
  })
  expect(r.status).toBe(201)
  const b = await r.json() as any
  expect(b.ok).toBe(true)
})

test("POST /api/v1/projects/:id/members — 404 inviting to a cross-account project", async () => {
  const r = await fetch(`${BASE}/api/v1/projects/${encodeURIComponent(PROJECT_B)}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(KMA_TOKEN) },
    body: JSON.stringify({ email: "invitee@test.local" }),
  })
  expect(r.status).toBe(404)
})

test("GET /api/v1/members — returns the account roster (email + native role)", async () => {
  const r = await fetch(`${BASE}/api/v1/members`, { headers: { Authorization: bearer(KMA_TOKEN) } })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  const emails = b.members.map((m: any) => m.email)
  expect(emails).toContain(OWNER_A)
  const owner = b.members.find((m: any) => m.email === OWNER_A)
  expect(owner.role).toBe("owner")
})

// ── Role + revocation ──
test("POST /api/v1/projects — 403 for a non-admin (member) account role", async () => {
  const r = await fetch(`${BASE}/api/v1/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(KMA_MEMBER) },
    body: JSON.stringify({ name: "member cannot create" }),
  })
  expect(r.status).toBe(403)
})

test("GET /api/v1/projects — a member token can still LIST (200)", async () => {
  const r = await fetch(`${BASE}/api/v1/projects`, { headers: { Authorization: bearer(KMA_MEMBER) } })
  expect(r.status).toBe(200)
})

test("management token whose owner was removed from the account → 403 (live accountRole re-check)", async () => {
  // Remove REVOKED_OWNER from the account; the (un-revoked) token must now be denied.
  await rawExec(`DELETE FROM account_members WHERE account_id=? AND email=?`, [ACCOUNT_A, REVOKED_OWNER])
  const r = await fetch(`${BASE}/api/v1/projects`, { headers: { Authorization: bearer(KMA_REVOKED) } })
  expect(r.status).toBe(403)
})

// ── mcp-admin (second MCP endpoint) ──
test("POST /api/v1/mcp-admin — 401 with a kci_ token", async () => {
  const ci = await fetch(`${BASE}/api/ci/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie(OWNER_A_SID) },
    body: JSON.stringify({ project: PROJECT_A }),
  })
  const cib = await ci.json() as any
  const r = await fetch(`${BASE}/api/v1/mcp-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(cib.token) },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  })
  expect(r.status).toBe(401)
})

test("POST /api/v1/mcp-admin — initialize returns the management server name", async () => {
  const r = await fetch(`${BASE}/api/v1/mcp-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(KMA_TOKEN) },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize" }),
  })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.result.serverInfo.name).toBe("klavity-management")
})

test("POST /api/v1/mcp-admin — create_project then list_projects reflects it", async () => {
  const create = await fetch(`${BASE}/api/v1/mcp-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(KMA_TOKEN) },
    body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "create_project", arguments: { name: "Via MCP" } } }),
  })
  const cb = await create.json() as any
  const created = JSON.parse(cb.result.content[0].text)
  expect(typeof created.project.id).toBe("string")

  const list = await fetch(`${BASE}/api/v1/mcp-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(KMA_TOKEN) },
    body: JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "list_projects", arguments: {} } }),
  })
  const lb = await list.json() as any
  const listed = JSON.parse(lb.result.content[0].text)
  expect(listed.projects.map((p: any) => p.id)).toContain(created.project.id)
})

test("POST /api/v1/mcp-admin — get_project on a cross-account id is an in-band error (IDOR)", async () => {
  const r = await fetch(`${BASE}/api/v1/mcp-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: bearer(KMA_TOKEN) },
    body: JSON.stringify({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "get_project", arguments: { project_id: PROJECT_B } } }),
  })
  expect(r.status).toBe(200)
  const b = await r.json() as any
  expect(b.result.isError).toBe(true)
  expect(String(b.result.content[0].text)).toMatch(/not found/i)
})
