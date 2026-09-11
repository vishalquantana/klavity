// KLA-835 — extend the KLA-829 list=access fix to the remaining listProjects consumers.
//
// Two user-facing surfaces still built from the BROAD listProjects() (every project in any account the
// user belongs to, including ones a plain account-member has no project_members row for) rather than
// the access gate (projectAccess / listAccessibleProjects):
//
//   1. Sims Studio switcher — GET /api/projects returned ALL projects; the studio's account default is
//      the FIRST one returned, which could be a project the member cannot open (role:null) → dead/blank
//      switcher. FIX: return only accessible projects.
//   2. GET /api/account/agency-report — aggregated per-client rollups with NO per-caller role check
//      (only isAgencyEntitled), so a plain member could pull per-client data for un-openable projects.
//      FIX: gate to account admins/owners.
//
// Hermetic: a real server subprocess against a fresh temp DB (same pattern as dashboard-projswitch-blank).

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-listaccess835-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

const OWNER_EMAIL = `owner-${ts}@test.local`
const USER_EMAIL = `member-${ts}@test.local`        // plain account-member (role "User")
const OWNER_SID = `sess_owner_${ts}`
const USER_SID = `sess_user_${ts}`
const ACCOUNT_ID = `acct_${ts}`
const PROJECT_A_ID = `proj_a_${ts}`                 // member HAS an explicit project row → accessible
const PROJECT_B_ID = `proj_b_${ts}`                 // same account, NO member row → NOT accessible

let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string
let rawClient: ReturnType<typeof createClient>

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

  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
    await Bun.sleep(200)
  }

  rawClient = createClient({ url: "file:" + srvDbFile })
  await rawClient.execute("PRAGMA busy_timeout=5000")
  const NOW = Date.now()
  const exec = (sql: string, args: any[] = []) => rawClient.execute({ sql, args })

  await exec(`INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)`, [OWNER_EMAIL, NOW])
  await exec(`INSERT OR IGNORE INTO users (email, created_at) VALUES (?, ?)`, [USER_EMAIL, NOW])
  // Account is on an Agency-entitled plan ("scale") so the agency-report PLAN gate passes — isolating
  // the NEW admin/owner gate as the thing that denies the member and admits the owner.
  await exec(`INSERT OR IGNORE INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`,
    [ACCOUNT_ID, "Test Workspace", OWNER_EMAIL, "scale", NOW])
  await exec(`INSERT OR IGNORE INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`am_owner_${ts}`, ACCOUNT_ID, OWNER_EMAIL, "owner", NOW])
  await exec(`INSERT OR IGNORE INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [`am_member_${ts}`, ACCOUNT_ID, USER_EMAIL, "member", NOW])

  // Project A — member HAS an explicit project_members row → accessible.
  await exec(`INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, billing_plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PROJECT_A_ID, ACCOUNT_ID, "Charantra", "active", "auto", 200, "named", "free", NOW, NOW])
  await exec(`INSERT OR IGNORE INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [`pm_a_${ts}`, PROJECT_A_ID, USER_EMAIL, "member", OWNER_EMAIL, NOW])

  // Project B — same account, NO project_members row for the member → NOT accessible (member sees it
  // listed via account membership but cannot open it; owner can).
  await exec(`INSERT OR IGNORE INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, billing_plan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PROJECT_B_ID, ACCOUNT_ID, "website", "active", "auto", 200, "named", "free", NOW + 1, NOW + 1])

  await exec(`INSERT OR IGNORE INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`,
    [OWNER_SID, OWNER_EMAIL, NOW, NOW + 86400_000])
  await exec(`INSERT OR IGNORE INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`,
    [USER_SID, USER_EMAIL, NOW, NOW + 86400_000])
}, 20000)

afterAll(() => {
  serverProc?.kill()
  rawClient?.close()
})

function auth(sid: string) { return { Cookie: `klav_session=${sid}` } }

// ── NEGATIVE CONTROL: /api/projects must NOT list an inaccessible project for a member. ──
// Before the fix /api/projects used listProjects(me) and returned PROJECT_B with role:null, which the
// studio then defaulted to (first project) → blank/dead switcher.
test("KLA-835: GET /api/projects lists ONLY accessible projects for a member (no un-openable 'website')", async () => {
  const r = await fetch(`${BASE}/api/projects`, { headers: auth(USER_SID) })
  expect(r.status).toBe(200)
  const body = await r.json() as any
  const ids = (body.projects || []).map((p: any) => p.id)
  expect(ids).toContain(PROJECT_A_ID)
  expect(ids).not.toContain(PROJECT_B_ID)        // regression: listProjects() leaked this here
  // Every returned project is openable → non-null role (the studio default can't dead-end).
  for (const p of body.projects) expect(p.role).toBeTruthy()
})

test("KLA-835: GET /api/projects still returns ALL account projects for the owner (no over-filtering)", async () => {
  const r = await fetch(`${BASE}/api/projects`, { headers: auth(OWNER_SID) })
  expect(r.status).toBe(200)
  const body = await r.json() as any
  const ids = (body.projects || []).map((p: any) => p.id)
  expect(ids).toContain(PROJECT_A_ID)
  expect(ids).toContain(PROJECT_B_ID)
})

// ── NEGATIVE CONTROL: agency-report denies a non-admin member even on an entitled plan. ──
test("KLA-835: GET /api/account/agency-report is 403 for a plain member (admin/owner gate)", async () => {
  const r = await fetch(`${BASE}/api/account/agency-report`, { headers: auth(USER_SID) })
  expect(r.status).toBe(403)
  const body = await r.json() as any
  // Denied by the NEW admin gate — not by the plan gate (account is on an entitled "scale" plan).
  expect(String(body.error || "")).toMatch(/admin/i)
})

test("KLA-835: GET /api/account/agency-report succeeds for the account owner (not over-gated)", async () => {
  const r = await fetch(`${BASE}/api/account/agency-report`, { headers: auth(OWNER_SID) })
  expect(r.status).toBe(200)
  const body = await r.json() as any
  expect(Array.isArray(body.clients)).toBe(true)
})
