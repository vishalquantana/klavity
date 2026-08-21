// @vitest-environment jsdom
// #448 — after a SUCCESSFUL submit the composer locks (nothing stays editable), swaps to a terminal
// "Report sent" confirmation, and auto-closes after a hover-pausable countdown.
import { describe, it, expect, vi } from 'vitest'
import { buildModal } from '../src/modal'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const q = (c: any, sel: string) => c.shadowRoot.querySelector(sel)

describe('#448 composer locks + auto-dismisses after submit', () => {
  it('freezes all inputs in-flight, shows the terminal confirmation, and auto-closes after ~4s', async () => {
    vi.useFakeTimers()
    let resolveSubmit!: () => void
    const onSubmit = vi.fn(() => new Promise<{ issueKey: string; issueUrl: string }>(res => {
      resolveSubmit = () => res({ issueKey: 'CHAR-142', issueUrl: '' })
    }))
    const onClose = vi.fn()
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, onClose })
    c.addScreenshot(PNG) // evidence → Submit enabled + hero toolbar mounts

    const desc = q(c, '#klavity-desc') as HTMLTextAreaElement
    const submit = q(c, '#klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false)

    submit.click()
    // (a) everything editable is locked synchronously while the submit is in flight.
    expect(desc.disabled).toBe(true)
    expect(submit.disabled).toBe(true)
    const voice = q(c, '#klavity-voice') as HTMLButtonElement | null
    if (voice) expect(voice.disabled).toBe(true)
    const heroTool = q(c, '.kl-htool') as HTMLButtonElement
    expect(heroTool.disabled).toBe(true)

    // Flush the pre-compression await so onSubmit is actually invoked (its promise stays pending).
    await vi.advanceTimersByTimeAsync(0)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    // still the composer, still locked (no confirmation yet)
    expect(q(c, '.klavity-sent')).toBeNull()
    expect(desc.disabled).toBe(true)

    // Resolve the upload → terminal confirmation replaces the form body.
    resolveSubmit()
    await vi.advanceTimersByTimeAsync(0)

    const sent = q(c, '.klavity-sent') as HTMLElement
    expect(sent).not.toBeNull()
    expect(c.shadowRoot.textContent).toContain('Report sent')
    expect(c.shadowRoot.textContent).toContain('Filed as')
    expect(c.shadowRoot.textContent).toContain('CHAR-142')
    // (c) a countdown progress line runs along the bottom of the confirmation card.
    expect(sent.querySelector('.klavity-toast-progress')).not.toBeNull()

    // Not closed yet; auto-closes when the countdown finishes (~4s).
    expect(onClose).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(4000)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(document.body.contains(c.shadowRoot.host)).toBe(false)
    vi.useRealTimers()
  })

  it('hovering the confirmation PAUSES the countdown; leaving resumes it', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const c = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => ({ issueKey: 'CHAR-9', issueUrl: '' }),
      onClose,
    })
    c.addScreenshot(PNG)
    ;(q(c, '#klavity-submit') as HTMLButtonElement).click()
    await vi.advanceTimersByTimeAsync(0)

    const card = q(c, '.klavity-sent') as HTMLElement
    const bar = card.querySelector('.klavity-toast-progress') as HTMLElement

    await vi.advanceTimersByTimeAsync(2000)
    card.dispatchEvent(new MouseEvent('mouseenter'))
    expect(bar.style.animationPlayState).toBe('paused')
    // Held for a long time — must not close while hovered.
    await vi.advanceTimersByTimeAsync(10000)
    expect(onClose).not.toHaveBeenCalled()
    // Leave → resumes with only the remaining ~2s.
    card.dispatchEvent(new MouseEvent('mouseleave'))
    expect(bar.style.animationPlayState).toBe('running')
    await vi.advanceTimersByTimeAsync(1999)
    expect(onClose).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('shows an "Open in Klavity" link when the server returns a dashboard URL', async () => {
    vi.useFakeTimers()
    const DASH = 'https://klavity.in/dashboard?project=proj_x#tickets'
    const c = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => ({ issueKey: 'fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9', issueUrl: DASH }),
    })
    c.addScreenshot(PNG)
    ;(q(c, '#klavity-submit') as HTMLButtonElement).click()
    await vi.advanceTimersByTimeAsync(0)
    const a = q(c, '.klavity-sent a') as HTMLAnchorElement
    expect(a).not.toBeNull()
    expect(a.href).toBe(DASH)
    expect(a.target).toBe('_blank')
    expect(a.textContent).toBe('Open in Klavity')
    // shortened, quotable ref (never the full uuid)
    expect(c.shadowRoot.textContent).toContain('fb_1a2b3c4d')
    expect(c.shadowRoot.textContent).not.toContain('5e6f-4a81')
    vi.useRealTimers()
  })
})
