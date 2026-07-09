import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"
import { sha256hex } from "./lib/crypto"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-autosim-auth-config-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(81)).toString("base64")

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `autosim-auth-${RUN}@test.local`
const SID = `sess_autosim_auth_${RUN}`
const ACCT = `acct_autosim_auth_${RUN}`
const PROJ = `proj_autosim_auth_${RUN}`
const NOW = Date.now()
const TOKEN = `aset_${RUN}_valid`
const OVERSIZE_TOKEN = `aset_${RUN}_oversize`
const EXPIRED_TOKEN = `aset_${RUN}_expired`
const MINT_TOKEN = `aset_${RUN}_mint`

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

async function seedSetupToken(token: string, expiresAt = NOW + 7 * 24 * 60 * 60 * 1000, revokedAt: number | null = null) {
  await exec(
    `INSERT INTO autosim_auth_setup_tokens (id, project_id, token_hash, created_by, created_at, expires_at, revoked_at, used_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
    [`tok_${token.replace(/[^a-zA-Z0-9_]/g, "_")}`, PROJ, sha256hex(token), OWNER, NOW, expiresAt, revokedAt],
  )
}

beforeAll(async () => {
  const port = 47300 + Math.floor(Math.random() * 300)
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
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "AutoSim Auth Test", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Auth Project", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await seedSetupToken(TOKEN)
  await seedSetupToken(OVERSIZE_TOKEN)
  await seedSetupToken(EXPIRED_TOKEN, NOW - 1000)
  await seedSetupToken(MINT_TOKEN)
})

afterAll(() => {
  proc?.kill()
  raw.close()
  rmDb()
})

function postAuthConfig(token: string | null, body: any, headers: Record<string, string> = {}) {
  return fetch(`${BASE}/api/autosim/auth-config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
}

test("POST /api/autosim/auth-config stores encrypted write-only auth config and enqueues probe", async () => {
  const r = await postAuthConfig(TOKEN, {
    method: "fixed_otp",
    email: "Vishal@Quantana.com.au",
    secret: "123456",
    notes: "Dogfood login OTP",
  })
  expect(r.status).toBe(201)
  const body = await r.json()
  expect(body).toMatchObject({ ok: true, projectId: PROJ, authStatus: "registered", probe: { status: "queued" } })

  const cfg = await raw.execute({ sql: "SELECT method, email, secret_enc, notes FROM autosim_auth_configs WHERE project_id=?", args: [PROJ] })
  expect(cfg.rows).toHaveLength(1)
  const row: any = cfg.rows[0]
  expect(row.method).toBe("fixed_otp")
  expect(row.email).toBe("vishal@quantana.com.au")
  expect(row.notes).toBe("Dogfood login OTP")
  expect(String(row.secret_enc)).not.toBe("123456")
  expect(String(row.secret_enc)).toContain(":")

  const project = await raw.execute({ sql: "SELECT autosim_auth_status FROM projects WHERE id=?", args: [PROJ] })
  expect(["registered", "verified"]).toContain((project.rows[0] as any).autosim_auth_status)

  const tokenRow = await raw.execute({ sql: "SELECT used_at FROM autosim_auth_setup_tokens WHERE token_hash=?", args: [sha256hex(TOKEN)] })
  expect(Number((tokenRow.rows[0] as any).used_at)).toBeGreaterThan(0)

  const probe = await raw.execute({ sql: "SELECT project_id, method, email, status FROM autosim_auth_probe_queue WHERE project_id=?", args: [PROJ] })
  expect(probe.rows).toHaveLength(1)
  expect(probe.rows[0]).toMatchObject({ project_id: PROJ, method: "fixed_otp", email: "vishal@quantana.com.au" })
  expect(["queued", "running", "green"]).toContain((probe.rows[0] as any).status)
})

test("setup token is required, unexpired, and consumed after success", async () => {
  expect((await postAuthConfig(null, { method: "fixed_otp", email: "vishal@quantana.com.au", secret: "111111" })).status).toBe(401)
  expect((await postAuthConfig(EXPIRED_TOKEN, { method: "fixed_otp", email: "vishal@quantana.com.au", secret: "111111" })).status).toBe(401)
  expect((await postAuthConfig(TOKEN, { method: "fixed_otp", email: "vishal@quantana.com.au", secret: "111111" })).status).toBe(401)
})

test("POST /api/autosim/auth-config validates method/email and caps request size", async () => {
  const badMethod = await postAuthConfig(OVERSIZE_TOKEN, { method: "password", email: "vishal@quantana.com.au", secret: "x" })
  expect(badMethod.status).toBe(400)

  const badEmail = await postAuthConfig(OVERSIZE_TOKEN, { method: "mint_link", email: "not-an-email", secret: "x" })
  expect(badEmail.status).toBe(400)

  const huge = JSON.stringify({ method: "mint_link", email: "vishal@quantana.com.au", secret: "x", notes: "n".repeat(20_000) })
  const tooLarge = await postAuthConfig(OVERSIZE_TOKEN, huge, { "Content-Length": String(huge.length) })
  expect(tooLarge.status).toBe(413)
})

test("POST /api/autosim/auth-config rejects absolute mint links before storing", async () => {
  const r = await postAuthConfig(MINT_TOKEN, {
    method: "mint_link",
    email: "vishal@quantana.com.au",
    secret: "https://169.254.169.254/test-login?token=x",
  })
  expect(r.status).toBe(400)
  const body = await r.json()
  expect(body.error).toMatch(/absolute URL/)
})
