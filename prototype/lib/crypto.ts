// AES-GCM-256 encryption of secrets at rest. Key from KLAV_SECRET (base64, 32 bytes).
const enc = new TextEncoder()
const dec = new TextDecoder()

let keyPromise: Promise<CryptoKey> | null = null
function getKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    const raw = process.env.KLAV_SECRET
    if (!raw) throw new Error('KLAV_SECRET is not set (base64-encoded 32-byte key)')
    const bytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0))
    if (bytes.length !== 32) throw new Error('KLAV_SECRET must decode to 32 bytes')
    keyPromise = crypto.subtle.importKey('raw', bytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
  }
  return keyPromise
}

function b64(bytes: Uint8Array): string { return btoa(String.fromCharCode(...bytes)) }
function unb64(s: string): Uint8Array<ArrayBuffer> { return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)) as Uint8Array<ArrayBuffer> }

export async function encryptSecret(plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await getKey(), enc.encode(plain)))
  return `${b64(iv)}:${b64(ct)}`
}

export async function decryptSecret(blob: string): Promise<string> {
  const [ivb, ctb] = blob.split(':')
  if (!ivb || !ctb) throw new Error('malformed ciphertext')
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(ivb) }, await getKey(), unb64(ctb))
  return dec.decode(pt)
}

// Non-reversible SHA-256 (hex) — used to store bearer credentials (session ids, extension tokens,
// OTP codes) hashed at rest (E1/E2) so a DB read can't be replayed as a credential. Deterministic
// (no salt) on purpose: lookups are by exact hash. Uses Bun's CryptoHasher.
export function sha256hex(s: string): string {
  return new Bun.CryptoHasher('sha256').update(s).digest('hex')
}

// Opaque, deterministic, per-user BROWSER-CACHE NAMESPACE marker (the `klav_uid` cookie). HMAC-SHA256 keyed by
// KLAV_SECRET over a domain-separated, lower-cased email, truncated to 32 hex chars (128 bits). It lets the
// dashboard scope its localStorage (SWR) cache to the authenticated user BEFORE any cached data is painted, and
// notice when the browser-wide session changes user. It is NOT a credential and must NEVER be used by the server
// for authentication, authorization, session lookup, project access or role decisions — the session cookie
// remains the only thing the server trusts. Not reversible without KLAV_SECRET; exposes no email/secret.
// Returns "" when KLAV_SECRET/email is missing (callers then set no cookie → the client fails closed).
export function userCacheUid(email: string): string {
  const raw = process.env.KLAV_SECRET
  const e = (email || "").trim().toLowerCase()
  if (!raw || !e) return ""
  return new Bun.CryptoHasher('sha256', raw).update('klav_uid:v1:' + e).digest('hex').slice(0, 32)
}
