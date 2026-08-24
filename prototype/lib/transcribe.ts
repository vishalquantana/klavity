// KLAVITYKLA-438 "Record me" (Phase 2): async speech-to-text transcription of a recorded clip.
//
// Phase 1 uploads screen+camera+mic recordings PRIVATE to S3 and persists descriptors on the feedback
// row (recordings_json). Here we fetch each clip's bytes back from S3, base64-encode the RAW audio and
// POST it to OpenRouter's audio-transcription endpoint. The resulting transcript (text + optional
// timestamped segments) is stored back onto the recording keyed by its stable `id`, and the call is
// logged to the ai_calls cost ledger. Fire-and-forget from the intake path — never blocks or fails the
// feedback submission, and every fetch/parse/network failure degrades to a `failed`/`none` status rather
// than throwing to the caller.
import { getObjectBytes } from "./s3"
import { setRecordingTranscript, setFeedbackAttachmentTranscript, recordAiCall } from "./db"

// Swappable model constant. Default: Nvidia's Nemotron streaming ASR (verified live on OpenRouter,
// cheap + multilingual). Alternatives worth a swap if quality/timestamps disappoint:
//   openai/whisper-1, openai/whisper-large-v3-turbo, qwen/qwen3-asr-flash-2026-02-10
// Overridable at deploy via KLAV_TRANSCRIBE_MODEL without a code change.
export const TRANSCRIBE_MODEL =
  process.env.KLAV_TRANSCRIBE_MODEL || "nvidia/nemotron-3.5-asr-streaming-multilingual-0.6b"

// Overridable at deploy (and pointed at a local stand-in by the route integration test) without a code
// change. Defaults to OpenRouter's audio-transcription endpoint.
const ENDPOINT = process.env.KLAV_TRANSCRIBE_ENDPOINT || "https://openrouter.ai/api/v1/audio/transcriptions"

export type TranscriptSegment = { start: number; end: number; text: string }
export type TranscriptJson = { text: string; segments: TranscriptSegment[] | null }
export type TranscriptResult = TranscriptJson & { usage: { seconds: number | null; cost: number | null } }

// PX4 #471 — discriminated outcome so the caller can distinguish a clip we DELIBERATELY did not send
// (too large → 'skipped', no cost, no POST) from one we tried and lost ('failed'). A base64+JSON body
// roughly DOUBLES a recording's size in memory, and OpenRouter/proxy rejects bodies over ~25MB, so a
// 50MB clip both OOMs the encode and 413s the POST. We cap the RAW bytes well under that and stream the
// S3 bytes as multipart/form-data (a `file` field) instead of base64-in-JSON.
export type TranscribeOutcome =
  | { status: "done"; result: TranscriptResult }
  | { status: "failed"; reason: string }
  | { status: "skipped"; reason: string }

// Hard ceiling on the RAW recording bytes we will POST. Kept below OpenRouter's ~25MB request limit so
// even multipart framing overhead stays under the wire cap. Overridable for ops without a code change.
export const TRANSCRIBE_MAX_BYTES = Number(process.env.KLAV_TRANSCRIBE_MAX_BYTES || 20 * 1024 * 1024)
// Wall-clock ceiling for the STT POST so a hung upstream degrades to 'failed' instead of blocking.
const TRANSCRIBE_TIMEOUT_MS = Number(process.env.KLAV_TRANSCRIBE_TIMEOUT_MS || 120_000)

// The OpenRouter key Klavity already uses. Both env names appear across the codebase (label-suggest reads
// KLAV_OPENROUTER_KEY, trails reads OPENROUTER_API_KEY) — accept either so transcription lights up wherever
// a key is configured.
function apiKey(): string | undefined {
  return process.env.OPENROUTER_API_KEY || process.env.KLAV_OPENROUTER_KEY
}
export function transcribeConfigured(): boolean {
  return !!apiKey()
}

// Map an S3/browser content-type to the `format` hint the endpoint expects (a bare container name,
// not a MIME type). Record-me clips are video/webm|video/mp4; the audio track is what STT reads.
export function audioFormatFor(contentType: string): string {
  const ct = (contentType || "").toLowerCase()
  if (ct.includes("mp4")) return "mp4"
  if (ct.includes("mpeg") || ct.includes("mp3")) return "mp3"
  if (ct.includes("wav")) return "wav"
  if (ct.includes("ogg")) return "ogg"
  return "webm"
}

// Normalize whatever the model returns into { text, segments, usage }. Handles both the plain-text
// response (only `text`) and the verbose_json shape (`segments: [{start,end,text}]`). Returns null when
// there is nothing usable to store. Exported so the unit tests can exercise parsing without a network.
export function parseTranscribeResponse(data: any): TranscriptResult | null {
  if (!data || typeof data !== "object") return null
  const text = typeof data.text === "string" ? data.text.trim() : ""
  let segments: TranscriptSegment[] | null = null
  const rawSegs = Array.isArray(data.segments) ? data.segments : null
  if (rawSegs && rawSegs.length) {
    const mapped = rawSegs
      .map((s: any) => ({ start: Number(s?.start) || 0, end: Number(s?.end) || 0, text: String(s?.text ?? "").trim() }))
      .filter((s: TranscriptSegment) => s.text)
    if (mapped.length) segments = mapped
  }
  const seconds = data?.usage?.seconds != null ? Number(data.usage.seconds) : null
  const cost = data?.usage?.cost != null ? Number(data.usage.cost) : null
  const finalText = text || (segments ? segments.map(s => s.text).join(" ") : "")
  if (!finalText && !(segments && segments.length)) return null
  return { text: finalText, segments, usage: { seconds, cost } }
}

// Content-type / extension for the multipart `file` part, matched to the format hint.
function fileMetaFor(ct: string): { mime: string; ext: string } {
  const fmt = audioFormatFor(ct)
  if (fmt === "mp4") return { mime: (ct && ct.toLowerCase().includes("mp4")) ? ct : "audio/mp4", ext: "mp4" }
  if (fmt === "mp3") return { mime: "audio/mpeg", ext: "mp3" }
  if (fmt === "wav") return { mime: "audio/wav", ext: "wav" }
  if (fmt === "ogg") return { mime: "audio/ogg", ext: "ogg" }
  return { mime: (ct && ct.toLowerCase().includes("webm")) ? ct : "video/webm", ext: "webm" }
}

// Transcribe ONE recording by its S3 key. Resilient: NEVER throws. Returns a discriminated outcome:
//   • 'skipped' — the raw clip exceeds TRANSCRIBE_MAX_BYTES; we do NOT encode or POST it (no OOM/413).
//   • 'failed'  — a real attempt that lost (missing key, unfetchable bytes, non-2xx incl. 413, timeout,
//                 unparseable/empty body).
//   • 'done'    — a parsed transcript.
// PX4 #471: the S3 bytes stream to OpenRouter as multipart/form-data (a `file` field). We do NOT
// base64-encode the whole file into a JSON body (that ~doubles memory and blows the request-size cap).
export async function transcribeRecording(s3Key: string, contentType: string): Promise<TranscribeOutcome> {
  if (!apiKey()) return { status: "failed", reason: "no-api-key" }

  let bytes: Uint8Array
  let ct = contentType
  try {
    const got = await getObjectBytes(s3Key)
    bytes = got.bytes
    if (!ct) ct = got.contentType
  } catch (e: any) {
    console.warn("[transcribe] fetch bytes failed (non-fatal):", e?.message || e)
    return { status: "failed", reason: "fetch-bytes-failed" }
  }

  return transcribeAudioBytes(bytes, ct)
}

// KLA-505: transcribe RAW audio bytes already in memory (no S3 round-trip). This is the shared STT core —
// transcribeRecording fetches from S3 then calls here, and the live-dictation route (POST /api/voice/
// transcribe) hands the reporter's just-recorded MediaRecorder blob straight in. Same resilience contract:
// NEVER throws, and returns the #471 discriminated outcome ('skipped' over-cap → no POST; 'failed' on
// missing key / non-2xx / timeout / empty; 'done' with a parsed transcript). `contentType` is the blob's
// MIME (e.g. audio/webm, video/mp4) — mapped to the endpoint's format hint. `language` defaults to en.
export async function transcribeAudioBytes(
  bytes: Uint8Array,
  contentType: string,
  opts: { language?: string } = {},
): Promise<TranscribeOutcome> {
  const key = apiKey()
  if (!key) return { status: "failed", reason: "no-api-key" }

  // Payload cap FIRST — before any encode/allocation. An over-cap clip is intentionally not sent.
  if (bytes.byteLength > TRANSCRIBE_MAX_BYTES) {
    const mb = (bytes.byteLength / (1024 * 1024)).toFixed(1)
    const capMb = (TRANSCRIBE_MAX_BYTES / (1024 * 1024)).toFixed(0)
    console.warn(`[transcribe] audio ${mb}MB exceeds ${capMb}MB cap — skipping STT (no POST)`)
    return { status: "skipped", reason: `Audio too large to transcribe (${mb}MB > ${capMb}MB limit).` }
  }

  const ct = contentType
  const language = opts.language || "en"
  const format = audioFormatFor(ct)
  const { mime, ext } = fileMetaFor(ct)

  // Wall-clock timeout so a hung upstream degrades to 'failed' rather than hanging the fire-and-forget.
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), TRANSCRIBE_TIMEOUT_MS)
  try {
    // Multipart form: the file part streams the raw audio bytes (no base64/JSON doubling).
    const form = new FormData()
    // Copy into a fresh ArrayBuffer-backed Blob (Uint8Array over a shared/oversized buffer is fine here).
    form.append("file", new Blob([bytes], { type: mime }), `recording.${ext}`)
    form.append("model", TRANSCRIBE_MODEL)
    form.append("language", language)
    // Ask for timestamped segments; models that don't support it fall back to plain `text`, which
    // parseTranscribeResponse still handles (segments simply come back null).
    form.append("response_format", "verbose_json")
    // Some backends read the container hint from a `format` field; harmless when ignored.
    form.append("format", format)

    const resp = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        // NOTE: do NOT set Content-Type — fetch sets the multipart boundary automatically.
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": "https://klavity.in",
        "X-Title": "Klavity",
      },
      body: form,
      signal: ac.signal,
    })
    if (!resp.ok) {
      const detail = (await resp.text().catch(() => "?")).slice(0, 200)
      // 413 (payload too large) and every other non-2xx degrade to 'failed' — the report stays intact.
      console.warn(`[transcribe] OpenRouter ${resp.status}: ${detail}`)
      return { status: "failed", reason: resp.status === 413 ? "payload-too-large" : `http-${resp.status}` }
    }
    const data: any = await resp.json()
    const parsed = parseTranscribeResponse(data)
    if (!parsed) return { status: "failed", reason: "empty-or-unparseable" }
    return { status: "done", result: parsed }
  } catch (e: any) {
    const aborted = e?.name === "AbortError"
    console.warn("[transcribe] failed (non-fatal):", aborted ? "timeout" : (e?.message || e))
    return { status: "failed", reason: aborted ? "timeout" : "network-error" }
  } finally {
    clearTimeout(timer)
  }
}

// Orchestrate transcription for every recording on one feedback row. Called fire-and-forget from the
// ingest post-insert path (mirrors draftTitleForFeedback). Per clip: mark status, transcribe, store the
// result in-place by id, and log the call to ai_calls. Best-effort throughout — a single clip's failure
// never affects the others or the submission.
export async function transcribeFeedbackRecordings(opts: {
  feedbackId: string
  projectId: string
  recordings: Array<{ id: string; key: string; contentType?: string }>
}): Promise<void> {
  const { feedbackId, projectId, recordings } = opts
  if (!Array.isArray(recordings) || !recordings.length) return

  const configured = transcribeConfigured()
  for (const rec of recordings) {
    if (!rec || !rec.id || !rec.key) continue
    const rid = String(rec.id)

    // No STT key configured → mark 'none' so the UI shows "unavailable", not a stuck spinner.
    if (!configured) {
      await setRecordingTranscript(feedbackId, projectId, rid, "none").catch(() => {})
      continue
    }

    let outcome: TranscribeOutcome
    try {
      outcome = await transcribeRecording(String(rec.key), String(rec.contentType || ""))
    } catch (e: any) {
      console.warn("[transcribe] recording failed (non-fatal):", e?.message || e)
      outcome = { status: "failed", reason: "unexpected-error" }
    }

    if (outcome.status === "done") {
      await setRecordingTranscript(feedbackId, projectId, rid, "done", {
        text: outcome.result.text,
        segments: outcome.result.segments,
      }, null).catch(() => {})
    } else if (outcome.status === "skipped") {
      // PX4 #471: intentionally not transcribed (too large) — record the reason, no transcript, no spend.
      await setRecordingTranscript(feedbackId, projectId, rid, "skipped", null, outcome.reason).catch(() => {})
    } else {
      await setRecordingTranscript(feedbackId, projectId, rid, "failed", undefined, outcome.reason).catch(() => {})
    }

    // Cost ledger. ai_calls has no seconds column; cost/model/type/ok are what the schema carries.
    // A skipped clip made NO upstream call → do not log a ledger row for it.
    if (outcome.status !== "skipped") {
      await recordAiCall({
        type: "transcribe",
        model: TRANSCRIBE_MODEL,
        projectId,
        feature: "transcribe",
        costUsd: outcome.status === "done" ? (outcome.result.usage.cost ?? null) : null,
        ok: outcome.status === "done",
      }).catch(() => null)
    }
  }
}

// KLAVITYKLA-480: extend Phase-2 transcription to ANY uploaded video attachment (not just in-widget
// "Record me" clips). The #425 file-upload path stores non-image uploads (incl. videos) in
// attachments_json; a spoken note inside such a video should be transcribed too so AI/Sims can process it.
// This mirrors transcribeFeedbackRecordings but:
//   • iterates attachments and ONLY touches entries whose contentType is video/* (audio/pdf/etc untouched);
//   • keys the stored transcript by the attachment's stable S3 `key` (attachments carry no `id`);
//   • reuses the SAME transcribeRecording(key, contentType) multipart-STT path and #471 outcome handling
//     (20MB cap → 'skipped' with a reason and NO POST; 413/timeout/non-2xx → 'failed'; parsed → 'done').
// Fire-and-forget from ingest: a single attachment's failure never affects the others or the submission.
function isVideoAttachment(contentType?: string | null): boolean {
  return typeof contentType === "string" && /^video\//i.test(contentType.trim())
}

export async function transcribeFeedbackAttachments(opts: {
  feedbackId: string
  projectId: string
  attachments: Array<{ key: string; filename?: string; contentType?: string }>
}): Promise<void> {
  const { feedbackId, projectId, attachments } = opts
  if (!Array.isArray(attachments) || !attachments.length) return

  const configured = transcribeConfigured()
  for (const att of attachments) {
    // Only video uploads carry a spoken track worth transcribing — leave PDFs, logs, audio, images untouched.
    if (!att || !att.key || !isVideoAttachment(att.contentType)) continue
    const akey = String(att.key)

    // No STT key configured → mark 'none' so the UI shows "unavailable", not a stuck spinner.
    if (!configured) {
      await setFeedbackAttachmentTranscript(feedbackId, projectId, akey, "none").catch(() => {})
      continue
    }

    let outcome: TranscribeOutcome
    try {
      outcome = await transcribeRecording(akey, String(att.contentType || ""))
    } catch (e: any) {
      console.warn("[transcribe] attachment failed (non-fatal):", e?.message || e)
      outcome = { status: "failed", reason: "unexpected-error" }
    }

    if (outcome.status === "done") {
      await setFeedbackAttachmentTranscript(feedbackId, projectId, akey, "done", {
        text: outcome.result.text,
        segments: outcome.result.segments,
      }, null).catch(() => {})
    } else if (outcome.status === "skipped") {
      // #471: intentionally not transcribed (too large) — record the reason, no transcript, no spend.
      await setFeedbackAttachmentTranscript(feedbackId, projectId, akey, "skipped", null, outcome.reason).catch(() => {})
    } else {
      await setFeedbackAttachmentTranscript(feedbackId, projectId, akey, "failed", undefined, outcome.reason).catch(() => {})
    }

    // Cost ledger — mirror the recordings path. A skipped (over-cap) upload made NO upstream call → no row.
    if (outcome.status !== "skipped") {
      await recordAiCall({
        type: "transcribe",
        model: TRANSCRIBE_MODEL,
        projectId,
        feature: "transcribe",
        costUsd: outcome.status === "done" ? (outcome.result.usage.cost ?? null) : null,
        ok: outcome.status === "done",
      }).catch(() => null)
    }
  }
}
