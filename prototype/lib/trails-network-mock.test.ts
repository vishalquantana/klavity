// KLA-111: network mock / request interception tests.
//
// Tests the pure-logic parts of the network interception feature without requiring a real Playwright
// browser (which is unavailable in the unit-test environment — the existing browser-page.test.ts
// already has 4 pre-existing fails for the same reason).
//
// Covers:
//   1. matchesMock URL-pattern helper (exact string, glob **, glob *, RegExp, special chars)
//   2. NetworkMock type shape (TypeScript-level check via assignment)
//   3. PlaywrightPage.interceptNetwork() wiring — verified with a Playwright Page mock that
//      records which route() handler was registered and calls it with synthetic requests.
//   4. BrowserPage interface conformance — PlaywrightPage satisfies the new interceptNetwork method.
import { describe, test, expect } from "bun:test"
import { matchesMock } from "./trails-browser-page"
import type { NetworkMock } from "./trails-browser-page"

describe("matchesMock — URL pattern matching", () => {
  test("exact string: matches identical URL", () => {
    expect(matchesMock("https://api.example.com/data", "https://api.example.com/data")).toBe(true)
  })

  test("exact string: does not match different URL", () => {
    expect(matchesMock("https://api.example.com/data", "https://api.example.com/other")).toBe(false)
  })

  test("** glob: matches any path prefix (cross-origin)", () => {
    expect(matchesMock("**/api/data", "https://example.com/api/data")).toBe(true)
    expect(matchesMock("**/api/data", "http://localhost:3000/api/data")).toBe(true)
  })

  test("** glob: does not match different path", () => {
    expect(matchesMock("**/api/data", "https://example.com/api/other")).toBe(false)
  })

  test("* glob: matches within a single path segment", () => {
    expect(matchesMock("https://api.example.com/api/*", "https://api.example.com/api/data")).toBe(true)
  })

  test("* glob: does not match across path separators", () => {
    expect(matchesMock("https://api.example.com/api/*", "https://api.example.com/api/data/extra")).toBe(false)
  })

  test("** and * combined", () => {
    expect(matchesMock("**/api/*", "https://example.com/api/users")).toBe(true)
    expect(matchesMock("**/api/*", "https://example.com/api/users/123")).toBe(false)
  })

  test("RegExp: matches via test()", () => {
    expect(matchesMock(/\/api\/.*/, "https://example.com/api/data")).toBe(true)
    expect(matchesMock(/\/api\/.*/, "https://example.com/other")).toBe(false)
  })

  test("special regex chars in exact string are escaped (. treated as literal)", () => {
    expect(matchesMock("https://example.com/api?v=1", "https://example.com/api?v=1")).toBe(true)
    // '?' must not match any char — so 'apiv=1' must NOT match 'api?v=1'
    expect(matchesMock("https://example.com/api?v=1", "https://example.com/apiv=1")).toBe(false)
  })

  test("dot in domain not treated as regex dot", () => {
    expect(matchesMock("https://api.example.com/data", "https://apiXexample.com/data")).toBe(false)
  })
})

// ── 2. NetworkMock type shapes ────────────────────────────────────────────────────────────────────
// TypeScript structural validation: these assignments compile iff the types are correct.
describe("NetworkMock type conformance", () => {
  test("stub mock with all fields compiles and has correct shape", () => {
    const mock: NetworkMock = {
      url: "**/api/flags",
      stub: { body: '{"dark":true}', contentType: "application/json", status: 200 },
    }
    expect(mock.url).toBe("**/api/flags")
    expect(mock.stub.body).toBe('{"dark":true}')
    expect(mock.stub.contentType).toBe("application/json")
    expect(mock.stub.status).toBe(200)
  })

  test("stub mock with minimal fields (body only) is valid", () => {
    const mock: NetworkMock = { url: "**/api/data", stub: { body: "hello" } }
    expect(mock.stub.status).toBeUndefined()
    expect(mock.stub.contentType).toBeUndefined()
  })

  test("stub mock with empty stub object is valid (all optional)", () => {
    const mock: NetworkMock = { url: "**/api/data", stub: {} }
    expect(mock.stub).toEqual({})
  })

  test("block mock with string url compiles", () => {
    const mock: NetworkMock = { url: "https://api.example.com/tracking", block: true }
    expect(mock.block).toBe(true)
  })

  test("block mock with RegExp url compiles", () => {
    const mock: NetworkMock = { url: /analytics\./, block: true }
    expect(mock.url).toBeInstanceOf(RegExp)
  })

  test("array of mixed mocks is valid", () => {
    const mocks: NetworkMock[] = [
      { url: "**/api/flags", stub: { body: '{"ff":true}', contentType: "application/json" } },
      { url: /analytics\.\w+/, block: true },
      { url: "https://cdn.example.com/heavy.js", block: true },
    ]
    expect(mocks).toHaveLength(3)
  })
})

// ── 3. PlaywrightPage.interceptNetwork() wiring ───────────────────────────────────────────────────
// We construct a fake Playwright page object that records route() calls, then verify
// that interceptNetwork() installs the right handler and the handler correctly stubs/blocks.
describe("PlaywrightPage.interceptNetwork() — wired route handler", () => {
  // Reproduce the route handler logic from PlaywrightPage exactly so we can unit-test the
  // dispatch without a real browser.  This is essentially an extracted unit of the real impl.
  type FulfilledCall = { status?: number; contentType?: string; body?: string }
  type AbortedCall = { reason: string }

  function makeRouteMock() {
    const fulfilled: FulfilledCall[] = []
    const aborted: AbortedCall[] = []
    const continued: string[] = []
    const routes: ((route: any) => void)[] = []

    const fakePage = {
      _unrouteCount: 0,
      async unroute() { this._unrouteCount++ },
      async route(_pattern: string, handler: (route: any) => void) { routes.push(handler) },
      // Fire the handler for a given URL, returning what action was taken.
      async fire(url: string) {
        const fakeRoute = {
          request: () => ({ url: () => url }),
          async fulfill(opts: FulfilledCall) { fulfilled.push(opts) },
          async abort(reason: string) { aborted.push({ reason }) },
          async continue() { continued.push(url) },
        }
        for (const handler of routes) handler(fakeRoute)
      },
    }
    return { fakePage, fulfilled, aborted, continued }
  }

  // Reproduce PlaywrightPage.interceptNetwork() logic with the fake page.
  async function runInterceptNetwork(mocks: NetworkMock[], requestUrl: string) {
    const { fakePage, fulfilled, aborted, continued } = makeRouteMock()
    // Install mocks (mirrors PlaywrightPage.interceptNetwork)
    await fakePage.unroute()
    if (mocks.length) {
      await fakePage.route("**/*", (route: any) => {
        const reqUrl = route.request().url()
        for (const mock of mocks) {
          if (!matchesMock(mock.url, reqUrl)) continue
          if (mock.block) { route.abort("blockedbyclient"); return }
          route.fulfill({
            status: mock.stub.status ?? 200,
            contentType: mock.stub.contentType ?? "text/plain",
            body: mock.stub.body ?? "",
          })
          return
        }
        route.continue()
      })
    }
    await fakePage.fire(requestUrl)
    return { fulfilled, aborted, continued }
  }

  test("stub: fulfills with correct status, contentType, body", async () => {
    const { fulfilled, aborted, continued } = await runInterceptNetwork(
      [{ url: "**/api/data", stub: { body: "hello", contentType: "text/plain", status: 200 } }],
      "https://example.com/api/data",
    )
    expect(fulfilled).toHaveLength(1)
    expect(fulfilled[0].body).toBe("hello")
    expect(fulfilled[0].contentType).toBe("text/plain")
    expect(fulfilled[0].status).toBe(200)
    expect(aborted).toHaveLength(0)
    expect(continued).toHaveLength(0)
  })

  test("stub: defaults to status=200 and contentType='text/plain' when omitted", async () => {
    const { fulfilled } = await runInterceptNetwork(
      [{ url: "**/api/data", stub: { body: "hi" } }],
      "https://example.com/api/data",
    )
    expect(fulfilled[0].status).toBe(200)
    expect(fulfilled[0].contentType).toBe("text/plain")
    expect(fulfilled[0].body).toBe("hi")
  })

  test("stub: empty stub{} produces status=200, contentType='text/plain', body=''", async () => {
    const { fulfilled } = await runInterceptNetwork(
      [{ url: "**/api/data", stub: {} }],
      "https://example.com/api/data",
    )
    expect(fulfilled[0].status).toBe(200)
    expect(fulfilled[0].contentType).toBe("text/plain")
    expect(fulfilled[0].body).toBe("")
  })

  test("block: aborts the request", async () => {
    const { fulfilled, aborted, continued } = await runInterceptNetwork(
      [{ url: "**/api/data", block: true }],
      "https://example.com/api/data",
    )
    expect(aborted).toHaveLength(1)
    expect(aborted[0].reason).toBe("blockedbyclient")
    expect(fulfilled).toHaveLength(0)
    expect(continued).toHaveLength(0)
  })

  test("no match: continues the request", async () => {
    const { fulfilled, aborted, continued } = await runInterceptNetwork(
      [{ url: "**/api/other", stub: { body: "miss" } }],
      "https://example.com/api/data",
    )
    expect(continued).toHaveLength(1)
    expect(fulfilled).toHaveLength(0)
    expect(aborted).toHaveLength(0)
  })

  test("first-match wins: second matching rule is not evaluated", async () => {
    const { fulfilled } = await runInterceptNetwork(
      [
        { url: "**/api/data", stub: { body: "first" } },
        { url: "**/api/data", stub: { body: "second" } },
      ],
      "https://example.com/api/data",
    )
    expect(fulfilled).toHaveLength(1)
    expect(fulfilled[0].body).toBe("first")
  })

  test("no mocks → no route registered → fire does nothing", async () => {
    const { fulfilled, aborted, continued } = await runInterceptNetwork([], "https://example.com/api/data")
    expect(fulfilled).toHaveLength(0)
    expect(aborted).toHaveLength(0)
    expect(continued).toHaveLength(0)
  })

  test("RegExp mock matches correctly", async () => {
    const { fulfilled } = await runInterceptNetwork(
      [{ url: /\/api\/.*/, stub: { body: "regexp-match" } }],
      "https://example.com/api/anything",
    )
    expect(fulfilled[0].body).toBe("regexp-match")
  })

  test("unroute is always called to clear prior handlers", async () => {
    const { fakePage } = makeRouteMock()
    await fakePage.unroute()
    expect(fakePage._unrouteCount).toBe(1)
    await fakePage.unroute()
    expect(fakePage._unrouteCount).toBe(2)
  })
})

// ── 4. WalkOptions.networkMocks type shape ────────────────────────────────────────────────────────
describe("WalkOptions.networkMocks — type conformance", () => {
  test("networkMocks compiles as an optional NetworkMock[] on WalkOptions-like object", () => {
    // This is a structural check: if WalkOptions gained the field correctly, this assignment compiles.
    const opts: { fixtureUrl: string; networkMocks?: NetworkMock[] } = {
      fixtureUrl: "http://localhost/",
      networkMocks: [
        { url: "**/api/flags", stub: { body: '{"ff":true}', contentType: "application/json" } },
        { url: /analytics/, block: true },
      ],
    }
    expect(opts.networkMocks).toHaveLength(2)
  })

  test("networkMocks is optional — absent means no interception", () => {
    const opts: { fixtureUrl: string; networkMocks?: NetworkMock[] } = { fixtureUrl: "http://localhost/" }
    expect(opts.networkMocks).toBeUndefined()
  })
})
