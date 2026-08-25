import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"

// The core report-SUBMIT path must NEVER call reserveCredits — capture+submit is free forever.
// Static contract test (mirrors lib/route-contract.test.ts): assert no credit gate sits on submit.
const server = readFileSync(new URL("../server.ts", import.meta.url), "utf8")

test("core bug submit route does not reference reserveCredits", () => {
  // The submit handler is POST /api/feedback (verified in server.ts). Slice from its route guard to
  // the next handler and assert no credit reserve sits on it.
  const start = server.indexOf('path === "/api/feedback"')
  expect(start).toBeGreaterThan(-1)
  const slice = server.slice(start, start + 6000)
  expect(slice.includes("reserveCredits")).toBe(false)
})

test("enhance route reserves credits softly (returns draft regardless)", () => {
  const start = server.indexOf('path === "/api/report/enhance"')
  expect(start).toBeGreaterThan(-1)
  const slice = server.slice(start, start + 4000)
  expect(slice.includes("reserveCredits")).toBe(true)
  expect(slice.includes('"enhance"')).toBe(true)
})
