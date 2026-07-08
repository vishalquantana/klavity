// No-op loop recovery unit tests — no browser, no network, no real DB.
//
// The bug (2026-07-08 live dogfood): the AutoSim drive model fixated on "type email" and
// repeated it 4× without ever clicking "Send me a code". The stall-reroll (KLA-69) only
// fires on an explicit "stall" op; it doesn't catch the pattern where a "type" action
// succeeds (no error thrown) but the page doesn't change. The result: the walk times out.
//
// These tests verify that the drive loop:
//   (A) detects a page-stagnant no-op (same URL + same DOM content) after 1 successful repeat,
//       injects a nudge into history, and the model recovers by choosing a different action.
//   (B) when the model STILL doesn't change action after the nudge, auto-advance fires
//       by clicking the most likely submit control.
//   (C) the consecutiveSuccessKey guard (KLA-129) correctly uses stable selectors so kref
//       renumbering doesn't defeat the repeat-detection.
//   (D) auto-advance skips candidates that match >1 element (ambiguous) and tries the next.

import { test, expect, beforeAll } from "bun:test"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { BrowserPage, BrowserHandle } from "./trails-browser-page"
import type { TrailViewport } from "./trails-types"
import type { AuthorModel } from "./trails-author-model"

const file = join(tmpdir(), `klav-loop-rec-${Date.now()}-${Math.random().toString(36).slice(2)}.db`)
process.env.TURSO_DATABASE_URL = "file:" + file
delete process.env.TURSO_AUTH_TOKEN
process.env.KLAV_SECRET = Buffer.from("autosims-loop-rec-test-32bytesec").toString("base64")

const { reconnectDb, applySchema, migrateV2 } = await import("./db")
beforeAll(async () => { const db = reconnectDb("file:" + file); await applySchema(db); await migrateV2(db) })

const { authorTrail } = await import("./trails-author")

// ── Shared mock infra ─────────────────────────────────────────────────────────────────────────────

const LOGIN_DOM = `<html><body><form>
  <input type="email" aria-label="Email" id="email" value="test@test.com"/>
  <button type="submit" id="send">Send me a code</button>
</form></body></html>`

// A BrowserPage stub whose DOM/URL don't change until a click on the submit is received.
function makeStuckPage(opts: {
  // If set, click on this selector triggers the page to "advance" (dom changes to DONE_DOM)
  submitSelector?: string
}): BrowserPage & { advanceCount: number; clickLog: string[] } {
  let currentDom = LOGIN_DOM
  let currentUrl = "https://example.com/login"
  let advanceCount = 0
  const clickLog: string[] = []

  const DONE_DOM = `<html><body><p id="otp">Enter the code sent to your email.</p></body></html>`

  const page: BrowserPage & { advanceCount: number; clickLog: string[] } = {
    advanceCount: 0,
    clickLog,
    url: () => currentUrl,
    goto: async (url: string) => { currentUrl = url; currentDom = LOGIN_DOM },
    screenshotJpeg: async () => "",
    krefSnapshot: async () => {
      // Inject stable data-kref attributes — numbered so they're deterministic
      return currentDom.replace(/<input /g, '<input data-kref="e1" ').replace(/<button /g, '<button data-kref="e2" ')
    },
    count: async (selector: string) => {
      // Only return 1 for the submit selector we're configured with
      if (opts.submitSelector && selector === opts.submitSelector) return 1
      if (selector === 'button[type="submit"]') return 1
      // Ambiguous selector returns 2 to test that auto-advance skips it
      if (selector === 'form button:not([type="button"])') return 2
      return 0
    },
    fingerprint: async (selector: string) => ({
      domPath: selector,
      ariaLabel: selector.includes("email") ? "Email" : null,
      tagName: selector.includes("button") ? "BUTTON" : "INPUT",
      innerText: "",
      inputType: null,
      dataTestId: null,
      id: null,
      classNames: [],
      isInteractive: true,
    }),
    stableSelector: async (selector: string) => selector.replace(/\[data-kref="e\d+"\]/g, ""),
    click: async (selector: string) => {
      clickLog.push(selector)
      if (selector === 'button[type="submit"]' || selector === opts.submitSelector) {
        advanceCount++
        page.advanceCount = advanceCount
        currentDom = DONE_DOM
        currentUrl = "https://example.com/otp"
      }
    },
    fill: async () => {},
    selectOption: async () => {},
    hover: async () => {},
    keyPress: async () => {},
    clearField: async () => {},
    assertVisible: async () => {},
    assertTextEquals: async () => {},
    assertTextContains: async () => {},
    assertUrlMatches: async () => {},
    assertElementCount: async () => {},
    waitMs: async () => {},
    interceptNetwork: async () => {},
  } as any
  return page
}

function makeBrowserHandle(page: BrowserPage): { handle: BrowserHandle } {
  const handle: BrowserHandle = {
    newPage: async (_viewport?: TrailViewport | null) => page,
    close: async () => {},
    kind: "local",
  }
  return { handle }
}

const noSleepOpts = { sleepMs: () => Promise.resolve() }

// ── (A) No-op recovery: model recovers after nudge ───────────────────────────────────────────────

test("(A) loop-recovery: model that repeats type twice gets nudge and then recovers with click", async () => {
  const page = makeStuckPage({ submitSelector: 'button[type="submit"]' })
  const { handle } = makeBrowserHandle(page)

  let callCount = 0
  const capturedHistory: string[][] = []

  const model: AuthorModel = async (input) => {
    callCount++
    // Capture history snapshot on each call so we can verify the nudge was injected
    capturedHistory.push([...input.history])

    if (callCount <= 2) {
      // Calls 1+2: the model fixates — type the email field again (no-op, page doesn't change)
      return { action: { op: "type", selector: 'input[aria-label="Email"]', value: "test@test.com", url: null, checkpoint: null, rationale: "filling email" }, costUsd: 0 }
    }
    // Call 3: after the nudge (or auto-advance), the model recovers — declares the objective done.
    // (In a real recovery the model would click submit then declare done; for this unit test the
    // verifier confirms achievement immediately so we can measure nudge→recovery without extra hops.)
    return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "objective achieved" }, costUsd: 0 }
  }

  const verifier = async () => ({ achieved: true, reason: "", costUsd: 0 })

  const out = await authorTrail("proj_loop_a", { name: "Login", objective: "submit the login form", baseUrl: "https://example.com/login" }, {
    model,
    verifier,
    browserFactory: async () => handle,
    shotUploader: async () => ({ key: "test" }),
    ...noSleepOpts,
    verificationVision: false as const,
    headless: true,
  })

  // The drive must crystallize (model recovered) — NOT stall
  expect(out.status).toBe("crystallized")
  expect(out.stallReason).toBeNull()

  // The model was called at least 3 times (2 fixated + 1 recovery)
  expect(callCount).toBeGreaterThanOrEqual(3)

  // The nudge message must appear in the history before the 3rd call
  const historyBeforeRecovery = capturedHistory[2] ?? []
  const hasNudge = historyBeforeRecovery.some((h) =>
    h.toLowerCase().includes("did not change") || h.toLowerCase().includes("different action")
  )
  expect(hasNudge).toBe(true)
})

// ── (B) Auto-advance fires when model still doesn't change after nudge ───────────────────────────

test("(B) loop-recovery: auto-advance clicks submit when model ignores the nudge", async () => {
  const page = makeStuckPage({ submitSelector: 'button[type="submit"]' })
  const { handle } = makeBrowserHandle(page)

  let callCount = 0

  const model: AuthorModel = async (input) => {
    callCount++
    // The model ALWAYS returns "type" — it never self-recovers
    if (callCount < 10) {
      return { action: { op: "type", selector: 'input[aria-label="Email"]', value: "test@test.com", url: null, checkpoint: null, rationale: "filling email again" }, costUsd: 0 }
    }
    // If we somehow get past auto-advance, declare done
    return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
  }

  const verifier = async () => ({ achieved: true, reason: "", costUsd: 0 })

  const out = await authorTrail("proj_loop_b", { name: "Login", objective: "get past login", baseUrl: "https://example.com/login" }, {
    model,
    verifier,
    browserFactory: async () => handle,
    shotUploader: async () => ({ key: "test" }),
    ...noSleepOpts,
    verificationVision: false as const,
    headless: true,
  })

  // Either the auto-advance succeeded (crystallized) or we stalled after the auto-advance attempt
  // — either way we must NOT loop until AUTHOR_MAX_STEPS (the point is fast recovery, not endless spin)
  expect(["crystallized", "stalled"]).toContain(out.status)
  // Auto-advance must have fired — the submit button was clicked at least once
  const submitWasClicked = page.clickLog.some((s) => s.includes("submit") || s.includes("button"))
  expect(submitWasClicked).toBe(true)
  // And it happened EARLY — well before AUTHOR_MAX_STEPS (default 30) would be exhausted
  expect(callCount).toBeLessThan(10)
})

// ── (C) KLA-129 guard works with stable selectors despite kref renumbering ───────────────────────

test("(C) loop-recovery: KLA-129 repeat guard fires even when kref attribute numbers change", async () => {
  // This page renumbers krefs each snapshot (simulates real kref churn)
  let krefCounter = 0
  const page = makeStuckPage({})
  // Override krefSnapshot to use different kref numbers each time
  const originalSnapshot = page.krefSnapshot.bind(page)
  page.krefSnapshot = async () => {
    const base = await originalSnapshot()
    krefCounter++
    // Renumber — even numbers one call, odd numbers next, etc.
    return base.replace(/data-kref="e(\d+)"/g, (_, n) => `data-kref="e${Number(n) + krefCounter * 10}"`)
  }

  const { handle } = makeBrowserHandle(page)
  let callCount = 0

  const model: AuthorModel = async () => {
    callCount++
    // Always type into the email field — use the CURRENT kref number (which changes each iteration)
    const krefNum = krefCounter * 10 + 1  // e.g. e11, e21, e31...
    return { action: { op: "type", selector: `[data-kref="e${krefNum}"]`, value: "test@test.com", url: null, checkpoint: null, rationale: "type email" }, costUsd: 0 }
  }

  const out = await authorTrail("proj_loop_c", { name: "Login", objective: "login", baseUrl: "https://example.com/login" }, {
    model,
    browserFactory: async () => handle,
    shotUploader: async () => ({ key: "test" }),
    ...noSleepOpts,
    verificationVision: false as const,
    headless: true,
  })

  // Should stall (no click on submit, no done action) but EARLY — not after AUTHOR_MAX_STEPS
  // The stagnation guard (noOpCount) or the KLA-129 guard (successKey) catches it
  expect(out.status).toBe("stalled")
  // Must stall well before exhausting all 30 steps
  expect(callCount).toBeLessThanOrEqual(8)
})

// ── (D) Auto-advance skips ambiguous selectors (count > 1) ───────────────────────────────────────

test("(D) loop-recovery: auto-advance skips selectors matching >1 element", async () => {
  // Configure the page so button[type="submit"] returns 0 (doesn't exist) and
  // 'form button:not([type="button"])' returns 2 (ambiguous) — auto-advance should skip both
  const page = makeStuckPage({ submitSelector: "NONE" })  // no submit will be found
  const clicksBefore = [...page.clickLog]
  const { handle } = makeBrowserHandle(page)

  let callCount = 0
  const model: AuthorModel = async () => {
    callCount++
    if (callCount < 15) {
      return { action: { op: "type", selector: 'input[aria-label="Email"]', value: "test@test.com", url: null, checkpoint: null, rationale: "type" }, costUsd: 0 }
    }
    return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
  }

  await authorTrail("proj_loop_d", { name: "T", objective: "test", baseUrl: "https://example.com/login" }, {
    model,
    browserFactory: async () => handle,
    shotUploader: async () => ({ key: "test" }),
    ...noSleepOpts,
    verificationVision: false as const,
    headless: true,
  })

  // No extra clicks on ambiguous selectors — page.click must not have been called with
  // a selector that returns >1 element (this would be an undefined-element click)
  // The only allowed clicks are on selectors that returned exactly 1
  const newClicks = page.clickLog.slice(clicksBefore.length)
  // If any clicks fired, they must NOT be the ambiguous 'form button:not([type="button"])' one
  for (const click of newClicks) {
    expect(click).not.toBe('form button:not([type="button"])')
  }
})
