// The browser-tab title follows the current page ("Tickets · Klavity", "Sim Reports · Klavity", …). It used to read
// "Dashboard · Klavity" everywhere — nothing ever set document.title. A dedicated ticket page shows "<KEY> <title> · Klavity".
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
function extractFn(src: string, sig: string) {
  const i = src.indexOf(sig); if (i < 0) throw new Error("not found: " + sig)
  let j = src.indexOf("{", i), d = 0
  for (; j < src.length; j++) { if (src[j] === "{") d++; else if (src[j] === "}") { d--; if (d === 0) return src.slice(i, j + 1) } }
  throw new Error("unbalanced")
}
const vtStart = HTML.indexOf("const VIEW_TITLES = {")
const VIEW_TITLES_SRC = HTML.slice(vtStart, HTML.indexOf("}", vtStart) + 1)

function harness() {
  const document: any = { title: "Dashboard · Klavity" }
  const window: any = {}
  const make = new Function("document", "window",
    VIEW_TITLES_SRC + "\n" + extractFn(HTML, "function applyDocTitle(v)") + "\n" + extractFn(HTML, "function setTicketDocTitle(key, title)") +
    "\nreturn { applyDocTitle, setTicketDocTitle }")
  return { document, window, ...make(document, window) }
}

test("each view sets its own tab title", () => {
  const h = harness()
  h.applyDocTitle("tickets");  expect(h.document.title).toBe("Tickets · Klavity")
  h.applyDocTitle("triage");   expect(h.document.title).toBe("Sim Reports · Klavity")
  h.applyDocTitle("sims");     expect(h.document.title).toBe("Sims · Klavity")
  h.applyDocTitle("settings"); expect(h.document.title).toBe("Settings · Klavity")
  h.applyDocTitle("overview"); expect(h.document.title).toBe("Overview · Klavity")
})

test("a ticket page shows its key + title, and the poll's re-render can't overwrite it while it's open", () => {
  const h = harness()
  h.window.__klavTktPageOpen = true
  h.setTicketDocTitle("KD-2873", "Tab title stuck on Dashboard")
  expect(h.document.title).toBe("KD-2873 Tab title stuck on Dashboard · Klavity")
  h.applyDocTitle("tickets")   // what render() / setView do on the ~25s poll
  expect(h.document.title).toBe("KD-2873 Tab title stuck on Dashboard · Klavity")
  // closed → back to the view title
  h.window.__klavTktPageOpen = false; h.window.__klavTktDocTitle = null
  h.applyDocTitle("tickets")
  expect(h.document.title).toBe("Tickets · Klavity")
})

test("long ticket titles are shortened", () => {
  const h = harness()
  h.setTicketDocTitle("KD-1", "x".repeat(200))
  expect(h.document.title.length).toBeLessThan(90)
  expect(h.document.title.endsWith("… · Klavity")).toBe(true)
})

test("wired: setView → applyViewHeader → applyDocTitle; ticket page sets it; close restores it", () => {
  expect(extractFn(HTML, "function applyViewHeader(v)")).toContain("applyDocTitle(v)")
  expect(extractFn(HTML, "function _renderSingleTicket(id)")).toContain("window.klavSetTicketDocTitle(key, t.title)")
  expect(extractFn(HTML, "function closeSingleTicket()")).toContain("window.applyDocTitle(")
})
