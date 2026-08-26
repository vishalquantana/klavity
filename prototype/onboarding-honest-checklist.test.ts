// Honest checklist (audit 2026-08, "Honest step-3 checklist" row): the step-3 list shipped
// pre-ticked ("Opened your product ✓, Scanning pages ✓") while the real pipeline ran — fake
// progress. Items are now unticked in markup and ticked by uhChkTo(stage) only when the mapped
// pipeline event actually happens:
//   stage 0 active = persona fetch started · 1 done = cast rendered · 2 = live visit started
//   3 done = screenshot captured (shot painted into the browser frame) · 4 = reaction on screen.
// Failure paths freeze via uhChkIdle(n) so a spinner never lies about work that stopped.
//
// Contract-style guards (string assertions on the shipped HTML), matching the suite convention.

import { test, expect } from "bun:test"

const ONBOARD = await Bun.file(import.meta.dir + "/../site/onboarding.html").text()

test("honest-checklist — no pre-ticked items in shipped markup", () => {
  const chk = ONBOARD.slice(ONBOARD.indexOf('id="uhChk"'), ONBOARD.indexOf("</section>", ONBOARD.indexOf('id="uhChk"')))
  expect(chk).toContain("Reading your page")
  expect(chk).not.toContain('class="li done"')
  expect(chk).not.toContain('class="li act"')
  expect((chk.match(/class="li"/g) || []).length).toBe(4)
})

test("honest-checklist — ticks are driven by real pipeline events", () => {
  // fetch start activates item 1
  expect(ONBOARD).toMatch(/uhWaitTimer=setInterval[\s\S]{0,420}uhChkTo\(0\)/)
  // personas returned → item 1 ticks; empty cast freezes honestly at 1 done / nothing active
  expect(ONBOARD).toMatch(/klav-aha-sims-seen','1'.{0,40}checklist stage 1 done.{0,200}uhChkTo\(1\)/s)
  expect(ONBOARD).toMatch(/empty cast \(after retry\): tick what genuinely happened[\s\S]{0,240}uhChkIdle\(1\)/)
  // live visit started → klavPreviewReact advances; reaction render completes all four
  expect(ONBOARD).toMatch(/checklist stage 2: the live visit actually started[\s\S]{0,60}uhChkTo\(2\)/)
  expect(ONBOARD).toMatch(/checklist stage 4: the reaction is on screen[\s\S]{0,60}uhChkTo\(4\)/)
})

test("honest-checklist — failure paths never leave a spinner running", () => {
  const fn = ONBOARD.slice(ONBOARD.indexOf("window.klavPreviewReact"), ONBOARD.indexOf("// ── URL → Meet your Sims"))
  expect(fn.match(/uhChkIdleAt\(2\)/g)?.length).toBe(2)   // both failure branches freeze at 2
  expect(ONBOARD).toContain("function uhChkIdle(")         // neutral-state helper exists
})
