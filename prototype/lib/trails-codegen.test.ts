// Layer B: codegen is PURE (no DB, no browser, no LLM). Trail + steps + selectors -> Playwright code string.
import { test, expect } from "bun:test"
import { generatePlaywright } from "./trails-codegen"
import type { Trail, TrailStep } from "./trails-types"

function mkTrail(over: Partial<Trail> = {}): Trail {
  return {
    id: "trl_x", projectId: "proj_A", name: "Login flow", intent: "log in", baseUrl: "https://app.test/",
    baselineRef: null, authorKind: "llm", status: "draft", createdBy: null,
    createdAt: 1, updatedAt: 1, ...over,
  }
}

function mkStep(over: Partial<TrailStep> & { id: string; idx: number }): TrailStep {
  return {
    trailId: "trl_x", projectId: "proj_A", action: "click", actionValue: null,
    target: null, checkpoint: null, createdAt: 1, ...over,
  } as TrailStep
}

test("generatePlaywright emits importable @playwright/test with goto(baseUrl) and a line per step", () => {
  const trail = mkTrail()
  const steps: TrailStep[] = [
    mkStep({ id: "s0", idx: 0, action: "navigate", actionValue: "https://app.test/login" }),
    mkStep({ id: "s1", idx: 1, action: "type", actionValue: "user@test.dev" }),
    mkStep({ id: "s2", idx: 2, action: "click" }),
    mkStep({ id: "s3", idx: 3, action: "assert", checkpoint: { description: "dashboard visible" } }),
  ]
  const selectors = { s1: "#email", s2: "#submit", s3: ".dashboard" }
  const code = generatePlaywright(trail, steps, selectors)

  expect(code).toContain("import { test, expect } from '@playwright/test'")
  expect(code).toContain("test('Login flow'")
  expect(code).toContain("await page.goto('https://app.test/')")           // baseUrl first
  expect(code).toContain("await page.goto('https://app.test/login')")      // navigate step
  expect(code).toContain("await page.fill('#email', 'user@test.dev')")     // type step
  expect(code).toContain("await page.click('#submit')")                    // click step
  expect(code).toContain("expect(")                                        // checkpoint -> assertion
  expect(code).toContain(".dashboard")                                     // checkpoint selector
  expect(code).toContain("dashboard visible")                              // verbatim description
})

test("generatePlaywright escapes single quotes in values to keep JS valid", () => {
  const trail = mkTrail({ baseUrl: "https://app.test/" })
  const steps: TrailStep[] = [
    mkStep({ id: "s0", idx: 0, action: "type", actionValue: "O'Brien" }),
  ]
  const code = generatePlaywright(trail, steps, { s0: "#name" })
  expect(code).toContain("O\\'Brien")
  // no unescaped lone quote that would break the literal
  expect(code).not.toContain("'O'Brien'")
})

test("generatePlaywright handles select and wait actions", () => {
  const trail = mkTrail()
  const steps: TrailStep[] = [
    mkStep({ id: "s0", idx: 0, action: "select", actionValue: "Pro" }),
    mkStep({ id: "s1", idx: 1, action: "wait", actionValue: "500" }),
  ]
  const code = generatePlaywright(trail, steps, { s0: "#plan" })
  expect(code).toContain("await page.selectOption('#plan', 'Pro')")
  expect(code).toContain("await page.waitForTimeout(500)")
})

test("checkpoint without a selector still preserves description and stays runnable", () => {
  const trail = mkTrail()
  const steps: TrailStep[] = [
    mkStep({ id: "s0", idx: 0, action: "assert", checkpoint: { description: "no errors shown" } }),
  ]
  const code = generatePlaywright(trail, steps, {})
  expect(code).toContain("no errors shown")
  expect(code).toContain("expect(")
})

// ── Bug KLA-110: steps must never be silently dropped ──────────────────────
test("click/type/select without selectors emit TODO comments instead of being silently dropped", () => {
  const trail = mkTrail()
  const steps: TrailStep[] = [
    mkStep({ id: "s0", idx: 0, action: "click" }),
    mkStep({ id: "s1", idx: 1, action: "type", actionValue: "hello" }),
    mkStep({ id: "s2", idx: 2, action: "select", actionValue: "Option A" }),
  ]
  const code = generatePlaywright(trail, steps, {}) // no selectors
  expect(code).toContain("// TODO: step 0 (click)")
  expect(code).toContain("// TODO: step 1 (type)")
  expect(code).toContain("// TODO: step 2 (select)")
  // Three action steps + the leading goto must all appear
  const actionLines = code.split("\n").filter(l => l.includes("await page.goto") || l.includes("// TODO:"))
  expect(actionLines).toHaveLength(4) // 1 goto + 3 TODOs
})

// ── Bug KLA-110: {{cred:...}} placeholders must not appear in exported code ─
test("type steps with {{cred:...}} placeholders emit env-var const references, not raw placeholders", () => {
  const trail = mkTrail()
  const steps: TrailStep[] = [
    mkStep({ id: "s0", idx: 0, action: "type", actionValue: "{{cred:admin:email}}" }),
    mkStep({ id: "s1", idx: 1, action: "type", actionValue: "{{cred:admin:password}}" }),
  ]
  const code = generatePlaywright(trail, steps, { s0: "#email", s1: "#password" })

  // Raw placeholder must not survive into the output
  expect(code).not.toContain("{{cred:")

  // Const declarations must appear before the test() call
  expect(code).toContain("const KLAV_CRED_ADMIN_EMAIL")
  expect(code).toContain("const KLAV_CRED_ADMIN_PASSWORD")
  expect(code).toContain("process.env['KLAV_CRED_ADMIN_EMAIL']")
  expect(code).toContain("process.env['KLAV_CRED_ADMIN_PASSWORD']")

  // Fill calls must reference the const, not a literal placeholder
  expect(code).toContain("page.fill('#email'")
  expect(code).toContain("KLAV_CRED_ADMIN_EMAIL")
  expect(code).toContain("page.fill('#password'")
  expect(code).toContain("KLAV_CRED_ADMIN_PASSWORD")

  // Const declarations must come before the test block
  const constIdx = code.indexOf("const KLAV_CRED_ADMIN_EMAIL")
  const testIdx = code.indexOf("test(")
  expect(constIdx).toBeLessThan(testIdx)
})

test("type step with cred placeholder but no selector emits TODO comment (not placeholder literal)", () => {
  const trail = mkTrail()
  const steps: TrailStep[] = [
    mkStep({ id: "s0", idx: 0, action: "type", actionValue: "{{cred:admin:email}}" }),
  ]
  const code = generatePlaywright(trail, steps, {}) // no selector
  expect(code).not.toContain("{{cred:")
  expect(code).toContain("// TODO: step 0 (type)")
})

test("non-cred type values remain plain single-quoted strings (no regression)", () => {
  const trail = mkTrail()
  const steps: TrailStep[] = [
    mkStep({ id: "s0", idx: 0, action: "type", actionValue: "hello@example.com" }),
  ]
  const code = generatePlaywright(trail, steps, { s0: "#email" })
  expect(code).toContain("page.fill('#email', 'hello@example.com')")
  expect(code).not.toContain("KLAV_CRED")
  expect(code).not.toContain("process.env")
})
