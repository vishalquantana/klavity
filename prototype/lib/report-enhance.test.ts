// KLA-586: AI-enhanced bug description — pure lib tests.
//
// Pins lib/report-enhance.ts with an INJECTED fake LLM (no network): tolerant JSON parse, length clamps,
// severity/priority whitelist, steps cap, rendered-text shape, and the null-on-failure contract.

import { test, expect, describe } from "bun:test"
import {
  ENHANCE_SYSTEM_PROMPT,
  parseEnhanceReply,
  renderDraftToText,
  generateEnhancedDraft,
  MAX_STEPS,
  SUMMARY_MAX_LEN,
  type EnhancedDraft,
} from "./report-enhance"

const VALID = {
  summary: "Checkout CTA is unresponsive on click",
  actualResult: "Clicking 'Place order' does nothing; no navigation and no error banner appears.",
  expectedResult: "Order should be placed and navigate to the confirmation page.",
  stepsToReproduce: ["Add an item to the cart", "Go to /checkout", "Click 'Place order'"],
  suggestedSeverity: "C2",
  suggestedPriority: "P2",
  confidence: 0.8,
}

describe("ENHANCE_SYSTEM_PROMPT", () => {
  test("encodes intent: untrusted, screenshot, strict JSON, taxonomy", () => {
    expect(ENHANCE_SYSTEM_PROMPT).toContain("UNTRUSTED")
    expect(ENHANCE_SYSTEM_PROMPT.toLowerCase()).toContain("screenshot")
    expect(ENHANCE_SYSTEM_PROMPT).toContain("STRICT JSON")
    // Severity taxonomy present.
    expect(ENHANCE_SYSTEM_PROMPT).toContain("C1")
    expect(ENHANCE_SYSTEM_PROMPT).toContain("P1")
    // KLA-492 invariant: never re-ask for already-captured context.
    expect(ENHANCE_SYSTEM_PROMPT).toContain("NEVER ask")
  })
})

describe("parseEnhanceReply", () => {
  test("parses a valid strict-JSON reply", () => {
    const d = parseEnhanceReply(JSON.stringify(VALID))!
    expect(d).not.toBeNull()
    expect(d.summary).toBe(VALID.summary)
    expect(d.actualResult).toBe(VALID.actualResult)
    expect(d.expectedResult).toBe(VALID.expectedResult)
    expect(d.stepsToReproduce).toEqual(VALID.stepsToReproduce)
    expect(d.suggestedSeverity).toBe("C2")
    expect(d.suggestedPriority).toBe("P2")
    expect(d.confidence).toBeCloseTo(0.8)
  })

  test("tolerates markdown-fenced / prose-wrapped JSON", () => {
    const wrapped = "Here you go:\n```json\n" + JSON.stringify(VALID) + "\n```\nHope that helps!"
    const d = parseEnhanceReply(wrapped)!
    expect(d).not.toBeNull()
    expect(d.summary).toBe(VALID.summary)
  })

  test("malformed JSON → null", () => {
    expect(parseEnhanceReply("not json at all")).toBeNull()
    expect(parseEnhanceReply("{ broken: ")).toBeNull()
    expect(parseEnhanceReply("")).toBeNull()
  })

  test("empty draft (no summary, no steps) → null", () => {
    expect(parseEnhanceReply(JSON.stringify({ summary: "", stepsToReproduce: [], suggestedSeverity: "C3" }))).toBeNull()
  })

  test("whitelists garbage severity → C3 and derives priority", () => {
    const d = parseEnhanceReply(JSON.stringify({ ...VALID, suggestedSeverity: "SUPER-CRITICAL", suggestedPriority: "P0-NOW" }))!
    expect(d.suggestedSeverity).toBe("C3")
    // Off-list priority falls back to the severity-derived value (C3 → P3).
    expect(d.suggestedPriority).toBe("P3")
  })

  test("accepts lowercase severity/priority (case-normalized)", () => {
    const d = parseEnhanceReply(JSON.stringify({ ...VALID, suggestedSeverity: "c1", suggestedPriority: "p1" }))!
    expect(d.suggestedSeverity).toBe("C1")
    expect(d.suggestedPriority).toBe("P1")
  })

  test("caps steps to MAX_STEPS and drops empty steps", () => {
    const many = Array.from({ length: 20 }, (_, i) => `step ${i + 1}`)
    many.splice(2, 0, "", "   ") // inject blanks that must be filtered
    const d = parseEnhanceReply(JSON.stringify({ ...VALID, stepsToReproduce: many }))!
    expect(d.stepsToReproduce.length).toBe(MAX_STEPS)
    expect(d.stepsToReproduce.every((s) => s.trim().length > 0)).toBe(true)
  })

  test("clamps summary length", () => {
    const longSummary = "x".repeat(500)
    const d = parseEnhanceReply(JSON.stringify({ ...VALID, summary: longSummary }))!
    expect(d.summary.length).toBeLessThanOrEqual(SUMMARY_MAX_LEN)
  })

  test("clamps confidence to 0..1", () => {
    expect(parseEnhanceReply(JSON.stringify({ ...VALID, confidence: 5 }))!.confidence).toBe(1)
    expect(parseEnhanceReply(JSON.stringify({ ...VALID, confidence: -2 }))!.confidence).toBe(0)
    expect(parseEnhanceReply(JSON.stringify({ ...VALID, confidence: "oops" }))!.confidence).toBe(0)
  })
})

describe("renderDraftToText", () => {
  test("renders a readable block with numbered steps + severity/priority", () => {
    const d = parseEnhanceReply(JSON.stringify(VALID))!
    const txt = renderDraftToText(d)
    expect(txt).toContain(VALID.summary)
    expect(txt).toContain("Actual result:")
    expect(txt).toContain("Expected result:")
    expect(txt).toContain("Steps to reproduce:")
    expect(txt).toContain("1. Add an item to the cart")
    expect(txt).toContain("3. Click 'Place order'")
    expect(txt).toContain("Severity: C2")
    expect(txt).toContain("Priority: P2")
  })

  test("skips empty sections", () => {
    const d: EnhancedDraft = {
      summary: "Button broken",
      actualResult: "",
      expectedResult: "",
      stepsToReproduce: [],
      suggestedSeverity: "C3",
      suggestedPriority: "P3",
      confidence: 0.3,
    }
    const txt = renderDraftToText(d)
    expect(txt).toContain("Button broken")
    expect(txt).not.toContain("Actual result:")
    expect(txt).not.toContain("Steps to reproduce:")
    expect(txt).toContain("Severity: C3")
  })
})

describe("generateEnhancedDraft", () => {
  test("returns a draft from a valid LLM reply", async () => {
    const d = await generateEnhancedDraft("checkout button does nothing", {
      llm: async () => JSON.stringify(VALID),
    })
    expect(d).not.toBeNull()
    expect(d!.summary).toBe(VALID.summary)
  })

  test("passes the system prompt + one-liner to the injected llm", async () => {
    let seenPrompt = ""
    let seenInput = ""
    await generateEnhancedDraft("  checkout broken  ", {
      llm: async (oneLiner, systemPrompt) => { seenInput = oneLiner; seenPrompt = systemPrompt; return JSON.stringify(VALID) },
    })
    expect(seenPrompt).toBe(ENHANCE_SYSTEM_PROMPT)
    expect(seenInput).toBe("checkout broken") // trimmed
  })

  test("returns null when the llm throws (never throws itself)", async () => {
    const d = await generateEnhancedDraft("checkout broken", {
      llm: async () => { throw new Error("boom") },
    })
    expect(d).toBeNull()
  })

  test("returns null on empty input", async () => {
    const d = await generateEnhancedDraft("   ", { llm: async () => JSON.stringify(VALID) })
    expect(d).toBeNull()
  })

  test("returns null when the llm reply is unparseable", async () => {
    const d = await generateEnhancedDraft("checkout broken", { llm: async () => "garbage" })
    expect(d).toBeNull()
  })
})
