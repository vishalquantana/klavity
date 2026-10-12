// Per-request phase timer. `mark(name)` closes the phase that started at the previous mark (or at creation), so a handler
// can see WHERE a request spends its time (auth / parse / uploads / db / …) instead of one opaque total. Used by
// POST /api/feedback: the widget submit does ~20 sequential remote calls, and on a remote DB/object store each costs
// 0.4–1.5s, so the per-phase split is what shows which step to attack next.
//
// Output: a `Server-Timing` header value (visible in DevTools → Network → Timing) and a one-line log summary.
export type PhaseTimer = {
  mark(name: string): void
  /** Total ms since creation (not just the sum of marked phases). */
  total(): number
  phases(): Array<{ name: string; ms: number }>
  /** `auth;dur=12.3, uploads;dur=1500.0, total;dur=1530.2` — names are sanitised to header tokens. */
  header(): string
  /** `auth=12ms uploads=1500ms total=1530ms` */
  summary(): string
}

export function phaseTimer(now: () => number = () => performance.now()): PhaseTimer {
  const t0 = now()
  let last = t0
  const list: Array<{ name: string; ms: number }> = []
  const token = (s: string) => s.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 32) || "phase"
  return {
    mark(name) {
      const n = now()
      // The same phase name can be marked more than once (a loop, a retry) — accumulate instead of duplicating.
      const prev = list.find((p) => p.name === name)
      if (prev) prev.ms += n - last
      else list.push({ name, ms: n - last })
      last = n
    },
    total: () => now() - t0,
    phases: () => list.map((p) => ({ name: p.name, ms: p.ms })),
    header() {
      const parts = list.map((p) => `${token(p.name)};dur=${p.ms.toFixed(1)}`)
      parts.push(`total;dur=${(now() - t0).toFixed(1)}`)
      return parts.join(", ")
    },
    summary() {
      const parts = list.map((p) => `${token(p.name)}=${Math.round(p.ms)}ms`)
      parts.push(`total=${Math.round(now() - t0)}ms`)
      return parts.join(" ")
    },
  }
}
