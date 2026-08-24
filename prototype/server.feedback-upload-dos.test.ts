// KLA-559 (P2 security/DoS): the cross-origin POST /api/feedback upload path must not be abusable by
// (a) omitting the Origin header to skip the anon rate limiter, or (b) POSTing an unbounded body that
// gets whole-file buffered into RAM. This spawns TWO independent server PROCESSES (rate-limit state is
// per-process in-memory) so the two concerns don't share a limiter window:
//   • srvRL   — default body cap: proves a NO-Origin anonymous caller IS now per-IP rate-limited
//               (previously it skipped BOTH limiters entirely — the DoS this fixes).
//   • srvBody — MAX_REQUEST_BODY_BYTES lowered: proves Bun rejects an over-cap body with 413 (does NOT
//               crash / buffer it) while an under-cap body sails past the body check.
// Subprocess-against-temp-DB pattern, mirroring server.feedback-anon.test.ts.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-fdos-${ts}.db`)
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(42)).toString("base64")

const rawClient = createClient({ url: "file:" + srvDbFile })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function rawExec(sql: string, args: any[] = []) { await rawClient.execute({ sql, args }) }

// Minimal schema — only what the /api/feedback handler touches to boot + persist.
await rawExec(`CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`)
await rawExec(`CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, plan TEXT NOT NULL DEFAULT 'free', created_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', modal_config_json TEXT DEFAULT '{}', widget_mode TEXT NOT NULL DEFAULT 'support', widget_cta_url TEXT, widget_notify_email TEXT, widget_report_gate TEXT NOT NULL DEFAULT 'anonymous', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`)
await rawExec(`CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`)
await rawExec(`CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, contact_email TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`)
await rawExec(`CREATE INDEX IF NOT EXISTS idx_fb_proj ON feedback(project_id)`)

const now = Date.now()
await rawExec(`INSERT INTO accounts (id, name, owner_email, domain, plan, created_at) VALUES ('a1','Test Account','owner@test.local','test.local','free',?)`, [now])
await rawExec(`INSERT INTO projects (id, account_id, name, status, review_mode, observability_mode, modal_config_json, widget_mode, widget_cta_url, widget_notify_email, widget_report_gate, created_at, updated_at) VALUES ('p1','a1','Test Project','active','auto','named','{}','support',NULL,NULL,'anonymous',?,?)`, [now, now])

// ── Spawn two independent server processes ────────────────────────────────────
const LOW_BODY_CAP = 4 * 1024 * 1024 // 4MB — small enough to test 413 fast; mirrors 140MB↔120MB at scale.
let srvRL: ReturnType<typeof Bun.spawn>, srvBody: ReturnType<typeof Bun.spawn>
let RL_BASE = "", BODY_BASE = ""

function spawnServer(port: number, extraEnv: Record<string, string> = {}) {
  return Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + srvDbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: `http://localhost:${port}`,
      KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
      ...extraEnv,
    },
    stdout: "pipe",
    stderr: "pipe",
  })
}

async function waitReady(base: string) {
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try { const r = await fetch(`${base}/favicon.svg`).catch(() => null); if (r && r.status < 500) break } catch { /* not ready */ }
    await Bun.sleep(150)
  }
}

beforeAll(async () => {
  const pRL = 35000 + Math.floor(Math.random() * 500)
  const pBody = 35500 + Math.floor(Math.random() * 500)
  RL_BASE = `http://localhost:${pRL}`
  BODY_BASE = `http://localhost:${pBody}`
  srvRL = spawnServer(pRL)
  srvBody = spawnServer(pBody, { MAX_REQUEST_BODY_BYTES: String(LOW_BODY_CAP) })
  await Promise.all([waitReady(RL_BASE), waitReady(BODY_BASE)])
})

afterAll(() => { srvRL?.kill(); srvBody?.kill(); rawClient.close() })

// ── Fix #1: the anon per-IP limiter is NOT skippable by omitting the Origin header ──
// Regression guard for KLA-559: previously a NO-Origin anonymous POST skipped BOTH anon limiters, so
// `curl -F files=@big.mp4` in a loop was unbounded. Now every anon caller is per-IP rate-limited up-front,
// Origin or not. Fire past the per-IP cap (20/h) with NO Origin header and assert a 429 appears — while
// the first request still succeeds (not a blanket block on legit no-Origin API callers).
test("NO-Origin anonymous POST /api/feedback is per-IP rate-limited after the cap (limiter not Origin-skippable)", async () => {
  const shoot = () => {
    const fd = new FormData(); fd.set("description", "no-origin dos probe"); fd.set("project_id", "p1")
    return fetch(`${RL_BASE}/api/feedback`, { method: "POST", body: fd }) // NO origin header
  }
  const statuses: number[] = []
  for (let i = 0; i < 25; i++) statuses.push((await shoot()).status)
  // Old (vulnerable) behavior: EVERY no-Origin request skipped the limiter → never 429.
  expect(statuses[0]).not.toBe(429)          // a legit first no-Origin API call is not blanket-blocked
  expect(statuses).toContain(429)            // the limiter DOES engage once the per-IP cap is spent
})

// ── Fix #2: request body is bounded — Bun returns 413 for an over-cap body, and buffers no further ──
// An under-cap body passes the body check (the attachment may drop if S3 is unset, but the request is NOT
// a 413). An over-cap body is rejected by Bun's maxRequestBodySize BEFORE our handler runs — a clean 413,
// never a crash. This is the small-scale analog of the prod 140MB cap vs the 120MB attachment budget.
test("over-cap request body is rejected with 413 (bounded, not buffered/crashed)", async () => {
  // Under the cap → passes the body layer (not 413). Cross-origin + anonymous-gated project → reaches handler.
  const small = new Blob([new Uint8Array(2 * 1024 * 1024)], { type: "application/octet-stream" }) // 2MB < 4MB cap
  const fdOk = new FormData(); fdOk.set("description", "under-cap attach"); fdOk.set("project_id", "p1"); fdOk.set("files", small, "small.bin")
  const rOk = await fetch(`${BODY_BASE}/api/feedback`, { method: "POST", body: fdOk, headers: { origin: "https://customer.example" } })
  expect(rOk.status).not.toBe(413) // body within budget is accepted by the body layer

  // Over the cap → Bun rejects before our handler ever runs.
  const big = new Blob([new Uint8Array(6 * 1024 * 1024)], { type: "application/octet-stream" }) // 6MB > 4MB cap
  const fdBig = new FormData(); fdBig.set("description", "over-cap attack"); fdBig.set("project_id", "p1"); fdBig.set("files", big, "big.bin")
  const rBig = await fetch(`${BODY_BASE}/api/feedback`, { method: "POST", body: fdBig, headers: { origin: "https://customer.example" } })
  expect(rBig.status).toBe(413) // maxRequestBodySize enforced; body never fully buffered into RAM
})
