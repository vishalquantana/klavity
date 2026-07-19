// First-class member invite + invite visibility (JTBD 6.4 / KLAVITYKLA-294).
// Hermetic: spawns the real server against a temp file DB. Covers the full lifecycle —
// invite creates a durable PENDING record (+ email dispatched), list shows pending, resend
// re-sends (bumps last_sent_at), login accepts (pending→accepted, invited role preserved),
// and revoke removes a pending invite. Also asserts admin-only authz on resend/revoke.
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-member-invite-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(41)).toString("base64")

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `mi-owner-${RUN}@test.local`
const MEMBER = `mi-member-${RUN}@test.local` // an existing plain member (non-admin) → authz checks
const INVITEE_A = `mi-invitee-a-${RUN}@test.local` // invited as admin → accept → role preserved
const INVITEE_B = `mi-invitee-b-${RUN}@test.local` // invited as member → resend → revoke
const SID = `sess_miowner_${RUN}`
const MEMBER_SID = `sess_mimember_${RUN}`
const ACCT = `acct_mi_${RUN}`
const PROJ = `proj_mi_${RUN}`
const NOW = Date.now()

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""

async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }
function auth(sid: string) { return { "content-type": "application/json", cookie: `klav_session=${sid}` } }

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
      KLAV_DEV_SHOW_OTP: "1",
      // A dummy key makes the invite email path "dispatch" (emailSent:true); the fire-and-forget
      // SendGrid fetch fails and is swallowed, so no real network dependency.
      SENDGRID_API_KEY: "SG.dummy-test-key",
      KLAV_MAIL_FROM: "klav@test.local",
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
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [MEMBER_SID, MEMBER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Invite Test", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_owner_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_member_${RUN}`, ACCT, MEMBER, "member", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Invite Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_owner_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_member_${RUN}`, PROJ, MEMBER, "member", OWNER, NOW])
})

afterAll(() => { try { proc?.kill() } catch {} rmDb() })

async function login(email: string): Promise<string> {
  const reqR = await fetch(`${BASE}/api/auth/request`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) })
  const reqJ = await reqR.json() as any
  expect(reqJ.devCode).toBeTruthy()
  const verR = await fetch(`${BASE}/api/auth/verify`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, code: reqJ.devCode }) })
  expect(verR.status).toBe(200)
  const setCookie = verR.headers.get("set-cookie") || ""
  const m = setCookie.match(/klav_session=([^;]+)/)
  return m ? m[1] : ""
}

async function pendingRow(email: string): Promise<any | null> {
  const r = await raw.execute({ sql: "SELECT * FROM ticket_assignment_invites WHERE project_id=? AND email=?", args: [PROJ, email] })
  return r.rows[0] ?? null
}

test("invite creates a durable pending record + dispatches an email", async () => {
  const r = await fetch(`${BASE}/api/team/invite`, { method: "POST", headers: auth(SID), body: JSON.stringify({ email: INVITEE_A, role: "admin" }) })
  expect(r.status).toBe(200)
  const j = await r.json() as any
  expect(j.ok).toBe(true)
  expect(j.invite.status).toBe("pending")
  expect(j.invite.role).toBe("admin")
  expect(j.emailSent).toBe(true)

  // Durable pending record exists in the invite-lifecycle table...
  const row = await pendingRow(INVITEE_A)
  expect(row).not.toBeNull()
  expect(String(row.status)).toBe("pending")
  expect(String(row.invited_by)).toBe(OWNER)
  expect(row.last_sent_at).toBeGreaterThan(0)
  // ...and a durable membership row carrying the invited ROLE + inviter.
  const pm = await raw.execute({ sql: "SELECT * FROM project_members WHERE project_id=? AND email=?", args: [PROJ, INVITEE_A] })
  expect(pm.rows.length).toBe(1)
  expect(String((pm.rows[0] as any).project_role)).toBe("admin")
})

test("list shows the invite as pending, with inviter + invited_at", async () => {
  const r = await fetch(`${BASE}/api/team/invites?project=${encodeURIComponent(PROJ)}`, { headers: auth(SID) })
  expect(r.status).toBe(200)
  const j = await r.json() as any
  const inv = j.invites.find((x: any) => x.email === INVITEE_A)
  expect(inv).toBeTruthy()
  expect(inv.status).toBe("pending")
  expect(inv.role).toBe("admin")
  expect(inv.invitedBy).toBe(OWNER)
  expect(inv.invitedAt).toBeGreaterThan(0)
  expect(inv.acceptedAt).toBeNull()
  // Owner + seeded member are 'accepted' (active, no pending invite row).
  const owner = j.invites.find((x: any) => x.email === OWNER)
  expect(owner.status).toBe("accepted")
})

test("resend re-sends and bumps last_sent_at", async () => {
  const before = await pendingRow(INVITEE_A)
  await Bun.sleep(8)
  const r = await fetch(`${BASE}/api/team/invite/resend`, { method: "POST", headers: auth(SID), body: JSON.stringify({ email: INVITEE_A, project: PROJ }) })
  expect(r.status).toBe(200)
  const j = await r.json() as any
  expect(j.ok).toBe(true)
  expect(j.emailSent).toBe(true)
  const after = await pendingRow(INVITEE_A)
  expect(Number(after.last_sent_at)).toBeGreaterThan(Number(before.last_sent_at))
  expect(String(after.status)).toBe("pending")
})

test("accepting the invite on login flips pending→accepted and preserves the invited role", async () => {
  await login(INVITEE_A) // triggers acceptPendingTicketAssignmentInvites
  const row = await pendingRow(INVITEE_A)
  expect(String(row.status)).toBe("accepted")
  expect(Number(row.accepted_at)).toBeGreaterThan(0)

  const r = await fetch(`${BASE}/api/team/invites?project=${encodeURIComponent(PROJ)}`, { headers: auth(SID) })
  const j = await r.json() as any
  const inv = j.invites.find((x: any) => x.email === INVITEE_A)
  expect(inv.status).toBe("accepted")
  expect(inv.role).toBe("admin") // invited as admin, NOT downgraded to member on accept
  expect(inv.acceptedAt).toBeGreaterThan(0)
})

test("revoke removes a still-pending invite from the roster", async () => {
  // Invite a fresh person as member...
  const inv = await fetch(`${BASE}/api/team/invite`, { method: "POST", headers: auth(SID), body: JSON.stringify({ email: INVITEE_B, role: "member" }) })
  expect(inv.status).toBe(200)
  expect((await inv.json() as any).invite.status).toBe("pending")

  // ...then revoke it.
  const rev = await fetch(`${BASE}/api/team/invite/revoke`, { method: "POST", headers: auth(SID), body: JSON.stringify({ email: INVITEE_B, project: PROJ }) })
  expect(rev.status).toBe(200)
  const revJ = await rev.json() as any
  expect(revJ.ok).toBe(true)
  expect(revJ.invites.find((x: any) => x.email === INVITEE_B)).toBeUndefined()

  // Both the lifecycle row AND the (unaccepted) membership row are gone.
  expect(await pendingRow(INVITEE_B)).toBeNull()
  const pm = await raw.execute({ sql: "SELECT * FROM project_members WHERE project_id=? AND email=?", args: [PROJ, INVITEE_B] })
  expect(pm.rows.length).toBe(0)
})

test("revoke of a non-pending / unknown email is a 404 no-op", async () => {
  const r = await fetch(`${BASE}/api/team/invite/revoke`, { method: "POST", headers: auth(SID), body: JSON.stringify({ email: `nobody-${RUN}@test.local`, project: PROJ }) })
  expect(r.status).toBe(404)
})

test("resend + revoke are admin-only", async () => {
  // Re-create a pending invite to act on.
  await fetch(`${BASE}/api/team/invite`, { method: "POST", headers: auth(SID), body: JSON.stringify({ email: INVITEE_B, role: "member" }) })
  const resend = await fetch(`${BASE}/api/team/invite/resend`, { method: "POST", headers: auth(MEMBER_SID), body: JSON.stringify({ email: INVITEE_B, project: PROJ }) })
  expect(resend.status).toBe(403)
  const revoke = await fetch(`${BASE}/api/team/invite/revoke`, { method: "POST", headers: auth(MEMBER_SID), body: JSON.stringify({ email: INVITEE_B, project: PROJ }) })
  expect(revoke.status).toBe(403)
  // Non-admin can still SEE the roster (visibility is not admin-gated).
  const list = await fetch(`${BASE}/api/team/invites?project=${encodeURIComponent(PROJ)}`, { headers: auth(MEMBER_SID) })
  expect(list.status).toBe(200)
})
