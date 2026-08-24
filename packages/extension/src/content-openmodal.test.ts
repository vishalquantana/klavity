// @vitest-environment jsdom
//
// KLA-517 [Snap/ext] — openModal TOCTOU regression test.
//
// `openModal` used to guard against double-open with only `if (modalCtrl) return`, but `modalCtrl` is
// assigned by buildModal AFTER two awaits (fetchModalConfig → buildModal). Two rapid triggers
// (context-menu click + keyboard shortcut, or a double-fire of the OPEN_MODAL message) therefore BOTH
// passed the check inside that window and mounted stacked composers.
//
// The fix adds `_composerOpening`, a synchronous boolean claimed BEFORE any await, so a re-entrant call
// bails immediately. These tests drive the REAL content.ts module and assert on the REAL buildModal DOM:
// one composer = exactly one `[data-klavity-ui="composer"]` host under document.body.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const fetchMock = vi.hoisted(() => vi.fn(async () => ({ ok: false })))

vi.mock('./coexist', () => ({ widgetPresent: () => false }))
vi.mock('./fullpage', () => ({ captureFullPage: async () => '' }))
// KLAV_CAPTURE_REVIEW / config plumbing is irrelevant here; keep the SW bridge inert but resolvable.
vi.mock('./ext-match', async (importOriginal) => {
  const orig = (await importOriginal().catch(() => ({}))) as Record<string, unknown>
  return { ...orig, parseMatchResponse: (_j: unknown) => null }
})

;(globalThis as any).fetch = fetchMock

function installChromeStub() {
  const store = new Map<string, unknown>()
  const g: any = globalThis as any
  g.chrome = {
    runtime: {
      getManifest: () => ({ name: 'klav-test' }),
      sendMessage: async () => {},
      lastError: undefined,
      onMessage: { addListener: () => {} },
    },
    storage: {
      // Support BOTH calling conventions: promise-style (config-flush etc.) and
      // callback-style (evidence-store's chromeLocalStorage adapter).
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
      sync: {
        get(key: string | string[], cb?: (r: any) => void) {
          const keys = Array.isArray(key) ? key : [key]
          const v = Object.fromEntries(keys.map((k) => [k, store.get(k)]))
          if (cb) setTimeout(() => cb(v), 0)
          return Promise.resolve(Array.isArray(key) ? v : v[key as string])
        },
      },
      onChanged: { addListener: () => {} },
    },
  }
  // jsdom lacks these; modal/capture code feature-detects or guards, but provide the cheap ones anyway.
  if (!g.requestIdleCallback) g.requestIdleCallback = (f: () => void) => setTimeout(f, 0)
  if (!g.cancelIdleCallback) g.cancelIdleCallback = (id: number) => clearTimeout(id)
}

let openModal: (type: 'bug' | 'feature', initialShot?: { dataUrl: string; quality?: 'rendered' | 'wireframe' | 'real-pixel' }) => Promise<void>
let closeModalForTest: () => void

async function importContentModule() {
  let mod: any
  vi.resetModules()
  await vi.dynamicImportSettled()
  mod = await import('./content')
  openModal = mod.openModal
  closeModalForTest = mod.closeModal
}

function composerHostCount(): number {
  return document.querySelectorAll('body > [data-klavity-ui="composer"]').length
}

beforeEach(() => {
  installChromeStub()
  document.body.innerHTML = ''
  fetchMock.mockClear()
  fetchMock.mockImplementation(async () => ({ ok: false }))
})

afterEach(() => {
  try { closeModalForTest?.() } catch { /* best-effort teardown */ }
})

describe('KLA-517 openModal TOCTOU — two rapid opens must yield exactly ONE composer', () => {
  it('two concurrent openModal("feature") calls mount exactly one composer host', async () => {
    await importContentModule()

    // Hold the config fetch in flight so the second call lands INSIDE the old TOCTOU window
    // (check-then-mount was split across this very await).
    let releaseConfig!: () => void
    const gate = new Promise<void>((res) => { releaseConfig = res })
    fetchMock.mockImplementation(async () => { await gate; return { ok: false } })

    const p1 = openModal('feature') // claims _composerOpening synchronously, then awaits the gate
    expect(composerHostCount()).toBe(0) // nothing mounted yet — still inside the window
    const p2 = openModal('feature')     // pre-fix: passed the stale check → stacked composer

    releaseConfig()
    await Promise.all([p1, p2])
    await vi.waitFor(() => expect(composerHostCount()).toBeGreaterThan(0))

    expect(composerHostCount()).toBe(1)
  })

  it('a call racing an in-flight bug-report open bails (session path)', async () => {
    await importContentModule()

    let releaseConfig!: () => void
    const gate = new Promise<void>((res) => { releaseConfig = res })
    fetchMock.mockImplementation(async () => { await gate; return { ok: false } })

    const pBug = openModal('bug')
    const pRacer = openModal('feature')

    releaseConfig()
    await Promise.all([pBug, pRacer])
    await vi.waitFor(() => expect(composerHostCount()).toBeGreaterThan(0))

    expect(composerHostCount()).toBe(1)
  })

  it('reopening works normally after the composer closes (guard resets on close/teardown)', async () => {
    await importContentModule()

    await openModal('feature')
    await vi.waitFor(() => expect(composerHostCount()).toBe(1))

    closeModalForTest() // programmatic teardown → onClose fires → flags cleared
    // close() tears down asynchronously (genie-out animation / 700ms jsdom fallback timer).
    await vi.waitFor(() => expect(composerHostCount()).toBe(0), { timeout: 3000 })

    await openModal('feature')
    await vi.waitFor(() => expect(composerHostCount()).toBe(1))
    expect(composerHostCount()).toBe(1)
  })
})
