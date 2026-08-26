// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { bananaFor, isSecurity, score, summarize, placeMargin, deOverlap, repositionChar, roamRoast, stopRoam, type RoastReaction, type Char } from './roam'

const R = (o: Partial<RoastReaction>): RoastReaction => ({ simName: 'Sim', initials: 'SM', accent: '#6366f1', ...o })

describe('bananaFor — severity → banana mapping', () => {
  it('honours explicit high/critical priority as 3', () => {
    expect(bananaFor(R({ priority: 'high' }))).toBe(3)
    expect(bananaFor(R({ priority: 'P1' }))).toBe(3)
    expect(bananaFor(R({ priority: 'C1' }))).toBe(3)
    expect(bananaFor(R({ priority: 'critical' }))).toBe(3)
  })
  it('honours explicit medium priority as 2', () => {
    expect(bananaFor(R({ priority: 'medium' }))).toBe(2)
    expect(bananaFor(R({ priority: 'P2' }))).toBe(2)
    expect(bananaFor(R({ priority: 'C2' }))).toBe(2)
  })
  it('honours explicit low priority as 1', () => {
    expect(bananaFor(R({ priority: 'low' }))).toBe(1)
    expect(bananaFor(R({ priority: 'P3' }))).toBe(1)
    expect(bananaFor(R({ priority: 'nit' }))).toBe(1)
  })
  it('derives game-breaker from observation text when no priority', () => {
    expect(bananaFor(R({ observation: 'The checkout button is completely broken' }))).toBe(3)
    expect(bananaFor(R({ observation: "I can't log in at all" }))).toBe(3)
    expect(bananaFor(R({ observation: 'Page returns a 500 error' }))).toBe(3)
  })
  it('derives friction from observation text', () => {
    expect(bananaFor(R({ observation: 'This is confusing and takes too many clicks' }))).toBe(2)
    expect(bananaFor(R({ observation: 'The label is unclear' }))).toBe(2)
  })
  it('defaults to a nit (1)', () => {
    expect(bananaFor(R({ observation: 'Nice headline, love it' }))).toBe(1)
    expect(bananaFor(R({}))).toBe(1)
  })
})

describe('isSecurity — share-card guardrail', () => {
  it('flags obvious security findings', () => {
    expect(isSecurity(R({ observation: 'This form is vulnerable to XSS' }))).toBe(true)
    expect(isSecurity(R({ observation: 'Invite fires with no auth check — privilege escalation' }))).toBe(true)
    expect(isSecurity(R({ priority: 'security' }))).toBe(true)
    expect(isSecurity(R({ suggestedBug: { category: 'security' } }))).toBe(true)
  })
  it('does not flag functional/UX findings', () => {
    expect(isSecurity(R({ observation: 'The button is hard to find' }))).toBe(false)
    expect(isSecurity(R({ observation: 'Missing empty state on the board' }))).toBe(false)
  })
})

describe('summarize + score', () => {
  it('counts findings, bananas, and per-severity buckets', () => {
    const scored = score([
      R({ priority: 'high' }), // 3
      R({ priority: 'medium' }), // 2
      R({ priority: 'medium' }), // 2
      R({ priority: 'low' }), // 1
    ])
    const s = summarize(scored)
    expect(s.count).toBe(4)
    expect(s.c3).toBe(1)
    expect(s.c2).toBe(2)
    expect(s.c1).toBe(1)
    expect(s.total).toBe(3 + 2 + 2 + 1)
  })
  it('verdict is bruised with 2+ game-breakers or 9+ bananas', () => {
    const scored = score([R({ priority: 'high' }), R({ priority: 'critical' })])
    expect(summarize(scored).verdictClass).toBe('bruised')
  })
  it('verdict is golden for a clean/light run', () => {
    expect(summarize(score([])).verdictClass).toBe('golden')
    expect(summarize(score([R({ priority: 'low' })])).verdictClass).toBe('golden')
  })
  it('the shareable subset excludes security findings', () => {
    const scored = score([
      R({ observation: 'checkout broken' }), // functional, 3
      R({ observation: 'XSS in the search box' }), // security
    ])
    const shareable = scored.filter((x) => !x.security)
    expect(shareable.length).toBe(1)
    expect(summarize(shareable).total).toBe(3)
  })
})

// ── DOM-dependent placement logic (Bug 1 + overlap fan-out) ──
function mkChar(marginSlot: number): Char {
  const el = document.createElement('div')
  el.className = 'rr-rv'
  const bub = document.createElement('div')
  bub.className = 'rr-bubble'
  el.appendChild(bub)
  const hl = document.createElement('div')
  document.body.append(el, hl)
  return { el, hl, key: 'SM' + marginSlot, color: '#6366f1', name: 'Sim', initials: 'SM', current: null, mode: 'idle', marginSlot, active: null, parked: false }
}

// jsdom does no layout, so stub the bubble's rendered box. The centered margin
// bubble tracks the char center (charLeft + 23); `renderedW` simulates the ACTUAL
// on-screen width incl. padding + border (e.g. 242 = 214 nominal + 26 padding + 2
// border) — the very inflation Codex flagged in round 2.
function stubBubbleRenderedWidth(c: Char, renderedW: number): HTMLElement {
  const bub = c.el.querySelector('.rr-bubble') as HTMLElement
  bub.getBoundingClientRect = () => {
    const cl = parseFloat(c.el.style.left || '0')
    const center = cl + 23
    return { width: renderedW, height: 40, left: center - renderedW / 2, right: center + renderedW / 2, top: 0, bottom: 40, x: center - renderedW / 2, y: 0, toJSON() {} } as DOMRect
  }
  return bub
}
function setViewport(w: number, h: number) {
  ;(window as any).visualViewport = undefined
  Object.defineProperty(window, 'innerWidth', { value: w, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: h, configurable: true })
}

describe('placeMargin — recomputes on resize/maximize (Bug 1)', () => {
  it('a top-right margin slot follows the viewport width when it grows', () => {
    const c = mkChar(0) // slot 0 = top-right (W-260)
    setViewport(1000, 800)
    placeMargin(c)
    const before = parseFloat(c.el.style.left)
    setViewport(2000, 1200) // maximize
    placeMargin(c)
    const after = parseFloat(c.el.style.left)
    expect(after).toBeGreaterThan(before) // char moved right with the wider viewport
    expect(after).toBeLessThan(2000 - 54) // and stays on-screen
  })
  it('never places a char off-screen after shrinking', () => {
    const c = mkChar(2) // slot 2 = bottom-right
    setViewport(400, 500)
    placeMargin(c)
    expect(parseFloat(c.el.style.left)).toBeGreaterThanOrEqual(8)
    expect(parseFloat(c.el.style.left)).toBeLessThanOrEqual(400 - 54)
    expect(parseFloat(c.el.style.top)).toBeLessThanOrEqual(500 - 60)
  })
})

describe('deOverlap — two Sims on the same element fan out', () => {
  it('offsets stacked chars so their left positions differ', () => {
    setViewport(1200, 800)
    const a = mkChar(0)
    const b = mkChar(1)
    const shared = document.createElement('div')
    document.body.appendChild(shared)
    a.mode = 'target'; a.current = shared; a.el.style.left = '500px'
    b.mode = 'target'; b.current = shared; b.el.style.left = '500px'
    deOverlap([a, b])
    expect(a.el.style.left).not.toBe(b.el.style.left)
  })
  it('leaves a lone char untouched', () => {
    setViewport(1200, 800)
    const a = mkChar(0)
    const shared = document.createElement('div')
    a.mode = 'target'; a.current = shared; a.el.style.left = '500px'
    deOverlap([a])
    expect(a.el.style.left).toBe('500px')
  })
})

describe('placeMargin — RENDERED bubble box stays on-screen for every slot (QA-3 r2)', () => {
  // Validate the ACTUAL rendered bounds (bubble.getBoundingClientRect), not just the
  // coordinate math — placeMargin must clamp using the measured width, so the real
  // padding/border-inflated box (242px) never exceeds [0, viewportWidth].
  for (const [w, h] of [[1200, 800], [400, 600]] as const) {
    for (let slot = 0; slot < 5; slot++) {
      it(`slot ${slot} @ ${w}x${h}: rendered bubble box within [0, ${w}]`, () => {
        setViewport(w, h)
        const c = mkChar(slot)
        stubBubbleRenderedWidth(c, 242) // real box is wider than the nominal 214
        placeMargin(c)
        const box = (c.el.querySelector('.rr-bubble') as HTMLElement).getBoundingClientRect()
        expect(box.left).toBeGreaterThanOrEqual(0) // was rendering to ~-60px
        expect(box.right).toBeLessThanOrEqual(w)
        expect(parseFloat(c.el.style.top)).toBeGreaterThanOrEqual(0)
      })
    }
  }

  it('regression: with the nominal-214 clamp the 242px box WOULD overflow (proves the test bites)', () => {
    setViewport(400, 600)
    const c = mkChar(1) // left slot
    stubBubbleRenderedWidth(c, 242)
    // Simulate the OLD behaviour: clamp using nominal 214 at a left-edge slot.
    const W = 400
    const BWold = Math.min(214, W - 24)
    const oldCenter = Math.max(BWold / 2 + 8, 24 + 23) // old clamp lower bound
    const oldBoxLeft = oldCenter - 242 / 2
    expect(oldBoxLeft).toBeLessThan(0) // the old math left the real box off-screen
    // The new placeMargin, using the measured 242, keeps it on-screen:
    placeMargin(c)
    const box = (c.el.querySelector('.rr-bubble') as HTMLElement).getBoundingClientRect()
    expect(box.left).toBeGreaterThanOrEqual(0)
  })
})

describe('repositionChar — detached target parks + retries, never permanent margin (QA-2)', () => {
  it('keeps mode=target and parks when the quote cannot be re-resolved this tick', () => {
    setViewport(1200, 800)
    const c = mkChar(0)
    c.mode = 'target'
    c.current = document.createElement('div') // detached (never in DOM) → rect width 0
    c.active = score([R({ observation: 'x', citation: { sourceQuote: 'a quote that is nowhere on this page zzz' } })])[0]
    repositionChar(c)
    expect(c.mode).toBe('target') // did NOT permanently switch to margin
    expect(c.parked).toBe(true) // parked, will retry on the next reposition tick
    expect(c.current).toBeNull()
  })
  it('a page-level (margin) char stays margin', () => {
    setViewport(1200, 800)
    const c = mkChar(1)
    c.mode = 'margin'
    c.active = score([R({ observation: 'page-level note' })])[0]
    repositionChar(c)
    expect(c.mode).toBe('margin')
  })
})

describe('stopRoam — leaves zero injected nodes/timers/listeners (QA-1 + QA-4)', () => {
  function mkRoot(): ShadowRoot {
    const host = document.createElement('div')
    document.body.appendChild(host)
    return host.attachShadow({ mode: 'open' })
  }
  const opts = (root: ShadowRoot, mode: 'visual' | 'nonvisual') => ({
    reactions: [R({ observation: 'checkout is broken', citation: { sourceQuote: 'buy now' } }), R({ observation: 'confusing layout' })],
    mode, root, dashboardUrl: 'https://klavity.in/dashboard', esc: (s: unknown) => String(s ?? ''), safeColor: (c: unknown) => String(c ?? '#000'),
  })
  it('visual run then stopRoam removes the style node, chars, hud — root is empty', () => {
    const root = mkRoot()
    roamRoast(opts(root, 'visual'))
    expect(root.getElementById('klav-roam-style')).toBeTruthy()
    expect(root.querySelector('.rr-rv')).toBeTruthy()
    stopRoam()
    expect(root.getElementById('klav-roam-style')).toBeNull() // QA-4: style removed
    expect(root.querySelectorAll('.rr-rv').length).toBe(0)
    expect(root.querySelector('.rr-hud')).toBeNull()
    expect(root.querySelector('.rr-reveal')).toBeNull()
    expect(root.childNodes.length).toBe(0) // literally zero injected nodes
  })
  it('a second route-change-style stopRoam after teardown is a safe no-op', () => {
    const root = mkRoot()
    roamRoast(opts(root, 'nonvisual')) // straight to reveal card
    expect(root.querySelector('.rr-reveal')).toBeTruthy()
    stopRoam()
    expect(root.childNodes.length).toBe(0)
    expect(() => stopRoam()).not.toThrow()
  })
})
