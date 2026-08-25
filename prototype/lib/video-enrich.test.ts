// KLA-603: unit tests for the pure video-transcript enrichment core (no DB / no network / no ffmpeg).
// Covers: (1) the thin-description gate that decides WHEN the AI walkthrough summary runs; (2) collecting
// DONE video transcripts from a report's attachments + recordings; (3) the collapsible, REDACTED,
// timestamped transcript <details> block that lands in the external tracker body; (4) bounded keyframe
// timestamp selection (transcript-flagged vs evenly-spaced).
import { test, expect } from "bun:test"
import {
  isThinDescription, THIN_DESCRIPTION_MAX_CHARS,
  collectVideoTranscripts, gatherTranscriptText,
  buildTranscriptDetailsSection, formatTimestampedTranscript, fmtTimestamp,
  pickKeyframeTimestampsMs, MAX_KEYFRAMES, TRANSCRIPT_BODY_MAX_CHARS,
} from "./video-enrich"
import { redactSensitiveUrlsInText } from "./feedback"

// ── (1) thin-description gate ──────────────────────────────────────────────────────────────────────
test("isThinDescription: empty / whitespace / short is thin; a real sentence is not", () => {
  expect(isThinDescription("")).toBe(true)
  expect(isThinDescription("   ")).toBe(true)
  expect(isThinDescription(null)).toBe(true)
  expect(isThinDescription(undefined)).toBe(true)
  expect(isThinDescription("broken")).toBe(true)
  expect(isThinDescription("see video")).toBe(true)
  // A substantial reporter description (>= threshold) is NOT thin → the AI summary must NOT run.
  const substantial = "The checkout page throws a 500 when I apply the SAVE10 coupon and then click pay."
  expect(substantial.length).toBeGreaterThanOrEqual(THIN_DESCRIPTION_MAX_CHARS)
  expect(isThinDescription(substantial)).toBe(false)
})

// ── (2) collect DONE transcripts from attachments + recordings ─────────────────────────────────────
test("collectVideoTranscripts: only DONE transcripts with text; ignores pending/failed/none", () => {
  const fb = {
    attachments: [
      { key: "k1", filename: "bug.mp4", contentType: "video/mp4", transcript_status: "done", transcript_json: { text: "the coupon does nothing", segments: [{ start: 1, end: 3, text: "the coupon does nothing" }] } },
      { key: "k2", filename: "doc.pdf", contentType: "application/pdf" }, // not a video, no transcript
      { key: "k3", filename: "later.mp4", contentType: "video/mp4", transcript_status: "pending" },
      { key: "k4", filename: "big.mp4", contentType: "video/mp4", transcript_status: "skipped", transcript_reason: "too large" },
    ],
    recordings: [
      { id: "rec_1", key: "r1", contentType: "video/webm", durationMs: 8000, transcript_status: "done", transcript_json: { text: "then the page went blank", segments: null } },
      { id: "rec_2", key: "r2", contentType: "video/webm", transcript_status: "failed" },
    ],
  }
  const got = collectVideoTranscripts(fb)
  expect(got.length).toBe(2)
  expect(got[0].source).toBe("attachment")
  expect(got[0].name).toBe("bug.mp4")
  expect(got[0].segments?.length).toBe(1)
  expect(got[1].source).toBe("recording")
  expect(got[1].durationMs).toBe(8000)
  // Combined LLM input concatenates both bodies.
  const joined = gatherTranscriptText(got)
  expect(joined).toContain("the coupon does nothing")
  expect(joined).toContain("then the page went blank")
})

test("collectVideoTranscripts: tolerant of empty / garbled input", () => {
  expect(collectVideoTranscripts(null).length).toBe(0)
  expect(collectVideoTranscripts({}).length).toBe(0)
  expect(collectVideoTranscripts({ attachments: "nope", recordings: 5 }).length).toBe(0)
})

// ── (3) tracker-body transcript <details> block (collapsible + timestamped + redacted) ─────────────
test("buildTranscriptDetailsSection: collapsible, timestamped, and REDACTS sensitive URL params", () => {
  const t = collectVideoTranscripts({
    attachments: [{
      key: "k1", filename: "walkthrough.mp4", contentType: "video/mp4", transcript_status: "done",
      transcript_json: {
        text: "",
        segments: [
          { start: 5, end: 8, text: "I open https://app.example.com/pay?token=SECRET123&x=1" },
          { start: 65, end: 70, text: "and it fails" },
        ],
      },
    }],
  })
  const redact = (s: string) => s.replace(/token=[^&\s]+/g, "token=REDACTED")
  const section = buildTranscriptDetailsSection(t, redact)!
  expect(section).toContain("<details>")
  expect(section).toContain("</details>")
  expect(section).toContain("<summary>Video walkthrough transcript")
  // Timestamped ([m:ss]) lines.
  expect(section).toContain("[0:05]")
  expect(section).toContain("[1:05]")
  // Redaction applied — the raw token must NOT survive into the ticket body.
  expect(section).not.toContain("SECRET123")
  expect(section).toContain("token=REDACTED")
})

test("buildTranscriptDetailsSection: null when there are no transcripts", () => {
  expect(buildTranscriptDetailsSection([], (s) => s)).toBeNull()
})

// KLA-603 (privacy): an over-long transcript is truncated to TRANSCRIPT_BODY_MAX_CHARS. The cut must land
// on a safe (whitespace) boundary and re-run redaction AFTER the cut, so a `?token=…` URL near the boundary
// can never be split so that a partial secret's tail escapes the redactor. Marker + bound are preserved.
test("buildTranscriptDetailsSection: truncates on a safe boundary + re-redacts so a secret near the cut can't leak", () => {
  // ~8000 chars of filler places a secret URL right at the truncation boundary.
  const filler = "word ".repeat(1600)  // 8000 chars, whitespace-delimited so a safe boundary exists
  const secretUrl = "https://app.example.com/pay?token=SUPERSECRETTOKENVALUE123456789&x=1"
  const text = filler + secretUrl + " and then it fails " + "more ".repeat(300)
  const t = collectVideoTranscripts({
    attachments: [{ key: "k1", filename: "w.mp4", contentType: "video/mp4", transcript_status: "done",
      transcript_json: { text, segments: null } }],
  })
  const section = buildTranscriptDetailsSection(t, redactSensitiveUrlsInText)!
  expect(section).toContain("… (truncated)")             // truncation marker present
  expect(section).not.toContain("SUPERSECRETTOKENVALUE123456789")  // the raw secret never survives the cut
  // Body is bounded: the fenced block content stays within the cap (+ marker/backoff slack).
  const inner = section.slice(section.indexOf("```") + 3, section.lastIndexOf("```"))
  expect(inner.length).toBeLessThanOrEqual(TRANSCRIPT_BODY_MAX_CHARS + 40)
})

test("formatTimestampedTranscript: falls back to plain text when no segments", () => {
  const out = formatTimestampedTranscript({ source: "recording", ref: "r1", name: "rec", text: "just words", segments: null })
  expect(out).toBe("just words")
})

test("fmtTimestamp: m:ss and h:mm:ss", () => {
  expect(fmtTimestamp(5)).toBe("0:05")
  expect(fmtTimestamp(65)).toBe("1:05")
  expect(fmtTimestamp(3661)).toBe("1:01:01")
})

// ── (4) bounded keyframe timestamp selection ───────────────────────────────────────────────────────
test("pickKeyframeTimestampsMs: transcript-flagged moments when segments exist, bounded + ascending", () => {
  const segments = Array.from({ length: 20 }, (_, i) => ({ start: i * 3, end: i * 3 + 2, text: `seg ${i}` }))
  const picks = pickKeyframeTimestampsMs(60000, segments, 4)
  expect(picks.length).toBeLessThanOrEqual(4)
  expect(picks.length).toBeLessThanOrEqual(MAX_KEYFRAMES)
  // Ascending.
  for (let i = 1; i < picks.length; i++) expect(picks[i]).toBeGreaterThan(picks[i - 1])
  // Spread across the clip (not all clustered at the start).
  expect(picks[picks.length - 1]).toBeGreaterThan(picks[0] + 5000)
})

test("pickKeyframeTimestampsMs: evenly-spaced interior frames when no segments", () => {
  const picks = pickKeyframeTimestampsMs(10000, null, 3)
  // (i+1)/(n+1) of 10s → 2.5s, 5s, 7.5s — interior, ascending, none at 0 or the very end.
  expect(picks.length).toBe(3)
  expect(picks[0]).toBeGreaterThan(0)
  expect(picks[picks.length - 1]).toBeLessThan(10000)
})

test("pickKeyframeTimestampsMs: safe fallback with unknown duration and no segments", () => {
  const picks = pickKeyframeTimestampsMs(undefined, null, 6)
  expect(picks.length).toBeGreaterThan(0)
  expect(picks.length).toBeLessThanOrEqual(2)
})

test("pickKeyframeTimestampsMs: never exceeds MAX_KEYFRAMES even when asked for more", () => {
  const picks = pickKeyframeTimestampsMs(600000, null, 999)
  expect(picks.length).toBeLessThanOrEqual(MAX_KEYFRAMES)
})
