import { test, expect } from "bun:test"
import { parseTranscript, offsetToTime, formatTs, speakersFromLines } from "./transcript-parse"

test("parses h:mm:ss and mm:ss timestamps with speakers", () => {
  const raw = "00:00:05  Sarah: I hate the tiny fonts.\n01:02:03 Raj: The export is too slow."
  const lines = parseTranscript(raw)
  expect(lines.length).toBe(2)
  expect(lines[0]).toMatchObject({ speaker: "Sarah", tsSeconds: 5 })
  expect(lines[0].text).toContain("tiny fonts")
  expect(lines[1]).toMatchObject({ speaker: "Raj", tsSeconds: 3723 })
})

test("parses bracketed [mm:ss] and mm:ss forms", () => {
  const raw = "[12:45] Sarah: point one\n07:30  Raj: point two"
  const lines = parseTranscript(raw)
  expect(lines[0]).toMatchObject({ speaker: "Sarah", tsSeconds: 765 })
  expect(lines[1]).toMatchObject({ speaker: "Raj", tsSeconds: 450 })
})

test("speaker-only line has null time; prose with no speaker is one null line", () => {
  const raw = "Sarah: no time here\nJust some prose with no speaker."
  const lines = parseTranscript(raw)
  expect(lines[0]).toMatchObject({ speaker: "Sarah", tsSeconds: null })
  expect(lines[1]).toMatchObject({ speaker: null, tsSeconds: null })
})

test("charStart/charEnd index into the original raw text", () => {
  const raw = "00:00:05 Sarah: alpha\n00:00:09 Raj: beta"
  const lines = parseTranscript(raw)
  for (const ln of lines) {
    expect(raw.slice(ln.charStart, ln.charEnd)).toContain(ln.text.slice(0, 5))
  }
})

test("offsetToTime returns the containing line's time, null past timed lines", () => {
  const raw = "00:00:05 Sarah: alpha here\nno-time prose line"
  const lines = parseTranscript(raw)
  const offAlpha = raw.indexOf("alpha")
  expect(offsetToTime(lines, offAlpha)).toBe(5)
  const offProse = raw.indexOf("prose")
  expect(offsetToTime(lines, offProse)).toBe(null)
  expect(offsetToTime(lines, null)).toBe(null)
})

test("formatTs formats mm:ss and h:mm:ss", () => {
  expect(formatTs(5)).toBe("0:05")
  expect(formatTs(765)).toBe("12:45")
  expect(formatTs(3723)).toBe("1:02:03")
  expect(formatTs(null)).toBe(null)
})

test("speakersFromLines returns unique speakers in order", () => {
  const lines = parseTranscript("00:00:01 Sarah: a\n00:00:02 Raj: b\n00:00:03 Sarah: c")
  expect(speakersFromLines(lines)).toEqual(["Sarah", "Raj"])
})
