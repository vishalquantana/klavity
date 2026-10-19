import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// KD-239: typing a comment in a ticket opened from the board (side panel), the page seemed to "reload" after a while
// and the half-typed comment vanished. Opening a ticket from the board writes ?ticket=<id> into the URL; the next
// background refresh (the ~25s poll, or any refresh after a change) ran maybeOpenDeepLinkTicket(), took that for a
// fresh shared link and re-opened the ticket full-page — rebuilding the detail, comment box and all.
const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

test("opening any ticket marks the boot deep link as consumed, before anything else runs", () => {
  const start = html.indexOf("    async function openSingleTicket(id, mode) {")
  expect(start).toBeGreaterThan(-1)
  const head = html.slice(start, start + 900)
  const flag = head.indexOf("_deepLinkTicketConsumed = true")
  expect(flag).toBeGreaterThan(-1)
  // set ahead of the first await, so a refresh landing mid-open can't re-open the ticket either
  const firstAwait = html.indexOf("await ", start)
  expect(start + flag).toBeLessThan(firstAwait)
})

test("the refresh path's auto-open stays a once-per-page-load action guarded by that flag", () => {
  const fn = html.slice(html.indexOf("function maybeOpenDeepLinkTicket()"), html.indexOf("function maybeOpenDeepLinkTicket()") + 400)
  expect(fn).toContain("if (_deepLinkTicketConsumed) return")
  // refreshAll still calls it (a genuine ?ticket= shared link must still open on load)
  const refresh = html.slice(html.indexOf("    async function refreshAll(isPoll) {"), html.indexOf("    async function refreshAll(isPoll) {") + 6000)
  expect(refresh).toContain("maybeOpenDeepLinkTicket()")
})
