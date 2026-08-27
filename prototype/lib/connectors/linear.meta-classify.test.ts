import { test, expect, mock, afterEach } from "bun:test"
import { linearConnector } from "./linear"
import { UpstreamTrackerError, classifyUpstreamError } from "./errors"

// KLA-731 regression + NEGATIVE CONTROL.
//
// KLA-724 taught the connector-test/meta handlers to treat an EXPECTED upstream 4xx (bad token /
// wrong workspace / missing team) as a USER config problem: adapters throw a typed
// UpstreamTrackerError(status), classifyUpstreamError() returns a friendly validation message and
// short-circuits BEFORE oops() (which pages Prod Alerts + auto-files a junk ticket). But ONLY
// plane.ts and jira.ts meta methods were updated — Linear's listStatuses / listIssueTypes still
// called res.json() WITHOUT checking res.ok, so:
//   (a) a Linear 401 (plain-text body) → `SyntaxError: Failed to parse JSON`, and
//   (b) a 200 with a GraphQL `errors` auth payload → an untyped plain Error,
// both of which classifyUpstreamError() returns null for → the /connectors/meta catch calls oops()
// → paged on-call + auto-filed junk. This is the exact noise KLA-724 fixed for Plane/Jira.
//
// NEGATIVE CONTROL: `simulateMeta` is a faithful mirror of server.ts's connectors/meta catch
// (classify-then-oops). Against the PRE-FIX linear.ts, listStatuses/listIssueTypes throw a
// SyntaxError (401 case) or a plain Error (GraphQL-auth case), classifyUpstreamError() returns null,
// so the oops spy IS called and the "oops NOT called" assertions FAIL — proving these tests
// exercise the real regression, not a tautology.

const REAL_FETCH = globalThis.fetch
afterEach(() => { globalThis.fetch = REAL_FETCH })

const cfg = () => ({ api_key: "bad-token", team_id: "T" })

// (a) HTTP 401 with a PLAIN-TEXT body — Linear returns text/plain for an unauthenticated request,
// which res.json() cannot parse.
function mock401PlainText() {
  globalThis.fetch = mock(async () => new Response("Authentication required", { status: 401 })) as any
}

// (b) HTTP 200 whose GraphQL body carries an authentication error (Linear's shape for a bad key
// that still returns 200 OK at the HTTP layer).
function mock200GraphqlAuth() {
  globalThis.fetch = mock(async () =>
    Response.json({
      errors: [{ message: "Authentication required - not authenticated", extensions: { code: "AUTHENTICATION_ERROR" } }],
    }),
  ) as any
}

// Faithful mirror of server.ts's connectors/meta catch. `oopsSpy` stands in for oops() (reportError +
// autoTicketError). Returns what the handler would send.
async function simulateMeta(
  fn: () => Promise<unknown>,
  oopsSpy: () => { error: string; id: string },
) {
  try {
    await fn()
    return { ok: true as const }
  } catch (e: any) {
    const upstream = classifyUpstreamError(e)
    if (upstream) return { ok: false as const, error: upstream.friendly, code: upstream.code }
    const o = oopsSpy()
    return { ok: false as const, error: o.error, id: o.id }
  }
}

for (const [name, fn] of [
  ["listStatuses", (c: Record<string, string>) => linearConnector.listStatuses!(c)],
  ["listIssueTypes", (c: Record<string, string>) => linearConnector.listIssueTypes!(c)],
] as const) {
  test(`linear ${name}: HTTP 401 plain-text body → typed UpstreamTrackerError(401)`, async () => {
    mock401PlainText()
    let thrown: any
    try { await fn(cfg()) } catch (e) { thrown = e }
    expect(thrown).toBeInstanceOf(UpstreamTrackerError)
    expect(thrown.status).toBe(401)
    // Pre-fix: res.json() on a plain-text 401 throws `SyntaxError: Failed to parse JSON` (NOT an
    // UpstreamTrackerError), so this instanceof assertion FAILS without the fix.
  })

  test(`linear ${name}: 200 + GraphQL auth errors → typed UpstreamTrackerError(401)`, async () => {
    mock200GraphqlAuth()
    let thrown: any
    try { await fn(cfg()) } catch (e) { thrown = e }
    expect(thrown).toBeInstanceOf(UpstreamTrackerError)
    expect(thrown.status).toBe(401)
    // Pre-fix: this path threw a plain `Error("tracker request failed (GraphQL error)")`, which
    // classifyUpstreamError() does NOT classify → oops(). instanceof UpstreamTrackerError FAILS.
  })

  test(`linear ${name}: 401 → friendly validation error, oops (on-call page) NOT called`, async () => {
    mock401PlainText()
    const oops = mock(() => ({ error: "Something went wrong. Please try again.", id: "abcd1234" }))
    const res = await simulateMeta(() => fn(cfg()), oops)
    expect(res.ok).toBe(false)
    expect((res as any).code).toBe(401)
    expect((res as any).error).toContain("401")
    expect((res as any).error).toContain("API token")
    // The assertion that FAILS pre-fix: a SyntaxError is unclassified → oops() IS called.
    expect(oops).not.toHaveBeenCalled()
  })

  test(`linear ${name}: 200 + GraphQL auth → friendly validation error, no oops`, async () => {
    mock200GraphqlAuth()
    const oops = mock(() => ({ error: "Something went wrong. Please try again.", id: "x" }))
    const res = await simulateMeta(() => fn(cfg()), oops)
    expect(res.ok).toBe(false)
    expect((res as any).code).toBe(401)
    expect(oops).not.toHaveBeenCalled()
  })
}

// A GraphQL permission error surfaces as a 403 (config problem: token lacks access to the team).
test("linear listStatuses: 200 + GraphQL FORBIDDEN → UpstreamTrackerError(403), classified friendly", async () => {
  globalThis.fetch = mock(async () =>
    Response.json({ errors: [{ message: "You are not authorized", extensions: { code: "FORBIDDEN" } }] }),
  ) as any
  let thrown: any
  try { await linearConnector.listStatuses!(cfg()) } catch (e) { thrown = e }
  expect(thrown).toBeInstanceOf(UpstreamTrackerError)
  expect(thrown.status).toBe(403)
  expect(classifyUpstreamError(thrown)?.code).toBe(403)
})

// Guardrail: a genuine 5xx STILL routes through oops() (real backend incident — on-call SHOULD page),
// and a NON-auth GraphQL error stays an unclassified plain Error (also → oops).
test("linear listIssueTypes: HTTP 500 → UpstreamTrackerError(500) NOT classified (→ oops)", async () => {
  globalThis.fetch = mock(async () => new Response("upstream boom", { status: 500 })) as any
  let thrown: any
  try { await linearConnector.listIssueTypes!(cfg()) } catch (e) { thrown = e }
  expect(thrown).toBeInstanceOf(UpstreamTrackerError)
  expect(thrown.status).toBe(500)
  expect(classifyUpstreamError(thrown)).toBeNull()
})

test("linear listStatuses: 200 + non-auth GraphQL error stays unclassified plain Error (→ oops)", async () => {
  globalThis.fetch = mock(async () =>
    Response.json({ errors: [{ message: "Variable $tm of type String! was not provided" }] }),
  ) as any
  let thrown: any
  try { await linearConnector.listStatuses!(cfg()) } catch (e) { thrown = e }
  expect(thrown).not.toBeInstanceOf(UpstreamTrackerError)
  expect(classifyUpstreamError(thrown)).toBeNull()
})
