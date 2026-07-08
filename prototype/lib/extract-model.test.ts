import { test, expect, beforeEach, afterEach } from "bun:test"
import { getExtractModel } from "./extract-model"

// ── KLAV_EXTRACT_MODEL routing ────────────────────────────────────────────────

const ORIG = process.env.KLAV_EXTRACT_MODEL

beforeEach(() => { delete process.env.KLAV_EXTRACT_MODEL })
afterEach(() => {
  if (ORIG !== undefined) process.env.KLAV_EXTRACT_MODEL = ORIG
  else delete process.env.KLAV_EXTRACT_MODEL
})

test("getExtractModel defaults to google/gemini-2.5-flash", () => {
  expect(getExtractModel()).toBe("google/gemini-2.5-flash")
})

test("getExtractModel respects KLAV_EXTRACT_MODEL env override", () => {
  process.env.KLAV_EXTRACT_MODEL = "anthropic/claude-3-haiku"
  expect(getExtractModel()).toBe("anthropic/claude-3-haiku")
})

test("getExtractModel uses any arbitrary model string from env", () => {
  process.env.KLAV_EXTRACT_MODEL = "qwen/qwen3-vl-235b-a22b-instruct"
  expect(getExtractModel()).toBe("qwen/qwen3-vl-235b-a22b-instruct")
})

// ── EXTRACT_SYS v3 content assertions ────────────────────────────────────────
// Read the server source as raw text and assert key clauses are present.
// Strings are matched against the escaped form as they appear in the TS source file.

const serverSrc = await Bun.file(new URL("../server.ts", import.meta.url)).text()

test("EXTRACT_SYS v3: contains simClass classification clause", () => {
  expect(serverSrc).toContain("simClass")
  // TS source has escaped quotes: \"client\"
  expect(serverSrc).toContain("evaluates OVERALL outcomes")
  expect(serverSrc).toContain("actually OPERATES the product")
})

test("EXTRACT_SYS v3: contains scope enum clause (ui|feature|workflow|strategy)", () => {
  expect(serverSrc).toContain("scope: ui | feature | workflow | strategy")
})

test("EXTRACT_SYS v3: contains portability clause", () => {
  expect(serverSrc).toContain("portability")
  expect(serverSrc).toContain("portable")
  expect(serverSrc).toContain("site-specific")
})

test("EXTRACT_SYS v3: contains sarcasm/negation TONE clause", () => {
  expect(serverSrc).toContain("TONE - sarcasm, irony, and negation")
  expect(serverSrc).toContain("Do NOT emit a love insight for clearly sarcastic praise")
  expect(serverSrc).toContain("Resolve negation to the actual complaint")
})

test("EXTRACT_SYS v3: contains portable CORE fields (watchFor, temperament, goals)", () => {
  expect(serverSrc).toContain("watchFor")
  expect(serverSrc).toContain("temperament")
  expect(serverSrc).toContain("jobs-to-be-done")
})

// ── sanitizeTypedFields new enum declarations ─────────────────────────────────

test("server.ts declares SCOPE_ENUM with all four v3 values", () => {
  expect(serverSrc).toContain("SCOPE_ENUM")
  expect(serverSrc).toContain('"ui"')
  expect(serverSrc).toContain('"feature"')
  expect(serverSrc).toContain('"workflow"')
  expect(serverSrc).toContain('"strategy"')
})

test("server.ts declares PORTABILITY_ENUM with portable and site-specific", () => {
  expect(serverSrc).toContain("PORTABILITY_ENUM")
  expect(serverSrc).toContain('"portable"')
  expect(serverSrc).toContain('"site-specific"')
})

// ── sanitizeTypedFields runtime behaviour ────────────────────────────────────
// Import the live sanitizer logic via a thin wrapper so we test the actual
// runtime enum checks, not just source-text presence.

import { sanitizeInsight } from "./extract-sanitize"

test("sanitizeInsight: accepts valid v3 scope values", () => {
  for (const scope of ["ui", "feature", "workflow", "strategy"]) {
    expect(sanitizeInsight({ scope }).scope).toBe(scope)
  }
})

test("sanitizeInsight: rejects unknown scope, returns null", () => {
  expect(sanitizeInsight({ scope: "bogus" }).scope).toBeNull()
  expect(sanitizeInsight({}).scope).toBeNull()
})

test("sanitizeInsight: accepts valid v3 portability values", () => {
  expect(sanitizeInsight({ portability: "portable" }).portability).toBe("portable")
  expect(sanitizeInsight({ portability: "site-specific" }).portability).toBe("site-specific")
})

test("sanitizeInsight: rejects unknown portability, returns null", () => {
  expect(sanitizeInsight({ portability: "global" }).portability).toBeNull()
  expect(sanitizeInsight({}).portability).toBeNull()
})

test("sanitizeInsight: priority field works", () => {
  const r = sanitizeInsight({ area: "checkout", issueType: "layout", priority: "high", scope: "ui", portability: "site-specific" })
  expect(r.area).toBe("checkout")
  expect(r.issueType).toBe("layout")
  expect(r.priority).toBe("high")
  expect(r.scope).toBe("ui")
  expect(r.portability).toBe("site-specific")
})

test("sanitizeInsight: legacy severity field is backwards-compat (reads as priority)", () => {
  const r = sanitizeInsight({ area: "checkout", issueType: "layout", severity: "high", scope: "ui", portability: "site-specific" })
  expect(r.priority).toBe("high")
})

test("sanitizeInsight: urgent is a valid priority level", () => {
  const r = sanitizeInsight({ priority: "urgent" })
  expect(r.priority).toBe("urgent")
})
