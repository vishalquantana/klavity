// @vitest-environment jsdom
// Bug fix (multi-page evidence editor): capturing a NEW screenshot must make it the ACTIVE hero image,
// not keep the editor pinned to the first shot. addScreenshot(...) sets activeIndex to the last shot for
// genuine user captures (fireAdded=true); the seed path (controller.addScreenshot, fireAdded=false) leaves it.
import { describe, it, expect, beforeEach } from 'vitest'
import { buildModal } from '../src/modal'

beforeEach(() => { document.body.innerHTML = '' })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }
function qa(ctrl: any, sel: string) { return Array.from(ctrl.shadowRoot.querySelectorAll(sel)) as HTMLElement[] }

describe('active shot follows the newest capture', () => {
  it('capturing a 2nd shot makes activeIndex the last shot (its strip thumb is active)', async () => {
    let n = 0
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => `data:image/png;base64,SHOT${n++}`,
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    })
    const full = q(ctrl, '#klavity-full') as HTMLButtonElement
    full.click(); await new Promise(r => setTimeout(r, 0))
    full.click(); await new Promise(r => setTimeout(r, 0))

    const thumbs = qa(ctrl, '.kl-thumb-active')
    expect(thumbs).toHaveLength(1)
    // The active thumb must be the LAST one in the strip, not the first.
    const allWraps = qa(ctrl, '.klavity-strip > *')
    expect(allWraps.length).toBeGreaterThanOrEqual(2)
    expect(allWraps[allWraps.length - 1].classList.contains('kl-thumb-active')).toBe(true)
    expect(allWraps[0].classList.contains('kl-thumb-active')).toBe(false)
    ctrl.close()
  })

  it('addCapturedShot selects the newest shot even after silent seeds (region-into-open-composer / reopen)', async () => {
    // Bug 3: two shots are seeded (fireAdded=false, activeIndex stays 0), then a freshly-captured region
    // shot arrives via addCapturedShot — it must become the SELECTED/active hero at the END of the strip.
    const added: string[] = []
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
      onShotAdded: (d: string) => added.push(d),
    })
    ctrl.addScreenshot('data:image/png;base64,SEED0')
    ctrl.addScreenshot('data:image/png;base64,SEED1')
    ctrl.addCapturedShot('data:image/png;base64,REGION', undefined, undefined, false)
    await new Promise(r => setTimeout(r, 0))
    const allWraps = qa(ctrl, '.klavity-strip > *')
    expect(allWraps.length).toBe(3)
    // The just-captured (last) shot is active; the first seed is not.
    expect(allWraps[allWraps.length - 1].classList.contains('kl-thumb-active')).toBe(true)
    expect(allWraps[0].classList.contains('kl-thumb-active')).toBe(false)
    // addCapturedShot fires onShotAdded (persist); the silent seeds do not.
    expect(added).toEqual(['data:image/png;base64,REGION'])
    ctrl.close()
  })

  it('the seed path (controller.addScreenshot, fireAdded=false) keeps activeIndex at 0', async () => {
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    })
    ctrl.addScreenshot('data:image/png;base64,SEED0')
    ctrl.addScreenshot('data:image/png;base64,SEED1')
    await new Promise(r => setTimeout(r, 0))
    const allWraps = qa(ctrl, '.klavity-strip > *')
    expect(allWraps.length).toBeGreaterThanOrEqual(2)
    // Seeded shots must NOT steal the active slot — index 0 stays active.
    expect(allWraps[0].classList.contains('kl-thumb-active')).toBe(true)
    expect(allWraps[allWraps.length - 1].classList.contains('kl-thumb-active')).toBe(false)
    ctrl.close()
  })
})
