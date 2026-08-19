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
