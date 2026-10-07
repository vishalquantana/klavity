// Session-replay intake for POST /api/feedback. The widget/SDK/extension send the rolling rrweb buffer either as
//   • `replay_events_gz` — a gzip-compressed file part (latency: the JSON is ~10–20% of its size on the wire), or
//   • `replay_events`    — the plain JSON array string (older clients, or when the browser had no CompressionStream).
// Both feed the same parse + cap path. A garbage / oversized / decompression-bomb payload NEVER fails the bug report: it is
// simply ignored (no replay stored), exactly like a malformed plain field always was.
import { gunzipSync } from "node:zlib"

/** Raw (uncompressed) JSON cap — a coarse pre-parse guard; the durable size cap (oldest-first trim) lives in saveFeedbackReplay. */
export const REPLAY_RAW_CAP = 6 * 1024 * 1024

/** True when the request carries replay evidence in either form (used so a replay-only report can still be submitted). */
export function replayEvidencePresent(form: FormData): boolean {
  const gz = form.get("replay_events_gz")
  if (gz instanceof File && gz.size > 0) return true
  const raw = String(form.get("replay_events") || "")
  return raw.length > 2 && raw !== "[]" && raw !== "null"
}

/**
 * The replay events of this request, or null. Order: a valid gzip part wins; if it is absent or unreadable the plain field is
 * used. The inflated size is bounded by `cap` (zlib `maxOutputLength`) so a tiny gzip that expands to gigabytes cannot exhaust
 * memory — it throws, is swallowed, and the report persists without a replay.
 */
export async function readReplayEvents(form: FormData, cap: number = REPLAY_RAW_CAP): Promise<unknown[] | null> {
  let text = ""
  const gz = form.get("replay_events_gz")
  if (gz instanceof File && gz.size > 0 && gz.size <= cap) {
    try { text = gunzipSync(Buffer.from(await gz.arrayBuffer()), { maxOutputLength: cap }).toString("utf8") } catch { text = "" }
  }
  if (!text) text = String(form.get("replay_events") || "")
  if (!text || text.length > cap) return null
  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) && parsed.length ? parsed : null
  } catch { return null }
}
