import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-ticket-detail-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `tkt-detail-${RUN}@test.local`
const OUTSIDE = `tkt-detail-out-${RUN}@test.local`
const SID = `sess_tktdetail_${RUN}`
const OUTSIDE_SID = `sess_tktdetail_out_${RUN}`
const ACCT = `acct_tktdetail_${RUN}`
const PROJ = `proj_tktdetail_${RUN}`
const FID = `fb_tktdetail_${RUN}`
const NOW = Date.now()

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

beforeAll(async () => {
  const port = 46900 + Math.floor(Math.random() * 300)
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

  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OUTSIDE, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [OUTSIDE_SID, OUTSIDE, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Detail Test", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Detail Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", [FID, PROJ, "Payment fails on mobile Safari", "high", "open", NOW])
})

afterAll(() => {
  proc?.kill()
  raw.close()
  rmDb()
})

function req(method: string, path: string, body?: any, sid = SID) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: `klav_session=${sid}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

test("GET /api/feedback/:id returns full ticket detail", async () => {
  const r = await req("GET", `/api/feedback/${FID}`)
  expect(r.status).toBe(200)
  const { report } = await r.json()
  expect(report).toMatchObject({
    id: FID,
    projectId: PROJ,
    priority: "high",
    status: "open",
    observation: "Payment fails on mobile Safari",
  })
  // KLA-171: required fields for the detail view
  expect(typeof report.title).toBe("string")
  expect(typeof report.createdAt).toBe("number")
})

test("GET /api/feedback/:id returns 404 for outsiders", async () => {
  const r = await req("GET", `/api/feedback/${FID}`, undefined, OUTSIDE_SID)
  expect(r.status).toBe(404)
})

test("GET /api/feedback/:id/timeline returns merged activity", async () => {
  // Add a comment so timeline is non-empty
  const c = await req("POST", `/api/feedback/${FID}/comments`, { body: "Confirmed on iOS 17." })
  expect(c.status).toBe(201)

  // Change status to generate an activity event
  const p = await req("PATCH", `/api/feedback/${FID}`, { status: "in_progress" })
  expect(p.status).toBe(200)

  const r = await req("GET", `/api/feedback/${FID}/timeline`)
  expect(r.status).toBe(200)
  const { items } = await r.json()
  expect(items.some((i: any) => i.kind === "comment")).toBe(true)
  expect(items.some((i: any) => i.kind === "activity" && i.type === "ticket_status_changed")).toBe(true)
  // Items should be in chronological order
  for (let i = 1; i < items.length; i++) {
    expect(items[i].createdAt).toBeGreaterThanOrEqual(items[i - 1].createdAt)
  }
})

test("GET /api/feedback/:id/timeline returns 404 for outsiders", async () => {
  const r = await req("GET", `/api/feedback/${FID}/timeline`, undefined, OUTSIDE_SID)
  expect(r.status).toBe(404)
})

test("PATCH /api/feedback/:id sets and clears assignee email", async () => {
  const assign = await req("PATCH", `/api/feedback/${FID}`, { assignee: "Assignee@Test.Local" })
  expect(assign.status).toBe(200)

  const detail = await req("GET", `/api/feedback/${FID}`)
  expect(detail.status).toBe(200)
  expect((await detail.json()).report.assignee).toBe("assignee@test.local")

  const bad = await req("PATCH", `/api/feedback/${FID}`, { assignee: "not-an-email" })
  expect(bad.status).toBe(400)

  const timeline = await req("GET", `/api/feedback/${FID}/timeline`)
  expect(timeline.status).toBe(200)
  const { items } = await timeline.json()
  expect(items.some((i: any) => i.kind === "activity" && i.type === "ticket_assignee_changed" && i.meta?.to === "assignee@test.local")).toBe(true)

  const clear = await req("PATCH", `/api/feedback/${FID}`, { assignee: null })
  expect(clear.status).toBe(200)
  const cleared = await req("GET", `/api/feedback/${FID}`)
  expect((await cleared.json()).report.assignee).toBeNull()
})

test("POST /api/feedback/:id/comments rejects empty body", async () => {
  const r = await req("POST", `/api/feedback/${FID}/comments`, { body: "   " })
  expect(r.status).toBe(400)
})
