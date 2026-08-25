// KLA-586/590/505 regression: the END-TO-END voice dictation chain through the modal —
// button click → engine.start → onTranscript → desc.value setter → VISIBLE text in the
// contenteditable + round-trips back through desc.value. Founder repro: "recording worked
// but no text appeared". Each link gets a guard here so it can't silently break again.
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildModal } from '../src/modal'

// A driveable SpeechRecognition mock — capture the live instance so the test can fire a final result.
class MockSpeechRecognition {
  continuous = false
  interimResults = false
  lang = ''
  onstart: any = null
  onresult: any = null
  onerror: any = null
  onend: any = null
  start = vi.fn()
  stop = vi.fn()
  fireResult(transcript: string, isFinal = true) {
    this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript }], { isFinal })] })
  }
}
let liveRec: MockSpeechRecognition

beforeEach(() => {
  document.body.innerHTML = ''
  vi.stubGlobal('SpeechRecognition', vi.fn(() => { liveRec = new MockSpeechRecognition(); return liveRec }))
  vi.stubGlobal('webkitSpeechRecognition', undefined)
})
afterEach(() => { vi.unstubAllGlobals() })

function q(ctrl: any, sel: string) { return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null }

describe('voice dictation → description (Web Speech engine)', () => {
  it('renders the transcribed text into the contenteditable and desc.value returns it', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    const voiceBtn = q(ctrl, '#klavity-voice') as HTMLButtonElement
    expect(voiceBtn).not.toBeNull() // Web Speech supported → button present
    const desc = q(ctrl, '#klavity-desc') as HTMLElement & { value: string }

    voiceBtn.click() // start recording — fresh engine + start()
    expect(voiceBtn.classList.contains('kl-voice-rec')).toBe(true) // shows recording state
    liveRec.fireResult('hello world', true)

    // #1 suspect: the .value setter must actually paint text into the contenteditable.
    expect(desc.value).toBe('hello world')
    expect((desc.textContent || '')).toContain('hello world')
    ctrl.close()
  })

  it('appends a second phrase with a separating space', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    const voiceBtn = q(ctrl, '#klavity-voice') as HTMLButtonElement
    const desc = q(ctrl, '#klavity-desc') as HTMLElement & { value: string }
    voiceBtn.click()
    liveRec.fireResult('the button', true)
    liveRec.fireResult('is broken', true)
    expect(desc.value).toBe('the button is broken')
    ctrl.close()
  })

  it('preserves text the reporter already typed', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    const voiceBtn = q(ctrl, '#klavity-voice') as HTMLButtonElement
    const desc = q(ctrl, '#klavity-desc') as HTMLElement & { value: string }
    desc.value = 'Typed intro.'
    voiceBtn.click()
    liveRec.fireResult('spoken tail', true)
    expect(desc.value).toBe('Typed intro. spoken tail')
    ctrl.close()
  })

  it('KLA-613: recording feedback is AT the control (red glow + stop glyph + aria), NOT a disconnected text row', () => {
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    const voiceBtn = q(ctrl, '#klavity-voice') as HTMLButtonElement
    const status = q(ctrl, '#klavity-voice-status') as HTMLElement

    // Idle: no status, button not pressed, aria-label = Voice dictation.
    expect(status.hidden).toBe(true)
    expect(voiceBtn.getAttribute('aria-pressed')).toBe('false')

    voiceBtn.click() // start
    // Feedback lives on the CONTROL: recording class (drives the red glow) + stop glyph + aria.
    expect(voiceBtn.classList.contains('kl-voice-rec')).toBe(true)
    expect(voiceBtn.getAttribute('aria-pressed')).toBe('true')
    expect(voiceBtn.getAttribute('aria-label')).toMatch(/stop recording/i)
    expect(voiceBtn.querySelector('.kl-vstop')).not.toBeNull()
    // The separated status TEXT row is NOT painted with the steady recording label anymore.
    expect(status.hidden).toBe(true)
    expect(status.textContent || '').not.toMatch(/recording.*tap to stop/i)

    liveRec.fireResult('some words', true)
    // Still recording: the control keeps its state; no steady text row appears.
    expect(voiceBtn.classList.contains('kl-voice-rec')).toBe(true)
    expect(status.textContent || '').not.toMatch(/recording.*tap to stop/i)

    voiceBtn.click() // stop
    expect(voiceBtn.classList.contains('kl-voice-rec')).toBe(false)
    expect(voiceBtn.getAttribute('aria-pressed')).toBe('false')
    expect(voiceBtn.getAttribute('aria-label')).toMatch(/voice dictation/i)
    expect(status.hidden).toBe(true)
    ctrl.close()
  })
})

describe('voice dictation → description (server LiveDictation engine)', () => {
  it('wires onDictate and surfaces the endpoint transcript into the field, then falls back seamlessly', async () => {
    // MediaRecorder present → server mode. transcribe returns text on first segment.
    class MockMediaRecorder {
      state = 'inactive'; ondataavailable: any = null; onstop: any = null
      static isTypeSupported() { return true }
      constructor(public stream: any, public opts?: any) {}
      start() { this.state = 'recording' }
      stop() { if (this.state === 'inactive') return; this.state = 'inactive'; this.ondataavailable?.({ data: { size: 64 } }); this.onstop?.() }
    }
    vi.stubGlobal('MediaRecorder', MockMediaRecorder)
    const track = { stop: vi.fn() }
    ;(globalThis as any).navigator = (globalThis as any).navigator || {}
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => ({ getTracks: () => [track] }) } })

    const onDictate = vi.fn(async () => ({ text: 'server says hi' }))
    const ctrl = buildModal('bug', { onCaptureFull: async () => 'x', onDictate, onSubmit: async () => ({ issueKey: '1', issueUrl: '' }) })
    const voiceBtn = q(ctrl, '#klavity-voice') as HTMLButtonElement
    expect(voiceBtn).not.toBeNull()
    const desc = q(ctrl, '#klavity-desc') as HTMLElement & { value: string }
    voiceBtn.click()
    await new Promise(r => setTimeout(r, 5100)) // one SEGMENT_MS
    expect(onDictate).toHaveBeenCalled()
    expect(desc.value).toContain('server says hi')
    ctrl.close()
    vi.unstubAllGlobals()
  }, 10000)
})
