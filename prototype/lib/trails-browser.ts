// Concurrency pool + bounded queue for walk slots. Up to KLAV_WALK_CONCURRENCY (default 3) walks run
// simultaneously; additional requests queue (up to KLAV_WALK_QUEUE, default 10). When both the pool
// and queue are exhausted, WalkBusyError is thrown (→ HTTP 409). Per-slot context (AbortController,
// runId) is propagated via AsyncLocalStorage so callers inside a slot see THEIR walk's signal/runId.
//
// NOTE: this is PER-PROCESS. Running >1 worker process would need a DB advisory lock.
import { AsyncLocalStorage } from "node:async_hooks"

export class WalkBusyError extends Error {
  constructor(msg = "Walk queue is full — try again shortly") { super(msg); this.name = "WalkBusyError" }
}

// Per-slot context carried through the async call chain via AsyncLocalStorage.
interface SlotCtx { ac: AbortController; runId: string | null }
const _als = new AsyncLocalStorage<SlotCtx>()

// Mutable so tests can reconfigure; initialised from env once at startup.
let _maxConcurrency = Math.max(1, parseInt(process.env.KLAV_WALK_CONCURRENCY ?? "3", 10) || 3)
let _maxQueue = Math.max(0, parseInt(process.env.KLAV_WALK_QUEUE ?? "10", 10) || 0)

let _active = 0
const _waiters: Array<() => void> = []
const _activeCtxs = new Set<SlotCtx>()

/** Reset pool limits — for use in tests only. */
export function _resetWalkPoolForTest(concurrency: number, maxQueue: number): void {
  _maxConcurrency = concurrency
  _maxQueue = maxQueue
  _active = 0
  _waiters.length = 0
  _activeCtxs.clear()
}

export function isWalkInFlight(): boolean { return _active > 0 }

/** runId registered in the CURRENT slot (null outside a slot or before setCurrentWalkRunId). */
export function currentWalkRunId(): string | null { return _als.getStore()?.runId ?? null }

/** Register the runId for this slot so cancelCurrentWalk can find it. Called inside the slot. */
export function setCurrentWalkRunId(runId: string): void {
  const ctx = _als.getStore()
  if (ctx) ctx.runId = runId
}

/** AbortSignal for the current slot's walk; null when called outside a slot. */
export function getCurrentWalkAbortSignal(): AbortSignal | null {
  return _als.getStore()?.ac.signal ?? null
}

/**
 * Abort the walk identified by runId across all active slots.
 * Returns true when the signal was fired, false when not found.
 */
export function cancelCurrentWalk(runId: string): boolean {
  for (const ctx of _activeCtxs) {
    if (ctx.runId === runId) { ctx.ac.abort(); return true }
  }
  return false
}

async function _runInSlot<T>(fn: () => Promise<T>, ctx: SlotCtx): Promise<T> {
  _active++
  _activeCtxs.add(ctx)
  try {
    return await _als.run(ctx, fn)
  } finally {
    _active--
    _activeCtxs.delete(ctx)
    // Wake the next queued waiter (if any) so it can acquire a now-free slot.
    const next = _waiters.shift()
    if (next) next()
  }
}

/**
 * Run fn inside a pool slot. Up to _maxConcurrency walk fns execute concurrently.
 * When all slots are busy, callers wait in an internal queue (up to _maxQueue deep).
 * Throws WalkBusyError when both the pool and queue are exhausted.
 */
export async function withWalkSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (_active < _maxConcurrency) {
    return _runInSlot(fn, { ac: new AbortController(), runId: null })
  }
  if (_waiters.length >= _maxQueue) throw new WalkBusyError()
  // Queue: wait for a slot notification, then run.
  await new Promise<void>((resolve) => { _waiters.push(resolve) })
  return _runInSlot(fn, { ac: new AbortController(), runId: null })
}

// Low-memory / single-process Chromium flags for the shared 1GB prod box (spec §5.2). Headless, one
// page, no sandbox (the box is already an isolated VM), no zygote/GPU/dev-shm pressure.
export const CHROMIUM_PROD_ARGS: string[] = [
  "--single-process", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote",
]
