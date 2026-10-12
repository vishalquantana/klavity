// KD-206: the ticket-detail Status / Priority dropdowns must close on a click outside them. detailEl
// stops click propagation, so the outside-click listener has to run in the CAPTURE phase on document,
// and must keep the dropdown that was clicked (its own toggle handles it).
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const start = HTML.indexOf("// KD-206: outside-click / Escape close.")
const block = start < 0 ? "" : HTML.slice(start, start + 2500)

test("outside-click close is wired in the capture phase", () => {
  expect(block).not.toBe("")
  expect(block).toContain(`document.addEventListener("click", onDocClick, true)`)
  expect(block).toContain(`document.removeEventListener("click", onDocClick, true)`)
})

test("a click inside a dropdown keeps that dropdown; Escape closes all", () => {
  expect(block).toContain(`closeKdd(ev.target instanceof Element ? ev.target.closest(".kdd") : null)`)
  expect(block).toContain(`if (ev.key === "Escape") closeKdd(null)`)
})

test("the old bubble-phase per-dropdown document listeners are gone (they never fired inside detailEl)", () => {
  expect(HTML).not.toContain(`document.addEventListener("click", () => closeAll(null))`)
})
