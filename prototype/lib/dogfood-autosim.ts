/**
 * AutoSim dogfood runner — walks two real Klavity journeys against prod.
 * Run: bun run prototype/lib/dogfood-autosim.ts
 *
 * Trail 1 (home-assert): navigate to klavity.in, assert <h1> heading visible.
 * Trail 2 (home→cta→onboarding): click "Get started" from home, assert email input on /onboarding.
 *
 * Uses a local ephemeral SQLite DB (no Turso key needed).
 */
import { tmpdir } from "node:os"
import { join } from "node:path"

const dbFile = join(tmpdir(), `klav-dogfood-${Date.now()}.db`)
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
const BASE = "https://klavity.in"

// ── Trail 1: home page heading assert ──────────────────────────────────────
console.log("\n[Trail 1] Crystallizing home-assert trail…")
const homeTraj = {
  name: "Dogfood · home heading",
  intent: "the Klavity landing page loads and the hero heading is present",
  baseUrl: BASE + "/",
  authorKind: "llm" as const,
  createdBy: "autosim-dogfood",
  steps: [
    {
      action: "assert" as const,
      checkpoint: { description: "hero heading 'Your customers are in the room' is visible" },
      // h1 with the brand headline — present on every page load
      target: {
        role: "heading",
        text: "Your customers are",
        resolvedSelector: "h1",
      },
      url: BASE + "/",
      domHash: "home",
    },
  ],
}

const home = await crystallize(PROJECT, homeTraj)
console.log(`  trailId: ${home.trailId}`)

console.log("[Trail 1] Walking…")
const t0 = Date.now()
const homeResult = await walkTrail(PROJECT, home.trailId, {
  fixtureUrl: BASE + "/",
  replay: false,
  deadlineMs: 60_000,
})
const dur1 = Date.now() - t0
console.log(`[Trail 1] Done in ${dur1}ms`)
console.log(`  verdict:     ${homeResult.verdict}`)
console.log(`  llmCalls:    ${homeResult.llmCalls}`)
console.log(`  healedCount: ${homeResult.healedCount}`)
for (const s of homeResult.steps) {
  console.log(`  step[${s.idx}] tier=${s.tier} verdict=${s.verdict} healed=${s.healed}`)
}
const homeWalk = await T.getWalk(PROJECT, homeResult.runId)
console.log(`  walk row status: ${homeWalk?.status}, finishedAt: ${homeWalk?.finishedAt}`)
const homeFindings = await T.listFindings(PROJECT)
console.log(`  findings queued: ${homeFindings.length}`)

// ── Trail 2: onboarding intro → step 1 email form ───────────────────────
// Navigates directly to /onboarding (Step 0 welcome), clicks "Get started →"
// to reveal Step 1, then asserts the email input is visible.
// NOTE: .hero-cta appears TWICE on the home page (hero + footer) — using it
// directly would cause selector ambiguity. AutoSim correctly surfaced this.
console.log("\n[Trail 2] Crystallizing onboarding-flow trail…")
const ctaTraj = {
  name: "Dogfood · onboarding intro→form",
  intent: "visit /onboarding, click through intro, reach the email signup form",
  baseUrl: BASE + "/onboarding",
  authorKind: "llm" as const,
  createdBy: "autosim-dogfood",
  steps: [
    // Step 0: assert the intro welcome heading is visible on /onboarding step 0
    {
      action: "assert" as const,
      checkpoint: { description: "Welcome to Klavity intro heading is visible" },
      target: {
        role: "heading",
        text: "Your customers review",
        resolvedSelector: ".panel.step[data-s='0'] h1",
      },
      url: BASE + "/onboarding",
      domHash: "onboarding-intro",
    },
    // Step 1: click "Get started →" on the intro (calls go(1), reveals step 1)
    {
      action: "click" as const,
      target: {
        role: "button",
        text: "Get started →",
        resolvedSelector: ".panel.step[data-s='0'] button.btn-indigo",
      },
      url: BASE + "/onboarding",
      domHash: "onboarding-intro",
    },
    // Step 2: wait for step 1 panel to animate in
    {
      action: "wait" as const,
      url: BASE + "/onboarding",
      domHash: "onboarding-step1-load",
    },
    // Step 3: assert the email input is now visible (step 1 panel revealed)
    {
      action: "assert" as const,
      checkpoint: { description: "email input is visible on the onboarding step 1 form" },
      target: {
        role: "textbox",
        accessibleName: "Your email",
        resolvedSelector: "#email",
      },
      url: BASE + "/onboarding",
      domHash: "onboarding-form",
    },
  ],
}

const cta = await crystallize(PROJECT, ctaTraj)
console.log(`  trailId: ${cta.trailId}`)

console.log("[Trail 2] Walking…")
const t1 = Date.now()
const ctaResult = await walkTrail(PROJECT, cta.trailId, {
  fixtureUrl: BASE + "/onboarding",
  replay: false,
  deadlineMs: 60_000,
})
const dur2 = Date.now() - t1
console.log(`[Trail 2] Done in ${dur2}ms`)
console.log(`  verdict:     ${ctaResult.verdict}`)
console.log(`  llmCalls:    ${ctaResult.llmCalls}`)
console.log(`  healedCount: ${ctaResult.healedCount}`)
for (const s of ctaResult.steps) {
  const runSteps = await T.listRunSteps(PROJECT, ctaResult.runId)
  const rs = runSteps.find((r) => r.idx === s.idx)
  console.log(`  step[${s.idx}] tier=${s.tier} verdict=${s.verdict} healed=${s.healed} evidence=${JSON.stringify(rs?.evidence ?? null)}`)
}
const ctaWalk = await T.getWalk(PROJECT, ctaResult.runId)
console.log(`  walk row status: ${ctaWalk?.status}, finishedAt: ${ctaWalk?.finishedAt}`)
const allFindings = await T.listFindings(PROJECT)
const newFindings = allFindings.filter((f) => f.trailId === cta.trailId)
console.log(`  findings for this trail: ${newFindings.length}`)
for (const f of newFindings) {
  console.log(`    [${f.kind}] ${f.title} (confidence=${f.confidence}, dedup=${f.dedupKey})`)
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════════════")
console.log("DOGFOOD SUMMARY")
console.log("═══════════════════════════════════════════════════════")
console.log(`Trail 1 (home-assert):          ${homeResult.verdict.toUpperCase()} in ${dur1}ms`)
console.log(`Trail 2 (home→cta→onboarding):  ${ctaResult.verdict.toUpperCase()} in ${dur2}ms`)
const totalFindings = await T.listFindings(PROJECT)
console.log(`Total findings queued:          ${totalFindings.length}`)
for (const f of totalFindings) {
  console.log(`  • [${f.kind}] ${f.title}`)
}
console.log("═══════════════════════════════════════════════════════")
