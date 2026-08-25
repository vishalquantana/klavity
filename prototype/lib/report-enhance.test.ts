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

  test("carries Raghu's QA-manager persona (canonical prompt swapped in)", () => {
    expect(ENHANCE_SYSTEM_PROMPT).toContain("Senior QA Manager")
    // Screenshot-first analysis discipline.
    expect(ENHANCE_SYSTEM_PROMPT).toContain("ANALYZE THE SCREENSHOT FIRST")
    // Actual-vs-expected discipline (current behavior only).
    expect(ENHANCE_SYSTEM_PROMPT).toContain("CURRENT OBSERVED BEHAVIOR ONLY")
  })

  test("JSON-only output contract, not markdown (his §15/§16 overridden)", () => {
    // The prompt must instruct JSON-only and explicitly override the Markdown report format.
    expect(ENHANCE_SYSTEM_PROMPT).toContain("OUTPUT FORMAT")
    expect(ENHANCE_SYSTEM_PROMPT).toContain("no markdown")
    expect(ENHANCE_SYSTEM_PROMPT).toContain("OVERRIDES any Markdown")
    // Summary must NOT carry the [CLASSIFICATION] prefix (that rides severity/priority fields).
    expect(ENHANCE_SYSTEM_PROMPT).toContain("WITHOUT the [CLASSIFICATION] prefix")
    // Exact JSON keys our parser expects are named in the contract.
    for (const k of ["summary", "actualResult", "expectedResult", "stepsToReproduce", "suggestedSeverity", "suggestedPriority", "confidence"]) {
      expect(ENHANCE_SYSTEM_PROMPT).toContain(k)
    }
  })

  test("never-fabricate + no-over-infer intent present (his §11)", () => {
    expect(ENHANCE_SYSTEM_PROMPT).toContain("DO NOT OVER-INFER")
    expect(ENHANCE_SYSTEM_PROMPT.toLowerCase()).toContain("fabricate")
    expect(ENHANCE_SYSTEM_PROMPT).toContain("plausible fiction")
  })

  test("conservative classification rule (bias lower + low confidence, never P1 'to be safe')", () => {
    expect(ENHANCE_SYSTEM_PROMPT).toContain("Not specified")
    expect(ENHANCE_SYSTEM_PROMPT).toContain("LOWER severity")
    expect(ENHANCE_SYSTEM_PROMPT).toContain("to be safe")
    // Severity->priority derivation is spelled out.
    expect(ENHANCE_SYSTEM_PROMPT).toContain("C1->P1")
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

  test("severity→priority mapping is enforced when priority is omitted (C1→P1, C2→P2, C3→P3)", () => {
    const mk = (sev: string) => parseEnhanceReply(JSON.stringify({ ...VALID, suggestedSeverity: sev, suggestedPriority: undefined }))!
    expect(mk("C1").suggestedPriority).toBe("P1")
    expect(mk("C2").suggestedPriority).toBe("P2")
    expect(mk("C3").suggestedPriority).toBe("P3")
  })

  test("'Not specified'/undeterminable classification → conservative C3/P3 + low confidence", () => {
    // Model followed Raghu's conservative rule: no gradable signal → biases to the lowest severity and a low
    // confidence rather than upgrading 'to be safe'. Off-list severity clamps to C3, priority derives to P3.
    const d = parseEnhanceReply(JSON.stringify({
      summary: "Dashboard tile shows no value",
      actualResult: "The revenue tile renders blank; classification not specified.",
      expectedResult: "The revenue tile should display the computed value.",
      stepsToReproduce: ["Open the dashboard"],
      suggestedSeverity: "Not specified",
      suggestedPriority: "Not specified",
      confidence: 0.2,
    }))!
    expect(d.suggestedSeverity).toBe("C3")
    expect(d.suggestedPriority).toBe("P3")
    expect(d.confidence).toBeLessThanOrEqual(0.4)
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
    // Raghu §15 section order: Summary → Steps → Actual → Expected → Severity·Priority.
    expect(txt.indexOf("Steps to reproduce:")).toBeLessThan(txt.indexOf("Actual result:"))
    expect(txt.indexOf("Actual result:")).toBeLessThan(txt.indexOf("Expected result:"))
    expect(txt.indexOf("Expected result:")).toBeLessThan(txt.indexOf("Severity:"))
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
