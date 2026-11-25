// ── WebM Duration Fixer (EBML Duration Injector) ──────────────────────────────────────────────────────
// Chromium's MediaRecorder writes streaming WebM without a Duration element in the Info segment.
// This causes:
//   1. Downloaded .webm files appear corrupted or unseekable in standard media players (VLC, Windows Media Player).
//   2. Browser HTML5 <video> elements report duration === Infinity and cannot seek accurately.
//   3. In dashboard players, seeking past Infinity on remote HTTP/S3 URLs causes HTTP 416 errors and breaks playback.
//
// This module inspects the EBML container, parses the Segment -> Info element, and injects/updates
// TimecodeScale and Duration (Float64) so the WebM container is valid, playable, and seekable.

function readVint(buf: Uint8Array, offset: number): { width: number; value: number; rawId: number } | null {
  if (offset >= buf.length) return null
  const firstByte = buf[offset]
  let width = 0
  for (let bit = 7; bit >= 0; bit--) {
    if ((firstByte & (1 << bit)) !== 0) {
      width = 8 - bit
      break
    }
  }
  if (width === 0 || offset + width > buf.length) return null

  let val = firstByte & ((1 << (8 - width)) - 1)
  for (let i = 1; i < width; i++) {
    val = (val * 256) + buf[offset + i]
  }

  let rawId = 0
  for (let i = 0; i < width; i++) {
    rawId = (rawId * 256) + buf[offset + i]
  }

  return { width, value: val, rawId }
}

function encodeVint(val: number, fixedWidth = 0): Uint8Array {
  let width = fixedWidth
  if (!width) {
    for (let w = 1; w <= 8; w++) {
      const max = (1 << (7 * w)) - 2
      if (val <= max) {
        width = w
        break
      }
    }
  }
  if (!width) width = 8
  const res = new Uint8Array(width)
  let v = val
  for (let i = width - 1; i > 0; i--) {
    res[i] = v & 0xff
    v = Math.floor(v / 256)
  }
  res[0] = (v & 0xff) | (1 << (8 - width))
  return res
}

function encodeFloat64(val: number): Uint8Array {
  const buf = new ArrayBuffer(8)
  new DataView(buf).setFloat64(0, val, false)
  return new Uint8Array(buf)
}

function readFloat64(buf: Uint8Array, offset: number): number {
  const view = new DataView(buf.buffer, buf.byteOffset + offset, 8)
  return view.getFloat64(0, false)
}

function readFloat32(buf: Uint8Array, offset: number): number {
  const view = new DataView(buf.buffer, buf.byteOffset + offset, 4)
  return view.getFloat32(0, false)
}

/**
 * Injects or updates Duration and TimecodeScale in a WebM byte buffer.
 * Returns the patched buffer, or the original buffer if the input is not a WebM file.
 */
export function patchWebmDuration(buf: Uint8Array, durationMs: number): Uint8Array {
  if (!(buf instanceof Uint8Array)) buf = new Uint8Array(buf)
  if (buf.length < 16 || durationMs <= 0) return buf

  // Check EBML Header ID: 0x1A 0x45 0xDF 0xA3
  if (buf[0] !== 0x1a || buf[1] !== 0x45 || buf[2] !== 0xdf || buf[3] !== 0xa3) {
    return buf
  }

  const ebmlId = readVint(buf, 0)
  if (!ebmlId) return buf
  const ebmlSize = readVint(buf, ebmlId.width)
  if (!ebmlSize) return buf

  const segmentStart = ebmlId.width + ebmlSize.width + ebmlSize.value
  if (segmentStart >= buf.length) return buf

  // Check Segment ID: 0x18 0x53 0x80 0x67
  const segId = readVint(buf, segmentStart)
  if (!segId || segId.rawId !== 0x18538067) return buf

  const segSize = readVint(buf, segmentStart + segId.width)
  if (!segSize) return buf

  const segContentStart = segmentStart + segId.width + segSize.width
  let pos = segContentStart
  const isSegUnknown = (segSize.width === 8 && segSize.value === 0x00ffffffffffffff)
  const segEnd = isSegUnknown ? buf.length : Math.min(buf.length, segContentStart + segSize.value)

  // Scan for Info element: 0x15 0x49 0xA9 0x66
  let infoStart = -1
  let infoSize: { width: number; value: number; rawId: number } | null = null
  let infoHeaderLen = 0

  while (pos < segEnd) {
    const elId = readVint(buf, pos)
    if (!elId) break
    const elSize = readVint(buf, pos + elId.width)
    if (!elSize) break

    if (elId.rawId === 0x1549a966) {
      infoStart = pos
      infoSize = elSize
      infoHeaderLen = elId.width + elSize.width
      break
    }
    // Stop if we hit a Cluster
    if (elId.rawId === 0x1f43b675) break

    pos += elId.width + elSize.width + elSize.value
  }

  if (infoStart === -1 || !infoSize) return buf

  const infoContentStart = infoStart + infoHeaderLen
  const infoContentEnd = infoContentStart + infoSize.value
  let infoPos = infoContentStart

  let timecodeScale = 1000000 // default 1ms
  let durationPos = -1
  let durationLen = 0
  let durationType = 0
  let hasTimecodeScale = false
  let timecodeScalePos = -1
  let timecodeScaleLen = 0

  while (infoPos < infoContentEnd) {
    const chId = readVint(buf, infoPos)
    if (!chId) break
    const chSize = readVint(buf, infoPos + chId.width)
    if (!chSize) break

    const chContentStart = infoPos + chId.width + chSize.width
    const nextCh = chContentStart + chSize.value

    if (chId.rawId === 0x2ad7b1) { // TimecodeScale
      hasTimecodeScale = true
      timecodeScalePos = infoPos
      timecodeScaleLen = nextCh - infoPos
      let tc = 0
      for (let i = 0; i < chSize.value; i++) {
        tc = (tc * 256) + buf[chContentStart + i]
      }
      if (tc > 0) timecodeScale = tc
    } else if (chId.rawId === 0x4489) { // Duration
      durationPos = infoPos
      durationLen = nextCh - infoPos
      durationType = chSize.value
    }

    infoPos = nextCh
  }

  // Duration in TimecodeScale units
  const durUnits = (durationMs * 1000000) / timecodeScale

  // If Duration already exists and is Float64 (8 bytes), overwrite in place
  if (durationPos !== -1 && durationType === 8) {
    const chId = readVint(buf, durationPos)
    if (chId) {
      const chSize = readVint(buf, durationPos + chId.width)
      if (chSize && chSize.value === 8) {
        const valStart = durationPos + chId.width + chSize.width
        const copy = new Uint8Array(buf)
        copy.set(encodeFloat64(durUnits), valStart)
        return copy
      }
    }
  }

  // Build Duration element: 0x44 0x89 + VINT size 8 (0x88) + Float64 (8 bytes)
  const durElement = new Uint8Array(2 + 1 + 8)
  durElement[0] = 0x44
  durElement[1] = 0x89
  durElement[2] = 0x88
  durElement.set(encodeFloat64(durUnits), 3)

  // Ensure TimecodeScale is present
  let tcElement: Uint8Array | null = null
  if (!hasTimecodeScale) {
    // 0x2A 0xD7 0xB1 + VINT size 3 (0x83) + 0x0F 0x42 0x40 (1,000,000)
    tcElement = new Uint8Array([0x2a, 0xd7, 0xb1, 0x83, 0x0f, 0x42, 0x40])
  }

  let newInfoContent: Uint8Array
  if (durationPos === -1) {
    const existing = buf.subarray(infoContentStart, infoContentEnd)
    const extraLen = durElement.length + (tcElement ? tcElement.length : 0)
    newInfoContent = new Uint8Array(existing.length + extraLen)
    let off = 0
    if (tcElement) {
      newInfoContent.set(tcElement, off)
      off += tcElement.length
    }
    newInfoContent.set(existing, off)
    off += existing.length
    newInfoContent.set(durElement, off)
  } else {
    const beforeDur = buf.subarray(infoContentStart, durationPos)
    const afterDur = buf.subarray(durationPos + durationLen, infoContentEnd)
    const extraLen = durElement.length + (tcElement ? tcElement.length : 0)
    newInfoContent = new Uint8Array(beforeDur.length + extraLen + afterDur.length)
    let off = 0
    if (tcElement) {
      newInfoContent.set(tcElement, off)
      off += tcElement.length
    }
    newInfoContent.set(beforeDur, off)
    off += beforeDur.length
    newInfoContent.set(durElement, off)
    off += durElement.length
    newInfoContent.set(afterDur, off)
  }

  // Info ID: 0x15 0x49 0xA9 0x66
  const newInfoSizeVint = encodeVint(newInfoContent.length)
  const newInfoHeader = new Uint8Array(4 + newInfoSizeVint.length)
  newInfoHeader[0] = 0x15
  newInfoHeader[1] = 0x49
  newInfoHeader[2] = 0xa9
  newInfoHeader[3] = 0x66
  newInfoHeader.set(newInfoSizeVint, 4)

  const newInfoTotal = new Uint8Array(newInfoHeader.length + newInfoContent.length)
  newInfoTotal.set(newInfoHeader, 0)
  newInfoTotal.set(newInfoContent, newInfoHeader.length)

  const oldInfoTotalLen = infoHeaderLen + infoSize.value
  const delta = newInfoTotal.length - oldInfoTotalLen

  let newSegSizeVint: Uint8Array | null = null
  if (!isSegUnknown) {
    newSegSizeVint = encodeVint(segSize.value + delta, segSize.width)
  }

  const part1 = buf.subarray(0, segmentStart + segId.width)
  const part2 = newSegSizeVint || buf.subarray(segmentStart + segId.width, segContentStart)
  const part3 = buf.subarray(segContentStart, infoStart)
  const part4 = newInfoTotal
  const part5 = buf.subarray(infoStart + oldInfoTotalLen)

  const totalLen = part1.length + part2.length + part3.length + part4.length + part5.length
  const result = new Uint8Array(totalLen)
  let offset = 0
  result.set(part1, offset); offset += part1.length
  result.set(part2, offset); offset += part2.length
  result.set(part3, offset); offset += part3.length
  result.set(part4, offset); offset += part4.length
  result.set(part5, offset); offset += part5.length

  return result
}

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer()
  }
  return new Promise((resolve, reject) => {
    try {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result as ArrayBuffer)
      fr.onerror = () => reject(fr.error || new Error('read failed'))
      fr.readAsArrayBuffer(blob)
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * Asynchronously fixes the duration in a WebM Blob.
 * If the blob is not WebM or an error occurs, safely returns the original blob.
 */
export async function fixWebmDuration(blob: Blob, durationMs: number): Promise<Blob> {
  if (!blob || durationMs <= 0) return blob
  try {
    const buf = new Uint8Array(await blobToArrayBuffer(blob))
    const patched = patchWebmDuration(buf, durationMs)
    if (patched === buf) return blob
    return new Blob([patched], { type: blob.type || 'video/webm' })
  } catch {
    return blob
  }
}
