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
  const description = String(o.checkpoint.description ?? "").slice(0, 240)
  if (!description.trim()) return null
  // Kind-specific field checks.
  if (kind === "textEquals" || kind === "textContains") {
    if (typeof o.checkpoint.value !== "string" || !o.checkpoint.value) return null
  } else if (kind === "urlMatches") {
    if (typeof o.checkpoint.regex !== "string" || !o.checkpoint.regex) return null
  } else if (kind === "elementCount") {
    if (typeof o.checkpoint.count !== "number" || !Number.isInteger(o.checkpoint.count) || o.checkpoint.count < 0) return null
  }
  const cp: AssertionDraft["checkpoint"] = { kind, description }
  if ((cp.kind === "textEquals" || cp.kind === "textContains") && typeof o.checkpoint.value === "string") cp.value = o.checkpoint.value.slice(0, 240)
  if (cp.kind === "urlMatches" && typeof o.checkpoint.regex === "string") { cp.regex = o.checkpoint.regex; try { new RegExp(cp.regex) } catch { return null } }
  if (cp.kind === "elementCount" && typeof o.checkpoint.count === "number") cp.count = Math.floor(o.checkpoint.count)
  return { trailId: o.trailId, afterStepIdx: o.afterStepIdx, action: "assert", target, checkpoint: cp }
}
