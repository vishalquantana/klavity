// #716: the ticket Properties rail — Status / Priority / Assignee value controls must read as SIBLINGS
// (borderless by default, subtle hover bg + caret, box + indigo ring only when open/focused) and share
// ONE value-column left edge (each control pulled with margin-left:-8px). The cramped email input is
// replaced by a Linear/Plane-style assignee picker popover.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const rule = (sel: string) => HTML.match(new RegExp(sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\{[^}]*\\}"))?.[0] || ""

test("all three value controls share one value-column left edge (margin-left:-8px)", () => {
  const propCtl = rule(".tkt-props .prop-ctl")
  const assignee = rule(".tkt-assignee-ctrl")
  expect(propCtl).toContain("margin-left:-8px")
  expect(assignee).toContain("margin-left:-8px")
  // same ~30px baseline height on both
  expect(propCtl).toContain("min-height:30px")
  expect(assignee).toContain("min-height:30px")
})

test("controls are borderless by default with a subtle hover bg (siblings, nothing boxed while another is bare)", () => {
  expect(rule(".tkt-props .prop-ctl")).toContain("border:1px solid transparent")
  expect(rule(".tkt-props .prop-ctl")).toContain("background:transparent")
  expect(rule(".tkt-assignee-ctrl")).toContain("border:1px solid transparent")
  expect(rule(".tkt-assignee-ctrl")).toContain("background:transparent")
  expect(HTML).toContain(".tkt-props .prop-ctl:hover{background:var(--ink-3)}")
  expect(HTML).toContain(".tkt-assignee-ctrl:hover{background:var(--ink-3)}")
})

test("the open/focused state gets a defined box + indigo ring on every control", () => {
  expect(HTML).toContain(".tkt-props .prop-ctl:focus-within{background:var(--ink-2);border-color:var(--indigo);box-shadow:0 0 0 3px rgba(99,102,241,.14)}")
  expect(HTML).toContain(".tkt-assignee-ctrl.open{background:var(--ink-2);border-color:var(--indigo);box-shadow:0 0 0 3px rgba(99,102,241,.14)}")
})

test("Status/Priority render as dropdowns, with the <select> kept as the hidden state holder", () => {
  // KD-206: the .prop-ctl/.prop-sel treatment was replaced by the top-nav "+ Create" component
  // language. The selects stay in the DOM (.kdd-native) because the whole save path -- mutation
  // guard, aria-busy, rollback, dot repaint -- is driven off their `change` event.
  expect(HTML).toContain('class="tkt-status-sel kdd-native"')
  expect(HTML).toContain('class="tkt-pri-sel kdd-native"')
  expect(HTML).toContain('data-kdd="status"')
  expect(HTML).toContain('data-kdd="priority"')
  // each option carries its own swatch, which a native <option> list cannot render
  expect(HTML).toContain('class="kdd-item" role="menuitemradio"')
  expect(HTML).toMatch(/kdd-item[^>]*>\s*<span class="prop-dot ds-/)
  expect(HTML).toMatch(/kdd-item[^>]*>\s*<span class="prop-sq dp-/)
})

test("every status in the list has a dot colour (qa_review was missing one)", () => {
  // The rule set covered five statuses while the list has six, so QA Review's dot was transparent.
  for (const s of ["new", "open", "in_progress", "qa_review", "done", "dismissed"]) {
    expect(HTML).toContain(`.prop-dot.ds-${s} {`)
  }
})

test("assignee edit is a picker popover (search + member list + Unassigned + Invite), not a bare email input", () => {
  expect(HTML).toContain('class="tkt-assignee-pop hide"')
  expect(HTML).toContain('class="tap-search"')
  expect(HTML).toContain('class="tap-list"')
  expect(HTML).toContain("tap-unassigned")
  expect(HTML).toContain('class="tap-invite"')
  // the datalist/email fallback is preserved (invite-by-email path still works)
  expect(HTML).toContain('class="assignee-inp tkt-assignee-input"')
  expect(HTML).toContain('list="tktAssigneeOptions"')
})

test("assignee selection saves OPTIMISTICALLY behind the __klavMutating guard, reverting on failure", () => {
  expect(HTML).toContain("const _assignSelect = async (emailVal) => {")
  // optimistic: paint + local state now, then PATCH
  expect(HTML).toContain("_paintAssigneeDisplay(val)")
  expect(HTML).toContain("setTicketAssigneeLocal(ticketId, val || null)")
  expect(HTML).toContain("window.__klavMutating++")
  // revert branch on a failed save
  expect(HTML).toContain("Couldn't assign — reverted.")
  expect(HTML).toContain("_paintAssigneeDisplay(prev)")
})
