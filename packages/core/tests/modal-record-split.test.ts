// @vitest-environment jsdom
// KD-995: split ONE "Record me" walkthrough into separate tickets. After a recording is attached the composer
// hands the clip to onSplitRecording; with 2+ issues it shows an editable review panel and Submit files one
// ticket per ticked issue (issue #1 keeps the video). 0/1 issues, "Keep as one ticket" or no callback → the
// classic single-ticket submit.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildModal, formatSplitSpan, buildSplitDescription, type SplitIssueLike } from '../src/modal'
import type { ReportRecording } from '../src/types'

beforeEach(() => { document.body.innerHTML = '' })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }
const flush = async () => { for (let i = 0; i < 6; i++) await new Promise(r => setTimeout(r, 0)) }

const rec: ReportRecording = {
  id: 'rec_split1',
  dataUrl: 'data:video/webm;base64,QQ==',
  blob: new Blob(['QQ'], { type: 'video/webm' }),
  mime: 'video/webm',
  durationMs: 30000,
  bytes: 2,
  width: 1280,
  height: 720,
  screenOnly: false,
}

const ISSUES: SplitIssueLike[] = [
  { title: 'Save stays disabled', description: 'Editing the name never enables Save.', kind: 'bug', startSec: 2, endSec: 14 },
  { title: 'Add dark mode', description: 'Reporter wants a dark theme.', kind: 'feature', startSec: 15, endSec: 72 },
  { title: 'Avatar upload spins forever', description: 'Upload never finishes.', kind: 'bug', startSec: null, endSec: null },
]

async function openWithRecording(issues: SplitIssueLike[] | null, onSubmit = vi.fn(async () => ({ issueKey: 'KLA-7', issueUrl: '' }))) {
  const onSplitRecording = vi.fn(async () => issues)
  const ctrl = buildModal('bug', {
    onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => rec, onSplitRecording, onSubmit,
  } as any)
  ;(q(ctrl, '#klavity-record') as HTMLButtonElement).click()
  await flush()
  return { ctrl, onSubmit, onSplitRecording }
}

describe('Record-me split helpers', () => {
  it('formatSplitSpan', () => {
    expect(formatSplitSpan(42, 70)).toBe('0:42–1:10')
    expect(formatSplitSpan(5, null)).toBe('0:05')
    expect(formatSplitSpan(null, null)).toBe('')
    expect(formatSplitSpan(9, 3)).toBe('0:09')
  })
  it('buildSplitDescription keeps the reporter note on #1 and points extras back at the video', () => {
    expect(buildSplitDescription(ISSUES[0], { primary: true, reporterNote: 'two things broke' }))
      .toBe('Editing the name never enables Save.\n\nReporter note:\ntwo things broke')
    expect(buildSplitDescription(ISSUES[0], { primary: true })).toBe('Editing the name never enables Save.')
    const extra = buildSplitDescription(ISSUES[1], { primary: false, videoTitle: 'Save stays disabled', videoKey: 'KLA-7' })
    expect(extra).toContain('Reporter wants a dark theme.')
    expect(extra).toContain('(at 0:15–1:12)')
    expect(extra).toContain('KLA-7 (“Save stays disabled”)')
  })
})

describe('buildModal Record-me split', () => {
  it('sends the attached clip to onSplitRecording and shows one editable card per issue', async () => {
    const { ctrl, onSplitRecording } = await openWithRecording(ISSUES)
    expect(onSplitRecording).toHaveBeenCalledTimes(1)
    expect((onSplitRecording.mock.calls[0] as any[])[0]).toBe(rec.blob)
    const panel = q(ctrl, '#klavity-split')!
    expect(panel.hidden).toBe(false)
    expect(panel.querySelectorAll('.kl-split-card').length).toBe(3)
    expect(panel.textContent).toContain('3 issues')
    expect(q(ctrl, '#klavity-submit')!.textContent).toBe('Submit 3 tickets')
    ctrl.close()
  })

  it('Submit files #1 with the video and each other ticked issue as its own ticket (edits + untick respected)', async () => {
    const { ctrl, onSubmit } = await openWithRecording(ISSUES)
    const cards = ctrl.shadowRoot.querySelectorAll('.kl-split-card')
    const t2 = cards[1].querySelector('.kl-split-title') as HTMLInputElement
    t2.value = 'Add a dark theme'; t2.dispatchEvent(new Event('input'))
    const inc3 = cards[2].querySelector('.kl-split-inc') as HTMLInputElement
    inc3.checked = false; inc3.dispatchEvent(new Event('change'))
    expect(q(ctrl, '#klavity-submit')!.textContent).toBe('Submit 2 tickets')
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await flush()
    expect(onSubmit).toHaveBeenCalledTimes(2)
    const [first] = onSubmit.mock.calls[0] as any[]
    expect(first.title).toBe('Save stays disabled')
    expect(first.description).toBe('Editing the name never enables Save.')
    expect(first.recordings).toHaveLength(1)
    const [second] = onSubmit.mock.calls[1] as any[]
    expect(second.title).toBe('Add a dark theme')
    expect(second.type).toBe('feature')
    expect(second.recordings).toBeUndefined()
    expect(second.screenshots).toEqual([])
    expect(second.description).toContain('KLA-7')
    expect(q(ctrl, '.klavity-sent h2')?.textContent).toBe('2 reports sent')
    ctrl.close()
  })

  it('"Keep as one ticket" dismisses the split → a single classic submit', async () => {
    const { ctrl, onSubmit } = await openWithRecording(ISSUES)
    ;(q(ctrl, '#klavity-split-keep') as HTMLButtonElement).click()
    expect(q(ctrl, '#klavity-split')!.hidden).toBe(true)
    expect(q(ctrl, '#klavity-submit')!.textContent).toBe('Submit')
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await flush()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    ctrl.close()
  })

  it('one issue (or a failed analysis) shows no panel and keeps the single ticket', async () => {
    for (const result of [[ISSUES[0]], null]) {
      const { ctrl, onSubmit } = await openWithRecording(result)
      expect(q(ctrl, '#klavity-split')!.hidden).toBe(true)
      ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
      await flush()
      expect(onSubmit).toHaveBeenCalledTimes(1)
      ctrl.close()
      document.body.innerHTML = ''
    }
  })

  it('removing the recording drops the split', async () => {
    const { ctrl } = await openWithRecording(ISSUES)
    ;(q(ctrl, '.kl-rec-tile .klavity-rm') as HTMLButtonElement).click()
    expect(q(ctrl, '#klavity-split')!.hidden).toBe(true)
    ctrl.close()
  })

  it('no onSplitRecording → no split panel at all (back-compat)', async () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => rec, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    ;(q(ctrl, '#klavity-record') as HTMLButtonElement).click()
    await flush()
    expect(q(ctrl, '#klavity-split')).toBeNull()
    ctrl.close()
  })
})
