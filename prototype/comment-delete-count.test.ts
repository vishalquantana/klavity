import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

// KD-182: deleting a comment removed it from the list but left the Comments tab count unchanged, and a
// comment posted in the same session could come back on the next repaint (it lived on in localComments).
const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

test("a successful comment delete notifies the owning timeline before removing the row (KD-182)", () => {
  const i = html.indexOf('el.dispatchEvent(new CustomEvent("klav:comment-deleted"')
  expect(i).toBeGreaterThan(-1)
  expect(html.indexOf("el.remove()", i)).toBeGreaterThan(i) // dispatched first so it still bubbles to the timeline
})

test("the timeline drops the deleted comment everywhere and repaints, recomputing the tab count (KD-182)", () => {
  const start = html.indexOf('wrap.addEventListener("klav:comment-deleted"')
  expect(start).toBeGreaterThan(-1)
  const handler = html.slice(start, html.indexOf("})", start) + 2)
  expect(handler).toContain("deletedCommentIds.add(")
  expect(handler).toContain("localComments.splice(")
  expect(handler).toContain('_tktReads.delete(String(ticketId) + "|timeline")')
  expect(handler).toContain("paintTimeline(lastServerItems)")
  // paintTimeline filters deleted comments out of server items, so a stale read can't resurrect one
  expect(html).toContain('deletedCommentIds.has(String(it.id))')
  // and the tab count is derived from the painted comment list
  expect(html).toContain('_setTabCount("comments", cmts.length)')
})
