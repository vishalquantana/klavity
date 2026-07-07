// KLA-122: flash-lite model-mix unit tests.
// Pure logic tests — no network, no DB.
// Tests:
//   (A) disabled (KLAV_AUTHOR_MODEL_MIX unset) → DEFAULT_WEIGHTS for both simple and hard steps.
//   (B) enabled → simple step uses LITE_WEIGHTS (flash-lite).
//   (C) enabled → hard step (has credFields) uses DEFAULT_WEIGHTS.
//   (D) enabled → hard step (long history) uses DEFAULT_WEIGHTS.
//   (E) enabled → hard step (large DOM) uses DEFAULT_WEIGHTS.
//   (F) enabled → objective verifier always uses LITE_WEIGHTS.
//   (G) disabled → objective verifier uses DEFAULT_WEIGHTS.

import { test, expect } from "bun:test"
import {
  isSimpleAuthorStep,
  selectAuthorWeights,
  selectVerifierWeights,
  LITE_WEIGHTS,
  LITE_MODEL,
} from "./trails-author-model"
import { DEFAULT_WEIGHTS } from "./models"
import type { AuthorStepInput } from "./trails-author-model"

// Helpers to build minimal AuthorStepInput fixtures.
function simpleInput(overrides: Partial<AuthorStepInput> = {}): AuthorStepInput {
  return {
    objective: "Click the login button",
    pageUrl: "https://example.com/login",
    screenshotB64: "",
    mediaType: "image/jpeg",
    domSnapshot: "<button>Login</button>",   // short DOM
    history: [],                              // no prior steps
    credFields: [],                           // no credentials
    ...overrides,
  }
}

// ── (A) Disabled: both simple and hard use DEFAULT_WEIGHTS ─────────────────
test("(A) KLA-122: model-mix disabled → DEFAULT_WEIGHTS for all steps", () => {
  const simple = simpleInput()
  const hard   = simpleInput({ credFields: ["{{cred:alice:password}}"] })

  expect(selectAuthorWeights(simple, false)).toBe(DEFAULT_WEIGHTS)
  expect(selectAuthorWeights(hard,   false)).toBe(DEFAULT_WEIGHTS)
})

// ── (B) Enabled: simple step → LITE_WEIGHTS ────────────────────────────────
test("(B) KLA-122: model-mix enabled, simple step → LITE_WEIGHTS", () => {
  const input = simpleInput()
  expect(isSimpleAuthorStep(input)).toBe(true)
  const w = selectAuthorWeights(input, true)
  expect(w).toBe(LITE_WEIGHTS)
  expect(w[LITE_MODEL]).toBe(100)
})

// ── (C) Enabled: cred fields present → hard → DEFAULT_WEIGHTS ─────────────
test("(C) KLA-122: model-mix enabled, credFields present → DEFAULT_WEIGHTS", () => {
  const input = simpleInput({ credFields: ["{{cred:user:password}}", "{{cred:user:email}}"] })
  expect(isSimpleAuthorStep(input)).toBe(false)
  expect(selectAuthorWeights(input, true)).toBe(DEFAULT_WEIGHTS)
})

// ── (D) Enabled: long history → hard → DEFAULT_WEIGHTS ────────────────────
test("(D) KLA-122: model-mix enabled, history > 3 → DEFAULT_WEIGHTS", () => {
  const input = simpleInput({ history: ["step1", "step2", "step3", "step4"] }) // 4 steps
  expect(isSimpleAuthorStep(input)).toBe(false)
  expect(selectAuthorWeights(input, true)).toBe(DEFAULT_WEIGHTS)
})

// ── (E) Enabled: large DOM → hard → DEFAULT_WEIGHTS ───────────────────────
test("(E) KLA-122: model-mix enabled, large DOM snapshot → DEFAULT_WEIGHTS", () => {
  const longDom = "x".repeat(6001)
  const input = simpleInput({ domSnapshot: longDom })
  expect(isSimpleAuthorStep(input)).toBe(false)
  expect(selectAuthorWeights(input, true)).toBe(DEFAULT_WEIGHTS)
})

// ── (F) Enabled: verifier always lite ─────────────────────────────────────
test("(F) KLA-122: model-mix enabled → verifier always uses LITE_WEIGHTS", () => {
  const w = selectVerifierWeights(true)
  expect(w).toBe(LITE_WEIGHTS)
  expect(w[LITE_MODEL]).toBe(100)
})

// ── (G) Disabled: verifier uses DEFAULT_WEIGHTS ────────────────────────────
test("(G) KLA-122: model-mix disabled → verifier uses DEFAULT_WEIGHTS", () => {
  expect(selectVerifierWeights(false)).toBe(DEFAULT_WEIGHTS)
})
