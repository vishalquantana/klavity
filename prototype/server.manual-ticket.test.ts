import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-manual-ticket-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(55)).toString("base64")

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `mt-owner-${RUN}@test.local`
const MEMBER = `mt-member-${RUN}@test.local`
const OUTSIDE = `mt-outside-${RUN}@test.local`
const SID = `sess_mt_${RUN}`
const MEM_SID = `sess_mt_mem_${RUN}`
const OUTSIDE_SID = `sess_mt_out_${RUN}`
const ACCT = `acct_mt_${RUN}`
const PROJ = `proj_mt_${RUN}`
const NOW = Date.now()

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

beforeAll(async () => {
  const port = 47100 + Math.floor(Math.random() * 300)
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
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [MEMBER, NOW])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OUTSIDE, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [MEM_SID, MEMBER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [OUTSIDE_SID, OUTSIDE, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Manual Ticket Test", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Manual Ticket Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm2_${RUN}`, PROJ, MEMBER, "member", OWNER, NOW])
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

test("POST /api/projects/:id/tickets creates a manual ticket and returns 201", async () => {
  const r = await req("POST", `/api/projects/${PROJ}/tickets`, {
    title: "Payment fails on mobile",
    body: "Steps: open checkout, tap Pay, app crashes.",
    priority: "high",
    assignee: "dev@team.local",
  })
  expect(r.status).toBe(201)
  const d = await r.json()
  expect(d.ok).toBe(true)
  expect(typeof d.ticketId).toBe("string")
  expect(d.ticketId.startsWith("fb_")).toBe(true)
})

test("created ticket appears in GET /api/projects/:id/tickets with source=manual", async () => {
  await req("POST", `/api/projects/${PROJ}/tickets`, { title: "Listing ticket for source check", priority: "medium" })
  const r = await req("GET", `/api/projects/${PROJ}/tickets?source=manual`)
  expect(r.status).toBe(200)
  const { tickets } = await r.json()
  expect(tickets.length).toBeGreaterThanOrEqual(1)
  expect(tickets.every((t: any) => t.source === "manual")).toBe(true)
})

test("created ticket has status=open (skips triage queue)", async () => {
  const c = await req("POST", `/api/projects/${PROJ}/tickets`, { title: "Status check ticket", priority: "low" })
  expect(c.status).toBe(201)
  const { ticketId } = await c.json()
  const r = await req("GET", `/api/feedback/${ticketId}`)
  expect(r.status).toBe(200)
  const { report } = await r.json()
  expect(report.status).toBe("open")
})

test("POST /api/projects/:id/tickets rejects missing title", async () => {
  const r = await req("POST", `/api/projects/${PROJ}/tickets`, { body: "No title here" })
  expect(r.status).toBe(400)
  const d = await r.json()
  expect(d.error).toMatch(/title/i)
})

test("POST /api/projects/:id/tickets rejects outsiders with 403", async () => {
  const r = await req("POST", `/api/projects/${PROJ}/tickets`, { title: "Sneaky ticket" }, OUTSIDE_SID)
  expect(r.status).toBe(403)
})

test("project members can create tickets too", async () => {
  const r = await req("POST", `/api/projects/${PROJ}/tickets`, { title: "Member ticket", priority: "medium" }, MEM_SID)
  expect(r.status).toBe(201)
})

test("source=manual filter excludes sim and widget tickets", async () => {
  // Insert a non-manual feedback row directly
  const fbId = `fb_nonmanual_${RUN}`
  await raw.execute({
    sql: "INSERT INTO feedback (id,project_id,observation,priority,status,created_at) VALUES (?,?,?,?,?,?)",
    args: [fbId, PROJ, "Widget report", "medium", "open", NOW + 1],
  })
  const r = await req("GET", `/api/projects/${PROJ}/tickets?source=manual`)
  expect(r.status).toBe(200)
  const { tickets } = await r.json()
  // The directly-inserted row (source=NULL) should NOT appear in manual filter
  expect(tickets.every((t: any) => t.source === "manual")).toBe(true)
})
