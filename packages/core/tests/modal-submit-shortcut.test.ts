// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { buildModal } from '../src/modal'

const ok = async () => ({ issueKey: '1', issueUrl: '' })
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

function press(key: string, target?: EventTarget) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true })
  ;(target ?? document).dispatchEvent(e)
}

describe('S submits the report', () => {
  it('does nothing while a text field is focused', () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG) // enables Submit
    const submit = c.shadowRoot.getElementById('klavity-submit') as HTMLButtonElement
    const clickSpy = vi.spyOn(submit, 'click')
    const desc = c.shadowRoot.getElementById('klavity-desc') as HTMLTextAreaElement
    press('s', desc)
    expect(clickSpy).not.toHaveBeenCalled()
    c.close()
  })

  it('clicks Submit when not typing and Submit is enabled', () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG)
    const submit = c.shadowRoot.getElementById('klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    const clickSpy = vi.spyOn(submit, 'click')
    press('s')
    expect(clickSpy).toHaveBeenCalledTimes(1)
    c.close()
  })

  // Regression: real keystrokes are composed:true and cross the shadow boundary, so at the
  // document-level capture listener e.target is RETARGETED to the shadow host — an e.target-based
  // "am I typing?" guard is fooled and 's'/'S' submits mid-word (the char is also eaten). The guard
  // must read composedPath()[0] to see the real focused field.
  it('does nothing while typing a COMPOSED "s" in the description field (shadow-DOM retargeting)', () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG) // enables Submit
    const submit = c.shadowRoot.getElementById('klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    const clickSpy = vi.spyOn(submit, 'click')
    const desc = c.shadowRoot.getElementById('klavity-desc') as HTMLTextAreaElement
    const e = new KeyboardEvent('keydown', { key: 's', bubbles: true, composed: true, cancelable: true })
    desc.dispatchEvent(e)
    expect(clickSpy).not.toHaveBeenCalled()
    expect(e.defaultPrevented).toBe(false) // the character must NOT be eaten
    c.close()
  })

  it('still submits on a COMPOSED "s" when focus is NOT in a field (target retargets to host, but path[0] is not editable)', () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    c.addScreenshot(PNG)
    const submit = c.shadowRoot.getElementById('klavity-submit') as HTMLButtonElement
    const clickSpy = vi.spyOn(submit, 'click')
    // dispatch from a non-editable element inside the shadow root
    const nonField = c.shadowRoot.getElementById('klavity-submit') as HTMLElement
    nonField.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true, composed: true }))
    expect(clickSpy).toHaveBeenCalledTimes(1)
    c.close()
  })

  it('does nothing when Submit is still disabled (no evidence)', () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    const submit = c.shadowRoot.getElementById('klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(true)
    const clickSpy = vi.spyOn(submit, 'click')
    press('s')
    expect(clickSpy).not.toHaveBeenCalled()
    c.close()
  })
})
