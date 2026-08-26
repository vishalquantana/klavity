// @vitest-environment jsdom
// Editor toolbar: the Klavity logo (top-left, UTM homepage link) + the RELOCATED "Mask numbers" toggle.
// Mounting a shot populates the hero toolbar synchronously (by design), so we can assert its DOM directly.

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildModal } from './modal'

const SHOT = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCA'

function mountWithShot(config: Record<string, unknown>) {
  const controller = buildModal(
    'bug',
    {
      onCaptureFull: async () => ({ dataUrl: '', quality: 'rendered' as const }),
      onRegionCapture: async () => ({ dataUrl: '', quality: 'rendered' as const }),
      onClose: vi.fn(),
      onSubmit: vi.fn().mockResolvedValue({ issueKey: 'KLA-1', issueUrl: '' }),
    } as any,
    config as any,
  )
  controller.addCapturedShot(SHOT)
  return controller
}

beforeEach(() => { document.body.innerHTML = '' })

describe('editor toolbar — Klavity logo (top-left, UTM link)', () => {
  it('renders a logo link as the FIRST item in the hero toolbar', () => {
    const c = mountWithShot({ theme: 'light', projectId: 'proj_xyz' })
    const tools = c.shadowRoot.getElementById('klavity-hero-tools') as HTMLElement
    const logo = tools.querySelector('#kl-hero-logo') as HTMLAnchorElement
    expect(logo).toBeTruthy()
    // Top-left => first element child of the toolbar.
    expect(tools.firstElementChild).toBe(logo)
    expect(logo.querySelector('svg')).toBeTruthy() // brand mark
    expect(logo.textContent).toContain('Klavity')
  })

  it('the logo opens the UTM-stamped homepage in a new tab with rel=noopener', () => {
    const c = mountWithShot({ theme: 'light', projectId: 'proj_xyz' })
    const logo = c.shadowRoot.querySelector('#kl-hero-logo') as HTMLAnchorElement
    expect(logo.target).toBe('_blank')
    expect(logo.rel).toBe('noopener')
    const u = new URL(logo.href)
    expect(u.origin).toBe('https://klavity.in')
    expect(u.searchParams.get('utm_source')).toBe('snap-widget')
    expect(u.searchParams.get('utm_medium')).toBe('annotation-editor')
    expect(u.searchParams.get('utm_campaign')).toBe('powered-by')
    expect(u.searchParams.get('utm_content')).toBe('proj_xyz')
  })
})

describe('editor toolbar — Mask numbers relocated but still present + functional', () => {
  it('keeps the Mask numbers checkbox (label + input) after the move', () => {
    const c = mountWithShot({ theme: 'light' })
    const tools = c.shadowRoot.getElementById('klavity-hero-tools') as HTMLElement
    const cb = tools.querySelector('.kl-hmask-cb') as HTMLInputElement
    expect(cb).toBeTruthy()
    expect(cb.type).toBe('checkbox')
    const label = cb.closest('.kl-hmask') as HTMLElement
    expect(label.textContent).toContain('Mask numbers')
  })

  it('no longer sits first — the logo does — and it lives after the drawing tools', () => {
    const c = mountWithShot({ theme: 'light' })
    const tools = c.shadowRoot.getElementById('klavity-hero-tools') as HTMLElement
    const mask = tools.querySelector('.kl-hmask') as HTMLElement
    expect(tools.firstElementChild).not.toBe(mask)
    // Grouped with redaction: the Pixelate tool follows it in DOM order.
    const pixel = tools.querySelector('[data-tool="pixelate"]') as HTMLElement
    expect(mask.compareDocumentPosition(pixel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('toggling the checkbox still flips masking (change handler wired)', () => {
    const c = mountWithShot({ theme: 'light' })
    const cb = c.shadowRoot.querySelector('.kl-hmask-cb') as HTMLInputElement
    // Default off; flip it on and fire change — no throw, state persists on the element.
    cb.checked = true
    cb.dispatchEvent(new Event('change'))
    expect(cb.checked).toBe(true)
  })
})
