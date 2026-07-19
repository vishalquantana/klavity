// Regression guard for KLAVITYKLA-343: tgToggleExpand (and sibling tgSetFocus /
// tgUndoToast) were called from live event handlers but never defined, causing
// an Uncaught ReferenceError on every click of the expand control in the triage
// inbox. This test pins that all three are defined and that tgToggleExpand
// correctly toggles the evidence panel without throwing.

import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

// ── 1 · All three missing functions are now defined ───────────────────────────
test("tgToggleExpand is defined in dashboard.html", () => {
  expect(HTML).toContain("async function tgToggleExpand(")
})

test("tgSetFocus is defined in dashboard.html", () => {
  expect(HTML).toContain("function tgSetFocus(")
})

test("tgUndoToast is defined in dashboard.html", () => {
  expect(HTML).toContain("function tgUndoToast(")
})

// ── 2 · tgToggleExpand toggles the evidence panel without throwing ────────────
// We extract the shipped function from dashboard.html (same pattern as other
// dashboard tests) and run it in a minimal DOM-like sandbox so the test proves
// the real code path, not a re-implementation.

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

const tgToggleExpandSrc = extractFn(HTML, "async function tgToggleExpand(")

// Build a minimal fake row that mirrors the DOM shape rendered by renderTriageItems.
function fakeRow(expanded: boolean) {
  const panel = {
    _hide: !expanded,
    _html: "",
    _loaded: "",
    get classList() {
      return {
        contains: (c: string) => c === "hide" ? this._hide : false,
        toggle: (c: string, force: boolean) => {
          if (c === "hide") (this as any)._hide = force
        },
      }
    },
    get innerHTML() { return this._html },
    set innerHTML(v: string) { this._html = v },
    getAttribute: (a: string) => a === "data-loaded" ? panel._loaded : null,
    setAttribute: (a: string, v: string) => { if (a === "data-loaded") panel._loaded = v },
  }

  const btn = {
    _open: expanded,
    _expanded: String(expanded),
    get classList() {
      return {
        toggle: (c: string, force: boolean) => { if (c === "open") (this as any)._open = force },
      }
    },
    setAttribute: (a: string, v: string) => { if (a === "aria-expanded") btn._expanded = v },
  }

  return {
    btn,
    panel,
    querySelector: (sel: string) => {
      if (sel === ".tg-expand-btn") return btn
      if (sel === ".tg-evidence") return panel
      return null
    },
  }
}

test("tgToggleExpand: clicking a collapsed row expands it (no throw)", async () => {
  const t = { id: "42", title: "Test report" }
  const row = fakeRow(false) // starts collapsed

  // Stub globals the function references
  const stubFetch = async () => ({ ok: false } as Response)
  const stubEsc = (s: string) => String(s)
  const stubKicon = () => ""
  const stubLoadShots = () => {}

  const fn = new Function(
    "fetch", "esc", "kicon", "loadTriageShots",
    `return (${tgToggleExpandSrc})`,
  )(stubFetch, stubEsc, stubKicon, stubLoadShots)

  // Should NOT throw
  await fn(row, t)

  // Panel should now be visible (hide=false) and button marked open
  expect(row.panel._hide).toBe(false)
  expect(row.btn._open).toBe(true)
  expect(row.btn._expanded).toBe("true")
  // data-loaded should be set so a second click won't re-fetch
  expect(row.panel._loaded).toBe("1")
})

test("tgToggleExpand: clicking an expanded row collapses it (no throw)", async () => {
  const t = { id: "99", title: "Another report" }
  const row = fakeRow(true) // starts expanded, panel already loaded
  row.panel._loaded = "1"

  const stubFetch = async () => ({ ok: false } as Response)
  const fn = new Function(
    "fetch", "esc", "kicon", "loadTriageShots",
    `return (${tgToggleExpandSrc})`,
  )(stubFetch, (s: string) => s, () => "", () => {})

  await fn(row, t)

  expect(row.panel._hide).toBe(true)
  expect(row.btn._open).toBe(false)
  expect(row.btn._expanded).toBe("false")
})

test("tgToggleExpand: expanding a row that already has data-loaded skips re-fetch", async () => {
  const t = { id: "7", title: "Pre-loaded" }
  const row = fakeRow(false)
  row.panel._loaded = "1"
  row.panel._html = "pre-existing content"

  let fetchCalled = false
  const fn = new Function(
    "fetch", "esc", "kicon", "loadTriageShots",
    `return (${tgToggleExpandSrc})`,
  )(async () => { fetchCalled = true; return { ok: false } as Response }, (s: string) => s, () => "", () => {})

  await fn(row, t)

  expect(fetchCalled).toBe(false)
  // Content unchanged — wasn't re-rendered
  expect(row.panel._html).toBe("pre-existing content")
})
