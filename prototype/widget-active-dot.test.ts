// KLAVITYKLA-321 regression guard, on the bundle that actually ships.
//
// /widget.js is served verbatim from the COMMITTED packages/sdk/dist/klavity-widget.iife.js (the prod
// box only pulls, it never builds). So a source fix that isn't rebuilt into the bundle ships nothing.
// These assertions therefore run against the built IIFE, not the TS source.
//
// The bug: the launcher's green "Klavity is active" dot used every signifier of an unread-notification
// badge (top-right corner, white ring, infinite pulse halo) and competed with the real red issue-count
// badge. It is now an inline status light in the pill; the corner slot belongs to the count alone.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const bundle = readFileSync(join(import.meta.dir, "..", "packages", "sdk", "dist", "klavity-widget.iife.js"), "utf8")

function ruleFor(selector: string): string {
  const at = bundle.indexOf(selector + "{")
  expect(at).toBeGreaterThan(-1)
  return bundle.slice(at, bundle.indexOf("}", at))
}

test("the active dot is an inline status light, not a corner badge", () => {
  const dot = ruleFor(".kl-active-dot")
  expect(dot).not.toContain("position:absolute")
  expect(dot).not.toContain("top:-")
  expect(dot).not.toContain("right:-")
  // still green, still a dot
  expect(dot).toContain("#22c55e")
  expect(dot).toContain("border-radius:50%")
})

test("the active dot no longer pulses forever", () => {
  expect(bundle).not.toContain("kl-active-pulse")
  expect(ruleFor(".kl-active-dot")).not.toContain("infinite")
})

test("prefers-reduced-motion still disables the dot animation", () => {
  expect(bundle).toMatch(/prefers-reduced-motion: reduce\)\{\.kl-active-dot\{animation:none\}/)
})

test("the corner slot still belongs to the red issue-count badge", () => {
  const badge = ruleFor(".kl-issue-badge")
  expect(badge).toContain("position:absolute")
  expect(badge).toContain("#ef4444")
})

test("the bundle is syntactically valid (a broken bundle ships silently)", () => {
  expect(() => new Function(bundle)).not.toThrow()
})
