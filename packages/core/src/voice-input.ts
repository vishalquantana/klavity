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
  // KLAVITYKLA-495: the browser Web Speech backend (Google's server for webkitSpeechRecognition) drops with
  // an 'error: network' fairly often in injected-widget contexts. Rather than surface a bare "lost
  // connection" on the first blip, auto-retry a couple of times before giving up.
  private _retries = 0
  private _retrying = false
  private static readonly MAX_RETRIES = 2
  private static readonly RETRY_DELAY_MS = 500

  static isSupported(): boolean {
    return typeof window !== 'undefined' &&
      !!((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition)
  }

  start() {
    if (this._recording || !VoiceInput.isSupported()) return
    this._recording = true
    this._retries = 0
    this._retrying = false
    // Overall session cap spans across any retries — set once here, cleared on stop.
    this._timer = setTimeout(() => this.stop(), 180000)
    this._begin()
  }

  // Spin up a fresh SpeechRecognition instance. Called on start() and again on each auto-retry so a
  // dropped connection reconnects transparently while _recording stays true.
  private _begin() {
    if (!this._recording) return
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    const rec = new SR()
    this._recognition = rec
    rec.continuous = true
    rec.interimResults = false
    rec.lang = (typeof document !== 'undefined' && document.documentElement.lang) || 'en-US'
    rec.onresult = (event: any) => {
      // A real result means the connection recovered — reset the retry budget and clear any status.
      if (this._retries > 0) { this._retries = 0; this.onStatus('idle', '') }
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) this.onTranscript(event.results[i][0].transcript)
      }
    }
    rec.onerror = (event: any) => {
      if (event.error === 'no-speech') { this.stop(); return }
      // KLAVITYKLA-495: 'network' (and 'aborted') are transient — try to reconnect a couple of times before
      // surfacing an error. onend fires right after onerror; we flag _retrying so onend restarts instead of
      // stopping. This is a CLIENT-side recovery of the browser speech backend — no Klavity server involved.
      if ((event.error === 'network' || event.error === 'aborted') && this._retries < VoiceInput.MAX_RETRIES) {
        this._retries++
        this._retrying = true
        this.onStatus('retrying', 'Reconnecting voice…')
        return
      }
      const msgs: Record<string, string> = {
        'not-allowed': 'Microphone access was denied',
        'network': 'Voice disconnected — tap Voice to try again',
      }
      this.onError(event.error, msgs[event.error] ?? '')
      this.stop()
    }
    rec.onend = () => {
      if (this._retrying) {
        this._retrying = false
        this._recognition = null
        // Brief backoff, then reconnect if the user hasn't stopped in the meantime.
        this._retryTimer = setTimeout(() => { this._retryTimer = null; this._begin() }, VoiceInput.RETRY_DELAY_MS)
        return
      }
      if (this._recording) { this._recording = false; this._clearTimers(); this._recognition = null; this.onStop() }
    }
    rec.start()
  }

  stop() {
    if (!this._recording) return
    this._recording = false
    this._retrying = false
    this._clearTimers()
    if (this._recognition) { this._recognition.onend = null; this._recognition.stop(); this._recognition = null }
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
    try {
      this._stream = await this._deps.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
    } catch (e: any) {
      this._recording = false
      const denied = e?.name === 'NotAllowedError' || e?.name === 'SecurityError'
      this.onError(denied ? 'not-allowed' : 'mic-error', denied ? 'Microphone access was denied' : 'Could not access the microphone')
      this.onStop()
      return
    }
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
