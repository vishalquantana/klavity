// packages/sdk/src/widget.ts
import { injectSimStyles } from "@klavity/core/sim"
import { safeToPng, safeToPngWithScale, safeToPngWithQuality, safeToPngFullPage } from "./capture"
import { buildModal, installRegionDrag, isEditableTarget, type ModalController, type PickedTarget } from "@klavity/core/modal"
import { cropDataUrl, type Rect } from "@klavity/core/crop"
import { planScrollStitch, clampCaptureHeight } from "./sharp-capture"
import { type CaptureBuffers } from "@klavity/core/capture"
import { installCaptureContext, buildCaptureContext } from "./capture-context"
import { installErrorReporter } from "./error-reporter"
import type { ReportContext, ReportIdentity, Reporter, ClientInfo } from "@klavity/core"
import { parseScriptConfig, isFirstParty, buildFeedbackForm, successCopy, shouldUseInteractiveSuccess, compressScreenshot, buildThumbnail } from "./widget-lib"
import { coerceReporter, reporterToIdentity, resolveFallbackReporter, captureClientInfo } from "./identity"
import { computeSelector, describeElement } from "./element-selector"
import { getTurnstileToken } from "./load-turnstile"
import { icon } from "@klavity/core/icons"
import { createSessionReplay, type SessionReplay } from "./session-replay"
import { recordMe, recordingSupported } from "./recorder"
import { on, emit } from "./events"
import {
  getActiveSession, startOrContinue, addShot, removeShot, clear as clearEvidenceSession,
  makeShotId, pageCount, MAX_SHOTS,
  type EvidenceSession, type EvidenceShot,
} from "./evidence-session"
import { SimsLive, type LiveObservation } from "./sims-live"  // side-effecting: auto-installs window.KlavitySims on load
import { startSimsWatch, type SimsWatchController } from "./sims-watch"

const HOST_ID = "klavity-widget-host"
// Screenshot capture filter: exclude ALL Klavity-injected chrome so the widget never captures
// itself. The launcher host carries HOST_ID; the composer host (built in @klavity/core modal.ts)
// and other overlays are a SEPARATE full-viewport host on document.body marked data-klavity-ui.
// This matters since the capture renderer traverses shadow DOM — an id-only check on the launcher
// left the open composer visible in Full-Page shots. Returns true to KEEP a node, false to drop it.
const notKlavityChrome = (n: Node): boolean => {
  const el = n as HTMLElement
  if (el.id === HOST_ID) return false
  return !(typeof el.getAttribute === "function" && el.getAttribute("data-klavity-ui") != null)
}
const TOKEN_KEY = "klavity_widget_token"
const WIDGET_FETCH_TIMEOUT_MS = 15_000
const SIM_REVIEW_FETCH_TIMEOUT_MS = 45_000

// KLAVITYKLA-228/371 (JTBD 1.11): on-page element picker. Mounts a lightweight highlight overlay that
// tracks the element under the cursor; on click it computes a robust unique CSS selector + captures a
// human-readable text snippet (aria-label / placeholder / visible text) to pin onto the report as
// annotations.selector + annotations.selectorText. Esc cancels. The highlight/label/banner are
// pointer-events:none so elementFromPoint always reads the page beneath.
function pickElementOnPage(): Promise<PickedTarget | null> {
  return new Promise((resolve) => {
    if (typeof document === "undefined" || !document.body) return resolve(null)
    const box = document.createElement("div")
    box.style.cssText = "position:fixed;z-index:2147483646;pointer-events:none;border:2px solid #6d5efc;background:rgba(109,94,252,.14);border-radius:4px;box-shadow:0 0 0 2px rgba(255,255,255,.55);display:none;"
    const label = document.createElement("div")
    label.style.cssText = "position:fixed;z-index:2147483646;pointer-events:none;font:600 11px/1.4 system-ui,-apple-system,sans-serif;color:#fff;background:#6d5efc;padding:2px 7px;border-radius:5px;max-width:60vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:none;"
    const banner = document.createElement("div")
    banner.setAttribute("role", "status")
    banner.setAttribute("aria-live", "polite")
    banner.textContent = "Click the element that's broken · press Esc to cancel"
    banner.style.cssText = "position:fixed;z-index:2147483647;top:16px;left:50%;transform:translateX(-50%);pointer-events:none;font:600 13px/1.4 system-ui,-apple-system,sans-serif;color:#fff;background:#111827;padding:8px 16px;border-radius:999px;box-shadow:0 6px 24px rgba(0,0,0,.3);"
    document.body.append(box, label, banner)
    const rootEl = document.documentElement
    const prevCursor = rootEl.style.cursor
    rootEl.style.cursor = "crosshair"

    const isOurs = (el: Element | null): boolean => {
      for (let n: Element | null = el; n; n = n.parentElement) {
        if (n.id === HOST_ID || n === box || n === label || n === banner) return true
      }
      return false
    }
    const highlight = (el: Element) => {
      const r = el.getBoundingClientRect()
      box.style.display = "block"
      box.style.left = r.left + "px"; box.style.top = r.top + "px"
      box.style.width = r.width + "px"; box.style.height = r.height + "px"
      const tag = el.tagName.toLowerCase()
      const id = el.id ? "#" + el.id : ""
      const cls = el.classList && el.classList.length ? "." + el.classList[0] : ""
      label.textContent = tag + id + cls
      label.style.display = "block"
      label.style.left = r.left + "px"
      label.style.top = Math.max(2, r.top - 22) + "px"
    }
    const onMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (!el || isOurs(el)) return
      highlight(el)
    }
    const cleanup = (result: PickedTarget | null) => {
      document.removeEventListener("mousemove", onMove, true)
      document.removeEventListener("click", onClick, true)
      document.removeEventListener("keydown", onKey, true)
      rootEl.style.cursor = prevCursor
      box.remove(); label.remove(); banner.remove()
      resolve(result)
    }
    const onClick = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (!el || isOurs(el)) return
      e.preventDefault(); e.stopPropagation()
      const selector = computeSelector(el)
      cleanup(selector ? { selector, text: describeElement(el) } : null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); cleanup(null) }
    }
    // Capture phase so we win the click/keydown before the host page's own handlers.
    document.addEventListener("mousemove", onMove, true)
    document.addEventListener("click", onClick, true)
    document.addEventListener("keydown", onKey, true)
  })
}

// ── KLA-412 multi-page evidence helpers (pure, top-level) ──────────────────────────────────────────
// The evidence session stores screenshots as Blobs (IndexedDB). The composer works in data URLs (its
// screenshots[] are data URLs, and submit uploads them). These convert between the two + measure dims.
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => resolve(String(fr.result || ""))
    fr.onerror = () => reject(fr.error || new Error("blob read failed"))
    fr.readAsDataURL(blob)
  })
}
// Manual data-URL -> Blob (no fetch(), so a strict connect-src CSP can't block it).
function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(",")
  const header = dataUrl.slice(0, comma)
  const body = dataUrl.slice(comma + 1)
  const mimeMatch = /data:([^;,]+)/.exec(header)
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream"
  if (/;base64/i.test(header)) {
    const bin = atob(body)
    const arr = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
    return new Blob([arr], { type: mime })
  }
  return new Blob([decodeURIComponent(body)], { type: mime })
}
// Best-effort natural dimensions of an image data URL (0×0 on failure — never rejects).
function measureImage(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    try {
      const img = new Image()
      const done = (w: number, h: number) => resolve({ w, h })
      img.onload = () => done(img.naturalWidth || 0, img.naturalHeight || 0)
      img.onerror = () => done(0, 0)
      img.src = dataUrl
      setTimeout(() => done(img.naturalWidth || 0, img.naturalHeight || 0), 3000)
    } catch { resolve({ w: 0, h: 0 }) }
  })
}

function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = WIDGET_FETCH_TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  return fetch(input, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(t))
}

const benchNow = (): number =>
  typeof performance !== "undefined" && typeof performance.now === "function"
    ? performance.now()
    : Date.now()
const benchMs = (n: number): number => Math.round(n)
function reactionNodeCount(): number {
  // Count the live-Sims feedback surface: panel rows + launcher + the transient
  // jump-to halo. (Older versions counted always-on markers/pins/dock slots,
  // which the floating feedback panel retired.)
  const host = document.getElementById("klav-sims-live")
  const shadowCount = host?.shadowRoot?.querySelectorAll(".ksl-row,.ksl-launcher").length ?? 0
  return shadowCount + document.querySelectorAll("#klav-sims-overlay,.klav-halo").length
}

function currentScript(): HTMLScriptElement {
  return (document.currentScript as HTMLScriptElement)
    || (document.querySelector('script[src*="widget.js"]') as HTMLScriptElement)
}

function getToken(): string { try { return localStorage.getItem(TOKEN_KEY) || "" } catch { return "" } }
function setToken(t: string) { try { localStorage.setItem(TOKEN_KEY, t) } catch {} }
function clearToken() { try { localStorage.removeItem(TOKEN_KEY) } catch {} }

// ── Dev-tools capture (G2) + custom metadata (G5) ──
// Shared full-fidelity capture buffers, plus site-owner identity/metadata that can be set either via
// the script-tag config (data-user-*/data-meta) or the public JS API (window.Klavity.identify/...).
const _buffers: CaptureBuffers = { consoleErrors: [], networkFailures: [] }
// PX4 #439: the resolved reporter identity is the canonical store; _identity mirrors it as the G5
// string-map so ReportContext.identity keeps working for every existing consumer. `_explicitReporter`
// records whether identify()/window.klavity was called so mount()'s config/settings/fallback seeding
// never overrides an explicit host-app identity.
let _reporter: Reporter | undefined
let _explicitReporter = false
let _identity: ReportIdentity | undefined
let _metadata: Record<string, string> | undefined

function coerceStrings(obj: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    out[String(k).slice(0, 64)] = String(v).slice(0, 1000)
  }
  return out
}

// Set the resolved reporter + mirror the G5 identity string-map. `explicit=true` for identify()/queue
// calls (host app volunteered it) so seeded sources (config/settings/fallback) can't clobber it.
function setReporter(r: Reporter | undefined, explicit: boolean) {
  _reporter = r
  _identity = reporterToIdentity(r)
  if (explicit) _explicitReporter = true
}

// PX4 #439 Public JS SDK: window.Klavity.identify({...}) / window.klavity.identify({...}). Accepts the
// full reporter shape (id/email/name/org/orgId/role/product/env/server); identify(null) clears it.
export function identify(user: Reporter | ReportIdentity | null) {
  setReporter(user ? coerceReporter(user) : undefined, true)
}
export function setMetadata(meta: Record<string, unknown> | null) {
  _metadata = meta ? coerceStrings(meta) : undefined
}
// Expose the currently-resolved reporter (test + submit helper).
export function currentReporter(): Reporter | undefined { return _reporter }
function buildWidgetContext(): ReportContext {
  return buildCaptureContext(_buffers, { identity: _identity, metadata: _metadata })
}

// ── PX4 #439 async-safe queue (PostHog-style stub) ───────────────────────────────────────────────────
// The install snippet sets `window.klavity = window.klavity || []` and stubs methods that push
// [method, ...args] onto the array, so identify()/open() called BEFORE the widget bundle loads are not
// lost. On load we drain the array (replay in order) and replace window.klavity with a live object whose
// methods act immediately (and whose .push() also processes immediately, so late pushes still work).
function processQueueEntry(entry: unknown): void {
  if (!entry) return
  let method: string
  let args: unknown[]
  if (Array.isArray(entry)) { method = String(entry[0]); args = entry.slice(1) }
  else if (typeof entry === "object" && (entry as any).method) { method = String((entry as any).method); args = (entry as any).args || [] }
  else return
  try {
    if (method === "identify") identify((args[0] as any) ?? null)
    else if (method === "setMetadata") setMetadata((args[0] as any) ?? null)
    else if (method === "open") _openReport(args[0] as any)
    else if (method === "on") on(args[0] as any, args[1] as any)
  } catch { /* one bad queue entry must never break the widget */ }
}
export function installIdentifyQueue(): void {
  if (typeof window === "undefined") return
  const w = window as any
  const existing = w.klavity
  // Replay anything queued before load (the snippet's array). Guard: only iterate a real array.
  if (existing && Array.isArray(existing)) {
    for (const entry of existing) processQueueEntry(entry)
  }
  // Live API: methods run immediately; push() also processes immediately so post-load pushes still honor.
  const live: any = {
    identify,
    setMetadata,
    open: (type: "bug" | "feature" = "bug") => _openReport(type),
    on,
    push: (...entries: unknown[]) => { for (const e of entries) processQueueEntry(e); return (w.klavity as any[])?.length ?? 0 },
  }
  w.klavity = live
}

function simObservationBugDescription(observation: LiveObservation, simName: string): string {
  const lines = [
    `Sim observation from ${simName}`,
    "",
    (observation.text || "").trim(),
  ]
  const priority = String(observation.priority || "").trim()
  if (priority && priority !== "none") lines.push("", `Priority: ${priority}`)
  const title = String(observation.suggestedBug?.title || "").trim()
  if (title) lines.push(`Suggested title: ${title}`)
  return lines.filter((line, idx) => line !== "" || lines[idx - 1] !== "").join("\n").trim()
}

function prefillReportDescription(ctrl: ModalController, description: string): void {
  const desc = ctrl.shadowRoot.getElementById("klavity-desc") as HTMLTextAreaElement | null
  if (!desc) return
  desc.value = description
  desc.dispatchEvent(new Event("input", { bubbles: true }))
  try { desc.focus({ preventScroll: true }) } catch { desc.focus() }
}

// Deferred openReport ref — populated inside mount() so window.Klavity.open() works post-mount.
// Pre-mount calls are silently ignored (widget not initialised yet).
let _openReport: (type?: "bug" | "feature") => void = () => {}

// Expose the public API as early as possible so site code can call it before mount() resolves.
// identify/setMetadata/on work immediately; open() is a no-op until mount() runs.
if (typeof window !== "undefined") {
  const w = window as any
  w.Klavity = {
    ...(w.Klavity || {}),
    identify,
    setMetadata,
    mount,
    /** Open the bug/feature composer programmatically. No-op before the widget has mounted. */
    open: (type: "bug" | "feature" = "bug") => _openReport(type),
    /** Subscribe to a widget event. Returns an unsubscribe function. */
    on,
  }
  // PX4 #439: drain + take over the lowercase window.klavity async queue (identify() called before load).
  installIdentifyQueue()
}

// ── Sharp capture (getDisplayMedia real-pixel scroll-stitch) ─────────────────────────────────────────
// The widget's equivalent of the extension's captureVisibleTab / GoFullPage: getDisplayMedia grabs the
// ACTUAL tab pixels, so every image — including cross-origin ones html-to-image can't fetch under CORS/CSP
// — is captured, with ONE permission prompt. We then scroll the page a viewport at a time, grab a frame
// from the live stream at each stop, and stitch the frames onto one tall canvas (devicePixelRatio-aware,
// last frame bottom-aligned/overdrawn, fixed/sticky elements hidden after the top frame so they don't
// repeat, scroll restored). Feature-detected — absent on iOS Safari, where the modal hides the Sharp
// button and users fall back to the html-to-image "Full Page".
function sharpCaptureSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === "function"
}
const _raf = () => new Promise<void>((r) => requestAnimationFrame(() => r()))
const _sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const STREAM_SETTLE_MS = 180 // let the live stream catch up to a new scroll position before grabbing a frame

// Hide every position:fixed / position:sticky element (except our own host) via visibility:hidden — keeps
// layout so the stitched frames stay aligned. Records prior values for restore.
function hideFixedSticky(out: Array<{ el: HTMLElement; v: string }>) {
  if (!document.body) return
  const all = document.body.getElementsByTagName("*")
  for (let i = 0; i < all.length; i++) {
    const el = all[i] as HTMLElement
    if (!el || el.id === HOST_ID) continue
    let pos = ""
    try { pos = getComputedStyle(el).position } catch { continue }
    if (pos === "fixed" || pos === "sticky") {
      out.push({ el, v: el.style.visibility })
      el.style.visibility = "hidden"
    }
  }
}

async function captureSharpFullPage(): Promise<string> {
  // getDisplayMedia MUST run first (preserves the click's user gesture); it throws if the user cancels the
  // picker — the modal catches that and restores the composer.
  const stream: MediaStream = await (navigator.mediaDevices as any).getDisplayMedia({
    video: { frameRate: 30 },
    audio: false,
    preferCurrentTab: true, // Chrome: pre-select the current tab in the picker (ignored elsewhere)
  })

  const widgetHost = document.getElementById(HOST_ID)
  const prevHostDisplay = widgetHost ? widgetHost.style.display : ""
  const hiddenFixed: Array<{ el: HTMLElement; v: string }> = []
  const origX = window.scrollX, origY = window.scrollY

  try {
    const video = document.createElement("video")
    video.srcObject = stream
    video.muted = true
    ;(video as any).playsInline = true
    try { await video.play() } catch { /* play() may reject silently; frames still arrive */ }

    const deadline = Date.now() + 3000
    while ((video.videoWidth === 0 || video.videoHeight === 0) && Date.now() < deadline) await _sleep(50)
    if (!video.videoWidth || !video.videoHeight) throw new Error("sharp capture: no video frame")

    const vw = Math.max(1, window.innerWidth)
    const vh = Math.max(1, window.innerHeight)
    // Browsers may downscale a large tab capture, so derive the true scale from the stream, not just DPR.
    const scale = video.videoWidth / vw

    const docH = Math.max(
      document.documentElement.scrollHeight, document.documentElement.offsetHeight,
      document.body ? document.body.scrollHeight : 0, document.body ? document.body.offsetHeight : 0,
    )
    const fullH = clampCaptureHeight(docH, scale)

    const canvas = document.createElement("canvas")
    canvas.width = Math.round(vw * scale)
    canvas.height = Math.round(fullH * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("sharp capture: no 2d context")

    // Hide OUR floating launcher for every frame (the composer is already hidden by the modal).
    if (widgetHost) widgetHost.style.display = "none"

    const stops = planScrollStitch(fullH, vh)
    const drawW = Math.round(vw * scale), drawH = Math.round(vh * scale)
    for (let i = 0; i < stops.length; i++) {
      window.scrollTo(0, stops[i])
      await _raf(); await _raf(); await _sleep(STREAM_SETTLE_MS)
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, Math.round(stops[i] * scale), drawW, drawH)
      // After the TOP frame, hide fixed/sticky so they don't repeat; the next stop's settle lets the
      // stream reflect the change before that frame is drawn.
      if (i === 0 && stops.length > 1) hideFixedSticky(hiddenFixed)
    }
    return canvas.toDataURL("image/png")
  } finally {
    for (const h of hiddenFixed) h.el.style.visibility = h.v
    if (widgetHost) widgetHost.style.display = prevHostDisplay
    window.scrollTo(origX, origY)
    try { stream.getTracks().forEach((t) => t.stop()) } catch { /* noop */ }
  }
}

// KLAVITYKLA-473 (regression fix over #460): NEVER auto-invoke getDisplayMedia. #460 auto-triggered the
// sharp screen-share whenever a capture was flagged blank — but on a legitimately white/minimalist page that
// popped a surprise "share your screen" system prompt on a normal "Report a bug" click (Antigravity #4).
// Instead, detect blank/partial-white ENTIRELY IN THE BROWSER (capture.ts's blank flag + the renderer's
// cross-origin skip count + a cheap white-fraction canvas sample — no server call, the image stays local)
// and map it to a `suggestSharp` hint. The composer shows a non-intrusive callout pointing at the Screen
// button; the sharp getDisplayMedia capture then fires ONLY from that button's real user-gesture click.
function withSharpSuggestion(
  r: { dataUrl: string; quality: "rendered" | "wireframe"; blank: boolean; partial?: boolean },
): { dataUrl: string; quality: "rendered" | "wireframe"; suggestSharp: boolean } {
  // Only worth suggesting the sharp path when the browser can actually do it (hidden on iOS Safari).
  return { dataUrl: r.dataUrl, quality: r.quality, suggestSharp: !!(r.blank || r.partial) && sharpCaptureSupported() }
}

// Active watch-engine controller — torn down when Sims are undeployed.
let _simsWatchCtrl: SimsWatchController | null = null

async function mount() {
  const cfg = parseScriptConfig(currentScript())
  if (!cfg.projectId || !cfg.backendUrl) return

  // G3: start full-fidelity capture — console + fetch/XHR (core) + PerformanceObserver (longtask/paint/resource).
  installCaptureContext(_buffers)
  // PX4 #439: resolve the reporter identity in precedence order, only when the host app did NOT call
  // identify()/window.klavity.identify() (which sets _explicitReporter and always wins):
  //   1. script-tag config     — data-klavity-user-* / data-user-* (cfg.reporter)
  //   2. window.KlavitySettings.user — a global config object
  //   3. PX4 #427 safe fallback — documented meta tags + conservative window.currentUser/user globals
  if (!_explicitReporter && !_reporter) {
    let seeded = cfg.reporter
    if (!seeded) { try { seeded = coerceReporter((window as any).KlavitySettings?.user) } catch { seeded = undefined } }
    if (!seeded) { try { seeded = resolveFallbackReporter() } catch { seeded = undefined } }
    if (seeded) setReporter(seeded, false)
  }
  // G5: seed metadata declared on the script tag (a later setMetadata() wins).
  if (cfg.metadata && !_metadata) _metadata = cfg.metadata

  const host = document.createElement("div")
  host.id = HOST_ID
  host.setAttribute("data-klavity-ui", "launcher")
  host.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:2147483646;pointer-events:none"
  document.body.appendChild(host)
  const root = host.attachShadow({ mode: "open" })
  injectSimStyles(root)
  const chrome = document.createElement("div")
  chrome.style.cssText = "display:flex;flex-direction:column;align-items:flex-end;gap:8px;font-family:system-ui,sans-serif;pointer-events:none"
  root.appendChild(chrome)
  const dock = document.createElement("div")
  dock.style.cssText = "display:flex;flex-direction:column;align-items:flex-end;gap:8px;font-family:system-ui,sans-serif;pointer-events:none"
  chrome.appendChild(dock)

  // Report launcher is separate from the SimsLive dock. When the live Sims dock appears,
  // this host lifts itself above it so the two bottom-right controls do not overlap.
  const reportDock = document.createElement("div")
  reportDock.style.cssText = "display:flex;align-items:flex-end;gap:10px;font-family:system-ui,sans-serif;pointer-events:none"
  chrome.appendChild(reportDock)

  const setLiveDockActive = (active: boolean) => {
    host.style.bottom = active ? "86px" : "18px"
  }
  const onLiveDock = (event: Event) => {
    setLiveDockActive(Boolean((event as CustomEvent<{ active?: boolean }>).detail?.active))
  }
  document.addEventListener("klavity:sims-live", onLiveDock)

  // Announce widget presence so the extension can yield (Task 3 handshake).
  document.dispatchEvent(new CustomEvent("klavity:widget-ready"))

  // ── G1 session replay: rolling ~60s rrweb buffer, masked by default, attached on submit.
  // rrweb (~260 KB) is lazy-loaded from the backend AFTER mount so it's not in the widget IIFE.
  // Disable per-page with data-replay="off". Best-effort: any failure degrades to no-replay.
  const replayEnabled = (currentScript()?.dataset?.replay || "on") !== "off"
  const replay: SessionReplay = createSessionReplay({
    backendUrl: cfg.backendUrl,
    enabled: replayEnabled,
  })
  // JTBD 1.8: the composer shows an attached-proof chip. It's 'attached' when the buffer already holds a
  // scrubbable recording (rrweb loaded + a full snapshot captured) and 'unavailable' when replay is off
  // or the recorder script never loaded. rrweb loads async, so the chip is re-evaluated after open.
  const replayChipState = (): 'attached' | 'unavailable' => (replayEnabled && replay.hasRecording()) ? 'attached' : 'unavailable'

  const firstParty = isFirstParty(location.origin, cfg.backendUrl)

  // ONE unified fetch: the project config endpoint returns BOTH the appearance theme (modalConfig,
  // → buildModal 3rd arg) AND the lead-gen widget settings (widget: {mode, ctaUrl}, → success copy).
  let modalConfig: any = {}
  // JTBD 1.7: the default report gate is 'anonymous' — no email wall before value is delivered. The
  // email ask moves to the post-submit success card. Projects that explicitly chose 'email'/'login'
  // still get that behavior via the config fetch below.
  let widget: { mode: string; ctaUrl: string; reportGate: string } = { mode: "support", ctaUrl: "https://klavity.in/onboarding", reportGate: "anonymous" }
  // Public Turnstile site key (from the config fetch). When set, the composer renders a Turnstile
  // challenge on the anonymous submit path so dropping the email gate doesn't open a spam hole.
  let turnstileSiteKey = ""
  // Launcher display settings (from modalConfig).
  // Default is the softer icon-only launcher: a muted-indigo lightbulb, no text label. It reads as
  // "share feedback / an idea" rather than the louder "Report a bug" pill. Admins can still switch to
  // the full pill, hide it, pick their own label/color, or swap the glyph back to 'bug' via config.
  let launcherMode: 'hidden' | 'icon' | 'full' | 'custom' = 'icon'
  let launcherText = 'Report a bug'
  let launcherIconColor = '#6366f1'
  let launcherIcon: 'lightbulb' | 'bug' = 'lightbulb'
  // Right-click (context-menu) takeover mode (from modalConfig). Default 'full' preserves the
  // current behavior for existing projects. 'reportOnly' hides Sims actions from everyone; 'off'
  // leaves the native context menu untouched (no takeover at all).
  let rightClickMode: 'full' | 'reportOnly' | 'off' = 'full'
  // PX4 #411/#425: enhanced-composer opts (per-project, from modalConfig.composer). All default OFF, so a
  // project that hasn't opted in renders the classic Bug/Feature composer with no Title field / file uploads.
  let composerShowTitle = false
  let composerFileAttach = false
  // KLAVITYKLA-438 "Record me": per-project opt-in. Only takes effect where the browser can screen-record
  // (getDisplayMedia + MediaRecorder) — hidden on iOS Safari, matching the Sharp-capture support envelope.
  let composerRecord = false
  let composerIssueTypes: Array<{ value: 'bug' | 'feature' | 'task' | 'query'; label: string; mappingLabel?: string }> | undefined
  // Report-clarity helper (per-project, DEFAULT on). Only OFF when the server explicitly returns
  // reportClarity:false. Server + widget ship together (orchestrator), so the field is always present.
  let reportClarity = true
  try {
    const r = await fetchWithTimeout(cfg.backendUrl + "/api/projects/" + encodeURIComponent(cfg.projectId) + "/config")
    if (r.ok) {
      const j = await r.json()
      modalConfig = j.modalConfig || {}
      // Report-clarity toggle rides top-level (sibling of modalConfig). Default ON: only an explicit false
      // disables it. Merge into modalConfig so it threads through resolveModalConfig → buildModal (cfg.reportClarity).
      reportClarity = j.reportClarity !== false
      if (modalConfig && typeof modalConfig === "object") modalConfig.reportClarity = reportClarity
      if (j.widget) widget = { mode: j.widget.mode || "support", ctaUrl: j.widget.ctaUrl || widget.ctaUrl, reportGate: j.widget.reportGate || "anonymous" }
      if (typeof j.turnstileSiteKey === "string") turnstileSiteKey = j.turnstileSiteKey
      // Pull launcher display overrides out of modalConfig
      if (modalConfig.launcherMode && ['hidden', 'icon', 'full', 'custom'].includes(modalConfig.launcherMode)) {
        launcherMode = modalConfig.launcherMode
      }
      if (typeof modalConfig.launcherText === 'string' && modalConfig.launcherText.trim()) {
        launcherText = modalConfig.launcherText.trim().slice(0, 60)
      }
      if (typeof modalConfig.launcherIconColor === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(modalConfig.launcherIconColor)) {
        launcherIconColor = modalConfig.launcherIconColor
      }
      if (modalConfig.launcherIcon === 'lightbulb' || modalConfig.launcherIcon === 'bug') {
        launcherIcon = modalConfig.launcherIcon
      }
      if (modalConfig.rightClickMode && ['full', 'reportOnly', 'off'].includes(modalConfig.rightClickMode)) {
        rightClickMode = modalConfig.rightClickMode
      }
      // PX4 #411/#425: per-project enhanced-composer settings. Validated + clamped so a malformed config can
      // never break the composer; unknown issue-type values are dropped and an empty list falls back to the
      // classic Bug/Feature toggle.
      const composer = (modalConfig && typeof modalConfig.composer === 'object' && modalConfig.composer) || null
      if (composer) {
        composerShowTitle = composer.title === true || composer.showTitleField === true
        composerFileAttach = composer.fileAttach === true || composer.allowFileAttachments === true
        // "Record me" (KLAVITYKLA-438): opt-in per project AND only where the browser supports screen capture.
        composerRecord = (composer.record === true || composer.allowRecording === true) && recordingSupported()
        if (Array.isArray(composer.issueTypes) && composer.issueTypes.length) {
          const cleaned = composer.issueTypes
            .filter((t: any) => t && typeof t.value === 'string' && ['bug', 'feature', 'task', 'query'].includes(t.value))
            .map((t: any) => ({ value: t.value, label: String(t.label || t.value).slice(0, 24), mappingLabel: t.mappingLabel ? String(t.mappingLabel).slice(0, 32) : undefined }))
          if (cleaned.length) composerIssueTypes = cleaned
        }
      }
      // Passive client-error auto-ticketing (BugHerd sub-project A): only mount the error reporter
      // when the project has explicitly opted in via config. Never throws — a failed/absent config
      // response simply leaves auto-capture off (see catch below).
      if (j.widget && j.widget.autoCaptureErrors === true) {
        installErrorReporter({
          backendUrl: cfg.backendUrl,
          projectId: cfg.projectId,
          enabled: true,
          buffers: _buffers,
          contextSnapshot: () => buildCaptureContext(_buffers, { identity: _identity, metadata: _metadata }),
        })
      }
    }
  } catch { /* default theme + support mode + email gate */ }

  // ── Heartbeat (TASK #5): tell the backend this widget is live on this page so the dashboard can show
  // "Widget: active — last seen … on <host>". Fire-and-forget, non-blocking, and never throws — a failed
  // ping must never affect the page. keepalive lets it complete even if the user navigates immediately. ──
  try {
    fetch(cfg.backendUrl + "/api/widget/ping", {
      method: "POST",
      headers: { "content-type": "application/json" },
      keepalive: true,
      // Source site: the page this widget is embedded on (+ where the visitor came from). The server
      // derives the trusted host from Origin/Referer; url/referrer are extra attribution signals.
      body: JSON.stringify({ project_id: cfg.projectId, host: location.host, url: location.href, referrer: document.referrer || "" }),
    }).catch(() => {})
  } catch { /* best-effort */ }

  async function postLead(feedbackId: string, email: string) {
    // JTBD 1.13 — lead capture must NOT fail silently. fetch() only rejects on a network error; a 4xx/5xx
    // (validation reject, missing row, project mode off, server error) resolves normally. If we didn't
    // inspect res.ok the modal would confirm "we'll be in touch" while the lead was actually dropped. So
    // we throw on any non-2xx: the success card catches it and shows a real error + retry (see modal.ts
    // renderSuccess.submitLead). The visitor's email is durably persisted server-side BEFORE this returns.
    const res = await fetch(cfg.backendUrl + "/api/widget/lead", {
      method: "POST", headers: { "content-type": "application/json" },
      // Carry the source site so a lead alert says where the lead came from (fallback to the feedback
      // row's captured values server-side).
      body: JSON.stringify({ project_id: cfg.projectId, feedback_id: feedbackId, email, source_url: location.href, source_host: location.host, referrer: document.referrer || "" }),
    })
    if (!res.ok) {
      // Surface a concise reason for the console/telemetry without leaking server internals to the UI.
      const detail = await res.text().catch(() => "")
      throw new Error(`lead capture failed (${res.status})${detail ? ": " + detail.slice(0, 200) : ""}`)
    }
  }

  // ── Sim-deploy state + issue counter (declared before any code that references them) ──
  // Re-entrancy guard: double-clicking the launcher / a menu card must not stack two composers. We keep a
  // reference to the open one and treat it as "open" only while its shadow host is still in the DOM (the
  // modal removes its host on close), so a normal re-open after closing still works.
  let composer: ModalController | null = null

  // ── KLA-412 multi-page evidence session ─────────────────────────────────────────────────────────
  // A bug report that survives page navigation: shots persist in IndexedDB keyed by (projectId, origin).
  // The widget shows a minimized DOCK when a session is active so the user can keep capturing across
  // pages, then files ONE report (with a "Pages captured" trail) from the whole session on submit.
  const evOrigin = location.origin
  let evSession: EvidenceSession | null = null
  let evMinimizing = false // set while we deliberately close the composer to minimize (vs a plain X-close)
  // Serialize session writes so concurrent adds/removes can't lose an update (read-modify-write races).
  let evWriteChain: Promise<unknown> = Promise.resolve()
  function queueEvWrite<T>(fn: () => Promise<T>): Promise<T> {
    const run = evWriteChain.then(fn, fn)
    evWriteChain = run.catch(() => undefined)
    return run
  }
  // Persist one composer-captured shot (data URL) to the active session, tagged with the CURRENT page.
  async function persistEvShot(sessionId: string, dataUrl: string): Promise<void> {
    try {
      const blob = dataUrlToBlob(dataUrl)
      const dims = await measureImage(dataUrl)
      const shot: EvidenceShot = {
        id: makeShotId(), pageUrl: location.href, pagePath: location.pathname, label: "",
        blob, bytes: blob.size, w: dims.w, h: dims.h, ts: Date.now(),
      }
      const res = await addShot(sessionId, shot)
      evSession = res.session
      if (!res.ok) {
        evBanner(res.reason === "max-bytes"
          ? "Max evidence size reached — submit or remove a shot to add more."
          : `Max evidence reached (${MAX_SHOTS} shots) — submit or remove a shot to add more.`)
      }
      updateEvDock()
    } catch { /* best-effort: a failed persist must never break capture */ }
  }
  // Remove the session shot at a composer strip index (indices stay aligned with seed+append order).
  function removeEvShotAt(index: number): void {
    void queueEvWrite(async () => {
      const latest = await getActiveSession(cfg.projectId, evOrigin)
      if (!latest) return
      const target = latest.shots[index]
      if (!target) return
      evSession = await removeShot(latest.id, target.id)
      updateEvDock()
    })
  }
  function buildPagesTrail(shots: EvidenceShot[]): string {
    if (!shots || !shots.length) return ""
    const lines = shots.map((s, i) => {
      const path = s.pagePath || s.pageUrl || "(unknown)"
      const full = s.pageUrl && s.pagePath && s.pageUrl !== s.pagePath ? " - " + s.pageUrl : ""
      return `${i + 1}. ${path}${full}`
    })
    return "Pages captured:\n" + lines.join("\n")
  }

  // ── Minimized dock (the mockup's dark pill) ──
  let evDockEl: HTMLDivElement | null = null
  let evDockCount: HTMLElement | null = null
  function ensureEvDockStyle() {
    if (root.getElementById("klavity-evdock-anim")) return
    const s = document.createElement("style")
    s.id = "klavity-evdock-anim"
    s.textContent =
      "@keyframes kl-evpop{from{transform:scale(.9);opacity:0}to{transform:none;opacity:1}}" +
      "@keyframes kl-evpulse{0%{box-shadow:0 0 0 0 rgba(15,157,107,.5)}70%{box-shadow:0 0 0 8px rgba(15,157,107,0)}100%{box-shadow:0 0 0 0 rgba(15,157,107,0)}}" +
      ".kl-evdock{display:flex;align-items:center;gap:12px;background:#19140f;color:#f5f3ee;border-radius:999px;padding:9px 10px 9px 16px;box-shadow:0 24px 60px -12px rgba(25,20,15,.35);pointer-events:auto;font-family:system-ui,-apple-system,sans-serif;animation:kl-evpop .2s ease}" +
      ".kl-evpulse{width:9px;height:9px;border-radius:50%;background:#0f9d6b;animation:kl-evpulse 1.6s infinite;flex:none}" +
      ".kl-evlab{font-size:13px;line-height:1.25}.kl-evlab b{font-weight:600}.kl-evlab small{display:block;font:10px ui-monospace,monospace;color:#b3a896}" +
      ".kl-evbtn{border:none;border-radius:999px;padding:7px 13px;font:600 12.5px system-ui,sans-serif;cursor:pointer;transition:transform .14s ease,filter .14s ease,background .14s ease}" +
      ".kl-evbtn:hover{transform:translateY(-1px)}.kl-evbtn:active{transform:scale(.97)}" +
      ".kl-evbtn.cap{background:rgba(255,255,255,.12);color:#fff}.kl-evbtn.cap:hover{background:rgba(255,255,255,.2)}" +
      ".kl-evbtn.res{background:#6366f1;color:#fff}.kl-evbtn.res:hover{filter:brightness(1.1)}" +
      ".kl-evx{border:none;background:transparent;color:#b3a896;cursor:pointer;font-size:16px;line-height:1;padding:4px 6px;border-radius:8px}.kl-evx:hover{color:#fff;background:rgba(255,255,255,.12)}" +
      "@media (prefers-reduced-motion:reduce){.kl-evdock,.kl-evpulse{animation:none}.kl-evbtn{transition:none}}"
    root.appendChild(s)
  }
  function evCountText(): string {
    const n = evSession ? evSession.shots.length : 0
    const m = evSession ? pageCount(evSession) : 0
    return `${n} shot${n === 1 ? "" : "s"} - ${m} page${m === 1 ? "" : "s"} - not lost`
  }
  function updateEvDock() {
    if (evDockCount) evDockCount.textContent = evCountText()
  }
  function evBanner(text: string) {
    // Reuse the widget's banner surface (declared later in mount); fall back to console if not ready.
    try { (banner as (t: string) => void)(text) } catch { try { console.warn("[Klavity] " + text) } catch {} }
  }
  function showEvDock() {
    if (!evSession || evSession.shots.length === 0) return
    ensureEvDockStyle()
    reportDock.style.display = "none" // hide the launcher while the report-in-progress dock is up
    if (!evDockEl) {
      const d = document.createElement("div")
      d.className = "kl-evdock"
      const pulse = document.createElement("span"); pulse.className = "kl-evpulse"
      const lab = document.createElement("div"); lab.className = "kl-evlab"
      const labTitle = document.createElement("b"); labTitle.textContent = "Bug report in progress"
      const labSub = document.createElement("small"); labSub.textContent = evCountText()
      evDockCount = labSub
      lab.append(labTitle, labSub)
      const capBtn = document.createElement("button"); capBtn.className = "kl-evbtn cap"; capBtn.type = "button"; capBtn.textContent = "+ Capture here"
      capBtn.addEventListener("click", () => void captureHereFromDock(capBtn))
      const resBtn = document.createElement("button"); resBtn.className = "kl-evbtn res"; resBtn.type = "button"; resBtn.textContent = "Resume"
      resBtn.addEventListener("click", () => void resumeEvidence())
      const xBtn = document.createElement("button"); xBtn.className = "kl-evx"; xBtn.type = "button"; xBtn.title = "Discard this report"; xBtn.setAttribute("aria-label", "Discard"); xBtn.textContent = "x"
      xBtn.addEventListener("click", () => void discardEvidence())
      d.append(pulse, lab, capBtn, resBtn, xBtn)
      evDockEl = d
      reportDock.parentElement?.appendChild(d) // sits in the chrome column next to the launcher slot
    }
    evDockEl.style.display = "flex"
    updateEvDock()
  }
  function hideEvDock() {
    if (evDockEl) evDockEl.style.display = "none"
    paintLauncher() // restore the normal launcher (respects hidden/icon/full modes)
  }
  async function captureHereFromDock(btn: HTMLButtonElement) {
    if (!evSession) return
    const prev = btn.textContent
    btn.disabled = true
    try {
      // KLAVITYKLA-473: persist the DOM render as-is — NO auto getDisplayMedia (that popped a surprise
      // screen-share prompt from a plain dock capture). A blank/partial shot is still persisted; the user
      // steers to the sharp Screen capture themselves when they resume the composer.
      const { dataUrl } = await safeToPngWithQuality(document.body, { filter: notKlavityChrome })
      await queueEvWrite(() => persistEvShot(evSession!.id, dataUrl))
      btn.textContent = "Captured"
      setTimeout(() => { btn.textContent = prev; btn.disabled = false }, 900)
    } catch {
      btn.textContent = prev; btn.disabled = false
    }
  }
  async function resumeEvidence() {
    // Refresh from storage (another tab/page may have added shots) then open the composer seeded.
    try { evSession = await getActiveSession(cfg.projectId, evOrigin) } catch { /* keep in-memory copy */ }
    if (!evSession) { hideEvDock(); return }
    if (evDockEl) evDockEl.style.display = "none"
    openReport("bug", { evidence: { session: evSession } })
  }
  async function discardEvidence() {
    const s = evSession
    evSession = null
    hideEvDock()
    if (s) { try { await clearEvidenceSession(s.id) } catch { /* best-effort */ } }
  }
  // Minimize the open composer to the dock WITHOUT losing evidence (called from the composer's onMinimize).
  function minimizeToDock() {
    evMinimizing = true
    void queueEvWrite(async () => {
      try { evSession = await getActiveSession(cfg.projectId, evOrigin) } catch { /* keep copy */ }
      showEvDock()
    })
    try { composer?.close() } catch { /* the modal removes its own host */ }
  }
  // Start (or continue) an evidence session, then open the composer in session mode. Falls back to a
  // plain single-page report if IndexedDB is unavailable, so nothing breaks where storage is blocked.
  async function startBugReport(opts?: { initialShot?: string; initialShotQuality?: "rendered" | "wireframe" | "real-pixel"; initialShotSuggestSharp?: boolean; initialDescription?: string }) {
    let session: EvidenceSession | null = null
    try { session = await startOrContinue(cfg.projectId, evOrigin) } catch { session = null }
    if (session) evSession = session
    openReport("bug", session ? { ...opts, evidence: { session } } : opts)
  }

  // Track deployed Sims so the context menu can show their icons without a fetch.
  let _deployedSims: Array<{ id: string; name: string; initials?: string; accent?: string }> = []
  // Cumulative count of observations returned by boot + watch-engine reviews.
  let _issueCount = 0
  let _issueBadge: HTMLElement | null = null
  function updateIssueCounter() {
    if (!_issueBadge) return
    _issueBadge.textContent = String(_issueCount)
    _issueBadge.style.display = _issueCount > 0 ? "flex" : "none"
  }

  // Render launcher based on launcherMode setting.
  // 'hidden': no visible launcher (right-click still works); 'icon': bug icon only, no label;
  // 'full': icon + "Report a bug" (default); 'custom': icon + admin-defined text.
  const reportBtn = document.createElement("button")
  reportBtn.className = "kl-launcher-btn"
  reportBtn.title = "Klavity is active on this page — right-click anywhere or click here to report"
  // ── Active/monitoring indicator: a small green status light INSIDE the pill (like a chat "online"
  // dot), immediately left of the bug icon. It deliberately does NOT sit in the top-right corner and
  // does NOT pulse forever — that reads as an unread-notification badge and competed with the real
  // red issue count (.kl-issue-badge), which owns the corner slot. It settles once on load instead.
  if (!root.getElementById("klavity-launcher-anim")) {
    const a = document.createElement("style"); a.id = "klavity-launcher-anim"
    a.textContent =
      "@keyframes kl-active-settle{0%{transform:scale(.4);opacity:0}100%{transform:scale(1);opacity:1}}" +
      ".kl-active-dot{flex:0 0 auto;width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 2px rgba(34,197,94,.28);animation:kl-active-settle .45s cubic-bezier(0.2, 0.7, 0.2, 1) 1;}" +
      ".kl-issue-badge{position:absolute;top:-7px;left:-7px;min-width:17px;height:17px;border-radius:9px;background:#ef4444;color:#fff;font-size:9.5px;font-weight:700;padding:0 4px;display:none;align-items:center;justify-content:center;border:2px solid #fff;font-family:system-ui,sans-serif;line-height:1;}" +
      ".kl-launcher-btn{transition:transform 0.15s cubic-bezier(0.2, 0.7, 0.2, 1), background 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;will-change:transform;}" +
      ".kl-launcher-btn:hover{transform:translateY(-1px) scale(1.02);filter:brightness(1.04);box-shadow:0 8px 20px rgba(79,70,229,.26);}" +
      ".kl-launcher-btn:active{transform:scale(0.97);transition-duration:0.08s;}" +
      "@media (prefers-reduced-motion: reduce){.kl-active-dot{animation:none}.kl-launcher-btn{transition:none!important;transform:none!important;}}"
    root.appendChild(a)
  }
  // Both indicators are children of the launcher button. The red issue badge is absolutely
  // positioned in the corner; the green active dot rides inline in the pill's flex flow.
  // paintLauncher() overwrites reportBtn.innerHTML, so we keep these as JS-owned nodes and
  // re-attach them after every repaint (see paintLauncher()).
  const activeDot = document.createElement("span")
  activeDot.className = "kl-active-dot"
  activeDot.setAttribute("aria-hidden", "true")
  const issueBadge = document.createElement("span")
  issueBadge.className = "kl-issue-badge"
  issueBadge.setAttribute("aria-hidden", "true")
  _issueBadge = issueBadge

  // Mobile watcher: on narrow/phone viewports, 'full' and 'custom' launchers collapse to icon-only
  // (same 44×44 bug circle as 'icon' mode) while desktop keeps the full label. Live/responsive via
  // matchMedia + a 'change' listener so rotation/resize re-renders. Guard matchMedia for non-DOM envs.
  const mq: MediaQueryList = window.matchMedia
    ? window.matchMedia('(max-width: 480px)')
    : ({ matches: false, addEventListener() {}, removeEventListener() {} } as any)

  // Paint the launcher's look (innerHTML + inline styles) from the *effective* mode. Called once at
  // init and again on every matchMedia 'change'. Because innerHTML is overwritten each time, the
  // green active-dot and issue-badge nodes are re-appended afterwards so they survive the repaint.
  function paintLauncher() {
    if (launcherMode === 'hidden') { reportDock.style.display = "none"; return }
    reportDock.style.display = ""
    // Effective mode: full/custom collapse to icon-only on mobile; icon stays icon.
    const collapse = (launcherMode === 'full' || launcherMode === 'custom') && mq.matches
    const effective = collapse ? 'icon' : launcherMode
    if (effective === 'icon') {
      reportBtn.innerHTML = icon(launcherIcon)
      reportBtn.style.cssText = `position:relative;border:0;border-radius:50%;padding:10px;background:${launcherIconColor};color:#fff;font-weight:600;font-size:13px;cursor:pointer;box-shadow:0 6px 16px rgba(79,70,229,.18);display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;pointer-events:auto`
    } else {
      const label = launcherMode === 'custom' ? launcherText : 'Report a bug'
      reportBtn.innerHTML = `${icon(launcherIcon)} ${label}`
      reportBtn.style.cssText = `position:relative;border:0;border-radius:999px;padding:10px 16px;background:${launcherIconColor};color:#fff;font-weight:600;font-size:13px;cursor:pointer;box-shadow:0 6px 16px rgba(79,70,229,.18);display:inline-flex;align-items:center;gap:7px;pointer-events:auto`
    }
    // Re-attach the JS-owned indicator nodes wiped by the innerHTML overwrite. The active dot goes
    // FIRST in the flow so it sits just left of the bug icon; in icon-only mode (44px circle) there
    // is no inline room for it, so it's omitted there — the button title still says Klavity is active.
    if (effective !== 'icon') reportBtn.insertBefore(activeDot, reportBtn.firstChild)
    reportBtn.appendChild(issueBadge)
  }
  paintLauncher()
  mq.addEventListener('change', paintLauncher)
  function openReport(type: "bug" | "feature" = "bug", opts?: { initialShot?: string; initialShotQuality?: "rendered" | "wireframe" | "real-pixel"; initialShotSuggestSharp?: boolean; initialDescription?: string; evidence?: { session: EvidenceSession } }) {
    if (composer && (composer.shadowRoot.host as HTMLElement | null)?.isConnected) return
    // KLA-412: the multi-page evidence session backing this composer (null for a normal single-page report).
    const ev = opts?.evidence?.session ?? null
    const identified = firstParty || !!getToken()  // already known to Klavity (own page session, or signed-in widget)
    // Only the "login" gate forces the connect flow on third-party sites. "email"/"anonymous" let an
    // end-user file WITHOUT a Klavity account; "email" requires a typed email when not already identified.
    if (widget.reportGate === "login" && !identified) { openConnect(); return }
    const requireEmail = widget.reportGate === "email" && !identified
    // Don't beg for an email on the success screen when it's redundant: we already collected it via the
    // gate (requireEmail), the user is a signed-in widget user (token), or it's our own non-leadgen page
    // (e.g. the logged-in dashboard). Leadgen pages still capture the lead — that's the whole funnel.
    const suppressSuccessEmail = requireEmail || !!getToken() || (firstParty && widget.mode !== "leadgen")
    // Resilience: opening the composer must NEVER be blocked or killed by an enhancement. Session-replay
    // load + the auto-screenshot are already best-effort (injectRecorderScript resolves null on
    // adblock/error; autoCaptureOnOpen is deferred + caught inside buildModal). This try/catch is the
    // final belt-and-suspenders so an unexpected throw can't leave the button silently doing nothing.
    try {
    // G5: fire 'open' event so site code can react (e.g. pause video, expand widget).
    emit("open", { type })
    // Post-submit UX: the DEFAULT is now a non-blocking background-upload pill (modal closes at once on
    // Submit) for EVERY widget path — support mode AND the multi-page evidence session (both flow through
    // this openReport). The ONLY exception that stays blocking in-modal is a TRUE lead-gen interactive
    // success screen (lead-capture form + CTA). A support-mode optional "Notify me" email (showEmail) must
    // NOT force the in-modal card — that was the "big broken box" the user hit. See shouldUseInteractiveSuccess.
    const successCfg = successCopy(widget.mode, widget.ctaUrl, suppressSuccessEmail)
    const useInteractiveSuccess = shouldUseInteractiveSuccess(widget.mode, successCfg)
    const ctrl = buildModal(type, {
      // Auto-grab a Full Page shot the moment the modal opens — parity with the extension
      // (content.ts autoCaptureOnOpen). Captures the current page state without an extra click.
      // EXCEPT when we already have a right-click-drag region shot: that one is the default first image,
      // so we skip the full-page auto-capture and let the zoomed-in region lead. KLA-412: also skip it when
      // resuming an evidence session that already holds shots (we seed those below); a BRAND-NEW session
      // (empty, no region shot) still auto-captures so the first shot lands + persists via onShotAdded.
      autoCaptureOnOpen: !opts?.initialShot && !(ev && ev.shots.length > 0),
      // JTBD 1.9: report the capture-quality tag so the composer badges the thumbnail — 'rendered' on the
      // html-to-image path, 'wireframe' when it fell back to the fetch-free painter. Degraded shots get the
      // one-tap "Retake sharp" (getDisplayMedia real-pixel path via onRetakeSharp below).
      // KLAVITYKLA-473: if the DOM render is blank/partial-white, flag suggestSharp so the composer nudges
      // the user to the Screen button — NO auto getDisplayMedia (the #460 surprise-prompt regression).
      onCaptureFull: async () => withSharpSuggestion(await safeToPngWithQuality(document.body, { filter: notKlavityChrome })),
      onRegionCapture: async (rect) => {
        // Crop the selected VIEWPORT rect out of a full-page capture. Pass the capture's scale so the rect
        // lands correctly even when the fetch-free fallback downscaled a tall page (otherwise → black).
        const { dataUrl, scale, quality, blank, partial } = await safeToPngWithScale(document.body, { filter: notKlavityChrome })
        // KLAVITYKLA-473: a blank/partial crop just carries the suggestSharp hint into the composer; we no
        // longer auto-invoke getDisplayMedia here (it surprised users with a screen-share prompt).
        const cropped = await cropDataUrl(dataUrl, rect, window.scrollX, window.scrollY, scale)
        return { dataUrl: cropped, quality, suggestSharp: !!(blank || partial) && sharpCaptureSupported() }
      },
      // Sharp capture: real tab pixels via getDisplayMedia (no CORS issues, captures cross-origin images) +
      // scroll-stitch to a full-page image. Feature-detected — undefined on iOS Safari (no getDisplayMedia),
      // where the modal hides the Sharp button and users fall back to the html-to-image "Full Page" above.
      // Tagged 'real-pixel' so its thumbnail shows the sharp badge and no retake.
      onCaptureSharp: sharpCaptureSupported() ? async () => ({ dataUrl: await captureSharpFullPage(), quality: "real-pixel" as const }) : undefined,
      // JTBD 1.9: "Retake sharp" on a degraded thumbnail → the same getDisplayMedia real-pixel capture. Only
      // wired when the browser supports it (no getDisplayMedia on iOS Safari → no retake affordance shown).
      onRetakeSharp: sharpCaptureSupported() ? async () => ({ dataUrl: await captureSharpFullPage(), quality: "real-pixel" as const }) : undefined,
      // JTBD 1.11 (KLAVITYKLA-228): let the reporter click the exact broken element on the page. The modal
      // hides itself, the picker highlights elements on hover, and the click resolves a robust CSS selector
      // pinned to the report as annotations.selector (the server sanitizer + ticket drawer already read it).
      onPickElement: pickElementOnPage,
      // KLAVITYKLA-241 (JTBD A.11): pre-submit known-issue check. As the reporter types, ask the backend
      // whether this project already tracks a matching known/recurring issue; on a hit the composer shows
      // an inline "Already reported — status: X" note (the user can still submit or dismiss). Best-effort:
      // any failure resolves null so the composer is never blocked by the lookup.
      onCheckKnown: async (description: string) => {
        try {
          const res = await fetchWithTimeout(cfg.backendUrl + "/api/widget/known-check", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ project: cfg.projectId, text: description, url: location.href }),
          })
          if (!res.ok) return null
          const data = await res.json().catch(() => null)
          return (data && data.match) ? data.match : null
        } catch { return null }
      },
      // Report-clarity helper: debounced cheap-LLM tip for the in-progress description. Only wired when the
      // project enabled the helper. The composer computes the heuristic meter/chips itself (no network) and
      // caches by text, so this fires at most once per meaningful change. Best-effort — any failure resolves
      // null and the meter still renders. Server route: POST /api/report/clarity.
      onClarityTip: reportClarity ? (async (text: string) => {
        try {
          const res = await fetchWithTimeout(cfg.backendUrl + "/api/report/clarity", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ projectId: cfg.projectId, text }),
          })
          if (!res.ok) return null
          const data = await res.json().catch(() => null)
          return (data && typeof data.tip === "string" && data.tip) ? { tip: data.tip } : null
        } catch { return null }
      }) : undefined,
      requireEmail,
      // PX4 #439: pre-fill the email gate with the known reporter email so the user never retypes it.
      prefillEmail: _reporter?.email,
      // PX4 #411/#425: enhanced-composer opts from the project config (all default off → classic composer).
      showTitleField: composerShowTitle,
      allowFileAttachments: composerFileAttach,
      // KLAVITYKLA-438 "Record me": expose the button + drive the consent → record → preview overlay from
      // the sdk recorder, returning the captured recording (or null on cancel) to the composer.
      allowRecording: composerRecord,
      onRecord: composerRecord ? (() => recordMe()) : undefined,
      issueTypes: composerIssueTypes,
      // Pre-compress each screenshot as soon as it's captured (runs while the user types their
      // description). By submit time the Promise is settled → zero compression delay before upload.
      compressImage: compressScreenshot,
      onSubmit: async (p) => {
        // JTBD 1.7: on the anonymous path (default gate, no identity demanded), fetch a fresh Turnstile
        // token when the project provisioned a site key — this replaces the dropped email gate's
        // spam-shield role. Best-effort: getTurnstileToken resolves null on any failure and the server
        // fail-opens when it can't verify, so a token hiccup never hard-blocks a legitimate report.
        const needsTurnstile = !!turnstileSiteKey && widget.reportGate === "anonymous" && !identified
        const turnstileToken = needsTurnstile ? (await getTurnstileToken(turnstileSiteKey)) || undefined : undefined
        // KLA-412: for an evidence session, append a "Pages captured" trail listing the page each shot came
        // from (read the LATEST session so shots added across pages are included). The composer already
        // supplies every image in p.screenshots (seeded + interactive), so only the trail text is added.
        let description = p.description
        if (ev) {
          const latest = await getActiveSession(cfg.projectId, evOrigin).catch(() => null)
          const trail = buildPagesTrail((latest && latest.shots.length ? latest : ev).shots)
          if (trail) description = (description ? description + "\n\n" : "") + trail
        }
        // The retained upload config + payload. In the PILL path this closure is held for the lifetime of
        // the (possibly retried) background upload, so Retry re-sends the SAME payload — screenshots +
        // recording blobs included — WITHOUT re-capturing anything.
        const uploadCfg = { backendUrl: cfg.backendUrl, projectId: cfg.projectId, firstParty, token: getToken() }
        const uploadPayload = {
          // PX4 #411: forward the precise kind (Task/Query fall back to p.type=bug for legacy consumers, but
          // p.kind carries the real value) so the server's report_type + connector issue-type mapping are right.
          type: (p.kind ?? p.type), title: p.title, files: p.files, recordings: p.recordings, description,
          pageUrl: location.href, referrer: document.referrer || "", screenshots: p.screenshots,
          context: buildWidgetContext(),
          // PX4 #439/#428: attach the resolved reporter identity + freshly-captured browser/app info.
          reporter: _reporter, clientInfo: captureClientInfo(),
          replayEvents: replay.snapshot(), annotations: p.annotations,
          // Forward the gate's required email → server reporter_email. Without this, an "email"-gated
          // project rejects the submit with 400. On the default anonymous gate this is undefined.
          reporterEmail: p.reporterEmail, turnstileToken,
        }
        // Post-filing bookkeeping shared by both paths: fire the public 'submit' event and clear a
        // multi-page evidence session (KLA-412) now that the report is stored.
        const afterFiled = async (result: { issueKey: string; issueUrl: string }) => {
          try { emit("submit", { issueKey: result.issueKey, issueUrl: result.issueUrl ?? null, type: p.type as "bug" | "feature" }) } catch {}
          if (ev) {
            evMinimizing = false
            try { await clearEvidenceSession(ev.id) } catch { /* best-effort */ }
            evSession = null
            hideEvDock()
          }
        }

        // ── NON-BLOCKING pill path (default) ──────────────────────────────────────────────────────
        // The modal already closed (backgroundUpload). Drive the upload in a bottom-right pill and NEVER
        // reject — a failure becomes a retryable pill state, not a modal error.
        if (!useInteractiveSuccess) {
          const pill = createUploadPill({ totalBytesHint: estimatePayloadBytes(uploadPayload), label: describePayloadParts(uploadPayload) })
          const attempt = () => {
            pill.uploading()
            submitFeedback(uploadCfg, uploadPayload, (pct, loaded, total) => pill.progress(pct, loaded, total))
              .then(async (result) => { await afterFiled(result); pill.success(result.issueKey, result.issueUrl) })
              .catch(() => { pill.failure(attempt) }) // Retry re-runs attempt() with the retained payload
          }
          attempt()
          // The modal fire-and-forgets this promise; the returned value is unused in pill mode.
          return { issueKey: "", issueUrl: "" }
        }

        // ── INTERACTIVE success path (leadgen / CTA) ──────────────────────────────────────────────
        // Kept blocking: the in-modal lead/CTA screen renders on resolve, so drive the modal's own
        // progress fill with real XHR upload bytes and return the result to the modal.
        const result = await submitFeedback(uploadCfg, uploadPayload, (pct) => {
          const fill = composer?.shadowRoot.getElementById("klavity-progress-fill") as HTMLElement | null
          if (fill) { fill.style.transition = "width 0.15s ease"; fill.style.width = pct + "%" }
        })
        await afterFiled(result)
        return result
      },
      // KLA-412: minimize hands off to the widget — persist (already incremental), close the composer,
      // and show the dock so the user keeps their evidence while navigating. Only wired for sessions.
      onMinimize: ev ? () => minimizeToDock() : undefined,
      // KLA-412: persist a shot captured INSIDE the composer (Full Page / Screen / Region / Upload / paste
      // / auto-capture) to the session, tagged with the current page. Serialized to avoid lost updates.
      onShotAdded: ev ? (dataUrl: string) => { void queueEvWrite(() => persistEvShot(ev.id, dataUrl)) } : undefined,
      // KLA-412: keep the session in sync when the reporter removes a thumbnail.
      onShotRemoved: ev ? (index: number) => removeEvShotAt(index) : undefined,
      // G5: fire 'close' event whenever the composer is dismissed (Esc, overlay click, X button).
      onClose: (reason?: 'submitted') => {
        emit("close", {})
        // 'submitted' => the report was handed off to the background pill; onSubmit/afterFiled owns
        // clearing the evidence session, so skip the keep-evidence / restore-dock bookkeeping here.
        if (reason === "submitted") { evMinimizing = false; return }
        // KLA-412: a plain X/Esc close (NOT a minimize) keeps any captured evidence — we show the dock so
        // it isn't lost — but reaps an EMPTY session so an unused open never lingers, restoring the launcher.
        if (ev && !evMinimizing) {
          void queueEvWrite(async () => {
            const latest = await getActiveSession(cfg.projectId, evOrigin)
            if (latest && latest.shots.length > 0) { evSession = latest; showEvDock() }
            else { if (latest) await clearEvidenceSession(latest.id); evSession = null; hideEvDock() }
          })
        }
        evMinimizing = false
      },
      // JTBD 1.8: attached-proof chip — tell the reporter whether a session replay will ride along.
      replayState: replayChipState(),
      // NON-BLOCKING default: close the modal + backdrop immediately on Submit and let the widget's
      // bottom-right pill drive the upload. Turned OFF only for an interactive success screen (leadgen
      // lead form / CTA), which must stay in the modal so the user can engage before it dismisses.
      backgroundUpload: !useInteractiveSuccess,
      // Only pass the success screen when it's the interactive kind; otherwise the pill owns the
      // post-submit confirmation and no in-modal success card should render.
      success: useInteractiveSuccess ? { copy: successCfg, onLead: postLead } : undefined,
    }, modalConfig)
    composer = ctrl // track the open composer so a second open is ignored until this one closes
    // JTBD 1.8: rrweb lazy-loads (a few hundred ms), so the buffer may only become playable AFTER the
    // composer opens. Poll briefly and flip the chip to 'attached' once a scrubbable recording exists.
    if (replayEnabled) {
      let tries = 0
      const chipTimer = setInterval(() => {
        // Stop once this composer closed (a new one, or none, is tracked) or the recording is ready.
        if (composer !== ctrl || replay.hasRecording() || ++tries > 20) {
          clearInterval(chipTimer)
          if (composer === ctrl) ctrl.setReplayState(replayChipState())
        }
      }, 250)
    }
    if (opts?.initialDescription) prefillReportDescription(ctrl, opts.initialDescription)
    if (ev) {
      // KLA-412: seed the already-persisted session shots (in order, each with its page tag), then handle a
      // region-initial shot as a NEW capture — seed it visually AND persist it to the session.
      void (async () => {
        for (const shot of ev.shots) {
          try {
            ctrl.addScreenshot(await blobToDataUrl(shot.blob), undefined, { pageUrl: shot.pageUrl, pagePath: shot.pagePath, label: shot.label })
          } catch { /* skip an unreadable shot */ }
        }
        if (opts?.initialShot) {
          ctrl.addScreenshot(opts.initialShot, opts.initialShotQuality, { pageUrl: location.href, pagePath: location.pathname }, opts.initialShotSuggestSharp)
          void queueEvWrite(() => persistEvShot(ev.id, opts.initialShot!))
        }
      })()
    } else if (opts?.initialShot) {
      // Right-click-drag region: load the cropped selection as the default (first) screenshot, zoomed to fit.
      // JTBD 1.9: a right-click-drag region shot is an html-to-image crop, so it carries its capture-quality
      // tag → the composer badges it (and offers "Retake sharp" when it's rendered/wireframe).
      // KLAVITYKLA-473: also carry the blank/partial flag so the "Use Screen" callout shows for it.
      ctrl.addScreenshot(opts.initialShot, opts.initialShotQuality, undefined, opts.initialShotSuggestSharp)
    }
    } catch (e) { console.warn("[Klavity] failed to open the report composer:", e) }
  }
  SimsLive.onTriage = (observation, simName) => {
    openReport("bug", { initialDescription: simObservationBugDescription(observation, simName) })
  }
  // G5: expose openReport through the module-level ref so window.Klavity.open() works. KLA-412: a bug
  // report starts (or continues) a multi-page evidence session; feature requests stay single-page.
  _openReport = (type = "bug") => { if (type === "feature") openReport("feature"); else void startBugReport() }
  reportBtn.onclick = () => void startBugReport()
  reportDock.appendChild(reportBtn)

  // Right-click anywhere → a small Klavity menu (mirrors the extension's context menu and the
  // mock-up on the marketing home page): Report a Bug / Request a Feature, then the native
  // browser menu. NO extension required — the widget owns the gesture. Shift+right-click (or
  // "Show browser menu") falls through to the native menu; right-clicks on the widget host
  // (launcher, this menu, or an open composer/overlay) are ignored so nothing stacks and
  // right-click-paste still works in the description box. The menu lives in the widget's
  // shadow root, so the host-path guard below also ignores right-clicks on the menu itself.
  let menuEl: HTMLDivElement | null = null
  let nativePending = false
  const closeMenu = () => {
    const m = menuEl; menuEl = null
    if (!m) return
    // Magical exit: drop the entrance animation, then transition out (scale + fade down toward launcher).
    m.style.animation = "none"
    m.style.transition = "opacity .13s ease, transform .13s ease"
    requestAnimationFrame(() => { m.style.opacity = "0"; m.style.transform = "scale(.95) translateY(4px)" })
    setTimeout(() => m.remove(), 150)
  }
  // Instant dismissal (no fade) — used when a region drag-select begins so the menu can't linger over the
  // selection. Removes any live OR mid-fade menu, regardless of whether closeMenu already nulled menuEl.
  const dismissMenuNow = () => { menuEl = null; root.querySelectorAll(".klm-menu").forEach((m) => (m as HTMLElement).remove()) }
  // KLA-20: Always dismiss any open context menu at the start of a new right-mousedown, even when
  // the cursor is positioned over the menu itself. In that case region-drag's isOwnTarget guard
  // returns true and skips onRightDown, so the old menu would linger behind the drag overlay.
  // This capture-phase listener fires before all bubble-phase handlers and before isOwnTarget runs.
  document.addEventListener("mousedown", (e) => { if (e.button === 2) dismissMenuNow() }, true)
  // Scoped keyframes for the magical context menu (entrance spring, item stagger, shimmer
  // sweep, icon hover wiggle). Injected once into the widget's shadow root.
  function ensureMenuStyle() {
    if (root.getElementById("klavity-menu-anim")) return
    const s = document.createElement("style")
    s.id = "klavity-menu-anim"
    s.textContent =
      // entrance keyframes: spring scale-in from top-left (cursor anchor)
      "@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-6px)}100%{opacity:1;transform:scale(1) translateY(0)}}" +
      "@keyframes klm-row-in{0%{opacity:0;transform:translateY(8px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}" +
      "@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}" +
      "@keyframes klm-spin{to{transform:rotate(360deg)}}" +
      ".klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}" +
      // ── Large touch cards (L6): icon chip + label + one-line description + arrow ──
      ".klm-card{position:relative;display:flex;align-items:center;gap:8px;width:100%;border:0;cursor:pointer;text-align:left;padding:8px 10px;border-radius:12px;color:#2a2342;font-family:inherit;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(252,250,246,.55));box-shadow:0 1px 2px rgba(40,25,70,.06),inset 0 0 0 1px rgba(99,102,241,.08);transition:scale .14s cubic-bezier(.2,0,0,1),box-shadow .2s ease,background .2s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}" +
      ".klm-card:hover{scale:1.015;box-shadow:0 5px 14px -3px rgba(99,102,241,.3),inset 0 0 0 1px rgba(99,102,241,.16)}" +
      ".klm-card:active{scale:.96}" +
      ".klm-card:focus-visible{outline:2px solid #6366f1;outline-offset:2px}" +
      ".klm-chip{flex:none;width:32px;height:32px;border-radius:8px;display:grid;place-items:center;color:#5b51c9;background:rgba(99,102,241,.12);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}" +
      ".klm-chip svg{width:16px;height:16px;display:block}" +
      ".klm-card:hover .klm-chip{transform:scale(1.1) rotate(-5deg)}" +
      ".klm-body{display:flex;flex-direction:column;gap:2px;min-width:0}" +
      ".klm-t{font-size:13px;font-weight:650;letter-spacing:-.01em;line-height:1.2}" +
      ".klm-d{font-size:10.5px;line-height:1.35;color:#7c7793;text-wrap:pretty}" +
      ".klm-go{margin-left:auto;flex:none;color:#b6afce;display:inline-flex;transition:transform .2s cubic-bezier(.2,0,0,1)}" +
      ".klm-go svg{width:14px;height:14px;display:block}" +
      ".klm-card:hover .klm-go{transform:translateX(3px)}" +
      ".klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:3px 8px;border-radius:12px;text-align:center;line-height:1.32}" +
      // primary = Report a Bug (brand purple)
      ".klm-card.primary{background:linear-gradient(160deg,#6d6bf3,#5b51d8);color:#fff;box-shadow:0 6px 16px -4px rgba(79,70,229,.45),inset 0 1px 0 rgba(255,255,255,.3)}" +
      ".klm-card.primary:hover{box-shadow:0 9px 22px -4px rgba(79,70,229,.55),inset 0 1px 0 rgba(255,255,255,.35)}" +
      ".klm-card.primary .klm-chip{background:rgba(255,255,255,.22);color:#fff}" +
      ".klm-card.primary .klm-d{color:rgba(255,255,255,.85)}" +
      ".klm-card.primary .klm-go{color:rgba(255,255,255,.72)}" +
      // muted = Show browser menu (warm beige)
      ".klm-card.muted{background:linear-gradient(180deg,rgba(250,248,244,.62),rgba(243,236,225,.5))}" +
      ".klm-card.muted .klm-chip{background:rgba(40,30,60,.06);color:#8a8390}" +
      ".klm-card.muted .klm-t{color:#5d5870}.klm-card.muted .klm-d{color:#9a93a6}" +
      // Sim icons row at the top of the menu
      ".klm-sims-row{display:flex;align-items:center;justify-content:space-between;padding:2px 4px 4px;gap:6px;min-height:30px}" +
      ".klm-sims-chips{display:flex;align-items:center;gap:0}" +
      ".klm-sim-chip{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;color:#fff;flex-shrink:0;border:1.5px solid rgba(255,255,255,.65);margin-left:-3px}" +
      ".klm-sims-chips .klm-sim-chip:first-child{margin-left:0}" +
      ".klm-issue-pill{font-size:10px;font-weight:650;color:#ef4444;background:rgba(239,68,68,.1);border-radius:20px;padding:2px 7px;white-space:nowrap;margin-left:auto}" +
      ".klm-sims-label{font-size:10.5px;color:#9a93a6;margin-left:6px;white-space:nowrap}" +
      // footer wordmark
      ".klm-foot{text-align:center;font-size:11px;color:#8a8076;padding:4px 0 2px;border:0;background:transparent;width:100%;cursor:pointer;font-family:inherit;border-radius:8px;transition:color .18s ease;animation:klm-row-in .42s cubic-bezier(.16,1,.3,1) both}" +
      ".klm-foot:hover{color:#5b51c9}.klm-foot:focus-visible{outline:2px solid #6366f1;outline-offset:2px}" +
      ".klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both}"
    root.appendChild(s)
  }
  // Scripts can't open the browser's native context menu programmatically — it only
  // appears on a real right-click. So "Show browser menu" arms the next right-click to
  // pass through, and we show a brief hint telling the user to right-click again.
  function showNativeHint(x: number, y: number) {
    const t = document.createElement("div")
    t.textContent = "↗ Right-click again to open the browser menu"
    t.style.cssText = "position:fixed;z-index:2147483647;left:" + x + "px;top:" + (y + 6) + "px;background:#1a1a1a;color:#fff;font:500 12.5px system-ui,-apple-system,sans-serif;padding:8px 13px;border-radius:9px;box-shadow:0 8px 24px rgba(0,0,0,.32);pointer-events:none;opacity:0;transition:opacity .2s;max-width:260px"
    root.appendChild(t)
    requestAnimationFrame(() => { t.style.opacity = "1" })
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 250) }, 2400)
  }
  function showMenu(x: number, y: number) {
    closeMenu()
    ensureMenuStyle()
    const menu = document.createElement("div")
    menuEl = menu
    menu.className = "klm-menu"
    menu.style.cssText = "position:fixed;z-index:2147483647;width:200px;max-width:calc(100vw - 16px);border-radius:20px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;transform-origin:top left;padding:8px;display:flex;flex-direction:column;gap:7px;box-sizing:border-box;pointer-events:auto;" +
      "background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.95), rgba(243,236,225,.96));" +
      "border:1px solid rgba(255,255,255,.55);" +
      "box-shadow:0 24px 60px -12px rgba(76,40,130,.32), 0 8px 22px rgba(99,102,241,.16), 0 1.5px 4px rgba(25,20,15,.10), inset 0 1px 0 rgba(255,255,255,.75);" +
      "-webkit-backdrop-filter:blur(14px) saturate(140%);backdrop-filter:blur(14px) saturate(140%);"
    // Lucide arrow-right (no such icon in our set → inline) for each card's affordance.
    const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'
    let idx = 0
    // Sims actions ("Deploy all Sims" / "Select Sims…") + the Sim-chip preview row are shown ONLY in
    // 'full' mode AND only to identified project members (own first-party page, or a signed-in widget
    // session). Anonymous/unidentified visitors — and every visitor in 'reportOnly' mode — get the
    // Report/Request/Browser-menu menu without any Sims jargon. (Same identity notion as openReport.)
    const showSims = rightClickMode === 'full' && (firstParty || !!getToken())
    // Each action is a compact CARD: icon chip + label + optional desc + arrow/hint.
    // Pass desc="" to render a label-only card (no description line — keeps menu short).
    const card = (iconName: string, label: string, desc: string, opts: { primary?: boolean; muted?: boolean; hint?: string; onClick: () => void }) => {
      const b = document.createElement("button")
      b.className = "klm-card" + (opts.primary ? " primary" : "") + (opts.muted ? " muted" : "")
      b.style.animationDelay = (70 + idx * 64) + "ms"
      idx++
      const right = opts.hint
        ? '<span class="klm-hint">' + opts.hint + '</span>'
        : '<span class="klm-go">' + ARROW + '</span>'
      b.innerHTML =
        '<span class="klm-chip">' + icon(iconName) + '</span>' +
        '<span class="klm-body"><span class="klm-t">' + label + '</span>' +
        (desc ? '<span class="klm-d">' + desc + '</span>' : '') +
        '</span>' + right
      b.addEventListener("click", () => { closeMenu(); opts.onClick() })
      return b
    }
    // ── Sim icons row: shows deployed Sims (or available Sims fetched async) + issue count ──
    const simsRow = document.createElement("div")
    simsRow.className = "klm-sims-row"
    simsRow.style.display = "none"
    const simsChips = document.createElement("div")
    simsChips.className = "klm-sims-chips"
    simsRow.appendChild(simsChips)
    if (showSims && _issueCount > 0) {
      const pill = document.createElement("span")
      pill.className = "klm-issue-pill"
      pill.textContent = _issueCount + " issue" + (_issueCount > 1 ? "s" : "")
      simsRow.appendChild(pill)
    }
    menu.appendChild(simsRow)
    function syncSimsRow() {
      const hasIssues = showSims && _issueCount > 0
      simsRow.style.display = simsChips.children.length > 0 || hasIssues ? "flex" : "none"
    }
    function renderSimChips(sims: Array<{ id: string; name: string; initials?: string; accent?: string }>) {
      simsChips.innerHTML = ""
      sims.slice(0, 6).forEach((s, i) => {
        const chip = document.createElement("span")
        chip.className = "klm-sim-chip"
        chip.title = s.name
        chip.style.background = s.accent || "#6366f1"
        chip.style.zIndex = String(10 - i)
        chip.textContent = (s.initials || s.name.slice(0, 2)).toUpperCase()
        simsChips.appendChild(chip)
      })
      // "N Sims active" label after chips
      if (sims.length > 0 && !simsRow.querySelector(".klm-sims-label")) {
        const lbl = document.createElement("span")
        lbl.className = "klm-sims-label"
        lbl.textContent = sims.length + " Sim" + (sims.length > 1 ? "s" : "")
        simsChips.after(lbl)
      }
      syncSimsRow()
    }
    syncSimsRow()
    // The Sim-chip preview row is a Sims surface — only show it when Sims actions are allowed.
    if (showSims) {
      if (_deployedSims.length > 0) {
        renderSimChips(_deployedSims)
      } else {
        // Fetch available Sims async and populate; silent on failure
        fetchWithTimeout(cfg.backendUrl + "/api/widget/sims?project=" + encodeURIComponent(cfg.projectId))
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => { if (Array.isArray(d?.sims) && d.sims.length) renderSimChips(d.sims) })
          .catch(() => {})
      }
    }
    // ── Inline Sim picker — replaces menu content in-place, async fetch of /api/personas ──
    const showSimPicker = async () => {
      // Reveal overflow so a long Sim list scrolls rather than clips
      menu.style.overflow = "visible"
      Array.from(menu.children).forEach((c) => { if (!(c as HTMLElement).classList.contains("klm-shine")) c.remove() })
      // Loading state
      const status = document.createElement("div")
      status.style.cssText = "display:flex;align-items:center;gap:8px;padding:14px 12px;font-size:12.5px;color:#7c7793"
      const spinSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="animation:klm-spin .7s linear infinite;flex-shrink:0"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`
      status.innerHTML = spinSvg + " Loading Sims…"
      menu.appendChild(status)
      let personas: Array<{ id: string; name: string; role?: string }> = []
      try {
        const r = await fetchWithTimeout(cfg.backendUrl + "/api/widget/sims?project=" + encodeURIComponent(cfg.projectId))
        if (!r.ok) throw new Error()
        personas = ((await r.json()).sims || []) as typeof personas
      } catch {
        status.innerHTML = "Couldn't load Sims."
        return
      }
      if (!personas.length) { status.innerHTML = "No Sims in this project yet."; return }
      status.remove()
      // Header row: × close + title
      const hdr = document.createElement("div")
      hdr.style.cssText = "display:flex;align-items:center;gap:8px;padding:4px 4px 8px"
      const closeBtn = document.createElement("button")
      closeBtn.innerHTML = icon("x", { size: 14 })
      closeBtn.style.cssText = "display:grid;place-items:center;width:26px;height:26px;border:0;background:rgba(99,102,241,.1);border-radius:8px;cursor:pointer;color:#5b51c9;flex-shrink:0"
      closeBtn.addEventListener("click", () => closeMenu())
      const hdrTitle = document.createElement("span")
      hdrTitle.textContent = "Choose Sims"
      hdrTitle.style.cssText = "font-size:13px;font-weight:650;color:#2a2342"
      hdr.append(closeBtn, hdrTitle); menu.appendChild(hdr)
      const sel = new Set<string>()
      // Confirm button (built early so sync() can update it)
      const confirmBtn = document.createElement("button")
      confirmBtn.disabled = true
      confirmBtn.style.cssText = "width:100%;padding:11px;border:0;border-radius:12px;font-family:inherit;font-size:13.5px;font-weight:650;cursor:pointer;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;margin-top:6px;opacity:.45;transition:opacity .15s"
      confirmBtn.textContent = "Select a Sim first"
      const syncConfirm = () => {
        const n = sel.size
        confirmBtn.disabled = n === 0
        confirmBtn.textContent = n > 0 ? `Deploy ${n} Sim${n > 1 ? "s" : ""} →` : "Select a Sim first"
        confirmBtn.style.opacity = n > 0 ? "1" : ".45"
      }
      confirmBtn.addEventListener("click", () => { if (!sel.size) return; closeMenu(); void deployAndWatch([...sel]) })
      // Sim rows — scrollable list
      const list = document.createElement("div")
      list.style.cssText = "display:flex;flex-direction:column;gap:4px;max-height:200px;overflow-y:auto"
      for (const p of personas) {
        const row = document.createElement("button")
        row.style.cssText = "display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;background:transparent;border:1.5px solid transparent;border-radius:10px;cursor:pointer;text-align:left;font-family:inherit;transition:background .14s,border-color .14s"
        const chk = document.createElement("span")
        chk.style.cssText = "width:17px;height:17px;border-radius:5px;border:1.5px solid rgba(99,102,241,.35);display:grid;place-items:center;flex-shrink:0;transition:background .14s,border-color .14s"
        const nm = document.createElement("span")
        nm.textContent = p.name
        nm.style.cssText = "font-size:13px;font-weight:550;color:#2a2342;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
        row.append(chk, nm)
        if (p.role) { const rl = document.createElement("span"); rl.textContent = p.role; rl.style.cssText = "font-size:10.5px;color:#9a93a6;white-space:nowrap"; row.appendChild(rl) }
        const setOn = (on: boolean) => {
          chk.style.background = on ? "#6366f1" : ""; chk.style.borderColor = on ? "#6366f1" : "rgba(99,102,241,.35)"
          chk.innerHTML = on ? icon("check", { size: 11 }) : ""
          row.style.background = on ? "rgba(99,102,241,.09)" : ""; row.style.borderColor = on ? "rgba(99,102,241,.22)" : "transparent"
        }
        row.addEventListener("click", () => { sel.has(p.id) ? sel.delete(p.id) : sel.add(p.id); setOn(sel.has(p.id)); syncConfirm() })
        row.addEventListener("mouseenter", () => { if (!sel.has(p.id)) row.style.background = "rgba(99,102,241,.05)" })
        row.addEventListener("mouseleave", () => { if (!sel.has(p.id)) row.style.background = "" })
        list.appendChild(row)
      }
      menu.append(list, confirmBtn)
    }
    menu.appendChild(card("zap", "Report a Bug", "Snap the page and tell us what broke.", { primary: true, onClick: () => void startBugReport() }))
    menu.appendChild(card("lightbulb", "Request a Feature", "Suggest something you'd love to see.", { onClick: () => openReport("feature") }))
    // Sims actions are member-only + 'full'-mode-only — anonymous visitors and reportOnly never see them.
    if (showSims) {
      menu.appendChild(card("users", "Deploy all Sims", "Have every Sim jump in and analyze this page.", { onClick: () => { closeMenu(); void deployAndWatch("all") } }))
      menu.appendChild(card("sparkles", "Select Sims…", "Choose which Sims jump into action.", { onClick: () => { void showSimPicker() } }))
    }
    menu.appendChild(card("monitor", "Browser menu", "", { muted: true, hint: "⇧ right-<br>click", onClick: () => { nativePending = true; showNativeHint(x, y) } }))
    // "Powered by Klavity" footer — hidden for Pro accounts with whiteLabel enabled (KLAVITYKLA-311).
    if (!modalConfig.whiteLabel) {
      const footer = document.createElement("button")
      footer.className = "klm-foot"
      footer.style.animationDelay = (70 + idx * 64) + "ms"
      footer.innerHTML = "Powered by <strong style=\"background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;font-weight:700\">Klavity</strong>"
      footer.addEventListener("click", () => { closeMenu(); window.open("https://klavity.in", "_blank", "noopener,noreferrer") })
      menu.appendChild(footer)
    }
    // One-pass shimmer sweep — appended LAST so it sweeps OVER the opaque cards (pointer-events:none).
    const shine = document.createElement("div"); shine.className = "klm-shine"; menu.appendChild(shine)

    const vw = window.innerWidth
    const vh = window.innerHeight
    const menuWidth = 200
    const PAD = 8

    // Position temporarily off-screen to measure height
    menu.style.left = x + "px"
    menu.style.top = "-9999px"
    root.appendChild(menu)

    const menuHeight = menu.offsetHeight

    // Handle keyboard fallback when coordinates are (0,0) or missing
    const isKeyboard = (x === 0 && y === 0) || x === null || x === undefined || y === null || y === undefined
    let left = isKeyboard ? vw - menuWidth - 18 : x
    let top = isKeyboard ? vh - menuHeight - 74 : y

    // Clamp coordinates to keep menu within viewport boundaries
    left = Math.max(PAD, Math.min(left, vw - menuWidth - PAD))
    top = Math.max(PAD, Math.min(top, vh - menuHeight - PAD))

    menu.style.left = left + "px"
    menu.style.top = top + "px"

    // Fixed bottom-right anchor — aligns with the launcher button (right:18px, bottom:18px + ~48px button).
    // CSS right/bottom keep the menu in viewport on all screen sizes; no JS clamping needed.
    const onOutside = (ev: MouseEvent) => { const p = (ev.composedPath?.() || []) as HTMLElement[]; if (!p.includes(menu)) { closeMenu(); document.removeEventListener("mousedown", onOutside) } }
    const onEsc = (ev: KeyboardEvent) => { if (ev.key === "Escape") { closeMenu(); document.removeEventListener("keydown", onEsc, true) } }
    setTimeout(() => { document.addEventListener("mousedown", onOutside); document.addEventListener("keydown", onEsc, true) }, 0)
  }

  // Right-clicks on the widget's own UI (launcher / menu / open composer / overlay) are ignored so the
  // context menu and region-drag never hijack them (right-click-paste in the description box keeps working).
  const onOwnUi = (e: MouseEvent) => {
    const path = (e.composedPath?.() || []) as HTMLElement[]
    return path.some((n) => n?.id === HOST_ID || (typeof n?.className === "string" && /klavity-(overlay|modal)/.test(n.className)))
  }

  // ── Right-click + DRAG to select a region → capture JUST that area → open the composer with it as the
  // default (first), zoomed-in screenshot. A plain right-click (no drag) still shows the menu below. ──
  async function captureRegionAndOpen(rect: Rect) {
    let shot = ""
    let shotQuality: "rendered" | "wireframe" | "real-pixel" | undefined
    let shotSuggestSharp = false
    try {
      // Full-page capture (CSP/CORS-resilient), then crop to the selected VIEWPORT rect (cropDataUrl adds
      // the scroll offset). Pass the capture's scale so the crop is correct even when the fetch-free
      // fallback downscaled a tall page. Best-effort: if capture fails, still open the composer to retry.
      const { dataUrl, scale, quality, blank, partial } = await safeToPngWithScale(document.body, { filter: notKlavityChrome })
      // KLAVITYKLA-473: this right-click-drag is a path QA flagged as blank on PX4/Charantra. We no longer
      // auto-invoke getDisplayMedia (the #460 surprise screen-share prompt) — instead crop as normal and
      // carry a suggestSharp hint so the composer nudges the user to the Screen button on their own click.
      shot = await cropDataUrl(dataUrl, rect, window.scrollX, window.scrollY, scale)
      shotQuality = quality
      shotSuggestSharp = !!(blank || partial) && sharpCaptureSupported()
    } catch { /* fall back to an empty composer */ }
    // KLA-412: a region shot also starts/continues an evidence session (the cropped selection becomes the
    // first shot, tagged with the current page).
    void startBugReport(shot ? { initialShot: shot, initialShotQuality: shotQuality, initialShotSuggestSharp: shotSuggestSharp } : undefined)
  }
  let reportArmed = true
  // 'off' mode: install NEITHER the right-click-drag region capture NOR the contextmenu takeover, so
  // the native browser menu is left completely untouched everywhere on the page. 'full'/'reportOnly'
  // both take over the gesture (the menu contents differ, decided in showMenu()).
  if (rightClickMode !== 'off') {
    const regionDrag = installRegionDrag({
      isOwnTarget: onOwnUi,
      mount: root,                        // draw the selection rectangle inside the widget's shadow root
      shouldIgnore: () => nativePending,  // skip pressing when next click is for the native menu
      onRightDown: dismissMenuNow,        // close any open menu immediately at mousedown
      onDragStart: dismissMenuNow,        // safety: also dismiss if menu reappeared before threshold
      onPlainRightClick: (x, y) => {
        // suppressNextMenu() is true while pressing, so contextmenu is suppressed; show menu here on mouseup.
        if (!reportArmed) return
        reportArmed = false
        setTimeout(() => { reportArmed = true }, 400)
        showMenu(x, y)
      },
      onRegion: (rect) => { void captureRegionAndOpen(rect) },
    })

    document.addEventListener("contextmenu", (e) => {
      if (e.shiftKey || nativePending) { nativePending = false; return }  // pass through to native menu
      if (isEditableTarget(e.target)) return                              // QPLANE-21: native menu carries spellcheck for fields
      if (regionDrag.suppressNextMenu()) { e.preventDefault(); return }   // pressing or drag — suppress
      if (onOwnUi(e)) return
      // Keyboard contextmenu (no preceding mousedown) — pressing is false, show menu immediately.
      e.preventDefault()
      if (!reportArmed) return
      reportArmed = false
      setTimeout(() => { reportArmed = true }, 400)
      showMenu(e.clientX, e.clientY)
    })
  }

  const banner = (text: string) => {
    let el = root.getElementById("kw-banner") as HTMLDivElement | null
    if (!el) { el = document.createElement("div"); el.id = "kw-banner"
      el.style.cssText = "max-width:240px;background:#15110d;color:#f5f3ee;border:1px solid #574f45;border-radius:10px;padding:9px 11px;font-size:12.5px;margin-bottom:8px"
      dock.appendChild(el) }
    el.textContent = text
    setTimeout(() => { if (el && el.textContent === text) el.remove() }, 6000)
  }

  // Deploy the named Sims (or "all") + boot the watch engine + fire an IMMEDIATE review.
  // Uses the anonymous /api/widget/sims endpoint so this works on client sites with no admin auth.
  async function deployAndWatch(simIds: string[] | 'all') {
    // AUTH GATE: /api/sim/review hard-requires an authenticated caller (session cookie OR bearer token).
    // On a cross-origin customer site the klavity.in session cookie isn't sent, so reviews only work with a
    // widget token. Without one the Sims would deploy and float but every review 401s silently — so run the
    // connect handshake FIRST and only deploy once we hold a real token. (First-party pages use the cookie.)
    if (!firstParty && !getToken()) {
      banner("Connect to Klavity so your Sims can review this page…")
      const token = await openConnect()
      if (!token) { banner("Sims need a Klavity connection to review this page. Deploy again to connect."); return }
    }
    _simsWatchCtrl?.stop()
    _simsWatchCtrl = null
    let sims: Array<{ id: string; name: string; initials?: string; accent?: string }> = []
    try {
      const r = await fetchWithTimeout(cfg.backendUrl + "/api/widget/sims?project=" + encodeURIComponent(cfg.projectId))
      if (r.ok) {
        const data = await r.json().catch(() => ({}))
        sims = Array.isArray(data.sims) ? data.sims : []
      }
    } catch { /* non-fatal: empty dock is guarded in sims-live.ts */ }
    _deployedSims = sims
    ;(window as any).KlavitySims?.deploy?.(simIds, sims)
    // Boot the watch engine for continuous monitoring (scroll / navigation / mutations).
    _simsWatchCtrl = startSimsWatch({
      backendUrl: cfg.backendUrl,
      projectId: cfg.projectId,
      simIds: simIds === 'all' ? undefined : simIds,
      // Live-review captures the FULL page (whole scrollHeight), not just the above-the-fold viewport,
      // so the Sim reviews the entire page — bounded by MAX_FULLPAGE_CAPTURE_HEIGHT. (KLAVITYKLA-404)
      captureViewport: () => safeToPngFullPage({ skipFonts: true, filter: notKlavityChrome }),
      bearerToken: getToken() || undefined,
    })
    // BOOT: fire an immediate review so Sims react to the current page right away (not only on next scroll).
    void bootReview(simIds)
  }

  // Capture the current viewport and POST to /api/sim/review immediately.
  // This is the "boot" review triggered right after Deploy — no waiting for scroll or mutation.
  async function bootReview(simIds: string[] | 'all') {
    try {
      const benchStart = benchNow()
      const captureStart = benchNow()
      const targetViewport = {
        scrollX: window.scrollX || 0,
        scrollY: window.scrollY || 0,
        width: window.innerWidth || 1,
        height: window.innerHeight || 1,
      }
      const shot = await Promise.race([
        // Boot review captures the FULL page (whole scrollHeight), not just the viewport, so the Sim's
        // first reaction covers the entire page — bounded by MAX_FULLPAGE_CAPTURE_HEIGHT. (KLAVITYKLA-404)
        safeToPngFullPage({ skipFonts: true, filter: notKlavityChrome }),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("capture timeout")), 10_000)),
      ])
      const captureMs = benchNow() - captureStart
      const body: Record<string, unknown> = {
        url: location.href,
        screenshotDataUrl: shot,
        domSig: null,
        adhoc: true,
        projectId: cfg.projectId,
      }
      if (simIds !== 'all') body.simIds = simIds
      const headers: Record<string, string> = { 'content-type': 'application/json' }
      if (getToken()) headers.authorization = `Bearer ${getToken()}`
      const networkStart = benchNow()
      const res = await fetchWithTimeout(cfg.backendUrl + '/api/sim/review', {
        method: 'POST', headers, credentials: 'include', body: JSON.stringify(body),
      }, SIM_REVIEW_FETCH_TIMEOUT_MS)
      // 401 on a cross-origin site means our widget token is missing/expired. Drop it and prompt a
      // reconnect instead of leaving the Sims floating but silent (the original "sims do nothing" bug).
      if (res.status === 401 && !firstParty) {
        clearToken()
        banner("Your Klavity connection expired — deploy Sims again to reconnect.")
        return
      }
      if (!res.ok) return
      const data = await res.json().catch(() => ({}))
      const networkMs = benchNow() - networkStart
      if (!data?.ok || !Array.isArray(data.reviews)) return
      const kl = (window as any).KlavitySims
      const renderStart = benchNow()
      let observations = 0
      for (const review of data.reviews) {
        const rawObs: unknown[] = Array.isArray(review.observations) ? review.observations : (Array.isArray(review.reactions) ? review.reactions : [])
        // Server returns SimObservation with .observation (text) field; sims-live.ts LiveObservation expects .text.
        const liveObs = rawObs.map((r: any) => ({
          text: r.observation ?? r.text ?? '',
          sentiment: r.sentiment,
          priority: r.priority,
          region: r.region,
          suggestedBug: r.suggestedBug,
          targetViewport,
        }))
        observations += liveObs.length
        _issueCount += liveObs.length
        try { kl?.renderFeedback?.(review.simId, review.simName ?? '', liveObs) } catch { /* never break page */ }
      }
      const renderMs = benchNow() - renderStart
      const totalMs = benchNow() - benchStart
      updateIssueCounter()
      const server = data.timing?.simReview
      const domNodes = reactionNodeCount()
      console.log(
        `[bench-sim-review] client trigger=boot captureMs=${benchMs(captureMs)} networkMs=${benchMs(networkMs)} ` +
        `serverTotalMs=${server?.totalMs ?? '?'} serverReceiveToReviewDoneMs=${server?.receiveToReviewDoneMs ?? '?'} ` +
        `serverReviewMs=${server?.reviewMs ?? '?'} renderMs=${benchMs(renderMs)} totalMs=${benchMs(totalMs)} ` +
        `sims=${data.reviews.length} observations=${observations} domNodes=${domNodes}`,
      )
    } catch { /* non-fatal: boot review is best-effort */ }
  }

  // Opens the Klavity connect popup and resolves with the minted widget token, or "" if the user
  // closed/cancelled the popup or it timed out. Awaitable so callers that require auth (Sims review)
  // can gate on a real token instead of silently 401ing. Fire-and-forget callers (report login gate)
  // still work — the token is stored via setToken() the moment it arrives.
  function openConnect(): Promise<string> {
    const u = cfg.backendUrl + "/widget-connect?project=" + encodeURIComponent(cfg.projectId)
      + "&origin=" + encodeURIComponent(location.origin)
    const w = window.open(u, "klavity-connect", "width=380,height=460")
    return new Promise<string>((resolve) => {
      let settled = false
      const finish = (token: string) => {
        if (settled) return
        settled = true
        window.removeEventListener("message", onMsg)
        clearInterval(poll)
        clearTimeout(timer)
        resolve(token)
      }
      const onMsg = (ev: MessageEvent) => {
        if (ev.origin !== cfg.backendUrl) return
        if (ev.data && ev.data.type === "klavity-widget-token" && ev.data.token) {
          setToken(ev.data.token)
          try { w && w.close() } catch {}
          finish(ev.data.token)
        }
      }
      window.addEventListener("message", onMsg)
      // User closed the popup without connecting → resolve with whatever token we have (usually "").
      const poll = setInterval(() => { if (w && w.closed) finish(getToken()) }, 500)
      // Safety: never leave an awaiting caller hanging if the popup gets stuck.
      const timer = setTimeout(() => finish(getToken()), 3 * 60_000)
    })
  }

  // Boot — SINGLE primary CTA. The floating launcher always shows "Report a bug". The Sims-review dock
  // now lives exclusively in SimsLive after "Deploy all Sims". The old authenticated mini dock rendered
  // a second avatar stack and a second review control in the same corner, so it is intentionally gone.
  ;(window as any).KlavityWidget = { mount, identify, setMetadata }

  // ── KLA-412: on load, resume a still-fresh evidence session (survives navigation) by showing the dock
  // instead of the plain launcher, so the user can keep capturing on THIS page. Best-effort + non-blocking.
  void (async () => {
    try {
      const active = await getActiveSession(cfg.projectId, evOrigin)
      if (active && active.shots.length > 0) { evSession = active; showEvDock() }
    } catch { /* IndexedDB unavailable — normal launcher stands */ }
  })()
}

// ── Non-blocking background-upload pill ─────────────────────────────────────────────────────────
// Lives at the WIDGET layer (its OWN shadow host on document.body) so it PERSISTS after the report
// modal + backdrop dismiss on Submit — the page is never blocked while a (possibly 16MB+) recording
// uploads; the user can scroll/click/file another report meanwhile. Three states:
//   • uploading — spinner + progress bar + "screenshot + recording · 9.8 / 16 MB" byte readout
//   • success   — "Report sent" + quotable ref + optional "Open in Klavity" link; auto-dismiss ~4s
//                 (hover/focus pauses — mirrors the modal's armAutodismiss / SUBMIT_AUTOCLOSE_MS)
//   • failure   — "Upload didn't finish · Retry" (Retry re-sends the RETAINED payload — no re-capture)
// A dismiss (×) is always present. Dynamic values go in via textContent/href (never innerHTML) — XSS-safe.
const PILL_AUTODISMISS_MS = 4000

function pillDisplayRef(issueKey: string): string {
  const m = /^fb_([0-9a-f]{8})[0-9a-f-]+$/i.exec(issueKey)
  return m ? "fb_" + m[1] : issueKey
}
function pillSafeHttpUrl(u: string | null | undefined): string {
  if (!u) return ""
  try { const p = new URL(u); return p.protocol === "https:" || p.protocol === "http:" ? p.href : "" } catch { return "" }
}
function fmtMB(bytes: number): string { return (bytes / 1048576).toFixed(1) }

// A rough total-bytes estimate from the retained payload, used for the pill's initial "0 / N MB"
// readout before the browser reports the real on-the-wire total. dataUrl base64 decodes to ~0.75×
// its string length; recordings carry an exact byte count.
function estimatePayloadBytes(p: { screenshots?: string[]; recordings?: Array<{ bytes: number }>; files?: Array<{ dataUrl: string }> }): number {
  let n = 0
  for (const s of p.screenshots || []) n += Math.round(s.length * 0.75)
  for (const r of p.recordings || []) n += r.bytes || 0
  for (const f of p.files || []) n += Math.round((f.dataUrl?.length || 0) * 0.75)
  return n
}
// Human label of what's riding along, e.g. "screenshot + recording".
function describePayloadParts(p: { screenshots?: string[]; recordings?: unknown[]; files?: unknown[] }): string {
  const parts: string[] = []
  if (p.screenshots && p.screenshots.length) parts.push(p.screenshots.length > 1 ? "screenshots" : "screenshot")
  if (p.recordings && p.recordings.length) parts.push(p.recordings.length > 1 ? "recordings" : "recording")
  if (p.files && p.files.length) parts.push(p.files.length > 1 ? "files" : "file")
  return parts.length ? parts.join(" + ") : "report"
}

export interface UploadPill {
  uploading: () => void
  progress: (pct: number, loaded?: number, total?: number) => void
  success: (issueKey: string, issueUrl: string) => void
  failure: (onRetry: () => void) => void
  dismiss: () => void
}

export function createUploadPill(opts: { totalBytesHint?: number; label?: string } = {}): UploadPill {
  const host = document.createElement("div")
  host.setAttribute("data-klavity-ui", "upload-pill")
  // Stack concurrent uploads so a second report filed mid-upload sits above (not on top of) the first.
  const existing = document.querySelectorAll('[data-klavity-ui="upload-pill"]').length
  host.style.cssText = `position:fixed;right:18px;bottom:${78 + existing * 58}px;z-index:2147483646;pointer-events:none`
  document.body.appendChild(host)
  const root = host.attachShadow({ mode: "open" })
  const style = document.createElement("style")
  style.textContent = `
    .pill{pointer-events:auto;position:relative;display:flex;align-items:center;gap:9px;background:#19140f;color:#fff;border-radius:12px;padding:9px 12px;box-shadow:0 10px 30px rgba(0,0,0,.28);min-width:210px;max-width:330px;font:13px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;animation:klp-in .22s cubic-bezier(.16,1,.3,1) both}
    @keyframes klp-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    @keyframes klp-sp{to{transform:rotate(360deg)}}
    .pill.out{opacity:0;transform:translateY(8px);transition:opacity .25s ease,transform .25s ease}
    .ic{width:20px;height:20px;flex:0 0 auto;display:grid;place-items:center}
    .ic svg{width:18px;height:18px}
    .spin{width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:klp-sp .8s linear infinite}
    .tx{flex:1;min-width:0}
    .tx b{font-weight:600;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .tx .sub{opacity:.72;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block}
    .x{opacity:.6;cursor:pointer;font-size:15px;line-height:1;padding:0 2px;flex:0 0 auto;user-select:none}
    .x:hover{opacity:1}
    .prog{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,.18);border-radius:0 0 12px 12px;overflow:hidden}
    .prog>i{display:block;height:100%;background:#6366f1;width:0;transition:width .2s ease}
    .pill.ok{background:#123f2a}.pill.ok .prog>i{background:#16a34a}
    .pill.err{background:#4a1620}
    a{color:#c7d2fe;text-decoration:none;font-weight:600}
    .pill.ok a{color:#a7f3d0}
    a:hover{text-decoration:underline}
    @media (prefers-reduced-motion: reduce){.pill,.spin,.prog>i{animation:none!important;transition:none!important}}
  `
  root.appendChild(style)

  const pill = document.createElement("div"); pill.className = "pill"
  const ic = document.createElement("span"); ic.className = "ic"
  const tx = document.createElement("span"); tx.className = "tx"
  const title = document.createElement("b")
  const sub = document.createElement("span"); sub.className = "sub"
  tx.append(title, sub)
  const x = document.createElement("span"); x.className = "x"; x.textContent = "×"; x.setAttribute("role", "button"); x.setAttribute("aria-label", "Dismiss"); x.title = "Dismiss"
  const prog = document.createElement("div"); prog.className = "prog"
  const progFill = document.createElement("i"); prog.appendChild(progFill)
  pill.append(ic, tx, x, prog)
  root.appendChild(pill)

  let totalBytes = opts.totalBytesHint || 0
  const label = opts.label || "report"
  let dismissTimer: ReturnType<typeof setTimeout> | null = null
  let armed = false

  const remove = () => {
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null }
    pill.classList.add("out")
    setTimeout(() => host.remove(), 260)
  }
  x.addEventListener("click", remove)

  const setSpinner = () => { ic.textContent = ""; const s = document.createElement("span"); s.className = "spin"; ic.appendChild(s) }
  const setIcon = (name: string) => { ic.innerHTML = icon(name, { size: 18 }) } // static icon SVG, no user data

  const uploading = () => {
    pill.classList.remove("ok", "err")
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null }
    armed = false
    setSpinner()
    title.textContent = "Uploading your report…"
    sub.textContent = totalBytes ? `${label} · 0 / ${fmtMB(totalBytes)} MB` : label
    prog.style.display = ""
    progFill.style.width = "0"
  }

  const progress = (pct: number, loaded?: number, total?: number) => {
    if (total) totalBytes = total
    progFill.style.width = Math.max(0, Math.min(100, pct)) + "%"
    if (typeof loaded === "number" && totalBytes) sub.textContent = `${label} · ${fmtMB(loaded)} / ${fmtMB(totalBytes)} MB`
  }

  const success = (issueKey: string, issueUrl: string) => {
    pill.classList.remove("err"); pill.classList.add("ok")
    setIcon("check-circle")
    title.textContent = "Report sent"
    progFill.style.width = "100%"
    sub.textContent = ""
    const ref = pillDisplayRef(issueKey)
    if (ref) { const r = document.createElement("span"); r.textContent = ref; sub.appendChild(r) }
    const linkUrl = pillSafeHttpUrl(issueUrl)
    if (linkUrl) {
      if (ref) sub.appendChild(document.createTextNode(" · "))
      const a = document.createElement("a"); a.href = linkUrl; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Open in Klavity ↗"
      sub.appendChild(a)
    }
    if (!ref && !linkUrl) sub.textContent = "We filed it."
    // Auto-dismiss ~4s; hover/focus pauses and resumes with only the remaining time.
    let remaining = PILL_AUTODISMISS_MS
    let started = 0
    const arm = () => { if (armed) return; armed = true; started = Date.now(); dismissTimer = setTimeout(remove, remaining) }
    const pause = () => { if (!dismissTimer) return; clearTimeout(dismissTimer); dismissTimer = null; armed = false; remaining = Math.max(0, remaining - (Date.now() - started)) }
    pill.addEventListener("mouseenter", pause)
    pill.addEventListener("mouseleave", arm)
    pill.addEventListener("focusin", pause)
    pill.addEventListener("focusout", arm)
    arm()
  }

  const failure = (onRetry: () => void) => {
    pill.classList.remove("ok"); pill.classList.add("err")
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null }
    armed = false
    setIcon("x-circle")
    title.textContent = "Upload didn't finish"
    sub.textContent = ""
    const a = document.createElement("a"); a.href = "#"; a.textContent = "Retry"
    a.addEventListener("click", (e) => { e.preventDefault(); onRetry() })
    sub.append(document.createTextNode("check your connection · "), a)
    prog.style.display = "none"
  }

  uploading()
  return { uploading, progress, success, failure, dismiss: remove }
}

export async function submitFeedback(
  cfg: { backendUrl: string; projectId: string; firstParty: boolean; token: string },
  payload: { type: string; title?: string; description: string; pageUrl: string; referrer?: string; screenshots: string[]; files?: Array<{ name: string; type: string; size: number; dataUrl: string }>; recordings?: Array<{ id: string; dataUrl: string; mime: string; durationMs: number; width: number; height: number; bytes: number; screenOnly: boolean }>; context?: ReportContext; reporter?: Reporter; clientInfo?: ClientInfo; replayEvents?: unknown[]; annotations?: any; reporterEmail?: string; turnstileToken?: string },
  // Optional progress callback: called with 0–90 during the upload phase, leaving the final 10%
  // for server-side processing. When provided, the upload uses XMLHttpRequest instead of fetch so
  // the browser exposes real upload progress events. `loaded`/`total` are the real on-the-wire bytes
  // (multipart total, incl. boundary overhead) when the browser reports them — the pill uses these for
  // its "9.8 / 16 MB" readout. Omitting onProgress (e.g. extension path) keeps plain-fetch unchanged.
  onProgress?: (pct: number, loaded?: number, total?: number) => void,
): Promise<{ issueKey: string; issueUrl: string }> {
  // Compress screenshots (PNG → JPEG, downscale very wide ones) so the upload is fast. Best-effort,
  // parallel; each falls back to its original on failure.
  const screenshots = await Promise.all(payload.screenshots.map((s) => compressScreenshot(s)))
  // Thumbnails: a tiny (≤320px, low-quality JPEG) variant per screenshot so the dashboard list loads a
  // lightweight preview instead of the full image. Index-aligned 1:1 with `screenshots` (compressScreenshot
  // falls back to its input on failure, so every entry is a valid image — worst case the thumb equals the
  // full image and simply yields no speed-up). Generated from the compressed source to reuse its decode.
  const screenshotThumbs = await Promise.all(screenshots.map((s) => buildThumbnail(s)))
  const fd = buildFeedbackForm({
    // PX4 #411: `type` carries the precise kind (bug/feature/task/query); the server maps it to report_type
    // and resolveIssueType picks the tracker issue type. Legacy callers still pass bug/feature unchanged.
    type: payload.type,
    // PX4 #411: explicit Title (when the composer had a Title field). The server prefers it over auto-title.
    title: payload.title,
    // JTBD 1.10: a screenshot-only report carries no typed prose — send an EMPTY description (not a bare
    // "[bug] " prefix) so the server takes the evidence-only branch and the AI drafts the title. Only
    // prefix the type tag when the reporter actually typed something.
    description: payload.description.trim() ? `[${payload.type}] ${payload.description}` : "",
    pageUrl: payload.pageUrl,
    referrer: payload.referrer,
    projectId: cfg.projectId,
    screenshots,
    screenshotThumbs,
    // PX4 #425: non-image file attachments carried through as their own multipart field.
    files: payload.files,
    // KLAVITYKLA-438 "Record me": video recordings carried through as their own `recording` multipart field(s).
    recordings: payload.recordings,
    context: payload.context,
    // PX4 #439/#428: reporter identity + captured browser/app info as their own /api/feedback fields.
    reporter: payload.reporter,
    clientInfo: payload.clientInfo,
    replayEvents: payload.replayEvents,
    // KLAVITYKLA-217: forward the full per-image annotation map so markup on every screenshot reaches
    // the server as annotations_json (buildFeedbackForm serializes it). Previously omitted here, which
    // silently dropped the overlay from the widget submit path.
    annotations: payload.annotations,
  })
  // Reporter identity for the "email" gate: an end-user with no Klavity account types an email so the
  // server accepts the anonymous cross-origin report and can notify them on fix.
  if (payload.reporterEmail) fd.set("reporter_email", payload.reporterEmail)
  // JTBD 1.7: Turnstile token for the anonymous submit path — the server verifies it (when
  // TURNSTILE_SECRET_KEY is set) to replace the email gate's spam-shield role. Omitted when Turnstile
  // isn't configured for the project, in which case the server's rate limits remain the only bound.
  if (payload.turnstileToken) fd.set("cf_turnstile_token", payload.turnstileToken)

  // XHR path — used when the caller wants real upload-progress events (widget submit flow).
  // fetch() gives no upload progress; XHR's upload.onprogress fires as bytes hit the wire.
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      // Report 0–90 % during the upload phase; the remaining 10 % covers server processing latency
      // so the bar never falsely reads 100 % before the response is actually received.
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) onProgress(Math.min(90, Math.round((ev.loaded / ev.total) * 90)), ev.loaded, ev.total)
      }
      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) { reject(new Error("submit failed: " + xhr.status)); return }
        try {
          const j = JSON.parse(xhr.responseText)
          // issue_url is only returned for AUTHED reporters (the server withholds it on anonymous
          // widget submissions — no dashboard access → no dashboard link on the success screen).
          resolve({ issueKey: String(j.jira_key || j.id || ""), issueUrl: String(j.issue_url || "") })
        } catch { reject(new Error("submit failed: invalid response")) }
      }
      xhr.onerror = () => reject(new Error("submit failed: network error"))
      xhr.open("POST", cfg.backendUrl + "/api/feedback")
      if (cfg.firstParty) xhr.withCredentials = true
      else if (cfg.token) xhr.setRequestHeader("authorization", "Bearer " + cfg.token)
      // else: anonymous cross-origin report — no auth header (server uses project gate + CORS).
      xhr.send(fd)
    })
  }

  // Plain fetch path (no progress callback): extension submit, or callers that manage their own UI.
  const init: RequestInit = { method: "POST", body: fd }
  if (cfg.firstParty) init.credentials = "include"
  else if (cfg.token) init.headers = { authorization: "Bearer " + cfg.token }
  const r = await fetch(cfg.backendUrl + "/api/feedback", init)
  if (!r.ok) throw new Error("submit failed: " + r.status)
  const j = await r.json()
  // Same contract as the XHR path above: issue_url only present for authed reporters.
  return { issueKey: String(j.jira_key || j.id || ""), issueUrl: String(j.issue_url || "") }
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => mount())
  else mount()
}

export { mount }
