/**
 * Debug 2: run walkTrail on the simplest 1-step trail for onboarding.
 * Uses h1 (simpler selector) to test whether ANY selector works.
 */
import { tmpdir } from "node:os"
import { join } from "node:path"

const dbFile = join(tmpdir(), `klav-debug2-${Date.now()}.db`)
process.env.TURSO_DATABASE_URL = "file:" + dbFile
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
const db = reconnectDb("file:" + dbFile)
await applySchema(db)
await migrateV2(db)

const { crystallize } = await import("./trails-crystallize")
const { walkTrail } = await import("./trails-runner")
const T = await import("./trails")

const PROJECT = "proj_debug2"
const BASE = "https://klavity.quantana.top"

// Test 1: simplest possible assert with h1 (proven unique by diagnostic)
const trail1 = await crystallize(PROJECT, {
  name: "debug: h1 only",
  intent: "h1 visible on onboarding",
  baseUrl: BASE + "/onboarding",
  authorKind: "llm",
  steps: [{
    action: "assert",
    checkpoint: { description: "welcome h1 visible" },
    target: { role: "heading", resolvedSelector: "h1" },
    url: BASE + "/onboarding",
    domHash: "d1",
  }],
})

console.log("[Test 1] walkTrail: h1 assert on /onboarding")
const r1 = await walkTrail(PROJECT, trail1.trailId, {
  fixtureUrl: BASE + "/onboarding",
  replay: false,
  deadlineMs: 30_000,
})
console.log(`  verdict=${r1.verdict} steps:`)
for (const s of r1.steps) {
  const rs = (await T.listRunSteps(PROJECT, r1.runId)).find(r => r.idx === s.idx)
  console.log(`  step[${s.idx}] tier=${s.tier} verdict=${s.verdict} evidence=${JSON.stringify(rs?.evidence)}`)
}

// Test 2: the .panel.step[data-s='0'] h1 selector
const trail2 = await crystallize(PROJECT, {
  name: "debug: panel-step h1",
  intent: "panel step h1 visible on onboarding",
  baseUrl: BASE + "/onboarding",
  authorKind: "llm",
  steps: [{
    action: "assert",
    checkpoint: { description: "step0 h1 visible" },
    target: { role: "heading", resolvedSelector: ".panel.step[data-s='0'] h1" },
    url: BASE + "/onboarding",
    domHash: "d2",
  }],
})

console.log("[Test 2] walkTrail: .panel.step[data-s='0'] h1 assert on /onboarding")
const r2 = await walkTrail(PROJECT, trail2.trailId, {
  fixtureUrl: BASE + "/onboarding",
  replay: false,
  deadlineMs: 30_000,
})
console.log(`  verdict=${r2.verdict} steps:`)
for (const s of r2.steps) {
  const rs = (await T.listRunSteps(PROJECT, r2.runId)).find(r => r.idx === s.idx)
  console.log(`  step[${s.idx}] tier=${s.tier} verdict=${s.verdict} evidence=${JSON.stringify(rs?.evidence)}`)
}

// Test 3: .cta button.btn-indigo click (the intro "Get started →" button)
const trail3 = await crystallize(PROJECT, {
  name: "debug: cta button click",
  intent: "click get started button on onboarding intro",
  baseUrl: BASE + "/onboarding",
  authorKind: "llm",
  steps: [{
    action: "click",
    target: { role: "button", text: "Get started →", resolvedSelector: ".cta button.btn-indigo" },
    url: BASE + "/onboarding",
    domHash: "d3",
  }],
})

console.log("[Test 3] walkTrail: .cta button.btn-indigo click on /onboarding")
const r3 = await walkTrail(PROJECT, trail3.trailId, {
  fixtureUrl: BASE + "/onboarding",
  replay: false,
  deadlineMs: 30_000,
})
console.log(`  verdict=${r3.verdict} steps:`)
for (const s of r3.steps) {
  const rs = (await T.listRunSteps(PROJECT, r3.runId)).find(r => r.idx === s.idx)
  console.log(`  step[${s.idx}] tier=${s.tier} verdict=${s.verdict} evidence=${JSON.stringify(rs?.evidence)}`)
}
