// KLA-603 (part 3): server-side KEY FRAME extraction from an uploaded/recorded walkthrough video so a dev
// skims a handful of representative annotated stills instead of watching the whole clip.
//
// Approach: shell out to `ffmpeg` (already on the box — used elsewhere in the stack for AutoSim run
// recording). We seek to a bounded set of timestamps (chosen by video-enrich.pickKeyframeTimestampsMs —
// transcript-flagged moments when narration exists, else evenly-spaced) and grab ONE downscaled JPEG per
// timestamp. Everything is bounded: frame count is capped by the caller, each still is scaled to a max
// width and JPEG-compressed, and the whole pass runs against a temp copy of the bytes that is always
// cleaned up.
//
// DEPENDENCY: this needs the `ffmpeg` binary at runtime. When it is not on PATH, ffmpegAvailable() returns
// false and extractKeyframes() resolves to [] (the report is simply left without stills — never an error).
// The wiring, interface and timestamp selection are fully exercised by unit tests regardless of ffmpeg.

import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

// Max width for an extracted still (downscaled for size; height auto to preserve aspect). Overridable.
const KEYFRAME_MAX_WIDTH = Number(process.env.KLAV_KEYFRAME_WIDTH || 1280)
// Per-frame ffmpeg wall-clock ceiling so a wedged decode can't hang the best-effort pass.
const FRAME_TIMEOUT_MS = Number(process.env.KLAV_KEYFRAME_TIMEOUT_MS || 20_000)
// Overridable binary path (ops override without a code change; matches the transcribe.ts env-override style).
const FFMPEG_BIN = process.env.KLAV_FFMPEG_BIN || "ffmpeg"

export type ExtractedFrame = { bytes: Uint8Array; atMs: number; contentType: string }

let _ffmpegAvailable: boolean | null = null
// Detect the ffmpeg binary ONCE (cached). Never throws. Injectable spawn for tests.
export async function ffmpegAvailable(spawn: typeof Bun.spawn = Bun.spawn): Promise<boolean> {
  if (_ffmpegAvailable !== null) return _ffmpegAvailable
  try {
    const proc = spawn([FFMPEG_BIN, "-version"], { stdout: "pipe", stderr: "pipe" })
    const code = await proc.exited
    _ffmpegAvailable = code === 0
  } catch {
    _ffmpegAvailable = false
  }
  return _ffmpegAvailable
}

// Reset the cached probe (tests only).
export function __resetFfmpegProbe() { _ffmpegAvailable = null }

// Extract one downscaled JPEG at each timestamp. Best-effort per frame: a single failed grab is skipped,
// not fatal. Returns [] (never throws) when ffmpeg is unavailable, the input is empty, or every grab fails.
// `spawn` is injectable so tests can drive it without a real ffmpeg.
export async function extractKeyframes(
  bytes: Uint8Array,
  contentType: string,
  timestampsMs: number[],
  opts: { maxWidth?: number; spawn?: typeof Bun.spawn } = {},
): Promise<ExtractedFrame[]> {
  const spawn = opts.spawn || Bun.spawn
  if (!bytes || !bytes.byteLength) return []
  if (!Array.isArray(timestampsMs) || !timestampsMs.length) return []
  if (!(await ffmpegAvailable(spawn))) {
    console.warn("[keyframes] ffmpeg not available — skipping key-frame extraction (dependency missing)")
    return []
  }
  const maxWidth = opts.maxWidth || KEYFRAME_MAX_WIDTH
  const ext = /mp4/i.test(contentType || "") ? "mp4" : "webm"

  let dir: string
  try {
    dir = await mkdtemp(join(tmpdir(), "klav-kf-"))
  } catch (e: any) {
    console.warn("[keyframes] tempdir failed (non-fatal):", e?.message || e)
    return []
  }
  const inPath = join(dir, `in.${ext}`)
  const frames: ExtractedFrame[] = []
  try {
    await writeFile(inPath, bytes)
    for (let i = 0; i < timestampsMs.length; i++) {
      const atMs = Math.max(0, Math.round(timestampsMs[i]))
      const outPath = join(dir, `frame-${i}.jpg`)
      const ss = (atMs / 1000).toFixed(3)
      // -ss BEFORE -i = fast input seek; -frames:v 1 = a single still; scale caps width (‑2 keeps aspect,
      // even height); -q:v 4 = good JPEG quality at a modest size. -y overwrites; -loglevel error is quiet.
      const args = [
        FFMPEG_BIN, "-y", "-loglevel", "error", "-ss", ss, "-i", inPath,
        "-frames:v", "1", "-vf", `scale='min(${maxWidth},iw)':-2`, "-q:v", "4", outPath,
      ]
      try {
        const proc = spawn(args, { stdout: "pipe", stderr: "pipe" })
        const timer = setTimeout(() => { try { proc.kill() } catch { /* already gone */ } }, FRAME_TIMEOUT_MS)
        const code = await proc.exited
        clearTimeout(timer)
        if (code !== 0) { console.warn(`[keyframes] ffmpeg exit ${code} at ${ss}s (skipped)`); continue }
        const frameBytes = new Uint8Array(await readFile(outPath))
        if (frameBytes.byteLength > 0) frames.push({ bytes: frameBytes, atMs, contentType: "image/jpeg" })
      } catch (e: any) {
        console.warn(`[keyframes] grab at ${ss}s failed (non-fatal):`, e?.message || e)
      }
    }
  } catch (e: any) {
    console.warn("[keyframes] extraction failed (non-fatal):", e?.message || e)
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {})
  }
  return frames
}
