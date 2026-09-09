// @vitest-environment jsdom
//
// KLA-771 (extension half) — the document `contextmenu` listener must run in the CAPTURE phase
// so a host page that stopPropagation()s its own contextmenu handler (e.g. qa1.px4app.com / px4)
// can't stop us reaching document and suppressing the native menu. Mirrors the widget fix in
// packages/sdk/src/widget.ts (registered with the 3rd arg `true`).
//
// These tests drive the REAL content.ts document listener against a REAL jsdom DOM and a host
// page that installs a bubble-phase contextmenu handler calling stopPropagation() — the exact
// scenario that broke in the bubble phase. Modeled on content-ctxmenu.test.ts.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('./coexist', () => ({ widgetPresent: () => false }))
vi.mock('./fullpage', () => ({ captureFullPage: async () => '' }))
vi.mock('./ext-match', async (importOriginal) => {
  const orig = (await importOriginal().catch(() => ({}))) as Record<string, unknown>
  return { ...orig, parseMatchResponse: (_j: unknown) => null }
})

const fetchMock = vi.hoisted(() => vi.fn(async () => ({ ok: false })))
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

let mod: any

async function importContentModule() {
  vi.resetModules()
  await vi.dynamicImportSettled()
  mod = await import('./content')
}

function menuEl(): HTMLElement | null {
  return document.querySelector('.klm-menu')
}

// A hostile host page: installs its OWN bubble-phase contextmenu handler that stopPropagation()s.
// In the bubble phase this would prevent our document listener from ever running.
function installHostStopPropagation(target: EventTarget): () => void {
  const handler = (e: Event) => e.stopPropagation()
  target.addEventListener('contextmenu', handler) // bubble phase (default)
  return () => target.removeEventListener('contextmenu', handler)
}

function fireContextMenu(target: Element, opts: Partial<MouseEventInit> = {}) {
  const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 20, clientY: 20, ...opts })
  target.dispatchEvent(ev)
  return ev
}

beforeEach(() => {
  installChromeStub()
  document.body.innerHTML = ''
  fetchMock.mockClear()
  fetchMock.mockImplementation(async () => ({ ok: false }))
})

afterEach(() => {
  try { mod?.closeModal?.() } catch { /* best-effort */ }
  try { mod?.closeCtxMenu?.() } catch { /* best-effort */ }
})

describe('KLA-771 [ext] contextmenu wins in capture phase', () => {
  it('suppresses the native menu + shows our menu even when the host stopPropagation()s its own contextmenu handler', async () => {
    await importContentModule()
    const el = document.createElement('div')
    document.body.appendChild(el)
    const off = installHostStopPropagation(el)

    const ev = fireContextMenu(el)

    // Capture runs before the host's bubble handler → we preventDefault (native menu suppressed)
    // and our card menu renders. In the bubble phase the host's stopPropagation would have blocked both.
    expect(ev.defaultPrevented).toBe(true)
    expect(menuEl()).toBeTruthy()
    off()
  })

  it('Shift+right-click passes through to the native menu (no preventDefault, no overlay)', async () => {
    await importContentModule()
    const el = document.createElement('div')
    document.body.appendChild(el)

    const ev = fireContextMenu(el, { shiftKey: true })

    expect(ev.defaultPrevented).toBe(false)
    expect(menuEl()).toBeFalsy()
  })

  it('right-click on an editable field passes through (spellcheck / cut-copy-paste preserved)', async () => {
    await importContentModule()
    const input = document.createElement('input')
    document.body.appendChild(input)

    const ev = fireContextMenu(input)

    expect(ev.defaultPrevented).toBe(false)
    expect(menuEl()).toBeFalsy()
  })
})
