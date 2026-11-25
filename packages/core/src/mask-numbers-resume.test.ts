// @vitest-environment jsdom
// KD-3088: "Mask numbers" must keep working on shots restored after Minimize → Resume. The composer hands the
// host each shot's number positions (onShotAdded) and the toggle state (onMaskNumbersChange); a resumed
// composer that is given them back masks the restored shot. jsdom has no canvas, so the pixel bake is stubbed —
// these tests cover the wiring, not the painting (mask-numbers-after-capture.test.ts covers the geometry).
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./mask-numbers', async (orig) => {
  const real = await orig<typeof import('./mask-numbers')>()
  // Stand-in for the canvas bake: asks the composer where the numbers are (for a 1024×768 image) exactly like the
  // real one, and "masks" only when it knows — so a shot without saved positions stays unmasked.
  return { ...real, bakeMaskRects: vi.fn(async (url: string, rectsFor: (w: number, h: number) => unknown[] | null) => {
    const rects = rectsFor(1024, 768) as any[] | null
    return rects && rects.length ? { url: url + '#masked', rects } : null
  }) }
})

import { bakeMaskRects } from './mask-numbers'
import { buildModal, type ShotNumberMask } from './modal'

const SHOT = 'data:image/png;base64,T1JJRw=='
const base = (over: Record<string, unknown> = {}) => ({
  onCaptureFull: vi.fn(async () => ({ dataUrl: SHOT, quality: 'rendered' as const })),
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue({ issueKey: 'KLA-1', issueUrl: '' }),
  onMinimize: vi.fn(),
  ...over,
}) as any
const heroSrcs = (root: ShadowRoot) => [...root.querySelectorAll<HTMLImageElement>('.klavity-thumb img')].map(i => i.getAttribute('src'))

beforeEach(() => {
  vi.mocked(bakeMaskRects).mockClear()
  document.body.innerHTML = '<main><p id="price">Total: 4521 items</p></main>'
  ;(Range.prototype as any).getClientRects = function () { return [{ left: 100, top: 10, width: 20, height: 10 }] }
})

describe('KD-3088: Mask numbers after Minimize → Resume', () => {
  it('a captured shot hands the host its number positions, and the toggle reports its state', async () => {
    const onShotAdded = vi.fn()
    const onMaskNumbersChange = vi.fn()
    const c = buildModal('bug', base({ onShotAdded, onMaskNumbersChange }), { theme: 'light' } as any)
    ;(c.shadowRoot.getElementById('klavity-full') as HTMLButtonElement).click()
    await vi.waitFor(() => expect(onShotAdded).toHaveBeenCalled())
    const [url, , numberMask] = onShotAdded.mock.calls[0]
    expect(url).toBe(SHOT)
    expect(numberMask.geo.rects.length).toBeGreaterThan(0)
    expect(numberMask.capture).toEqual({ kind: 'full' })
    expect(JSON.parse(JSON.stringify(numberMask))).toEqual(numberMask)   // JSON-safe → storable in IndexedDB

    const cb = c.shadowRoot.querySelector('.kl-hmask-cb') as HTMLInputElement
    cb.checked = true; cb.dispatchEvent(new Event('change'))
    expect(onMaskNumbersChange).toHaveBeenLastCalledWith(true)
    cb.checked = false; cb.dispatchEvent(new Event('change'))
    expect(onMaskNumbersChange).toHaveBeenLastCalledWith(false)
  })

  it('a restored shot given its number positions is masked when the resumed composer has masking on', async () => {
    const saved: ShotNumberMask = { geo: { rects: [{ x: 100, y: 10, w: 20, h: 10 }], vw: 1024, vh: 768, sx: 0, sy: 0, dw: 1024, dh: 768 }, capture: { kind: 'viewport' } }
    const c = buildModal('bug', base({ autoCaptureOnOpen: false }), { theme: 'light', maskNumbers: true } as any)
    c.addScreenshot(SHOT, undefined, { pageUrl: 'https://x.test/a', pagePath: '/a', label: '' }, undefined, undefined, undefined, saved)
    await vi.waitFor(() => expect(heroSrcs(c.shadowRoot)).toContain(SHOT + '#masked'))
    expect(bakeMaskRects).toHaveBeenCalledWith(SHOT, expect.any(Function))
    expect((c.shadowRoot.querySelector('.kl-hmask-cb') as HTMLInputElement).checked).toBe(true)
  })

  it('ticking Mask numbers after Resume masks the restored shot', async () => {
    const saved: ShotNumberMask = { geo: { rects: [{ x: 100, y: 10, w: 20, h: 10 }], vw: 1024, vh: 768, sx: 0, sy: 0, dw: 1024, dh: 768 }, capture: { kind: 'viewport' } }
    const c = buildModal('bug', base({ autoCaptureOnOpen: false }), { theme: 'light' } as any)
    c.addScreenshot(SHOT, undefined, undefined, undefined, undefined, undefined, saved)
    await new Promise(r => setTimeout(r, 10))
    expect(bakeMaskRects).not.toHaveBeenCalled()                       // masking off → restored as-is
    const cb = c.shadowRoot.querySelector('.kl-hmask-cb') as HTMLInputElement
    cb.checked = true; cb.dispatchEvent(new Event('change'))
    await vi.waitFor(() => expect(heroSrcs(c.shadowRoot)).toContain(SHOT + '#masked'))
  })

  it('without saved number positions a restored shot cannot be masked (the old bug)', async () => {
    const c = buildModal('bug', base({ autoCaptureOnOpen: false }), { theme: 'light', maskNumbers: true } as any)
    c.addScreenshot(SHOT)
    await new Promise(r => setTimeout(r, 10))
    const cb = c.shadowRoot.querySelector('.kl-hmask-cb') as HTMLInputElement
    cb.checked = false; cb.dispatchEvent(new Event('change'))
    cb.checked = true; cb.dispatchEvent(new Event('change'))
    await new Promise(r => setTimeout(r, 10))
    expect(heroSrcs(c.shadowRoot)).not.toContain(SHOT + '#masked')
  })
})
