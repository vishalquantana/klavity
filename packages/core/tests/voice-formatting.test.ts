// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatSpeechText,
  formatSpeechFinal,
  joinSpeechSegments,
  VoiceInput,
} from '../src/voice-input'
import { buildModal } from '../src/modal'

describe('Speech formatting and punctuation helpers', () => {
  it('converts spoken punctuation keywords to standard punctuation symbols', () => {
    const input = 'the button is broken period it does not respond comma and nothing happens exclamation mark'
    const formatted = formatSpeechText(input, true, true)
    expect(formatted).toBe('The button is broken. It does not respond, and nothing happens!')
  })

  it('converts new lines and paragraphs', () => {
    const input = 'first section period new line second line question mark new paragraph third paragraph'
    const formatted = formatSpeechText(input, true, true)
    expect(formatted).toBe('First section.\nSecond line?\n\nThird paragraph.')
  })

  it('capitalizes pronoun I and common contractions', () => {
    const input = 'when i clicked save comma i felt like i was stuck and i\'m unable to continue'
    const formatted = formatSpeechFinal(input)
    expect(formatted).toBe('When I clicked save, I felt like I was stuck and I\'m unable to continue.')
  })

  it('cleans excessive whitespace around punctuation and avoids duplicates', () => {
    const input = 'error   .   next step  ,  done'
    const formatted = formatSpeechFinal(input)
    expect(formatted).toBe('Error. Next step, done.')
  })

  it('joins segments cleanly without double spaces', () => {
    expect(joinSpeechSegments('Hello world.', 'Here is more text.')).toBe('Hello world. Here is more text.')
    expect(joinSpeechSegments('Hello world. ', 'Here is more text.')).toBe('Hello world. Here is more text.')
    expect(joinSpeechSegments('', 'Only text.')).toBe('Only text.')
    expect(joinSpeechSegments('Only text.', '')).toBe('Only text.')
  })
})

describe('VoiceInput interim results and modal live captioning', () => {
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
      this.onresult?.({
        resultIndex: 0,
        results: [Object.assign([{ transcript }], { isFinal })],
      })
    }
  }

  let liveRec: MockSpeechRecognition

  beforeEach(() => {
    document.body.innerHTML = ''
    vi.stubGlobal('SpeechRecognition', vi.fn(() => {
      liveRec = new MockSpeechRecognition()
      return liveRec
    }))
    vi.stubGlobal('webkitSpeechRecognition', undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function q(ctrl: any, sel: string) {
    return ctrl.shadowRoot.querySelector(sel) as HTMLElement | null
  }

  it('VoiceInput sets interimResults=true when onInterim is provided and fires onInterim for non-final speech', () => {
    const v = new VoiceInput()
    const interims: string[] = []
    const finals: string[] = []
    v.onInterim = (t) => interims.push(t)
    v.onTranscript = (t) => finals.push(t)

    v.start()
    expect(liveRec.interimResults).toBe(true)

    liveRec.fireResult('the submit button', false)
    expect(interims).toEqual(['the submit button'])
    expect(finals).toEqual([])

    liveRec.fireResult('the submit button does not work', true)
    expect(finals).toEqual(['the submit button does not work'])
    v.stop()
  })

  it('modal renders live captions with minimal delay during speech and polishes formatting on stop', () => {
    const ctrl = buildModal('bug', {
      onCaptureFull: async () => 'x',
      onSubmit: async () => ({ issueKey: '1', issueUrl: '' }),
    })
    const voiceBtn = q(ctrl, '#klavity-voice') as HTMLButtonElement
    const desc = q(ctrl, '#klavity-desc') as HTMLElement & { value: string }

    voiceBtn.click()

    // 1. User is speaking: live interim caption appears immediately
    liveRec.fireResult('login fails', false)
    expect(desc.value).toBe('login fails')

    // 2. Another interim partial arrives
    liveRec.fireResult('login fails with status 500', false)
    expect(desc.value).toBe('login fails with status 500')

    // 3. Spoken phrase completes and finalizes
    liveRec.fireResult('login fails with status 500 period', true)
    expect(desc.value).toBe('login fails with status 500 period')

    // 4. User stops speaking and clicks Stop
    voiceBtn.click()
    expect(voiceBtn.classList.contains('kl-voice-rec')).toBe(false)

    // Formatted text has spoken period translated, capitalized sentence, and terminal period
    expect(desc.value).toBe('Login fails with status 500.')

    ctrl.close()
  })
})
