// Regression guards for the dashboard "wave 2" UX batch (all in public/dashboard.html):
//   #676 — kanban columns FILL available board width (flex-grow) but keep a MIN width so a crowded
//          board still scrolls sideways.
//   #677 — collapsible left sidebar (icon-rail) toggled via body.side-collapsed, persisted in localStorage.
//   #678 — the inline assign control is GONE from kanban cards; assignee shows read-only ("→ email")
//          and assignment happens only in the ticket detail panel.
//
// These read the REAL shipped markup/source as text (no DOM/network) so a future refactor that drops
// the behavior trips the test.

import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

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

// ── #676 · kanban columns grow to fill the board ──────────────────────────────
test("#676 kanban columns flex-grow to fill the board with a min width", () => {
  // The .kb-col base rule must let columns GROW (flex-grow:1) while keeping a 300px min so a crowded
  // board horizontal-scrolls instead of squishing. max-width must NOT pin them to a fixed width.
  const m = HTML.match(/\.kb-col\{([^}]*)\}/)
  expect(m).toBeTruthy()
  const rule = m![1]
  expect(rule).toContain("flex:1 1 300px")
  expect(rule).toContain("min-width:300px")
  expect(rule).toContain("max-width:none")
  // the fixed-width variant (dead space on the right with few columns) must be gone
  expect(rule).not.toContain("flex:0 0 300px")
  expect(rule).not.toContain("max-width:300px")
})

test("#676 kanban container still flex-nowrap + horizontal-scrolls (drag lanes intact)", () => {
  const m = HTML.match(/\.kanban\{([^}]*)\}/)
  expect(m).toBeTruthy()
  expect(m![1]).toContain("flex-wrap:nowrap")
  expect(m![1]).toContain("overflow-x:auto")
})

// ── #677 · collapsible sidebar ────────────────────────────────────────────────
test("#677 sidebar has a keyboard-accessible collapse toggle button", () => {
  expect(HTML).toContain('id="sideCollapseBtn"')
  // real <button> (keyboard-accessible) with an aria-label
  const btn = HTML.match(/<button[^>]*id="sideCollapseBtn"[^>]*>/)
  expect(btn).toBeTruthy()
  expect(btn![0]).toContain("aria-label=")
  expect(btn![0]).toContain('aria-expanded="true"')
})

test("#677 collapsed state is driven by body.side-collapsed on the layout grid", () => {
  // the rail shrinks and the content grid (bar-in + wrap) reclaims the width
  expect(HTML).toContain("body.side-collapsed .side{width:60px")
  expect(HTML).toContain("body.side-collapsed .bar-in,body.side-collapsed .wrap{margin-left:60px}")
  // smooth transition on the rail width
  expect(HTML).toMatch(/\.side\{[^}]*transition:width/)
})

test("#677 collapse preference persists in localStorage", () => {
  // the toggle wiring reads + writes the preference key so it survives reloads
  expect(HTML).toContain("klav-side-collapsed")
  expect(HTML).toContain("localStorage.setItem(KEY")
  expect(HTML).toContain("classList.toggle('side-collapsed'")
})

// ── #678 · no inline assign on kanban cards ───────────────────────────────────
test("#678 kanban card render has no inline assign control or wiring", () => {
  const renderBoard = extractFn(HTML, "function renderTicketsKanban(")
  // the compact on-card picker + its wiring are gone from the card render
  expect(renderBoard).not.toContain("assigneePickerHtml(t, true)")
  expect(renderBoard).not.toContain("wireCardAssign(")
  // and the dead helper/markup are fully removed from the file
  expect(HTML).not.toContain("function wireCardAssign(")
  expect(HTML).not.toContain("kb-card-assign")
  expect(HTML).not.toContain("tkt-assignee-reassign")
})

test("#678 card still shows the assignee READ-ONLY via kbCardMetaHtml", () => {
  const meta = extractFn(HTML, "function kbCardMetaHtml(")
  // read-only "→ email" line, only when assigned
  expect(meta).toContain("t.assignee ?")
  expect(meta).toContain("→ ")
  // no input/button on the card
  expect(meta).not.toContain("assignee-inp")
})

test("#678 the ticket detail panel keeps its assignee control", () => {
  // assigneePickerHtml is now single-purpose (detail-panel avatar control) and still wired into the panel
  const picker = extractFn(HTML, "function assigneePickerHtml(")
  expect(picker).toContain("tkt-assignee-ctrl")
  expect(picker).toContain("assignee-inp")
  expect(HTML).toContain("${assigneePickerHtml(t)}")
})
