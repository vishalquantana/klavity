// KD-230: changing Status in the ticket Properties rail must repaint the dedicated-page header's status
// pill (beside the #key) immediately. That pill is built once in _renderSingleTicket, outside renderHead,
// so the detail's onChange callback has to repaint it explicitly.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

function extractFn(src: string, marker: string): string {
  const i = src.indexOf(marker)
  if (i < 0) throw new Error("marker not found: " + marker)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + marker)
}

test("the dedicated-page header pill is repainted from t.status on every detail change", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  const repaint = extractFn(fn, "const repaintPageStatusPill = () =>")
  expect(repaint).toContain('single.querySelector(".tkt-page-head .tkt-pill")')
  expect(repaint).toContain("statusPillHtml(t.status)")
  expect(fn).toContain("buildTktDetail(t, admin, () => { renderHead(); repaintPageStatusPill(); renderTicketsKanban() }, true)")
})

test("the status save path mutates the same ticket object the page header reads, then fires onChange", () => {
  const i = HTML.indexOf('const statusSelEl = detailEl.querySelector(".tkt-status-sel")')
  const handler = HTML.slice(i, HTML.indexOf("const priSelEl", i))
  expect(handler).toContain("const tkt = (state.tickets || []).find(x => String(x.id) === String(ticketId))")
  expect(handler).toContain("if (tkt) tkt.status = newStatus")
  expect(handler).toContain('if (onChange) onChange("status", newStatus)')
})
