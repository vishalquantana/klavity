// KD-2876: in "Add a Sim" (Describe tab) the example/brief path and manual Sim definition are mutually exclusive.
// Manual hides the brief input + example chips (with a way back); picking an example never leaves a manual card behind.
// showBriefStep is extracted from dashboard.html and run against a tiny fake DOM; the rest is asserted on source (like the other
// dashboard-*.test.ts guards).
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

function fakeDom() {
  const mk = (extra: any = {}) => ({ hidden: false, value: "", textContent: "", innerHTML: "", dataset: {} as any, classList: { toggle() { }, add() { }, remove() { }, contains: () => false }, focus() { }, ...extra })
  const els: Record<string, any> = {}
  for (const id of ["smBriefStep", "smNameStep", "smManualBar", "smBrief", "smName", "smDescTxt", "simHd", "simSub"]) els[id] = mk()
  const out = mk({ innerHTML: "<div class=sm-sim>manual card</div>" })
  const ov = mk({ classList: { toggle() { }, contains: () => false, add() { }, remove() { } } })
  const showBriefStep = new Function("$", "out", "ov", "setTimeout", extractFn(HTML, "function showBriefStep") + "; return showBriefStep")((id: string) => els[id], out, ov, () => { })
  return { els, out, showBriefStep }
}

test("markup: a back bar sits in the Describe pane, hidden by default, with a clear label", () => {
  expect(HTML).toMatch(/<div class="sm-manual-bar" id="smManualBar" hidden>[^]*?id="smManualBack">← Use an example instead<\/button>/)
})

test("manual button hides the brief input + example chips, forgets any typed brief, and shows the way back", () => {
  const i = HTML.indexOf("smManualBtn.onclick = function () {")
  const body = HTML.slice(i, HTML.indexOf("showSims([customSim])", i))
  expect(body).toContain('$("smBrief").value = ""')
  expect(body).toContain('$("smBriefStep").hidden = true')
  expect(body).toContain('$("smManualBar").hidden = false')
})

test("back link and the Name step's own Back both return to the example step", () => {
  expect(HTML).toContain('$("smManualBack").onclick = () => showBriefStep("brief")')
  expect(HTML).toContain('$("smNameBack").onclick = () => showBriefStep("brief")')
})

test("showBriefStep('brief'): example step visible, manual bar hidden, any manual card cleared", () => {
  const { els, out, showBriefStep } = fakeDom()
  els.smBriefStep.hidden = true; els.smManualBar.hidden = false
  showBriefStep("brief")
  expect(els.smBriefStep.hidden).toBe(false)
  expect(els.smManualBar.hidden).toBe(true)
  expect(out.innerHTML).toBe("")
})

test("showBriefStep('name') (an example was chosen): no manual card or manual bar is left behind", () => {
  const { els, out, showBriefStep } = fakeDom()
  els.smManualBar.hidden = false; els.smBrief.value = "A first-time visitor evaluating us in 2 minutes"
  showBriefStep("name")
  expect(els.smBriefStep.hidden).toBe(true)
  expect(els.smNameStep.hidden).toBe(false)
  expect(els.smManualBar.hidden).toBe(true)
  expect(out.innerHTML).toBe("")
  expect(els.smDescTxt.textContent).toBe("A first-time visitor evaluating us in 2 minutes")
})

test("opening the modal and switching tabs both leave manual mode", () => {
  expect(HTML).toContain('$("smBriefStep").hidden = false; $("smManualBar").hidden = true; $("smNameStep").hidden = true;')
  expect(HTML).toContain('if (!$("smManualBar").hidden) showBriefStep("brief")')
})
