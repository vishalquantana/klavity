// @vitest-environment jsdom
// KLA-621: "Retake" must PRESERVE the shot's original selection and re-capture JUST that area — a Region shot
// re-crops its region rect; a Pick-element shot re-crops that element (re-resolved from its selector). It must
// NOT collapse to a full-viewport / full-screen grab and lose the selection (the founder's disconnect). The
// composer threads each shot's capture provenance (ShotCapture) to onRetakeSharp so the host knows what to redo.
import { describe, it, expect, vi } from 'vitest'
import { buildModal, type ShotCapture } from '../src/modal'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const REDONE = 'data:image/png;base64,UkVET05F'
const q = (c: any, sel: string) => c.shadowRoot.querySelector(sel) as HTMLElement | null
const tick = () => new Promise(r => setTimeout(r, 0))

describe('KLA-621 Retake preserves the shot selection', () => {
  it('a REGION shot Retake re-captures the SAME region rect (not a full frame)', async () => {
    const retakeSpy = vi.fn(async (_capture?: ShotCapture) => ({ dataUrl: REDONE, quality: 'real-pixel' as const }))
    const c = buildModal('bug', {
      onCaptureFull: async () => ({ dataUrl: PNG, quality: 'rendered' as const }),
      onRegionCapture: async () => ({ dataUrl: PNG, quality: 'rendered' as const }),
      onRetakeSharp: retakeSpy,
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    })
    // Seed a region shot exactly as the widget's right-click-drag path does: a rendered crop tagged with its rect.
    const rect = { x: 40, y: 60, w: 220, h: 140 }
    c.addCapturedShot(PNG, 'rendered', undefined, false, { kind: 'region', rect })
    await tick()
    const retake = q(c, '.klavity-retake') as HTMLButtonElement | null
    expect(retake).not.toBeNull() // a rendered (degraded) shot offers Retake
    retake!.click()
    await tick()
    expect(retakeSpy).toHaveBeenCalledTimes(1)
    // The SAME region rect is handed back to the host — Retake redoes the selection, not the whole screen.
    expect(retakeSpy.mock.calls[0][0]).toEqual({ kind: 'region', rect })
    c.close()
  })

  it('a PICK-ELEMENT shot Retake re-captures the SAME element (selector preserved), via the real pick wiring', async () => {
    const retakeSpy = vi.fn(async (_capture?: ShotCapture) => ({ dataUrl: REDONE, quality: 'real-pixel' as const }))
    const c = buildModal('bug', {
      onCaptureFull: async () => ({ dataUrl: PNG, quality: 'rendered' as const }),
      // The host picker resolves a selector + a rendered element crop (blank on canvas today → Retake matters).
      onPickElement: async () => ({ selector: '#broken-widget', text: 'div#broken-widget', shot: PNG, shotQuality: 'rendered' as const, rect: { x: 12, y: 24, w: 80, h: 90 } }),
      onRetakeSharp: retakeSpy,
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    })
    // Drive the real "Pick element" button so the modal's own add-with-provenance wiring is exercised.
    ;(q(c, '#klavity-pick') as HTMLButtonElement).click()
    await tick(); await tick()
    const retake = q(c, '.klavity-retake') as HTMLButtonElement | null
    expect(retake).not.toBeNull()
    retake!.click()
    await tick()
    expect(retakeSpy).toHaveBeenCalledTimes(1)
    const passed = retakeSpy.mock.calls[0][0] as ShotCapture
    expect(passed.kind).toBe('element')
    expect(passed.selector).toBe('#broken-widget') // Retake knows EXACTLY which element to redo
    c.close()
  })

  it('an untagged (legacy) shot Retake still works — falls back to the host full-frame path with no capture arg', async () => {
    const retakeSpy = vi.fn(async (_capture?: ShotCapture) => ({ dataUrl: REDONE, quality: 'real-pixel' as const }))
    const c = buildModal('bug', {
      onCaptureFull: async () => ({ dataUrl: PNG, quality: 'rendered' as const }),
      onRetakeSharp: retakeSpy,
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    })
    c.addCapturedShot(PNG, 'rendered') // no provenance (older shot / upload)
    await tick()
    ;(q(c, '.klavity-retake') as HTMLButtonElement).click()
    await tick()
    expect(retakeSpy).toHaveBeenCalledTimes(1)
    expect(retakeSpy.mock.calls[0][0]).toBeUndefined() // graceful: legacy full-frame retake
    c.close()
  })
})
