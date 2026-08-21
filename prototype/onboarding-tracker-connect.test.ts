// #445 — Onboarding "connect your tracker" step must no longer dead-end when a real tracker (Jira,
// Linear, GitHub, Plane) is picked. Selecting a non-Cloud tracker expands an INLINE connect panel that
// stores per-project connector credentials through the EXISTING connector store (POST /connectors/test
// then POST /connectors), previews the auto-mapping via the connector-meta capability, and — if the
// user defers — persists the intent so the dashboard nudges them to finish. Cloud stays the zero-config
// default and the pre-existing Cloud path is unchanged.
//
// Contract-style guards (string assertions on the shipped HTML) matching the other onboarding/dashboard
// regression tests in this suite.

import { test, expect } from "bun:test"

const ONBOARD = await Bun.file(import.meta.dir + "/../site/onboarding.html").text()
const DASH = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

test("#445 — inline connect panel markup + controls exist", () => {
  expect(ONBOARD).toContain('id="trkPanel"')
  expect(ONBOARD).toContain('id="tpFields"')
  expect(ONBOARD).toContain('onclick="trackerConnect()"')
  expect(ONBOARD).toContain('id="tpErr"')
  expect(ONBOARD).toContain('id="tpMap"')          // auto-mapping preview container
  expect(ONBOARD).toContain('id="tpMapRows"')
})

test("#445 — choosing a non-Cloud tracker expands the panel; Cloud hides it", () => {
  // chooseTracker opens the panel for real trackers and hides it for cloud.
  expect(ONBOARD).toContain("openTrackerPanel(which)")
  expect(ONBOARD).toMatch(/if \(which === 'cloud'\)[\s\S]{0,120}classList\.add\('hide'\)/)
})

test("#445 — Cloud remains the zero-config default (back-compat)", () => {
  expect(ONBOARD).toContain("let trackerChoice = 'cloud'")
  // Cloud option still starts selected in the markup.
  expect(ONBOARD).toContain('class="opt trk sel" id="trkCloud"')
})

test("#445 — Connect verifies creds then persists via the EXISTING connector store", () => {
  // Genuine connectivity check first (unsaved-config test endpoint)...
  expect(ONBOARD).toContain("/connectors/test")
  // ...then create through the same per-project connector store the dashboard uses.
  expect(ONBOARD).toMatch(/\/connectors'[\s\S]{0,200}method:'POST'[\s\S]{0,200}autoCopy: true/)
})

test("#445 — auto-mapping preview is populated from the connector-meta capability", () => {
  expect(ONBOARD).toContain("/connectors/meta")
  expect(ONBOARD).toContain("issue_type_map")
  expect(ONBOARD).toContain("status_map")
})

test("#445 — OAuth is DEFERRED behind a flag, not faked", () => {
  expect(ONBOARD).toContain("const JIRA_OAUTH_ENABLED = false")
  // The OAuth block is hidden unless the flag is on; the API-token path is always available.
  expect(ONBOARD).toContain("type === 'jira' && JIRA_OAUTH_ENABLED")
})

test("#445 — 'Connect later' still proceeds and persists the tracker intent (never a dead-end)", () => {
  expect(ONBOARD).toContain("klav-tracker-pending")
  // trackerContinue always advances to the plan step.
  expect(ONBOARD).toContain("function trackerContinue()")
  expect(ONBOARD).toMatch(/function trackerContinue\(\)\{[\s\S]*?go\(S\.PLAN\)/)
})

test("Codex #4 — connecting persists the suggested auto-mapping onto the saved connector (not just render it)", () => {
  // loadTrackerMapping receives the new connector id and PATCHes the suggested issue_type_map /
  // status_map onto it, so future Feature->Story exports honor the map instead of the default Task.
  expect(ONBOARD).toContain("async function loadTrackerMapping(type, cfg, connectorId)")
  // The new connector id is threaded from the save response into the mapping step.
  expect(ONBOARD).toContain("const newId = create.data.connector && create.data.connector.id")
  expect(ONBOARD).toContain("loadTrackerMapping(type, cfg, newId)")
  // It PATCHes the connector config with the maps (JSON-encoded) — a real persist, not cosmetic.
  expect(ONBOARD).toMatch(/patchCfg\.issue_type_map = JSON\.stringify\(itm\)/)
  expect(ONBOARD).toMatch(/patchCfg\.status_map = JSON\.stringify\(sm\)/)
  expect(ONBOARD).toMatch(/connectors\/'[\s\S]{0,120}method:'PATCH'/)
})

test("Codex #8 — a tracker switch mid-connect cannot show the wrong tracker connected", () => {
  // trackerConnect pins the tracker it is for and bails at every async checkpoint if the choice changed.
  expect(ONBOARD).toContain("const stale = function(){ return trackerChoice !== type }")
  // Guards after the async test AND the async save, plus loadTrackerMapping's own stale check.
  expect((ONBOARD.match(/if \(stale\(\)\) return/g) || []).length).toBeGreaterThanOrEqual(2)
  expect(ONBOARD).toContain("if (trackerChoice !== type) return")
})

test("#445 — dashboard surfaces a 'finish connecting' nudge from the persisted intent", () => {
  expect(DASH).toContain('id="trackerNudge"')
  expect(DASH).toContain("function maybeTrackerNudge")
  expect(DASH).toContain("klav-tracker-pending")
  // Nudge only shows when there's no saved connector of that type yet, and it deep-links into the form.
  expect(DASH).toContain("function openTrackerConnect")
  expect(DASH).toContain('state._connectors || []).some(c => c.type === pending)')
})
