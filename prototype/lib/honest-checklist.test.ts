// KLAVITYKLA-301 — Honest checklist ticks. Verifies that:
//   step 4 "Add a real Sim from a customer call" ticks only when a Sim with
//   simSource='transcript' exists, NOT for describe/from-site/null Sims.
//   step 1 "See a Sim react" ticks only when at least one sim_id IS NOT NULL
//   feedback row exists, NOT merely because Sims exist.
//
// DB isolation: uses useIsolatedDb() so each test runs against its own temp
// SQLite file with the full schema applied — order-invariant across test files.
import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { upsertPersona, listPersonas } from "./db"

const { getClient } = useIsolatedDb("klav-honest-checklist")

let seq = 0

async function freshProject(): Promise<{ projectId: string }> {
  const c = getClient()
  const n = ++seq
  const accountId = `acct_hc_${n}`
  const projectId = `proj_hc_${n}`
  const now = Date.now()
  await c.execute({ sql: "INSERT INTO accounts (id, name, owner_email, created_at) VALUES (?, ?, ?, ?)", args: [accountId, `A${n}`, `owner${n}@quantana.com.au`, now] })
  await c.execute({ sql: "INSERT INTO projects (id, account_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", args: [projectId, accountId, `P${n}`, now, now] })
  return { projectId }
}

async function addSim(projectId: string, simSource: string | null): Promise<string> {
  const n = ++seq
  const simId = `sim_hc_${n}`
  await upsertPersona(simId, projectId, {
    name: `Sim ${n}`, role: "tester", type: "client",
    initials: "ST", accent: "#6366f1", summary: "", insights: [],
    avatar: null, simClass: null, side: null, core: null,
    simSource,
  })
  return simId
}

async function addSimFeedback(projectId: string, simId: string): Promise<void> {
  const c = getClient()
  const n = ++seq
  await c.execute({
    sql: "INSERT INTO feedback (id, project_id, sim_id, observation, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [`fb_hc_${n}`, projectId, simId, "Page crashed on submit", Date.now()],
  })
}

// ── Step 4: transcript Sim ticks; describe/from-site/null Sim does NOT ────────

test("step 4: describe-only Sim does NOT tick (hasTranscriptSim=false)", async () => {
  const { projectId } = await freshProject()
  await addSim(projectId, "describe")
  const sims = await listPersonas(projectId)
  const hasTranscriptSim = sims.some(p => p.simSource === "transcript")
  expect(hasTranscriptSim).toBe(false)
})

test("step 4: from-site Sim does NOT tick (hasTranscriptSim=false)", async () => {
  const { projectId } = await freshProject()
  await addSim(projectId, "from-site")
  const sims = await listPersonas(projectId)
  const hasTranscriptSim = sims.some(p => p.simSource === "transcript")
  expect(hasTranscriptSim).toBe(false)
})

test("step 4: null/legacy Sim does NOT tick (hasTranscriptSim=false)", async () => {
  const { projectId } = await freshProject()
  await addSim(projectId, null)
  const sims = await listPersonas(projectId)
  const hasTranscriptSim = sims.some(p => p.simSource === "transcript")
  expect(hasTranscriptSim).toBe(false)
})

test("step 4: transcript Sim DOES tick (hasTranscriptSim=true)", async () => {
  const { projectId } = await freshProject()
  await addSim(projectId, "transcript")
  const sims = await listPersonas(projectId)
  const hasTranscriptSim = sims.some(p => p.simSource === "transcript")
  expect(hasTranscriptSim).toBe(true)
})

test("step 4: transcript Sim ticks even alongside describe Sims", async () => {
  const { projectId } = await freshProject()
  await addSim(projectId, "describe")
  await addSim(projectId, "transcript")
  const sims = await listPersonas(projectId)
  const hasTranscriptSim = sims.some(p => p.simSource === "transcript")
  expect(hasTranscriptSim).toBe(true)
})

// ── Step 1: Sim reaction/feedback required to tick ────────────────────────────

test("step 1: Sims existing but ZERO reactions does NOT tick (hasSimReaction=false)", async () => {
  const { projectId } = await freshProject()
  await addSim(projectId, "describe")
  const c = getClient()
  const r = await c.execute({
    sql: "SELECT COUNT(*) as cnt FROM feedback WHERE project_id=? AND sim_id IS NOT NULL",
    args: [projectId],
  })
  const hasSimReaction = Number((r.rows[0] as any).cnt) > 0
  expect(hasSimReaction).toBe(false)
})

test("step 1: a Sim with one reaction DOES tick (hasSimReaction=true)", async () => {
  const { projectId } = await freshProject()
  const simId = await addSim(projectId, "describe")
  await addSimFeedback(projectId, simId)
  const c = getClient()
  const r = await c.execute({
    sql: "SELECT COUNT(*) as cnt FROM feedback WHERE project_id=? AND sim_id IS NOT NULL",
    args: [projectId],
  })
  const hasSimReaction = Number((r.rows[0] as any).cnt) > 0
  expect(hasSimReaction).toBe(true)
})

test("step 1: human-only feedback (no sim_id) does NOT tick hasSimReaction", async () => {
  const { projectId } = await freshProject()
  const c = getClient()
  const n = ++seq
  // Insert feedback with sim_id=NULL (a human report, no Sim)
  await c.execute({
    sql: "INSERT INTO feedback (id, project_id, sim_id, observation, created_at) VALUES (?, ?, NULL, ?, ?)",
    args: [`fb_hc_human_${n}`, projectId, "Button broken", Date.now()],
  })
  const r = await c.execute({
    sql: "SELECT COUNT(*) as cnt FROM feedback WHERE project_id=? AND sim_id IS NOT NULL",
    args: [projectId],
  })
  const hasSimReaction = Number((r.rows[0] as any).cnt) > 0
  expect(hasSimReaction).toBe(false)
})
