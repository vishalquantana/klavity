import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { applySchema, db, reconnectDb } from "./db"
import { autoTicketError, errorTicketSignature } from "./error-autoticket"

const RUN = `${Date.now()}_${Math.random().toString(16).slice(2)}`

const ENV_KEYS = [
  "KLAV_TICKETS_PLANE_KEY",
  "KLAV_ERROR_AUTOTICKET",
  "KLAV_TICKETS_PLANE_HOST",
  "KLAV_TICKETS_PLANE_WORKSPACE",
  "KLAV_TEST_ALLOW_LOOPBACK",
] as const

let origFetch: typeof globalThis.fetch
let origDateNow: typeof Date.now
let origEnv: Record<string, string | undefined>
let dbSeq = 0

function makePlaneFetch() {
  const calls: { url: string; init: RequestInit }[] = []
  const fetchSpy = mock(async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), init: init || {} })
    if (String(url).includes("/comments/")) {
      return new Response(JSON.stringify({ id: "comment-1" }), { status: 201 })
    }
    return new Response(JSON.stringify({ id: "issue-uuid-1", sequence_id: 101 }), { status: 201 })
  })
  globalThis.fetch = fetchSpy as any
  return { calls }
}

async function rows() {
  const r = await db!.execute("SELECT * FROM error_tickets ORDER BY first_seen ASC")
  return r.rows as any[]
}

beforeEach(async () => {
  origFetch = globalThis.fetch
  origDateNow = Date.now
  origEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]))
  for (const k of ENV_KEYS) delete process.env[k]
  process.env.KLAV_TICKETS_PLANE_KEY = "plane-token"
  process.env.KLAV_ERROR_AUTOTICKET = "1"
  process.env.KLAV_TICKETS_PLANE_HOST = "http://localhost:9999"
  process.env.KLAV_TICKETS_PLANE_WORKSPACE = "qbuilder"
  process.env.KLAV_TEST_ALLOW_LOOPBACK = "1"
  reconnectDb(`file:${join(tmpdir(), `klav-error-autoticket-${RUN}-${dbSeq++}.db`)}`)
  await applySchema(db!)
})

afterEach(() => {
  globalThis.fetch = origFetch
  Date.now = origDateNow
  for (const k of ENV_KEYS) {
    if (origEnv[k] !== undefined) process.env[k] = origEnv[k]!
    else delete process.env[k]
  }
})

describe("error auto-ticketing", () => {
  test("new signature creates one Plane ticket and persists it", async () => {
    const { calls } = makePlaneFetch()
    await autoTicketError({ where: "backend", message: "Database unavailable", route: "extract", status: 500 })

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toContain("/api/v1/workspaces/qbuilder/projects/05ea72ad/issues/")
    const body = JSON.parse(calls[0].init.body as string)
    expect(body.name).toContain("[backend] Database unavailable")

    const r = await rows()
    expect(r).toHaveLength(1)
    expect(Number(r[0].count)).toBe(1)
    expect(String(r[0].ticket_key)).toBe("101")
    expect(String(r[0].ticket_url)).toContain("/projects/05ea72ad/issues/issue-uuid-1")
  })

  test("repeat signature bumps count without duplicate Plane issue", async () => {
    const { calls } = makePlaneFetch()
    const info = { where: "backend" as const, message: "Duplicate failure", route: "extract" }

    await autoTicketError(info)
    await autoTicketError(info)

    const issueCalls = calls.filter((c) => c.url.endsWith("/issues/"))
    expect(issueCalls).toHaveLength(1)
    const r = await rows()
    expect(r).toHaveLength(1)
    expect(Number(r[0].count)).toBe(2)
  })

  test("repeat after an hour adds a seen-again comment without duplicating the issue", async () => {
    const { calls } = makePlaneFetch()
    const info = { where: "backend" as const, message: "Hourly duplicate", route: "extract" }

    Date.now = () => 1_000
    await autoTicketError(info)
    Date.now = () => 1_000 + 60 * 60 * 1000 + 1
    await autoTicketError(info)

    expect(calls.filter((c) => c.url.endsWith("/issues/"))).toHaveLength(1)
    const commentCalls = calls.filter((c) => c.url.includes("/comments/"))
    expect(commentCalls).toHaveLength(1)
    const commentBody = JSON.parse(commentCalls[0].init.body as string)
    expect(commentBody.comment_html).toContain("Count: 2")
  })

  test("normalization collapses near-identical errors", async () => {
    const { calls } = makePlaneFetch()
    await autoTicketError({
      where: "frontend",
      message: "User 123 failed loading order 550e8400-e29b-41d4-a716-446655440000 at 2026-07-11T10:11:12Z",
      route: "https://app.example/orders/123",
      stack: "Error: x\n    at loadOrder (/app/orders.ts:44:12)",
    })
    await autoTicketError({
      where: "frontend",
      message: "User 456 failed loading order d9428888-122b-11e1-b85c-61cd3cbb3210 at 2026-07-12T10:11:12Z",
      route: "https://app.example/orders/456",
      stack: "Error: x\n    at loadOrder (/app/orders.ts:88:20)",
    })

    expect(calls.filter((c) => c.url.endsWith("/issues/"))).toHaveLength(1)
    const r = await rows()
    expect(r).toHaveLength(1)
    expect(Number(r[0].count)).toBe(2)
  })

  test("no-ops when flag is off", async () => {
    const { calls } = makePlaneFetch()
    delete process.env.KLAV_ERROR_AUTOTICKET

    await autoTicketError({ where: "backend", message: "flag off", route: "extract" })

    expect(calls).toHaveLength(0)
    expect(await rows()).toHaveLength(0)
  })

  test("never throws when Plane filing fails", async () => {
    globalThis.fetch = mock(async () => { throw new Error("network down") }) as any

    await expect(autoTicketError({ where: "backend", message: "boom", route: "extract" })).resolves.toBeUndefined()
    expect(await rows()).toHaveLength(0)
  })

  test("signature uses normalized message, origin, route, and top stack frame", () => {
    const a = errorTicketSignature({
      where: "backend",
      message: "item 123 failed",
      route: "/api/items/123",
      stack: "Error: x\n    at handler (/srv/app.ts:10:2)\n    at next (/srv/other.ts:1:1)",
    })
    const b = errorTicketSignature({
      where: "backend",
      message: "item 456 failed",
      route: "/api/items/456",
      stack: "Error: x\n    at handler (/srv/app.ts:99:8)\n    at different (/srv/other.ts:1:1)",
    })
    const c = errorTicketSignature({
      where: "frontend",
      message: "item 456 failed",
      route: "/api/items/456",
      stack: "Error: x\n    at handler (/srv/app.ts:99:8)",
    })
    expect(a).toBe(b)
    expect(a).not.toBe(c)
  })
})
