// ── "Record me" backup (host side of the recorder window) ─────────────────────────────────────────────
// WHY: the recorder WINDOW (recorder-window.ts) holds the video in its own memory. If the reporter closes
// that window by mistake, everything recorded so far used to be discarded. The window now streams each ~1s
// encoded piece to the reporter's tab, and this module keeps those pieces in the HOST origin's IndexedDB —
// which survives the tab's full page loads (PX4 changes document on every module click). When the window
// disappears mid-recording, the bridge rebuilds the video "up to that point" from these pieces.
//
// Pieces from one MediaRecorder session concatenate into a valid WebM/MP4 stream as long as they are in order
// and start at piece 0 (it carries the container header). A gap would corrupt everything after it, so
// recovery only uses the CONTIGUOUS run 0..n. If IndexedDB is unavailable (private mode / blocked storage)
// the store falls back to memory: recovery still works on the current page, just not across a navigation.

const DB_NAME = 'klavity-rec-backup'
const DB_VERSION = 1
const CHUNKS = 'chunks'   // key [session, seq] → { session, seq, buf, type } (raw bytes: safer than Blob in IDB)
const META = 'meta'       // key session        → BackupMeta

export interface BackupMeta {
  session: string
  projectId: string
  mime: string
  elapsedMs: number
  width: number
  height: number
  screenOnly: boolean
  startedAt: number
  /** Last time a piece was stored — lets another page tell a live session from an orphan. */
  updatedAt: number
}

export interface RecordBackup {
  putChunk(session: string, seq: number, blob: Blob): Promise<void>
  putMeta(meta: BackupMeta): Promise<void>
  getMeta(session: string): Promise<BackupMeta | null>
  /** Sorted seqs already stored for the session. */
  seqs(session: string): Promise<number[]>
  /** The contiguous run of pieces starting at seq 0 (what a playable recovery can use). */
  contiguousChunks(session: string): Promise<Blob[]>
  listMeta(): Promise<BackupMeta[]>
  clear(session: string): Promise<void>
}

/** Highest seq such that 0..seq are all present, or -1. */
export function contiguousUpTo(seqs: Iterable<number>): number {
  const have = new Set(seqs)
  let n = -1
  while (have.has(n + 1)) n++
  return n
}

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) })
}

function openDb(idb: IDBFactory): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = idb.open(DB_NAME, DB_VERSION)
    r.onupgradeneeded = () => {
      const db = r.result
      if (!db.objectStoreNames.contains(CHUNKS)) db.createObjectStore(CHUNKS, { keyPath: ['session', 'seq'] })
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META, { keyPath: 'session' })
    }
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}

function memoryBackup(): RecordBackup {
  const chunks = new Map<string, Map<number, Blob>>()
  const meta = new Map<string, BackupMeta>()
  return {
    async putChunk(s, seq, blob) { if (!chunks.has(s)) chunks.set(s, new Map()); chunks.get(s)!.set(seq, blob) },
    async putMeta(m) { meta.set(m.session, { ...m }) },
    async getMeta(s) { return meta.get(s) ?? null },
    async seqs(s) { return [...(chunks.get(s)?.keys() ?? [])].sort((a, b) => a - b) },
    async contiguousChunks(s) {
      const m = chunks.get(s); if (!m) return []
      const out: Blob[] = []
      for (let i = 0; m.has(i); i++) out.push(m.get(i)!)
      return out
    },
    async listMeta() { return [...meta.values()] },
    async clear(s) { chunks.delete(s); meta.delete(s) },
  }
}

export function createRecordBackup(idb: IDBFactory | null | undefined = (typeof indexedDB !== 'undefined' ? indexedDB : null)): RecordBackup {
  const mem = memoryBackup()
  if (!idb) return mem
  let dbp: Promise<IDBDatabase | null> | null = null
  const db = () => (dbp ??= openDb(idb).catch(() => null))
  // Every op falls back to the in-memory store if IndexedDB fails, so a backup never throws at the caller.
  const withDb = async <T>(fn: (d: IDBDatabase) => Promise<T>, fallback: () => Promise<T>): Promise<T> => {
    const d = await db()
    if (!d) return fallback()
    try { return await fn(d) } catch { return fallback() }
  }
  const rangeFor = (s: string) => IDBKeyRange.bound([s, 0], [s, Number.MAX_SAFE_INTEGER])
  return {
    putChunk: async (s, seq, blob) => {
      // Read the bytes BEFORE opening the transaction — an await inside it would auto-commit the transaction.
      let buf: ArrayBuffer
      try { buf = await blob.arrayBuffer() } catch { return mem.putChunk(s, seq, blob) }
      return withDb(async (d) => {
        await req(d.transaction(CHUNKS, 'readwrite').objectStore(CHUNKS).put({ session: s, seq, buf, type: blob.type }))
      }, () => mem.putChunk(s, seq, blob))
    },
    putMeta: (m) => withDb(async (d) => { await req(d.transaction(META, 'readwrite').objectStore(META).put({ ...m })) }, () => mem.putMeta(m)),
    getMeta: (s) => withDb(async (d) => (await req(d.transaction(META).objectStore(META).get(s))) as BackupMeta ?? null, () => mem.getMeta(s)),
    seqs: (s) => withDb(async (d) => {
      const keys = await req(d.transaction(CHUNKS).objectStore(CHUNKS).getAllKeys(rangeFor(s)))
      return (keys as any[]).map((k) => Number(k[1])).sort((a, b) => a - b)
    }, () => mem.seqs(s)),
    contiguousChunks: (s) => withDb(async (d) => {
      const rows = (await req(d.transaction(CHUNKS).objectStore(CHUNKS).getAll(rangeFor(s)))) as Array<{ seq: number; buf: ArrayBuffer; type?: string }>
      rows.sort((a, b) => a.seq - b.seq)
      const out: Blob[] = []
      for (let i = 0; i < rows.length && rows[i].seq === i; i++) out.push(new Blob([rows[i].buf], { type: rows[i].type || '' }))
      return out
    }, () => mem.contiguousChunks(s)),
    listMeta: () => withDb(async (d) => (await req(d.transaction(META).objectStore(META).getAll())) as BackupMeta[], () => mem.listMeta()),
    clear: (s) => withDb(async (d) => {
      const tx = d.transaction([CHUNKS, META], 'readwrite')
      tx.objectStore(CHUNKS).delete(rangeFor(s))
      tx.objectStore(META).delete(s)
      await new Promise<void>((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error) })
    }, () => mem.clear(s)),
  }
}
