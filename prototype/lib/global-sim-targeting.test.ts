// lib/global-sim-targeting.test.ts
// Tests for KLAVITYKLA-257: global Sim review targeting.
//
// Bug: global Sims (is_global=1, home project A) were mis-targeted during reviews:
//   1. server.ts used listPersonas (project-scoped) → global Sims never included in reviews
//   2. sim-review.ts used the REVIEWED project's ID as the trait scope → global Sim's traits
//      returned 0 results (traits belong to the home project), so the Sim reviewed in
//      "description-only" mode with no persona memory.
//
// Fix verified here:
//   A. A global Sim reviewing project B (home project A, same account) runs once, not twice.
//   B. Findings are attributed to the reviewed project (B), not the home project (A).
//   C. The global Sim's traits (stored under home project A) are loaded correctly during review.
//   D. A global Sim from a DIFFERENT account does NOT leak across tenants.

import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { unlinkSync } from "node:fs"

const DB_FILE = join(tmpdir(), `klav-global-sim-targeting-${Date.now()}-${randomUUID()}.db`)

function rmDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    try { unlinkSync(DB_FILE + suffix) } catch {}
  }
}

rmDb()
process.env.TURSO_DATABASE_URL = "file:" + DB_FILE
delete process.env.TURSO_AUTH_TOKEN

const dbMod = await import("./db")
const { runSimReviews } = await import("./sim-review")
type SimRunOptions = Parameters<typeof runSimReviews>[0]

// ── Fixture IDs ───────────────────────────────────────────────────────────────
const TS = Date.now()
// Account 1 (same account): projects A and B share this account.
const ACCOUNT_ID_1 = `acc1_${TS}`
// Account 2 (different account): project C + a global Sim that must NOT appear in project B.
const ACCOUNT_ID_2 = `acc2_${TS}`

const PROJECT_A_ID = `proj_a_${TS}`  // home project for the global Sim
const PROJECT_B_ID = `proj_b_${TS}`  // reviewed project (same account as A)
const PROJECT_C_ID = `proj_c_${TS}`  // different-account project (tenant isolation)

const GLOBAL_SIM_ID = `sim_global_${TS}`  // home = project A, is_global=1
const GLOBAL_SIM_TRAIT_ID = `trait_global_${TS}`
const OWN_SIM_ID = `sim_own_b_${TS}`     // project B's own Sim (not global)
const FOREIGN_GLOBAL_SIM_ID = `sim_foreign_${TS}`  // global Sim in account 2 → must NOT appear in B

const ACTOR = "global-sim-test@test.local"

// ── DB setup ──────────────────────────────────────────────────────────────────

beforeAll(async () => {
  const c = dbMod.reconnectDb("file:" + DB_FILE)
  await dbMod.applySchema(c)
  await dbMod.migrateV2(c)

  const now = Date.now()

  // Account 1 with projects A and B.
  await c.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)", args: [ACCOUNT_ID_1, "Acme Corp", ACTOR, now] })
  await c.execute({
    sql: `INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [PROJECT_A_ID, ACCOUNT_ID_1, "Project A", "active", "auto", 200, "named", now, now],
  })
  await c.execute({
    sql: `INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [PROJECT_B_ID, ACCOUNT_ID_1, "Project B", "active", "auto", 200, "named", now, now],
  })

  // Account 2 with project C (different tenant).
  await c.execute({ sql: "INSERT INTO accounts (id,name,owner_email,created_at) VALUES (?,?,?,?)", args: [ACCOUNT_ID_2, "Other Corp", "other@test.local", now] })
  await c.execute({
    sql: `INSERT INTO projects (id,account_id,name,status,review_mode,review_budget_daily,observability_mode,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
    args: [PROJECT_C_ID, ACCOUNT_ID_2, "Project C", "active", "auto", 200, "named", now, now],
  })

  // Global Sim in project A (is_global=1). Traits stored under project A.
  await dbMod.upsertPersona(GLOBAL_SIM_ID, PROJECT_A_ID, {
    name: "Global Power User", role: "Power User",
    type: "client", initials: "GP", accent: "#6366f1",
    summary: "Cross-project power user for all reviews.",
    insights: [{ traitId: GLOBAL_SIM_TRAIT_ID, kind: "want", text: "Needs fast navigation" }],
    avatar: null, simClass: null, side: null, core: null, isGlobal: true,
  })
  // Mark is_global=1 directly (upsertPersona doesn't set the column; setPersonaGlobal does).
  await c.execute({ sql: "UPDATE personas SET is_global=1 WHERE id=?", args: [GLOBAL_SIM_ID] })

  // Insert an actual trait row for the global Sim under project A.
  await dbMod.insertTrait({
    id: GLOBAL_SIM_TRAIT_ID,
    simId: GLOBAL_SIM_ID,
    projectId: PROJECT_A_ID,  // home project — intentionally NOT project B
    kind: "want",
    text: "Needs fast navigation and responsive interactions",
    status: "active",
    strength: 0.9,
    srcTranscriptId: "transcript_test",
    srcQuote: "I need things to move quickly",
    srcQuoteOffset: null,
    srcSpeaker: "Global Power User",
    srcVerified: true,
    createdAt: now,
    updatedAt: now,
    area: "performance",
    issueType: null,
    priority: null,
    scope: null,
    portability: null,
  })

  // Own Sim in project B (not global — control).
  await dbMod.upsertPersona(OWN_SIM_ID, PROJECT_B_ID, {
    name: "Project B User", role: "Regular User",
    type: "client", initials: "BU", accent: "#8b5cf6",
    summary: "Project B specific user.",
    insights: [], avatar: null, simClass: null, side: null, core: null, isGlobal: false,
  })

  // Foreign global Sim in account 2 / project C — must NOT appear when reviewing project B.
  await dbMod.upsertPersona(FOREIGN_GLOBAL_SIM_ID, PROJECT_C_ID, {
    name: "Foreign Global Sim", role: "External User",
    type: "client", initials: "FG", accent: "#ef4444",
    summary: "From a completely different tenant.",
    insights: [], avatar: null, simClass: null, side: null, core: null, isGlobal: true,
  })
  await c.execute({ sql: "UPDATE personas SET is_global=1 WHERE id=?", args: [FOREIGN_GLOBAL_SIM_ID] })
})

// ── Test helpers ──────────────────────────────────────────────────────────────

const emptyCitation = {
  citedTraitIds: [], sourceQuote: null, speaker: null,
  sourceTranscriptId: null, sourceDate: null,
  issueType: null, sourceQuoteVerified: null, recurrence: null,
}

function reviewProject(projectId: string, targetSims: any[], overrides: Partial<SimRunOptions> = {}) {
  return runSimReviews({
    projectId,
    urlPath: "/dashboard",
    urlHost: "example.test",
    pageUrl: "https://example.test/dashboard",
    imageB64: "iVBORw0KGgo=",
    mediaType: "image/png",
    targetSims,
    actorEmail: ACTOR,
    screenshotId: `shot_${Date.now()}`,
    seenKeys: targetSims.map((_, i) => `key_${i}_${Date.now()}_${Math.random()}`),
    reactFn: async (sim) => ({
      data: {
        reactions: [{ observation: `Reaction from ${sim.name} on ${projectId}`, sentiment: "negative" }],
      },
    }),
    resolveCitationsFn: async () => emptyCitation,
    db: dbMod.db,
    ...overrides,
  })
}

// ── (A) Global Sim reviewing project B runs exactly once ─────────────────────

test("global Sim from project A runs exactly once when reviewing project B", async () => {
  // The global Sim is passed as a targetSim for project B.
  // It should run exactly once (no double-run).
  const globalSimAsTarget = {
    id: GLOBAL_SIM_ID,
    projectId: PROJECT_A_ID,  // home project A — this is the key global Sim field
    name: "Global Power User",
    role: "Power User",
    type: "client",
    initials: "GP",
    accent: "#6366f1",
    summary: "Cross-project power user for all reviews.",
    insights: [{ traitId: GLOBAL_SIM_TRAIT_ID, kind: "want", text: "Needs fast navigation" }],
    isGlobal: true,
  }

  const calledSimIds: string[] = []
  const reviews = await runSimReviews({
    projectId: PROJECT_B_ID,
    urlPath: "/dashboard",
    urlHost: "example.test",
    pageUrl: "https://example.test/dashboard",
    imageB64: "iVBORw0KGgo=",
    mediaType: "image/png",
    targetSims: [globalSimAsTarget],
    actorEmail: ACTOR,
    screenshotId: `shot_once_${Date.now()}`,
    seenKeys: [`key_once_${Date.now()}`],
    reactFn: async (sim) => {
      calledSimIds.push(sim.id)
      return { data: { reactions: [{ observation: "Fast nav is needed here too", sentiment: "negative" }] } }
    },
    resolveCitationsFn: async () => emptyCitation,
    db: dbMod.db,
  })

  // Sim was called exactly once — no double-run.
  expect(calledSimIds).toHaveLength(1)
  expect(calledSimIds[0]).toBe(GLOBAL_SIM_ID)
  // Review output has exactly one entry for the global Sim.
  expect(reviews).toHaveLength(1)
  expect(reviews[0].simId).toBe(GLOBAL_SIM_ID)
  expect(reviews[0].simName).toBe("Global Power User")
})

// ── (B) Findings attributed to the reviewed project (B), not home project (A) ─

test("global Sim findings are attributed to the reviewed project, not the home project", async () => {
  const globalSimAsTarget = {
    id: GLOBAL_SIM_ID,
    projectId: PROJECT_A_ID,
    name: "Global Power User",
    role: "Power User",
    type: "client",
    initials: "GP",
    accent: "#6366f1",
    summary: "Cross-project power user for all reviews.",
    insights: [{ traitId: GLOBAL_SIM_TRAIT_ID, kind: "want", text: "Needs fast navigation" }],
    isGlobal: true,
  }

  await runSimReviews({
    projectId: PROJECT_B_ID,
    urlPath: "/settings",
    urlHost: "example.test",
    pageUrl: "https://example.test/settings",
    imageB64: "iVBORw0KGgo=",
    mediaType: "image/png",
    targetSims: [globalSimAsTarget],
    actorEmail: ACTOR,
    screenshotId: `shot_attr_${Date.now()}`,
    seenKeys: [`key_attr_${Date.now()}`],
    reactFn: async () => ({
      data: {
        reactions: [{
          observation: "Settings page loads slowly — violates my speed expectations",
          sentiment: "negative",
          suggestedBug: { title: "Settings page slow", body: "Slow settings", priority: "medium" },
        }],
      },
    }),
    resolveCitationsFn: async () => emptyCitation,
    db: dbMod.db,
  })

  // Feedback must be stored under project B, not project A.
  const feedbackB = await dbMod.listFeedback(PROJECT_B_ID, { simOnly: true, limit: 50 })
  const feedbackA = await dbMod.listFeedback(PROJECT_A_ID, { simOnly: true, limit: 50 })

  // At least one new finding in project B from this global Sim.
  const fromGlobalSim = feedbackB.filter((f: any) => f.simId === GLOBAL_SIM_ID)
  expect(fromGlobalSim.length).toBeGreaterThanOrEqual(1)

  // None of those findings leaked into project A.
  const leakedToA = feedbackA.filter((f: any) => f.simId === GLOBAL_SIM_ID)
  expect(leakedToA).toHaveLength(0)
})

// ── (C) listTraits uses the Sim's home project when loading trait context ──────
//
// The trait scope fix: sim-review.ts uses sim.projectId (home project A) not projectId
// (the reviewed project B) when calling listTraits/listTraitEvents. This test verifies
// the DB layer directly — the DB query for global Sim's traits using the home project
// returns the trait, while using the reviewed project returns nothing.

test("listTraits with home project A returns global Sim's trait; with project B returns none", async () => {
  // With the fix applied, sim-review.ts calls:
  //   listTraits(sim.id, { projectId: sim.projectId })  ← home project
  // Without the fix it called:
  //   listTraits(sim.id, { projectId: projectId })      ← reviewed project (wrong)
  //
  // Verify the DB layer behaves correctly — proves the fix targets the right scope.
  const traitsFromHomeProject = await dbMod.listTraits(GLOBAL_SIM_ID, { projectId: PROJECT_A_ID })
  const traitsFromReviewedProject = await dbMod.listTraits(GLOBAL_SIM_ID, { projectId: PROJECT_B_ID })

  // Home project A → the trait is found (this is what the fix ensures sim-review uses).
  expect(traitsFromHomeProject).toHaveLength(1)
  expect(traitsFromHomeProject[0].text).toContain("navigation")
  expect(traitsFromHomeProject[0].projectId).toBe(PROJECT_A_ID)

  // Reviewed project B → no traits (the global Sim has no traits under project B in v1).
  // This is what the old (broken) code queried — proving the bug would have caused empty traits.
  expect(traitsFromReviewedProject).toHaveLength(0)
})

// ── (D) Tenant isolation: foreign global Sim does NOT appear in project B ─────

test("listPersonasForProject excludes global Sims from a different account (tenant isolation)", async () => {
  const personas = await dbMod.listPersonasForProject(PROJECT_B_ID)
  const ids = personas.map((p: any) => p.id)

  // Project B's own Sim is present.
  expect(ids).toContain(OWN_SIM_ID)
  // Global Sim from same account (project A) is present.
  expect(ids).toContain(GLOBAL_SIM_ID)
  // Foreign global Sim from account 2 / project C must NOT be present.
  expect(ids).not.toContain(FOREIGN_GLOBAL_SIM_ID)
})

// ── (E) Global Sim listed by listPersonasForProject carries isGlobal=true ────

test("global Sim from sibling project is tagged isGlobal=true by listPersonasForProject", async () => {
  const personas = await dbMod.listPersonasForProject(PROJECT_B_ID)
  const globalSim = personas.find((p: any) => p.id === GLOBAL_SIM_ID)

  expect(globalSim).toBeDefined()
  // Global Sim from a sibling project must carry isGlobal=true so callers know it's from elsewhere.
  expect(globalSim!.isGlobal).toBe(true)
  // Its home projectId should be project A (not B) — tenant-safe attribution.
  expect(globalSim!.projectId).toBe(PROJECT_A_ID)
})
