// Single Ticket 2-Column Layout — the dedicated single-ticket PAGE renders a 2-column layout:
// Main column (title, context, description, attachments, occurrence timeline, activity/comments)
// and Properties column (status, priority, assignee, labels, internal notes, merge).
// Previews are unified into the Attachments lightbox overlay modal.
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

test("dedicated page is a 2-column layout (main + properties, no separate evidence column)", () => {
  expect(HTML).toContain('class="t3-col t3-mid"')
  expect(HTML).toContain('class="t3-col t3-right"')
  expect(HTML).toContain('<div class="t3-colh">Properties</div>')
})

test("the editorial title (single-head) is relocated INTO the middle column on the page", () => {
  expect(HTML).toContain('const _midCol = detailEl.querySelector(".t3-mid")')
  expect(HTML).toContain("_midCol.insertBefore(head, _midCol.firstChild)")
  // and it is styled as a 26px editorial headline scoped to the page middle column
  expect(HTML).toContain("#ticketSingle.tkt-page .t3-mid .single-title{font-size:26px")
})

test("occurrence receipts relocate into the main column below attachments, merge into the RIGHT column", () => {
  // the guarded _footer construction is preserved (nodes are re-parented, not rebuilt)
  expect(HTML).toContain('_footer.appendChild(buildOccurrenceTimeline(t.id))')
  expect(HTML).toContain('_footer.appendChild(buildMergeControl(t.id))')
  expect(HTML).toContain('const _occEl = _footer.querySelector(".tkt-occ-wrap")')
  expect(HTML).toContain('const _mrgEl = _footer.querySelector(".tkt-merge-wrap")')
  expect(HTML).toContain('const _occMount = detailEl.querySelector(".t3-occ-mount")')
  expect(HTML).toContain("if (_occEl && _occMount) _occMount.appendChild(_occEl)")
  expect(HTML).toContain("if (_mrgEl) _rightCol.appendChild(_mrgEl)")
  // the merge lands in a dashed container in the right column
  expect(HTML).toContain("#ticketSingle.tkt-page .t3-right .tkt-merge-wrap{border:1px dashed var(--line)")
})

test("attachments thumbnail click opens preview in rich lightbox modal with tools", () => {
  expect(HTML).toContain("function openMediaPreview(o)")
  expect(HTML).toContain("function wireAttachments(detailEl, t, ticketId)")
  expect(HTML).toContain("media-pv-media-holder")
  expect(HTML).toContain("media-pv-tools")
  expect(HTML).toContain("media-pv-nav")
})

test("cockpit uses ONLY the app's own tokens — no external Google Fonts CDN / Unsplash images", () => {
  expect(HTML).not.toContain("fonts.googleapis.com")
  expect(HTML).not.toContain("fonts.gstatic.com")
  expect(HTML).not.toContain("images.unsplash.com")
  expect(HTML).not.toContain("commondatastorage.googleapis.com")
  expect(HTML).toContain("#ticketSingle.tkt-page .t3-mid .single-meta{font-family:var(--mono)")
})
