// Sim v3 runtime wiring — DB persistence tests for the new persona core / classification fields
// and the trait scope/portability columns.
// Covers: (1) migration adds the columns, (2) upsertPersona + listPersonas round-trip of
// simClass/side/core, (3) insertTrait/updateTrait + listTraits round-trip of scope/portability,
// (4) applyReconcileOps carries scope/portability onto the persisted trait rows, and
// (5) ensureTraitsSeeded carries scope/portability from cached insights onto seeded traits.
// Hermetic pattern: set TURSO_DATABASE_URL to a local file BEFORE importing ./db.
import { test, expect, beforeAll, afterAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { unlinkSync } from "node:fs"
import { applyReconcileOps, type ReconcileOp } from "./provenance"

const DB_FILE = join(tmpdir(), `klav-pfv3-${Date.now()}-${randomUUID()}.db`)
function rmDb() {
  for (const s of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + s) } catch {} }
}

// All test files share ONE Bun process + one `db` singleton. Re-point it at our own file in a
// beforeAll (the reconnectDb pattern) so tests are ORDER-INDEPENDENT even when a sibling hermetic
// file owns the singleton first and deletes its file in afterAll (SQLITE_READONLY_DBMOVED otherwise).
async function loadDb() {
  const m = await import("./db")
  m.reconnectDb("file:" + DB_FILE)
  await m.applySchema(m.db!)
  await m.migrateV2(m.db!)
  return m
}
beforeAll(loadDb)
afterAll(rmDb)

const RUN = `${Date.now()}_${Math.random().toString(36).slice(2)}`
const S = (s: string) => `sim_pfv3_${s}_${RUN}`
const PR = (s: string) => `proj_pfv3_${s}_${RUN}`
const PROJ = PR("1")
const NOW = 7000

async function cols(m: any, table: string): Promise<Set<string>> {
  const r = await m.db!.execute(`PRAGMA table_info(${table})`)
  return new Set(r.rows.map((x: any) => String(x.name)))
}

// -- test 1: migration adds the new columns -----------------------------------
test("migration: personas gains v3 core/classification cols; sim_traits gains scope/portability", async () => {
  const m = await loadDb()
  const personaCols = await cols(m, "personas")
  for (const c of ["sim_class", "side", "goals_json", "expertise", "temperament", "voice", "watchfor_json"]) {
    expect(personaCols.has(c)).toBe(true)
  }
  const traitCols = await cols(m, "sim_traits")
  expect(traitCols.has("scope")).toBe(true)
  expect(traitCols.has("portability")).toBe(true)
})

// -- test 2: upsertPersona + listPersonas round-trip simClass/side/core --------
test("upsertPersona + listPersonas: simClass/side/core persisted and returned", async () => {
  const m = await loadDb()
  const id = S("full")
  await m.upsertPersona(id, PROJ, {
    name: "Dana Client", role: "VP Finance", type: "client",
    initials: "DC", accent: "#6366f1", summary: "outcome-focused buyer",
    insights: [], avatar: null,
    simClass: "client", side: "external",
    core: {
      goals: ["forecast spend accurately", "cut month-end close time"],
      expertise: "expert (finance) - intermediate (product)",
      temperament: "impatient; wants the number, not the tour",
      voice: "just show me where the money's going",
      watchFor: ["trustworthy totals", "audit trail"],
    },
  })
  const saved = (await m.listPersonas(PROJ)).find((p: any) => p.id === id)
  expect(saved).toBeTruthy()
  expect(saved!.simClass).toBe("client")
  expect(saved!.side).toBe("external")
  expect(saved!.type).toBe("client")
  expect(saved!.core).toBeTruthy()
  expect(saved!.core!.goals).toEqual(["forecast spend accurately", "cut month-end close time"])
  expect(saved!.core!.watchFor).toEqual(["trustworthy totals", "audit trail"])
  expect(saved!.core!.expertise).toContain("finance")
  expect(saved!.core!.voice).toContain("money")
})

// A legacy persona with no v3 fields comes back with null simClass/side and null core.
test("listPersonas: legacy persona (no v3 fields) → null simClass/side/core", async () => {
  const m = await loadDb()
  const id = S("legacy")
  await m.upsertPersona(id, PROJ, {
    name: "Old Sim", role: "user", type: "client",
    initials: "OS", accent: "#111111", summary: "pre-v3",
    insights: [], avatar: null,
  })
  const saved = (await m.listPersonas(PROJ)).find((p: any) => p.id === id)
  expect(saved).toBeTruthy()
  expect(saved!.simClass).toBeNull()
  expect(saved!.side).toBeNull()
  expect(saved!.core).toBeNull()
})

// -- test 3: insertTrait/updateTrait + listTraits round-trip scope/portability -
test("insertTrait + updateTrait + listTraits: scope/portability persisted and returned", async () => {
  const m = await loadDb()
  const sim = S("traits")
  const t1 = {
    id: "trait_" + randomUUID(), simId: sim, projectId: PROJ, kind: "pain" as const,
    text: "checkout button hidden", status: "active" as const, strength: 1,
    srcTranscriptId: "tr", srcQuote: "q", srcQuoteOffset: null, srcSpeaker: null,
    createdAt: NOW, updatedAt: NOW, area: "checkout", issueType: "layout", severity: "high",
    scope: "ui", portability: "site-specific",
  }
  const t2 = {
    ...t1, id: "trait_" + randomUUID(), text: "wants bulk export",
    scope: null, portability: null, issueType: null, severity: null, area: null,
  }
  await m.insertTrait(t1)
  await m.insertTrait(t2)
  let traits = await m.listTraits(sim)
  const f1 = traits.find((t: any) => t.id === t1.id)
  const f2 = traits.find((t: any) => t.id === t2.id)
  expect(f1!.scope).toBe("ui")
  expect(f1!.portability).toBe("site-specific")
  expect(f2!.scope).toBeNull()
  expect(f2!.portability).toBeNull()

  // updateTrait rewrites scope/portability
  await m.updateTrait({ ...t1, scope: "feature", portability: "portable", updatedAt: NOW + 5 })
  traits = await m.listTraits(sim)
  const u = traits.find((t: any) => t.id === t1.id)
  expect(u!.scope).toBe("feature")
  expect(u!.portability).toBe("portable")
})

// -- test 4: applyReconcileOps → persisted trait rows carry scope/portability --
test("applyReconcileOps writes: scope/portability flow through TraitWrite to sim_traits", async () => {
  const m = await loadDb()
  const sim = S("reconcile")
  const ops: ReconcileOp[] = [
    {
      op: "add", kind: "want", text: "role-based approvals",
      quote: "we need managers to sign off", speaker: "Dana",
      area: "permissions", issueType: "flow", severity: "medium",
      scope: "workflow", portability: "portable",
    },
  ]
  const res = applyReconcileOps([], ops, {
    simId: sim, projectId: PROJ, transcriptId: "tr_x", sourceDate: NOW, rawText: "we need managers to sign off", now: NOW,
    newId: () => "trait_" + randomUUID(),
  })
  for (const w of res.traitWrites) {
    if (w.mode === "insert") await m.insertTrait(w.trait)
    else await m.updateTrait(w.trait)
  }
  const traits = await m.listTraits(sim)
  expect(traits.length).toBe(1)
  expect(traits[0].scope).toBe("workflow")
  expect(traits[0].portability).toBe("portable")
})

// -- test 5: ensureTraitsSeeded carries scope/portability from cached insights -
test("ensureTraitsSeeded: legacy insights' scope/portability seed onto trait rows", async () => {
  const m = await loadDb()
  const sim = S("seed")
  await m.upsertPersona(sim, PROJ, {
    name: "Seed Sim", role: "user", type: "client",
    initials: "SS", accent: "#222222", summary: "seed",
    insights: [
      { kind: "pain", text: "slow dashboard", quote: "it takes forever", scope: "ui", portability: "site-specific", issueType: "performance", severity: "high" },
      { kind: "want", text: "SSO login", quote: "we use Okta", scope: "feature", portability: "portable" },
    ],
    avatar: null,
  })
  const seeded = await m.ensureTraitsSeeded(sim)
  expect(seeded).toBe(2)
  const traits = await m.listTraits(sim)
  const pain = traits.find((t: any) => t.kind === "pain")
  const want = traits.find((t: any) => t.kind === "want")
  expect(pain!.scope).toBe("ui")
  expect(pain!.portability).toBe("site-specific")
  expect(want!.scope).toBe("feature")
  expect(want!.portability).toBe("portable")
})
