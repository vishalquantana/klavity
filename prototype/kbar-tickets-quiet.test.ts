// KD-298: the dashboard's top progress bar (#kbar) is not drawn on the Tickets page — the board paints from its cache and refreshes
// quietly, and the bar only made people wait for a loader. Other pages keep it.
import { expect, test } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
function extractBlock(src: string, sig: string) {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const KBAR_SRC = extractBlock(HTML, "const kbar = {")

function make(hash: string) {
  const created: any[] = []
  const location = { hash }
  const document = {
    createElement: () => { const el: any = { style: {}, setAttribute() { } }; created.push(el); return el },
    body: { appendChild() { } },
  }
  const raf = (fn: () => void) => fn()
  const kbar = new Function("document", "location", "requestAnimationFrame", KBAR_SRC + "; return kbar")(document, location, raf) as any
  return { kbar, created, location }
}

test("on the Tickets page no bar is drawn — not even created — and the counter stays balanced", () => {
  for (const hash of ["#tickets", "#tickets/fb_123"]) {
    const { kbar, created } = make(hash)
    kbar.start(); kbar.start(); kbar.done(); kbar.done()
    expect(created.length).toBe(0)
    expect(kbar.n).toBe(0)
  }
})
test("on every other page the bar still animates and completes", () => {
  for (const hash of ["#overview", "", "#triage", "#recurring", "#ticketsx"]) {
    const { kbar, created } = make(hash)
    kbar.start()
    expect(created.length).toBe(1)
    expect(created[0].style.opacity).toBe("1")                         // visible while a refresh is in flight
    kbar.done()
    expect(created[0].style.transform).toBe("scaleX(1)")                // snaps to 100% when it lands
    expect(kbar.n).toBe(0)
  }
})
test("a refresh that started on another page and finishes after you open Tickets still completes cleanly; one started on Tickets stays hidden", () => {
  const a = make("#overview")
  a.kbar.start(); a.location.hash = "#tickets"; a.kbar.done()
  expect(a.kbar.n).toBe(0); expect(a.created[0].style.transform).toBe("scaleX(1)")
  const b = make("#tickets")
  b.kbar.start(); b.location.hash = "#overview"; b.kbar.done()      // navigated away mid-refresh: still nothing drawn, still balanced
  expect(b.created.length).toBe(0); expect(b.kbar.n).toBe(0)
  b.kbar.start()                                                      // the next refresh on the new page does show the bar
  expect(b.created.length).toBe(1)
})
