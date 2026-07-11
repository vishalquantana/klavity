export type CheckpointKind = "visible" | "textEquals" | "textContains" | "urlMatches" | "elementCount"

export type AssertionDraft = {
  trailId: string; afterStepIdx: number; action: "assert"
  target: { role?: string; name?: string; text?: string; selector?: string }
  checkpoint: { kind: CheckpointKind; description: string; value?: string; regex?: string; count?: number }
}

const VALID_KINDS: readonly CheckpointKind[] = ["visible", "textEquals", "textContains", "urlMatches", "elementCount"] as const

export function validateAssertionDraft(x: unknown): AssertionDraft | null {
  if (!x || typeof x !== "object") return null
  const o = x as any
  if (typeof o.trailId !== "string" || !o.trailId) return null
  if (typeof o.afterStepIdx !== "number" || !Number.isFinite(o.afterStepIdx) || o.afterStepIdx < 0) return null
  if (o.action !== "assert") return null
  const t = o.target
  if (!o.checkpoint || typeof o.checkpoint !== "object") return null
  const kind = o.checkpoint.kind
  if (!(kind in Object.fromEntries(VALID_KINDS.map((k) => [k, true])))) return null
  // urlMatches asserts against page.url() — target is optional for this kind (no element needed).
  let target: AssertionDraft["target"] = {}
  if (kind !== "urlMatches") {
    if (!t || typeof t !== "object") return null
    for (const k of ["role", "name", "text", "selector"] as const) if (typeof t[k] === "string" && t[k]) target[k] = t[k]
    if (Object.keys(target).length === 0) return null
  } else {
    // urlMatches with a provided target: accept it, but do not require one.
    if (!t || typeof t !== "object") return null
    for (const k of ["role", "name", "text", "selector"] as const) if (typeof t[k] === "string" && t[k]) target[k] = t[k]
  }
  // Description presence + kind-specific payload validation live in normalizeCheckpointInput,
  // shared with the draft step-edit route so all 5 kinds round-trip identically.
  const cp = normalizeCheckpointInput(o.checkpoint)
  if (!cp) return null
  return { trailId: o.trailId, afterStepIdx: o.afterStepIdx, action: "assert", target, checkpoint: cp }
}

/**
 * Validate + normalize a raw checkpoint object into a persisted Checkpoint carrying its full
 * kind-specific payload. Shared by validateAssertionDraft (expectation graduation) and the
 * draft step-edit route (KLA-244) so all 5 kinds round-trip through the DB, not just "visible".
 * Returns null when the checkpoint is malformed. A checkpoint with no kind defaults to "visible".
 */
export function normalizeCheckpointInput(x: unknown): AssertionDraft["checkpoint"] | null {
  if (!x || typeof x !== "object") return null
  const o = x as any
  const kind: CheckpointKind = o.kind == null ? "visible" : o.kind
  if (!VALID_KINDS.includes(kind)) return null
  const description = String(o.description ?? "").slice(0, 240)
  if (!description.trim()) return null
  if (kind === "textEquals" || kind === "textContains") {
    if (typeof o.value !== "string" || !o.value) return null
  } else if (kind === "urlMatches") {
    if (typeof o.regex !== "string" || !o.regex) return null
  } else if (kind === "elementCount") {
    if (typeof o.count !== "number" || !Number.isInteger(o.count) || o.count < 0) return null
  }
  const cp: AssertionDraft["checkpoint"] = { kind, description }
  if ((kind === "textEquals" || kind === "textContains") && typeof o.value === "string") cp.value = o.value.slice(0, 240)
  if (kind === "urlMatches" && typeof o.regex === "string") { cp.regex = o.regex; try { new RegExp(cp.regex) } catch { return null } }
  if (kind === "elementCount" && typeof o.count === "number") cp.count = Math.floor(o.count)
  return cp
}
