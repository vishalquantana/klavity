// Pure zoom / pan / minimap math for the image-hero annotator (KLA snap editor).
//
// The DOM wiring lives in modal.ts; everything here is plain-number math so it is unit-testable and the
// composer + tests share ONE source of truth. No DOM access in this file (the attribution helper it imports
// is itself defensive against hostile pages).

import { klavityAttributionUrl, detectAttributionSource } from './attribution'

export const ZOOM_MIN = 1
export const ZOOM_MAX = 6
// Per wheel-tick zoom step. Deliberately GENTLE (previously 1.18) so scroll-to-zoom feels controllable and
// smooth rather than jumping in big linear leaps.
export const ZOOM_STEP = 1.08

export function clampZoom(v: number, min = ZOOM_MIN, max = ZOOM_MAX): number {
  if (!Number.isFinite(v)) return min
  return Math.min(max, Math.max(min, v))
}

// Wheel deltaY → multiplicative zoom factor. Up-scroll (deltaY<0) zooms in, down-scroll zooms out.
export function wheelZoomFactor(deltaY: number, step = ZOOM_STEP): number {
  return deltaY < 0 ? step : 1 / step
}

// CSS transition used to animate scale changes. Under prefers-reduced-motion we fall back to a quick,
// non-elastic ease; otherwise a subtle overshoot-settle (cubic-bezier with y2>1) so zoom feels springy/
// natural instead of snapping instantly to the new scale.
export function zoomEasing(reducedMotion: boolean): string {
  return reducedMotion
    ? 'transform .1s ease-out'
    : 'transform .34s cubic-bezier(.22,1.24,.32,1)'
}

export interface HomeBox { left: number; top: number; width: number; height: number }
export interface Pan { panX: number; panY: number }
export interface Rect { x: number; y: number; w: number; h: number }
export interface Viewport { left: number; top: number; right: number; bottom: number }

// scale from image-pixels → home-box pixels (the object-fit:contain baseline, uniform on both axes).
export function homeScale(home: HomeBox, imgW: number): number {
  return imgW > 0 ? home.width / imgW : 1
}

// Cursor-anchored zoom: keep the image point under (clientX,clientY) stationary as the scale goes prev→next,
// returning the new pan. This is what makes scroll-zoom zoom TOWARD the pointer.
export function zoomTowardPan(
  clientX: number, clientY: number,
  home: HomeBox, prev: number, next: number, pan: Pan,
): Pan {
  const lx = (clientX - home.left - pan.panX) / prev
  const ly = (clientY - home.top - pan.panY) / prev
  return { panX: clientX - home.left - next * lx, panY: clientY - home.top - next * ly }
}

// The region of the image (in image pixels) currently visible inside the stage viewport — used to draw the
// minimap's viewport rectangle. Clamped to the image bounds.
export function visibleImageRect(
  stage: Viewport, home: HomeBox, pan: Pan, zoom: number, imgW: number, imgH: number,
): Rect {
  const s = homeScale(home, imgW) * zoom
  const cx = (v: number) => Math.min(imgW, Math.max(0, v))
  const cy = (v: number) => Math.min(imgH, Math.max(0, v))
  const x0 = s > 0 ? cx((stage.left - home.left - pan.panX) / s) : 0
  const x1 = s > 0 ? cx((stage.right - home.left - pan.panX) / s) : imgW
  const y0 = s > 0 ? cy((stage.top - home.top - pan.panY) / s) : 0
  const y1 = s > 0 ? cy((stage.bottom - home.top - pan.panY) / s) : imgH
  return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) }
}

// A click at (offsetX,offsetY) inside a minimap of pixel size (mmW,mmH) → the image-space point it targets.
export function minimapToImage(
  offsetX: number, offsetY: number, mmW: number, mmH: number, imgW: number, imgH: number,
): { ix: number; iy: number } {
  const ix = mmW > 0 ? (offsetX / mmW) * imgW : 0
  const iy = mmH > 0 ? (offsetY / mmH) * imgH : 0
  return { ix: Math.min(imgW, Math.max(0, ix)), iy: Math.min(imgH, Math.max(0, iy)) }
}

// Pan so image point (ix,iy) lands at the stage-viewport CENTRE (minimap click/drag jumps the main view).
export function panForImageCenter(
  ix: number, iy: number, stage: Viewport, home: HomeBox, zoom: number, imgW: number,
): Pan {
  const s = homeScale(home, imgW) * zoom
  const cx = (stage.left + stage.right) / 2
  const cy = (stage.top + stage.bottom) / 2
  return { panX: cx - home.left - s * ix, panY: cy - home.top - s * iy }
}

// Build the UTM'd Klavity-homepage link for the editor's top-left logo, so clicks from a customer's editor
// are attributable back to WHICH project/site drove them. Reuses the shared attribution helper.
export function heroLogoHref(projectId?: string): string {
  return klavityAttributionUrl('https://klavity.in', {
    campaign: 'powered-by',
    medium: 'annotation-editor',
    source: 'snap-widget',
    // utm_content = the customer project id, or (when we don't have one) the embedding host, so we can still
    // see who clicked.
    ref: projectId || detectAttributionSource(),
  })
}
