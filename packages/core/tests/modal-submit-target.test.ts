// @vitest-environment jsdom
// KLA submit-target: the "Where should this go?" segmented control lets a reporter send the report to
// their own team (default) or to Klavity (dogfood: "the tool is broken"). These tests prove the control
// renders by default, defaults to 'project' (never surprise-routes to Klavity), rides the choice through
// onSubmit, uses the real project display name, and can be disabled per-project.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildModal } from '../src/modal'

beforeEach(() => { document.body.innerHTML = '' })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }
const ok = async () => ({ issueKey: 'K-1', issueUrl: '' })
async function tick() { await new Promise(r => setTimeout(r, 0)) }

describe('KLA submit-target — segmented control', () => {
  it('renders by default (submitTargetToggle defaults ON) with both options', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    expect(q(ctrl, '#klavity-target')).not.toBeNull()
    expect(q(ctrl, '#klavity-target-project')).not.toBeNull()
    expect(q(ctrl, '#klavity-target-klavity')).not.toBeNull()
    // "Your team" starts selected — we NEVER default to Klavity.
    expect(q(ctrl, '#klavity-target-project')!.classList.contains('on')).toBe(true)
    expect(q(ctrl, '#klavity-target-project')!.getAttribute('aria-checked')).toBe('true')
    expect(q(ctrl, '#klavity-target-klavity')!.classList.contains('on')).toBe(false)
    ctrl.close()
  })

  it('shows the real project display name as the "Your team" sub-label', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok }, { projectDisplayName: 'PX4 Project' })
    const sub = q(ctrl, '#klavity-target-project small')!
    expect(sub.textContent).toBe('PX4 Project')
    ctrl.close()
  })

  it('falls back to a generic caption when no project name is supplied', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    expect(q(ctrl, '#klavity-target-project small')!.textContent).toBe('your project')
    ctrl.close()
  })

  it("defaults feedbackTarget to 'project' when the reporter doesn't touch the control", async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit })
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'checkout button dead'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ feedbackTarget: 'project' }))
    ctrl.close()
  })

  it("rides feedbackTarget:'klavity' through onSubmit after the reporter taps Klavity", async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit })
    ;(q(ctrl, '#klavity-target-klavity') as HTMLButtonElement).click()
    // The tap flips the selected state.
    expect(q(ctrl, '#klavity-target-klavity')!.classList.contains('on')).toBe(true)
    expect(q(ctrl, '#klavity-target-klavity')!.getAttribute('aria-checked')).toBe('true')
    expect(q(ctrl, '#klavity-target-project')!.classList.contains('on')).toBe(false)
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'the widget itself is broken'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ feedbackTarget: 'klavity' }))
    ctrl.close()
  })

  it('can switch back to Your team after picking Klavity', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit })
    ;(q(ctrl, '#klavity-target-klavity') as HTMLButtonElement).click()
    ;(q(ctrl, '#klavity-target-project') as HTMLButtonElement).click()
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'never mind, this is a site bug'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ feedbackTarget: 'project' }))
    ctrl.close()
  })

  it('is hidden — and omits feedbackTarget — when disabled per-project (submitTargetToggle:false)', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit }, { submitTargetToggle: false })
    expect(q(ctrl, '#klavity-target')).toBeNull()
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'a bug'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect('feedbackTarget' in onSubmit.mock.calls[0][0]).toBe(false)
    ctrl.close()
  })
})
