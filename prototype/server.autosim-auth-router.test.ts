// KLAVITYKLA-267: AT2 Auth Setup Router — server-level integration tests.
// Covers:
//   GET  /api/projects/:id/autosim-auth       → status + masked email + paused count
//   POST /api/projects/:id/autosim-auth/setup-token → issues aset_ token + agent prompt
//   GET  /autosims/auth                         → serves auth-router.html (auth-gated)
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-at2-auth-router-${RUN}.db`)
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

const OWNER = `at2router-${RUN}@test.local`
const SID = `sess_at2router_${RUN}`
const ACCT = `acct_at2router_${RUN}`
const PROJ = `proj_at2router_${RUN}`
const PROJ_MEMBER = `proj_at2router_member_${RUN}`
const SID_MEMBER = `sess_at2router_member_${RUN}`
const MEMBER = `at2router-member-${RUN}@test.local`
const NOW = Date.now()

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""

async function exec(sql: string, args: any[] = []) {
  await raw.execute({ sql, args })
}

beforeAll(async () => {
  const port = 47500 + Math.floor(Math.random() * 200)
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

  // Wait for server to come up.
  const deadline = Date.now() + 14_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }

  // Seed users, sessions, account, project — admin owner + non-admin member.
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [MEMBER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID_MEMBER, MEMBER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "AT2 Router Test", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  for (const pid of [PROJ, PROJ_MEMBER]) {
    await exec(
      "INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, autosim_auth_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [pid, ACCT, "AT2 Test Project", "active", "auto", 200, "named", "unregistered", NOW, NOW],
    )
    await exec(
      "INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [`pm_${pid}_owner`, pid, OWNER, "admin", null, NOW],
    )
  }
  await exec(
    "INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [`pm_member_${RUN}`, PROJ_MEMBER, MEMBER, "member", null, NOW],
  )
})

afterAll(() => {
  proc?.kill()
  raw.close()
  rmDb()
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function authedHeaders(sid = SID) {
  return { Cookie: `klav_session=${sid}` }
}

function getAuthStatus(pid = PROJ, sid = SID) {
  return fetch(`${BASE}/api/projects/${encodeURIComponent(pid)}/autosim-auth`, {
    headers: authedHeaders(sid),
  })
}

function postSetupToken(pid = PROJ, body: any = { method: "fixed_otp" }, sid = SID) {
  return fetch(`${BASE}/api/projects/${encodeURIComponent(pid)}/autosim-auth/setup-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authedHeaders(sid) },
    body: JSON.stringify(body),
  })
}

// ── GET /autosims/auth — auth-gated page ─────────────────────────────────────

test("GET /autosims/auth redirects unauthenticated to /login", async () => {
  const r = await fetch(`${BASE}/autosims/auth`, { redirect: "manual" })
  expect(r.status).toBe(302)
  expect(r.headers.get("location")).toContain("/login")
})

test("GET /autosims/auth returns auth-router.html for authenticated users", async () => {
  const r = await fetch(`${BASE}/autosims/auth`, { headers: authedHeaders() })
  expect(r.status).toBe(200)
  const body = await r.text()
  expect(body).toContain("Give your Sims a key")
  expect(body).toContain("How do people log into your app?")
})

// ── GET /api/projects/:id/autosim-auth — status ───────────────────────────────

test("GET autosim-auth redirects unauthenticated callers to /login (GET API routes redirect on no session)", async () => {
  // The outer /api/ gate for GET requests calls needLogin() which is a 302 redirect to /login.
  // We use manual redirect to see the raw 302 instead of the followed login page.
  const r = await fetch(`${BASE}/api/projects/${PROJ}/autosim-auth`, { redirect: "manual" })
  expect(r.status).toBe(302)
  expect(r.headers.get("location")).toContain("/login")
})

test("GET autosim-auth returns 403 for no-access user", async () => {
  // Create a user who is not a member of PROJ
  const stranger = `stranger-${RUN}@test.local`
  const sidStranger = `sess_stranger_${RUN}`
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [stranger, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [sidStranger, stranger, NOW, NOW + 86400_000])
  const r = await getAuthStatus(PROJ, sidStranger)
  expect(r.status).toBe(403)
})

test("GET autosim-auth returns unregistered status for a fresh project", async () => {
  const r = await getAuthStatus()
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.authStatus).toBe("unregistered")
  expect(body.method).toBeNull()
  expect(body.email).toBeNull()
  expect(body.pausedCount).toBe(0)
  expect(body.latestProbe).toBeNull()
  expect(Array.isArray(body.pausedSessions)).toBe(true)
})

// ── POST /api/projects/:id/autosim-auth/setup-token ──────────────────────────

test("POST setup-token returns 401 without session (POST API routes return 401 JSON on no session)", async () => {
  // The outer /api/ gate for non-GET requests calls needLogin() which returns JSON 401.
  const r = await fetch(`${BASE}/api/projects/${PROJ}/autosim-auth/setup-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: "fixed_otp" }),
  })
  expect(r.status).toBe(401)
})

test("POST setup-token returns 403 for non-admin member", async () => {
  const r = await postSetupToken(PROJ_MEMBER, { method: "fixed_otp" }, SID_MEMBER)
  expect(r.status).toBe(403)
  const body = await r.json()
  expect(body.error).toMatch(/admin/i)
})

test("POST setup-token returns 400 for invalid method", async () => {
  const r = await postSetupToken(PROJ, { method: "magic_wand" })
  expect(r.status).toBe(400)
  const body = await r.json()
  expect(body.error).toMatch(/method/)
})

test("POST setup-token (fixed_otp) issues aset_ token and returns OTP agent prompt", async () => {
  const r = await postSetupToken(PROJ, { method: "fixed_otp" })
  expect(r.status).toBe(201)
  const body = await r.json()
  expect(body.ok).toBe(true)
  expect(typeof body.setupToken).toBe("string")
  expect(body.setupToken.startsWith("aset_")).toBe(true)
  expect(typeof body.tokenId).toBe("string")
  expect(typeof body.expiresAt).toBe("number")
  expect(body.expiresAt).toBeGreaterThan(Date.now())
  // Prompt must mention OTP and the Klavity registration curl
  expect(typeof body.prompt).toBe("string")
  expect(body.prompt).toContain("OTP")
  expect(body.prompt).toMatch(/POST.*api\/autosim\/auth-config/i)
  // The raw setup token must appear in the prompt (for the agent to use in the curl)
  expect(body.prompt).toContain(body.setupToken)
  // Token hash must be stored in DB (not raw token)
  const stored = await raw.execute({
    sql: "SELECT token_hash FROM autosim_auth_setup_tokens WHERE id=?",
    args: [body.tokenId],
  })
  expect(stored.rows).toHaveLength(1)
  expect(String((stored.rows[0] as any).token_hash)).not.toBe(body.setupToken)
})

test("POST setup-token (mint_link) issues aset_ token and returns mint-link agent prompt", async () => {
  const r = await postSetupToken(PROJ, { method: "mint_link" })
  expect(r.status).toBe(201)
  const body = await r.json()
  expect(body.ok).toBe(true)
  expect(body.setupToken.startsWith("aset_")).toBe(true)
  // Mint-link prompt must mention /test-login and constant-time compare
  expect(body.prompt).toMatch(/\/test-login/i)
  expect(body.prompt).toMatch(/constant.time|timingSafeEqual/i)
})

test("GET autosim-auth returns paused sessions count after needs_auth sessions inserted", async () => {
  // Seed a needs_auth author_session for this project.
  const sessId = `as_at2_${RUN}`
  await exec(
    `INSERT INTO author_sessions (id, project_id, name, objective, base_url, status, steps_json, stall_reason,
       trail_id, verification_run_id, verification_verdict, llm_calls, cost_usd, created_by, checkpoint_json,
       resumed_from, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, 0, 0, ?, ?, NULL, ?, ?)`,
    [
      sessId, PROJ, "Paused Walk", "walk authenticated pages", "https://app.example.com",
      "needs_auth", "[]", "login wall",
      OWNER, JSON.stringify({ traj: [], history: [], stepIdx: 0, llmCalls: 0, costUsd: 0, lastUrl: "https://app.example.com" }),
      NOW, NOW,
    ],
  )

  const r = await getAuthStatus()
  expect(r.status).toBe(200)
  const body = await r.json()
  // pausedCount should be >= 1
  expect(body.pausedCount).toBeGreaterThanOrEqual(1)
  // pausedSessions array should include our session
  const ids = (body.pausedSessions as any[]).map((s: any) => s.id)
  expect(ids).toContain(sessId)
  expect(body.pausedSessions[0]).toHaveProperty("name")
  expect(body.pausedSessions[0]).toHaveProperty("baseUrl")
})
