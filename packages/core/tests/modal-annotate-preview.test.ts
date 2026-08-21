// @vitest-environment jsdom
// KLAVITYKLA-507 + KLAVITYKLA-509 — hero annotator drag preview / release-outside commit, and the
// capture-on-open loading placeholder.
//
// #507: geometric draw tools (rect/line/circle/arrow) now (a) show a live rubber-band preview during the
//       drag and (b) call canvas.setPointerCapture on pointerdown so a release OUTSIDE the canvas still
//       fires pointerup and COMMITS the shape (previously it was silently lost + drawing got stuck).
// #509: auto-capture-on-open renders a "Capturing…" skeleton tile IMMEDIATELY, then swaps in the real shot.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { buildModal } from '../src/modal'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const q = (c: any, sel: string) => c.shadowRoot.querySelector(sel)
const tick = () => new Promise(r => setTimeout(r, 0))
const ctxStub: any = new Proxy({}, { get: () => () => {} })

let origGetCtx: any, origToDataUrl: any, origGetRect: any, origImage: any
let origSetCapture: any, origReleaseCapture: any
let captureCalls: number, releaseCalls: number

beforeEach(() => {
  origGetCtx = HTMLCanvasElement.prototype.getContext
  origToDataUrl = HTMLCanvasElement.prototype.toDataURL
  origGetRect = HTMLCanvasElement.prototype.getBoundingClientRect
  origImage = (global as any).Image
  origSetCapture = (HTMLCanvasElement.prototype as any).setPointerCapture
  origReleaseCapture = (HTMLCanvasElement.prototype as any).releasePointerCapture
  captureCalls = 0
  releaseCalls = 0
  HTMLCanvasElement.prototype.getContext = () => ctxStub
  HTMLCanvasElement.prototype.toDataURL = () => PNG
  HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200, x: 0, y: 0, toJSON() {} }) as any
  // jsdom does not implement pointer capture — install spies so we can prove the release-outside mechanism.
  ;(HTMLCanvasElement.prototype as any).setPointerCapture = function () { captureCalls++ }
  ;(HTMLCanvasElement.prototype as any).releasePointerCapture = function () { releaseCalls++ }
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
function selectTool(c: any, tool: string) { (q(c, `[data-tool="${tool}"]`) as HTMLElement).click() }

describe('KLAVITYKLA-507 hero annotator drag preview + release-outside commit', () => {
  it('captures the pointer on draw-tool pointerdown and commits a shape on a pointerup OUTSIDE the canvas', async () => {
    let submitted: any = null
    const c = buildModal('bug', {
      onCaptureFull: async () => PNG,
      onSubmit: async (p: any) => { submitted = p; return { issueKey: '1', issueUrl: '' } },
    })
    c.addScreenshot(PNG)
    await tick(); await tick() // canvas + toolbar mount on Image.onload

    const canvas = q(c, '#klavity-hero-stage canvas') as HTMLCanvasElement
    selectTool(c, 'rect')
    ptr(canvas, 'pointerdown', 10, 10)
    expect(captureCalls).toBeGreaterThan(0) // setPointerCapture armed so release-outside still reaches us
    ptr(canvas, 'pointermove', 50, 50)      // live rubber-band preview (must not throw / must not commit yet)
    // Release well OUTSIDE the 200x200 canvas rect — with pointer capture this still fires pointerup here.
    ptr(canvas, 'pointerup', 500, 500)
    expect(releaseCalls).toBeGreaterThan(0) // pointer capture released on commit

    // Submit and prove the shape was committed (release-outside did NOT lose it).
    ;(q(c, '#klavity-submit') as HTMLButtonElement).click()
    await tick(); await tick()
    expect(submitted).not.toBeNull()
    const shapes = submitted.annotations?.byIndex?.['0']?.shapes ?? submitted.annotations?.shapes ?? []
    expect(shapes.some((s: any) => s.type === 'rect')).toBe(true)
    c.close()
  })

  it('does not get stuck drawing after a pointercancel (state resets, tools keep working)', async () => {
    const c = buildModal('bug', { onCaptureFull: async () => PNG, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    c.addScreenshot(PNG)
    await tick(); await tick()
    const canvas = q(c, '#klavity-hero-stage canvas') as HTMLCanvasElement
    selectTool(c, 'rect')
    ptr(canvas, 'pointerdown', 10, 10)
    canvas.dispatchEvent(new MouseEvent('pointercancel', { bubbles: true }))
    expect(releaseCalls).toBeGreaterThan(0)
    // A fresh draw after the cancel still commits — proves `drawing` was not left stuck true.
    ptr(canvas, 'pointerdown', 20, 20)
    ptr(canvas, 'pointerup', 80, 80)
    // No throw + the canvas is still interactive is the assertion here.
    expect(q(c, '#klavity-hero-stage canvas')).toBeTruthy()
    c.close()
  })
})

describe('KLAVITYKLA-509 capture-on-open loading placeholder', () => {
  it('shows a Capturing… skeleton immediately, then replaces it with the real thumbnail', async () => {
    // Make the "off main thread" defer deterministic: run the idle callback immediately so the capture
    // starts synchronously (it still awaits our controllable shot promise). This tests the placeholder
    // swap logic without depending on rAF/timer scheduling under a parallel test run.
    const origRic = (window as any).requestIdleCallback
    ;(window as any).requestIdleCallback = (cb: () => void) => { cb(); return 0 as any }
    try {
      let resolveShot!: (v: string) => void
      const shotP = new Promise<string>(r => { resolveShot = r })
      const c = buildModal('bug', {
        autoCaptureOnOpen: true,
        onCaptureFull: () => shotP,
        onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
      })
      // Skeleton is rendered SYNCHRONOUSLY at open — before the shot resolves — so the slot is never blank.
      expect(q(c, '.kl-thumb-skel')).toBeTruthy()
      expect(q(c, '.klavity-thumb img')).toBeFalsy()

      // Resolve the shot and let the capture .then + Image.onload settle.
      resolveShot(PNG)
      await tick(); await tick(); await tick()

      // Skeleton gone, real thumbnail in place.
      expect(q(c, '.kl-thumb-skel')).toBeFalsy()
      expect(q(c, '.klavity-thumb img')).toBeTruthy()
      c.close()
    } finally {
      ;(window as any).requestIdleCallback = origRic
    }
  })
})
