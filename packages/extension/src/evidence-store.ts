// packages/extension/src/evidence-store.ts
//
// #442 — extension multi-page evidence (the dock), the extension-specific storage layer.
//
// The in-page widget persists an in-progress bug report in page-origin IndexedDB keyed by
// (projectId, origin). That works for the widget because it re-loads per page — but IndexedDB is
// partitioned PER ORIGIN, so it CANNOT survive a cross-ORIGIN navigation (app.acme.com -> billing.acme.com
// -> docs.other.com). The extension needs the report to survive exactly those hops.
//
// chrome.storage.local is scoped to the EXTENSION, not the page, so it is shared across every tab and
// every origin the extension runs in. Writing the evidence session there makes it durable across
// cross-origin navigations for free — a value IndexedDB can't provide. This module owns that storage only
// (DOM-light): the content script owns capture, the dock UI, and the composer wiring.
//
// Shots are stored as data URLs (strings) rather than Blobs — chrome.storage serializes via structured
// clone but data URLs are the currency the shared composer already speaks (buildModal.addScreenshot), and
// strings round-trip through storage without engine quirks. A count + byte cap keeps us well under
// chrome.storage.local's quota.

/** One captured screenshot, tagged with the page (and its origin) it came from. */
export interface ExtEvidenceShot {
  id: string
  pageUrl: string     // full location.href at capture time
  pagePath: string    // location.pathname — the short mono label under the thumbnail
  pageOrigin: string  // location.origin — lets the trail group by site across cross-origin hops
  label: string       // optional human label; may be empty
  dataUrl: string     // the image as a data: URL (PNG/JPEG)
  bytes: number       // dataUrl.length captured at add time (drives the byte cap)
  w: number
  h: number
  ts: number
}

/** A bug report in progress. One active session at a time (spans origins), under a single fixed key. */
export interface ExtEvidenceSession {
  id: string
  projectId: string   // the project matched when the FIRST shot was captured (may be '')
  createdAt: number
  updatedAt: number
  title: string
  desc: string
  reportType: string
  shots: ExtEvidenceShot[]
}

/** addShot outcome — carries a reason when a cap rejected the shot so the UI can nudge. */
export interface AddShotResult {
  ok: boolean
  reason?: 'max-shots' | 'max-bytes'
  session: ExtEvidenceSession
}

/** Minimal async key/value the store needs — wraps chrome.storage.local, swappable in tests. */
export interface EvidenceStorage {
  get(key: string): Promise<unknown>
  set(key: string, value: unknown): Promise<void>
  remove(key: string): Promise<void>
}

/** The single storage key holding the one active evidence session (extension-global). */
export const EVIDENCE_KEY = 'klavEvidenceSession'
/** A session untouched for this long is abandoned — getActiveSession returns null and reaps it. */
export const SESSION_TTL_MS = 30 * 60 * 1000 // 30 minutes
/** Cap the evidence a single report can accrue so chrome.storage.local never blows past quota. */
export const MAX_SHOTS = 8
export const MAX_SESSION_BYTES = 8 * 1024 * 1024 // ~8 MB of data-URL text across all shots

/** chrome.storage.local adapter (default). Never throws synchronously; rejects on storage errors. */
export function chromeLocalStorage(): EvidenceStorage {
  return {
    get: (key) =>
      new Promise((resolve, reject) => {
        try {
          chrome.storage.local.get(key, (r) => {
            const err = chrome.runtime?.lastError
            if (err) reject(new Error(err.message))
            else resolve((r as Record<string, unknown>)[key])
          })
        } catch (e) { reject(e) }
      }),
    set: (key, value) =>
      new Promise((resolve, reject) => {
        try {
          chrome.storage.local.set({ [key]: value }, () => {
            const err = chrome.runtime?.lastError
            if (err) reject(new Error(err.message)); else resolve()
          })
        } catch (e) { reject(e) }
      }),
    remove: (key) =>
      new Promise((resolve, reject) => {
        try {
          chrome.storage.local.remove(key, () => {
            const err = chrome.runtime?.lastError
            if (err) reject(new Error(err.message)); else resolve()
          })
        } catch (e) { reject(e) }
      }),
  }
}

/** Best-effort unique id for a shot (crypto.randomUUID when available, else time+random). */
export function makeShotId(): string {
  try {
    const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
    if (c && typeof c.randomUUID === 'function') return 's_' + c.randomUUID()
  } catch { /* fall through */ }
  return 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10)
}

/** Distinct pages represented in a session (by pageUrl, falling back to pagePath). */
export function pageCount(session: ExtEvidenceSession): number {
  return new Set(session.shots.map((s) => s.pageUrl || s.pagePath)).size
}

/** Total stored bytes across a session's shots (the data-URL text length). */
export function sessionBytes(session: ExtEvidenceSession): number {
  return session.shots.reduce((n, s) => n + (typeof s.bytes === 'number' ? s.bytes : (s.dataUrl?.length ?? 0)), 0)
}

/** Dock label — "N shots · M pages · not lost". */
export function evCountText(session: ExtEvidenceSession | null): string {
  const n = session ? session.shots.length : 0
  const m = session ? pageCount(session) : 0
  return `${n} shot${n === 1 ? '' : 's'} · ${m} page${m === 1 ? '' : 's'} · not lost`
}

/** The "Pages captured:" trail appended to the report description (numbered, path + full URL). */
export function buildPagesTrail(shots: ExtEvidenceShot[]): string {
  if (!shots || !shots.length) return ''
  const lines = shots.map((s, i) => {
    const path = s.pagePath || s.pageUrl || '(unknown)'
    const full = s.pageUrl && s.pagePath && s.pageUrl !== s.pagePath ? ' - ' + s.pageUrl : ''
    return `${i + 1}. ${path}${full}`
  })
  return 'Pages captured:\n' + lines.join('\n')
}

/** True when the session is still fresh (updatedAt within the TTL). */
export function isFresh(session: ExtEvidenceSession, now: number = Date.now()): boolean {
  return now - session.updatedAt <= SESSION_TTL_MS
}

async function readRaw(storage: EvidenceStorage): Promise<ExtEvidenceSession | null> {
  const v = await storage.get(EVIDENCE_KEY)
  if (!v || typeof v !== 'object') return null
  const s = v as ExtEvidenceSession
  if (!Array.isArray(s.shots)) return null
  return s
}

/**
 * Return the in-progress report IF it is still fresh. An expired session is reaped and null returned, so a
 * report abandoned yesterday never resurfaces. Never throws — any storage error resolves null so the dock
 * simply doesn't appear.
 */
export async function getActiveSession(storage: EvidenceStorage): Promise<ExtEvidenceSession | null> {
  try {
    const s = await readRaw(storage)
    if (!s) return null
    if (!isFresh(s)) {
      try { await storage.remove(EVIDENCE_KEY) } catch { /* best-effort reap */ }
      return null
    }
    return s
  } catch {
    return null
  }
}

/**
 * Get the fresh in-progress report, or create a new empty one for `projectId`. Continuing an existing
 * session bumps updatedAt (keeps it alive while the user works across pages). A stored session for a
 * DIFFERENT project is treated as the active one still (one report in progress at a time) — the caller
 * decides project matching; we don't silently drop a user's in-progress evidence.
 */
export async function startOrContinue(storage: EvidenceStorage, projectId: string): Promise<ExtEvidenceSession> {
  const existing = await getActiveSession(storage)
  if (existing) {
    existing.updatedAt = Date.now()
    if (!existing.projectId && projectId) existing.projectId = projectId
    try { await storage.set(EVIDENCE_KEY, existing) } catch { /* best-effort touch */ }
    return existing
  }
  const now = Date.now()
  const fresh: ExtEvidenceSession = {
    id: 'ev_' + now.toString(36),
    projectId,
    createdAt: now,
    updatedAt: now,
    title: '',
    desc: '',
    reportType: 'bug',
    shots: [],
  }
  await storage.set(EVIDENCE_KEY, fresh)
  return fresh
}

/**
 * Append a shot (tagged with its page) to the session, enforcing the count + byte caps. Returns
 * { ok:false, reason } WITHOUT mutating storage when a cap would be exceeded so the caller can surface a
 * gentle "max evidence reached" note. Callers should serialize their addShot calls to avoid a lost-update
 * race on the read-modify-write.
 */
export async function addShot(storage: EvidenceStorage, shot: ExtEvidenceShot): Promise<AddShotResult> {
  const cur = await readRaw(storage)
  if (!cur) throw new Error('evidence session not found')
  if (cur.shots.length >= MAX_SHOTS) return { ok: false, reason: 'max-shots', session: cur }
  const projected = sessionBytes(cur) + (shot.bytes || shot.dataUrl.length)
  if (projected > MAX_SESSION_BYTES) return { ok: false, reason: 'max-bytes', session: cur }
  cur.shots.push(shot)
  cur.updatedAt = Date.now()
  await storage.set(EVIDENCE_KEY, cur)
  return { ok: true, session: cur }
}

/** Patch the report's text fields. Returns the updated session, or null if gone. */
export async function updateFields(
  storage: EvidenceStorage,
  fields: { title?: string; desc?: string; reportType?: string },
): Promise<ExtEvidenceSession | null> {
  const cur = await readRaw(storage)
  if (!cur) return null
  if (fields.title !== undefined) cur.title = fields.title
  if (fields.desc !== undefined) cur.desc = fields.desc
  if (fields.reportType !== undefined) cur.reportType = fields.reportType
  cur.updatedAt = Date.now()
  await storage.set(EVIDENCE_KEY, cur)
  return cur
}

/** Drop one shot by id (when the reporter removes a thumbnail in the composer). */
export async function removeShot(storage: EvidenceStorage, shotId: string): Promise<ExtEvidenceSession | null> {
  const cur = await readRaw(storage)
  if (!cur) return null
  cur.shots = cur.shots.filter((s) => s.id !== shotId)
  cur.updatedAt = Date.now()
  await storage.set(EVIDENCE_KEY, cur)
  return cur
}

/** Delete the session entirely (on submit success or discard). Never throws. */
export async function clear(storage: EvidenceStorage): Promise<void> {
  try { await storage.remove(EVIDENCE_KEY) } catch { /* best-effort */ }
}

/** Build a shot record from a captured data URL, tagged with the current page. */
export function makeShot(dataUrl: string, page: { href: string; pathname: string; origin: string }, dims?: { w: number; h: number }): ExtEvidenceShot {
  return {
    id: makeShotId(),
    pageUrl: page.href,
    pagePath: page.pathname,
    pageOrigin: page.origin,
    label: '',
    dataUrl,
    bytes: dataUrl.length,
    w: dims?.w ?? 0,
    h: dims?.h ?? 0,
    ts: Date.now(),
  }
}
