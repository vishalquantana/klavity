// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildModal } from '../src/modal'

beforeEach(() => { document.body.innerHTML = '' })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }
function type(ctrl: any, text: string) {
  const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
  desc.value = text
  desc.dispatchEvent(new Event('input', { bubbles: true }))
  return desc
}
const base = { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) }

describe('report-clarity helper — gating / back-compat', () => {
  it('does NOT render the helper when reportClarity is absent (classic composer, unchanged)', () => {
    const ctrl = buildModal('bug', { ...base })
    expect(q(ctrl, '#klavity-clarity')).toBeNull()
    expect(q(ctrl, '#klavity-nudge')).toBeNull()
    ctrl.close()
  })

  it('does NOT render the helper when reportClarity is false', () => {
    const ctrl = buildModal('bug', { ...base }, { reportClarity: false } as any)
    expect(q(ctrl, '#klavity-clarity')).toBeNull()
    ctrl.close()
  })

  it('renders the helper when reportClarity is true', () => {
    const ctrl = buildModal('bug', { ...base }, { reportClarity: true } as any)
    expect(q(ctrl, '#klavity-clarity')).not.toBeNull()
    expect(q(ctrl, '#klavity-nudge')).not.toBeNull()
    ctrl.close()
  })
})

describe('report-clarity helper — instant heuristic meter + chips', () => {
  it('hidden until the reporter types', () => {
    const ctrl = buildModal('bug', { ...base }, { reportClarity: true } as any)
    expect((q(ctrl, '#klavity-clarity') as HTMLElement).hidden).toBe(true)
    type(ctrl, 'the checkout page throws a 500 when I click Pay')
    expect((q(ctrl, '#klavity-clarity') as HTMLElement).hidden).toBe(false)
    ctrl.close()
  })

  it('vague text → l1 / Needs detail / no chips ticked', () => {
    const ctrl = buildModal('bug', { ...base }, { reportClarity: true } as any)
    type(ctrl, 'not working')
    const el = q(ctrl, '#klavity-clarity') as HTMLElement
    expect(el.classList.contains('l1')).toBe(true)
    expect((q(ctrl, '#klavity-clarity-status') as HTMLElement).textContent).toBe('Needs detail')
    expect((q(ctrl, '#klavity-clarity-problem') as HTMLElement).classList.contains('done')).toBe(false)
    ctrl.close()
  })

  it('clear full report → l3 / Great / all three chips ticked', () => {
    const ctrl = buildModal('bug', { ...base }, { reportClarity: true } as any)
    type(ctrl, 'On /checkout I enter SAVE10 and tap Apply. Nothing happens. I expected the total to drop 10%.')
    const el = q(ctrl, '#klavity-clarity') as HTMLElement
    expect(el.classList.contains('l3')).toBe(true)
    expect((q(ctrl, '#klavity-clarity-status') as HTMLElement).textContent).toBe('Great')
    expect((q(ctrl, '#klavity-clarity-problem') as HTMLElement).classList.contains('done')).toBe(true)
    expect((q(ctrl, '#klavity-clarity-expected') as HTMLElement).classList.contains('done')).toBe(true)
    expect((q(ctrl, '#klavity-clarity-repro') as HTMLElement).classList.contains('done')).toBe(true)
    ctrl.close()
  })
})

describe('report-clarity helper — debounced AI tip (cached, one call per change)', () => {
  it('calls onClarityTip once ~1s after typing stops and renders the tip; hides once Great', async () => {
    vi.useFakeTimers()
    const onClarityTip = vi.fn(async (_t: string) => ({ tip: "'Not working' is hard to act on - what did you expect instead?" }))
    const ctrl = buildModal('bug', { ...base, onClarityTip }, { reportClarity: true } as any)
    type(ctrl, "the coupon code doesn't apply on mobile cart")
    expect(onClarityTip).not.toHaveBeenCalled()        // debounced, not immediate
    await vi.advanceTimersByTimeAsync(1100)
    expect(onClarityTip).toHaveBeenCalledTimes(1)
    const tip = q(ctrl, '#klavity-clarity-tip') as HTMLElement
    expect(tip.hidden).toBe(false)
    expect(tip.textContent).toContain('hard to act on')

    // Re-typing the SAME trimmed text does not fire a second call (cache).
    type(ctrl, "the coupon code doesn't apply on mobile cart")
    await vi.advanceTimersByTimeAsync(1100)
    expect(onClarityTip).toHaveBeenCalledTimes(1)

    // Once the report becomes Great the tip is hidden (helper gets out of the way).
    type(ctrl, 'On /checkout I enter SAVE10 and tap Apply. Nothing happens. I expected the total to drop 10%.')
    await vi.advanceTimersByTimeAsync(1100)
    expect((q(ctrl, '#klavity-clarity-tip') as HTMLElement).hidden).toBe(true)
    ctrl.close()
    vi.useRealTimers()
  })

  // KLAVITYKLA-492: the modal forwards the already-captured screenshot count to onClarityTip so the host can
  // send it (+ pageUrl/browser/screen) to the server and the coach never asks for context we already have.
  it('passes the current screenshot count as ctx.images to onClarityTip', async () => {
    vi.useFakeTimers()
    const onClarityTip = vi.fn(async (_t: string, _ctx?: { images?: number }) => ({ tip: 'add a repro step' }))
    const ctrl = buildModal('bug', { ...base, onClarityTip }, { reportClarity: true } as any)
    ctrl.addScreenshot('data:image/png;base64,AAAA')
    ctrl.addScreenshot('data:image/png;base64,BBBB')
    type(ctrl, "the coupon code doesn't apply on mobile cart")
    await vi.advanceTimersByTimeAsync(1100)
    expect(onClarityTip).toHaveBeenCalledTimes(1)
    expect(onClarityTip.mock.calls[0][1]).toEqual({ images: 2 })
    ctrl.close()
    vi.useRealTimers()
  })
})

describe('report-clarity helper — Submit is NEVER blocked by clarity (#497)', () => {
  it('weak text: Submit submits on the FIRST click — no nudge gate, no second click', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: '1', issueUrl: '' }))
    const ctrl = buildModal('bug', { ...base, onSubmit }, { reportClarity: true } as any)
    type(ctrl, 'broken pls fix')   // weakest ('needs') band — the old code would have blocked this
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false)   // there IS a description → Submit is enabled
    submit.click()
    await new Promise(r => setTimeout(r, 0))
    // FIRST click submits — no interception, no "Submit anyway" second step.
    expect(onSubmit).toHaveBeenCalledTimes(1)
    ctrl.close()
  })

  it('empty description with an attached screenshot submits in one click (no clarity gate)', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: '1', issueUrl: '' }))
    const ctrl = buildModal('bug', { ...base, onSubmit }, { reportClarity: true } as any)
    ctrl.addScreenshot('data:image/png;base64,AAAA')   // evidence → Submit enabled even with no description
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    submit.click()
    await new Promise(r => setTimeout(r, 0))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    ctrl.close()
  })

  it('good/great report submits directly with no nudge', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: '1', issueUrl: '' }))
    const ctrl = buildModal('bug', { ...base, onSubmit }, { reportClarity: true } as any)
    type(ctrl, "The coupon SAVE10 doesn't apply on mobile cart - I tap Apply, nothing happens")
    // Nudge stays hidden through the click (checked synchronously, before the success card swaps the body).
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    expect((q(ctrl, '#klavity-nudge') as HTMLElement).hidden).toBe(true)
    await new Promise(r => setTimeout(r, 0))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    ctrl.close()
  })
})

// KLAVITYKLA-497 (widget half): the pre-submit nudge is config-gated via `preSubmitNudge` — DEFAULT shown as
// a non-blocking warning; only an explicit false suppresses it. Submit ALWAYS works either way.
describe('report-clarity helper — pre-submit nudge is config-gated (preSubmitNudge)', () => {
  it('DEFAULT (flag absent): the nudge renders and Submit is always enabled with a description', () => {
    const ctrl = buildModal('bug', { ...base }, { reportClarity: true } as any)
    expect(q(ctrl, '#klavity-nudge')).not.toBeNull()   // shown by default
    type(ctrl, 'broken pls fix')
    expect((q(ctrl, '#klavity-submit') as HTMLButtonElement).disabled).toBe(false)  // never a block
    ctrl.close()
  })

  it('preSubmitNudge:true renders the nudge (same as default)', () => {
    const ctrl = buildModal('bug', { ...base }, { reportClarity: true, preSubmitNudge: true } as any)
    expect(q(ctrl, '#klavity-nudge')).not.toBeNull()
    ctrl.close()
  })

  it('preSubmitNudge:false does NOT render the nudge, and weak text submits STRAIGHT through (no nudge step)', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: '1', issueUrl: '' }))
    const ctrl = buildModal('bug', { ...base, onSubmit }, { reportClarity: true, preSubmitNudge: false } as any)
    // The nudge element is not rendered at all.
    expect(q(ctrl, '#klavity-nudge')).toBeNull()
    type(ctrl, 'broken pls fix')   // weak text that WOULD have nudged
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    submit.click()
    await new Promise(r => setTimeout(r, 0))
    // No nudge interception — Submit fires immediately even on weak text.
    expect(onSubmit).toHaveBeenCalledTimes(1)
    ctrl.close()
  })

  it('the clarity meter still renders when only the nudge is suppressed', () => {
    const ctrl = buildModal('bug', { ...base }, { reportClarity: true, preSubmitNudge: false } as any)
    expect(q(ctrl, '#klavity-clarity')).not.toBeNull()   // clarity helper unaffected
    expect(q(ctrl, '#klavity-nudge')).toBeNull()
    ctrl.close()
  })
})
