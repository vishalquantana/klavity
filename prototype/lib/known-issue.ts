// lib/known-issue.ts
// KLAVITYKLA-241 (JTBD A.11): pre-submit "we already know about this" lookup for the composer.
//
// When a reporter is typing a bug into the widget/extension composer, they may be describing a bug
// Klavity ALREADY tracks (a known or recurring issue). This module resolves the closest matching
// known issue for a project from the reporter's in-progress prose — reusing the SAME char-trigram
// similarity the server-side suggested-bug dedup uses (lexicalSim) so "known issue" == "would dedup
// on submit". Read-only; it never writes. The composer surfaces the match as an inline acknowledgment
// ("Already reported — status: X") so the user isn't filing a duplicate blind.
import type { Client } from "@libsql/client"
import { lexicalSim, normalizeReportText } from "./dedup"
import { buildRecurrenceMemory, recurrenceImpact } from "./recurrence-memory"

export type KnownIssueMatch = {
  feedbackId: string
  title: string          // best display title (suggested-bug title, else observation snippet)
  status: string         // raw feedback status (new | open | in_progress | done | dismissed | ...)
  statusLabel: string    // human-facing label ("in progress", "fixed", "reopened", ...)
  count: number          // total occurrences (1 = first time; ≥2 = recurring)
  regressed: boolean     // true when the issue was resolved then reported again
  headline: string | null // amplified recurrence headline ("Keeps coming back · 3×") when recurring
  score: number          // similarity score of the match (0..1) — for debugging/telemetry
}

// Minimum normalized prose length before we bother matching. Below this the text is too thin to
// produce a meaningful trigram signal (and would risk noisy false positives).
export const KNOWN_ISSUE_MIN_CHARS = 12
// Similarity threshold for surfacing a pre-submit acknowledgment. Deliberately lower than the
// dedup collapse threshold (0.82): here we only nudge ("you might be reporting a known issue"), the
// user still decides. Tuned so paraphrases of the same bug clear it while unrelated prose does not.
export const KNOWN_ISSUE_SIM_THRESHOLD = 0.5

/** Map a raw feedback status (+ regression flag) to a short human label for the composer ack. */
export function statusLabel(status: string, regressed: boolean): string {
  if (regressed) return "reopened"
  switch (status) {
    case "new": return "logged"
    case "open": return "open"
    case "in_progress": return "in progress"
    case "done": return "fixed"
    case "dismissed": return "not planned"
    default: return status || "open"
  }
}

/**
 * Find the closest known/recurring issue for a project given the reporter's in-progress prose.
 * Returns null when the text is too short, no feedback exists, or nothing clears the threshold.
 * Best-effort recurrence enrichment: a minimal DB still yields a usable ack from the head row alone.
 */
export async function findKnownIssue(
  c: Client,
  projectId: string,
  text: string,
  opts: { threshold?: number; limit?: number } = {},
): Promise<KnownIssueMatch | null> {
  const norm = normalizeReportText(text)
  if (norm.length < KNOWN_ISSUE_MIN_CHARS) return null
  const threshold = opts.threshold ?? KNOWN_ISSUE_SIM_THRESHOLD
  const limit = Math.min(200, Math.max(1, opts.limit ?? 80))

  // Recent, non-dismissed feedback for the project. We match the typed prose against each existing
  // report's title + observation. Dismissed ("won't fix") items are excluded — acknowledging them as
  // "known" would be misleading to the reporter.
  const r = await c.execute({
    sql: `SELECT id, observation, suggested_bug_json, status
          FROM feedback
          WHERE project_id=? AND COALESCE(status,'') != 'dismissed'
          ORDER BY created_at DESC LIMIT ?`,
    args: [projectId, limit],
  })

  let best: { id: string; title: string; status: string; score: number } | null = null
  for (const row of r.rows as any[]) {
    let title = ""
    try { title = String(JSON.parse(row.suggested_bug_json || "{}")?.title || "") } catch { title = "" }
    const observation = row.observation != null ? String(row.observation) : ""
    const score = Math.max(lexicalSim(text, title), lexicalSim(text, observation))
    if (!best || score > best.score) {
      best = { id: String(row.id), title: title || observation.slice(0, 90), status: String(row.status || "open"), score }
    }
  }
  if (!best || best.score < threshold) return null

  // Enrich with recurrence memory (count / regressed / amplified headline). Best-effort.
  let count = 1
  let regressed = false
  let headline: string | null = null
  try {
    const mem = await buildRecurrenceMemory(c, best.id, projectId)
    if (mem) {
      count = mem.count
      regressed = mem.regressed
      if (count > 1 || regressed) headline = recurrenceImpact({ count, regressed }).headline
    }
  } catch { /* keep defaults — head-row ack still works on a minimal DB */ }

  return {
    feedbackId: best.id,
    title: best.title || "a similar issue",
    status: best.status,
    statusLabel: statusLabel(best.status, regressed),
    count,
    regressed,
    headline,
    score: best.score,
  }
}
