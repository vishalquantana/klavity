// KLA-836 — two sibling players play the SAME MediaRecorder webm/mp4 clips as the dashboard ticket detail
// (KLA-832) but were missing its Infinity-duration seek repair + loading/error/download fallback:
//   (1) the AutoSim walk player (public/autosims-walk.html), and
//   (2) the composer/widget hero video preview (packages/core/src/modal.ts, shared by SDK widget + extension).
//
// MediaRecorder clips carry no container duration → video.duration === Infinity, so the native seek bar
// starts ~95% and drifts backward and timestamps are wrong. The canonical repair (shipped in dashboard.html
// wireRecordingVideos): on loadedmetadata, if duration isn't finite, seek to 1e101 to force the browser to
// compute the real duration, then reset currentTime to 0 on durationchange.
//
// These assertions are negative controls: each FAILS against the pre-fix source. Neither file has a build
// step in this suite, so (per the sibling dashboard-*.test.ts files) their DOM/JS contract is asserted from
// source.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const walk = readFileSync(join(import.meta.dir, "public", "autosims-walk.html"), "utf8")
const modal = readFileSync(join(import.meta.dir, "..", "packages", "core", "src", "modal.ts"), "utf8")

// ── (1) AutoSim walk player ────────────────────────────────────────────────────────────────────────────
test("autosims-walk wireRecVideoRepair applies the force-seek-then-reset Infinity repair", () => {
  const start = walk.indexOf("function wireRecVideoRepair(")
  expect(start).toBeGreaterThan(-1)
  const fn = walk.slice(start, start + 1600)
  expect(fn).toContain("!isFinite(v.duration)")
  expect(fn).toContain("v.currentTime=1e101")
  expect(fn).toContain('v.addEventListener("durationchange"')
  expect(fn).toContain("v.currentTime=0")
  expect(fn).toContain('v.addEventListener("loadedmetadata"')
})

test("autosims-walk wires the repair + loading/error/download fallback onto the run recording", () => {
  expect(walk).toContain("wireRecVideoRepair(_recVideo")
  expect(walk).toContain('class="rec-loading')
  expect(walk).toContain('class="rec-error')
  expect(walk).toContain('class="rec-dl"')
  expect(walk).toContain("download=")
  // error wiring reveals the error line + hides the spinner on a failed decode
  const start = walk.indexOf("function wireRecVideoRepair(")
  const fn = walk.slice(start, start + 1600)
  expect(fn).toContain('v.addEventListener("error"')
  expect(fn).toContain("rec-failed")
})

test("autosims-walk step seeks survive a missing/zero durationMs (fall back to computed duration)", () => {
  // The latent bug: durMs = m.durationMs || 0 → if omitted every step seeks to 0 and shows 0:00.
  // Steps carry a proportional fraction; the click handler prefers the video's real computed duration,
  // and onDuration backfills the 0:00 timestamps once the browser computes the true duration.
  expect(walk).toContain('data-frac="')
  expect(walk).toContain("_recVideo.duration>0)?_recVideo.duration:(durMs/1000)")
  expect(walk).toContain("onDuration:function(dsec)")
  expect(walk).toContain("ts.textContent=fmtTs(dms*frac)")
})

// ── (2) Composer/widget hero video preview (SDK widget + extension) ──────────────────────────────────────
test("modal.ts mountHeroVideoSrc wires the Infinity-duration repair", () => {
  const start = modal.indexOf("function wireHeroVideoRepair(")
  expect(start).toBeGreaterThan(-1)
  const fn = modal.slice(start, start + 1400)
  expect(fn).toContain("!isFinite(video.duration)")
  expect(fn).toContain("video.currentTime = 1e101")
  expect(fn).toContain("'durationchange'")
  expect(fn).toContain("video.currentTime = 0")
  expect(fn).toContain("'loadedmetadata'")
  // the hero mount actually calls the repair
  expect(modal).toContain("wireHeroVideoRepair(video, err)")
})

test("modal.ts hero video has an error + download fallback", () => {
  const start = modal.indexOf("function mountHeroVideoSrc(")
  const fn = modal.slice(start, start + 1800)
  expect(fn).toContain("kl-hero-verror")
  expect(fn).toContain("Download recording")
  expect(fn).toContain("'download'")
})
