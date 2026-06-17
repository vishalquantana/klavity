import { S3Client } from 'bun'

const ENDPOINT = process.env.S3_ENDPOINT || ''
const REGION = process.env.S3_REGION || 'us-east-1'
const BUCKET = process.env.S3_BUCKET || ''
const FOLDER = (process.env.S3_FOLDER || 'uploads').replace(/\/+$/, '')
const ACCESS = process.env.AWS_ACCESS_KEY_ID || ''
const SECRET = process.env.AWS_SECRET_ACCESS_KEY || ''

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
// `screenshots` ledger row). `acl` is caller-chosen (§6 locked): 'public-read' for user-initiated Snap
// reports (default, back-compat), 'private' for Sim/live-review captures. For a private object the
// returned `url` is the (non-public) path-style URL — callers serve it via a signed GET (presignGet),
// never as a direct link.
export async function uploadScreenshotMeta(
  bytes: ArrayBuffer | Uint8Array,
  contentType: string,
  acl: 'public-read' | 'private' = 'public-read',
): Promise<UploadedScreenshot> {
  const ext = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png'
  const key = s3Key(FOLDER, Date.now(), crypto.randomUUID(), ext)
  await getClient().write(key, bytes, { acl, type: contentType })
  return { url: `${ENDPOINT.replace(/\/+$/, '')}/${BUCKET}/${key}`, key, bucket: BUCKET, contentType, acl }
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
