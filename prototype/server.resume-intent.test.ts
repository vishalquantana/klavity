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
//   5. A BRAND-NEW user still gets /onboarding even when they arrived via a gated deep link —
//      the intent is carried forward as /onboarding?next=<intent>, never used to skip setup.
//   6. login.html TTLs the sessionStorage intent stash and clears it on a next-less /login load.

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

// Regression: a theirs-wins merge reverted /dashboard and /sim/new to a bare redirect("/login"),
// silently dropping the intent of every shared deep link. Both must go through loginGate.
test("GET /sim/new?mode=site while logged out keeps the mode in ?next=", async () => {
  const r = await fetch(`${BASE}/sim/new?mode=site`, { redirect: "manual" })
  expect(r.status).toBe(302)
  expect(r.headers.get("location")).toBe("/login?next=" + encodeURIComponent("/sim/new?mode=site"))
})

test("GET /sim/new/ (trailing slash) while logged out also captures intent", async () => {
  const r = await fetch(`${BASE}/sim/new/`, { redirect: "manual" })
  expect(r.status).toBe(302)
  expect(r.headers.get("location")).toBe("/login?next=" + encodeURIComponent("/sim/new/"))
})

test("no logged-out GET gate drops intent with a bare /login redirect", async () => {
  for (const p of ["/dashboard", "/sim/new?mode=site", "/inbox", "/autosims", "/sim-runs", "/app"]) {
    const r = await fetch(`${BASE}${p}`, { redirect: "manual" })
    expect(r.status).toBe(302)
    expect(r.headers.get("location")).toStartWith("/login?next=")
  }
})

// ── 2. verify honors a safe next ─────────────────────────────────────────────

// Regression: a gated deep link must NOT let a brand-new account skip /onboarding. This is the
// FIRST verify for EMAIL, so wasNew is true — the intent rides along as ?next= instead of winning.
test("a brand-new user with a next still lands on /onboarding, intent carried forward", async () => {
  const r = await verify(EMAIL, TEST_OTP_CODE, "/sim/new?mode=site")
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  expect(body.redirect).toBe("/onboarding?next=" + encodeURIComponent("/sim/new?mode=site"))
})

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

// ── 5/6. login.html intent stash hygiene ─────────────────────────────────────
// Regression: the stash used to persist forever and survive a next-less /login load, so an
// abandoned OTP could silently teleport a much later login to a stale destination. Asserted
// against the served page so a rebuild/merge that drops the guard fails here.

test("login.html TTLs the resume stash and clears it when /login has no ?next=", async () => {
  const html = await (await fetch(`${BASE}/login`)).text()
  // TTL exists and is bounded (not "forever").
  expect(html).toContain("RESUME_TTL_MS")
  const ttl = html.match(/RESUME_TTL_MS\s*=\s*([0-9*\s]+)/)
  expect(ttl).toBeTruthy()
  // eslint-disable-next-line no-eval
  const ttlMs = eval(ttl![1])
  expect(ttlMs).toBeGreaterThan(0)
  expect(ttlMs).toBeLessThanOrEqual(60 * 60 * 1000)
  // The no-next branch drops the stash.
  expect(html).toContain('sessionStorage.removeItem("klavResumeNext")')
  // The stash is written timestamped, not as a bare path.
  expect(html).toContain('JSON.stringify({ v: safe, t: Date.now() })')
  // Any restore is TTL-checked.
  expect(html).toMatch(/Date\.now\(\)\s*-\s*rec\.t\s*>\s*RESUME_TTL_MS/)
})
