import { describe, it, expect, vi, afterEach } from 'vitest'
import { friendlyRef, refFromPrettyUrl, blobToDataUrl, BLOB_READ_TIMEOUT_MS } from '../src/modal'

const FB = 'fb_1a2b3c4d-5e6f-4a81-9203-a4b5c6d7e8f9'

describe('KLA-766 friendlyRef / refFromPrettyUrl', () => {
  it('extracts the friendly KEY-<n> from the server pretty permalink', () => {
    expect(refFromPrettyUrl('https://klavity.in/quantana/KLA-142')).toBe('KLA-142')
    expect(refFromPrettyUrl('https://klavity.in/acme-inc/SIM-1520')).toBe('SIM-1520')
  })

  it('returns "" for the opaque /t/<id> fallback, a bare dashboard link, and a non-http scheme', () => {
    expect(refFromPrettyUrl('https://klavity.in/t/' + FB)).toBe('')
    expect(refFromPrettyUrl('https://klavity.in/quantana/t/' + FB)).toBe('')
    expect(refFromPrettyUrl('https://klavity.in/dashboard?project=proj_x#tickets')).toBe('')
    // eslint-disable-next-line no-script-url
    expect(refFromPrettyUrl('javascript:alert(1)')).toBe('')
    expect(refFromPrettyUrl('')).toBe('')
    expect(refFromPrettyUrl(null)).toBe('')
    expect(refFromPrettyUrl('not a url')).toBe('')
  })

  it('friendlyRef prefers the deep-link key, else shortens fb_, else passes a tracker key through', () => {
    // Server gave a friendly key in the URL → use it, never the fb_ id.
    expect(friendlyRef(FB, 'https://klavity.in/quantana/KLA-142')).toBe('KLA-142')
    // No friendly key in the URL → shorten the fb_ id (quotable) as the fallback.
    expect(friendlyRef(FB, 'https://klavity.in/t/' + FB)).toBe('fb_1a2b3c4d')
    expect(friendlyRef(FB, '')).toBe('fb_1a2b3c4d')
    // A real tracker key passed straight through (no URL) stays unshortened.
    expect(friendlyRef('KLAV-123', '')).toBe('KLAV-123')
    // Never invent a ref the server didn't return: a bogus URL falls back to the id, not a guess.
    expect(friendlyRef(FB, 'https://evil.example/whatever')).toBe('fb_1a2b3c4d')
  })
})

// ── KLA-763 stuck-upload: blobToDataUrl ALWAYS terminates ──────────────────────────────────────────
// Stub a controllable FileReader (node has no FileReader) so we can drive load / error / abort / stall.
class FakeReader {
  static instances: FakeReader[] = []
  onload: null | (() => void) = null
  onerror: null | (() => void) = null
  onabort: null | (() => void) = null
  result: string | null = null
  error: any = null
  aborted = false
  readAsDataURL(_blob: Blob) { FakeReader.instances.push(this) /* never auto-fires: the test drives it */ }
  abort() { this.aborted = true; this.onabort?.() }
  // helpers
  fireLoad(v: string) { this.result = v; this.onload?.() }
  fireError(e: any) { this.error = e; this.onerror?.() }
}

describe('KLA-763 blobToDataUrl always terminates', () => {
  const realFR = (globalThis as any).FileReader
  afterEach(() => {
    ;(globalThis as any).FileReader = realFR
    FakeReader.instances = []
    vi.useRealTimers()
  })
  function installFake() {
    FakeReader.instances = []
    ;(globalThis as any).FileReader = FakeReader as any
    return () => FakeReader.instances[FakeReader.instances.length - 1]
  }

  it('resolves on a normal read', async () => {
    const last = installFake()
    const p = blobToDataUrl(new Blob(['x']))
    last().fireLoad('data:image/png;base64,AAAA')
    await expect(p).resolves.toBe('data:image/png;base64,AAAA')
  })

  it('rejects on a read error', async () => {
    const last = installFake()
    const p = blobToDataUrl(new Blob(['x']))
    last().fireError(new Error('boom'))
    await expect(p).rejects.toThrow('boom')
  })

  it('rejects (does not hang) when the reader stalls past the timeout', async () => {
    vi.useFakeTimers()
    installFake()
    const p = blobToDataUrl(new Blob(['x']))
    const settled = p.then(() => 'ok', () => 'rejected')
    await vi.advanceTimersByTimeAsync(BLOB_READ_TIMEOUT_MS + 10)
    await expect(settled).resolves.toBe('rejected')
    await expect(p).rejects.toThrow('timed out')
  })

  it('a late onload AFTER the timeout is ignored (no double-settle, promise stays rejected)', async () => {
    vi.useFakeTimers()
    const last = installFake()
    const p = blobToDataUrl(new Blob(['x']))
    const outcome = p.then(() => 'resolved', () => 'rejected')
    await vi.advanceTimersByTimeAsync(BLOB_READ_TIMEOUT_MS + 10)
    // The stalled reader "completes" late — must NOT flip the already-rejected promise.
    last().fireLoad('data:image/png;base64,LATE')
    await expect(outcome).resolves.toBe('rejected')
  })

  it('clears its timer when the read finishes on its own (no stray late rejection)', async () => {
    vi.useFakeTimers()
    const last = installFake()
    const p = blobToDataUrl(new Blob(['x']))
    last().fireLoad('data:ok')
    await expect(p).resolves.toBe('data:ok')
    // Advancing well past the timeout must not throw / re-settle (timer was cleared).
    await vi.advanceTimersByTimeAsync(BLOB_READ_TIMEOUT_MS + 1000)
    await expect(p).resolves.toBe('data:ok')
  })
})
