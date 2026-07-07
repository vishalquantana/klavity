// KLA-74: Walk failure-evidence collection.
// Attaches best-effort event listeners to a Playwright Page to capture console
// errors/warnings, uncaught JS exceptions, failed network requests, and 4xx/5xx
// responses during a Walk. All handlers are try-caught and never throw.
// Pure module — no DB/runtime imports so it's fully unit-testable with a mock page.

export const MAX_CONSOLE_ENTRIES  = 50
export const MAX_PAGE_ERRORS      = 20
export const MAX_FAILED_REQUESTS  = 30
export const MAX_FAILED_RESPONSES = 30
export const MAX_TEXT_LEN  = 500
export const MAX_URL_LEN   = 300

export interface ConsoleEntry     { level: "error" | "warning"; text: string }
export interface PageErrorEntry   { message: string }
export interface FailedReqEntry   { url: string; method: string; failure: string }
export interface FailedRespEntry  { url: string; method: string; status: number }

/** Snapshot of buffer lengths — used to slice per-step events. */
export interface EvidenceOffsets  { c: number; e: number; r: number; s: number }

/** Evidence merged into each run_step's evidence_json. */
export interface StepEvidenceSlice {
  durationMs: number
  consoleLogs?:     ConsoleEntry[]
  pageErrors?:      PageErrorEntry[]
  failedRequests?:  FailedReqEntry[]
  failedResponses?: FailedRespEntry[]
}

/** Evidence merged into the walk summary_json. */
export interface WalkEvidenceSummary {
  consoleLogs:     ConsoleEntry[]
  pageErrors:      PageErrorEntry[]
  failedRequests:  FailedReqEntry[]
  failedResponses: FailedRespEntry[]
}

/** Minimal page interface required by attach() — compatible with Playwright Page. */
export interface PageLike {
  on(event: string, fn: (...args: any[]) => void): void
}

export class WalkEvidenceCollector {
  private consoleLogs:     ConsoleEntry[]    = []
  private pageErrors:      PageErrorEntry[]  = []
  private failedRequests:  FailedReqEntry[]  = []
  private failedResponses: FailedRespEntry[] = []

  /**
   * Attach listeners to a page. All handlers are individually try-caught; a
   * broken handler never disrupts the walk. Safe to call multiple times — each
   * call registers additional listeners (idempotent-enough for one Walk).
   */
  attach(page: PageLike): void {
    try {
      page.on("console", (msg: any) => {
        try {
          const type = String(msg.type?.() ?? "")
          const level: "error" | "warning" | null =
            type === "error" ? "error"
            : type === "warning" || type === "warn" ? "warning"
            : null
          if (level && this.consoleLogs.length < MAX_CONSOLE_ENTRIES) {
            this.consoleLogs.push({ level, text: String(msg.text?.() ?? "").slice(0, MAX_TEXT_LEN) })
          }
        } catch {}
      })
    } catch {}

    try {
      page.on("pageerror", (err: any) => {
        try {
          if (this.pageErrors.length < MAX_PAGE_ERRORS) {
            this.pageErrors.push({ message: String(err?.message ?? err ?? "").slice(0, MAX_TEXT_LEN) })
          }
        } catch {}
      })
    } catch {}

    try {
      page.on("requestfailed", (req: any) => {
        try {
          if (this.failedRequests.length < MAX_FAILED_REQUESTS) {
            this.failedRequests.push({
              url:     String(req.url?.()     ?? "").slice(0, MAX_URL_LEN),
              method:  String(req.method?.()  ?? "GET"),
              failure: String(req.failure?.()?.errorText ?? "unknown"),
            })
          }
        } catch {}
      })
    } catch {}

    try {
      page.on("response", (resp: any) => {
        try {
          const status = Number(resp.status?.() ?? 0)
          if (status >= 400 && this.failedResponses.length < MAX_FAILED_RESPONSES) {
            this.failedResponses.push({
              url:    String(resp.url?.()              ?? "").slice(0, MAX_URL_LEN),
              method: String(resp.request?.()?.method?.() ?? "GET"),
              status,
            })
          }
        } catch {}
      })
    } catch {}
  }

  /** Buffer positions at the start of a step — call before runOneStep. */
  offsets(): EvidenceOffsets {
    return {
      c: this.consoleLogs.length,
      e: this.pageErrors.length,
      r: this.failedRequests.length,
      s: this.failedResponses.length,
    }
  }

  /**
   * Build the per-step evidence slice: duration ms + any events that fired
   * between `before` and now (events attributed to this step only).
   * Only non-empty arrays are included so evidence JSON stays compact.
   */
  stepEvidence(before: EvidenceOffsets, startMs: number): StepEvidenceSlice {
    const out: StepEvidenceSlice = { durationMs: Date.now() - startMs }
    const c = this.consoleLogs.slice(before.c)
    const e = this.pageErrors.slice(before.e)
    const r = this.failedRequests.slice(before.r)
    const s = this.failedResponses.slice(before.s)
    if (c.length) out.consoleLogs     = c
    if (e.length) out.pageErrors      = e
    if (r.length) out.failedRequests  = r
    if (s.length) out.failedResponses = s
    return out
  }

  /** All events collected for the whole walk. */
  summary(): WalkEvidenceSummary {
    return {
      consoleLogs:     [...this.consoleLogs],
      pageErrors:      [...this.pageErrors],
      failedRequests:  [...this.failedRequests],
      failedResponses: [...this.failedResponses],
    }
  }

  /** True when at least one event was captured (used to omit empty evidence from summary). */
  hasEvidence(): boolean {
    return this.consoleLogs.length > 0 || this.pageErrors.length > 0
      || this.failedRequests.length > 0 || this.failedResponses.length > 0
  }
}
