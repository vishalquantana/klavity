import { describe, it, expect } from 'vitest'
import {
  qaStatusBucket,
  qaDeriveCounts,
  parsePageBugs,
  qaResolveCoords,
  qaCountLabel,
  qaTotal,
  qaTimeAgo,
  type QaBug,
} from './qa-mode'

describe('qaStatusBucket', () => {
  it('buckets open-ish statuses to open', () => {
    for (const s of ['open', 'new', 'backlog', 'todo', 'reported', '', undefined, null]) {
      expect(qaStatusBucket(s as any)).toBe('open')
    }
  })
  it('buckets in-progress variants to prog', () => {
    for (const s of ['in progress', 'In Progress', 'in_progress', 'started', 'doing', 'In Review', 'triage', 'WIP', 'testing']) {
      expect(qaStatusBucket(s)).toBe('prog')
    }
  })
  it('buckets terminal states to done', () => {
    for (const s of ['done', 'Done', 'closed', 'resolved', 'Fixed', 'completed', 'shipped', 'cancelled', 'canceled']) {
      expect(qaStatusBucket(s)).toBe('done')
    }
  })
})

describe('qaDeriveCounts', () => {
  it('tallies buckets', () => {
    const bugs: QaBug[] = [
      { id: '1', status: 'open' },
      { id: '2', status: 'new' },
      { id: '3', status: 'in progress' },
      { id: '4', status: 'done' },
    ]
    expect(qaDeriveCounts(bugs)).toEqual({ open: 2, inProgress: 1, done: 1 })
  })
  it('handles empty', () => {
    expect(qaDeriveCounts([])).toEqual({ open: 0, inProgress: 0, done: 0 })
  })
})

describe('parsePageBugs', () => {
  it('parses a well-formed body and keeps server counts', () => {
    const raw = {
      bugs: [
        { id: 'a', ref: 'CHAR-241', title: 'Coupon broken', status: 'open', reporterEmail: 'u@x.com', coords: { x: 120, y: 66 } },
        { id: 'b', ref: 'CHAR-242', status: 'in progress', coords: null },
      ],
      counts: { open: 1, inProgress: 1, done: 0 },
    }
    const out = parsePageBugs(raw)
    expect(out.bugs).toHaveLength(2)
    expect(out.bugs[0].coords).toEqual({ x: 120, y: 66 })
    expect(out.bugs[1].coords).toBeNull()
    expect(out.counts).toEqual({ open: 1, inProgress: 1, done: 0 })
  })
  it('derives counts when the server omits or mangles them', () => {
    const out = parsePageBugs({ bugs: [{ id: '1', status: 'open' }, { id: '2', status: 'done' }], counts: 'nope' })
    expect(out.counts).toEqual({ open: 1, inProgress: 0, done: 1 })
  })
  it('tolerates garbage', () => {
    expect(parsePageBugs(null)).toEqual({ bugs: [], counts: { open: 0, inProgress: 0, done: 0 } })
    expect(parsePageBugs({})).toEqual({ bugs: [], counts: { open: 0, inProgress: 0, done: 0 } })
    expect(parsePageBugs({ bugs: [null, {}, { id: 'ok' }] }).bugs).toHaveLength(1)
  })
  it('falls back id to ref and drops idless rows', () => {
    const out = parsePageBugs({ bugs: [{ ref: 'R1' }, { title: 'noid' }] })
    expect(out.bugs).toHaveLength(1)
    expect(out.bugs[0].id).toBe('R1')
  })
})

describe('qaResolveCoords', () => {
  const dims = { w: 1000, h: 2000 }
  it('returns null for missing coords', () => {
    expect(qaResolveCoords(null, dims)).toBeNull()
    expect(qaResolveCoords(undefined, dims)).toBeNull()
  })
  it('treats <=1 pairs as fractions of the page', () => {
    expect(qaResolveCoords({ x: 0.5, y: 0.25 }, dims)).toEqual({ x: 500, y: 500 })
  })
  it('treats larger values as raw pixels', () => {
    expect(qaResolveCoords({ x: 120, y: 66 }, dims)).toEqual({ x: 120, y: 66 })
  })
  it('clamps out-of-bounds pixels onto the page', () => {
    expect(qaResolveCoords({ x: 5000, y: -10 }, dims)).toEqual({ x: 1000, y: 0 })
  })
})

describe('qaCountLabel / qaTotal', () => {
  it('omits zero buckets', () => {
    expect(qaCountLabel({ open: 2, inProgress: 0, done: 1 })).toBe('2 open · 1 done')
  })
  it('says all clear when empty', () => {
    expect(qaCountLabel({ open: 0, inProgress: 0, done: 0 })).toBe('all clear')
  })
  it('totals', () => {
    expect(qaTotal({ open: 2, inProgress: 1, done: 1 })).toBe(4)
  })
})

describe('qaTimeAgo', () => {
  const now = 1_000_000_000_000
  it('just now under a minute', () => {
    expect(qaTimeAgo(now - 30_000, now)).toBe('just now')
  })
  it('minutes/hours/days', () => {
    expect(qaTimeAgo(now - 5 * 60_000, now)).toBe('5m ago')
    expect(qaTimeAgo(now - 2 * 3600_000, now)).toBe('2h ago')
    expect(qaTimeAgo(now - 3 * 86_400_000, now)).toBe('3d ago')
  })
  it('empty for junk', () => {
    expect(qaTimeAgo(undefined, now)).toBe('')
    expect(qaTimeAgo('not-a-date', now)).toBe('')
  })
})
