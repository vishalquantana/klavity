// KD-3153: refreshing the browser on a ticket PREVIEW (the slide-over panel) landed on the dashboard Overview.
// The deep link opened the ticket before the boot routing ran and rewrote the URL, so the routing's fallback
// switched to Overview and closed it; on Sim Reports, setView stripped ?ticket= before the deep link could open it.
// Now the preview marks its URL (tpanel=1) so a refresh reopens the PREVIEW, and the boot routing never navigates
// away from a ticket that is already showing. Shared ?ticket= links (no marker) still open the full ticket page.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function extract(name: string) {
  const start = html.indexOf("function " + name + "(")
  expect(start).toBeGreaterThan(-1)
  let i = html.indexOf("{", start), depth = 0
  for (; i < html.length; i++) { if (html[i] === "{") depth++; else if (html[i] === "}" && --depth === 0) break }
  return html.slice(start, i + 1)
}

test("the preview panel marks its URL, and closing it removes the marker", () => {
  const render = extract("_renderSingleTicket")
  const setTicket = render.indexOf('u.searchParams.set("ticket", String(id))')
  expect(setTicket).toBeGreaterThan(-1)
  expect(render.indexOf('u.searchParams.set("tpanel", "1")')).toBeGreaterThan(setTicket)
  const close = extract("closeSingleTicket")
  expect(close).toContain('u.searchParams.delete("ticket")')
  expect(close).toContain('u.searchParams.delete("tpanel")')
})

test("leaving the Tickets view strips the marker together with ?ticket=", () => {
  expect(html).toContain("if (v !== 'tickets') { _u.searchParams.delete('ticket'); _u.searchParams.delete('tpanel'); }")
})

test("deep link: a marked preview reopens as the panel; a shared link still opens full-page", () => {
  const deep = extract("maybeOpenDeepLinkTicket")
  expect(deep).toContain('const wasPanel = new URLSearchParams(location.search).get("tpanel") === "1"')
  expect(deep).toContain('const targetMode = (isTriage || wasPanel) ? "panel" : "full"')
  // run the mode rule
  const mode = (hash: string, search: string) => {
    const isTriage = hash.indexOf("triage") >= 0
    const wasPanel = new URLSearchParams(search).get("tpanel") === "1"
    return (isTriage || wasPanel) ? "panel" : "full"
  }
  expect(mode("#tickets", "?project=p&ticket=fb_1&tpanel=1")).toBe("panel")   // refreshed preview
  expect(mode("#triage", "?project=p&ticket=fb_1&tpanel=1")).toBe("panel")    // refreshed Sim Reports preview
  expect(mode("#tickets", "?project=p&ticket=fb_1")).toBe("full")             // Slack / invite / regression link
})

test("boot routing keeps an already-open ticket and holds ?ticket= through the first setView", () => {
  const boot = html.slice(html.indexOf("var deepTkt = init.match(/^tickets\\/(.+)$/);"), html.indexOf("else { setView(VIEWS.indexOf(init) >= 0 ? init : 'overview'); }"))
  expect(boot.length).toBeGreaterThan(100)
  // a ticket already showing → no navigation to the Overview fallback
  expect(boot).toContain("var tktShowing = !!window.__klavTktPageOpen || document.body.classList.contains('tkt-panel-open');")
  expect(boot).toContain("if (tktShowing) {")
  // Sim Reports preview: put Sim Reports behind it, then reopen the panel
  expect(boot).toContain("window.openSingleTicket(qTkt, 'panel', 'triage');")
  // ?ticket= not yet open → the view from the hash, with the URL kept so the deep link can still open it
  expect(boot).toContain("var qView = init === 'triage' ? 'triage' : 'tickets';")
  expect(boot).toContain("window.__klavTktBootKeepUrl = true;")
  // the Overview fallback is only reached when there is no ticket in the URL at all
  const order = [boot.indexOf("if (tktShowing) {"), boot.indexOf("else if (qTkt && !deepTriage && !deepTkt) {"), boot.indexOf("else if (deepTriage)")]
  expect(order.every((n) => n > -1)).toBe(true)
  expect(order[0]).toBeLessThan(order[1])
  expect(order[1]).toBeLessThan(order[2])
})
