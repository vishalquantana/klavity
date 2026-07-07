import { beforeAll, expect, test } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-failkind-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

const T = await import("./trails")
const {
  failureKindForExpectationFailure,
  failureKindForThrownError,
  tagRedEvidence,
} = await import("./trails-runner")

test("thrown infra error is persisted as crash failureKind on the red walk", async () => {
  const projectId = "proj_failkind_crash"
  const trailId = await T.createTrail(projectId, { name: "Crashy", baseUrl: "https://app.test/" })
  const runId = await T.startWalk(projectId, trailId)
  const err = new Error("browser process died")

  await T.finishWalk(projectId, runId, {
    status: "red",
    llmCalls: 0,
    summary: { failureKind: failureKindForThrownError(err), error: String(err) },
  })

  const walk = await T.getWalk(projectId, runId)
  expect(walk?.status).toBe("red")
  expect((walk?.summary as any)?.failureKind).toBe("crash")
  expect((walk?.summary as any)?.error).toContain("browser process died")
})

test("failed expectation is persisted as regression failureKind on walk, run step, and finding", async () => {
  const projectId = "proj_failkind_regression"
  const trailId = await T.createTrail(projectId, { name: "Regression", baseUrl: "https://app.test/" })
  const stepId = await T.addTrailStep(projectId, trailId, {
    idx: 0,
    action: "assert",
    checkpoint: { description: "checkout confirmation visible" },
  })
  const runId = await T.startWalk(projectId, trailId)
  const failureKind = failureKindForExpectationFailure()

  await T.addRunStep(projectId, {
    runId,
    trailId,
    stepId,
    idx: 0,
    tier: "cache",
    verdict: "red",
    confidence: 1,
    diagnosis: "regression",
    evidence: tagRedEvidence(failureKind, { reason: "checkpoint_failed" }),
  })
  await T.recordFinding(projectId, {
    runId,
    trailId,
    stepId,
    kind: "regression",
    title: "Checkpoint failed: checkout confirmation visible",
    evidence: tagRedEvidence(failureKind, { reason: "checkpoint_failed" }),
    confidence: 1,
    dedupKey: `${trailId}:${stepId}:checkpoint-failed`,
  })
  await T.finishWalk(projectId, runId, {
    status: "red",
    llmCalls: 0,
    summary: { failureKind, error: "checkpoint_failed" },
  })

  const walk = await T.getWalk(projectId, runId)
  expect((walk?.summary as any)?.failureKind).toBe("regression")

  const [step] = await T.listRunSteps(projectId, runId)
  expect(step.verdict).toBe("red")
  expect((step.evidence as any)?.failureKind).toBe("regression")

  const [finding] = await T.listFindings(projectId)
  expect(finding.kind).toBe("regression")
  expect((finding.evidence as any)?.failureKind).toBe("regression")
})
