/**
 * field-sync.test.ts
 *
 * Hermetic unit tests for KLAVITYKLA-286 (JTBD 5.7) outbound labels/priority sync.
 *
 * Adapter tests use globalThis.fetch = mock(...) (same pattern as connectors.test.ts /
 * comment-sync.test.ts) to assert each updateIssue builds the correct request shape.
 * Orchestration tests use makeSyncFieldsToLinkedIssues() with injected fake dependencies instead of
 * module-level mocks, so no real network/DB is touched and the connector registry is left untouched.
 */

import { test, expect, mock } from "bun:test"
import { getConnector } from "./index"
import { makeSyncFieldsToLinkedIssues, type FieldSyncDeps, type ExportRow, type ConnectorConfigRow, type ActivityRecord } from "./field-sync"
import type { FieldUpdate } from "./index"

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

function makeExport(overrides: Partial<ExportRow> = {}): ExportRow {
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

function makeConnector(overrides: Partial<ConnectorConfigRow> = {}): ConnectorConfigRow {
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

const FIELDS: FieldUpdate = { labels: ["Regression", "UX polish"], priority: "high" }

function makeDeps(overrides: Partial<FieldSyncDeps> = {}): FieldSyncDeps & {
  updateCalls: any[]
  activityInserts: ActivityRecord[]
} {
  const updateCalls: any[] = []
  const activityInserts: ActivityRecord[] = []

  const fakeAdapter = {
    type: "github" as const,
    label: "GitHub",
    fields: [{ key: "owner" }, { key: "repo" }, { key: "token", secret: true }],
    validate: () => ({ ok: true as const }),
    createIssue: async () => ({ externalKey: null, externalUrl: null }),
    addComment: async () => ({ ok: true }),
    updateIssue: async (ref: string, fields: FieldUpdate, cfg: any) => {
      updateCalls.push({ ref, fields, cfg })
      return { ok: true }
    },
  }

  const deps: FieldSyncDeps = {
    getConnector: (_type: string) => fakeAdapter as any,
    decryptSecret: async (v: string) => `dec(${v})`,
    listTicketExports: async () => [makeExport()],
    getConnectorById: async () => makeConnector(),
    insertActivity: async (a: ActivityRecord) => { activityInserts.push(a); return "evt_1" },
    ...overrides,
  }

  return Object.assign(deps, { updateCalls, activityInserts })
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapter-level tests: assert updateIssue builds the correct request shape.
// ─────────────────────────────────────────────────────────────────────────────

test("webhook updateIssue POSTs an update event with labels + priority", async () => {
  const calls = mockFetch({ ok: true })
  const r = await getConnector("webhook")!.updateIssue!(
    "issue-ref-abc",
    FIELDS,
    { url: "https://webhook.site/abc", secret: "mysecret" },
  )
  expect(r.ok).toBe(true)
  expect(calls).toHaveLength(1)
  expect(calls[0][0]).toBe("https://webhook.site/abc")
  expect(calls[0][1].method).toBe("POST")
  expect((calls[0][1].headers as any)["X-Klavity-Signature"]).toBe("mysecret")
  const body = JSON.parse(calls[0][1].body as string)
  expect(body.event).toBe("update")
  expect(body.externalIssueRef).toBe("issue-ref-abc")
  expect(body.labels).toEqual(["Regression", "UX polish"])
  expect(body.priority).toBe("high")
})

test("github updateIssue PATCHes labels including the priority:<value> label", async () => {
  const calls = mockFetch({ id: 42 })
  const r = await getConnector("github")!.updateIssue!(
    "#42",
    FIELDS,
    { owner: "o", repo: "r", token: "t" },
  )
  expect(r.ok).toBe(true)
  expect(calls[0][0]).toBe("https://api.github.com/repos/o/r/issues/42")
  expect(calls[0][1].method).toBe("PATCH")
  expect(JSON.parse(calls[0][1].body as string).labels).toEqual(["Regression", "UX polish", "priority:high"])
})

test("jira updateIssue PUTs native labels + mapped priority name", async () => {
  const calls = mockFetch({}, 204)
  const r = await getConnector("jira")!.updateIssue!(
    "PROJ-42",
    FIELDS,
    { host: "https://my.atlassian.net", email: "e", token: "t", project_key: "PROJ" },
  )
  expect(r.ok).toBe(true)
  expect(calls[0][0]).toBe("https://my.atlassian.net/rest/api/3/issue/PROJ-42")
  expect(calls[0][1].method).toBe("PUT")
  const body = JSON.parse(calls[0][1].body as string)
  // "UX polish" → "UX_polish" (no whitespace); "high" → "High".
  expect(body.fields.labels).toEqual(["Regression", "UX_polish"])
  expect(body.fields.priority).toEqual({ name: "High" })
})

test("plane updateIssue PATCHes native priority when the ref is already a UUID", async () => {
  const calls = mockFetch({ id: "issue-uuid-1" }, 200)
  const r = await getConnector("plane")!.updateIssue!(
    "issue-uuid-1", // non-numeric → no sequence resolve round-trip
    FIELDS,
    { host: "https://api.plane.so", workspace: "ws", project_id: "p", token: "t" },
  )
  expect(r.ok).toBe(true)
  expect(calls).toHaveLength(1)
  expect(calls[0][0]).toBe("https://api.plane.so/api/v1/workspaces/ws/projects/p/issues/issue-uuid-1/")
  expect(calls[0][1].method).toBe("PATCH")
  expect(JSON.parse(calls[0][1].body as string).priority).toBe("high")
})

test("plane updateIssue is a no-op (no fetch) when priority is unset", async () => {
  const calls = mockFetch({})
  const r = await getConnector("plane")!.updateIssue!(
    "issue-uuid-1",
    { labels: ["Regression"], priority: null },
    { host: "https://api.plane.so", workspace: "ws", project_id: "p", token: "t" },
  )
  expect(r.ok).toBe(true)
  expect(calls).toHaveLength(0)
})

test("linear updateIssue mutates native priority int (high → 2)", async () => {
  const calls = mockFetch({ data: { issueUpdate: { success: true } } })
  const r = await getConnector("linear")!.updateIssue!(
    "ENG-42",
    FIELDS,
    { api_key: "k", team_id: "tm" },
  )
  expect(r.ok).toBe(true)
  const body = JSON.parse(calls[0][1].body as string)
  expect(body.variables.id).toBe("ENG-42")
  expect(body.variables.p).toBe(2)
})

test("linear updateIssue is a no-op (no fetch) when priority is unset", async () => {
  const calls = mockFetch({})
  const r = await getConnector("linear")!.updateIssue!(
    "ENG-42",
    { labels: [], priority: null },
    { api_key: "k", team_id: "tm" },
  )
  expect(r.ok).toBe(true)
  expect(calls).toHaveLength(0)
})

test("adapter updateIssue never throws on non-2xx (returns { ok:false })", async () => {
  mockFetch("nope", 500)
  const r = await getConnector("jira")!.updateIssue!(
    "PROJ-1",
    FIELDS,
    { host: "https://my.atlassian.net", email: "e", token: "t", project_key: "PROJ" },
  )
  expect(r.ok).toBe(false)
  expect(r.error).toContain("500")
})

// ─────────────────────────────────────────────────────────────────────────────
// Orchestration tests: makeSyncFieldsToLinkedIssues with injected fake deps.
// ─────────────────────────────────────────────────────────────────────────────

test("pushes current fields to an eligible export and logs a synced activity", async () => {
  const deps = makeDeps()
  const sync = makeSyncFieldsToLinkedIssues(deps)
  await sync("proj_1", "fb_1", FIELDS, { actorEmail: "vishal@quantana.com.au" })
  await new Promise((r) => setTimeout(r, 10)) // let the detached pushOneExport settle

  expect(deps.updateCalls).toHaveLength(1)
  expect(deps.updateCalls[0].ref).toBe("#42")
  expect(deps.updateCalls[0].fields).toEqual(FIELDS)
  // Secret config field was decrypted before reaching the adapter.
  expect(deps.updateCalls[0].cfg.token).toBe("dec(tok)")

  expect(deps.activityInserts).toHaveLength(1)
  expect(deps.activityInserts[0].type).toBe("fields_synced_outbound")
  expect(deps.activityInserts[0].meta.priority).toBe("high")
})

test("skips failed exports and exports with a null externalKey", async () => {
  const deps = makeDeps({
    listTicketExports: async () => [
      makeExport({ id: "e_failed", status: "failed" }),
      makeExport({ id: "e_nokey", externalKey: null }),
    ],
  })
  const sync = makeSyncFieldsToLinkedIssues(deps)
  await sync("proj_1", "fb_1", FIELDS, { actorEmail: "a@b.c" })
  await new Promise((r) => setTimeout(r, 10))
  expect(deps.updateCalls).toHaveLength(0)
  expect(deps.activityInserts).toHaveLength(0)
})

test("logs a failure activity when the adapter returns { ok:false }", async () => {
  const failingAdapter = {
    type: "github", label: "GitHub",
    fields: [{ key: "token", secret: true }],
    validate: () => ({ ok: true as const }),
    createIssue: async () => ({ externalKey: null, externalUrl: null }),
    addComment: async () => ({ ok: true }),
    updateIssue: async () => ({ ok: false, error: "boom" }),
  }
  const deps = makeDeps({ getConnector: () => failingAdapter as any })
  const sync = makeSyncFieldsToLinkedIssues(deps)
  await sync("proj_1", "fb_1", FIELDS, { actorEmail: "a@b.c" })
  await new Promise((r) => setTimeout(r, 10))
  expect(deps.activityInserts).toHaveLength(1)
  expect(deps.activityInserts[0].type).toBe("fields_sync_failed_outbound")
  expect(deps.activityInserts[0].meta.error).toBe("boom")
})

test("skips an adapter that does not implement updateIssue (no activity)", async () => {
  const legacyAdapter = {
    type: "github", label: "GitHub",
    fields: [{ key: "token", secret: true }],
    validate: () => ({ ok: true as const }),
    createIssue: async () => ({ externalKey: null, externalUrl: null }),
    addComment: async () => ({ ok: true }),
    // no updateIssue
  }
  const deps = makeDeps({ getConnector: () => legacyAdapter as any })
  const sync = makeSyncFieldsToLinkedIssues(deps)
  await sync("proj_1", "fb_1", FIELDS, { actorEmail: "a@b.c" })
  await new Promise((r) => setTimeout(r, 10))
  expect(deps.activityInserts).toHaveLength(0)
})

test("skips a disabled connector", async () => {
  const deps = makeDeps({ getConnectorById: async () => makeConnector({ enabled: false }) })
  const sync = makeSyncFieldsToLinkedIssues(deps)
  await sync("proj_1", "fb_1", FIELDS, { actorEmail: "a@b.c" })
  await new Promise((r) => setTimeout(r, 10))
  expect(deps.updateCalls).toHaveLength(0)
})

test("never throws when listTicketExports rejects", async () => {
  const deps = makeDeps({ listTicketExports: async () => { throw new Error("db down") } })
  const sync = makeSyncFieldsToLinkedIssues(deps)
  await expect(sync("proj_1", "fb_1", FIELDS, { actorEmail: "a@b.c" })).resolves.toBeUndefined()
  expect(deps.updateCalls).toHaveLength(0)
})
