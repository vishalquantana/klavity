import { describe, it, expect } from 'vitest'
import { gunzipSync } from 'node:zlib'
import { gzipReplayField, buildFeedbackFormData } from '../../src/integrations/backend'

const events = (n: number) => Array.from({ length: n }, (_, i) => ({ type: 3, timestamp: 1000 + i, data: { source: 1, x: i } }))
const base = { description: 'd', pageUrl: 'https://e.com' }

describe('gzipReplayField', () => {
  it('replaces the plain replay_events JSON with a gzip file part that inflates back to the same events', async () => {
    const ev = events(500)
    const form = buildFeedbackFormData({ ...base, replayEvents: ev })
    const rawLen = String(form.get('replay_events')).length
    await gzipReplayField(form)
    expect(form.get('replay_events')).toBeNull()
    const part = form.get('replay_events_gz') as File
    expect(part).toBeInstanceOf(Blob)
    expect(part.name).toBe('replay.json.gz')
    expect(part.size).toBeLessThan(rawLen / 3)                       // repetitive rrweb JSON shrinks a lot
    expect(JSON.parse(gunzipSync(Buffer.from(await part.arrayBuffer())).toString('utf8'))).toEqual(ev)
  })

  it('is a no-op when there is no replay (nothing added, other fields untouched)', async () => {
    const form = buildFeedbackFormData({ ...base })
    await gzipReplayField(form)
    expect(form.get('replay_events')).toBeNull()
    expect(form.get('replay_events_gz')).toBeNull()
    expect(form.get('description')).toBe('d')
  })

  it('keeps the plain field when the gzip would not be smaller (tiny buffer)', async () => {
    const form = buildFeedbackFormData({ ...base, replayEvents: [{ type: 2 }] })
    await gzipReplayField(form)
    expect(form.get('replay_events')).toBe('[{"type":2}]')
    expect(form.get('replay_events_gz')).toBeNull()
  })

  it('falls back to the plain field when CompressionStream is unavailable (old browsers)', async () => {
    const orig = (globalThis as any).CompressionStream
    ;(globalThis as any).CompressionStream = undefined
    try {
      const form = buildFeedbackFormData({ ...base, replayEvents: events(300) })
      await gzipReplayField(form)
      expect(form.get('replay_events_gz')).toBeNull()
      expect(typeof form.get('replay_events')).toBe('string')
    } finally { (globalThis as any).CompressionStream = orig }
  })

  it('never throws when compression fails — the plain field is left in place', async () => {
    const orig = (globalThis as any).CompressionStream
    ;(globalThis as any).CompressionStream = class { constructor() { throw new Error('boom') } }
    try {
      const form = buildFeedbackFormData({ ...base, replayEvents: events(300) })
      await expect(gzipReplayField(form)).resolves.toBeUndefined()
      expect(typeof form.get('replay_events')).toBe('string')
    } finally { (globalThis as any).CompressionStream = orig }
  })
})
