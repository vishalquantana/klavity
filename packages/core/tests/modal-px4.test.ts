// @vitest-environment jsdom
// PX4 composer enhancements (#411 Title + Task/Query issue types, #425 non-image file attachments).
// All features are OPT-IN via ModalCallbacks; the back-compat block proves a caller that passes none of
// the new opts renders + submits exactly as before.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildModal } from '../src/modal'

beforeEach(() => { document.body.innerHTML = '' })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }
function qa(ctrl: any, sel: string) { return Array.from(ctrl.shadowRoot.querySelectorAll(sel)) as HTMLElement[] }
const ok = async () => ({ issueKey: 'K-1', issueUrl: '' })
async function tick() { await new Promise(r => setTimeout(r, 0)) }
// FileReader (jsdom) resolves on a macrotask — give it room before asserting on ingested files.
async function settle() { await new Promise(r => setTimeout(r, 40)) }

// A File whose async .text()/.arrayBuffer() resolve — enough for the modal's fileToDataUrl (FileReader).
function fakeFile(name: string, type: string, size = 1024): File {
  return new File([new Uint8Array(size)], name, { type })
}

describe('PX4 #411 — Title field', () => {
  it('renders the Title input only when showTitleField is set', () => {
    const on = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok, showTitleField: true })
    expect(q(on, '#klavity-title')).not.toBeNull()
    on.close()
    const off = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    expect(q(off, '#klavity-title')).toBeNull()
    off.close()
  })

  it('threads the trimmed Title through onSubmit as `title`', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, showTitleField: true })
    const title = q(ctrl, '#klavity-title') as HTMLInputElement
    title.value = '  Checkout coupon does nothing  '
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'tapped apply, nothing happens'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'Checkout coupon does nothing' }))
    ctrl.close()
  })

  it('omits `title` from the payload when the Title field is empty (fall back to auto-title)', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, showTitleField: true })
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'a bug with no title'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect('title' in onSubmit.mock.calls[0][0]).toBe(false)
    ctrl.close()
  })
})

describe('PX4 #411 — Task/Query issue-type chips', () => {
  const px4Types = [
    { value: 'bug' as const, label: 'Bug', mappingLabel: 'Jira Bug' },
    { value: 'feature' as const, label: 'Feature', mappingLabel: 'Story' },
    { value: 'task' as const, label: 'Task', mappingLabel: 'Jira Task' },
    { value: 'query' as const, label: 'Query', mappingLabel: 'Jira Task' },
  ]

  it('renders one chip per issueTypes entry with its mapping caption, and hides the classic toggle', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok, issueTypes: px4Types })
    const chips = qa(ctrl, '.kl-type-chip')
    expect(chips.length).toBe(4)
    expect(chips.map(c => c.getAttribute('data-kind'))).toEqual(['bug', 'feature', 'task', 'query'])
    expect(chips[2].textContent).toContain('Task')
    expect(chips[2].querySelector('.kl-type-map')?.textContent).toBe('Jira Task')
    // classic Bug/Feature toggle must NOT be rendered in chip mode
    expect(q(ctrl, '.klavity-toggle')).toBeNull()
    // initial active reflects initialType
    expect(chips[0].classList.contains('active')).toBe(true)
    ctrl.close()
  })

  it('selecting Task threads kind:"task" through onSubmit while type stays a valid ReportType', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, issueTypes: px4Types })
    const taskChip = qa(ctrl, '.kl-type-chip')[2]
    taskChip.click()
    expect(taskChip.classList.contains('active')).toBe(true)
    expect(taskChip.getAttribute('aria-checked')).toBe('true')
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'please add this task'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    const arg = onSubmit.mock.calls[0][0]
    expect(arg.kind).toBe('task')
    expect(arg.type).toBe('bug') // Task is bug-like for legacy consumers; precise value in `kind`
    ctrl.close()
  })

  it('selecting Query threads kind:"query"', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, issueTypes: px4Types })
    qa(ctrl, '.kl-type-chip')[3].click()
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'a question about behaviour'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    expect(onSubmit.mock.calls[0][0].kind).toBe('query')
    ctrl.close()
  })
})

describe('KLA-591 — unified attachment gallery (images + video + docs, one control)', () => {
  it('merges Upload + Attach into ONE control (no separate #klavity-attach) with a broad accept + hint', () => {
    const on = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok, allowFileAttachments: true })
    // The old separate "Attach file" button is gone — there is a single unified control.
    expect(q(on, '#klavity-attach')).toBeNull()
    expect(q(on, '#klavity-attach-input')).toBeNull()
    const upload = q(on, '#klavity-upload') as HTMLButtonElement
    expect(upload).not.toBeNull()
    expect(upload.getAttribute('title') || '').toMatch(/screenshot, video, or file/i)
    const input = q(on, '#klavity-file') as HTMLInputElement
    const accept = input.getAttribute('accept') || ''
    expect(accept).toContain('video/*')
    expect(accept).toContain('.pdf')
    expect(accept).toContain('image/*')
    // 100MB hint is shown near the control.
    expect((q(on, '#klavity-attach-hint')?.textContent || '')).toContain('100MB')
    on.close()
    const off = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    // Image-only mode: no hint, image-only accept.
    expect(q(off, '#klavity-attach-hint')).toBeNull()
    expect((q(off, '#klavity-file') as HTMLInputElement).getAttribute('accept')).not.toContain('video')
    off.close()
  })

  it('a non-image file shows as a chip (name + remove) and threads through onSubmit as `files`', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, allowFileAttachments: true })
    const input = q(ctrl, '#klavity-file') as HTMLInputElement
    const file = fakeFile('invoice.pdf', 'application/pdf', 2048)
    Object.defineProperty(input, 'files', { value: [file], configurable: true })
    input.dispatchEvent(new Event("change"))
    await settle()
    const chips = qa(ctrl, '.kl-file-chip')
    expect(chips.length).toBe(1)
    expect(chips[0].querySelector('.kl-file-nm')?.textContent).toBe('invoice.pdf')
    // file counts as evidence → Submit enabled with no typed description
    const submit = q(ctrl, '#klavity-submit') as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    submit.click()
    await tick()
    const arg = onSubmit.mock.calls[0][0]
    expect(Array.isArray(arg.files)).toBe(true)
    expect(arg.files[0]).toMatchObject({ name: 'invoice.pdf', type: 'application/pdf', size: 2048 })
    expect(typeof arg.files[0].dataUrl).toBe('string')
    ctrl.close()
  })

  it('the file chip remove button drops the attachment', async () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok, allowFileAttachments: true })
    const input = q(ctrl, '#klavity-file') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [fakeFile('app.log', 'text/plain')], configurable: true })
    input.dispatchEvent(new Event("change"))
    await settle()
    expect(qa(ctrl, '.kl-file-chip').length).toBe(1)
    ;(q(ctrl, '.kl-file-rm') as HTMLButtonElement).click()
    expect(qa(ctrl, '.kl-file-chip').length).toBe(0)
    ctrl.close()
  })

  it('a VIDEO renders a poster tile in the thumbnail strip (not a chip) and threads through as `files`', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit, allowFileAttachments: true })
    const input = q(ctrl, '#klavity-file') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [fakeFile('demo.mp4', 'video/mp4', 5 * 1024 * 1024)], configurable: true })
    input.dispatchEvent(new Event("change"))
    await settle()
    // Video → strip tile, NOT a file chip.
    expect(qa(ctrl, '.kl-file-chip').length).toBe(0)
    const tiles = qa(ctrl, '.kl-video-thumb')
    expect(tiles.length).toBe(1)
    expect(tiles[0].querySelector('video')).not.toBeNull()
    // Clicking the tile mounts an inline <video controls> preview in the hero stage.
    ;(tiles[0] as HTMLElement).click()
    const heroVideo = q(ctrl, '.kl-hero-video') as HTMLVideoElement | null
    expect(heroVideo).not.toBeNull()
    expect(heroVideo!.controls).toBe(true)
    // Submit still carries the video under files.
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    const arg = onSubmit.mock.calls[0][0]
    expect(arg.files[0]).toMatchObject({ name: 'demo.mp4', type: 'video/mp4' })
    ctrl.close()
  })

  it('an over-cap file surfaces a role-aware CTA and is NOT dropped silently (member → upgrade link)', async () => {
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x', onSubmit: ok, allowFileAttachments: true,
      maxFileBytes: 1024, reporterRole: 'member', upgradeUrl: 'https://app/billing',
    })
    const input = q(ctrl, '#klavity-file') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [fakeFile('big.mp4', 'video/mp4', 5000)], configurable: true })
    input.dispatchEvent(new Event("change"))
    await settle()
    // No tile/chip added — but a friendly message + upgrade CTA is shown (not a dead end).
    expect(qa(ctrl, '.kl-video-thumb').length).toBe(0)
    const cap = q(ctrl, '#klavity-capmsg') as HTMLElement
    expect(cap.hidden).toBe(false)
    expect(cap.textContent || '').toMatch(/limit on your plan/i)
    const cta = cap.querySelector('.kl-capmsg-cta') as HTMLAnchorElement
    expect(cta).not.toBeNull()
    expect(cta.getAttribute('href')).toBe('https://app/billing')
    ctrl.close()
  })

  it('an anon reporter over cap is never asked to pay (ask-team copy, no upgrade link)', async () => {
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x', onSubmit: ok, allowFileAttachments: true,
      maxFileBytes: 1024, reporterRole: 'anon', upgradeUrl: 'https://app/billing',
    })
    const input = q(ctrl, '#klavity-file') as HTMLInputElement
    Object.defineProperty(input, 'files', { value: [fakeFile('big.mp4', 'video/mp4', 5000)], configurable: true })
    input.dispatchEvent(new Event("change"))
    await settle()
    const cap = q(ctrl, '#klavity-capmsg') as HTMLElement
    expect(cap.hidden).toBe(false)
    expect(cap.querySelector('.kl-capmsg-cta')).toBeNull()          // no upgrade link
    expect(cap.querySelector('.kl-capmsg-hint')?.textContent || '').toMatch(/ask your team/i)
    ctrl.close()
  })
})

describe('PX4 — back-compat: no new opts → identical composer + payload shape', () => {
  it('classic Bug/Feature toggle is rendered and new affordances are absent', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: ok })
    expect(q(ctrl, '.klavity-toggle')).not.toBeNull()
    expect(q(ctrl, '.bug')).not.toBeNull()
    expect(q(ctrl, '.feat')).not.toBeNull()
    expect(q(ctrl, '.klavity-types')).toBeNull()
    expect(q(ctrl, '#klavity-title')).toBeNull()
    expect(q(ctrl, '#klavity-attach')).toBeNull()
    ctrl.close()
  })

  it('onSubmit payload carries no title/kind/files when no new opts are passed (classic bug report)', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit })
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'a plain old bug'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    const arg = onSubmit.mock.calls[0][0]
    expect(arg.type).toBe('bug')
    expect('kind' in arg).toBe(false)
    expect('title' in arg).toBe(false)
    expect('files' in arg).toBe(false)
    ctrl.close()
  })

  it('the classic Feature toggle still threads type:"feature"', async () => {
    const onSubmit = vi.fn(ok)
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit })
    ;(q(ctrl, '.feat') as HTMLButtonElement).click()
    const desc = q(ctrl, '#klavity-desc') as HTMLTextAreaElement
    desc.value = 'a feature request'; desc.dispatchEvent(new Event('input'))
    ;(q(ctrl, '#klavity-submit') as HTMLButtonElement).click()
    await tick()
    expect(onSubmit.mock.calls[0][0].type).toBe('feature')
    ctrl.close()
  })
})
