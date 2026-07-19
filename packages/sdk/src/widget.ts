// packages/sdk/src/widget.ts
import { injectSimStyles } from "@klavity/core/sim"
import { safeToPng, safeToPngWithScale, safeToPngWithQuality } from "./capture"
import { buildModal, installRegionDrag, type ModalController } from "@klavity/core/modal"
import { cropDataUrl, type Rect } from "@klavity/core/crop"
import { planScrollStitch, clampCaptureHeight } from "./sharp-capture"
import { type CaptureBuffers } from "@klavity/core/capture"
import { installCaptureContext, buildCaptureContext } from "./capture-context"
import type { ReportContext, ReportIdentity } from "@klavity/core"
import { parseScriptConfig, isFirstParty, buildFeedbackForm, successCopy, compressScreenshot } from "./widget-lib"
import { getTurnstileToken } from "./load-turnstile"
import { icon } from "@klavity/core/icons"
import { createSessionReplay, type SessionReplay } from "./session-replay"
import { on, emit } from "./events"
import { SimsLive, type LiveObservation } from "./sims-live"  // side-effecting: auto-installs window.KlavitySims on load
import { startSimsWatch, type SimsWatchController } from "./sims-watch"

const HOST_ID = "klavity-widget-host"
const TOKEN_KEY = "klavity_widget_token"
const WIDGET_FETCH_TIMEOUT_MS = 15_000
const SIM_REVIEW_FETCH_TIMEOUT_MS = 45_000

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

// Public JS SDK (G5): window.Klavity.identify({...}) / setMetadata({...}).
export function identify(user: ReportIdentity | null) {
  _identity = user ? (coerceStrings(user as Record<string, unknown>) as ReportIdentity) : undefined
}
export function setMetadata(meta: Record<string, unknown> | null) {
  _metadata = meta ? coerceStrings(meta) : undefined
}
function buildWidgetContext(): ReportContext {
  return buildCaptureContext(_buffers, { identity: _identity, metadata: _metadata })
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

// Active watch-engine controller — torn down when Sims are undeployed.
let _simsWatchCtrl: SimsWatchController | null = null

async function mount() {
  const cfg = parseScriptConfig(currentScript())
  if (!cfg.projectId || !cfg.backendUrl) return

  // G3: start full-fidelity capture — console + fetch/XHR (core) + PerformanceObserver (longtask/paint/resource).
  installCaptureContext(_buffers)
  // G5: seed identity/metadata declared on the script tag (a later identify()/setMetadata() wins).
  if (cfg.identity && !_identity) _identity = cfg.identity
  if (cfg.metadata && !_metadata) _metadata = cfg.metadata

  const host = document.createElement("div")
  host.id = HOST_ID
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
  // Launcher display settings (from modalConfig)
  let launcherMode: 'hidden' | 'icon' | 'full' | 'custom' = 'full'
  let launcherText = 'Report a bug'
  let launcherIconColor = '#5b5bf0'
  // Right-click (context-menu) takeover mode (from modalConfig). Default 'full' preserves the
  // current behavior for existing projects. 'reportOnly' hides Sims actions from everyone; 'off'
  // leaves the native context menu untouched (no takeover at all).
  let rightClickMode: 'full' | 'reportOnly' | 'off' = 'full'
  try {
    const r = await fetchWithTimeout(cfg.backendUrl + "/api/projects/" + encodeURIComponent(cfg.projectId) + "/config")
    if (r.ok) {
      const j = await r.json()
      modalConfig = j.modalConfig || {}
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
      if (modalConfig.rightClickMode && ['full', 'reportOnly', 'off'].includes(modalConfig.rightClickMode)) {
        rightClickMode = modalConfig.rightClickMode
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
      ".kl-launcher-btn:hover{transform:translateY(-1px) scale(1.02);filter:brightness(1.06);box-shadow:0 10px 28px rgba(91,91,240,.45);}" +
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
      reportBtn.innerHTML = icon('bug')
      reportBtn.style.cssText = `position:relative;border:0;border-radius:50%;padding:10px;background:${launcherIconColor};color:#fff;font-weight:600;font-size:13px;cursor:pointer;box-shadow:0 8px 24px rgba(91,91,240,.32);display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;pointer-events:auto`
    } else {
      const label = launcherMode === 'custom' ? launcherText : 'Report a bug'
      reportBtn.innerHTML = `${icon('bug')} ${label}`
      reportBtn.style.cssText = `position:relative;border:0;border-radius:999px;padding:10px 16px;background:${launcherIconColor};color:#fff;font-weight:600;font-size:13px;cursor:pointer;box-shadow:0 8px 24px rgba(91,91,240,.32);display:inline-flex;align-items:center;gap:7px;pointer-events:auto`
    }
    // Re-attach the JS-owned indicator nodes wiped by the innerHTML overwrite. The active dot goes
    // FIRST in the flow so it sits just left of the bug icon; in icon-only mode (44px circle) there
    // is no inline room for it, so it's omitted there — the button title still says Klavity is active.
    if (effective !== 'icon') reportBtn.insertBefore(activeDot, reportBtn.firstChild)
    reportBtn.appendChild(issueBadge)
  }
  paintLauncher()
  mq.addEventListener('change', paintLauncher)
  function openReport(type: "bug" | "feature" = "bug", opts?: { initialShot?: string; initialShotQuality?: "rendered" | "wireframe"; initialDescription?: string }) {
    if (composer && (composer.shadowRoot.host as HTMLElement | null)?.isConnected) return
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
    const ctrl = buildModal(type, {
      // Auto-grab a Full Page shot the moment the modal opens — parity with the extension
      // (content.ts autoCaptureOnOpen). Captures the current page state without an extra click.
      // EXCEPT when we already have a right-click-drag region shot: that one is the default first image,
      // so we skip the full-page auto-capture and let the zoomed-in region lead.
      autoCaptureOnOpen: !opts?.initialShot,
      // JTBD 1.9: report the capture-quality tag so the composer badges the thumbnail — 'rendered' on the
      // html-to-image path, 'wireframe' when it fell back to the fetch-free painter. Degraded shots get the
      // one-tap "Retake sharp" (getDisplayMedia real-pixel path via onRetakeSharp below).
      onCaptureFull: async () => safeToPngWithQuality(document.body, { filter: (n) => (n as HTMLElement).id !== HOST_ID }),
      onRegionCapture: async (rect) => {
        // Crop the selected VIEWPORT rect out of a full-page capture. Pass the capture's scale so the rect
        // lands correctly even when the fetch-free fallback downscaled a tall page (otherwise → black).
        const { dataUrl, scale, quality } = await safeToPngWithScale(document.body, { filter: (n) => (n as HTMLElement).id !== HOST_ID })
        return { dataUrl: await cropDataUrl(dataUrl, rect, window.scrollX, window.scrollY, scale), quality }
      },
      // Sharp capture: real tab pixels via getDisplayMedia (no CORS issues, captures cross-origin images) +
      // scroll-stitch to a full-page image. Feature-detected — undefined on iOS Safari (no getDisplayMedia),
      // where the modal hides the Sharp button and users fall back to the html-to-image "Full Page" above.
      // Tagged 'real-pixel' so its thumbnail shows the sharp badge and no retake.
      onCaptureSharp: sharpCaptureSupported() ? async () => ({ dataUrl: await captureSharpFullPage(), quality: "real-pixel" as const }) : undefined,
      // JTBD 1.9: "Retake sharp" on a degraded thumbnail → the same getDisplayMedia real-pixel capture. Only
      // wired when the browser supports it (no getDisplayMedia on iOS Safari → no retake affordance shown).
      onRetakeSharp: sharpCaptureSupported() ? async () => ({ dataUrl: await captureSharpFullPage(), quality: "real-pixel" as const }) : undefined,
      requireEmail,
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
        const result = await submitFeedback(
          { backendUrl: cfg.backendUrl, projectId: cfg.projectId, firstParty, token: getToken() },
          { type: p.type as "bug" | "feature", description: p.description, pageUrl: location.href, referrer: document.referrer || "", screenshots: p.screenshots,
            context: buildWidgetContext(), replayEvents: replay.snapshot(), annotations: p.annotations,
            // Forward the gate's required email → server reporter_email. Without this, an "email"-gated
            // project rejects the submit with 400. On the default anonymous gate this is undefined (the
            // email ask moved to the post-submit success card).
            reporterEmail: p.reporterEmail, turnstileToken },
          // Drive the modal's progress fill with real XHR upload bytes — overrides the modal's own
          // estimated 10 s animation so the bar reflects actual network speed.
          (pct) => {
            const fill = composer?.shadowRoot.getElementById("klavity-progress-fill") as HTMLElement | null
            if (fill) { fill.style.transition = "width 0.15s ease"; fill.style.width = pct + "%" }
          },
        )
        // G5: fire 'submit' event after the report is stored so site code receives the ticket key.
        try { emit("submit", { issueKey: result.issueKey, issueUrl: result.issueUrl ?? null, type: p.type as "bug" | "feature" }) } catch {}
        return result
      },
      // G5: fire 'close' event whenever the composer is dismissed (Esc, overlay click, X button).
      onClose: () => emit("close", {}),
      // JTBD 1.8: attached-proof chip — tell the reporter whether a session replay will ride along.
      replayState: replayChipState(),
      success: { copy: successCopy(widget.mode, widget.ctaUrl, suppressSuccessEmail), onLead: postLead },
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
    // Right-click-drag region: load the cropped selection as the default (first) screenshot, zoomed to fit.
    // JTBD 1.9: a right-click-drag region shot is an html-to-image crop, so it carries its capture-quality
    // tag → the composer badges it (and offers "Retake sharp" when it's rendered/wireframe).
    if (opts?.initialShot) ctrl.addScreenshot(opts.initialShot, opts.initialShotQuality)
    } catch (e) { console.warn("[Klavity] failed to open the report composer:", e) }
  }
  SimsLive.onTriage = (observation, simName) => {
    openReport("bug", { initialDescription: simObservationBugDescription(observation, simName) })
  }
  // G5: expose openReport through the module-level ref so window.Klavity.open() works.
  _openReport = (type = "bug") => openReport(type as "bug" | "feature")
  reportBtn.onclick = () => openReport("bug")
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
      ".klm-hint{margin-left:auto;flex:none;font-family:ui-monospace,monospace;font-size:10px;color:#9a93a6;background:rgba(40,30,60,.06);padding:2px 7px;border-radius:20px;white-space:nowrap}" +
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
    menu.appendChild(card("zap", "Report a Bug", "Snap the page and tell us what broke.", { primary: true, onClick: () => openReport("bug") }))
    menu.appendChild(card("lightbulb", "Request a Feature", "Suggest something you'd love to see.", { onClick: () => openReport("feature") }))
    // Sims actions are member-only + 'full'-mode-only — anonymous visitors and reportOnly never see them.
    if (showSims) {
      menu.appendChild(card("users", "Deploy all Sims", "Have every Sim jump in and analyze this page.", { onClick: () => { closeMenu(); void deployAndWatch("all") } }))
      menu.appendChild(card("sparkles", "Select Sims…", "Choose which Sims jump into action.", { onClick: () => { void showSimPicker() } }))
    }
    menu.appendChild(card("monitor", "Browser menu", "", { muted: true, hint: "⇧ right-click", onClick: () => { nativePending = true; showNativeHint(x, y) } }))
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
    let shotQuality: "rendered" | "wireframe" | undefined
    try {
      // Full-page capture (CSP/CORS-resilient), then crop to the selected VIEWPORT rect (cropDataUrl adds
      // the scroll offset). Pass the capture's scale so the crop is correct even when the fetch-free
      // fallback downscaled a tall page. Best-effort: if capture fails, still open the composer to retry.
      const { dataUrl, scale, quality } = await safeToPngWithScale(document.body, { filter: (n) => (n as HTMLElement).id !== HOST_ID })
      shot = await cropDataUrl(dataUrl, rect, window.scrollX, window.scrollY, scale)
      shotQuality = quality
    } catch { /* fall back to an empty composer */ }
    openReport("bug", shot ? { initialShot: shot, initialShotQuality: shotQuality } : undefined)
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
      captureViewport: () => safeToPng(document.body, { skipFonts: true, filter: (n) => (n as HTMLElement).id !== HOST_ID }),
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
        safeToPng(document.body, { skipFonts: true, filter: (n) => (n as HTMLElement).id !== HOST_ID }),
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
}

export async function submitFeedback(
  cfg: { backendUrl: string; projectId: string; firstParty: boolean; token: string },
  payload: { type: "bug" | "feature"; description: string; pageUrl: string; referrer?: string; screenshots: string[]; context?: ReportContext; replayEvents?: unknown[]; annotations?: any; reporterEmail?: string; turnstileToken?: string },
  // Optional progress callback: called with 0–90 during the upload phase, leaving the final 10%
  // for server-side processing. When provided, the upload uses XMLHttpRequest instead of fetch so
  // the browser exposes real upload progress events. Omitting it (e.g. extension path) keeps the
  // plain-fetch behaviour unchanged.
  onProgress?: (pct: number) => void,
): Promise<{ issueKey: string; issueUrl: string }> {
  // Compress screenshots (PNG → JPEG, downscale very wide ones) so the upload is fast. Best-effort,
  // parallel; each falls back to its original on failure.
  const screenshots = await Promise.all(payload.screenshots.map((s) => compressScreenshot(s)))
  const fd = buildFeedbackForm({
    type: payload.type,
    // JTBD 1.10: a screenshot-only report carries no typed prose — send an EMPTY description (not a bare
    // "[bug] " prefix) so the server takes the evidence-only branch and the AI drafts the title. Only
    // prefix the type tag when the reporter actually typed something.
    description: payload.description.trim() ? `[${payload.type}] ${payload.description}` : "",
    pageUrl: payload.pageUrl,
    referrer: payload.referrer,
    projectId: cfg.projectId,
    screenshots,
    context: payload.context,
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
        if (ev.lengthComputable) onProgress(Math.min(90, Math.round((ev.loaded / ev.total) * 90)))
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
