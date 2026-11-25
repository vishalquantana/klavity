// @vitest-environment jsdom
import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRecordBackup, contiguousUpTo, type RecordBackup } from './record-backup'
import { createRecordBridge, type RecordBridge } from './record-bridge'

// "Record me" backup: the recorder window streams ~1s pieces to the reporter's tab so closing that window by
// mistake keeps everything recorded up to that point (instead of discarding it).
const BACKEND = 'https://klavity.example'
const msg = (data: any, origin = BACKEND) => window.dispatchEvent(new MessageEvent('message', { data, origin }))
const flush = () => new Promise((r) => setTimeout(r, 30))
const sessionOf = (win: any) => new URL(win.url).searchParams.get('session')!
const piece = (s: string) => new Blob([s], { type: 'video/webm' })
const meta = (session: string, over: Partial<Parameters<RecordBackup['putMeta']>[0]> = {}) => ({
  session, projectId: 'p1', mime: 'video/webm', elapsedMs: 3000, width: 0, height: 0, screenOnly: true,
  startedAt: Date.now() - 10_000, updatedAt: Date.now(), ...over,
})

describe('contiguousUpTo', () => {
  it('stops at the first gap', () => {
    expect(contiguousUpTo([])).toBe(-1)
    expect(contiguousUpTo([0, 1, 2])).toBe(2)
    expect(contiguousUpTo([0, 1, 3, 4])).toBe(1)
    expect(contiguousUpTo([1, 2])).toBe(-1)
  })
})

describe('record-backup (IndexedDB)', () => {
  it('stores pieces + meta, returns only the contiguous run, and clears a session', async () => {
    const b = createRecordBackup(indexedDB)
    await b.putChunk('s1', 0, piece('a'))
    await b.putChunk('s1', 1, piece('b'))
    await b.putChunk('s1', 3, piece('d'))
    await b.putChunk('s2', 0, piece('z'))
    await b.putMeta(meta('s1'))
    expect(await b.seqs('s1')).toEqual([0, 1, 3])
    const parts = await b.contiguousChunks('s1')
    expect(await new Blob(parts).text()).toBe('ab')
    expect((await b.getMeta('s1'))!.projectId).toBe('p1')
    await b.clear('s1')
    expect(await b.seqs('s1')).toEqual([])
    expect(await b.getMeta('s1')).toBeNull()
    expect(await b.seqs('s2')).toEqual([0]) // other sessions untouched
  })

  it('falls back to memory when IndexedDB is unavailable', async () => {
    const b = createRecordBackup(null)
    await b.putChunk('s', 0, piece('x'))
    expect(await b.seqs('s')).toEqual([0])
  })
})

describe('record-bridge recovery', () => {
  let bridge: RecordBridge | null = null
  let fakeWin: any
  let backup: RecordBackup
  beforeEach(() => {
    sessionStorage.clear()
    backup = createRecordBackup(null)
    fakeWin = { closed: false, postMessage: vi.fn(), url: '' }
    vi.spyOn(window, 'open').mockImplementation(((url: string) => { fakeWin.url = url; return fakeWin }) as any)
  })
  afterEach(() => { bridge?.dispose(); bridge = null; vi.restoreAllMocks(); vi.useRealTimers(); document.body.innerHTML = '' })

  const startRecording = async (notify = vi.fn()) => {
    bridge = createRecordBridge({ backendUrl: BACKEND, projectId: 'p1', onRecordingArrived: vi.fn(), notify, backup })
    const p = bridge.start()!
    const session = sessionOf(fakeWin)
    msg({ type: 'klavity-rec', session, kind: 'state', state: 'recording', elapsedMs: 2500, mime: 'video/webm', screenOnly: true })
    msg({ type: 'klavity-rec', session, kind: 'chunk', seq: 0, blob: piece('A') })
    msg({ type: 'klavity-rec', session, kind: 'chunk', seq: 1, blob: piece('B') })
    msg({ type: 'klavity-rec', session, kind: 'chunk', seq: 2, blob: piece('C') })
    await flush()
    return { p, session, notify }
  }

  it('backs up each piece and acks the highest contiguous one to the recorder window', async () => {
    const { session } = await startRecording()
    expect(await backup.seqs(session)).toEqual([0, 1, 2])
    expect(fakeWin.postMessage).toHaveBeenCalledWith({ type: 'klavity-rec-cmd', session, cmd: 'chunk-ack', seq: 2 }, BACKEND)
  })

  it('window closed mid-recording → the composer still gets the video up to that point', async () => {
    const { p, session, notify } = await startRecording()
    msg({ type: 'klavity-rec', session, kind: 'closed', elapsedMs: 3000 })
    const rec = await p
    expect(rec).not.toBeNull()
    expect(await rec!.blob!.text()).toContain('ABC')
    expect(rec!.durationMs).toBe(3000)
    expect(notify).toHaveBeenCalledWith(expect.stringContaining('was saved and attached'))
    expect(await backup.seqs(session)).toEqual([]) // backup cleared after recovery
    expect(bridge!.active()).toBe(false)
  })

  it('window.closed detected by the poll (no "closed" message) also recovers instead of discarding', async () => {
    const { p } = await startRecording()
    fakeWin.closed = true
    const rec = await p
    expect(rec).not.toBeNull()
    expect(await rec!.blob!.text()).toContain('ABC')
  })

  it('closed during consent (nothing recorded) is still a plain cancel', async () => {
    bridge = createRecordBridge({ backendUrl: BACKEND, projectId: 'p1', onRecordingArrived: vi.fn(), backup })
    const p = bridge.start()!
    fakeWin.closed = true
    expect(await p).toBeNull()
  })

  it('after a navigation, a lost heartbeat rebuilds the video from the backup and hands it to onRecordingArrived', async () => {
    // Page 1 backed up two pieces, then the tab navigated.
    await backup.putChunk('rw_prev', 0, piece('A'))
    await backup.putChunk('rw_prev', 1, piece('B'))
    await backup.putMeta(meta('rw_prev', { elapsedMs: 2000 }))
    sessionStorage.setItem('klavity_rec_window', JSON.stringify({ session: 'rw_prev', projectId: 'p1', startedAt: Date.now() - 5000 }))
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
    const onRecordingArrived = vi.fn()
    bridge = createRecordBridge({ backendUrl: BACKEND, projectId: 'p1', onRecordingArrived, backup })
    vi.advanceTimersByTime(8000) // no heartbeat from the (closed) window
    vi.useRealTimers()
    await vi.waitFor(() => expect(onRecordingArrived).toHaveBeenCalledTimes(1))
    const rec = onRecordingArrived.mock.calls[0][0]
    expect(await rec.blob.text()).toContain('AB')
    expect(rec.durationMs).toBe(2000)
  })

  it('a normal Stop clears the backup', async () => {
    const { p, session } = await startRecording()
    msg({ type: 'klavity-rec', session, kind: 'done', recording: { id: 'rec_ok', blob: piece('ABC'), mime: 'video/webm', durationMs: 3000, bytes: 3, width: 1, height: 1, screenOnly: true } })
    expect((await p)!.id).toBe('rec_ok')
    await flush()
    expect(await backup.seqs(session)).toEqual([])
  })

  it('recovers an orphan from a closed tab on the next page load, without touching a live session', async () => {
    await backup.putChunk('rw_orphan', 0, piece('O'))
    await backup.putMeta(meta('rw_orphan', { updatedAt: Date.now() - 60_000 }))
    await backup.putChunk('rw_other_tab', 0, piece('L'))
    await backup.putMeta(meta('rw_other_tab', { updatedAt: Date.now() })) // still recording elsewhere
    await backup.putMeta(meta('rw_other_project', { projectId: 'p2', updatedAt: Date.now() - 60_000 }))
    const onRecordingArrived = vi.fn()
    bridge = createRecordBridge({ backendUrl: BACKEND, projectId: 'p1', onRecordingArrived, backup })
    await vi.waitFor(() => expect(onRecordingArrived).toHaveBeenCalledTimes(1))
    expect(onRecordingArrived.mock.calls[0][0].id).toBe('rec_rw_orphan')
    expect(await backup.seqs('rw_other_tab')).toEqual([0])
    expect(await backup.getMeta('rw_other_project')).not.toBeNull()
  })
})

describe('recorderWindowFeatures', () => {
  it('centres the recorder window inside the reporter\'s browser window so the app can cover it', async () => {
    const { recorderWindowFeatures } = await import('./record-bridge')
    expect(recorderWindowFeatures({ screenX: 100, screenY: 50, outerWidth: 1400, outerHeight: 900 }))
      .toBe('popup,width=400,height=560,left=600,top=220')
    // A window smaller than the recorder → align to its top-left, never off to the negative side.
    expect(recorderWindowFeatures({ screenX: 10, screenY: 20, outerWidth: 300, outerHeight: 300 }))
      .toBe('popup,width=400,height=560,left=10,top=20')
  })
})
