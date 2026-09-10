// KLA-783 — roaming-Sim dynamic-registration scope. Round-2: register the origins the user
// actually granted (permissions.getAll) that match a monitored host glob, covering exact
// single-scheme grants, both schemes, and wildcard-subdomain monitored patterns.
import { describe, it, expect } from 'vitest'
import { monitoredHost, originHost, hostMatchesGlob, hostGlobCovers, registrablePatterns } from './roam-scope'

describe('monitoredHost', () => {
  it('strips scheme/path/port, preserves *. subdomain glob and bare *', () => {
    expect(monitoredHost('host/path*')).toBe('host')
    expect(monitoredHost('https://host/x')).toBe('host')
    expect(monitoredHost('*://host/*')).toBe('host')
    expect(monitoredHost('*.example.com/*')).toBe('*.example.com')
    expect(monitoredHost('  https://h:8080/app ')).toBe('h')
    expect(monitoredHost('*://*/*')).toBe('*')
  })
})

describe('originHost', () => {
  it('extracts the host from a granted match pattern', () => {
    expect(originHost('https://app.example.com/*')).toBe('app.example.com')
    expect(originHost('*://host/*')).toBe('host')
    expect(originHost('http://h:3000/*')).toBe('h')
  })
})

describe('hostMatchesGlob', () => {
  it('exact host', () => { expect(hostMatchesGlob('a.com', 'a.com')).toBe(true); expect(hostMatchesGlob('b.com', 'a.com')).toBe(false) })
  it('*.base matches base + any subdomain', () => {
    expect(hostMatchesGlob('example.com', '*.example.com')).toBe(true)
    expect(hostMatchesGlob('app.example.com', '*.example.com')).toBe(true)
    expect(hostMatchesGlob('deep.app.example.com', '*.example.com')).toBe(true)
    expect(hostMatchesGlob('example.com.evil.com', '*.example.com')).toBe(false)
    expect(hostMatchesGlob('notexample.com', '*.example.com')).toBe(false)
  })
  it('bare * matches any host', () => { expect(hostMatchesGlob('anything.io', '*')).toBe(true) })
})

describe('registrablePatterns', () => {
  const globs = ['customer.example', '*.wild.com']

  it('registers a freshly-granted HTTPS-only exact origin (the KLA-783 repro)', () => {
    expect(registrablePatterns(globs, ['https://customer.example/*'])).toEqual(['https://customer.example/*'])
  })
  it('registers BOTH schemes when both are granted (dual-scheme, codex case)', () => {
    expect(registrablePatterns(globs, ['https://customer.example/*', 'http://customer.example/*']))
      .toEqual(['https://customer.example/*', 'http://customer.example/*'])
  })
  it('registers an exact-subdomain grant against a wildcard-subdomain monitored pattern (codex case)', () => {
    expect(registrablePatterns(globs, ['https://app.wild.com/*'])).toEqual(['https://app.wild.com/*'])
  })
  it('preserves a broad *://host/* grant verbatim', () => {
    expect(registrablePatterns(globs, ['*://customer.example/*'])).toEqual(['*://customer.example/*'])
  })
  it('omits granted origins that match NO monitored pattern (e.g. the extension manifest hosts)', () => {
    expect(registrablePatterns(globs, ['https://klavity.in/*', 'https://other.site/*'])).toEqual([])
  })
  it('collapses a broad *://host/* over same-host concrete grants (no double-registration) — codex C2', () => {
    expect(registrablePatterns(globs, ['*://customer.example/*', 'https://customer.example/*']))
      .toEqual(['*://customer.example/*'])
  })
  it('keeps BOTH concrete schemes when no broad grant exists (https+http do not overlap)', () => {
    expect(registrablePatterns(globs, ['https://customer.example/*', 'http://customer.example/*']))
      .toEqual(['https://customer.example/*', 'http://customer.example/*'])
  })
  it('matches case-insensitively (codex C3)', () => {
    expect(registrablePatterns(['Example.COM'], ['https://example.com/*'])).toEqual(['https://example.com/*'])
    expect(hostMatchesGlob('APP.example.com', '*.Example.com')).toBe(true)
  })
  it('a broad *.subdomain grant covering a monitored EXACT host registers (codex round-3 a)', () => {
    expect(registrablePatterns(['app.example.com'], ['*://*.example.com/*'])).toEqual(['*://*.example.com/*'])
  })
  it('collapses a wildcard-host grant over a concrete same-domain grant (no double-run) (codex round-3 b)', () => {
    expect(registrablePatterns(['*.example.com'], ['*://*.example.com/*', 'https://app.example.com/*']))
      .toEqual(['*://*.example.com/*'])
  })
  it('hostGlobCovers: wildcard subsumption', () => {
    expect(hostGlobCovers('*.example.com', 'app.example.com')).toBe(true)
    expect(hostGlobCovers('*.example.com', '*.example.com')).toBe(true)
    expect(hostGlobCovers('*.example.com', '*.sub.example.com')).toBe(true)
    expect(hostGlobCovers('app.example.com', '*.example.com')).toBe(false) // exact can't cover a wildcard
    expect(hostGlobCovers('*', 'anything.io')).toBe(true)
  })
  it('collapses NESTED wildcard grants order-independently (codex round-4)', () => {
    expect(registrablePatterns(['*.example.com'], ['*://*.sub.example.com/*', '*://*.example.com/*']))
      .toEqual(['*://*.example.com/*'])
    // reversed input order → same result
    expect(registrablePatterns(['*.example.com'], ['*://*.example.com/*', '*://*.sub.example.com/*']))
      .toEqual(['*://*.example.com/*'])
  })
  it('dedups and keeps only matching origins from a mixed grant set', () => {
    const out = registrablePatterns(globs, [
      'https://klavity.in/*',          // manifest host — omit
      'https://customer.example/*',    // exact match — keep
      'https://customer.example/*',    // dup — collapse
      'https://sub.wild.com/*',        // wildcard subdomain — keep
    ])
    expect(out).toEqual(['https://customer.example/*', 'https://sub.wild.com/*'])
  })
})
