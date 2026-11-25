// KD-2877: slimSimRun keeps exactly what the Sim Runs list shows (issue pill + Sim avatars) and drops the heavy reactions payload.
import { test, expect } from "bun:test"
import { slimSimRun } from "./sim-run-list"

const base = { id: "run_1", projectId: "p", url: "https://x.test/a", status: "done" as const, simIds: null, screenshotId: "s1", label: null, errorMsg: null, actorEmail: "a@b.c", createdAt: 1000, finishedAt: 4000, durationMs: 3000 }

test("counts observations that carry a suggested bug across every Sim, and lists the Sims for the avatar row", () => {
  const run = { ...base, reactions: [
    { simName: "Ana", initials: "AN", accent: "#111", observations: [{ suggestedBug: { title: "x" } }, { text: "just a note" }, { suggestedBug: { title: "y" } }] },
    { simName: "Bo", observations: [{ suggestedBug: { title: "z" } }] },
  ] }
  const s = slimSimRun(run as any)
  expect(s.issueCount).toBe(3)
  expect(s.sims).toEqual([{ simName: "Ana", initials: "AN", accent: "#111" }, { simName: "Bo", initials: null, accent: null }])
  expect(s.slim).toBe(true)
})

test("drops the full reactions but keeps every other run field", () => {
  const s: any = slimSimRun({ ...base, reactions: [{ simName: "Ana", observations: [{ suggestedBug: {} }] }] } as any)
  expect("reactions" in s).toBe(false)
  for (const k of ["id", "projectId", "url", "status", "screenshotId", "createdAt", "finishedAt", "durationMs", "errorMsg"]) expect(s[k]).toBe((base as any)[k])
})

test("tolerates null / malformed reactions (an errored or in-progress run)", () => {
  for (const reactions of [null, [], [null, 5, { simName: "A", observations: "nope" }]]) {
    const s = slimSimRun({ ...base, reactions } as any)
    expect(s.issueCount).toBe(0)
    expect(Array.isArray(s.sims)).toBe(true)
  }
})
