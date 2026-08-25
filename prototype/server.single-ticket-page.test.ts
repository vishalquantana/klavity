// KLAVITYKLA-491 — fast, shareable single-ticket page + deep link.
// Covers: GET /t/:ref serves the standalone page for a member, 403 for a non-member,
// login-redirect when unauthenticated; the single-ticket API returns the enriched report
// (reporter + pageUrl) plus comments; ticketDeepLinkUrl deep links now point at /t/:ref.
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-single-ticket-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(43)).toString("base64")

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `single-ticket-${RUN}@test.local`
const OUTSIDE = `single-ticket-outside-${RUN}@test.local`
const SID = `sess_single_ticket_${RUN}`
const OUTSIDE_SID = `sess_single_ticket_outside_${RUN}`
const ACCT = `acct_single_ticket_${RUN}`
const PROJ = `proj_single_ticket_${RUN}`
// Real fb_<uuid> shape so both /t/:ref and the short-ref resolver accept it.
const UUID = crypto.randomUUID()
const FID = `fb_${UUID}`
const SHORT_REF = FID.split("-")[0] // fb_<8hex>
const REPORTER = `reporter-${RUN}@customer.example`
const NOW = Date.now()

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

beforeAll(async () => {
  const port = 46950 + Math.floor(Math.random() * 300)
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
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Single Ticket", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Single Ticket Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec(
    "INSERT INTO feedback (id, project_id, observation, priority, status, actor_email, url_host, url_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [FID, PROJ, "Checkout button does nothing", "high", "new", REPORTER, "app.example.com", "/checkout", NOW],
  )
})

afterAll(() => {
  proc?.kill()
  raw.close()
  rmDb()
})

function get(path: string, sid?: string, redirect: RequestRedirect = "manual") {
  const headers: Record<string, string> = {}
  if (sid) headers.Cookie = `klav_session=${sid}`
  return fetch(`${BASE}${path}`, { method: "GET", headers, redirect })
}

test("GET /t/:ref serves the standalone page (not the dashboard bundle) for a member", async () => {
  const r = await get(`/t/${FID}`, SID)
  expect(r.status).toBe(200)
  expect(r.headers.get("content-type") || "").toContain("text/html")
  const html = await r.text()
  // It is the lightweight ticket page, not the full dashboard SPA.
  expect(html).toContain("standalone single-ticket page")
  // The resolved full feedback id + project id are injected as JS string literals.
  expect(html).toContain(`"${FID}"`)
  expect(html).toContain(`"${PROJ}"`)
  // No leftover placeholders.
  expect(html).not.toContain("__TICKET_ID__")
  expect(html).not.toContain("__PROJECT_ID__")
})

test("GET /t/:ref also accepts the short quotable ref and resolves the full id", async () => {
  const r = await get(`/t/${SHORT_REF}`, SID)
  expect(r.status).toBe(200)
  const html = await r.text()
  expect(html).toContain(`"${FID}"`)
})

test("GET /t/:ref serves the teaser (not a 403) for a logged-in non-member under default share_mode", async () => {
  const r = await get(`/t/${FID}`, OUTSIDE_SID)
  expect(r.status).toBe(200)
  expect(await r.text()).toContain("shared-ticket teaser page")
})

test("GET /t/:ref serves the teaser to an unauthenticated visitor under default share_mode", async () => {
  const r = await get(`/t/${FID}`)
  expect(r.status).toBe(200)
  expect(await r.text()).toContain("shared-ticket teaser page")
})

test("GET /t/:ref 404s an unknown ref without leaking existence", async () => {
  const r = await get(`/t/fb_00000000`, SID)
  expect(r.status).toBe(404)
})

test("single-ticket API returns the enriched report (reporter + pageUrl) for a member", async () => {
  const r = await get(`/api/feedback/${FID}`, SID)
  expect(r.status).toBe(200)
  const { report } = await r.json()
  expect(report.id).toBe(FID)
  expect(report.reporterEmail).toBe(REPORTER)
  expect(report.pageUrl).toContain("/checkout")
  expect(report.ref).toBe(SHORT_REF)
})

test("single-ticket comments API round-trips a comment for a member", async () => {
  const posted = await fetch(`${BASE}/api/feedback/${FID}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: `klav_session=${SID}` },
    body: JSON.stringify({ body: "Repro'd on the fast page." }),
  })
  expect(posted.status).toBe(201)
  const listed = await get(`/api/feedback/${FID}/comments`, SID)
  expect(listed.status).toBe(200)
  const { comments } = await listed.json()
  expect(comments.some((c: any) => c.body.includes("fast page"))).toBe(true)
})

test("single-ticket API is member-gated (404 for a non-member)", async () => {
  const r = await get(`/api/feedback/${FID}`, OUTSIDE_SID)
  expect(r.status).toBe(404)
})
