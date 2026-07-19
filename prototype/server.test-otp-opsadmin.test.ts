// KLAVITYKLA-304 — end-to-end: the Test-OTP bypass can be turned on and off from /opsadmin on a
// PRODUCTION-LIKE server (KLAV_TEST_OTP is NOT in the environment) with no restart, and the route
// stays invisible to non-ops-admins.
//
// Regression guard: before this, the only way to enable the bypass on prod was SSH + env edit +
// service restart — so this whole flow returned 404/401.
import { test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const OPS_EMAIL = `ops-${RUN}@test.local`
const PLAIN_EMAIL = `plain-${RUN}@test.local`
const TESTER_EMAIL = `tester-${RUN}@test.local`
const TEST_OTP_CODE = "666666"
const PORT = 38600 + Math.floor(Math.random() * 200)
const dbFile = join(tmpdir(), `klav-totp-ops-${RUN}.db`)
let srv: ReturnType<typeof Bun.spawn>
let BASE: string

function rmDb(f: string) { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(f + s) } catch {} } }

beforeAll(async () => {
  rmDb(dbFile)
  BASE = `http://localhost:${PORT}`
  srv = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(PORT),
      TURSO_DATABASE_URL: "file:" + dbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_BASE_URL: BASE,
      KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(66)).toString("base64"),
      KLAV_DEV_SHOW_OTP: "1",
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
      KLAV_ALLOWED_DOMAINS: "test.local",
      OPS_ADMIN_EMAILS: OPS_EMAIL,
      // Deliberately NO KLAV_TEST_OTP — this is the production shape.
      KLAV_TEST_OTP: "",
      KLAV_TEST_OTP_EMAILS: "",
    },
    stdout: "pipe", stderr: "pipe",
  })
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(BASE + "/api/health")).ok) return } catch {}
    await Bun.sleep(250)
  }
  throw new Error("server did not start")
}, 45_000)

afterAll(() => { try { srv?.kill() } catch {} ; rmDb(dbFile) })

/** Log in through the REAL OTP flow (dev code) and return the session cookie. */
async function loginReal(email: string): Promise<string> {
  const r1 = await fetch(BASE + "/api/auth/request", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }),
  })
  const d1 = await r1.json()
  expect(d1.devCode).toBeTruthy()
  const r2 = await fetch(BASE + "/api/auth/verify", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code: d1.devCode }),
  })
  expect(r2.status).toBe(200)
  return (r2.headers.get("set-cookie") || "").split(";")[0]
}

async function verifyWithBypass(email: string): Promise<number> {
  const r = await fetch(BASE + "/api/auth/verify", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code: TEST_OTP_CODE }),
  })
  return r.status
}

async function postGate(cookie: string, body: Record<string, string>): Promise<Response> {
  return fetch(BASE + "/opsadmin/test-otp", {
    method: "POST", headers: { cookie, "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(), redirect: "manual",
  })
}

let opsCookie = ""
let plainCookie = ""

test("bypass is OFF on a production-shaped server (no env var, nothing enabled)", async () => {
  opsCookie = await loginReal(OPS_EMAIL)
  plainCookie = await loginReal(PLAIN_EMAIL)
  expect(await verifyWithBypass(TESTER_EMAIL)).toBe(401)
}, 30_000)

test("a NON-ops-admin cannot see or reach the Test-OTP control (404)", async () => {
  const page = await fetch(BASE + "/opsadmin", { headers: { cookie: plainCookie } })
  expect(page.status).toBe(404)
  const post = await postGate(plainCookie, { action: "enable", emails: TESTER_EMAIL, hours: "1" })
  expect(post.status).toBe(404)
  // …and it did NOT take effect.
  expect(await verifyWithBypass(TESTER_EMAIL)).toBe(401)
}, 30_000)

test("an ops admin enables the bypass from /opsadmin — no SSH, no restart", async () => {
  const post = await postGate(opsCookie, { action: "enable", emails: TESTER_EMAIL, hours: "1" })
  expect(post.status).toBe(302)
  // Same running process, no restart: 666666 now logs the allowlisted tester in.
  expect(await verifyWithBypass(TESTER_EMAIL)).toBe(200)
}, 30_000)

test("a non-allowlisted email is still rejected while the gate is on", async () => {
  expect(await verifyWithBypass(`stranger-${RUN}@test.local`)).toBe(401)
}, 30_000)

test("the bypass login shows up in the [TEST-OTP-USED] audit view", async () => {
  const html = await (await fetch(BASE + "/opsadmin", { headers: { cookie: opsCookie } })).text()
  expect(html).toContain("TEST-OTP-USED")
  expect(html).toContain(TESTER_EMAIL)
  expect(html).toContain("ENABLED")
}, 30_000)

test("an ops admin disables it again and 666666 stops working immediately", async () => {
  const post = await postGate(opsCookie, { action: "disable" })
  expect(post.status).toBe(302)
  expect(await verifyWithBypass(TESTER_EMAIL)).toBe(401)
}, 30_000)

test("enabling without a duration or without an allowlist is refused", async () => {
  expect((await postGate(opsCookie, { action: "enable", emails: TESTER_EMAIL, hours: "0" })).status).toBe(400)
  expect((await postGate(opsCookie, { action: "enable", emails: "", hours: "1" })).status).toBe(400)
  expect(await verifyWithBypass(TESTER_EMAIL)).toBe(401)
}, 30_000)
