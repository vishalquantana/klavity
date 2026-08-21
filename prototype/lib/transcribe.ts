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
import { setRecordingTranscript, recordAiCall } from "./db"

// Swappable model constant. Default: Nvidia's Nemotron streaming ASR (verified live on OpenRouter,
// cheap + multilingual). Alternatives worth a swap if quality/timestamps disappoint:
//   openai/whisper-1, openai/whisper-large-v3-turbo, qwen/qwen3-asr-flash-2026-02-10
// Overridable at deploy via KLAV_TRANSCRIBE_MODEL without a code change.
export const TRANSCRIBE_MODEL =
  process.env.KLAV_TRANSCRIBE_MODEL || "nvidia/nemotron-3.5-asr-streaming-multilingual-0.6b"

const ENDPOINT = "https://openrouter.ai/api/v1/audio/transcriptions"

export type TranscriptSegment = { start: number; end: number; text: string }
export type TranscriptJson = { text: string; segments: TranscriptSegment[] | null }
export type TranscriptResult = TranscriptJson & { usage: { seconds: number | null; cost: number | null } }

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

// Transcribe ONE recording by its S3 key. Resilient: returns null (never throws) on missing key,
// unfetchable bytes, non-2xx, or an unparseable body — the caller marks the recording `failed`.
export async function transcribeRecording(s3Key: string, contentType: string): Promise<TranscriptResult | null> {
  const key = apiKey()
  if (!key) return null

  let bytes: Uint8Array
  let ct = contentType
  try {
    const got = await getObjectBytes(s3Key)
    bytes = got.bytes
    if (!ct) ct = got.contentType
  } catch (e: any) {
    console.warn("[transcribe] fetch bytes failed (non-fatal):", e?.message || e)
    return null
  }

  // RAW base64 (NOT a data: URI) — the endpoint wants the bare audio bytes.
  const b64 = Buffer.from(bytes).toString("base64")
  const format = audioFormatFor(ct)

  try {
    const resp = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": "https://klavity.in",
        "X-Title": "Klavity",
      },
      body: JSON.stringify({
        model: TRANSCRIBE_MODEL,
        input_audio: { data: b64, format },
        language: "en",
        // Ask for timestamped segments; models that don't support it fall back to plain `text`, which
        // parseTranscribeResponse still handles (segments simply come back null).
        response_format: "verbose_json",
      }),
    })
    if (!resp.ok) {
      console.warn(`[transcribe] OpenRouter ${resp.status}: ${(await resp.text().catch(() => "?")).slice(0, 200)}`)
      return null
    }
    const data: any = await resp.json()
    return parseTranscribeResponse(data)
  } catch (e: any) {
    console.warn("[transcribe] failed (non-fatal):", e?.message || e)
    return null
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

    let result: TranscriptResult | null = null
    try {
      result = await transcribeRecording(String(rec.key), String(rec.contentType || ""))
    } catch (e: any) {
      console.warn("[transcribe] recording failed (non-fatal):", e?.message || e)
      result = null
    }

    if (result) {
      await setRecordingTranscript(feedbackId, projectId, rid, "done", {
        text: result.text,
        segments: result.segments,
      }).catch(() => {})
    } else {
      await setRecordingTranscript(feedbackId, projectId, rid, "failed").catch(() => {})
    }

    // Cost ledger. ai_calls has no seconds column; cost/model/type/ok are what the schema carries.
    await recordAiCall({
      type: "transcribe",
      model: TRANSCRIBE_MODEL,
      projectId,
      feature: "transcribe",
      costUsd: result?.usage?.cost ?? null,
      ok: !!result,
    }).catch(() => null)
  }
}
