// Global "+ Create" dropdown in the top nav (beside the new-project button): New Ticket / New Sim.
// The real wireCreateMenu is extracted from public/dashboard.html and run against a minimal fake DOM.
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

class El {
  listeners: Record<string, Function[]> = {}; attrs: Record<string, string> = {}; cls = new Set<string>(); children: El[] = []
  focused = 0; parent: El | null = null
  constructor(public id = "", classes = "") { classes.split(" ").filter(Boolean).forEach(c => this.cls.add(c)) }
  classList = { add: (c: string) => this.cls.add(c), remove: (c: string) => this.cls.delete(c), contains: (c: string) => this.cls.has(c) }
  addEventListener(t: string, f: Function) { (this.listeners[t] ||= []).push(f) }
  setAttribute(k: string, v: string) { this.attrs[k] = v }
  getAttribute(k: string) { return k in this.attrs ? this.attrs[k] : null }
  focus() { this.focused++; doc.activeElement = this }
  contains(o: any): boolean { return o === this || this.children.some(c => c.contains(o)) }
  querySelectorAll(_sel: string) { return this.children }
  click(extra: any = {}) { const e = { target: this, stopPropagation() {}, preventDefault() {}, ...extra }; (this.listeners["click"] || []).forEach(f => f(e)); doc.fire("click", e) }
}
const doc: any = {
  els: {} as Record<string, El>, listeners: {} as Record<string, Function[]>, activeElement: null as any,
  getElementById(id: string) { return this.els[id] || null },
  addEventListener(t: string, f: Function) { (this.listeners[t] ||= []).push(f) },
  fire(t: string, e: any) { (this.listeners[t] || []).slice().forEach(f => f(e)) },
}
function build(opts: { simVisible?: boolean } = {}) {
  doc.els = {}; doc.listeners = {}; doc.activeElement = null
  const btn = new El("createBtn"), menu = new El("createMenu", "create-menu hide")
  const ticket = new El("createItemTicket", "create-item"), sim = new El("createItemSim", opts.simVisible ? "create-item" : "create-item hide")
  menu.children = [ticket, sim]; ticket.parent = menu; sim.parent = menu
  doc.els = { createBtn: btn, createMenu: menu, createItemTicket: ticket, createItemSim: sim }
  const calls = { ticket: 0, sim: 0 }
  const wire = new Function("document", "openNewTicketModal", "openSimModal", extractFn(HTML, "function wireCreateMenu(") + "\nreturn wireCreateMenu")(doc, () => { calls.ticket++ }, () => { calls.sim++ }) as () => void
  wire()
  return { btn, menu, ticket, sim, calls, wire }
}
const key = (k: string) => { let prevented = false; doc.fire("keydown", { key: k, preventDefault: () => { prevented = true } }); return prevented }

test("clicking + Create opens the menu (aria-expanded true, first item focused); clicking again closes it", () => {
  const t = build()
  expect(t.menu.cls.has("hide")).toBe(true)
  t.btn.click()
  expect(t.menu.cls.has("hide")).toBe(false)
  expect(t.btn.attrs["aria-expanded"]).toBe("true")
  expect(t.ticket.focused).toBe(1)
  t.btn.click()
  expect(t.menu.cls.has("hide")).toBe(true)
  expect(t.btn.attrs["aria-expanded"]).toBe("false")
})

test("New Ticket opens the New ticket dialog and closes the menu", () => {
  const t = build({ simVisible: true })
  t.btn.click(); t.ticket.click()
  expect(t.calls).toEqual({ ticket: 1, sim: 0 })
  expect(t.menu.cls.has("hide")).toBe(true)
})

test("New Sim opens the Add-a-Sim surface and closes the menu", () => {
  const t = build({ simVisible: true })
  t.btn.click(); t.sim.click()
  expect(t.calls).toEqual({ ticket: 0, sim: 1 })
  expect(t.menu.cls.has("hide")).toBe(true)
})

test("Esc closes the menu and returns focus to the button; outside click closes it too; clicks inside do not", () => {
  const t = build()
  t.btn.click()
  expect(key("Escape")).toBe(true)
  expect(t.menu.cls.has("hide")).toBe(true)
  expect(t.btn.focused).toBe(1)
  t.btn.click()
  t.menu.click({ target: t.menu })                  // a click on the menu's own padding keeps it open
  expect(t.menu.cls.has("hide")).toBe(false)
  doc.fire("click", { target: new El("somewhere-else") })   // anywhere else on the page
  expect(t.menu.cls.has("hide")).toBe(true)
})

test("ArrowDown/ArrowUp cycle through the VISIBLE items only (the hidden New Sim is skipped for non-admins)", () => {
  const t = build({ simVisible: false })
  const items = () => [t.ticket, t.sim].filter(i => !i.cls.has("hide"))
  // fake querySelectorAll returns every child; the real code filters by .hide — emulate by checking behaviour
  t.btn.click()
  expect(doc.activeElement).toBe(t.ticket)
  expect(key("ArrowDown")).toBe(true)
  expect(doc.activeElement).toBe(t.ticket)          // only one visible item → wraps to itself, never lands on the hidden one
  expect(key("ArrowUp")).toBe(true)
  expect(doc.activeElement).toBe(t.ticket)
  expect(items().length).toBe(1)
  const a = build({ simVisible: true })
  a.btn.click()
  key("ArrowDown"); expect(doc.activeElement).toBe(a.sim)
  key("ArrowDown"); expect(doc.activeElement).toBe(a.ticket)   // wraps
  key("ArrowUp");   expect(doc.activeElement).toBe(a.sim)
})

test("keys are ignored while the menu is closed", () => {
  build()
  expect(key("Escape")).toBe(false)
  expect(key("ArrowDown")).toBe(false)
})

test("wiring is idempotent (calling it twice does not double-bind)", () => {
  const t = build({ simVisible: true })
  t.wire()
  t.btn.click(); t.ticket.click()
  expect(t.calls.ticket).toBe(1)
})

// ── source pins for what needs the real page ──────────────────────────────────────────────────────────────────────
test("placement: the Create button sits in the top nav right beside the new-project button", () => {
  const iNew = HTML.indexOf('id="projNewBtn"'), iCreate = HTML.indexOf('id="createWrap"'), iBarEnd = HTML.indexOf('<div class="right">')
  expect(iNew).toBeGreaterThan(-1)
  expect(iCreate).toBeGreaterThan(iNew)
  expect(HTML.slice(iNew, iCreate)).not.toContain('class="proj-combo-btn"')   // directly after the new-project button, not elsewhere in the bar
  expect(iCreate).toBeLessThan(iBarEnd)                                    // still in the left/center part of the bar, before the right-hand tools
  expect(HTML).toContain('id="createBtn"')
  expect(HTML).toMatch(/aria-haspopup="menu" aria-expanded="false" aria-controls="createMenu"/)
  expect(HTML).toContain('id="createItemTicket"')
  expect(HTML).toContain('id="createItemSim"')
})

test("New Sim in the menu is role-gated exactly like the existing #newSimBtn (project admins only); New Ticket is not gated", () => {
  expect(HTML).toContain('<button class="create-item hide" id="createItemSim"')              // hidden by default
  expect(HTML).not.toContain('<button class="create-item hide" id="createItemTicket"')
  expect(HTML).toContain('$("newSimBtn").classList.toggle("hide", !admin)')
  expect(HTML).toContain('cs.classList.toggle("hide", !admin)')
})

test("the menu is wired at load time and the existing in-context buttons are untouched", () => {
  expect(HTML).toContain("wireCreateMenu()   // global \"+ Create\" dropdown in the top nav")
  expect(HTML).toContain('id="newTicketBtn"')    // Tickets toolbar button still there
  expect(HTML).toContain('id="newSimBtn"')       // Sims heading button still there
})
