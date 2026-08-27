// POST /api/team/member/remove (QPLANE-407): admin-only removal of an ACTIVE project member.
// Distinct from /api/team/invite/revoke (which only clears a still-PENDING invite). Hermetic:
// spawns the real server against a temp file DB.
import { afterAll, beforeAll, expect, test } from "bun:test"
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
const DB_FILE = join(tmpdir(), `klav-member-remove-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(41)).toString("base64")

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `mr-owner-${RUN}@test.local` // account owner — cannot be removed
const ADMIN2 = `mr-admin2-${RUN}@test.local` // a second project admin — used for last-admin case
const MEMBER = `mr-member-${RUN}@test.local` // plain member — happy-path removal target
const NONADMIN = `mr-nonadmin-${RUN}@test.local` // a plain member acting as caller → 403 checks
const ACCT = `acct_mr_${RUN}`
const PROJ = `proj_mr_${RUN}`
const NOW = Date.now()

const SID_OWNER = `sess_mrowner_${RUN}`
const SID_ADMIN2 = `sess_mradmin2_${RUN}`
const SID_NONADMIN = `sess_mrnonadmin_${RUN}`

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""

async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }
function auth(sid: string) { return { "content-type": "application/json", cookie: `klav_session=${sid}` } }
function remove(body: any, sid: string) {
  return fetch(`${BASE}/api/team/member/remove`, { method: "POST", headers: auth(sid), body: JSON.stringify(body) })
}
async function members(): Promise<any[]> {
  const r = await raw.execute({ sql: "SELECT email, project_role FROM project_members WHERE project_id=?", args: [PROJ] })
  return r.rows.map((x: any) => ({ email: String(x.email), role: String(x.project_role) }))
}

beforeAll(async () => {
  const port = await __freePortKLA719()
  BASE = `http://localhost:${port}`
  proc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
    },
    stdout: "ignore",
    stderr: "ignore",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }

  for (const e of [OWNER, ADMIN2, MEMBER, NONADMIN]) {
    await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [e, NOW])
  }
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID_OWNER, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID_ADMIN2, ADMIN2, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID_NONADMIN, NONADMIN, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Remove Test", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_owner_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_admin2_${RUN}`, ACCT, ADMIN2, "member", NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_member_${RUN}`, ACCT, MEMBER, "member", NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_nonadmin_${RUN}`, ACCT, NONADMIN, "member", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Remove Project", "active", "auto", 200, "named", NOW, NOW])
  // OWNER has no explicit project_members row — account owner is an IMPLICIT project-admin via
  // projectAccess(); this also exercises the "owner not literally in project_members" path.
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_admin2_${RUN}`, PROJ, ADMIN2, "admin", OWNER, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_member_${RUN}`, PROJ, MEMBER, "member", OWNER, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_nonadmin_${RUN}`, PROJ, NONADMIN, "member", OWNER, NOW])
})

afterAll(() => { try { proc?.kill() } catch {} rmDb() })

test("an admin removes a plain member — 200, and they're gone from the roster", async () => {
  const r = await remove({ email: MEMBER, project: PROJ }, SID_OWNER)
  expect(r.status).toBe(200)
  const j = await r.json() as any
  expect(j.ok).toBe(true)
  expect(j.members.find((m: any) => m.email === MEMBER)).toBeUndefined()

  const rows = await members()
  expect(rows.find((m) => m.email === MEMBER)).toBeUndefined()
})

test("a non-admin caller gets 403 and nothing is removed", async () => {
  const r = await remove({ email: ADMIN2, project: PROJ }, SID_NONADMIN)
  expect(r.status).toBe(403)
  const rows = await members()
  expect(rows.find((m) => m.email === ADMIN2)).toBeTruthy()
})

test("removing the account owner is rejected with 400, even though they're an implicit project-admin", async () => {
  // Caller is ADMIN2 (a different admin), not the owner themselves — otherwise this would hit the
  // "can't remove yourself" guard instead of the owner guard.
  const r = await remove({ email: OWNER, project: PROJ }, SID_ADMIN2)
  expect(r.status).toBe(400)
  const j = await r.json() as any
  expect(j.error).toMatch(/owner/i)
})

test("removing yourself is rejected with 400", async () => {
  const r = await remove({ email: OWNER, project: PROJ }, SID_OWNER)
  expect(r.status).toBe(400)
})

test("removing the last remaining admin is rejected with 400", async () => {
  // ADMIN2 is the only *explicit* project-admin row left (OWNER is implicit, not counted per the
  // membersOfProject-based guard) — removing them would leave the roster with zero explicit admins.
  const r = await remove({ email: ADMIN2, project: PROJ }, SID_OWNER)
  expect(r.status).toBe(400)
  const j = await r.json() as any
  expect(j.error).toMatch(/last admin/i)
  const rows = await members()
  expect(rows.find((m) => m.email === ADMIN2)).toBeTruthy()
})

test("removing an unknown / already-removed member is a 404 no-op", async () => {
  const r = await remove({ email: `nobody-${RUN}@test.local`, project: PROJ }, SID_OWNER)
  expect(r.status).toBe(404)
})

test("removing an already-removed member (MEMBER, removed in test 1) is also a 404", async () => {
  const r = await remove({ email: MEMBER, project: PROJ }, SID_OWNER)
  expect(r.status).toBe(404)
})
