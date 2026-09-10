// KLA-783 — roaming-Sim dynamic-registration scope. Round-2: register the origins the user
// actually granted (permissions.getAll) that match a monitored host glob, covering exact
// single-scheme grants, both schemes, and wildcard-subdomain monitored patterns.
import { describe, it, expect } from 'vitest'
import { monitoredHost, originHost, hostMatchesGlob, registrablePatterns } from './roam-scope'

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
