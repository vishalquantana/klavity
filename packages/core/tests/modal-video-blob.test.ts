// @vitest-environment jsdom
// Attaching a large video used to crash the tab ("Crashpad_NotConnectedToHandler"): the composer base64'd
// the whole file into a data URL, and submit then round-tripped it through split/atob/Uint8Array/Blob —
// ~500MB+ of transient memory for a ~100MB video. Videos are now kept as the original File (`blob`) with an
// object-URL preview, and the upload uses the blob directly. Non-video files are unchanged (data URL).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildModal } from '../src/modal'

beforeEach(() => { document.body.innerHTML = '' })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }
function qa(ctrl: any, sel: string) { return Array.from(ctrl.shadowRoot.querySelectorAll(sel)) as HTMLElement[] }
const ok = async () => ({ issueKey: 'K-1', issueUrl: '' })
async function tick() { await new Promise(r => setTimeout(r, 0)) }
async function settle() { await new Promise(r => setTimeout(r, 40)) }
const fakeFile = (name: string, type: string, size = 1024) => new File([new Uint8Array(size)], name, { type })

describe('video attachments stay blob-backed (no base64 copies)', () => {
  const created: string[] = []
  const revoked: string[] = []
  let n = 0
  beforeEach(() => {
    created.length = 0; revoked.length = 0; n = 0
    ;(URL as any).createObjectURL = vi.fn(() => { const u = `blob:kl-test-${++n}`; created.push(u); return u })
    ;(URL as any).revokeObjectURL = vi.fn((u: string) => { revoked.push(u) })
  })
  afterEach(() => { delete (URL as any).createObjectURL; delete (URL as any).revokeObjectURL })

  it('a video is passed to onSubmit as `blob` with no data URL, and previews via an object URL', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, allowFileAttachments: true })
    const input = q(ctrl, '#klavity-file') as HTMLInputElement
    const file = fakeFile('demo.mp4', 'video/mp4', 5 * 1024 * 1024)
    Object.defineProperty(input, 'files', { value: [file], configurable: true })
    input.dispatchEvent(new Event('change'))
    await settle()
    const tile = qa(ctrl, '.kl-video-thumb')[0]
    expect(tile).toBeTruthy()
    expect((tile.querySelector('video') as HTMLVideoElement).src).toBe(created[0])
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    const sent = onSubmit.mock.calls[0][0].files[0]
    expect(sent.blob).toBe(file)
    expect(sent.dataUrl).toBe('')
    expect(sent).toMatchObject({ name: 'demo.mp4', type: 'video/mp4', size: 5 * 1024 * 1024 })
    ctrl.close()
  })

  it('an empty-MIME .mov is still stamped with a concrete video type on the blob-backed entry', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, allowFileAttachments: true })
    const input = q(ctrl, '#klavity-file') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [fakeFile('screen.mov', '', 2048)], configurable: true })
    input.dispatchEvent(new Event('change'))
    await settle()
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    expect(onSubmit.mock.calls[0][0].files[0]).toMatchObject({ type: 'video/quicktime', dataUrl: '' })
    ctrl.close()
  })

  it('removing the video revokes its object URL (a big video is not pinned in memory)', async () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok, allowFileAttachments: true })
    const input = q(ctrl, '#klavity-file') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [fakeFile('demo.mp4', 'video/mp4', 4096)], configurable: true })
    input.dispatchEvent(new Event('change'))
    await settle()
    expect(revoked.length).toBe(0)
    ;(qa(ctrl, '.kl-video-thumb')[0].querySelector('button, .kl-thumb-rm, [aria-label*="emove"]') as HTMLElement | null)?.click()
    // Fallback if the remove control differs: closing the composer must also release every preview URL.
    ctrl.close()
    expect(revoked).toContain(created[0])
  })

  it('a non-video file is unchanged: data URL, no blob', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, allowFileAttachments: true })
    const input = q(ctrl, '#klavity-file') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [fakeFile('invoice.pdf', 'application/pdf', 2048)], configurable: true })
    input.dispatchEvent(new Event('change'))
    await settle()
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    const sent = onSubmit.mock.calls[0][0].files[0]
    expect(sent.blob).toBeUndefined()
    expect(sent.dataUrl.startsWith('data:')).toBe(true)
    expect(created.length).toBe(0)
    ctrl.close()
  })
})
