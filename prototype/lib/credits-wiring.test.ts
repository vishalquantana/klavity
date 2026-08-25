import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
const transcribe = readFileSync(new URL("./transcribe.ts", import.meta.url), "utf8")
const server = readFileSync(new URL("../server.ts", import.meta.url), "utf8")

test("transcribe records reserve transcript credits softly", () => {
  expect(transcribe.includes("reserveCredits")).toBe(true)
  expect(transcribe.includes('"transcript"')).toBe(true)
})
test("voice route reserves voice credits (0.1cr) softly", () => {
  const start = server.indexOf('path === "/api/voice/transcribe"')
  const slice = server.slice(start, start + 5000)
  expect(slice.includes("reserveCredits")).toBe(true)
  expect(slice.includes('"voice"')).toBe(true)
})
