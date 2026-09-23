import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VoiceInput } from '../src/voice-input'

class MockSpeechRecognition {
  continuous = false
  interimResults = false
  lang = ''
  onstart = null
  onresult = null
  onerror = null
  onend = null
  start = vi.fn()
  stop = vi.fn()
  _fireStart() { this.onstart?.() }
  _fireResult(transcript, isFinal) {
    this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript }], { isFinal })] })
  }
  _fireError(error) { this.onerror?.({ error }) }
  _fireEnd() { this.onend?.() }
}

let mockSR

beforeEach(() => {
  mockSR = new MockSpeechRecognition()
  vi.stubGlobal('SpeechRecognition', vi.fn(() => mockSR))
  vi.stubGlobal('webkitSpeechRecognition', undefined)
})

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('VoiceInput.isSupported', () => {
  it('true when SpeechRecognition available', () => { expect(VoiceInput.isSupported()).toBe(true) })
  it('false when both absent', () => { vi.stubGlobal('SpeechRecognition', undefined); expect(VoiceInput.isSupported()).toBe(false) })
  it('true when only webkitSpeechRecognition available', () => {
    vi.stubGlobal('SpeechRecognition', undefined)
    vi.stubGlobal('webkitSpeechRecognition', vi.fn(() => mockSR))
    expect(VoiceInput.isSupported()).toBe(true)
  })
})

describe('VoiceInput.start', () => {
  // KD-164: interimResults is now true — "it should reflect while talking" — see onInterim tests below.
  it('configures continuous=true, interimResults=true', () => {
    const v = new VoiceInput(); v.start()
    expect(mockSR.continuous).toBe(true)
    expect(mockSR.interimResults).toBe(true)
    expect(mockSR.start).toHaveBeenCalledOnce()
  })
  it('no-op if already recording', () => { const v = new VoiceInput(); v.start(); v.start(); expect(mockSR.start).toHaveBeenCalledOnce() })
})

describe('VoiceInput onTranscript', () => {
  it('fires for isFinal=true', () => {
    const v = new VoiceInput(); const got = []; v.onTranscript = t => got.push(t); v.start()
    mockSR._fireResult('hello', true); expect(got).toEqual(['hello'])
  })
  it('does not fire for isFinal=false', () => {
    const v = new VoiceInput(); const got = []; v.onTranscript = t => got.push(t); v.start()
    mockSR._fireResult('partial', false); expect(got).toHaveLength(0)
  })
})

// KD-164: "it should reflect while talking" — the in-progress transcript now flows out live via onInterim,
// separately from onTranscript's completed-phrase-only contract (unchanged, still isFinal-gated above).
describe('VoiceInput onInterim', () => {
  it('fires with the in-progress transcript for isFinal=false', () => {
    const v = new VoiceInput(); const got = []; v.onInterim = t => got.push(t); v.start()
    mockSR._fireResult('partial', false); expect(got).toEqual(['partial'])
  })
  it('does NOT fire on an event that is entirely final (no phantom empty interim)', () => {
    const v = new VoiceInput(); const got = []; v.onInterim = t => got.push(t); v.start()
    mockSR._fireResult('hello', true); expect(got).toHaveLength(0)
  })
  it('does not fire onTranscript for an interim result', () => {
    const v = new VoiceInput(); const transcripts = []; const interims = []
    v.onTranscript = t => transcripts.push(t); v.onInterim = t => interims.push(t); v.start()
    mockSR._fireResult('partial', false)
    expect(transcripts).toHaveLength(0)
    expect(interims).toEqual(['partial'])
  })
})

describe('VoiceInput errors', () => {
  it('onError message for not-allowed + calls onStop', () => {
    const v = new VoiceInput(); const errors = []; const stops = []
    v.onError = (type, msg) => errors.push({ type, msg }); v.onStop = () => stops.push(1); v.start()
    mockSR._fireError('not-allowed')
    expect(errors).toEqual([{ type: 'not-allowed', msg: 'Microphone access was denied' }])
    expect(stops).toHaveLength(1)
  })
  it('KLA-590: first network drop auto-retries (soft status, no error)', () => {
    vi.useFakeTimers()
    const v = new VoiceInput(); const errors: any[] = []; const statuses: any[] = []
    v.onError = (type, msg) => errors.push({ type, msg })
    v.onStatus = (type, msg) => statuses.push({ type, msg })
    v.onStop = () => {}
    v.start()
    expect(mockSR.start).toHaveBeenCalledTimes(1)
    mockSR._fireError('network')       // transient blip
    expect(errors).toHaveLength(0)     // NOT surfaced as an error on the first drop
    expect(statuses).toEqual([{ type: 'retrying', msg: 'Reconnecting voice…' }])
    mockSR._fireEnd()                  // onend follows onerror → schedules a reconnect (400ms backoff)
    vi.advanceTimersByTime(400)
    expect(mockSR.start).toHaveBeenCalledTimes(2) // reconnected, still recording
  })

  it('KLA-590: a recovered reconnection clears the retry budget + status (no give-up)', () => {
    vi.useFakeTimers()
    const v = new VoiceInput(); const errors: any[] = []; const statuses: any[] = []
    v.onError = (type, msg) => errors.push({ type, msg })
    v.onStatus = (type, msg) => statuses.push({ type, msg })
    v.onStop = () => {}
    v.start()
    // A blip, then a healthy restart, repeated many more times than the old MAX_RETRIES=2 — must NEVER
    // surface "Voice disconnected" because each reconnection resets the consecutive-failure budget.
    for (let i = 0; i < 10; i++) {
      mockSR._fireError('network')
      mockSR._fireEnd()
      vi.advanceTimersByTime(400)
      mockSR._fireStart()              // backend reconnected → recovery
    }
    expect(errors).toHaveLength(0)
    expect(statuses.some(s => s.type === 'retrying')).toBe(true)
    expect(statuses[statuses.length - 1]).toEqual({ type: 'idle', msg: '' })
  })

  it('KLA-590: surfaces the terminal error only after a SUSTAINED run of consecutive failures', () => {
    vi.useFakeTimers()
    const v = new VoiceInput(); const errors: any[] = []
    v.onError = (type, msg) => errors.push({ type, msg }); v.onStatus = () => {}; v.onStop = () => {}
    v.start()
    // Fail every reconnect with NO recovery in between — exponential backoff, capped at MAX_BACKOFF_MS.
    // MAX_CONSEC_FAILURES=6 → the 7th consecutive failure's onend gives up.
    for (let i = 0; i < 6; i++) {
      mockSR._fireError('network')
      mockSR._fireEnd()
      vi.advanceTimersByTime(8000)     // advance past the largest backoff so the reconnect fires
    }
    expect(errors).toHaveLength(0)     // still trying across the whole window
    mockSR._fireError('network')       // 7th consecutive failure
    mockSR._fireEnd()
    expect(errors).toEqual([{ type: 'network', msg: 'Voice disconnected — tap Voice to try again' }])
  })

  it('KLA-590: no-speech auto-restarts through silence (no error, no stop)', () => {
    vi.useFakeTimers()
    const v = new VoiceInput(); const errors: any[] = []; const stops: any[] = []
    v.onError = (_, msg) => errors.push(msg); v.onStop = () => stops.push(1); v.start()
    expect(mockSR.start).toHaveBeenCalledTimes(1)
    mockSR._fireError('no-speech')     // a pause — NOT a failure
    mockSR._fireEnd()                  // Chrome ends recognition on the silence timeout
    expect(errors).toHaveLength(0)
    expect(stops).toHaveLength(0)      // session is NOT torn down
    vi.advanceTimersByTime(250)        // benign near-instant restart
    expect(mockSR.start).toHaveBeenCalledTimes(2) // still listening
  })

  it('KLA-590: not-allowed is terminal — surfaces immediately, no reconnect', () => {
    vi.useFakeTimers()
    const v = new VoiceInput(); const errors: any[] = []; const stops: any[] = []
    v.onError = (type, msg) => errors.push({ type, msg }); v.onStop = () => stops.push(1); v.start()
    mockSR._fireError('not-allowed')
    mockSR._fireEnd()
    expect(errors).toEqual([{ type: 'not-allowed', msg: 'Microphone access was denied' }])
    expect(stops).toHaveLength(1)
    vi.advanceTimersByTime(10000)
    expect(mockSR.start).toHaveBeenCalledTimes(1) // never reconnected after a terminal error
  })
})

describe('VoiceInput.stop', () => {
  it('calls recognition.stop() and onStop', () => {
    const v = new VoiceInput(); const stops = []; v.onStop = () => stops.push(1); v.start(); v.stop()
    expect(mockSR.stop).toHaveBeenCalledOnce(); expect(stops).toHaveLength(1)
  })
  it('no double-fire if stopped twice', () => {
    const v = new VoiceInput(); const stops = []; v.onStop = () => stops.push(1); v.start(); v.stop(); v.stop()
    expect(stops).toHaveLength(1)
  })
  it('KLA-590: an unexpected onend auto-restarts (does NOT fire onStop)', () => {
    vi.useFakeTimers()
    const v = new VoiceInput(); const stops = []; v.onStop = () => stops.push(1); v.start()
    expect(mockSR.start).toHaveBeenCalledTimes(1)
    mockSR._fireEnd()                 // Chrome auto-ended mid-session (≈60s cap / silence)
    expect(stops).toHaveLength(0)     // session survives
    vi.advanceTimersByTime(250)
    expect(mockSR.start).toHaveBeenCalledTimes(2) // relaunched, still listening
  })
})

describe('VoiceInput auto-stop', () => {
  it('fires onStop after 180000ms', () => {
    vi.useFakeTimers(); const v = new VoiceInput(); const stops = []; v.onStop = () => stops.push(1); v.start()
    expect(stops).toHaveLength(0); vi.advanceTimersByTime(180000); expect(stops).toHaveLength(1)
  })
  it('no auto-stop if manually stopped first', () => {
    vi.useFakeTimers(); const v = new VoiceInput(); const stops = []; v.onStop = () => stops.push(1); v.start(); v.stop()
    vi.advanceTimersByTime(180000); expect(stops).toHaveLength(1)
  })
})
