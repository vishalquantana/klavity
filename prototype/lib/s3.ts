import { S3Client } from 'bun'

const ENDPOINT = process.env.S3_ENDPOINT || ''
const REGION = process.env.S3_REGION || 'us-east-1'
const BUCKET = process.env.S3_BUCKET || ''
const FOLDER = (process.env.S3_FOLDER || 'uploads').replace(/\/+$/, '')
const ACCESS = process.env.AWS_ACCESS_KEY_ID || ''
const SECRET = process.env.AWS_SECRET_ACCESS_KEY || ''

// True only when the S3 credentials/bucket are fully configured. Callers use this to SKIP optional,
// best-effort capture work (e.g. AutoSim run recording) when there is nowhere to persist it — so no
// ffmpeg/upload cost is paid in envs (tests/dev) without object storage.
export function s3Configured(): boolean {
  return !!(ENDPOINT && BUCKET && ACCESS && SECRET)
}

export function s3Key(folder: string, ts: number, id: string, ext: string): string {
  return `${folder.replace(/\/+$/, '')}/${ts}-${id}.${ext}`
}

let client: S3Client | null = null
function getClient(): S3Client {
  if (!ENDPOINT || !BUCKET || !ACCESS || !SECRET) {
    throw new Error('S3 is not configured (set S3_ENDPOINT, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)')
  }
  if (!client) {
    client = new S3Client({ accessKeyId: ACCESS, secretAccessKey: SECRET, bucket: BUCKET, endpoint: ENDPOINT, region: REGION })
  }
  return client
}

export type UploadedScreenshot = { url: string; key: string; bucket: string; contentType: string; acl: string }

// Upload one screenshot and return its storage metadata (key/bucket so callers can record a durable
// `screenshots` ledger row). `acl` defaults to 'private' (no public bucket exposure — CASA/PII): the
// returned `url` is the (non-public) path-style URL and callers MUST serve it via a signed GET
// (`presignGet`) — for the dashboard via the membership-checked /api/screenshots/:id endpoint, and for
// external trackers by embedding a short-lived presigned URL. 'public-read' remains available for any
// caller that explicitly needs a permanent direct link, but should be avoided for user content.
export async function uploadScreenshotMeta(
  bytes: ArrayBuffer | Uint8Array,
  contentType: string,
  acl: 'public-read' | 'private' = 'private',
): Promise<UploadedScreenshot> {
  const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png'
  const key = s3Key(FOLDER, Date.now(), crypto.randomUUID(), ext)
  // TODO SSE: Bun's S3Client.write has no server-side-encryption option (no x-amz-server-side-encryption
  // passthrough); enable bucket default encryption (SSE-S3/aws:kms) in the provider console instead.
  await getClient().write(key, bytes, { acl, type: contentType })
  return { url: `${ENDPOINT.replace(/\/+$/, '')}/${BUCKET}/${key}`, key, bucket: BUCKET, contentType, acl }
}

// AutoSim fixture attachments (file-upload steps). Stored PRIVATE under an `attachments/` prefix,
// keyed by a random id so filenames never collide or leak. The original filename's extension is
// preserved so the browser sends a sensible content-type when the fixture is uploaded to a file input.
export type UploadedAttachment = { key: string; bucket: string; filename: string; contentType: string }
export async function uploadAttachment(
  bytes: ArrayBuffer | Uint8Array,
  filename: string,
  contentType: string,
): Promise<UploadedAttachment> {
  const extMatch = /\.([A-Za-z0-9]{1,8})$/.exec(filename)
  const ext = extMatch ? extMatch[1].toLowerCase() : 'bin'
  const key = s3Key(`${FOLDER}/attachments`, Date.now(), crypto.randomUUID(), ext)
  await getClient().write(key, bytes, { acl: 'private', type: contentType || 'application/octet-stream' })
  return { key, bucket: BUCKET, filename, contentType: contentType || 'application/octet-stream' }
}

// AutoSim run RECORDINGS (KLAVITYKLA-490). Stored PRIVATE under a `recordings/` prefix, keyed by a
// random id. The full webm can be several MB, so it lives in S3 (never in the DB row); a walk_artifacts
// manifest row keeps only the S3 keys + meta. Served via the membership-checked recording route, which
// streams the bytes (getObjectBytes) — no public bucket exposure.
export async function uploadRecordingObject(
  bytes: ArrayBuffer | Uint8Array,
  contentType: string,
  ext: string,
): Promise<{ key: string; bucket: string; contentType: string }> {
  const safeExt = /^[a-z0-9]{1,8}$/i.test(ext) ? ext.toLowerCase() : 'bin'
  const key = s3Key(`${FOLDER}/recordings`, Date.now(), crypto.randomUUID(), safeExt)
  await getClient().write(key, bytes, { acl: 'private', type: contentType || 'application/octet-stream' })
  return { key, bucket: BUCKET, contentType: contentType || 'application/octet-stream' }
}

// KLA-738: write one object to an EXPLICIT key (not a random one). Used by the OG social-card
// pre-render pipeline to store the rendered PNG at a deterministic, cacheable key (`og/<ref>.png`)
// so `GET /og/:ref.png` can look it up by ref. acl defaults to 'private' (KLA-739 C1): the /og route
// STREAMS the object back itself (getObjectStream, credentialed), so the bucket must NOT expose these
// ticket-derived PNGs publicly — a public-read object would let anyone bypass the /og access gate by
// hitting the S3 URL directly and read a private ticket's rendered card. 'public-read' stays available
// for callers that explicitly need a permanent direct link, but must be avoided for user content.
export async function uploadObject(
  key: string,
  bytes: ArrayBuffer | Uint8Array,
  contentType: string,
  acl: 'public-read' | 'private' = 'private',
): Promise<{ key: string; bucket: string; contentType: string }> {
  await getClient().write(key, bytes, { acl, type: contentType })
  return { key, bucket: BUCKET, contentType }
}

// Delete one object by key. Used by the data-retention sweep (C1) and GDPR erasure (C2) to remove the
// underlying S3 bytes when a screenshots ledger row is deleted. Best-effort: callers should catch/log.
export async function deleteObject(key: string): Promise<void> {
  await getClient().delete(key)
}

// True iff an object exists at `key` (a cheap metadata HEAD via stat; never fetches the body).
export async function objectExists(key: string): Promise<boolean> {
  try { await getClient().file(key).stat(); return true } catch { return false }
}

// List object keys under a prefix (one page). Returns the page's keys + a continuation token when the
// listing is truncated, so callers can page through a large prefix.
export async function listObjectKeys(prefix: string, continuationToken?: string): Promise<{ keys: string[]; next?: string }> {
  const res: any = await getClient().list({ prefix, maxKeys: 1000, ...(continuationToken ? { continuationToken } : {}) })
  const keys: string[] = Array.isArray(res?.contents) ? res.contents.map((c: any) => String(c?.key)).filter(Boolean) : []
  const next = res?.isTruncated ? (res?.nextContinuationToken || undefined) : undefined
  return { keys, next }
}

// ── KLA-739 (C1-b): one-shot purge of LEGACY OG objects ──────────────────────────────────────────
// OG PNGs written BEFORE the hotfix were uploaded public-read AND without the redaction tier in the key,
// so they remain directly fetchable by bucket URL — leaking private (share_mode='off') tickets the old
// intake pre-rendered, and letting a teaser viewer's key collide with a cached 'full' object. They're
// throwaway (regenerate on demand — now private + tier-keyed + gated), so we DELETE the whole og/ prefix
// exactly once per environment, guarded by a marker object so it never runs again on subsequent boots.

export const OG_PURGE_MARKER = "og/.purged-legacy-v1"

// KLA-739 (C1-b residual b): a key is LEGACY (pre-hotfix, public-read, non-tier-keyed) iff it does NOT
// carry a tier segment. New objects are keyed og/<ref>-full-<v>.png / og/<ref>-teaser-<v>.png (via
// ogKeyVersion), so ANY key containing a `-full-` or `-teaser-` segment is a NEW private object and MUST
// be preserved — the purge must never delete a fresh private render (cold-cache churn / rolling-deploy
// race). The marker itself is never legacy.
export function isLegacyOgKey(key: string): boolean {
  if (!key || key === OG_PURGE_MARKER) return false
  if (!key.startsWith("og/")) return false
  return !/-(?:full|teaser)-/.test(key)
}

export interface OgPurgeDeps {
  hasMarker: () => Promise<boolean>
  list: (continuationToken?: string) => Promise<{ keys: string[]; next?: string }>
  del: (key: string) => Promise<void>
  putMarker: () => Promise<void>
}

// Pure, injectable purge: skip if the marker exists; else delete every LEGACY (un-tiered) og/* key,
// paging to the end. The one-shot marker is written ONLY if EVERY delete succeeded (residual a): a single
// failed delete (AccessDenied/5xx) leaves a public legacy object alive, so we must NOT certify the purge
// done — skip the marker and retry on the next boot instead.
export async function purgeOgObjectsWith(deps: OgPurgeDeps): Promise<{ purged: number; failed: number; skipped: boolean }> {
  if (await deps.hasMarker()) return { purged: 0, failed: 0, skipped: true }
  let purged = 0
  let failed = 0
  let token: string | undefined
  do {
    const { keys, next } = await deps.list(token)
    for (const k of keys) {
      if (!isLegacyOgKey(k)) continue // preserve NEW tier-keyed private objects + the marker
      try { await deps.del(k); purged++ } catch { failed++ /* leave a public object alive → do not certify */ }
    }
    token = next
  } while (token)
  // Only mark done when nothing failed — otherwise a public legacy object survived and we must retry.
  if (failed === 0) await deps.putMarker()
  return { purged, failed, skipped: false }
}

// Wire the pure purge to the real S3 client. No-op when S3 is unconfigured. Best-effort; never throws.
export async function purgeLegacyOgObjects(): Promise<{ purged: number; failed: number; skipped: boolean }> {
  if (!s3Configured()) return { purged: 0, failed: 0, skipped: true }
  return purgeOgObjectsWith({
    hasMarker: () => objectExists(OG_PURGE_MARKER),
    list: (t) => listObjectKeys("og/", t),
    del: (k) => deleteObject(k),
    putMarker: async () => { await uploadObject(OG_PURGE_MARKER, new Uint8Array([1]), "application/octet-stream", "private") },
  })
}

// Read one PRIVATE object's bytes (used by the connector export path to pass bytes to trackers that
// natively attach the image). Throws if S3 isn't configured / not found. NOTE: this BUFFERS the whole
// object — do not use it for high-fanout HTTP serving; use getObjectStream instead (KLA-519).
export async function getObjectBytes(key: string): Promise<{ bytes: Uint8Array; contentType: string }> {
  const f = getClient().file(key)
  const buf = await f.arrayBuffer()
  return { bytes: new Uint8Array(buf), contentType: f.type || "image/png" }
}

// KLA-519: stream one PRIVATE object WITHOUT buffering it in RAM. Returns the object body as a lazy
// Web ReadableStream plus its stat'd content-type and size, so the /img embed route can pipe the S3
// bytes straight to the HTTP response — a multi-MB screenshot never sits fully in the 1GB box's heap.
// Bun's S3File.type/size are NOT populated until a read ("" / NaN on a fresh handle), so we issue a
// cheap HEAD-style `stat()` (metadata only — never fetches the body) for accurate type + size. The
// S3File itself can't be used as the Response body (Bun rejects `new Response(s3File, {headers})`),
// so we hand over `file.stream()`; Bun.serve consumes it lazily as the client reads. Without a
// known-length body Bun serves chunked transfer-encoding (no content-length) — fine for <img> embeds.
// Throws if S3 isn't configured; a missing object throws from stat() and the caller maps to 404.
export async function getObjectStream(key: string): Promise<{ stream: ReadableStream<Uint8Array>; contentType: string; size: number | null }> {
  const f = getClient().file(key)
  let contentType = "application/octet-stream"
  let size: number | null = null
  const st = await f.stat() // throws on not-found → caller 404s, same contract as getObjectBytes
  if (st?.type) contentType = st.type
  if (st && Number.isFinite(st.size) && st.size >= 0) size = st.size
  return { stream: f.stream() as unknown as ReadableStream<Uint8Array>, contentType, size }
}

// Upload one screenshot and return its public path-style URL.
export async function uploadScreenshot(bytes: ArrayBuffer | Uint8Array, contentType: string): Promise<string> {
  return (await uploadScreenshotMeta(bytes, contentType)).url
}

// Presigned, time-limited GET URL for a PRIVATE object (Sim/live-review screenshots, §5d). The caller
// is responsible for membership-checking before handing this out. expiresInSec defaults to 10 minutes.
export function presignGet(key: string, expiresInSec = 600): string {
  return getClient().presign(key, { method: 'GET', expiresIn: expiresInSec })
}
