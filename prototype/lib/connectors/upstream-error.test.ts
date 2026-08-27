import { test, expect, mock } from "bun:test"
import { planeConnector } from "./plane"
import { UpstreamTrackerError, classifyUpstreamError } from "./errors"

// KLA-724 regression + NEGATIVE CONTROL.
//
// A connector "Test connection" against a customer tracker with a bad token / wrong workspace / wrong
// project returns an EXPECTED 4xx (401/403/404). That used to be funnelled through server.ts's oops(),
// which UNCONDITIONALLY pages the Prod Alerts channel (reportError) AND auto-files an error ticket
// (autoTicketError) — so a user typo paged on-call and spawned junk tickets, while the user only saw a
// generic "Something went wrong" and couldn't self-fix.
//
// The fix: adapters throw a typed UpstreamTrackerError(status); the connector-test/meta handlers call
// classifyUpstreamError() FIRST — a 4xx returns a specific validation message and short-circuits BEFORE
// oops(). A 5xx / network / other error still routes through oops() (a real backend incident).
//
// NEGATIVE CONTROL: `simulateConnectorTest` below is a faithful copy of server.ts's connector-test catch
// (classify-then-oops). It runs the REAL planeConnector.createIssue over a mocked fetch. Against the
// PRE-FIX code (createIssue throws a plain Error, not UpstreamTrackerError), classifyUpstreamError()
// returns null, so the oops spy IS called and `test 403 → friendly validation error, oops NOT called`
// FAILS. That proves the test exercises the real regression, not a tautology.

// safeFetch routes through globalThis.fetch (same approach as plane.failsafe.test.ts).
const cfg = () => ({ host: "https://api.plane.so", workspace: "ws", project_id: "pr", token: "t" })
const TICKET = {
  title: "✅ Klavity connection test", body: "verify creds", priority: null, url: null,
  simName: "Klavity", createdAt: 1, klavityUrl: "https://klavity.in/dashboard",
}

function mockPlaneCreate(status: number) {
  globalThis.fetch = mock(async (u: any, o: any) => {
    const url = String(u)
    if (url.endsWith("/issues/") && (o?.method || "GET") === "POST") {
      return new Response("upstream body", { status })
    }
    return new Response("no", { status: 404 })
  }) as any
}

// Faithful mirror of server.ts's connector-test catch block. `oopsSpy` stands in for oops() (which
// fires reportError + autoTicketError). Returns the JSON body the handler would send.
async function simulateConnectorTest(oopsSpy: () => { error: string; id: string }) {
  try {
    const result = await planeConnector.createIssue(TICKET as any, cfg())
    return { ok: true as const, externalKey: result.externalKey }
  } catch (e: any) {
    const upstream = classifyUpstreamError(e)
    if (upstream) return { ok: false as const, error: upstream.friendly, code: upstream.code }
    const o = oopsSpy()
    return { ok: false as const, error: o.error, id: o.id }
  }
}

test("plane createIssue throws a typed UpstreamTrackerError carrying the status", async () => {
  mockPlaneCreate(403)
  let thrown: any
  try { await planeConnector.createIssue(TICKET as any, cfg()) } catch (e) { thrown = e }
  expect(thrown).toBeInstanceOf(UpstreamTrackerError)
  expect(thrown.status).toBe(403)
  // Client-facing message stays generic (no upstream body leak); raw body kept for server logs only.
  expect(thrown.message).toBe("tracker request failed (HTTP 403)")
})

test("connector-test 403 → friendly validation error, oops (reportError/autoTicket) NOT called", async () => {
  mockPlaneCreate(403)
  const oops = mock(() => ({ error: "Something went wrong. Please try again.", id: "abcd1234" }))
  const res = await simulateConnectorTest(oops)
  // (a) friendly validation error carrying the status
  expect(res.ok).toBe(false)
  expect(res.code).toBe(403)
  expect(res.error).toContain("403")
  expect(res.error).toContain("API token")
  // (b) the alerting path was NOT taken — this is the assertion that FAILS on the pre-fix code, where
  //     createIssue throws a plain Error, classifyUpstreamError returns null, and oops() IS called.
  expect(oops).not.toHaveBeenCalled()
})

test("connector-test 404 → wrong workspace/project guidance, no oops", async () => {
  mockPlaneCreate(404)
  const oops = mock(() => ({ error: "Something went wrong. Please try again.", id: "x" }))
  const res = await simulateConnectorTest(oops)
  expect(res.code).toBe(404)
  expect(res.error).toContain("workspace")
  expect(oops).not.toHaveBeenCalled()
})

test("connector-test 500 → STILL routes through oops (real backend incident, on-call SHOULD page)", async () => {
  mockPlaneCreate(500)
  const oops = mock(() => ({ error: "Something went wrong. Please try again.", id: "deadbeef" }))
  const res = await simulateConnectorTest(oops)
  expect(oops).toHaveBeenCalledTimes(1)
  expect(res.error).toBe("Something went wrong. Please try again.")
  expect((res as any).code).toBeUndefined()
})

test("classifyUpstreamError: 4xx classified, 5xx and non-upstream errors are NOT (→ oops)", () => {
  expect(classifyUpstreamError(new UpstreamTrackerError(401))?.code).toBe(401)
  expect(classifyUpstreamError(new UpstreamTrackerError(403))?.code).toBe(403)
  expect(classifyUpstreamError(new UpstreamTrackerError(404))?.code).toBe(404)
  expect(classifyUpstreamError(new UpstreamTrackerError(429))?.code).toBe(429)
  expect(classifyUpstreamError(new UpstreamTrackerError(500))).toBeNull()
  expect(classifyUpstreamError(new UpstreamTrackerError(502))).toBeNull()
  expect(classifyUpstreamError(new Error("network down"))).toBeNull()
  expect(classifyUpstreamError(new TypeError("fetch failed"))).toBeNull()
})
