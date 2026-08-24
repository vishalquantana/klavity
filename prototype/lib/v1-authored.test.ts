// KLA-550 — unit tests for the authored-run wire-shape mapper.
import { test, expect } from "bun:test"
import { v1AuthoredStatus, buildAuthoredRunStatus } from "./v1-authored"

test("v1AuthoredStatus maps author states to wire states", () => {
  expect(v1AuthoredStatus({ status: "running" })).toBe("authoring")
  expect(v1AuthoredStatus({ status: "resuming" })).toBe("authoring")
  expect(v1AuthoredStatus({ status: "crystallized" })).toBe("completed")
  expect(v1AuthoredStatus({ status: "stalled" })).toBe("failed")
  expect(v1AuthoredStatus({ status: "failed" })).toBe("failed")
  expect(v1AuthoredStatus({ status: "needs_auth" })).toBe("needs_auth")
})

test("buildAuthoredRunStatus shapes the wire object", () => {
  const s: any = {
    id: "auth_1", status: "crystallized", trailId: "trail_9",
    verificationRunId: "run_5", verificationVerdict: "green",
    objectiveVerified: true, stallReason: null,
    createdAt: 111, updatedAt: 222,
  }
  expect(buildAuthoredRunStatus(s)).toEqual({
    authored_run_id: "auth_1", status: "completed", trail_id: "trail_9",
    verification_run_id: "run_5", verdict: "green", objective_verified: true,
    stall_reason: null, created_at: 111, updated_at: 222,
  })
})
