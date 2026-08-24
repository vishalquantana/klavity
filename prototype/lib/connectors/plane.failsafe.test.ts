import { test, expect, mock } from "bun:test"
import { planeConnector } from "./plane"

// KLA-551 (connector export failsafe): a configured default STATE that doesn't exist in the target
// Plane project must NOT throw and must NOT drop the finding — the issue is created in the tracker's
// default state and the unresolved name is surfaced via ExportResult.unresolvedMappings. A configured
// LABEL is always carried in the description (Plane applies labels by UUID), and label_map remaps it.
// A total create failure (5xx) still throws so the caller queues it in the outbox.
//
// safeFetch routes through globalThis.fetch, so (like jira.transition.test) we mock it directly rather
// than a loopback server — this stays isolation-robust when the whole connectors/ dir runs together.

const BASE_TICKET = {
  title: "Bug", body: "the page is broken", priority: "high",
  url: "https://app/x", simName: "Vamshi", createdAt: 1, klavityUrl: "https://klavity.in/dashboard",
}
// Use the real (resolvable) Plane cloud host so the SSRF guard's DNS lookup passes; the mock below
// intercepts the actual request.
const cfg = () => ({ host: "https://api.plane.so", workspace: "ws", project_id: "pr", token: "t" })

let lastPatchBody: any = null
let createdBody: any = null

function mockPlane(opts: { failCreate?: boolean } = {}) {
  lastPatchBody = null
  createdBody = null
  globalThis.fetch = mock(async (u: any, o: any) => {
    const url = String(u)
    const method = o?.method || "GET"
    if (url.endsWith("/issues/") && method === "POST") {
      if (opts.failCreate) return new Response("boom", { status: 500 })
      createdBody = JSON.parse(String(o.body))
      return new Response(JSON.stringify({ id: "iss1", sequence_id: 7 }), { status: 200 })
    }
    if (url.endsWith("/states/") && method === "GET") {
      return new Response(JSON.stringify({ results: [{ id: "a", name: "Backlog", group: "backlog" }, { id: "b", name: "Done", group: "completed" }] }), { status: 200 })
    }
    if (/\/issues\/iss1\/$/.test(url) && method === "PATCH") {
      lastPatchBody = JSON.parse(String(o.body))
      return new Response(null, { status: 200 })
    }
    return new Response("no", { status: 404 })
  }) as any
}

test("missing default state → issue still created, state left default, recorded as unresolved", async () => {
  mockPlane()
  const r = await planeConnector.createIssue({ ...BASE_TICKET }, { ...cfg(), default_status: "Nonexistent" })
  expect(r.externalKey).toBe("7")
  expect(r.unresolvedMappings).toEqual([{ field: "state", requested_name: "Nonexistent" }])
  expect(lastPatchBody).toBeNull()
})

test("resolvable default state → PATCHed natively, nothing unresolved", async () => {
  mockPlane()
  const r = await planeConnector.createIssue({ ...BASE_TICKET }, { ...cfg(), default_status: "Done" })
  expect(r.externalKey).toBe("7")
  expect(r.unresolvedMappings).toBeUndefined()
  expect(lastPatchBody).toEqual({ state: "b" })
})

test("state_map remaps a Klavity status name onto the real tracker state", async () => {
  mockPlane()
  const r = await planeConnector.createIssue(
    { ...BASE_TICKET },
    { ...cfg(), default_status: "Resolved", state_map: '{"Resolved":"Done"}' },
  )
  expect(r.unresolvedMappings).toBeUndefined()
  expect(lastPatchBody).toEqual({ state: "b" })
})

test("label_map remaps labels carried in the description (never dropped)", async () => {
  mockPlane()
  await planeConnector.createIssue(
    { ...BASE_TICKET, labels: ["UX polish"] },
    { ...cfg(), label_map: '{"UX polish":"ux"}' },
  )
  expect(createdBody.description_html).toContain("Labels: ux")
})

test("total create failure throws (so the caller queues it in the outbox — never silently dropped)", async () => {
  mockPlane({ failCreate: true })
  await expect(planeConnector.createIssue({ ...BASE_TICKET }, cfg())).rejects.toThrow(/HTTP 500/)
})
