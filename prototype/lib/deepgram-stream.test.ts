// #647 — LIVE streaming dictation relay (server → Deepgram WS). Exercised against a MOCK Deepgram socket
// so NO real Deepgram / network is hit. Covers: URL build, message parsing, relay forwarding (interim +
// final + seconds tracking + KeepAlive + CloseStream flush), the pure upgrade gate, and the ws-lifecycle
// handlers (open/message/close: relay wiring, audio relay, cap-close, cost ledger).
import { expect, test, describe } from "bun:test"
import {
  buildDeepgramStreamUrl,
  parseDeepgramStreamMessage,
  DeepgramRelay,
  evaluateVoiceStreamUpgrade,
  createVoiceStreamWsHandlers,
  type VoiceStreamData,
} from "./deepgram-stream"

// A MOCK Deepgram WebSocket. Captures the auth header + everything sent, and lets the test drive
// open/message/close callbacks. Never touches the network.
class MockUpstream {
  static instances: MockUpstream[] = []
  url: string
  opts: any
  sent: any[] = []
  onopen: any = null
  onmessage: any = null
  onclose: any = null
  onerror: any = null
  closed = false
  constructor(url: string, opts?: any) { this.url = url; this.opts = opts; MockUpstream.instances.push(this) }
  send(d: any) { this.sent.push(d) }
  close() { this.closed = true; this.onclose?.() }
  // Test helpers
  open() { this.onopen?.() }
  emit(obj: any) { this.onmessage?.({ data: JSON.stringify(obj) }) }
}

function relayDeps(over: Partial<any> = {}) {
  return {
    WebSocketCtor: MockUpstream as any,
    setInterval: (cb: any, _ms: number) => { (relayDeps as any)._ka = cb; return 1 },
    clearInterval: (_id: any) => {},
    key: "test-key",
    model: "nova-2",
    endpoint: "wss://mock.deepgram/v1/listen",
    ...over,
  }
}

describe("buildDeepgramStreamUrl", () => {
  test("sets the streaming query params", () => {
    const u = new URL(buildDeepgramStreamUrl("nova-2", "wss://api.deepgram.com/v1/listen"))
    expect(u.protocol).toBe("wss:")
    expect(u.searchParams.get("model")).toBe("nova-2")
    expect(u.searchParams.get("interim_results")).toBe("true")
    expect(u.searchParams.get("punctuate")).toBe("true")
    expect(u.searchParams.get("smart_format")).toBe("true")
    expect(u.searchParams.get("endpointing")).toBe("300")
  })
})

describe("parseDeepgramStreamMessage", () => {
  test("interim Results → interim transcript + seconds", () => {
    const p = parseDeepgramStreamMessage(JSON.stringify({
      type: "Results", is_final: false, start: 1.0, duration: 0.5,
      channel: { alternatives: [{ transcript: "hello" }] },
    }))
    expect(p?.transcript).toEqual({ type: "interim", text: "hello" })
    expect(p?.seconds).toBeCloseTo(1.5)
  })
  test("final Results → final transcript", () => {
    const p = parseDeepgramStreamMessage({
      type: "Results", is_final: true, start: 2, duration: 1,
      channel: { alternatives: [{ transcript: "hello world" }] },
    })
    expect(p?.transcript).toEqual({ type: "final", text: "hello world" })
    expect(p?.seconds).toBeCloseTo(3)
  })
  test("Metadata → seconds only, no transcript", () => {
    const p = parseDeepgramStreamMessage({ type: "Metadata", duration: 12.3 })
    expect(p?.transcript).toBeNull()
    expect(p?.seconds).toBeCloseTo(12.3)
  })
  test("garbage / non-Results → null", () => {
    expect(parseDeepgramStreamMessage("not json")).toBeNull()
    expect(parseDeepgramStreamMessage({ type: "SpeechStarted" })).toBeNull()
  })
})

describe("DeepgramRelay", () => {
  test("passes the Token auth header + streaming URL to the upstream ctor", () => {
    MockUpstream.instances = []
    const relay = new DeepgramRelay({ onMessage: () => {} }, relayDeps())
    relay.start()
    const up = MockUpstream.instances[0]
    expect(up.opts?.headers?.Authorization).toBe("Token test-key")
    expect(up.url).toContain("interim_results=true")
  })

  test("forwards interim + final frames and tracks seconds; buffers audio until open", () => {
    MockUpstream.instances = []
    const msgs: any[] = []
    const relay = new DeepgramRelay({ onMessage: (m) => msgs.push(m) }, relayDeps())
    relay.start()
    const up = MockUpstream.instances[0]
    // Audio pushed BEFORE open is buffered, not sent.
    relay.pushAudio(new Uint8Array([1, 2, 3]))
    expect(up.sent.length).toBe(0)
    up.open()
    // Buffered audio flushed on open.
    expect(up.sent.length).toBe(1)
    // Post-open audio relays straight through.
    relay.pushAudio(new Uint8Array([4, 5]))
    expect(up.sent.length).toBe(2)
    // Deepgram frames → client messages.
    up.emit({ type: "Results", is_final: false, start: 0, duration: 0.4, channel: { alternatives: [{ transcript: "hel" }] } })
    up.emit({ type: "Results", is_final: true, start: 0, duration: 0.9, channel: { alternatives: [{ transcript: "hello" }] } })
    expect(msgs).toEqual([{ type: "interim", text: "hel" }, { type: "final", text: "hello" }])
    expect(relay.seconds).toBeCloseTo(0.9)
    // Empty interim (silence) is not forwarded.
    up.emit({ type: "Results", is_final: false, start: 1, duration: 0.1, channel: { alternatives: [{ transcript: "  " }] } })
    expect(msgs.length).toBe(2)
  })

  test("finish() sends CloseStream; keepalive pings after open", () => {
    MockUpstream.instances = []
    let kaCb: any = null
    const relay = new DeepgramRelay({ onMessage: () => {} }, relayDeps({ setInterval: (cb: any) => { kaCb = cb; return 7 } }))
    relay.start()
    const up = MockUpstream.instances[0]
    up.open()
    kaCb() // fire the keepalive tick
    relay.finish()
    const texts = up.sent.filter((s) => typeof s === "string")
    expect(texts).toContain(JSON.stringify({ type: "KeepAlive" }))
    expect(texts).toContain(JSON.stringify({ type: "CloseStream" }))
  })

  test("onError when the upstream ctor throws", () => {
    let err: string | null = null
    const throwing = relayDeps({ WebSocketCtor: class { constructor() { throw new Error("boom") } } as any })
    const relay = new DeepgramRelay({ onMessage: () => {}, onError: (e) => { err = e } }, throwing)
    relay.start()
    expect(err).toBe("boom")
  })
})

describe("evaluateVoiceStreamUpgrade", () => {
  const base = { projectId: "p1", rateOk: true, projectExists: true, configured: true }
  test("ok when all gates pass", () => {
    expect(evaluateVoiceStreamUpgrade(base)).toEqual({ ok: true })
  })
  test("429 when rate limited", () => {
    expect(evaluateVoiceStreamUpgrade({ ...base, rateOk: false })).toMatchObject({ ok: false, status: 429 })
  })
  test("400 when no project id", () => {
    expect(evaluateVoiceStreamUpgrade({ ...base, projectId: "" })).toMatchObject({ ok: false, status: 400 })
  })
  test("404 when project missing (same gate as batch route)", () => {
    expect(evaluateVoiceStreamUpgrade({ ...base, projectExists: false })).toMatchObject({ ok: false, status: 404 })
  })
  test("501 + fallback when Deepgram unconfigured", () => {
    const r = evaluateVoiceStreamUpgrade({ ...base, configured: false })
    expect(r).toMatchObject({ ok: false, status: 501 })
    expect((r as any).body.fallback).toBe(true)
  })
})

describe("createVoiceStreamWsHandlers", () => {
  function fakeWs(): any {
    const data: VoiceStreamData = { ip: "1.2.3.4", projectId: "p1", startedAt: Date.now(), relay: null, timer: null }
    return { data, sent: [] as any[], closed: false, send(m: any) { this.sent.push(m) }, close() { this.closed = true } }
  }
  // A relay stand-in recording lifecycle calls.
  function fakeRelay() {
    return { started: false, audio: [] as any[], finished: false, closed: false, _seconds: 4.2,
      start() { this.started = true }, pushAudio(c: any) { this.audio.push(c) },
      finish() { this.finished = true }, close() { this.closed = true }, get seconds() { return this._seconds } }
  }

  test("open() starts a relay and forwards its messages/ready to the client", () => {
    const relay = fakeRelay()
    let hooks: any
    const h = createVoiceStreamWsHandlers({ makeRelay: (hk) => { hooks = hk; return relay as any }, recordCost: () => {}, setTimeout: () => 1, clearTimeout: () => {} })
    const ws = fakeWs()
    h.open(ws)
    expect(relay.started).toBe(true)
    hooks.onReady()
    hooks.onMessage({ type: "final", text: "hi" })
    expect(ws.sent).toContain(JSON.stringify({ type: "ready" }))
    expect(ws.sent).toContain(JSON.stringify({ type: "final", text: "hi" }))
  })

  test("message() relays binary audio and flushes on a 'stop' control frame", () => {
    const relay = fakeRelay()
    const h = createVoiceStreamWsHandlers({ makeRelay: () => relay as any, recordCost: () => {}, setTimeout: () => 1, clearTimeout: () => {} })
    const ws = fakeWs(); h.open(ws)
    const audio = new Uint8Array([9, 9])
    h.message(ws, audio)
    expect(relay.audio.length).toBe(1)
    h.message(ws, JSON.stringify({ type: "stop" }))
    expect(relay.finished).toBe(true)
  })

  test("max-session timer flushes + closes the socket", () => {
    const relay = fakeRelay()
    let capMs = 0; let capCb: any = null
    const h = createVoiceStreamWsHandlers({ makeRelay: () => relay as any, recordCost: () => {}, maxSessionMs: 180000, setTimeout: (cb, ms) => { capCb = cb; capMs = ms; return 1 }, clearTimeout: () => {} })
    const ws = fakeWs(); h.open(ws)
    expect(capMs).toBe(180000)
    capCb() // simulate the cap firing
    expect(relay.finished).toBe(true)
    expect(ws.closed).toBe(true)
  })

  test("close() tears the relay down and logs streamed-second cost", () => {
    const relay = fakeRelay()
    const costs: any[] = []
    const h = createVoiceStreamWsHandlers({ makeRelay: () => relay as any, recordCost: (pid, s) => costs.push([pid, s]), setTimeout: () => 1, clearTimeout: () => {} })
    const ws = fakeWs(); h.open(ws)
    h.close(ws)
    expect(relay.closed).toBe(true)
    expect(costs).toEqual([["p1", 4.2]])
  })
})
