// KLAVITYKLA-207: PDF rendering slot isolation + queue behaviour.
//
// Goals tested:
//   1. withPdfSlot is FULLY INDEPENDENT of the walk slot pool — PDF renders succeed while a
//      walk holds the global walk slot (no contention, no false-busy).
//   2. Concurrent PDF requests serialize among themselves (FIFO queue) rather than 409ing.
//   3. The PDF queue times out cleanly so a stuck render doesn't hang waiters forever.
//   4. renderWalkPdf (the public API) respects the same isolation end-to-end when a fake
//      renderer is injected (no real Chromium needed — pure slot/queue logic tested).
//
// All tests are hermetic: the fake renderer is injected via _setPdfRendererForTests /
// KLAV_TEST_FAKE_PDF=1; no real Chromium, no DB writes, no network.

import { test, expect, beforeEach } from "bun:test"
import {
  withWalkSlot,
  withPdfSlot,
  isWalkInFlight,
  PdfBusyError,
  _resetWalkPoolForTest,
  _resetPdfAdmissionForTest,
} from "./trails-browser"

// Restore state before each test. Use a short PDF queue timeout so timeout tests run fast.
beforeEach(() => {
  _resetWalkPoolForTest(1, 0)
  _resetPdfAdmissionForTest(200) // 200ms PDF queue timeout for these tests
})

// ── 1. Walk-slot independence ─────────────────────────────────────────────────────────────────────

test("PDF render succeeds while the walk slot is fully occupied (slot independence)", async () => {
  // Fill the single walk slot with a long-running walk.
  let releaseWalk!: () => void
  const walkGate = new Promise<void>((r) => { releaseWalk = r })
  const walkDone: boolean[] = []

  const walkPromise = withWalkSlot(async () => {
    await walkGate
    walkDone.push(true)
  })

  // Yield so the walk acquires the slot.
  await Promise.resolve()
  expect(isWalkInFlight()).toBe(true)

  // PDF render must succeed EVEN THOUGH the walk slot is 100% occupied.
  // If they shared a slot this would either block or throw WalkBusyError.
  const result = await withPdfSlot(async () => "pdf-ok")
  expect(result).toBe("pdf-ok")

  // Walk is still in flight — we didn't need to wait for it.
  expect(walkDone).toHaveLength(0)

  releaseWalk()
  await walkPromise
  expect(walkDone).toHaveLength(1)
  expect(isWalkInFlight()).toBe(false)
})

test("multiple PDFs can run back-to-back while a walk holds the slot", async () => {
  // Same walk slot still held throughout; all 3 PDFs must complete.
  let releaseWalk!: () => void
  const walkGate = new Promise<void>((r) => { releaseWalk = r })
  const walkPromise = withWalkSlot(async () => { await walkGate })
  await Promise.resolve()
  expect(isWalkInFlight()).toBe(true)

  // Fire three PDFs; first runs immediately, second and third queue.
  const results: string[] = []
  const p1 = withPdfSlot(async () => { results.push("p1"); return "p1" })
  const p2 = withPdfSlot(async () => { results.push("p2"); return "p2" })
  const p3 = withPdfSlot(async () => { results.push("p3"); return "p3" })
  expect(await p1).toBe("p1")
  expect(await p2).toBe("p2")
  expect(await p3).toBe("p3")
  // Execution order must be FIFO.
  expect(results).toEqual(["p1", "p2", "p3"])

  releaseWalk()
  await walkPromise
})

// ── 2. PDF self-serialization (FIFO queue) ────────────────────────────────────────────────────────

test("second PDF request waits for the first to finish (serializing queue)", async () => {
  let release!: () => void
  const gate = new Promise<void>((r) => { release = r })
  const order: string[] = []

  const first = withPdfSlot(async () => {
    await gate
    order.push("first")
    return "first"
  })
  await Promise.resolve() // first acquires the slot

  // Second call queues — must NOT throw PdfBusyError right away.
  const second = withPdfSlot(async () => { order.push("second"); return "second" })

  // While first is still running, second is pending (not resolved yet).
  expect(order).toEqual([])

  release()
  const [r1, r2] = await Promise.all([first, second])
  expect(r1).toBe("first")
  expect(r2).toBe("second")
  // Serial: first must complete before second starts.
  expect(order).toEqual(["first", "second"])
})

test("three concurrent PDF requests execute in FIFO order", async () => {
  const releases: Array<() => void> = []
  const gates = [1, 2, 3].map(
    () => new Promise<void>((r) => { releases.push(r) }),
  )
  const order: number[] = []

  // First acquires the slot immediately; second and third queue.
  const p1 = withPdfSlot(async () => { await gates[0]; order.push(1) })
  const p2 = withPdfSlot(async () => { await gates[1]; order.push(2) })
  const p3 = withPdfSlot(async () => { await gates[2]; order.push(3) })
  await Promise.resolve()

  releases[0]() // unblock first
  await p1
  releases[1]() // unblock second
  await p2
  releases[2]() // unblock third
  await p3

  expect(order).toEqual([1, 2, 3])
})

// ── 3. Queue timeout ──────────────────────────────────────────────────────────────────────────────

test("PDF queue waiter times out with PdfBusyError when first render takes too long", async () => {
  // Use a very short timeout for this test.
  _resetPdfAdmissionForTest(30)

  let release!: () => void
  const gate = new Promise<void>((r) => { release = r })
  const first = withPdfSlot(async () => { await gate; return "first" })
  await Promise.resolve()

  // Second call will time out because first holds the slot past 30ms.
  await expect(withPdfSlot(async () => "should-timeout")).rejects.toBeInstanceOf(PdfBusyError)

  // First finishes normally after we release it.
  release()
  expect(await first).toBe("first")
})

test("timed-out PDF waiter does not prevent subsequent requests from running", async () => {
  _resetPdfAdmissionForTest(30)

  let release!: () => void
  const gate = new Promise<void>((r) => { release = r })
  const first = withPdfSlot(async () => { await gate; return "first" })
  await Promise.resolve()

  // This one times out...
  const timedOut = withPdfSlot(async () => "timed-out").catch((e) => e)

  // ...but this one is queued AFTER the timeout fires; it should run after first finishes.
  // Give the timeout a chance to fire before we queue the third.
  await Bun.sleep(50)
  _resetPdfAdmissionForTest(5000) // restore long timeout for the third waiter
  const third = withPdfSlot(async () => "third")

  release()
  const err = await timedOut
  expect(err).toBeInstanceOf(PdfBusyError)
  expect(await first).toBe("first")
  expect(await third).toBe("third")
})

test("PDF slot is not wedged after a queue timeout — dispatch must skip the stale waiter (KLA-59 leak)", async () => {
  // Regression for the slot-leak: a timed-out waiter used to linger in the queue (its stored
  // resolve was a wrapper, so identity-removal never matched). When the running render finished
  // and dispatched, it shifted that stale waiter, set _pdfRunning=true, and the no-op wrapper
  // never released it — wedging PDF rendering so EVERY later report 429'd until restart.
  _resetPdfAdmissionForTest(30)

  let release!: () => void
  const gate = new Promise<void>((r) => { release = r })
  const first = withPdfSlot(async () => { await gate; return "first" })
  await Promise.resolve() // first acquires the slot

  // Second queues and times out at 30ms — it must be REMOVED from the queue, not left behind.
  const timedOut = await withPdfSlot(async () => "second").catch((e) => e)
  expect(timedOut).toBeInstanceOf(PdfBusyError)

  // Release first. Its dispatch must NOT wake the stale timed-out waiter and wedge the slot.
  release()
  expect(await first).toBe("first")

  // A brand-new request AFTER everything must acquire the slot and run. With the bug the slot
  // stayed permanently "running" and this would itself time out with PdfBusyError.
  expect(await withPdfSlot(async () => "third")).toBe("third")
})

// ── 4. renderWalkPdf end-to-end isolation via injected renderer ───────────────────────────────────

test("renderWalkPdf does not contend with the walk slot (KLAVITYKLA-207 end-to-end)", async () => {
  // Use KLAV_TEST_FAKE_PDF so renderWalkPdf goes through withPdfSlot without Chromium.
  const prevFake = process.env.KLAV_TEST_FAKE_PDF
  process.env.KLAV_TEST_FAKE_PDF = "1"
  _resetWalkPoolForTest(1, 0)
  _resetPdfAdmissionForTest(5000)

  try {
    const { renderWalkPdf } = await import("./trails-share")

    let walkRunning = false
    let releaseWalk!: () => void
    const walkGate = new Promise<void>((r) => { releaseWalk = r })

    const walkPromise = withWalkSlot(async () => {
      walkRunning = true
      await walkGate
      walkRunning = false
    })

    // Yield so walk acquires slot.
    await Promise.resolve()
    expect(walkRunning).toBe(true)
    expect(isWalkInFlight()).toBe(true)

    // renderWalkPdf must succeed while the walk slot is fully busy.
    const pdfBytes = await renderWalkPdf("proj_iso", "walk_iso_001", "https://x.test")
    const text = new TextDecoder().decode(pdfBytes)
    expect(text).toContain("%PDF-fake-for-tests")

    // Walk is still running — PDF didn't wait for it.
    expect(walkRunning).toBe(true)

    releaseWalk()
    await walkPromise
    expect(walkRunning).toBe(false)
    expect(isWalkInFlight()).toBe(false)
  } finally {
    process.env.KLAV_TEST_FAKE_PDF = prevFake ?? (undefined as any)
  }
})
