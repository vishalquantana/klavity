// A ticket created without a description (manual ticket, empty body) stores no description. The ticket page used to hide the whole
// Description block for it, so there was nothing to click to add one later. It now always shows the block in the single-ticket
// view, with an "Add a description…" prompt that opens the normal editor.
import { expect, test } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
function extractFn(src: string, sig: string) {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const api = new Function(
  "linkifyDescription", "kicon",
  [extractFn(HTML, "function descObsInner("), extractFn(HTML, "function renderDescObs("), extractFn(HTML, "function descriptionBlockHtml(")].join("\n")
  + "\nreturn { descObsInner, renderDescObs, descriptionBlockHtml }",
)((t: string) => "<linked>" + t + "</linked>", () => "<i/>") as any

test("a blank description renders the 'Add a description…' prompt; real text renders as before", () => {
  for (const blank of [null, undefined, "", "   ", "\n"]) expect(api.descObsInner(blank)).toContain("Add a description")
  expect(api.descObsInner("The button does nothing")).toBe("<linked>The button does nothing</linked>")
})
test("the block is marked empty (so the pencil stays visible) only when there is no text", () => {
  expect(api.descriptionBlockHtml("")).toContain('class="tkt-desc tkt-desc-empty"')
  expect(api.descriptionBlockHtml(null)).toContain("tkt-desc-empty")
  expect(api.descriptionBlockHtml("text")).toContain('class="tkt-desc"')
  expect(api.descriptionBlockHtml("text")).not.toContain("tkt-desc-empty")
  expect(api.descriptionBlockHtml("")).toContain('class="tkt-desc-edit"')           // the edit pencil is always there
})
test("renderDescObs repaints the text and keeps the empty-state class in sync (saving fills it, clearing empties it)", () => {
  const classes = new Set<string>(["tkt-desc-empty"])
  const box = { classList: { toggle: (c: string, on: boolean) => { on ? classes.add(c) : classes.delete(c) } } }
  const obs: any = { innerHTML: "", closest: (sel: string) => (sel === ".tkt-desc" ? box : null) }
  api.renderDescObs(obs, "Added later")
  expect(obs.innerHTML).toBe("<linked>Added later</linked>"); expect(classes.has("tkt-desc-empty")).toBe(false)
  api.renderDescObs(obs, "")
  expect(obs.innerHTML).toContain("Add a description"); expect(classes.has("tkt-desc-empty")).toBe(true)
  api.renderDescObs(null, "x")                                                         // no element: no throw
})
test("wiring: the single-ticket view shows the Description block for a ticket with no description", () => {
  expect(HTML).toContain('|| (isSingle && !String(t.observation == null ? "" : t.observation).trim())')
  expect(HTML).toContain("${descObsInner(raw)}")
  expect(HTML).toContain(".tkt-desc-empty .tkt-desc-edit {")
})
