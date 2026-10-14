import { describe, it, expect } from 'vitest'
import { captureGrid, planSeamlessScrollStitch } from './fullpage'

describe('captureGrid (scroll-stitch position grid)', () => {
  it('a single-screen page is one frame at the origin', () => {
    expect(captureGrid(1000, 800, 1000, 800)).toEqual([{ x: 0, y: 0 }])
  })

  it('a tall page yields vertically-stacked frames, last clamped to max scroll', () => {
    // vh 800, page 2000 → rows start 0,800,1600 → clamp 1600→1200 (maxY = 2000-800)
    expect(captureGrid(1000, 2000, 1000, 800)).toEqual([
      { x: 0, y: 0 }, { x: 0, y: 800 }, { x: 0, y: 1200 },
    ])
  })

  it('a page exactly N screens tall does not duplicate the last row', () => {
    expect(captureGrid(1000, 1600, 1000, 800)).toEqual([{ x: 0, y: 0 }, { x: 0, y: 800 }])
  })

  it('a wide + tall page produces a full clamped grid (row-major)', () => {
    // 1500 wide / vw 1000 → cols 0, 500(clamped from 1000). 1200 tall / vh 800 → rows 0, 400(clamped).
    expect(captureGrid(1500, 1200, 1000, 800)).toEqual([
      { x: 0, y: 0 }, { x: 500, y: 0 },
      { x: 0, y: 400 }, { x: 500, y: 400 },
    ])
  })

  it('clamps and de-dupes when the page is barely taller than the viewport', () => {
    // 1000 tall, vh 800 → rows start 0, 800 → clamp 800→200 (maxY=200) → [0, 200]
    expect(captureGrid(1000, 1000, 1000, 800)).toEqual([{ x: 0, y: 0 }, { x: 0, y: 200 }])
  })

  it('guards against zero/degenerate inputs', () => {
    expect(captureGrid(0, 0, 0, 0)).toEqual([{ x: 0, y: 0 }])
  })
})

describe('planSeamlessScrollStitch (extension 1D seamless full-page)', () => {
  it('when topHeaderHeight > 0: Frame 0 includes header; subsequent frames crop header and seamlessly tile canvas', () => {
    // 2000px page, 800px viewport, 60px header (.bar)
    const steps = planSeamlessScrollStitch(2000, 800, 60)
    expect(steps.length).toBeGreaterThan(1)

    expect(steps[0]).toEqual({
      scrollY: 0,
      sourceY: 0,
      sourceHeight: 800,
      canvasY: 0,
      drawHeight: 800,
    })

    // Step 1: excludes header (sourceY = 60), scrolls to canvasFilled - 60 = 740
    expect(steps[1].canvasY).toBe(800)
    expect(steps[1].sourceY).toBe(60)
    expect(steps[1].scrollY).toBe(740)
    expect(steps[1].drawHeight).toBe(740)

    // Verify strict continuity
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].sourceY).toBeGreaterThanOrEqual(60)
      expect(steps[i].canvasY).toBe(steps[i - 1].canvasY + steps[i - 1].drawHeight)
    }

    const last = steps[steps.length - 1]
    expect(last.canvasY + last.drawHeight).toBe(2000)
  })

  it('single frame when fullHeight <= viewportHeight', () => {
    const steps = planSeamlessScrollStitch(700, 800, 60)
    expect(steps).toEqual([{
      scrollY: 0,
      sourceY: 0,
      sourceHeight: 700,
      canvasY: 0,
      drawHeight: 700,
    }])
  })
})
