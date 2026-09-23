// KD-163: "Record me" survives a full page navigation.
//
// A screen recording lives in the page that started it: a full page load destroys the document, its
// MediaRecorder and its screen-share stream (and the recorder deliberately stops every track on pagehide —
// #474 privacy). Until now the clip existed only in memory, so navigating away lost everything recorded so
// far. This is a tiny single-slot IndexedDB store the recorder writes each ~1s chunk into AS IT ARRIVES, so
// when the page goes away the recording up to that moment is already on disk. The next page's widget calls
// loadDraft() to recover it and offer it to the reporter. Screen/camera/mic are NOT kept alive — only the
// bytes already captured are kept.
//
// Own database (not the evidence-session one) so a schema change here can never touch screenshot evidence.

const DB_NAME = 'klavity-recording-draft'
const DB_VERSION = 1
const META = 'meta'
const CHUNKS = 'chunks'
const ACTIVE = 'active'

// A draft older than this is treated as abandoned (mirrors the evidence session's freshness idea).
export const RECORDING_DRAFT_TTL_MS = 30 * 60 * 1000
// Ignore accidental blips: a "recording" shorter than this isn't worth offering back.
export const RECORDING_DRAFT_MIN_MS = 1000

export interface RecordingDraftMeta {
  id: string
  projectId: string
  origin: string
  pageUrl: string
  mime: string
  startedAt: number
  updatedAt: number
  elapsedMs: number
  width: number
  height: number
  screenOnly: boolean
  hadCamera: boolean
  hadAudio: boolean
}

export interface RecoveredRecording { meta: RecordingDraftMeta; blob: Blob }

function idb(): IDBFactory | null {
  try { return typeof indexedDB !== 'undefined' ? indexedDB : null } catch { return null }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const f = idb()
    if (!f) { reject(new Error('indexedDB unavailable')); return }
    const req = f.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META)
      if (!db.objectStoreNames.contains(CHUNKS)) db.createObjectStore(CHUNKS)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error || new Error('indexedDB open failed'))
  })
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error || new Error('indexedDB tx failed'))
    tx.onabort = () => reject(tx.error || new Error('indexedDB tx aborted'))
  })
}

/** Begin a new draft (replaces any previous one — the store is single-slot). */
export async function startDraft(meta: RecordingDraftMeta): Promise<void> {
  const db = await openDb()
  try {
    const tx = db.transaction([META, CHUNKS], 'readwrite')
    tx.objectStore(CHUNKS).clear()
    tx.objectStore(META).put(meta, ACTIVE)
    await done(tx)
  } finally { db.close() }
}

/** Persist one recorder chunk and bump the draft's elapsed time / freshness. */
export async function appendDraftChunk(seq: number, blob: Blob, elapsedMs: number): Promise<void> {
  const db = await openDb()
  try {
    const tx = db.transaction([META, CHUNKS], 'readwrite')
    const metaStore = tx.objectStore(META)
    tx.objectStore(CHUNKS).put(blob, seq)
    const get = metaStore.get(ACTIVE)
    get.onsuccess = () => {
      const m = get.result as RecordingDraftMeta | undefined
      if (m) metaStore.put({ ...m, elapsedMs: Math.max(m.elapsedMs, elapsedMs), updatedAt: Date.now() }, ACTIVE)
    }
    await done(tx)
  } finally { db.close() }
}

/** Remove the draft — call on every NORMAL exit (attached, cancelled, re-recorded, discarded). */
export async function clearDraft(): Promise<void> {
  const f = idb(); if (!f) return
  let db: IDBDatabase
  try { db = await openDb() } catch { return }
  try {
    const tx = db.transaction([META, CHUNKS], 'readwrite')
    tx.objectStore(META).clear()
    tx.objectStore(CHUNKS).clear()
    await done(tx)
  } finally { db.close() }
}

/**
 * Recover the draft for this project, if there is a usable, fresh one. Stale or too-short drafts are
 * deleted; a draft belonging to another project is left alone (returns null).
 */
export async function loadDraft(
  projectId: string,
  opts: { now?: number; ttlMs?: number; minMs?: number } = {},
): Promise<RecoveredRecording | null> {
  if (!idb()) return null
  const now = opts.now ?? Date.now()
  const ttl = opts.ttlMs ?? RECORDING_DRAFT_TTL_MS
  const minMs = opts.minMs ?? RECORDING_DRAFT_MIN_MS
  let db: IDBDatabase
  try { db = await openDb() } catch { return null }
  try {
    const meta = await new Promise<RecordingDraftMeta | undefined>((res, rej) => {
      const r = db.transaction(META, 'readonly').objectStore(META).get(ACTIVE)
      r.onsuccess = () => res(r.result as RecordingDraftMeta | undefined)
      r.onerror = () => rej(r.error)
    })
    if (!meta) return null
    if (meta.projectId !== projectId) return null
    if (now - meta.updatedAt > ttl || meta.elapsedMs < minMs) { await clearDraft(); return null }
    const parts = await new Promise<Blob[]>((res, rej) => {
      const store = db.transaction(CHUNKS, 'readonly').objectStore(CHUNKS)
      const keys = store.getAllKeys(); const vals = store.getAll()
      const out: Array<[number, Blob]> = []
      vals.onsuccess = () => {
        const k = (keys.result as number[]) || []
        ;(vals.result as Blob[]).forEach((b, i) => out.push([Number(k[i]), b]))
        out.sort((a, b) => a[0] - b[0])
        res(out.map((e) => e[1]))
      }
      vals.onerror = () => rej(vals.error)
    })
    if (!parts.length) { await clearDraft(); return null }
    return { meta, blob: new Blob(parts, { type: meta.mime.split(';')[0] }) }
  } catch {
    return null
  } finally { db.close() }
}

/**
 * Serialised writer the recorder feeds. Writes are chained so chunks land in order and a slow write never
 * reorders a later one; every write is best-effort (a storage failure must never affect the recording).
 */
export function createDraftWriter(base: Omit<RecordingDraftMeta, 'startedAt' | 'updatedAt' | 'elapsedMs' | 'id' | 'mime' | 'width' | 'height' | 'screenOnly' | 'hadCamera' | 'hadAudio'>) {
  let chain: Promise<unknown> = Promise.resolve()
  let seq = 0
  const enqueue = (fn: () => Promise<void>) => { chain = chain.then(fn, fn).catch(() => { /* best-effort */ }) }
  return {
    start(m: { id: string; mime: string; width: number; height: number; screenOnly: boolean; hadCamera: boolean; hadAudio: boolean }) {
      const now = Date.now()
      seq = 0
      enqueue(() => startDraft({ ...base, ...m, startedAt: now, updatedAt: now, elapsedMs: 0 }))
    },
    chunk(blob: Blob, elapsedMs: number) {
      const n = seq++
      enqueue(() => appendDraftChunk(n, blob, elapsedMs))
    },
    clear() { enqueue(() => clearDraft()) },
  }
}
export type RecordingDraftWriter = ReturnType<typeof createDraftWriter>
