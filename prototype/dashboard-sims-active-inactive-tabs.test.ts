// KD-2863: the Sims page separates Active and Inactive Sims into tabs. The pure logic (split, default tab, tab markup)
// is extracted from dashboard.html and executed; the wiring is asserted on source (like the other dashboard-*.test.ts guards).
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

function extractFn(src: string, marker: string): string {
  const i = src.indexOf(marker)
  if (i < 0) throw new Error("marker not found: " + marker)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + marker)
}

const logic: any = new Function(
  ["function simsSplit", "function simsTabResolve", "function simsTabsHtml", "function simsTabEmptyHtml"].map((m) => extractFn(HTML, m)).join("\n") +
  "; return { simsSplit, simsTabResolve, simsTabsHtml, simsTabEmptyHtml }",
)()

test("split: active !== false is active (a missing flag counts as active), false is inactive", () => {
  const r = logic.simsSplit([{ id: "a" }, { id: "b", active: true }, { id: "c", active: false }])
  expect(r.active.map((s: any) => s.id)).toEqual(["a", "b"])
  expect(r.inactive.map((s: any) => s.id)).toEqual(["c"])
  expect(logic.simsSplit(undefined)).toEqual({ active: [], inactive: [] })
})

test("default tab: Active, unless nothing is active but something is inactive", () => {
  expect(logic.simsTabResolve(null, 3, 2)).toBe("active")
  expect(logic.simsTabResolve(null, 0, 2)).toBe("inactive")
  expect(logic.simsTabResolve(null, 0, 0)).toBe("active")
})

test("a tab the user picked is kept, even when it is empty", () => {
  expect(logic.simsTabResolve("active", 0, 2)).toBe("active")
  expect(logic.simsTabResolve("inactive", 3, 0)).toBe("inactive")
})

test("tab markup: tablist, two tabs with counts, the selected one marked", () => {
  const h = logic.simsTabsHtml("inactive", 4, 2)
  expect(h).toContain('role="tablist"')
  expect(h).toContain('data-sims-tab="active"')
  expect(h).toContain('data-sims-tab="inactive"')
  expect(h).toMatch(/Active <span class="t3-tabc">4<\/span>/)
  expect(h).toMatch(/Inactive <span class="t3-tabc">2<\/span>/)
  expect(h).toMatch(/class="t3-tab on" role="tab" id="simsTab-inactive" aria-selected="true"/)
  expect(h).toMatch(/class="t3-tab" role="tab" id="simsTab-active" aria-selected="false"/)
})

test("the tab counts use the same pill look as the 'Your Sims' count (grey rounded badge, mono 11px bold)", () => {
  const yours = HTML.slice(HTML.indexOf(".sims-hero h2 .count {"), HTML.indexOf(".sims-hero h2 .count {") + 200)
  const tabs = HTML.slice(HTML.indexOf(".sims-tabs .t3-tabc {"), HTML.indexOf(".sims-tabs .t3-tabc {") + 260)
  for (const css of [yours, tabs]) { expect(css).toContain("font-size: 11px"); expect(css).toContain("font-weight: 600") }
  expect(tabs).toContain("background: var(--ink-3)")
  expect(tabs).toContain("border-radius: 20px")
  expect(tabs).toContain("padding: 2px 9px")           // same padding as the header count
})

test("empty states say what to do", () => {
  expect(logic.simsTabEmptyHtml("active")).toContain("No active Sims — activate one from the Inactive tab.")
  expect(logic.simsTabEmptyHtml("inactive")).toContain("No inactive Sims.")
})

test("wiring: renderSimsFeed renders only the selected tab's Sims, reusing the existing tab styles", () => {
  const f = extractFn(HTML, "function renderSimsFeed()")
  expect(f).toContain("simsSplit(sims)")
  expect(f).toContain("simsTabResolve(_simsTabPref")
  expect(f).toContain("const shown = split[tab]")
  expect(f).toContain("shown.map(sim =>")
  expect(f).not.toContain("sims.map(sim =>")          // no longer lists every Sim in one flat list
  expect(logic.simsTabsHtml("active", 1, 1)).toContain('class="t3-tabs sims-tabs"')   // the existing .t3-tabs component
})

test("wiring: the header total, the onboarding empty state and the Activate/Deactivate controls are unchanged", () => {
  const f = extractFn(HTML, "function renderSimsFeed()")
  expect(f).toContain('countEl.textContent = sims.length ? String(sims.length) : ""')
  expect(f).toContain("Bring your first Sim to life")
  expect(f).toContain("toggleSimActive(")
  expect(f).toContain("simExecButtonHtml(sim)")
})

test("wiring: picking a tab is remembered for the session and re-renders; arrow keys switch tabs", () => {
  const s = extractFn(HTML, "function setSimsTab(")
  expect(s).toContain('sessionStorage.setItem("klav:simsTab", tab)')
  expect(s).toContain("renderSimsFeed()")
  expect(extractFn(HTML, "function simsTabKey(")).toContain("ArrowLeft")
})

test("a Deactivate/Activate re-renders the feed, so the card moves to the other tab at once", () => {
  const opt = extractFn(HTML, "function applySimActiveOptimistic")
  expect(opt.indexOf("sim.active = !!makeActive")).toBeGreaterThan(-1)
  expect(opt.indexOf("renderSimsFeed()")).toBeGreaterThan(opt.indexOf("sim.active = !!makeActive"))
})
