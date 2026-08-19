// prototype/lib/connector-automatch.ts — pure, no IO
export type MatchStatus = "matched" | "ambiguous" | "unmatched"
export type MatchRow = { key: string; label: string; suggested: string | null; candidates: string[]; status: MatchStatus }
export const KIND_SYNONYMS: Record<string,string[]> = {
  bug: ["bug", "defect"],
  feature: ["feature", "story", "improvement", "enhancement"],
}
export const STATUS_SYNONYMS: Record<string,string[]> = {
  new: ["new", "to do", "todo", "backlog", "triage", "open"],
  open: ["open", "in progress", "doing", "selected for development", "accepted"],
  in_progress: ["in progress", "doing", "started", "wip"],
  done: ["done", "closed", "complete", "completed", "resolved", "fixed"],
  dismissed: ["dismissed", "won't do", "wont do", "won't fix", "wont fix", "cancelled", "canceled", "rejected", "invalid", "not a bug"],
}
const norm = (s: string) => s.trim().toLowerCase()
export function autoMatch(source: { key: string; label: string }, options: string[]): MatchRow {
  const base: MatchRow = { key: source.key, label: source.label, suggested: null, candidates: [], status: "unmatched" }
  if (!options.length) return base
  // 1) exact label match
  const exact = options.find(o => norm(o) === norm(source.label))
  if (exact) return { ...base, suggested: exact, status: "matched" }
  // 2) synonym intersection
  const syns = (KIND_SYNONYMS[source.key] || STATUS_SYNONYMS[source.key] || [norm(source.label)])
  const hits = options.filter(o => syns.includes(norm(o)))
  if (hits.length === 1) return { ...base, suggested: hits[0], candidates: hits, status: "matched" }
  if (hits.length > 1) return { ...base, suggested: null, candidates: hits, status: "ambiguous" }
  return base
}
