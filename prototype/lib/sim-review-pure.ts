// lib/sim-review-pure.ts
// Pure helpers for the Sim-review pipeline — NO imports from ./db or @libsql/client.
// Exported separately so unit tests can load them without triggering the DB client.
import { createHash } from "node:crypto"

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Controls which observations are included in the Sim review response.
 *   "all"      — every observation, regardless of sentiment or bug status (default)
 *   "positive" — only positive-sentiment observations (what's working well)
 *   "critical" — only negative-sentiment OR bug-candidate observations (what's broken)
 *
 * Default "all" preserves the existing behaviour; callers opt in by passing a mode.
 */
export type SimFeedbackMode = "all" | "positive" | "critical"

/**
 * Returns true when `obs` should be included under the given mode.
 * Applied after full observation assembly (sentiment + suggestedBug both set).
 */
export function obsPassesMode(
  obs: { sentiment: string | null; suggestedBug?: any | null },
  mode: SimFeedbackMode,
): boolean {
  if (mode === "all") return true
  if (mode === "positive") return obs.sentiment === "positive"
  // "critical": negative sentiment OR a bug candidate (from the heuristic classifier)
  if (mode === "critical") return obs.sentiment === "negative" || obs.suggestedBug != null
  return true  // unknown mode → pass-through (forward-compatible)
}

/**
 * Normalised bounding box (0..1) of the element/area on the page a Sim is reacting to.
 * x,y = top-left corner; w,h = dimensions. All values clamped to [0,1].
 * null for page-level or general observations that have no specific element target.
 */
export interface ObsRegion {
  x: number   // left edge  0..1
  y: number   // top edge   0..1
  w: number   // width      0..1
  h: number   // height     0..1
}

/**
 * Parse and validate a region object from raw model output.
 * Accepts the model's `region` or legacy `box` field name.
 * Clamps each component to [0,1]; returns null if the input is absent or malformed.
 */
export function parseRegion(raw: any): ObsRegion | null {
  if (raw == null || typeof raw !== "object") return null
  const clamp = (v: any): number | null => {
    const n = typeof v === "number" ? v : parseFloat(v)
    if (!isFinite(n)) return null
    return Math.max(0, Math.min(1, n))
  }
  const x = clamp(raw.x), y = clamp(raw.y), w = clamp(raw.w), h = clamp(raw.h)
  if (x === null || y === null || w === null || h === null) return null
  return { x, y, w, h }
}

/** One Sim's reaction to a page, enriched with dedup + recurrence context. */
export interface SimObservation {
  observation: string           // the observation text (matches client renderFeedback contract)
  sentiment: string | null      // positive | negative | neutral (or model values: frustrated etc.)
  priority: string | null       // "urgent"|"high"|"medium"|"low" from bug candidate; null = no bug
  quote: string | null          // verbatim source quote from a trait, if cited
  hash: string                  // sha256 slice-16 dedup token — stable within a session
  region: ObsRegion | null      // normalised 0..1 bbox of the targeted element; null = page-level
  suggestedBug?: any | null
  feedbackId?: string
  deduped?: boolean             // true when matched an existing feedback row
  recurrence?: any | null       // RecurrenceMemory (KLA-2) when deduped = true
}

export interface SimReview {
  simId: string
  simName: string
  initials?: string | null
  accent?: string | null
  observations: SimObservation[]
}

// ── hashObservation ──────────────────────────────────────────────────────────

/**
 * Stable 16-hex hash of an observation text — the client's session-dedup token.
 * Case- and whitespace-insensitive so "Button broken" and "  BUTTON BROKEN  "
 * are treated as the same observation and not shown twice.
 */
export function hashObservation(text: string): string {
  return createHash("sha256").update((text ?? "").trim().toLowerCase()).digest("hex").slice(0, 16)
}

// ── decodeDataUrl ─────────────────────────────────────────────────────────────

/**
 * Decode a data: URL → { bytes, contentType, base64 }.
 * Extracted from server.ts so lib/ consumers don't need to import server.ts.
 */
export function decodeDataUrl(dataUrl: string): { bytes: Uint8Array; contentType: string; base64: string } | null {
  const m = String(dataUrl || "").match(/^data:([^;,]+)?(;base64)?,(.*)$/s)
  if (!m) return null
  const contentType = m[1] || "image/png"
  const isB64 = !!m[2]
  const data = m[3] || ""
  try {
    const bytes = isB64
      ? Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
      : new TextEncoder().encode(decodeURIComponent(data))
    const base64 = isB64 ? data : Buffer.from(bytes).toString("base64")
    return { bytes, contentType, base64 }
  } catch { return null }
}

// ── splitUrl ──────────────────────────────────────────────────────────────────

/**
 * Extract {urlHost, urlPath} from a page URL; strips query+fragment (privacy §5c).
 */
export function splitUrl(pageUrl: string): { urlHost: string | null; urlPath: string | null } {
  if (!pageUrl) return { urlHost: null, urlPath: null }
  try { const u = new URL(pageUrl); return { urlHost: u.host, urlPath: u.pathname } }
  catch { return { urlHost: null, urlPath: pageUrl.split(/[?#]/)[0] || null } }
}

// ── buildSimRunSummary ────────────────────────────────────────────────────────

/** Aggregate a SimReview[] into lightweight totals (for logging + sim_runs record). */
export function buildSimRunSummary(reviews: SimReview[]): {
  simCount: number; totalObservations: number; bugCount: number; dedupedCount: number; newCount: number
} {
  let totalObservations = 0, bugCount = 0, dedupedCount = 0, newCount = 0
  for (const rev of reviews) {
    totalObservations += rev.observations.length
    for (const o of rev.observations) {
      if (o.suggestedBug) bugCount++
      if (o.deduped) dedupedCount++
      else newCount++
    }
  }
  return { simCount: reviews.length, totalObservations, bugCount, dedupedCount, newCount }
}

// ── Same-URL run diffing (JTBD 3.8 — "why is this broken again") ──────────────
//
// Given two runs of the SAME url (current + the previous done run), report what
// changed so the Loop-B question is answerable at a glance:
//   • newFindings      — bug-flagged observations in `curr` not present in `prev`
//   • resolvedFindings — bug-flagged observations in `prev` gone from `curr`
//   • changedReactions — per-Sim sentiment shifts between the two runs
// Findings are keyed by observation hash (falls back to normalised text), so the
// same finding across runs matches even when the model rephrases lightly.

/** Text of an observation across the real (.observation) and legacy (.text) shapes. */
function obsTextOf(o: any): string {
  return String((o && (o.observation ?? o.text)) ?? "").trim()
}
/** Stable key for a finding across runs: prefer the stored hash, else lowercased text. */
function obsKeyOf(o: any): string {
  const h = o && typeof o.hash === "string" ? o.hash : ""
  return h || obsTextOf(o).toLowerCase()
}
/** Only bug-flagged observations count as "findings" (the ones a dev must act on). */
function isFinding(o: any): boolean {
  return !!(o && o.suggestedBug)
}

export interface RunFinding {
  key: string
  text: string
  simName: string | null
  priority: string | null
  feedbackId: string | null
}
export interface RunReactionChange {
  simName: string | null
  from: string | null
  to: string | null
}
export interface SimRunDiff {
  hasPrevious: boolean
  newFindings: RunFinding[]
  resolvedFindings: RunFinding[]
  changedReactions: RunReactionChange[]
}

function collectFindings(reviews: any[]): Map<string, RunFinding> {
  const out = new Map<string, RunFinding>()
  for (const rev of reviews || []) {
    for (const o of (rev?.observations || [])) {
      if (!isFinding(o)) continue
      const key = obsKeyOf(o)
      if (!key || out.has(key)) continue
      out.set(key, {
        key,
        text: obsTextOf(o),
        simName: rev?.simName ?? null,
        priority: (o?.priority ?? o?.suggestedBug?.priority ?? o?.suggestedBug?.severity) ?? null,
        feedbackId: typeof o?.feedbackId === "string" ? o.feedbackId : null,
      })
    }
  }
  return out
}

/** Dominant sentiment for a Sim in a run (first non-null observation sentiment). */
function simSentiment(reviews: any[], simName: string | null): string | null {
  for (const rev of reviews || []) {
    if ((rev?.simName ?? null) !== simName) continue
    for (const o of (rev?.observations || [])) {
      if (o?.sentiment) return String(o.sentiment)
    }
  }
  return null
}

export function diffSimRuns(currReviews: any[] | null, prevReviews: any[] | null): SimRunDiff {
  if (!Array.isArray(prevReviews)) {
    return { hasPrevious: false, newFindings: [], resolvedFindings: [], changedReactions: [] }
  }
  const curr = collectFindings(currReviews || [])
  const prev = collectFindings(prevReviews || [])
  const newFindings: RunFinding[] = []
  const resolvedFindings: RunFinding[] = []
  for (const [key, f] of curr) if (!prev.has(key)) newFindings.push(f)
  for (const [key, f] of prev) if (!curr.has(key)) resolvedFindings.push(f)

  // Per-Sim sentiment shift across the union of Sims present in either run.
  const simNames = new Set<string | null>()
  for (const rev of (currReviews || [])) simNames.add(rev?.simName ?? null)
  for (const rev of (prevReviews || [])) simNames.add(rev?.simName ?? null)
  const changedReactions: RunReactionChange[] = []
  for (const simName of simNames) {
    const from = simSentiment(prevReviews || [], simName)
    const to = simSentiment(currReviews || [], simName)
    if (from !== to) changedReactions.push({ simName, from, to })
  }
  return { hasPrevious: true, newFindings, resolvedFindings, changedReactions }
}

// ── Active review target selection ─────────────────────────────────────────────

/**
 * Choose which target Sims should be sent to the LLM for this review.
 * Continuous/background reviews honor the in-process seen cache; explicit ad-hoc
 * deploys bypass it so a user-triggered "Deploy all Sims" can always render fresh
 * reactions for the current page.
 */
export function activeReviewIndexes(
  seenKeys: string[],
  reviewSeen: (key: string) => boolean,
  adhoc = false,
): number[] {
  return seenKeys.map((_, i) => i).filter((i) => adhoc || !reviewSeen(seenKeys[i]))
}

// ── Near-duplicate detection ──────────────────────────────────────────────────
//
// Continuous browsing fires many analyses of similar pages (e.g. /pricing watched
// while the admin scrolls or opens tabs). LLMs rephrase the same finding each time:
//   screen 1: "The CTA button is unresponsive"
//   screen 2: "The call-to-action button doesn't respond to clicks"
//
// Exact hash matching (seenHashes) won't catch these. Trigram-based lexical
// similarity catches rephrases while still letting through genuinely different
// observations from new screens.

// Threshold tuned against live LLM output: rephrases of the same visual finding
// typically score 0.59–0.95; unrelated observations from the same page score 0.10–0.45;
// borderline cases (different specifics, shared element name) land around 0.50–0.57.
// 0.55 catches clear rephrases without triggering on "images slow" vs "videos slow".
export const NEAR_DUP_THRESHOLD = 0.55

function obsTrigramSet(text: string): Set<string> {
  // Normalise more aggressively than hashObservation: strip punctuation + collapse spaces.
  const norm = (text ?? "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim()
  const out = new Set<string>()
  if (!norm) return out
  const padded = `  ${norm} `
  for (let i = 0; i < padded.length - 2; i++) out.add(padded.slice(i, i + 3))
  return out
}

function trigramSim(a: string, b: string): number {
  const A = obsTrigramSet(a)
  const B = obsTrigramSet(b)
  if (A.size === 0 || B.size === 0) return 0
  let inter = 0
  for (const t of A) if (B.has(t)) inter++
  return inter / Math.sqrt(A.size * B.size)
}

/**
 * Returns true when `text` is a near-duplicate of any string in `seenTexts`.
 * Uses character-trigram cosine similarity (same algorithm as feedback dedup,
 * lower threshold 0.75 to catch rephrases across consecutive screen captures).
 */
export function obsIsNearDup(text: string, seenTexts: string[], threshold = NEAR_DUP_THRESHOLD): boolean {
  if (!seenTexts.length || !text.trim()) return false
  for (const seen of seenTexts) {
    if (trigramSim(text, seen) >= threshold) return true
  }
  return false
}

// ── Per-session cost ceiling ──────────────────────────────────────────────────
//
// Continuous analysis can fire dozens of LLM calls per session (every scroll/nav).
// Each call costs ~$0.001–0.003. A 4-hour browse session uncapped could easily
// exceed $1 per user. The ceiling is enforced HERE (lib layer) so it applies
// regardless of how/where the server calls runSimReviews.
//
// Tuning:
//   SESSION_CALL_CEIL = 20  → ~20 page analyses per 4h session = ~$0.04 worst case
//   SESSION_OBS_CEIL  = 60  → 60 unique surfaced observations; prevents flooding the UI
//   SESSION_TTL_MS    = 4h  → session resets after 4 hours of inactivity

export const SESSION_CALL_CEIL = 20                         // max LLM calls per session
export const SESSION_OBS_CEIL = 60                          // max observations surfaced per session
export const SESSION_TTL_MS = 4 * 60 * 60 * 1000           // 4-hour TTL

interface SimSession {
  texts: string[]     // normalized observation texts seen (for near-dup matching)
  calls: number       // total LLM reactFn calls this session
  obs: number         // total new observations surfaced this session
  lastAt: number      // last activity timestamp (for TTL)
}

// Process-level session store. Bounded to prevent unbounded growth across long-lived servers.
const _sessions = new Map<string, SimSession>()
const _SESSIONS_MAX = 5_000

function _gcSessions(now: number): void {
  for (const [id, s] of _sessions) {
    if (now - s.lastAt > SESSION_TTL_MS) _sessions.delete(id)
  }
}

function _get(id: string, now: number): SimSession | undefined {
  const s = _sessions.get(id)
  if (!s) return undefined
  if (now - s.lastAt > SESSION_TTL_MS) { _sessions.delete(id); return undefined }
  return s
}

function _touch(id: string, now: number): SimSession {
  let s = _get(id, now)
  if (!s) {
    if (_sessions.size >= _SESSIONS_MAX) _gcSessions(now)
    s = { texts: [], calls: 0, obs: 0, lastAt: now }
    _sessions.set(id, s)
  }
  s.lastAt = now
  return s
}

/** True when the session has reached the LLM call ceiling (no more AI calls allowed). */
export function sessionCallCapped(id: string, now = Date.now()): boolean {
  const s = _get(id, now)
  return s != null && s.calls >= SESSION_CALL_CEIL
}

/** True when the session has surfaced the maximum number of observations. */
export function sessionObsCapped(id: string, now = Date.now()): boolean {
  const s = _get(id, now)
  return s != null && s.obs >= SESSION_OBS_CEIL
}

/** Current call count for a session (0 if not started or expired). */
export function sessionCallCount(id: string, now = Date.now()): number {
  return _get(id, now)?.calls ?? 0
}

/** Current observation count for a session (0 if not started or expired). */
export function sessionObsCount(id: string, now = Date.now()): number {
  return _get(id, now)?.obs ?? 0
}

/** The observation texts seen in this session (for near-dup matching in runSimReviews). */
export function sessionSeenTexts(id: string, now = Date.now()): string[] {
  return _get(id, now)?.texts ?? []
}

/** Record one LLM call for the session. Call AFTER the LLM call succeeds. */
export function sessionBumpCall(id: string, now = Date.now()): void {
  _touch(id, now).calls++
}

/**
 * Record new observations for the session: increments the obs counter and appends
 * the texts so future calls can near-dup against them.
 */
export function sessionBumpObs(id: string, texts: string[], now = Date.now()): void {
  const s = _touch(id, now)
  s.obs += texts.length
  s.texts.push(...texts)
  // Bound the text list so memory doesn't grow forever.
  if (s.texts.length > SESSION_OBS_CEIL * 2) s.texts = s.texts.slice(-SESSION_OBS_CEIL)
}
