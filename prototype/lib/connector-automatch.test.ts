import { test, expect } from "bun:test"
import { autoMatch } from "./connector-automatch"
test("exact case-insensitive match", () => {
  const r = autoMatch({ key: "bug", label: "Bug" }, ["Bug", "Story", "Task"])
  expect(r.status).toBe("matched"); expect(r.suggested).toBe("Bug")
})
test("single synonym match", () => {
  const r = autoMatch({ key: "feature", label: "Feature" }, ["Story", "Task", "Bug"])
  expect(r.status).toBe("matched"); expect(r.suggested).toBe("Story")
})
test("multiple synonym candidates -> ambiguous", () => {
  const r = autoMatch({ key: "done", label: "Done" }, ["Done", "Resolved"])
  // 'Done' is an exact match -> matched, so use a case where two synonyms hit and none is exact:
  const r2 = autoMatch({ key: "done", label: "Complete" }, ["Resolved", "Closed"])
  expect(r2.status).toBe("ambiguous"); expect(r2.candidates.sort()).toEqual(["Closed","Resolved"])
})
test("no candidate -> unmatched", () => {
  const r = autoMatch({ key: "dismissed", label: "Dismissed" }, ["To Do", "In Progress"])
  expect(r.status).toBe("unmatched"); expect(r.suggested).toBeNull()
})

// KD-165: the new QA Review board stage should auto-suggest against however a connected tracker
// happens to name its equivalent column — trackers vary a lot here, so several synonyms are covered.
test("QA Review: exact label match", () => {
  const r = autoMatch({ key: "qa_review", label: "QA Review" }, ["To Do", "QA Review", "Done"])
  expect(r.status).toBe("matched"); expect(r.suggested).toBe("QA Review")
})
test("QA Review: matches common tracker synonyms", () => {
  expect(autoMatch({ key: "qa_review", label: "QA Review" }, ["Backlog", "In Review", "Done"]).suggested).toBe("In Review")
  expect(autoMatch({ key: "qa_review", label: "QA Review" }, ["Backlog", "Testing", "Done"]).suggested).toBe("Testing")
  expect(autoMatch({ key: "qa_review", label: "QA Review" }, ["Backlog", "Code Review", "Done"]).suggested).toBe("Code Review")
})
test("QA Review: no candidate on a tracker with no review-ish column -> unmatched", () => {
  const r = autoMatch({ key: "qa_review", label: "QA Review" }, ["To Do", "In Progress", "Done"])
  expect(r.status).toBe("unmatched"); expect(r.suggested).toBeNull()
})
