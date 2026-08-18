// server.snap-plan.test.ts
// Snap-only project gating: an admin can lock a project to the Snap plan via POST
// /api/projects/:id/plan { override: "snap" }. Once locked, Sims/AutoSim/AI-settings writes
// for that project return 402 { code: "snap_locked" }; Snap/feedback/ticket reads stay open.
// Mirrors server.workspace-rename.test.ts's boot-a-real-server harness.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-snapplan-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")
const PORT = 45400 + Math.floor(Math.random() * 200)
const BASE = `http://localhost:${PORT}`

const ADMIN = `sp-admin-${RUN}@test.local`
const MEMBER = `sp-member-${RUN}@test.local`

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }
async function query(sql: string, args: any[] = []) { return (await raw.execute({ sql, args })).rows }

let appProc: ReturnType<typeof Bun.spawn>
const ACCT = `acct_sp_${RUN}`
const PROJ = `proj_sp_${RUN}`
const ADMIN_SESS = `sess_sp_admin_${RUN}`
const MEMBER_SESS = `sess_sp_member_${RUN}`
const TRAIL = `trl_sp_${RUN}`

async function seed() {
  const now = Date.now()
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [ADMIN, now])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [MEMBER, now])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)",
    [ACCT, "Snap Plan QA", ADMIN, now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)",
    [`am_sp_owner_${RUN}`, ACCT, ADMIN, "owner", now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)",
    [`am_sp_member_${RUN}`, ACCT, MEMBER, "member", now])
  await exec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [PROJ, ACCT, "Snap Plan Project", "active", "auto", 200, "named", now, now])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [`pm_sp_member_${RUN}`, PROJ, MEMBER, "member", ADMIN, now])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)",
    [ADMIN_SESS, ADMIN, now, now + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)",
    [MEMBER_SESS, MEMBER, now, now + 86400_000])
  // A pre-existing draft trail — created directly (not via /api/trails/author, which itself
  // requires an LLM authoring drive) so /approve and PATCH can be exercised against a real row.
  await exec(`INSERT INTO trails (id, project_id, name, intent, base_url, status, created_by, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [TRAIL, PROJ, "Checkout flow", "verify checkout", "https://example.test", "draft", ADMIN, now, now])
}

function withSess(sess?: string) {
  return sess ? { cookie: `klav_session=${sess}` } : {}
}

function postPlan(override: "snap" | null, sess?: string) {
  return fetch(`${BASE}/api/projects/${PROJ}/plan`, {
    method: "POST",
    headers: { "content-type": "application/json", ...withSess(sess) },
    body: JSON.stringify({ override }),
    redirect: "manual",
  })
}

function createSim(sess?: string) {
  return fetch(`${BASE}/api/personas?project=${PROJ}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...withSess(sess) },
    body: JSON.stringify({ name: `Sim ${Math.random().toString(36).slice(2)}`, role: "QA" }),
    redirect: "manual",
  })
}

function pauseProject(sess?: string) {
  return fetch(`${BASE}/api/projects/${PROJ}/pause`, {
    method: "POST",
    headers: { "content-type": "application/json", ...withSess(sess) },
    body: JSON.stringify({ mode: "paused" }),
    redirect: "manual",
  })
}

function authorTrail(sess?: string) {
  return fetch(`${BASE}/api/trails/author?project=${PROJ}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...withSess(sess) },
    body: JSON.stringify({
      name: "Checkout flow",
      objective: "Walk through the checkout flow and confirm the order total is correct.",
      base_url: "https://example.test",
    }),
    redirect: "manual",
  })
}

function listSims(sess?: string) {
  return fetch(`${BASE}/api/personas?project=${PROJ}`, { headers: withSess(sess), redirect: "manual" })
}

function simReview(sess?: string) {
  return fetch(`${BASE}/api/sim/review`, {
    method: "POST",
    headers: { "content-type": "application/json", ...withSess(sess) },
    body: JSON.stringify({ projectId: PROJ, url: "https://example.test/", screenshotDataUrl: "", adhoc: true }),
    redirect: "manual",
  })
}

function approveTrail(sess?: string) {
  return fetch(`${BASE}/api/trails/${TRAIL}/approve?project=${PROJ}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...withSess(sess) },
    redirect: "manual",
  })
}

function patchTrail(sess?: string) {
  return fetch(`${BASE}/api/trails/${TRAIL}?project=${PROJ}`, {
    method: "PATCH",
    headers: { "content-type": "application/json", ...withSess(sess) },
    body: JSON.stringify({ schedule: "0 9 * * *" }),
    redirect: "manual",
  })
}

function createSimReviewSchedule(sess?: string) {
  return fetch(`${BASE}/api/projects/${PROJ}/sim-review-schedules`, {
    method: "POST",
    headers: { "content-type": "application/json", ...withSess(sess) },
    body: JSON.stringify({ targetUrl: "https://example.test/", frequency: "daily" }),
    redirect: "manual",
  })
}

function simPreview(sess?: string) {
  return fetch(`${BASE}/api/sim/preview`, {
    method: "POST",
    headers: { "content-type": "application/json", ...withSess(sess) },
    body: JSON.stringify({ url: "https://example.test/", projectId: PROJ }),
    redirect: "manual",
  })
}

function createTranscript(sess?: string) {
  return fetch(`${BASE}/api/transcripts?project=${PROJ}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...withSess(sess) },
    body: JSON.stringify({ transcript: "Sarah: I love the new dashboard, it's so much faster now." }),
    redirect: "manual",
  })
}

function confirmSimMatch(sess?: string) {
  return fetch(`${BASE}/api/projects/${PROJ}/sim-matches/nonexistent-match/confirm`, {
    method: "POST",
    headers: { "content-type": "application/json", ...withSess(sess) },
    body: JSON.stringify({ simId: "sim_whatever" }),
    redirect: "manual",
  })
}

function getTickets(sess?: string) {
  return fetch(`${BASE}/api/projects/${PROJ}/tickets`, { headers: withSess(sess), redirect: "manual" })
}

function getProject(sess?: string) {
  return fetch(`${BASE}/api/projects/${PROJ}`, { headers: withSess(sess), redirect: "manual" })
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

test("a non-admin cannot set the plan override", async () => {
  const r = await postPlan("snap", MEMBER_SESS)
  expect(r.status).toBe(403)
})

test("before any override, Sims creation works (not locked)", async () => {
  const r = await createSim(ADMIN_SESS)
  expect(r.status).toBe(201)
})

test("an admin can lock a project to the Snap plan", async () => {
  const r = await postPlan("snap", ADMIN_SESS)
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  expect(body.project.planOverride).toBe("snap")

  const rows = await query("SELECT plan_override FROM projects WHERE id=?", [PROJ])
  expect(rows[0].plan_override).toBe("snap")
})

test("GET /api/projects/:pid echoes planOverride + entitlement.snapOnly", async () => {
  const r = await getProject(ADMIN_SESS)
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.project.planOverride).toBe("snap")
  expect(body.project.entitlement.snapOnly).toBe(true)
  expect(body.project.entitlement.canSims).toBe(false)
  expect(body.project.entitlement.canAutoSim).toBe(false)
  expect(body.project.entitlement.canAiSettings).toBe(false)
})

test("a Sims endpoint is 402 snap_locked once the project is Snap-locked", async () => {
  const r = await createSim(ADMIN_SESS)
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("snap_locked")
})

test("an AutoSim endpoint is 402 snap_locked once the project is Snap-locked", async () => {
  const r = await authorTrail(ADMIN_SESS)
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("snap_locked")
})

test("an AI-settings write (admin pause / review mode) is 402 snap_locked once Snap-locked", async () => {
  const r = await pauseProject(ADMIN_SESS)
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("snap_locked")
})

test("Sims list (GET /api/personas) is 402 snap_locked once Snap-locked", async () => {
  const r = await listSims(ADMIN_SESS)
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("snap_locked")
})

test("POST /api/sim/review (extension live auto-review hot path) is 402 snap_locked once Snap-locked", async () => {
  const r = await simReview(ADMIN_SESS)
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("snap_locked")
})

test("POST /api/trails/:id/approve is 402 snap_locked once Snap-locked", async () => {
  const r = await approveTrail(ADMIN_SESS)
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("snap_locked")
})

test("PATCH /api/trails/:id (activate/schedule) is 402 snap_locked once Snap-locked", async () => {
  const r = await patchTrail(ADMIN_SESS)
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("snap_locked")
})

test("POST /api/projects/:id/sim-review-schedules is 402 snap_locked once Snap-locked", async () => {
  const r = await createSimReviewSchedule(ADMIN_SESS)
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("snap_locked")
})

test("POST /api/sim/preview (authenticated projectId branch) is 402 snap_locked once Snap-locked", async () => {
  const r = await simPreview(ADMIN_SESS)
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("snap_locked")
})

test("POST /api/transcripts (transcript->Sim create/enrich) is 402 snap_locked once Snap-locked", async () => {
  const r = await createTranscript(ADMIN_SESS)
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("snap_locked")
})

test("POST /api/projects/:id/sim-matches/:mid/confirm is 402 snap_locked once Snap-locked", async () => {
  const r = await confirmSimMatch(ADMIN_SESS)
  expect(r.status).toBe(402)
  const body = await r.json()
  expect(body.code).toBe("snap_locked")
})

test("a ticket/Snap read endpoint is NOT gated by the Snap lock", async () => {
  const r = await getTickets(ADMIN_SESS)
  expect(r.status).toBe(200)
})

test("clearing the override restores access", async () => {
  const clear = await postPlan(null, ADMIN_SESS)
  expect(clear.status).toBe(200)
  const body = await clear.json()
  expect(body.project.planOverride).toBe(null)

  const r = await createSim(ADMIN_SESS)
  expect(r.status).toBe(201)
})
