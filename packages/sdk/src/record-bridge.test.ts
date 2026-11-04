// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createRecordBridge, type RecordBridge } from './record-bridge'

// "Record me" across navigation — the host side of the recorder-window protocol. The real cross-window flow
// (popup + full page loads) is browser-verified; these lock the protocol rules the widget depends on.
const BACKEND = 'https://klavity.example'

function msg(data: any, origin = BACKEND) {
  window.dispatchEvent(new MessageEvent('message', { data, origin }))
}
const flush = () => new Promise((r) => setTimeout(r, 20))
const bar = () => document.querySelector('[data-klavity-ui="recorder-bar"]') as HTMLElement | null
const sessionOf = (win: any) => new URL(win.url).searchParams.get('session')!

describe('record-bridge', () => {
  let bridge: RecordBridge | null = null
  let fakeWin: any
  beforeEach(() => {
    sessionStorage.clear()
    fakeWin = { closed: false, postMessage: vi.fn(), url: '' }
    vi.spyOn(window, 'open').mockImplementation(((url: string) => { fakeWin.url = url; return fakeWin }) as any)
  })
  afterEach(() => { bridge?.dispose(); bridge = null; vi.restoreAllMocks(); document.body.innerHTML = '' })

  it('returns null when the popup is blocked, so the caller falls back to the in-page recorder', () => {
    ;(window.open as any).mockImplementation(() => null)
    bridge = createRecordBridge({ backendUrl: BACKEND, projectId: 'p1', onRecordingArrived: vi.fn() })
    expect(bridge.start()).toBeNull()
    expect(sessionStorage.getItem('klavity_rec_window')).toBeNull()
  })

  it('opens the recorder window with session + host origin and remembers the session for the next page', () => {
    bridge = createRecordBridge({ backendUrl: BACKEND, projectId: 'p1', onRecordingArrived: vi.fn() })
    expect(bridge.start()).toBeInstanceOf(Promise)
    const u = new URL(fakeWin.url)
    expect(u.origin + u.pathname).toBe(BACKEND + '/recorder-window')
    expect(u.searchParams.get('origin')).toBe(location.origin)
    expect(JSON.parse(sessionStorage.getItem('klavity_rec_window')!).session).toBe(sessionOf(fakeWin))
  })

  it('ignores messages from other origins or other sessions', async () => {
    const onPhase = vi.fn()
    bridge = createRecordBridge({ backendUrl: BACKEND, projectId: 'p1', onRecordingArrived: vi.fn() })
    bridge.start(onPhase)
    const session = sessionOf(fakeWin)
    msg({ type: 'klavity-rec', session, kind: 'state', state: 'recording', elapsedMs: 1000 }, 'https://evil.example')
    msg({ type: 'klavity-rec', session: 'other', kind: 'state', state: 'recording', elapsedMs: 1000 })
    await flush()
    expect(bar()).toBeNull()
    expect(onPhase).not.toHaveBeenCalledWith('recording')
  })

  it('shows the REC bar on heartbeat, and Stop sends the stop command to the recorder window', async () => {
    const onPhase = vi.fn()
    bridge = createRecordBridge({ backendUrl: BACKEND, projectId: 'p1', onRecordingArrived: vi.fn() })
    bridge.start(onPhase)
    const session = sessionOf(fakeWin)
    msg({ type: 'klavity-rec', session, kind: 'state', state: 'recording', elapsedMs: 65000, maxMs: 180000 })
    await flush()
    expect(onPhase).toHaveBeenCalledWith('recording')
    expect(bar()!.shadowRoot!.getElementById('timer')!.textContent).toBe('REC 1:05')
    ;(bar()!.shadowRoot!.getElementById('stop') as HTMLButtonElement).click()
    expect(fakeWin.postMessage).toHaveBeenCalledWith({ type: 'klavity-rec-cmd', session, cmd: 'stop' }, BACKEND)
  })

  it('a recording stopped on the SAME page resolves the waiting composer, acks once, and cleans up', async () => {
    const onRecordingArrived = vi.fn()
    bridge = createRecordBridge({ backendUrl: BACKEND, projectId: 'p1', onRecordingArrived })
    const p = bridge.start()!
    const session = sessionOf(fakeWin)
    const recording = { id: 'rec_1', blob: new Blob(['abc'], { type: 'video/webm' }), mime: 'video/webm', durationMs: 4200, bytes: 3, width: 1280, height: 720, screenOnly: true }
    msg({ type: 'klavity-rec', session, kind: 'done', recording })
    msg({ type: 'klavity-rec', session, kind: 'done', recording }) // window repeats until acked
    const rec = await p
    expect(rec).toMatchObject({ id: 'rec_1', mime: 'video/webm', durationMs: 4200, bytes: 3 })
    expect(rec!.dataUrl.startsWith('data:video/webm')).toBe(true)
    expect(onRecordingArrived).not.toHaveBeenCalled()
    expect(fakeWin.postMessage).toHaveBeenCalledWith({ type: 'klavity-rec-cmd', session, cmd: 'ack' }, BACKEND)
    expect(sessionStorage.getItem('klavity_rec_window')).toBeNull()
    expect(bar()).toBeNull()
  })

  it('after a navigation, the next page picks the session up and hands the finished video to onRecordingArrived', async () => {
    sessionStorage.setItem('klavity_rec_window', JSON.stringify({ session: 'rw_prev', projectId: 'p1', startedAt: Date.now() - 5000 }))
    const onRecordingArrived = vi.fn()
    bridge = createRecordBridge({ backendUrl: BACKEND, projectId: 'p1', onRecordingArrived })
    expect(bridge.active()).toBe(true)
    expect(bar()).not.toBeNull() // bar is up immediately, before the first heartbeat
    msg({ type: 'klavity-rec', session: 'rw_prev', kind: 'done', recording: { id: 'rec_2', blob: new Blob(['x'], { type: 'video/webm' }), mime: 'video/webm', durationMs: 9000, bytes: 1, width: 1, height: 1, screenOnly: false } })
    await vi.waitFor(() => expect(onRecordingArrived).toHaveBeenCalledTimes(1))
    expect(onRecordingArrived.mock.calls[0][0]).toMatchObject({ id: 'rec_2', durationMs: 9000 })
    expect(bridge.active()).toBe(false)
  })

  it('a cancel from the recorder window resolves null', async () => {
    bridge = createRecordBridge({ backendUrl: BACKEND, projectId: 'p1', onRecordingArrived: vi.fn() })
    const p = bridge.start()!
    msg({ type: 'klavity-rec', session: sessionOf(fakeWin), kind: 'cancel' })
    expect(await p).toBeNull()
    expect(bridge.active()).toBe(false)
  })
})
