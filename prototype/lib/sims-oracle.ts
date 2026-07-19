// prototype/lib/sims-oracle.ts
// KLA-274 (JTBD 4.10): expose Sims-as-oracle over the expectations spine.
//
// A Sim is an ORACLE for expected behaviour: when a Sim reviews a page it flags what SHOULD be true,
// and that flag becomes an expectation (source kind "sim"). This module turns an expectation + the
// Sim that vouches for it into a legible "what the Sim expects vs what happened" verdict the board
// can render, WITHOUT re-deriving the spine's lifecycle — it reads the existing status straight.
//
// Kept DB-free / pure so it's unit-testable and callable from the route with injected lookups.
import type { ExpStatus, SourceRef } from "./expectations"

/** The oracle's current standing, derived 1:1 from the expectation's spine status. */
export type OracleStanding = "guarded" | "confirmed" | "watching" | "dropped"

/** Minimal identity of the Sim acting as the oracle (resolved from feedback.sim_id → personas). */
export type SimIdentity = { simId: string; simName: string | null; simRole: string | null }

export type ExpectationOracle = {
  simId: string
  simName: string | null
  simRole: string | null
  /** the behaviour the Sim expects — the expectation title. */
  expects: string
  status: ExpStatus
  standing: OracleStanding
  /** short human label for the standing, e.g. "Guarded". */
  standingLabel: string
  /** one-line verdict: what the Sim expects vs what happened. */
  verdict: string
}

// status → { standing, label, "what happened" clause }. candidate is the safe default for any
// unknown/legacy status so a bad row never throws or renders blank.
const STANDING: Record<ExpStatus, { standing: OracleStanding; label: string; happened: string }> = {
  enforced: { standing: "guarded", label: "Guarded", happened: "an AutoSim now guards it" },
  validated: { standing: "confirmed", label: "Confirmed", happened: "a second source agreed" },
  candidate: { standing: "watching", label: "Watching", happened: "seen once — awaiting a second source" },
  retired: { standing: "dropped", label: "Dropped", happened: "the check was retired" },
}

function standingFor(status: ExpStatus) {
  return STANDING[status] || STANDING.candidate
}

/** Public: map an expectation status → the oracle's standing. */
export function oracleStanding(status: ExpStatus): OracleStanding {
  return standingFor(status).standing
}

/**
 * The first "sim"-kind source ref on an expectation — the Sim that acts as the oracle. AutoSim
 * ("autosim"/"finding") and human ("snap") refs are NOT oracles here: only a live Sim review vouches
 * for expected behaviour in the JTBD-4.10 sense. Returns null when no Sim vouches for this row.
 */
export function simSourceRef(sourceRefs: SourceRef[] | null | undefined): SourceRef | null {
  for (const ref of sourceRefs || []) if (ref && ref.kind === "sim") return ref
  return null
}

/**
 * Compose the oracle verdict for one expectation. Returns null when no Sim is resolved (nothing to
 * expose) so callers can simply omit the field. Never throws.
 */
export function buildExpectationOracle(
  exp: { status: ExpStatus; title: string; sourceRefs?: SourceRef[] | null },
  sim: SimIdentity | null,
): ExpectationOracle | null {
  if (!sim || !sim.simId) return null
  const s = standingFor(exp.status)
  const name = (sim.simName && sim.simName.trim()) || "A Sim"
  const expects = String(exp.title || "").trim()
  const verdict = `${name} expects: ${expects || "(untitled behaviour)"} — ${s.happened}`
  return {
    simId: sim.simId,
    simName: sim.simName ?? null,
    simRole: sim.simRole ?? null,
    expects,
    status: exp.status,
    standing: s.standing,
    standingLabel: s.label,
    verdict,
  }
}
