// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { monitoredHost, scopeCandidates, grantedRegistrablePatterns } from './roam-scope'

describe('monitoredHost — strips scheme + path from a monitored URL pattern', () => {
  it('handles bare host/path, http(s):// and *:// forms', () => {
    expect(monitoredHost('customer.example/app*')).toBe('customer.example')
    expect(monitoredHost('https://customer.example/app*')).toBe('customer.example')
    expect(monitoredHost('http://customer.example/')).toBe('customer.example')
    expect(monitoredHost('*://customer.example/*')).toBe('customer.example')
    expect(monitoredHost('customer.example')).toBe('customer.example')
  })
})

describe('scopeCandidates — most-permissive scheme first', () => {
  it('offers broad, then https, then http', () => {
    expect(scopeCandidates('host.tld')).toEqual([
      '*://host.tld/*',
      'https://host.tld/*',
      'http://host.tld/*',
    ])
  })
})

describe('grantedRegistrablePatterns — KLA-783 scheme-consistent registration', () => {
  // Simulate chrome.permissions.contains() semantics: an exact https grant does NOT satisfy
  // a `*://host/*` (both-schemes) query — the very mismatch that broke roaming registration.
  const containsFrom = (granted: string[]) => async (pattern: string) => granted.includes(pattern)

  it('registers a freshly-granted https origin (the bug: was previously skipped)', async () => {
    // Popup granted the EXACT active origin only.
    const contains = containsFrom(['https://customer.example/*'])
    const patterns = await grantedRegistrablePatterns(['customer.example'], contains)
    expect(patterns).toEqual(['https://customer.example/*'])
    // And the pattern we register is one contains() actually confirms → it WILL register.
    expect(await contains(patterns[0])).toBe(true)
  })

  it('regression guard: the old `*://host/*`-only check would have registered nothing', async () => {
    const contains = containsFrom(['https://customer.example/*'])
    // Old behaviour checked only the broad pattern:
    expect(await contains('*://customer.example/*')).toBe(false)
  })

  it('an http-only granted site still registers under http', async () => {
    const contains = containsFrom(['http://legacy.example/*'])
    const patterns = await grantedRegistrablePatterns(['legacy.example'], contains)
    expect(patterns).toEqual(['http://legacy.example/*'])
  })

  it('a broad `*://host/*` grant (admin/manifest) is preserved as the registered pattern', async () => {
    const contains = containsFrom(['*://broad.example/*'])
    const patterns = await grantedRegistrablePatterns(['broad.example'], contains)
    expect(patterns).toEqual(['*://broad.example/*'])
  })

  it('omits hosts with no granted permission', async () => {
    const contains = containsFrom(['https://a.example/*'])
    const patterns = await grantedRegistrablePatterns(['a.example', 'b.example'], contains)
    expect(patterns).toEqual(['https://a.example/*'])
  })

  it('one pattern per host — most permissive wins when both broad and concrete are granted', async () => {
    const contains = containsFrom(['*://x.example/*', 'https://x.example/*'])
    const patterns = await grantedRegistrablePatterns(['x.example'], contains)
    expect(patterns).toEqual(['*://x.example/*'])
  })

  it('a rejecting contains() never throws and yields no patterns', async () => {
    const contains = async () => { throw new Error('permission API blew up') }
    const patterns = await grantedRegistrablePatterns(['boom.example'], contains)
    expect(patterns).toEqual([])
  })
})
