// Layer C: the smallest runnable end-to-end Trail runner. REAL Chromium (Playwright).
// Tier 0 cached replay -> Tier 1 multi-candidate self-heal (role+name -> text -> testid -> structural).
// NO LLM / vision in this layer: Tier 2 just records an AMBER 'needs-vision' marker, never fakes a heal.
// Hermetic local libsql, mirrors lib/trails-crystallize.test.ts.
import { test as bunTest, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"

const file = join(tmpdir(), `klav-runner-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
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

const RUN_RUNNER_E2E = Bun.argv.some((arg) => arg.includes("trails-runner.e2e.test.ts"))
const test = RUN_RUNNER_E2E
  ? bunTest
  : ((name: string, ...rest: Parameters<typeof bunTest> extends [any, ...infer R] ? R : never) =>
      bunTest.skip(`${name} (skipped in full suite; run bun test ./lib/trails-runner.e2e.test.ts)`, ...rest)) as typeof bunTest

const fixtureUrl = (name: string) =>
  pathToFileURL(resolve(import.meta.dir, "../test-fixtures", name)).href

// A checkout trail: type email, type password, click Sign in, click Add plan, assert confirmation.
// Selectors are the "crystallized" concrete CSS from the baseline page.
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

test("(i) walks GREEN on the unchanged mockup with tier 'cache' on every step and zero LLM", async () => {
  const projectId = "proj_green"
  const { trailId } = await crystallize(projectId, checkoutTrajectory())

  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("checkout-mockup.html") })

  expect(summary.verdict).toBe("green")
  expect(summary.llmCalls).toBe(0)
  // every actionable step resolved from cache (the navigate-less trail has 5 steps)
  for (const s of summary.steps) {
    expect(s.tier).toBe("cache")
    expect(s.verdict).toBe("green")
    expect(s.healed).toBe(false)
  }

  // persisted: Walk + run_steps recorded via Layer A
  const walk = await T.getWalk(projectId, summary.runId)
  expect(walk?.status).toBe("green")
  expect(walk?.llmCalls).toBe(0)
  const runSteps = await T.listRunSteps(projectId, summary.runId)
  expect(runSteps).toHaveLength(5)
  expect(runSteps.every((r) => r.tier === "cache")).toBe(true)
}, 30000)

test("(i.b) run evidence pins the recorded step state, not just selector replay hints", async () => {
  const projectId = "proj_replay_pin"
  const { trailId, stepIds } = await crystallize(projectId, checkoutTrajectory())

  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("checkout-mockup.html") })

  await T.updateTrailStep(projectId, stepIds[0], { actionValue: "mutated@test.dev" })
  await T.upsertLocatorCache(projectId, {
    trailId,
    stepId: stepIds[0],
    cacheKey: "mutated-cache-key",
    resolvedSelector: "#mutated-email",
    confidence: 1,
    source: "heal",
  })

  const runSteps = await T.listRunSteps(projectId, summary.runId)
  const emailStep = runSteps.find((r) => r.idx === 0)!
  const recorded = (emailStep.evidence as any)?.recordedStep

  expect(recorded).toMatchObject({
    stepId: stepIds[0],
    idx: 0,
    action: "type",
    actionValue: "user@test.dev",
    selector: "#email",
    target: {
      role: "textbox",
      accessibleName: "Email",
      testId: "email-input",
    },
  })
  expect(recorded.actionValue).not.toBe("mutated@test.dev")
  expect(recorded.selector).not.toBe("#mutated-email")
}, 30000)

test("(i.c) applies the Trail's mobile viewport before navigation", async () => {
  const projectId = "proj_mobile_viewport"
  const responsiveFixture = "data:text/html," + encodeURIComponent(`<!doctype html><html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      #mobile-only { display:none }
      @media (max-width: 500px) { #mobile-only { display:block } }
    </style>
  </head><body><div id="mobile-only">Mobile checkout</div></body></html>`)
  const { trailId } = await crystallize(projectId, {
    name: "Mobile viewport",
    baseUrl: "https://app.test/",
    viewport: "mobile",
    authorKind: "llm" as const,
    steps: [
      { action: "assert" as const, checkpoint: { description: "mobile marker visible" }, url: "https://app.test/", domHash: "m1",
        target: { text: "Mobile checkout", resolvedSelector: "#mobile-only" } },
    ],
  })

  const summary = await walkTrail(projectId, trailId, { fixtureUrl: responsiveFixture })

  expect(summary.verdict).toBe("green")
  expect(summary.steps[0]).toMatchObject({ tier: "cache", verdict: "green" })
}, 30000)

test("(ii) Tier 1 heals a cosmetic rename by role+accessible-name -> AMBER (healed-but-unconfirmed, never green), zero LLM, healed selector persisted", async () => {
  const projectId = "proj_heal"
  const { trailId, stepIds } = await crystallize(projectId, checkoutTrajectory())

  // Same crystallized trail, pointed at the page where #signin id/class changed but role+name preserved.
  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("checkout-mockup-renamed.html") })

  // spec §6.3: a healed-but-unconfirmed step is AMBER, never GREEN -> the Walk rolls up to AMBER.
  expect(summary.verdict).toBe("amber")
  expect(summary.llmCalls).toBe(0)
  expect(summary.healedCount).toBeGreaterThanOrEqual(1)

  // the Sign in step (idx 2) healed via Tier 1 candidate; the action still executed, but verdict is AMBER.
  const signInStep = summary.steps.find((s) => s.idx === 2)!
  expect(signInStep.tier).toBe("candidate")
  expect(signInStep.healed).toBe(true)
  expect(signInStep.verdict).toBe("amber")

  // healed selector persisted back to locator_cache with source 'heal' (next Walk is Tier 0 again)
  const healed = await T.getCacheForStep(projectId, stepIds[2])
  expect(healed?.source).toBe("heal")
  expect(healed?.resolvedSelector).not.toBe("#signin")
  // it now points at the renamed element
  expect(healed?.resolvedSelector).toContain("auth-submit-x9")
}, 30000)

test("(ii.b) heal-as-reviewable-diff: both fromSelector (old) and toSelector (new) are recoverable from the run_step evidence", async () => {
  const projectId = "proj_heal_diff"
  const { trailId } = await crystallize(projectId, checkoutTrajectory())

  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("checkout-mockup-renamed.html") })

  // recover the healed run_step (Sign in, idx 2) and assert the reviewable diff is persisted (spec §6.4)
  const runSteps = await T.listRunSteps(projectId, summary.runId)
  const healedStep = runSteps.find((r) => r.idx === 2)!
  expect(healedStep.healed).toBe(true)
  expect(healedStep.verdict).toBe("amber")
  const ev = healedStep.evidence as any
  expect(ev.healed).toBe(true)
  // pre-heal selector recoverable
  expect(ev.fromSelector).toBe("#signin")
  // post-heal selector recoverable, points at the renamed element
  expect(ev.toSelector).toContain("auth-submit-x9")
  expect(ev.tier).toBe("candidate")
  expect(typeof ev.confidence).toBe("number")
  // candidateSignal records which Tier-1 signal matched
  expect(["role+name", "text", "testid", "domPath"]).toContain(ev.candidateSignal)
}, 30000)

test("(ii.c) Tier-1 confidence varies by signal strength: at least two distinct confidence values across candidate types", async () => {
  const projectId = "proj_mixed"
  const { trailId } = await crystallize(projectId, checkoutTrajectory())

  // Page where Sign-in heals via testid (0.92) and Add-plan heals via role+name (0.95).
  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("checkout-mockup-mixed-heals.html") })

  expect(summary.verdict).toBe("amber") // any heal -> AMBER
  expect(summary.healedCount).toBeGreaterThanOrEqual(2)

  const runSteps = await T.listRunSteps(projectId, summary.runId)
  const healedConfidences = runSteps.filter((r) => r.healed).map((r) => r.confidence)
  const distinct = new Set(healedConfidences)
  expect(distinct.size).toBeGreaterThanOrEqual(2) // not a flat tautology

  const signals = runSteps.filter((r) => r.healed).map((r) => (r.evidence as any)?.candidateSignal)
  expect(signals).toContain("testid")
  expect(signals).toContain("role+name")
}, 30000)

test("(iii) a genuinely-removed element produces RED, never a silent green", async () => {
  const projectId = "proj_red"
  const { trailId } = await crystallize(projectId, checkoutTrajectory())

  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("checkout-mockup-removed.html") })

  expect(summary.verdict).toBe("red")
  expect(summary.llmCalls).toBe(0)
  // the Sign in step (idx 2) is the break: not green, all tiers exhausted
  const signInStep = summary.steps.find((s) => s.idx === 2)!
  expect(signInStep.verdict).toBe("red")
  expect(signInStep.healed).toBe(false)

  const walk = await T.getWalk(projectId, summary.runId)
  expect(walk?.status).toBe("red")
}, 30000)

test("(iv) a thrown error inside the Walk finalizes the run as RED/finished (never left 'running'), summary.error set", async () => {
  const projectId = "proj_throw"
  const { trailId } = await crystallize(projectId, checkoutTrajectory())

  // An unreachable fixtureUrl makes page.goto throw -> walkTrail must still finalize the run.
  const summary = await walkTrail(projectId, trailId, { fixtureUrl: "http://127.0.0.1:1/never-resolves" })

  expect(summary.verdict).toBe("red")
  const walk = await T.getWalk(projectId, summary.runId)
  expect(walk?.status).toBe("red")
  expect(walk?.finishedAt).toBeGreaterThan(0)
  expect((walk?.summary as any)?.error).toBeTruthy()
}, 30000)

test("(v) a testId containing a double-quote round-trips through cache and resolves (attr escaping)", async () => {
  const projectId = "proj_quote"
  // A trail whose Sign-in target carries a testId with an embedded double-quote.
  const traj = {
    name: "Quote testid",
    intent: "click the weird-testid button",
    baseUrl: "https://app.test/",
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "click" as const, url: "https://app.test/", domHash: "dq",
        target: { role: "button", accessibleName: "Quote", text: "Quote", testId: 'weird"id', resolvedSelector: 'button[data-testid="weird\\"id"]' } },
    ],
  }
  const { trailId, stepIds } = await crystallize(projectId, traj)

  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("checkout-mockup-quote-testid.html") })

  // The cached selector resolves the element and the click executes (no heal needed) -> GREEN.
  const step = summary.steps[0]
  expect(step.verdict).toBe("green")
  expect(step.tier).toBe("cache")
  // round-trips: the cache row still holds the escaped selector
  const row = await T.getCacheForStep(projectId, stepIds[0])
  expect(row?.resolvedSelector).toContain("weird")
}, 30000)

test("(vi) an ambiguous selector (matches >1 elements) fails RED with reason=ambiguous_selector and queues a regression finding — never silently acts on an arbitrary match", async () => {
  const projectId = "proj_ambiguous"
  // Crystallize with selector '.dup-btn' which matches TWO buttons in the fixture.
  // At crystallize time it looks valid (the author may not know count>1 at run time).
  const traj = {
    name: "Ambiguous click",
    intent: "click the duplicate-class button",
    baseUrl: "https://app.test/",
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "click" as const, url: "https://app.test/", domHash: "da",
        target: { role: "button", text: "Action A", resolvedSelector: ".dup-btn" } },
    ],
  }
  const { trailId, stepIds } = await crystallize(projectId, traj)
  await T.setTrailStatus(projectId, trailId, "active")

  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("checkout-mockup-ambiguous.html") })

  // Walk must be RED (not green or amber) — silent wrong-click is worse than a clear failure.
  expect(summary.verdict).toBe("red")

  // The failing step must record reason=ambiguous_selector in evidence (not element_gone).
  const runSteps = await T.listRunSteps(projectId, summary.runId)
  expect(runSteps).toHaveLength(1)
  const rs = runSteps[0]
  expect(rs.verdict).toBe("red")
  expect((rs.evidence as any)?.reason).toBe("ambiguous_selector")
  expect((rs.evidence as any)?.matchCount).toBe(2)
  expect((rs.evidence as any)?.selector).toBe(".dup-btn")

  // A regression finding must be queued with a clear, human-readable title.
  const findings = await T.listFindings(projectId)
  expect(findings.length).toBeGreaterThanOrEqual(1)
  const f = findings[0]
  expect(f.kind).toBe("regression")
  // Title should explain the problem in plain English
  expect(f.title).toContain("2")        // match count
  expect(f.title).toContain(".dup-btn") // the offending selector
  expect(f.title.toLowerCase()).toMatch(/selector|element/) // human-readable label
  expect(f.dedupKey).toContain("ambiguous_selector")

  // Also assert: a UNIQUE selector on the same fixture walks GREEN (control case).
  const traj2 = {
    name: "Unique click control",
    intent: "click the unique button",
    baseUrl: "https://app.test/",
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "click" as const, url: "https://app.test/", domHash: "db",
        target: { role: "button", text: "Unique", resolvedSelector: "#unique-btn" } },
    ],
  }
  const ctrl = await crystallize(projectId, traj2)
  const ctrlSummary = await walkTrail(projectId, ctrl.trailId, { fixtureUrl: fixtureUrl("checkout-mockup-ambiguous.html") })
  expect(ctrlSummary.verdict).toBe("green")
}, 30000)

test("(vi-b) KLA-87: a queued finding carries the failure screenshotKey when stepShots is on", async () => {
  const projectId = "proj_kla87_shotkey"
  const traj = {
    name: "Ambiguous click (shot)",
    intent: "click a duplicated button",
    baseUrl: "https://app.test/",
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "click" as const, url: "https://app.test/", domHash: "da",
        target: { role: "button", text: "Action A", resolvedSelector: ".dup-btn" } },
    ],
  }
  const { trailId } = await crystallize(projectId, traj)
  await T.setTrailStatus(projectId, trailId, "active")

  let uploads = 0
  const fakeUploader = async (_b: Uint8Array, _ct: string): Promise<{ key: string }> => {
    uploads++
    return { key: "shot_finding_" + uploads }
  }

  const summary = await walkTrail(projectId, trailId, {
    fixtureUrl: fixtureUrl("checkout-mockup-ambiguous.html"),
    stepShots: true,
    shotUploader: fakeUploader,
  })
  expect(summary.verdict).toBe("red")

  // KLA-87: the recorded finding must carry a failure screenshotKey in its evidence so the review
  // queue can render a thumbnail next to it (previously the key lived only in run_step evidence).
  const findings = await T.listFindings(projectId)
  const f = findings.find((x) => x.dedupKey.includes("ambiguous_selector"))
  expect(f).toBeTruthy()
  expect((f!.evidence as any)?.screenshotKey).toMatch(/^shot_finding_\d+$/)
  expect(uploads).toBeGreaterThanOrEqual(1)
}, 30000)

test("(vii) inline go(N) wizard transition regression is tagged RED after fallback", async () => {
  const projectId = "proj_inline_go"
  const traj = {
    name: "Inline go wizard",
    intent: "click Continue and detect a trusted-event transition regression",
    baseUrl: "https://app.test/",
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "click" as const, url: "https://app.test/", domHash: "wg0",
        target: { role: "button", accessibleName: "Continue", text: "Continue", resolvedSelector: "#continue" } },
    ],
  }
  const { trailId } = await crystallize(projectId, traj)

  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("onclick-wizard-trusted-block.html") })

  expect(summary.verdict).toBe("red")
  expect(summary.steps).toHaveLength(1)
  expect(summary.steps[0].verdict).toBe("red")
  const steps = await T.listRunSteps(projectId, summary.runId)
  expect(steps[0].diagnosis).toBe("interaction_change")
}, 30000)

test("(viii) inline wizard with unrecognized fn name + trusted-block guard transitions correctly (KLA-58)", async () => {
  const projectId = "proj_inline_unknown"
  const traj = {
    name: "Unknown-fn wizard",
    intent: "click Continue (uses showStep not go) and reach the name step",
    baseUrl: "https://app.test/",
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "click" as const, url: "https://app.test/", domHash: "uf0",
        target: { role: "button", accessibleName: "Continue", text: "Continue", resolvedSelector: "#continue" } },
      { action: "assert" as const, checkpoint: { description: "name input visible after Continue" }, url: "https://app.test/", domHash: "uf1",
        target: { role: "textbox", accessibleName: "Full name", resolvedSelector: "#fullname" } },
    ],
  }
  const { trailId } = await crystallize(projectId, traj)

  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("onclick-wizard-unknown-fn.html") })

  expect(summary.verdict).toBe("green")
  expect(summary.steps).toHaveLength(2)
  expect(summary.steps[0].verdict).toBe("green")
  expect(summary.steps[1].verdict).toBe("green")
}, 30000)

test("(ix) 6s CSS-animated panel transition passes when per-step timeoutMs exceeds the duration (KLA-67)", async () => {
  const projectId = "proj_kla67_anim"
  // The fixture uses Web Animations API to delay panel reveal by 6s. Without per-step
  // timeoutMs the old 5s cap would cause the assert to fail; with timeoutMs=10000 it passes.
  const traj = {
    name: "Animated panel",
    intent: "click Next and reach the name input after a 6s animated reveal",
    baseUrl: "https://app.test/",
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "click" as const, url: "https://app.test/", domHash: "ap0",
        // timeoutMs covers the animated settle wait in clickWithTransitionFallback
        timeoutMs: 10000,
        target: { role: "button", accessibleName: "Next", text: "Next", resolvedSelector: "#next" } },
      { action: "assert" as const, url: "https://app.test/", domHash: "ap1",
        // timeoutMs covers the assert waitFor after the panel appears
        timeoutMs: 10000,
        checkpoint: { description: "name input visible after animated reveal" },
        target: { role: "textbox", accessibleName: "Full name", resolvedSelector: "#name" } },
    ],
  }
  const { trailId } = await crystallize(projectId, traj)

  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("css-transition-panel.html") })

  expect(summary.verdict).toBe("green")
  expect(summary.steps).toHaveLength(2)
  expect(summary.steps[0].verdict).toBe("green")
  expect(summary.steps[1].verdict).toBe("green")
}, 20000)

test("(x) hard-broken click (go() does nothing) fails RED fast — no animation delay (KLA-67)", async () => {
  const projectId = "proj_kla67_broken"
  // The fixture's go() is a no-op: no Web Animation starts so waitForAnimationSettle exits
  // immediately (fast path), the fallback fires within ~400ms, and the assert fails fast.
  // Using timeoutMs:10000 on the click step and timeoutMs:2000 on the assert so we can
  // verify the broken path finishes well under the click step's full budget.
  const traj = {
    name: "Broken panel",
    intent: "click Next (broken) and try to reach name input",
    baseUrl: "https://app.test/",
    authorKind: "llm" as const,
    createdBy: "agent@klavity",
    steps: [
      { action: "click" as const, url: "https://app.test/", domHash: "bp0",
        timeoutMs: 10000,
        target: { role: "button", accessibleName: "Next", text: "Next", resolvedSelector: "#next" } },
      // Short timeout on assert — the panel never appears so it will fail within 2s.
      { action: "assert" as const, url: "https://app.test/", domHash: "bp1",
        timeoutMs: 2000,
        checkpoint: { description: "name input visible" },
        target: { role: "textbox", accessibleName: "Full name", resolvedSelector: "#name" } },
    ],
  }
  const { trailId } = await crystallize(projectId, traj)

  const start = Date.now()
  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("css-transition-broken.html") })
  const elapsed = Date.now() - start

  expect(summary.verdict).toBe("red")
  // Click step settles fast (no animations → no long wait), assert times out in 2s.
  // Total must be well under the click step's 10s budget — proves no spurious animation delay.
  expect(elapsed).toBeLessThan(6000)
}, 20000)

test("(xi) RED walk with NO vision resolver still emits at least one Finding (KLA-82)", async () => {
  const projectId = "proj_kla82_finding"
  // Use the removed-element fixture: #signin is absent. Without a vision resolver, the runner
  // previously recorded RED run_steps but no Findings — failure was invisible in reports.
  const { trailId } = await crystallize(projectId, checkoutTrajectory())
  await T.setTrailStatus(projectId, trailId, "active")

  // Explicitly pass NO vision resolver — the bug path.
  const summary = await walkTrail(projectId, trailId, { fixtureUrl: fixtureUrl("checkout-mockup-removed.html") })

  expect(summary.verdict).toBe("red")
  expect(summary.llmCalls).toBe(0) // confirm zero LLM calls

  // KLA-82 guarantee: at least one Finding must exist even without a vision resolver.
  const findings = await T.listFindings(projectId)
  expect(findings.length).toBeGreaterThanOrEqual(1)

  const f = findings[0]
  expect(f.kind).toBe("regression")
  expect(f.trailId).toBe(trailId)
  // Finding title must describe what failed (element name or action)
  expect(f.title.length).toBeGreaterThan(0)
  // dedupKey is stable (same run of the same trail+step always produces the same key)
  expect(f.dedupKey).toContain(trailId)
}, 30000)
