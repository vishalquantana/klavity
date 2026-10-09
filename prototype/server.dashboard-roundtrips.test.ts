// Round-trip reduction for GET /api/dashboard (perf step 2). Locks in that the optimisation
//   • reuses the listAccessibleProjects row (no 2nd/3rd projects-by-id read) via resolveProject(knownProjects),
//   • reads status/assignee/notes/recurrence meta from the listFeedback rows (no SELECT-by-id meta batch),
//   • did NOT change authorization, project selection, alias fields, meta fields, response shape or error semantics.
// Spawns the real server against a file DB (same pattern as server.dashboard-auth-401.test.ts).
import { test, expect, beforeAll, afterAll } from "bun:test"
import * as net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-dashrt-${ts}.db`)
const rawClient = createClient({ url: "file:" + DB_FILE })
await rawClient.execute("PRAGMA journal_mode=WAL")
await rawClient.execute("PRAGMA busy_timeout=5000")
async function raw(sql: string, args: any[] = []) { return rawClient.execute({ sql, args }) }

for (const ddl of [
  `CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, email TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS schema_meta (key TEXT PRIMARY KEY, value TEXT)`,
  `CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_email TEXT, domain TEXT, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS account_members (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL, account_role TEXT NOT NULL DEFAULT 'member', created_at INTEGER NOT NULL, UNIQUE(account_id, email))`,
  `CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', review_mode TEXT NOT NULL DEFAULT 'auto', review_budget_daily INTEGER, observability_mode TEXT NOT NULL DEFAULT 'named', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS project_members (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, email TEXT NOT NULL, project_role TEXT NOT NULL DEFAULT 'member', invited_by TEXT, created_at INTEGER NOT NULL, UNIQUE(project_id, email))`,
  `CREATE TABLE IF NOT EXISTS personas (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, type TEXT NOT NULL DEFAULT 'client', initials TEXT, accent TEXT, summary TEXT, insights_json TEXT, avatar TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS feedback (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, sim_id TEXT, actor_email TEXT, url_host TEXT, url_path TEXT, observation TEXT, sentiment TEXT, severity TEXT, priority TEXT, screenshot_id TEXT, suggested_bug_json TEXT, cited_trait_ids_json TEXT, source_quote TEXT, source_transcript_id TEXT, source_date INTEGER, plane_issue_key TEXT, plane_issue_url TEXT, status TEXT NOT NULL DEFAULT 'open', assignee TEXT, notes TEXT, updated_at INTEGER, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS activity_events (id TEXT PRIMARY KEY, project_id TEXT, type TEXT NOT NULL, actor_email TEXT, sim_id TEXT, url_host TEXT, url_path TEXT, feedback_id TEXT, screenshot_id TEXT, meta_json TEXT, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS review_counts (project_id TEXT NOT NULL, day TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (project_id, day))`,
]) await raw(ddl)

// ── Fixtures ──────────────────────────────────────────────────────────────────
const NOW = Date.now()
const ACCT = `acct_${ts}`, ACCT_OTHER = `acct_o_${ts}`
const P1 = `proj_1_${ts}`          // owner's first project (has feedback)
const P2 = `proj_2_${ts}`          // owner's second project (EMPTY: no feedback/personas)
const P_OTHER = `proj_x_${ts}`     // someone else's project — nobody here has access
const OWNER = `owner-${ts}@test.local`, MEMBER = `member-${ts}@test.local`
const VIEWER = `viewer-${ts}@test.local`, ACCT_MEMBER = `acctmember-${ts}@test.local`
const NOBODY = `nobody-${ts}@test.local`
const S = (n: string) => `sess_${n}_${ts}`

async function seedUser(email: string, sess: string) {
  await raw(`INSERT INTO users (email, created_at) VALUES (?, ?)`, [email, NOW])
  await raw(`INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)`, [sess, email, NOW, NOW + 86_400_000])
}
for (const [e, n] of [[OWNER, "owner"], [MEMBER, "member"], [VIEWER, "viewer"], [ACCT_MEMBER, "acctmember"], [NOBODY, "nobody"]] as const) await seedUser(e, S(n))

await raw(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCT, "RT Acct", OWNER, NOW])
await raw(`INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)`, [ACCT_OTHER, "Other Acct", "someone@else.local", NOW])
const am = (id: string, acct: string, email: string, role: string) =>
  raw(`INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)`, [id, acct, email, role, NOW])
await am(`am1_${ts}`, ACCT, OWNER, "owner")
await am(`am2_${ts}`, ACCT, MEMBER, "member")
await am(`am3_${ts}`, ACCT, VIEWER, "member")
await am(`am4_${ts}`, ACCT, ACCT_MEMBER, "member")   // account member, NO project row → no project access
const proj = (id: string, acct: string, name: string, at: number) =>
  raw(`INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, 'active', 'auto', 200, 'named', ?, ?)`, [id, acct, name, at, at])
await proj(P1, ACCT, "RT Project One", NOW - 2000)
await proj(P2, ACCT, "RT Project Two", NOW - 1000)
await proj(P_OTHER, ACCT_OTHER, "Not Yours", NOW)
const pm = (id: string, p: string, email: string, role: string) =>
  raw(`INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [id, p, email, role, null, NOW])
await pm(`pm1_${ts}`, P1, OWNER, "admin")
await pm(`pm2_${ts}`, P1, MEMBER, "member")
await pm(`pm3_${ts}`, P1, VIEWER, "viewer")   // viewer is NOT dashboard access

// P1 data: 3 tickets with distinct meta; P2 intentionally empty.
const fb = (id: string, status: string, assignee: string | null, notes: string | null, ageMs: number) =>
  raw(`INSERT INTO feedback (id, project_id, observation, status, assignee, notes, priority, url_path, created_at) VALUES (?, ?, ?, ?, ?, ?, 'high', '/x', ?)`,
    [id, P1, `obs ${id}`, status, assignee, notes, NOW - ageMs])
await fb(`fb_a_${ts}`, "in_progress", MEMBER, "a note", 3000)
await fb(`fb_b_${ts}`, "new", null, null, 2000)
await fb(`fb_c_${ts}`, "done", OWNER, null, 1000)
// Activity: one row by OWNER, one by MEMBER (member must see only their own).
const act = (id: string, actor: string) =>
  raw(`INSERT INTO activity_events (id, project_id, type, actor_email, created_at) VALUES (?, ?, 'report', ?, ?)`, [id, P1, actor, NOW])
await act(`ev_o_${ts}`, OWNER)
await act(`ev_m_${ts}`, MEMBER)

// ── Server subprocess ──────────────────────────────────────────────
let srvProc: ReturnType<typeof Bun.spawn>
let BASE: string
const FB_A = `fb_a_${ts}`, FB_B = `fb_b_${ts}`, FB_C = `fb_c_${ts}`

beforeAll(async () => {
  const port = await freePort()
  BASE = `http://localhost:${port}`
  srvProc = Bun.spawn([process.execPath, "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: Buffer.from(new Uint8Array(32).fill(55)).toString("base64"), KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local", KLAV_DEV_SHOW_OTP: "1", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "test-key",
    },
    stdout: "ignore", stderr: "ignore",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
  // Columns added by the server's boot migration — set recurrence/regression state now (before any dashboard request).
  await raw(`UPDATE feedback SET recurrence_count=4, last_seen_at=?, resolved_at=? WHERE id=?`, [NOW, NOW - 500, FB_C])   // regression: seen after resolved
  await raw(`UPDATE feedback SET recurrence_count=1 WHERE id=?`, [FB_A])
}, 25_000)

afterAll(() => { srvProc?.kill(); rawClient.close() })

const dash = (sess: string, qs = "", extra: Record<string, string> = {}) =>
  fetch(`${BASE}/api/dashboard${qs}`, { headers: { Cookie: `klav_session=${S(sess)}`, ...extra }, redirect: "manual" })

const TOP_KEYS = ["active", "activity", "counts", "email", "hasSimReaction", "hasTranscriptSim", "insights", "members", "projects", "saying", "simFeedback", "sims", "tickets", "widgetStatus"]

// ── authorization / project selection ─────────────────────────────────────────
test("owner: 200, admin role, response shape unchanged, active project = ?project=", async () => {
  const r = await dash("owner", `?project=${P1}`)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(Object.keys(b).sort()).toEqual(TOP_KEYS)
  expect(b.active.id).toBe(P1)
  expect(b.active.name).toBe("RT Project One")
  expect(b.active.role).toBe("admin")
  expect(Object.keys(b.active).sort()).toEqual(["entitlement", "id", "name", "planOverride", "role", "siteUrl"])
  expect(b.projects.map((p: any) => p.id)).toEqual([P1, P2])           // own projects only, oldest first, no leak of P_OTHER
  expect(b.members.map((m: any) => m.email).sort()).toEqual([MEMBER, OWNER, VIEWER].sort())
  expect(b.members.find((m: any) => m.email === OWNER).role).toBe("admin")
  expect(b.members.find((m: any) => m.email === MEMBER).role).toBe("user")
})

test("owner: admin sees ALL activity", async () => {
  const b = await (await dash("owner", `?project=${P1}`)).json()
  expect(b.activity.map((a: any) => a.actorEmail).sort()).toEqual([MEMBER, OWNER].sort())
})

test("project member: 200, non-admin role, sees ONLY own activity", async () => {
  const r = await dash("member", `?project=${P1}`)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(b.active.role).toBe("user")
  expect(b.activity.map((a: any) => a.actorEmail)).toEqual([MEMBER])
  expect(b.projects.map((p: any) => p.id)).toEqual([P1])
})

test("viewer row / account-member-without-row are NOT access: nothing accessible → unchanged 200 empty shape (early return, before resolveProject)", async () => {
  for (const who of ["viewer", "acctmember"]) {
    const r = await dash(who, `?project=${P1}`)
    expect(r.status).toBe(200)
    const b = await r.json()
    expect(b.projects).toEqual([]); expect(b.active).toBeNull(); expect(b.tickets).toEqual([])
  }
})

test("project member requesting a same-account project they have NO project row for → 403 (projectAccess path still enforced)", async () => {
  const r = await dash("member", `?project=${P2}`)
  expect(r.status).toBe(403)
  expect((await r.json()).error).toMatch(/No access/)
})

test("a project in ANOTHER account → 403 even for the owner of this account", async () => {
  expect((await dash("owner", `?project=${P_OTHER}`)).status).toBe(403)
})

test("unknown project id → 403 (existence not revealed)", async () => {
  expect((await dash("owner", `?project=proj_nope_${ts}`)).status).toBe(403)
})

test("authed user with zero projects → 200 empty shape (unchanged)", async () => {
  const r = await dash("nobody")
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(b.projects).toEqual([]); expect(b.active).toBeNull()
})

test("selection: ?project= wins; klav_proj cookie used only when param absent; else first accessible", async () => {
  const viaParam = await (await dash("owner", `?project=${P2}`)).json()
  expect(viaParam.active.id).toBe(P2)
  const viaCookie = await (await dash("owner", "", { Cookie: `klav_session=${S("owner")}; klav_proj=${P2}` })).json()
  expect(viaCookie.active.id).toBe(P2)
  const paramBeatsCookie = await (await dash("owner", `?project=${P1}`, { Cookie: `klav_session=${S("owner")}; klav_proj=${P2}` })).json()
  expect(paramBeatsCookie.active.id).toBe(P1)
  const first = await (await dash("owner")).json()   // no param, no cookie → first accessible (oldest)
  expect(first.active.id).toBe(P1)
})

test("successful response still stamps the klav_proj cookie for the resolved project", async () => {
  const r = await dash("owner", `?project=${P2}`)
  expect(r.headers.get("set-cookie") || "").toContain(P2)
})

// ── alias + feedback meta ─────────────────────────────────────────────────────
test("tickets carry the project alias (slug/ticketKey/seqNum) from projectAliasInfo", async () => {
  const b = await (await dash("owner", `?project=${P1}`)).json()
  expect(b.tickets.length).toBe(3)
  for (const t of b.tickets) {
    expect(typeof t.slug).toBe("string"); expect(t.slug.length).toBeGreaterThan(0)
    expect(typeof t.ticketKey).toBe("string")
    expect("seqNum" in t).toBe(true)
  }
  // identical for every ticket (constant per project)
  expect(new Set(b.tickets.map((t: any) => t.slug)).size).toBe(1)
})

test("ticket meta (status/assignee/notes/recurrence/regression) comes through unchanged, newest-first", async () => {
  const b = await (await dash("owner", `?project=${P1}`)).json()
  expect(b.tickets.map((t: any) => t.id)).toEqual([FB_C, FB_B, FB_A])
  const by = Object.fromEntries(b.tickets.map((t: any) => [t.id, t]))
  expect(by[FB_A]).toMatchObject({ status: "in_progress", assignee: MEMBER, notes: "a note", recurrence: 1, recurrenceCount: 1, isRegression: false })
  expect(by[FB_B]).toMatchObject({ status: "new", assignee: null, notes: null, recurrenceCount: 1, isRegression: false })
  expect(by[FB_C]).toMatchObject({ status: "done", assignee: OWNER, recurrence: 4, recurrenceCount: 4, isRegression: true })
  // firstSeen = created_at; lastSeen falls back to created_at when last_seen_at is null
  expect(by[FB_A].firstSeen).toBe(NOW - 3000)
  expect(by[FB_A].lastSeen).toBe(NOW - 3000)
  expect(by[FB_C].lastSeen).toBe(NOW)
  expect(Array.isArray(by[FB_A].exports)).toBe(true)
  expect(by[FB_A].hasReplay).toBe(false)
})

// ── empty project ─────────────────────────────────────────────────────────────
test("empty project (no feedback/personas): 200, empty collections, zero counts, same keys", async () => {
  const r = await dash("owner", `?project=${P2}`)
  expect(r.status).toBe(200)
  const b = await r.json()
  expect(Object.keys(b).sort()).toEqual(TOP_KEYS)
  expect(b.tickets).toEqual([]); expect(b.sims).toEqual([]); expect(b.saying).toEqual([]); expect(b.activity).toEqual([])
  expect(b.counts).toEqual({ feedback: 0, tickets: 0, activity: 0 })
  expect(b.hasSimReaction).toBe(false)
})

// ── error handling (kept LAST: breaks a table) ────────────────────────────────
test("a failing read in the parallel wave still yields the route's 500 error shape", async () => {
  await raw(`DROP TABLE IF EXISTS widget_pings`)
  const r = await dash("owner", `?project=${P1}`)
  expect(r.status).toBe(500)
  const b = await r.json()
  expect(b).toHaveProperty("error")
  expect(b).not.toHaveProperty("tickets")
})
