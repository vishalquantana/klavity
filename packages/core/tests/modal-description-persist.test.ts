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

// KD-1004: the page-unload flush belongs to an OPEN composer only. After a report is submitted (composer
// closed) a refresh used to fire it anyway, writing the submitted text back into the saved draft — the
// reloaded page then showed a "Bug report in progress - not lost" dock for a ticket that already existed.
describe('page-unload flush (KD-1004)', () => {
  it('flushes the description and title on unload while the composer is open', () => {
    const onDescriptionChange = vi.fn()
    const ctrl = buildModal('bug', { ...base, onDescriptionChange })
    type(ctrl, 'still typing when the tab reloads')
    window.dispatchEvent(new Event('beforeunload'))
    expect(onDescriptionChange).toHaveBeenLastCalledWith('still typing when the tab reloads')
    ctrl.close()
  })

  it('never writes the old text back after the composer closed (submitted / X)', () => {
    const onDescriptionChange = vi.fn()
    const onTitleChange = vi.fn()
    const ctrl = buildModal('bug', { ...base, onDescriptionChange, onTitleChange })
    type(ctrl, 'Checkout button does nothing')
    vi.advanceTimersByTime(600)
    onDescriptionChange.mockClear(); onTitleChange.mockClear()
    ctrl.close({ immediate: true, reason: 'submitted' } as any)
    window.dispatchEvent(new Event('beforeunload'))
    window.dispatchEvent(new Event('pagehide'))
    expect(onDescriptionChange).not.toHaveBeenCalled()
    expect(onTitleChange).not.toHaveBeenCalled()
  })
})
