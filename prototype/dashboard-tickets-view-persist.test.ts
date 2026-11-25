// KD-3146: refreshing the Tickets page in List view must stay in List view (it used to fall back to Board,
// because the choice only lived in memory). Saved in the URL (?tview=list) and in this browser.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extract(name: string) {
  const start = html.indexOf("function " + name + "(")
  let i = html.indexOf("{", start), depth = 0
  for (; i < html.length; i++) { if (html[i] === "{") depth++; else if (html[i] === "}" && --depth === 0) break }
  return html.slice(start, i + 1)
}
const store = (init: Record<string, string> = {}) => ({ d: { ...init }, getItem(k: string) { return k in this.d ? this.d[k] : null }, setItem(k: string, v: string) { this.d[k] = v } })
const saved = (ls: any) => new Function("localStorage", `const TKT_VIEW_KEY = "klav.tktView"\n${extract("savedTktView")}\nreturn savedTktView`)(ls) as (sp: URLSearchParams) => string

test("restores List from the URL, else from this browser, else Board", () => {
  expect(saved(store())(new URLSearchParams("tview=list"))).toBe("list")
  expect(saved(store({ "klav.tktView": "list" }))(new URLSearchParams(""))).toBe("list")
  expect(saved(store({ "klav.tktView": "list" }))(new URLSearchParams("tview=board"))).toBe("board") // URL wins
  expect(saved(store())(new URLSearchParams(""))).toBe("board")
  expect(saved(store({ "klav.tktView": "junk" }))(new URLSearchParams("tview=junk"))).toBe("board")
})

test("switching views saves the choice (browser + URL); loading restores it before the view is drawn", () => {
  const set = extract("setTktView")
  expect(set).toContain('localStorage.setItem(TKT_VIEW_KEY, _tktView)')
  expect(set).toContain('u.searchParams.set("tview", "list")')
  expect(html).toContain('listBtn.addEventListener("click", () => { setTktView("list");')
  expect(html).toMatch(/boardBtn\.addEventListener\("click", \(\) => \{\s*\n\s*setTktView\("board"\)/)
  expect(extract("loadTicketFiltersFromUrl")).toContain("_tktView = savedTktView(sp)")
  // the toggle buttons show the restored view
  expect(html).toContain('if (listBtn) listBtn.classList.toggle("active", _tktView === "list")')
  // filter changes rewrite the URL but keep ?tview=list
  expect(extract("syncTicketFiltersToUrl")).toContain('if (_tktView === "list") u.searchParams.set("tview", "list")')
  // the setup that restores the view runs before renderTicketsView picks Board or List
  const render = extract("renderTicketsView")
  expect(render.indexOf("tktFilterBarBind()")).toBeLessThan(render.indexOf('if (_tktView === "list")'))
})
