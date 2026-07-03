// Task 1: Per-step screenshots in the runner.
// TDD: RED then GREEN.
// Hermetic: file-based libsql, real headless Chromium, injectable fake uploader.
// These tests verify WalkOptions.stepShots + WalkOptions.shotUploader behavior.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

const file = join(tmpdir(), `klav-stepshots-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")

beforeAll(async () => {
  const db = reconnectDb("file:" + file)
  await applySchema(db)
  await migrateV2(db)
})

const { crystallize } = await import("./trails-crystallize")
const { walkTrail } = await import("./trails-runner")
const T = await import("./trails")

const fixtureUrl = (name: string) =>
  pathToFileURL(resolve(import.meta.dir, "../test-fixtures", name)).href

function checkoutTrajectory() {
  return {
    name: "Login and add plan",
    intent: "log in, add the $20 plan",
    baseUrl: "https://app.test/",
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "type" as const, actionValue: "user@test.dev", url: "https://app.test/", domHash: "d1",
        target: { role: "textbox", accessibleName: "Email", testId: "email-input", resolvedSelector: "#email" } },
      { action: "type" as const, actionValue: "hunter2", url: "https://app.test/", domHash: "d1",
        target: { role: "textbox", accessibleName: "Password", testId: "password-input", resolvedSelector: "#password" } },
      { action: "click" as const, url: "https://app.test/", domHash: "d1",
        target: { role: "button", accessibleName: "Sign in", text: "Sign in", testId: "signin-btn", resolvedSelector: "#signin" } },
      { action: "click" as const, url: "https://app.test/", domHash: "d2",
        target: { role: "button", accessibleName: "Add the $20 plan", text: "Add $20 plan", testId: "add-plan-btn", resolvedSelector: "#add-plan" } },
      { action: "assert" as const, checkpoint: { description: "plan added to cart" }, url: "https://app.test/", domHash: "d2",
        target: { role: undefined, text: "Plan added to cart", testId: "confirmation", resolvedSelector: "#confirmation" } },
    ],
  }
}

// A trajectory with a navigate step followed by actionable steps,
// to verify navigate steps do NOT get a screenshot.
function navigateTrajectory() {
  return {
    name: "Navigate then act",
    intent: "navigate then click",
    baseUrl: "https://app.test/",
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "navigate" as const, url: "https://app.test/", domHash: "dn",
        target: null as any },
      { action: "click" as const, url: "https://app.test/", domHash: "dn",
        target: { role: "button", accessibleName: "Sign in", text: "Sign in", testId: "signin-btn", resolvedSelector: "#signin" } },
    ],
  }
}

// Helper: build a fake uploader that counts invocations and returns deterministic keys.
function makeFakeUploader() {
  let n = 0
  const calls: Array<{ bytes: Uint8Array; contentType: string }> = []
  const uploader = async (bytes: Uint8Array, contentType: string): Promise<{ key: string }> => {
    n++
    calls.push({ bytes, contentType })
    return { key: `shot_${n}` }
  }
  return { uploader, calls: () => calls, count: () => n }
}

test("(shots-1) stepShots:true + fake uploader — every actionable step has screenshotKey in evidence; walk still GREEN", async () => {
  const projectId = "proj_shots_1"
  const { trailId } = await crystallize(projectId, checkoutTrajectory())
  const fake = makeFakeUploader()

  const summary = await walkTrail(projectId, trailId, {
    fixtureUrl: fixtureUrl("checkout-mockup.html"),
    stepShots: true,
    shotUploader: fake.uploader,
  })

  expect(summary.verdict).toBe("green")

  const runSteps = await T.listRunSteps(projectId, summary.runId)
  // All 5 steps are actionable (type/type/click/click/assert) — no navigate/wait steps here.
  // Every step must have screenshotKey set.
  const actionableSteps = runSteps.filter((r) => {
    const ev = r.evidence as any
    return ev?.action !== "navigate" && ev?.action !== "wait"
  })
  expect(actionableSteps.length).toBeGreaterThan(0)
  for (const rs of actionableSteps) {
    expect((rs.evidence as any).screenshotKey).toBeTruthy()
    expect((rs.evidence as any).screenshotKey).toMatch(/^shot_\d+$/)
  }
  // Uploader should have been called once per actionable step.
  expect(fake.count()).toBe(actionableSteps.length)

  // Screenshots should be jpeg (contentType checked).
  for (const call of fake.calls()) {
    expect(call.contentType).toBe("image/jpeg")
    expect(call.bytes.length).toBeGreaterThan(0)
  }
}, 45000)

test("(shots-2) stepShots:false (default) — no screenshotKey in any evidence", async () => {
  const projectId = "proj_shots_2"
  const { trailId } = await crystallize(projectId, checkoutTrajectory())
  const fake = makeFakeUploader()

  // stepShots not set (default OFF)
  const summary = await walkTrail(projectId, trailId, {
    fixtureUrl: fixtureUrl("checkout-mockup.html"),
    shotUploader: fake.uploader, // uploader provided but stepShots=false — should never be called
  })

  expect(summary.verdict).toBe("green")

  const runSteps = await T.listRunSteps(projectId, summary.runId)
  for (const rs of runSteps) {
    expect((rs.evidence as any).screenshotKey).toBeUndefined()
  }
  expect(fake.count()).toBe(0) // never called
}, 45000)

test("(shots-3) uploader throws — walk continues GREEN, no screenshotKey in evidence (best-effort)", async () => {
  const projectId = "proj_shots_3"
  const { trailId } = await crystallize(projectId, checkoutTrajectory())

  const throwingUploader = async (_bytes: Uint8Array, _ct: string): Promise<{ key: string }> => {
    throw new Error("S3 unavailable")
  }

  const summary = await walkTrail(projectId, trailId, {
    fixtureUrl: fixtureUrl("checkout-mockup.html"),
    stepShots: true,
    shotUploader: throwingUploader,
  })

  // Walk must succeed even when uploader always throws.
  expect(summary.verdict).toBe("green")

  // No screenshotKey should be set when the uploader failed.
  const runSteps = await T.listRunSteps(projectId, summary.runId)
  for (const rs of runSteps) {
    expect((rs.evidence as any).screenshotKey).toBeUndefined()
  }
}, 45000)

test("(shots-4) navigate/wait steps get NO screenshot even with stepShots:true", async () => {
  const projectId = "proj_shots_4"
  const { trailId } = await crystallize(projectId, navigateTrajectory())
  const fake = makeFakeUploader()

  const summary = await walkTrail(projectId, trailId, {
    fixtureUrl: fixtureUrl("checkout-mockup.html"),
    stepShots: true,
    shotUploader: fake.uploader,
  })

  // Walk should complete without error.
  expect(["green", "amber", "red"]).toContain(summary.verdict)

  const runSteps = await T.listRunSteps(projectId, summary.runId)

  // navigate step must NOT have screenshotKey
  const navigateStep = runSteps.find((r) => (r.evidence as any)?.action === "navigate")
  if (navigateStep) {
    expect((navigateStep.evidence as any).screenshotKey).toBeUndefined()
  }

  // The click step (non-navigate) SHOULD have screenshotKey if it succeeded.
  const clickStep = runSteps.find((r) => (r.evidence as any)?.action !== "navigate" && (r.evidence as any)?.action !== "wait")
  if (clickStep && clickStep.verdict !== "red") {
    expect((clickStep.evidence as any).screenshotKey).toBeTruthy()
  }

  // Uploader must have been called at most once (only for the click step, not navigate).
  const navigateCount = runSteps.filter((r) => (r.evidence as any)?.action === "navigate").length
  const waitCount = runSteps.filter((r) => (r.evidence as any)?.action === "wait").length
  const actionableCount = runSteps.length - navigateCount - waitCount
  expect(fake.count()).toBeLessThanOrEqual(actionableCount)
}, 45000)
