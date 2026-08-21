// KLAVITYKLA-490 — hermetic unit tests for the AutoSim run-recording pipeline.
//
// Covers: RunRecorder throttle/cap, assembleRecording with an INJECTED ffmpeg (no real binary),
// the webm-encode-fails → format:"frames" fallback, persistRecording with a FAKE uploader
// (no S3) asserting per-artifact upload + manifest keys + cost ledger, and the "nothing to
// persist" no-op. Comment formatting + the export-gate live in comment-sync/findings-gate tests.

import { test, expect } from "bun:test"
import {
  RunRecorder,
  decodeDataUrl,
  assembleRecording,
  persistRecording,
  recordingEnabled,
  type FfmpegRunner,
  type RecordingArtifacts,
  type RecordingManifest,
} from "./trails-recording"

function jpegDataUrl(marker: string): string {
  return "data:image/jpeg;base64," + Buffer.from("JPEG-" + marker).toString("base64")
}

// ── RunRecorder ─────────────────────────────────────────────────────────────────
test("RunRecorder throttles frames to the min interval (default 4fps → 250ms)", () => {
  const rec = new RunRecorder({ fps: 4, maxFrames: 100 })
  rec.addFrame(jpegDataUrl("a"), 1000)     // kept (first)
  rec.addFrame(jpegDataUrl("b"), 1100)     // dropped (<250ms)
  rec.addFrame(jpegDataUrl("c"), 1300)     // kept (>=250ms)
  rec.addFrame(jpegDataUrl("d"), 1400)     // dropped
  rec.addFrame(jpegDataUrl("e"), 1600)     // kept
  expect(rec.frameCount).toBe(3)
  // durationMs = span between first and last KEPT frame (relative timestamps)
  expect(rec.durationMs).toBe(600)
})

test("RunRecorder enforces the hard frame cap and then stops accepting", () => {
  const rec = new RunRecorder({ fps: 1000, maxFrames: 3 }) // fps high → no throttle
  for (let i = 0; i < 10; i++) rec.addFrame(jpegDataUrl("f" + i), 1000 + i)
  expect(rec.frameCount).toBe(3)
})

test("RunRecorder ignores malformed / empty frames without throwing", () => {
  const rec = new RunRecorder({ fps: 1000, maxFrames: 100 })
  rec.addFrame("not-a-data-url", 1000)
  rec.addFrame("data:image/jpeg;base64,", 1001) // empty payload
  expect(rec.frameCount).toBe(0)
})

test("decodeDataUrl returns bytes for a valid data URL and null otherwise", () => {
  expect(decodeDataUrl(jpegDataUrl("z"))!.byteLength).toBeGreaterThan(0)
  expect(decodeDataUrl("garbage")).toBeNull()
})

test("recordingEnabled: default-on, opt-out via KLAV_AUTOSIM_RECORD=0", () => {
  expect(recordingEnabled({})).toBe(true)
  expect(recordingEnabled({ KLAV_AUTOSIM_RECORD: "1" })).toBe(true)
  expect(recordingEnabled({ KLAV_AUTOSIM_RECORD: "0" })).toBe(false)
})

// ── assembleRecording (injected ffmpeg) ──────────────────────────────────────────
function fakeFfmpeg(overrides?: { webmCode?: number }): { run: FfmpegRunner; calls: string[][] } {
  const calls: string[][] = []
  const run: FfmpegRunner = async (args) => {
    calls.push(args)
    const joined = args.join(" ")
    if (joined.includes("webm")) {
      return { code: overrides?.webmCode ?? 0, stdout: new Uint8Array([1, 2, 3, 4]), stderr: "" }
    }
    if (joined.includes("gif")) return { code: 0, stdout: new Uint8Array([5, 6, 7]), stderr: "" }
    if (joined.includes("png")) return { code: 0, stdout: new Uint8Array([8, 9]), stderr: "" }
    return { code: 1, stdout: new Uint8Array(), stderr: "unexpected" }
  }
  return { run, calls }
}

function frames(n: number) {
  return Array.from({ length: n }, (_, i) => ({ bytes: new Uint8Array([i]), tMs: i * 250 }))
}

test("assembleRecording produces webm + gif + png from frames (format=webm)", async () => {
  const ff = fakeFfmpeg()
  const out = await assembleRecording(frames(8), 1750, ff.run)
  expect(out.format).toBe("webm")
  expect(out.webm).toEqual(new Uint8Array([1, 2, 3, 4]))
  expect(out.gif).toEqual(new Uint8Array([5, 6, 7]))
  expect(out.png).toEqual(new Uint8Array([8, 9]))
  expect(out.frameCount).toBe(8)
  expect(out.durationMs).toBe(1750)
  // three encodes attempted
  expect(ff.calls.length).toBe(3)
})

test("assembleRecording falls back to format=frames when webm encode fails (gif/png still attempted)", async () => {
  const ff = fakeFfmpeg({ webmCode: 1 })
  const out = await assembleRecording(frames(6), 1250, ff.run)
  expect(out.format).toBe("frames")
  expect(out.webm).toBeNull()
  // gif + png are independent best-effort and still produced
  expect(out.gif).toEqual(new Uint8Array([5, 6, 7]))
  expect(out.png).toEqual(new Uint8Array([8, 9]))
})

test("assembleRecording with no frames returns an empty frames-format artifact (no ffmpeg calls)", async () => {
  const ff = fakeFfmpeg()
  const out = await assembleRecording([], 0, ff.run)
  expect(out.webm).toBeNull()
  expect(out.gif).toBeNull()
  expect(out.png).toBeNull()
  expect(ff.calls.length).toBe(0)
})

// ── persistRecording (fake uploader + fake manifest save) ─────────────────────────
function fakePersistDeps() {
  const uploads: Array<{ contentType: string; ext: string; bytes: number }> = []
  const saved: RecordingManifest[] = []
  const storage: number[] = []
  return {
    uploads, saved, storage,
    deps: {
      uploadObject: async (bytes: Uint8Array, contentType: string, ext: string) => {
        uploads.push({ contentType, ext, bytes: bytes.byteLength })
        return { key: `key/${ext}` }
      },
      saveManifest: async (m: RecordingManifest) => { saved.push(m) },
      recordStorage: (bytes: number) => { storage.push(bytes) },
    },
  }
}

test("persistRecording uploads each artifact, saves a manifest with keys + meta, ledgers storage", async () => {
  const f = fakePersistDeps()
  const artifacts: RecordingArtifacts = {
    webm: new Uint8Array([1, 2, 3, 4]),
    gif: new Uint8Array([5, 6, 7]),
    png: new Uint8Array([8, 9]),
    durationMs: 24000, frameCount: 96, format: "webm",
  }
  const m = await persistRecording(
    { projectId: "proj_1", runId: "run_a1f9", stepCount: 7, failedStep: 6 },
    artifacts,
    f.deps,
  )
  expect(m).not.toBeNull()
  expect(f.uploads.map((u) => u.ext).sort()).toEqual(["gif", "png", "webm"])
  expect(m!.webmKey).toBe("key/webm")
  expect(m!.gifKey).toBe("key/gif")
  expect(m!.pngKey).toBe("key/png")
  expect(m!.durationMs).toBe(24000)
  expect(m!.stepCount).toBe(7)
  expect(m!.failedStep).toBe(6)
  expect(m!.contentType).toBe("video/webm")
  expect(f.saved).toHaveLength(1)
  // total bytes = 4 + 3 + 2 ledgered once
  expect(f.storage).toEqual([9])
})

test("persistRecording persists webm-only when gif/png absent", async () => {
  const f = fakePersistDeps()
  const m = await persistRecording(
    { projectId: "p", runId: "r", stepCount: 3, failedStep: null },
    { webm: new Uint8Array([1, 2]), gif: null, png: null, durationMs: 5000, frameCount: 20, format: "webm" },
    f.deps,
  )
  expect(m!.webmKey).toBe("key/webm")
  expect(m!.gifKey).toBeNull()
  expect(m!.pngKey).toBeNull()
  expect(f.uploads).toHaveLength(1)
})

test("persistRecording is a no-op when there are no artifacts", async () => {
  const f = fakePersistDeps()
  const m = await persistRecording(
    { projectId: "p", runId: "r", stepCount: null, failedStep: null },
    { webm: null, gif: null, png: null, durationMs: 0, frameCount: 0, format: "frames" },
    f.deps,
  )
  expect(m).toBeNull()
  expect(f.uploads).toHaveLength(0)
  expect(f.saved).toHaveLength(0)
})
