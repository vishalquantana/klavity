// G1 — Session replay attached to bug reports (the FREE answer to Marker.io's $149 "Session replay").
//
// A widget/SDK records a rolling buffer of the last ~30-60s of rrweb DOM events. On bug submit those
// events ride along with the /api/feedback POST and are stored here, keyed to the feedback row.
//
// STORAGE: the event array is JSON.stringify'd, gzipped (Bun.gzipSync), and base64'd into
// feedback_replays.events_gz — mirroring the Trails walk_replays scheme (gzip ~20-100x vs raw / video).
// Every read is project-scoped (no cross-tenant leak). A hard byte cap on the encoded payload protects
// the DB: oversize buffers are TRIMMED oldest-first to the most-recent events that fit (a replay's tail
// — the seconds right before the bug — is the valuable part).
import { db } from "./db"
import { s3Configured, uploadReplayObject, getObjectBytes } from "./s3"

export type ReplayEvent = unknown

// ── object-storage offload (KLA-757/759 perf) ────────────────────────────────────────────────────
// The gzipped event buffer is offloaded to object storage so a READ never drags a 100s-of-KB BLOB out
// of remote Turso (the measured ~17s TTFB). The store is an injectable seam (mirrors s3.ts's
// OgPurgeDeps) so the ingest/read/backfill logic is unit-testable without real S3.
export interface ReplayBlobStore {
  /** True when object storage is configured; false ⇒ keep everything in the DB blob (dev/test). */
  configured(): boolean
  /** Upload the already-gzipped bytes; returns the durable object key. */
  upload(bytes: Uint8Array): Promise<string>
  /** Fetch the gzipped bytes for a previously-uploaded key. */
  fetch(key: string): Promise<Uint8Array>
}

export const s3ReplayStore: ReplayBlobStore = {
  configured: () => s3Configured(),
  upload: async (bytes) => (await uploadReplayObject(bytes)).key,
  fetch: async (key) => (await getObjectBytes(key)).bytes,
}

// Default max size of the stored base64-gzip payload. A 10 MB ceiling accommodates high-mutation
// pages during the last 30-60s while still bounding worst-case rows.
export const DEFAULT_REPLAY_CAP_BYTES = 10_000_000

// ── pure helpers (unit-tested) ────────────────────────────────────────────────────────
/** JSON → gzip → base64. */
export function encodeReplay(events: ReplayEvent[]): string {
  const json = JSON.stringify(events)
  return Buffer.from(Bun.gzipSync(Buffer.from(json))).toString("base64")
}

/** base64 → gunzip → JSON. */
export function decodeReplay(encoded: string): ReplayEvent[] {
  const gz = Buffer.from(encoded, "base64")
  return JSON.parse(Buffer.from(Bun.gunzipSync(gz)).toString()) as ReplayEvent[]
}

export interface CapResult {
  events: ReplayEvent[]   // the (possibly trimmed) events that fit under the cap
  encoded: string         // their base64-gzip encoding ("" for an empty buffer)
  trimmed: boolean        // true when events were dropped to fit
}

// rrweb EventType numeric tags (kept local so the trim logic has no rrweb import dependency).
const EVENT_FULL_SNAPSHOT = 2
const EVENT_META = 4

function eventType(e: ReplayEvent): number | undefined {
  return e && typeof e === "object" ? (e as { type?: number }).type : undefined
}

/**
 * Ensure the encoded payload fits under `capBytes` — dropping OLDEST events first, but SNAPSHOT-AWARE
 * so the retained list is always PLAYABLE (#729).
 *
 * rrweb replays are reconstructed from a single FullSnapshot (type 2) plus the Meta (type 4) rrweb
 * emits right before it; the incremental events (type 3, etc.) after the snapshot only make sense when
 * applied on top of that base. A naive "keep the largest trailing slice" trim can drop the snapshot
 * that lives near the START of a long buffer, leaving the player only orphan incrementals → a BLANK
 * (unplayable) replay. This is the storage-side twin of the client ring-buffer bug (#715).
 *
 * We mirror the SDK's ReplayRingBuffer.snapshot(): keep the most-recent Meta+FullSnapshot OUTSIDE the
 * trimmable window and RE-EMIT them at the HEAD, then fit as many of the most-recent post-snapshot
 * incrementals under the cap as will fit. The kept list therefore ALWAYS begins with [Meta, Full, …].
 */
export function capReplayEvents(events: ReplayEvent[], capBytes = DEFAULT_REPLAY_CAP_BYTES): CapResult {
  if (!events.length) return { events: [], encoded: "", trimmed: false }
  const encoded = encodeReplay(events)
  if (encoded.length <= capBytes) return { events, encoded, trimmed: false }

  // Locate the most-recent FullSnapshot and the Meta at/before it (rrweb emits Meta just before Full).
  let fullIdx = -1
  for (let i = events.length - 1; i >= 0; i--) {
    if (eventType(events[i]) === EVENT_FULL_SNAPSHOT) { fullIdx = i; break }
  }

  // No FullSnapshot anywhere — nothing we can do to guarantee a base; fall back to the largest tail
  // slice that fits (best-effort, marked trimmed). rrweb-player will show whatever it can.
  if (fullIdx === -1) {
    return { ...largestTail(events, capBytes), trimmed: true }
  }

  let metaIdx = -1
  for (let i = fullIdx; i >= 0; i--) {
    if (eventType(events[i]) === EVENT_META) { metaIdx = i; break }
  }

  // The base that MUST survive: [Meta?, FullSnapshot]. The incrementals we can trim: everything after.
  const base: ReplayEvent[] = metaIdx >= 0 ? [events[metaIdx], events[fullIdx]] : [events[fullIdx]]
  const post = events.slice(fullIdx + 1)

  // Degenerate: the base ALONE already exceeds the cap (a single huge snapshot). Keep it anyway — a
  // static frame is strictly better than a blank replay — and log it.
  const baseEncoded = encodeReplay(base)
  if (baseEncoded.length > capBytes) {
    console.warn(
      `[feedback-replay] Meta+FullSnapshot alone (${baseEncoded.length}B) exceeds cap ${capBytes}B; ` +
      `keeping a static frame (no incrementals) to avoid a blank replay (#729).`,
    )
    return { events: base, encoded: baseEncoded, trimmed: true }
  }

  // Binary-search the largest number of the MOST-RECENT post-snapshot incrementals that still fit when
  // prepended with the base. keep ∈ [0, post.length]. keep=0 ⇒ [Meta, Full] (playable static frame).
  let lo = 0, hi = post.length, best = 0, bestEncoded = baseEncoded
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const candidate = [...base, ...post.slice(post.length - mid)]
    const enc = encodeReplay(candidate)
    if (enc.length <= capBytes) { best = mid; bestEncoded = enc; lo = mid + 1 }
    else { hi = mid - 1 }
  }
  return { events: [...base, ...post.slice(post.length - best)], encoded: bestEncoded, trimmed: true }
}

/** Best-effort fallback: the largest trailing slice whose encoding fits (used only when there is no
 *  FullSnapshot to anchor on). keep ∈ [1, events.length]. */
function largestTail(events: ReplayEvent[], capBytes: number): { events: ReplayEvent[]; encoded: string } {
  let lo = 1, hi = events.length, best = 1, bestEncoded = encodeReplay(events.slice(-1))
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const enc = encodeReplay(events.slice(events.length - mid))
    if (enc.length <= capBytes) { best = mid; bestEncoded = enc; lo = mid + 1 }
    else { hi = mid - 1 }
  }
  return { events: events.slice(events.length - best), encoded: bestEncoded }
}

// ── storage ─────────────────────────────────────────────────────────────────────────
export interface SaveResult { saved: boolean; nEvents: number; trimmed: boolean; bytes: number }

/**
 * Persist a feedback's replay. Caps the payload (oldest-first trim) before insert. A best-effort
 * caller wraps this in try/catch — a replay failure must NEVER fail the bug submission.
 * Returns saved=false for an empty buffer (nothing to store).
 */
export async function saveFeedbackReplay(
  projectId: string, feedbackId: string, events: ReplayEvent[], capBytes = DEFAULT_REPLAY_CAP_BYTES,
  store: ReplayBlobStore = s3ReplayStore,
): Promise<SaveResult> {
  const cap = capReplayEvents(events, capBytes)
  if (!cap.events.length) return { saved: false, nEvents: 0, trimmed: false, bytes: 0 }
  // KLA-757/759: offload the gz bytes to object storage (fast reads). Best-effort — a failed upload must
  // NOT fail the replay save; we still write the DB blob (backward-compat + lazy-backfill fallback), so
  // the read path works with or without s3_key. The gz payload IS what the endpoint streams to the client.
  let s3key: string | null = null
  if (store.configured()) {
    try { s3key = await store.upload(Buffer.from(cap.encoded, "base64")) }
    catch (e: any) { s3key = null; console.warn("[feedback-replay] S3 upload failed (kept DB blob):", e?.message || e) }
  }
  await db!.execute({
    sql: `INSERT INTO feedback_replays (id, feedback_id, project_id, events_gz, n_events, bytes, trimmed, s3_key, created_at)
          VALUES (?,?,?,?,?,?,?,?,?)`,
    args: ["frep_" + crypto.randomUUID(), feedbackId, projectId, cap.encoded,
           cap.events.length, cap.encoded.length, cap.trimmed ? 1 : 0, s3key, Date.now()],
  })
  return { saved: true, nEvents: cap.events.length, trimmed: cap.trimmed, bytes: cap.encoded.length }
}

export interface FeedbackReplay { events: ReplayEvent[]; nEvents: number; trimmed: boolean; createdAt: number }

// KLA-759 (perf): the RAW stored replay — base64-gzip payload untouched, no gunzip/parse. Lets the HTTP
// endpoint stream the already-compressed events bytes straight to the client with Content-Encoding: gzip
// (browser decompresses transparently) instead of gunzip→JSON.stringify→send an uncompressed multi-MB
// body (the cause of slow/timed-out loads on large replays). The decompressed body IS exactly
// JSON.stringify(events) — a top-level events ARRAY — so meta (nEvents/trimmed) rides in response headers.
export interface FeedbackReplayGz { gz: Uint8Array; nEvents: number; trimmed: boolean; createdAt: number }

/**
 * Read the latest stored replay for a feedback row as RAW gzip BYTES (no gunzip/parse) — project-scoped
 * (no cross-tenant read). This is the perf-critical read path (KLA-757/759): it streams the gz payload
 * straight to the client with Content-Encoding: gzip.
 *
 * SOURCING: reads a cheap META row first (id + s3_key + counts — NEVER the events_gz BLOB), then:
 *   • FAST PATH — if s3_key is set and object storage is configured, fetch the bytes from S3 (fast) and
 *     never touch the Turso BLOB. This is the fix for the ~17s TTFB (large-BLOB read out of remote Turso).
 *   • SLOW PATH — a row with no s3_key (written before this landed, or when S3 was down at ingest): read
 *     the events_gz BLOB from the DB (the pathological slow read, but only ONCE), then LAZILY BACKFILL it
 *     to object storage and set s3_key so the NEXT read is fast. Backfill is best-effort.
 * Falls back to the DB blob if the S3 fetch throws (object missing) so a replay is never lost.
 */
export async function getFeedbackReplayGz(
  projectId: string, feedbackId: string, store: ReplayBlobStore = s3ReplayStore,
): Promise<FeedbackReplayGz | null> {
  // META first — no events_gz BLOB in this SELECT, so a fast row lookup stays fast.
  const meta = await db!.execute({
    sql: `SELECT id, s3_key, n_events, trimmed, created_at FROM feedback_replays
          WHERE project_id=? AND feedback_id=? ORDER BY created_at DESC LIMIT 1`,
    args: [projectId, feedbackId],
  })
  if (!meta.rows.length) return null
  const row = meta.rows[0] as any
  const id = String(row.id)
  const s3key = row.s3_key ? String(row.s3_key) : ""
  const out = { nEvents: Number(row.n_events), trimmed: !!Number(row.trimmed), createdAt: Number(row.created_at) }

  // FAST PATH — stream from object storage, never reading the DB BLOB.
  if (s3key && store.configured()) {
    try { return { gz: await store.fetch(s3key), ...out } }
    catch (e: any) { console.warn("[feedback-replay] S3 fetch failed, falling back to DB blob:", e?.message || e) }
  }

  // SLOW PATH — read the BLOB from the DB (the one-time slow read), then lazily backfill to S3.
  const blob = await db!.execute({ sql: `SELECT events_gz FROM feedback_replays WHERE id=?`, args: [id] })
  if (!blob.rows.length) return null
  const gz = Buffer.from(String((blob.rows[0] as any).events_gz), "base64")
  if (!s3key && store.configured()) {
    try {
      const key = await store.upload(gz)
      await db!.execute({ sql: `UPDATE feedback_replays SET s3_key=? WHERE id=?`, args: [key, id] })
    } catch (e: any) { console.warn("[feedback-replay] lazy S3 backfill failed (non-fatal):", e?.message || e) }
  }
  return { gz, ...out }
}

/** Read the latest stored replay for a feedback row — project-scoped (no cross-tenant read). */
export async function getFeedbackReplay(projectId: string, feedbackId: string): Promise<FeedbackReplay | null> {
  const r = await db!.execute({
    sql: `SELECT events_gz, n_events, trimmed, created_at FROM feedback_replays
          WHERE project_id=? AND feedback_id=? ORDER BY created_at DESC LIMIT 1`,
    args: [projectId, feedbackId],
  })
  if (!r.rows.length) return null
  const row = r.rows[0] as any
  return {
    events: decodeReplay(String(row.events_gz)),
    nEvents: Number(row.n_events),
    trimmed: !!Number(row.trimmed),
    createdAt: Number(row.created_at),
  }
}

// Replays older than this are eligible for automatic pruning (90 days).
// Sensitive DOM recordings should not accumulate indefinitely.
export const REPLAY_RETAIN_MS = 90 * 24 * 60 * 60 * 1000

/**
 * Delete feedback replays for a project that are older than maxAgeMs (default: REPLAY_RETAIN_MS).
 * Project-scoped: only rows matching projectId are touched.
 * Returns the number of rows deleted.
 */
export async function pruneOldFeedbackReplays(
  projectId: string,
  maxAgeMs = REPLAY_RETAIN_MS,
): Promise<number> {
  const cutoff = Date.now() - maxAgeMs
  const r = await db!.execute({
    sql: `DELETE FROM feedback_replays WHERE project_id=? AND created_at<?`,
    args: [projectId, cutoff],
  })
  return r.rowsAffected ?? 0
}

/**
 * Which of the given feedbackIds have a stored replay — project-scoped, one query. Lets the dashboard
 * show a "▶ Session replay" affordance only on tickets that actually have a recording.
 */
export async function feedbackIdsWithReplay(projectId: string, feedbackIds: string[]): Promise<Set<string>> {
  const out = new Set<string>()
  if (!feedbackIds.length) return out
  const placeholders = feedbackIds.map(() => "?").join(",")
  const r = await db!.execute({
    sql: `SELECT DISTINCT feedback_id FROM feedback_replays WHERE project_id=? AND feedback_id IN (${placeholders})`,
    args: [projectId, ...feedbackIds],
  })
  for (const row of r.rows) out.add(String((row as any).feedback_id))
  return out
}
