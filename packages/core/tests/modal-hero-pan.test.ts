// @vitest-environment jsdom
// KD-3154: the screenshot editor opens with the Select tool (V), and while zoomed in, dragging the image with it
// moves (pans) the image smoothly. Before, Rectangle was the default and the only pan was an undiscoverable
// Shift+drag — a plain drag drew a box even though the cursor showed a grab hand.
import { describe, it, expect } from 'vitest'
import { buildModal } from '../src/modal'

const ok = async () => ({ issueKey: '1', issueUrl: '' })
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const tick = () => new Promise(r => setTimeout(r, 0))

// jsdom has no PointerEvent constructor — a MouseEvent with the pointer type name + pointerId is enough here.
function ptr(type: string, x: number, y: number, extra: Record<string, unknown> = {}) {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, ...(extra as any) })
  Object.defineProperty(e, 'pointerId', { value: 1 })
  return e
}
async function setup() {
  const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
  c.addScreenshot(PNG)
  await tick()
  const tools = c.shadowRoot.getElementById('klavity-hero-tools')!
  const canvas = c.shadowRoot.querySelector('#klavity-hero-stage canvas') as HTMLCanvasElement
  const tool = (name: string) => tools.querySelector(`[data-tool="${name}"]`) as HTMLElement
  const zoomIn = () => (tools.querySelector('#kl-hero-zoomin') as HTMLElement).click()
  const drag = (dx: number, dy: number, extra: Record<string, unknown> = {}) => {
    canvas.dispatchEvent(ptr('pointerdown', 100, 100, extra))
    canvas.dispatchEvent(ptr('pointermove', 100 + dx / 2, 100 + dy / 2, extra))
    canvas.dispatchEvent(ptr('pointermove', 100 + dx, 100 + dy, extra))
    canvas.dispatchEvent(ptr('pointerup', 100 + dx, 100 + dy, extra))
  }
  const pan = () => { const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(canvas.style.transform); return m ? { x: Number(m[1]), y: Number(m[2]) } : null }
  return { c, tools, canvas, tool, zoomIn, drag, pan }
}

describe('KD-3154 Select is the default tool and drags a zoomed-in screenshot', () => {
  it('opens with the Select tool (V) — not Rectangle — and has no separate Pan/hand tool', async () => {
    const { c, tools, tool } = await setup()
    expect(tool('select').classList.contains('kl-on')).toBe(true)
    expect(tool('rect').classList.contains('kl-on')).toBe(false)
    expect(tools.querySelector('[data-tool="hand"]')).toBeNull()
    c.close()
  })

  it('zoomed in, dragging the image with Select moves it by the drag distance', async () => {
    const { c, zoomIn, drag, pan, canvas } = await setup()
    zoomIn()
    expect(canvas.style.transform).toContain('scale(')
    expect(canvas.style.cursor).toBe('grab')
    const before = pan()!
    drag(40, 25)
    const after = pan()!
    expect(after.x - before.x).toBeCloseTo(40)
    expect(after.y - before.y).toBeCloseTo(25)
    expect(canvas.style.cursor).toBe('grab')      // back to grab after the drag ends
    // dragging again continues from where it was left
    drag(-10, 5)
    expect(pan()!.x - after.x).toBeCloseTo(-10)
    c.close()
  })

  it('zooming does not change the selected tool', async () => {
    const { c, tool, zoomIn } = await setup()
    tool('arrow').click()
    zoomIn()
    expect(tool('arrow').classList.contains('kl-on')).toBe(true)
    c.close()
  })

  it('with a drawing tool picked while zoomed, a drag draws (crosshair); Shift / middle-mouse drag still pan', async () => {
    const { c, tool, zoomIn, drag, pan, canvas } = await setup()
    zoomIn()
    tool('rect').click()
    expect(canvas.style.cursor).toBe('crosshair')
    const before = pan()!
    drag(30, 30)                                   // draws — does not move the image
    expect(pan()!.x).toBe(before.x)
    drag(30, 0, { shiftKey: true })
    expect(pan()!.x - before.x).toBeCloseTo(30)
    drag(-20, 0, { button: 1 })
    expect(pan()!.x - before.x).toBeCloseTo(10)
    c.close()
  })

  it('at fit (not zoomed) a Select drag on the image moves nothing', async () => {
    const { c, drag, canvas } = await setup()
    drag(30, 30)
    expect(canvas.style.transform).toBe('')
    expect(canvas.style.cursor).toBe('default')
    c.close()
  })
})
