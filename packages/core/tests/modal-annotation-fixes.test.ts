// @vitest-environment jsdom
// KLA-593 — annotation editor fixes:
//   BUG 0 (functional): the Text tool couldn't type. Clicking to place a caret created an <input> and focused
//     it SYNCHRONOUSLY inside pointerdown; the browser's default mousedown focus-shift then blurred + removed
//     the empty input before any character landed, so letter keys fell through to the single-key tool
//     shortcuts. Focus is now deferred (requestAnimationFrame) so the input survives + focuses, and the
//     document-level tool-hotkey handler additionally bails whenever a text input is open.
//   Polish: a Pixelate/redact brush tool (drag a region → mosaic baked into the image), a "Mask numbers"
//     toggle relocated to the top of the editing toolbar, and thicker default arrow/line strokes.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { buildModal } from '../src/modal'
import { Annotator } from '../src/annotator'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const q = (c: any, sel: string) => c.shadowRoot.querySelector(sel)
const tick = () => new Promise(r => setTimeout(r, 0))
const raf = () => new Promise(r => requestAnimationFrame(() => r(null)))
const ctxStub: any = new Proxy({}, { get: () => () => {} })

let origGetCtx: any, origToDataUrl: any, origGetRect: any, origImage: any
let origSetCapture: any, origReleaseCapture: any

beforeEach(() => {
  origGetCtx = HTMLCanvasElement.prototype.getContext
  origToDataUrl = HTMLCanvasElement.prototype.toDataURL
  origGetRect = HTMLCanvasElement.prototype.getBoundingClientRect
  origImage = (global as any).Image
  origSetCapture = (HTMLCanvasElement.prototype as any).setPointerCapture
  origReleaseCapture = (HTMLCanvasElement.prototype as any).releasePointerCapture
  HTMLCanvasElement.prototype.getContext = () => ctxStub
  HTMLCanvasElement.prototype.toDataURL = () => PNG
  HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200, x: 0, y: 0, toJSON() {} }) as any
  ;(HTMLCanvasElement.prototype as any).setPointerCapture = function () {}
  ;(HTMLCanvasElement.prototype as any).releasePointerCapture = function () {}
  class FakeImage {
    onload: null | (() => void) = null
    naturalWidth = 200
    naturalHeight = 200
    private _src = ''
    set src(v: string) { this._src = v; setTimeout(() => this.onload && this.onload(), 0) }
    get src() { return this._src }
  }
  ;(global as any).Image = FakeImage as any
})

afterEach(() => {
  HTMLCanvasElement.prototype.getContext = origGetCtx
  HTMLCanvasElement.prototype.toDataURL = origToDataUrl
  HTMLCanvasElement.prototype.getBoundingClientRect = origGetRect
  ;(global as any).Image = origImage
  ;(HTMLCanvasElement.prototype as any).setPointerCapture = origSetCapture
  ;(HTMLCanvasElement.prototype as any).releasePointerCapture = origReleaseCapture
})

function ptr(el: Element, type: string, x: number, y: number) {
  el.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }))
}
const selectTool = (c: any, tool: string) => (q(c, `[data-tool="${tool}"]`) as HTMLElement).click()
const isOn = (c: any, tool: string) => (q(c, `[data-tool="${tool}"]`) as HTMLElement).classList.contains('kl-on')

async function mountWithShot(onSubmit: any) {
  const c = buildModal('bug', { onCaptureFull: async () => PNG, onSubmit })
  c.addScreenshot(PNG)
  await tick(); await tick() // canvas + toolbar mount on Image.onload
  return c
}

describe('KLA-593 BUG 0 — Text tool can type', () => {
  it('creates a text input on click, keeps + focuses it (deferred focus), and does NOT remove it', async () => {
    const c = await mountWithShot(async () => ({ issueKey: '1', issueUrl: '' }))
    const canvas = q(c, '#klavity-hero-stage canvas') as HTMLCanvasElement
    selectTool(c, 'text')
    ptr(canvas, 'pointerdown', 30, 30)
    const input = document.querySelector('body > input') as HTMLInputElement | null
    expect(input).toBeTruthy()
    await raf() // deferred focus fires here
    // The input must still exist (the old bug removed it synchronously) and now hold focus.
    expect(document.body.contains(input!)).toBe(true)
    expect(document.activeElement).toBe(input)
    input!.remove()
    c.close()
  })

  it('does NOT switch tools while typing letter keys into the text input (t/l/r/o/c/k/p/b stay text)', async () => {
    const c = await mountWithShot(async () => ({ issueKey: '1', issueUrl: '' }))
    const canvas = q(c, '#klavity-hero-stage canvas') as HTMLCanvasElement
    selectTool(c, 'text')
    ptr(canvas, 'pointerdown', 30, 30)
    const input = document.querySelector('body > input') as HTMLInputElement
    await raf()
    // Every letter that doubles as a tool hotkey must be ignored by the capture-phase tool handler while the
    // text input is open — dispatch each from the input (its composedPath) and assert the tool stays 'text'.
    for (const k of ['t', 'l', 'r', 'o', 'c', 'k', 'p', 'b']) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true } as any))
      input.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true } as any))
    }
    expect(isOn(c, 'text')).toBe(true)
    expect(isOn(c, 'rect')).toBe(false)
    expect(isOn(c, 'pixelate')).toBe(false)
    input.remove()
    c.close()
  })

  it('commits the typed text verbatim as a text shape', async () => {
    let submitted: any = null
    const c = await mountWithShot(async (p: any) => { submitted = p; return { issueKey: '1', issueUrl: '' } })
    const canvas = q(c, '#klavity-hero-stage canvas') as HTMLCanvasElement
    selectTool(c, 'text')
    ptr(canvas, 'pointerdown', 30, 30)
    const input = document.querySelector('body > input') as HTMLInputElement
    await raf()
    input.value = 'Test 123'
    input.dispatchEvent(new Event('blur'))
    ;(q(c, '#klavity-submit') as HTMLButtonElement).click()
    await tick(); await tick()
    const shapes = submitted.annotations?.byIndex?.['0']?.shapes ?? submitted.annotations?.shapes ?? []
    const text = shapes.find((s: any) => s.type === 'text')
    expect(text).toBeTruthy()
    expect(text.text).toBe('Test 123')
    c.close()
  })
})

describe('KLA-593 polish — pixelate/redact tool', () => {
  it('has a pixelate tool selectable by the B hotkey and commits a pixelate shape on drag', async () => {
    let submitted: any = null
    const c = await mountWithShot(async (p: any) => { submitted = p; return { issueKey: '1', issueUrl: '' } })
    expect(q(c, '[data-tool="pixelate"]')).toBeTruthy()
    const canvas = q(c, '#klavity-hero-stage canvas') as HTMLCanvasElement
    // 'b' selects pixelate via the single-key tool handler (no text input open).
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true, composed: true } as any))
    expect(isOn(c, 'pixelate')).toBe(true)
    ptr(canvas, 'pointerdown', 10, 10)
    ptr(canvas, 'pointermove', 80, 80)
    ptr(canvas, 'pointerup', 90, 90)
    ;(q(c, '#klavity-submit') as HTMLButtonElement).click()
    await tick(); await tick()
    const shapes = submitted.annotations?.byIndex?.['0']?.shapes ?? submitted.annotations?.shapes ?? []
    expect(shapes.some((s: any) => s.type === 'pixelate')).toBe(true)
    c.close()
  })
})

describe('KLA-593 polish — Mask numbers moved to editing toolbar', () => {
  it('renders the Mask numbers checkbox in the hero editing toolbar (not the capture panel)', async () => {
    const c = await mountWithShot(async () => ({ issueKey: '1', issueUrl: '' }))
    const heroTools = q(c, '#klavity-hero-tools')
    expect(heroTools.querySelector('.kl-hmask-cb')).toBeTruthy()
    // The old capture-panel checkbox is gone.
    expect(c.shadowRoot.getElementById('klavity-mask-numbers')).toBeFalsy()
    c.close()
  })
})

describe('KLA-593 polish — thicker default arrow/line stroke', () => {
  it('draws arrows and lines thicker than rectangles at the same stroke setting', () => {
    // Recording 2D context: capture the lineWidth in effect at each stroke()/strokeRect().
    const widths: Record<string, number> = {}
    let cur = 0
    const rec: any = new Proxy({}, {
      get(_t, p) {
        if (p === 'lineWidth') return cur
        if (p === 'measureText') return () => ({ width: 10 })
        return (..._a: any[]) => {}
      },
      set(_t, p, v) { if (p === 'lineWidth') cur = v as number; return true },
    })
    const canvas: any = { width: 400, height: 400, getContext: () => rec }
    const capture = (tool: string, shape: any) => {
      const a = new Annotator(canvas, PNG)
      ;(a as any).baseImg = { complete: true, naturalWidth: 400 }
      ;(a as any).drawShape(rec, shape)
      widths[tool] = cur
    }
    capture('rect', { type: 'rect', color: '#f00', x: 0, y: 0, w: 50, h: 50 })
    capture('arrow', { type: 'arrow', color: '#f00', x1: 0, y1: 0, x2: 80, y2: 80 })
    capture('line', { type: 'line', color: '#f00', x1: 0, y1: 0, x2: 80, y2: 0 })
    expect(widths.arrow).toBeGreaterThan(widths.rect)
    expect(widths.line).toBeGreaterThan(widths.rect)
  })

  it('pixelate draw routine does not throw on a stubbed context', () => {
    const a = new Annotator({ width: 100, height: 100, getContext: () => ctxStub } as any, PNG)
    expect(() => (a as any).drawShape(ctxStub, { type: 'pixelate', x: 5, y: 5, w: 40, h: 40 })).not.toThrow()
  })
})
