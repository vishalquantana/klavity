import { describe, it, expect } from 'vitest'
import {
  UNIFIED_ATTACH_ACCEPT,
  DEFAULT_MAX_FILE_BYTES,
  DEFAULT_MAX_FILE_MB,
  isImageLike,
  attachmentKind,
  evaluateFileCap,
  attachmentProgressPercent,
} from './modal'

// KLA-591: the unified attachment gallery merges Upload (images) + Attach file (video/doc) into ONE control.
// These pure predicates back that control — test them directly (the composer + tests share one source).

describe('UNIFIED_ATTACH_ACCEPT', () => {
  it('accepts images, video, PDF and log-style files through one input', () => {
    expect(UNIFIED_ATTACH_ACCEPT).toContain('image/*')
    expect(UNIFIED_ATTACH_ACCEPT).toContain('video/*')
    expect(UNIFIED_ATTACH_ACCEPT).toContain('.pdf')
    expect(UNIFIED_ATTACH_ACCEPT).toContain('.log')
    expect(UNIFIED_ATTACH_ACCEPT).toContain('.har')
    // HEIC/HEIF images (empty browser type) are still offered.
    expect(UNIFIED_ATTACH_ACCEPT).toContain('.heic')
  })
})

describe('isImageLike', () => {
  it('matches by MIME and by extension (HEIC/empty type)', () => {
    expect(isImageLike({ type: 'image/png', name: 'a.png' })).toBe(true)
    expect(isImageLike({ type: '', name: 'photo.HEIC' })).toBe(true)
    expect(isImageLike({ type: 'IMAGE/JPEG', name: 'x' })).toBe(true)
  })
  it('is false for video and docs', () => {
    expect(isImageLike({ type: 'video/mp4', name: 'c.mp4' })).toBe(false)
    expect(isImageLike({ type: 'application/pdf', name: 'd.pdf' })).toBe(false)
  })
})

describe('attachmentKind', () => {
  it('classifies image / video / file', () => {
    expect(attachmentKind({ type: 'image/png', name: 'a.png' })).toBe('image')
    expect(attachmentKind({ type: '', name: 'shot.heic' })).toBe('image')
    expect(attachmentKind({ type: 'video/mp4', name: 'clip.mp4' })).toBe('video')
    expect(attachmentKind({ type: '', name: 'screen.mov' })).toBe('video') // by extension
    expect(attachmentKind({ type: 'application/pdf', name: 'invoice.pdf' })).toBe('file')
    expect(attachmentKind({ type: 'text/plain', name: 'app.log' })).toBe('file')
  })
  it('prefers video over image when both could match (video wins)', () => {
    // A weird file with a video type but image-ish name still classifies as video.
    expect(attachmentKind({ type: 'video/webm', name: 'thumb.png' })).toBe('video')
  })
})

describe('evaluateFileCap (100MB default + role-aware CTA)', () => {
  const CAP = DEFAULT_MAX_FILE_BYTES
  it('defaults to a 100MB per-file cap', () => {
    expect(DEFAULT_MAX_FILE_MB).toBe(100)
    expect(DEFAULT_MAX_FILE_BYTES).toBe(100 * 1024 * 1024)
  })

  it('under cap → not over, no message/CTA', () => {
    const d = evaluateFileCap({ size: 40 * 1024 * 1024, name: 'demo.mp4' }, { capBytes: CAP, role: 'member' })
    expect(d.overCap).toBe(false)
    expect(d.message).toBeUndefined()
    expect(d.cta).toBeUndefined()
  })

  it('a workspace member over cap gets a DIRECT upgrade link (not a dead end)', () => {
    const d = evaluateFileCap({ size: 150 * 1024 * 1024, name: 'big.mp4' }, { capBytes: CAP, role: 'member', upgradeUrl: 'https://app/settings/billing' })
    expect(d.overCap).toBe(true)
    expect(d.message).toContain('100MB')
    expect(d.message).toContain('big.mp4')
    expect(d.cta?.kind).toBe('upgrade')
    expect(d.cta?.url).toBe('https://app/settings/billing')
  })

  it('an owner also gets the upgrade CTA', () => {
    const d = evaluateFileCap({ size: 150 * 1024 * 1024, name: 'big.mp4' }, { capBytes: CAP, role: 'owner', upgradeUrl: 'u' })
    expect(d.cta?.kind).toBe('upgrade')
  })

  it('an anon/guest reporter is NEVER asked to pay — ask-team CTA, no upgrade URL', () => {
    const anon = evaluateFileCap({ size: 150 * 1024 * 1024, name: 'big.mp4' }, { capBytes: CAP, role: 'anon', upgradeUrl: 'u' })
    expect(anon.overCap).toBe(true)
    expect(anon.cta?.kind).toBe('ask-team')
    expect(anon.cta?.url).toBeUndefined()
    const guest = evaluateFileCap({ size: 150 * 1024 * 1024, name: 'big.mp4' }, { capBytes: CAP, role: 'guest' })
    expect(guest.cta?.kind).toBe('ask-team')
  })

  it('undefined role is treated as a guest (safe default: no payment ask)', () => {
    const d = evaluateFileCap({ size: 150 * 1024 * 1024 }, { capBytes: CAP })
    expect(d.cta?.kind).toBe('ask-team')
  })

  it('honours a per-plan overridden cap in the message', () => {
    const d = evaluateFileCap({ size: 300 * 1024 * 1024, name: 'v.mp4' }, { capBytes: 200 * 1024 * 1024, role: 'member' })
    expect(d.overCap).toBe(true)
    expect(d.message).toContain('200MB')
  })
})

describe('attachmentProgressPercent', () => {
  it('clamps to 0..100 and rounds', () => {
    expect(attachmentProgressPercent(0)).toBe(0)
    expect(attachmentProgressPercent(42.6)).toBe(43)
    expect(attachmentProgressPercent(140)).toBe(100)
    expect(attachmentProgressPercent(-10)).toBe(0)
  })
  it('null/NaN/undefined → null (clears the bars)', () => {
    expect(attachmentProgressPercent(null)).toBeNull()
    expect(attachmentProgressPercent(undefined)).toBeNull()
    expect(attachmentProgressPercent(NaN)).toBeNull()
  })
})
