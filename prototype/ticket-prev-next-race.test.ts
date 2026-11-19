// Bug: Next/Previous on the ticket page lagged and re-opened the CURRENT ticket. openSingleTicket(A) renders
// from cache then re-renders when /api/feedback/A returns; stepping to B before that returned let A's late
// response re-render A over B (and push A's URL). Each open now owns a sequence number + aborts the
// previous fetch, and a stale response never re-renders.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")
const start = html.indexOf("async function openSingleTicket(id, mode, context) {")
const body = html.slice(start, html.indexOf("\n          }\n", start))

test("each open gets a sequence number and aborts the previous open's fetch", () => {
  expect(html).toContain("let _tktOpenSeq = 0, _tktOpenAbort = null")
  expect(body).toContain("const mySeq = ++_tktOpenSeq")
  expect(body).toContain("_tktOpenAbort.abort()")
  expect(body).toContain('fetch("/api/feedback/" + encodeURIComponent(id), ctrl ? { signal: ctrl.signal } : undefined)')
})

test("a stale response never re-renders: the guard runs before the re-render", () => {
  const guard = body.indexOf("if (mySeq !== _tktOpenSeq) return")
  const rerender = body.indexOf("tktRenderReusing(() => _renderSingleTicket(id))")
  expect(guard).toBeGreaterThan(-1)
  expect(rerender).toBeGreaterThan(guard)
  // ...but the fresh data is still merged into the cache first (so the next visit shows it)
  expect(body.indexOf("state.tickets[ix] = { ...state.tickets[ix], ...fresh }")).toBeLessThan(guard)
})

test("simulated: open A, then B before A's fetch resolves → only B is re-rendered", async () => {
  // Re-run the same guard logic the page uses, with controllable fetch timing.
  let seq = 0; const rendered: string[] = []
  const resolvers: Record<string, () => void> = {}
  async function open(id: string) {
    const mySeq = ++seq
    rendered.push("cache:" + id)
    await new Promise<void>(r => { resolvers[id] = r })
    if (mySeq !== seq) return
    rendered.push("fresh:" + id)
  }
  const a = open("A"), b = open("B")
  resolvers.B(); await b
  resolvers.A(); await a                       // A's late response
  expect(rendered).toEqual(["cache:A", "cache:B", "fresh:B"])
})
