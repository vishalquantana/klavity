import { test, expect } from "bun:test"
import { formatTs } from "./lib/transcript-parse"

// The formatting/fallback rule that resolveCitations must follow.
function citationTime(srcQuoteTs: number | null): { sourceTime: string | null; sourceTimeKind: string } {
  return srcQuoteTs != null
    ? { sourceTime: formatTs(srcQuoteTs), sourceTimeKind: "meeting" }
    : { sourceTime: null, sourceTimeKind: "upload" }
}

test("meeting time is formatted when srcQuoteTs present", () => {
  expect(citationTime(765)).toEqual({ sourceTime: "12:45", sourceTimeKind: "meeting" })
})
test("falls back to upload kind when no in-note time", () => {
  expect(citationTime(null)).toEqual({ sourceTime: null, sourceTimeKind: "upload" })
})
