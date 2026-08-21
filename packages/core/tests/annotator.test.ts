// packages/core/tests/annotator.test.ts
import { describe, it, expect, vi } from 'vitest'
import { Annotator } from '../src/annotator'
import type { Shape } from '../src/types'

function makeCanvas() {
  return {
    width: 400,
    height: 300,
    getContext: () => ({
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      strokeRect: vi.fn(),
      ellipse: vi.fn(),
      fillText: vi.fn(),
      canvas: { width: 400, height: 300 },
      lineWidth: 0,
      strokeStyle: '',
      fillStyle: '',
      font: '',
      lineCap: '' as CanvasLineCap,
    }),
    toDataURL: (type?: string) => `data:${type ?? 'image/png'};base64,flat`,
  } as unknown as HTMLCanvasElement
}

describe('Annotator', () => {
  it('starts with no shapes', () => {
    const a = new Annotator(makeCanvas(), 'data:image/png;base64,img')
    expect(a.shapes).toHaveLength(0)
  })

  it('addShape increases shape count', () => {
    const a = new Annotator(makeCanvas(), 'data:image/png;base64,img')
    const shape: Shape = { type: 'rect', color: '#ff0000', x: 10, y: 10, w: 50, h: 50 }
    a.addShape(shape)
    expect(a.shapes).toHaveLength(1)
  })

  it('undo removes last shape', () => {
    const a = new Annotator(makeCanvas(), 'data:image/png;base64,img')
    a.addShape({ type: 'rect', color: '#ff0000', x: 0, y: 0, w: 10, h: 10 })
    a.addShape({ type: 'rect', color: '#0000ff', x: 5, y: 5, w: 10, h: 10 })
    a.undo()
    expect(a.shapes).toHaveLength(1)
    expect(a.shapes[0].color).toBe('#ff0000')
  })

  it('clear removes all shapes', () => {
    const a = new Annotator(makeCanvas(), 'data:image/png;base64,img')
    a.addShape({ type: 'rect', color: '#ff0000', x: 0, y: 0, w: 10, h: 10 })
    a.clearAll()
    expect(a.shapes).toHaveLength(0)
  })

  it('accepts a circle shape', () => {
    const a = new Annotator(makeCanvas(), 'data:image/png;base64,img')
    const shape: Shape = { type: 'circle', color: '#ff0000', x: 50, y: 50, rx: 20, ry: 10 }
    a.addShape(shape)
    expect(a.shapes).toHaveLength(1)
    expect(a.shapes[0].type).toBe('circle')
  })

  it('accepts a line shape', () => {
    const a = new Annotator(makeCanvas(), 'data:image/png;base64,img')
    a.addShape({ type: 'line', color: '#ff0000', x1: 1, y1: 2, x2: 3, y2: 4 })
    expect(a.shapes).toHaveLength(1)
    expect(a.shapes[0].type).toBe('line')
  })

  it('accepts a numbered count shape', () => {
    const a = new Annotator(makeCanvas(), 'data:image/png;base64,img')
    a.addShape({ type: 'count', color: '#ff0000', x: 5, y: 6, n: 1 })
    a.addShape({ type: 'count', color: '#ff0000', x: 9, y: 9, n: 2 })
    expect(a.shapes.map(s => s.type)).toEqual(['count', 'count'])
    expect((a.shapes[1] as any).n).toBe(2)
  })

  it('accepts a text shape with size + outline options', () => {
    const a = new Annotator(makeCanvas(), 'data:image/png;base64,img')
    a.addShape({ type: 'text', color: '#ff0000', x: 5, y: 6, text: 'hi', size: 40, outline: 'white' })
    expect(a.shapes).toHaveLength(1)
    const s = a.shapes[0] as any
    expect(s.size).toBe(40)
    expect(s.outline).toBe('white')
  })

  it('computeLineWidth scales with image width', () => {
    const a = new Annotator(makeCanvas(), 'data:image/png;base64,img')
    // canvas.width = 400 → lineWidth = max(3, 400/400) = 3
    expect(a.computeLineWidth()).toBe(3)
  })

  it('strokeScale multiplies the line width (toolbar Width control)', () => {
    // Use a wide canvas so the base width isn't clamped at the min(3) floor, proving the multiply.
    const wide = makeCanvas(); ;(wide as any).width = 4000
    const a = new Annotator(wide, 'data:image/png;base64,img')
    expect(a.strokeScale).toBe(1)          // default = medium
    const base = a.computeLineWidth()       // 4000/400 = 10
    expect(base).toBe(10)
    a.strokeScale = 1.8                      // "L"
    expect(a.computeLineWidth()).toBeCloseTo(18)
    a.strokeScale = 0.6                      // "S"
    expect(a.computeLineWidth()).toBeCloseTo(6)
    a.strokeScale = 2.8                      // "XL"
    expect(a.computeLineWidth()).toBeCloseTo(28)
  })

  it('save returns a data URL', async () => {
    const a = new Annotator(makeCanvas(), 'data:image/png;base64,img')
    const result = await a.save()
    expect(result).toMatch(/^data:/)
  })

  // ── KLAVITYKLA-507: live rubber-band preview must NOT mutate the committed shape history. ──
  it('drawPreview does not commit the provisional shape to history', () => {
    const a = new Annotator(makeCanvas(), 'data:image/png;base64,img')
    a.addShape({ type: 'rect', color: '#ff0000', x: 0, y: 0, w: 5, h: 5 })
    a.drawPreview({ type: 'rect', color: '#0000ff', x: 0, y: 0, w: 99, h: 99 })
    a.drawPreview({ type: 'line', color: '#00ff00', x1: 0, y1: 0, x2: 40, y2: 40 })
    // Two previews drawn, but the history is still just the one committed rect.
    expect(a.shapes).toHaveLength(1)
    expect(a.shapes[0].color).toBe('#ff0000')
  })

  it('drawPreview repaints base + committed + the one provisional shape in a single synchronous pass', () => {
    // Shared context spy + a synchronous-decode Image stub so the base bitmap caches on the first redraw and
    // drawPreview() paints synchronously (the real drag path). We count strokeRect to see committed+preview.
    const strokeRect = vi.fn()
    const drawImage = vi.fn()
    const ctx = {
      clearRect: vi.fn(), drawImage, strokeRect, beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      stroke: vi.fn(), ellipse: vi.fn(), arc: vi.fn(), fill: vi.fn(), fillText: vi.fn(), strokeText: vi.fn(),
      canvas: { width: 400, height: 300 }, lineWidth: 0, strokeStyle: '', fillStyle: '', font: '',
      lineJoin: '' as CanvasLineJoin, lineCap: '' as CanvasLineCap, textAlign: '' as CanvasTextAlign,
      textBaseline: '' as CanvasTextBaseline,
    }
    const canvas = {
      width: 400, height: 300, getContext: () => ctx, toDataURL: () => 'data:image/png;base64,flat',
    } as unknown as HTMLCanvasElement
    const OrigImage = (globalThis as any).Image
    ;(globalThis as any).Image = class {
      onload: (() => void) | null = null
      complete = false
      naturalWidth = 0
      set src(_v: string) { this.complete = true; this.naturalWidth = 400; this.onload && this.onload() }
    }
    try {
      const a = new Annotator(canvas, 'data:image/png;base64,img')
      a.addShape({ type: 'rect', color: '#f00', x: 0, y: 0, w: 5, h: 5 }) // caches base + paints 1 committed rect
      strokeRect.mockClear(); drawImage.mockClear()
      a.drawPreview({ type: 'rect', color: '#00f', x: 0, y: 0, w: 9, h: 9 })
      expect(drawImage).toHaveBeenCalledTimes(1)     // base repainted once
      expect(strokeRect).toHaveBeenCalledTimes(2)    // committed rect + provisional preview rect
      expect(a.shapes).toHaveLength(1)               // preview still not committed
    } finally {
      ;(globalThis as any).Image = OrigImage
    }
  })

  // ── KLAVITYKLA-508: committed text draws from the TOP-LEFT (textBaseline='top') so it lines up with the
  //    editing <input>'s top-left anchor, then restores 'alphabetic' so other shapes are unaffected. ──
  it('draws text with a top baseline and restores alphabetic afterwards', () => {
    let baselineAtFill = ''
    const ctx = {
      clearRect: vi.fn(), drawImage: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(),
      stroke: vi.fn(), strokeRect: vi.fn(), ellipse: vi.fn(), arc: vi.fn(), fill: vi.fn(),
      strokeText: vi.fn(), fillText: vi.fn(function (this: any) { baselineAtFill = ctx.textBaseline }),
      canvas: { width: 400, height: 300 }, lineWidth: 0, strokeStyle: '', fillStyle: '', font: '',
      lineJoin: '' as CanvasLineJoin, lineCap: '' as CanvasLineCap, textAlign: '' as CanvasTextAlign,
      textBaseline: 'alphabetic' as CanvasTextBaseline,
    }
    const canvas = {
      width: 400, height: 300, getContext: () => ctx, toDataURL: () => 'data:image/png;base64,flat',
    } as unknown as HTMLCanvasElement
    const OrigImage = (globalThis as any).Image
    ;(globalThis as any).Image = class {
      onload: (() => void) | null = null
      complete = false
      naturalWidth = 0
      set src(_v: string) { this.complete = true; this.naturalWidth = 400; this.onload && this.onload() }
    }
    try {
      const a = new Annotator(canvas, 'data:image/png;base64,img')
      a.addShape({ type: 'text', color: '#f00', x: 10, y: 20, text: 'hi', size: 26, outline: 'none' })
      expect(baselineAtFill).toBe('top')          // text painted with the top-left baseline
      expect(ctx.textBaseline).toBe('alphabetic') // state restored so later shapes are unaffected
    } finally {
      ;(globalThis as any).Image = OrigImage
    }
  })
})
