// KLA-505 — server-side live dictation (replaces the flaky Web Speech backend).
// Covers the pure engine-selection helper (pickDictationMode) + the LiveDictation MediaRecorder engine:
//   * segments the mic, POSTs each segment blob to the injected transcribe fn, appends returned text
//   * transcribe→null on the FIRST segment ⇒ onUnavailable (host falls back to Web Speech), NOT onStop
//   * a later-segment null is swallowed best-effort (session keeps going)
//   * getUserMedia denial ⇒ onError('not-allowed') + onStop, no half-open mic
//   * stop() ends the session and stops the mic tracks
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { LiveDictation, pickDictationMode } from '../src/voice-input'

// A MediaRecorder stand-in: start()/stop() flip state; stop() emits ONE data chunk then fires onstop,
// exactly like a real recorder producing a complete blob per segment.
class MockMediaRecorder {
  state = 'inactive'
  ondataavailable: any = null
  onstop: any = null
  stream: any
  opts: any
  static supported = ['audio/webm;codecs=opus', 'audio/webm']
  static isTypeSupported(m: string) { return MockMediaRecorder.supported.includes(m) }
  constructor(stream: any, opts?: any) { this.stream = stream; this.opts = opts }
  start() { this.state = 'recording' }
  stop() {
    if (this.state === 'inactive') return
    this.state = 'inactive'
    this.ondataavailable?.({ data: { size: 128 } })
    this.onstop?.()
  }
}

function makeStream() {
  const track = { stop: vi.fn() }
  return { getTracks: () => [track], _track: track }
}

function deps(over: Partial<any> = {}) {
  return {
    getUserMedia: vi.fn(async () => makeStream()),
    MediaRecorder: MockMediaRecorder,
    isTypeSupported: (m: string) => MockMediaRecorder.isTypeSupported(m),
    setTimeout: (cb: () => void, ms: number) => setTimeout(cb, ms),
    clearTimeout: (id: any) => clearTimeout(id),
    ...over,
  }
}

beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks() })

describe('pickDictationMode', () => {
  it('prefers the server endpoint when wired + MediaRecorder available', () => {
    expect(pickDictationMode({ hasEndpoint: true, mediaRecorderSupported: true, webSpeechSupported: true })).toBe('server')
    expect(pickDictationMode({ hasEndpoint: true, mediaRecorderSupported: true, webSpeechSupported: false })).toBe('server')
  })
  it('falls back to Web Speech when no endpoint (or MediaRecorder unsupported)', () => {
    expect(pickDictationMode({ hasEndpoint: false, mediaRecorderSupported: true, webSpeechSupported: true })).toBe('webspeech')
    expect(pickDictationMode({ hasEndpoint: true, mediaRecorderSupported: false, webSpeechSupported: true })).toBe('webspeech')
  })
  it('none when nothing is supported', () => {
    expect(pickDictationMode({ hasEndpoint: false, mediaRecorderSupported: false, webSpeechSupported: false })).toBe('none')
  })
})

describe('LiveDictation.isSupported', () => {
  it('true when getUserMedia + MediaRecorder are injected', () => {
    expect(LiveDictation.isSupported({ getUserMedia: (async () => {}) as any, MediaRecorder: MockMediaRecorder })).toBe(true)
  })
  it('false when MediaRecorder is absent', () => {
    expect(LiveDictation.isSupported({ getUserMedia: (async () => {}) as any, MediaRecorder: undefined })).toBe(false)
  })
})

describe('LiveDictation session', () => {
  it('POSTs each segment blob and appends the returned text', async () => {
    const transcribe = vi.fn(async (_blob: Blob) => ({ text: 'hello world' }))
    const got: string[] = []
    const d = new LiveDictation({ transcribe, deps: deps() })
    d.onTranscript = (t) => got.push(t)
    await d.start()
    // First segment fires at SEGMENT_MS.
    await vi.advanceTimersByTimeAsync(LiveDictation.SEGMENT_MS)
    expect(transcribe).toHaveBeenCalledTimes(1)
    expect(transcribe.mock.calls[0][0]).toBeInstanceOf(Blob)
    expect(got).toEqual(['hello world'])
    // A second segment starts automatically and transcribes again.
    await vi.advanceTimersByTimeAsync(LiveDictation.SEGMENT_MS)
    expect(transcribe).toHaveBeenCalledTimes(2)
    expect(got).toEqual(['hello world', 'hello world'])
    d.stop()
  })

  it('empty transcript text is not appended (no-speech), session continues', async () => {
    const transcribe = vi.fn(async () => ({ text: '   ' }))
    const got: string[] = []
    const d = new LiveDictation({ transcribe, deps: deps() })
    d.onTranscript = (t) => got.push(t)
    await d.start()
    await vi.advanceTimersByTimeAsync(LiveDictation.SEGMENT_MS)
    expect(transcribe).toHaveBeenCalledTimes(1)
    expect(got).toEqual([])
    d.stop()
  })

  it('endpoint unreachable on FIRST segment fires onUnavailable (not onStop) and stops the mic', async () => {
    const transcribe = vi.fn(async () => null) // endpoint down
    const stream = makeStream()
    const unavailable = vi.fn()
    const stops = vi.fn()
    const d = new LiveDictation({ transcribe, deps: deps({ getUserMedia: vi.fn(async () => stream) }) })
    d.onUnavailable = unavailable
    d.onStop = stops
    await d.start()
    await vi.advanceTimersByTimeAsync(LiveDictation.SEGMENT_MS)
    expect(transcribe).toHaveBeenCalledTimes(1)
    expect(unavailable).toHaveBeenCalledTimes(1)
    expect(stops).not.toHaveBeenCalled()   // handed off to Web Speech, not a hard stop
    expect(stream._track.stop).toHaveBeenCalled() // mic released
  })

  it('a LATER-segment null is swallowed best-effort (session keeps going)', async () => {
    let n = 0
    const transcribe = vi.fn(async () => (++n === 1 ? { text: 'first' } : null))
    const got: string[] = []
    const statuses: any[] = []
    const unavailable = vi.fn()
    const d = new LiveDictation({ transcribe, deps: deps() })
    d.onTranscript = (t) => got.push(t)
    d.onStatus = (type, m) => statuses.push({ type, m })
    d.onUnavailable = unavailable
    await d.start()
    await vi.advanceTimersByTimeAsync(LiveDictation.SEGMENT_MS) // seg1 → 'first'
    await vi.advanceTimersByTimeAsync(LiveDictation.SEGMENT_MS) // seg2 → null (swallowed)
    expect(got).toEqual(['first'])
    expect(unavailable).not.toHaveBeenCalled() // only a first-segment null triggers fallback
    d.stop()
  })

  it('getUserMedia denial → onError(not-allowed) + onStop, never records', async () => {
    const err: any = new Error('denied'); err.name = 'NotAllowedError'
    const transcribe = vi.fn(async () => ({ text: 'x' }))
    const errors: any[] = []
    const stops = vi.fn()
    const d = new LiveDictation({ transcribe, deps: deps({ getUserMedia: vi.fn(async () => { throw err }) }) })
    d.onError = (type, m) => errors.push({ type, m })
    d.onStop = stops
    await d.start()
    expect(errors).toEqual([{ type: 'not-allowed', m: 'Microphone access was denied' }])
    expect(stops).toHaveBeenCalledTimes(1)
    expect(transcribe).not.toHaveBeenCalled()
  })

  it('stop() DURING the getUserMedia permission prompt releases the late-granted mic (no zombie stream)', async () => {
    // Regression (founder P1): getUserMedia is async — it shows the mic-permission prompt. If the reporter
    // presses Stop while that prompt is still open, start() must NOT proceed to open a recorder once the
    // grant lands late; it must release the just-granted stream. Previously the stream leaked (a live mic +
    // a running session timer) and no transcript ever surfaced — read by the user as "nothing worked".
    vi.useRealTimers()
    const track = { stop: vi.fn() }
    let resolveGUM: (v: any) => void = () => {}
    const gum = new Promise<any>(r => { resolveGUM = r })
    const d = new LiveDictation({ transcribe: vi.fn(async () => ({ text: 'x' })), deps: deps({ getUserMedia: vi.fn(() => gum) }) })
    const startP = d.start()          // awaiting the (still-pending) permission prompt
    d.stop()                          // user taps Stop before granting
    resolveGUM({ getTracks: () => [track] }) // permission granted late
    await startP
    await new Promise(r => setTimeout(r, 0))
    expect(track.stop).toHaveBeenCalled() // the late-granted mic was released, not leaked
    vi.useFakeTimers()
  })

  it('stop() transcribes the final segment then ends and releases the mic', async () => {
    const transcribe = vi.fn(async () => ({ text: 'bye' }))
    const stream = makeStream()
    const got: string[] = []
    const stops = vi.fn()
    const d = new LiveDictation({ transcribe, deps: deps({ getUserMedia: vi.fn(async () => stream) }) })
    d.onTranscript = (t) => got.push(t)
    d.onStop = stops
    await d.start()
    d.stop()                 // stops the active recorder → flush final segment
    await vi.advanceTimersByTimeAsync(0)
    expect(got).toEqual(['bye'])
    expect(stops).toHaveBeenCalledTimes(1)
    expect(stream._track.stop).toHaveBeenCalled()
  })
})
