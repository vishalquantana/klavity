// KLA-564 — receiving-side dogfood oracle (Klavity-on-Klavity).
//
// AutoSims today only exercise the REPORTING funnel (dogfood-autosim.ts walks the klavity.in hero +
// /onboarding). The RECEIVING surface — triage inbox, ticket list, single-ticket, status transitions —
// has ZERO AutoSim coverage, yet a large share of real QA misses live there ("submitted report never
// showed / triaged to the wrong bucket / ordering wrong"). This module is the PURE core of the
// receiving-side dogfood: it decides HOW to authenticate and it EVALUATES whether a just-submitted
// Snap arrived + triaged correctly. The runner (dogfood-receiving.ts) does the IO; everything here is
// side-effect-free so it can be unit-tested against a mocked triage response with no browser/server.
//
// Assertion vocabulary is deliberately SIMPLE for KLA-564: present + at-top (newest) + right bucket.
// The richer ordering/recency oracle is KLA-565 (separate) — do NOT build it here. The result shape
// below is structured (per-check objects, not a bare boolean) so KLA-565 can bolt on additional checks
// (e.g. `ordering`, `recency`) without changing the existing three.

import type { AutosimAuthMethod } from "./db"

// ── Auth-method selection ────────────────────────────────────────────────────
// The runner needs a logged-in session on Klavity's OWN dashboard. Two CI-friendly ladders exist
// (see autosim-auth-exec.ts): mint_link (GET /test-login?token= — cleanest, no form, no OTP) and
// fixed_otp (the 666666 test bypass, gated by KLAV_TEST_OTP). This picks between them deterministically
// so the choice itself is unit-testable and never depends on live IO.

export type ReceivingAuthMethod = AutosimAuthMethod | "none"

export interface AuthSelectionInput {
  /** The project's registered AutoSim auth method, if any (from loadAutosimAuthConfig). */
  configuredMethod: AutosimAuthMethod | null
  /** Whether the fixed test-OTP bypass (KLAV_TEST_OTP) is active on the target server. */
  testOtpActive: boolean
}

export interface AuthPlan {
  method: ReceivingAuthMethod
  reason: string
}

/**
 * Prefer mint_link (no form, no email round-trip — best for CI). Fall back to fixed_otp only when the
 * server actually has the test-OTP bypass enabled (otherwise 666666 would be rejected and the run would
 * hang at the login form). When neither is available, return "none" — the caller then runs unauthenticated
 * and the walk hits the auth gate + pauses (KLA-179), which is a legible failure rather than a silent hang.
 */
export function selectReceivingAuthMethod(input: AuthSelectionInput): AuthPlan {
  if (input.configuredMethod === "mint_link") {
    return { method: "mint_link", reason: "mint_link registered (no-form session mint, CI-preferred)" }
  }
  if (input.configuredMethod === "fixed_otp") {
    if (input.testOtpActive) {
      return { method: "fixed_otp", reason: "fixed_otp registered and KLAV_TEST_OTP active" }
    }
    return { method: "none", reason: "fixed_otp registered but KLAV_TEST_OTP is OFF — 666666 would be rejected" }
  }
  // No registered method: still allow a fixed-OTP fallback when the bypass is on (e.g. a fresh CI run
  // that authenticates via the OTP verify flow directly rather than a stored config).
  if (input.testOtpActive) {
    return { method: "fixed_otp", reason: "no method registered; KLAV_TEST_OTP active — use OTP bypass" }
  }
  return { method: "none", reason: "no auth method available (no mint_link, KLAV_TEST_OTP off)" }
}

// ── Receiving oracle ─────────────────────────────────────────────────────────
// Endpoint-agnostic: works on rows from GET /api/projects/:id/triage (the primary oracle, newest-first,
// status='new') OR GET /api/projects/:id/tickets. A row only needs an `id`; `priority`/`labels` are
// consulted only when the caller supplies an expectation.

export interface TriageRowLike {
  id: string
  priority?: string | null
  labels?: string[] | null
}

export interface ReceivingExpectation {
  /** The feedback id returned by POST /api/feedback for the seeded Snap. */
  feedbackId: string
  /** When set, assert the arrived row carries this priority (its triage bucket). Omit to skip. */
  expectedPriority?: string | null
  /** When set, assert the arrived row carries this label. Omit to skip. */
  expectedLabel?: string | null
}

export interface OracleCheck {
  pass: boolean
  detail: string
}

export interface ReceivingOracleResult {
  pass: boolean
  checks: {
    /** The seeded report is present anywhere in the returned set. */
    present: OracleCheck
    /** It is at index 0 — i.e. the newest item (the queue is newest-first). */
    atTop: OracleCheck & { index: number }
    /** It landed in the expected bucket (priority/label). Skipped checks pass by default. */
    bucket: OracleCheck & { expected: string | null; actual: string | null }
  }
  /** Flat list of human-readable failures (empty when pass). KLA-565 appends its checks' failures here. */
  failures: string[]
}

/**
 * The KLA-564 oracle: given the triage/tickets rows the dashboard would show and the seeded report's
 * expectation, decide present + at-top + right-bucket. Pure — no IO, no throw on "not found" (that's a
 * legitimate FAIL verdict, the exact QA miss this dogfood exists to catch).
 */
export function evaluateReceivingOracle(
  rows: readonly TriageRowLike[],
  expected: ReceivingExpectation,
): ReceivingOracleResult {
  const failures: string[] = []
  const idx = rows.findIndex((r) => r.id === expected.feedbackId)
  const found = idx >= 0

  const present: OracleCheck = {
    pass: found,
    detail: found
      ? `report ${expected.feedbackId} is present in ${rows.length} row(s)`
      : `report ${expected.feedbackId} is MISSING from ${rows.length} row(s) — submitted Snap never surfaced`,
  }
  if (!present.pass) failures.push(present.detail)

  const atTop = {
    pass: idx === 0,
    index: idx,
    detail:
      idx === 0
        ? "report is at index 0 (newest — correct for a just-submitted Snap)"
        : found
          ? `report is at index ${idx}, expected 0 (newest) — ordering wrong`
          : "report absent, cannot be at top",
  }
  if (found && !atTop.pass) failures.push(atTop.detail)

  // Bucket check only runs when the caller supplied an expectation AND we found the row.
  const wantPriority = expected.expectedPriority ?? null
  const wantLabel = expected.expectedLabel ?? null
  const row = found ? rows[idx] : undefined
  let bucketPass = true
  let bucketDetail = "no bucket expectation supplied — skipped"
  let bucketExpected: string | null = null
  let bucketActual: string | null = null
  if (found && (wantPriority !== null || wantLabel !== null)) {
    if (wantPriority !== null) {
      bucketExpected = wantPriority
      bucketActual = row?.priority ?? null
      bucketPass = bucketActual === wantPriority
      bucketDetail = bucketPass
        ? `priority is '${bucketActual}' as expected`
        : `priority is '${bucketActual}', expected '${wantPriority}' — triaged to wrong bucket`
    }
    if (bucketPass && wantLabel !== null) {
      const labels = row?.labels ?? []
      bucketExpected = wantLabel
      bucketActual = labels.join(",") || null
      bucketPass = labels.includes(wantLabel)
      bucketDetail = bucketPass
        ? `label '${wantLabel}' present`
        : `label '${wantLabel}' missing (labels: ${labels.join(",") || "none"})`
    }
  } else if (!found && (wantPriority !== null || wantLabel !== null)) {
    bucketPass = false
    bucketDetail = "report absent, cannot check bucket"
  }
  if (!bucketPass) failures.push(bucketDetail)

  const bucket = { pass: bucketPass, detail: bucketDetail, expected: bucketExpected, actual: bucketActual }

  return {
    pass: present.pass && atTop.pass && bucket.pass,
    checks: { present, atTop, bucket },
    failures,
  }
}

// ── Seeded Snap ──────────────────────────────────────────────────────────────
// A uniquely-identifiable report so a shared/live triage inbox never confuses this run's Snap with
// another's. The marker string is embedded in title + description so a human scanning the inbox can
// also spot it.

export interface SeededSnap {
  runId: string
  marker: string
  title: string
  description: string
  pageUrl: string
  type: "bug"
}

/** Build a deterministic-per-run seeded Snap payload. `runId` defaults to a fresh unique token. */
export function buildSeededSnap(runId?: string): SeededSnap {
  const id = runId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const marker = `KLA-564-DOGFOOD-${id}`
  return {
    runId: id,
    marker,
    title: `Receiving-side dogfood Snap [${marker}]`,
    description: `Automated receiving-side dogfood report. Marker=${marker}. If you see this in triage it is safe to dismiss.`,
    // Unique per run so recurrence/dedup never collapses one dogfood Snap into an earlier one (which
    // would bump the prior row's recurrence instead of inserting a fresh newest-first row).
    pageUrl: `https://klavity.in/dogfood-receiving/${id}`,
    type: "bug",
  }
}
