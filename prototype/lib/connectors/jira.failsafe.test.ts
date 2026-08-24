import { test, expect, mock } from "bun:test"
import { getConnector } from "./index"

// KLA-551 (connector export failsafe): a configured Jira default_status that has no matching workflow
// transition must NOT throw and must NOT drop the finding — the issue is created and left in its
// default status, and the unresolved name is surfaced via ExportResult.unresolvedMappings. A configured
// state that DOES resolve produces no unresolved entry. state_map remaps the requested name first.

const BASE_TICKET = {
  title: "Bug", body: "desc", priority: "high", url: "https://app/x",
  simName: "Vamshi", createdAt: 1, klavityUrl: "https://klavity.in/dashboard",
}
const CFG = {
  host: "https://my.atlassian.net", email: "user@example.com",
  token: "jira-token", project_key: "PROJ", issue_type: "Bug",
}
const TRANSITIONS_BODY = {
  transitions: [
    { id: "11", name: "To Do", to: { name: "To Do" } },
    { id: "31", name: "Done", to: { name: "Done" } },
  ],
}

function mockJira() {
  globalThis.fetch = mock(async (u: any, o: any) => {
    if (String(u).endsWith("/rest/api/3/issue")) {
      return new Response(JSON.stringify({ key: "PROJ-42" }), { status: 201 })
    }
    if (String(u).endsWith("/transitions") && o.method === "GET") {
      return new Response(JSON.stringify(TRANSITIONS_BODY), { status: 200 })
    }
    return new Response(null, { status: 204 })
  }) as any
}

test("unresolvable default_status → issue created, recorded as unresolved state (never dropped)", async () => {
  mockJira()
  const r = await getConnector("jira")!.createIssue({ ...BASE_TICKET }, { ...CFG, default_status: "Nonexistent" })
  expect(r.externalKey).toBe("PROJ-42")
  expect(r.unresolvedMappings).toEqual([{ field: "state", requested_name: "Nonexistent" }])
})

test("resolvable default_status → nothing unresolved", async () => {
  mockJira()
  const r = await getConnector("jira")!.createIssue({ ...BASE_TICKET }, { ...CFG, default_status: "Done" })
  expect(r.externalKey).toBe("PROJ-42")
  expect(r.unresolvedMappings).toBeUndefined()
})

test("state_map remaps default_status before resolving (Resolved → Done)", async () => {
  mockJira()
  const r = await getConnector("jira")!.createIssue(
    { ...BASE_TICKET },
    { ...CFG, default_status: "Resolved", state_map: '{"Resolved":"Done"}' },
  )
  expect(r.unresolvedMappings).toBeUndefined()
})

test("no default_status → nothing unresolved", async () => {
  mockJira()
  const r = await getConnector("jira")!.createIssue({ ...BASE_TICKET }, CFG)
  expect(r.unresolvedMappings).toBeUndefined()
})
