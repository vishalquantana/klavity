// KD-1000: in the Create Sims popup the per-card "Skip" did nothing useful (it only greyed the card). It's
// replaced by a checkbox on each generated Sim (selected by default), a live "N of M selected" count, a
// "Select all" toggle, and a bulk "Add selected (N)" button that adds only the checked Sims.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

test("the Skip button is gone", () => {
  expect(HTML).not.toContain("data-skip=")
  expect(HTML).not.toContain('closest("[data-skip]")')
  expect(HTML).not.toContain('id="smAddAll"')
})

test("each generated Sim gets a checkbox, selected by default, only when there are 2+ Sims", () => {
  const fn = HTML.match(/function simCardHtml\(s, idx, multi\) \{[\s\S]*?\n            \}/)
  expect(fn).not.toBeNull()
  expect(fn![0]).toContain('${multi ? `<input type="checkbox" class="sm-pick-cb" data-pick="${idx}" checked')
  const show = HTML.match(/function showSims\(arr\) \{[\s\S]*?\n            \}/)
  expect(show).not.toBeNull()
  expect(show![0]).toContain("const multi = lastSims.length > 1")
  expect(show![0]).toContain('id="smSelAll" checked')
  expect(show![0]).toContain('id="smSelCount"')
  expect(show![0]).toContain('id="smAddSel"')
})

test("the count and bulk button track the pending, checked Sims", () => {
  const fn = HTML.match(/function updateSimSelection\(\) \{[\s\S]*?\n            \}/)
  expect(fn).not.toBeNull()
  expect(fn![0]).toContain("countEl.textContent = `${sel} of ${pend.length} selected`")
  expect(fn![0]).toContain("addBtn.textContent = `Add selected (${sel})`")
  expect(fn![0]).toContain("addBtn.disabled = sel === 0")
  // an already-added Sim no longer counts and can't be re-picked
  expect(HTML).toContain('!cb.closest(".sm-sim").classList.contains("added")')
  expect(HTML).toContain('cardEl.querySelectorAll("button, .sm-pick-cb").forEach(b => b.disabled = true)')
})

test("Add selected adds only the checked Sims", () => {
  expect(HTML).toContain("const btns = pendingPicks().filter(cb => cb.checked)")
  expect(HTML).toContain('pendingPicks().forEach(cb => { cb.checked = on; })')   // Select all
})
