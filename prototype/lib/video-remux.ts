// KD-163 follow-up: MediaRecorder's WebM has no Cues (seek index) — recorder.ts's withFixedWebmDuration
// (SDK-side) patches only the Duration header, which is enough for in-browser <video> (which mostly
// tolerates a Cues-less file by scanning) but NOT for standalone players after download: confirmed by
// pulling a real stored recording and reading its EBML bytes directly — Duration was correct, Cues was
// completely absent, and that's exactly what "plays but stops early / can't seek to the end" looks like
// outside a browser.
//
// Fixing that for real means building a seek index, not just patching a header field — that's a proper
// remux, which needs ffmpeg. Runs once, server-side, at upload time (not client-side: no ffmpeg.wasm
// weight added to the SDK bundle, and it only has to happen once per recording rather than in every
// reporter's browser).
import { spawn } from "bun"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { unlinkSync } from "node:fs"

const REMUX_TIMEOUT_MS = Number(process.env.KLAV_REMUX_TIMEOUT_MS) || 20_000
// Normally just "ffmpeg" (resolved via PATH — true on the deploy server after `apt install ffmpeg`).
// Override only for a local dev machine where PATH hasn't picked up a fresh install yet.
const FFMPEG_BIN = process.env.KLAV_FFMPEG_PATH || "ffmpeg"

/**
 * Remux a WebM recording so it carries a proper Cues (seek) index — `-c copy` re-packages the existing
 * encoded audio/video streams into a fresh container with an index; it does NOT re-encode, so this is
 * fast and lossless. Best-effort: ffmpeg missing, a malformed input, or a timeout all fall back to the
 * ORIGINAL bytes untouched — a remux failure must never lose or block a recording upload.
 */
export async function remuxWebmForSeeking(bytes: Uint8Array): Promise<Uint8Array> {
  const dir = tmpdir()
  const id = randomUUID()
  const inPath = join(dir, `klav-remux-in-${id}.webm`)
  const outPath = join(dir, `klav-remux-out-${id}.webm`)
  try {
    await Bun.write(inPath, bytes)
    const proc = spawn({
      cmd: [FFMPEG_BIN, "-y", "-i", inPath, "-c", "copy", outPath],
      stdout: "ignore",
      stderr: "ignore",
    })
    const timedOut = await Promise.race([
      proc.exited.then(() => false),
      new Promise<boolean>((res) => setTimeout(() => res(true), REMUX_TIMEOUT_MS)),
    ])
    if (timedOut) { try { proc.kill() } catch { /* best-effort */ } return bytes }
    if (proc.exitCode !== 0) return bytes
    const out = await Bun.file(outPath).bytes()
    return out.length > 0 ? out : bytes
  } catch {
    // ffmpeg not installed, spawn unsupported in this runtime, disk I/O failure, etc. — never lose the
    // recording over a remux we couldn't perform.
    return bytes
  } finally {
    try { unlinkSync(inPath) } catch { /* best-effort */ }
    try { unlinkSync(outPath) } catch { /* best-effort */ }
  }
}
