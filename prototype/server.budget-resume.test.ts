// JTBD 3.11 — Unblock the budget dead-end.
//
// When the daily Sim review budget is exhausted, POST /api/sim/review auto-pauses the project and
// now returns a member-actionable response (reason + canRequestResume + settings link) instead of a
// bare "try again tomorrow". A member can then hit POST /api/sim/request-resume to notify an admin,
// and the passive "no accessible project" miss now explains allowlist setup.
//
// Hermetic: real server subprocess against a fresh temp DB, seeded via a raw client. No SendGrid /
// Slack (the notify lib is fire-and-forget and no-ops without SENDGRID_API_KEY), so every assertion
// is on the HTTP contract + the recorded activity row / throttle table.

import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${randomUUID()}`
const DB_FILE = join(tmpdir(), `klav-budget-resume-${RUN}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(51)).toString("base64")

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const rawClient = createClient({ url: "file:" + DB_FILE })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

const OWNER_EMAIL = `owner-resume-${RUN}@test.local`   // admin — can resume
const MEMBER_EMAIL = `member-resume-${RUN}@test.local` // plain member — hits the wall
const OUTSIDER_EMAIL = `outsider-resume-${RUN}@test.local`
const OWNER_SID = `sess_owner_resume_${RUN}`
const MEMBER_SID = `sess_member_resume_${RUN}`
const OUTSIDER_SID = `sess_outsider_resume_${RUN}`
const ACCOUNT_ID = `acct_resume_${RUN}`
const PROJECT_ID = `proj_resume_${RUN}`         // budget 0 → always exhausted
const HAS_BUDGET_PROJECT_ID = `proj_resume_ok_${RUN}` // budget 100 → for the no-allowlist case
const SIM_ID = `sim_resume_${RUN}`
const NOW = Date.now()
const TINY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

async function seed() {
  for (const [email, sid] of [[OWNER_EMAIL, OWNER_SID], [MEMBER_EMAIL, MEMBER_SID], [OUTSIDER_EMAIL, OUTSIDER_SID]] as const) {
    await rawExec("INSERT INTO users (email, created_at) VALUES (?, ?)", [email, NOW])
    await rawExec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [sid, email, NOW, NOW + 86_400_000])
  }

  await rawExec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCOUNT_ID, "Resume Co", OWNER_EMAIL, NOW])
  await rawExec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_owner_${RUN}`, ACCOUNT_ID, OWNER_EMAIL, "owner", NOW])
  await rawExec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_member_${RUN}`, ACCOUNT_ID, MEMBER_EMAIL, "member", NOW])

  for (const [projectId, budget] of [[PROJECT_ID, 0], [HAS_BUDGET_PROJECT_ID, 100]] as const) {
    await rawExec(
      "INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [projectId, ACCOUNT_ID, "Resume Project", "active", "auto", budget, "named", NOW, NOW],
    )
    await rawExec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_owner_${projectId}`, projectId, OWNER_EMAIL, "admin", null, NOW])
    await rawExec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_member_${projectId}`, projectId, MEMBER_EMAIL, "member", null, NOW])
    await rawExec("INSERT INTO monitored_urls (id, project_id, url_pattern, enabled, created_at) VALUES (?, ?, ?, ?, ?)", [`mon_${projectId}`, projectId, "allowed.test/*", 1, NOW])
    for (const email of [OWNER_EMAIL, MEMBER_EMAIL]) {
      await rawExec("INSERT INTO monitoring_consent (id, project_id, email, status, granted_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)", [`con_${projectId}_${email}`, projectId, email, "granted", NOW, NOW])
    }
    await rawExec(
      "INSERT INTO personas (id, project_id, name, role, type, initials, accent, summary, insights_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [`${SIM_ID}_${projectId}`, projectId, "Resume Sim", "Buyer", "client", "RS", "#6366f1", "Reviews pages.", "[]", NOW, NOW],
    )
  }
}

beforeAll(async () => {
  const port = 45000 + Math.floor(Math.random() * 1000)
  BASE = `http://localhost:${port}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",   // notify lib no-ops the email transport hermetically
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe",
    stderr: "pipe",
  })

  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
  await seed()
})

afterAll(() => {
  serverProc?.kill()
  rawClient.close()
  rmDb()
})

async function postReview(cookie: string | null, overrides: Record<string, unknown> = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (cookie) headers.Cookie = `klav_session=${cookie}`
  const res = await fetch(`${BASE}/api/sim/review`, {
    method: "POST",
    headers,
    body: JSON.stringify({ projectId: PROJECT_ID, url: "https://allowed.test/pricing", screenshotDataUrl: TINY_PNG, domSig: `dom-${RUN}`, ...overrides }),
  })
  return { res, body: await res.json() }
}

async function postResume(cookie: string | null, body: Record<string, unknown>) {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (cookie) headers.Cookie = `klav_session=${cookie}`
  const res = await fetch(`${BASE}/api/sim/request-resume`, { method: "POST", headers, body: JSON.stringify(body) })
  return { res, body: await res.json() }
}

test("budgetExhausted response is member-actionable (reason + resume path + settings link)", async () => {
  const { res, body } = await postReview(MEMBER_SID, { projectId: PROJECT_ID, url: "https://allowed.test/pricing" })
  expect(res.status).toBe(429)
  expect(body.reason).toBe("budgetExhausted")
  expect(body.canRequestResume).toBe(true)
  expect(body.requestResumeUrl).toBe("/api/sim/request-resume")
  expect(typeof body.error).toBe("string")
  expect(body.error).toMatch(/daily sim budget/i)
  expect(String(body.settingsUrl)).toContain("#settings")
})

test("request-resume: authed member notifies an admin + records an activity row", async () => {
  const { res, body } = await postResume(MEMBER_SID, { projectId: PROJECT_ID, url: "https://allowed.test/pricing" })
  expect(res.status).toBe(200)
  expect(body.ok).toBe(true)
  expect(typeof body.message).toBe("string")

  const rows = await rawClient.execute({
    sql: "SELECT actor_email, meta_json FROM activity_events WHERE project_id=? AND type='admin_resume_requested' ORDER BY created_at DESC",
    args: [PROJECT_ID],
  })
  expect(rows.rows.length).toBeGreaterThanOrEqual(1)
  expect(String((rows.rows[0] as any).actor_email)).toBe(MEMBER_EMAIL)
  expect(String((rows.rows[0] as any).meta_json)).toContain("budget_exhausted")

  // The DB-backed throttle table was created + stamped by the fire-and-forget notify.
  const slot = await rawClient.execute({ sql: "SELECT last_email_at FROM budget_resume_alert_state WHERE project_id=?", args: [PROJECT_ID] })
  expect(slot.rows.length).toBe(1)
})

test("request-resume: unauthenticated is rejected", async () => {
  const { res } = await postResume(null, { projectId: PROJECT_ID })
  expect(res.status).toBe(401)
})

test("request-resume: no resolvable project → 400 with guidance", async () => {
  const { res, body } = await postResume(MEMBER_SID, {})
  expect(res.status).toBe(400)
  expect(String(body.error)).toMatch(/project/i)
})

test("request-resume: outsider with no access can't resolve the project (400)", async () => {
  const { res } = await postResume(OUTSIDER_SID, { projectId: PROJECT_ID })
  expect(res.status).toBe(400)
})

test("no-allowlist-match error explains how to fix it and points at allowlist setup", async () => {
  // Passive auto-resolution (no explicit projectId) on a URL not in any allowlist.
  const { res, body } = await postReview(MEMBER_SID, { projectId: undefined, url: "https://unmonitored.test/somewhere" })
  expect(res.status).toBe(401)
  expect(body.reason).toBe("noAllowlistMatch")
  expect(body.hint).toBe("allowlist_setup")
  expect(String(body.error)).toMatch(/allowlist|monitored/i)
  expect(String(body.settingsUrl)).toContain("#settings")
})

test("explicit-project access failure still returns unauthorized (legacy gate contract preserved)", async () => {
  // Outsider requesting an explicit project they can't access → authz miss, NOT noAllowlistMatch.
  const { res, body } = await postReview(OUTSIDER_SID, { projectId: PROJECT_ID, url: "https://allowed.test/pricing" })
  expect(res.status).toBe(401)
  expect(body.reason).toBe("unauthorized")
})
