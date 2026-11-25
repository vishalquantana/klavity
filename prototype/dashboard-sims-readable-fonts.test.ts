// Bug: text on the Sims tab cards (Sim role/description, observation text, meta) was too small to read comfortably.
// Guard the minimum sizes so they don't quietly shrink back.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
function fontPx(selector: string): number {
  const i = HTML.indexOf("\n    " + selector + " {")
  if (i < 0) throw new Error("rule not found: " + selector)
  const rule = HTML.slice(i, HTML.indexOf("}", i))
  const m = rule.match(/font-size:\s*([\d.]+)px/)
  if (!m) throw new Error("no font-size in " + selector)
  return Number(m[1])
}

test.each([
  [".sf-hd .name", 15],
  [".sf-hd .role", 13],
  [".sf-ob-text", 15],
  [".sf-ob-meta", 12],
  [".sf-none", 14],
  [".sf-triage", 13],
  [".sf-badge", 11],
  [".sf-state", 11],
  [".sf-act", 13],
])("%s is at least %ipx", (selector, min) => {
  expect(fontPx(selector)).toBeGreaterThanOrEqual(min)
})

test("observation text has comfortable line spacing", () => {
  const i = HTML.indexOf("\n    .sf-ob-text {")
  expect(HTML.slice(i, HTML.indexOf("}", i))).toMatch(/line-height:\s*1\.[5-9]/)
})
