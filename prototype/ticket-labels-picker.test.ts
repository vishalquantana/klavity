import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// KD-227: a label created in Manage Labels (opened from the ticket's Labels row) never reached that
// ticket's "+ Add label…" dropdown — refreshTicketLabelOptions() only rebuilt the list filter. These tests
// run the REAL label-row wiring + refreshTicketLabelOptions from dashboard.html against a tiny fake DOM.
const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

function slice(start: string, end: string) {
  const a = html.indexOf(start)
  const b = html.indexOf(end, a)
  if (a < 0 || b < 0) throw new Error("marker not found: " + start)
  return html.slice(a, b)
}
// The label-row block is an `if (lblRow && …) {` left open at the end marker — close it.
const rowSrc = slice("// KLA-174: wire up label row", "// Fetch AI suggestions async") + "\n}"
const refreshSrc = slice("function refreshTicketLabelOptions()", "function tktFilterBarBind()")

function el(cls = "") {
  return {
    className: cls, innerHTML: "", value: "", style: { display: "" }, isConnected: true,
    classList: { _s: new Set<string>(cls.split(" ")), toggle(c: string, on: boolean) { on ? this._s.add(c) : this._s.delete(c) }, add(c: string) { this._s.add(c) }, contains(c: string) { return this._s.has(c) } },
    _attrs: {} as Record<string, string>, setAttribute(k: string, v: string) { this._attrs[k] = v }, dispatchEvent(e: any) { this._on[e.type]?.(e) },
    _on: {} as Record<string, Function>, addEventListener(t: string, fn: Function) { this._on[t] = fn }, querySelectorAll() { return [] },
  } as any
}

function mount(projectLabels: any[], attached: any[] = []) {
  const row = el("tkt-lbl-row"), chips = el(), sel = el(), ghost = el(), empty = el("tkt-lbl-empty-add hide")
  const kdd = el("kdd tkt-lbl-kdd"), btn = el("kdd-btn tkt-lbl-btn"), menu = el("kdd-menu hide tkt-lbl-menu")
  const map: Record<string, any> = { ".tkt-lbl-row": row, ".tkt-lbl-chips": chips, ".tkt-lbl-sel": sel, ".tkt-lbl-ghost-chips": ghost, ".tkt-lbl-empty-add": empty, ".tkt-lbl-kdd": kdd, ".tkt-lbl-btn": btn, ".tkt-lbl-menu": menu }
  const detailEl = { querySelector: (q: string) => map[q] || null, querySelectorAll: (q: string) => (q === ".kdd-menu" ? [menu] : []) }
  const state: any = { _labels: projectLabels, tickets: [] }
  const document = { getElementById: () => null, querySelectorAll: (q: string) => (q === ".tkt-lbl-row" ? [row] : []) }
  const esc = (s: any) => String(s)
  const window = { kicon: () => "" }
  const popup: { opts: any } = { opts: null }
  const posts: any[] = []
  const fetch = async (url: string, init: any) => { posts.push({ url, body: JSON.parse(init.body) }); return { ok: true } }
  new Function("detailEl", "t", "ticketId", "state", "esc", "window", "isSingle", "fetch", "openManageLabels", "loadTicketSuggestions", "Event", rowSrc)(
    detailEl, { labels: attached }, "fb_1", state, esc, window, false, fetch, (o: any) => { popup.opts = o }, async () => [], class { type: string; constructor(t: string) { this.type = t } stopPropagation() { } })
  const refresh = new Function("document", "state", "esc", "_tktFilters", refreshSrc + "\nreturn refreshTicketLabelOptions")(document, state, esc, { label: "" })
  return { state, sel, chips, empty, kdd, btn, menu, refresh, popup, posts }
}


const pick = async (m: any, value: string) => { m.sel.value = value; await m.sel._on.change({ stopPropagation() { } }) }

test("the dropdown lists '+ Add label…' first, then the labels; picking '+ Add label…' opens the popup (KD-227)", async () => {
  const m = mount([{ id: "lbl_a", name: "Alpha", color: "#111111" }, { id: "lbl_b", name: "Beta", color: "#222222" }], [{ id: "lbl_a", name: "Alpha", color: "#111111" }])
  expect(m.sel.innerHTML).toBe('<option value="" hidden selected>+ Add label…</option><option value="__add_label__">+ Add label…</option><option value="lbl_b">Beta</option>')
  expect(m.kdd.style.display).toBe("")
  await pick(m, "__add_label__")
  expect(m.sel.value).toBe("") // back to the placeholder
  expect(m.popup.opts.ticket.has("lbl_a")).toBe(true)
  expect(m.posts.length).toBe(0) // opening the popup attaches nothing
})

test("picking a label from the dropdown still attaches it directly (KD-227)", async () => {
  const m = mount([{ id: "lbl_b", name: "Beta", color: "#222222" }])
  await pick(m, "lbl_b")
  expect(m.popup.opts).toBeNull()
  expect(m.posts).toEqual([{ url: "/api/feedback/fb_1/labels", body: { labelId: "lbl_b" } }])
  expect(m.chips.innerHTML).toContain("Beta")
})

test("a label picked or created in the popup opened from the ticket is added to that ticket (KD-227)", async () => {
  const m = mount([{ id: "lbl_a", name: "Alpha", color: "#111111" }])
  await pick(m, "__add_label__")
  const created = { id: "lbl_new", name: "Regression", color: "#ef4444" }
  m.state._labels.push(created)
  m.refresh()
  expect(m.popup.opts.ticket.has("lbl_new")).toBe(false)
  await m.popup.opts.ticket.add(created)
  expect(m.popup.opts.ticket.has("lbl_new")).toBe(true)
  expect(m.posts).toEqual([{ url: "/api/feedback/fb_1/labels", body: { labelId: "lbl_new" } }])
  expect(m.chips.innerHTML).toContain("Regression")
  expect(m.sel.innerHTML).not.toContain('value="lbl_new"') // attached → no longer offered
})

test("a label created after the ticket rendered appears in the ticket's dropdown (KD-227)", () => {
  const m = mount([])
  expect(m.kdd.style.display).toBe("none")          // no labels yet → dropdown hidden…
  expect(m.empty.classList.contains("hide")).toBe(false) // …and "+ Add label" shown
  m.state._labels.push({ id: "lbl_new", name: "Regression", color: "#ef4444" })
  m.refresh()
  expect(m.sel.innerHTML).toContain('value="lbl_new"')
  expect(m.sel.innerHTML).toContain("Regression")
  expect(m.kdd.style.display).toBe("")
  expect(m.empty.classList.contains("hide")).toBe(true)
})

test("rename and delete in Manage Labels re-sync the ticket's attached chips (KD-227)", () => {
  const a = { id: "lbl_a", name: "Old", color: "#111111" }, b = { id: "lbl_b", name: "Gone", color: "#222222" }
  const m = mount([a, b], [{ ...a }, { ...b }])
  m.state._labels = [{ ...a, name: "Renamed" }]
  m.refresh()
  expect(m.chips.innerHTML).toContain("Renamed")
  expect(m.chips.innerHTML).not.toContain("Old")
  expect(m.chips.innerHTML).not.toContain("Gone")
})

test("the Labels picker uses the Status/Priority menu: '+ Add label…' first, then label items that attach (KD-227)", async () => {
  const m = mount([{ id: "lbl_a", name: "alpha", color: "#111111" }, { id: "lbl_b", name: "Beta", color: "#222222" }], [{ id: "lbl_a", name: "alpha", color: "#111111" }])
  expect(m.menu.innerHTML.indexOf('data-val="__add_label__"')).toBeLessThan(m.menu.innerHTML.indexOf('data-val="lbl_b"'))
  expect(m.menu.innerHTML).not.toContain('data-val="lbl_a"') // attached → not offered
  expect(m.menu.innerHTML).toContain('style="background:#222222"') // colour dot
  m.btn._on.click({ stopPropagation() { } })
  expect(m.menu.classList.contains("hide")).toBe(false)
  expect(m.btn._attrs["aria-expanded"]).toBe("true")
  const item = (val: string) => ({ stopPropagation() { }, target: { closest: () => ({ getAttribute: () => val }) } })
  await m.menu._on.click(item("lbl_b"))
  await new Promise(r => setTimeout(r, 0))
  expect(m.menu.classList.contains("hide")).toBe(true)
  expect(m.posts).toEqual([{ url: "/api/feedback/fb_1/labels", body: { labelId: "lbl_b" } }])
  m.btn._on.click({ stopPropagation() { } })
  await m.menu._on.click(item("__add_label__"))
  expect(m.popup.opts).not.toBeNull()
})
