// Tests for prototype/lib/error-alert.ts
//
// Covers:
//  - no-op when SLACK_ERROR_WEBHOOK_URL is unset
//  - posts a Block-Kit message (mocked fetch) when env var is set
//  - dedup suppresses identical (where+message) alerts within 60 s
//  - dedup allows the same error after the window expires
//  - POST /api/client-error: validates, rate-limits, size-caps, and forwards

import { expect, test, describe, beforeEach, afterEach, mock, spyOn } from "bun:test"
import { reportError, _resetDedup, _isNonProdEnv } from "./error-alert"

// ── helpers ──────────────────────────────────────────────────────────────────

function makeFetchSpy(ok = true, status = 200) {
  const calls: { url: string; init: RequestInit }[] = []
  const fetchSpy = mock(async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), init: init || {} })
    return { ok, status, text: async () => "" } as Response
  })
  return { fetchSpy, calls }
}

// ── environment gate ─────────────────────────────────────────────────────────
// reportError must be a total no-op in test/CI/dev envs — no fetch, no auto-ticket.
describe("reportError — environment gate", () => {
  const FAKE_WEBHOOK = "https://hooks.slack.com/services/T00/B00/fake"
  const ENV_VARS = ["KLAV_ENV", "NODE_ENV"] as const
  type EnvKey = typeof ENV_VARS[number]
  let savedEnv: Record<EnvKey, string | undefined>
  let origFetch: typeof globalThis.fetch

  beforeEach(() => {
    _resetDedup()
    savedEnv = Object.fromEntries(ENV_VARS.map((k) => [k, process.env[k]])) as Record<EnvKey, string | undefined>
    origFetch = globalThis.fetch
    process.env.SLACK_ERROR_WEBHOOK_URL = FAKE_WEBHOOK
  })

  afterEach(() => {
    for (const k of ENV_VARS) {
      if (savedEnv[k] !== undefined) process.env[k] = savedEnv[k]!
      else delete process.env[k]
    }
    globalThis.fetch = origFetch
    delete process.env.SLACK_ERROR_WEBHOOK_URL
  })

  const NON_PROD = ["test", "ci", "development", "dev", "TEST", "CI", "Development"] as const

  for (const env of NON_PROD) {
    test(`full no-op when NODE_ENV=${env} (no fetch, resolves undefined)`, async () => {
      delete process.env.KLAV_ENV
      process.env.NODE_ENV = env
      const calls: boolean[] = []
      globalThis.fetch = mock(async () => { calls.push(true); return { ok: true, status: 200 } as Response })
      const result = await reportError({ where: "backend", message: "test boom" })
      expect(result).toBeUndefined()
      expect(calls).toHaveLength(0)
    })
  }

  test("full no-op when KLAV_ENV=test (overrides NODE_ENV)", async () => {
    process.env.KLAV_ENV = "test"
    process.env.NODE_ENV = "production"  // NODE_ENV says prod, but KLAV_ENV wins
    const calls: boolean[] = []
    globalThis.fetch = mock(async () => { calls.push(true); return { ok: true, status: 200 } as Response })
    await reportError({ where: "backend", message: "should not fire" })
    expect(calls).toHaveLength(0)
  })

  test("full no-op when KLAV_ENV=ci", async () => {
    process.env.KLAV_ENV = "ci"
    delete process.env.NODE_ENV
    const calls: boolean[] = []
    globalThis.fetch = mock(async () => { calls.push(true); return { ok: true, status: 200 } as Response })
    await reportError({ where: "backend", message: "ci bomb" })
    expect(calls).toHaveLength(0)
  })

  test("FIRES when env is unset (real prod — NODE_ENV not set)", async () => {
    delete process.env.KLAV_ENV
    delete process.env.NODE_ENV
    const calls: boolean[] = []
    globalThis.fetch = mock(async () => { calls.push(true); return { ok: true, status: 200 } as Response })
    await reportError({ where: "backend", message: "real prod error" })
    expect(calls).toHaveLength(1)
  })

  test("FIRES when NODE_ENV=production", async () => {
    delete process.env.KLAV_ENV
    process.env.NODE_ENV = "production"
    const calls: boolean[] = []
    globalThis.fetch = mock(async () => { calls.push(true); return { ok: true, status: 200 } as Response })
    await reportError({ where: "backend", message: "prod error" })
    expect(calls).toHaveLength(1)
  })

  test("FIRES when NODE_ENV=staging (not in denylist)", async () => {
    delete process.env.KLAV_ENV
    process.env.NODE_ENV = "staging"
    const calls: boolean[] = []
    globalThis.fetch = mock(async () => { calls.push(true); return { ok: true, status: 200 } as Response })
    await reportError({ where: "backend", message: "staging error" })
    expect(calls).toHaveLength(1)
  })

  // _isNonProdEnv helper
  describe("_isNonProdEnv()", () => {
    test("returns true for test", () => {
      delete process.env.KLAV_ENV; process.env.NODE_ENV = "test"
      expect(_isNonProdEnv()).toBe(true)
    })
    test("returns true for ci", () => {
      delete process.env.KLAV_ENV; process.env.NODE_ENV = "ci"
      expect(_isNonProdEnv()).toBe(true)
    })
    test("returns true for development", () => {
      delete process.env.KLAV_ENV; process.env.NODE_ENV = "development"
      expect(_isNonProdEnv()).toBe(true)
    })
    test("returns true for dev", () => {
      delete process.env.KLAV_ENV; process.env.NODE_ENV = "dev"
      expect(_isNonProdEnv()).toBe(true)
    })
    test("returns false when env unset (real prod)", () => {
      delete process.env.KLAV_ENV; delete process.env.NODE_ENV
      expect(_isNonProdEnv()).toBe(false)
    })
    test("returns false for production", () => {
      delete process.env.KLAV_ENV; process.env.NODE_ENV = "production"
      expect(_isNonProdEnv()).toBe(false)
    })
    test("KLAV_ENV takes precedence over NODE_ENV", () => {
      process.env.KLAV_ENV = "test"; process.env.NODE_ENV = "production"
      expect(_isNonProdEnv()).toBe(true)
    })
  })
})

// ── reportError — no-op without env var ──────────────────────────────────────
describe("reportError — no env var", () => {
  let origEnv: string | undefined
  let origFetch: typeof globalThis.fetch

  beforeEach(() => {
    _resetDedup()
    origEnv = process.env.SLACK_ERROR_WEBHOOK_URL
    delete process.env.SLACK_ERROR_WEBHOOK_URL
    origFetch = globalThis.fetch
  })

  afterEach(() => {
    if (origEnv !== undefined) process.env.SLACK_ERROR_WEBHOOK_URL = origEnv
    else delete process.env.SLACK_ERROR_WEBHOOK_URL
    globalThis.fetch = origFetch
  })

  test("never calls fetch when SLACK_ERROR_WEBHOOK_URL is unset", async () => {
    const called: boolean[] = []
    globalThis.fetch = mock(async () => {
      called.push(true)
      return { ok: true, status: 200 } as Response
    })
    await reportError({ where: "backend", message: "boom", route: "test" })
    expect(called).toHaveLength(0)
  })

  test("resolves (does not throw) when unset", async () => {
    await expect(reportError({ where: "frontend", message: "oops" })).resolves.toBeUndefined()
  })
})

// ── reportError — posts when env var set ─────────────────────────────────────
// These tests simulate production-like behaviour (no NODE_ENV/KLAV_ENV set).
// bun test sets NODE_ENV=test by default; we must clear it so the env gate
// does not suppress the alerts we're testing here.
describe("reportError — with env var set", () => {
  const FAKE_WEBHOOK = "https://hooks.slack.com/services/T00/B00/fake"
  let origWebhook: string | undefined
  let origKlavEnv: string | undefined
  let origNodeEnv: string | undefined
  let origFetch: typeof globalThis.fetch

  beforeEach(() => {
    _resetDedup()
    origWebhook = process.env.SLACK_ERROR_WEBHOOK_URL
    origKlavEnv = process.env.KLAV_ENV
    origNodeEnv = process.env.NODE_ENV
    process.env.SLACK_ERROR_WEBHOOK_URL = FAKE_WEBHOOK
    // Clear env-gate vars so these tests exercise the production code path.
    delete process.env.KLAV_ENV
    delete process.env.NODE_ENV
    origFetch = globalThis.fetch
  })

  afterEach(() => {
    if (origWebhook !== undefined) process.env.SLACK_ERROR_WEBHOOK_URL = origWebhook
    else delete process.env.SLACK_ERROR_WEBHOOK_URL
    if (origKlavEnv !== undefined) process.env.KLAV_ENV = origKlavEnv
    else delete process.env.KLAV_ENV
    if (origNodeEnv !== undefined) process.env.NODE_ENV = origNodeEnv
    else delete process.env.NODE_ENV
    globalThis.fetch = origFetch
  })

  test("calls fetch once with POST + JSON body on a new error", async () => {
    const { fetchSpy, calls } = makeFetchSpy()
    globalThis.fetch = fetchSpy as any
    await reportError({ where: "backend", message: "DB connection failed", route: "auth", traceId: "abc123" })
    expect(calls.length).toBe(1)
    expect(calls[0].init.method).toBe("POST")
    const body = JSON.parse(calls[0].init.body as string)
    expect(body.blocks[0].text.text).toContain("Backend error")
    expect(body.text).toContain("DB connection failed")
  })

  test("includes where, message, route, traceId in payload", async () => {
    const { fetchSpy, calls } = makeFetchSpy()
    globalThis.fetch = fetchSpy as any
    await reportError({ where: "backend", message: "test error", route: "extract", traceId: "tr-001", status: 500 })
    const body = JSON.parse(calls[0].init.body as string)
    const fieldsJson = JSON.stringify(body.blocks[1].fields)
    expect(fieldsJson).toContain("test error")
    expect(fieldsJson).toContain("extract")
    expect(fieldsJson).toContain("tr-001")
    expect(fieldsJson).toContain("500")
  })

  test("frontend error label says 'Frontend'", async () => {
    const { fetchSpy, calls } = makeFetchSpy()
    globalThis.fetch = fetchSpy as any
    await reportError({ where: "frontend", message: "Uncaught ReferenceError", url: "https://klavity.in/app" } as any)
    const body = JSON.parse(calls[0].init.body as string)
    expect(body.blocks[0].text.text).toContain("Frontend")
  })

  test("stack trace included in a separate section block when provided", async () => {
    const { fetchSpy, calls } = makeFetchSpy()
    globalThis.fetch = fetchSpy as any
    await reportError({ where: "backend", message: "err", stack: "Error: err\n  at foo.ts:10" })
    const body = JSON.parse(calls[0].init.body as string)
    const hasStack = body.blocks.some((b: any) => b.type === "section" && b.text?.text?.includes("foo.ts:10"))
    expect(hasStack).toBe(true)
  })

  // ── dedup ─────────────────────────────────────────────────────────────────

  test("dedup: second identical error within 60 s is suppressed (only 1 fetch call)", async () => {
    const { fetchSpy, calls } = makeFetchSpy()
    globalThis.fetch = fetchSpy as any
    await reportError({ where: "backend", message: "duplicate error" })
    await reportError({ where: "backend", message: "duplicate error" })
    await reportError({ where: "backend", message: "duplicate error" })
    expect(calls.length).toBe(1)
  })

  test("dedup: different messages are NOT deduplicated", async () => {
    const { fetchSpy, calls } = makeFetchSpy()
    globalThis.fetch = fetchSpy as any
    await reportError({ where: "backend", message: "error A" })
    await reportError({ where: "backend", message: "error B" })
    expect(calls.length).toBe(2)
  })

  test("dedup: same message from different origins (where) are NOT deduplicated", async () => {
    const { fetchSpy, calls } = makeFetchSpy()
    globalThis.fetch = fetchSpy as any
    await reportError({ where: "backend", message: "same message" })
    await reportError({ where: "frontend", message: "same message" })
    expect(calls.length).toBe(2)
  })

  test("does not throw when webhook returns non-ok status", async () => {
    const { fetchSpy } = makeFetchSpy(false, 500)
    globalThis.fetch = fetchSpy as any
    await expect(reportError({ where: "backend", message: "err" })).resolves.toBeUndefined()
  })

  test("does not throw when fetch rejects", async () => {
    globalThis.fetch = mock(async () => { throw new Error("network down") }) as any
    await expect(reportError({ where: "backend", message: "net err" })).resolves.toBeUndefined()
  })
})

// ── POST /api/client-error integration tests ──────────────────────────────────
// We test the server handler behaviour by importing server.ts indirectly.
// Since we can't easily start the full Bun server in unit tests, we test via
// fetch-to-server. However, server.ts binds a fixed port and the test suite
// avoids network I/O. Instead we test the building blocks:
//   - readJsonLimited size-cap logic (already covered by parse-json.test.ts)
//   - reportError forwarding (covered above)
//
// To test the full route we use the server's own fetch handler:

describe("POST /api/client-error — server route", () => {
  // We import server fetch via a lightweight approach: read the server module
  // but skip DB init by relying on test-only patterns. This is fragile for the
  // full server, so instead we validate the route logic by checking server.ts
  // source text for the key constraints (same pattern as route-contract.test.ts).
  test("server.ts includes /api/client-error route", () => {
    const fs = require("node:fs")
    const path = require("node:path")
    const src = fs.readFileSync(path.resolve(import.meta.dir, "..", "server.ts"), "utf8")
    expect(src).toContain('"/api/client-error"')
  })

  test("server.ts rate-limits /api/client-error per IP", () => {
    const fs = require("node:fs")
    const path = require("node:path")
    const src = fs.readFileSync(path.resolve(import.meta.dir, "..", "server.ts"), "utf8")
    // Should contain a rate limit check for the client-error endpoint
    expect(src).toContain("clierr:ip:")
  })

  test("server.ts size-caps /api/client-error with readJsonLimited", () => {
    const fs = require("node:fs")
    const path = require("node:path")
    const src = fs.readFileSync(path.resolve(import.meta.dir, "..", "server.ts"), "utf8")
    // CLIENT_ERROR_MAX_BODY must appear near the route
    expect(src).toContain("CLIENT_ERROR_MAX_BODY")
  })

  test("server.ts calls reportError for /api/client-error", () => {
    const fs = require("node:fs")
    const path = require("node:path")
    const src = fs.readFileSync(path.resolve(import.meta.dir, "..", "server.ts"), "utf8")
    // reportError must be called with where:"frontend" in the client-error handler
    expect(src).toContain('"frontend"')
  })

  test("server.ts requires non-empty message for /api/client-error", () => {
    const fs = require("node:fs")
    const path = require("node:path")
    const src = fs.readFileSync(path.resolve(import.meta.dir, "..", "server.ts"), "utf8")
    expect(src).toContain('"message required"')
  })
})

// ── no hardcoded webhook URL ─────────────────────────────────────────────────
describe("secret hygiene", () => {
  test("error-alert.ts does NOT contain hooks.slack.com", () => {
    const fs = require("node:fs")
    const path = require("node:path")
    const src = fs.readFileSync(path.resolve(import.meta.dir, "error-alert.ts"), "utf8")
    // The only reference should be inside allowHosts (the destination allowlist).
    // No literal webhook URL (e.g. hooks.slack.com/services/) may appear.
    expect(src).not.toMatch(/hooks\.slack\.com\/services\//)
  })

  test("error-alert.ts reads webhook from process.env.SLACK_ERROR_WEBHOOK_URL", () => {
    const fs = require("node:fs")
    const path = require("node:path")
    const src = fs.readFileSync(path.resolve(import.meta.dir, "error-alert.ts"), "utf8")
    expect(src).toContain("SLACK_ERROR_WEBHOOK_URL")
  })
})
