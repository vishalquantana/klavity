// @vitest-environment jsdom
//
// KLA-412 — buildModal multi-page evidence surface. Verifies the additive opts (onMinimize / per-shot
// page labels / onShotAdded / onShotRemoved) render + fire, AND that WITHOUT them the composer is
// byte-for-structure identical to before (back-compat is mandatory).

import { describe, it, expect } from 'vitest'
import { buildModal } from '../src/modal'

const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4kwAAAAASUVORK5CYII='

const base = () => ({
  onCaptureFull: async () => PNG,
  onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
})

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }

describe('buildModal — KLA-412 session mode (onMinimize provided)', () => {
  it('renders the minimize button', () => {
    const ctrl = buildModal('bug', { ...base(), onMinimize: () => {} })
    expect(q(ctrl, '#klavity-min')).toBeTruthy()
    ctrl.close()
  })

  it('minimize button invokes onMinimize', () => {
    let hits = 0
    const ctrl = buildModal('bug', { ...base(), onMinimize: () => { hits++ } })
    ;(q(ctrl, '#klavity-min') as HTMLButtonElement).click()
    expect(hits).toBe(1)
    ctrl.close()
  })

  it('renders a per-shot page label for a shot seeded with page metadata', () => {
    const ctrl = buildModal('bug', { ...base(), onMinimize: () => {} })
    ctrl.addScreenshot(PNG, 'rendered', { pageUrl: 'https://app.example.com/deals', pagePath: '/deals', label: 'list' })
    const label = q(ctrl, '.klavity-pglabel')
    expect(label).toBeTruthy()
    expect(label!.textContent).toContain('/deals')
    expect(label!.textContent).toContain('list')
    ctrl.close()
  })

  it('raises the image cap to 8 in session mode', () => {
    const ctrl = buildModal('bug', { ...base(), onMinimize: () => {} })
    expect(q(ctrl, '#klavity-counter')!.textContent).toContain('/8')
    ctrl.close()
  })

  it('does NOT fire onShotAdded for host-seeded shots (controller.addScreenshot)', () => {
    let added = 0
    const ctrl = buildModal('bug', { ...base(), onMinimize: () => {}, onShotAdded: () => { added++ } })
    ctrl.addScreenshot(PNG, 'rendered', { pagePath: '/a' })
    expect(added).toBe(0)
    ctrl.close()
  })

  it('fires onShotRemoved with the strip index when a thumbnail is removed', () => {
    const removed: number[] = []
    const ctrl = buildModal('bug', { ...base(), onMinimize: () => {}, onShotRemoved: (i: number) => removed.push(i) })
    ctrl.addScreenshot(PNG, 'rendered', { pagePath: '/a' })
    const rm = ctrl.shadowRoot.querySelector('.klavity-rm') as HTMLButtonElement
    rm.click()
    expect(removed).toEqual([0])
    ctrl.close()
  })
})

describe('buildModal — back-compat (no new opts)', () => {
  it('renders NO minimize button', () => {
    const ctrl = buildModal('bug', base())
    expect(q(ctrl, '#klavity-min')).toBeNull()
    ctrl.close()
  })

  it('keeps the image cap at 5', () => {
    const ctrl = buildModal('bug', base())
    expect(q(ctrl, '#klavity-counter')!.textContent).toContain('/5')
    ctrl.close()
  })

  it('renders NO page label for a shot added without page metadata', () => {
    const ctrl = buildModal('bug', base())
    ctrl.addScreenshot(PNG, 'rendered')
    expect(q(ctrl, '.klavity-pglabel')).toBeNull()
    ctrl.close()
  })
})
