// @vitest-environment jsdom
// BugHerd Sub-project A / Task 5 — passive client-error auto-ticketing (SDK side).
//
// installErrorReporter wires uncaught errors, unhandledrejection, console.error, and
// 5xx/0 network failures into a single beacon path (navigator.sendBeacon, with a fetch
// fallback), deduping repeats of the same signature within one page session so a chatty
// error loop cannot spam the backend.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { installErrorReporter, _resetForTest } from './error-reporter'
import type { CaptureBuffers } from '@klavity/core/capture'

function makeBuf(): CaptureBuffers {
  return { consoleErrors: [], networkFailures: [] }
}

let _sendBeacon: any

beforeEach(() => {
  _resetForTest()
  _sendBeacon = (navigator as any).sendBeacon
})

afterEach(() => {
  ;(navigator as any).sendBeacon = _sendBeacon
  _resetForTest()
})

describe('installErrorReporter — dedup + beacon', () => {
  it('beacons the first occurrence of a signature, dedupes repeats in-session', () => {
    const sent: any[] = []
    ;(navigator as any).sendBeacon = (url: string, body: string) => {
      sent.push({ url, payload: JSON.parse(body) })
      return true
    }

    installErrorReporter({
      backendUrl: 'https://k',
      projectId: 'p',
      enabled: true,
      buffers: makeBuf(),
      contextSnapshot: () => ({ pageUrl: 'https://x/y' }),
    })

    window.dispatchEvent(new ErrorEvent('error', { message: 'boom', error: new Error('boom') }))
    window.dispatchEvent(new ErrorEvent('error', { message: 'boom', error: new Error('boom') }))

    expect(sent.length).toBe(1)
    expect(sent[0].url).toBe('https://k/api/errors')
    expect(sent[0].payload.projectId).toBe('p')
    expect(sent[0].payload.errors[0].kind).toBe('error')
    expect(sent[0].payload.errors[0].message).toContain('boom')
    expect(typeof sent[0].payload.errors[0].pageUrl).toBe('string')
    expect(sent[0].payload.context).toEqual({ pageUrl: 'https://x/y' })
  })

  it('is a no-op when enabled:false', () => {
    const sent: any[] = []
    ;(navigator as any).sendBeacon = (url: string, body: string) => {
      sent.push(JSON.parse(body))
      return true
    }

    installErrorReporter({
      backendUrl: 'https://k',
      projectId: 'p',
      enabled: false,
      buffers: makeBuf(),
      contextSnapshot: () => ({}),
    })

    window.dispatchEvent(new ErrorEvent('error', { message: 'boom', error: new Error('boom') }))
    console.error('should not beacon')

    expect(sent.length).toBe(0)
  })

  it('captures console.error and 5xx/0 network but not 4xx', async () => {
    const sent: any[] = []
    ;(navigator as any).sendBeacon = (url: string, body: string) => {
      sent.push(JSON.parse(body))
      return true
    }
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ status: 500 } as Response)
        .mockResolvedValueOnce({ status: 404 } as Response)
        .mockRejectedValueOnce(new TypeError('Failed to fetch')),
    )

    installErrorReporter({
      backendUrl: 'https://k',
      projectId: 'p',
      enabled: true,
      buffers: makeBuf(),
      contextSnapshot: () => ({}),
    })

    console.error('console boom')
    await window.fetch('https://api.example.com/a') // 500 -> beacon
    await window.fetch('https://api.example.com/b') // 404 -> no beacon
    await window.fetch('https://api.example.com/c').catch(() => {}) // rejects -> status 0 -> beacon

    vi.unstubAllGlobals()

    const kinds = sent.map((s) => s.errors[0].kind)
    expect(kinds).toContain('console.error')
    expect(kinds.filter((k) => k === 'network').length).toBe(2)
    // 404 must never appear
    expect(sent.some((s) => s.errors[0].status === 404)).toBe(false)
  })
})
