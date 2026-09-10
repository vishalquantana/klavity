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
}): BrowserPage & { advanceCount: number; clickLog: string[]; settleCount: number } {
  let currentDom = LOGIN_DOM
  let currentUrl = "https://example.com/login"
  let advanceCount = 0
  const clickLog: string[] = []

  const DONE_DOM = `<html><body><p id="otp">Enter the code sent to your email.</p></body></html>`

  let settleCount = 0
  const page: BrowserPage & { advanceCount: number; clickLog: string[]; settleCount: number } = {
    advanceCount: 0,
    settleCount: 0,
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
    waitMs: async () => {}, settleNetwork: async () => { settleCount++; page.settleCount = settleCount },
    interceptNetwork: async () => {},
    guardNavigations: async () => {},
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
  // KLA (BookJoy Save-loop): the recovery click is a commit action, so the loop settled the network
  // afterward (so the next snapshot would capture an AJAX result) — proves settleNetwork is wired post-click.
  expect(page.settleCount).toBeGreaterThan(0)
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

// ── (E) BookJoy login stall: DOM CHANGES each type (fill-state {filled:N} count), so the no-op guard
//        never fires — only the repeated-successKey guard trips. It must auto-submit, not fail. ───────
test("(E) repeated type where the snapshot keeps changing still auto-advances (BookJoy login fix)", async () => {
  let snapN = 0
  let settleN = 0
  let currentUrl = "https://example.com/v2/login"
  let dom = `<html><body><form>
    <input type="email" aria-label="Email" id="email" value="a@b.com"/>
    <input type="password" aria-label="Password" id="pw" value="x"/>
    <button type="submit" id="login">Log in</button>
  </form></body></html>`
  const clickLog: string[] = []
  const page: any = {
    url: () => currentUrl,
    goto: async (u: string) => { currentUrl = u },
    screenshotJpeg: async () => "",
    // Each capture is DIFFERENT (mimics the live {filled: N chars} count changing every type), so the
    // domHash-based no-op guard resets and never auto-advances — the successKey guard must handle it.
    krefSnapshot: async () => { snapN++; return dom.replace(/<input /, `<input data-kref="e1" data-snap="${snapN}" `).replace(/<button /, '<button data-kref="e2" ') },
    count: async (sel: string) => (sel === 'button[type="submit"]' ? 1 : sel === 'form button:not([type="button"])' ? 2 : (sel.includes("email") || sel.includes("Email") || sel === "#pw") ? 1 : 0),
    // Faithful to PROD + Codex's UNLABELED repro: #pw is a positional selector with NO accessibleName and
    // NO "password" text — detection must rely on the fingerprint's inputType="password" (the root fix).
    fingerprint: async (sel: string) => ({ domPath: sel, accessibleName: sel.includes("email") || sel.includes("Email") ? "Email" : "", role: "textbox", tagName: sel.includes("button") ? "BUTTON" : "INPUT", innerText: "", inputType: sel === "#pw" ? "password" : "text", dataTestId: null, id: null, classNames: [], isInteractive: true }),
    stableSelector: async (sel: string) => sel.replace(/\[data-kref="e\d+"\]/g, ""),
    click: async (sel: string) => { clickLog.push(sel); if (sel === 'button[type="submit"]') { currentUrl = "https://example.com/dashboard"; dom = `<html><body><p id="ok">Signed in.</p></body></html>` } },
    fill: async () => {}, selectOption: async () => {}, hover: async () => {}, keyPress: async () => {}, clearField: async () => {},
    assertVisible: async () => {}, assertTextEquals: async () => {}, assertTextContains: async () => {}, assertUrlMatches: async () => {}, assertElementCount: async () => {}, waitMs: async () => {}, settleNetwork: async () => { settleN++ }, interceptNetwork: async () => {}, guardNavigations: async () => {},
  }
  const handle: BrowserHandle = { newPage: async () => page, close: async () => {}, kind: "local" }

  let calls = 0
  const model: AuthorModel = async (input) => {
    calls++
    // Call 1: type the PASSWORD (establishes login-flow evidence for the C2-1 auto-submit gate).
    // Calls 2+: fixate re-typing the EMAIL and never click submit. Once the URL changes (auto-submit
    // worked → /dashboard), declare done.
    if (input.pageUrl && input.pageUrl.includes("/dashboard")) {
      return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "logged in" }, costUsd: 0 }
    }
    if (calls === 1) return { action: { op: "type", selector: '#pw', value: "x", url: null, checkpoint: null, rationale: "type password" }, costUsd: 0 }
    return { action: { op: "type", selector: 'input[aria-label="Email"]', value: "a@b.com", url: null, checkpoint: null, rationale: "type email" }, costUsd: 0 }
  }
  const verifier = async () => ({ achieved: true, reason: "", costUsd: 0 })

  const out = await authorTrail("proj_loop_e", { name: "Login", objective: "log in", baseUrl: "https://example.com/v2/login" }, {
    model, verifier, browserFactory: async () => handle, shotUploader: async () => ({ key: "t" }), ...noSleepOpts, verificationVision: false as const, headless: true,
  })

  // Neg-control: without the successKey→auto-submit fix, this run STALLS (repeated type never submits).
  expect(clickLog).toContain('button[type="submit"]') // auto-advance submitted the filled form
  // KLA (BookJoy Save-loop): the auto-submit helper settled the network before the post-click snapshot,
  // so a no-nav AJAX login result would be captured (not the pre-response DOM).
  expect(settleN).toBeGreaterThan(0)
  expect(out.status).toBe("crystallized")
  expect(out.stallReason).toBeNull()
  // C1-1: the recovery CLICK must be PERSISTED in the crystallized trail — else replay types the fields
  // and never submits. Assert a click step made it into trail_steps.
  const { createClient } = await import("@libsql/client")
  const raw = createClient({ url: "file:" + file })
  const steps = await raw.execute({ sql: "SELECT action FROM trail_steps WHERE trail_id=? ORDER BY idx", args: [out.trailId!] })
  expect((steps.rows as any[]).map((r) => r.action)).toContain("click")
})

// ── (F) C2-1: a NON-login context (no password field, non-auth URL) must NOT auto-submit — it stalls. ──
test("(F) repeated type on a non-login form does NOT auto-submit (C2-1 scope guard)", async () => {
  let snapN = 0
  const dom = `<html><body><form><input type="text" aria-label="Search" id="q" value="hi"/><button type="submit" id="go">Search</button></form></body></html>`
  const clickLog: string[] = []
  const page: any = {
    url: () => "https://example.com/search", goto: async () => {}, screenshotJpeg: async () => "",
    krefSnapshot: async () => { snapN++; return dom.replace(/<input /, `<input data-kref="e1" data-snap="${snapN}" `).replace(/<button /, '<button data-kref="e2" ') },
    count: async (sel: string) => (sel === 'button[type="submit"]' ? 1 : sel.includes("Search") || sel.includes("search") ? 1 : 0),
    fingerprint: async (sel: string) => ({ domPath: sel, ariaLabel: "Search", tagName: "INPUT", innerText: "", inputType: null, dataTestId: null, id: null, classNames: [], isInteractive: true }),
    stableSelector: async (sel: string) => sel.replace(/\[data-kref="e\d+"\]/g, ""),
    click: async (sel: string) => { clickLog.push(sel) },
    fill: async () => {}, selectOption: async () => {}, hover: async () => {}, keyPress: async () => {}, clearField: async () => {},
    assertVisible: async () => {}, assertTextEquals: async () => {}, assertTextContains: async () => {}, assertUrlMatches: async () => {}, assertElementCount: async () => {}, waitMs: async () => {}, settleNetwork: async () => {}, interceptNetwork: async () => {}, guardNavigations: async () => {},
  }
  const handle: BrowserHandle = { newPage: async () => page, close: async () => {}, kind: "local" }
  const model: AuthorModel = async () => ({ action: { op: "type", selector: 'input[aria-label="Search"]', value: "hi", url: null, checkpoint: null, rationale: "search" }, costUsd: 0 })
  const out = await authorTrail("proj_loop_f", { name: "Search", objective: "search", baseUrl: "https://example.com/search" }, {
    model, verifier: async () => ({ achieved: false, reason: "", costUsd: 0 }), browserFactory: async () => handle, shotUploader: async () => ({ key: "t" }), ...noSleepOpts, verificationVision: false as const, headless: true,
  })
  expect(clickLog).not.toContain('button[type="submit"]') // never auto-submitted a non-login form
  expect(out.status).toBe("stalled")
})

// ── (G) C2-2: if the auto-submit click is a NO-OP (page doesn't advance), auto-submit fires at most
//        ONCE for that stalled key, then the run stalls honestly instead of ping-ponging on budget. ──
test("(G) a no-op auto-submit is attempted once, then the run stalls (C2-2)", async () => {
  let snapN = 0
  const dom = `<html><body><form>
    <input type="password" aria-label="Password" id="pw" value="x"/>
    <button type="submit" id="login">Log in</button>
  </form></body></html>`
  const clickLog: string[] = []
  const page: any = {
    url: () => "https://example.com/v2/login", goto: async () => {}, screenshotJpeg: async () => "",
    // Snapshot changes each type (filled-count) but the submit click is a NO-OP — page never advances.
    krefSnapshot: async () => { snapN++; return dom.replace(/<input /, `<input data-kref="e1" data-snap="${snapN}" `).replace(/<button /, '<button data-kref="e2" ') },
    count: async (sel: string) => (sel === 'button[type="submit"]' ? 1 : sel.includes("assword") ? 1 : 0),
    fingerprint: async (sel: string) => ({ domPath: sel, ariaLabel: "Password", tagName: "INPUT", innerText: "", inputType: null, dataTestId: null, id: null, classNames: [], isInteractive: true }),
    stableSelector: async (sel: string) => sel.replace(/\[data-kref="e\d+"\]/g, ""),
    click: async (sel: string) => { clickLog.push(sel) /* NO-OP: never advances */ },
    fill: async () => {}, selectOption: async () => {}, hover: async () => {}, keyPress: async () => {}, clearField: async () => {},
    assertVisible: async () => {}, assertTextEquals: async () => {}, assertTextContains: async () => {}, assertUrlMatches: async () => {}, assertElementCount: async () => {}, waitMs: async () => {}, settleNetwork: async () => {}, interceptNetwork: async () => {}, guardNavigations: async () => {},
  }
  const handle: BrowserHandle = { newPage: async () => page, close: async () => {}, kind: "local" }
  const model: AuthorModel = async () => ({ action: { op: "type", selector: 'input[aria-label="Password"]', value: "x", url: null, checkpoint: null, rationale: "type pw" }, costUsd: 0 })
  const out = await authorTrail("proj_loop_g", { name: "Login", objective: "log in", baseUrl: "https://example.com/v2/login" }, {
    model, verifier: async () => ({ achieved: false, reason: "", costUsd: 0 }), browserFactory: async () => handle, shotUploader: async () => ({ key: "t" }), ...noSleepOpts, verificationVision: false as const, headless: true,
  })
  // Auto-submit is attempted exactly ONCE for the stalled key (no ping-pong), then it stalls honestly.
  expect(clickLog.filter((c) => c === 'button[type="submit"]').length).toBe(1)
  expect(out.status).toBe("stalled")
})

// ── (H) C2-1 precise repro: the page HAS a password field (e.g. a settings form), but the model repeats
//        typing in an UNRELATED search box and never types the password. Flow-scoped gate = NO auto-submit. ──
test("(H) page has a password field but repeated type is in a search box → NOT auto-submitted (C2-1 flow scope)", async () => {
  let snapN = 0
  // A password-settings field is present on the page, plus a separate search form with a lone submit.
  const dom = `<html><body>
    <form id="settings"><input type="password" aria-label="New password" id="np" value=""/></form>
    <form id="search"><input type="text" aria-label="Search" id="q" value="hi"/><button type="submit" id="go">Search</button></form>
  </body></html>`
  const clickLog: string[] = []
  const page: any = {
    url: () => "https://example.com/account/security", goto: async () => {}, screenshotJpeg: async () => "",
    // data-snap changes each capture (survives the kref-strip) so the DOM-hash NO-OP guard never fires —
    // this isolates the successKey guard (my change) so the test proves ITS sawPasswordType gate.
    krefSnapshot: async () => { snapN++; return dom.replace('<input type="text"', `<input type="text" data-kref="e1" data-snap="${snapN}"`).replace('<button ', '<button data-kref="eb" ') },
    count: async (sel: string) => (sel === 'button[type="submit"]' ? 1 : sel.includes("Search") || sel.includes("search") ? 1 : 0),
    // The model only ever types the SEARCH field — never the password.
    fingerprint: async (sel: string) => ({ domPath: sel, ariaLabel: "Search", tagName: "INPUT", innerText: "", inputType: "text", dataTestId: null, id: null, classNames: [], isInteractive: true }),
    stableSelector: async (sel: string) => sel.replace(/\[data-kref="e\w+"\]/g, ""),
    click: async (sel: string) => { clickLog.push(sel) },
    fill: async () => {}, selectOption: async () => {}, hover: async () => {}, keyPress: async () => {}, clearField: async () => {},
    assertVisible: async () => {}, assertTextEquals: async () => {}, assertTextContains: async () => {}, assertUrlMatches: async () => {}, assertElementCount: async () => {}, waitMs: async () => {}, settleNetwork: async () => {}, interceptNetwork: async () => {}, guardNavigations: async () => {},
  }
  const handle: BrowserHandle = { newPage: async () => page, close: async () => {}, kind: "local" }
  const model: AuthorModel = async () => ({ action: { op: "type", selector: 'input[aria-label="Search"]', value: "hi", url: null, checkpoint: null, rationale: "search" }, costUsd: 0 })
  const out = await authorTrail("proj_loop_h", { name: "Search", objective: "search", baseUrl: "https://example.com/account/security" }, {
    model, verifier: async () => ({ achieved: false, reason: "", costUsd: 0 }), browserFactory: async () => handle, shotUploader: async () => ({ key: "t" }), ...noSleepOpts, verificationVision: false as const, headless: true,
  })
  // Even though the page contains a password field, the model never TYPED a password, so the run is not a
  // login flow → the search form's submit must NOT be auto-clicked.
  expect(clickLog).not.toContain('button[type="submit"]')
  expect(out.status).toBe("stalled")
})

// ── (E) KLA-786: AJAX save (commit, no DOM change) nudges toward "done", never re-clicks submit ─────

test("(E) KLA-786: a commit that leaves the DOM unchanged nudges the model to finish, not re-submit", async () => {
  // BookJoy's Save on #customer_notes persists via AJAX with NO observable DOM change. Clicking Save is
  // a COMMIT, so after settling the network the loop must recognise a just-committed action that left the
  // page unchanged as "likely saved" and steer the model to emit "done" — NOT fire the auto-advance submit
  // (which re-clicks Save → the save-loop we saw live). A submit-candidate IS present on the page, so if the
  // suppression were absent the auto-advance would click it.
  const NOTES_DOM = `<html><body><form>
    <textarea aria-label="Notes" id="customer_notes">test note</textarea>
    <button type="submit" id="cus_notes">Save</button>
  </form></body></html>`
  const clickLog: string[] = []
  let settleCount = 0
  const page: any = {
    url: () => "https://example.com/customer/42",
    goto: async () => {}, screenshotJpeg: async () => "",
    // DOM NEVER changes on click — the AJAX save has no visible confirmation.
    krefSnapshot: async () => NOTES_DOM.replace(/<textarea /g, '<textarea data-kref="e1" ').replace(/<button /g, '<button data-kref="e2" '),
    count: async (sel: string) => (sel === '#cus_notes' || sel === 'button[type="submit"]' || sel === '#customer_notes' ? 1 : 0),
    fingerprint: async (sel: string) => ({ domPath: sel, ariaLabel: sel.includes("notes") ? "Notes" : null, tagName: sel.includes("cus_notes") ? "BUTTON" : "TEXTAREA", innerText: "", inputType: null, dataTestId: null, id: null, classNames: [], isInteractive: true }),
    stableSelector: async (sel: string) => sel.replace(/\[data-kref="e\d+"\]/g, ""),
    click: async (sel: string) => { clickLog.push(sel) /* AJAX save: no DOM/URL change */ },
    fill: async () => {}, selectOption: async () => {}, hover: async () => {}, keyPress: async () => {}, clearField: async () => {},
    assertVisible: async () => {}, assertTextEquals: async () => {}, assertTextContains: async () => {}, assertUrlMatches: async () => {}, assertElementCount: async () => {},
    waitMs: async () => {}, settleNetwork: async () => { settleCount++ }, interceptNetwork: async () => {}, guardNavigations: async () => {},
  }
  const handle: BrowserHandle = { newPage: async () => page, close: async () => {}, kind: "local" }

  let callCount = 0
  const capturedHistory: string[][] = []
  const model: AuthorModel = async (input) => {
    callCount++
    capturedHistory.push([...input.history])
    // The model clicks Save a few times (each a commit that doesn't change the page). Once it sees the
    // KLA-786 "done" nudge it should finish — but to prove the loop never auto-advances on the commit
    // path, keep clicking Save until we finally declare done.
    if (callCount < 4) {
      return { action: { op: "click", selector: '#cus_notes', value: null, url: null, checkpoint: null, rationale: "save the note" }, costUsd: 0 }
    }
    return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "note saved" }, costUsd: 0 }
  }
  const verifier = async () => ({ achieved: true, reason: "", costUsd: 0 })

  const out = await authorTrail("proj_loop_e", { name: "Save note", objective: "save a note on the customer", baseUrl: "https://example.com/customer/42" }, {
    model, verifier, browserFactory: async () => handle, shotUploader: async () => ({ key: "t" }), ...noSleepOpts, verificationVision: false as const, headless: true,
  })

  // Finished cleanly — the model emitted "done" and the verifier confirmed.
  expect(out.status).toBe("crystallized")
  // The auto-advance submit must NEVER have fired on the commit path — only the model's own #cus_notes
  // clicks appear, never a synthetic button[type="submit"] auto-click.
  expect(clickLog).not.toContain('button[type="submit"]')
  expect(clickLog.every((s) => s === '#cus_notes')).toBe(true)
  // The commit was settled (network idle awaited so the next snapshot could catch any AJAX result).
  expect(settleCount).toBeGreaterThan(0)
  // The KLA-786 nudge (steer to "done", page did not visibly change) must have been injected.
  const sawDoneNudge = capturedHistory.flat().some((h) =>
    h.toLowerCase().includes("did not visibly change") && h.toLowerCase().includes('"done"')
  )
  expect(sawDoneNudge).toBe(true)
})

// ── (F) KLA-786 (round-1 C2): the no-op guard auto-advances a submit AT MOST ONCE per stagnation ─────

test("(F) KLA-786: auto-advance does not re-fire the same submit every couple of iterations", async () => {
  // A model that never self-recovers on a page whose submit does NOT advance it (the auto-advance click
  // has no visible effect). Before the cap, the guard re-clicked the submit every ~2 iterations — a live
  // save side-effect each time — until the step/deadline budget drained. With AUTO_ADVANCE_MAX=1 the guard
  // clicks submit at most once, then switches to the done/different-check nudge. The run stays bounded.
  const STATIC_DOM = `<html><body><form>
    <input type="email" aria-label="Email" id="email" value="x@y.com"/>
    <button type="submit" id="go">Go</button>
  </form></body></html>`
  const clickLog: string[] = []
  const page: any = {
    url: () => "https://example.com/stuck",
    goto: async () => {}, screenshotJpeg: async () => "",
    krefSnapshot: async () => STATIC_DOM.replace(/<input /g, '<input data-kref="e1" ').replace(/<button /g, '<button data-kref="e2" '),
    count: async (sel: string) => (sel === 'button[type="submit"]' || sel.includes("Email") || sel.includes("email") ? 1 : 0),
    fingerprint: async (sel: string) => ({ domPath: sel, ariaLabel: "Email", tagName: sel.includes("button") ? "BUTTON" : "INPUT", innerText: "", inputType: sel.includes("button") ? null : "text", dataTestId: null, id: null, classNames: [], isInteractive: true }),
    stableSelector: async (sel: string) => sel.replace(/\[data-kref="e\d+"\]/g, ""),
    click: async (sel: string) => { clickLog.push(sel) /* submit has no visible effect on this page */ },
    fill: async () => {}, selectOption: async () => {}, hover: async () => {}, keyPress: async () => {}, clearField: async () => {},
    assertVisible: async () => {}, assertTextEquals: async () => {}, assertTextContains: async () => {}, assertUrlMatches: async () => {}, assertElementCount: async () => {},
    waitMs: async () => {}, settleNetwork: async () => {}, interceptNetwork: async () => {}, guardNavigations: async () => {},
  }
  const handle: BrowserHandle = { newPage: async () => page, close: async () => {}, kind: "local" }
  // The model NEVER changes action and never declares done — it just re-types the same field forever.
  const model: AuthorModel = async () => ({ action: { op: "type", selector: 'input[aria-label="Email"]', value: "x@y.com", url: null, checkpoint: null, rationale: "typing" }, costUsd: 0 })
  const verifier = async () => ({ achieved: false, reason: "not yet", costUsd: 0 })

  const out = await authorTrail("proj_loop_f", { name: "Stuck", objective: "do the thing", baseUrl: "https://example.com/stuck" }, {
    model, verifier, browserFactory: async () => handle, shotUploader: async () => ({ key: "t" }), ...noSleepOpts, verificationVision: false as const, headless: true,
  })

  // Bounded — the run stalls rather than looping forever.
  expect(out.status).toBe("stalled")
  // The submit was auto-clicked AT MOST ONCE despite many stagnant iterations (the cap held).
  const submitClicks = clickLog.filter((s) => s === 'button[type="submit"]').length
  expect(submitClicks).toBeLessThanOrEqual(1)
})
