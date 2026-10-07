// Replay intake over HTTP: POST /api/feedback accepts the rolling replay as a gzip part (`replay_events_gz`, what current clients
// send) or the plain JSON field (older clients). Garbage and decompression-bomb payloads never fail the report.
// Hermetic: spawns the real server (process.execPath → no orphan) against a temp file DB (S3 stand-in only so uploads have a target).
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
const DB_FILE = join(tmpdir(), `klav-fbgz-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(69)).toString("base64")
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL"); await raw.execute("PRAGMA busy_timeout=5000")
const exec = (sql: string, args: any[] = []) => raw.execute({ sql, args })

const LIMIT = 3

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


import { gzipSync } from "node:zlib"
const events = (n: number) => Array.from({ length: n }, (_, i) => ({ type: 3, timestamp: 1000 + i, data: { source: 1, x: i } }))
const gz = (v: unknown) => new File([gzipSync(Buffer.from(typeof v === "string" ? v : JSON.stringify(v)))], "replay.json.gz", { type: "application/gzip" })
function submit(o: { description?: string; gz?: File; plain?: string }) {
  const fd = new FormData()
  if (o.description !== undefined) fd.set("description", o.description)
  fd.set("project_id", PROJ); fd.set("page_url", "https://example.com/p")
  if (o.gz) fd.set("replay_events_gz", o.gz)
  if (o.plain !== undefined) fd.set("replay_events", o.plain)
  return fetch(`${BASE}/api/feedback`, { method: "POST", headers: { Cookie: `klav_session=${SID}`, Origin: BASE }, body: fd })
}
const replayRows = async (id: string) => (await exec("SELECT n_events, bytes FROM feedback_replays WHERE feedback_id=?", [id])).rows as any[]
const word = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)

test("a gzip replay part is stored (events inflated server-side)", async () => {
  const r = await submit({ description: "gz replay " + word(), gz: gz(events(300)) })
  expect(r.status).toBe(200)
  const id = ((await r.json()) as any).id
  const rows = await replayRows(id)
  expect(rows.length).toBe(1); expect(Number(rows[0].n_events)).toBe(300)
})

test("the plain replay_events field still works (older clients)", async () => {
  const r = await submit({ description: "plain replay " + word(), plain: JSON.stringify(events(40)) })
  expect(r.status).toBe(200)
  const rows = await replayRows(((await r.json()) as any).id)
  expect(rows.length).toBe(1); expect(Number(rows[0].n_events)).toBe(40)
})

test("a replay-only report (no description, no screenshot) is accepted when the replay arrives gzipped", async () => {
  const r = await submit({ gz: gz(events(25)) })
  expect(r.status).toBe(200)
  const id = ((await r.json()) as any).id
  expect(id).toBeTruthy()
  expect((await replayRows(id)).length).toBe(1)
})

test("a decompression bomb is ignored: the report is saved (200) and no replay is stored", async () => {
  const bomb = gz(" ".repeat(7 * 1024 * 1024))
  expect(bomb.size).toBeLessThan(100 * 1024)
  const r = await submit({ description: "bomb " + word(), gz: bomb })
  expect(r.status).toBe(200)
  const id = ((await r.json()) as any).id
  expect(id).toBeTruthy()
  expect((await replayRows(id)).length).toBe(0)
})

test("a corrupt gzip part never fails the report", async () => {
  const bad = new File([new Uint8Array([9, 8, 7, 6, 5, 4])], "replay.json.gz", { type: "application/gzip" })
  const r = await submit({ description: "corrupt " + word(), gz: bad })
  expect(r.status).toBe(200)
  expect((await replayRows(((await r.json()) as any).id)).length).toBe(0)
})
