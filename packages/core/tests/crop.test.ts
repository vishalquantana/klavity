import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cropDataUrl, computeSourceRect, cumulativeScrollForRect } from '../src/crop'

let lastDrawImageArgs: number[] = []

// Mock HTMLCanvasElement and HTMLImageElement for jsdom
beforeEach(() => {
  lastDrawImageArgs = []
  vi.stubGlobal('document', {
    createElement: (tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            drawImage: (_img: unknown, ...rest: number[]) => { lastDrawImageArgs = rest },
          }),
          toDataURL: () => 'data:image/png;base64,cropped',
        }
      }
      throw new Error(`unexpected createElement(${tag})`)
    },
  })
})

function stubImage(naturalWidth: number, naturalHeight: number) {
  vi.stubGlobal('Image', class {
    onload: (() => void) | null = null
    naturalWidth = naturalWidth
    naturalHeight = naturalHeight
    set src(_: string) { setTimeout(() => this.onload?.(), 0) }
  })
}

describe('cropDataUrl', () => {
  it('clamps crop rect to image bounds', async () => {
    stubImage(100, 200)
    const result = await cropDataUrl('data:image/png;base64,abc', { x: -10, y: -10, w: 999, h: 999 }, 0, 0)
    expect(result).toBe('data:image/png;base64,cropped')
  })

  it('returns a string starting with data:', async () => {
    stubImage(100, 200)
    const result = await cropDataUrl('data:image/png;base64,abc', { x: 0, y: 0, w: 50, h: 50 }, 0, 0)
    expect(result).toMatch(/^data:/)
  })

  it('maps the CSS rect 1:1 when scale is 1 (html-to-image path)', async () => {
    stubImage(1280, 8000)
    await cropDataUrl('x', { x: 400, y: 350, w: 300, h: 200 }, 0, 100, 1)
    const [sx, sy, sw, sh] = lastDrawImageArgs
    expect([sx, sy, sw, sh]).toEqual([400, 450, 300, 200])
  })

  it('scales the CSS rect + scroll by the source pixel ratio (downscaled fallback)', async () => {
    // Fallback downscaled a 1280×8000 CSS page to a 640×4000 image (scale 0.5). A viewport rect at
    // (400,350) while scrolled 1000px down must land at image px (200, 675), NOT raw (400, 1350).
    stubImage(640, 4000)
    await cropDataUrl('x', { x: 400, y: 350, w: 300, h: 200 }, 0, 1000, 0.5)
    const [sx, sy, sw, sh] = lastDrawImageArgs
    expect([sx, sy, sw, sh]).toEqual([200, 675, 150, 100])
  })

  it('maps a retina (dpr=2) source: rect+scroll multiplied by scale 2', async () => {
    // A dpr-2 source rendered at scale 2 → image is CSS*2. A viewport rect (100,50,300,80) scrolled 200px
    // must land at image px (200, 500, 600, 160), i.e. everything *2 with scroll folded into y.
    stubImage(3000, 20000)
    await cropDataUrl('x', { x: 100, y: 50, w: 300, h: 80 }, 0, 200, 2)
    expect(lastDrawImageArgs.slice(0, 4)).toEqual([200, 500, 600, 160])
  })

  it('viewport source (scale 1, NO scroll): rect maps 1:1 with no offset', async () => {
    stubImage(1280, 900)
    await cropDataUrl('x', { x: 40, y: 12, w: 200, h: 48 }, 0, 0, 1)
    expect(lastDrawImageArgs.slice(0, 4)).toEqual([40, 12, 200, 48])
  })

  it('KLA-621 Snap-frame source: a CSS viewport rect maps to DEVICE pixels by the frame scale, NO scroll offset', async () => {
    // The pixel-perfect Snap frame is viewport-only at scale = video.videoWidth / innerWidth (here a 1440px
    // CSS viewport streamed at 2160px → scale 1.5, e.g. a downscaled retina tab). A selection at CSS
    // (300,200,400,150) must land at device px (450, 300, 600, 225) with scrollX/Y = 0 (the frame has no
    // scroll baked in). This is exactly the call captureRegionCrop/snapCropForRect makes.
    stubImage(2160, 1350)
    await cropDataUrl('x', { x: 300, y: 200, w: 400, h: 150 }, 0, 0, 1.5)
    expect(lastDrawImageArgs.slice(0, 4)).toEqual([450, 300, 600, 225])
  })

  it('strict mode THROWS on a degenerate crop (selection maps outside the capture)', async () => {
    // Inner-scroller content the DOM render clipped away: rect+scroll (y 900) is far below a 900px-tall
    // capture, so the source rect clamps to a sliver → strict must throw so the caller steers to Screen.
    stubImage(1280, 900)
    await expect(
      cropDataUrl('x', { x: 40, y: 900, w: 300, h: 200 }, 0, 0, 1, { strict: true }),
    ).rejects.toThrow(/degenerate/i)
  })

  it('strict mode does NOT throw when the selection fits inside the capture', async () => {
    stubImage(1280, 900)
    await expect(
      cropDataUrl('x', { x: 40, y: 12, w: 300, h: 200 }, 0, 0, 1, { strict: true }),
    ).resolves.toMatch(/^data:/)
  })
})

describe('computeSourceRect', () => {
  it('flags a crop that clamps to a sliver as degenerate', () => {
    // Selection at y=880 of a 900-tall image with h=200 → only ~19px of height survive (< half) → degenerate.
    const r = computeSourceRect({ x: 0, y: 880, w: 300, h: 200 }, 0, 0, 1, 1280, 900)
    expect(r.degenerate).toBe(true)
    expect(r.sh).toBeLessThan(200 * 0.5)
  })

  it('is NOT degenerate when the full selection fits', () => {
    const r = computeSourceRect({ x: 10, y: 10, w: 300, h: 200 }, 0, 0, 1, 1280, 900)
    expect(r.degenerate).toBe(false)
    expect([r.sx, r.sy, r.sw, r.sh]).toEqual([10, 10, 300, 200])
  })
})

describe('cumulativeScrollForRect', () => {
  it('adds a scrolled inner-scroller offset that window.scroll (0) misses (app-shell)', () => {
    // Simulate an app-shell: the DOCUMENT is at scroll 0, but the content lives in a child scrolled 260px.
    const scroller = { scrollTop: 260, scrollLeft: 0, parentElement: null as any }
    const leaf = { scrollTop: 0, scrollLeft: 0, parentElement: scroller }
    scroller.parentElement = { scrollTop: 0, scrollLeft: 0, parentElement: null } // stands in for <body>
    vi.stubGlobal('window', { scrollX: 0, scrollY: 0, pageXOffset: 0, pageYOffset: 0 })
    vi.stubGlobal('document', {
      documentElement: { tag: 'html' },
      body: scroller.parentElement,
      elementFromPoint: () => leaf,
    })
    const { scrollX, scrollY } = cumulativeScrollForRect({ x: 100, y: 40, w: 300, h: 90 })
    expect(scrollX).toBe(0)
    expect(scrollY).toBe(260) // picked up the inner scroller's scrollTop, not just window's 0
  })
})
