import { describe, it, expect, beforeEach } from 'vitest'
import {
  EVIDENCE_KEY,
  SESSION_TTL_MS,
  MAX_SHOTS,
  MAX_SESSION_BYTES,
  getActiveSession,
  startOrContinue,
  addShot,
  removeShot,
  updateFields,
  clear,
  makeShot,
  pageCount,
  sessionBytes,
  evCountText,
  buildPagesTrail,
  isFresh,
  type EvidenceStorage,
  type ExtEvidenceSession,
  type ExtEvidenceShot,
} from './evidence-store'

// A tiny in-memory chrome.storage.local stand-in — proves the store is storage-agnostic (the same code
// runs over the extension-scoped chrome.storage.local in the browser, which is what survives cross-origin nav).
function memStorage(): EvidenceStorage & { _map: Map<string, unknown> } {
  const map = new Map<string, unknown>()
  return {
    _map: map,
    get: (k) => Promise.resolve(map.has(k) ? structuredCloneSafe(map.get(k)) : undefined),
    set: (k, v) => { map.set(k, structuredCloneSafe(v)); return Promise.resolve() },
    remove: (k) => { map.delete(k); return Promise.resolve() },
  }
}
// Emulate chrome.storage's structured-clone round-trip so tests don't accidentally share references.
function structuredCloneSafe<T>(v: T): T { return JSON.parse(JSON.stringify(v)) }

function shot(overrides: Partial<ExtEvidenceShot> = {}): ExtEvidenceShot {
  return {
    id: 's_' + Math.random().toString(36).slice(2),
    pageUrl: 'https://app.acme.com/list',
    pagePath: '/list',
    pageOrigin: 'https://app.acme.com',
    label: '',
    dataUrl: 'data:image/png;base64,AAAA',
    bytes: 4,
    w: 10, h: 10, ts: Date.now(),
    ...overrides,
  }
}

describe('startOrContinue', () => {
  let s: ReturnType<typeof memStorage>
  beforeEach(() => { s = memStorage() })

  it('creates a fresh empty bug session and persists it', async () => {
    const sess = await startOrContinue(s, 'proj_1')
    expect(sess.projectId).toBe('proj_1')
    expect(sess.reportType).toBe('bug')
    expect(sess.shots).toEqual([])
    expect(s._map.has(EVIDENCE_KEY)).toBe(true)
  })

  it('continues the existing session (does not wipe shots) and bumps updatedAt', async () => {
    const a = await startOrContinue(s, 'proj_1')
    await addShot(s, shot())
    const before = (await getActiveSession(s))!.updatedAt
    await new Promise((r) => setTimeout(r, 2))
    const b = await startOrContinue(s, 'proj_2')
    expect(b.id).toBe(a.id) // same in-progress report
    expect(b.shots.length).toBe(1) // shot preserved
    expect(b.updatedAt).toBeGreaterThanOrEqual(before)
    expect(b.projectId).toBe('proj_1') // first project wins; not overwritten
  })

  it('adopts a project id when the existing session had none', async () => {
    await startOrContinue(s, '')
    const b = await startOrContinue(s, 'proj_late')
    expect(b.projectId).toBe('proj_late')
  })
})

describe('addShot caps', () => {
  let s: ReturnType<typeof memStorage>
  beforeEach(async () => { s = memStorage(); await startOrContinue(s, 'p') })

  it('appends a shot tagged with its page', async () => {
    const res = await addShot(s, shot({ pageUrl: 'https://x.io/a', pagePath: '/a', pageOrigin: 'https://x.io' }))
    expect(res.ok).toBe(true)
    expect(res.session.shots[0].pageUrl).toBe('https://x.io/a')
  })

  it('rejects past MAX_SHOTS without mutating storage', async () => {
    for (let i = 0; i < MAX_SHOTS; i++) await addShot(s, shot())
    const res = await addShot(s, shot())
    expect(res.ok).toBe(false)
    expect(res.reason).toBe('max-shots')
    expect(res.session.shots.length).toBe(MAX_SHOTS)
  })

  it('rejects when the byte cap would be exceeded', async () => {
    const big = 'data:image/png;base64,' + 'A'.repeat(MAX_SESSION_BYTES)
    const res = await addShot(s, shot({ dataUrl: big, bytes: big.length }))
    expect(res.ok).toBe(false)
    expect(res.reason).toBe('max-bytes')
    expect(res.session.shots.length).toBe(0)
  })

  it('throws when no session exists', async () => {
    const empty = memStorage()
    await expect(addShot(empty, shot())).rejects.toThrow()
  })
})

describe('removeShot / updateFields / clear', () => {
  let s: ReturnType<typeof memStorage>
  beforeEach(async () => { s = memStorage(); await startOrContinue(s, 'p') })

  it('removes a shot by id', async () => {
    const target = shot({ id: 's_target' })
    await addShot(s, shot())
    await addShot(s, target)
    const after = await removeShot(s, 's_target')
    expect(after!.shots.some((x) => x.id === 's_target')).toBe(false)
    expect(after!.shots.length).toBe(1)
  })

  it('patches text fields', async () => {
    const after = await updateFields(s, { title: 'T', desc: 'D' })
    expect(after!.title).toBe('T')
    expect(after!.desc).toBe('D')
  })

  it('clear removes the session entirely', async () => {
    await clear(s)
    expect(await getActiveSession(s)).toBeNull()
  })
})

describe('getActiveSession TTL', () => {
  it('reaps a stale session and returns null', async () => {
    const s = memStorage()
    const stale: ExtEvidenceSession = {
      id: 'ev_x', projectId: 'p', createdAt: 0, updatedAt: Date.now() - SESSION_TTL_MS - 1000,
      title: '', desc: '', reportType: 'bug', shots: [shot()],
    }
    await s.set(EVIDENCE_KEY, stale)
    expect(await getActiveSession(s)).toBeNull()
    expect(s._map.has(EVIDENCE_KEY)).toBe(false) // reaped
  })

  it('keeps a fresh session', async () => {
    const s = memStorage()
    await startOrContinue(s, 'p')
    await addShot(s, shot())
    expect(await getActiveSession(s)).not.toBeNull()
  })

  it('resolves null (never throws) when storage.get rejects', async () => {
    const broken: EvidenceStorage = {
      get: () => Promise.reject(new Error('boom')),
      set: () => Promise.resolve(),
      remove: () => Promise.resolve(),
    }
    expect(await getActiveSession(broken)).toBeNull()
  })
})

describe('pure helpers', () => {
  it('pageCount counts distinct pages', () => {
    const sess: ExtEvidenceSession = {
      id: 'e', projectId: 'p', createdAt: 0, updatedAt: 0, title: '', desc: '', reportType: 'bug',
      shots: [
        shot({ pageUrl: 'https://a.com/1' }),
        shot({ pageUrl: 'https://a.com/1' }), // dup page
        shot({ pageUrl: 'https://b.com/2' }),
      ],
    }
    expect(pageCount(sess)).toBe(2)
    expect(sessionBytes(sess)).toBe(12)
  })

  it('evCountText reads shots + pages with correct pluralization', () => {
    const one: ExtEvidenceSession = {
      id: 'e', projectId: 'p', createdAt: 0, updatedAt: 0, title: '', desc: '', reportType: 'bug',
      shots: [shot()],
    }
    expect(evCountText(one)).toBe('1 shot · 1 page · not lost')
    expect(evCountText(null)).toBe('0 shots · 0 pages · not lost')
  })

  it('buildPagesTrail lists each captured page in order', () => {
    const trail = buildPagesTrail([
      shot({ pageUrl: 'https://a.com/list', pagePath: '/list' }),
      shot({ pageUrl: 'https://b.com/detail', pagePath: '/detail' }),
    ])
    expect(trail).toContain('Pages captured:')
    expect(trail).toContain('1. /list - https://a.com/list')
    expect(trail).toContain('2. /detail - https://b.com/detail')
  })

  it('buildPagesTrail is empty for no shots', () => {
    expect(buildPagesTrail([])).toBe('')
  })

  it('isFresh honours the TTL boundary', () => {
    const now = 1_000_000
    expect(isFresh({ updatedAt: now } as ExtEvidenceSession, now)).toBe(true)
    expect(isFresh({ updatedAt: now - SESSION_TTL_MS } as ExtEvidenceSession, now)).toBe(true)
    expect(isFresh({ updatedAt: now - SESSION_TTL_MS - 1 } as ExtEvidenceSession, now)).toBe(false)
  })

  it('makeShot tags the current page and records byte length', () => {
    const sh = makeShot('data:image/png;base64,ZZZZ', { href: 'https://c.com/p?q=1', pathname: '/p', origin: 'https://c.com' }, { w: 5, h: 6 })
    expect(sh.pageUrl).toBe('https://c.com/p?q=1')
    expect(sh.pagePath).toBe('/p')
    expect(sh.pageOrigin).toBe('https://c.com')
    expect(sh.bytes).toBe('data:image/png;base64,ZZZZ'.length)
    expect(sh.w).toBe(5)
  })
})

describe('cross-origin durability (the #442 core guarantee)', () => {
  it('a shot captured on origin A is visible when "navigating" to origin B (same extension storage)', async () => {
    // ONE storage instance stands in for chrome.storage.local, which is shared across every origin/tab.
    const s = memStorage()
    await startOrContinue(s, 'proj')
    await addShot(s, makeShot('data:image/png;base64,AAAA', { href: 'https://app.acme.com/x', pathname: '/x', origin: 'https://app.acme.com' }))
    // Simulate a cross-origin navigation: a brand-new page reads the SAME extension storage.
    const resumed = await getActiveSession(s)
    expect(resumed).not.toBeNull()
    expect(resumed!.shots).toHaveLength(1)
    // Capture again from the new origin.
    await addShot(s, makeShot('data:image/png;base64,BBBB', { href: 'https://billing.other.com/y', pathname: '/y', origin: 'https://billing.other.com' }))
    const final = await getActiveSession(s)
    expect(pageCount(final!)).toBe(2)
    expect(buildPagesTrail(final!.shots)).toContain('https://billing.other.com/y')
  })
})
