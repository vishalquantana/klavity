// KLA-119: poll grace past deadline.
// Tests:
//   (A) Static source: trails.html polling loop has a grace window (not stopped at iteration 80).
//   (B) Static source: autosims-walk.html starts polling for running walks.
//   (C) /api/trails/walks/:runId/progress returns "running" for a still-running walk.
//   (D) /api/trails/walks/:runId/progress returns terminal status for a finished walk.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { readFileSync } from "node:fs"

// ── Dedicated temp DB ─────────────────────────────────────────────────────────
const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-poll-grace-${ts}.db`)
const TEST_SECRET = Buffer.alloc(32, 7).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")

async function rawExec(sql: string, args: any[] = []) {
  await rawClient.execute({ sql, args })
}

// ── Minimal schema ────────────────────────────────────────────────────────────
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS trails (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, intent TEXT NOT NULL DEFAULT '', base_url TEXT NOT NULL, baseline_ref TEXT, author_kind TEXT NOT NULL DEFAULT 'human', status TEXT NOT NULL DEFAULT 'draft', created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS trail_runs (id TEXT PRIMARY KEY, trail_id TEXT NOT NULL, project_id TEXT NOT NULL, trigger TEXT NOT NULL DEFAULT 'manual', status TEXT NOT NULL DEFAULT 'running', llm_calls INTEGER NOT NULL DEFAULT 0, summary_json TEXT, started_at INTEGER NOT NULL, finished_at INTEGER)`)
await rawExec(`CREATE TABLE IF NOT EXISTS run_steps (id TEXT PRIMARY KEY, run_id TEXT NOT NULL, trail_id TEXT NOT NULL, step_id TEXT NOT NULL, project_id TEXT NOT NULL, idx INTEGER NOT NULL, tier TEXT NOT NULL DEFAULT 'none', verdict TEXT NOT NULL DEFAULT 'skip', confidence REAL NOT NULL DEFAULT 0, diagnosis TEXT, healed INTEGER NOT NULL DEFAULT 0, evidence_json TEXT, created_at INTEGER NOT NULL)`)

// ── Seed fixtures ─────────────────────────────────────────────────────────────
const ADMIN_EMAIL = `pg-${ts}@test.local`
const ADMIN_SID = `sess_pg_${ts}`
const ACCOUNT_ID = `acct_pg_${ts}`
const PROJECT_ID = `proj_pg_${ts}`
const TRAIL_ID = `trail_pg_${ts}`
const RUN_RUNNING = `run_pg_running_${ts}`
const RUN_FINISHED = `run_pg_done_${ts}`
const NOW = Date.now()

await rawExec(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [ADMIN_EMAIL, NOW])
await rawExec(`INSERT INTO accounts (id, name, owner_email, plan, created_at) VALUES (?, ?, ?, ?, ?)`, [ACCOUNT_ID, "PG Workspace", ADMIN_EMAIL, "free", NOW])
await rawExec(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [`am_pg_${ts}`, ACCOUNT_ID, ADMIN_EMAIL, "owner", NOW])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, modal_config_json, widget_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [PROJECT_ID, ACCOUNT_ID, "PG Project", "active", "auto", 200, "named", '{}', "support", NOW, NOW])
await rawExec(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [`pm_pg_${ts}`, PROJECT_ID, ADMIN_EMAIL, "admin", null, NOW])
await rawExec(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000])
await rawExec(`INSERT INTO trails (id, project_id, name, base_url, author_kind, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [TRAIL_ID, PROJECT_ID, "Smoke Trail", "https://example.com", "human", "active", NOW, NOW])
// A finished walk (seeded before server start — sweepOrphanedWalks won't touch finished rows)
await rawExec(`INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, started_at, finished_at) VALUES (?, ?, ?, ?, ?, ?, ?)`, [RUN_FINISHED, TRAIL_ID, PROJECT_ID, "manual", "green", NOW - 30_000, NOW - 5000])

// ── Spawn the server ──────────────────────────────────────────────────────────
let base: string
let serverProc: ReturnType<typeof Bun.spawn>

beforeAll(async () => {
  const port = 47500 + Math.floor(Math.random() * 300)
  base = `http://localhost:${port}`
  serverProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: base,
      KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
    },
    stdout: "pipe", stderr: "pipe",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${base}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch {}
    await Bun.sleep(150)
  }

  // Seed the running walk AFTER the server starts — sweepOrphanedWalks() on startup marks
  // any pre-existing running walks as 'red'. Inserting it now ensures status stays 'running'.
  const n = Date.now()
  await rawExec(`INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, started_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [RUN_RUNNING, TRAIL_ID, PROJECT_ID, "manual", "running", n - 2000])
})

afterAll(() => { serverProc?.kill(); rawClient.close() })

const cookie = `klav_session=${ADMIN_SID}`
const qs = `?project=${encodeURIComponent(PROJECT_ID)}`

// ── (A) Static: trails.html polling has grace window ─────────────────────────
test("(A) KLA-119: trails.html polling loop has grace window past iteration 80", () => {
  const src = readFileSync(new URL("public/trails.html", import.meta.url), "utf8")
  // Must NOT have the old hard-capped `for (var i=0;i<80;i++)` stop
  expect(src).not.toContain("for (var i=0;i<80;i++)")
  // Must have the grace window constant
  expect(src).toContain("POLL_GRACE_MS")
  // Must keep polling past i>=80 with backoff
  expect(src).toContain("inGrace")
})

// ── (B) Static: autosims-walk.html polls running walks ───────────────────────
test("(B) KLA-119: autosims-walk.html starts polling for running walk on load", () => {
  const src = readFileSync(new URL("public/autosims-walk.html", import.meta.url), "utf8")
  expect(src).toContain("startRunningPoll")
  expect(src).toContain("GRACE_MS")
})

// ── (C) /progress for a running walk returns status "running" ─────────────────
test("(C) KLA-119: /progress for a running walk returns status 'running'", async () => {
  const r = await fetch(`${base}/api/trails/walks/${encodeURIComponent(RUN_RUNNING)}/progress${qs}`, {
    headers: { cookie },
  })
  expect(r.status).toBe(200)
  const body = await r.json() as any
  expect(body.status).toBe("running")
  expect(typeof body.stepsDone).toBe("number")
  expect(typeof body.totalSteps).toBe("number")
})

// ── (D) /progress for a finished walk returns terminal status ─────────────────
test("(D) KLA-119: /progress for a finished walk returns terminal (non-running) status", async () => {
  const r = await fetch(`${base}/api/trails/walks/${encodeURIComponent(RUN_FINISHED)}/progress${qs}`, {
    headers: { cookie },
  })
  expect(r.status).toBe(200)
  const body = await r.json() as any
  expect(body.status).not.toBe("running")
  expect(body.status).toBe("green")
})
