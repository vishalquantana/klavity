// KLA-317 — "the session replay is not working".
//
// Root cause: the ticket "Session replay" viewer built its modal with id="replayBg" /
// "replayNote" / "replayClose" — the SAME ids the AutoSims Walk-replay modal already uses in
// static markup further down dashboard.html. __ensureReplayModal() therefore found the Walk
// modal, returned it early without ever creating the ticket player's markup, and openReplay()
// mounted the rrweb player into a #replayPlayerHost that does not exist inside that modal ->
// every click on a ticket's replay button died with "Could not start the player".
//
// These guards are static-source assertions (the same shape as the other dashboard-*.test.ts
// files): dashboard.html has no build step, so its DOM contract is checkable from the source.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

// Known-duplicate ids that are NOT a bug: two mutually-exclusive render templates in the same
// JS block emit the same live-view <img>. Only one is ever in the DOM at a time.
const KNOWN_DUPLICATE_IDS = new Set(["ntLiveFrame"])

test("dashboard.html has no duplicate element ids (static markup + JS-built templates)", () => {
  const counts = new Map<string, number>()
  for (const m of html.matchAll(/\bid=["']([A-Za-z][\w:-]*)["']/g)) {
    const id = m[1]
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  const dupes = [...counts.entries()]
    .filter(([id, n]) => n > 1 && !KNOWN_DUPLICATE_IDS.has(id))
    .map(([id, n]) => `${id} x${n}`)
  expect(dupes).toEqual([])
})

test("the ticket session-replay modal does not reuse the Walk-replay modal's ids", () => {
  // The Walk modal owns these in static markup; the ticket viewer must not build its own.
  for (const id of ["replayBg", "replayNote", "replayClose"]) {
    expect(html).not.toContain(`bg.id = "${id}"`)
    expect(html).not.toContain(`<button id="${id}"`)
    expect(html).not.toContain(`<div id="${id}"`)
  }
  // ...and uses its own prefixed ids instead.
  expect(html).toContain('bg.id = "fbReplayBg"')
  expect(html).toContain('id="fbReplayPlayerHost"')
  expect(html).toContain('id="fbReplayNote"')
  expect(html).toContain('id="fbReplayClose"')
})

test("openReplay(feedbackId) mounts the player into the host it actually creates", () => {
  const start = html.indexOf("async function openReplay(feedbackId)")
  expect(start).toBeGreaterThan(-1)
  const fn = html.slice(start, start + 2000)
  // fetches the per-feedback replay endpoint...
  expect(fn).toContain('"/api/feedback/" + encodeURIComponent(feedbackId) + "/replay"')
  // ...and targets the host __ensureReplayModal() injects, not the Walk modal's.
  expect(fn).toContain('document.getElementById("fbReplayPlayerHost")')
  expect(fn).not.toContain('document.getElementById("replayPlayerHost")')
  expect(fn).not.toContain('document.getElementById("replayNote")')
})

test("the replay player bundle is not re-injected when the page already loaded it", () => {
  // The AutoSims view ships <script src="/vendor/klv-view.min.js"> eagerly; the lazy loader must
  // reuse that global instead of fetching a second ~130 KB copy.
  expect(html).toContain('<script src="/vendor/klv-view.min.js"></script>')
  expect(html).toMatch(/if \(window\.rrwebPlayer\) \{[^}]*__ensureReplayCss\(\)/)
})
