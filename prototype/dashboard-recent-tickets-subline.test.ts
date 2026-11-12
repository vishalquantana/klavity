// Overview "Recent tickets": each row's sub-line shows the ticket ID, project name and when it was filed (exact date/time on
// hover) — not the page path the report came from ("/dashboard · 25 min ago" read as noise and hid the ticket's own ID).
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
function extractFn(src: string, sig: string) {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const fn = extractFn(HTML, "function renderTickets()")

test("sub-line = ticket ID · project · time (+ reporting Sim)", () => {
  expect(fn).toContain("ticketKeyLabel(t)")
  expect(fn).toContain("state.active && state.active.name")
  expect(fn).toContain("ago(t.createdAt)")
  expect(fn).toContain("toLocaleString()")   // exact date/time on hover
})

test("the page path is no longer the sub-line", () => {
  expect(fn).not.toContain("t.urlPath ? esc(t.urlPath)")
})
