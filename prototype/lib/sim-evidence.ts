// lib/sim-evidence.ts
// Phase-1 QA Sim standards: evidence integrity, UI traceability and same-defect matching, shared by every Sim review path
// (live review, URL preview, scheduled review). Reuses the existing screenshot ledger, feedback_occurrences evidence history and
// feedback.client_context_json — no new browser engine and no new tables.
//
// HONESTY RULES enforced here (they used to live only in the persona prompt):
//   * A screenshot id is only ever handed to a finding when the upload was verified AND the ledger row was written. On any failure the
//     id is null and the failure is recorded explicitly — never a made-up "no-s3-…" placeholder.
//   * A Sim review is a SCREENSHOT observation. basis is always "screenshot" and browserVerified is always false; only a real
//     browser-driven reproduction (Phase 2) may ever set those differently.
import { lexicalSim } from "./dedup"
import type { ObsTarget } from "./sim-review-pure"

// ── Evidence integrity ────────────────────────────────────────────────────────

export type EvidenceRecord = {
  /** captured = uploaded, verified present, ledger row written. failed = something went wrong (see error). */
  screenshot: "captured" | "failed"
  error?: string
  checkedAt: number
}

export type StoredScreenshot = { screenshotId: string | null; evidence: EvidenceRecord }

export interface ScreenshotStoreDeps {
  upload: (bytes: Uint8Array, contentType: string) => Promise<{ key: string; bucket: string; contentType: string }>
  /** Confirms the uploaded object is really there. */
  exists: (key: string) => Promise<boolean>
  insert: (row: { s3Key: string; bucket: string; contentType: string; bytes: number }) => Promise<string>
}

/**
 * Upload a screenshot, verify the object exists, then write the ledger row. Returns the id ONLY when every step succeeded; otherwise
 * `screenshotId: null` plus an explicit failure record. Never throws and never fabricates an id.
 */
export async function storeVerifiedScreenshot(deps: ScreenshotStoreDeps, bytes: Uint8Array, contentType: string, now: () => number = Date.now): Promise<StoredScreenshot> {
  let stage = "upload"
  try {
    if (!bytes || bytes.byteLength === 0) throw new Error("empty screenshot")
    const up = await deps.upload(bytes, contentType)
    stage = "verify"
    if (!(await deps.exists(up.key))) throw new Error("uploaded object not found after upload")
    stage = "record"
    const id = await deps.insert({ s3Key: up.key, bucket: up.bucket, contentType: up.contentType, bytes: bytes.byteLength })
    if (!id) throw new Error("no screenshot id returned")
    return { screenshotId: id, evidence: { screenshot: "captured", checkedAt: now() } }
  } catch (e: any) {
    return { screenshotId: null, evidence: { screenshot: "failed", error: `${stage}: ${String(e?.message || e).slice(0, 200)}`, checkedAt: now() } }
  }
}

/** Evidence record for a caller that supplied a screenshot id itself (tests / legacy callers). */
export function evidenceForId(screenshotId: string | null | undefined, now: () => number = Date.now): EvidenceRecord {
  return screenshotId
    ? { screenshot: "captured", checkedAt: now() }
    : { screenshot: "failed", error: "no screenshot was stored for this review", checkedAt: now() }
}

// ── UI identification / traceability ──────────────────────────────────────────

export type ComponentKind = "button" | "form" | "input" | "navigation" | "modal" | "table" | "link" | "image" | "heading" | "text" | "other"

export function componentKind(t: ObsTarget | null | undefined): ComponentKind | null {
  if (!t) return null
  const hay = `${t.role || ""} ${t.selector || ""} ${t.name || ""}`.toLowerCase()
  if (/\b(dialog|modal|alertdialog)\b/.test(hay) || /\bmodal\b/.test(hay)) return "modal"
  if (/\bnav|menubar|\bmenu\b/.test(hay)) return "navigation"
  if (/\btable|grid|row(group)?\b|\btr\b|\btd\b/.test(hay)) return "table"
  if (/\bform\b/.test(hay)) return "form"
  if (/\b(textbox|combobox|searchbox|input|textarea|select|checkbox|radio|spinbutton)\b/.test(hay)) return "input"
  if (/\bbutton\b|\bbtn\b/.test(hay)) return "button"
  if (/\blink\b|\ba\[|^a\b|\ba\./.test(hay)) return "link"
  if (/\b(img|image|figure|picture|logo)\b/.test(hay)) return "image"
  if (/\b(heading|h[1-6])\b/.test(hay)) return "heading"
  if (t.text || t.name) return "text"
  return "other"
}

/** Stable, case/whitespace-insensitive identity for "which element was this about", or null when nothing identifies it. */
export function componentKey(t: ObsTarget | null | undefined): string | null {
  if (!t) return null
  const norm = (s?: string) => (s || "").toLowerCase().replace(/\s+/g, " ").trim()
  const sel = norm(t.selector)
  if (sel) return "sel:" + sel
  const label = norm(t.name) || norm(t.text)
  return label ? "txt:" + label.slice(0, 80) : null
}

export type QaCategory =
  | "visual-consistency" | "functional" | "form-validation" | "navigation" | "content" | "responsive"
  | "accessibility" | "broken-asset" | "loading" | "error-message" | "other"

const CATEGORY_RULES: Array<[QaCategory, RegExp]> = [
  ["content", /\b(typo|misspell|spelling|grammar|grammatical|capitaliz|punctuation|wording|copy|lorem ipsum|placeholder text|inconsistent (text|label|terminology))\b/i],
  ["accessibility", /\b(contrast|alt text|aria|screen reader|keyboard|focus (ring|indicator|state)|tap target|touch target|too small to (read|tap)|legib)\b/i],
  ["broken-asset", /\b(broken (image|img|icon|link)|missing (image|icon|asset|logo)|image (fail|not load)|404|failed to load|blank (image|area))\b/i],
  ["error-message", /\b(error (message|banner|text)|exception|stack ?trace|something went wrong|undefined|null|nan|\[object|visible error)\b/i],
  ["form-validation", /\b(validation|required field|invalid|input field|form field|placeholder|password field|email field|submit)\b/i],
  ["navigation", /\b(navigation|nav ?bar|menu|breadcrumb|redirect|link (goes|leads|points)|back button|tab(s)?\b)/i],
  ["loading", /\b(loading|spinner|skeleton|stuck|hang|infinite|unresponsive|slow)\b/i],
  ["responsive", /\b(responsive|mobile|viewport|overflow|cut ?off|clipp?ed|truncat|overlap|wrap|horizontal scroll)\b/i],
  ["functional", /\b(button|click|does ?n.t work|not work|disabled|broken|fail|can.?t|cannot|no (response|feedback))\b/i],
  ["visual-consistency", /\b(align|spacing|padding|margin|font|color|colour|layout|inconsistent|misalign|style|icon)\b/i],
]

/** Coarse issue category from the observation text — used for traceability and as a same-defect signal. */
export function inferQaCategory(text: string): QaCategory {
  const t = String(text || "")
  for (const [cat, re] of CATEGORY_RULES) if (re.test(t)) return cat
  return "other"
}

export type SimReviewContext = {
  simReview: {
    /** Always "screenshot" in Phase 1: the Sim looked at one captured image. */
    basis: "screenshot"
    /** Always false in Phase 1: no browser interaction took place, so nothing here was reproduced. */
    browserVerified: false
    verification: "unverified-screenshot-observation"
    pageUrl: string | null
    urlHost: string | null
    urlPath: string | null
    component: { kind: ComponentKind; text?: string; selector?: string; role?: string; name?: string } | null
    region: { x: number; y: number; w: number; h: number } | null
    category: QaCategory
    uiState: string
    evidence: EvidenceRecord
    /** Run-time check of the "Accurate UI Identification & Issue Traceability" validation. Flagged, never dropped. */
    traceability: { ok: boolean; missing: string[] }
    /** QA Sims only (see lib/sim-validations.ts). */
    visual?: { category: string | null; expected: string | null; actual: string | null; confidence: string | null }
  }
}

/** What an issue is missing to be traceable. A page-level observation (no target and no region) only needs the page URL. */
export function traceabilityGaps(a: { pageUrl?: string | null; target?: ObsTarget | null; region?: unknown }): string[] {
  const missing: string[] = []
  if (!a.pageUrl) missing.push("page URL")
  if (a.target || a.region) {
    if (!componentKind(a.target)) missing.push("component")
    if (!a.region) missing.push("region")
    if (!a.target?.text) missing.push("visible text")
  }
  return missing
}

export function buildSimReviewContext(a: {
  pageUrl?: string | null; urlHost?: string | null; urlPath?: string | null
  target?: ObsTarget | null; region?: { x: number; y: number; w: number; h: number } | null
  observation: string; evidence: EvidenceRecord
  /** QA Sims: the model's validation category / expected / actual / confidence, recorded on the finding. */
  visual?: { category?: string | null; expected?: string | null; actual?: string | null; confidence?: string | null } | null
}): SimReviewContext {
  const kind = componentKind(a.target)
  const t = a.target
  return {
    simReview: {
      basis: "screenshot",
      browserVerified: false,
      verification: "unverified-screenshot-observation",
      pageUrl: a.pageUrl ?? null,
      urlHost: a.urlHost ?? null,
      urlPath: a.urlPath ?? null,
      component: t && kind ? { kind, ...(t.text ? { text: t.text } : {}), ...(t.selector ? { selector: t.selector } : {}), ...(t.role ? { role: t.role } : {}), ...(t.name ? { name: t.name } : {}) } : null,
      region: a.region ?? null,
      category: inferQaCategory(a.observation),
      ...(a.visual ? { visual: { category: a.visual.category ?? null, expected: a.visual.expected ?? null, actual: a.visual.actual ?? null, confidence: a.visual.confidence ?? null } } : {}),
      uiState: "Page as rendered in one captured screenshot; no clicks, typing, resizing or navigation were performed.",
      evidence: a.evidence,
      traceability: (() => { const missing = traceabilityGaps({ pageUrl: a.pageUrl, target: a.target, region: a.region }); return { ok: missing.length === 0, missing } })(),
    },
  }
}

// ── Same-defect matching (handles rephrased descriptions) ─────────────────────

const STOP = new Set(("a an the is are was were be been being of on in at to for with and or but not no this that these those it its as by from into than then " +
  "there here appears appear seems seem looks look shows show visible page screen section user users sim i we you they their our your has have had can could should would may might").split(" "))

function stem(w: string): string {
  return w.replace(/(ing|ed|es|s|ly)$/, (m, _x, off) => (off >= 4 ? "" : m))
}

export function defectTokens(text: string): Set<string> {
  const out = new Set<string>()
  for (const raw of String(text || "").toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 3 || STOP.has(raw)) continue
    out.add(stem(raw))
  }
  return out
}

/** Overlap coefficient over content words (0..1): "how much of the smaller description is contained in the other". */
export function defectOverlap(a: string, b: string): number {
  const A = defectTokens(a), B = defectTokens(b)
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const t of A) if (B.has(t)) inter++
  return inter / Math.min(A.size, B.size)
}

export type PageFinding = { id: string; title: string; observation: string; clientContext: any | null }

function findingCategory(f: PageFinding): QaCategory {
  return f.clientContext?.simReview?.category ?? inferQaCategory(`${f.title || ""} ${f.observation}`)
}

/** True when the candidate and the existing finding are about two different, known kinds of defect (never the same defect). */
export function categoriesConflict(candText: string, existing: PageFinding): boolean {
  const a = inferQaCategory(candText), b = findingCategory(existing)
  return a !== "other" && b !== "other" && a !== b
}

/**
 * Decide whether a new Sim observation is the SAME underlying defect as a finding already filed on this page, even when it is worded
 * differently. Signals (all on the same page): the UI component, the issue category, and content-word overlap.
 *   * same component AND (same category OR overlap ≥ 0.6)  → duplicate
 *   * two different known categories are never the same defect
 *   * no component on either side: same (non-"other") category AND overlap ≥ 0.6, or overlap ≥ 0.8 → duplicate
 * Returns the matching finding id, preferring the strongest match.
 */
export function findSameDefect(cand: { observation: string; title?: string; target?: ObsTarget | null }, existing: PageFinding[]): string | null {
  const text = `${cand.title || ""} ${cand.observation}`.trim()
  const candKey = componentKey(cand.target)
  const candCat = inferQaCategory(text)
  let best: { id: string; score: number } | null = null
  for (const f of existing) {
    const fText = `${f.title || ""} ${f.observation}`.trim()
    const ov = Math.max(defectOverlap(text, fText), defectOverlap(cand.observation, f.observation))
    const fComp = f.clientContext?.simReview?.component
    const fKey = fComp ? componentKey({ selector: fComp.selector, name: fComp.name, text: fComp.text }) : null
    const fCat: QaCategory = findingCategory(f)
    const sameCat = candCat !== "other" && candCat === fCat
    // Two different, known categories are two different defects (e.g. low contrast vs a typo on the same button) however much the
    // wording overlaps.
    let hit = false
    if (candCat !== "other" && fCat !== "other" && candCat !== fCat) hit = false
    else if (candKey && fKey) hit = candKey === fKey && (sameCat || ov >= 0.6)
    else hit = (sameCat && ov >= 0.6) || ov >= 0.8 || lexicalSim(text, fText) >= 0.82
    if (hit) {
      const score = ov + (candKey && fKey && candKey === fKey ? 0.5 : 0)
      if (!best || score > best.score) best = { id: f.id, score }
    }
  }
  return best ? best.id : null
}
