// @vitest-environment jsdom
// KLA-621: pixel-perfect AREA capture — the Region / Pick-element / Snap crop source is the SHARED, session-
// scoped getDisplayMedia frame (real pixels, incl. cross-origin iframes + canvas/WebGL) instead of the DOM
// render (which comes back blank/white for that content). These tests cover the two load-bearing invariants
// that don't need real video frames: (1) the shared display stream is acquired ONCE and reused across
// captures (no re-prompt), and released on composer close; (2) the Region/Pick path steers to the Snap source
// when the selection overlaps uncapturable content (cross-origin iframe or canvas/WebGL).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { acquireDisplayStream, activeSharedStream, releaseSharedDisplayStream, selectionNeedsSharp } from './widget'

// A minimal fake MediaStreamTrack whose readyState we can flip + whose stop()/ended we can observe.
class FakeTrack {
  readyState: 'live' | 'ended' = 'live'
  kind = 'video'
  private listeners: Record<string, Array<() => void>> = {}
  stop() { this.readyState = 'ended' }
  addEventListener(ev: string, cb: () => void) { (this.listeners[ev] ??= []).push(cb) }
  emit(ev: string) { (this.listeners[ev] || []).forEach((c) => c()) }
}
class FakeStream {
  tracks: FakeTrack[]
  constructor() { this.tracks = [new FakeTrack()] }
  getTracks() { return this.tracks }
  getVideoTracks() { return this.tracks }
}

describe('KLA-621 shared session display stream', () => {
  let getDisplayMedia: ReturnType<typeof vi.fn>
  beforeEach(() => {
    releaseSharedDisplayStream() // start each test with no cached stream
    getDisplayMedia = vi.fn(async () => new FakeStream() as unknown as MediaStream)
    ;(navigator as any).mediaDevices = { getDisplayMedia }
  })
  afterEach(() => { releaseSharedDisplayStream() })

  it('acquires getDisplayMedia ONCE and reuses the same stream across region + pick + snap captures', async () => {
    const s1 = await acquireDisplayStream() // e.g. the Snap
    const s2 = await acquireDisplayStream() // e.g. a following Region crop
    const s3 = await acquireDisplayStream() // e.g. a following Pick-element crop
    expect(getDisplayMedia).toHaveBeenCalledTimes(1) // no re-prompt — the share approval is reused
    expect(s2).toBe(s1)
    expect(s3).toBe(s1)
    expect(activeSharedStream()).toBe(s1)
  })

  it('releases the shared stream on composer close (tracks stopped, next capture re-prompts)', async () => {
    const s1 = (await acquireDisplayStream()) as unknown as FakeStream
    releaseSharedDisplayStream() // what onClose does
    expect(s1.getTracks().every((t) => t.readyState === 'ended')).toBe(true)
    expect(activeSharedStream()).toBeNull()
    // A capture after close prompts a fresh share.
    await acquireDisplayStream()
    expect(getDisplayMedia).toHaveBeenCalledTimes(2)
  })

  it('drops a dead stream when the user hits the browser "Stop sharing" bar (track ended)', async () => {
    const s1 = (await acquireDisplayStream()) as unknown as FakeStream
    s1.getTracks()[0].emit('ended') // browser stop-sharing bar → our handle is released
    expect(activeSharedStream()).toBeNull()
    const s2 = await acquireDisplayStream() // next capture re-prompts, gets a fresh stream
    expect(getDisplayMedia).toHaveBeenCalledTimes(2)
    expect(s2).not.toBe(s1 as unknown as MediaStream)
  })
})

describe('KLA-621 selectionNeedsSharp — steer Region/Pick to the Snap source over blank DOM render', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('is TRUE when the selection overlaps a large cross-origin iframe', () => {
    const f = document.createElement('iframe')
    f.setAttribute('src', 'https://maps.example.com/embed')
    // jsdom has no layout — stub the geometry the detector reads.
    Object.defineProperty(f, 'offsetWidth', { value: 640, configurable: true })
    Object.defineProperty(f, 'offsetHeight', { value: 480, configurable: true })
    document.body.appendChild(f)
    expect(selectionNeedsSharp({ x: 10, y: 10, w: 100, h: 100 })).toBe(true)
  })

  it('is TRUE when the selection overlaps a canvas/WebGL surface (map/chart), FALSE when it does not', () => {
    const c = document.createElement('canvas')
    c.getBoundingClientRect = () => ({ left: 200, top: 200, width: 300, height: 300, right: 500, bottom: 500, x: 200, y: 200, toJSON() {} }) as DOMRect
    document.body.appendChild(c)
    // Selection over the canvas → sharp.
    expect(selectionNeedsSharp({ x: 250, y: 250, w: 50, h: 50 })).toBe(true)
    // Selection well clear of the canvas (and no iframe) → the quiet DOM render is fine.
    expect(selectionNeedsSharp({ x: 0, y: 0, w: 40, h: 40 })).toBe(false)
  })
})
