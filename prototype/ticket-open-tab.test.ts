import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")

function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}

test("prettyTicketPathFor resolves workspace slug and ticketKey from active project when unpopulated on ticket", () => {
  const fn = extractFn(HTML, "function prettyTicketPathFor(t)")
  expect(fn).toContain("const slug = t.slug || (state && state.active && (state.active.slug || state.active.workspaceSlug))")
  expect(fn).toContain("const ticketKey = t.ticketKey || (state && state.active && (state.active.ticketKey || state.active.key))")
  expect(fn).toContain('return "/" + encodeURIComponent(String(slug)) + "/" + encodeURIComponent(String(ticketKey)) + "-" + t.seqNum')
})

test("Kanban board cards support ctrlKey, metaKey, and middle click to open in new tab", () => {
  const fn = extractFn(HTML, "function renderTicketsKanban(boardTickets)")
  expect(fn).toContain("if (ev.ctrlKey || ev.metaKey)")
  expect(fn).toContain('window.open(prettyTicketUrl(t), "_blank", "noopener")')
  expect(fn).toContain('cardEl.addEventListener("auxclick"')
  expect(fn).toContain("if (ev.button === 1)")
})

test("Ticket list view rows support ctrlKey, metaKey, and middle click to open in new tab", () => {
  const fn = extractFn(HTML, "function renderTktList(")
  expect(fn).toContain("if (ev.ctrlKey || ev.metaKey)")
  expect(fn).toContain('window.open(prettyTicketUrl(t), "_blank", "noopener")')
  expect(fn).toContain('row.addEventListener("auxclick"')
})

test("Recent ticket feed rows support ctrlKey, metaKey, and middle click to open in new tab", () => {
  const fn = extractFn(HTML, "function renderTickets()")
  expect(fn).toContain("if (ev.ctrlKey || ev.metaKey)")
  expect(fn).toContain('window.open(prettyTicketUrl(t), "_blank", "noopener")')
  expect(fn).toContain('rowEl.addEventListener("auxclick"')
})

test("Triage items support ctrlKey, metaKey, and middle click to open in new tab", () => {
  const fn = extractFn(HTML, "function wireTriageItem(el, id, t)")
  expect(fn).toContain("if (ev.ctrlKey || ev.metaKey)")
  expect(fn).toContain('window.open(prettyTicketUrl(t || { id: id }), "_blank", "noopener")')
  expect(fn).toContain('el.addEventListener("auxclick"')
})
