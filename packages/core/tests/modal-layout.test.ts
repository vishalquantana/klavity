// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { buildModal } from '../src/modal'

const ok = async () => ({ issueKey: '1', issueUrl: '' })

describe('image-hero two-pane layout', () => {
  it('renders a hero pane and a side pane that holds the existing controls', () => {
    const c = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    const modal = c.shadowRoot.querySelector('.klavity-modal')!
    // hero (left) + side (right) panes exist
    expect(modal.querySelector('.kl-hero')).toBeTruthy()
    const side = modal.querySelector('.kl-side')
    expect(side).toBeTruthy()
    // the load-bearing controls live inside the side column now
    expect(side!.querySelector('.klavity-toggle')).toBeTruthy()
    expect(side!.querySelector('#klavity-desc')).toBeTruthy()
    expect(side!.querySelector('#klavity-submit')).toBeTruthy()
    // capture actions stay in the side column
    expect(side!.querySelector('.klavity-actions')).toBeTruthy()
    // the screenshot strip lives in the hero column
    expect(modal.querySelector('.kl-hero .klavity-strip')).toBeTruthy()
    c.close()
  })
})
