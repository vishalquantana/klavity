// KD-181: reloading the full ticket page briefly showed the Tickets board — the boot router's
// setView('tickets') rewrote the address bar to "<ticket-path>#tickets" and the board heading/filter
// chrome painted until the ticket rendered. The boot now applies the page-mode body class up front and
// tells setView to leave the ticket URL alone; a ticket that fails to load falls back to the board.
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

test("the ticket-page boot hides the board chrome before setView and keeps the URL", () => {
  const start = HTML.indexOf("else if (deepTkt) {")
  expect(start).toBeGreaterThan(-1)
  const block = HTML.slice(start, start + 400)
  expect(block).toContain("document.body.classList.add('tkt-page-open')")
  expect(block).toContain("window.__klavTktBootKeepUrl = true;")
  expect(block).toContain("try { setView('tickets'); } finally { window.__klavTktBootKeepUrl = false; }")
  // the body class is applied BEFORE setView paints the Tickets view
  expect(block.indexOf("tkt-page-open")).toBeLessThan(block.indexOf("setView('tickets')"))
})

test("setView skips its #<view> URL rewrite while the ticket-page boot is in progress", () => {
  const fn = extractFn(HTML, "function setView(v)")
  const guard = fn.indexOf("if (!window.__klavTktBootKeepUrl) try {")
  expect(guard).toBeGreaterThan(-1)
  expect(fn.indexOf("history.replaceState", guard)).toBeGreaterThan(guard)
})

test("a deep-linked ticket that can't be loaded falls back to the board, not a blank page", () => {
  const fn = extractFn(HTML, "function maybeOpenDeepLinkTicket()")
  expect(fn).toContain("const _bootFail = () => { if (!window.__klavDeepLinkNavAway && window.__klavTktPageOpen && typeof closeSingleTicket === \"function\") closeSingleTicket() }")
  expect(fn).toContain("if (!d || !d.report) { _bootFail(); return }")
  expect(fn).toContain(".catch(_bootFail)")
})
