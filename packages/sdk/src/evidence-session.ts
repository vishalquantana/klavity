// packages/sdk/src/evidence-session.ts
//
// KLA-412 — multi-page evidence capture. An "evidence session" is a bug report in progress that must
// SURVIVE page navigation + reload: the widget is (re)loaded per-page via /widget.js, so any in-memory
// report state is lost the moment the user clicks a link. We persist the whole report — including the
// screenshot blobs — in IndexedDB (localStorage would overflow on image data), keyed by (projectId,
// origin) so exactly one report can be "in progress" per site at a time.
//
// This module is intentionally DOM-light: it owns storage only. The widget owns capture, the dock UI,
// and the composer wiring. Every write bumps `updatedAt`; a session older than SESSION_TTL_MS is treated
// as abandoned (getActiveSession returns null + reaps it) so a stale report never silently re-appears.

/** One captured screenshot, tagged with the page it came from (KLA-412's core requirement). */
export interface EvidenceShot {
  id: string
  pageUrl: string   // full location.href at capture time
  pagePath: string  // location.pathname — the short mono label shown under the thumbnail
  label: string     // optional human label (e.g. "list", "error"); may be empty
  blob: Blob        // the image bytes (JPEG/PNG) — stored as a Blob so IndexedDB doesn't bloat
  bytes?: number    // blob byte length captured at add time (survives structured-clone round-trips
                    // where an engine may not re-expose Blob.size; the byte cap reads this first)
  w: number
  h: number
  ts: number
}

/** A bug report in progress. `id` is deterministic = `${projectId}|${origin}` (one per project+origin). */
export interface EvidenceSession {
  id: string
  projectId: string
  origin: string
  createdAt: number
  updatedAt: number
  title: string
  desc: string
  reportType: string
  env?: string
  shots: EvidenceShot[]
}

/** addShot outcome — carries a reason when the size/count cap rejected the shot so the UI can nudge. */
export interface AddShotResult {
  ok: boolean
  reason?: 'max-shots' | 'max-bytes'
  session: EvidenceSession
}

const DB_NAME = 'klavity-evidence'
const STORE = 'sessions'
const DB_VERSION = 1

/** A session untouched for this long is abandoned — getActiveSession returns null and reaps it. */
export const SESSION_TTL_MS = 30 * 60 * 1000 // 30 minutes
/** Cap the evidence a single report can accrue so IndexedDB never blows up (matches the brief). */
export const MAX_SHOTS = 8
export const MAX_SESSION_BYTES = 10 * 1024 * 1024 // 10 MB total across all shots

function currentOrigin(): string {
  try { return typeof location !== 'undefined' && location.origin ? location.origin : '' } catch { return '' }
}

function idbFactory(): IDBFactory | null {
  try { return (globalThis as any).indexedDB || null } catch { return null }
}

/** Deterministic key: one in-progress report per (project, origin). */
export function sessionKey(projectId: string, origin: string): string {
  return projectId + '|' + origin
}

/** Best-effort unique id for a shot (crypto.randomUUID when available, else time+random). */
export function makeShotId(): string {
  try {
    const c = (globalThis as any).crypto
    if (c && typeof c.randomUUID === 'function') return 's_' + c.randomUUID()
  } catch { /* fall through */ }
  return 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10)
}

/** Distinct pages represented in a session (by pagePath, falling back to pageUrl). */
export function pageCount(session: EvidenceSession): number {
  return new Set(session.shots.map((s) => s.pagePath || s.pageUrl)).size
}

/** Byte length of one shot — prefers the stored numeric, falls back to the live Blob.size. */
export function shotBytes(shot: EvidenceShot): number {
  if (typeof shot.bytes === 'number') return shot.bytes
  return shot.blob && typeof shot.blob.size === 'number' ? shot.blob.size : 0
}

/** Total stored bytes across a session's shots. */
export function sessionBytes(session: EvidenceSession): number {
  return session.shots.reduce((n, s) => n + shotBytes(s), 0)
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const idb = idbFactory()
    if (!idb) { reject(new Error('IndexedDB unavailable')); return }
    let req: IDBOpenDBRequest
    try { req = idb.open(DB_NAME, DB_VERSION) } catch (e) { reject(e); return }
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error || new Error('IndexedDB open failed'))
  })
}

function getById(id: string): Promise<EvidenceSession | undefined> {
  return openDb().then(
    (db) =>
      new Promise<EvidenceSession | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly')
        const req = tx.objectStore(STORE).get(id)
        req.onsuccess = () => resolve(req.result as EvidenceSession | undefined)
        tx.oncomplete = () => db.close()
        tx.onerror = () => { db.close(); reject(tx.error) }
      }),
  )
}

function putSession(session: EvidenceSession): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).put(session)
        tx.oncomplete = () => { db.close(); resolve() }
        tx.onerror = () => { db.close(); reject(tx.error) }
        tx.onabort = () => { db.close(); reject(tx.error) }
      }),
  )
}

function deleteById(id: string): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).delete(id)
        tx.oncomplete = () => { db.close(); resolve() }
        tx.onerror = () => { db.close(); reject(tx.error) }
      }),
  )
}

/**
 * Return the in-progress report for this (project, origin) IF it is still fresh (updatedAt within the
 * TTL). An expired session is reaped and null returned, so a report abandoned yesterday never resurfaces.
 * Never throws — any storage error resolves null so the widget falls back to the normal launcher.
 */
export async function getActiveSession(projectId: string, origin: string = currentOrigin()): Promise<EvidenceSession | null> {
  try {
    const s = await getById(sessionKey(projectId, origin))
    if (!s) return null
    if (Date.now() - s.updatedAt > SESSION_TTL_MS) {
      try { await deleteById(s.id) } catch { /* best-effort reap */ }
      return null
    }
    return s
  } catch {
    return null
  }
}

/**
 * Get the fresh in-progress report for (project, origin), or create a new empty one. Continuing an
 * existing session bumps its updatedAt (keeps it alive while the user is actively working across pages).
 */
export async function startOrContinue(projectId: string, origin: string = currentOrigin()): Promise<EvidenceSession> {
  const existing = await getActiveSession(projectId, origin)
  if (existing) {
    existing.updatedAt = Date.now()
    try { await putSession(existing) } catch { /* best-effort touch */ }
    return existing
  }
  const now = Date.now()
  const fresh: EvidenceSession = {
    id: sessionKey(projectId, origin),
    projectId,
    origin,
    createdAt: now,
    updatedAt: now,
    title: '',
    desc: '',
    reportType: 'bug',
    shots: [],
  }
  await putSession(fresh)
  return fresh
}

/**
 * Append a shot (tagged with its page) to the session, enforcing the count + byte caps. Returns
 * { ok:false, reason } WITHOUT mutating storage when a cap would be exceeded so the caller can surface a
 * gentle "max evidence reached" note. Callers should serialize their addShot calls (the widget does) to
 * avoid a lost-update race on the read-modify-write.
 */
export async function addShot(sessionId: string, shot: EvidenceShot): Promise<AddShotResult> {
  const cur = await getById(sessionId)
  if (!cur) throw new Error('evidence session not found: ' + sessionId)
  if (cur.shots.length >= MAX_SHOTS) return { ok: false, reason: 'max-shots', session: cur }
  const projected = sessionBytes(cur) + shotBytes(shot)
  if (projected > MAX_SESSION_BYTES) return { ok: false, reason: 'max-bytes', session: cur }
  cur.shots.push(shot)
  cur.updatedAt = Date.now()
  await putSession(cur)
  return { ok: true, session: cur }
}

/** Patch the report's text fields (title/desc/type/env). Returns the updated session, or null if gone. */
export async function updateFields(
  sessionId: string,
  fields: { title?: string; desc?: string; reportType?: string; env?: string },
): Promise<EvidenceSession | null> {
  const cur = await getById(sessionId)
  if (!cur) return null
  if (fields.title !== undefined) cur.title = fields.title
  if (fields.desc !== undefined) cur.desc = fields.desc
  if (fields.reportType !== undefined) cur.reportType = fields.reportType
  if (fields.env !== undefined) cur.env = fields.env
  cur.updatedAt = Date.now()
  await putSession(cur)
  return cur
}

/** Drop one shot by id (used when the reporter removes a thumbnail in the composer). */
export async function removeShot(sessionId: string, shotId: string): Promise<EvidenceSession | null> {
  const cur = await getById(sessionId)
  if (!cur) return null
  cur.shots = cur.shots.filter((s) => s.id !== shotId)
  cur.updatedAt = Date.now()
  await putSession(cur)
  return cur
}

/** Delete the session entirely (on submit success or discard). Never throws. */
export async function clear(sessionId: string): Promise<void> {
  try { await deleteById(sessionId) } catch { /* best-effort */ }
}
