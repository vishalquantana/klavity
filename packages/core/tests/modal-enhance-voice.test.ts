// @vitest-environment jsdom
// KD-3156: clicking "Enhance with AI" while voice dictation is running must STOP the recorder, build the draft from
// everything that was said, and never let a late dictation result overwrite the enhanced description.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildModal, type EnhanceDraftLike } from '../src/modal'

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
const flush = () => new Promise((r) => setTimeout(r, 0))

const DRAFT: EnhanceDraftLike = {
  summary: 'Save button does nothing',
  actualResult: 'Clicking Save does nothing.',
  expectedResult: 'The form saves.',
  stepsToReproduce: ['Open the form', 'Click Save'],
  suggestedSeverity: 'C2',
  suggestedPriority: 'P2',
  confidence: 0.8,
}

function setup(onEnhance = vi.fn(async () => DRAFT)) {
  const ctrl = buildModal('bug', {
    onCaptureFull: async () => 'x',
    onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    onEnhance,
  } as any)
  return {
    ctrl,
    onEnhance,
    voiceBtn: q(ctrl, '#klavity-voice') as HTMLButtonElement,
    enhanceBtn: q(ctrl, '#klavity-enhance') as HTMLButtonElement,
    desc: q(ctrl, '#klavity-desc') as HTMLElement & { value: string },
  }
}

describe('KD-3156 Enhance with AI stops voice dictation', () => {
  it('stops the recorder and enhances the full spoken text', async () => {
    const { ctrl, onEnhance, voiceBtn, enhanceBtn, desc } = setup()
    voiceBtn.click()
    expect(voiceBtn.classList.contains('kl-voice-rec')).toBe(true)
    liveRec.fireResult('the save button does nothing', true)

    enhanceBtn.click()
    await flush(); await flush()

    expect(liveRec.stop).toHaveBeenCalled()                         // recorder told to stop
    expect(voiceBtn.classList.contains('kl-voice-rec')).toBe(false)  // control no longer shows recording
    expect(voiceBtn.getAttribute('aria-pressed')).toBe('false')
    expect(onEnhance).toHaveBeenCalledTimes(1)
    // stopping tidies the dictation ("The save button does nothing.") — the words themselves are all there
    expect(String((onEnhance.mock.calls[0] as any[])[0]).toLowerCase()).toContain('the save button does nothing')
    expect(desc.value).toContain('*Save button does nothing*')       // enhanced draft is in place
    ctrl.close()
  })

  it('a late dictation result after Enhance never overwrites the enhanced description', async () => {
    const { ctrl, voiceBtn, enhanceBtn, desc } = setup()
    voiceBtn.click()
    liveRec.fireResult('first words', true)
    enhanceBtn.click()
    await flush(); await flush()
    const enhanced = desc.value
    expect(enhanced).toContain('*Save button does nothing*')

    // The browser delivers one more result from the (stopped) session.
    liveRec.fireResult('late words', true)
    liveRec.fireResult('more late words', false)
    liveRec.onend?.()
    await flush()
    expect(desc.value).toBe(enhanced)
    ctrl.close()
  })

  it('the Voice button is disabled while Enhance runs and usable again after', async () => {
    let release!: (d: EnhanceDraftLike) => void
    const slow = vi.fn(() => new Promise<EnhanceDraftLike>((r) => { release = r }))
    const { ctrl, voiceBtn, enhanceBtn, desc } = setup(slow as any)
    desc.value = 'typed text'
    enhanceBtn.click()
    await flush()
    expect(voiceBtn.disabled).toBe(true)
    release(DRAFT)
    await flush(); await flush()
    expect(voiceBtn.disabled).toBe(false)
    ctrl.close()
  })

  it('dictating again after Enhance appends to the enhanced text (new session is live)', async () => {
    const { ctrl, voiceBtn, enhanceBtn, desc } = setup()
    voiceBtn.click()
    liveRec.fireResult('first words', true)
    enhanceBtn.click()
    await flush(); await flush()
    const enhanced = desc.value

    voiceBtn.click()                       // start a NEW session
    liveRec.fireResult('extra detail', true)
    expect(desc.value.startsWith(enhanced)).toBe(true)
    expect(desc.value).toContain('extra detail')
    ctrl.close()
  })

  it('Enhance without dictation behaves exactly as before', async () => {
    const { ctrl, onEnhance, enhanceBtn, desc } = setup()
    desc.value = 'typed description'
    enhanceBtn.click()
    await flush(); await flush()
    expect((onEnhance.mock.calls[0] as any[])[0]).toBe('typed description')
    expect(desc.value).toContain('*Save button does nothing*')
    ctrl.close()
  })
})
