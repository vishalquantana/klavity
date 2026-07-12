// prototype/lib/expectations-enrich.ts
// B.10 (KLA-250): compose the ENRICHED GET /api/expectations/:id payload the board's card
// click-through needs — the raw row (its "enriched" comment was aspirational) only carried a list
// of {kind,id} refs and a raw ts_ step UUID. Here we resolve those into human-usable evidence:
//   • sources[]  — each source ref hydrated to title / urlPath / grounded quote + a stable "kind"
//                   ("report" for snap, "sim"/"finding" for the rest) so cards can link out.
//   • corroboration — the same {snap,sim,recurrence} breakdown, unchanged.
//   • linkedTrail  — the enforced guard's Trail (name) + step POSITION ("step N of M"), never the
//                    raw ts_ UUID (consistent with B.2).
//   • progress     — for a Seen-once (candidate) row, the plain-language path to Confirmed.
// Kept DB-free: the route injects the lookups so this is unit-testable and never touches the db
// singleton. Every lookup is best-effort — a missing source/finding/trail degrades to a stub ref,
// never throws, so the route stays a stable 200.
import type { ExpectationRow } from "./expectations-db"
import type { SourceRef } from "./expectations"
import { validationProgress, type ValidationProgress } from "./expectations"

/** A hydrated source ref the board card can render + link. `kind` is the user-facing bucket. */
export type EnrichedSource = {
  ref: SourceRef
  /** user-facing bucket: a human "report" (snap), an AutoSim "finding", or a live "sim" review. */
  kind: "report" | "finding" | "sim"
  title: string | null
  urlPath: string | null
  /** verbatim grounding quote from the source, when the source captured one (B.13). */
  groundedQuote: string | null
  /** deep link the card opens (ticket drawer for a report, walk/finding for a finding). null when unresolvable. */
  href: string | null
  /** true when the underlying row was actually found; false = a stub for a dangling ref. */
  resolved: boolean
}

/** The enforced guard's Trail + step position — never a raw ts_ UUID. */
export type LinkedTrail = {
  trailId: string
  trailName: string | null
  stepId: string
  /** 1-based position of the assert step within the Trail. null when the step is gone. */
  stepPosition: number | null
  /** total steps in the Trail (denominator for "step N of M"). null when unknown. */
  stepCount: number | null
}

export type EnrichedExpectation = ExpectationRow & {
  sources: EnrichedSource[]
  linkedTrail: LinkedTrail | null
  progress: ValidationProgress | null
}

/** What a resolved report (snap feedback) looks like to this module — a minimal shape. */
export type ResolvedReport = { title?: string | null; urlPath?: string | null; groundedQuote?: string | null } | null
/** What a resolved finding looks like — findings carry a title + a ground_quote. */
export type ResolvedFinding = { title?: string | null; urlPath?: string | null; groundedQuote?: string | null } | null
/** What a resolved trail step looks like — its owning trail + 1-based position + total. */
export type ResolvedStep = { trailId: string; trailName: string | null; position: number | null; total: number | null } | null

export type EnrichLookups = {
  /** resolve a snap feedback / report by id. */
  getReport: (id: string) => Promise<ResolvedReport>
  /** resolve an AutoSim finding by id. */
  getFinding: (id: string) => Promise<ResolvedFinding>
  /** resolve the enforced step id → its Trail + position. */
  getStep: (stepId: string) => Promise<ResolvedStep>
}

function bucketFor(kind: SourceRef["kind"]): EnrichedSource["kind"] {
  // "snap" = a human report; "autosim"/"finding" = an AutoSim finding; "sim" = a live Sim review.
  if (kind === "snap") return "report"
  if (kind === "sim") return "sim"
  return "finding"
}

/**
 * Build the enriched payload. Purely composes the row + injected lookups; never throws — a lookup
 * that rejects is treated as "unresolved" so the route always returns a stable object.
 */
export async function enrichExpectation(exp: ExpectationRow, lk: EnrichLookups): Promise<EnrichedExpectation> {
  const sources: EnrichedSource[] = []
  for (const ref of exp.sourceRefs || []) {
    const bucket = bucketFor(ref.kind)
    let title: string | null = null
    let urlPath: string | null = null
    let groundedQuote: string | null = null
    let href: string | null = null
    let resolved = false
    try {
      if (bucket === "report") {
        const r = await lk.getReport(ref.id)
        if (r) {
          resolved = true
          title = r.title ?? null; urlPath = r.urlPath ?? null; groundedQuote = r.groundedQuote ?? null
          href = "/dashboard#tickets"
        }
      } else {
        // both "finding" and "sim" buckets resolve via the findings table in this codebase.
        const f = await lk.getFinding(ref.id)
        if (f) {
          resolved = true
          title = f.title ?? null; urlPath = f.urlPath ?? null; groundedQuote = f.groundedQuote ?? null
          href = "/dashboard#autosims"
        }
      }
    } catch { /* best-effort — leave as an unresolved stub */ }
    sources.push({ ref, kind: bucket, title, urlPath, groundedQuote, href, resolved })
  }

  let linkedTrail: LinkedTrail | null = null
  if (exp.enforcedStepId) {
    try {
      const s = await lk.getStep(exp.enforcedStepId)
      if (s) {
        linkedTrail = {
          trailId: s.trailId, trailName: s.trailName ?? null, stepId: exp.enforcedStepId,
          stepPosition: s.position, stepCount: s.total,
        }
      } else {
        // Step is gone but we still have the id — expose it without pretending we resolved a Trail.
        linkedTrail = { trailId: "", trailName: null, stepId: exp.enforcedStepId, stepPosition: null, stepCount: null }
      }
    } catch { /* leave linkedTrail null */ }
  }

  // Progress hint is meaningful only for a not-yet-Confirmed (candidate) row.
  const progress = exp.status === "candidate" ? validationProgress(exp.corroboration) : null

  return { ...exp, sources, linkedTrail, progress }
}
