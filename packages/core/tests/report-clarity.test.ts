// packages/core/tests/report-clarity.test.ts
import { describe, it, expect } from 'vitest'
import {
  scoreReportClarity,
  shouldFetchClarityTip,
  shouldNudgeOnSubmit,
  suppressesAutoCapturedAsk,
  VAGUE_PHRASES,
} from '../src/report-clarity'

describe('scoreReportClarity — vague vs clear', () => {
  it('scores an empty description as needs / no coverage', () => {
    const r = scoreReportClarity('')
    expect(r.score).toBe(0)
    expect(r.level).toBe('needs')
    expect(r.coverage).toEqual({ problem: false, expected: false, repro: false })
    expect(r.label).toBe('Needs detail')
  })

  it('flags a pure vague phrase ("not working") as vague with zero coverage', () => {
    const r = scoreReportClarity('not working')
    expect(r.vague).toBe(true)
    expect(r.score).toBe(0)
    expect(r.level).toBe('needs')
    expect(r.coverage.problem).toBe(false)
  })

  it('flags "broken pls fix" as vague / needs-detail (drives the pre-submit nudge)', () => {
    const r = scoreReportClarity('broken pls fix')
    expect(r.vague).toBe(true)
    expect(r.level).toBe('needs')
    expect(shouldNudgeOnSubmit('broken pls fix')).toBe(true)
  })

  // Mockup panel B — specific problem + a repro step, but no "expected".
  it('scores a specific report with a repro step as good (2) — problem + repro, expected missing', () => {
    const r = scoreReportClarity(
      "The coupon code SAVE10 doesn't apply on the mobile cart - I tap Apply and nothing happens.",
    )
    expect(r.coverage.problem).toBe(true)
    expect(r.coverage.repro).toBe(true)
    expect(r.coverage.expected).toBe(false)
    expect(r.score).toBe(2)
    expect(r.level).toBe('good')
    expect(r.label).toBe('Good')
  })

  // Mockup panel C — all three covered.
  it('scores a full report (problem + expected + repro + path) as great (3)', () => {
    const r = scoreReportClarity(
      'On the mobile cart (/checkout), I enter SAVE10 and tap Apply. Nothing happens - no error, total unchanged. I expected the total to drop 10%. Works fine on desktop.',
    )
    expect(r.coverage).toEqual({ problem: true, expected: true, repro: true })
    expect(r.score).toBe(3)
    expect(r.level).toBe('great')
    expect(r.label).toBe('Great')
  })

  it('does not let a stray vague word kill an otherwise concrete report', () => {
    // "broken" appears but there is plenty of concrete content around it.
    const r = scoreReportClarity('The submit button is broken on the checkout page after I click Pay.')
    expect(r.coverage.problem).toBe(true)
    expect(r.coverage.repro).toBe(true)
    expect(r.vague).toBe(false)
  })

  it('detects the expected marker on its own', () => {
    expect(scoreReportClarity('I expected it to save my changes').coverage.expected).toBe(true)
    expect(scoreReportClarity('the total should drop by 10 percent').coverage.expected).toBe(true)
  })

  it('detects repro via a bare URL/path even without step verbs', () => {
    expect(scoreReportClarity('the dashboard chart renders empty at https://app.example.com/reports').coverage.repro).toBe(true)
  })

  it('exposes the vague-phrase list for parity with the server prompt', () => {
    expect(VAGUE_PHRASES).toContain('not working')
    expect(VAGUE_PHRASES).toContain('broken')
  })
})

describe('shouldFetchClarityTip — debounce gating', () => {
  it('skips trivial (too-short) text', () => {
    expect(shouldFetchClarityTip('broken')).toBe(false)
    expect(shouldFetchClarityTip('')).toBe(false)
  })

  it('fetches for non-trivial but not-yet-great text', () => {
    expect(shouldFetchClarityTip("The coupon code SAVE10 doesn't apply on mobile")).toBe(true)
  })

  it('does NOT fetch once the report is already Great (helper gets out of the way)', () => {
    const great =
      'On /checkout I enter SAVE10 and tap Apply. Nothing happens. I expected the total to drop 10%.'
    expect(scoreReportClarity(great).level).toBe('great')
    expect(shouldFetchClarityTip(great)).toBe(false)
  })
})

describe('shouldNudgeOnSubmit — soft pre-submit nudge', () => {
  it('nudges weak text', () => {
    expect(shouldNudgeOnSubmit('broken pls fix')).toBe(true)
  })
  it('does not nudge an empty (evidence-only) description', () => {
    expect(shouldNudgeOnSubmit('')).toBe(false)
    expect(shouldNudgeOnSubmit('   ')).toBe(false)
  })
  it('does not nudge a good/great report', () => {
    expect(shouldNudgeOnSubmit("The coupon SAVE10 doesn't apply on mobile cart - I tap Apply, nothing happens")).toBe(false)
  })
})

// KLAVITYKLA-492: the widget ALREADY auto-captures the page URL, screenshot(s), browser/UA and screen
// size on every report — so a coach tip ASKING for any of those must be suppressed, never rendered.
describe('suppressesAutoCapturedAsk — tips never ask for already-captured fields (KLAVITYKLA-492)', () => {
  it('suppresses asks for screenshots', () => {
    expect(suppressesAutoCapturedAsk('Could you attach a screenshot of what you see?')).toBe(true)
    expect(suppressesAutoCapturedAsk('Please take a screen grab of the error.')).toBe(true)
  })
  it('suppresses asks for the page URL / link', () => {
    expect(suppressesAutoCapturedAsk('What is the URL where this happens?')).toBe(true)
    expect(suppressesAutoCapturedAsk('Can you share a link to the page?')).toBe(true)
    expect(suppressesAutoCapturedAsk('Which web address shows the bug?')).toBe(true)
  })
  it('suppresses asks for browser / user agent', () => {
    expect(suppressesAutoCapturedAsk('Which browser and version are you using?')).toBe(true)
    expect(suppressesAutoCapturedAsk('Please paste your user agent string.')).toBe(true)
  })
  it('suppresses asks for OS / screen or window size', () => {
    expect(suppressesAutoCapturedAsk('What operating system are you on?')).toBe(true)
    expect(suppressesAutoCapturedAsk("What's your screen size?")).toBe(true)
    expect(suppressesAutoCapturedAsk('Tell me your window size / resolution.')).toBe(true)
  })
  it('lets genuinely-useful tips through', () => {
    expect(suppressesAutoCapturedAsk('What did you expect to happen instead?')).toBe(false)
    expect(suppressesAutoCapturedAsk('What is the exact step where it fails?')).toBe(false)
    expect(suppressesAutoCapturedAsk("Try re-entering the coupon code SAVE10 — does the total update?")).toBe(false)
    expect(suppressesAutoCapturedAsk('')).toBe(false)
  })
})
