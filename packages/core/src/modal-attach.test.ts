import { describe, it, expect } from 'vitest'
import { isVideoFile, attachmentSizeCap, videoContentType } from './modal'

// video-upload (KLAVITYKLA-480): the "Attach file" ingest path must ACCEPT videos (not reject them like
// the image-only Upload path) and give them a higher per-file byte cap than plain docs. These pure
// predicates are the shared source of truth used by ingestAttachments — test them directly.
const MAX_FILE_BYTES = 10 * 1024 * 1024   // 10 MB (non-video)
const MAX_VIDEO_BYTES = 100 * 1024 * 1024 // 100 MB (video)
const CAPS = { file: MAX_FILE_BYTES, video: MAX_VIDEO_BYTES }

describe('isVideoFile', () => {
  it('matches by MIME (video/*)', () => {
    expect(isVideoFile({ type: 'video/mp4', name: 'clip.mp4' })).toBe(true)
    expect(isVideoFile({ type: 'video/webm', name: 'rec.webm' })).toBe(true)
    expect(isVideoFile({ type: 'VIDEO/MP4', name: 'x' })).toBe(true) // case-insensitive
  })

  it('falls back to extension when the browser reports an empty type', () => {
    expect(isVideoFile({ type: '', name: 'screen.mov' })).toBe(true)
    expect(isVideoFile({ type: '', name: 'clip.MP4' })).toBe(true)
    expect(isVideoFile({ name: 'movie.mkv' })).toBe(true)
  })

  it('is false for non-videos (images, docs)', () => {
    expect(isVideoFile({ type: 'image/png', name: 'shot.png' })).toBe(false)
    expect(isVideoFile({ type: 'application/pdf', name: 'invoice.pdf' })).toBe(false)
    expect(isVideoFile({ type: 'text/plain', name: 'app.log' })).toBe(false)
  })
})

describe('attachmentSizeCap', () => {
  it('gives videos the higher video cap', () => {
    expect(attachmentSizeCap({ type: 'video/mp4', name: 'a.mp4' }, CAPS)).toBe(MAX_VIDEO_BYTES)
  })

  it('gives non-videos the standard file cap', () => {
    expect(attachmentSizeCap({ type: 'application/pdf', name: 'a.pdf' }, CAPS)).toBe(MAX_FILE_BYTES)
  })

  it('a ~40MB video is under the video cap but would exceed the doc cap', () => {
    const size = 40 * 1024 * 1024
    const video = { type: 'video/mp4', name: 'demo.mp4' }
    expect(size).toBeLessThanOrEqual(attachmentSizeCap(video, CAPS)) // accepted as a video
    expect(size).toBeGreaterThan(MAX_FILE_BYTES)                     // rejected under the old image/doc cap
  })
})

// KLA-560 item 6: the client stamps a concrete video/* MIME onto a file it accepted as a video by
// EXTENSION (empty browser file.type), so the type travels end-to-end and the server's content-type-based
// 100MB cap agrees. videoContentType is the shared derivation used by ingestAttachments.
describe('videoContentType', () => {
  it('derives a concrete video/* type from a known extension', () => {
    expect(videoContentType('screen.mov')).toBe('video/quicktime')
    expect(videoContentType('clip.MP4')).toBe('video/mp4')
    expect(videoContentType('rec.webm')).toBe('video/webm')
    expect(videoContentType('movie.mkv')).toBe('video/x-matroska')
  })

  it('returns "" for non-video / unknown extensions so the original type is kept', () => {
    expect(videoContentType('invoice.pdf')).toBe('')
    expect(videoContentType('app.log')).toBe('')
    expect(videoContentType('noext')).toBe('')
  })

  it('an empty-MIME .mov ends up classified as video by BOTH the predicate and the stamped type', () => {
    // client accepted by extension (empty MIME) …
    const emptyMimeMov = { type: '', name: 'screen.mov' }
    expect(isVideoFile(emptyMimeMov)).toBe(true)
    // … and the stamped type is a concrete video/* the SERVER also keys the 100MB cap off of.
    const stampedType = emptyMimeMov.type || (isVideoFile(emptyMimeMov) ? videoContentType(emptyMimeMov.name) : '')
    expect(stampedType).toBe('video/quicktime')
    expect(/^video\//i.test(stampedType)).toBe(true)
    // a 60MB such file gets the video cap, not the 8MB doc cap
    const size = 60 * 1024 * 1024
    expect(size).toBeLessThanOrEqual(attachmentSizeCap(emptyMimeMov, CAPS))
  })
})
