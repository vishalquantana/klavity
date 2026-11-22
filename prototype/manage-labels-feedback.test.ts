// Bug: creating a label in Manage Labels gave no feedback — no progress while it was created and no success
// message after. Now: Add/name/colour lock with a spinner + "Adding…" and an indeterminate bar while the
// request runs (also blocks a double-create), then a success toast + the new row flashes.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")

test("the modal has a progress bar under the add form", () => {
  expect(html).toContain('<div class="ml-progress" id="mlProgress" role="progressbar" aria-label="Creating label" hidden><span></span></div>')
  expect(html).toContain("@keyframes mlProgress")
})

test("Add shows a busy state for the whole request and ignores a second click", () => {
  expect(html).toContain('btn.innerHTML = on ? \'<span class="sup-spin" aria-hidden="true"></span>Adding…\' : "Add"')
  expect(html).toContain('["mlNewName", "mlNewColor", "mlAddBtn"].forEach(id => { const el = document.getElementById(id); if (el) el.disabled = on })')
  expect(html).toContain("if (bar) bar.hidden = !on")
  expect(html).toMatch(/const addLabel = async \(\) => \{\s+if \(mlAdding\) return\s+setMlBusy\(true\)\s+try \{ await addLabelNow\(\) \} finally \{ setMlBusy\(false\) \}/)
})

test("success shows a toast and flashes the new label's row", () => {
  expect(html).toContain('klavToast(`Label <b>${esc(d.label.name)}</b> created${_mlTicket ? " and added to this ticket" : ""}.`, false, 1000)')
  expect(html).toMatch(/await _mlAddToTicket\(d\.label\)[^\n]*\n\s+flashMlRow\(d\.label\.id\)/)
  expect(html).toContain(".ml-row.ml-just-added")
})

test("the label toast stays 1s (other toasts keep the 8s default)", () => {
  expect(html).toContain("function klavToast(msgHtml, warn, ms) {")
  expect(html).toContain('setTimeout(() => { toast.classList.remove("show") }, ms > 0 ? ms : 8000)')
})
