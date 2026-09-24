// KD-163 follow-up: SDK-side withFixedWebmDuration patches only the Duration header (confirmed correct
// on a real stored recording — see the commit description), but MediaRecorder's WebM has no Cues (seek
// index), which is what makes a downloaded clip play but stop early / fail to seek to the end in a
// standalone player. remuxWebmForSeeking runs ffmpeg `-c copy` once at upload time to build a real index.
import { describe, it, expect } from "bun:test"
import { spawn } from "bun"
import { remuxWebmForSeeking } from "./video-remux"

// Real 2.6s clip recorded by headless Chromium's MediaRecorder (vp8, 96x64) — same fixture used by the
// SDK's withFixedWebmDuration test. Has a patched Duration but (like every MediaRecorder WebM) no Cues.
const FIXTURE_B64 = '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'
const fixtureBytes = () => Uint8Array.from(atob(FIXTURE_B64), (c) => c.charCodeAt(0))

async function ffmpegAvailable(): Promise<boolean> {
  try {
    const bin = process.env.KLAV_FFMPEG_PATH || "ffmpeg"
    const proc = spawn({ cmd: [bin, "-version"], stdout: "ignore", stderr: "ignore" })
    return (await proc.exited) === 0
  } catch { return false }
}
const HAS_FFMPEG = await ffmpegAvailable()

function hasCues(bytes: Uint8Array): boolean {
  for (let i = 0; i < bytes.length - 4; i++) {
    if (bytes[i] === 0x1c && bytes[i + 1] === 0x53 && bytes[i + 2] === 0xbb && bytes[i + 3] === 0x6b) return true
  }
  return false
}
function findDurationMs(bytes: Uint8Array): number | null {
  for (let i = 0; i < bytes.length - 11; i++) {
    if (bytes[i] === 0x44 && bytes[i + 1] === 0x89 && bytes[i + 2] === 0x88) {
      return new DataView(bytes.buffer, bytes.byteOffset + i + 3, 8).getFloat64(0, false)
    }
  }
  return null
}

describe("remuxWebmForSeeking", () => {
  it("never throws and never returns empty bytes, even on garbage input (covers a missing/failing ffmpeg)", async () => {
    const garbage = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const out = await remuxWebmForSeeking(garbage)
    expect(out.length).toBeGreaterThan(0)
    // Falls back to the ORIGINAL bytes untouched — never fabricates a different-length result on failure.
    expect(Array.from(out)).toEqual(Array.from(garbage))
  })

  it.skipIf(!HAS_FFMPEG)("adds a Cues (seek index) to a real MediaRecorder WebM that has none", async () => {
    const raw = fixtureBytes()
    expect(hasCues(raw)).toBe(false) // the fixture, like every MediaRecorder WebM, starts without one
    const out = await remuxWebmForSeeking(raw)
    expect(hasCues(out)).toBe(true)
    expect(out.length).toBeGreaterThan(0)
  })

  // The raw fixture (like every MediaRecorder WebM) has no Duration either — that's patched separately,
  // client-side, by the SDK's withFixedWebmDuration, BEFORE this ever runs (the real upload path always
  // remuxes an already-duration-patched blob). ffmpeg's own remux computes and writes a correct Duration
  // regardless, by reading through the actual stream — verify it lands close to the fixture's known real
  // length (~2.6s, per the SDK's own withFixedWebmDuration test using this same clip).
  it.skipIf(!HAS_FFMPEG)("the remuxed output carries a correct Duration even though the raw input has none", async () => {
    const raw = fixtureBytes()
    expect(findDurationMs(raw)).toBeNull()
    const out = await remuxWebmForSeeking(raw)
    const after = findDurationMs(out)
    expect(after).not.toBeNull()
    expect(after as number).toBeGreaterThan(2000)
    expect(after as number).toBeLessThan(3200)
  })
})
