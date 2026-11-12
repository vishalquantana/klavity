// KD-2877: the Sim Runs page's list only needs, per run, an issue count and the Sim avatars — not every Sim's full reaction
// payload (avg ~7 KB, up to ~70 KB per run, x20 runs). `slimSimRun` strips a run down to that; the full run is fetched on demand
// (GET /api/sims/runs/:id) when one is selected. Pure + dependency-free so it can be unit-tested.
import type { SimRunRow } from "./db"

export type SlimSimRun = Omit<SimRunRow, "reactions"> & {
  slim: true
  /** Observations that carry a suggested bug across every Sim's reaction — what the list pill shows ("N issues"). */
  issueCount: number
  /** The Sims that reacted (avatar row). */
  sims: Array<{ simName: string; initials: string | null; accent: string | null }>
}

export function slimSimRun(run: SimRunRow): SlimSimRun {
  const { reactions, ...rest } = run
  let issueCount = 0
  const sims: SlimSimRun["sims"] = []
  for (const rev of Array.isArray(reactions) ? reactions : []) {
    if (!rev || typeof rev !== "object") continue
    sims.push({ simName: String(rev.simName ?? ""), initials: rev.initials != null ? String(rev.initials) : null, accent: rev.accent != null ? String(rev.accent) : null })
    for (const o of Array.isArray(rev.observations) ? rev.observations : []) if (o && o.suggestedBug) issueCount++
  }
  return { ...rest, slim: true, issueCount, sims }
}
