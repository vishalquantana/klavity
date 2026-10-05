// KD-195: GET /api/screenshots/:id now caches the screenshot row and the project-access check. The cache must NEVER widen
// access: a denial is not cached, a removed member loses access immediately (epoch bump), and the session is still
// checked on every request. Hermetic: spawns the real server against a temp file DB (process.execPath → no orphan).
import { afterAll, beforeAll, expect, test } from "bun:test"
import * as net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = net.createServer(); s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}
const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-shotcache-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(77)).toString("base64")
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL"); await raw.execute("PRAGMA busy_timeout=5000")
const exec = (sql: string, args: any[] = []) => raw.execute({ sql, args })

const OWNER = `sc-owner-${RUN}@test.local`, MEMBER = `sc-member-${RUN}@test.local`, OUTSIDER = `sc-out-${RUN}@test.local`
const SID_O = `sess_sc_o_${RUN}`, SID_M = `sess_sc_m_${RUN}`, SID_X = `sess_sc_x_${RUN}`
const ACCT = `acct_sc_${RUN}`, PROJ = `proj_sc_${RUN}`, SHOT = `shot_sc_${RUN}`
const NOW = Date.now()
let proc: ReturnType<typeof Bun.spawn>, BASE = ""

beforeAll(async () => {
  const port = await freePort(); BASE = `http://localhost:${port}`
  proc = Bun.spawn([process.execPath, "server.ts"], {
    cwd: join(import.meta.dir), stdout: "ignore", stderr: "ignore",
    env: { ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "", KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
      // presigning is a local computation — dummy credentials are enough for the signed-link JSON path
      S3_ENDPOINT: "http://127.0.0.1:9", S3_BUCKET: "b", AWS_ACCESS_KEY_ID: "k", AWS_SECRET_ACCESS_KEY: "s" },
  })
  const dl = Date.now() + 15_000
  while (Date.now() < dl) { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(150) }
  for (const e of [OWNER, MEMBER, OUTSIDER]) await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [e, NOW])
  for (const [sid, e] of [[SID_O, OWNER], [SID_M, MEMBER], [SID_X, OUTSIDER]]) await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [sid, e, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Shot Cache", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_o_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_m_${RUN}`, ACCT, MEMBER, "member", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "P", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_o_${RUN}`, PROJ, OWNER, "admin", null, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_m_${RUN}`, PROJ, MEMBER, "member", OWNER, NOW])
  await exec("INSERT INTO screenshots (id, project_id, s3_key, bucket, content_type, acl, bytes, owner_email, created_at, thumb_key) VALUES (?,?,?,?,?,?,?,?,?,?)", [SHOT, PROJ, "uploads/x.png", "b", "image/png", "private", 1234, OWNER, NOW, "uploads/x.thumb.png"])
}, 30_000)
afterAll(() => { proc?.kill(); raw.close(); rmDb() })

const get = (sid: string, q = "?thumb=1", id = SHOT) => fetch(`${BASE}/api/screenshots/${id}${q}`, { headers: { Cookie: `klav_session=${sid}` } })

test("a project member gets the signed thumbnail link, repeatedly (cold then cached) — same answer both times", async () => {
  const a = await get(SID_M), b = await get(SID_M)
  expect(a.status).toBe(200); expect(b.status).toBe(200)
  const da: any = await a.json(), db: any = await b.json()
  expect(da.thumb).toBe(true)
  expect(String(da.url)).toContain("x.thumb.png")
  expect(String(db.url)).toContain("x.thumb.png")
})

test("the SESSION is still checked on every request: no cookie → 401, a bogus session → 401 (never served from the cache)", async () => {
  await get(SID_M)   // warm the row + access caches
  expect((await fetch(`${BASE}/api/screenshots/${SHOT}?thumb=1`)).status).toBe(401)
  expect((await get("sess_does_not_exist")).status).toBe(401)
})

test("a denial is NOT cached: an outsider is 403, and the moment they become a member (direct DB grant) they are 200", async () => {
  expect((await get(SID_X)).status).toBe(403)
  expect((await get(SID_X)).status).toBe(403)       // still denied (and re-checked — nothing cached either way)
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_x_${RUN}`, ACCT, OUTSIDER, "member", NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_x_${RUN}`, PROJ, OUTSIDER, "member", OWNER, NOW])
  expect((await get(SID_X)).status).toBe(200)
})

test("a REMOVED member loses access IMMEDIATELY even though their grant was cached (epoch invalidation)", async () => {
  expect((await get(SID_M)).status).toBe(200)       // grant is now cached
  expect((await get(SID_M)).status).toBe(200)
  const r = await fetch(`${BASE}/api/team/member/remove`, { method: "POST", headers: { "content-type": "application/json", Cookie: `klav_session=${SID_O}` }, body: JSON.stringify({ email: MEMBER, project: PROJ }) })
  expect(r.status).toBe(200)
  expect((await get(SID_M)).status).toBe(403)       // no waiting for the 30 s TTL
  expect((await get(SID_M, "?thumb=1&proxy=1")).status).toBe(403)   // the byte-proxy variant shares the same gate
  expect((await get(SID_O)).status).toBe(200)       // the owner is unaffected
})

test("an unknown screenshot id is a 404 and is not cached as anything", async () => {
  expect((await get(SID_O, "?thumb=1", "shot_nope")).status).toBe(404)
  expect((await get(SID_O, "?thumb=1", "shot_nope")).status).toBe(404)
})
