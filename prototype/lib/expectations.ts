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

export function nextStatus(current: ExpStatus, c: Corroboration, n: number = RECURRENCE_VALIDATE_N): ExpStatus {
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
