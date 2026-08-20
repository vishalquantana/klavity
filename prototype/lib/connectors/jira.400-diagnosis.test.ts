import { test, expect, mock } from "bun:test"
import { getConnector } from "./index"

// Regression for KLAVITYKLA-408: a Jira 400 during a connector test (the "Klavity connection test"
// ticket) used to throw a bare "tracker request failed (HTTP 400)" and DISCARD Jira's response
// body — which names the exact offending field (e.g. an invalid issuetype). We now capture that
// body and expose a SANITIZED reason on the thrown error's internal detail (upstreamStatus /
// upstreamBody / upstreamReason) so future 400s are diagnosable, WITHOUT leaking upstream text to
// end users (the client-facing message stays the generic "tracker request failed (HTTP 400)").

const BASE_TICKET = {
  title: "✅ Klavity connection test",
  body: "This is a test ticket created by Klavity.",
  priority: null,
  url: null,
  simName: "Klavity",
  createdAt: 1,
  klavityUrl: "https://klavity.in/dashboard",
}

const CFG = {
  host: "https://my.atlassian.net",
  email: "user@example.com",
  token: "jira-token",
  project_key: "PROJ",
  // no issue_type -> resolveIssueType falls back to "Task"; a team-managed project without a
  // "Task" issue type is the most likely real-world 400 trigger for the connector test.
}

test("jira createIssue captures the 400 reason internally without leaking it to the client", async () => {
  const errorBody = JSON.stringify({
    errorMessages: [],
    errors: { issuetype: "Specify a valid issue type" },
  })
  globalThis.fetch = mock(async () => new Response(errorBody, { status: 400 })) as any

  let thrown: any
  try {
    await getConnector("jira")!.createIssue(BASE_TICKET as any, CFG)
    throw new Error("expected createIssue to throw on HTTP 400")
  } catch (e) {
    thrown = e
  }

  // Client-facing message stays generic: no upstream/guard text leaks (oops() pattern).
  expect(thrown.message).toBe("tracker request failed (HTTP 400)")
  expect(thrown.message).not.toContain("issuetype")
  expect(thrown.message).not.toContain("Specify a valid issue type")

  // But the exact reason is captured on the error's internal detail for server-side diagnosis.
  expect(thrown.upstreamStatus).toBe(400)
  expect(thrown.upstreamReason).toContain("issuetype")
  expect(thrown.upstreamReason).toContain("Specify a valid issue type")
  expect(thrown.upstreamBody).toContain("Specify a valid issue type")
})

test("jira createIssue surfaces Jira's top-level errorMessages reason too", async () => {
  const errorBody = JSON.stringify({
    errorMessages: ["The value 'PROJ' does not exist for the field 'project'."],
    errors: {},
  })
  globalThis.fetch = mock(async () => new Response(errorBody, { status: 400 })) as any

  let thrown: any
  try {
    await getConnector("jira")!.createIssue(BASE_TICKET as any, CFG)
  } catch (e) {
    thrown = e
  }

  expect(thrown.message).toBe("tracker request failed (HTTP 400)")
  expect(thrown.upstreamReason).toContain("does not exist for the field")
})
