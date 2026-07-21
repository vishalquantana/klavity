// KLAVITYKLA-275 regression tests for the draft-review ("Re-verify") UI in public/trails.html.
//
// trails.html ships its logic as inline JS and the repo has no DOM test environment, so these
// tests do two things: (1) behaviourally exercise the small pure status helpers by extracting
// their real source out of the shipped file and evaluating it, and (2) contract-assert the
// structural fixes (cancellation token, pending-edit settle, mid-walk control lock, serialized
// reorder) that a DOM-less runner cannot drive directly.
import { test, expect } from "bun:test"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const HTML = fs.readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "trails.html"),
  "utf8",
)

/** Pull a `function name(...){...}` block out of the inline script by brace matching. */
function extractFn(src: string, name: string): string {
  const start = src.indexOf("function " + name + "(")
  if (start < 0) throw new Error("function not found in trails.html: " + name)
  let depth = 0
  let i = src.indexOf("{", start)
  const bodyStart = i
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++
    else if (src[i] === "}") {
      depth--
      if (depth === 0) return src.slice(start, i + 1)
    }
  }
  throw new Error("unbalanced braces extracting " + name + " (from " + bodyStart + ")")
}

const statusHelpers = new Function(
  extractFn(HTML, "drIsTerminal") +
    "\n" +
    extractFn(HTML, "drIsPaused") +
    "\nreturn { drIsTerminal: drIsTerminal, drIsPaused: drIsPaused }",
)() as { drIsTerminal: (s: unknown) => boolean; drIsPaused: (s: unknown) => boolean }

// ── (1) auth wall-pause is not a verdict ──────────────────────────────────────

test("drIsTerminal treats only real verdicts as the end of the Re-verify poll", () => {
  for (const v of ["green", "amber", "red"]) expect(statusHelpers.drIsTerminal(v)).toBe(true)
  // The bug: the poll exited on `status !== "running"`, so these ended it too.
  for (const v of ["running", "paused", "needs_auth"]) expect(statusHelpers.drIsTerminal(v)).toBe(false)
  for (const v of ["", null, undefined, "bogus"]) expect(statusHelpers.drIsTerminal(v)).toBe(false)
})

test("drIsPaused recognises both wall-pause states (auth gate + secret prompt)", () => {
  expect(statusHelpers.drIsPaused("needs_auth")).toBe(true)
  expect(statusHelpers.drIsPaused("paused")).toBe(true)
  for (const v of ["running", "green", "amber", "red", null, undefined]) {
    expect(statusHelpers.drIsPaused(v)).toBe(false)
  }
})

test("every Walk.status in trails-types is classified as terminal, paused, or running", () => {
  const types = fs.readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "trails-types.ts"),
    "utf8",
  )
  // sanity: the union the poll must cover really is what we think it is
  expect(types).toContain('status: "running" | "paused" | "needs_auth" | Verdict')
  for (const s of ["running", "paused", "needs_auth", "green", "amber", "red"]) {
    const classified =
      statusHelpers.drIsTerminal(s) || statusHelpers.drIsPaused(s) || s === "running"
    expect(classified).toBe(true)
  }
})

/** The body of the `$("drReverify").onclick` handler (the Re-verify poll). */
function reverifyHandler(): string {
  const start = HTML.indexOf('$("drReverify").onclick')
  expect(start).toBeGreaterThan(-1)
  const end = HTML.indexOf("function drVerifyDone", start)
  expect(end).toBeGreaterThan(start)
  return HTML.slice(start, end)
}

test("the Re-verify poll no longer exits on the naive status !== running check", () => {
  const poll = reverifyHandler()
  // NOTE: runTrail's dashboard poll still uses this check by design — it only triggers a refresh,
  // it does not report a verdict — so the assertion is scoped to the Re-verify handler.
  expect(poll).not.toContain('prog.status !== "running"')
  expect(poll).toContain("drIsTerminal(prog.status)")
  expect(poll).toContain("drIsPaused(prog.status)")
})

// ── (2) cancellation token ────────────────────────────────────────────────────

test("Re-verify poll carries a generation token that closing the modal invalidates", () => {
  expect(HTML).toContain("var drGen = 0")
  expect(HTML).toContain("var myGen = drGen")
  // both open and close bump the generation so an orphaned loop abandons itself
  const close = extractFn(HTML, "closeDraftReview")
  expect(close).toContain("drGen++")
  const open = extractFn(HTML, "openDraftReview")
  expect(open).toContain("drGen++")
  // the poll body checks the token after each await before touching the DOM
  expect(HTML).toContain("if (drGen !== myGen) return")
  // and drVerifyDone refuses to re-enable a different trail's modal
  expect(extractFn(HTML, "drVerifyDone")).toContain("if (gen !== undefined && gen !== drGen) return")
})

// ── (3) pending inline edit settles before a move re-renders ──────────────────

test("a move-arrow click awaits the in-flight textarea PATCH before re-rendering", () => {
  expect(HTML).toContain("var drPendingEdit = null")
  expect(HTML).toContain("drPendingEdit = drSaveStep(")
  const moveNow = extractFn(HTML, "drMoveStepNow")
  expect(moveNow).toContain("await drSettlePendingEdit()")
  // the settle must happen BEFORE the swap + re-render, not after
  expect(moveNow.indexOf("drSettlePendingEdit")).toBeLessThan(moveNow.indexOf("renderDrSteps"))
})

test("drSettlePendingEdit is always awaitable even with no edit in flight", async () => {
  const settle = new Function(
    "var drPendingEdit = null;\n" +
      extractFn(HTML, "drSettlePendingEdit") +
      "\nreturn drSettlePendingEdit",
  )() as () => Promise<unknown>
  expect(await settle()).toBeUndefined()
})

// ── (4) reorder + delete locked during a Re-verify walk ───────────────────────

test("reorder and delete are inert while a Re-verify walk is running", () => {
  expect(extractFn(HTML, "drStepControlsLocked")).toContain("return drVerifying")
  // starting a walk locks the controls; finishing unlocks them
  expect(HTML).toContain("drSetStepControlsDisabled(true)")
  expect(extractFn(HTML, "drVerifyDone")).toContain("drSetStepControlsDisabled(false)")
  // re-renders during a walk keep the buttons disabled
  expect(HTML).toContain("drStepControlsLocked()")
  expect(HTML).toContain("|| drStepControlsLocked()")
  // and the handlers themselves refuse to act
  expect(extractFn(HTML, "drMoveStep")).toContain("if (drStepControlsLocked()) return")
  expect(HTML).toContain("if (drStepControlsLocked()) return; drDeleteStep(")
})

test("drSetStepControlsDisabled restores edge-disabled state rather than enabling everything", () => {
  const fn = extractFn(HTML, "drSetStepControlsDisabled")
  expect(fn).toContain('b.dataset.edge === "1"')
  // render must therefore stamp the edge/dir metadata the restore path reads
  expect(HTML).toContain('up.dataset.dir = "-1"')
  expect(HTML).toContain('down.dataset.dir = "1"')
  expect(HTML).toContain("up.dataset.edge")
  expect(HTML).toContain("down.dataset.edge")
})

// ── (5) serialized reorder POSTs ──────────────────────────────────────────────

test("rapid move clicks queue instead of racing overlapping reorder POSTs", () => {
  expect(HTML).toContain("var drReorderChain = Promise.resolve()")
  const move = extractFn(HTML, "drMoveStep")
  expect(move).toContain("drReorderChain = drReorderChain.then(")
  // the actual work lives in the queued function, not the click handler
  expect(move).toContain("drMoveStepNow(i, dir)")
  expect(extractFn(HTML, "openDraftReview")).toContain("drReorderChain = Promise.resolve()")
})

test("the reorder chain really serializes overlapping calls in order", async () => {
  // Exercise the queueing shape used by drMoveStep with a stub worker.
  let chain: Promise<unknown> = Promise.resolve()
  const order: string[] = []
  let inFlight = 0
  let maxInFlight = 0
  const work = async (label: string, ms: number) => {
    inFlight++
    maxInFlight = Math.max(maxInFlight, inFlight)
    await new Promise((r) => setTimeout(r, ms))
    order.push(label)
    inFlight--
  }
  const enqueue = (label: string, ms: number) => {
    chain = chain.then(() => work(label, ms))
    return chain
  }
  enqueue("a", 30)
  enqueue("b", 5)
  await enqueue("c", 1)
  expect(maxInFlight).toBe(1) // never overlapping
  expect(order).toEqual(["a", "b", "c"]) // last-to-finish can't win
})
