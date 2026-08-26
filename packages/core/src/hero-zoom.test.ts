// @vitest-environment jsdom
// Pure zoom / pan / minimap math + the editor logo UTM link for the Snap annotation editor.
// jsdom url is https://klavity.in/ (vitest config), so detectAttributionSource() falls back to that host.

import { describe, it, expect } from 'vitest'
import {
  ZOOM_STEP, ZOOM_MAX, clampZoom, wheelZoomFactor, zoomEasing, zoomTowardPan,
  homeScale, visibleImageRect, minimapToImage, panForImageCenter, heroLogoHref,
} from './hero-zoom'

const HOME = { left: 100, top: 50, width: 400, height: 300 } // 800x600 image shown at 0.5 scale

describe('zoom step + factor (gentler, non-linear)', () => {
  it('uses a gentle per-tick step (much smaller than the old 1.18 jump)', () => {
    expect(ZOOM_STEP).toBeLessThan(1.18)
    expect(ZOOM_STEP).toBeGreaterThan(1) // still zooms in
    expect(ZOOM_STEP).toBe(1.08)
  })
  it('scroll up zooms in (>1), scroll down zooms out (<1) and they are reciprocals', () => {
    const inF = wheelZoomFactor(-100)
    const outF = wheelZoomFactor(120)
    expect(inF).toBe(ZOOM_STEP)
    expect(outF).toBeCloseTo(1 / ZOOM_STEP, 10)
    expect(inF * outF).toBeCloseTo(1, 10)
  })
})

describe('clampZoom', () => {
  it('clamps to [1, MAX] and survives NaN', () => {
    expect(clampZoom(0.2)).toBe(1)
    expect(clampZoom(99)).toBe(ZOOM_MAX)
    expect(clampZoom(2.5)).toBe(2.5)
    expect(clampZoom(NaN)).toBe(1)
  })
})

describe('zoomEasing (elastic vs reduced-motion)', () => {
  it('is an overshoot cubic-bezier normally, a quick ease under reduced-motion', () => {
    const full = zoomEasing(false)
    expect(full).toContain('cubic-bezier')
    // y2 > 1 → the curve overshoots then settles (the "elastic" feel).
    const m = full.match(/cubic-bezier\(([^)]+)\)/)
    expect(m).toBeTruthy()
    const [, y1, , y2] = m![1].split(',').map(Number)
    // A control-point y > 1 makes the value shoot past the target then settle back (the overshoot).
    expect(Math.max(y1, y2)).toBeGreaterThan(1)
    const reduced = zoomEasing(true)
    expect(reduced).not.toContain('cubic-bezier')
    expect(reduced).toContain('transform')
  })
})

describe('zoomTowardPan (cursor-anchored)', () => {
  it('keeps the point under the cursor fixed as scale changes', () => {
    const cursor = { x: 260, y: 200 } // arbitrary client point over the image
    const prev = 1, next = 2
    const pan0 = { panX: 0, panY: 0 }
    const pan1 = zoomTowardPan(cursor.x, cursor.y, HOME, prev, next, pan0)
    // The image coord under the cursor before and after must be identical.
    const imgBefore = (cursor.x - HOME.left - pan0.panX) / prev
    const imgAfter = (cursor.x - HOME.left - pan1.panX) / next
    expect(imgAfter).toBeCloseTo(imgBefore, 6)
    const imgBeforeY = (cursor.y - HOME.top - pan0.panY) / prev
    const imgAfterY = (cursor.y - HOME.top - pan1.panY) / next
    expect(imgAfterY).toBeCloseTo(imgBeforeY, 6)
  })
})

describe('visibleImageRect', () => {
  const stage = { left: 0, top: 0, right: 600, bottom: 500 }
  it('at zoom 1 the whole image is (at most) visible, clamped to bounds', () => {
    const r = visibleImageRect(stage, HOME, { panX: 0, panY: 0 }, 1, 800, 600)
    // home starts at (100,50) with scale 0.5; stage left edge (0) maps to image x = (0-100)/0.5 = -200 → 0.
    expect(r.x).toBe(0)
    expect(r.y).toBe(0)
    // stage right (600) → image x = (600-100)/0.5 = 1000 → clamped 800.
    expect(r.w).toBe(800)
    expect(r.h).toBeGreaterThan(0)
  })
  it('at zoom 2 the visible region shrinks (you see less of the image)', () => {
    const r1 = visibleImageRect(stage, HOME, { panX: 0, panY: 0 }, 1, 800, 600)
    const r2 = visibleImageRect(stage, HOME, { panX: 0, panY: 0 }, 2, 800, 600)
    expect(r2.w).toBeLessThan(r1.w)
  })
})

describe('minimapToImage + panForImageCenter (minimap click → pan)', () => {
  const stage = { left: 0, top: 0, right: 600, bottom: 500 }
  it('maps a minimap click to the right image point', () => {
    // Minimap is 148 wide max; for an 800x600 image → scale 148/800 = 0.185 → 148x111.
    const mmW = 148, mmH = 111
    // Click dead-centre of the minimap → centre of the image.
    const { ix, iy } = minimapToImage(mmW / 2, mmH / 2, mmW, mmH, 800, 600)
    expect(ix).toBeCloseTo(400, 0)
    expect(iy).toBeCloseTo(300, 0)
  })
  it('clicking a minimap point pans so that image point sits at the stage centre', () => {
    const zoom = 3
    const ix = 600, iy = 450 // lower-right region of an 800x600 image
    const pan = panForImageCenter(ix, iy, stage, HOME, zoom, 800)
    // Re-derive where that image point lands on screen with the computed pan; it must be the stage centre.
    const s = homeScale(HOME, 800) * zoom
    const screenX = HOME.left + pan.panX + s * ix
    const screenY = HOME.top + pan.panY + s * iy
    expect(screenX).toBeCloseTo((stage.left + stage.right) / 2, 6)
    expect(screenY).toBeCloseTo((stage.top + stage.bottom) / 2, 6)
  })
})

describe('heroLogoHref (UTM homepage link)', () => {
  it('carries snap-widget source, annotation-editor medium, powered-by campaign, and the project id as content', () => {
    const u = new URL(heroLogoHref('proj_abc123'))
    expect(u.origin + u.pathname).toBe('https://klavity.in/')
    expect(u.searchParams.get('utm_source')).toBe('snap-widget')
    expect(u.searchParams.get('utm_medium')).toBe('annotation-editor')
    expect(u.searchParams.get('utm_campaign')).toBe('powered-by')
    expect(u.searchParams.get('utm_content')).toBe('proj_abc123')
  })
  it('falls back to the embedding host as utm_content when no project id is known', () => {
    const u = new URL(heroLogoHref(undefined))
    // jsdom host is klavity.in.
    expect(u.searchParams.get('utm_content')).toBe('klavity.in')
  })
})
