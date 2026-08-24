// server.voice-transcribe.route.test.ts (KLA-505)
// Server-side LIVE DICTATION endpoint — POST /api/voice/transcribe — that replaces the flaky browser Web
// Speech backend. The composer records short mic clips (MediaRecorder) and POSTs each as multipart audio;
// the server runs it through the SHARED transcribe.ts STT core (here pointed at a local OpenRouter
// stand-in via KLAV_TRANSCRIBE_ENDPOINT) and returns the recognized text as JSON.
//
// Auth mirrors /api/report/clarity: anonymous + CORS-gated + project-scoped, rate-limited per IP AND per
// project, with a hard size cap and an ai_calls ledger entry per real STT call. Verifies:
//   * a valid clip → 200 { text }, exactly one upstream STT call
//   * missing projectId → 400 · unknown project → 404 · missing audio → 400
//   * an over-cap clip → 413 (rejected, no upstream STT call)
//   * per-IP rate limit → 429 once the window is exhausted (forged XFF is honored only from a trusted
//     loopback peer, so distinct XFFs get distinct budgets — matching clientIp's contract)

import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-voice-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(41)).toString("base64")
const PORT = 46700 + Math.floor(Math.random() * 200)
const STT_PORT = PORT + 1
const BASE = `http://localhost:${PORT}`

const ACCT = `acct_v_${RUN}`
const PROJ = `proj_v_${RUN}`
const ADMIN = `voice-admin-${RUN}@test.local`
const VOICE_PER_IP = 3            // small per-IP window so the rate-limit test can exhaust it
const VOICE_MAX_BYTES = 2048      // small hard cap so a >2KB clip trips the 413 path

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

let appProc: ReturnType<typeof Bun.spawn>
// A tiny OpenRouter audio-transcription stand-in: counts calls + echoes a fixed transcript in the
// endpoint's response shape ({ text, usage:{ seconds, cost } }).
let sttCalls = 0
let lastSttHadFile = false
const stt = Bun.serve({
  port: STT_PORT,
  async fetch(req) {
    sttCalls++
    try { const f = await req.formData(); lastSttHadFile = f.get("file") instanceof Blob } catch { lastSttHadFile = false }
    return Response.json({ text: "the coupon code does nothing on mobile", usage: { seconds: 3, cost: 0.0002 } })
  },
})

async function seed() {
  const now = Date.now()
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [ADMIN, now])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Voice Test", ADMIN, now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, ADMIN, "owner", now])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Voice Project", "active", "auto", 200, "named", now, now])
}

function postVoice(fields: { projectId?: string; audio?: Blob | null }, xff?: string) {
  const fd = new FormData()
  if (fields.projectId !== undefined) fd.append("projectId", fields.projectId)
  if (fields.audio !== undefined && fields.audio !== null) fd.append("audio", fields.audio, "dictation.webm")
  return fetch(`${BASE}/api/voice/transcribe`, {
    method: "POST",
    headers: { ...(xff ? { "x-forwarded-for": xff } : {}) },
    body: fd,
  })
}
const smallClip = () => new Blob([new Uint8Array(256)], { type: "audio/webm" })

beforeAll(async () => {
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(PORT),
      TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
      // STT key present + endpoint pointed at our local stand-in so transcribeConfigured() is true.
      OPENROUTER_API_KEY: "test-key",
      KLAV_TRANSCRIBE_ENDPOINT: `http://localhost:${STT_PORT}/v1/audio/transcriptions`,
      KLAV_VOICE_PER_IP: String(VOICE_PER_IP),
      KLAV_VOICE_MAX_BYTES: String(VOICE_MAX_BYTES),
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

afterAll(() => { appProc?.kill(); stt.stop(true); raw.close(); rmDb() })

test("a valid clip returns 200 { text } and makes exactly one upstream STT call", async () => {
  sttCalls = 0; lastSttHadFile = false
  const r = await postVoice({ projectId: PROJ, audio: smallClip() }, "203.0.113.10")
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.text).toBe("the coupon code does nothing on mobile")
  expect(sttCalls).toBe(1)
  expect(lastSttHadFile).toBe(true) // audio streamed to STT as a multipart file part (no base64/JSON)
})

test("a missing projectId returns 400 (no STT call)", async () => {
  sttCalls = 0
  const r = await postVoice({ audio: smallClip() }, "203.0.113.11")
  expect(r.status).toBe(400)
  expect(sttCalls).toBe(0)
})

test("an unknown project returns 404 (no STT call)", async () => {
  sttCalls = 0
  const r = await postVoice({ projectId: "proj_missing", audio: smallClip() }, "203.0.113.12")
  expect(r.status).toBe(404)
  expect(sttCalls).toBe(0)
})

test("a missing audio part returns 400 (no STT call)", async () => {
  sttCalls = 0
  const r = await postVoice({ projectId: PROJ }, "203.0.113.13")
  expect(r.status).toBe(400)
  expect(sttCalls).toBe(0)
})

test("an over-cap clip is rejected with 413 and makes no STT call", async () => {
  sttCalls = 0
  const big = new Blob([new Uint8Array(VOICE_MAX_BYTES + 500)], { type: "audio/webm" })
  const r = await postVoice({ projectId: PROJ, audio: big }, "203.0.113.14")
  expect(r.status).toBe(413)
  expect(sttCalls).toBe(0)
})

test("per-IP rate limit: window exhausts to 429 for the SAME client IP", async () => {
  const ip = "198.51.100.42"
  // VOICE_PER_IP requests from the same IP succeed; the next is throttled.
  for (let i = 0; i < VOICE_PER_IP; i++) {
    const r = await postVoice({ projectId: PROJ, audio: smallClip() }, ip)
    expect(r.status).toBe(200)
  }
  const over = await postVoice({ projectId: PROJ, audio: smallClip() }, ip)
  expect(over.status).toBe(429)
})
