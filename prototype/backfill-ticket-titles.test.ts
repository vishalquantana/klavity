// KLA-561 — tests for the one-off ticket-title backfill script.
//
// Covers: (1) the PURE row-selection predicate feedbackRowNeedsTitle (explicit title / suggested_bug
// title / prose / URL-only / empty), and (2) the runBackfill flow against a temp libSQL file DB with an
// INJECTED fake LLM (no network, no budget table touched): dry-run writes NOTHING, --apply writes only
// the eligible prose row and never clobbers a human/suggested-bug title.

import { test, expect, describe, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { unlinkSync } from "node:fs"

const RUN = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const DB = join(tmpdir(), `klav-backfill-title-${RUN}.db`)
function rmDb() { for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB + s) } catch {} } }
rmDb()

process.env.TURSO_DATABASE_URL = "file:" + DB
process.env.TURSO_AUTH_TOKEN = ""
// Ensure no OpenRouter key leaks into the run — tests inject their own fake LLM.
delete process.env.OPENROUTER_API_KEY

const dbMod = await import("./lib/db")
const bf = await import("./scripts/backfill-ticket-titles")

const PROJ = "proj_bf_" + RUN
const OTHER = "proj_other_" + RUN
let ids: Record<string, string> = {}

async function insertFeedback(o: { projectId: string; observation: string | null; title?: string | null; suggestedBugJson?: string | null }): Promise<string> {
  const id = "fb_" + Math.random().toString(36).slice(2)
  await dbMod.db!.execute({
    sql: "INSERT INTO feedback (id, project_id, observation, title, suggested_bug_json, created_at) VALUES (?,?,?,?,?,?)",
    args: [id, o.projectId, o.observation, o.title ?? null, o.suggestedBugJson ?? null, Date.now()],
  })
  return id
}

beforeAll(async () => {
  await dbMod.initDb()
  ids.prose = await insertFeedback({ projectId: PROJ, observation: "The save button spins forever and never confirms the change" })
  ids.explicit = await insertFeedback({ projectId: PROJ, observation: "Some body text describing a bug in detail", title: "Human wrote this title" })
  ids.suggested = await insertFeedback({ projectId: PROJ, observation: "Body text about a crash on submit", suggestedBugJson: JSON.stringify({ title: "Suggested bug title" }) })
  ids.empty = await insertFeedback({ projectId: PROJ, observation: "" })
  ids.urlOnly = await insertFeedback({ projectId: PROJ, observation: "https://example.com/only-a-link" })
  ids.other = await insertFeedback({ projectId: OTHER, observation: "A different project prose report about a broken flow" })
})
afterAll(() => { rmDb() })

describe("feedbackRowNeedsTitle (pure predicate)", () => {
  const row = (p: Partial<import("./scripts/backfill-ticket-titles").FeedbackTitleRow>) => ({
    id: "x", projectId: "p", title: null, observation: null, suggestedBugJson: null, ...p,
  })
  test("prose body with empty title ⇒ needs a title", () => {
    expect(bf.feedbackRowNeedsTitle(row({ observation: "The dashboard hangs on load" }))).toBe(true)
  })
  test("explicit human title ⇒ skip", () => {
    expect(bf.feedbackRowNeedsTitle(row({ title: "My title", observation: "body" }))).toBe(false)
  })
  test("whitespace-only title is treated as empty ⇒ needs a title", () => {
    expect(bf.feedbackRowNeedsTitle(row({ title: "   ", observation: "A real bug report body" }))).toBe(true)
  })
  test("suggested_bug title ⇒ skip", () => {
    expect(bf.feedbackRowNeedsTitle(row({ observation: "body", suggestedBugJson: JSON.stringify({ title: "SB" }) }))).toBe(false)
  })
  test("empty observation ⇒ skip", () => {
    expect(bf.feedbackRowNeedsTitle(row({ observation: "" }))).toBe(false)
  })
  test("URL-only body distils to empty ⇒ skip", () => {
    expect(bf.feedbackRowNeedsTitle(row({ observation: "https://example.com/x" }))).toBe(false)
  })
})

// Fake LLM: returns a JSON title derived from the input so the pipeline runs deterministically offline.
const fakeLlm = async (input: string) => JSON.stringify({ title: "FAKE: " + (input.split("\n")[0] || "").slice(0, 40) })

describe("runBackfill", () => {
  test("dry-run selects only the eligible prose rows and writes NOTHING", async () => {
    const s = await bf.runBackfill({ apply: false, projectId: PROJ, llm: fakeLlm, log: () => {} })
    expect(s.dryRun).toBe(true)
    expect(s.llmKind).toBe("injected")
    // Only the single prose row in PROJ is eligible (explicit/suggested/empty/url-only are skipped).
    expect(s.scanned).toBe(1)
    expect(s.titled).toBe(1)
    // Nothing persisted.
    const r = await dbMod.db!.execute({ sql: "SELECT title FROM feedback WHERE id=?", args: [ids.prose] })
    expect((r.rows[0] as any).title).toBeNull()
  })

  test("--apply writes the title for the eligible row only", async () => {
    const s = await bf.runBackfill({ apply: true, projectId: PROJ, llm: fakeLlm, log: () => {} })
    expect(s.dryRun).toBe(false)
    expect(s.titled).toBe(1)

    const prose = await dbMod.db!.execute({ sql: "SELECT title FROM feedback WHERE id=?", args: [ids.prose] })
    expect(String((prose.rows[0] as any).title)).toContain("FAKE:")

    // Human + suggested-bug titles never clobbered.
    const explicit = await dbMod.db!.execute({ sql: "SELECT title FROM feedback WHERE id=?", args: [ids.explicit] })
    expect((explicit.rows[0] as any).title).toBe("Human wrote this title")
    const suggested = await dbMod.db!.execute({ sql: "SELECT title FROM feedback WHERE id=?", args: [ids.suggested] })
    expect((suggested.rows[0] as any).title).toBeNull() // untouched (renders via suggested_bug title)
  })

  test("re-running --apply is idempotent (already-titled row skipped)", async () => {
    const s = await bf.runBackfill({ apply: true, projectId: PROJ, llm: fakeLlm, log: () => {} })
    expect(s.scanned).toBe(0) // the prose row now has a title → no longer a candidate
    expect(s.titled).toBe(0)
  })

  test("--project scopes the run", async () => {
    const s = await bf.runBackfill({ apply: false, projectId: OTHER, llm: fakeLlm, log: () => {} })
    expect(s.scanned).toBe(1)
  })
})
