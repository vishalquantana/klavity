// server.resume-intent.test.ts
// KLAVITYKLA-229 (JTBD 1.12): resume intent after a login-gate.
//
// Contract:
//   1. A GET login gate (e.g. /dashboard while logged out) 302s to /login?next=<original path>,
//      so the intended destination is captured — not dropped.
//   2. /api/auth/verify honors a safe same-origin `next` from the body, overriding the
//      new-user→/onboarding / returning-user→/dashboard default.
//   3. An UNSAFE `next` (protocol-relative //host, absolute scheme, backslash, non-rooted) is
//      rejected server-side and falls back to the funnel default — no open redirect.
//   4. GET /login?next=<safe> while ALREADY signed in resumes there instead of /dashboard;
//      an unsafe next falls back to /dashboard.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const EMAIL = `resume-${RUN}@test.local`
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")
const TEST_OTP_CODE = "666666"
const PORT = 38700 + Math.floor(Math.random() * 200)

function rmDb(f: string) {
  for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(f + s) } catch {} }
}

const dbFile = join(tmpdir(), `klav-resume-${RUN}.db`)
let srv: ReturnType<typeof Bun.spawn>
let BASE: string

beforeAll(async () => {
  rmDb(dbFile)
  BASE = `http://localhost:${PORT}`
  srv = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      TURSO_AUTH_TOKEN: "",
      TURSO_DATABASE_URL: "file:" + dbFile,
      KLAV_SECRET: TEST_SECRET,
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
      KLAV_ALLOWED_DOMAINS: "test.local",
      PORT: String(PORT),
      KLAV_BASE_URL: BASE,
      KLAV_TEST_OTP: "1",
      KLAV_TEST_OTP_EMAILS: EMAIL,
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const dl = Date.now() + 12_000
  while (Date.now() < dl) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
})

afterAll(() => { srv?.kill(); rmDb(dbFile) })

function verify(email: string, code: string, next?: string) {
  return fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.9" },
    body: JSON.stringify(next === undefined ? { email, code } : { email, code, next }),
  })
}

// ── 1. Login gate captures intent ────────────────────────────────────────────

test("GET /dashboard while logged out 302s to /login?next=%2Fdashboard", async () => {
  const r = await fetch(`${BASE}/dashboard`, { redirect: "manual" })
  expect(r.status).toBe(302)
  expect(r.headers.get("location")).toBe("/login?next=%2Fdashboard")
})

test("login gate preserves the querystring of the intended destination", async () => {
  const r = await fetch(`${BASE}/inbox?project=abc`, { redirect: "manual" })
  expect(r.status).toBe(302)
  expect(r.headers.get("location")).toBe("/login?next=" + encodeURIComponent("/inbox?project=abc"))
})

// ── 2. verify honors a safe next ─────────────────────────────────────────────

test("verify resumes a safe same-origin next path", async () => {
  const r = await verify(EMAIL, TEST_OTP_CODE, "/inbox?project=xyz")
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  expect(body.redirect).toBe("/inbox?project=xyz")
})

// ── 3. verify rejects unsafe next → funnel default ───────────────────────────

for (const bad of ["//evil.com", "https://evil.com", "/\\evil.com", "javascript:alert(1)", "dashboard"]) {
  test(`verify ignores unsafe next ${JSON.stringify(bad)} and uses the funnel default`, async () => {
    const r = await verify(EMAIL, TEST_OTP_CODE, bad)
    expect(r.status).toBe(200)
    const body = await r.json()
    expect(body.redirect).toMatch(/^\/(dashboard|onboarding)/)
    expect(body.redirect).not.toContain("evil.com")
  })
}

test("verify with no next still returns the funnel default", async () => {
  const r = await verify(EMAIL, TEST_OTP_CODE)
  expect(r.status).toBe(200)
  expect((await r.json()).redirect).toMatch(/^\/(dashboard|onboarding)/)
})

// ── 4. Already-signed-in /login resumes next ─────────────────────────────────

test("GET /login?next=<safe> while signed in resumes there; unsafe falls back to /dashboard", async () => {
  const v = await verify(EMAIL, TEST_OTP_CODE, undefined)
  const cookie = (v.headers.get("set-cookie") || "").split(";")[0]
  expect(cookie).toContain("klav_session=")

  const safe = await fetch(`${BASE}/login?next=${encodeURIComponent("/inbox")}`, {
    headers: { cookie }, redirect: "manual",
  })
  expect(safe.status).toBe(302)
  expect(safe.headers.get("location")).toBe("/inbox")

  const unsafe = await fetch(`${BASE}/login?next=${encodeURIComponent("//evil.com")}`, {
    headers: { cookie }, redirect: "manual",
  })
  expect(unsafe.status).toBe(302)
  expect(unsafe.headers.get("location")).toBe("/dashboard")
})
