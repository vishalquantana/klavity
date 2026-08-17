// server.install-email.test.ts
// Onboarding hand-off: POST /api/install/email emails the widget install snippet to a developer.
// Admin/owner only, project-scoped, validated. Mail transport unavailable in tests (no SENDGRID
// key), so a successful call returns { ok:true, emailed:false } rather than a hard 500.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-install-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(39)).toString("base64")
const PORT = 45500 + Math.floor(Math.random() * 200)
const BASE = `http://localhost:${PORT}`

const OWNER = `inst-owner-${RUN}@test.local`
const MEMBER = `inst-member-${RUN}@test.local`

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

let appProc: ReturnType<typeof Bun.spawn>
const ACCT = `acct_inst_${RUN}`
const PROJ = `proj_inst_${RUN}`
const OWNER_SESS = `sess_iowner_${RUN}`
const MEMBER_SESS = `sess_imember_${RUN}`

async function seed() {
  const now = Date.now()
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, now])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [MEMBER, now])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Inst WS", OWNER, now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_o_${RUN}`, ACCT, OWNER, "owner", now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_m_${RUN}`, ACCT, MEMBER, "member", now])
  await exec("INSERT INTO projects (id, account_id, name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Acme", "active", now, now])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, created_at) VALUES (?, ?, ?, ?, ?)", [`pm_m_${RUN}`, PROJ, MEMBER, "member", now])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [OWNER_SESS, OWNER, now, now + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [MEMBER_SESS, MEMBER, now, now + 86400_000])
}

function send(body: any, sess?: string) {
  return fetch(`${BASE}/api/install/email`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(sess ? { cookie: `klav_session=${sess}` } : {}) },
    body: JSON.stringify(body), redirect: "manual",
  })
}

beforeAll(async () => {
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: { ...process.env, PORT: String(PORT), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "", KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "" },
    stdout: "ignore", stderr: "ignore",
  })
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(150) }
  await seed()
})
afterAll(() => { appProc?.kill(); raw.close(); rmDb() })

test("an admin can send install instructions (ok:true; emailed:false without a mail key)", async () => {
  const r = await send({ projectId: PROJ, email: "dev@acme.test" }, OWNER_SESS)
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.ok).toBe(true)
  expect(d.emailed).toBe(false) // no SENDGRID key in test → mail skipped, not a hard failure
})

test("an invalid developer email is rejected", async () => {
  const r = await send({ projectId: PROJ, email: "not-an-email" }, OWNER_SESS)
  expect(r.status).toBe(400)
})

test("a non-admin member cannot send", async () => {
  const r = await send({ projectId: PROJ, email: "dev@acme.test" }, MEMBER_SESS)
  expect(r.status).toBe(403)
})

test("an unknown project is rejected", async () => {
  const r = await send({ projectId: "proj_nope", email: "dev@acme.test" }, OWNER_SESS)
  expect(r.ok).toBe(false) // no admin access to a non-existent project
})

test("an anonymous caller cannot send", async () => {
  const r = await send({ projectId: PROJ, email: "dev@acme.test" })
  expect(r.ok).toBe(false)
})
