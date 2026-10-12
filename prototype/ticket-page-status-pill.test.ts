// KD-230: changing Status in the ticket Properties rail must repaint the dedicated-page header's status
// pill (beside the #key) immediately. That pill is built once in _renderSingleTicket, outside renderHead,
// so the detail's onChange callback has to repaint it explicitly.
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

test("the dedicated-page header pill is repainted from t.status on every detail change", () => {
  const fn = extractFn(HTML, "function _renderSingleTicket(id)")
  const repaint = extractFn(fn, "const repaintPageStatusPill = () =>")
  expect(repaint).toContain('single.querySelector(".tkt-page-head .tkt-pill")')
  expect(repaint).toContain("statusPillHtml(t.status)")
  expect(fn).toContain("buildTktDetail(t, admin, () => { renderHead(); repaintPageStatusPill(); renderTicketsKanban() }, true)")
})

test("the status save path mutates the same ticket object the page header reads, then fires onChange", () => {
  const i = HTML.indexOf('const statusSelEl = detailEl.querySelector(".tkt-status-sel")')
  const handler = HTML.slice(i, HTML.indexOf("const priSelEl", i))
  expect(handler).toContain("const tkt = (state.tickets || []).find(x => String(x.id) === String(ticketId))")
  expect(handler).toContain("if (tkt) tkt.status = newStatus")
  expect(handler).toContain('if (onChange) onChange("status", newStatus)')
})

// KD-230 (delay): the status change must show INSTANTLY — the page repaints before the PATCH resolves,
// and only a failed save (for the LATEST pick) rolls it back. Runs the real handler from dashboard.html
// against minimal fakes, with a fetch we resolve by hand.
function mountStatusHandler(initial: string) {
  const i = HTML.indexOf('const statusSelEl = detailEl.querySelector(".tkt-status-sel")')
  const src = HTML.slice(i, HTML.indexOf("// KLA-199: Wire up priority picker", i))
  const sel: any = new EventTarget()
  sel.value = initial
  sel.attrs = {} as Record<string, string>
  sel.setAttribute = (k: string, v: string) => { sel.attrs[k] = v }
  sel.removeAttribute = (k: string) => { delete sel.attrs[k] }
  const dot = { className: "prop-dot ds-" + initial }
  const detailEl = { querySelector: (q: string) => (q === ".tkt-status-sel" ? sel : q === ".prop-dot" ? dot : null) }
  const ticket = { id: "fb_1", status: initial }
  const boardTicket = { id: "fb_1", status: initial }
  const pending: Array<(body: any) => void> = []
  const calls = { onChange: [] as string[], counts: [] as string[], msgs: [] as Array<[string, boolean]> }
  const fetchFn = () => new Promise(res => pending.push((body: any) => res({ json: async () => body })))
  const win: any = { __klavMutating: 0 }
  new Function(
    "detailEl", "curStatus", "ticketId", "state", "_tktBoardTickets", "recordLocalEdit", "openCountOnStatusChange",
    "onChange", "showTktMsg", "fetch", "window", src,
  )(
    detailEl, initial, "fb_1", { tickets: [ticket] }, [boardTicket], () => {},
    (f: string, t: string) => calls.counts.push(`${f}->${t}`),
    (_k: string, v: string) => calls.onChange.push(v),
    (_el: any, m: string, err: boolean) => calls.msgs.push([m, err]),
    fetchFn, win,
  )
  const pick = (v: string) => { sel.value = v; sel.dispatchEvent(new Event("change")) }
  const respond = async (n: number, body: any) => { pending[n](body); await new Promise(r => setTimeout(r, 0)) }
  return { sel, dot, ticket, boardTicket, calls, pick, respond, win }
}

test("picking a status repaints the page immediately, before the save returns", async () => {
  const h = mountStatusHandler("open")
  h.pick("in_progress")
  // Nothing has been answered by the server yet — the page has already moved.
  expect(h.ticket.status).toBe("in_progress")
  expect(h.boardTicket.status).toBe("in_progress")
  expect(h.dot.className).toBe("prop-dot ds-in_progress")
  expect(h.calls.onChange).toEqual(["in_progress"])
  expect(h.calls.counts).toEqual(["open->in_progress"])
  expect(h.win.__klavMutating).toBe(1)
  await h.respond(0, { ok: true })
  expect(h.win.__klavMutating).toBe(0)
  expect(h.ticket.status).toBe("in_progress")
  expect(h.calls.msgs).toEqual([["Saved.", false]])
})

test("a failed save rolls the page back to the last saved status", async () => {
  const h = mountStatusHandler("open")
  h.pick("done")
  await h.respond(0, { ok: false, error: "No access" })
  expect(h.sel.value).toBe("open")
  expect(h.ticket.status).toBe("open")
  expect(h.boardTicket.status).toBe("open")
  expect(h.dot.className).toBe("prop-dot ds-open")
  expect(h.calls.onChange).toEqual(["done", "open"])
  expect(h.calls.counts).toEqual(["open->done", "done->open"])
  expect(h.calls.msgs).toEqual([["No access", true]])
})

test("rapid re-picks: a stale response never overrides the newest choice", async () => {
  const h = mountStatusHandler("open")
  h.pick("in_progress")
  h.pick("blocked")
  await h.respond(0, { ok: false })          // the OLDER pick fails — must not roll back the newer one
  expect(h.ticket.status).toBe("blocked")
  expect(h.calls.msgs).toEqual([])
  await h.respond(1, { ok: true })
  expect(h.ticket.status).toBe("blocked")
  expect(h.calls.msgs).toEqual([["Saved.", false]])
})

test("when the newest pick fails, it rolls back to the last CONFIRMED status (not the original)", async () => {
  const h = mountStatusHandler("open")
  h.pick("in_progress")
  h.pick("blocked")
  await h.respond(0, { ok: true })           // in_progress confirmed by the server
  await h.respond(1, { ok: false })          // blocked rejected
  expect(h.ticket.status).toBe("in_progress")
  expect(h.sel.value).toBe("in_progress")
})
