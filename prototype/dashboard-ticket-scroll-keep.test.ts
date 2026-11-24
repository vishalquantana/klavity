// KD-3147: the ticket preview / full ticket page must not jump back to the top on its own.
// Opening a ticket renders it twice (cache first, then the fresh /api/feedback/:id); the second render used to
// end with scroll-to-top, throwing a reader who had already scrolled down back up. A re-render of the SAME
// ticket in the SAME mode now keeps the scroll; a new ticket (or panel → full page) still starts at the top.
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

function fakeSingle(attrs: Record<string, string>, opts: { hidden?: boolean; children?: number; scrollTop?: number } = {}) {
  return {
    scrollTop: opts.scrollTop ?? 0,
    children: { length: opts.children ?? 1 },
    classList: { contains: (c: string) => c === "hide" && !!opts.hidden },
    getAttribute: (k: string) => (k in attrs ? attrs[k] : null),
  }
}

const keep = (win: any) => new Function("window", extract("tktScrollToKeep") + "\nreturn tktScrollToKeep")(win) as (s: any, id: any, panel: boolean) => number

test("same ticket, same mode → keep the current scroll (panel scrolls itself, page scrolls the window)", () => {
  const k = keep({ scrollY: 1800 })
  expect(k(fakeSingle({ "data-tkt-id": "t1", "data-tkt-mode": "panel" }, { scrollTop: 640 }), "t1", true)).toBe(640)
  expect(k(fakeSingle({ "data-tkt-id": "t1", "data-tkt-mode": "full" }), "t1", false)).toBe(1800)
})

test("a different ticket, a mode change, or nothing open → start at the top", () => {
  const k = keep({ scrollY: 1800 })
  expect(k(fakeSingle({ "data-tkt-id": "t1", "data-tkt-mode": "full" }), "t2", false)).toBe(0)        // prev/next
  expect(k(fakeSingle({ "data-tkt-id": "t1", "data-tkt-mode": "panel" }, { scrollTop: 500 }), "t1", false)).toBe(0) // expand
  expect(k(fakeSingle({ "data-tkt-id": "t1", "data-tkt-mode": "full" }, { hidden: true }), "t1", false)).toBe(0)
  expect(k(fakeSingle({ "data-tkt-id": "t1", "data-tkt-mode": "full" }, { children: 0 }), "t1", false)).toBe(0)
  expect(k(null, "t1", false)).toBe(0)
})

test("the render captures the scroll before clearing, records id + mode, and only scrolls to top for a new ticket", () => {
  const render = extract("_renderSingleTicket")
  const cap = render.indexOf("const _keepY = tktScrollToKeep(single, id, panel)")
  const clear = render.indexOf('single.innerHTML = ""')
  expect(cap).toBeGreaterThan(-1)
  expect(clear).toBeGreaterThan(cap)
  expect(render).toContain('single.setAttribute("data-tkt-id", String(id))')
  expect(render).toContain('single.setAttribute("data-tkt-mode", panel ? "panel" : "full")')
  expect(render).toContain("if (_keepY > 0) restoreTktScroll(single, panel, _keepY)")
  expect(render).toMatch(/else if \(panel\) \{ try \{ single\.scrollTop = 0 \} catch \(e\) \{ \} \}\s*\n\s*else \{ try \{ window\.scrollTo\(0, 0\) \} catch \(e\) \{ \} \}/)
})

test("restoring re-applies while the page grows back, and stops as soon as the user scrolls", () => {
  const fn = extract("restoreTktScroll")
  expect(fn).toContain('["wheel", "touchmove", "keydown", "mousedown"]')
  expect(fn).toContain("if (userMoved || Date.now() - started > 2000)")
  // panel restore: sets the panel's own scrollTop
  const frames: Function[] = []
  const listeners: Record<string, Function> = {}
  const single: any = { scrollTop: 0, addEventListener: (e: string, f: Function) => { listeners[e] = f }, removeEventListener() { } }
  const restore = new Function("requestAnimationFrame", "window", fn + "\nreturn restoreTktScroll")((f: Function) => frames.push(f), {}) as any
  restore(single, true, 900)
  expect(single.scrollTop).toBe(900)
  single.scrollTop = 300            // content re-rendered shorter → clamped
  frames.shift()!()
  expect(single.scrollTop).toBe(900) // re-applied
  listeners.wheel()                  // the user scrolls
  single.scrollTop = 120
  frames.shift()!()
  expect(single.scrollTop).toBe(120) // left alone
})
