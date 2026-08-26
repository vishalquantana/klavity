export class VoiceInput {
  onTranscript = (text: string) => {}
  onError = (type: string, message: string) => {}
  onStop = () => {}
  // KLAVITYKLA-495: neutral, non-alarming status while we auto-recover from a transient drop. type is
  // 'retrying' (a network blip we're reconnecting through) or 'idle' (recovered — clear the status).
  onStatus = (type: 'retrying' | 'idle', message: string) => {}

  private _recognition: any = null
  private _timer: ReturnType<typeof setTimeout> | null = null
  private _retryTimer: ReturnType<typeof setTimeout> | null = null
  private _recording = false
  private _stopping = false
  private _stopFired = false
  private _showedReconnecting = false
  // KLA-590: the browser Web Speech backend (Google's server for webkitSpeechRecognition) is fundamentally
  // unstable in injected-widget contexts — it drops with 'error: network', auto-ends after ~60s, and fires
  // 'no-speech' on any pause. The old model (MAX_RETRIES=2, fixed 500ms, counter reset only on a result,
  // and a HARD STOP on 'no-speech'/unexpected onend) surfaced "Voice disconnected — tap Voice to try again"
  // on the first pause or blip — the founder repro.
  //
  // Ported from Mevak's deepgramStream reconnect model: treat recognition as a PERSISTENT session that
  // auto-restarts through silence, unexpected ends, and transient errors. All recovery is funneled through
  // a single onend handler (mirroring Mevak funnelling recovery through ws.onclose). Only CONSECUTIVE real
  // failures count toward giving up, with exponential backoff, and the budget resets the moment recognition
  // (re)connects — so a healthy long session with the odd blip never surfaces a scary message. A benign
  // silence/auto-end restarts near-instantly (analogous to Mevak's continuous-PCM keepalive holding the
  // socket open through silence). This is CLIENT-side recovery of the browser backend — no Klavity server.
  private _consecFailures = 0
  private static readonly MAX_CONSEC_FAILURES = 6
  private static readonly BASE_BACKOFF_MS = 400
  private static readonly MAX_BACKOFF_MS = 8000
  private static readonly BENIGN_RESTART_MS = 250
  private static readonly SESSION_MS = 180000
  // Unrecoverable errors — surface immediately, no reconnect (a dead mic/denied permission won't heal).
  private static readonly TERMINAL_ERRORS: Record<string, string> = {
    'not-allowed': 'Microphone access was denied',
    'service-not-allowed': 'Microphone access was denied',
    'audio-capture': 'No microphone was found',
  }

  static isSupported(): boolean {
    return typeof window !== 'undefined' &&
      !!((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition)
  }

  start() {
    if (this._recording || !VoiceInput.isSupported()) return
    this._recording = true
    this._stopping = false
    this._stopFired = false
    this._showedReconnecting = false
    this._consecFailures = 0
    // Overall session cap spans across every auto-restart — set once here, cleared on stop.
    this._timer = setTimeout(() => this.stop(), VoiceInput.SESSION_MS)
    this._begin()
  }

  // Spin up a fresh SpeechRecognition instance. Called on start() and again on every auto-restart (a
  // silence timeout, an unexpected end, or a reconnect after a transient error) so a dropped backend
  // reconnects transparently while _recording stays true.
  private _begin() {
    if (!this._recording) return
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    const rec = new SR()
    this._recognition = rec
    rec.continuous = true
    rec.interimResults = false
    rec.lang = (typeof document !== 'undefined' && document.documentElement.lang) || 'en-US'
    // A successful (re)start means the backend is healthy — clear the failure budget + any status row.
    rec.onstart = () => { this._recovered() }
    rec.onresult = (event: any) => {
      this._recovered()
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) this.onTranscript(event.results[i][0].transcript)
      }
    }
    rec.onerror = (event: any) => {
      if (this._stopping || !this._recording) return
      const err = event?.error
      // Unrecoverable → surface and stop (reconnecting can't fix a denied/absent mic).
      if (err && err in VoiceInput.TERMINAL_ERRORS) {
        this.onError(err, VoiceInput.TERMINAL_ERRORS[err])
        this._teardown()
        return
      }
      // 'no-speech' is a silence timeout, NOT a failure: onend follows and we auto-restart to keep listening
      // through the pause. Don't count it, don't alarm the user. Every other error (network/aborted/…) is
      // transient — count it (a genuinely dead connection eventually gives up) and show a soft reconnect note.
      if (err && err !== 'no-speech') {
        this._consecFailures++
        if (!this._showedReconnecting) { this._showedReconnecting = true; this.onStatus('retrying', 'Reconnecting voice…') }
      }
      // onend fires right after onerror → the single reconnect funnel below handles the restart/give-up.
    }
    // Single reconnect funnel (mirrors Mevak funnelling all recovery through ws.onclose): fired after a
    // normal end, a silence timeout, or an error. While still recording we auto-restart; only a sustained
    // run of consecutive failures surfaces the terminal message.
    rec.onend = () => {
      this._recognition = null
      if (this._stopping || !this._recording) { this._emitStop(); return }
      if (this._consecFailures > VoiceInput.MAX_CONSEC_FAILURES) {
        // Genuinely dead (a sustained outage across the whole backoff window) → soft terminal message.
        this.onError('network', 'Voice disconnected — tap Voice to try again')
        this._teardown()
        return
      }
      // Near-instant restart on a benign silence/auto-end; exponential backoff on real failures.
      const delay = this._consecFailures === 0
        ? VoiceInput.BENIGN_RESTART_MS
        : Math.min(VoiceInput.MAX_BACKOFF_MS, VoiceInput.BASE_BACKOFF_MS * 2 ** (this._consecFailures - 1))
      this._retryTimer = setTimeout(() => { this._retryTimer = null; this._begin() }, delay)
    }
    try { rec.start() } catch { /* start() on an already-live instance throws — ignore */ }
  }

  // Recognition (re)connected — clear the consecutive-failure budget and any reconnecting status.
  private _recovered() {
    this._consecFailures = 0
    if (this._showedReconnecting) { this._showedReconnecting = false; this.onStatus('idle', '') }
  }

  stop() {
    if (!this._recording) return
    this._recording = false
    this._stopping = true
    this._clearTimers()
    // Ask the backend to stop; its onend fires _emitStop() (guarded against a double-fire). If there's no
    // live instance (already ended between segments), finish now.
    if (this._recognition) { try { this._recognition.stop() } catch { /* no-op */ } }
    this._emitStop()
  }

  // Tear down after an unrecoverable error (no user stop): release + notify exactly once.
  private _teardown() {
    this._recording = false
    this._stopping = true
    this._clearTimers()
    this._recognition = null
    this._emitStop()
  }

  private _emitStop() {
    if (this._stopFired) return
    this._stopFired = true
    this.onStop()
  }

  private _clearTimers() {
    if (this._timer !== null) { clearTimeout(this._timer); this._timer = null }
    if (this._retryTimer !== null) { clearTimeout(this._retryTimer); this._retryTimer = null }
  }
}

// ── KLA-505: server-side LIVE DICTATION (replaces the flaky Web Speech backend) ─────────────────────────
// VoiceInput above drives the browser's webkitSpeechRecognition, whose Google backend drops with an
// 'error: network' in injected-widget contexts. LiveDictation instead records the reporter's mic via
// MediaRecorder and streams it to Klavity's own STT endpoint (POST /api/voice/transcribe → transcribe.ts).
//
// It records in short SEGMENTS: every SEGMENT_MS the recorder is stopped (producing a COMPLETE, standalone
// audio blob — a mid-stream webm chunk isn't independently decodable) and a fresh segment starts, so text
// appears incrementally as the reporter speaks rather than only at the end. Each segment's blob is handed
// to the injected `transcribe` fn (the host wires this to the endpoint) and the returned text is appended.
//
// Robustness contract (never throws into the composer):
//   • getUserMedia denial → onError('not-allowed', …) + onStop (no half-open mic).
//   • transcribe() resolving null (endpoint unreachable / STT unconfigured / rate-limited) on the FIRST
//     segment → onUnavailable() so the host can transparently fall back to VoiceInput (Web Speech). A null
//     on a LATER segment is swallowed best-effort (one dropped segment never kills an in-flight session).
//   • Shares the VoiceInput callback shape (onTranscript/onError/onStatus/onStop) so the composer wires
//     either engine identically.
export type DictationTranscribe = (audio: Blob) => Promise<{ text: string } | null>

export interface DictationDeps {
  getUserMedia: (constraints: any) => Promise<any>
  MediaRecorder: any
  isTypeSupported: (mime: string) => boolean
  setTimeout: (cb: () => void, ms: number) => any
  clearTimeout: (id: any) => void
}

export function defaultDictationDeps(): DictationDeps {
  const g: any = globalThis as any
  const MR = g.MediaRecorder
  return {
    getUserMedia: (c: any) => (navigator as any).mediaDevices.getUserMedia(c),
    MediaRecorder: MR,
    isTypeSupported: (m: string) => !!(MR && MR.isTypeSupported && MR.isTypeSupported(m)),
    setTimeout: (cb, ms) => setTimeout(cb, ms),
    clearTimeout: (id) => clearTimeout(id),
  }
}

// Opus-in-webm is the broadly-supported MediaRecorder audio target; Safari emits mp4/aac. Feature-pick.
const DICTATION_MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']
function pickDictationMime(deps: Pick<DictationDeps, 'isTypeSupported'>): string | null {
  for (const c of DICTATION_MIME_CANDIDATES) { if (deps.isTypeSupported(c)) return c }
  return null
}

export class LiveDictation {
  onTranscript = (_text: string) => {}
  onError = (_type: string, _message: string) => {}
  onStatus = (_type: 'retrying' | 'idle', _message: string) => {}
  onStop = () => {}
  // Fired (instead of onStop) when the server endpoint is unreachable on the first segment, so the host
  // can seamlessly fall back to VoiceInput (Web Speech). The mic/recorder are already torn down.
  onUnavailable = () => {}

  static SEGMENT_MS = 5000
  static MAX_SESSION_MS = 180000

  private _transcribe: DictationTranscribe
  private _deps: DictationDeps
  private _recording = false
  private _stream: any = null
  private _recorder: any = null
  private _chunks: BlobPart[] = []
  private _segTimer: any = null
  private _sessTimer: any = null
  private _mime: string | null = null
  private _firstSegment = true

  constructor(opts: { transcribe: DictationTranscribe; deps?: Partial<DictationDeps> }) {
    this._transcribe = opts.transcribe
    this._deps = { ...defaultDictationDeps(), ...(opts.deps || {}) }
  }

  // Feature-detect: mic capture + MediaRecorder. False on iOS Safari / anywhere without MediaRecorder.
  static isSupported(deps: Partial<DictationDeps> = {}): boolean {
    const md = (typeof navigator !== 'undefined' ? (navigator as any).mediaDevices : undefined)
    const hasGUM = !!(deps.getUserMedia || (md && typeof md.getUserMedia === 'function'))
    const MR = (deps as any).MediaRecorder ?? (globalThis as any).MediaRecorder
    return hasGUM && typeof MR !== 'undefined'
  }

  async start(): Promise<void> {
    if (this._recording) return
    this._recording = true
    this._firstSegment = true
    let stream: any
    try {
      stream = await this._deps.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    } catch (e: any) {
      this._recording = false
      const denied = e?.name === 'NotAllowedError' || e?.name === 'SecurityError'
      this.onError(denied ? 'not-allowed' : 'mic-error', denied ? 'Microphone access was denied' : 'Could not access the microphone')
      this.onStop()
      return
    }
    // getUserMedia is async (it shows the browser's mic-permission prompt). If the user pressed Stop while
    // that prompt was open, stop() already ran (_recording flipped false, onStop fired) BEFORE the grant
    // resolved here — so continuing would open a mic that never gets released (a zombie stream + a live
    // session timer) and surface no transcript. Release the just-granted stream and bail. Founder-repro:
    // "clicked Voice, nothing worked" when they re-clicked before the permission grant landed.
    if (!this._recording) {
      try { stream?.getTracks?.().forEach((t: any) => t.stop?.()) } catch { /* no-op */ }
      return
    }
    this._stream = stream
    this._mime = pickDictationMime(this._deps)
    try {
      this._recorder = this._mime
        ? new this._deps.MediaRecorder(this._stream, { mimeType: this._mime })
        : new this._deps.MediaRecorder(this._stream)
    } catch {
      try { this._recorder = new this._deps.MediaRecorder(this._stream) } catch { this._teardown(true); this.onError('mic-error', 'Recording is not supported here'); return }
    }
    this._recorder.ondataavailable = (ev: any) => { if (ev?.data && ev.data.size) this._chunks.push(ev.data) }
    this._recorder.onstop = () => { void this._flushSegment() }
    this._sessTimer = this._deps.setTimeout(() => this.stop(), LiveDictation.MAX_SESSION_MS)
    this._beginSegment()
  }

  private _beginSegment(): void {
    if (!this._recording || !this._recorder) return
    this._chunks = []
    try { this._recorder.start() } catch { /* already recording — ignore */ }
    this._segTimer = this._deps.setTimeout(() => {
      try { if (this._recorder && this._recorder.state !== 'inactive') this._recorder.stop() } catch { /* no-op */ }
    }, LiveDictation.SEGMENT_MS)
  }

  private async _flushSegment(): Promise<void> {
    if (this._segTimer != null) { this._deps.clearTimeout(this._segTimer); this._segTimer = null }
    const chunks = this._chunks
    this._chunks = []
    const wasFirst = this._firstSegment
    this._firstSegment = false
    const stillGoing = this._recording

    if (chunks.length) {
      const blob = new Blob(chunks, { type: (this._mime || 'audio/webm').split(';')[0] })
      let result: { text: string } | null = null
      try { result = await this._transcribe(blob) } catch { result = null }
      if (result === null) {
        // Endpoint unreachable. On the FIRST segment, hand off to the Web-Speech fallback; on a later
        // segment, swallow it (best-effort) and keep the session going.
        if (wasFirst) { this._teardown(false); this.onUnavailable(); return }
        this.onStatus('retrying', 'Reconnecting dictation…')
      } else {
        if (this._firstSegment === false) this.onStatus('idle', '')
        const text = (result.text || '').trim()
        if (text) this.onTranscript(text)
      }
    }

    if (stillGoing && this._recording) this._beginSegment()
    else this._teardown(true)
  }

  stop(): void {
    if (!this._recording) return
    this._recording = false
    // Stop the current segment; its onstop → _flushSegment transcribes the final chunk, then (because
    // _recording is now false) calls _teardown(true)/onStop. If the recorder is already inactive, tear down now.
    if (this._segTimer != null) { this._deps.clearTimeout(this._segTimer); this._segTimer = null }
    let pending = false
    try {
      if (this._recorder && this._recorder.state !== 'inactive') { this._recorder.stop(); pending = true }
    } catch { /* no-op */ }
    if (!pending) this._teardown(true)
  }

  private _teardown(fireStop: boolean): void {
    this._recording = false
    if (this._segTimer != null) { this._deps.clearTimeout(this._segTimer); this._segTimer = null }
    if (this._sessTimer != null) { this._deps.clearTimeout(this._sessTimer); this._sessTimer = null }
    try { this._stream?.getTracks?.().forEach((t: any) => t.stop?.()) } catch { /* no-op */ }
    this._stream = null
    if (this._recorder) { this._recorder.ondataavailable = null; this._recorder.onstop = null; this._recorder = null }
    if (fireStop) this.onStop()
  }
}

// ── #647: LIVE STREAMING dictation over a WebSocket ─────────────────────────────────────────────────
// LiveDictation (above) records 5s SEGMENTS and POSTs each to the batch STT endpoint — text only lands
// every ~5s. StreamingDictation instead opens a WebSocket to the server's /api/voice/stream relay and
// streams the mic CONTINUOUSLY (MediaRecorder timeslice → binary frames), so interim + final transcripts
// arrive in near real-time. It mirrors LiveDictation's callback shape (so the composer wires it the same
// way) and ADDS onInterim for live partials.
//
// Fallback contract (identical spirit to LiveDictation): if the socket can't connect, is rejected (401/
// 404/501), or produces no server message before a short timeout, it fires onUnavailable() so the host
// can transparently drop to LiveDictation (batch) and then VoiceInput (Web Speech). A mid-session drop
// (after it WAS connected) auto-reconnects with bounded backoff rather than giving up.
export type StreamMsg = { type: 'interim' | 'final' | 'ready' | 'error' | 'timeout'; text?: string; message?: string }

export interface StreamingDeps {
  getUserMedia: (constraints: any) => Promise<any>
  MediaRecorder: any
  isTypeSupported: (mime: string) => boolean
  WebSocket: any
  setTimeout: (cb: () => void, ms: number) => any
  clearTimeout: (id: any) => void
}

export function defaultStreamingDeps(): StreamingDeps {
  const g: any = globalThis as any
  const MR = g.MediaRecorder
  return {
    getUserMedia: (c: any) => (navigator as any).mediaDevices.getUserMedia(c),
    MediaRecorder: MR,
    isTypeSupported: (m: string) => !!(MR && MR.isTypeSupported && MR.isTypeSupported(m)),
    WebSocket: g.WebSocket,
    setTimeout: (cb, ms) => setTimeout(cb, ms),
    clearTimeout: (id) => clearTimeout(id),
  }
}

export class StreamingDictation {
  // FINAL committed text (appended by the host, exactly like LiveDictation.onTranscript).
  onTranscript = (_text: string) => {}
  // Live partial — the host shows this as a transient preview, replaced on each interim, dropped on final.
  onInterim = (_text: string) => {}
  onError = (_type: string, _message: string) => {}
  onStatus = (_type: 'retrying' | 'idle', _message: string) => {}
  onStop = () => {}
  // Fired (instead of onStop) when the socket never connected / was rejected — host falls back to batch.
  onUnavailable = () => {}

  static MAX_SESSION_MS = 180000
  static TIMESLICE_MS = 250
  // If no server message (ready/interim/final) lands within this window after open, treat as unavailable.
  static CONNECT_TIMEOUT_MS = 4000
  static MAX_RECONNECTS = 3
  static BASE_BACKOFF_MS = 500
  static MAX_BACKOFF_MS = 4000

  private _url: string
  private _deps: StreamingDeps
  private _recording = false
  private _stream: any = null
  private _recorder: any = null
  private _ws: any = null
  private _mime: string | null = null
  private _connected = false          // received at least one server message this connection
  private _everConnected = false      // connected at least once this whole session
  private _connectTimer: any = null
  private _sessTimer: any = null
  private _reconnects = 0
  private _stopped = false

  constructor(opts: { url: string; deps?: Partial<StreamingDeps> }) {
    this._url = opts.url
    this._deps = { ...defaultStreamingDeps(), ...(opts.deps || {}) }
  }

  // Feature-detect: WebSocket + MediaRecorder + getUserMedia. False on anything missing one.
  static isSupported(deps: Partial<StreamingDeps> = {}): boolean {
    const g: any = globalThis as any
    const md = (typeof navigator !== 'undefined' ? (navigator as any).mediaDevices : undefined)
    const hasGUM = !!(deps.getUserMedia || (md && typeof md.getUserMedia === 'function'))
    const MR = (deps as any).MediaRecorder ?? g.MediaRecorder
    const WS = (deps as any).WebSocket ?? g.WebSocket
    return hasGUM && typeof MR !== 'undefined' && typeof WS !== 'undefined'
  }

  async start(): Promise<void> {
    if (this._recording) return
    this._recording = true
    this._stopped = false
    this._everConnected = false
    this._reconnects = 0
    let stream: any
    try {
      stream = await this._deps.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    } catch (e: any) {
      this._recording = false
      const denied = e?.name === 'NotAllowedError' || e?.name === 'SecurityError'
      this.onError(denied ? 'not-allowed' : 'mic-error', denied ? 'Microphone access was denied' : 'Could not access the microphone')
      this.onStop()
      return
    }
    // stop() during the async permission prompt → release the late-granted mic (mirror LiveDictation).
    if (!this._recording) {
      try { stream?.getTracks?.().forEach((t: any) => t.stop?.()) } catch { /* no-op */ }
      return
    }
    this._stream = stream
    this._mime = pickDictationMime(this._deps)
    // Overall session cap spans reconnects — set once, cleared on stop.
    this._sessTimer = this._deps.setTimeout(() => this.stop(), StreamingDictation.MAX_SESSION_MS)
    this._openSocket()
  }

  private _openSocket(): void {
    if (!this._recording) return
    this._connected = false
    let ws: any
    try {
      ws = new this._deps.WebSocket(this._url)
    } catch {
      this._onDrop()
      return
    }
    this._ws = ws
    try { ws.binaryType = 'arraybuffer' } catch { /* not all impls expose it */ }
    // Connect timeout: if the socket opens but the server never speaks (or never opens), close it — the
    // onclose handler funnels into _onDrop (which, having never connected, fires onUnavailable). We do NOT
    // call _onDrop directly here, so it runs exactly once.
    this._connectTimer = this._deps.setTimeout(() => {
      if (!this._connected) { try { ws.close() } catch { this._onDrop() } }
    }, StreamingDictation.CONNECT_TIMEOUT_MS)

    ws.onopen = () => { this._startRecorder() }
    ws.onmessage = (ev: any) => {
      let msg: StreamMsg | null = null
      try { msg = typeof ev.data === 'string' ? JSON.parse(ev.data) : null } catch { msg = null }
      if (!msg) return
      // First server message this connection = healthy. Clear connect timeout + reconnect budget + status.
      if (!this._connected) {
        this._connected = true
        this._everConnected = true
        this._reconnects = 0
        this._clearConnectTimer()
        if (this._statusShown) { this._statusShown = false; this.onStatus('idle', '') }
      }
      if (msg.type === 'interim') { if (msg.text) this.onInterim(msg.text) }
      else if (msg.type === 'final') { const t = (msg.text || '').trim(); if (t) this.onTranscript(t) }
      else if (msg.type === 'error') { /* server relay error → let onclose handle recovery/fallback */ }
      // 'ready' / 'timeout' need no client action beyond the healthy-connection bookkeeping above.
    }
    ws.onerror = () => { /* onclose always follows — funnel recovery there (mirrors VoiceInput) */ }
    ws.onclose = () => {
      this._clearConnectTimer()
      this._ws = null
      this._onDrop()
    }
  }

  private _statusShown = false

  // A socket closed/failed. If we were mid-session and had connected at least once, reconnect with backoff;
  // if we never connected at all → onUnavailable so the host falls back to batch dictation.
  private _onDrop(): void {
    if (this._stopped || !this._recording) { this._finishStop(); return }
    if (!this._everConnected) {
      // Never got a single message — the endpoint is unreachable/unsupported. Hand off to the fallback.
      this._teardown(false)
      this.onUnavailable()
      return
    }
    if (this._reconnects >= StreamingDictation.MAX_RECONNECTS) {
      this.onError('network', 'Voice disconnected — tap Voice to try again')
      this._teardown(true)
      return
    }
    this._reconnects++
    if (!this._statusShown) { this._statusShown = true; this.onStatus('retrying', 'Reconnecting dictation…') }
    const delay = Math.min(StreamingDictation.MAX_BACKOFF_MS, StreamingDictation.BASE_BACKOFF_MS * 2 ** (this._reconnects - 1))
    this._stopRecorder()
    this._deps.setTimeout(() => { if (this._recording) this._openSocket() }, delay)
  }

  private _startRecorder(): void {
    if (!this._recording || !this._ws) return
    // A reconnect reuses the same mic stream; only build the recorder once.
    if (this._recorder) { try { if (this._recorder.state === 'inactive') this._recorder.start(StreamingDictation.TIMESLICE_MS) } catch { /* no-op */ } ; return }
    try {
      this._recorder = this._mime
        ? new this._deps.MediaRecorder(this._stream, { mimeType: this._mime })
        : new this._deps.MediaRecorder(this._stream)
    } catch {
      try { this._recorder = new this._deps.MediaRecorder(this._stream) } catch { this._teardown(true); this.onError('mic-error', 'Recording is not supported here'); return }
    }
    this._recorder.ondataavailable = (ev: any) => {
      const data = ev?.data
      if (data && data.size && this._ws) { try { this._ws.send(data) } catch { /* no-op */ } }
    }
    try { this._recorder.start(StreamingDictation.TIMESLICE_MS) } catch { /* already recording — ignore */ }
  }

  private _stopRecorder(): void {
    try { if (this._recorder && this._recorder.state !== 'inactive') this._recorder.stop() } catch { /* no-op */ }
  }

  stop(): void {
    if (!this._recording) { if (!this._stopped) { this._stopped = true } return }
    this._recording = false
    this._stopped = true
    // Ask the server to flush the final transcript, then close.
    try { this._ws?.send?.(JSON.stringify({ type: 'stop' })) } catch { /* no-op */ }
    this._teardown(true)
  }

  private _teardown(fireStop: boolean): void {
    this._recording = false
    this._clearConnectTimer()
    if (this._sessTimer != null) { this._deps.clearTimeout(this._sessTimer); this._sessTimer = null }
    this._stopRecorder()
    if (this._recorder) { this._recorder.ondataavailable = null; this._recorder = null }
    try { this._stream?.getTracks?.().forEach((t: any) => t.stop?.()) } catch { /* no-op */ }
    this._stream = null
    if (this._ws) { try { this._ws.onclose = null; this._ws.onmessage = null; this._ws.onerror = null; this._ws.close() } catch { /* no-op */ } ; this._ws = null }
    if (fireStop) this._finishStop()
  }

  private _stopFired = false
  private _finishStop(): void {
    if (this._stopFired) return
    this._stopFired = true
    this.onStop()
  }

  private _clearConnectTimer(): void {
    if (this._connectTimer != null) { this._deps.clearTimeout(this._connectTimer); this._connectTimer = null }
  }
}

// Pure engine-selection: prefer the server dictation endpoint when the host wired it AND MediaRecorder is
// available; else the Web Speech backend; else nothing (button hidden). Kept pure so the composer + tests
// share one source of truth. `hasEndpoint` = the host provided an onDictate callback.
export type DictationMode = 'server' | 'webspeech' | 'none'
export function pickDictationMode(opts: {
  hasEndpoint: boolean
  mediaRecorderSupported: boolean
  webSpeechSupported: boolean
}): DictationMode {
  if (opts.hasEndpoint && opts.mediaRecorderSupported) return 'server'
  if (opts.webSpeechSupported) return 'webspeech'
  return 'none'
}
