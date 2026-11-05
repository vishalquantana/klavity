// Bug: the "Your Sims" count floated alone in the middle of the header row. The shared `.card h2 .count` rule pushes
// counts right (margin-left:auto) and this header's "Run history" link ALSO has margin-left:auto, so the two auto
// margins split the free space. The Sims header now keeps the count next to its title.
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const HTML = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8").replace(/\r\n/g, "\n")
const rule = (sel: string) => { const i = HTML.indexOf("\n    " + sel + " {"); return i < 0 ? null : HTML.slice(i, HTML.indexOf("}", i) + 1) }

test("the Sims header count sits right after the title (no auto margin)", () => {
  expect(rule(".sims-hero h2 .count")).toMatch(/margin-left:\s*0/)
  // The shared rule is unchanged, so other card headers keep their right-aligned counts.
  expect(rule(".card h2 .count")).toMatch(/margin-left:\s*auto/)
})

test("markup order: title, count, then the right-aligned Run history link", () => {
  const h = HTML.slice(HTML.indexOf('<div class="card full sims-hero"'), HTML.indexOf('id="newSimBtn"'))
  const title = h.indexOf("Your Sims"), count = h.indexOf('id="simsCount"'), runs = h.indexOf('id="simRunsLink"')
  expect(title).toBeGreaterThan(-1)
  expect(title).toBeLessThan(count)
  expect(count).toBeLessThan(runs)
  expect(h.slice(runs - 80, runs + 80)).toContain("margin-left:auto") // the link is what goes to the right
})

test("an empty count is hidden, and a filled one is labelled for screen readers", () => {
  expect(rule(".sims-hero h2 .count:empty")).toContain("display: none")
  expect(HTML).toContain('const lbl = sims.length + " Sim" + (sims.length === 1 ? "" : "s")')
})
