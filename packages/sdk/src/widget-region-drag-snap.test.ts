// @vitest-environment jsdom
// KLA-621 (founder's #1 use case): right-click-DRAG → take a Snap (pixel-perfect getDisplayMedia frame) and
// CROP it to the dragged rect — nothing else. captureRegionCrop(rect, { forceSnap: true }) is exactly what the
// widget's captureRegionAndOpen calls on mouseup. This test proves that path: it reaches for the Snap frame
// (one getDisplayMedia), crops to the EXACT dragged rect (scrollX/Y = 0 → viewport frame, NOT full-page), and
// returns a real-pixel shot — never a blank DOM render, never a full-frame grab.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Intercept the core crop so we can assert precisely WHAT rect/scale it was asked to crop from the Snap frame.
const cropCalls: any[] = []
vi.mock('@klavity/core/crop', async (orig) => {
  const actual = await (orig() as Promise<any>)
  return {
    ...actual,
    cropDataUrl: vi.fn(async (dataUrl: string, rect: any, sx: number, sy: number, scale: number) => {
      cropCalls.push({ dataUrl, rect, sx, sy, scale })
      return 'data:image/png;base64,SNAPCROP'
    }),
  }
})

import { captureRegionCrop, releaseSharedDisplayStream } from './widget'

class FakeTrack { readyState: 'live' | 'ended' = 'live'; kind = 'video'; stop() { this.readyState = 'ended' }; addEventListener() {} }
class FakeStream { tracks = [new FakeTrack()]; getTracks() { return this.tracks }; getVideoTracks() { return this.tracks } }

describe('KLA-621 right-click-drag → Snap-frame crop to the exact rect', () => {
  let getDisplayMedia: ReturnType<typeof vi.fn>
  let realCreate: typeof document.createElement

  beforeEach(() => {
    cropCalls.length = 0
    releaseSharedDisplayStream()
    getDisplayMedia = vi.fn(async () => new FakeStream() as unknown as MediaStream)
    ;(navigator as any).mediaDevices = { getDisplayMedia }
    // A 1440px CSS viewport streamed at 2880 device px → scale 2 (retina tab). innerWidth drives the scale calc.
    Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
    // Fake <video> (frame ready) + <canvas> (drawImage/toDataURL) so grabDisplayViewportFrame produces a frame.
    realCreate = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'video') return { videoWidth: 2880, videoHeight: 1800, muted: false, play: async () => {}, set srcObject(_v: any) {} } as any
      if (tag === 'canvas') return { width: 0, height: 0, getContext: () => ({ drawImage() {} }), toDataURL: () => 'data:image/png;base64,SNAPFRAME' } as any
      return realCreate(tag)
    })
  })
  afterEach(() => { vi.restoreAllMocks(); releaseSharedDisplayStream() })

  it('forceSnap: prompts getDisplayMedia ONCE, crops the SNAP frame to the exact rect at scrollX/Y=0, returns real-pixel', async () => {
    const rect = { x: 300, y: 200, w: 400, h: 150 } // the dragged rectangle
    const out = await captureRegionCrop(rect, { forceSnap: true })
    // Exactly one share prompt (the drag gesture establishes the session stream).
    expect(getDisplayMedia).toHaveBeenCalledTimes(1)
    // The crop was taken from the SNAP viewport frame, at the EXACT dragged rect, with NO scroll offset
    // (viewport frame) and the frame's real device scale (2880/1440 = 2) — never the full page.
    expect(cropCalls).toHaveLength(1)
    expect(cropCalls[0].rect).toEqual(rect)
    expect(cropCalls[0].sx).toBe(0)
    expect(cropCalls[0].sy).toBe(0)
    expect(cropCalls[0].scale).toBe(2)
    expect(cropCalls[0].dataUrl).toBe('data:image/png;base64,SNAPFRAME') // the Snap frame, not a DOM render
    // Result is the pixel-perfect crop tagged real-pixel with no steer-to-Snap nudge (it IS the Snap).
    expect(out.dataUrl).toBe('data:image/png;base64,SNAPCROP')
    expect(out.quality).toBe('real-pixel')
    expect(out.suggestSharp).toBe(false)
  })

  it('a SECOND drag reuses the live stream — NO second getDisplayMedia prompt', async () => {
    await captureRegionCrop({ x: 10, y: 10, w: 100, h: 100 }, { forceSnap: true })
    await captureRegionCrop({ x: 50, y: 50, w: 200, h: 120 }, { forceSnap: true })
    expect(getDisplayMedia).toHaveBeenCalledTimes(1) // the share approval is reused across drags
    expect(cropCalls).toHaveLength(2)
    expect(cropCalls[1].rect).toEqual({ x: 50, y: 50, w: 200, h: 120 }) // still cropped to the new rect
  })
})
