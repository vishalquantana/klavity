// server.trails-author-attachments.route.test.ts
// POST /api/trails/author/attachments — memory-DoS hardening (same class as the voice-transcribe fix).
// Previously the route guarded size ONLY via the Content-Length header and then called req.formData(),
// which buffers the ENTIRE streamed body into RAM before any size check. A chunked transfer-encoding
// request (no Content-Length) bypassed the guard entirely, so an attacker could push a multi-GB body
// into heap on the 1GB box. Now the route keeps the cheap Content-Length fast-reject AND streams the
// body through readBodyBounded() (25MB cap + multipart framing overhead), replying 413 on BODY_TOO_LARGE
// BEFORE parsing; the multipart is parsed only from the already-bounded buffer.
//
// Verifies:
//   * unauthenticated request → 401 (the auth gate around this endpoint is untouched)
//   * a normal small attachment still succeeds end-to-end (201 { name, key, filename, contentType })
//   * an over-cap multipart with a declared Content-Length → 413 via the fast-reject path
//   * a chunked (no Content-Length) oversized body → 413 WITHOUT buffering (no S3 write)
//
// Hermetic subprocess-server pattern matching server.voice-transcribe.route.test.ts +
// server.trails-author.route.test.ts: dedicated temp SQLite DB + seeded session cookie for auth.
// S3 is faked with a minimal in-process Bun.serve PUT-sink so Bun's S3Client can upload for real.

import { afterAll, beforeAll, expect, test } from "bun:test"
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
const DB_FILE = join(tmpdir(), `klav-trails-attach-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(43)).toString("base64")
const PORT = await __freePortKLA719()
const S3_PORT = PORT + 100
const BASE = `http://localhost:${PORT}`
const S3_ENDPOINT = `http://localhost:${S3_PORT}`

const ACCT = `acct_ta_${RUN}`
const PROJ = `proj_ta_${RUN}`
const ADMIN = `attach-admin-${RUN}@test.local`
// Sessions are stored sha256hex(id)-at-rest (E1); seed BOTH the hashed row (what getSession reads)
// and keep the RAW token in our cookie — mirroring server.attribution.test.ts's sha256hex seeding.
function sha256hex(s: string): string {
  return new Bun.CryptoHasher("sha256").update(s).digest("hex")
}
const ADMIN_SID_RAW = `sess_ta_admin_${RUN}`
const ADMIN_COOKIE = `klav_session=${ADMIN_SID_RAW}`

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

let appProc: ReturnType<typeof Bun.spawn>
// Minimal fake S3: counts writes and stores bytes by key. Bun's S3Client signs a plain PUT; we accept
// it unconditionally (no SigV4 verification needed — we only need uploadAttachment to succeed).
let s3Writes = 0
const s3Stored = new Map<string, Uint8Array>()
const fakeS3 = Bun.serve({
  port: S3_PORT,
  async fetch(req) {
    if (req.method === "PUT") {
      s3Writes++
      const url = new URL(req.url)
      s3Stored.set(url.pathname, new Uint8Array(await req.arrayBuffer()))
      return new Response("", { status: 200, headers: { etag: '"deadbeef"' } })
    }
    return new Response("nope", { status: 404 })
  },
})

async function seed() {
  const now = Date.now()
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [ADMIN, now])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Attach Test", ADMIN, now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_ta_${RUN}`, ACCT, ADMIN, "owner", now])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Attach Project", "active", "auto", 200, "named", now, now])
  // E1: sessions.id holds sha256hex(raw token) — insert the hash so getSession(raw) resolves.
  await exec("INSERT INTO sessions (id, email, created_at, expires_at) VALUES (?, ?, ?, ?)", [sha256hex(ADMIN_SID_RAW), ADMIN, now, now + 86400_000])
}

// Normal small attachment: real FormData ⇒ fetch sets Content-Length + boundary itself.
function postAttachment(file: Blob, filename = "fixture.txt") {
  const fd = new FormData()
  fd.append("file", file, filename)
  return fetch(`${BASE}/api/trails/author/attachments?project=${PROJ}`, {
    method: "POST",
    headers: { cookie: ADMIN_COOKIE },
    body: fd,
  })
}

beforeAll(async () => {
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(PORT),
      TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "",
      S3_ENDPOINT: S3_ENDPOINT, S3_REGION: "us-east-1", S3_BUCKET: "bkt",
      AWS_ACCESS_KEY_ID: "test", AWS_SECRET_ACCESS_KEY: "test",
    },
    stdout: "ignore", stderr: "ignore",
  })
  const deadline = Date.now() + 20_000
  while (Date.now() < deadline) {
    const r = await fetch(`${BASE}/favicon.svg`).catch(() => null)
    if (r && r.status < 500) break
    await Bun.sleep(150)
  }
  await seed()
})

afterAll(() => { appProc?.kill(); fakeS3.stop(true); raw.close(); rmDb() })

test("unauthenticated request is rejected 401 (auth gate untouched)", async () => {
  const fd = new FormData()
  fd.append("file", new Blob([new Uint8Array(16)], { type: "text/plain" }), "x.txt")
  const r = await fetch(`${BASE}/api/trails/author/attachments?project=${PROJ}`, { method: "POST", body: fd })
  expect(r.status).toBe(401)
})

test("a normal small attachment uploads successfully (201) with exactly one S3 write", async () => {
  s3Writes = 0
  const payload = crypto.getRandomValues(new Uint8Array(1024))
  const r = await postAttachment(new Blob([payload], { type: "text/plain" }), "fixture.txt")
  expect(r.status).toBe(201)
  const body = await r.json()
  expect(body.name).toBe("fixture.txt")
  expect(body.filename).toBe("fixture.txt")
  expect(body.key).toContain("/attachments/")
  expect(s3Writes).toBe(1)
  // The uploaded bytes reached the (fake) bucket intact.
  const storedKey = [...s3Stored.keys()][0]
  const stored = s3Stored.get(storedKey)!
  expect(stored.byteLength).toBe(1024)
})

test("a declared Content-Length over the ceiling is fast-rejected 413", async () => {
  s3Writes = 0
  const big = new Blob([new Uint8Array(26 * 1024 * 1024)], { type: "application/octet-stream" })
  const fd = new FormData()
  fd.append("file", big, "big.bin")
  // connection:close — the early 413 aborts the upload mid-flight and leaves the client's pooled
  // keep-alive socket undrained; closing forces a fresh socket for the next request in this file.
  const r = await fetch(`${BASE}/api/trails/author/attachments?project=${PROJ}`, {
    method: "POST", headers: { cookie: ADMIN_COOKIE, connection: "close" }, body: fd,
  })
  expect(r.status).toBe(413)
  expect((await r.json()).error).toContain("25MB")
  expect(s3Writes).toBe(0) // rejected on headers alone — no bytes buffered, nothing stored
})

// Memory-DoS regression test: a CHUNKED request (streamed body, NO Content-Length header) carrying an
// oversized body must be rejected with 413 WITHOUT the server buffering the whole thing. Previously the
// declaredLen guard read Content-Length (absent on chunked) as 0, passed, and req.formData() buffered
// the entire multi-chunk body into RAM before the file.size check. Now readBodyBounded aborts at the
// ceiling.
test("a chunked (no Content-Length) oversized body is rejected 413 without buffering or S3 writes", async () => {
  s3Writes = 0
  const CHUNK = new Uint8Array(64 * 1024) // 64KB per chunk
  const TOTAL = 32 * 1024 * 1024 // 32MB total — over the 25MB+64KB ceiling
  let sent = 0
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= TOTAL) { controller.close(); return }
      controller.enqueue(CHUNK)
      sent += CHUNK.byteLength
    },
  })
  const r = await fetch(`${BASE}/api/trails/author/attachments?project=${PROJ}`, {
    method: "POST",
    headers: {
      cookie: ADMIN_COOKIE,
      // Streaming body ⇒ chunked transfer-encoding, so NO Content-Length is sent. A boundary header
      // is present but the payload is never a valid/complete multipart — it must be rejected on size.
      "content-type": "multipart/form-data; boundary=----klavtest",
      // See the fast-reject test above: avoid reusing an undrained keep-alive socket afterwards.
      connection: "close",
    },
    body: stream,
    // @ts-ignore — required by fetch when body is a stream (Bun/undici)
    duplex: "half",
  })
  expect(r.status).toBe(413)
  expect((await r.json()).error).toContain("25MB")
  expect(s3Writes).toBe(0) // rejected BEFORE formData()/upload — nothing buffered through to storage
})
