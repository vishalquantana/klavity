// server.workspace-rename.test.ts
// Workspace (account) rename: PATCH /api/account { name } lets an admin/owner rename their
// workspace. The name is accounts.name (the old `workspaces` table, migrated into accounts) and
// is surfaced to the client via GET /api/me → active.name. Members (non-admin) may not rename.

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
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-wsrename-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(41)).toString("base64")
const PORT = await __freePortKLA719()
const BASE = `http://localhost:${PORT}`

const OWNER = `ws-owner-${RUN}@test.local`
const MEMBER = `ws-member-${RUN}@test.local`

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }
async function query(sql: string, args: any[] = []) { return (await raw.execute({ sql, args })).rows }

let appProc: ReturnType<typeof Bun.spawn>
const ACCT = `acct_ws_${RUN}`
const OWNER_SESS = `sess_owner_${RUN}`
const MEMBER_SESS = `sess_member_${RUN}`

async function seed() {
  const now = Date.now()
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, now])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [MEMBER, now])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)",
    [ACCT, "Old Workspace Name", OWNER, now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)",
    [`am_owner_${RUN}`, ACCT, OWNER, "owner", now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)",
    [`am_member_${RUN}`, ACCT, MEMBER, "member", now])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)",
    [OWNER_SESS, OWNER, now, now + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)",
    [MEMBER_SESS, MEMBER, now, now + 86400_000])
}

function patchAccount(body: any, sess?: string) {
  return fetch(`${BASE}/api/account`, {
    method: "PATCH",
    headers: { "content-type": "application/json", ...(sess ? { cookie: `klav_session=${sess}` } : {}) },
    body: JSON.stringify(body),
    redirect: "manual",
  })
}

beforeAll(async () => {
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(PORT),
      TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
    },
    stdout: "ignore", stderr: "ignore",
  })
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
  await seed()
})

afterAll(() => { appProc?.kill(); raw.close(); rmDb() })

test("an admin/owner can rename the workspace; it persists and surfaces via /api/me", async () => {
  const r = await patchAccount({ name: "  Acme QA  " }, OWNER_SESS)
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  expect(body.name).toBe("Acme QA") // trimmed

  const rows = await query("SELECT name FROM accounts WHERE id=?", [ACCT])
  expect(rows[0].name).toBe("Acme QA")

  const me = await fetch(`${BASE}/api/me`, { headers: { cookie: `klav_session=${OWNER_SESS}` } })
  const md = await me.json()
  expect(md.active.name).toBe("Acme QA")
})

test("an empty name is rejected", async () => {
  const r = await patchAccount({ name: "   " }, OWNER_SESS)
  expect(r.status).toBe(400)
  // unchanged
  expect((await query("SELECT name FROM accounts WHERE id=?", [ACCT]))[0].name).toBe("Acme QA")
})

test("an over-long name is rejected", async () => {
  const r = await patchAccount({ name: "x".repeat(81) }, OWNER_SESS)
  expect(r.status).toBe(400)
})

test("a non-admin member cannot rename the workspace", async () => {
  const r = await patchAccount({ name: "Hijacked" }, MEMBER_SESS)
  expect(r.status).toBe(403)
  expect((await query("SELECT name FROM accounts WHERE id=?", [ACCT]))[0].name).toBe("Acme QA")
})

test("an anonymous caller cannot rename the workspace", async () => {
  const r = await patchAccount({ name: "Anon" })
  expect(r.ok).toBe(false)
  expect((await query("SELECT name FROM accounts WHERE id=?", [ACCT]))[0].name).toBe("Acme QA")
})
