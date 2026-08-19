import { test, expect } from "bun:test"
import { mapExternalStatus } from "./inbound"

// Task 9 (part b): a connector's saved `status_map` (klavity-key → provider-status-name, JSON
// string on cfg, same shape/encoding as `issue_type_map`) is consulted BEFORE the hard-coded
// per-provider mapping. We reverse it (provider name → klavity key) and match the incoming
// provider status name against it. Falls back to the existing hard-coded behavior when there's
// no status_map or no match — back-compat, and an unknown status must still be a no-op.

test("mapExternalStatus honors connector status_map (jira): mapped provider status name → klavity key", () => {
  const cfg = { status_map: JSON.stringify({ done: "Done" }) }
  const payload = { issue: { fields: { status: { name: "Done", statusCategory: { key: "new" } } } } }
  // Note: statusCategory says "new" (would hard-code to "open"), but the connector's own
  // status_map says the literal name "Done" → klavity "done", and that wins.
  expect(mapExternalStatus("jira", payload, cfg)).toBe("done")
})

test("mapExternalStatus status_map match is case-insensitive", () => {
  const cfg = { status_map: JSON.stringify({ done: "Done" }) }
  const payload = { issue: { fields: { status: { name: "done" } } } }
  expect(mapExternalStatus("jira", payload, cfg)).toBe("done")
})

test("mapExternalStatus falls back to hard-coded mapping when status_map has no matching entry", () => {
  const cfg = { status_map: JSON.stringify({ done: "Done" }) }
  // status name "In Review" isn't in the map, but statusCategory "indeterminate" still hard-codes
  // to in_progress — back-compat fallback must still fire.
  const payload = { issue: { fields: { status: { name: "In Review", statusCategory: { key: "indeterminate" } } } } }
  expect(mapExternalStatus("jira", payload, cfg)).toBe("in_progress")
})

test("mapExternalStatus with a status_map still returns null for a truly unknown provider status", () => {
  const cfg = { status_map: JSON.stringify({ done: "Done" }) }
  const payload = { issue: { fields: { status: { name: "Weird Custom Status", statusCategory: { key: "bogus" } } } } }
  expect(mapExternalStatus("jira", payload, cfg)).toBeNull()
})

test("mapExternalStatus with no status_map behaves exactly as before (back-compat, no cfg arg)", () => {
  const payload = { issue: { fields: { status: { statusCategory: { key: "done" } } } } }
  expect(mapExternalStatus("jira", payload)).toBe("done")
})

test("mapExternalStatus with no status_map behaves exactly as before (back-compat, empty cfg)", () => {
  const payload = { issue: { fields: { status: { statusCategory: { key: "done" } } } } }
  expect(mapExternalStatus("jira", payload, {})).toBe("done")
})

test("mapExternalStatus status_map also applies to linear via data.state.name", () => {
  const cfg = { status_map: JSON.stringify({ in_progress: "Cooking" }) }
  const payload = { data: { state: { name: "Cooking", type: "backlog" } } }
  expect(mapExternalStatus("linear", payload, cfg)).toBe("in_progress")
})

test("mapExternalStatus status_map also applies to plane via data.state.name", () => {
  const cfg = { status_map: JSON.stringify({ done: "Shipped" }) }
  const payload = { data: { state: { name: "Shipped" }, state__group: "backlog" } }
  expect(mapExternalStatus("plane", payload, cfg)).toBe("done")
})

test("mapExternalStatus status_map also applies to github via issue.state", () => {
  const cfg = { status_map: JSON.stringify({ done: "closed" }) }
  const payload = { action: "labeled", issue: { state: "closed" } } // non-status action, would hard-code to null
  expect(mapExternalStatus("github", payload, cfg)).toBe("done")
})

test("mapExternalStatus ignores a malformed status_map JSON and falls back safely", () => {
  const cfg = { status_map: "{not json" }
  const payload = { issue: { fields: { status: { statusCategory: { key: "new" } } } } }
  expect(mapExternalStatus("jira", payload, cfg)).toBe("open")
})
