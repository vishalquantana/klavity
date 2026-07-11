// KLA-266: per-project walk queue fairness. These tests exercise withWalkSlot's projectId keying —
// a GLOBAL concurrency cap shared across projects, a per-project cap that stops one project hogging
// every slot, round-robin dispatch so projects interleave, and per-project WalkBusyError isolation.
import { test, expect, beforeEach } from "bun:test"
import {
  withWalkSlot,
  WalkBusyError,
  isWalkInFlight,
  activeWalksForProject,
  _queuedForProject,
  _resetWalkPoolForTest,
} from "./trails-browser"

beforeEach(() => { _resetWalkPoolForTest(1, 10, 1) })

// Small helper: a gate you can open manually.
function gate() {
  let open!: () => void
  const p = new Promise<void>((r) => { open = r })
  return { p, open }
}

test("enqueue ordering: within one project, queued walks run FIFO", async () => {
  _resetWalkPoolForTest(1, 10, 1)
  const order: string[] = []
  const g0 = gate()
  // First walk occupies the only slot and blocks on g0.
  const s0 = withWalkSlot(async () => { order.push("a-start"); await g0.p; order.push("a-end") }, "projA")
  await Promise.resolve(); await Promise.resolve()
  expect(isWalkInFlight()).toBe(true)

  // Two more from the SAME project queue behind it, in submission order.
  const g1 = gate(); const g2 = gate()
  const s1 = withWalkSlot(async () => { order.push("b"); await g1.p }, "projA")
  const s2 = withWalkSlot(async () => { order.push("c"); await g2.p }, "projA")
  await Promise.resolve()
  expect(_queuedForProject("projA")).toBe(2)

  // Drain: a → b → c strictly in order (per-project cap 1 serializes them).
  g0.open(); await s0
  await Promise.resolve()
  expect(order).toEqual(["a-start", "a-end", "b"])
  g1.open(); await s1
  await Promise.resolve()
  g2.open(); await s2
  expect(order).toEqual(["a-start", "a-end", "b", "c"])
  expect(isWalkInFlight()).toBe(false)
})

test("concurrency cap enforced: never more than the GLOBAL cap run at once, across projects", async () => {
  // Global cap 2, per-project cap 1 → at most 2 walks run, and never 2 from the same project.
  _resetWalkPoolForTest(2, 10, 1)
  let active = 0; let maxSeen = 0
  const gates: Array<() => void> = []
  const mk = (proj: string) => withWalkSlot(async () => {
    active++; maxSeen = Math.max(maxSeen, active)
    await new Promise<void>((r) => { gates.push(r) })
    active--
  }, proj)

  // Four walks across two projects.
  const all = [mk("A"), mk("B"), mk("A"), mk("B")]
  await Promise.resolve(); await Promise.resolve()

  // Only 2 (the global cap) run; the other two queue.
  expect(active).toBe(2)
  expect(maxSeen).toBe(2)
  // And no single project holds >1 slot.
  expect(activeWalksForProject("A")).toBe(1)
  expect(activeWalksForProject("B")).toBe(1)

  // Release everything, including gates that appear as queued walks start running.
  while (gates.length) {
    gates.shift()!()
    await Promise.resolve(); await Promise.resolve()
  }
  await Promise.all(all)
  // Even after churn, the cap was never exceeded.
  expect(maxSeen).toBe(2)
  expect(isWalkInFlight()).toBe(false)
})

test("per-project fairness: a busy project does NOT block another project's walk", async () => {
  // Global cap 1. Project A floods the queue first; project B enqueues one walk AFTER A's backlog.
  // Round-robin must let B run before A drains its whole backlog — i.e. B interleaves, not starves.
  _resetWalkPoolForTest(1, 10, 1)
  const runOrder: string[] = []

  // A0 takes the slot and holds it.
  const gA0 = gate()
  const a0 = withWalkSlot(async () => { runOrder.push("A0"); await gA0.p }, "A")
  await Promise.resolve(); await Promise.resolve()

  // A1, A2 queue behind A0 (same project).
  const gA1 = gate(); const gA2 = gate()
  const a1 = withWalkSlot(async () => { runOrder.push("A1"); await gA1.p }, "A")
  const a2 = withWalkSlot(async () => { runOrder.push("A2"); await gA2.p }, "A")
  // B0 queues AFTER A's backlog.
  const gB0 = gate()
  const b0 = withWalkSlot(async () => { runOrder.push("B0"); await gB0.p }, "B")
  await Promise.resolve()

  expect(_queuedForProject("A")).toBe(2)
  expect(_queuedForProject("B")).toBe(1)

  // Release A0 → round-robin should pick project B next (fairness), NOT the next A walk.
  gA0.open(); await a0
  await Promise.resolve()
  expect(runOrder).toEqual(["A0", "B0"])

  // Release B0 → now A resumes (A1).
  gB0.open(); await b0
  await Promise.resolve()
  expect(runOrder).toEqual(["A0", "B0", "A1"])

  // Drain the rest.
  gA1.open(); await a1
  await Promise.resolve()
  gA2.open(); await a2
  expect(runOrder).toEqual(["A0", "B0", "A1", "A2"])
  expect(isWalkInFlight()).toBe(false)
})

test("two projects interleave 1-for-1 under a global cap of 1", async () => {
  _resetWalkPoolForTest(1, 10, 1)
  const order: string[] = []
  const gates: Record<string, ReturnType<typeof gate>> = {}
  const mk = (id: string, proj: string) => {
    gates[id] = gate()
    return withWalkSlot(async () => { order.push(id); await gates[id].p }, proj)
  }
  // A0 runs; A1,A2 and B1,B2 queue.
  const a0 = mk("A0", "A")
  await Promise.resolve(); await Promise.resolve()
  const a1 = mk("A1", "A"); const b1 = mk("B1", "B")
  const a2 = mk("A2", "A"); const b2 = mk("B2", "B")
  await Promise.resolve()

  // Drain one at a time; expect A and B to alternate rather than all A's first. After each release,
  // the freed slot goes to the next fair project, whose fn then pushes its id.
  for (let i = 0; i < 5; i++) {
    const running = order[order.length - 1]
    gates[running].open()
    // Let the release → dispatch → next fn body → order.push chain settle.
    for (let y = 0; y < 4; y++) await Promise.resolve()
  }
  await Promise.all([a0, a1, a2, b1, b2])
  // First served is A0 (held the slot). After that, fair round-robin alternates B,A,B,A.
  expect(order).toEqual(["A0", "B1", "A1", "B2", "A2"])
  expect(isWalkInFlight()).toBe(false)
})

test("per-project WalkBusyError isolation: a full project queue does not affect others", async () => {
  // Global cap 1, per-project queue depth 1, per-project cap 1.
  _resetWalkPoolForTest(1, 1, 1)
  const gA = gate()
  const a0 = withWalkSlot(async () => { await gA.p }, "A") // takes the slot
  await Promise.resolve(); await Promise.resolve()
  const a1 = withWalkSlot(async () => "a1", "A")           // queues (A queue now full: depth 1)
  // A third A walk → A's queue is full → WalkBusyError for A.
  await expect(withWalkSlot(async () => "a2", "A")).rejects.toBeInstanceOf(WalkBusyError)

  // But project B can still enqueue — its own queue is empty. It does NOT throw.
  const b0 = withWalkSlot(async () => "b0", "B")
  expect(_queuedForProject("B")).toBe(1)

  gA.open()
  await a0
  expect(await a1).toBe("a1")
  expect(await b0).toBe("b0")
  expect(isWalkInFlight()).toBe(false)
})

test("unkeyed callers share the default bucket (backward compatible)", async () => {
  // No projectId → all share one bucket; with cap 1 they serialize like the old global slot.
  _resetWalkPoolForTest(1, 10) // perProject defaults to concurrency (1) here
  const order: string[] = []
  const g0 = gate()
  const s0 = withWalkSlot(async () => { order.push("x"); await g0.p })
  await Promise.resolve(); await Promise.resolve()
  const s1 = withWalkSlot(async () => { order.push("y") })
  await Promise.resolve()
  expect(order).toEqual(["x"]) // y is queued behind x on the shared default bucket
  g0.open(); await s0
  await s1
  expect(order).toEqual(["x", "y"])
  expect(isWalkInFlight()).toBe(false)
})
