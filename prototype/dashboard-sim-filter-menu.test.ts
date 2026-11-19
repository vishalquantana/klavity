// Bug: the Sim Reports "Sim: All Sims" filter used a native <select>, so its options rendered with no styling (no hover,
// no selected state, no separation). It is now a styled kdd menu. The dashboard script can't be driven by a DOM here,
// so (like the other dashboard-*.test.ts guards) this checks the rendered markup, the wiring and the CSS by source.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")
function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig)
  if (i < 0) throw new Error("not found: " + sig)
  let d = 0, j = src.indexOf("{", i)
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}" && --d === 0) return src.slice(i, j + 1) }
  throw new Error("unbalanced")
}
const filters = extractFn(HTML, "function renderTriageFilters()")

test("the Sim filter renders a styled menu, keeping the hidden <select> as the state holder", () => {
  expect(filters).toContain('class="sr-sim-pill sr-sim-kdd kdd" data-kdd="sim"')
  expect(filters).toContain('id="tgSimBtn" aria-haspopup="menu" aria-expanded="false"')
  expect(filters).toContain('class="kdd-menu hide sr-sim-menu" id="tgSimMenu" role="menu"')
  expect(filters).toContain('<select id="tgSimFilter" class="kdd-native" tabindex="-1" aria-hidden="true">')
  // options: radio items with a selected state + check, a separator after "All Sims", and a per-Sim count
  expect(filters).toContain('role="menuitemradio" aria-checked="${_triageSim === val}"')
  expect(filters).toContain('<div class="sr-sim-sep" role="separator"></div>')
  expect(filters).toContain('<span class="sr-sim-count">${count}</span>')
  expect(filters).toContain("wireSimFilterMenu(simSel)")
  // the existing change handler still drives the filter
  expect(filters).toContain('simSel.addEventListener("change", () => { _triageSim = simSel.value; _tgSelected.clear(); renderTriageView() })')
})

test("menu wiring: toggle, pick (writes the select + fires change), arrow keys, Escape and outside-click close", () => {
  const wire = extractFn(HTML, "function wireSimFilterMenu(sel)")
  const close = extractFn(HTML, "function closeSimFilterMenu(focusBtn)")
  expect(() => new Function(close + "\n" + wire)).not.toThrow()   // compiles
  expect(wire).toContain('sel.value = val; sel.dispatchEvent(new Event("change", { bubbles: true }))')
  expect(wire).toContain('ev.key === "ArrowDown" || ev.key === "ArrowUp"')
  expect(wire).toContain('ev.key === "Escape"')
  expect(wire).toContain('closest(".sr-sim-kdd")')
  expect(wire).toContain("window.__srSimMenuDocWired")   // document listeners attached once, not per render
  expect(close).toContain('btn.setAttribute("aria-expanded", "false")')
})

test("CSS: hover, selected (✓ + accent), divider, counts and right-aligned menu", () => {
  expect(HTML).toContain(".sr-sim-menu .sr-sim-item:hover, .sr-sim-menu .sr-sim-item:focus-visible { background: var(--ink-3);")
  expect(HTML).toContain('.sr-sim-menu .sr-sim-item[aria-checked="true"] { background: rgba(99, 102, 241, .12); color: var(--indigo);')
  expect(HTML).toContain('.sr-sim-item[aria-checked="true"] .sr-sim-check { visibility: visible; }')
  expect(HTML).toContain(".sr-sim-sep { height: 1px;")
  expect(HTML).toContain(".sr-sim-count {")
  expect(HTML).toContain(".sr-sim-menu { left: auto; right: 0;")
  // Sim names keep their case (the shared kdd skin capitalises)
  expect(HTML).toMatch(/\.sr-sim-menu \.sr-sim-item \{[^}]*text-transform: none/)
})
