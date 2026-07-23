// KLAVITYKLA-364: per-AutoSim-replay COGS instrumentation.
// A replay is deterministic (Tier-0 cached selector) and makes ZERO LLM calls; the only billable
// calls during a walk are Tier-1 self-heals (ai_calls type='reheal'). These tests assert that a walk
// with N reheals records the SUMMED reheal cost as the measured cost-per-replay on its trail_run.
import { test, expect } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const dbFile = join(tmpdir(), `klav-replaycogs-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + dbFile
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2, recordAiCall, sumRunRehealCostUsd, opsReplayCogs } = await import("./db")
const cogsdb = reconnectDb("file:" + dbFile)
await applySchema(cogsdb); await migrateV2(cogsdb)
const { startWalk, finishWalk, getWalk } = await import("./trails")

const P = "proj_cogs"

test("a walk with N reheals records the summed reheal cost as measured cost-per-replay", async () => {
  const runId = await startWalk(P, "trail_cogs")

  // Three Tier-1 self-heals fired during this replay (two succeeded with cost, one failed at $0).
  await recordAiCall({ type: "reheal", feature: "heal", model: "m", projectId: P, runId, costUsd: 0.0011, ok: true })
  await recordAiCall({ type: "reheal", feature: "heal", model: "m", projectId: P, runId, costUsd: 0.0023, ok: true })
  await recordAiCall({ type: "reheal", feature: "heal", model: "m", projectId: P, runId, costUsd: 0, ok: false })

  // Noise that must NOT be counted: a reheal from a DIFFERENT run, and a non-reheal call on this run.
  await recordAiCall({ type: "reheal", feature: "heal", model: "m", projectId: P, runId: "other_run", costUsd: 0.5, ok: true })
  await recordAiCall({ type: "sim-react", feature: "sim-react", model: "m", projectId: P, runId, costUsd: 0.9, ok: true })

  const expected = 0.0011 + 0.0023 // 0.0034

  // The per-run summer attributes only this run's reheal costs.
  expect(await sumRunRehealCostUsd(runId)).toBeCloseTo(expected, 6)

  // finishWalk stamps the measured $/replay onto the trail_run atomically.
  await finishWalk(P, runId, { status: "green", llmCalls: 2 })
  const walk = await getWalk(P, runId)
  expect(walk).not.toBeNull()
  expect(walk!.replayCostUsd).toBeCloseTo(expected, 6)
})

test("a fully-cached deterministic replay (zero reheals) records $0", async () => {
  const runId = await startWalk(P, "trail_cached")
  await finishWalk(P, runId, { status: "green", llmCalls: 0 })
  const walk = await getWalk(P, runId)
  expect(walk!.replayCostUsd).toBe(0)
})

test("opsReplayCogs aggregates measured $/replay across finished walks", async () => {
  const roll = await opsReplayCogs(30)
  // Both finished walks above are in-window; at least one incurred a reheal cost.
  expect(roll.runs).toBeGreaterThanOrEqual(2)
  expect(roll.runsWithReheal).toBeGreaterThanOrEqual(1)
  expect(roll.totalCost).toBeGreaterThanOrEqual(0.0034 - 1e-9)
  expect(roll.maxCost).toBeGreaterThanOrEqual(0.0034 - 1e-9)
  expect(roll.avgCost).toBeGreaterThan(0)
})
