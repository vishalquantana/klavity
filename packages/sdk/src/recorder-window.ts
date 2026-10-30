// ── Recorder window (served at <backend>/recorder-window) ─────────────────────────────────────────────
// The recording half of the "Record me across navigation" flow (host half: record-bridge.ts). This window
// owns getDisplayMedia + MediaRecorder via the SAME startRecording() engine recordMe() uses, so caps,
// codecs and the camera/mic fallback ladder are unchanged. Because it is a separate top-level window, a full
// page load in the reporter's tab (every PX4 module change) does not touch it — the video keeps recording.
//
// It talks ONLY to window.opener, and only to the origin it was opened for (?origin=…). window.opener keeps
// pointing at the reporter's tab across that tab's navigations, so heartbeats reach whichever page is
// current; the widget on that page shows the REC bar and can send stop/pause/resume back.
import {
  startRecording, startCameraPreview, recordingSupported, DEFAULT_RECORDING_CAPS,
  type RecordingController, type RecordingResult,
} from './recorder'

const params = new URLSearchParams(location.search)
const session = params.get('session') || ''
const targetOrigin = (() => { try { return new URL(params.get('origin') || '').origin } catch { return '' } })()
const opener: Window | null = window.opener

const app = document.getElementById('app') as HTMLElement
const fmtTime = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }
const fmtMB = (b: number) => `${(b / 1048576).toFixed(1)} MB`
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
const host = (() => { try { return new URL(targetOrigin).host } catch { return targetOrigin } })()

type Phase = 'consent' | 'recording' | 'paused' | 'finishing' | 'delivering' | 'delivered' | 'error'
let phase: Phase = 'consent'
let controller: RecordingController | null = null
let elapsed = 0
let bytes = 0
let result: RecordingResult | null = null
let acked = false
let heartbeat: any = 0
let deliverTimer: any = 0

function post(msg: Record<string, unknown>) {
  if (!opener || !targetOrigin) return
  try { opener.postMessage({ type: 'klavity-rec', session, ...msg }, targetOrigin) } catch { /* opener mid-navigation — next beat retries */ }
}

function beat() {
  const state = phase === 'paused' ? 'paused' : phase === 'recording' ? 'recording' : phase === 'finishing' ? 'finishing' : phase
  post({ kind: 'state', state, elapsedMs: elapsed, maxMs: DEFAULT_RECORDING_CAPS.maxDurationMs })
}

function render() {
  if (phase === 'consent') {
    app.innerHTML =
      `<h1>Record a walkthrough</h1>` +
      `<p class="for">For <b>${esc(host)}</b></p>` +
      `<label><input type="checkbox" checked disabled> Share my <b>screen</b></label>` +
      `<label><input type="checkbox" id="cam"> Camera <span class="opt">optional</span></label>` +
      `<label><input type="checkbox" id="mic" checked> Microphone (narration)</label>` +
      `<div class="row"><button class="primary" id="start">Start recording</button><button id="cancel">Cancel</button></div>` +
      `<p class="tip">Pick <b>the tab you are reporting on</b> or <b>Entire Screen</b> in the next dialog. ` +
      `Keep this window open — the recording carries on while you move between pages, and you can stop it from the page or here.</p>` +
      `<p class="small">Max ${Math.round(DEFAULT_RECORDING_CAPS.maxDurationMs / 60000)} min. Nothing uploads until you submit the report.</p>` +
      `<div id="hint" class="small"></div>`
    ;(document.getElementById('start') as HTMLButtonElement).onclick = () => void begin()
    ;(document.getElementById('cancel') as HTMLButtonElement).onclick = () => { post({ kind: 'cancel' }); window.close() }
    return
  }
  if (phase === 'recording' || phase === 'paused') {
    app.innerHTML =
      `<h1><span class="dot${phase === 'paused' ? ' off' : ''}"></span><span id="timer"></span></h1>` +
      `<p class="for">Recording for <b>${esc(host)}</b></p>` +
      `<div class="col"><button class="stop" id="stop"><i></i>Stop recording</button>` +
      `<button id="pause">${phase === 'paused' ? 'Resume' : 'Pause'}</button></div>` +
      `<p class="small" id="meta"></p>` +
      `<p class="tip">You can switch back to your app and navigate freely. Don't close this window until you stop.</p>` +
      `<div id="hint" class="small"></div>`
    ;(document.getElementById('stop') as HTMLButtonElement).onclick = () => stop()
    ;(document.getElementById('pause') as HTMLButtonElement).onclick = () => togglePause()
    updateStats()
    return
  }
  if (phase === 'finishing') { app.innerHTML = `<h1>Finishing…</h1><p class="small">Preparing your video.</p>`; return }
  if (phase === 'delivering' || phase === 'delivered') {
    const href = result ? URL.createObjectURL(result.blob) : ''
    const ext = result && result.mime.includes('mp4') ? 'mp4' : 'webm'
    app.innerHTML = phase === 'delivered'
      ? `<h1>Added to your report ✓</h1><p class="small">You can close this window.</p>`
      : `<h1>Adding the video to your report…</h1>` +
        `<p class="small" id="deliver-msg">Switch back to <b>${esc(host)}</b> — the report will open with the video attached.</p>` +
        (href ? `<p class="small">${result ? fmtTime(result.durationMs) + ' · ' + fmtMB(result.bytes) : ''} · <a href="${href}" download="klavity-recording.${ext}">Download a copy</a></p>` : '')
    return
  }
  if (phase === 'error') {
    app.innerHTML = `<h1>Can't record here</h1><p class="small" id="err"></p><div class="row"><button id="close">Close</button></div>`
    ;(document.getElementById('close') as HTMLButtonElement).onclick = () => { post({ kind: 'cancel' }); window.close() }
  }
}

function updateStats() {
  const t = document.getElementById('timer'); if (t) t.textContent = (phase === 'paused' ? 'PAUSED ' : 'REC ') + fmtTime(elapsed)
  const m = document.getElementById('meta'); if (m) m.textContent = `${fmtTime(Math.max(0, DEFAULT_RECORDING_CAPS.maxDurationMs - elapsed))} left · ~${fmtMB(bytes)}`
}

function showError(text: string) {
  phase = 'error'; render()
  const e = document.getElementById('err'); if (e) e.textContent = text
}

async function begin() {
  const wantCamera = (document.getElementById('cam') as HTMLInputElement).checked
  const wantMic = (document.getElementById('mic') as HTMLInputElement).checked
  let fallback: string | null = null
  try {
    controller = await startRecording({
      wantCamera, wantMic,
      onFallback: (reason) => { fallback = reason },
      onStats: (s) => { elapsed = s.elapsedMs; bytes = s.bytes; updateStats() },
      onState: (s) => {
        if (s === 'recording' || s === 'paused') { phase = s; render(); beat() }
      },
    })
  } catch {
    // Reporter dismissed the share picker — stay on the consent panel so they can retry or cancel.
    controller = null
    const h = document.getElementById('hint'); if (h) h.textContent = 'Screen sharing was not started. Click Start recording to try again.'
    return
  }
  if (phase !== 'recording' && phase !== 'paused') { phase = 'recording'; render() }
  if (fallback) {
    const h = document.getElementById('hint')
    if (h) h.textContent = fallback === 'camera-blocked' ? 'Camera blocked — recording screen + mic.' : 'Camera/mic blocked — recording screen only.'
  }
  try {
    const bubble = startCameraPreview(controller.cameraStream())
    if (bubble) { bubble.style.width = bubble.style.height = '96px'; document.body.appendChild(bubble) }
  } catch { /* preview is a nicety */ }
  beat()
  controller.done.then((r) => deliver(r)).catch(() => showError('The recording failed. Please try again.'))
}

function stop() {
  if (!controller || phase === 'finishing') return
  phase = 'finishing'; render(); beat()
  controller.stop()
}

function togglePause() {
  if (!controller) return
  if (controller.state() === 'recording') controller.pause()
  else controller.resume()
}

function deliver(r: RecordingResult) {
  result = r
  phase = 'delivering'; render()
  document.querySelectorAll('[data-klavity-ui="camera-preview"]').forEach((n) => n.remove())
  const payload = { id: r.id, blob: r.blob, mime: r.mime, durationMs: r.durationMs, bytes: r.bytes, width: r.width, height: r.height, screenOnly: r.screenOnly }
  const started = Date.now()
  const send = () => {
    if (acked) return
    post({ kind: 'done', recording: payload })
    if (Date.now() - started > 15000) {
      const m = document.getElementById('deliver-msg')
      if (m) m.innerHTML = `Couldn't reach <b>${esc(host)}</b> yet. Open that page (with the Klavity widget) in the tab you started from and it will pick the video up — or download a copy below.`
    }
  }
  send()
  // Repeat until the widget acks: the reporter's tab may be mid-navigation, so a single post can be lost.
  deliverTimer = setInterval(send, 1000)
}

window.addEventListener('message', (ev: MessageEvent) => {
  if (ev.origin !== targetOrigin || ev.source !== opener) return
  const d = ev.data
  if (!d || d.type !== 'klavity-rec-cmd' || d.session !== session) return
  if (d.cmd === 'stop') stop()
  else if (d.cmd === 'pause') { if (controller?.state() === 'recording') controller.pause() }
  else if (d.cmd === 'resume') { if (controller?.state() === 'paused') controller.resume() }
  else if (d.cmd === 'ack' && result) {
    acked = true
    if (deliverTimer) { clearInterval(deliverTimer); deliverTimer = 0 }
    if (heartbeat) { clearInterval(heartbeat); heartbeat = 0 }
    phase = 'delivered'; render()
    setTimeout(() => { try { window.close() } catch { /* no-op */ } }, 900)
  }
})

// Closing this window mid-recording discards the video — warn first.
window.addEventListener('beforeunload', (e) => {
  if (phase === 'recording' || phase === 'paused' || phase === 'finishing' || (phase === 'delivering' && !acked)) { e.preventDefault(); e.returnValue = '' }
})
window.addEventListener('pagehide', () => { if (phase === 'consent') post({ kind: 'cancel' }) })

if (!session || !targetOrigin || !opener) {
  showError('Open the recorder from the Klavity widget\'s "Record me" button.')
} else if (!recordingSupported()) {
  showError('This browser can\'t record the screen from this page. Try a current Chrome, Edge or Firefox.')
} else {
  render()
  heartbeat = setInterval(beat, 500)
  beat()
}
