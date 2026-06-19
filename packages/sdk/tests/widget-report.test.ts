// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { submitFeedback } from "../src/widget"

describe("submitFeedback", () => {
  beforeEach(() => vi.restoreAllMocks())
  it("first-party posts with credentials:include and no Bearer, returns issue url", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "fb1", saved: true }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    const res = await submitFeedback(
      { backendUrl: "https://klavity.quantana.top", projectId: "p1", firstParty: true, token: "" },
      { type: "bug", description: "x", pageUrl: "https://klavity.quantana.top/dashboard", screenshots: [] },
    )
    const [, init] = fetchMock.mock.calls[0]
    expect(init.credentials).toBe("include")
    expect(init.headers?.authorization).toBeUndefined()
    expect(res.issueKey).toBe("fb1")
  })
  it("cross-origin posts Bearer token, no credentials", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "fb2", saved: true }), { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)
    await submitFeedback(
      { backendUrl: "https://klavity.quantana.top", projectId: "p1", firstParty: false, token: "ext_abc" },
      { type: "bug", description: "x", pageUrl: "https://app.acme.com/p", screenshots: [] },
    )
    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers.authorization).toBe("Bearer ext_abc")
    expect(init.credentials).toBeUndefined()
  })
})
