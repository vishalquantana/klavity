// Edit-annotation geometry: bounds, hit-testing, handles, move/resize maths, per-shape stroke + counter size.
import { describe, it, expect } from 'vitest'
import { Annotator, translateShape, resizeShape, cloneShape } from '../src/annotator'
import type { Shape } from '../src/types'

const mk = (w = 800, h = 600) => { const c = { width: w, height: h, getContext: () => null } as any; return new Annotator(c, 'data:image/png;base64,') }

describe('per-shape stroke + counter size', () => {
  it('a shape keeps its own stroke (sw); older shapes follow the editor setting', () => {
    const a = mk()                                   // base width = max(3, 800/400)=3
    a.strokeScale = 1.8
    expect(a.computeLineWidth({ type: 'rect', color: '#f00', x: 0, y: 0, w: 1, h: 1, sw: 0.6 })).toBeCloseTo(1.8)
    expect(a.computeLineWidth({ type: 'rect', color: '#f00', x: 0, y: 0, w: 1, h: 1 })).toBeCloseTo(5.4)
    expect(a.computeLineWidth()).toBeCloseTo(5.4)
  })
  it('counter radius: its own size once resized, else the default', () => {
    const a = mk()
    expect(a.countRadius({ type: 'count', color: '#f00', x: 0, y: 0, n: 1 })).toBe(Math.max(13, a.computeFontSize()))
    expect(a.countRadius({ type: 'count', color: '#f00', x: 0, y: 0, n: 1, size: 40 })).toBe(40)
  })
})

describe('bounds, handles, hit-testing', () => {
  it('bounds for every shape type', () => {
    const a = mk()
    expect(a.shapeBounds({ type: 'rect', color: 'r', x: 50, y: 40, w: -20, h: 10 })).toEqual({ x: 30, y: 40, w: 20, h: 10 })
    expect(a.shapeBounds({ type: 'arrow', color: 'r', x1: 90, y1: 10, x2: 10, y2: 50 })).toEqual({ x: 10, y: 10, w: 80, h: 40 })
    expect(a.shapeBounds({ type: 'circle', color: 'r', x: 100, y: 100, rx: 20, ry: 10 })).toEqual({ x: 80, y: 90, w: 40, h: 20 })
    expect(a.shapeBounds({ type: 'pen', color: 'r', points: [{ x: 5, y: 9 }, { x: 15, y: 3 }] })).toEqual({ x: 5, y: 3, w: 10, h: 6 })
    expect(a.shapeBounds({ type: 'count', color: 'r', x: 50, y: 50, n: 1, size: 10 })).toEqual({ x: 40, y: 40, w: 20, h: 20 })
  })
  it('handles: endpoints for line/arrow, one corner for counter, four for boxes', () => {
    const a = mk()
    expect(a.handlesFor({ type: 'line', color: 'r', x1: 1, y1: 2, x2: 3, y2: 4 }).map(h => h.id)).toEqual(['p1', 'p2'])
    expect(a.handlesFor({ type: 'count', color: 'r', x: 50, y: 50, n: 1, size: 10 })).toEqual([{ id: 'se', x: 60, y: 60 }])
    expect(a.handlesFor({ type: 'rect', color: 'r', x: 0, y: 0, w: 10, h: 10 }).map(h => h.id)).toEqual(['nw', 'ne', 'sw', 'se'])
  })
  it('hitShape: lines near the stroke only, boxes inside, topmost wins', () => {
    const a = mk()
    const line: Shape = { type: 'line', color: 'r', x1: 0, y1: 100, x2: 200, y2: 100 }
    const rect: Shape = { type: 'rect', color: 'r', x: 50, y: 50, w: 100, h: 100 }
    a.shapes.push(line)
    expect(a.hitShape(100, 104)).toBe(line)
    expect(a.hitShape(100, 140)).toBeNull()
    a.shapes.push(rect)
    expect(a.hitShape(100, 100)).toBe(rect)       // rect is on top
    expect(a.hitShape(10, 100)).toBe(line)        // outside the rect → the line
    a.selected = rect
    expect(a.hitHandle(150, 150)).toBe('se')
    expect(a.hitHandle(100, 100)).toBeNull()
  })
})

describe('move / resize', () => {
  it('translate re-applies from the original (no drift) and never mutates the original pen points', () => {
    const pen: Shape = { type: 'pen', color: 'r', points: [{ x: 0, y: 0 }, { x: 10, y: 10 }] }
    const orig = cloneShape(pen)
    translateShape(pen, orig, 5, 5)
    translateShape(pen, orig, 7, 3)
    expect((pen as any).points).toEqual([{ x: 7, y: 3 }, { x: 17, y: 13 }])
    expect((orig as any).points).toEqual([{ x: 0, y: 0 }, { x: 10, y: 10 }])
  })
  it('resize: opposite corner stays fixed (rect/circle), pen scales, minimum size enforced', () => {
    const a = mk()
    const rect: Shape = { type: 'rect', color: 'r', x: 10, y: 10, w: 40, h: 40 }
    resizeShape(rect, cloneShape(rect), a.shapeBounds(rect)!, 'nw', 0, 5)
    expect(rect).toMatchObject({ x: 0, y: 5, w: 50, h: 45 })
    const tiny: Shape = { type: 'rect', color: 'r', x: 10, y: 10, w: 40, h: 40 }
    resizeShape(tiny, cloneShape(tiny), a.shapeBounds(tiny)!, 'se', 11, 11)
    expect(tiny).toMatchObject({ w: 4, h: 4 })
    const circle: Shape = { type: 'circle', color: 'r', x: 50, y: 50, rx: 10, ry: 10 }
    resizeShape(circle, cloneShape(circle), a.shapeBounds(circle)!, 'se', 100, 80)
    expect(circle).toMatchObject({ x: 70, y: 60, rx: 30, ry: 20 })
    const pen: Shape = { type: 'pen', color: 'r', points: [{ x: 0, y: 0 }, { x: 10, y: 10 }] }
    resizeShape(pen, cloneShape(pen), a.shapeBounds(pen)!, 'se', 20, 30)
    expect((pen as any).points).toEqual([{ x: 0, y: 0 }, { x: 20, y: 30 }])
  })
  it('resize: text scales its font size, counter its radius (both clamped)', () => {
    const a = mk()
    const text: Shape = { type: 'text', color: 'r', x: 0, y: 0, text: 'Hi', size: 20 }
    resizeShape(text, cloneShape(text), { x: 0, y: 0, w: 30, h: 25 }, 'se', 30, 50)
    expect((text as any).size).toBe(40)
    resizeShape(text, cloneShape({ ...text, size: 20 } as Shape), { x: 0, y: 0, w: 30, h: 25 }, 'se', 30, 1)
    expect((text as any).size).toBe(10)
    const count: Shape = { type: 'count', color: 'r', x: 50, y: 50, n: 2 }
    resizeShape(count, cloneShape(count), a.shapeBounds(count)!, 'se', 80, 70)
    expect((count as any).size).toBe(30)
    expect(count).toMatchObject({ x: 50, y: 50, n: 2 })
  })
})
