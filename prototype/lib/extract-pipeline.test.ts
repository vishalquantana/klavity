/**
 * Tests for the canonical transcript → Sim pipeline (lib/extract-pipeline).
 *
 * Focus areas:
 *   1. EXTRACT_SYS is exported and contains the v3 fields (simClass, side, core, scope,
 *      portability, sarcasm/negation guard).
 *   2. normalizeExtractedPersonas applies the same normalization regardless of which
 *      entry point (/api/extract vs /api/transcripts) invokes it — same input → same output.
 *   3. Backward-compat .type shim: simClass "client" → type "client", "user" → "internal".
 *   4. Insight typed-field sanitization: valid enum values pass through, off-enum values
 *      become null, severity-alias is accepted for priority.
 *   5. v3 core fields (goals, temperament, voice, watchFor) are preserved untouched.
 *   6. Sarcasm/negation guard is present in the prompt (not a runtime test but a smoke check
 *      that the prompt text hasn't been accidentally trimmed).
 *   7. Edge cases: null/undefined personas array, no insights, already-typed persona.
 */

import { test, expect } from "bun:test"
import { EXTRACT_SYS, normalizeExtractedPersonas } from "./extract-pipeline"

// ── 1. EXTRACT_SYS presence and v3 field coverage ─────────────────────────────

test("EXTRACT_SYS: is a non-empty string", () => {
  expect(typeof EXTRACT_SYS).toBe("string")
  expect(EXTRACT_SYS.length).toBeGreaterThan(100)
})

test("EXTRACT_SYS: contains simClass and side classification axes", () => {
  expect(EXTRACT_SYS).toContain("simClass")
  expect(EXTRACT_SYS).toContain('"client"')
  expect(EXTRACT_SYS).toContain('"user"')
  expect(EXTRACT_SYS).toContain("side")
  expect(EXTRACT_SYS).toContain('"external"')
  expect(EXTRACT_SYS).toContain('"internal"')
})

test("EXTRACT_SYS: contains v3 core fields (goals, temperament, voice, watchFor)", () => {
  expect(EXTRACT_SYS).toContain("goals")
  expect(EXTRACT_SYS).toContain("temperament")
  expect(EXTRACT_SYS).toContain("voice")
  expect(EXTRACT_SYS).toContain("watchFor")
  expect(EXTRACT_SYS).toContain("expertise")
})

test("EXTRACT_SYS: contains scope and portability (v3 insight fields)", () => {
  expect(EXTRACT_SYS).toContain("scope")
  expect(EXTRACT_SYS).toContain("portability")
  expect(EXTRACT_SYS).toContain('"portable"')
  expect(EXTRACT_SYS).toContain('"site-specific"')
})

test("EXTRACT_SYS: sarcasm/negation guard is present", () => {
  expect(EXTRACT_SYS).toContain("sarcasm")
  expect(EXTRACT_SYS).toContain("negation")
  expect(EXTRACT_SYS).toContain("Do NOT emit a love insight for clearly sarcastic praise")
})

// ── 2. normalizeExtractedPersonas: idempotent shared post-processor ────────────

test("normalizeExtractedPersonas: returns data for chaining", () => {
  const data = { personas: [] }
  const result = normalizeExtractedPersonas(data)
  expect(result).toBe(data) // same reference
})

test("normalizeExtractedPersonas: handles null/undefined gracefully", () => {
  expect(normalizeExtractedPersonas(null)).toBeNull()
  expect(normalizeExtractedPersonas(undefined)).toBeUndefined()
  expect(normalizeExtractedPersonas({})).toEqual({})
  expect(normalizeExtractedPersonas({ personas: null })).toEqual({ personas: null })
})

test("normalizeExtractedPersonas: handles empty personas array", () => {
  const data = { personas: [] }
  normalizeExtractedPersonas(data)
  expect(data.personas).toEqual([])
})

// ── 3. Backward-compat .type shim ─────────────────────────────────────────────

test("normalizeExtractedPersonas: simClass=client → type=client (shim)", () => {
  const data = {
    personas: [{
      name: "Alice", role: "CFO", simClass: "client", side: "external",
      insights: [],
    }],
  }
  normalizeExtractedPersonas(data)
  expect(data.personas[0].type).toBe("client")
})

test("normalizeExtractedPersonas: simClass=user → type=internal (shim)", () => {
  const data = {
    personas: [{
      name: "Bob", role: "Engineer", simClass: "user", side: "internal",
      insights: [],
    }],
  }
  normalizeExtractedPersonas(data)
  expect(data.personas[0].type).toBe("internal")
})

test("normalizeExtractedPersonas: does NOT overwrite existing .type field", () => {
  // When .type is already set (e.g. legacy model output), leave it unchanged
  const data = {
    personas: [{
      name: "Carol", role: "PM", simClass: "client", side: "external",
      type: "already-set",
      insights: [],
    }],
  }
  normalizeExtractedPersonas(data)
  expect(data.personas[0].type).toBe("already-set")
})

test("normalizeExtractedPersonas: persona with no simClass gets no .type shim", () => {
  const data = {
    personas: [{
      name: "Dana", role: "user", insights: [],
    }],
  }
  normalizeExtractedPersonas(data)
  // type should remain absent / undefined (not shimmed when simClass is absent)
  expect(data.personas[0].type).toBeUndefined()
})

// ── 4. Insight typed-field sanitization ───────────────────────────────────────

test("normalizeExtractedPersonas: valid insight enum values pass through", () => {
  const data = {
    personas: [{
      name: "Ed", simClass: "user", insights: [{
        kind: "pain", text: "button hidden", quote: "can't find it",
        issueType: "layout", priority: "high",
        scope: "ui", portability: "site-specific",
        area: "checkout",
      }],
    }],
  }
  normalizeExtractedPersonas(data)
  const ins = data.personas[0].insights[0]
  expect(ins.issueType).toBe("layout")
  expect(ins.priority).toBe("high")
  expect(ins.scope).toBe("ui")
  expect(ins.portability).toBe("site-specific")
  expect(ins.area).toBe("checkout")
})

test("normalizeExtractedPersonas: off-enum issueType → null", () => {
  const data = {
    personas: [{
      name: "Frank", simClass: "user", insights: [{
        kind: "pain", text: "bad stuff", quote: "q",
        issueType: "not-a-real-type",
        priority: "high",
      }],
    }],
  }
  normalizeExtractedPersonas(data)
  expect(data.personas[0].insights[0].issueType).toBeNull()
})

test("normalizeExtractedPersonas: off-enum priority → null", () => {
  const data = {
    personas: [{
      name: "Gina", simClass: "user", insights: [{
        kind: "want", text: "feature x", quote: "q",
        priority: "critical", // not in enum
      }],
    }],
  }
  normalizeExtractedPersonas(data)
  expect(data.personas[0].insights[0].priority).toBeNull()
})

test("normalizeExtractedPersonas: severity alias accepted for priority", () => {
  const data = {
    personas: [{
      name: "Hank", simClass: "user", insights: [{
        kind: "pain", text: "slow", quote: "q",
        severity: "urgent", // legacy alias for priority
      }],
    }],
  }
  normalizeExtractedPersonas(data)
  expect(data.personas[0].insights[0].priority).toBe("urgent")
})

test("normalizeExtractedPersonas: off-enum scope → null", () => {
  const data = {
    personas: [{
      name: "Iris", simClass: "client", insights: [{
        kind: "want", text: "more dashboards", quote: "q",
        scope: "tactical", // not in enum
        portability: "portable",
      }],
    }],
  }
  normalizeExtractedPersonas(data)
  expect(data.personas[0].insights[0].scope).toBeNull()
  expect(data.personas[0].insights[0].portability).toBe("portable")
})

test("normalizeExtractedPersonas: area trimmed, null when empty/non-string", () => {
  const data = {
    personas: [{
      name: "Jack", simClass: "user", insights: [
        { kind: "pain", text: "a", quote: "q", area: "  login-flow  " },
        { kind: "pain", text: "b", quote: "q", area: "" },
        { kind: "pain", text: "c", quote: "q", area: null },
        { kind: "pain", text: "d", quote: "q", area: 42 },
      ],
    }],
  }
  normalizeExtractedPersonas(data)
  const ins = data.personas[0].insights
  expect(ins[0].area).toBe("login-flow")
  expect(ins[1].area).toBeNull()
  expect(ins[2].area).toBeNull()
  expect(ins[3].area).toBeNull()
})

// ── 5. v3 core fields preserved ───────────────────────────────────────────────

test("normalizeExtractedPersonas: core fields are preserved untouched", () => {
  const core = {
    goals: ["forecast spend", "cut close time"],
    expertise: "expert (finance)",
    temperament: "impatient",
    voice: "just show me the number",
    watchFor: ["trustworthy totals", "audit trail"],
  }
  const data = {
    personas: [{
      name: "Karen", role: "CFO", simClass: "client", side: "external",
      core,
      insights: [],
    }],
  }
  normalizeExtractedPersonas(data)
  expect(data.personas[0].core).toEqual(core)
})

// ── 6. Both entry point inputs produce identical normalized output ─────────────
//
// This simulates both /api/extract and /api/transcripts receiving the SAME raw
// LLM output and verifies normalizeExtractedPersonas produces identical results,
// regardless of entry point.  (In production both call extractPersonas() which
// calls normalizeExtractedPersonas internally — these tests exercise the shared
// function directly to prove equivalence.)

test("both entry points: same raw LLM output → identical normalized personas", () => {
  const rawLlmOutput = {
    personas: [{
      name: "Lena Sales",
      role: "Sales Director",
      simClass: "client",
      side: "external",
      initials: "LS",
      accent: "#6366f1",
      summary: "outcome-focused buyer",
      core: {
        goals: ["close deals faster", "reduce manual data entry"],
        expertise: "expert (sales) - beginner (product)",
        temperament: "assertive, results-driven",
        voice: "I don't have time for bugs",
        watchFor: ["reliability", "speed", "integrations"],
      },
      insights: [
        {
          kind: "pain",
          text: "Filter button hidden below fold",
          quote: "I can never find the filter thing",
          area: "leads-table",
          issueType: "layout",
          priority: "high",
          scope: "ui",
          portability: "site-specific",
        },
        {
          kind: "want",
          text: "CRM sync",
          quote: "we need it in Salesforce too",
          area: null,
          issueType: "INVALID_VALUE", // should become null
          priority: "medium",
          scope: "feature",
          portability: "portable",
        },
      ],
    }],
  }

  // Simulate /api/extract path: deep-clone the raw output, run normalize
  const forApiExtract = JSON.parse(JSON.stringify(rawLlmOutput))
  normalizeExtractedPersonas(forApiExtract)

  // Simulate /api/transcripts path: deep-clone the raw output, run normalize
  const forApiTranscripts = JSON.parse(JSON.stringify(rawLlmOutput))
  normalizeExtractedPersonas(forApiTranscripts)

  // Both outputs must be structurally identical
  expect(forApiExtract).toEqual(forApiTranscripts)

  // Spot-check the normalized values
  const p = forApiExtract.personas[0]
  expect(p.type).toBe("client")          // backward-compat shim
  expect(p.simClass).toBe("client")
  expect(p.insights[0].issueType).toBe("layout")   // valid
  expect(p.insights[1].issueType).toBeNull()        // off-enum → null
  expect(p.core.goals).toHaveLength(2)
  expect(p.core.watchFor).toContain("reliability")
})

// ── 7. Multiple personas in one batch ─────────────────────────────────────────

test("normalizeExtractedPersonas: multiple personas all normalized", () => {
  const data = {
    personas: [
      {
        name: "Maya", simClass: "client", insights: [{
          kind: "want", text: "reports", quote: "q",
          issueType: "flow", scope: "workflow", portability: "portable", priority: "low",
        }],
      },
      {
        name: "Noel", simClass: "user", insights: [{
          kind: "pain", text: "login bug", quote: "q",
          issueType: "BAD", scope: "BAD", portability: "BAD", priority: "BAD",
        }],
      },
    ],
  }
  normalizeExtractedPersonas(data)
  const [maya, noel] = data.personas
  expect(maya.type).toBe("client")
  expect(maya.insights[0].issueType).toBe("flow")
  expect(maya.insights[0].scope).toBe("workflow")
  expect(noel.type).toBe("internal")
  expect(noel.insights[0].issueType).toBeNull()
  expect(noel.insights[0].scope).toBeNull()
  expect(noel.insights[0].portability).toBeNull()
  expect(noel.insights[0].priority).toBeNull()
})
