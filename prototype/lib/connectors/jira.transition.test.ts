import { test, expect, mock } from "bun:test"
import { getConnector } from "./index"

// Klavity->Jira #414 (#433 mechanism): configurable default status transition after issue create.
// Mocks the Jira REST API and asserts: (a) with default_status set, createIssue resolves the
// transition id via GET .../transitions and POSTs it; (b) with default_status unset, no transitions
// call is made; (c) a failed transition never fails issue creation.

const BASE_TICKET = {
  title: "Bug",
  body: "desc",
  priority: "high",
  url: "https://app/x",
  simName: "Vamshi",
  createdAt: 1,
  klavityUrl: "https://klavity.in/dashboard",
}

const CFG = {
  host: "https://my.atlassian.net",
  email: "user@example.com",
  token: "jira-token",
  project_key: "PROJ",
  issue_type: "Bug",
}

const TRANSITIONS_BODY = {
  transitions: [
    { id: "11", name: "To Do", to: { name: "To Do" } },
    { id: "21", name: "Start Progress", to: { name: "In Progress" } },
    { id: "31", name: "Done", to: { name: "Done" } },
  ],
}

test("jira createIssue applies a configured default status transition (resolve id + POST)", async () => {
  const calls: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    calls.push([u, o])
    if (String(u).endsWith("/rest/api/3/issue")) {
      return new Response(JSON.stringify({ key: "PROJ-42" }), { status: 201 })
    }
    if (String(u).endsWith("/transitions") && o.method === "GET") {
      return new Response(JSON.stringify(TRANSITIONS_BODY), { status: 200 })
    }
    if (String(u).endsWith("/transitions") && o.method === "POST") {
      return new Response(null, { status: 204 })
    }
    return new Response("[]", { status: 200 })
  }) as any

  const r = await getConnector("jira")!.createIssue(
    { ...BASE_TICKET },
    { ...CFG, default_status: "In Progress" },
  )

  const getT = calls.find(([u, o]) => String(u).endsWith("/transitions") && o.method === "GET")
  const postT = calls.find(([u, o]) => String(u).endsWith("/transitions") && o.method === "POST")
  expect(getT[0]).toBe("https://my.atlassian.net/rest/api/3/issue/PROJ-42/transitions")
  expect(postT).toBeTruthy()
  // The transition id for the "In Progress" destination status (21) is what gets POSTed.
  expect(JSON.parse(postT[1].body)).toEqual({ transition: { id: "21" } })
  expect(r.externalKey).toBe("PROJ-42")
})

test("jira createIssue matches the transition by NAME too (not only destination status)", async () => {
  const calls: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    calls.push([u, o])
    if (String(u).endsWith("/rest/api/3/issue")) {
      return new Response(JSON.stringify({ key: "PROJ-43" }), { status: 201 })
    }
    if (String(u).endsWith("/transitions") && o.method === "GET") {
      return new Response(JSON.stringify(TRANSITIONS_BODY), { status: 200 })
    }
    return new Response(null, { status: 204 })
  }) as any

  await getConnector("jira")!.createIssue({ ...BASE_TICKET }, { ...CFG, default_status: "Start Progress" })

  const postT = calls.find(([u, o]) => String(u).endsWith("/transitions") && o.method === "POST")
  expect(JSON.parse(postT[1].body)).toEqual({ transition: { id: "21" } })
})

test("jira createIssue makes NO transitions call when default_status is unset", async () => {
  const calls: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    calls.push([u, o])
    if (String(u).endsWith("/rest/api/3/issue")) {
      return new Response(JSON.stringify({ key: "PROJ-1" }), { status: 201 })
    }
    return new Response("[]", { status: 200 })
  }) as any

  await getConnector("jira")!.createIssue({ ...BASE_TICKET }, CFG)

  expect(calls.length).toBe(1)
  expect(calls.every(([u]) => !String(u).endsWith("/transitions"))).toBe(true)
})

test("jira createIssue still succeeds when the transition GET fails", async () => {
  globalThis.fetch = mock(async (u: any, o: any) => {
    if (String(u).endsWith("/rest/api/3/issue")) {
      return new Response(JSON.stringify({ key: "PROJ-77" }), { status: 201 })
    }
    if (String(u).endsWith("/transitions")) {
      return new Response("boom", { status: 500 })
    }
    return new Response("[]", { status: 200 })
  }) as any

  const r = await getConnector("jira")!.createIssue({ ...BASE_TICKET }, { ...CFG, default_status: "In Progress" })
  expect(r.externalKey).toBe("PROJ-77")
})

test("jira createIssue no-ops the transition when the configured status has no matching transition", async () => {
  const calls: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    calls.push([u, o])
    if (String(u).endsWith("/rest/api/3/issue")) {
      return new Response(JSON.stringify({ key: "PROJ-88" }), { status: 201 })
    }
    if (String(u).endsWith("/transitions") && o.method === "GET") {
      return new Response(JSON.stringify(TRANSITIONS_BODY), { status: 200 })
    }
    return new Response(null, { status: 204 })
  }) as any

  const r = await getConnector("jira")!.createIssue({ ...BASE_TICKET }, { ...CFG, default_status: "Nonexistent Status" })
  expect(r.externalKey).toBe("PROJ-88")
  // GET happened but no POST (no matching transition).
  const postT = calls.find(([u, o]) => String(u).endsWith("/transitions") && o.method === "POST")
  expect(postT).toBeUndefined()
})

test("jira transitionIssue capability resolves + posts the transition id", async () => {
  const calls: any[] = []
  globalThis.fetch = mock(async (u: any, o: any) => {
    calls.push([u, o])
    if (String(u).endsWith("/transitions") && o.method === "GET") {
      return new Response(JSON.stringify(TRANSITIONS_BODY), { status: 200 })
    }
    return new Response(null, { status: 204 })
  }) as any

  const res = await getConnector("jira")!.transitionIssue!("PROJ-42", "Done", CFG)
  expect(res.ok).toBe(true)
  expect(res.applied).toBe(true)
  expect(res.transitionId).toBe("31")
})
