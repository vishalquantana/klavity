// Curated OpenRouter model shortlist + pure helpers for the /opsadmin weighted model mix.
// No I/O here so it's unit-testable without booting the server. Prices are indicative
// display hints (in/out per 1M tokens) — they are NOT billed, and may drift from OpenRouter.
export type ModelChoice = { id: string; label: string; price: string }

export const MODEL_CHOICES: ModelChoice[] = [
  { id: "qwen/qwen3-vl-235b-a22b-instruct", label: "Qwen3-VL 235B", price: "$0.20 / $0.88" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", price: "$0.30 / $2.50" },
  { id: "google/gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite", price: "$0.25 / $1.50" },
  { id: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5", price: "$1.00 / $5.00" },
  { id: "openai/gpt-5-mini", label: "GPT-5 mini", price: "$0.25 / $2.00" },
]

export const MODEL_CHOICE_IDS: string[] = MODEL_CHOICES.map((c) => c.id)

// Seeded on first boot only (see server.ts). qwen3-heavy trial.
export const DEFAULT_WEIGHTS: Record<string, number> = {
  "qwen/qwen3-vl-235b-a22b-instruct": 50,
  "google/gemini-2.5-flash": 40,
  "google/gemini-3.1-flash-lite": 10,
}

// Weighted random pick. rnd ∈ [0,1). Considers only ids in choiceIds with weight > 0.
// Returns fallback when nothing is eligible.
export function pickModel(weights: Record<string, number>, choiceIds: string[], fallback: string, rnd: number): string {
  const entries = choiceIds
    .map((id) => [id, Number(weights[id]) || 0] as const)
    .filter(([, w]) => w > 0)
  const total = entries.reduce((s, [, w]) => s + w, 0)
  if (total <= 0) return fallback
  let r = rnd * total
  for (const [id, w] of entries) { r -= w; if (r < 0) return id }
  return entries[entries.length - 1][0] // float-rounding safety
}

// Validate+coerce raw form values → clean weights: only known ids, non-negative integers (else 0).
export function parseWeightsForm(raw: Record<string, unknown>, choiceIds: string[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const id of choiceIds) {
    const v = Math.floor(Number(raw[id]))
    out[id] = Number.isFinite(v) && v > 0 ? v : 0
  }
  return out
}

// Normalized integer percentages for display (sum ≈ 100; all 0 when total is 0).
export function weightsToPct(weights: Record<string, number>, choiceIds: string[]): Record<string, number> {
  const total = choiceIds.reduce((s, id) => s + (Number(weights[id]) || 0), 0)
  const out: Record<string, number> = {}
  for (const id of choiceIds) out[id] = total > 0 ? Math.round(((Number(weights[id]) || 0) / total) * 100) : 0
  return out
}
