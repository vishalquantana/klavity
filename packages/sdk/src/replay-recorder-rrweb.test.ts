// @vitest-environment jsdom
//
// KLA-4 — tests for the *un-mocked* recording layer in replay-recorder.ts.
//
// The existing replay-recorder.test.ts covers ReplayRingBuffer in isolation
// and session-replay.test.ts covers the createSessionReplay factory — but
// startReplayRecording is always mocked in those files, so the real
// rrweb-option plumbing (maskTextFn, blockClass, emit→buffer wiring, etc.)
// is never actually exercised. This file plugs that gap.
//
// Tests also cover the "new full-snapshot resets incremental tail" invariant
// from ReplayRingBuffer (explicitly documented in the source but not asserted).

import { describe, it, expect, vi } from 'vitest'
import { startReplayRecording, ReplayRingBuffer, type TimedEvent } from './replay-recorder'

// ── helpers ───────────────────────────────────────────────────────────────────

/** Build a spy-based recordFn that captures what options it was called with
 *  and provides a handle to emit events and call the returned stopFn. */
function makeRecordSpy() {
  let emitFn: ((e: TimedEvent) => void) | null = null
  let stopped = false
  const stopFn = vi.fn(() => { stopped = true })

  const recordFn = vi.fn((opts: any) => {
    emitFn = opts.emit
    return stopFn
  })

  return {
    recordFn,
    stopFn,
    /** Emit a synthetic event through the captured emit callback. */
    emit: (e: TimedEvent) => { emitFn?.(e) },
    get stopped() { return stopped },
  }
}

const meta = (t = 100): TimedEvent => ({ type: 4, timestamp: t })
const full = (t = 200): TimedEvent => ({ type: 2, timestamp: t })
const incr = (t = 300): TimedEvent => ({ type: 3, timestamp: t })

// ════════════════════════════════════════════════════════════════════════════
// startReplayRecording — rrweb option forwarding
// ════════════════════════════════════════════════════════════════════════════

describe('startReplayRecording — rrweb option forwarding', () => {
  it('passes maskAllInputs=true by default (privacy-first)', () => {
    const spy = makeRecordSpy()
    startReplayRecording(spy.recordFn)
    expect(spy.recordFn).toHaveBeenCalledOnce()
    const opts = spy.recordFn.mock.calls[0][0]
    expect(opts.maskAllInputs).toBe(true)
  })

  it('includes a maskTextFn that replaces text with same-length asterisks by default', () => {
    const spy = makeRecordSpy()
    startReplayRecording(spy.recordFn)
    const opts = spy.recordFn.mock.calls[0][0]
    expect(typeof opts.maskTextFn).toBe('function')
    // same-length asterisk replacement — preserves layout without exposing PII
    expect(opts.maskTextFn('hello')).toBe('*****')
    expect(opts.maskTextFn('abc')).toBe('***')
    expect(opts.maskTextFn('')).toBe('')
  })

  it('sets blockClass and ignoreClass to klavity-no-record so callers can opt out', () => {
    const spy = makeRecordSpy()
    startReplayRecording(spy.recordFn)
    const opts = spy.recordFn.mock.calls[0][0]
    expect(opts.blockClass).toBe('klavity-no-record')
    expect(opts.ignoreClass).toBe('klavity-no-record')
  })

  it('sets recordCanvas=false (privacy + performance — canvas may contain sensitive visuals)', () => {
    const spy = makeRecordSpy()
    startReplayRecording(spy.recordFn)
    const opts = spy.recordFn.mock.calls[0][0]
    expect(opts.recordCanvas).toBe(false)
  })

  it('sets collectFonts=false (bandwidth + CSP guard)', () => {
    const spy = makeRecordSpy()
    startReplayRecording(spy.recordFn)
    const opts = spy.recordFn.mock.calls[0][0]
    expect(opts.collectFonts).toBe(false)
  })

  it('opts.maskAllInputs=false and opts.maskText=false are respected when caller overrides', () => {
    const spy = makeRecordSpy()
    startReplayRecording(spy.recordFn, { maskAllInputs: false, maskText: false })
    const opts = spy.recordFn.mock.calls[0][0]
    expect(opts.maskAllInputs).toBe(false)
    // maskText=false means maskTextFn should be undefined (rrweb uses its own default or none)
    expect(opts.maskTextFn).toBeUndefined()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// startReplayRecording — emit → buffer wiring
// ════════════════════════════════════════════════════════════════════════════

describe('startReplayRecording — emit callback feeds the ring buffer', () => {
  it('events emitted via opts.emit appear in snapshot()', () => {
    const spy = makeRecordSpy()
    const ctrl = startReplayRecording(spy.recordFn)

    // Before any events: no recording
    expect(ctrl.getEvents()).toEqual([])
    expect(ctrl.hasRecording()).toBe(false)

    // Emit a meta + full-snapshot → marks the start of a playable recording
    spy.emit(meta(100))
    spy.emit(full(200))
    spy.emit(incr(300))

    const snap = ctrl.getEvents()
    // meta+full+incr → full is in the tail so meta is not prepended → length ≥ 2
    expect(snap.length).toBeGreaterThanOrEqual(2)
    expect(snap.some(e => e.type === 2)).toBe(true)   // full snapshot present
    expect(ctrl.hasRecording()).toBe(true)
  })

  it('snapshot() returns [] when only incremental events are in the buffer (no full-snapshot)', () => {
    const spy = makeRecordSpy()
    const ctrl = startReplayRecording(spy.recordFn)
    // Without a full-snapshot, rrweb-player cannot reconstruct the DOM
    spy.emit(incr(100))
    spy.emit(incr(200))
    expect(ctrl.hasRecording()).toBe(false)
    expect(ctrl.getEvents()).toEqual([])
  })

  it('respects the windowMs option: events older than the window are pruned', () => {
    const spy = makeRecordSpy()
    const ctrl = startReplayRecording(spy.recordFn, { windowMs: 1000 })

    // Emit a full-snapshot at t=0 followed by incrementals at t=0..5000
    spy.emit(full(0))
    spy.emit(incr(100))
    spy.emit(incr(200))
    spy.emit(incr(5000))  // this prunes everything before 5000-1000=4000

    const snap = ctrl.getEvents()
    // Only the most-recent incremental + the retained full-snapshot survive
    const times = snap.map(e => e.timestamp)
    expect(times).toContain(5000)
    expect(times).not.toContain(100)
    expect(times).not.toContain(200)
  })

  it('respects the maxEvents option: oldest events beyond the cap are dropped', () => {
    const spy = makeRecordSpy()
    const ctrl = startReplayRecording(spy.recordFn, { windowMs: 999_999_999, maxEvents: 5 })

    spy.emit(full(0))   // type 2 — kept as lastFull
    // Emit 10 incrementals beyond the cap of 5
    for (let i = 1; i <= 10; i++) spy.emit(incr(i * 100))

    const snap = ctrl.getEvents()
    // Buffer holds at most 5 events total; the full-snapshot is prepended if not in the tail
    // → we should have fewer than 12 events and the NEWEST incrementals should be present
    const incrTimes = snap.filter(e => e.type === 3).map(e => e.timestamp)
    expect(incrTimes[incrTimes.length - 1]).toBe(1000)  // newest kept
    expect(incrTimes.length).toBeLessThanOrEqual(5)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// startReplayRecording — stop() behaviour
// ════════════════════════════════════════════════════════════════════════════

describe('startReplayRecording — stop()', () => {
  it('calls the stopFn returned by recordFn when stop() is invoked', () => {
    const spy = makeRecordSpy()
    const ctrl = startReplayRecording(spy.recordFn)
    ctrl.stop()
    expect(spy.stopFn).toHaveBeenCalledOnce()
  })

  it('clears the buffer on stop — subsequent snapshot() returns []', () => {
    const spy = makeRecordSpy()
    const ctrl = startReplayRecording(spy.recordFn)

    spy.emit(full(100))
    spy.emit(incr(200))
    expect(ctrl.hasRecording()).toBe(true)

    ctrl.stop()
    expect(ctrl.getEvents()).toEqual([])
    expect(ctrl.hasRecording()).toBe(false)
  })

  it('is resilient — does not throw when recordFn returns no stopFn', () => {
    const recordFn = vi.fn(() => undefined)  // no return value
    const ctrl = startReplayRecording(recordFn)
    expect(() => ctrl.stop()).not.toThrow()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// startReplayRecording — resilience
// ════════════════════════════════════════════════════════════════════════════

describe('startReplayRecording — resilience when recordFn throws', () => {
  it('snapshot() returns [] and does not throw when recordFn throws during init', () => {
    const recordFn = vi.fn(() => { throw new Error('rrweb unavailable') })
    const ctrl = startReplayRecording(recordFn)
    expect(ctrl.getEvents()).toEqual([])
    expect(ctrl.hasRecording()).toBe(false)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// ReplayRingBuffer — new full-snapshot resets incremental tail
// (documented in the source but not asserted in replay-recorder.test.ts)
// ════════════════════════════════════════════════════════════════════════════

describe('ReplayRingBuffer — second full-snapshot resets the incremental tail', () => {
  it('events recorded before a new full-snapshot are cleared from the ring tail', () => {
    const buf = new ReplayRingBuffer({ windowMs: 999_999, maxEvents: 100 })

    // First recording session: meta1 + full1 + incrementals
    buf.push({ type: 4, timestamp: 100 })   // meta1
    buf.push({ type: 2, timestamp: 200 })   // full1 — clears events, sets lastFull=full1
    buf.push({ type: 3, timestamp: 300 })   // incremental A
    buf.push({ type: 3, timestamp: 400 })   // incremental B

    // New full-snapshot (page navigated or rrweb re-initialised)
    buf.push({ type: 4, timestamp: 500 })   // meta2
    buf.push({ type: 2, timestamp: 600 })   // full2 — should clear the old incrementals

    buf.push({ type: 3, timestamp: 700 })   // incremental after full2

    const snap = buf.snapshot()

    // The snapshot must include full2 (the new snapshot)
    const fullTimes = snap.filter(e => e.type === 2).map(e => e.timestamp)
    expect(fullTimes).toContain(600)   // full2 present

    // Incremental A and B (before full2) must NOT appear — they've been cleared
    const incrTimes = snap.filter(e => e.type === 3).map(e => e.timestamp)
    expect(incrTimes).not.toContain(300)
    expect(incrTimes).not.toContain(400)

    // The post-full2 incremental must be present
    expect(incrTimes).toContain(700)
  })

  it('after a new full-snapshot, hasRecording() reflects only the new recording', () => {
    const buf = new ReplayRingBuffer({ windowMs: 999_999, maxEvents: 100 })

    // Build a complete first recording
    buf.push({ type: 2, timestamp: 100 })
    buf.push({ type: 3, timestamp: 200 })
    expect(buf.isPlayable()).toBe(true)

    // A second full-snapshot resets the tail (no new incrementals yet)
    buf.push({ type: 2, timestamp: 300 })
    // The ring now holds only the new full-snapshot (plus lastFull = it)
    // → isPlayable requires ≥2 events: full + at least one more
    // With just the new full-snapshot in events, we have exactly 1 event → not playable
    expect(buf.isPlayable()).toBe(false)

    buf.push({ type: 3, timestamp: 400 })   // add one incremental
    expect(buf.isPlayable()).toBe(true)
  })
})
