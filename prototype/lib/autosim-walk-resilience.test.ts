// KLAVITYKLA-397..401: AutoSim walk resilience — browser-acquire retry / CDP reconnect, infra-vs-flow
// error classification, and repeated-infra outage escalation. All hermetic (no real browser / DB /
// network): the retry wrapper takes an injectable acquire fn + no-op sleep, so we can drive the
// throw-then-succeed and connection-closed reconnect paths deterministically.
import { describe, test, expect, beforeEach } from "bun:test"
import {
  acquireWalkBrowser,
  isInfraTransportError,
  BrowserLaunchError,
  type PlaywrightBrowserHandle,
} from "./trails-browser-page"
import { isInfraFailure, recordWalkInfraOutcome, _resetWalkInfraTracker } from "./walk-red-alert"

const noSleep = () => Promise.resolve()
const fixedRand = () => 0.5 // deterministic jitter

// A stub handle — we never touch a real browser in these tests.
function fakeHandle(kind = "steel:iad"): PlaywrightBrowserHandle {
  return { browser: {} as any, close: async () => {}, kind }
}

describe("isInfraTransportError — infra vs flow classification", () => {
  test("connection-closed / target-closed / websocket drops are INFRA", () => {
    expect(isInfraTransportError(new Error("The connection was closed"))).toBe(true)
    expect(isInfraTransportError(new Error("WebSocket is not open: readyState 3 (CLOSED)"))).toBe(true)
    expect(isInfraTransportError(new Error("Target closed"))).toBe(true)
    expect(isInfraTransportError(new Error("Target page, context or browser has been closed"))).toBe(true)
    expect(isInfraTransportError(new Error("Protocol error (Runtime.callFunctionOn): Session closed."))).toBe(true)
    expect(isInfraTransportError(new Error("connect ECONNREFUSED 1.2.3.4:9222"))).toBe(true)
  })

  test("a BrowserLaunchError is always INFRA by construction", () => {
    expect(isInfraTransportError(new BrowserLaunchError("Steel session create failed (503)"))).toBe(true)
  })

  test("a genuine element/assertion FLOW failure is NOT infra", () => {
    expect(isInfraTransportError(new Error('locator.click: Timeout 5000ms exceeded.'))).toBe(false)
    expect(isInfraTransportError(new Error('checkpoint textEquals failed: expected "Done" got "Loading"'))).toBe(false)
    expect(isInfraTransportError(new Error("element gone: no tier resolved the target"))).toBe(false)
    expect(isInfraTransportError(undefined)).toBe(false)
    expect(isInfraTransportError(null)).toBe(false)
  })
})

describe("acquireWalkBrowser — bounded retry / CDP reconnect", () => {
  test("succeeds on the first attempt — no retry, acquire called once", async () => {
    let calls = 0
    const bh = await acquireWalkBrowser({}, {
      sleep: noSleep, rand: fixedRand,
      acquire: async () => { calls++; return fakeHandle() },
    })
    expect(bh.kind).toBe("steel:iad")
    expect(calls).toBe(1)
  })

  test("throw-then-succeed: a transient infra failure RECOVERS on retry", async () => {
    let calls = 0
    const bh = await acquireWalkBrowser({}, {
      attempts: 3, sleep: noSleep, rand: fixedRand,
      acquire: async () => {
        calls++
        if (calls === 1) throw new BrowserLaunchError("Steel session create failed (503) — transient")
        return fakeHandle()
      },
    })
    expect(bh.kind).toBe("steel:iad")
    expect(calls).toBe(2) // failed once, recovered on the second attempt
  })

  test("connection-closed mid-connect: RECONNECT path recovers on the next attempt", async () => {
    let calls = 0
    const bh = await acquireWalkBrowser({}, {
      attempts: 3, sleep: noSleep, rand: fixedRand,
      acquire: async () => {
        calls++
        if (calls < 2) throw new Error("The connection was closed")
        return fakeHandle("steel:iad")
      },
    })
    expect(calls).toBe(2)
    expect(bh.kind).toBe("steel:iad")
  })

  test("persistent infra outage exhausts the attempt budget then re-throws (bounded, no infinite loop)", async () => {
    let calls = 0
    await expect(
      acquireWalkBrowser({}, {
        attempts: 3, sleep: noSleep, rand: fixedRand,
        acquire: async () => { calls++; throw new BrowserLaunchError("connection was closed") },
      }),
    ).rejects.toThrow(/connection was closed/)
    expect(calls).toBe(3) // exactly the attempt cap — never more
  })

  test("a NON-infra error is NOT retried — fails immediately (infra retries must not mask logic bugs)", async () => {
    let calls = 0
    await expect(
      acquireWalkBrowser({}, {
        attempts: 3, sleep: noSleep, rand: fixedRand,
        acquire: async () => { calls++; throw new Error("some unexpected logic error") },
      }),
    ).rejects.toThrow(/unexpected logic error/)
    expect(calls).toBe(1)
  })
})

describe("walk-red-alert infra-vs-flow routing + outage escalation", () => {
  beforeEach(() => _resetWalkInfraTracker())

  test("browserUnavailable OR crash routes as INFRA, a plain regression does not", () => {
    expect(isInfraFailure({ failureKind: "crash" })).toBe(true)
    expect(isInfraFailure({ browserUnavailable: true })).toBe(true)
    expect(isInfraFailure({ failureKind: "regression" })).toBe(false)
    expect(isInfraFailure({})).toBe(false)
  })

  test("repeated browser-unavailable escalates ONCE at the threshold, rate-limited by the window", () => {
    const t0 = 1_000_000
    // Threshold default is 3 consecutive infra failures.
    expect(recordWalkInfraOutcome(true, t0).escalate).toBe(false)      // 1
    expect(recordWalkInfraOutcome(true, t0 + 1).escalate).toBe(false)  // 2
    const third = recordWalkInfraOutcome(true, t0 + 2)                 // 3 → escalate
    expect(third.consecutive).toBe(3)
    expect(third.escalate).toBe(true)
    // Still within the cooldown window → does NOT escalate again (rate-limited).
    expect(recordWalkInfraOutcome(true, t0 + 3).escalate).toBe(false)
    // After the window elapses → escalates again.
    expect(recordWalkInfraOutcome(true, t0 + 11 * 60_000).escalate).toBe(true)
  })

  test("a non-infra outcome RESETS the consecutive streak", () => {
    const t0 = 2_000_000
    recordWalkInfraOutcome(true, t0)
    recordWalkInfraOutcome(true, t0 + 1)
    expect(recordWalkInfraOutcome(false, t0 + 2).consecutive).toBe(0) // reset
    // Streak starts over — a single infra failure after a reset does not escalate.
    expect(recordWalkInfraOutcome(true, t0 + 3).escalate).toBe(false)
  })
})
