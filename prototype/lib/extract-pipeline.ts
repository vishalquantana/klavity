/**
 * Canonical transcript → Sim pipeline: shared prompt + normalisation.
 *
 * Both entry points that turn a transcript into personas use this module:
 *   • POST /api/extract   — the legacy AI-demo endpoint (no persistence)
 *   • POST /api/transcripts — the Sim-Studio path (persists + reconciles)
 *
 * server.ts owns the LLM call (chat()) because it holds the budget ledger and
 * OpenRouter key. After the call returns raw JSON this module normalises the
 * result identically for both callers:
 *   1. Backward-compat type shim  (simClass → legacy .type field)
 *   2. Insight typed-field sanitization  (area / issueType / priority / scope / portability)
 *
 * EXTRACT_SYS is v3 — keep changes to the prompt here and both entry points
 * automatically pick them up.
 */

import { sanitizeInsight } from "./extract-sanitize"

// ── v3 Prompt ──────────────────────────────────────────────────────────────────
// EXTRACT_SYS v3 — single source of truth for the transcript-extraction prompt.
// Both /api/extract and /api/transcripts use this exact system message (via server.ts).
export const EXTRACT_SYS =
  "You are an expert qualitative UX researcher building reusable user personas (\"Sims\") from interview/call transcripts. " +
  "Identify each distinct HUMAN speaker who is a user, customer, or stakeholder. For each produce a persona. " +
  "Skip a pure facilitator/interviewer who reveals no preferences of their own. Be faithful to what people actually said.\n\n" +
  "Classify each persona on two axes:\n" +
  "- simClass: \"client\" = evaluates OVERALL outcomes (whether the product delivers the business result; feedback skews feature/workflow/strategy). " +
  "\"user\" = actually OPERATES the product (feedback skews UI and interaction).\n" +
  "- side: \"external\" = a customer/partner outside the team. \"internal\" = on the product/company team.\n\n" +
  "Give each persona a portable CORE that travels to any product/site:\n" +
  "- goals: 1-4 jobs-to-be-done the person is trying to accomplish.\n" +
  "- expertise: their domain/product savvy (e.g. \"expert (finance) - intermediate (product)\").\n" +
  "- temperament: how they behave - patience, tone, what sets them off.\n" +
  "- voice: a short first-person phrasing sample, in their own words.\n" +
  "- watchFor: 2-5 things this persona scrutinizes on ANY page/product (the lens they react through, independent of this product).\n\n" +
  "Each insight is typed pain | want | love and MUST be anchored to a short verbatim quote from the transcript. Also set:\n" +
  "- scope: ui | feature | workflow | strategy. ui = a granular defect on a specific artifact (name the exact button/label/screen). " +
  "feature = a missing or requested capability. workflow = a change to a multi-step process, role, or permission model. " +
  "strategy = a higher-level product direction.\n" +
  "- portability: \"portable\" = a durable persona trait/need that would also apply on other products. " +
  "\"site-specific\" = a finding about THIS product.\n" +
  "- For ui scope, name the CONCRETE artifact in the text field. For feature/workflow/strategy, name the capability, flow, or role affected; " +
  "issueType and priority may be null.\n" +
  "- area: short descriptor of the UI/domain area (e.g. \"checkout-flow\", \"cost-forecasting\", \"onboarding\").\n" +
  "- issueType: EXACTLY ONE of label-copy | layout | performance | flow | error-handling | accessibility | visual, or null if it genuinely does not fit.\n" +
  "- priority: urgent | high | medium | low based on the speaker's expressed impact, or null if unclear.\n" +
  "Capture the OVERALL INTENT behind what people say, even when it spans several turns or is implied - synthesize the product implication, not only the literal words.\n\n" +
  "TONE - sarcasm, irony, and negation: speakers are frequently sarcastic (e.g. \"oh it's REAL intuitive\" meaning the OPPOSITE) " +
  "or use negation (\"it's not that X is slow, it's that Y returns nothing\"). " +
  "Infer the speaker's TRUE sentiment from context and consequences, not surface words. " +
  "Do NOT emit a love insight for clearly sarcastic praise - classify it as the real pain. " +
  "Resolve negation to the actual complaint. When genuine tone is ambiguous, prefer to omit rather than mis-sign.\n\n" +
  "Respond with ONLY a JSON object, no prose, in exactly this shape:\n" +
  '{"personas":[{"name":string,"role":string,"simClass":"client"|"user","side":"external"|"internal","initials":string(2 uppercase letters),' +
  '"accent":string(hex colour like #6366f1),"summary":string,' +
  '"core":{"goals":string[],"expertise":string,"temperament":string,"voice":string,"watchFor":string[]},' +
  '"insights":[{"kind":"pain"|"want"|"love","scope":"ui"|"feature"|"workflow"|"strategy","portability":"portable"|"site-specific",' +
  '"text":string,"quote":string,"area":string|null,' +
  '"issueType":"label-copy"|"layout"|"performance"|"flow"|"error-handling"|"accessibility"|"visual"|null,"priority":"urgent"|"high"|"medium"|"low"|null}]}]}' +
  ""

// ── Normalisation ──────────────────────────────────────────────────────────────
/**
 * Normalise the raw LLM-parsed output of an extraction call into the canonical
 * v3 persona shape.  This is the shared post-processing step for BOTH entry
 * points (/api/extract and /api/transcripts):
 *
 *  1. Backward-compat `.type` shim — v3 uses simClass/side; pre-v3 consumers
 *     (and any code that still reads `.type`) continue to work because we
 *     derive `.type` from simClass when it is absent.
 *  2. Insight typed-field sanitisation — area / issueType / priority / scope /
 *     portability are all closed-enum and must be null-defaulted for values the
 *     model returned outside the allowed set (or returned in a bad type).
 *
 * The function mutates `data` in-place (matches original behaviour) and also
 * returns it for chaining convenience.
 */
export function normalizeExtractedPersonas(data: any): any {
  if (!Array.isArray(data?.personas)) return data
  for (const p of data.personas) {
    // Backward-compat shim: v3 uses simClass/side; map to legacy .type so any
    // downstream code still reading persona.type keeps working.
    // TODO: remove once all consumers have migrated to simClass/side.
    if (p.type == null && p.simClass != null) {
      p.type = p.simClass === "client" ? "client" : "internal"
    }
    if (Array.isArray(p?.insights)) {
      p.insights = p.insights.map((ins: any) => ({ ...ins, ...sanitizeInsight(ins) }))
    }
  }
  return data
}
