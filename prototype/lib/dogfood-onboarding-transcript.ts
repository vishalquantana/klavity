/**
 * AutoSim dogfood — walks the REAL onboarding → submit-a-call-transcript → get-a-Sim journey
 * against a LOCALLY SPAWNED server, using the real AutoSim runner + a real LLM. Klavity tests Klavity.
 *
 * Run:  bun run prototype/lib/dogfood-onboarding-transcript.ts
 * Needs: OPENROUTER_API_KEY (Bun auto-loads prototype/.env) — the transcript-extract step is a real
 *        LLM call, so we assert the JOURNEY (transcript accepted → a Sim card appears), not traits.
 *
 * What it does:
 *   1. Spawns `bun server.ts` on a fresh ephemeral SQLite DB with the test-OTP bypass enabled
 *      (KLAV_TEST_OTP + fixed code 666666) so the walk can log in with no live OTP.
 *   2. Crystallizes an onboarding trail into a SEPARATE ephemeral DB (trail/walk bookkeeping).
 *   3. Drives a real Playwright browser through the wizard (goal fork → email → OTP → project →
 *      pick "From a customer call" → Open the Studio → paste transcript → Extract Sims).
 *   4. Asserts the "Your Sims" tab activates and the Sim-count badge appears (>= 1 Sim extracted).
 *
 * See docs/superpowers/specs/2026-07-04-onboarding-transcript-selftest-design.md for the full design.
 */
import { tmpdir } from "node:os"
import { join } from "node:path"
import { readFileSync, rmSync } from "node:fs"

const EMAIL = "vishal@quantana.com.au" // device default test email (CLAUDE.md)
const PORT = Number(process.env.KLAV_DOGFOOD_PORT || 4419)
const BASE = `http://localhost:${PORT}`
const stamp = Date.now()

// ── 0. Real-LLM requirement (locked decision): fail LOUD, don't silently mock ──────────────────
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
if (!OPENROUTER_API_KEY) {
  console.error(
    "✗ OPENROUTER_API_KEY is not set. This dogfood makes a REAL extract call.\n" +
      "  Run from prototype/ (Bun auto-loads .env) or export the key first.",
  )
  process.exit(2)
}

const transcript = readFileSync(join(import.meta.dir, "..", "test-fixtures", "onboarding-call-transcript.txt"), "utf8")

// ── 1. Spawn the local server on a fresh, ephemeral DB with the test-OTP bypass ─────────────────
const serverDbFile = join(tmpdir(), `klav-dogfood-server-${stamp}.db`)
const dogfoodDbFile = join(tmpdir(), `klav-dogfood-trails-${stamp}.db`) // this process's trail/walk DB
console.log(`[server] spawning on ${BASE} · db=${serverDbFile}`)
const server = Bun.spawn(["bun", "server.ts"], {
  cwd: join(import.meta.dir, ".."), // prototype/
  env: {
    ...process.env,
    PORT: String(PORT),
    TURSO_DATABASE_URL: "file:" + serverDbFile,
    TURSO_AUTH_TOKEN: "", // force the local file DB, never a remote Turso
    KLAV_BASE_URL: BASE,
    KLAV_TEST_OTP: "1",
    KLAV_TEST_OTP_EMAILS: EMAIL,
    OPENROUTER_API_KEY,
  },
  stdout: "inherit",
  stderr: "inherit",
})

function cleanup() {
  try { server.kill() } catch {}
  for (const f of [serverDbFile, dogfoodDbFile]) {
    for (const suffix of ["", "-wal", "-shm"]) { try { rmSync(f + suffix, { force: true }) } catch {} }
  }
}
process.on("exit", cleanup)
process.on("SIGINT", () => { cleanup(); process.exit(130) })

// Poll until the server answers (initDb + schema run BEFORE Bun.serve listens, so a 200 means ready).
async function waitForServer(deadlineMs = 30_000) {
  const until = Date.now() + deadlineMs
  while (Date.now() < until) {
    try {
      const r = await fetch(BASE + "/", { signal: AbortSignal.timeout(2000) })
      if (r.ok) return
    } catch { /* not up yet */ }
    await Bun.sleep(300)
  }
  throw new Error(`server did not become ready on ${BASE} within ${deadlineMs}ms`)
}

// ── 2. Point THIS process's db at a separate ephemeral file (trail/walk bookkeeping only) ───────
process.env.TURSO_DATABASE_URL = "file:" + dogfoodDbFile
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
const tdb = reconnectDb("file:" + dogfoodDbFile)
await applySchema(tdb)
await migrateV2(tdb)

const { crystallize } = await import("./trails-crystallize")
const { walkTrail } = await import("./trails-runner")
const T = await import("./trails")

const PROJECT = "proj_dogfood_onboarding"

// ── 3. The trajectory: the real onboarding → transcript → Sim journey ───────────────────────────
// Every step uses a stable id already in the markup (dogfood-honest: no new product seams). The
// id-less "Open the Studio →" button resolves via Playwright's text engine. `wait` steps bridge the
// async round-trips (OTP request/verify) and the full-page nav to /app; the two long waits after
// "Extract Sims" cover the real LLM extract before we assert.
const ON = BASE + "/onboarding"
const APP = BASE + "/app"
const traj = {
  name: "Dogfood · onboarding → transcript → Sim",
  intent: "a new founder onboards, submits a customer-call transcript, and gets a Sim",
  baseUrl: ON,
  authorKind: "llm" as const,
  createdBy: "autosim-dogfood-onboarding",
  steps: [
    // Step 0 — goal fork: choose the Sims path (the full 3-step flow that ends at the Studio)
    { action: "click" as const, target: { role: "button", resolvedSelector: "#goalSims" }, url: ON, domHash: "onb-goalfork" },
    { action: "wait" as const, actionValue: "600", url: ON, domHash: "onb-step1-reveal" },
    // Step 1 — create the project (email + name), request the OTP
    { action: "type" as const, actionValue: EMAIL, target: { role: "textbox", accessibleName: "Your email", resolvedSelector: "#email" }, url: ON, domHash: "onb-step1" },
    { action: "type" as const, actionValue: "Northwind Books", target: { role: "textbox", resolvedSelector: "#projectName" }, url: ON, domHash: "onb-step1" },
    { action: "click" as const, target: { role: "button", resolvedSelector: "#createBtn" }, url: ON, domHash: "onb-step1" },
    { action: "wait" as const, actionValue: "1800", url: ON, domHash: "onb-code-reveal" },
    // Step 1b — enter the fixed test OTP, verify (sets the session cookie), renames project, advances
    { action: "type" as const, actionValue: "666666", target: { role: "textbox", resolvedSelector: "#code" }, url: ON, domHash: "onb-code" },
    { action: "click" as const, target: { role: "button", resolvedSelector: "#verifyBtn" }, url: ON, domHash: "onb-code" },
    { action: "wait" as const, actionValue: "3000", url: ON, domHash: "onb-step2" },
    // Step 2 — "add to your site": continue through to Sim selection
    { action: "click" as const, target: { role: "button", resolvedSelector: "#s2continue" }, url: ON, domHash: "onb-step2" },
    { action: "wait" as const, actionValue: "900", url: ON, domHash: "onb-step3" },
    // Step 3 — pick "From a customer call", then open the Studio (full-page nav to /app#add-transcript)
    { action: "click" as const, target: { role: "button", resolvedSelector: "#intentTranscript" }, url: ON, domHash: "onb-step3" },
    { action: "click" as const, target: { role: "button", text: "Open the Studio →", resolvedSelector: 'button:has-text("Open the Studio")' }, url: ON, domHash: "onb-step3" },
    { action: "wait" as const, actionValue: "3000", url: APP, domHash: "app-import-load" },
    // /app — the onboarding handoff opened the Import tab + focused the transcript box. Paste + extract.
    { action: "type" as const, actionValue: transcript, target: { role: "textbox", resolvedSelector: "#transcript" }, url: APP, domHash: "app-import" },
    { action: "click" as const, target: { role: "button", text: "Extract Sims", resolvedSelector: "#extractBtn" }, url: APP, domHash: "app-import" },
    // The real LLM extract (10–30s). Two capped waits + networkidle settle before we assert.
    { action: "wait" as const, actionValue: "15000", url: APP, domHash: "app-extracting" },
    { action: "wait" as const, actionValue: "15000", url: APP, domHash: "app-extracting" },
    // JOURNEY assert (not trait content): the Sim-count badge appears (>= 1 Sim) and the Sims tab is active.
    { action: "assert" as const, checkpoint: { description: "the 'Your Sims' count badge is visible (>= 1 Sim extracted)" }, target: { resolvedSelector: "#l1SimBadge" }, url: APP, domHash: "app-sims" },
    { action: "assert" as const, checkpoint: { description: "the 'Your Sims' tab pane is active after extraction" }, target: { resolvedSelector: "#pane-sims.on" }, url: APP, domHash: "app-sims" },
  ],
}

// ── 4. Boot, crystallize, walk ──────────────────────────────────────────────────────────────────
await waitForServer()
console.log("[server] ready ✓")

console.log("\n[trail] crystallizing onboarding→transcript journey…")
const crystal = await crystallize(PROJECT, traj)
console.log(`  trailId: ${crystal.trailId} · steps: ${traj.steps.length}`)

console.log("[walk] driving the browser (real LLM extract — allow ~30–60s)…")
const t0 = Date.now()
const result = await walkTrail(PROJECT, crystal.trailId, {
  fixtureUrl: ON,
  replay: false,
  deadlineMs: 180_000,
})
const dur = Date.now() - t0

// ── 5. Report ─────────────────────────────────────────────────────────────────────────────────
console.log(`\n[walk] done in ${dur}ms`)
console.log(`  verdict:     ${result.verdict}`)
console.log(`  llmCalls:    ${result.llmCalls}`)
console.log(`  healedCount: ${result.healedCount}`)
const runSteps = await T.listRunSteps(PROJECT, result.runId)
for (const s of result.steps) {
  const rs = runSteps.find((r) => r.idx === s.idx)
  const act = traj.steps[s.idx]?.action ?? "?"
  console.log(`  step[${String(s.idx).padStart(2)}] ${act.padEnd(8)} tier=${s.tier} verdict=${s.verdict} healed=${s.healed}` +
    (rs?.evidence ? ` evidence=${JSON.stringify(rs.evidence).slice(0, 160)}` : ""))
}
const walk = await T.getWalk(PROJECT, result.runId)
console.log(`  walk row: status=${walk?.status} finishedAt=${walk?.finishedAt}`)

console.log("\n═══════════════════════════════════════════════════════")
console.log("DOGFOOD SUMMARY · onboarding → transcript → Sim")
console.log("═══════════════════════════════════════════════════════")
const ok = result.verdict === "green" || result.verdict === "amber" // amber = self-healed, journey still worked
console.log(`Journey verdict: ${result.verdict.toUpperCase()} in ${dur}ms  ${ok ? "✓ transcript accepted → Sim appeared" : "✗ journey broke"}`)
if (result.healedCount) console.log(`(self-healed ${result.healedCount} step(s) — real product resilience exercised)`)
console.log("═══════════════════════════════════════════════════════")

cleanup()
process.exit(ok ? 0 : 1)
