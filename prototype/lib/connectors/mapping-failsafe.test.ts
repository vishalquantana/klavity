import { test, expect } from "bun:test"
import {
  parseNameMap, applyStateMap, applyLabelMap, resolveOptionByName,
  mergePendingMapping, removePendingMapping, type PendingMapping,
} from "./mapping-failsafe"

// ── parseNameMap ────────────────────────────────────────────────────────────────
test("parseNameMap parses a JSON map, lowercases keys, drops empties, never throws", () => {
  expect(parseNameMap('{"In Progress":"Doing","X":""}')).toEqual({ "in progress": "Doing" })
  expect(parseNameMap(undefined)).toEqual({})
  expect(parseNameMap("not json")).toEqual({})
  expect(parseNameMap("[1,2]")).toEqual({})
})

// ── applyStateMap / applyLabelMap ───────────────────────────────────────────────
test("applyStateMap remaps a configured state name case-insensitively, else passes through", () => {
  const cfg = { state_map: '{"Done":"Closed"}' }
  expect(applyStateMap(cfg, "done")).toBe("Closed")
  expect(applyStateMap(cfg, "In Progress")).toBe("In Progress")
  expect(applyStateMap({}, "Done")).toBe("Done")
})

test("applyLabelMap remaps each label, passing unmapped ones through", () => {
  const cfg = { label_map: '{"UX polish":"ux","Regression":"regression"}' }
  expect(applyLabelMap(cfg, ["UX polish", "Other"])).toEqual(["ux", "Other"])
  expect(applyLabelMap({}, ["a"])).toEqual(["a"])
  expect(applyLabelMap(cfg, undefined)).toEqual([])
})

// ── resolveOptionByName ─────────────────────────────────────────────────────────
test("resolveOptionByName matches case-insensitively, returns null+found:false when absent", () => {
  const opts = [{ id: "s1", name: "Backlog" }, { id: "s2", name: "In Progress" }]
  expect(resolveOptionByName(opts, "in progress")).toEqual({ id: "s2", found: true })
  expect(resolveOptionByName(opts, "Nope")).toEqual({ id: null, found: false })
  expect(resolveOptionByName(null, "x")).toEqual({ id: null, found: false })
})

// ── mergePendingMapping / removePendingMapping ──────────────────────────────────
test("mergePendingMapping appends a new entry then bumps count on repeat (deduped)", () => {
  let list: PendingMapping[] = []
  list = mergePendingMapping(list, { field: "state", requested_name: "Done" }, "fb1", 1000)
  expect(list).toEqual([{ field: "state", requested_name: "Done", first_seen: 1000, count: 1, sample_finding_id: "fb1" }])
  // Same field+name (different case) → bump, keep first_seen + first sample.
  list = mergePendingMapping(list, { field: "state", requested_name: "done" }, "fb2", 2000)
  expect(list.length).toBe(1)
  expect(list[0].count).toBe(2)
  expect(list[0].first_seen).toBe(1000)
  expect(list[0].sample_finding_id).toBe("fb1")
  // Different field → separate entry.
  list = mergePendingMapping(list, { field: "label", requested_name: "Done" }, null, 3000)
  expect(list.length).toBe(2)
})

test("removePendingMapping drops the matching entry only, case-insensitive", () => {
  const list: PendingMapping[] = [
    { field: "state", requested_name: "Done", first_seen: 1, count: 1, sample_finding_id: null },
    { field: "label", requested_name: "Bug", first_seen: 1, count: 1, sample_finding_id: null },
  ]
  const out = removePendingMapping(list, "state", "done")
  expect(out).toEqual([{ field: "label", requested_name: "Bug", first_seen: 1, count: 1, sample_finding_id: null }])
})
