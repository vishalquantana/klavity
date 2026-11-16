// @vitest-environment jsdom
// KD-995 "Report Multiple Issues": the composer's entry card records ONE narrated walkthrough, hands it to
// onSplitRecording, and opens the "AI Analysis Complete" review over the composer. The reporter selects /
// edits / removes tickets and Submit files one ticket per selected issue — the first carries the video, the
// rest point back to it. "Record me" itself stays a plain single-ticket recording.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  buildModal, formatSplitSpan, buildSplitDescription, splitIssueBody, renderDraftToWhatsApp,
  multiPriorityLabel, parseSplitSpan, multiPreviewText, type SplitIssueLike,
} from '../src/modal'
import type { ReportRecording } from '../src/types'

beforeEach(() => { document.body.innerHTML = '' })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }
function qa(ctrl: any, sel: string) { return Array.from(ctrl.shadowRoot.querySelectorAll(sel)) as HTMLElement[] }
const flush = async () => { for (let i = 0; i < 8; i++) await new Promise(r => setTimeout(r, 0)) }

const rec: ReportRecording = {
  id: 'rec_multi1',
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
  { title: 'Dashboard count wrong', description: 'x', kind: 'bug', startSec: 2, endSec: 14, actualResult: 'Count shows 0.',
    expectedResult: 'Count matches the list.', stepsToReproduce: ['Open the ticket dashboard'], suggestedSeverity: 'C2', suggestedPriority: 'P2', confidence: 0.95 },
  { title: 'Add dark mode', description: 'Reporter wants a dark theme.', kind: 'feature', startSec: 15, endSec: 72, suggestedPriority: 'P3', confidence: 0.7 },
  { title: 'Avatar upload spins forever', description: 'Upload never finishes.', kind: 'bug', startSec: null, endSec: null, suggestedPriority: 'P1', possibleDuplicate: true },
]

type SubmitFn = (p: any) => Promise<{ issueKey: string; issueUrl: string }>

async function openMulti(issues: SplitIssueLike[] | null, onSubmit?: SubmitFn, extra: Record<string, unknown> = {}) {
  let n = 0
  const submit = vi.fn(onSubmit || (async () => ({ issueKey: `KLA-${7 + n++}`, issueUrl: '' })))
  const onSplitRecording = vi.fn(async () => issues)
  const onRecord = vi.fn(async () => rec)
  const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord, onSplitRecording, onSubmit: submit, ...extra } as any)
  ;(q(ctrl, '#klavity-multi-start') as HTMLButtonElement).click()
  await flush()
  return { ctrl, onSubmit: submit, onSplitRecording, onRecord }
}

describe('multi-issue helpers', () => {
  it('formatSplitSpan / parseSplitSpan round-trip', () => {
    expect(formatSplitSpan(42, 70)).toBe('0:42–1:10')
    expect(formatSplitSpan(null, null)).toBe('')
    expect(parseSplitSpan('0:42–1:10')).toEqual({ startSec: 42, endSec: 70 })
    expect(parseSplitSpan('1:05')).toEqual({ startSec: 65, endSec: null })
    expect(parseSplitSpan('nonsense')).toEqual({ startSec: null, endSec: null })
    expect(parseSplitSpan('1:00-0:30')).toEqual({ startSec: 60, endSec: null })
  })
  it('multiPriorityLabel maps P1/P2/P3 to High/Medium/Low', () => {
    expect(multiPriorityLabel('P1')).toBe('High')
    expect(multiPriorityLabel('p2')).toBe('Medium')
    expect(multiPriorityLabel('P3')).toBe('Low')
    expect(multiPriorityLabel(undefined)).toBe('')
  })
  it('multiPreviewText drops the repeated bold title and Markdown asterisks', () => {
    expect(multiPreviewText('*Dashboard count wrong*\n\n*Actual:* Count shows 0.', 'Dashboard count wrong')).toBe('Actual: Count shows 0.')
  })
  it('splitIssueBody renders the Enhance layout; buildSplitDescription points extras back at the video', () => {
    expect(splitIssueBody(ISSUES[0])).toBe(renderDraftToWhatsApp({ summary: 'Dashboard count wrong', actualResult: 'Count shows 0.',
      expectedResult: 'Count matches the list.', stepsToReproduce: ['Open the ticket dashboard'], suggestedSeverity: 'C2', suggestedPriority: 'P2' }))
    expect(splitIssueBody({ title: 'T', description: '  plain  ' })).toBe('plain')
    const extra = buildSplitDescription(ISSUES[1], { primary: false, videoTitle: 'Dashboard count wrong', videoKey: 'KLA-7' })
    expect(extra).toContain('this issue is at 0:15–1:12 of the attached recording')
    expect(extra).toContain('Related: KLA-7 (“Dashboard count wrong”)')
  })
})

describe('Report Multiple Issues — entry card', () => {
  it('renders the card only with recording + onSplitRecording', () => {
    const a = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => rec, onSplitRecording: async () => [], onSubmit: async () => ({ issueKey: '', issueUrl: '' }) } as any)
    expect(q(a, '#klavity-multi')?.textContent).toContain('Report Multiple Issues')
    expect(q(a, '#klavity-multi')?.textContent).toContain('AI Powered')
    expect(q(a, '#klavity-multi-start')?.textContent?.trim()).toBe('Start Recording')
    a.close()
    const b = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => rec, onSubmit: async () => ({ issueKey: '', issueUrl: '' }) } as any)
    expect(q(b, '#klavity-multi')).toBeNull()
    b.close()
  })

  it('"Record me" no longer triggers the split (plain single recording)', async () => {
    const onSplitRecording = vi.fn(async () => ISSUES)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => rec, onSplitRecording, onSubmit: async () => ({ issueKey: '', issueUrl: '' }) } as any)
    ;(q(ctrl, '#klavity-record') as HTMLButtonElement).click()
    await flush()
    expect(onSplitRecording).not.toHaveBeenCalled()
    expect(q(ctrl, '#klavity-mr')).toBeNull()
    ctrl.close()
  })

  it('drops the default snap once the walkthrough is recorded, but keeps a marked-up screenshot', async () => {
    const onSubmit = vi.fn(async () => ({ issueKey: 'KLA-1', issueUrl: '' }))
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => rec, onSplitRecording: async () => ISSUES, onSubmit } as any)
    ctrl.addScreenshot('data:image/png;base64,REVGQVVMVA==')                     // the default on-open snap
    ctrl.addScreenshot('data:image/png;base64,TUFSS0VE', undefined, undefined, undefined, undefined,
      { shapes: [{ type: 'circle', x: 1, y: 1, w: 5, h: 5 }], w: 10, h: 10 })    // a shot the reporter drew on
    expect(qa(ctrl, '.klavity-thumb:not(.kl-video-thumb)').length).toBe(2)
    ;(q(ctrl, '#klavity-multi-start') as HTMLButtonElement).click()
    await flush()
    expect(qa(ctrl, '.klavity-thumb:not(.kl-video-thumb)').length).toBe(1)
    ;(q(ctrl, '#kl-mr-submit') as HTMLButtonElement).click()
    await flush()
    const [first] = onSubmit.mock.calls[0] as any[]
    expect(first.screenshots).toEqual(['data:image/png;base64,TUFSS0VE'])
    ctrl.close()
  })

  it('a cancelled walkthrough recording keeps the default snap', async () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => null, onSplitRecording: async () => ISSUES, onSubmit: async () => ({ issueKey: '', issueUrl: '' }) } as any)
    ctrl.addScreenshot('data:image/png;base64,REVGQVVMVA==')
    ;(q(ctrl, '#klavity-multi-start') as HTMLButtonElement).click()
    await flush()
    expect(qa(ctrl, '.klavity-thumb:not(.kl-video-thumb)').length).toBe(1)
    ctrl.close()
  })

  it('no issues found → the clip is attached to the composer and a notice explains it', async () => {
    const { ctrl } = await openMulti([])
    expect(q(ctrl, '#klavity-mr')).toBeNull()
    expect(q(ctrl, '#klavity-multi-status')?.textContent).toContain("couldn't pick out separate issues")
    expect(qa(ctrl, '.kl-rec-tile').length).toBe(1)
    ctrl.close()
  })
})

describe('Report Multiple Issues — review screen', () => {
  it('records, analyses and shows one card per issue with badges', async () => {
    const { ctrl, onSplitRecording, onRecord } = await openMulti(ISSUES)
    expect(onRecord).toHaveBeenCalledTimes(1)
    expect((onSplitRecording.mock.calls[0] as any[])[0]).toBe(rec.blob)
    const mr = q(ctrl, '#klavity-mr')!
    expect(mr.textContent).toContain('AI Analysis Complete')
    expect(mr.textContent).toContain("We've identified 3 reports from your recording")
    expect(mr.textContent).toContain('3 selected')
    const cards = qa(ctrl, '.kl-mr-card')
    expect(cards.length).toBe(3)
    expect(cards[0].textContent).toContain('Medium')
    expect(cards[0].textContent).not.toContain('% · review')
    expect(cards[1].textContent).toContain('Feature')
    expect(cards[1].textContent).toContain('70% · review')
    expect(cards[2].textContent).toContain('High')
    expect(cards[2].textContent).toContain('Possible duplicate')
    expect(q(ctrl, '#kl-mr-submit')!.textContent).toBe('Submit 3 Tickets')
    expect(q(ctrl, '#klavity-multi-status')?.textContent).toContain('3 issues identified and ready for review.')
    ctrl.close()
  })

  it('select all / untick updates counts and the Submit label', async () => {
    const { ctrl } = await openMulti(ISSUES)
    const cb = q(ctrl, '.kl-mr-card[data-id] .kl-mr-cb') as HTMLInputElement
    cb.checked = false; cb.dispatchEvent(new Event('change'))
    expect(q(ctrl, '#kl-mr-submit')!.textContent).toBe('Submit 2 Tickets')
    expect(q(ctrl, '.kl-mr-foot')!.textContent).toContain('2 of 3 tickets selected')
    const all = q(ctrl, '#kl-mr-all') as HTMLInputElement
    all.checked = false; all.dispatchEvent(new Event('change'))
    expect((q(ctrl, '#kl-mr-submit') as HTMLButtonElement).disabled).toBe(true)
    ;(q(ctrl, '#kl-mr-all') as HTMLInputElement).checked = true
    q(ctrl, '#kl-mr-all')!.dispatchEvent(new Event('change'))
    expect(q(ctrl, '#kl-mr-submit')!.textContent).toBe('Submit 3 Tickets')
    ctrl.close()
  })

  it('edit dialog saves title / type / priority / description / timestamp; Remove drops the ticket', async () => {
    const { ctrl } = await openMulti(ISSUES)
    ;(qa(ctrl, '.kl-mr-edit')[0] as HTMLButtonElement).click()
    expect(q(ctrl, '#kl-mr-editor')?.textContent).toContain('Edit generated ticket')
    const t = q(ctrl, '#kl-mr-ed-title') as HTMLInputElement
    t.value = 'Ticket count wrong on dashboard'; t.dispatchEvent(new Event('input'))
    ;(q(ctrl, '.kl-mr-kind[data-v="feature"]') as HTMLButtonElement).click()
    ;(q(ctrl, '.kl-mr-pri[data-v="P1"]') as HTMLButtonElement).click()
    const ts = q(ctrl, '#kl-mr-ed-ts') as HTMLInputElement
    ts.value = '0:05–0:20'; ts.dispatchEvent(new Event('input'))
    const d = q(ctrl, '#kl-mr-ed-desc') as HTMLTextAreaElement
    d.value = ''; d.dispatchEvent(new Event('input'))
    expect((q(ctrl, '#kl-mr-ed-save') as HTMLButtonElement).disabled).toBe(true)
    d.value = 'New body'; d.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#kl-mr-ed-save') as HTMLButtonElement).click()
    expect(q(ctrl, '#kl-mr-editor')).toBeNull()
    const card = qa(ctrl, '.kl-mr-card')[0]
    expect(card.textContent).toContain('Ticket count wrong on dashboard')
    expect(card.textContent).toContain('Feature')
    expect(card.textContent).toContain('High')
    expect(card.textContent).toContain('0:05–0:20')
    ;(qa(ctrl, '.kl-mr-edit')[1] as HTMLButtonElement).click()
    ;(q(ctrl, '#kl-mr-ed-rm') as HTMLButtonElement).click()
    expect(qa(ctrl, '.kl-mr-card').length).toBe(2)
    ctrl.close()
  })

  it('Back returns to the composer and "Review" reopens the analysis', async () => {
    const { ctrl } = await openMulti(ISSUES)
    ;(q(ctrl, '#kl-mr-back') as HTMLButtonElement).click()
    expect(q(ctrl, '#klavity-mr')).toBeNull()
    ;(q(ctrl, '#klavity-multi-reopen') as HTMLButtonElement).click()
    expect(qa(ctrl, '.kl-mr-card').length).toBe(3)
    ctrl.close()
  })

  it('the walkthrough previews on the left like Record me; the review lives in the right-hand panel', async () => {
    const { ctrl } = await openMulti(ISSUES)
    expect(qa(ctrl, '.kl-rec-tile').length).toBe(1)
    expect(q(ctrl, '#klavity-hero-stage .kl-hero-video')).not.toBeNull()
    expect(q(ctrl, '#klavity-side #klavity-mr')).not.toBeNull()
    expect(q(ctrl, '#klavity-hero #klavity-mr')).toBeNull()
    expect(q(ctrl, '.klavity-modal')?.className).toBe('klavity-modal') // panel keeps the composer's own width
    expect(q(ctrl, '#klavity-mr .kl-mr-body .kl-mr-list')).not.toBeNull() // only the ticket list area scrolls
    ;(q(ctrl, '#kl-mr-back') as HTMLButtonElement).click()
    expect(q(ctrl, '#klavity-side')?.classList.contains('kl-mr-open')).toBe(false)
    ctrl.close()
  })

  it('a card timestamp shows the walkthrough in the hero', async () => {
    const { ctrl } = await openMulti(ISSUES)
    const shot = (ctrl as any).shadowRoot.querySelector('#klavity-hero-stage')
    shot.innerHTML = ''
    ;(q(ctrl, '.kl-mr-ts') as HTMLButtonElement).click()
    expect(q(ctrl, '#klavity-hero-stage .kl-hero-video')).not.toBeNull()
    ctrl.close()
  })

  it('removing the walkthrough tile drops the analysis', async () => {
    const { ctrl } = await openMulti(ISSUES)
    ;(q(ctrl, '.kl-rec-tile .klavity-rm') as HTMLButtonElement).click()
    expect(q(ctrl, '#klavity-mr')).toBeNull()
    expect(q(ctrl, '#klavity-multi-start')?.textContent?.trim()).toBe('Start Recording')
    ctrl.close()
  })
})

describe('Report Multiple Issues — submit', () => {
  it('files one ticket per selected issue: #1 carries the video, the rest point back to it', async () => {
    const { ctrl, onSubmit } = await openMulti(ISSUES)
    const cb = qa(ctrl, '.kl-mr-cb')[2] as HTMLInputElement
    cb.checked = false; cb.dispatchEvent(new Event('change'))
    ;(q(ctrl, '#kl-mr-submit') as HTMLButtonElement).click()
    await flush()
    expect(onSubmit).toHaveBeenCalledTimes(2)
    const [first] = onSubmit.mock.calls[0] as any[]
    const [second] = onSubmit.mock.calls[1] as any[]
    expect(first.title).toBe('Dashboard count wrong')
    expect(first.description).toContain('*Actual:* Count shows 0.')
    // every ticket carries the full, untrimmed walkthrough
    expect(first.recordings).toEqual([rec])
    expect(first.suggestedPriority).toBe('P2')
    expect(first.suggestedSeverity).toBe('C2')
    expect(second.title).toBe('Add dark mode')
    expect(second.type).toBe('feature')
    expect(second.recordings).toEqual([rec])
    expect(second.description).toContain('KLA-7')
    expect(second.suggestedPriority).toBe('P3')
    const mr = q(ctrl, '#klavity-mr')!
    expect(mr.textContent).toContain('2 tickets created')
    expect(mr.textContent).toContain('KLA-7')
    expect(mr.textContent).toContain('KLA-8')
    ctrl.close()
  })

  it('background-upload hosts get one onSubmit per ticket and the composer closes', async () => {
    const onClose = vi.fn()
    const { ctrl, onSubmit } = await openMulti(ISSUES, undefined, { backgroundUpload: true, onClose })
    ;(q(ctrl, '#kl-mr-submit') as HTMLButtonElement).click()
    await flush()
    expect(onSubmit).toHaveBeenCalledTimes(3)
    expect(onClose).toHaveBeenCalled()
  })

  it('a failed first ticket shows an error and keeps the review open', async () => {
    const { ctrl } = await openMulti(ISSUES, async () => { throw new Error('boom') })
    ;(q(ctrl, '#kl-mr-submit') as HTMLButtonElement).click()
    await flush()
    expect(q(ctrl, '.kl-mr-err')?.textContent).toContain("Couldn't create the tickets")
    expect((q(ctrl, '#kl-mr-submit') as HTMLButtonElement).disabled).toBe(false)
    ctrl.close()
  })
})

// Each split ticket is written by the SAME "Enhance with AI" call a snap uses: the reporter's words for that
// issue + the frame from its moment. The split call's own draft is only the fallback.
describe('Report Multiple Issues — per-issue Enhance', () => {
  // jsdom can't decode video: fail frame grabs at once instead of waiting out the 6s timeout.
  let srcDesc: PropertyDescriptor | undefined
  beforeEach(() => {
    srcDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src')
    Object.defineProperty(HTMLMediaElement.prototype, 'src', {
      configurable: true,
      get() { return '' },
      set() { setTimeout(() => (this as HTMLVideoElement).onerror?.(new Event('error') as any), 0) },
    })
  })
  const restore = () => { if (srcDesc) Object.defineProperty(HTMLMediaElement.prototype, 'src', srcDesc) }

  const NARRATED: SplitIssueLike[] = [
    { ...ISSUES[0], narration: 'The dashboard count says zero but the list has three tickets.' },
    { ...ISSUES[1], narration: 'Would be great to have a dark mode.' },
  ]
  const DRAFT = (summary: string) => ({ summary, actualResult: `Actual for ${summary}`, expectedResult: 'Expected.', stepsToReproduce: ['Open it'], suggestedSeverity: 'C1', suggestedPriority: 'P1' })

  it('enhances every issue from its narration and replaces the split draft', async () => {
    const onEnhance = vi.fn(async (text: string) => DRAFT(text.startsWith('The dashboard') ? 'Dashboard ticket count shows 0' : 'Add a dark theme'))
    const { ctrl, onSubmit } = await openMulti(NARRATED, undefined, { onEnhance })
    await flush()
    restore()
    expect(onEnhance).toHaveBeenCalledTimes(2)
    expect(onEnhance.mock.calls.map((c) => c[0])).toEqual([NARRATED[0].narration, NARRATED[1].narration])
    expect(qa(ctrl, '.kl-mr-t').map((e) => e.textContent)).toEqual(['Dashboard ticket count shows 0', 'Add a dark theme'])
    expect(q(ctrl, '.kl-mr-enh')).toBeNull()
    ;(q(ctrl, '#kl-mr-submit') as HTMLButtonElement).click()
    await flush()
    const [first] = onSubmit.mock.calls[0] as any[]
    expect(first.title).toBe('Dashboard ticket count shows 0')
    expect(first.description).toContain('Actual for Dashboard ticket count shows 0')
    expect(first.suggestedPriority).toBe('P1')
    ctrl.close()
  })

  it('shows "Enhancing…" while in flight and never overwrites a card the reporter edited', async () => {
    let release!: () => void
    const gate = new Promise<void>((r) => { release = r })
    const onEnhance = vi.fn(async (text: string) => { await gate; return DRAFT(`AI ${text.slice(0, 5)}`) })
    const { ctrl } = await openMulti(NARRATED, undefined, { onEnhance })
    await flush()
    expect(qa(ctrl, '.kl-mr-enh')).toHaveLength(2)
    // reporter edits ticket #1 while Enhance is still running
    ;(qa(ctrl, '.kl-mr-edit')[0] as HTMLButtonElement).click()
    const title = q(ctrl, '#kl-mr-ed-title') as HTMLInputElement
    title.value = 'My own title'; title.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#kl-mr-ed-save') as HTMLButtonElement).click()
    release()
    await flush()
    restore()
    expect(qa(ctrl, '.kl-mr-t').map((e) => e.textContent)).toEqual(['My own title', 'AI Would'])
    expect(qa(ctrl, '.kl-mr-enh')).toHaveLength(0)
    ctrl.close()
  })

  it('keeps the split draft when Enhance fails or returns nothing', async () => {
    const onEnhance = vi.fn(async () => null)
    const { ctrl } = await openMulti(NARRATED, undefined, { onEnhance })
    await flush()
    restore()
    expect(qa(ctrl, '.kl-mr-t').map((e) => e.textContent)).toEqual(['Dashboard count wrong', 'Add dark mode'])
    ctrl.close()
  })
})
