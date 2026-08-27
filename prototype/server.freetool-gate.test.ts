// KLAVITYKLA-487 — integration tests for the after-teaser email gate + abuse guardrails +
// pre-signup attribution on the free AI tools. Same hermetic shape as server.cro.test.ts: a stub
// page server, a stub OpenRouter, and a REAL server subprocess against a fresh temp SQLite DB.
import { afterAll, beforeAll, expect, test } from "bun:test"
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
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-ftgate-${RUN}.db`)
function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

let pageServer: ReturnType<typeof Bun.serve>
let aiServer: ReturnType<typeof Bun.serve>
let appProc: ReturnType<typeof Bun.spawn>
let BASE = ""
let PAGE_BASE = ""

// Each analyze fires one AI call → return a stable 3-friction JSON so teaser math is deterministic.
const fakeFrictions = JSON.stringify({
  frictions: [
    { title: "CTA text is unclear", severity: "high", fix: "Rename Submit to Start free trial" },
    { title: "No pricing visible", severity: "medium", fix: "Add a pricing section" },
    { title: "No social proof", severity: "medium", fix: "Add testimonials" },
  ],
})

// Unique client IP per call so the per-IP daily counter doesn't bleed across tests (server trusts
// the first XFF hop because the socket peer is loopback).
function ipHeaders(ip: string) { return { "content-type": "application/json", "x-forwarded-for": ip } }

beforeAll(async () => {
  pageServer = Bun.serve({
    port: 0,
    fetch() {
      return new Response(
        `<html><head><title>Acme SaaS</title></head><body><h1>Sign up for Acme</h1>
         <p>The best SaaS tool. No pricing shown. No testimonials. CTA says Submit.</p><button>Submit</button></body></html>`,
        { headers: { "content-type": "text/html" } },
      )
    },
  })
  PAGE_BASE = `http://localhost:${pageServer.port}`

  aiServer = Bun.serve({
    port: 0,
    fetch() {
      return Response.json({
        choices: [{ message: { content: fakeFrictions } }],
        usage: { prompt_tokens: 100, completion_tokens: 80, cost: 0.001 },
      })
    },
  })
  const AI_BASE = `http://localhost:${aiServer.port}`

  const port = await __freePortKLA719()
  BASE = `http://localhost:${port}`
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(53)).toString("base64"),
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_ENDPOINT: AI_BASE,
      KLAV_TEST_ALLOW_LOOPBACK: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      KLAV_FREETOOL_DAILY_CAP: "2",       // low so a 3rd gated run trips the limit screen
      KLAV_FREETOOL_COST_CAP_USD: "5",    // high so the run cap (not cost) trips first here
      TURNSTILE_SECRET_KEY: "",           // unset → a trip is a HARD block (no silent bypass)
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
})

afterAll(() => {
  appProc?.kill()
  pageServer?.stop(true)
  aiServer?.stop(true)
  raw.close()
  rmDb()
})

// ── teaser vs full reveal shape ──────────────────────────────────────────────────────────────────
test("gated analyze returns a TEASER (subset + lockedCount + revealToken), NOT the full result", async () => {
  const res = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST", headers: ipHeaders("11.11.11.1"),
    body: JSON.stringify({ url: PAGE_BASE, gated: true }),
  })
  expect(res.status).toBe(200)
  const b = await res.json()
  expect(b.teaser).toBe(true)
  expect(Array.isArray(b.visible)).toBe(true)
  expect(b.visible.length).toBe(2)      // TEASER_VISIBLE
  expect(b.lockedCount).toBe(1)         // 3 frictions - 2 visible
  expect(typeof b.headline).toBe("string")
  expect(typeof b.revealToken).toBe("string")
  expect(b.frictions).toBeUndefined()   // the full list must be withheld server-side
})

test("non-gated analyze keeps the full-result contract (backward compatible)", async () => {
  const res = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST", headers: ipHeaders("11.11.11.2"),
    body: JSON.stringify({ url: PAGE_BASE }),
  })
  expect(res.status).toBe(200)
  const b = await res.json()
  expect(Array.isArray(b.frictions)).toBe(true)
  expect(b.frictions.length).toBe(3)
  expect(b.teaser).toBeUndefined()
})

test("reveal: a valid email + reveal token returns the FULL previously-locked result", async () => {
  const run = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST", headers: ipHeaders("11.11.11.3"),
    body: JSON.stringify({ url: PAGE_BASE, gated: true }),
  })
  const teaser = await run.json()
  const rev = await fetch(`${BASE}/api/cro/unlock`, {
    method: "POST", headers: ipHeaders("11.11.11.3"),
    body: JSON.stringify({ email: "vishal@quantana.com.au", revealToken: teaser.revealToken, url: PAGE_BASE, tool: "cro" }),
  })
  expect(rev.status).toBe(200)
  const rb = await rev.json()
  expect(rb.ok).toBe(true)
  expect(rb.full).toBeDefined()
  expect(rb.full.frictions.length).toBe(3)
})

// ── disposable block + internal pass-through ─────────────────────────────────────────────────────
test("reveal rejects disposable inboxes inline, passes internal staff domains", async () => {
  const bad = await fetch(`${BASE}/api/cro/unlock`, {
    method: "POST", headers: ipHeaders("11.11.11.4"),
    body: JSON.stringify({ email: "x7f@mailinator.com", tool: "cro" }),
  })
  expect(bad.status).toBe(400)
  const bb = await bad.json()
  expect(bb.code).toBe("disposable")

  const good = await fetch(`${BASE}/api/cro/unlock`, {
    method: "POST", headers: ipHeaders("11.11.11.5"),
    body: JSON.stringify({ email: "vishal@quantana.com.au", tool: "cro" }),
  })
  expect(good.status).toBe(200)
  expect((await good.json()).ok).toBe(true)
})

// ── rate-limit trip + hard block when Turnstile unset ────────────────────────────────────────────
test("gated run cap (2/day) trips on the 3rd run → limit screen, hard-blocked with no Turnstile", async () => {
  const ip = "22.22.22.9"
  for (let i = 0; i < 2; i++) {
    const r = await fetch(`${BASE}/api/cro/analyze`, {
      method: "POST", headers: ipHeaders(ip),
      body: JSON.stringify({ url: PAGE_BASE, gated: true }),
    })
    expect(r.status).toBe(200)
    expect((await r.json()).teaser).toBe(true)
  }
  const tripped = await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST", headers: ipHeaders(ip),
    body: JSON.stringify({ url: PAGE_BASE, gated: true, turnstileToken: "forged" }),
  })
  expect(tripped.status).toBe(429)
  const tb = await tripped.json()
  expect(tb.limited).toBe(true)
  expect(tb.reason).toBe("rate")
  expect(tb.needTurnstile).toBe(false) // keys unset → do NOT offer a challenge we can't verify
  expect(tb.resetHours).toBeGreaterThan(0)
})

// ── attribution (#486 bucket-1) ──────────────────────────────────────────────────────────────────
test("attribution: pre-email gated run tags the marketing bucket; a captured email tags actor_email", async () => {
  // pre-email run
  await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST", headers: ipHeaders("33.33.33.1"),
    body: JSON.stringify({ url: PAGE_BASE, gated: true }),
  })
  // email-attributed run
  await fetch(`${BASE}/api/cro/analyze`, {
    method: "POST", headers: ipHeaders("33.33.33.2"),
    body: JSON.stringify({ url: PAGE_BASE, gated: true, email: "vishal@quantana.com.au" }),
  })
  await Bun.sleep(400) // recordAiCall is fire-and-forget
  const bucket = await raw.execute({
    sql: "SELECT COUNT(*) AS n FROM ai_calls WHERE project_id = 'proj_marketing_presignup'",
  })
  expect(Number((bucket.rows[0] as any).n)).toBeGreaterThan(0)
  const byEmail = await raw.execute({
    sql: "SELECT COUNT(*) AS n FROM ai_calls WHERE project_id = 'proj_marketing_presignup' AND actor_email = ?",
    args: ["vishal@quantana.com.au"],
  })
  expect(Number((byEmail.rows[0] as any).n)).toBeGreaterThan(0)
})
