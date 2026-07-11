// prototype/lib/expectations-ingest.ts
// Best-effort ingest helpers: funnel Snap/Sim feedback and AutoSim findings into the expectations spine.
// NEVER throws into callers — every export wraps its body in try/catch.
import type { Client } from "@libsql/client"
import { upsertExpectation, incrementExpectationSaves } from "./expectations-db"

/**
 * Ingest a Snap or Sim feedback event into the expectations spine.
 * Caller passes the same `dedupKey` used for feedback dedup (issueKeyForFeedback(...)) so
 * the two dedup keyspaces stay in perfect alignment.
 */
export async function ingestSnapOrSim(c: Client, args: {
  projectId: string
  feedbackId: string
  isSnap: boolean
  title: string
  dedupKey: string
  urlPath?: string | null
  area?: string | null
  issueType?: string | null
  citedTraitIds?: string[]
}): Promise<void> {
  try {
    await upsertExpectation(c, {
      projectId: args.projectId,
      title: args.title.slice(0, 200),
      area: args.area ?? null,
      urlPath: args.urlPath ?? null,
      dedupKey: args.dedupKey,
      source: { kind: args.isSnap ? "snap" : "sim", id: args.feedbackId },
    })
  } catch (e) {
    console.warn("[expectations] ingestSnapOrSim skipped:", String(e))
  }
}

/**
 * KLA-243: Ingest an AutoSim finding into the expectations spine.
 * KLA-95: uses kind "autosim" (not the old "finding") so mergeSource sets sim:true and
 * enables cross-source corroboration with Snap reports on the same expectation.
 * urlPath is populated from the walk step URL so the expectation can match by page.
 * findings carry their own dedupKey (a different keyspace from feedback);
 * cross-source collapse happens via the lexical title fallback in upsertExpectation.
 *
 * Returns the expectation id so recordFinding can store it on the findings row.
 * When an expectation is already "enforced" and a new finding hits it, the saves_count
 * is incremented — this is the "guard caught a regression" signal.
 */
export async function ingestFinding(c: Client, args: {
  projectId: string
  findingId: string
  title: string
  dedupKey: string
  urlPath?: string | null
}): Promise<string | null> {
  try {
    const exp = await upsertExpectation(c, {
      projectId: args.projectId,
      title: args.title.slice(0, 200),
      urlPath: args.urlPath ?? null,
      dedupKey: args.dedupKey,
      source: { kind: "autosim", id: args.findingId },
    })
    // KLA-243: if the expectation is already enforced, this finding is a guard-caught regression.
    if (exp.status === "enforced") {
      await incrementExpectationSaves(c, exp.id)
    }
    return exp.id
  } catch (e) {
    console.warn("[expectations] ingestFinding skipped:", String(e))
    return null
  }
}
