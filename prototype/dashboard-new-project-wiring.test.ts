// Regression guard for the "New client project" (KLA-292) Create button doing nothing.
//
// Root cause: the modal markup (#npBg/#npName/#npUrl/#npCreate) is placed in the document AFTER the main
// inline <script> block that wired it. A classic inline script only sees DOM parsed before it, so the
// `$("npCreate").onclick = createProject` binding ran while #npCreate did not yet exist — the `&&` guard
// short-circuited and no click handler was ever attached (Cancel worked only because it uses an inline
// onclick= attribute). Fix: defer the wiring to DOMContentLoaded, when the modal elements exist.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

test("New-project modal wiring is deferred to DOMContentLoaded (elements are parsed after the script)", () => {
  // The wiring lives in a named function...
  expect(html).toContain("const wireNewProjectModal =")
  // ...that binds Create → createProject...
  expect(html).toContain('$("npCreate").onclick = createProject')
  // ...and is registered on DOMContentLoaded (not run bare at parse time, when #npCreate does not exist).
  expect(html).toMatch(/DOMContentLoaded"\s*,\s*wireNewProjectModal/)
})

test("#npCreate button and its handler function both exist", () => {
  expect(html).toContain('id="npCreate"')
  expect(html).toContain("async function createProject()")
  // The modal markup is genuinely after the main script block, which is why deferral is required.
  expect(html.indexOf('id="npCreate"')).toBeGreaterThan(html.indexOf("const wireNewProjectModal ="))
})
