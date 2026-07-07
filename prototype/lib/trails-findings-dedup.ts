// KLA-77: project-scoped content signature for cross-trail finding dedup.
// Stable hash from kind + normalized page URL + normalized fingerprint identity so the same
// broken element surfaced from two different Trails collapses to ONE finding with a recurrence
// bump rather than a duplicate row (and a duplicate ticket).
import { createHash } from "node:crypto"
import { normalizeUrlPath } from "./dedup"

/** Normalize a fingerprint to its most stable canonical identifier string.
 *  Priority: testId (explicit) > role+accessibleName (semantic) > text (fallback). */
function normalizeFingerprint(fp?: {
  role?: string | null
  accessibleName?: string | null
  testId?: string | null
  text?: string | null
} | null): string | null {
  if (!fp) return null
  if (fp.testId?.trim()) return `testid:${fp.testId.trim().toLowerCase()}`
  const role = (fp.role ?? "").toLowerCase().trim()
  const name = (fp.accessibleName ?? "").toLowerCase().trim()
  if (role || name) return `${role}/${name}`
  const text = (fp.text ?? "").trim().slice(0, 60)
  if (text) return `text:${text.toLowerCase()}`
  return null
}

/**
 * Compute a project-scoped content signature for a finding.
 * Returns null when there is not enough identity info to form a stable key
 * (the caller falls back to per-step dedupKey only).
 *
 * Two findings with the same (projectId, contentSig) in a project represent the same
 * underlying bug: the same element broken on the same page, regardless of which Trail
 * surfaced it or which step index it corresponds to.
 */
export function contentSigFor(parts: {
  kind: string
  urlPath?: string | null
  fp?: {
    role?: string | null
    accessibleName?: string | null
    testId?: string | null
    text?: string | null
  } | null
  /** Direct selector fallback when no full Fingerprint is available (e.g. ambiguous_selector) */
  selector?: string | null
}): string | null {
  const fpId = normalizeFingerprint(parts.fp)
  const selId = parts.selector?.trim().toLowerCase().slice(0, 120) || null
  const id = fpId ?? selId
  if (!id) return null

  const key = [
    parts.kind,
    normalizeUrlPath(parts.urlPath ?? ""),
    id,
  ].join("::")

  return createHash("sha256").update(key).digest("hex").slice(0, 32)
}
