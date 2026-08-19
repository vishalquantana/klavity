import { test, expect, mock, beforeAll, afterAll } from "bun:test"

// Adapter test uses globalThis.fetch = mock(...) (same pattern as connectors.test.ts /
// jira.attach.test.ts / linear.mapping.test.ts in this directory) rather than a real Bun.serve
// loopback receiver: bun runs every *.test.ts file in this directory in ONE process, and several
// of those files replace globalThis.fetch without restoring it afterward, so a real network test
// here is at the mercy of whatever mock the previous file left behind (observed: field-sync.test.ts
// leaves fetch mocked to return 500 "nope", which broke a real-network version of this test when run
// as part of the full `bun test lib/connectors/` suite). Mocking fetch directly sidesteps that
// shared-process leak entirely and needs no KLAV_TEST_ALLOW_LOOPBACK / KLAV_GITHUB_API env seam.
const REAL_FETCH = globalThis.fetch
beforeAll(() => {
  globalThis.fetch = mock(async () => Response.json([{ id: 1, name: "bug" }, { id: 2, name: "enhancement" }])) as any
})
afterAll(() => { globalThis.fetch = REAL_FETCH })

test("listStatuses is open/closed", async () => {
  const { githubConnector } = await import("./github")
  expect((await githubConnector.listStatuses!({ owner: "o", repo: "r", token: "t" })).map(s => s.name)).toEqual(["open", "closed"])
})
test("listIssueTypes returns repo labels", async () => {
  const { githubConnector } = await import("./github")
  expect((await githubConnector.listIssueTypes!({ owner: "o", repo: "r", token: "t" })).map(l => l.name)).toEqual(["bug", "enhancement"])
})
