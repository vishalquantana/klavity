// Bug: a video attached via Attach vanished after Minimize (→ navigation/reload) → Resume. The composer keeps
// attached videos as a Blob (dataUrl ''), and setFiles stored only metadata + dataUrl, so the bytes were
// dropped. Files now keep their Blob in IndexedDB (like screenshots), with a quota fallback to metadata.
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { startOrContinue, setFiles, getActiveSession } from './evidence-session'

const ORIGIN = 'https://app.example.com', PROJECT = 'proj_files'
beforeEach(() => { ;(globalThis as any).indexedDB = new IDBFactory() })

describe('attached files survive minimize → reload → resume', () => {
  it('keeps an attached video Blob (and small dataUrl files) in the stored session', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    const video = new Blob([new Uint8Array(2048)], { type: 'video/mp4' })
    await setFiles(s.id, [
      { id: 'f1', name: 'bug.mp4', type: 'video/mp4', size: video.size, dataUrl: '', blob: video },
      { id: 'f2', name: 'log.txt', type: 'text/plain', size: 5, dataUrl: 'data:text/plain;base64,aGVsbG8=' },
    ])
    const back = await getActiveSession(PROJECT, ORIGIN)   // a fresh read = what a reloaded page sees
    const v = back!.files!.find(f => f.id === 'f1')!
    expect(v.dataUrl).toBe('')
    expect(v.blob).toBeTruthy()
    expect(v.blob!.size).toBe(2048)
    expect(v.blob!.type).toBe('video/mp4')
    expect(back!.files!.find(f => f.id === 'f2')).toMatchObject({ dataUrl: 'data:text/plain;base64,aGVsbG8=' })
    expect(back!.files!.find(f => f.id === 'f2')!.blob).toBeUndefined()
  })

  it('removing the video clears it from the session', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    await setFiles(s.id, [{ id: 'f1', name: 'bug.mp4', type: 'video/mp4', size: 3, dataUrl: '', blob: new Blob([new Uint8Array(3)]) }])
    await setFiles(s.id, [])
    expect((await getActiveSession(PROJECT, ORIGIN))!.files).toEqual([])
  })
})

import { setMulti } from './evidence-session'
describe('Report Multiple Issues analysis survives minimize → reload → resume', () => {
  it('stores and clears the multi-issue snapshot', async () => {
    const s = await startOrContinue(PROJECT, ORIGIN)
    const snap = { recordingId: 'rec_1', items: [{ id: 'mi_0', title: 'Heading wrong', selected: true }], original: null }
    await setMulti(s.id, snap)
    expect((await getActiveSession(PROJECT, ORIGIN))!.multi).toEqual(snap)
    await setMulti(s.id, null)
    expect((await getActiveSession(PROJECT, ORIGIN))!.multi).toBeNull()
  })
})
