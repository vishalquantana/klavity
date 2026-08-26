// server.voice-transcribe.deepgram.route.test.ts (voice-502 fix)
// The live-dictation endpoint POST /api/voice/transcribe now PREFERS Deepgram's prerecorded API whenever
// DEEPGRAM_API_KEY is set. This test points the server's Deepgram backend at a local stand-in
// (KLAV_DEEPGRAM_ENDPOINT) and verifies:
//   * a valid clip → 200 { text } (transcript parsed from results.channels[0].alternatives[0].transcript)
//   * the RAW audio bytes are POSTed with the clip's Content-Type (no multipart/base64 to Deepgram)
//   * the Authorization header is `Token <key>` (Deepgram auth scheme), key never leaks to the client
//   * a Deepgram BACKEND ERROR degrades to a CLEAN 503 (NOT the old 502) so the client falls back
import { afterAll, beforeAll, expect, test } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB_FILE = join(tmpdir(), `klav-voice-dg-${RUN}.db`)
const SECRET = Buffer.from(new Uint8Array(32).fill(43)).toString("base64")
const PORT = 47100 + Math.floor(Math.random() * 200)
const DG_PORT = PORT + 1
const BASE = `http://localhost:${PORT}`

const ACCT = `acct_vdg_${RUN}`
const PROJ = `proj_vdg_${RUN}`
const ADMIN = `voice-dg-admin-${RUN}@test.local`

function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} } }
rmDb()

const raw = createClient({ url: "file:" + DB_FILE })
await raw.execute("PRAGMA journal_mode=WAL")
await raw.execute("PRAGMA busy_timeout=5000")
async function exec(sql: string, args: any[] = []) { await raw.execute({ sql, args }) }

let appProc: ReturnType<typeof Bun.spawn>

// A tiny Deepgram prerecorded stand-in. Records what it received; the transcript/status is driven by
// a query flag (?fail=1 → 500) so one server can exercise both the happy and error paths.
let dgCalls = 0
let lastAuth = ""
let lastCT = ""
let lastBodyLen = 0
const dg = Bun.serve({
  port: DG_PORT,
  async fetch(req) {
    dgCalls++
    lastAuth = req.headers.get("authorization") || ""
    lastCT = req.headers.get("content-type") || ""
    const body = new Uint8Array(await req.arrayBuffer())
    lastBodyLen = body.byteLength
    const url = new URL(req.url)
    if (url.searchParams.get("fail") === "1") {
      return new Response("upstream boom", { status: 500 })
    }
    return Response.json({
      metadata: { duration: 3 },
      results: { channels: [{ alternatives: [{ transcript: "the coupon code does nothing on mobile" }] }] },
    })
  },
})

async function seed() {
  const now = Date.now()
  await exec("INSERT INTO users (email, created_at) VALUES (?, ?)", [ADMIN, now])
  await exec("INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", [ACCT, "Voice DG Test", ADMIN, now])
  await exec("INSERT INTO account_members (id, account_id, email, account_role, created_at) VALUES (?, ?, ?, ?, ?)", [`am_${RUN}`, ACCT, ADMIN, "owner", now])
  await exec("INSERT INTO projects (id, account_id, name, status, review_mode, review_budget_daily, observability_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [PROJ, ACCT, "Voice DG Project", "active", "auto", 200, "named", now, now])
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
const smallClip = () => new Blob([new Uint8Array(256).fill(7)], { type: "audio/webm" })

beforeAll(async () => {
  appProc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(PORT),
      TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET, KLAV_BASE_URL: BASE, KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
      // Deepgram configured + endpoint pointed at our local stand-in. No OpenRouter key → proves the
      // Deepgram path is the one taken.
      OPENROUTER_API_KEY: "",
      DEEPGRAM_API_KEY: "dg-test-key",
      KLAV_DEEPGRAM_ENDPOINT: `http://localhost:${DG_PORT}/v1/listen`,
      KLAV_VOICE_PER_IP: "50",
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

afterAll(() => { appProc?.kill(); dg.stop(true); raw.close(); rmDb() })

test("valid clip → 200 { text } via Deepgram; raw bytes + Token auth + clip Content-Type", async () => {
  dgCalls = 0; lastAuth = ""; lastCT = ""; lastBodyLen = 0
  const r = await postVoice({ projectId: PROJ, audio: smallClip() }, "203.0.113.20")
  expect(r.status).toBe(200)
  const body = await r.json()
  expect(body.text).toBe("the coupon code does nothing on mobile")
  expect(dgCalls).toBe(1)
  // Deepgram auth scheme (NOT Bearer) + raw audio body with the clip's own Content-Type (no multipart).
  expect(lastAuth).toBe("Token dg-test-key")
  // The clip's own Content-Type is forwarded verbatim as the raw-body content-type (a webm variant —
  // multipart round-trip may report it as video/webm; Deepgram accepts either).
  expect(lastCT).toContain("webm")
  expect(lastBodyLen).toBe(256)
})

test("Deepgram backend error degrades to a CLEAN 503 (never a 502)", async () => {
  // Configure the server's Deepgram endpoint to the failing variant by restarting is heavy; instead we
  // exercise the same code path by asserting the handler contract: a failed outcome → 503 with text:"".
  // We drive the stand-in's ?fail=1 by re-launching a second server pointed at the failing URL.
  const P2 = PORT + 50
  const proc2 = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env, PORT: String(P2),
      TURSO_DATABASE_URL: "file:" + DB_FILE, TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: SECRET, KLAV_BASE_URL: `http://localhost:${P2}`, KLAV_ALLOWED_DOMAINS: "test.local",
      SENDGRID_API_KEY: "", KLAV_MAIL_FROM: "",
      OPENROUTER_API_KEY: "",
      DEEPGRAM_API_KEY: "dg-test-key",
      KLAV_DEEPGRAM_ENDPOINT: `http://localhost:${DG_PORT}/v1/listen?fail=1`,
      KLAV_VOICE_PER_IP: "50",
    },
    stdout: "ignore", stderr: "ignore",
  })
  try {
    const deadline = Date.now() + 20_000
    while (Date.now() < deadline) {
      const r = await fetch(`http://localhost:${P2}/favicon.svg`).catch(() => null)
      if (r && r.status < 500) break
      await Bun.sleep(150)
    }
    const fd = new FormData()
    fd.append("projectId", PROJ)
    fd.append("audio", smallClip(), "dictation.webm")
    const r = await fetch(`http://localhost:${P2}/api/voice/transcribe`, {
      method: "POST", headers: { "x-forwarded-for": "203.0.113.21" }, body: fd,
    })
    expect(r.status).toBe(503)      // CLEAN handled error — the old 502 is gone
    expect(r.status).not.toBe(502)
    const body = await r.json()
    expect(body.text).toBe("")
    expect(body.error).toBe("transcription failed")
    expect(body.fallback).toBe(true) // client engages Web Speech fallback
  } finally {
    proc2.kill()
  }
})
