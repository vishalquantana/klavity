import { test, expect, beforeEach, afterEach } from "bun:test"
import { getExtractModel } from "./extract-model"

const ORIG = process.env.KLAV_EXTRACT_MODEL

beforeEach(() => { delete process.env.KLAV_EXTRACT_MODEL })
afterEach(() => {
  if (ORIG !== undefined) process.env.KLAV_EXTRACT_MODEL = ORIG
  else delete process.env.KLAV_EXTRACT_MODEL
})

test("getExtractModel defaults to google/gemini-2.5-flash", () => {
  expect(getExtractModel()).toBe("google/gemini-2.5-flash")
})

test("getExtractModel respects KLAV_EXTRACT_MODEL env override", () => {
  process.env.KLAV_EXTRACT_MODEL = "anthropic/claude-3-haiku"
  expect(getExtractModel()).toBe("anthropic/claude-3-haiku")
})

test("getExtractModel uses any arbitrary model string from env", () => {
  process.env.KLAV_EXTRACT_MODEL = "qwen/qwen3-vl-235b-a22b-instruct"
  expect(getExtractModel()).toBe("qwen/qwen3-vl-235b-a22b-instruct")
})
