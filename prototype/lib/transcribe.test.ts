// KLAVITYKLA-438 "Record me" (Phase 2) — async STT transcription.
// Exercises: (1) parseTranscribeResponse handles both plain-text and verbose_json (segments) shapes;
// (2) transcribeFeedbackRecordings flips a recording's status pending→done and stores the transcript
// in-place by id; (3) a failed STT call sets status=failed without breaking the report; (4) each call is
// logged to ai_calls (type=transcribe). Hermetic temp-DB (mirrors server.recordings / ai-credits tests);
// the OpenRouter STT fetch and the S3 byte-fetch are both mocked — no network, no S3.
import { test, expect, beforeAll, afterEach } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-transcribe-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.OPENROUTER_API_KEY = "sk-test-transcribe" // so transcription is "configured"

// Mock the S3 byte-fetch so transcribeRecording gets bytes without a real bucket.
const { mock } = await import("bun:test")
mock.module("./s3", () => ({
  getObjectBytes: async () => ({ bytes: new Uint8Array([1, 2, 3, 4]), contentType: "video/webm" }),
}))

const { reconnectDb, applySchema, insertFeedback, feedbackById } = await import("./db")
const { parseTranscribeResponse, transcribeFeedbackRecordings, TRANSCRIBE_MODEL } = await import("./transcribe")

const RUN = `${Date.now()}_${Math.random().toString(36).slice(2)}`
const ACCT = `acct_${RUN}`
const P = `proj_tx_${RUN}`
let rawDb: any
const realFetch = globalThis.fetch

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  rawDb = db
  const now = Date.now()
  await db.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at,domain) VALUES (?,?,?,?,?)", args: [ACCT, "TX Tenant", `owner_${RUN}@x.com`, now, null] })
  await db.execute({ sql: "INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)", args: [P, ACCT, "TX Project", "active", "auto", 100, "named", now, now] })
})

afterEach(() => { globalThis.fetch = realFetch })

function mockFetch(payload: any, ok = true, status = 200) {
  globalThis.fetch = (async () => ({
    ok, status,
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  })) as any
}

async function aiCallsFor(model: string): Promise<any[]> {
  const r = await rawDb.execute({ sql: "SELECT * FROM ai_calls WHERE model=? AND type='transcribe'", args: [model] })
  return r.rows as any[]
}

test("parseTranscribeResponse: plain text-only response (no segments)", () => {
  const out = parseTranscribeResponse({ text: "  the coupon does nothing  ", usage: { seconds: 12, cost: 0.0004 } })
  expect(out).toBeTruthy()
  expect(out!.text).toBe("the coupon does nothing")
  expect(out!.segments).toBeNull()
  expect(out!.usage.cost).toBe(0.0004)
})

test("parseTranscribeResponse: verbose_json with timestamped segments", () => {
  const out = parseTranscribeResponse({
    text: "hello world",
    segments: [{ start: 0, end: 1.5, text: "hello" }, { start: 1.5, end: 3, text: "world" }],
    usage: { seconds: 3, cost: 0.0001 },
  })
  expect(out!.segments).toHaveLength(2)
  expect(out!.segments![0]).toEqual({ start: 0, end: 1.5, text: "hello" })
})

test("parseTranscribeResponse: empty/garbage returns null", () => {
  expect(parseTranscribeResponse({})).toBeNull()
  expect(parseTranscribeResponse(null)).toBeNull()
})

test("transcribeFeedbackRecordings: pending → done, transcript stored by id, ai_call logged", async () => {
  const rec = { id: `rec_${RUN}_ok`, key: "attachments/clip.webm", contentType: "video/webm", transcript_status: "pending" }
  const fid = await insertFeedback({ projectId: P, observation: "video bug", recordings: [rec] })

  mockFetch({ text: "steps to reproduce the bug", segments: [{ start: 2, end: 5, text: "steps to reproduce" }], usage: { seconds: 5, cost: 0.0002 } })
  const before = (await aiCallsFor(TRANSCRIBE_MODEL)).length

  await transcribeFeedbackRecordings({ feedbackId: fid, projectId: P, recordings: [rec] })

  const row = await feedbackById(P, fid)
  const stored = row.recordings.find((r: any) => r.id === rec.id)
  expect(stored.transcript_status).toBe("done")
  expect(stored.transcript_json.text).toBe("steps to reproduce the bug")
  expect(stored.transcript_json.segments).toHaveLength(1)
  expect(stored.transcript_json.segments[0].start).toBe(2)

  const calls = await aiCallsFor(TRANSCRIBE_MODEL)
  expect(calls.length).toBe(before + 1)
  expect(Number(calls[calls.length - 1].ok)).toBe(1)
})

test("transcribeFeedbackRecordings: STT failure → status=failed, report intact, ai_call ok=0", async () => {
  const rec = { id: `rec_${RUN}_fail`, key: "attachments/bad.webm", contentType: "video/webm", transcript_status: "pending" }
  const fid = await insertFeedback({ projectId: P, observation: "another bug", recordings: [rec] })

  mockFetch({ error: "model unavailable" }, false, 502)
  const before = (await aiCallsFor(TRANSCRIBE_MODEL)).length

  // Must not throw.
  await transcribeFeedbackRecordings({ feedbackId: fid, projectId: P, recordings: [rec] })

  const row = await feedbackById(P, fid)
  expect(row.observation).toBe("another bug") // report untouched
  const stored = row.recordings.find((r: any) => r.id === rec.id)
  expect(stored.transcript_status).toBe("failed")
  expect(stored.transcript_json == null || stored.transcript_json === undefined).toBe(true)

  const calls = await aiCallsFor(TRANSCRIBE_MODEL)
  expect(calls.length).toBe(before + 1)
  expect(Number(calls[calls.length - 1].ok)).toBe(0)
})

test("transcribeFeedbackRecordings: no API key → status=none (no stuck spinner)", async () => {
  const saved = process.env.OPENROUTER_API_KEY
  delete process.env.OPENROUTER_API_KEY
  const savedAlt = process.env.KLAV_OPENROUTER_KEY
  delete process.env.KLAV_OPENROUTER_KEY
  try {
    const rec = { id: `rec_${RUN}_none`, key: "attachments/x.webm", contentType: "video/webm", transcript_status: "pending" }
    const fid = await insertFeedback({ projectId: P, observation: "no key bug", recordings: [rec] })
    await transcribeFeedbackRecordings({ feedbackId: fid, projectId: P, recordings: [rec] })
    const row = await feedbackById(P, fid)
    const stored = row.recordings.find((r: any) => r.id === rec.id)
    expect(stored.transcript_status).toBe("none")
  } finally {
    if (saved) process.env.OPENROUTER_API_KEY = saved
    if (savedAlt) process.env.KLAV_OPENROUTER_KEY = savedAlt
  }
})
