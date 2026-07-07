// Single-slot mutex + prod-safe Chromium args. The 1GB app box can run exactly ONE walk at a time;
// a second trigger is rejected (never a 2nd browser). Keep this the single seam for where/how
// browsers launch, so walks can later be moved to a separate worker by editing only this file.
export class WalkBusyError extends Error {
  constructor() { super("A walk is already running"); this.name = "WalkBusyError" }
}

// NOTE: this mutex is PER-PROCESS (a module-scoped boolean). It holds the concurrency=1 invariant only
// while klav.service runs as a SINGLE worker/instance. Running >1 worker/process would give each its own
// _inFlight and break the invariant (two browsers on the 1GB box) — that would need a DB advisory lock.
let _inFlight = false
let _currentRunId: string | null = null
let _cancelController: AbortController | null = null

export function isWalkInFlight(): boolean { return _inFlight }
export function currentWalkRunId(): string | null { return _currentRunId }

/** Called from within the slot (after the walk row is created) to register the runId for cancel. */
export function setCurrentWalkRunId(runId: string): void { _currentRunId = runId }

/** Returns the AbortSignal for the current walk, or null when no walk is running. */
export function getCurrentWalkAbortSignal(): AbortSignal | null {
  return _cancelController ? _cancelController.signal : null
}

/**
 * Abort the in-flight walk if its runId matches. Returns true when the signal was fired,
 * false when no walk is running or the runId does not match the current walk.
 */
export function cancelCurrentWalk(runId: string): boolean {
  if (!_inFlight || _currentRunId !== runId || !_cancelController) return false
  _cancelController.abort()
  return true
}

export async function withWalkSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (_inFlight) throw new WalkBusyError()
  _inFlight = true
  _currentRunId = null
  _cancelController = new AbortController()
  try { return await fn() } finally {
    _inFlight = false
    _currentRunId = null
    _cancelController = null
  }
}

// Low-memory / single-process Chromium flags for the shared 1GB prod box (spec §5.2). Headless, one
// page, no sandbox (the box is already an isolated VM), no zygote/GPU/dev-shm pressure.
export const CHROMIUM_PROD_ARGS: string[] = [
  "--single-process", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote",
]
