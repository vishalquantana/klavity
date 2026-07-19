/**
 * import.test.ts
 *
 * Hermetic tests for KLAVITYKLA-289 (JTBD 5.10) — importing external-first issues.
 *
 * Adapter tests set globalThis.fetch = mock(...) (same pattern as connectors.test.ts / field-sync.test.ts)
 * to assert github/linear listIssues parse the tracker response into the ImportedIssue shape.
 * Orchestration tests use makeImportExternalIssues() with injected fakes so no real network/DB is
 * touched: they prove import CREATES tickets on first run and DEDUPES on re-import.
 */

import { test, expect, mock } from "bun:test"
import { getConnector, type ImportedIssue } from "./index"
import {
  makeImportExternalIssues,
  type ImportDeps,
  type ImportConnectorRow,
  type ExistingExport,
  type FeedbackInsertArg,
  type ActivityRecord,
} from "./import"

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

function makeConnector(overrides: Partial<ImportConnectorRow> = {}): ImportConnectorRow {
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

type FakeState = {
  feedbackInserts: FeedbackInsertArg[]
  exports: Array<{ feedbackId: string; type: string; externalKey: string | null; projectId: string }>
  activityInserts: ActivityRecord[]
}

function makeDeps(opts: {
  connector?: ImportConnectorRow
  issues?: ImportedIssue[]
  existing?: Record<string, ExistingExport> // keyed by `${type}:${externalKey}`
  listIssuesThrows?: Error
  overrides?: Partial<ImportDeps>
} = {}): ImportDeps & { state: FakeState } {
  const state: FakeState = { feedbackInserts: [], exports: [], activityInserts: [] }
  const connector = opts.connector ?? makeConnector()
  const issues = opts.issues ?? []
  const existing = opts.existing ?? {}

  const fakeAdapter = {
    type: connector.type as any,
    label: "Fake",
    fields: [{ key: "owner" }, { key: "repo" }, { key: "token", secret: true }],
    validate: () => ({ ok: true as const }),
    createIssue: async () => ({ externalKey: null, externalUrl: null }),
    addComment: async () => ({ ok: true }),
    listIssues: async () => {
      if (opts.listIssuesThrows) throw opts.listIssuesThrows
      return issues
    },
  }

  const deps: ImportDeps & { state: FakeState } = {
    state,
    getConnector: () => fakeAdapter as any,
    decryptSecret: async (v: string) => `dec(${v})`,
    getConnectorById: async () => connector,
    findExportByExternalKey: async (type: string, externalKey: string) =>
      existing[`${type}:${externalKey}`] ?? null,
    insertFeedback: async (f: FeedbackInsertArg) => {
      state.feedbackInserts.push(f)
      return `fb_${state.feedbackInserts.length}`
    },
    addTicketExport: async (x) => {
      state.exports.push({ feedbackId: x.feedbackId, type: x.type, externalKey: x.externalKey, projectId: x.projectId })
      return `exp_${state.exports.length}`
    },
    insertActivity: async (a: ActivityRecord) => {
      state.activityInserts.push(a)
      return `evt_${state.activityInserts.length}`
    },
    ...opts.overrides,
  }
  return deps
}

const TWO_ISSUES: ImportedIssue[] = [
  { externalKey: "#42", externalUrl: "https://github.com/o/r/issues/42", title: "Login broken", body: "cannot log in", priority: "high", status: "open", createdAt: 2000 },
  { externalKey: "#43", externalUrl: "https://github.com/o/r/issues/43", title: "Typo on pricing", body: "", priority: null, status: "closed", createdAt: 3000 },
]

// ─────────────────────────────────────────────────────────────────────────────
// Orchestration: create then dedupe
// ─────────────────────────────────────────────────────────────────────────────

test("import creates a ticket + export link for each external issue on first run", async () => {
  const deps = makeDeps({ issues: TWO_ISSUES })
  const run = makeImportExternalIssues(deps)

  const summary = await run("proj_1", "conn_1", { actorEmail: "vishal@quantana.com.au" })

  expect(summary.fetched).toBe(2)
  expect(summary.imported).toBe(2)
  expect(summary.skipped).toBe(0)
  expect(summary.failed).toBe(0)
  expect(summary.importedKeys).toEqual(["#42", "#43"])

  // Two feedback rows created, priority + body mapped through.
  expect(deps.state.feedbackInserts).toHaveLength(2)
  expect(deps.state.feedbackInserts[0]).toMatchObject({
    projectId: "proj_1",
    priority: "high",
    source: "import:github",
    observation: "Login broken\n\ncannot log in",
  })
  // Empty body → observation is just the title.
  expect(deps.state.feedbackInserts[1].observation).toBe("Typo on pricing")

  // Each ticket got a linking export row keyed by externalKey (the dedupe key next time).
  expect(deps.state.exports.map((e) => e.externalKey)).toEqual(["#42", "#43"])
  expect(deps.state.exports.every((e) => e.type === "github" && e.projectId === "proj_1")).toBe(true)
})

test("re-import dedupes: already-linked issues are skipped, not re-created", async () => {
  // Simulate the state after the first run: both keys have a successful export in THIS project.
  const existing: Record<string, ExistingExport> = {
    "github:#42": { projectId: "proj_1", connectorId: "conn_1", externalKey: "#42" },
    "github:#43": { projectId: "proj_1", connectorId: "conn_1", externalKey: "#43" },
  }
  const deps = makeDeps({ issues: TWO_ISSUES, existing })
  const run = makeImportExternalIssues(deps)

  const summary = await run("proj_1", "conn_1", { actorEmail: "vishal@quantana.com.au" })

  expect(summary.fetched).toBe(2)
  expect(summary.imported).toBe(0)
  expect(summary.skipped).toBe(2)
  expect(deps.state.feedbackInserts).toHaveLength(0)
  expect(deps.state.exports).toHaveLength(0)
})

test("partial re-import: only NEW external issues are imported", async () => {
  const existing: Record<string, ExistingExport> = {
    "github:#42": { projectId: "proj_1", connectorId: "conn_1", externalKey: "#42" },
  }
  const deps = makeDeps({ issues: TWO_ISSUES, existing })
  const run = makeImportExternalIssues(deps)

  const summary = await run("proj_1", "conn_1", { actorEmail: null })

  expect(summary.imported).toBe(1)
  expect(summary.skipped).toBe(1)
  expect(summary.importedKeys).toEqual(["#43"])
  expect(deps.state.feedbackInserts).toHaveLength(1)
  expect(deps.state.feedbackInserts[0].observation).toBe("Typo on pricing")
})

test("dedupe is project-scoped: a matching key in ANOTHER project does not suppress import", async () => {
  // The same "#42" string exists, but as an export in a DIFFERENT project (different repo) → import.
  const existing: Record<string, ExistingExport> = {
    "github:#42": { projectId: "proj_OTHER", connectorId: "conn_x", externalKey: "#42" },
  }
  const deps = makeDeps({ issues: [TWO_ISSUES[0]], existing })
  const run = makeImportExternalIssues(deps)

  const summary = await run("proj_1", "conn_1", { actorEmail: null })

  expect(summary.imported).toBe(1)
  expect(summary.skipped).toBe(0)
})

test("import throws a config error when the adapter can't import", async () => {
  const noImportAdapter = {
    type: "webhook" as any,
    label: "Webhook",
    fields: [],
    validate: () => ({ ok: true as const }),
    createIssue: async () => ({ externalKey: null, externalUrl: null }),
    addComment: async () => ({ ok: true }),
    // no listIssues
  }
  const deps = makeDeps({ connector: makeConnector({ type: "webhook" }) })
  deps.getConnector = () => noImportAdapter as any
  const run = makeImportExternalIssues(deps)

  await expect(run("proj_1", "conn_1", { actorEmail: null })).rejects.toThrow(/not supported/i)
})

test("import propagates a listIssues transport failure (no silent empty import)", async () => {
  const deps = makeDeps({ issues: [], listIssuesThrows: new Error("tracker request failed (HTTP 401)") })
  const run = makeImportExternalIssues(deps)
  await expect(run("proj_1", "conn_1", { actorEmail: null })).rejects.toThrow(/HTTP 401/)
})

test("disabled connector is refused", async () => {
  const deps = makeDeps({ connector: makeConnector({ enabled: false }) })
  const run = makeImportExternalIssues(deps)
  await expect(run("proj_1", "conn_1", { actorEmail: null })).rejects.toThrow(/disabled/i)
})

// ─────────────────────────────────────────────────────────────────────────────
// Adapter: github listIssues parses the API response
// ─────────────────────────────────────────────────────────────────────────────

test("github listIssues maps issues, recovers priority from labels, and skips PRs", async () => {
  const calls = mockFetch([
    {
      number: 42,
      title: "Login broken",
      body: "cannot log in",
      html_url: "https://github.com/o/r/issues/42",
      state: "open",
      created_at: "2026-07-01T00:00:00Z",
      labels: [{ name: "bug" }, { name: "priority:high" }],
    },
    // A pull request masquerading in the issues list — must be skipped.
    { number: 99, title: "Some PR", pull_request: { url: "x" }, html_url: "x", labels: [] },
    {
      number: 43,
      title: "No priority label",
      body: null,
      html_url: "https://github.com/o/r/issues/43",
      state: "closed",
      created_at: "2026-07-02T00:00:00Z",
      labels: [],
    },
  ])

  const gh = getConnector("github")!
  const issues = await gh.listIssues!({ owner: "o", repo: "r", token: "tok" }, { limit: 10 })

  // PR filtered out → 2 issues.
  expect(issues.map((i) => i.externalKey)).toEqual(["#42", "#43"])
  expect(issues[0]).toMatchObject({
    externalKey: "#42",
    externalUrl: "https://github.com/o/r/issues/42",
    title: "Login broken",
    body: "cannot log in",
    priority: "high",
    status: "open",
  })
  // No priority label → null; null body → "".
  expect(issues[1].priority).toBeNull()
  expect(issues[1].body).toBe("")

  // Request hit the issues endpoint with state=all.
  expect(calls[0][0]).toContain("/repos/o/r/issues")
  expect(calls[0][0]).toContain("state=all")
})

test("github listIssues throws on missing config", async () => {
  const gh = getConnector("github")!
  await expect(gh.listIssues!({ owner: "o", repo: "r" } as any)).rejects.toThrow(/missing/i)
})

// ─────────────────────────────────────────────────────────────────────────────
// Adapter: linear listIssues parses the GraphQL response
// ─────────────────────────────────────────────────────────────────────────────

test("linear listIssues maps nodes and reverse-maps priority Int", async () => {
  mockFetch({
    data: {
      issues: {
        nodes: [
          { identifier: "ENG-42", url: "https://linear.app/x/issue/ENG-42", title: "Crash on save", description: "stack trace", priority: 1, createdAt: "2026-07-01T00:00:00Z", state: { name: "Todo", type: "unstarted" } },
          { identifier: "ENG-7", url: "https://linear.app/x/issue/ENG-7", title: "Low pri", description: null, priority: 0, createdAt: "2026-07-02T00:00:00Z", state: { name: "Done", type: "completed" } },
        ],
      },
    },
  })

  const lin = getConnector("linear")!
  const issues = await lin.listIssues!({ api_key: "lin_key", team_id: "TEAM" })

  expect(issues.map((i) => i.externalKey)).toEqual(["ENG-42", "ENG-7"])
  expect(issues[0]).toMatchObject({ externalKey: "ENG-42", title: "Crash on save", priority: "urgent", status: "Todo" })
  // priority 0 (none) → null; null description → "".
  expect(issues[1].priority).toBeNull()
  expect(issues[1].body).toBe("")
})

test("linear listIssues surfaces GraphQL errors", async () => {
  mockFetch({ errors: [{ message: "Authentication required" }] })
  const lin = getConnector("linear")!
  await expect(lin.listIssues!({ api_key: "bad", team_id: "TEAM" })).rejects.toThrow(/GraphQL error/i)
})
