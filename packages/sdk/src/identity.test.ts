// PX4 #439 / #427 / #428 — Identify API helpers: coercion, safe fallback resolution, browser info.
import { describe, it, expect } from 'vitest'
import {
  coerceReporter, reporterToIdentity, resolveFallbackReporter, captureClientInfo,
} from './identity'
import { buildFeedbackForm } from './widget-lib'

// ── coerceReporter ──────────────────────────────────────────────────────────
describe('coerceReporter', () => {
  it('keeps all known named fields and drops unknown keys', () => {
    const r = coerceReporter({
      id: 'u1', email: 'a@b.com', name: 'Ada', org: 'Acme', orgId: 'o1',
      role: 'admin', product: 'app', env: 'prod', server: 'BHP_WEB',
      password: 'nope', token: 'secret', // must NOT survive
    })
    expect(r).toEqual({
      id: 'u1', email: 'a@b.com', name: 'Ada', org: 'Acme', orgId: 'o1',
      role: 'admin', product: 'app', env: 'prod', server: 'BHP_WEB',
    })
    expect((r as any).password).toBeUndefined()
    expect((r as any).token).toBeUndefined()
  })

  it('coerces values to trimmed strings and caps them at 500 chars', () => {
    const r = coerceReporter({ id: 42, name: '  Grace  ', email: 'x'.repeat(600) + '@e.com' })
    expect(r!.id).toBe('42')
    expect(r!.name).toBe('Grace')
    expect(r!.email!.length).toBe(500)
  })

  it('returns undefined for non-object / empty / all-empty input', () => {
    expect(coerceReporter(null)).toBeUndefined()
    expect(coerceReporter('nope')).toBeUndefined()
    expect(coerceReporter({})).toBeUndefined()
    expect(coerceReporter({ id: '', email: '   ' })).toBeUndefined()
  })

  it('accepts a partial identity (email only)', () => {
    expect(coerceReporter({ email: 'a@b.com' })).toEqual({ email: 'a@b.com' })
  })
})

describe('reporterToIdentity', () => {
  it('projects the reporter down to a string map for ReportContext.identity', () => {
    expect(reporterToIdentity({ id: 'u1', email: 'a@b.com', org: 'Acme' }))
      .toEqual({ id: 'u1', email: 'a@b.com', org: 'Acme' })
  })
  it('returns undefined for undefined input', () => {
    expect(reporterToIdentity(undefined)).toBeUndefined()
  })
})

// ── resolveFallbackReporter (PX4 #427) ──────────────────────────────────────
function fakeDoc(metas: Record<string, string>): any {
  return {
    querySelector: (sel: string) => {
      const m = sel.match(/meta\[name="([^"]+)"\]/)
      if (!m) return null
      const name = m[1]
      if (metas[name] == null) return null
      return { getAttribute: (_a: string) => metas[name] }
    },
  }
}

describe('resolveFallbackReporter', () => {
  it('reads documented meta tags klavity:user-email / klavity:user-name', () => {
    const doc = fakeDoc({ 'klavity:user-email': 'meta@ex.com', 'klavity:user-name': 'Meta User' })
    expect(resolveFallbackReporter(doc, undefined)).toEqual({ email: 'meta@ex.com', name: 'Meta User' })
  })

  it('reads safe email/name off window.currentUser / window.user globals', () => {
    const win: any = { currentUser: { email: 'cu@ex.com', name: 'Current User' } }
    expect(resolveFallbackReporter(fakeDoc({}), win)).toEqual({ email: 'cu@ex.com', name: 'Current User' })
  })

  it('rejects non-email strings and token-like names (guards against grabbing PII/secrets)', () => {
    const win: any = { user: { email: 'not-an-email', name: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' } }
    expect(resolveFallbackReporter(fakeDoc({}), win)).toBeUndefined()
  })

  it('rejects a name that is a long space-free token (likely an id/session key)', () => {
    const win: any = { user: { name: 'a'.repeat(60) } }
    expect(resolveFallbackReporter(fakeDoc({}), win)).toBeUndefined()
  })

  it('rejects name values that look like markup or URLs', () => {
    const win: any = { user: { name: '<script>x</script>' } }
    expect(resolveFallbackReporter(fakeDoc({}), win)).toBeUndefined()
    const win2: any = { user: { name: 'https://evil.example/steal' } }
    expect(resolveFallbackReporter(fakeDoc({}), win2)).toBeUndefined()
  })

  it('returns undefined when nothing safe is found', () => {
    expect(resolveFallbackReporter(fakeDoc({}), {} as any)).toBeUndefined()
  })

  it('prefers the meta tag but fills missing name from a global', () => {
    const doc = fakeDoc({ 'klavity:user-email': 'meta@ex.com' })
    const win: any = { user: { name: 'Fallback Name' } }
    expect(resolveFallbackReporter(doc, win)).toEqual({ email: 'meta@ex.com', name: 'Fallback Name' })
  })
})

// ── captureClientInfo (PX4 #428) ────────────────────────────────────────────
describe('captureClientInfo', () => {
  const chromeUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
  const win: any = { innerWidth: 1280, innerHeight: 800, screen: { width: 1920, height: 1080 }, devicePixelRatio: 2 }
  const nav: any = { userAgent: chromeUA, language: 'en-AU', languages: ['en-AU', 'en'] }

  it('parses browser, version, OS, viewport, screen, locale from the environment', () => {
    const ci = captureClientInfo(win, nav)
    expect(ci.browser).toBe('Chrome')
    expect(ci.browserVersion).toBe('127.0.0.0')
    expect(ci.os).toBe('macOS')
    expect(ci.deviceType).toBe('desktop')
    expect(ci.viewport).toBe('1280x800')
    expect(ci.screen).toBe('1920x1080')
    expect(ci.devicePixelRatio).toBe(2)
    expect(ci.locale).toBe('en-AU')
    expect(ci.languages).toBe('en-AU,en')
    expect(ci.userAgent).toBe(chromeUA)
  })

  it('detects Edge before Chrome (Edge UA contains "Chrome")', () => {
    const edgeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0'
    const ci = captureClientInfo({ innerWidth: 1, innerHeight: 1 } as any, { userAgent: edgeUA } as any)
    expect(ci.browser).toBe('Edge')
    expect(ci.os).toBe('Windows 10/11')
  })

  it('flags mobile device type for an iPhone UA', () => {
    const iUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    const ci = captureClientInfo({ innerWidth: 390, innerHeight: 844 } as any, { userAgent: iUA } as any)
    expect(ci.os).toBe('iOS')
    expect(ci.deviceType).toBe('mobile')
  })
})

// ── reporter + client_info flow into the /api/feedback FormData (payload contract) ──
describe('buildFeedbackForm — reporter + client_info fields (PX4 #439/#428)', () => {
  it('serializes reporter and client_info as their own JSON fields', () => {
    const fd = buildFeedbackForm({
      description: '[bug] x', pageUrl: 'https://app.example.com/', projectId: 'p1', screenshots: [],
      reporter: { id: 'u1', email: 'a@b.com', org: 'Acme', env: 'prod' },
      clientInfo: { browser: 'Chrome', browserVersion: '127', os: 'macOS', locale: 'en-AU' },
    })
    expect(JSON.parse(fd.get('reporter') as string)).toEqual({ id: 'u1', email: 'a@b.com', org: 'Acme', env: 'prod' })
    expect(JSON.parse(fd.get('client_info') as string)).toEqual({ browser: 'Chrome', browserVersion: '127', os: 'macOS', locale: 'en-AU' })
  })

  it('omits reporter and client_info when absent (back-compat)', () => {
    const fd = buildFeedbackForm({ description: '[bug] x', pageUrl: 'https://app.example.com/', projectId: 'p1', screenshots: [] })
    expect(fd.get('reporter')).toBeNull()
    expect(fd.get('client_info')).toBeNull()
  })

  it('omits an empty reporter object', () => {
    const fd = buildFeedbackForm({ description: '[bug] x', pageUrl: 'https://app.example.com/', projectId: 'p1', screenshots: [], reporter: {} })
    expect(fd.get('reporter')).toBeNull()
  })
})
