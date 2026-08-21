// @vitest-environment jsdom
// #466 — crop undo split-brain. The hero (doc-level Ctrl/Cmd+Z) and the fullscreen markup editor used to
// keep SEPARATE undo state + both had a live keydown handler, so: crop -> open the pencil editor -> draw ->
// Ctrl/Cmd+Z silently reverted the CROP (not the edit) and "Revert crop" could no longer restore. The fix:
// ONE unified per-image undo/crop history, the fullscreen editor pushes its save onto it, exactly one active
// keydown handler (the hero's is detached while the editor is open), and the editor never clobbers the crop.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { buildModal } from '../src/modal'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const CROPPED = 'data:image/png;base64,Q1JPUFBFRA==' // distinct marker for the cropped output
const q = (c: any, sel: string) => c.shadowRoot.querySelector(sel)
const thumbSrc = (c: any) => (q(c, '.klavity-thumb img') as HTMLImageElement).getAttribute('src')
const tick = () => new Promise(r => setTimeout(r, 0))
const ctxStub: any = new Proxy({}, { get: () => () => {} })

let origGetCtx: any, origToDataUrl: any, origGetRect: any, origImage: any

beforeEach(() => {
  origGetCtx = HTMLCanvasElement.prototype.getContext
  origToDataUrl = HTMLCanvasElement.prototype.toDataURL
  origGetRect = HTMLCanvasElement.prototype.getBoundingClientRect
  origImage = (global as any).Image
  HTMLCanvasElement.prototype.getContext = () => ctxStub
  HTMLCanvasElement.prototype.toDataURL = () => CROPPED
  HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200, x: 0, y: 0, toJSON() {} }) as any
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
function selectTool(c: any, tool: string) { (q(c, `[data-tool="${tool}"]`) as HTMLElement).click() }
async function cropRegion(c: any) {
  const canvas = q(c, '#klavity-hero-stage canvas') as HTMLCanvasElement
  selectTool(c, 'crop')
  ptr(canvas, 'pointerdown', 10, 10)
  ptr(canvas, 'pointermove', 150, 150)
  ptr(canvas, 'pointerup', 150, 150)
  await tick(); await tick()
}
function undo(key: 'ctrl' | 'meta') {
  document.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'z', bubbles: true, [key === 'ctrl' ? 'ctrlKey' : 'metaKey']: true,
  } as any))
}
// Open the fullscreen markup editor from the thumbnail pencil, draw one rect, and Save.
async function editAndSave(c: any) {
  ;(q(c, '.klavity-mk') as HTMLButtonElement).click()
  await tick() // img.onload builds the editor
  const editor = (q(c, '.kl-edtb') as HTMLElement).parentElement as HTMLElement
  const canvas = editor.querySelector('canvas') as HTMLCanvasElement
  // Default editor tool is 'rect' — pointerdown/up adds a rectangle shape.
  ptr(canvas, 'pointerdown', 20, 20)
  ptr(canvas, 'pointerup', 90, 90)
  ;(editor.querySelector('#klavity-save-ann') as HTMLButtonElement).click()
  await tick(); await tick()
}

describe('#466 unified undo across hero + fullscreen editor', () => {
  it('crop -> edit -> Ctrl+Z undoes the EDIT, not the crop; Revert crop still restores', async () => {
    let submitted: any = null
    const c = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async (p: any) => { submitted = p; return { issueKey: '1', issueUrl: '' } },
    })
    c.addScreenshot(PNG)
    await tick()

    await cropRegion(c)
    expect(thumbSrc(c)).toBe(CROPPED)
    expect(q(c, '#kl-hero-revert')).not.toBeNull()

    await editAndSave(c)
    expect(thumbSrc(c)).toBe(CROPPED)           // the edit keeps the cropped image
    expect(q(c, '#kl-hero-revert')).not.toBeNull() // crop history intact

    // The KEY assertion: undo steps back the EDIT and the image STAYS cropped (pre-fix this reverted the crop).
    undo('ctrl'); await tick()
    expect(thumbSrc(c)).toBe(CROPPED)
    expect(q(c, '#kl-hero-revert')).not.toBeNull() // crop is NOT clobbered by the editor

    // "Revert crop" still works after the edit round-trip.
    ;(q(c, '#kl-hero-revert') as HTMLButtonElement).click()
    await tick()
    expect(thumbSrc(c)).toBe(PNG)

    // And the undone edit's annotations are gone from the submitted payload.
    ;(q(c, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    expect(submitted).not.toBeNull()
    expect(submitted.annotations).toBeNull()
  })

  it('Cmd+Z (metaKey) after an edit also undoes the edit, leaving the crop intact', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    c.addScreenshot(PNG)
    await tick()
    await cropRegion(c)
    await editAndSave(c)
    undo('meta'); await tick()
    expect(thumbSrc(c)).toBe(CROPPED)
    expect(q(c, '#kl-hero-revert')).not.toBeNull()
    c.close()
  })
})
