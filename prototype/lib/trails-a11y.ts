// KLA-800: Accessibility (WCAG) audit as a first-class AutoSim check.
//
// During a verification walk we already drive a real Chromium page. This module injects axe-core
// (Deque's open-source WCAG engine — the same one behind Lighthouse's a11y audit) into that live
// page, runs it once per unique URL, and turns each violation into a Klavity `accessibility` Finding
// with a severity derived from axe's `impact`. It is:
//   • advisory — a11y findings NEVER change the walk verdict and are recorded `queued` (not auto-filed);
//   • non-fatal — any injection/scan/timeout error yields zero findings and never fails the walk;
//   • default-OFF — gated by the project's a11yAuditEnabled flag (or an explicit WalkOptions.a11y).
//
// Gate-safety note: this file deliberately imports NO node builtins and loads axe via a NON-LITERAL
// dynamic import so the merge-train's isolated tsc gate (`--lib es2022,dom`, no node types, no
// third-party module resolution) sees zero net-new errors. See docs/specs/autonomous-qa/accessibility-audit.md.

import type { FindingSeverity } from "./trails-findings-severity"

/** Minimal structural view of a Playwright Page — avoids importing `playwright` (gate-safety). */
export interface A11yScanPage {
  url(): string
  evaluate: (fn: any, arg?: any) => Promise<any>
}

/** WCAG 2.0/2.1 A + AA + Deque best-practices (experimental rules off) — matches Mabl's default. */
export const AXE_DEFAULT_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]

const AXE_INJECT_TIMEOUT_MS = 5_000
const AXE_RUN_TIMEOUT_MS = 15_000
/** Cap findings per scan so a pathological page can't flood the findings table. */
const A11Y_MAX_FINDINGS = 50

/**
 * Map axe's user-impact scale (critical/serious/moderate/minor) → our finding severity.
 * axe impact is Deque's scale, NOT WCAG-defined; anything unknown floors to "low".
 */
export function impactToPriority(impact: string | null | undefined): FindingSeverity {
  switch (String(impact ?? "").toLowerCase()) {
    case "critical": return "urgent"
    case "serious": return "high"
    case "moderate": return "medium"
    default: return "low" // "minor" + unknown/null
  }
}

// axe-core exposes `.source` — its library text, meant for injection via page.evaluate. Loaded once
// via a variable specifier so tsc can't (and needn't) resolve the package at gate time.
let axeSourceCache: string | null | undefined
async function loadAxeSource(): Promise<string | null> {
  if (axeSourceCache !== undefined) return axeSourceCache
  try {
    const spec = "axe-core"
    const mod: any = await import(spec)
    axeSourceCache = (mod?.source ?? mod?.default?.source) || null
  } catch (e) {
    console.warn("[a11y] axe-core unavailable, skipping scans:", String(e))
    axeSourceCache = null
  }
  return axeSourceCache
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => { const t: any = setTimeout(() => rej(new Error("a11y timeout")), ms); t?.unref?.() }),
  ])
}

function extractContrast(node: any): Record<string, unknown> | undefined {
  try {
    const checks = [...(node?.any || []), ...(node?.all || []), ...(node?.none || [])]
    const c = checks.find((x: any) => x?.id === "color-contrast" && x?.data)
    if (!c) return undefined
    const d = c.data || {}
    return { ratio: d.contrastRatio, expected: d.expectedContrastRatio, fg: d.fgColor, bg: d.bgColor, fontSizePt: d.fontSize, bold: d.fontWeight === "bold" }
  } catch { return undefined }
}

export interface A11yScanCtx {
  projectId: string
  runId: string
  trailId: string
  stepId?: string
  /** Normalized URL path this scan ran against (used in dedupKey/contentSig for stable recurrence). */
  urlPath: string
  tags?: string[]
  maxFindings?: number
}

/** Optional injectable recorder for unit tests; defaults to the real recordFinding. */
type FindingRecorder = (
  projectId: string,
  input: Record<string, unknown>,
) => Promise<{ id: string; deduped: boolean; recurrence: number }>

/**
 * Inject axe-core into `page`, run it against the current document, and record each violation node
 * as an `accessibility` Finding. Returns the number of finding rows recorded/bumped. Never throws.
 */
export async function runA11yScan(
  page: A11yScanPage,
  ctx: A11yScanCtx,
  deps?: { recordFinding?: FindingRecorder },
): Promise<number> {
  try {
    const src = await loadAxeSource()
    if (!src) return 0
    await withTimeout(page.evaluate(src), AXE_INJECT_TIMEOUT_MS) // defines window.axe (idempotent)
    const tags = ctx.tags?.length ? ctx.tags : AXE_DEFAULT_TAGS
    const result: any = await withTimeout(
      page.evaluate(
        (cfg: any) => (window as any).axe.run(document, cfg),
        { runOnly: { type: "tag", values: tags }, resultTypes: ["violations"] },
      ),
      AXE_RUN_TIMEOUT_MS,
    )
    const violations: any[] = Array.isArray(result?.violations) ? result.violations : []
    if (!violations.length) return 0

    const record: FindingRecorder = deps?.recordFinding ?? (await import("./trails")).recordFinding
    const cap = ctx.maxFindings ?? A11Y_MAX_FINDINGS
    let recorded = 0
    for (const v of violations) {
      const ruleId = String(v?.id ?? "unknown")
      const impact = String(v?.impact ?? "minor")
      const priority = impactToPriority(impact)
      const wcagTags: string[] = Array.isArray(v?.tags) ? v.tags.map(String) : []
      const helpUrl = String(v?.helpUrl ?? "")
      const nodes: any[] = Array.isArray(v?.nodes) ? v.nodes : []
      for (const node of nodes) {
        if (recorded >= cap) return recorded
        const target = Array.isArray(node?.target) ? node.target.map(String).join(" ") : String(node?.target ?? "")
        const html = String(node?.html ?? "").slice(0, 500)
        const failureSummary = String(node?.failureSummary ?? "").slice(0, 800)
        const normTarget = target.replace(/\s+/g, " ").trim()
        await record(ctx.projectId, {
          runId: ctx.runId,
          trailId: ctx.trailId,
          stepId: ctx.stepId,
          kind: "accessibility",
          title: `${ruleId}: ${String(v?.help ?? v?.description ?? "accessibility issue")}`.slice(0, 200),
          evidence: { a11y: { ruleId, impact, wcagTags, helpUrl, target, html, failureSummary, contrast: extractContrast(node) } },
          groundQuote: html || null,
          groundQuoteVerified: true, // node HTML is verified DOM text
          confidence: 1, // axe is deterministic
          priority,
          dedupKey: `a11y:${ctx.urlPath}:${ruleId}:${normTarget}`.slice(0, 400),
          contentSig: `a11y|${ruleId}|${normTarget}|${ctx.urlPath}`,
          status: "queued",
          urlPath: ctx.urlPath,
        })
        recorded++
      }
    }
    return recorded
  } catch (e) {
    console.warn("[a11y] scan failed (non-fatal):", String(e))
    return 0
  }
}

/** Normalize a URL to a path key for once-per-route scan dedup (strips query + fragment). */
export function a11yUrlKey(url: string): string {
  try {
    const u = new URL(url)
    return u.origin + u.pathname
  } catch {
    return String(url || "").split("?")[0].split("#")[0]
  }
}
