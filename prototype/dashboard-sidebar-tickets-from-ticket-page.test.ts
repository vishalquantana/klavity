// On a full ticket page (/<workspace>/<KEY>), clicking "Tickets" in the sidebar must go back to the tickets overview.
// It used to stay on the ticket: the page already counts as the Tickets view, setView('tickets') only tears the page
// down when LEAVING Tickets, and renderTicketsView() bails while the page is open.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")

// The body of the sidebar's delegated click listener.
function sidebarClickBody(): string {
  const anchor = HTML.indexOf("side.addEventListener('click', function (e) {")
  if (anchor < 0) throw new Error("sidebar click handler not found")
  let j = HTML.indexOf("{", anchor + "side.addEventListener('click', function (e) ".length), d = 0
  const start = j + 1
  for (; j < HTML.length; j++) { if (HTML[j] === "{") d++; else if (HTML[j] === "}") { d--; if (d === 0) return HTML.slice(start, j) } }
  throw new Error("unbalanced")
}

function click(go: string, opts: { pageOpen: boolean; viewAfterClose?: string }) {
  const calls: string[] = []
  let view = "tickets"
  const win: any = {
    __klavTktPageOpen: opts.pageOpen,
    klavCloseSingleTicket: () => { calls.push("close"); win.__klavTktPageOpen = false; if (opts.viewAfterClose) view = opts.viewAfterClose },
    scrollTo: () => { },
  }
  const doc: any = { body: { getAttribute: () => view } }
  const btn = { getAttribute: () => go }
  const side = { contains: () => true }
  const e = { target: { closest: () => btn } }
  const setView = (v: string) => { calls.push("setView:" + v); view = v }
  new Function("e", "side", "setView", "window", "document", sidebarClickBody())(e, side, setView, win, doc)
  return calls
}

test("sidebar Tickets on a full ticket page closes it (back to the tickets overview)", () => {
  expect(click("tickets", { pageOpen: true })).toEqual(["close"])
})

test("ticket opened from Sim Reports: sidebar Tickets still lands on Tickets", () => {
  expect(click("tickets", { pageOpen: true, viewAfterClose: "triage" })).toEqual(["close", "setView:tickets"])
})

test("unchanged: other views and Tickets without an open ticket page go through setView", () => {
  expect(click("tickets", { pageOpen: false })).toEqual(["setView:tickets"])
  expect(click("sims", { pageOpen: true })).toEqual(["setView:sims"])
})

test("closeSingleTicket is exposed for the sidebar script", () => {
  expect(HTML).toContain("window.klavCloseSingleTicket = closeSingleTicket")
})
