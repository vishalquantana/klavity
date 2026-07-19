// KLAVITYKLA-348 — regression guard: view renderers must not throw when `state` is still null.
//
// Live prod crash (19 Jul 2026, klavity.in/dashboard):
//   Uncaught TypeError: Cannot read properties of null (reading 'widgetStatus')
//     at renderSnapView -> setView -> HTMLButtonElement.onclick
// `state` starts as `null` and is only assigned by load(); the sidebar buttons are clickable
// before that, so setView('snap') / setView('overview') can invoke a renderer against a null
// state. renderSnapView read `state.widgetStatus` unguarded; renderChecklist read
// `state.widgetStatus` / `state.tickets` / `state.trails` unguarded too.
//
// This test extracts the REAL shipped functions out of dashboard.html (no re-implementation) and
// calls them with state === null. Before the fix, renderSnapView throws the exact prod TypeError.

import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

// Anchored, brace-matched extraction of a source unit (same technique as dashboard-skeleton-guard).
function extractFn(src: string, startSig: string): string {
  const i = src.indexOf(startSig)
  if (i < 0) throw new Error("source not found: " + startSig)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + startSig)
}

const renderSnapViewSrc = extractFn(HTML, "function renderSnapView(")
const renderChecklistSrc = extractFn(HTML, "function renderChecklist(")

// Minimal DOM-ish element stub — enough for classList/innerHTML/textContent/onclick writes.
function fakeEl() {
  const classes = new Set<string>()
  return {
    innerHTML: "",
    textContent: "",
    style: {} as any,
    classList: {
      add: (c: string) => { classes.add(c) },
      remove: (c: string) => { classes.delete(c) },
      toggle: (c: string, on?: boolean) => { on ? classes.add(c) : classes.delete(c) },
      contains: (c: string) => classes.has(c),
    },
    setAttribute() {},
    _classes: classes,
  }
}

// Build a sandbox where every collaborator is stubbed and `state` is whatever we pass in.
function run(fnSrc: string, fnName: string, state: any) {
  const els: Record<string, any> = {}
  const $ = (id: string) => (els[id] ||= fakeEl())
  let polled = false
  const factory = new Function(
    "$", "state", "curProjId", "embedSnippet", "cspFixPrompt", "klavCopy", "kicon", "esc",
    "startWidgetStatusPoll", "localStorage", "maybeCelebrateFirstReport", "document",
    `${fnSrc}\nreturn ${fnName};`,
  )
  const fn = factory(
    $,
    state,
    () => "proj_test",
    (p: string) => "<script src=\"/widget.js\" data-project=\"" + p + "\"></script>",
    () => "prompt",
    () => {},
    () => "<svg></svg>",
    (s: string) => String(s),
    () => { polled = true },
    { getItem: () => null, setItem: () => {} },
    () => {},
    { getElementById: (id: string) => $(id), body: { getAttribute: () => "snap" } },
  )
  fn()
  return { els, polled }
}

test("renderSnapView does not throw when state is null (prod crash KLAVITYKLA-348)", () => {
  expect(() => run(renderSnapViewSrc, "renderSnapView", null)).not.toThrow()
})

test("renderSnapView shows the waiting state and starts the poll when state is null", () => {
  const { els, polled } = run(renderSnapViewSrc, "renderSnapView", null)
  expect(els.snapViewDetectTxt.textContent).toContain("Waiting for your site")
  expect(els.snapViewDetect._classes.has("ok")).toBe(false)
  expect(polled).toBe(true)
})

test("renderSnapView still reflects a detected widget once state has loaded", () => {
  const { els } = run(renderSnapViewSrc, "renderSnapView", {
    widgetStatus: { lastSeen: 1, host: "example.com" },
  })
  expect(els.snapViewDetect._classes.has("ok")).toBe(true)
  expect(els.snapViewDetectTxt.innerHTML).toContain("example.com")
})

test("renderChecklist does not throw when state is null", () => {
  expect(() => run(renderChecklistSrc, "renderChecklist", null)).not.toThrow()
})

test("renderSnapView never reads state.widgetStatus unguarded", () => {
  // Source-level pin: inside renderSnapView the only read of state.widgetStatus must be
  // null-guarded, so a future edit can't silently reintroduce the prod crash.
  const unguarded = renderSnapViewSrc
    .split("\n")
    .filter(l => /state\.widgetStatus/.test(l) && !/state\s*&&\s*state\.widgetStatus/.test(l))
  expect(unguarded).toEqual([])
})

test("renderChecklist bails out before touching state when it is not loaded", () => {
  const body = renderChecklistSrc
  const guardAt = body.indexOf("if (!state) return")
  expect(guardAt).toBeGreaterThan(-1)
  // The guard must come before the first state.* dereference.
  const firstUse = body.search(/[^.\w]state\./)
  expect(guardAt).toBeLessThan(firstUse)
})
