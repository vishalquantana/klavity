// Bug: a bulk label add on the Tickets page didn't show on the tickets until a later refresh — the label path
// waited for the server and then repainted from local data (board) / cached rows (list) that never got the label.
// Now the label is applied locally + repainted at once, the PATCH runs after, and failures are reverted.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")
const fnSrc = (name: string) => {
  const s = html.indexOf(`function ${name}(`)
  return html.slice(s, html.indexOf("\n          }\n", s) + "\n          }".length)
}

// Run the page's own bulkLabelsLocal against fake board/list/cache data.
function harness() {
  const cache = new Map<string, any>()
  const env: any = {
    state: { _labels: [{ id: "lb1", name: "QA", color: "#f00" }], tickets: [{ id: "t1", labels: [] }, { id: "t3", labels: [] }] },
    _tktBoardTickets: [{ id: "t1", labels: [] }, { id: "t2", labels: [{ id: "lb1", name: "QA", color: "#f00" }] }, { id: "t3", labels: [] }],
    _tktListState: { lastRows: [{ id: "t1", labels: [] }, { id: "t2", labels: [] }] },
    tktListCacheKey: (p: string) => "k:" + p,
    swrRead: (k: string) => cache.get(k) ?? null,
    swrWrite: (k: string, d: any) => cache.set(k, JSON.parse(JSON.stringify(d))),
    swrInvalidate: (k: string) => cache.delete(k),
  }
  cache.set("k:p1", { tickets: [{ id: "t1", labels: [] }, { id: "t2", labels: [] }] })
  const fn = new Function(...Object.keys(env), `${fnSrc("bulkLabelsLocal")}; return bulkLabelsLocal`)(...Object.values(env))
  return { env, cache, fn }
}
const has = (t: any) => t.labels.some((l: any) => l.id === "lb1")

test("add: label lands on every selected ticket in board data, state, list rows and the list cache — no duplicates", () => {
  const { env, cache, fn } = harness()
  const revert = fn({ addLabelId: "lb1" }, ["t1", "t2"], "p1")
  expect(revert).toBeTypeOf("function")
  expect(env._tktBoardTickets.map(has)).toEqual([true, true, false])
  expect(env._tktBoardTickets[1].labels.length).toBe(1)              // already had it → not added twice
  expect(env.state.tickets.map(has)).toEqual([true, false])
  expect(env._tktListState.lastRows.map(has)).toEqual([true, true])
  expect(cache.get("k:p1").tickets.map(has)).toEqual([true, true])
  expect(env._tktBoardTickets[0].labels[0]).toEqual({ id: "lb1", name: "QA", color: "#f00" })
})

test("remove + revert (all, or only the failed tickets)", () => {
  const { env, cache, fn } = harness()
  const revert = fn({ removeLabelId: "lb1" }, ["t2"], "p1")
  expect(has(env._tktBoardTickets[1])).toBe(false)
  revert()
  expect(has(env._tktBoardTickets[1])).toBe(true)
  expect(cache.has("k:p1")).toBe(false)                              // optimistic cache dropped → server truth next

  const h2 = harness()
  const rv = h2.fn({ addLabelId: "lb1" }, ["t1", "t3"], "p1")
  rv(new Set(["t3"]))                                                // t3 failed server-side
  expect(h2.env._tktBoardTickets.map(has)).toEqual([true, true, false])
})

test("unknown label → null (falls back to the blocking path)", () => {
  expect(harness().fn({ addLabelId: "nope" }, ["t1"], "p1")).toBeNull()
})

test("applyBulkAction applies label ops locally + repaints BEFORE the PATCH, and reverts on failure", () => {
  const body = fnSrc("applyBulkAction")
  const local = body.indexOf("const revert = bulkLabelsLocal(body, ids, projId)")
  const paint = body.indexOf("rerenderTktViewsLocal()", local)
  const patch = body.indexOf('method: "PATCH"', local)
  expect(local).toBeGreaterThan(-1)
  expect(paint).toBeGreaterThan(local)
  expect(patch).toBeGreaterThan(paint)
  expect(body).toContain("revert(); rerenderTktViewsLocal()")
  expect(body).toContain("revert(new Set(failures.map(f => String(f.ticketId)))); rerenderTktViewsLocal()")
  expect(html).toContain("_tktListState.lastRows = tickets; _tktListState.lastTotal = total")
})
