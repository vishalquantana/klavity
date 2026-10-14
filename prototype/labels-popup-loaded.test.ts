import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// KD-233: the Tickets toolbar "Labels" popup showed "No labels yet" for a project that has labels.
// Root cause: project labels live on `state._labels` (loaded once by loadLabels), but every dashboard refresh
// (the background poll, any refresh after a change) replaces `state` with the /api/dashboard payload, which has
// no labels — and nothing reloaded them. Also: opening the popup before the first load finished, or after a failed
// load, showed the same empty message for good.
const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")
const fnSrc = (name: string) => {
  const start = html.indexOf(`function ${name}(`)
  let depth = 0, i = html.indexOf("{", start)
  for (; i < html.length; i++) { if (html[i] === "{") depth++; else if (html[i] === "}" && --depth === 0) break }
  return html.slice(start, i + 1)
}
const carry = new Function(fnSrc("carryClientOnlyState") + "\nreturn carryClientOnlyState")()

test("a dashboard refresh keeps the loaded labels for the same project", () => {
  const labels = [{ id: "lbl_1", name: "Bug" }]
  const prev = { active: { id: "proj_a" }, _labels: labels, _labelsPid: "proj_a" }
  const next: any = { active: { id: "proj_a" } }
  carry(next, prev)
  expect(next._labels).toBe(labels)
  expect(next._labelsPid).toBe("proj_a")
})

test("…but never carries one project's labels onto another project", () => {
  const next: any = { active: { id: "proj_b" } }
  carry(next, { active: { id: "proj_a" }, _labels: [{ id: "x" }], _labelsPid: "proj_a" })
  expect(next._labels).toBeUndefined()
  const fresh: any = { active: { id: "proj_a" } }
  carry(fresh, null)   // cold boot: nothing to carry
  expect(fresh._labels).toBeUndefined()
})

test("both places that swap in a fresh dashboard payload carry the labels first", () => {
  // load() and refreshAll(): the carry runs right before `state = data` in each
  const swaps = html.match(/carryClientOnlyState\(data, state\)[^\n]*(\n\s*)?state = data/g) || []
  expect(swaps.length).toBe(2)
})

test("the popup loads labels when they aren't loaded yet, shows Loading / Retry, and repaints when they land", () => {
  const open = fnSrc("openManageLabels")
  expect(open).toContain("if (!labelsLoadedForActive()) loadLabels()")
  const list = fnSrc("renderMlList")
  expect(list.indexOf("if (!labelsLoadedForActive()) {")).toBeLessThan(list.indexOf("No labels yet. Add one below."))
  expect(list).toContain("Loading labels…")
  expect(list).toContain("Couldn\\'t load labels.")
  const loadNow = fnSrc("_loadLabelsNow")
  expect(loadNow).toContain("if (isManageLabelsOpen()) renderMlList()")
  expect(loadNow).toContain("window.__klavSubLoaded.labels = false") // a failed load can be retried later
})
