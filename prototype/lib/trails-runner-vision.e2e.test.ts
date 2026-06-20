// Layer D: Tier-2 vision heal / regression / low-confidence, end-to-end against REAL Chromium.
// The VisionResolver is INJECTED as a mock — NO real network. Proves the runner's Tier-0/1-exhausted
// handoff becomes a real AMBER heal (never green), a grounded regression finding, or a queue-only
// amber_heal — and that with NO resolver the behavior is the unchanged Layer C RED + needsVision.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

const file = join(tmpdir(), `klav-runner-vision-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
const { reconnectDb, applySchema, migrateV2 } = await import("./db")
let db: any
beforeAll(async () => { db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const T = await import("./trails")
const { crystallize } = await import("./trails-crystallize")
const { walkTrail } = await import("./trails-runner")
import type { VisionResolver } from "./trails-vision"

const FIX = (name: string) => pathToFileURL(resolve(import.meta.dir, "..", "test-fixtures", name)).href
const PROJ = "proj_vis"

// A single-step trail whose Sign-in target resolves Tier-0 (#signin) on the BASELINE fixture, but is
// undiscoverable by Tier-0/1 on the MOVED/REMOVED fixtures (id/testid/role-name/text/structure all
// changed or gone) — so ONLY the (mock) vision can place it. Mirrors the real crystallize signature:
// crystallize(projectId, Trajectory{ steps[].target.resolvedSelector }).
async function seedTrail(): Promise<string> {
  const { trailId } = await crystallize(PROJ, {
    name: "Sign in",
    baseUrl: FIX("checkout-mockup.html"),
    authorKind: "llm",
    steps: [
      { action: "click", intent: "click the Sign in button", url: FIX("checkout-mockup.html"), domHash: "h0",
        target: { role: "button", accessibleName: "Sign in", text: "Sign in", testId: "signin-btn", resolvedSelector: "#signin" } },
    ],
  } as any)
  return trailId
}

const visionHeal: VisionResolver = async () => ({ found: true, selector: "#totally-new-id", confidence: 0.95, classification: "moved", rationale: "the Sign in button moved into the top bar" })
const visionRemoved: VisionResolver = async () => ({ found: false, selector: null, confidence: 0.9, classification: "removed", rationale: "no Sign in affordance exists anymore" })
const visionLowConf: VisionResolver = async () => ({ found: true, selector: "#maybe", confidence: 0.6, classification: "moved", rationale: "unsure" })

test("Tier-2 heal → AMBER (never green), selector persisted, llmCalls=1, no finding", async () => {
  const trailId = await seedTrail()
  const walk = await walkTrail(PROJ, trailId, { fixtureUrl: FIX("checkout-mockup-moved.html"), vision: visionHeal })
  expect(walk.verdict).toBe("amber")
  expect(walk.llmCalls).toBe(1)
  const steps = await T.listRunSteps(PROJ, walk.runId)
  expect(steps[0].verdict).toBe("amber"); expect(steps[0].tier).toBe("vision"); expect(steps[0].healed).toBe(true)
  expect((steps[0].evidence as any).toSelector).toBe("#totally-new-id")
  expect(await T.listFindings(PROJ)).toHaveLength(0) // a heal is not a bug
  // The healed selector is persisted so the next walk is Tier 0 again.
  const cache = await T.getCacheForStep(PROJ, steps[0].stepId)
  expect(cache?.resolvedSelector).toBe("#totally-new-id")
  expect(cache?.source).toBe("heal")
})

test("Tier-2 regression → RED + grounded finding (auto-file-eligible kind)", async () => {
  const trailId = await seedTrail()
  const walk = await walkTrail(PROJ, trailId, { fixtureUrl: FIX("checkout-mockup-removed.html"), vision: visionRemoved })
  expect(walk.verdict).toBe("red"); expect(walk.llmCalls).toBe(1)
  const fs = await T.listFindings(PROJ, { status: "queued" })
  const f = fs.find((x) => x.kind === "regression")
  expect(f).toBeTruthy()
  expect(f!.groundQuote).toContain("Sign in")
})

test("Tier-2 low confidence → AMBER + queue-only finding, element NOT acted on", async () => {
  const trailId = await seedTrail()
  const walk = await walkTrail(PROJ, trailId, { fixtureUrl: FIX("checkout-mockup-moved.html"), vision: visionLowConf })
  expect(walk.verdict).toBe("amber")
  expect(walk.llmCalls).toBe(1)
  const steps = await T.listRunSteps(PROJ, walk.runId)
  expect(steps[0].healed).toBe(false) // an unconfirmed target is never acted on / persisted
  const fs = await T.listFindings(PROJ)
  expect(fs.some((x) => x.kind === "amber_heal")).toBe(true)
})

test("no vision resolver → unchanged RED + needsVision (backward compatible)", async () => {
  const trailId = await seedTrail()
  const walk = await walkTrail(PROJ, trailId, { fixtureUrl: FIX("checkout-mockup-removed.html") })
  expect(walk.verdict).toBe("red")
  expect(walk.llmCalls).toBe(0)
  const steps = await T.listRunSteps(PROJ, walk.runId)
  expect((steps[0].evidence as any).needsVision).toBe(true)
})
