import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// KD-180: switching project took 30–45s with only a thin top progress bar as feedback.
//  1. A clear overlay ("Switching to <project>…") shows the moment a project is picked and stays up across the
//     reload until the new project's dashboard paints.
//  2. On the Tickets board the board fetch now starts at boot, in parallel with /api/dashboard, instead of after it.
const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

test("picking a project shows the switch overlay before navigating", () => {
  const choose = html.slice(html.indexOf("function projSwitchChoose(i)"), html.indexOf("function projSwitchKeydown(e)"))
  const show = choose.indexOf("projSwitchOverlayShow(p.id, p.name)")
  expect(show).toBeGreaterThan(-1)
  expect(choose.indexOf("location.href = projSwitchUrl(p.id, location.hash)")).toBeGreaterThan(show)
  expect(html).toContain('<div class="psw-overlay" id="pswOverlay" role="status"')
})

test("the reloaded page keeps the overlay up from first paint, and load() takes it down", () => {
  // inline boot script right after <body>: shows it when this load is the switch the user just started
  const boot = html.slice(html.indexOf('<div class="psw-overlay"'), html.indexOf('<div class="bar">'))
  expect(boot).toContain('sessionStorage.getItem("klav:projSwitch")')
  expect(boot).toContain("s.pid === pid && Date.now() - s.at < 60000")
  // load(): hidden after the cached paint and once the network load resolves (success or failure)
  const load = html.slice(html.indexOf("    async function load() {"), html.indexOf("    function mountReportWidget()"))
  expect(load).toContain("projSwitchOverlayHide()        // KD-180")
  expect(load).toContain("if (!redirected) setTimeout(projSwitchOverlayHide, 0)")
  // never stranded: bfcache restore + 60s cap
  expect(html).toContain('window.addEventListener("pageshow", (e) => { if (e.persisted) projSwitchOverlayHide() })')
  expect(html).toContain("setTimeout(projSwitchOverlayHide, 60000)")
})

test("the boot board prefetch requests exactly the board's URL (status list mirrors STATUS_ORDER)", () => {
  const order = html.match(/const STATUS_ORDER = \[([^\]]*)\]/)![1].replace(/["\s]/g, "")
  const early = html.match(/encodeURIComponent\("([a-z_,]+)"\) \+ "&page=1&limit=200"/)![1]
  expect(early).toBe(order) // a mismatch would silently disable the speed-up (the board would refetch)
  // and fetchAndRenderTktBoard consumes it once, falling back to a normal fetch on failure
  const board = html.slice(html.indexOf("async function fetchAndRenderTktBoard()"), html.indexOf("function priDotClass(pri)"))
  expect(board).toContain("if (early && early.url === boardUrl) {")
  expect(board).toContain("window.__klavEarlyBoard = null")
  expect(board).toContain("if (!res) res = await fetch(boardUrl)")
})
