// KLAVITYKLA-221 (JTBD 7.9) — the finding's "Session replay" affordance opens the in-page Walk
// replay player seeked to the exact step it was raised at, instead of dumping raw JSON in a new tab.
// Static-source assertions (dashboard.html has no build step; its DOM/JS contract is source-checkable).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

test("a finding's replay affordance is a player-seek button carrying runId + step offset", () => {
  // No longer a raw-JSON new-tab link…
  expect(html).not.toContain('href="/api/trails/walks/\'+esc(f.runId)+"/replay"')
  // …but a button carrying the run and the per-finding replay step offset.
  expect(html).toContain('data-replay-finding="\'+esc(f.runId)+\'"')
  expect(html).toContain('data-replay-step="\'+(f.replayStepIdx!=null?esc(f.replayStepIdx):"")+\'"')
})

test("the button is wired to openReplay(runId, stepIdx) so the player seeks to that moment", () => {
  expect(html).toContain('qEl.querySelectorAll("button[data-replay-finding]")')
  expect(html).toContain('openReplay(btn.getAttribute("data-replay-finding"),si)')
})

test("openReplay honors a passed focus step, falling back to the first failing step", () => {
  const start = html.indexOf("async function openReplay(runId,focusStepIdx)")
  expect(start).toBeGreaterThan(-1)
  const fn = html.slice(start, start + 1400)
  // uses the caller-supplied step when finite…
  expect(fn).toContain("isFinite(Number(focusStepIdx))")
  // …otherwise falls back to the first amber/red step…
  expect(fn).toContain('return v==="amber"||v==="red"')
  // …and seeks the player to the resolved chapter.
  expect(fn).toContain("chapterForStep(replayState.focusStep)")
})
