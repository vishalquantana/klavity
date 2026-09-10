// @vitest-environment jsdom
// KLA-773: closing an active capture (screenshot / recording / replay / files) must PROMPT to discard,
// not throw the evidence away silently. The X button, backdrop click and Esc key are guarded by an
// in-modal confirm card when hasEvidence() is true; "Discard" closes, "Keep editing" dismisses the card.
// An empty composer (no evidence) still closes in one click. Minimize stays unguarded (non-destructive).
import { describe, it, expect, beforeEach } from 'vitest'
import { buildModal } from '../src/modal'

beforeEach(() => { document.body.innerHTML = '' })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }
function isMounted(ctrl: any) { return document.body.contains(ctrl.shadowRoot.host) }

describe('KLA-773 close-with-evidence discard guard', () => {
  it('clicking X with a screenshot shows the discard confirm instead of closing', async () => {
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'data:image/png;base64,SHOT',
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    })
    ctrl.addScreenshot('data:image/png;base64,SHOT')
    await new Promise(r => setTimeout(r, 0))
    ;(q(ctrl, '#klavity-x') as HTMLButtonElement).click()
    // Still mounted; a confirm card is showing.
    expect(isMounted(ctrl)).toBe(true)
    expect(q(ctrl, '#kl-cc-discard')).not.toBeNull()
    expect(q(ctrl, '#kl-cc-keep')).not.toBeNull()
    ctrl.close()
  })

  it('"Keep editing" dismisses the confirm and leaves the modal open', async () => {
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    })
    ctrl.addScreenshot('data:image/png;base64,SHOT')
    await new Promise(r => setTimeout(r, 0))
    ;(q(ctrl, '#klavity-x') as HTMLButtonElement).click()
    ;(q(ctrl, '#kl-cc-keep') as HTMLButtonElement).click()
    expect(q(ctrl, '#kl-cc-keep')).toBeNull() // card gone
    expect(isMounted(ctrl)).toBe(true)        // modal still up
    ctrl.close()
  })

  it('"Discard" tears the modal down', async () => {
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    })
    ctrl.addScreenshot('data:image/png;base64,SHOT')
    await new Promise(r => setTimeout(r, 0))
    ;(q(ctrl, '#klavity-x') as HTMLButtonElement).click()
    ;(q(ctrl, '#kl-cc-discard') as HTMLButtonElement).click()
    await new Promise(r => setTimeout(r, 720)) // genie-out + safety timer
    expect(isMounted(ctrl)).toBe(false)
  })

  it('the global "S" submit shortcut is blocked while the discard card is open (no submit from behind it)', async () => {
    let submitted = 0
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => { submitted++; return { issueKey: '1', issueUrl: '' } },
    })
    ctrl.addScreenshot('data:image/png;base64,SHOT')
    await new Promise(r => setTimeout(r, 0))
    ;(q(ctrl, '#klavity-x') as HTMLButtonElement).click()
    expect(q(ctrl, '#kl-cc-discard')).not.toBeNull() // card open
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }))
    await new Promise(r => setTimeout(r, 0))
    expect(submitted).toBe(0)                 // did NOT submit
    expect(q(ctrl, '#kl-cc-discard')).not.toBeNull() // card still open
    ctrl.close()
  })

  it('an empty composer (no evidence) still closes immediately on X', async () => {
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    })
    ;(q(ctrl, '#klavity-x') as HTMLButtonElement).click()
    expect(q(ctrl, '#kl-cc-discard')).toBeNull() // no confirm card
    await new Promise(r => setTimeout(r, 720))
    expect(isMounted(ctrl)).toBe(false)
  })
})
