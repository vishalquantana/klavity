// Regression coverage for the connector-test alert-noise bug: a MISCONFIGURED tracker connector
// (e.g. Jira rejecting a test create because the connector's issue type is invalid) must NOT page
// (P1 Slack alert / auto-created Plane ticket) and must surface WHY it failed to the admin.
//
// server.ts boots an HTTP server as a side effect of import, and the real fix's error-alert path
// (reportError / autoTicketError) talks to Slack + Plane, so the classification + message-building
// logic lives in the small dependency-free module lib/connector-test-error.ts, imported directly
// here. This lets us unit-test the exact bug scenario (the real prod Jira body) without booting a
// server or mocking network calls.

import { test, expect } from "bun:test"
import { friendlyUpstream, isUpstreamConfigError } from "./lib/connector-test-error"

test("friendlyUpstream extracts the real Jira 'invalid issue type' reason", () => {
  const body = JSON.stringify({ errors: { issuetype: "Specify a valid issue type" } })
  const reason = friendlyUpstream(body)
  expect(reason).toContain("Specify a valid issue type")
})

test("friendlyUpstream joins multiple Jira field errors", () => {
  const body = JSON.stringify({
    errors: { issuetype: "Specify a valid issue type", project: "Specify a valid project" },
  })
  const reason = friendlyUpstream(body)
  expect(reason).toContain("Specify a valid issue type")
  expect(reason).toContain("Specify a valid project")
})

test("friendlyUpstream handles Jira top-level errorMessages array", () => {
  const body = JSON.stringify({ errorMessages: ["You do not have permission to create this issue"] })
  expect(friendlyUpstream(body)).toContain("You do not have permission")
})

test("friendlyUpstream handles a generic {message} shape (e.g. GitHub/Linear)", () => {
  const body = JSON.stringify({ message: "Not Found" })
  expect(friendlyUpstream(body)).toBe("Not Found")
})

test("friendlyUpstream falls back to the raw body when it isn't recognized JSON", () => {
  expect(friendlyUpstream("plain text failure")).toBe("plain text failure")
})

test("friendlyUpstream falls back to the raw body for unrecognized JSON shapes", () => {
  const body = JSON.stringify({ status: "error", code: 42 })
  expect(friendlyUpstream(body)).toBe(body)
})

test("friendlyUpstream handles empty/missing body", () => {
  expect(friendlyUpstream("")).toBe("no additional details available")
  expect(friendlyUpstream(undefined)).toBe("no additional details available")
  expect(friendlyUpstream(null)).toBe("no additional details available")
})

test("friendlyUpstream caps very long bodies to ~200 chars", () => {
  const long = "x".repeat(500)
  expect(friendlyUpstream(long).length).toBeLessThanOrEqual(200)
})

// ── Classification: which errors must NOT page ──────────────────────────────────────────────

test("isUpstreamConfigError is true for a 400 upstream rejection (the Jira bad-issue-type case)", () => {
  const err = new Error("tracker request failed (HTTP 400)")
  ;(err as any).upstreamStatus = 400
  expect(isUpstreamConfigError(err)).toBe(true)
})

test("isUpstreamConfigError is true across the whole 4xx range", () => {
  for (const status of [400, 401, 403, 404, 422, 499]) {
    const err = new Error("x")
    ;(err as any).upstreamStatus = status
    expect(isUpstreamConfigError(err)).toBe(true)
  }
})

test("isUpstreamConfigError is false for a 5xx upstream failure — that IS a page-worthy incident", () => {
  const err = new Error("tracker request failed (HTTP 500)")
  ;(err as any).upstreamStatus = 500
  expect(isUpstreamConfigError(err)).toBe(false)
})

test("isUpstreamConfigError is false for a plain error with no upstreamStatus (network error, bug, etc.)", () => {
  expect(isUpstreamConfigError(new Error("ECONNRESET"))).toBe(false)
  expect(isUpstreamConfigError(new TypeError("boom"))).toBe(false)
})

test("isUpstreamConfigError is false when upstreamStatus is not a number", () => {
  const err = new Error("x")
  ;(err as any).upstreamStatus = "400"
  expect(isUpstreamConfigError(err)).toBe(false)
})
