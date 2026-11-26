// KD-3159: changing a ticket's priority in the preview must show everywhere at once. Before, only the dropdown label
// changed; the severity square, chip, rail and the board / Sim Reports card behind the preview waited for the PATCH
// round-trip (slow on dev), and a failed save left the dropdown showing a value that was never saved. Verified in
// Chromium with the PATCH delayed 2.5s (all of it updates within 0.15s) and with a forced 500 (everything reverts).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")
const start = html.indexOf("// KD-3159: OPTIMISTIC priority change.")
const block = html.slice(start, html.indexOf("// Wire up save-meta (assignee + notes)", start))

test("one _applyPriority updates every place that shows the priority", () => {
  expect(start).toBeGreaterThan(-1)
  const apply = block.slice(block.indexOf("const _applyPriority = (newPri) => {"), block.indexOf('priSelEl.addEventListener("change"'))
  for (const s of [
    "tkt.priority = newPri", "bt.priority = newPri", "tgItem.priority = newPri",   // state, board cache, Sim Reports cache
    "recordLocalEdit(ticketId, { priority: newPri })",                             // guards the liveness poll
    '.tg-item[data-id=', '"prop-sq dp-" + (newPri || "medium")',                   // triage card, severity square
    "parentRow.classList.add", '"chip sev-" + newPri', 'onChange("priority", newPri)', // rail, chip, board re-render
  ]) expect(apply).toContain(s)
})

test("the UI is updated BEFORE the PATCH, not after it", () => {
  const change = block.slice(block.indexOf('priSelEl.addEventListener("change"'))
  const applyAt = change.indexOf("_applyPriority(newPri)")
  const fetchAt = change.indexOf("await fetch(")
  expect(applyAt).toBeGreaterThan(-1)
  expect(fetchAt).toBeGreaterThan(-1)
  expect(applyAt).toBeLessThan(fetchAt)
})

test("a failed save rolls everything back and repaints the dropdown without re-saving", () => {
  const change = block.slice(block.indexOf('priSelEl.addEventListener("change"'))
  expect(change).toContain("if (_priReverting) return")
  expect(change).toContain("_applyPriority(prevPri)")
  expect(change).toContain('priSelEl.value = prevPri || "medium"; priSelEl.dispatchEvent(new Event("change", { bubbles: true }))')
  expect(change).toContain("finally { _priReverting = false }")
  expect(change).toContain("Couldn't save priority — reverted.")
})

test("a newer pick wins: a stale response neither reverts nor shows a message", () => {
  const change = block.slice(block.indexOf('priSelEl.addEventListener("change"'))
  expect(change).toContain("const seq = ++_priSeq")
  expect(change).toContain("if (seq !== _priSeq) return")
  // the select is no longer disabled during the save (the old code blocked re-picking until the server answered)
  expect(change).not.toContain("priSelEl.disabled = true")
})
