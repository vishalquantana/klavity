// Large-file attachments (client): split rules, chunked upload with retries, missing-chunk repair, failures surface.
import { describe, it, expect } from 'vitest'
import {
  needsLargeUpload, splitForLargeUpload, uploadLargeFile, offloadLargeFiles, LargeUploadError,
  INLINE_VIDEO_MAX_BYTES, INLINE_FILE_MAX_BYTES, type LargeUploadTransport, type LargeUploadRequest,
} from '../src/large-upload'
import { buildFeedbackFormData } from '../src/integrations/backend'

const MB = 1024 * 1024
const noSleep = async () => {}

describe('which files go through the chunked path', () => {
  it('mirrors the server caps: videos inline up to 100 MB, other files up to 8 MB', () => {
    expect(needsLargeUpload({ size: INLINE_VIDEO_MAX_BYTES, type: 'video/mp4', name: 'a.mp4' })).toBe(false)
    expect(needsLargeUpload({ size: INLINE_VIDEO_MAX_BYTES + 1, type: 'video/mp4', name: 'a.mp4' })).toBe(true)
    expect(needsLargeUpload({ size: INLINE_FILE_MAX_BYTES, type: 'application/pdf', name: 'a.pdf' })).toBe(false)
    expect(needsLargeUpload({ size: INLINE_FILE_MAX_BYTES + 1, type: 'application/pdf', name: 'a.pdf' })).toBe(true)
    // empty type + video extension → video (like the server); a non-generic non-video type never is
    expect(needsLargeUpload({ size: 50 * MB, type: '', name: 'clip.mov' })).toBe(false)
    expect(needsLargeUpload({ size: 50 * MB, type: 'text/plain', name: 'clip.mov' })).toBe(true)
  })
  it('keeps the inline request under the total cap by moving the largest files out', () => {
    const files = [{ size: 90 * MB, type: 'video/mp4', name: 'a.mp4' }, { size: 60 * MB, type: 'video/mp4', name: 'b.mp4' }, { size: 1 * MB, type: 'text/plain', name: 'c.txt' }]
    const { inline, large } = splitForLargeUpload(files)
    expect(large.map((f) => f.name)).toEqual(['a.mp4'])
    expect(inline.map((f) => f.name)).toEqual(['b.mp4', 'c.txt'])
  })
})

// A fake server: chunk size 4 bytes, records every call, with optional injected failures.
function fakeServer(opts: { failChunkOnce?: number; missingOnce?: number[]; startStatus?: number } = {}) {
  const calls: LargeUploadRequest[] = []
  const stored = new Map<number, Uint8Array>()
  let failed = false, reportedMissing = false
  const send: LargeUploadTransport = async (req) => {
    calls.push(req)
    if (req.path === '/api/uploads/start') {
      if (opts.startStatus) return { status: opts.startStatus, text: JSON.stringify({ error: 'nope' }) }
      const size = (req.json as any).size
      return { status: 200, text: JSON.stringify({ token: 'T', chunk_bytes: 4, chunks: Math.ceil(size / 4) }) }
    }
    if (req.path === '/api/uploads/chunk') {
      const n = Number(req.query!.n)
      if (opts.failChunkOnce === n && !failed) { failed = true; throw new Error('network down') }
      stored.set(n, req.bytes!)
      return { status: 200, text: '{"ok":true}' }
    }
    if (opts.missingOnce && !reportedMissing) {
      reportedMissing = true
      for (const n of opts.missingOnce) stored.delete(n)
      return { status: 409, text: JSON.stringify({ missing: opts.missingOnce }) }
    }
    return { status: 200, text: '   ' + JSON.stringify({ ref: 'REF-1' }) } // leading keep-alive spaces
  }
  return { send, calls, stored }
}

const fileOf = (s: string, type = 'application/zip', name = 'big.zip') => ({ name, type, size: s.length, blob: new Blob([s], { type }) })

describe('uploadLargeFile', () => {
  it('sends every chunk in order and returns the ref (whitespace-padded answer is fine)', async () => {
    const srv = fakeServer()
    const progress: number[] = []
    const ref = await uploadLargeFile(srv.send, fileOf('abcdefghij'), { projectId: 'p1', sleep: noSleep, onProgress: (s) => progress.push(s) })
    expect(ref).toBe('REF-1')
    expect(new TextDecoder().decode(new Uint8Array([...srv.stored.get(0)!, ...srv.stored.get(1)!, ...srv.stored.get(2)!]))).toBe('abcdefghij')
    expect(progress).toEqual([4, 8, 10])
    expect((srv.calls[0].json as any)).toMatchObject({ project_id: 'p1', filename: 'big.zip', size: 10 })
  })
  it('retries a chunk after a network error', async () => {
    const srv = fakeServer({ failChunkOnce: 1 })
    expect(await uploadLargeFile(srv.send, fileOf('abcdefghij'), { sleep: noSleep })).toBe('REF-1')
    expect(srv.calls.filter((c) => c.path === '/api/uploads/chunk' && c.query!.n === '1').length).toBe(2)
  })
  it('re-sends exactly the chunks the server says are missing', async () => {
    const srv = fakeServer({ missingOnce: [2] })
    expect(await uploadLargeFile(srv.send, fileOf('abcdefghij'), { sleep: noSleep })).toBe('REF-1')
    expect(srv.stored.get(2) && new TextDecoder().decode(srv.stored.get(2))).toBe('ij')
  })
  it('a refused start fails loudly (never a silent drop)', async () => {
    const srv = fakeServer({ startStatus: 400 })
    await expect(uploadLargeFile(srv.send, fileOf('abc'), { sleep: noSleep })).rejects.toBeInstanceOf(LargeUploadError)
  })
  it('gives up with a clear error after repeated network failures', async () => {
    const send: LargeUploadTransport = async () => { throw new Error('offline') }
    await expect(uploadLargeFile(send, fileOf('abc'), { sleep: noSleep })).rejects.toThrow(/Couldn't upload "big.zip"/)
  })
})

describe('offloadLargeFiles + form', () => {
  it('uploads only oversized files; small ones stay inline; refs go to file_refs', async () => {
    const srv = fakeServer()
    const big = { name: 'huge.zip', type: 'application/zip', size: INLINE_FILE_MAX_BYTES + 1, dataUrl: '', blob: new Blob([new Uint8Array(INLINE_FILE_MAX_BYTES + 1)]) }
    const small = { name: 'a.txt', type: 'text/plain', size: 3, dataUrl: 'data:text/plain;base64,YWJj' }
    // Speed: a large chunk size in this fake so the 8 MB file is a few calls.
    const fast: LargeUploadTransport = async (req) => req.path === '/api/uploads/start'
      ? { status: 200, text: JSON.stringify({ token: 'T', chunk_bytes: 4 * MB, chunks: Math.ceil((req.json as any).size / (4 * MB)) }) }
      : srv.send(req)
    const r = await offloadLargeFiles([small, big], fast, { sleep: noSleep })
    expect(r.inline).toEqual([small])
    expect(r.refs).toEqual(['REF-1'])
    const fd = buildFeedbackFormData({ description: 'x', pageUrl: 'https://e.test', files: r.inline, fileRefs: r.refs })
    expect(fd.getAll('files').length).toBe(1)
    expect(JSON.parse(String(fd.get('file_refs')))).toEqual(['REF-1'])
  })
  it('no large files → no network calls and the list is unchanged', async () => {
    const send: LargeUploadTransport = async () => { throw new Error('should not be called') }
    const small = { name: 'a.txt', type: 'text/plain', size: 3, dataUrl: 'data:text/plain;base64,YWJj' }
    expect(await offloadLargeFiles([small], send)).toEqual({ inline: [small], refs: [] })
    expect(await offloadLargeFiles(undefined, send)).toEqual({ inline: [], refs: [] })
  })
})
