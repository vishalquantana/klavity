// ── "Record me" across page navigation (recorder window bridge) ───────────────────────────────────────
// WHY: recordMe() runs the screen share + MediaRecorder inside the HOST page's JS context. On a multi-page
// app (e.g. PX4: server-rendered PHP, every module change is a full document load) the page unload destroys
// the MediaRecorder, the screen-share stream and every in-memory chunk — no browser API lets them survive a
// document reload in the same tab. So the recording now lives in a small Klavity-hosted window
// (/recorder-window, see recorder-window.ts) that is NOT unloaded when the host tab navigates.
//
// This module is the HOST side. It:
//   • opens the recorder window from the Record me click (user gesture → popup allowed),
//   • remembers the active session in sessionStorage so the widget on the NEXT page (same tab) knows a
//     recording is running and re-attaches,
//   • renders a REC bar (timer / Pause / Stop) on every page while the window reports it is recording,
//   • receives the finished video (a Blob, structured-cloned over postMessage), acks it, and hands it either
//     to the composer that is still waiting on this page, or — after a navigation — to onRecordingArrived.
//
// Protocol (all postMessage, origin-checked both ways):
//   window → host  {type:'klavity-rec', session, kind:'state', state, elapsedMs, maxMs}   (heartbeat, ~2/s)
//   window → host  {type:'klavity-rec', session, kind:'done', recording:{id, blob, mime, …}} (repeated until ack)
//   window → host  {type:'klavity-rec', session, kind:'cancel'}
//   host → window  {type:'klavity-rec-cmd', session, cmd:'stop'|'pause'|'resume'|'ack'}

import type { ReportRecording } from '@klavity/core'
import { blobToDataUrl } from './recorder'

export type RecordPhase = 'consent' | 'recording' | 'preview'

export interface RecordBridgeOptions {
  backendUrl: string
  projectId: string
  // A recording finished on a page whose composer is gone (the reporter navigated mid-recording).
  onRecordingArrived: (rec: ReportRecording) => void
  // Surface a short notice to the reporter (e.g. the widget banner). Optional.
  notify?: (text: string) => void
}

export interface RecordBridge {
  // Opens the recorder window. Returns null when the popup was blocked, so the caller can fall back to the
  // in-page recorder. Otherwise resolves with the recording (stopped on THIS page) or null (cancelled /
  // window closed / finished after a navigation — then onRecordingArrived receives it instead).
  start(onPhase?: (phase: RecordPhase) => void): Promise<ReportRecording | null> | null
  // True while a recording session is known to be running in this tab.
  active(): boolean
  dispose(): void
}

const STORE_KEY = 'klavity_rec_window'
const WINDOW_NAME = 'klavity-recorder'
// No heartbeat for this long → the recorder window is gone (closed by the user / crashed).
const HEARTBEAT_LOST_MS = 6000

interface StoredSession { session: string; projectId: string; startedAt: number }

function readStored(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) as StoredSession : null
  } catch { return null }
}
function writeStored(s: StoredSession | null) {
  try {
    if (s) sessionStorage.setItem(STORE_KEY, JSON.stringify(s))
    else sessionStorage.removeItem(STORE_KEY)
  } catch { /* storage blocked — the bridge still works on the current page */ }
}

function newSessionId(): string {
  const rnd = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
  return 'rw_' + rnd
}

const fmtTime = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }

export function recorderWindowAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.open === 'function' && typeof Blob !== 'undefined'
}

export function createRecordBridge(opts: RecordBridgeOptions): RecordBridge {
  let backendOrigin = ''
  try { backendOrigin = new URL(opts.backendUrl).origin } catch { /* invalid backend → bridge inert */ }

  let stored = readStored()
  if (stored && stored.projectId !== opts.projectId) stored = null
  let pending: { session: string; resolve: (r: ReportRecording | null) => void; onPhase?: (p: RecordPhase) => void; win: Window | null; recordingSignalled: boolean } | null = null
  let source: Window | null = null
  let lastBeat = 0
  let watchdog: any = 0
  let closedPoll: any = 0
  const handled = new Set<string>()

  // ── REC bar (own shadow host so page CSS can't touch it) ──
  let barHost: HTMLElement | null = null
  let barRoot: ShadowRoot | null = null
  const ensureBar = () => {
    if (barHost && barHost.isConnected) return
    barHost = document.createElement('div')
    barHost.setAttribute('data-klavity-ui', 'recorder-bar')
    barHost.style.cssText = 'position:fixed;right:20px;top:50%;transform:translateY(-50%);z-index:2147483647'
    barRoot = barHost.attachShadow({ mode: 'open' })
    barRoot.innerHTML =
      '<style>' +
      ':host{all:initial}' +
      '.bar{display:flex;flex-direction:column;gap:9px;padding:12px 14px;min-width:180px;max-width:min(240px,80vw);background:#f5f3ee;border:1px solid #e3ddd1;border-radius:14px;box-shadow:0 12px 40px rgba(28,22,40,.32);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#19140f}' +
      '.t{display:inline-flex;align-items:center;gap:7px;font-weight:700;white-space:nowrap}' +
      '.dot{width:10px;height:10px;border-radius:50%;background:#e11;flex:none}' +
      '.paused .dot{background:#a8a29e}' +
      'button{font:inherit;cursor:pointer}' +
      '.stop{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:12px 16px;border-radius:10px;border:1px solid #dc2626;background:#dc2626;color:#fff;font-weight:700;font-size:15px}' +
      '.stop i{width:12px;height:12px;border-radius:2px;background:#fff;flex:none}' +
      '.pause{width:100%;padding:8px 12px;border-radius:8px;border:1px solid #e3ddd1;background:#fffdf8;font-weight:600;color:#19140f}' +
      'button:disabled{opacity:.55;cursor:default}' +
      '.m{font-size:11px;color:#574f45;text-align:center}' +
      '</style>' +
      '<div class="bar" role="region" aria-label="Screen recording">' +
      '<span class="t"><span class="dot" aria-hidden="true"></span><span id="timer">REC 0:00</span></span>' +
      '<button class="stop" id="stop" type="button" aria-label="Stop recording"><i aria-hidden="true"></i>Stop recording</button>' +
      '<button class="pause" id="pause" type="button">Pause</button>' +
      '<span class="m" id="meta">Recording continues as you move between pages.</span>' +
      '</div>'
    barRoot.getElementById('stop')!.addEventListener('click', () => { send('stop'); setFinishing() })
    barRoot.getElementById('pause')!.addEventListener('click', () => {
      const b = barRoot!.getElementById('pause') as HTMLButtonElement
      send(b.dataset.state === 'paused' ? 'resume' : 'pause')
    })
    document.body.appendChild(barHost)
  }
  const removeBar = () => { try { barHost?.remove() } catch { /* no-op */ } barHost = null; barRoot = null }
  const setFinishing = () => {
    if (!barRoot) return
    const stop = barRoot.getElementById('stop') as HTMLButtonElement
    const pause = barRoot.getElementById('pause') as HTMLButtonElement
    stop.disabled = true; pause.disabled = true
    const meta = barRoot.getElementById('meta'); if (meta) meta.textContent = 'Finishing the video…'
  }
  const renderState = (state: string, elapsedMs: number, maxMs: number) => {
    ensureBar()
    if (!barRoot) return
    const bar = barRoot.querySelector('.bar') as HTMLElement
    bar.classList.toggle('paused', state === 'paused')
    const timer = barRoot.getElementById('timer'); if (timer) timer.textContent = (state === 'paused' ? 'PAUSED ' : 'REC ') + fmtTime(elapsedMs)
    const pause = barRoot.getElementById('pause') as HTMLButtonElement
    pause.dataset.state = state
    pause.textContent = state === 'paused' ? 'Resume' : 'Pause'
    const meta = barRoot.getElementById('meta')
    if (state === 'finishing') { setFinishing(); return }
    const stop = barRoot.getElementById('stop') as HTMLButtonElement
    stop.disabled = false; pause.disabled = !source
    if (meta && maxMs > 0) meta.textContent = `${fmtTime(Math.max(0, maxMs - elapsedMs))} left · keeps recording across pages`
  }

  const currentSession = () => pending?.session ?? stored?.session ?? null

  const send = (cmd: 'stop' | 'pause' | 'resume' | 'ack') => {
    const session = currentSession()
    const target = source ?? pending?.win ?? null
    if (!session || !target || !backendOrigin) return
    try { target.postMessage({ type: 'klavity-rec-cmd', session, cmd }, backendOrigin) } catch { /* window gone */ }
  }

  const endSession = () => {
    stored = null
    writeStored(null)
    source = null
    lastBeat = 0
    if (watchdog) { clearInterval(watchdog); watchdog = 0 }
    if (closedPoll) { clearInterval(closedPoll); closedPoll = 0 }
    removeBar()
  }

  const settlePending = (rec: ReportRecording | null) => {
    const p = pending
    pending = null
    if (p) { try { p.resolve(rec) } catch { /* no-op */ } }
    return !!p
  }

  const armWatchdog = () => {
    if (watchdog) return
    lastBeat = lastBeat || Date.now()
    watchdog = setInterval(() => {
      if (Date.now() - lastBeat < HEARTBEAT_LOST_MS) return
      // The recorder window vanished without delivering a result (closed by the reporter / crashed).
      const hadBar = !!barHost
      endSession()
      settlePending(null)
      if (hadBar) opts.notify?.('The recording window was closed, so the recording was discarded.')
    }, 1000)
  }

  const toRecording = async (r: any): Promise<ReportRecording | null> => {
    if (!r || !(r.blob instanceof Blob)) return null
    const mime = String(r.mime || r.blob.type || 'video/webm').split(';')[0]
    return {
      id: String(r.id || ''),
      dataUrl: await blobToDataUrl(r.blob),
      blob: r.blob,
      mime,
      durationMs: Math.round(Number(r.durationMs) || 0),
      bytes: Number(r.bytes) || r.blob.size,
      width: Number(r.width) || 0,
      height: Number(r.height) || 0,
      screenOnly: !!r.screenOnly,
    }
  }

  const onMessage = async (ev: MessageEvent) => {
    if (!backendOrigin || ev.origin !== backendOrigin) return
    const d = ev.data
    if (!d || d.type !== 'klavity-rec' || typeof d.session !== 'string') return
    const session = currentSession()
    if (!session || d.session !== session) return
    source = (ev.source as Window | null) ?? source
    lastBeat = Date.now()

    if (d.kind === 'state') {
      armWatchdog()
      if (d.state === 'recording' || d.state === 'paused' || d.state === 'finishing') {
        if (pending && !pending.recordingSignalled) { pending.recordingSignalled = true; try { pending.onPhase?.('recording') } catch { /* no-op */ } }
        renderState(d.state, Number(d.elapsedMs) || 0, Number(d.maxMs) || 0)
      }
      return
    }
    if (d.kind === 'cancel') {
      endSession()
      settlePending(null)
      return
    }
    if (d.kind === 'done') {
      send('ack')
      const id = String(d.recording?.id || '')
      if (id && handled.has(id)) return // the window repeats 'done' until acked
      if (id) handled.add(id)
      endSession()
      let rec: ReportRecording | null = null
      try { rec = await toRecording(d.recording) } catch { rec = null }
      if (!rec) { settlePending(null); opts.notify?.('The recording could not be attached.'); return }
      if (!settlePending(rec)) { try { opts.onRecordingArrived(rec) } catch { /* no-op */ } }
    }
  }

  if (typeof window !== 'undefined') window.addEventListener('message', onMessage)
  // A recording started on a previous page of this tab is still running → show the bar straight away and
  // wait for the window's next heartbeat (it keeps posting to window.opener, which is now this document).
  if (stored && typeof document !== 'undefined') {
    const s = stored
    const boot = () => { if (stored === s) { renderState('recording', Date.now() - s.startedAt, 0); armWatchdog() } }
    if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot, { once: true })
  }

  return {
    start(onPhase) {
      if (!backendOrigin) return null
      if (pending) return null
      const session = newSessionId()
      const url = opts.backendUrl.replace(/\/+$/, '') + '/recorder-window?session=' + encodeURIComponent(session)
        + '&origin=' + encodeURIComponent(location.origin) + '&project=' + encodeURIComponent(opts.projectId)
      let win: Window | null = null
      try { win = window.open(url, WINDOW_NAME, 'popup,width=400,height=560') } catch { win = null }
      if (!win) return null // popup blocked → caller falls back to the in-page recorder
      stored = { session, projectId: opts.projectId, startedAt: Date.now() }
      writeStored(stored)
      return new Promise<ReportRecording | null>((resolve) => {
        pending = { session, resolve, onPhase, win, recordingSignalled: false }
        try { onPhase?.('consent') } catch { /* no-op */ }
        // Closed during consent (before any heartbeat) → cancel. Once heartbeats flow the watchdog owns this.
        closedPoll = setInterval(() => {
          let closed = false
          try { closed = !!win && win.closed } catch { closed = false }
          if (closed && pending?.session === session) {
            const wasRecording = pending.recordingSignalled
            endSession(); settlePending(null)
            if (wasRecording) opts.notify?.('The recording window was closed, so the recording was discarded.')
          }
        }, 500)
      })
    },
    active() { return !!currentSession() },
    dispose() {
      if (typeof window !== 'undefined') window.removeEventListener('message', onMessage)
      if (watchdog) { clearInterval(watchdog); watchdog = 0 }
      if (closedPoll) { clearInterval(closedPoll); closedPoll = 0 }
      removeBar()
    },
  }
}
