// @vitest-environment jsdom
// KLA-621 (latency): clicking "Region" must show the selection overlay INSTANTLY — no upfront page capture /
// html-to-image render before the selector appears (that was the ~3s lag). The capture runs ONLY after the
// reporter drags a rectangle, cropped to that selection. These tests assert the overlay mounts synchronously
// on click and onRegionCapture is NOT invoked until a drag completes.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildModal } from '../src/modal'

afterEach(() => {
  // Region overlays mount on document.body (outside the modal host); scrub them so tests don't cross-talk.
  document.querySelectorAll('[data-klavity-region-overlay]').forEach((n) => n.remove())
})

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const tick = () => new Promise(r => setTimeout(r, 0))

function build() {
  const regionSpy = vi.fn(async () => ({ dataUrl: PNG, quality: 'real-pixel' as const }))
  const c = buildModal('bug', {
    onCaptureFull: async () => ({ dataUrl: PNG, quality: 'rendered' as const }),
    onRegionCapture: regionSpy,
    onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
  })
  return { c, regionSpy }
}

describe('KLA-621 Region overlay shows instantly (no upfront capture)', () => {
  it('mounts the selection overlay SYNCHRONOUSLY on click and does NOT capture before a drag', () => {
    const { c, regionSpy } = build()
    ;(c.shadowRoot.querySelector('#klavity-region') as HTMLButtonElement).click()
    // Overlay is in the DOM on the SAME tick as the click — no await, no capture first.
    const overlay = document.querySelector('[data-klavity-region-overlay]')
    expect(overlay).not.toBeNull()
    expect(regionSpy).not.toHaveBeenCalled() // capture is deferred until the reporter selects an area
    c.close()
  })

  it('captures ONLY after a drag completes, cropped to the dragged rectangle', async () => {
    const { c, regionSpy } = build()
    ;(c.shadowRoot.querySelector('#klavity-region') as HTMLButtonElement).click()
    const overlay = document.querySelector('[data-klavity-region-overlay]') as HTMLElement
    expect(regionSpy).not.toHaveBeenCalled()
    // Drag a rectangle (pointerdown → pointerup) — NOW the capture fires, with the selection rect.
    // jsdom's PointerEvent ignores clientX/Y in the ctor, so set them explicitly on each event.
    const pointer = (type: string, x: number, y: number) => {
      const ev = new Event(type, { bubbles: true }) as any
      ev.clientX = x; ev.clientY = y
      return ev
    }
    overlay.dispatchEvent(pointer('pointerdown', 100, 120))
    overlay.dispatchEvent(pointer('pointerup', 400, 320))
    await tick()
    expect(regionSpy).toHaveBeenCalledTimes(1)
    expect(regionSpy.mock.calls[0][0]).toEqual({ x: 100, y: 120, w: 300, h: 200 })
    c.close()
  })
})
