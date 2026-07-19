// KLAVITYKLA-284 — Outcome-first connector setup [JTBD 5.5]
// The connector setup surface is reframed around the OUTCOME ("your bugs auto-appear in your
// tracker as issues") rather than raw config fields. These guards assert the outcome-first copy
// and the per-type outcome banner are present, and that setup stays functional (fields still render).
import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"

const html = readFileSync(join(import.meta.dir, "public", "dashboard.html"), "utf8")

test("section header leads with the outcome, not 'External destinations'", () => {
  expect(html).toContain("Send your bugs straight into your team's tracker")
  // old raw-config framing is gone
  expect(html).not.toContain("External destinations <span class=\"muted\">(optional")
})

test("empty state frames connecting as an outcome", () => {
  expect(html).toContain("your bugs live only in Klavity")
  expect(html).toContain("auto-appear in Jira, Plane, GitHub or Linear as issues")
})

test("a per-type outcome map covers every tracker and renders above the fields", () => {
  expect(html).toContain("const CONN_OUTCOME = {")
  for (const t of ["github", "jira", "linear", "plane", "webhook"]) {
    expect(html).toContain(t + ":")
  }
  // each tracker outcome names the tracker + the auto-appear promise
  expect(html).toContain("auto-appears in GitHub as an issue")
  expect(html).toContain("auto-appears in Jira as an issue")
  expect(html).toContain("auto-appears in Linear as an issue")
  expect(html).toContain("auto-appears in Plane as an issue")
  // banner is rendered before the credential fields
  expect(html).toContain('class="conn-outcome field-full"')
  expect(html).toContain("outcomeHtml + helpHtml + fieldsHtml + syncPanel")
})

test("connOutcomeLine falls back for unknown types", () => {
  // the fallback keeps the outcome framing even for a type not in the map
  expect(html).toMatch(/CONN_OUTCOME\[type\] \|\| "Every bug your users report is pushed/)
})

test("CTA + auto-copy copy is outcome-led while staying functional", () => {
  expect(html).toContain("+ Connect a tracker")
  expect(html).toContain(">Connect tracker<")
  expect(html).toContain("Auto-file every new bug here")
  // config still functional: the field renderer and save/test handlers are untouched
  expect(html).toContain("function renderConnectorFields(type, editConfig)")
  expect(html).toContain('projPath("/connectors")')
})
