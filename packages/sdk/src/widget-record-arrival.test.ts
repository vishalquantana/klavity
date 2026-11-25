// KD-1470: a "Record me" video recorded in the recorder window (data-record-mode="window") while the reporter
// moved between pages arrives on a NEW page and reopens the composer with it. buildModal's options carried
// `initialRecordings` twice (record-bridge arrival + KD-1074 session restore); the later key won, so the
// arrived video never showed in the ticket popup.
import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { mergeRecordings } from "./widget-lib"

describe("mergeRecordings", () => {
  it("keeps the saved session recordings AND the arrived video, saved first", () => {
    const saved = [{ id: "rec_a", dataUrl: "data:a" }]
    const arrived = [{ id: "rec_b", dataUrl: "data:b" }]
    expect(mergeRecordings(saved, arrived).map((r) => r.id)).toEqual(["rec_a", "rec_b"])
  })

  it("dedupes by id (falling back to dataUrl)", () => {
    const saved = [{ id: "rec_a", dataUrl: "data:a" }, { dataUrl: "data:x" }]
    const arrived = [{ id: "rec_a", dataUrl: "data:a2" }, { dataUrl: "data:x" }, { id: "rec_c" }]
    expect(mergeRecordings(saved, arrived).map((r) => r.id || r.dataUrl)).toEqual(["rec_a", "data:x", "rec_c"])
  })

  it("handles a missing side", () => {
    expect(mergeRecordings(undefined, [{ id: "rec_b" }]).map((r) => r.id)).toEqual(["rec_b"])
    expect(mergeRecordings([{ id: "rec_a" }], null).map((r) => r.id)).toEqual(["rec_a"])
    expect(mergeRecordings(null, undefined)).toEqual([])
  })
})

describe("widget openReport seeds the composer's recordings once", () => {
  const src = readFileSync(join(__dirname, "widget.ts"), "utf8")
  const start = src.indexOf("const ctrl = buildModal(type, {")
  // Walk braces to the end of the buildModal options object.
  let depth = 0, end = -1
  for (let i = src.indexOf("{", start); i < src.length; i++) {
    if (src[i] === "{") depth++
    else if (src[i] === "}" && --depth === 0) { end = i; break }
  }
  const opts = src.slice(start, end)

  it("has exactly ONE initialRecordings key (a duplicate silently overrides the other)", () => {
    expect(opts.match(/\n\s*initialRecordings:/g)?.length).toBe(1)
    expect(opts).toContain("initialRecordings: seedRecordings.length ? seedRecordings : undefined")
  })

  it("the seed merges the session's recordings with the arrived video, and persists an arrival", () => {
    expect(src).toContain("const seedRecordings = mergeRecordings(ev?.recordings?.map((r) => ({ ...r })), arrivedNow)")
    expect(src).toContain("if (ev && arrivedNow.length) {")
    expect(src).toContain("setEvidenceRecordings(ev.id, seedRecordings)")
  })
})
