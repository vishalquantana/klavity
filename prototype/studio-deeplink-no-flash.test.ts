// KD-1458: on the Sim profile, "Open in Studio" opens the Sims Studio page and "Edit" opens the Sim's
// edit view (/app?sim=<id>). That deep link used to render the funnel first and only swap to the edit
// view once /api/personas returned, so the funnel flashed for a moment.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/index.html").text()
const PROFILE = await Bun.file(import.meta.dir + "/public/sim-profile.html").text()

test("Sim profile: Open in Studio → Studio page, Edit → the Sim's edit view", () => {
  expect(PROFILE).toContain("const studioUrl = pq('/app')")
  expect(PROFILE).toContain("const editUrl = pq('/app?sim=' + encodeURIComponent(SIM_ID))")
  expect(PROFILE).toMatch(/href="\$\{studioUrl\}">\$\{ic\('sparkles'\)\} Open in Studio/)
  expect(PROFILE).toMatch(/href="\$\{editUrl\}"[^>]*>\$\{ic\('pencil'\)\} Edit</)
})

test("a ?sim= deep link hides the funnel before first paint", () => {
  const wrapIdx = HTML.indexOf('<div class="wrap">')
  const headIdx = HTML.indexOf('<div class="head">', wrapIdx)
  const early = HTML.slice(wrapIdx, headIdx)
  expect(early).toContain('get("sim")')
  expect(early).toContain('classList.add("ss-active", "ss-pending")')
  expect(HTML).toContain('.wrap.ss-pending::after{content:"Loading Sim…"')
})

test("the ?sim= edit view is titled 'Sims Edit', and falls back to 'Sims Studio'", () => {
  expect(HTML).toContain('<h1 id="appTitle">Klavity · Sims Studio</h1>')
  const h1Idx = HTML.indexOf('<h1 id="appTitle">')
  const after = HTML.slice(h1Idx, HTML.indexOf("</script>", h1Idx))
  expect(after).toContain('classList.contains("ss-pending")')
  expect(after).toContain('"Klavity · Sims Edit"')
  const cancel = HTML.match(/function ssCancelPending\(\) \{[\s\S]*?\n\}/)
  expect(cancel![0]).toContain("'Klavity · Sims Studio'")
})

test("switching project from the Sim edit view stays in the edit view", () => {
  const fn = HTML.match(/sel\.onchange = async \(\) => \{[\s\S]*?\n  \}/)
  expect(fn).not.toBeNull()
  expect(fn![0]).toContain("if (studioSimId())")
  expect(fn![0]).toContain('fetch("/api/personas?project=" + encodeURIComponent(pid))')
  expect(fn![0]).toContain('location.href = "/app?sim=" + encodeURIComponent(first.id) + "&project=" + encodeURIComponent(pid)')
  // no Sims / failed lookup / not on the edit view → the project's Studio page, as before
  expect(fn![0]).toContain('location.href = "/app?project=" + encodeURIComponent(pid)')
})

test("rendering the Studio clears the placeholder", () => {
  const fn = HTML.match(/function renderStudio\(sim\) \{[\s\S]*?\n\}/)
  expect(fn).not.toBeNull()
  expect(fn![0]).toContain("wrap.classList.remove('ss-pending')")
})

test("every path that can't show the Sim falls back to the funnel", () => {
  const fn = HTML.match(/async function loadSavedSims\(\) \{[\s\S]*?\n\}/)
  expect(fn).not.toBeNull()
  // fetch failed, no personas, target not found, thrown error
  expect(fn![0].match(/ssCancelPending\(\)/g)?.length).toBe(4)
})
