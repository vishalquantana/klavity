// Step 5: `klav_uid` — the opaque per-user browser-cache-namespace / continuity cookie.
//   • set alongside the session on EVERY session-creation path (one shared helper), cleared with the session,
//   • HMAC-derived (KLAV_SECRET), 32 hex chars, stable per user, differs between users, exposes no email/secret,
//   • JS-readable (not HttpOnly) but never an auth input; the auth cookie keeps its HttpOnly properties,
//   • dashboard/sim page responses (200 and 304) re-assert it WITHOUT making the shared body/ETag per-user,
//   • POST /api/auth/logout clears klav_session + klav_proj + klav_uid with separate Set-Cookie headers.
import { test, expect, beforeAll, afterAll } from "bun:test"
import * as net from "node:net"
import { readFileSync, unlinkSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const SECRET = Buffer.from(new Uint8Array(32).fill(91)).toString("base64")
process.env.KLAV_SECRET = SECRET
const { userCacheUid } = await import("./lib/crypto")

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = net.createServer(); s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}
const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB = join(tmpdir(), `klav-uid-${RUN}.db`)
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB + s) } catch {} } }
const EMAIL_1 = `uid-one-${RUN}@test.local`, EMAIL_2 = `uid-two-${RUN}@test.local`, EMAIL_3 = `uid-three-${RUN}@test.local`
let srv: ReturnType<typeof Bun.spawn>, BASE = ""

beforeAll(async () => {
  rmDb()
  const port = await freePort(); BASE = `http://localhost:${port}`
  srv = Bun.spawn([process.execPath, "server.ts"], {
    cwd: import.meta.dir,
    env: { ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB, TURSO_AUTH_TOKEN: "", KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local", KLAV_DEV_SHOW_OTP: "1", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", OPENROUTER_API_KEY: "test-key" },
    stdout: "ignore", stderr: "ignore",
  })
  const dl = Date.now() + 15_000
  while (Date.now() < dl) { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(150) }
}, 25_000)
afterAll(() => { srv?.kill(); rmDb() })

const ip = { "content-type": "application/json", "x-forwarded-for": "127.0.0.9" }
// The OTP endpoint is rate-limited per email, so each user logs in at most as often as a test truly needs:
// memoized sessions for read-only tests, one extra login for the "stable across logins" test, a throwaway for logout.
const memo = new Map<string, ReturnType<typeof login>>()
const loginOnce = (email: string) => { if (!memo.has(email)) memo.set(email, login(email)); return memo.get(email)! }
async function login(email: string) {
  const rq = await fetch(`${BASE}/api/auth/request`, { method: "POST", headers: ip, body: JSON.stringify({ email }) })
  const { devCode } = await rq.json()
  const r = await fetch(`${BASE}/api/auth/verify`, { method: "POST", headers: ip, body: JSON.stringify({ email, code: devCode }) })
  expect(r.status).toBe(200)
  const setCookies = r.headers.getSetCookie()
  const pick = (n: string) => setCookies.find((c) => c.startsWith(n + "="))
  const val = (c?: string) => (c || "").split(";")[0].split("=")[1]
  return { setCookies, session: pick("klav_session"), uid: pick("klav_uid"), sid: val(pick("klav_session")), uidVal: val(pick("klav_uid")) }
}

test("uid derivation: HMAC-SHA256(KLAV_SECRET, 'klav_uid:v1:' + lower(email)), 32 hex chars, case-insensitive, no secret ⇒ empty", () => {
  const u = userCacheUid(EMAIL_1)
  expect(u).toMatch(/^[0-9a-f]{32}$/)
  const expected = new Bun.CryptoHasher("sha256", SECRET).update("klav_uid:v1:" + EMAIL_1.toLowerCase()).digest("hex").slice(0, 32)
  expect(u).toBe(expected)
  expect(userCacheUid(EMAIL_1.toUpperCase())).toBe(u)
  expect(userCacheUid(EMAIL_2)).not.toBe(u)
  const saved = process.env.KLAV_SECRET; delete process.env.KLAV_SECRET
  expect(userCacheUid(EMAIL_1)).toBe("")                                 // fail closed: no secret → no cookie, never a guessable value
  process.env.KLAV_SECRET = saved
  expect(userCacheUid("")).toBe("")
})

test("OTP login sets klav_session (HttpOnly, FIRST) AND klav_uid (JS-readable, 32 hex) as separate Set-Cookie headers", async () => {
  const a = await loginOnce(EMAIL_1)
  expect(a.setCookies.length).toBeGreaterThanOrEqual(2)
  expect(a.setCookies[0]).toMatch(/^klav_session=/)                        // klav_session stays first
  expect(a.session).toContain("HttpOnly")                                  // auth cookie properties NOT weakened
  expect(a.session).toContain("SameSite=Lax"); expect(a.session).toContain("Max-Age=7776000")
  expect(a.uid).toBeTruthy()
  expect(a.uidVal).toBe(userCacheUid(EMAIL_1))
  expect(a.uid).not.toContain("HttpOnly")                                  // dashboard JS must read it
  expect(a.uid).toContain("Path=/"); expect(a.uid).toContain("SameSite=Lax"); expect(a.uid).toContain("Max-Age=7776000")
})

test("klav_uid is stable per user, differs between users, and contains no email / session id / secret", async () => {
  const a1 = await loginOnce(EMAIL_1), a2 = await login(EMAIL_1), b = await loginOnce(EMAIL_2)
  expect(a1.uidVal).toBe(a2.uidVal)                                        // stable across logins
  expect(a1.uidVal).not.toBe(b.uidVal)                                     // differs between users
  expect(a1.sid).not.toBe(a2.sid)                                          // (the session id itself does change)
  for (const c of [a1, b]) {
    expect(c.uidVal).toMatch(/^[0-9a-f]{32}$/)
    expect(c.uid!).not.toContain("@")
    expect(c.uid!.toLowerCase()).not.toContain(EMAIL_1.split("@")[0].toLowerCase())
    expect(c.uid!).not.toContain(c.sid)
    expect(c.uid!).not.toContain(SECRET)
  }
})

test("/dashboard response (200) re-asserts klav_uid for the authenticated user; the body + ETag stay SHARED across users", async () => {
  const a = await loginOnce(EMAIL_1), b = await loginOnce(EMAIL_2)
  const ra = await fetch(`${BASE}/dashboard`, { headers: { cookie: `klav_session=${a.sid}` }, redirect: "manual" })
  const rb = await fetch(`${BASE}/dashboard`, { headers: { cookie: `klav_session=${b.sid}` }, redirect: "manual" })
  expect(ra.status).toBe(200); expect(rb.status).toBe(200)
  const ca = ra.headers.getSetCookie().find((c) => c.startsWith("klav_uid=")), cb = rb.headers.getSetCookie().find((c) => c.startsWith("klav_uid="))
  expect(ca!.split(";")[0]).toBe("klav_uid=" + userCacheUid(EMAIL_1))
  expect(cb!.split(";")[0]).toBe("klav_uid=" + userCacheUid(EMAIL_2))
  expect(ca).not.toContain("HttpOnly")
  const ta = await ra.text(), tb = await rb.text()
  expect(ta).toBe(tb)                                                      // one shared rendered body…
  expect(ra.headers.get("etag")).toBe(rb.headers.get("etag"))              // …and one shared ETag (not made per-user)
  expect(ta).not.toContain(userCacheUid(EMAIL_1)); expect(ta).not.toContain(EMAIL_1)   // identity is NOT embedded in the HTML
  expect(ra.headers.get("cache-control")).toContain("private")
  expect(ra.headers.get("vary")).toBe("Cookie")
})

test("/dashboard 304 (If-None-Match) still works AND still carries klav_uid; /sim/new does too", async () => {
  const a = await loginOnce(EMAIL_1)
  const r1 = await fetch(`${BASE}/dashboard`, { headers: { cookie: `klav_session=${a.sid}` } })
  const etag = r1.headers.get("etag")!
  await r1.text()
  const r2 = await fetch(`${BASE}/dashboard`, { headers: { cookie: `klav_session=${a.sid}`, "if-none-match": etag } })
  expect(r2.status).toBe(304)
  expect(r2.headers.getSetCookie().find((c) => c.startsWith("klav_uid="))!.split(";")[0]).toBe("klav_uid=" + userCacheUid(EMAIL_1))
  const r3 = await fetch(`${BASE}/sim/new`, { headers: { cookie: `klav_session=${a.sid}` } })
  expect(r3.status).toBe(200)
  expect(r3.headers.getSetCookie().find((c) => c.startsWith("klav_uid="))!.split(";")[0]).toBe("klav_uid=" + userCacheUid(EMAIL_1))
})

test("an unauthenticated /dashboard gets NO klav_uid (and is not the dashboard)", async () => {
  const r = await fetch(`${BASE}/dashboard`, { redirect: "manual" })
  expect(r.headers.getSetCookie().some((c) => c.startsWith("klav_uid="))).toBe(false)
})

test("POST /api/auth/logout clears klav_session, klav_proj AND klav_uid with separate Set-Cookie headers", async () => {
  const a = await loginOnce(EMAIL_3)
  const r = await fetch(`${BASE}/api/auth/logout`, { method: "POST", headers: { cookie: `klav_session=${a.sid}; klav_proj=p1; klav_uid=${a.uidVal}` } })
  expect(r.status).toBe(200)
  const sc = r.headers.getSetCookie()
  expect(sc.length).toBe(3)
  for (const n of ["klav_session", "klav_proj", "klav_uid"]) {
    const c = sc.find((x) => x.startsWith(n + "="))!
    expect(c).toBeTruthy()
    expect(c).toContain("Max-Age=0"); expect(c.split(";")[0]).toBe(n + "=")
  }
  expect(sc.find((x) => x.startsWith("klav_session="))).toContain("HttpOnly")   // the auth-cookie clear keeps HttpOnly
  // the server really ended the session
  const after = await fetch(`${BASE}/api/dashboard`, { headers: { cookie: `klav_session=${a.sid}` } })
  expect(after.status).toBe(401)
})

test("klav_uid is NEVER an auth input: a forged/foreign klav_uid with no session grants nothing, and with a session changes nothing", async () => {
  const a = await loginOnce(EMAIL_1)
  const forged = userCacheUid(EMAIL_2)
  const noSession = await fetch(`${BASE}/api/dashboard`, { headers: { cookie: `klav_uid=${forged}` } })
  expect(noSession.status).toBe(401)
  const withSession = await fetch(`${BASE}/api/dashboard`, { headers: { cookie: `klav_session=${a.sid}; klav_uid=${forged}` } })
  expect(withSession.status).toBe(200)
  expect((await withSession.json()).email).toBe(EMAIL_1)                   // the session decides who you are, not klav_uid
})

// ── static: every session-creation path goes through the ONE shared helper ──────────────────────────────────
const SERVER = readFileSync(join(import.meta.dir, "server.ts"), "utf8").replace(/\r\n/g, "\n")
test("every createSession() call site sets cookies via sessionCookies() (OTP verify, OIDC, SAML ACS, per-ticket viewer)", () => {
  const lines = SERVER.split("\n")
  const sites = lines.map((l, i) => (/^\s*await createSession\(/.test(l) ? i : -1)).filter((i) => i >= 0)
  expect(sites.length).toBe(4)                                              // if a 5th path is added it must be covered here too
  for (const i of sites) {
    const window = lines.slice(i, i + 40).join("\n")
    expect(window).toContain("sessionCookies(sid,")
  }
  // no raw klav_session Set-Cookie outside the helper
  const raw = lines.filter((l) => /cookie\("klav_session"/.test(l))
  expect(raw.length).toBe(1)                                                // only inside sessionCookies()
  expect(raw[0]).toContain("SESSION_DAYS")
})

test("self-erasure that clears the session also clears klav_proj/klav_uid; logout uses the same clear helper", () => {
  expect(SERVER).toMatch(/clearSelf \? sessionClearCookies\(\) : \[\]/)
  expect(SERVER).toMatch(/jsonWithCookies\(\{ ok: true \}, 200, sessionClearCookies\(\)\)/)
})
