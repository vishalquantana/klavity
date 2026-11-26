// KD-3157: the 'New ticket' modal preselected the logged-in user as Assignee ("you@… (you)"), so tickets were silently
// assigned to whoever created them. It now starts on a "Select assignee" placeholder; Assignee stays required.
// Verified in Chromium: opens on the placeholder, Create without a pick shows "Assignee is required." and focuses the
// dropdown, picking someone clears the error and the ticket is created with that assignee; reopening resets.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extractFn(name: string) {
  const start = html.indexOf(name)
  expect(start).toBeGreaterThan(-1)
  let i = html.indexOf("{", start), depth = 0
  for (; i < html.length; i++) { if (html[i] === "{") depth++; else if (html[i] === "}" && --depth === 0) break }
  return html.slice(start, i + 1)
}

// A tiny fake <select>/<input> so populateNewTktAssignees can run for real.
function fakeDom() {
  const options: any[] = []
  const sel: any = {
    options, _value: "",
    get value() { return this._value },
    set value(v: string) { this._value = v },
    set innerHTML(_: string) { options.length = 0 },
    appendChild(o: any) { options.push(o); if (o.selected) this._value = o.value },
    get selectedIndex() { return options.findIndex(o => o.value === this._value) },
  }
  const inp: any = { value: "x" }
  const err: any = { textContent: "Assignee is required." }
  const els: Record<string, any> = { newTktAssigneeSel: sel, newTktAssigneeInp: inp, newTktAssigneeErr: err }
  const document = { getElementById: (id: string) => els[id] || null, createElement: () => ({ value: "", textContent: "", disabled: false, selected: false }) }
  return { sel, inp, err, document }
}

test("opens on a 'Select assignee' placeholder — nobody preselected, the current user still listed first", () => {
  const { sel, inp, document } = fakeDom()
  const state = { email: "me@x.io", members: [{ email: "bob@x.io" }, { email: "me@x.io" }, { email: "alice@x.io" }] }
  const populate = new Function("document", "state",
    [extractFn("function newTktAssigneeEmails("), extractFn("function syncNewTktAssignee("), extractFn("function populateNewTktAssignees("), "return populateNewTktAssignees"].join("\n"),
  )(document, state)
  populate()
  expect(sel.options.map((o: any) => o.textContent)).toEqual(["Select assignee", "me@x.io (you)", "alice@x.io", "bob@x.io"])
  expect(sel.options[0]).toMatchObject({ value: "", disabled: true })
  expect(sel.value).toBe("")
  expect(inp.value).toBe("")          // the hidden submit value is empty until someone is picked
})

test("picking an assignee fills the submit value and clears 'Assignee is required.'", () => {
  const { sel, inp, err, document } = fakeDom()
  const sync = new Function("document", extractFn("function syncNewTktAssignee(") + "\nreturn syncNewTktAssignee")(document)
  sel.value = "bob@x.io"
  sync()
  expect(inp.value).toBe("bob@x.io")
  expect(err.textContent).toBe("")
})

test("submit still requires an assignee, and focuses the visible dropdown", () => {
  const submit = extractFn("async function submitNewTicket(")
  expect(submit).toContain('if (aerr) aerr.textContent = "Assignee is required."')
  expect(submit).toContain('const asel = document.getElementById("newTktAssigneeSel")')
  expect(submit).toContain("(asel || assignee).focus()")
  // the old "default = the current user" preselect is gone
  expect(extractFn("function populateNewTktAssignees(")).not.toContain("sel.value = sel.options[0].value")
})
