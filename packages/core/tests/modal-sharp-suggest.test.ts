// @vitest-environment jsdom
// Owner directive (2026-08-26): "Full Page" now captures via real tab-share (getDisplayMedia) so it works on
// cross-origin pages (embedded frames / cross-origin images no longer render blank-white — hit live on PX4).
// This REVERSES the KLAVITYKLA-473 "never invoke sharp from a Full Page click" stance for the Full Page BUTTON
// specifically. Two KLA-473 guarantees still hold and are covered below:
//   1. The composer must NOT auto-invoke getDisplayMedia on OPEN (the #460 surprise-prompt regression) — the
//      sharp grab only fires from an explicit user click (Full Page / Snap / the callout's "Use Screen").
//   2. When Screen is unavailable/declined, Full Page falls back to the rendered capture and — if that render
//      is blank/partial — still shows the non-intrusive suggest-Screen callout pointing at the Snap button.
import { describe, it, expect, vi } from 'vitest'
import { buildModal } from '../src/modal'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const SHARP_PNG = 'data:image/png;base64,U0hBUlA='
const q = (c: any, sel: string) => c.shadowRoot.querySelector(sel)
const tick = () => new Promise(r => setTimeout(r, 0))

// sharpOk = the tab-share capture succeeds; sharpDecline = the user declines / no shot (returns undefined),
// which drives the rendered fallback path.
function build(fullResult: any, sharpMode: 'ok' | 'decline' = 'ok') {
  const sharpSpy = sharpMode === 'ok'
    ? vi.fn(async () => ({ dataUrl: SHARP_PNG, quality: 'real-pixel' as const }))
    : vi.fn(async () => undefined)
  const c = buildModal('bug', {
    onCaptureFull: async () => fullResult,
    onCaptureSharp: sharpSpy,
    onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
  })
  return { c, sharpSpy }
}

describe('Full Page → tab-share (owner directive) + KLA-473 fallback callout', () => {
  it('clicking Full Page invokes the tab-share Screen capture — no blank DOM render, no suggest callout', async () => {
    const { c, sharpSpy } = build({ dataUrl: PNG, quality: 'rendered', suggestSharp: true }, 'ok')
    ;(q(c, '#klavity-full') as HTMLButtonElement).click()
    await tick(); await tick()
    // The real-pixel tab-share path ran on the explicit click.
    expect(sharpSpy).toHaveBeenCalledTimes(1)
    // No suggest-Screen callout — the capture is pixel-perfect, not a blank render.
    expect((q(c, '#klavity-sharphint') as HTMLElement).hidden).toBe(true)
    c.close()
  })

  it('does NOT auto-invoke the tab-share capture on modal OPEN (#460 guard)', async () => {
    const { c, sharpSpy } = build({ dataUrl: PNG, quality: 'rendered', suggestSharp: false }, 'ok')
    await tick(); await tick()
    // Nobody clicked a capture button — the share prompt must not fire on its own.
    expect(sharpSpy).not.toHaveBeenCalled()
    c.close()
  })

  it('when Screen is declined, Full Page falls back to the render and a blank result shows the callout', async () => {
    const { c, sharpSpy } = build({ dataUrl: PNG, quality: 'rendered', suggestSharp: true }, 'decline')
    ;(q(c, '#klavity-full') as HTMLButtonElement).click()
    await tick(); await tick()
    // The tab-share was attempted (declined) exactly once, then the rendered fallback ran.
    expect(sharpSpy).toHaveBeenCalledTimes(1)
    const hint = q(c, '#klavity-sharphint') as HTMLElement
    expect(hint).not.toBeNull()
    expect(hint.hidden).toBe(false)
    expect(hint.textContent).toContain('Snap')
    expect((q(c, '#klavity-sharp') as HTMLElement).classList.contains('kl-suggest')).toBe(true)
    c.close()
  })

  it('a non-blank rendered fallback shows NO callout', async () => {
    const { c } = build({ dataUrl: PNG, quality: 'rendered', suggestSharp: false }, 'decline')
    ;(q(c, '#klavity-full') as HTMLButtonElement).click()
    await tick(); await tick()
    expect((q(c, '#klavity-sharphint') as HTMLElement).hidden).toBe(true)
    expect((q(c, '#klavity-sharp') as HTMLElement).classList.contains('kl-suggest')).toBe(false)
    c.close()
  })

  it('the callout\'s "Use Screen" re-invokes the tab-share capture on the user\'s click', async () => {
    const { c, sharpSpy } = build({ dataUrl: PNG, quality: 'rendered', suggestSharp: true }, 'decline')
    ;(q(c, '#klavity-full') as HTMLButtonElement).click()
    await tick(); await tick()
    expect(sharpSpy).toHaveBeenCalledTimes(1) // the declined Full Page attempt
    ;(q(c, '.kl-sh-use') as HTMLButtonElement).click()
    await tick()
    expect(sharpSpy).toHaveBeenCalledTimes(2) // fired again by the user's "Use Screen" click
    c.close()
  })

  it('Dismiss hides the callout and it does not nag again', async () => {
    const { c } = build({ dataUrl: PNG, quality: 'rendered', suggestSharp: true }, 'decline')
    ;(q(c, '#klavity-full') as HTMLButtonElement).click()
    await tick(); await tick()
    expect((q(c, '#klavity-sharphint') as HTMLElement).hidden).toBe(false)
    ;(q(c, '.kl-sh-x') as HTMLButtonElement).click()
    expect((q(c, '#klavity-sharphint') as HTMLElement).hidden).toBe(true)
    // A second flagged fallback must stay dismissed for the session.
    ;(q(c, '#klavity-full') as HTMLButtonElement).click()
    await tick(); await tick()
    expect((q(c, '#klavity-sharphint') as HTMLElement).hidden).toBe(true)
    c.close()
  })
})
