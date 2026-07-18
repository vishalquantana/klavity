// server.utm-attribution.test.ts
// KLAVITYKLA-324 — first-touch UTM/referrer attribution capture & persistence.
//
// Contract under test (server side; the client capture lives in site/attr.js):
//   * POST /api/auth/verify accepts an optional `attr` object in the JSON body, OR recovers it
//     from the `klav_attr` cookie when the body omits it.
//   * Attribution is written ONLY on a genuinely-new signup (wasNew), through sanitizeAttr — the
//     single choke point — into users.* and the utm trio on the freshly-created accounts row.
//   * First-touch wins: a returning login never overwrites the stored source (COALESCE + wasNew-only).
//   * A hostile / oversized / unknown-key payload is sanitized, never rejected — signup still succeeds.
//   * A signup with NO attribution at all still succeeds and returns the normal redirect — login
//     must never break on a missing/blank attr.
//
// We drive a REAL server subprocess (KLAV_TEST_OTP=1 so 666666 is a valid code for allowlisted
// emails) and read the persisted rows back by opening the same SQLite file directly.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"
import { sanitizeAttr } from "./lib/attr"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const TEST_SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")
const TEST_OTP_CODE = "666666"
const PORT = 38520 + Math.floor(Math.random() * 200)
const BASE = `http://localhost:${PORT}`

function rmDb(f: string) {
  for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(f + s) } catch {} }
}

const dbFile = join(tmpdir(), `klav-utmattr-${RUN}.db`)
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
      KLAV_TEST_OTP: "1",
      // allow every email we mint below (they all share the RUN suffix)
      KLAV_TEST_OTP_EMAILS: [
        `body-${RUN}@test.local`, `cookie-${RUN}@test.local`, `firsttouch-${RUN}@test.local`,
        `hostile-${RUN}@test.local`, `noattr-${RUN}@test.local`,
      ].join(","),
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

function verify(email: string, extra: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.2", ...headers },
    body: JSON.stringify({ email, code: TEST_OTP_CODE, ...extra }),
  })
}

// Open a FRESH client per read: the server writes from a separate process over WAL, and a
// long-lived reader can hold a stale snapshot — a fresh connection always sees committed writes.
async function userRow(email: string) {
  const c = createClient({ url: "file:" + dbFile })
  try {
    const r = await c.execute({ sql: "SELECT * FROM users WHERE email=?", args: [email] })
    return r.rows[0] as any
  } finally { c.close() }
}
async function accountRow(email: string) {
  const c = createClient({ url: "file:" + dbFile })
  try {
    const r = await c.execute({ sql: "SELECT * FROM accounts WHERE owner_email=?", args: [email] })
    return r.rows[0] as any
  } finally { c.close() }
}

// ── (a) body attr persists to users + accounts ───────────────────────────────
test("(a) new signup with attr in body persists all columns to users + the utm trio to accounts", async () => {
  const email = `body-${RUN}@test.local`
  const attr = {
    source: "reddit", medium: "social", campaign: "launch", term: "bugs", content: "hero",
    gclid: "g123", fbclid: "f456", referrer: "https://reddit.com/r/webdev",
    landing_page: "/pricing", first_seen_at: 1_700_000_000_000,
  }
  const r = await verify(email, { attr })
  expect(r.status).toBe(200)
  expect((await r.json()).ok).toBe(true)

  const u = await userRow(email)
  expect(u.utm_source).toBe("reddit")
  expect(u.utm_medium).toBe("social")
  expect(u.utm_campaign).toBe("launch")
  expect(u.utm_term).toBe("bugs")
  expect(u.utm_content).toBe("hero")
  expect(u.attr_referrer).toBe("https://reddit.com/r/webdev")
  expect(u.attr_landing_page).toBe("/pricing")
  expect(Number(u.attr_first_seen_at)).toBe(1_700_000_000_000)

  const a = await accountRow(email)
  expect(a.utm_source).toBe("reddit")
  expect(a.utm_medium).toBe("social")
  expect(a.utm_campaign).toBe("launch")
})

// ── (b) cookie fallback when body omits attr ─────────────────────────────────
test("(b) cookie fallback works when the body has no attr field", async () => {
  const email = `cookie-${RUN}@test.local`
  const cookieAttr = { source: "x", medium: "referral", campaign: "thread" }
  const cookie = "klav_attr=" + encodeURIComponent(JSON.stringify(cookieAttr))
  const r = await verify(email, {}, { cookie })
  expect(r.status).toBe(200)

  const u = await userRow(email)
  expect(u.utm_source).toBe("x")
  expect(u.utm_medium).toBe("referral")
  expect(u.utm_campaign).toBe("thread")
  const a = await accountRow(email)
  expect(a.utm_source).toBe("x")
})

// ── (c) first-touch wins across a second login ───────────────────────────────
test("(c) first touch wins — a second login with different UTM does not overwrite stored values", async () => {
  const email = `firsttouch-${RUN}@test.local`
  // first touch: reddit
  await verify(email, { attr: { source: "reddit", medium: "social", campaign: "launch" } })
  let u = await userRow(email)
  expect(u.utm_source).toBe("reddit")

  // returning login from a different link: google — must NOT clobber the original source
  const r2 = await verify(email, { attr: { source: "google", medium: "cpc", campaign: "brand" } })
  expect(r2.status).toBe(200)
  u = await userRow(email)
  expect(u.utm_source).toBe("reddit")
  expect(u.utm_medium).toBe("social")
  expect(u.utm_campaign).toBe("launch")
  const a = await accountRow(email)
  expect(a.utm_source).toBe("reddit")
})

// ── (d) hostile payload is sanitized, not rejected ───────────────────────────
test("(d) a hostile attr payload in the body is sanitized, not rejected — signup still succeeds", async () => {
  const email = `hostile-${RUN}@test.local`
  const hostile = {
    source: "x".repeat(5000),                 // oversized -> clamped to 200
    medium: "  keeper  ",                      // whitespace -> trimmed
    campaign: { nested: "obj" },              // non-string object -> coerced, never a column
    evil_key: "DROP TABLE users",             // unknown key -> dropped
    first_seen_at: "not-a-number",            // invalid -> dropped
  }
  const r = await verify(email, { attr: hostile })
  expect(r.status).toBe(200)
  expect((await r.json()).ok).toBe(true)

  const u = await userRow(email)
  expect(String(u.utm_source).length).toBeLessThanOrEqual(200)
  expect(u.utm_medium).toBe("keeper")          // trimmed end-to-end
  // unknown key never becomes a column
  expect((u as any).evil_key).toBeUndefined()
  // invalid first_seen_at dropped -> NULL
  expect(u.attr_first_seen_at == null).toBe(true)
})

// ── (e) no attribution at all still signs up cleanly ─────────────────────────
test("(e) signup with no attribution at all still succeeds — login must never break", async () => {
  const email = `noattr-${RUN}@test.local`
  const r = await verify(email) // no attr in body, no cookie
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.ok).toBe(true)
  expect(body.redirect).toMatch(/\/(dashboard|onboarding)/)
  expect(r.headers.get("set-cookie")).toContain("klav_session=")

  const u = await userRow(email)
  expect(u.utm_source == null).toBe(true)
  expect(u.utm_medium == null).toBe(true)
})

// ── sanitizeAttr unit tests (the single server-side choke point) ─────────────
test("sanitizeAttr returns null for non-object / empty / all-blank input", () => {
  expect(sanitizeAttr(null)).toBeNull()
  expect(sanitizeAttr(undefined)).toBeNull()
  expect(sanitizeAttr("reddit")).toBeNull()
  expect(sanitizeAttr(["a", "b"])).toBeNull()
  expect(sanitizeAttr({})).toBeNull()
  expect(sanitizeAttr({ source: "   ", medium: "" })).toBeNull()
})

test("sanitizeAttr keeps only allowlisted keys and drops the rest", () => {
  const out = sanitizeAttr({ source: "reddit", medium: "social", evil: "x", DROP: "TABLE" })
  expect(out).toEqual({ source: "reddit", medium: "social" })
  expect((out as any).evil).toBeUndefined()
})

test("sanitizeAttr clamps every string field to 200 chars", () => {
  const out = sanitizeAttr({ source: "a".repeat(1000) })!
  expect(out.source!.length).toBe(200)
})

test("sanitizeAttr trims surrounding whitespace", () => {
  const out = sanitizeAttr({ campaign: "  launch  " })!
  expect(out.campaign).toBe("launch")
})

test("sanitizeAttr coerces first_seen_at to a finite positive number, else drops it", () => {
  expect(sanitizeAttr({ first_seen_at: 1700000000000 })!.first_seen_at).toBe(1700000000000)
  expect(sanitizeAttr({ first_seen_at: "1700000000000" })!.first_seen_at).toBe(1700000000000)
  expect(sanitizeAttr({ source: "x", first_seen_at: "nope" })!.first_seen_at).toBeUndefined()
  expect(sanitizeAttr({ source: "x", first_seen_at: -5 })!.first_seen_at).toBeUndefined()
})
