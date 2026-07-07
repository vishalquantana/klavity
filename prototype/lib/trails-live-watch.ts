type LiveWatchEvent = {
  event: "hello" | "frame" | "status" | "end"
  runId: string
  projectId: string
  active: boolean
  ts: number
  seq: number
  dataUrl?: string
  message?: string
}

type LiveWatchState = {
  projectId: string
  runId: string
  active: boolean
  seq: number
  last?: LiveWatchEvent
  subscribers: Set<ReadableStreamDefaultController<Uint8Array>>
}

const enc = new TextEncoder()
const states = new Map<string, LiveWatchState>()

function key(projectId: string, runId: string): string {
  return `${projectId}:${runId}`
}

function stateFor(projectId: string, runId: string): LiveWatchState {
  const k = key(projectId, runId)
  let s = states.get(k)
  if (!s) {
    s = { projectId, runId, active: false, seq: 0, subscribers: new Set() }
    states.set(k, s)
  }
  return s
}

function sse(event: string, data: unknown): Uint8Array {
  return enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

function publish(s: LiveWatchState, event: LiveWatchEvent): void {
  s.last = event
  const chunk = sse(event.event, event)
  for (const sub of Array.from(s.subscribers)) {
    try { sub.enqueue(chunk) } catch { s.subscribers.delete(sub) }
  }
}

export function startLiveWatchRun(projectId: string, runId: string): void {
  const s = stateFor(projectId, runId)
  s.active = true
  publish(s, { event: "status", projectId, runId, active: true, ts: Date.now(), seq: ++s.seq, message: "started" })
}

export function publishLiveWatchFrame(projectId: string, runId: string, dataUrl: string): void {
  const s = stateFor(projectId, runId)
  s.active = true
  publish(s, { event: "frame", projectId, runId, active: true, ts: Date.now(), seq: ++s.seq, dataUrl })
}

export function endLiveWatchRun(projectId: string, runId: string, message = "ended"): void {
  const s = stateFor(projectId, runId)
  s.active = false
  publish(s, { event: "end", projectId, runId, active: false, ts: Date.now(), seq: ++s.seq, message })
}

export function liveWatchSnapshot(projectId: string, runId: string): { active: boolean; seq: number; last?: LiveWatchEvent } {
  const s = states.get(key(projectId, runId))
  return s ? { active: s.active, seq: s.seq, last: s.last } : { active: false, seq: 0 }
}

export function openLiveWatchStream(projectId: string, runId: string): ReadableStream<Uint8Array> {
  const s = stateFor(projectId, runId)
  let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controllerRef = controller
      s.subscribers.add(controller)
      controller.enqueue(sse("hello", {
        event: "hello",
        projectId,
        runId,
        active: s.active,
        ts: Date.now(),
        seq: s.seq,
      }))
      if (s.last) controller.enqueue(sse(s.last.event, s.last))
      heartbeat = setInterval(() => {
        try { controller.enqueue(enc.encode(`: ping ${Date.now()}\n\n`)) }
        catch {
          if (heartbeat) clearInterval(heartbeat)
          s.subscribers.delete(controller)
        }
      }, 15000)
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat)
      if (controllerRef) s.subscribers.delete(controllerRef)
    },
  })
}

export function liveWatchSseResponse(projectId: string, runId: string): Response {
  return new Response(openLiveWatchStream(projectId, runId), {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "connection": "keep-alive",
      "x-accel-buffering": "no",
    },
  })
}
