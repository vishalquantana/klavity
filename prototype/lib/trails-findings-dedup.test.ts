// KLA-77: cross-trail finding dedup tests.
// Verifies that contentSigFor() is stable + correct, and that recordFinding()
// collapses two findings from different Trails that hit the same broken element
// (same contentSig, different dedupKey) into ONE row with recurrence=2.
import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"

const file = join(tmpdir(), `klav-ct-dedup-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const T = await import("./trails")
const { contentSigFor } = await import("./trails-findings-dedup")

// ── Pure unit: contentSigFor ─────────────────────────────────────────────────

test("contentSigFor: stable hash — same inputs produce same sig", () => {
  const a = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Submit" }, urlPath: "/checkout" })
  const b = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Submit" }, urlPath: "/checkout" })
  expect(a).not.toBeNull()
  expect(a).toBe(b)
  expect(typeof a).toBe("string")
  expect(a!.length).toBe(32)
})

test("contentSigFor: different kind → different sig", () => {
  const a = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Submit" }, urlPath: "/checkout" })
  const b = contentSigFor({ kind: "amber_heal", fp: { role: "button", accessibleName: "Submit" }, urlPath: "/checkout" })
  expect(a).not.toBe(b)
})

test("contentSigFor: different URL path → different sig", () => {
  const a = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Submit" }, urlPath: "/checkout" })
  const b = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Submit" }, urlPath: "/payment" })
  expect(a).not.toBe(b)
})

test("contentSigFor: different accessible name → different sig", () => {
  const a = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Submit" }, urlPath: "/checkout" })
  const b = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Cancel" }, urlPath: "/checkout" })
  expect(a).not.toBe(b)
})

test("contentSigFor: testId takes priority over role/name", () => {
  const withTestId = contentSigFor({ kind: "regression", fp: { testId: "submit-btn", role: "button", accessibleName: "Submit" }, urlPath: "/checkout" })
  const justRole = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Submit" }, urlPath: "/checkout" })
  // Different because one uses testId:submit-btn, other uses button/submit
  expect(withTestId).not.toBe(justRole)
  // Consistent: two calls with testId produce same sig
  const withTestId2 = contentSigFor({ kind: "regression", fp: { testId: "submit-btn", role: "button", accessibleName: "Submit" }, urlPath: "/checkout" })
  expect(withTestId).toBe(withTestId2)
})

test("contentSigFor: selector fallback works when no fp", () => {
  const a = contentSigFor({ kind: "regression", selector: "#checkout-btn", urlPath: "/checkout" })
  const b = contentSigFor({ kind: "regression", selector: "#checkout-btn", urlPath: "/checkout" })
  expect(a).not.toBeNull()
  expect(a).toBe(b)
})

test("contentSigFor: returns null when no identity info", () => {
  const a = contentSigFor({ kind: "regression", urlPath: "/checkout" })
  expect(a).toBeNull()
})

test("contentSigFor: case-insensitive (accessibleName normalised)", () => {
  const a = contentSigFor({ kind: "regression", fp: { role: "BUTTON", accessibleName: "SUBMIT" }, urlPath: "/checkout" })
  const b = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "submit" }, urlPath: "/checkout" })
  expect(a).toBe(b)
})

test("contentSigFor: strips URL query string and fragment for stability", () => {
  const a = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Pay" }, urlPath: "/pay?session=abc#top" })
  const b = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Pay" }, urlPath: "/pay?session=xyz" })
  expect(a).toBe(b)  // both normalize to /pay
})

// ── Integration: cross-trail collapse in recordFinding ─────────────────────

const P = "proj_crosstrail"

test("recordFinding: two trails with same contentSig collapse to ONE finding, recurrence 2", async () => {
  const sig = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Checkout" }, urlPath: "/cart" })!
  const walkA = await T.startWalk(P, "trl_a")
  const walkB = await T.startWalk(P, "trl_b")

  // Trail A: first walk surfaces the broken element
  const r1 = await T.recordFinding(P, {
    runId: walkA, trailId: "trl_a", kind: "regression", title: "Checkout button gone",
    confidence: 1.0, dedupKey: "trl_a:step_1:gone", contentSig: sig,
  })
  expect(r1.deduped).toBe(false)
  expect(r1.recurrence).toBe(1)

  // Trail B: different trail, different dedupKey, same contentSig → collapses
  const r2 = await T.recordFinding(P, {
    runId: walkB, trailId: "trl_b", kind: "regression", title: "Checkout button gone",
    confidence: 1.0, dedupKey: "trl_b:step_1:gone", contentSig: sig,
  })
  expect(r2.deduped).toBe(true)
  expect(r2.id).toBe(r1.id)   // same finding row
  expect(r2.recurrence).toBe(2)

  // Exactly ONE finding in the project for this sig
  const all = await T.listFindings(P)
  const matching = all.filter((f) => f.contentSig === sig)
  expect(matching).toHaveLength(1)
  expect(matching[0].recurrence).toBe(2)
})

test("recordFinding: per-step dedupKey fast path still works (same trail, same dedupKey)", async () => {
  const P2 = "proj_ct_fastpath"
  const walkA = await T.startWalk(P2, "trl_x")
  const walkB = await T.startWalk(P2, "trl_x")
  const sig = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Pay" }, urlPath: "/pay" })

  const r1 = await T.recordFinding(P2, {
    runId: walkA, trailId: "trl_x", kind: "regression", title: "Pay button gone",
    confidence: 1.0, dedupKey: "trl_x:step_2:gone", contentSig: sig,
  })
  // Re-walk same trail, same step, same dedupKey — dedups via fast path
  const r2 = await T.recordFinding(P2, {
    runId: walkB, trailId: "trl_x", kind: "regression", title: "Pay button gone",
    confidence: 1.0, dedupKey: "trl_x:step_2:gone", contentSig: sig,
  })
  expect(r2.deduped).toBe(true)
  expect(r2.id).toBe(r1.id)
  expect(r2.recurrence).toBe(2)
})

test("recordFinding: different projects do NOT collapse across content sig", async () => {
  const PA = "proj_ct_isolation_a"
  const PB = "proj_ct_isolation_b"
  const sig = contentSigFor({ kind: "regression", fp: { role: "link", accessibleName: "Login" }, urlPath: "/" })!

  const walkA = await T.startWalk(PA, "trl_la")
  const walkB = await T.startWalk(PB, "trl_lb")

  const r1 = await T.recordFinding(PA, {
    runId: walkA, trailId: "trl_la", kind: "regression", title: "Login link gone",
    confidence: 1.0, dedupKey: "trl_la:step_1:gone", contentSig: sig,
  })
  const r2 = await T.recordFinding(PB, {
    runId: walkB, trailId: "trl_lb", kind: "regression", title: "Login link gone",
    confidence: 1.0, dedupKey: "trl_lb:step_1:gone", contentSig: sig,
  })

  // Different projects → separate findings (isolation)
  expect(r2.id).not.toBe(r1.id)
  expect(r2.deduped).toBe(false)
  expect(r1.recurrence).toBe(1)
  expect(r2.recurrence).toBe(1)
})

test("recordFinding: null contentSig falls through to per-step dedup only", async () => {
  const P3 = "proj_ct_null_sig"
  const walkA = await T.startWalk(P3, "trl_ns")
  const walkB = await T.startWalk(P3, "trl_ns2")

  // No contentSig on either call — each gets its own row
  const r1 = await T.recordFinding(P3, {
    runId: walkA, trailId: "trl_ns", kind: "regression", title: "Something gone",
    confidence: 1.0, dedupKey: "trl_ns:step_1:gone",
  })
  const r2 = await T.recordFinding(P3, {
    runId: walkB, trailId: "trl_ns2", kind: "regression", title: "Something gone",
    confidence: 1.0, dedupKey: "trl_ns2:step_1:gone",
  })

  // Different dedupKeys, no contentSig → two separate findings (old behavior preserved)
  expect(r2.id).not.toBe(r1.id)
  expect(r2.deduped).toBe(false)
})

test("recordFinding: cross-trail dedup survives re-crystallization (third trail same element)", async () => {
  const P4 = "proj_ct_recrystal"
  const sig = contentSigFor({ kind: "regression", fp: { role: "button", accessibleName: "Submit order" }, urlPath: "/order" })!

  const walkA = await T.startWalk(P4, "trl_orig")
  const walkB = await T.startWalk(P4, "trl_recrystal")
  const walkC = await T.startWalk(P4, "trl_recrystal2")

  const r1 = await T.recordFinding(P4, { runId: walkA, trailId: "trl_orig", kind: "regression", title: "Submit order gone", confidence: 1.0, dedupKey: "trl_orig:step_3:gone", contentSig: sig })
  const r2 = await T.recordFinding(P4, { runId: walkB, trailId: "trl_recrystal", kind: "regression", title: "Submit order gone", confidence: 1.0, dedupKey: "trl_recrystal:step_1:gone", contentSig: sig })
  const r3 = await T.recordFinding(P4, { runId: walkC, trailId: "trl_recrystal2", kind: "regression", title: "Submit order gone", confidence: 1.0, dedupKey: "trl_recrystal2:step_1:gone", contentSig: sig })

  expect(r1.recurrence).toBe(1)
  expect(r2.recurrence).toBe(2)
  expect(r3.recurrence).toBe(3)
  expect(r2.id).toBe(r1.id)
  expect(r3.id).toBe(r1.id)

  const all = await T.listFindings(P4)
  expect(all.filter((f) => f.contentSig === sig)).toHaveLength(1)
  expect(all.find((f) => f.contentSig === sig)!.recurrence).toBe(3)
})
