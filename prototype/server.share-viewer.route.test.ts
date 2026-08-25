// Shared-ticket viewer onboarding — adaptive /t/:ref + /api/t/:ref + unlock/verify + viewer comments.
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-share-viewer-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(43)).toString("base64")

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `owner-${RUN}@test.local`
const OWNER_SID = `sess_owner_${RUN}`
const STRANGER = `stranger-${RUN}@test.local`
const STRANGER_SID = `sess_stranger_${RUN}`
const GUEST = `vishal@quantana.com.au`
const ACCT = `acct_${RUN}`
const PROJ = `proj_${RUN}`
const UUID = crypto.randomUUID()
const FID = `fb_${UUID}`
const SHORT_REF = FID.split("-")[0]
const DESC = "PAYNOW_SECRET_DESCRIPTION_TEXT spins forever on checkout"
const SHOT = `shot_${RUN}`
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
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local,quantana.com.au",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      // Test-OTP bypass so /api/t/:ref/verify accepts the fixed code 666666 for the guest email.
      KLAV_TEST_OTP: "1",
      KLAV_TEST_OTP_EMAILS: GUEST,
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
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [STRANGER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [OWNER_SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [STRANGER_SID, STRANGER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Share Viewer", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Share Viewer Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO screenshots (id, project_id, s3_key, bucket, content_type, bytes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [SHOT, PROJ, "s3/secret-key.png", "kla-test", "image/png", 1234, NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, title, priority, status, source, screenshot_id, url_host, url_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [FID, PROJ, DESC, "Pay now spins forever", "high", "open", "widget", SHOT, "app.example.com", "/checkout", NOW])
})

afterAll(() => { proc?.kill(); raw.close(); rmDb() })

function get(path: string, sid?: string, redirect: RequestRedirect = "manual") {
  const headers: Record<string, string> = {}
  if (sid) headers.Cookie = `klav_session=${sid}`
  return fetch(`${BASE}${path}`, { method: "GET", headers, redirect })
}

test("SECURITY: teaser payload (no-access caller) exposes title/status but NEVER the description or screenshot token", async () => {
  const r = await get(`/api/t/${FID}`, STRANGER_SID) // signed-in non-member, default share_mode=teaser
  expect(r.status).toBe(200)
  const bodyText = await r.text()
  const body = JSON.parse(bodyText)
  expect(body.access).toBe("teaser")
  expect(body.ticket.title).toBe("Pay now spins forever")
  expect(body.ticket.status).toBe("open")
  expect(body.ticket.priority).toBe("high")
  expect(body.ticket.source).toBe("widget")
  // Redaction invariants — the raw HTTP body must contain none of these.
  expect(bodyText).not.toContain(DESC)
  expect(bodyText).not.toContain(SHOT)      // no screenshot id
  expect(bodyText).not.toContain("/img/")   // no signed image token
  expect(body.ticket.description).toBeUndefined()
  expect(body.ticket.screenshotUrl).toBeUndefined()
  expect(body.ticket.comments).toBeUndefined()
})

test("full payload (member) includes description + screenshotUrl + comments", async () => {
  const r = await get(`/api/t/${FID}`, OWNER_SID)
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.access).toBe("full")
  expect(body.ticket.description).toContain("spins forever")
  expect(body.ticket.screenshotUrl).toContain("/img/")
  expect(Array.isArray(body.ticket.comments)).toBe(true)
})

test("anon teaser payload is redacted the same way", async () => {
  const r = await get(`/api/t/${SHORT_REF}`) // no session, short ref
  expect(r.status).toBe(200)
  const bodyText = await r.text()
  expect(bodyText).not.toContain(DESC)
  expect(bodyText).not.toContain(SHOT)
})
