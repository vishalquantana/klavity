// Large-file attachments end to end: /api/uploads/start → chunk → complete → /api/feedback `file_refs`.
// Hermetic: spawns the real server against a temp file DB with NO S3 configured (local-disk storage).
import { afterAll, beforeAll, expect, test } from "bun:test"
import * as net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync, existsSync, readFileSync } from "node:fs"

function freePort(): Promise<number> {
  return new Promise((res, rej) => { const s = net.createServer(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) }) })
}
const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-lup-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(71)).toString("base64")
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL"); await raw.execute("PRAGMA busy_timeout=5000")
const exec = (sql: string, args: any[] = []) => raw.execute({ sql, args })

const OWNER = `lup-owner-${RUN}@test.local`
const SID = `sess_lup_${RUN}`, ACCT = `acct_lup_${RUN}`, PROJ = `proj_lup_${RUN}`
const NOW = Date.now()
const CHUNK = 8 * 1024 * 1024
let proc: ReturnType<typeof Bun.spawn>, BASE = ""
const cleanup: string[] = []
const authed = { cookie: `klav_session=${SID}` }

beforeAll(async () => {
  const port = await freePort(); BASE = `http://localhost:${port}`
  const env: Record<string, string | undefined> = { ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "", KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE,
    KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", S3_ENDPOINT: "", S3_BUCKET: "", AWS_ACCESS_KEY_ID: "", AWS_SECRET_ACCESS_KEY: "", NODE_ENV: "test" }
  proc = Bun.spawn([process.execPath, "server.ts"], { cwd: join(import.meta.dir), stdout: "ignore", stderr: "ignore", env })
  const dl = Date.now() + 20_000
  while (Date.now() < dl) { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(150) }
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "LUP", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "P", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
}, 30_000)

afterAll(() => {
  try { proc?.kill() } catch {}
  for (const p of cleanup) { try { unlinkSync(p) } catch {} }
  try { raw.close() } catch {}
  rmDb()
})

const post = (path: string, body: any, headers: Record<string, string> = {}) =>
  fetch(BASE + path, { method: "POST", headers: { "content-type": "application/json", ...authed, ...headers }, body: JSON.stringify(body) })

test("a file over the old caps uploads in chunks, joins byte-exact, and attaches to the report", async () => {
  const size = CHUNK + 1234
  const data = new Uint8Array(size); for (let i = 0; i < size; i++) data[i] = (i * 31 + 7) & 255

  const s = await post("/api/uploads/start", { project_id: PROJ, filename: "huge.mp4", content_type: "video/mp4", size })
  expect(s.status).toBe(200)
  const st = await s.json() as any
  expect(st.chunks).toBe(2); expect(st.chunk_bytes).toBe(CHUNK)
  const chunk = (n: number, bytes: Uint8Array) => fetch(`${BASE}/api/uploads/chunk?token=${encodeURIComponent(st.token)}&n=${n}`, { method: "POST", headers: { "content-type": "application/octet-stream" }, body: bytes })

  // a chunk of the wrong length is refused (never stored as a corrupt piece)
  expect((await chunk(1, data.subarray(CHUNK, CHUNK + 10))).status).toBe(400)
  expect((await chunk(0, data.subarray(0, CHUNK))).status).toBe(200)

  // complete before every chunk arrived → 409 naming the missing one
  const early = await post("/api/uploads/complete", { token: st.token })
  expect(early.status).toBe(409)
  expect((await early.json() as any).missing).toEqual([1])

  expect((await chunk(1, data.subarray(CHUNK))).status).toBe(200)
  const done = JSON.parse((await (await post("/api/uploads/complete", { token: st.token })).text()).trim())
  expect(typeof done.ref).toBe("string")
  expect(done.size).toBe(size)

  // a retried complete (lost answer) still succeeds — the file is already joined
  const again = JSON.parse((await (await post("/api/uploads/complete", { token: st.token })).text()).trim())
  expect(typeof again.ref).toBe("string")

  // the report carries the ref → attachment descriptor on the feedback row
  const fd = new FormData()
  fd.set("type", "bug"); fd.set("description", "big video attached"); fd.set("page_url", "https://example.test/p"); fd.set("project_id", PROJ)
  fd.set("file_refs", JSON.stringify([done.ref]))
  const fb = await fetch(BASE + "/api/feedback", { method: "POST", headers: authed, body: fd })
  expect(fb.status).toBeLessThan(300)
  const fbj = await fb.json() as any
  const row = await exec("SELECT attachments_json FROM feedback WHERE id = ?", [fbj.id])
  const atts = JSON.parse(String((row.rows[0] as any).attachments_json || "[]"))
  expect(atts.length).toBe(1)
  expect(atts[0]).toMatchObject({ filename: "huge.mp4", contentType: "video/mp4", size })

  // the joined object is byte-identical to what was sent (local storage: under public/)
  const p = join(import.meta.dir, "public", atts[0].key)
  cleanup.push(p)
  expect(existsSync(p)).toBe(true)
  expect(Buffer.compare(readFileSync(p), Buffer.from(data))).toBe(0)
}, 60_000)

test("a ref for another project is ignored by the report", async () => {
  const s = await (await post("/api/uploads/start", { project_id: "proj_someone_else", filename: "a.zip", content_type: "application/zip", size: 10 })).json() as any
  await fetch(`${BASE}/api/uploads/chunk?token=${encodeURIComponent(s.token)}&n=0`, { method: "POST", body: new Uint8Array(10) })
  const done = JSON.parse((await (await post("/api/uploads/complete", { token: s.token })).text()).trim())
  expect(typeof done.ref).toBe("string")
  const fd = new FormData()
  fd.set("type", "bug"); fd.set("description", "wrong project ref"); fd.set("page_url", "https://example.test/p"); fd.set("project_id", PROJ)
  fd.set("file_refs", JSON.stringify([done.ref]))
  const fbj = await (await fetch(BASE + "/api/feedback", { method: "POST", headers: authed, body: fd })).json() as any
  const row = await exec("SELECT attachments_json FROM feedback WHERE id = ?", [fbj.id])
  expect(JSON.parse(String((row.rows[0] as any).attachments_json || "[]"))).toEqual([])
  // tidy the stray object
  const key = JSON.parse(Buffer.from(String(done.ref).split(".")[0], "base64url").toString()).k
  cleanup.push(join(import.meta.dir, "public", key))
}, 30_000)

test("a cross-origin anonymous start for an unknown project is refused; a bad token is 410", async () => {
  const r = await fetch(BASE + "/api/uploads/start", { method: "POST", headers: { "content-type": "application/json", origin: "https://customer.example" }, body: JSON.stringify({ project_id: "nope", filename: "x.bin", size: 5 }) })
  expect(r.status).toBe(404)
  expect(r.headers.get("access-control-allow-origin")).toBe("https://customer.example")
  expect((await fetch(`${BASE}/api/uploads/chunk?token=bad&n=0`, { method: "POST", body: new Uint8Array(1) })).status).toBe(410)
  expect((await post("/api/uploads/complete", { token: "bad" })).status).toBe(410)
})
