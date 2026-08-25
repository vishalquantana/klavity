// Unified "Klavity Credits" — the metered-AI wallet layer (spec 2026-08-25). Sits ALONGSIDE the
// existing COGS plumbing (chat() → tryReserveDailySpend/recordAiCall). MILLICREDITS everywhere:
// 1 credit = 1000 millicredits, so voice (0.1cr) is an exact integer (100 mc).
import { normalizePlan, type BillingPlan } from "./billing"
import {
  db, ensureWorkspaceCredits, getWorkspaceCredits, getCreditActionCost, debitWorkspaceCredits,
  creditWorkspaceCredits, insertCreditLedger, markGraceUsed, usagePeriod,
  type DebitSplit,
} from "./db"

export const MC_PER_CREDIT = 1000

export type CreditAction = "enhance" | "transcript" | "keyframes" | "voice" | "sim" | "autosim"

// Monthly grant per tier in CREDITS (spec §5/§12 — GENEROUS revision 2026-08-26). Internal slugs:
// pro=Solo, founding=Team-level locked-for-life, agency=Scale-level, partner=unlimited (metering
// short-circuited via creditsUnlimited). NOTE: Scale IS metered for credits now (only partner is
// unlimited) — so its grant is a real cap, not a placeholder. Every number here is ≥ the pre-revision
// grant, so no existing wallet ever re-grants to LESS on the next monthly reset.
export const PLAN_GRANT_CREDITS: Record<BillingPlan, number> = {
  free: 300, pro: 5_000, team: 30_000, founding: 30_000, scale: 150_000, agency: 150_000, partner: 150_000,
}

// Credits-specific "unlimited" check. Deliberately NARROWER than db.planIsUnlimited() (which also
// treats `scale` as unlimited for legacy quota/billing gates): for the credits wallet ONLY `partner`
// (internal/reseller) is unmetered. Scale meters like any paid tier. Do NOT swap this for
// planIsUnlimited — that would silently un-meter Scale again.
export function creditsUnlimited(plan: string | null | undefined): boolean {
  return normalizePlan(plan) === "partner"
}

export function planGrantMillicredits(plan: string | null | undefined): number {
  return PLAN_GRANT_CREDITS[normalizePlan(plan)] * MC_PER_CREDIT
}

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

// ── reserveCredits orchestrator (spec §9) ────────────────────────────────────────────────────────
export class InsufficientCreditsError extends Error {
  readonly action: CreditAction; readonly neededMc: number; readonly availableMc: number
  constructor(action: CreditAction, neededMc: number, availableMc: number) {
    super(`Insufficient credits for ${action}: need ${neededMc}mc, have ${availableMc}mc`)
    this.name = "InsufficientCreditsError"
    this.action = action; this.neededMc = neededMc; this.availableMc = availableMc
  }
}

export type ReserveOpts = {
  plan: string | null | undefined
  units?: number
  actorEmail?: string | null
  isGuest?: boolean
  refFeedbackId?: string | null
  refRunId?: string | null
  enforce?: boolean // default: env KLAV_CREDITS_ENFORCE === "1"
}

export type CreditReservation = {
  workspaceId: string; action: CreditAction; costMc: number
  sufficient: boolean; usedGrace: boolean; wouldBlock: boolean; split: DebitSplit | null
  settle(r: { ok: boolean; aiCallId?: string | null }): Promise<void>
}

// Phase-1 default is SOFT (off): reserveCredits records the decision + debit but never blocks. Phase 2
// flips this to hard-enforce by setting KLAV_CREDITS_ENFORCE=1.
export function creditsEnforceDefault(): boolean {
  return process.env.KLAV_CREDITS_ENFORCE === "1"
}

const NOOP_RESERVATION = (workspaceId: string, action: CreditAction): CreditReservation => ({
  workspaceId, action, costMc: 0, sufficient: true, usedGrace: false, wouldBlock: false, split: null,
  async settle() { /* unlimited plan — nothing to record */ },
})

export async function reserveCredits(workspaceId: string, action: CreditAction, opts: ReserveOpts): Promise<CreditReservation> {
  const enforce = typeof opts.enforce === "boolean" ? opts.enforce : creditsEnforceDefault()
  const plan = opts.plan
  // Only partner (internal/reseller) is unlimited for credits — Scale meters like any paid tier.
  // creditsUnlimited() is intentionally narrower than db.planIsUnlimited() (see its docstring).
  if (creditsUnlimited(plan)) return NOOP_RESERVATION(workspaceId, action)

  const w = await ensureWorkspaceCredits(workspaceId, planGrantMillicredits(plan))
  const baseMc = (await getCreditActionCost(action)) ?? undefined
  const costMc = creditCostFor(action, opts.units ?? 1, baseMc)
  const available = w.grantedMc + w.topupMc
  const period = usagePeriod()
  const sufficient = available >= costMc
  // "Last taste" grace is the relief valve for HARD enforcement only (the one free action when the
  // wallet has hit empty). In Phase-1 SOFT mode nothing blocks, so grace is never consumed — a short
  // action just proceeds and records consumption (wouldBlock=true) for measurement.
  // (Deviation from plan prose §5/§6: grace is gated on enforce && available===0 so the plan's own
  // r2 (partial-balance→throw) / r3 (empty→grace) / r4 (soft→wouldBlock) tests are mutually satisfiable.)
  const graceEligible = enforce && !sufficient && available === 0 && w.lastGracePeriod !== period

  if (enforce && !sufficient && !graceEligible) {
    throw new InsufficientCreditsError(action, costMc, available)
  }
  const usedGrace = graceEligible
  if (usedGrace) await markGraceUsed(workspaceId, period)

  // Reserve (hold). allowNegative when soft OR when this is the granted grace action.
  const split = await debitWorkspaceCredits(workspaceId, costMc, { allowNegative: !enforce || usedGrace })

  const wouldBlock = !sufficient && !graceEligible
  const settle: CreditReservation["settle"] = async ({ ok, aiCallId }) => {
    // Always record the spend (the metered consumption). On failure, ALSO restore the held balance
    // and write the compensating +refund row so the ledger nets to zero (spec ambiguity §10/§14).
    await insertCreditLedger({
      workspaceId, action, millicredits: -costMc, aiCallId: aiCallId ?? null,
      refFeedbackId: opts.refFeedbackId ?? null, refRunId: opts.refRunId ?? null,
      actorEmail: opts.actorEmail ?? null, isGuest: opts.isGuest ?? false,
    })
    if (!ok && split) {
      await creditWorkspaceCredits(workspaceId, split) // restore the hold
      await insertCreditLedger({
        workspaceId, action: "refund", millicredits: costMc, aiCallId: aiCallId ?? null,
        refFeedbackId: opts.refFeedbackId ?? null, refRunId: opts.refRunId ?? null,
        actorEmail: opts.actorEmail ?? null, isGuest: opts.isGuest ?? false,
      })
    }
  }
  return { workspaceId, action, costMc, sufficient, usedGrace, wouldBlock, split, settle }
}

// ── Monthly grant-reset job (spec §5) ────────────────────────────────────────────────────────────
// Lazy re-grant (ensureWorkspaceCredits) already keeps correctness; this batch job is a warm-up that
// walks every account so wallets re-grant even without an AI touch. Idempotent within a period.
export async function runMonthlyGrantReset(atMs: number = Date.now()): Promise<{ scanned: number; regranted: number }> {
  if (!db) return { scanned: 0, regranted: 0 }
  const r = await db.execute("SELECT id, plan FROM accounts")
  let regranted = 0
  for (const row of r.rows as any[]) {
    const before = await getWorkspaceCredits(String(row.id))
    await ensureWorkspaceCredits(String(row.id), planGrantMillicredits(row.plan), atMs)
    const after = await getWorkspaceCredits(String(row.id))
    if (!before || before.grantPeriod !== after!.grantPeriod) regranted++
  }
  return { scanned: r.rows.length, regranted }
}
