import { test, expect, beforeEach } from "bun:test"
import { withWalkSlot, withAuthorSlot, withPdfSlot, isWalkInFlight, WalkBusyError, AuthorBusyError, PdfBusyError, CHROMIUM_PROD_ARGS, cancelCurrentWalk, setCurrentWalkRunId, getCurrentWalkAbortSignal, currentWalkRunId, _resetWalkPoolForTest, _resetAuthorAdmissionForTest, _resetPdfAdmissionForTest } from "./trails-browser"

// Isolate pool state between tests.
beforeEach(() => { _resetWalkPoolForTest(3, 10); _resetAuthorAdmissionForTest(); _resetPdfAdmissionForTest() })

test("withWalkSlot runs the fn and clears the slot after", async () => {
  expect(isWalkInFlight()).toBe(false)
  const r = await withWalkSlot(async () => { expect(isWalkInFlight()).toBe(true); return 42 })
  expect(r).toBe(42)
  expect(isWalkInFlight()).toBe(false)
})

// ── Pool concurrency tests ─────────────────────────────────────────────────────

test("concurrent walks up to the pool size all run simultaneously", async () => {
  _resetWalkPoolForTest(3, 0)
  let active = 0; let maxSeen = 0
  const gates: Array<() => void> = []
  const slots = [0, 1, 2].map(() => withWalkSlot(async () => {
    active++; maxSeen = Math.max(maxSeen, active)
    await new Promise<void>((r) => { gates.push(r) })
    active--
  }))
  // Yield twice so all three acquire their slots
  await Promise.resolve(); await Promise.resolve()
  expect(active).toBe(3)
  expect(maxSeen).toBe(3)
  gates.forEach((r) => r())
  await Promise.all(slots)
  expect(isWalkInFlight()).toBe(false)
})

test("a walk beyond pool size queues and runs when a slot frees", async () => {
  _resetWalkPoolForTest(2, 5)
  let rel1!: () => void, rel2!: () => void
  const g1 = new Promise<void>((r) => { rel1 = r })
  const g2 = new Promise<void>((r) => { rel2 = r })

  const s1 = withWalkSlot(async () => { await g1; return "s1" })
  const s2 = withWalkSlot(async () => { await g2; return "s2" })
  await Promise.resolve(); await Promise.resolve()
  expect(isWalkInFlight()).toBe(true)

  // 3rd call queues (does NOT throw — pool=2, maxQueue=5)
  const s3 = withWalkSlot(async () => "s3")
  // Release slot 1 → queued s3 should pick it up
  rel1()
  expect(await s1).toBe("s1")
  expect(await s3).toBe("s3")
  rel2()
  expect(await s2).toBe("s2")
  expect(isWalkInFlight()).toBe(false)
})

test("WalkBusyError when both pool and queue are exhausted", async () => {
  _resetWalkPoolForTest(1, 1)
  let release!: () => void
  const gate = new Promise<void>((r) => { release = r })
  const first = withWalkSlot(async () => { await gate; return "a" })
  await Promise.resolve()
  // 2nd: queues (pool=1 full, queue has 1 slot)
  const second = withWalkSlot(async () => "b")
  // 3rd: pool full + queue full → WalkBusyError
  await expect(withWalkSlot(async () => "c")).rejects.toBeInstanceOf(WalkBusyError)
  release()
  expect(await first).toBe("a")
  expect(await second).toBe("b")
  expect(isWalkInFlight()).toBe(false)
})

test("a second concurrent withWalkSlot throws WalkBusyError when maxQueue=0", async () => {
  _resetWalkPoolForTest(1, 0)
  let release: () => void = () => {}
  const gate = new Promise<void>((res) => { release = res })
  const first = withWalkSlot(async () => { await gate; return "a" })
  await Promise.resolve() // let `first` acquire the slot
  await expect(withWalkSlot(async () => "b")).rejects.toBeInstanceOf(WalkBusyError)
  release()
  expect(await first).toBe("a")
  expect(isWalkInFlight()).toBe(false)
})

test("the slot is released even if fn throws", async () => {
  await expect(withWalkSlot(async () => { throw new Error("boom") })).rejects.toThrow("boom")
  expect(isWalkInFlight()).toBe(false)
})

test("CHROMIUM_PROD_ARGS carries the low-memory flags", () => {
  for (const a of ["--single-process", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-zygote"]) {
    expect(CHROMIUM_PROD_ARGS).toContain(a)
  }
  for (const a of ["--disable-extensions", "--disable-background-networking", "--disable-renderer-backgrounding"]) {
    expect(CHROMIUM_PROD_ARGS).toContain(a)
  }
})

test("withAuthorSlot rejects a concurrent authoring session", async () => {
  let release!: () => void
  const gate = new Promise<void>((r) => { release = r })
  const first = withAuthorSlot(async () => { await gate; return "first" })
  await Promise.resolve()
  await expect(withAuthorSlot(async () => "second")).rejects.toBeInstanceOf(AuthorBusyError)
  release()
  expect(await first).toBe("first")
  expect(await withAuthorSlot(async () => "after")).toBe("after")
})

// ── KLA-100 cancel helpers ─────────────────────────────────────────────────────

test("cancelCurrentWalk returns false when no walk is in flight", () => {
  expect(isWalkInFlight()).toBe(false)
  expect(cancelCurrentWalk("walk_any")).toBe(false)
})

test("cancelCurrentWalk returns false for a mismatched runId", async () => {
  let release: () => void = () => {}
  const gate = new Promise<void>((r) => { release = r })
  const slot = withWalkSlot(async () => { setCurrentWalkRunId("walk_correct"); await gate })
  await Promise.resolve() // let slot acquire
  expect(cancelCurrentWalk("walk_wrong")).toBe(false)
  expect(isWalkInFlight()).toBe(true)
  release()
  await slot
})

test("cancelCurrentWalk fires the signal for the matching runId", async () => {
  let capturedSignal: AbortSignal | null = null
  let release: () => void = () => {}
  const gate = new Promise<void>((r) => { release = r })
  const slot = withWalkSlot(async () => {
    setCurrentWalkRunId("walk_cancel_me")
    capturedSignal = getCurrentWalkAbortSignal()
    await gate
  })
  await Promise.resolve() // let slot acquire
  // currentWalkRunId() uses AsyncLocalStorage — returns null outside the slot's async context
  expect(currentWalkRunId()).toBe(null)
  expect(isWalkInFlight()).toBe(true)
  expect(capturedSignal?.aborted).toBe(false)
  const result = cancelCurrentWalk("walk_cancel_me")
  expect(result).toBe(true)
  expect(capturedSignal?.aborted).toBe(true)
  release()
  await slot
  expect(isWalkInFlight()).toBe(false)
  expect(getCurrentWalkAbortSignal()).toBe(null)
})

test("cancelCurrentWalk can target a specific slot in a concurrent pool", async () => {
  _resetWalkPoolForTest(2, 0)
  let rel1!: () => void, rel2!: () => void
  let sig1: AbortSignal | null = null, sig2: AbortSignal | null = null
  const g1 = new Promise<void>((r) => { rel1 = r })
  const g2 = new Promise<void>((r) => { rel2 = r })
  const s1 = withWalkSlot(async () => { setCurrentWalkRunId("run_1"); sig1 = getCurrentWalkAbortSignal(); await g1 })
  const s2 = withWalkSlot(async () => { setCurrentWalkRunId("run_2"); sig2 = getCurrentWalkAbortSignal(); await g2 })
  await Promise.resolve(); await Promise.resolve()
  expect(cancelCurrentWalk("run_1")).toBe(true)
  expect(sig1?.aborted).toBe(true)
  expect(sig2?.aborted).toBe(false)
  rel1(); rel2()
  await Promise.all([s1, s2])
  expect(isWalkInFlight()).toBe(false)
})

test("getCurrentWalkAbortSignal returns null outside a slot and non-null inside", async () => {
  expect(getCurrentWalkAbortSignal()).toBe(null)
  let inner: AbortSignal | null = null
  await withWalkSlot(async () => { inner = getCurrentWalkAbortSignal() })
  expect(inner).not.toBe(null)
  expect(getCurrentWalkAbortSignal()).toBe(null)
})

test("currentWalkRunId is scoped to the slot's async context", async () => {
  expect(currentWalkRunId()).toBe(null)
  let seenInside: string | null = null
  await withWalkSlot(async () => { setCurrentWalkRunId("walk_xyz"); seenInside = currentWalkRunId() })
  expect(seenInside).toBe("walk_xyz")
  expect(currentWalkRunId()).toBe(null) // AsyncLocalStorage: null outside the slot context
})

test("withPdfSlot rejects a concurrent PDF rendering session", async () => {
  let release!: () => void
  const gate = new Promise<void>((r) => { release = r })
  const first = withPdfSlot(async () => { await gate; return "first" })
  await Promise.resolve()
  await expect(withPdfSlot(async () => "second")).rejects.toBeInstanceOf(PdfBusyError)
  release()
  expect(await first).toBe("first")
  expect(await withPdfSlot(async () => "after")).toBe("after")
})

test("a PDF render can run concurrently while a walk holds the walk slot", async () => {
  _resetWalkPoolForTest(1, 0)
  let releaseWalk!: () => void
  const walkGate = new Promise<void>((r) => { releaseWalk = r })
  const walkSlot = withWalkSlot(async () => { await walkGate; return "walk-done" })
  await Promise.resolve() // let walk acquire its slot
  expect(isWalkInFlight()).toBe(true)

  // PDF render does not use the walk slot, so it should run successfully concurrently!
  const pdfResult = await withPdfSlot(async () => "pdf-done")
  expect(pdfResult).toBe("pdf-done")

  // Release the walk slot
  releaseWalk()
  expect(await walkSlot).toBe("walk-done")
})
