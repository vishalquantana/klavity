import type { ReportType, IssueKind, ReportFileAttachment, ReportRecording, Shape } from './types'
import { Annotator } from './annotator'
import { themeCss, resolveModalConfig, type ModalConfig } from './modal-theme'
import { icon } from './icons'
import { VoiceInput, LiveDictation, StreamingDictation, pickDictationMode } from './voice-input'
import { maskNumbers } from './mask-numbers'
import { scoreReportClarity, shouldFetchClarityTip, shouldNudgeOnSubmit, suppressesAutoCapturedAsk } from './report-clarity'
import { safeRemove } from './safe-remove'
import { klavityAttributionUrl } from './attribution'
import {
  clampZoom, wheelZoomFactor, zoomEasing, zoomTowardPan, visibleImageRect,
  minimapToImage, panForImageCenter, heroLogoHref,
} from './hero-zoom'

// Re-exported here so the widget + extension can import the shared right-click-drag region gesture from
// the same module they already use for buildModal (avoids adding a package.json export entry, which the
// orchestrator's version-stamp ownership could clobber).
export { installRegionDrag, isEditableTarget, isLinkTarget, type RegionDragHandle, type RegionDragOptions } from './region-drag'

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

// ── KLA-586: WhatsApp-style live Markdown for the description field ───────────────────────────────────
// The description is a contenteditable div whose SOURCE OF TRUTH is raw Markdown TEXT (round-trips through
// the .value accessor untouched). renderInlineMarkdown() paints that raw text for display: it KEEPS the
// markers ( * _ ~ ` ) visible-but-dimmed and styles the wrapped span, exactly like WhatsApp. It is HTML-safe
// (escapes first) and pure, so it's unit-testable independent of the DOM. Newlines become <br>.
export function renderInlineMarkdown(text: string): string {
  let t = escHtml(String(text ?? ''))
  // Order matters: code first (so * _ ~ inside `code` aren't re-interpreted), then bold/italic/strike.
  t = t.replace(/`([^`\n]+)`/g, (_m, x) => `<span class="kl-mk">\`</span><code>${x}</code><span class="kl-mk">\`</span>`)
  t = t.replace(/\*([^*\n]+)\*/g, (_m, x) => `<span class="kl-mk">*</span><b>${x}</b><span class="kl-mk">*</span>`)
  t = t.replace(/_([^_\n]+)_/g, (_m, x) => `<span class="kl-mk">_</span><i>${x}</i><span class="kl-mk">_</span>`)
  t = t.replace(/~([^~\n]+)~/g, (_m, x) => `<span class="kl-mk">~</span><s>${x}</s><span class="kl-mk">~</span>`)
  t = t.replace(/\n/g, '<br>')
  return t
}

// descPlainText: extract the RAW Markdown source from the field's DOM without relying on innerText (jsdom +
// happy-dom don't implement it). Walks the tree: text nodes contribute their text verbatim, <br> and any
// block element (a <div>/<p> the browser transiently inserts on Enter, before render() normalises it back to
// <br>) become a newline. This exactly round-trips the controlled markup renderInlineMarkdown() produces.
export function descPlainText(root: Node): string {
  let out = ''
  const walk = (node: Node): void => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) {
        out += child.textContent || ''
      } else if (child.nodeName === 'BR') {
        out += '\n'
      } else if (child.nodeType === 1) {
        const el = child as HTMLElement
        const block = /^(DIV|P)$/.test(el.nodeName)
        if (block && out && !out.endsWith('\n')) out += '\n'
        walk(el)
      }
    }
  }
  walk(root)
  return out
}

// A structural bug-draft the Enhance endpoint returns (mirrors prototype/lib/report-enhance.ts EnhancedDraft
// without importing across the package boundary). Kept loose (severity/priority as strings) so the composer
// never rejects a shape the server already validated.
export interface EnhanceDraftLike {
  summary: string
  actualResult: string
  expectedResult: string
  stepsToReproduce: string[]
  suggestedSeverity: string
  suggestedPriority: string
  confidence?: number
}

// renderDraftToWhatsApp: compose the field body from an accepted Enhance draft as WhatsApp-style Markdown so
// it renders formatted LIVE in the field (bold summary + *Actual:* / *Expected:* labels, a numbered Steps
// block, and a final Severity·Priority line). Pure + exported for tests. Skips empty sections.
export function renderDraftToWhatsApp(d: EnhanceDraftLike): string {
  const parts: string[] = []
  if (d.summary) parts.push(`*${d.summary}*`)
  const ae: string[] = []
  if (d.actualResult) ae.push(`*Actual:* ${d.actualResult}`)
  if (d.expectedResult) ae.push(`*Expected:* ${d.expectedResult}`)
  if (ae.length) parts.push(ae.join('\n'))
  if (d.stepsToReproduce && d.stepsToReproduce.length) {
    const steps = d.stepsToReproduce.map((s, i) => `${i + 1}. ${s}`).join('\n')
    parts.push(`*Steps to reproduce:*\n${steps}`)
  }
  if (d.suggestedSeverity || d.suggestedPriority) {
    parts.push(`*Severity: ${d.suggestedSeverity}* · Priority: ${d.suggestedPriority}`)
  }
  return parts.join('\n\n')
}

// KLAVITYKLA-493: the reporter-facing "Replay · 60s" chip is intentionally NOT rendered (it read like an
// action and confused users). Session-replay CAPTURE is unchanged — the widget keeps feeding replayEvents
// into the submit payload and the server still stores them; replayState/setReplayState() are kept purely
// for evidence gating so a replay-only report can Submit. The old chip markup helper was removed.

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

/**
 * A capture callback may return the raw dataUrl (legacy) OR { dataUrl, quality } (JTBD 1.9). KLAVITYKLA-473
 * adds an optional `suggestSharp`: the host detected IN THE BROWSER (no server call, no getDisplayMedia)
 * that the DOM render came back blank or only partial (cross-origin images dropped to white gaps), so the
 * composer should nudge the user toward the Screen button — the sharp capture stays a user-gesture click.
 */
export type CaptureResult = string | { dataUrl: string; quality?: CaptureQuality; suggestSharp?: boolean; blank?: boolean }

/** Normalise a {@link CaptureResult} (raw dataUrl or { dataUrl, quality, suggestSharp, blank }) to a uniform shape.
 * `blank` = the DOM render came back essentially empty/white (detected in-browser). The auto-capture-on-open
 * path uses it to skip seeding a useless white image and instead show the "couldn't capture — Snap" empty state. */
function normalizeCapture(r: CaptureResult): { dataUrl: string; quality?: CaptureQuality; suggestSharp?: boolean; blank?: boolean } {
  return typeof r === 'string' ? { dataUrl: r } : { dataUrl: r.dataUrl, quality: r.quality, suggestSharp: r.suggestSharp, blank: r.blank }
}

/**
 * KLA-587 (founder decision, 2026-08-25): real "Screen" capture (getDisplayMedia) is the ACTUAL DEFAULT
 * capture fired when the composer opens — this deliberately REVERSES the earlier #460/#473 "never auto-invoke
 * getDisplayMedia" stance. The founder explicitly wants the share picker on first use and accepts the
 * one-prompt friction, because Screen is the only path that captures pixel-perfect fidelity AND cross-origin
 * embedded iframes. A future dev should NOT re-revert this as a regression — see KLA-587.
 *
 * The pieces below are PURE (no DOM / no browser API) so the default-capture decision and the decline→fallback
 * classification are unit-testable independent of getDisplayMedia (which is browser-only).
 */
export type DefaultCaptureMode = 'screen' | 'viewport' | 'full' | 'none'

/**
 * Pick the capture path fired on composer open. Screen is the default when the host wired it AND opted into
 * the Screen-default (browsers that support getDisplayMedia); it degrades to the rendered viewport capture,
 * then the full render, then nothing — so the reporter is NEVER left with no way to capture.
 */
export function defaultCaptureMode(caps: {
  screenCaptureDefault?: boolean
  onCaptureSharp?: unknown
  onCaptureViewport?: unknown
  onCaptureFull?: unknown
}): DefaultCaptureMode {
  if (caps.screenCaptureDefault && typeof caps.onCaptureSharp === 'function') return 'screen'
  if (typeof caps.onCaptureViewport === 'function') return 'viewport'
  if (typeof caps.onCaptureFull === 'function') return 'full'
  return 'none'
}

/**
 * Classify a getDisplayMedia rejection as an EXPECTED decline (user cancelled the picker, or the browser
 * refused because the user-gesture was already spent) vs a genuine error. In every one of these we silently
 * fall back to the rendered capture with NO error toast (per the founder decision) — this helper only decides
 * whether the failure is also worth a dev-console warning.
 */
export function isScreenDeclineError(err: unknown): boolean {
  const name = err && typeof err === 'object' && 'name' in err ? String((err as { name?: unknown }).name) : ''
  return name === 'NotAllowedError' || name === 'AbortError' || name === 'NotFoundError' || name === 'InvalidStateError'
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

// KLAVITYKLA-371 (JTBD 1.11 enhancement): a reporter-picked element target. Carries both the CSS
// selector (machine-usable AutoSim assert feedstock) and a human-readable text snippet (for the
// ticket drawer). Returned by onPickElement so the host can include text alongside the selector.
export interface PickedTarget {
  /** Robust CSS selector: prefers #id, then stable class chain, else nth-of-type path from body. */
  selector: string
  /** Short human snippet: element tag + its visible text/label (up to 80 chars). */
  text: string
  /** KLAVITYKLA-494: optional cropped screenshot (dataUrl) of the picked element's bounding box. When the
   *  host's picker can produce it, the composer adds it to the images strip (respecting the MAX_IMAGES cap).
   *  Absent → only the selector/text is pinned, exactly as before. */
  shot?: string
  /** Capture-quality tag for `shot` (drives the thumbnail badge), when the host supplied a crop. */
  shotQuality?: CaptureQuality
  /** KLA-621: picked element's bounding rect (CSS viewport px) at capture time — lets Retake redo THIS element. */
  rect?: { x: number; y: number; w: number; h: number }
}

// KLAVITYKLA-241 (JTBD A.11): a known/recurring issue matched against the reporter's in-progress prose.
// Returned by onCheckKnown so the composer can render a pre-submit "we already know about this" ack.
export interface KnownIssueMatch {
  title: string          // short display title of the known issue
  statusLabel: string    // human status ("open", "in progress", "fixed", "reopened", ...)
  count?: number         // total occurrences (≥2 means recurring)
  regressed?: boolean    // true when the issue was fixed then broke again
  headline?: string      // optional amplified recurrence headline ("Keeps coming back · 3x")
}

// KLA-412 (multi-page evidence): per-shot page tag. Rendered as a small mono label under the thumbnail
// so the reporter can see which page each screenshot came from. All fields optional + additive — a shot
// with no page metadata renders exactly as before (no label), so single-page reports are unchanged.
export interface ShotPageMeta {
  pageUrl?: string
  pagePath?: string
  label?: string
}

// KLA-621: per-shot capture PROVENANCE so "Retake" redoes the SAME thing the shot came from instead of
// collapsing to a full-screen grab. A region shot re-crops its rect; a picked-element shot re-crops that
// element (re-resolved live from its selector); a viewport/full shot redoes that same sharp mode. Carried
// index-aligned with screenshots[] and threaded to onRetakeSharp so the host knows exactly what to redo.
export interface ShotCapture {
  kind: 'region' | 'element' | 'viewport' | 'full' | 'other'
  /** Region/element bounding rect in CSS viewport px at capture time (fallback if a selector re-resolve fails). */
  rect?: { x: number; y: number; w: number; h: number }
  /** For kind==='element': the CSS selector so Retake can re-resolve a fresh rect after scroll/layout shifts. */
  selector?: string
}

export interface ModalCallbacks {
  // Each capture callback may return a raw dataUrl (legacy) or { dataUrl, quality } (JTBD 1.9). The quality
  // tag drives the thumbnail badge + the "Retake sharp" affordance. onCaptureFull is 'rendered'/'wireframe'
  // on the widget (html-to-image / fetch-free) and 'real-pixel' on the extension (captureVisibleTab stitch).
  onCaptureFull: () => Promise<CaptureResult>
  // KLAVITYKLA-509 (viewport-first capture): an OPTIONAL fast above-the-fold render. When provided, the
  // auto-capture-on-open and "Full Page" flows show this immediately as the first preview (~1s), then run
  // the slower onCaptureFull() in the BACKGROUND and swap it in when ready — the composer never blocks on
  // the full render. Absent → behaviour is identical to before (onCaptureFull runs directly, with the
  // "Capturing…" skeleton). Kept optional + additive so the extension (which has no fast viewport path) is
  // unaffected.
  onCaptureViewport?: () => Promise<CaptureResult>
  onRegionCapture?: (rect: { x: number; y: number; w: number; h: number }) => Promise<CaptureResult>
  // Optional "sharp" real-pixel capture (the widget's getDisplayMedia scroll-stitch — captures cross-origin
  // images with no CORS issues). When provided, a "Sharp" button is rendered; the modal hides itself during
  // the capture so the composer isn't in the shot. Feature-detected by the host (absent on iOS Safari →
  // button hidden → users fall back to the html-to-image "Full Page").
  onCaptureSharp?: () => Promise<CaptureResult>
  // KLA composer-polish (viewport-default, founder PX4 repro): the SAME getDisplayMedia real-pixel path as
  // onCaptureSharp but capturing a SINGLE VISIBLE-VIEWPORT frame (no scroll-stitch → not a tall full-page
  // image). When wired, the on-open DEFAULT Screen capture uses THIS so the auto shot is viewport-scoped
  // (what the reporter actually sees). The manual "Screen" button still uses the full-page onCaptureSharp,
  // and "Full Page" stays an explicit opt-in. Absent → the default falls back to onCaptureSharp (unchanged).
  onCaptureSharpViewport?: () => Promise<CaptureResult>
  // JTBD 1.9: the real-pixel "Retake sharp" path invoked from a degraded (rendered/wireframe) thumbnail's
  // badge. Returns a fresh real-pixel capture that replaces the degraded image in place. On the widget this
  // is the getDisplayMedia screen-share; on the extension it's the captureVisibleTab full-page capture. The
  // host hides its own UI during the capture (same as the Sharp button). Absent → no retake affordance.
  // KLA-621: Retake now receives the ORIGINAL shot's capture provenance so it can redo the SAME selection —
  // re-crop the same region rect, or re-crop the same picked element (re-resolved from its selector) — instead
  // of falling back to a full-viewport grab and losing the selection. Backward compatible: hosts that ignore
  // the argument keep the old full-frame behaviour. Absent → no retake affordance.
  onRetakeSharp?: (capture?: ShotCapture) => Promise<CaptureResult>
  // KLAVITYKLA-228/371 (JTBD 1.11): optional on-page element picker. When provided, a "Pick element"
  // button appears in the capture actions row. Clicking it hides the composer and invokes this callback,
  // which lets the reporter click the broken element on the live page; it resolves a PickedTarget
  // ({ selector, text }) so the report carries both a machine-usable CSS selector (AutoSim feedstock)
  // and a human-readable snippet (shown in the chip + ticket drawer), or null if cancelled.
  // Widget-only — the extension omits it (no button rendered), preserving parity.
  onPickElement?: () => Promise<PickedTarget | null>
  // KLAVITYKLA-241 (JTBD A.11): optional pre-submit known-issue check. When provided, the composer
  // calls it (debounced) as the reporter types a description. Given the current text, it resolves the
  // closest matching known/recurring issue for this project — or null when nothing matches. On a match,
  // an inline acknowledgment appears above Submit ("Already reported — status: X") so the user isn't
  // filing a duplicate blind; they can still submit (their report bumps the known issue's recurrence)
  // or dismiss the note. Widget/host-only — the extension omits it, preserving parity.
  onCheckKnown?: (description: string) => Promise<KnownIssueMatch | null>
  // Report-clarity AI tip (the "password strength, for bug reports" helper). When the config enables
  // reportClarity, the composer renders a live client-side heuristic meter + coverage chips synchronously,
  // and — ~1s after typing stops, only when the text is non-trivial AND not yet Great — calls this to get a
  // single short, specific tip from the cheap-LLM endpoint (POST /api/report/clarity). Best-effort: any
  // failure resolves null and the meter/chips still render. Only wired by the widget when clarity is on; the
  // extension omits it. Result cached by the host so it's one call per meaningful change.
  // KLAVITYKLA-492: the second arg carries the context Klavity has ALREADY captured for this report so the
  // host can forward it to the clarity endpoint — the coach must never ask the reporter for anything already
  // on the report (URL/screenshot/browser/screen). `images` is the current screenshot count in the composer.
  onClarityTip?: (text: string, ctx?: { images?: number }) => Promise<{ tip: string } | null>
  // KLA-586 (AI "Enhance"): the heavier, opt-in rung above the clarity coach. When wired, an "Enhance with
  // AI" button appears under the description; clicking it hands the reporter's current text + the primary
  // captured screenshot + the picked element to this callback, which POSTs /api/report/enhance and resolves
  // a structured developer-ready draft (or null). The composer REPLACES the field content in place with the
  // draft rendered as WhatsApp Markdown, and offers Undo (restores the reporter's pre-enhance text) +
  // Regenerate. Stale-guarded (seq) like onClarityTip. On null/failure the composer no-ops (keeps the text).
  // Widget-only — the extension omits it (no button), preserving parity with onClarityTip/onPickElement.
  onEnhance?: (
    text: string,
    ctx?: { images?: number; shot?: string; picked?: { selector: string; text: string } | null },
  ) => Promise<EnhanceDraftLike | null>
  onSubmit: (payload: {
    // Coarse report type kept for back-compat consumers (extension/message protocol) — always a valid
    // ReportType. For Task/Query this is 'bug' (they are bug-like, non-feature); the precise value is `kind`.
    type: ReportType
    // PX4 #411: the precise issue kind the reporter selected ('bug'|'feature'|'task'|'query'). Present only
    // when the host offered the extended issueTypes chips; consumers should prefer `kind ?? type`. The
    // widget forwards it to the server as the report_type, which drives resolveIssueType on the connector.
    kind?: IssueKind
    // PX4 #411: the trimmed Title input value, when the host enabled showTitleField and the user typed one.
    // The connector uses it verbatim as the external issue summary; absent → server auto-titles as today.
    title?: string
    description: string
    screenshots: string[]
    // PX4 #425: non-image file attachments (PDF, .log, .har, ...) the reporter added, when the host enabled
    // allowFileAttachments. Absent/empty when none. Screenshots keep travelling in `screenshots`.
    files?: ReportFileAttachment[]
    // KLAVITYKLA-438: "Record me" video recordings the reporter captured + attached, when the host enabled
    // allowRecording. Absent/empty when none. Each threads to /api/feedback as a `recording` multipart field.
    recordings?: ReportRecording[]
    annotations?: any
    // The email typed into the REQUIRED-email gate (requireEmail). The host must forward it to the
    // backend as reporter_email, otherwise an "email"-gated project rejects the submit with 400
    // "A valid email is required to submit." Undefined when no email field was shown.
    reporterEmail?: string
    // KLA submit-target: where the reporter chose to send this report. 'project' (DEFAULT) → the site
    // owner's project, exactly as today; 'klavity' → the reporter flagged Klavity's own tool/widget as
    // broken and the SERVER reroutes it into the designated Klavity intake project. Only present when the
    // host enabled cfg.submitTargetToggle; absent → always treated as 'project' by consumers.
    feedbackTarget?: 'project' | 'klavity'
    // KLA-586: when the reporter accepted an AI-Enhance draft, its suggested severity/priority ride the
    // payload as STRUCTURED fields (in addition to the human-readable line in `description`) so the server
    // can seed the ticket's triage. Absent when Enhance wasn't used (or was Undone). Host forwards verbatim.
    suggestedSeverity?: string
    suggestedPriority?: string
    // #638: whether the reporter opted IN to attaching console logs via the composer toggle. Present only
    // when callbacks.consoleAttachToggle rendered the control; DEFAULT false. The host attaches the captured
    // console logs to the report only when this is true (console logs are default-OFF).
    attachConsole?: boolean
  }) => Promise<{ issueKey: string; issueUrl: string }>
  // ── PX4 enhancements (all optional + additive; absent => the composer is identical to today) ──
  // PX4 #411: show a single-line Title input at the top of the composer. Its trimmed value threads through
  // onSubmit as `title` and the connector uses it verbatim as the external issue summary. Default false →
  // no Title field (the server auto-titles from the description/AI draft, exactly as today).
  showTitleField?: boolean
  // PX4 #411: which issue-type chips to offer. Each entry renders a chip; `mappingLabel` is the small caption
  // under the label showing where it lands in the tracker (e.g. "Jira Task"). Omit entirely (or pass an empty
  // array) → the classic Bug/Feature toggle is rendered unchanged (full back-compat). Provide it (PX4 passes
  // all four) to add Task/Query. The chosen value threads through onSubmit as `kind`.
  issueTypes?: Array<{ value: IssueKind; label: string; mappingLabel?: string }>
  // PX4 #425: allow non-image file attachments (PDF, .log, .har, .txt, ...). When true an "Attach file" button
  // appears in the capture row; selected files show as chips below the evidence strip and thread through
  // onSubmit as `files`. Default false → only images can be attached (upload/paste stay image-only), unchanged.
  // KLA-591: when true, the single unified attach control accepts images, video AND docs through one input.
  allowFileAttachments?: boolean
  // KLA-591: per-file size cap (bytes) for the unified attach control. Defaults to DEFAULT_MAX_FILE_BYTES
  // (100MB). Raise per plan later. When a file exceeds it the composer shows a friendly, role-aware CTA —
  // it never silently drops the file (enforced per-workspace QUOTA + billing is KLA-594 fast-follow).
  maxFileBytes?: number
  // KLA-591: who is filing — drives the over-cap CTA. A member/owner/admin is offered a direct upgrade link;
  // an anon/guest end-user is never asked to pay. Absent/undefined is treated as 'anon' (the safe default).
  reporterRole?: ReporterRole
  // KLA-591: where the "Upgrade for larger uploads" CTA points (workspace members/owners only).
  upgradeUrl?: string
  // KLA-612: host callback the "Request upgrade" primitive fires for a guest/anon reporter (who is NEVER
  // asked to pay). The host POSTs an attributed upgrade REQUEST (POST /api/upgrade-request) so the workspace
  // owner/admins get a notified nudge (Slack + email, KLA-608 dispatch) with what the reporter hit + the page.
  // Resolve true when the request landed (client shows "Request sent to your team"), false/throw otherwise
  // (client re-enables the button so the reporter can retry or just attach a smaller file). Best-effort —
  // never blocks the composer. Absent (e.g. the extension, for parity) → the guest CTA degrades to a hint.
  onRequestUpgrade?: (req: { reason: string; context?: Record<string, unknown> }) => Promise<boolean>
  // KLAVITYKLA-438 "Record me" (Phase 1): opt-in composer flag. When true AND onRecord is provided, a
  // "Record me" button appears in the capture row; clicking it invokes onRecord() (the host drives the
  // consent → record → preview flow via the sdk recorder) and the resolved recording is added to the
  // evidence strip as a removable video chip, threading through onSubmit as `recordings`. Default false →
  // no button, composer identical to today (full back-compat — callers that don't enable it are unchanged).
  allowRecording?: boolean
  // Host-supplied recorder entry point. Returns the captured recording (or null if the reporter cancelled).
  // Kept as a callback so the heavy MediaRecorder/getDisplayMedia machinery lives in the sdk, not core.
  // KLA-555 (walkthrough mode): receives an optional `onPhase` the recorder fires on each overlay phase
  // ('consent'|'recording'|'preview'). The composer hides itself while phase==='recording' (so the docked
  // Stop bar sits over the live app, not behind a dimmed composer) and restores on any other phase — plus a
  // belt-and-suspenders restore in the click handler's finally when onRecord resolves/rejects.
  onRecord?: (onPhase?: (phase: 'consent' | 'recording' | 'preview') => void) => Promise<ReportRecording | null>
  // KLA-505: server-side LIVE DICTATION for the Voice button. When provided AND MediaRecorder is available,
  // the composer PREFERS this over the flaky Web Speech backend: it records short mic segments and hands each
  // as an audio Blob to this callback, which POSTs it to the STT endpoint (POST /api/voice/transcribe) and
  // resolves the recognized text. Resolve null on any failure (endpoint down / STT unconfigured / rate-limit)
  // — the composer transparently falls back to Web Speech. Absent → Voice uses Web Speech exactly as before.
  onDictate?: (audio: Blob) => Promise<{ text: string } | null>
  // #647: LIVE STREAMING dictation WebSocket URL (ws(s)://…/api/voice/stream?project=…). When provided AND
  // WebSocket+MediaRecorder are available, the composer PREFERS this over the 5s-batch onDictate path:
  // interim partials show live (greyed preview) and finals commit into the description in near real-time.
  // On any connect failure the composer transparently falls back to onDictate (batch) then Web Speech.
  dictationStreamUrl?: string
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
  // PX4 #439: when the reporter identity is already known (Identify API / config / fallback), pre-fill the
  // required-email field so the user doesn't retype it. Ignored unless requireEmail rendered the field.
  // The value stays user-editable; it only seeds the initial input. Absent → no pre-fill (as today).
  prefillEmail?: string
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
  // KLA-587 (founder decision): when true AND onCaptureSharp is wired, the DEFAULT on-open capture is real
  // Screen (getDisplayMedia) — the share picker fires as the first-choice capture, chained to the composer's
  // opening user-gesture. On decline / lost-gesture / failure it silently falls back to the rendered viewport
  // capture (never an error toast, never a re-prompt loop). Host sets it from a getDisplayMedia feature-detect
  // (undefined on iOS Safari → the rendered viewport stays the default there). See defaultCaptureMode().
  screenCaptureDefault?: boolean
  // Called once when the composer closes — via Esc, overlay click, X button, or programmatic close.
  // Used by the widget to fire the public window.Klavity.on('close') event. `reason` is 'submitted'
  // ONLY on the non-blocking background-upload close (see backgroundUpload): the report was handed off
  // to the host's pill, so the host should skip any "keep evidence / restore dock" bookkeeping.
  onClose?: (reason?: 'submitted') => void
  // NON-BLOCKING SUBMIT (default widget path). When true, a successful Submit does NOT await the upload
  // inside the modal: the payload is handed to callbacks.onSubmit (fire-and-forget) and the modal +
  // backdrop dismiss IMMEDIATELY so the page is never dimmed while a (possibly large) recording uploads.
  // The host (widget) owns a bottom-right progress pill that drives upload/success/failure/retry after
  // the modal is gone. In this mode onSubmit MUST manage its own errors (never reject) — the modal shows
  // no terminal card. Default false/absent → the legacy blocking path (await → renderSuccess /
  // renderSentConfirmation), kept for the extension (shared-modal pill parity is a follow-up).
  backgroundUpload?: boolean
  // JTBD 1.8: attached-proof chip. Reflects whether a rolling session-replay buffer will ride along
  // with the report so reporters (and, in the drawer, reviewers) know what evidence traveled:
  //   'attached'    -> chip reads "Replay 60s" with a check (a scrubbable buffer will attach)
  //   'unavailable' -> chip reads "Replay not available" (recording off / buffer script failed to load)
  // Omit entirely (undefined) on paths with no session-replay concept (e.g. the extension) -> no chip.
  // The buffer becomes playable a few hundred ms after mount, so the host may re-evaluate later via
  // the controller's setReplayState().
  replayState?: 'attached' | 'unavailable'
  // ── KLA-412 multi-page evidence (all optional + additive; absent => identical to today) ──
  // When provided, a minimize button appears in the header. Clicking it invokes this callback — the host
  // (widget) then persists the in-progress report to its IndexedDB "evidence session", closes the
  // composer, and shows a minimized dock so the reporter can keep capturing across page navigations.
  // Its mere presence also puts the composer in "session mode": per-shot page labels are shown and the
  // image cap is raised so evidence can span more pages.
  onMinimize?: () => void
  // Fired AFTER a NEW screenshot the reporter captured/uploaded INSIDE the composer is added to the strip
  // (Full Page / Screen / Region / Upload / paste / auto-capture). NOT fired for shots seeded via the
  // controller's addScreenshot() (the host already knows those). The host uses it to append the shot,
  // tagged with the current page URL, to the evidence session. Absent => nothing extra happens.
  onShotAdded?: (dataUrl: string, quality: CaptureQuality | undefined) => void
  // Fired when the reporter removes a thumbnail, with its strip index, so the host can drop the matching
  // shot from the evidence session (indices stay aligned with the seed + append order). Absent => no-op.
  onShotRemoved?: (index: number) => void
  // #638: when true, render a small "Attach console logs" toggle just above Submit. It is OFF by default —
  // console logs are only attached when the reporter explicitly flips it on. The chosen state rides the
  // submit payload as `attachConsole` (boolean) so the host attaches the captured console logs only then.
  // Absent/false => no toggle is rendered and attachConsole is omitted from the payload (default-off).
  consoleAttachToggle?: boolean
}

export interface ModalController {
  shadowRoot: ShadowRoot
  // JTBD 1.9: an optional capture-quality tag badges the thumbnail (real-pixel/rendered/wireframe) and,
  // for a degraded shot, surfaces "Retake sharp". Omit it (e.g. a right-click-drag region shot the host
  // already knows the quality of) and no badge is shown.
  // KLA-412: an optional 3rd arg tags the shot with the page it came from (rendered as a mono label
  // under the thumbnail). Shots added through this controller method do NOT fire onShotAdded — the host
  // is seeding shots it already tracks. Backward compatible: existing 1/2-arg callers are unaffected.
  // KLAVITYKLA-473: an optional 4th arg flags a seeded shot as blank/partial so the sharp-capture callout
  // shows for it too (e.g. a right-click-drag region shot the host detected was partial). Defaults false.
  // KLA-621: an optional 5th arg carries the shot's capture provenance (region rect / picked element selector)
  // so Retake redoes that exact selection instead of a full-frame grab. Backward compatible.
  addScreenshot: (dataUrl: string, quality?: CaptureQuality, pageMeta?: ShotPageMeta, suggestSharp?: boolean, capture?: ShotCapture) => void
  // Like addScreenshot, but treats the shot as a GENUINE user capture: it becomes the ACTIVE/selected hero
  // (activeIndex → the new last shot, scrolled into view) AND fires onShotAdded (so the host persists it to
  // any evidence session). Use for a shot the reporter just captured — e.g. a right-click-drag region shot
  // added to an already-open composer, or seeded as the newest shot when (re)opening — so the composer shows
  // the fresh capture, not the first seeded one. (addScreenshot leaves activeIndex alone for silent seeds.)
  addCapturedShot: (dataUrl: string, quality?: CaptureQuality, pageMeta?: ShotPageMeta, suggestSharp?: boolean, capture?: ShotCapture) => void
  close: () => void
  // JTBD 1.8: update the attached-proof replay chip after mount (rrweb loads async, so the buffer may
  // only become playable a few hundred ms after the composer opens). No-op when no chip was rendered.
  setReplayState: (state: 'attached' | 'unavailable') => void
  // KLA-591: drive per-attachment upload progress bars while a submit is in flight. Pass the aggregate
  // upload percent (0..100); every video tile + file chip mirrors it (one request → one % for all). Pass
  // null to clear the bars (upload done/failed). No-op when the composer already closed.
  setUploadProgress: (pct: number | null) => void
}

// video-upload: pure, unit-testable predicates for the "Attach file" ingest path. A video is matched by
// MIME (video/*) first, then by extension as a fallback for browsers that report an empty file.type.
export function isVideoFile(file: { type?: string; name?: string }): boolean {
  return (file.type || '').toLowerCase().startsWith('video/') ||
    /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i.test(file.name || '')
}

// video-upload: derive a concrete video/* content-type from a filename extension. Used to STAMP a MIME
// onto an attachment the client accepted as a video by EXTENSION when the browser reported an empty
// file.type — so the type travels end-to-end (data URL → multipart part) and the SERVER, which keys the
// 100MB video cap off the attachment's content-type, agrees the file is a video (KLA-560 item 6).
// Returns '' for a non-video/unknown extension (caller keeps the original type).
export function videoContentType(name?: string): string {
  const ext = /\.([a-z0-9]+)$/i.exec(name || '')?.[1]?.toLowerCase()
  switch (ext) {
    case 'mp4': case 'm4v': return 'video/mp4'
    case 'mov': return 'video/quicktime'
    case 'webm': return 'video/webm'
    case 'avi': return 'video/x-msvideo'
    case 'mkv': return 'video/x-matroska'
    case 'ogv': return 'video/ogg'
    case '3gp': return 'video/3gpp'
    default: return ''
  }
}

// The per-file byte cap for a given attachment: videos get the higher `video` cap, everything else the
// standard `file` cap. Kept pure so ingestAttachments and the tests share one source of truth.
export function attachmentSizeCap(file: { type?: string; name?: string }, caps: { file: number; video: number }): number {
  return isVideoFile(file) ? caps.video : caps.file
}

// ── KLA-591: unified attachment gallery ──────────────────────────────────────────────────────────────
// ONE control replaces the old split Upload (images) + Attach file (video/doc) buttons: a single <input>
// with a broad accept list ingests images, video, PDFs, and log-style files. Kept as a named const so the
// markup and the tests agree on exactly what the picker offers.
export const UNIFIED_ATTACH_ACCEPT = 'image/*,.heic,.heif,video/*,.pdf,.log,.har,.txt,.json,.csv,.zip,.xml,.yml,.yaml'

// KLA-591: the default per-file size cap (100MB). Overridable per plan later — the enforced per-workspace
// storage QUOTA + billing is KLA-594 (fast-follow); this const is just the per-file ceiling the composer UI
// warns against. Exposed so the host can raise it for a higher plan without touching the composer.
export const DEFAULT_MAX_FILE_MB = 100
export const DEFAULT_MAX_FILE_BYTES = DEFAULT_MAX_FILE_MB * 1024 * 1024

// KLA-591: is this file previewable as an inline image? (mirrors the composer's image predicate, but pure
// so attachmentKind + tests can share it.) HEIC/HEIF and empty-type images are matched by extension.
export function isImageLike(file: { type?: string; name?: string }): boolean {
  return (file.type || '').toLowerCase().startsWith('image/') ||
    /\.(heic|heif|png|jpe?g|gif|webp|bmp|avif|svg)$/i.test(file.name || '')
}

// KLA-591: classify an attachment for the unified gallery. 'image' → screenshot strip + annotator; 'video'
// → poster tile in the strip + inline <video controls> hero; 'file' → the non-previewable file chip.
export type AttachmentKind = 'image' | 'video' | 'file'
export function attachmentKind(file: { type?: string; name?: string }): AttachmentKind {
  if (isVideoFile(file)) return 'video'
  if (isImageLike(file)) return 'image'
  return 'file'
}

// KLA-591: who is filing the report — drives the over-cap CTA. A workspace member/owner/admin can be sent
// straight to an upgrade; an anonymous/guest end-user on a customer's site is NEVER asked to pay.
export type ReporterRole = 'owner' | 'admin' | 'member' | 'guest' | 'anon' | undefined

export interface FileCapDecision {
  overCap: boolean
  // Friendly, non-blocking message shown inline when the file exceeds the per-file cap. Absent when under.
  message?: string
  // Role-aware call to action, rendered by the reusable "Request upgrade" primitive (buildUpgradeControl).
  // 'upgrade' → a direct upgrade LINK (members/owners, opens `url`); 'ask-team' → a guest/anon REQUEST button
  // that POSTs an attributed upgrade nudge to the workspace admins (never a payment ask). `reason` tags what
  // wall was hit (drives the admin notification + future credit walls); `hint` is the secondary "or attach a
  // smaller file" affordance. Absent when the file is under the cap.
  cta?: { kind: 'upgrade' | 'ask-team'; label: string; url?: string; reason?: string; hint?: string }
}

// KLA-591: decide what to do with a file relative to the per-file cap, role-aware. NEVER hard-blocks — the
// caller shows the message + CTA and lets the reporter pick a smaller file. Kept pure + exported so the
// composer and the tests share one decision.
export function evaluateFileCap(
  file: { size: number; name?: string },
  opts: { capBytes: number; role?: ReporterRole; upgradeUrl?: string },
): FileCapDecision {
  if (file.size <= opts.capBytes) return { overCap: false }
  const mb = Math.round(opts.capBytes / 1024 / 1024)
  const canUpgrade = opts.role === 'owner' || opts.role === 'admin' || opts.role === 'member'
  const name = file.name ? `"${file.name}"` : 'This file'
  const message = `${name} is over the ${mb}MB limit on your plan.`
  // KLA-612: both roles now get a real "Request upgrade" ACTION (not advisory text). member/owner → a direct
  // upgrade link; guest/anon → a button that POSTs an attributed request to the workspace admins. The
  // secondary hint keeps the always-available escape hatch (attach a smaller file) so we never dead-end.
  const cta = canUpgrade
    ? { kind: 'upgrade' as const, label: 'Request upgrade', url: opts.upgradeUrl, reason: 'storage_over_cap', hint: 'or attach a smaller file' }
    : { kind: 'ask-team' as const, label: 'Request upgrade', reason: 'storage_over_cap', hint: 'or attach a smaller file' }
  return { overCap: true, message, cta }
}

// KLA-591: per-attachment upload progress. Every attachment rides ONE upload request, so each mirrors the
// aggregate upload percent while a submit is in flight. Returns a clamped whole percent, or null when no
// upload is running (which clears the bars). Pure so the render + tests share the clamp.
export function attachmentProgressPercent(pct: number | null | undefined): number | null {
  if (pct == null || typeof pct !== 'number' || !isFinite(pct)) return null
  return Math.max(0, Math.min(100, Math.round(pct)))
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
  // Mark as Klavity chrome so screenshot capture can exclude it. This host is a separate
  // full-viewport div on document.body (not inside the launcher host), and modern-screenshot
  // traverses shadow DOM — without this marker the open composer renders into its own capture.
  host.setAttribute('data-klavity-ui', 'composer')
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;'
  const shadowRoot = host.attachShadow({ mode: 'open' })
  document.body.appendChild(host)

  let screenshots: string[] = []
  // KLAVITYKLA-509: true while auto-capture-on-open is rendering the first shot, so updateStrip() shows a
  // "Capturing…" skeleton tile instead of a blank slot for the ~1s the html-to-image render takes.
  let capturing = false
  // Parallel array: each entry is the resolved (compressed) version of screenshots[i].
  // Pre-compression is kicked off immediately when a screenshot is added, so by the time the user
  // clicks Submit the Promise is already settled and the upload can start without delay.
  let screenshotCompressed: Promise<string>[] = []
  // JTBD 1.9: parallel array of capture-quality tags — screenshotQuality[i] describes screenshots[i]
  // ('real-pixel' | 'rendered' | 'wireframe'), or undefined for images with no known quality (user
  // uploads / clipboard pastes). Drives the per-thumbnail badge + the "Retake sharp" affordance.
  let screenshotQuality: (CaptureQuality | undefined)[] = []
  // KLA-412: parallel array of per-shot page tags — screenshotPageMeta[i] describes screenshots[i], or
  // undefined for a shot with no page metadata (every shot in a normal single-page report). When set, a
  // small mono label is rendered under the thumbnail. Stays index-aligned across add/remove like the
  // quality array.
  let screenshotPageMeta: (ShotPageMeta | undefined)[] = []
  // KLAVITYKLA-473: parallel array of per-shot "suggest the sharp Screen capture" flags. True when the host
  // detected (in the browser) that screenshots[i] came back blank/partial-white (cross-origin images the DOM
  // renderer couldn't inline dropped to white gaps). Drives a non-intrusive callout pointing at the Screen
  // button. Cleared when the shot is retaken sharp / removed. Index-aligned like the quality + page arrays.
  let screenshotSuggestSharp: boolean[] = []
  // KLA-621: parallel array of per-shot capture provenance — screenshotCapture[i] tells Retake what to redo
  // for screenshots[i] (region rect / picked element selector / sharp mode). undefined for shots with no known
  // provenance (uploads / pastes) → Retake keeps its legacy full-frame behaviour. Index-aligned like the rest.
  let screenshotCapture: (ShotCapture | undefined)[] = []
  // Set once the reporter dismisses the sharp-capture callout so it never nags again this session.
  let sharpHintDismissed = false
  // KLAVITYKLA-473 follow-up: true when the auto-capture came back BLANK (declined share / unrenderable page)
  // and we chose to show the "couldn't capture — Snap" empty state instead of seeding a white image. Cleared
  // the moment any real shot lands so the empty state reverts to its normal copy.
  let blankCaptureHint = false
  // KLA-412: "session mode" is on whenever the host wired onMinimize — it means this composer is backed
  // by a multi-page evidence session, so we show the minimize button + per-shot page labels and raise the
  // image cap so evidence can span more pages. Absent => behaves exactly as before.
  const sessionMode = !!callbacks.onMinimize
  // Upload guards (Dev 6 audit #4): cap how many images can be attached and how big each may be.
  const MAX_IMAGES = sessionMode ? 8 : 5
  // KLAVITYKLA-506: above this element count, auto-capture-on-open is skipped (the html-to-image render
  // would jank the composer's first paint). The user can still click "Full Page" to capture on demand.
  const AUTO_CAPTURE_MAX_NODES = 15_000
  const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB per image
  // PX4 #425: non-image file attachments (PDF, .log, .har, ...). Kept separate from screenshots[] so the
  // image-hero/annotator logic is untouched. Capped by count + total bytes; each file also obeys MAX_FILE_BYTES.
  const fileAttachEnabled = !!callbacks.allowFileAttachments
  const MAX_FILES = 5
  // KLA-591: the unified per-file cap (100MB default, overridable per plan via callbacks.maxFileBytes). A
  // file over this isn't silently dropped — the composer shows a friendly, role-aware over-cap CTA. The
  // backend attach path (prototype/server.ts) mirrors the 100MB video ceiling + 120MB total; the enforced
  // per-workspace storage QUOTA + billing is KLA-594 (fast-follow).
  const PER_FILE_MAX_BYTES = callbacks.maxFileBytes && callbacks.maxFileBytes > 0 ? callbacks.maxFileBytes : DEFAULT_MAX_FILE_BYTES
  // KLA-591: who is filing — drives the over-cap CTA (member/owner → upgrade link; anon/guest → ask-team).
  const reporterRole: ReporterRole = callbacks.reporterRole ?? 'anon'
  const upgradeUrl = callbacks.upgradeUrl
  const MAX_FILES_TOTAL_BYTES = Math.max(120 * 1024 * 1024, PER_FILE_MAX_BYTES + 20 * 1024 * 1024) // holds one max-size file
  let attachedFiles: ReportFileAttachment[] = []
  // KLA-591: current aggregate upload percent while a submit is in flight (null = not uploading). Painted
  // onto every video tile + file chip so the reporter sees a large video actually uploading.
  let uploadProgressPct: number | null = null
  // KLAVITYKLA-438: "Record me" recordings. Enabled only when the host opted in AND provided onRecord.
  const recordingEnabled = !!(callbacks.allowRecording && callbacks.onRecord)
  // KLA-505: pick the dictation engine for the Voice button — prefer the server STT endpoint (onDictate +
  // MediaRecorder) over the flaky Web Speech backend; fall back to Web Speech; else hide the button.
  const voiceMode = pickDictationMode({
    hasEndpoint: !!callbacks.onDictate,
    mediaRecorderSupported: LiveDictation.isSupported(),
    webSpeechSupported: VoiceInput.isSupported(),
  })
  const voiceSupported = voiceMode !== 'none'
  const MAX_RECORDINGS = 2
  let recordings: ReportRecording[] = []
  // PX4 #411: the extended issue-type chips, when the host provided them (else null → classic Bug/Feature toggle).
  const issueTypeOpts = (callbacks.issueTypes && callbacks.issueTypes.length) ? callbacks.issueTypes : null
  // Structured markup per screenshot index { w, h, shapes } so the ticket can re-render a
  // toggleable/zoomable overlay instead of baking the drawing into the uploaded image.
  const annotationsByIndex: Record<number, any> = {}
  // KLAVITYKLA-228/371: picked element from the on-page picker. Carries selector + human text snippet.
  // Rides on the annotations payload as `selector` + `selectorText` (top level) so the ticket links
  // the finding to the DOM node and the drawer can show the human-readable label alongside the selector.
  let pickedTarget: PickedTarget | null = null
  // KLAVITYKLA-217: serialize the FULL per-image markup map (not just screenshot #0). The wire shape
  // stays backward-compatible — the index-0 entry's fields ({ w, h, shapes, … }) are hoisted to the top
  // level so existing single-image consumers (server sanitizer + ticket drawer) keep working unchanged,
  // while `byIndex` carries every annotated image so overlays on screenshots 2–5 no longer vanish.
  // Returns null when nothing is annotated (identical to the previous `annotationsByIndex[0] ?? null`).
  const buildAnnotationsPayload = (): any => {
    const keys = Object.keys(annotationsByIndex)
    // Nothing drawn AND no pinned element → no overlay payload at all.
    if (!keys.length && !pickedTarget) return null
    const out: any = {}
    if (keys.length) {
      const byIndex: Record<string, any> = {}
      for (const k of keys) byIndex[k] = annotationsByIndex[k as any]
      const base = annotationsByIndex[0] ?? annotationsByIndex[Number(keys[0])] ?? {}
      Object.assign(out, base, { byIndex })
    }
    // KLAVITYKLA-228/371: pin selector + human snippet at the top level (server sanitizer + drawer).
    if (pickedTarget) { out.selector = pickedTarget.selector; out.selectorText = pickedTarget.text }
    return out
  }
  let currentType: IssueKind = initialType
  // Image-hero: the screenshot currently shown big + live-annotated in the hero pane. Clicking a
  // thumbnail selects it; the inline annotator mounts on it and persists shapes to annotationsByIndex.
  let activeIndex = 0
  // KLA-591: when non-null, a VIDEO attachment (attachedFiles[activeVideoIndex]) owns the hero — it renders
  // as an inline <video controls> preview instead of the image annotator. Cleared when an image thumb is
  // selected, when the video is removed, or when there are no videos.
  let activeVideoIndex: number | null = null
  // KLA-602(a): when non-null, a "Record me" recording (recordings[activeRecordingIndex]) owns the hero as an
  // inline <video controls> preview. Recordings now render as removable video TILES in the gallery strip
  // (reusing the KLA-591 tile look), no longer as text chips behind a separate Preview→Attach modal. Mutually
  // exclusive with activeVideoIndex + the image annotator selection.
  let activeRecordingIndex: number | null = null
  let heroKeyHandler: ((e: KeyboardEvent) => void) | null = null
  // JTBD 1.10: track whether a session-replay buffer is attached — it counts as evidence, so an
  // evidence-only report (replay but no typed prose / screenshot) can still Submit. Seeded from the
  // initial callback state and kept in sync by setReplayState() as rrweb resolves post-mount.
  let replayAttached = callbacks.replayState === 'attached'
  // KLA-586: severity/priority from the last ACCEPTED AI-Enhance draft (cleared on Undo). Ride the submit
  // payload as structured fields alongside the human-readable Severity line in the description.
  let enhanceSeverity: string | null = null
  let enhancePriority: string | null = null
  let autodismissTimeout: any = null
  // #468: single source of truth for "this modal instance has been torn down". Guards close() against a
  // double-fire (Esc/X/backdrop during a submit + the submit's later resolution both calling close()) and
  // stops a late submit resolution from rendering a confirmation / arming a timer on the detached modal —
  // which would call close()+onClose again and could tear down a DIFFERENT, freshly-reopened session.
  let _closed = false
  // #448: countdown duration for the post-submit terminal-confirmation card before it auto-closes the
  // modal. Hovering pauses the countdown (armAutodismiss). Named so both the timer + the on-screen
  // progress-bar animation share one source of truth.
  const SUBMIT_AUTOCLOSE_MS = 4000
  // The existing mode-aware success screen (host-supplied opts.success) keeps its 5s auto-dismiss.
  const SUCCESS_AUTODISMISS_MS = 5000
  // #449: per-screenshot undo history. Every mutating op on an image (pen/line/rect/circle/arrow/text/
  // numbers AND crop AND clear) pushes a pre-op snapshot here, so one Ctrl/Cmd-Z (or a toolbar Undo)
  // steps back exactly one op — through annotations and crops alike — all the way down to the original
  // untouched image. cropStacks tracks pre-crop snapshots (with their position in undoStacks) so an
  // explicit "Revert crop" can jump straight back to the pre-crop image + its original markup.
  interface UndoSnap { url: string; compressed: Promise<string>; ann: any | null }
  const undoStacks: Record<number, UndoSnap[]> = {}
  const cropStacks: Record<number, Array<{ snap: UndoSnap; mark: number }>> = {}
  const cloneAnn = (a: any): any => (a ? JSON.parse(JSON.stringify(a)) : null)
  const snapshotShot = (index: number): UndoSnap => ({
    url: screenshots[index],
    compressed: screenshotCompressed[index],
    ann: cloneAnn(annotationsByIndex[index]),
  })
  // Capture the current image+markup as the pre-op state, so undo restores exactly what was there before.
  const pushUndo = (index: number) => { (undoStacks[index] ??= []).push(snapshotShot(index)) }
  const restoreShot = (index: number, snap: UndoSnap) => {
    screenshots[index] = snap.url
    screenshotCompressed[index] = snap.compressed
    if (snap.ann) annotationsByIndex[index] = cloneAnn(snap.ann)
    else delete annotationsByIndex[index]
  }
  // One unified step back through the merged draw+crop history for this image. Returns false when the
  // stack is empty (already at the original image). Remounts the hero so the restored state is painted.
  const undoShot = (index: number): boolean => {
    const st = undoStacks[index]
    if (!st || !st.length) return false
    const snap = st.pop()!
    // If the op we just undid was (or sat above) a crop, drop the now-orphaned crop marker so the
    // "Revert crop" affordance reflects reality.
    const cs = cropStacks[index]
    while (cs && cs.length && cs[cs.length - 1].mark >= st.length) cs.pop()
    restoreShot(index, snap)
    updateStrip()
    return true
  }
  // Explicit "Revert crop": jump back to the most recent pre-crop image + its original markup (drops the
  // crop and anything drawn after it — the affordance reads "revert crop to original").
  const revertCrop = (index: number): boolean => {
    const cs = cropStacks[index]
    if (!cs || !cs.length) return false
    const { snap, mark } = cs.pop()!
    if (undoStacks[index]) undoStacks[index].length = Math.min(undoStacks[index].length, mark)
    restoreShot(index, snap)
    updateStrip()
    return true
  }

  const style = document.createElement('style')
  style.textContent = `
    ${themeCss(cfg)}
    @keyframes kl-genie-in{from{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}to{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}}
    @keyframes kl-genie-out{from{opacity:1;transform:translateY(0) scaleX(1) scaleY(1)}to{opacity:0;transform:translateY(180px) scaleX(.04) scaleY(.06)}}
    @keyframes kl-ov{from{opacity:0}to{opacity:1}}
    .klavity-overlay{position:fixed;inset:0;background:var(--kl-overlay);display:flex;align-items:center;justify-content:center;pointer-events:all;animation:kl-ov .3s ease both;}
    /* height:94vh (definite, not just max-height) + grid-template-rows:minmax(0,1fr) so the row has a
       resolved height. This is what makes the hero canvas's object-fit:contain actually shrink a tall
       screenshot to fit (KLAVITYKLA-402) instead of the tall image blowing out the row and pushing the
       right-pane Submit button below the clipped fold. min-height:0 tracks let both panes scroll internally. */
    .klavity-modal{position:relative;overflow:hidden;isolation:isolate;background:var(--kl-glow,transparent),var(--kl-bg);color:var(--kl-fg);border-radius:var(--kl-radius);padding:0;width:92vw;max-width:min(1160px,92vw);height:94vh;max-height:94vh;box-shadow:0 0 0 1px var(--kl-border),var(--kl-shadow);font-family:var(--kl-font,system-ui,sans-serif);-webkit-font-smoothing:antialiased;-webkit-backdrop-filter:var(--kl-backdrop);backdrop-filter:var(--kl-backdrop);transform-origin:bottom right;animation:kl-genie-in .6s cubic-bezier(.16,1,.3,1) both;display:grid;grid-template-columns:minmax(0,1fr) 384px;grid-template-rows:minmax(0,1fr);}
    /* Image-hero two-pane layout: big annotatable screenshot on the left, controls on the right. */
    .kl-hero{display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--kl-hero-bg,#0e1424);}
    .kl-hero-tools{display:flex;align-items:center;flex-wrap:wrap;gap:6px;padding:8px 14px;min-height:48px;border-bottom:1px solid rgba(255,255,255,.06);}
    .kl-hero-stage{flex:1;min-height:0;position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:14px;}
    .kl-hero-empty{display:flex;flex-direction:column;align-items:center;gap:12px;color:#7d879f;font-size:13.5px;font-weight:500;text-align:center;max-width:260px;line-height:1.5;}
    .kl-hero-empty svg{opacity:.6;}
    .kl-side{display:flex;flex-direction:column;min-width:0;border-left:1px solid var(--kl-border);padding:22px 20px;overflow-y:auto;}
    /* KLA-586: Submit is pinned to the bottom by the DESCRIPTION field's flex:1 grow (it consumes the free
       space and pushes the target-toggle + Submit down to sit right beneath it — no awkward gap). We must NOT
       use margin-top:auto here: an auto margin claims positive free space BEFORE flex-grow, which would steal
       the space back from the description and reopen the gap ABOVE Submit. position:sticky keeps Submit in
       view when the panel scrolls (long forms / small viewports) so it's ALWAYS reachable (KLAVITYKLA-402).
       The -12px top shadow gutter blends content scrolling up beneath the button. */
    .kl-side>.klavity-submit{position:sticky;bottom:0;box-shadow:0 -12px 14px -8px var(--kl-bg);}
    @media (max-width:760px){.klavity-modal{grid-template-columns:1fr;grid-template-rows:auto auto;height:auto;max-height:96vh;width:96vw;}.kl-hero{max-height:44vh;}.kl-side{overflow-y:visible;border-left:none;border-top:1px solid var(--kl-border);}.kl-side>.klavity-submit{position:static;box-shadow:none;}}
    /* Hero annotation toolbar — always-on tools over the image. Tap targets ≥36px for touch. */
    .kl-htool,.kl-htbtn{display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;min-width:38px;height:38px;padding:0 8px;border:1px solid transparent;border-radius:9px;background:transparent;color:#cfd5ea;cursor:pointer;line-height:1;transition:transform .12s ease,background .12s ease;}
    .kl-htool .kl-hk{font-size:9px;font-weight:700;opacity:.5;}
    /* #449 "Revert crop" affordance — accent-tinted, with a small visible label under the glyph. */
    .kl-htbtn.kl-hrevert{color:var(--kl-accent);min-width:44px;}
    .kl-htbtn.kl-hrevert .kl-hrevert-lbl{font-size:8.5px;font-weight:700;opacity:.85;}
    .kl-htool:hover,.kl-htbtn:hover{background:rgba(255,255,255,.08);transform:translateY(-1px);}
    .kl-htool.kl-on{background:var(--kl-accent);color:var(--kl-on-accent);box-shadow:0 4px 12px color-mix(in srgb,var(--kl-accent) 45%,transparent);}
    .kl-htool.kl-on .kl-hk{opacity:.85;}
    .kl-hcolor{width:24px;height:24px;border-radius:50%;border:2px solid rgba(255,255,255,.65);cursor:pointer;padding:0;transition:transform .12s ease;}
    .kl-hcolor:hover{transform:scale(1.14);}
    .kl-hcolor.kl-on{outline:2px solid #fff;outline-offset:2px;}
    /* Light swatches (white/yellow) need a dark inset ring so they read against the toolbar. */
    .kl-hcolor-light{border-color:rgba(0,0,0,.35);box-shadow:inset 0 0 0 1px rgba(0,0,0,.35);}
    .kl-hcolor-cwrap{position:relative;display:inline-flex;}
    /* Rainbow "custom colour" swatch — opens the native picker; its bg is overwritten with the chosen colour. */
    .kl-hcolor-custom{background:conic-gradient(from 0deg,#ef4444,#f59e0b,#facc15,#16a34a,#3b82f6,#a855f7,#ef4444);}
    .kl-hcolor-input{position:absolute;left:0;bottom:-2px;width:1px;height:1px;opacity:0;border:0;padding:0;margin:0;pointer-events:none;}
    .kl-hsep{width:1px;height:24px;background:rgba(255,255,255,.14);margin:0 3px;}
    .kl-hgrow{flex:1;}
    /* #626: keep the six preset swatches + custom picker on ONE line as a single unit (never split across
       two rows at the narrow widget width). Gap matches the toolbar's swatch spacing. */
    .kl-hcolors{display:inline-flex;align-items:center;flex-wrap:nowrap;gap:6px;flex:none;}
    /* Contextual text options (outline colour + size) — only visible while the Text tool is active. */
    .kl-htextopts{display:inline-flex;align-items:center;gap:5px;}
    .kl-htextopts[hidden]{display:none;}
    .kl-hlabel{color:#7d879f;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin:0 1px;}
    /* Keep the "Stroke" label glued to its S/M/L/XL sizes as one control — never let flex-wrap split the
       label onto one row and the size buttons onto another at the narrow widget width. */
    .kl-hgroup{display:inline-flex;align-items:center;gap:5px;flex:none;flex-wrap:nowrap;}
    .kl-hopt{min-width:28px;height:30px;padding:0 8px;border-radius:8px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#cfd5ea;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;}
    .kl-hopt:hover{background:rgba(255,255,255,.08);}
    .kl-hopt.kl-on{background:var(--kl-accent);color:var(--kl-on-accent);border-color:transparent;}
    .kl-osq{width:13px;height:13px;border-radius:3px;display:inline-block;}
    .kl-hmask{display:inline-flex;align-items:center;gap:5px;height:38px;padding:0 8px;border-radius:9px;color:#cfd5ea;font-size:11px;font-weight:600;cursor:pointer;user-select:none;white-space:nowrap;}
    .kl-hmask:hover{background:rgba(255,255,255,.08);}
    .kl-hmask input{cursor:pointer;margin:0;accent-color:var(--kl-accent);}
    /* Top-left Klavity logo — a link to the (UTM'd) homepage. Sits flush left in the editor toolbar. */
    .kl-hlogo{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 8px 0 4px;border-radius:9px;text-decoration:none;color:#e6e9f5;font-weight:800;font-size:13px;letter-spacing:-.01em;cursor:pointer;transition:background .12s ease,transform .12s ease;}
    .kl-hlogo:hover{background:rgba(255,255,255,.08);transform:translateY(-1px);}
    .kl-hlogo:active{transform:scale(.97);}
    .kl-hlogo svg{display:block;flex:none;}
    .kl-hlogo-word{white-space:nowrap;}
    @media (max-width:520px){.kl-hlogo-word{display:none;}}
    /* Zoom minimap / navigator — a corner thumbnail shown only while zoomed. The viewport rect dims the
       off-screen area (the big spread box-shadow) so the visible region reads at a glance. */
    .kl-minimap{position:absolute;right:12px;bottom:12px;z-index:7;border:1px solid rgba(255,255,255,.4);border-radius:6px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.5);background:#0b0f1c;cursor:crosshair;touch-action:none;}
    .kl-minimap[hidden]{display:none;}
    .kl-minimap-img{display:block;width:100%;height:100%;object-fit:fill;opacity:.9;pointer-events:none;user-select:none;-webkit-user-drag:none;}
    .kl-minimap-vp{position:absolute;box-sizing:border-box;border:2px solid var(--kl-accent,#6c63ff);background:color-mix(in srgb,var(--kl-accent,#6c63ff) 20%,transparent);box-shadow:0 0 0 9999px rgba(0,0,0,.3);pointer-events:none;}
    .kl-htool:focus-visible,.kl-htbtn:focus-visible,.kl-hcolor:focus-visible,.kl-hlogo:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klavity-thumb.kl-thumb-active img{outline:2px solid var(--kl-accent);outline-offset:1px;}
    /* #627: zoom −/+ buttons sit tight together as their own group. */
    .kl-hzoom{gap:2px;}
    @media (prefers-reduced-motion:reduce){.kl-htool,.kl-htbtn,.kl-hcolor,.kl-hlogo{transition:none;}.kl-htool:hover,.kl-htbtn:hover,.kl-hcolor:hover,.kl-hlogo:hover{transform:none;}}
    .klavity-modal::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(to right,color-mix(in srgb,var(--kl-border) 58%,transparent) 1px,transparent 1px) 0 0/44px 44px,linear-gradient(to bottom,color-mix(in srgb,var(--kl-border) 58%,transparent) 1px,transparent 1px) 0 0/44px 44px;opacity:.36;}
    .klavity-modal>*{position:relative;z-index:1;}
    /* Staggered content reveal — the genie scales the panel in while its rows softly rise + fade so it feels
       alive (not a flat box). Subtle; zeroed under prefers-reduced-motion below. */
    @keyframes kl-rise{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
    .kl-side>.klavity-toggle,.kl-side>.klavity-page,.kl-side>.klavity-proof,.kl-hero>.klavity-strip,.kl-side>.klavity-actions,.kl-side>.klavity-desc,.kl-side>input.klavity-remail,.kl-side>.klavity-submit{animation:kl-rise .5s cubic-bezier(.16,1,.3,1) both;}
    .kl-side>.klavity-toggle{animation-delay:.05s}.kl-side>.klavity-page{animation-delay:.09s}.kl-side>.klavity-proof{animation-delay:.11s}.kl-hero>.klavity-strip{animation-delay:.12s}.kl-side>.klavity-actions{animation-delay:.15s}.kl-side>.klavity-desc{animation-delay:.18s}.kl-side>input.klavity-remail{animation-delay:.21s}.kl-side>.klavity-submit{animation-delay:.23s}
    .klavity-modal.kl-closing{animation:kl-genie-out .5s cubic-bezier(.55,0,.85,.25) both;}
    .klavity-toggle{display:flex;gap:8px;margin-bottom:16px;padding-right:34px;}
    .klavity-toggle button{flex:1;min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;border-radius:8px;border:none;cursor:pointer;font-size:14px;font-weight:600;background:var(--kl-chip);color:var(--kl-fg);line-height:1;}
    .klavity-toggle .bug.active{background:var(--kl-accent);color:var(--kl-on-accent);}
    .klavity-toggle .feat.active{background:var(--kl-accent);color:var(--kl-on-accent);}
    /* PX4 #411: Title field. */
    .klavity-title-label{display:block;font-size:12px;font-weight:600;color:var(--kl-muted);margin-bottom:12px;padding-right:34px;}
    input.klavity-title{width:100%;margin-top:5px;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:8px;padding:9px 11px;font-size:14px;font-weight:500;box-sizing:border-box;box-shadow:0 1px 2px rgba(25,20,15,.04);}
    input.klavity-title:focus{outline:none;border-color:var(--kl-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--kl-accent) 18%,transparent);}
    /* PX4 #411: issue-type chips (Bug/Feature/Task/Query) — replaces the toggle when host supplies issueTypes. */
    .klavity-types{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;padding-right:34px;}
    .kl-type-chip{flex:1;min-width:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:8px 6px;border-radius:9px;border:1px solid var(--kl-border);background:var(--kl-chip);color:var(--kl-fg);cursor:pointer;font-size:13px;font-weight:600;line-height:1.2;transition:transform .12s ease,box-shadow .12s ease,border-color .12s ease;}
    .kl-type-chip:hover{transform:translateY(-1px);}
    .kl-type-chip .kl-type-map{font-size:10.5px;font-weight:500;color:var(--kl-muted);}
    .kl-type-chip.active{border-color:var(--kl-accent);background:color-mix(in srgb,var(--kl-accent) 12%,var(--kl-chip));box-shadow:0 0 0 3px color-mix(in srgb,var(--kl-accent) 16%,transparent);}
    .kl-type-chip.active .kl-type-map{color:var(--kl-fg);}
    .kl-type-chip:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    /* PX4 #425: attached non-image file chips (evidence strip). */
    .klavity-files{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
    /* KLA-586 (founder-flagged stray amber bar): these boxes carry the hidden attribute but their author
       display:flex declaration overrode the UA hidden rule (display:none) — so an EMPTY .klavity-capmsg
       (amber bg + border + padding) rendered as a stray amber pill between the images-count row and the
       description. Restore the hidden semantics explicitly so they only take space when they have content. */
    .klavity-files[hidden]{display:none;}
    .kl-file-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:6px 8px 6px 9px;border-radius:8px;border:1px solid var(--kl-border);background:var(--kl-chip);color:var(--kl-fg);font-size:12px;}
    .kl-file-chip .kl-file-ic{display:inline-flex;flex:none;color:var(--kl-muted);}
    .kl-file-chip .kl-file-nm{max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;}
    .kl-file-chip .kl-file-sz{color:var(--kl-muted);font-variant-numeric:tabular-nums;font-size:11px;}
    .kl-file-rm{flex:none;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;border:none;border-radius:50%;background:color-mix(in srgb,var(--kl-fg) 12%,transparent);color:var(--kl-fg);cursor:pointer;padding:0;}
    .kl-file-rm:hover{background:color-mix(in srgb,var(--kl-fg) 22%,transparent);}
    /* KLA-591 unified attach: hint line + role-aware over-cap message + video tiles + upload progress. */
    .klavity-attach-hint{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--kl-muted);margin:-2px 0 10px;}
    .klavity-attach-hint svg{flex:none;opacity:.8;}
    .klavity-capmsg{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:12px;line-height:1.4;color:var(--kl-fg);background:color-mix(in srgb,#f59e0b 14%,transparent);border:1px solid color-mix(in srgb,#f59e0b 45%,transparent);border-radius:8px;padding:8px 10px;margin-bottom:10px;}
    .klavity-capmsg .kl-capmsg-t{font-weight:600;}
    .klavity-capmsg .kl-capmsg-cta{color:var(--kl-accent);font-weight:700;text-decoration:none;white-space:nowrap;}
    .klavity-capmsg a.kl-capmsg-cta:hover{text-decoration:underline;}
    /* KLA-612: the guest "Request upgrade" action is a real button (POSTs an admin nudge). Styled as a compact
       accent pill so it reads as the primary action in the notice, with the standard hover/press micro-anim. */
    .klavity-capmsg button.kl-capmsg-req{border:none;cursor:pointer;font-size:12px;line-height:1;padding:6px 11px;border-radius:7px;background:var(--kl-accent);color:var(--kl-on-accent);font-weight:700;transition:transform .15s cubic-bezier(.2,.7,.2,1),filter .15s ease;will-change:transform;}
    .klavity-capmsg button.kl-capmsg-req:hover{transform:translateY(-1px) scale(1.02);filter:brightness(1.06);text-decoration:none;}
    .klavity-capmsg button.kl-capmsg-req:active{transform:scale(.97);}
    .klavity-capmsg button.kl-capmsg-req:disabled{opacity:.6;cursor:default;transform:none;}
    .klavity-capmsg button.kl-capmsg-req:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    /* Confirmation after the request lands — a check glyph + green tint (no emoji; uses core icon()). */
    .klavity-capmsg .kl-capmsg-sent{display:inline-flex;align-items:center;gap:5px;font-weight:700;color:#059669;}
    .klavity-capmsg .kl-capmsg-sent-ic{display:inline-flex;}
    .klavity-capmsg .kl-capmsg-sent-ic svg{width:14px;height:14px;display:block;}
    .klavity-capmsg .kl-capmsg-hint{color:var(--kl-muted);}
    @media (prefers-reduced-motion: reduce){.klavity-capmsg button.kl-capmsg-req{transition:none;}}
    .klavity-capmsg[hidden]{display:none;}
    .kl-video-thumb{width:104px;height:72px;border-radius:8px;overflow:hidden;cursor:pointer;background:#000;outline:1px solid var(--kl-img-outline);outline-offset:-1px;}
    .kl-video-thumb.kl-thumb-active{outline:2px solid var(--kl-accent);outline-offset:1px;}
    .kl-video-thumb video{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;}
    .kl-video-thumb .kl-video-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(0,0,0,.28);transition:background .12s;}
    .kl-video-thumb:hover .kl-video-play{background:rgba(0,0,0,.12);}
    .kl-video-thumb .kl-video-play svg{filter:drop-shadow(0 1px 3px rgba(0,0,0,.6));}
    .kl-video-thumb .kl-video-badge{position:absolute;left:4px;bottom:4px;display:inline-flex;align-items:center;gap:3px;padding:1px 5px 1px 4px;border-radius:5px;background:rgba(0,0,0,.62);color:#fff;font-size:9px;font-weight:700;letter-spacing:.02em;text-transform:uppercase;}
    /* KLA-602(a): a "Re-record" action on a recording tile — a small circular control in the top-LEFT corner
       (Remove is top-right), so a reporter can redo a walkthrough without hunting for the Record button. */
    .kl-rerec{position:absolute;top:3px;left:3px;z-index:2;width:19px;height:19px;display:inline-flex;align-items:center;justify-content:center;padding:0;border:none;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;cursor:pointer;transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease;}
    .kl-rerec:hover{transform:scale(1.08);background:var(--kl-accent);}
    .kl-rerec:active{transform:scale(.94);}
    .kl-rerec:focus-visible{outline:2px solid var(--kl-accent);outline-offset:1px;}
    .kl-att-prog{position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(0,0,0,.35);overflow:hidden;}
    .kl-att-prog i{display:block;height:100%;width:0;background:var(--kl-accent);transition:width .2s ease;}
    .kl-file-chip{position:relative;overflow:hidden;}
    @media (prefers-reduced-motion:reduce){.kl-type-chip{transition:none;}.kl-type-chip:hover{transform:none;}}
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
    /* KLAVITYKLA-473: blank/partial-capture callout under the strip — steers the user to the Screen button
       (in-browser detection; NEVER auto-triggers the screen-share). Warm amber warning tone, non-blocking. */
    .klavity-sharphint{display:flex;align-items:center;gap:8px;margin:0 4px 8px;padding:9px 11px;border-radius:9px;font-size:12px;line-height:1.4;color:var(--kl-fg);background:color-mix(in srgb,#d97706 12%,var(--kl-chip));border:1px solid color-mix(in srgb,#d97706 55%,transparent);}
    .klavity-sharphint[hidden]{display:none;}
    .klavity-sharphint .kl-sh-ic{flex:none;display:inline-flex;color:#d97706;}
    .klavity-sharphint .kl-sh-txt{flex:1 1 auto;min-width:0;}
    .klavity-sharphint .kl-sh-use{flex:none;border:none;border-radius:7px;padding:5px 10px;font-size:11.5px;font-weight:700;cursor:pointer;background:var(--kl-accent);color:var(--kl-on-accent);transition:transform .15s cubic-bezier(.2,.7,.2,1),filter .15s ease;will-change:transform;}
    .klavity-sharphint .kl-sh-use:hover{transform:translateY(-1px) scale(1.02);filter:brightness(1.06);}
    .klavity-sharphint .kl-sh-use:active{transform:scale(.97);}
    .klavity-sharphint .kl-sh-x{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;border-radius:6px;background:transparent;color:var(--kl-fg);opacity:.6;cursor:pointer;transition:opacity .15s ease,background .15s ease;}
    .klavity-sharphint .kl-sh-x:hover{opacity:1;background:color-mix(in srgb,var(--kl-fg) 12%,transparent);}
    /* Pulse the Screen button while a suggestion is live so the eye is drawn to it. */
    @keyframes kl-sharp-pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--kl-accent) 55%,transparent)}70%{box-shadow:0 0 0 7px color-mix(in srgb,var(--kl-accent) 0%,transparent)}100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--kl-accent) 0%,transparent)}}
    #klavity-sharp.kl-suggest{color:var(--kl-accent);background:color-mix(in srgb,var(--kl-chip) 70%,var(--kl-accent) 30%);animation:kl-sharp-pulse 1.7s ease-out infinite;}
    @media (prefers-reduced-motion: reduce){#klavity-sharp.kl-suggest{animation:none;}.klavity-sharphint .kl-sh-use{transition:none;}}
    .klavity-thumb{position:relative;flex-shrink:0;}
    /* The image + its overlay badges (remove/markup/quality) live in this fixed-size media box so the
       absolutely-positioned badges anchor to the IMAGE, not the whole thumb column. Without it the markup
       pencil (bottom:4px) rode the bottom of the taller wrap and overlapped the "Retake sharp" pill below. */
    .klavity-thumb-media{position:relative;width:104px;}
    .klavity-thumb.kl-tall .klavity-thumb-media{width:68px;}
    /* KLAVITYKLA-509: capture-in-progress skeleton tile — same footprint as a real thumbnail so the strip
       doesn't jump when the shot swaps in. Pulses (kl-cap-pulse) unless reduced-motion is requested. */
    .kl-thumb-skel{width:104px;height:72px;border-radius:8px;background:var(--kl-chip);outline:1px solid var(--kl-img-outline);outline-offset:-1px;display:flex;align-items:center;justify-content:center;gap:6px;font-size:10.5px;font-weight:600;color:var(--kl-muted);}
    .kl-thumb-skel.kl-loading{animation:kl-cap-pulse 1s ease-in-out infinite;}
    .kl-thumb-skel .kl-skel-spin{width:11px;height:11px;border:2px solid var(--kl-muted);border-top-color:transparent;border-radius:50%;animation:kl-skel-rot .7s linear infinite;}
    @keyframes kl-skel-rot{to{transform:rotate(360deg)}}
    @media (prefers-reduced-motion: reduce){.kl-thumb-skel.kl-loading{animation:none;}.kl-thumb-skel .kl-skel-spin{animation:none;}}
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
    .klavity-retake{margin-top:5px;width:100%;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:4px;font-size:10px;font-weight:700;line-height:1;padding:5px 6px;border:none;border-radius:7px;background:color-mix(in srgb,var(--kl-chip) 70%,var(--kl-accent) 30%);color:var(--kl-accent);cursor:pointer;transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,box-shadow .15s ease;will-change:transform;}
    .klavity-retake svg{display:block;width:11px;height:11px;}
    .klavity-retake:hover{transform:var(--kl-lift);background:color-mix(in srgb,var(--kl-chip) 55%,var(--kl-accent) 45%);box-shadow:0 3px 10px color-mix(in srgb,var(--kl-accent) 26%,transparent);}
    .klavity-retake:active{transform:var(--kl-press);}
    .klavity-retake:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none;}
    .klavity-retake:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klavity-retake.kl-loading{animation:kl-cap-pulse 1s ease-in-out infinite;}
    /* A one-line notice under a thumbnail whose annotations were cleared by a retake (JTBD 1.9 AC). */
    .klavity-retake-note{margin-top:4px;font-size:9.5px;line-height:1.3;color:var(--kl-muted);text-wrap:pretty;}
    @media (prefers-reduced-motion: reduce){.klavity-retake{transition:none!important;}.klavity-retake.kl-loading{animation:none;}}
    .klavity-actions{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}
    .klavity-actions button{position:relative;flex:1 1 auto;min-width:76px;min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px;background:var(--kl-chip);color:var(--kl-fg);border:none;border-radius:8px;cursor:pointer;font-size:12px;line-height:1;}
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
    /* KLAVITYKLA-228 — pinned-element chip: shows the selector captured by the on-page picker, with a
       one-tap Clear. Sits under the capture actions row, above the mask toggle. */
    .klavity-pickinfo{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:-4px 0 12px;font-size:11.5px;color:var(--kl-muted);line-height:1.4;}
    .klavity-pickinfo[hidden]{display:none;}
    .klavity-pickinfo .kl-pick-ic{color:var(--kl-accent);display:inline-flex;flex:none;}
    .klavity-pickinfo code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:var(--kl-fg);background:var(--kl-chip);padding:2px 6px;border-radius:6px;max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .klavity-pickinfo .kl-pick-txt{font-size:11px;color:var(--kl-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;}
    .klavity-pickinfo .kl-pick-clear{background:none;border:none;color:var(--kl-muted);cursor:pointer;font-size:11px;text-decoration:underline;padding:2px 2px;border-radius:5px;}
    .klavity-pickinfo .kl-pick-clear:hover{color:var(--kl-fg);}
    .klavity-pickinfo .kl-pick-clear:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klav-mask-row{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--kl-muted);cursor:pointer;margin-bottom:10px;user-select:none;}
    .klav-mask-row input[type=checkbox]{accent-color:var(--kl-accent);width:13px;height:13px;cursor:pointer;}
    .klav-mask-row:hover{color:var(--kl-fg);}
    .klavity-counter{font-size:11px;color:var(--kl-muted);font-variant-numeric:tabular-nums;}
    /* KLA composer-polish: images-count + Voice-mic row (Mevak style). The circular mic sits at the right end;
       margin-left:auto keeps it pinned right even when the counter is hidden (no images yet). */
    .klavity-descbar{display:flex;align-items:center;gap:8px;min-height:36px;margin-bottom:8px;}
    .kl-voice-circle{position:relative;flex:none;margin-left:auto;width:36px;height:36px;min-width:36px;padding:0;border:none;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--kl-chip);color:var(--kl-fg);cursor:pointer;transition:background .15s ease,color .15s ease,transform .12s ease;}
    .kl-voice-circle .kl-cap-ic{display:inline-flex;align-items:center;justify-content:center;line-height:1;}
    .kl-voice-circle .kl-cap-ic svg{display:block;width:17px;height:17px;}
    .kl-voice-circle:hover{color:var(--kl-accent);transform:scale(1.06);}
    .kl-voice-circle:active{transform:scale(.95);}
    .kl-voice-circle:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .kl-voice-circle:disabled{opacity:.5;cursor:not-allowed;transform:none;}
    @media (prefers-reduced-motion: reduce){.kl-voice-circle{transition:none!important;}.kl-voice-circle:hover,.kl-voice-circle:active{transform:none;}}
    /* KLA-586: the description is a WhatsApp-style Markdown field — a contenteditable that HOLDS raw Markdown
       (its source of truth is plain text, exposed via a .value accessor so every existing call site is
       unchanged) but renders bold/italic/strike/mono live as the reporter types, markers kept + dimmed.
       flex:1 so it GROWS to fill the freed vertical space in the scrollable side panel (founder ask) — the
       target toggle + Submit sit right below it with no awkward gap. min-height keeps it usable + it stays
       user-resizable; on short viewports the .kl-side panel scrolls (overflow-y:auto) rather than overflowing. */
    .klavity-desc{flex:1 1 auto;width:100%;min-height:200px;resize:vertical;overflow:auto;white-space:pre-wrap;word-break:break-word;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:8px;padding:10px;font-size:14px;line-height:1.55;margin-bottom:12px;box-sizing:border-box;box-shadow:0 1px 2px rgba(25,20,15,.04);outline:none;}
    /* placeholder — shown only when the field is genuinely empty (render() clears stray <br> so :empty holds). */
    .klavity-desc:empty:before{content:attr(data-ph);color:var(--kl-muted);opacity:.75;pointer-events:none;}
    /* WhatsApp live-format: the markers stay in the raw text but render dimmed; the wrapped text is styled. */
    .klavity-desc .kl-mk{color:var(--kl-muted);opacity:.65;}
    .klavity-desc b{font-weight:750;}
    .klavity-desc i{font-style:italic;}
    .klavity-desc s{text-decoration:line-through;opacity:.85;}
    .klavity-desc code{background:color-mix(in srgb,var(--kl-fg) 8%,transparent);border-radius:4px;padding:0 3px;font-size:.92em;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}
    .klavity-desc.kl-desc-disabled{opacity:.6;cursor:not-allowed;}
    /* brief accent ring right after an AI-enhance replaces the field content, so the change is noticed. */
    .klavity-desc.kl-just-enhanced{box-shadow:0 0 0 2px color-mix(in srgb,var(--kl-accent) 45%,transparent);transition:box-shadow .5s ease;}
    /* KLA-586: AI-Enhance affordance — Enhance / Undo / Regenerate row + a drafting spinner, under the field. */
    .klavity-enhance-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 10px;}
    .klavity-enhance-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid color-mix(in srgb,var(--kl-accent) 40%,var(--kl-border));background:color-mix(in srgb,var(--kl-accent) 10%,var(--kl-input-bg));color:var(--kl-accent);font-weight:700;font-size:12.5px;border-radius:9px;padding:8px 12px;cursor:pointer;transition:transform .15s cubic-bezier(.2,.7,.2,1),box-shadow .15s ease,filter .15s ease;will-change:transform;}
    .klavity-enhance-btn:hover{transform:scale(1.02);box-shadow:0 3px 12px color-mix(in srgb,var(--kl-accent) 25%,transparent);}
    .klavity-enhance-btn:active{transform:scale(.97);}
    .klavity-enhance-btn:disabled{opacity:.55;cursor:default;transform:none;box-shadow:none;}
    .klavity-enhance-undo,.klavity-enhance-regen{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--kl-border);background:var(--kl-input-bg);color:var(--kl-muted);font-weight:650;font-size:12px;border-radius:9px;padding:8px 11px;cursor:pointer;transition:background .15s ease,color .15s ease;}
    .klavity-enhance-regen{margin-left:auto;color:var(--kl-accent);border-color:color-mix(in srgb,var(--kl-accent) 40%,var(--kl-border));}
    .klavity-enhance-undo:hover,.klavity-enhance-regen:hover{background:color-mix(in srgb,var(--kl-accent) 8%,var(--kl-input-bg));color:var(--kl-accent);}
    .klavity-enhance-undo[hidden],.klavity-enhance-regen[hidden]{display:none;}
    .klavity-enhance-spin{display:flex;align-items:center;gap:9px;margin:0 2px 12px;font-size:12px;color:var(--kl-accent);font-weight:600;}
    .klavity-enhance-spin[hidden]{display:none;}
    .kl-enh-loader{width:15px;height:15px;border:2.5px solid color-mix(in srgb,var(--kl-accent) 30%,transparent);border-top-color:var(--kl-accent);border-radius:50%;animation:kl-enh-spin .7s linear infinite;}
    @keyframes kl-enh-spin{to{transform:rotate(360deg)}}
    @media (prefers-reduced-motion: reduce){.kl-enh-loader{animation-duration:1.4s;}.klavity-enhance-btn{transition:none;}.klavity-enhance-btn:hover{transform:none;}}
    /* JTBD 1.10: hint shown when the reporter has attached a screenshot but typed nothing — Submit is
       enabled and the AI will title the report. Sits just under the textarea; hidden by default. */
    .klavity-desc-hint{display:flex;align-items:center;gap:6px;margin:-8px 0 14px;font-size:12.5px;color:var(--kl-muted);line-height:1.4;}
    .klavity-desc-hint[hidden]{display:none;}
    .klavity-desc-hint .icon{color:var(--kl-accent);flex:none;}
    /* KLAVITYKLA-241 (JTBD A.11): pre-submit "we already know about this" acknowledgment. Appears above
       Submit when the typed description matches a known/recurring issue. Non-blocking — the user can still
       submit or dismiss. Uses a muted-info tone (not an error) so it reassures rather than alarms. */
    .klavity-known{display:flex;align-items:flex-start;gap:8px;margin:-6px 0 14px;padding:10px 12px;font-size:12.5px;line-height:1.45;color:var(--kl-fg);background:color-mix(in srgb,var(--kl-accent) 8%,var(--kl-input-bg));border:1px solid color-mix(in srgb,var(--kl-accent) 30%,var(--kl-border));border-radius:8px;}
    .klavity-known[hidden]{display:none;}
    .klavity-known .kl-known-ic{color:var(--kl-accent);flex:none;margin-top:1px;}
    .klavity-known .kl-known-body{flex:1;min-width:0;}
    .klavity-known .kl-known-title{font-weight:600;}
    .klavity-known .kl-known-status{color:var(--kl-accent);font-weight:600;}
    .klavity-known .kl-known-dismiss{flex:none;background:none;border:none;color:var(--kl-muted);cursor:pointer;font-size:11px;padding:2px 4px;border-radius:6px;line-height:1;text-decoration:underline;}
    .klavity-known .kl-known-dismiss:hover{color:var(--kl-fg);}
    .klavity-known .kl-known-dismiss:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    /* Report-clarity helper (like password-strength, for bug reports). Sits directly under the description:
       a 3-segment meter, a status label, coverage chips, and (when vague) a debounced AI tip. Hidden until
       the reporter types. Non-blocking + informational — never gates Submit. */
    .klavity-clarity{margin:-8px 0 14px;}
    .klavity-clarity[hidden]{display:none;}
    .klavity-clarity .kl-clr-bar{height:6px;border-radius:999px;display:flex;gap:3px;}
    .klavity-clarity .kl-clr-bar i{flex:1;background:var(--kl-border);border-radius:999px;transition:background .2s;}
    .klavity-clarity.l1 .kl-clr-bar i:nth-child(1){background:var(--kl-bad,#dc2626);}
    .klavity-clarity.l2 .kl-clr-bar i:nth-child(-n+2){background:var(--kl-warn,#d97706);}
    .klavity-clarity.l3 .kl-clr-bar i:nth-child(-n+3){background:var(--kl-ok,#16a34a);}
    .klavity-clarity .kl-clr-row{display:flex;align-items:center;justify-content:space-between;margin-top:6px;font-size:11.5px;color:var(--kl-muted);}
    .klavity-clarity .kl-clr-st{font-weight:700;}
    .klavity-clarity.l1 .kl-clr-st{color:var(--kl-bad,#dc2626);}
    .klavity-clarity.l2 .kl-clr-st{color:var(--kl-warn,#d97706);}
    .klavity-clarity.l3 .kl-clr-st{color:var(--kl-ok,#16a34a);}
    .klavity-clarity .kl-clr-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;}
    .klavity-clarity .kl-clr-chip{font-size:11px;padding:3px 8px;border-radius:999px;border:1px solid var(--kl-border);color:var(--kl-muted);display:inline-flex;align-items:center;gap:4px;background:var(--kl-chip);}
    .klavity-clarity .kl-clr-chip.done{color:var(--kl-ok,#16a34a);border-color:color-mix(in srgb,var(--kl-ok,#16a34a) 40%,transparent);background:color-mix(in srgb,var(--kl-ok,#16a34a) 8%,transparent);}
    /* #731: the standalone clarity-coach "AI" tip message was removed (owner: not needed now).
       The coverage pills + score above stay; only the LLM tip row and its CSS are gone. */
    /* Soft pre-submit nudge (mockup panel D). Shown ONLY when the reporter hits Submit on a still-weak
       report. "Submit anyway" always proceeds — never a hard block. */
    .klavity-nudge{margin:0 0 12px;border:1px solid var(--kl-warn,#d97706);background:color-mix(in srgb,var(--kl-warn,#d97706) 8%,var(--kl-input-bg));border-radius:10px;padding:11px;}
    .klavity-nudge[hidden]{display:none;}
    .klavity-nudge .kl-nudge-h{font-weight:650;font-size:12.5px;margin-bottom:3px;color:var(--kl-fg);}
    .klavity-nudge .kl-nudge-d{font-size:11.5px;color:var(--kl-muted);line-height:1.45;}
    .klavity-nudge .kl-nudge-row{display:flex;gap:8px;margin-top:9px;}
    .klavity-nudge button{padding:7px 12px;border-radius:8px;border:1px solid var(--kl-border);background:var(--kl-chip);color:var(--kl-fg);font-weight:600;font-size:12px;cursor:pointer;}
    .klavity-nudge button.kl-nudge-add{background:var(--kl-accent);border-color:var(--kl-accent);color:var(--kl-on-accent);}
    .klavity-nudge button.kl-nudge-anyway{background:none;color:var(--kl-muted);}
    .klavity-nudge button:hover{filter:brightness(1.03);}
    .klavity-nudge button:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    input.klavity-remail{width:100%;background:var(--kl-input-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:8px;padding:10px;font-size:14px;margin-bottom:10px;box-sizing:border-box;box-shadow:0 1px 2px rgba(25,20,15,.04);}
    .klavity-submit{width:100%;min-height:40px;padding:12px;background:var(--kl-accent);color:var(--kl-on-accent);border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;}
    .klavity-submit:disabled{opacity:.5;cursor:not-allowed;}
    /* KLA submit-target: segmented "Where should this go?" control sitting just above Submit. Matches the
       composer's chip styling and works at the narrow widget width (two flex columns, wrapping sub-labels). */
    .klavity-target{margin:0 0 12px;}
    .kl-tgt-label{font-size:11px;font-weight:650;color:var(--kl-muted);margin:0 0 6px 2px;text-transform:uppercase;letter-spacing:.04em;}
    .kl-tgt-seg{display:flex;background:var(--kl-chip);border-radius:10px;padding:3px;gap:3px;}
    .kl-tgt-opt{position:relative;flex:1;min-width:0;border:none;background:transparent;border-radius:8px;padding:8px 18px 8px 8px;font-size:12.5px;font-weight:600;color:var(--kl-muted);cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;line-height:1.2;text-align:center;transition:background .15s ease,color .15s ease,box-shadow .15s ease,transform .12s ease;}
    .kl-tgt-opt small{font-weight:500;font-size:10px;opacity:.85;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .kl-tgt-opt:hover:not(.on){color:var(--kl-fg);}
    .kl-tgt-opt:active{transform:scale(.97);}
    /* Apple-HIG selected state: unmistakable at a glance — accent-tinted fill, a crisp accent ring
       (inset box-shadow so there's no layout shift vs the borderless unselected segment), higher-contrast
       bold label, an accent sub-label, a subtle lift shadow, and an accent checkmark tick in the corner.
       Unselected segments stay muted + flat (rules above). */
    .kl-tgt-opt.on{background:color-mix(in srgb,var(--kl-accent) 14%,var(--kl-input-bg));color:var(--kl-fg);font-weight:700;transform:translateY(-1px);box-shadow:inset 0 0 0 1.5px var(--kl-accent),0 3px 10px color-mix(in srgb,var(--kl-accent) 28%,transparent);}
    .kl-tgt-opt.on small{color:var(--kl-accent);opacity:1;font-weight:600;}
    /* CSS-drawn check tick (no glyph/emoji) — accent, top-right corner of the selected segment. */
    .kl-tgt-opt.on::after{content:"";position:absolute;top:7px;right:8px;width:5px;height:9px;border:solid var(--kl-accent);border-width:0 2px 2px 0;transform:rotate(45deg);}
    @media (prefers-reduced-motion:reduce){.kl-tgt-opt{transition:background .15s ease,color .15s ease,box-shadow .15s ease;}.kl-tgt-opt.on{transform:none;}.kl-tgt-opt:active{transform:none;}}
    /* #638: "Attach console logs" toggle — a compact opt-in row just above Submit, OFF by default. Mirrors
       the mask-numbers checkbox affordance (native checkbox tinted with the accent) so it reads as a control. */
    .klavity-conlog{display:flex;align-items:center;margin:0 0 12px;}
    .kl-conlog-lbl{display:inline-flex;align-items:center;gap:7px;color:var(--kl-muted);font-size:12px;font-weight:600;cursor:pointer;user-select:none;line-height:1.3;}
    .kl-conlog-lbl:hover{color:var(--kl-fg);}
    .kl-conlog-lbl input{margin:0;width:14px;height:14px;cursor:pointer;accent-color:var(--kl-accent);flex:0 0 auto;}
    .kl-conlog-lbl svg{flex:0 0 auto;opacity:.8;}
    /* Upload progress under Submit — collapsed until a submit is in flight; the fill is animated toward 90%
       over ~10s and snapped to 100% when the request resolves (fetch can't report real upload %). */
    .klavity-progress{height:5px;border-radius:999px;background:var(--kl-chip);overflow:hidden;opacity:0;max-height:0;margin-top:0;transition:opacity .2s ease,max-height .2s ease,margin-top .2s ease;}
    .klavity-progress.show{opacity:1;max-height:5px;margin-top:10px;}
    .klavity-progress-fill{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,color-mix(in srgb,var(--kl-accent) 65%,#fff),var(--kl-accent));}
    .klavity-toast-progress{position:absolute;top:0;left:0;height:3px;background:var(--kl-accent);width:100%;transform-origin:left;animation:kl-toast-decay 5s linear forwards;z-index:10;}
    @keyframes kl-toast-decay{from{transform:scaleX(1)}to{transform:scaleX(0)}}
    /* #448 — post-submit terminal confirmation card ("Report sent"). Self-contained (the composer body
       is removed); the countdown line sits along the BOTTOM edge, matching the approved mock. */
    /* Compact card (post-submit-box fix): tightened to a small confirmation, never a big centered box.
       The countdown progress line runs along the BOTTOM edge and auto-closes after SUBMIT_AUTOCLOSE_MS. */
    .klavity-sent{position:relative;overflow:hidden;background:var(--kl-bg);color:var(--kl-fg);border:1px solid var(--kl-border);border-radius:var(--kl-radius);padding:22px 22px 20px;width:90vw;max-width:340px;text-align:center;box-shadow:var(--kl-shadow);font-family:var(--kl-font,system-ui,sans-serif);-webkit-font-smoothing:antialiased;display:flex;flex-direction:column;align-items:center;gap:9px;animation:kl-genie-in .5s cubic-bezier(.16,1,.3,1) both;}
    .klavity-sent .kl-sent-check{width:42px;height:42px;border-radius:50%;background:color-mix(in srgb,#16a34a 15%,transparent);color:#16a34a;display:grid;place-items:center;animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .04s both;}
    .klavity-sent h2{margin:0;font-size:17px;font-weight:600;color:var(--kl-fg);line-height:1.2;animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .09s both;}
    .klavity-sent p{margin:0;font-size:13px;color:var(--kl-muted);line-height:1.45;animation:kl-rise .45s cubic-bezier(.16,1,.3,1) .14s both;}
    .klavity-sent .klavity-ref{margin:4px 0 0;justify-content:center;}
    .klavity-sent .klavity-toast-progress{top:auto;bottom:0;}
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
    .klavity-toggle button,.klavity-actions button,.klavity-submit,.klavity-lead button,.klavity-cta,.klavity-desc,input.klavity-remail,.klavity-lead input{transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,border-color .15s ease,box-shadow .15s ease,color .15s ease,filter .15s ease;will-change:transform;}
    .klavity-rm,.klavity-mk{transition:transform .15s cubic-bezier(.2,.7,.2,1),background .15s ease,color .15s ease,box-shadow .15s ease;will-change:transform;}
    .klavity-desc:hover,input.klavity-remail:hover,.klavity-lead input:hover{transform:var(--kl-lift);border-color:var(--kl-accent);box-shadow:0 7px 18px color-mix(in srgb,var(--kl-accent) 16%,transparent),0 0 0 1px color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    .klavity-desc:focus-within,.klavity-desc:focus,input.klavity-remail:focus,.klavity-lead input:focus{outline:none;border-color:var(--kl-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--kl-accent) 20%,transparent),0 8px 20px color-mix(in srgb,var(--kl-accent) 14%,transparent);}
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
    /* KLA-412 minimize (─) — sits just left of the close (×). Same lift/press/focus feel. The toggle
       reserves extra right padding (via :has) so neither header button overlaps the Bug/Feature chips. */
    .klavity-min{position:absolute;top:14px;right:50px;z-index:3;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;padding:0;background:transparent;color:var(--kl-muted);border:none;border-radius:9px;cursor:pointer;transition:transform .15s cubic-bezier(.34,1.56,.64,1),background .15s ease,color .15s ease;will-change:transform;}
    .klavity-min::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;}
    .klavity-min:hover{transform:var(--kl-lift);color:var(--kl-accent);background:color-mix(in srgb,var(--kl-accent) 14%,transparent);}
    .klavity-min:active{transform:var(--kl-press);}
    .klavity-min:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    .klavity-modal:has(.klavity-min) .klavity-toggle{padding-right:66px;}
    /* KLA-412 per-shot page label — the mono path each screenshot came from, under its thumbnail. Only
       rendered for shots that carry page metadata, so single-page reports show no label. */
    .klavity-pglabel{margin-top:4px;max-width:104px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;line-height:1.3;color:var(--kl-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .klavity-pglabel b{color:var(--kl-accent);font-weight:600;}
    /* Keyboard accessibility — visible focus ring on every control */
    .klavity-toggle button:focus-visible,.klavity-actions button:focus-visible,.klavity-submit:focus-visible,.klavity-lead button:focus-visible,.klavity-cta:focus-visible,.klavity-rm:focus-visible,.klavity-mk:focus-visible,.klavity-x:focus-visible{outline:2px solid var(--kl-accent);outline-offset:2px;}
    /* ── Screen button: the (i) badge is a purely visual affordance nested inside the button.
       Hovering the entire Screen button shows the floating tooltip (KLA-15/KLA-26/KLA-31). ── */
    /* KLA-587: "Snap" is the primary default capture — real tab pixels (every image, embedded frame and web
       font, no CORS gaps). Style it as the primary/accent button so the reporter's eye + first click land
       here; Full Page (the DOM re-render) stays the neutral fallback. Snap still requires a user gesture, so
       "default" = the primary button + steer, NOT an auto-fired permission prompt (see KLAVITYKLA-473).
       (The stacked "RECOMMENDED" pill was dropped per founder ask — accent styling carries the emphasis.) */
    #klavity-sharp{flex:1.4;background:var(--kl-accent);color:var(--kl-on-accent);font-weight:600;}
    #klavity-sharp:hover{filter:brightness(1.06);}
    #klavity-sharp .kl-cap-main{display:inline-flex;align-items:center;justify-content:center;gap:6px;line-height:1;}
    #klavity-sharp .kl-info-badge{opacity:.7;}
    #klavity-sharp:hover .kl-info-badge,#klavity-sharp:focus-visible .kl-info-badge{opacity:1;}
    /* Faded (i) circle inside the Screen button — lights up on button hover to signal "info here". */
    /* Absolutely-positioned in the button's top-right corner so it never consumes flex-row width and
       can't overflow the button edge (the "Screen (i)" overflow). Button is position:relative. */
    .kl-info-badge{position:absolute;top:3px;right:4px;display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;opacity:0.4;transition:opacity .15s ease;pointer-events:none;}
    .klavity-actions button:hover .kl-info-badge,.klavity-actions button:focus-visible .kl-info-badge{opacity:0.85;}
    /* .klavity-info-pop is kept in markup for its text; visibility is JS-driven via .kl-float-tip so
       the tooltip is rendered outside the overflow:hidden modal and is never clipped. */
    .klavity-info-pop{display:none;}
    /* Floating tooltip — appended to the shadow root (sibling of overlay), position:fixed to viewport so
       overflow:hidden on .klavity-modal cannot clip it. JS positions it with full viewport edge-detection. */
    .kl-float-tip{position:fixed;width:228px;max-width:calc(100vw - 16px);padding:10px 12px;border-radius:10px;background:var(--kl-bg);color:var(--kl-fg);box-shadow:0 0 0 1px var(--kl-border),0 12px 30px rgba(20,16,40,.22);font-size:12px;line-height:1.45;text-align:left;text-wrap:pretty;z-index:2147483647;pointer-events:none;visibility:hidden;opacity:0;transition:opacity .15s ease,visibility .15s step-end;}
    .kl-float-tip.kl-show{visibility:visible;opacity:1;transition:opacity .15s ease;}
    .kl-float-tip b{color:var(--kl-fg);font-weight:600;}
    /* KLA-601: the Screen-decline NUDGE — an action-oriented callout anchored to the Screen button after the
       reporter cancels the share picker (we keep the rendered fallback). It reuses the floating-tip shell but
       is DISMISSIBLE (its own close affordance / auto-hide), captures pointer events, and gets an accent hairline
       + a small arrow so it reads as a proactive tip, not the passive hover tooltip. Shown at most once/session. */
    .kl-float-tip.kl-nudge{pointer-events:auto;box-shadow:0 0 0 1.5px var(--kl-accent),0 12px 30px rgba(20,16,40,.26);}
    .kl-float-tip.kl-nudge .kl-nudge-row{display:flex;align-items:flex-start;gap:8px;}
    .kl-float-tip.kl-nudge .kl-nudge-x{flex:none;margin:-2px -2px 0 auto;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;padding:0;border:none;border-radius:6px;background:transparent;color:var(--kl-muted);cursor:pointer;transition:background .15s ease,color .15s ease;}
    .kl-float-tip.kl-nudge .kl-nudge-x:hover{background:color-mix(in srgb,var(--kl-accent) 14%,transparent);color:var(--kl-accent);}
    .kl-float-tip.kl-nudge .kl-nudge-x:focus-visible{outline:2px solid var(--kl-accent);outline-offset:1px;}
    /* Gently pulse the Screen button to draw the eye toward the one-tap retry. */
    @keyframes kl-screen-pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--kl-accent) 60%,transparent);}70%{box-shadow:0 0 0 8px rgba(124,58,237,0);}100%{box-shadow:0 0 0 0 rgba(124,58,237,0);}}
    #klavity-sharp.kl-pulse{animation:kl-screen-pulse 1.4s cubic-bezier(.4,0,.2,1) 3;}
    @media (prefers-reduced-motion:reduce){#klavity-sharp.kl-pulse{animation:none;}}
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
    .klavity-actions button.kl-active .kl-cap-ic{color:var(--kl-accent);transform:scale(1.08) rotate(3deg);}
    /* KLA-612: the primary Snap button (#klavity-sharp) ALWAYS has a SOLID accent (purple) background — even
       when it's the .kl-active capture source. The generic .kl-active .kl-cap-ic rule above paints the glyph
       --kl-accent (purple), which on this button = purple-on-purple → the app-window icon vanishes (same class
       of bug as the "missing Bug icon"). Pin the Snap icon to on-accent (white) so it stays visible next to the
       "Snap" label in BOTH rest and active states. ID specificity (1,0,1) beats the .kl-active rule (0,3,1). */
    #klavity-sharp .kl-cap-ic{color:var(--kl-on-accent);}
    /* KLA composer-polish: the Bug/Feature toggle's ACTIVE chip has a SOLID accent (purple) background, so
       the icon must be on-accent (white) — NOT accent, which would paint the glyph the same colour as its
       background and make it invisible (the "missing Bug icon" report). Inactive chips inherit --kl-fg. */
    .klavity-toggle button.active .kl-cap-ic{color:var(--kl-on-accent);transform:scale(1.08) rotate(3deg);}
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
    /* KLA-613: the recording state is unmistakable AT THE CONTROL — a clearly red, GLOWING/PULSING circle with
       the stop-square glyph — so we no longer need (and no longer render) the disconnected "Recording — tap to
       stop" text row far below the description. Action + feedback are now co-located where the user clicked. */
    #klavity-voice.kl-voice-rec{color:rgb(220 38 38);background:color-mix(in srgb,rgb(220 38 38) 16%,var(--kl-chip));box-shadow:0 0 0 2px rgba(220,38,38,.55),0 0 12px 2px rgba(220,38,38,.45);animation:kl-rec-glow 1.4s ease-in-out infinite;}
    @keyframes kl-rec-glow{0%{box-shadow:0 0 0 0 rgba(220,38,38,.55),0 0 10px 1px rgba(220,38,38,.35);}50%{box-shadow:0 0 0 4px rgba(220,38,38,.28),0 0 18px 5px rgba(220,38,38,.55);}100%{box-shadow:0 0 0 0 rgba(220,38,38,.55),0 0 10px 1px rgba(220,38,38,.35);}}
    @media (prefers-reduced-motion: reduce){#klavity-voice.kl-voice-rec{animation:none;box-shadow:0 0 0 2px rgba(220,38,38,.6);}}
    #klavity-voice.kl-voice-warn .kl-vring-prog{stroke:#f97316;}
    .kl-vdot{display:none;position:absolute;top:0;right:0;width:6px;height:6px;border-radius:50%;background:rgb(220 38 38);}
    #klavity-voice.kl-voice-rec .kl-vdot{display:block;animation:kl-vdot-pulse 1.2s ease infinite;}
    @media (prefers-reduced-motion: reduce){#klavity-voice.kl-voice-rec .kl-vdot{animation:none;}}
    /* KLA voice-fix / KLA-613: an OBVIOUS Stop affordance while recording — the mic icon swaps to a solid red
       stop square so the user can clearly see it's live and that tapping stops it. This glyph + the red glow ARE
       the recording feedback now (no separate status text). */
    .kl-vstop{display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:11px;height:11px;border-radius:2px;background:rgb(220 38 38);}
    #klavity-voice.kl-voice-rec .kl-cap-ic>svg{opacity:0;}
    #klavity-voice.kl-voice-rec .kl-vstop{display:block;}
    @keyframes kl-vdot-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.5;transform:scale(.7);}}
    /* KLAVITYKLA-495: the voice status/error gets its OWN block row (was dynamically inserted right after
       the textarea, where the Report-clarity bar's negative top margin painted over it). It sits between
       the description and the clarity helper, so the two never collide. */
    .klavity-voice-status{margin:6px 0 10px;font-size:12px;line-height:1.4;display:flex;align-items:center;gap:6px;}
    .klavity-voice-status[hidden]{display:none;}
    .klavity-voice-status.kl-vs-info{color:var(--kl-muted);}
    .klavity-voice-status.kl-vs-info::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--kl-accent);flex:0 0 auto;animation:kl-vdot-pulse 1.2s ease infinite;}
    .klavity-voice-status.kl-vs-err{color:rgb(220 38 38);}
    @media (prefers-reduced-motion: reduce){.klavity-overlay,.klavity-modal,.klavity-modal.kl-closing,.klavity-modal>*, .klavity-toast-progress{animation-duration:.01ms!important;}.klavity-modal{--kl-lift:none;--kl-press:none;--kl-bhover:none;--kl-bpress:none;}.klavity-info,.klavity-rm,.klavity-mk{transition:none!important;}.klavity-actions button.kl-loading{animation:none;}.klavity-actions .kl-cap-ic,.klavity-toggle .kl-cap-ic{transition:none;transform:none!important;}}
  `
  shadowRoot.appendChild(style)

  const overlay = document.createElement('div')
  overlay.className = 'klavity-overlay'

  const modal = document.createElement('div')
  modal.className = 'klavity-modal'
  modal.innerHTML = `
    ${sessionMode ? `<button class="klavity-min" id="klavity-min" type="button" aria-label="Minimize" title="Minimize (keeps your evidence)"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>` : ''}
    <button class="klavity-x" id="klavity-x" type="button" aria-label="Close" title="Close (Esc)">${icon('x', { size: 16 })}</button>
    <div class="kl-hero" id="klavity-hero">
      <div class="kl-hero-tools" id="klavity-hero-tools"></div>
      <div class="kl-hero-stage" id="klavity-hero-stage">
        <div class="kl-hero-empty" id="klavity-hero-empty">${icon('image', { size: 34 })}<span id="klavity-hero-empty-txt">Capture or upload a screenshot to start marking it up</span></div>
      </div>
      <div class="klavity-strip" id="klavity-strip"></div>
      ${callbacks.onCaptureSharp ? `<div class="klavity-sharphint" id="klavity-sharphint" role="status" aria-live="polite" hidden></div>` : ''}
    </div>
    <div class="kl-side" id="klavity-side">
      ${callbacks.showTitleField ? `<label class="klavity-title-label" for="klavity-title">Title<input type="text" class="klavity-title" id="klavity-title" maxlength="200" placeholder="One line summarising the issue"></label>` : ''}
      ${issueTypeOpts
        ? `<div class="klavity-types" id="klavity-types" role="radiogroup" aria-label="Issue type">${issueTypeOpts.map(t => `<button type="button" class="kl-type-chip${t.value === initialType ? ' active' : ''}" data-kind="${escHtml(t.value)}" role="radio" aria-checked="${t.value === initialType ? 'true' : 'false'}">${escHtml(t.label)}${t.mappingLabel ? `<span class="kl-type-map">${escHtml(t.mappingLabel)}</span>` : ''}</button>`).join('')}</div>`
        : `<div class="klavity-toggle">
        <button class="bug ${initialType === 'bug' ? 'active' : ''}"><span class="kl-cap-ic">${icon('bug')}</span>Bug</button>
        <button class="feat ${initialType === 'feature' ? 'active' : ''}"><span class="kl-cap-ic">${icon('lightbulb')}</span>Feature</button>
      </div>`}
      ${/* KLAVITYKLA-496: the page-path line ("/dashboard") was reporter-facing noise. It is intentionally
          NOT rendered anymore — the page URL is STILL captured and attached to the ticket (the widget puts
          location.href on the submit payload as pageUrl), only the visible line is gone for a clean composer. */''}
      ${/* KLAVITYKLA-493: the reporter-facing "Replay · 60s" chip confused users (it read like an action).
          It is intentionally NOT rendered anymore. Session replay is STILL captured and attached to the
          filed ticket (the host keeps feeding replayEvents into the submit payload); only the visible chip
          is gone. replayState is still passed through so replayAttached (evidence gating for a
          replay-only report) and setReplayState() keep working — see line ~390 and setReplayState below. */''}
      <div class="klavity-actions">
        ${callbacks.onCaptureSharp ? `<button id="klavity-sharp" class="kl-cap-primary" aria-label="Snap capture" title="Snap capture" aria-describedby="klavity-sharp-tip"><span class="kl-cap-main"><span class="kl-cap-ic">${icon('app-window')}</span><span class="kl-sharp-label">Snap</span></span><span class="kl-info-badge" aria-hidden="true"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span><span id="klavity-sharp-tip" class="klavity-info-pop" role="tooltip"><b>Snap</b> grabs the <b>whole page — every image, embedded frame, and web font, pixel-perfect</b> using your browser's screen-share. Your browser will ask you to <b>share this tab</b>.</span></button>` : ''}
        <button id="klavity-full" title="Full Page — pixel-perfect capture of the whole page via tab share (captures embedded frames &amp; cross-origin images). Falls back to a fast render if you decline the share."><span class="kl-cap-ic">${icon('camera')}</span><span class="kl-full-label">Full Page</span></button>
        ${/* KLA-591: ONE unified attach control (images + video + PDF/logs) when file attachments are on;
             image-only "Upload" otherwise. The old separate "Attach file" button is gone. */''}
        <button id="klavity-upload" title="${fileAttachEnabled ? 'Add a screenshot, video, or file (images, MP4, PDF, .log, .har, ...)' : 'Upload a screenshot'}"><span class="kl-cap-ic">${icon(fileAttachEnabled ? 'paperclip' : 'image')}</span><span class="kl-upload-label">${fileAttachEnabled ? 'Attach' : 'Upload'}</span></button>
        ${recordingEnabled ? `<button id="klavity-record" title="Record your screen, camera and narration"><span class="kl-cap-ic">${icon('monitor')}</span><span class="kl-record-label">Record me</span></button>` : ''}
        ${callbacks.onRegionCapture ? `<button id="klavity-region"><span class="kl-cap-ic">${icon('scissors')}</span><span class="kl-region-label">Region</span></button>` : ''}
        ${callbacks.onPickElement ? `<button id="klavity-pick" title="Pick the exact element that's broken"><span class="kl-cap-ic">${icon('mouse-pointer-2')}</span><span class="kl-pick-label">Pick element</span></button>` : ''}
      </div>
      ${callbacks.onPickElement ? `<div class="klavity-pickinfo" id="klavity-pickinfo" role="status" aria-live="polite" hidden></div>` : ''}
      ${/* KLA-593: the "Mask numbers" redaction toggle moved to the TOP of the image-editing (hero) toolbar,
          grouped with the other redaction/editing tools — see heroToolbarHtml. */''}
      ${/* KLA-591: ONE hidden input drives the unified attach control (broad accept) when file attachments
           are enabled; the image-only accept is kept for the plain Upload button otherwise. */''}
      <input type="file" id="klavity-file" accept="${fileAttachEnabled ? UNIFIED_ATTACH_ACCEPT : 'image/*,.heic,.heif'}" multiple style="display:none">
      ${fileAttachEnabled ? `<div class="klavity-attach-hint" id="klavity-attach-hint"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><span>Images, video, PDF or logs — up to ${Math.round(PER_FILE_MAX_BYTES / 1024 / 1024)}MB each</span></div>` : ''}
      ${/* KLA composer-polish: the images-count row now also hosts the Mevak-style circular Voice mic at its
           right end (replaces the old full-width Voice button in the capture grid). The row always renders when
           Voice is supported so the mic has a home even before any image is attached (the counter itself stays
           hidden until there's an image). */''}
      <div class="klavity-descbar">
        <div class="klavity-counter" id="klavity-counter" hidden>0/${MAX_IMAGES} images</div>
        ${voiceSupported ? `<button id="klavity-voice" class="kl-voice-circle" type="button" title="Voice dictation" aria-label="Voice dictation" aria-pressed="false"><span class="kl-cap-ic">${icon('mic')}<span class="kl-vdot"></span><span class="kl-vstop" aria-hidden="true"></span></span><svg class="kl-vring" viewBox="0 0 32 32" aria-hidden="true"><circle class="kl-vring-bg" cx="16" cy="16" r="13" fill="none" stroke-width="2"/><circle class="kl-vring-prog" cx="16" cy="16" r="13" fill="none" stroke-width="2" stroke-dasharray="81.68" stroke-dashoffset="81.68" stroke-linecap="round" transform="rotate(-90 16 16)"/></svg></button>` : ''}
      </div>
      ${fileAttachEnabled ? '<div class="klavity-capmsg" id="klavity-capmsg" role="alert" hidden></div>' : ''}
      ${fileAttachEnabled ? '<div class="klavity-files" id="klavity-files" hidden></div>' : ''}
      ${/* KLA-602(a): recordings render as video TILES in the strip (updateStrip), not a separate chip row. */''}
      <div class="klavity-error" id="klavity-err"></div>
      <div class="klavity-desc" id="klavity-desc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Description" data-ph="${initialType === 'feature' ? "Describe the feature you'd like..." : 'Describe the bug...'}"></div>
      <div class="klavity-desc-hint" id="klavity-desc-hint" hidden>${icon('sparkles', { size: 13 })}<span>No title needed — we'll auto-generate one for you</span></div>
      ${callbacks.onEnhance ? `<div class="klavity-enhance-row" id="klavity-enhance-row">
        <button type="button" class="klavity-enhance-btn" id="klavity-enhance">${icon('sparkles', { size: 14 })}<span>Enhance with AI</span></button>
        <button type="button" class="klavity-enhance-undo" id="klavity-enhance-undo" hidden>${icon('rotate-cw', { size: 13 })}<span>Undo</span></button>
        <button type="button" class="klavity-enhance-regen" id="klavity-enhance-regen" hidden>${icon('refresh-cw', { size: 13 })}<span>Regenerate</span></button>
      </div>
      <div class="klavity-enhance-spin" id="klavity-enhance-spin" hidden><span class="kl-enh-loader"></span><span>Drafting from your screenshot…</span></div>` : ''}
      ${voiceSupported ? `<div class="klavity-voice-status" id="klavity-voice-status" role="status" aria-live="polite" hidden></div>` : ''}
      ${cfg.reportClarity ? `<div class="klavity-clarity" id="klavity-clarity" role="status" aria-live="polite" hidden>
        <div class="kl-clr-bar"><i></i><i></i><i></i></div>
        <div class="kl-clr-row"><span>Report clarity</span><span class="kl-clr-st" id="klavity-clarity-status">Needs detail</span></div>
        <div class="kl-clr-chips">
          <span class="kl-clr-chip" id="klavity-clarity-problem"><span class="kl-clr-mark">○</span> What's broken</span>
          <span class="kl-clr-chip" id="klavity-clarity-expected"><span class="kl-clr-mark">○</span> What you expected</span>
          <span class="kl-clr-chip" id="klavity-clarity-repro"><span class="kl-clr-mark">○</span> How to reproduce</span>
        </div>
      </div>` : ''}
      ${callbacks.onCheckKnown ? `<div class="klavity-known" id="klavity-known" role="status" aria-live="polite" hidden></div>` : ''}
      ${callbacks.requireEmail ? '<input type="email" class="klavity-remail" id="klavity-remail" placeholder="your@email.com" autocomplete="email">' : ''}
      ${cfg.reportClarity && cfg.preSubmitNudge !== false ? `<div class="klavity-nudge" id="klavity-nudge" role="alert" hidden>
        <div class="kl-nudge-h">This might be hard for the team to act on</div>
        <div class="kl-nudge-d">Adding what you expected + one step to reproduce gets it fixed faster. Or send it as-is — your call.</div>
        <div class="kl-nudge-row"><button type="button" class="kl-nudge-add" id="klavity-nudge-add">Add detail</button><button type="button" class="kl-nudge-anyway" id="klavity-nudge-anyway">Submit anyway</button></div>
      </div>` : ''}
      ${cfg.submitTargetToggle !== false ? `<div class="klavity-target" id="klavity-target">
        <div class="kl-tgt-label">Where should this go?</div>
        <div class="kl-tgt-seg" role="radiogroup" aria-label="Where should this report go?">
          <button type="button" class="kl-tgt-opt on" id="klavity-target-project" role="radio" aria-checked="true" data-target="project">Your team<small>${escHtml(cfg.projectDisplayName || 'your project')}</small></button>
          <button type="button" class="kl-tgt-opt" id="klavity-target-klavity" role="radio" aria-checked="false" data-target="klavity">Klavity<small>problem with this tool</small></button>
        </div>
      </div>` : ''}
      ${callbacks.consoleAttachToggle ? `<div class="klavity-conlog" id="klavity-conlog">
        <label class="kl-conlog-lbl" title="Attach this page's captured console logs to the report">
          <input type="checkbox" id="klavity-conlog-cb">${icon('file-text', { size: 14 })}<span>Attach console logs</span>
        </label>
      </div>` : ''}
      <button type="button" class="klavity-submit" id="klavity-submit" title="Submit (S)" disabled>Submit</button>
      <div class="klavity-progress" id="klavity-progress" role="progressbar" aria-label="Uploading report"><div class="klavity-progress-fill" id="klavity-progress-fill"></div></div>
    </div>
  `

  overlay.appendChild(modal)
  shadowRoot.appendChild(overlay)

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

  // ── KLA-601: Screen-decline helper NUDGE ──────────────────────────────────────────────────────────────
  // When the reporter cancels the getDisplayMedia share picker, we KEEP the rendered fallback (never leave
  // them shot-less) but surface a one-time, dismissible, action-oriented callout anchored to the (recommended)
  // Screen button — plus a gentle pulse to draw the eye — instead of failing silently. Shown AT MOST ONCE per
  // composer session (no nagging on every decline) and NEVER when Screen isn't supported (no sharpBtn → iOS
  // Safari). Reuses the floating-tip shell so it can't be clipped by the modal's overflow:hidden.
  let screenNudgeShown = false
  let screenNudgeEl: HTMLElement | null = null
  function dismissScreenNudge() {
    try { screenNudgeEl?.remove() } catch { /* no-op */ }
    screenNudgeEl = null
    try { sharpBtn?.classList.remove('kl-pulse') } catch { /* no-op */ }
  }
  function showScreenNudge() {
    if (screenNudgeShown || !sharpBtn || _closed) return // once/session + Screen-supported only
    screenNudgeShown = true
    const el = document.createElement('div')
    el.className = 'kl-float-tip kl-nudge'
    el.setAttribute('role', 'status')
    el.setAttribute('aria-live', 'polite')
    el.innerHTML =
      '<div class="kl-nudge-row"><span><b>This screenshot may be missing images or detail.</b> Share your screen for a pixel-perfect shot.</span>' +
      `<button type="button" class="kl-nudge-x" aria-label="Dismiss">${icon('x', { size: 13 })}</button></div>`
    shadowRoot.appendChild(el)
    screenNudgeEl = el
    // Position like the hover tip (below the Screen button, flipping above when short on room).
    const r = sharpBtn.getBoundingClientRect()
    const TIP_W = Math.min(228, window.innerWidth - 16)
    const PAD = 8
    const vw = window.innerWidth, vh = window.innerHeight
    el.style.left = Math.max(PAD, Math.min((r.left + r.width / 2) - TIP_W / 2, vw - TIP_W - PAD)) + 'px'
    el.style.top = '-9999px'; el.style.visibility = 'hidden'; el.style.display = 'block'
    const tipH = el.offsetHeight
    el.style.display = ''; el.style.visibility = ''
    let top = r.bottom + 8
    if (top + tipH + PAD > vh) top = r.top - tipH - 8
    el.style.top = Math.max(PAD, Math.min(top, vh - tipH - PAD)) + 'px'
    el.classList.add('kl-show')
    ;(el.querySelector('.kl-nudge-x') as HTMLButtonElement | null)?.addEventListener('click', dismissScreenNudge)
    // Pulse the Screen button to steer the eye toward the one-tap manual retry (CSS-gated for reduced-motion).
    try { sharpBtn.classList.add('kl-pulse') } catch { /* no-op */ }
    // Auto-dismiss after a while so it never lingers; also drop it the moment the reporter clicks Screen.
    try { setTimeout(() => dismissScreenNudge(), 9000) } catch { /* no-op */ }
    sharpBtn.addEventListener('click', dismissScreenNudge, { once: true })
  }

  // JTBD 1.8: mutate the attached-proof chip after mount (rrweb loads async). No-op if no chip exists.
  function setReplayState(state: 'attached' | 'unavailable'): void {
    // JTBD 1.10: a resolved replay buffer is evidence — re-evaluate Submit so a replay-only report enables.
    replayAttached = state === 'attached'
    refreshSubmit()
    // KLAVITYKLA-493: no chip is rendered anymore — the state only drives evidence gating (above), so
    // there is nothing left to repaint in the DOM.
  }

  // KLA-412: the CURRENT page's tag — used to label an interactive capture in session mode when the
  // host didn't supply an explicit tag (the shot came from whatever page the composer is open on).
  function currentPageMeta(): ShotPageMeta | undefined {
    if (typeof window === 'undefined' || !window.location) return undefined
    return { pageUrl: window.location.href, pagePath: window.location.pathname }
  }

  const controller: ModalController = {
    shadowRoot,
    // Host seeds shots it already tracks (evidence-session restore, region-initial): fireAdded=false so
    // onShotAdded does NOT re-fire (which would double-persist). Page metadata is carried through as-is.
    addScreenshot: (dataUrl: string, quality?: CaptureQuality, pageMeta?: ShotPageMeta, suggestSharp?: boolean, capture?: ShotCapture) => addScreenshot(dataUrl, quality, pageMeta, false, !!suggestSharp, capture),
    // fireAdded=true: select the new shot as the active hero + fire onShotAdded (persist). See interface doc.
    addCapturedShot: (dataUrl: string, quality?: CaptureQuality, pageMeta?: ShotPageMeta, suggestSharp?: boolean, capture?: ShotCapture) => addScreenshot(dataUrl, quality, pageMeta, true, !!suggestSharp, capture),
    close,
    setReplayState,
    // KLA-591: mirror the aggregate upload percent onto every video tile + file chip while a submit is in
    // flight. Re-renders the strip + chips so the bars paint; passing null clears them.
    setUploadProgress: (pct: number | null) => {
      uploadProgressPct = attachmentProgressPercent(pct)
      if (_closed) return
      try { updateStrip(); renderFiles() } catch { /* progress paint is best-effort */ }
    },
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
      // KLA-591: also drop any active video hero so the annotator (not the <video>) owns the stage.
      img.addEventListener('click', () => { activeIndex = i; activeVideoIndex = null; activeRecordingIndex = null; updateStrip() })
      const rm = document.createElement('button')
      rm.className = 'klavity-rm'
      rm.innerHTML = icon('x', { size: 13 })
      rm.title = 'Remove'
      rm.addEventListener('click', (e) => {
        e.stopPropagation()
        screenshots.splice(i, 1)
        screenshotCompressed.splice(i, 1)
        screenshotQuality.splice(i, 1) // JTBD 1.9: keep the quality tags aligned with the shifted indices
        screenshotPageMeta.splice(i, 1) // KLA-412: keep the page tags aligned with the shifted indices
        screenshotSuggestSharp.splice(i, 1) // KLAVITYKLA-473: keep the sharp-suggest flags aligned too
        screenshotCapture.splice(i, 1) // KLA-621: keep the capture-provenance aligned too
        // KLA-412: tell the host to drop the matching shot from the evidence session (index-aligned).
        try { callbacks.onShotRemoved?.(i) } catch { /* host sync best-effort */ }
        // KLAVITYKLA-217: keep annotationsByIndex aligned with the (now shifted) screenshot indices —
        // drop the removed image's markup and slide every higher index down by one. Without this, submitting
        // the full per-image map would attach an annotation to the wrong screenshot after a mid-strip delete.
        delete annotationsByIndex[i]
        for (const key of Object.keys(annotationsByIndex).map(Number).filter(n => n > i).sort((a, b) => a - b)) {
          annotationsByIndex[key - 1] = annotationsByIndex[key]
          delete annotationsByIndex[key]
        }
        // #449: keep the per-image undo + crop history index-aligned with the shifted screenshots.
        delete undoStacks[i]; delete cropStacks[i]
        for (const key of Object.keys(undoStacks).map(Number).filter(n => n > i).sort((a, b) => a - b)) {
          undoStacks[key - 1] = undoStacks[key]; delete undoStacks[key]
        }
        for (const key of Object.keys(cropStacks).map(Number).filter(n => n > i).sort((a, b) => a - b)) {
          cropStacks[key - 1] = cropStacks[key]; delete cropStacks[key]
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
      // Media box holds the image + its overlay badges so those absolutely-positioned badges anchor to the
      // image, not the taller thumb column (which also carries the "Retake sharp" pill + notes below).
      const media = document.createElement('div')
      media.className = 'klavity-thumb-media'
      media.append(img, rm, mk)
      wrap.append(media)

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
          : quality === 'wireframe' ? 'Wireframe fallback — layout only, images not captured. This shot may contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.'
          : 'Rendered screenshot — may be missing images or detail. This shot can contain defects; share your screen with Snap (or "Retake sharp") for a pixel-perfect capture.'
        badge.innerHTML = icon(meta.iconName, { size: 10 }) + '<span class="klavity-qb-t">' + escHtml(meta.label) + '</span>'
        media.appendChild(badge)

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

      // KLAVITYKLA-496: the per-shot page-URL label ("/deals · list") under each thumbnail was
      // reporter-facing noise, so it is intentionally NOT rendered anymore. The page each shot came from is
      // STILL captured — screenshotPageMeta stays populated and the widget appends the "Pages captured"
      // trail to the description on submit (buildPagesTrail), so the multi-page evidence still reaches the
      // ticket; only the visible per-thumbnail label is gone for a clean composer.

      strip.appendChild(wrap)
    })
    // KLA-591: unified gallery — render VIDEO attachments as poster tiles in the SAME strip, right after the
    // image thumbs. Each shows the first frame (the <video> element itself, muted/preload=metadata) under a
    // play overlay; clicking selects it as the active hero (inline <video controls> preview). Non-video docs
    // stay as chips (renderFiles). Uses the real attachedFiles index so remove/hero-selection stay aligned.
    attachedFiles.forEach((f, fi) => {
      if (attachmentKind(f) !== 'video') return
      const wrap = document.createElement('div')
      wrap.className = 'klavity-thumb kl-video-thumb'
      if (activeVideoIndex === fi) wrap.classList.add('kl-thumb-active')
      const vid = document.createElement('video')
      vid.src = f.dataUrl
      vid.muted = true
      vid.preload = 'metadata'
      vid.setAttribute('playsinline', '')
      vid.tabIndex = -1
      const play = document.createElement('span')
      play.className = 'kl-video-play'
      play.setAttribute('aria-hidden', 'true')
      play.innerHTML = icon('play', { size: 16 })
      const label = document.createElement('span')
      label.className = 'kl-video-badge'
      label.innerHTML = icon('play', { size: 9 }) + '<span>Video</span>'
      wrap.title = 'Click to play ' + f.name
      wrap.addEventListener('click', () => { activeVideoIndex = fi; activeRecordingIndex = null; updateStrip() })
      const rm = document.createElement('button')
      rm.className = 'klavity-rm'
      rm.innerHTML = icon('x', { size: 13 })
      rm.title = 'Remove'
      rm.addEventListener('click', (e) => { e.stopPropagation(); removeAttachmentAt(fi) })
      wrap.append(vid, play, label, rm)
      // KLA-591: shared upload-progress bar while a submit is in flight (especially a large video).
      const pct = attachmentProgressPercent(uploadProgressPct)
      if (pct != null) {
        const bar = document.createElement('div'); bar.className = 'kl-att-prog'
        const fillEl = document.createElement('i'); fillEl.style.width = pct + '%'
        bar.appendChild(fillEl); wrap.appendChild(bar)
      }
      strip.appendChild(wrap)
    })
    // KLA-602(a): "Record me" recordings render as removable video TILES in the SAME strip (reusing the
    // KLA-591 video-tile look) — no separate Preview→Attach modal, no text-chip strip. Clicking selects it as
    // the inline-playable hero; a corner "Re-record" action lets the reporter redo the walkthrough; Remove
    // deletes it. They live in recordings[] (not attachedFiles) so they still thread through onSubmit as the
    // dedicated `recordings` field (Phase-2 transcript hook), while looking + behaving like any gallery video.
    recordings.forEach((rec, ri) => {
      const wrap = document.createElement('div')
      wrap.className = 'klavity-thumb kl-video-thumb kl-rec-tile'
      if (activeRecordingIndex === ri) wrap.classList.add('kl-thumb-active')
      const vid = document.createElement('video')
      vid.src = rec.dataUrl
      vid.muted = true
      vid.preload = 'metadata'
      vid.setAttribute('playsinline', '')
      vid.tabIndex = -1
      const play = document.createElement('span')
      play.className = 'kl-video-play'
      play.setAttribute('aria-hidden', 'true')
      play.innerHTML = icon('play', { size: 16 })
      const secs = Math.round(rec.durationMs / 1000)
      const label = document.createElement('span')
      label.className = 'kl-video-badge'
      label.innerHTML = icon('play', { size: 9 }) + `<span>${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}${rec.screenOnly ? ' · screen' : ''}</span>`
      wrap.title = 'Click to play your recording'
      wrap.addEventListener('click', () => { activeRecordingIndex = ri; activeVideoIndex = null; updateStrip() })
      // Re-record (top-left): drop this clip + re-open the recorder for a fresh take.
      const redo = document.createElement('button')
      redo.type = 'button'
      redo.className = 'kl-rerec'
      redo.innerHTML = icon('refresh-cw', { size: 12 })
      redo.title = 'Re-record'
      redo.setAttribute('aria-label', 'Re-record')
      redo.addEventListener('click', (e) => {
        e.stopPropagation()
        recordings.splice(ri, 1)
        if (activeRecordingIndex === ri) activeRecordingIndex = null
        else if (activeRecordingIndex != null && activeRecordingIndex > ri) activeRecordingIndex -= 1
        renderRecordings()
        // Re-open the recorder via the same Record button gesture (kept in-DOM so the click is user-initiated).
        try { (shadowRoot.getElementById('klavity-record') as HTMLButtonElement | null)?.click() } catch { /* no-op */ }
      })
      // Remove (top-right): delete the recording from the gallery.
      const rm = document.createElement('button')
      rm.className = 'klavity-rm'
      rm.innerHTML = icon('x', { size: 13 })
      rm.title = 'Remove'
      rm.addEventListener('click', (e) => {
        e.stopPropagation()
        recordings.splice(ri, 1)
        if (activeRecordingIndex === ri) activeRecordingIndex = null
        else if (activeRecordingIndex != null && activeRecordingIndex > ri) activeRecordingIndex -= 1
        renderRecordings()
      })
      wrap.append(vid, play, label, redo, rm)
      const rpct = attachmentProgressPercent(uploadProgressPct)
      if (rpct != null) {
        const bar = document.createElement('div'); bar.className = 'kl-att-prog'
        const fillEl = document.createElement('i'); fillEl.style.width = rpct + '%'
        bar.appendChild(fillEl); wrap.appendChild(bar)
      }
      strip.appendChild(wrap)
    })
    // Bug 3: keep the active thumbnail in view — when a fresh capture is selected at the END of a long
    // strip, scroll it into view so the reporter sees the shot that's now in the hero (best-effort).
    try {
      const activeWrap = strip.children[activeIndex] as HTMLElement | undefined
      if (activeWrap && typeof activeWrap.scrollIntoView === 'function') {
        activeWrap.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }
    } catch { /* scrollIntoView is a nicety — never let it break the strip render */ }
    // KLAVITYKLA-509: while auto-capture is rendering the first shot, show a skeleton tile so the slot isn't
    // blank. Swapped out the instant addScreenshot() runs (which flips `capturing` off + re-renders).
    if (capturing) {
      const skel = document.createElement('div')
      skel.className = 'kl-thumb-skel kl-loading'
      skel.setAttribute('role', 'status')
      skel.setAttribute('aria-label', 'Capturing screenshot')
      skel.innerHTML = '<span class="kl-skel-spin" aria-hidden="true"></span><span>Capturing…</span>'
      strip.appendChild(skel)
    }
    // KLAVITYKLA-496: the "0/5 images" counter was internal state, not reporter language — it now only
    // appears once there is something to count (and stays hidden on an empty strip).
    counter.textContent = `${screenshots.length}/${MAX_IMAGES} images`
    if (counter instanceof HTMLElement) counter.hidden = screenshots.length === 0
    // JTBD 1.10: attaching/removing a screenshot changes the evidence state → re-evaluate Submit + hint.
    refreshSubmit()
    // KLAVITYKLA-473: re-evaluate the "suggest Screen" callout for the (possibly new) active shot.
    updateSharpSuggestion()
    // Image-hero: keep the big annotator pane in sync with the strip (selection / empty state).
    syncHero()
  }

  // KLAVITYKLA-473: show a non-intrusive callout — pointing at the Screen button — when the ACTIVE shot was
  // detected (in the browser) as blank/partial-white (cross-origin images the DOM renderer couldn't inline
  // dropped to white gaps). It never auto-captures: the sharp getDisplayMedia grab fires only when the user
  // clicks Screen (either the real button or this callout's "Use Screen", which forwards the click's gesture).
  function updateSharpSuggestion() {
    const hint = shadowRoot.getElementById('klavity-sharphint') as HTMLElement | null
    if (!hint) return // onCaptureSharp not wired → the callout element isn't rendered
    const flagged = screenshots.length > 0 && activeIndex >= 0 && activeIndex < screenshots.length && !!screenshotSuggestSharp[activeIndex]
    const show = flagged && !sharpHintDismissed && !!callbacks.onCaptureSharp && !busy
    if (show) {
      if (!hint.dataset.built) {
        hint.dataset.built = '1'
        hint.innerHTML = ''
        const ic = document.createElement('span')
        ic.className = 'kl-sh-ic'
        ic.innerHTML = icon('triangle-alert', { size: 15 })
        const txt = document.createElement('span')
        txt.className = 'kl-sh-txt'
        // ASCII-only copy, mirroring the approved mockup.
        txt.textContent = "This screenshot may be missing images or detail. Share your screen with Snap for a pixel-perfect shot."
        const use = document.createElement('button')
        use.type = 'button'
        use.className = 'kl-sh-use'
        use.textContent = 'Use Snap'
        // Forward the user's click straight to the Screen button so getDisplayMedia keeps its user gesture.
        use.addEventListener('click', () => { sharpHintDismissed = true; updateSharpSuggestion(); sharpBtn?.click() })
        const dismiss = document.createElement('button')
        dismiss.type = 'button'
        dismiss.className = 'kl-sh-x'
        dismiss.setAttribute('aria-label', 'Dismiss')
        dismiss.title = 'Dismiss'
        dismiss.innerHTML = icon('x', { size: 12 })
        dismiss.addEventListener('click', () => { sharpHintDismissed = true; updateSharpSuggestion() })
        hint.append(ic, txt, use, dismiss)
      }
      hint.hidden = false
      sharpBtn?.classList.add('kl-suggest')
    } else {
      hint.hidden = true
      sharpBtn?.classList.remove('kl-suggest')
    }
  }

  // KLAVITYKLA-473 follow-up: when the auto-capture-on-open comes back BLANK (e.g. the reporter DECLINED the
  // tab-share and the fallback DOM render was essentially white — common on dark/app-shell pages), we do NOT
  // seed the useless white image into the hero. Instead we leave the stage empty and swap the empty-state copy
  // to steer the reporter to Snap (share screen) or an upload. Non-destructive: any later real capture hides
  // the empty state as usual (updateStrip only shows it while screenshots is empty).
  function showBlankCaptureEmptyState() {
    blankCaptureHint = true
    capturing = false
    updateStrip() // re-renders the empty stage via renderHeroEmpty(), which reads blankCaptureHint for its copy
  }
  // The empty-state line under the hero image. Steers to Snap after a blank auto-capture; otherwise the
  // neutral "capture or upload" prompt.
  function emptyStateText(): string {
    if (blankCaptureHint) {
      return callbacks.onCaptureSharp
        ? "Couldn't grab this page automatically — click Snap to share your tab for a pixel-perfect shot, or attach an image."
        : "Couldn't grab this page automatically — try Full Page, or attach an image."
    }
    return 'Capture or upload a screenshot to start marking it up'
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

  // `fireAdded` is true for shots captured/uploaded INSIDE the composer (buttons / paste / auto-capture) —
  // those fire onShotAdded so the host can persist them to the evidence session, and in session mode they
  // default to the CURRENT page's tag. The host's controller.addScreenshot passes fireAdded=false to SEED
  // shots it already tracks (no re-persist, explicit page tag carried through).
  function addScreenshot(dataUrl: string, quality?: CaptureQuality, pageMeta?: ShotPageMeta, fireAdded = true, suggestSharp = false, capture?: ShotCapture) {
    // Hard cap — every capture/upload/paste path funnels through here, so the limit holds everywhere.
    if (screenshots.length >= MAX_IMAGES) { showError(`You can attach up to ${MAX_IMAGES} images.`); return }
    clearError()
    blankCaptureHint = false // a real shot landed → drop the "couldn't capture" empty-state steer
    screenshots.push(dataUrl)
    // Kick off compression immediately — by submit time the Promise is settled (user was typing).
    screenshotCompressed.push(callbacks.compressImage ? callbacks.compressImage(dataUrl) : Promise.resolve(dataUrl))
    screenshotQuality.push(quality) // JTBD 1.9: stays aligned with screenshots[] (undefined = no badge)
    // KLAVITYKLA-473: a real-pixel shot can never be blank/partial, so never suggest sharp for one.
    screenshotSuggestSharp.push(suggestSharp && quality !== 'real-pixel')
    screenshotCapture.push(capture) // KLA-621: remember what this shot was (region/element/…) for Retake
    // KLA-412: keep the page-tag array aligned. An interactive session-mode capture with no explicit tag
    // is tagged with the current page; everything else keeps whatever the caller passed (often undefined).
    screenshotPageMeta.push(pageMeta ?? (sessionMode && fireAdded ? currentPageMeta() : undefined))
    // Bug fix (multi-page evidence editor): a genuine user capture (region/full/sharp/upload/paste — all
    // call with fireAdded=true) must become the ACTIVE hero image, otherwise the editor keeps showing the
    // first shot while the new one sits at the end of the strip. Only for real captures; the seed path
    // (fireAdded=false, from controller.addScreenshot) leaves activeIndex alone so session restore is undisturbed.
    // A genuine new capture becomes the hero — drop any video/recording hero selection so the fresh image shows.
    if (fireAdded) { activeIndex = screenshots.length - 1; activeVideoIndex = null; activeRecordingIndex = null }
    updateStrip()
    if (fireAdded) { try { callbacks.onShotAdded?.(dataUrl, quality) } catch { /* host persistence best-effort */ } }
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
      // KLA-621: hand the ORIGINAL shot's provenance to the host so Retake redoes the SAME region/element
      // (pixel-perfect from the shared Snap frame) rather than a full-screen grab that loses the selection.
      try { result = await callbacks.onRetakeSharp(screenshotCapture[index]) }
      finally { restore?.() }
      if (result) {
        const { dataUrl, quality } = normalizeCapture(result)
        if (dataUrl) {
          screenshots[index] = dataUrl
          screenshotCompressed[index] = callbacks.compressImage ? callbacks.compressImage(dataUrl) : Promise.resolve(dataUrl)
          screenshotQuality[index] = quality ?? 'real-pixel'
          screenshotSuggestSharp[index] = false // KLAVITYKLA-473: a sharp retake can't be blank/partial
          // Clear any markup on this image — the new capture has different pixels/dimensions.
          if (annotationsByIndex[index]) { delete annotationsByIndex[index]; retakeClearedNote.add(index) }
          // #449: the shot was fully replaced — its old undo/crop history no longer matches these pixels.
          delete undoStacks[index]; delete cropStacks[index]
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

  // ── KLA-591 unified gallery: non-previewable file CHIPS (video attachments render in the strip below) ──
  // Render chips for non-image, non-video attachments (PDF/log/har/…). Videos live in attachedFiles too but
  // are rendered as poster tiles inside the thumbnail strip by updateStrip(), not here. Hidden when empty.
  function renderFiles() {
    const box = shadowRoot.getElementById('klavity-files') as HTMLElement | null
    if (!box) return
    box.innerHTML = ''
    const docs = attachedFiles.filter(f => attachmentKind(f) === 'file')
    box.hidden = docs.length === 0
    attachedFiles.forEach((f, i) => {
      if (attachmentKind(f) !== 'file') return // videos are rendered in the strip, images in screenshots[]
      const chip = document.createElement('div')
      chip.className = 'kl-file-chip'
      const ic = document.createElement('span')
      ic.className = 'kl-file-ic'
      ic.innerHTML = icon('file-text', { size: 14 })
      const nm = document.createElement('span')
      nm.className = 'kl-file-nm'
      nm.textContent = f.name
      nm.title = f.name
      const sz = document.createElement('span')
      sz.className = 'kl-file-sz'
      sz.textContent = f.size < 1024 ? `${f.size} B` : f.size < 1024 * 1024 ? `${Math.round(f.size / 1024)} KB` : `${(f.size / 1024 / 1024).toFixed(1)} MB`
      const rm = document.createElement('button')
      rm.type = 'button'
      rm.className = 'kl-file-rm'
      rm.setAttribute('aria-label', `Remove ${f.name}`)
      rm.title = 'Remove'
      rm.innerHTML = icon('x', { size: 11 })
      rm.addEventListener('click', () => { removeAttachmentAt(i) })
      chip.append(ic, nm, sz, rm)
      // KLA-591: paint the shared upload-progress bar on the chip while a submit is in flight.
      const pct = attachmentProgressPercent(uploadProgressPct)
      if (pct != null) {
        const bar = document.createElement('div'); bar.className = 'kl-att-prog'
        const fillEl = document.createElement('i'); fillEl.style.width = pct + '%'
        bar.appendChild(fillEl); chip.appendChild(bar)
      }
      box.appendChild(chip)
    })
    // An attached file is evidence in its own right — re-evaluate Submit (a file-only report is valid).
    refreshSubmit()
  }

  // KLA-591: remove an attachment (video or doc) by its attachedFiles index, keeping the strip + chips +
  // active-video hero in sync. If the removed item was the active video hero, drop the hero selection.
  function removeAttachmentAt(index: number) {
    const wasVideo = attachedFiles[index] && attachmentKind(attachedFiles[index]) === 'video'
    attachedFiles.splice(index, 1)
    if (activeVideoIndex != null) {
      if (wasVideo && activeVideoIndex === index) activeVideoIndex = null
      else if (activeVideoIndex > index) activeVideoIndex -= 1
    }
    renderFiles()
    updateStrip()
  }

  // KLA-612: reusable "Request upgrade" control primitive — the single affordance behind the over-cap file
  // notice AND (future) credit walls. Role-driven:
  //   • kind:'upgrade' + url  → a member/owner is sent STRAIGHT to the upgrade page (a normal external link).
  //   • kind:'ask-team'       → a guest/anon reporter (never asked to pay) gets a BUTTON that POSTs an
  //                             attributed upgrade REQUEST via callbacks.onRequestUpgrade; on success it swaps
  //                             to a "Request sent to your team" confirmation. On failure (or no host callback)
  //                             it degrades gracefully so the reporter is never dead-ended.
  // `ctx` is forwarded to the host (page/ticket/fileMeta) so the admin notification can be attributed.
  function buildUpgradeControl(
    cta: { kind: 'upgrade' | 'ask-team'; label: string; url?: string; reason?: string },
    ctx?: Record<string, unknown>,
  ): HTMLElement | null {
    if (cta.kind === 'upgrade') {
      if (!cta.url) return null // no destination configured → fall back to the hint alone (no broken link)
      const a = document.createElement('a')
      a.className = 'kl-capmsg-cta'; a.href = cta.url; a.target = '_blank'; a.rel = 'noopener noreferrer'
      a.textContent = cta.label
      return a
    }
    // guest/anon → a real request button. When the host wired no callback (e.g. the extension, for parity)
    // there's no actionable request, so return null and let the secondary hint carry the escape hatch.
    if (!callbacks.onRequestUpgrade) return null
    const btn = document.createElement('button')
    btn.type = 'button'; btn.className = 'kl-capmsg-cta kl-capmsg-req'; btn.textContent = cta.label
    btn.addEventListener('click', async () => {
      if (btn.disabled) return
      const prev = btn.textContent || cta.label
      btn.disabled = true; btn.textContent = 'Requesting…'
      let ok = false
      try { ok = await callbacks.onRequestUpgrade!({ reason: cta.reason || 'upgrade', context: ctx }) } catch { ok = false }
      if (ok) {
        const done = document.createElement('span'); done.className = 'kl-capmsg-sent'
        done.innerHTML = `<span class="kl-capmsg-sent-ic">${icon('check')}</span>Request sent to your team`
        btn.replaceWith(done)
      } else {
        btn.disabled = false; btn.textContent = prev // never dead-end — let them retry
      }
    })
    return btn
  }

  // KLA-591 / KLA-612: role-aware over-cap notice. Shows a friendly inline message + the reusable "Request
  // upgrade" control (member/owner → upgrade link; anon/guest → attributed request button) WITHOUT dropping
  // the file silently and without dead-ending — the secondary hint keeps "attach a smaller file" in view.
  function showCapMessage(decision: FileCapDecision, ctx?: Record<string, unknown>) {
    const box = shadowRoot.getElementById('klavity-capmsg') as HTMLElement | null
    if (!box || !decision.overCap) return
    box.innerHTML = ''
    const msg = document.createElement('span'); msg.className = 'kl-capmsg-t'; msg.textContent = decision.message || ''
    box.appendChild(msg)
    if (decision.cta) {
      const ctrl = buildUpgradeControl(decision.cta, ctx)
      if (ctrl) box.appendChild(ctrl)
      // Secondary escape hatch, shown alongside the upgrade action (the button/link doesn't repeat it).
      if (decision.cta.hint) {
        const hint = document.createElement('span'); hint.className = 'kl-capmsg-hint'; hint.textContent = decision.cta.hint
        box.appendChild(hint)
      }
    }
    box.hidden = false
  }
  function clearCapMessage() {
    const box = shadowRoot.getElementById('klavity-capmsg') as HTMLElement | null
    if (box) { box.hidden = true; box.innerHTML = '' }
  }

  // KLA-591: ingest from the ONE unified picker (or paste). Images fan out to the screenshot path; videos +
  // docs become attachments. Enforces count + per-file + total-size caps; an over-cap file surfaces a
  // friendly, role-aware CTA (never a silent drop). Files are read as data URLs and threaded through onSubmit.
  async function ingestAttachments(files: File[]) {
    clearError()
    clearCapMessage()
    for (const file of files) {
      if (isImageFile(file)) { await ingestFiles([file]); continue } // route images to the screenshot path
      if (attachedFiles.length >= MAX_FILES) { showError(`You can attach up to ${MAX_FILES} files.`); break }
      // KLA-591: role-aware over-cap decision. Do NOT silently drop — show the message + CTA and move on.
      const decision = evaluateFileCap(file, { capBytes: PER_FILE_MAX_BYTES, role: reporterRole, upgradeUrl })
      if (decision.overCap) {
        // KLA-612: attribute the (guest) upgrade request — what wall + which page + the file that hit it.
        showCapMessage(decision, {
          page: (typeof location !== 'undefined' ? location.href : '') || '',
          fileMeta: { name: file.name, sizeMb: Math.round((file.size / 1024 / 1024) * 10) / 10 },
        })
        continue
      }
      const total = attachedFiles.reduce((n, f) => n + f.size, 0)
      if (total + file.size > MAX_FILES_TOTAL_BYTES) { showError(`Attachments exceed the ${Math.round(MAX_FILES_TOTAL_BYTES / 1024 / 1024)} MB total limit.`); break }
      try {
        // Stamp a concrete video/* MIME when we accepted this file as a video by EXTENSION only (browser
        // reported an empty file.type). This makes the type travel through the data URL → multipart part so
        // the server's content-type-based 100MB video cap agrees with the client (KLA-560 item 6). Non-video
        // or already-typed files keep their reported type.
        const effectiveType = file.type || (isVideoFile(file) ? videoContentType(file.name) : '')
        const idx = attachedFiles.push({ name: file.name, type: effectiveType, size: file.size, dataUrl: await fileToDataUrl(file) }) - 1
        renderFiles()
        // KLA-591: a freshly-added video becomes the active hero (inline playable preview) + shows in the strip.
        if (attachmentKind(attachedFiles[idx]) === 'video') activeVideoIndex = idx
        updateStrip()
      } catch {
        showError(`Couldn't add "${file.name}". Please try a different file.`)
      }
    }
  }

  // ── KLAVITYKLA-438 / KLA-602(a): "Record me" recordings ─────────────────────────────────────────────
  // Recordings now live as removable video TILES in the unified gallery strip (see updateStrip) — NOT as text
  // chips behind a separate Preview→Attach modal. This keeps the wiring point (renderRecordings) that the
  // record handler + tile actions already call; it just repaints the strip and re-evaluates Submit (a
  // recording-only report is valid evidence).
  function renderRecordings() {
    if (_closed) return
    updateStrip()
    refreshSubmit()
  }

  let _stopVoice: (() => void) | null = null

  // opts.immediate — tear the host down synchronously (no genie-out animation) so the backdrop dim is
  // gone AT ONCE; used by the non-blocking background-upload submit so the page is never left dimmed
  // while the report uploads. opts.reason='submitted' is forwarded to onClose so the host can skip its
  // keep-evidence/restore-dock bookkeeping (the report was filed, not abandoned).
  function close(opts?: { immediate?: boolean; reason?: 'submitted' }) {
    // #468: idempotent — a second close() (e.g. the auto-dismiss timer firing after the user already hit X)
    // must never re-run teardown or re-fire onClose. onClose can tear down host session state, so a double
    // call could kill a reopened composer.
    if (_closed) return
    _closed = true
    _stopVoice?.()
    if (autodismissTimeout) {
      clearTimeout(autodismissTimeout)
      autodismissTimeout = null
    }
    document.removeEventListener('keydown', escHandler, { capture: true })
    document.removeEventListener('paste', onPaste)
    try { callbacks.onClose?.(opts?.reason) } catch { /* never let a listener error block the close */ }
    const m = shadowRoot.querySelector('.klavity-modal') as HTMLElement | null
    if (opts?.immediate || !m) { safeRemove(host); return }
    m.classList.add('kl-closing')
    const done = () => safeRemove(host)
    m.addEventListener('animationend', done, { once: true })
    setTimeout(done, 700) // safety if animationend doesn't fire
  }

  // Shared countdown-to-auto-close used by BOTH the post-submit confirmation card (#448, ~4s) and the
  // host-supplied success screen (~5s). Appends a draining progress line to `target`, closes after `ms`,
  // and pauses on hover/focus (resuming with only the remaining time). Idempotent — a second call is a
  // no-op while a countdown is already armed. The progress-bar CSS animates over its own duration, set
  // inline here so the visual bar always matches `ms`.
  function armAutodismiss(target: HTMLElement, ms: number) {
    if (autodismissTimeout || _closed) return // #468: never arm a countdown on an already-torn-down modal
    const progressBar = document.createElement('div')
    progressBar.className = 'klavity-toast-progress'
    progressBar.style.animationDuration = ms + 'ms'
    target.appendChild(progressBar)
    let remainingMs = ms
    let startedAt = Date.now()
    const arm = () => {
      startedAt = Date.now()
      autodismissTimeout = setTimeout(() => { close() }, remainingMs)
    }
    const pause = () => {
      if (!autodismissTimeout) return
      clearTimeout(autodismissTimeout)
      autodismissTimeout = null
      remainingMs = Math.max(0, remainingMs - (Date.now() - startedAt))
      progressBar.style.animationPlayState = 'paused'
    }
    const resume = () => {
      if (autodismissTimeout || target.classList.contains('kl-closing')) return
      progressBar.style.animationPlayState = 'running'
      arm()
    }
    target.addEventListener('mouseenter', pause)
    target.addEventListener('mouseleave', resume)
    // Keyboard users get the same affordance: focus inside pauses, leaving resumes.
    target.addEventListener('focusin', pause)
    target.addEventListener('focusout', (e: FocusEvent) => {
      if (!target.contains(e.relatedTarget as Node | null)) resume()
    })
    arm()
  }

  function escHandler(e: KeyboardEvent) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return }
    // S submits the report — but only when the user isn't typing and no fullscreen editor owns the keys.
    if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey && !e.altKey) {
      // Real keystrokes are composed:true, so at this document-level capture listener e.target is
      // RETARGETED to the shadow host — reading it would miss the field the user is typing in and
      // 's'/'S' would submit mid-word (eating the character). composedPath()[0] is the real focused
      // element across the shadow boundary (same guard the annotator key handlers below use).
      const el = ((typeof e.composedPath === 'function' && e.composedPath()[0]) || e.target) as HTMLElement | null
      // KLA-586: the description is now a contenteditable div (not a <textarea>). isContentEditable is the
      // right check in real browsers, but jsdom doesn't derive it from the attribute — so also accept an
      // explicit contenteditable attribute so 's'/'S' never submits mid-word while typing in the field.
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable || el.getAttribute?.('contenteditable') === 'true')) return
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

  // Toggle / issue-type chips
  // JTBD 1.10: the composer placeholder follows the mode ("Describe the feature you'd like…" reads wrong for
  // a bug and vice-versa). `desc` is declared just below; these handlers run post-mount.
  const applyModePlaceholder = () => {
    const el = modal.querySelector('#klavity-desc') as HTMLTextAreaElement | null
    if (!el) return
    el.placeholder = currentType === 'feature' ? "Describe the feature you'd like..."
      : currentType === 'bug' ? 'Describe the bug...'
      : 'Describe the issue...'   // PX4 #411: Task/Query get a neutral prompt
  }
  if (issueTypeOpts) {
    // PX4 #411: extended issue-type chips. Clicking one sets currentType (an IssueKind) + moves the active
    // state. The classic .bug/.feat buttons are NOT rendered in this mode, so we skip their wiring entirely.
    const chips = Array.from(modal.querySelectorAll('.kl-type-chip')) as HTMLButtonElement[]
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        currentType = (chip.getAttribute('data-kind') || 'bug') as IssueKind
        chips.forEach(c => { const on = c === chip; c.classList.toggle('active', on); c.setAttribute('aria-checked', on ? 'true' : 'false') })
        applyModePlaceholder()
      })
    })
  } else {
    const bugBtn = modal.querySelector('.bug') as HTMLButtonElement
    const featBtn = modal.querySelector('.feat') as HTMLButtonElement
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
  }

  // KLA submit-target: the reporter's destination choice. Defaults to the site's own project so we NEVER
  // surprise-route to Klavity; only an explicit tap on the "Klavity" segment flips it. Wired only when the
  // segmented control was rendered (cfg.submitTargetToggle !== false).
  let submitTarget: 'project' | 'klavity' = 'project'
  {
    const tgtSeg = modal.querySelector('#klavity-target') as HTMLElement | null
    if (tgtSeg) {
      const opts = Array.from(tgtSeg.querySelectorAll('.kl-tgt-opt')) as HTMLButtonElement[]
      for (const opt of opts) {
        opt.addEventListener('click', () => {
          const t = opt.dataset.target === 'klavity' ? 'klavity' : 'project'
          submitTarget = t
          for (const o of opts) {
            const on = o === opt
            o.classList.toggle('on', on)
            o.setAttribute('aria-checked', on ? 'true' : 'false')
          }
        })
      }
    }
  }

  // Submit
  // KLA-586: the description is a contenteditable WhatsApp-Markdown field (see renderInlineMarkdown). To keep
  // EVERY existing call site untouched (submit payload, clarity coach, known-check, dictation insert, prefill,
  // the char/length reads, the submit-lock disable), we expose textarea-shaped accessors on the element:
  //   .value       raw Markdown text (get = descPlainText; set = render markers live)
  //   .disabled    contentEditable toggle + a dimmed class (used by lockComposer during submit)
  //   .placeholder the empty-state prompt (backed by the data-ph attribute + :empty:before)
  // so `desc` behaves like the old <textarea> to all consumers while rendering formatting inline.
  const desc = modal.querySelector('#klavity-desc') as HTMLElement & { value: string; disabled: boolean; placeholder: string }
  {
    const selection = (): Selection | null => {
      try { return (shadowRoot as any).getSelection ? (shadowRoot as any).getSelection() : (typeof window !== 'undefined' ? window.getSelection() : null) }
      catch { try { return typeof window !== 'undefined' ? window.getSelection() : null } catch { return null } }
    }
    // caret <-> character offset (counts text + newlines), so a live re-render preserves the caret.
    const caretOffset = (): number => {
      const sel = selection(); if (!sel || !sel.rangeCount) return -1
      try {
        const r = sel.getRangeAt(0)
        if (!desc.contains(r.endContainer)) return -1
        const pre = r.cloneRange(); pre.selectNodeContents(desc); pre.setEnd(r.endContainer, r.endOffset)
        return pre.toString().length
      } catch { return -1 }
    }
    const setCaret = (off: number): void => {
      const sel = selection(); if (!sel) return
      try {
        const range = document.createRange()
        const walk = document.createTreeWalker(desc, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
        let n: Node | null, chars = off, done = false
        while ((n = walk.nextNode())) {
          if (n.nodeName === 'BR') { if (chars === 0) { range.setStartBefore(n); done = true; break } chars -= 1; continue }
          if (n.nodeType === 3) { const len = (n.textContent || '').length; if (chars <= len) { range.setStart(n, chars); done = true; break } chars -= len }
        }
        if (!done) { range.selectNodeContents(desc); range.collapse(false) } else range.collapse(true)
        sel.removeAllRanges(); sel.addRange(range)
      } catch { /* selection APIs vary (jsdom) — caret restore is best-effort */ }
    }
    // Live render on user input: keep raw MD text as the source, repaint with markers dimmed, restore caret.
    const renderLive = (): void => {
      const off = caretOffset()
      const text = descPlainText(desc).replace(/\n$/, '')  // drop the browser's trailing bookkeeping newline
      // Empty → clear so :empty (placeholder) holds; otherwise repaint the formatted markup.
      desc.innerHTML = text ? renderInlineMarkdown(text) : ''
      if (off >= 0) setCaret(off)
    }
    // Attach FIRST so the DOM is normalised to our controlled markup before refreshSubmit/clarity/known read it.
    desc.addEventListener('input', renderLive)
    Object.defineProperty(desc, 'value', {
      configurable: true,
      get(): string { return descPlainText(desc) },
      set(v: string) { const t = String(v ?? '').replace(/\n$/, ''); desc.innerHTML = t ? renderInlineMarkdown(t) : '' },
    })
    Object.defineProperty(desc, 'disabled', {
      configurable: true,
      get(): boolean { return desc.getAttribute('contenteditable') === 'false' },
      set(on: boolean) { desc.setAttribute('contenteditable', on ? 'false' : 'true'); desc.classList.toggle('kl-desc-disabled', !!on) },
    })
    Object.defineProperty(desc, 'placeholder', {
      configurable: true,
      get(): string { return desc.getAttribute('data-ph') || '' },
      set(v: string) { desc.setAttribute('data-ph', String(v ?? '')) },
    })
  }
  const submitBtn = modal.querySelector('#klavity-submit') as HTMLButtonElement
  const remail = modal.querySelector('#klavity-remail') as HTMLInputElement | null
  // PX4 #439: pre-fill the required-email field when the reporter identity is already known (no retyping).
  if (remail && callbacks.prefillEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(callbacks.prefillEmail)) remail.value = callbacks.prefillEmail
  const descHint = modal.querySelector('#klavity-desc-hint') as HTMLElement | null
  // Submit is enabled only when there's a description AND (if a required email field is shown) a valid email.
  const emailValid = () => !callbacks.requireEmail || (!!remail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(remail.value.trim()))
  // JTBD 1.10: a screenshot (or an attached replay buffer) is evidence in its own right — Submit no longer
  // requires typed prose. The server accepts an evidence-only report and the AI drafts the title post-intake.
  const hasEvidence = () => screenshots.length > 0 || replayAttached || attachedFiles.length > 0 || recordings.length > 0
  // #529: auto-grow the description so a prefilled or long (>4 line) report shows in full without the
  // reporter dragging the resize handle. Reset to 'auto' first so the box can also shrink, then grow to
  // fit content, capped at 40vh (keeps the modal usable on short viewports). resize:vertical stays as a
  // manual override.
  // #529 refinement (Codex review): autosize is wired to the DESCRIPTION textarea's own 'input' listener
  // only — NOT to the shared refreshSubmit. refreshSubmit also fires from the reporter-email input, and
  // re-running autosize there would stomp a description the reporter had manually resized. Autosize now
  // fires solely on description/content changes. The prefill path (widget.ts) reuses this single source of
  // truth by dispatching an 'input' event on the textarea rather than duplicating the layout math.
  // KLA-586: the description now GROWS via flex:1 to fill the freed vertical space in the side panel (founder
  // ask), and the contenteditable expands with its own content up to that flex height (then scrolls
  // internally). So the old explicit-height autosize is a no-op — setting an inline height would fight flex:1
  // and reintroduce the empty gap. Kept as a named no-op so the prefill path (widget.ts dispatches an 'input'
  // event) still funnels through refreshSubmit + the live Markdown render without duplicating layout math.
  const autosizeDesc = () => { /* intentionally empty — flex:1 owns the sizing now */ }
  const refreshSubmit = () => {
    const noDesc = desc.value.trim() === ''
    submitBtn.disabled = (noDesc && !hasEvidence()) || !emailValid()
    // Hint appears only when evidence is present but nothing has been typed ("we'll title it from your shot").
    if (descHint) descHint.hidden = !(noDesc && hasEvidence())
  }
  // Autosize only on description changes; refreshSubmit runs for both fields but never resizes the box.
  desc.addEventListener('input', autosizeDesc)
  desc.addEventListener('input', refreshSubmit)
  remail?.addEventListener('input', refreshSubmit)

  // ── KLA-586: AI "Enhance" — replace the reporter's one-liner IN PLACE with a structured, developer-ready
  // draft rendered as WhatsApp Markdown, from the auto-captured screenshot + picked element. Opt-in: wired
  // only when the host supplied onEnhance (widget path; the extension omits it, like onClarityTip). Undo
  // restores the reporter's pre-enhance text; Regenerate re-drafts. Stale-guarded (seq) like the clarity tip;
  // a null/failed draft is a silent no-op (the reporter's text is left untouched — no scary error).
  if (callbacks.onEnhance) {
    const onEnhance = callbacks.onEnhance
    const enhanceBtn = modal.querySelector('#klavity-enhance') as HTMLButtonElement | null
    const undoBtn = modal.querySelector('#klavity-enhance-undo') as HTMLButtonElement | null
    const regenBtn = modal.querySelector('#klavity-enhance-regen') as HTMLButtonElement | null
    const spinEl = modal.querySelector('#klavity-enhance-spin') as HTMLElement | null
    let enhanceSeq = 0            // stale-guard: a slow response is ignored once a newer run started
    // KLA-586: the Undo restore point. Captured as the field's CURRENT text immediately before EACH
    // enhance/regenerate — NOT once before the first enhance. Capturing once discarded any edits the
    // reporter made to an enhanced draft before enhancing again (Undo rolled all the way back to the
    // pre-first-enhance text). Snapshotting each run means Undo restores exactly what was there just
    // before the most recent enhance, so edit→re-enhance→Undo returns the edited draft.
    let originalText: string | null = null
    // The primary screenshot for grounding: the active hero shot, else the first captured shot.
    const primaryShot = (): string => screenshots[activeIndex] || screenshots[0] || ''
    const runEnhance = async () => {
      if (busy) return
      const text = desc.value.trim()
      originalText = desc.value   // snapshot the restore point (current field text) before THIS enhance
      const seq = ++enhanceSeq
      if (enhanceBtn) enhanceBtn.disabled = true
      if (spinEl) spinEl.hidden = false
      try {
        const picked = pickedTarget ? { selector: pickedTarget.selector, text: pickedTarget.text } : null
        const draft = await onEnhance(text, { images: screenshots.length, shot: primaryShot(), picked })
        if (seq !== enhanceSeq) return         // a newer Enhance/Regenerate superseded this response
        if (!draft) return                     // null → silent no-op, leave the reporter's text as-is
        desc.value = renderDraftToWhatsApp(draft)   // .value setter renders the Markdown live in place
        // #730: a programmatic .value write does NOT fire 'input', so the clarity meter/pills/score,
        // auto-grow and submit-enable (all bound to 'input') would stay stale until the user typed.
        // Dispatch a synthetic input event so every input-bound handler recomputes immediately.
        desc.dispatchEvent(new Event('input', { bubbles: true }))
        enhanceSeverity = draft.suggestedSeverity || null
        enhancePriority = draft.suggestedPriority || null
        desc.classList.add('kl-just-enhanced')
        setTimeout(() => desc.classList.remove('kl-just-enhanced'), 700)
        if (undoBtn) undoBtn.hidden = false
        if (regenBtn) regenBtn.hidden = false
        refreshSubmit()
      } catch { /* best-effort — a failure never disturbs the composer */ }
      finally {
        if (seq === enhanceSeq) { if (enhanceBtn) enhanceBtn.disabled = false; if (spinEl) spinEl.hidden = true }
      }
    }
    enhanceBtn?.addEventListener('click', () => { void runEnhance() })
    regenBtn?.addEventListener('click', () => { void runEnhance() })
    undoBtn?.addEventListener('click', () => {
      // #730: restore the pre-enhance text, then fire a synthetic input event so the clarity
      // meter/pills/score, auto-grow and submit-enable recompute immediately (a .value write alone
      // never fires 'input'). Without this the pills stayed stuck until the user typed a space.
      if (originalText !== null) { desc.value = originalText; desc.dispatchEvent(new Event('input', { bubbles: true })); refreshSubmit() }
      originalText = null                 // next enhance re-captures the (restored) text as the new baseline
      enhanceSeverity = null; enhancePriority = null
      if (undoBtn) undoBtn.hidden = true
      if (regenBtn) regenBtn.hidden = true
    })
  }

  // KLAVITYKLA-241 (JTBD A.11): pre-submit known-issue acknowledgment. As the reporter types, debounce a
  // lookup for a matching known/recurring issue and, on a hit, surface an inline "Already reported —
  // status: X" note above Submit. Non-blocking: the user can still submit (their report links to / bumps
  // the known issue) or dismiss the note. Only wired when the host supplied onCheckKnown (widget/host
  // path; the extension omits it, preserving parity). A lookup failure never blocks the composer.
  if (callbacks.onCheckKnown) {
    const knownEl = modal.querySelector('#klavity-known') as HTMLElement | null
    const onCheckKnown = callbacks.onCheckKnown
    let knownTimer: ReturnType<typeof setTimeout> | null = null
    let knownSeq = 0            // guards against out-of-order async responses
    let dismissedText = ''      // text the user dismissed the note for — don't re-nag identical text
    const hideKnown = () => { if (knownEl) { knownEl.hidden = true; knownEl.textContent = '' } }
    const renderKnown = (m: KnownIssueMatch) => {
      if (!knownEl) return
      const lead = m.headline ? escHtml(m.headline) : 'Already reported'
      knownEl.innerHTML =
        `<span class="kl-known-ic">${icon('check-circle', { size: 15 })}</span>` +
        `<div class="kl-known-body"><span class="kl-known-title">${lead}</span> — status: ` +
        `<span class="kl-known-status">${escHtml(m.statusLabel)}</span>. ` +
        `We're already tracking "${escHtml(m.title)}". Add your note and submit anyway — it'll be linked.</div>` +
        `<button type="button" class="kl-known-dismiss" id="klavity-known-dismiss">Dismiss</button>`
      knownEl.hidden = false
      knownEl.querySelector('#klavity-known-dismiss')?.addEventListener('click', () => {
        dismissedText = desc.value.trim()
        hideKnown()
      })
    }
    const runKnownCheck = async () => {
      const text = desc.value.trim()
      if (text.length < 12 || text === dismissedText) { hideKnown(); return }
      const seq = ++knownSeq
      try {
        const match = await onCheckKnown(text)
        if (seq !== knownSeq) return                       // a newer keystroke superseded this response
        if (desc.value.trim() === dismissedText) { hideKnown(); return }
        if (match) renderKnown(match); else hideKnown()
      } catch { /* best-effort — a lookup failure never blocks the composer */ }
    }
    desc.addEventListener('input', () => {
      if (desc.value.trim() !== dismissedText) dismissedText = ''  // content changed → allow a fresh nudge
      if (knownTimer) clearTimeout(knownTimer)
      knownTimer = setTimeout(runKnownCheck, 500)
    })
  }

  // ── Report-clarity helper (the "password strength, for bug reports"). Three layers, all non-blocking:
  //   1. Instant heuristic (scoreReportClarity, zero-cost, no network) → meter + coverage chips + label on
  //      every keystroke.
  //   2. Debounced cheap-LLM tip (~1s after typing stops, only when non-trivial AND not yet Great) via
  //      callbacks.onClarityTip. Cached in the host; hidden once clarity is Great.
  //   3. A soft pre-submit nudge (see the Submit handler) — surfaced but never a hard block.
  // Only wired when the host enabled cfg.reportClarity (per-project, DEFAULT on). Absent → helper never
  // renders and this whole block is skipped (full back-compat with the classic composer).
  let clarityAckd = false                 // set true by "Submit anyway" so the second Submit proceeds
  let showClarityNudge: () => void = () => {}
  if (cfg.reportClarity) {
    const clarityEl = modal.querySelector('#klavity-clarity') as HTMLElement | null
    const statusEl = modal.querySelector('#klavity-clarity-status') as HTMLElement | null
    const chipEls: Record<'problem' | 'expected' | 'repro', HTMLElement | null> = {
      problem: modal.querySelector('#klavity-clarity-problem'),
      expected: modal.querySelector('#klavity-clarity-expected'),
      repro: modal.querySelector('#klavity-clarity-repro'),
    }
    const tipEl = modal.querySelector('#klavity-clarity-tip') as HTMLElement | null
    const tipTextEl = modal.querySelector('#klavity-clarity-tip-text') as HTMLElement | null
    const nudgeEl = modal.querySelector('#klavity-nudge') as HTMLElement | null
    const onClarityTip = callbacks.onClarityTip
    // Host-independent cache: one AI call per distinct trimmed text. Keeps it to a single call per
    // meaningful change even as the debounce refires on trailing keystrokes.
    const tipCache = new Map<string, string>()
    let tipTimer: ReturnType<typeof setTimeout> | null = null
    let tipSeq = 0

    const setChip = (el: HTMLElement | null, done: boolean, label: string) => {
      if (!el) return
      el.classList.toggle('done', done)
      const mark = el.querySelector('.kl-clr-mark')
      if (mark) mark.innerHTML = done ? icon('check', { size: 12 }) : '○'   // check icon vs empty circle
      el.setAttribute('aria-label', (done ? 'covered: ' : 'missing: ') + label)
    }
    const hideTip = () => { if (tipEl) tipEl.hidden = true }
    const renderTip = (tip: string) => {
      if (!tipEl || !tipTextEl) return
      // KLAVITYKLA-492: the widget already captures the page URL / screenshots / browser+UA / screen size
      // on every report — a coach tip that ASKS the reporter for any of them is wasted time. The server
      // prompt forbids it, but this client-side backstop guarantees a drifting tip is suppressed.
      if (suppressesAutoCapturedAsk(tip)) return
      tipTextEl.innerHTML = escHtml(tip) + '<span class="kl-clr-aitag">AI</span>'
      tipEl.hidden = false
    }
    // Paint the instant heuristic meter + chips + label. Synchronous — runs on every keystroke.
    const renderHeuristic = () => {
      const text = desc.value
      const s = scoreReportClarity(text)
      if (clarityEl) {
        clarityEl.hidden = text.trim().length === 0
        clarityEl.classList.remove('l1', 'l2', 'l3')
        clarityEl.classList.add(s.level === 'great' ? 'l3' : s.level === 'good' ? 'l2' : 'l1')
      }
      if (statusEl) statusEl.textContent = s.label
      setChip(chipEls.problem, s.coverage.problem, "What's broken")
      setChip(chipEls.expected, s.coverage.expected, 'What you expected')
      setChip(chipEls.repro, s.coverage.repro, 'How to reproduce')
      // The helper only nudges on Submit; typing dismisses any shown nudge so it never lingers stale.
      if (nudgeEl && !nudgeEl.hidden) nudgeEl.hidden = true
      // Great → the helper gets out of the way (hide any tip). Otherwise keep the last cached tip visible.
      if (s.level === 'great') hideTip()
    }
    // Debounced cheap-LLM tip. Cache-first; only fires when non-trivial AND not yet Great AND wired.
    const scheduleTip = () => {
      if (!onClarityTip || !tipEl) return
      if (tipTimer) clearTimeout(tipTimer)
      tipTimer = setTimeout(async () => {
        const text = desc.value.trim()
        if (!shouldFetchClarityTip(text)) { hideTip(); return }
        if (tipCache.has(text)) { renderTip(tipCache.get(text)!); return }
        const seq = ++tipSeq
        try {
          // KLAVITYKLA-492: forward the already-captured screenshot count so the server can tell the coach
          // not to ask for a screenshot when one is attached. pageUrl + browser/screen are added host-side.
          const res = await onClarityTip(text, { images: screenshots.length })
          if (seq !== tipSeq) return                    // a newer keystroke superseded this response
          if (desc.value.trim() !== text) return         // text moved on while we waited
          if (res && res.tip) { tipCache.set(text, res.tip); renderTip(res.tip) }
        } catch { /* best-effort — a tip failure never blocks the composer */ }
      }, 1000)
    }
    desc.addEventListener('input', () => { renderHeuristic(); scheduleTip() })
    renderHeuristic()   // seed from any pre-filled text

    // Soft pre-submit nudge (mockup panel D). Shown by the Submit handler when the report is still weak.
    // "Add detail" refocuses the description; "Submit anyway" acks + re-fires Submit so it proceeds.
    showClarityNudge = () => {
      if (!nudgeEl) return
      nudgeEl.hidden = false
      try { nudgeEl.scrollIntoView({ block: 'nearest' }) } catch { /* jsdom / older browsers */ }
    }
    modal.querySelector('#klavity-nudge-add')?.addEventListener('click', () => {
      if (nudgeEl) nudgeEl.hidden = true
      try { desc.focus() } catch { /* noop */ }
    })
    modal.querySelector('#klavity-nudge-anyway')?.addEventListener('click', () => {
      clarityAckd = true
      if (nudgeEl) nudgeEl.hidden = true
      submitBtn.click()   // re-fire Submit — clarityAckd now lets it through (never a hard block)
    })
  }

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })
  modal.querySelector('#klavity-x')?.addEventListener('click', () => close())
  // KLA-412: minimize hands off to the host, which persists the evidence session, closes this composer,
  // and shows the dock. Never let a listener error leave the button dead.
  modal.querySelector('#klavity-min')?.addEventListener('click', () => {
    try { callbacks.onMinimize?.() } catch { /* host handles teardown */ }
  })

  // Re-entrancy guard (Dev 6 audit #3): block double-click / cross-firing while a capture OR submit is in
  // flight. `lockComposer(true)` disables every capture button (Sharp/Full Page/Upload/Region) and Submit;
  // releasing restores Submit to its validity state. Each action also early-returns when `busy` so a
  // queued double-click can't slip through before the disabled attribute paints.
  const captureBtnEls = () => Array.from(modal.querySelectorAll('.klavity-actions button:not(#klavity-voice)')) as HTMLButtonElement[]
  let busy = false
  const lockComposer = (on: boolean) => {
    busy = on
    captureBtnEls().forEach(b => { b.disabled = on })
    // #448: freeze the remaining editable surfaces too — description, voice, and every annotation tool —
    // so once a submit is in flight (and after it succeeds) NOTHING in the composer stays editable. The
    // capture row (incl. Attach) is already covered by captureBtnEls above; voice is excluded there, so
    // stop any live recording and disable it explicitly.
    desc.disabled = on
    const voiceEl = modal.querySelector('#klavity-voice') as HTMLButtonElement | null
    if (voiceEl) voiceEl.disabled = on
    modal.querySelectorAll<HTMLButtonElement>('.kl-htool,.kl-htbtn,.kl-hopt,.kl-hcolor').forEach(el => { el.disabled = on })
    // #467: also freeze the remaining PAYLOAD MUTATORS while a submit is in flight (belt-and-suspenders
    // alongside the submit-start snapshot) — Title, reporter email, issue-type buttons, the mask toggle,
    // attachment removes, and thumbnail Remove/Markup/Retake — so nothing that shapes the report stays live.
    shadowRoot.querySelectorAll<HTMLButtonElement | HTMLInputElement>('#klavity-title,#klavity-remail,.kl-type-chip,.klavity-toggle button,#klavity-mask-numbers,.kl-file-rm,.klavity-rm,.klavity-mk,.klavity-retake').forEach(el => { el.disabled = on })
    if (on) { _stopVoice?.(); submitBtn.disabled = true }
    else { refreshSubmit(); updateSharpSuggestion() } // KLAVITYKLA-473: re-show the callout after a capture unlocks
  }
  // KLA-21: active-source indicator — moves .kl-active + aria-pressed to the chosen capture button
  // so the user can see which source is currently selected. Call on every successful capture/ingest.
  const setActiveCapture = (btn: HTMLButtonElement | null) => {
    captureBtnEls().forEach(b => { b.classList.remove('kl-active'); b.removeAttribute('aria-pressed') })
    if (btn) { btn.classList.add('kl-active'); btn.setAttribute('aria-pressed', 'true') }
  }

  const voiceBtn = modal.querySelector('#klavity-voice') as HTMLButtonElement | null
  if (voiceBtn) {
    const CIRCUMFERENCE = 81.68
    const WARN_THRESHOLD_MS = 15000
    const ringProg = voiceBtn.querySelector('.kl-vring-prog') as SVGCircleElement | null
    let rafId = 0, startTime = 0, voiceRecording = false

    // KLA-505: the Voice button drives a dictation ENGINE — either the server STT endpoint (LiveDictation,
    // preferred) or the Web Speech backend (VoiceInput). Both expose the same callback shape; `voice` is
    // mutable so a LiveDictation onUnavailable can transparently swap in Web Speech mid-session.
    interface DictationEngine { start(): void | Promise<void>; stop(): void; onTranscript: (t: string) => void; onStatus: (type: 'retrying' | 'idle', m: string) => void; onError: (type: string, m: string) => void; onStop: () => void; onUnavailable?: () => void; onInterim?: (t: string) => void }
    let voice: DictationEngine
    // #647 STREAMING: the durable text captured at session start; finals append to it, interims render as a
    // transient preview past it (a textarea can't style substrings, so the live partial is a plain preview
    // that is replaced on each interim and dropped if it never finalizes).
    let streamBase = ''

    const startRing = () => {
      startTime = Date.now()
      const tick = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / 180000, 1)
        ringProg?.setAttribute('stroke-dashoffset', String(progress * CIRCUMFERENCE))
        if (elapsed >= 180000 - WARN_THRESHOLD_MS) voiceBtn.classList.add('kl-voice-warn')
        if (elapsed >= 180000) {
          voice.stop()  // belt-and-suspenders: the engine's own timer also fires at 180s
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

    // KLAVITYKLA-495: the voice status/error now lives in a dedicated row (#klavity-voice-status) that sits
    // above the Report-clarity bar, so it never paints over the clarity meter. Helpers below drive it.
    const voiceStatusEl = modal.querySelector('#klavity-voice-status') as HTMLElement | null
    let voiceStatusHideTimer: ReturnType<typeof setTimeout> | null = null
    const clearVoiceStatus = () => {
      if (voiceStatusHideTimer) { clearTimeout(voiceStatusHideTimer); voiceStatusHideTimer = null }
      if (!voiceStatusEl) return
      voiceStatusEl.hidden = true
      voiceStatusEl.textContent = ''
      voiceStatusEl.classList.remove('kl-vs-info', 'kl-vs-err')
    }
    const setVoiceStatus = (kind: 'info' | 'err', message: string, autoHideMs?: number) => {
      if (!voiceStatusEl || !message) return
      if (voiceStatusHideTimer) { clearTimeout(voiceStatusHideTimer); voiceStatusHideTimer = null }
      voiceStatusEl.classList.remove('kl-vs-info', 'kl-vs-err')
      voiceStatusEl.classList.add(kind === 'err' ? 'kl-vs-err' : 'kl-vs-info')
      voiceStatusEl.textContent = message
      voiceStatusEl.hidden = false
      if (autoHideMs) voiceStatusHideTimer = setTimeout(clearVoiceStatus, autoHideMs)
    }
    // KLA-613: the recording affordance is the CONTROL ITSELF — a red, glowing/pulsing circle with a stop-square
    // glyph, co-located where the user clicked. We deliberately do NOT paint a steady "Recording — tap to stop"
    // TEXT row below the description anymore (that separated the action from its feedback and read as a cognitive
    // disconnect). The status row (#klavity-voice-status) is now reserved for TRANSIENT signals only — a soft
    // reconnect note or a real error — never the steady recording state. The button carries the tooltip + a
    // proper aria-label/aria-pressed so assistive tech still announces the live toggle.
    const RECORDING_TITLE = 'Recording — tap to stop'
    // On stop, clear any INFO-level voice status (a soft reconnect note) but leave a real ERROR row up for its
    // own auto-hide window so the user still sees why it failed.
    const clearInfoStatus = () => { if (voiceStatusEl && voiceStatusEl.classList.contains('kl-vs-info')) clearVoiceStatus() }
    const setVoiceBtnMode = (recording: boolean) => {
      voiceBtn.classList.toggle('kl-voice-rec', recording)
      voiceBtn.setAttribute('aria-pressed', recording ? 'true' : 'false')
      voiceBtn.setAttribute('aria-label', recording ? 'Stop recording' : 'Voice dictation')
      voiceBtn.title = recording ? RECORDING_TITLE : 'Voice dictation'
    }

    // Shared engine handlers — assigned to whichever engine is active so a fallback swap is seamless.
    const wire = (engine: DictationEngine) => {
      engine.onTranscript = (text) => {
        const existing = desc.value
        desc.value = existing + (existing.length > 0 && !/\s$/.test(existing) ? ' ' : '') + text
        refreshSubmit()
      }
      // Non-alarming reconnect status while an engine auto-retries a transient drop. When it recovers ('idle')
      // we just clear the transient note — the control's own red glow already signals we're still live (KLA-613).
      engine.onStatus = (type, message) => {
        if (type === 'idle') clearInfoStatus()
        else setVoiceStatus('info', message)
      }
      engine.onError = (_, message) => {
        if (!message) return
        setVoiceStatus('err', message, 4000)
      }
      engine.onStop = () => {
        voiceRecording = false
        setVoiceBtnMode(false)
        stopRing()
        clearInfoStatus()
      }
    }

    // Build the Web Speech engine (fallback / primary when no server endpoint).
    const makeWebSpeech = (): DictationEngine => { const v = new VoiceInput(); wire(v); return v }

    // Drop to Web Speech (or a terminal error) — shared by both server engines' onUnavailable.
    const fallbackToWebSpeech = () => {
      // The user may have pressed Stop before the server came back unavailable — don't resurrect it.
      if (!voiceRecording) { setVoiceBtnMode(false); stopRing(); clearInfoStatus(); return }
      if (VoiceInput.isSupported()) {
        voice = makeWebSpeech()
        setVoiceStatus('info', 'Reconnecting dictation…')
        void voice.start()
      } else {
        voiceRecording = false; setVoiceBtnMode(false); stopRing()
        setVoiceStatus('err', 'Voice dictation is unavailable right now', 4000)
      }
    }

    // Build the 5s-BATCH server engine (LiveDictation → onDictate). Falls back to Web Speech if unreachable.
    const makeBatchServer = (): DictationEngine | null => {
      if (!(voiceMode === 'server' && callbacks.onDictate)) return null
      const d = new LiveDictation({ transcribe: (blob: Blob) => callbacks.onDictate!(blob) })
      wire(d)
      d.onUnavailable = fallbackToWebSpeech
      return d
    }

    // #647: wire the STREAMING engine — finals commit into the description, interims render as a live
    // preview (replaced each interim, dropped on stop). onUnavailable cascades to batch, then Web Speech.
    const wireStreaming = (s: StreamingDictation) => {
      const sep = () => (streamBase.length > 0 && !/\s$/.test(streamBase) ? ' ' : '')
      s.onTranscript = (text) => { streamBase = streamBase + sep() + text; desc.value = streamBase; refreshSubmit() }
      s.onInterim = (text) => { desc.value = streamBase + sep() + text; refreshSubmit() }
      s.onStatus = (type, message) => { if (type === 'idle') clearInfoStatus(); else setVoiceStatus('info', message) }
      s.onError = (_, message) => { if (message) setVoiceStatus('err', message, 4000) }
      s.onStop = () => {
        desc.value = streamBase // drop any uncommitted interim preview
        voiceRecording = false; setVoiceBtnMode(false); stopRing(); clearInfoStatus(); refreshSubmit()
      }
      s.onUnavailable = () => {
        desc.value = streamBase // clear the interim preview before another engine takes over
        if (!voiceRecording) { setVoiceBtnMode(false); stopRing(); clearInfoStatus(); return }
        const batch = makeBatchServer()
        if (batch) { voice = batch; setVoiceStatus('info', 'Reconnecting dictation…'); void voice.start(); return }
        fallbackToWebSpeech()
      }
    }

    // Build the active engine for this session. Preference: STREAMING (real-time) → BATCH → Web Speech.
    // Each degrades transparently to the next WITHOUT interrupting the ring or asking the user to re-click.
    const makeEngine = (): DictationEngine => {
      if (voiceMode === 'server' && callbacks.dictationStreamUrl && StreamingDictation.isSupported()) {
        const s = new StreamingDictation({ url: callbacks.dictationStreamUrl })
        wireStreaming(s)
        return s
      }
      return makeBatchServer() ?? makeWebSpeech()
    }

    voice = makeEngine()

    voiceBtn.addEventListener('click', () => {
      if (!voiceRecording) {
        clearVoiceStatus() // fresh start — drop any leftover error/reconnect line
        streamBase = desc.value // #647: capture the durable text streaming finals/interims build on
        voice = makeEngine() // fresh engine per session (a prior fallback may have swapped it)
        voiceRecording = true
        setVoiceBtnMode(true) // instant, obvious feedback AT the control: red glow + stop-square glyph (KLA-613)
        void voice.start(); startRing()
      } else {
        voice.stop()
      }
    })

    _stopVoice = () => { if (voiceRecording) voice.stop() }
  }

  submitBtn.addEventListener('click', async () => {
    if (busy || submitBtn.disabled) return // re-entrancy: ignore double-clicks / clicks while a capture runs
    // KLAVITYKLA-497: Submit is NEVER blocked by report clarity. The old gate here surfaced the pre-submit
    // nudge and RETURNED — forcing a SECOND click on "Submit anyway". That two-step WAS the block users hit.
    // A weak / vague / empty description now submits on the FIRST click, always. The passive inline warning
    // is the clarity meter + coverage chips shown live under the description as the reporter types; there is
    // no interception, no confirm gate, and Submit is never disabled by clarity. (preSubmitNudge config is
    // retained for back-compat but no longer gates submission.)
    const description = desc.value.trim()
    // PX4 #411/#425: gather the optional Title + precise kind + non-image files. Each is only included in the
    // payload when the host enabled the corresponding affordance, so a caller passing no new opts sends the
    // exact same payload shape as before (full back-compat).
    const titleInput = modal.querySelector('#klavity-title') as HTMLInputElement | null
    const title = titleInput ? titleInput.value.trim() : ''
    const coarseType: ReportType = currentType === 'feature' ? 'feature' : 'bug'
    // #467: SNAPSHOT every payload-shaping array + field at submit-START, before the async compression await.
    // Post-submit, some mutators (thumbnail Remove/Markup, Title, email, issue-type, mask, attachments) can
    // still fire; removing a shot mid-compression would splice the live arrays and misalign the annotation
    // map against the (already-captured) screenshot list. Building the payload from these frozen snapshots
    // makes post-submit mutation harmless — the report reflects exactly the state at the moment of Submit.
    const compressedSnapshot = screenshotCompressed.slice()
    const annotationsSnapshot = buildAnnotationsPayload()
    const filesSnapshot = attachedFiles.slice()
    const recordingsSnapshot = recordings.slice()
    const kindSnapshot: IssueKind = currentType
    const emailSnapshot = remail?.value.trim() || undefined
    lockComposer(true) // disable Submit + every capture button + the payload mutators for the upload duration
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
      // #467: resolve the SNAPSHOT (taken at submit-start), never the live array — so a shot removed while
      // compression is in flight can't change what's submitted or misalign the annotation map.
      const finalScreenshots = await Promise.all(compressedSnapshot)
      const submitPayload = {
        type: coarseType,
        ...(issueTypeOpts ? { kind: kindSnapshot } : {}),
        ...(title ? { title } : {}),
        description,
        screenshots: finalScreenshots,
        ...(filesSnapshot.length ? { files: filesSnapshot } : {}),
        ...(recordingsSnapshot.length ? { recordings: recordingsSnapshot } : {}),
        annotations: annotationsSnapshot,
        reporterEmail: emailSnapshot,
        // KLA submit-target: ride the reporter's destination choice through onSubmit. Only present when the
        // segmented control was rendered (cfg.submitTargetToggle !== false); default 'project' (never surprise-
        // route to Klavity). The server resolves the real Klavity intake project — the client only says 'klavity'.
        ...(cfg.submitTargetToggle !== false ? { feedbackTarget: submitTarget } : {}),
        // KLA-586: ride the accepted AI-Enhance draft's severity/priority as structured fields (cleared on Undo).
        ...(enhanceSeverity ? { suggestedSeverity: enhanceSeverity } : {}),
        ...(enhancePriority ? { suggestedPriority: enhancePriority } : {}),
        // #638: only when the toggle was rendered — the reporter's console-logs opt-in (DEFAULT false). Read
        // live from the checkbox so the current state travels; the host attaches console logs only when true.
        ...(callbacks.consoleAttachToggle ? { attachConsole: !!(shadowRoot.getElementById('klavity-conlog-cb') as HTMLInputElement | null)?.checked } : {}),
      }
      // NON-BLOCKING default path — hand the fully-built payload to the host (widget) and CLOSE the modal
      // + backdrop immediately. The host shows a bottom-right pill and drives the (possibly 16MB+) upload
      // in the background, so the user's view is unblocked at once. We do NOT await onSubmit here and the
      // modal renders NO terminal card — the pill owns success/failure/retry. onSubmit must not reject in
      // this mode (it surfaces errors in the pill). See ModalCallbacks.backgroundUpload.
      if (callbacks.backgroundUpload) {
        void callbacks.onSubmit(submitPayload)
        close({ immediate: true, reason: 'submitted' })
        return
      }
      const result = await callbacks.onSubmit(submitPayload)
      // #468: the user may have closed the modal (Esc / X / backdrop) while onSubmit was in flight. If it's
      // already torn down, do NOT render a confirmation or arm a timer on the detached modal — that would
      // call close()+onClose a second time and could tear down a freshly-reopened session.
      if (_closed) return
      finishProgress()
      if (callbacks.success) {
        // Mode-aware lead/CTA screen rendered THROUGH the existing themed modal. It self-arms the shared
        // countdown auto-close (armAutodismiss) once there's nothing left for the user to do; when a lead
        // form / CTA is shown it waits for the interaction first (unchanged). This interactive success
        // screen is intentionally kept blocking (the user must engage) even under the pill era.
        renderSuccess(result.issueKey, result.issueUrl, callbacks.success)
      } else {
        // Legacy in-modal terminal confirmation (#448). Retained for callers that opt OUT of the
        // background pill (backgroundUpload absent) — today that's the extension via the shared modal;
        // giving it the pill is a follow-up. Swaps the frozen composer body for a "Report sent" card
        // (check + headline + line + quotable ref + Open-in-Klavity link) with a countdown auto-close
        // after SUBMIT_AUTOCLOSE_MS. cfg.thankYou (host custom copy) rides in as the body line.
        renderSentConfirmation(result.issueKey, result.issueUrl)
      }
    } catch (err) {
      // Upload failed — surface the error and re-open the composer (never leave it stuck/disabled).
      // KLA-496 (declutter): the raw error message is DEVELOPER text (hosts throw things like
      // "submit failed: 500", "Klavity backend error 502: <server response body>") and must not be
      // printed to the END USER. Show one friendly, actionable line instead; the raw message still goes
      // to console.error for support/telemetry, and appears in the error line itself only when the host
      // opted into debug mode (ModalConfig.debug) so maintainers keep full fidelity while debugging.
      resetProgress()
      const raw = (err as Error)?.message || 'Unknown error'
      try { console.error('[Klavity] submit failed:', err) } catch {}
      errEl.textContent = cfg.debug ? `Couldn't submit your report — ${raw}` : "Couldn't submit your report. Please check your connection and try again."
      errEl.style.display = 'block'
      submitBtn.textContent = 'Submit'
      lockComposer(false) // re-enable capture buttons + Submit (Submit only if still valid)
    }
  })

  // KLAVITYKLA-509 (viewport-first capture): swap a fast viewport PREVIEW shot for the full-page render once
  // the (slower) background render resolves. Located by dataUrl identity so a user who removed/replaced the
  // preview in the meantime is left untouched. Mirrors retakeSharp's in-place swap — the pixels/dimensions
  // change, so any stale markup/undo/crop history bound to that slot is dropped.
  function swapPreviewForFull(previewUrl: string, result: CaptureResult) {
    const { dataUrl, quality, suggestSharp } = normalizeCapture(result)
    if (!dataUrl) return
    const index = screenshots.indexOf(previewUrl)
    if (index < 0) return // the preview was removed/replaced by the user — respect their state, do not swap
    screenshots[index] = dataUrl
    screenshotCompressed[index] = callbacks.compressImage ? callbacks.compressImage(dataUrl) : Promise.resolve(dataUrl)
    screenshotQuality[index] = quality
    screenshotSuggestSharp[index] = !!suggestSharp && quality !== 'real-pixel'
    if (annotationsByIndex[index]) delete annotationsByIndex[index]
    delete undoStacks[index]; delete cropStacks[index]
    updateStrip()
  }

  // KLAVITYKLA-509: viewport-first capture. Render the FAST above-the-fold preview immediately so the strip
  // shows a real image within ~1s, then run the full-page render in the BACKGROUND and swap it in when ready.
  // The caller only awaits the (fast) preview phase — the full render is fire-and-forget, so the composer is
  // NEVER blocked on it. Returns true when it drove a viewport-first capture; false when no onCaptureViewport
  // is wired (the caller then falls back to its normal onCaptureFull path).
  async function captureViewportThenFull(activeBtn: HTMLButtonElement | null): Promise<boolean> {
    if (!callbacks.onCaptureViewport) return false
    let previewUrl: string | null = null
    // Phase 1 — fast viewport preview (awaited).
    const restore = maskOn ? maskNumbers(document.body) : null
    try {
      const { dataUrl } = normalizeCapture(await callbacks.onCaptureViewport())
      if (dataUrl) {
        previewUrl = dataUrl
        capturing = false // a real preview is now shown — clear the "Capturing…" skeleton
        addScreenshot(dataUrl, 'rendered', undefined, true, false)
        if (activeBtn) setActiveCapture(activeBtn)
      }
    } catch { /* preview failed — the background full render below becomes the primary shot */ }
    finally { restore?.() }
    // Phase 2 — full-page render in the background. Fire-and-forget; swap the preview for it when ready.
    void (async () => {
      const restore2 = maskOn ? maskNumbers(document.body) : null
      try {
        const full = await callbacks.onCaptureFull()
        if (previewUrl) swapPreviewForFull(previewUrl, full)
        else {
          capturing = false
          const { dataUrl, quality, suggestSharp } = normalizeCapture(full)
          if (dataUrl) { addScreenshot(dataUrl, quality, undefined, true, !!suggestSharp); if (activeBtn) setActiveCapture(activeBtn) }
        }
      } catch { capturing = false; updateStrip() }
      finally { restore2?.() }
    })()
    return true
  }

  // KLA-556: viewport-ONLY capture. Same fast above-the-fold preview as captureViewportThenFull's Phase 1,
  // but WITHOUT the background full-page swap — the default auto-capture shot must stay the viewport (what
  // the user actually sees), and full-page remains an explicit "Full Page" click. Returns true when it drove
  // a viewport capture; false when no onCaptureViewport is wired (caller falls back to onCaptureFull).
  async function captureViewportOnly(activeBtn: HTMLButtonElement | null): Promise<boolean> {
    if (!callbacks.onCaptureViewport) return false
    const restore = maskOn ? maskNumbers(document.body) : null
    try {
      const { dataUrl, blank } = normalizeCapture(await callbacks.onCaptureViewport())
      if (blank && screenshots.length === 0) {
        // Declined-share / unrenderable page → a white PNG. Don't seed it; show the steer-to-Snap empty state.
        showBlankCaptureEmptyState()
      } else if (dataUrl) {
        capturing = false // a real preview is now shown — clear the "Capturing…" skeleton
        addScreenshot(dataUrl, 'rendered', undefined, true, false)
        if (activeBtn) setActiveCapture(activeBtn)
      } else {
        capturing = false
        updateStrip()
      }
    } catch { capturing = false; updateStrip() }
    finally { restore?.() }
    return true
  }

  // Capture buttons — each is guarded against double-click / re-entrancy via `busy`/lockComposer.
  const fullBtn = modal.querySelector('#klavity-full') as HTMLButtonElement
  fullBtn.addEventListener('click', async () => {
    if (busy) return
    // Owner directive (2026-08-26): "Full Page" now captures via real tab-share (getDisplayMedia) so it works
    // on cross-origin pages — embedded frames / cross-origin images no longer render as a blank-white DOM shot
    // (hit live on PX4). runScreenCapture fires getDisplayMedia as its FIRST step so THIS click's user gesture
    // is preserved. It falls back (returns false) ONLY when Screen capture is unavailable (iOS Safari, no
    // onCaptureSharp) or the user declines / loses the share gesture — in which case we drop to the fast DOM
    // render below so the user still gets a shot (with the usual suggestSharp nudge).
    if (callbacks.onCaptureSharp) {
      const added = await runScreenCapture()
      if (added) return
    }
    lockComposer(true)
    fullBtn.classList.add('kl-loading')
    try {
      // KLAVITYKLA-509: viewport-first when available — the fast preview shows now; the composer unlocks as
      // soon as it lands (we only await the preview), and the full-page render swaps in later in the
      // background so the user is never stuck watching "Capturing…". Checked SYNCHRONOUSLY (no await before
      // the fallback) so the double-click guard still calls onCaptureFull exactly once in the classic path.
      if (callbacks.onCaptureViewport) { await captureViewportThenFull(fullBtn); return }
      const restore = maskOn ? maskNumbers(document.body) : null
      try {
        const { dataUrl, quality, suggestSharp } = normalizeCapture(await callbacks.onCaptureFull())
        addScreenshot(dataUrl, quality, undefined, true, !!suggestSharp); setActiveCapture(fullBtn)
      }
      finally { restore?.() }
    }
    catch { /* ignore */ }
    finally { fullBtn.classList.remove('kl-loading'); lockComposer(false) }
  })
  // KLA-587: shared "capture via real Screen (getDisplayMedia)" runner — used by BOTH the Screen button
  // (manual click) and the on-open DEFAULT capture (founder decision). Hides the composer so it isn't in the
  // shot, fires onCaptureSharp (which calls getDisplayMedia as its FIRST step so the click's/opening user
  // gesture is preserved), and adds the resulting real-pixel shot. Returns true when a shot was added; false
  // on a user DECLINE / lost-gesture / unsupported / empty result so the caller can fall back to a rendered
  // capture. NEVER surfaces an error for a decline — the fallback is silent (per the founder decision).
  async function runScreenCapture(opts?: { viewport?: boolean }): Promise<boolean> {
    // KLA composer-polish: the on-open DEFAULT capture asks for the VIEWPORT-scoped Screen frame (single
    // visible frame, no scroll-stitch) when the host wired onCaptureSharpViewport; the manual Screen button
    // asks for the full-page onCaptureSharp. Falls back to onCaptureSharp when the viewport variant isn't
    // wired (e.g. the extension), so no host regresses.
    const capFn = (opts?.viewport && callbacks.onCaptureSharpViewport) ? callbacks.onCaptureSharpViewport : callbacks.onCaptureSharp
    if (busy || !capFn || !sharpBtn) return false // re-entrancy / not wired
    // The "Screen" word lives in its own span so the "Capturing…" state never clobbers the icon or the (i).
    const sharpLabel = sharpBtn.querySelector('.kl-sharp-label') as HTMLElement | null
    lockComposer(true)
    sharpBtn.classList.add('kl-loading')
    host.style.display = 'none' // keep the composer out of the captured pixels
    const target = sharpLabel ?? sharpBtn
    const orig = target.textContent
    target.textContent = 'Capturing…'
    let added = false
    try {
      const restore = maskOn ? maskNumbers(document.body) : null
      let shot: CaptureResult | undefined
      try { shot = await capFn() }
      finally { restore?.() }
      if (shot) {
        const { dataUrl, quality } = normalizeCapture(shot)
        // KLA-621: tag the sharp shot's mode (viewport vs full-page) so Retake redoes the SAME mode.
        if (dataUrl) { addScreenshot(dataUrl, quality ?? 'real-pixel', undefined, true, false, { kind: opts?.viewport ? 'viewport' : 'full' }); setActiveCapture(sharpBtn); added = true }
      }
    } catch (err) {
      // A cancelled picker or a spent user-gesture rejects as NotAllowedError|AbortError — an expected outcome
      // we fall back from SILENTLY (no error toast). A genuine, unexpected failure still falls back, but we
      // leave a dev-console breadcrumb so it's diagnosable.
      if (!isScreenDeclineError(err)) { try { console.warn('[Klavity] Screen capture failed; using rendered fallback:', err) } catch {} }
      else {
        // KLA-601: the reporter cancelled the share picker. We keep the rendered fallback, but instead of
        // failing silently, surface a one-time helper nudge on the Screen button so they know the sharper
        // option is one tap away. Once-per-session + dismissible (see showScreenNudge).
        try { showScreenNudge() } catch { /* the nudge is a nicety — never let it break the fallback */ }
      }
    } finally {
      host.style.display = ''
      target.textContent = orig
      sharpBtn.classList.remove('kl-loading')
      lockComposer(false)
    }
    return added
  }
  if (sharpBtn && callbacks.onCaptureSharp) {
    // ONE click → straight to the screen-share permission. getDisplayMedia runs synchronously inside the
    // handler (preserving the click's user gesture).
    sharpBtn.addEventListener('click', () => { void runScreenCapture() })
  }
  // KLA-591: ONE unified attach control. When file attachments are enabled the single button opens one
  // picker (broad accept) and routes EVERY selection through ingestAttachments — which fans images out to
  // the screenshot path and keeps videos/docs as attachments. When disabled it stays the image-only Upload.
  const fileInput = modal.querySelector('#klavity-file') as HTMLInputElement
  const uploadBtn = modal.querySelector('#klavity-upload') as HTMLButtonElement
  uploadBtn.addEventListener('click', () => {
    if (busy) return
    // The image cap only blocks the picker when file attachments are OFF (image-only mode). With the unified
    // control, videos/docs may still be addable even when the image slots are full — ingest enforces caps.
    if (!fileAttachEnabled && screenshots.length >= MAX_IMAGES) { showError(`You can attach up to ${MAX_IMAGES} images.`); return }
    fileInput.click()
  })
  fileInput.addEventListener('change', async (e) => {
    const input = e.target as HTMLInputElement
    const files = input.files ? Array.from(input.files) : []
    input.value = '' // reset so re-selecting the SAME file fires change again (and clears stuck state)
    if (!files.length) return
    const beforeImages = screenshots.length
    const beforeFiles = attachedFiles.length
    if (fileAttachEnabled) await ingestAttachments(files) // unified: images→screenshots, video/doc→attachments
    else await ingestFiles(files)                          // image-only mode: cap + type + size handling
    if (screenshots.length > beforeImages || attachedFiles.length > beforeFiles) setActiveCapture(uploadBtn)
  })

  // KLAVITYKLA-438: "Record me" button — only rendered when the host enabled allowRecording + provided
  // onRecord. Click → onRecord() drives the consent → record → preview flow (sdk recorder); the resolved
  // recording is added as a removable video chip. Re-entrancy-guarded via `busy` like the capture buttons.
  const recordBtn = shadowRoot.getElementById('klavity-record') as HTMLButtonElement | null
  if (recordBtn && callbacks.onRecord) {
    recordBtn.addEventListener('click', async () => {
      if (busy) return
      if (recordings.length >= MAX_RECORDINGS) { showError(`You can attach up to ${MAX_RECORDINGS} recordings.`); return }
      lockComposer(true)
      recordBtn.classList.add('kl-loading')
      // KLA-555 (walkthrough mode): minimize the composer while a recording is ACTIVE so the recorder's
      // docked Stop bar sits over the LIVE app (not behind a dimmed composer). Reuses the SAME host-hide
      // seam the region/sharp captures already use (host.style.display) — no second minimize path. The
      // recorder fires onPhase('recording') when capture starts and onPhase('consent'|'preview') for the
      // centered panels; we mirror that onto host visibility, then always restore in finally.
      const onPhase = (phase: 'consent' | 'recording' | 'preview') => {
        host.style.display = phase === 'recording' ? 'none' : ''
      }
      try {
        const rec = await callbacks.onRecord!(onPhase)
        // KLA-602(a): a finished recording drops STRAIGHT into the gallery as a selected, removable video tile
        // (no Preview→Attach modal). Select it as the inline-playable hero, like addCapturedShot does for images.
        if (rec) {
          recordings.push(rec)
          activeRecordingIndex = recordings.length - 1
          activeVideoIndex = null
          renderRecordings()
          setActiveCapture(recordBtn)
        }
      } catch { /* user cancelled or recorder failed — leave the composer untouched */ }
      finally { host.style.display = ''; recordBtn.classList.remove('kl-loading'); lockComposer(false) }
    })
  }

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
      // KLA-621 (latency): the selection overlay is mounted SYNCHRONOUSLY here — there is NO upfront capture /
      // page render before the selector appears (the old ~3s html-to-image lag). The capture runs only in the
      // onRect callback below, AFTER the reporter has dragged their rectangle, and is now a fast Snap
      // frame-grab cropped to the selection. So the overlay paints on the same frame as the click.
      mountRegionOverlay(async (rect) => {
        // Re-register the modal Esc handler now that the overlay is gone (success path).
        document.addEventListener('keydown', escHandler, { capture: true })
        try {
          const restore = maskOn ? maskNumbers(document.body) : null
          let shot: CaptureResult | undefined
          try { shot = await callbacks.onRegionCapture!(rect) }
          finally { restore?.() }
          if (shot) {
            const { dataUrl, quality, suggestSharp } = normalizeCapture(shot)
            // KLA-621: tag with the region rect so Retake re-crops THIS area from a fresh Snap frame.
            if (dataUrl) { addScreenshot(dataUrl, quality, undefined, true, !!suggestSharp, { kind: 'region', rect }); setActiveCapture(regionBtn) }
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

  // ── Element picker (KLAVITYKLA-228/371 / JTBD 1.11) ─────────────────────────────────────────
  // Mirrors the region-capture flow: hide the composer, hand control to the host's on-page picker,
  // and pin the resolved PickedTarget (selector + text snippet) onto the report. The picked target is
  // reflected as a small chip (with a one-tap Clear) under the actions row, showing both the selector
  // and the element's human-readable label so the reporter can confirm what was captured.
  const pickBtn = shadowRoot.getElementById('klavity-pick') as HTMLButtonElement | null
  const pickInfo = shadowRoot.getElementById('klavity-pickinfo') as HTMLElement | null
  const reflectPicked = () => {
    if (pickBtn) {
      pickBtn.classList.toggle('kl-active', !!pickedTarget)
      if (pickedTarget) pickBtn.setAttribute('aria-pressed', 'true'); else pickBtn.removeAttribute('aria-pressed')
    }
    if (!pickInfo) return
    if (!pickedTarget) { pickInfo.hidden = true; pickInfo.innerHTML = ''; return }
    pickInfo.hidden = false
    const { text } = pickedTarget
    // KLAVITYKLA-496: the raw CSS selector ("div.kb-col…") was reporter-facing noise, so it is no longer
    // shown. The selector is STILL captured — it rides the submit payload as annotations.selector (see
    // buildAnnotationsPayload); only the visible <code> chip is dropped. We keep a friendly confirmation
    // (with the element's human label when the picker resolved one) plus the one-tap Clear.
    const textFrag = text ? `: <span class="kl-pick-txt">${escHtml(text)}</span>` : ''
    pickInfo.innerHTML = `<span class="kl-pick-ic">${icon('mouse-pointer-2', { size: 13 })}</span><span>Element pinned${textFrag}</span><button type="button" class="kl-pick-clear" id="klavity-pick-clear">Clear</button>`
    pickInfo.querySelector('#klavity-pick-clear')?.addEventListener('click', () => { pickedTarget = null; reflectPicked() })
  }
  if (pickBtn && callbacks.onPickElement) {
    pickBtn.onclick = async () => {
      if (busy) return // re-entrancy: a capture/submit/pick is already running
      lockComposer(true)
      // Drop the modal's Esc handler so Esc during picking only cancels the picker, not the composer.
      document.removeEventListener('keydown', escHandler, { capture: true })
      host.style.display = 'none'
      try {
        const result = await callbacks.onPickElement!()
        if (result) {
          pickedTarget = result
          reflectPicked()
          // KLAVITYKLA-494: if the picker also produced a cropped screenshot of the element's bounding box,
          // add it to the images strip. addScreenshot enforces the MAX_IMAGES cap itself, so a full strip
          // just surfaces the usual "up to N images" notice and the selector/text pin still lands.
          // KLA-621: tag with the element's selector (+ rect) so Retake re-crops THIS element (re-resolved
          // live) from a fresh Snap frame instead of grabbing the whole screen.
          if (result.shot) addScreenshot(result.shot, result.shotQuality, undefined, true, false, { kind: 'element', selector: result.selector, rect: result.rect })
        }
      } catch { /* picker failure must never break the composer */ }
      finally {
        document.addEventListener('keydown', escHandler, { capture: true })
        host.style.display = ''
        lockComposer(false)
      }
    }
  }

  // ── Image-hero inline annotator ─────────────────────────────────────────────────────────────
  // A small inline SVG helper for tool glyphs the shared icon set doesn't ship (circle/arrow/text/undo).
  function heroGlyph(inner: string, size = 15): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.125em">${inner}</svg>`
  }
  function heroToolbarHtml(showRevert: boolean): string {
    const t = (name: string, label: string, glyph: string, key: string) =>
      `<button type="button" class="kl-htool" data-tool="${name}" title="${label} (${key.toUpperCase()})" aria-label="${label}">${glyph}<span class="kl-hk">${key.toUpperCase()}</span></button>`
    // Light swatches (white/yellow) get a dark inset ring so they're visible against the light-on-dark toolbar.
    const isLightSwatch = (col: string) => {
      const h = col.replace('#', '')
      if (!/^[0-9a-fA-F]{6}$/.test(h)) return false
      const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16)
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.7
    }
    const c = (col: string) => `<button type="button" class="kl-hcolor${isLightSwatch(col) ? ' kl-hcolor-light' : ''}" data-color="${col}" style="background:${col}" title="${col}" aria-label="Colour ${col}"></button>`
    // Klavity brand mark (compact dot-lattice, matches site/logo-source.svg) — lightened for the dark toolbar.
    const klavityMark =
      `<svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
      `<g fill="#818cf8"><circle cx="15" cy="9" r="2"/><circle cx="11" cy="16" r="2"/><circle cx="10" cy="24" r="2"/><circle cx="11" cy="32" r="2"/><circle cx="15" cy="39" r="2"/><circle cx="33" cy="9" r="2"/><circle cx="37" cy="16" r="2"/><circle cx="38" cy="24" r="2"/><circle cx="37" cy="32" r="2"/><circle cx="33" cy="39" r="2"/></g>` +
      `<g stroke="#818cf8" stroke-width="1.6" stroke-linecap="round" opacity="0.4"><line x1="15" y1="9" x2="33" y2="9"/><line x1="11" y1="16" x2="37" y2="16"/><line x1="10" y1="24" x2="38" y2="24"/><line x1="11" y1="32" x2="37" y2="32"/><line x1="15" y1="39" x2="33" y2="39"/></g></svg>`
    return (
      // Klavity logo, TOP-LEFT of the editor toolbar. It links to the homepage (UTM-stamped so clicks are
      // attributable to WHICH project/site) — the href is assigned in JS (never innerHTML) per this file's
      // XSS guards. See heroLogoHref + the #kl-hero-logo wiring in mountHeroAnnotator.
      `<a class="kl-hlogo" id="kl-hero-logo" target="_blank" rel="noopener" title="Powered by Klavity — visit klavity.in" aria-label="Klavity homepage (opens in a new tab)">${klavityMark}<span class="kl-hlogo-word">Klavity</span></a>` +
      `<span class="kl-hsep"></span>` +
      t('pen', 'Pen', icon('pencil', { size: 15 }), 'p') +
      t('line', 'Line', heroGlyph('<line x1="5" y1="19" x2="19" y2="5"/>'), 'l') +
      t('rect', 'Rectangle', icon('square', { size: 15 }), 'r') +
      t('circle', 'Circle', heroGlyph('<circle cx="12" cy="12" r="9"/>'), 'o') +
      t('arrow', 'Arrow', heroGlyph('<line x1="5" y1="19" x2="19" y2="5"/><polyline points="10 5 19 5 19 14"/>'), 'a') +
      t('text', 'Text', heroGlyph('<path d="M5 6h14M12 6v13M9 19h6"/>'), 't') +
      t('count', 'Numbers', heroGlyph('<circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">1</text>'), 'c') +
      `<span class="kl-hsep"></span>` +
      // Redaction group: the "Mask numbers" toggle (masks digits in fresh captures) now sits next to the
      // Pixelate brush + Crop — grouped with the other redact/edit tools so the logo owns the top-left.
      `<label class="kl-hmask" title="Mask numbers in new screen captures"><input type="checkbox" class="kl-hmask-cb"${maskOn ? ' checked' : ''}>${icon('eye-off', { size: 13 })}<span>Mask numbers</span></label>` +
      t('pixelate', 'Redact (pixelate)', heroGlyph('<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>'), 'b') +
      t('crop', 'Crop', heroGlyph('<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>'), 'k') +
      `<span class="kl-hsep"></span>` +
      // #626: the six preset swatches + the custom picker live in ONE non-wrapping group so the whole palette
      // stays on a single line and moves as a unit — never red/orange/green on one row and blue/white/black on
      // the next (matches the .kl-hgroup pattern used for the Stroke control).
      `<span class="kl-hcolors">` +
        c('#ef4444') + c('#f97316') + c('#16a34a') + c('#3b82f6') + c('#ffffff') + c('#111827') +
        // Custom colour picker — a rainbow swatch that opens a native <input type="color">. The chosen colour
        // becomes the active colour and shows as the selected swatch. Input is visually hidden but focusable
        // via the button (kept inside the shadow root so its styling stays scoped).
        `<span class="kl-hcolor-cwrap">` +
          `<button type="button" class="kl-hcolor kl-hcolor-custom" title="Custom colour" aria-label="Choose a custom colour"></button>` +
          `<input type="color" class="kl-hcolor-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1">` +
        `</span>` +
      `</span>` +
      // Line-width control (applies to pen/line/rect/circle/arrow strokes via Annotator.strokeScale).
      // The "Stroke" label + S/M/L/XL sizes live in ONE non-wrapping group so the label always reads with
      // its options as a single control (never label-here / sizes-on-a-separate-row at the narrow width).
      `<span class="kl-hsep"></span>` +
      `<span class="kl-hgroup">` +
        `<span class="kl-hlabel">Stroke</span>` +
        `<button type="button" class="kl-hopt" data-stroke="0.6" title="Thin stroke" aria-label="Thin stroke">S</button>` +
        `<button type="button" class="kl-hopt kl-on" data-stroke="1" title="Medium stroke" aria-label="Medium stroke">M</button>` +
        `<button type="button" class="kl-hopt" data-stroke="1.8" title="Thick stroke" aria-label="Thick stroke">L</button>` +
        `<button type="button" class="kl-hopt" data-stroke="2.8" title="Extra-thick stroke" aria-label="Extra-thick stroke">XL</button>` +
      `</span>` +
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
      `<button type="button" class="kl-htbtn" id="kl-hero-undo" title="Undo (Cmd+Z / Ctrl+Z)" aria-label="Undo">${heroGlyph('<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', 14)}</button>` +
      // #449: explicit "Revert crop" — shown only after a crop on this image (visibility driven by the
      // per-image crop stack). Reverts the most recent crop to its pre-crop image + original markup.
      (showRevert ? `<button type="button" class="kl-htbtn kl-hrevert" id="kl-hero-revert" title="Revert crop to original" aria-label="Revert crop">${heroGlyph('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v2"/>', 14)}<span class="kl-hk kl-hrevert-lbl">Revert</span></button>` : '') +
      `<button type="button" class="kl-htbtn" id="kl-hero-clear" title="Clear" aria-label="Clear">${icon('trash-2', { size: 14 })}</button>` +
      `<span class="kl-hgrow"></span>` +
      // #627: zoom controls — explicit − / + buttons (plus the Z shortcut) replace the old text hint. They
      // drive the SAME zoom machinery as scroll-wheel zoom (zoomToward + clampZoom + minimap sync), centred
      // on the stage. Shift-drag still pans; scroll still zooms toward the cursor.
      `<span class="kl-hgroup kl-hzoom">` +
        `<button type="button" class="kl-htbtn" id="kl-hero-zoomout" title="Zoom out (Z toggles fit / 2×)" aria-label="Zoom out">${heroGlyph('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/>', 14)}</button>` +
        `<button type="button" class="kl-htbtn" id="kl-hero-zoomin" title="Zoom in (Z toggles fit / 2×)" aria-label="Zoom in">${heroGlyph('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/>', 14)}</button>` +
      `</span>`
    )
  }

  function detachHeroKeys() {
    if (heroKeyHandler) { document.removeEventListener('keydown', heroKeyHandler, { capture: true } as any); heroKeyHandler = null }
  }

  function renderHeroEmpty() {
    const stage = shadowRoot.getElementById('klavity-hero-stage')
    const tools = shadowRoot.getElementById('klavity-hero-tools')
    if (tools) tools.innerHTML = ''
    if (stage) stage.innerHTML = `<div class="kl-hero-empty" id="klavity-hero-empty"><span class="kl-hero-empty-ic">${icon('image', { size: 34 })}</span><span id="klavity-hero-empty-txt">${escHtml(emptyStateText())}</span></div>`
    detachHeroKeys()
  }

  // Keep the hero pane in sync with the strip: clamp the active index, show the empty state when there
  // are no shots, otherwise mount the inline annotator on the active screenshot.
  // KLA-591: a selected VIDEO attachment takes priority — it renders as an inline <video controls> preview.
  function syncHero() {
    // Clear a stale video selection (removed, or no longer a video at that index).
    if (activeVideoIndex != null && !(attachedFiles[activeVideoIndex] && attachmentKind(attachedFiles[activeVideoIndex]) === 'video')) {
      activeVideoIndex = null
    }
    // KLA-602(a): clear a stale recording selection (removed while it was the hero).
    if (activeRecordingIndex != null && !recordings[activeRecordingIndex]) {
      activeRecordingIndex = null
    }
    // A selected "Record me" recording takes hero priority (inline <video controls>), same as a video attachment.
    if (activeRecordingIndex != null) { mountHeroVideoSrc(recordings[activeRecordingIndex].dataUrl); return }
    if (activeVideoIndex != null) { mountHeroVideoSrc(attachedFiles[activeVideoIndex]?.dataUrl); return }
    if (screenshots.length === 0) { activeIndex = 0; renderHeroEmpty(); return }
    if (activeIndex >= screenshots.length) activeIndex = screenshots.length - 1
    if (activeIndex < 0) activeIndex = 0
    mountHeroAnnotator(activeIndex)
  }

  // KLA-591/602(a): render an inline, playable video preview in the hero stage (mirrors how an image shot
  // expands). No annotator toolbar for video — just <video controls>. Shared by video attachments AND "Record
  // me" recordings. Browser-only; safe no-op in headless test envs.
  function mountHeroVideoSrc(src: string | undefined) {
    const stage = shadowRoot.getElementById('klavity-hero-stage')
    const tools = shadowRoot.getElementById('klavity-hero-tools')
    if (!stage || !src) { renderHeroEmpty(); return }
    detachHeroKeys()
    if (tools) tools.innerHTML = ''
    stage.innerHTML = ''
    const video = document.createElement('video')
    video.src = src
    video.controls = true
    video.setAttribute('playsinline', '')
    video.preload = 'metadata'
    video.className = 'kl-hero-video'
    video.style.cssText = 'display:block;max-width:100%;max-height:100%;border-radius:8px;background:#000;box-shadow:0 12px 40px rgba(0,0,0,.5);'
    stage.appendChild(video)
  }

  // #449 — reversible crop: replace screenshots[index] with the selected region of the CLEAN image and
  // rebase that image's markup into the new origin, but FIRST preserve the pre-crop image + markup as an
  // undo snapshot so the crop steps back like any other op (Ctrl/Cmd-Z + toolbar Undo) and an explicit
  // "Revert crop" can jump straight back. Browser-only (needs a real 2D context); no-op if unavailable.
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
      // Snapshot the pre-crop image + original (un-rebased) markup BEFORE mutating, and record it on both
      // the unified undo stack and the crop stack (with its position, so Revert can rewind precisely).
      const mark = undoStacks[index]?.length ?? 0
      const preSnap = snapshotShot(index)
      screenshots[index] = cropped
      screenshotCompressed[index] = callbacks.compressImage ? callbacks.compressImage(cropped) : Promise.resolve(cropped)
      const prevShapes = annotationsByIndex[index]?.shapes as Shape[] | undefined
      if (Array.isArray(prevShapes) && prevShapes.length) {
        annotationsByIndex[index] = { w: cc.width, h: cc.height, shapes: translateShapes(prevShapes, -rx, -ry) }
      } else {
        delete annotationsByIndex[index]
      }
      ;(undoStacks[index] ??= []).push(preSnap)
      ;(cropStacks[index] ??= []).push({ snap: preSnap, mark })
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
      tools.innerHTML = heroToolbarHtml((cropStacks[index]?.length ?? 0) > 0)
      // Top-left logo → UTM'd Klavity homepage. Assigned via .href (not innerHTML) so a hostile embedding
      // host in utm_source/utm_content can never break out of the attribute (this file's XSS discipline).
      const logoLink = tools.querySelector('#kl-hero-logo') as HTMLAnchorElement | null
      if (logoLink) logoLink.href = heroLogoHref(cfg.projectId)
      let activeTool = 'pen'
      let activeColor = '#ef4444'
      let textSize = 26
      let textOutline: 'black' | 'white' | 'none' = 'black'
      // The currently-open text-annotation <input> (in document.body), or null. The document-level tool-hotkey
      // handler bails while this is set so letters land as text, not tool switches (KLA-593 BUG 0).
      let activeTextInput: HTMLInputElement | null = null
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
      const customBtn = tools.querySelector('.kl-hcolor-custom') as HTMLElement | null
      const colorInput = tools.querySelector('.kl-hcolor-input') as HTMLInputElement | null
      const selectColor = (col: string, btn?: HTMLElement) => {
        activeColor = col
        tools.querySelectorAll<HTMLElement>('[data-color]').forEach(el => el.classList.toggle('kl-on', el === btn))
        // The custom swatch has no [data-color], so toggle its selected state explicitly.
        if (customBtn) customBtn.classList.toggle('kl-on', customBtn === btn)
      }
      tools.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => selectTool((b as HTMLElement).dataset.tool!)))
      tools.querySelectorAll('[data-color]').forEach(b => b.addEventListener('click', () => selectColor((b as HTMLElement).dataset.color!, b as HTMLElement)))
      // Custom colour picker: clicking the rainbow swatch opens the native <input type="color">; picking a
      // colour makes it the active colour and paints the swatch so it reads as the current selection.
      if (customBtn && colorInput) {
        customBtn.addEventListener('click', () => colorInput.click())
        const applyCustom = () => { customBtn.style.background = colorInput.value; selectColor(colorInput.value, customBtn) }
        colorInput.addEventListener('input', applyCustom)
        colorInput.addEventListener('change', applyCustom)
      }
      // Mask-numbers toggle now lives at the top of the editing toolbar (moved from the capture panel). It
      // drives the same `maskOn` flag consumed by every capture path, so masking behaviour is unchanged.
      const maskCb = tools.querySelector('.kl-hmask-cb') as HTMLInputElement | null
      if (maskCb) maskCb.addEventListener('change', () => { maskOn = maskCb.checked })
      tools.querySelectorAll('[data-outline]').forEach(b => b.addEventListener('click', () => {
        textOutline = (b as HTMLElement).dataset.outline as 'black' | 'white' | 'none'
        tools.querySelectorAll<HTMLElement>('[data-outline]').forEach(el => el.classList.toggle('kl-on', el === b))
      }))
      tools.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => {
        textSize = Number((b as HTMLElement).dataset.size)
        tools.querySelectorAll<HTMLElement>('[data-size]').forEach(el => el.classList.toggle('kl-on', el === b))
      }))
      tools.querySelectorAll('[data-stroke]').forEach(b => b.addEventListener('click', () => {
        annotator.strokeScale = Number((b as HTMLElement).dataset.stroke) || 1
        tools.querySelectorAll<HTMLElement>('[data-stroke]').forEach(el => el.classList.toggle('kl-on', el === b))
        annotator.redraw()
      }))
      // #449: route the toolbar Undo through the unified per-image history so one click steps back one op
      // (annotation OR crop), remounting to paint the restored state.
      tools.querySelector('#kl-hero-undo')?.addEventListener('click', () => { undoShot(index) })
      tools.querySelector('#kl-hero-revert')?.addEventListener('click', () => { revertCrop(index) })
      // Clear is itself undoable: snapshot the current markup before wiping it.
      tools.querySelector('#kl-hero-clear')?.addEventListener('click', () => { pushUndo(index); annotator.clearAll(); persist() })
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
      // KLAVITYKLA-508: the object-fit:contain scale (screen px per image px). Used to size the text-tool
      // <input> so it matches the committed render (which is drawn in image pixels then scaled down by s).
      const displayScale = () => {
        const r = canvas.getBoundingClientRect()
        return Math.min(r.width / canvas.width, r.height / canvas.height) || 1
      }
      // KLAVITYKLA-507: build the shape for a rect/line/circle/arrow drag from origin→cursor. Kept in one
      // place so the live drag preview (pointermove) and the committed shape (pointerup) are byte-identical.
      const provisionalShape = (tool: string, sx: number, sy: number, ex: number, ey: number, color: string): Shape | null => {
        if (tool === 'line') return { type: 'line', color, x1: sx, y1: sy, x2: ex, y2: ey }
        if (tool === 'arrow') return { type: 'arrow', color, x1: sx, y1: sy, x2: ex, y2: ey }
        if (tool === 'rect') return { type: 'rect', color, x: Math.min(sx, ex), y: Math.min(sy, ey), w: Math.abs(ex - sx), h: Math.abs(ey - sy) }
        if (tool === 'circle') return { type: 'circle', color, x: (sx + ex) / 2, y: (sy + ey) / 2, rx: Math.abs(ex - sx) / 2, ry: Math.abs(ey - sy) / 2 }
        if (tool === 'pixelate') return { type: 'pixelate', x: Math.min(sx, ex), y: Math.min(sy, ey), w: Math.abs(ex - sx), h: Math.abs(ey - sy) }
        return null
      }
      // ── Wheel-zoom + Shift-drag pan on the hero image. Zoom is a uniform translate()+scale() transform,
      //    so toImg()'s getBoundingClientRect math keeps annotation coordinates correct at any zoom.
      //    Scroll to zoom toward the cursor; Shift+drag to pan when zoomed; double-click resets. The zoom
      //    step is gentle + eased (see hero-zoom.ts) so it feels smooth, and a corner minimap appears while
      //    zoomed so you never lose your place. ──
      let zoom = 1, panX = 0, panY = 0, home: DOMRect | null = null
      const reducedMotion = (() => { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) } catch { return false } })()
      const zoomEase = zoomEasing(reducedMotion)
      // The untransformed canvas box (object-fit:contain baseline) — measured lazily by clearing the
      // transform, reading the rect, then restoring, so cursor/minimap math has a fixed origin at any zoom.
      const getHome = (): DOMRect | null => {
        if (home) return home
        const t = canvas.style.transform; canvas.style.transform = ''
        home = canvas.getBoundingClientRect(); canvas.style.transform = t
        return home
      }

      // ── Zoom minimap / navigator ── a thumbnail of the whole shot with a rectangle marking the current
      //    viewport; visible only while zoomed (scale>1). Click / drag it to jump the main view. It draws
      //    the base screenshot into a small <img>; the viewport rect comes from the live pan/scale.
      const minimap = document.createElement('div')
      minimap.className = 'kl-minimap'
      minimap.hidden = true
      minimap.setAttribute('role', 'navigation')
      minimap.setAttribute('aria-label', 'Zoom navigator — click or drag to pan the image')
      const mmImg = document.createElement('img')
      mmImg.className = 'kl-minimap-img'
      mmImg.alt = ''
      mmImg.draggable = false
      mmImg.src = dataUrl
      const mmVp = document.createElement('div')
      mmVp.className = 'kl-minimap-vp'
      minimap.append(mmImg, mmVp)
      stage.appendChild(minimap)
      const updateMinimap = () => {
        const aw = canvas.width, ah = canvas.height
        if (zoom <= 1 || aw < 2 || ah < 2) { minimap.hidden = true; return }
        const h = getHome(); if (!h) { minimap.hidden = true; return }
        const MAX = 148
        const m = Math.min(MAX / aw, MAX / ah)
        const mmW = Math.max(1, Math.round(aw * m)), mmH = Math.max(1, Math.round(ah * m))
        minimap.style.width = mmW + 'px'; minimap.style.height = mmH + 'px'
        const sr = stage.getBoundingClientRect()
        const vis = visibleImageRect(
          { left: sr.left, top: sr.top, right: sr.right, bottom: sr.bottom },
          { left: h.left, top: h.top, width: h.width, height: h.height },
          { panX, panY }, zoom, aw, ah,
        )
        mmVp.style.left = (vis.x * m) + 'px'; mmVp.style.top = (vis.y * m) + 'px'
        mmVp.style.width = Math.max(3, vis.w * m) + 'px'; mmVp.style.height = Math.max(3, vis.h * m) + 'px'
        minimap.hidden = false
      }

      const applyZoomTransform = () => {
        if (zoom === 1) { panX = 0; panY = 0; canvas.style.transform = ''; canvas.style.cursor = 'crosshair'; updateMinimap(); return }
        canvas.style.transformOrigin = '0 0'
        canvas.style.transform = `translate(${panX}px,${panY}px) scale(${zoom})`
        canvas.style.cursor = 'grab'
        updateMinimap()
      }
      const zoomToward = (clientX: number, clientY: number, factor: number) => {
        const h = getHome(); if (!h) return
        const prev = zoom
        zoom = clampZoom(zoom * factor)
        if (zoom === prev) return
        // Keep the image point under the cursor stationary (cursor-anchored zoom).
        const p = zoomTowardPan(clientX, clientY, { left: h.left, top: h.top, width: h.width, height: h.height }, prev, zoom, { panX, panY })
        panX = p.panX; panY = p.panY
        canvas.style.transition = zoomEase // animate the scale change (elastic/bezier, or quick under reduced-motion)
        applyZoomTransform()
      }
      // #627: the stage's centre point in client coords — the anchor for toolbar +/− zoom and the Z toggle
      // (so button/keyboard zoom grows/shrinks around the middle of the view, like a natural pinch).
      const stageCenter = () => { const r = stage.getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 } }
      // #627: reset to fit (1×), mirroring the double-click behaviour, so button/keyboard reset stays in sync.
      const resetZoom = () => { zoom = 1; canvas.style.transition = zoomEase; applyZoomTransform() }
      // #627: toolbar zoom buttons — reuse zoomToward (which clamps + re-syncs the minimap) centred on the stage.
      tools.querySelector('#kl-hero-zoomin')?.addEventListener('click', () => { const { cx, cy } = stageCenter(); zoomToward(cx, cy, 1.25) })
      tools.querySelector('#kl-hero-zoomout')?.addEventListener('click', () => { const { cx, cy } = stageCenter(); zoomToward(cx, cy, 0.8) })
      // Jump the main view so an image point lands at the stage centre — powers minimap click + drag.
      const jumpToImagePoint = (ix: number, iy: number) => {
        const h = getHome(); if (!h) return
        const sr = stage.getBoundingClientRect()
        const p = panForImageCenter(ix, iy, { left: sr.left, top: sr.top, right: sr.right, bottom: sr.bottom }, { left: h.left, top: h.top, width: h.width, height: h.height }, zoom, canvas.width)
        panX = p.panX; panY = p.panY
        canvas.style.transition = zoomEase
        applyZoomTransform()
      }
      let mmDragging = false
      const mmJumpFromEvent = (clientX: number, clientY: number) => {
        const r = minimap.getBoundingClientRect()
        const { ix, iy } = minimapToImage(clientX - r.left, clientY - r.top, r.width, r.height, canvas.width, canvas.height)
        jumpToImagePoint(ix, iy)
      }
      minimap.addEventListener('pointerdown', (e) => {
        mmDragging = true
        try { minimap.setPointerCapture(e.pointerId) } catch { /* noop */ }
        mmJumpFromEvent(e.clientX, e.clientY)
        e.preventDefault(); e.stopPropagation()
      })
      minimap.addEventListener('pointermove', (e) => { if (mmDragging) { mmJumpFromEvent(e.clientX, e.clientY); e.preventDefault() } })
      const mmEnd = (e: PointerEvent) => { if (mmDragging) { mmDragging = false; try { minimap.releasePointerCapture(e.pointerId) } catch { /* noop */ } } }
      minimap.addEventListener('pointerup', mmEnd)
      minimap.addEventListener('pointercancel', mmEnd)

      stage.addEventListener('wheel', (e) => {
        if (activeTool === 'crop') return
        e.preventDefault()
        zoomToward(e.clientX, e.clientY, wheelZoomFactor(e.deltaY))
      }, { passive: false })
      stage.addEventListener('dblclick', () => { zoom = 1; canvas.style.transition = zoomEase; applyZoomTransform() })
      // Numbered-pin counter continues from any pins already on this image.
      let countN = annotator.shapes.reduce((m, s: any) => s.type === 'count' ? Math.max(m, s.n) : m, 0)
      let drawing = false, startX = 0, startY = 0, penPoints: Array<{ x: number; y: number }> = []
      // Shift-drag pan state (only active while zoomed in).
      let panning = false, panSX = 0, panSY = 0, panBaseX = 0, panBaseY = 0
      // Crop drag state: a dashed overlay box tracks the selection in stage-relative pixels.
      let cropBox: HTMLDivElement | null = null
      let cropClient = { x: 0, y: 0 }
      canvas.addEventListener('pointerdown', (e) => {
        // Shift+drag pans the zoomed image instead of drawing.
        if (e.shiftKey && zoom > 1) {
          panning = true; panSX = e.clientX; panSY = e.clientY; panBaseX = panX; panBaseY = panY
          canvas.style.transition = 'none' // pan must track the pointer 1:1 — no easing lag
          canvas.style.cursor = 'grabbing'; try { canvas.setPointerCapture(e.pointerId) } catch { /* noop */ }
          e.preventDefault(); return
        }
        const pt = toImg(e); startX = pt.x; startY = pt.y
        if (activeTool === 'crop') {
          drawing = true
          // KLAVITYKLA-507: capture the pointer so a release OUTSIDE the canvas still fires pointerup here.
          try { canvas.setPointerCapture(e.pointerId) } catch { /* noop */ }
          cropClient = { x: e.clientX, y: e.clientY }
          cropBox = document.createElement('div')
          cropBox.style.cssText = 'position:absolute;border:2px dashed #6c63ff;background:rgba(108,99,255,.14);pointer-events:none;z-index:6;left:0;top:0;width:0;height:0;'
          stage.appendChild(cropBox)
          return
        }
        if (activeTool === 'text') {
          const input = document.createElement('input')
          const shadow = textOutline === 'none' ? 'none' : `0 0 2px ${textOutline}, 0 0 2px ${textOutline}`
          // KLAVITYKLA-508: the on-screen input must match the COMMITTED render. The committed text is drawn
          // in image pixels (size = textSize) at object-fit scale s (<1 for big screenshots), top-left anchored
          // (drawShape now uses textBaseline='top'). So the input is scaled by the same s and its top-left is
          // pinned at the click point (padding/border zeroed so the glyph box starts exactly at left/top).
          const s = displayScale()
          const inputFont = Math.max(6, textSize * s)
          const sz = textSize, ol = textOutline
          input.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;padding:0;margin:0;line-height:1;box-sizing:content-box;background:transparent;border:0;color:${activeColor};font-size:${inputFont}px;font-family:sans-serif;font-weight:700;text-shadow:${shadow};outline:1px dashed ${activeColor};z-index:2147483647;min-width:80px;`
          document.body.appendChild(input)
          // Track the live text input so the document-level tool-hotkey handler can bail unconditionally while
          // it exists (belt-and-suspenders alongside its composedPath guard).
          activeTextInput = input
          // KLA-593 BUG 0: focus MUST be deferred to the next frame. Focusing synchronously inside this
          // pointerdown gets undone by the browser's default mousedown action moving focus to the (unfocusable)
          // canvas → the empty input is then blurred + removed before a single character can land, so the Text
          // tool "couldn't type" and letter keys fell through to the tool shortcuts. requestAnimationFrame runs
          // AFTER that default action, so the caret sticks and every character (incl. t/l/r/o/c/k/p/b) types
          // into the input rather than triggering a tool shortcut.
          requestAnimationFrame(() => { if (document.body.contains(input)) input.focus() })
          input.addEventListener('blur', () => { activeTextInput = null; if (input.value.trim()) { pushUndo(index); annotator.addShape({ type: 'text', color: activeColor, x: startX, y: startY, text: input.value.trim(), size: sz, outline: ol }); persist() } safeRemove(input) }, { once: true })
          input.addEventListener('keydown', (ke) => { if (ke.key === 'Enter') input.blur(); if (ke.key === 'Escape') { input.value = ''; input.blur() } ke.stopPropagation() })
          return
        }
        if (activeTool === 'count') {
          pushUndo(index)
          annotator.addShape({ type: 'count', color: activeColor, x: pt.x, y: pt.y, n: ++countN })
          persist()
          return
        }
        drawing = true
        // KLAVITYKLA-507: capture the pointer for draw tools too, so releasing OUTSIDE the canvas still
        // fires pointerup (commits the shape) instead of silently dropping it + leaving drawing=true.
        try { canvas.setPointerCapture(e.pointerId) } catch { /* noop */ }
        if (activeTool === 'pen') penPoints = [pt]
      })
      canvas.addEventListener('pointermove', (e) => {
        if (panning) { canvas.style.transition = 'none'; panX = panBaseX + (e.clientX - panSX); panY = panBaseY + (e.clientY - panSY); applyZoomTransform(); canvas.style.cursor = 'grabbing'; return }
        if (!drawing) return
        if (activeTool === 'pen') {
          penPoints.push(toImg(e))
          // KLAVITYKLA-507: live pen preview (base + committed + the in-progress stroke).
          if (penPoints.length > 1) annotator.drawPreview({ type: 'pen', color: activeColor, points: penPoints })
          return
        }
        if (activeTool === 'crop' && cropBox) {
          const sr = stage.getBoundingClientRect()
          const x1 = Math.min(cropClient.x, e.clientX), y1 = Math.min(cropClient.y, e.clientY)
          const x2 = Math.max(cropClient.x, e.clientX), y2 = Math.max(cropClient.y, e.clientY)
          cropBox.style.left = (x1 - sr.left) + 'px'
          cropBox.style.top = (y1 - sr.top) + 'px'
          cropBox.style.width = (x2 - x1) + 'px'
          cropBox.style.height = (y2 - y1) + 'px'
          return
        }
        // KLAVITYKLA-507: rubber-band preview for the geometric tools — repaint base + committed shapes and
        // draw a PROVISIONAL shape from the drag origin to the cursor (identical geometry to the pointerup
        // commit below, so what you see is what you get). No history mutation until pointerup.
        const pt = toImg(e)
        const prov = provisionalShape(activeTool, startX, startY, pt.x, pt.y, activeColor)
        if (prov) annotator.drawPreview(prov)
      })
      canvas.addEventListener('pointerup', (e) => {
        if (panning) { panning = false; canvas.style.cursor = zoom > 1 ? 'grab' : 'crosshair'; try { canvas.releasePointerCapture(e.pointerId) } catch { /* noop */ } return }
        if (!drawing) return
        drawing = false
        try { canvas.releasePointerCapture(e.pointerId) } catch { /* noop */ }
        const pt = toImg(e)
        if (activeTool === 'crop') {
          if (cropBox) { safeRemove(cropBox); cropBox = null }
          const rx = Math.max(0, Math.min(startX, pt.x)), ry = Math.max(0, Math.min(startY, pt.y))
          const rw = Math.abs(pt.x - startX), rh = Math.abs(pt.y - startY)
          if (rw > 4 && rh > 4) applyHeroCrop(index, rx, ry, rw, rh)
          return
        }
        // #449: snapshot before adding so this shape becomes one undo step in the unified history.
        const isPixel = activeTool === 'pixelate' && Math.abs(pt.x - startX) > 4 && Math.abs(pt.y - startY) > 4
        const willAdd = (activeTool === 'pen' && penPoints.length > 1) || activeTool === 'line' || activeTool === 'rect' || activeTool === 'circle' || activeTool === 'arrow' || isPixel
        if (willAdd) pushUndo(index)
        if (activeTool === 'pen' && penPoints.length > 1) annotator.addShape({ type: 'pen', color: activeColor, points: penPoints })
        else if (activeTool === 'line') annotator.addShape({ type: 'line', color: activeColor, x1: startX, y1: startY, x2: pt.x, y2: pt.y })
        else if (activeTool === 'rect') annotator.addShape({ type: 'rect', color: activeColor, x: Math.min(startX, pt.x), y: Math.min(startY, pt.y), w: Math.abs(pt.x - startX), h: Math.abs(pt.y - startY) })
        else if (activeTool === 'circle') annotator.addShape({ type: 'circle', color: activeColor, x: (startX + pt.x) / 2, y: (startY + pt.y) / 2, rx: Math.abs(pt.x - startX) / 2, ry: Math.abs(pt.y - startY) / 2 })
        else if (activeTool === 'arrow') annotator.addShape({ type: 'arrow', color: activeColor, x1: startX, y1: startY, x2: pt.x, y2: pt.y })
        else if (isPixel) annotator.addShape({ type: 'pixelate', x: Math.min(startX, pt.x), y: Math.min(startY, pt.y), w: Math.abs(pt.x - startX), h: Math.abs(pt.y - startY) })
        persist()
      })
      // KLAVITYKLA-507: safety net — if the OS cancels the pointer stream (e.g. gesture interrupt), drop any
      // in-flight preview + reset state so `drawing` can never get stuck true (which would freeze all tools).
      canvas.addEventListener('pointercancel', (e) => {
        try { canvas.releasePointerCapture(e.pointerId) } catch { /* noop */ }
        if (cropBox) { safeRemove(cropBox); cropBox = null }
        if (panning) { panning = false; canvas.style.cursor = zoom > 1 ? 'grab' : 'crosshair' }
        if (drawing) { drawing = false; annotator.redraw() } // discard the provisional shape, keep committed
      })

      const TOOL_KEYS: Record<string, string> = { p: 'pen', l: 'line', r: 'rect', o: 'circle', a: 'arrow', t: 'text', c: 'count', b: 'pixelate', k: 'crop' }
      heroKeyHandler = (e: KeyboardEvent) => {
        if (!document.body.contains(host)) { detachHeroKeys(); return }
        // KLA-593 BUG 0 (defense-in-depth): if a text-annotation input is open, NEVER treat keys as tool
        // shortcuts — let every character reach the field. Robust even if focus is momentarily elsewhere.
        if (activeTextInput && document.body.contains(activeTextInput)) return
        // This is a document-level listener but the modal (Describe textarea, the Text-tool input, etc.)
        // lives in a shadow root — so e.target is RETARGETED to the shadow host (a DIV), not the focused
        // field. Use composedPath()[0] to see the real innermost target, else typing in any field triggers
        // the single-key tool shortcuts (e.g. "r" selects Rect) and preventDefault eats the character.
        const el = ((typeof e.composedPath === 'function' && e.composedPath()[0]) || e.target) as HTMLElement | null
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return
        // #449 addendum: BOTH Cmd+Z (metaKey, macOS) and Ctrl+Z (ctrlKey, Win/Linux) step back one op
        // through the unified draw+crop history — repeat to walk all the way to the clean image.
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undoShot(index); return }
        if (e.metaKey || e.ctrlKey || e.altKey) return
        const k = e.key.toLowerCase()
        // #627: bare Z toggles zoom — fit (1×) ⇄ 2× centred on the stage. No modifiers here (Cmd/Ctrl+Z is
        // handled above as undo; the text-input/textarea guard earlier means it never fires while typing).
        if (k === 'z') {
          e.preventDefault()
          if (zoom > 1) resetZoom()
          else { const { cx, cy } = stageCenter(); zoomToward(cx, cy, 2) }
          return
        }
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
        <button data-color="#16a34a" style="background:#16a34a;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#3b82f6" style="background:#3b82f6;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;"></button>
        <button data-color="#ffffff" style="background:#ffffff;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.35);"></button>
        <button data-color="#111827" style="background:#111827;width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;border:1px solid #555;"></button>
        <span style="position:relative;display:inline-flex;">
          <button id="klavity-color-custom" title="Custom colour" aria-label="Choose a custom colour" style="width:24px;height:24px;border:none;border-radius:50%;cursor:pointer;background:conic-gradient(from 0deg,#ef4444,#f59e0b,#facc15,#16a34a,#3b82f6,#a855f7,#ef4444);"></button>
          <input type="color" id="klavity-color-input" value="#ef4444" aria-label="Custom colour value" tabindex="-1" style="position:absolute;left:0;bottom:-2px;width:1px;height:1px;opacity:0;border:0;padding:0;margin:0;pointer-events:none;">
        </span>
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
      // #466: the fullscreen markup editor OWNS the keyboard while it's open. Detach the hero's document-level
      // keydown handler so there is EXACTLY ONE active keydown listener (this editor's onKeyDown below) — a
      // stray hero Ctrl/Cmd+Z would otherwise silently undo the CROP underneath while the user meant to undo
      // an edit stroke in here (the split-brain bug). syncHero() re-attaches it when the editor closes.
      detachHeroKeys()

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
      // Custom colour picker (parity with the hero toolbar): open the native picker and adopt the chosen colour.
      {
        const cBtn = toolbar.querySelector('#klavity-color-custom') as HTMLElement | null
        const cIn = toolbar.querySelector('#klavity-color-input') as HTMLInputElement | null
        if (cBtn && cIn) {
          cBtn.addEventListener('click', () => cIn.click())
          const apply = () => { cBtn.style.background = cIn.value; activeColor = cIn.value }
          cIn.addEventListener('input', apply)
          cIn.addEventListener('change', apply)
        }
      }
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
        safeRemove(editor)
        // #466: hand the keyboard back to the hero. syncHero() remounts the hero annotator, which re-attaches
        // the (single) hero keydown handler that was detached on open — so exactly one is ever active.
        syncHero()
      }
      document.addEventListener('keydown', onKeyDown, { capture: true })
      selectTool(activeTool)

      toolbar.querySelector('#klavity-save-ann')!.addEventListener('click', async () => {
        // #466: push the pre-edit image + markup onto the SAME unified per-image undo/crop history the hero
        // uses, so after closing, one Ctrl/Cmd+Z (or the hero Undo) reverses THIS edit — never the crop that
        // sits below it. Previously the editor saved without pushUndo and re-wrote screenshots[index] with a
        // stale (editor-open) image, so a later undo skipped straight past the edit to the crop and "Revert
        // crop" couldn't recover. Snapshot BEFORE mutating annotationsByIndex.
        pushUndo(index)
        // Keep the CLEAN screenshot; the drawn shapes travel as a structured overlay (re-rendered
        // toggleable + zoomable in the ticket) instead of being flattened into the image. We do NOT reassign
        // screenshots[index] — it already holds the current (possibly cropped) image; overwriting it with the
        // editor-open dataUrl was the "restores a stale image" bug.
        if (annotator.shapes.length) {
          annotationsByIndex[index] = { w: canvas.width, h: canvas.height, shapes: annotator.shapes.map(s => ({ ...s })) }
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
          // KLA-593 BUG 0: defer focus to the next frame so the browser's default mousedown focus-shift (to
          // the unfocusable canvas) doesn't immediately blur + remove this empty input before the user types.
          requestAnimationFrame(() => { if (document.body.contains(input)) input.focus() })
          input.addEventListener('blur', () => {
            if (input.value.trim()) annotator.addShape({ type: 'text', color: activeColor, x: startX, y: startY, text: input.value.trim() })
            safeRemove(input)
          }, { once: true })
          input.addEventListener('keydown', (ke) => { if (ke.key === 'Enter') input.blur(); ke.stopPropagation() })
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

  // #448 — post-submit terminal confirmation (the default path, when the host wired no opts.success).
  // Replaces the (already-frozen) composer body with a "Report sent" card: a check, headline, a short
  // line (host cfg.thankYou copy if set), the quotable ticket ref, and an "Open in Klavity" link when
  // the server returned a dashboard URL. A countdown progress line runs along the bottom and auto-closes
  // the modal after SUBMIT_AUTOCLOSE_MS; hovering pauses it and the link stays clickable until it closes.
  // Dynamic values go in via textContent/href (never innerHTML) per this file's XSS guards.
  function renderSentConfirmation(issueKey: string, issueUrl: string) {
    const wrap = document.createElement('div')
    wrap.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:all;'
    const card = document.createElement('div')
    card.className = 'klavity-sent'
    const check = document.createElement('div')
    check.className = 'kl-sent-check'
    check.innerHTML = icon('check', { label: 'Sent', size: 22 })
    card.appendChild(check)
    const h = document.createElement('h2')
    h.textContent = 'Report sent'
    card.appendChild(h)
    const p = document.createElement('p')
    p.textContent = cfg.thankYou || 'We filed it and emailed you a copy.'
    card.appendChild(p)
    if (issueKey) {
      const ref = document.createElement('div')
      ref.className = 'klavity-ref'
      const label = document.createElement('span')
      label.textContent = 'Filed as'
      const code = document.createElement('code')
      code.textContent = displayRef(issueKey)
      ref.append(label, code)
      // Link only when the server resolved a real http(s) dashboard URL (authed reporters). Anonymous
      // widget submits get just the quotable ref — matching the pre-#448 themed card contract.
      const linkUrl = safeHttpUrl(issueUrl)
      if (linkUrl) {
        const a = document.createElement('a')
        a.href = linkUrl
        a.target = '_blank'
        a.rel = 'noopener'
        a.textContent = 'Open in Klavity'
        ref.appendChild(a)
      }
      card.appendChild(ref)
    }
    wrap.appendChild(card)
    // Keep the themed <style>; swap only the body (drop the whole composer overlay).
    safeRemove(overlay)
    shadowRoot.appendChild(wrap)
    armAutodismiss(card, SUBMIT_AUTOCLOSE_MS)
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

    // Hover-to-pause countdown auto-close (KLAVITYKLA-32 follow-up) — now the shared armAutodismiss
    // helper, attached to the themed modal so the drain + timer freeze while hovered/focused.
    const startAutodismiss = () => armAutodismiss(modal, SUCCESS_AUTODISMISS_MS)

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
        safeRemove(err)
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
      // Dynamic href (carries the embedding host as utm_source) is assigned via .href, never innerHTML,
      // per this file's XSS guards. Attribution so this badge's clicks are traceable to the customer site.
      const pbLink = document.createElement('a')
      pbLink.href = klavityAttributionUrl('https://klavity.in', {
        campaign: 'powered_by',
        medium: cfg.attributionMedium,
        ref: cfg.projectId,
      })
      pbLink.target = '_blank'
      pbLink.rel = 'noopener'
      pbLink.textContent = 'Klavity'
      pb.append('Powered by ', pbLink)
      modal.appendChild(pb)
    }

    if (!copy.showEmail && !copy.showCta) {
      startAutodismiss()
    }
  }

  if (callbacks.autoCaptureOnOpen) {
    // KLAVITYKLA-506: very large DOMs make the html-to-image render slow enough to jank the composer's first
    // paint (and the description field the user wants to click). Skip auto-capture there and let the user
    // click "Full Page" themselves — the strip stays empty (no false skeleton) so the choice is obvious.
    let nodeCount = 0
    try { nodeCount = document.getElementsByTagName('*').length } catch { nodeCount = 0 }
    if (nodeCount <= AUTO_CAPTURE_MAX_NODES) {
      // KLAVITYKLA-509: show the skeleton placeholder IMMEDIATELY (before the render), swap in the real shot
      // on resolve so the thumbnail slot is never blank.
      capturing = true
      updateStrip()
      // KLA-587 (founder decision — REVERSES #460/#473): when Screen-default is on, the on-open DEFAULT capture
      // is real getDisplayMedia. It MUST run PROMPTLY (NOT via requestIdleCallback — an idle/timer task spends
      // the transient user-activation the picker needs) so it stays chained to the composer's opening gesture.
      // Whether the on-open prompt actually fires depends on the gesture surviving the open path; if the
      // browser refuses (spent gesture → NotAllowedError) OR the user declines, we silently fall back to the
      // rendered viewport capture, and the primed primary "Screen" button is the one-tap manual retry. We do
      // NOT re-prompt (no surprise-loop).
      if (defaultCaptureMode(callbacks) === 'screen') {
        void (async () => {
          // KLA composer-polish (founder PX4 repro): the DEFAULT on-open Screen capture is VIEWPORT-scoped —
          // a single visible frame, NOT the full-page scroll-stitch. The manual Screen button stays full-page.
          const ok = await runScreenCapture({ viewport: true })
          if (ok) { capturing = false; updateStrip(); return }
          if (screenshots.length) { capturing = false; updateStrip(); return } // a shot arrived some other way
          // Silent fallback → rendered viewport (or full render where no viewport path is wired).
          capturing = true; updateStrip()
          if (callbacks.onCaptureViewport) { captureViewportOnly(null).catch(() => { capturing = false; updateStrip() }); return }
          callbacks.onCaptureFull()
            .then(shot => { const { dataUrl, quality, suggestSharp, blank } = normalizeCapture(shot); capturing = false; if (blank && screenshots.length === 0) { showBlankCaptureEmptyState(); return } addScreenshot(dataUrl, quality, undefined, true, !!suggestSharp); setActiveCapture(fullBtn) })
            .catch(() => { capturing = false; updateStrip() })
        })()
        return controller
      }
      const runCapture = () => {
        // KLA-556: the DEFAULT auto-capture shot is the VIEWPORT only (above-the-fold / what's visible) —
        // it replaces the "Capturing…" skeleton within ~1s and does NOT swap to full-page. Full page stays
        // an explicit "Full Page" click. The viewport default applies wherever onCaptureViewport is wired;
        // no active-capture button is highlighted (this isn't a full-page shot). Falls back to the direct
        // full-page render (with the skeleton) below when no onCaptureViewport is wired (e.g. the extension).
        if (callbacks.onCaptureViewport) {
          captureViewportOnly(null).catch(() => { capturing = false; updateStrip() })
          return
        }
        callbacks.onCaptureFull()
          .then(shot => {
            const { dataUrl, quality, suggestSharp, blank } = normalizeCapture(shot)
            capturing = false
            if (blank && screenshots.length === 0) { showBlankCaptureEmptyState(); return }
            addScreenshot(dataUrl, quality, undefined, true, !!suggestSharp)
            setActiveCapture(fullBtn)
          })
          .catch(() => { capturing = false; updateStrip() })
      }
      // KLAVITYKLA-506: defer the heavy render OFF the main thread so it doesn't block the composer opening
      // or freeze the description box. requestIdleCallback runs it in idle time; fall back to rAF+timeout.
      const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: { timeout?: number }) => void)
      if (typeof ric === 'function') ric(() => runCapture(), { timeout: 1200 })
      else requestAnimationFrame(() => setTimeout(runCapture, 0))
    }
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
    safeRemove(overlay)
    safeRemove(hint)
  }

  function escHandler(e: KeyboardEvent) {
    if (e.key === 'Escape') { e.stopPropagation(); cleanup(); onCancel() }
  }
  document.addEventListener('keydown', escHandler, { capture: true })

  overlay.addEventListener('pointerdown', (e) => {
    active = true
    startX = e.clientX
    startY = e.clientY
    safeRemove(hint)
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
