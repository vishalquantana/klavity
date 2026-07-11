/**
 * comment-sync.test.ts
 *
 * Hermetic unit tests for KLAVITYKLA-290 outbound comment sync.
 *
 * Adapter tests use globalThis.fetch = mock(...) (same pattern as connectors.test.ts).
 * Integration tests use makePushCommentToLinkedIssues() with injected fake dependencies
 * instead of module-level mocks (avoids polluting the connector registry for other test files).
 *
 * No real network calls are made.
 */

import { test, expect, mock } from "bun:test"
import { getConnector } from "./index"
import { makePushCommentToLinkedIssues, type CommentSyncDeps } from "./comment-sync"
import type { TicketExportRow, ConnectorRow, ActivityInsert } from "../db"

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mockFetch(responseBody: any, status = 200) {
  const calls: Array<[string, RequestInit]> = []
  globalThis.fetch = mock(async (url: any, opts: any) => {
    calls.push([String(url), opts as RequestInit])
    return new Response(JSON.stringify(responseBody), { status })
  }) as any
  return calls
}

function makeExport(overrides: Partial<TicketExportRow> = {}): TicketExportRow {
  return {
    id: "exp_1",
    feedbackId: "fb_1",
    projectId: "proj_1",
    connectorId: "conn_1",
    type: "github",
    externalKey: "#42",
    externalUrl: "https://github.com/o/r/issues/42",
    status: "ok",
    error: null,
    createdAt: 1000,
    createdBy: "vishal@quantana.com.au",
    ...overrides,
  }
}

function makeConnector(overrides: Partial<ConnectorRow> = {}): ConnectorRow {
  return {
    id: "conn_1",
    projectId: "proj_1",
    type: "github",
    name: "My GitHub",
    config: { owner: "o", repo: "r", token: "tok" },
    autoCopy: false,
    enabled: true,
    createdAt: 1000,
    createdBy: null,
    ...overrides,
  }
}

// Build a minimal CommentSyncDeps with overrideable stubs.
function makeDeps(overrides: Partial<CommentSyncDeps> = {}): CommentSyncDeps & {
  addCommentCalls: any[]
  activityInserts: ActivityInsert[]
} {
  const addCommentCalls: any[] = []
  const activityInserts: ActivityInsert[] = []

  const fakeAdapter = {
    type: "github" as const,
    label: "GitHub",
    fields: [{ key: "owner" }, { key: "repo" }, { key: "token", secret: true }],
    validate: () => ({ ok: true as const }),
    createIssue: async () => ({ externalKey: null, externalUrl: null }),
    addComment: async (ref: string, text: string, meta: any, cfg: any) => {
      addCommentCalls.push({ ref, text, meta, cfg })
      return { ok: true, externalCommentId: "gh_cmt_99" }
    },
  }

  const deps: CommentSyncDeps = {
    getConnector: (_type: string) => fakeAdapter as any,
    decryptSecret: async (v: string) => v,
    listTicketExports: async () => [makeExport()],
    getConnectorById: async () => makeConnector(),
    insertActivity: async (a: ActivityInsert) => { activityInserts.push(a); return "evt_1" },
    ...overrides,
  }

  return Object.assign(deps, { addCommentCalls, activityInserts })
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapter-level tests: assert addComment builds the correct request shape.
// Uses globalThis.fetch mocks (same approach as connectors.test.ts).
// ─────────────────────────────────────────────────────────────────────────────

// ── Webhook addComment ────────────────────────────────────────────────────────

test("webhook addComment POSTs a comment event to the webhook URL", async () => {
  const calls = mockFetch({ id: "cmt_w1" })

  const result = await getConnector("webhook")!.addComment(
    "issue-ref-abc",
    "This is a comment",
    { authorEmail: "vishal@quantana.com.au", klavityCommentId: "tc_123" },
    { url: "https://webhook.site/abc", secret: "mysecret" },
  )

  expect(result.ok).toBe(true)
  expect(result.externalCommentId).toBe("cmt_w1")

  expect(calls).toHaveLength(1)
  expect(calls[0][0]).toBe("https://webhook.site/abc")
  expect(calls[0][1].method).toBe("POST")
  expect((calls[0][1].headers as any)["X-Klavity-Signature"]).toBe("mysecret")
  const body = JSON.parse(calls[0][1].body as string)
  expect(body.event).toBe("comment")
  expect(body.externalIssueRef).toBe("issue-ref-abc")
  expect(body.comment).toBe("This is a comment")
  expect(body.meta.klavityCommentId).toBe("tc_123")
})

test("webhook addComment omits signature header when no secret", async () => {
  const calls = mockFetch({})

  await getConnector("webhook")!.addComment(
    "ref",
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { url: "https://203.0.113.10/hook" },
  )

  expect(calls).toHaveLength(1)
  expect((calls[0][1].headers as any)["X-Klavity-Signature"]).toBeUndefined()
})

test("webhook addComment returns ok:false on non-2xx (never throws)", async () => {
  globalThis.fetch = mock(async () => new Response("Bad Gateway", { status: 502 })) as any

  const result = await getConnector("webhook")!.addComment(
    "ref",
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { url: "https://203.0.113.10/hook" },
  )

  expect(result.ok).toBe(false)
  expect(result.error).toMatch(/502/)
})

test("webhook addComment returns ok:false on SSRF-blocked URL (never throws)", async () => {
  let fetched = false
  globalThis.fetch = mock(async () => {
    fetched = true
    return new Response("{}", { status: 200 })
  }) as any

  const result = await getConnector("webhook")!.addComment(
    "ref",
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { url: "https://169.254.169.254/latest/meta-data/" },
  )

  // SSRF guard blocks the request before fetch is called.
  expect(fetched).toBe(false)
  expect(result.ok).toBe(false)
  expect(result.error).toBeTruthy()
})

// ── Plane addComment ──────────────────────────────────────────────────────────

test("plane addComment POSTs to the correct issue comment URL (UUID ref)", async () => {
  const calls = mockFetch({ id: "cmt_plane_1" }, 201)

  const result = await getConnector("plane")!.addComment(
    "issue-uuid-abc",
    "Plane comment text",
    { authorEmail: "vishal@quantana.com.au", klavityCommentId: "tc_456" },
    {
      host: "https://api.plane.so",
      workspace: "my-workspace",
      project_id: "proj-uuid",
      token: "plane-token",
    },
  )

  expect(result.ok).toBe(true)
  expect(result.externalCommentId).toBe("cmt_plane_1")

  // Only one request (non-numeric UUID ref skips the resolution step).
  expect(calls).toHaveLength(1)
  expect(calls[0][0]).toBe(
    "https://api.plane.so/api/v1/workspaces/my-workspace/projects/proj-uuid/issues/issue-uuid-abc/comments/",
  )
  expect(calls[0][1].method).toBe("POST")
  expect((calls[0][1].headers as any)["X-API-Key"]).toBe("plane-token")
  const body = JSON.parse(calls[0][1].body as string)
  expect(body.comment_html).toContain("Plane comment text")
})

test("plane addComment resolves sequence_id to UUID before posting", async () => {
  const calls: Array<[string, any]> = []
  let requestIndex = 0
  globalThis.fetch = mock(async (url: any, opts: any) => {
    calls.push([String(url), opts])
    requestIndex++
    if (requestIndex === 1) {
      // First call: issue list resolution
      return new Response(JSON.stringify({ results: [{ id: "resolved-uuid-99" }] }), { status: 200 })
    }
    // Second call: comment creation
    return new Response(JSON.stringify({ id: "cmt_plane_2" }), { status: 201 })
  }) as any

  const result = await getConnector("plane")!.addComment(
    "42", // pure integer → sequence_id → needs resolution
    "Comment via seq id",
    { authorEmail: null, klavityCommentId: "tc_789" },
    {
      host: "https://api.plane.so",
      workspace: "ws",
      project_id: "proj",
      token: "tok",
    },
  )

  expect(result.ok).toBe(true)
  expect(result.externalCommentId).toBe("cmt_plane_2")
  expect(calls).toHaveLength(2)
  // First call resolves sequence_id
  expect(calls[0][0]).toContain("sequence_id=42")
  // Second call uses the resolved UUID
  expect(calls[1][0]).toContain("resolved-uuid-99")
})

test("plane addComment returns ok:false on non-2xx (never throws)", async () => {
  globalThis.fetch = mock(async () => new Response("Forbidden", { status: 403 })) as any

  const result = await getConnector("plane")!.addComment(
    "issue-uuid",
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { host: "https://api.plane.so", workspace: "ws", project_id: "p", token: "t" },
  )

  expect(result.ok).toBe(false)
  expect(result.error).toMatch(/403/)
})

test("plane addComment returns ok:false when config fields missing (never throws)", async () => {
  const result = await getConnector("plane")!.addComment(
    "ref",
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { host: "https://api.plane.so" }, // missing workspace/project_id/token
  )

  expect(result.ok).toBe(false)
  expect(result.error).toMatch(/missing/)
})

// ── GitHub addComment ─────────────────────────────────────────────────────────

test("github addComment POSTs to issues/:number/comments with Bearer auth", async () => {
  const calls = mockFetch({ id: 77777 }, 201)

  const result = await getConnector("github")!.addComment(
    "#42",
    "GitHub comment text",
    { authorEmail: "vishal@quantana.com.au", klavityCommentId: "tc_gh1" },
    { owner: "my-org", repo: "my-repo", token: "gh_pat_token" },
  )

  expect(result.ok).toBe(true)
  expect(result.externalCommentId).toBe("77777")

  expect(calls).toHaveLength(1)
  expect(calls[0][0]).toBe("https://api.github.com/repos/my-org/my-repo/issues/42/comments")
  expect(calls[0][1].method).toBe("POST")
  expect((calls[0][1].headers as any)["Authorization"]).toBe("Bearer gh_pat_token")
  expect((calls[0][1].headers as any)["Accept"]).toBe("application/vnd.github+json")
  expect((calls[0][1].headers as any)["User-Agent"]).toBe("Klavity")
  const body = JSON.parse(calls[0][1].body as string)
  expect(body.body).toBe("GitHub comment text")
})

test("github addComment returns ok:false on invalid externalIssueRef (never throws)", async () => {
  globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as any

  const result = await getConnector("github")!.addComment(
    "not-a-number", // invalid — not "#N"
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { owner: "o", repo: "r", token: "t" },
  )

  expect(result.ok).toBe(false)
  expect(result.error).toMatch(/invalid/)
})

test("github addComment returns ok:false on non-2xx (never throws)", async () => {
  globalThis.fetch = mock(async () => new Response("Unauthorized", { status: 401 })) as any

  const result = await getConnector("github")!.addComment(
    "#7",
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { owner: "o", repo: "r", token: "bad" },
  )

  expect(result.ok).toBe(false)
  expect(result.error).toMatch(/401/)
})

test("github addComment returns ok:false when config fields missing (never throws)", async () => {
  const result = await getConnector("github")!.addComment(
    "#7",
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { owner: "o" }, // missing repo + token
  )

  expect(result.ok).toBe(false)
  expect(result.error).toMatch(/missing/)
})

// ── Jira addComment ───────────────────────────────────────────────────────────

test("jira addComment POSTs ADF body to /rest/api/3/issue/:key/comment with Basic auth", async () => {
  const calls = mockFetch({ id: "10042" }, 201)

  const result = await getConnector("jira")!.addComment(
    "PROJ-42",
    "Jira comment text",
    { authorEmail: "vishal@quantana.com.au", klavityCommentId: "tc_j1" },
    {
      host: "https://my.atlassian.net",
      email: "vishal@quantana.com.au",
      token: "jira-api-token",
      project_key: "PROJ",
    },
  )

  expect(result.ok).toBe(true)
  expect(result.externalCommentId).toBe("10042")

  expect(calls).toHaveLength(1)
  expect(calls[0][0]).toBe("https://my.atlassian.net/rest/api/3/issue/PROJ-42/comment")
  expect(calls[0][1].method).toBe("POST")

  // Auth is Basic base64(email:token)
  const expectedB64 = Buffer.from("vishal@quantana.com.au:jira-api-token").toString("base64")
  expect((calls[0][1].headers as any)["Authorization"]).toBe(`Basic ${expectedB64}`)
  expect((calls[0][1].headers as any)["Content-Type"]).toBe("application/json")

  const body = JSON.parse(calls[0][1].body as string)
  // Body must be ADF (Atlassian Document Format)
  expect(body.body.type).toBe("doc")
  expect(body.body.content[0].type).toBe("paragraph")
  expect(body.body.content[0].content[0].text).toBe("Jira comment text")
})

test("jira addComment returns ok:false on non-2xx (never throws)", async () => {
  globalThis.fetch = mock(async () => new Response("Bad Request", { status: 400 })) as any

  const result = await getConnector("jira")!.addComment(
    "PROJ-1",
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { host: "https://my.atlassian.net", email: "e", token: "t", project_key: "P" },
  )

  expect(result.ok).toBe(false)
  expect(result.error).toMatch(/400/)
})

test("jira addComment returns ok:false when config fields missing (never throws)", async () => {
  const result = await getConnector("jira")!.addComment(
    "PROJ-1",
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { host: "https://my.atlassian.net" }, // missing email + token
  )

  expect(result.ok).toBe(false)
  expect(result.error).toMatch(/missing/)
})

// ── Linear addComment ─────────────────────────────────────────────────────────

test("linear addComment resolves issue UUID then creates comment via GraphQL", async () => {
  const calls: Array<[string, any]> = []
  let step = 0
  globalThis.fetch = mock(async (url: any, opts: any) => {
    calls.push([String(url), opts])
    step++
    if (step === 1) {
      // issue(id:) query → return internal UUID
      return new Response(
        JSON.stringify({ data: { issue: { id: "internal-uuid-lin-42" } } }),
        { status: 200 },
      )
    }
    // commentCreate mutation
    return new Response(
      JSON.stringify({ data: { commentCreate: { comment: { id: "lin-cmt-99" } } } }),
      { status: 200 },
    )
  }) as any

  const result = await getConnector("linear")!.addComment(
    "ENG-42",
    "Linear comment text",
    { authorEmail: "vishal@quantana.com.au", klavityCommentId: "tc_lin1" },
    { api_key: "lin_api_secret", team_id: "TEAM-UUID" },
  )

  expect(result.ok).toBe(true)
  expect(result.externalCommentId).toBe("lin-cmt-99")

  expect(calls).toHaveLength(2)
  // Both calls go to the Linear GraphQL endpoint.
  expect(calls[0][0]).toBe("https://api.linear.app/graphql")
  expect(calls[1][0]).toBe("https://api.linear.app/graphql")

  // Auth uses the raw api_key (no "Bearer" prefix per Linear docs).
  expect((calls[0][1].headers as any)["Authorization"]).toBe("lin_api_secret")
  expect((calls[1][1].headers as any)["Authorization"]).toBe("lin_api_secret")

  // Step 1 resolves the issue by identifier.
  const step1Body = JSON.parse(calls[0][1].body)
  expect(step1Body.variables.id).toBe("ENG-42")
  expect(step1Body.query).toContain("issue(id:")

  // Step 2 creates the comment using the resolved UUID.
  const step2Body = JSON.parse(calls[1][1].body)
  expect(step2Body.variables.issueId).toBe("internal-uuid-lin-42")
  expect(step2Body.variables.body).toBe("Linear comment text")
  expect(step2Body.query).toContain("commentCreate")
})

test("linear addComment returns ok:false when issue resolution fails (never throws)", async () => {
  globalThis.fetch = mock(async () =>
    new Response(JSON.stringify({ data: { issue: null } }), { status: 200 })
  ) as any

  const result = await getConnector("linear")!.addComment(
    "ENG-MISSING",
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { api_key: "lin_api_secret", team_id: "T" },
  )

  expect(result.ok).toBe(false)
  expect(result.error).toMatch(/resolve issue ID/)
})

test("linear addComment returns ok:false on GraphQL commentCreate error (never throws)", async () => {
  let step = 0
  globalThis.fetch = mock(async () => {
    step++
    if (step === 1) {
      return new Response(
        JSON.stringify({ data: { issue: { id: "uuid-99" } } }),
        { status: 200 },
      )
    }
    return new Response(
      JSON.stringify({ errors: [{ message: "Not authorized to create comment" }] }),
      { status: 200 },
    )
  }) as any

  const result = await getConnector("linear")!.addComment(
    "ENG-7",
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { api_key: "bad-key", team_id: "T" },
  )

  expect(result.ok).toBe(false)
  expect(result.error).toMatch(/Not authorized to create comment/)
})

test("linear addComment returns ok:false when api_key missing (never throws)", async () => {
  const result = await getConnector("linear")!.addComment(
    "ENG-1",
    "text",
    { authorEmail: null, klavityCommentId: "tc_x" },
    { team_id: "T" }, // no api_key
  )

  expect(result.ok).toBe(false)
  expect(result.error).toMatch(/missing api_key/)
})

// ─────────────────────────────────────────────────────────────────────────────
// Integration tests: pushCommentToLinkedIssues orchestration logic.
//
// These tests use makePushCommentToLinkedIssues() with injected fake deps —
// no module-level mocks, so the connector registry stays untouched for other
// test files running in the same Bun process.
// ─────────────────────────────────────────────────────────────────────────────

test("outbound hook: fires addComment when a successful export record exists", async () => {
  const { addCommentCalls, activityInserts, ...deps } = makeDeps()

  const fn = makePushCommentToLinkedIssues(deps)
  await fn("proj_1", "fb_1", "Hello world", {
    authorEmail: "vishal@quantana.com.au",
    klavityCommentId: "tc_abc",
    source: "klavity",
  })

  // Allow microtasks to settle (pushOneExport runs in a detached promise chain)
  await new Promise((r) => setTimeout(r, 10))

  expect(addCommentCalls).toHaveLength(1)
  expect(addCommentCalls[0].ref).toBe("#42")
  expect(addCommentCalls[0].text).toBe("Hello world")
  expect(addCommentCalls[0].meta.klavityCommentId).toBe("tc_abc")
  expect(activityInserts).toHaveLength(1)
  expect(activityInserts[0].type).toBe("comment_synced_outbound")
  expect(activityInserts[0].meta.externalCommentId).toBe("gh_cmt_99")
})

test("outbound hook: skips push when no successful export exists (failed only)", async () => {
  const { addCommentCalls, ...deps } = makeDeps({
    listTicketExports: async () => [
      makeExport({ status: "failed", externalKey: null }),
    ],
  })

  const fn = makePushCommentToLinkedIssues(deps)
  await fn("proj_2", "fb_2", "Some comment", {
    authorEmail: null,
    klavityCommentId: "tc_yyy",
    source: "klavity",
  })

  await new Promise((r) => setTimeout(r, 10))

  expect(addCommentCalls).toHaveLength(0)
})

test("outbound hook: skips push when export list is empty", async () => {
  const { addCommentCalls, ...deps } = makeDeps({
    listTicketExports: async () => [],
  })

  const fn = makePushCommentToLinkedIssues(deps)
  await fn("proj_3", "fb_3", "Some comment", {
    authorEmail: null,
    klavityCommentId: "tc_zzz",
    source: "klavity",
  })

  await new Promise((r) => setTimeout(r, 10))

  expect(addCommentCalls).toHaveLength(0)
})

test("outbound hook: skips push for inbound-sourced comment (echo loop guard, Phase 2 seam)", async () => {
  const { addCommentCalls, ...deps } = makeDeps()

  const fn = makePushCommentToLinkedIssues(deps)

  // source: "inbound" → skipped immediately (Phase 2 echo loop guard)
  await fn("proj_4", "fb_4", "Echo comment", {
    authorEmail: null,
    klavityCommentId: "tc_echo",
    source: "inbound",
  })

  await new Promise((r) => setTimeout(r, 10))

  expect(addCommentCalls).toHaveLength(0)
})

test("outbound hook: records comment_sync_failed_outbound activity on adapter failure, never throws", async () => {
  const { activityInserts, ...deps } = makeDeps({
    getConnector: (_type: string) => ({
      type: "jira" as const,
      label: "Jira",
      fields: [{ key: "token", secret: true }],
      validate: () => ({ ok: true as const }),
      createIssue: async () => ({ externalKey: null, externalUrl: null }),
      addComment: async () => ({ ok: false as const, error: "upstream 503 Service Unavailable" }),
    }),
    listTicketExports: async () => [makeExport({ type: "jira", externalKey: "PROJ-7" })],
    getConnectorById: async () => makeConnector({ type: "jira" }),
  })

  const fn = makePushCommentToLinkedIssues(deps)

  let threw = false
  try {
    await fn("proj_5", "fb_5", "A comment", {
      authorEmail: "vishal@quantana.com.au",
      klavityCommentId: "tc_fail",
      source: "klavity",
    })
    await new Promise((r) => setTimeout(r, 10))
  } catch {
    threw = true
  }

  expect(threw).toBe(false)
  expect(activityInserts).toHaveLength(1)
  expect(activityInserts[0].type).toBe("comment_sync_failed_outbound")
  expect(activityInserts[0].meta.error).toContain("503")
})

test("outbound hook: skips push when connector is disabled", async () => {
  const { addCommentCalls, ...deps } = makeDeps({
    getConnectorById: async () => makeConnector({ enabled: false }),
  })

  const fn = makePushCommentToLinkedIssues(deps)
  await fn("proj_6", "fb_6", "A comment", {
    authorEmail: null,
    klavityCommentId: "tc_dis",
    source: "klavity",
  })

  await new Promise((r) => setTimeout(r, 10))

  // Disabled connector → no push
  expect(addCommentCalls).toHaveLength(0)
})

test("outbound hook: skips push when connector is null (deleted)", async () => {
  const { addCommentCalls, ...deps } = makeDeps({
    getConnectorById: async () => null,
  })

  const fn = makePushCommentToLinkedIssues(deps)
  await fn("proj_7", "fb_7", "A comment", {
    authorEmail: null,
    klavityCommentId: "tc_del",
    source: "klavity",
  })

  await new Promise((r) => setTimeout(r, 10))

  expect(addCommentCalls).toHaveLength(0)
})

test("outbound hook: pushes to all N eligible exports independently", async () => {
  const addCommentCalls: any[] = []
  const activityInserts: ActivityInsert[] = []

  const fakeAdapter = {
    type: "webhook" as const,
    label: "Webhook",
    fields: [{ key: "url" }],
    validate: () => ({ ok: true as const }),
    createIssue: async () => ({ externalKey: null, externalUrl: null }),
    addComment: async (ref: string, text: string, meta: any, cfg: any) => {
      addCommentCalls.push({ ref, cfg })
      return { ok: true as const, externalCommentId: "cmt_" + ref }
    },
  }

  const deps: CommentSyncDeps = {
    getConnector: () => fakeAdapter as any,
    decryptSecret: async (v) => v,
    listTicketExports: async () => [
      makeExport({ id: "exp_a", connectorId: "conn_a", externalKey: "ref_a", type: "webhook" }),
      makeExport({ id: "exp_b", connectorId: "conn_b", externalKey: "ref_b", type: "webhook" }),
    ],
    getConnectorById: async (_, id) =>
      makeConnector({ id, connectorId: id, type: "webhook", config: { url: `https://hook.example.com/${id}` } } as any),
    insertActivity: async (a) => { activityInserts.push(a); return "evt_x" },
  }

  const fn = makePushCommentToLinkedIssues(deps)
  await fn("proj_8", "fb_8", "Multi export comment", {
    authorEmail: null,
    klavityCommentId: "tc_multi",
    source: "klavity",
  })

  await new Promise((r) => setTimeout(r, 10))

  // Should have pushed to both exports.
  expect(addCommentCalls).toHaveLength(2)
  const refs = addCommentCalls.map((c) => c.ref).sort()
  expect(refs).toEqual(["ref_a", "ref_b"])
  expect(activityInserts).toHaveLength(2)
  expect(activityInserts.every((a) => a.type === "comment_synced_outbound")).toBe(true)
})

test("outbound hook: does not throw when listTicketExports DB read fails", async () => {
  const deps = makeDeps({
    listTicketExports: async () => { throw new Error("DB connection lost") },
  })

  const fn = makePushCommentToLinkedIssues(deps)

  let threw = false
  try {
    await fn("proj_9", "fb_9", "comment", {
      authorEmail: null,
      klavityCommentId: "tc_dberr",
      source: "klavity",
    })
  } catch {
    threw = true
  }

  expect(threw).toBe(false)
})
