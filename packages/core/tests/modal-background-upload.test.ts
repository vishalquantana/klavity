// @vitest-environment jsdom
// Non-blocking submit (default widget path). When `backgroundUpload` is set, a Submit hands the fully
// built payload to the host (fire-and-forget onSubmit) and closes the modal + backdrop IMMEDIATELY —
// no await of the upload, and NO in-modal "Report sent" confirmation card. The host (widget) owns a
// bottom-right pill that reports progress/success/failure after the modal is gone. This replaces the
// #448 blocking confirmation on the default path; the legacy card is retained only when backgroundUpload
// is absent (see modal-submit-lock.test.ts).
import { describe, it, expect, vi } from 'vitest'
import { buildModal } from '../src/modal'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
const q = (c: any, sel: string) => c.shadowRoot.querySelector(sel)

describe('non-blocking background-upload submit', () => {
  it('hands off the payload and closes the modal + backdrop immediately (no confirmation card)', async () => {
    vi.useFakeTimers()
    // onSubmit stays PENDING forever — proving the modal never awaits the upload to close.
    let resolveSubmit: (() => void) | null = null
    const onSubmit = vi.fn(() => new Promise<{ issueKey: string; issueUrl: string }>(res => {
      resolveSubmit = () => res({ issueKey: 'CHAR-142', issueUrl: '' })
    }))
    const onClose = vi.fn()
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, onClose, backgroundUpload: true })
    c.addScreenshot(PNG) // evidence → Submit enabled

    const submit = q(c, '#klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    submit.click()

    // Flush the pre-compression await so onSubmit is invoked and the immediate close runs.
    await vi.advanceTimersByTimeAsync(0)

    // Payload was handed off exactly once...
    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0][0] as any
    expect(payload.screenshots.length).toBe(1)
    expect(payload.type).toBe('bug')

    // ...the modal host is torn down synchronously (nothing dimmed lingering)...
    expect(document.body.contains(c.shadowRoot.host)).toBe(false)
    // ...onClose fired with the 'submitted' reason so the host skips keep-evidence bookkeeping...
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledWith('submitted')
    // ...and there is NO in-modal terminal confirmation card.
    expect(q(c, '.klavity-sent')).toBeNull()

    // The upload is still pending — the modal did NOT block on it. Resolving it changes nothing in-modal.
    expect(resolveSubmit).toBeTypeOf('function')
    resolveSubmit!()
    await vi.advanceTimersByTimeAsync(4000)
    expect(q(c, '.klavity-sent')).toBeNull()
    expect(document.body.contains(c.shadowRoot.host)).toBe(false)
    vi.useRealTimers()
  })

  it('still renders the legacy in-modal card when backgroundUpload is absent (extension parity)', async () => {
    vi.useFakeTimers()
    const c = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => ({ issueKey: 'CHAR-9', issueUrl: '' }),
      // no backgroundUpload, no success → legacy renderSentConfirmation path
    })
    c.addScreenshot(PNG)
    ;(q(c, '#klavity-submit') as HTMLButtonElement).click()
    await vi.advanceTimersByTimeAsync(0)
    expect(q(c, '.klavity-sent')).not.toBeNull()
    expect(c.shadowRoot.textContent).toContain('Report sent')
    vi.useRealTimers()
  })

  it('legacy card is COMPACT, arms the 4s countdown progress line, and auto-closes (never a big broken box)', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const c = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => ({ issueKey: 'CHAR-9', issueUrl: '' }),
      onClose,
      // no backgroundUpload, no success → legacy renderSentConfirmation (extension / opt-out path)
    })
    c.addScreenshot(PNG)
    ;(q(c, '#klavity-submit') as HTMLButtonElement).click()
    await vi.advanceTimersByTimeAsync(0)

    const card = q(c, '.klavity-sent') as HTMLElement
    expect(card).not.toBeNull()

    // Compact: the card CSS caps its width small (<=340px) — not the old big 420px centered box.
    const css = c.shadowRoot.querySelector('style')!.textContent!
    const width = css.match(/\.klavity-sent\{[^}]*max-width:(\d+)px/)
    expect(width).not.toBeNull()
    expect(Number(width![1])).toBeLessThanOrEqual(340)

    // Countdown progress line runs along the BOTTOM edge, armed for exactly SUBMIT_AUTOCLOSE_MS (4000ms).
    const bar = card.querySelector('.klavity-toast-progress') as HTMLElement
    expect(bar).not.toBeNull()
    expect(bar.style.animationDuration).toBe('4000ms')

    // Auto-closes after 4s (hover would pause, but untouched it dismisses).
    expect(onClose).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(4000)
    expect(onClose).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
