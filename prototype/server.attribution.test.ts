// server.attribution.test.ts
// Integration tests for UTM first-touch attribution on /api/auth/verify.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"
import { createHash } from "node:crypto"

function sha256hex(s: string): string {
  return createHash("sha256").update(s).digest("hex")
}

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-attr-${RUN}.db`)
const EMAIL_NEW  = `attr-new-${RUN}@test.local`
const EMAIL_RTN  = `attr-rtn-${RUN}@test.local`
const SECRET = Buffer.from(new Uint8Array(32).fill(41)).toString("base64")
const PORT = 44200 + Math.floor(Math.random() * 300)
const BASE = `http://localhost:${PORT}`

function rmDb() {
  for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

let appProc: ReturnType<typeof Bun.spawn>

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

async function query(sql: string, args: any[] = []) {
  return (await raw.execute({ sql, args })).rows
}

function verify(email: string, code: string, attribution?: object) {
  return fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify({ email, code, ...(attribution ? { attribution } : {}) }),
  })
}

beforeAll(async () => {
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(PORT),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_TEST_OTP: "1",
      KLAV_TEST_OTP_EMAILS: `${EMAIL_NEW},${EMAIL_RTN}`,
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

  const NOW = Date.now()
  const ACCT = `acct_rtn_${RUN}`
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [EMAIL_RTN, NOW])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Rtn Workspace", EMAIL_RTN, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_rtn_${RUN}`, ACCT, EMAIL_RTN, "owner", NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [`sess_rtn_${RUN}`, EMAIL_RTN, NOW, NOW + 86400_000])
})

afterAll(() => {
  appProc?.kill()
  raw.close()
  rmDb()
})

test("attribution is stamped on the account row for a new signup", async () => {
  const r = await verify(EMAIL_NEW, "666666", {
    source: "reddit",
    medium: "post",
    campaign: "q2-launch",
    referrer: "https://reddit.com/r/SaaS",
    anonId: "anon-test-123",
  })
  expect(r.status).toBe(200)
  const rows = await query(
    "SELECT first_source, first_medium, first_campaign, first_referrer, anon_id FROM accounts WHERE owner_email=?",
    [EMAIL_NEW]
  )
  expect(rows.length).toBe(1)
  expect(rows[0].first_source).toBe("reddit")
  expect(rows[0].first_medium).toBe("post")
  expect(rows[0].first_campaign).toBe("q2-launch")
  expect(rows[0].first_referrer).toBe("https://reddit.com/r/SaaS")
  expect(rows[0].anon_id).toBe("anon-test-123")
})

test("attribution is NOT overwritten on a returning user login", async () => {
  const r = await verify(EMAIL_RTN, "666666", {
    source: "twitter",
    medium: "organic",
    campaign: "day2",
  })
  expect(r.status).toBe(200)
  const rows = await query("SELECT first_source FROM accounts WHERE owner_email=?", [EMAIL_RTN])
  expect(rows.length).toBe(1)
  expect(rows[0].first_source == null || rows[0].first_source === "").toBe(true)
})

test("verify succeeds with no attribution field", async () => {
  const NOW = Date.now()
  const email = `attr-noattr-${RUN}@test.local`
  await exec("INSERT INTO login_otps (email, code, expires_at, used) VALUES (?, ?, ?, ?)",
    [email, sha256hex("777777"), NOW + 300_000, 0])
  const r = await fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify({ email, code: "777777" }),
  })
  expect(r.status).toBe(200)
})

test("oversized attribution values are truncated not rejected", async () => {
  const NOW = Date.now()
  const email = `attr-long-${RUN}@test.local`
  await exec("INSERT INTO login_otps (email, code, expires_at, used) VALUES (?, ?, ?, ?)",
    [email, sha256hex("888888"), NOW + 300_000, 0])
  const r = await fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify({ email, code: "888888", attribution: { source: "x".repeat(200) } }),
  })
  expect(r.status).toBe(200)
  const rows = await query("SELECT first_source FROM accounts WHERE owner_email=?", [email])
  expect(rows.length).toBe(1)
  expect((rows[0].first_source as string).length).toBe(100)
})
