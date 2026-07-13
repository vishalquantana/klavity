export class VoiceInput {
  onTranscript = (text: string) => {}
  onError = (type: string, message: string) => {}
  onStop = () => {}
  private _recognition: any = null
  private _timer: ReturnType<typeof setTimeout> | null = null
  private _recording = false

  static isSupported(): boolean {
    return typeof window !== 'undefined' &&
      !!((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition)
  }

  start() {
    if (this._recording || !VoiceInput.isSupported()) return
    this._recording = true
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    this._recognition = new SR()
    this._recognition.continuous = true
    this._recognition.interimResults = false
    this._recognition.lang = (typeof document !== 'undefined' && document.documentElement.lang) || 'en-US'
    this._recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) this.onTranscript(event.results[i][0].transcript)
      }
    }
    this._recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') { this.stop(); return }
      const msgs: Record<string, string> = {
        'not-allowed': 'Microphone access was denied',
        'network': 'Voice recognition lost connection',
      }
      this.onError(event.error, msgs[event.error] ?? '')
      this.stop()
    }
    this._recognition.onend = () => {
      if (this._recording) { this._recording = false; this._clearTimer(); this._recognition = null; this.onStop() }
    }
    this._recognition.start()
    this._timer = setTimeout(() => this.stop(), 180000)
  }

  stop() {
    if (!this._recording) return
    this._recording = false
    this._clearTimer()
    if (this._recognition) { this._recognition.onend = null; this._recognition.stop(); this._recognition = null }
    this.onStop()
  }

  private _clearTimer() {
    if (this._timer !== null) { clearTimeout(this._timer); this._timer = null }
  }
}
