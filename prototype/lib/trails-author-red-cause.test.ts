// KLAVITYKLA-116: unit tests for the RED-verification cause classifier. Pure function — no browser/DB,
// but importing trails-author.ts pulls modules that expect DB env, so we set a throwaway file DB first
// (matching the sibling trails-author-analysis test) before importing.
import { expect, test } from "bun:test"
import { join } from "node:path"
import { tmpdir } from "node:os"

const file = join(tmpdir(), `klav-red-cause-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-test-secret-key-32bytes").toString("base64")

const { classifyRedCause } = await import("./trails-author")

type Log = Array<{ idx: number; op: string; selector: string | null; value: string | null; rationale?: string }>

const authorLog: Log = [
  { idx: 0, op: "navigate", selector: null, value: "https://app.example.com", rationale: "start" },
  { idx: 1, op: "type", selector: "#email", value: "new-user@example.com", rationale: "enter email" },
  { idx: 2, op: "click", selector: "#signup-submit", value: null, rationale: "submit the signup form" },
  { idx: 3, op: "assert", selector: ".welcome", value: null, rationale: "confirm we landed on the dashboard" },
]

test("selector-drift: element-not-found reason on an interaction step", () => {
  const walk = {
    verdict: "red",
    steps: [
      { idx: 0, verdict: "green", healed: false },
      { idx: 1, verdict: "green", healed: false },
      { idx: 2, verdict: "red", healed: false, failureKind: "regression" },
    ],
    reasons: ["Step 2 (click): selector #signup-submit did not resolve to any element on the page"],
    evidence: null,
  }
  const d = classifyRedCause(walk, authorLog)
  expect(d.kind).toBe("selector-drift")
  expect(d.stepIdx).toBe(2)
  expect(d.authoredStep).toContain("#signup-submit")
  expect(d.explanation.length).toBeGreaterThan(20)
  expect(d.remedy.toLowerCase()).toContain("re-author")
})

test("state-dependence: 'account already exists' beats a generic selector signal", () => {
  const walk = {
    verdict: "red",
    steps: [
      { idx: 1, verdict: "green", healed: false },
      { idx: 2, verdict: "red", healed: false },
    ],
    reasons: ["Step 2 (click): the page showed \"An account with this email already exists\""],
    evidence: { pageErrors: [], consoleLogs: [{ level: "error", text: "409 Conflict: email already registered" }] },
  }
  const d = classifyRedCause(walk, authorLog)
  expect(d.kind).toBe("state-dependence")
  expect(d.stepIdx).toBe(2)
  expect(d.remedy.toLowerCase()).toMatch(/reset|fresh|clean/)
})

test("timing-flake: navigation timeout classifies as transient", () => {
  const walk = {
    verdict: "red",
    steps: [
      { idx: 2, verdict: "green", healed: false },
      { idx: 3, verdict: "red", healed: false },
    ],
    reasons: ["Step 3 (assert): navigation timeout of 30000ms exceeded waiting for the page to settle"],
    evidence: null,
  }
  const d = classifyRedCause(walk, authorLog)
  expect(d.kind).toBe("timing-flake")
  expect(d.stepIdx).toBe(3)
  expect(d.remedy.toLowerCase()).toContain("re-verify")
})

test("timing-flake: a 5xx failed response counts as transient even without keyword text", () => {
  const walk = {
    verdict: "red",
    steps: [{ idx: 2, verdict: "red", healed: false }],
    reasons: ["Step 2 failed"],
    evidence: { failedResponses: [{ url: "https://api.example.com/signup", method: "POST", status: 503 }] },
  }
  const d = classifyRedCause(walk, authorLog)
  expect(d.kind).toBe("timing-flake")
})

test("selector-drift: a healed step with no other signal points at locator adaptation", () => {
  const walk = {
    verdict: "red",
    steps: [
      { idx: 1, verdict: "amber", healed: true },
      { idx: 2, verdict: "red", healed: false },
    ],
    reasons: ["Step 2 failed"],
    evidence: null,
  }
  const d = classifyRedCause(walk, authorLog)
  expect(d.kind).toBe("selector-drift")
})

test("unknown: an assert-only red with no interaction/selector/state/timing signal", () => {
  const log: Log = [{ idx: 0, op: "wait", selector: null, value: "2000", rationale: "let it load" }]
  const walk = {
    verdict: "red",
    steps: [{ idx: 0, verdict: "red", healed: false }],
    reasons: ["Step 0 produced an unexpected result"],
    evidence: null,
  }
  const d = classifyRedCause(walk, log)
  expect(d.kind).toBe("unknown")
  expect(d.remedy.toLowerCase()).toContain("re-verify")
})

test("no failing step in the summary → null stepIdx, still returns a usable diagnosis", () => {
  const walk = { verdict: "red", steps: [], reasons: ["Walk ended red"], evidence: null }
  const d = classifyRedCause(walk, authorLog)
  expect(d.stepIdx).toBeNull()
  expect(d.authoredStep).toBeNull()
  expect(typeof d.explanation).toBe("string")
  expect(typeof d.remedy).toBe("string")
})
