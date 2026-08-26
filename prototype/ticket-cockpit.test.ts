// #726: Single Ticket Studio Cockpit — the dedicated single-ticket PAGE is re-laid-out into an
// edge-to-edge media cockpit (faithful to the approved mockup). This guards the cockpit RE-LAYOUT of the
// existing #725 3-col page: the title relocates into the middle column, occurrence receipts into the LEFT
// (Evidence) column, and the merge control into the RIGHT (Properties) column — while every real handler
// (built by buildTktDetail / _footer) is preserved. It also guards the evidence thumbnail strip and that
// NO external CDN fonts/images were introduced (the app stays on-brand + offline).
import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

test("left column is relabelled 'Evidence & Media' (the media gallery), not just 'Screenshot'", () => {
  expect(HTML).toContain('<div class="t3-colh">Evidence &amp; Media</div>')
})

test("the editorial title (single-head) is relocated INTO the middle column on the page", () => {
  expect(HTML).toContain('const _midCol = detailEl.querySelector(".t3-mid")')
  expect(HTML).toContain("_midCol.insertBefore(head, _midCol.firstChild)")
  // and it is styled as a 26px editorial headline scoped to the page middle column
  expect(HTML).toContain("#ticketSingle.tkt-page .t3-mid .single-title{font-size:26px")
})

test("occurrence receipts relocate into the LEFT column, merge into the RIGHT column", () => {
  // the guarded _footer construction is preserved (nodes are re-parented, not rebuilt)
  expect(HTML).toContain('_footer.appendChild(buildOccurrenceTimeline(t.id))')
  expect(HTML).toContain('_footer.appendChild(buildMergeControl(t.id))')
  expect(HTML).toContain('const _occEl = _footer.querySelector(".tkt-occ-wrap")')
  expect(HTML).toContain('const _mrgEl = _footer.querySelector(".tkt-merge-wrap")')
  expect(HTML).toContain("if (_occEl) _leftCol.appendChild(_occEl)")
  expect(HTML).toContain("if (_mrgEl) _rightCol.appendChild(_mrgEl)")
  // the merge lands in a dashed container in the right column
  expect(HTML).toContain("#ticketSingle.tkt-page .t3-right .tkt-merge-wrap{border:1px dashed var(--line)")
})

test("evidence thumbnail strip wires the real screenshot + replay + recordings, and degrades to none", () => {
  expect(HTML).toContain("function buildEvidenceStrip(t, detailEl)")
  expect(HTML).toContain("buildEvidenceStrip(t, detailEl)")
  // graceful degrade: a lone screenshot with no replay/recordings shows no strip (stage stays big)
  expect(HTML).toContain("if (items.length < 2) return")
  // real handlers: screenshot thumb from the screenshots API, replay opens the existing viewer,
  // recording thumbs play the paired <video> already rendered by buildRecordingsHtml
  expect(HTML).toContain('img.src = "/api/screenshots/" + encodeURIComponent(String(t.screenshotId)) + "?thumb=1"')
  expect(HTML).toContain("try { openReplay(t.id) } catch (e) {}")
  expect(HTML).toContain('detailEl.querySelectorAll("video.tkt-rec-video")')
  // strip styling exists
  expect(HTML).toContain(".t3-ev-thumb.active{border-color:var(--indigo)")
})

test("cockpit uses ONLY the app's own tokens — no external Google Fonts CDN / Unsplash images", () => {
  // the mockup pulled Fraunces/Hanken/JetBrains from fonts.googleapis + Unsplash photos; the real page
  // must stay on-brand + offline (the app already defines --display/--body/--mono locally at :root).
  expect(HTML).not.toContain("fonts.googleapis.com")
  expect(HTML).not.toContain("fonts.gstatic.com")
  expect(HTML).not.toContain("images.unsplash.com")
  expect(HTML).not.toContain("commondatastorage.googleapis.com")
  // the cockpit CSS references the app's existing display/mono tokens, not new hardcoded font stacks
  expect(HTML).toContain("#ticketSingle.tkt-page .t3-mid .single-meta{font-family:var(--mono)")
})
