// Pure, DB-free issue-identity + similarity helpers for suggested-bug dedup.
import { createHash } from "node:crypto"

export function normalizeUrlPath(p: string): string {
  const noFragQuery = (p || "").split("#")[0].split("?")[0]
  const trimmed = noFragQuery.replace(/\/+$/, "")
  return trimmed || "/"
}

// Deterministic exact issue identity: same screen + same issue type + same cited traits.
export function issueKeyFor(parts: {
  projectId: string
  urlPath: string
  issueType: string | null
  citedTraitIds: string[]
}): string {
  const key = [
    parts.projectId,
    normalizeUrlPath(parts.urlPath),
    parts.issueType ?? "",
    [...parts.citedTraitIds].sort().join(","),
  ].join("|")
  return createHash("sha256").update(key).digest("hex").slice(0, 32)
}

export function normalizeReportText(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, "<uuid>")
    .replace(/\b\d{4}-\d{2}-\d{2}(?:[t ][\d:.+-]+z?)?\b/g, "<timestamp>")
    .replace(/\b\d{10,}\b/g, "<id>")
    .replace(/\b\d+(?:\.\d+)?\b/g, "<num>")
    .replace(/\s+/g, " ")
    .trim()
}

export function humanReportIssueKeyFor(parts: {
  projectId: string
  urlPath: string
  text: string
}): string {
  const key = [
    parts.projectId,
    normalizeUrlPath(parts.urlPath),
    normalizeReportText(parts.text),
  ].join("|")
  return "human:" + createHash("sha256").update(key).digest("hex").slice(0, 26)
}

function trigrams(s: string): Set<string> {
  const norm = normalizeReportText(s)
  const out = new Set<string>()
  if (!norm) return out
  const padded = `  ${norm} `
  for (let i = 0; i < padded.length - 2; i++) out.add(padded.slice(i, i + 3))
  return out
}

// Cosine-like similarity over character-trigram sets. 0..1.
export function lexicalSim(a: string, b: string): number {
  const A = trigrams(a)
  const B = trigrams(b)
  if (A.size === 0 || B.size === 0) return 0
  let inter = 0
  for (const t of A) if (B.has(t)) inter++
  return inter / Math.sqrt(A.size * B.size)
}

// Decide which existing feedback id (if any) this candidate duplicates.
// Exact key match (looked up by the caller) wins; else best semantic match ≥ threshold.
// A.10: `excludeIds` are ids an operator manually SPLIT apart from this candidate — they must
// never be re-collapsed automatically, so they're skipped by both the exact- and lexical-match paths.
//
// `exactMinSim` (KLA dedup-smart) guards the EXACT path against over-merging on a BROAD key. A human
// widget report keys by project|page|type only (no cited traits), so two UNRELATED bug reports on the same
// page collapse into one ticket regardless of description (e.g. a "Testing" report merging into a real bug).
// When the caller passes `exactMinSim` (only for such broad/human keys — see findDuplicateFeedback) AND the
// exact match carries text, the exact match wins ONLY if the candidate is at least that lexically similar
// to it; otherwise we fall through to the semantic search (and likely file a NEW ticket). Sim/AutoSim
// reports cite traits → specific keys → the caller omits exactMinSim, so their recurrence/regression
// detection is UNCHANGED (unconditional exact-key merge).
export function chooseDedup(
  cand: { title: string; observation: string },
  exactMatch: { id: string; title?: string; observation?: string } | null,
  recent: Array<{ id: string; title: string; observation: string }>,
  threshold = 0.82,
  excludeIds: Set<string> = new Set(),
  exactMinSim = 0,
): string | null {
  if (exactMatch && !excludeIds.has(exactMatch.id)) {
    if (exactMinSim > 0 && (exactMatch.title != null || exactMatch.observation != null)) {
      const sim = Math.max(
        lexicalSim(cand.title, exactMatch.title || ""),
        lexicalSim(cand.observation, exactMatch.observation || ""),
        lexicalSim(cand.observation, exactMatch.title || ""),
        lexicalSim(cand.title, exactMatch.observation || ""),
      )
      if (sim >= exactMinSim) return exactMatch.id
      // else: too dissimilar for a broad page-key merge → fall through to the semantic search below.
    } else {
      return exactMatch.id
    }
  }
  let best: { id: string | null; score: number } = { id: null, score: 0 }
  for (const r of recent) {
    if (excludeIds.has(r.id)) continue
    const score = Math.max(lexicalSim(cand.title, r.title), lexicalSim(cand.observation, r.observation))
    if (score > best.score) best = { id: r.id, score }
  }
  return best.score >= threshold ? best.id : null
}
