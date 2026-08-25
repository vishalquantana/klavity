// KLA-603: unit tests for server-side keyframe extraction. The ffmpeg spawn is INJECTED so these run with
// or without a real ffmpeg on the box. Covers: (1) ffmpeg-missing → [] (documented graceful degradation);
// (2) a bounded number of frames produced, one ffmpeg invocation per timestamp; (3) a per-frame failure is
// skipped, not fatal; (4) empty input short-circuits. A separate live test exercises the REAL ffmpeg when
// present, so the actual binary integration is covered on the box that has it.
import { test, expect } from "bun:test"
import { extractKeyframes, ffmpegAvailable, __resetFfmpegProbe } from "./keyframes"
import { writeFile, mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

// A fake Bun.spawn. `mode` controls behavior; it writes the expected output JPEG when asked to "succeed".
function fakeSpawn(mode: "ok" | "fail" | "noffmpeg" | "partial", calls: string[][] = []) {
  return ((args: string[]) => {
    calls.push(args)
    const isProbe = args.includes("-version")
    if (mode === "noffmpeg") {
      // Simulate ffmpeg not on PATH: the -version probe exits non-zero (and a real spawn might throw).
      return { exited: Promise.resolve(1), kill() {} } as any
    }
    if (isProbe) return { exited: Promise.resolve(0), kill() {} } as any
    // A frame-grab invocation: the output path is the last arg.
    const outPath = args[args.length - 1]
    const idx = calls.filter(c => !c.includes("-version") && c !== args).length // frame index among grabs
    let fail = mode === "fail"
    if (mode === "partial") fail = idx % 2 === 1 // fail every other frame
    if (fail) return { exited: Promise.resolve(1), kill() {} } as any
    // Write a tiny non-empty JPEG stand-in so readFile() returns bytes.
    return {
      exited: (async () => { await writeFile(outPath, new Uint8Array([0xff, 0xd8, 0xff, 0xd9])); return 0 })(),
      kill() {},
    } as any
  }) as any
}

test("ffmpegAvailable: false when the -version probe fails", async () => {
  __resetFfmpegProbe()
  const ok = await ffmpegAvailable(fakeSpawn("noffmpeg"))
  expect(ok).toBe(false)
})

test("extractKeyframes: ffmpeg missing → [] (documented graceful degradation, never throws)", async () => {
  __resetFfmpegProbe()
  const frames = await extractKeyframes(new Uint8Array([1, 2, 3, 4]), "video/mp4", [1000, 2000], { spawn: fakeSpawn("noffmpeg") })
  expect(frames).toEqual([])
})

test("extractKeyframes: bounded frames, one ffmpeg grab per timestamp", async () => {
  __resetFfmpegProbe()
  const calls: string[][] = []
  const frames = await extractKeyframes(new Uint8Array([1, 2, 3, 4]), "video/mp4", [500, 1500, 2500], { spawn: fakeSpawn("ok", calls) })
  expect(frames.length).toBe(3)
  for (const f of frames) {
    expect(f.contentType).toBe("image/jpeg")
    expect(f.bytes.byteLength).toBeGreaterThan(0)
  }
  expect(frames.map(f => f.atMs)).toEqual([500, 1500, 2500])
  // One grab invocation per timestamp (plus the -version probe).
  const grabs = calls.filter(c => !c.includes("-version"))
  expect(grabs.length).toBe(3)
  // Each grab downscales (scale filter) and takes a single frame.
  for (const g of grabs) {
    expect(g.join(" ")).toContain("-frames:v")
    expect(g.join(" ")).toContain("scale=")
  }
})

test("extractKeyframes: a per-frame failure is skipped, not fatal", async () => {
  __resetFfmpegProbe()
  const frames = await extractKeyframes(new Uint8Array([1, 2, 3, 4]), "video/webm", [1000, 2000, 3000, 4000], { spawn: fakeSpawn("partial") })
  // "partial" fails every other frame → some frames still come back, and it never throws.
  expect(frames.length).toBeGreaterThan(0)
  expect(frames.length).toBeLessThan(4)
})

test("extractKeyframes: empty input / no timestamps short-circuits to []", async () => {
  __resetFfmpegProbe()
  expect(await extractKeyframes(new Uint8Array([]), "video/mp4", [1000], { spawn: fakeSpawn("ok") })).toEqual([])
  expect(await extractKeyframes(new Uint8Array([1, 2]), "video/mp4", [], { spawn: fakeSpawn("ok") })).toEqual([])
})

// Live integration: only runs where the REAL ffmpeg binary is present. Generates a tiny synthetic clip
// with ffmpeg itself, then extracts 2 real JPEG stills from it — proving the actual binary wiring works.
test("extractKeyframes: REAL ffmpeg produces JPEG stills from a synthetic clip", async () => {
  __resetFfmpegProbe()
  const hasFfmpeg = await ffmpegAvailable()
  if (!hasFfmpeg) { console.warn("[keyframes.test] ffmpeg not on PATH — skipping live extraction test"); return }
  __resetFfmpegProbe()
  // Build a 2-second 320x240 test-pattern mp4 via ffmpeg's lavfi source.
  const dir = await mkdtemp(join(tmpdir(), "klav-kf-live-"))
  const clip = join(dir, "clip.mp4")
  const gen = Bun.spawn(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "testsrc=size=320x240:rate=10:duration=2", "-pix_fmt", "yuv420p", clip], { stdout: "pipe", stderr: "pipe" })
  const code = await gen.exited
  expect(code).toBe(0)
  const bytes = new Uint8Array(await Bun.file(clip).arrayBuffer())
  const frames = await extractKeyframes(bytes, "video/mp4", [400, 1200], { maxWidth: 160 })
  expect(frames.length).toBe(2)
  for (const f of frames) {
    // JPEG magic bytes.
    expect(f.bytes[0]).toBe(0xff)
    expect(f.bytes[1]).toBe(0xd8)
    expect(f.bytes.byteLength).toBeGreaterThan(100)
  }
})
