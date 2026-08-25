// ── "Record me" recorder (KLAVITYKLA-438, Phase 1) ────────────────────────────────────────────────────
// From inside the Snap composer, record the reporter's SCREEN + optional CAMERA (picture-in-picture) +
// MIC narration, composite them onto a single <canvas>, and encode ONE webm/mp4 blob via MediaRecorder.
// Grounded in the #426 feasibility spike (docs/spikes/recording/record-poc.html) and reuses the same
// getDisplayMedia orchestration style the widget's Sharp capture already ships (capture.ts / widget.ts).
//
// This module is split into three seams so the risky/engine part is pure + unit-testable:
//   1. pickRecordingMime / recordingSupported — pure feature-detection helpers.
//   2. startRecording(opts, deps)             — the capture ENGINE. Every browser primitive it touches
//      (mediaDevices, MediaRecorder, MediaStream, canvas/video elements, timers) is injected via `deps`,
//      so tests drive start→chunk→stop, cap enforcement, and the screen-only fallback with mocks.
//   3. recordMe(opts)                          — a thin browser-only overlay UI (consent → recording →
//      preview → attach) that drives the engine and resolves a RecordingAttachment for the composer.
//
// Phase 2 (transcript) is intentionally NOT built here. The RecordingAttachment carries a stable `id`
// so a transcript produced later can be attached back to the exact recording (recordings_json row).

// ── Caps ──────────────────────────────────────────────────────────────────────────────────────────────
// Length cap: 3 min hard auto-stop (keeps blobs bounded + cheap to transcribe later). Size cap: ~50MB —
// mirrors the server's RECORDING_MAX_BYTES so a client-accepted recording also passes server intake.
export const RECORDING_MAX_DURATION_MS = 3 * 60 * 1000
export const RECORDING_MAX_BYTES = 50 * 1024 * 1024

export interface RecordingCaps {
  maxDurationMs: number
  maxBytes: number
}
export const DEFAULT_RECORDING_CAPS: RecordingCaps = {
  maxDurationMs: RECORDING_MAX_DURATION_MS,
  maxBytes: RECORDING_MAX_BYTES,
}

// vp9/opus webm is the Chrome/Edge/Firefox target; Safari 17+ emits mp4 (H.264/AAC). Feature-pick rather
// than hardcode so storage/serving accepts whichever container the running browser produced.
export const RECORDING_MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=h264,opus',
  'video/mp4;codecs=avc1,mp4a.40.2',
  'video/webm',
]

// ── RecordingAttachment: the composer/widget-facing result ─────────────────────────────────────────────
// `id` is the stable per-recording identity minted at capture time. It threads all the way to the server
// so Phase 2's transcript can reference the exact recording. `dataUrl` is the encoded blob for upload.
export interface RecordingAttachment {
  id: string
  dataUrl: string
  mime: string
  durationMs: number
  bytes: number
  width: number
  height: number
  screenOnly: boolean
}

export type RecorderState = 'idle' | 'recording' | 'paused' | 'stopped'

export interface RecordingResult {
  id: string
  blob: Blob
  mime: string
  durationMs: number
  bytes: number
  width: number
  height: number
  screenOnly: boolean
  hadCamera: boolean
  hadAudio: boolean
}

export interface StartRecordingOptions {
  wantCamera?: boolean
  wantMic?: boolean
  fps?: number
  caps?: Partial<RecordingCaps>
  onState?: (state: RecorderState) => void
  onStats?: (stats: { elapsedMs: number; bytes: number }) => void
  // Called once if getUserMedia (camera/mic) rejects — e.g. the customer site's Permissions-Policy blocks
  // camera/microphone for embedded tools. The recording continues SCREEN-ONLY; the UI surfaces the hint.
  onFallback?: (reason: string) => void
}

export interface RecordingController {
  pause(): void
  resume(): void
  stop(): void
  state(): RecorderState
  screenOnly(): boolean
  // KLA-602(b): the LIVE local camera stream (getUserMedia) when the recording actually includes the camera,
  // so the overlay can render a self-view bubble (Loom/Mevak style). null when screen-only / camera blocked.
  // This is the raw local preview stream — it is separate from the composited canvas that gets recorded.
  cameraStream(): any | null
  // Resolves when the recording fully stops (native "stop sharing", Stop button, or a cap auto-stop).
  done: Promise<RecordingResult>
}

// ── Injected browser dependencies (real globals by default; mocked in tests) ───────────────────────────
export interface RecorderDeps {
  mediaDevices: {
    getDisplayMedia: (constraints: any) => Promise<any>
    getUserMedia: (constraints: any) => Promise<any>
  }
  MediaRecorder: any
  MediaStream: any
  createElement: (tag: 'canvas' | 'video') => any
  now: () => number
  raf: (cb: (t: number) => void) => number
  caf: (id: number) => void
  setInterval: (cb: () => void, ms: number) => any
  clearInterval: (id: any) => void
}

export function defaultRecorderDeps(): RecorderDeps {
  const g: any = globalThis as any
  return {
    mediaDevices: (typeof navigator !== 'undefined' ? (navigator as any).mediaDevices : undefined) as any,
    MediaRecorder: g.MediaRecorder,
    MediaStream: g.MediaStream,
    createElement: (tag) => document.createElement(tag) as any,
    now: () => (typeof performance !== 'undefined' ? performance.now() : Date.now()),
    raf: (cb) => (typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame(cb) : (setTimeout(() => cb(Date.now()), 16) as unknown as number)),
    caf: (id) => { if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(id); else clearTimeout(id) },
    setInterval: (cb, ms) => setInterval(cb, ms),
    clearInterval: (id) => clearInterval(id),
  }
}

// ── Pure helpers ───────────────────────────────────────────────────────────────────────────────────────
// Return the first MediaRecorder mimeType this browser will actually emit, or null when MediaRecorder /
// no candidate codec is available. `isSupported` is injectable so the choice is unit-testable per browser.
export function pickRecordingMime(
  isSupported?: (m: string) => boolean,
  candidates: string[] = RECORDING_MIME_CANDIDATES,
): string | null {
  const test = isSupported ?? ((m: string) =>
    typeof MediaRecorder !== 'undefined' && !!MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m))
  for (const c of candidates) { if (test(c)) return c }
  return null
}

// Feature-detect: screen capture + MediaRecorder. Matches the Sharp-capture support envelope (no
// getDisplayMedia on iOS Safari → the "Record me" button is simply hidden there).
export function recordingSupported(deps: Partial<RecorderDeps> & { mediaDevices?: any } = defaultRecorderDeps()): boolean {
  const md = deps.mediaDevices
  const MR = (deps as any).MediaRecorder ?? (globalThis as any).MediaRecorder
  return !!md && typeof md.getDisplayMedia === 'function' && typeof MR !== 'undefined'
}

function newRecordingId(): string {
  const rnd = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
  return 'rec_' + rnd
}

// ── The capture engine ─────────────────────────────────────────────────────────────────────────────────
// getDisplayMedia FIRST (preserves the click's user gesture — same rule the Sharp path respects). Camera/
// mic are best-effort: a rejection (often a customer-site Permissions-Policy block) falls back to
// screen-only and fires onFallback. Composites screen full-frame + camera as a bottom-right PiP onto a
// canvas, then MediaRecorder(canvas.captureStream + micTrack). Enforces both the length + byte caps.
export async function startRecording(
  opts: StartRecordingOptions = {},
  deps: RecorderDeps = defaultRecorderDeps(),
): Promise<RecordingController> {
  const caps: RecordingCaps = { ...DEFAULT_RECORDING_CAPS, ...(opts.caps || {}) }
  const wantCamera = opts.wantCamera !== false
  const wantMic = opts.wantMic !== false
  const fps = Math.max(5, Math.min(60, opts.fps ?? 24))

  const mime = pickRecordingMime(
    deps.MediaRecorder?.isTypeSupported ? (m: string) => deps.MediaRecorder.isTypeSupported(m) : undefined,
  )
  if (!mime) throw new Error('recording-unsupported: no MediaRecorder codec available in this browser')

  const id = newRecordingId()
  const canvas = deps.createElement('canvas')
  const ctx = canvas.getContext ? canvas.getContext('2d') : null
  const screenVid = deps.createElement('video'); screenVid.muted = true; ;(screenVid as any).playsInline = true
  const camVid = deps.createElement('video'); camVid.muted = true; ;(camVid as any).playsInline = true

  let state: RecorderState = 'idle'
  const setState = (s: RecorderState) => { state = s; try { opts.onState?.(s) } catch { /* listener errors never break capture */ } }

  // 1) Screen — required. Throws (caller treats as cancel) if the user dismisses the picker.
  const screenStream = await deps.mediaDevices.getDisplayMedia({ video: { frameRate: fps }, audio: false, preferCurrentTab: false })

  // #474 (privacy): once ANY track is acquired, a throw during the REST of init (canvas.captureStream,
  // new MediaStream/MediaRecorder, recorder.start) must never leave live camera/mic/screen tracks running.
  // Hoist camStream + a stop-all helper here, then wrap the whole engine setup so any init throw stops
  // every acquired track before rethrowing — the caller sees the reject and the browser's recording
  // indicator clears instead of staying lit forever.
  let camStream: any = null
  const stopAllTracks = () => {
    for (const s of [screenStream, camStream]) { try { s?.getTracks?.().forEach((t: any) => t.stop?.()) } catch { /* no-op */ } }
  }
  try {
  const screenTrack = screenStream.getVideoTracks?.()[0]
  const st = (screenTrack?.getSettings?.() ?? {}) as { width?: number; height?: number }
  const aspect = (st.width && st.height) ? st.width / st.height : 16 / 9
  canvas.width = 1280
  canvas.height = Math.round(1280 / aspect)
  try { screenVid.srcObject = screenStream; await (screenVid.play?.() ?? Promise.resolve()) } catch { /* jsdom/headless: no real playback */ }

  // 2) Camera + mic — best-effort. A rejection → audio-only retry (mic kept) → screen-only fallback.
  let micTrack: any = null
  let hadCamera = false
  let screenOnly = true
  if (wantCamera || wantMic) {
    try {
      camStream = await deps.mediaDevices.getUserMedia({
        video: wantCamera ? { width: 640, height: 480, facingMode: 'user' } : false,
        audio: wantMic ? { echoCancellation: true, noiseSuppression: true } : false,
      })
      if (wantCamera && camStream.getVideoTracks?.().length) {
        hadCamera = true; screenOnly = false
        try { camVid.srcObject = camStream; await (camVid.play?.() ?? Promise.resolve()) } catch { /* no-op */ }
      }
      if (wantMic) { micTrack = camStream.getAudioTracks?.()[0] || null; if (micTrack) screenOnly = false }
    } catch (e: any) {
      // #477: a getUserMedia rejection is often the site's Permissions-Policy blocking the CAMERA while the
      // MICROPHONE is still allowed — the combined request rejects, discarding mic narration. Before giving up
      // to screen-only, RETRY audio-only (mic, no camera) so we keep the reporter's spoken narration.
      // Fallback ladder: full (cam+mic) -> audio-only (mic, no cam) -> screen-only (neither).
      let recovered = false
      if (wantMic && wantCamera) {
        try {
          camStream = await deps.mediaDevices.getUserMedia({ video: false, audio: { echoCancellation: true, noiseSuppression: true } })
          micTrack = camStream.getAudioTracks?.()[0] || null
          if (micTrack) { screenOnly = false; recovered = true; try { opts.onFallback?.('camera-blocked') } catch { /* no-op */ } }
        } catch { /* audio-only also blocked — fall through to screen-only */ }
      }
      if (!recovered) {
        // KEY spike finding: on a customer site, Permissions-Policy can silently block camera/mic here.
        try { opts.onFallback?.(e?.name === 'NotAllowedError' ? 'permissions-policy' : (e?.name || 'camera-mic-blocked')) } catch { /* no-op */ }
        screenOnly = true
      }
    }
  }
  const hadAudio = !!micTrack

  // 3) Compositor: screen letterboxed full-frame + camera PiP inset (22% width, bottom-right).
  let rafId = 0
  const drawFrame = () => {
    rafId = deps.raf(drawFrame)
    if (!ctx) return
    const W = canvas.width, H = canvas.height
    if ((screenVid as any).videoWidth) {
      const sr = (screenVid as any).videoWidth / (screenVid as any).videoHeight, cr = W / H
      let dw = W, dh = H, dx = 0, dy = 0
      if (sr > cr) { dh = W / sr; dy = (H - dh) / 2 } else { dw = H * sr; dx = (W - dw) / 2 }
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
      ctx.drawImage(screenVid, dx, dy, dw, dh)
    }
    if (hadCamera && (camVid as any).videoWidth) {
      const pw = Math.round(W * 0.22), ph = Math.round(pw * ((camVid as any).videoHeight / (camVid as any).videoWidth))
      const px = W - pw - 20, py = H - ph - 20
      ctx.drawImage(camVid, px, py, pw, ph)
      ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 2; ctx.strokeRect(px, py, pw, ph)
    }
    if (state === 'recording') { ctx.fillStyle = '#e11'; ctx.beginPath(); ctx.arc(24, 24, 7, 0, Math.PI * 2); ctx.fill() }
  }
  drawFrame()

  // 4) Combined output stream: composited canvas video track + mic audio track → one MediaRecorder.
  const canvasStream = canvas.captureStream(fps)
  const outTracks: any[] = [canvasStream.getVideoTracks?.()[0]].filter(Boolean)
  if (micTrack) outTracks.push(micTrack)
  const out = new deps.MediaStream(outTracks)

  const recorder = new deps.MediaRecorder(out, { mimeType: mime, videoBitsPerSecond: 2_500_000, audioBitsPerSecond: 128_000 })
  const chunks: BlobPart[] = []
  let totalBytes = 0
  let startedAt = 0, pausedMs = 0, pauseStartedAt = 0
  let tickId: any = 0
  let stopping = false

  const elapsedMs = (): number => {
    if (state === 'idle') return 0
    const base = deps.now() - startedAt - pausedMs
    return Math.max(0, base - (pauseStartedAt ? deps.now() - pauseStartedAt : 0))
  }

  recorder.ondataavailable = (ev: any) => {
    if (ev?.data && ev.data.size) { chunks.push(ev.data); totalBytes += ev.data.size }
    try { opts.onStats?.({ elapsedMs: elapsedMs(), bytes: totalBytes }) } catch { /* no-op */ }
    // Size cap: stop the moment the accumulated blob would exceed the byte ceiling.
    if (totalBytes >= caps.maxBytes) stop()
  }

  let resolveDone!: (r: RecordingResult) => void
  const done = new Promise<RecordingResult>((res) => { resolveDone = res })

  const cleanupStreams = stopAllTracks

  recorder.onstop = () => {
    deps.caf(rafId)
    if (tickId) { deps.clearInterval(tickId); tickId = 0 }
    const durationMs = elapsedMs()
    const blob = new Blob(chunks, { type: mime.split(';')[0] })
    cleanupStreams()
    setState('stopped')
    resolveDone({
      id, blob, mime: blob.type || mime, durationMs, bytes: blob.size || totalBytes,
      width: canvas.width, height: canvas.height, screenOnly, hadCamera, hadAudio,
    })
  }

  function stop() {
    if (stopping) return
    stopping = true
    try { if (recorder.state !== 'inactive') recorder.stop() } catch { /* already stopped */ }
  }

  // Native "stop sharing" from the browser bar ends the recording cleanly.
  try { screenTrack?.addEventListener?.('ended', () => stop()) } catch { /* no-op */ }

  // Emit a chunk every 1s so live size/elapsed readouts update; length-cap auto-stop is checked here.
  recorder.start(1000)
  startedAt = deps.now()
  setState('recording')
  tickId = deps.setInterval(() => {
    const el = elapsedMs()
    try { opts.onStats?.({ elapsedMs: el, bytes: totalBytes }) } catch { /* no-op */ }
    if (el >= caps.maxDurationMs) stop()
  }, 200)

  return {
    pause() {
      if (state !== 'recording') return
      try { recorder.pause() } catch { /* no-op */ }
      pauseStartedAt = deps.now(); setState('paused')
    },
    resume() {
      if (state !== 'paused') return
      try { recorder.resume() } catch { /* no-op */ }
      pausedMs += deps.now() - pauseStartedAt; pauseStartedAt = 0; setState('recording')
    },
    stop() { stop() },
    state() { return state },
    screenOnly() { return screenOnly },
    // KLA-602(b): expose the live camera stream ONLY when the camera is genuinely part of the capture, so the
    // overlay can mount a self-view bubble. Screen-only / audio-only(mic) fallbacks return null → no bubble.
    cameraStream() { return hadCamera && camStream ? camStream : null },
    done,
  }
  } catch (e) {
    // #474: init failed after some tracks were already acquired — stop every one before rethrowing so the
    // camera/mic/screen never stay live (the browser recording indicator clears). Caller treats as cancel.
    stopAllTracks()
    throw e
  }
}

// ── Blob → data URL (upload form uses data URLs; widget-lib re-hydrates to a Blob on submit) ────────────
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const fr = new FileReader()
      fr.onload = () => resolve(String(fr.result))
      fr.onerror = () => reject(fr.error || new Error('read failed'))
      fr.readAsDataURL(blob)
    } catch (e) { reject(e as Error) }
  })
}

export async function recordingResultToAttachment(r: RecordingResult): Promise<RecordingAttachment> {
  return {
    id: r.id,
    dataUrl: await blobToDataUrl(r.blob),
    mime: r.mime,
    durationMs: Math.round(r.durationMs),
    bytes: r.bytes,
    width: r.width,
    height: r.height,
    screenOnly: r.screenOnly,
  }
}

// ── KLA-602(b): live camera self-view bubble (Loom/Mevak style) ────────────────────────────────────────
// A small circular LIVE preview of the LOCAL getUserMedia camera track, shown WHILE recording so the reporter
// sees themselves. It plays a muted <video> off the camera stream and is NOT composited into the recorded file
// here (compositing already happens in startRecording's PiP; live-bubble compositing is Phase B / KLA follow-up).
// Returns the bubble element (the caller appends it to the recorder host so it's torn down with the overlay), or
// null when there is no camera track (screen-only / camera blocked) — so a permission denial simply yields no
// bubble and no error. Corner-anchored bottom-left by default; draggable via pointer events.
export function startCameraPreview(stream: any | null): HTMLElement | null {
  if (typeof document === 'undefined') return null
  if (!stream || !(stream.getVideoTracks?.().length)) return null
  const bubble = document.createElement('div')
  bubble.setAttribute('data-klavity-ui', 'camera-preview')
  bubble.setAttribute('role', 'img')
  bubble.setAttribute('aria-label', 'Your camera preview')
  bubble.style.cssText =
    'position:fixed;left:24px;bottom:24px;width:128px;height:128px;border-radius:50%;overflow:hidden;' +
    'z-index:2147483647;pointer-events:auto;cursor:grab;background:#000;border:3px solid #7c3aed;' +
    'box-shadow:0 10px 30px rgba(28,22,40,.42);touch-action:none'
  const video = document.createElement('video')
  video.muted = true
  ;(video as any).playsInline = true
  video.setAttribute('playsinline', '')
  video.autoplay = true
  video.setAttribute('aria-hidden', 'true')
  // Mirror horizontally so it reads like a selfie/webcam preview; cover-fit the circle.
  video.style.cssText = 'width:100%;height:100%;object-fit:cover;transform:scaleX(-1);display:block'
  try { (video as any).srcObject = stream } catch { /* jsdom/headless: no real playback */ }
  try { const p = video.play?.(); if (p && typeof p.catch === 'function') p.catch(() => {}) } catch { /* no-op */ }
  bubble.appendChild(video)
  // Best-effort drag to reposition (corner-anchored otherwise). Pointer events keep it simple + touch-friendly.
  let dragging = false, startX = 0, startY = 0, originX = 0, originY = 0
  const onDown = (e: any) => {
    dragging = true
    bubble.style.cursor = 'grabbing'
    const r = bubble.getBoundingClientRect()
    originX = r.left; originY = r.top; startX = e.clientX; startY = e.clientY
    // switch from bottom/left anchoring to absolute top/left so the drag math is uniform
    bubble.style.right = 'auto'; bubble.style.bottom = 'auto'
    bubble.style.left = originX + 'px'; bubble.style.top = originY + 'px'
    try { bubble.setPointerCapture?.(e.pointerId) } catch { /* no-op */ }
  }
  const onMove = (e: any) => {
    if (!dragging) return
    bubble.style.left = Math.max(0, originX + (e.clientX - startX)) + 'px'
    bubble.style.top = Math.max(0, originY + (e.clientY - startY)) + 'px'
  }
  const onUp = () => { dragging = false; bubble.style.cursor = 'grab' }
  bubble.addEventListener('pointerdown', onDown)
  bubble.addEventListener('pointermove', onMove)
  bubble.addEventListener('pointerup', onUp)
  return bubble
}

// ── recordMe(): thin browser-only overlay (consent → recording → auto-attach) ─────────────────────────
// KLA-602(a): the finished recording now resolves DIRECTLY when the reporter stops (no "Preview → Attach to
// report" gate) — the composer drops it straight into the photos/videos gallery as a removable video tile, and
// Re-record lives there as a tile action. recordMe still resolves null on cancel/close. Deliberately
// self-contained (its own fixed overlay) so the heavy MediaRecorder machinery stays OUT of the shared composer
// (packages/core/src/modal.ts) — the composer only sees the resolved attachment.
export interface RecordMeOptions {
  caps?: Partial<RecordingCaps>
  deps?: RecorderDeps
  // KLA-555 (walkthrough mode): fires on every overlay phase transition so the host can minimize/restore the
  // composer around a live recording. 'consent' renders the centered card+backdrop; the ACTIVE 'recording'
  // phase docks a compact bar and lets clicks pass through to the page, so the host should hide the composer
  // while phase==='recording' and restore it otherwise (and when recordMe's promise resolves/rejects).
  // ('preview' is retained in the union for back-compat but is NO LONGER emitted — KLA-602(a) dropped the
  // preview panel; stop auto-attaches.) Best-effort — listener errors never break capture.
  onPhase?: (phase: 'consent' | 'recording' | 'preview') => void
}

export async function recordMe(opts: RecordMeOptions = {}): Promise<RecordingAttachment | null> {
  if (typeof document === 'undefined') return null
  const deps = opts.deps ?? defaultRecorderDeps()
  if (!recordingSupported(deps)) return null
  return new Promise<RecordingAttachment | null>((resolve) => {
    const host = document.createElement('div')
    host.setAttribute('data-klavity-ui', 'recorder')
    const card = document.createElement('div')
    host.appendChild(card); document.body.appendChild(host)

    const FONT = 'font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#19140f'
    // KLA-555 (walkthrough mode): the overlay chrome is per-phase, not static.
    //   'modal' → full-screen dim backdrop centering a 360px card (consent + preview panels). Blocks the page.
    //   'bar'   → transparent, pointer-events:none host (clicks pass THROUGH to the live app) with a compact
    //             control docked bottom-center (pointer-events:auto). Used only for the ACTIVE recording phase
    //             so the reporter can navigate + narrate over the running app, Loom/CleanShot style.
    const setChrome = (mode: 'modal' | 'bar') => {
      if (mode === 'bar') {
        host.style.cssText = `position:fixed;inset:0;z-index:2147483647;pointer-events:none;${FONT}`
        card.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);pointer-events:auto;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:14px;box-shadow:0 12px 40px rgba(28,22,40,.32);overflow:hidden;max-width:92vw'
      } else {
        host.style.cssText = `position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:rgba(10,8,14,.55);${FONT}`
        card.style.cssText = 'width:360px;max-width:92vw;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:12px;box-shadow:0 20px 60px rgba(28,22,40,.28);overflow:hidden'
      }
    }
    const emitPhase = (phase: 'consent' | 'recording' | 'preview') => { try { opts.onPhase?.(phase) } catch { /* listener errors never break capture */ } }
    setChrome('modal')

    let settled = false
    let controller: RecordingController | null = null
    // #474 (privacy) teardown hook: recordMe owns its own fixed overlay, sibling to the composer modal. If the
    // overlay is dismissed (Attach/Cancel/Re-record), the reporter presses Escape, or the host page navigates
    // away while a recording is ACTIVE, every camera/mic/screen track must stop. finish() is the single exit and
    // ALWAYS stops the controller; the Escape + pagehide listeners funnel those paths back through finish().
    const teardownRecorder = () => { try { controller?.stop() } catch { /* no-op */ } }
    const onKeydown = (e: KeyboardEvent) => {
      // Registered at document capture; because recordMe mounts AFTER the composer, this runs before the
      // composer's own Esc handler while the recorder overlay is up. Cancel the recording (stopping tracks)
      // and swallow the key so the underlying modal does NOT also close behind us.
      if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); finish(null) }
    }
    const onPageHide = () => { teardownRecorder() }
    document.addEventListener('keydown', onKeydown, { capture: true })
    if (typeof window !== 'undefined') { window.addEventListener('pagehide', onPageHide); window.addEventListener('beforeunload', onPageHide) }
    const finish = (val: RecordingAttachment | null) => {
      if (settled) return
      settled = true
      teardownRecorder() // stop any live camera/mic/screen tracks on EVERY exit (cancel/attach/redo/esc/close)
      document.removeEventListener('keydown', onKeydown, { capture: true })
      if (typeof window !== 'undefined') { window.removeEventListener('pagehide', onPageHide); window.removeEventListener('beforeunload', onPageHide) }
      try { host.remove() } catch { /* no-op */ }
      resolve(val)
    }

    const fmtTime = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }
    const fmtMB = (b: number) => `${(b / 1048576).toFixed(1)} MB`
    const caps: RecordingCaps = { ...DEFAULT_RECORDING_CAPS, ...(opts.caps || {}) }

    // Panel 1 — consent-first start.
    const renderConsent = () => {
      setChrome('modal'); emitPhase('consent')
      card.innerHTML =
        '<div style="padding:14px;border-bottom:1px solid #e3ddd1;font-weight:600">Record a walkthrough</div>' +
        '<div style="padding:14px">' +
        '<label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-screen" checked disabled> Share my <b>screen</b></label>' +
        '<label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-cam" checked> Camera <span style="font-size:9px;font-weight:800;color:#fff;background:#6366f1;padding:1px 5px;border-radius:999px">optional</span></label>' +
        '<label style="display:flex;gap:8px;align-items:center;margin:6px 0"><input type="checkbox" id="klr-mic" checked> Microphone (narration)</label>' +
        '<div style="display:flex;gap:8px;margin-top:10px"><button id="klr-start" style="padding:8px 13px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Start recording</button><button id="klr-cancel" style="padding:8px 13px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Cancel</button></div>' +
        `<p style="font-size:11px;color:#574f45;margin-top:8px">Your browser will ask to share a tab/screen. Max ${Math.round(caps.maxDurationMs / 60000)} min. Nothing uploads until you attach it.</p>` +
        '<div id="klr-hint"></div></div>'
      ;(card.querySelector('#klr-cancel') as HTMLButtonElement).onclick = () => finish(null)
      ;(card.querySelector('#klr-start') as HTMLButtonElement).onclick = () => {
        const wantCamera = (card.querySelector('#klr-cam') as HTMLInputElement).checked
        const wantMic = (card.querySelector('#klr-mic') as HTMLInputElement).checked
        void begin(wantCamera, wantMic)
      }
    }

    const begin = async (wantCamera: boolean, wantMic: boolean) => {
      // #477: onFallback may fire with 'camera-blocked' (mic narration KEPT via the audio-only retry) or a
      // screen-only reason ('permissions-policy'/error name). The recording panel hint reflects which.
      let fallbackReason: string | null = null
      try {
        controller = await startRecording({
          wantCamera, wantMic, caps: opts.caps,
          onFallback: (reason) => { fallbackReason = reason },
          onStats: ({ elapsedMs, bytes }) => {
            const t = card.querySelector('#klr-timer'); if (t) t.textContent = 'REC ' + fmtTime(elapsedMs)
            const m = card.querySelector('#klr-meta')
            if (m) m.innerHTML = `${fmtTime(Math.max(0, caps.maxDurationMs - elapsedMs))} left<br>~${fmtMB(bytes)}`
          },
        }, deps)
      } catch {
        finish(null); return // user dismissed the screen-share picker
      }
      renderRecording(fallbackReason)
      // KLA-602(b): live self-view bubble while recording, ONLY when the camera is genuinely part of the
      // capture (opt-in via the consent camera checkbox + granted). A denial → cameraStream() is null → no
      // bubble, no error. Appended to the recorder host so finish()'s host.remove() tears it down.
      try {
        const camBubble = startCameraPreview(controller?.cameraStream?.())
        if (camBubble) host.appendChild(camBubble)
      } catch { /* preview is a nicety — never let it break capture */ }
      // KLA-602(a): on stop, resolve the attachment DIRECTLY (no preview/attach gate) — the composer auto-adds
      // it to the gallery as a selected, removable video tile.
      controller.done.then(async (r) => { finish(await recordingResultToAttachment(r)) })
    }

    // Panel 2 — ACTIVE recording. KLA-555: a NON-BLOCKING compact bar docked bottom-center (Loom/CleanShot
    // style) instead of a page-dimming modal, so the reporter can navigate + narrate over the LIVE app while
    // recording. The host chrome goes transparent + pointer-events:none (clicks pass through to the page) and
    // only this bar captures pointer events. The pointless 120px "screen preview" box is dropped — the user is
    // watching the real app. Element ids #klr-timer / #klr-meta are unchanged so the onStats handler keeps
    // updating them, and #klr-pause / #klr-stop keep their wiring.
    const renderRecording = (fallbackReason: string | null) => {
      // #477: 'camera-blocked' means the audio-only retry KEPT the mic (screen + narration); any other reason
      // means neither camera nor mic is available (screen only).
      const micKept = fallbackReason === 'camera-blocked'
      const screenOnlyFallback = !!fallbackReason && !micKept
      const hint = micKept
        ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera blocked by this site — recording <b>screen + mic narration</b>.</div>'
        : screenOnlyFallback
          ? '<div style="padding:0 14px 10px;font-size:11px;color:#574f45">Camera/mic blocked — recording <b>screen only</b>. Narrate by typing, or use the extension.</div>'
          : ''
      setChrome('bar'); emitPhase('recording')
      card.innerHTML =
        '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px">' +
        '<span style="display:inline-flex;align-items:center;gap:7px;font-weight:600;white-space:nowrap">' +
        '<span aria-hidden="true" style="width:9px;height:9px;border-radius:50%;background:#e11;flex:none"></span>' +
        '<span id="klr-timer">REC 0:00</span></span>' +
        '<button id="klr-pause" style="padding:7px 12px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;cursor:pointer">Pause</button>' +
        '<button id="klr-stop" style="padding:7px 12px;border-radius:8px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:600;cursor:pointer">Stop</button>' +
        '<span id="klr-meta" style="font-size:11px;color:#574f45;text-align:right;white-space:nowrap"></span>' +
        '</div>' +
        hint
      const pauseBtn = card.querySelector('#klr-pause') as HTMLButtonElement
      pauseBtn.onclick = () => {
        if (!controller) return
        if (controller.state() === 'recording') { controller.pause(); pauseBtn.textContent = 'Resume' }
        else { controller.resume(); pauseBtn.textContent = 'Pause' }
      }
      ;(card.querySelector('#klr-stop') as HTMLButtonElement).onclick = () => controller?.stop()
    }

    // KLA-602(a): the old "Panel 3 — preview → attach" is GONE. Stopping the recording resolves the
    // attachment directly (see begin()'s controller.done handler), and the composer drops it straight into the
    // gallery as a selected, removable video tile with a Re-record tile action.
    renderConsent()
  })
}
