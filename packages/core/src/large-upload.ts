// Large-file attachments (client side). A file too big for the single /api/feedback request is uploaded
// first, in fixed-size chunks, through /api/uploads/{start,chunk,complete}; the report then carries a signed
// `file_refs` entry for it. Files that fit today's caps never come here — they keep the existing path.
//
// Reliability: every chunk is retried with backoff on network errors / 5xx / 429, a "complete" that reports
// missing chunks re-sends exactly those, and a retried "complete" after a lost answer is answered at once by
// the server. Nothing is silently dropped: if a file can't be uploaded the whole submit fails with a clear
// message, so the composer stays open with the file still attached and the reporter can retry.
//
// The transport is injectable so the extension can route the calls through its background worker (which
// holds the auth token and isn't subject to the page's CORS); the widget/SDK use plain fetch.

/** The existing single-request caps (server: ATTACH_VIDEO_MAX_BYTES / SCREENSHOTS.maxBytes / ATTACH_TOTAL_MAX_BYTES). */
export const INLINE_VIDEO_MAX_BYTES = 100 * 1024 * 1024
export const INLINE_FILE_MAX_BYTES = 8 * 1024 * 1024
export const INLINE_TOTAL_MAX_BYTES = 110 * 1024 * 1024
/** The largest file the composer accepts when large uploads are enabled (server default LARGE_UPLOAD_MAX_BYTES). */
export const LARGE_FILE_MAX_BYTES = 5 * 1024 * 1024 * 1024

export type LargeUploadRequest = { path: string; query?: Record<string, string>; json?: unknown; bytes?: Uint8Array }
export type LargeUploadResponse = { status: number; text: string }
export type LargeUploadTransport = (req: LargeUploadRequest) => Promise<LargeUploadResponse>

export interface UploadableFile { name: string; type?: string; size: number; dataUrl?: string; blob?: Blob }

// Mirrors the server's isVideoAttachment (prototype/lib/attachment-video.ts) EXACTLY, so a file this side
// sends inline under the 100MB video cap is one the server also treats as a video (else it would 400).
const VIDEO_EXT = /\.(mp4|m4v|mov|webm|avi|mkv|ogv|3gp)$/i
function isVideo(f: { type?: string; name?: string }): boolean {
  if (/^video\//i.test(f.type || '')) return true
  const generic = !f.type || f.type === 'application/octet-stream'
  return generic && VIDEO_EXT.test(f.name || '')
}

/** Would this file be refused by the single-request path? */
export function needsLargeUpload(f: { size: number; type?: string; name?: string }): boolean {
  return f.size > (isVideo(f) ? INLINE_VIDEO_MAX_BYTES : INLINE_FILE_MAX_BYTES)
}

/**
 * Split attachments into the ones that still go inline (unchanged behaviour) and the ones to upload in chunks.
 * Also keeps the inline set under the request's total cap by moving the largest inline files out.
 */
export function splitForLargeUpload<T extends { size: number; type?: string; name?: string }>(files: T[] | undefined): { inline: T[]; large: T[] } {
  const inline: T[] = [], large: T[] = []
  for (const f of files || []) (needsLargeUpload(f) ? large : inline).push(f)
  let total = inline.reduce((n, f) => n + f.size, 0)
  while (total > INLINE_TOTAL_MAX_BYTES && inline.length) {
    let bi = 0
    for (let i = 1; i < inline.length; i++) if (inline[i].size > inline[bi].size) bi = i
    const [moved] = inline.splice(bi, 1)
    total -= moved.size
    large.push(moved)
  }
  return { inline, large }
}

/** fetch-based transport for the widget / SDK. `firstParty` sends cookies; otherwise an optional Bearer token. */
export function fetchTransport(backendUrl: string, auth: { firstParty?: boolean; token?: string } = {}, f: typeof fetch = fetch): LargeUploadTransport {
  const base = backendUrl.replace(/\/+$/, '')
  return async (req) => {
    const qs = req.query ? '?' + new URLSearchParams(req.query).toString() : ''
    const headers: Record<string, string> = {}
    if (!auth.firstParty && auth.token) headers.authorization = 'Bearer ' + auth.token
    let body: BodyInit | undefined
    if (req.bytes) { headers['content-type'] = 'application/octet-stream'; body = req.bytes as unknown as BodyInit }
    else if (req.json !== undefined) { headers['content-type'] = 'application/json'; body = JSON.stringify(req.json) }
    const res = await f(base + req.path + qs, { method: 'POST', headers, body, ...(auth.firstParty ? { credentials: 'include' as RequestCredentials } : {}) })
    return { status: res.status, text: await res.text().catch(() => '') }
  }
}

export class LargeUploadError extends Error {
  retryable: boolean
  constructor(message: string, retryable: boolean) { super(message); this.name = 'LargeUploadError'; this.retryable = retryable }
}

function parse(text: string): any { try { return JSON.parse(text.trim() || '{}') } catch { return {} } }
const sleepDefault = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 15000, 30000]

async function blobOf(f: UploadableFile): Promise<Blob> {
  if (f.blob) return f.blob
  if (f.dataUrl) {
    // (Own copy of integrations/backend dataUrlToBlob — importing it here would be a circular import.)
    const comma = f.dataUrl.indexOf(',')
    const header = f.dataUrl.slice(0, comma), body = f.dataUrl.slice(comma + 1)
    const mime = f.type || /data:([^;,]+)/.exec(header)?.[1] || 'application/octet-stream'
    if (/;base64/i.test(header)) {
      const bin = atob(body)
      const arr = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
      return new Blob([arr], { type: mime })
    }
    return new Blob([decodeURIComponent(body)], { type: mime })
  }
  throw new LargeUploadError(`"${f.name}" has no data to upload.`, false)
}

/**
 * Upload one file in chunks and return its signed ref. Retries each call on network errors / 5xx / 429.
 * `onProgress(sentBytes, totalBytes)` is called after every chunk.
 */
export async function uploadLargeFile(
  send: LargeUploadTransport,
  file: UploadableFile,
  opts: { projectId?: string; onProgress?: (sent: number, total: number) => void; sleep?: (ms: number) => Promise<void> } = {},
): Promise<string> {
  const sleep = opts.sleep ?? sleepDefault
  const blob = await blobOf(file)
  const size = blob.size
  const type = file.type || blob.type || 'application/octet-stream'

  // One call with retries. A thrown transport error (offline, CORS, dropped connection) counts as retryable.
  const call = async (req: LargeUploadRequest, okStatuses: number[] = [200]): Promise<LargeUploadResponse> => {
    let last = ''
    for (let attempt = 0; ; attempt++) {
      let res: LargeUploadResponse | null = null
      try { res = await send(req) } catch (e) { last = String((e as Error)?.message || e) }
      if (res) {
        if (okStatuses.includes(res.status)) return res
        const msg = parse(res.text).error
        const retryable = res.status === 0 || res.status === 429 || res.status >= 500
        if (!retryable) throw new LargeUploadError(msg || `Upload of "${file.name}" failed (${res.status}).`, res.status === 410)
        last = msg || `HTTP ${res.status}`
      }
      if (attempt >= RETRY_DELAYS_MS.length) throw new LargeUploadError(`Couldn't upload "${file.name}" — check your connection and try again. (${last})`, true)
      await sleep(RETRY_DELAYS_MS[attempt])
    }
  }

  const st = parse((await call({ path: '/api/uploads/start', json: { project_id: opts.projectId || '', filename: file.name, content_type: type, size } })).text)
  const token = String(st.token || ''), chunkBytes = Number(st.chunk_bytes), chunks = Number(st.chunks)
  if (!token || !(chunkBytes > 0) || !(chunks > 0)) throw new LargeUploadError(`Upload of "${file.name}" could not start.`, true)

  let sent = 0
  const sendChunk = async (n: number) => {
    const part = new Uint8Array(await blob.slice(n * chunkBytes, Math.min(size, (n + 1) * chunkBytes)).arrayBuffer())
    await call({ path: '/api/uploads/chunk', query: { token, n: String(n) }, bytes: part })
    return part.byteLength
  }
  for (let n = 0; n < chunks; n++) {
    sent += await sendChunk(n)
    try { opts.onProgress?.(sent, size) } catch { /* UI hook must never break the upload */ }
  }

  // Complete. 409 = some chunks are missing → re-send exactly those; a body with `retryable` = the join failed.
  for (let round = 0; round < 4; round++) {
    const res = await call({ path: '/api/uploads/complete', json: { token } }, [200, 409])
    const j = parse(res.text)
    if (res.status === 200 && typeof j.ref === 'string' && j.ref) return j.ref
    if (res.status === 409 && Array.isArray(j.missing) && j.missing.length) {
      for (const n of j.missing) if (Number.isInteger(n) && n >= 0 && n < chunks) await sendChunk(n)
      continue
    }
    await sleep(RETRY_DELAYS_MS[Math.min(round, RETRY_DELAYS_MS.length - 1)])
  }
  throw new LargeUploadError(`Couldn't finish uploading "${file.name}". Please try again.`, true)
}

/**
 * Upload every file that is too big for the single request, in order. Returns the files that still go inline
 * plus the refs for the uploaded ones. Throws (LargeUploadError) if any large file fails — never drops one.
 */
export async function offloadLargeFiles<T extends UploadableFile>(
  files: T[] | undefined,
  send: LargeUploadTransport,
  opts: { projectId?: string; onProgress?: (sent: number, total: number) => void; sleep?: (ms: number) => Promise<void> } = {},
): Promise<{ inline: T[]; refs: string[] }> {
  const { inline, large } = splitForLargeUpload(files)
  if (!large.length) return { inline: files ? files.slice() : [], refs: [] }
  const total = large.reduce((n, f) => n + f.size, 0)
  let before = 0
  const refs: string[] = []
  for (const f of large) {
    refs.push(await uploadLargeFile(send, f, { ...opts, onProgress: (s) => opts.onProgress?.(before + s, total) }))
    before += f.size
  }
  return { inline, refs }
}
