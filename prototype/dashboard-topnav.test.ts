// Top-nav redesign: left actions [Snap Reports][Sims Studio][Create New ⌄] · centered project dropdown ·
// right tools [theme ☀|☾][Inbox][tour][avatar]. Behavioral tests run the REAL theme script / avatar menu / switcher
// footer logic from public/dashboard.html against a fake DOM; the rest are structure pins.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extractFn(src: string, sig: string): string {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const barStart = HTML.indexOf('<div class="bar"><div class="bar-in">'), barEnd = HTML.indexOf('</div></div>\n\n<div class="wrap">', barStart)
const BAR = HTML.slice(barStart, barEnd)
const at = (needle: string) => { const i = BAR.indexOf(needle); if (i < 0) throw new Error("missing in nav: " + needle); return i }

// ── structure ────────────────────────────────────────────────────────────────────────────────────────────────────────
test("layout order: left actions → centered project → right tools", () => {
  const left = at('<div class="bar-left">'), center = at('<div class="bar-center">'), right = at('<div class="right">')
  expect(left).toBeLessThan(center); expect(center).toBeLessThan(right)
  const order = ["snapNavBtn", "studioNavBtn", "createBtn", "projComboBtn", "themeToggle", "inboxNavBtn", "tourBtn", "avatarBtn"].map(id => at('id="' + id + '"'))
  expect([...order].sort((a, b) => a - b)).toEqual(order)                  // strictly left→right in source order
  expect(HTML).toContain(".bar-in{display:grid;grid-template-columns:1fr auto 1fr;")   // 3 columns keep the project truly centered
})

test("'Snap Reports' opens the sidebar's Reports view; Sims Studio is the existing link, unchanged", () => {
  expect(BAR).toContain('id="snapNavBtn"')
  expect(BAR).toContain("setView('pagebugs')")                              // the sidebar item labelled "Reports" is data-go="pagebugs"
  expect(BAR).not.toContain("setView('snap')")
  expect(BAR).toContain('<span class="nav-snap-lbl">Snap Reports</span>')
  expect(HTML).toMatch(/<button class="nv" data-go="pagebugs">[\s\S]*?Reports<\/button>/)   // …and that sidebar item really is "Reports"
  expect(BAR).toContain('<a class="nav-studio mi" href="/app" id="studioNavBtn"')
  expect(BAR).toContain('<span class="nav-studio-lbl">Sims Studio</span>')
  expect(BAR).not.toContain("Report widget")                                // the old amber "Report widget" button is replaced
})

test("Create New menu: Ticket, Sim (admins only), AutoSim — each with an icon", () => {
  expect(BAR).toContain('<span class="create-lbl">Create New</span>')
  expect(BAR).toMatch(/id="createItemTicket"[^>]*><span class="ci-ic" data-ki="ticket"/)
  expect(BAR).toMatch(/class="create-item hide" id="createItemSim"[^>]*><span class="ci-ic" data-ki="users"/)
  expect(BAR).toMatch(/class="create-item" id="createItemAutoSim"[^>]*><span class="ci-ic" data-ki="zap"/)
  expect(extractFn(HTML, "function wireCreateMenu(")).toContain('bind("createItemAutoSim"')
})

test("project dropdown: selected project button, search, list, divider and a '+ New project' footer row (admins only)", () => {
  expect(BAR).toContain('id="projComboName"')                               // shows the selected project
  expect(BAR).toContain('placeholder="Search projects…"')
  expect(BAR).toMatch(/id="projComboList"[\s\S]*id="projNewDiv"[\s\S]*id="projNewRow"/)   // list, then divider, then footer row
  expect(BAR).toContain('<button class="proj-new-row hide" id="projNewRow"')   // hidden until the user is an admin
  expect(BAR).toContain('id="projNewBtn"')                                   // legacy button stays in the DOM (existing wiring) …
  expect(HTML).toContain(".bar .proj-new-btn{display:none}")                 // … but is never shown
  const sw = extractFn(HTML, "function renderSwitcher(")
  expect(sw).toContain('row.classList.toggle("hide", !isAdmin)')
  expect(sw).toContain('div.classList.toggle("hide", !isAdmin)')
  expect(sw).toContain("openNewProject()")                                   // same modal as before
})

test("right tools: theme toggle, then the Inbox icon button right beside it, then tour, then avatar; Inbox is icon-only", () => {
  const theme = at('id="themeToggle"'), inbox = at('id="inboxNavBtn"'), tour = at('id="tourBtn"'), avatar = at('id="avatarBtn"')
  expect(theme).toBeLessThan(inbox); expect(inbox).toBeLessThan(tour); expect(tour).toBeLessThan(avatar)
  expect(BAR.slice(theme, inbox)).not.toContain("<button class=\"nav-icon\"")   // nothing wedged between the theme toggle and Inbox
  expect(BAR).toContain('<a class="nav-inbox mi" href="/inbox" id="inboxNavBtn" aria-label="Cross-project inbox')
  expect(BAR).not.toContain('<span class="nav-inbox-lbl">')                  // no text label next to the icon
  // compact rounded square (same scale as the 30px avatar): #fff background with a #AEA8A2 tray icon
  expect(HTML).toContain(".bar .nav-inbox{width:30px;height:30px;padding:0;justify-content:center;gap:0;border-radius:8px;background:#fff;color:#AEA8A2;border:0;box-shadow:none}")
  expect(HTML).toContain(".bar .nav-inbox svg{width:14px;height:14px;stroke-width:1.75}")
  expect(HTML).toContain(".avatar-btn{width:30px;height:30px;")
})

test("account menu keeps #who and #logout (existing wiring), now inside the avatar menu", () => {
  const menu = BAR.slice(at('id="avatarMenu"'))
  expect(menu).toContain('id="who"')
  expect(menu).toContain('id="logout"')
  expect(HTML).toContain('$("logout").onclick = async () => {')               // logout handler untouched
  expect(HTML).toContain('$("who").textContent = state.email')
  expect(HTML).toContain('ai.textContent = String(state.email || "?").trim().charAt(0).toUpperCase()')   // the initial in the circle
})

test("dark mode keeps the indigo buttons readable (dark text on the lightened indigo, ≥ 4.5:1)", () => {
  expect(HTML).toContain('[data-theme="dark"] .bar .nav-studio,[data-theme="dark"] .avatar-btn{color:#0c0a08}')
  // contrast of #0c0a08 on the dark theme's indigo rgb(139,139,245)
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
  const L = (r: number, g: number, b: number) => 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  const a = L(12, 10, 8), b = L(139, 139, 245)
  expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toBeGreaterThanOrEqual(4.5)
})

// ── real theme script ────────────────────────────────────────────────────────────────────────────────────────────────
function themeHarness(startDark: boolean) {
  const m = HTML.match(/<script>(\(function\(\)\{var g=document\.getElementById\('themeToggle'\);[^\n]*)<\/script>/)
  if (!m) throw new Error("theme script not found")
  const store: Record<string, string> = {}
  const attrs: Record<string, string> = startDark ? { "data-theme": "dark" } : {}
  const root = { getAttribute: (k: string) => (k in attrs ? attrs[k] : null), setAttribute: (k: string, v: string) => { attrs[k] = v }, removeAttribute: (k: string) => { delete attrs[k] } }
  const mkBtn = (v: string) => { const a: Record<string, string> = { "data-theme-set": v }; return { innerHTML: "", getAttribute: (k: string) => a[k] ?? null, setAttribute: (k: string, x: string) => { a[k] = x }, a } }
  const light = mkBtn("light"), dark = mkBtn("dark")
  let listener: Function = () => {}
  const group: any = { querySelectorAll: () => [light, dark], addEventListener: (_t: string, f: Function) => { listener = f } }
  new Function("document", "kicon", "localStorage", m[1])(
    { getElementById: (id: string) => (id === "themeToggle" ? group : null), documentElement: root }, (n: string) => "<svg data-i=" + n + "></svg>",
    { setItem: (k: string, v: string) => { store[k] = v } })
  const click = (btn: any) => listener({ target: { closest: () => btn } })
  return { light, dark, attrs, store, click }
}
test("theme toggle: two icon buttons (sun | moon); the active one is aria-pressed; clicking switches theme and persists it", () => {
  const t = themeHarness(false)
  expect(t.light.innerHTML).toContain("data-i=sun"); expect(t.dark.innerHTML).toContain("data-i=moon")
  expect([t.light.a["aria-pressed"], t.dark.a["aria-pressed"]]).toEqual(["true", "false"])   // light is active initially
  t.click(t.dark)
  expect(t.attrs["data-theme"]).toBe("dark"); expect(t.store["klav-theme"]).toBe("dark")
  expect([t.light.a["aria-pressed"], t.dark.a["aria-pressed"]]).toEqual(["false", "true"])
  t.click(t.light)
  expect(t.attrs["data-theme"]).toBeUndefined(); expect(t.store["klav-theme"]).toBe("light")
  expect([t.light.a["aria-pressed"], t.dark.a["aria-pressed"]]).toEqual(["true", "false"])
})
test("theme toggle starts in the right state when the page is already dark; clicks outside the buttons do nothing", () => {
  const t = themeHarness(true)
  expect([t.light.a["aria-pressed"], t.dark.a["aria-pressed"]]).toEqual(["false", "true"])
  const before = JSON.stringify(t.attrs)
  const g = (t as any); g.click(null)                                        // a click on the group's padding (no button)
  expect(JSON.stringify(t.attrs)).toBe(before)
})

// ── real avatar menu ─────────────────────────────────────────────────────────────────────────────────────────────────
test("avatar menu: click toggles, Esc closes and refocuses the avatar, outside click closes, wiring is idempotent", () => {
  const listeners: Record<string, Function[]> = {}
  const mk = (cls = "") => { const set = new Set(cls.split(" ").filter(Boolean)); const a: Record<string, string> = {}; const l: Record<string, Function[]> = {}
    return { set, a, l, focused: 0, classList: { add: (c: string) => set.add(c), remove: (c: string) => set.delete(c), contains: (c: string) => set.has(c) },
      setAttribute: (k: string, v: string) => { a[k] = v }, getAttribute: (k: string) => a[k] ?? null, focus() { this.focused++ },
      addEventListener: (t: string, f: Function) => { (l[t] ||= []).push(f) }, contains(o: any) { return o === this } } }
  const btn: any = mk(), menu: any = mk("avatar-menu hide")
  const doc: any = { getElementById: (id: string) => (id === "avatarBtn" ? btn : id === "avatarMenu" ? menu : null), addEventListener: (t: string, f: Function) => { (listeners[t] ||= []).push(f) } }
  const wire = new Function("document", extractFn(HTML, "function wireAvatarMenu(") + "\nreturn wireAvatarMenu")(doc) as () => void
  wire(); wire()
  expect(listeners["click"].length).toBe(1)                                   // idempotent
  btn.l["click"].forEach((f: Function) => f({ target: btn, stopPropagation() {} }))
  expect(menu.set.has("hide")).toBe(false); expect(btn.a["aria-expanded"]).toBe("true")
  listeners["keydown"].forEach(f => f({ key: "Escape", preventDefault() {} }))
  expect(menu.set.has("hide")).toBe(true); expect(btn.focused).toBe(1)
  btn.l["click"].forEach((f: Function) => f({ target: btn, stopPropagation() {} }))     // reopen
  listeners["click"].forEach(f => f({ target: { elsewhere: true } }))                  // outside click
  expect(menu.set.has("hide")).toBe(true)
})

// ── project switcher footer row (the real renderSwitcher block, run against a fake DOM) ─────────────────────────────
test("renderSwitcher: '+ New project' row and its divider are shown to admins only, and open the new-project modal", () => {
  const sw = extractFn(HTML, "function renderSwitcher(")
  const run = (role: string | null) => {
    const els: Record<string, any> = {}
    const mk = (id: string) => (els[id] ||= { id, textContent: "", cls: new Set<string>(["hide"]), onclick: null as any, dataset: {},
      classList: { toggle(c: string, on: boolean) { on ? els[id].cls.add(c) : els[id].cls.delete(c) }, add(c: string) { els[id].cls.add(c) }, remove(c: string) { els[id].cls.delete(c) }, contains: (c: string) => els[id].cls.has(c) } })
    ;["projComboName", "projNewBtn", "projNewRow", "projNewDiv", "projComboSearch"].forEach(mk)
    let opened = 0, closed = 0
    const fn = new Function("state", "$", "projSwitchWire", "projSwitchIsOpen", "projSwitchFilter", "openNewProject", "projSwitchClose", sw + "\nreturn renderSwitcher")(
      { projects: [{ id: "p1", name: "Quantana" }], active: role ? { id: "p1", role } : null }, (id: string) => els[id] || null, () => {}, () => false, () => {}, () => { opened++ }, () => { closed++ }) as () => void
    fn()
    return { els, opened: () => opened, closed: () => closed }
  }
  const admin = run("admin")
  expect(admin.els["projNewRow"].cls.has("hide")).toBe(false); expect(admin.els["projNewDiv"].cls.has("hide")).toBe(false)
  admin.els["projNewRow"].onclick()
  expect(admin.opened()).toBe(1); expect(admin.closed()).toBe(1)               // closes the dropdown, then opens the modal
  expect(admin.els["projComboName"].textContent).toBe("Quantana")              // the selected project is what the nav shows
  const member = run("user")
  expect(member.els["projNewRow"].cls.has("hide")).toBe(true); expect(member.els["projNewDiv"].cls.has("hide")).toBe(true)
})

// ── AutoSim wizard opened from the nav (regression: its Close/Next/Create buttons were dead) ─────────────────────────
// The wizard's Close / Back / Next / Create / upload handlers are wired inside initTrailsView(), which used to run only the
// first time the AutoSims view opened — so "Create New → AutoSim" from the Overview opened a wizard nobody could close.
test("window.openWizard runs the (idempotent) initTrailsView FIRST, then opens the wizard", () => {
  const m = HTML.match(/(window\.openWizard=function\(\)\{[\s\S]*?\n  \})/)
  if (!m) throw new Error("window.openWizard wrapper not found")
  const calls: string[] = []
  const win: any = { initTrailsView: () => calls.push("init") }
  new Function("window", "openWizard", m[1])(win, () => calls.push("open"))
  win.openWizard()
  expect(calls).toEqual(["init", "open"])
  win.openWizard()                                              // every call re-asserts init (it is idempotent) before opening
  expect(calls).toEqual(["init", "open", "init", "open"])
})

test("window.openWizard still opens the wizard if initTrailsView is not defined (never throws)", () => {
  const m = HTML.match(/(window\.openWizard=function\(\)\{[\s\S]*?\n  \})/)!
  const calls: string[] = []
  const win: any = {}
  new Function("window", "openWizard", m[1])(win, () => calls.push("open"))
  expect(() => win.openWizard()).not.toThrow()
  expect(calls).toEqual(["open"])
})

test("the dependency is real: the wizard's Close handlers live inside initTrailsView, and every opener goes through window.openWizard", () => {
  const iInit = HTML.indexOf("window.initTrailsView=function(){"), iClose = HTML.indexOf('document.getElementById("wizClose").addEventListener("click",closeWizard)')
  const iExpose = HTML.indexOf("window.openWizard=function(){")
  expect(iInit).toBeGreaterThan(-1)
  expect(iClose).toBeGreaterThan(iInit)                         // close wiring is inside initTrailsView…
  expect(iClose).toBeLessThan(iExpose)                          // …which is defined before the exposed opener
  expect(HTML).toContain("if(_inited)return;_inited=true")      // idempotent, so calling it on every open is safe
  expect(extractFn(HTML, "function wireCreateMenu(")).toContain("if (typeof openWizard === \"function\") openWizard()")   // nav → window.openWizard
  expect(HTML).toContain('onclick="openWizard()">Create your first AutoSim')   // the empty-state button uses the same global
})

test("Inbox colours: #fff background and a #AEA8A2 icon, fixed (light AND dark mode), same scale as the avatar", () => {
  // fixed colours, not theme variables: the Inbox never flips to a light button in dark mode
  expect(HTML).not.toContain('[data-theme="dark"] .bar .nav-inbox')   // no dark-mode override: the specified colours apply in both themes
  expect(HTML).not.toMatch(/\.bar \.nav-inbox\{[^}]*var\(--(ink|paper)/)
  expect(HTML).toContain(".bar .nav-inbox{width:30px;height:30px;padding:0;justify-content:center;gap:0;border-radius:8px;background:#fff;color:#AEA8A2;border:0;box-shadow:none}")
  expect(HTML).toContain(".bar .nav-inbox svg{width:14px;height:14px;stroke-width:1.75}")
  expect(HTML).toContain(".avatar-btn{width:30px;height:30px;")
  expect(HTML).toContain(".bar .right .nav-icon{width:32px;height:32px}")
  expect(HTML).toContain("background:color-mix(in srgb,var(--ink-3) 40%,var(--ink-2))}")   // the lighter segmented-toggle surface
})

test("project dropdown search: icon sits OUTSIDE a smaller white field; the selected row uses a lighter shade", () => {
  // scoped to the nav's project popover (the shared .tap-search-row is also used by the Assignee popover and is untouched)
  expect(HTML).toContain(".bar .proj-combo-pop .tap-search-row{border:0;border-radius:0;background:transparent;padding:0;gap:10px;margin:2px 2px 8px}")
  expect(HTML).toContain(".bar .proj-combo-pop .tap-search{height:32px;box-sizing:border-box;padding:0 10px;background:var(--ink-2);border:1px solid var(--line);border-radius:9px;font-size:13px}")
  // focus: exactly ONE blue border — the 1px indigo border; the global input:focus-visible outline and any extra ring are off
  expect(HTML).toContain(".bar .proj-combo-pop .tap-search:focus,.bar .proj-combo-pop .tap-search:focus-visible{outline:0;border-color:var(--indigo);box-shadow:none}")
  expect(HTML).not.toContain(".bar .proj-combo-pop .tap-search:focus{border-color:var(--indigo);box-shadow:0 0 0 3px")
  expect(HTML).toContain(".bar .proj-combo-opt.current,.bar .proj-combo-opt:hover,.bar .proj-combo-opt.active{background:color-mix(in srgb,var(--ink-3) 45%,var(--ink-2))}")
  // the old darker shade must not be what the selected / highlighted row uses any more in the nav popover
  expect(HTML).not.toContain(".bar .proj-combo-opt.current{background:var(--ink-3)}")
  // markup order: the icon span comes BEFORE the input inside the row (so it can sit outside the field)
  const row = BAR.slice(BAR.indexOf('<div class="tap-search-row">'), BAR.indexOf('id="projComboList"'))
  expect(row.indexOf("proj-combo-search-ic")).toBeGreaterThan(-1)
  expect(row.indexOf("proj-combo-search-ic")).toBeLessThan(row.indexOf('id="projComboSearch"'))
  // the Assignee popover's search row keeps its original boxed look
  expect(HTML).toContain(".tap-search-row{display:flex;align-items:center;gap:7px;border:1px solid var(--line);border-radius:8px;padding:5px 9px;margin:2px 2px 6px;background:var(--ink)}")
})

test("project search focus: the single-border rule out-ranks the global input:focus-visible outline (no double blue border)", () => {
  // the global rule that used to add a SECOND (outer) blue outline whenever a text input is focused
  expect(HTML).toContain("a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:2px solid #8b8bf5;outline-offset:2px;border-radius:5px}")
  // CSS specificity as [ids, classes/attrs/pseudo-classes, elements]
  const spec = (sel: string) => {
    const s = sel.replace(/\([^)]*\)/g, "")
    return [(s.match(/#[\w-]+/g) || []).length, (s.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) || []).length, (s.match(/(^|[\s>+~])[a-z][\w-]*/gi) || []).length]
  }
  const cmp = (a: number[], b: number[]) => { for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0 }
  const mine = spec(".bar .proj-combo-pop .tap-search:focus-visible"), global = spec("input:focus-visible")
  expect(mine).toEqual([0, 4, 0]); expect(global).toEqual([0, 1, 1])
  expect(cmp(mine, global)).toBeGreaterThan(0)
  // and it is the LAST word on the matter for this input: nothing re-adds a shadow/outline to it afterwards
  const start = HTML.indexOf(".bar .proj-combo-pop .tap-search:focus,.bar .proj-combo-pop .tap-search:focus-visible{")
  const after = HTML.slice(HTML.indexOf("}", start) + 1)                 // everything AFTER our rule
  expect(after).not.toMatch(/\.proj-combo-pop \.tap-search[^{]*\{[^}]*(box-shadow:\s*0 0 0|outline:\s*[1-9])/)
})
