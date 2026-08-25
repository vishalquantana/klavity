// KLA-603: turn an uploaded/recorded video's (already-generated, async) transcript into LEVERAGE.
//
// This is the pure, DB-free / network-free core of the POST-SUBMIT video enrichment pass. The composer's
// Enhance button runs BEFORE submit, but video transcription completes AFTER submit (async, transcribe.ts),
// so enrichment is a server-side pass that runs when a video's transcript becomes available — NOT the
// pre-submit composer button. This module holds the grounded, side-effect-free helpers; the orchestrator
// (server.ts enrichReportFromTranscript) owns the LLM call, S3, ffmpeg and DB writes.
//
// Three jobs (all best-effort, all additive — a reporter's own text is NEVER overwritten):
//   1. gather the timestamped transcript(s) from a report's video attachments/recordings;
//   2. build the collapsible <details> transcript block that goes into the external tracker body;
//   3. pick bounded key-frame timestamps for the ffmpeg still-extraction pass (transcript-flagged moments
//      when segments exist, else evenly-spaced).
// It also decides WHEN the AI walkthrough-summary should run (only when the reporter's description is thin).

// A report's description is "thin" when the reporter typed little/nothing and leaned on the video to
// explain the bug — exactly the case where a transcript-grounded summary adds the most. We measure the
// reporter's OWN prose (observation), not the auto-title. Kept conservative: a genuine sentence or two
// (>= THIN_DESCRIPTION_MAX_CHARS) is treated as substantial and left entirely alone.
export const THIN_DESCRIPTION_MAX_CHARS = 60

export function isThinDescription(text: unknown): boolean {
  const s = typeof text === "string" ? text.trim() : ""
  return s.length < THIN_DESCRIPTION_MAX_CHARS
}

// Bounds for keyframe extraction — keep the pass cheap and the report skimmable, never a slideshow.
export const MAX_KEYFRAMES = Number(process.env.KLAV_KEYFRAMES_MAX || 6)
// Cap the LLM input we build from the transcript (a long walkthrough shouldn't blow the prompt/cost).
export const TRANSCRIPT_INPUT_MAX_CHARS = 6000
// Cap the transcript text we inline into the tracker body <details> block (keep the ticket readable).
export const TRANSCRIPT_BODY_MAX_CHARS = 8000

export type TranscriptSeg = { start: number; end: number; text: string }
export type VideoTranscript = {
  source: "recording" | "attachment"
  ref: string           // recording id (recordings) or S3 key (attachments)
  name: string          // human label for the source clip
  key?: string          // S3 key (present for both; the byte source for ffmpeg)
  contentType?: string
  durationMs?: number
  text: string
  segments: TranscriptSeg[] | null
}

function coerceSegments(tj: any): TranscriptSeg[] | null {
  const raw = tj && Array.isArray(tj.segments) ? tj.segments : null
  if (!raw || !raw.length) return null
  const mapped = raw
    .map((s: any) => ({ start: Number(s?.start) || 0, end: Number(s?.end) || 0, text: String(s?.text ?? "").trim() }))
    .filter((s: TranscriptSeg) => s.text)
  return mapped.length ? mapped : null
}

// Collect every DONE video transcript on a report (uploaded attachments + "Record me" recordings), in a
// stable, source-tagged shape. Only status==='done' with real text is returned; pending/failed/skipped/none
// are ignored (nothing to leverage yet). Tolerant of missing/garbled fields — never throws.
export function collectVideoTranscripts(fb: any): VideoTranscript[] {
  const out: VideoTranscript[] = []
  const atts = Array.isArray(fb?.attachments) ? fb.attachments : []
  for (const a of atts) {
    if (!a || a.transcript_status !== "done") continue
    const tj = a.transcript_json
    const text = tj && typeof tj.text === "string" ? tj.text.trim() : ""
    const segments = coerceSegments(tj)
    if (!text && !segments) continue
    out.push({
      source: "attachment", ref: String(a.key || ""), key: a.key ? String(a.key) : undefined,
      name: String(a.filename || "video"), contentType: a.contentType ? String(a.contentType) : undefined,
      text: text || (segments ? segments.map(s => s.text).join(" ") : ""), segments,
    })
  }
  const recs = Array.isArray(fb?.recordings) ? fb.recordings : []
  for (const r of recs) {
    if (!r || r.transcript_status !== "done") continue
    const tj = r.transcript_json
    const text = tj && typeof tj.text === "string" ? tj.text.trim() : ""
    const segments = coerceSegments(tj)
    if (!text && !segments) continue
    out.push({
      source: "recording", ref: String(r.id || ""), key: r.key ? String(r.key) : undefined,
      name: `recording-${String(r.id || "clip")}`, contentType: r.contentType ? String(r.contentType) : undefined,
      durationMs: Number(r.durationMs) || undefined,
      text: text || (segments ? segments.map(s => s.text).join(" ") : ""), segments,
    })
  }
  return out
}

// Concatenate all done-transcript text into a single grounded blob for the LLM. Capped so a long
// walkthrough can't blow the prompt/cost budget. Returns "" when there's nothing transcribed.
export function gatherTranscriptText(transcripts: VideoTranscript[]): string {
  const joined = transcripts.map(t => t.text).filter(Boolean).join("\n\n").trim()
  return joined.length > TRANSCRIPT_INPUT_MAX_CHARS ? joined.slice(0, TRANSCRIPT_INPUT_MAX_CHARS) : joined
}

// mm:ss (or h:mm:ss) label for a seconds offset. Used both for the tracker transcript block and the
// keyframe filenames so a dev can line up a still with the moment in the transcript.
export function fmtTimestamp(seconds: number): string {
  const s = Math.max(0, Math.floor(Number(seconds) || 0))
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
  const two = (n: number) => String(n).padStart(2, "0")
  return h > 0 ? `${h}:${two(m)}:${two(sec)}` : `${m}:${two(sec)}`
}

// Render one transcript to timestamped lines ("[m:ss] text") when segments exist, else the plain text.
export function formatTimestampedTranscript(t: VideoTranscript): string {
  if (t.segments && t.segments.length) {
    return t.segments.map(s => `[${fmtTimestamp(s.start)}] ${s.text}`).join("\n")
  }
  return t.text
}

// KLA-603 (part 2): build the collapsible <details> transcript block for the external tracker body — the
// SAME markdown-<details> pattern inline-log-fallback uses for console/network logs, so a dev in Jira/GitHub
// sees the walkthrough transcript inline without opening Klavity. `redact` is the caller's URL-param
// redactor (redactSensitiveUrlsInText) — applied so a spoken/on-screen URL with ?token=… never leaks into
// the ticket. Returns null when there's no done transcript. Body is capped (TRANSCRIPT_BODY_MAX_CHARS).
export function buildTranscriptDetailsSection(
  transcripts: VideoTranscript[],
  redact: (s: string) => string = (s) => s,
): string | null {
  if (!transcripts.length) return null
  const blocks: string[] = []
  for (const t of transcripts) {
    let body = formatTimestampedTranscript(t)
    if (!body.trim()) continue
    body = redact(body)
    if (body.length > TRANSCRIPT_BODY_MAX_CHARS) body = body.slice(0, TRANSCRIPT_BODY_MAX_CHARS) + "\n… (truncated)"
    blocks.push(`### ${t.name}\n\n\`\`\`\n${body}\n\`\`\``)
  }
  if (!blocks.length) return null
  const inner = blocks.join("\n\n")
  return `<details>\n<summary>Video walkthrough transcript (AI-generated, timestamped)</summary>\n\n${inner}\n</details>`
}

// KLA-603 (part 3): choose up to `cap` key-frame timestamps (ms) to extract from a clip. When the transcript
// has narration segments we bias toward the START of evenly-spread segments (moments the narrator flags) so
// the stills track what the reporter was TALKING about; otherwise we fall back to evenly-spaced offsets
// across the clip duration. Always returns a bounded, ascending, de-duplicated list. Best-effort/pure.
export function pickKeyframeTimestampsMs(
  durationMs: number | undefined,
  segments: TranscriptSeg[] | null,
  cap: number = MAX_KEYFRAMES,
): number[] {
  const n = Math.max(1, Math.min(cap, MAX_KEYFRAMES))
  const picks: number[] = []
  if (segments && segments.length) {
    // Evenly sample segment indices so we spread across the whole walkthrough, not just its start.
    const step = segments.length / n
    for (let i = 0; i < n; i++) {
      const seg = segments[Math.min(segments.length - 1, Math.floor(i * step))]
      // Nudge a hair PAST the segment start so the frame shows the state the narrator is describing.
      picks.push(Math.max(0, Math.round((Number(seg.start) || 0) * 1000) + 250))
    }
  } else if (durationMs && durationMs > 0) {
    // Evenly-spaced interior frames (skip the very first/last black frames): (i+1)/(n+1) of the duration.
    for (let i = 0; i < n; i++) picks.push(Math.round((durationMs * (i + 1)) / (n + 1)))
  } else {
    // Unknown duration and no segments — a couple of fixed early offsets is the safest first cut.
    return [1000, 3000].slice(0, n)
  }
  // Ascending, de-duped (collapse near-identical picks within 500ms).
  const uniq: number[] = []
  for (const ms of picks.sort((a, b) => a - b)) {
    if (!uniq.length || ms - uniq[uniq.length - 1] >= 500) uniq.push(ms)
  }
  return uniq.slice(0, n)
}
