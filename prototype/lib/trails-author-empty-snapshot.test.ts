// AutoSim "PX4 Valid Login": a slow-rendering SPA page must be re-captured until it has content, not stall after one try.
import { describe, test, expect } from "bun:test"
import { recaptureUntilContent } from "./trails-author"

describe("recaptureUntilContent", () => {
  test("keeps re-capturing a blank page until content appears", async () => {
    let calls = 0
    const out = await recaptureUntilContent("", async () => (++calls < 4 ? "" : 'text "Dashboard" [ref=e1]'), 8, 1)
    expect(out).toContain("Dashboard")
    expect(calls).toBe(4)
  })
  test("does not re-capture when the first snapshot already has content", async () => {
    let calls = 0
    const out = await recaptureUntilContent('button "Login" [ref=e1]', async () => { calls++; return "" }, 8, 1)
    expect(out).toContain("Login")
    expect(calls).toBe(0)
  })
  test("gives up after the bounded retries and returns the blank snapshot", async () => {
    let calls = 0
    const out = await recaptureUntilContent("", async () => { calls++; return "" }, 3, 1)
    expect(out).toBe("")
    expect(calls).toBe(3)
  })
})

// Stale-heartbeat fix: the Verification Walk must keep beating so the 3-min stale reaper doesn't kill a live run.
import { withHeartbeat } from "./trails-author"
describe("withHeartbeat", () => {
  test("beats repeatedly while the work runs, then stops beating", async () => {
    let beats = 0
    const out = await withHeartbeat(async () => { await new Promise((r) => setTimeout(r, 60)); return "walk-result" }, () => { beats++ }, 10)
    expect(out).toBe("walk-result")
    expect(beats).toBeGreaterThanOrEqual(3)
    const after = beats
    await new Promise((r) => setTimeout(r, 40))
    expect(beats).toBe(after)
  })
  test("stops beating and rethrows when the work throws", async () => {
    let beats = 0
    await expect(withHeartbeat(async () => { await new Promise((r) => setTimeout(r, 25)); throw new Error("walk boom") }, () => { beats++ }, 10)).rejects.toThrow("walk boom")
    const after = beats
    await new Promise((r) => setTimeout(r, 40))
    expect(beats).toBe(after)
  })
  test("a throwing/rejecting beat never breaks the work", async () => {
    const out = await withHeartbeat(async () => { await new Promise((r) => setTimeout(r, 30)); return 7 }, () => { throw new Error("db down") }, 10)
    expect(out).toBe(7)
  })
  test("no beat callback is fine", async () => {
    expect(await withHeartbeat(async () => 1, undefined, 10)).toBe(1)
  })
})

describe("withHeartbeat cap", () => {
  test("stops pulsing after maxMs so a hung run can go stale", async () => {
    let beats = 0
    await withHeartbeat(async () => { await new Promise((r) => setTimeout(r, 120)) }, () => { beats++ }, 10, 40)
    const atEnd = beats
    expect(atEnd).toBeGreaterThanOrEqual(2)
    expect(atEnd).toBeLessThanOrEqual(6) // ~40ms / 10ms, not ~12 beats for the full 120ms
  })
})

// "Project Creation" AutoSim: the model echoed snapshot markers as [ref="e6"] / "snapshot ref e6", which match nothing.
import { normalizeRefSelector, parseAuthorAction } from "./trails-author-model"
import { resumeLostSession } from "./trails-author"
describe("normalizeRefSelector", () => {
  const K = (n: string) => `[data-kref="${n}"]`
  test("maps every echoed marker shape to the real data-kref selector", () => {
    for (const s of [`[ref="e6"]`, `[ref=e6]`, `[ref='e6']`, `[ ref = "e6" ]`, "ref=e6", "ref e6", "ref: e6", "snapshot ref e6", "Snapshot Ref e6", "@e6", "e6", "E6"]) {
      expect(normalizeRefSelector(s)).toBe(K("e6"))
    }
  })
  test("leaves real selectors alone", () => {
    for (const s of [K("e6"), "#email", "button.primary", "[data-testid=ref]", 'a[href="/e6"]', "div > e6x", "[ref=e6] > span", "e6 button"]) {
      expect(normalizeRefSelector(s)).toBe(s)
    }
  })
  test("parseAuthorAction applies it", () => {
    const a = parseAuthorAction(JSON.stringify({ op: "click", selector: 'snapshot ref e12', value: null, url: null, rationale: "x" }))
    expect(a.selector).toBe(K("e12"))
    const b = parseAuthorAction(JSON.stringify({ op: "type", selector: '[ref="e3"]', value: "{{cred:a:password}}", rationale: "x" }))
    expect(b.selector).toBe(K("e3"))
  })
})

describe("resumeLostSession", () => {
  test("flags a resume that was bounced to a login/verification page", () => {
    expect(resumeLostSession("https://qa2.px4app.com/index.php/Actions/completed_project_actions_table/789", "https://qa2.px4app.com/app/login")).toBe(true)
    expect(resumeLostSession("https://x.com/dashboard", "https://x.com/auth/verification-code")).toBe(true)
  })
  test("does not flag normal landings", () => {
    expect(resumeLostSession("https://x.com/dashboard", "https://x.com/dashboard")).toBe(false)
    expect(resumeLostSession("https://x.com/dashboard", "https://x.com/dashboard/")).toBe(false) // trailing-slash redirect is not an auth gate
    expect(resumeLostSession("https://x.com/login", "https://x.com/login")).toBe(false)           // the checkpoint was ON the login page
    expect(resumeLostSession("https://x.com/signin", "https://x.com/verification")).toBe(false)    // expected page is itself an auth page
    expect(resumeLostSession("not a url", "also not")).toBe(false)
  })
})

import { isTransientSnapshotError } from "./trails-author"
describe("isTransientSnapshotError", () => {
  test("retries busy-page and mid-navigation errors", () => {
    for (const m of ["snapshot attempt hung", "snapshot capture timed out after 15000ms", "Timeout 30000ms exceeded",
      "Execution context was destroyed, most likely because of a navigation.", "Cannot find context with specified id",
      "Inspected target navigated or closed"]) expect(isTransientSnapshotError(m)).toBe(true)
  })
  test("does not retry real failures", () => {
    for (const m of ["selector matched 0 elements", "net::ERR_NAME_NOT_RESOLVED", "OPENROUTER_API_KEY not set"]) expect(isTransientSnapshotError(m)).toBe(false)
  })
})

import { allRowsRequested } from "./trails-author"
describe("allRowsRequested", () => {
  test("a single-row objective does not ask for select-all", () => {
    expect(allRowsRequested('Click on the 1st check box on the pending actions page. Click on the complete button. Click on the save button.')).toBe(false)
    expect(allRowsRequested("Do not repeat any step. Execute exactly once wherever applicable.")).toBe(false)
  })
  test("explicit all-rows wording does", () => {
    for (const o of ["Select all pending actions", "tick select_all then Complete", "complete all the actions", "mark every row as done", "Check all"]) expect(allRowsRequested(o)).toBe(true)
  })
})
