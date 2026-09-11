// KLA-832 — ticket detail view (reported by Raghu dogfooding klavity.in):
//  (1) video recording attachments wouldn't play / had no download fallback,
//  (2) the seek bar started near the end and drifted backward (MediaRecorder webm Infinity-duration bug),
//  (3) no honest loading/error state — an infinite spinner,
//  (4) the Description wasn't rendered inside a bordered box, and
//  (5) the detail body lacked the standard white-card outline.
//
// dashboard.html has no build step, so (per the sibling dashboard-*.test.ts files) its DOM/JS contract is
// asserted from source. These assertions are negative controls: each one FAILS against the pre-fix source.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

// ── (2) the seek-bar / won't-play root cause: MediaRecorder webm reports duration:Infinity ──────────────
test("wireRecordingVideos repairs the Infinity-duration seek bug (force-seek then reset)", () => {
  const start = html.indexOf("function wireRecordingVideos(")
  expect(start).toBeGreaterThan(-1)
  const fn = html.slice(start, start + 1600)
  // The fix hinges on detecting a non-finite duration…
  expect(fn).toContain("!isFinite(v.duration)")
  // …forcing the browser to scan to the real end (the canonical 1e101 seek)…
  expect(fn).toContain("v.currentTime = 1e101")
  // …then snapping the playhead back to the start on the resulting durationchange.
  expect(fn).toContain('v.addEventListener("durationchange"')
  expect(fn).toContain("v.currentTime = 0")
  // It binds to the real metadata event (not a guess) so there is no metadata-not-loaded race.
  expect(fn).toContain('v.addEventListener("loadedmetadata"')
})

test("wireRecordingVideos is actually wired into the ticket detail renderer", () => {
  expect(html).toContain("wireRecordingVideos(detailEl)")
})

// ── (1)+(3) inline player + download fallback + loading/error states ────────────────────────────────────
test("each recording renders a Download fallback link to its clip", () => {
  const start = html.indexOf("function buildRecordingsHtml(")
  const fn = html.slice(start, start + 2200)
  expect(fn).toContain('class="tkt-rec-dl"')
  expect(fn).toContain("download=")          // the anchor carries a download attribute
  expect(fn).toContain("Download recording")
})

test("the recording player surfaces a loading state and an error fallback (never an infinite spinner)", () => {
  const start = html.indexOf("function buildRecordingsHtml(")
  const fn = html.slice(start, start + 2200)
  expect(fn).toContain('class="tkt-rec-loading"')
  expect(fn).toContain('class="tkt-rec-error hide"')
  // …and the wiring reveals the error + hides the spinner on a failed decode.
  const w = html.indexOf("function wireRecordingVideos(")
  const wfn = html.slice(w, w + 1600)
  expect(wfn).toContain('v.addEventListener("error"')
  expect(wfn).toContain("tkt-rec-failed")
  expect(wfn).toContain("hideLoading")
})

// ── (4)+(5) Description renders inside a bordered white card ─────────────────────────────────────────────
test("the Description is a bordered white card (white-cards-on-beige standard)", () => {
  // A dedicated .tkt-desc rule exists with a visible border + white surface + padding.
  const m = html.match(/\.tkt-desc\{[^}]*\}/)
  expect(m).not.toBeNull()
  const rule = m![0]
  expect(rule).toContain("border:1px solid var(--line)")
  expect(rule).toContain("background:var(--ink-2)")
  expect(rule).toMatch(/padding:/)
  expect(rule).toMatch(/border-radius:/)
})
