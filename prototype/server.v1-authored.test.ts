// KLA-550 — POST/GET/cancel /api/v1/authored-runs REST tests via the subprocess-server harness.
// Bootstrap copied inline from server.v1-runs.test.ts (spawn real server, seed a project, mint a
// kci_ token via POST /api/ci/token). Auth mirrors /api/v1/runs (kci_ bearer + project IDOR guard).
//
// NON-HANGING NOTE: authoring (runAuthorNow) is fire-and-forget — the route returns 202 as soon as
// the author_sessions row exists; the real browser drive + verification walk run in the BACKGROUND
// of the spawned server subprocess (never awaited by these tests, killed in afterAll). We spawn the
// server WITHOUT OPENROUTER_API_KEY so a background drive fails fast, and we launch only ONE real
// create at a time — GET/cancel shape assertions run against author_sessions rows seeded DIRECTLY,
// exactly as server.v1-runs.test.ts seeds pre-finished walks. No test waits for a walk to finish.

import { test, expect, beforeAll, afterAll } from "bun:test"
import * as __netKLA719 from "node:net"
// KLA-719: OS-assigned free port (replaces a crowded random base that let co-scheduled
// server suites collide and answer each other's requests → spurious 401/404/no-such-table).
function __freePortKLA719(): Promise<number> {
  return new Promise((res, rej) => {
    const s = __netKLA719.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-v1authored-srv-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// ── Schema (only the tables this suite touches; the booting server adds the rest via applySchema). ──
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS extension_tokens (token TEXT PRIMARY KEY, email TEXT NOT NULL, project_id TEXT, created_at INTEGER NOT NULL, expires_at INTEGER, revoked INTEGER NOT NULL DEFAULT 0)`)
await rawExec(`CREATE INDEX IF NOT EXISTS ext_tok_email_idx ON extension_tokens (email)`)
// NOTE: author_sessions is created (with all migrated columns) by the booting server's applySchema —
// we seed the crystallized row in a beforeAll AFTER the server is ready so every column exists.

// ── Fixtures ──
const ADMIN_EMAIL = `admin-va-${ts}@test.local`
const ADMIN_SID = `sess_admin_va_${ts}`
const ACCOUNT_ID = `acct_va_${ts}`
const PROJECT_ID = `proj_va_${ACCOUNT_ID}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCOUNT_ID, "VA Workspace", ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_va_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "VA Project", "active", "auto", 200, "named", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_va_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])

// A pre-seeded crystallized author_sessions row for status-shape assertions (no drive launched).
// Seeded post-boot (see beforeAll below) so the server's migrated schema exists first.
const SEEDED_SID = `auth_seed_${ts}`

// ── Spawn the server ──
let serverPort: number
let serverProc: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  // 46xxx band — distinct from server.v1-runs (44xxx) and the author-route suite (45xxx).
  serverPort = await __freePortKLA719()
  BASE = `http://localhost:${serverPort}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(serverPort),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      // OPENROUTER_API_KEY intentionally ABSENT — a background author drive fails fast without it.
      OPENROUTER_API_KEY: undefined as any,
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
    } catch { /* not ready */ }
    await Bun.sleep(150)
  }
})

afterAll(() => { serverProc?.kill(); rawClient.close() })

const bearer = (tok: string) => `Bearer ${tok}`
const cookie = (sid: string) => `klav_session=${sid}`

// Seed the crystallized author_sessions row now that the server has applied its full schema.
beforeAll(async () => {
  await rawExec(
    `INSERT INTO author_sessions (id, project_id, name, objective, base_url, status, trail_id, verification_run_id, verification_verdict, objective_verified, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'crystallized', ?, ?, 'green', 1, ?, ?, ?)`,
    [SEEDED_SID, PROJECT_ID, "Seed authored", "Verify the seeded objective renders", "https://example.com", `trl_seed_${ts}`, `walk_seed_${ts}`, ADMIN_EMAIL, NOW, NOW + 5000],
  )
})

// Mint a kci_ token for ADMIN/PROJECT_ID via the existing CI endpoint (v1 reuses these tokens).
let CI_TOKEN: string
beforeAll(async () => {
  const r = await fetch(`${BASE}/api/ci/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie(ADMIN_SID) },
    body: JSON.stringify({ project: PROJECT_ID }),
  })
  const b = await r.json() as any
  CI_TOKEN = b.token
})

// ── POST /api/v1/authored-runs — trigger ──

test("POST /api/v1/authored-runs returns 202 with authored_run_id", async () => {
  const res = await fetch(BASE + "/api/v1/authored-runs", {
    method: "POST",
    headers: { authorization: bearer(CI_TOKEN), "content-type": "application/json" },
    body: JSON.stringify({ project_id: PROJECT_ID, target_url: "https://example.com", objective: "Check that the pricing page loads and the CTA is clickable" }),
  })
  expect(res.status).toBe(202)
  const j = await res.json() as any
  expect(typeof j.authored_run_id).toBe("string")
  expect(j.status).toBe("authoring")
  expect(j.status_url).toContain(j.authored_run_id)
})

test("rejects wrong-project token with 403", async () => {
  const res = await fetch(BASE + "/api/v1/authored-runs", {
    method: "POST",
    headers: { authorization: bearer(CI_TOKEN), "content-type": "application/json" },
    body: JSON.stringify({ project_id: "proj_other", target_url: "https://example.com", objective: "x".repeat(20) }),
  })
  expect(res.status).toBe(403)
})

test("missing objective/target_url → 400", async () => {
  const res = await fetch(BASE + "/api/v1/authored-runs", {
    method: "POST",
    headers: { authorization: bearer(CI_TOKEN), "content-type": "application/json" },
    body: JSON.stringify({ project_id: PROJECT_ID }),
  })
  expect(res.status).toBe(400)
})

test("missing bearer token → 401", async () => {
  const res = await fetch(BASE + "/api/v1/authored-runs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ project_id: PROJECT_ID, target_url: "https://example.com", objective: "x".repeat(20) }),
  })
  expect(res.status).toBe(401)
})

// ── GET /api/v1/authored-runs/:id — status poll (against the SEEDED crystallized row) ──

test("GET status echoes the wire shape and 404s unknown ids", async () => {
  const ok = await fetch(`${BASE}/api/v1/authored-runs/${SEEDED_SID}?project=${PROJECT_ID}`, { headers: { authorization: bearer(CI_TOKEN) } })
  expect(ok.status).toBe(200)
  const j = await ok.json() as any
  expect(j.authored_run_id).toBe(SEEDED_SID)
  expect(j.status).toBe("completed")
  expect(j.trail_id).toBe(`trl_seed_${ts}`)
  expect(j.verification_run_id).toBe(`walk_seed_${ts}`)
  expect(j.verdict).toBe("green")
  expect(["authoring", "completed", "failed", "needs_auth", "cancelled"]).toContain(j.status)
  expect("trail_id" in j).toBe(true)
  expect("verification_run_id" in j).toBe(true)

  const miss = await fetch(`${BASE}/api/v1/authored-runs/auth_does_not_exist?project=${PROJECT_ID}`, { headers: { authorization: bearer(CI_TOKEN) } })
  expect(miss.status).toBe(404)
})

test("GET status rejects wrong project (403)", async () => {
  const res = await fetch(`${BASE}/api/v1/authored-runs/auth_x?project=proj_other`, { headers: { authorization: bearer(CI_TOKEN) } })
  expect(res.status).toBe(403)
})

// ── POST /api/v1/authored-runs/:id/cancel — a non-running (crystallized) session reports false. ──

test("POST cancel on a finished session reports cancel_requested:false", async () => {
  const res = await fetch(`${BASE}/api/v1/authored-runs/${SEEDED_SID}/cancel?project=${PROJECT_ID}`, {
    method: "POST",
    headers: { authorization: bearer(CI_TOKEN) },
  })
  expect(res.status).toBe(200)
  const j = await res.json() as any
  expect(j.authored_run_id).toBe(SEEDED_SID)
  expect(j.cancel_requested).toBe(false)
  expect(j.status).toBe("completed")
})

test("POST cancel on unknown id → 404", async () => {
  const res = await fetch(`${BASE}/api/v1/authored-runs/auth_nope_${ts}/cancel?project=${PROJECT_ID}`, {
    method: "POST",
    headers: { authorization: bearer(CI_TOKEN) },
  })
  expect(res.status).toBe(404)
})

// ── Idempotency-Key replay (the SECOND real create path; first stores the key, second replays). ──

test("Idempotency-Key replays the same authored_run_id", async () => {
  const key = "idem-" + ts + "-A"
  const mk = () => fetch(BASE + "/api/v1/authored-runs", {
    method: "POST",
    headers: { authorization: bearer(CI_TOKEN), "content-type": "application/json", "idempotency-key": key },
    body: JSON.stringify({ project_id: PROJECT_ID, target_url: "https://example.com", objective: "Confirm the signup CTA opens the register modal" }),
  })
  // The global author slot may still be held by an earlier test's background drive; that drive fails
  // fast (no OPENROUTER key / no chromium) and releases the slot. Retry the FIRST create past any
  // transient 409 busy so the idempotency key gets stored. Once stored, replays never touch the slot.
  //
  // KLA-558 regression guard: a 409-busy MUST NOT charge the per-project create budget (the route
  // refunds the rate-limit slot on busy). Before the fix, ~10 polled 409s inside a held-slot window
  // exhausted the 10/min budget and every subsequent create returned 429 for the rest of the minute
  // ("unexpected create status 429"). With the refund, this loop only ever sees 409 (busy) or 202
  // (slot freed) — never 429 — so it converges deterministically.
  let a: Response, ja: any
  const deadline = Date.now() + 25_000
  for (;;) {
    a = await mk(); ja = await a.json()
    if (a.status === 202) break
    if (a.status === 429) throw new Error(`KLA-558 regression: 409-busy polls exhausted the create budget → 429. Body: ${JSON.stringify(ja)}`)
    if (a.status !== 409) throw new Error(`unexpected create status ${a.status}: ${JSON.stringify(ja)}`)
    if (Date.now() > deadline) throw new Error("author slot never freed for idempotency create")
    await Bun.sleep(300)
  }
  const b = await mk(); const jb = await b.json() as any
  expect(jb.authored_run_id).toBe(ja.authored_run_id)
  expect(b.status).toBe(200)
  expect(jb.idempotent_replay).toBe(true)
}, 30_000)
