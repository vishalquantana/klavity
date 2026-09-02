// Public agent/API docs — spec shape, drift guard, and unauthenticated-serving smoke test.
// Guards two regressions: (1) the OpenAPI spec silently drifting from the real /api/v1 routes,
// (2) the public docs routes accidentally landing BELOW the session wall (→ 302 to /login
// instead of 200), which would break agent bootstrap.

import { test, expect, beforeAll, afterAll } from "bun:test"
import { readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import * as net from "node:net"
import { buildOpenApiSpec, V1_PATHS } from "./lib/openapi"

const SERVER_SRC = readFileSync(join(import.meta.dir, "server.ts"), "utf8")

test("openapi: valid 3.1 shape + servers url honored", () => {
  const spec = buildOpenApiSpec("https://example.test") as any
  expect(spec.openapi).toBe("3.1.0")
  expect(spec.info.title).toBe("Klavity AutoSim API")
  expect(spec.servers[0].url).toBe("https://example.test")
  expect(spec.components.securitySchemes.kciBearer.scheme).toBe("bearer")
  expect(spec.security[0].kciBearer).toBeDefined()
})

test("openapi: documented paths exactly match V1_PATHS", () => {
  const spec = buildOpenApiSpec() as any
  expect(Object.keys(spec.paths).sort()).toEqual([...V1_PATHS].sort())
})

test("openapi: every documented path+method is a real registered route (drift guard)", () => {
  // Each documented path must have a matching route anchor in server.ts. If a route is renamed
  // or removed without updating the spec, this fails.
  const anchors: Record<string, RegExp> = {
    "/api/v1/authored-runs": /path === "\/api\/v1\/authored-runs"/,
    "/api/v1/authored-runs/{id}": /\^\\\/api\\\/v1\\\/authored-runs\\\/\(\[\^\/\]\+\)\(\\\/cancel\)\?\$/,
    "/api/v1/authored-runs/{id}/cancel": /\^\\\/api\\\/v1\\\/authored-runs\\\/\(\[\^\/\]\+\)\(\\\/cancel\)\?\$/,
    "/api/v1/runs": /path === "\/api\/v1\/runs"/,
    "/api/v1/runs/{id}": /\^\\\/api\\\/v1\\\/runs\\\/\(\[\^\/\]\+\)\$/,
    "/api/v1/runs/{id}/report": /\^\\\/api\\\/v1\\\/runs\\\/\(\[\^\/\]\+\)\\\/report\$/,
    "/api/v1/runs/{id}/cancel": /\^\\\/api\\\/v1\\\/runs\\\/\(\[\^\/\]\+\)\\\/cancel\$/,
    "/api/v1/tickets": /path === "\/api\/v1\/tickets"/,
    "/api/v1/tickets/{id}": /\^\\\/api\\\/v1\\\/tickets\\\/\(\[\^\/\]\+\)\$/,
    "/api/v1/tickets/{id}/comments": /\^\\\/api\\\/v1\\\/tickets\\\/\(\[\^\/\]\+\)\\\/comments\$/,
    "/api/v1/tickets/{id}/activity": /\^\\\/api\\\/v1\\\/tickets\\\/\(\[\^\/\]\+\)\\\/activity\$/,
    "/api/v1/tickets/{id}/replay": /\^\\\/api\\\/v1\\\/tickets\\\/\(\[\^\/\]\+\)\\\/replay\$/,
  }
  for (const p of V1_PATHS) {
    expect(anchors[p], `no drift anchor defined for ${p}`).toBeDefined()
    expect(anchors[p].test(SERVER_SRC), `route for ${p} not found in server.ts`).toBe(true)
  }
})

test("public docs routes are registered ABOVE the session wall", () => {
  // The wall is `const me = await sessionEmail(req)`. Every public doc route must appear before it.
  const wallIdx = SERVER_SRC.indexOf("const me = await sessionEmail(req)")
  expect(wallIdx).toBeGreaterThan(0)
  for (const route of ['path === "/llms.txt"', 'path === "/llms-full.txt"', 'path === "/openapi.json"', '/docs/mcp.md']) {
    const idx = SERVER_SRC.indexOf(route)
    expect(idx, `${route} not registered`).toBeGreaterThan(0)
    expect(idx, `${route} must be above the session wall`).toBeLessThan(wallIdx)
  }
})

// ── Boot smoke test: the routes actually serve 200 unauthenticated (not 302 to login). ──
function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = net.createServer()
    s.on("error", rej)
    s.listen(0, "127.0.0.1", () => { const p = (s.address() as any).port; s.close(() => res(p)) })
  })
}

let proc: ReturnType<typeof Bun.spawn> | null = null
let BASE = ""

beforeAll(async () => {
  const port = await freePort()
  BASE = `http://localhost:${port}`
  const dbFile = join(tmpdir(), `openapi-test-${Date.now()}.db`)
  proc = Bun.spawn(["bun", "run", "server.ts"], {
    cwd: import.meta.dir,
    env: {
      ...process.env,
      PORT: String(port),
      TURSO_DATABASE_URL: "file:" + dbFile,
      TURSO_AUTH_TOKEN: "",
      KLAV_SECRET: "test-secret-openapi",
      KLAV_BASE_URL: BASE,
      SENDGRID_API_KEY: "",
      OPENROUTER_API_KEY: "test-key",
    },
    stdout: "pipe",
    stderr: "pipe",
  })
  const deadline = Date.now() + 15_000
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`${BASE}/api/version`)
      if (r.ok) break
    } catch {}
    await new Promise((r) => setTimeout(r, 200))
  }
})

afterAll(() => { try { proc?.kill() } catch {} })

test("GET /llms.txt → 200 text/plain, unauthenticated (no login redirect)", async () => {
  const r = await fetch(`${BASE}/llms.txt`, { redirect: "manual" })
  expect(r.status).toBe(200)
  expect(r.headers.get("content-type") || "").toContain("text/plain")
  const body = await r.text()
  expect(body).toContain("Klavity AutoSim API")
  expect(body).toContain("/llms-full.txt")
})

test("GET /openapi.json → 200 application/json with v1 paths", async () => {
  const r = await fetch(`${BASE}/openapi.json`, { redirect: "manual" })
  expect(r.status).toBe(200)
  expect(r.headers.get("content-type") || "").toContain("application/json")
  const spec = await r.json()
  expect(spec.openapi).toBe("3.1.0")
  expect(Object.keys(spec.paths).sort()).toEqual([...V1_PATHS].sort())
  // servers url reflects the request origin
  expect(spec.servers[0].url).toBe(BASE)
})

test("GET /docs/mcp.md → 200 markdown, unauthenticated", async () => {
  const r = await fetch(`${BASE}/docs/mcp.md`, { redirect: "manual" })
  expect(r.status).toBe(200)
  expect(r.headers.get("content-type") || "").toContain("text/markdown")
  expect(await r.text()).toContain("MCP server")
})

test("GET /llms-full.txt → 200 and includes CI/CD templates", async () => {
  const r = await fetch(`${BASE}/llms-full.txt`, { redirect: "manual" })
  expect(r.status).toBe(200)
  const body = await r.text()
  expect(body).toContain("GitHub Actions")
  expect(body).toContain("GitLab CI")
})
