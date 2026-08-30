import { test, expect } from "bun:test"
import { UpstreamTrackerError, classifyUpstreamError } from "./errors"

// A connector may attach `upstreamReason` (the tracker's own, already-redacted config-error text) to the
// error. classifyUpstreamError must SURFACE it so a 400 is self-fixable (e.g. Jira "project doesn't exist
// or you don't have permission") — not the generic "check the connector settings" dead-end.
test("classifyUpstreamError appends the tracker's reason when present (Jira 400 case)", () => {
  const e: any = new UpstreamTrackerError(400, "raw body")
  e.upstreamReason = "project: The target project doesn't exist or you don't have permission to create issues in it."
  const r = classifyUpstreamError(e)
  expect(r).not.toBeNull()
  expect(r!.code).toBe(400)
  expect(r!.friendly).toContain("Tracker said:")
  expect(r!.friendly).toContain("doesn't exist or you don't have permission")
})

test("classifyUpstreamError stays generic when no reason is attached", () => {
  const r = classifyUpstreamError(new UpstreamTrackerError(400))
  expect(r!.friendly).not.toContain("Tracker said:")
})

test("a very long reason is truncated to 200 chars (no unbounded echo)", () => {
  const e: any = new UpstreamTrackerError(400)
  e.upstreamReason = "x".repeat(500)
  const r = classifyUpstreamError(e)
  expect(r!.friendly.includes("x".repeat(200))).toBe(true)
  expect(r!.friendly.includes("x".repeat(201))).toBe(false)
})
