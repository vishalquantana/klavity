import { test, expect } from "bun:test"
import { parseAuthorAction, buildAuthorMessages, AUTHOR_SYS } from "./trails-author-model"

test("parseAuthorAction accepts valid JSON incl. fenced", () => {
  const a = parseAuthorAction('```json\n{"op":"click","selector":"#go","rationale":"submit"}\n```')
  expect(a.op).toBe("click"); expect(a.selector).toBe("#go")
})
test("click/type/select/assert without selector → stall; navigate without url → stall", () => {
  expect(parseAuthorAction('{"op":"click","rationale":"x"}').op).toBe("stall")
  expect(parseAuthorAction('{"op":"navigate","rationale":"x"}').op).toBe("stall")
})
test("type without value → stall; garbage → stall", () => {
  expect(parseAuthorAction('{"op":"type","selector":"#a","rationale":"x"}').op).toBe("stall")
  expect(parseAuthorAction("not json at all").op).toBe("stall")
})
test("parse fallbacks are marked retryable (parseError); a deliberate model stall is NOT", () => {
  expect(parseAuthorAction("not json at all").parseError).toBe(true)
  expect(parseAuthorAction('{"op":"click,","rationale":"x"}').parseError).toBe(true)
  expect(parseAuthorAction('{"op":"click","rationale":"x"}').parseError).toBe(true) // missing selector
  const real = parseAuthorAction('{"op":"stall","rationale":"auth wall"}')
  expect(real.op).toBe("stall")
  expect(real.parseError).toBeUndefined()
})
test("messages wrap DOM/URL as untrusted and offer cred placeholders", () => {
  const msgs = buildAuthorMessages({ objective: "log in", pageUrl: "https://a.b", screenshotB64: "AA==", mediaType: "image/jpeg", domSnapshot: "<button id=go>", history: ["clicked #x"], credFields: ["{{cred:admin:email}}"] })
  const text = msgs[1].content[0].text
  expect(text).toContain("<<<")
  expect(text).toContain("{{cred:admin:email}}")
  expect(msgs[0].content).toBe(AUTHOR_SYS)
})

// NOTE: openRouterAuthorModel's finally-block reconciliation (v0.40+) cannot be tested in pure unit tests
// because it requires DB access to reconcileDailySpend. Integration/e2e tests verify that the reservation
// is properly cleaned up on fetch/res.json errors via the daily_ai_spend table state.
