// KLA-168: computed priority model unit tests (renamed from severity).
// All pure — no network, no DB.
// Tests:
//   (A) Base priority by kind (single occurrence, moderate confidence).
//   (B) High-recurrence (≥3) bumps priority up one level for each kind.
//   (C) High-confidence (≥0.9) bumps priority up one level for each kind.
//   (D) Low-confidence (<0.5) bumps priority down one level (floored at "low").
//   (E) Combined: high recurrence + high confidence can raise regression → "urgent".
//   (F) Ticket builder uses pre-computed priority; falls back to kind-only for null.

import { test, expect } from "bun:test"
import { computeFindingSeverity } from "./trails-findings-severity"
import { buildTicketFromFinding, severityForKind } from "./trails-findings-gate"
import type { Finding } from "./trails-types"

// ── (A) Base priority by kind ───────────────────────────────────────────────
test("(A) KLA-168: base priority by kind (recurrence=1, moderate confidence)", () => {
  expect(computeFindingSeverity({ kind: "regression", confidence: 0.7, recurrence: 1 })).toBe("high")
  expect(computeFindingSeverity({ kind: "amber_heal", confidence: 0.7, recurrence: 1 })).toBe("medium")
  expect(computeFindingSeverity({ kind: "visual",     confidence: 0.7, recurrence: 1 })).toBe("low")
})

// ── (B) High recurrence bumps priority ────────────────────────────────────
test("(B) KLA-168: recurrence ≥ 3 bumps priority up one level", () => {
  // amber_heal medium → high when recurring
  const oneOff  = computeFindingSeverity({ kind: "amber_heal", confidence: 0.7, recurrence: 1 })
  const highRec = computeFindingSeverity({ kind: "amber_heal", confidence: 0.7, recurrence: 5 })
  expect(oneOff).toBe("medium")
  expect(highRec).toBe("high")

  // regression high → urgent when recurring
  const regOneOff  = computeFindingSeverity({ kind: "regression", confidence: 0.7, recurrence: 1 })
  const regHighRec = computeFindingSeverity({ kind: "regression", confidence: 0.7, recurrence: 3 })
  expect(regOneOff).toBe("high")
  expect(regHighRec).toBe("urgent")

  // visual low → medium when recurring
  const visOneOff  = computeFindingSeverity({ kind: "visual", confidence: 0.7, recurrence: 1 })
  const visHighRec = computeFindingSeverity({ kind: "visual", confidence: 0.7, recurrence: 4 })
  expect(visOneOff).toBe("low")
  expect(visHighRec).toBe("medium")
})

// ── (C) High confidence bumps priority ────────────────────────────────────
test("(C) KLA-168: confidence ≥ 0.9 bumps priority up one level", () => {
  const normalConf = computeFindingSeverity({ kind: "amber_heal", confidence: 0.7, recurrence: 1 })
  const highConf   = computeFindingSeverity({ kind: "amber_heal", confidence: 0.95, recurrence: 1 })
  expect(normalConf).toBe("medium")
  expect(highConf).toBe("high")

  // regression already high; high confidence → urgent
  const regHigh   = computeFindingSeverity({ kind: "regression", confidence: 0.7,  recurrence: 1 })
  const regUrgent = computeFindingSeverity({ kind: "regression", confidence: 0.95, recurrence: 1 })
  expect(regHigh).toBe("high")
  expect(regUrgent).toBe("urgent")
})

// ── (D) Low confidence downgrades priority ────────────────────────────────
test("(D) KLA-168: confidence < 0.5 bumps priority down one level (floor = low)", () => {
  const normalConf = computeFindingSeverity({ kind: "amber_heal", confidence: 0.7, recurrence: 1 })
  const lowConf    = computeFindingSeverity({ kind: "amber_heal", confidence: 0.3, recurrence: 1 })
  expect(normalConf).toBe("medium")
  expect(lowConf).toBe("low")

  // visual is already low; downgrade stays at low (floor)
  expect(computeFindingSeverity({ kind: "visual", confidence: 0.2, recurrence: 1 })).toBe("low")

  // regression: high → medium when confidence is low
  expect(computeFindingSeverity({ kind: "regression", confidence: 0.4, recurrence: 1 })).toBe("medium")
})

// ── (E) Combined upgrades for regression ──────────────────────────────────
test("(E) KLA-168: high recurrence + high confidence can each independently push to urgent", () => {
  // recurrence alone
  expect(computeFindingSeverity({ kind: "regression", confidence: 0.7, recurrence: 3 })).toBe("urgent")
  // confidence alone
  expect(computeFindingSeverity({ kind: "regression", confidence: 0.9, recurrence: 1 })).toBe("urgent")
  // both (capped at urgent)
  expect(computeFindingSeverity({ kind: "regression", confidence: 0.95, recurrence: 5 })).toBe("urgent")
  // downgrade + recurrence upgrade cancel out (amber, low-conf, 3 recurrences → medium-1+1=medium)
  expect(computeFindingSeverity({ kind: "amber_heal", confidence: 0.3, recurrence: 3 })).toBe("medium")
})

// ── (F) Ticket builder uses pre-computed priority; falls back for null ─────
test("(F) KLA-168: buildTicketFromFinding uses finding.priority; falls back to kind for null", () => {
  const base: Finding = {
    id: "find_test", projectId: "proj_test", runId: "run_test", stepId: null,
    trailId: "trail_test", kind: "regression", title: "Test regression",
    evidence: null, groundQuote: null, confidence: 0.7, dedupKey: "dk_test",
    contentSig: null, recurrence: 1,
    priority: null,  // no computed priority
    status: "queued", connectorRef: null, connectorError: null,
    createdAt: 1000, updatedAt: 1000,
  }

  // No pre-computed priority → falls back to severityForKind
  const ticket1 = buildTicketFromFinding(base, "https://example.com")
  expect(ticket1.priority).toBe("high")          // severityForKind("regression")

  // Pre-computed urgent (e.g. recurring regression) → uses it
  const findingWithPriority: Finding = { ...base, priority: "urgent" }
  const ticket2 = buildTicketFromFinding(findingWithPriority, "https://example.com")
  expect(ticket2.priority).toBe("urgent")

  // Pre-computed medium (e.g. low-confidence regression) → uses it, not the kind default
  const findingMedium: Finding = { ...base, priority: "medium" }
  const ticket3 = buildTicketFromFinding(findingMedium, "https://example.com")
  expect(ticket3.priority).toBe("medium")
})

// ── Backward-compat: severityForKind still works ───────────────────────────
test("severityForKind (legacy) still maps correctly", () => {
  expect(severityForKind("regression")).toBe("high")
  expect(severityForKind("amber_heal")).toBe("medium")
  expect(severityForKind("visual")).toBe("low")
})
