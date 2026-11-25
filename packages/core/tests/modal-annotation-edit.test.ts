// @vitest-environment jsdom
// Screenshot annotation ticket: tool order, larger tool icons, Select tool (move / resize / recolour /
// restroke / delete added annotations), and Undo + Redo at the top-right of the Screenshot tab.
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { buildModal } from '../src/modal'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const ok = async () => ({ issueKey: '1', issueUrl: '' })
const tick = () => new Promise(r => setTimeout(r, 0))
const ctxStub: any = new Proxy({}, { get: () => () => {} })
let origGetCtx: any, origGetRect: any, origImage: any

beforeEach(() => {
  origGetCtx = HTMLCanvasElement.prototype.getContext
  origGetRect = HTMLCanvasElement.prototype.getBoundingClientRect
  origImage = (global as any).Image
  HTMLCanvasElement.prototype.getContext = () => ctxStub
  // 200×200 image shown at 200×200 → client coords == image coords.
  HTMLCanvasElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, right: 200, bottom: 200, width: 200, height: 200, x: 0, y: 0, toJSON() {} }) as any
  class FakeImage {
    onload: null | (() => void) = null
    naturalWidth = 200; naturalHeight = 200
    private _src = ''
    set src(v: string) { this._src = v; setTimeout(() => this.onload && this.onload(), 0) }
    get src() { return this._src }
  }
  ;(global as any).Image = FakeImage as any
})
afterEach(() => {
  HTMLCanvasElement.prototype.getContext = origGetCtx
  HTMLCanvasElement.prototype.getBoundingClientRect = origGetRect
  ;(global as any).Image = origImage
})

const q = (c: any, sel: string) => c.shadowRoot.querySelector(sel)
const canvasOf = (c: any) => q(c, '#klavity-hero-stage canvas') as HTMLCanvasElement
const ptr = (el: Element, type: string, x: number, y: number) => el.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }))
const tool = (c: any, t: string) => (q(c, `[data-tool="${t}"]`) as HTMLElement).click()
const key = (k: string, mods: Record<string, boolean> = {}) => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, ...mods } as any))
function drag(c: any, x1: number, y1: number, x2: number, y2: number) {
  const cv = canvasOf(c)
  ptr(cv, 'pointerdown', x1, y1); ptr(cv, 'pointermove', (x1 + x2) / 2, (y1 + y2) / 2); ptr(cv, 'pointermove', x2, y2); ptr(cv, 'pointerup', x2, y2)
}

async function open() {
  let last: any = null
  const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok, onAnnotationsChanged: (_i: number, a: any) => { last = a } } as any)
  c.addScreenshot(PNG)
  await tick(); await tick()
  return { c, shapes: () => (last?.shapes ?? []) as any[] }
}

describe('annotation toolbar', () => {
  it('shows the tools in the specified order, with larger icons and the Counter / Pencil labels', async () => {
    const { c } = await open()
    const order = [...c.shadowRoot.querySelectorAll('#klavity-hero-tools [data-tool]')].map((b: any) => b.dataset.tool)
    expect(order).toEqual(['select', 'rect', 'arrow', 'text', 'count', 'pen', 'line', 'circle', 'pixelate', 'crop'])
    expect(q(c, '[data-tool="count"]').getAttribute('aria-label')).toBe('Counter')
    expect(q(c, '[data-tool="pen"]').getAttribute('aria-label')).toBe('Pencil')
    for (const t of ['rect', 'arrow', 'text', 'count', 'pen', 'line', 'circle']) expect(q(c, `[data-tool="${t}"] svg`).getAttribute('width')).toBe('20')
    expect(q(c, '[data-tool="select"]').classList.contains('kl-on')).toBe(true)  // KD-3154: Select (V) is the default tool
    c.close()
  })

  it('puts Undo + Redo at the top-right, disabled until there is something to undo / redo', async () => {
    const { c } = await open()
    // Undo / Redo / Clear sit at the end of the TOP row (right after the tools, pushed right by .kl-hgrow),
    // followed by the row break — colours / stroke / zoom start the second row.
    const hist = q(c, '#klavity-hero-tools .kl-hhist') as HTMLElement
    expect([...hist.querySelectorAll('button')].map(b => b.id)).toEqual(['kl-hero-undo', 'kl-hero-redo', 'kl-hero-clear'])
    expect((hist.previousElementSibling as HTMLElement).classList.contains('kl-hgrow')).toBe(true)
    expect((hist.nextElementSibling as HTMLElement).classList.contains('kl-hbreak')).toBe(true)
    expect(hist.compareDocumentPosition(q(c, '[data-tool="crop"]')) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
    expect(hist.compareDocumentPosition(q(c, '.kl-hcolors')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect((q(c, '#kl-hero-undo') as HTMLButtonElement).disabled).toBe(true)
    expect((q(c, '#kl-hero-redo') as HTMLButtonElement).disabled).toBe(true)
    c.close()
  })
})

describe('undo / redo', () => {
  it('undo reverts the last annotation, redo restores it; a new annotation clears redo', async () => {
    const { c, shapes } = await open()
    tool(c, 'count')
    ptr(canvasOf(c), 'pointerdown', 50, 50)
    expect(shapes().map(s => s.type)).toEqual(['count'])
    expect((q(c, '#kl-hero-undo') as HTMLButtonElement).disabled).toBe(false)

    ;(q(c, '#kl-hero-undo') as HTMLButtonElement).click(); await tick(); await tick()
    expect(shapes()).toEqual([])
    expect((q(c, '#kl-hero-redo') as HTMLButtonElement).disabled).toBe(false)

    ;(q(c, '#kl-hero-redo') as HTMLButtonElement).click(); await tick(); await tick()
    expect(shapes().map(s => s.type)).toEqual(['count'])
    expect((q(c, '#kl-hero-redo') as HTMLButtonElement).disabled).toBe(true)

    // keyboard: Ctrl+Z then Ctrl+Y / Ctrl+Shift+Z
    key('z', { ctrlKey: true }); await tick(); await tick()
    expect(shapes()).toEqual([])
    key('y', { ctrlKey: true }); await tick(); await tick()
    expect(shapes().length).toBe(1)
    key('z', { metaKey: true }); await tick(); await tick()
    key('z', { metaKey: true, shiftKey: true }); await tick(); await tick()
    expect(shapes().length).toBe(1)

    // undo, then draw something new → redo is no longer possible
    key('z', { ctrlKey: true }); await tick(); await tick()
    tool(c, 'rect'); drag(c, 10, 10, 60, 60)
    expect((q(c, '#kl-hero-redo') as HTMLButtonElement).disabled).toBe(true)
    c.close()
  })

  it('works for every annotation tool', async () => {
    const { c, shapes } = await open()
    for (const t of ['rect', 'arrow', 'line', 'circle', 'pen']) { tool(c, t); drag(c, 20, 20, 120, 120) }
    tool(c, 'count'); ptr(canvasOf(c), 'pointerdown', 150, 150)
    expect(shapes().map(s => s.type)).toEqual(['rect', 'arrow', 'line', 'circle', 'pen', 'count'])
    for (let i = 6; i > 0; i--) { key('z', { ctrlKey: true }); await tick(); await tick(); expect(shapes().length).toBe(i - 1) }
    for (let i = 1; i <= 6; i++) { key('y', { ctrlKey: true }); await tick(); await tick(); expect(shapes().length).toBe(i) }
    c.close()
  })
})

describe('edit added annotations (Select tool)', () => {
  it('moves a shape by dragging it, as one undo step', async () => {
    const { c, shapes } = await open()
    tool(c, 'rect'); drag(c, 20, 20, 80, 80)
    tool(c, 'select'); drag(c, 50, 50, 70, 90)
    expect(shapes()[0]).toMatchObject({ type: 'rect', x: 40, y: 60, w: 60, h: 60 })
    key('z', { ctrlKey: true }); await tick(); await tick()
    expect(shapes()[0]).toMatchObject({ x: 20, y: 20 })
    c.close()
  })

  it('resizes from a corner handle; drags line endpoints', async () => {
    const { c, shapes } = await open()
    tool(c, 'rect'); drag(c, 20, 20, 80, 80)
    tool(c, 'select'); ptr(canvasOf(c), 'pointerdown', 50, 50); ptr(canvasOf(c), 'pointerup', 50, 50) // select it
    drag(c, 80, 80, 120, 140)                                                                          // bottom-right handle
    expect(shapes()[0]).toMatchObject({ x: 20, y: 20, w: 100, h: 120 })

    tool(c, 'line'); drag(c, 150, 20, 190, 60)
    tool(c, 'select'); ptr(canvasOf(c), 'pointerdown', 170, 40); ptr(canvasOf(c), 'pointerup', 170, 40)
    drag(c, 190, 60, 160, 180)
    expect(shapes()[1]).toMatchObject({ type: 'line', x1: 150, y1: 20, x2: 160, y2: 180 })
    c.close()
  })

  it('recolours the selected annotation (incl. a counter badge) and changes its stroke', async () => {
    const { c, shapes } = await open()
    tool(c, 'count'); ptr(canvasOf(c), 'pointerdown', 100, 100)
    tool(c, 'select'); ptr(canvasOf(c), 'pointerdown', 100, 100); ptr(canvasOf(c), 'pointerup', 100, 100)
    ;(q(c, '[data-color="#16a34a"]') as HTMLElement).click()
    expect(shapes()[0]).toMatchObject({ type: 'count', color: '#16a34a' })

    tool(c, 'rect'); drag(c, 10, 10, 50, 50)
    expect(shapes()[1].sw).toBe(1)                      // new shapes record their stroke
    tool(c, 'select'); ptr(canvasOf(c), 'pointerdown', 30, 30); ptr(canvasOf(c), 'pointerup', 30, 30)
    ;(q(c, '[data-stroke="2.8"]') as HTMLElement).click()
    expect(shapes()[1].sw).toBe(2.8)
    ;(q(c, '[data-color="#3b82f6"]') as HTMLElement).click()
    expect(shapes()[1].color).toBe('#3b82f6')
    expect(shapes()[0].color).toBe('#16a34a')            // only the selected one changed
    c.close()
  })

  it('a plain click to select adds no undo step; Delete removes the selection; Escape deselects', async () => {
    const { c, shapes } = await open()
    tool(c, 'rect'); drag(c, 20, 20, 80, 80)
    tool(c, 'select'); ptr(canvasOf(c), 'pointerdown', 50, 50); ptr(canvasOf(c), 'pointerup', 50, 50)
    key('Escape')
    key('Delete')                                        // nothing selected → nothing deleted
    expect(shapes().length).toBe(1)
    ptr(canvasOf(c), 'pointerdown', 50, 50); ptr(canvasOf(c), 'pointerup', 50, 50)
    key('Delete')
    expect(shapes()).toEqual([])
    key('z', { ctrlKey: true }); await tick(); await tick()
    expect(shapes().length).toBe(1)                      // the delete was the only step after drawing
    key('z', { ctrlKey: true }); await tick(); await tick()
    expect(shapes()).toEqual([])
    c.close()
  })
})
