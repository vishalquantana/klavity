import { safeToPng } from './capture'
import { icon } from '@klavity/core/icons'
import { safeRemove } from '@klavity/core'
import type { KlavitySettings, ReportType, SubmitReportPayload, ReportIdentity } from '@klavity/core'
import { DEFAULT_SETTINGS, DEFAULT_BACKEND_URL } from '@klavity/core'
import { installCapture, buildReportContext, type CaptureBuffers } from '@klavity/core/capture'
import { dispatchSubmit } from '@klavity/core/submit'
import { buildModal, isEditableTarget } from '@klavity/core/modal'
// KLA-720: client-direct tracker submitters (jira/linear/github/plane) removed — persist-first only.
import { submitReport as backendSubmit } from '@klavity/core/integrations/backend'
// KLA-726/729: the ONE shared right-click card renderer used by the widget + the extension. The npm/init
// SDK renders the same cards so all three surfaces converge on a single menu look (no visual drift).
import { CONTEXT_MENU_CSS, buildMenuCard } from '@klavity/core/context-menu'
// KLA-729: reuse the widget's composer helpers (no side effects) rather than duplicating them, so the
// npm SDK's composer is at parity with the in-page widget's assist + full-evidence submit.
import { captureClientInfo } from './identity'
import { recordMe, recordingSupported } from './recorder'
import { compressScreenshot, buildThumbnail } from './widget-lib'
import { record as rrwebRecord } from 'rrweb'
import { startReplayRecording, type ReplayController } from './replay-recorder'

// KLA-729: the init SDK now accepts an optional projectId so the composer's AI-assist endpoints
// (enhance/clarity/voice/known-check) and the persist-first submit are scoped to the right project.
export type SdkConfig = Partial<KlavitySettings> & { projectId?: string }

let _settings: KlavitySettings = DEFAULT_SETTINGS
// KLA-729: optional Klavity project id (set via init({ projectId })). Scopes the AI-assist endpoints.
let _projectId = ''
// Shared full-fidelity capture buffers (G2/G3) — populated by @klavity/core/capture.
const _buffers: CaptureBuffers = { consoleErrors: [], networkFailures: [] }
// Site-owner identity + custom metadata (G5), set via identify()/setMetadata().
let _identity: ReportIdentity | undefined
let _metadata: Record<string, string> | undefined
// G1 session replay: rolling rrweb buffer, attached to reports filed via the Klavity backend.
let _replay: ReplayController | null = null

// Persist-first backend base (KLA-720): the SDK always POSTs to the Klavity backend, never a tracker.
function backendBase(): string { return _settings.backendUrl || DEFAULT_BACKEND_URL }

// Small fetch-with-timeout used by the composer-assist endpoints. Every assist call is best-effort:
// callers catch and resolve null so a slow/failed endpoint never blocks the composer.
const SDK_FETCH_TIMEOUT_MS = 15_000
function fetchWithTimeout(input: string, init: RequestInit = {}, timeoutMs = SDK_FETCH_TIMEOUT_MS): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  return fetch(input, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(t))
}

function coerceStrings(obj: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    out[String(k).slice(0, 64)] = String(v).slice(0, 1000)
  }
  return out
}

async function capturePageDataUrl(): Promise<string> {
  // Route through the shared resilient renderer (modern-screenshot + CSP-safe cross-origin skip + DOM prune
  // + fetch-free wireframe fallback). safeToPng already excludes cross-origin <img>, so we only add the
  // host-node filter here. KLAVITYKLA-393.
  return safeToPng(document.body, {
    filter: (node) => (node as HTMLElement).id !== 'klavity-sdk-host',
  })
}

function buildContext(): SubmitReportPayload['context'] {
  return buildReportContext(_buffers, { identity: _identity, metadata: _metadata })
}

// KLA-729: full-payload dispatch. Forwards the SAME evidence the widget sends (title/kind/files/recordings/
// annotations/reporterEmail + reporter/clientInfo) through the shared persist-first backend submitter, which
// serializes them via @klavity/core buildFeedbackFormData. Client-direct tracker POST stays removed (KLA-720).
async function dispatchToIntegration(payload: Partial<SubmitReportPayload> & Pick<SubmitReportPayload, 'type' | 'description' | 'context' | 'screenshots'>) {
  return dispatchSubmit(
    {
      type: payload.type,
      kind: payload.kind,
      title: payload.title,
      description: payload.description,
      context: payload.context,
      screenshots: payload.screenshots,
      screenshotThumbs: payload.screenshotThumbs,
      files: payload.files,
      recordings: payload.recordings,
      annotations: payload.annotations,
      reporter: payload.reporter,
      clientInfo: payload.clientInfo,
      reporterEmail: payload.reporterEmail,
      referrer: payload.referrer,
      projectId: _projectId || undefined,
      replayEvents: payload.replayEvents,
    },
    _settings,
    { backend: backendSubmit },
  )
}

export function openModal(type: ReportType = 'bug') {
  const controller = buildModal(type, {
    onCaptureFull: capturePageDataUrl,
    // #638: render the "Attach console logs" toggle (default OFF). Console errors ride the report only when
    // the reporter opts in (p.attachConsole) — parity with the widget's privacy-preserving default.
    consoleAttachToggle: true,
    // Pre-compress each screenshot as it's captured (runs while the reporter types), same as the widget —
    // by submit time the promise is settled so there's zero compression delay before upload.
    compressImage: compressScreenshot,
    // ── KLA-729 composer AI-assist (parity with widget.ts) — all best-effort, all resolve null on failure ──
    // KLAVITYKLA-241 pre-submit known-issue check: as the reporter types, ask the backend whether this
    // project already tracks a matching issue so they don't file a blind duplicate.
    onCheckKnown: async (description: string) => {
      try {
        const res = await fetchWithTimeout(backendBase() + '/api/widget/known-check', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ project: _projectId, text: description, url: location.href }),
        })
        if (!res.ok) return null
        const data = await res.json().catch(() => null)
        return (data && data.match) ? data.match : null
      } catch { return null }
    },
    // Report-clarity coach (POST /api/report/clarity): a single short tip for the in-progress description.
    onClarityTip: async (text: string, ctx?: { images?: number }) => {
      try {
        const res = await fetchWithTimeout(backendBase() + '/api/report/clarity', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ projectId: _projectId, text, pageUrl: location.href, images: ctx?.images ?? 0, client: captureClientInfo() }),
        })
        if (!res.ok) return null
        const data = await res.json().catch(() => null)
        return (data && typeof data.tip === 'string' && data.tip) ? { tip: data.tip } : null
      } catch { return null }
    },
    // KLA-586 AI "Enhance" (POST /api/report/enhance): the reporter's one-liner + the primary shot + picked
    // element → a structured developer-ready draft. Longer timeout (vision call).
    onEnhance: async (text: string, ctx?: { images?: number; shot?: string; picked?: { selector: string; text: string } | null }) => {
      try {
        const res = await fetchWithTimeout(backendBase() + '/api/report/enhance', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ projectId: _projectId, text, pageUrl: location.href, shot: ctx?.shot || '', picked: ctx?.picked || null, images: ctx?.images ?? 0, client: captureClientInfo() }),
        }, 30_000)
        if (!res.ok) return null
        const data = await res.json().catch(() => null)
        return (data && data.draft) ? data.draft : null
      } catch { return null }
    },
    // KLA-505 server-side dictation (POST /api/voice/transcribe): the Voice button hands each mic clip here;
    // resolve null on any failure so the composer falls back to Web Speech.
    onDictate: async (audio: Blob) => {
      try {
        const fd = new FormData()
        fd.append('projectId', _projectId)
        fd.append('audio', audio, 'dictation.webm')
        if (audio.type) fd.append('mime', audio.type)
        const res = await fetchWithTimeout(backendBase() + '/api/voice/transcribe', { method: 'POST', body: fd })
        if (!res.ok) return null
        const data = await res.json().catch(() => null)
        return (data && typeof data.text === 'string') ? { text: data.text } : null
      } catch { return null }
    },
    // #647 LIVE streaming dictation: ws(s)://…/api/voice/stream?project=… — the composer PREFERS this and
    // falls back to onDictate then Web Speech on any connect failure.
    dictationStreamUrl: (() => {
      try {
        const u = new URL(backendBase() + '/api/voice/stream')
        u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:'
        u.searchParams.set('project', _projectId)
        return u.toString()
      } catch { return undefined }
    })(),
    // KLAVITYKLA-438 "Record me": expose the button when the browser can screen-record, driving the
    // consent → record overlay from the shared sdk recorder (same as the widget).
    allowRecording: (() => { try { return recordingSupported() } catch { return false } })(),
    onRecord: (onPhase?: (phase: 'consent' | 'recording' | 'preview') => void) => recordMe({ onPhase }),
    // PX4 #425: allow non-image file attachments through the unified attach control (parity with widget).
    allowFileAttachments: true,
    onSubmit: async (p) => {
      // KLA-729 full-payload parity: compress screenshots + build index-aligned thumbnails (as the widget
      // does), attach the picked-element / drawn annotations, recordings, files, the required-email gate
      // value, and the resolved reporter identity + freshly-captured client info.
      const screenshots = await Promise.all(p.screenshots.map((s) => compressScreenshot(s)))
      const screenshotThumbs = await Promise.all(screenshots.map((s) => buildThumbnail(s)))
      // #638: console logs are default-OFF — strip them from context unless the reporter opted in.
      const context = buildContext()
      if (p.attachConsole !== true) context.consoleErrors = []
      return dispatchToIntegration({
        type: p.type,
        kind: p.kind,
        title: p.title,
        description: p.description,
        context,
        screenshots,
        screenshotThumbs,
        files: p.files,
        recordings: p.recordings,
        annotations: p.annotations,
        reporterEmail: p.reporterEmail,
        reporter: _identity,
        clientInfo: captureClientInfo(),
        referrer: (typeof document !== 'undefined' && document.referrer) || undefined,
        replayEvents: _replay?.getEvents() ?? [],
      })
    },
  })

  // Auto-capture on open
  setTimeout(async () => {
    try {
      const dataUrl = await capturePageDataUrl()
      controller.addScreenshot(dataUrl)
    } catch { /* ignore */ }
  }, 200)
}

// KLA-725: the script-tag SDK must expose a DOM-detectable marker so the browser
// extension reliably YIELDS its context menu (no double right-click menu). The extension
// (isolated world) can only see the DOM, so we mount a stable, invisible host node with
// id="klavity-sdk-host" + [data-klavity-ui]. The id already matches the screenshot
// host-filter in capturePageDataUrl (excluded from captures), so this is a no-op there.
function ensureSdkMarker() {
  if (typeof document === 'undefined' || !document.body) return
  let host = document.getElementById('klavity-sdk-host')
  if (!host) {
    host = document.createElement('div')
    host.id = 'klavity-sdk-host'
    host.style.cssText = 'display:none!important;position:fixed;width:0;height:0;pointer-events:none;'
    document.body.appendChild(host)
  }
  host.setAttribute('data-klavity-ui', 'sdk')
}

function setupErrorCapture() {
  // Full-fidelity capture (G3): all console levels + all fetch/XHR requests, bounded + redacted.
  installCapture(_buffers, { consoleLevels: true })
}

// ── Public custom-metadata API (G5) ──
// window.KlavitySnap.identify({...}) / setMetadata({...}). Values are coerced to strings + capped.
export function identify(user: ReportIdentity | null) {
  _identity = user ? (coerceStrings(user as Record<string, unknown>) as ReportIdentity) : undefined
}
export function setMetadata(meta: Record<string, unknown> | null) {
  _metadata = meta ? coerceStrings(meta) : undefined
}

// KLA-729: inject the SHARED context-menu stylesheet once (id-guarded). Same CSS the widget emits into its
// shadow root and the extension emits into document.head — the single source of truth in @klavity/core.
function ensureMenuStyle() {
  if (typeof document === 'undefined') return
  if (document.getElementById('klavity-sdk-menu-anim')) return
  const s = document.createElement('style')
  s.id = 'klavity-sdk-menu-anim'
  s.textContent = CONTEXT_MENU_CSS
  ;(document.head || document.documentElement).appendChild(s)
}

// KLA-729: the right-click menu now renders with the SHARED card renderer (buildMenuCard + CONTEXT_MENU_CSS)
// so the npm/init SDK matches the widget + extension exactly. Behaviour is unchanged from the old hand-rolled
// menu: a primary "Report a Bug" card and a "Request a Feature" card, each opening the composer. The SDK
// stays lean — no Sims chips / lead-capture rows (those are embed-only in widget.ts).
function addContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    if (isEditableTarget(e.target)) return // QPLANE-21: leave native spellcheck / edit menu for fields
    e.preventDefault()
    ensureMenuStyle()

    const menu = document.createElement('div')
    menu.className = 'klm-menu'
    menu.style.cssText =
      'position:fixed;z-index:2147483647;width:200px;max-width:calc(100vw - 16px);border-radius:20px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;transform-origin:top left;padding:8px;display:flex;flex-direction:column;gap:7px;box-sizing:border-box;pointer-events:auto;' +
      'background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.95), rgba(243,236,225,.96));' +
      'border:1px solid rgba(255,255,255,.55);' +
      'box-shadow:0 24px 60px -12px rgba(76,40,130,.32), 0 8px 22px rgba(99,102,241,.16), 0 1.5px 4px rgba(25,20,15,.10), inset 0 1px 0 rgba(255,255,255,.75);'

    const card = (iconName: string, label: string, desc: string, action: ReportType, opts: { primary?: boolean } = {}) => {
      const b = buildMenuCard(document, { iconHtml: icon(iconName), label, desc, primary: opts.primary })
      b.addEventListener('click', () => { close(); openModal(action) })
      return b
    }
    menu.appendChild(card('zap', 'Report a Bug', 'Snap the page and tell us what broke.', 'bug', { primary: true }))
    menu.appendChild(card('lightbulb', 'Request a Feature', "Suggest something you'd love to see.", 'feature'))

    // Position + clamp to the viewport (measure off-screen first).
    menu.style.left = e.clientX + 'px'
    menu.style.top = '-9999px'
    document.body.appendChild(menu)
    const PAD = 8
    const left = Math.max(PAD, Math.min(e.clientX, window.innerWidth - menu.offsetWidth - PAD))
    const top = Math.max(PAD, Math.min(e.clientY, window.innerHeight - menu.offsetHeight - PAD))
    menu.style.left = left + 'px'
    menu.style.top = top + 'px'

    const close = () => { safeRemove(menu); document.removeEventListener('click', dismiss); document.removeEventListener('keydown', onEsc, true) }
    const dismiss = (ev?: Event) => { if (!ev || !menu.contains(ev.target as Node)) close() }
    const onEsc = (ev: KeyboardEvent) => { if (ev.key === 'Escape') close() }
    setTimeout(() => { document.addEventListener('click', dismiss); document.addEventListener('keydown', onEsc, true) }, 0)
  })
}

export function init(config: SdkConfig = {}) {
  _settings = {
    ...DEFAULT_SETTINGS,
    ...config,
    jira: { ...DEFAULT_SETTINGS.jira, ...config.jira },
    linear: { ...DEFAULT_SETTINGS.linear, ...config.linear },
    github: { ...DEFAULT_SETTINGS.github, ...config.github },
    plane: { ...DEFAULT_SETTINGS.plane, ...config.plane },
  }
  if (typeof config.projectId === 'string') _projectId = config.projectId
  setupErrorCapture()
  ensureSdkMarker() // KLA-725: let the extension detect this in-page SDK and yield its menu
  addContextMenu()
  // G1 session replay: start a rolling rrweb buffer (masked by default). Best-effort — a recorder
  // failure must never break host-app init. Only meaningful when reporting via the Klavity backend.
  if (!_replay) { try { _replay = startReplayRecording(rrwebRecord as any) } catch { _replay = null } }
}

// Expose on window for script-tag usage
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).KlavitySnap = { init, openModal, identify, setMetadata }
}

export { SimsLive, SimsLive as KlavitySims, installKlavitySims, type KlavitySimsAPI, type LiveObservation, type LiveSimDescriptor } from './sims-live'
export { showAnnotation, clearAnnotation, clearAnnotations, type Rect as AnnotationRect, type AnnotationOpts } from './annotation-overlay'

export default { init, openModal, identify, setMetadata }
