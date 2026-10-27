import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const norm = (s: string) => s.replace(/\s+/g, " ")

test("ticket header on Ticket Details page does not activate edit mode on text click", () => {
  // Title element should not have tooltip advertising click-to-edit
  expect(HTML).not.toContain('<div class="single-title" title="Click to edit">')
  expect(HTML).toContain('<div class="single-title">')

  // Dedicated edit pencil button is present
  expect(HTML).toContain('<button class="single-title-edit" type="button" title="Edit title"')

  // wireSingleTitleEdit does NOT bind click-to-edit on titleEl
  const wireStart = HTML.indexOf("const wireSingleTitleEdit = () => {")
  expect(wireStart).toBeGreaterThan(-1)
  const wireEnd = HTML.indexOf("function repaintPageStatusPill()", wireStart)
  const wireSrc = HTML.slice(wireStart, wireEnd)

  // titleEl click listener must be removed
  expect(wireSrc).not.toContain('titleEl.addEventListener("click"')

  // editBtn click listener must be present
  expect(wireSrc).toContain('if (editBtn) editBtn.addEventListener("click", ev => { ev.stopPropagation(); enterTitleEdit() })')
})

test("ticket header supports read-only text selection and cursor", () => {
  // .single-title must have text cursor and user-select: text
  expect(norm(HTML)).toContain(norm(".single-title-row .single-title { cursor: text; min-width: 0; user-select: text }"))
})

test("ticket header edit preserves input commit, escape cancellation, and PATCH update", () => {
  const wireStart = HTML.indexOf("const wireSingleTitleEdit = () => {")
  const wireEnd = HTML.indexOf("function repaintPageStatusPill()", wireStart)
  const wireSrc = HTML.slice(wireStart, wireEnd)

  // Esc key cancels without saving
  expect(wireSrc).toContain('if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); teardown() }')

  // Enter key commits change
  expect(wireSrc).toContain('else if (ev.key === "Enter") { ev.preventDefault(); commit() }')

  // Blur commits change
  expect(wireSrc).toContain('inp.addEventListener("blur", () => { if (!done) commit() })')

  // PATCH endpoint is called with updated title
  expect(wireSrc).toContain('fetch("/api/feedback/" + encodeURIComponent(id)')
  expect(wireSrc).toContain('body: JSON.stringify({ title: next })')
})
