// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import {
  pickRecordingMime,
  recordingSupported,
  startRecording,
  recordMe,
  RECORDING_MIME_CANDIDATES,
  RECORDING_MAX_BYTES,
  RECORDING_MAX_DURATION_MS,
  type RecorderDeps,
} from './recorder'

// ── Mock browser primitives ───────────────────────────────────────────────────────────────────────────
class FakeTrack {
  kind: string
  private handlers: Record<string, Array<() => void>> = {}
  stopped = false
  constructor(kind: string) { this.kind = kind }
  getSettings() { return { width: 1920, height: 1080, frameRate: 24 } }
  addEventListener(ev: string, cb: () => void) { (this.handlers[ev] ||= []).push(cb) }
  emit(ev: string) { (this.handlers[ev] || []).forEach((c) => c()) }
  stop() { this.stopped = true }
}
class FakeStream {
  private v: FakeTrack[]; private a: FakeTrack[]
  constructor(video = 1, audio = 0) {
    this.v = Array.from({ length: video }, () => new FakeTrack('video'))
    this.a = Array.from({ length: audio }, () => new FakeTrack('audio'))
  }
  getVideoTracks() { return this.v }
  getAudioTracks() { return this.a }
  getTracks() { return [...this.v, ...this.a] }
}

// A MediaRecorder mock whose start/stop/pause/resume + ondataavailable/onstop the test drives.
class FakeMediaRecorder {
  static _instances: FakeMediaRecorder[] = []
  static isTypeSupported(m: string) { return m === 'video/webm;codecs=vp9,opus' }
  state: 'inactive' | 'recording' | 'paused' = 'inactive'
  ondataavailable: ((ev: any) => void) | null = null
  onstop: (() => void) | null = null
  constructor(public stream: any, public opts: any) { FakeMediaRecorder._instances.push(this) }
  start(_timeslice?: number) { this.state = 'recording' }
  pause() { this.state = 'paused' }
  resume() { this.state = 'recording' }
  stop() { this.state = 'inactive'; this.onstop?.() }
  pushChunk(size: number) { this.ondataavailable?.({ data: new Blob([new Uint8Array(size)], { type: 'video/webm' }) }) }
}

function fakeCanvas() {
  return {
    width: 1280, height: 720,
    getContext: () => ({ fillRect() {}, drawImage() {}, beginPath() {}, arc() {}, fill() {}, strokeRect() {}, fillStyle: '', strokeStyle: '', lineWidth: 0 }),
    captureStream: () => new FakeStream(1, 0),
  } as any
}
function fakeVideo() { return { muted: false, playsInline: false, srcObject: null, videoWidth: 0, videoHeight: 0, play: async () => {} } as any }

function makeDeps(over: Partial<RecorderDeps> = {}, streams: { screen?: any; user?: any; userRejects?: boolean } = {}): RecorderDeps {
  let now = 0
  return {
    mediaDevices: {
      getDisplayMedia: vi.fn(async () => streams.screen ?? new FakeStream(1, 0)),
      getUserMedia: vi.fn(async () => { if (streams.userRejects) { const e: any = new Error('blocked'); e.name = 'NotAllowedError'; throw e } return streams.user ?? new FakeStream(1, 1) }),
    },
    MediaRecorder: FakeMediaRecorder as any,
    MediaStream: class { constructor(public tracks: any[]) {} getTracks() { return this.tracks } } as any,
    createElement: (tag) => (tag === 'canvas' ? fakeCanvas() : fakeVideo()),
    now: () => now,
    raf: () => 1,   // don't loop in tests
    caf: () => {},
    setInterval: () => 42 as any,
    clearInterval: () => {},
    // advance the clock via the returned now closure by monkeypatching below
    ...over,
  }
}

describe('pickRecordingMime', () => {
  it('picks the first supported candidate (vp9/opus webm target)', () => {
    expect(pickRecordingMime((m) => m === RECORDING_MIME_CANDIDATES[0])).toBe('video/webm;codecs=vp9,opus')
  })
  it('falls back to the Safari mp4 candidate when only mp4 is supported', () => {
    expect(pickRecordingMime((m) => m.startsWith('video/mp4'))).toBe('video/mp4;codecs=avc1,mp4a.40.2')
  })
  it('returns null when nothing is supported', () => {
    expect(pickRecordingMime(() => false)).toBeNull()
  })
})

describe('recordingSupported', () => {
  it('true when getDisplayMedia + MediaRecorder exist', () => {
    expect(recordingSupported({ mediaDevices: { getDisplayMedia() {} } as any, MediaRecorder: FakeMediaRecorder } as any)).toBe(true)
  })
  it('false when getDisplayMedia is missing (iOS Safari)', () => {
    expect(recordingSupported({ mediaDevices: {} as any, MediaRecorder: FakeMediaRecorder } as any)).toBe(false)
  })
})

describe('startRecording engine', () => {
  it('start → chunks → stop produces a non-empty blob with metadata + stable id', async () => {
    const deps = makeDeps()
    const ctrl = await startRecording({ wantCamera: true, wantMic: true }, deps)
    expect(ctrl.state()).toBe('recording')
    const rec = FakeMediaRecorder._instances[FakeMediaRecorder._instances.length - 1]
    rec.pushChunk(1000)
    rec.pushChunk(2000)
    ctrl.stop()
    const r = await ctrl.done
    expect(r.blob.size).toBe(3000)
    expect(r.mime).toContain('video/webm')
    expect(r.id).toMatch(/^rec_/)
    expect(r.screenOnly).toBe(false) // camera+mic granted
    expect(r.hadCamera).toBe(true)
    expect(r.hadAudio).toBe(true)
  })

  it('enforces the size cap by auto-stopping when bytes exceed RECORDING_MAX_BYTES', async () => {
    const deps = makeDeps()
    const onState = vi.fn()
    const ctrl = await startRecording({ onState }, deps)
    const rec = FakeMediaRecorder._instances[FakeMediaRecorder._instances.length - 1]
    rec.pushChunk(RECORDING_MAX_BYTES + 1) // one oversized chunk trips the cap
    const r = await ctrl.done
    expect(ctrl.state()).toBe('stopped')
    expect(r.bytes).toBeGreaterThan(RECORDING_MAX_BYTES)
    expect(onState).toHaveBeenCalledWith('stopped')
  })

  it('enforces the length cap via the interval tick (3 min auto-stop)', async () => {
    let intervalCb: (() => void) | null = null
    let clock = 0
    const deps = makeDeps({
      now: () => clock,
      setInterval: (cb: () => void) => { intervalCb = cb; return 7 as any },
    })
    const ctrl = await startRecording({}, deps)
    const rec = FakeMediaRecorder._instances[FakeMediaRecorder._instances.length - 1]
    rec.pushChunk(500)
    clock = RECORDING_MAX_DURATION_MS + 1 // past the 3-min cap
    intervalCb!()                          // the tick observes the overrun and stops
    const r = await ctrl.done
    expect(ctrl.state()).toBe('stopped')
    expect(r.durationMs).toBeGreaterThanOrEqual(RECORDING_MAX_DURATION_MS)
  })

  it('screen-only fallback: getUserMedia rejection → onFallback + screenOnly recording still yields a blob', async () => {
    const onFallback = vi.fn()
    const deps = makeDeps({}, { userRejects: true })
    const ctrl = await startRecording({ wantCamera: true, wantMic: true, onFallback }, deps)
    expect(onFallback).toHaveBeenCalledWith('permissions-policy')
    expect(ctrl.screenOnly()).toBe(true)
    const rec = FakeMediaRecorder._instances[FakeMediaRecorder._instances.length - 1]
    rec.pushChunk(1234)
    ctrl.stop()
    const r = await ctrl.done
    expect(r.screenOnly).toBe(true)
    expect(r.hadCamera).toBe(false)
    expect(r.hadAudio).toBe(false)
    expect(r.blob.size).toBe(1234)
  })

  it('pause/resume toggles recorder state', async () => {
    const deps = makeDeps()
    const ctrl = await startRecording({}, deps)
    ctrl.pause(); expect(ctrl.state()).toBe('paused')
    ctrl.resume(); expect(ctrl.state()).toBe('recording')
    ctrl.stop(); await ctrl.done
  })

  it('native "stop sharing" (screen track ended) stops the recording', async () => {
    const screen = new FakeStream(1, 0)
    const deps = makeDeps({}, { screen })
    const ctrl = await startRecording({ wantCamera: false, wantMic: false }, deps)
    ;(screen.getVideoTracks()[0] as any).emit('ended')
    const r = await ctrl.done
    expect(ctrl.state()).toBe('stopped')
    expect(r).toBeTruthy()
  })

  it('throws when no codec is supported', async () => {
    const deps = makeDeps()
    ;(deps.MediaRecorder as any).isTypeSupported = () => false
    await expect(startRecording({}, deps)).rejects.toThrow(/recording-unsupported/)
    ;(deps.MediaRecorder as any).isTypeSupported = (m: string) => m === 'video/webm;codecs=vp9,opus'
  })

  // #474 (privacy): if init throws AFTER tracks were acquired, every camera/mic/screen track must be stopped
  // before the reject so nothing stays live (browser recording indicator clears).
  it('#474: an init throw (MediaStream ctor) stops ALL acquired camera/mic/screen tracks', async () => {
    const screen = new FakeStream(1, 0)
    const user = new FakeStream(1, 1)
    const deps = makeDeps(
      { MediaStream: class { constructor() { throw new Error('MediaStream boom') } } as any },
      { screen, user },
    )
    await expect(startRecording({ wantCamera: true, wantMic: true }, deps)).rejects.toThrow(/boom/)
    expect(screen.getTracks().every((t) => (t as any).stopped)).toBe(true)
    expect(user.getTracks().every((t) => (t as any).stopped)).toBe(true)
  })

  // #477: camera blocked by the site's Permissions-Policy but mic allowed → the combined getUserMedia rejects;
  // retry audio-only (mic, no camera) BEFORE giving up to screen-only so narration survives.
  it('#477: camera-blocked-but-mic-allowed retries audio-only and keeps the mic (not screen-only)', async () => {
    const calls: any[] = []
    const deps = makeDeps({
      mediaDevices: {
        getDisplayMedia: vi.fn(async () => new FakeStream(1, 0)),
        getUserMedia: vi.fn(async (c: any) => {
          calls.push(c)
          if (c.video) { const e: any = new Error('camera blocked'); e.name = 'NotAllowedError'; throw e }
          return new FakeStream(0, 1) // audio-only stream: no video track, one mic track
        }),
      } as any,
    })
    const onFallback = vi.fn()
    const ctrl = await startRecording({ wantCamera: true, wantMic: true, onFallback }, deps)
    expect(calls.length).toBe(2)          // full (cam+mic) attempt, then the audio-only retry
    expect(calls[1].video).toBe(false)     // retry drops the camera constraint
    expect(onFallback).toHaveBeenCalledWith('camera-blocked')
    expect(ctrl.screenOnly()).toBe(false)  // mic kept → NOT screen-only
    const rec = FakeMediaRecorder._instances[FakeMediaRecorder._instances.length - 1]
    rec.pushChunk(777)
    ctrl.stop()
    const r = await ctrl.done
    expect(r.hadAudio).toBe(true)          // mic narration preserved
    expect(r.hadCamera).toBe(false)
    expect(r.screenOnly).toBe(false)
  })
})

// #474 (privacy) teardown hook: the recordMe overlay must stop every track when it is dismissed while a
// recording is active — here via Escape (which also stands in for the composer-close path).
describe('recordMe overlay teardown', () => {
  const tick = async (n = 3) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)) }

  it('#474: dismissing the overlay (Escape) mid-recording stops every camera/mic/screen track', async () => {
    document.querySelectorAll('[data-klavity-ui="recorder"]').forEach((n) => n.remove())
    const screen = new FakeStream(1, 0)
    const user = new FakeStream(1, 1)
    const deps = makeDeps({}, { screen, user })

    const p = recordMe({ deps })
    const card = document.querySelector('[data-klavity-ui="recorder"]') as HTMLElement
    expect(card).not.toBeNull()
    ;(card.querySelector('#klr-start') as HTMLButtonElement).click()
    await tick()
    // now in the recording panel (Stop button present) with live tracks
    expect(card.querySelector('#klr-stop')).not.toBeNull()
    expect(screen.getTracks().some((t) => (t as any).stopped)).toBe(false)

    // Escape dismisses the overlay while recording is active → teardown stops every track.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    const result = await p
    expect(result).toBeNull()
    expect(screen.getTracks().every((t) => (t as any).stopped)).toBe(true)
    expect(user.getTracks().every((t) => (t as any).stopped)).toBe(true)
    expect(document.querySelector('[data-klavity-ui="recorder"]')).toBeNull()
  })
})
