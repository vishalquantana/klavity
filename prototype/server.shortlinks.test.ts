// Integration tests for the short-link surface: public /s/:code redirector (Task 3) and the
// OPS_ADMIN-gated /api/superadmin/links CRUD API (Task 4). Hermetic spawned-server pattern.
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
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-shortlinks-srv-${RUN}.db`)
const TEST_SECRET = Buffer.alloc(32, 7).toString("base64")
const PORT = await __freePortKLA719()
const BASE = `http://localhost:${PORT}`

const ADMIN_EMAIL = `ops-${RUN}@test.local`
const ADMIN_SID = `sess_ops_${RUN}`
const USER_EMAIL = `plain-${RUN}@test.local`
const USER_SID = `sess_plain_${RUN}`

// A non-private, public literal IP as a destination host so the SSRF guard passes WITHOUT any DNS.
const PUBLIC_DEST = "https://93.184.216.34/landing"

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

let proc: ReturnType<typeof Bun.spawn>
const adminCookie = `klav_session=${ADMIN_SID}`
const userCookie = `klav_session=${USER_SID}`

async function query(sql: string, args: any[] = []) { return (await raw.execute({ sql, args })).rows }

beforeAll(async () => {
  proc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(PORT),
      TURSO_DATABASE_URL: "file:" + DB_FILE,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: TEST_SECRET,
      KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local",
      OPS_ADMIN_EMAILS: ADMIN_EMAIL,
      SENDGRID_API_KEY: "",
      KLAV_MAIL_FROM: "",
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
  // Server boot ran initDb() → schema (incl. short_links). Seed auth rows now.
  const NOW = Date.now()
  await raw.execute({ sql: "INSERT INTO users (email, created_at) VALUES (?, ?)", args: [ADMIN_EMAIL, NOW] })
  await raw.execute({ sql: "INSERT INTO users (email, created_at) VALUES (?, ?)", args: [USER_EMAIL, NOW] })
  await raw.execute({ sql: "INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?,?,?,?)", args: [ADMIN_SID, ADMIN_EMAIL, NOW, NOW + 86400_000] })
  await raw.execute({ sql: "INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?,?,?,?)", args: [USER_SID, USER_EMAIL, NOW, NOW + 86400_000] })
})

afterAll(() => { proc?.kill(); raw.close(); rmDb() })

// ── Task 3: public redirector ───────────────────────────────────────────────────
test("GET /s/:code → 302 with merged UTMs + Cache-Control:no-store (NEVER 301)", async () => {
  const CODE = "redir1"
  await raw.execute({
    sql: `INSERT INTO short_links (id, code, destination_url, utm_source, utm_medium, utm_campaign, kind, active, created_at, click_count)
          VALUES (?,?,?,?,?,?,?,1,?,0)`,
    args: [`lnk_${RUN}_1`, CODE, "https://example.com/p?keep=1", "reddit", "post", "q3", "campaign", new Date().toISOString()],
  })
  const r = await fetch(`${BASE}/s/${CODE}`, { redirect: "manual" })
  expect(r.status).toBe(302)
  expect(r.status).not.toBe(301)
  expect(r.headers.get("cache-control")).toBe("no-store")
  const loc = new URL(r.headers.get("location")!)
  expect(loc.searchParams.get("utm_source")).toBe("reddit")
  expect(loc.searchParams.get("utm_medium")).toBe("post")
  expect(loc.searchParams.get("utm_campaign")).toBe("q3")
  expect(loc.searchParams.get("keep")).toBe("1")
})

test("GET /s/:slug resolves by vanity slug and logs a human click", async () => {
  await raw.execute({
    sql: `INSERT INTO short_links (id, code, slug, destination_url, kind, active, created_at, click_count)
          VALUES (?,?,?,?,?,1,?,0)`,
    args: [`lnk_${RUN}_2`, "code002", "my-slug", PUBLIC_DEST, "campaign", new Date().toISOString()],
  })
  const r = await fetch(`${BASE}/s/my-slug`, { redirect: "manual", headers: { "user-agent": "Mozilla/5.0 Chrome/120" } })
  expect(r.status).toBe(302)
  await Bun.sleep(200) // fire-and-forget click log
  const rows = await query("SELECT is_bot FROM link_clicks WHERE link_id=?", [`lnk_${RUN}_2`])
  expect(rows.length).toBe(1)
  expect(Number(rows[0].is_bot)).toBe(0)
  const cnt = await query("SELECT click_count FROM short_links WHERE id=?", [`lnk_${RUN}_2`])
  expect(Number(cnt[0].click_count)).toBe(1)
})

test("unknown code → 404", async () => {
  const r = await fetch(`${BASE}/s/does-not-exist`, { redirect: "manual" })
  expect(r.status).toBe(404)
})

test("inactive link → 404 (public redirect is active-only)", async () => {
  await raw.execute({
    sql: `INSERT INTO short_links (id, code, destination_url, kind, active, created_at, click_count)
          VALUES (?,?,?,?,0,?,0)`,
    args: [`lnk_${RUN}_3`, "inactiv", PUBLIC_DEST, "campaign", new Date().toISOString()],
  })
  const r = await fetch(`${BASE}/s/inactiv`, { redirect: "manual" })
  expect(r.status).toBe(404)
})

test("HEAD / bot request still redirects but logs is_bot=1", async () => {
  await raw.execute({
    sql: `INSERT INTO short_links (id, code, destination_url, kind, active, created_at, click_count)
          VALUES (?,?,?,?,1,?,0)`,
    args: [`lnk_${RUN}_4`, "botcode", PUBLIC_DEST, "campaign", new Date().toISOString()],
  })
  const r = await fetch(`${BASE}/s/botcode`, { method: "HEAD", redirect: "manual" })
  expect(r.status).toBe(302)
  await Bun.sleep(200)
  const rows = await query("SELECT is_bot FROM link_clicks WHERE link_id=?", [`lnk_${RUN}_4`])
  expect(rows.length).toBe(1)
  expect(Number(rows[0].is_bot)).toBe(1)
})

test("referer with a query string is logged HOST-ONLY (no email/token PII) — Codex HIGH", async () => {
  await raw.execute({
    sql: `INSERT INTO short_links (id, code, destination_url, kind, active, created_at, click_count)
          VALUES (?,?,?,?,1,?,0)`,
    args: [`lnk_${RUN}_pii`, "piicode", PUBLIC_DEST, "campaign", new Date().toISOString()],
  })
  const r = await fetch(`${BASE}/s/piicode`, {
    redirect: "manual",
    headers: { "user-agent": "Mozilla/5.0 Chrome/120.0.0.0", referer: "https://ref.example/path?email=a@b.com&token=123" },
  })
  expect(r.status).toBe(302)
  await Bun.sleep(200)
  const rows = await query("SELECT referer, ua FROM link_clicks WHERE link_id=?", [`lnk_${RUN}_pii`])
  expect(rows.length).toBe(1)
  const referer = String(rows[0].referer)
  expect(referer).toBe("ref.example") // host only
  expect(referer).not.toContain("email")
  expect(referer).not.toContain("a@b.com")
  expect(referer).not.toContain("token")
  // UA is coarsened: the precise version is stripped
  expect(String(rows[0].ua)).not.toContain("120.0.0.0")
})

test("malformed percent-encoding /s/% → stable 404, not a 500 — Codex LOW", async () => {
  const r = await fetch(`${BASE}/s/%`, { redirect: "manual" })
  expect(r.status).toBe(404)
})

test("burst of repeated hits from one IP is LOG-capped but ALWAYS redirects 302 — Codex MED", async () => {
  await raw.execute({
    sql: `INSERT INTO short_links (id, code, destination_url, kind, active, created_at, click_count)
          VALUES (?,?,?,?,1,?,0)`,
    args: [`lnk_${RUN}_burst`, "burstc", PUBLIC_DEST, "campaign", new Date().toISOString()],
  })
  const N = 40
  let redirects = 0
  for (let i = 0; i < N; i++) {
    const r = await fetch(`${BASE}/s/burstc`, { redirect: "manual", headers: { "user-agent": "Mozilla/5.0 Chrome/120" } })
    if (r.status === 302) redirects++
  }
  expect(redirects).toBe(N) // the redirect is NEVER throttled
  await Bun.sleep(300)
  const rows = await query("SELECT COUNT(*) AS c FROM link_clicks WHERE link_id=?", [`lnk_${RUN}_burst`])
  const logged = Number(rows[0].c)
  // Bounded: far fewer rows than requests (human cap is 20/window), so counts can't be inflated.
  expect(logged).toBeGreaterThan(0)
  expect(logged).toBeLessThanOrEqual(20)
  expect(logged).toBeLessThan(N)
  const cnt = await query("SELECT click_count FROM short_links WHERE id=?", [`lnk_${RUN}_burst`])
  expect(Number(cnt[0].click_count)).toBe(logged) // denormalized counter matches the (capped) row count
})

// ── Task 4: superadmin CRUD API ─────────────────────────────────────────────────
test("POST /api/superadmin/links: non-ops-admin → 403", async () => {
  const r = await fetch(`${BASE}/api/superadmin/links`, {
    method: "POST", headers: { "content-type": "application/json", cookie: userCookie },
    body: JSON.stringify({ destinationUrl: PUBLIC_DEST }),
  })
  expect(r.status).toBe(403)
})

test("POST /api/superadmin/links: anonymous → 403", async () => {
  const r = await fetch(`${BASE}/api/superadmin/links`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ destinationUrl: PUBLIC_DEST }),
  })
  expect(r.status).toBe(403)
})

test("POST create with private-host destination → 400 (SSRF guard)", async () => {
  const r = await fetch(`${BASE}/api/superadmin/links`, {
    method: "POST", headers: { "content-type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ destinationUrl: "https://10.0.0.1/secret" }),
  })
  expect(r.status).toBe(400)
})

test("POST create returns a generated 6-char code; GET list shows it", async () => {
  const r = await fetch(`${BASE}/api/superadmin/links`, {
    method: "POST", headers: { "content-type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ destinationUrl: PUBLIC_DEST, utm: { source: "gen" }, label: "Gen" }),
  })
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.code).toMatch(/^[0-9A-Za-z]{6}$/)

  const list = await fetch(`${BASE}/api/superadmin/links`, { headers: { cookie: adminCookie } })
  expect(list.status).toBe(200)
  const rows = (await list.json()).links
  const found = rows.find((x: any) => x.code === body.code)
  expect(found).toBeTruthy()
  expect(found).toHaveProperty("clickCount")
})

test("POST with a valid vanity slug, then duplicate slug → 409", async () => {
  const first = await fetch(`${BASE}/api/superadmin/links`, {
    method: "POST", headers: { "content-type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ destinationUrl: PUBLIC_DEST, slug: "promo-code" }),
  })
  expect(first.status).toBe(200)
  const dup = await fetch(`${BASE}/api/superadmin/links`, {
    method: "POST", headers: { "content-type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ destinationUrl: PUBLIC_DEST, slug: "promo-code" }),
  })
  expect(dup.status).toBe(409)
})

test("POST with a reserved slug → 400", async () => {
  const r = await fetch(`${BASE}/api/superadmin/links`, {
    method: "POST", headers: { "content-type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ destinationUrl: PUBLIC_DEST, slug: "superadmin" }),
  })
  expect(r.status).toBe(400)
})

test("PATCH /:id toggles active and detail returns click stats; non-ops PATCH → 403", async () => {
  const created = await (await fetch(`${BASE}/api/superadmin/links`, {
    method: "POST", headers: { "content-type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ destinationUrl: PUBLIC_DEST, label: "Toggle me" }),
  })).json()
  const id = created.id
  expect(id).toBeTruthy()

  // non-ops cannot patch
  const forbidden = await fetch(`${BASE}/api/superadmin/links/${id}`, {
    method: "PATCH", headers: { "content-type": "application/json", cookie: userCookie },
    body: JSON.stringify({ active: false }),
  })
  expect(forbidden.status).toBe(403)

  // ops toggles active off
  const patched = await fetch(`${BASE}/api/superadmin/links/${id}`, {
    method: "PATCH", headers: { "content-type": "application/json", cookie: adminCookie },
    body: JSON.stringify({ active: false }),
  })
  expect(patched.status).toBe(200)

  // detail shows the (now inactive) link + a stats block
  const detail = await (await fetch(`${BASE}/api/superadmin/links/${id}`, { headers: { cookie: adminCookie } })).json()
  expect(detail.link.active).toBe(false)
  expect(detail.stats).toHaveProperty("total")
  expect(detail.stats).toHaveProperty("humans")
})
