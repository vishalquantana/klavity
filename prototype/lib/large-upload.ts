// Large-file attachments (KLA-559 follow-up): files too big for the single /api/feedback request.
//
// Flow (all three calls carry the same auth the reporter's /api/feedback submit would):
//   1. POST /api/uploads/start    {project_id, filename, content_type, size}  → { token, chunk_bytes, chunks }
//   2. POST /api/uploads/chunk?token=…&n=…   raw bytes of chunk n (exact length)  → { ok }   (retry-safe)
//   3. POST /api/uploads/complete {token}    → joins the chunks into one private object → { ref }
//   then the report's /api/feedback submit carries `file_refs` = JSON [ref, …] and the server attaches them.
//
// Tokens are stateless and HMAC-signed (KLAV_SECRET), so any server instance can serve any call and the
// client can't change the size, project, name or object key it was given. Small files never come here:
// they keep the existing /api/feedback multipart path unchanged.
import { createHmac, timingSafeEqual } from "node:crypto"

export const CHUNK_BYTES = 8 * 1024 * 1024
/** Upper bound for one large file. Default 5 GB; override with LARGE_UPLOAD_MAX_BYTES. */
export function largeUploadMaxBytes(): number {
  const v = Number(process.env.LARGE_UPLOAD_MAX_BYTES)
  return Number.isFinite(v) && v > 0 ? v : 5 * 1024 * 1024 * 1024
}
/** An upload token stays valid this long (a slow connection can take hours on a multi-GB file). */
export const UPLOAD_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
/** A finished file reference may be attached to a report for this long. */
export const FILE_REF_TTL_MS = 7 * 24 * 60 * 60 * 1000

export type UploadToken = { u: string; p: string; n: string; t: string; s: number; ts: number }
export type FileRef = { k: string; p: string; n: string; t: string; s: number; ts: number }

function secret(): string {
  const k = process.env.KLAV_SECRET
  if (!k) throw new Error("KLAV_SECRET is not set (needed to sign upload tokens)")
  return k
}
const b64u = (s: string) => Buffer.from(s, "utf8").toString("base64url")
const unb64u = (s: string) => Buffer.from(s, "base64url").toString("utf8")
const mac = (purpose: string, body: string) => createHmac("sha256", secret()).update(`${purpose}:${body}`).digest("base64url")

function sign(purpose: string, obj: object): string {
  const body = b64u(JSON.stringify(obj))
  return `${body}.${mac(purpose, body)}`
}
function verify<T>(purpose: string, token: unknown): T | null {
  if (typeof token !== "string" || token.length > 4000) return null
  const dot = token.lastIndexOf(".")
  if (dot <= 0) return null
  const body = token.slice(0, dot), sig = token.slice(dot + 1)
  let expected: string
  try { expected = mac(purpose, body) } catch { return null }
  const a = Buffer.from(sig), b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try { return JSON.parse(unb64u(body)) as T } catch { return null }
}

/** New upload id: a base36 timestamp first (lets the stale-parts sweep age it) + random. */
export function newUploadId(now = Date.now()): string {
  return `${now.toString(36)}_${crypto.randomUUID().replace(/-/g, "")}`
}

export function signUploadToken(t: UploadToken): string { return sign("lup", t) }
export function verifyUploadToken(token: unknown, now = Date.now()): UploadToken | null {
  const t = verify<UploadToken>("lup", token)
  if (!t || typeof t.u !== "string" || typeof t.s !== "number" || typeof t.ts !== "number") return null
  if (now - t.ts > UPLOAD_TOKEN_TTL_MS) return null
  return t
}
export function signFileRef(r: FileRef): string { return sign("lref", r) }
export function verifyFileRef(ref: unknown, now = Date.now()): FileRef | null {
  const r = verify<FileRef>("lref", ref)
  if (!r || typeof r.k !== "string" || typeof r.s !== "number" || typeof r.ts !== "number") return null
  if (now - r.ts > FILE_REF_TTL_MS) return null
  return r
}

/** How many chunks a file of `size` bytes is split into, and the exact length of chunk n. */
export function chunkCount(size: number): number { return Math.max(1, Math.ceil(size / CHUNK_BYTES)) }
export function chunkLength(size: number, n: number): number {
  const count = chunkCount(size)
  if (n < 0 || n >= count) return -1
  return n === count - 1 ? size - CHUNK_BYTES * (count - 1) : CHUNK_BYTES
}

/** Validate a start request. Returns the cleaned values or an error message. */
export function validateStart(body: any, maxBytes = largeUploadMaxBytes()):
  { ok: true; projectId: string; filename: string; contentType: string; size: number } | { ok: false; error: string } {
  const size = Number(body?.size)
  if (!Number.isFinite(size) || size <= 0 || !Number.isInteger(size)) return { ok: false, error: "File size is missing." }
  if (size > maxBytes) return { ok: false, error: `This file is larger than the ${Math.round(maxBytes / 1024 / 1024)} MB limit.` }
  const filename = String(body?.filename || "attachment").replace(/[\u0000-\u001f\\/]/g, "_").slice(0, 200) || "attachment"
  const ct = String(body?.content_type || "").trim().toLowerCase()
  const contentType = /^[a-z0-9.+-]+\/[a-z0-9.+-]+$/.test(ct) ? ct.slice(0, 100) : "application/octet-stream"
  const projectId = String(body?.project_id || "").trim().slice(0, 100)
  return { ok: true, projectId, filename, contentType, size }
}

/** Parse the `file_refs` form field: up to `max` verified refs bound to `projectId`. Bad entries are skipped. */
export function parseFileRefs(raw: unknown, projectId: string, max = 5, now = Date.now()): FileRef[] {
  if (typeof raw !== "string" || !raw || raw.length > 40_000) return []
  let arr: unknown
  try { arr = JSON.parse(raw) } catch { return [] }
  if (!Array.isArray(arr)) return []
  const out: FileRef[] = []
  const seen = new Set<string>()
  for (const item of arr) {
    const r = verifyFileRef(item, now)
    if (!r || r.p !== projectId || seen.has(r.k)) continue
    seen.add(r.k)
    out.push(r)
    if (out.length >= max) break
  }
  return out
}
