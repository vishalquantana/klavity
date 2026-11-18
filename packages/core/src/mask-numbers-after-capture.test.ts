// @vitest-environment jsdom
// KD-3088: "Mask numbers" toggled in the markup toolbar must mask the screenshot that is ALREADY taken.
// These cover the pure pieces: where the numbers were at capture time, and mapping them onto the image.
import { describe, it, expect, afterEach, vi } from 'vitest'
import { collectNumberRects, numberRectsToImage, type NumberGeo } from './mask-numbers'
import { buildModal } from './modal'

const geo = (over: Partial<NumberGeo> = {}): NumberGeo => ({
  rects: [{ x: 100, y: 50, w: 40, h: 20 }],
  vw: 1000, vh: 800, sx: 0, sy: 0, dw: 1000, dh: 3000,
  ...over,
})

describe('numberRectsToImage', () => {
  it('maps a viewport shot by its scale (2x DPR)', () => {
    const r = numberRectsToImage(geo(), 2000, 1600, { kind: 'viewport' })!
    // 2px CSS bleed on each side, scaled 2x → 4px.
    expect(r).toEqual([{ x: 196, y: 96, w: 88, h: 48 }])
  })

  it('maps a full-page shot through the scroll offset', () => {
    const r = numberRectsToImage(geo({ sy: 500 }), 1000, 3000, { kind: 'full' })!
    expect(r[0].y).toBe(500 + 50 - 2)   // viewport y + scrollY, minus bleed
    expect(r[0].x).toBe(98)
  })

  it('maps a region shot relative to the selected rect', () => {
    const r = numberRectsToImage(geo(), 400, 200, { kind: 'region', rect: { x: 80, y: 40, w: 200, h: 100 } })!
    // scale 2 (400 / 200); (100 - 80) * 2 - 4 = 36
    expect(r[0]).toEqual({ x: 36, y: 16, w: 88, h: 48 })
  })

  it('infers viewport vs full page from the aspect ratio when there is no provenance', () => {
    expect(numberRectsToImage(geo(), 1000, 800)![0].y).toBe(48)
    expect(numberRectsToImage(geo({ sy: 500 }), 1000, 3000)![0].y).toBe(548)
  })

  it('refuses to guess for an image that matches neither (e.g. a whole shared screen)', () => {
    expect(numberRectsToImage(geo(), 1920, 400)).toBeNull()
  })

  it('clips to the image and drops rects that fall outside it', () => {
    const g = geo({ rects: [{ x: 990, y: 790, w: 40, h: 40 }, { x: 5000, y: 5000, w: 10, h: 10 }] })
    const r = numberRectsToImage(g, 1000, 800, { kind: 'viewport' })!
    expect(r).toHaveLength(1)
    expect(r[0].x + r[0].w).toBe(1000)
    expect(r[0].y + r[0].h).toBe(800)
  })
})

describe('collectNumberRects — numbers hidden behind another page element are skipped', () => {
  afterEach(() => { delete (document as any).elementsFromPoint; document.body.innerHTML = '' })
  function setupPage() {
    document.body.innerHTML = '<header id="bar">Menu</header><p id="n">Total 42</p><div data-klavity-ui="composer"></div>'
    ;(Range.prototype as any).getClientRects = function () { return [{ left: 100, top: 10, width: 20, height: 10 }] }
    return { bar: document.getElementById('bar')!, owner: document.getElementById('n')!, ui: document.querySelector('[data-klavity-ui]')! }
  }
  it('fully covered by a page element (e.g. scrolled under a sticky header) → no box', () => {
    const { bar } = setupPage()
    ;(document as any).elementsFromPoint = () => [bar]
    expect(collectNumberRects(document.body).rects).toHaveLength(0)
  })
  it('partly visible (one corner shows) → still masked', () => {
    const { bar, owner } = setupPage()
    let n = 0
    ;(document as any).elementsFromPoint = () => (n++ === 4 ? [owner] : [bar])
    expect(collectNumberRects(document.body).rects).toHaveLength(1)
  })
  it('covered only by Klavity UI → still masked (privacy-first)', () => {
    const { ui, owner } = setupPage()
    ;(document as any).elementsFromPoint = () => [ui, owner]
    expect(collectNumberRects(document.body).rects).toHaveLength(1)
  })
})

describe('numberRectsToImage — full-page + viewport edge cases', () => {
  it('a full-page shot maps by width even when a very tall page was height-clamped', () => {
    const r = numberRectsToImage(geo({ dh: 20000, rects: [{ x: 100, y: 50, w: 40, h: 20 }] }), 1000, 8000, { kind: 'full' })!
    expect(r).toHaveLength(1)
    expect(r[0].y).toBe(48)
  })

  it('a fixed (pinned) element lands at its on-screen spot at the TOP of a full-page shot', () => {
    const g = geo({ sy: 900, rects: [{ x: 10, y: 20, w: 30, h: 10, fixed: true }, { x: 10, y: 20, w: 30, h: 10 }] })
    const r = numberRectsToImage(g, 1000, 3000, { kind: 'full' })!
    expect(r[0].y).toBe(18)            // fixed: no scroll offset
    expect(r[1].y).toBe(900 + 20 - 2)  // normal: scrolled document position
  })

  it('a viewport shot whose shape does not match the viewport (whole screen shared) is not guessed', () => {
    expect(numberRectsToImage(geo(), 1920, 1080, { kind: 'viewport' })).toBeNull()
  })
})

describe('the live page is never modified for masking', () => {
  it('capturing with Mask numbers ON leaves the page untouched, and ticking never re-captures', async () => {
    document.body.innerHTML = '<main><p id="price">Total: 4521 items</p></main>'
    const pageDuringCapture: string[] = []
    const onCaptureFull = vi.fn(async () => {
      pageDuringCapture.push(document.getElementById('price')!.innerHTML)
      return { dataUrl: 'data:image/png;base64,T1JJRw==', quality: 'rendered' as const }
    })
    const c = buildModal('bug', {
      onCaptureFull,
      onClose: vi.fn(),
      onSubmit: vi.fn().mockResolvedValue({ issueKey: 'KLA-1', issueUrl: '' }),
    } as any, { theme: 'light', maskNumbers: true } as any)
    const root = c.shadowRoot
    ;(root.getElementById('klavity-full') as HTMLButtonElement).click()
    await vi.waitFor(() => expect(root.querySelector('.klavity-thumb img')).toBeTruthy())
    expect(pageDuringCapture).toEqual(['Total: 4521 items'])   // no black boxes on the real page
    expect(document.querySelector('#price span')).toBeNull()

    const cb = root.querySelector('.kl-hmask-cb') as HTMLInputElement
    cb.checked = false; cb.dispatchEvent(new Event('change'))
    cb.checked = true; cb.dispatchEvent(new Event('change'))
    await new Promise(r => setTimeout(r, 20))
    expect(onCaptureFull).toHaveBeenCalledTimes(1)              // masking is painted on the image, never re-captured
    expect(document.getElementById('price')!.innerHTML).toBe('Total: 4521 items')
  })
})

describe('collectNumberRects', () => {
  const cleanup: HTMLElement[] = []
  afterEach(() => { cleanup.splice(0).forEach(el => el.remove()); vi.restoreAllMocks() })

  it('records one rect per digit run plus digit-bearing inputs, and leaves the DOM untouched', () => {
    const root = document.createElement('div')
    root.innerHTML = '<p>Order 123 of 4567</p><p>no digits</p><script>var a = 1</script><input value="555-0100"><input value="none">'
    document.body.appendChild(root); cleanup.push(root)
    const before = root.innerHTML
    // jsdom has no layout: give every range / element a fake box so we can count what was measured.
    ;(Range.prototype as any).getClientRects = function () { return [{ left: 1, top: 2, width: 10, height: 5 }] }
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 3, top: 4, width: 30, height: 12 } as DOMRect)
    const g = collectNumberRects(root)
    expect(g.rects).toHaveLength(3)                   // "123", "4567", and the "555-0100" input
    expect(g.rects[2]).toEqual({ x: 3, y: 4, w: 30, h: 12 })
    expect(root.innerHTML).toBe(before)               // measuring only — nothing masked
    expect(g.vw).toBe(window.innerWidth)
  })
})
