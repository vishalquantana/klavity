// Widget-submit latency (POST /api/feedback): screenshot / thumbnail / attachment uploads run with BOUNDED concurrency instead of
// one after another, the result order and partial-failure handling are unchanged, every 400 is decided before any upload,
// and the response carries a Server-Timing header with the per-phase split.
// Hermetic: spawns the real server (process.execPath → no orphan) against a temp file DB and a local S3 stand-in that can
// delay or fail individual PUTs (identified by body size) and records how many PUTs were in flight at once.
import { afterAll, beforeAll, expect, test } from "bun:test"
import * as net from "node:net"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

function freePort(): Promise<number> {
  return new Promise((res, rej) => { const s = net.createServer(); s.on("error", rej); s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) }) })
}
const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-fbpar-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(67)).toString("base64")
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL"); await raw.execute("PRAGMA busy_timeout=5000")
const exec = (sql: string, args: any[] = []) => raw.execute({ sql, args })

const LIMIT = 3
// S3 stand-in. A PUT is delayed by delayBySize[bodyBytes] (else defaultDelay), fails when its body size is in failSizes.
let inflight = 0, peak = 0, puts = 0, defaultDelay = 0
let delayBySize: Record<number, number> = {}
let failSizes = new Set<number>()
const putSizesDone: number[] = []   // body sizes in COMPLETION order
const deleted: string[] = []
const s3 = Bun.serve({ port: 0, async fetch(req) {
  if (req.method === "PUT") {
    const n = (await req.arrayBuffer()).byteLength
    inflight++; peak = Math.max(peak, inflight); puts++
    await Bun.sleep(delayBySize[n] ?? defaultDelay)
    inflight--
    if (failSizes.has(n)) return new Response("boom", { status: 500 })
    putSizesDone.push(n)
    return new Response("", { status: 200, headers: { etag: '"x"' } })
  }
  if (req.method === "DELETE") { deleted.push(decodeURIComponent(new URL(req.url).pathname)); return new Response("", { status: 204 }) }
  return new Response("", { status: 404 })
} })
const resetStub = () => { inflight = 0; peak = 0; puts = 0; defaultDelay = 0; delayBySize = {}; failSizes = new Set(); putSizesDone.length = 0; deleted.length = 0 }

const OWNER = `fp-owner-${RUN}@test.local`
const SID = `sess_fp_${RUN}`, ACCT = `acct_fp_${RUN}`, PROJ = `proj_fp_${RUN}`
const NOW = Date.now()
let proc: ReturnType<typeof Bun.spawn>, BASE = ""

beforeAll(async () => {
  const port = await freePort(); BASE = `http://localhost:${port}`
  proc = Bun.spawn([process.execPath, "server.ts"], {
    cwd: join(import.meta.dir), stdout: "ignore", stderr: "ignore",
    env: { ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "", KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", KLAV_UPLOAD_CONCURRENCY: String(LIMIT),
      S3_ENDPOINT: "http://127.0.0.1:" + s3.port, S3_BUCKET: "b", AWS_ACCESS_KEY_ID: "k", AWS_SECRET_ACCESS_KEY: "s" },
  })
  const dl = Date.now() + 15_000
  while (Date.now() < dl) { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(150) }
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Par Upload", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "P", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
}, 30_000)
afterAll(() => { proc?.kill(); s3.stop(true); raw.close(); rmDb() })

const blob = (size: number, type: string, name: string) => new File([new Uint8Array(size).fill(9)], name, { type })
type Opt = { shots?: Array<{ size: number; type?: string }>; thumbs?: number[]; atts?: Array<{ name: string; size: number; type?: string }> }
function submit(o: Opt) {
  const fd = new FormData()
  fd.set("description", "parallel upload test " + Math.random().toString(36).slice(2))
  fd.set("project_id", PROJ); fd.set("page_url", "https://example.com/p")
  ;(o.shots || []).forEach((s, i) => fd.append("screenshots", blob(s.size, s.type || "image/png", s.type && !s.type.startsWith("image/") ? `notes-${i}.txt` : `shot-${i}.png`)))
  ;(o.thumbs || []).forEach((t, i) => fd.append("screenshot_thumbs", blob(t, "image/jpeg", `thumb-${i}.jpg`)))
  ;(o.atts || []).forEach((a) => fd.append("files", blob(a.size, a.type || "application/pdf", a.name)))
  return fetch(`${BASE}/api/feedback`, { method: "POST", headers: { Cookie: `klav_session=${SID}`, Origin: BASE }, body: fd })
}
const row = async (id: string) => (await exec("SELECT attachments_json, screenshot_id, evidence_dropped FROM feedback WHERE id=?", [id])).rows[0] as any
const attNames = (r: any) => (JSON.parse(String(r.attachments_json || "[]")) as any[]).map((a) => a.filename)

test("uploads overlap (wall time ≈ slowest, not the sum) and never exceed the configured concurrency", async () => {
  resetStub(); defaultDelay = 250
  // 1 screenshot + 1 thumbnail + 4 attachments = 6 PUTs of 250 ms. Serial ≈ 1500 ms; limit 3 ≈ 500 ms.
  const t = performance.now()
  const r = await submit({ shots: [{ size: 3000 }], thumbs: [800], atts: [0, 1, 2, 3].map((i) => ({ name: `a${i}.pdf`, size: 1000 + i })) })
  const wall = performance.now() - t
  expect(r.status).toBe(200)
  expect(puts).toBe(6)
  expect(peak).toBeGreaterThan(1)          // they really ran together
  expect(peak).toBeLessThanOrEqual(LIMIT)  // …but bounded
  expect(wall).toBeLessThan(1500 * 0.75)   // clearly faster than the serial 6×250 ms
})

test("descriptors and screenshot rows keep INPUT order even when later uploads finish first", async () => {
  resetStub()
  delayBySize = { 1001: 300, 1002: 150, 1003: 0 }   // first attachment is the slowest
  const r = await submit({ atts: [{ name: "first.pdf", size: 1001 }, { name: "second.pdf", size: 1002 }, { name: "third.pdf", size: 1003 }] })
  expect(r.status).toBe(200)
  const id = ((await r.json()) as any).id
  expect(putSizesDone).toEqual([1003, 1002, 1001])               // completion order is reversed…
  expect(attNames(await row(id))).toEqual(["first.pdf", "second.pdf", "third.pdf"])   // …stored order is not
})

test("a failed attachment upload is dropped and counted; the report and the other files still persist (200)", async () => {
  resetStub(); failSizes = new Set([2002])
  const r = await submit({ atts: [{ name: "ok1.pdf", size: 2001 }, { name: "bad.pdf", size: 2002 }, { name: "ok2.pdf", size: 2003 }] })
  expect(r.status).toBe(200)
  const id = ((await r.json()) as any).id
  expect(id).toBeTruthy()
  const rw = await row(id)
  expect(attNames(rw)).toEqual(["ok1.pdf", "ok2.pdf"])
  expect(Number(rw.evidence_dropped)).toBe(1)
})

test("a failed FULL screenshot drops it (no ledger row, evidence counted) and cleans up its already-uploaded thumbnail", async () => {
  resetStub(); failSizes = new Set([4000])
  const r = await submit({ shots: [{ size: 4000 }], thumbs: [700], atts: [{ name: "doc.pdf", size: 2500 }] })
  expect(r.status).toBe(200)
  const id = ((await r.json()) as any).id
  const rw = await row(id)
  expect(rw.screenshot_id).toBeNull()
  expect(Number(rw.evidence_dropped)).toBe(1)
  expect(attNames(rw)).toEqual(["doc.pdf"])
  await Bun.sleep(100)
  expect(deleted.length).toBe(1)           // the orphaned thumbnail object was deleted
})

test("a successful screenshot + thumbnail are both stored and linked", async () => {
  resetStub()
  const r = await submit({ shots: [{ size: 5000 }], thumbs: [900] })
  expect(r.status).toBe(200)
  const id = ((await r.json()) as any).id
  const rw = await row(id)
  expect(String(rw.screenshot_id)).toMatch(/^shot_/)
  const sc: any = (await exec("SELECT s3_key, thumb_key FROM screenshots WHERE id=?", [rw.screenshot_id])).rows[0]
  expect(sc.s3_key).toBeTruthy(); expect(sc.thumb_key).toBeTruthy()
  expect(puts).toBe(2)
})

test("every 400 is decided BEFORE any upload: an oversize attachment after valid files leaves no stored objects", async () => {
  resetStub()
  const r = await submit({ shots: [{ size: 3000 }], thumbs: [800], atts: [{ name: "ok.pdf", size: 1500 }, { name: "huge.pdf", size: 9 * 1024 * 1024 }] })
  expect(r.status).toBe(400)
  expect(String(((await r.json()) as any).error)).toContain("huge.pdf")
  expect(puts).toBe(0)
})

test("a non-image sent as a screenshot is a 400 with nothing uploaded, even when it follows a valid screenshot", async () => {
  resetStub()
  const r = await submit({ shots: [{ size: 3000 }, { size: 3100, type: "text/plain" }] })
  expect(r.status).toBe(400)
  expect(puts).toBe(0)
})

test("the response carries a Server-Timing header with the per-phase split", async () => {
  resetStub()
  const r = await submit({ atts: [{ name: "t.pdf", size: 1234 }] })
  expect(r.status).toBe(200)
  const st = r.headers.get("server-timing") || ""
  for (const phase of ["auth", "parse", "uploads", "resolve", "dedupe_insert", "post_writes", "total"]) expect(st).toContain(`${phase};dur=`)
  expect(r.headers.get("access-control-expose-headers") || "").toContain("Server-Timing")
})
