// KD-2862: the "Sim created!" popup must stay readable (not vanish after ~2s) and be dismissible by hand.
// Source-assertion style, like the other dashboard-*.test.ts guards (the modal lives in the dashboard script).
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

test("the popup never closes by itself: no timer is started when it shows", () => {
  const f = extractFn(HTML, "function showSuccessPanel(")
  expect(f).not.toContain("setTimeout(")
  expect(f).not.toContain("close()")
  expect(HTML).not.toContain("SIM_CREATED_MS")
  expect(HTML).not.toContain("createdTimer")
})

test("the popup has a visible, descriptively named button ('View Sims': closing lands on the Sims list), wired to close()", () => {
  expect(HTML).toMatch(/<button type="button" class="btn btn-indigo btn-sm sm-created-close" id="smCreatedClose">View Sims<\/button>/)
  expect(HTML).toContain('$("smCreatedClose").onclick = function () { close(); };')
  // the button lives inside the created view, so it is hidden/shown with it
  const view = HTML.slice(HTML.indexOf('id="smCreated"'), HTML.indexOf('id="smSuccess"'))
  expect(view).toContain('id="smCreatedClose"')
})

test("the Close button is focused when the popup shows, so Enter/Space/Esc work from the keyboard", () => {
  expect(extractFn(HTML, "function showSuccessPanel(")).toContain('$("smCreatedClose").focus()')
})

test("Escape dismisses the popup", () => {
  const i = HTML.indexOf('if (e.key !== "Escape" || !ov.classList.contains("show")) return;')
  expect(i).toBeGreaterThan(-1)
  const region = HTML.slice(i, i + 500)
  expect(region.indexOf('ov.classList.contains("sm-modal-created")')).toBeGreaterThan(-1)
  expect(region.indexOf("close(); return;")).toBeGreaterThan(-1)
})

test("nothing refreshes or navigates while the popup is showing: the list reload + view switch stay inside close()", () => {
  const show = extractFn(HTML, "function showSuccessPanel(")
  expect(show).not.toContain("load()")
  expect(show).not.toContain("setView(")
  expect(show).not.toContain("history.")
  expect(extractFn(HTML, "function close(fromPop)")).toContain("if (simAdded) { simAdded = false; load();")
})
