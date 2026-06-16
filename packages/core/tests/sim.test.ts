// packages/core/tests/sim.test.ts
import { describe, it, expect } from 'vitest'
import {
  renderSimHTML,
  deriveInitials,
  emotionFromSentiment,
  EMOTIONS,
  SIM_STYLES,
} from '../src/sim'

describe('deriveInitials', () => {
  it('takes first + last initial for multi-word names', () => {
    expect(deriveInitials('Sarah Chen')).toBe('SC')
    expect(deriveInitials('Diego  Santos')).toBe('DS')
    expect(deriveInitials('Mary Jane Watson')).toBe('MW')
  })
  it('takes first two letters for a single word', () => {
    expect(deriveInitials('Priya')).toBe('PR')
  })
  it('is defensive about empty input', () => {
    expect(deriveInitials('')).toBe('?')
    expect(deriveInitials('   ')).toBe('?')
  })
})

describe('emotionFromSentiment', () => {
  it('maps the product reaction sentiment vocabulary', () => {
    for (const s of ['frustrated', 'confused', 'satisfied', 'delighted', 'neutral']) {
      expect(emotionFromSentiment(s)).toBe(s)
    }
  })
  it('is case-insensitive and falls back to none', () => {
    expect(emotionFromSentiment('Delighted')).toBe('delighted')
    expect(emotionFromSentiment('annoyed')).toBe('none')
    expect(emotionFromSentiment(null)).toBe('none')
    expect(emotionFromSentiment(undefined)).toBe('none')
  })
})

describe('renderSimHTML — identity', () => {
  it('renders a monogram (with character eyes) when there is no photo', () => {
    const html = renderSimHTML({ name: 'Sarah Chen', color: '#6f6cf2' })
    expect(html).toContain('ksim-mono')
    expect(html).toContain('>SC<')
    expect(html).toContain('ksim-eyes')
    expect(html).not.toContain('<img')
    expect(html).toContain('--ksim-persona:#6f6cf2')
  })

  it('renders a photo with a thin ring AND a hidden monogram fallback', () => {
    const html = renderSimHTML({ name: 'Sarah Chen', color: '#6f6cf2', photoUrl: 'https://x/a.jpg' })
    expect(html).toContain('ksim-photo')
    expect(html).toContain('<img')
    expect(html).toContain('src="https://x/a.jpg"')
    // fallback: onerror reveals the monogram by adding the fallback class
    expect(html).toContain('onerror=')
    expect(html).toContain('ksim-fallback')
    expect(html).toContain('ksim-ini')
  })

  it('honours an explicit initials override', () => {
    expect(renderSimHTML({ name: 'Someone Else', initials: 'ZZ' })).toContain('>ZZ<')
  })

  it('can drop the eyes and legs', () => {
    const html = renderSimHTML({ name: 'A B', eyes: false, legs: false })
    expect(html).not.toContain('ksim-eyes')
    expect(html).not.toContain('ksim-legs')
  })
})

describe('renderSimHTML — emotion mark', () => {
  it('omits the mark when emotion is none', () => {
    const html = renderSimHTML({ name: 'A B' })
    expect(html).not.toContain('ksim-mark')
    expect(html).toContain('data-emotion="none"')
  })

  it('adds the floating mark in the emotion accent colour', () => {
    const html = renderSimHTML({ name: 'A B', emotion: 'frustrated' })
    expect(html).toContain('ksim-mark')
    expect(html).toContain(EMOTIONS.frustrated.accent) // #e8849a
    expect(html).toContain('ksim-m-vein')              // vein mark animation
    expect(html).toContain('--ksim-accent:#e8849a')
    expect(html).toContain('data-emotion="frustrated"')
  })

  it('uses glyph marks for alarmed (!) and confused (?)', () => {
    expect(renderSimHTML({ name: 'A B', emotion: 'alarmed' })).toContain('ksim-glyph">!<')
    expect(renderSimHTML({ name: 'A B', emotion: 'confused' })).toContain('ksim-glyph">?<')
  })

  it('covers every emotion in the EMOTIONS table', () => {
    for (const key of Object.keys(EMOTIONS) as (keyof typeof EMOTIONS)[]) {
      const html = renderSimHTML({ name: 'A B', emotion: key })
      expect(html).toContain('ksim-mark')
      expect(html).toContain(`data-emotion="${key}"`)
    }
  })
})

describe('renderSimHTML — sizing, animation, escaping', () => {
  it('scales from the size prop', () => {
    expect(renderSimHTML({ name: 'A B', size: 40 })).toContain('--ksim-size:40px')
  })
  it('gates animation behind the animate flag', () => {
    expect(renderSimHTML({ name: 'A B' })).toContain('is-animated')
    const still = renderSimHTML({ name: 'A B', emotion: 'frustrated', animate: false })
    expect(still).not.toContain('is-animated')
    expect(still).not.toContain('ksim-m-vein')
  })
  it('escapes hostile names', () => {
    const html = renderSimHTML({ name: '<script>"x"', photoUrl: 'a"b' })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('src="a"b"')
  })
})

describe('SIM_STYLES', () => {
  it('is a non-empty, self-contained stylesheet scoped to .ksim', () => {
    expect(SIM_STYLES.length).toBeGreaterThan(500)
    expect(SIM_STYLES).toContain('.ksim')
    expect(SIM_STYLES).toContain('prefers-reduced-motion')
  })
})
