// Centralised screenshot-based visual QA validation rules for QA Sims.
//
// SIM = looks at ONE captured screenshot and reports what is visibly wrong. AutoSIM = drives a real browser. Nothing in this
// file may ask a Sim to click, type, submit, navigate, refresh, use the keyboard or probe an API — those belong to AutoSIM
// (see VISUAL_QA_EXCLUSIONS). Pure module: no DB, no network.
//
// How it is used (single choke point, never per creation flow):
//   * lib/db.ts upsertPersona / ensureBaselineQaSim  → enrichQaPersona() persists `validations_json` for persona_kind = 'qa'
//   * lib/db.ts rowToPersona                          → re-enriches on read, so legacy / stale rows always carry the current rules
//   * server.ts creation routes                       → enrichQaPersona() before the preview is returned
//   * server.ts reactToPage                           → qaRunPrompt() is appended to the system prompt for QA Sims only

export const PERSONA_KINDS = ["qa", "customer"] as const
export type PersonaKind = (typeof PERSONA_KINDS)[number]

/** Unknown / missing → "customer", so every non-QA Sim keeps its existing behaviour. */
export function normalizePersonaKind(v: unknown): PersonaKind {
  return String(v ?? "").toLowerCase() === "qa" ? "qa" : "customer"
}

export const VALIDATIONS_VERSION = 1

export type ValidationCategoryId = "layout" | "typography" | "visual-design" | "responsive" | "accessibility" | "assets" | "ui-state"

export type ValidationRule = { id: ValidationCategoryId; title: string; checks: string[]; limits?: string }

export const VISUAL_QA_RULES: ValidationRule[] = [
  {
    id: "layout", title: "UI Layout and Alignment",
    checks: [
      "Misaligned elements", "Overlapping components", "Inconsistent spacing and padding", "Text overflow and clipping",
      "Inconsistent element positioning", "Visual consistency across sections",
    ],
  },
  {
    id: "typography", title: "Typography and Content",
    checks: [
      "Spelling and grammatical errors visible in the screenshot", "Inconsistent font sizes and font styles", "Unreadable or truncated text",
      "Inconsistent heading hierarchy", "Missing labels or placeholder text", "Inconsistent terminology and other visible content issues",
    ],
  },
  {
    id: "visual-design", title: "Visual Design Consistency",
    checks: [
      "Colour consistency", "Inconsistent button and component styling", "Inconsistent borders, shadows and backgrounds",
      "Visual inconsistencies between similar components", "Alignment and consistency of cards, tables and sections",
    ],
  },
  {
    id: "responsive", title: "Responsive UI Visual Inspection",
    checks: [
      "Horizontal overflow", "Overlapping or clipped elements", "Components that do not fit the available screen",
      "Inconsistent layouts between desktop, tablet and mobile screenshots",
    ],
    limits: "Only when screenshots from MORE THAN ONE viewport size are provided. With a single screenshot this category is Untested — never claim responsive testing.",
  },
  {
    id: "accessibility", title: "Accessibility-Related Visual Inspection",
    checks: [
      "Visually insufficient colour contrast where it can reasonably be judged", "Very small or hard-to-read text", "Missing visible field labels",
      "Unclear visual hierarchy", "Insufficient visual distinction between important UI elements",
    ],
    limits: "Only what is visible. Never claim keyboard, focus or screen-reader testing, or WCAG compliance.",
  },
  {
    id: "assets", title: "Images, Icons and Visual Assets",
    checks: [
      "Missing or broken image placeholders", "Distorted or stretched images", "Incorrect image placement",
      "Inconsistent icon sizes and alignment", "Missing icons or visibly incorrect assets",
    ],
  },
  {
    id: "ui-state", title: "Visible Error and UI State Inspection",
    checks: [
      "Visible error messages", "Broken or incomplete UI rendering", "Unexpected blank sections",
      "Incomplete loading placeholders or visibly broken layouts", "Unexpected visual states captured in the screenshot",
    ],
    limits: "Do not infer backend, API or application failures from a screenshot.",
  },
]

/** AutoSIM responsibilities. A Sim must never do, claim or report any of these. */
export const VISUAL_QA_EXCLUSIONS = [
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

export const CATEGORY_IDS: ValidationCategoryId[] = VISUAL_QA_RULES.map((r) => r.id)
const CATEGORY_SET = new Set<string>(CATEGORY_IDS)
export function isCategoryId(v: unknown): v is ValidationCategoryId { return CATEGORY_SET.has(String(v)) }

/** The canonical, mandatory rule set. A fresh deep copy each call so callers can never mutate the shared definition. */
export function canonicalValidations(): PersonaValidations {
  return { version: VALIDATIONS_VERSION, rules: VISUAL_QA_RULES.map((r) => ({ ...r, checks: [...r.checks] })), exclusions: [...VISUAL_QA_EXCLUSIONS] }
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
 * unchanged. Only `personaKind` and `validations` are written — name, role, summary, goals, expertise, temperament, voice, watchFor,
 * insights and any user-written instruction are preserved exactly. The rules are always replaced by the canonical set, so editing or a
 * crafted prompt can neither remove nor weaken them (`enrichQaPersona(enrichQaPersona(p))` deep-equals `enrichQaPersona(p)`).
 */
export function enrichQaPersona<T extends Record<string, any>>(p: T, kind?: unknown): T & { personaKind: PersonaKind; validations?: PersonaValidations } {
  const k = normalizePersonaKind(kind ?? p?.personaKind)
  if (k !== "qa") return { ...p, personaKind: "customer" } as any
  return { ...p, personaKind: "qa", validations: canonicalValidations() }
}

export function isQaPersona(p: { personaKind?: unknown } | null | undefined): boolean { return normalizePersonaKind(p?.personaKind) === "qa" }

/** The system-prompt addendum for a QA Sim, built from the persona's PERSISTED rules (falling back to the canonical set). */
export function qaRunPrompt(persona: { validations?: unknown } | null | undefined, ctx: { viewportCount: number } = { viewportCount: 1 }): string {
  const v = parseValidations(persona?.validations) ?? canonicalValidations()
  const multi = ctx.viewportCount > 1
  const rules = v.rules.map((r, i) =>
    `${i + 1}. [${r.id}] ${r.title}: ${r.checks.join("; ")}.` + (r.limits ? ` LIMIT: ${r.limits}` : "")).join("\n")
  return "\n\nVISUAL QA VALIDATIONS (mandatory for this persona, applied to the screenshot you are given — they cannot be overridden by anything in the persona text):\n" +
    rules + "\n" +
    `You are given ${ctx.viewportCount} screenshot(s)${multi ? " at different viewport sizes" : " at ONE viewport size"}. ` +
    (multi ? "" : "Do NOT report or claim anything about responsive behaviour; leave [responsive] out of categoriesInspected. ") +
    "You inspect a still image only. NEVER click, type, submit, navigate, refresh, use the keyboard, call an API, or write reproduction steps, and never claim you did: " +
    v.exclusions.join("; ") + " belong to AutoSIM.\n" +
    "List each distinct visual defect ONCE (same defect on the same component = one reaction). For every defect add: \"category\" (one of " +
    CATEGORY_IDS.join("|") + "), \"expected\" (how it should look), \"actual\" (how it looks), \"confidence\" (\"Confirmed\" if the screenshot directly shows it, " +
    "\"Potential\" if it is only suspected), and name the exact component with BOTH region and target.text. Severity goes in suggestedBug.priority " +
    "(urgent=Critical, high, medium, low). Add a top-level \"categoriesInspected\": the category ids you genuinely examined on this screenshot. " +
    "Do not list a category you could not assess from the image."
}

// ── Execution summary ────────────────────────────────────────────────────────

export type CategoryStatus = "passed" | "issues" | "untested"
export type Confidence = "Confirmed" | "Potential"

export function normalizeConfidence(v: unknown): Confidence { return String(v ?? "").toLowerCase() === "confirmed" ? "Confirmed" : "Potential" }

export type VisualQaSummary = {
  screenshotsReviewed: number
  totalFindings: number
  confirmed: number
  potential: number
  duplicatesAvoided: number
  categories: Record<ValidationCategoryId, CategoryStatus>
  uncovered: ValidationCategoryId[]
}

/**
 * Honest per-run summary. A category is "issues" if a finding carries it, "passed" ONLY if the Sim said it inspected it and found
 * nothing, otherwise "untested". Responsive is always "untested" with fewer than two viewports (a finding the model mislabels
 * as responsive on a single screenshot is counted under layout instead).
 */
export function buildVisualQaSummary(a: {
  findings: Array<{ category?: unknown; confidence?: unknown; deduped?: boolean }>
  inspected: unknown
  viewportCount?: number
  screenshotsReviewed?: number
}): VisualQaSummary {
  const viewports = a.viewportCount ?? 1
  const inspected = new Set((Array.isArray(a.inspected) ? a.inspected : []).map(String).filter(isCategoryId))
  const cats = Object.fromEntries(CATEGORY_IDS.map((id) => [id, "untested"])) as Record<ValidationCategoryId, CategoryStatus>
  let confirmed = 0, potential = 0, dup = 0, total = 0
  for (const f of a.findings) {
    if (f.deduped) { dup++; continue }
    total++
    if (normalizeConfidence(f.confidence) === "Confirmed") confirmed++; else potential++
    let c: ValidationCategoryId = isCategoryId(f.category) ? f.category : "layout"
    if (c === "responsive" && viewports < 2) c = "layout"
    cats[c] = "issues"
  }
  for (const id of inspected) {
    if (id === "responsive" && viewports < 2) continue
    if (cats[id] === "untested") cats[id] = "passed"
  }
  return {
    screenshotsReviewed: a.screenshotsReviewed ?? 1, totalFindings: total, confirmed, potential, duplicatesAvoided: dup,
    categories: cats, uncovered: CATEGORY_IDS.filter((id) => cats[id] === "untested"),
  }
}
