// prototype/lib/expectations.ts
// Pure (DB-free) corroboration + lifecycle for the expectations spine.
import { lexicalSim } from "./dedup"

// KLA-95: "autosim" = an AutoSim trail walk finding; counts as "sim" for corroboration purposes
// so cross-source validation (snap+sim) works when a Snap report matches an AutoSim finding.
// "finding" is kept for backward-compatibility with existing rows written before this fix.
export type SourceKind = "snap" | "sim" | "autosim" | "finding"
export type SourceRef = { kind: SourceKind; id: string }
export type Corroboration = { snap: boolean; sim: boolean; recurrence: number }
export type ExpStatus = "candidate" | "validated" | "enforced" | "retired"

export const RECURRENCE_VALIDATE_N = 3

export function mergeSource(c: Corroboration, kind: SourceKind): Corroboration {
  return {
    snap: c.snap || kind === "snap",
    sim: c.sim || kind === "sim" || kind === "autosim",
    recurrence: (c.recurrence ?? 0) + 1,
  }
}

export function shouldValidate(c: Corroboration, n: number = RECURRENCE_VALIDATE_N): boolean {
  return (c.snap && c.sim) || c.recurrence >= n
}

// ── B.10 (KLA-250): progress-to-Confirmed hint for a "Seen once" card. ──
// The auto-validate rule (shouldValidate) is otherwise invisible, so a Seen-once card gives no
// hint what it's waiting for. This surfaces the SHORTEST remaining path to Confirmed, in plain
// language, derived from the SAME inputs as shouldValidate — never contradicting it.
export type ValidationProgress = {
  /** true once shouldValidate(c) holds — the card would already be Confirmed, no hint needed. */
  ready: boolean
  /** plain-language remaining path, e.g. "needs a second source (a human report or a Sim)". */
  hint: string
}

export function validationProgress(c: Corroboration, n: number = RECURRENCE_VALIDATE_N): ValidationProgress {
  const corr: Corroboration = { snap: !!c?.snap, sim: !!c?.sim, recurrence: Math.max(0, Number(c?.recurrence ?? 0)) }
  if (shouldValidate(corr, n)) return { ready: true, hint: "Ready to confirm." }
  // Path A — cross-source: one of {human report, Sim} present, needs the other.
  const haveOneSource = corr.snap !== corr.sim // exactly one of snap/sim
  // Path B — recurrence: how many more sightings until it recurs enough on its own.
  const moreSightings = Math.max(1, n - corr.recurrence)
  // Prefer the cross-source hint when we're one source away (the faster, clearer path); otherwise
  // fall back to the recurrence count. When nothing has landed yet, name both routes.
  if (haveOneSource) {
    const missing = corr.snap ? "a Sim" : "a human report"
    return { ready: false, hint: `needs a second source (${missing}) — or ${moreSightings} more sighting${moreSightings === 1 ? "" : "s"}` }
  }
  if (corr.snap && corr.sim) {
    // Both sources already present but shouldValidate false only if n>2 edge — keep consistent.
    return { ready: false, hint: `needs ${moreSightings} more sighting${moreSightings === 1 ? "" : "s"}` }
  }
  // No source signal captured yet.
  return { ready: false, hint: `needs a second source (a human report and a Sim) — or ${moreSightings} more sighting${moreSightings === 1 ? "" : "s"}` }
}

export function nextStatus(current: ExpStatus, c: Corroboration, n: number = RECURRENCE_VALIDATE_N): ExpStatus {
  // B.9 (KLA-249): a RETIRED row is not a roach motel. When a fresh signal arrives (upsert bumps
  // corroboration on a retired match), the issue has resurfaced after being cleared — resurrect it
  // to "candidate" so it re-enters the pipeline and re-appears on the board, rather than silently
  // absorbing corroboration forever in "retired". It must earn its way back up (candidate→validated)
  // on the usual cross-source / recurrence rules; we never jump a resurrected row straight past
  // candidate here.
  if (current === "retired") return "candidate"
  if (current === "candidate" && shouldValidate(c, n)) return "validated"
  return current
}

export function matchExpectation(
  cand: { title: string },
  existing: Array<{ id: string; title: string }>,
  threshold = 0.82,
): string | null {
  let best: { id: string | null; score: number } = { id: null, score: 0 }
  for (const e of existing) {
    const score = lexicalSim(cand.title, e.title)
    if (score > best.score) best = { id: e.id, score }
  }
  return best.score >= threshold ? best.id : null
}

// ── B.5 (KLA-245): Trail picker + zero-Trail fallback for the Enforce flow. ──
// Pure (DB-free) helpers so the enforce route (and the shared "Guard this fix" picker) can
// default the target Trail by urlPath match against each Trail's recorded steps — never a
// silent "first Trail" guess — and so the awaiting-Trail resume logic is unit-testable.

/** Minimal Trail shape the picker needs: its id, its baseUrl, and the URLs its steps navigate to. */
export type TrailForPick = { id: string; baseUrl?: string | null; stepUrls: Array<string | null | undefined> }

/** Extract the path component (no query/hash) from a full or relative URL. Returns "" on garbage. */
export function urlPathOf(raw: string | null | undefined): string {
  if (!raw) return ""
  const s = String(raw).trim()
  if (!s) return ""
  if (s.startsWith("/")) {
    // Already a path (possibly with query/hash).
    return s.split(/[?#]/)[0]
  }
  try {
    return new URL(s).pathname
  } catch {
    // Not a parseable absolute URL — strip scheme+host heuristically, then query/hash.
    const noScheme = s.replace(/^[a-z]+:\/\//i, "")
    const slash = noScheme.indexOf("/")
    const path = slash >= 0 ? noScheme.slice(slash) : "/"
    return path.split(/[?#]/)[0]
  }
}

/**
 * Score how well a Trail's recorded steps cover an expectation's urlPath.
 * Higher is better; 0 means no path signal at all. Exact path match on any step (or the baseUrl)
 * beats a prefix/containment match, which beats a bare same-first-segment match.
 */
export function trailUrlPathScore(expUrlPath: string | null | undefined, trail: TrailForPick): number {
  const want = urlPathOf(expUrlPath)
  if (!want || want === "/") return 0
  const candidates = [urlPathOf(trail.baseUrl), ...trail.stepUrls.map(urlPathOf)].filter(Boolean)
  let best = 0
  const wantSeg = want.split("/").filter(Boolean)[0] || ""
  for (const p of candidates) {
    if (p === want) { best = Math.max(best, 100); continue }
    // one contains the other (e.g. "/checkout" vs "/checkout/confirm")
    if (p.startsWith(want + "/") || want.startsWith(p + "/")) { best = Math.max(best, 60); continue }
    const pSeg = p.split("/").filter(Boolean)[0] || ""
    if (wantSeg && pSeg && wantSeg === pSeg) best = Math.max(best, 30)
  }
  return best
}

/**
 * Pick the Trail whose recorded steps best match the expectation's urlPath.
 * Returns null when there are no trails. When NO trail has any path signal (all score 0) we fall
 * back to the FIRST trail in the given order (callers pass trails newest-first) — but that is an
 * explicit, surfaced default, not the silent server-side first-Trail guess this ticket removes.
 * `bestScore` lets callers tell a real urlPath match apart from the no-signal fallback.
 */
export function pickDefaultTrail(
  expUrlPath: string | null | undefined,
  trails: TrailForPick[],
): { trailId: string | null; bestScore: number } {
  if (!trails.length) return { trailId: null, bestScore: 0 }
  let bestId = trails[0].id
  let bestScore = 0
  for (const t of trails) {
    const s = trailUrlPathScore(expUrlPath, t)
    if (s > bestScore) { bestScore = s; bestId = t.id }
  }
  return { trailId: bestId, bestScore }
}

// KLA-251 (B.11): the near-miss BAND. A declined pair whose lexical score lands in
// [NEAR_MISS_MIN, threshold) is a candidate the 0.82 thread rejected but which may be a
// true cross-source match ("Target gone: Submit button" vs "can't submit the form"). We log
// these to measure how often the threshold under-matches before building the embeddings pass.
// The lower edge filters out pure noise (unrelated titles score near 0).
export const NEAR_MISS_MIN = 0.55

export type NearMiss = { existingId: string; existingTitle: string; score: number }

/**
 * Same accept semantics as matchExpectation (≥ threshold → matched id, else null), but ALSO
 * returns every declined pair scoring in [nearMissMin, threshold) so callers can persist them.
 *
 * Purity/regression guard: the returned `matchId` is IDENTICAL to matchExpectation(...) for the
 * same inputs — instrumentation never changes which id is accepted. When a match is found
 * (best.score ≥ threshold) the accepted pair is excluded from `nearMisses`, so an accepted
 * expectation is never also logged as a "declined" near-miss.
 */
export function matchExpectationWithNearMisses(
  cand: { title: string },
  existing: Array<{ id: string; title: string }>,
  threshold = 0.82,
  nearMissMin = NEAR_MISS_MIN,
): { matchId: string | null; nearMisses: NearMiss[] } {
  let best: { id: string | null; score: number } = { id: null, score: 0 }
  const nearMisses: NearMiss[] = []
  for (const e of existing) {
    const score = lexicalSim(cand.title, e.title)
    if (score > best.score) best = { id: e.id, score }
    if (score >= nearMissMin && score < threshold) {
      nearMisses.push({ existingId: e.id, existingTitle: e.title, score })
    }
  }
  const matchId = best.score >= threshold ? best.id : null
  return { matchId, nearMisses: matchId ? nearMisses.filter((n) => n.existingId !== matchId) : nearMisses }
}
