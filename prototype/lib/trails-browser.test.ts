import { test, expect } from "bun:test"
import { withWalkSlot, isWalkInFlight, WalkBusyError, CHROMIUM_PROD_ARGS, cancelCurrentWalk, setCurrentWalkRunId, getCurrentWalkAbortSignal, currentWalkRunId } from "./trails-browser"

test("withWalkSlot runs the fn and clears the slot after", async () => {
  expect(isWalkInFlight()).toBe(false)
  const r = await withWalkSlot(async () => { expect(isWalkInFlight()).toBe(true); return 42 })
  expect(r).toBe(42)
  expect(isWalkInFlight()).toBe(false)
})

test("a second concurrent withWalkSlot throws WalkBusyError (max 1)", async () => {
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
  expect(currentWalkRunId()).toBe("walk_cancel_me")
  expect(capturedSignal?.aborted).toBe(false)
  const result = cancelCurrentWalk("walk_cancel_me")
  expect(result).toBe(true)
  expect(capturedSignal?.aborted).toBe(true)
  release()
  await slot
  // Slot cleared after completion
  expect(isWalkInFlight()).toBe(false)
  expect(currentWalkRunId()).toBe(null)
  expect(getCurrentWalkAbortSignal()).toBe(null)
})

test("getCurrentWalkAbortSignal returns null outside a slot and non-null inside", async () => {
  expect(getCurrentWalkAbortSignal()).toBe(null)
  let inner: AbortSignal | null = null
  await withWalkSlot(async () => { inner = getCurrentWalkAbortSignal() })
  expect(inner).not.toBe(null)
  expect(getCurrentWalkAbortSignal()).toBe(null)
})
