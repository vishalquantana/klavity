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

// PX4 #411: Task/Query default to the tracker's DEFAULT issue type (issue_type_map.default) unless the admin
// added an explicit per-kind override — the same issue_type_map the bug/feature mapping already flows through.
test("task/query resolve to issue_type_map.default when the admin has NOT overridden them", () => {
  const cfg = { issue_type_map: JSON.stringify({ bug: "Bug", feature: "Story", default: "Task" }) }
  expect(resolveIssueType(cfg, "task", "X")).toBe("Task")
  expect(resolveIssueType(cfg, "query", "X")).toBe("Task")
})
test("an admin per-kind override for task/query wins over the default", () => {
  const cfg = { issue_type_map: JSON.stringify({ bug: "Bug", default: "Task", task: "Sub-task", query: "Question" }) }
  expect(resolveIssueType(cfg, "task", "X")).toBe("Sub-task")
  expect(resolveIssueType(cfg, "query", "X")).toBe("Question")
})
test("task/query with no map at all fall back to the caller-supplied fallback (tracker default)", () => {
  expect(resolveIssueType({}, "task", "Task")).toBe("Task")
  expect(resolveIssueType({ issue_type: "Legacy" }, "query", "X")).toBe("Legacy")
})
