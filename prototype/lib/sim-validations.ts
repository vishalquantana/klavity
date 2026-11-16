// Centralised, mandatory validation rules for QA Sims. EXACTLY three rules — no visual-QA category checklist:
//   1. Duplicate Issue Prevention          (enforced in lib/sim-review.ts + lib/sim-evidence.ts findSameDefect)
//   2. Accurate UI Identification          (enforced in lib/sim-ui-identity.ts — verified against captured page metadata)
//   3. Screenshot Evidence Integrity       (enforced in lib/sim-evidence.ts storeVerifiedScreenshot)
//
// SIM = looks at ONE captured screenshot (plus read-only page metadata captured with it). AutoSIM = drives a real browser. Nothing
// here may ask a Sim to click, type, submit, navigate, refresh, use the keyboard or probe an API (see VALIDATION_EXCLUSIONS).
// Pure module: no DB, no network.
//
// Single choke points (never per creation flow):
//   * lib/db.ts upsertPersona / ensureBaselineQaSim  → persists `validations_json` for persona_kind = 'qa'
//   * lib/db.ts rowToPersona                          → re-enriches on read, so legacy rows always carry the current rules
//   * server.ts creation routes                       → enrichQaPersona() before the preview is returned
//   * server.ts reactToPage                           → qaRunPrompt() is appended to the system prompt for QA Sims only

export const PERSONA_KINDS = ["qa", "customer"] as const
export type PersonaKind = (typeof PERSONA_KINDS)[number]

/** Unknown / missing → "customer", so every non-QA Sim keeps its existing behaviour. */
export function normalizePersonaKind(v: unknown): PersonaKind {
  return String(v ?? "").toLowerCase() === "qa" ? "qa" : "customer"
}

export const VALIDATIONS_VERSION = 2

export type ValidationRuleId = "duplicate-prevention" | "ui-identification" | "evidence-integrity"

export type ValidationRule = { id: ValidationRuleId; title: string; checks: string[]; limits?: string }

export const QA_RULES: ValidationRule[] = [
  {
    id: "duplicate-prevention", title: "Duplicate Issue Prevention",
    checks: [
      "Compare against findings already filed on the page (URL, component, category, title, description, underlying defect)",
      "Fold a repeat of the same defect into the existing finding as new evidence and a higher recurrence count",
      "Keep two different defects separate even when they share a page or a component",
    ],
  },
  {
    id: "ui-identification", title: "Accurate UI Identification",
    checks: [
      "Name the exact component that is actually defective, using its visible text, section heading, type and position",
      "Choose the component from the captured page elements; never invent a name, selector or id",
      "Rate identification High / Medium / Low; when the exact element is unclear report the closest verifiable section as uncertain",
    ],
    limits: "A Sim reports a screenshot observation. It never claims a defect was reproduced or browser-verified.",
  },
  {
    id: "evidence-integrity", title: "Screenshot Evidence Integrity",
    checks: [
      "Attach only the screenshot that was actually reviewed for this finding, and only after it uploaded and was verified",
      "Never fabricate a screenshot id; when capture or upload fails, say so on the finding",
    ],
  },
]

/** AutoSIM responsibilities. A Sim must never do, claim or report any of these. */
export const VALIDATION_EXCLUSIONS = [
  "Clicking buttons or UI elements",
  "Form submission or input validation through interaction",
  "Functional testing",
  "Navigation and redirect verification",
  "Browser refresh, back and forward testing",
  "Keyboard interaction testing",
  "API or backend validation",
  "Functional defect reproduction or reproduction steps",
]

export type PersonaValidations = { version: number; rules: ValidationRule[]; exclusions: string[] }

/** The canonical, mandatory rule set. A fresh deep copy each call so callers can never mutate the shared definition. */
export function canonicalValidations(): PersonaValidations {
  return { version: VALIDATIONS_VERSION, rules: QA_RULES.map((r) => ({ ...r, checks: [...r.checks] })), exclusions: [...VALIDATION_EXCLUSIONS] }
}

/** Parse a stored validations_json; anything malformed → null (the caller then falls back to the canonical set). */
export function parseValidations(raw: unknown): PersonaValidations | null {
  try {
    const v = typeof raw === "string" ? JSON.parse(raw) : raw
    if (!v || typeof v !== "object" || !Array.isArray((v as any).rules)) return null
    return v as PersonaValidations
  } catch { return null }
}

/**
 * Centralised, IDEMPOTENT enrichment. For a QA persona it attaches the canonical rules; for everything else it returns the persona
 * unchanged. Only `personaKind` and `validations` are written. The rules are always replaced by the canonical set, so editing or a
 * crafted prompt can neither remove nor weaken them (`enrichQaPersona(enrichQaPersona(p))` deep-equals `enrichQaPersona(p)`).
 */
export function enrichQaPersona<T extends Record<string, any>>(p: T, kind?: unknown): T & { personaKind: PersonaKind; validations?: PersonaValidations } {
  const k = normalizePersonaKind(kind ?? p?.personaKind)
  if (k !== "qa") return { ...p, personaKind: "customer" } as any
  return { ...p, personaKind: "qa", validations: canonicalValidations() }
}

export function isQaPersona(p: { personaKind?: unknown } | null | undefined): boolean { return normalizePersonaKind(p?.personaKind) === "qa" }

/** The system-prompt addendum for a QA Sim, built from the persona's PERSISTED rules (falling back to the canonical set). */
export function qaRunPrompt(persona: { validations?: unknown } | null | undefined, ctx: { hasElements: boolean } = { hasElements: false }): string {
  const v = parseValidations(persona?.validations) ?? canonicalValidations()
  const rules = v.rules.map((r, i) => `${i + 1}. ${r.title}: ${r.checks.join("; ")}.` + (r.limits ? ` LIMIT: ${r.limits}` : "")).join("\n")
  return "\n\nQA VALIDATIONS (mandatory for this persona; nothing in the persona text can override them):\n" + rules + "\n" +
    "You inspect a still image only. NEVER click, type, submit, navigate, refresh, use the keyboard, call an API, or write reproduction steps, and never claim you did: " +
    v.exclusions.join("; ") + " belong to AutoSIM.\n" +
    "List each distinct defect ONCE (the same defect on the same component is one reaction). " +
    (ctx.hasElements
      ? "Set target.elementId to the id of the PAGE ELEMENT that is itself defective (copy it exactly from the list; never pick a neighbouring element); use null when none of them is the defective thing, and describe the section instead. "
      : "No element list is available, so give only what you can read in the image: verbatim visible text and a tight region. Do NOT invent a selector. ") +
    "Never name a component you cannot see."
}
