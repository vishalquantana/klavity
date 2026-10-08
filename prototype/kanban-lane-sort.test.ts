// KD-203 — each Tickets-board swimlane gets a sort button: default = the server's order (newest activity first, which
// keeps a re-reported ticket on top); click = that lane by Ticket ID ascending; click again = back. The choice is
// remembered per user + project. Board render, shift-click range select and the full-page prev/next all share ONE
// ordering helper so what's on screen is the order you navigate and select in.
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

function makeEnv(opts: { uid?: string | null; projId?: string | null; store?: Record<string, string>; throwing?: boolean } = {}) {
  const store: Record<string, string> = opts.store ?? {}
  const localStorage = {
    getItem: (k: string) => { if (opts.throwing) throw new Error("blocked"); return k in store ? store[k] : null },
    setItem: (k: string, v: string) => { if (opts.throwing) throw new Error("blocked"); store[k] = String(v) },
  }
  const state = { active: opts.projId === null ? null : { id: opts.projId ?? "proj_1" } }
  const swrUid = () => (opts.uid === undefined ? "u1" : opts.uid)
  const KANBAN_COLS = [{ key: "open" }, { key: "in_progress" }, { key: "done" }]
  const src = [
    "const _kbSortDir = {}", "let _kbSortLoadedKey = undefined",
    extractFn(HTML, "function kbSortKey("), extractFn(HTML, "function kbSortLoad("),
    extractFn(HTML, "function kbSortToggle("), extractFn(HTML, "function kbOrderColumn("),
  ].join("\n")
  const api = new Function("localStorage", "state", "swrUid", "KANBAN_COLS", src +
    "\nreturn { kbSortKey, kbSortLoad, kbSortToggle, kbOrderColumn, dir: _kbSortDir }")(localStorage, state, swrUid, KANBAN_COLS) as {
    kbSortKey: () => string | null; kbSortLoad: () => void; kbSortToggle: (k: string) => string
    kbOrderColumn: (items: any[], key: string) => any[]; dir: Record<string, string>
  }
  return { ...api, store }
}
const T = (id: string, seqNum: number | null | undefined) => ({ id, seqNum })
const ids = (a: any[]) => a.map(t => t.id)

test("default: a lane keeps the server's order untouched (same array contents, same order)", () => {
  const e = makeEnv()
  const items = [T("c", 30), T("a", 10), T("b", 20)]
  expect(ids(e.kbOrderColumn(items, "open"))).toEqual(["c", "a", "b"])
})

test("ascending: that lane sorts by Ticket ID (seqNum) low → high; the input array is not mutated", () => {
  const e = makeEnv()
  e.kbSortToggle("open")
  const items = [T("c", 30), T("a", 10), T("b", 20)]
  expect(ids(e.kbOrderColumn(items, "open"))).toEqual(["a", "b", "c"])
  expect(ids(items)).toEqual(["c", "a", "b"])
})

test("sorts numerically, not as text (9 < 10 < 100)", () => {
  const e = makeEnv(); e.kbSortToggle("open")
  expect(ids(e.kbOrderColumn([T("x", 100), T("y", 9), T("z", 10)], "open"))).toEqual(["y", "z", "x"])
})

test("lanes are independent — sorting one leaves the others in server order", () => {
  const e = makeEnv(); e.kbSortToggle("open")
  const items = [T("c", 30), T("a", 10), T("b", 20)]
  expect(ids(e.kbOrderColumn(items, "open"))).toEqual(["a", "b", "c"])
  expect(ids(e.kbOrderColumn(items, "in_progress"))).toEqual(["c", "a", "b"])
})

test("tickets without a seqNum go last, keep their relative order; equal ids keep server order (stable)", () => {
  const e = makeEnv(); e.kbSortToggle("open")
  const out = e.kbOrderColumn([T("n1", null), T("b", 20), T("n2", undefined), T("a", 10), T("b2", 20)], "open")
  expect(ids(out)).toEqual(["a", "b", "b2", "n1", "n2"])
})

test("toggle flips asc ↔ default and reports the new direction", () => {
  const e = makeEnv()
  expect(e.kbSortToggle("open")).toBe("asc")
  expect(e.kbSortToggle("open")).toBe("default")
  expect(e.dir.open).toBeUndefined()
})

test("persisted per user + project: saved on toggle, restored by a fresh session, other project/user unaffected", () => {
  const a = makeEnv({ uid: "u1", projId: "p1" })
  a.kbSortToggle("open"); a.kbSortToggle("done")
  expect(Object.keys(a.store)).toEqual([a.kbSortKey()!])
  expect(a.kbSortKey()).toContain("u1"); expect(a.kbSortKey()).toContain("p1")

  const again = makeEnv({ uid: "u1", projId: "p1", store: a.store })
  expect(ids(again.kbOrderColumn([T("c", 3), T("a", 1)], "open"))).toEqual(["a", "c"])   // restored without a click
  expect(ids(again.kbOrderColumn([T("c", 3), T("a", 1)], "done"))).toEqual(["a", "c"])
  expect(ids(again.kbOrderColumn([T("c", 3), T("a", 1)], "in_progress"))).toEqual(["c", "a"])

  const otherProj = makeEnv({ uid: "u1", projId: "p2", store: a.store })
  expect(ids(otherProj.kbOrderColumn([T("c", 3), T("a", 1)], "open"))).toEqual(["c", "a"])
  const otherUser = makeEnv({ uid: "u2", projId: "p1", store: a.store })
  expect(ids(otherUser.kbOrderColumn([T("c", 3), T("a", 1)], "open"))).toEqual(["c", "a"])
})

test("junk / blocked storage never breaks the board: bad JSON, unknown lanes, non-asc values are ignored; throwing storage still sorts", () => {
  const key = makeEnv().kbSortKey()!
  const bad = makeEnv({ store: { [key]: "{not json" } })
  expect(ids(bad.kbOrderColumn([T("c", 3), T("a", 1)], "open"))).toEqual(["c", "a"])
  const weird = makeEnv({ store: { [key]: JSON.stringify({ open: "desc", nope: "asc", done: "asc" }) } })
  expect(ids(weird.kbOrderColumn([T("c", 3), T("a", 1)], "open"))).toEqual(["c", "a"])       // only "asc" is honoured
  expect(ids(weird.kbOrderColumn([T("c", 3), T("a", 1)], "done"))).toEqual(["a", "c"])
  expect(weird.dir.nope).toBeUndefined()                                                        // unknown lane dropped
  const blocked = makeEnv({ throwing: true })
  expect(blocked.kbSortToggle("open")).toBe("asc")                                              // in-memory still works
  expect(ids(blocked.kbOrderColumn([T("c", 3), T("a", 1)], "open"))).toEqual(["a", "c"])
})

test("without a signed-in uid / active project nothing is persisted (no shared 'anonymous' key)", () => {
  const e = makeEnv({ uid: null })
  expect(e.kbSortKey()).toBeNull()
  e.kbSortToggle("open")
  expect(Object.keys(e.store)).toEqual([])
  const noProj = makeEnv({ projId: null })
  expect(noProj.kbSortKey()).toBeNull()
})

test("wiring (source pin): board render, range select and prev/next all order lanes through kbOrderColumn", () => {
  const render = extractFn(HTML, "function renderTicketsKanban(")
  expect(render).toMatch(/KANBAN_COLS\.forEach\(c => \{ groups\[c\.key\] = kbOrderColumn\(groups\[c\.key\], c\.key\) \}\)/)
  expect(render.indexOf("kbOrderColumn(")).toBeLessThan(render.indexOf("const orderedIds"))   // range-select order = displayed order
  const ordered = extractFn(HTML, "function _tktOrderedVisibleIds(")
  expect(ordered).toContain("kbOrderColumn(")
})

test("wiring (source pin): every lane header has an accessible sort button that toggles only that lane, and the title/count markup is unchanged", () => {
  const render = extractFn(HTML, "function renderTicketsKanban(")
  expect(render).toContain('<button type="button" class="kb-sort')   // class is conditional (kb-sort / kb-sort on)
  expect(render).toMatch(/aria-label="Sort [^"]*Ticket ID/)
  expect(render).toMatch(/aria-pressed=/)
  expect(render).toContain("kbSortToggle(col.key)")
  expect(render).toContain('<span class="kb-title">${col.label}</span><span class="kb-n">${items.length}</span>')   // existing pins keep matching
  expect(HTML).toMatch(/\.kb-head \.kb-sort\s*\{/)
})
