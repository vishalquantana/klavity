// Bug: Sim Reports loaded slowly from the sidebar. renderTriage() awaited /connectors BEFORE even painting the
// cached reports, then fetched the reports, then the sim matches — three server round-trips in a row. They now
// start together, and the routing-dependent row affordances repaint once the connector info arrives.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i + sig.length - 1), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}

function deferred<T = void>() { let resolve!: (v: T) => void; const p = new Promise<T>((r) => { resolve = r }); return { p, resolve } }
const tick = () => new Promise((r) => setTimeout(r, 0))

function harness() {
  const log: string[] = []
  const connectors = deferred(), reports = deferred<any>(), matches = deferred()
  const state: any = {}
  const env = {
    curProjId: () => "p1",
    state,
    ensureSnapRoutingLoaded: () => { log.push("connectors:start"); return connectors.p.then(() => { state._snapRouting = "review"; state._connectors = [{ id: "c1" }] }) },
    renderSimMatches: () => { log.push("matches:start"); return matches.p },
    swrSection: async (_k: string, fetcher: () => Promise<any>, apply: (d: any) => void) => { log.push("reports:start"); const d = await fetcher(); apply(d) },
    safeFetch: () => reports.p,
    renderTriageView: () => log.push("paint"),
    openReportOutsideInbox: () => { },
    document: { body: { getAttribute: () => "triage" } },
    window: {} as any,
    location: {} as any,
  }
  const src = `let _triageItems = []; let _triagePaintedPid = null; ${extractFn(HTML, "async function renderTriage(")}; return renderTriage`
  const renderTriage = new Function(...Object.keys(env), src)(...Object.values(env))
  return { log, connectors, reports, matches, state, renderTriage }
}
const ok = (body: any) => ({ ok: true, status: 200, json: async () => body })

test("connectors, reports and sim matches all start immediately (no waiting on /connectors)", async () => {
  const h = harness()
  const done = h.renderTriage()
  await tick()
  expect(h.log).toEqual(["connectors:start", "matches:start", "reports:start"])
  h.reports.resolve(ok({ triage: [{ id: "r1" }] }))
  await tick()
  expect(h.log).toContain("paint") // reports painted while /connectors is STILL pending
  h.connectors.resolve(); h.matches.resolve()
  await done
})

test("when the connector info lands after the list, the rows repaint once with the right routing", async () => {
  const h = harness()
  const done = h.renderTriage()
  h.reports.resolve(ok({ triage: [] }))
  await tick()
  const paintsBefore = h.log.filter((x) => x === "paint").length
  h.connectors.resolve(); h.matches.resolve()
  await done; await tick()
  expect(h.log.filter((x) => x === "paint").length).toBe(paintsBefore + 1)
})

test("an early connector answer never paints the empty placeholder list before the reports arrive", async () => {
  const h = harness()
  const done = h.renderTriage()
  h.connectors.resolve()
  await tick(); await tick()
  expect(h.log).not.toContain("paint")
  h.reports.resolve(ok({ triage: [{ id: "r1" }] })); h.matches.resolve()
  await done
  expect(h.log.filter((x) => x === "paint").length).toBe(1)
})

test("concurrent callers share one /connectors request", () => {
  const fn = extractFn(HTML, "function ensureSnapRoutingLoaded(")
  expect(fn).toContain("if (!_snapRoutingInflight) _snapRoutingInflight = _loadSnapRouting()")
})
