import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-ticket-bulk-${RUN}.db`)
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

const OWNER = `bulk-owner-${RUN}@test.local`
const OUTSIDER = `bulk-out-${RUN}@test.local`
const SID_OWNER = `sess_bulk_owner_${RUN}`
const SID_OUT = `sess_bulk_out_${RUN}`
const ACCT = `acct_bulk_${RUN}`
const PROJ = `proj_bulk_${RUN}`
const OTHER_PROJ = `proj_bulk_other_${RUN}`
const FID_A = `fb_bulk_a_${RUN}`
const FID_B = `fb_bulk_b_${RUN}`
const FID_FOREIGN = `fb_bulk_foreign_${RUN}`
const LABEL = `lbl_bulk_${RUN}`
const NOW = Date.now()

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

beforeAll(async () => {
  const port = 47200 + Math.floor(Math.random() * 300)
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
  const deadline = Date.now() + 12_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }

  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OUTSIDER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID_OWNER, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID_OUT, OUTSIDER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Bulk Test", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_bulk_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Bulk Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [OTHER_PROJ, ACCT, "Other Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_bulk_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", [FID_A, PROJ, "First bulk ticket", "high", "open", NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", [FID_B, PROJ, "Second bulk ticket", "medium", "open", NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", [FID_FOREIGN, OTHER_PROJ, "Foreign ticket", "urgent", "open", NOW])
  await exec("INSERT INTO labels (id, project_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)", [LABEL, PROJ, "Bug", "#ef4444", NOW])
})

afterAll(() => {
  proc?.kill()
  raw.close()
  rmDb()
})

function req(method: string, path: string, body?: any, sid = SID_OWNER) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: `klav_session=${sid}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

test("PATCH /api/projects/:id/tickets/bulk updates status, priority, assignee, and labels", async () => {
  const assignee = `bulk-assignee-${RUN}@external.example`
  const r = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, {
    ticketIds: [FID_A, FID_B, FID_FOREIGN],
    status: "done",
    priority: "low",
    assignee,
    addLabelId: LABEL,
  })
  expect(r.status).toBe(200)
  expect(await r.json()).toMatchObject({ ok: true, updated: 2 })

  const rows = await raw.execute({
    sql: "SELECT id, status, priority, assignee FROM feedback WHERE id IN (?, ?, ?) ORDER BY id",
    args: [FID_A, FID_B, FID_FOREIGN],
  })
  const byId = Object.fromEntries(rows.rows.map((row: any) => [row.id, row]))
  expect(byId[FID_A]).toMatchObject({ status: "done", priority: "low", assignee })
  expect(byId[FID_B]).toMatchObject({ status: "done", priority: "low", assignee })
  expect(byId[FID_FOREIGN]).toMatchObject({ status: "open", priority: "urgent", assignee: null })

  const labelRows = await raw.execute({
    sql: "SELECT feedback_id FROM ticket_labels WHERE label_id=? ORDER BY feedback_id",
    args: [LABEL],
  })
  expect(labelRows.rows.map((row: any) => row.feedback_id)).toEqual([FID_A, FID_B])

  const invite = await raw.execute({
    sql: "SELECT project_id, email, status FROM ticket_assignment_invites WHERE project_id=? AND email=?",
    args: [PROJ, assignee],
  })
  expect(invite.rows).toHaveLength(1)
  expect((invite.rows[0] as any).status).toBe("pending")
})

test("PATCH /api/projects/:id/tickets/bulk clears assignee and removes labels", async () => {
  const r = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, {
    ticketIds: [FID_A, FID_B],
    assignee: null,
    removeLabelId: LABEL,
  })
  expect(r.status).toBe(200)
  expect(await r.json()).toMatchObject({ ok: true, updated: 2 })

  const rows = await raw.execute({
    sql: "SELECT assignee FROM feedback WHERE id IN (?, ?)",
    args: [FID_A, FID_B],
  })
  expect(rows.rows.every((row: any) => row.assignee == null)).toBe(true)

  const labelRows = await raw.execute({
    sql: "SELECT feedback_id FROM ticket_labels WHERE label_id=?",
    args: [LABEL],
  })
  expect(labelRows.rows).toHaveLength(0)
})

test("PATCH /api/projects/:id/tickets/bulk validates assignee and access", async () => {
  const bad = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, {
    ticketIds: [FID_A],
    assignee: "not-an-email",
  })
  expect(bad.status).toBe(400)

  const outsider = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, {
    ticketIds: [FID_A],
    status: "open",
  }, SID_OUT)
  expect(outsider.status).toBe(403)
})
