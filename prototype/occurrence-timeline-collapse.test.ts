// The occurrence timeline is collapsed by default (with a one-line summary), identical repeats are grouped as one row with ×N, and
// "Copy timeline" reports the grouped text. A ticket re-reported many times (typically a Sim re-run) no longer pushes Activity off screen.
import { expect, test } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
function fn(src: string, sig: string) {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const api = new Function([fn(HTML, "function occGroups("), fn(HTML, "function occCopyBody("), "return { occGroups, occCopyBody }"].join("\n"))() as any
const day = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const D = 86400000, T0 = Date.UTC(2026, 9, 1)
const occ = (n: number, text: string, at: number, extra: any = {}) => Array.from({ length: n }, (_, i) => ({ observation: text, seenAt: at + i * 3600e3, screenshotId: null, ...extra }))

test("identical wording + screenshot collapses into one group, in first-seen order; different wording or screenshot stays separate", () => {
  const list = [...occ(4, "Checkout button does nothing", T0), { observation: "Page crashes on submit", seenAt: T0 + D, screenshotId: null }, ...occ(2, "Checkout button does nothing", T0 + 2 * D), { observation: "Checkout button does nothing", seenAt: T0 + 3 * D, screenshotId: "shot_x" }]
  const g = api.occGroups(list)
  expect(g.map((x: any) => x.items.length)).toEqual([6, 1, 1])
  expect(g[0].items[0].observation).toBe("Checkout button does nothing")
  expect(g[2].items[0].screenshotId).toBe("shot_x")                                    // same words, other screenshot → its own row
})
test("whitespace around the wording does not split a group; an empty list gives no groups", () => {
  expect(api.occGroups([{ observation: " same ", seenAt: 1 }, { observation: "same", seenAt: 2 }]).length).toBe(1)
  expect(api.occGroups([])).toEqual([]); expect(api.occGroups(undefined)).toEqual([])
})
test("Copy timeline: one line per group with the date range and ×N; a single entry keeps the plain format; the header counts every occurrence", () => {
  const groups = api.occGroups([...occ(3, "Checkout button does nothing", T0), ...occ(2, "Checkout button does nothing", T0 + 4 * D), { observation: "A different bug", seenAt: T0 + 6 * D }])
  const text = api.occCopyBody(groups, 6, day)
  expect(text.split("\n")[0]).toBe("This issue was reported 6 times:")
  expect(text).toContain('• 2026-10-01 → 2026-10-05 (×5): "Checkout button does nothing"')
  expect(text).toContain('• 2026-10-07: "A different bug"')
  expect(text.split("\n").length).toBe(3)
  // a group that all happened on one day shows just that day
  expect(api.occCopyBody(api.occGroups(occ(3, "x", T0)), 3, day)).toContain('• 2026-10-01 (×3): "x"')
})

test("the timeline starts collapsed, shows a summary line, remembers the choice, and the toggle only appears with 2+ occurrences", () => {
  const b = fn(HTML, "function buildOccurrenceTimeline(")
  expect(b).toContain('let occOpen = false')
  expect(b).toContain('localStorage.getItem("klav.occOpen") === "1"')
  expect(b).toContain('localStorage.setItem("klav.occOpen", occOpen ? "1" : "0")')
  expect(b).toContain('const has = occTotal >= 2')
  expect(b).toContain('listEl.classList.toggle("hide", !has || !occOpen)')
  expect(b).toContain('sumEl.classList.toggle("hide", !has || occOpen)')
  expect(b).toContain('"Reported " + occ.length + " times · first " + day(firstAt) + " · last " + day(lastAt)')
  expect(b).toContain('const groups = occGroups(occ)')
  expect(b).toContain("const text = copyBody")
  expect(HTML).toContain('<button class="tkt-occ-toggle" type="button" aria-expanded="false" hidden>Show</button>')
  expect(HTML).toContain('<div class="tkt-occ-sum muted hide"></div>')
})
test("a group has its own 'Show all N' control that reveals the individual entries (with their Split buttons)", () => {
  const b = fn(HTML, "function buildOccurrenceTimeline(")
  expect(b).toContain('class="tkt-occ-more"')
  expect(b).toContain('more.textContent = open ? "Hide" : "Show all " + g.items.length')
  expect(b).toContain("g.items.forEach(o => sub.appendChild(buildItem(o, true)))")
})
