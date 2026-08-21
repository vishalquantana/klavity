// @vitest-environment jsdom
// #449 — crop is REVERSIBLE. The pre-crop image + markup is preserved and pushed onto the same per-image
// undo history as annotations, so Ctrl+Z / Cmd+Z (and the toolbar Undo) step back through EVERY op —
// draw, crop, draw — down to the original clean image. An explicit "Revert crop" affordance appears after
// a crop and jumps straight back to the pre-crop original.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { buildModal } from '../src/modal'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const CROPPED = 'data:image/png;base64,Q1JPUFBFRA==' // distinct marker for the cropped output
const q = (c: any, sel: string) => c.shadowRoot.querySelector(sel)
const thumbSrc = (c: any) => (q(c, '.klavity-thumb img') as HTMLImageElement).getAttribute('src')
const tick = () => new Promise(r => setTimeout(r, 0))

// A canvas 2D context whose every method is a no-op — enough for redraw()/crop drawImage in headless jsdom.
const ctxStub: any = new Proxy({}, { get: () => () => {} })

let origGetCtx: any, origToDataUrl: any, origGetRect: any, origImage: any

beforeEach(() => {
  origGetCtx = HTMLCanvasElement.prototype.getContext
  origToDataUrl = HTMLCanvasElement.prototype.toDataURL
  origGetRect = HTMLCanvasElement.prototype.getBoundingClientRect
  origImage = (global as any).Image
  HTMLCanvasElement.prototype.getContext = () => ctxStub
  HTMLCanvasElement.prototype.toDataURL = () => CROPPED
  // Fixed 200x200 box so pointer client coords map 1:1 to image pixels (canvas is 200px wide, see FakeImage).
  HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200, x: 0, y: 0, toJSON() {} }) as any
  // jsdom never decodes images; fake one that reports 200x200 and fires onload on the next macrotask so
  // applyHeroCrop's src.onload (and the hero sizer) actually run.
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
})

function ptr(el: Element, type: string, x: number, y: number) {
  el.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }))
}
function selectTool(c: any, tool: string) {
  ;(q(c, `[data-tool="${tool}"]`) as HTMLElement).click()
}
async function drawLine(c: any) {
  const canvas = q(c, '#klavity-hero-stage canvas') as HTMLCanvasElement
  selectTool(c, 'line')
  ptr(canvas, 'pointerdown', 20, 20)
  ptr(canvas, 'pointerup', 120, 120)
  await tick()
}
async function cropRegion(c: any) {
  const canvas = q(c, '#klavity-hero-stage canvas') as HTMLCanvasElement
  selectTool(c, 'crop')
  ptr(canvas, 'pointerdown', 10, 10)
  ptr(canvas, 'pointermove', 150, 150)
  ptr(canvas, 'pointerup', 150, 150)
  await tick() // applyHeroCrop src.onload
  await tick() // updateStrip remount + hero sizer
}
function undo(key: 'ctrl' | 'meta') {
  document.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'z', bubbles: true, [key === 'ctrl' ? 'ctrlKey' : 'metaKey']: true,
  } as any))
}

describe('#449 undoable crop', () => {
  it('a crop swaps in the cropped image and reveals the "Revert crop" affordance', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    c.addScreenshot(PNG)
    await tick()
    expect(thumbSrc(c)).toBe(PNG)
    expect(q(c, '#kl-hero-revert')).toBeNull() // no crop yet → no affordance

    await cropRegion(c)
    expect(thumbSrc(c)).toBe(CROPPED)
    expect(q(c, '#kl-hero-revert')).not.toBeNull()
    c.close()
  })

  it('Ctrl+Z restores the pre-crop original image (crop is reversible, not destructive)', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    c.addScreenshot(PNG)
    await tick()
    await cropRegion(c)
    expect(thumbSrc(c)).toBe(CROPPED)

    undo('ctrl')
    await tick()
    expect(thumbSrc(c)).toBe(PNG) // original preserved + restored
    expect(q(c, '#kl-hero-revert')).toBeNull() // affordance gone once the crop is undone
    c.close()
  })

  it('the explicit "Revert crop" button restores the original', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    c.addScreenshot(PNG)
    await tick()
    await cropRegion(c)
    expect(thumbSrc(c)).toBe(CROPPED)
    ;(q(c, '#kl-hero-revert') as HTMLButtonElement).click()
    await tick()
    expect(thumbSrc(c)).toBe(PNG)
    c.close()
  })

  it('Cmd+Z (metaKey) also undoes a crop', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    c.addScreenshot(PNG)
    await tick()
    await cropRegion(c)
    expect(thumbSrc(c)).toBe(CROPPED)
    undo('meta')
    await tick()
    expect(thumbSrc(c)).toBe(PNG)
    c.close()
  })

  it('draw → crop → draw undoes in reverse, one step at a time, down to the original clean image', async () => {
    let submitted: any = null
    const c = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async (p: any) => { submitted = p; return { issueKey: '1', issueUrl: '' } },
    })
    c.addScreenshot(PNG)
    await tick()

    await drawLine(c)          // op1: draw on the ORIGINAL image
    await cropRegion(c)        // op2: crop  (pre-crop image + markup preserved)
    await drawLine(c)          // op3: draw on the CROPPED image
    expect(thumbSrc(c)).toBe(CROPPED)
    expect(q(c, '#kl-hero-revert')).not.toBeNull()

    // Step back through the unified history:
    undo('ctrl'); await tick() // undo op3 (draw) → still the cropped image
    expect(thumbSrc(c)).toBe(CROPPED)
    expect(q(c, '#kl-hero-revert')).not.toBeNull()

    undo('ctrl'); await tick() // undo op2 (crop) → back to the ORIGINAL image
    expect(thumbSrc(c)).toBe(PNG)
    expect(q(c, '#kl-hero-revert')).toBeNull()

    undo('ctrl'); await tick() // undo op1 (draw) → clean original, no markup
    expect(thumbSrc(c)).toBe(PNG)

    // Nothing left — a further undo is a no-op.
    undo('ctrl'); await tick()
    expect(thumbSrc(c)).toBe(PNG)

    // Prove the markup is gone too: submit and inspect the payload.
    ;(q(c, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    expect(submitted).not.toBeNull()
    expect(submitted.screenshots[0]).toBe(PNG)     // original clean image travels
    expect(submitted.annotations).toBeNull()       // no annotations remain
  })
})
