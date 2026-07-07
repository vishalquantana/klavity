// KLA-96: unit tests for run-history pruning.
// Uses a hermetic libsql file DB (same pattern as other trails tests).
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-retention-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
const client = reconnectDb("file:" + file)

beforeAll(async () => {
  await applySchema(client)
  await migrateV2(client)
})

const { pruneRunHistory } = await import("./trails-run-retention")
const T = await import("./trails")
const { crystallize } = await import("./trails-crystallize")

// Minimal trajectory that crystallize() accepts
function minimalTrajectory(name: string) {
  return {
    name,
    intent: "test",
    baseUrl: "https://test.local/",
    authorKind: "llm" as const,
    steps: [
      { action: "assert" as const, checkpoint: { description: "page loaded" }, url: "https://test.local/", domHash: "h1",
        target: { text: "loaded", resolvedSelector: "#loaded" } },
    ],
  }
}

// Insert a finished walk row directly (faster than full walkTrail for retention tests)
async function insertFinishedRun(projectId: string, trailId: string, startedAt: number): Promise<string> {
  const runId = await T.startWalk(projectId, trailId)
  // Back-date the started_at and finish it
  await client.execute({
    sql: `UPDATE trail_runs SET started_at=?, finished_at=?, status='green' WHERE id=?`,
    args: [startedAt, startedAt + 1000, runId],
  })
  return runId
}

test("prunes runs beyond keepCount while leaving recent ones intact", async () => {
  const projectId = "proj_prune_count"
  const { trailId } = await crystallize(projectId, minimalTrajectory("count-trail"))
  await T.setTrailStatus(projectId, trailId, "active")

  const OLD = Date.now() - 60 * 24 * 60 * 60 * 1000 // 60 days ago

  // Insert 5 old runs (all older than keepDays=30)
  const oldIds: string[] = []
  for (let i = 0; i < 5; i++) {
    oldIds.push(await insertFinishedRun(projectId, trailId, OLD + i * 1000))
  }

  // Insert 3 recent runs (within keepDays=30)
  const recentIds: string[] = []
  for (let i = 0; i < 3; i++) {
    recentIds.push(await insertFinishedRun(projectId, trailId, Date.now() - i * 1000))
  }

  // keepCount=3 keepDays=30: old runs ranked > 3 AND older than 30d → prune 2 of the 5 old ones
  // (3 old runs are still in top-3 by recency among the old set; but wait — the 3 recent runs
  // occupy ranks 1-3, so all 5 old runs are rank 4-8. Of those, only the ones older than ageFloor
  // get pruned. All 5 old runs are 60d old > 30d, so all 5 should be pruned.)
  const result = await pruneRunHistory(client, { keepCount: 3, keepDays: 30 })

  expect(result.runsDeleted).toBe(5)

  // Recent runs survived
  for (const id of recentIds) {
    const w = await T.getWalk(projectId, id)
    expect(w).not.toBeNull()
  }

  // Old runs were pruned
  for (const id of oldIds) {
    const w = await T.getWalk(projectId, id)
    expect(w).toBeNull()
  }
})

test("keeps runs within keepDays even when beyond keepCount", async () => {
  const projectId = "proj_prune_age"
  const { trailId } = await crystallize(projectId, minimalTrajectory("age-trail"))
  await T.setTrailStatus(projectId, trailId, "active")

  const nowTs = Date.now()
  const recentEnough = nowTs - 10 * 24 * 60 * 60 * 1000 // 10 days ago (within 30d)

  // Insert 6 runs all within keepDays (10d ago)
  const ids: string[] = []
  for (let i = 0; i < 6; i++) {
    ids.push(await insertFinishedRun(projectId, trailId, recentEnough + i * 1000))
  }

  // keepCount=2 keepDays=30: all 6 are < 30d old, so none should be pruned
  const result = await pruneRunHistory(client, { keepCount: 2, keepDays: 30, now: nowTs })

  expect(result.runsDeleted).toBe(0)
  for (const id of ids) {
    expect(await T.getWalk(projectId, id)).not.toBeNull()
  }
})

test("cascades run_steps and walk_replays when pruning", async () => {
  const projectId = "proj_prune_cascade"
  const { trailId } = await crystallize(projectId, minimalTrajectory("cascade-trail"))
  await T.setTrailStatus(projectId, trailId, "active")

  const OLD = Date.now() - 60 * 24 * 60 * 60 * 1000

  // One old run
  const oldRunId = await insertFinishedRun(projectId, trailId, OLD)

  // Attach a run_step and a walk_replay row to this run
  await T.addRunStep(projectId, { runId: oldRunId, trailId, stepId: "step_fake", idx: 0, tier: "cache", verdict: "green" })
  await client.execute({
    sql: `INSERT INTO walk_replays (id, run_id, project_id, segments_gz, n_segments, n_events, created_at)
          VALUES ('wr_fake', ?, ?, 'gz', 1, 1, ?)`,
    args: [oldRunId, projectId, OLD],
  })

  const result = await pruneRunHistory(client, { keepCount: 0, keepDays: 7 })

  expect(result.runsDeleted).toBeGreaterThanOrEqual(1)
  expect(result.runStepsDeleted).toBeGreaterThanOrEqual(1)
  expect(result.replaysDeleted).toBeGreaterThanOrEqual(1)

  // run_step gone
  const steps = await T.listRunSteps(projectId, oldRunId)
  expect(steps).toHaveLength(0)

  // walk_replay gone
  const wr = await client.execute({ sql: `SELECT id FROM walk_replays WHERE run_id=?`, args: [oldRunId] })
  expect(wr.rows).toHaveLength(0)
})

test("prunes queued findings for pruned runs but keeps filed findings", async () => {
  const projectId = "proj_prune_findings"
  const { trailId } = await crystallize(projectId, minimalTrajectory("findings-trail"))
  await T.setTrailStatus(projectId, trailId, "active")

  const OLD = Date.now() - 60 * 24 * 60 * 60 * 1000

  const oldRunId = await insertFinishedRun(projectId, trailId, OLD)

  // Insert a queued finding linked to the old run
  const { id: queuedId } = await T.recordFinding(projectId, {
    runId: oldRunId, trailId, kind: "regression",
    title: "Queued finding to be pruned",
    confidence: 0.8, dedupKey: `prune-test:${trailId}:queued`,
  })

  // Insert a filed finding linked to the old run (should survive)
  const { id: filedId } = await T.recordFinding(projectId, {
    runId: oldRunId, trailId, kind: "regression",
    title: "Filed finding to keep",
    confidence: 0.9, dedupKey: `prune-test:${trailId}:filed`,
    status: "filed",
  })

  const result = await pruneRunHistory(client, { keepCount: 0, keepDays: 7 })

  expect(result.runsDeleted).toBeGreaterThanOrEqual(1)
  expect(result.findingsDeleted).toBeGreaterThanOrEqual(1)

  // queued finding pruned
  const qr = await client.execute({ sql: `SELECT id FROM findings WHERE id=?`, args: [queuedId] })
  expect(qr.rows).toHaveLength(0)

  // filed finding kept
  const fr = await client.execute({ sql: `SELECT id FROM findings WHERE id=?`, args: [filedId] })
  expect(fr.rows).toHaveLength(1)
})

test("no-ops gracefully when there are no runs to prune", async () => {
  const projectId = "proj_prune_empty"
  const result = await pruneRunHistory(client, { keepCount: 50, keepDays: 30 })
  // No runs exist for this project — should complete cleanly
  expect(result.runsDeleted).toBe(0)
  expect(result.runStepsDeleted).toBe(0)
})
