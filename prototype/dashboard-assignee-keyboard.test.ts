// KD-3164: keyboard navigation in the ticket Assignee dropdown. Before, the search box only handled Enter (typed
// email) and Escape, so arrow keys did nothing; Escape also bubbled to the ticket's document-level Esc handler and
// closed the whole ticket. Verified end-to-end in Chromium (panel + full page); these guard the wiring.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")
const start = html.indexOf("// KD-3164: keyboard navigation. Arrow keys")
const end = html.indexOf("if (_aUnassigned) _aUnassigned.addEventListener(\"click\"", start)
const block = html.slice(start, end)

test("a highlight model covers the visible options in order: teammates → Unassigned → Invite", () => {
  expect(start).toBeGreaterThan(-1)
  expect(block).toContain('_aPop.querySelectorAll(".tap-list .tap-opt, .tap-unassigned, .tap-invite")')
  expect(block).toContain('.filter(el => !el.closest(".hide"))')
  expect(block).toContain('el.classList.add("kbd"); el.setAttribute("aria-selected", "true")')
  expect(block).toContain('el.scrollIntoView({ block: "nearest" })')
})

test("wrap-around index math", () => {
  const wrap = (i: number, n: number) => ((i % n) + n) % n
  expect(wrap(3, 3)).toBe(0)     // ArrowDown past the last → first
  expect(wrap(-1, 3)).toBe(2)    // ArrowUp before the first → last
  expect(block).toContain("_aActive = ((i % opts.length) + opts.length) % opts.length")
})

test("ArrowUp/Down, Home/End and Enter are handled inside the popover", () => {
  expect(block).toContain('_aPop.addEventListener("keydown"')
  for (const k of ['"ArrowDown"', '"ArrowUp"', '"Home"', '"End"']) expect(block).toContain(`ev.key === ${k}`)
  expect(block).toContain('ev.key === "Enter" && _aActive >= 0')
  expect(block).toContain("el.click()")
})

test("Escape closes only the dropdown (stops propagation) and returns focus to the control", () => {
  const esc = block.slice(block.indexOf('} else if (ev.key === "Escape") {'))
  expect(esc).toContain("ev.stopPropagation(); _closeAssigneePop(); try { _assigneeCtrlBtn.focus() }")
})

test("search keeps its Enter-to-invite only when nothing is highlighted; typing a name highlights the first match", () => {
  expect(html).toContain('if (ev.key === "Enter" && _aActive < 0) {')
  expect(html).toContain('_aSetActive(q && !q.includes("@") && _aList && _aList.querySelector(".tap-opt") ? 0 : -1)')
  expect(html).toContain("_aSetActive(-1)   // KD-3164: no highlight until the first arrow key")
})

test("ArrowDown on the closed control opens it; the highlight has a visible style", () => {
  expect(block).toContain('if (ev.key === "ArrowDown" && _aPop.classList.contains("hide")) { ev.preventDefault(); _openAssigneePop() }')
  expect(html).toMatch(/\.tap-opt\.kbd,\s*\n\s*\.tap-invite\.kbd \{/)
})

// Same view, the Status / Priority / Labels dropdowns (`.kdd` skins): they had no arrow-key support, and Escape
// reached the ticket's document-level Esc handler (closing the whole ticket). Verified in Chromium for a normal
// ticket and a Sim Report in the preview panel (↓ opens on the current value, ↓↓ Enter saves, Esc keeps the ticket).
const kStart = html.indexOf("// KD-3164: keyboard navigation for the Status / Priority / Labels dropdowns")
const kBlock = html.slice(kStart, html.indexOf("\n            }\n", kStart))

test("Status/Priority/Labels dropdowns: one delegated keyboard handler on the ticket view", () => {
  expect(kStart).toBeGreaterThan(-1)
  expect(kBlock).toContain('detailEl.addEventListener("keydown", (ev) => {')
  expect(kBlock).toContain('ev.target.closest(".kdd")')
  // closed + ↓/↑ on the button → open via the existing click handler, focus the current value
  expect(kBlock).toContain('if (ev.target === btn && (ev.key === "ArrowDown" || ev.key === "ArrowUp")) {')
  expect(kBlock).toContain("btn.click()")
  expect(kBlock).toContain('i.getAttribute("aria-checked") === "true"')
})

test("Status/Priority/Labels dropdowns: ↑/↓/Home/End move focus; Escape closes only the menu; Tab closes", () => {
  for (const k of ['"ArrowDown"', '"ArrowUp"', '"Home"', '"End"']) expect(kBlock).toContain(`ev.key === ${k}`)
  expect(kBlock).toContain('else if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); close() }')
  expect(kBlock).toContain('else if (ev.key === "Tab")')
  // when no menu is open the handler returns early, so Escape still closes the ticket as before
  expect(kBlock.indexOf("if (!isOpen) {")).toBeLessThan(kBlock.indexOf('ev.key === "Escape"'))
})
