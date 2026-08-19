import { test, expect } from "bun:test"
import { resolveIssueType } from "./index"
test("kind-specific wins", () => {
  const cfg = { issue_type_map: JSON.stringify({ bug: "Bug", feature: "Story", default: "Task" }) }
  expect(resolveIssueType(cfg, "bug", "X")).toBe("Bug")
  expect(resolveIssueType(cfg, "feature", "X")).toBe("Story")
})
test("falls back to default then legacy issue_type then arg fallback", () => {
  expect(resolveIssueType({ issue_type_map: JSON.stringify({ default: "Task" }) }, undefined, "X")).toBe("Task")
  expect(resolveIssueType({ issue_type: "Legacy" }, "bug", "X")).toBe("Legacy")
  expect(resolveIssueType({}, "bug", "Task")).toBe("Task")
})
test("malformed map does not throw", () => {
  expect(resolveIssueType({ issue_type_map: "{not json" }, "bug", "Task")).toBe("Task")
})
