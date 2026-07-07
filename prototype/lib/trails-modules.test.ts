// KLA-106: Trail Modules — unit tests for param substitution, encode/parse, DB CRUD, and expansion.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-mods-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const { applyParams, parseModuleCall, encodeModuleCall, expandModuleSteps,
        createModule, getModule, listModules, deleteModule, addModuleStep, listModuleSteps }
  = await import("./trails-modules")
import type { TrailStep } from "./trails-types"

// ── applyParams ──────────────────────────────────────────────────────────────────────────────────

test("applyParams replaces known placeholders", () => {
  expect(applyParams("Hello {{param:name}}", { name: "Alice" })).toBe("Hello Alice")
})

test("applyParams replaces multiple different placeholders", () => {
  expect(applyParams("{{param:email}} / {{param:pass}}", { email: "a@b.com", pass: "secret" }))
    .toBe("a@b.com / secret")
})

test("applyParams leaves unknown placeholders intact", () => {
  expect(applyParams("{{param:unknown}}", {})).toBe("{{param:unknown}}")
})

test("applyParams replaces same placeholder repeated", () => {
  expect(applyParams("{{param:x}} and {{param:x}}", { x: "Y" })).toBe("Y and Y")
})

test("applyParams with no placeholders returns original string", () => {
  expect(applyParams("plain text", { foo: "bar" })).toBe("plain text")
})

// ── encodeModuleCall / parseModuleCall ───────────────────────────────────────────────────────────

test("encodeModuleCall + parseModuleCall round-trips moduleId and params", () => {
  const encoded = encodeModuleCall("tmod_abc", { email: "test@example.com", role: "admin" })
  const result = parseModuleCall(encoded)
  expect(result).toEqual({ moduleId: "tmod_abc", params: { email: "test@example.com", role: "admin" } })
})

test("encodeModuleCall with no params round-trips to empty params", () => {
  const encoded = encodeModuleCall("tmod_xyz")
  const result = parseModuleCall(encoded)
  expect(result).toEqual({ moduleId: "tmod_xyz", params: {} })
})

test("parseModuleCall returns null for null input", () => {
  expect(parseModuleCall(null)).toBeNull()
})

test("parseModuleCall returns null for malformed JSON", () => {
  expect(parseModuleCall("not-json")).toBeNull()
})

test("parseModuleCall returns null when moduleId missing", () => {
  expect(parseModuleCall(JSON.stringify({ params: {} }))).toBeNull()
})

// ── DB CRUD ───────────────────────────────────────────────────────────────────────────────────────

test("createModule + getModule round-trip", async () => {
  const id = await createModule("proj_1", { name: "Login", description: "Standard login flow" })
  expect(id).toMatch(/^tmod_/)
  const mod = await getModule("proj_1", id)
  expect(mod).not.toBeNull()
  expect(mod!.name).toBe("Login")
  expect(mod!.description).toBe("Standard login flow")
  expect(mod!.projectId).toBe("proj_1")
})

test("getModule returns null for unknown id", async () => {
  expect(await getModule("proj_1", "tmod_nope")).toBeNull()
})

test("listModules returns modules for the project only", async () => {
  await createModule("proj_2", { name: "A" })
  await createModule("proj_2", { name: "B" })
  await createModule("proj_99", { name: "Other" })
  const mods = await listModules("proj_2")
  expect(mods).toHaveLength(2)
  expect(mods.map((m) => m.name).sort()).toEqual(["A", "B"])
})

test("deleteModule removes module and its steps", async () => {
  const id = await createModule("proj_3", { name: "X" })
  await addModuleStep("proj_3", id, { idx: 0, action: "navigate", actionValue: "https://example.com" })
  await deleteModule("proj_3", id)
  expect(await getModule("proj_3", id)).toBeNull()
  expect(await listModuleSteps("proj_3", id)).toHaveLength(0)
})

test("addModuleStep + listModuleSteps CRUD", async () => {
  const modId = await createModule("proj_4", { name: "M" })
  const s0 = await addModuleStep("proj_4", modId, { idx: 0, action: "navigate", actionValue: "https://app.test" })
  const s1 = await addModuleStep("proj_4", modId, { idx: 1, action: "type", actionValue: "{{param:email}}" })
  expect(s0).toMatch(/^tms_/)
  expect(s1).toMatch(/^tms_/)
  const steps = await listModuleSteps("proj_4", modId)
  expect(steps).toHaveLength(2)
  expect(steps[0].action).toBe("navigate")
  expect(steps[1].actionValue).toBe("{{param:email}}")
})

// ── expandModuleSteps ─────────────────────────────────────────────────────────────────────────────

function makeTrailStep(projectId: string, overrides: Partial<TrailStep> = {}): TrailStep {
  return {
    id: "tstep_1", trailId: "trl_1", projectId, idx: 0,
    action: "navigate", actionValue: "https://a.test", target: null, checkpoint: null, createdAt: 1000,
    ...overrides,
  }
}

test("expandModuleSteps passes through non-callModule steps unchanged", async () => {
  const steps: TrailStep[] = [
    makeTrailStep("proj_5", { id: "s1", action: "navigate" }),
    makeTrailStep("proj_5", { id: "s2", action: "click", idx: 1 }),
  ]
  const expanded = await expandModuleSteps("proj_5", steps)
  expect(expanded).toHaveLength(2)
  expect(expanded[0].id).toBe("s1")
  expect(expanded[1].id).toBe("s2")
})

test("expandModuleSteps inlines module steps with param substitution", async () => {
  const modId = await createModule("proj_5", { name: "Login" })
  const ms = await Promise.all([
    addModuleStep("proj_5", modId, { idx: 0, action: "navigate", actionValue: "https://app.test/login" }),
    addModuleStep("proj_5", modId, { idx: 1, action: "type", actionValue: "{{param:email}}" }),
    addModuleStep("proj_5", modId, { idx: 2, action: "type", actionValue: "{{param:password}}" }),
  ])

  const callStep = makeTrailStep("proj_5", {
    id: "call_1", trailId: "trl_5", idx: 0, action: "callModule",
    actionValue: encodeModuleCall(modId, { email: "v@test.com", password: "s3cr3t" }),
  })
  const afterStep = makeTrailStep("proj_5", { id: "s2", trailId: "trl_5", idx: 1, action: "assert" })
  const expanded = await expandModuleSteps("proj_5", [callStep, afterStep])

  // 3 module steps + 1 regular step
  expect(expanded).toHaveLength(4)
  expect(expanded[0].id).toBe(`msx_${ms[0]}_call_1`)
  expect(expanded[0].action).toBe("navigate")
  expect(expanded[1].actionValue).toBe("v@test.com")       // {{param:email}} resolved
  expect(expanded[2].actionValue).toBe("s3cr3t")           // {{param:password}} resolved
  expect(expanded[3].id).toBe("s2")                         // trailing step intact
})

test("expandModuleSteps leaves unknown-module callModule step as-is", async () => {
  const callStep = makeTrailStep("proj_5", {
    id: "call_x", action: "callModule",
    actionValue: encodeModuleCall("tmod_nonexistent"),
  })
  const expanded = await expandModuleSteps("proj_5", [callStep])
  expect(expanded).toHaveLength(1)
  expect(expanded[0].action).toBe("callModule")
  expect(expanded[0].id).toBe("call_x")
})

test("expandModuleSteps with malformed actionValue leaves step as-is", async () => {
  const callStep = makeTrailStep("proj_5", { id: "call_bad", action: "callModule", actionValue: "not-json" })
  const expanded = await expandModuleSteps("proj_5", [callStep])
  expect(expanded).toHaveLength(1)
  expect(expanded[0].action).toBe("callModule")
})

test("expandModuleSteps with same module called twice creates distinct synthetic IDs", async () => {
  const modId = await createModule("proj_6", { name: "Nav" })
  await addModuleStep("proj_6", modId, { idx: 0, action: "navigate", actionValue: "https://x.test" })

  const c1 = makeTrailStep("proj_6", { id: "c1", trailId: "trl_6", idx: 0,
    action: "callModule", actionValue: encodeModuleCall(modId) })
  const c2 = makeTrailStep("proj_6", { id: "c2", trailId: "trl_6", idx: 1,
    action: "callModule", actionValue: encodeModuleCall(modId) })
  const expanded = await expandModuleSteps("proj_6", [c1, c2])

  expect(expanded).toHaveLength(2)
  expect(expanded[0].id).not.toBe(expanded[1].id)
  expect(expanded[0].id).toContain("c1")
  expect(expanded[1].id).toContain("c2")
})

test("expandModuleSteps preserves trailId, projectId, and call-site idx on synthetic steps", async () => {
  const modId = await createModule("proj_7", { name: "M" })
  await addModuleStep("proj_7", modId, { idx: 0, action: "click" })
  const call = makeTrailStep("proj_7", {
    id: "cs1", trailId: "trl_7", idx: 5,
    action: "callModule", actionValue: encodeModuleCall(modId),
  })
  const [synth] = await expandModuleSteps("proj_7", [call])
  expect(synth.projectId).toBe("proj_7")
  expect(synth.trailId).toBe("trl_7")
  expect(synth.idx).toBe(5)   // inherits call-site idx
})

test("expandModuleSteps with empty steps list returns empty", async () => {
  const expanded = await expandModuleSteps("proj_5", [])
  expect(expanded).toHaveLength(0)
})
