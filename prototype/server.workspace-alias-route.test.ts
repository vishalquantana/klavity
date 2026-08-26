// #728 Workspace-alias pretty permalink ROUTE test — GET /<slug>/t/<KEY>-<n>.
// Proves the new route reuses the SAME auth gate as /t/:ref (parity per persona), serves the fast
// member page with noindex, login-gates anon, 404s a signed-in non-member (no-leak), keeps the
// opaque /t/<fb_id> + /<slug>/t/<fb_id> fallbacks working, and that a RESERVED slug never shadows a
// real route. share_mode='off' makes the project members-only so the gate branches are exercised.
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-wsalias-route-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `wsa-owner-${RUN}@test.local`
const MEMBER = `wsa-member-${RUN}@test.local`
const OUTSIDE = `wsa-out-${RUN}@test.local`
const SID = `sess_wsa_${RUN}`
const MEMBER_SID = `sess_wsa_m_${RUN}`
const OUTSIDE_SID = `sess_wsa_o_${RUN}`
const ACCT = `acct_wsa_${RUN}`
const PROJ = `proj_wsa_${RUN}`
const FID = `fb_${crypto.randomUUID()}` // must be a real fb_<uuid> so the opaque resolver accepts it
const SLUG = `acme-${RUN}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-").slice(0, 38)
const KEY = "KLAV"
const NOW = Date.now()

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

beforeAll(async () => {
  const port = 47200 + Math.floor(Math.random() * 300)
  BASE = `http://localhost:${port}`
  proc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
    },
    stdout: "ignore", stderr: "ignore",
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
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [MEMBER_SID, MEMBER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [OUTSIDE_SID, OUTSIDE, NOW, NOW + 86400_000])
  // Account WITH a claimed slug; members-only project (share_mode='off') keyed KLAV; ticket seq_num=1.
  await exec("INSERT INTO accounts (id, name, owner_email, slug, display_slug, created_at) VALUES (?, ?, ?, ?, ?, ?)", [ACCT, "Acme", OWNER, SLUG, SLUG, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, ticket_key, share_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Klavity", "active", "auto", 200, "named", KEY, "off", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_m_${RUN}`, PROJ, MEMBER, "member", null, NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, seq_num, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [FID, PROJ, "Payment fails on mobile Safari", "high", "open", 1, NOW])
})

afterAll(() => { proc?.kill(); raw.close(); rmDb() })

function get(path: string, sid?: string) {
  return fetch(`${BASE}${path}`, {
    method: "GET", redirect: "manual",
    headers: sid ? { Cookie: `klav_session=${sid}` } : {},
  })
}

const PRETTY = `/${SLUG}/t/${KEY}-1`
const OPAQUE = `/t/${FID}`

test("member: pretty permalink serves the fast member ticket page (200 + noindex)", async () => {
  const r = await get(PRETTY, SID)
  expect(r.status).toBe(200)
  expect(r.headers.get("x-robots-tag")).toBe("noindex, nofollow")
  const html = await r.text()
  // ticket.html has __TICKET_ID__/__PROJECT_ID__ substituted with the resolved ids.
  expect(html).toContain(FID)
  expect(html).toContain(PROJ)
})

test("parity with /t/:ref: each persona gets the SAME status from pretty and opaque routes", async () => {
  for (const sid of [SID, MEMBER_SID, OUTSIDE_SID, undefined]) {
    const pretty = await get(PRETTY, sid)
    const opaque = await get(OPAQUE, sid)
    expect(pretty.status).toBe(opaque.status) // proves the pretty route reuses the /t auth gate
  }
})

test("anon is login-gated (redirect to /login), not served the ticket", async () => {
  const r = await get(PRETTY)
  expect([301, 302, 303, 307, 308]).toContain(r.status)
  expect(r.headers.get("location") || "").toContain("/login")
})

test("signed-in non-member gets 404 (no membership leak), same as /t/:ref", async () => {
  const r = await get(PRETTY, OUTSIDE_SID)
  expect(r.status).toBe(404)
})

test("opaque fallback under a slug segment still resolves: /<slug>/t/<fb_id>", async () => {
  const member = await get(`/${SLUG}/t/${FID}`, SID)
  expect(member.status).toBe(200)
  expect(await member.text()).toContain(FID)
})

test("opaque /t/<fb_id> permalink is untouched (regression)", async () => {
  const r = await get(OPAQUE, SID)
  expect(r.status).toBe(200)
  expect(await r.text()).toContain(FID)
})

test("reserved slug does NOT shadow: /dashboard/t/KLAV-1 is never served as our ticket", async () => {
  // 'dashboard' is reserved → the pretty matcher is skipped; the request must NOT resolve to our
  // ticket page (it falls through to the real /dashboard route or a 404 — never our ticket.html).
  const r = await get(`/dashboard/t/${KEY}-1`, SID)
  const body = r.status === 200 ? await r.text() : ""
  expect(body.includes(FID)).toBe(false)
})

test("unknown seq under a valid slug/key → 404 (not another ticket)", async () => {
  const r = await get(`/${SLUG}/t/${KEY}-999`, SID)
  expect(r.status).toBe(404)
})
