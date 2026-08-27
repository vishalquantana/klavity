// server.widget-autocapture-config.test.ts
// BugHerd sub-project A, task 4: the per-project autoCaptureErrors flag (Task 1's
// getWidgetConfig/setWidgetConfig) must be (a) exposed in the SDK-facing widget config GET
// (public, CORS-open GET /api/projects/:id/config) so /api/errors gating and the widget itself
// can see whether passive error capture is on, and (b) writable by an admin via the existing
// admin settings write endpoint (POST /api/projects/:id/config), same admin gate as mode/reportGate.

import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"
import net from "node:net"

// KLA-719: a random `45700 + rand(200)` port overlapped a neighboring suite's range.
// When the port was already held, the favicon readiness probe was answered by the
// foreign server, the boot loop broke early, and seed() ran against a DB this server
// never initialized → "no such table: users". OS-assigned free port fixes it.
function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-autocapture-cfg-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(53)).toString("base64")
const PORT = await freePort()
const BASE = `http://localhost:${PORT}`

const ADMIN = `ac-admin-${RUN}@test.local`
const MEMBER = `ac-member-${RUN}@test.local`
const ACCT = `acct_ac_${RUN}`
const PROJ = `proj_ac_${RUN}`
const ADMIN_SESS = `sess_ac_admin_${RUN}`
const MEMBER_SESS = `sess_ac_member_${RUN}`

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

let appProc: ReturnType<typeof Bun.spawn>

async function seed() {
  const now = Date.now()
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [ADMIN, now])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [MEMBER, now])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "AutoCapture Test", ADMIN, now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_admin_${RUN}`, ACCT, ADMIN, "owner", now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_member_${RUN}`, ACCT, MEMBER, "member", now])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "AutoCapture Project", "active", "auto", 200, "named", now, now])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_admin_${RUN}`, PROJ, ADMIN, "admin", null, now])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_member_${RUN}`, PROJ, MEMBER, "member", ADMIN, now])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [ADMIN_SESS, ADMIN, now, now + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [MEMBER_SESS, MEMBER, now, now + 86400_000])
}

function postConfig(body: any, sess?: string) {
  return fetch(`${BASE}/api/projects/${PROJ}/config`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(sess ? { cookie: `klav_session=${sess}` } : {}) },
    body: JSON.stringify(body),
  })
}

function getWidgetConfig() {
  return fetch(`${BASE}/api/projects/${PROJ}/config`)
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

test("defaults to autoCaptureErrors:false on the SDK-facing widget config", async () => {
  const r = await getWidgetConfig()
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.widget.autoCaptureErrors).toBe(false)
})

test("an admin POST setting autoCaptureErrors:true is reflected on the SDK-facing widget config GET", async () => {
  const r = await postConfig({ theme: "light", autoCaptureErrors: true }, ADMIN_SESS)
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)

  const g = await getWidgetConfig()
  expect(g.status).toBe(200)
  const gBody = await g.json()
  expect(gBody.widget.autoCaptureErrors).toBe(true)
})

test("a non-admin member POST is rejected with 403 and does not change the flag", async () => {
  const r = await postConfig({ theme: "light", autoCaptureErrors: false }, MEMBER_SESS)
  expect(r.status).toBe(403)

  const g = await getWidgetConfig()
  const gBody = await g.json()
  expect(gBody.widget.autoCaptureErrors).toBe(true) // unchanged from previous test
})

test("an anonymous POST is rejected", async () => {
  const r = await postConfig({ autoCaptureErrors: false })
  expect(r.ok).toBe(false)
})
