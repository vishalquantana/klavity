import { test, expect, mock, beforeAll, afterAll } from "bun:test"

// Adapter test uses globalThis.fetch = mock(...) (same pattern as connectors.test.ts /
// jira.attach.test.ts / field-sync.test.ts in this directory) rather than a real Bun.serve
// loopback receiver: bun runs every *.test.ts file in this directory in ONE process, and several
// of those files replace globalThis.fetch without restoring it afterward, so a real network test
// here is at the mercy of whatever mock the previous file left behind (observed: flaky/empty
// results depending on run order). Mocking fetch directly sidesteps that shared-process leak
// entirely and needs no KLAV_TEST_ALLOW_LOOPBACK / KLAV_LINEAR_API env seam.
const REAL_FETCH = globalThis.fetch
const GRAPHQL_RESPONSE = {
  data: {
    team: {
      states: { nodes: [{ id: "s1", name: "Todo", type: "unstarted" }, { id: "s2", name: "In Progress", type: "started" }, { id: "s3", name: "Done", type: "completed" }] },
      labels: { nodes: [{ id: "l1", name: "Bug" }, { id: "l2", name: "Feature" }] },
    },
  },
}
beforeAll(() => {
  globalThis.fetch = mock(async () => Response.json(GRAPHQL_RESPONSE)) as any
})
afterAll(() => { globalThis.fetch = REAL_FETCH })

test("listStatuses returns team workflow states", async () => {
  const { linearConnector } = await import("./linear")
  const st = await linearConnector.listStatuses!({ api_key: "k", team_id: "T" })
  expect(st.map(s => s.name)).toEqual(["Todo", "In Progress", "Done"])
})
test("listIssueTypes returns team labels", async () => {
  const { linearConnector } = await import("./linear")
  const types = await linearConnector.listIssueTypes!({ api_key: "k", team_id: "T" })
  expect(types.map(t => t.name)).toEqual(["Bug", "Feature"])
})
