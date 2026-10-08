import { test, expect } from "bun:test"
import { gzipSync } from "node:zlib"
import { readReplayEvents, replayEvidencePresent, REPLAY_RAW_CAP } from "./replay-intake"

const events = (n: number) => Array.from({ length: n }, (_, i) => ({ type: 3, timestamp: 1000 + i, data: { source: 1, x: i } }))
const gzFile = (v: unknown, name = "replay.json.gz") => new File([gzipSync(Buffer.from(typeof v === "string" ? v : JSON.stringify(v)))], name, { type: "application/gzip" })
const form = (o: { gz?: File; plain?: string }) => { const f = new FormData(); if (o.gz) f.set("replay_events_gz", o.gz); if (o.plain !== undefined) f.set("replay_events", o.plain); return f }

test("a gzip part is inflated and parsed", async () => {
  const ev = await readReplayEvents(form({ gz: gzFile(events(50)) }))
  expect(ev?.length).toBe(50); expect((ev as any)[49].data.x).toBe(49)
})
test("the plain JSON field still works (older clients / no CompressionStream)", async () => {
  expect((await readReplayEvents(form({ plain: JSON.stringify(events(7)) })))?.length).toBe(7)
})
test("a corrupt gzip part falls back to the plain field, and to null when there is none", async () => {
  const bad = new File([new Uint8Array([1, 2, 3, 4, 5])], "replay.json.gz", { type: "application/gzip" })
  expect((await readReplayEvents(form({ gz: bad, plain: JSON.stringify(events(3)) })))?.length).toBe(3)
  expect(await readReplayEvents(form({ gz: bad }))).toBeNull()
})
test("a decompression bomb (tiny gzip inflating past the cap) is ignored, not buffered", async () => {
  const bomb = gzFile(" ".repeat(REPLAY_RAW_CAP + 1024 * 1024))
  expect(bomb.size).toBeLessThan(64 * 1024)                       // looks harmless on the wire
  expect(await readReplayEvents(form({ gz: bomb }))).toBeNull()
})
test("an oversized plain field and non-array / empty JSON are ignored", async () => {
  expect(await readReplayEvents(form({ plain: "[" + "0,".repeat(REPLAY_RAW_CAP) + "0]" }))).toBeNull()
  expect(await readReplayEvents(form({ plain: '{"a":1}' }))).toBeNull()
  expect(await readReplayEvents(form({ plain: "[]" }))).toBeNull()
  expect(await readReplayEvents(form({ plain: "not json" }))).toBeNull()
  expect(await readReplayEvents(new FormData())).toBeNull()
})
test("replayEvidencePresent: true for a non-empty gzip part or a real plain array, false for empty placeholders", () => {
  expect(replayEvidencePresent(form({ gz: gzFile(events(2)) }))).toBe(true)
  expect(replayEvidencePresent(form({ plain: JSON.stringify(events(2)) }))).toBe(true)
  expect(replayEvidencePresent(form({ plain: "[]" }))).toBe(false)
  expect(replayEvidencePresent(form({ plain: "null" }))).toBe(false)
  expect(replayEvidencePresent(form({ gz: new File([], "empty.gz") }))).toBe(false)
  expect(replayEvidencePresent(new FormData())).toBe(false)
})
