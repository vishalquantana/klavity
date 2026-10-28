import { describe, it, expect } from 'vitest'
import { patchWebmDuration, fixWebmDuration } from './webm-duration'

function createWebmFixture(opts: { unknownSegment?: boolean; withDuration?: number; withTimecodeScale?: boolean } = {}) {
  const ebmlHeader = new Uint8Array([
    0x1a, 0x45, 0xdf, 0xa3, // EBML
    0x97, // size 23
    0x42, 0x86, 0x81, 0x01, // EBMLVersion: 1
    0x42, 0xf7, 0x81, 0x01, // EBMLReadVersion: 1
    0x42, 0xf2, 0x81, 0x04, // EBMLMaxIDLength: 4
    0x42, 0xf3, 0x81, 0x08, // EBMLMaxSizeLength: 8
    0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d, // DocType: webm
  ])

  const infoParts: Uint8Array[] = []
  if (opts.withTimecodeScale !== false) {
    infoParts.push(new Uint8Array([0x2a, 0xd7, 0xb1, 0x83, 0x0f, 0x42, 0x40])) // TimecodeScale: 1,000,000
  }
  infoParts.push(new Uint8Array([0x4d, 0x80, 0x86, 0x43, 0x68, 0x72, 0x6f, 0x6d, 0x65])) // MuxingApp: Chrome
  if (opts.withDuration) {
    const fBuf = new ArrayBuffer(8)
    new DataView(fBuf).setFloat64(0, opts.withDuration, false)
    const dur = new Uint8Array(2 + 1 + 8)
    dur[0] = 0x44; dur[1] = 0x89; dur[2] = 0x88
    dur.set(new Uint8Array(fBuf), 3)
    infoParts.push(dur)
  }

  const infoContentLen = infoParts.reduce((a, b) => a + b.length, 0)
  const infoHeader = new Uint8Array([0x15, 0x49, 0xa9, 0x66, 0x80 | infoContentLen])
  const info = new Uint8Array(infoHeader.length + infoContentLen)
  info.set(infoHeader, 0)
  let iOff = infoHeader.length
  for (const part of infoParts) {
    info.set(part, iOff)
    iOff += part.length
  }

  const tracks = new Uint8Array([
    0x16, 0x54, 0xae, 0x6b, // Tracks
    0x85, // size 5
    0xae, 0x83, 0xd7, 0x81, 0x01,
  ])

  const cluster = new Uint8Array([
    0x1f, 0x43, 0xb6, 0x75, // Cluster
    0x88, // size 8
    0xe7, 0x81, 0x00,
    0xa3, 0x83, 0x81, 0x00, 0x00,
  ])

  const segContentLen = info.length + tracks.length + cluster.length
  let segmentHeader: Uint8Array
  if (opts.unknownSegment) {
    // 0x18 0x53 0x80 0x67 + 0x01ffffffffffffff
    segmentHeader = new Uint8Array([0x18, 0x53, 0x80, 0x67, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])
  } else {
    // 0x18 0x53 0x80 0x67 + 1-byte VINT
    segmentHeader = new Uint8Array([0x18, 0x53, 0x80, 0x67, 0x80 | segContentLen])
  }

  const totalLen = ebmlHeader.length + segmentHeader.length + segContentLen
  const res = new Uint8Array(totalLen)
  let off = 0
  res.set(ebmlHeader, off); off += ebmlHeader.length
  res.set(segmentHeader, off); off += segmentHeader.length
  res.set(info, off); off += info.length
  res.set(tracks, off); off += tracks.length
  res.set(cluster, off); off += cluster.length

  return res
}

function extractDuration(buf: Uint8Array): number | null {
  for (let i = 0; i < buf.length - 10; i++) {
    if (buf[i] === 0x44 && buf[i + 1] === 0x89 && buf[i + 2] === 0x88) {
      const view = new DataView(buf.buffer, buf.byteOffset + i + 3, 8)
      return view.getFloat64(0, false)
    }
  }
  return null
}

describe('webm-duration patchWebmDuration', () => {
  it('returns non-WebM or short buffers untouched', () => {
    const empty = new Uint8Array(0)
    expect(patchWebmDuration(empty, 5000)).toBe(empty)

    const random = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
    expect(patchWebmDuration(random, 5000)).toBe(random)
  })

  it('injects Duration into WebM with unknown-size Segment (Chrome MediaRecorder style)', () => {
    const raw = createWebmFixture({ unknownSegment: true })
    expect(extractDuration(raw)).toBeNull()

    const patched = patchWebmDuration(raw, 45200)
    expect(extractDuration(patched)).toBe(45200)
    expect(patched.length).toBeGreaterThan(raw.length)
  })

  it('injects Duration into WebM with known-size Segment and adjusts length', () => {
    const raw = createWebmFixture({ unknownSegment: false })
    expect(extractDuration(raw)).toBeNull()

    const patched = patchWebmDuration(raw, 12345)
    expect(extractDuration(patched)).toBe(12345)
  })

  it('updates Duration when Duration already exists in WebM', () => {
    const raw = createWebmFixture({ unknownSegment: true, withDuration: 1000 })
    expect(extractDuration(raw)).toBe(1000)

    const patched = patchWebmDuration(raw, 99000)
    expect(extractDuration(patched)).toBe(99000)
  })

  it('injects TimecodeScale if missing', () => {
    const raw = createWebmFixture({ unknownSegment: true, withTimecodeScale: false })
    const patched = patchWebmDuration(raw, 30000)
    expect(extractDuration(patched)).toBe(30000)
    // TimecodeScale ID 0x2A 0xD7 0xB1 should be present in patched
    let hasTc = false
    for (let i = 0; i < patched.length - 2; i++) {
      if (patched[i] === 0x2a && patched[i + 1] === 0xd7 && patched[i + 2] === 0xb1) {
        hasTc = true
        break
      }
    }
    expect(hasTc).toBe(true)
  })

  it('fixWebmDuration patches a Blob', async () => {
    const raw = createWebmFixture({ unknownSegment: true })
    const blob = new Blob([raw], { type: 'video/webm' })
    const fixed = await fixWebmDuration(blob, 15000)
    const fixedBuf = new Uint8Array(await fixed.arrayBuffer())
    expect(extractDuration(fixedBuf)).toBe(15000)
  })

  it('fixWebmDuration safely returns non-WebM blob unchanged', async () => {
    const blob = new Blob([new Uint8Array([0, 1, 2, 3])], { type: 'video/mp4' })
    const res = await fixWebmDuration(blob, 5000)
    expect(res.size).toBe(4)
  })
})
