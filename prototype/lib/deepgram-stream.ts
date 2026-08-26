// #647 — LIVE STREAMING dictation relay (server → Deepgram WebSocket).
//
// The batch path (transcribe.ts + POST /api/voice/transcribe) records 5s clips and POSTs each to
// Deepgram's PRERECORDED API — text only appears every ~5s. This module drives Deepgram's STREAMING
// (WebSocket) API instead: the client opens a WS to /api/voice/stream, streams live mic audio frames,
// and the server RELAYS them to Deepgram over a second WS, forwarding interim + final transcripts back
// to the client in near real-time. transcribe.ts (batch) is left completely untouched as the fallback.
//
// This file holds ONLY the relay + ws-lifecycle logic (kept out of server.ts so it is unit-testable
// against a MOCK Deepgram WS — no real network). server.ts wires the real `WebSocket` ctor + the real
// cost ledger in. The Deepgram auth header is `Authorization: Token <key>` (identical to the batch path).
import { DEEPGRAM_MODEL, deepgramConfigured, deepgramCostUsd } from "./transcribe"

export { deepgramConfigured, deepgramCostUsd, DEEPGRAM_MODEL }

// Server-side ONLY (mirrors transcribe.ts' private deepgramKey — kept local so transcribe.ts stays
// untouched). Never sent to the client, never logged/committed.
function deepgramKey(): string | undefined {
  return process.env.DEEPGRAM_API_KEY
}

// Deepgram streaming endpoint (wss). Overridable at deploy / pointed at a mock by tests.
export const DEEPGRAM_STREAM_ENDPOINT =
  process.env.KLAV_DEEPGRAM_STREAM_ENDPOINT || "wss://api.deepgram.com/v1/listen"

// Keep the client's max session in lockstep with the batch client's LiveDictation.MAX_SESSION_MS (180s).
export const VOICE_STREAM_MAX_SESSION_MS = Number(process.env.KLAV_VOICE_STREAM_MAX_MS || 180_000)
// How often we ping Deepgram with a KeepAlive so it doesn't close an idle (silent) socket.
const KEEPALIVE_MS = Number(process.env.KLAV_VOICE_STREAM_KEEPALIVE_MS || 8_000)

// A minimal WebSocket-constructor shape. Bun's global WebSocket accepts an options arg carrying `headers`
// (`new WebSocket(url, { headers })`), which the standard DOM type does not model — so we type it loosely.
export type WSLike = {
  send(data: any): void
  close(code?: number, reason?: string): void
  onopen?: ((ev?: any) => void) | null
  onmessage?: ((ev: { data: any }) => void) | null
  onclose?: ((ev?: any) => void) | null
  onerror?: ((ev?: any) => void) | null
}
export type WSCtor = new (url: string, opts?: any) => WSLike

// Build the Deepgram streaming URL. interim_results=true gives live partials; endpointing=300 finalizes
// ~300ms after speech pauses. Mirrors the batch query params (punctuate + smart_format) for parity.
export function buildDeepgramStreamUrl(model = DEEPGRAM_MODEL, endpoint = DEEPGRAM_STREAM_ENDPOINT): string {
  const u = new URL(endpoint)
  u.searchParams.set("model", model)
  u.searchParams.set("interim_results", "true")
  u.searchParams.set("punctuate", "true")
  u.searchParams.set("smart_format", "true")
  u.searchParams.set("endpointing", "300")
  return u.toString()
}

export type StreamTranscript = { type: "interim" | "final"; text: string }

// Parse one Deepgram streaming JSON message. Deepgram sends {type:'Results', channel.alternatives[0].
// transcript, is_final, start, duration} for transcripts and {type:'Metadata', duration} at the end.
// Returns the transcript (empty text included so callers can decide) plus the running audio-seconds mark
// (start+duration for Results, duration for Metadata), or null for anything unrecognized/unparseable.
export function parseDeepgramStreamMessage(
  raw: any,
): { transcript: StreamTranscript | null; seconds: number | null } | null {
  let data: any = raw
  if (typeof raw === "string") {
    try { data = JSON.parse(raw) } catch { return null }
  }
  if (!data || typeof data !== "object") return null
  if (data.type === "Metadata") {
    const d = Number(data.duration)
    return { transcript: null, seconds: Number.isFinite(d) ? d : null }
  }
  if (data.type && data.type !== "Results") return null
  const alt = data?.channel?.alternatives?.[0]
  if (!alt) return null
  const text = typeof alt.transcript === "string" ? alt.transcript : ""
  const isFinal = !!data.is_final
  const start = Number(data.start) || 0
  const dur = Number(data.duration) || 0
  return { transcript: { type: isFinal ? "final" : "interim", text }, seconds: start + dur }
}

export interface DeepgramRelayHooks {
  // A non-empty interim/final transcript to forward to the client.
  onMessage: (msg: StreamTranscript) => void
  // Deepgram's socket opened — safe to stream audio (any buffered audio is flushed automatically).
  onReady?: () => void
  // Deepgram's socket closed (end of stream / upstream drop).
  onUpstreamClose?: () => void
  // Relay-level error (couldn't open upstream / upstream errored).
  onError?: (reason: string) => void
}

export interface RelayDeps {
  WebSocketCtor: WSCtor
  setInterval: (cb: () => void, ms: number) => any
  clearInterval: (id: any) => void
  key: string
  model: string
  endpoint: string
}

function defaultRelayDeps(): RelayDeps {
  return {
    WebSocketCtor: (globalThis as any).WebSocket as WSCtor,
    setInterval: (cb, ms) => setInterval(cb, ms),
    clearInterval: (id) => clearInterval(id),
    key: deepgramKey() || "",
    model: DEEPGRAM_MODEL,
    endpoint: DEEPGRAM_STREAM_ENDPOINT,
  }
}

// Cap on audio bytes buffered before the upstream socket is open (guards a slow-connect memory spike). A
// few hundred ms of Opus is tens of KB; 4MB is a very generous ceiling before we start dropping frames.
const PENDING_CAP_BYTES = Number(process.env.KLAV_VOICE_STREAM_PENDING_CAP || 4 * 1024 * 1024)

// One live client↔Deepgram relay. Opens the upstream WS on start(), buffers client audio until it's open,
// forwards Deepgram transcripts via hooks.onMessage, sends periodic KeepAlives, and on finish() sends
// Deepgram's CloseStream control frame to flush the tail before the upstream closes. NEVER throws.
export class DeepgramRelay {
  private _up: WSLike | null = null
  private _deps: RelayDeps
  private _hooks: DeepgramRelayHooks
  private _keepAlive: any = null
  private _seconds = 0
  private _closed = false
  private _upOpen = false
  private _pending: any[] = []
  private _pendingBytes = 0

  constructor(hooks: DeepgramRelayHooks, deps: Partial<RelayDeps> = {}) {
    this._hooks = hooks
    this._deps = { ...defaultRelayDeps(), ...deps }
  }

  // Total audio seconds Deepgram reported for this session (for the cost ledger). 0 when nothing streamed.
  get seconds(): number { return this._seconds }

  start(): void {
    if (this._closed || this._up) return
    const url = buildDeepgramStreamUrl(this._deps.model, this._deps.endpoint)
    let up: WSLike
    try {
      up = new this._deps.WebSocketCtor(url, { headers: { Authorization: `Token ${this._deps.key}` } })
    } catch (e: any) {
      this._hooks.onError?.(e?.message || "upstream-open-failed")
      return
    }
    this._up = up
    up.onopen = () => {
      this._upOpen = true
      // Flush anything the client sent before Deepgram was ready.
      for (const chunk of this._pending) { try { up.send(chunk) } catch { /* no-op */ } }
      this._pending = []
      this._pendingBytes = 0
      this._keepAlive = this._deps.setInterval(() => {
        try { up.send(JSON.stringify({ type: "KeepAlive" })) } catch { /* no-op */ }
      }, KEEPALIVE_MS)
      this._hooks.onReady?.()
    }
    up.onmessage = (ev: { data: any }) => {
      const parsed = parseDeepgramStreamMessage(ev?.data)
      if (!parsed) return
      if (parsed.seconds != null && parsed.seconds > this._seconds) this._seconds = parsed.seconds
      const t = parsed.transcript
      // Skip empty transcripts (Deepgram emits blank interims during silence) — nothing to show.
      if (t && t.text && t.text.trim()) this._hooks.onMessage({ type: t.type, text: t.text })
    }
    up.onclose = () => {
      this._upOpen = false
      this._stopKeepAlive()
      if (!this._closed) this._hooks.onUpstreamClose?.()
    }
    up.onerror = (ev: any) => {
      this._hooks.onError?.(ev?.message || "upstream-error")
    }
  }

  // Client audio frame → Deepgram. Buffered (bounded) until the upstream socket is open.
  pushAudio(chunk: any): void {
    if (this._closed) return
    if (this._upOpen && this._up) {
      try { this._up.send(chunk) } catch { /* no-op */ }
      return
    }
    const size = Number(chunk?.byteLength ?? chunk?.length ?? 0) || 0
    if (this._pendingBytes + size > PENDING_CAP_BYTES) return // drop rather than OOM on a slow connect
    this._pending.push(chunk)
    this._pendingBytes += size
  }

  // Client is done speaking — ask Deepgram to flush the final transcript before it closes the socket.
  finish(): void {
    if (this._closed || !this._up) return
    try { this._up.send(JSON.stringify({ type: "CloseStream" })) } catch { /* no-op */ }
  }

  // Tear down the upstream socket + timers. Idempotent.
  close(): void {
    if (this._closed) return
    this._closed = true
    this._stopKeepAlive()
    this._pending = []
    this._pendingBytes = 0
    try { this._up?.close() } catch { /* no-op */ }
    this._up = null
  }

  private _stopKeepAlive(): void {
    if (this._keepAlive != null) { this._deps.clearInterval(this._keepAlive); this._keepAlive = null }
  }
}

// ── PURE upgrade gate ────────────────────────────────────────────────────────────────────────────────
// Mirrors POST /api/voice/transcribe's gate (per-IP rate limit → project must exist → STT must be
// configured). Kept pure so server.ts computes the inputs (rlAllow / projectById / deepgramConfigured)
// and this decides — trivially unit-testable. A rejection returns the HTTP status/body to reply with
// WITHOUT upgrading; ok:true means server.upgrade() may proceed.
export function evaluateVoiceStreamUpgrade(opts: {
  projectId: string
  rateOk: boolean
  projectExists: boolean
  configured: boolean
}): { ok: true } | { ok: false; status: number; body: any } {
  if (!opts.rateOk) return { ok: false, status: 429, body: { error: "rate limited" } }
  if (!opts.projectId) return { ok: false, status: 400, body: { error: "project required" } }
  if (!opts.projectExists) return { ok: false, status: 404, body: { error: "not found" } }
  // No Deepgram key → refuse the upgrade with 501 so the client transparently falls back to batch dictation.
  if (!opts.configured) return { ok: false, status: 501, body: { error: "streaming dictation unavailable", fallback: true } }
  return { ok: true }
}

// ── ws-lifecycle handlers factory ────────────────────────────────────────────────────────────────────
// Builds Bun `websocket` handlers (open/message/close) for /api/voice/stream. Kept a factory so tests
// drive it with a fake ws + a fake relay/recordCost (no Bun.serve, no real Deepgram). `ws.data` carries
// the per-connection state stamped at upgrade time (projectId + mutable relay/timer handles).
export interface VoiceStreamData {
  ip: string
  projectId: string
  startedAt: number
  relay: DeepgramRelay | null
  timer: any
}
export interface VoiceStreamWsDeps {
  makeRelay: (hooks: DeepgramRelayHooks) => DeepgramRelay
  // Log the streamed-audio COGS to the ai_calls / credits ledger (same path the batch route uses).
  recordCost: (projectId: string, seconds: number) => void
  maxSessionMs?: number
  setTimeout?: (cb: () => void, ms: number) => any
  clearTimeout?: (id: any) => void
}
type WSServer = {
  data: VoiceStreamData
  send(data: any): void
  close(code?: number, reason?: string): void
}
export function createVoiceStreamWsHandlers(deps: VoiceStreamWsDeps) {
  const maxMs = deps.maxSessionMs ?? VOICE_STREAM_MAX_SESSION_MS
  const st = deps.setTimeout ?? ((cb, ms) => setTimeout(cb, ms))
  const ct = deps.clearTimeout ?? ((id) => clearTimeout(id))
  const send = (ws: WSServer, obj: any) => { try { ws.send(JSON.stringify(obj)) } catch { /* client gone */ } }

  return {
    open(ws: WSServer) {
      const relay = deps.makeRelay({
        onMessage: (m) => send(ws, m),
        onReady: () => send(ws, { type: "ready" }),
        onUpstreamClose: () => { try { ws.close(1000, "upstream-closed") } catch { /* no-op */ } },
        onError: () => {
          send(ws, { type: "error", message: "stream error", fallback: true })
          try { ws.close(1011, "upstream-error") } catch { /* no-op */ }
        },
      })
      ws.data.relay = relay
      relay.start()
      // Hard session cap (mirrors the batch client's 180s ceiling) — flush + close when exceeded.
      ws.data.timer = st(() => {
        send(ws, { type: "timeout" })
        try { relay.finish() } catch { /* no-op */ }
        try { ws.close(1000, "max-session") } catch { /* no-op */ }
      }, maxMs)
    },
    message(ws: WSServer, message: any) {
      const relay = ws.data.relay
      if (!relay) return
      if (typeof message === "string") {
        // Control frame from the client: "stop" flushes the final transcript (Deepgram CloseStream).
        try {
          const j = JSON.parse(message)
          if (j && (j.type === "stop" || j.type === "CloseStream")) relay.finish()
        } catch { /* ignore malformed control frame */ }
        return
      }
      // Binary audio frame → relay straight to Deepgram.
      relay.pushAudio(message)
    },
    close(ws: WSServer) {
      const data = ws.data
      if (data.timer != null) { ct(data.timer); data.timer = null }
      const relay = data.relay
      if (relay) {
        try { relay.close() } catch { /* no-op */ }
        // Cost ledger: bill the streamed audio seconds (0 when nothing was transcribed).
        try { deps.recordCost(data.projectId, relay.seconds) } catch { /* best-effort */ }
        data.relay = null
      }
    },
  }
}
