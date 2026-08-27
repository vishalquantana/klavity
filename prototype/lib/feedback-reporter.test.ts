// PX4 #439 / #428 server-side: sanitizeReporter + sanitizeClientInfo + reporterLines + clientInfoLines,
// and the clientContextLines/Html skipIdentity option that prevents double-rendering the reporter.
//
// All tests are pure (no server, no DOM, no network).

import { test, expect, describe } from 'bun:test'
import {
  sanitizeReporter, sanitizeClientInfo, reporterLines, clientInfoLines,
  clientContextLines, clientContextHtml,
} from './feedback'

describe('sanitizeReporter (PX4 #439)', () => {
  test('keeps the known named fields, coerces to strings, drops unknown keys', () => {
    expect(sanitizeReporter({
      id: 42, email: 'a@b.com', name: 'Ada', org: 'Acme', orgId: 'o1',
      role: 'admin', product: 'app', env: 'prod', server: 'BHP_WEB',
      password: 'nope', __proto__: 'x',
    })).toEqual({
      id: '42', email: 'a@b.com', name: 'Ada', org: 'Acme', orgId: 'o1',
      role: 'admin', product: 'app', env: 'prod', server: 'BHP_WEB',
    })
  })

  test('caps values at 500 chars and trims', () => {
    const r = sanitizeReporter({ name: '  spaced  ', email: 'x'.repeat(700) })!
    expect(r.name).toBe('spaced')
    expect(r.email.length).toBe(500)
  })

  test('returns null for absent / garbage / all-empty input', () => {
    expect(sanitizeReporter(null)).toBeNull()
    expect(sanitizeReporter('nope')).toBeNull()
    expect(sanitizeReporter({})).toBeNull()
    expect(sanitizeReporter({ id: '', name: '  ' })).toBeNull()
  })
})

describe('sanitizeClientInfo (PX4 #428)', () => {
  test('keeps allowlisted string fields + numeric devicePixelRatio', () => {
    expect(sanitizeClientInfo({
      userAgent: 'UA', browser: 'Chrome', browserVersion: '127', os: 'macOS',
      deviceType: 'desktop', viewport: '1280x800', screen: '1920x1080',
      locale: 'en-AU', languages: 'en-AU,en', timezone: 'Australia/Sydney',
      devicePixelRatio: 2, evil: 'drop-me',
    })).toEqual({
      userAgent: 'UA', browser: 'Chrome', browserVersion: '127', os: 'macOS',
      deviceType: 'desktop', viewport: '1280x800', screen: '1920x1080',
      locale: 'en-AU', languages: 'en-AU,en', timezone: 'Australia/Sydney',
      devicePixelRatio: 2,
    })
  })

  test('drops an out-of-range devicePixelRatio and returns null for empty input', () => {
    expect(sanitizeClientInfo({ devicePixelRatio: 999 })).toBeNull()
    expect(sanitizeClientInfo(null)).toBeNull()
    expect(sanitizeClientInfo({})).toBeNull()
  })
})

describe('reporterLines / clientInfoLines', () => {
  test('reporterLines renders an ordered, labelled block', () => {
    const lines = reporterLines({ id: 'u1', email: 'a@b.com', name: 'Ada', org: 'Acme', env: 'prod' })
    expect(lines[0]).toBe('Reporter:')
    const joined = lines.join('\n')
    expect(joined).toContain('Name: Ada')
    expect(joined).toContain('Email: a@b.com')
    expect(joined).toContain('Company Name: Acme')
    expect(joined).toContain('Environment: prod')
  })

  test('reporterLines is empty for absent reporter', () => {
    expect(reporterLines(null)).toEqual([])
    expect(reporterLines({})).toEqual([])
  })

  test('clientInfoLines renders a compact single line', () => {
    const lines = clientInfoLines({ browser: 'Chrome', browserVersion: '127', os: 'macOS', viewport: '1280x800', locale: 'en-AU' })
    expect(lines.length).toBe(1)
    expect(lines[0]).toContain('Chrome 127')
    expect(lines[0]).toContain('macOS')
    expect(lines[0]).toContain('viewport 1280x800')
    expect(lines[0]).toContain('en-AU')
  })

  test('clientInfoLines is empty when nothing useful is present', () => {
    expect(clientInfoLines(null)).toEqual([])
    expect(clientInfoLines({})).toEqual([])
  })
})

describe('clientContextLines/Html skipIdentity (avoids double-rendering the reporter)', () => {
  const ctx = { userAgent: 'UA', identity: { email: 'a@b.com' }, metadata: { plan: 'pro' } }

  test('renders context.identity by default (back-compat)', () => {
    expect(clientContextLines(ctx).join('\n')).toContain('email: a@b.com')
    expect(clientContextHtml(ctx)).toContain('a@b.com')
  })

  test('skipIdentity omits context.identity but keeps metadata', () => {
    const lines = clientContextLines(ctx, { skipIdentity: true }).join('\n')
    expect(lines).not.toContain('email: a@b.com')
    expect(lines).toContain('plan: pro')
    const html = clientContextHtml(ctx, { skipIdentity: true })
    expect(html).not.toContain('a@b.com')
    expect(html).toContain('pro')
  })
})
