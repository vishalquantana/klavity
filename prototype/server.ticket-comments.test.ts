import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-ticket-comments-route-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `ticket-comments-${RUN}@test.local`
const OUTSIDE = `ticket-comments-outside-${RUN}@test.local`
const SID = `sess_ticket_comments_${RUN}`
const OUTSIDE_SID = `sess_ticket_comments_outside_${RUN}`
const ACCT = `acct_ticket_comments_${RUN}`
const PROJ = `proj_ticket_comments_${RUN}`
const FID = `fb_ticket_comments_${RUN}`
const NOW = Date.now()

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

beforeAll(async () => {
  const port = 46600 + Math.floor(Math.random() * 300)
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
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Ticket Comments", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Ticket Comments Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", [FID, PROJ, "Checkout does not submit", "medium", "new", NOW])
  await exec("INSERT INTO ticket_exports (id, feedback_id, project_id, connector_id, type, external_key, external_url, status, error, created_at, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?)", [`exp_${RUN}`, FID, PROJ, "conn_1", "github", "GH-12", "https://github.test/issues/12", "ok", null, NOW + 3000, OWNER])
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

test("POST and GET /api/feedback/:id/comments", async () => {
  const posted = await req("POST", `/api/feedback/${FID}/comments`, { body: "I can reproduce this on staging." })
  expect(posted.status).toBe(201)
  const { comment } = await posted.json()
  expect(comment).toMatchObject({ feedbackId: FID, author: OWNER, body: "I can reproduce this on staging." })

  const listed = await req("GET", `/api/feedback/${FID}/comments`)
  expect(listed.status).toBe(200)
  const body = await listed.json()
  expect(body.comments.some((c: any) => c.id === comment.id && c.body.includes("staging"))).toBe(true)
})

test("GET /api/feedback/:id/timeline merges comments, patch activity, and connector export events", async () => {
  const patch = await req("PATCH", `/api/feedback/${FID}`, { status: "open", priority: "high" })
  expect(patch.status).toBe(200)

  const timeline = await req("GET", `/api/feedback/${FID}/timeline`)
  expect(timeline.status).toBe(200)
  const { items } = await timeline.json()
  expect(items.some((i: any) => i.kind === "comment" && i.body.includes("staging"))).toBe(true)
  expect(items.some((i: any) => i.kind === "activity" && i.type === "ticket_status_changed" && i.meta.to === "open")).toBe(true)
  expect(items.some((i: any) => i.kind === "activity" && i.type === "ticket_priority_changed" && i.meta.to === "high")).toBe(true)
  expect(items.some((i: any) => i.kind === "ticket_export" && i.meta.connectorType === "github" && i.meta.externalKey === "GH-12")).toBe(true)
})

test("ticket comments are project-scoped through feedback access", async () => {
  const r = await req("GET", `/api/feedback/${FID}/comments`, undefined, OUTSIDE_SID)
  expect(r.status).toBe(404)
})
