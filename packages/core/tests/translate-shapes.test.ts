import { describe, it, expect } from 'vitest'
import { translateShapes } from '../src/modal'
import type { Shape } from '../src/types'

describe('translateShapes (crop rebasing)', () => {
  it('shifts every shape variant by (dx, dy) into a new origin', () => {
    const shapes: Shape[] = [
      { type: 'pen', color: '#f00', points: [{ x: 10, y: 10 }, { x: 20, y: 30 }] },
      { type: 'rect', color: '#f00', x: 40, y: 50, w: 5, h: 5 },
      { type: 'circle', color: '#f00', x: 60, y: 70, rx: 3, ry: 3 },
      { type: 'count', color: '#f00', x: 80, y: 90, n: 2 },
      { type: 'text', color: '#f00', x: 12, y: 14, text: 'x' },
      { type: 'arrow', color: '#f00', x1: 1, y1: 2, x2: 3, y2: 4 },
      { type: 'line', color: '#f00', x1: 5, y1: 6, x2: 7, y2: 8 },
    ]
    const out = translateShapes(shapes, -10, -10)
    expect((out[0] as any).points).toEqual([{ x: 0, y: 0 }, { x: 10, y: 20 }])
    expect(out[1]).toMatchObject({ x: 30, y: 40, w: 5, h: 5 })
    expect(out[2]).toMatchObject({ x: 50, y: 60 })
    expect(out[3]).toMatchObject({ x: 70, y: 80, n: 2 })
    expect(out[4]).toMatchObject({ x: 2, y: 4, text: 'x' })
    expect(out[5]).toMatchObject({ x1: -9, y1: -8, x2: -7, y2: -6 })
    expect(out[6]).toMatchObject({ x1: -5, y1: -4, x2: -3, y2: -2 })
  })

  it('returns fresh objects (does not mutate the input)', () => {
    const shapes: Shape[] = [{ type: 'rect', color: '#f00', x: 10, y: 10, w: 1, h: 1 }]
    const out = translateShapes(shapes, 5, 5)
    expect(shapes[0]).toMatchObject({ x: 10, y: 10 })
    expect(out[0]).toMatchObject({ x: 15, y: 15 })
    expect(out[0]).not.toBe(shapes[0])
  })
})
