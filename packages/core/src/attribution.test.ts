// @vitest-environment jsdom
// Attribution helper for outbound Klavity links from the widget/extension surfaces (KLA
// widget-powered-by-utm). The "Powered by Klavity" badge, connect-entry, and CTA must carry UTM so a
// click is traceable to the embedding customer site. jsdom url is https://klavity.in/ (vitest config).

import { describe, it, expect } from 'vitest'
import { klavityAttributionUrl, detectAttributionSource } from './attribution'

function params(u: string): URLSearchParams {
  return new URL(u).searchParams
}

describe('klavityAttributionUrl', () => {
  it('derives utm_source from an explicit host override + sets campaign/medium', () => {
    const u = klavityAttributionUrl('https://klavity.in', {
      campaign: 'powered_by',
      medium: 'widget',
      source: 'qa1.px4app.com',
    })
    const p = params(u)
    expect(p.get('utm_source')).toBe('qa1.px4app.com')
    expect(p.get('utm_medium')).toBe('widget')
    expect(p.get('utm_campaign')).toBe('powered_by')
  })

  it('defaults utm_medium to "widget" when none passed', () => {
    const p = params(klavityAttributionUrl('https://klavity.in', { campaign: 'powered_by', source: 'shop.example' }))
    expect(p.get('utm_medium')).toBe('widget')
  })

  it('supports a per-link campaign + extension medium', () => {
    const p = params(klavityAttributionUrl('https://klavity.in', {
      campaign: 'widget_connect',
      medium: 'extension',
      source: 'app.acme.io',
    }))
    expect(p.get('utm_campaign')).toBe('widget_connect')
    expect(p.get('utm_medium')).toBe('extension')
  })

  it('adds the project ref as utm_content when provided', () => {
    const p = params(klavityAttributionUrl('https://klavity.in', {
      campaign: 'powered_by',
      source: 'x.com',
      ref: 'proj_abc123',
    }))
    expect(p.get('utm_content')).toBe('proj_abc123')
  })

  it('omits utm_content when no ref given', () => {
    const p = params(klavityAttributionUrl('https://klavity.in', { campaign: 'powered_by', source: 'x.com' }))
    expect(p.has('utm_content')).toBe(false)
  })

  it('detects utm_source from location.hostname when no override (jsdom = klavity.in)', () => {
    const p = params(klavityAttributionUrl('https://klavity.in', { campaign: 'powered_by' }))
    expect(p.get('utm_source')).toBe('klavity.in')
  })

  it('preserves an existing query + hash on the base', () => {
    const u = klavityAttributionUrl('https://klavity.in/connect?project=p1&origin=o#frag', {
      campaign: 'widget_connect',
      source: 'host.example',
    })
    const url = new URL(u)
    expect(url.searchParams.get('project')).toBe('p1')
    expect(url.searchParams.get('origin')).toBe('o')
    expect(url.hash).toBe('#frag')
    expect(url.searchParams.get('utm_campaign')).toBe('widget_connect')
  })

  it('does NOT double-append a param the base already carries', () => {
    const u = klavityAttributionUrl('https://klavity.in?utm_source=preset&utm_campaign=preset_c', {
      campaign: 'powered_by',
      source: 'host.example',
    })
    const all = new URL(u).searchParams.getAll('utm_source')
    expect(all).toEqual(['preset'])
    expect(new URL(u).searchParams.get('utm_campaign')).toBe('preset_c')
  })

  it('URL-encodes special characters in values', () => {
    const u = klavityAttributionUrl('https://klavity.in', {
      campaign: 'powered_by',
      source: 'a b&c=d?e',
    })
    // Raw string must be percent-encoded (no bare space/&/=/? bleeding into the query structure).
    expect(u).not.toContain('a b&c=d?e')
    expect(params(u).get('utm_source')).toBe('a b&c=d?e')
  })

  it('returns the base unchanged (never throws) when base is not a valid URL', () => {
    expect(klavityAttributionUrl('not a url', { campaign: 'powered_by', source: 'x' })).toBe('not a url')
  })
})

describe('detectAttributionSource', () => {
  it('returns the override verbatim when given', () => {
    expect(detectAttributionSource('custom.host')).toBe('custom.host')
  })

  it('falls back to location.hostname (jsdom klavity.in) with no override', () => {
    expect(detectAttributionSource()).toBe('klavity.in')
  })

  it('never throws even when location is unavailable', () => {
    const orig = Object.getOwnPropertyDescriptor(globalThis, 'window')
    try {
      // Simulate a page where window/location reads blow up.
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        get() { throw new Error('trapped location') },
      })
      expect(() => detectAttributionSource()).not.toThrow()
      // With no window and no referrer, it degrades to the literal "widget".
      const v = detectAttributionSource()
      expect(typeof v).toBe('string')
      expect(v.length).toBeGreaterThan(0)
    } finally {
      if (orig) Object.defineProperty(globalThis, 'window', orig)
    }
  })
})
