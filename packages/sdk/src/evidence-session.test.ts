// @vitest-environment jsdom
//
// KLA-412 — evidence-session storage tests. Runs against fake-indexeddb (a spec-compliant in-memory
// IndexedDB) so the read-modify-write + TTL + caps are exercised exactly as they'd run in a browser.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import {
  getActiveSession,
  startOrContinue,
  addShot,
  updateFields,
  removeShot,
  updateShotAnnotations,
  clear,
  makeShotId,
  pageCount,
  sessionBytes,
  sessionKey,
  MAX_SHOTS,
  SESSION_TTL_MS,
  type EvidenceShot,
} from './evidence-session'

const ORIGIN = 'https://app.example.com'
const PROJECT = 'proj_test'

// Fresh, isolated IndexedDB per test.
beforeEach(() => {
  ;(globalThis as any).indexedDB = new IDBFactory()
})
afterEach(() => {
  vi.restoreAllMocks()
})

function shot(bytes: number, page: string, label = ''): EvidenceShot {
  return {
    id: makeShotId(),
    pageUrl: ORIGIN + page,
    pagePath: page,
    label,
    blob: new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' }),
    bytes,
    w: 800,
    h: 600,
    ts: Date.now(),
  }
}

describe('startOrContinue', () => {
  it('creates a new empty session keyed by (projectId, origin)', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    expect(s.id).toBe(sessionKey(PROJECT, ORIGIN))
    expect(s.projectId).toBe(PROJECT)
    expect(s.origin).toBe(ORIGIN)
    expect(s.shots).toEqual([])
    expect(s.reportType).toBe('bug')
    expect(s.createdAt).toBeGreaterThan(0)
  })

  it('continues (returns the same) session on a second call, not a duplicate', async () => {
    const a = await startOrContinue(PROJECT, ORIGIN)
    await addShot(a.id, shot(10, '/one'))
    const b = await startOrContinue(PROJECT, ORIGIN)
    expect(b.id).toBe(a.id)
    expect(b.shots.length).toBe(1)
  })

  it('keeps sessions for different origins separate', async () => {
    const a = await startOrContinue(PROJECT, ORIGIN)
    await addShot(a.id, shot(10, '/one'))
    const other = await startOrContinue(PROJECT, 'https://other.example.com')
    expect(other.shots.length).toBe(0)
    expect(other.id).not.toBe(a.id)
  })
})

describe('addShot', () => {
  it('appends a shot carrying its page metadata', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    const res = await addShot(s.id, shot(100, '/deals', 'list'))
    expect(res.ok).toBe(true)
    const active = await getActiveSession(PROJECT, ORIGIN)
    expect(active!.shots.length).toBe(1)
    expect(active!.shots[0].pagePath).toBe('/deals')
    expect(active!.shots[0].pageUrl).toBe(ORIGIN + '/deals')
    expect(active!.shots[0].label).toBe('list')
  })

  it('tracks multiple pages via pageCount', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    await addShot(s.id, shot(10, '/deals'))
    await addShot(s.id, shot(10, '/deals/new'))
    await addShot(s.id, shot(10, '/deals/new')) // same page again
    const active = await getActiveSession(PROJECT, ORIGIN)
    expect(active!.shots.length).toBe(3)
    expect(pageCount(active!)).toBe(2)
  })

  it('enforces the max-shots cap without mutating storage', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    for (let i = 0; i < MAX_SHOTS; i++) await addShot(s.id, shot(10, '/p' + i))
    const res = await addShot(s.id, shot(10, '/overflow'))
    expect(res.ok).toBe(false)
    expect(res.reason).toBe('max-shots')
    const active = await getActiveSession(PROJECT, ORIGIN)
    expect(active!.shots.length).toBe(MAX_SHOTS)
  })

  it('enforces the byte cap without mutating storage', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    const big = 6 * 1024 * 1024
    await addShot(s.id, shot(big, '/a'))
    const res = await addShot(s.id, shot(big, '/b')) // would exceed 10 MB
    expect(res.ok).toBe(false)
    expect(res.reason).toBe('max-bytes')
    const active = await getActiveSession(PROJECT, ORIGIN)
    expect(active!.shots.length).toBe(1)
    expect(sessionBytes(active!)).toBe(big)
  })

  it('throws for an unknown session id', async () => {
    await expect(addShot('nope|nope', shot(10, '/x'))).rejects.toThrow()
  })
})

describe('getActiveSession TTL', () => {
  it('returns null and reaps a session older than the TTL', async () => {
    // Spy Date.now (NOT fake timers — faking timers stalls IndexedDB's async scheduling).
    const t0 = Date.now()
    const clock = vi.spyOn(Date, 'now').mockReturnValue(t0)
    const s = await startOrContinue(PROJECT, ORIGIN)
    await addShot(s.id, shot(10, '/one'))

    // Jump past the TTL — the next getActiveSession must treat it as abandoned.
    clock.mockReturnValue(t0 + SESSION_TTL_MS + 60_000)
    const active = await getActiveSession(PROJECT, ORIGIN)
    expect(active).toBeNull()

    // It was reaped: a fresh startOrContinue yields an empty session.
    const fresh = await startOrContinue(PROJECT, ORIGIN)
    expect(fresh.shots.length).toBe(0)
  })

  it('returns the session when still within the TTL', async () => {
    const t0 = Date.now()
    const clock = vi.spyOn(Date, 'now').mockReturnValue(t0)
    const s = await startOrContinue(PROJECT, ORIGIN)
    await addShot(s.id, shot(10, '/one'))
    clock.mockReturnValue(t0 + SESSION_TTL_MS - 60_000)
    const active = await getActiveSession(PROJECT, ORIGIN)
    expect(active).not.toBeNull()
    expect(active!.shots.length).toBe(1)
  })
})

describe('removeShot', () => {
  it('drops a single shot by id, leaving the rest', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    const r1 = await addShot(s.id, shot(10, '/a'))
    const targetId = r1.session.shots[0].id
    await addShot(s.id, shot(10, '/b'))
    const after = await removeShot(s.id, targetId)
    expect(after!.shots.length).toBe(1)
    expect(after!.shots[0].pagePath).toBe('/b')
  })

  it('returns null for an unknown session', async () => {
    expect(await removeShot('nope|nope', 'x')).toBeNull()
  })
})

describe('updateFields', () => {
  it('patches title/desc/type/env', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    const after = await updateFields(s.id, { title: 'Broken', desc: 'steps', reportType: 'feature', env: 'QA' })
    expect(after!.title).toBe('Broken')
    expect(after!.desc).toBe('steps')
    expect(after!.reportType).toBe('feature')
    expect(after!.env).toBe('QA')
    const active = await getActiveSession(PROJECT, ORIGIN)
    expect(active!.title).toBe('Broken')
  })
})

describe('updateShotAnnotations (KLA-772)', () => {
  const overlay = (n: number) => ({ w: 800, h: 600, shapes: [{ type: 'text', color: '#ef4444', x: n, y: n, text: 'hi ' + n, size: 26, outline: 'black' }] })

  it('persists a shot overlay that survives a fresh read (round-trip)', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    await addShot(s.id, shot(10, '/a'))
    const after = await updateShotAnnotations(s.id, 0, overlay(5))
    expect(after!.shots[0].annotations).toEqual(overlay(5))
    // Re-read from storage: the overlay round-tripped through the structured clone.
    const active = await getActiveSession(PROJECT, ORIGIN)
    expect(active!.shots[0].annotations).toEqual(overlay(5))
  })

  it('keeps overlays attached to the RIGHT shot after a mid-strip removal + re-align', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    await addShot(s.id, shot(10, '/a'))
    const rMid = await addShot(s.id, shot(10, '/b'))
    await addShot(s.id, shot(10, '/c'))
    await updateShotAnnotations(s.id, 0, overlay(0))
    await updateShotAnnotations(s.id, 1, overlay(1))
    await updateShotAnnotations(s.id, 2, overlay(2))
    // Remove the middle shot, then re-write the (now shifted) overlays as the widget does post-removal.
    await removeShot(s.id, rMid.session.shots[1].id)
    // After removal the strip is [/a, /c]; the modal's shifted map is { 0: overlay(0), 1: overlay(2) }.
    await updateShotAnnotations(s.id, 0, overlay(0))
    await updateShotAnnotations(s.id, 1, overlay(2))
    const active = await getActiveSession(PROJECT, ORIGIN)
    expect(active!.shots.map((sh) => sh.pagePath)).toEqual(['/a', '/c'])
    expect(active!.shots[0].annotations).toEqual(overlay(0))
    expect(active!.shots[1].annotations).toEqual(overlay(2))
  })

  it('clears an overlay when passed null (undo back to a clean image)', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    await addShot(s.id, shot(10, '/a'))
    await updateShotAnnotations(s.id, 0, overlay(1))
    await updateShotAnnotations(s.id, 0, null)
    const active = await getActiveSession(PROJECT, ORIGIN)
    expect(active!.shots[0].annotations).toBeUndefined()
  })

  it('no-ops (returns null) for an unknown session or out-of-range index', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    await addShot(s.id, shot(10, '/a'))
    expect(await updateShotAnnotations('nope|nope', 0, overlay(1))).toBeNull()
    expect(await updateShotAnnotations(s.id, 9, overlay(1))).toBeNull()
  })
})

describe('clear', () => {
  it('removes the session so getActiveSession returns null', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    await addShot(s.id, shot(10, '/a'))
    await clear(s.id)
    expect(await getActiveSession(PROJECT, ORIGIN)).toBeNull()
  })
})
