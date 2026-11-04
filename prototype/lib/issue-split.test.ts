// KD-995: split one Record-me walkthrough into separate tickets — pure lib tests (fake LLM, no network).

import { test, expect, describe } from "bun:test"
import {
  SPLIT_SYSTEM_PROMPT,
  MAX_SPLIT_ISSUES,
  SPLIT_TITLE_MAX_LEN,
  SPLIT_TRANSCRIPT_MAX_CHARS,
  buildSplitTranscriptInput,
  parseSplitReply,
  splitTranscriptIntoIssues,
  narrationForSpan,
} from "./issue-split"

const TWO = {
  issues: [
    { title: "Save button stays disabled after editing name", description: "Editing the name leaves Save greyed out.", kind: "bug", startSec: 2, endSec: 14.04 },
    { title: "Add dark mode to settings", description: "Reporter asks for a dark theme.", kind: "feature", startSec: 15, endSec: 22 },
  ],
}

describe("SPLIT_SYSTEM_PROMPT", () => {
  test("encodes untrusted guard, strict JSON and the one-issue-per-ticket rule", () => {
    expect(SPLIT_SYSTEM_PROMPT).toContain("UNTRUSTED")
    expect(SPLIT_SYSTEM_PROMPT).toContain("STRICT JSON")
    expect(SPLIT_SYSTEM_PROMPT).toContain("DISTINCT issue")
  })
})

describe("buildSplitTranscriptInput", () => {
  test("prefers timestamped segment lines", () => {
    const s = buildSplitTranscriptInput("ignored", [{ start: 1, end: 3.25, text: " first " }, { start: 4, end: 5, text: "" }])
    expect(s).toBe("[1.0-3.3] first")
  })
  test("falls back to flat text and clips", () => {
    expect(buildSplitTranscriptInput("  hello  ", null)).toBe("hello")
    expect(buildSplitTranscriptInput("x".repeat(SPLIT_TRANSCRIPT_MAX_CHARS + 50), []).length).toBe(SPLIT_TRANSCRIPT_MAX_CHARS)
  })
})

describe("parseSplitReply", () => {
  test("parses the wrapper shape", () => {
    const out = parseSplitReply(JSON.stringify(TWO))
    expect(out).toHaveLength(2)
    expect(out[0]).toEqual({ title: TWO.issues[0].title, description: TWO.issues[0].description, kind: "bug", startSec: 2, endSec: 14 })
    expect(out[1].kind).toBe("feature")
  })
  test("tolerates code fences / prose and a bare array", () => {
    expect(parseSplitReply("Sure!\n```json\n" + JSON.stringify(TWO) + "\n```")).toHaveLength(2)
    expect(parseSplitReply(JSON.stringify(TWO.issues))).toHaveLength(2)
  })
  test("garbage / empty → []", () => {
    expect(parseSplitReply("")).toEqual([])
    expect(parseSplitReply("not json")).toEqual([])
    expect(parseSplitReply('{"issues":"nope"}')).toEqual([])
    expect(parseSplitReply(null)).toEqual([])
  })
  test("drops empty issues, fills a missing title, defaults kind, swaps reversed spans", () => {
    const out = parseSplitReply({ issues: [{}, { description: "Only a body\nmore", kind: "weird", startSec: 9, endSec: 3 }] })
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ title: "Only a body", kind: "bug", startSec: 3, endSec: 9 })
  })
  test("clamps title length and caps the issue count", () => {
    const many = Array.from({ length: MAX_SPLIT_ISSUES + 3 }, (_, i) => ({ title: "t".repeat(400) + i, description: "d" }))
    const out = parseSplitReply({ issues: many })
    expect(out).toHaveLength(MAX_SPLIT_ISSUES)
    expect(out[0].title.length).toBe(SPLIT_TITLE_MAX_LEN)
    expect(out[0].startSec).toBeNull()
  })
})

describe("splitTranscriptIntoIssues", () => {
  test("hands the prepared input + prompt to the injected llm", async () => {
    let seen: [string, string] | null = null
    const out = await splitTranscriptIntoIssues({ text: "two problems" }, {
      llm: async (input, prompt) => { seen = [input, prompt]; return JSON.stringify(TWO) },
    })
    expect(out).toHaveLength(2)
    expect(seen).toEqual(["two problems", SPLIT_SYSTEM_PROMPT])
  })
  test("empty transcript skips the llm; a throwing llm resolves []", async () => {
    let called = false
    expect(await splitTranscriptIntoIssues({ text: "  " }, { llm: async () => { called = true; return "" } })).toEqual([])
    expect(called).toBe(false)
    expect(await splitTranscriptIntoIssues({ text: "x" }, { llm: async () => { throw new Error("boom") } })).toEqual([])
  })
})

describe("Enhance-identical draft per issue", () => {
  test("carries steps/actual/expected/severity/priority through the Enhance clamps", () => {
    const [a, b] = parseSplitReply(JSON.stringify({ issues: [
      { title: "Dashboard count wrong", description: "x", kind: "bug", actualResult: "Count shows 0.", expectedResult: "Count matches the list.",
        stepsToReproduce: ["Open the ticket dashboard", "", "Compare the count"], suggestedSeverity: "c2", suggestedPriority: "bogus" },
      { title: "Filter broken", description: "Filter does nothing." },
    ] }))
    expect(a.actualResult).toBe("Count shows 0.")
    expect(a.expectedResult).toBe("Count matches the list.")
    expect(a.stepsToReproduce).toEqual(["Open the ticket dashboard", "Compare the count"])
    expect(a.suggestedSeverity).toBe("C2")
    expect(a.suggestedPriority).toBe("P2") // garbage priority → derived from severity, like Enhance
    expect(b.stepsToReproduce).toBeUndefined() // no draft content → plain description only
    expect(b.suggestedSeverity).toBeUndefined()
  })
  test("prompt asks for the Enhance fields", () => {
    for (const k of ["actualResult", "expectedResult", "stepsToReproduce", "suggestedSeverity", "suggestedPriority"]) expect(SPLIT_SYSTEM_PROMPT).toContain(k)
  })
})

describe("confidence", () => {
  test("is clamped to 0..1 and omitted when absent", () => {
    const [a, b, c] = parseSplitReply(JSON.stringify({ issues: [
      { title: "A", description: "a", confidence: 0.72 },
      { title: "B", description: "b", confidence: 7 },
      { title: "C", description: "c" },
    ] }))
    expect(a.confidence).toBe(0.72)
    expect(b.confidence).toBe(1)
    expect(c.confidence).toBeUndefined()
    expect(SPLIT_SYSTEM_PROMPT).toContain("confidence")
  })
})

describe("narration (the reporter's words handed to Enhance)", () => {
  const segs = [
    { start: 0, end: 4, text: "Hi, a few things." },
    { start: 4, end: 9, text: "The save button does nothing." },
    { start: 9, end: 12, text: "Nothing in the console either." },
    { start: 20, end: 26, text: "Also the date filter shows last month." },
  ]
  test("narrationForSpan joins the transcript lines inside the span", () => {
    expect(narrationForSpan(segs, 4.2, 11.5)).toBe("The save button does nothing. Nothing in the console either.")
    expect(narrationForSpan(segs, 21, null)).toBe("Also the date filter shows last month.")
    expect(narrationForSpan(segs, null, null)).toBe("")
    expect(narrationForSpan(null, 1, 2)).toBe("")
  })
  test("splitTranscriptIntoIssues attaches each issue's narration", async () => {
    const reply = JSON.stringify({ issues: [
      { title: "Save does nothing", description: "x", startSec: 4, endSec: 12 },
      { title: "Date filter wrong", description: "y", startSec: 20, endSec: 26 },
      { title: "No timing", description: "z", startSec: null, endSec: null },
    ] })
    const out = await splitTranscriptIntoIssues({ text: "t", segments: segs }, { llm: async () => reply })
    expect(out[0].narration).toBe("The save button does nothing. Nothing in the console either.")
    expect(out[1].narration).toBe("Also the date filter shows last month.")
    expect(out[2].narration).toBeUndefined()
  })
})
