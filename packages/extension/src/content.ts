import type { ContentMessage, BackgroundMessage, ReportType, IssueKind, ReportFileAttachment, SubmitReportPayload, KlavConfig, KlavMonitoredProject } from '@klavity/core'
import { parseComposerOpts, type ExtComposerOpts } from './composer-opts'
import { buildModal, installRegionDrag, isEditableTarget, type ModalController, type CaptureQuality } from '@klavity/core/modal'
import { icon } from '@klavity/core/icons'
import { resolveModalConfig } from '@klavity/core/modal-theme'
import { installCapture, buildReportContext, type CaptureBuffers } from '@klavity/core/capture'
import { cropDataUrl } from '@klavity/core/crop'
import { captureFullPage } from './fullpage'
import { klavContentSig, shouldCapture, createTrailingDebounce, DEBOUNCE_MS, DEBOUNCE_MAX_WAIT_MS, ROUTE_COOLDOWN_MS, MAX_REVIEWS_PER_ROUTE, CAPTURE_BACKOFF_MS, CAPTURE_MAX_RETRIES } from './feedback-trigger'
import { widgetPresent } from './coexist'
import { makeCaptureAwaiter } from './capture-bridge'
import { parseMatchResponse } from './ext-match'
import {
  parsePageBugs,
  qaResolveCoords,
  qaStatusBucket,
  qaDeriveCounts,
  qaCountLabel,
  qaTotal,
  qaTimeAgo,
  type QaBug,
  type QaCounts,
} from './qa-mode'
import {
  chromeLocalStorage,
  getActiveSession as evGetActive,
  startOrContinue as evStartOrContinue,
  addShot as evAddShot,
  removeShot as evRemoveShot,
  clear as evClear,
  makeShot as evMakeShot,
  buildPagesTrail as evBuildPagesTrail,
  evCountText as evCountLabel,
  MAX_SHOTS as EV_MAX_SHOTS,
  type ExtEvidenceSession,
  type EvidenceStorage,
} from './evidence-store'

// ── Error + network capture ring buffer (shared @klavity/core/capture, full fidelity G3) ──
const _buffers: CaptureBuffers = { consoleErrors: [], networkFailures: [] }

// ── Context validity check & Toast helper ────────────────────────────────────
function isContextValid(): boolean {
  try {
    return typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined' && !!chrome.runtime.getManifest()
  } catch (e) {
    return false
  }
}

function showToast(message: string) {
  const existing = document.getElementById('klavity-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'klavity-toast'
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translate(-50%, 20px);
    background: #2D2A26;
    color: #FBF6EE;
    padding: 12px 20px;
    border-radius: 12px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
    z-index: 2147483647;
    opacity: 0;
    transition: opacity 0.25s ease, transform 0.25s ease;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 8px;
  `
  toast.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F4A93C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
    <span>${message}</span>
  `
  document.body.appendChild(toast)

  requestAnimationFrame(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translate(-50%, 0)'
  })

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translate(-50%, -10px)'
    setTimeout(() => toast.remove(), 250)
  }, 4000)
}

// ── Auto-file deduplication ──────────────────────────────────────────────────
// Maps a normalised error key → timestamp of last auto-filed report.
// Errors with the same key within 30 seconds are suppressed.
const AUTO_FILE_DEDUP_MS = 30_000
const recentAutoFiled = new Map<string, number>()

function maybeAutoFile(message: string, stack?: string) {
  if (!isContextValid()) return
  const key = message.slice(0, 200) // normalise to first 200 chars
  const now = Date.now()
  const last = recentAutoFiled.get(key)
  if (last !== undefined && now - last < AUTO_FILE_DEDUP_MS) return
  recentAutoFiled.set(key, now)

  // Read setting from storage; avoid blocking the error handler itself
  chrome.storage.sync.get('klavSettings', (result) => {
    const settings = result.klavSettings ?? {}
    if (!settings.autoFileErrors) return
    chrome.runtime.sendMessage({
      kind: 'AUTO_FILE_ERROR',
      message,
      stack,
      pageUrl: window.location.href,
      timestamp: now,
    } satisfies BackgroundMessage).catch(() => {})
  })
}

// Full-fidelity capture (G3): all console levels + all fetch/XHR requests, bounded + redacted.
// The onError hook preserves the extension's auto-file-on-error behavior; isContextValid keeps the
// wrappers inert after an extension reload (MV3 context invalidation).
installCapture(_buffers, {
  consoleLevels: true,
  isContextValid,
  onError: (message, stack) => maybeAutoFile(message, stack),
})

// ── Shadow DOM host ──────────────────────────────────────────────────────────
// Legacy host kept for getHost() (per Task 5 brief). The report composer now lives
// in buildModal, which owns its OWN shadow host; this one is no longer used by the
// composer but is retained as the stable host accessor.
let shadowRoot: ShadowRoot | null = null

function getHost(): ShadowRoot {
  if (!shadowRoot) {
    const host = document.createElement('div')
    host.id = 'klavity-host'
    document.body.appendChild(host)
    shadowRoot = host.attachShadow({ mode: 'open' })
  }
  return shadowRoot
}

function buildContext(): SubmitReportPayload['context'] {
  return buildReportContext(_buffers)
}

// ── Modal ────────────────────────────────────────────────────────────────────
// Only the three context-menu icons remain; the report composer (and all of its
// camera/crop/image/send/pencil/trash/close iconography) now lives in buildModal.
// Icons are sourced from the central @klavity/core icon() helper to stay in sync
// with the generated icon map (avoids path drift from hand-pasted SVGs).

// ── Report composer (now the shared buildModal) ──────────────────────────────
// The bespoke ~1000-line composer (its CSS/HTML, updateStrip, captureFullPage,
// startRegion, handlePaste, the annotator editor, and the SUBMIT_SUCCESS card)
// has been replaced by the shared buildModal. The extension now gains theming,
// region/snippet capture, paste-image, and the auto-close success card for free,
// and there is ONE composer across the widget + extension.
let modalCtrl: ModalController | null = null
// KLA-517 TOCTOU guard: `if (modalCtrl) return` checks a slot that is only FILLED after two awaits
// (fetchModalConfig → buildModal), so two rapid triggers (context-menu click + keyboard shortcut, or
// double-fire) both pass the check during that window and mount stacked composers. This boolean is the
// synchronous half of the guard: it is flipped BEFORE any await, so a re-entrant call bails immediately.
// Cleared exactly where modalCtrl is cleared (composer close/teardown) so a normal re-open still works.
let _composerOpening = false

// Resolve the active project's per-project appearance config (best-effort). Mirrors
// the SDK widget's GET /api/projects/:id/config call. Falls back to the default
// (light) theme on any failure so the modal always opens. Returns BOTH the resolved
// ModalConfig (buildModal's 3rd arg — theme/thankYou) AND the enhanced-composer opts
// (PX4 #411/#425: Title field / issue-type chips / file attachments) parsed from the
// SAME raw modalConfig.composer the widget reads — so the composer is at parity across
// the widget + extension for any project that opted in.
// video-upload: file attachments DEFAULT-ON (opt-out) even when config is missing/unreachable — mirrors
// parseComposerOpts + the widget so the "Attach file" button shows on every project by default.
const EMPTY_COMPOSER_OPTS: ExtComposerOpts = { showTitleField: false, allowFileAttachments: true }
async function fetchModalConfig(): Promise<{ config: ReturnType<typeof resolveModalConfig>; composer: ExtComposerOpts }> {
  try {
    const proj = klavMatchProject(location.href)
    const backendUrl = klavConfig?.backendUrl
    if (proj?.id && backendUrl) {
      const r = await fetch(`${backendUrl.replace(/\/+$/, '')}/api/projects/${encodeURIComponent(proj.id)}/config`)
      if (r.ok) {
        const modalConfig = (await r.json()).modalConfig || {}
        // Attribution (ext↔widget parity): mark the surface + project id so the modal's "Powered by
        // Klavity" badge carries UTM (utm_medium=extension, utm_content=<projectId>, utm_source=host).
        if (modalConfig && typeof modalConfig === 'object') {
          ;(modalConfig as any).attributionMedium = 'extension'
          ;(modalConfig as any).projectId = proj.id
        }
        return { config: resolveModalConfig(modalConfig), composer: parseComposerOpts(modalConfig) }
      }
    }
  } catch { /* default theme + classic composer */ }
  return { config: resolveModalConfig({}), composer: EMPTY_COMPOSER_OPTS }
}

// Entry point for the context menu / OPEN_MODAL / region-drag. Bug reports open in "evidence-session mode"
// (#442): the report survives cross-origin navigation via chrome.storage, so the user can minimize to the
// dock, navigate anywhere, "+ Capture here" on each page, then Resume and file ONE report with the trail.
// Feature requests stay single-page (parity with the widget). If chrome.storage is unavailable the bug
// path transparently falls back to a plain single-page composer, so nothing ever breaks.
// (Exported solely so content-openmodal.test.ts can drive it directly.)
export async function openModal(type: ReportType, initialShot?: { dataUrl: string; quality?: CaptureQuality }) {
  if (_composerOpening || modalCtrl) return // KLA-517: sync guard first — no await may run before this
  _composerOpening = true // claim the open synchronously (BEFORE any await) to close the TOCTOU window
  try {
    if (!isContextValid()) {
      showToast('Extension reloaded. Please refresh the page.')
      return
    }
    // Both paths land in openComposer (below), which does NOT re-claim — the claim above already covers
    // the whole open, including the awaits inside fetchModalConfig/buildModal.
    if (type === 'bug') { await startBugReport(initialShot); return }
    await openComposer(type, { initialShot })
  } finally {
    // Happy path: modalCtrl is set → KEEP the flag held (it now means "a composer is open/in-flight");
    // the composer's onClose clears both. Only clear here when nothing mounted (bail/error/throw), so a
    // failed open can't wedge the guard closed forever.
    if (!modalCtrl) _composerOpening = false
  }
}

// Open the shared composer. In session mode (`session` set) it wires the minimize/dock + evidence hooks and
// seeds any already-captured shots; otherwise it's the classic single-page composer.
// KLA-517: callers MUST already hold the _composerOpening claim (openModal / openComposerClaimed do).
// This function deliberately does NOT re-claim: it IS the tail of an already-claimed open.
async function openComposer(
  type: ReportType,
  opts: { initialShot?: { dataUrl: string; quality?: CaptureQuality }; session?: ExtEvidenceSession } = {},
) {
  const { config, composer } = await fetchModalConfig()
  const session = opts.session ?? null
  const seedShots = session ? session.shots.slice() : []
  const hasSeed = seedShots.length > 0
  modalCtrl = buildModal(type, {
    // Right-click-drag region: the cropped selection is the default first image, so skip the full-page
    // auto-capture and let the zoomed-in region lead. In session mode with already-captured shots, also
    // skip auto-capture (we seed those below). Otherwise auto-grab the full page on open.
    autoCaptureOnOpen: !opts.initialShot && !hasSeed,
    onCaptureFull,
    onRegionCapture,
    // JTBD 1.9: the extension's captures are already real-pixel, but wire onRetakeSharp for parity so a
    // (rare) degraded shot — or a future non-real-pixel path — can still re-capture at full quality.
    onRetakeSharp: onCaptureFull,
    // PX4 #411/#425 (ext↔widget parity): enhanced-composer opts from the project's modalConfig.composer,
    // parsed identically to the widget. All default off → classic Bug/Feature composer. When a project
    // opts in, the extension now offers the same Title field, extended issue-type chips (Bug/Feature/
    // Task/Query), and non-image file attachments the widget does; the chosen kind + title + files thread
    // through onSubmit below and are forwarded to /api/feedback (see submitViaSW → background).
    showTitleField: composer.showTitleField,
    allowFileAttachments: composer.allowFileAttachments,
    issueTypes: composer.issueTypes,
    // #442: for an evidence session, append a "Pages captured" trail (read the LATEST session so shots
    // added across pages/origins are included) and clear the session on a successful file.
    onSubmit: (p) => submitViaSW(p, session),
    // #442: minimize (─) hands off to the dock — the session is already persisted incrementally, so we
    // just close the composer and show the dock pill. Only wired in session mode.
    onMinimize: session ? () => minimizeToDock() : undefined,
    // #442: persist a shot captured INSIDE the composer (Full Page / Screen / Region / Upload / paste /
    // auto-capture), tagged with the CURRENT page. Serialized to avoid lost updates.
    onShotAdded: session ? (dataUrl: string) => { void queueEvWrite(() => persistEvShot(dataUrl)) } : undefined,
    // #442: keep the session in sync when the reporter removes a thumbnail (index-aligned with the strip).
    onShotRemoved: session ? (index: number) => removeEvShotAt(index) : undefined,
    // Reset the single-slot controller ref whenever the composer closes (so it can reopen), and for a
    // session: a plain X/Esc close (NOT a submit or a minimize) keeps any captured evidence — show the
    // dock so it isn't lost — but reaps an EMPTY session so an unused open never lingers.
    onClose: (reason?: 'submitted') => {
      modalCtrl = null
      _composerOpening = false // KLA-517: teardown clears BOTH guard halves so a fresh open works
      if (!session) return
      if (reason === 'submitted') { evMinimizing = false; return }
      if (evMinimizing) { evMinimizing = false; return } // minimizeToDock already showed the dock
      void queueEvWrite(async () => {
        const latest = await evGetActive(evStorage)
        if (latest && latest.shots.length > 0) { evSession = latest; showEvDock() }
        else { if (latest) await evClear(evStorage); evSession = null; hideEvDock() }
      })
    },
    // KLA submit-target: the "Where should this go? · Your team / Klavity" control is a WIDGET-only
    // affordance for now — the extension's submitViaSW path doesn't carry the routing flag, so we don't
    // render a control it can't honor. Explicitly disable it here (default-on everywhere else).
  }, { ...config, submitTargetToggle: false })
  // Seed the already-persisted session shots first (in order, each tagged with its page), then the
  // region-initial shot as a NEW capture (seed visually AND persist it to the session).
  for (const shot of seedShots) {
    modalCtrl.addScreenshot(shot.dataUrl, 'real-pixel', { pageUrl: shot.pageUrl, pagePath: shot.pagePath, label: shot.label })
  }
  if (opts.initialShot) {
    modalCtrl.addScreenshot(opts.initialShot.dataUrl, opts.initialShot.quality, session ? { pageUrl: location.href, pagePath: location.pathname } : undefined)
    if (session) void queueEvWrite(() => persistEvShot(opts.initialShot!.dataUrl))
  }
}

// Programmatic teardown (widget-ready takeover, minimize-to-dock). Exported for tests.
export function closeModal() {
  _composerOpening = false // KLA-517: programmatic teardown clears the opening guard too
  modalCtrl?.close()
  modalCtrl = null
}

// ── #442 multi-page evidence session + dock ──────────────────────────────────────────────────────────
// A bug report that survives cross-origin navigation: shots persist in chrome.storage.local (extension-
// scoped → shared across every origin), so the widget's IndexedDB-per-origin limitation doesn't apply.
// The content script shows a minimized DOCK when a session is active so the user keeps capturing across
// pages, then files ONE report (with a "Pages captured" trail) from the whole session on submit.
const evStorage: EvidenceStorage = chromeLocalStorage()
let evSession: ExtEvidenceSession | null = null
let evMinimizing = false // set while we deliberately close the composer to minimize (vs a plain X-close)
// Serialize session writes so concurrent adds/removes can't lose an update (read-modify-write races).
let evWriteChain: Promise<unknown> = Promise.resolve()
function queueEvWrite<T>(fn: () => Promise<T>): Promise<T> {
  const run = evWriteChain.then(fn, fn)
  evWriteChain = run.catch(() => undefined)
  return run
}
function evPage(): { href: string; pathname: string; origin: string } {
  return { href: location.href, pathname: location.pathname, origin: location.origin }
}
// Persist one composer/dock-captured shot (data URL) to the active session, tagged with the CURRENT page.
async function persistEvShot(dataUrl: string): Promise<void> {
  try {
    const shot = evMakeShot(dataUrl, evPage())
    const res = await evAddShot(evStorage, shot)
    evSession = res.session
    if (!res.ok) {
      showToast(res.reason === 'max-bytes'
        ? 'Max evidence size reached — submit or remove a shot to add more.'
        : `Max evidence reached (${EV_MAX_SHOTS} shots) — submit or remove a shot to add more.`)
    }
    updateEvDock()
  } catch { /* best-effort: a failed persist must never break capture */ }
}
// Remove the session shot at a composer strip index (indices stay aligned with seed + append order).
function removeEvShotAt(index: number): void {
  void queueEvWrite(async () => {
    const latest = await evGetActive(evStorage)
    if (!latest) return
    const target = latest.shots[index]
    if (!target) return
    evSession = await evRemoveShot(evStorage, target.id)
    updateEvDock()
  })
}
// Start (or continue) an evidence session, then open the composer in session mode. Falls back to a plain
// single-page report if chrome.storage is unavailable, so nothing breaks where storage is blocked.
async function startBugReport(initialShot?: { dataUrl: string; quality?: CaptureQuality }) {
  let session: ExtEvidenceSession | null = null
  try {
    const pid = klavMatchProject(location.href)?.id ?? klavConfig?.projects?.[0]?.id ?? ''
    session = await evStartOrContinue(evStorage, pid)
  } catch { session = null }
  if (session) evSession = session
  await openComposer('bug', session ? { initialShot, session } : { initialShot })
}

// ── The minimized dock pill (lives in its own shadow host so it never disturbs the page/QA/widget) ──
let evDockRoot: ShadowRoot | null = null
let evDockEl: HTMLElement | null = null
let evDockCount: HTMLElement | null = null
function evDockHost(): ShadowRoot {
  if (!evDockRoot) {
    const host = document.createElement('div')
    host.id = 'klavity-evdock-host'
    host.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:2147483646;'
    document.body.appendChild(host)
    evDockRoot = host.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent =
      '@keyframes kev-pop{from{transform:scale(.9);opacity:0}to{transform:none;opacity:1}}' +
      '@keyframes kev-pulse{0%{box-shadow:0 0 0 0 rgba(15,157,107,.5)}70%{box-shadow:0 0 0 8px rgba(15,157,107,0)}100%{box-shadow:0 0 0 0 rgba(15,157,107,0)}}' +
      '.kev{display:flex;align-items:center;gap:12px;background:#19140f;color:#f5f3ee;border-radius:999px;padding:9px 10px 9px 16px;box-shadow:0 24px 60px -12px rgba(25,20,15,.35);font-family:system-ui,-apple-system,sans-serif;animation:kev-pop .2s ease}' +
      '.kev-dot{width:9px;height:9px;border-radius:50%;background:#0f9d6b;animation:kev-pulse 1.6s infinite;flex:none}' +
      '.kev-lab{font-size:13px;line-height:1.25}.kev-lab b{font-weight:600}.kev-lab small{display:block;font:10px ui-monospace,monospace;color:#b3a896}' +
      '.kev-btn{border:none;border-radius:999px;padding:7px 13px;font:600 12.5px system-ui,sans-serif;cursor:pointer;transition:transform .14s ease,filter .14s ease,background .14s ease}' +
      '.kev-btn:hover{transform:translateY(-1px)}.kev-btn:active{transform:scale(.97)}' +
      '.kev-btn.cap{background:rgba(255,255,255,.12);color:#fff}.kev-btn.cap:hover{background:rgba(255,255,255,.2)}' +
      '.kev-btn.res{background:#6366f1;color:#fff}.kev-btn.res:hover{filter:brightness(1.1)}' +
      '.kev-x{border:none;background:transparent;color:#b3a896;cursor:pointer;font-size:16px;line-height:1;padding:4px 6px;border-radius:8px}.kev-x:hover{color:#fff;background:rgba(255,255,255,.12)}' +
      '@media (prefers-reduced-motion:reduce){.kev,.kev-dot{animation:none}.kev-btn{transition:none}}'
    evDockRoot.appendChild(style)
  }
  return evDockRoot
}
function updateEvDock(): void {
  if (evDockCount) evDockCount.textContent = evCountLabel(evSession)
}
function showEvDock(): void {
  if (!evSession || evSession.shots.length === 0) return
  const root = evDockHost()
  if (!evDockEl) {
    const d = document.createElement('div'); d.className = 'kev'
    const dot = document.createElement('span'); dot.className = 'kev-dot'
    const lab = document.createElement('div'); lab.className = 'kev-lab'
    const t = document.createElement('b'); t.textContent = 'Bug report in progress'
    const sub = document.createElement('small'); sub.textContent = evCountLabel(evSession); evDockCount = sub
    lab.append(t, sub)
    const cap = document.createElement('button'); cap.className = 'kev-btn cap'; cap.type = 'button'; cap.textContent = '+ Capture here'
    cap.addEventListener('click', () => void captureHereFromDock(cap))
    const res = document.createElement('button'); res.className = 'kev-btn res'; res.type = 'button'; res.textContent = 'Resume'
    res.addEventListener('click', () => void resumeEvidence())
    const x = document.createElement('button'); x.className = 'kev-x'; x.type = 'button'; x.title = 'Discard this report'; x.setAttribute('aria-label', 'Discard'); x.textContent = '×'
    x.addEventListener('click', () => void discardEvidence())
    d.append(dot, lab, cap, res, x)
    evDockEl = d
    root.appendChild(d)
  }
  evDockEl.style.display = 'flex'
  updateEvDock()
}
function hideEvDock(): void {
  if (evDockEl) evDockEl.style.display = 'none'
}
async function captureHereFromDock(btn: HTMLButtonElement): Promise<void> {
  if (!evSession) return
  const prev = btn.textContent
  btn.disabled = true
  try {
    const { dataUrl } = await onCaptureFull()
    await queueEvWrite(() => persistEvShot(dataUrl))
    btn.textContent = 'Captured'
    setTimeout(() => { btn.textContent = prev; btn.disabled = false }, 900)
  } catch {
    btn.textContent = prev; btn.disabled = false
    showToast('Could not capture this page — please try again.')
  }
}
async function resumeEvidence(): Promise<void> {
  // Refresh from storage (shots may have been added on other pages) then open the composer seeded.
  try { evSession = await evGetActive(evStorage) } catch { /* keep in-memory copy */ }
  if (!evSession) { hideEvDock(); return }
  hideEvDock()
  // KLA-517: the dock Resume button is an independent composer entry point — go through the same
  // synchronous claim so a Resume racing another trigger can't stack a second composer.
  await openComposerClaimed('bug', { session: evSession })
}

// Claim-and-open wrapper for composer entry points OUTSIDE openModal (dock Resume today; any future
// trigger tomorrow). Same synchronous claim semantics as openModal: flips _composerOpening BEFORE any
// await, keeps it held while the mounted composer stays open, clears it if nothing mounted.
async function openComposerClaimed(
  type: ReportType,
  opts: { initialShot?: { dataUrl: string; quality?: CaptureQuality }; session?: ExtEvidenceSession } = {},
) {
  if (_composerOpening || modalCtrl) return
  _composerOpening = true
  try {
    await openComposer(type, opts)
  } finally {
    if (!modalCtrl) _composerOpening = false
  }
}
async function discardEvidence(): Promise<void> {
  const s = evSession
  evSession = null
  hideEvDock()
  if (s) { try { await evClear(evStorage) } catch { /* best-effort */ } }
}
// Minimize the open composer to the dock WITHOUT losing evidence (called from the composer's onMinimize).
function minimizeToDock(): void {
  evMinimizing = true
  void queueEvWrite(async () => {
    try { evSession = await evGetActive(evStorage) } catch { /* keep copy */ }
    if (evSession && evSession.shots.length > 0) showEvDock()
  })
  try { closeModal() } catch { /* the modal removes its own host */ }
}
// On content boot (including after a cross-origin navigation), resurface the dock for a still-fresh session
// so the user's in-progress evidence is never lost.
async function evResumeDockOnBoot(): Promise<void> {
  try {
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return
    if (widgetPresent()) return // the in-page widget owns reporting (and its own dock) — never double up
    const s = await evGetActive(evStorage)
    if (s && s.shots.length > 0) { evSession = s; showEvDock() }
  } catch { /* best-effort */ }
}

// Promise bridge around the SUBMIT_REPORT → SUBMIT_SUCCESS/SUBMIT_ERROR round-trip.
// buildModal awaits this and owns the success/error UI; we only resolve/reject.
// Single-slot: at most one submit is in flight (one modal at a time).
let pendingSubmit: { resolve: (r: { issueKey: string; issueUrl: string }) => void; reject: (e: Error) => void } | null = null

async function submitViaSW(
  p: { type: ReportType; kind?: IssueKind; title?: string; description: string; screenshots: string[]; files?: ReportFileAttachment[] },
  session?: ExtEvidenceSession | null,
): Promise<{ issueKey: string; issueUrl: string }> {
  const matchedProject = klavMatchProject(location.href)
  // #442: for a multi-page evidence session, append a "Pages captured" trail listing the page each shot
  // came from (read the LATEST session so shots added across pages/origins are included). The composer
  // already supplies every image in p.screenshots (seeded + interactive), so only the trail text is added.
  let description = p.description
  if (session) {
    const latest = await evGetActive(evStorage).catch(() => null)
    const trail = evBuildPagesTrail((latest && latest.shots.length ? latest : session).shots)
    if (trail) description = (description ? description + '\n\n' : '') + trail
  }
  const payload: SubmitReportPayload = {
    type: p.type,
    // PX4 #411 (ext↔widget parity): the precise issue kind (bug/feature/task/query) the reporter chose,
    // when the composer offered the extended chips. `type` stays bug/feature for legacy consumers; the
    // background forwards `kind ?? type` as the /api/feedback `type` field — exactly what the widget sends.
    ...(p.kind ? { kind: p.kind } : {}),
    // PX4 #411: explicit one-line Title (when the composer showed the Title field). The server prefers it
    // over the auto-title and connectors use it verbatim as the external issue summary.
    ...(p.title ? { title: p.title } : {}),
    description,
    context: buildContext(),
    screenshots: [...p.screenshots],
    // PX4 #425: non-image file attachments (PDF, .log, .har, ...) the reporter added. Screenshots keep
    // their own path; these ride the /api/feedback `files` field (forwarded in the background).
    ...(p.files && p.files.length ? { files: p.files } : {}),
    ...(matchedProject?.id ? { projectId: matchedProject.id } : {}),
  }
  return new Promise((resolve, reject) => {
    pendingSubmit = { resolve, reject }
    sendToBackground({ kind: 'SUBMIT_REPORT', payload }).catch((err) => {
      if (pendingSubmit) { pendingSubmit = null; reject(err instanceof Error ? err : new Error(String(err))) }
    })
  }).then((result) => {
    // #442: the report is filed — clear the evidence session + tear down the dock so it doesn't linger.
    if (session) { evMinimizing = false; evSession = null; hideEvDock(); void evClear(evStorage) }
    return result as { issueKey: string; issueUrl: string }
  })
}

// MV3 service workers sleep and are loaded via a dynamic import (crxjs), so a cold
// SW can drop the FIRST message with "Receiving end does not exist" before its
// onMessage listener is registered. Retry briefly to let it wake. "message port
// closed" means it DID receive (the real reply arrives via a separate message).
function sendToBackground(msg: BackgroundMessage, attempt = 0): Promise<void> {
  return chrome.runtime.sendMessage(msg).then(() => {}).catch((err: unknown) => {
    const m = String((err as Error)?.message ?? err)
    if (/message port closed/i.test(m)) return
    if (attempt < 5 && /Receiving end does not exist|Could not establish connection/i.test(m)) {
      return new Promise<void>((res) => setTimeout(res, 200)).then(() => sendToBackground(msg, attempt + 1))
    }
    throw err
  })
}

// ── Capture awaiter (Task 4) ──────────────────────────────────────────────────
// Single-slot Promise bridge between the SW captureVisibleTab result and callers.
// onCaptureFull / onRegionCapture are the stable API consumed by Task 5's buildModal.
const captureAwaiter = makeCaptureAwaiter({ send: (m) => sendToBackground(m) })

// Full-page scroll-stitch (GoFullPage-style): scroll the page viewport-by-viewport, capture each frame
// via the SW's captureVisibleTab, and stitch onto a canvas — so reports get the COMPLETE page, not just
// what's on screen. Falls back to a single visible capture if stitching can't run (no canvas, errors).
// JTBD 1.9: captureVisibleTab grabs the REAL tab pixels (every image, cross-origin included), so both the
// full-page and region shots are tagged 'real-pixel' → the composer shows the sharp badge, no retake.
const onCaptureFull = async (): Promise<{ dataUrl: string; quality: 'real-pixel' }> => {
  let dataUrl: string
  try {
    dataUrl = await captureFullPage({ capture: () => captureAwaiter.captureFull() })
  } catch {
    dataUrl = await captureAwaiter.captureFull()
  }
  return { dataUrl, quality: 'real-pixel' }
}

const onRegionCapture = async (rect: { x: number; y: number; w: number; h: number }): Promise<{ dataUrl: string; quality: 'real-pixel' }> => {
  const full = await captureAwaiter.captureFull()
  const dpr = window.devicePixelRatio || 1
  const dataUrl = await cropDataUrl(full, { x: rect.x * dpr, y: rect.y * dpr, w: rect.w * dpr, h: rect.h * dpr }, window.scrollX * dpr, window.scrollY * dpr)
  return { dataUrl, quality: 'real-pixel' }
}

// ── Message listener ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg: ContentMessage) => {
  if (msg.kind === 'CAPTURE_TAB_RESULT') {
    // The composer (buildModal) consumes captures purely through the awaiter's
    // onCaptureFull/onRegionCapture; just settle the in-flight Promise.
    captureAwaiter.settle(msg.dataUrl ?? '', msg.error)
    return
  }

  if (msg.kind === 'SUBMIT_SUCCESS') {
    // Resolve the submitViaSW Promise; buildModal owns the "Filed as KEY" success card.
    pendingSubmit?.resolve({ issueKey: msg.issueKey, issueUrl: msg.issueUrl })
    pendingSubmit = null
    return
  }

  if (msg.kind === 'SUBMIT_ERROR') {
    // Reject the submitViaSW Promise; buildModal re-enables the form + shows the error.
    pendingSubmit?.reject(new Error(msg.message))
    pendingSubmit = null
    return
  }

  if (msg.kind === 'OPEN_MODAL') {
    openModal(msg.reportType)
  }

  if (msg.kind === 'KLAV_CAPTURE_REVIEW_RESULT') {
    document.dispatchEvent(new CustomEvent('klavity-review-capture', { detail: { dataUrl: msg.dataUrl, error: msg.error } }))
    return
  }

  if (msg.kind === 'KLAV_CONFIG_UPDATED') {
    klavConfig = msg.config
    // A fresh config can mean new monitored URLs / a resumed review_mode — re-evaluate.
    maybeActivate('config-update')
    return
  }

  if (msg.kind === 'KLAV_NUDGE_ROUTE') {
    klavOnRouteChange()
    return
  }

  if (msg.kind === 'KLAV_ADHOC_REVIEW') {
    void klavRunAdhoc(msg.projectId)
    return
  }
})

// ── Custom right-click menu ──────────────────────────────────────────────────
let ctxMenuEl: HTMLElement | null = null
let nativeMenuPending = false // next right-click passes through to browser

function closeCtxMenu() {
  ctxMenuEl?.remove()
  ctxMenuEl = null
}

// Brief toast guiding the user — the native menu needs a real right-click.
function showNativeHint(x: number, y: number) {
  const t = document.createElement('div')
  t.textContent = '↗ Right-click again to open the browser menu'
  t.style.cssText = `position:fixed;z-index:2147483647;left:${x}px;top:${y + 6}px;background:#1a1a1a;color:#fff;font:500 12.5px system-ui,-apple-system,sans-serif;padding:8px 13px;border-radius:9px;box-shadow:0 8px 24px rgba(0,0,0,.32);pointer-events:none;opacity:0;transition:opacity .2s;max-width:260px;`
  document.body.appendChild(t)
  requestAnimationFrame(() => { t.style.opacity = '1' })
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 250) }, 2400)
}

// Scoped keyframes for the magical context menu — kept in sync with the in-page widget
// (packages/sdk/src/widget.ts). Injected once into the page head (this menu isn't in a
// shadow root, so we id-guard and use klm-* prefixed names to avoid host-page collisions).
function ensureCtxMenuStyle() {
  if (document.getElementById('klavity-ctxmenu-anim')) return
  const s = document.createElement('style')
  s.id = 'klavity-ctxmenu-anim'
  s.textContent =
    '@keyframes klm-in{0%{opacity:0;transform:scale(.9) translateY(-8px)}100%{opacity:1;transform:scale(1) translateY(0)}}' +
    '@keyframes klm-row-in{0%{opacity:0;transform:translateY(7px)}100%{opacity:1;transform:translateY(0)}}' +
    '@keyframes klm-shine{0%{transform:translateX(-130%)}100%{transform:translateX(240%)}}' +
    '@keyframes klm-spin{to{transform:rotate(360deg)}}' +
    '.klm-menu{animation:klm-in .34s cubic-bezier(.34,1.56,.64,1) both}' +
    '.klm-row{animation:klm-row-in .34s cubic-bezier(.16,1,.3,1) both}' +
    '.klm-ic{transition:transform .2s cubic-bezier(.34,1.56,.64,1)}' +
    '.klm-row:hover .klm-ic{transform:scale(1.18) rotate(-7deg)}' +
    '.klm-shine{position:absolute;top:0;left:0;width:42%;height:100%;pointer-events:none;background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:translateX(-130%);animation:klm-shine 1s ease-out .15s both;border-radius:inherit}'
  document.head.appendChild(s)
}

function showCtxMenu(x: number, y: number) {
  closeCtxMenu()
  ensureCtxMenuStyle()

  const menu = document.createElement('div')
  ctxMenuEl = menu
  menu.className = 'klm-menu'
  // Warm cream "glass" surface with a soft Klavity-purple top glow + layered purple shadow,
  // matching the in-page widget menu. (Plain backdrop blur — not liquid-glass refraction.)
  menu.style.cssText = 'position:fixed;z-index:2147483647;min-width:236px;max-width:calc(100vw - 24px);border-radius:14px;overflow:hidden;font-family:system-ui,-apple-system,sans-serif;padding:6px;transform-origin:top left;' +
    'background:radial-gradient(135% 90% at 50% -12%, rgba(139,92,246,.18), rgba(139,92,246,0) 55%), linear-gradient(180deg, rgba(250,247,240,.96), rgba(243,236,225,.97));' +
    'border:1px solid rgba(255,255,255,.55);' +
    'box-shadow:0 24px 60px -12px rgba(76,40,130,.32),0 8px 22px rgba(99,102,241,.16),0 1.5px 4px rgba(25,20,15,.10),inset 0 1px 0 rgba(255,255,255,.75);' +
    '-webkit-backdrop-filter:blur(14px) saturate(140%);backdrop-filter:blur(14px) saturate(140%);'
  menu.style.left = `${x}px`
  menu.style.top = `${y}px`
  const shine = document.createElement('div'); shine.className = 'klm-shine'; menu.appendChild(shine)
  let rowIdx = 0

  // One consistent row builder: a fixed-width icon box so every label lines up,
  // uniform padding/gap/size, rounded hover. `muted` styles the footer affordance.
  const makeRow = (icon: string, iconColor: string, label: string, opts: { muted?: boolean; hint?: string } = {}) => {
    const btn = document.createElement('button')
    btn.className = 'klm-row'
    const muted = !!opts.muted
    btn.style.cssText = `position:relative;display:flex;align-items:center;gap:11px;width:100%;padding:9px 12px;background:transparent;border:none;border-radius:9px;cursor:pointer;text-align:left;color:${muted ? '#8a8076' : '#19140f'};font-size:${muted ? '12.5px' : '14.5px'};font-weight:${muted ? '450' : '500'};line-height:1;transition:background .18s ease,color .18s ease;animation-delay:${70 + rowIdx * 45}ms;`
    rowIdx++
    const ic = document.createElement('span')
    ic.className = 'klm-ic'
    ic.style.cssText = `display:grid;place-items:center;width:18px;height:18px;flex-shrink:0;color:${iconColor};`
    ic.innerHTML = icon
    const lab = document.createElement('span')
    lab.textContent = label
    lab.style.cssText = 'flex:1;'
    btn.append(ic, lab)
    if (opts.hint) {
      const h = document.createElement('span')
      h.textContent = opts.hint
      h.style.cssText = 'font-family:ui-monospace,monospace;font-size:11px;color:#a59a8c;flex-shrink:0;white-space:pre-line;text-align:center;line-height:1.32;'
      btn.append(h)
    }
    btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(139,92,246,.12)'; btn.style.color = '#4f46e5' })
    btn.addEventListener('mouseleave', () => { btn.style.background = 'transparent'; btn.style.color = muted ? '#8a8076' : '#19140f' })
    return btn
  }

  // Resolve the active project for Sim-deploy actions (matched URL or first configured)
  const simsProject = klavMatchProject(location.href) ?? klavConfig?.projects?.[0] ?? null

  // ── Inline Sim picker — replaces menu content in place, fetches /api/personas ──
  const showExtSimPicker = async () => {
    if (!simsProject || !klavConfig) return
    Array.from(menu.children).forEach((c) => {
      if (!(c as HTMLElement).classList.contains('klm-shine')) c.remove()
    })
    const status = document.createElement('div')
    status.style.cssText = 'display:flex;align-items:center;gap:8px;padding:12px;font-size:12.5px;color:#7c7793'
    const spinSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="animation:klm-spin .7s linear infinite;flex-shrink:0"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`
    status.innerHTML = spinSvg + ' Loading Sims…'
    menu.appendChild(status)
    let personas: Array<{ id: string; name: string; role?: string }> = []
    try {
      const r = await fetch(klavConfig.backendUrl + '/api/personas?project=' + encodeURIComponent(simsProject.id), {
        headers: { authorization: 'Bearer ' + klavConfig.token },
      })
      if (!r.ok) throw new Error()
      personas = ((await r.json()).personas || []) as typeof personas
    } catch {
      status.innerHTML = "Couldn't load Sims."
      return
    }
    if (!personas.length) { status.innerHTML = 'No Sims in this project yet.'; return }
    status.remove()
    // Header
    const hdr = document.createElement('div')
    hdr.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 8px 8px;border-bottom:1px solid rgba(99,102,241,.1);margin-bottom:4px'
    const closeBtn = document.createElement('button')
    closeBtn.innerHTML = icon('x', { size: 13 })
    closeBtn.style.cssText = 'display:grid;place-items:center;width:24px;height:24px;border:0;background:rgba(99,102,241,.1);border-radius:7px;cursor:pointer;color:#5b51c9;flex-shrink:0'
    closeBtn.addEventListener('click', () => closeCtxMenu())
    const hdrTitle = document.createElement('span')
    hdrTitle.textContent = 'Choose Sims'
    hdrTitle.style.cssText = 'font-size:13px;font-weight:650;color:#19140f'
    hdr.append(closeBtn, hdrTitle); menu.appendChild(hdr)
    const sel = new Set<string>()
    const confirmBtn = document.createElement('button')
    confirmBtn.disabled = true
    confirmBtn.style.cssText = 'width:calc(100% - 16px);margin:6px 8px 0;padding:9px;border:0;border-radius:10px;font-family:inherit;font-size:13px;font-weight:650;cursor:pointer;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;opacity:.45;transition:opacity .15s'
    confirmBtn.textContent = 'Select a Sim first'
    const syncConfirm = () => {
      const n = sel.size
      confirmBtn.disabled = n === 0
      confirmBtn.textContent = n > 0 ? `Deploy ${n} Sim${n > 1 ? 's' : ''} →` : 'Select a Sim first'
      confirmBtn.style.opacity = n > 0 ? '1' : '.45'
    }
    confirmBtn.addEventListener('click', () => {
      if (!sel.size) return
      closeCtxMenu()
      const ids = [...sel]
      const w = window as any
      if (w.KlavitySims?.deploy) { w.KlavitySims.deploy(ids) }
      else { klavSend({ kind: 'KLAV_DEPLOY_SIMS', projectId: simsProject.id, simIds: ids }).catch(() => {}) }
    })
    const list = document.createElement('div')
    list.style.cssText = 'display:flex;flex-direction:column;gap:3px;max-height:180px;overflow-y:auto;padding:0 4px'
    for (const p of personas) {
      const row = document.createElement('button')
      row.style.cssText = 'display:flex;align-items:center;gap:9px;width:100%;padding:7px 8px;background:transparent;border:1.5px solid transparent;border-radius:8px;cursor:pointer;text-align:left;font-family:inherit;color:#19140f;font-size:13.5px;font-weight:500;transition:background .14s,border-color .14s'
      const chk = document.createElement('span')
      chk.style.cssText = 'width:16px;height:16px;border-radius:4px;border:1.5px solid rgba(99,102,241,.35);display:grid;place-items:center;flex-shrink:0;transition:background .14s,border-color .14s'
      const nm = document.createElement('span')
      nm.textContent = p.name; nm.style.cssText = 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'
      row.append(chk, nm)
      if (p.role) { const rl = document.createElement('span'); rl.textContent = p.role; rl.style.cssText = 'font-size:10.5px;color:#a59a8c;white-space:nowrap'; row.appendChild(rl) }
      const setOn = (on: boolean) => {
        chk.style.background = on ? '#6366f1' : ''; chk.style.borderColor = on ? '#6366f1' : 'rgba(99,102,241,.35)'
        chk.innerHTML = on ? icon('check', { size: 10 }) : ''
        row.style.background = on ? 'rgba(99,102,241,.09)' : ''; row.style.borderColor = on ? 'rgba(99,102,241,.2)' : 'transparent'
      }
      row.addEventListener('click', () => { sel.has(p.id) ? sel.delete(p.id) : sel.add(p.id); setOn(sel.has(p.id)); syncConfirm() })
      row.addEventListener('mouseenter', () => { if (!sel.has(p.id)) row.style.background = 'rgba(99,102,241,.05)' })
      row.addEventListener('mouseleave', () => { if (!sel.has(p.id)) row.style.background = '' })
      list.appendChild(row)
    }
    menu.append(list, confirmBtn)
  }

  const actions: Array<{ icon: string; color: string; label: string; run: () => void }> = [
    { icon: icon('bug', { size: 16 }), color: '#E94F37', label: 'Report a Bug', run: () => openModal('bug') },
    { icon: icon('lightbulb', { size: 16 }), color: '#F4A93C', label: 'Request a Feature', run: () => openModal('feature') },
    { icon: icon('clipboard-list', { size: 16 }), color: '#8A837A', label: 'View submissions', run: () => { chrome.runtime.sendMessage({ kind: 'OPEN_TRACKER_URL' } satisfies BackgroundMessage).catch(() => {}) } },
  ]
  actions.forEach((a) => {
    const btn = makeRow(a.icon, a.color, a.label)
    btn.addEventListener('click', () => { closeCtxMenu(); a.run() })
    menu.appendChild(btn)
  })

  // Sims deploy entries — only shown when the extension has a configured project
  if (simsProject) {
    const deployAllBtn = makeRow(icon('users', { size: 16 }), '#7c4dff', 'Deploy all Sims')
    deployAllBtn.addEventListener('click', () => {
      closeCtxMenu()
      const w = window as any
      if (w.KlavitySims?.deploy) { w.KlavitySims.deploy('all') }
      else { klavSend({ kind: 'KLAV_DEPLOY_SIMS', projectId: simsProject.id, simIds: 'all' }).catch(() => {}) }
    })
    menu.appendChild(deployAllBtn)
    const selectSimsBtn = makeRow(icon('sparkles', { size: 16 }), '#7c4dff', 'Select Sims…')
    selectSimsBtn.addEventListener('click', () => { void showExtSimPicker() })
    menu.appendChild(selectSimsBtn)
  }

  // single divider, then the browser-menu affordance as an aligned footer row
  const divider = document.createElement('div')
  divider.style.cssText = 'height:1px;background:rgba(99,102,241,.12);margin:6px 8px;'
  menu.appendChild(divider)

  const winIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>`
  // Scripts can't open Chrome's native menu directly — arm the next right-click to pass through.
  const nativeBtn = makeRow(winIcon, '#9aa0a6', 'Show browser menu', { muted: true, hint: '⇧ right-\nclick' })
  nativeBtn.addEventListener('click', () => {
    closeCtxMenu()
    nativeMenuPending = true
    showNativeHint(x, y)
  })
  menu.appendChild(nativeBtn)

  document.body.appendChild(menu)

  // Smart-flip near the cursor, then HARD-CLAMP fully on-screen so the menu never overflows. offsetWidth/
  // Height give the true layout size (unaffected by the entrance scale animation); measured synchronously.
  {
    const M = 8
    const w = menu.offsetWidth, h = menu.offsetHeight
    const flipX = x + w > window.innerWidth - M
    let left = flipX ? x - w : x
    left = Math.max(M, Math.min(left, window.innerWidth - w - M))
    const flipY = y + h > window.innerHeight - M
    let top = flipY ? y - h : y
    top = Math.max(M, Math.min(top, window.innerHeight - h - M))
    menu.style.left = `${left}px`
    menu.style.top = `${top}px`
    menu.style.transformOrigin = `${flipY ? 'bottom ' : 'top '}${flipX ? 'right' : 'left'}`
  }

  const onOutside = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) { closeCtxMenu(); document.removeEventListener('mousedown', onOutside) }
  }
  const onEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); closeCtxMenu(); document.removeEventListener('keydown', onEsc, { capture: true }) }
  }
  setTimeout(() => {
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('keydown', onEsc, { capture: true })
  }, 0)
}

function handleContextMenu(e: MouseEvent) {
  if (!isContextValid()) {
    document.removeEventListener('contextmenu', handleContextMenu)
    showToast('Extension reloaded. Please refresh the page.')
    return
  }
  if (widgetPresent()) return // widget present → pass through to native menu; widget owns reporting
  if (e.shiftKey || nativeMenuPending) {
    nativeMenuPending = false
    return // pass through to native browser menu
  }
  if (isEditableTarget(e.target)) return // QPLANE-21: native menu carries spellcheck / cut-copy-paste for fields
  if (regionDrag.suppressNextMenu()) { e.preventDefault(); return } // a right-click-drag region just happened
  e.preventDefault()
  showCtxMenu(e.clientX, e.clientY)
}

// Right-click + DRAG to select a region → capture JUST that area → open the composer with it as the
// default (first), zoomed-in screenshot. Shares the gesture with the in-page widget (@klavity/core).
// Yields when the in-page widget is present (it owns reporting), a composer is already open, or the
// next right-click is meant for the native browser menu (nativeMenuPending).
const regionDrag = installRegionDrag({
  shouldIgnore: () => widgetPresent() || !!modalCtrl || nativeMenuPending,
  onRightDown: closeCtxMenu,    // close any open menu immediately at mousedown — prevents old menu lingering
  onDragStart: closeCtxMenu,    // safety: also dismiss if menu somehow reappeared before threshold
  onPlainRightClick: (x, y) => {
    // suppressNextMenu() is true while pressing, so contextmenu is suppressed; show the menu here on mouseup.
    if (!isContextValid()) { showToast('Extension reloaded. Please refresh the page.'); return }
    if (widgetPresent()) return
    showCtxMenu(x, y)
  },
  onRegion: async (rect) => {
    let shot: { dataUrl: string; quality: 'real-pixel' } | null = null
    try { shot = await onRegionCapture(rect) } catch { /* open empty so the user can retry */ }
    void openModal('bug', shot?.dataUrl ? shot : undefined)
  },
})

document.addEventListener('contextmenu', handleContextMenu)

// If the widget announces itself after we initialised, tear down our report UI AND
// the live-activation surface (indicator + comment bubbles); widget wins. This covers
// the race where the extension boots and renders before the deferred widget mounts.
document.addEventListener('klavity:widget-ready', () => {
  closeCtxMenu()
  if (modalCtrl) closeModal()
  hideEvDock() // widget owns reporting + its own evidence dock — hide ours so they don't stack
  klavIndicatorEl?.remove(); klavIndicatorEl = null
  klavClearBubbles()
})

// ════════════════════════════════════════════════════════════════════════════
// LIVE ACTIVATION (P3b, R5) — auto-comment on monitored URLs.
//
// Founder vision: the moment a logged-in teammate opens a monitored URL, the
// project's Sims "jump out and comment". This module:
//   1. reads the cached config (monitored patterns + review_mode + ext token);
//   2. on document_idle AND on SPA route changes, checks the current URL against
//      the allowlist patterns (mirroring the server's prefix/glob matcher);
//   3. if matched + not paused: shows a one-time CONSENT prompt, then captures the
//      visible tab and POSTs /api/sim/review via the background SW, rendering the
//      returned reactions as comment bubbles in a DEDICATED shadow-DOM host;
//   4. renders a persistent "Sims reviewing · pause" indicator (user pause = instant).
//
// Guardrails are enforced server-side (consent / allowlist / budget / dedupe);
// here we DEBOUNCE to one review per route and never auto-activate on a chrome://
// page (the content script simply isn't injected there) or without a token.
//
// MV3 honesty: the *token* and the cross-origin fetch live in the background SW.
// This content script only talks to the SW via messages, so an evicted SW is
// re-spawned on demand. We never store the token in the page.
// ════════════════════════════════════════════════════════════════════════════

let klavConfig: KlavConfig | null = null
// Server-side match result for the current URL — populated by klavFetchServerMatch().
// Used as a fallback in maybeActivate() when the cached config doesn't cover this URL.
let klavApiMatchedProject: { id: string; name: string } | null = null
let klavReviewedRoutes = new Set<string>()   // legacy compat: keeps existing usage for consent/revoke
let klavLastUrl = location.href
let klavIndicatorEl: HTMLElement | null = null
// Flattened reactions from the most recent review, kept so the user can Replay them after they
// auto-dismiss. Each entry is the same shape klavRenderBubble takes.
let klavLastReactions: Array<{ simName: string; initials: string; accent: string; observation?: string; priority?: string; citation?: any; suggestedBug?: any }> = []

// ── Per-route dedup / flood state ────────────────────────────────────────────
let klavLastSentSig: string | null = null      // sig of last confirmed-sent review
let klavCooldownUntil = 0                       // timestamp, set after confirmed review
let klavRouteCount = 0                          // reviews sent this route load
// Pending-latest slot: replaces the boolean drop-lock.
// null = no capture in flight. true = flight in progress but no new change yet.
// string = a newer sig arrived while flight was in progress; run once more on completion.
let klavPendingLatest: null | true | string = null

// Throttled console logging: the capture loop runs on every DOM change, so on busy pages (e.g. the
// dashboard) verbose per-trigger logs ("capturing…", "skip: capture failed/rate-limited") spam the
// console dozens of times a minute. klavLog collapses repeats by key to at most one line per 15s, so
// the signal survives without the noise. Best-effort and never throws.
const _klavLogLast: Record<string, number> = {}
function klavLog(key: string, ...args: unknown[]) {
  const now = Date.now()
  if (now - (_klavLogLast[key] || 0) < 15_000) return
  _klavLogLast[key] = now
  try { console.log(...args) } catch { /* never let logging break the content script */ }
}

// ── Observer handles (disconnect on route change) ─────────────────────────────
let klavMutObs: MutationObserver | null = null
let klavIntObs: IntersectionObserver | null = null
// Single trailing-edge debounce shared by both change sources (mutation + scroll).
// maxWaitMs ensures that "never settles" pages (live feeds, ticker animations) still
// get a capture once every DEBOUNCE_MAX_WAIT_MS even if mutations keep resetting the
// trailing timer, preventing perpetual capture skips on busy pages.
const klavCaptureDebounce = createTrailingDebounce(() => { void maybeActivate('detector') }, DEBOUNCE_MS, DEBOUNCE_MAX_WAIT_MS)

// ── Capture retry state ───────────────────────────────────────────────────────
// After a failed/rate-limited captureVisibleTab, schedule a back-off retry instead of
// waiting for the next organic DOM change (which may never come on a quiet page).
let klavCapRetryTimer: ReturnType<typeof setTimeout> | null = null
let klavCapRetryCount = 0
// Boot-guard: suppress the first IntersectionObserver fire when it matches the
// initial viewport (boot's maybeActivate already covers that review).
let klavBootGuard = true

// Mirror of the server's patternMatchesUrl (db.ts) — prefix/glob ONLY, no regex.
function klavNormUrl(u: string): string {
  return String(u || '').trim()
    .replace(/^https?:\/\//i, '')   // strip scheme
    .replace(/[?#].*$/, '')         // strip query + fragment (path-only, §5)
    .replace(/\/+$/, '')            // strip trailing slash
    .toLowerCase()
}
function klavPatternMatches(pattern: string, url: string): boolean {
  const p = klavNormUrl(pattern)
  const u = klavNormUrl(url)
  if (!p) return false
  if (!p.includes('*')) return u === p || u.startsWith(p + '/')
  const esc = p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
  return new RegExp('^' + esc).test(u)
}

// First accessible project whose enabled allowlist matches the current URL and is
// NOT admin-paused (review_mode 'paused'). Returns null if none — the common case.
function klavMatchProject(url: string): KlavMonitoredProject | null {
  if (!klavConfig?.token) return null
  for (const p of klavConfig.projects) {
    if (p.reviewMode === 'paused') continue
    if (p.monitoredUrls.some((pat) => klavPatternMatches(pat, url))) return p
  }
  return null
}

// Per-project user-pause flag, mirrored from the server's monitoring_consent. Stored
// locally so a pause stops activation INSTANTLY (no round-trip) and survives reloads.
function klavPauseKey(projectId: string): string { return `klavPaused:${projectId}` }
async function klavIsUserPaused(projectId: string): Promise<boolean> {
  try { const r = await chrome.storage.local.get(klavPauseKey(projectId)); return !!r[klavPauseKey(projectId)] } catch { return false }
}
async function klavSetUserPaused(projectId: string, paused: boolean): Promise<void> {
  try { await chrome.storage.local.set({ [klavPauseKey(projectId)]: paused }) } catch { /* ignore */ }
}
function klavConsentKey(projectId: string): string { return `klavConsent:${projectId}` }
async function klavHasConsent(projectId: string): Promise<boolean> {
  try { const r = await chrome.storage.local.get(klavConsentKey(projectId)); return r[klavConsentKey(projectId)] === 'granted' } catch { return false }
}
async function klavSetConsent(projectId: string, status: 'granted' | 'paused' | 'revoked'): Promise<void> {
  try { await chrome.storage.local.set({ [klavConsentKey(projectId)]: status }) } catch { /* ignore */ }
}

// Calls GET /api/extension/match?url= to discover whether the caller is a member of
// any project whose allowlist matches `url`. Result is cached in klavApiMatchedProject
// for the current URL context and cleared on route changes. Best-effort: any fetch
// or parse failure silently leaves klavApiMatchedProject at its current value (null).
async function klavFetchServerMatch(url: string): Promise<void> {
  if (!klavConfig?.token || !klavConfig?.backendUrl) return
  try {
    const base = klavConfig.backendUrl.replace(/\/+$/, '')
    const r = await fetch(
      `${base}/api/extension/match?url=${encodeURIComponent(url)}`,
      { headers: { authorization: `Bearer ${klavConfig.token}` } }
    )
    if (!r.ok) return
    klavApiMatchedProject = parseMatchResponse(await r.json())
  } catch {
    // offline / server error — keep existing value (null on first call)
  }
}

// Global Sims kill-switch (Options page). Defaults to ON: a missing/undefined flag
// means enabled, so existing installs keep working until the user explicitly opts out.
async function klavSimsEnabled(): Promise<boolean> {
  try { const r = await chrome.storage.local.get('klavSimsEnabled'); return r.klavSimsEnabled !== false } catch { return true }
}

function klavSend<T = any>(msg: BackgroundMessage): Promise<T> {
  return new Promise((resolve) => {
    try { chrome.runtime.sendMessage(msg, (resp) => { void chrome.runtime.lastError; resolve(resp as T) }) }
    catch { resolve(undefined as T) }
  })
}

// Structural fingerprint of the visible content region — tag/count based, NO raw text.
function klavRegionSig(): string {
  const selectors = ['main', '[role="main"]', 'article', '[role="feed"]', '[data-message-id]', '.message']
  const container = document.querySelector(selectors.join(','))
  if (!container) return 'no-region'
  const children = Array.from(container.children).slice(0, 20)
  return children.map((el) => el.tagName.toLowerCase() + ':' + el.children.length).join(',') || 'empty'
}

// Content signature — uses the pure klavContentSig helper (structural only, consent-safe).
function klavDomSig(): string {
  return klavContentSig({
    host: location.host,
    title: document.title || '',
    counts: {
      headings: document.querySelectorAll('h1,h2,h3,h4,h5,h6').length,
      buttons: document.querySelectorAll('button,[role="button"]').length,
      links: document.querySelectorAll('a[href]').length,
      fields: document.querySelectorAll('input,select,textarea').length,
    },
    region: klavRegionSig(),
  })
}

// ── Dedicated shadow-DOM host for Sim comment bubbles + the pause indicator ──
let klavHostRoot: ShadowRoot | null = null
function klavGetHost(): ShadowRoot {
  if (!klavHostRoot) {
    const host = document.createElement('div')
    host.id = 'klavity-sims-host'
    document.documentElement.appendChild(host)
    klavHostRoot = host.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.textContent = `
      :host{all:initial;}
      .klav-stack{position:fixed;right:18px;bottom:64px;z-index:2147483646;display:flex;flex-direction:column;gap:10px;max-width:340px;font-family:system-ui,-apple-system,sans-serif;pointer-events:none;}
      .klav-bubble{pointer-events:auto;background:#FBF6EE;color:#2D2A26;border-radius:14px;box-shadow:0 10px 34px rgba(40,30,20,.22);padding:12px 14px;border:1px solid #EFE9DE;opacity:0;transform:translateY(8px);transition:opacity .25s ease,transform .25s ease;}
      .klav-bubble.in{opacity:1;transform:translateY(0);}
      .klav-bhead{display:flex;align-items:center;gap:9px;margin-bottom:6px;}
      .klav-av{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:12px;font-weight:700;flex-shrink:0;}
      .klav-nm{font-size:13px;font-weight:700;color:#2D2A26;}
      .klav-sev{margin-left:auto;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:2px 7px;border-radius:999px;background:#F2ECE2;color:#8A6D3B;}
      .klav-obs{font-size:13px;line-height:1.4;color:#3D3833;}
      .klav-cite{margin-top:6px;font-size:11px;color:#8A837A;font-style:italic;}
      .klav-outcome{margin-top:7px;padding-top:6px;border-top:1px solid #EDE6DA;font-size:11px;font-weight:600;color:#6B655C;display:flex;align-items:center;gap:5px;}
      .klav-bclose{position:absolute;top:6px;right:8px;border:none;background:transparent;color:#B4ABA0;font-size:15px;cursor:pointer;}
      .klav-indicator{position:fixed;right:18px;bottom:18px;z-index:2147483647;pointer-events:auto;display:flex;align-items:center;gap:8px;background:#2D2A26;color:#FBF6EE;border-radius:999px;padding:7px 12px 7px 11px;box-shadow:0 6px 22px rgba(0,0,0,.28);font-family:system-ui,-apple-system,sans-serif;font-size:12.5px;font-weight:600;}
      .klav-dot{width:8px;height:8px;border-radius:50%;background:#7CD08F;box-shadow:0 0 0 0 rgba(124,208,143,.6);animation:klavpulse 1.8s infinite;}
      .klav-indicator.paused .klav-dot{background:#C9A14A;animation:none;}
      @keyframes klavpulse{0%{box-shadow:0 0 0 0 rgba(124,208,143,.55)}70%{box-shadow:0 0 0 7px rgba(124,208,143,0)}100%{box-shadow:0 0 0 0 rgba(124,208,143,0)}}
      /* "thinking" ring: while a review is in flight, a gradient arc sweeps around the whole pill. */
      .klav-indicator.reviewing::before{content:'';position:absolute;inset:-2px;border-radius:999px;z-index:-1;background:conic-gradient(from 0deg,rgba(124,208,143,0) 0deg,rgba(124,208,143,0) 200deg,#7CD08F 320deg,#BFEBCB 360deg);animation:klavspin .9s linear infinite;}
      @keyframes klavspin{to{transform:rotate(360deg)}}
      @media (prefers-reduced-motion: reduce){.klav-indicator.reviewing::before{animation-duration:2.4s;}}
      .klav-pausebtn{border:none;background:rgba(251,246,238,.14);color:#FBF6EE;border-radius:999px;padding:3px 10px;font-size:11.5px;font-weight:700;cursor:pointer;}
      .klav-pausebtn:hover{background:rgba(251,246,238,.24);}
      .klav-replaybtn{border:none;background:rgba(124,208,143,.18);color:#BFEBCB;border-radius:999px;padding:3px 10px;font-size:11.5px;font-weight:700;cursor:pointer;}
      .klav-replaybtn:hover{background:rgba(124,208,143,.30);}
      .klav-consent{position:fixed;right:18px;bottom:18px;z-index:2147483647;pointer-events:auto;max-width:330px;background:#FBF6EE;color:#2D2A26;border-radius:16px;box-shadow:0 14px 44px rgba(40,30,20,.26);border:1px solid #EFE9DE;padding:16px 16px 14px;font-family:system-ui,-apple-system,sans-serif;}
      .klav-consent h4{margin:0 0 6px;font-size:14px;}
      .klav-consent p{margin:0 0 12px;font-size:12.5px;line-height:1.45;color:#6B655C;}
      .klav-crow{display:flex;gap:8px;}
      .klav-cprimary{flex:1;border:none;background:#A98BD6;color:#fff;border-radius:10px;padding:9px;font-size:13px;font-weight:700;cursor:pointer;}
      .klav-cprimary:hover{background:#9A78CF;}
      .klav-cghost{border:none;background:#F2ECE2;color:#3D3833;border-radius:10px;padding:9px 12px;font-size:13px;font-weight:600;cursor:pointer;}
    `
    klavHostRoot.appendChild(style)
    const stack = document.createElement('div')
    stack.className = 'klav-stack'
    stack.id = 'klav-stack'
    klavHostRoot.appendChild(stack)
  }
  return klavHostRoot
}

// Sim-review reactions are LLM-generated server output (POST /api/sim/review) and the
// citation quote is lifted verbatim from page content — i.e. attacker-influencable. Every
// field below is therefore treated as untrusted and HTML-escaped before it reaches innerHTML
// (mirrors the escaping in prototype/public/klavity-sim.js's renderer). OWASP A05 / LLM05.
function klavEsc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
// Validate a screenshot/image URL before it is dropped into a CSS url() context.
// Only http(s) (or data:image) is allowed; the value is applied via element.style
// (never inline HTML) and any CSS-breaking chars are escaped so a stray quote/paren
// can't break out of url("..."). Returns '' when the URL is unusable.
function klavSafeImageUrl(u: unknown): string {
  const s = String(u ?? '').trim()
  if (!s) return ''
  try {
    const parsed = new URL(s, location.href)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
  } catch {
    if (!/^data:image\//i.test(s)) return ''
  }
  // Strip newlines/control chars, escape backslash and double-quote for the url("...") context.
  return s.replace(/[\x00-\x1f\x7f]/g, "").replace(/\\/g, "\\\\").replace(/"/g, "\\\"")
}
// Accent is dropped straight into a style attribute; allow only safe color tokens
// (#hex, rgb()/hsl(), or a CSS named color) and fall back otherwise — no attribute breakout.
function klavSafeColor(c: unknown): string {
  const s = String(c ?? '').trim()
  return /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s%]+\)|hsla?\([\d.,\s%]+\)|[a-zA-Z]{3,20})$/.test(s)
    ? s : '#A98BD6'
}

function klavRenderBubble(r: { simName: string; initials: string; accent: string; observation?: string; priority?: string; citation?: any; suggestedBug?: any }) {
  const root = klavGetHost()
  const stack = root.getElementById('klav-stack')!
  const b = document.createElement('div')
  b.className = 'klav-bubble'
  b.style.position = 'relative'
  const cite = r.citation?.sourceQuote
    ? `<div class="klav-cite">“${klavEsc(String(r.citation.sourceQuote).slice(0, 90))}”${r.citation.speaker ? ' — ' + klavEsc(r.citation.speaker) : ''}</div>` : ''
  const sev = r.priority ? `<span class="klav-sev">${klavEsc(r.priority)}</span>` : ''
  // Make the payoff legible: every reaction is persisted server-side as a ticket in the dashboard.
  const outcome = r.suggestedBug
    ? `<div class="klav-outcome">${icon('bug', { size: 14 })} Flagged as a bug · saved to your dashboard</div>`
    : `<div class="klav-outcome">${icon('meh', { size: 14 })} Noted · saved to your dashboard</div>`
  b.innerHTML = `
    <button class="klav-bclose" aria-label="Dismiss">×</button>
    <div class="klav-bhead">
      <div class="klav-av" style="background:${klavSafeColor(r.accent)}">${klavEsc((r.initials || r.simName || '?').slice(0, 2))}</div>
      <div class="klav-nm">${klavEsc(r.simName || 'Sim')}</div>${sev}
    </div>
    <div class="klav-obs">${klavEsc(r.observation || '')}</div>
    ${cite}
    ${outcome}
  `
  b.querySelector('.klav-bclose')!.addEventListener('click', () => b.remove())
  stack.appendChild(b)
  requestAnimationFrame(() => b.classList.add('in'))
  // Auto-dismiss after a while so bubbles don't pile up across routes.
  setTimeout(() => { b.classList.remove('in'); setTimeout(() => b.remove(), 300) }, 16000)
}

function klavClearBubbles() {
  const stack = klavHostRoot?.getElementById('klav-stack')
  if (stack) stack.innerHTML = ''
}

// Persistent indicator. paused=true → amber dot + "resume"; else green pulse + "pause".
function klavRenderIndicator(projectId: string, paused: boolean) {
  const root = klavGetHost()
  klavIndicatorEl?.remove()
  const el = document.createElement('div')
  el.className = 'klav-indicator' + (paused ? ' paused' : '')
  el.innerHTML = `<span class="klav-dot"></span><span>${paused ? 'Sims paused' : 'Sims reviewing'}</span><button class="klav-pausebtn">${paused ? 'Resume' : 'Pause'}</button>`
  el.querySelector('.klav-pausebtn')!.addEventListener('click', async () => {
    const nowPaused = !paused
    // Instant local stop, then mirror to the server (source of truth).
    await klavSetUserPaused(projectId, nowPaused)
    await klavSetConsent(projectId, nowPaused ? 'paused' : 'granted')
    klavRenderIndicator(projectId, nowPaused)
    if (nowPaused) klavClearBubbles()
    void klavSend({ kind: 'KLAV_CONSENT', projectId, status: nowPaused ? 'paused' : 'granted' })
    if (!nowPaused) maybeActivate('resume')
  })
  root.appendChild(el)
  klavIndicatorEl = el
  klavShowReplay()  // re-attach the Replay control after any indicator re-render (e.g. pause toggle)
}

// Toggle the "thinking" ring + label on the live indicator while a review is in flight, so it's
// visible that the Sims are actively reviewing (not just idling). Safe no-op if the indicator
// isn't mounted or is paused (a paused indicator shouldn't show in-flight motion).
function klavSetReviewing(active: boolean) {
  const el = klavIndicatorEl
  if (!el || el.classList.contains('paused')) return
  el.classList.toggle('reviewing', active)
  const label = el.querySelector('span:not(.klav-dot)')
  if (label) label.textContent = active ? 'Sims reviewing…' : 'Sims reviewing'
}

// Replay: bubbles auto-dismiss after a few seconds, so cache the last review's reactions and let the
// user re-watch them on demand. klavShowReplay adds a "Replay" button to the live indicator once
// there's something to replay; klavReplayLast clears current bubbles and re-renders them staggered.
function klavShowReplay() {
  const el = klavIndicatorEl
  if (!el || el.classList.contains('paused') || !klavLastReactions.length) return
  if (el.querySelector('.klav-replaybtn')) return
  const btn = document.createElement('button')
  btn.className = 'klav-replaybtn'
  btn.textContent = 'Replay'
  btn.title = `Replay the last review (${klavLastReactions.length} reaction${klavLastReactions.length === 1 ? '' : 's'})`
  btn.addEventListener('click', () => klavReplayLast())
  el.appendChild(btn)
}
function klavReplayLast() {
  if (!klavLastReactions.length) return
  klavClearBubbles()
  klavLastReactions.forEach((b, i) => setTimeout(() => klavRenderBubble(b), i * 450))
}

// First-capture consent prompt (gate c). Resolves true once the user grants.
function klavConsentPrompt(project: KlavMonitoredProject): Promise<boolean> {
  return new Promise((resolve) => {
    const root = klavGetHost()
    const el = document.createElement('div')
    el.className = 'klav-consent'
    el.innerHTML = `
      <h4>Let your Sims review this page?</h4>
      <p>${project.name}'s Sims can comment on <b>${location.pathname}</b>. We capture only this page (a viewport screenshot, path only — no query strings) and only on monitored URLs. You can pause anytime.</p>
      <div class="klav-crow">
        <button class="klav-cprimary">Allow Sims to review</button>
        <button class="klav-cghost">Not now</button>
      </div>`
    const done = (granted: boolean) => { el.remove(); resolve(granted) }
    el.querySelector('.klav-cprimary')!.addEventListener('click', async () => {
      await klavSetConsent(project.id, 'granted')
      void klavSend({ kind: 'KLAV_CONSENT', projectId: project.id, status: 'granted' })
      done(true)
    })
    el.querySelector('.klav-cghost')!.addEventListener('click', async () => {
      // "Not now" = user pause (don't nag again this session until they resume).
      await klavSetUserPaused(project.id, true)
      done(false)
    })
    root.appendChild(el)
  })
}

// ── Ad-hoc "Analyze this page" — per-domain consent helpers ─────────────────
// Per-domain memory for explicit "Analyze this page" runs (so we confirm only once per domain).
async function klavAdhocAllowed(domain: string): Promise<boolean> {
  try { const r = await chrome.storage.local.get('klavAdhocDomains'); return Array.isArray(r.klavAdhocDomains) && r.klavAdhocDomains.includes(domain) } catch { return false }
}
async function klavAdhocRemember(domain: string): Promise<void> {
  try {
    const r = await chrome.storage.local.get('klavAdhocDomains')
    const list: string[] = Array.isArray(r.klavAdhocDomains) ? r.klavAdhocDomains : []
    if (!list.includes(domain)) { list.push(domain); await chrome.storage.local.set({ klavAdhocDomains: list }) }
  } catch { /* non-fatal */ }
}

// One-time-per-domain confirm before an explicit ad-hoc review. Reuses the consent-card styling.
function klavAdhocConfirm(domain: string): Promise<boolean> {
  return new Promise((resolve) => {
    const root = klavGetHost()
    const el = document.createElement('div')
    el.className = 'klav-consent'
    el.innerHTML = `
      <h4>Analyse with Sims?</h4>
      <p>Your Sims will look at <b>${domain}</b>. We capture only the visible area (a viewport screenshot) and send it to Klavity to generate feedback.</p>
      <div class="klav-crow">
        <button class="klav-cprimary">Analyse</button>
        <button class="klav-cghost">Cancel</button>
      </div>`
    const done = (ok: boolean) => { el.remove(); resolve(ok) }
    el.querySelector('.klav-cprimary')!.addEventListener('click', () => done(true))
    el.querySelector('.klav-cghost')!.addEventListener('click', () => done(false))
    root.appendChild(el)
  })
}

// Explicit "Analyze this page" — bypasses the allowlist + the klavSimsEnabled kill-switch by design.
// Must be called OUTSIDE maybeActivate so it intentionally bypasses the global kill-switch.
async function klavRunAdhoc(projectId: string): Promise<void> {
  const domain = location.hostname
  if (!(await klavAdhocAllowed(domain))) {
    if (!(await klavAdhocConfirm(domain))) return
    await klavAdhocRemember(domain)
  }
  klavNotice('Sims analysing this page…')
  // klavCapture() returns { dataUrl, error, elapsed } — destructure it (see the review path at the
  // other call site). Prior bug: `const dataUrl = await klavCapture()` bound the whole OBJECT, so
  // `if (!dataUrl)` never tripped and the object (not the data: URL) was sent as screenshotDataUrl,
  // making /api/sim/review fail → the generic "Couldn't analyze this page right now."
  const { dataUrl, error: capError } = await klavCapture()
  if (!dataUrl) { klavNotice(capError === 'timeout' ? "Couldn't capture this page — try again." : "Couldn't capture this page — check the extension can access this site."); return }
  const resp = await klavSend<{ ok: boolean; status: number; body: any }>({
    kind: 'KLAV_REVIEW', projectId, url: location.href, domSig: klavDomSig(), screenshotDataUrl: dataUrl, adhoc: true,
  })
  const body = resp?.body || {}
  if (resp?.ok && Array.isArray(body.reviews)) {
    let n = 0
    for (const rv of body.reviews) for (const r of (rv.reactions || [])) {
      klavRenderBubble({ simName: rv.simName, initials: rv.initials, accent: rv.accent, observation: r.observation, priority: r?.suggestedBug?.priority, citation: r.citation, suggestedBug: r?.suggestedBug }); n++
    }
    if (n === 0) klavNotice('Your Sims had nothing to flag on this page.')
  } else if (body.reason === 'budgetExhausted') {
    klavNotice("Sims hit today’s review budget — try again tomorrow.")
  } else if (body.reason === 'noConfig') {
    klavNotice('Sign in from the Klavity popup first.')
  } else {
    klavNotice("Couldn’t analyze this page right now.")
  }
}

// Capture the visible tab via the background SW (token + captureVisibleTab live there).
// Returns elapsed time so callers can distinguish a fast error (rate-limit / permission)
// from a slow one (SW eviction / timeout) and choose retry strategy accordingly.
function klavCapture(): Promise<{ dataUrl: string | null; error: string | null; elapsed: number }> {
  const start = Date.now()
  return new Promise((resolve) => {
    const onResult = (ev: Event) => {
      const { dataUrl, error } = (ev as CustomEvent).detail as { dataUrl: string; error?: string }
      resolve({ dataUrl: dataUrl || null, error: error || null, elapsed: Date.now() - start })
    }
    document.addEventListener('klavity-review-capture', onResult, { once: true })
    void klavSend({ kind: 'KLAV_CAPTURE_REVIEW' })
    setTimeout(() => {
      document.removeEventListener('klavity-review-capture', onResult)
      resolve({ dataUrl: null, error: 'timeout', elapsed: Date.now() - start })
    }, 4000)
  })
}

// A small, non-spammy notice (used for budgetExhausted / admin-paused gate replies).
function klavNotice(text: string) {
  const root = klavGetHost()
  const stack = root.getElementById('klav-stack')!
  const n = document.createElement('div')
  n.className = 'klav-bubble in'
  n.style.position = 'relative'
  n.innerHTML = `<div class="klav-obs" style="color:#6B655C">${klavEsc(text)}</div>`
  stack.appendChild(n)
  setTimeout(() => { n.classList.remove('in'); setTimeout(() => n.remove(), 300) }, 6000)
}

// ── The activation entry point (pending-latest slot, shouldCapture gating). ──
async function maybeActivate(reason: string) {
  // Coexistence: if the page already embeds the Klavity widget, it owns the whole
  // Klavity experience (reporting + lead-gen). The extension yields entirely — no
  // "Sims reviewing" indicator, no auto-review — so we don't double up in the same
  // corner or fight the widget's right-click. Widget always wins. (See coexist.ts;
  // the right-click handler and klavity:widget-ready listener already yield too.)
  if (widgetPresent()) {
    klavIndicatorEl?.remove(); klavIndicatorEl = null
    klavClearBubbles()
    return
  }

  // If a capture is already in flight, store the latest sig for a follow-up run.
  if (klavPendingLatest !== null) {
    // Record a newer sig for the follow-up run; 'true' means in-flight, no new sig yet.
    const latestSig = klavDomSig()
    if (klavPendingLatest === true) klavPendingLatest = latestSig
    else klavPendingLatest = latestSig  // always overwrite with newest
    return
  }

  // Global kill-switch (Options page). When off: no activation, no capture, no
  // consent card, no "Sims reviewing" indicator. Checked early so it's a true
  // global off — per-project consent/pause logic below only runs when enabled.
  if (!(await klavSimsEnabled())) {
    klavIndicatorEl?.remove(); klavIndicatorEl = null
    return
  }

  if (!klavConfig?.token) return
  if (document.visibilityState !== 'visible') return

  const url = location.href
  let project = klavMatchProject(url)
  // Server-match fallback: if the local cache doesn't cover this URL but the server
  // confirmed membership, synthesize a minimal project descriptor and activate.
  if (!project && klavApiMatchedProject) {
    project = {
      id: klavApiMatchedProject.id,
      name: klavApiMatchedProject.name,
      reviewMode: 'auto',   // optimistic; server re-gates on /api/sim/review
      monitoredUrls: [],    // server already confirmed the URL match — no client re-check needed
    }
  }
  // Off-allowlist: tear down indicator and stop.
  if (!project) { klavIndicatorEl?.remove(); klavIndicatorEl = null; return }
  klavLog('active', `[Klavity] active on monitored URL (trigger: ${reason}) · project=${project.id} · ${location.pathname}`)

  const paused = await klavIsUserPaused(project.id)
  klavRenderIndicator(project.id, paused)
  if (paused) { console.log('[Klavity] skip: user-paused'); return }

  // Pre-gate using shouldCapture (pure function — no async side-effects).
  const preSig = klavDomSig()
  const preDecision = shouldCapture({
    nowSig: preSig,
    lastSentSig: klavLastSentSig,
    now: Date.now(),
    cooldownUntil: klavCooldownUntil,
    paused,
    routeCount: klavRouteCount,
    cap: MAX_REVIEWS_PER_ROUTE,
  })
  if (!preDecision.capture) { console.log(`[Klavity] skip (pre-capture): ${preDecision.reason}`); return }

  // Gate c (client mirror): first capture needs consent. Server re-checks authoritatively.
  if (!(await klavHasConsent(project.id))) {
    const granted = await klavConsentPrompt(project)
    if (!granted) return
  }

  // Mark flight in progress.
  klavPendingLatest = true
  const routeKey = klavNormUrl(url)
  try {
    klavLog('capturing', `[Klavity] change detected (${reason}) → capturing viewport…`)
    const { dataUrl, error: capError, elapsed: capElapsed } = await klavCapture()

    if (!dataUrl) {
      // Distinguish rate-limit (fast error < 500ms from Chrome's ~2/s cap) from genuine
      // failures (SW evicted, permission denied, 4s timeout). Both log differently and
      // both schedule an automatic back-off retry so a quiet page still gets analysed.
      const isRateLimit = capElapsed < 500  // fast response → Chrome refused, not a timeout
      const kind = isRateLimit ? 'rate-limited' : (capError === 'timeout' ? 'timed out' : `failed (${capError ?? 'unknown'})`)
      klavLog('capfail', `[Klavity] capture ${kind} — scheduling retry`)

      if (klavCapRetryCount < CAPTURE_MAX_RETRIES) {
        klavCapRetryCount++
        if (klavCapRetryTimer !== null) clearTimeout(klavCapRetryTimer)
        klavCapRetryTimer = setTimeout(() => {
          klavCapRetryTimer = null
          void maybeActivate('capture-retry')
        }, CAPTURE_BACKOFF_MS)
      } else {
        klavLog('capfail-final', `[Klavity] capture failed after ${CAPTURE_MAX_RETRIES} retries — will try on next page change`)
        klavCapRetryCount = 0
      }
      return
    }

    // Successful capture — reset retry counter.
    klavCapRetryCount = 0
    if (klavCapRetryTimer !== null) { clearTimeout(klavCapRetryTimer); klavCapRetryTimer = null }

    // Compute sig AFTER captureVisibleTab returns — same DOM moment as the pixels.
    const postSig = klavDomSig()

    // If the DOM changed during the capture, reschedule and don't post a mismatched sig.
    if (postSig !== preSig) {
      // Treat as a new pending change; exit and let the follow-up slot handle it.
      console.log('[Klavity] DOM changed during capture — rescheduling')
      klavPendingLatest = postSig
      return
    }

    // Post-capture gate: re-verify (cooldown/sig may have changed while we awaited).
    const postDecision = shouldCapture({
      nowSig: postSig,
      lastSentSig: klavLastSentSig,
      now: Date.now(),
      cooldownUntil: klavCooldownUntil,
      paused,
      routeCount: klavRouteCount,
      cap: MAX_REVIEWS_PER_ROUTE,
    })
    if (!postDecision.capture) { console.log(`[Klavity] skip (post-capture): ${postDecision.reason}`); return }

    console.log('[Klavity] posting review → server (Sims reviewing…)')
    klavSetReviewing(true)
    let resp: { ok: boolean; status: number; body: any } | null = null
    try {
      resp = await klavSend<{ ok: boolean; status: number; body: any }>({
        kind: 'KLAV_REVIEW', projectId: project.id, url, domSig: postSig, screenshotDataUrl: dataUrl,
      })
    } finally {
      klavSetReviewing(false)  // always clear the thinking ring, success or failure
    }
    const body = resp?.body || {}
    if (resp?.ok && Array.isArray(body.reviews)) {
      const nReactions = body.reviews.reduce((n: number, rv: any) => n + (rv.reactions?.length || 0), 0)
      console.log(`[Klavity] review done — ${body.reviews.length} sim(s), ${nReactions} reaction(s) rendered`)
      // Confirmed review: now arm cooldown, record sig, increment count.
      klavLastSentSig = postSig
      klavCooldownUntil = Date.now() + ROUTE_COOLDOWN_MS
      klavRouteCount++
      klavReviewedRoutes.add(routeKey)
      const flat: typeof klavLastReactions = []
      for (const rv of body.reviews) {
        for (const r of (rv.reactions || [])) {
          const bubble = { simName: rv.simName, initials: rv.initials, accent: rv.accent, observation: r.observation, priority: r?.suggestedBug?.priority, citation: r.citation, suggestedBug: r?.suggestedBug }
          flat.push(bubble)
          klavRenderBubble(bubble)
        }
      }
      // Cache for Replay so the user can re-watch the reactions after they auto-dismiss.
      if (flat.length) { klavLastReactions = flat; klavShowReplay() }
    } else if (body.reason === 'alreadyReviewed') {
      console.log('[Klavity] already reviewed this view (dedup) — no new feedback')
      // Server says already reviewed — count it so we don't keep hammering.
      klavLastSentSig = postSig
      klavCooldownUntil = Date.now() + ROUTE_COOLDOWN_MS
      klavRouteCount++
      klavReviewedRoutes.add(routeKey)
    } else if (body.reason === 'needsConsent') {
      console.log('[Klavity] server: needs consent — will re-prompt')
      // server says no consent on record — clear local cache so we re-prompt next route.
      await klavSetConsent(project.id, 'revoked')
      klavReviewedRoutes.delete(routeKey)
    } else if (body.reason === 'budgetExhausted') {
      console.log('[Klavity] server: daily review budget exhausted — paused')
      klavNotice("Sims hit today's review budget — paused until tomorrow.")
      klavRenderIndicator(project.id, true)
    } else if (body.reason === 'paused' || body.reason === 'userPaused') {
      console.log(`[Klavity] server: ${body.reason}`)
      klavRenderIndicator(project.id, true)
    } else {
      console.log(`[Klavity] no review (reason: ${body.reason || 'unknown'})`)
    }
    // 'offAllowlist' / other → silent (no spam).
  } finally {
    const pendingNext = klavPendingLatest
    // Clear the slot BEFORE any follow-up to avoid re-entrant loops.
    klavPendingLatest = null
    // If a newer sig arrived while we were in flight, run once more.
    if (typeof pendingNext === 'string') {
      void maybeActivate('pending-latest')
    }
  }
}

// ── Tear down both observers (call before re-arming on route change or pause). ─
function klavDisarmObservers() {
  if (klavMutObs) { klavMutObs.disconnect(); klavMutObs = null }
  if (klavIntObs) { klavIntObs.disconnect(); klavIntObs = null }
  klavCaptureDebounce.cancel()
  // Cancel any pending capture retry so stale retries don't fire after navigation.
  if (klavCapRetryTimer !== null) { clearTimeout(klavCapRetryTimer); klavCapRetryTimer = null }
  klavCapRetryCount = 0
}

// ── Arm MutationObserver + IntersectionObserver on the content region. ────────
function klavArmObservers() {
  klavDisarmObservers()

  // --- MutationObserver: watch main content subtree for dynamic updates. ---
  const target = document.querySelector('main,[role="main"],article,body') ?? document.body
  klavMutObs = new MutationObserver((_mutations) => {
    // Each mutation batch resets the shared trailing-edge debounce — so a stream
    // of updates fires ONE review ~DEBOUNCE_MS after it settles, not mid-stream.
    klavCaptureDebounce.schedule()
  })
  klavMutObs.observe(target, { childList: true, subtree: true, characterData: false, attributes: false })

  // --- IntersectionObserver: scroll-reveal of content blocks. ---
  const ioSelectors = [
    'main', '[role="main"]', 'article',
    '[role="feed"] > *', '[data-message-id]', '.message',
  ]
  const observeTargets = Array.from(
    document.querySelectorAll<Element>(ioSelectors.join(','))
  )
  if (observeTargets.length > 0) {
    klavIntObs = new IntersectionObserver((entries) => {
      const anyVisible = entries.some((e) => e.isIntersecting)
      if (!anyVisible) return
      // Suppress the very first fire (boot's maybeActivate already handles it).
      if (klavBootGuard) { klavBootGuard = false; return }
      klavCaptureDebounce.schedule()
    }, { threshold: 0.5 })
    for (const el of observeTargets) klavIntObs.observe(el)
  }
}

// ── SPA navigation backstop. The static <all_urls> content script fires once at
//    document_idle; SPAs swap routes without a reload, so we also watch history +
//    poll location as a backstop (tabs.onUpdated is the background-side complement).
function klavOnRouteChange() {
  if (location.href === klavLastUrl) return
  klavLastUrl = location.href
  klavClearBubbles()

  // Reset per-route state.
  klavLastSentSig = null
  klavCooldownUntil = 0
  klavRouteCount = 0
  klavPendingLatest = null
  klavBootGuard = false  // boot guard is per-page-load only; new routes fire freely

  // Reset server match for the new route and re-query asynchronously.
  klavApiMatchedProject = null
  void klavFetchServerMatch(location.href)

  // Tear down observers, re-arm on the new route's DOM (after a tick so the SPA
  // has finished rendering enough of the new route to find the content region).
  klavDisarmObservers()
  setTimeout(klavArmObservers, 200)

  void maybeActivate('spa-nav')

  // QA mode: the URL (hence the page's bug set) changed — re-fetch after the SPA
  // has settled so pins reflect the new route.
  if (klavQaActive) setTimeout(() => { void klavQaRefresh() }, 250)
}
;(function klavPatchHistory() {
  const wrap = (fn: any) => function (this: any, ...args: any[]) { const r = fn.apply(this, args); queueMicrotask(klavOnRouteChange); return r }
  history.pushState = wrap(history.pushState)
  history.replaceState = wrap(history.replaceState)
  window.addEventListener('popstate', klavOnRouteChange)
  // Polling backstop for SPAs that mutate the URL without History API (rare but real).
  setInterval(klavOnRouteChange, 1500)
})()

// ════════════════════════════════════════════════════════════════════════════
// QA MODE (KLA #441) — authenticated, team-gated on-page bug review overlay.
//
// A signed-in Klavity team member toggles "QA mode" in the popup; the flag lives in
// chrome.storage.local (klavQaMode) so it fans out to every open tab. When active on
// a page whose project the user is a MEMBER of, we fetch the bugs reported for THIS
// url and render them as coloured pins (positioned by coords) + a bottom QA bar +
// a side list for coordless bugs. Clicking a pin/row opens a review popover with a
// "Mark working & close" action that POSTs /api/feedback/:id/qa-close (team-gated),
// optimistically flipping the pin green.
//
// Gating is layered: the overlay only arms when signed in (klavConfig.token); the
// page-bugs endpoint returns 403 when the user isn't a project member, and we hide
// QA mode silently for that tab. Reporters (no extension / not a member) never see
// any of this — it is entirely separate from the anonymous report widget, lives in
// its OWN shadow host, and is torn down if the page widget announces itself is NOT
// required (QA mode is an authenticated extension surface, orthogonal to the widget).
// ════════════════════════════════════════════════════════════════════════════

const QA_STORAGE_KEY = 'klavQaMode'
let klavQaActive = false
let klavQaBugs: QaBug[] = []
let klavQaCounts: QaCounts = { open: 0, inProgress: 0, done: 0 }
let klavQaProjectId: string | null = null
let klavQaHostRoot: ShadowRoot | null = null
let klavQaOpenId: string | null = null           // id of the bug whose popover is open
let klavQaLoading = false
const klavQaClosing = new Set<string>()          // bug ids with an in-flight qa-close request

function klavQaColor(bucket: 'open' | 'prog' | 'done'): string {
  return bucket === 'done' ? '#16a34a' : bucket === 'prog' ? '#d97706' : '#dc2626'
}

// Dedicated shadow host — isolated from page CSS AND from the Sims/report hosts.
function klavQaGetHost(): ShadowRoot {
  if (klavQaHostRoot) return klavQaHostRoot
  const host = document.createElement('div')
  host.id = 'klavity-qa-host'
  document.documentElement.appendChild(host)
  klavQaHostRoot = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = `
    :host{all:initial;}
    *{box-sizing:border-box;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;}
    .kqa-pinlayer{position:absolute;top:0;left:0;width:0;height:0;z-index:2147483640;pointer-events:none;}
    .kqa-pin{position:absolute;width:26px;height:26px;border-radius:50% 50% 50% 2px;transform:rotate(-45deg) scale(0);transform-origin:center;display:grid;place-items:center;color:#fff;font-size:12px;font-weight:800;box-shadow:0 3px 10px rgba(0,0,0,.34);border:2px solid #fff;cursor:pointer;pointer-events:auto;transition:transform .16s cubic-bezier(.34,1.56,.64,1),box-shadow .16s ease;}
    .kqa-pin.in{transform:rotate(-45deg) scale(1);}
    .kqa-pin:hover{transform:rotate(-45deg) scale(1.16);box-shadow:0 5px 16px rgba(0,0,0,.4);z-index:1;}
    .kqa-pin span{transform:rotate(45deg);pointer-events:none;line-height:1;}
    .kqa-pin.kqa-closing{animation:kqapop .5s cubic-bezier(.34,1.56,.64,1) forwards;}
    @keyframes kqapop{0%{transform:rotate(-45deg) scale(1);}45%{transform:rotate(-45deg) scale(1.4);}100%{transform:rotate(-45deg) scale(1);}}
    .kqa-tip{position:absolute;z-index:2147483643;pointer-events:none;background:#19140f;color:#fff;font-size:11.5px;font-weight:500;padding:5px 9px;border-radius:7px;max-width:230px;box-shadow:0 6px 18px rgba(0,0,0,.3);opacity:0;transform:translateY(3px);transition:opacity .14s,transform .14s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .kqa-tip.in{opacity:1;transform:translateY(0);}
    .kqa-bar{position:fixed;left:50%;bottom:18px;transform:translateX(-50%) translateY(14px);z-index:2147483642;display:flex;align-items:center;gap:11px;background:#19140f;color:#fbf6ee;border-radius:999px;padding:8px 8px 8px 15px;box-shadow:0 10px 34px rgba(0,0,0,.34);font-size:12.5px;font-weight:600;opacity:0;transition:opacity .28s ease,transform .28s cubic-bezier(.34,1.4,.6,1);pointer-events:auto;max-width:min(94vw,640px);}
    .kqa-bar.in{opacity:1;transform:translateX(-50%) translateY(0);}
    .kqa-bar .kqa-brand{display:flex;align-items:center;gap:7px;font-weight:800;}
    .kqa-bar .kqa-brand .kqa-dot{width:8px;height:8px;border-radius:50%;background:#6366f1;box-shadow:0 0 0 0 rgba(99,102,241,.6);animation:kqapulse 2s infinite;}
    @keyframes kqapulse{0%{box-shadow:0 0 0 0 rgba(99,102,241,.5)}70%{box-shadow:0 0 0 7px rgba(99,102,241,0)}100%{box-shadow:0 0 0 0 rgba(99,102,241,0)}}
    .kqa-badge{background:#6366f1;border-radius:999px;padding:1px 9px;font-weight:800;font-size:11px;}
    .kqa-break{opacity:.62;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .kqa-you{opacity:.72;font-size:11px;font-weight:500;white-space:nowrap;}
    .kqa-barbtn{border:none;background:rgba(251,246,238,.14);color:#fbf6ee;border-radius:999px;width:26px;height:26px;display:grid;place-items:center;cursor:pointer;flex:0 0 auto;transition:background .14s,transform .12s;}
    .kqa-barbtn:hover{background:rgba(251,246,238,.26);transform:scale(1.06);}
    .kqa-barbtn:active{transform:scale(.94);}
    .kqa-panel{position:fixed;right:16px;top:74px;bottom:76px;width:288px;max-width:82vw;z-index:2147483641;display:flex;flex-direction:column;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:14px;box-shadow:0 16px 44px rgba(28,22,40,.2);overflow:hidden;opacity:0;transform:translateX(12px);transition:opacity .26s ease,transform .26s cubic-bezier(.34,1.4,.6,1);}
    .kqa-panel.in{opacity:1;transform:translateX(0);}
    .kqa-ph{padding:11px 13px;border-bottom:1px solid #e3ddd1;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#6366f1;font-weight:800;display:flex;align-items:center;gap:7px;}
    .kqa-plist{overflow-y:auto;padding:7px;display:flex;flex-direction:column;gap:6px;}
    .kqa-row{display:flex;gap:9px;align-items:flex-start;padding:9px 10px;border-radius:10px;background:#fffdf8;border:1px solid #ece7dd;cursor:pointer;transition:transform .12s,box-shadow .14s,border-color .14s;text-align:left;}
    .kqa-row:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(28,22,40,.1);border-color:#d7cfbf;}
    .kqa-row:active{transform:scale(.99);}
    .kqa-sev{width:9px;height:9px;border-radius:50%;flex:0 0 auto;margin-top:4px;}
    .kqa-rmain{min-width:0;flex:1;}
    .kqa-rtitle{font-size:12.5px;font-weight:600;color:#19140f;line-height:1.3;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
    .kqa-rmeta{font-size:10.5px;color:#574f45;margin-top:3px;}
    .kqa-empty{margin:auto;padding:26px 18px;text-align:center;color:#574f45;font-size:12.5px;line-height:1.5;}
    .kqa-empty b{color:#19140f;display:block;font-size:13.5px;margin-bottom:3px;}
    .kqa-empty .kqa-spark{font-size:26px;display:block;margin-bottom:8px;}
    /* review popover */
    .kqa-pop{position:fixed;z-index:2147483645;width:308px;max-width:92vw;background:#f5f3ee;border:1px solid #e3ddd1;border-radius:14px;box-shadow:0 20px 54px rgba(28,22,40,.24);overflow:hidden;opacity:0;transform:translateY(8px) scale(.98);transform-origin:top center;transition:opacity .18s ease,transform .18s cubic-bezier(.34,1.5,.6,1);}
    .kqa-pop.in{opacity:1;transform:translateY(0) scale(1);}
    .kqa-poph{display:flex;align-items:center;gap:8px;padding:11px 13px;border-bottom:1px solid #e3ddd1;}
    .kqa-poph b{font-size:13px;color:#19140f;line-height:1.3;flex:1;min-width:0;}
    .kqa-st{margin-left:auto;font-size:10px;font-weight:800;padding:2px 8px;border-radius:999px;text-transform:uppercase;letter-spacing:.03em;flex:0 0 auto;}
    .kqa-popb{padding:11px 13px;}
    .kqa-meta{font-size:11.5px;color:#574f45;margin-bottom:9px;}
    .kqa-thumb{height:118px;border-radius:9px;border:1px solid #e3ddd1;background:linear-gradient(135deg,#ece7dd,#f7f4ec);margin-bottom:11px;background-size:cover;background-position:center top;}
    .kqa-actions{display:flex;gap:7px;flex-wrap:wrap;}
    .kqa-btn{padding:8px 12px;border-radius:9px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:700;font-size:12px;cursor:pointer;color:#19140f;display:inline-flex;align-items:center;gap:6px;transition:transform .12s,box-shadow .14s,background .14s;}
    .kqa-btn:hover{transform:translateY(-1px);box-shadow:0 5px 14px rgba(28,22,40,.12);}
    .kqa-btn:active{transform:scale(.97);}
    .kqa-btn.kqa-primary{background:#16a34a;border-color:#16a34a;color:#fff;}
    .kqa-btn.kqa-primary:hover{background:#12903f;}
    .kqa-btn.kqa-ghost{background:none;border-color:transparent;color:#574f45;}
    .kqa-btn[disabled]{opacity:.6;cursor:default;transform:none;box-shadow:none;}
    .kqa-done-card{padding:26px 16px;text-align:center;}
    .kqa-check{width:52px;height:52px;border-radius:50%;background:#16a34a;display:grid;place-items:center;margin:0 auto 12px;color:#fff;animation:kqapop .5s cubic-bezier(.34,1.56,.64,1);}
    .kqa-done-card b{font-size:14px;color:#19140f;}
    .kqa-done-card p{margin:5px 0 0;font-size:12px;color:#574f45;}
    @media (prefers-reduced-motion: reduce){.kqa-pin,.kqa-bar,.kqa-panel,.kqa-pop,.kqa-tip{transition-duration:.01ms;}.kqa-pin.kqa-closing,.kqa-check{animation-duration:.01ms;}.kqa-brand .kqa-dot{animation:none;}}
  `
  klavQaHostRoot.appendChild(style)
  const pinlayer = document.createElement('div'); pinlayer.className = 'kqa-pinlayer'; pinlayer.id = 'kqa-pinlayer'
  klavQaHostRoot.appendChild(pinlayer)
  return klavQaHostRoot
}

// Resolve the project id for the current site: config allowlist match first, then the
// server match result, then the popup-selected project, then the first project. The
// page-bugs 403 is the real membership gate — this just supplies a candidate id.
async function klavQaResolveProjectId(): Promise<string | null> {
  const matched = klavMatchProject(location.href)?.id || klavApiMatchedProject?.id
  if (matched) return matched
  try {
    const r = await chrome.storage.local.get('klavSelectedProjectId')
    if (r.klavSelectedProjectId) return r.klavSelectedProjectId as string
  } catch { /* ignore */ }
  return klavConfig?.projects?.[0]?.id ?? null
}

type QaFetchResult = { ok: true; bugs: QaBug[]; counts: QaCounts } | { ok: false; status: number }
async function klavQaFetch(): Promise<QaFetchResult> {
  const base = klavConfig?.backendUrl?.replace(/\/+$/, '')
  const token = klavConfig?.token
  if (!base || !token) return { ok: false, status: 0 }
  const pid = await klavQaResolveProjectId()
  if (!pid) return { ok: false, status: 0 }
  klavQaProjectId = pid
  try {
    const r = await fetch(
      `${base}/api/projects/${encodeURIComponent(pid)}/page-bugs?url=${encodeURIComponent(location.href)}`,
      { headers: { authorization: `Bearer ${token}` } },
    )
    if (!r.ok) return { ok: false, status: r.status }
    const parsed = parsePageBugs(await r.json().catch(() => ({})))
    return { ok: true, bugs: parsed.bugs, counts: parsed.counts }
  } catch {
    return { ok: false, status: 0 }
  }
}

// Toggle handler + boot entry: fetch and render, or hide gracefully on 403 / no project.
async function klavQaActivate(): Promise<void> {
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return
  if (!klavConfig?.token) return // not signed in — never render for anonymous reporters
  klavQaActive = true
  klavQaLoading = true
  klavQaRenderBar() // instant feedback (loading pill) while the fetch runs
  const res = await klavQaFetch()
  klavQaLoading = false
  if (!klavQaActive) return // toggled off mid-flight
  if (!res.ok) {
    // 403 = not a project member → hide QA on this tab silently (reporters unaffected).
    // Any other failure (offline/no project) → also stay quiet rather than nag.
    klavQaTeardown()
    return
  }
  klavQaBugs = res.bugs
  klavQaCounts = res.counts
  klavQaRender()
}

function klavQaDeactivate(): void {
  klavQaActive = false
  klavQaTeardown()
}

// Re-fetch on SPA route change (the URL — hence the bug set — changed).
async function klavQaRefresh(): Promise<void> {
  if (!klavQaActive) return
  klavQaClosePopover()
  const res = await klavQaFetch()
  if (!klavQaActive) return
  if (!res.ok) { klavQaTeardown(); return }
  klavQaBugs = res.bugs
  klavQaCounts = res.counts
  klavQaRender()
}

function klavQaTeardown(): void {
  klavQaOpenId = null
  const root = klavQaHostRoot
  if (!root) return
  root.getElementById('kqa-bar')?.remove()
  root.getElementById('kqa-panel')?.remove()
  root.getElementById('kqa-pop')?.remove()
  root.getElementById('kqa-tip')?.remove()
  const pl = root.getElementById('kqa-pinlayer'); if (pl) pl.innerHTML = ''
}

function klavQaRender(): void {
  klavQaRenderBar()
  klavQaRenderPins()
  klavQaRenderPanel()
}

function klavQaMeEmail(): string {
  return klavConfig?.email || 'you'
}

function klavQaRenderBar(): void {
  const root = klavQaGetHost()
  root.getElementById('kqa-bar')?.remove()
  const bar = document.createElement('div')
  bar.className = 'kqa-bar'; bar.id = 'kqa-bar'
  const total = qaTotal(klavQaCounts)
  const you = klavQaMeEmail().split('@')[0]
  if (klavQaLoading) {
    bar.innerHTML = `<span class="kqa-brand"><span class="kqa-dot"></span>QA mode</span><span class="kqa-break">Loading bugs on this page...</span>`
  } else {
    bar.innerHTML = `
      <span class="kqa-brand"><span class="kqa-dot"></span>QA mode</span>
      <span class="kqa-badge">${total} here</span>
      <span class="kqa-break">${klavEsc(qaCountLabel(klavQaCounts))}</span>
      <span class="kqa-you">you: ${klavEsc(you)} (QA)</span>
      <button class="kqa-barbtn" id="kqa-refresh" title="Refresh">${icon('refresh-cw', { size: 14 })}</button>
      <button class="kqa-barbtn" id="kqa-exit" title="Turn off QA mode (Esc)">${icon('x', { size: 15 })}</button>`
  }
  root.appendChild(bar)
  requestAnimationFrame(() => bar.classList.add('in'))
  bar.querySelector('#kqa-refresh')?.addEventListener('click', () => { klavQaLoading = true; klavQaRenderBar(); void klavQaRefresh().then(() => { klavQaLoading = false; if (klavQaActive) klavQaRenderBar() }) })
  bar.querySelector('#kqa-exit')?.addEventListener('click', () => { void klavQaSetStoredMode(false) })
}

function klavQaRenderPins(): void {
  const root = klavQaGetHost()
  const layer = root.getElementById('kqa-pinlayer')!
  layer.innerHTML = ''
  const dims = { w: Math.max(document.documentElement.scrollWidth, window.innerWidth), h: Math.max(document.documentElement.scrollHeight, window.innerHeight) }
  klavQaBugs.forEach((bug, i) => {
    const pos = qaResolveCoords(bug.coords, dims)
    if (!pos) return // coordless → rendered in the side panel instead
    const bucket = qaStatusBucket(bug.status)
    const pin = document.createElement('div')
    pin.className = 'kqa-pin'
    pin.dataset.id = bug.id
    pin.style.left = pos.x + 'px'
    pin.style.top = pos.y + 'px'
    pin.style.background = klavQaColor(bucket)
    pin.innerHTML = `<span>${bucket === 'done' ? klavCheckSvg() : String(i + 1)}</span>`
    pin.addEventListener('mouseenter', () => klavQaShowTip(bug, pos))
    pin.addEventListener('mouseleave', klavQaHideTip)
    pin.addEventListener('click', (e) => { e.stopPropagation(); klavQaOpenPopover(bug) })
    layer.appendChild(pin)
    // staggered drop-in
    setTimeout(() => pin.classList.add('in'), 40 + i * 55)
  })
}

function klavCheckSvg(): string {
  return icon('check', { size: 13 })
}

let klavQaTipEl: HTMLElement | null = null
function klavQaShowTip(bug: QaBug, docPos: { x: number; y: number }): void {
  klavQaHideTip()
  const root = klavQaGetHost()
  const tip = document.createElement('div')
  tip.className = 'kqa-tip'; tip.id = 'kqa-tip'
  tip.textContent = bug.title || bug.ref || 'Reported bug'
  // Position in viewport coords (fixed), derived from the doc coord minus scroll.
  const vx = docPos.x - window.scrollX
  const vy = docPos.y - window.scrollY
  tip.style.left = Math.max(8, Math.min(vx + 16, window.innerWidth - 240)) + 'px'
  tip.style.top = Math.max(8, vy - 34) + 'px'
  root.appendChild(tip)
  requestAnimationFrame(() => tip.classList.add('in'))
  klavQaTipEl = tip
}
function klavQaHideTip(): void { klavQaTipEl?.remove(); klavQaTipEl = null }

function klavQaRenderPanel(): void {
  const root = klavQaGetHost()
  root.getElementById('kqa-panel')?.remove()
  const dims = { w: Math.max(document.documentElement.scrollWidth, window.innerWidth), h: Math.max(document.documentElement.scrollHeight, window.innerHeight) }
  const coordless = klavQaBugs.filter((b) => !qaResolveCoords(b.coords, dims))
  const empty = klavQaBugs.length === 0
  // Panel shows the coordless bugs; if there are none AND there are pins, skip the panel.
  if (!empty && coordless.length === 0) return
  const panel = document.createElement('div')
  panel.className = 'kqa-panel'; panel.id = 'kqa-panel'
  if (empty) {
    panel.innerHTML = `
      <div class="kqa-ph">${icon('check-circle', { size: 13 })} QA mode</div>
      <div class="kqa-empty"><span class="kqa-spark">${icon('sparkles', { size: 26 })}</span><b>No bugs reported on this page yet</b>Nice and clean. New reports for this URL will pop up here live.</div>`
  } else {
    const rows = coordless.map((bug) => klavQaRowHtml(bug)).join('')
    panel.innerHTML = `
      <div class="kqa-ph">${icon('clipboard-list', { size: 13 })} Bugs on this page (${coordless.length})</div>
      <div class="kqa-plist" id="kqa-plist">${rows}</div>`
  }
  root.appendChild(panel)
  requestAnimationFrame(() => panel.classList.add('in'))
  panel.querySelectorAll<HTMLElement>('.kqa-row').forEach((row) => {
    row.addEventListener('click', () => {
      const bug = klavQaBugs.find((b) => b.id === row.dataset.id)
      if (bug) klavQaOpenPopover(bug)
    })
  })
}

function klavQaRowHtml(bug: QaBug): string {
  const bucket = qaStatusBucket(bug.status)
  const meta = [bug.ref, bug.reporterEmail ? 'by ' + bug.reporterEmail : 'by an end-user', qaTimeAgo(bug.createdAt)].filter(Boolean).join(' · ')
  return `
    <button class="kqa-row" data-id="${klavEsc(bug.id)}">
      <span class="kqa-sev" style="background:${klavQaColor(bucket)}"></span>
      <span class="kqa-rmain">
        <span class="kqa-rtitle">${klavEsc(bug.title || bug.ref || 'Reported bug')}</span>
        <span class="kqa-rmeta">${klavEsc(meta)}</span>
      </span>
    </button>`
}

function klavQaStatusPill(bucket: 'open' | 'prog' | 'done', label: string): string {
  const c = klavQaColor(bucket)
  return `<span class="kqa-st" style="color:${c};background:${c}1f">${klavEsc(label)}</span>`
}

function klavQaOpenPopover(bug: QaBug): void {
  const root = klavQaGetHost()
  root.getElementById('kqa-pop')?.remove()
  klavQaOpenId = bug.id
  const bucket = qaStatusBucket(bug.status)
  const pop = document.createElement('div')
  pop.className = 'kqa-pop'; pop.id = 'kqa-pop'
  const meta = [bug.ref, bug.reporterEmail ? 'reported by ' + bug.reporterEmail : 'reported by an end-user', qaTimeAgo(bug.createdAt)].filter(Boolean).join(' · ')
  // Thumb URL is applied via element.style after mount (see below) so a URL
  // containing a quote/paren can never break out of the CSS url("...") context.
  const safeThumbUrl = klavSafeImageUrl(bug.screenshotUrl)
  const thumb = `<div class="kqa-thumb" id="kqa-thumb"></div>`
  const closed = bucket === 'done'
  pop.innerHTML = `
    <div class="kqa-poph">
      <span class="kqa-sev" style="background:${klavQaColor(bucket)};margin-top:0"></span>
      <b>${klavEsc(bug.title || bug.ref || 'Reported bug')}</b>
      ${klavQaStatusPill(bucket, closed ? 'DONE' : bucket === 'prog' ? 'IN PROGRESS' : 'OPEN')}
    </div>
    <div class="kqa-popb">
      <div class="kqa-meta">${klavEsc(meta)}</div>
      ${thumb}
      <div class="kqa-actions">
        ${closed ? '' : `<button class="kqa-btn kqa-primary" id="kqa-close">${icon('check', { size: 14 })} Mark working &amp; close</button>`}
        <button class="kqa-btn" id="kqa-open">${icon('link', { size: 14 })} Open in Klavity</button>
        <button class="kqa-btn kqa-ghost" id="kqa-comment">${icon('message-circle', { size: 14 })} Comment</button>
      </div>
    </div>`
  root.appendChild(pop)
  if (safeThumbUrl) {
    const thumbEl = pop.querySelector<HTMLElement>('#kqa-thumb')
    if (thumbEl) thumbEl.style.backgroundImage = `url("${safeThumbUrl}")`
  }
  klavQaPositionPopover(pop, bug)
  requestAnimationFrame(() => pop.classList.add('in'))
  pop.querySelector('#kqa-close')?.addEventListener('click', () => void klavQaCloseBug(bug))
  pop.querySelector('#kqa-open')?.addEventListener('click', () => klavQaOpenInKlavity(bug))
  pop.querySelector('#kqa-comment')?.addEventListener('click', () => klavQaOpenInKlavity(bug, true))
}

// Anchor the popover to the bug's pin when it has coords, else to the panel/screen.
function klavQaPositionPopover(pop: HTMLElement, bug: QaBug): void {
  const dims = { w: Math.max(document.documentElement.scrollWidth, window.innerWidth), h: Math.max(document.documentElement.scrollHeight, window.innerHeight) }
  const pos = qaResolveCoords(bug.coords, dims)
  const w = 308
  let left: number, top: number
  if (pos) {
    const vx = pos.x - window.scrollX
    const vy = pos.y - window.scrollY
    left = Math.max(10, Math.min(vx + 18, window.innerWidth - w - 10))
    top = Math.max(10, Math.min(vy + 10, window.innerHeight - 220))
  } else {
    left = Math.max(10, window.innerWidth - w - 316) // left of the side panel
    top = 90
  }
  pop.style.left = left + 'px'
  pop.style.top = top + 'px'
}

function klavQaClosePopover(): void {
  klavQaOpenId = null
  const pop = klavQaHostRoot?.getElementById('kqa-pop')
  if (!pop) return
  pop.classList.remove('in')
  setTimeout(() => pop.remove(), 160)
}

// Optimistic close: flip local state to done, animate the pin -> green check, then
// POST qa-close. Revert + toast on failure. Team-gated server-side (403/401 -> revert).
async function klavQaCloseBug(bug: QaBug): Promise<void> {
  const base = klavConfig?.backendUrl?.replace(/\/+$/, '')
  const token = klavConfig?.token
  if (!base || !token) return
  // In-flight guard (#483): rapid clicks must not fire duplicate qa-close POSTs
  // (which would duplicate the resolution note). Disable the button + record the id.
  if (klavQaClosing.has(bug.id)) return
  klavQaClosing.add(bug.id)
  const closeBtn = klavQaHostRoot?.querySelector<HTMLButtonElement>('#kqa-close')
  if (closeBtn) closeBtn.disabled = true
  const prevStatus = bug.status
  bug.status = 'done'
  klavQaCounts = qaDeriveCounts(klavQaBugs)
  // Animate the pin (if any) then re-render everything to the resolved state.
  const pinEl = klavQaHostRoot?.querySelector<HTMLElement>(`.kqa-pin[data-id="${CSS.escape(bug.id)}"]`)
  if (pinEl) {
    pinEl.classList.add('kqa-closing')
    pinEl.style.background = klavQaColor('done')
    const span = pinEl.querySelector('span'); if (span) span.innerHTML = klavCheckSvg()
  }
  klavQaShowDoneCard(bug)
  try {
    const r = await fetch(`${base}/api/feedback/${encodeURIComponent(bug.id)}/qa-close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ resolution: 'works-as-expected' }),
    })
    if (!r.ok) throw new Error('close-failed:' + r.status)
    // success — settle the UI after the celebratory card
    klavQaClosing.delete(bug.id)
    setTimeout(() => { klavQaClosePopover(); klavQaRenderBar(); klavQaRenderPins(); klavQaRenderPanel() }, 1050)
  } catch {
    // Failure (#482): revert the optimistic status AND rebuild the popover back to
    // the open/review state — the done-card must not linger and mislead the user.
    klavQaClosing.delete(bug.id)
    bug.status = prevStatus // revert optimistic change
    klavQaCounts = qaDeriveCounts(klavQaBugs)
    klavQaRender()
    if (klavQaOpenId === bug.id) klavQaOpenPopover(bug) // re-open the open-state card (re-enables the button)
    showToast('Could not close this bug — please try again.')
  }
}

function klavQaShowDoneCard(bug: QaBug): void {
  const pop = klavQaHostRoot?.getElementById('kqa-pop')
  if (!pop) return
  pop.innerHTML = `
    <div class="kqa-done-card">
      <div class="kqa-check">${icon('check', { size: 26 })}</div>
      <b>Closed &amp; verified</b>
      <p>${klavEsc(bug.ref || bug.title || 'Bug')} marked working. The tracker ticket was transitioned.</p>
    </div>`
}

function klavQaOpenInKlavity(bug: QaBug, comment = false): void {
  const base = (klavConfig?.backendUrl || 'https://klavity.in').replace(/\/+$/, '')
  // #727: open the FAST single-ticket page (/t/<id>) rather than cold-booting the dashboard SPA.
  // /t/:ref resolves the project from the feedback row + member-gates server-side, so no project
  // param is needed. The comments live on that same page, so the "reply" variant lands there too.
  let url = `${base}/t/${encodeURIComponent(bug.id)}`
  if (comment) url += '#comments'
  try { window.open(url, '_blank', 'noopener,noreferrer') } catch { /* popup blocked */ }
}

// Esc: close the popover first, then (a second Esc) turn QA mode off.
function klavQaOnKeydown(e: KeyboardEvent): void {
  if (e.key !== 'Escape' || !klavQaActive) return
  if (klavQaOpenId) { e.stopPropagation(); klavQaClosePopover(); return }
  if (klavQaHostRoot?.getElementById('kqa-bar')) { e.stopPropagation(); void klavQaSetStoredMode(false) }
}
window.addEventListener('keydown', klavQaOnKeydown, true)

// Persist the global QA-mode flag; storage.onChanged then drives (de)activation here
// AND in every other open tab. The popup toggle writes the same key.
async function klavQaSetStoredMode(on: boolean): Promise<void> {
  try { await chrome.storage.local.set({ [QA_STORAGE_KEY]: on }) } catch { /* ignore */ }
}

// React to the popup toggle (or another tab) flipping klavQaMode.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !(QA_STORAGE_KEY in changes)) return
  const on = !!changes[QA_STORAGE_KEY].newValue
  if (on && !klavQaActive) void klavQaActivate()
  else if (!on && klavQaActive) klavQaDeactivate()
})

// ── Bootstrap: pull the cached config from the SW, then evaluate the current URL. ──
async function klavBootstrap() {
  // Only meaningful on real http(s) pages — on chrome:// the content script isn't injected anyway.
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return
  const resp = await klavSend<{ ok: boolean; config: KlavConfig | null }>({ kind: 'KLAV_GET_CONFIG' })
  klavConfig = resp?.config ?? null
  // Server-side match: check current URL against backend allowlist before activating.
  // Runs before maybeActivate so the fallback project is ready at boot.
  await klavFetchServerMatch(location.href)
  // Boot review first — observers armed after so the first IO fire is suppressed.
  await maybeActivate('boot')
  // Clear boot guard so subsequent IO fires on this page-load are processed.
  klavBootGuard = false
  // Arm the change-detector observers for post-boot dynamic content + scroll-reveal.
  klavArmObservers()
  // QA mode: if the signed-in teammate left it on, arm the overlay for this page too.
  try {
    const r = await chrome.storage.local.get(QA_STORAGE_KEY)
    if (r[QA_STORAGE_KEY]) await klavQaActivate()
  } catch { /* ignore */ }
  // #442: resurface the multi-page evidence dock if a still-fresh report is in progress. chrome.storage is
  // extension-scoped so the session survives cross-origin navigation to this page.
  void evResumeDockOnBoot()
}
void klavBootstrap()
