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
test("messages wrap DOM/URL as untrusted and offer cred placeholders", () => {
  const msgs = buildAuthorMessages({ objective: "log in", pageUrl: "https://a.b", screenshotB64: "AA==", mediaType: "image/jpeg", domSnapshot: "<button id=go>", history: ["clicked #x"], credFields: ["{{cred:admin:email}}"] })
  const text = msgs[1].content[0].text
  expect(text).toContain("<<<")
  expect(text).toContain("{{cred:admin:email}}")
  expect(msgs[0].content).toBe(AUTHOR_SYS)
})
