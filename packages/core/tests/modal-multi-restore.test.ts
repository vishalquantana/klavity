// @vitest-environment jsdom
// Bug: after "Report Multiple Issues" found N issues, Minimize → Resume lost the analysis ("N issues identified"
// gone, review unreachable) — the composer held it only in memory. The composer now reports it via
// onMultiIssuesChange and restores it from initialMultiIssues: same tickets, edits and selections, no re-analysis.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildModal, type SplitIssueLike, type MultiIssuesSnapshot } from '../src/modal'
import type { ReportRecording } from '../src/types'

let mediaSrcDesc: PropertyDescriptor | undefined
beforeEach(() => {
  document.body.innerHTML = ''
  mediaSrcDesc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src')
  Object.defineProperty(HTMLMediaElement.prototype, 'src', {
    configurable: true, get() { return '' },
    set() { setTimeout(() => (this as HTMLVideoElement).onerror?.(new Event('error') as any), 0) },
  })
})
afterEach(() => { if (mediaSrcDesc) Object.defineProperty(HTMLMediaElement.prototype, 'src', mediaSrcDesc) })

const q = (c: any, s: string) => c.shadowRoot.querySelector(s) as HTMLElement | null
const qa = (c: any, s: string) => Array.from(c.shadowRoot.querySelectorAll(s)) as HTMLElement[]
const flush = async () => { for (let i = 0; i < 8; i++) await new Promise(r => setTimeout(r, 0)) }
const ok = async () => ({ issueKey: 'KLA-1', issueUrl: '' })
const rec: ReportRecording = { id: 'rec_multi1', dataUrl: 'data:video/webm;base64,QQ==', blob: new Blob(['QQ'], { type: 'video/webm' }), mime: 'video/webm', durationMs: 30000, bytes: 2, width: 1280, height: 720, screenOnly: false }
const ISSUES: SplitIssueLike[] = [
  { title: 'Heading text is incorrect', description: 'a', kind: 'bug', startSec: 2, endSec: 4, suggestedPriority: 'P3' },
  { title: 'Tickets nav does nothing', description: 'b', kind: 'bug', startSec: 6, endSec: 9, suggestedPriority: 'P2', confidence: 0.8 },
  { title: 'Add dark mode', description: 'c', kind: 'feature', startSec: 12, endSec: 20 },
]

describe('Report Multiple Issues survives Minimize → Resume', () => {
  it('reports the analysis + every selection change to the host', async () => {
    const changes: Array<MultiIssuesSnapshot | null> = []
    const c = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => rec, onSplitRecording: async () => ISSUES, onSubmit: ok, onMultiIssuesChange: (s: any) => changes.push(s) } as any)
    ;(q(c, '#klavity-multi-start') as HTMLButtonElement).click()
    await flush()
    const last = changes[changes.length - 1]!
    expect(last.recordingId).toBe('rec_multi1')
    expect(last.items.map(i => [i.title, i.selected])).toEqual([['Heading text is incorrect', true], ['Tickets nav does nothing', true], ['Add dark mode', true]])
    expect((last.items[0] as any).thumb).toBeUndefined()            // thumbnails are not stored
    // untick one in the review
    ;(qa(c, '.kl-mr-cb')[1] as HTMLInputElement).click()
    await flush()
    expect(changes[changes.length - 1]!.items.map(i => i.selected)).toEqual([true, false, true])
    c.close()
  })

  it('restores the tickets, edits and selections without re-analysing or auto-capturing', async () => {
    const snap: MultiIssuesSnapshot = {
      recordingId: 'rec_multi1',
      items: ISSUES.map((i, k) => ({ ...i, id: `mi1_${k}`, selected: k !== 1, description: `Body ${k}` })),
      original: ISSUES.map((i, k) => ({ ...i, id: `mi1_${k}`, selected: true, description: `Body ${k}` })),
    }
    snap.items[0].title = 'Edited heading title'
    const onSplitRecording = vi.fn(async () => ISSUES)
    const onEnhance = vi.fn(async () => null)
    const onCaptureFull = vi.fn(async () => 'x')
    const changes: any[] = []
    const c = buildModal('bug', { onCaptureFull, allowRecording: true, onRecord: async () => rec, onSplitRecording, onEnhance, onSubmit: ok,
      initialRecordings: [rec], initialMultiIssues: snap, onMultiIssuesChange: (s: any) => changes.push(s) } as any)
    await flush()
    expect(q(c, '#klavity-multi-status')!.textContent).toContain('3 issues identified and ready for review')
    expect(q(c, '#klavity-multi-start')!.textContent).toContain('Record another walkthrough')
    expect(onSplitRecording).not.toHaveBeenCalled()
    expect(onEnhance).not.toHaveBeenCalled()                         // write-ups were already done
    expect(changes).toEqual([])                                      // restoring isn't echoed back as a change
    ;(q(c, '#klavity-multi-reopen') as HTMLButtonElement).click()
    await flush()
    const titles = qa(c, '.kl-mr-t').map(e => e.textContent)
    expect(titles[0]).toBe('Edited heading title')
    expect(qa(c, '.kl-mr-cb').map(e => (e as HTMLInputElement).checked)).toEqual([true, false, true])
    c.close()
  })

  it('re-runs Enhance only for an issue that was still being written when minimized', async () => {
    const snap: MultiIssuesSnapshot = { recordingId: 'rec_multi1', original: null,
      items: ISSUES.map((i, k) => ({ ...i, id: `mi1_${k}`, selected: true, ...(k === 2 ? { pendingEnhance: true } : {}) })) }
    const onEnhance = vi.fn(async () => null)
    const c = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => rec, onSplitRecording: async () => ISSUES, onEnhance, onSubmit: ok, initialRecordings: [rec], initialMultiIssues: snap } as any)
    await flush(); await flush()
    expect(onEnhance).toHaveBeenCalledTimes(1)
    c.close()
  })

  it('ignores a saved analysis whose walkthrough clip is not among the recordings', async () => {
    const snap: MultiIssuesSnapshot = { recordingId: 'gone', original: null, items: [{ ...ISSUES[0], id: 'x', selected: true }] }
    const c = buildModal('bug', { onCaptureFull: async () => 'x', allowRecording: true, onRecord: async () => rec, onSplitRecording: async () => ISSUES, onSubmit: ok, initialRecordings: [rec], initialMultiIssues: snap } as any)
    await flush()
    expect(q(c, '#klavity-multi-start')!.textContent).toContain('Start Recording')
    c.close()
  })
  it("minimized ON the review → Resume reopens the review (not the composer); closing it is saved", async () => {
    const changes: any[] = []
    const c = buildModal("bug", { onCaptureFull: async () => "x", allowRecording: true, onRecord: async () => rec, onSplitRecording: async () => ISSUES, onSubmit: ok, onMultiIssuesChange: (s: any) => changes.push(s) } as any)
    ;(q(c, "#klavity-multi-start") as HTMLButtonElement).click()
    await flush()
    const saved = changes[changes.length - 1]
    expect(saved.reviewOpen).toBe(true)                 // the review auto-opens after the analysis
    c.close()

    const onSplitRecording = vi.fn(async () => ISSUES)
    const c2 = buildModal("bug", { onCaptureFull: async () => "x", allowRecording: true, onRecord: async () => rec, onSplitRecording, onSubmit: ok, initialRecordings: [rec], initialMultiIssues: saved, onMultiIssuesChange: (s: any) => changes.push(s) } as any)
    await flush()
    expect(q(c2, "#klavity-mr")).toBeTruthy()           // straight back on "AI Analysis Complete"
    expect(qa(c2, ".kl-mr-card").length).toBe(3)
    expect(onSplitRecording).not.toHaveBeenCalled()
    const before = changes.length
    ;(q(c2, "#kl-mr-back") as HTMLButtonElement).click()  // back to the composer → remembered
    await flush()
    expect(q(c2, "#klavity-mr")).toBeNull()
    expect(changes.length).toBe(before + 1)
    expect(changes[changes.length - 1].reviewOpen).toBeUndefined()
    c2.close()
  })
})
