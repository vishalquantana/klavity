// @vitest-environment jsdom
// KD-163: recorder ↔ draft-writer contract, and the navigation (pagehide/beforeunload) behavior.
import { describe, it, expect, vi } from 'vitest'
import { startRecording, recordMe, type RecorderDeps } from './recorder'

class FakeTrack {
  kind: string
  stopped = false
  constructor(kind: string) { this.kind = kind }
  getSettings() { return { width: 1920, height: 1080, frameRate: 24 } }
  addEventListener() {}
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
class FakeMediaRecorder {
  static _instances: FakeMediaRecorder[] = []
  static isTypeSupported(m: string) { return m === 'video/webm;codecs=vp9,opus' }
  state: 'inactive' | 'recording' | 'paused' = 'inactive'
  ondataavailable: ((ev: any) => void) | null = null
  onstop: (() => void) | null = null
  constructor(public stream: any, public opts: any) { FakeMediaRecorder._instances.push(this) }
  start() { this.state = 'recording' }
  pause() { this.state = 'paused' }
  resume() { this.state = 'recording' }
  stop() { this.state = 'inactive'; this.onstop?.() }
  pushChunk(size: number) { this.ondataavailable?.({ data: new Blob([new Uint8Array(size)], { type: 'video/webm' }) }) }
}
const canvas = () => ({
  width: 1280, height: 720,
  getContext: () => ({ fillRect() {}, drawImage() {}, beginPath() {}, arc() {}, fill() {}, strokeRect() {}, fillStyle: '', strokeStyle: '', lineWidth: 0 }),
  captureStream: () => new FakeStream(1, 0),
}) as any
const video = () => ({ muted: false, playsInline: false, srcObject: null, videoWidth: 0, videoHeight: 0, play: async () => {} }) as any

function makeDeps(screen = new FakeStream(1, 0)): RecorderDeps {
  let now = 0
  return {
    mediaDevices: { getDisplayMedia: vi.fn(async () => screen), getUserMedia: vi.fn(async () => new FakeStream(1, 1)) },
    MediaRecorder: FakeMediaRecorder as any,
    MediaStream: class { constructor(public tracks: any[]) {} getTracks() { return this.tracks } } as any,
    createElement: (tag: string) => (tag === 'canvas' ? canvas() : video()),
    now: () => now,
    raf: () => 1, caf: () => {}, setInterval: () => 42 as any, clearInterval: () => {},
  } as RecorderDeps
}
const writer = () => ({ start: vi.fn(), chunk: vi.fn(), clear: vi.fn() })
const tick = async (n = 3) => { for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0)) }
const lastRec = () => FakeMediaRecorder._instances[FakeMediaRecorder._instances.length - 1]

describe('startRecording → draft writer (KD-163)', () => {
  it('opens the draft with the recording meta, then persists every chunk with elapsed time', async () => {
    const persist = writer()
    const ctrl = await startRecording({ wantCamera: false, wantMic: false, persist: persist as any }, makeDeps())
    expect(persist.start).toHaveBeenCalledTimes(1)
    const meta = persist.start.mock.calls[0][0]
    expect(meta).toMatchObject({ mime: expect.stringContaining('video/webm'), width: 1280, height: 720, screenOnly: true })
    expect(meta.id).toMatch(/^rec_/)
    lastRec().pushChunk(500); lastRec().pushChunk(700)
    expect(persist.chunk).toHaveBeenCalledTimes(2)
    expect(persist.chunk.mock.calls[0][0].size).toBe(500)
    ctrl.stop(); await ctrl.done
  })

  it('a throwing draft writer never breaks the recording', async () => {
    const persist = { start: vi.fn(() => { throw new Error('quota') }), chunk: vi.fn(() => { throw new Error('quota') }), clear: vi.fn() }
    const ctrl = await startRecording({ wantCamera: false, wantMic: false, persist: persist as any }, makeDeps())
    lastRec().pushChunk(100)
    ctrl.stop()
    expect((await ctrl.done).blob.size).toBe(100)
  })

  it('works unchanged without a writer', async () => {
    const ctrl = await startRecording({ wantCamera: false, wantMic: false }, makeDeps())
    lastRec().pushChunk(10); ctrl.stop()
    expect((await ctrl.done).blob.size).toBe(10)
  })
})

describe('recordMe navigation behavior (KD-163)', () => {
  async function startOverlay(persist: any) {
    document.querySelectorAll('[data-klavity-ui="recorder"]').forEach((n) => n.remove())
    const screen = new FakeStream(1, 0)
    const p = recordMe({ deps: makeDeps(screen), persist })
    const card = document.querySelector('[data-klavity-ui="recorder"]') as HTMLElement
    ;(card.querySelector('#klr-start') as HTMLButtonElement).click()
    await tick()
    expect(card.querySelector('#klr-stop')).not.toBeNull()
    return { p, screen }
  }

  it('beforeunload while recording asks for confirmation but does NOT stop capture', async () => {
    const { screen } = await startOverlay(writer())
    const ev = new Event('beforeunload', { cancelable: true }) as any
    window.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(true)
    expect(screen.getTracks().some((t) => (t as any).stopped)).toBe(false) // user may still cancel the navigation
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) // cleanup
  })

  it('pagehide stops every track and KEEPS the saved draft (it is recovered on the next page)', async () => {
    const persist = writer()
    const { screen } = await startOverlay(persist)
    window.dispatchEvent(new Event('pagehide'))
    expect(screen.getTracks().every((t) => (t as any).stopped)).toBe(true)
    expect(persist.clear).not.toHaveBeenCalled()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })) // cleanup
    expect(persist.clear).not.toHaveBeenCalled() // finish() after a pagehide must not wipe the draft either
  })

  it('a normal exit (Escape) clears the draft', async () => {
    const persist = writer()
    const { p } = await startOverlay(persist)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(await p).toBeNull()
    expect(persist.clear).toHaveBeenCalledTimes(1)
  })

  it('no beforeunload warning once the overlay is closed', async () => {
    const { p } = await startOverlay(writer())
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await p
    const ev = new Event('beforeunload', { cancelable: true }) as any
    window.dispatchEvent(ev)
    expect(ev.defaultPrevented).toBe(false)
  })
})
