// @vitest-environment jsdom
//
// KLA-726 [ext] — right-click context menu is now the polished "card" menu at visual parity with the
// widget (packages/sdk/src/widget.ts), rendered via the shared @klavity/core/context-menu builder.
//
// These tests drive the REAL content.ts showCtxMenu and assert on the REAL DOM:
//   • each card renders a TITLE (.klm-t) + DESCRIPTION (.klm-d) with the exact widget copy;
//   • clicking "Report a Bug" takes the bug openModal path (mounts one composer host);
//   • the Sims cards (Deploy all Sims / Select Sims…) appear ONLY when a project is configured.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const fetchMock = vi.hoisted(() => vi.fn(async () => ({ ok: false })))

vi.mock('./coexist', () => ({ widgetPresent: () => false }))
vi.mock('./fullpage', () => ({ captureFullPage: async () => '' }))
vi.mock('./ext-match', async (importOriginal) => {
  const orig = (await importOriginal().catch(() => ({}))) as Record<string, unknown>
  return { ...orig, parseMatchResponse: (_j: unknown) => null }
})

;(globalThis as any).fetch = fetchMock

// Capture the runtime onMessage listener content.ts registers so a test can push KLAV_CONFIG_UPDATED.
let msgListener: ((m: any) => void) | null = null

function installChromeStub() {
  const store = new Map<string, unknown>()
  const g: any = globalThis as any
  g.chrome = {
    runtime: {
      getManifest: () => ({ name: 'klav-test' }),
      sendMessage: async () => {},
      lastError: undefined,
      onMessage: { addListener: (fn: (m: any) => void) => { msgListener = fn } },
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
  if (!g.requestIdleCallback) g.requestIdleCallback = (f: () => void) => setTimeout(f, 0)
  if (!g.cancelIdleCallback) g.cancelIdleCallback = (id: number) => clearTimeout(id)
}

let mod: any

async function importContentModule() {
  vi.resetModules()
  msgListener = null
  await vi.dynamicImportSettled()
  mod = await import('./content')
}

function menuEl(): HTMLElement | null {
  return document.querySelector('.klm-menu')
}
function cardTitles(): string[] {
  return Array.from(document.querySelectorAll('.klm-menu .klm-card .klm-t')).map((n) => (n.textContent || '').trim())
}
function cardDescs(): string[] {
  return Array.from(document.querySelectorAll('.klm-menu .klm-card .klm-d')).map((n) => (n.textContent || '').trim())
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
  try { mod?.closeModal?.() } catch { /* best-effort */ }
})

describe('KLA-726 extension card menu — parity with the widget', () => {
  it('renders the report cards with the exact widget titles + descriptions', async () => {
    await importContentModule()
    mod.showCtxMenu(10, 10)

    expect(menuEl()).toBeTruthy()
    const titles = cardTitles()
    expect(titles).toContain('Report a Bug')
    expect(titles).toContain('Request a Feature')
    expect(titles).toContain('Browser menu')
    expect(titles).toContain('View submissions')

    const descs = cardDescs()
    expect(descs).toContain('Snap the page and tell us what broke.')
    expect(descs).toContain("Suggest something you'd love to see.")

    // Primary "Report a Bug" card is the brand-purple one.
    const primary = document.querySelector('.klm-menu .klm-card.primary .klm-t')
    expect(primary?.textContent?.trim()).toBe('Report a Bug')

    // "Powered by Klavity" footer present.
    expect(document.querySelector('.klm-menu .klm-foot')).toBeTruthy()
  })

  it('Sims cards appear ONLY when a project is configured', async () => {
    await importContentModule()

    // Unconfigured: no Sims cards.
    mod.showCtxMenu(10, 10)
    expect(cardTitles()).not.toContain('Deploy all Sims')
    expect(cardTitles()).not.toContain('Select Sims…')

    // Configure a project via the real KLAV_CONFIG_UPDATED message path.
    expect(msgListener).toBeTruthy()
    msgListener!({
      kind: 'KLAV_CONFIG_UPDATED',
      config: {
        email: 'vishal@quantana.com.au',
        token: 't',
        backendUrl: 'https://example.test',
        projects: [{ id: 'p1', name: 'Proj', reviewMode: 'manual', monitoredUrls: [] }],
        syncedAt: Date.now(),
      },
    })

    // Reopen — now the Sims deploy cards render (with their widget copy).
    mod.showCtxMenu(10, 10)
    expect(cardTitles()).toContain('Deploy all Sims')
    expect(cardTitles()).toContain('Select Sims…')
    expect(cardDescs()).toContain('Have every Sim jump in and analyze this page.')
    expect(cardDescs()).toContain('Choose which Sims jump into action.')
  })

  it('clicking "Report a Bug" takes the bug openModal path (mounts one composer)', async () => {
    await importContentModule()
    mod.showCtxMenu(10, 10)

    const bugCard = Array.from(document.querySelectorAll('.klm-menu .klm-card')).find(
      (c) => (c.querySelector('.klm-t')?.textContent || '').trim() === 'Report a Bug',
    ) as HTMLButtonElement
    expect(bugCard).toBeTruthy()

    bugCard.click()
    // Menu closes on pick.
    expect(menuEl()).toBeFalsy()
    // openModal('bug') runs → exactly one composer host mounts.
    await vi.waitFor(() => expect(composerHostCount()).toBe(1))
  })
})
