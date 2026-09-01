// wip/ci-token-settings — Developer / API tokens management on /api/projects/:id/ci-tokens.
// Subprocess-against-temp-DB pattern (mirrors server.publishable-key.test.ts): raw-seed a temp SQLite
// DB, spawn the real server (which runs its own boot migration — adding the extension_tokens.id/name/
// token_prefix/last_used_at/kind columns), hit it over HTTP, kill in afterAll.
//
// Covers: mint returns the full token ONCE + stores only hash+prefix; the list never leaks the token/hash;
// revoke-by-id works; IDOR neg-control (project A cannot revoke project B's token); admin-gate (a 'member'
// gets 403); and a revoked token is rejected by /mcp auth (negative control — accepted BEFORE revoke,
// rejected AFTER).

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as net from "node:net"
function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createHash } from "node:crypto"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-cit-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")
const sha256hex = (s: string) => createHash("sha256").update(s).digest("hex")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema — the server's own boot migration adds the extension_tokens management columns.
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT, created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0)`)

const now = Date.now()
// Two projects under one account. adminA is admin on BOTH (so the IDOR test is purely path-scoping).
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES ('a1','Acct','owner@test.local','free',?)`, [now])
await rawExec(`INSERT INTO projects (id, account_id, name, status, created_at, updated_at) VALUES ('p1','a1','Project One','active',?,?)`, [now, now])
await rawExec(`INSERT INTO projects (id, account_id, name, status, created_at, updated_at) VALUES ('p2','a1','Project Two','active',?,?)`, [now, now])

const ADMIN = `admin-${ts}@test.local`
const MEMBER = `member-${ts}@test.local`
const ADMIN_SID = `sess_admin_${ts}`
const MEMBER_SID = `sess_member_${ts}`
await rawExec(`INSERT INTO users (email, created_at) VALUES (?,?)`, [ADMIN, now])
await rawExec(`INSERT INTO users (email, created_at) VALUES (?,?)`, [MEMBER, now])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, created_at) VALUES (?, 'p1', ?, 'admin', ?)`, [`pm_a1_${ts}`, ADMIN, now])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, created_at) VALUES (?, 'p2', ?, 'admin', ?)`, [`pm_a2_${ts}`, ADMIN, now])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, created_at) VALUES (?, 'p1', ?, 'member', ?)`, [`pm_m1_${ts}`, MEMBER, now])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?,?,?,?)`, [ADMIN_SID, ADMIN, now, now + 86400_000])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?,?,?,?)`, [MEMBER_SID, MEMBER, now, now + 86400_000])

let serverPort: number, serverProc: ReturnType<typeof Bun.spawn>, BASE: string

beforeAll(async () => {
  serverPort = await freePort()
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
    try { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch {}
    await Bun.sleep(150)
  }
  await Bun.sleep(400) // let the boot-time migration (extension_tokens columns) land
})

afterAll(() => { serverProc?.kill(); rawClient.close() })

const cookie = (sid: string) => ({ Cookie: `klav_session=${sid}` })
const apiGet = (p: string, sid?: string) => fetch(`${BASE}${p}`, { headers: sid ? cookie(sid) : {} })
const apiPost = (p: string, body: any, sid?: string) =>
  fetch(`${BASE}${p}`, { method: "POST", headers: { "Content-Type": "application/json", ...(sid ? cookie(sid) : {}) }, body: JSON.stringify(body) })
const apiDel = (p: string, sid?: string) => fetch(`${BASE}${p}`, { method: "DELETE", headers: sid ? cookie(sid) : {} })

test("mint returns the FULL token once; only the hash + prefix are stored", async () => {
  const r = await apiPost(`/api/projects/p1/ci-tokens`, { name: "CI deploy" }, ADMIN_SID)
  expect(r.status).toBe(201)
  const b = await r.json() as any
  expect(typeof b.token).toBe("string")
  expect(b.token).toMatch(/^kci_[0-9a-f]{64}$/)
  expect(b.id).toMatch(/^cit_/)
  expect(b.name).toBe("CI deploy")
  expect(b.prefix).toBe(b.token.slice(0, 10))

  // DB stores the HASH, never the plaintext; prefix is display-only.
  const row = await rawClient.execute({ sql: "SELECT token, token_prefix, kind, name FROM extension_tokens WHERE id=?", args: [b.id] })
  expect(row.rows.length).toBe(1)
  const x = row.rows[0] as any
  expect(x.token).toBe(sha256hex(b.token))
  expect(x.token).not.toBe(b.token)
  expect(x.token_prefix).toBe(b.prefix)
  expect(x.kind).toBe("ci")
})

test("the list returns metadata only — never the token or its hash", async () => {
  const mint = await apiPost(`/api/projects/p1/ci-tokens`, { name: "list-check" }, ADMIN_SID)
  const mb = await mint.json() as any
  const full = mb.token

  const r = await apiGet(`/api/projects/p1/ci-tokens`, ADMIN_SID)
  expect(r.status).toBe(200)
  const bodyText = await r.text()
  // The full token / its hash must NOT appear anywhere in the list response.
  expect(bodyText.includes(full)).toBe(false)
  expect(bodyText.includes(sha256hex(full))).toBe(false)
  const b = JSON.parse(bodyText)
  const tok = b.tokens.find((t: any) => t.id === mb.id)
  expect(tok).toBeTruthy()
  expect(Object.keys(tok).sort()).toEqual(["createdAt", "id", "lastUsedAt", "name", "prefix", "revoked"])
  expect(tok.token).toBeUndefined()
  expect(tok.prefix).toBe(mb.prefix)
})

test("revoke-by-id revokes the token", async () => {
  const mint = await apiPost(`/api/projects/p1/ci-tokens`, { name: "to-revoke" }, ADMIN_SID)
  const mb = await mint.json() as any
  const del = await apiDel(`/api/projects/p1/ci-tokens/${mb.id}`, ADMIN_SID)
  expect(del.status).toBe(200)
  const list = await (await apiGet(`/api/projects/p1/ci-tokens`, ADMIN_SID)).json() as any
  const tok = list.tokens.find((t: any) => t.id === mb.id)
  expect(tok.revoked).toBe(true)
})

test("IDOR neg-control: project p1 cannot revoke a token minted for project p2", async () => {
  // Mint under p2 (adminA is admin on p2 too).
  const mint = await apiPost(`/api/projects/p2/ci-tokens`, { name: "p2-secret" }, ADMIN_SID)
  const mb = await mint.json() as any
  // Attempt to revoke p2's token via the p1 path → must NOT succeed.
  const cross = await apiDel(`/api/projects/p1/ci-tokens/${mb.id}`, ADMIN_SID)
  expect(cross.status).toBe(404)
  // p2's token is still active.
  const row = await rawClient.execute({ sql: "SELECT revoked FROM extension_tokens WHERE id=?", args: [mb.id] })
  expect(Number((row.rows[0] as any).revoked)).toBe(0)
})

test("admin-gate: a non-admin member gets 403 on all three routes", async () => {
  const g = await apiGet(`/api/projects/p1/ci-tokens`, MEMBER_SID)
  expect(g.status).toBe(403)
  const p = await apiPost(`/api/projects/p1/ci-tokens`, { name: "nope" }, MEMBER_SID)
  expect(p.status).toBe(403)
  const d = await apiDel(`/api/projects/p1/ci-tokens/cit_whatever`, MEMBER_SID)
  expect(d.status).toBe(403)
})

test("no session → 401 (POST + DELETE reach the handler; GET is HTML login-gated upstream)", async () => {
  const p = await apiPost(`/api/projects/p1/ci-tokens`, { name: "x" })
  expect(p.status).toBe(401)
  const d = await apiDel(`/api/projects/p1/ci-tokens/cit_x`)
  expect(d.status).toBe(401)
})

test("revoked token is rejected by /mcp auth (accepted before revoke, rejected after)", async () => {
  const mint = await apiPost(`/api/projects/p1/ci-tokens`, { name: "mcp-token" }, ADMIN_SID)
  const mb = await mint.json() as any
  const rpc = { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }

  // BEFORE revoke: the token authenticates → not a 401.
  const before = await fetch(`${BASE}/mcp`, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${mb.token}` }, body: JSON.stringify(rpc),
  })
  expect(before.status).not.toBe(401)

  // Revoke it.
  const del = await apiDel(`/api/projects/p1/ci-tokens/${mb.id}`, ADMIN_SID)
  expect(del.status).toBe(200)

  // AFTER revoke: /mcp rejects with 401.
  const after = await fetch(`${BASE}/mcp`, {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${mb.token}` }, body: JSON.stringify(rpc),
  })
  expect(after.status).toBe(401)
})
