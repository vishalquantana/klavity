// KD-3145: on a locked page the "Unlock <feature> on <project>" overlay covers the content area (top bar + sidebar
// stay usable, KD-3121). The header's menus (Create New, project picker, notifications, account) used to open BEHIND
// it because the top bar's stacking level (10) was below the overlay's (25). Order now: content < overlay < bar < sidebar.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")
const z = (re: RegExp) => { const m = html.match(re); expect(m).not.toBeNull(); return Number(m![1]) }

test("top bar sits above the Unlock overlay, and the sidebar above the top bar", () => {
  const wall = z(/\.upgrade-wall\.show \{[^}]*z-index: (\d+)/)
  const bar = z(/\n    \.bar \{[^}]*?z-index: (\d+);/)
  const side = z(/\n    \.side \{[^}]*?z-index: (\d+);/)
  expect(bar).toBeGreaterThan(wall)
  expect(side).toBeGreaterThan(bar)
  // modals and the ticket panel still cover everything
  expect(z(/\n    \.modal-bg \{[^}]*?z-index: (\d+)/)).toBeGreaterThan(side)
})

test("the header menus live inside the top bar, so they inherit its level", () => {
  const start = html.indexOf('<div class="bar">')
  const bar = html.slice(start, html.indexOf('id="avatarMenu"', start) + 200)
  for (const id of ['id="createMenu"', 'id="projPick"', 'id="ntfPanel"', 'id="avatarMenu"']) expect(bar).toContain(id)
})
