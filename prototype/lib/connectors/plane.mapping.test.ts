import { test, expect, beforeAll, afterAll } from "bun:test"
import { planeConnector } from "./plane"

process.env.KLAV_TEST_ALLOW_LOOPBACK = "1"

let server: any
let base = ""

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    fetch: (req) => {
      const u = new URL(req.url)
      if (u.pathname.endsWith("/states/")) {
        return Response.json({ results: [{ id: "a", name: "Backlog" }, { id: "b", name: "In Progress" }, { id: "c", name: "Done" }] })
      }
      if (u.pathname.endsWith("/labels/")) {
        return Response.json({ results: [{ id: "l", name: "Bug" }] })
      }
      return new Response("no", { status: 404 })
    },
  })
  base = `http://127.0.0.1:${server.port}`
})

afterAll(() => server.stop(true))

test("listStatuses returns project states", async () => {
  const st = await planeConnector.listStatuses!({ host: base, workspace: "ws", project_id: "pr", token: "t" })
  expect(st.map((s) => s.name)).toEqual(["Backlog", "In Progress", "Done"])
})

test("listIssueTypes returns project labels", async () => {
  const it = await planeConnector.listIssueTypes!({ host: base, workspace: "ws", project_id: "pr", token: "t" })
  expect(it.map((l) => l.name)).toEqual(["Bug"])
})

test("capabilities advertise typesAsLabels", () => {
  expect(planeConnector.capabilities).toEqual({ issueTypes: false, statuses: true, typesAsLabels: true })
})
