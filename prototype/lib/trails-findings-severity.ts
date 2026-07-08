// KLA-81: computed severity model for Trail findings.
// Pure function — no I/O, unit-testable without DB or server.
//
// Severity is computed from THREE signals:
//   1. kind     — base severity (regression=high, amber_heal=medium, visual=low)
//   2. recurrence — ≥3 occurrences means the bug is systematic → bump up one level
//   3. confidence — strong signal (≥0.9) → bump up; weak signal (<0.5) → bump down
//
// Level ordering: low < medium < high < urgent
// Caps: cannot go below "low" or above "urgent".
//
// Back-compat: callers that don't store severity yet can still call severityForKind()
// (still exported from trails-findings-gate.ts) for ticket-time derivation.
import type { FindingKind } from "./trails-types"

export type FindingSeverity = "urgent" | "high" | "medium" | "low"

const LEVELS: FindingSeverity[] = ["low", "medium", "high", "urgent"]
const LEVEL_IDX: Record<FindingSeverity, number> = { low: 0, medium: 1, high: 2, urgent: 3 }

function clamp(idx: number): FindingSeverity {
  return LEVELS[Math.max(0, Math.min(LEVELS.length - 1, idx))]
}

/** Base severity by finding kind — the floor before signal adjustments. */
const BASE_SEVERITY: Record<FindingKind, FindingSeverity> = {
  regression: "high",   // a real test-step breakage
  amber_heal: "medium", // healed but suspect — needs review
  visual:     "low",    // cosmetic / non-blocking
}

/**
 * Compute a finding's severity score from kind + confidence + recurrence.
 *
 * Upgrade paths (applied independently; both can fire):
 *   recurrence ≥ 3  → +1 level  (systematic, not transient)
 *   confidence ≥ 0.9 → +1 level  (high-certainty signal)
 *
 * Downgrade path:
 *   confidence < 0.5 → −1 level  (low-certainty / speculative)
 */
export function computeFindingSeverity(input: {
  kind: FindingKind
  confidence: number
  recurrence: number
}): FindingSeverity {
  let idx = LEVEL_IDX[BASE_SEVERITY[input.kind]]

  if (input.recurrence >= 3) idx += 1
  if (input.confidence >= 0.9) idx += 1
  else if (input.confidence < 0.5) idx -= 1

  return clamp(idx)
}
