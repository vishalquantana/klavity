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
// PX4 #471: tiny payload cap so the over-cap test can trip it with a small buffer (must be set BEFORE
// importing ./transcribe, which reads KLAV_TRANSCRIBE_MAX_BYTES at module load).
process.env.KLAV_TRANSCRIBE_MAX_BYTES = "1000"

// Mock the S3 byte-fetch so transcribeRecording gets bytes without a real bucket.
const { mock } = await import("bun:test")
mock.module("./s3", () => ({
  getObjectBytes: async () => ({ bytes: new Uint8Array([1, 2, 3, 4]), contentType: "video/webm" }),
}))

const { reconnectDb, applySchema, insertFeedback, feedbackById } = await import("./db")
const { parseTranscribeResponse, parseDeepgramResponse, transcribeFeedbackRecordings, transcribeFeedbackAttachments, transcribeRecording, TRANSCRIBE_MODEL, TRANSCRIBE_MAX_BYTES, activeTranscribeModel } = await import("./transcribe")

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

// PX4 #471: an over-cap recording is SKIPPED — no POST, no base64 encode, no ai_calls ledger row.
test("transcribeFeedbackRecordings: over-cap recording is skipped (no POST)", async () => {
  // Re-point the S3 mock at bytes LARGER than the (tiny, test-set) payload cap.
  const big = new Uint8Array(TRANSCRIBE_MAX_BYTES + 500)
  mock.module("./s3", () => ({ getObjectBytes: async () => ({ bytes: big, contentType: "video/webm" }) }))
  // Any POST attempt must FAIL the test — an over-cap clip must never reach the network.
  let posted = false
  globalThis.fetch = (async () => { posted = true; throw new Error("should not POST an over-cap clip") }) as any

  const rec = { id: `rec_${RUN}_big`, key: "attachments/huge.webm", contentType: "video/webm", transcript_status: "pending" }
  const fid = await insertFeedback({ projectId: P, observation: "huge recording bug", recordings: [rec] })
  const before = (await aiCallsFor(TRANSCRIBE_MODEL)).length

  await transcribeFeedbackRecordings({ feedbackId: fid, projectId: P, recordings: [rec] })

  expect(posted).toBe(false)
  const row = await feedbackById(P, fid)
  expect(row.observation).toBe("huge recording bug") // report intact
  const stored = row.recordings.find((r: any) => r.id === rec.id)
  expect(stored.transcript_status).toBe("skipped")
  expect(String(stored.transcript_reason || "")).toContain("too large")
  // No upstream call → no ledger row for a skipped clip.
  expect((await aiCallsFor(TRANSCRIBE_MODEL)).length).toBe(before)

  // Restore the small-bytes S3 mock for subsequent tests.
  mock.module("./s3", () => ({ getObjectBytes: async () => ({ bytes: new Uint8Array([1, 2, 3, 4]), contentType: "video/webm" }) }))
})

// PX4 #471: an under-cap recording is POSTed as multipart/form-data (a `file` field) — NOT base64 JSON.
test("transcribeRecording: under-cap clip posts via multipart/form-data (file field, no base64 JSON)", async () => {
  let captured: { body: any; headers: any } | null = null
  globalThis.fetch = (async (_url: any, init: any) => {
    captured = { body: init?.body, headers: init?.headers }
    return {
      ok: true, status: 200,
      json: async () => ({ text: "multipart worked", usage: { seconds: 1, cost: 0.0001 } }),
      text: async () => "{}",
    }
  }) as any

  const out = await transcribeRecording("attachments/small.webm", "video/webm")
  expect(out.status).toBe("done")
  expect(captured).toBeTruthy()
  // The body is a FormData with a `file` part — not a JSON string with base64 input_audio.
  expect(captured!.body instanceof FormData).toBe(true)
  const fd = captured!.body as FormData
  expect(fd.get("file")).toBeInstanceOf(Blob)
  expect(fd.get("model")).toBe(TRANSCRIBE_MODEL)
  // We must NOT set Content-Type ourselves (fetch adds the multipart boundary).
  const ctHeader = captured!.headers && (captured!.headers["Content-Type"] || captured!.headers["content-type"])
  expect(ctHeader).toBeUndefined()
})

// PX4 #471: a 413 (payload too large) response degrades to 'failed' gracefully — report intact.
test("transcribeRecording: a 413 response degrades to failed (not a throw)", async () => {
  globalThis.fetch = (async () => ({
    ok: false, status: 413,
    json: async () => ({ error: "payload too large" }),
    text: async () => "payload too large",
  })) as any
  const out = await transcribeRecording("attachments/big2.webm", "video/webm")
  expect(out.status).toBe("failed")
  if (out.status === "failed") expect(out.reason).toBe("payload-too-large")
})

// ── KLAVITYKLA-480: transcribe ANY uploaded video attachment (attachments_json), not just record-me clips.

test("transcribeFeedbackAttachments: video upload → done, transcript stored by key, ai_call logged", async () => {
  const vid = { key: "attachments/uploaded-clip.mp4", filename: "bug.mp4", contentType: "video/mp4", size: 4, transcript_status: "pending" }
  const fid = await insertFeedback({ projectId: P, observation: "uploaded video bug", attachments: [vid] })

  mockFetch({ text: "the spoken note in the uploaded video", usage: { seconds: 4, cost: 0.0003 } })
  const before = (await aiCallsFor(TRANSCRIBE_MODEL)).length

  await transcribeFeedbackAttachments({ feedbackId: fid, projectId: P, attachments: [vid] })

  const row = await feedbackById(P, fid)
  const stored = row.attachments.find((a: any) => a.key === vid.key)
  expect(stored.transcript_status).toBe("done")
  expect(stored.transcript_json.text).toBe("the spoken note in the uploaded video")

  const calls = await aiCallsFor(TRANSCRIBE_MODEL)
  expect(calls.length).toBe(before + 1)
  expect(Number(calls[calls.length - 1].ok)).toBe(1)
})

test("transcribeFeedbackAttachments: non-video attachment is skipped entirely (no transcript, no POST, no ai_call)", async () => {
  const pdf = { key: "attachments/report.pdf", filename: "report.pdf", contentType: "application/pdf", size: 4 }
  const fid = await insertFeedback({ projectId: P, observation: "pdf attached", attachments: [pdf] })

  // Any POST must fail the test — a non-video attachment must never reach STT.
  let posted = false
  globalThis.fetch = (async () => { posted = true; throw new Error("should not POST a non-video attachment") }) as any
  const before = (await aiCallsFor(TRANSCRIBE_MODEL)).length

  await transcribeFeedbackAttachments({ feedbackId: fid, projectId: P, attachments: [pdf] })

  expect(posted).toBe(false)
  const row = await feedbackById(P, fid)
  const stored = row.attachments.find((a: any) => a.key === pdf.key)
  expect(stored.transcript_status).toBeUndefined() // untouched — no field added to a non-video attachment
  expect(stored.transcript_json).toBeUndefined()
  expect((await aiCallsFor(TRANSCRIBE_MODEL)).length).toBe(before) // no ledger row
})

test("transcribeFeedbackAttachments: over-cap video upload is skipped (no POST, no ai_call)", async () => {
  const big = new Uint8Array(TRANSCRIBE_MAX_BYTES + 500)
  mock.module("./s3", () => ({ getObjectBytes: async () => ({ bytes: big, contentType: "video/mp4" }) }))
  let posted = false
  globalThis.fetch = (async () => { posted = true; throw new Error("should not POST an over-cap upload") }) as any

  const vid = { key: "attachments/huge-upload.mp4", filename: "huge.mp4", contentType: "video/mp4", size: 4, transcript_status: "pending" }
  const fid = await insertFeedback({ projectId: P, observation: "huge upload bug", attachments: [vid] })
  const before = (await aiCallsFor(TRANSCRIBE_MODEL)).length

  await transcribeFeedbackAttachments({ feedbackId: fid, projectId: P, attachments: [vid] })

  expect(posted).toBe(false)
  const row = await feedbackById(P, fid)
  expect(row.observation).toBe("huge upload bug") // report intact
  const stored = row.attachments.find((a: any) => a.key === vid.key)
  expect(stored.transcript_status).toBe("skipped")
  expect(String(stored.transcript_reason || "")).toContain("too large")
  expect((await aiCallsFor(TRANSCRIBE_MODEL)).length).toBe(before)

  // Restore the small-bytes S3 mock for subsequent tests.
  mock.module("./s3", () => ({ getObjectBytes: async () => ({ bytes: new Uint8Array([1, 2, 3, 4]), contentType: "video/webm" }) }))
})

test("transcribeFeedbackAttachments: STT failure → status=failed, report intact, ai_call ok=0", async () => {
  const vid = { key: "attachments/bad-upload.mp4", filename: "bad.mp4", contentType: "video/mp4", size: 4, transcript_status: "pending" }
  const fid = await insertFeedback({ projectId: P, observation: "upload fail bug", attachments: [vid] })

  mockFetch({ error: "model unavailable" }, false, 502)
  const before = (await aiCallsFor(TRANSCRIBE_MODEL)).length

  await transcribeFeedbackAttachments({ feedbackId: fid, projectId: P, attachments: [vid] }) // must not throw

  const row = await feedbackById(P, fid)
  expect(row.observation).toBe("upload fail bug") // untouched
  const stored = row.attachments.find((a: any) => a.key === vid.key)
  expect(stored.transcript_status).toBe("failed")
  expect(stored.transcript_json == null || stored.transcript_json === undefined).toBe(true)

  const calls = await aiCallsFor(TRANSCRIBE_MODEL)
  expect(calls.length).toBe(before + 1)
  expect(Number(calls[calls.length - 1].ok)).toBe(0)
})

// ── Deepgram parsing (voice-502 fix) ─────────────────────────────────────────────────────────────
test("parseDeepgramResponse: prerecorded shape → transcript text", () => {
  const out = parseDeepgramResponse({
    metadata: { duration: 3.2 },
    results: { channels: [{ alternatives: [{ transcript: "  the coupon code does nothing on mobile  " }] }] },
  })
  expect(out).not.toBeNull()
  expect(out!.text).toBe("the coupon code does nothing on mobile")
  expect(out!.usage.seconds).toBe(3.2)
})

test("parseDeepgramResponse: utterances → timestamped segments", () => {
  const out = parseDeepgramResponse({
    metadata: { duration: 6 },
    results: {
      channels: [{ alternatives: [{ transcript: "hello there general" }] }],
      utterances: [
        { start: 0.1, end: 1.2, transcript: "hello there" },
        { start: 1.3, end: 2.0, transcript: "general" },
      ],
    },
  })
  expect(out).not.toBeNull()
  expect(out!.segments).toEqual([
    { start: 0.1, end: 1.2, text: "hello there" },
    { start: 1.3, end: 2.0, text: "general" },
  ])
})

test("parseDeepgramResponse: empty transcript → null", () => {
  expect(parseDeepgramResponse({ results: { channels: [{ alternatives: [{ transcript: "" }] }] } })).toBeNull()
  expect(parseDeepgramResponse(null)).toBeNull()
})

test("activeTranscribeModel: DEEPGRAM_API_KEY present → deepgram model, else OpenRouter", () => {
  const saved = process.env.DEEPGRAM_API_KEY
  try {
    process.env.DEEPGRAM_API_KEY = "dg-test"
    expect(activeTranscribeModel()).toBe("deepgram/nova-2")
    delete process.env.DEEPGRAM_API_KEY
    expect(activeTranscribeModel()).toBe(TRANSCRIBE_MODEL)
  } finally {
    if (saved) process.env.DEEPGRAM_API_KEY = saved
    else delete process.env.DEEPGRAM_API_KEY
  }
})

test("transcribeFeedbackRecordings: no API key → status=none (no stuck spinner)", async () => {
  const saved = process.env.OPENROUTER_API_KEY
  delete process.env.OPENROUTER_API_KEY
  const savedAlt = process.env.KLAV_OPENROUTER_KEY
  delete process.env.KLAV_OPENROUTER_KEY
  const savedDg = process.env.DEEPGRAM_API_KEY
  delete process.env.DEEPGRAM_API_KEY
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
    if (savedDg) process.env.DEEPGRAM_API_KEY = savedDg
  }
})
