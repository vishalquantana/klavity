import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-ticket-labels-${RUN}.db`)
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

const OWNER = `lbl-owner-${RUN}@test.local`
const MEMBER = `lbl-member-${RUN}@test.local`
const OUTSIDER = `lbl-out-${RUN}@test.local`
const SID_OWNER = `sess_lblowner_${RUN}`
const SID_MEMBER = `sess_lblmember_${RUN}`
const SID_OUT = `sess_lblout_${RUN}`
const ACCT = `acct_lbl_${RUN}`
const PROJ = `proj_lbl_${RUN}`
const OTHER_PROJ = `proj_lbl_other_${RUN}`
const FID = `fb_lbl_${RUN}`
const FID2 = `fb_lbl2_${RUN}`   // JTBD 2.16: a second (unlabeled) ticket in the same project, to prove the label filter excludes it.
const OTHER_FID = `fb_lbl_other_${RUN}`
const OTHER_LABEL = `lbl_other_${RUN}`
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
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Label Test", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_own_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Label Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [OTHER_PROJ, ACCT, "Other Label Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_own_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_mem_${RUN}`, PROJ, MEMBER, "member", null, NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", [FID, PROJ, "Payment fails on checkout", "high", "open", NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", [FID2, PROJ, "Unlabeled ticket in same project", "medium", "open", NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)", [OTHER_FID, OTHER_PROJ, "Other project ticket", "medium", "open", NOW])
  await exec("INSERT INTO labels (id, project_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)", [OTHER_LABEL, OTHER_PROJ, "Other", "#22c55e", NOW])
  await exec("INSERT INTO ticket_labels (label_id, feedback_id, created_at) VALUES (?, ?, ?)", [OTHER_LABEL, OTHER_FID, NOW])
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

// ── Label CRUD ─────────────────────────────────────────────────────────────────

let createdLabelId = ""

test("GET /api/projects/:id/labels returns empty list initially", async () => {
  const r = await req("GET", `/api/projects/${PROJ}/labels`)
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(Array.isArray(d.labels)).toBe(true)
  expect(d.labels.length).toBe(0)
})

test("POST /api/projects/:id/labels creates label (admin)", async () => {
  const r = await req("POST", `/api/projects/${PROJ}/labels`, { name: "Bug", color: "#ef4444" })
  expect(r.status).toBe(201)
  const d = await r.json()
  expect(d.label.name).toBe("Bug")
  expect(d.label.color).toBe("#ef4444")
  expect(typeof d.label.id).toBe("string")
  createdLabelId = d.label.id
})

test("POST /api/projects/:id/labels is forbidden for members", async () => {
  const r = await req("POST", `/api/projects/${PROJ}/labels`, { name: "Feature" }, SID_MEMBER)
  expect(r.status).toBe(403)
})

test("POST /api/projects/:id/labels rejects missing name", async () => {
  const r = await req("POST", `/api/projects/${PROJ}/labels`, { color: "#333" })
  expect(r.status).toBe(400)
})

test("GET /api/projects/:id/labels lists created label", async () => {
  const r = await req("GET", `/api/projects/${PROJ}/labels`)
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.labels.some((l: any) => l.id === createdLabelId && l.name === "Bug")).toBe(true)
})

test("PATCH /api/projects/:id/labels/:lid updates label", async () => {
  const r = await req("PATCH", `/api/projects/${PROJ}/labels/${createdLabelId}`, { name: "Bug Report", color: "#f97316" })
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.ok).toBe(true)
  // Verify updated
  const r2 = await req("GET", `/api/projects/${PROJ}/labels`)
  const d2 = await r2.json()
  const updated = d2.labels.find((l: any) => l.id === createdLabelId)
  expect(updated.name).toBe("Bug Report")
  expect(updated.color).toBe("#f97316")
})

test("PATCH label returns 403 for member", async () => {
  const r = await req("PATCH", `/api/projects/${PROJ}/labels/${createdLabelId}`, { name: "X", color: "#000000" }, SID_MEMBER)
  expect(r.status).toBe(403)
})

// ── Attach / Detach ──────────────────────────────────────────────────────────

test("POST /api/feedback/:id/labels attaches label to ticket", async () => {
  const r = await req("POST", `/api/feedback/${FID}/labels`, { labelId: createdLabelId })
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.ok).toBe(true)
})

test("GET /api/feedback/:id/labels returns attached labels", async () => {
  const r = await req("GET", `/api/feedback/${FID}/labels`)
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(Array.isArray(d.labels)).toBe(true)
  expect(d.labels.some((l: any) => l.id === createdLabelId)).toBe(true)
})

test("GET /api/feedback/:id includes labels", async () => {
  const r = await req("GET", `/api/feedback/${FID}`)
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(Array.isArray(d.report.labels)).toBe(true)
  expect(d.report.labels.some((l: any) => l.id === createdLabelId)).toBe(true)
})

test("GET /api/projects/:id/tickets includes labels per ticket", async () => {
  const r = await req("GET", `/api/projects/${PROJ}/tickets`)
  expect(r.status).toBe(200)
  const d = await r.json()
  const ticket = d.tickets.find((t: any) => t.id === FID)
  expect(ticket).toBeTruthy()
  expect(Array.isArray(ticket.labels)).toBe(true)
  expect(ticket.labels.some((l: any) => l.id === createdLabelId)).toBe(true)
})

// JTBD 2.16: filtering by a label returns only tickets carrying it. FID has createdLabelId
// attached; FID2 (same project) has no label and must be excluded.
test("GET /api/projects/:id/tickets?label=:lid returns only tickets carrying that label", async () => {
  // Sanity: without the filter, both project tickets are present.
  const all = await (await req("GET", `/api/projects/${PROJ}/tickets`)).json()
  const allIds = all.tickets.map((t: any) => t.id)
  expect(allIds).toContain(FID)
  expect(allIds).toContain(FID2)

  const r = await req("GET", `/api/projects/${PROJ}/tickets?label=${encodeURIComponent(createdLabelId)}`)
  expect(r.status).toBe(200)
  const d = await r.json()
  const ids = d.tickets.map((t: any) => t.id)
  expect(ids).toContain(FID)
  expect(ids).not.toContain(FID2)
  // total reflects the filtered set (drives pagination), not the whole project.
  expect(d.total).toBe(1)
})

// JTBD 2.16: a label from another project can never match this project's tickets (tenant scoping).
test("GET /api/projects/:id/tickets?label=<foreign label> matches nothing in this project", async () => {
  const r = await req("GET", `/api/projects/${PROJ}/tickets?label=${encodeURIComponent(OTHER_LABEL)}`)
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.tickets.length).toBe(0)
  expect(d.total).toBe(0)
})

test("POST /api/feedback/:id/labels rejects label from different project", async () => {
  const r = await req("POST", `/api/feedback/${FID}/labels`, { labelId: "lbl_nonexistent_xyz" })
  expect(r.status).toBe(404)
})

test("DELETE /api/feedback/:id/labels/:lid detaches label", async () => {
  const r = await req("DELETE", `/api/feedback/${FID}/labels/${createdLabelId}`)
  expect(r.status).toBe(200)
  const d = await r.json()
  expect(d.ok).toBe(true)
  // Verify detached
  const r2 = await req("GET", `/api/feedback/${FID}/labels`)
  const d2 = await r2.json()
  expect(d2.labels.some((l: any) => l.id === createdLabelId)).toBe(false)
})

test("DELETE /api/projects/:id/labels/:lid also removes ticket_labels rows", async () => {
  // Re-attach first
  await req("POST", `/api/feedback/${FID}/labels`, { labelId: createdLabelId })
  // Delete the label
  const r = await req("DELETE", `/api/projects/${PROJ}/labels/${createdLabelId}`)
  expect(r.status).toBe(200)
  // The ticket should no longer have the label
  const r2 = await req("GET", `/api/feedback/${FID}/labels`)
  const d2 = await r2.json()
  expect(d2.labels.some((l: any) => l.id === createdLabelId)).toBe(false)
})

test("DELETE /api/projects/:id/labels/:lid rejects foreign labels without deleting their associations", async () => {
  const r = await req("DELETE", `/api/projects/${PROJ}/labels/${OTHER_LABEL}`)
  expect(r.status).toBe(404)

  const label = await raw.execute({ sql: "SELECT id FROM labels WHERE id=? AND project_id=?", args: [OTHER_LABEL, OTHER_PROJ] })
  expect(label.rows).toHaveLength(1)

  const association = await raw.execute({ sql: "SELECT label_id, feedback_id FROM ticket_labels WHERE label_id=? AND feedback_id=?", args: [OTHER_LABEL, OTHER_FID] })
  expect(association.rows).toHaveLength(1)
})

test("outsider cannot read project labels", async () => {
  const r = await req("GET", `/api/projects/${PROJ}/labels`, undefined, SID_OUT)
  expect(r.status).toBe(403)
})
