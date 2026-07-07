// KLA-73: unit tests for persona-judged walks.
import { test, expect, describe, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-judge-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema } = await import("./db")
import type { PersonaRow } from "./db"

let db: any
beforeAll(async () => {
  db = reconnectDb("file:" + file)
  await applySchema(db)
})

const {
  createTrail, updateTrail, getTrail,
  recordFinding, recordWalkJudgment, getWalkJudgment, listWalkJudgments,
} = await import("./trails")
const { judgeWalk, JUDGE_SYS } = await import("./trails-judge")
import type { PersonaVerdict } from "./trails-types"

// ── Helpers ───────────────────────────────────────────────────────────────────

const RUN = `${Date.now()}_${Math.random().toString(36).slice(2)}`
const P = (s: string) => `proj_${s}_${RUN}`

function makePersona(overrides: Partial<PersonaRow> = {}): PersonaRow {
  return {
    id: `sim_test_${RUN}`, projectId: P("base"), name: "Alice", role: "product manager",
    type: "client", initials: "AL", accent: "#6366f1", summary: "Outcome-focused PM",
    insights: [], avatar: null, createdAt: Date.now(), updatedAt: Date.now(),
    simClass: "client", side: "internal",
    core: {
      goals: ["reduce time-to-value", "clear error states"],
      expertise: "domain expert in checkout flows",
      temperament: "direct and impatient",
      voice: "I need to see results, not excuses.",
      watchFor: ["broken CTAs", "unclear error messages"],
    },
    ...overrides,
  }
}

// ── JUDGE_SYS sanity ──────────────────────────────────────────────────────────

describe("JUDGE_SYS prompt", () => {
  test("contains the three verdict options", () => {
    expect(JUDGE_SYS).toContain('"valid"')
    expect(JUDGE_SYS).toContain('"false_positive"')
    expect(JUDGE_SYS).toContain('"clarify"')
  })

  test("describes simClass adaptation", () => {
    expect(JUDGE_SYS).toContain('simClass "client"')
    expect(JUDGE_SYS).toContain('simClass "user"')
  })

  test("requests JSON-only response with expected shape", () => {
    expect(JUDGE_SYS).toContain('"verdicts"')
    expect(JUDGE_SYS).toContain('"overall_note"')
    expect(JUDGE_SYS).toContain('"findingId"')
    expect(JUDGE_SYS).toContain('"rationale"')
  })
})

// ── DB round-trip ─────────────────────────────────────────────────────────────

describe("recordWalkJudgment / getWalkJudgment", () => {
  const projectId = P("rtrip")
  const runId = `walk_rtrip_${RUN}`

  test("records and retrieves a judgment", async () => {
    const verdicts: PersonaVerdict[] = [
      { findingId: "find_1", verdict: "valid", confidence: 0.9, rationale: "CTA is broken" },
      { findingId: "find_2", verdict: "false_positive", confidence: 0.8, rationale: "Timing issue only" },
    ]
    await recordWalkJudgment(projectId, {
      runId, personaId: "sim_test01", personaName: "Alice",
      verdicts, overallNote: "Two findings, one real.",
    })
    const j = await getWalkJudgment(projectId, runId)
    expect(j).not.toBeNull()
    expect(j!.personaId).toBe("sim_test01")
    expect(j!.personaName).toBe("Alice")
    expect(j!.verdicts).toHaveLength(2)
    expect(j!.verdicts[0].verdict).toBe("valid")
    expect(j!.overallNote).toBe("Two findings, one real.")
  })

  test("returns null when no judgment exists", async () => {
    const result = await getWalkJudgment(projectId, "walk_nosuchrun")
    expect(result).toBeNull()
  })

  test("listWalkJudgments returns newest first", async () => {
    const runId2 = `walk_list_${RUN}`
    await recordWalkJudgment(projectId, { runId: runId2, personaId: "sim_a", personaName: "A", verdicts: [], overallNote: "first" })
    await recordWalkJudgment(projectId, { runId: runId2, personaId: "sim_b", personaName: "B", verdicts: [], overallNote: "second" })
    const list = await listWalkJudgments(projectId, runId2)
    expect(list.length).toBeGreaterThanOrEqual(2)
    expect(list[0].overallNote).toBe("second")
  })
})

// ── Trail judgePersonaId ──────────────────────────────────────────────────────

describe("Trail judgePersonaId", () => {
  const projectId = P("trailj")

  test("createTrail yields null judgePersonaId", async () => {
    const trailId = await createTrail(projectId, { name: "Login flow", baseUrl: "https://example.com" })
    const trail = await getTrail(projectId, trailId)
    expect(trail).not.toBeNull()
    expect(trail!.judgePersonaId).toBeNull()
  })

  test("updateTrail can set and clear judgePersonaId", async () => {
    const trailId = await createTrail(projectId, { name: "Checkout", baseUrl: "https://example.com" })
    await updateTrail(projectId, trailId, { judgePersonaId: "sim_xyz" })
    const updated = await getTrail(projectId, trailId)
    expect(updated!.judgePersonaId).toBe("sim_xyz")
    await updateTrail(projectId, trailId, { judgePersonaId: null })
    const cleared = await getTrail(projectId, trailId)
    expect(cleared!.judgePersonaId).toBeNull()
  })
})

// ── judgeWalk with mock LLM ───────────────────────────────────────────────────

describe("judgeWalk", () => {
  const projectId = P("jwalk")

  async function seedWalkWithFindings(): Promise<{ runId: string; trailId: string; findingIds: string[] }> {
    const trailId = `trl_jw_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const runId = `walk_jw_${Date.now()}_${Math.random().toString(36).slice(2)}`
    await db.execute({
      sql: `INSERT INTO trails (id, project_id, name, intent, base_url, author_kind, status, created_at, updated_at)
            VALUES (?, ?, 'Test', '', 'https://x.com', 'human', 'active', ?, ?)`,
      args: [trailId, projectId, Date.now(), Date.now()],
    })
    await db.execute({
      sql: `INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, started_at)
            VALUES (?, ?, ?, 'manual', 'red', 0, ?)`,
      args: [runId, trailId, projectId, Date.now()],
    })
    const f1 = await recordFinding(projectId, {
      runId, trailId, kind: "regression", title: "CTA button missing",
      confidence: 0.95, dedupKey: `dk_cta_${Date.now()}_${Math.random()}`,
    })
    const f2 = await recordFinding(projectId, {
      runId, trailId, kind: "visual", title: "Layout shift on load",
      confidence: 0.75, dedupKey: `dk_layout_${Date.now()}_${Math.random()}`,
    })
    return { runId, trailId, findingIds: [f1.id, f2.id] }
  }

  test("judgeWalk returns WalkJudgment with verdicts for all findings", async () => {
    const { runId, findingIds } = await seedWalkWithFindings()
    const persona = makePersona()

    const mockLlm = async (_sys: string, _user: string) => ({
      verdicts: [
        { findingId: findingIds[0], verdict: "valid" as const, confidence: 0.92, rationale: "Broken CTA = broken outcome." },
        { findingId: findingIds[1], verdict: "clarify" as const, confidence: 0.6, rationale: "Need screenshot to confirm." },
      ],
      overall_note: "One real regression, one unclear.",
    })

    const judgment = await judgeWalk({ projectId, runId, persona, llmFn: mockLlm })

    expect(judgment.runId).toBe(runId)
    expect(judgment.personaId).toBe(persona.id)
    expect(judgment.verdicts).toHaveLength(2)
    expect(judgment.verdicts[0].verdict).toBe("valid")
    expect(judgment.verdicts[1].verdict).toBe("clarify")
    expect(judgment.overallNote).toBe("One real regression, one unclear.")
  })

  test("judgeWalk filters out verdicts with unknown findingIds", async () => {
    const { runId, findingIds } = await seedWalkWithFindings()
    const persona = makePersona()

    const mockLlm = async () => ({
      verdicts: [
        { findingId: findingIds[0], verdict: "valid" as const, confidence: 0.9, rationale: "Real." },
        { findingId: "find_BOGUS_XYZ", verdict: "valid" as const, confidence: 0.5, rationale: "Hallucinated." },
      ],
      overall_note: null,
    })

    const judgment = await judgeWalk({ projectId, runId, persona, llmFn: mockLlm })
    expect(judgment.verdicts).toHaveLength(1)
    expect(judgment.verdicts[0].findingId).toBe(findingIds[0])
  })

  test("judgeWalk handles a walk with no findings (all-green)", async () => {
    const trailId = `trl_green_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const runId = `walk_green_${Date.now()}_${Math.random().toString(36).slice(2)}`
    await db.execute({
      sql: `INSERT INTO trails (id, project_id, name, intent, base_url, author_kind, status, created_at, updated_at)
            VALUES (?, ?, 'Green', '', 'https://x.com', 'human', 'active', ?, ?)`,
      args: [trailId, projectId, Date.now(), Date.now()],
    })
    await db.execute({
      sql: `INSERT INTO trail_runs (id, trail_id, project_id, trigger, status, llm_calls, started_at)
            VALUES (?, ?, ?, 'manual', 'green', 0, ?)`,
      args: [runId, trailId, projectId, Date.now()],
    })

    const persona = makePersona()
    const mockLlm = async () => ({ verdicts: [], overall_note: null })

    const judgment = await judgeWalk({ projectId, runId, persona, llmFn: mockLlm })
    expect(judgment.verdicts).toHaveLength(0)
    expect(judgment.overallNote).toContain("No findings")
  })

  test("judgeWalk throws for an unknown runId", async () => {
    const persona = makePersona()
    const mockLlm = async () => ({ verdicts: [], overall_note: null })
    await expect(judgeWalk({ projectId, runId: "walk_NOTREAL", persona, llmFn: mockLlm })).rejects.toThrow("not found")
  })
})
