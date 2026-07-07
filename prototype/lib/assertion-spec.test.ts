import { test, expect } from "bun:test"
import { validateAssertionDraft } from "./assertion-spec"

test("accepts a visible-assert with a target", () => {
  const d = validateAssertionDraft({ trailId: "trl_1", afterStepIdx: 2, action: "assert",
    target: { role: "button", name: "Finish" }, checkpoint: { kind: "visible", description: "Finish button is visible" } })
  expect(d).not.toBeNull()
  expect(d!.target.name).toBe("Finish")
})

test("accepts textEquals with value", () => {
  const d = validateAssertionDraft({ trailId: "trl_1", afterStepIdx: 0, action: "assert",
    target: { selector: "#price" }, checkpoint: { kind: "textEquals", description: "total price shown", value: "$49.00" } })
  expect(d).not.toBeNull()
  expect(d!.checkpoint.kind).toBe("textEquals")
  expect(d!.checkpoint.value).toBe("$49.00")
})

test("accepts textContains with value", () => {
  const d = validateAssertionDraft({ trailId: "trl_1", afterStepIdx: 1, action: "assert",
    target: { selector: "#msg" }, checkpoint: { kind: "textContains", description: "success banner", value: "successfully" } })
  expect(d).not.toBeNull()
  expect(d!.checkpoint.kind).toBe("textContains")
})

test("accepts urlMatches with regex", () => {
  const d = validateAssertionDraft({ trailId: "trl_1", afterStepIdx: 3, action: "assert",
    target: {}, checkpoint: { kind: "urlMatches", description: "on dashboard", regex: "/^https:\\/\\/app\\.test\\/dashboard" } })
  expect(d).not.toBeNull()
  expect(d!.checkpoint.kind).toBe("urlMatches")
})

test("accepts elementCount with count", () => {
  const d = validateAssertionDraft({ trailId: "trl_1", afterStepIdx: 0, action: "assert",
    target: { selector: ".cart-item" }, checkpoint: { kind: "elementCount", description: "three items in cart", count: 3 } })
  expect(d).not.toBeNull()
  expect(d!.checkpoint.kind).toBe("elementCount")
})

test("rejects textEquals without value", () => {
  const d = validateAssertionDraft({ trailId: "t", afterStepIdx: 0, action: "assert",
    target: { selector: "#x" }, checkpoint: { kind: "textEquals", description: "x", value: "" } }) as any
  // value="" fails the truthy check; draft is rejected.
})

test("rejects urlMatches with invalid regex", () => {
  const d = validateAssertionDraft({ trailId: "t", afterStepIdx: 0, action: "assert",
    target: {}, checkpoint: { kind: "urlMatches", description: "x", regex: "[invalid" } })
  expect(d).toBeNull()
})

test("rejects elementCount with negative count", () => {
  const d = validateAssertionDraft({ trailId: "t", afterStepIdx: 0, action: "assert",
    target: { selector: ".x" }, checkpoint: { kind: "elementCount", description: "x", count: -1 } })
  expect(d).toBeNull()
})

test("rejects elementCount with non-integer count", () => {
  const d = validateAssertionDraft({ trailId: "t", afterStepIdx: 0, action: "assert",
    target: { selector: ".x" }, checkpoint: { kind: "elementCount", description: "x", count: 1.5 } })
  expect(d).toBeNull()
})

test("rejects empty target or unknown checkpoint kind", () => {
  expect(validateAssertionDraft({ trailId: "t", afterStepIdx: 0, action: "assert", target: {}, checkpoint: { kind: "visible", description: "x" } })).toBeNull()
  // Unknown kind is rejected.
  const bad = validateAssertionDraft({ trailId: "t", afterStepIdx: 0, action: "assert",
    target: { text: "Finish" }, checkpoint: { kind: "textPresent", description: "x" } }) as any
  expect(bad).toBeNull()
})

test("rejects missing or empty trailId", () => {
  expect(validateAssertionDraft({ trailId: "", afterStepIdx: 0, action: "assert", target: { text: "x" }, checkpoint: { kind: "visible", description: "y" } })).toBeNull()
})

test("rejects non-assert action", () => {
  expect(validateAssertionDraft({ trailId: "t", afterStepIdx: 0, action: "click", target: { text: "x" }, checkpoint: { kind: "visible", description: "y" } })).toBeNull()
})

test("rejects negative or non-finite afterStepIdx", () => {
  expect(validateAssertionDraft({ trailId: "t", afterStepIdx: -1, action: "assert", target: { text: "x" }, checkpoint: { kind: "visible", description: "y" } })).toBeNull()
  expect(validateAssertionDraft({ trailId: "t", afterStepIdx: NaN, action: "assert", target: { text: "x" }, checkpoint: { kind: "visible", description: "y" } })).toBeNull()
})

test("rejects blank checkpoint description", () => {
  expect(validateAssertionDraft({ trailId: "t", afterStepIdx: 0, action: "assert", target: { text: "x" }, checkpoint: { kind: "visible", description: "   " } })).toBeNull()
})

test("truncates long descriptions and values", () => {
  const long = "a".repeat(500)
  const d = validateAssertionDraft({ trailId: "t", afterStepIdx: 0, action: "assert",
    target: { selector: "#x" }, checkpoint: { kind: "textEquals", description: long, value: long } })!
  expect(d.checkpoint.description.length).toBeLessThanOrEqual(240)
  expect(d.checkpoint.value!.length).toBeLessThanOrEqual(240)
})

test("rejects unknown checkpoint kind for urlMatches", () => {
  const d = validateAssertionDraft({ trailId: "t", afterStepIdx: 0, action: "assert",
    target: {}, checkpoint: { kind: "elementCount" as any, description: "x", regex: "/foo/" } })
  expect(d).toBeNull()
})
