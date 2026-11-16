// Tickets / Sim Reports "List | Board" toggle: only ONE option may ever look selected. Hover used the same indigo border as
// .active, so a hovered (or touch-sticky hovered) List next to the active Board read as both selected.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
const rule = (sel: string) => {
  const i = HTML.indexOf(sel + " {"); if (i < 0) return null
  return HTML.slice(i, HTML.indexOf("}", i) + 1)
}

test("only .active uses the indigo selected border", () => {
  expect(rule(".tkt-vbtn.active")).toContain("border-color: var(--indigo)")
  expect(rule(".tkt-vbtn:hover")).toBeNull() // the old indigo hover rule is gone
  const hover = rule(".tkt-vbtn:not(.active):hover")!
  expect(hover).not.toBeNull()
  expect(hover).not.toContain("--indigo")
})

test("hover applies only on real-pointer devices (no sticky hover after a tap)", () => {
  const i = HTML.indexOf(".tkt-vbtn:not(.active):hover")
  const media = HTML.lastIndexOf("@media (hover: hover)", i)
  expect(media).toBeGreaterThan(-1)
  expect(i - media).toBeLessThan(400)
})

test("both toggles start with exactly one active button", () => {
  for (const [list, board] of [["tktListBtn", "tktBoardBtn"], ["tgListBtn", "tgBoardBtn"]]) {
    const tagOf = (id: string) => HTML.slice(HTML.lastIndexOf("<button", HTML.indexOf(`id="${id}"`)), HTML.indexOf(">", HTML.indexOf(`id="${id}"`)))
    expect(tagOf(list)).not.toContain("active")
    expect(tagOf(board)).toContain("tkt-vbtn active")
  }
})

test("the hover/focus styles only use colour variables the dashboard defines", () => {
  const css = (rule(".tkt-vbtn:not(.active):hover") || "") + (rule(".tkt-vbtn:focus-visible") || "")
  for (const v of css.match(/var\(--[a-z0-9-]+\)/g) || []) {
    const name = v.slice(4, -1)
    if (name.startsWith("--mi-")) continue // motion tokens, defined separately
    expect(HTML).toContain(name + ":")
  }
})

// The real repro: List view → open a ticket (side panel) → scroll down → the Board was mounted under the list too.
function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}

test("opening a ticket panel keeps only the ACTIVE view mounted (no board under the list)", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(")
  expect(fn).toContain('board.classList.toggle("hide", _tktView === "list")')
  expect(fn).not.toMatch(/if \(board && _tktOriginContext !== "triage"\) board\.classList\.remove\("hide"\)/)
})

test("board visibility follows the selected view when a panel opens", () => {
  // Run the exact visibility lines against fake elements for both views.
  const fn = extractFn(HTML, "function _renderSingleTicket(")
  const line = fn.split("\n").find((l) => l.includes('board.classList.toggle("hide"'))!.trim()
  for (const [view, boardHidden] of [["list", true], ["board", false]] as const) {
    const cls = new Set<string>(["hide"])
    const board = { classList: { toggle: (c: string, on: boolean) => { on ? cls.add(c) : cls.delete(c) } } }
    new Function("board", "_tktOriginContext", "_tktView", line)(board, "tickets", view)
    expect(cls.has("hide")).toBe(boardHidden)
  }
})
