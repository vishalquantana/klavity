// #718: fix the awkward ticket-bottom. "Copy timeline" stays inline in the header row and is DISABLED
// when there are no repeat occurrences (nothing to copy); an empty line shows instead of the section
// self-hiding into dead space. The merge combobox shows each candidate as #key · title · status, and
// the occurrence timeline + merge control are grouped into one coherent footer.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

test("Copy timeline is inline in the header row and disabled by default (nothing to copy)", () => {
  // right-aligned inside the flex header, not floating in dead space
  expect(HTML).toContain(".tkt-occ-copy{margin-left:auto}")
  // ships disabled; a dimmed disabled style exists
  expect(HTML).toContain('class="btn btn-ghost btn-sm tkt-occ-copy" type="button" disabled')
  expect(HTML).toContain(".tkt-occ-copy:disabled{opacity:.45;cursor:default")
})

test("empty state renders a subtle line and DISABLES copy; a real timeline enables it", () => {
  expect(HTML).toContain("Reported once — no repeat occurrences yet.")
  // showEmpty disables copy; showTimeline enables it
  expect(HTML).toContain("if (copyBtn) copyBtn.disabled = true")
  expect(HTML).toContain("if (copyBtn) copyBtn.disabled = false")
  // single occurrence now shows the empty state instead of hiding the whole section
  expect(HTML).toContain("if (occ.length < 2) { showEmpty(); return }")
})

test("merge results show each candidate as #key · title · status (not a blank datalist line)", () => {
  expect(HTML).toContain('class="tkt-merge-results hide"')
  expect(HTML).toContain('class="tkt-merge-cand"')
  expect(HTML).toContain('class="mc-key">#')
  expect(HTML).toContain('class="mc-title"')
  expect(HTML).toContain('chip kb-st-')
  expect(HTML).toContain('mc-st')
  expect(HTML).toContain("esc(stLabel(st))")
  // the old blank native datalist is gone
  expect(HTML).not.toContain('<datalist id="${esc(listId)}">${opts}</datalist>')
})

test("occurrence timeline + merge are grouped into one coherent footer", () => {
  expect(HTML).toContain('_footer.className = "tkt-detail-footer"')
  expect(HTML).toContain("_footer.appendChild(buildOccurrenceTimeline(t.id))")
  expect(HTML).toContain("_footer.appendChild(buildMergeControl(t.id))")
  expect(HTML).toContain(".tkt-detail-footer{display:flex;flex-direction:column")
})
