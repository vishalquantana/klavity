// @vitest-environment jsdom
// Attached files survive Minimize → Resume: the composer reports every add/remove to the host
// (onFilesChange) and re-shows files seeded on open (initialFiles) without echoing them back.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildModal } from '../src/modal'
import type { ReportFileAttachment } from '../src/types'

beforeEach(() => { document.body.innerHTML = '' })
function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }
function qa(ctrl: any, sel: string) { return Array.from(ctrl.shadowRoot.querySelectorAll(sel)) as HTMLElement[] }
const ok = async () => ({ issueKey: 'K-1', issueUrl: '' })
const settle = () => new Promise(r => setTimeout(r, 40))

describe('composer attached files persistence', () => {
  it('fires onFilesChange when a file is attached and again when it is removed', async () => {
    const onFilesChange = vi.fn()
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok, allowFileAttachments: true, onFilesChange })
    const input = q(ctrl, '#klavity-file') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [new File([new Uint8Array(10)], 'app.log', { type: 'text/plain' })], configurable: true })
    input.dispatchEvent(new Event('change'))
    await settle()
    expect(onFilesChange).toHaveBeenCalledTimes(1)
    expect(onFilesChange.mock.calls[0][0].map((f: ReportFileAttachment) => f.name)).toEqual(['app.log'])
    ;(q(ctrl, '.kl-file-rm') as HTMLButtonElement).click()
    expect(onFilesChange).toHaveBeenCalledTimes(2)
    expect(onFilesChange.mock.calls[1][0]).toEqual([])
    ctrl.close()
  })

  it('shows initialFiles (doc chip + video tile) on open, submits them, and does not echo them back', async () => {
    const onFilesChange = vi.fn()
    const onSubmit = vi.fn(ok)
    const doc: ReportFileAttachment = { name: 'invoice.pdf', type: 'application/pdf', size: 3, dataUrl: 'data:application/pdf;base64,YWJj' }
    const vid: ReportFileAttachment = { name: 'demo.mp4', type: 'video/mp4', size: 4, dataUrl: '', blob: new Blob([new Uint8Array(4)], { type: 'video/mp4' }) }
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, allowFileAttachments: true, initialFiles: [doc, vid], onFilesChange })
    expect(qa(ctrl, '.kl-file-chip').length).toBe(1)
    expect(qa(ctrl, '.kl-video-thumb').length).toBe(1)
    expect(onFilesChange).not.toHaveBeenCalled()
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await settle()
    expect(onSubmit.mock.calls[0][0].files).toEqual([doc, vid])
    ctrl.close()
  })
})
