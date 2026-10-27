import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const TICKET_HTML = await Bun.file(import.meta.dir + "/public/ticket.html").text()
const norm = (s: string) => s.replace(/\s+/g, " ")

test("Ticket Title: single-click does not activate edit mode, double-click does", () => {
  // Title element should not have tooltip advertising click-to-edit
  expect(HTML).not.toContain('<div class="single-title" title="Click to edit">')
  expect(HTML).toContain('<div class="single-title">')

  // Dedicated edit pencil button is present
  expect(HTML).toContain('<button class="single-title-edit" type="button" title="Edit title"')

  // Extract wireSingleTitleEdit function
  const wireStart = HTML.indexOf("const wireSingleTitleEdit = () => {")
  expect(wireStart).toBeGreaterThan(-1)
  const wireEnd = HTML.indexOf("function repaintPageStatusPill()", wireStart)
  const wireSrc = HTML.slice(wireStart, wireEnd)

  // titleEl must NOT listen for 'click' to edit
  expect(wireSrc).not.toContain('titleEl.addEventListener("click"')

  // titleEl MUST listen for 'dblclick' to edit
  expect(wireSrc).toContain('titleEl.addEventListener("dblclick"')

  // editBtn click listener must be present and active
  expect(wireSrc).toContain('if (editBtn) editBtn.addEventListener("click", ev => { ev.stopPropagation(); enterTitleEdit() })')
})

test("Ticket Title: styling supports text selection in read-only mode", () => {
  expect(norm(HTML)).toContain(norm(".single-title-row .single-title { cursor: text; min-width: 0; user-select: text }"))
})

test("Ticket Title: edit interaction preserves save, cancel, and PATCH logic", () => {
  const wireStart = HTML.indexOf("const wireSingleTitleEdit = () => {")
  const wireEnd = HTML.indexOf("function repaintPageStatusPill()", wireStart)
  const wireSrc = HTML.slice(wireStart, wireEnd)

  // Esc cancels without saving
  expect(wireSrc).toContain('if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); teardown() }')

  // Enter commits change
  expect(wireSrc).toContain('else if (ev.key === "Enter") { ev.preventDefault(); commit() }')

  // Blur commits change
  expect(wireSrc).toContain('inp.addEventListener("blur", () => { if (!done) commit() })')

  // PATCH endpoint is called with updated title
  expect(wireSrc).toContain('fetch("/api/feedback/" + encodeURIComponent(id)')
  expect(wireSrc).toContain('body: JSON.stringify({ title: next })')
})

test("Ticket Description: single-click does not activate edit mode, double-click does", () => {
  // Description element should not have click-to-edit tooltip
  expect(HTML).not.toContain('<div class="tkt-obs" title="Click to edit">')
  expect(HTML).not.toContain('title="Click to add description"')

  // Dedicated edit pencil button is present
  expect(HTML).toContain('<button class="tkt-desc-edit" type="button" title="Edit description"')

  // Extract description wiring region in buildTktDetail
  const descWireStart = HTML.indexOf('const descEl = detailEl.querySelector(".tkt-desc")')
  expect(descWireStart).toBeGreaterThan(-1)
  const descWireEnd = HTML.indexOf('const guardFixBtn = detailEl.querySelector(".guard-fix-btn")', descWireStart)
  const descWireSrc = HTML.slice(descWireStart, descWireEnd)

  // obsEl must NOT listen for single-click to enter edit mode
  expect(descWireSrc).not.toContain('obsEl.addEventListener("click"')

  // obsEl MUST listen for 'dblclick' to enter edit mode
  expect(descWireSrc).toContain('obsEl.addEventListener("dblclick"')

  // descEditBtn click listener must be present and active
  expect(descWireSrc).toContain('if (descEditBtn) descEditBtn.addEventListener("click", ev => { ev.stopPropagation(); enterDescEdit() })')
})

test("Ticket Description: styling supports text selection in read-only mode", () => {
  expect(norm(HTML)).toContain(norm(".tkt-obs { cursor: text; overflow-wrap: anywhere; word-break: break-word; min-width: 0; user-select: text }"))
})

test("Ticket Description: edit interaction preserves save, cancel, and PATCH logic", () => {
  const descWireStart = HTML.indexOf('const descEl = detailEl.querySelector(".tkt-desc")')
  const descWireEnd = HTML.indexOf('const guardFixBtn = detailEl.querySelector(".guard-fix-btn")', descWireStart)
  const descWireSrc = HTML.slice(descWireStart, descWireEnd)

  // Esc cancels without saving
  expect(descWireSrc).toContain('if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); teardown() }')

  // Enter/Cmd+Enter commits change
  expect(descWireSrc).toContain('else if (ev.key === "Enter" && (ev.metaKey || ev.ctrlKey)) { ev.preventDefault(); commit() }')

  // Save button commits change
  expect(descWireSrc).toContain('saveB.addEventListener("mousedown", ev => { ev.preventDefault(); ev.stopPropagation(); commit() })')

  // Blur commits change
  expect(descWireSrc).toContain('ta.addEventListener("blur", () => { if (!done) commit() })')

  // PATCH endpoint is called with updated observation
  expect(descWireSrc).toContain('fetch("/api/feedback/" + encodeURIComponent(ticketId)')
  expect(descWireSrc).toContain('body: JSON.stringify({ observation: next })')
})

test("Standalone ticket.html: observation uses dblclick and button uses click", () => {
  expect(TICKET_HTML).toContain('$("obsEditBtn").addEventListener("click", openObsEdit);')
  expect(TICKET_HTML).toContain('$("observation").addEventListener("dblclick", openObsEdit);')
  expect(TICKET_HTML).not.toContain('$("observation").addEventListener("click"')
})
