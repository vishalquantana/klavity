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
// The canonical EXTRACT_SYS prompt now lives in lib/extract-pipeline.ts (single
// source of truth for both /api/extract and /api/transcripts). Read the pipeline
// source for the source-level assertions; also import the live constant to verify
// the actual runtime string.

import { EXTRACT_SYS } from "./extract-pipeline"
const pipelineSrc = await Bun.file(new URL("./extract-pipeline.ts", import.meta.url)).text()

test("EXTRACT_SYS v3: contains simClass classification clause", () => {
  expect(EXTRACT_SYS).toContain("simClass")
  expect(EXTRACT_SYS).toContain("evaluates OVERALL outcomes")
  expect(EXTRACT_SYS).toContain("actually OPERATES the product")
})

test("EXTRACT_SYS v3: contains scope enum clause (ui|feature|workflow|strategy)", () => {
  expect(EXTRACT_SYS).toContain("scope: ui | feature | workflow | strategy")
})

test("EXTRACT_SYS v3: contains portability clause", () => {
  expect(EXTRACT_SYS).toContain("portability")
  expect(EXTRACT_SYS).toContain("portable")
  expect(EXTRACT_SYS).toContain("site-specific")
})

test("EXTRACT_SYS v3: contains sarcasm/negation TONE clause", () => {
  expect(EXTRACT_SYS).toContain("TONE - sarcasm, irony, and negation")
  expect(EXTRACT_SYS).toContain("Do NOT emit a love insight for clearly sarcastic praise")
  expect(EXTRACT_SYS).toContain("Resolve negation to the actual complaint")
})

test("EXTRACT_SYS v3: contains portable CORE fields (watchFor, temperament, goals)", () => {
  expect(EXTRACT_SYS).toContain("watchFor")
  expect(EXTRACT_SYS).toContain("temperament")
  expect(EXTRACT_SYS).toContain("jobs-to-be-done")
})

// ── sanitizeInsight enum declarations in extract-sanitize.ts ────────────────���
// SCOPE_ENUM and PORTABILITY_ENUM now live in lib/extract-sanitize.ts.

const sanitizeSrc = await Bun.file(new URL("./extract-sanitize.ts", import.meta.url)).text()

test("extract-sanitize.ts declares SCOPE_ENUM with all four v3 values", () => {
  expect(sanitizeSrc).toContain("SCOPE_ENUM")
  expect(sanitizeSrc).toContain('"ui"')
  expect(sanitizeSrc).toContain('"feature"')
  expect(sanitizeSrc).toContain('"workflow"')
  expect(sanitizeSrc).toContain('"strategy"')
})

test("extract-sanitize.ts declares PORTABILITY_ENUM with portable and site-specific", () => {
  expect(sanitizeSrc).toContain("PORTABILITY_ENUM")
  expect(sanitizeSrc).toContain('"portable"')
  expect(sanitizeSrc).toContain('"site-specific"')
})

// Smoke check: server.ts still references EXTRACT_SYS_PROMPT (the import alias) so
// both entry points go through the shared pipeline.
const serverSrc = await Bun.file(new URL("../server.ts", import.meta.url)).text()

test("server.ts imports EXTRACT_SYS from lib/extract-pipeline (unified prompt)", () => {
  expect(serverSrc).toContain("EXTRACT_SYS_PROMPT")
  expect(serverSrc).toContain("extract-pipeline")
})

test("server.ts uses normalizeExtractedPersonas for both entry points", () => {
  expect(serverSrc).toContain("normalizeExtractedPersonas")
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
