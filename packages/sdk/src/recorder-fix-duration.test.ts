// @vitest-environment jsdom
// KD-163: MediaRecorder WebM has no Duration in its header (video.duration === Infinity → broken seek bar,
// some players call the file corrupt). withFixedWebmDuration writes the known elapsed time into the header
// at stop time. FIXTURE is a real 2.6s clip recorded by headless Chromium's MediaRecorder (vp8, 96x64) —
// verified there: raw duration Infinity → 2.612 after patching, and seeking to 1.2s works.
import { describe, it, expect } from 'vitest'
import { withFixedWebmDuration } from './recorder'

const FIXTURE_B64 = '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'
const fixtureBytes = () => Uint8Array.from(atob(FIXTURE_B64), (c) => c.charCodeAt(0))
const readBytes = (blob: Blob) => new Promise<Uint8Array>((res, rej) => {
  const r = new FileReader()
  r.onload = () => res(new Uint8Array(r.result as ArrayBuffer))
  r.onerror = () => rej(r.error)
  r.readAsArrayBuffer(blob)
})
// EBML Duration element: id 0x4489, size 0x88 (8-byte float), then a big-endian double in ms.
function findDurationMs(bytes: Uint8Array): number | null {
  for (let i = 0; i < bytes.length - 11; i++) {
    if (bytes[i] === 0x44 && bytes[i + 1] === 0x89 && bytes[i + 2] === 0x88) {
      return new DataView(bytes.buffer, bytes.byteOffset + i + 3, 8).getFloat64(0, false)
    }
  }
  return null
}

describe('withFixedWebmDuration', () => {
  it('writes the elapsed time into the WebM header (raw MediaRecorder output has none)', async () => {
    const raw = new Blob([fixtureBytes()], { type: 'video/webm' })
    expect(findDurationMs(await readBytes(raw))).toBeNull()
    const fixed = await withFixedWebmDuration(raw, 2612)
    expect(fixed.type).toBe('video/webm')
    const ms = findDurationMs(await readBytes(fixed))
    expect(ms).not.toBeNull()
    expect(Math.round(ms as number)).toBe(2612)
  })

  it('leaves non-WebM recordings (Safari mp4) untouched — same blob back', async () => {
    const mp4 = new Blob([fixtureBytes()], { type: 'video/mp4' })
    expect(await withFixedWebmDuration(mp4, 2612)).toBe(mp4)
  })

  it('leaves the blob untouched when there is no usable duration', async () => {
    const raw = new Blob([fixtureBytes()], { type: 'video/webm' })
    expect(await withFixedWebmDuration(raw, 0)).toBe(raw)
    expect(await withFixedWebmDuration(raw, NaN)).toBe(raw)
  })

  it('never loses the recording: bytes that are not valid WebM come back unchanged', async () => {
    const junk = new Blob([new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])], { type: 'video/webm' })
    const out = await withFixedWebmDuration(junk, 1000)
    expect(out.size).toBeGreaterThan(0)
    expect(Array.from(await readBytes(out))).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })
})
