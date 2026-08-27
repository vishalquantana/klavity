// @vitest-environment jsdom
//
// KLA-729 (third-surface parity): the npm/init SDK (KlavitySnap.init in index.ts) must reach parity with
// the in-page widget on two axes, using SHARED core modules so all three surfaces converge:
//   1. its right-click menu renders with the SHARED card renderer (@klavity/core/context-menu) — the same
//      buildMenuCard + CONTEXT_MENU_CSS the widget + extension use (no visual drift).
//   2. its composer wires the AI-assist callbacks (enhance / clarity / voice / known-check / record) AND
//      forwards the FULL evidence payload (annotations, recordings, files, reporterEmail, reporter,
//      clientInfo, thumbnails) through the shared persist-first backend serializer.

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Capture the options handed to buildModal without rendering the real composer. isEditableTarget (used by
// the context-menu handler) stays REAL via importActual so the menu path is exercised unchanged.
vi.mock('@klavity/core/modal', async (orig) => {
  const actual: any = await orig()
  return { ...actual, buildModal: vi.fn(() => ({ addScreenshot: vi.fn() })) }
})
// Capture the payload the SDK dispatches to the backend (persist-first) so we can assert full-payload parity
// without touching fetch/blob machinery. The real dispatchSubmit is covered by core's own tests.
vi.mock('@klavity/core/submit', async (orig) => {
  const actual: any = await orig()
  return { ...actual, dispatchSubmit: vi.fn(async () => ({ issueKey: 'KLA-1', issueUrl: 'https://klavity.in/t/1' })) }
})
// Screenshot compression / thumbnailing use canvas+Image (no-op in jsdom) — stub to identity so onSubmit
// resolves deterministically. We assert the SDK PASSES a thumbnails array, not the pixels themselves.
vi.mock('./widget-lib', async (orig) => {
  const actual: any = await orig()
  return { ...actual, compressScreenshot: vi.fn(async (s: string) => s), buildThumbnail: vi.fn(async (s: string) => s + '#thumb') }
})

import { buildModal } from '@klavity/core/modal'
import { dispatchSubmit } from '@klavity/core/submit'
import { buildFeedbackFormData } from '@klavity/core/integrations/backend'
import { init, openModal, identify } from './index'

beforeEach(() => {
  document.body.innerHTML = ''
  ;(buildModal as any).mockClear?.()
  ;(dispatchSubmit as any).mockClear?.()
})

// ── 1. Context menu uses the SHARED card renderer ──────────────────────────────
describe('KlavitySnap right-click menu — shared card renderer (KLA-726/729)', () => {
  it('renders the shared klm-card menu (card copy present) on contextmenu, not the old hand-rolled menu', () => {
    init({ projectId: 'p1', backendUrl: 'https://x.test' })
    document.body.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 12, clientY: 12 }))

    // Shared stylesheet injected (the single-source CONTEXT_MENU_CSS from @klavity/core).
    expect(document.getElementById('klavity-sdk-menu-anim')).not.toBeNull()

    // The shared menu container + shared cards (buildMenuCard emits .klm-card / .klm-t / .klm-d).
    const menu = document.querySelector('.klm-menu')
    expect(menu).not.toBeNull()
    const cards = menu!.querySelectorAll('.klm-card')
    expect(cards.length).toBe(2)
    // Primary "Report a Bug" card + its shared one-line description copy.
    const titles = Array.from(menu!.querySelectorAll('.klm-t')).map((t) => t.textContent)
    expect(titles).toContain('Report a Bug')
    expect(titles).toContain('Request a Feature')
    expect(menu!.querySelector('.klm-card.primary')).not.toBeNull()
    expect(menu!.textContent).toContain('Snap the page and tell us what broke.')
    // The old hand-rolled menu marked items with data-action — it must be gone.
    expect(menu!.querySelector('[data-action]')).toBeNull()
  })
})

// ── 2. Composer wires the AI-assist callbacks + forwards the full payload ───────
describe('KlavitySnap composer — assist wiring + full-payload parity (KLA-729)', () => {
  it('openModal wires the composer-assist callbacks (enhance/clarity/voice/known/record) + attach/compress', () => {
    init({ projectId: 'p1', backendUrl: 'https://x.test' })
    openModal('bug')
    const opts = (buildModal as any).mock.calls.at(-1)[1]

    expect(typeof opts.onEnhance).toBe('function')
    expect(typeof opts.onClarityTip).toBe('function')
    expect(typeof opts.onCheckKnown).toBe('function')
    expect(typeof opts.onDictate).toBe('function')
    // Live streaming dictation URL derived from backendUrl (https→wss) + project.
    expect(opts.dictationStreamUrl).toBe('wss://x.test/api/voice/stream?project=p1')
    expect(typeof opts.onRecord).toBe('function')
    expect(typeof opts.compressImage).toBe('function')
    expect(opts.consoleAttachToggle).toBe(true)
    expect(opts.allowFileAttachments).toBe(true)
    expect(typeof opts.allowRecording).toBe('boolean')
  })

  it('onSubmit forwards the FULL evidence payload to the persist-first backend', async () => {
    init({ projectId: 'p1', backendUrl: 'https://x.test' })
    identify({ id: 'u_9', email: 'ada@example.com' })
    openModal('bug')
    const opts = (buildModal as any).mock.calls.at(-1)[1]

    const recording = { id: 'r1', dataUrl: 'data:video/webm;base64,AAAA', mime: 'video/webm', durationMs: 1200, width: 640, height: 480, bytes: 4, screenOnly: true }
    const file = { name: 'app.log', type: 'text/plain', size: 3, dataUrl: 'data:text/plain;base64,' + btoa('err') }
    await opts.onSubmit({
      type: 'bug', kind: 'task', title: 'Coupon broken',
      description: 'it fails', screenshots: ['data:image/jpeg;base64,/9j/AAA'],
      files: [file], recordings: [recording], annotations: { selector: '#coupon' },
      reporterEmail: 'gate@example.com', attachConsole: false,
    })

    expect((dispatchSubmit as any)).toHaveBeenCalledTimes(1)
    const payload = (dispatchSubmit as any).mock.calls[0][0]
    // Precise issue kind + title carried through.
    expect(payload.kind).toBe('task')
    expect(payload.title).toBe('Coupon broken')
    // Full evidence set forwarded (the whole point of KLA-729).
    expect(payload.annotations).toEqual({ selector: '#coupon' })
    expect(payload.recordings).toEqual([recording])
    expect(payload.files).toEqual([file])
    expect(payload.reporterEmail).toBe('gate@example.com')
    // Resolved reporter identity + freshly-captured client info + index-aligned thumbnails.
    expect(payload.reporter).toEqual({ id: 'u_9', email: 'ada@example.com' })
    expect(payload.clientInfo).toBeTruthy()
    expect(payload.screenshotThumbs).toEqual(['data:image/jpeg;base64,/9j/AAA#thumb'])
    // Project scoping preserved.
    expect(payload.projectId).toBe('p1')
  })
})

// ── 3. The SHARED core serializer emits the full-payload fields ────────────────
// Proves the convergence point: index.ts reuses buildFeedbackFormData (core) rather than duplicating
// serialization — the same function the extension/widget paths build on.
describe('shared buildFeedbackFormData serializes the KLA-729 full-payload fields', () => {
  it('emits title, reporter, client_info, recording + recording_meta, and annotations_json', () => {
    const fd = buildFeedbackFormData({
      description: 'x', pageUrl: 'https://app.example.com/', projectId: 'p1',
      title: 'A title',
      reporter: { id: 'u1', email: 'a@b.com' },
      clientInfo: { browser: 'Chrome', os: 'macOS' },
      recordings: [{ id: 'r1', dataUrl: 'data:video/webm;base64,AAAA', mime: 'video/webm', durationMs: 10, width: 2, height: 2, bytes: 3, screenOnly: false }],
      annotations: { selector: '#x' },
    })
    expect(fd.get('title')).toBe('A title')
    expect(JSON.parse(fd.get('reporter') as string)).toEqual({ id: 'u1', email: 'a@b.com' })
    expect(JSON.parse(fd.get('client_info') as string)).toEqual({ browser: 'Chrome', os: 'macOS' })
    expect((fd.getAll('recording') as File[]).length).toBe(1)
    expect(JSON.parse(fd.get('recording_meta') as string)[0].id).toBe('r1')
    expect(JSON.parse(fd.get('annotations_json') as string)).toEqual({ selector: '#x' })
  })

  it('omits every full-payload field when absent (extension path is byte-identical)', () => {
    const fd = buildFeedbackFormData({ description: 'x', pageUrl: 'https://app.example.com/' })
    for (const k of ['title', 'reporter', 'client_info', 'recording', 'recording_meta', 'annotations_json', 'files']) {
      expect(fd.get(k)).toBeNull()
    }
  })
})
