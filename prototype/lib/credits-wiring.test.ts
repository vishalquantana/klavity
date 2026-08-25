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

const simReview = readFileSync(new URL("./sim-review.ts", import.meta.url), "utf8")
test("sim-review reserves 'sim' credits alongside the usage meter", () => {
  expect(simReview.includes("reserveCredits")).toBe(true)
  expect(simReview.includes('"sim"')).toBe(true)
})

const trailsRunner = readFileSync(new URL("./trails-runner.ts", import.meta.url), "utf8")
test("trails-runner reserves 'autosim' credits alongside the usage meter", () => {
  expect(trailsRunner.includes("reserveCredits")).toBe(true)
  expect(trailsRunner.includes('"autosim"')).toBe(true)
})
