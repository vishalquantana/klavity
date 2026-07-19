// Pre-signup "instant aha" gate exemptions — the blanket /api/* login gate must NOT swallow
// the intentionally-anonymous AI demo endpoints that power site/onboarding.html step 0:
//   * POST /api/persona/site
//   * POST /api/sim/preview
// Both carry their own protection (aiDemoLimited per-IP throttle, SSRF safeFetch guard, payload
// caps), so an anonymous call may fail for OTHER reasons (unreachable URL → 400) but must never
// hit the 401 "Sign in to continue." gate. Everything else under /api/* stays gated.
//
// Drives a REAL server subprocess (same hermetic pattern as server.utm-attribution.test.ts).

import { test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(51)).toString("base64")
const PORT = 39120 + Math.floor(Math.random() * 200)
const BASE = `http://localhost:${PORT}`

function rmDb(f: string) {
  for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(f + s) } catch {} }
}

const dbFile = join(tmpdir(), `klav-anongate-${RUN}.db`)
let srv: ReturnType<typeof Bun.spawn>

beforeAll(async () => {
  rmDb(dbFile)
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

afterAll(() => {
  srv?.kill()
  rmDb(dbFile)
})

function anonPost(path: string, body: Record<string, unknown>) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
}

// A loopback target: reaches the handler, then fails the SSRF guard (400) — proving the request
// got PAST the login gate without needing a real outbound fetch or an LLM call.
const LOOPBACK_URL = "http://127.0.0.1:1"

test("anonymous POST /api/sim/preview is NOT swallowed by the login gate", async () => {
  const r = await anonPost("/api/sim/preview", { url: LOOPBACK_URL })
  expect(r.status).not.toBe(401)
  const j: any = await r.json()
  expect(j.error ?? "").not.toBe("Sign in to continue.")
  // The SSRF guard (the endpoint's own protection) rejected the loopback target instead.
  expect(r.status).toBe(400)
})

test("anonymous POST /api/persona/site is NOT swallowed by the login gate", async () => {
  const r = await anonPost("/api/persona/site", { url: LOOPBACK_URL })
  expect(r.status).not.toBe(401)
  const j: any = await r.json()
  expect(j.error ?? "").not.toBe("Sign in to continue.")
  expect(r.status).toBe(400)
})

test("anonymous POST /api/persona/brief (NOT allowlisted) still hits the login gate", async () => {
  const r = await anonPost("/api/persona/brief", { brief: "a busy founder" })
  expect(r.status).toBe(401)
  const j: any = await r.json()
  expect(j.error).toBe("Sign in to continue.")
})

test("anonymous GET /api/me still redirects to /login (gate intact for everything else)", async () => {
  const r = await fetch(`${BASE}/api/me`, { redirect: "manual" })
  expect(r.status).toBe(302)
  expect(r.headers.get("location")).toBe("/login")
})
