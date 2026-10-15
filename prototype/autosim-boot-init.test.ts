// Opening the dashboard straight on #autosims (reload, bookmark, shared link) used to leave "+ New AutoSim" and the whole AutoSims view
// dead: the sidebar's setView('autosims') ran before window.initTrailsView existed, so its call was skipped and nothing called it again.
import { expect, test } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

const defIdx = HTML.indexOf("window.initTrailsView = function ()")
const bootLine = HTML.split(/\r?\n/).find((l) => l.includes("window.initTrailsView()") && l.includes("test(location.hash)"))

test("the AutoSims init is defined, idempotent, and wires the New AutoSim button", () => {
  expect(defIdx).toBeGreaterThan(0)
  const body = HTML.slice(defIdx, defIdx + 400)
  expect(body).toContain("if (_inited) return; _inited = true")
  expect(HTML).toContain('document.getElementById("newTrailBtn").addEventListener("click", openWizard)')
})
test("at page load the init is run when the URL is on #autosims, and only then — after the init function exists", () => {
  expect(bootLine).toBeTruthy()
  expect(HTML.indexOf(bootLine!)).toBeGreaterThan(defIdx)                     // placed after the definition, so it can actually call it
  let calls = 0
  const run = (hash: string) => {
    calls = 0
    const win: any = { initTrailsView: () => { calls++ } }
    new Function("location", "window", "console", bootLine!.trim())({ hash }, win, console)
    return calls
  }
  expect(run("#autosims")).toBe(1)
  expect(run("#autosims/abc")).toBe(1)
  expect(run("#tickets")).toBe(0)
  expect(run("")).toBe(0)
  expect(run("#autosimsx")).toBe(0)                                            // not a prefix match on a different view
})
test("an init that throws is reported, not swallowed silently, and does not break the rest of the page", () => {
  const win: any = { initTrailsView: () => { throw new Error("boom") } }
  let logged = 0
  expect(() => new Function("location", "window", "console", bootLine!.trim())({ hash: "#autosims" }, win, { error: () => { logged++ } })).not.toThrow()
  expect(logged).toBe(1)
})
