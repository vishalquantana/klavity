// KLAVITYKLA-298 — unit tests for the pure server-side activation deriver.
// Fixture-only (no DB): deriveActivation is pure, so we exercise the ladder,
// stage transitions, and nextNudge selection with plain signal objects.
import { expect, test } from "bun:test"
import { deriveActivation, type ActivationSignals } from "./activation"

// A totally-blank account: nothing done yet.
const ZERO: ActivationSignals = {
  projectCount: 0,
  hasWidgetHeartbeat: false,
  reportCount: 0,
  simCount: 0,
  hasSimReaction: false,
  connectorCount: 0,
  memberCount: 0,
}

function sig(overrides: Partial<ActivationSignals>): ActivationSignals {
  return { ...ZERO, ...overrides }
}

// ── Empty account ────────────────────────────────────────────────────────────

test("zero signals → stage 'new', nothing done, nudge = create_project", () => {
  const a = deriveActivation(ZERO)
  expect(a.stage).toBe("new")
  expect(a.completedCount).toBe(0)
  expect(a.totalCount).toBe(7)
  expect(a.coreCompletedCount).toBe(0)
  expect(a.coreTotalCount).toBe(4)
  expect(a.nextNudge?.key).toBe("create_project")
  expect(a.steps.every(s => !s.done)).toBe(true)
})

// ── Ladder / ordering ─────────────────────────────────────────────────────────

test("only a project → still 'new' (project alone isn't activating), nudge = install_widget", () => {
  const a = deriveActivation(sig({ projectCount: 1 }))
  expect(a.stage).toBe("new")
  expect(a.coreCompletedCount).toBe(1)
  expect(a.nextNudge?.key).toBe("install_widget")
})

test("project + widget heartbeat → 'activating', nudge = first_report", () => {
  const a = deriveActivation(sig({ projectCount: 1, hasWidgetHeartbeat: true }))
  expect(a.stage).toBe("activating")
  expect(a.coreCompletedCount).toBe(2)
  expect(a.nextNudge?.key).toBe("first_report")
})

test("nextNudge always points at earliest not-done step in ladder order", () => {
  // widget not installed but a report + sim exist — earliest gap is install_widget.
  const a = deriveActivation(sig({ projectCount: 1, reportCount: 3, simCount: 1 }))
  expect(a.nextNudge?.key).toBe("install_widget")
})

// ── Activated ──────────────────────────────────────────────────────────────────

test("all four core steps done → stage 'activated', no expansion nudges yet", () => {
  const a = deriveActivation(sig({
    projectCount: 1, hasWidgetHeartbeat: true, reportCount: 5, simCount: 2,
  }))
  expect(a.stage).toBe("activated")
  expect(a.coreCompletedCount).toBe(4)
  // next best action moves to the first expansion lever
  expect(a.nextNudge?.key).toBe("sim_reacted")
})

// ── Expanding ──────────────────────────────────────────────────────────────────

test("activated + a connector → stage 'expanding'", () => {
  const a = deriveActivation(sig({
    projectCount: 1, hasWidgetHeartbeat: true, reportCount: 5, simCount: 2,
    connectorCount: 1,
  }))
  expect(a.stage).toBe("expanding")
})

test("activated + a teammate invited (memberCount>1) → stage 'expanding'", () => {
  const a = deriveActivation(sig({
    projectCount: 1, hasWidgetHeartbeat: true, reportCount: 5, simCount: 2,
    memberCount: 2,
  }))
  expect(a.stage).toBe("expanding")
})

test("fully done → nextNudge is null", () => {
  const a = deriveActivation(sig({
    projectCount: 1, hasWidgetHeartbeat: true, reportCount: 5, simCount: 2,
    hasSimReaction: true, connectorCount: 1, memberCount: 3,
  }))
  expect(a.completedCount).toBe(7)
  expect(a.nextNudge).toBeNull()
  expect(a.stage).toBe("expanding")
})

// ── Honesty: single owner does NOT count as an invited teammate ────────────────

test("memberCount of 1 (owner only) does NOT tick invite_team", () => {
  const a = deriveActivation(sig({ memberCount: 1 }))
  const invite = a.steps.find(s => s.key === "invite_team")!
  expect(invite.done).toBe(false)
})

// ── Determinism / purity ───────────────────────────────────────────────────────

test("deriveActivation is pure — same input, identical output", () => {
  const input = sig({ projectCount: 1, hasWidgetHeartbeat: true })
  expect(deriveActivation(input)).toEqual(deriveActivation(input))
})
