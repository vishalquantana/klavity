// @vitest-environment jsdom
//
// KLA-728 [Snap/ext] — composer AI-assist parity with the widget.
//
// The extension's buildModal call used to OMIT the composer AI-assist callbacks the widget wires
// (packages/sdk/src/widget.ts) and the SDK mirrored in KLA-729 (packages/sdk/src/index.ts):
//   • onEnhance      → POST /api/report/enhance   (Enhance-with-AI)
//   • onClarityTip   → POST /api/report/clarity   (report-clarity coach tip)
//   • onDictate      → POST /api/voice/transcribe (batch voice dictation)
//   • dictationStreamUrl → wss …/api/voice/stream?project=…  (live dictation)
// …AND the config fetch dropped the TOP-LEVEL `reportClarity` flag, so the clarity meter never rendered
// even when a project enabled it.
//
// These tests drive the REAL content.ts openModal path with a captured buildModal (spy) and assert the
// callbacks are now wired, correctly scoped to the matched project + backend, and that reportClarity is
// read from the config response into the buildModal config (cfg.reportClarity).

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Capture the buildModal(type, opts, config) invocation. installRegionDrag/isEditableTarget must still be
// exported (content.ts imports them); the composer DOM itself is irrelevant here — we assert on the opts.
const captured = vi.hoisted(() => ({ type: '', opts: null as any, config: null as any }))
vi.mock('@klavity/core/modal', async (importOriginal) => {
  const orig = (await importOriginal().catch(() => ({}))) as Record<string, unknown>
  return {
    ...orig,
    buildModal: (type: string, opts: any, config: any) => {
      captured.type = type; captured.opts = opts; captured.config = config
      return {
        addScreenshot: () => {},
        close: () => {},
        setBusy: () => {},
        destroy: () => {},
      }
    },
  }
})
vi.mock('./coexist', () => ({ widgetPresent: () => false }))
vi.mock('./fullpage', () => ({ captureFullPage: async () => '' }))
vi.mock('./ext-match', async (importOriginal) => {
  const orig = (await importOriginal().catch(() => ({}))) as Record<string, unknown>
  return { ...orig, parseMatchResponse: () => null }
})

const fetchMock = vi.hoisted(() => vi.fn())
;(globalThis as any).fetch = fetchMock

// The config response: modalConfig sibling + the TOP-LEVEL reportClarity flag (this is what the widget
// reads and the extension previously ignored). Default response has reportClarity ON.
function configResponse(reportClarity: boolean | undefined) {
  const body: any = { modalConfig: { composer: {} } }
  if (reportClarity !== undefined) body.reportClarity = reportClarity
  return { ok: true, json: async () => body }
}

let messageListener: ((msg: any) => void) | null = null
function installChromeStub() {
  const store = new Map<string, unknown>()
  const g: any = globalThis as any
  messageListener = null
  g.chrome = {
    runtime: {
      getManifest: () => ({ name: 'klav-test' }),
      sendMessage: async () => {},
      lastError: undefined,
      onMessage: { addListener: (fn: (msg: any) => void) => { messageListener = fn } },
    },
    storage: {
      local: {
        get(key: string | string[], cb?: (r: any) => void) {
          const keys = Array.isArray(key) ? key : [key]
          const v = Object.fromEntries(keys.map((k) => [k, store.get(k)]))
          if (cb) setTimeout(() => cb(v), 0)
          return Promise.resolve(Array.isArray(key) ? v : v[key as string])
        },
        set(obj: Record<string, unknown>, cb?: () => void) {
          for (const [k, v] of Object.entries(obj)) store.set(k, v)
          if (cb) setTimeout(cb, 0)
          return Promise.resolve()
        },
        remove(key: string | string[], cb?: () => void) {
          for (const k of Array.isArray(key) ? key : [key]) store.delete(k)
          if (cb) setTimeout(cb, 0)
          return Promise.resolve()
        },
      },
      sync: { get: (_k: any, cb?: (r: any) => void) => { if (cb) setTimeout(() => cb({}), 0); return Promise.resolve({}) } },
      onChanged: { addListener: () => {} },
    },
  }
  if (!g.requestIdleCallback) g.requestIdleCallback = (f: () => void) => setTimeout(f, 0)
  if (!g.cancelIdleCallback) g.cancelIdleCallback = (id: number) => clearTimeout(id)
}

// A monitored project matching jsdom's location.href (http://localhost:3000/ by default → the '*' pattern).
const CONFIG = {
  email: 'vishal@quantana.com.au', token: 'ext_tok', backendUrl: 'https://backend.test',
  projects: [{ id: 'proj_1', monitoredUrls: ['*'] }], syncedAt: 1,
}

let openModal: (type: 'bug' | 'feature') => Promise<void>
let closeModalForTest: () => void

async function importContentModule() {
  vi.resetModules()
  await vi.dynamicImportSettled()
  const mod: any = await import('./content')
  openModal = mod.openModal
  closeModalForTest = mod.closeModal
}

// Route the config fetch → configResponse; everything else (extension/match, best-effort activation
// fetches) → an inert ok:false so nothing throws.
function armFetch(reportClarity: boolean | undefined) {
  fetchMock.mockImplementation(async (url: any) => {
    const u = String(url)
    if (u.includes('/api/projects/') && u.includes('/config')) return configResponse(reportClarity)
    return { ok: false, json: async () => ({}) }
  })
}

async function openWithConfig(reportClarity: boolean | undefined) {
  await importContentModule()
  armFetch(reportClarity)
  // Seed klavConfig via the real KLAV_CONFIG_UPDATED message path (sets the module's klavConfig).
  expect(messageListener).toBeTypeOf('function')
  messageListener!({ kind: 'KLAV_CONFIG_UPDATED', config: CONFIG })
  captured.opts = null
  await openModal('feature')
  await vi.waitFor(() => expect(captured.opts).not.toBeNull())
}

beforeEach(() => {
  installChromeStub()
  document.body.innerHTML = ''
  fetchMock.mockReset()
})
afterEach(() => { try { closeModalForTest?.() } catch { /* teardown */ } })

describe('KLA-728 — extension composer wires the AI-assist callbacks (widget parity)', () => {
  it('reportClarity ON: onEnhance + onClarityTip + voice are wired and reportClarity threads into config', async () => {
    await openWithConfig(true)
    const opts = captured.opts

    // Enhance + clarity + voice callbacks present…
    expect(opts.onEnhance).toBeTypeOf('function')
    expect(opts.onClarityTip).toBeTypeOf('function')
    expect(opts.onDictate).toBeTypeOf('function')
    // …live-stream URL derived from the backend (https→wss) + scoped to the project.
    expect(opts.dictationStreamUrl).toBe('wss://backend.test/api/voice/stream?project=proj_1')

    // reportClarity read from the TOP-LEVEL flag → threaded into the buildModal config (meter renders).
    expect(captured.config.reportClarity).toBe(true)

    // onEnhance POSTs the reporter text + project to /api/report/enhance, scoped correctly.
    fetchMock.mockClear()
    fetchMock.mockImplementation(async () => ({ ok: true, json: async () => ({ draft: { description: 'X' } }) }))
    const draft = await opts.onEnhance('login is broken', { images: 1, shot: 'data:image/png;base64,AAA' })
    expect(draft).toEqual({ description: 'X' })
    const [enhUrl, enhInit] = fetchMock.mock.calls.at(-1)!
    expect(String(enhUrl)).toBe('https://backend.test/api/report/enhance')
    const enhBody = JSON.parse((enhInit as any).body)
    expect(enhBody.projectId).toBe('proj_1')
    expect(enhBody.text).toBe('login is broken')

    // onClarityTip POSTs to /api/report/clarity and returns the tip.
    fetchMock.mockClear()
    fetchMock.mockImplementation(async () => ({ ok: true, json: async () => ({ tip: 'add repro steps' }) }))
    const tip = await opts.onClarityTip('short', { images: 0 })
    expect(tip).toEqual({ tip: 'add repro steps' })
    expect(String(fetchMock.mock.calls.at(-1)![0])).toBe('https://backend.test/api/report/clarity')

    // onDictate POSTs multipart audio to /api/voice/transcribe.
    fetchMock.mockClear()
    fetchMock.mockImplementation(async () => ({ ok: true, json: async () => ({ text: 'hello' }) }))
    const said = await opts.onDictate(new Blob(['x'], { type: 'audio/webm' }))
    expect(said).toEqual({ text: 'hello' })
    expect(String(fetchMock.mock.calls.at(-1)![0])).toBe('https://backend.test/api/voice/transcribe')
  })

  it('reportClarity OFF: Enhance + clarity are NOT wired, but voice still is (widget parity)', async () => {
    await openWithConfig(false)
    const opts = captured.opts
    expect(opts.onEnhance).toBeUndefined()
    expect(opts.onClarityTip).toBeUndefined()
    // Voice is wired on every project regardless of the clarity toggle.
    expect(opts.onDictate).toBeTypeOf('function')
    expect(opts.dictationStreamUrl).toBe('wss://backend.test/api/voice/stream?project=proj_1')
    // reportClarity explicitly false → threaded through as false.
    expect(captured.config.reportClarity).toBe(false)
  })

  it('assist endpoints are best-effort: a failed POST resolves null (never throws into the composer)', async () => {
    await openWithConfig(true)
    const opts = captured.opts
    fetchMock.mockClear()
    fetchMock.mockImplementation(async () => ({ ok: false, json: async () => ({}) }))
    await expect(opts.onEnhance('x')).resolves.toBeNull()
    await expect(opts.onClarityTip('x')).resolves.toBeNull()
    await expect(opts.onDictate(new Blob(['x']))).resolves.toBeNull()
  })
})
