import { test, expect, beforeAll, afterAll } from "bun:test"
import { jiraConnector } from "./jira"
process.env.KLAV_TEST_ALLOW_LOOPBACK = "1"
let server: any, base = ""
beforeAll(() => {
  server = Bun.serve({ port: 0, fetch(req) {
    const u = new URL(req.url)
    if (u.pathname.endsWith("/issuetypes")) return Response.json([{ id: "1", name: "Bug" }, { id: "2", name: "Story" }, { id: "3", name: "Task" }])
    if (u.pathname.includes("/project/") && u.pathname.endsWith("/statuses")) return Response.json([{ name: "Task", statuses: [{ id: "10", name: "To Do" }, { id: "11", name: "In Progress" }, { id: "12", name: "Done" }] }])
    if (u.pathname.endsWith("/issue")) return Response.json({ key: "PROJ-1" })
    return new Response("no", { status: 404 })
  }})
  base = `http://127.0.0.1:${server.port}`
})
afterAll(() => server.stop(true))
const cfg = () => ({ host: base, email: "e@x.co", token: "t", project_key: "PROJ" })
test("listIssueTypes returns Jira types", async () => {
  const types = await jiraConnector.listIssueTypes!(cfg())
  expect(types.map(t => t.name)).toEqual(["Bug", "Story", "Task"])
})
test("listStatuses flattens + dedupes workflow statuses", async () => {
  const st = await jiraConnector.listStatuses!(cfg())
  expect(st.map(s => s.name)).toEqual(["To Do", "In Progress", "Done"])
})
test("createIssue picks issue type by kind from issue_type_map", async () => {
  let sent: any = null
  const c = { ...cfg(), issue_type_map: JSON.stringify({ bug: "Bug", feature: "Story", default: "Task" }) }
  const origFetch = server.fetch
  // Swap the fetch handler on the same server/port instead of stopping+restarting, which is
  // flaky under Bun (port reuse race). We branch on URL path and capture the POSTed body.
  server.reload({
    fetch: async (req: Request) => {
      const u = new URL(req.url)
      if (u.pathname.endsWith("/issue")) {
        sent = await req.json()
        return Response.json({ key: "PROJ-9" })
      }
      return new Response("no", { status: 404 })
    },
  })
  await jiraConnector.createIssue({ title: "t", body: "b", priority: null, url: null, simName: null, createdAt: Date.now(), klavityUrl: "k", kind: "feature" } as any, c)
  expect(sent.fields.issuetype.name).toBe("Story")
})
