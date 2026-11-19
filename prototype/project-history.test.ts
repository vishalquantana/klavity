// KD-3089 — browser Back works normally inside a project (dashboard views, pages, tickets) before AND after a project
// switch, but never crosses back into the project the user switched away from.
//   • /project-history.js (first in <head>): the tab's selected project = the latest NORMAL page load's project; a page
//     reached through Back/Forward (or a bfcache restore) that belongs to another project steps forward again.
//   • dashboard setView(): a user view change pushes a history entry; popstate restores the view.
//   • /api/dashboard is no-store so a history load always re-fetches (and re-sets klav_proj).
import { expect, test, beforeEach } from "bun:test"

const read = (f: string) => Bun.file(import.meta.dir + "/" + f).text()
const SCRIPT = await read("public/project-history.js")
const DASH = await read("public/dashboard.html")
const SERVER = await read("server.ts")
const PAGES = ["dashboard.html", "index.html", "sim-runs.html", "trails.html", "autosims-walks.html", "autosims-walk.html", "sim-profile.html"]

// ── run the real script against a fake browser ───────────────────────────────────────────────────
type Env = { href: string; navType: string; store: Record<string, string>; meta?: string | null; forwards: number; hidden: boolean; domReady?: () => void; pageshow?: (e: any) => void }
function run(env: Env) {
  const win: any = {}
  const location = { get href() { return env.href }, get search() { return new URL(env.href).search } }
  const history = { forward: () => { env.forwards++ } }
  const sessionStorage = { getItem: (k: string) => env.store[k] ?? null, setItem: (k: string, v: string) => { env.store[k] = v } }
  const performance = { getEntriesByType: () => [{ type: env.navType }] }
  const document = {
    documentElement: { style: { set visibility(v: string) { env.hidden = v === "hidden" }, get visibility() { return env.hidden ? "hidden" : "" } } },
    querySelector: () => (env.meta ? { getAttribute: () => env.meta } : null),
    addEventListener: (ev: string, fn: any) => { if (ev === "DOMContentLoaded") env.domReady = fn },
  }
  const addEventListener = (ev: string, fn: any) => { if (ev === "pageshow") env.pageshow = fn }
  const setTimeout = () => 0
  new Function("window", "location", "history", "sessionStorage", "performance", "document", "addEventListener", "setTimeout", "URLSearchParams", SCRIPT)(
    win, location, history, sessionStorage, performance, document, addEventListener, setTimeout, URLSearchParams)
  return win
}
const KEY = "klav:proj:selected"
let env: Env
beforeEach(() => { env = { href: "", navType: "navigate", store: {}, forwards: 0, hidden: false } })

test("a normal page load (switch / link / reload) records its project as the selection", () => {
  env.href = "https://k.test/dashboard?project=B#tickets"
  run(env)
  expect(env.store[KEY]).toBe("B")
  expect(env.forwards).toBe(0)
})

test("Back onto a page of the SAME project works normally", () => {
  env.store[KEY] = "B"; env.navType = "back_forward"; env.href = "https://k.test/sim-runs?project=B"
  run(env)
  expect(env.forwards).toBe(0)
  expect(env.hidden).toBe(false)
})

test("Back onto a page of the OLD project steps forward again (hidden meanwhile) and keeps the selection", () => {
  env.store[KEY] = "B"; env.navType = "back_forward"; env.href = "https://k.test/dashboard?project=A#tickets"
  run(env)
  expect(env.forwards).toBe(1)
  expect(env.hidden).toBe(true)
  expect(env.store[KEY]).toBe("B")
})

test("a ticket permalink (no ?project=) is judged by its boot <meta> project once the DOM is ready", () => {
  env.store[KEY] = "B"; env.navType = "back_forward"; env.href = "https://k.test/acme/PM-15"; env.meta = "A"
  run(env)
  expect(env.forwards).toBe(0)
  env.domReady!()
  expect(env.forwards).toBe(1)
})

test("a page restored from the back/forward cache is checked too", () => {
  env.store[KEY] = "B"; env.navType = "navigate"; env.href = "https://k.test/sim-runs?project=B"
  run(env)
  env.href = "https://k.test/sim-runs?project=A"
  env.pageshow!({ persisted: true })
  expect(env.forwards).toBe(1)
  env.forwards = 0; env.pageshow!({ persisted: false })
  expect(env.forwards).toBe(0)
})

test("klavNoteProject lets a page record the project it resolved itself", () => {
  env.href = "https://k.test/dashboard"
  const win = run(env)
  win.klavNoteProject("C")
  expect(env.store[KEY]).toBe("C")
})

// ── wiring ───────────────────────────────────────────────────────────────────────────────────────
for (const f of PAGES) {
  test(`${f} loads /project-history.js first in <head>`, async () => {
    const html = await read("public/" + f)
    const i = html.indexOf("<head>")
    expect(html.slice(i, i + 80)).toContain('<script src="/project-history.js"></script>')
  })
}

test("dashboard: user view changes push history; boot and Back/Forward-driven ones replace", () => {
  expect(DASH).toContain("var _pushView = !!window.__klavSetViewReady && !window.__klavViewFromPop;")
  expect(DASH).toContain("if (_pushView && _viewUrl !== location.pathname + location.search + location.hash) history.pushState(null, '', _viewUrl);")
  expect(DASH).toContain("else history.replaceState(null, '', _viewUrl);")
})

test("dashboard: popstate restores the view (leaving ticket entries to the ticket handler)", () => {
  const i = DASH.indexOf("// KD-3089: browser Back/Forward between view entries")
  const block = DASH.slice(i, i + 900)
  expect(block).toContain("if (ev && ev.state && ev.state.tkt) return;")
  expect(block).toContain("window.__klavViewFromPop = true;")
  expect(block).toContain("setView(hv)")
})

test("dashboard records a project it resolved from a bare /dashboard", () => {
  expect(DASH).toContain("if (!activeProjectParam() && window.klavNoteProject) window.klavNoteProject(data.active.id)")
})

test("server serves /project-history.js and /api/dashboard is no-store", () => {
  expect(SERVER).toContain('path === "/project-history.js"')
  expect(SERVER).toContain('{ "Set-Cookie": projectCookie(projectId, SECURE), "Cache-Control": "no-store" }')
})
