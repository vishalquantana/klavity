// prototype/lib/guards-linkage.test.ts
// Tests for KLAVITYKLA-242 (guard-this-fix) and KLAVITYKLA-243 (finding↔expectation linkage + saves counter).
import { test, expect } from "bun:test"
import { createClient } from "@libsql/client"
import { applySchema } from "./db"
import {
  upsertExpectationFromTicket,
  getExpectation,
  listExpectations,
  setExpectationEnforced,
  incrementExpectationSaves,
} from "./expectations-db"
import { ingestFinding } from "./expectations-ingest"
import { upsertExpectation } from "./expectations-db"

async function fresh() {
  const c = createClient({ url: "file::memory:" })
  await applySchema(c)
  return c
}

// ── KLA-242: Guard this fix ──────────────────────────────────────────────────

test("upsertExpectationFromTicket creates an expectation from a resolved ticket", async () => {
  const c = await fresh()
  const exp = await upsertExpectationFromTicket(c, {
    projectId: "p1",
    feedbackId: "fb_done_1",
    title: "Checkout button unresponsive on Safari",
    urlPath: "/checkout",
  })
  expect(exp.status).toBe("validated") // immediately validated — human confirmed the fix
  expect(exp.title).toBe("Checkout button unresponsive on Safari")
  expect(exp.urlPath).toBe("/checkout")
  expect(exp.sourceTicketId).toBe("fb_done_1") // KLA-242: tracks the originating ticket
  expect(exp.dedupKey).toBe("ticket:fb_done_1")
})

test("calling guard-this-fix twice on the same ticket returns the same expectation", async () => {
  const c = await fresh()
  const first = await upsertExpectationFromTicket(c, {
    projectId: "p1",
    feedbackId: "fb_dup",
    title: "Login OTP field missing",
    urlPath: "/login",
  })
  const second = await upsertExpectationFromTicket(c, {
    projectId: "p1",
    feedbackId: "fb_dup",
    title: "Login OTP field missing",
    urlPath: "/login",
  })
  expect(second.id).toBe(first.id)
  const list = await listExpectations(c, "p1")
  expect(list.length).toBe(1) // not duplicated
})

test("guard-this-fix result is visible in listExpectations and stays validated even if candidate threshold not met", async () => {
  const c = await fresh()
  await upsertExpectationFromTicket(c, {
    projectId: "p2",
    feedbackId: "fb_v",
    title: "Password reset email never arrives",
  })
  const list = await listExpectations(c, "p2")
  expect(list.length).toBe(1)
  expect(list[0].status).toBe("validated")
})

test("guard-this-fix respects lexical collapse with a pre-existing expectation from spine ingest", async () => {
  const c = await fresh()
  // Pre-existing expectation from spine ingest (similar title, different dedupKey)
  await upsertExpectation(c, {
    projectId: "p3",
    title: "Checkout submit button is missing on checkout page",
    dedupKey: "snap:checkout-submit-missing",
    source: { kind: "snap", id: "fb_snap_1" },
  })
  // Guard from a resolved ticket — title is a near-duplicate (≥ 0.82 lexical match)
  const exp = await upsertExpectationFromTicket(c, {
    projectId: "p3",
    feedbackId: "fb_done_checkout",
    title: "Checkout submit button missing on checkout page",
  })
  // Should collapse onto the existing expectation (lexical match ≥ 0.82)
  const list = await listExpectations(c, "p3")
  expect(list.length).toBe(1) // collapsed, not duplicated
  expect(exp.id).toBe(list[0].id)
  expect(exp.status).toBe("validated") // promoted
})

// ── KLA-243: Finding↔expectation linkage + saves counter ─────────────────────

test("ingestFinding returns the expectation id", async () => {
  const c = await fresh()
  const expId = await ingestFinding(c, {
    projectId: "p4",
    findingId: "find_a",
    title: "Submit button is broken on checkout",
    dedupKey: "auto:checkout-submit-broken",
    urlPath: "/checkout",
  })
  expect(typeof expId).toBe("string")
  expect(expId).toMatch(/^exp_/)
  const exp = await getExpectation(c, expId!)
  expect(exp).not.toBeNull()
  expect(exp!.title).toBe("Submit button is broken on checkout")
})

test("saves_count increments when a finding hits an enforced expectation (guard catches a regression)", async () => {
  const c = await fresh()
  // Create an expectation and enforce it
  const expId = await ingestFinding(c, {
    projectId: "p5",
    findingId: "find_initial",
    title: "Cart total shows wrong currency",
    dedupKey: "auto:cart-currency-wrong",
  })
  await setExpectationEnforced(c, expId!, "ts_assert_001")

  // New finding matching the same expectation = guard catches regression
  const expId2 = await ingestFinding(c, {
    projectId: "p5",
    findingId: "find_regression_1",
    title: "Cart total shows wrong currency",
    dedupKey: "auto:cart-currency-wrong", // same dedup key → collapses to same exp
  })
  expect(expId2).toBe(expId) // same expectation

  const exp = await getExpectation(c, expId!)
  expect(exp!.status).toBe("enforced") // unchanged
  expect(exp!.savesCount).toBe(1) // guard caught one regression
})

test("saves_count does not increment for non-enforced expectations", async () => {
  const c = await fresh()
  const expId = await ingestFinding(c, {
    projectId: "p6",
    findingId: "find_a",
    title: "Dark mode toggle broken",
    dedupKey: "auto:dark-mode-toggle",
  })
  // Not enforced yet — second finding should NOT increment saves
  await ingestFinding(c, {
    projectId: "p6",
    findingId: "find_b",
    title: "Dark mode toggle broken",
    dedupKey: "auto:dark-mode-toggle",
  })
  const exp = await getExpectation(c, expId!)
  expect(exp!.savesCount).toBe(0)
})

test("saves_count accumulates across multiple regressions", async () => {
  const c = await fresh()
  const expId = await ingestFinding(c, {
    projectId: "p7",
    findingId: "find_root",
    title: "Signup form broken",
    dedupKey: "auto:signup-form-broken",
  })
  await setExpectationEnforced(c, expId!, "ts_step_99")

  // Three subsequent regressions caught by the guard
  await ingestFinding(c, { projectId: "p7", findingId: "find_r1", title: "Signup form broken", dedupKey: "auto:signup-form-broken" })
  await ingestFinding(c, { projectId: "p7", findingId: "find_r2", title: "Signup form broken", dedupKey: "auto:signup-form-broken" })
  await ingestFinding(c, { projectId: "p7", findingId: "find_r3", title: "Signup form broken", dedupKey: "auto:signup-form-broken" })

  const exp = await getExpectation(c, expId!)
  expect(exp!.savesCount).toBe(3)
})

test("incrementExpectationSaves is directly callable and idempotent-additive", async () => {
  const c = await fresh()
  const exp = await upsertExpectation(c, {
    projectId: "p8",
    title: "Footer link 404",
    dedupKey: "k-footer-404",
    source: { kind: "snap", id: "fb_footer" },
  })
  await incrementExpectationSaves(c, exp.id)
  await incrementExpectationSaves(c, exp.id)
  const got = await getExpectation(c, exp.id)
  expect(got!.savesCount).toBe(2)
})

test("source_ticket_id is stored and returned on expectation rows", async () => {
  const c = await fresh()
  const exp = await upsertExpectationFromTicket(c, {
    projectId: "p9",
    feedbackId: "fb_ticket_42",
    title: "Error on confirm page",
    urlPath: "/confirm",
  })
  expect(exp.sourceTicketId).toBe("fb_ticket_42")
  // Verify via getExpectation
  const fetched = await getExpectation(c, exp.id)
  expect(fetched!.sourceTicketId).toBe("fb_ticket_42")
  // listExpectations also returns sourceTicketId
  const list = await listExpectations(c, "p9")
  expect(list[0].sourceTicketId).toBe("fb_ticket_42")
})
