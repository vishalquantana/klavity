// KD-3149: the dashboard content fills the screen next to the sidebar on large displays. The main .wrap
// used to be capped at 1380px, leaving a wide blank strip on the right of Overview (and every non-ticket view).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public/dashboard.html"), "utf8").replace(/\r\n/g, "\n")

test("the main content area has no fixed width cap", () => {
  const rule = html.match(/\n    \.wrap \{\n([\s\S]*?)\n    \}/)
  expect(rule).not.toBeNull()
  expect(rule![1]).toContain("margin-left: 214px;")
  expect(rule![1]).toContain("max-width: none;")
  expect(rule![1]).not.toMatch(/max-width:s*d+px/)   // no pixel cap (the comment may mention the old one)
})
