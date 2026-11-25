// KD-3106: the New/Edit test case modal (and every AutoSim Projects form) shows a loading state
// while it saves: spinner + "Creating test case…" on the button, fields/Cancel locked, no close mid-save.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const asp = readFileSync(join(import.meta.dir, "public/vendor/autosim-projects.js"), "utf8").replace(/\r\n/g, "\n")

function extract(name: string) {
  const start = asp.indexOf("  function " + name + "(")
  let i = asp.indexOf("{", start), depth = 0
  for (; i < asp.length; i++) { if (asp[i] === "{") depth++; else if (asp[i] === "}" && --depth === 0) break }
  return asp.slice(start, i + 1)
}

function fakeEl(extra: Record<string, any> = {}) {
  const attrs: Record<string, string> = {}
  return { disabled: false, textContent: "", innerHTML: "", dataset: {} as Record<string, string>,
    setAttribute(k: string, v: string) { attrs[k] = v }, getAttribute(k: string) { return attrs[k] }, ...extra }
}

function setup() {
  const modal = fakeEl()
  const inputs = [fakeEl(), fakeEl({ disabled: true }), fakeEl()]   // 2nd is a radio that was already disabled
  const els: Record<string, any> = {
    aspModalOk: fakeEl({ closest: () => modal }),
    aspModalCancel: fakeEl(),
    aspModalBody: { querySelectorAll: () => inputs },
  }
  const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c])
  const api = new Function("$", "esc", "var modalBusy = false\n" + extract("setModalBusy") +
    "\nreturn { set: setModalBusy, busy: function () { return modalBusy } }")((id: string) => els[id], esc)
  return { api, els, modal, inputs }
}

test("busy: spinner + busy label on the button, Cancel and fields disabled, aria-busy set", () => {
  const { api, els, modal, inputs } = setup()
  api.set(true, "Creating test case…", "Create test case")
  expect(api.busy()).toBe(true)
  expect(els.aspModalOk.disabled).toBe(true)
  expect(els.aspModalOk.innerHTML).toContain('class="asp-spin"')
  expect(els.aspModalOk.innerHTML).toContain("Creating test case…")
  expect(els.aspModalCancel.disabled).toBe(true)
  expect(modal.getAttribute("aria-busy")).toBe("true")
  expect(inputs.every((i) => i.disabled)).toBe(true)
})

test("idle again: label restored, controls re-enabled, already-disabled options stay disabled", () => {
  const { api, els, modal, inputs } = setup()
  api.set(true, "Saving…", "Save")
  api.set(false, "", "Create test case")
  expect(api.busy()).toBe(false)
  expect(els.aspModalOk.disabled).toBe(false)
  expect(els.aspModalOk.textContent).toBe("Create test case")
  expect(els.aspModalCancel.disabled).toBe(false)
  expect(modal.getAttribute("aria-busy")).toBe("false")
  expect(inputs.map((i) => i.disabled)).toEqual([false, true, false])
})

test("submit wires the loading state and clears it on success and on error", () => {
  const submit = extract("openForm")
  expect(submit).toContain("setModalBusy(true, opts.busyLabel, opts.okLabel)")
  expect(submit).toContain("await opts.submit(vals); setModalBusy(false, '', opts.okLabel); closeModal()")
  expect(submit).toMatch(/catch \(e\) \{ setModalBusy\(false, '', opts\.okLabel\); \$\('aspModalErr'\)\.textContent = e\.message \}/)
})

test("the modal cannot be closed (Cancel / backdrop / Esc) while saving", () => {
  expect(asp).toContain("addEventListener('click', function () { if (!modalBusy) closeModal() })")
  expect(asp).toContain("if (e.target === bg && !modalBusy) closeModal()")
  expect(asp).toContain("bg.classList.contains('show') && !modalBusy) closeModal()")
})

test("test case form says 'Creating test case…' and waits for the list to refresh", () => {
  const form = extract("testCaseForm")
  expect(form).toContain("busyLabel: tc ? 'Saving…' : 'Creating test case…'")
  expect(form).toContain("await sync()")
  expect(asp).toContain("@keyframes asp-spin")
})
