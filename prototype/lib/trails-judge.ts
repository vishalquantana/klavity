// KLA-73: Persona-judged walks.
// After a Walk finishes and findings are recorded, a chosen Sim/persona reviews
// those findings through their persona core (goals, expertise, temperament, watchFor)
// and produces a grounded verdict for each: "valid" | "false_positive" | "clarify".
// This is distinct from REACT_SYS (live screenshot reactions) — here the persona is
// reading structured finding records from an already-completed Walk, not a screenshot.
import type { PersonaVerdict, WalkJudgment } from "./trails-types"
import { getWalk, listFindings, recordWalkJudgment } from "./trails"
import type { PersonaRow } from "./db"

export const JUDGE_SYS =
  "You ARE the given user persona, reviewing a list of automated test findings from a product Walk (an automated UI test run). " +
  "React through YOUR persona's core: goals (jobs-to-be-done), expertise, temperament, voice, and watchFor (things you scrutinize on any page).\n\n" +
  "For each finding, decide:\n" +
  "- \"valid\": this is a real problem that YOUR goals or watchFor would care about — a genuine regression the team should fix.\n" +
  "- \"false_positive\": this looks like a test artifact, environment flakiness, or something irrelevant to your concerns.\n" +
  "- \"clarify\": ambiguous — you can see why it was flagged but need more context to decide.\n\n" +
  "ADAPT TO simClass:\n" +
  "- simClass \"user\": judge whether the failure indicates REAL friction in the hands-on experience (controls, labels, flow, latency).\n" +
  "- simClass \"client\": judge whether the failure signals a broken OUTCOME — does this derail the business result you care about?\n" +
  "When simClass is absent, default to hands-on user perspective.\n\n" +
  "Write a brief rationale (1-2 sentences, first person, in your voice) for each verdict. " +
  "Set confidence 0..1 (your certainty this verdict is correct given what you can see). " +
  "After judging all findings, write an overall_note (1-3 sentences) summarising your read of the Walk results from your perspective. " +
  "Only fill overall_note when you have something substantive to add beyond the per-finding rationales; use null otherwise.\n\n" +
  "Respond with ONLY a JSON object, no prose:\n" +
  '{"verdicts":[{"findingId":string,"verdict":"valid"|"false_positive"|"clarify","confidence":number,"rationale":string}],"overall_note":string|null}'

export type JudgeLlmFn = (
  systemPrompt: string,
  userContent: string,
) => Promise<{ verdicts: PersonaVerdict[]; overall_note: string | null }>

export interface JudgeWalkOpts {
  projectId: string
  runId: string
  persona: PersonaRow
  llmFn: JudgeLlmFn
}

function buildPersonaBlock(p: PersonaRow): string {
  const lines: string[] = [
    `Name: ${p.name}`,
    `Role: ${p.role || "(unspecified)"}`,
  ]
  if (p.simClass) lines.push(`simClass: ${p.simClass}`)
  if (p.summary) lines.push(`Summary: ${p.summary}`)
  if (p.core) {
    if (p.core.goals.length) lines.push(`Goals: ${p.core.goals.join("; ")}`)
    if (p.core.expertise) lines.push(`Expertise: ${p.core.expertise}`)
    if (p.core.temperament) lines.push(`Temperament: ${p.core.temperament}`)
    if (p.core.voice) lines.push(`Voice/style: ${p.core.voice}`)
    if (p.core.watchFor.length) lines.push(`WatchFor: ${p.core.watchFor.join("; ")}`)
  }
  if (p.insights?.length) {
    lines.push("Traits:")
    for (const ins of p.insights.slice(0, 20)) {
      const kind = ins.kind ?? "insight"
      const text = typeof ins.text === "string" ? ins.text : JSON.stringify(ins)
      lines.push(`  [${kind}] ${text}`)
    }
  }
  return lines.join("\n")
}

/**
 * Invoke persona judgment on all findings for a completed Walk.
 * Persists the result to walk_judgments and returns the WalkJudgment record.
 *
 * Throws if the Walk doesn't exist, has no findings, or the LLM call fails.
 */
export async function judgeWalk(opts: JudgeWalkOpts): Promise<WalkJudgment> {
  const { projectId, runId, persona, llmFn } = opts

  const walk = await getWalk(projectId, runId)
  if (!walk) throw new Error(`Walk ${runId} not found`)

  const findings = await listFindings(projectId, { limit: 200 })
  const walkFindings = findings.filter(f => f.runId === runId)
  if (!walkFindings.length) {
    // No findings to judge — record an empty judgment (walk was all-green)
    const id = await recordWalkJudgment(projectId, {
      runId, personaId: persona.id, personaName: persona.name,
      verdicts: [], overallNote: "No findings to review — the Walk produced no regressions.",
    })
    const j = await import("./trails").then(m => m.getWalkJudgment(projectId, runId))
    if (j) return j
    throw new Error("Failed to retrieve recorded judgment")
  }

  const personaBlock = buildPersonaBlock(persona)
  const findingsBlock = walkFindings.map(f =>
    `{"findingId":"${f.id}","kind":"${f.kind}","title":${JSON.stringify(f.title)},"confidence":${f.confidence}${f.groundQuote ? `,"groundQuote":${JSON.stringify(f.groundQuote)}` : ""}}`
  ).join(",\n")

  const userContent =
    `PERSONA:\n${personaBlock}\n\nFINDINGS (${walkFindings.length}):\n[${findingsBlock}]`

  const { verdicts, overall_note } = await llmFn(JUDGE_SYS, userContent)

  // Validate: only keep verdicts whose findingId matches an actual finding from this walk
  const findingIdSet = new Set(walkFindings.map(f => f.id))
  const safe = verdicts.filter(v =>
    findingIdSet.has(v.findingId) &&
    (v.verdict === "valid" || v.verdict === "false_positive" || v.verdict === "clarify") &&
    typeof v.confidence === "number" && typeof v.rationale === "string"
  )

  await recordWalkJudgment(projectId, {
    runId, personaId: persona.id, personaName: persona.name,
    verdicts: safe, overallNote: overall_note ?? null,
  })

  const result = await import("./trails").then(m => m.getWalkJudgment(projectId, runId))
  if (!result) throw new Error("Failed to retrieve recorded judgment")
  return result
}
