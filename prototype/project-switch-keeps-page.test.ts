// KD-179: switching project from the top dropdown keeps the page the user is on (Tickets, Reports, Recurring…) instead of
// dropping them on Overview. The switch is a full reload, so the current #view has to ride along in the URL.
import { expect, test } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
function extractFn(src: string, sig: string) {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const projSwitchUrl = new Function(extractFn(HTML, "function projSwitchUrl(") + "; return projSwitchUrl")() as () => (id: string, hash: string) => string
const url = projSwitchUrl as unknown as (id: string, hash: string) => string

test("keeps the current view when switching project", () => {
  expect(url("proj_2", "#tickets")).toBe("/dashboard?project=proj_2#tickets")
  expect(url("proj_2", "#recurring")).toBe("/dashboard?project=proj_2#recurring")
  expect(url("proj_2", "#pagebugs")).toBe("/dashboard?project=proj_2#pagebugs")
})
test("keeps only the view name — a ticket id or sub-path belongs to the old project", () => {
  expect(url("proj_2", "#tickets/fb_123")).toBe("/dashboard?project=proj_2#tickets")
  expect(url("proj_2", "#triage/fb_9")).toBe("/dashboard?project=proj_2#triage")
  expect(url("proj_2", "#sims/new")).toBe("/dashboard?project=proj_2#sims")
})
test("no hash, an unknown hash or junk falls back to the plain project URL (Overview)", () => {
  expect(url("proj_2", "")).toBe("/dashboard?project=proj_2")
  expect(url("proj_2", "#nope")).toBe("/dashboard?project=proj_2")
  expect(url("proj_2", "#")).toBe("/dashboard?project=proj_2")
})
test("the project id is URL-encoded", () => {
  expect(url("a b&c", "#tickets")).toBe("/dashboard?project=a%20b%26c#tickets")
})
test("the dropdown uses it when a project is chosen", () => {
  expect(HTML).toContain("location.href = projSwitchUrl(p.id, location.hash)")
})
