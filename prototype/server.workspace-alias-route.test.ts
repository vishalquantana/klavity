// #728 Workspace-alias pretty permalink ROUTE test — GET /<slug>/t/<KEY>-<n>.
// Proves the new route reuses the SAME auth gate as /t/:ref (parity per persona), serves the fast
// member page with noindex, login-gates anon, 404s a signed-in non-member (no-leak), keeps the
// opaque /t/<fb_id> + /<slug>/t/<fb_id> fallbacks working, and that a RESERVED slug never shadows a
// real route. share_mode='off' makes the project members-only so the gate branches are exercised.
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-wsalias-route-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")

const OWNER = `wsa-owner-${RUN}@test.local`
const MEMBER = `wsa-member-${RUN}@test.local`
const OUTSIDE = `wsa-out-${RUN}@test.local`
const SID = `sess_wsa_${RUN}`
const MEMBER_SID = `sess_wsa_m_${RUN}`
const OUTSIDE_SID = `sess_wsa_o_${RUN}`
const ACCT = `acct_wsa_${RUN}`
const PROJ = `proj_wsa_${RUN}`
const FID = `fb_${crypto.randomUUID()}` // must be a real fb_<uuid> so the opaque resolver accepts it
const SLUG = `acme-${RUN}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-").slice(0, 38)
const KEY = "KLAV"
const NOW = Date.now()
// Second project in the SAME account with the DEFAULT share_mode ('teaser') — the enumerable pretty
// path must STILL be strict member-only here (QA finding 1: default-mode is the case that was masked).
const PROJ_T = `proj_wsat_${RUN}`
const KEY_T = "TEASE"
const FID_T = `fb_${crypto.randomUUID()}`
// A stale-slug alias to prove the redirect is auth-gated (QA finding 2).
const OLD_SLUG = `old-${RUN}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-").slice(0, 38)
// A SEPARATE tenant to prove opaque-under-slug is tenant-bound (QA finding 7).
const ACCT_B = `acct_wsab_${RUN}`
const SLUG_B = `globex-${RUN}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-{2,}/g, "-").slice(0, 38)
const PROJ_B = `proj_wsab_${RUN}`
const FID_B = `fb_${crypto.randomUUID()}`

let proc: ReturnType<typeof Bun.spawn>
let BASE = ""
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

beforeAll(async () => {
  const port = 47200 + Math.floor(Math.random() * 300)
  BASE = `http://localhost:${port}`
  proc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(port),
      TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      KLAV_DEV_SHOW_OTP: "1", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
    },
    stdout: "ignore", stderr: "ignore",
  })
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [MEMBER, NOW])
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OUTSIDE, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [MEMBER_SID, MEMBER, NOW, NOW + 86400_000])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [OUTSIDE_SID, OUTSIDE, NOW, NOW + 86400_000])
  // Account WITH a claimed slug; members-only project (share_mode='off') keyed KLAV; ticket seq_num=1.
  await exec("INSERT INTO accounts (id, name, owner_email, slug, display_slug, created_at) VALUES (?, ?, ?, ?, ?, ?)", [ACCT, "Acme", OWNER, SLUG, SLUG, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, ticket_key, share_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Klavity", "active", "auto", 200, "named", KEY, "off", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_m_${RUN}`, PROJ, MEMBER, "member", null, NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, seq_num, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [FID, PROJ, "Payment fails on mobile Safari", "high", "open", 1, NOW])
  // Default-teaser project (NO share_mode column value → defaults to 'teaser'), keyed TEASE.
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, ticket_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ_T, ACCT, "Teaser Proj", "active", "auto", 200, "named", KEY_T, NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_t_${RUN}`, PROJ_T, OWNER, "admin", null, NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, seq_num, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [FID_T, PROJ_T, "Teaser ticket", "low", "open", 1, NOW])
  // Stale slug alias → OLD_SLUG now points at ACCT (whose CURRENT slug is SLUG).
  await exec("INSERT INTO alias_redirects (id, kind, old_value, account_id, project_id, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`alr_${RUN}`, "slug", OLD_SLUG, ACCT, null, NOW])
  // Separate tenant B with its own slug + ticket (for tenant-binding test).
  await exec("INSERT INTO accounts (id, name, owner_email, slug, display_slug, created_at) VALUES (?, ?, ?, ?, ?, ?)", [ACCT_B, "Globex", `b-${RUN}@test.local`, SLUG_B, SLUG_B, NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, ticket_key, share_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ_B, ACCT_B, "Globex Proj", "active", "auto", 200, "named", "GLOB", "off", NOW, NOW])
  await exec("INSERT INTO feedback (id, project_id, observation, priority, status, seq_num, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [FID_B, PROJ_B, "Globex secret", "high", "open", 1, NOW])
})

afterAll(() => { proc?.kill(); raw.close(); rmDb() })

function get(path: string, sid?: string) {
  return fetch(`${BASE}${path}`, {
    method: "GET", redirect: "manual",
    headers: sid ? { Cookie: `klav_session=${sid}` } : {},
  })
}

const PRETTY = `/${SLUG}/t/${KEY}-1`
const OPAQUE = `/t/${FID}`

test("member: pretty permalink serves the fast member ticket page (200 + noindex)", async () => {
  const r = await get(PRETTY, SID)
  expect(r.status).toBe(200)
  expect(r.headers.get("x-robots-tag")).toBe("noindex, nofollow")
  const html = await r.text()
  // ticket.html has __TICKET_ID__/__PROJECT_ID__ substituted with the resolved ids.
  expect(html).toContain(FID)
  expect(html).toContain(PROJ)
})

test("[finding 1] member of the teaser-project also serves the fast member page (200)", async () => {
  const r = await get(`/${SLUG}/t/${KEY_T}-1`, SID)
  expect(r.status).toBe(200)
  expect(await r.text()).toContain(FID_T)
})

test("[finding 1] enumerable pretty path is STRICT member-only even with share_mode='teaser' (default)", async () => {
  // The DEFAULT-teaser opaque /t/:ref would 200-serve a teaser to a non-member/anon — but the
  // ENUMERABLE pretty key path must NOT, or every ticket teaser is enumerable. Signed-in non-member
  // → 403; anon → login gate. Never 200 teaser.
  const teaserPretty = `/${SLUG}/t/${KEY_T}-1`
  const nonMember = await get(teaserPretty, OUTSIDE_SID)
  expect(nonMember.status).toBe(403)
  const anon = await get(teaserPretty)
  expect([301, 302, 303, 307, 308]).toContain(anon.status)
  expect(anon.headers.get("location") || "").toContain("/login")
  // Control: the UNGUESSABLE opaque handle for the SAME teaser ticket still shows the teaser (200)
  // to a non-member — proving the distinction is by handle type, not a blanket lockout.
  const opaqueTeaser = await get(`/t/${FID_T}`, OUTSIDE_SID)
  expect(opaqueTeaser.status).toBe(200)
})

test("anon is login-gated (redirect to /login), not served the ticket", async () => {
  const r = await get(PRETTY)
  expect([301, 302, 303, 307, 308]).toContain(r.status)
  expect(r.headers.get("location") || "").toContain("/login")
})

test("[finding 1] signed-in non-member gets 403 on the enumerable pretty path (no teaser leak)", async () => {
  const r = await get(PRETTY, OUTSIDE_SID)
  expect(r.status).toBe(403)
})

test("opaque fallback under a slug segment still resolves: /<slug>/t/<fb_id>", async () => {
  const member = await get(`/${SLUG}/t/${FID}`, SID)
  expect(member.status).toBe(200)
  expect(await member.text()).toContain(FID)
})

test("opaque /t/<fb_id> permalink is untouched (regression)", async () => {
  const r = await get(OPAQUE, SID)
  expect(r.status).toBe(200)
  expect(await r.text()).toContain(FID)
})

test("reserved slug does NOT shadow: /dashboard/t/KLAV-1 is never served as our ticket", async () => {
  // 'dashboard' is reserved → the pretty matcher is skipped; the request must NOT resolve to our
  // ticket page (it falls through to the real /dashboard route or a 404 — never our ticket.html).
  const r = await get(`/dashboard/t/${KEY}-1`, SID)
  const body = r.status === 200 ? await r.text() : ""
  expect(body.includes(FID)).toBe(false)
})

test("unknown seq under a valid slug/key → 404 (not another ticket)", async () => {
  const r = await get(`/${SLUG}/t/${KEY}-999`, SID)
  expect(r.status).toBe(404)
})

test("[finding 2] stale-slug 301 is emitted ONLY to a member; non-member/anon get 403/login not 301", async () => {
  const staleMember = await get(`/${OLD_SLUG}/t/${KEY}-1`, SID)
  expect(staleMember.status).toBe(301)
  // #745: canonical target is the Jira-clean KEYLESS form /<slug>/<KEY>-<n> (no /t/ segment).
  expect(staleMember.headers.get("location") || "").toBe(`/${SLUG}/${KEY}-1`)
  // A non-member must NOT receive the 301 (that would confirm the alias exists) — gets 403.
  const staleNonMember = await get(`/${OLD_SLUG}/t/${KEY}-1`, OUTSIDE_SID)
  expect(staleNonMember.status).toBe(403)
  // Anon → login gate, not a 301.
  const staleAnon = await get(`/${OLD_SLUG}/t/${KEY}-1`)
  expect(staleAnon.status).not.toBe(301)
  expect([301, 302, 303, 307, 308]).toContain(staleAnon.status)
  expect(staleAnon.headers.get("location") || "").toContain("/login")
})

test("[finding 2] a NONEXISTENT ticket under a stale slug → 404, never a 301 (no alias oracle)", async () => {
  const member = await get(`/${OLD_SLUG}/t/${KEY}-999`, SID)
  expect(member.status).toBe(404)
  // Even anon must not get a 301 for a nonexistent handle.
  const anon = await get(`/${OLD_SLUG}/t/${KEY}-999`)
  expect(anon.status).not.toBe(301)
})

test("[finding 7] opaque /<slug>/t/<fb_id> is tenant-bound: B's ticket under A's slug → 404", async () => {
  // Under B's own slug the opaque handle resolves; under A's slug it must 404 (no cross-tenant serve).
  const underA = await get(`/${SLUG}/t/${FID_B}`, SID)
  expect(underA.status).toBe(404)
})

// ── #745: the Jira-clean KEYLESS form /<slug>/<KEY>-<n> (no /t/) ─────────────────────────────────
const KEYLESS = `/${SLUG}/${KEY}-1`

test("[#745] KEYLESS pretty permalink /<slug>/<KEY>-<n> serves the fast member page (200 + noindex)", async () => {
  const r = await get(KEYLESS, SID)
  expect(r.status).toBe(200)
  expect(r.headers.get("x-robots-tag")).toBe("noindex, nofollow")
  const html = await r.text()
  expect(html).toContain(FID)
  expect(html).toContain(PROJ)
})

test("[#745] KEYLESS path is STRICT member-only: non-member → 403, anon → login (same gate as /t/ form)", async () => {
  const nonMember = await get(KEYLESS, OUTSIDE_SID)
  expect(nonMember.status).toBe(403)
  const anon = await get(KEYLESS)
  expect([301, 302, 303, 307, 308]).toContain(anon.status)
  expect(anon.headers.get("location") || "").toContain("/login")
})

test("[#745] a same-slug NON-ticket path (/<slug>/settings) is NOT captured as a ticket", async () => {
  // 'settings' has no <KEY>-<n> shape → the keyless matcher must not fire; the request falls through
  // to the real router / 404 and must NEVER serve our ticket.html (no page/route shadowing).
  const r = await get(`/${SLUG}/settings`, SID)
  const body = r.status === 200 ? await r.text() : ""
  expect(body.includes(FID)).toBe(false)
})

test("[#745] a key-shaped but NONEXISTENT keyless path → 404 (never another ticket, no enumeration)", async () => {
  const r = await get(`/${SLUG}/${KEY}-999`, SID)
  expect(r.status).toBe(404)
})

test("[#745] reserved slug never shadows the keyless form either: /dashboard/KLAV-1 not our ticket", async () => {
  const r = await get(`/dashboard/${KEY}-1`, SID)
  const body = r.status === 200 ? await r.text() : ""
  expect(body.includes(FID)).toBe(false)
})
