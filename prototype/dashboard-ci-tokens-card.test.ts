// wip/ci-token-settings — the Settings "API tokens" card must be REACHABLE and copy-once from the UI.
// Pins the SURFACE (no DOM/network/server): the card lives in the Settings view, admin-gated; it lists
// tokens, mints named tokens via the project-scoped endpoint, reveals the full token ONCE with a
// copy-once warning + MCP/curl snippets, and revokes inline (no native confirm()).

import { test, expect } from "bun:test"

const DASH = await Bun.file(import.meta.dir + "/public/dashboard.html").text()
const CARD = DASH.slice(DASH.indexOf('id="ciDrawer"'), DASH.indexOf('id="ciUser"') + 200)
const SCRIPT = DASH.slice(DASH.indexOf("// ── Developer / API tokens (wip/ci-token-settings)"), DASH.indexOf("_wireCi()\n"))

test("Settings surfaces an admin-gated API tokens card", () => {
  const m = DASH.match(/<details class="([^"]*)" id="ciDrawer" data-view="settings">/)
  expect(m).toBeTruthy()
  // Title + explanatory line.
  expect(CARD).toContain("API tokens")
  expect(CARD).toMatch(/trigger AutoSims via REST or MCP/i)
  // Admin vs non-admin split (visibility toggled by the existing render() gate).
  expect(CARD).toContain('id="ciAdmin"')
  expect(CARD).toContain('id="ciUser"')
})

test("card lists tokens and has a New token button + name field", () => {
  expect(CARD).toContain('id="ciTokenList"')
  expect(CARD).toContain('id="ciNewTokenBtn"')
  expect(CARD).toContain('id="ciTokenName"')
  expect(CARD).toContain('id="ciCreateBtn"')
})

test("copy-once reveal: read-only field + Copy + explicit 'you won't see this again' warning", () => {
  expect(CARD).toContain('id="ciReveal"')
  const reveal = CARD.slice(CARD.indexOf('id="ciReveal"'), CARD.indexOf('id="ciReveal"') + 1600)
  expect(reveal).toMatch(/readonly/)
  expect(reveal).toContain('id="ciRevealVal"')
  expect(reveal).toContain('id="ciRevealCopy"')
  expect(reveal).toMatch(/won't be able to see this again/i)
})

test("reveal includes ready-to-paste .mcp.json + curl snippets", () => {
  expect(CARD).toContain('id="ciMcpSnippet"')
  expect(CARD).toContain('id="ciCurlSnippet"')
  // The snippet builder wires the real endpoints (MCP http url + authored-runs REST).
  expect(SCRIPT).toContain('"/mcp"')
  expect(SCRIPT).toContain("/api/v1/authored-runs")
  expect(SCRIPT).toContain('"klavity-autosim"')
  expect(SCRIPT).toContain("project_id")
})

test("mint/list/revoke call the project-scoped ci-tokens endpoint", () => {
  expect(SCRIPT).toContain('"/api/projects/" + encodeURIComponent(pid) + "/ci-tokens"')
  // Revoke is a DELETE by id.
  expect(SCRIPT).toContain('/ci-tokens/" + encodeURIComponent(id)')
  expect(SCRIPT).toContain('method: "DELETE"')
})

test("revoke uses an inline confirm, NOT native confirm() (harness-safe)", () => {
  expect(SCRIPT).toContain("data-ci-confirm")
  expect(SCRIPT).toContain("data-ci-cancel")
  expect(SCRIPT).not.toMatch(/\bconfirm\s*\(/) // no window.confirm() in the token script
})

test("no smart quotes in the card + its script (has broken the site before)", () => {
  // Emoji is covered by the dedicated repo guard (scripts/check-no-emoji.mjs); here we pin smart quotes.
  expect(CARD).not.toMatch(/[‘’“”]/)
  expect(SCRIPT).not.toMatch(/[‘’“”]/)
})
