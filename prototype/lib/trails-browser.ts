// Concurrency pool + PER-PROJECT walk queue (KLA-266). Up to KLAV_WALK_CONCURRENCY (default 1) walks
// run simultaneously ACROSS ALL projects (a global cap that protects the 1GB box / Steel budget), but
// waiters are queued PER PROJECT and dispatched ROUND-ROBIN so no single project can starve the others.
// A per-project cap (default 1) means one project never holds >1 concurrent slot, guaranteeing fairness
// even when it floods the queue. Additional requests queue up to KLAV_WALK_QUEUE PER PROJECT (default
// 10); when a project's queue is full, WalkBusyError is thrown for THAT project only (→ HTTP 409) —
// it no longer blocks or fills up other projects' queues. Per-slot context (AbortController, runId) is
// propagated via AsyncLocalStorage so callers inside a slot see THEIR walk's signal/runId.
//
// This replaces the old single global FIFO waiter list (the "global browser slot") where one project's
// burst of walks would sit ahead of every other project in one shared queue and serialize globally.
//
// NOTE: this is PER-PROCESS (in-memory). The runner is a single long-lived process, so in-memory queue
// state is correct + simplest. Running >1 worker process would need a DB advisory lock / persisted queue.
import { AsyncLocalStorage } from "node:async_hooks"

export class WalkBusyError extends Error {
  constructor(msg = "Walk queue is full — try again shortly") { super(msg); this.name = "WalkBusyError" }
}

export class AuthorBusyError extends WalkBusyError {
  constructor(msg = "An AutoSim authoring session is already running — try again shortly") {
    super(msg)
    this.name = "AuthorBusyError"
  }
}

export class PdfBusyError extends Error {
  constructor(msg = "PDF rendering is busy — try again shortly") {
    super(msg); this.name = "PdfBusyError"
  }
}

// Per-slot context carried through the async call chain via AsyncLocalStorage.
interface SlotCtx { ac: AbortController; runId: string | null; projectKey: string }
const _als = new AsyncLocalStorage<SlotCtx>()

// Mutable so tests can reconfigure; initialised from env once at startup.
let _maxConcurrency = Math.max(1, parseInt(process.env.KLAV_WALK_CONCURRENCY ?? "1", 10) || 1)
let _maxQueue = Math.max(0, parseInt(process.env.KLAV_WALK_QUEUE ?? "10", 10) || 0)
// Per-project concurrency cap: how many slots ONE project may hold at once. When KLAV_WALK_PER_PROJECT
// is unset it defaults to the GLOBAL cap (so with the prod default KLAV_WALK_CONCURRENCY=1 a project is
// naturally limited to one in-flight walk, and multi-slot pools stay backward compatible). Set it below
// the global cap (e.g. =1 with concurrency>1) to enforce strict fairness — one busy project can then
// never grab every global slot. Kept ≥1.
let _maxPerProject = Math.max(1, parseInt(process.env.KLAV_WALK_PER_PROJECT ?? String(_maxConcurrency), 10) || _maxConcurrency)

// Projects with no explicit key (e.g. the author slot path) share this bucket so behaviour is unchanged.
const DEFAULT_PROJECT_KEY = "__default__"

let _active = 0
const _activeCtxs = new Set<SlotCtx>()
// Per-project in-flight count (for the per-project cap) and FIFO waiter queue (for ordering within a
// project). The round-robin cursor rotates over project keys so dispatch is fair across projects.
const _perProjectActive = new Map<string, number>()
interface Waiter { resolve: () => void; projectKey: string }
const _perProjectWaiters = new Map<string, Waiter[]>()
const _rrOrder: string[] = []
// The last project that was granted a slot. Round-robin dispatch starts scanning at the project
// AFTER this one in _rrOrder, so a project that just ran is deprioritised vs. everyone else — even
// projects that only joined the rotation after it started running. null = start from the front.
let _lastServedKey: string | null = null
let _authorActive = false
let _pdfActive = false
// KLA-151: per-session author cancel mechanism (mirrors cancelCurrentWalk for the author slot).
let _authorAc: AbortController | null = null
let _authorSessionId: string | null = null

/** Register the running author session so cancelCurrentAuthor can find it. Called inside the slot. */
export function setCurrentAuthorSessionId(sid: string): void { _authorSessionId = sid }
/** AbortSignal for the current author drive; null when no session is running. */
export function getCurrentAuthorAbortSignal(): AbortSignal | null { return _authorAc?.signal ?? null }
/** Signal the currently-running author session to stop at the next step boundary. */
export function cancelCurrentAuthor(sessionId: string): boolean {
  if (_authorSessionId === sessionId && _authorAc) { _authorAc.abort(); return true }
  return false
}

/**
 * Reset pool limits — for use in tests only. Optional perProject caps how many slots one project may
 * hold; when omitted it defaults to `concurrency` (i.e. no extra per-project restriction), so existing
 * 2-arg callers keep the pre-KLA-266 behaviour. Pass a smaller value to exercise per-project fairness.
 */
export function _resetWalkPoolForTest(concurrency: number, maxQueue: number, perProject?: number): void {
  _maxConcurrency = concurrency
  _maxQueue = maxQueue
  _maxPerProject = Math.max(1, perProject ?? concurrency)
  _active = 0
  _activeCtxs.clear()
  _perProjectActive.clear()
  _perProjectWaiters.clear()
  _rrOrder.length = 0
  _lastServedKey = null
}

/** Number of queued (not-yet-running) waiters for a project — tests/introspection only. */
export function _queuedForProject(projectId?: string | null): number {
  return _perProjectWaiters.get(projectId || DEFAULT_PROJECT_KEY)?.length ?? 0
}

/** In-flight walk count for a project — tests/introspection only. */
export function activeWalksForProject(projectId?: string | null): number {
  return _perProjectActive.get(projectId || DEFAULT_PROJECT_KEY) ?? 0
}

export function _resetAuthorAdmissionForTest(): void {
  _authorActive = false
  _authorAc = null
  _authorSessionId = null
}

export function _resetPdfAdmissionForTest(): void {
  _pdfActive = false
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

/** True when a project may take a slot right now: global cap free AND its per-project cap free. */
function _canAdmit(projectKey: string): boolean {
  return _active < _maxConcurrency && (_perProjectActive.get(projectKey) ?? 0) < _maxPerProject
}

/** Mark one slot as taken for a project (global + per-project counters). Records this project as the
 *  last-served so the next dispatch prefers a DIFFERENT project (this is the fairness rotation). */
function _enter(projectKey: string): void {
  _active++
  _perProjectActive.set(projectKey, (_perProjectActive.get(projectKey) ?? 0) + 1)
  _lastServedKey = projectKey
}

/** Release one slot for a project (global + per-project counters). */
function _leave(projectKey: string): void {
  _active--
  const n = (_perProjectActive.get(projectKey) ?? 1) - 1
  if (n <= 0) _perProjectActive.delete(projectKey)
  else _perProjectActive.set(projectKey, n)
}

/**
 * ROUND-ROBIN dispatcher. After a slot frees up, rotate over the project keys (starting just after the
 * last-served project) and wake the head-of-queue waiter of the FIRST project that can currently be
 * admitted. This is what makes projects interleave: a project that just finished a walk goes to the
 * BACK of the rotation, so a different project gets the freed slot before the busy one runs again.
 * Loops so that a single free slot can hand off to the next project even if the first-picked was
 * blocked by its per-project cap.
 */
function _dispatch(): void {
  if (_rrOrder.length === 0) return
  // Keep filling free slots until the global cap is hit or no queued project can be admitted.
  // Each pass scans a full rotation starting at the project AFTER the last-served one; admitting a
  // project records it as last-served (via _enter), so the next pass prefers a different project.
  while (_active < _maxConcurrency) {
    const startIdx = _lastServedKey ? (_rrOrder.indexOf(_lastServedKey) + 1) : 0
    let admitted = false
    for (let scanned = 0; scanned < _rrOrder.length; scanned++) {
      const key = _rrOrder[(startIdx + scanned) % _rrOrder.length]
      const q = _perProjectWaiters.get(key)
      if (q && q.length > 0 && _canAdmit(key)) {
        const w = q.shift()!
        // Reserve the slot NOW (before the woken waiter runs) so a concurrent release can't
        // double-book; _enter records this project as last-served for the next rotation.
        _enter(key)
        w.resolve()
        admitted = true
        break
      }
    }
    if (!admitted) return
  }
}

/** Ensure a project key participates in the round-robin rotation. */
function _ensureInOrder(key: string): void {
  if (!_rrOrder.includes(key)) _rrOrder.push(key)
}

async function _runInSlot<T>(fn: () => Promise<T>, ctx: SlotCtx): Promise<T> {
  _activeCtxs.add(ctx)
  try {
    return await _als.run(ctx, fn)
  } finally {
    _activeCtxs.delete(ctx)
    _leave(ctx.projectKey)
    // A slot freed up — hand it to the next fair project (round-robin), not necessarily this one.
    _dispatch()
  }
}

/**
 * Run fn inside a walk slot, keyed by `projectId` for fairness. Global concurrency is capped at
 * _maxConcurrency across ALL projects; a single project may hold at most _maxPerProject slots. When
 * neither cap admits the request immediately, it queues in the project's own FIFO (up to _maxQueue
 * deep PER project) and is dispatched round-robin. Throws WalkBusyError when THIS project's queue is
 * full — other projects are unaffected.
 *
 * projectId is optional for backward compatibility; unkeyed callers (e.g. the author slot) share one
 * default bucket, preserving prior single-slot behaviour for that path.
 */
export async function withWalkSlot<T>(fn: () => Promise<T>, projectId?: string | null): Promise<T> {
  const projectKey = projectId || DEFAULT_PROJECT_KEY
  _ensureInOrder(projectKey)
  if (_canAdmit(projectKey)) {
    _enter(projectKey)
    return _runInSlot(fn, { ac: new AbortController(), runId: null, projectKey })
  }
  const q = _perProjectWaiters.get(projectKey) ?? []
  if (q.length >= _maxQueue) throw new WalkBusyError()
  if (!_perProjectWaiters.has(projectKey)) _perProjectWaiters.set(projectKey, q)
  // Queue in THIS project's FIFO; _dispatch (on a slot release) reserves the slot then resolves us.
  await new Promise<void>((resolve) => { q.push({ resolve, projectKey }) })
  // Slot already reserved for us by _dispatch (_enter was called there); just run.
  return _runInSlot(fn, { ac: new AbortController(), runId: null, projectKey })
}

/**
 * Authoring is deliberately stricter than generic walks on the 1GB box: only one author drive may be
 * active or waiting for the browser slot at a time. A second request fails fast instead of creating a
 * poll session that might later spawn another local Chromium under load.
 */
export async function withAuthorSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (_authorActive) throw new AuthorBusyError()
  _authorActive = true
  _authorAc = new AbortController()
  try {
    return await fn()
  } finally {
    _authorActive = false
    _authorAc = null
    _authorSessionId = null
  }
}

export async function withPdfSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (_pdfActive) throw new PdfBusyError()
  _pdfActive = true
  try {
    return await fn()
  } finally {
    _pdfActive = false
  }
}

// Low-memory / single-process Chromium flags for the shared 1GB prod box (spec §5.2). Headless, one
// page, no sandbox (the box is already an isolated VM), no zygote/GPU/dev-shm pressure.
export const CHROMIUM_PROD_ARGS: string[] = [
  "--single-process", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote",
  "--disable-extensions", "--disable-background-networking", "--disable-background-timer-throttling",
  "--disable-renderer-backgrounding", "--disable-sync", "--metrics-recording-only", "--mute-audio",
]
