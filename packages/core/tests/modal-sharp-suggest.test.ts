// @vitest-environment jsdom
// KLAVITYKLA-473: when a capture comes back blank/partial-white (cross-origin images dropped to white
// gaps), the composer shows a NON-INTRUSIVE callout pointing at the Screen button — it must NEVER auto-
// invoke the sharp getDisplayMedia capture (the #460 regression that popped a surprise screen-share prompt
// on a plain "Report a bug" click). The sharp grab fires only from a real user-gesture click on Screen (or
// the callout's "Use Screen", which forwards that click).
import { describe, it, expect, vi } from 'vitest'
import { buildModal } from '../src/modal'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const SHARP_PNG = 'data:image/png;base64,U0hBUlA='
const q = (c: any, sel: string) => c.shadowRoot.querySelector(sel)
const tick = () => new Promise(r => setTimeout(r, 0))

function build(fullResult: any) {
  const sharpSpy = vi.fn(async () => ({ dataUrl: SHARP_PNG, quality: 'real-pixel' as const }))
  const c = buildModal('bug', {
    onCaptureFull: async () => fullResult,
    onCaptureSharp: sharpSpy,
    onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
  })
  return { c, sharpSpy }
}

describe('KLAVITYKLA-473 suggest-Screen callout', () => {
  it('a blank/partial capture shows the callout + pulses Screen, and does NOT auto-invoke the sharp capture', async () => {
    const { c, sharpSpy } = build({ dataUrl: PNG, quality: 'rendered', suggestSharp: true })
    ;(q(c, '#klavity-full') as HTMLButtonElement).click()
    await tick()

    const hint = q(c, '#klavity-sharphint') as HTMLElement
    expect(hint).not.toBeNull()
    expect(hint.hidden).toBe(false)
    expect(hint.textContent).toContain('Snap')
    // The Screen button is highlighted so the eye is drawn to it.
    expect((q(c, '#klavity-sharp') as HTMLElement).classList.contains('kl-suggest')).toBe(true)
    // CRITICAL: the sharp/getDisplayMedia path was NOT auto-invoked — no surprise share prompt.
    expect(sharpSpy).not.toHaveBeenCalled()
    c.close()
  })

  it('a normal capture shows NO callout', async () => {
    const { c, sharpSpy } = build({ dataUrl: PNG, quality: 'rendered', suggestSharp: false })
    ;(q(c, '#klavity-full') as HTMLButtonElement).click()
    await tick()
    expect((q(c, '#klavity-sharphint') as HTMLElement).hidden).toBe(true)
    expect((q(c, '#klavity-sharp') as HTMLElement).classList.contains('kl-suggest')).toBe(false)
    expect(sharpSpy).not.toHaveBeenCalled()
    c.close()
  })

  it('"Use Screen" forwards a real user-gesture click to the Screen button (sharp capture only on the user\'s action)', async () => {
    const { c, sharpSpy } = build({ dataUrl: PNG, quality: 'rendered', suggestSharp: true })
    ;(q(c, '#klavity-full') as HTMLButtonElement).click()
    await tick()
    ;(q(c, '.kl-sh-use') as HTMLButtonElement).click()
    await tick()
    expect(sharpSpy).toHaveBeenCalledTimes(1) // fired by the user's click, not automatically
    c.close()
  })

  it('Dismiss hides the callout and it does not nag again', async () => {
    const { c } = build({ dataUrl: PNG, quality: 'rendered', suggestSharp: true })
    ;(q(c, '#klavity-full') as HTMLButtonElement).click()
    await tick()
    expect((q(c, '#klavity-sharphint') as HTMLElement).hidden).toBe(false)
    ;(q(c, '.kl-sh-x') as HTMLButtonElement).click()
    expect((q(c, '#klavity-sharphint') as HTMLElement).hidden).toBe(true)
    // A second flagged capture must stay dismissed for the session.
    ;(q(c, '#klavity-full') as HTMLButtonElement).click()
    await tick()
    expect((q(c, '#klavity-sharphint') as HTMLElement).hidden).toBe(true)
    c.close()
  })
})
