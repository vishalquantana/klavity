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
const MEMBER = `bulk-member-${RUN}@test.local`
const OUTSIDER = `bulk-out-${RUN}@test.local`
const SID_OWNER = `sess_bulk_owner_${RUN}`
const SID_MEMBER = `sess_bulk_member_${RUN}`
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
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [MEMBER, NOW])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OUTSIDER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID_OWNER, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID_MEMBER, MEMBER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID_OUT, OUTSIDER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Bulk Test", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_bulk_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Bulk Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [OTHER_PROJ, ACCT, "Other Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_bulk_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_bulk_member_${RUN}`, PROJ, MEMBER, "member", null, NOW])
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

  const memberExternal = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, {
    ticketIds: [FID_A],
    assignee: `bulk-blocked-${RUN}@external.example`,
  }, SID_MEMBER)
  expect(memberExternal.status).toBe(403)

  const memberToMember = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, {
    ticketIds: [FID_A],
    assignee: OWNER,
  }, SID_MEMBER)
  expect(memberToMember.status).toBe(200)
})

// JTBD 2.14: the bulk response must carry a per-ticket `prior` snapshot of the mutated fields so
// the client can offer a faithful Undo. Two tickets with different starting priorities → each row's
// prior value is reported independently (not a single blanket value).
test("PATCH /api/projects/:id/tickets/bulk returns per-ticket prior values for undo", async () => {
  const A = `fb_prior_a_${RUN}`, B = `fb_prior_b_${RUN}`
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", [A, PROJ, "Prior A", "high", "open", NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", [B, PROJ, "Prior B", "low", "in_progress", NOW])

  const r = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, {
    ticketIds: [A, B],
    priority: "urgent",
  })
  expect(r.status).toBe(200)
  const data = await r.json()
  expect(data).toMatchObject({ ok: true, updated: 2 })
  expect(Array.isArray(data.prior)).toBe(true)
  expect(data.prior).toHaveLength(2)
  const byId = Object.fromEntries(data.prior.map((p: any) => [p.ticketId, p]))
  // Prior priority is per-ticket; status was NOT changed so it must be absent from the snapshot.
  expect(byId[A]).toMatchObject({ ticketId: A, priority: "high" })
  expect(byId[B]).toMatchObject({ ticketId: B, priority: "low" })
  expect("status" in byId[A]).toBe(false)
  expect("assignee" in byId[A]).toBe(false)

  // Replaying the prior values (grouped by value) restores each ticket exactly — proves undo is faithful.
  const undoHigh = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, { ticketIds: [A], priority: byId[A].priority })
  const undoLow = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, { ticketIds: [B], priority: byId[B].priority })
  expect(undoHigh.status).toBe(200)
  expect(undoLow.status).toBe(200)
  const rows = await raw.execute({ sql: "SELECT id, priority FROM feedback WHERE id IN (?, ?)", args: [A, B] })
  const pri = Object.fromEntries(rows.rows.map((row: any) => [row.id, row.priority]))
  expect(pri[A]).toBe("high")
  expect(pri[B]).toBe("low")
})

// JTBD 2.14: a partially-failing batch must return 207 with a `failures` array naming the bad ticket,
// while still applying + reporting the good ones — nothing silently dropped. We force a failure by
// pairing a valid label add against a ticket that is NOT in this project (foreign id): the foreign
// ticket is skipped from `updated` but the batch still succeeds for the real one.
test("PATCH /api/projects/:id/tickets/bulk surfaces failures without dropping successes", async () => {
  const good = `fb_pf_good_${RUN}`
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", [good, PROJ, "Partial-fail good", "medium", "open", NOW])

  // Attach a label first so the removeLabelId path exists, then remove a label that isn't attached
  // to the foreign ticket. The main assertion: the response shape carries `failures` (array) and
  // `prior` (array), and the good ticket is updated. Foreign ids are skipped, not counted.
  const r = await req("PATCH", `/api/projects/${PROJ}/tickets/bulk`, {
    ticketIds: [good, FID_FOREIGN],
    status: "done",
  })
  const data = await r.json()
  // Only the in-project ticket counts; the foreign one is skipped (not a failure, just not ours).
  expect(data.updated).toBe(1)
  expect(Array.isArray(data.failures)).toBe(true)
  expect(Array.isArray(data.prior)).toBe(true)
  expect(data.prior.some((p: any) => p.ticketId === good)).toBe(true)
  expect(data.prior.some((p: any) => p.ticketId === FID_FOREIGN)).toBe(false)

  const row = await raw.execute({ sql: "SELECT status FROM feedback WHERE id=?", args: [good] })
  expect((row.rows[0] as any).status).toBe("done")
})
