// G1 — client-side session-replay recorder for the no-install widget + npm SDK.
//
// Records a ROLLING buffer of the last ~window-ms of rrweb DOM events. On bug submit the recent
// events are serialized and attached to the report (form field `replay_events`). This is the free
// answer to Marker.io's paid "Session replay" — captured continuously, attached to every report.
//
// PRIVACY: rrweb runs with maskAllInputs + a text masker by default (see startReplayRecording). The
// ring buffer keeps only the trailing window so we never ship a user's whole session — just the
// seconds leading up to the bug.
//
// BLANK-REPLAY GUARD (#715): rrweb emits a single FullSnapshot at record start. On an SPA that first
// snapshot is often the blank pre-hydration shell, and the incremental events that build the real UI
// age out of the rolling window — so the player rebuilds from a stale/blank snapshot (white replay).
// We pass `checkoutEveryNms` (~half the window) so rrweb re-emits a FRESH FullSnapshot of the live
// DOM periodically; the ring buffer always holds a real full snapshot ≤ windowMs old.
//
// This file's ReplayRingBuffer is pure/deterministic and unit-tested; the rrweb wiring
// (startReplayRecording) is a thin DOM shim documented for manual verification.

// rrweb EventType numeric tags (kept local so the buffer logic has no rrweb import dependency):
const EVENT_FULL_SNAPSHOT = 2
const EVENT_META = 4

export interface TimedEvent { type: number; timestamp: number; data?: unknown; [k: string]: unknown }

export interface RingOptions {
  /** Trailing time window to retain, in ms (e.g. 45_000 for ~45s). */
  windowMs: number
  /** Hard cap on retained events regardless of the window (memory guard). */
  maxEvents: number
}

/**
 * A rolling window of rrweb events. Two guards on every push:
 *   1. time-window prune: drop events older than (newest.timestamp - windowMs)
 *   2. hard max-event cap: drop oldest beyond maxEvents
 * BUT the most recent Meta + FullSnapshot pair is ALWAYS retained — pruning past the snapshot would
 * make the buffer unplayable (rrweb-player needs a full snapshot to reconstruct the DOM). The kept
 * snapshot is re-emitted at the head of snapshot() so the trailing incremental events apply cleanly.
 */
export class ReplayRingBuffer {
  private events: TimedEvent[] = []
  private lastMeta: TimedEvent | null = null
  private lastFull: TimedEvent | null = null
  constructor(private opts: RingOptions) {}

  push(e: TimedEvent): void {
    if (e.type === EVENT_META) this.lastMeta = e
    if (e.type === EVENT_FULL_SNAPSHOT) {
      this.lastFull = e
      // A new full snapshot makes everything before it redundant — reset the incremental tail.
      this.events = []
    }
    this.events.push(e)
    this.prune()
  }

  private prune(): void {
    if (!this.events.length) return
    const newest = this.events[this.events.length - 1].timestamp
    const floor = newest - this.opts.windowMs
    // Time-window prune (but never drop the retained snapshot/meta — they live OUTSIDE this.events).
    let i = 0
    while (i < this.events.length && this.events[i].timestamp < floor) i++
    if (i > 0) this.events = this.events.slice(i)
    // Hard cap.
    if (this.events.length > this.opts.maxEvents) {
      this.events = this.events.slice(this.events.length - this.opts.maxEvents)
    }
  }

  /** A playable, head-anchored copy: [meta, fullSnapshot, ...trailing incrementals]. */
  snapshot(): TimedEvent[] {
    const head: TimedEvent[] = []
    const hasFullInTail = this.events.some(e => e.type === EVENT_FULL_SNAPSHOT)
    const hasMetaInTail = this.events.some(e => e.type === EVENT_META)
    if (!hasFullInTail && this.lastFull) {
      // The full snapshot aged out of the tail (time/window prune) — re-emit meta+full at the head.
      if (this.lastMeta) head.push(this.lastMeta)
      head.push(this.lastFull)
    } else if (hasFullInTail && !hasMetaInTail && this.lastMeta) {
      // A checkout FullSnapshot sits at the head of the tail, but its Meta was dropped when the new
      // full reset the incremental tail (rrweb emits Meta right BEFORE the checkout full). rrweb-player
      // needs the Meta (viewport dims) before the FullSnapshot, so re-emit it at the head (#715).
      head.push(this.lastMeta)
    }
    return [...head, ...this.events]
  }

  /** True when the buffer can produce a scrubbable replay: a full snapshot + at least one event to
   *  play beyond the meta+full pair (a lone meta+full renders a single static frame, not a replay). */
  isPlayable(): boolean {
    const snap = this.snapshot()
    const hasFull = snap.some(e => e.type === EVENT_FULL_SNAPSHOT)
    const hasTimeline = snap.some(e => e.type !== EVENT_FULL_SNAPSHOT && e.type !== EVENT_META)
    return hasFull && hasTimeline
  }

  clear(): void {
    this.events = []
    this.lastMeta = null
    this.lastFull = null
  }
}

// ── rrweb wiring (DOM shim — manual-verify) ───────────────────────────────────────────
export interface ReplayController {
  /** Current rolling buffer as a playable event array (safe to JSON.stringify and attach). */
  getEvents: () => TimedEvent[]
  /** Whether there's a playable recording right now. */
  hasRecording: () => boolean
  /** Stop recording and drop the buffer. */
  stop: () => void
}

export interface StartReplayOptions {
  windowMs?: number
  maxEvents?: number
  /** Override masking — defaults to ON (maskAllInputs + masked text) for privacy. */
  maskAllInputs?: boolean
  maskText?: boolean
}

/**
 * Start an rrweb recorder feeding a rolling buffer. `recordFn` is rrweb's `record` (injected so the
 * heavy dep loads lazily and so this is testable without a DOM). Returns a controller the report flow
 * uses to grab the trailing events on submit.
 *
 * Privacy defaults: maskAllInputs=true (passwords/PII in inputs never recorded) and a text masker that
 * replaces all text with asterisks unless the caller opts out. This mirrors the codebase's
 * default-on PII posture; a per-project toggle can later relax masking for first-party dogfood.
 */
export function startReplayRecording(
  recordFn: (opts: any) => (() => void) | undefined,
  opts: StartReplayOptions = {},
): ReplayController {
  const windowMs = opts.windowMs ?? 60_000
  const buf = new ReplayRingBuffer({
    windowMs,
    maxEvents: opts.maxEvents ?? 2000,
  })
  const maskAllInputs = opts.maskAllInputs !== false
  const maskText = opts.maskText !== false

  // Periodic FullSnapshot checkout. rrweb emits ONE FullSnapshot at record start — on an SPA that's
  // usually the blank pre-hydration shell, and the incremental DOM-building events that follow age
  // out of the rolling window, leaving the player to reconstruct from a stale/blank snapshot (WHITE
  // replay, #715). Ask rrweb to re-checkout a FRESH FullSnapshot of the *actual* rendered DOM at
  // roughly half the window, so a real full snapshot always lives ≤ windowMs old inside the buffer.
  // Derived from windowMs (not a magic constant) and clamped to a sane floor so we don't thrash on
  // very short windows.
  const checkoutEveryNms = Math.max(15_000, Math.round(windowMs / 2))

  let stopFn: (() => void) | undefined
  try {
    stopFn = recordFn({
      emit(e: TimedEvent) { try { buf.push(e) } catch { /* never let recording break the page */ } },
      // Fresh full snapshot every ~half-window so the retained snapshot reflects the live DOM.
      checkoutEveryNms,
      maskAllInputs,
      // Mask every text node by default. rrweb calls maskTextFn(text) per node; '*' keeps layout.
      maskTextFn: maskText ? (text: string) => '*'.repeat(text.length) : undefined,
      // Capture same-origin CSS inline so the replay renders styled (rrweb default; set explicitly so
      // a blank/unstyled replay can't regress silently). Privacy masking above is unaffected.
      inlineStylesheet: true,
      // Don't record <script>/<noscript> contents and obvious secrets.
      blockClass: 'klavity-no-record',
      ignoreClass: 'klavity-no-record',
      recordCanvas: false,
      collectFonts: false,
    })
  } catch { /* rrweb unavailable / record threw — degrade to no replay */ }

  return {
    getEvents: () => (buf.isPlayable() ? buf.snapshot() : []),
    hasRecording: () => buf.isPlayable(),
    stop: () => { try { stopFn?.() } catch {} ; buf.clear() },
  }
}
