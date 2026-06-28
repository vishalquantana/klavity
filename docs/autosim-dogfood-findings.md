# AutoSim Dogfood Findings — 2026-06-28

## 1. Does AutoSim run end-to-end against the live Klavity site?

**YES — for simple assert trails. Partially for multi-step interactive flows.**

Trail 1 (home heading assert): **GREEN** in ~2.8s against https://klavity.quantana.top/
- 1 step, Tier-0 cache resolution, 0 LLM calls, 0 heals
- Walk row created + finalized correctly in SQLite DB

Trail 2 (onboarding intro→form): **RED** — multi-step interactive walk fails
- Steps 0–2 GREEN (assert heading, click button, wait)
- Step 3 RED: `#email` not visible after `go(1)` onclick transition (see below)

## 2. What concretely WORKS

- **Playwright/Chromium launch**: Local installation (Chrome for Testing 145.0) works in headless mode
- **Navigation to prod site**: page.goto("https://klavity.quantana.top/") and "/onboarding" succeed
- **End-to-end pipeline**: crystallize → locator_cache seeding → walkTrail → runId → verdict persisted to DB
- **Tier-0 cache resolution**: cached selectors resolve correctly for static page elements
- **Walk DB row lifecycle**: `startWalk`, `addRunStep`, `finishWalk` all persist correctly
- **Multi-step navigation**: click steps that cause full-page navigation (href links) work correctly
- **Deadline enforcement**: 60s deadline respected, opTimeout capped at 15s per op
- **Findings dedup pipeline** (code-level): recordFinding + expectations ingest wired correctly

## 3. What BROKE or surprised

### 3a. Script authoring bug: `fixtureUrl ≠ trail.baseUrl`
When calling `walkTrail` directly (not via `runWalkNow`), you must pass `fixtureUrl` matching the trail's `baseUrl`. In the initial dogfood run, Trail 2 had `baseUrl: "/onboarding"` but `fixtureUrl: "/"` was passed — the runner navigated to the home page and tried onboarding-specific selectors, producing false RED on all steps.  
**Not an engine bug; a harness authoring trap.** The `runWalkNow` trigger avoids it (reads `trail.baseUrl` automatically). But direct `walkTrail` calls need care.

### 3b. Real product finding: Duplicate `.hero-cta` class → selector brittleness
The Klavity home page has **two** `.hero-cta` divs:
- `header.hero .hero-cta` (main hero section)
- A `div.hero-cta` at the page footer (final CTA section)

`.hero-cta .btn-indigo` matches 2 elements → `uniquelyResolves` returns false → element_gone → RED.  
AutoSim correctly surfaced this: any tool crystallizing from the hero CTA would produce an ambiguous selector that fails on every walk. **Fix: rename the footer div to `.final-cta` or similar.**

### 3c. Onboarding panel JS transition not triggered by Playwright click
After clicking `.panel.step[data-s='0'] button.btn-indigo` (the intro "Get started →" button with `onclick="go(1)"`):
- Playwright's `click()` returns GREEN (element actionable, click executed)
- But the step 1 panel remains hidden (`panel step hide`) — `go(1)` didn't update the DOM
- `#email` inside step 1 remains `display: none`, so `waitFor({ state: "visible", 5000 })` times out

Diagnosis: Playwright's headless Chromium executes the click but the `onclick="go(1)"` handler behaviour is unexpected. This may relate to how the inline `<script>` block scoping interacts with headless event dispatch (`let` scope vs `window` scope), or a CSP/JS timing issue. Manual `page.evaluate(() => go(1))` was not tested in this run due to convergence request.

**Impact**: Any AutoSim walk against a multi-step onboarding or wizard UI (where panel transitions are driven by inline JS functions) will red-out at the transition step.

### 3d. No findings queued on RED walks without vision resolver
AutoSim findings (kind: regression/visual/amber_heal) are only queued by the **Tier-2 vision path** (`runVisionTier2`). Layer C (no resolver) records `element_gone` run_steps but calls no `recordFinding`. Trail 2 walked 3 RED steps but produced **0 findings** in the findings table.  
**By design for Layer C** — but means a dogfood run without an OpenRouter/vision API key shows the right verdicts but no actionable findings queue.

### 3e. ACTION_TIMEOUT = 5000ms is tight for animated flows
The hardcoded 5-second timeout for `waitFor({ state: "visible" })` is fine for static pages but tight for CSS-animated transitions. The `networkidle` wait step helps, but any panel reveal with a CSS fade > 0ms can race with the 5s window.

## 4. Bottom line & single most important blocker

**AutoSim is usable today for static-page journey walks** — landing pages, docs, any flow where selectors uniquely resolve and no JS-driven panel transitions are needed. Trail 1 proved the pipeline green in 2.8s with zero LLM calls.

**Single most important blocker to fix first:**  
`onclick="go(N)"` panel transitions don't update DOM when Playwright fires a headless click. This blocks ALL wizard/multi-step UI walks including the entire Klavity onboarding funnel. The fix is either: (a) investigate why `let`-scoped JS onclick handlers don't execute in headless context (likely a fix in the diagnostic or a Page.addInitScript workaround), or (b) add a `page.waitForFunction` after a click step when a panel transition is expected.

A secondary (product) fix: rename the home page footer `div.hero-cta` to avoid selector collision with the hero section's `.hero-cta`.

## Artifacts

- `prototype/lib/dogfood-autosim.ts` — main dogfood runner (Trail 1 = GREEN, Trail 2 = RED)
- `prototype/lib/dogfood-debug.ts` — crystallize + cache verification script
- `prototype/lib/dogfood-debug2.ts` — isolated single-step walk tests (all GREEN)
- `prototype/lib/dogfood-debug3.ts` — sequential two-trail test (both GREEN in isolation)
- `prototype/lib/dogfood-diagnose.ts` — selector count/visibility diagnostic
- `prototype/lib/dogfood-diagnose2.ts` — without-networkidle selector diagnostic
- `prototype/lib/dogfood-diagnose3.ts` — Playwright click flow diagnostic
- `prototype/lib/dogfood-diagnose4.ts` — JS onclick/go() diagnostic (not run at convergence)
