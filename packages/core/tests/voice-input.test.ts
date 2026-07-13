import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VoiceInput } from '../src/voice-input'

class MockSpeechRecognition {
  continuous = false
  interimResults = false
  lang = ''
  onresult = null
  onerror = null
  onend = null
  start = vi.fn()
  stop = vi.fn()
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
  it('configures continuous=true, interimResults=false', () => {
    const v = new VoiceInput(); v.start()
    expect(mockSR.continuous).toBe(true)
    expect(mockSR.interimResults).toBe(false)
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

describe('VoiceInput errors', () => {
  it('onError message for not-allowed + calls onStop', () => {
    const v = new VoiceInput(); const errors = []; const stops = []
    v.onError = (type, msg) => errors.push({ type, msg }); v.onStop = () => stops.push(1); v.start()
    mockSR._fireError('not-allowed')
    expect(errors).toEqual([{ type: 'not-allowed', msg: 'Microphone access was denied' }])
    expect(stops).toHaveLength(1)
  })
  it('onError message for network', () => {
    const v = new VoiceInput(); const errors = []
    v.onError = (type, msg) => errors.push({ type, msg }); v.onStop = () => {}; v.start()
    mockSR._fireError('network')
    expect(errors).toEqual([{ type: 'network', msg: 'Voice recognition lost connection' }])
  })
  it('no-speech: silent stop, no onError', () => {
    const v = new VoiceInput(); const errors = []; const stops = []
    v.onError = (_, msg) => errors.push(msg); v.onStop = () => stops.push(1); v.start()
    mockSR._fireError('no-speech')
    expect(errors).toHaveLength(0); expect(stops).toHaveLength(1)
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
  it('fires onStop when onend fires unexpectedly', () => {
    const v = new VoiceInput(); const stops = []; v.onStop = () => stops.push(1); v.start()
    mockSR._fireEnd(); expect(stops).toHaveLength(1)
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
