// Security / privacy tests for capture-data storage:
// (a) URL query-param redaction in networkFailures (SENSITIVE_PARAM_NAMES / redactSensitiveParams)
// (b) sanitizeClientContext wires redaction into stored networkFailures
// (c) pruneOldFeedbackReplays retention function (project-scoped, returns deleted count)
//
// All pure unit tests — no server process, no network.

import { test, expect, describe } from 'bun:test'
import { redactSensitiveParams, redactSensitiveUrlsInText, sanitizeClientContext, SENSITIVE_PARAM_NAMES, buildLogAttachmentText } from './feedback'

// ── (a) redactSensitiveParams ─────────────────────────────────────────────────

describe('redactSensitiveParams', () => {
  test('replaces known sensitive param value with [REDACTED]', () => {
    const url = 'https://api.stripe.com/v1/charges?api_key=sk_live_secret123&limit=10'
    const out = redactSensitiveParams(url)
    expect(out).not.toContain('sk_live_secret123')
    expect(out).toContain('REDACTED')
    expect(out).toContain('limit=10')   // non-sensitive param preserved
  })

  test('redacts all SENSITIVE_PARAM_NAMES variants', () => {
    for (const name of SENSITIVE_PARAM_NAMES) {
      const url = `https://example.com/api?${name}=supersecret&safe=yes`
      const out = redactSensitiveParams(url)
      expect(out).not.toContain('supersecret')
      expect(out).toContain('REDACTED')
      expect(out).toContain('safe=yes')
    }
  })

  test('is case-insensitive on param name (TOKEN vs token)', () => {
    const url = 'https://app.example.com/data?TOKEN=abc123'
    const out = redactSensitiveParams(url)
    expect(out).not.toContain('abc123')
    expect(out).toContain('REDACTED')
  })

  test('leaves URLs with no sensitive params unchanged', () => {
    const url = 'https://api.example.com/v1/items?page=2&limit=20&sort=created_at'
    expect(redactSensitiveParams(url)).toBe(url)
  })

  test('handles multiple sensitive params in one URL', () => {
    const url = 'https://svc.io/q?token=tok_abc&api_key=key_xyz&page=1'
    const out = redactSensitiveParams(url)
    expect(out).not.toContain('tok_abc')
    expect(out).not.toContain('key_xyz')
    expect(out).toContain('page=1')
  })

  test('returns relative/unparseable URLs unchanged (no crash)', () => {
    expect(redactSensitiveParams('/relative/path?token=x')).toBe('/relative/path?token=x')
    expect(redactSensitiveParams('')).toBe('')
    expect(redactSensitiveParams('not a url at all')).toBe('not a url at all')
  })

  test('handles URL with no query string', () => {
    const url = 'https://example.com/api/v1/items'
    expect(redactSensitiveParams(url)).toBe(url)
  })

  test('keeps hash fragment intact (URL constructor preserves it)', () => {
    const url = 'https://example.com/path?api_key=secret#section'
    const out = redactSensitiveParams(url)
    expect(out).not.toContain('secret')
    expect(out).toContain('#section')
  })
})

// ── (b) sanitizeClientContext redacts networkFailure URLs ─────────────────────

describe('sanitizeClientContext — networkFailures URL redaction', () => {
  test('strips api_key from networkFailure URL before storage', () => {
    const raw = {
      networkFailures: [{
        url: 'https://api.stripe.com/v1/charges?api_key=sk_live_XXX&amount=100',
        status: 401, method: 'GET', timestamp: 1700000000000,
      }],
    }
    const out = sanitizeClientContext(raw)
    const stored = out.networkFailures[0].url
    expect(stored).not.toContain('sk_live_XXX')
    expect(stored).toContain('REDACTED')
    expect(stored).toContain('amount=100')   // safe param preserved
  })

  test('strips access_token from networkFailure URL', () => {
    const raw = {
      networkFailures: [{
        url: 'https://graph.facebook.com/me?access_token=EAABsb&fields=id',
        status: 200, method: 'GET', timestamp: 0,
      }],
    }
    const out = sanitizeClientContext(raw)
    expect(out.networkFailures[0].url).not.toContain('EAABsb')
    expect(out.networkFailures[0].url).toContain('REDACTED')
    expect(out.networkFailures[0].url).toContain('fields=id')
  })

  test('networkFailure URL with no sensitive params stored verbatim', () => {
    const raw = {
      networkFailures: [{
        url: 'https://api.example.com/v1/orders?page=1&limit=20',
        status: 500, method: 'POST', timestamp: 0,
      }],
    }
    const out = sanitizeClientContext(raw)
    expect(out.networkFailures[0].url).toBe('https://api.example.com/v1/orders?page=1&limit=20')
  })

  test('non-absolute URLs pass through unchanged (relative cannot carry structured params)', () => {
    const raw = {
      networkFailures: [{
        url: '/api/internal?token=x',   // relative — URL parser would fail
        status: 403, method: 'GET', timestamp: 0,
      }],
    }
    const out = sanitizeClientContext(raw)
    // Should not throw; url is returned as-is since it's not parseable by URL()
    expect(out.networkFailures[0].url).toBe('/api/internal?token=x')
  })

  test('does not expose clientContext fields not explicitly allow-listed', () => {
    const raw = {
      clientSecret: 'SHOULD_NOT_APPEAR',
      consoleErrors: [],
      networkFailures: [],
    }
    const out = sanitizeClientContext(raw)
    // clientSecret is not in the allow-list — it must be absent
    expect(JSON.stringify(out)).not.toContain('SHOULD_NOT_APPEAR')
    expect(out.clientSecret).toBeUndefined()
  })
})

// ── (b2) KLA-582: console message/stack URL redaction ─────────────────────────
// Console error stacks routinely embed full request URLs including ?token=…/?api_key=…. Before
// KLA-582 the log-file attachment shipped the raw stack verbatim to external trackers. Redaction
// now applies to consoleErrors[].message + .stack at intake AND in the attachment builder.

describe('redactSensitiveUrlsInText', () => {
  test('redacts a sensitive param embedded in free text, preserves the rest', () => {
    const out = redactSensitiveUrlsInText('failed GET https://x.com/a?token=SECRET&id=7 (500)')
    expect(out).not.toContain('SECRET')
    expect(out).toContain('REDACTED')
    expect(out).toContain('id=7')
    expect(out).toContain('failed GET')
  })

  test('leaves URL-free text untouched', () => {
    expect(redactSensitiveUrlsInText('TypeError: cannot read x of undefined')).toBe('TypeError: cannot read x of undefined')
  })

  test('redacts URL inside a parenthesised stack frame without eating error text', () => {
    const stack = 'Error: boom\n    at fetchThing (https://api.co/v1?api_key=LIVEKEY)'
    const out = redactSensitiveUrlsInText(stack)
    expect(out).not.toContain('LIVEKEY')
    expect(out).toContain('REDACTED')
    expect(out).toContain('at fetchThing')
    expect(out).toContain('Error: boom')
  })
})

describe('KLA-582 — console error stack redaction (stored ctx + attachment)', () => {
  test('token in console stack is redacted in stored ctx AND in buildLogAttachmentText output', () => {
    const raw = {
      pageUrl: 'https://app.example.com/dash',
      consoleErrors: [{
        level: 'error',
        message: 'Request failed: https://x.com/a?token=SECRET',
        stack: 'Error: Request failed\n    at doFetch (https://x.com/a?token=SECRET:12:9)',
        timestamp: 1700000000000,
      }],
    }
    const out = sanitizeClientContext(raw)
    // (1) stored ctx is redacted
    const storedJson = JSON.stringify(out.consoleErrors)
    expect(storedJson).not.toContain('SECRET')
    expect(storedJson).toContain('REDACTED')
    // (2) the log-file attachment built from stored ctx is redacted
    const attachment = buildLogAttachmentText(out)!
    expect(attachment).not.toContain('SECRET')
    expect(attachment).toContain('REDACTED')
    // error text / frame preserved
    expect(attachment).toContain('doFetch')
  })

  test('buildLogAttachmentText redacts even when handed a RAW (unsanitized) ctx', () => {
    const rawCtx = {
      consoleErrors: [{
        level: 'error',
        message: 'boom',
        stack: 'at f (https://y.io/z?password=hunter2)',
        timestamp: 0,
      }],
    }
    const attachment = buildLogAttachmentText(rawCtx)!
    expect(attachment).not.toContain('hunter2')
    expect(attachment).toContain('REDACTED')
  })
})

// ── (c) pruneOldFeedbackReplays ───────────────────────────────────────────────
// Pure logic test: verify the function exists with the correct signature and
// that REPLAY_RETAIN_MS matches the documented 90-day policy.

import { pruneOldFeedbackReplays, REPLAY_RETAIN_MS } from './feedback-replay'

describe('pruneOldFeedbackReplays', () => {
  test('REPLAY_RETAIN_MS equals 90 days in ms', () => {
    expect(REPLAY_RETAIN_MS).toBe(90 * 24 * 60 * 60 * 1000)
  })

  test('function is exported and accepts (projectId, maxAgeMs) signature', () => {
    // Verify it's callable — the DB call will fail without a real DB but the
    // function reference and arity are what we're confirming here.
    expect(typeof pruneOldFeedbackReplays).toBe('function')
    expect(pruneOldFeedbackReplays.length).toBe(1)   // projectId required; maxAgeMs has a default
  })
})
