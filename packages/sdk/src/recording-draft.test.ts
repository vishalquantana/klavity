// @vitest-environment node
// (node env: fake-indexeddb structured-clones the real Node Blob; jsdom's Blob is not cloneable by it. Browsers store Blobs natively.)
// KD-163: a recording survives a full page navigation because chunks are persisted as they arrive.
import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import {
  startDraft, appendDraftChunk, clearDraft, loadDraft, createDraftWriter,
  RECORDING_DRAFT_TTL_MS, type RecordingDraftMeta,
} from './recording-draft'

const meta = (over: Partial<RecordingDraftMeta> = {}): RecordingDraftMeta => ({
  id: 'rec_1', projectId: 'p1', origin: 'http://a.test', pageUrl: 'http://a.test/x', mime: 'video/webm;codecs=vp9,opus',
  startedAt: Date.now(), updatedAt: Date.now(), elapsedMs: 0, width: 1280, height: 720, screenOnly: true, hadCamera: false, hadAudio: false,
  ...over,
})
const chunk = (s: string) => new Blob([s], { type: 'video/webm' })
const text = (b: Blob) => b.text()

beforeEach(async () => { await clearDraft() })

describe('recording-draft', () => {
  it('returns null when nothing was recorded', async () => {
    expect(await loadDraft('p1')).toBeNull()
  })

  it('recovers chunks in order as one webm blob with the elapsed time', async () => {
    await startDraft(meta())
    await appendDraftChunk(0, chunk('AA'), 1000)
    await appendDraftChunk(1, chunk('BB'), 2000)
    await appendDraftChunk(2, chunk('CC'), 3100)
    const got = await loadDraft('p1')
    expect(got).not.toBeNull()
    expect(await text(got!.blob)).toBe('AABBCC')
    expect(got!.blob.type).toBe('video/webm')
    expect(got!.meta.elapsedMs).toBe(3100)
    expect(got!.meta.id).toBe('rec_1')
  })

  it('orders numerically (chunk 10 after chunk 2, not lexicographically)', async () => {
    await startDraft(meta())
    for (let i = 0; i < 12; i++) await appendDraftChunk(i, chunk(String.fromCharCode(65 + i)), (i + 1) * 1000)
    expect(await text((await loadDraft('p1'))!.blob)).toBe('ABCDEFGHIJKL')
  })

  it('startDraft replaces the previous draft (single slot)', async () => {
    await startDraft(meta({ id: 'old' }))
    await appendDraftChunk(0, chunk('OLD'), 5000)
    await startDraft(meta({ id: 'new' }))
    await appendDraftChunk(0, chunk('NEW'), 2000)
    const got = await loadDraft('p1')
    expect(got!.meta.id).toBe('new')
    expect(await text(got!.blob)).toBe('NEW')
  })

  it('a draft for another project is left alone and not offered', async () => {
    await startDraft(meta({ projectId: 'other' }))
    await appendDraftChunk(0, chunk('X'), 4000)
    expect(await loadDraft('p1')).toBeNull()
    expect(await loadDraft('other')).not.toBeNull()
  })

  it('drops (and deletes) a stale draft', async () => {
    await startDraft(meta())
    await appendDraftChunk(0, chunk('X'), 4000)
    expect(await loadDraft('p1', { now: Date.now() + RECORDING_DRAFT_TTL_MS + 60_000 })).toBeNull()
    expect(await loadDraft('p1')).toBeNull() // really cleared
  })

  it('drops a blip shorter than the minimum', async () => {
    await startDraft(meta())
    await appendDraftChunk(0, chunk('X'), 300)
    expect(await loadDraft('p1')).toBeNull()
  })

  it('clearDraft removes everything', async () => {
    await startDraft(meta())
    await appendDraftChunk(0, chunk('X'), 4000)
    await clearDraft()
    expect(await loadDraft('p1')).toBeNull()
  })
})

describe('createDraftWriter', () => {
  const settle = () => new Promise((r) => setTimeout(r, 50))

  it('start + chunk + chunk is recoverable, in order', async () => {
    const w = createDraftWriter({ projectId: 'p1', origin: 'http://a.test', pageUrl: 'http://a.test/x' })
    w.start({ id: 'rec_w', mime: 'video/webm', width: 10, height: 10, screenOnly: true, hadCamera: false, hadAudio: true })
    w.chunk(chunk('1'), 1000)
    w.chunk(chunk('2'), 2000)
    w.chunk(chunk('3'), 3000)
    await settle()
    const got = await loadDraft('p1')
    expect(await text(got!.blob)).toBe('123')
    expect(got!.meta.hadAudio).toBe(true)
    expect(got!.meta.pageUrl).toBe('http://a.test/x')
  })

  it('clear() after chunks leaves nothing behind (a normal finish)', async () => {
    const w = createDraftWriter({ projectId: 'p1', origin: 'o', pageUrl: 'u' })
    w.start({ id: 'r', mime: 'video/webm', width: 1, height: 1, screenOnly: true, hadCamera: false, hadAudio: false })
    w.chunk(chunk('1'), 5000)
    w.clear()
    await settle()
    expect(await loadDraft('p1')).toBeNull()
  })
})
