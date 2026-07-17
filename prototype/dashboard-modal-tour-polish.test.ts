// Guards for two dashboard polish fixes:
//  1) The onboarding tour gains an explicit "Skip tour" button (beyond ×/Esc/click-away) so a
//     first-time user is never stuck under the auto-launched driver.js overlay.
//  2) The New-project modal inputs (#npBg input) get the app's standard input styling — previously
//     they only had an inline width and fell back to the thin browser base, looking cramped.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

test("tour renders an explicit Skip-tour button via onPopoverRender", () => {
  expect(html).toContain("onPopoverRender:")
  expect(html).toContain('className = "klav-skip-tour"')
  expect(html).toContain('skip.textContent = "Skip tour"')
  // it destroys the running tour on click
  expect(html).toMatch(/klav-skip-tour[\s\S]{0,400}d\.destroy\(\)/)
  // and is themed
  expect(html).toContain(".driver-popover.klav-tour .klav-skip-tour")
})

test("New-project modal inputs use the app-standard input styling", () => {
  // scoped rule brings padding/radius/font + focus ring, matching .invite input / #schedBg input
  expect(html).toMatch(/#npBg input\{[^}]*padding:10px 12px/)
  expect(html).toMatch(/#npBg input\{[^}]*border-radius:10px/)
  expect(html).toContain("#npBg input:focus")
})
