/**
 * Debug: crystallize Trail 2 and print the cache rows, then walk step by step.
 */
import { tmpdir } from "node:os"
import { join } from "node:path"

const dbFile = join(tmpdir(), `klav-debug-${Date.now()}.db`)
process.env.TURSO_DATABASE_URL = "file:" + dbFile
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
const db = reconnectDb("file:" + dbFile)
await applySchema(db)
await migrateV2(db)

const { crystallize } = await import("./trails-crystallize")
const T = await import("./trails")

const PROJECT = "proj_debug"
const BASE = "https://klavity.in"

const ctaTraj = {
  name: "Dogfood · debug",
  intent: "test",
  baseUrl: BASE + "/onboarding",
  authorKind: "llm" as const,
  createdBy: "debug",
  steps: [
    {
      action: "assert" as const,
      checkpoint: { description: "step 0 heading" },
      target: {
        role: "heading",
        text: "Your customers review",
        resolvedSelector: ".panel.step[data-s='0'] h1",
      },
      url: BASE + "/onboarding",
      domHash: "onboarding-intro",
    },
    {
      action: "click" as const,
      target: {
        role: "button",
        text: "Get started →",
        resolvedSelector: ".cta button.btn-indigo",
      },
      url: BASE + "/onboarding",
      domHash: "onboarding-intro",
    },
  ],
}

const { trailId, stepIds, cacheKeys } = await crystallize(PROJECT, ctaTraj)
console.log("trailId:", trailId)
console.log("stepIds:", stepIds)
console.log("cacheKeys:", cacheKeys)

// Check cache rows
for (const stepId of stepIds) {
  const row = await T.getCacheForStep(PROJECT, stepId)
  console.log(`  stepId=${stepId} → cache: ${JSON.stringify(row)}`)
}

// Now simulate what the runner does: get steps and look up cache
const steps = await T.listTrailSteps(PROJECT, trailId)
for (const step of steps) {
  const cacheRow = await T.getCacheForStep(PROJECT, step.id)
  console.log(`  step[${step.idx}] id=${step.id} action=${step.action}`)
  console.log(`    cacheRow: resolvedSelector=${cacheRow?.resolvedSelector ?? "NULL"}`)
  console.log(`    step.target: ${JSON.stringify(step.target)}`)
}
