// transcribe.deepgram-smoke.test.ts (voice-502 fix — REAL Deepgram call)
// Guarded smoke test: only runs when DEEPGRAM_API_KEY is present in the environment (it lives in the
// gitignored .env locally + must be added to prod /etc/klav/klav.env). Skipped in CI where the key is
// absent. Sends a small REAL spoken audio sample through the actual Deepgram prerecorded API and asserts
// a non-empty transcript comes back — proving the drop-in works end-to-end (the fix for the prod 502).
import { test, expect } from "bun:test"

const HAS_KEY = !!process.env.DEEPGRAM_API_KEY
// Deepgram's public demo clip (spoken speech). If the fetch fails (offline CI), the test bails cleanly.
const SAMPLE_URL = process.env.KLAV_DG_SAMPLE_URL || "https://dpgr.am/spacewalk.wav"

test.if(HAS_KEY)("REAL Deepgram: a spoken clip returns a non-empty transcript (not a 502)", async () => {
  const { transcribeAudioBytes } = await import("./transcribe")

  let bytes: Uint8Array
  let ct = "audio/wav"
  try {
    const r = await fetch(SAMPLE_URL)
    if (!r.ok) { console.warn(`[dg-smoke] sample fetch ${r.status} — skipping assertion`); return }
    ct = r.headers.get("content-type") || ct
    bytes = new Uint8Array(await r.arrayBuffer())
  } catch (e: any) {
    console.warn("[dg-smoke] sample fetch failed (offline?) — skipping:", e?.message || e)
    return
  }

  const outcome = await transcribeAudioBytes(bytes, ct)
  // The whole point: a real call must NOT throw and must produce text (the old backend 502'd instead).
  expect(outcome.status).toBe("done")
  if (outcome.status === "done") {
    expect(outcome.result.text.length).toBeGreaterThan(0)
    console.log(`[dg-smoke] transcript: ${JSON.stringify(outcome.result.text).slice(0, 160)}`)
  }
}, 30_000)

test.if(!HAS_KEY)("DEEPGRAM_API_KEY absent → real smoke skipped (placeholder so the file is not empty)", () => {
  expect(true).toBe(true)
})
