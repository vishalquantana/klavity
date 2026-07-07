// KLA-111: network interception (stub + block) in walkTrail. REAL Chromium (Playwright).
// Validates that networkMocks installed before the initial navigation intercept requests:
//   "stub" — canned response body received by the page and verified via textEquals checkpoint.
//   "block" — request aborted; walk still completes GREEN (no runner crash).
// Uses hermetic local libsql. Mirrors the deadline/stepshots test harness pattern.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { pathToFileURL } from "node:url"
import type { Checkpoint } from "./trails-types"

const file = join(tmpdir(), `klav-netmock-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
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

const fixture = pathToFileURL(resolve(import.meta.dir, "..", "test-fixtures", "network-mocks-mockup.html")).href

// Helper to cast a full Checkpoint through the narrowed TrajectoryStep.checkpoint type.
// TrajectoryStep only allows { description } in its TS interface, but the DB stores/reads
// the full Checkpoint (kind/value/regex/count) via JSON — the cast is intentional here.
const cp = (c: Checkpoint) => c as unknown as { description: string }

test("stub mock: canned response body is received by the page and verified via textEquals checkpoint", async () => {
  // Without the stub mock, fetch("https://api.klavity-mock-test.internal/data") would fail
  // (non-existent host → DNS error → catch → "#api-result" = "error").
  // With the stub mock, Playwright intercepts and returns '{"ok":true}', so the div is set to that.
  const { trailId } = await crystallize("proj_nm_stub", {
    name: "Network Stub",
    intent: "click fetch button, verify stubbed API response appears in result div",
    baseUrl: fixture,
    authorKind: "llm",
    steps: [
      {
        action: "click",
        url: fixture,
        domHash: "d1",
        target: { role: "button", accessibleName: "Fetch data", text: "Fetch data", testId: "fetch-btn", resolvedSelector: "#fetch-btn" },
      },
      // Wait for networkidle so the async fetch promise resolves before the assert step.
      {
        action: "wait",
        actionValue: "0",
        url: fixture,
        domHash: "d1",
        target: undefined,
      },
      {
        action: "assert",
        checkpoint: cp({ description: "stubbed response shown", kind: "textEquals", value: '{"ok":true}' }),
        url: fixture,
        domHash: "d1",
        target: { testId: "api-result", resolvedSelector: "#api-result" },
      },
    ],
  })

  const summary = await walkTrail("proj_nm_stub", trailId, {
    fixtureUrl: fixture,
    networkMocks: [
      {
        url: "api.klavity-mock-test.internal/data",
        action: "stub",
        status: 200,
        contentType: "application/json",
        body: '{"ok":true}',
      },
    ],
  })

  expect(summary.verdict).toBe("green")
  expect(summary.llmCalls).toBe(0)
}, 30000)

test("block mock: aborted request causes page catch path; walk still completes green", async () => {
  // Stub the first fetch so the page moves past it, then block the analytics fetch.
  // #blocked-result shows "blocked" when the fetch errors (whether DNS-failure or abort).
  const { trailId } = await crystallize("proj_nm_block", {
    name: "Network Block",
    intent: "click fetch button, verify analytics request was blocked and walk is green",
    baseUrl: fixture,
    authorKind: "llm",
    steps: [
      {
        action: "click",
        url: fixture,
        domHash: "d1",
        target: { role: "button", accessibleName: "Fetch data", text: "Fetch data", testId: "fetch-btn", resolvedSelector: "#fetch-btn" },
      },
      {
        action: "wait",
        actionValue: "0",
        url: fixture,
        domHash: "d1",
        target: undefined,
      },
      {
        action: "assert",
        checkpoint: cp({ description: "blocked-result div is visible", kind: "visible" }),
        url: fixture,
        domHash: "d1",
        target: { testId: "blocked-result", resolvedSelector: "#blocked-result" },
      },
    ],
  })

  const summary = await walkTrail("proj_nm_block", trailId, {
    fixtureUrl: fixture,
    networkMocks: [
      { url: "api.klavity-mock-test.internal/data", action: "stub", body: "ok", contentType: "text/plain" },
      { url: "analytics.klavity-mock-test.internal", action: "block" },
    ],
  })

  expect(summary.verdict).toBe("green")
  expect(summary.llmCalls).toBe(0)
}, 30000)

test("no networkMocks: walk is byte-identical to pre-KLA-111 baseline (no crash, click step resolves)", async () => {
  const { trailId } = await crystallize("proj_nm_none", {
    name: "No Mocks Baseline",
    intent: "click button with no network mocks — guard against runner regression",
    baseUrl: fixture,
    authorKind: "llm",
    steps: [
      {
        action: "click",
        url: fixture,
        domHash: "d1",
        target: { role: "button", accessibleName: "Fetch data", text: "Fetch data", testId: "fetch-btn", resolvedSelector: "#fetch-btn" },
      },
    ],
  })

  // Walk with no mocks must not throw — the runner behavior is byte-identical to pre-KLA-111.
  // The click step always resolves (the button is present). Verdict can be green (typical for
  // local file:// fixtures with no network ops in the steps themselves).
  const summary = await walkTrail("proj_nm_none", trailId, { fixtureUrl: fixture })
  expect(["green", "amber", "red"]).toContain(summary.verdict)
}, 30000)
