// @vitest-environment jsdom
// KLAVITYKLA-438 "Record me" (Phase 1) — composer integration.
// The record button is gated behind the opt-in allowRecording + onRecord callbacks (back-compat: a
// composer without them is identical to today), a resolved recording renders as a removable video chip,
// and it threads through onSubmit as `recordings`.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildModal } from '../src/modal'
import type { ReportRecording } from '../src/types'

beforeEach(() => { document.body.innerHTML = '' })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }

const sampleRecording: ReportRecording = {
  id: 'rec_test123',
  dataUrl: 'data:video/webm;base64,QQ==',
  mime: 'video/webm',
  durationMs: 41000,
  bytes: 15 * 1024 * 1024,
  width: 1280,
  height: 720,
  screenOnly: false,
}

describe('buildModal "Record me" gating', () => {
  it('does NOT render the Record me button by default (back-compat)', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    expect(q(ctrl, '#klavity-record')).toBeNull()
    expect(q(ctrl, '#klavity-recordings')).toBeNull()
    ctrl.close()
  })

  it('does NOT render the button when allowRecording is set but onRecord is missing', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    expect(q(ctrl, '#klavity-record')).toBeNull()
    ctrl.close()
  })

  it('renders the Record me button when allowRecording + onRecord are provided', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => null, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    expect(q(ctrl, '#klavity-record')).not.toBeNull()
    ctrl.close()
  })
})

describe('buildModal "Record me" attach + submit', () => {
  it('clicking Record → onRecord resolves → a video chip appears in the recordings strip', async () => {
    const onRecord = vi.fn(async () => sampleRecording)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    ;(q(ctrl, '#klavity-record') as HTMLButtonElement).click()
    await new Promise(r => setTimeout(r, 0))
    expect(onRecord).toHaveBeenCalledTimes(1)
    const strip = q(ctrl, '#klavity-recordings')!
    expect(strip.hidden).toBe(false)
    const chip = strip.querySelector('.kl-rec-chip')
    expect(chip).not.toBeNull()
    expect(chip!.textContent).toContain('0:41') // 41s duration rendered
    ctrl.close()
  })

  it('a null onRecord result (cancel) adds no chip', async () => {
    const onRecord = vi.fn(async () => null)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    ;(q(ctrl, '#klavity-record') as HTMLButtonElement).click()
    await new Promise(r => setTimeout(r, 0))
    expect(q(ctrl, '#klavity-recordings')!.querySelector('.kl-rec-chip')).toBeNull()
    ctrl.close()
  })

  it('remove button drops the recording chip', async () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => sampleRecording, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    ;(q(ctrl, '#klavity-record') as HTMLButtonElement).click()
    await new Promise(r => setTimeout(r, 0))
    ;(q(ctrl, '#klavity-recordings')!.querySelector('.kl-file-rm') as HTMLButtonElement).click()
    expect(q(ctrl, '#klavity-recordings')!.querySelector('.kl-rec-chip')).toBeNull()
    ctrl.close()
  })

  it('threads recordings through onSubmit (recording-only report is valid)', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: 'fb_1', issueUrl: '' }))
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => sampleRecording, onSubmit })
    ;(q(ctrl, '#klavity-record') as HTMLButtonElement).click()
    await new Promise(r => setTimeout(r, 0))
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false) // evidence present → submit enabled with no typed text
    submit.click()
    await new Promise(r => setTimeout(r, 0))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    const payload = onSubmit.mock.calls[0][0]
    expect(payload.recordings).toHaveLength(1)
    expect(payload.recordings[0].id).toBe('rec_test123')
    ctrl.close()
  })
})
