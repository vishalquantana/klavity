/**
 * Debug 3: reproduce the original failure. Run home-assert trail FIRST, then onboarding trail.
 * Same project. Tests whether sequential walkTrail in same project causes cache interference.
 */
import { tmpdir } from "node:os"
import { join } from "node:path"

const dbFile = join(tmpdir(), `klav-debug3-${Date.now()}.db`)
process.env.TURSO_DATABASE_URL = "file:" + dbFile
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
const db = reconnectDb("file:" + dbFile)
await applySchema(db)
await migrateV2(db)

const { crystallize } = await import("./trails-crystallize")
const { walkTrail } = await import("./trails-runner")
const T = await import("./trails")

const PROJECT = "proj_dogfood"
const BASE = "https://klavity.quantana.top"

// Trail 1: same as in dogfood-autosim.ts
const home = await crystallize(PROJECT, {
  name: "home-assert",
  intent: "home page heading",
  baseUrl: BASE + "/",
  authorKind: "llm",
  steps: [{
    action: "assert",
    checkpoint: { description: "hero heading visible" },
    target: { role: "heading", text: "Your customers are", resolvedSelector: "h1" },
    url: BASE + "/",
    domHash: "home",
  }],
})

console.log("[Trail 1] walk home-assert on https://klavity.quantana.top/")
const r1 = await walkTrail(PROJECT, home.trailId, {
  fixtureUrl: BASE + "/",
  replay: false,
  deadlineMs: 60_000,
})
console.log(`  Trail 1 verdict: ${r1.verdict}`)

// Trail 2: onboarding heading assert
const onboard = await crystallize(PROJECT, {
  name: "onboarding-heading",
  intent: "onboarding step 0 heading visible",
  baseUrl: BASE + "/onboarding",
  authorKind: "llm",
  steps: [{
    action: "assert",
    checkpoint: { description: "welcome h1" },
    target: { role: "heading", resolvedSelector: ".panel.step[data-s='0'] h1" },
    url: BASE + "/onboarding",
    domHash: "onboarding-intro",
  }],
})

console.log("[Trail 2] walk onboarding-heading (AFTER trail 1)")
const r2 = await walkTrail(PROJECT, onboard.trailId, {
  fixtureUrl: BASE + "/onboarding",
  replay: false,
  deadlineMs: 60_000,
})
console.log(`  Trail 2 verdict: ${r2.verdict}`)
for (const s of r2.steps) {
  const rs = (await T.listRunSteps(PROJECT, r2.runId)).find(r => r.idx === s.idx)
  console.log(`  step[${s.idx}] tier=${s.tier} verdict=${s.verdict} evidence=${JSON.stringify(rs?.evidence)}`)
}
