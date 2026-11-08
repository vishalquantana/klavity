// Visual-QA validations: persistence across every creation path, Baseline QA provisioning, edit/reload, non-QA regression.
// Hermetic file-backed libsql DB (same pattern as baseline-qa-sim.test.ts).
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import { unlinkSync } from "node:fs"

const DB_FILE = join(tmpdir(), `klav-sim-validations-${Date.now()}-${randomUUID()}.db`)
for (const sfx of ["", "-wal", "-shm"]) { try { unlinkSync(DB_FILE + sfx) } catch { } }
process.env.TURSO_DATABASE_URL = "file:" + DB_FILE
delete process.env.TURSO_AUTH_TOKEN

const dbMod = await import("./lib/db")
const { enrichQaPersona, CATEGORY_IDS, canonicalValidations } = await import("./lib/sim-validations")
const { runSimReviews } = await import("./lib/sim-review")
const client = dbMod.reconnectDb("file:" + DB_FILE)
let projectId = ""

beforeAll(async () => {
  await dbMod.applySchema(client)
  await dbMod.migrateV2(client)
  const ms = await dbMod.ensureAccount("owner@validations.test")
  projectId = ms[0].projectId ?? ("proj_" + ms[0].workspaceId)
})

const base = (name: string, extra: any = {}) => ({
  name, role: "Reviewer", type: "internal", initials: "XX", accent: "#111111", summary: "Custom brief: be thorough.", insights: [], avatar: null,
  simClass: "user", side: "internal",
  core: { goals: ["find defects"], expertise: "qa", temperament: "calm", voice: "plain", watchFor: ["typos"] }, ...extra,
})
const get = async (id: string) => (await dbMod.listPersonas(projectId)).find((p: any) => p.id === id)!

// Each Add-a-Sim path ends in upsertPersona; these mirror what each route hands it after enrichQaPersona().
const PATHS: Array<[string, string]> = [["describe", "describe"], ["from-site", "from-site"], ["transcript", "transcript"], ["preset", "preset"], ["custom", "describe"]]

for (const [label, simSource] of PATHS) {
  test(`QA Sim via "${label}": rules persisted, identity preserved, reload + edit keep them`, async () => {
    const id = "sim_" + randomUUID()
    const enriched = enrichQaPersona(base("QA " + label), "qa")            // what the preview shows
    await dbMod.upsertPersona(id, projectId, { ...enriched, simSource } as any)
    const row = await get(id)
    expect(row.personaKind).toBe("qa")
    expect(row.validations!.rules.map((r: any) => r.id)).toEqual(CATEGORY_IDS)
    expect(row.validations).toEqual(enriched.validations)                  // preview == saved
    expect(row.summary).toBe("Custom brief: be thorough.")                 // user-defined text preserved
    expect(row.core!.goals).toEqual(["find defects"])
    const stored = (await client.execute({ sql: "SELECT persona_kind, validations_json FROM personas WHERE id=?", args: [id] })).rows[0] as any
    expect(stored.persona_kind).toBe("qa")
    expect(JSON.parse(stored.validations_json).rules).toHaveLength(7)
    // Edit that omits personaKind / tries to strip rules: still QA, rules intact.
    await dbMod.upsertPersona(id, projectId, base("QA " + label, { summary: "edited", validations: { version: 1, rules: [], exclusions: [] } }) as any)
    const after = await get(id)
    expect(after.personaKind).toBe("qa")
    expect(after.validations).toEqual(canonicalValidations())
    expect(after.summary).toBe("edited")
  })
}

test("customer Sim: no kind, no validations, nothing persisted (non-QA unchanged)", async () => {
  const id = "sim_" + randomUUID()
  await dbMod.upsertPersona(id, projectId, enrichQaPersona(base("Customer Carol", { summary: "QA visual testing tester" })) as any)
  const row = await get(id)
  expect(row.personaKind).toBe("customer")
  expect(row.validations).toBeUndefined()
  const stored = (await client.execute({ sql: "SELECT persona_kind, validations_json FROM personas WHERE id=?", args: [id] })).rows[0] as any
  expect(stored.validations_json).toBeNull()
})

test("legacy row (NULL persona_kind) loads as customer", async () => {
  const id = "sim_" + randomUUID()
  await dbMod.upsertPersona(id, projectId, base("Legacy") as any)
  await client.execute({ sql: "UPDATE personas SET persona_kind=NULL, validations_json=NULL WHERE id=?", args: [id] })
  const row = await get(id)
  expect(row.personaKind).toBe("customer")
})

test("Baseline QA provisioning (INSERT OR IGNORE path) persists kind + rules; legacy baseline row is read as QA", async () => {
  const sims = await dbMod.listPersonas(projectId)
  const b = sims.find((p: any) => p.simSource === "baseline")!
  expect(b.personaKind).toBe("qa")
  expect(b.validations!.rules).toHaveLength(7)
  const stored = (await client.execute({ sql: "SELECT persona_kind, validations_json FROM personas WHERE id=?", args: [b.id] })).rows[0] as any
  expect(stored.persona_kind).toBe("qa")
  expect(JSON.parse(stored.validations_json).rules).toHaveLength(7)
  // A baseline row created before this change (no kind / rules) still loads as QA with the rules.
  await client.execute({ sql: "UPDATE personas SET persona_kind=NULL, validations_json=NULL WHERE id=?", args: [b.id] })
  const legacy = (await dbMod.listPersonas(projectId)).find((p: any) => p.id === b.id)!
  expect(legacy.personaKind).toBe("qa")
  expect(legacy.validations!.rules).toHaveLength(7)
})

test("runtime: the persisted rules reach the model for QA Sims only; summary reported for QA only", async () => {
  const qaId = "sim_" + randomUUID(), custId = "sim_" + randomUUID()
  await dbMod.upsertPersona(qaId, projectId, enrichQaPersona(base("RunQA"), "qa") as any)
  await dbMod.upsertPersona(custId, projectId, enrichQaPersona(base("RunCust")) as any)
  const sims = await dbMod.listPersonas(projectId)
  const seen: Record<string, any> = {}
  const reactFn = async (sim: any) => {
    seen[sim.name] = sim
    return { data: { reactions: [{ observation: "The Save button label is clipped", sentiment: "frustrated", target: { text: "Save" }, region: { x: 0.1, y: 0.1, w: 0.1, h: 0.05 }, category: "layout", expected: "full label", actual: "clipped", confidence: "Confirmed", suggestedBug: null }], categoriesInspected: ["layout", "typography"] } }
  }
  const res = await runSimReviews({
    projectId, urlPath: "/p", urlHost: "x.test", pageUrl: "https://x.test/p", imageB64: "AA", mediaType: "image/png",
    targetSims: sims.filter((s: any) => s.id === qaId || s.id === custId), actorEmail: "o@validations.test", screenshotId: null,
    seenKeys: ["a", "b"], reactFn, resolveCitationsFn: async () => ({ citedTraitIds: [], sourceQuote: null, speaker: null, sourceTranscriptId: null, sourceDate: null, issueType: null, sourceQuoteVerified: null, recurrence: null, sourceTime: null, sourceTimeKind: "upload" }),
  } as any)
  expect(seen["RunQA"].validations.rules).toHaveLength(7)       // loaded from the DB and handed to reactToPage
  expect(seen["RunCust"].validations).toBeUndefined()
  const qa = res.find((r: any) => r.simName === "RunQA")!, cust = res.find((r: any) => r.simName === "RunCust")!
  expect(qa.visualQa!.categories.layout).toBe("issues")
  expect(qa.visualQa!.categories.typography).toBe("passed")
  expect(qa.visualQa!.categories.responsive).toBe("untested")
  expect(qa.observations[0].confidence).toBe("Confirmed")
  expect(cust.visualQa).toBeUndefined()
  expect(cust.observations[0].category).toBeUndefined()
})
