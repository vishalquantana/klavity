import type { ReportType, Shape } from './types'
import { Annotator } from './annotator'
import { themeCss, resolveModalConfig, type ModalConfig } from './modal-theme'
import { icon } from './icons'
import { VoiceInput } from './voice-input'
import { maskNumbers } from './mask-numbers'

// Re-exported here so the widget + extension can import the shared right-click-drag region gesture from
// the same module they already use for buildModal (avoids adding a package.json export entry, which the
// orchestrator's version-stamp ownership could clobber).
export { installRegionDrag, type RegionDragHandle, type RegionDragOptions } from './region-drag'

/** Shift every annotation shape by (dx, dy) — used to rebase markup into a cropped image's new origin.
 *  Pure + coordinate-only so it's unit-testable without a canvas. Returns fresh shape objects. */
export function translateShapes(shapes: Shape[], dx: number, dy: number): Shape[] {
  return shapes.map((s): Shape => {
    switch (s.type) {
      case 'pen': return { ...s, points: s.points.map(p => ({ x: p.x + dx, y: p.y + dy })) }
      case 'rect': return { ...s, x: s.x + dx, y: s.y + dy }
      case 'circle': return { ...s, x: s.x + dx, y: s.y + dy }
      case 'count': return { ...s, x: s.x + dx, y: s.y + dy }
      case 'text': return { ...s, x: s.x + dx, y: s.y + dy }
      case 'arrow': return { ...s, x1: s.x1 + dx, y1: s.y1 + dy, x2: s.x2 + dx, y2: s.y2 + dy }
      case 'line': return { ...s, x1: s.x1 + dx, y1: s.y1 + dy, x2: s.x2 + dx, y2: s.y2 + dy }
    }
  })
}

/** Escape text for safe interpolation into innerHTML. */
function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** JTBD 1.8: inner markup for the attached-proof replay chip, given the current state.
 *  'attached' → play-icon "Replay · 60s" with a check; 'unavailable' → muted "Replay · not available". */
function replayChipInner(state: 'attached' | 'unavailable'): string {
  return state === 'attached'
    ? `${icon('play', { size: 12 })}<span>Replay &middot; 60s</span>${icon('check', { size: 12, label: 'attached' })}`
    : `${icon('play', { size: 12 })}<span>Replay &middot; not available</span>`
}

/** Human-quotable ticket reference. Klavity feedback ids are "fb_<uuid>" — far too long to read
 *  aloud or quote to support, so shorten to the first uuid block ("fb_1a2b3c4d"). Tracker keys
 *  (e.g. a Plane sequence like "42" or "KLAV-123") pass through unchanged. */
function displayRef(issueKey: string): string {
  const m = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(issueKey)
  return m ? 'fb_' + m[1] : issueKey
}

/** Only ever link out to a real http(s) URL — issueUrl flows in from the host/server response, so
 *  anything else (empty, javascript:, garbage) renders no link at all. */
function safeHttpUrl(u: string | null | undefined): string {
  if (!u) return ''
  try {
    const p = new URL(u)
    return p.protocol === 'https:' || p.protocol === 'http:' ? p.href : ''
  } catch { return '' }
}

/**
 * JTBD 1.9 — capture-quality tag for a screenshot thumbnail. Each capture engine tags its output so the
 * composer can badge it and, on a degraded shot, offer a one-tap "Retake sharp":
 *   'real-pixel' -> getDisplayMedia (widget "Screen") / captureVisibleTab (extension). True page pixels,
 *                   every image (cross-origin included). No warning; no retake offered.
 *   'rendered'   -> html-to-image ("Full Page" on the widget). A DOM re-render — cross-origin images the
 *                   page's CSP/CORS blocks are dropped. Retake offered.
 *   'wireframe'  -> the fetch-free fallback painter. Layout/text/backgrounds only, NO image bytes. Never
 *                   presented without its badge. Retake offered.
 */
export type CaptureQuality = 'real-pixel' | 'rendered' | 'wireframe'

/** A capture callback may return the raw dataUrl (legacy) OR { dataUrl, quality } (JTBD 1.9). */
export type CaptureResult = string | { dataUrl: string; quality?: CaptureQuality }

/** Normalise a {@link CaptureResult} (raw dataUrl or { dataUrl, quality }) to a uniform shape. */
function normalizeCapture(r: CaptureResult): { dataUrl: string; quality?: CaptureQuality } {
  return typeof r === 'string' ? { dataUrl: r } : { dataUrl: r.dataUrl, quality: r.quality }
}

/** JTBD 1.9 badge metadata per capture-quality tag: label + icon + whether "Retake sharp" applies. */
const QUALITY_META: Record<CaptureQuality, { label: string; iconName: string; degraded: boolean }> = {
  'real-pixel': { label: 'Sharp', iconName: 'check-circle', degraded: false },
  'rendered': { label: 'Rendered', iconName: 'image', degraded: true },
  'wireframe': { label: 'Wireframe', iconName: 'triangle-alert', degraded: true },
}

export interface SuccessCopy {
  headline: string
  body: string
  emailLabel: string
  ctaText: string
  ctaUrl: string
  showEmail: boolean
  showCta: boolean
}

export interface ModalCallbacks {
  // Each capture callback may return a raw dataUrl (legacy) or { dataUrl, quality } (JTBD 1.9). The quality
  // tag drives the thumbnail badge + the "Retake sharp" affordance. onCaptureFull is 'rendered'/'wireframe'
  // on the widget (html-to-image / fetch-free) and 'real-pixel' on the extension (captureVisibleTab stitch).
  onCaptureFull: () => Promise<CaptureResult>
  onRegionCapture?: (rect: { x: number; y: number; w: number; h: number }) => Promise<CaptureResult>
  // Optional "sharp" real-pixel capture (the widget's getDisplayMedia scroll-stitch — captures cross-origin
  // images with no CORS issues). When provided, a "Sharp" button is rendered; the modal hides itself during
  // the capture so the composer isn't in the shot. Feature-detected by the host (absent on iOS Safari →
  // button hidden → users fall back to the html-to-image "Full Page").
  onCaptureSharp?: () => Promise<CaptureResult>
  // JTBD 1.9: the real-pixel "Retake sharp" path invoked from a degraded (rendered/wireframe) thumbnail's
  // badge. Returns a fresh real-pixel capture that replaces the degraded image in place. On the widget this
  // is the getDisplayMedia screen-share; on the extension it's the captureVisibleTab full-page capture. The
  // host hides its own UI during the capture (same as the Sharp button). Absent → no retake affordance.
  onRetakeSharp?: () => Promise<CaptureResult>
  onSubmit: (payload: {
    type: ReportType
    description: string
    screenshots: string[]
    annotations?: any
    // The email typed into the REQUIRED-email gate (requireEmail). The host must forward it to the
    // backend as reporter_email, otherwise an "email"-gated project rejects the submit with 400
    // "A valid email is required to submit." Undefined when no email field was shown.
    reporterEmail?: string
  }) => Promise<{ issueKey: string; issueUrl: string }>
  // Optional image pre-processor called immediately when a screenshot is added (e.g. PNG→JPEG
  // compression). By submit time the promise is already resolved, so the upload starts with zero
  // compression delay. The host passes compressScreenshot here; the extension omits it (its SW
  // handles compression separately).
  compressImage?: (dataUrl: string) => Promise<string>
  // When true, the compose screen shows a REQUIRED email field and blocks submit until it's valid.
  // Used by the embeddable widget on third-party sites when the project's report gate is "email",
  // so an end-user can file a ticket without a Klavity account. Default false → extension/authed
  // paths are unaffected (they already carry an identity).
  requireEmail?: boolean
  // Mode-aware success screen. When provided, a successful submit swaps the modal body for this
  // screen (headline/body, optional email-lead capture, optional CTA) and DOES NOT auto-close —
  // the user must interact. When absent, falls back to the themed thankYou/"Filed" auto-close card.
  // `copy` is static (built by the host from successCopy()); `onLead` POSTs the captured email,
  // referencing the returned feedback id (= issueKey).
  success?: {
    copy: SuccessCopy
    onLead?: (feedbackId: string, email: string) => Promise<void>
  }
  // When true, onCaptureFull() is called automatically ~200ms after the modal mounts and the
  // result is added to the screenshot strip. Default false — the production widget is unaffected.
  autoCaptureOnOpen?: boolean
  // Called once when the composer closes — via Esc, overlay click, X button, or programmatic close.
  // Used by the widget to fire the public window.Klavity.on('close') event.
  onClose?: () => void
  // JTBD 1.8: attached-proof chip. Reflects whether a rolling session-replay buffer will ride along
  // with the report so reporters (and, in the drawer, reviewers) know what evidence traveled:
  //   'attached'    -> chip reads "Replay 60s" with a check (a scrubbable buffer will attach)
  //   'unavailable' -> chip reads "Replay not available" (recording off / buffer script failed to load)
  // Omit entirely (undefined) on paths with no session-replay concept (e.g. the extension) -> no chip.
  // The buffer becomes playable a few hundred ms after mount, so the host may re-evaluate later via
  // the controller's setReplayState().
  replayState?: 'attached' | 'unavailable'
}

export interface ModalController {
  shadowRoot: ShadowRoot
  // JTBD 1.9: an optional capture-quality tag badges the thumbnail (real-pixel/rendered/wireframe) and,
  // for a degraded shot, surfaces "Retake sharp". Omit it (e.g. a right-click-drag region shot the host
  // already knows the quality of) and no badge is shown.
  addScreenshot: (dataUrl: string, quality?: CaptureQuality) => void
  close: () => void
  // JTBD 1.8: update the attached-proof replay chip after mount (rrweb loads async, so the buffer may
  // only become playable a few hundred ms after the composer opens). No-op when no chip was rendered.
  setReplayState: (state: 'attached' | 'unavailable') => void
}

export function buildModal(
  initialType: ReportType,
  callbacks: ModalCallbacks,
  config: ModalConfig = {},
): ModalController {
  const cfg = resolveModalConfig(config)
  let maskOn = !!(cfg.maskNumbers)
  // Create shadow host
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;'
  const shadowRoot = host.attachShadow({ mode: 'open' })
  document.body.appendChild(host)

  let screenshots: string[] = []
  // Parallel array: each entry is the resolved (compressed) version of screenshots[i].
  // Pre-compression is kicked off immediately when a screenshot is added, so by the time the user
  // clicks Submit the Promise is already settled and the upload can start without delay.
  let screenshotCompressed: Promise<string>[] = []
  // JTBD 1.9: parallel array of capture-quality tags — screenshotQuality[i] describes screenshots[i]
  // ('real-pixel' | 'rendered' | 'wireframe'), or undefined for images with no known quality (user
  // uploads / clipboard pastes). Drives the per-thumbnail badge + the "Retake sharp" affordance.
  let screenshotQuality: (CaptureQuality | undefined)[] = []
  // Upload guards (Dev 6 audit #4): cap how many images can be attached and how big each may be.
  const MAX_IMAGES = 5
  const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB per image
  // Structured markup per screenshot index { w, h, shapes } so the ticket can re-render a
  // toggleable/zoomable overlay instead of baking the drawing into the uploaded image.
  const annotationsByIndex: Record<number, any> = {}
  // KLAVITYKLA-217: serialize the FULL per-image markup map (not just screenshot #0). The wire shape
  // stays backward-compatible — the index-0 entry's fields ({ w, h, shapes, … }) are hoisted to the top
  // level so existing single-image consumers (server sanitizer + ticket drawer) keep working unchanged,
  // while `byIndex` carries every annotated image so overlays on screenshots 2–5 no longer vanish.
  // Returns null when nothing is annotated (identical to the previous `annotationsByIndex[0] ?? null`).
  const buildAnnotationsPayload = (): any => {
    const keys = Object.keys(annotationsByIndex)
    if (!keys.length) return null
    const byIndex: Record<string, any> = {}
    for (const k of keys) byIndex[k] = annotationsByIndex[k as any]
    const base = annotationsByIndex[0] ?? annotationsByIndex[Number(keys[0])] ?? {}
    return { ...base, byIndex }
  }
  let currentType = initialType
  // Image-hero: the screenshot currently shown big + live-annotated in the hero pane. Clicking a
  // thumbnail selects it; the inline annotator mounts on it and persists shapes to annotationsByIndex.
  let activeIndex = 0
  let heroKeyHandler: ((e: KeyboardEvent) => void) | null = null
  // JTBD 1.10: track whether a session-replay buffer is attached — it counts as evidence, so an
  // evidence-only report (replay but no typed prose / screenshot) can still Submit. Seeded from the
  // initial callback state and kept in sync by setReplayState() as rrweb resolves post-mount.
  let replayAttached = callbacks.replayState === 'attached'
  let autodismissTimeout: any = null

  const style = document.createElement('style')
  style.textContent = `
    ${themeCss(cfg)}
    @keyframes kl-genie-in{from{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}to{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}}
    @keyframes kl-genie-out{from{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}to{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}}
    @keyframes kl-ov{from{opacity:0}to{opacity:1}}
    .klavity-overlay{position:fixed;inset:0;background:var(--kl-overlay);display:flex;align-items:center;justify-content:center;pointer-events:all;animation:kl-ov .3s ease both;}
    .klavity-modal{position:relative;overflow:hidden;isolation:isolate;background:var(--kl-glow,transparent),var(--kl-bg);color:var(--kl-fg);border-radius:var(--kl-radius);padding:0;width:92vw;max-width:min(1160px,92vw);max-height:94vh;box-shadow:0 0 0 1px var(--kl-border),var(--kl-shadow);font-family:var(--kl-font,system-ui,sans-serif);-webkit-font-smoothing:antialiased;-webkit-backdrop-filter:var(--kl-backdrop);backdrop-filter:var(--kl-backdrop);transform-origin:bottom center;animation:kl-genie-in .6s cubic-bezier(.16,1,.3,1) both;display:grid;grid-template-columns:minmax(0,1fr) 384px;}
    /* Image-hero two-pane layout: big annotatable screenshot on the left, controls on the right. */
    .kl-hero{display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--kl-hero-bg,#0e1424);}
    .kl-hero-tools{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:8px 14px;min-height:48px;border-bottom:1px solid rgba(255,255,255,.06);}
    .kl-hero-stage{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:14px;}
    .kl-hero-empty{display:flex;flex-direction:column;align-items:center;gap:12px;color:#7d879f;font-size:13.5px;font-weight:500;text-align:center;max-width:260px;line-height:1.5;}
    .kl-hero-empty svg{opacity:.6;}
    .kl-side{display:flex;flex-direction:column;min-width:0;border-left:1px solid var(--kl-border);padding:22px 20px;overflow-y:auto;}
    .kl-side>.klavity-submit{margin-top:auto;}
    @media (max-width:760px){.klavity-modal{grid-template-columns:1fr;width:96vw;max-height:96vh;}.kl-hero{max-height:44vh;}.kl-side{overflow-y:visible;border-left:none;border-top:1px solid var(--kl-border);}}
    /* Hero annotation toolbar — always-on tools over the image. Tap targets ≥36px for touch. */
    .kl-htool,.kl-htbtn{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:38px;height:38px;padding:0 8px;border:1px solid transparent;border-radius:9px;background:transparent;color:#cfd5ea;cursor:pointer;line-height:1;transition:transform .12s ease,background .12s ease;}
    .kl-htool .kl-hk{font-size:9px;font-weight:700;opacity:.5;}
    .kl-htool:hover,.kl-htbtn:hover{background:rgba(255,255,255,.08);transform:translateY(-1px);}
    .kl-htool.kl-on{background:var(--kl-accent);color:var(--kl-on-accent);box-shadow:0 4px 12px color-mix(in srgb,var(--kl-accent) 45%,transparent);}
    .kl-htool.kl-on .kl-hk{opacity:.85;}
    .kl-hcolor{width:24px;height:24px;border-radius:50%;border:2px solid rgba(255,255,255,.65);cursor:pointer;padding:0;transition:transform .12s ease;}
    .kl-hcolor:hover{transform:scale(1.14);}
    .kl-hcolor.kl-on{outline:2px solid #fff;outline-offset:2px;}
    .kl-hsep{width:1px;height:24px;background:rgba(255,255,255,.14);margin:0 3px;}
    .kl-hgrow{flex:1;}
    .kl-hhint{color:#7d879f;font-size:11px;font-weight:600;white-space:nowrap;}
    /* Contextual text options (outline colour + size) — only visible while the Text tool is active. */
    .kl-htextopts{display:inline-flex;align-items:center;gap:5px;}
    .kl-htextopts[hidden]{display:none;}
    .kl-hlabel{color:#7d879f;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin:0 1px;}
    .kl-hopt{min-width:28px;height:30px;padding:0 8px;border-radius:8px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#cfd5ea;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}
    .kl-hopt:hover{background:rgba(255,255,255,.08);}
    .kl-hopt.kl-on{background:var(--kl-accent);color:var(--kl-on-accent);border-color:transparent;}
    .kl-osq{width:13px;height:13px;border-radius:3px;display:inline-block;}
    .kl-htool:focus-visible,.kl-htbtn:focus-visible,.kl-hcolor:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klavity-thumb.kl-thumb-active img{outline:2px solid var(--kl-accent);outline-offset:1px;}
    @media (max-width:760px){.kl-hhint{display:none;}}
    @media (prefers-reduced-motion:reduce){.kl-htool,.kl-htbtn,.kl-hcolor{transition:none;}.kl-htool:hover,.kl-htbtn:hover,.kl-hcolor:hover{transform:none;}}
    .klavity-modal::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(to right,color-mix(in srgb,var(--kl-border) 58%,transparent) 1px,transparent 1px) 0 0/44px 44px,linear-gradient(to bottom,color-mix(in srgb,var(--kl-border) 58%,transparent) 1px,transparent 1px) 0 0/44px 44px;opacity:.36;}
    .klavity-modal>*{position:relative;z-index:1;}
    /* Staggered content reveal — the genie scales the panel in while its rows softly rise + fade so it feels
       alive (not a flat box). Subtle; zeroed under prefers-reduced-motion below. */
    @keyframes kl-rise{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
    .kl-side>.klavity-toggle,.kl-side>.klavity-page,.kl-side>.klavity-proof,.kl-hero>.klavity-strip,.kl-side>.klavity-actions,.kl-side>textarea.klavity-desc,.kl-side>input.klavity-remail,.kl-side>.klavity-submit{animation:kl-rise .5s cubic-bezier(.16,1,.3,1) both;}
    .kl-side>.klavity-toggle{animation-delay:.05s}.kl-side>.klavity-page{animation-delay:.09s}.kl-side>.klavity-proof{animation-delay:.11s}.kl-hero>.klavity-strip{animation-delay:.12s}.kl-side>.klavity-actions{animation-delay:.15s}.kl-side>textarea.klavity-desc{animation-delay:.18s}.kl-side>input.klavity-remail{animation-delay:.21s}.kl-side>.klavity-submit{animation-delay:.23s}
    .klavity-modal.kl-closing{animation:kl-genie-out .5s cubic-bezier(.55,0,.85,.25) both;}
    .klavity-toggle{display:flex;gap:8px;margin-bottom:16px;padding-right:34px;}
    .klavity-toggle button{flex:1;min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:600;background:var(--kl-chip);color:var(--kl-fg);line-height:1;}
    .klavity-toggle .bug.active{background:var(--kl-accent);color:var(--kl-on-accent);}
    .klavity-toggle .feat.active{background:var(--kl-accent);color:var(--kl-on-accent);}
    .klavity-page{font-size:12px;color:var(--kl-muted);margin-bottom:12px;}
    /* JTBD 1.8 attached-proof chip: tells the reporter (and later the reviewer, in the drawer) that a
       rolling session replay will ride along with the report. Sits under the page path, above the strip. */
    .klavity-proof{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;}
    .klavity-chip{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;line-height:1;padding:5px 9px;border-radius:999px;background:var(--kl-chip);color:var(--kl-muted);border:1px solid var(--kl-border);}
    .klavity-chip svg{display:block;width:12px;height:12px;}
    .klavity-chip.kl-chip-on{color:var(--kl-accent);background:color-mix(in srgb,var(--kl-chip) 78%,var(--kl-accent) 22%);border-color:color-mix(in srgb,var(--kl-border) 60%,var(--kl-accent) 40%);}
    .klavity-chip.kl-chip-off{opacity:.72;}
    /* overflow-x:auto forces overflow-y to auto (not visible) per CSS spec — adding vertical padding gives
       the absolutely-positioned rm/mk badge ::after hit-area extensions room so they're not clipped. */
    .klavity-strip{display:flex;gap:8px;overflow-x:auto;padding:6px 4px 16px;margin-bottom:6px;min-height:64px;align-items:flex-start;}
    .klavity-thumb{position:relative;flex-shrink:0;}
    .klavity-thumb img{height:72px;width:104px;object-fit:cover;object-position:top center;background:var(--kl-chip);display:block;border-radius:8px;outline:1px solid var(--kl-img-outline);outline-offset:-1px;cursor:pointer;transition:filter .12s;}
    .klavity-thumb img:hover{filter:brightness(.85);}
    /* Portrait (tall) screenshots: widen the thumbnail vertically so more page content is visible. */
    .klavity-thumb.kl-tall img{width:68px;height:110px;}
    /* Remove badge: dark semi-transparent circle — universally visible on all themes/backgrounds. */
    .klavity-rm{position:absolute;top:4px;right:4px;z-index:2;background:rgba(0,0,0,.65);color:#fff;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.35);}
    .klavity-mk{position:absolute;bottom:4px;right:4px;z-index:2;background:var(--kl-accent);color:var(--kl-on-accent);border:none;border-radius:50%;width:22px;height:22px;font-size:13px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.35);}
    /* Extend the 22px badges to a ≥40px hit area without enlarging the visible button. The top (X) and
       bottom (pencil) pseudo-areas don't overlap each other; the pencil shares the image's markup action. */
    .klavity-rm::after,.klavity-mk::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;}
    /* JTBD 1.9 capture-quality badge — a small pill on the top-LEFT of each thumbnail. Sits opposite the
       remove (top-right) + markup (bottom-right) badges so nothing overlaps. Colour-coded by quality:
       sharp = accent, rendered = neutral, wireframe = amber warning (so a degraded shot is never silent). */
    .klavity-qb{position:absolute;top:4px;left:4px;z-index:2;display:inline-flex;align-items:center;gap:3px;max-width:calc(100% - 30px);font-size:9.5px;font-weight:700;line-height:1;padding:3px 6px;border-radius:999px;background:var(--kl-chip);color:var(--kl-fg);box-shadow:0 1px 3px rgba(0,0,0,.28);border:1px solid var(--kl-border);pointer-events:none;}
    .klavity-qb svg{display:block;width:10px;height:10px;}
    .klavity-qb .klavity-qb-t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .klavity-qb.kl-q-real-pixel{color:var(--kl-accent);background:color-mix(in srgb,var(--kl-chip) 74%,var(--kl-accent) 26%);border-color:color-mix(in srgb,var(--kl-border) 55%,var(--kl-accent) 45%);}
    .klavity-qb.kl-q-wireframe{color:#8a5a00;background:#fef3c7;border-color:#f59e0b;}
    /* "Retake sharp" affordance — a full-width pill under the degraded thumbnail (rendered/wireframe).
       Uses the accent so it reads as the fix. Hidden when no onRetakeSharp host callback is wired. */
    .klavity-retake{margin-top:5px;width:100%;display:inline-flex;align-items:center;justify-content:center;gap:4px;font-size:10px;font-weight:700;line-height:1;padding:5px 6px;border:none;border-radius:7px;background:color-mix(in srgb,var(--kl-chip) 70%,var(--kl-accent) 30%);color:var(--kl-accent);cursor:pointer;transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,box-shadow .15s ease;will-change:transform;}
    .klavity-retake svg{display:block;width:11px;height:11px;}
    .klavity-retake:hover{transform:var(--kl-lift);background:color-mix(in srgb,var(--kl-chip) 55%,var(--kl-accent) 45%);box-shadow:0 3px 10px color-mix(in srgb,var(--kl-accent) 26%,transparent);}
    .klavity-retake:active{transform:var(--kl-press);}
    .klavity-retake:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none;}
    .klavity-retake:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klavity-retake.kl-loading{animation:kl-cap-pulse 1s ease-in-out infinite;}
    /* A one-line notice under a thumbnail whose annotations were cleared by a retake (JTBD 1.9 AC). */
    .klavity-retake-note{margin-top:4px;font-size:9.5px;line-height:1.3;color:var(--kl-muted);text-wrap:pretty;}
    @media (prefers-reduced-motion: reduce){.klavity-retake{transition:none!important;}.klavity-retake.kl-loading{animation:none;}}
    .klavity-actions{display:flex;gap:8px;margin-bottom:12px;}
    .klavity-actions button{flex:1;min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px;background:var(--kl-chip);color:var(--kl-fg);border:none;border-radius:8px;cursor:pointer;font-size:12px;line-height:1;}
    .klavity-actions .kl-cap-ic,.klavity-toggle .kl-cap-ic{display:inline-flex;align-items:center;justify-content:center;flex:none;transition:transform .2s cubic-bezier(.34,1.56,.64,1);line-height:1;}
    .klavity-actions .kl-cap-ic svg,.klavity-toggle .kl-cap-ic svg{display:block;width:15px;height:15px;vertical-align:middle;margin:0;}
    .klavity-actions button:hover .kl-cap-ic,.klavity-toggle button:hover .kl-cap-ic,.klavity-actions button:focus-visible .kl-cap-ic,.klavity-toggle button:focus-visible .kl-cap-ic{transform:scale(1.14) rotate(-6deg);}
    .klavity-actions button:active .kl-cap-ic,.klavity-toggle button:active .kl-cap-ic{transform:scale(1.04);}
    /* Re-entrancy state: while a capture/submit is in flight every capture button is disabled (dimmed, no
       hover/press), and the one doing the work pulses to read as "working". */
    .klavity-actions button:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;}
    .klavity-actions button:disabled .kl-cap-ic{transform:none;}
    .klavity-actions button.kl-loading{opacity:.9;animation:kl-cap-pulse 1s ease-in-out infinite;}
    @keyframes kl-cap-pulse{0%,100%{opacity:.55}50%{opacity:.95}}
    .klav-mask-row{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--kl-muted);cursor:pointer;margin-bottom:10px;user-select:none;}
    .klav-mask-row input[type=checkbox]{accent-color:var(--kl-accent);width:13px;height:13px;cursor:pointer;}
    .klav-mask-row:hover{color:var(--kl-fg);}
    .klavity-counter{font-size:11px;color:var(--kl-muted);margin-bottom:8px;font-variant-numeric:tabular-nums;}
    textarea.klavity-desc{width:100%;min-height:100px;resize:vertical;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:8px;padding:10px;font-size:14px;margin-bottom:16px;box-sizing:border-box;box-shadow:0 1px 2px rgba(25,20,15,.04);}
    /* JTBD 1.10: hint shown when the reporter has attached a screenshot but typed nothing — Submit is
       enabled and the AI will title the report. Sits just under the textarea; hidden by default. */
    .klavity-desc-hint{display:flex;align-items:center;gap:6px;margin:-8px 0 14px;font-size:12.5px;color:var(--kl-muted);line-height:1.4;}
    .klavity-desc-hint[hidden]{display:none;}
    .klavity-desc-hint .icon{color:var(--kl-accent);flex:none;}
    input.klavity-remail{width:100%;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:8px;padding:10px;font-size:14px;margin-bottom:10px;box-sizing:border-box;box-shadow:0 1px 2px rgba(25,20,15,.04);}
    .klavity-submit{width:100%;min-height:40px;padding:12px;background:var(--kl-accent);color:var(--kl-on-accent);border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;}
    .klavity-submit:disabled{opacity:.5;cursor:not-allowed;}
    /* Upload progress under Submit — collapsed until a submit is in flight; the fill is animated toward 90%
       over ~10s and snapped to 100% when the request resolves (fetch can't report real upload %). */
    .klavity-progress{height:5px;border-radius:999px;background:var(--kl-chip);overflow:hidden;opacity:0;max-height:0;margin-top:0;transition:opacity .2s ease,max-height .2s ease,margin-top .2s ease;}
    .klavity-progress.show{opacity:1;max-height:5px;margin-top:10px;}
    .klavity-progress-fill{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,color-mix(in srgb,var(--kl-accent) 65%,#fff),var(--kl-accent));}
    .klavity-toast-progress{position:absolute;top:0;left:0;height:3px;background:var(--kl-accent);width:100%;transform-origin:left;animation:kl-toast-decay 5s linear forwards;z-index:10;}
    @keyframes kl-toast-decay{from{transform:scaleX(1)}to{transform:scaleX(0)}}
    .klavity-error{color:#f38ba8;font-size:13px;margin-bottom:8px;display:none;}
    .klavity-success h2{margin:0 0 10px;font-size:24px;font-family:var(--kl-font-display, var(--display, 'Fraunces', serif));font-weight:480;color:var(--kl-fg);display:flex;align-items:center;gap:8px;line-height:1.2;letter-spacing:-.01em;}
    .klavity-success p{margin:0 0 20px;font-size:14.5px;color:var(--kl-muted);line-height:1.5;}
    .klavity-success>h2{animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .05s both;}.klavity-success>p{animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .12s both;}.klavity-lead,.klavity-thanks{animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .18s both;}.klavity-success>.klavity-cta{animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .24s both;}
    .klavity-lead{display:flex;gap:10px;margin-bottom:16px;}
    .klavity-lead input{flex:1;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:99px;padding:9px 16px;font-size:14px;box-sizing:border-box;}
    .klavity-lead input:focus{outline:none;border-color:var(--kl-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--kl-accent) 20%,transparent);}
    .klavity-lead button{position:relative;overflow:hidden;min-height:40px;padding:9px 18px;background:var(--kl-accent);color:var(--kl-on-accent);border:none;border-radius:99px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px color-mix(in srgb,var(--kl-accent) 30%,transparent);}
    .klavity-lead button::after, .klavity-cta::after{content:"";position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent);transform:translateX(-100%);transition:transform .6s ease;}
    .klavity-lead button:hover::after, .klavity-cta:hover::after{transform:translateX(100%);}
    .klavity-lead button:disabled{opacity:.5;cursor:not-allowed;}
    .klavity-thanks{font-size:13px;color:var(--kl-fg);margin-bottom:12px;}
    .klavity-lead-err{font-size:12.5px;color:#f38ba8;margin:-6px 0 14px;line-height:1.4;animation:kl-rise .3s cubic-bezier(.16,1,.3,1) both;}
    .klavity-ref{margin:0 0 18px;font-size:13px;color:var(--kl-muted);display:flex;align-items:center;gap:8px;flex-wrap:wrap;animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .15s both;}
    .klavity-ref code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;background:var(--kl-chip);color:var(--kl-fg);padding:2px 8px;border-radius:6px;user-select:all;}
    .klavity-ref a{color:var(--kl-accent);font-weight:600;text-decoration:underline;text-underline-offset:2px;transition:color .15s ease,transform .15s cubic-bezier(.2,.7,.2,1);display:inline-block;}
    .klavity-ref a:hover{transform:var(--kl-lift);}
    .klavity-ref a:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;border-radius:4px;}
    .klavity-cta{position:relative;overflow:hidden;display:inline-block;padding:12px 20px;background:linear-gradient(135deg,var(--kl-accent),color-mix(in srgb,var(--kl-accent) 70%,#8b5cf6));color:var(--kl-on-accent);border-radius:99px;font-size:14px;font-weight:700;text-decoration:none;margin-bottom:12px;text-align:center;box-shadow:0 4px 14px color-mix(in srgb,var(--kl-accent) 35%,transparent);}
    .klavity-pb{text-align:center;font-size:10px;color:var(--kl-muted);margin-top:12px;}
    .klavity-pb a{color:var(--kl-muted);text-decoration:none;transition:color .15s ease;}
    .klavity-pb a:hover{color:var(--kl-accent);}
    /* ── Button micro-interactions — subtle hover lift/scale + press, Klavity-accent on hover, focus
       rings. Same feel as the right-click menu + dashboard buttons. Transform amounts are CSS vars so
       prefers-reduced-motion can zero them (below). color-mix degrades gracefully if unsupported. ── */
    .klavity-modal{--kl-lift:translateY(-1px) scale(1.02);--kl-press:scale(.97);--kl-bhover:scale(1.05);--kl-bpress:scale(.97);}
    .klavity-toggle button,.klavity-actions button,.klavity-submit,.klavity-lead button,.klavity-cta,textarea.klavity-desc,input.klavity-remail,.klavity-lead input{transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,border-color .15s ease,box-shadow .15s ease,color .15s ease,filter .15s ease;will-change:transform;}
    .klavity-rm,.klavity-mk{transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,color .15s ease,box-shadow .15s ease;will-change:transform;}
    textarea.klavity-desc:hover,input.klavity-remail:hover,.klavity-lead input:hover{transform:var(--kl-lift);border-color:var(--kl-accent);box-shadow:0 7px 18px color-mix(in srgb,var(--kl-accent) 16%,transparent),0 0 0 1px color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    textarea.klavity-desc:focus,input.klavity-remail:focus,.klavity-lead input:focus{outline:none;border-color:var(--kl-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--kl-accent) 20%,transparent),0 8px 20px color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    /* Bug/Feature toggle — lift + soft accent glow (keeps the active chip's highlight intact) */
    .klavity-toggle button:hover{transform:var(--kl-lift);box-shadow:0 4px 12px color-mix(in srgb,var(--kl-accent) 20%,transparent);}
    .klavity-toggle button:active{transform:var(--kl-press);}
    /* Full Page / Upload / Region — lift + accent tint + accent text */
    .klavity-actions button:hover{transform:var(--kl-lift);color:var(--kl-accent);background:color-mix(in srgb,var(--kl-chip) 80%,var(--kl-accent) 20%);box-shadow:0 5px 14px color-mix(in srgb,var(--kl-accent) 22%,transparent);}
    .klavity-actions button:active{transform:var(--kl-press);}
    /* Submit + lead submit + CTA (accent buttons) — lift + brighten + accent-tinted glow */
    .klavity-submit:hover:not(:disabled),.klavity-lead button:hover:not(:disabled),.klavity-cta:hover{transform:var(--kl-lift);filter:brightness(1.05);background:linear-gradient(135deg,var(--kl-accent),color-mix(in srgb,var(--kl-accent) 70%,#8b5cf6));box-shadow:0 8px 22px color-mix(in srgb,var(--kl-accent) 45%,transparent);}
    .klavity-submit:active:not(:disabled),.klavity-lead button:active:not(:disabled),.klavity-cta:active{transform:var(--kl-press);}
    /* Thumbnail action badges (X remove, pencil edit) — pop on hover, press in */
    .klavity-rm:hover{transform:var(--kl-bhover);color:var(--kl-accent);background:color-mix(in srgb,var(--kl-chip) 82%,var(--kl-accent) 18%);box-shadow:0 3px 9px rgba(0,0,0,.22);}
    .klavity-mk:hover{transform:var(--kl-bhover);background:color-mix(in srgb,var(--kl-accent) 85%,#fff);box-shadow:0 3px 9px color-mix(in srgb,var(--kl-accent) 30%,transparent);}
    .klavity-rm:active,.klavity-mk:active{transform:var(--kl-bpress);}
    .klavity-rm svg,.klavity-mk svg{transition:transform .2s ease;will-change:transform;}
    .klavity-rm:hover svg{transform:rotate(90deg);}
    .klavity-mk:hover svg{transform:rotate(15deg) scale(1.1);}
    /* Close (×) — top-right corner; same lift+accent / press / focus feel as the rest. 30px visible button
       with a ::after pseudo extending the hit area to ≥40×40 (sits in the reserved toggle padding, so it
       never overlaps the Bug/Feature buttons). */
    .klavity-x{position:absolute;top:14px;right:14px;z-index:3;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;padding:0;background:transparent;color:var(--kl-muted);border:none;border-radius:9px;cursor:pointer;transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease,color .15s ease;will-change:transform;}
    .klavity-x svg{display:block;transition:transform .25s ease;will-change:transform;}
    .klavity-x:hover svg{transform:rotate(90deg) scale(1.12);}
    .klavity-x::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;}
    .klavity-x:hover{transform:var(--kl-lift);color:var(--kl-accent);background:color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    .klavity-x:active{transform:var(--kl-press);}
    /* Keyboard accessibility — visible focus ring on every control */
    .klavity-toggle button:focus-visible,.klavity-actions button:focus-visible,.klavity-submit:focus-visible,.klavity-lead button:focus-visible,.klavity-cta:focus-visible,.klavity-rm:focus-visible,.klavity-mk:focus-visible,.klavity-x:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    /* ── Screen button: the (i) badge is a purely visual affordance nested inside the button.
       Hovering the entire Screen button shows the floating tooltip (KLA-15/KLA-26/KLA-31). ── */
    #klavity-sharp{flex:1.4;}
    /* Faded (i) circle inside the Screen button — lights up on button hover to signal "info here". */
    .kl-info-badge{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;flex:none;opacity:0.4;transition:opacity .15s ease;}
    .klavity-actions button:hover .kl-info-badge,.klavity-actions button:focus-visible .kl-info-badge{opacity:0.85;}
    /* .klavity-info-pop is kept in markup for its text; visibility is JS-driven via .kl-float-tip so
       the tooltip is rendered outside the overflow:hidden modal and is never clipped. */
    .klavity-info-pop{display:none;}
    /* Floating tooltip — appended to the shadow root (sibling of overlay), position:fixed to viewport so
       overflow:hidden on .klavity-modal cannot clip it. JS positions it with full viewport edge-detection. */
    .kl-float-tip{position:fixed;width:228px;max-width:calc(100vw - 16px);padding:10px 12px;border-radius:10px;background:var(--kl-bg);color:var(--kl-fg);box-shadow:0 0 0 1px var(--kl-border),0 12px 30px rgba(20,16,40,.22);font-size:12px;line-height:1.45;text-align:left;text-wrap:pretty;z-index:2147483647;pointer-events:none;visibility:hidden;opacity:0;transition:opacity .15s ease,visibility .15s step-end;}
    .kl-float-tip.kl-show{visibility:visible;opacity:1;transition:opacity .15s ease;}
    .kl-float-tip b{color:var(--kl-fg);font-weight:600;}
    /* ── Capture-source active/selected indicator (KLA-21) ──────────────────────────────────────
       .kl-active is applied to whichever capture button the user most recently used successfully.
       Uses the same accent palette and transition system as the rest of the modal so it reads as
       "native" — no custom keyframes; the existing press→release spring on transform is enough.
       A small CSS checkmark (rotated L-shape border) appears at the top-right corner as a clear
       "selected" badge without adding any DOM weight. ── */
    .klavity-actions button.kl-active{
      position:relative;
      color:var(--kl-accent);
      background:color-mix(in srgb,var(--kl-accent) 12%,var(--kl-chip));
      box-shadow:0 0 0 1.5px var(--kl-accent),0 4px 14px color-mix(in srgb,var(--kl-accent) 18%,transparent);
    }
    .klavity-actions button.kl-active .kl-cap-ic,.klavity-toggle button.active .kl-cap-ic{color:var(--kl-accent);transform:scale(1.08) rotate(3deg);}
    .klavity-actions button.kl-active::after{
      content:"";position:absolute;top:-4px;right:-4px;
      width:14px;height:14px;border-radius:50%;
      background:var(--kl-accent);
      box-shadow:0 1px 3px rgba(0,0,0,.25);
      z-index:2;
    }
    .klavity-actions button.kl-active::before{
      content:"";position:absolute;top:-4px;right:-4px;
      width:14px;height:14px;
      background-color:var(--kl-on-accent);
      -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E") no-repeat center/8px;
      mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E") no-repeat center/8px;
      z-index:3;
    }
    @media (max-width:430px){.klavity-lead{flex-direction:column}.klavity-lead button{width:100%;}}
    #klavity-voice{position:relative;}
    #klavity-voice .kl-cap-ic{position:relative;}
    .kl-vring{display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;pointer-events:none;}
    .kl-vring-bg{stroke:color-mix(in srgb,var(--kl-border) 80%,transparent);}
    .kl-vring-prog{stroke:var(--kl-accent);transition:stroke .3s ease;}
    #klavity-voice.kl-voice-rec .kl-vring{display:block;}
    #klavity-voice.kl-voice-rec{color:rgb(220 38 38);background:color-mix(in srgb,rgb(220 38 38) 10%,var(--kl-chip));}
    #klavity-voice.kl-voice-warn .kl-vring-prog{stroke:#f97316;}
    .kl-vdot{display:none;position:absolute;top:0;right:0;width:6px;height:6px;border-radius:50%;background:rgb(220 38 38);}
    #klavity-voice.kl-voice-rec .kl-vdot{display:block;animation:kl-vdot-pulse 1.2s ease infinite;}
    @keyframes kl-vdot-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.7);}}
    @media (prefers-reduced-motion: reduce){.klavity-overlay,.klavity-modal,.klavity-modal.kl-closing,.klavity-modal>*, .klavity-toast-progress{animation-duration:.01ms!important;}.klavity-modal{--kl-lift:none;--kl-press:none;--kl-bhover:none;--kl-bpress:none;}.klavity-info,.klavity-rm,.klavity-mk{transition:none!important;}.klavity-actions button.kl-loading{animation:none;}.klavity-actions .kl-cap-ic,.klavity-toggle .kl-cap-ic{transition:none;transform:none!important;}}
  `
  shadowRoot.appendChild(style)

  const overlay = document.createElement('div')
  overlay.className = 'klavity-overlay'

  const modal = document.createElement('div')
  modal.className = 'klavity-modal'
  modal.innerHTML = `
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${icon('x', { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${icon('image', { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
    </div>
    <div class="kl-side" id="klavity-side">
      <div class="klavity-toggle">
        <button class="bug ${initialType === 'bug' ? 'active' : ''}"><span class="kl-cap-ic">${icon('bug')}</span>Bug</button>
        <button class="feat ${initialType === 'feature' ? 'active' : ''}"><span class="kl-cap-ic">${icon('lightbulb')}</span>Feature</button>
      </div>
      <div class="klavity-page">${icon('map-pin')} ${typeof window !== 'undefined' ? escHtml(window.location.pathname) : ''}</div>
      ${callbacks.replayState ? `<div class="klavity-proof"><span class="klavity-chip ${callbacks.replayState === 'attached' ? 'kl-chip-on' : 'kl-chip-off'}" id="klavity-replay-chip">${replayChipInner(callbacks.replayState)}</span></div>` : ''}
      <div class="klavity-actions">
        ${callbacks.onCaptureSharp ? `<button id="klavity-sharp" aria-describedby="klavity-sharp-tip"><span class="kl-cap-ic">${icon('app-window')}</span><span class="kl-sharp-label">Screen</span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip">Screen grabs the <b>whole page — every image, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ''}
        <button id="klavity-full" title="Full Page — instant capture; may miss some cross-origin images"><span class="kl-cap-ic">${icon('camera')}</span><span class="kl-full-label">Full Page</span></button>
        <button id="klavity-upload"><span class="kl-cap-ic">${icon('image')}</span><span class="kl-upload-label">Upload</span></button>
        ${callbacks.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${icon('scissors')}</span><span class="kl-region-label">Region</span></button>` : ''}
        ${VoiceInput.isSupported() ? `<button id="klavity-voice" title="Dictate description"><span class="kl-cap-ic">${icon('mic')}<span class="kl-vdot"></span></span><span class="kl-voice-label">Voice</span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ''}
      </div>
      <label class="klav-mask-row"><input type="checkbox" id="klavity-mask-numbers"${maskOn ? ' checked' : ''}>${icon('eye-off', { size: 13 })}<span>Mask numbers</span></label>
      <input type="file" id="klavity-file" accept="image/*,.heic,.heif" multiple style="display:none">
      <div class="klavity-counter" id="klavity-counter">0/5 images</div>
      <div class="klavity-error" id="klavity-err"></div>
      <textarea class="klavity-desc" id="klavity-desc" placeholder="${initialType === 'feature' ? "Describe the feature you'd like..." : 'Describe the bug...'}"></textarea>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${icon('sparkles', { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${callbacks.requireEmail ? '<input type="email" class="klavity-remail" id="klavity-remail" placeholder="your@email.com" autocomplete="email">' : ''}
      <button class="klavity-submit" id="klavity-submit" title="Submit (S)" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `

  overlay.appendChild(modal)
  shadowRoot.appendChild(overlay)

  const maskChk = shadowRoot.getElementById('klavity-mask-numbers') as HTMLInputElement | null
  if (maskChk) maskChk.addEventListener('change', () => { maskOn = maskChk.checked })

  // ── Floating info tooltip — lives outside the modal so overflow:hidden never clips it. ──
  // .klavity-info-pop in the markup is the text source; we copy its innerHTML into a shadow-root-level
  // div with position:fixed, then position it via getBoundingClientRect with full edge-detection.
  // This sidesteps the overflow:hidden + transform containing-block problem on .klavity-modal.
  const sharpBtn = shadowRoot.getElementById('klavity-sharp') as HTMLButtonElement | null
  const infoPopSource = shadowRoot.querySelector('.klavity-info-pop')
  if (sharpBtn && infoPopSource) {
    const ft = document.createElement('div')
    ft.className = 'kl-float-tip'
    ft.setAttribute('role', 'tooltip')
    ft.innerHTML = infoPopSource.innerHTML
    shadowRoot.appendChild(ft)
    const showTip = () => {
      const r = sharpBtn.getBoundingClientRect()
      const TIP_W = Math.min(228, window.innerWidth - 16)
      const PAD = 8
      const vw = window.innerWidth, vh = window.innerHeight

      // Horizontal: center over the Screen button, clamped to viewport only.
      // The tooltip is position:fixed and lives outside the modal, so there is no overflow
      // clipping — we must NOT constrain to modalRect (that would cause edge clipping).
      const preferredLeft = (r.left + r.width / 2) - TIP_W / 2
      const left = Math.max(PAD, Math.min(preferredLeft, vw - TIP_W - PAD))
      ft.style.left = left + 'px'

      ft.style.top = '-9999px'     // off-screen to measure height before final placement
      ft.style.visibility = 'hidden'
      ft.style.display = 'block'
      const tipH = ft.offsetHeight
      ft.style.display = ''
      ft.style.visibility = ''

      // Vertical: prefer below the button (Screen is near the top of the modal so there's
      // more room below). Flip above if the viewport below is too short.
      let top = r.bottom + 8
      if (top + tipH + PAD > vh) top = r.top - tipH - 8
      top = Math.max(PAD, Math.min(top, vh - tipH - PAD))
      ft.style.top = top + 'px'

      ft.classList.add('kl-show')
    }
    const hideTip = () => ft.classList.remove('kl-show')
    sharpBtn.addEventListener('mouseenter', showTip)
    sharpBtn.addEventListener('mouseleave', hideTip)
    sharpBtn.addEventListener('focus', showTip)
    sharpBtn.addEventListener('blur', hideTip)
  }

  // JTBD 1.8: mutate the attached-proof chip after mount (rrweb loads async). No-op if no chip exists.
  function setReplayState(state: 'attached' | 'unavailable'): void {
    // JTBD 1.10: a resolved replay buffer is evidence — re-evaluate Submit so a replay-only report enables.
    replayAttached = state === 'attached'
    refreshSubmit()
    const chip = shadowRoot.getElementById('klavity-replay-chip') as HTMLElement | null
    if (!chip) return
    chip.classList.toggle('kl-chip-on', state === 'attached')
    chip.classList.toggle('kl-chip-off', state !== 'attached')
    chip.innerHTML = replayChipInner(state)
  }

  const controller: ModalController = {
    shadowRoot,
    addScreenshot,
    close,
    setReplayState,
  }

  function updateStrip() {
    const strip = shadowRoot.getElementById('klavity-strip')!
    const counter = shadowRoot.getElementById('klavity-counter')!
    strip.innerHTML = ''
    screenshots.forEach((dataUrl, i) => {
      const wrap = document.createElement('div')
      wrap.className = 'klavity-thumb'
      if (i === activeIndex) wrap.classList.add('kl-thumb-active')
      const img = document.createElement('img')
      img.src = dataUrl
      img.title = 'Click to select + mark up'
      // Portrait screenshot: add kl-tall so the thumbnail shows more vertical content.
      img.addEventListener('load', () => {
        if (img.naturalHeight > img.naturalWidth * 1.4) wrap.classList.add('kl-tall')
      }, { once: true })
      // Image-hero: clicking a thumbnail selects it as the active shot in the big hero annotator.
      img.addEventListener('click', () => { activeIndex = i; updateStrip() })
      const rm = document.createElement('button')
      rm.className = 'klavity-rm'
      rm.innerHTML = icon('x', { size: 13 })
      rm.title = 'Remove'
      rm.addEventListener('click', (e) => {
        e.stopPropagation()
        screenshots.splice(i, 1)
        screenshotCompressed.splice(i, 1)
        screenshotQuality.splice(i, 1) // JTBD 1.9: keep the quality tags aligned with the shifted indices
        // KLAVITYKLA-217: keep annotationsByIndex aligned with the (now shifted) screenshot indices —
        // drop the removed image's markup and slide every higher index down by one. Without this, submitting
        // the full per-image map would attach an annotation to the wrong screenshot after a mid-strip delete.
        delete annotationsByIndex[i]
        for (const key of Object.keys(annotationsByIndex).map(Number).filter(n => n > i).sort((a, b) => a - b)) {
          annotationsByIndex[key - 1] = annotationsByIndex[key]
          delete annotationsByIndex[key]
        }
        if (screenshots.length === 0) {
          setActiveCapture(null)
        }
        updateStrip()
      })
      const mk = document.createElement('button')
      mk.className = 'klavity-mk'
      mk.innerHTML = icon('pencil', { size: 13 })
      mk.title = 'Mark up'
      mk.addEventListener('click', (e) => { e.stopPropagation(); openAnnotator(i) })
      wrap.append(img, rm, mk)

      // JTBD 1.9: capture-quality badge + guided "Retake sharp". A shot with a known quality tag gets a
      // small pill (sharp/rendered/wireframe); a DEGRADED shot (rendered/wireframe) also gets a full-width
      // "Retake sharp" button that re-captures via the host's real-pixel path and swaps the image in place.
      const quality = screenshotQuality[i]
      if (quality) {
        const meta = QUALITY_META[quality]
        const badge = document.createElement('span')
        badge.className = 'klavity-qb kl-q-' + quality
        badge.title =
          quality === 'real-pixel' ? 'Pixel-perfect capture (every image included)'
          : quality === 'wireframe' ? 'Wireframe fallback — layout only, images not captured. Retake for a sharp shot.'
          : 'Rendered capture — some cross-origin images may be missing. Retake for a sharp shot.'
        badge.innerHTML = icon(meta.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + escHtml(meta.label) + '</span>'
        wrap.appendChild(badge)

        if (meta.degraded && callbacks.onRetakeSharp) {
          const retake = document.createElement('button')
          retake.type = 'button'
          retake.className = 'klavity-retake'
          retake.innerHTML = icon('zap', { size: 11 }) + '<span>Retake sharp</span>'
          retake.title = 'Recapture this shot at full pixel quality'
          retake.addEventListener('click', (e) => { e.stopPropagation(); void retakeSharp(i, retake) })
          wrap.appendChild(retake)
        }
      }
      // A retake that dropped the shot's markup leaves a one-line notice on the thumbnail (AC: annotations
      // are carried OR explicitly cleared with notice — we clear, since the fresh image would misalign them).
      if (retakeClearedNote.has(i)) {
        const note = document.createElement('div')
        note.className = 'klavity-retake-note'
        note.textContent = 'Markup cleared for the retake.'
        wrap.appendChild(note)
      }

      strip.appendChild(wrap)
    })
    counter.textContent = `${screenshots.length}/5 images`
    // JTBD 1.10: attaching/removing a screenshot changes the evidence state → re-evaluate Submit + hint.
    refreshSubmit()
    // Image-hero: keep the big annotator pane in sync with the strip (selection / empty state).
    syncHero()
  }

  // Surface a problem in the shared error line (used for upload + submit failures alike).
  function showError(msg: string) {
    const errEl = shadowRoot.getElementById('klavity-err')
    if (errEl) { errEl.textContent = msg; (errEl as HTMLElement).style.display = 'block' }
  }
  function clearError() {
    const errEl = shadowRoot.getElementById('klavity-err')
    if (errEl) (errEl as HTMLElement).style.display = 'none'
  }

  function addScreenshot(dataUrl: string, quality?: CaptureQuality) {
    // Hard cap — every capture/upload/paste path funnels through here, so the limit holds everywhere.
    if (screenshots.length >= MAX_IMAGES) { showError(`You can attach up to ${MAX_IMAGES} images.`); return }
    clearError()
    screenshots.push(dataUrl)
    // Kick off compression immediately — by submit time the Promise is settled (user was typing).
    screenshotCompressed.push(callbacks.compressImage ? callbacks.compressImage(dataUrl) : Promise.resolve(dataUrl))
    screenshotQuality.push(quality) // JTBD 1.9: stays aligned with screenshots[] (undefined = no badge)
    updateStrip()
  }

  // JTBD 1.9: re-capture a degraded thumbnail via the host's real-pixel path and swap it in place. The
  // host hides its own UI (launcher / composer) during onRetakeSharp so the composer isn't in the pixels.
  // Annotations for that image are dropped (a fresh image would misalign them) with a one-line notice.
  const retakeClearedNote = new Set<number>()
  async function retakeSharp(index: number, btn: HTMLButtonElement) {
    if (busy || !callbacks.onRetakeSharp) return // re-entrancy: a capture/submit is already running
    lockComposer(true)
    btn.classList.add('kl-loading')
    host.style.display = 'none' // keep the composer out of the real-pixel shot
    try {
      const restore = maskOn ? maskNumbers(document.body) : null
      let result: CaptureResult | undefined
      try { result = await callbacks.onRetakeSharp() }
      finally { restore?.() }
      if (result) {
        const { dataUrl, quality } = normalizeCapture(result)
        if (dataUrl) {
          screenshots[index] = dataUrl
          screenshotCompressed[index] = callbacks.compressImage ? callbacks.compressImage(dataUrl) : Promise.resolve(dataUrl)
          screenshotQuality[index] = quality ?? 'real-pixel'
          // Clear any markup on this image — the new capture has different pixels/dimensions.
          if (annotationsByIndex[index]) { delete annotationsByIndex[index]; retakeClearedNote.add(index) }
        }
      }
    } catch { /* user cancelled the share prompt, or capture failed — leave the original shot untouched */ }
    finally {
      host.style.display = ''
      lockComposer(false)
      updateStrip() // repaints the badge (now real-pixel), drops the retake button + shows any notice
    }
  }

  // Image-only validation. Most browsers set file.type to an image/* MIME; HEIC/HEIF (and the odd browser
  // that reports an empty type) are matched by extension as a fallback.
  function isImageFile(file: File): boolean {
    return file.type.startsWith('image/') || /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(file.name)
  }

  // Shared ingestion for the file picker AND clipboard paste: enforce cap + type + size, convert, and
  // surface a clear message on any reject/failure rather than silently dropping or leaving the UI stuck.
  async function ingestFiles(files: File[]) {
    clearError()
    for (const file of files) {
      if (screenshots.length >= MAX_IMAGES) { showError(`You can attach up to ${MAX_IMAGES} images.`); break }
      if (!isImageFile(file)) { showError(`"${file.name}" isn't an image — only image files can be attached.`); continue }
      if (file.size > MAX_FILE_BYTES) { showError(`"${file.name}" is too large — images must be under ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB.`); continue }
      try {
        addScreenshot(await fileToDataUrl(file))
      } catch {
        showError(`Couldn't add "${file.name}". Please try a different image.`)
      }
    }
  }

  let _stopVoice: (() => void) | null = null

  function close() {
    _stopVoice?.()
    if (autodismissTimeout) {
      clearTimeout(autodismissTimeout)
      autodismissTimeout = null
    }
    document.removeEventListener('keydown', escHandler, { capture: true })
    document.removeEventListener('paste', onPaste)
    try { callbacks.onClose?.() } catch { /* never let a listener error block the close */ }
    const m = shadowRoot.querySelector('.klavity-modal') as HTMLElement | null
    if (!m) { host.remove(); return }
    m.classList.add('kl-closing')
    const done = () => host.remove()
    m.addEventListener('animationend', done, { once: true })
    setTimeout(done, 700) // safety if animationend doesn't fire
  }

  function escHandler(e: KeyboardEvent) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return }
    // S submits the report — but only when the user isn't typing and no fullscreen editor owns the keys.
    if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const el = e.target as HTMLElement | null
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
      if (shadowRoot.querySelector('.kl-edtb')) return // fullscreen markup editor is open
      const btn = shadowRoot.getElementById('klavity-submit') as HTMLButtonElement | null
      if (btn && !btn.disabled) { e.preventDefault(); e.stopPropagation(); btn.click() }
    }
  }
  document.addEventListener('keydown', escHandler, { capture: true })

  const onPaste = (e: ClipboardEvent) => {
    if (!e.clipboardData) return
    const imgs = Array.from(e.clipboardData.items)
      .filter(it => it.type.startsWith('image/'))
      .map(it => it.getAsFile())
      .filter((f): f is File => !!f)
    if (imgs.length) void ingestFiles(imgs)
  }
  document.addEventListener('paste', onPaste)

  // Toggle
  const bugBtn = modal.querySelector('.bug') as HTMLButtonElement
  const featBtn = modal.querySelector('.feat') as HTMLButtonElement
  // JTBD 1.10: the composer placeholder follows the Bug/Feature mode ("Describe the feature you'd like…"
  // reads wrong for a bug and vice-versa). `desc` is declared just below; these handlers run post-mount.
  const applyModePlaceholder = () => {
    const el = modal.querySelector('#klavity-desc') as HTMLTextAreaElement | null
    if (el) el.placeholder = currentType === 'feature' ? "Describe the feature you'd like..." : 'Describe the bug...'
  }
  bugBtn.addEventListener('click', () => {
    currentType = 'bug'
    bugBtn.classList.add('active')
    featBtn.classList.remove('active')
    applyModePlaceholder()
  })
  featBtn.addEventListener('click', () => {
    currentType = 'feature'
    featBtn.classList.add('active')
    bugBtn.classList.remove('active')
    applyModePlaceholder()
  })

  // Submit
  const desc = modal.querySelector('#klavity-desc') as HTMLTextAreaElement
  const submitBtn = modal.querySelector('#klavity-submit') as HTMLButtonElement
  const remail = modal.querySelector('#klavity-remail') as HTMLInputElement | null
  const descHint = modal.querySelector('#klavity-desc-hint') as HTMLElement | null
  // Submit is enabled only when there's a description AND (if a required email field is shown) a valid email.
  const emailValid = () => !callbacks.requireEmail || (!!remail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(remail.value.trim()))
  // JTBD 1.10: a screenshot (or an attached replay buffer) is evidence in its own right — Submit no longer
  // requires typed prose. The server accepts an evidence-only report and the AI drafts the title post-intake.
  const hasEvidence = () => screenshots.length > 0 || replayAttached
  const refreshSubmit = () => {
    const noDesc = desc.value.trim() === ''
    submitBtn.disabled = (noDesc && !hasEvidence()) || !emailValid()
    // Hint appears only when evidence is present but nothing has been typed ("we'll title it from your shot").
    if (descHint) descHint.hidden = !(noDesc && hasEvidence())
  }
  desc.addEventListener('input', refreshSubmit)
  remail?.addEventListener('input', refreshSubmit)
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })
  modal.querySelector('#klavity-x')?.addEventListener('click', () => close())

  // Re-entrancy guard (Dev 6 audit #3): block double-click / cross-firing while a capture OR submit is in
  // flight. `lockComposer(true)` disables every capture button (Sharp/Full Page/Upload/Region) and Submit;
  // releasing restores Submit to its validity state. Each action also early-returns when `busy` so a
  // queued double-click can't slip through before the disabled attribute paints.
  const captureBtnEls = () => Array.from(modal.querySelectorAll('.klavity-actions button:not(#klavity-voice)')) as HTMLButtonElement[]
  let busy = false
  const lockComposer = (on: boolean) => {
    busy = on
    captureBtnEls().forEach(b => { b.disabled = on })
    if (on) submitBtn.disabled = true
    else refreshSubmit()
  }
  // KLA-21: active-source indicator — moves .kl-active + aria-pressed to the chosen capture button
  // so the user can see which source is currently selected. Call on every successful capture/ingest.
  const setActiveCapture = (btn: HTMLButtonElement | null) => {
    captureBtnEls().forEach(b => { b.classList.remove('kl-active'); b.removeAttribute('aria-pressed') })
    if (btn) { btn.classList.add('kl-active'); btn.setAttribute('aria-pressed', 'true') }
  }

  const voiceBtn = modal.querySelector('#klavity-voice') as HTMLButtonElement | null
  if (voiceBtn) {
    const voice = new VoiceInput()
    const CIRCUMFERENCE = 81.68
    const WARN_THRESHOLD_MS = 15000
    const ringProg = voiceBtn.querySelector('.kl-vring-prog') as SVGCircleElement | null
    let rafId = 0, startTime = 0, voiceRecording = false

    const startRing = () => {
      startTime = Date.now()
      const tick = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / 180000, 1)
        ringProg?.setAttribute('stroke-dashoffset', String(progress * CIRCUMFERENCE))
        if (elapsed >= 180000 - WARN_THRESHOLD_MS) voiceBtn.classList.add('kl-voice-warn')
        if (elapsed >= 180000) {
          voice.stop()  // belt-and-suspenders: VoiceInput's own timer also fires at 180s
          return
        }
        rafId = requestAnimationFrame(tick)
      }
      rafId = requestAnimationFrame(tick)
    }

    const stopRing = () => {
      cancelAnimationFrame(rafId)
      ringProg?.setAttribute('stroke-dashoffset', String(CIRCUMFERENCE))
      voiceBtn.classList.remove('kl-voice-warn')
    }

    voice.onTranscript = (text) => {
      const existing = desc.value
      desc.value = existing + (existing.length > 0 && !/\s$/.test(existing) ? ' ' : '') + text
      refreshSubmit()
    }

    voice.onError = (_, message) => {
      if (!message) return
      let errEl = shadowRoot.getElementById('klavity-voice-err')
      if (!errEl) {
        errEl = document.createElement('div')
        errEl.id = 'klavity-voice-err'
        errEl.style.cssText = 'color:rgb(220 38 38);font-size:12px;margin-top:4px;opacity:1;'
        desc.insertAdjacentElement('afterend', errEl)
      }
      errEl.style.opacity = '1'
      errEl.style.transition = ''
      errEl.textContent = message
      errEl.style.transition = 'opacity .3s ease'
      setTimeout(() => { if (errEl) errEl.style.opacity = '0' }, 3700)
      setTimeout(() => { if (errEl) { errEl.textContent = ''; errEl.style.opacity = '1'; errEl.style.transition = '' } }, 4000)
    }

    voice.onStop = () => {
      voiceRecording = false
      voiceBtn.classList.remove('kl-voice-rec')
      stopRing()
    }

    voiceBtn.addEventListener('click', () => {
      if (!voiceRecording) {
        voiceRecording = true; voiceBtn.classList.add('kl-voice-rec'); voice.start(); startRing()
      } else {
        voice.stop()
      }
    })

    _stopVoice = () => { if (voiceRecording) voice.stop() }
  }

  submitBtn.addEventListener('click', async () => {
    if (busy || submitBtn.disabled) return // re-entrancy: ignore double-clicks / clicks while a capture runs
    const description = desc.value.trim()
    lockComposer(true) // disable Submit + every capture button for the duration of the upload
    submitBtn.textContent = 'Uploading…'
    const errEl = shadowRoot.getElementById('klavity-err')!
    errEl.style.display = 'none'
    // Upload progress: fetch can't report real upload %, so animate an estimated bar toward 90% over ~10s
    // and snap to 100% only when the request resolves — it never falsely reads complete early.
    const progress = shadowRoot.getElementById('klavity-progress') as HTMLElement | null
    const fill = shadowRoot.getElementById('klavity-progress-fill') as HTMLElement | null
    if (progress && fill) {
      progress.classList.add('show')
      fill.style.transition = 'none'; fill.style.width = '8%'
      void fill.offsetWidth // reflow so the next transition animates
      fill.style.transition = 'width 10s cubic-bezier(.05,.7,.2,1)'
      requestAnimationFrame(() => { fill.style.width = '90%' })
    }
    const finishProgress = () => { if (fill) { fill.style.transition = 'width .25s ease'; fill.style.width = '100%' } }
    const resetProgress = () => { if (progress && fill) { progress.classList.remove('show'); fill.style.transition = 'none'; fill.style.width = '0' } }
    try {
      // Await pre-compressed screenshots (kicked off at capture time). For a user who typed for a few
      // seconds, these Promises are already settled — zero wait. Falls back to the raw dataUrl when
      // compressImage is not provided (e.g. extension path).
      const finalScreenshots = await Promise.all(screenshotCompressed)
      const result = await callbacks.onSubmit({ type: currentType, description, screenshots: finalScreenshots, annotations: buildAnnotationsPayload(), reporterEmail: remail?.value.trim() || undefined })
      finishProgress()
      if (callbacks.success) {
        // Mode-aware lead/CTA screen rendered THROUGH the existing themed modal — no auto-close;
        // the user must interact (submit email or click the CTA, or dismiss via overlay/esc).
        renderSuccess(result.issueKey, result.issueUrl, callbacks.success)
      } else {
        // Their themed auto-close card: custom thank-you (2600ms) or "check-circle Filed as KEY".
        // When the host resolved a dashboard link (authed reporters only — extension / logged-in
        // session), append it and hold the card a little longer so the link is actually clickable.
        const wrap = document.createElement('div')
        wrap.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;'
        const card = document.createElement('div')
        card.style.cssText = 'background:var(--kl-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:var(--kl-radius);padding:32px;font-family:var(--kl-font,system-ui),sans-serif;font-size:16px;text-align:center;box-shadow:var(--kl-shadow);'
        let cardLink = ''
        if (cfg.thankYou) {
          card.textContent = cfg.thankYou
        } else {
          card.innerHTML = `${icon('check-circle', { label: 'Filed', size: 20 })} Filed as `
          card.appendChild(document.createTextNode(displayRef(result.issueKey)))
          cardLink = safeHttpUrl(result.issueUrl)
          if (cardLink) {
            const a = document.createElement('a')
            a.href = cardLink
            a.target = '_blank'
            a.rel = 'noopener'
            a.textContent = 'View in dashboard'
            a.style.cssText = 'display:block;margin-top:12px;font-size:14px;font-weight:600;color:var(--kl-accent);text-decoration:underline;text-underline-offset:2px;'
            card.appendChild(a)
          }
        }
        wrap.appendChild(card)
        // keep the themed style element; swap only the body
        overlay.remove()
        shadowRoot.appendChild(wrap)
        setTimeout(close, cfg.thankYou ? 2600 : cardLink ? 4000 : 1500)
      }
    } catch (err) {
      // Upload failed — surface the error and re-open the composer (never leave it stuck/disabled).
      resetProgress()
      errEl.textContent = (err as Error).message
      errEl.style.display = 'block'
      submitBtn.textContent = 'Submit'
      lockComposer(false) // re-enable capture buttons + Submit (Submit only if still valid)
    }
  })

  // Capture buttons — each is guarded against double-click / re-entrancy via `busy`/lockComposer.
  const fullBtn = modal.querySelector('#klavity-full') as HTMLButtonElement
  fullBtn.addEventListener('click', async () => {
    if (busy) return
    lockComposer(true)
    fullBtn.classList.add('kl-loading')
    try {
      const restore = maskOn ? maskNumbers(document.body) : null
      try {
        const { dataUrl, quality } = normalizeCapture(await callbacks.onCaptureFull())
        addScreenshot(dataUrl, quality); setActiveCapture(fullBtn)
      }
      finally { restore?.() }
    }
    catch { /* ignore */ }
    finally { fullBtn.classList.remove('kl-loading'); lockComposer(false) }
  })
  if (sharpBtn && callbacks.onCaptureSharp) {
    // The "Sharp" word lives in its own span so the "Capturing…" state never clobbers the icon or the
    // embedded (i) (setting button.textContent would wipe both).
    const sharpLabel = sharpBtn.querySelector('.kl-sharp-label') as HTMLElement | null
    const runSharp = async () => {
      if (busy) return // re-entrancy: a capture/submit is already running
      lockComposer(true)
      sharpBtn.classList.add('kl-loading')
      // Hide the composer so it isn't in the captured pixels. onCaptureSharp calls getDisplayMedia as its
      // first step, so the click's user gesture (required by the permission prompt) is preserved.
      host.style.display = 'none'
      const target = sharpLabel ?? sharpBtn
      const orig = target.textContent
      target.textContent = 'Capturing…'
      try {
        const restore = maskOn ? maskNumbers(document.body) : null
        let shot: CaptureResult | undefined
        try { shot = await callbacks.onCaptureSharp!() }
        finally { restore?.() }
        if (shot) {
          const { dataUrl, quality } = normalizeCapture(shot)
          if (dataUrl) { addScreenshot(dataUrl, quality ?? 'real-pixel'); setActiveCapture(sharpBtn) }
        }
      } catch { /* user cancelled the share prompt, or capture failed — just restore */ }
      finally {
        host.style.display = ''
        target.textContent = orig
        sharpBtn.classList.remove('kl-loading')
        lockComposer(false)
      }
    }
    // ONE click → straight to the screen-share permission. getDisplayMedia runs synchronously inside the
    // handler (preserving the click's user gesture).
    sharpBtn.addEventListener('click', () => { void runSharp() })

  }
  const fileInput = modal.querySelector('#klavity-file') as HTMLInputElement
  const uploadBtn = modal.querySelector('#klavity-upload') as HTMLButtonElement
  uploadBtn.addEventListener('click', () => {
    if (busy || screenshots.length >= MAX_IMAGES) {
      if (screenshots.length >= MAX_IMAGES) showError(`You can attach up to ${MAX_IMAGES} images.`)
      return
    }
    fileInput.click()
  })
  fileInput.addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement
    const files = input.files ? Array.from(input.files) : []
    input.value = '' // reset so re-selecting the SAME file fires change again (and clears stuck state)
    if (files.length) {
      const before = screenshots.length
      await ingestFiles(files) // ingestFiles enforces cap + type + size + failure handling
      if (screenshots.length > before) setActiveCapture(uploadBtn) // at least one file was accepted
    }
  })

  // Region capture button — only rendered when the host provides onRegionCapture
  const regionBtn = shadowRoot.getElementById('klavity-region') as HTMLButtonElement | null
  if (regionBtn && callbacks.onRegionCapture) {
    regionBtn.onclick = () => {
      if (busy) return // re-entrancy: a capture/submit is already running
      lockComposer(true)
      // Remove the modal's own Esc handler so pressing Esc during region-select only
      // cancels the overlay and does NOT also close the modal.  It is re-added by the
      // cleanup() callback inside mountRegionOverlay (both the cancel and pointerup paths).
      document.removeEventListener('keydown', escHandler, { capture: true })
      host.style.display = 'none'
      mountRegionOverlay(async (rect) => {
        // Re-register the modal Esc handler now that the overlay is gone (success path).
        document.addEventListener('keydown', escHandler, { capture: true })
        try {
          const restore = maskOn ? maskNumbers(document.body) : null
          let shot: CaptureResult | undefined
          try { shot = await callbacks.onRegionCapture!(rect) }
          finally { restore?.() }
          if (shot) {
            const { dataUrl, quality } = normalizeCapture(shot)
            if (dataUrl) { addScreenshot(dataUrl, quality); setActiveCapture(regionBtn) }
          }
        } finally {
          host.style.display = ''
          lockComposer(false)
        }
      }, () => {
        // Re-register the modal Esc handler now that the overlay is gone (cancel/Esc path).
        document.addEventListener('keydown', escHandler, { capture: true })
        // Esc/cancel — re-show the host without calling onRegionCapture
        host.style.display = ''
        lockComposer(false)
      })
    }
  }

  // ── Image-hero inline annotator ─────────────────────────────────────────────────────────────
  // A small inline SVG helper for tool glyphs the shared icon set doesn't ship (circle/arrow/text/undo).
  function heroGlyph(inner: string, size = 15): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${inner}</svg>`
  }
  function heroToolbarHtml(): string {
    const t = (name: string, label: string, glyph: string, key: string) =>
      `<button type="button" class="kl-htool" data-tool="${name}" title="${label} (${key.toUpperCase()})" aria-label="${label}">${glyph}<span class="kl-hk">${key.toUpperCase()}</span></button>`
    const c = (col: string) => `<button type="button" class="kl-hcolor" data-color="${col}" style="background:${col}" title="${col}" aria-label="Colour ${col}"></button>`
    return (
      t('pen', 'Pen', icon('pencil', { size: 15 }), 'p') +
      t('line', 'Line', heroGlyph('<line x1="5" y1="19" x2="19" y2="5"/>'), 'l') +
      t('rect', 'Rectangle', icon('square', { size: 15 }), 'r') +
      t('circle', 'Circle', heroGlyph('<circle cx="12" cy="12" r="9"/>'), 'o') +
      t('arrow', 'Arrow', heroGlyph('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), 'a') +
      t('text', 'Text', heroGlyph('<path d="M5 6h14M12 6v13M9 19h6"/>'), 't') +
      t('count', 'Numbers', heroGlyph('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), 'c') +
      t('crop', 'Crop', heroGlyph('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), 'k') +
      `<span class="kl-hsep"></span>` +
      c('#ef4444') + c('#f97316') + c('#3b82f6') + c('#111827') +
      // Contextual text options — shown only while the Text tool is active (toggled in selectTool).
      `<span class="kl-htextopts" id="kl-hero-textopts" hidden>` +
        `<span class="kl-hsep"></span>` +
        `<span class="kl-hlabel">Outline</span>` +
        `<button type="button" class="kl-hopt kl-on" data-outline="black" title="Black outline"><span class="kl-osq" style="background:#111"></span></button>` +
        `<button type="button" class="kl-hopt" data-outline="white" title="White outline"><span class="kl-osq" style="background:#fff;border:1px solid #999"></span></button>` +
        `<button type="button" class="kl-hopt" data-outline="none" title="No outline">None</button>` +
        `<span class="kl-hlabel">Size</span>` +
        `<button type="button" class="kl-hopt" data-size="18" title="Small">S</button>` +
        `<button type="button" class="kl-hopt kl-on" data-size="26" title="Medium">M</button>` +
        `<button type="button" class="kl-hopt" data-size="40" title="Large">L</button>` +
      `</span>` +
      `<span class="kl-hsep"></span>` +
      `<button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (⌘Z)" aria-label="Undo">${heroGlyph('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` +
      `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${icon('trash-2', { size: 14 })}</button>` +
      `<span class="kl-hgrow"></span>` +
      `<span class="kl-hhint">P pen · L line · R rect · O circle · T text · C numbers · K crop</span>`
    )
  }

  function detachHeroKeys() {
    if (heroKeyHandler) { document.removeEventListener('keydown', heroKeyHandler, { capture: true } as any); heroKeyHandler = null }
  }

  function renderHeroEmpty() {
    const stage = shadowRoot.getElementById('klavity-hero-stage')
    const tools = shadowRoot.getElementById('klavity-hero-tools')
    if (tools) tools.innerHTML = ''
    if (stage) stage.innerHTML = `<div class="kl-hero-empty">${icon('image', { size: 34 })}<span>Capture or upload a screenshot to start marking it up</span></div>`
    detachHeroKeys()
  }

  // Keep the hero pane in sync with the strip: clamp the active index, show the empty state when there
  // are no shots, otherwise mount the inline annotator on the active screenshot.
  function syncHero() {
    if (screenshots.length === 0) { activeIndex = 0; renderHeroEmpty(); return }
    if (activeIndex >= screenshots.length) activeIndex = screenshots.length - 1
    if (activeIndex < 0) activeIndex = 0
    mountHeroAnnotator(activeIndex)
  }

  // Destructive crop: replace screenshots[index] with the selected region of the CLEAN image and rebase
  // that image's markup into the new origin. Browser-only (needs a real 2D context); no-op if unavailable.
  function applyHeroCrop(index: number, rx: number, ry: number, rw: number, rh: number) {
    const srcUrl = screenshots[index]
    if (!srcUrl) return
    const src = new Image()
    src.onload = () => {
      if (screenshots[index] !== srcUrl) return // selection changed / removed while decoding
      const cc = document.createElement('canvas')
      cc.width = Math.max(1, Math.round(rw))
      cc.height = Math.max(1, Math.round(rh))
      const cx = cc.getContext('2d')
      if (!cx) return
      cx.drawImage(src, rx, ry, rw, rh, 0, 0, cc.width, cc.height)
      let cropped: string
      try { cropped = cc.toDataURL('image/png') } catch { return }
      screenshots[index] = cropped
      screenshotCompressed[index] = callbacks.compressImage ? callbacks.compressImage(cropped) : Promise.resolve(cropped)
      const prevShapes = annotationsByIndex[index]?.shapes as Shape[] | undefined
      if (Array.isArray(prevShapes) && prevShapes.length) {
        annotationsByIndex[index] = { w: cc.width, h: cc.height, shapes: translateShapes(prevShapes, -rx, -ry) }
      } else {
        delete annotationsByIndex[index]
      }
      updateStrip()
    }
    src.src = srcUrl
  }

  function mountHeroAnnotator(index: number) {
    const stage = shadowRoot.getElementById('klavity-hero-stage')
    const tools = shadowRoot.getElementById('klavity-hero-tools')
    if (!stage || !tools) return
    const dataUrl = screenshots[index]
    if (!dataUrl) { renderHeroEmpty(); return }
    detachHeroKeys()

    // Build the canvas + toolbar SYNCHRONOUSLY (so the hero is populated immediately and is testable in
    // headless envs). The natural image dimensions are applied async once the bitmap decodes.
    stage.innerHTML = ''
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    canvas.style.cssText = 'display:block;max-width:100%;max-height:100%;object-fit:contain;cursor:crosshair;touch-action:none;background:#fff;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);'
    const annotator = new Annotator(canvas, dataUrl)
    const prior = annotationsByIndex[index]?.shapes
    if (Array.isArray(prior)) prior.forEach((s: any) => annotator.shapes.push({ ...s }))
    stage.appendChild(canvas)
    // Size the canvas to the real image once it decodes, then repaint (no-op in headless envs).
    const sizer = new Image()
    sizer.onload = () => {
      if (!document.body.contains(host) || activeIndex !== index || screenshots[index] !== dataUrl) return
      canvas.width = sizer.naturalWidth || 1
      canvas.height = sizer.naturalHeight || 1
      annotator.redraw()
    }
    sizer.src = dataUrl
    annotator.redraw()

    {
      tools.innerHTML = heroToolbarHtml()
      let activeTool = 'pen'
      let activeColor = '#ef4444'
      let textSize = 26
      let textOutline: 'black' | 'white' | 'none' = 'black'
      const textOpts = tools.querySelector('#kl-hero-textopts') as HTMLElement | null
      const persist = () => {
        if (annotator.shapes.length) annotationsByIndex[index] = { w: canvas.width, h: canvas.height, shapes: annotator.shapes.map(s => ({ ...s })) }
        else delete annotationsByIndex[index]
      }
      const selectTool = (t: string) => {
        activeTool = t
        tools.querySelectorAll<HTMLElement>('[data-tool]').forEach(el => el.classList.toggle('kl-on', el.dataset.tool === t))
        if (textOpts) textOpts.hidden = t !== 'text'
      }
      const selectColor = (col: string, btn?: HTMLElement) => {
        activeColor = col
        tools.querySelectorAll<HTMLElement>('[data-color]').forEach(el => el.classList.toggle('kl-on', el === btn))
      }
      tools.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => selectTool((b as HTMLElement).dataset.tool!)))
      tools.querySelectorAll('[data-color]').forEach(b => b.addEventListener('click', () => selectColor((b as HTMLElement).dataset.color!, b as HTMLElement)))
      tools.querySelectorAll('[data-outline]').forEach(b => b.addEventListener('click', () => {
        textOutline = (b as HTMLElement).dataset.outline as 'black' | 'white' | 'none'
        tools.querySelectorAll<HTMLElement>('[data-outline]').forEach(el => el.classList.toggle('kl-on', el === b))
      }))
      tools.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => {
        textSize = Number((b as HTMLElement).dataset.size)
        tools.querySelectorAll<HTMLElement>('[data-size]').forEach(el => el.classList.toggle('kl-on', el === b))
      }))
      tools.querySelector('#kl-hero-undo')?.addEventListener('click', () => { annotator.undo(); persist() })
      tools.querySelector('#kl-hero-clear')?.addEventListener('click', () => { annotator.clearAll(); persist() })
      selectTool(activeTool)
      selectColor(activeColor, tools.querySelector('[data-color]') as HTMLElement)

      // Map a pointer event to image-pixel coordinates (canvas is object-fit:contain, so letterboxing
      // is possible — use the rendered content box, not the element box).
      const toImg = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect()
        const s = Math.min(r.width / canvas.width, r.height / canvas.height) || 1
        const dispW = canvas.width * s, dispH = canvas.height * s
        const offX = (r.width - dispW) / 2, offY = (r.height - dispH) / 2
        return { x: (e.clientX - r.left - offX) / s, y: (e.clientY - r.top - offY) / s }
      }
      // Numbered-pin counter continues from any pins already on this image.
      let countN = annotator.shapes.reduce((m, s: any) => s.type === 'count' ? Math.max(m, s.n) : m, 0)
      let drawing = false, startX = 0, startY = 0, penPoints: Array<{ x: number; y: number }> = []
      // Crop drag state: a dashed overlay box tracks the selection in stage-relative pixels.
      let cropBox: HTMLDivElement | null = null
      let cropClient = { x: 0, y: 0 }
      canvas.addEventListener('pointerdown', (e) => {
        const pt = toImg(e); startX = pt.x; startY = pt.y
        if (activeTool === 'crop') {
          drawing = true
          cropClient = { x: e.clientX, y: e.clientY }
          cropBox = document.createElement('div')
          cropBox.style.cssText = 'position:absolute;border:2px dashed #6c63ff;background:rgba(108,99,255,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;'
          stage.appendChild(cropBox)
          return
        }
        if (activeTool === 'text') {
          const input = document.createElement('input')
          const shadow = textOutline === 'none' ? 'none' : `0 0 2px ${textOutline}, 0 0 2px ${textOutline}`
          input.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;background:transparent;border:1px dashed ${activeColor};color:${activeColor};font-size:${textSize}px;font-weight:700;text-shadow:${shadow};outline:none;z-index:2147483647;min-width:80px;`
          const sz = textSize, ol = textOutline
          document.body.appendChild(input); input.focus()
          input.addEventListener('blur', () => { if (input.value.trim()) { annotator.addShape({ type: 'text', color: activeColor, x: startX, y: startY, text: input.value.trim(), size: sz, outline: ol }); persist() } input.remove() }, { once: true })
          input.addEventListener('keydown', (ke) => { if (ke.key === 'Enter') input.blur(); ke.stopPropagation() })
          return
        }
        if (activeTool === 'count') {
          annotator.addShape({ type: 'count', color: activeColor, x: pt.x, y: pt.y, n: ++countN })
          persist()
          return
        }
        drawing = true
        if (activeTool === 'pen') penPoints = [pt]
      })
      canvas.addEventListener('pointermove', (e) => {
        if (!drawing) return
        if (activeTool === 'pen') { penPoints.push(toImg(e)); return }
        if (activeTool === 'crop' && cropBox) {
          const sr = stage.getBoundingClientRect()
          const x1 = Math.min(cropClient.x, e.clientX), y1 = Math.min(cropClient.y, e.clientY)
          const x2 = Math.max(cropClient.x, e.clientX), y2 = Math.max(cropClient.y, e.clientY)
          cropBox.style.left = (x1 - sr.left) + 'px'
          cropBox.style.top = (y1 - sr.top) + 'px'
          cropBox.style.width = (x2 - x1) + 'px'
          cropBox.style.height = (y2 - y1) + 'px'
        }
      })
      canvas.addEventListener('pointerup', (e) => {
        if (!drawing) return
        drawing = false
        const pt = toImg(e)
        if (activeTool === 'crop') {
          if (cropBox) { cropBox.remove(); cropBox = null }
          const rx = Math.max(0, Math.min(startX, pt.x)), ry = Math.max(0, Math.min(startY, pt.y))
          const rw = Math.abs(pt.x - startX), rh = Math.abs(pt.y - startY)
          if (rw > 4 && rh > 4) applyHeroCrop(index, rx, ry, rw, rh)
          return
        }
        if (activeTool === 'pen' && penPoints.length > 1) annotator.addShape({ type: 'pen', color: activeColor, points: penPoints })
        else if (activeTool === 'line') annotator.addShape({ type: 'line', color: activeColor, x1: startX, y1: startY, x2: pt.x, y2: pt.y })
        else if (activeTool === 'rect') annotator.addShape({ type: 'rect', color: activeColor, x: Math.min(startX, pt.x), y: Math.min(startY, pt.y), w: Math.abs(pt.x - startX), h: Math.abs(pt.y - startY) })
        else if (activeTool === 'circle') annotator.addShape({ type: 'circle', color: activeColor, x: (startX + pt.x) / 2, y: (startY + pt.y) / 2, rx: Math.abs(pt.x - startX) / 2, ry: Math.abs(pt.y - startY) / 2 })
        else if (activeTool === 'arrow') annotator.addShape({ type: 'arrow', color: activeColor, x1: startX, y1: startY, x2: pt.x, y2: pt.y })
        persist()
      })

      const TOOL_KEYS: Record<string, string> = { p: 'pen', l: 'line', r: 'rect', o: 'circle', a: 'arrow', t: 'text', c: 'count', k: 'crop' }
      heroKeyHandler = (e: KeyboardEvent) => {
        if (!document.body.contains(host)) { detachHeroKeys(); return }
        const el = e.target as HTMLElement | null
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); annotator.undo(); persist(); return }
        if (e.metaKey || e.ctrlKey || e.altKey) return
        const k = e.key.toLowerCase()
        if (TOOL_KEYS[k]) { e.preventDefault(); selectTool(TOOL_KEYS[k]) }
      }
      document.addEventListener('keydown', heroKeyHandler, { capture: true })
    }
  }

  // Annotator
  function openAnnotator(index: number) {
    const dataUrl = screenshots[index]
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const annotator = new Annotator(canvas, dataUrl)
      annotator.redraw()

      const editor = document.createElement('div')
      editor.style.cssText = 'position:fixed;inset:0;background:#000;z-index:2147483647;display:flex;flex-direction:column;pointer-events:all;'
      const toolbar = document.createElement('div')
      toolbar.className = 'kl-edtb'
      toolbar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;background:#1e1e2e;flex-wrap:wrap;'
      const keyHint = (k: string) => `<span style="opacity:.45;margin-left:5px;font-size:11px;">${k}</span>`
      toolbar.innerHTML = `
        <button data-tool="pen" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${icon('pencil', { size: 14 })} Pen</button>
        <button data-tool="rect" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${icon('square', { size: 14 })} Rect</button>
        <button data-tool="arrow" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">↗ Arrow</button>
        <button data-tool="text" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">T Text</button>
        <button data-color="#ef4444" style="background:#ef4444;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#f97316" style="background:#f97316;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#3b82f6" style="background:#3b82f6;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#111827" style="background:#111827;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;border:1px solid #555;"></button>
        <span style="display:inline-flex;align-items:center;gap:4px;margin-left:6px;">
          <button id="klavity-zoom-out" class="kl-zb" title="Zoom out" aria-label="Zoom out">−</button>
          <span id="klavity-zoom-pct" style="min-width:46px;text-align:center;color:#a6adc8;font-size:12px;font-variant-numeric:tabular-nums;">100%</span>
          <button id="klavity-zoom-in" class="kl-zb" title="Zoom in" aria-label="Zoom in">+</button>
          <button id="klavity-fit-width" class="kl-zb" title="Fit to width (best for tall pages)" style="font-size:11.5px;">Fit&nbsp;W</button>
          <button id="klavity-fit-page" class="kl-zb" title="Fit the whole page" style="font-size:11.5px;">Fit&nbsp;page</button>
        </span>
        <button id="klavity-undo" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;margin-left:auto;">↩ Undo</button>
        <button id="klavity-clear-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${icon('trash-2', { size: 14 })} Clear</button>
        <button id="klavity-save-ann" style="padding:6px 10px;background:#89b4fa;color:#1e1e2e;border:none;border-radius:4px;cursor:pointer;font-weight:700;">${icon('check', { label: 'Save', size: 14 })} Save</button>
        <button id="klavity-cancel-ann" style="padding:6px 10px;background:#313244;color:#cdd6f4;border:none;border-radius:4px;cursor:pointer;">${icon('x', { size: 14 })}</button>
      `
      // The canvas is rendered at an EXPLICIT CSS size (set by applyScale) inside a scrollable workspace —
      // no object-fit letterboxing — so a tall full-page capture renders at a readable width and scrolls
      // vertically instead of collapsing to a thin sliver. touch-action:none keeps touch drags drawing.
      canvas.style.cssText = 'cursor:crosshair;display:block;margin:12px auto;touch-action:none;background:#fff;border-radius:4px;outline:1px solid rgba(255,255,255,.12);outline-offset:-1px;box-shadow:0 12px 44px rgba(0,0,0,.55);'
      const scroller = document.createElement('div')
      scroller.style.cssText = 'flex:1;min-height:0;overflow:auto;display:block;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);'
      scroller.appendChild(canvas)
      // Scoped polish for the editor controls (press scale, hover, focus rings) — kept in a <style> since
      // the editor is built with inline styles and has no access to the modal's class CSS.
      const cstyle = document.createElement('style')
      cstyle.textContent =
        '.kl-edtb button{transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;will-change:transform;}' +
        // Hover lift + brighten — parity with the composer/right-click-menu buttons (was press-only here).
        '.kl-edtb button:hover{transform:translateY(-1px) scale(1.02);background:#45475a;}' +
        '.kl-edtb button[data-color]:hover{transform:scale(1.14);background:initial;}' +
        '.kl-edtb button:active{transform:scale(.96);}' +
        '.kl-edtb button:focus-visible{outline:2px solid #89b4fa;outline-offset:2px;}' +
        '.kl-edtb .kl-zb{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 9px;background:#313244;color:#cdd6f4;border:none;border-radius:8px;cursor:pointer;font-size:15px;font-weight:600;line-height:1;}' +
        '.kl-edtb .kl-zb:hover{background:#45475a;}' +
        '@media (prefers-reduced-motion:reduce){.kl-edtb button{transition:none;}.kl-edtb button:hover,.kl-edtb button:active,.kl-edtb button[data-color]:hover{transform:none;}}'
      editor.append(cstyle, toolbar, scroller)
      shadowRoot.appendChild(editor)

      // ── Zoom / fit: render the image at a readable scale (CSS px per image px). Default fit-WIDTH for
      // tall captures (so they don't become a sliver) and fit-WHOLE for normal ones. toImg() below maps via
      // getBoundingClientRect(), so coordinates stay correct at ANY scale + scroll position. ──
      let scale = 1
      const clampScale = (s: number) => Math.max(0.05, Math.min(5, s || 1))
      function applyScale(s: number) {
        scale = clampScale(s)
        canvas.style.width = Math.round(canvas.width * scale) + 'px'
        canvas.style.height = Math.round(canvas.height * scale) + 'px'
        const lbl = toolbar.querySelector('#klavity-zoom-pct') as HTMLElement | null
        if (lbl) lbl.textContent = Math.round(scale * 100) + '%'
      }
      const fitWidthScale = () => (Math.max(1, scroller.clientWidth - 24)) / canvas.width
      const fitPageScale = () => Math.min((Math.max(1, scroller.clientWidth - 24)) / canvas.width, (Math.max(1, scroller.clientHeight - 24)) / canvas.height)
      // Default: tall image (taller aspect than the workspace) → fit width; otherwise fit the whole page.
      const tall = (canvas.height / canvas.width) > (Math.max(1, scroller.clientHeight) / Math.max(1, scroller.clientWidth))
      applyScale(tall ? fitWidthScale() : fitPageScale())
      toolbar.querySelector('#klavity-zoom-in')!.addEventListener('click', () => applyScale(scale * 1.25))
      toolbar.querySelector('#klavity-zoom-out')!.addEventListener('click', () => applyScale(scale / 1.25))
      toolbar.querySelector('#klavity-fit-width')!.addEventListener('click', () => applyScale(fitWidthScale()))
      toolbar.querySelector('#klavity-fit-page')!.addEventListener('click', () => applyScale(fitPageScale()))

      let activeTool = 'rect'
      let activeColor = '#ef4444'
      let drawing = false
      let penPoints: Array<{ x: number; y: number }> = []
      let startX = 0
      let startY = 0

      // Reflect the active tool on the toolbar so keyboard switching (and clicks) have visual feedback.
      function selectTool(tool: string) {
        activeTool = tool
        toolbar.querySelectorAll<HTMLElement>('[data-tool]').forEach(el => {
          const on = el.dataset.tool === tool
          el.style.background = on ? '#585b70' : '#313244'
          el.style.outline = on ? '2px solid #89b4fa' : 'none'
        })
      }
      toolbar.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => selectTool((b as HTMLElement).dataset.tool!)))
      toolbar.querySelectorAll('[data-color]').forEach(b => b.addEventListener('click', () => { activeColor = (b as HTMLElement).dataset.color! }))
      toolbar.querySelector('#klavity-undo')!.addEventListener('click', () => annotator.undo())
      toolbar.querySelector('#klavity-clear-ann')!.addEventListener('click', () => annotator.clearAll())

      // Single keydown handler for the editor lifetime: tool shortcuts + undo + Esc-to-cancel.
      // Skipped while typing into the text-annotation input so letters land as text, not tool switches.
      const TOOL_KEYS: Record<string, string> = { p: 'pen', r: 'rect', c: 'circle', a: 'arrow', t: 'text' }
      function onKeyDown(e: KeyboardEvent) {
        const t = e.target as HTMLElement | null
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
        if (e.key === 'Escape') { e.stopPropagation(); close(); return }
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); annotator.undo(); return }
        if (e.metaKey || e.ctrlKey || e.altKey) return
        const k = e.key.toLowerCase()
        if (TOOL_KEYS[k]) { e.preventDefault(); selectTool(TOOL_KEYS[k]) }
        else if (k === 'u') { e.preventDefault(); annotator.undo() }
      }
      function close() {
        document.removeEventListener('keydown', onKeyDown, { capture: true })
        editor.remove()
      }
      document.addEventListener('keydown', onKeyDown, { capture: true })
      selectTool(activeTool)

      toolbar.querySelector('#klavity-save-ann')!.addEventListener('click', async () => {
        // Keep the CLEAN screenshot; the drawn shapes travel as a structured overlay (re-rendered
        // toggleable + zoomable in the ticket) instead of being flattened into the image.
        if (annotator.shapes.length) {
          annotationsByIndex[index] = { w: canvas.width, h: canvas.height, shapes: annotator.shapes.map(s => ({ ...s })) }
          screenshots[index] = dataUrl
        } else {
          delete annotationsByIndex[index]
        }
        close()
        updateStrip()
      })
      toolbar.querySelector('#klavity-cancel-ann')!.addEventListener('click', () => close())

      function toImg(e: PointerEvent) {
        const r = canvas.getBoundingClientRect()
        return { x: ((e.clientX - r.left) / r.width) * canvas.width, y: ((e.clientY - r.top) / r.height) * canvas.height }
      }

      canvas.addEventListener('pointerdown', (e) => {
        drawing = true
        const pt = toImg(e);
        ({ x: startX, y: startY } = pt)
        if (activeTool === 'pen') penPoints = [pt]
        if (activeTool === 'text') {
          drawing = false
          const input = document.createElement('input')
          input.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;background:transparent;border:1px dashed ${activeColor};color:${activeColor};font-size:16px;outline:none;z-index:9999999;min-width:80px;`
          document.body.appendChild(input)
          input.focus()
          input.addEventListener('blur', () => {
            if (input.value.trim()) annotator.addShape({ type: 'text', color: activeColor, x: startX, y: startY, text: input.value.trim() })
            input.remove()
          }, { once: true })
          input.addEventListener('keydown', (ke) => { if (ke.key === 'Enter') input.blur() })
        }
      })

      canvas.addEventListener('pointermove', (e) => {
        if (!drawing) return
        if (activeTool === 'pen') penPoints.push(toImg(e))
      })

      canvas.addEventListener('pointerup', (e) => {
        if (!drawing) return
        drawing = false
        const pt = toImg(e)
        if (activeTool === 'pen' && penPoints.length > 1) {
          annotator.addShape({ type: 'pen', color: activeColor, points: penPoints })
        } else if (activeTool === 'rect') {
          annotator.addShape({ type: 'rect', color: activeColor, x: Math.min(startX, pt.x), y: Math.min(startY, pt.y), w: Math.abs(pt.x - startX), h: Math.abs(pt.y - startY) })
        } else if (activeTool === 'circle') {
          annotator.addShape({ type: 'circle', color: activeColor, x: (startX + pt.x) / 2, y: (startY + pt.y) / 2, rx: Math.abs(pt.x - startX) / 2, ry: Math.abs(pt.y - startY) / 2 })
        } else if (activeTool === 'arrow') {
          annotator.addShape({ type: 'arrow', color: activeColor, x1: startX, y1: startY, x2: pt.x, y2: pt.y })
        }
      })
    }
    img.src = dataUrl
  }

  // Mode-aware success screen: swap the modal body in-place (keeps the themed modal element + its
  // Genie animation + injected --kl-* vars) for headline/body, optional email-lead capture, optional
  // CTA, and an always-on "Powered by Klavity" footer. Dynamic data (feedbackId, email) is never
  // injected via innerHTML — only static copy uses innerHTML — matching this file's XSS guards.
  function renderSuccess(feedbackId: string, issueUrl: string, success: NonNullable<ModalCallbacks['success']>) {
    const { copy, onLead } = success
    modal.innerHTML = ''
    const wrap = document.createElement('div')
    wrap.className = 'klavity-success'

    const h = document.createElement('h2')
    // copy.headline is static host-supplied copy (not user/LLM data) and may contain icon SVG HTML.
    h.innerHTML = copy.headline
    wrap.appendChild(h)

    if (copy.body) {
      const p = document.createElement('p')
      p.textContent = copy.body
      wrap.appendChild(p)
    }

    // Ticket reference — always shown when we have one, so even an anonymous end-user on a
    // customer's site can quote it to support ("my report fb_1a2b3c4d"). The "View in dashboard"
    // link renders ONLY when the host resolved a real http(s) issueUrl: the server returns one
    // solely for authed reporters (extension / logged-in session), never for anonymous widget
    // submissions, where a dashboard link would be useless and leak app structure. Dynamic values
    // go in via textContent/href assignment (never innerHTML) per this file's XSS guards.
    if (feedbackId) {
      const ref = document.createElement('div')
      ref.className = 'klavity-ref'
      const label = document.createElement('span')
      label.textContent = 'Filed as'
      const code = document.createElement('code')
      code.textContent = displayRef(feedbackId)
      ref.append(label, code)
      const linkUrl = safeHttpUrl(issueUrl)
      if (linkUrl) {
        const a = document.createElement('a')
        a.href = linkUrl
        a.target = '_blank'
        a.rel = 'noopener'
        a.textContent = 'View in dashboard'
        ref.appendChild(a)
      }
      wrap.appendChild(ref)
    }

    const startAutodismiss = () => {
      if (autodismissTimeout) return
      const progressBar = document.createElement('div')
      progressBar.className = 'klavity-toast-progress'
      modal.appendChild(progressBar)
      // Hover-to-pause (KLAVITYKLA-32 follow-up): while the pointer (or keyboard focus) is on the
      // toast, freeze both the close timer and the draining progress bar; on leave, resume with
      // only the remaining time. Manual close() still clears the pending timeout as before.
      let remainingMs = 5000
      let startedAt = Date.now()
      const arm = () => {
        startedAt = Date.now()
        autodismissTimeout = setTimeout(() => {
          close()
        }, remainingMs)
      }
      const pause = () => {
        if (!autodismissTimeout) return
        clearTimeout(autodismissTimeout)
        autodismissTimeout = null
        remainingMs = Math.max(0, remainingMs - (Date.now() - startedAt))
        progressBar.style.animationPlayState = 'paused'
      }
      const resume = () => {
        if (autodismissTimeout || modal.classList.contains('kl-closing')) return
        progressBar.style.animationPlayState = 'running'
        arm()
      }
      modal.addEventListener('mouseenter', pause)
      modal.addEventListener('mouseleave', resume)
      // Keyboard users get the same affordance: focus inside the toast pauses, leaving it resumes.
      modal.addEventListener('focusin', pause)
      modal.addEventListener('focusout', (e: FocusEvent) => {
        if (!modal.contains(e.relatedTarget as Node | null)) resume()
      })
      arm()
    }

    if (copy.showEmail) {
      const row = document.createElement('div')
      row.className = 'klavity-lead'
      const input = document.createElement('input')
      input.type = 'email'
      input.placeholder = 'you@company.com'
      const btn = document.createElement('button')
      const btnLabel = copy.emailLabel
      btn.textContent = btnLabel
      // JTBD 1.13 — inline error under the lead form. A dropped lead must be VISIBLE to the visitor
      // (with a retry) instead of a false "we'll be in touch". Lives right below the input row.
      const err = document.createElement('div')
      err.className = 'klavity-lead-err'
      err.setAttribute('role', 'alert')
      err.style.display = 'none'
      const submitLead = async () => {
        const email = input.value.trim()
        // Basic client-side shape check so an obviously-empty/invalid email doesn't round-trip; the
        // server is still the authority and re-validates. A bad email is a non-silent, retryable state.
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          err.textContent = 'Please enter a valid email so we can reach you.'
          err.style.display = 'block'
          input.focus()
          return
        }
        btn.disabled = true
        btn.textContent = 'Saving…'
        err.style.display = 'none'
        try {
          if (onLead) await onLead(feedbackId, email)
        } catch (e) {
          // Do NOT confirm on failure — the lead was not durably captured. Re-enable so the visitor can
          // retry (transient network / webhook / server error). Log for telemetry without leaking to UI.
          try { console.warn('[Klavity] lead capture failed:', (e as Error)?.message || e) } catch {}
          err.textContent = "Couldn't save your email — please try again."
          err.style.display = 'block'
          btn.disabled = false
          btn.textContent = 'Retry'
          input.focus()
          return
        }
        // Only reached on a real 2xx + persisted ack from the server.
        const thanks = document.createElement('div')
        thanks.className = 'klavity-thanks'
        thanks.textContent = "Thanks — we'll be in touch."
        err.remove()
        row.replaceWith(thanks)
        if (!copy.showCta) {
          startAutodismiss()
        }
      }
      btn.addEventListener('click', submitLead)
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitLead() })
      row.append(input, btn)
      wrap.appendChild(row)
      wrap.appendChild(err)
    }

    if (copy.showCta && copy.ctaUrl) {
      const a = document.createElement('a')
      a.className = 'klavity-cta'
      a.href = copy.ctaUrl
      a.target = '_blank'
      a.rel = 'noopener'
      a.textContent = copy.ctaText
      wrap.appendChild(a)
    }

    modal.appendChild(wrap)

    if (!cfg.whiteLabel) {
      const pb = document.createElement('div')
      pb.className = 'klavity-pb'
      pb.innerHTML = `Powered by <a href="https://klavity.in" target="_blank" rel="noopener">Klavity</a>`
      modal.appendChild(pb)
    }

    if (!copy.showEmail && !copy.showCta) {
      startAutodismiss()
    }
  }

  if (callbacks.autoCaptureOnOpen) {
    setTimeout(() => {
      callbacks.onCaptureFull()
        .then(shot => {
          const { dataUrl, quality } = normalizeCapture(shot)
          addScreenshot(dataUrl, quality)
          setActiveCapture(fullBtn)
        })
        .catch(() => {})
    }, 200)
  }

  return controller
}

/**
 * Mounts a drag-to-select overlay on document.body.
 * Ported from packages/extension/src/content.ts:401-507 (startRegion).
 * Coords are CSS pixels — the host callback handles DPR scaling.
 *
 * @param onRect  Called with the selected {x,y,w,h} rect when the user finishes dragging.
 * @param onCancel Called when the user presses Esc (no rect provided; overlay already removed).
 */
function mountRegionOverlay(
  onRect: (rect: { x: number; y: number; w: number; h: number }) => void,
  onCancel: () => void,
): void {
  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;cursor:crosshair;z-index:2147483646;user-select:none;'
  overlay.setAttribute('data-klavity-region-overlay', '')
  document.body.appendChild(overlay)

  const hint = document.createElement('div')
  hint.textContent = 'Drag to select an area · Esc to cancel'
  hint.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:system-ui;font-size:14px;background:rgba(0,0,0,.7);padding:8px 16px;border-radius:6px;pointer-events:none;z-index:2147483647;'
  document.body.appendChild(hint)

  let startX = 0, startY = 0, active = false

  function cleanup() {
    document.removeEventListener('keydown', escHandler, { capture: true })
    overlay.remove()
    hint.remove()
  }

  function escHandler(e: KeyboardEvent) {
    if (e.key === 'Escape') { e.stopPropagation(); cleanup(); onCancel() }
  }
  document.addEventListener('keydown', escHandler, { capture: true })

  overlay.addEventListener('pointerdown', (e) => {
    active = true
    startX = e.clientX
    startY = e.clientY
    hint.remove()
  })

  overlay.addEventListener('pointermove', (e) => {
    if (!active) return
    const x = Math.min(e.clientX, startX)
    const y = Math.min(e.clientY, startY)
    const w = Math.abs(e.clientX - startX)
    const h = Math.abs(e.clientY - startY)
    overlay.style.background = `
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) 0 0/${x}px 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${x + w}px 0/calc(100% - ${x + w}px) 100%,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${x}px 0/${w}px ${y}px,
      linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)) ${x}px ${y + h}px/${w}px calc(100% - ${y + h}px)
    `
    overlay.style.backgroundRepeat = 'no-repeat'
  })

  overlay.addEventListener('pointerup', (e) => {
    if (!active) return
    active = false
    const w = Math.abs(e.clientX - startX)
    const h = Math.abs(e.clientY - startY)
    if (w < 8 || h < 8) { cleanup(); onCancel(); return }

    const rect = { x: Math.min(e.clientX, startX), y: Math.min(e.clientY, startY), w, h }
    cleanup()
    onRect(rect)
  })
}

async function fileToDataUrl(file: File): Promise<string> {
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.endsWith('.heic') || file.name.endsWith('.heif')) {
    // HEIC→JPEG conversion uses heic2any (libheif compiled to WASM). Its Emscripten/embind glue calls
    // new Function() at module-eval, which strict-CSP customer sites (script-src without 'unsafe-eval')
    // block with an EvalError — that previously crashed the whole widget on mount. So heic2any is NOT
    // bundled into the embeddable widget IIFE (externalized in vite.widget.config.ts); the extension,
    // which runs outside customer CSP, still bundles it. When it's unavailable OR conversion/CSP fails,
    // degrade gracefully to uploading the raw file rather than throwing.
    try {
      const heic2any = (await import('heic2any')).default
      const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 }) as Blob
      return blobToDataUrl(blob)
    } catch { /* heic2any absent (widget) or conversion failed — fall back to the raw file */ }
  }
  return blobToDataUrl(file)
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
