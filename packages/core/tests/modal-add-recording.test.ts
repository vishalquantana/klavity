// @vitest-environment jsdom
// KD-163: a recording recovered after a page navigation can be attached to an open composer.
import { describe, it, expect, beforeEach } from 'vitest'
import { buildModal } from '../src/modal'
import type { ReportRecording } from '../src/types'

beforeEach(() => { document.body.innerHTML = '' })

const rec = (id: string): ReportRecording => ({
  id, dataUrl: 'data:video/webm;base64,QQ==', mime: 'video/webm', durationMs: 5000, bytes: 1024, width: 1280, height: 720, screenOnly: true,
})
const mk = () => buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => null, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
const chips = (ctrl: any) => ctrl.shadowRoot.querySelectorAll('.kl-rec-tile').length

describe('ModalController.addRecording', () => {
  it('attaches a recording and renders it in the recordings area', () => {
    const ctrl = mk()
    expect(chips(ctrl)).toBe(0)
    expect(ctrl.addRecording(rec('rec_a'))).toBe(true)
    expect(chips(ctrl)).toBe(1)
    ctrl.close()
  })

  it('refuses beyond the per-report cap (2) without throwing', () => {
    const ctrl = mk()
    expect(ctrl.addRecording(rec('rec_a'))).toBe(true)
    expect(ctrl.addRecording(rec('rec_b'))).toBe(true)
    expect(ctrl.addRecording(rec('rec_c'))).toBe(false)
    ctrl.close()
  })

  it('returns false once the composer is closed', () => {
    const ctrl = mk()
    ctrl.close()
    expect(ctrl.addRecording(rec('rec_a'))).toBe(false)
  })
})
