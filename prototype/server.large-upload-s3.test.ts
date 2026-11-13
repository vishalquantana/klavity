// Large-file attachments against an S3-protocol stub: proves the PRODUCTION path — chunks stored as S3 objects,
// joined with Bun's multipart writer (CreateMultipartUpload / UploadPart / CompleteMultipartUpload), chunk
// objects deleted afterwards — produces a byte-identical object. Spawns the real server (temp DB).
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
const DB_FILE = join(tmpdir(), `klav-lups3-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(72)).toString("base64")
const rmDb = () => { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()
const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL"); await raw.execute("PRAGMA busy_timeout=5000")
const exec = (sql: string, args: any[] = []) => raw.execute({ sql, args })

// ── minimal S3 stub: objects + multipart uploads, path-style (/bucket/key) ──
const objects = new Map<string, Uint8Array>()
const multis = new Map<string, { key: string; parts: Map<number, Uint8Array> }>()
let multipartCompletes = 0
const s3 = Bun.serve({ port: 0, async fetch(req) {
  const u = new URL(req.url)
  const key = decodeURIComponent(u.pathname.replace(/^\/b\//, ""))
  const q = u.searchParams
  if (req.method === "POST" && q.has("uploads")) {
    const id = "up" + Math.random().toString(36).slice(2)
    multis.set(id, { key, parts: new Map() })
    return new Response(`<?xml version="1.0"?><InitiateMultipartUploadResult><Bucket>b</Bucket><Key>${key}</Key><UploadId>${id}</UploadId></InitiateMultipartUploadResult>`, { headers: { "content-type": "application/xml" } })
  }
  if (req.method === "PUT" && q.has("uploadId")) {
    const m = multis.get(q.get("uploadId")!)!
    m.parts.set(Number(q.get("partNumber")), new Uint8Array(await req.arrayBuffer()))
    return new Response("", { headers: { etag: `"p${q.get("partNumber")}"` } })
  }
  if (req.method === "POST" && q.has("uploadId")) {
    await req.text()
    const m = multis.get(q.get("uploadId")!)!
    const nums = [...m.parts.keys()].sort((a, b) => a - b)
    const total = nums.reduce((n, k) => n + m.parts.get(k)!.byteLength, 0)
    const out = new Uint8Array(total); let off = 0
    for (const k of nums) { out.set(m.parts.get(k)!, off); off += m.parts.get(k)!.byteLength }
    objects.set(m.key, out); multis.delete(q.get("uploadId")!); multipartCompletes++
    return new Response(`<?xml version="1.0"?><CompleteMultipartUploadResult><Key>${m.key}</Key><ETag>"x"</ETag></CompleteMultipartUploadResult>`, { headers: { "content-type": "application/xml" } })
  }
  if (req.method === "DELETE" && q.has("uploadId")) { multis.delete(q.get("uploadId")!); return new Response("", { status: 204 }) }
  if (req.method === "PUT") { objects.set(key, new Uint8Array(await req.arrayBuffer())); return new Response("", { headers: { etag: '"x"' } }) }
  if (req.method === "DELETE") { objects.delete(key); return new Response("", { status: 204 }) }
  const obj = objects.get(key)
  if (!obj) return new Response("<Error><Code>NoSuchKey</Code></Error>", { status: 404, headers: { "content-type": "application/xml" } })
  const h = { "content-length": String(obj.byteLength), "content-type": "application/octet-stream", etag: '"x"', "last-modified": new Date().toUTCString() }
  if (req.method === "HEAD") return new Response(null, { headers: h })
  return new Response(obj, { headers: h })
} })

const OWNER = `lups3-${RUN}@test.local`, SID = `sess_lups3_${RUN}`, ACCT = `acct_lups3_${RUN}`, PROJ = `proj_lups3_${RUN}`
const NOW = Date.now(), CHUNK = 8 * 1024 * 1024
let proc: ReturnType<typeof Bun.spawn>, BASE = ""
const authed = { cookie: `klav_session=${SID}` }

beforeAll(async () => {
  const port = await freePort(); BASE = `http://localhost:${port}`
  proc = Bun.spawn([process.execPath, "server.ts"], {
    cwd: join(import.meta.dir), stdout: "ignore", stderr: "ignore",
    env: { ...process.env, PORT: String(port), TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "", KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE,
      KLAV_ALLOWED_DOMAINS: "test.local", SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "", NODE_ENV: "test",
      S3_ENDPOINT: "http://127.0.0.1:" + s3.port, S3_BUCKET: "b", AWS_ACCESS_KEY_ID: "k", AWS_SECRET_ACCESS_KEY: "s" },
  })
  const dl = Date.now() + 20_000
  while (Date.now() < dl) { const r = await fetch(`${BASE}/favicon.svg`).catch(() => null); if (r && r.status < 500) break; await Bun.sleep(150) }
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [OWNER, NOW])
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [SID, OWNER, NOW, NOW + 86400_000])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "S3", OWNER, NOW])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, OWNER, "owner", NOW])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "P", "active", "auto", 200, "named", NOW, NOW])
  await exec("INSERT INTO project_members (id, project_id, email, project_role, invited_by, created_at) VALUES (?, ?, ?, ?, ?, ?)", [`pm_${RUN}`, PROJ, OWNER, "admin", null, NOW])
}, 30_000)

afterAll(() => { try { proc?.kill() } catch {}; try { s3.stop(true) } catch {}; try { raw.close() } catch {}; rmDb() })

test("S3 path: 3 chunks are joined by multipart upload into one byte-identical object; chunk objects are removed", async () => {
  const size = CHUNK * 2 + 777
  const data = new Uint8Array(size); for (let i = 0; i < size; i++) data[i] = (i * 13 + 5) & 255
  const post = (p: string, b: any) => fetch(BASE + p, { method: "POST", headers: { "content-type": "application/json", ...authed }, body: JSON.stringify(b) })
  const st = await (await post("/api/uploads/start", { project_id: PROJ, filename: "screen.mov", content_type: "video/quicktime", size })).json() as any
  expect(st.chunks).toBe(3)
  for (let n = 0; n < 3; n++) {
    const r = await fetch(`${BASE}/api/uploads/chunk?token=${encodeURIComponent(st.token)}&n=${n}`, { method: "POST", body: data.subarray(n * CHUNK, Math.min(size, (n + 1) * CHUNK)) })
    expect(r.status).toBe(200)
  }
  expect([...objects.keys()].filter((k) => k.includes("/tmp-uploads/")).length).toBe(3)
  const done = JSON.parse((await (await post("/api/uploads/complete", { token: st.token })).text()).trim())
  expect(typeof done.ref).toBe("string")
  const finalKey = JSON.parse(Buffer.from(String(done.ref).split(".")[0], "base64url").toString()).k as string
  const obj = objects.get(finalKey)!
  expect(obj.byteLength).toBe(size)
  expect(Buffer.compare(Buffer.from(obj), Buffer.from(data))).toBe(0)
  expect([...objects.keys()].filter((k) => k.includes("/tmp-uploads/")).length).toBe(0)
  expect(multipartCompletes).toBeGreaterThanOrEqual(1)
}, 60_000)
