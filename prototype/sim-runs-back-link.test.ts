// Sim Runs page: a visible "← Back" link (bug: no back navigation). It goes back to the Klavity page the user
// came from, and falls back to the Sims tab of the same project when opened directly.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "sim-runs.html"), "utf8").replace(/\r\n/g, "\n")
const script = HTML.slice(HTML.indexOf("<script>\nfunction $(id)") + "<script>".length, HTML.indexOf("</script>", HTML.indexOf("<script>\nfunction $(id)")))

test("the back link sits above the Sim Runs heading", () => {
  const back = HTML.indexOf('id="pageBack"'), h1 = HTML.indexOf("<h1>Sim Runs</h1>")
  expect(back).toBeGreaterThan(-1)
  expect(back).toBeLessThan(h1)
  expect(HTML.slice(back, h1)).toContain("&larr; Back")
})

// Run the page's own back-link code against a tiny fake DOM.
function run(opts: { project?: string; referrer: string; historyLength?: number }) {
  const els: Record<string, any> = {}
  const mk = (id: string) => (els[id] = { id, attrs: {} as Record<string, string>, listeners: {} as Record<string, Function>,
    setAttribute(k: string, v: string) { this.attrs[k] = v }, addEventListener(t: string, f: Function) { this.listeners[t] = f } })
  mk("simsBack"); mk("pageBack")
  const document = { getElementById: (id: string) => els[id] || null, referrer: opts.referrer }
  const location = { origin: "https://klavity.in", pathname: "/sim-runs", search: opts.project ? "?project=" + opts.project : "" }
  let wentBack = 0
  const history = { length: opts.historyLength ?? 2, back: () => { wentBack++ } }
  // Only the helpers + back-link block are needed; stop before the page's data loading starts.
  const end = script.indexOf("// KLAVITYKLA-371")
  const pre = script.slice(0, end) + script.slice(script.indexOf('(function(){\n  var b=$("pageBack")'), script.indexOf("})();", script.indexOf('var b=$("pageBack")')) + 5)
  new Function("document", "location", "history", "URLSearchParams", "URL", pre)(document, location, history, URLSearchParams, URL)
  const click = () => { let prevented = false; els.pageBack.listeners.click({ preventDefault: () => { prevented = true }, button: 0 }); return prevented }
  return { href: els.pageBack.attrs.href, click, wentBack: () => wentBack }
}

test("falls back to the Sims tab on the same project", () => {
  const r = run({ project: "proj_1", referrer: "" })
  expect(r.href).toBe("/dashboard?project=proj_1#sims")
  expect(r.click()).toBe(false) // plain link navigation
  expect(r.wentBack()).toBe(0)
})

test("came from a Klavity page (e.g. a ticket) → goes back there", () => {
  const r = run({ project: "proj_1", referrer: "https://klavity.in/vishal-s-workspace/KD-996" })
  expect(r.click()).toBe(true)
  expect(r.wentBack()).toBe(1)
})

test("referrer is another site, or this same page after a project switch → uses the Sims link", () => {
  expect(run({ referrer: "https://example.com/x" }).click()).toBe(false)
  expect(run({ referrer: "https://klavity.in/sim-runs?project=proj_2" }).click()).toBe(false)
})
