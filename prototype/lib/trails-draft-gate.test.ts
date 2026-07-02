// AutoSims F1 — Draft-gate: draft Trails never file Findings.
// A Draft Trail's walk (including the Verification Walk) captures run_step evidence as normal
// but NEVER calls recordFinding. Only ACTIVE Trails produce Findings.
// Hermetic local libsql, mirrors lib/trails-runner.e2e.test.ts setup.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

const file = join(tmpdir(), `klav-draft-gate-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
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
const { listFindings, setTrailStatus, getTrail } = await import("./trails")

const fixtureUrl = (name: string) =>
  pathToFileURL(resolve(import.meta.dir, "../test-fixtures", name)).href

// Inline the checkout trajectory (same as e2e test; avoids requiring an export from that file).
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

// Trajectory with an ambiguous selector that produces a recordFinding call (regression finding).
// Uses checkout-mockup-ambiguous.html which has TWO elements matching ".dup-btn".
function ambiguousTrajectory() {
  return {
    name: "Ambiguous click",
    intent: "click a button that appears twice",
    baseUrl: "https://app.test/",
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "click" as const, url: "https://app.test/", domHash: "da",
        target: { role: "button", accessibleName: "Dup", text: "Dup", testId: "dup-btn", resolvedSelector: ".dup-btn" } },
    ],
  }
}

test("a draft Trail's RED walk records run steps but files NO findings", async () => {
  const P = "proj_draft_gate_a"
  const { trailId } = await crystallize(P, ambiguousTrajectory())
  await setTrailStatus(P, trailId, "draft")

  const summary = await walkTrail(P, trailId, { fixtureUrl: fixtureUrl("checkout-mockup-ambiguous.html") })

  expect(summary.verdict).toBe("red")
  // run_steps are still recorded (evidence is preserved)
  expect(summary.steps.length).toBeGreaterThan(0)
  // but NO findings are filed
  expect((await listFindings(P)).length).toBe(0)
}, 30000)

test("the same RED walk on an ACTIVE trail records the finding", async () => {
  const P = "proj_draft_gate_b"
  const { trailId } = await crystallize(P, ambiguousTrajectory())
  await setTrailStatus(P, trailId, "active")

  await walkTrail(P, trailId, { fixtureUrl: fixtureUrl("checkout-mockup-ambiguous.html") })

  expect((await listFindings(P)).length).toBeGreaterThan(0)
}, 30000)

test("explicit suppressFindings:true suppresses findings even on an ACTIVE trail", async () => {
  const P = "proj_draft_gate_c"
  const { trailId } = await crystallize(P, ambiguousTrajectory())
  await setTrailStatus(P, trailId, "active")

  const summary = await walkTrail(P, trailId, {
    fixtureUrl: fixtureUrl("checkout-mockup-ambiguous.html"),
    suppressFindings: true,
  })

  expect(summary.verdict).toBe("red")
  expect((await listFindings(P)).length).toBe(0)
}, 30000)

test("crystallize leaves a trail in draft status", async () => {
  const P = "proj_draft_gate_d"
  const { trailId } = await crystallize(P, checkoutTrajectory())
  const trail = await getTrail(P, trailId)
  expect(trail?.status).toBe("draft")
})
