// BugHerd Sub-project A / Task 5 — passive client-error reporter (SDK side).
//
// Watches for uncaught errors, unhandled promise rejections, console.error calls, and
// 5xx/0 network responses, then beacons each *new* one to POST /api/errors so the backend
// can auto-file a ticket. Dedup here is purely a client-side courtesy — a bounded, in-session
// `Set` of client-computed signatures stops one page from hammering the endpoint with the
// same recurring error; the server recomputes its own authoritative signature for real
// dedup/grouping.
//
// Reuses @klavity/core/capture's `installCapture` for the uncaught-error / unhandledrejection
// wiring (via its `onError` hook) rather than re-wrapping window.onerror itself, and
// `contextSnapshot` (typically capture-context.ts's `buildCaptureContext`) for the payload's
// `context` field.

import { installCapture, type CaptureBuffers } from '@klavity/core/capture'

const MAX_MSG_LEN = 500

export type ClientErrorKind = 'error' | 'unhandledrejection' | 'console.error' | 'network'

export interface ClientError {
  kind: ClientErrorKind
  message: string
  stack?: string
  pageUrl: string
  selector?: string
  status?: number
}

export interface InstallErrorReporterOptions {
  backendUrl: string
  projectId: string
  enabled: boolean
  buffers: CaptureBuffers
  contextSnapshot: () => any
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max) + '…[truncated]'
}

// Normalize a message for signature purposes: collapse whitespace, drop obvious volatile
// bits (numbers) that would otherwise make near-identical errors look distinct.
function normalizeMessage(message: string): string {
  return String(message || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\d+/g, '#')
    .slice(0, 200)
}

// First non-empty frame of a stack trace, used as a coarse "where" signal. Line/column numbers
// are stripped so two throws of the "same" error from slightly different call sites (or from
// the same line re-executed, e.g. minified builds shifting) still collapse to one signature.
function topFrame(stack?: string): string {
  if (!stack) return ''
  const lines = stack.split('\n').map((l) => l.trim()).filter(Boolean)
  // Skip the leading "Error: message" line when present.
  const frame = lines.find((l) => l !== lines[0] || lines.length === 1) ?? lines[0] ?? ''
  return frame.replace(/:\d+:\d+\)?$/, '').slice(0, 200)
}

function pathnameOf(url: string): string {
  try {
    return new URL(url, typeof location !== 'undefined' ? location.href : 'http://localhost').pathname
  } catch {
    return url
  }
}

function computeSignature(e: ClientError): string {
  return [e.kind, normalizeMessage(e.message), topFrame(e.stack), pathnameOf(e.pageUrl)].join('|')
}

function sendBeaconOrFetch(url: string, body: string): void {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined
  if (nav && typeof nav.sendBeacon === 'function') {
    try {
      if (nav.sendBeacon(url, body)) return
    } catch {
      // fall through to fetch
    }
  }
  if (typeof fetch === 'function') {
    fetch(url, {
      method: 'POST',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body,
    }).catch(() => { /* best-effort — never throw from the error reporter itself */ })
  }
}

// Module-level bookkeeping so `_resetForTest` (below) can fully uninstall: remove the exact
// listener functions and restore console.error / fetch / XHR to their pre-install originals.
// Real pages only ever install once, so this bookkeeping only matters for test isolation.
let _errorListener: ((e: ErrorEvent) => void) | undefined
let _rejectionListener: ((e: PromiseRejectionEvent) => void) | undefined
let _origConsoleError: typeof console.error | undefined
let _origFetch: typeof window.fetch | undefined
let _origXHROpen: any
let _origXHRSend: any

// Install the passive error reporter. No-op immediately when `enabled` is false. Idempotent —
// a second call is a no-op so multiple report surfaces on one page don't double-beacon.
export function installErrorReporter(opts: InstallErrorReporterOptions): void {
  if (!opts.enabled) return
  if (typeof window === 'undefined') return
  const w = window as unknown as { __klavityErrorReporterInstalled?: boolean }
  if (w.__klavityErrorReporterInstalled) return
  w.__klavityErrorReporterInstalled = true

  const seen = new Set<string>()
  const endpoint = opts.backendUrl.replace(/\/+$/, '') + '/api/errors'

  const beacon = (partial: Omit<ClientError, 'pageUrl'> & { pageUrl?: string }) => {
    const e: ClientError = {
      kind: partial.kind,
      message: truncate(String(partial.message ?? ''), MAX_MSG_LEN),
      stack: partial.stack ? truncate(partial.stack, MAX_MSG_LEN) : undefined,
      pageUrl: partial.pageUrl ?? window.location.href,
      selector: partial.selector,
      status: partial.status,
    }
    const sig = computeSignature(e)
    if (seen.has(sig)) return
    seen.add(sig)

    const payload = JSON.stringify({
      projectId: opts.projectId,
      errors: [e],
      context: opts.contextSnapshot(),
    })
    sendBeaconOrFetch(endpoint, payload)
  }

  // ── uncaught errors + unhandledrejection ──
  // installCapture is idempotent per-window: when another report surface (widget/extension)
  // already installed it first, our `onError` callback here is silently dropped (the earlier
  // install wins). So we also listen directly via addEventListener below, which always works
  // regardless of install order — the in-session dedup Set means any error caught by both
  // paths in a real browser still only beacons once.
  installCapture(opts.buffers, {
    onError: (message, stack) => {
      beacon({ kind: 'error', message, stack })
    },
  })
  _errorListener = (e: ErrorEvent) => {
    const message = e.message || e.error?.message || 'Unknown error'
    beacon({ kind: 'error', message, stack: e.error?.stack })
  }
  _rejectionListener = (e: PromiseRejectionEvent) => {
    const reason = e.reason
    const message = String(reason?.message ?? reason)
    beacon({ kind: 'unhandledrejection', message, stack: reason?.stack })
  }
  window.addEventListener('error', _errorListener)
  window.addEventListener('unhandledrejection', _rejectionListener)

  // ── console.error ──
  const origConsoleError = console.error
  _origConsoleError = origConsoleError
  console.error = (...args: any[]) => {
    try {
      const message = args
        .map((a) => (typeof a === 'string' ? a : a instanceof Error ? a.message : String(a)))
        .join(' ')
      beacon({ kind: 'console.error', message, stack: args.find((a) => a instanceof Error)?.stack })
    } catch {
      // never break console.error
    }
    return origConsoleError.apply(console, args)
  }

  // ── fetch: beacon on status >= 500 or status === 0 (network-level failure) ──
  const origFetch = window.fetch
  _origFetch = origFetch
  if (origFetch) {
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof URL ? args[0].href : (args[0] as Request).url
      try {
        const res = await origFetch.apply(window, args)
        if (res.status >= 500 || res.status === 0) {
          beacon({ kind: 'network', message: `${res.status || 0} ${url}`, status: res.status })
        }
        return res
      } catch (err) {
        beacon({ kind: 'network', message: `0 ${url}`, status: 0 })
        throw err
      }
    }
  }

  // ── XMLHttpRequest: beacon on status >= 500 or status === 0 ──
  const XHR = (window as any).XMLHttpRequest
  if (XHR && XHR.prototype) {
    const origOpen = XHR.prototype.open
    const origSend = XHR.prototype.send
    _origXHROpen = origOpen
    _origXHRSend = origSend
    XHR.prototype.open = function (this: any, method: string, url: string, ...rest: any[]) {
      this.__klavErrReporter = { url: String(url || '') }
      return origOpen.call(this, method, url, ...rest)
    }
    XHR.prototype.send = function (this: any, ...sendArgs: any[]) {
      const meta = this.__klavErrReporter
      if (meta) {
        this.addEventListener('loadend', () => {
          try {
            const status = Number(this.status) || 0
            if (status >= 500 || status === 0) {
              beacon({ kind: 'network', message: `${status} ${meta.url}`, status })
            }
          } catch {
            // ignore
          }
        })
      }
      return origSend.apply(this, sendArgs)
    }
  }
}

// Test-only: fully uninstall (remove listeners, restore console.error/fetch/XHR) and clear the
// install guard so a fresh `installErrorReporter` call in the next test starts clean. Real pages
// never call this — they install once for the page's lifetime.
export function _resetForTest(): void {
  if (typeof window === 'undefined') return
  if (_errorListener) window.removeEventListener('error', _errorListener)
  if (_rejectionListener) window.removeEventListener('unhandledrejection', _rejectionListener)
  if (_origConsoleError) console.error = _origConsoleError
  if (_origFetch) window.fetch = _origFetch
  const XHR = (window as any).XMLHttpRequest
  if (XHR && XHR.prototype) {
    if (_origXHROpen) XHR.prototype.open = _origXHROpen
    if (_origXHRSend) XHR.prototype.send = _origXHRSend
  }
  _errorListener = undefined
  _rejectionListener = undefined
  _origConsoleError = undefined
  _origFetch = undefined
  _origXHROpen = undefined
  _origXHRSend = undefined
  delete (window as any).__klavityErrorReporterInstalled
  delete (window as any).__klavityCaptureInstalled
}
