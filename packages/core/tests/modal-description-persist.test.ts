// KD-166: a real page navigation (e.g. the reporter following a link out of the SPA entirely) tears
// down the composer. The evidence session already recovers a captured screenshot in that case — this
// covers the other half: the TYPED description must be persisted too (debounced, via onDescriptionChange)
// so a resumed report doesn't come back with the shot but no words.
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildModal } from '../src/modal'

beforeEach(() => { document.body.innerHTML = ''; vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }
function type(ctrl: any, text: string) {
  const desc = q(ctrl, '#klavity-desc') as HTMLElement & { value: string }
  desc.value = text
  desc.dispatchEvent(new Event('input', { bubbles: true }))
  return desc
}
const base = { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) }

describe('onDescriptionChange (KD-166)', () => {
  it('is NOT called when absent — full back-compat with the classic composer', () => {
    const ctrl = buildModal('bug', { ...base })
    type(ctrl, 'no crash from typing without the callback wired')
    vi.advanceTimersByTime(2000)
    ctrl.close() // would throw if anything inside tried to call an undefined callback
  })

  it('fires ~600ms after typing pauses, with the current full text', () => {
    const onDescriptionChange = vi.fn()
    const ctrl = buildModal('bug', { ...base, onDescriptionChange })
    type(ctrl, 'the checkout button does nothing on mobile')
    expect(onDescriptionChange).not.toHaveBeenCalled() // not yet — still within the debounce window
    vi.advanceTimersByTime(599)
    expect(onDescriptionChange).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onDescriptionChange).toHaveBeenCalledTimes(1)
    expect(onDescriptionChange).toHaveBeenCalledWith('the checkout button does nothing on mobile')
    ctrl.close()
  })

  it('coalesces rapid keystrokes into a single call (debounced, not per-keystroke)', () => {
    const onDescriptionChange = vi.fn()
    const ctrl = buildModal('bug', { ...base, onDescriptionChange })
    type(ctrl, 'a'); vi.advanceTimersByTime(200)
    type(ctrl, 'ab'); vi.advanceTimersByTime(200)
    type(ctrl, 'abc'); vi.advanceTimersByTime(200)
    expect(onDescriptionChange).not.toHaveBeenCalled() // each keystroke reset the timer
    vi.advanceTimersByTime(600)
    expect(onDescriptionChange).toHaveBeenCalledTimes(1)
    expect(onDescriptionChange).toHaveBeenCalledWith('abc')
    ctrl.close()
  })

  it('a throwing callback never breaks typing or Submit', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: '1', issueUrl: '' }))
    const onDescriptionChange = vi.fn(() => { throw new Error('storage exploded') })
    const ctrl = buildModal('bug', { ...base, onSubmit, onDescriptionChange })
    type(ctrl, 'still submittable even if persistence throws')
    vi.advanceTimersByTime(600)
    expect(onDescriptionChange).toHaveBeenCalledTimes(1)
    const desc = q(ctrl, '#klavity-desc') as HTMLElement & { value: string }
    expect(desc.value).toBe('still submittable even if persistence throws')
    vi.useRealTimers() // Submit's async chain needs real microtask scheduling
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await new Promise((r) => setTimeout(r, 0))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    ctrl.close()
  })
})
