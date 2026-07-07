// KLA-74: unit tests for WalkEvidenceCollector.
// Uses a minimal mock page (no Playwright required) — only needs page.on().
import { test, expect, describe, beforeEach } from "bun:test"
import {
  WalkEvidenceCollector,
  MAX_CONSOLE_ENTRIES, MAX_PAGE_ERRORS, MAX_FAILED_REQUESTS, MAX_FAILED_RESPONSES,
  MAX_TEXT_LEN, MAX_URL_LEN,
} from "./trails-walk-evidence"

// ── Mock page ─────────────────────────────────────────────────────────────────

class MockPage {
  private handlers: Map<string, Array<(...args: any[]) => void>> = new Map()
  on(event: string, fn: (...args: any[]) => void): void {
    const arr = this.handlers.get(event) ?? []
    arr.push(fn)
    this.handlers.set(event, arr)
  }
  emit(event: string, ...args: any[]): void {
    for (const fn of this.handlers.get(event) ?? []) fn(...args)
  }
}

// Helpers for mock Playwright objects
function mockMsg(type: string, text: string) {
  return { type: () => type, text: () => text }
}
function mockErr(message: string) {
  return { message }
}
function mockReq(url: string, method: string, errorText: string) {
  return { url: () => url, method: () => method, failure: () => ({ errorText }) }
}
function mockResp(url: string, method: string, status: number) {
  return { url: () => url, status: () => status, request: () => ({ method: () => method }) }
}

// ── Basic attach + event capture ──────────────────────────────────────────────

describe("WalkEvidenceCollector.attach", () => {
  let col: WalkEvidenceCollector
  let page: MockPage

  beforeEach(() => {
    col = new WalkEvidenceCollector()
    page = new MockPage()
    col.attach(page)
  })

  test("captures console error messages", () => {
    page.emit("console", mockMsg("error", "TypeError: cannot read property"))
    const s = col.summary()
    expect(s.consoleLogs).toHaveLength(1)
    expect(s.consoleLogs[0].level).toBe("error")
    expect(s.consoleLogs[0].text).toContain("TypeError")
  })

  test("captures console warning messages", () => {
    page.emit("console", mockMsg("warning", "Deprecated API used"))
    expect(col.summary().consoleLogs[0].level).toBe("warning")
  })

  test("also maps 'warn' type to 'warning' level", () => {
    page.emit("console", mockMsg("warn", "some warn"))
    expect(col.summary().consoleLogs[0].level).toBe("warning")
  })

  test("ignores console.log and console.info (not error/warn)", () => {
    page.emit("console", mockMsg("log", "just a log"))
    page.emit("console", mockMsg("info", "just info"))
    expect(col.summary().consoleLogs).toHaveLength(0)
  })

  test("captures pageerror events", () => {
    page.emit("pageerror", mockErr("Uncaught ReferenceError: x is not defined"))
    const s = col.summary()
    expect(s.pageErrors).toHaveLength(1)
    expect(s.pageErrors[0].message).toContain("ReferenceError")
  })

  test("captures requestfailed events", () => {
    page.emit("requestfailed", mockReq("https://api.example.com/data", "GET", "net::ERR_CONNECTION_REFUSED"))
    const s = col.summary()
    expect(s.failedRequests).toHaveLength(1)
    expect(s.failedRequests[0].url).toContain("api.example.com")
    expect(s.failedRequests[0].method).toBe("GET")
    expect(s.failedRequests[0].failure).toContain("ERR_CONNECTION_REFUSED")
  })

  test("captures 4xx/5xx responses, ignores 2xx/3xx", () => {
    page.emit("response", mockResp("https://api.example.com/fail", "POST", 500))
    page.emit("response", mockResp("https://api.example.com/ok",   "GET",  200))
    page.emit("response", mockResp("https://api.example.com/redir","GET",  301))
    page.emit("response", mockResp("https://api.example.com/auth", "GET",  401))
    const s = col.summary()
    expect(s.failedResponses).toHaveLength(2)
    expect(s.failedResponses.map(r => r.status).sort()).toEqual([401, 500])
  })

  test("captures 400 (boundary) as failed response", () => {
    page.emit("response", mockResp("https://x.com/bad-request", "POST", 400))
    expect(col.summary().failedResponses).toHaveLength(1)
    expect(col.summary().failedResponses[0].status).toBe(400)
  })

  test("does NOT capture 399", () => {
    page.emit("response", mockResp("https://x.com/ok", "GET", 399))
    expect(col.summary().failedResponses).toHaveLength(0)
  })
})

// ── Caps ──────────────────────────────────────────────────────────────────────

describe("WalkEvidenceCollector caps", () => {
  test("console log cap: stops at MAX_CONSOLE_ENTRIES", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    for (let i = 0; i < MAX_CONSOLE_ENTRIES + 10; i++) {
      page.emit("console", mockMsg("error", `error ${i}`))
    }
    expect(col.summary().consoleLogs).toHaveLength(MAX_CONSOLE_ENTRIES)
  })

  test("page error cap: stops at MAX_PAGE_ERRORS", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    for (let i = 0; i < MAX_PAGE_ERRORS + 5; i++) {
      page.emit("pageerror", mockErr(`err ${i}`))
    }
    expect(col.summary().pageErrors).toHaveLength(MAX_PAGE_ERRORS)
  })

  test("failed requests cap: stops at MAX_FAILED_REQUESTS", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    for (let i = 0; i < MAX_FAILED_REQUESTS + 5; i++) {
      page.emit("requestfailed", mockReq(`https://x.com/${i}`, "GET", "error"))
    }
    expect(col.summary().failedRequests).toHaveLength(MAX_FAILED_REQUESTS)
  })

  test("failed responses cap: stops at MAX_FAILED_RESPONSES", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    for (let i = 0; i < MAX_FAILED_RESPONSES + 5; i++) {
      page.emit("response", mockResp(`https://x.com/${i}`, "GET", 500))
    }
    expect(col.summary().failedResponses).toHaveLength(MAX_FAILED_RESPONSES)
  })

  test("text is truncated at MAX_TEXT_LEN", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    const long = "x".repeat(MAX_TEXT_LEN + 100)
    page.emit("console", mockMsg("error", long))
    expect(col.summary().consoleLogs[0].text).toHaveLength(MAX_TEXT_LEN)
  })

  test("URL is truncated at MAX_URL_LEN", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    const longUrl = "https://example.com/" + "a".repeat(MAX_URL_LEN + 100)
    page.emit("requestfailed", mockReq(longUrl, "GET", "error"))
    expect(col.summary().failedRequests[0].url).toHaveLength(MAX_URL_LEN)
  })
})

// ── offsets + stepEvidence (per-step attribution) ────────────────────────────

describe("WalkEvidenceCollector.stepEvidence", () => {
  test("durationMs is measured correctly", async () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    const before = col.offsets()
    const start = Date.now()
    await new Promise(r => setTimeout(r, 20))
    const se = col.stepEvidence(before, start)
    expect(se.durationMs).toBeGreaterThanOrEqual(15)
    expect(se.durationMs).toBeLessThan(200)
  })

  test("events before offsets snapshot are NOT included in step slice", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    // pre-step events (step 0)
    page.emit("console", mockMsg("error", "pre-step error"))
    const before = col.offsets()  // snapshot after pre-step events
    const start = Date.now()
    // step events
    page.emit("console", mockMsg("error", "step error"))
    const se = col.stepEvidence(before, start)
    expect(se.consoleLogs).toHaveLength(1)
    expect(se.consoleLogs![0].text).toBe("step error")
  })

  test("events after stepEvidence() call are NOT included in prior step slice", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    const before = col.offsets()
    const start = Date.now()
    page.emit("pageerror", mockErr("step 1 error"))
    const se = col.stepEvidence(before, start)
    // emit more AFTER the slice — should not appear in se
    page.emit("pageerror", mockErr("step 2 error"))
    expect(se.pageErrors).toHaveLength(1)
    expect(se.pageErrors![0].message).toBe("step 1 error")
  })

  test("stepEvidence omits empty arrays (keeps evidence compact)", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    const before = col.offsets()
    const start = Date.now()
    // No events fire during this step
    const se = col.stepEvidence(before, start)
    expect(se.consoleLogs).toBeUndefined()
    expect(se.pageErrors).toBeUndefined()
    expect(se.failedRequests).toBeUndefined()
    expect(se.failedResponses).toBeUndefined()
  })

  test("each step gets only its own events (three consecutive steps)", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    const start = Date.now()

    const b1 = col.offsets()
    page.emit("console", mockMsg("error", "step1 error"))
    const se1 = col.stepEvidence(b1, start)

    const b2 = col.offsets()
    page.emit("console", mockMsg("error", "step2 error"))
    page.emit("pageerror", mockErr("step2 pageerror"))
    const se2 = col.stepEvidence(b2, start)

    const b3 = col.offsets()
    // no events for step 3
    const se3 = col.stepEvidence(b3, start)

    expect(se1.consoleLogs).toHaveLength(1)
    expect(se1.consoleLogs![0].text).toBe("step1 error")
    expect(se1.pageErrors).toBeUndefined()

    expect(se2.consoleLogs).toHaveLength(1)
    expect(se2.consoleLogs![0].text).toBe("step2 error")
    expect(se2.pageErrors).toHaveLength(1)

    expect(se3.consoleLogs).toBeUndefined()
    expect(se3.pageErrors).toBeUndefined()
  })
})

// ── hasEvidence ───────────────────────────────────────────────────────────────

describe("WalkEvidenceCollector.hasEvidence", () => {
  test("false when nothing captured", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    expect(col.hasEvidence()).toBe(false)
  })

  test("true after a console error", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    page.emit("console", mockMsg("error", "oops"))
    expect(col.hasEvidence()).toBe(true)
  })

  test("true after a pageerror", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    page.emit("pageerror", mockErr("crash"))
    expect(col.hasEvidence()).toBe(true)
  })

  test("true after a failed request", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    page.emit("requestfailed", mockReq("https://x.com", "GET", "ECONNREFUSED"))
    expect(col.hasEvidence()).toBe(true)
  })

  test("true after a 4xx response", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    page.emit("response", mockResp("https://x.com", "GET", 404))
    expect(col.hasEvidence()).toBe(true)
  })

  test("false when only 2xx/3xx responses captured (not errors)", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    page.emit("response", mockResp("https://x.com", "GET", 200))
    page.emit("console", mockMsg("log", "ignored log"))
    expect(col.hasEvidence()).toBe(false)
  })
})

// ── Resilience: broken page.on doesn't throw ──────────────────────────────────

describe("WalkEvidenceCollector resilience", () => {
  test("attach() does not throw when page.on throws", () => {
    const col = new WalkEvidenceCollector()
    const broken = { on: () => { throw new Error("simulated page.on failure") } }
    expect(() => col.attach(broken)).not.toThrow()
  })

  test("attach() does not throw when event handler args are null/undefined", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    // Emit with null/undefined args — handler must be safe
    expect(() => page.emit("console", null)).not.toThrow()
    expect(() => page.emit("pageerror", null)).not.toThrow()
    expect(() => page.emit("requestfailed", null)).not.toThrow()
    expect(() => page.emit("response", null)).not.toThrow()
  })

  test("attach() does not throw when msg.type() throws", () => {
    const col = new WalkEvidenceCollector()
    const page = new MockPage()
    col.attach(page)
    const badMsg = { type: () => { throw new Error("bad") }, text: () => "msg" }
    expect(() => page.emit("console", badMsg)).not.toThrow()
  })
})
