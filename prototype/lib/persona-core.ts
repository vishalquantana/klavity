// Normalises a model-generated persona `core` (goals / expertise / temperament / voice / watchFor) for the
// Describe-a-Sim path. A Sim with an empty watchFor has nothing to scrutinise a page for, so when the model
// omits or botches it we fall back to a generic QA lens rather than saving a core-less Sim.
export type GeneratedCore = { goals: string[]; expertise: string; temperament: string; voice: string; watchFor: string[] }

export const DEFAULT_WATCH_FOR = [
  "Broken or misleading UI: misaligned, overlapping or clipped elements",
  "Forms with missing, unclear or inconsistent validation and error messages",
  "Unclear labels, buttons or calls to action",
  "Spelling, grammar and inconsistent wording",
  "Controls that fail or behave unexpectedly",
]

const strs = (v: unknown, max: number, len = 200): string[] =>
  (Array.isArray(v) ? v : []).map(x => String(x ?? "").replace(/\s+/g, " ").trim().slice(0, len)).filter(Boolean).slice(0, max)
const str = (v: unknown, len: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, len)

export function normalizeGeneratedCore(raw: any, fallback: { role?: string; summary?: string } = {}): GeneratedCore {
  const c = raw && typeof raw === "object" ? raw : {}
  const goals = strs(c.goals, 4)
  const watchFor = strs(c.watchFor, 5)
  return {
    goals: goals.length ? goals : (fallback.summary ? [str(fallback.summary, 200)] : []),
    expertise: str(c.expertise, 160) || str(fallback.role, 160),
    temperament: str(c.temperament, 200),
    voice: str(c.voice, 240),
    watchFor: watchFor.length >= 2 ? watchFor : [...watchFor, ...DEFAULT_WATCH_FOR].slice(0, 5),
  }
}
