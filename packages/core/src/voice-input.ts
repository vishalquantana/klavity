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
