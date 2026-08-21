// KLAVITYKLA-490 — AutoSim run RECORDING: persist the walk's CDP screencast as a compact,
// hosted artifact (webm full video + a small GIF teaser + a PNG thumbnail) keyed by run_id, and
// serve/play it on the Klavity report + attach the teaser to the connector comment on export.
//
// Capture reuses the SAME CDP screencast stream the live-watch feature already drives (no second
// heavy capture). Frames are throttled + capped so the artifact stays cheap on every AutoSim walk:
//   • min interval between kept frames  (KLAV_AUTOSIM_RECORD_FPS, default 4fps)
//   • hard frame-count cap              (KLAV_AUTOSIM_RECORD_MAX_FRAMES, default 600)
//   • downscale is inherited from the screencast's maxWidth/maxHeight (1024×768).
//
// Assembly (ffmpeg) and persistence (S3 + a walk_artifacts manifest row) are split behind injectable
// seams so the assembly + S3-persist paths are unit-testable WITHOUT a real ffmpeg binary or S3.
//
// DEFAULT-ON for AutoSim/Trail walks; opt-out with KLAV_AUTOSIM_RECORD=0. All I/O is best-effort:
// a capture/encode/upload failure logs a warning and NEVER changes a walk verdict.

import { db } from "./db"
import { uploadRecordingObject, s3Configured } from "./s3"
import { recordS3Storage } from "./cost-events"

// ── Config (env-tunable; conservative defaults) ─────────────────────────────────
function numEnv(v: string | undefined, dflt: number): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : dflt
}

/** Recording is DEFAULT-ON for AutoSim walks; KLAV_AUTOSIM_RECORD=0 opts out. */
export function recordingEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.KLAV_AUTOSIM_RECORD !== "0"
}

/**
 * Whether to actually CAPTURE + persist a recording for this walk: the feature must be enabled AND S3
 * must be configured (no point spending screencast/ffmpeg cost when there's nowhere to store it — this
 * also cleanly disables the overhead in tests/dev without object storage). The runner still honours an
 * explicit opts.record override on top of this.
 */
export function shouldRecordWalk(env: Record<string, string | undefined> = process.env): boolean {
  return recordingEnabled(env) && s3Configured()
}

const FFMPEG_BIN = () => process.env.KLAV_FFMPEG_PATH || "ffmpeg"
const CAPTURE_FPS = () => numEnv(process.env.KLAV_AUTOSIM_RECORD_FPS, 4)          // frames/sec kept
const MAX_FRAMES = () => numEnv(process.env.KLAV_AUTOSIM_RECORD_MAX_FRAMES, 600)  // hard cap (~2.5min @4fps)
const WEBM_CRF = () => numEnv(process.env.KLAV_AUTOSIM_RECORD_CRF, 40)            // vp9 quality (higher=smaller)
const GIF_FPS = () => numEnv(process.env.KLAV_AUTOSIM_RECORD_GIF_FPS, 5)
const GIF_WIDTH = () => numEnv(process.env.KLAV_AUTOSIM_RECORD_GIF_WIDTH, 420)
const GIF_SECONDS = () => numEnv(process.env.KLAV_AUTOSIM_RECORD_GIF_SECONDS, 6)  // teaser length window
const THUMB_WIDTH = () => numEnv(process.env.KLAV_AUTOSIM_RECORD_THUMB_WIDTH, 480)
/** Attachment cap the teaser must fit under to ride along on the comment (Jira default 10MB; target ~2MB). */
export const GIF_TEASER_MAX_BYTES = () => numEnv(process.env.KLAV_AUTOSIM_RECORD_GIF_MAX_BYTES, 2 * 1024 * 1024)

// ── Types ───────────────────────────────────────────────────────────────────────
export type RecordingFrame = { bytes: Uint8Array; tMs: number }

export type RecordingArtifacts = {
  /** Full recording — VP9 webm (the PRIMARY hosted artifact behind the "Watch full recording" link). */
  webm: Uint8Array | null
  /** Short, downscaled, capped motion teaser — rides along on the connector comment when under cap. */
  gif: Uint8Array | null
  /** Static failure-moment/last-frame thumbnail (PNG) — the teaser fallback when the GIF is over cap. */
  png: Uint8Array | null
  /** Wall-clock duration of the captured window (ms). */
  durationMs: number
  frameCount: number
  /** Which full-recording format actually assembled: "webm" | "frames" (frames = encode infeasible). */
  format: "webm" | "frames"
}

export type RecordingManifest = {
  runId: string
  webmKey: string | null
  gifKey: string | null
  pngKey: string | null
  /** Content type of the primary (video) artifact. */
  contentType: string
  durationMs: number
  frameCount: number
  stepCount: number | null
  /** 1-based failed step number for the comment meta line ("failed at step 6"), or null. */
  failedStep: number | null
  format: "webm" | "frames"
  createdAt: number
}

// ── Frame recorder — throttled/capped accumulator fed by the screencast onFrame callback ─────────
export class RunRecorder {
  private frames: RecordingFrame[] = []
  private startMs: number | null = null
  private lastKeptMs = -Infinity
  private stopped = false
  private readonly minIntervalMs: number
  private readonly maxFrames: number

  constructor(opts?: { fps?: number; maxFrames?: number }) {
    const fps = opts?.fps ?? CAPTURE_FPS()
    this.minIntervalMs = Math.max(1, Math.floor(1000 / fps))
    this.maxFrames = opts?.maxFrames ?? MAX_FRAMES()
  }

  /** Feed a screencast frame (a `data:image/jpeg;base64,...` URL). Throttled + capped; never throws. */
  addFrame(dataUrl: string, now = Date.now()): void {
    if (this.stopped) return
    try {
      if (this.startMs == null) this.startMs = now
      if (now - this.lastKeptMs < this.minIntervalMs) return
      const bytes = decodeDataUrl(dataUrl)
      if (!bytes || bytes.byteLength === 0) return
      this.frames.push({ bytes, tMs: now - this.startMs })
      this.lastKeptMs = now
      if (this.frames.length >= this.maxFrames) this.stopped = true // stop accepting once capped
    } catch {
      /* best-effort: a decode blip never affects the walk */
    }
  }

  get frameCount(): number { return this.frames.length }

  /** Wall-clock span of the captured frames (ms). */
  get durationMs(): number {
    if (this.frames.length < 2) return 0
    return this.frames[this.frames.length - 1].tMs - this.frames[0].tMs
  }

  getFrames(): RecordingFrame[] { return this.frames }
}

/** Decode a `data:...;base64,<b64>` URL to bytes. Returns null when the shape is unexpected. */
export function decodeDataUrl(dataUrl: string): Uint8Array | null {
  const comma = dataUrl.indexOf(",")
  if (comma < 0) return null
  const b64 = dataUrl.slice(comma + 1)
  try {
    return new Uint8Array(Buffer.from(b64, "base64"))
  } catch {
    return null
  }
}

// ── ffmpeg seam ─────────────────────────────────────────────────────────────────
/** Run ffmpeg with args, piping `stdin` in and returning stdout bytes. Injectable for hermetic tests. */
export type FfmpegRunner = (args: string[], stdin: Uint8Array) => Promise<{ code: number; stdout: Uint8Array; stderr: string }>

/** Default runner: spawn the ffmpeg binary via Bun. */
export const defaultFfmpeg: FfmpegRunner = async (args, stdin) => {
  const proc = Bun.spawn([FFMPEG_BIN(), ...args], { stdin: "pipe", stdout: "pipe", stderr: "pipe" })
  proc.stdin.write(stdin)
  await proc.stdin.end()
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).arrayBuffer(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  return { code, stdout: new Uint8Array(stdout), stderr }
}

/** Concatenate JPEG frame bytes into one buffer for ffmpeg's image2pipe/mjpeg demuxer. */
function concatFrames(frames: RecordingFrame[]): Uint8Array {
  let total = 0
  for (const f of frames) total += f.bytes.byteLength
  const out = new Uint8Array(total)
  let off = 0
  for (const f of frames) { out.set(f.bytes, off); off += f.bytes.byteLength }
  return out
}

// ── Assembly ─────────────────────────────────────────────────────────────────────
/**
 * Assemble the recording artifacts from captured frames. All three encodes are best-effort and
 * independent: a webm failure falls the full recording back to `format:"frames"` (bytes null) so the
 * caller can still ship the frame set behind the hosted player; a gif/png failure just omits that
 * artifact. Never throws.
 */
export async function assembleRecording(
  frames: RecordingFrame[],
  durationMs: number,
  ffmpeg: FfmpegRunner = defaultFfmpeg,
): Promise<RecordingArtifacts> {
  const out: RecordingArtifacts = {
    webm: null, gif: null, png: null,
    durationMs, frameCount: frames.length, format: "frames",
  }
  if (!frames.length) return out
  const all = concatFrames(frames)

  // 1) Full recording — VP9 webm from the JPEG stream at the capture fps.
  try {
    const fps = String(CAPTURE_FPS())
    const r = await ffmpeg([
      "-hide_banner", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", fps, "-i", "pipe:0",
      "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2",
      "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(WEBM_CRF()),
      "-pix_fmt", "yuv420p", "-an", "-f", "webm", "pipe:1",
    ], all)
    if (r.code === 0 && r.stdout.byteLength > 0) { out.webm = r.stdout; out.format = "webm" }
    else console.warn("[trails-recording] webm encode failed (code", r.code + "):", r.stderr.slice(0, 300))
  } catch (e) {
    console.warn("[trails-recording] webm encode threw (continuing):", String(e))
  }

  // 2) GIF teaser — downscaled, capped fps, first GIF_SECONDS window (from the leading frames).
  try {
    const gifFps = GIF_FPS()
    const window = frames.filter((f) => f.tMs <= GIF_SECONDS() * 1000)
    const teaserFrames = window.length >= 2 ? window : frames.slice(0, Math.max(2, Math.ceil(gifFps * GIF_SECONDS())))
    const r = await ffmpeg([
      "-hide_banner", "-loglevel", "error",
      "-f", "image2pipe", "-framerate", String(CAPTURE_FPS()), "-i", "pipe:0",
      "-vf", `fps=${gifFps},scale=${GIF_WIDTH()}:-1:flags=lanczos`,
      "-loop", "0", "-f", "gif", "pipe:1",
    ], concatFrames(teaserFrames))
    if (r.code === 0 && r.stdout.byteLength > 0) out.gif = r.stdout
    else console.warn("[trails-recording] gif encode failed (code", r.code + "):", r.stderr.slice(0, 300))
  } catch (e) {
    console.warn("[trails-recording] gif encode threw (continuing):", String(e))
  }

  // 3) PNG thumbnail — the LAST frame (failure moment), downscaled. Teaser fallback when GIF is over cap.
  try {
    const last = frames[frames.length - 1]
    const r = await ffmpeg([
      "-hide_banner", "-loglevel", "error",
      "-f", "image2pipe", "-i", "pipe:0",
      "-frames:v", "1", "-vf", `scale=${THUMB_WIDTH()}:-1`,
      "-f", "image2", "-c:v", "png", "pipe:1",
    ], last.bytes)
    if (r.code === 0 && r.stdout.byteLength > 0) out.png = r.stdout
  } catch (e) {
    console.warn("[trails-recording] png thumbnail threw (continuing):", String(e))
  }

  return out
}

// ── Persistence ───────────────────────────────────────────────────────────────────
export type RecordingPersistDeps = {
  uploadObject: (bytes: Uint8Array, contentType: string, ext: string) => Promise<{ key: string }>
  saveManifest: (m: RecordingManifest) => Promise<void>
  recordStorage: (bytes: number) => void
}

const realPersistDeps: RecordingPersistDeps = {
  uploadObject: async (bytes, contentType, ext) => {
    const up = await uploadRecordingObject(bytes, contentType, ext)
    return { key: up.key }
  },
  saveManifest: saveRecordingManifest,
  recordStorage: (bytes) => { void recordS3Storage({ bytes, meta: { kind: "autosim_recording" } }) },
}

/**
 * Upload the assembled artifacts to S3 and persist a manifest row keyed by run_id. Uploads only the
 * artifacts that assembled (webm/gif/png may each be null). Best-effort: returns the manifest that was
 * saved, or null if there was nothing to persist / a save failed. Never throws.
 */
export async function persistRecording(
  ctx: { projectId: string; runId: string; stepCount: number | null; failedStep: number | null },
  artifacts: RecordingArtifacts,
  deps: RecordingPersistDeps = realPersistDeps,
): Promise<RecordingManifest | null> {
  try {
    if (!artifacts.webm && !artifacts.gif && !artifacts.png) return null
    let webmKey: string | null = null
    let gifKey: string | null = null
    let pngKey: string | null = null
    let stored = 0
    if (artifacts.webm) {
      webmKey = (await deps.uploadObject(artifacts.webm, "video/webm", "webm")).key
      stored += artifacts.webm.byteLength
    }
    if (artifacts.gif) {
      gifKey = (await deps.uploadObject(artifacts.gif, "image/gif", "gif")).key
      stored += artifacts.gif.byteLength
    }
    if (artifacts.png) {
      pngKey = (await deps.uploadObject(artifacts.png, "image/png", "png")).key
      stored += artifacts.png.byteLength
    }
    const manifest: RecordingManifest = {
      runId: ctx.runId,
      webmKey, gifKey, pngKey,
      contentType: "video/webm",
      durationMs: artifacts.durationMs,
      frameCount: artifacts.frameCount,
      stepCount: ctx.stepCount,
      failedStep: ctx.failedStep,
      format: artifacts.format,
      createdAt: Date.now(),
    }
    await deps.saveManifest({ ...manifest, projectId: ctx.projectId } as any)
    if (stored > 0) deps.recordStorage(stored)
    return manifest
  } catch (e) {
    console.warn("[trails-recording] persist failed (non-fatal):", String(e))
    return null
  }
}

/** Assemble + persist in one shot with real deps — the runner's entry point. Never throws. */
export async function captureAndPersistRecording(
  ctx: { projectId: string; runId: string; stepCount: number | null; failedStep: number | null },
  recorder: RunRecorder,
): Promise<RecordingManifest | null> {
  try {
    if (recorder.frameCount === 0) return null
    const artifacts = await assembleRecording(recorder.getFrames(), recorder.durationMs)
    return await persistRecording(ctx, artifacts, realPersistDeps)
  } catch (e) {
    console.warn("[trails-recording] captureAndPersist failed (non-fatal):", String(e))
    return null
  }
}

// ── Manifest storage (walk_artifacts kind='recording'; the manifest JSON is stored, video lives in S3) ──
/** Persist the recording manifest (S3 keys + meta) as a walk_artifacts row keyed by run_id. */
export async function saveRecordingManifest(m: RecordingManifest & { projectId?: string }): Promise<void> {
  const projectId = (m as any).projectId as string
  const json = JSON.stringify(stripProjectId(m))
  const gz = Buffer.from(Bun.gzipSync(Buffer.from(json))).toString("base64")
  await db!.execute({
    sql: `INSERT INTO walk_artifacts (id, project_id, trail_id, run_id, kind, artifact_gz, byte_size, created_at)
          VALUES (?,?,?,?,?,?,?,?)`,
    args: [
      "wa_" + crypto.randomUUID(),
      projectId,
      null,
      m.runId,
      "recording",
      gz,
      json.length,
      Date.now(),
    ],
  })
}

function stripProjectId(m: RecordingManifest & { projectId?: string }): RecordingManifest {
  const { projectId: _drop, ...rest } = m as any
  return rest
}

/** Read back the latest recording manifest for a run, or null when none exists. */
export async function getRecordingManifest(projectId: string, runId: string): Promise<RecordingManifest | null> {
  const r = await db!.execute({
    sql: `SELECT artifact_gz FROM walk_artifacts WHERE project_id=? AND run_id=? AND kind='recording'
          ORDER BY created_at DESC LIMIT 1`,
    args: [projectId, runId],
  })
  if (!r.rows.length) return null
  try {
    const json = Buffer.from(Bun.gunzipSync(Buffer.from(String((r.rows[0] as any).artifact_gz), "base64"))).toString("utf8")
    return JSON.parse(json) as RecordingManifest
  } catch (e) {
    console.warn("[trails-recording] manifest decode failed:", String(e))
    return null
  }
}
