import { test, expect } from "bun:test"
import { normalizeUrlPath, issueKeyFor, lexicalSim, chooseDedup, humanReportIssueKeyFor, normalizeReportText } from "./dedup"

test("normalizeUrlPath strips query/hash + trailing slash", () => {
  expect(normalizeUrlPath("/checkout/?step=2#pay")).toBe("/checkout")
  expect(normalizeUrlPath("/")).toBe("/")
  expect(normalizeUrlPath("")).toBe("/")
})

test("issueKeyFor is stable across citedTraitIds order, varies by issueType/path/project", () => {
  const base = { projectId: "p1", urlPath: "/checkout", issueType: "flow", citedTraitIds: ["a", "b"] }
  expect(issueKeyFor(base)).toBe(issueKeyFor({ ...base, citedTraitIds: ["b", "a"] }))
  expect(issueKeyFor(base)).not.toBe(issueKeyFor({ ...base, issueType: "layout" }))
  expect(issueKeyFor(base)).not.toBe(issueKeyFor({ ...base, urlPath: "/cart" }))
  expect(issueKeyFor(base)).not.toBe(issueKeyFor({ ...base, projectId: "p2" }))
  // path normalization folds into the key
  expect(issueKeyFor(base)).toBe(issueKeyFor({ ...base, urlPath: "/checkout/?x=1" }))
})

test("lexicalSim: identical ~1, paraphrase high, unrelated low", () => {
  expect(lexicalSim("export button is hidden", "export button is hidden")).toBeGreaterThan(0.99)
  expect(lexicalSim("the export button is hidden", "export button is hidden on this page")).toBeGreaterThan(0.5)
  expect(lexicalSim("export button is hidden", "checkout payment timed out")).toBeLessThan(0.3)
})

test("chooseDedup: exact match wins; else semantic ≥ threshold; else null", () => {
  expect(chooseDedup({ title: "x", observation: "y" }, { id: "fb1" }, [])).toBe("fb1")
  const recent = [{ id: "fb2", title: "Export button is hidden", observation: "" }]
  expect(chooseDedup({ title: "Export button is hidden", observation: "" }, null, recent, 0.82)).toBe("fb2")
  expect(chooseDedup({ title: "Onboarding wizard crashes", observation: "" }, null, recent, 0.82)).toBeNull()
})

test("humanReportIssueKeyFor normalizes volatile ids, numbers, and timestamps", () => {
  expect(normalizeReportText("Checkout order 123 failed at 2026-07-11T10:11:12Z")).toBe("checkout order <num> failed at <timestamp>")
  const a = humanReportIssueKeyFor({
    projectId: "p1",
    urlPath: "/checkout?step=pay",
    text: "Checkout order 123 failed for user 550e8400-e29b-41d4-a716-446655440000 at 2026-07-11T10:11:12Z",
  })
  const b = humanReportIssueKeyFor({
    projectId: "p1",
    urlPath: "/checkout",
    text: "checkout order 987 failed for user 550e8400-e29b-41d4-a716-446655440111 at 2026-07-12T00:00:00Z",
  })
  expect(a).toBe(b)
  expect(a).not.toBe(humanReportIssueKeyFor({ projectId: "p2", urlPath: "/checkout", text: "checkout order 987 failed for user x at 2026-07-12" }))
})

// KLA dedup-smart: an exact BROAD page-key match must NOT merge unrelated reports. When the caller passes
// exactMinSim (only for broad/human keys — no cited traits), the exact match wins only if the candidate is
// at least that similar; a low-signal report ("Testing") falls through to a NEW ticket instead of collapsing
// into an unrelated same-page bug. Trait-cited (Sim/AutoSim) keys pass exactMinSim=0 → unconditional merge.
test("exactMinSim blocks an over-broad same-page merge for dissimilar reports", () => {
  const exact = { id: "fb-head", title: "Fix bug on admin user index page", observation: "the user table pagination is broken" }
  // Dissimilar candidate ("Testing") → below floor → NOT merged (returns null → caller files a new ticket).
  expect(chooseDedup({ title: "Testing", observation: "Testing" }, exact, [], 0.82, new Set(), 0.3)).toBeNull()
  // Similar candidate → above floor → merges into the head.
  expect(chooseDedup({ title: "admin user index page bug", observation: "pagination on the user table is broken" }, exact, [], 0.82, new Set(), 0.3)).toBe("fb-head")
})
test("exactMinSim=0 (trait-cited Sim key) keeps unconditional exact-key merge", () => {
  const exact = { id: "fb-sim", title: "A", observation: "B" }
  // Even a totally dissimilar candidate merges when the caller does NOT require a floor (Sim/AutoSim path).
  expect(chooseDedup({ title: "totally different", observation: "nothing alike" }, exact, [], 0.82, new Set(), 0)).toBe("fb-sim")
})
test("exactMinSim default is 0 — legacy callers keep unconditional exact merge", () => {
  const exact = { id: "fb-x" }
  expect(chooseDedup({ title: "z", observation: "z" }, exact, [])).toBe("fb-x")
})
