// KLAVITYKLA-271 (JTBD 4.7): make CI / guarded-flow run answers actionable.
// A failing (red/amber) run row in the Walks list must offer in-place actions:
//   • "Re-run"  — re-trigger the same flow (POST /api/trails/:trailId/walk via runTrail)
//   • "Finding" — jump to the review-queue card the run raised (whose File button opens a ticket)
// and each queue card must carry a stable DOM id so the jump can land on it.
//
// The dashboard renderer is one giant function, so — following the repo's dashboard-test
// convention — we assert on the shipped source markers and extract the pure jumpToFinding
// helper to exercise the real code path (scroll + flash + graceful no-op) in a fake DOM.

import { test, expect } from "bun:test"

const HTML = await Bun.file(import.meta.dir + "/public/dashboard.html").text()

function extractFn(src: string, startSig: string): string {
  const i = src.indexOf(startSig)
  if (i < 0) throw new Error("source not found: " + startSig)
  let j = i
  while (src[j] !== "{") j++
  let depth = 0
  for (; j < src.length; j++) {
    if (src[j] === "{") depth++
    else if (src[j] === "}") { depth--; if (depth === 0) return src.slice(i, j + 1) }
  }
  throw new Error("unbalanced braces from: " + startSig)
}

// ── 1 · Failing run answers render the two new per-answer actions ─────────────
test("walk row emits a Re-run action gated on a failing verdict", () => {
  expect(HTML).toContain('data-rerun-trail="')
  // gated to red|amber (a green/skipped/running run must not offer re-run inline)
  expect(HTML).toMatch(/\(v==="red"\|\|v==="amber"\)&&w\.trailId\?'<button class="replay-btn" data-rerun-trail=/)
})

test("walk row emits a Finding jump action only when a queued finding exists", () => {
  expect(HTML).toContain('data-jump-finding="')
  expect(HTML).toMatch(/\(v==="red"\|\|v==="amber"\)&&queuedFindingRuns\[w\.id\]\?'<button class="replay-btn" data-jump-finding=/)
})

test("the run→finding map is built from the review queue", () => {
  expect(HTML).toContain("var queuedFindingRuns={}")
  expect(HTML).toContain("queuedFindingRuns[f.runId]=f.id")
})

// ── 2 · Handlers are wired (no dead buttons) ──────────────────────────────────
test("Re-run buttons are wired to runTrail and Finding buttons to jumpToFinding", () => {
  expect(HTML).toContain('wEl.querySelectorAll("button[data-rerun-trail]")')
  expect(HTML).toContain('runTrail(btn.getAttribute("data-rerun-trail"),btn,row)')
  expect(HTML).toContain('wEl.querySelectorAll("button[data-jump-finding]")')
  expect(HTML).toContain('jumpToFinding(btn.getAttribute("data-jump-finding"))')
})

// ── 3 · Queue cards carry a stable id the jump can target ─────────────────────
test("review-queue cards get a stable finding- id", () => {
  expect(HTML).toContain('card.id="finding-"+f.id')
})

// ── 4 · jumpToFinding exercises the real code path ────────────────────────────
const jumpSrc = extractFn(HTML, "function jumpToFinding(")

function makeEl() {
  const el: any = {
    _classes: new Set<string>(),
    offsetWidth: 0,
    scrolled: false as boolean | string,
    scrollIntoView(opts?: any) { this.scrolled = opts ? "smooth" : "plain" },
    classList: {
      add(c: string) { el._classes.add(c) },
      remove(c: string) { el._classes.delete(c) },
      contains(c: string) { return el._classes.has(c) },
    },
  }
  return el
}

function runJump(present: boolean) {
  const target = present ? makeEl() : null
  const doc = { getElementById: (id: string) => (present && id === "finding-abc" ? target : null) }
  const timers: Array<() => void> = []
  const fn = new Function(
    "document", "setTimeout",
    `return (${jumpSrc})`,
  )(doc, (cb: () => void) => { timers.push(cb) })
  const ret = fn("abc")
  return { ret, target, flush: () => timers.forEach((t) => t()) }
}

test("jumpToFinding scrolls to and flashes the matching card", () => {
  const { ret, target } = runJump(true)
  expect(ret).toBe(true)
  expect(target.scrolled).toBe("smooth")
  expect(target.classList.contains("find-flash")).toBe(true)
})

test("jumpToFinding removes the flash class after the timeout", () => {
  const { target, flush } = runJump(true)
  expect(target.classList.contains("find-flash")).toBe(true)
  flush()
  expect(target.classList.contains("find-flash")).toBe(false)
})

test("jumpToFinding is a safe no-op when the finding is no longer queued", () => {
  const { ret } = runJump(false) // finding already filed/dismissed — card gone
  expect(ret).toBe(false)
})
