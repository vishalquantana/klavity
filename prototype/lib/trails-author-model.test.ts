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
test("wait op parses with a ms value; wait without value is a retryable parse stall", () => {
  const w = parseAuthorAction('{"op":"wait","value":"8000","rationale":"extraction running"}')
  expect(w.op).toBe("wait"); expect(w.value).toBe("8000"); expect(w.parseError).toBeUndefined()
  const bad = parseAuthorAction('{"op":"wait","rationale":"x"}')
  expect(bad.op).toBe("stall"); expect(bad.parseError).toBe(true)
})

test("hover op parses with selector; hover without selector → stall", () => {
  const h = parseAuthorAction('{"op":"hover","selector":"[data-kref=\\"e5\\"]","rationale":"reveal menu"}')
  expect(h.op).toBe("hover"); expect(h.selector).toBe('[data-kref="e5"]'); expect(h.parseError).toBeUndefined()
  const bad = parseAuthorAction('{"op":"hover","rationale":"x"}')
  expect(bad.op).toBe("stall"); expect(bad.parseError).toBe(true)
})

test("keyPress op parses with selector+value; missing value or selector → stall", () => {
  const k = parseAuthorAction('{"op":"keyPress","selector":"#email","value":"Tab","rationale":"advance focus"}')
  expect(k.op).toBe("keyPress"); expect(k.value).toBe("Tab"); expect(k.parseError).toBeUndefined()
  expect(parseAuthorAction('{"op":"keyPress","selector":"#x","rationale":"x"}').op).toBe("stall")
  expect(parseAuthorAction('{"op":"keyPress","value":"Enter","rationale":"x"}').op).toBe("stall")
})

test("clearField op parses with selector; missing selector → stall", () => {
  const c = parseAuthorAction('{"op":"clearField","selector":"#search","rationale":"reset field"}')
  expect(c.op).toBe("clearField"); expect(c.selector).toBe("#search"); expect(c.parseError).toBeUndefined()
  const bad = parseAuthorAction('{"op":"clearField","rationale":"x"}')
  expect(bad.op).toBe("stall"); expect(bad.parseError).toBe(true)
})

test("AUTHOR_SYS mentions all three new ops", () => {
  expect(AUTHOR_SYS).toContain('"hover"')
  expect(AUTHOR_SYS).toContain('"keyPress"')
  expect(AUTHOR_SYS).toContain('"clearField"')
})
