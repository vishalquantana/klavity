// #647 — client-side LIVE STREAMING dictation (StreamingDictation). Driven with a FAKE WebSocket + a fake
// MediaRecorder so NO real socket / mic is used. Covers:
//   * interim frames → onInterim; final frames → onTranscript
//   * MediaRecorder audio (timeslice) is sent over the socket
//   * a connect that never yields a server message → onUnavailable (host falls back to batch)
//   * getUserMedia denial → onError('not-allowed') + onStop
//   * stop() sends a 'stop' control frame, closes the socket, releases the mic, fires onStop
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { StreamingDictation } from '../src/voice-input'

// A fake WebSocket: records sent frames, lets the test drive open/message/close.
class FakeWS {
  static instances: FakeWS[] = []
  url: string
  sent: any[] = []
  binaryType = ''
  readyState = 0
  onopen: any = null
  onmessage: any = null
  onclose: any = null
  onerror: any = null
  constructor(url: string) { this.url = url; FakeWS.instances.push(this) }
  send(d: any) { this.sent.push(d) }
  close() { this.readyState = 3; this.onclose?.() }
  // test drivers
  open() { this.readyState = 1; this.onopen?.() }
  emit(obj: any) { this.onmessage?.({ data: JSON.stringify(obj) }) }
}

// A MediaRecorder stand-in: start(timeslice) flips state; the test fires chunks manually via `emit`.
class FakeRecorder {
  state = 'inactive'
  ondataavailable: any = null
  onstop: any = null
  static isTypeSupported(m: string) { return m === 'audio/webm;codecs=opus' }
  constructor(public stream: any, public opts?: any) {}
  start(_timeslice?: number) { this.state = 'recording' }
  stop() { this.state = 'inactive'; this.onstop?.() }
  emit() { this.ondataavailable?.({ data: { size: 64 } }) }
}

function makeStream() {
  const track = { stop: vi.fn() }
  return { getTracks: () => [track], _track: track }
}

function deps(over: Partial<any> = {}) {
  return {
    getUserMedia: vi.fn(async () => makeStream()),
    MediaRecorder: FakeRecorder,
    isTypeSupported: (m: string) => FakeRecorder.isTypeSupported(m),
    WebSocket: FakeWS,
    setTimeout: (cb: () => void, ms: number) => setTimeout(cb, ms),
    clearTimeout: (id: any) => clearTimeout(id),
    ...over,
  }
}

beforeEach(() => { FakeWS.instances = []; vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

describe('StreamingDictation.isSupported', () => {
  it('true when WebSocket + MediaRecorder + getUserMedia are injected', () => {
    expect(StreamingDictation.isSupported({ getUserMedia: (async () => {}) as any, MediaRecorder: FakeRecorder, WebSocket: FakeWS })).toBe(true)
  })
  it('false when MediaRecorder is absent (jsdom provides a global WebSocket, not MediaRecorder)', () => {
    expect(StreamingDictation.isSupported({ getUserMedia: (async () => {}) as any, MediaRecorder: undefined, WebSocket: FakeWS })).toBe(false)
  })
})

describe('StreamingDictation session', () => {
  it('streams mic audio and maps interim→onInterim, final→onTranscript', async () => {
    const interims: string[] = []
    const finals: string[] = []
    const d = new StreamingDictation({ url: 'wss://x/api/voice/stream?project=p1', deps: deps() })
    d.onInterim = (t) => interims.push(t)
    d.onTranscript = (t) => finals.push(t)
    await d.start()
    const ws = FakeWS.instances[0]
    expect(ws.url).toContain('/api/voice/stream')
    ws.open()
    // The recorder is now recording; a chunk is sent over the socket as binary.
    const rec = (d as any)._recorder as FakeRecorder
    rec.emit()
    expect(ws.sent.some((s) => s && s.size === 64)).toBe(true)
    // Server frames drive the callbacks.
    ws.emit({ type: 'ready' })
    ws.emit({ type: 'interim', text: 'hel' })
    ws.emit({ type: 'interim', text: 'hello' })
    ws.emit({ type: 'final', text: 'hello world' })
    expect(interims).toEqual(['hel', 'hello'])
    expect(finals).toEqual(['hello world'])
    d.stop()
  })

  it('never-connecting socket → onUnavailable (fallback), not onStop', async () => {
    const unavailable = vi.fn()
    const stops = vi.fn()
    const d = new StreamingDictation({ url: 'wss://x/stream', deps: deps() })
    d.onUnavailable = unavailable
    d.onStop = stops
    await d.start()
    const ws = FakeWS.instances[0]
    ws.open() // socket opens but the server NEVER sends a message
    // Advance past the connect timeout → treated as unreachable.
    await vi.advanceTimersByTimeAsync(StreamingDictation.CONNECT_TIMEOUT_MS + 10)
    expect(unavailable).toHaveBeenCalledTimes(1)
    expect(stops).not.toHaveBeenCalled()
  })

  it('socket construction throwing → onUnavailable', async () => {
    const unavailable = vi.fn()
    const Throwing = class { constructor() { throw new Error('no ws') } }
    const d = new StreamingDictation({ url: 'wss://x/stream', deps: deps({ WebSocket: Throwing }) })
    d.onUnavailable = unavailable
    await d.start()
    expect(unavailable).toHaveBeenCalledTimes(1)
  })

  it('getUserMedia denial → onError(not-allowed) + onStop, opens no socket', async () => {
    const err: any = new Error('denied'); err.name = 'NotAllowedError'
    const errors: any[] = []
    const stops = vi.fn()
    const d = new StreamingDictation({ url: 'wss://x/stream', deps: deps({ getUserMedia: vi.fn(async () => { throw err }) }) })
    d.onError = (type, m) => errors.push({ type, m })
    d.onStop = stops
    await d.start()
    expect(errors).toEqual([{ type: 'not-allowed', m: 'Microphone access was denied' }])
    expect(stops).toHaveBeenCalledTimes(1)
    expect(FakeWS.instances.length).toBe(0)
  })

  it('stop() sends a stop control frame, closes the socket, releases the mic, fires onStop', async () => {
    const stream = makeStream()
    const stops = vi.fn()
    const d = new StreamingDictation({ url: 'wss://x/stream', deps: deps({ getUserMedia: vi.fn(async () => stream) }) })
    d.onStop = stops
    await d.start()
    const ws = FakeWS.instances[0]
    ws.open()
    ws.emit({ type: 'ready' })
    d.stop()
    expect(ws.sent).toContain(JSON.stringify({ type: 'stop' }))
    expect(ws.readyState).toBe(3) // closed
    expect(stream._track.stop).toHaveBeenCalled()
    expect(stops).toHaveBeenCalledTimes(1)
  })

  it('a mid-session drop after connecting reconnects (does not fire onUnavailable)', async () => {
    const unavailable = vi.fn()
    const d = new StreamingDictation({ url: 'wss://x/stream', deps: deps() })
    d.onUnavailable = unavailable
    await d.start()
    const ws1 = FakeWS.instances[0]
    ws1.open()
    ws1.emit({ type: 'ready' }) // healthy — connected at least once
    ws1.close()                 // upstream drops
    // Advance past the first backoff → a new socket is opened, no fallback.
    await vi.advanceTimersByTimeAsync(StreamingDictation.BASE_BACKOFF_MS + 10)
    expect(FakeWS.instances.length).toBe(2)
    expect(unavailable).not.toHaveBeenCalled()
    d.stop()
  })
})
