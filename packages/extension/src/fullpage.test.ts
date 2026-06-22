import { describe, it, expect } from 'vitest'
import { captureGrid } from './fullpage'

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
