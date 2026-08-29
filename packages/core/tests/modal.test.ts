import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildModal } from '../src/modal'

beforeEach(() => { document.body.innerHTML = '' })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }

describe('buildModal paste-image support', () => {
  it('paste handler is registered on open and removed on close', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const remSpy = vi.spyOn(document, 'removeEventListener')
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    expect(addSpy.mock.calls.some(c => c[0] === 'paste')).toBe(true)
    ctrl.close()
    expect(remSpy.mock.calls.some(c => c[0] === 'paste')).toBe(true)
    addSpy.mockRestore(); remSpy.mockRestore()
  })
})

describe('buildModal region capture', () => {
  it('shows the Region button only when onRegionCapture is provided', () => {
    const withRegion = buildModal('bug', { onCaptureFull: async () => 'x', onRegionCapture: async () => 'r', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    expect(q(withRegion, '#klavity-region')).not.toBeNull()
    withRegion.close()
    const without = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    expect(q(without, '#klavity-region')).toBeNull()
    without.close()
  })

  it('region click → overlay drag resolves onRegionCapture with a css-pixel rect, then addScreenshot', async () => {
    const onRegionCapture = vi.fn(async (_r: any) => 'data:image/png;base64,REGION')
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onRegionCapture, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    ;(q(ctrl, '#klavity-region') as HTMLButtonElement).click()
    const overlay = document.querySelector('[data-klavity-region-overlay]') as HTMLElement
    expect(overlay).not.toBeNull()
    overlay.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 20, bubbles: true }))
    overlay.dispatchEvent(new PointerEvent('pointermove', { clientX: 60, clientY: 80, bubbles: true }))
    overlay.dispatchEvent(new PointerEvent('pointerup',   { clientX: 60, clientY: 80, bubbles: true }))
    await new Promise(r => setTimeout(r, 0))
    expect(onRegionCapture).toHaveBeenCalledWith({ x: 10, y: 20, w: 50, h: 60 })
    // Fix 2: assert the returned data URL was actually added to the strip
    expect(ctrl.shadowRoot.querySelector('.klavity-thumb')).not.toBeNull()
    ctrl.close()
  })

  it('Esc while region overlay is mounted cancels the overlay but does NOT close the modal', () => {
    const onRegionCapture = vi.fn(async (_r: any) => 'data:image/png;base64,REGION')
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onRegionCapture, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    ;(q(ctrl, '#klavity-region') as HTMLButtonElement).click()
    const overlay = document.querySelector('[data-klavity-region-overlay]') as HTMLElement
    expect(overlay).not.toBeNull()
    // Fire Esc — should cancel region overlay, not close the modal
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    // Overlay must be gone
    expect(document.querySelector('[data-klavity-region-overlay]')).toBeNull()
    // Modal host must still be in the DOM
    expect(document.body.contains(ctrl.shadowRoot.host)).toBe(true)
    ctrl.close()
  })
})

describe('buildModal button guards (re-entrancy)', () => {
  const ok = async () => ({ issueKey: '1', issueUrl: '' })

  it('Full Page capture is guarded against double-click — one in-flight capture, button disabled', async () => {
    let resolve!: (v: string) => void
    const onCaptureFull = vi.fn(() => new Promise<string>(r => { resolve = r }))
    const ctrl = buildModal('bug', { onCaptureFull, onSubmit: ok })
    const full = q(ctrl, '#klavity-full') as HTMLButtonElement
    full.click(); full.click(); full.click() // rapid triple-click
    expect(onCaptureFull).toHaveBeenCalledTimes(1)
    expect(full.disabled).toBe(true) // locked while capturing
    resolve('data:image/png;base64,FULL')
    await new Promise(r => setTimeout(r, 0))
    expect(full.disabled).toBe(false) // released after
    expect(ctrl.shadowRoot.querySelectorAll('.klavity-thumb').length).toBe(1)
    ctrl.close()
  })

  it('Submit is disabled and every capture button locked during upload', async () => {
    let resolve!: (v: { issueKey: string; issueUrl: string }) => void
    const onSubmit = vi.fn(() => new Promise<{ issueKey: string; issueUrl: string }>(r => { resolve = r }))
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onRegionCapture: async () => 'r', onSubmit })
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'a real bug'; desc.dispatchEvent(new Event('input'))
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    submit.click()
    expect(submit.disabled).toBe(true)
    expect(submit.textContent).toContain('Uploading')
    expect((q(ctrl, '#klavity-full') as HTMLButtonElement).disabled).toBe(true)
    expect((q(ctrl, '#klavity-region') as HTMLButtonElement).disabled).toBe(true)
    // The submit handler now awaits Promise.all(screenshotCompressed) before calling onSubmit,
    // so we need one microtask tick for resolve to be assigned.
    await new Promise(r => setTimeout(r, 0))
    resolve({ issueKey: 'K-1', issueUrl: '' })
    await new Promise(r => setTimeout(r, 0))
    ctrl.close()
  })

  it('Submit failure re-enables the composer and shows a FRIENDLY error, not the raw internal text (KLA-496)', async () => {
    const onSubmit = vi.fn(async () => { throw new Error('Klavity backend error 500: {"error":"db connection refused at 10.0.0.4"}') })
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit })
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'oops'; desc.dispatchEvent(new Event('input'))
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    submit.click()
    await new Promise(r => setTimeout(r, 0))
    const err = q(ctrl, '#klavity-err') as HTMLElement
    expect(err.style.display).toBe('block')
    // KLA-496: the reporter sees a friendly line; the raw host/internal text must NOT leak into the UI.
    expect(err.textContent).toContain("Couldn't submit your report")
    expect(err.textContent).not.toContain('Klavity backend error')
    expect(err.textContent).not.toContain('db connection refused')
    expect(submit.disabled).toBe(false) // re-enabled (description still valid)
    expect(submit.textContent).toBe('Submit')
    expect((q(ctrl, '#klavity-full') as HTMLButtonElement).disabled).toBe(false)
    ctrl.close()
  })

  it('debug:true opts the embedder into the raw error text in the error line (maintainer mode)', async () => {
    const onSubmit = vi.fn(async () => { throw new Error('submit failed: 500') })
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit }, { debug: true })
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'oops'; desc.dispatchEvent(new Event('input'))
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    submit.click()
    await new Promise(r => setTimeout(r, 0))
    const err = q(ctrl, '#klavity-err') as HTMLElement
    expect(err.style.display).toBe('block')
    expect(err.textContent).toContain('submit failed: 500') // raw message visible in debug mode
    expect(submit.disabled).toBe(false)
    ctrl.close()
  })
})

describe('buildModal JTBD 1.10 — screenshot-only + mode-aware placeholder', () => {
  const ok = async () => ({ issueKey: '1', issueUrl: '' })

  it('placeholder is bug-worded in Bug mode and switches to feature wording on toggle', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    expect(desc.placeholder).toBe('Describe the bug...')
    ;(ctrl.shadowRoot.querySelector('.feat') as HTMLButtonElement).click()
    expect(desc.placeholder.toLowerCase()).toContain('feature')
    ;(ctrl.shadowRoot.querySelector('.bug') as HTMLButtonElement).click()
    expect(desc.placeholder).toBe('Describe the bug...')
    ctrl.close()
  })

  it('opening directly in Feature mode shows the feature placeholder', () => {
    const ctrl = buildModal('feature', { onCaptureFull: async () => 'x', onSubmit: ok })
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    expect(desc.placeholder.toLowerCase()).toContain('feature')
    ctrl.close()
  })

  it('Submit stays disabled with no description AND no evidence, and enables once a screenshot is attached', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    const hint = q(ctrl, '#klavity-desc-hint') as HTMLElement
    // No text, no evidence → disabled, hint hidden.
    expect(submit.disabled).toBe(true)
    expect(hint.hidden).toBe(true)
    // Attach a screenshot with NO typed description → Submit enables + the "we'll title it" hint appears.
    ctrl.addScreenshot('data:image/png;base64,AAAA')
    expect(submit.disabled).toBe(false)
    expect(hint.hidden).toBe(false)
    ctrl.close()
  })

  it('removing the last screenshot with no description re-disables Submit and hides the hint', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    const hint = q(ctrl, '#klavity-desc-hint') as HTMLElement
    ctrl.addScreenshot('data:image/png;base64,AAAA')
    expect(submit.disabled).toBe(false)
    ;(ctrl.shadowRoot.querySelector('.klavity-rm') as HTMLButtonElement).click()
    expect(submit.disabled).toBe(true)
    expect(hint.hidden).toBe(true)
    ctrl.close()
  })

  it('typing a description hides the evidence hint (typed prose is the title)', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    const hint = q(ctrl, '#klavity-desc-hint') as HTMLElement
    ctrl.addScreenshot('data:image/png;base64,AAAA')
    expect(hint.hidden).toBe(false)
    desc.value = 'the thing is broken'; desc.dispatchEvent(new Event('input'))
    expect(hint.hidden).toBe(true)
    ctrl.close()
  })
})

describe('buildModal upload guards', () => {
  const ok = async () => ({ issueKey: '1', issueUrl: '' })
  const setFiles = (input: HTMLInputElement, files: File[]) =>
    Object.defineProperty(input, 'files', { value: files, configurable: true })

  it('enforces the 5-image cap with a clear message', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    for (let i = 0; i < 5; i++) ctrl.addScreenshot('data:image/png;base64,' + i)
    expect(ctrl.shadowRoot.querySelectorAll('.klavity-thumb').length).toBe(5)
    ctrl.addScreenshot('data:image/png;base64,SIXTH') // the 6th is blocked
    expect(ctrl.shadowRoot.querySelectorAll('.klavity-thumb').length).toBe(5)
    const err = q(ctrl, '#klavity-err') as HTMLElement
    expect(err.style.display).toBe('block')
    expect(err.textContent).toMatch(/up to 5/)
    ctrl.close()
  })

  it('rejects a non-image file with a message and adds nothing', async () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    const input = q(ctrl, '#klavity-file') as HTMLInputElement
    setFiles(input, [new File(['hello'], 'notes.txt', { type: 'text/plain' })])
    input.dispatchEvent(new Event('change'))
    await new Promise(r => setTimeout(r, 0))
    expect(ctrl.shadowRoot.querySelectorAll('.klavity-thumb').length).toBe(0)
    expect((q(ctrl, '#klavity-err') as HTMLElement).textContent).toMatch(/isn't an image/)
    ctrl.close()
  })

  it('rejects an oversized image with a message and adds nothing', async () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    const input = q(ctrl, '#klavity-file') as HTMLInputElement
    setFiles(input, [new File([new Uint8Array(11 * 1024 * 1024)], 'huge.png', { type: 'image/png' })])
    input.dispatchEvent(new Event('change'))
    await new Promise(r => setTimeout(r, 0))
    expect(ctrl.shadowRoot.querySelectorAll('.klavity-thumb').length).toBe(0)
    expect((q(ctrl, '#klavity-err') as HTMLElement).textContent).toMatch(/too large/)
    ctrl.close()
  })
})

describe('buildModal autoCaptureOnOpen', () => {
  it('autoCaptureOnOpen calls onCaptureFull once on mount', async () => {
    vi.useFakeTimers()
    const onCaptureFull = vi.fn(async () => 'data:image/png;base64,FULL')
    const ctrl = buildModal('bug', { onCaptureFull, autoCaptureOnOpen: true, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    await vi.advanceTimersByTimeAsync(250)
    expect(onCaptureFull).toHaveBeenCalledTimes(1)
    ctrl.close(); vi.useRealTimers()
  })
  it('without autoCaptureOnOpen, onCaptureFull is NOT called on mount', async () => {
    vi.useFakeTimers()
    const onCaptureFull = vi.fn(async () => 'x')
    const ctrl = buildModal('bug', { onCaptureFull, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    await vi.advanceTimersByTimeAsync(250)
    expect(onCaptureFull).not.toHaveBeenCalled()
    ctrl.close(); vi.useRealTimers()
  })
})

describe('buildModal success screen auto-dismiss', () => {
  const ok = async () => ({ issueKey: 'K-1', issueUrl: '' })

  it('closes automatically after 5 seconds if showEmail and showCta are false', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const success = {
      copy: {
        headline: 'Bug filed',
        body: 'Thanks',
        emailLabel: '',
        ctaText: '',
        ctaUrl: '',
        showEmail: false,
        showCta: false
      }
    }
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: ok,
      onClose,
      success
    })
    
    // Trigger submit
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'test bug'; desc.dispatchEvent(new Event('input'))
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    submit.click()
    
    // Await submit promise resolution
    await vi.advanceTimersByTimeAsync(0)
    
    // Check that success screen is rendered and has the progress bar
    expect(q(ctrl, '.klavity-toast-progress')).not.toBeNull()
    
    // Check it hasn't closed yet
    expect(onClose).not.toHaveBeenCalled()
    
    // Advance 5 seconds
    await vi.advanceTimersByTimeAsync(5000)
    
    expect(onClose).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('does not close automatically if showEmail is true until email is submitted', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const onLead = vi.fn(async () => {})
    const success = {
      copy: {
        headline: 'Bug filed',
        body: 'Provide email',
        emailLabel: 'Notify me',
        ctaText: '',
        ctaUrl: '',
        showEmail: true,
        showCta: false
      },
      onLead
    }
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: ok,
      onClose,
      success
    })
    
    // Trigger submit
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'test bug'; desc.dispatchEvent(new Event('input'))
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    submit.click()
    
    // Await submit promise resolution
    await vi.advanceTimersByTimeAsync(0)
    
    // Should NOT have the progress bar yet
    expect(q(ctrl, '.klavity-toast-progress')).toBeNull()
    
    // Advance 10 seconds, should not close
    await vi.advanceTimersByTimeAsync(10000)
    expect(onClose).not.toHaveBeenCalled()
    
    // Enter email and submit lead
    const emailInput = q(ctrl, '.klavity-lead input') as HTMLInputElement
    emailInput.value = 'test@example.com'
    const leadBtn = q(ctrl, '.klavity-lead button') as HTMLButtonElement
    leadBtn.click()
    
    // Await lead submit resolution
    await vi.advanceTimersByTimeAsync(0)
    
    // Should have progress bar now
    expect(q(ctrl, '.klavity-toast-progress')).not.toBeNull()
    
    // Advance 5 seconds, should close
    await vi.advanceTimersByTimeAsync(5000)
    expect(onClose).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('hover pauses the 5s auto-dismiss and unhover resumes with the remaining time', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const success = {
      copy: {
        headline: 'Bug filed',
        body: 'Thanks',
        emailLabel: '',
        ctaText: '',
        ctaUrl: '',
        showEmail: false,
        showCta: false
      }
    }
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: ok,
      onClose,
      success
    })

    // Trigger submit
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'test bug'; desc.dispatchEvent(new Event('input'))
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    submit.click()
    await vi.advanceTimersByTimeAsync(0)

    const modal = q(ctrl, '.klavity-modal') as HTMLElement
    const progress = q(ctrl, '.klavity-toast-progress') as HTMLElement
    expect(progress).not.toBeNull()

    // t=2s: hover the toast — countdown pauses, progress bar freezes
    await vi.advanceTimersByTimeAsync(2000)
    modal.dispatchEvent(new MouseEvent('mouseenter'))
    expect(progress.style.animationPlayState).toBe('paused')

    // 10s hovered — must still be open
    await vi.advanceTimersByTimeAsync(10000)
    expect(onClose).not.toHaveBeenCalled()

    // Unhover — resumes with the remaining ~3s
    modal.dispatchEvent(new MouseEvent('mouseleave'))
    expect(progress.style.animationPlayState).toBe('running')
    await vi.advanceTimersByTimeAsync(2999)
    expect(onClose).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(onClose).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('manual close while hover-paused still closes and fires onClose once', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    const success = {
      copy: {
        headline: 'Bug filed',
        body: 'Thanks',
        emailLabel: '',
        ctaText: '',
        ctaUrl: '',
        showEmail: false,
        showCta: false
      }
    }
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: ok,
      onClose,
      success
    })

    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'test bug'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await vi.advanceTimersByTimeAsync(0)

    const modal = q(ctrl, '.klavity-modal') as HTMLElement
    modal.dispatchEvent(new MouseEvent('mouseenter')) // pause
    ctrl.close() // manual close while paused
    expect(onClose).toHaveBeenCalledTimes(1)
    // No stray timer should fire close/onClose again
    await vi.advanceTimersByTimeAsync(20000)
    expect(onClose).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })
})

describe('buildModal success reference + dashboard link', () => {
  const successCopy = {
    headline: 'Bug filed',
    body: 'Thanks',
    emailLabel: '',
    ctaText: '',
    ctaUrl: '',
    showEmail: false,
    showCta: false,
  }
  const FB_ID = 'fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9'
  const DASH_URL = 'https://klavity.in/dashboard?project=proj_x#tickets'

  async function submitWith(result: { issueKey: string; issueUrl: string }, success?: any) {
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => result,
      ...(success ? { success } : {}),
    })
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'a bug'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await vi.advanceTimersByTimeAsync(0)
    return ctrl
  }

  it('authed reporter: shows shortened reference AND a View-in-dashboard link (target=_blank), keeping the 5s auto-dismiss', async () => {
    vi.useFakeTimers()
    const ctrl = await submitWith({ issueKey: FB_ID, issueUrl: DASH_URL }, { copy: successCopy })
    const ref = q(ctrl, '.klavity-ref') as HTMLElement
    expect(ref).not.toBeNull()
    expect(ref.textContent).toContain('Filed as')
    // The fb_<uuid> id is shortened to a quotable reference — never the full uuid.
    expect((q(ctrl, '.klavity-ref code') as HTMLElement).textContent).toBe('fb_1a2b3c4d')
    const a = q(ctrl, '.klavity-ref a') as HTMLAnchorElement
    expect(a).not.toBeNull()
    expect(a.href).toBe(DASH_URL)
    expect(a.target).toBe('_blank')
    expect(a.rel).toBe('noopener')
    expect(a.textContent).toBe('View in dashboard')
    // Existing auto-dismiss behavior stays intact: progress bar present, closes after 5s
    // (+700ms genie-out fallback — jsdom fires no animationend).
    expect(q(ctrl, '.klavity-toast-progress')).not.toBeNull()
    await vi.advanceTimersByTimeAsync(5000)
    await vi.advanceTimersByTimeAsync(800)
    expect(document.body.contains(ctrl.shadowRoot.host)).toBe(false)
    vi.useRealTimers()
  })

  it('anonymous reporter (no issueUrl): shows just the reference, NO dashboard link', async () => {
    vi.useFakeTimers()
    const ctrl = await submitWith({ issueKey: FB_ID, issueUrl: '' }, { copy: successCopy })
    expect((q(ctrl, '.klavity-ref code') as HTMLElement).textContent).toBe('fb_1a2b3c4d')
    expect(q(ctrl, '.klavity-ref a')).toBeNull()
    ctrl.close()
    vi.useRealTimers()
  })

  it('non-http(s) issueUrl never renders a link', async () => {
    vi.useFakeTimers()
    // eslint-disable-next-line no-script-url
    const ctrl = await submitWith({ issueKey: FB_ID, issueUrl: 'javascript:alert(1)' }, { copy: successCopy })
    expect(q(ctrl, '.klavity-ref')).not.toBeNull()
    expect(q(ctrl, '.klavity-ref a')).toBeNull()
    ctrl.close()
    vi.useRealTimers()
  })

  it('tracker keys (e.g. Plane sequence ids) pass through unshortened', async () => {
    vi.useFakeTimers()
    const ctrl = await submitWith({ issueKey: 'KLAV-123', issueUrl: '' }, { copy: successCopy })
    expect((q(ctrl, '.klavity-ref code') as HTMLElement).textContent).toBe('KLAV-123')
    ctrl.close()
    vi.useRealTimers()
  })

  it('fallback themed card (extension path, no success copy): shortened ref + dashboard link for authed reporters', async () => {
    vi.useFakeTimers()
    const ctrl = await submitWith({ issueKey: FB_ID, issueUrl: DASH_URL }) // no success → themed card
    const card = ctrl.shadowRoot.querySelector('div div') as HTMLElement
    expect(ctrl.shadowRoot.textContent).toContain('Filed as')
    expect(ctrl.shadowRoot.textContent).toContain('fb_1a2b3c4d')
    expect(ctrl.shadowRoot.textContent).not.toContain(FB_ID) // full uuid never shown
    const a = ctrl.shadowRoot.querySelector('a') as HTMLAnchorElement
    expect(a).not.toBeNull()
    expect(a.href).toBe(DASH_URL)
    expect(a.target).toBe('_blank')
    expect(card).not.toBeNull()
    vi.useRealTimers()
  })

  it('fallback themed card without issueUrl shows the ref only (anonymous-style)', async () => {
    vi.useFakeTimers()
    const ctrl = await submitWith({ issueKey: FB_ID, issueUrl: '' })
    expect(ctrl.shadowRoot.textContent).toContain('fb_1a2b3c4d')
    expect(ctrl.shadowRoot.querySelector('a')).toBeNull()
    vi.useRealTimers()
  })
})

describe('buildModal Screen tooltip positioning', () => {
  it('clamps tooltip within modal and viewport boundaries', () => {
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onCaptureSharp: async () => 'sharp',
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' })
    })

    const sharpBtn = ctrl.shadowRoot.querySelector('#klavity-sharp') as HTMLElement
    const modalEl = ctrl.shadowRoot.querySelector('.klavity-modal') as HTMLElement
    expect(sharpBtn).not.toBeNull()
    expect(modalEl).not.toBeNull()

    // Mock getBoundingClientRect
    const sharpBtnSpy = vi.spyOn(sharpBtn, 'getBoundingClientRect').mockReturnValue({
      left: 200,
      right: 320,
      top: 400,
      bottom: 440,
      width: 120,
      height: 40,
      x: 200,
      y: 400,
      toJSON: () => {}
    })

    const modalSpy = vi.spyOn(modalEl, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      right: 580,
      top: 200,
      bottom: 600,
      width: 480,
      height: 400,
      x: 100,
      y: 200,
      toJSON: () => {}
    })

    sharpBtn.dispatchEvent(new MouseEvent('mouseenter'))

    // snap-share-hint: when a screen-share isn't granted yet (jsdom has no Permissions API → not granted), the
    // hover surface is the actionable "Allow this tab" share hint (.kl-shp), positioned under the Snap button.
    const shareHint = ctrl.shadowRoot.querySelector('.kl-shp') as HTMLElement
    expect(shareHint).not.toBeNull()
    expect(shareHint.classList.contains('kl-show')).toBe(true)
    // Center of button is 260, TIP_W/2 is 144 (288px card) -> preferred left 116px; well within [8, 728].
    expect(shareHint.style.left).toBe('116px')
    // And it stays inside the viewport horizontally.
    const leftPx = parseInt(shareHint.style.left, 10)
    expect(leftPx).toBeGreaterThanOrEqual(8)
    expect(leftPx + 288).toBeLessThanOrEqual(window.innerWidth)

    sharpBtnSpy.mockRestore()
    modalSpy.mockRestore()
    ctrl.close()
  })

  it('autoCaptureOnOpen highlights Full Page as active, and removing all screenshots clears active state', async () => {
    vi.useFakeTimers()
    const onCaptureFull = vi.fn(async () => 'data:image/png;base64,FULL')
    const ctrl = buildModal('bug', { onCaptureFull, autoCaptureOnOpen: true, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    
    // Auto-capture runs on setTimeout(..., 200)
    await vi.advanceTimersByTimeAsync(250)
    
    const fullBtn = q(ctrl, '#klavity-full') as HTMLButtonElement
    expect(fullBtn.classList.contains('kl-active')).toBe(true)
    
    // Remove the screenshot
    const rmBtn = q(ctrl, '.klavity-rm') as HTMLButtonElement
    expect(rmBtn).not.toBeNull()
    rmBtn.click()
    
    // Active state should be cleared since screenshots length is 0
    expect(fullBtn.classList.contains('kl-active')).toBe(false)

    ctrl.close()
    vi.useRealTimers()
  })
})

// JTBD 1.9: capture-quality badges + guided "Retake sharp"
describe('buildModal capture-quality badges (JTBD 1.9)', () => {
  const ok = async () => ({ issueKey: '1', issueUrl: '' })

  it('badges each engine correctly: real-pixel (Screen/captureVisibleTab), rendered (html-to-image), wireframe (fallback)', () => {
    // Verify all four engines via their three quality tags. The composer maps:
    //   getDisplayMedia "Screen" + extension captureVisibleTab -> 'real-pixel'
    //   widget html-to-image "Full Page"                        -> 'rendered'
    //   fetch-free fallback painter                             -> 'wireframe'
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    ctrl.addScreenshot('data:image/png;base64,REAL', 'real-pixel')
    ctrl.addScreenshot('data:image/png;base64,REND', 'rendered')
    ctrl.addScreenshot('data:image/png;base64,WIRE', 'wireframe')
    const thumbs = Array.from(ctrl.shadowRoot.querySelectorAll('.klavity-thumb'))
    expect(thumbs.length).toBe(3)
    expect(thumbs[0].querySelector('.klavity-qb.kl-q-real-pixel')).not.toBeNull()
    expect(thumbs[0].querySelector('.klavity-qb')!.textContent).toContain('Sharp')
    expect(thumbs[1].querySelector('.klavity-qb.kl-q-rendered')).not.toBeNull()
    expect(thumbs[1].querySelector('.klavity-qb')!.textContent).toContain('Rendered')
    expect(thumbs[2].querySelector('.klavity-qb.kl-q-wireframe')).not.toBeNull()
    expect(thumbs[2].querySelector('.klavity-qb')!.textContent).toContain('Wireframe')
    ctrl.close()
  })

  it('a shot with no known quality (upload/paste) renders NO badge', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    ctrl.addScreenshot('data:image/png;base64,UPLOAD') // no quality → plain thumbnail
    const thumb = ctrl.shadowRoot.querySelector('.klavity-thumb')!
    expect(thumb.querySelector('.klavity-qb')).toBeNull()
    expect(thumb.querySelector('.klavity-retake')).toBeNull()
    ctrl.close()
  })

  it('the wireframe fallback is NEVER presented without its badge (AC)', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    ctrl.addScreenshot('data:image/png;base64,WIRE', 'wireframe')
    const thumb = ctrl.shadowRoot.querySelector('.klavity-thumb')!
    expect(thumb.querySelector('.klavity-qb.kl-q-wireframe')).not.toBeNull()
    ctrl.close()
  })

  it('"Retake sharp" shows only on degraded shots (rendered/wireframe) AND only when onRetakeSharp is wired', () => {
    // With onRetakeSharp: degraded shots get the button; a real-pixel shot does not.
    const withRetake = buildModal('bug', { onCaptureFull: async () => 'x', onRetakeSharp: async () => 'y', onSubmit: ok })
    withRetake.addScreenshot('data:image/png;base64,REAL', 'real-pixel')
    withRetake.addScreenshot('data:image/png;base64,REND', 'rendered')
    withRetake.addScreenshot('data:image/png;base64,WIRE', 'wireframe')
    const t = Array.from(withRetake.shadowRoot.querySelectorAll('.klavity-thumb'))
    expect(t[0].querySelector('.klavity-retake')).toBeNull()   // real-pixel: no retake
    expect(t[1].querySelector('.klavity-retake')).not.toBeNull() // rendered: retake offered
    expect(t[2].querySelector('.klavity-retake')).not.toBeNull() // wireframe: retake offered
    withRetake.close()
    // Without onRetakeSharp: even a degraded shot shows the badge but NO retake affordance.
    const noRetake = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    noRetake.addScreenshot('data:image/png;base64,REND', 'rendered')
    const thumb = noRetake.shadowRoot.querySelector('.klavity-thumb')!
    expect(thumb.querySelector('.klavity-qb.kl-q-rendered')).not.toBeNull()
    expect(thumb.querySelector('.klavity-retake')).toBeNull()
    noRetake.close()
  })

  it('"Retake sharp" replaces the degraded shot in place and upgrades the badge to real-pixel', async () => {
    const onRetakeSharp = vi.fn(async () => ({ dataUrl: 'data:image/png;base64,SHARP', quality: 'real-pixel' as const }))
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onRetakeSharp, onSubmit: ok })
    ctrl.addScreenshot('data:image/png;base64,WIRE', 'wireframe')
    const retakeBtn = ctrl.shadowRoot.querySelector('.klavity-retake') as HTMLButtonElement
    expect(retakeBtn).not.toBeNull()
    retakeBtn.click()
    await new Promise(r => setTimeout(r, 0))
    expect(onRetakeSharp).toHaveBeenCalledTimes(1)
    // Still exactly ONE screenshot — replaced in place, not appended.
    const thumbs = ctrl.shadowRoot.querySelectorAll('.klavity-thumb')
    expect(thumbs.length).toBe(1)
    const img = thumbs[0].querySelector('img') as HTMLImageElement
    expect(img.src).toContain('SHARP')
    // Badge upgraded to sharp; retake affordance gone.
    expect(thumbs[0].querySelector('.klavity-qb.kl-q-real-pixel')).not.toBeNull()
    expect(thumbs[0].querySelector('.klavity-retake')).toBeNull()
    ctrl.close()
  })

  it('retake clears the shot\'s annotations and shows a one-line notice (AC: cleared with notice)', async () => {
    // jsdom never fires <img>.onload for a data URL, so make Image fire onload synchronously — this lets us
    // drive the modal's real annotator UI (openAnnotator) to attach markup, then assert the retake clears it.
    const OrigImage = globalThis.Image
    class FakeImage {
      onload: (() => void) | null = null
      naturalWidth = 40; naturalHeight = 40
      set src(_v: string) { queueMicrotask(() => this.onload?.()) }
    }
    ;(globalThis as any).Image = FakeImage
    try {
      const onRetakeSharp = vi.fn(async () => ({ dataUrl: 'data:image/png;base64,SHARP', quality: 'real-pixel' as const }))
      const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onRetakeSharp, onSubmit: async () => ({ issueKey: 'K', issueUrl: '' }) })
      ctrl.addScreenshot('data:image/png;base64,WIRE', 'wireframe')
      // Open the annotator, draw a rect, and save — so the image carries markup (annotationsByIndex[0]).
      ;(ctrl.shadowRoot.querySelector('.klavity-mk') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 0))
      // The image-hero pane keeps its own always-on canvas; the fullscreen markup editor appends a second
      // canvas last, so target that one (the editor) to drive openAnnotator's draw→save flow.
      const canvases = ctrl.shadowRoot.querySelectorAll('canvas')
      const canvas = canvases[canvases.length - 1] as HTMLCanvasElement
      expect(canvas).not.toBeNull()
      canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 5, clientY: 5, bubbles: true }))
      canvas.dispatchEvent(new PointerEvent('pointerup', { clientX: 30, clientY: 30, bubbles: true }))
      ;(ctrl.shadowRoot.querySelector('#klavity-save-ann') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 0))
      // Now retake — markup must be cleared and a one-line notice shown on the thumbnail.
      ;(ctrl.shadowRoot.querySelector('.klavity-retake') as HTMLButtonElement).click()
      await new Promise(r => setTimeout(r, 0))
      const note = ctrl.shadowRoot.querySelector('.klavity-retake-note')
      expect(note).not.toBeNull()
      expect(note!.textContent).toMatch(/markup cleared/i)
      ctrl.close()
    } finally {
      ;(globalThis as any).Image = OrigImage
    }
  })

  it('capture callbacks may return { dataUrl, quality } (new) — the badge reflects it', async () => {
    vi.useFakeTimers()
    const onCaptureFull = vi.fn(async () => ({ dataUrl: 'data:image/png;base64,REND', quality: 'rendered' as const }))
    const ctrl = buildModal('bug', { onCaptureFull, autoCaptureOnOpen: true, onRetakeSharp: async () => 'y', onSubmit: ok })
    await vi.advanceTimersByTimeAsync(250)
    const thumb = ctrl.shadowRoot.querySelector('.klavity-thumb')!
    expect(thumb.querySelector('.klavity-qb.kl-q-rendered')).not.toBeNull()
    expect(thumb.querySelector('.klavity-retake')).not.toBeNull()
    ctrl.close(); vi.useRealTimers()
  })

  it('legacy string-returning capture callbacks still work (no badge, backward compatible)', async () => {
    vi.useFakeTimers()
    const onCaptureFull = vi.fn(async () => 'data:image/png;base64,LEGACY')
    const ctrl = buildModal('bug', { onCaptureFull, autoCaptureOnOpen: true, onSubmit: ok })
    await vi.advanceTimersByTimeAsync(250)
    const thumb = ctrl.shadowRoot.querySelector('.klavity-thumb')!
    expect(thumb).not.toBeNull()
    expect(thumb.querySelector('.klavity-qb')).toBeNull() // string return → no quality → no badge
    ctrl.close(); vi.useRealTimers()
  })
})

// KLAVITYKLA-493: the reporter-facing "Replay · 60s" chip is HIDDEN (it read like an action and confused
// reporters). Session replay is STILL captured + attached; only the visible chip is gone. replayState is
// still honored for evidence gating (a replay-only report can Submit) and setReplayState() still works.
describe('buildModal replay chip hidden (KLAVITYKLA-493)', () => {
  const base = { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) }

  it('renders no chip when replayState is omitted (e.g. the extension path)', () => {
    const ctrl = buildModal('bug', { ...base })
    expect(q(ctrl, '.klavity-proof')).toBeNull()
    expect(q(ctrl, '#klavity-replay-chip')).toBeNull()
    ctrl.close()
  })

  it("renders NO chip even when replayState is 'attached' (hidden from the composer UI)", () => {
    const ctrl = buildModal('bug', { ...base, replayState: 'attached' })
    expect(q(ctrl, '.klavity-proof')).toBeNull()
    expect(q(ctrl, '#klavity-replay-chip')).toBeNull()
    expect(ctrl.shadowRoot.textContent).not.toContain('Replay')
    ctrl.close()
  })

  it("renders NO chip even when replayState is 'unavailable'", () => {
    const ctrl = buildModal('bug', { ...base, replayState: 'unavailable' })
    expect(q(ctrl, '#klavity-replay-chip')).toBeNull()
    ctrl.close()
  })

  it('replayState:"attached" still counts as evidence — a replay-only report can Submit (no chip needed)', () => {
    const ctrl = buildModal('bug', { ...base, replayState: 'attached' })
    // No typed prose, no screenshot — the attached replay buffer alone enables Submit. Nudge refreshSubmit
    // via an input event on the (empty) description so we assert the gate, not the initial render timing.
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = ''
    desc.dispatchEvent(new Event('input'))
    const submit = q(ctrl, '.klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    ctrl.close()
  })

  it('setReplayState still gates evidence (no throw) even though no chip is rendered', () => {
    const ctrl = buildModal('bug', { ...base, replayState: 'unavailable' })
    const submit = q(ctrl, '.klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(true)          // no evidence yet
    expect(() => ctrl.setReplayState('attached')).not.toThrow()
    expect(submit.disabled).toBe(false)          // replay resolved → evidence → Submit enabled
    expect(q(ctrl, '#klavity-replay-chip')).toBeNull()
    ctrl.close()
  })

  // KLAVITYKLA-493: hiding the chip must NOT touch capture. On the widget the host's onSubmit wrapper
  // merges the captured buffer in as replayEvents; through the shared modal boundary the payload stays
  // exactly what it was before the chip was hidden — no replay field is dropped or reshaped here.
  it('hiding the chip leaves SUBMIT untouched — payload shape unchanged, Submit enabled by replay evidence', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: '1', issueUrl: '' }))
    const ctrl = buildModal('bug', { ...base, onSubmit, replayState: 'attached' })
    expect(q(ctrl, '#klavity-replay-chip')).toBeNull()   // hidden...
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'the export button does nothing'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '.klavity-submit') as HTMLButtonElement).click()
    await new Promise(r => setTimeout(r, 0))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    const p = onSubmit.mock.calls[0][0]
    // The composer never removed/reshaped anything: a plain description + screenshots payload, which the
    // widget layer decorates with replayEvents (capture unchanged) on its way to the server.
    expect(p.description).toBe('the export button does nothing')
    expect(Array.isArray(p.screenshots)).toBe(true)
    expect('replayEvents' in p).toBe(false)   // capture is the HOST's job — unchanged, just invisible
    ctrl.close()
  })
})

// KLAVITYKLA-494: "Pick element" also adds a cropped screenshot of the picked element to the images strip.
describe('buildModal pick-element cropped screenshot (KLAVITYKLA-494)', () => {
  const base = { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) }
  const flush = () => new Promise(r => setTimeout(r, 0))

  // KLAVITYKLA-496 helper: type a description so an evidence-less report can still Submit, then click Submit.
  const typeDesc = (ctrl: any, text: string) => {
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = text
    desc.dispatchEvent(new Event('input', { bubbles: true }))
  }

  it('adds the picked element crop to the strip; selector reaches the PAYLOAD, not the reporter UI', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: '1', issueUrl: '' }))
    const onPickElement = async () => ({ selector: '#broken', text: 'button "Save"', shot: 'data:image/png;base64,CROP' })
    const ctrl = buildModal('bug', { ...base, onSubmit, onPickElement })
    expect(q(ctrl, '.klavity-thumb')).toBeNull()
    q(ctrl, '#klavity-pick')!.dispatchEvent(new MouseEvent('click'))
    await flush()
    expect(ctrl.shadowRoot.querySelectorAll('.klavity-thumb').length).toBe(1)      // crop added
    // KLAVITYKLA-496: the raw CSS selector is NOT shown to the reporter (decluttered) — only a friendly pin.
    const pi = q(ctrl, '#klavity-pickinfo') as HTMLElement
    expect(pi.textContent).toContain('Element pinned')
    expect(pi.textContent).not.toContain('#broken')
    // …but it STILL travels on the submit payload as annotations.selector.
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await flush()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0].annotations.selector).toBe('#broken')
    ctrl.close()
  })

  it('respects the image cap — a crop is NOT added when the strip is already full (selector still in payload)', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: '1', issueUrl: '' }))
    const onPickElement = async () => ({ selector: '#broken', text: 't', shot: 'data:image/png;base64,CROP' })
    const ctrl = buildModal('bug', { ...base, onSubmit, onPickElement })
    for (let i = 0; i < 5; i++) ctrl.addScreenshot('data:image/png;base64,' + i) // fill to the cap (5)
    expect(ctrl.shadowRoot.querySelectorAll('.klavity-thumb').length).toBe(5)
    q(ctrl, '#klavity-pick')!.dispatchEvent(new MouseEvent('click'))
    await flush()
    expect(ctrl.shadowRoot.querySelectorAll('.klavity-thumb').length).toBe(5)       // cap held, no 6th
    expect((q(ctrl, '#klavity-err') as HTMLElement).textContent).toMatch(/up to 5/)
    // The selector still lands in the payload even though the crop was capped out — and is not shown raw.
    expect((q(ctrl, '#klavity-pickinfo') as HTMLElement).textContent).not.toContain('#broken')
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await flush()
    expect(onSubmit.mock.calls[0][0].annotations.selector).toBe('#broken')
    ctrl.close()
  })

  it('no crop supplied → only the selector is pinned to the payload (back-compat, no image, not shown raw)', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: '1', issueUrl: '' }))
    const onPickElement = async () => ({ selector: '#broken', text: 't' })
    const ctrl = buildModal('bug', { ...base, onSubmit, onPickElement })
    q(ctrl, '#klavity-pick')!.dispatchEvent(new MouseEvent('click'))
    await flush()
    expect(ctrl.shadowRoot.querySelectorAll('.klavity-thumb').length).toBe(0)
    expect((q(ctrl, '#klavity-pickinfo') as HTMLElement).textContent).not.toContain('#broken')
    typeDesc(ctrl, 'the Save button does nothing when I click it')
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await flush()
    expect(onSubmit.mock.calls[0][0].annotations.selector).toBe('#broken')
    ctrl.close()
  })
})

describe('buildModal voice input', () => {
  let mockSR: any
  function stubSR() {
    mockSR = { continuous: false, interimResults: false, lang: '', onresult: null, onerror: null, onend: null, start: vi.fn(), stop: vi.fn() }
    vi.stubGlobal('SpeechRecognition', vi.fn(() => mockSR))
  }
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

  it('renders mic button when SpeechRecognition supported', () => {
    stubSR()
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    expect(q(ctrl, '#klavity-voice')).not.toBeNull(); ctrl.close()
  })
  it('no mic button when SpeechRecognition unavailable', () => {
    vi.stubGlobal('SpeechRecognition', undefined); vi.stubGlobal('webkitSpeechRecognition', undefined)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    expect(q(ctrl, '#klavity-voice')).toBeNull(); ctrl.close()
  })
  it('appends transcript to desc', () => {
    stubSR()
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    q(ctrl, '#klavity-voice')!.dispatchEvent(new MouseEvent('click'))
    mockSR.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: 'hello world' }], { isFinal: true })] })
    expect((q(ctrl, '#klavity-desc') as HTMLTextAreaElement).value).toBe('hello world'); ctrl.close()
  })
  it('prepends space when desc has non-whitespace tail', () => {
    stubSR()
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement; desc.value = 'existing text'
    q(ctrl, '#klavity-voice')!.dispatchEvent(new MouseEvent('click'))
    mockSR.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: 'more text' }], { isFinal: true })] })
    expect(desc.value).toBe('existing text more text'); ctrl.close()
  })
  it('no extra space when desc ends with whitespace', () => {
    stubSR()
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement; desc.value = 'existing text '
    q(ctrl, '#klavity-voice')!.dispatchEvent(new MouseEvent('click'))
    mockSR.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: 'more text' }], { isFinal: true })] })
    expect(desc.value).toBe('existing text more text'); ctrl.close()
  })
  it('shows the error in the dedicated status row for not-allowed (KLAVITYKLA-495)', () => {
    stubSR()
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    q(ctrl, '#klavity-voice')!.dispatchEvent(new MouseEvent('click'))
    mockSR.onerror({ error: 'not-allowed' })
    const status = q(ctrl, '#klavity-voice-status') as HTMLElement
    expect(status.textContent).toBe('Microphone access was denied')
    expect(status.hidden).toBe(false)
    expect(status.classList.contains('kl-vs-err')).toBe(true)
    ctrl.close()
  })
  it('voice status row is a sibling ABOVE the clarity bar, never overlapping it (KLAVITYKLA-495)', () => {
    stubSR()
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    }, { reportClarity: true } as any)
    const status = q(ctrl, '#klavity-voice-status') as HTMLElement
    const clarity = q(ctrl, '#klavity-clarity') as HTMLElement
    expect(status).not.toBeNull()
    expect(clarity).not.toBeNull()
    // The status row is its own element (not injected inside/after the textarea) and precedes the clarity
    // helper in document order → they occupy separate rows instead of painting on top of each other.
    expect(status.parentElement).toBe(clarity.parentElement)
    expect(status.compareDocumentPosition(clarity) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    ctrl.close()
  })

  it('status row exists even when clarity is OFF — the fix does not depend on the helper (KLAVITYKLA-495)', () => {
    stubSR()
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    expect(q(ctrl, '#klavity-clarity')).toBeNull()          // no clarity panel at all
    expect(q(ctrl, '#klavity-voice-status')).not.toBeNull() // ...yet errors still get their own row
    ctrl.close()
  })

  it('error text lands ONLY in the status row, never inside the clarity panel (no overlap) (KLAVITYKLA-495)', () => {
    stubSR()
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    }, { reportClarity: true } as any)
    q(ctrl, '#klavity-voice')!.dispatchEvent(new MouseEvent('click'))
    mockSR.onerror({ error: 'not-allowed' })
    const status = q(ctrl, '#klavity-voice-status') as HTMLElement
    const clarity = q(ctrl, '#klavity-clarity') as HTMLElement
    expect(status.textContent).toContain('Microphone access was denied')
    // The clarity panel's own copy is untouched by the voice error — no painted-over collision.
    expect(clarity.textContent).not.toContain('Microphone access was denied')
    expect(clarity.textContent).toContain('Report clarity')
    ctrl.close()
  })

  // KLAVITYKLA-495 (server-STT primary path, shipped KLA-505): when the host wires onDictate AND
  // MediaRecorder is available, the Voice button drives LiveDictation against POST /api/voice/transcribe
  // (via the host callback) INSTEAD of Web Speech; a first-segment failure transparently falls back to
  // Web Speech mid-session without stopping the ring or asking for another click. Here we drive the real
  // composer wiring end-to-end with a mocked MediaRecorder + getUserMedia and an onDictate that resolves
  // null (endpoint down), asserting the fallback engine takes over while still recording.
  it('prefers the onDictate STT endpoint and transparently falls back to Web Speech when it fails', async () => {
    vi.useFakeTimers()
    stubSR()
    class MockMR {
      state = 'inactive'; ondataavailable: any = null; onstop: any = null
      static isTypeSupported(_m: string) { return true }
      constructor(public stream: any, public opts?: any) {}
      start() { this.state = 'recording' }
      stop() {
        if (this.state === 'inactive') return
        this.state = 'inactive'
        this.ondataavailable?.({ data: { size: 128 } })
        this.onstop?.()
      }
    }
    const stream = { getTracks: () => [{ stop: vi.fn() }] }
    vi.stubGlobal('navigator', Object.assign(Object.create(Object.getPrototypeOf(navigator)), navigator, {
      mediaDevices: { getUserMedia: vi.fn(async () => stream) },
    }))
    ;(globalThis as any).MediaRecorder = MockMR
    const transcribeCalls: Blob[] = []
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
      // The host's onDictate POSTs to /api/voice/transcribe; resolve null = endpoint down/unconfigured.
      onDictate: async (audio: Blob) => { transcribeCalls.push(audio); return null },
    })
    const voiceBtn = q(ctrl, '#klavity-voice') as HTMLButtonElement
    voiceBtn.dispatchEvent(new MouseEvent('click'))
    await vi.advanceTimersByTimeAsync(0)
    expect(voiceBtn.classList.contains('kl-voice-rec')).toBe(true)
    // First segment completes → onDictate (the endpoint call) ran → composer swaps to Web Speech.
    await vi.advanceTimersByTimeAsync(5000)
    expect(transcribeCalls.length).toBe(1)
    expect(transcribeCalls[0]).toBeInstanceOf(Blob)
    await vi.advanceTimersByTimeAsync(600)   // fallback start backoff + swap
    // Still recording through the SAME click — no second click required.
    expect(voiceBtn.classList.contains('kl-voice-rec')).toBe(true)
    // The fallback Web-Speech engine is live: its recognition instance received start().
    expect(mockSR.start).toHaveBeenCalled()
    // And a transcript from the fallback lands in the description.
    mockSR.onresult({ resultIndex: 0, results: [Object.assign([{ transcript: 'fallback words' }], { isFinal: true })] })
    expect((q(ctrl, '#klavity-desc') as HTMLTextAreaElement).value).toContain('fallback words')
    voiceBtn.click()   // stop
    ctrl.close()
    vi.unstubAllGlobals()
    delete (globalThis as any).MediaRecorder
    vi.useRealTimers()
  })
  it('resets button to idle state after 180s auto-stop', () => {
    vi.useFakeTimers()
    stubSR()
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    const voiceBtn = q(ctrl, '#klavity-voice') as HTMLButtonElement
    voiceBtn.dispatchEvent(new MouseEvent('click'))
    expect(voiceBtn.classList.contains('kl-voice-rec')).toBe(true)
    vi.advanceTimersByTime(180000)
    expect(voiceBtn.classList.contains('kl-voice-rec')).toBe(false)
    ctrl.close()
  })
})
