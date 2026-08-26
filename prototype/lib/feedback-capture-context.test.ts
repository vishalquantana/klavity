// KLA-6 server-side: sanitizeClientContext + clientContextHtml/Lines with perfEntries.
//
// Tests the new perfEntries path added in feat/widget-console-network-capture (v0.39.189):
// the server sanitizes perf entries from the /api/feedback context payload, caps them at 50,
// coerces unknown types, and renders them into HTML (for Plane) and plain-text (for connectors).
//
// All tests are pure (no server, no DOM, no network).

import { test, expect, describe } from 'bun:test'
import { sanitizeClientContext, clientContextHtml, clientContextLines, buildLogAttachmentText } from './feedback'

// ─────────────────────────────────────────────────────────────────────────────
// sanitizeClientContext — perfEntries path
// ─────────────────────────────────────────────────────────────────────────────

describe('sanitizeClientContext — perfEntries', () => {
  test('preserves valid longtask entry', () => {
    const raw = {
      perfEntries: [{ type: 'longtask', name: 'longtask', startMs: 1700000200000, durationMs: 120 }],
    }
    const out = sanitizeClientContext(raw)
    expect(out.perfEntries).toHaveLength(1)
    expect(out.perfEntries[0]).toMatchObject({
      type: 'longtask',
      name: 'longtask',
      startMs: 1700000200000,
      durationMs: 120,
    })
    expect(out.perfEntries[0].initiatorType).toBeUndefined()
  })

  test('preserves paint entry (first-paint / first-contentful-paint)', () => {
    const raw = {
      perfEntries: [{ type: 'paint', name: 'first-contentful-paint', startMs: 1700000001500, durationMs: 0 }],
    }
    const out = sanitizeClientContext(raw)
    expect(out.perfEntries[0]).toMatchObject({ type: 'paint', name: 'first-contentful-paint', durationMs: 0 })
  })

  test('preserves resource entry with initiatorType', () => {
    const raw = {
      perfEntries: [{ type: 'resource', name: 'https://cdn.example.com/app.js', startMs: 1700000001000, durationMs: 210, initiatorType: 'script' }],
    }
    const out = sanitizeClientContext(raw)
    expect(out.perfEntries[0]).toMatchObject({ type: 'resource', initiatorType: 'script', durationMs: 210 })
  })

  test('unknown type is coerced to "resource" (allowlist guard)', () => {
    const raw = {
      perfEntries: [{ type: 'unknown-type-injection', name: 'x', startMs: 0, durationMs: 0 }],
    }
    const out = sanitizeClientContext(raw)
    expect(out.perfEntries[0].type).toBe('resource')
  })

  test('initiatorType is omitted when absent from the raw entry', () => {
    const raw = {
      perfEntries: [{ type: 'longtask', name: 'longtask', startMs: 0, durationMs: 80 }],
    }
    const out = sanitizeClientContext(raw)
    expect('initiatorType' in out.perfEntries[0]).toBe(false)
  })

  test('caps perfEntries at CTX_MAX_ENTRIES (50)', () => {
    const entries = Array.from({ length: 60 }, (_, i) => ({
      type: 'resource', name: `https://cdn.example.com/img${i}.png`, startMs: i * 1000, durationMs: 10, initiatorType: 'img',
    }))
    const out = sanitizeClientContext({ perfEntries: entries })
    expect(out.perfEntries).toHaveLength(50)
    // Slice preserves the first 50 (oldest) entries
    expect(out.perfEntries[0].name).toContain('img0')
    expect(out.perfEntries[49].name).toContain('img49')
  })

  test('numeric fields are coerced even when received as strings', () => {
    const raw = {
      perfEntries: [{ type: 'longtask', name: 'longtask', startMs: '1700000000', durationMs: '80' }],
    }
    const out = sanitizeClientContext(raw)
    expect(typeof out.perfEntries[0].startMs).toBe('number')
    expect(typeof out.perfEntries[0].durationMs).toBe('number')
    expect(out.perfEntries[0].durationMs).toBe(80)
  })

  test('returns null for null / non-object input', () => {
    expect(sanitizeClientContext(null)).toBeNull()
    expect(sanitizeClientContext(undefined)).toBeNull()
    expect(sanitizeClientContext('garbage')).toBeNull()
    expect(sanitizeClientContext(42)).toBeNull()
  })

  test('returns null for empty object', () => {
    expect(sanitizeClientContext({})).toBeNull()
  })

  test('perfEntries coexists with consoleErrors and networkFailures', () => {
    const raw = {
      userAgent: 'TestBrowser/1.0',
      consoleErrors: [{ message: 'oops', level: 'error', timestamp: 1 }],
      networkFailures: [{ url: 'https://api.example.com/fail', status: 500, method: 'GET', timestamp: 2 }],
      perfEntries: [{ type: 'paint', name: 'first-paint', startMs: 100, durationMs: 0 }],
    }
    const out = sanitizeClientContext(raw)
    expect(out.userAgent).toBe('TestBrowser/1.0')
    expect(out.consoleErrors).toHaveLength(1)
    expect(out.networkFailures).toHaveLength(1)
    expect(out.perfEntries).toHaveLength(1)
    expect(out.perfEntries[0].type).toBe('paint')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// KLA-582: perfEntries no longer render into the ticket BODY (html/text). The body
// stays clean; the perf/console/network capture now travels in the log-file attachment.
// ─────────────────────────────────────────────────────────────────────────────

describe('clientContextHtml/Lines — perfEntries stay OUT of the body (KLA-582)', () => {
  const ctx = {
    userAgent: 'Mozilla/5.0',
    perfEntries: [
      { type: 'longtask', name: 'longtask', startMs: 1700000000100, durationMs: 95 },
      { type: 'resource', name: 'https://cdn.example.com/logo.png', startMs: 1700000000200, durationMs: 32, initiatorType: 'img' },
    ],
  }

  test('html body omits the Performance dump but keeps browser', () => {
    const html = clientContextHtml(ctx)
    expect(html).toContain('Mozilla/5.0')
    expect(html).not.toContain('Performance')
    expect(html).not.toContain('logo.png')
  })

  test('text body omits the Performance dump but keeps browser', () => {
    const lines = clientContextLines(ctx).join('\n')
    expect(lines).toContain('Browser: Mozilla/5.0')
    expect(lines).not.toContain('Performance')
    expect(lines).not.toContain('logo.png')
  })

  test('empty renderers on null ctx (back-compat)', () => {
    expect(clientContextHtml(null)).toBe('')
    expect(clientContextHtml(undefined)).toBe('')
    expect(clientContextLines(null)).toEqual([])
    expect(clientContextLines(undefined)).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// buildLogAttachmentText — perfEntries (+ console/network) render into the FILE
// ─────────────────────────────────────────────────────────────────────────────

describe('buildLogAttachmentText — perfEntries in the log file', () => {
  test('serializes a Performance section with type, initiatorType, name, duration', () => {
    const ctx = {
      perfEntries: [
        { type: 'longtask', name: 'longtask', startMs: 0, durationMs: 110 },
        { type: 'resource', name: 'https://cdn.example.com/font.woff2', startMs: 0, durationMs: 67, initiatorType: 'other' },
      ],
    }
    const txt = buildLogAttachmentText(ctx)!
    expect(txt).toContain('=== Performance (2) ===')
    const longtaskLine = txt.split('\n').find(l => l.includes('[longtask]'))
    expect(longtaskLine).toBeTruthy()
    expect(longtaskLine).toContain('110ms')
    const resourceLine = txt.split('\n').find(l => l.includes('font.woff2'))
    expect(resourceLine).toContain('[other]')
    expect(resourceLine).toContain('67ms')
  })

  test('omits duration suffix when durationMs is 0', () => {
    const txt = buildLogAttachmentText({ perfEntries: [{ type: 'paint', name: 'first-contentful-paint', startMs: 0, durationMs: 0 }] })!
    const paintLine = txt.split('\n').find(l => l.includes('first-contentful-paint'))
    expect(paintLine).not.toContain('ms')
  })

  test('null when there is nothing to attach', () => {
    expect(buildLogAttachmentText(null)).toBe(null)
    expect(buildLogAttachmentText({ userAgent: 'x' })).toBe(null)
  })

  test('full sanitize → buildLogAttachmentText pipeline round-trip', () => {
    const rawContext = {
      userAgent: 'Chrome/125',
      perfEntries: [
        { type: 'longtask', name: 'longtask', startMs: 1700000001000, durationMs: 87 },
        { type: 'paint', name: 'first-paint', startMs: 1700000000400, durationMs: 0 },
        { type: 'resource', name: 'https://cdn.example.com/bundle.js', startMs: 1700000000600, durationMs: 180, initiatorType: 'script' },
      ],
    }
    const txt = buildLogAttachmentText(sanitizeClientContext(rawContext))!
    expect(txt).toContain('=== Performance (3) ===')
    expect(txt).toContain('Browser: Chrome/125')
    const lines = txt.split('\n')
    expect(lines.some(l => l.includes('[longtask]') && l.includes('87ms'))).toBe(true)
    expect(lines.some(l => l.includes('[paint]') && l.includes('first-paint'))).toBe(true)
    expect(lines.some(l => l.includes('[script]') && l.includes('bundle.js') && l.includes('180ms'))).toBe(true)
  })
})
