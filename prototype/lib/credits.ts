// Unified "Klavity Credits" — the metered-AI wallet layer (spec 2026-08-25). Sits ALONGSIDE the
// existing COGS plumbing (chat() → tryReserveDailySpend/recordAiCall). MILLICREDITS everywhere:
// 1 credit = 1000 millicredits, so voice (0.1cr) is an exact integer (100 mc).
export const MC_PER_CREDIT = 1000

export type CreditAction = "enhance" | "transcript" | "keyframes" | "voice" | "sim" | "autosim"

// Locked per-action costs (spec §4/§12), in millicredits. Config-driven at runtime via
// credit_action_costs; these are the seed/fallback defaults, NEVER hard-coded at call sites.
export const DEFAULT_ACTION_COST_MC: Record<CreditAction, number> = {
  enhance: 1_000,    // 1cr  — one vision call
  transcript: 1_000, // 1cr per started minute (× minutes)
  keyframes: 2_000,  // 2cr  — ffmpeg + a vision summary
  voice: 100,        // 0.1cr per dictation → 10 dictations = 1cr (exact)
  sim: 15_000,       // 15cr — persona review
  autosim: 75_000,   // 75cr — full browser walk
}

// Resolve the millicredit cost of an action. `units` = minutes (transcript) or dictation count
// (voice); ignored for flat actions. `baseMc` overrides the default (pass the DB-config value).
export function creditCostFor(action: CreditAction, units = 1, baseMc?: number): number {
  const base = typeof baseMc === "number" && Number.isFinite(baseMc) ? baseMc : DEFAULT_ACTION_COST_MC[action]
  if (action === "transcript") return base * Math.max(1, Math.ceil(units || 0))
  if (action === "voice") return base * Math.max(1, Math.floor(units || 1))
  return base
}
