// KLA-81: computed severity model unit tests.
// All pure — no network, no DB.
// Tests:
//   (A) Base severity by kind (single occurrence, moderate confidence).
//   (B) High-recurrence (≥3) bumps severity up one level for each kind.
//   (C) High-confidence (≥0.9) bumps severity up one level for each kind.
//   (D) Low-confidence (<0.5) bumps severity down one level (floored at "low").
//   (E) Combined: high recurrence + high confidence can raise regression → "critical".
//   (F) Ticket builder uses pre-computed severity; falls back to kind-only for null.

import { test, expect } from "bun:test"
import { computeFindingSeverity } from "./trails-findings-severity"
import { buildTicketFromFinding, severityForKind } from "./trails-findings-gate"
import type { Finding } from "./trails-types"

// ── (A) Base severity by kind ───────────────────────────────────────────────
test("(A) KLA-81: base severity by kind (recurrence=1, moderate confidence)", () => {
  expect(computeFindingSeverity({ kind: "regression", confidence: 0.7, recurrence: 1 })).toBe("high")
  expect(computeFindingSeverity({ kind: "amber_heal", confidence: 0.7, recurrence: 1 })).toBe("medium")
  expect(computeFindingSeverity({ kind: "visual",     confidence: 0.7, recurrence: 1 })).toBe("low")
})

// ── (B) High recurrence bumps severity ────────────────────────────────────
test("(B) KLA-81: recurrence ≥ 3 bumps severity up one level", () => {
  // amber_heal medium → high when recurring
  const oneOff  = computeFindingSeverity({ kind: "amber_heal", confidence: 0.7, recurrence: 1 })
  const highRec = computeFindingSeverity({ kind: "amber_heal", confidence: 0.7, recurrence: 5 })
  expect(oneOff).toBe("medium")
  expect(highRec).toBe("high")

  // regression high → critical when recurring
  const regOneOff  = computeFindingSeverity({ kind: "regression", confidence: 0.7, recurrence: 1 })
  const regHighRec = computeFindingSeverity({ kind: "regression", confidence: 0.7, recurrence: 3 })
  expect(regOneOff).toBe("high")
  expect(regHighRec).toBe("critical")

  // visual low → medium when recurring
  const visOneOff  = computeFindingSeverity({ kind: "visual", confidence: 0.7, recurrence: 1 })
  const visHighRec = computeFindingSeverity({ kind: "visual", confidence: 0.7, recurrence: 4 })
  expect(visOneOff).toBe("low")
  expect(visHighRec).toBe("medium")
})

// ── (C) High confidence bumps severity ────────────────────────────────────
test("(C) KLA-81: confidence ≥ 0.9 bumps severity up one level", () => {
  const normalConf = computeFindingSeverity({ kind: "amber_heal", confidence: 0.7, recurrence: 1 })
  const highConf   = computeFindingSeverity({ kind: "amber_heal", confidence: 0.95, recurrence: 1 })
  expect(normalConf).toBe("medium")
  expect(highConf).toBe("high")

  // regression already high; high confidence → critical
  const regHigh   = computeFindingSeverity({ kind: "regression", confidence: 0.7,  recurrence: 1 })
  const regCrit   = computeFindingSeverity({ kind: "regression", confidence: 0.95, recurrence: 1 })
  expect(regHigh).toBe("high")
  expect(regCrit).toBe("critical")
})

// ── (D) Low confidence downgrades severity ────────────────────────────────
test("(D) KLA-81: confidence < 0.5 bumps severity down one level (floor = low)", () => {
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
test("(E) KLA-81: high recurrence + high confidence can each independently push to critical", () => {
  // recurrence alone
  expect(computeFindingSeverity({ kind: "regression", confidence: 0.7, recurrence: 3 })).toBe("critical")
  // confidence alone
  expect(computeFindingSeverity({ kind: "regression", confidence: 0.9, recurrence: 1 })).toBe("critical")
  // both (capped at critical)
  expect(computeFindingSeverity({ kind: "regression", confidence: 0.95, recurrence: 5 })).toBe("critical")
  // downgrade + recurrence upgrade cancel out (amber, low-conf, 3 recurrences → medium-1+1=medium)
  expect(computeFindingSeverity({ kind: "amber_heal", confidence: 0.3, recurrence: 3 })).toBe("medium")
})

// ── (F) Ticket builder uses pre-computed severity; falls back for null ─────
test("(F) KLA-81: buildTicketFromFinding uses finding.severity; falls back to kind for null", () => {
  const base: Finding = {
    id: "find_test", projectId: "proj_test", runId: "run_test", stepId: null,
    trailId: "trail_test", kind: "regression", title: "Test regression",
    evidence: null, groundQuote: null, confidence: 0.7, dedupKey: "dk_test",
    contentSig: null, recurrence: 1,
    severity: null,  // legacy — no computed severity
    status: "queued", connectorRef: null, connectorError: null,
    createdAt: 1000, updatedAt: 1000,
  }

  // No pre-computed severity → falls back to severityForKind
  const ticket1 = buildTicketFromFinding(base, "https://example.com")
  expect(ticket1.severity).toBe("high")          // severityForKind("regression")

  // Pre-computed critical (e.g. recurring regression) → uses it
  const findingWithSeverity: Finding = { ...base, severity: "critical" }
  const ticket2 = buildTicketFromFinding(findingWithSeverity, "https://example.com")
  expect(ticket2.severity).toBe("critical")

  // Pre-computed medium (e.g. low-confidence regression) → uses it, not the kind default
  const findingMedium: Finding = { ...base, severity: "medium" }
  const ticket3 = buildTicketFromFinding(findingMedium, "https://example.com")
  expect(ticket3.severity).toBe("medium")
})

// ── Backward-compat: severityForKind still works ───────────────────────────
test("severityForKind (legacy) still maps correctly", () => {
  expect(severityForKind("regression")).toBe("high")
  expect(severityForKind("amber_heal")).toBe("medium")
  expect(severityForKind("visual")).toBe("low")
})
