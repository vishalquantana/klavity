# AutoSim kref snapshot + text-first authoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the raw-HTML model payload in AutoSim authoring + Tier-2 vision reheal with a compact ref-annotated element tree (−64% cost, valid selectors), and add default-OFF text-first authoring with screenshot escalation (−86–93%) plus an A/B harness.

**Architecture:** New deep module `lib/trails-snapshot.ts` owns page→snapshot serialization and kref→stable-selector conversion. `trails-author.ts` and `trails-runner.ts` (Tier-2) swap their model payloads to it; both persistence points convert ephemeral `[data-kref="eN"]` selectors to stable CSS before anything is stored. Text-first mode gates the screenshot per-iteration on the miss counter.

**Tech Stack:** Bun + TypeScript, Playwright (chromium), bun:test (fixture-HTML e2e pattern like `lib/trails-runner.e2e.test.ts`), OpenRouter via existing adapters.

**Spec:** `docs/superpowers/specs/2026-07-04-autosim-kref-snapshot-design.md`

## Global Constraints

- Work in this worktree (`klav-snap-wt-autosim-cost-bench`, branch `feat/autosim-cost-bench`); commit per task; NEVER touch master, versions, CHANGELOG, PRD version lines (orchestrator owns them).
- **Invariant: a `data-kref` selector must never be persisted** (trajectory `resolvedSelector`, `locator_cache.resolved_selector`, heal `toSelector` evidence, history lines). Refs renumber per capture and vanish on reload.
- Untrusted-content fencing (`<<<…>>>`) and groundQuote/domExcerpt evidence formats are unchanged.
- All page ops in authoring stay bounded (existing `bounded()` helper); no new unbounded awaits.
- Run tests from `prototype/`: `bun test <file>` per task; full `bun test` at the end (5 known env/load flakes: `server.trails-author.route.test.ts` needs no OPENROUTER key; `lib/trails-runner.e2e.test.ts` can flake under full-suite load — both pass in isolation).

---

### Task 1: `lib/trails-snapshot.ts` — serializer + stable-selector conversion

**Files:**
- Create: `prototype/lib/trails-snapshot.ts`
- Test: `prototype/lib/trails-snapshot.e2e.test.ts`

**Interfaces:**
- Produces: `captureKrefSnapshot(page: Page, cap?: number): Promise<string>`; `stableSelectorFor(loc: Locator): Promise<string | null>`; `isKrefSelector(s: string | null | undefined): boolean`; `KREF_SNAPSHOT_CAP = 24_000`.

- [ ] **Step 1: Write the failing tests**

```typescript
// prototype/lib/trails-snapshot.e2e.test.ts
// Serializer e2e on a real chromium page (same pattern as trails-runner.e2e.test.ts).
import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { chromium, type Browser, type Page } from "playwright"
import { captureKrefSnapshot, stableSelectorFor, isKrefSelector, KREF_SNAPSHOT_CAP } from "./trails-snapshot"

const FIXTURE = `<!doctype html><html><head><title>t</title>
<style>.hidden{display:none}</style><script>window.__x=1</script></head><body>
  <h1>Welcome to Acme</h1>
  <p>Short intro paragraph for the digest.</p>
  <nav>
    <a href="/pricing">Pricing</a>
    <a href="/hidden" class="hidden">Hidden link</a>
  </nav>
  <form>
    <label for="em">Email</label>
    <input id="em" type="email" placeholder="you@example.com" />
    <input type="password" name="pw" aria-label="Password" />
    <button data-testid="submit-btn" disabled>Sign in</button>
    <button>No stable handle</button>
  </form>
</body></html>`

let browser: Browser, page: Page
beforeAll(async () => {
  browser = await chromium.launch()
  page = await (await browser.newContext()).newPage()
  await page.setContent(FIXTURE)
})
afterAll(async () => { await browser.close() })

describe("captureKrefSnapshot", () => {
  test("emits refs for interactive elements and stamps matching data-kref attrs", async () => {
    const snap = await captureKrefSnapshot(page)
    // every [ref=eN] line resolves to exactly one element via [data-kref="eN"]
    const refs = [...snap.matchAll(/\[ref=(e\d+)\]/g)].map((m) => m[1])
    expect(refs.length).toBeGreaterThanOrEqual(5) // 1 link + 2 inputs + 2 buttons
    for (const r of refs) expect(await page.locator(`[data-kref="${r}"]`).count()).toBe(1)
    // refs are unique
    expect(new Set(refs).size).toBe(refs.length)
  })
  test("includes roles, accessible names, disabled state; excludes hidden/script/style", async () => {
    const snap = await captureKrefSnapshot(page)
    expect(snap).toContain(`link "Pricing"`)
    expect(snap).toContain(`textbox "you@example.com"`)
    expect(snap).toContain(`textbox "Password"`)
    expect(snap).toMatch(/button "Sign in" \{disabled\} \[ref=e\d+\]/)
    expect(snap).not.toContain("Hidden link")
    expect(snap).not.toContain("window.__x")
    expect(snap).not.toContain(".hidden{")
  })
  test("structural text (headings, labels, short paragraphs) has NO refs", async () => {
    const snap = await captureKrefSnapshot(page)
    const h1line = snap.split("\n").find((l) => l.includes("Welcome to Acme"))!
    expect(h1line).toBeDefined()
    expect(h1line).not.toContain("[ref=")
    expect(snap).toContain("Short intro paragraph")
  })
  test("re-capture renumbers cleanly (no duplicate stamps)", async () => {
    await captureKrefSnapshot(page)
    const snap2 = await captureKrefSnapshot(page)
    const refs = [...snap2.matchAll(/\[ref=(e\d+)\]/g)].map((m) => m[1])
    for (const r of refs) expect(await page.locator(`[data-kref="${r}"]`).count()).toBe(1)
  })
  test("caps output with a truncation marker", async () => {
    const big = `<body>${Array.from({ length: 3000 }, (_, i) => `<a href="/l${i}">Link number ${i} with some padding text</a>`).join("")}</body>`
    const p2 = await (await browser.newContext()).newPage()
    await p2.setContent(big)
    const snap = await captureKrefSnapshot(p2, 5_000)
    expect(snap.length).toBeLessThanOrEqual(5_000 + 40)
    expect(snap).toContain("[snapshot truncated]")
    await p2.close()
    expect(KREF_SNAPSHOT_CAP).toBe(24_000)
  })
})

describe("stableSelectorFor", () => {
  test("prefers #id, then data-testid, then aria-label; null when nothing stable", async () => {
    await captureKrefSnapshot(page)
    expect(await stableSelectorFor(page.locator("#em"))).toBe("#em")
    expect(await stableSelectorFor(page.locator('[data-testid="submit-btn"]'))).toBe('[data-testid="submit-btn"]')
    expect(await stableSelectorFor(page.locator('input[name="pw"]'))).toBe('input[aria-label="Password"]')
    expect(await stableSelectorFor(page.locator("form button").nth(1))).toBeNull()
  })
})

describe("isKrefSelector", () => {
  test("matches exactly the stamped form", () => {
    expect(isKrefSelector('[data-kref="e12"]')).toBe(true)
    expect(isKrefSelector("#em")).toBe(false)
    expect(isKrefSelector('[data-kref="e12"] > span')).toBe(false)
    expect(isKrefSelector(null)).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd prototype && bun test lib/trails-snapshot.e2e.test.ts`
Expected: FAIL — `Cannot find module './trails-snapshot'`

- [ ] **Step 3: Implement `lib/trails-snapshot.ts`**

```typescript
// Compact model-readable page snapshot for AutoSims (bench: prototype/docs/bench-autosim-cost.md).
// One line per VISIBLE semantic element: `role "name" {disabled?} [ref=eN]`, indented by depth.
// Interactive elements are stamped with data-kref="eN" so every [ref=eN] the model cites is a
// REAL unique CSS selector — [data-kref="eN"] — for the current page state ONLY.
//
// INVARIANT (spec §1): kref selectors are EPHEMERAL — renumbered every capture, gone on reload.
// Persistence points (trajectory resolvedSelector, locator_cache, heal toSelector) must convert
// via stableSelectorFor() (fallback: fingerprint domPath) before storing anything.
import type { Page, Locator } from "playwright"

export const KREF_SNAPSHOT_CAP = 24_000
const TRUNCATION_MARKER = "\n…[snapshot truncated]"

/** True iff s is exactly one stamped kref selector, e.g. `[data-kref="e12"]`. */
export function isKrefSelector(s: string | null | undefined): boolean {
  return typeof s === "string" && /^\[data-kref="e\d+"\]$/.test(s.trim())
}

/**
 * Serialize the page to a compact ref-annotated element tree and stamp data-kref attrs.
 * Deterministic single page.evaluate; previous stamps are cleared first so re-captures
 * renumber cleanly. Output capped at `cap` chars with an explicit truncation marker.
 */
export async function captureKrefSnapshot(page: Page, cap = KREF_SNAPSHOT_CAP): Promise<string> {
  const out = await page.evaluate(() => {
    // Runs in page context: everything must be inlined.
    document.querySelectorAll("[data-kref]").forEach((el) => el.removeAttribute("data-kref"))
    let n = 0
    const lines: string[] = []
    const SKIP = new Set(["script", "style", "noscript", "svg", "template", "iframe"])
    const INTERACTIVE = new Set(["a", "button", "input", "select", "textarea", "summary", "option"])
    const TEXTUAL = new Set(["label", "p", "li", "td", "th", "figcaption", "blockquote"])
    const visible = (el: Element): boolean => {
      const r = (el as HTMLElement).getBoundingClientRect?.()
      if (!r || (r.width === 0 && r.height === 0)) return false
      const s = getComputedStyle(el as HTMLElement)
      return s.display !== "none" && s.visibility !== "hidden"
    }
    const roleOf = (el: Element): string | null => {
      const explicit = el.getAttribute("role")
      if (explicit) return explicit
      const t = el.tagName.toLowerCase()
      if (t === "a" && el.hasAttribute("href")) return "link"
      if (t === "button" || (t === "input" && ["button", "submit"].includes((el as HTMLInputElement).type))) return "button"
      if (t === "input") {
        const ty = (el as HTMLInputElement).type
        return ty === "checkbox" ? "checkbox" : ty === "radio" ? "radio" : "textbox"
      }
      if (t === "select") return "combobox"
      if (t === "textarea") return "textbox"
      if (t === "summary") return "button"
      if (t === "option") return "option"
      if (/^h[1-6]$/.test(t)) return "heading"
      if (t === "img" && el.getAttribute("alt")) return "img"
      return null
    }
    const nameOf = (el: Element): string => {
      const cand =
        el.getAttribute("aria-label") || el.getAttribute("placeholder") ||
        (el as HTMLImageElement).alt || (el.textContent || "").trim() ||
        el.getAttribute("name") || el.getAttribute("title") || (el as HTMLInputElement).value || ""
      return cand.replace(/\s+/g, " ").slice(0, 80)
    }
    const walk = (el: Element, depth: number) => {
      for (const child of Array.from(el.children)) {
        const t = child.tagName.toLowerCase()
        if (SKIP.has(t)) continue
        let emitted = false
        if (visible(child)) {
          const role = roleOf(child)
          const indent = "  ".repeat(Math.min(depth, 6))
          if (role) {
            let line = `${indent}${role} "${nameOf(child)}"`
            if ((child as HTMLInputElement).disabled) line += " {disabled}"
            if (INTERACTIVE.has(t) || child.getAttribute("role")) {
              const ref = `e${++n}`
              child.setAttribute("data-kref", ref)
              line += ` [ref=${ref}]`
            }
            lines.push(line)
            emitted = true
          } else if (TEXTUAL.has(t)) {
            // Structural text digest (NO ref): only direct text, only when it has no element
            // children carrying the same text — keeps asserts groundable without ballooning.
            const own = (child.textContent || "").trim().replace(/\s+/g, " ")
            if (own && own.length >= 3 && child.children.length === 0) {
              lines.push(`${indent}text "${own.slice(0, 80)}"`)
              emitted = true
            }
          }
        }
        walk(child, emitted ? depth + 1 : depth)
      }
    }
    walk(document.body, 0)
    return lines.join("\n")
  })
  if (out.length > cap) return out.slice(0, cap - TRUNCATION_MARKER.length) + TRUNCATION_MARKER
  return out
}

/**
 * Stable CSS for an element the model addressed by kref (or any locator): #id → [data-testid]
 * → tag[aria-label]. Returns null when no stable handle exists — callers fall back to the
 * step fingerprint's domPath. Mirrors the runner's persistableSelector ladder.
 */
export async function stableSelectorFor(loc: Locator): Promise<string | null> {
  try {
    return await loc.first().evaluate((el: Element) => {
      const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
      if (el.id) return "#" + CSS.escape(el.id)
      const tid = el.getAttribute("data-testid")
      if (tid) return `[data-testid="${esc(tid)}"]`
      const al = el.getAttribute("aria-label")
      if (al) return `${el.tagName.toLowerCase()}[aria-label="${esc(al)}"]`
      return null
    })
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd prototype && bun test lib/trails-snapshot.e2e.test.ts`
Expected: PASS (all describe blocks)

- [ ] **Step 5: Commit**

```bash
git add prototype/lib/trails-snapshot.ts prototype/lib/trails-snapshot.e2e.test.ts
git commit -m "feat(autosims): trails-snapshot — kref element tree serializer + stable-selector conversion"
```

---

### Task 2: Authoring adopts the kref snapshot

**Files:**
- Modify: `prototype/lib/trails-author-model.ts` (AUTHOR_SYS lines 26–37, buildAuthorMessages line 46)
- Modify: `prototype/lib/trails-author.ts` (imports; initial-nav lines 89–92; loop lines 96–97; persistence lines 135–143)
- Test: `prototype/lib/trails-author.kref.e2e.test.ts` (new)

**Interfaces:**
- Consumes (Task 1): `captureKrefSnapshot(page)`, `stableSelectorFor(loc)`, `isKrefSelector(s)`.
- Produces: `AuthorStepInput.domSnapshot` now carries the kref snapshot (field name unchanged); prompt label `ELEMENT SNAPSHOT`. Trajectory/history never contain `data-kref`.

- [ ] **Step 1: Write the failing test**

```typescript
// prototype/lib/trails-author.kref.e2e.test.ts
// Author loop with a scripted mock model that answers with kref selectors, on a real page.
// Verifies: kref actions execute; NOTHING persisted (trajectory, history-visible log) is a kref.
import { describe, test, expect, beforeAll, afterAll } from "bun:test"
import { authorTrail } from "./trails-author"
import type { AuthorModel, AuthorStepInput } from "./trails-author-model"
import { AUTHOR_SYS, buildAuthorMessages } from "./trails-author-model"
import { initDb, db } from "./db"
import { createProject } from "./projects" // adjust to the repo's actual project-seed helper if different (see existing trails tests for the pattern)
import { getTrail } from "./trails"

// Serve a small two-step fixture over data: — authorTrail needs a URL it can page.goto().
const FIXTURE_URL =
  "data:text/html," +
  encodeURIComponent(
    `<html><body><h1>Fixture home</h1>
     <a id="go" href="#done" onclick="document.getElementById('flag').textContent='clicked'">Go</a>
     <p id="flag">idle</p></body></html>`,
  )

let projectId: string
beforeAll(async () => {
  await initDb(":memory:") // follow the exact init pattern used by lib/trails-runner.e2e.test.ts
  projectId = await createProject("kref-author-test")
})

describe("authoring with kref selectors", () => {
  test("kref action executes; trajectory + step log persist stable selectors only", async () => {
    const seen: AuthorStepInput[] = []
    // Scripted model: step 1 clicks the link via its kref (parsed out of the snapshot), then done.
    const model: AuthorModel = async (input) => {
      seen.push(input)
      if (seen.length === 1) {
        const ref = input.domSnapshot.match(/link "Go" \[ref=(e\d+)\]/)?.[1]
        expect(ref).toBeDefined()
        return { action: { op: "click", selector: `[data-kref="${ref}"]`, value: null, url: null, checkpoint: null, rationale: "click Go" }, costUsd: 0 }
      }
      return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
    }
    const out = await authorTrail(projectId, { name: "kref t", objective: "click Go", baseUrl: FIXTURE_URL }, { model })
    expect(out.status).toBe("crystallized")
    // 1) model got the kref snapshot, not raw HTML
    expect(seen[0].domSnapshot).toContain('[ref=')
    expect(seen[0].domSnapshot).not.toContain("<html")
    // 2) NOTHING persisted is a kref: crystallized trail steps carry stable selectors
    const trail = await getTrail(projectId, out.trailId!)
    const json = JSON.stringify(trail)
    expect(json).not.toContain("data-kref")
    expect(json).toContain("#go") // stableSelectorFor picked the id
    // 3) step log (history-visible) shows the stable form
    expect(JSON.stringify(out.steps)).not.toContain("data-kref")
  })

  test("AUTHOR_SYS teaches kref + bans Playwright pseudo-classes; label is ELEMENT SNAPSHOT", () => {
    expect(AUTHOR_SYS).toContain('data-kref')
    expect(AUTHOR_SYS.toLowerCase()).toContain("pseudo-class")
    const msgs = buildAuthorMessages({ objective: "o", pageUrl: "u", screenshotB64: "x", mediaType: "image/jpeg", domSnapshot: "snap", history: [], credFields: [] })
    expect(JSON.stringify(msgs)).toContain("ELEMENT SNAPSHOT (untrusted)")
  })
})

afterAll(async () => { /* in-memory db, nothing to clean */ })
```

NOTE for the implementer: mirror the exact db-init + project-seed helpers used at the top of `lib/trails-runner.e2e.test.ts` (the names above are indicative — copy that file's proven setup verbatim, including any `process.env` toggles it sets). Same for `getTrail`: use whatever accessor that test file uses to read back crystallized steps (`getTrailWithSteps`, `listTrailSteps`, …) — assert on ITS serialized output.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test lib/trails-author.kref.e2e.test.ts`
Expected: FAIL — snapshot still raw HTML (`<html` present) and/or AUTHOR_SYS assertions fail.

- [ ] **Step 3: Update `trails-author-model.ts`**

Replace the selector rule line in `AUTHOR_SYS` (line 31):

```typescript
// OLD:
// - click/type/select/assert require "selector": a CSS selector derived from the DOM snapshot that matches EXACTLY ONE element. Prefer #id, [data-testid], stable attributes; avoid brittle positional selectors.
// NEW:
- click/type/select/assert require "selector": PREFER the target's [ref=eN] marker from the ELEMENT SNAPSHOT, returned as exactly [data-kref="eN"] (e.g. the element marked [ref=e12] → "[data-kref=\\"e12\\"]"). Otherwise a plain CSS selector using stable attributes (#id, [data-testid], [aria-label=...]) that matches EXACTLY ONE element. NEVER use Playwright pseudo-classes (:has-text, :visible, :text) — plain CSS only.
```

And the first sentence (line 26): `the current page's screenshot and DOM snapshot` → `the current page's screenshot and ELEMENT SNAPSHOT (a compact accessibility-style tree)`.

In `buildAuthorMessages` (line 46): `DOM SNAPSHOT (untrusted):` → `ELEMENT SNAPSHOT (untrusted):`.

- [ ] **Step 4: Update `trails-author.ts`**

```typescript
// imports (top):
import { captureKrefSnapshot, stableSelectorFor, isKrefSelector } from "./trails-snapshot"
// DOM_CAP constant: DELETE (line 21) — the snapshot module owns its cap.

// Initial-nav step (lines 89–92) becomes:
{
  const initSnap = await bounded(captureKrefSnapshot(page), 15_000, "snapshot capture")
  traj.push({ action: "navigate", actionValue: req.baseUrl, url: page.url(), domHash: sha256hex(initSnap) })
}

// Loop capture (line 97) becomes:
const dom = await bounded(captureKrefSnapshot(page), 15_000, "snapshot capture")

// Persistence (inside the `else` branch, after the action executed — lines 135–140). The executed
// locator `loc` still points at the element (kref attr present until the next capture/navigation):
let persistSelector = a.selector!
if (isKrefSelector(a.selector)) {
  persistSelector = (await bounded(stableSelectorFor(loc), 10_000, "stable selector").catch(() => null)) ?? fp.domPath ?? a.selector!
}
traj.push({
  action: OP2ACTION[a.op], actionValue: a.op === "type" || a.op === "select" ? a.value ?? undefined : undefined,
  target: { ...fp, resolvedSelector: persistSelector },
  checkpoint: a.op === "assert" ? { description: a.checkpoint || a.rationale || "checkpoint" } : undefined,
  url: page.url(), domHash: sha256hex(dom),
})

// History + step log use the stable form too (kref refs renumber next capture — showing them
// back to the model poisons context). Replace the entry construction (line 115) + ok-history
// (line 143):
const entry: AuthorStepLog = { idx: log.length, op: a.op, selector: a.selector, value: a.value, url: page.url(), rationale: a.rationale, ok: false }
// ...after success:
entry.selector = persistSelector ?? a.selector
history.push(`${a.op}${persistSelector ? ` ${persistSelector} ("${(fp.accessibleName ?? fp.text ?? "").slice(0, 40)}")` : ""}${a.op === "navigate" ? " " + a.url : ""} — ok`)
```

Notes:
- `persistSelector` is only computed in the selector-op branch (`click/type/select/assert`); `wait`/`navigate` paths are untouched.
- Ordering: the click may navigate — capture `stableSelectorFor` result BEFORE the action for `click` ops. Concretely: move the conversion immediately after the `n !== 1` uniqueness check / fingerprint capture and before `loc.click(...)`:

```typescript
const fp = await bounded(captureFingerprint(page, a.selector!), 10_000, "fingerprint capture")
let persistSelector = a.selector!
if (isKrefSelector(a.selector)) {
  persistSelector = (await stableSelectorFor(loc).catch(() => null)) ?? fp.domPath ?? a.selector!
}
if (a.op === "click") await loc.click({ timeout: ACTION_TIMEOUT })
// ...
```

- domHash verification (spec §2): grep before changing — `grep -rn "domHash" prototype/lib/ | grep -v test` — confirm nothing recomputes a hash from live DOM at replay (crystallize stores it; cache identity is `UNIQUE(project_id, step_id)`). If anything DOES recompute at replay, stop and re-plan that point; expected: nothing does.

- [ ] **Step 5: Run the new test + existing author tests**

Run: `cd prototype && bun test lib/trails-author.kref.e2e.test.ts server.trails-author.route.test.ts lib/trails-runner.e2e.test.ts`
Expected: new test PASS; existing tests same pass/fail profile as before the change (the route test's one env-dependent failure — needs no OPENROUTER key — is pre-existing). Fix any test that asserted on `DOM SNAPSHOT` text or raw-HTML domSnapshot content.

- [ ] **Step 6: Commit**

```bash
git add prototype/lib/trails-author.ts prototype/lib/trails-author-model.ts prototype/lib/trails-author.kref.e2e.test.ts
git commit -m "feat(autosims): authoring drives on kref element snapshot; stable selectors persisted"
```

---

### Task 3: Tier-2 vision reheal adopts the kref snapshot

**Files:**
- Modify: `prototype/lib/trails-vision.ts` (VISION_SYS lines 46–51; buildVisionMessages line 59)
- Modify: `prototype/lib/trails-runner.ts` (line 26 cap const; Tier-2 capture lines 712–719; heal persistence lines 763–800)
- Test: `prototype/lib/trails-runner.e2e.test.ts` (extend — it already has a mocked-vision Tier-2 heal test to model from)

**Interfaces:**
- Consumes (Task 1): `captureKrefSnapshot`, `stableSelectorFor`, `isKrefSelector`.
- Produces: `VisionInput.domSnapshot` carries the kref snapshot; `locator_cache.resolved_selector` and `evidence.toSelector` are always stable selectors.

- [ ] **Step 1: Write the failing test (extend `lib/trails-runner.e2e.test.ts`)**

Add a test following the file's existing Tier-2 mocked-vision pattern (drifted fixture → vision heals). The mock resolver returns a kref selector parsed from `input.domSnapshot`; assertions target the persistence invariant:

```typescript
test("Tier-2 heal via kref selector persists a STABLE selector to cache + evidence", async () => {
  // Fixture: cached selector #checkout is gone; the real button is <button id="pay-now">Pay now</button>.
  // (Reuse the file's existing drift fixture + walk setup verbatim.)
  const visionMock: VisionResolver = async (input) => {
    expect(input.domSnapshot).toContain("[ref=")        // model sees the kref snapshot
    expect(input.domSnapshot).not.toContain("<html")     // not raw HTML
    const ref = input.domSnapshot.match(/button "Pay now" \[ref=(e\d+)\]/)?.[1]
    return { found: true, selector: `[data-kref="${ref}"]`, confidence: 0.95, classification: "moved", rationale: "same checkout affordance" }
  }
  const res = await walkTrail(projectId, trailId, { ...walkOpts, vision: visionMock })
  expect(res.verdict).toBe("amber")
  const cache = await getCacheForStep(projectId, stepId) // same accessor the file already uses
  expect(cache!.resolvedSelector).toBe("#pay-now")        // converted, NOT [data-kref=...]
  expect(cache!.resolvedSelector).not.toContain("data-kref")
  const steps = await listRunSteps(projectId, res.runId)  // same accessor the file already uses
  const healStep = steps.find((s: any) => s.healed)
  expect(JSON.stringify(healStep!.evidence)).not.toContain("data-kref")
})
```

(Adapt fixture/accessor names to the file's existing ones — copy its Tier-2 test wholesale and change only the mock + assertions.)

- [ ] **Step 2: Run to verify it fails**

Run: `cd prototype && bun test lib/trails-runner.e2e.test.ts`
Expected: new test FAIL — `input.domSnapshot` contains `<html` (raw HTML), and/or cache keeps the kref.

- [ ] **Step 3: Update `trails-runner.ts`**

```typescript
// imports:
import { captureKrefSnapshot, stableSelectorFor, isKrefSelector } from "./trails-snapshot"

// Tier-2 capture (lines ~712–719). KEEP `dom = page.content()` — evidence.domExcerpt (2,000 chars)
// and groundQuote grounding stay on raw DOM (human-facing contract). Only the MODEL payload changes:
dom = await page.content()
const modelDom = await captureKrefSnapshot(page)   // replaces dom.slice(0, VISION_DOM_MODEL_CAP)
// DELETE the now-unused VISION_DOM_MODEL_CAP const (line 26) — trails-snapshot owns its cap.

// Heal persistence (lines ~763+). After `ok` (uniquelyResolves + roleConsistent) and the action
// executed, convert BEFORE upsert/evidence. For `click` the element may navigate away — compute
// the stable selector BEFORE the switch(step.action) act block:
if (ok) {
  let persistSelector = decision.selector
  if (isKrefSelector(decision.selector)) {
    persistSelector = (await stableSelectorFor(loc).catch(() => null)) ?? fp?.domPath ?? decision.selector
  }
  try {
    switch (step.action) { /* ...unchanged act block... */ }
    const cacheRow = await getCacheForStep(projectId, step.id)
    const cKey = cacheRow?.cacheKey ?? (await stepCacheKey(projectId, trailId, step, persistSelector))
    await upsertLocatorCache(projectId, {
      trailId, stepId: step.id, cacheKey: cKey, resolvedSelector: persistSelector,
      fingerprint: fp ?? undefined, confidence: decision.confidence, source: "heal",
    })
    await addRunStep(projectId, {
      // ...unchanged except:
      evidence: { healed: true, fromSelector: cachedSelector, toSelector: persistSelector, /* rest unchanged */ },
    })
```

- [ ] **Step 4: Update `trails-vision.ts` prompt**

`VISION_SYS` line 49 — extend the found=true rule:

```typescript
- found=true ONLY if you can point to the SAME element the intent refers to; return its [ref=eN] marker from the snapshot as exactly [data-kref="eN"], or a robust plain-CSS selector (#id, [data-testid]). NEVER Playwright pseudo-classes (:has-text, :visible).
```

`buildVisionMessages` line 59: `DOM SNAPSHOT (untrusted):` → `ELEMENT SNAPSHOT (untrusted):`. First VISION_SYS sentence: `a DOM snapshot` → `a compact ELEMENT SNAPSHOT of the page`.

- [ ] **Step 5: Run the runner + vision suites**

Run: `cd prototype && bun test lib/trails-runner.e2e.test.ts lib/trails-vision.test.ts`
Expected: PASS (update any vision test asserting on `DOM SNAPSHOT` label text).

- [ ] **Step 6: Commit**

```bash
git add prototype/lib/trails-runner.ts prototype/lib/trails-vision.ts prototype/lib/trails-runner.e2e.test.ts
git commit -m "feat(autosims): Tier-2 vision reheal reads kref snapshot; heals persist stable selectors"
```

---

### Task 4: Text-first authoring with screenshot escalation (default OFF)

**Files:**
- Modify: `prototype/lib/trails-author-model.ts` (buildAuthorMessages lines 47–54)
- Modify: `prototype/lib/trails-author.ts` (opts + loop lines 93–101)
- Test: `prototype/lib/trails-author.textfirst.test.ts` (new; no browser needed for message-shape, one e2e for capture-skip)

**Interfaces:**
- Consumes: everything as of Task 2.
- Produces: `authorTrail` opts gains `textFirst?: boolean` (env `KLAV_AUTHOR_TEXT_FIRST=1` is the prod default source); `buildAuthorMessages` omits the image part when `screenshotB64 === ""`.

- [ ] **Step 1: Write the failing tests**

```typescript
// prototype/lib/trails-author.textfirst.test.ts
import { describe, test, expect } from "bun:test"
import { buildAuthorMessages, type AuthorModel, type AuthorStepInput } from "./trails-author-model"
import { authorTrail } from "./trails-author"
// db/project setup: copy the exact pattern from lib/trails-author.kref.e2e.test.ts (Task 2)

describe("buildAuthorMessages text-only", () => {
  const base = { objective: "o", pageUrl: "u", mediaType: "image/jpeg", domSnapshot: "s", history: [], credFields: [] }
  test("empty screenshotB64 → no image part, content is a plain string", () => {
    const msgs = buildAuthorMessages({ ...base, screenshotB64: "" })
    expect(typeof msgs[1].content).toBe("string")
    expect(JSON.stringify(msgs)).not.toContain("image_url")
  })
  test("non-empty screenshotB64 → image part present (unchanged)", () => {
    const msgs = buildAuthorMessages({ ...base, screenshotB64: "abc" })
    expect(Array.isArray(msgs[1].content)).toBe(true)
    expect(JSON.stringify(msgs)).toContain("image_url")
  })
})

describe("authorTrail textFirst escalation", () => {
  const FIXTURE_URL = "data:text/html," + encodeURIComponent(`<html><body><a id="go" href="#x">Go</a></body></html>`)
  test("happy path sends NO screenshot; after a miss the retry attaches one", async () => {
    const shots: boolean[] = []
    let call = 0
    const model: AuthorModel = async (input: AuthorStepInput) => {
      shots.push(input.screenshotB64.length > 0)
      call++
      if (call === 1) // deliberately bad selector → miss
        return { action: { op: "click", selector: "#does-not-exist", value: null, url: null, checkpoint: null, rationale: "bad" }, costUsd: 0 }
      if (call === 2) // retry (escalated): now click the real link
        return { action: { op: "click", selector: "#go", value: null, url: null, checkpoint: null, rationale: "good" }, costUsd: 0 }
      return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
    }
    const out = await authorTrail(projectId, { name: "tf", objective: "click go", baseUrl: FIXTURE_URL }, { model, textFirst: true })
    expect(out.status).toBe("crystallized")
    expect(shots[0]).toBe(false) // first call: text-only
    expect(shots[1]).toBe(true)  // after miss: screenshot attached
    expect(shots[2]).toBe(false) // miss counter reset on success → text-only again
  })
  test("flag off → screenshot on every call (current behavior)", async () => {
    const shots: boolean[] = []
    const model: AuthorModel = async (input) => {
      shots.push(input.screenshotB64.length > 0)
      return { action: { op: "done", selector: null, value: null, url: null, checkpoint: null, rationale: "done" }, costUsd: 0 }
    }
    await authorTrail(projectId, { name: "tf2", objective: "o", baseUrl: FIXTURE_URL }, { model })
    expect(shots).toEqual([true])
  })
})
```

- [ ] **Step 2: Run to verify failures**

Run: `cd prototype && bun test lib/trails-author.textfirst.test.ts`
Expected: FAIL — image part always present; `textFirst` opt unknown.

- [ ] **Step 3: Implement**

`trails-author-model.ts` — `buildAuthorMessages` (lines 47–54):

```typescript
return [
  { role: "system", content: AUTHOR_SYS },
  input.screenshotB64
    ? { role: "user", content: [
        { type: "text", text },
        { type: "image_url", image_url: { url: `data:${input.mediaType};base64,${input.screenshotB64}` } },
      ] }
    : { role: "user", content: text },
]
```

`trails-author.ts`:

```typescript
// opts type gains: textFirst?: boolean
// resolution at top of authorTrail:
const textFirst = opts.textFirst ?? process.env.KLAV_AUTHOR_TEXT_FIRST === "1"

// loop (replace line 96): capture the screenshot ONLY when it will be sent — text-first happy
// path skips the (bounded 20s) Playwright op entirely:
const includeShot = !textFirst || misses > 0
const screenshotB64 = includeShot
  ? (await bounded(page.screenshot({ type: "jpeg", quality: 60, timeout: 15_000 }), 20_000, "screenshot")).toString("base64")
  : ""
```

(`runAuthorNow` passes nothing — prod picks up the env; tests inject `textFirst` explicitly.)

- [ ] **Step 4: Run tests**

Run: `cd prototype && bun test lib/trails-author.textfirst.test.ts lib/trails-author.kref.e2e.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype/lib/trails-author.ts prototype/lib/trails-author-model.ts prototype/lib/trails-author.textfirst.test.ts
git commit -m "feat(autosims): text-first authoring with screenshot escalation behind KLAV_AUTHOR_TEXT_FIRST"
```

---

### Task 5: A/B harness + docs

**Files:**
- Create: `prototype/scripts/bench-author-ab.ts`
- Modify: `prototype/docs/bench-autosim-cost.md` (append an "A/B" section placeholder-free: the script exists; results get appended when the run happens)

**Interfaces:**
- Consumes: `authorTrail` with `textFirst` opt (Task 4), `openRouterAuthorModel`.

- [ ] **Step 1: Write the script**

```typescript
// prototype/scripts/bench-author-ab.ts
// Full authored-Trail A/B: same objective, arm A = current (screenshot every step),
// arm B = text-first + screenshot escalation. Real OpenRouter spend (~$0.05–0.15/run).
// Standalone opt-in:  bun scripts/bench-author-ab.ts
// Uses a throwaway in-memory DB so nothing lands in the real ledger/trails tables.
import { initDb } from "../lib/db"
import { authorTrail } from "../lib/trails-author"
import { openRouterAuthorModel } from "../lib/trails-author-model"

const OBJECTIVE = "Open the blog from the home page, open the most recent post, then assert the post heading is visible."
const BASE_URL = "https://klavity.in/"

if (!process.env.OPENROUTER_API_KEY) { console.error("OPENROUTER_API_KEY missing"); process.exit(1) }
await initDb(":memory:") // follow the same init used by the e2e tests; seed one project the same way
const projectId = /* seed exactly as lib/trails-author.kref.e2e.test.ts does */ ""

async function arm(name: string, textFirst: boolean) {
  const t0 = Date.now()
  const out = await authorTrail(projectId, { name: `ab-${name}`, objective: OBJECTIVE, baseUrl: BASE_URL }, { model: openRouterAuthorModel, textFirst })
  return { name, textFirst, status: out.status, verdict: out.verificationVerdict, llmCalls: out.llmCalls, costUsd: out.costUsd, steps: out.steps.length, misses: out.steps.filter((s) => !s.ok).length, secs: Math.round((Date.now() - t0) / 1000) }
}

const a = await arm("current", false)
const b = await arm("text-first", true)
console.table([a, b])
console.log(`cost delta: ${(100 * (1 - b.costUsd / Math.max(a.costUsd, 1e-9))).toFixed(1)}% cheaper`)
console.log("Append these rows to prototype/docs/bench-autosim-cost.md §A/B.")
```

(Implementer: resolve the two `initDb`/seed comments against the actual helpers used by the Task-2 test — same pattern, no new machinery. If `initDb(":memory:")` isn't the repo's signature, use the exact env/DB bootstrap the e2e tests use.)

- [ ] **Step 2: Type-check + dry-run guard**

Run: `cd prototype && bunx tsc --noEmit --skipLibCheck scripts/bench-author-ab.ts 2>/dev/null || bun build --no-bundle scripts/bench-author-ab.ts >/dev/null`
Expected: compiles. Do NOT run the live A/B inside this task (real spend, needs a green Task-1..4 stack); the session driver runs it after the suite is green.

- [ ] **Step 3: Append to `prototype/docs/bench-autosim-cost.md`**

```markdown
## Full authored-Trail A/B (scripts/bench-author-ab.ts)

Arm A = kref snapshot + screenshot every step. Arm B = KLAV_AUTHOR_TEXT_FIRST (text-first,
screenshot only on the retry after a miss). Same objective, real OpenRouter spend.
Run: `bun scripts/bench-author-ab.ts` — append the console.table rows here per run.
Decision rule: flip the default only if arm B is ≥50% cheaper AND status/verdict are not worse
across 3 runs.
```

- [ ] **Step 4: Commit**

```bash
git add prototype/scripts/bench-author-ab.ts prototype/docs/bench-autosim-cost.md
git commit -m "feat(autosims): full authored-Trail A/B harness for text-first flag"
```

---

### Task 6: Full suite, rebase, finish

- [ ] **Step 1: Full suite**

Run: `cd prototype && bun test`
Expected: same profile as branch start (1,019+ pass; the pre-existing env-dependent `server.trails-author.route.test.ts` failure and load-flaky `trails-runner.e2e` under full parallel load are known — both must PASS in isolation: `bun test server.trails-author.route.test.ts lib/trails-runner.e2e.test.ts`). Any NEW failure = fix before proceeding.

- [ ] **Step 2: Pull latest + rebase**

```bash
git fetch origin master && git rebase origin/master
cd prototype && bun test   # re-run after rebase
```

- [ ] **Step 3: Final commit if needed, then stop**

The orchestrator integrates `feat/autosim-cost-bench` and deploys automatically. Do not bump versions or touch CHANGELOG version stamps.
