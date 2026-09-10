# Visual regression / baseline screenshot diffing with AI noise-filtering

Status: Draft spec · Owner: AutoSim platform · Date: 2026-09-11

## Problem & user value

AutoSim already replays authored Trails and files functional regressions
(`FindingKind = "regression"`). But a huge class of real bugs are *visual*: a
button that vanished behind an overlay, a layout that collapsed on a CSS change,
a chart that renders blank, contrast/color regressions, text overflow. Today
those slip through unless a step's functional assertion happens to trip. Our
JTBD north star is "fixed things breaking again" — visual breaks are exactly
that, and we catch almost none of them.

`FindingKind` already reserves a `"visual"` kind
(`prototype/lib/trails-types.ts:16`) and `Trail` already carries a
`baselineRef: string | null` column (`trails-types.ts:49`,
`trails.ts:15` rowToTrail) — both are currently **unused**. This capability
lights them up: on every walk, capture a per-step full-page screenshot, diff it
against a stored per-step baseline, filter the noise (anti-aliasing, font
hinting, dynamic content) with a cheap pixel/perceptual pass plus an LLM
adjudication tier, and file a grounded `"visual"` finding with a DOM/region
root-cause and a side-by-side (baseline / actual / diff-heatmap) in the walk
report.

User value: AutoSim becomes a visual-regression guard on top of a functional
guard — one run catches both "the flow broke" and "the page looks wrong",
without a human writing a single assertion.

## Goals / Non-goals

**Goals**
- Per-step baseline screenshot capture + storage, keyed by (trail, step,
  viewport, environment), reusing the existing S3 + `run_steps.evidence_json`
  plumbing.
- A three-tier diff pipeline: (1) fast pixel diff with anti-alias/threshold
  tolerance, (2) region-ignore masks (user + auto-detected dynamic regions),
  (3) an LLM "is this a real, user-perceptible regression?" adjudication tier
  gated to only run on diffs that survive tiers 1–2 (cost control).
- DOM root-cause: map a changed pixel region back to the element(s) under it
  using our existing `krefSnapshot`/`stableSelector` element tree.
- Baseline lifecycle: approve/accept a new baseline, per-environment baselines,
  auto-baseline on first green walk.
- Surface visual findings in the walk report next to functional ones, with a
  baseline/actual/diff triptych.

**Non-goals (this epic)**
- Cross-browser rendering matrix (we run one Chromium via Playwright/Steel;
  multi-viewport is in-scope, multi-engine is not).
- Full component-level (Storybook) snapshotting — we diff *live pages the walk
  visits*, not an isolated component library.
- Training our own visual model. We use a cheap deterministic pass + our
  existing vision LLM (the same `reactFn` provider used in `sim-review.ts`),
  not a bespoke CNN.
- Git-dependency "TurboSnap" style change-scoping (noted as a phase-3 follow-up,
  not built here).

## Competitor benchmark (concrete mechanics)

- **Applitools Visual AI (Eyes):** compares at a *perceptual* level, not
  pixel-by-pixel. A network of hundreds of algorithms (rule-based + deep
  learning) trained on ~1B+ UI screenshots decides which diffs a human would
  perceive, filtering anti-aliasing / sub-pixel / CI-font-hinting noise that
  floods naive pixel tools. Supports named ignore/layout/content/strict match
  regions. Takeaway for us: **two-stage** — cheap deterministic diff to find
  *candidate* changed regions, then a perception model to decide *if it matters*.
  We approximate the perception model with our vision LLM, scoped only to
  surviving candidate regions to keep cost bounded.
  ([applitools.com/platform/validate/visual-ai](https://applitools.com/platform/validate/visual-ai/))
- **Percy (BrowserStack):** captures **DOM+CSS+asset snapshots** client-side and
  ships them to the cloud, where rendering + diffing happen asynchronously.
  Branch-aware baselines (a feature branch keeps its own baseline so main's
  churn doesn't pollute it). Ignore Regions for dynamic content (timestamps,
  UGC). Highlights the *exact* shifted pixels rather than reddening the whole
  page. Takeaway: **baseline is per-branch/context**, and **ignore-regions are
  first-class**. We map "branch" → our `environment` + `stepVersion`.
  ([browserstack.com/docs/percy/set-regions](https://www.browserstack.com/docs/percy/set-regions/recommendations),
  [percy.io/blog/visual-screenshot-testing](https://percy.io/blog/visual-screenshot-testing))
- **Chromatic TurboSnap:** uses the Webpack/Vite dependency graph + git diff
  between the current commit and the ancestor baseline build to snapshot only
  stories whose code changed; baseline branch (main) does a full build. Requires
  a non-shallow clone to compute the ancestor diff. Takeaway: **change-scoping
  is a cost lever** — deferred to phase 3 (we'd scope by URL-path/step rather
  than a JS dep graph, since we test live pages).
  ([chromatic.com/docs/turbosnap](https://www.chromatic.com/docs/turbosnap/))

Net design stance: **Percy-style contextual baselines + Applitools-style
two-tier (cheap diff → perception adjudication) + region ignore**, built on our
existing capture/S3/finding stack.

## Current state in our codebase

- **Per-step capture already exists.** `walkTrail` (`lib/trails-runner.ts:699`)
  builds a `createStepShotUploadQueue` when `opts.stepShots` is set
  (`trails-runner.ts:775`). `maybeCaptureShot` (`trails-runner.ts:574`) grabs a
  JPEG per actionable step; the queue uploads via `defaultShotUploader`
  (`trails-runner.ts:564`) → `uploadScreenshotMeta` (`lib/s3.ts:40`) and patches
  `run_steps.evidence_json` with `{ screenshotKey }` via `mergeRunStepEvidence`
  (`lib/trails.ts:297`). This is our capture seam — we extend it, not replace it.
- **Full-page capture.** `PlaywrightPage.screenshotJpeg(quality, timeoutMs, {
  fullPage })` (`lib/trails-browser-page.ts:377`, interface at :282). Currently
  `maybeCaptureShot` calls raw `page.screenshot({type:'jpeg',quality:45})`
  (viewport only) — baselines want deterministic full-page PNG.
- **Client-side capture heuristics we can reuse conceptually.**
  `packages/sdk/src/capture.ts` already has `samplePixelVariance` (:329),
  `isBlankCapture` (:366), `sampleWhiteFraction` (:383), `isPartialCapture`
  (:421). These are the seed of a "is this frame even worth diffing" gate and a
  reference implementation for pixel sampling in TS. (Note: these run in the
  browser DOM; the walk runs server-side in Bun, so the diff engine is a new
  server module, but the sampling math ports over.)
- **Storage.** `lib/s3.ts`: `uploadObject` (:101), `getObjectBytes` (:198),
  `presignGet` (:230), `objectExists` (:118), `deleteObject` (:113). Screenshots
  ledger table `screenshots` (`db.ts` applySchema, ~L?) + `run_steps` table
  (`db.ts:639`) with `evidence_json`.
- **Findings.** `recordFinding` (`lib/trails.ts:514`) already accepts
  `kind: FindingKind` (includes `"visual"`), `evidence`, `groundQuote`,
  `confidence`, `dedupKey`, `contentSig`. `computeFindingSeverity` maps kind →
  priority. `FindingKind = "regression" | "visual" | "amber_heal"`
  (`trails-types.ts:16`). Draft/verification walks suppress findings
  (`suppressFindings`).
- **Report surface.** `gatherWalkReport` (`lib/trails-report.ts:31`) already
  resolves `evidence.screenshotKey` → a presigned URL per step
  (`resolveReportScreenshot`) and attaches `findings` filtered to the run. This
  is where we attach baseline/diff URLs.
- **DOM element tree for root-cause.** `krefSnapshotBody`/`walk`
  (`lib/trails-browser-page.ts:85`) already builds a stable element tree with
  fingerprints + `stableSelectorBody` (:245). `page.stableSelector()` /
  `page.fingerprint()` exist on both `PlaywrightPage` and `PuppeteerPage`.
- **`Trail.baselineRef` (`trails-types.ts:49`) is declared and round-tripped
  (`trails.ts:15`) but never written or read.** No `visual_baselines` table, no
  diff code, no `pixelmatch`/`pngjs`/SSIM dependency exists anywhere (graft grep
  confirms 0 hits). This capability is greenfield on top of a ready capture rail.

## Proposed architecture (grounded in our modules)

### 1. Baseline store — new table + module

Add a `visual_baselines` table in `applySchema` (`lib/db.ts`, alongside
`run_steps`/`trail_runs` at :626–654):

```sql
CREATE TABLE IF NOT EXISTS visual_baselines (
  id TEXT PRIMARY KEY,               -- vbl_<uuid>
  project_id TEXT NOT NULL,
  trail_id TEXT NOT NULL,
  step_id TEXT NOT NULL,             -- '' for a page-level/objective baseline
  environment TEXT NOT NULL DEFAULT '',  -- Percy-style contextual baseline (env name)
  viewport TEXT NOT NULL DEFAULT '',     -- 'WxH' so a mobile + desktop baseline coexist
  s3_key TEXT NOT NULL,              -- the accepted baseline PNG
  bucket TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  content_hash TEXT NOT NULL,        -- sha256 of PNG bytes (fast identical-shot skip)
  ignore_regions_json TEXT,          -- [{x,y,w,h,reason,source:'user'|'auto'}]
  status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'superseded'
  accepted_by TEXT,                  -- email, null = auto-baselined
  run_id TEXT,                       -- the walk that produced this baseline
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS vbl_key_uq
  ON visual_baselines(project_id, trail_id, step_id, environment, viewport)
  WHERE status='active';
```

New module `lib/visual-baselines.ts`: `getActiveBaseline(...)`,
`upsertBaseline(...)`, `acceptBaseline(runStepId|explicit bytes)`,
`listBaselinesForTrail(...)`. Mirrors the shape of `lib/trails.ts` DB helpers
(same `db!.execute` + `rowToX` pattern).

### 2. Diff engine — new pure module `lib/visual-diff.ts`

Server-side (Bun), no DOM. Add `pixelmatch` + `pngjs` (both pure-JS, Bun-safe,
tiny) to `prototype/package.json`. Functions:

- `decodePng(bytes): {data, width, height}` — via `pngjs`.
- `alignSizes(a, b)` — if dimensions differ (page grew/shrank), pad to the max
  and record the size-delta as a first-class signal (a height change is itself
  a candidate finding, not just diff noise).
- `pixelDiff(a, b, {threshold, includeAA, ignoreRegions}): { diffPixels,
  diffFraction, boundingBoxes, heatmapPng }` — wraps `pixelmatch` with
  `includeAA:false` (anti-alias tolerant), a configurable per-channel
  `threshold` (default 0.1), and zeroes out `ignoreRegions` before comparing.
  Cluster changed pixels into bounding boxes (connected-components / grid-bucket
  union) so we get *regions*, not a pixel count — matches Percy's "exact shifted
  pixels" and gives us regions to hand the LLM.
- `classifyNoise(boundingBoxes, images)` — cheap heuristics before spending an
  LLM call: drop boxes fully inside an ignore region; treat single-row/column
  ≤2px shifts as sub-pixel/scroll noise; use the ported `samplePixelVariance`
  logic to ignore boxes that are uniformly-colored on both sides (font hinting).

Output: a `VisualDiffResult { verdict: 'match' | 'candidate' | 'changed';
diffFraction; regions: DiffRegion[]; heatmapKey?: string }`.

### 3. Perception adjudication tier — extend, reuse `reactFn`

Only invoked when `verdict==='candidate'` (i.e. survived cheap tiers) AND the
walk isn't draft/suppressed. New `lib/visual-adjudicate.ts`:
`adjudicateVisualDiff({ baselineB64, actualB64, heatmapB64, regions,
domContext, reactFn })`. It crops to the union bounding box (+ padding) so the
model sees the change, sends baseline+actual+heatmap to the **same vision LLM
seam already used by `runSimReviews`** (`lib/sim-review.ts:149`, the injected
`reactFn`), and returns `{ isRegression: boolean, severity: 'C1'|'C2'|'C3',
rationale: string, perceptualNoise: boolean }`. Prompt is explicitly
noise-aware: "ignore anti-aliasing, font hinting, sub-pixel shifts, and
content inside dynamic regions; flag only changes a user would perceive as
broken." This is our Applitools-perception analogue, cost-bounded because tiers
1–2 gate it.

### 4. DOM root-cause

At capture time, alongside the shot, persist a lightweight element-box map:
extend the browser page with `elementBoxes()` (new method on `BrowserPage`,
`lib/trails-browser-page.ts:272`) returning `[{selector, fingerprint, rect}]`
from a `page.evaluate` reuse of the `krefSnapshotBody` walker (it already
computes `stableSelectorBody` + `fingerprintBody`). Store as
`evidence.elementBoxesKey` (JSON in S3, or inline if small). In the diff step,
for each surviving `DiffRegion`, find the smallest element box whose rect
contains the region centroid → that's the root-cause selector, threaded into
the finding's `evidence.rootCause = { selector, fingerprint, rect }`.

### 5. Walk integration

In `walkTrail` (`lib/trails-runner.ts:699`), gate all of the above behind a new
`opts.visualDiff` (default off; on for scheduled/CI walks of non-draft trails):

1. Change the per-step capture path (`maybeCaptureShot`) to take a **full-page
   deterministic PNG** when `visualDiff` is on: call
   `page.screenshotJpeg`-sibling `page.screenshotPng(fullPage:true)` (new method
   mirroring `screenshotJpeg`) with animations disabled
   (`animations:'disabled'`, Playwright `screenshot` option) and a settle wait,
   to kill animation/anti-alias flakiness at the source.
2. After upload, look up `getActiveBaseline(project, trail, step, env,
   viewport)`. **No baseline** → auto-baseline on green walks (Percy behavior:
   first clean run seeds it), record `evidence.visual = { baseline: 'seeded' }`.
   **Baseline exists** → run `visual-diff` → if `changed`/adjudicated regression
   and `!suppressFindings`, `recordFinding({ kind: 'visual', ... })` with
   `dedupKey = trail:step:env:viewport:regionSig` (so a persistent visual break
   dedups + bumps recurrence exactly like functional findings).
3. Persist `run_steps.evidence.visual = { baselineKey, actualKey, heatmapKey,
   diffFraction, verdict, regions, rootCause }` via the existing
   `mergeRunStepEvidence`.

All of this is best-effort and wrapped like existing capture code — a diff
failure must never fail a step or a walk (same discipline as
`captureFindingShotKey`).

### 6. Report + accept surface

- `gatherWalkReport` (`lib/trails-report.ts:31`): when a step's
  `evidence.visual` is present, presign `baselineKey`/`actualKey`/`heatmapKey`
  (reuse the existing `opts.presign` path already used for `screenshotKey`) and
  attach a `visual` block to the `ReportStep`. Respect `withholdScreenshots`
  masking exactly as the current screenshot path does.
- Walk report UI renders a baseline / actual / diff-heatmap triptych with the
  root-cause selector and the LLM rationale, and an **"Accept new baseline"**
  button (owner/member only) → new API below.

## Data-model changes

1. New table `visual_baselines` (above) in `applySchema` (`lib/db.ts`).
2. `run_steps.evidence_json` gains an optional `visual` sub-object (no schema
   change — it's already free-form JSON merged by `mergeRunStepEvidence`).
3. `Trail.baselineRef` (`trails-types.ts:49`): repurpose/deprecate. Since
   baselines are now per-step rows, `baselineRef` becomes an optional pointer to
   a "baseline set version" or is left as-is; document that per-step
   `visual_baselines` supersedes it. (No migration needed — column already
   exists and is nullable.)
4. `findings` rows with `kind='visual'` — no schema change; `evidence_json`
   holds `{ baselineKey, actualKey, heatmapKey, diffFraction, regions,
   rootCause }`.

## API / MCP / CLI surface

- `POST /api/projects/:id/trails/:trailId/steps/:stepId/baseline/accept`
  — body `{ runId, environment?, viewport? }`; copies the walk's actual shot to
  an accepted baseline (`upsertBaseline`, marks prior `superseded`). Owner/member
  gated (reuse existing project-access middleware in `server.ts`).
- `PUT /api/.../baseline/ignore-regions` — set `ignore_regions_json` (user draws
  a box in the report UI over dynamic content).
- `GET /api/.../trails/:trailId/baselines` — list baselines (report/settings).
- `walkTrail` opts + the `/api/v1/runs` REST trigger and MCP AutoSim run tool
  (see MEMORY: Public API + MCP epic, `/api/v1/runs`) gain a `visualDiff:
  boolean` flag so an agent can request a visual-regression walk.
- Walk-report JSON (`gatherWalkReport` output) gains `steps[].visual`.

## UX / reporting

- Walk report step card: 3-up baseline / current / heatmap, diffFraction %,
  root-cause selector chip, LLM rationale, severity badge (reuse
  `computeFindingSeverity`). "Accept baseline" + "Add ignore region" buttons
  (member-gated; follow the standing UI rules — white cards on beige, button
  micro-animations).
- First-run empty state on a step with no baseline: "Baseline captured — future
  runs will diff against this." (auto-seed messaging).
- Findings queue: `visual` findings sit next to `regression` findings, filtered
  by kind; the ticket body (connector export) embeds the triptych + selector.

## Acceptance criteria

- With `visualDiff` on and no baseline, a green walk seeds a `visual_baselines`
  row per step (auto-baseline) and files **no** finding.
- With a baseline present and an injected visual change inside a non-ignored
  region, the walk files exactly one `kind='visual'` finding with a root-cause
  selector, and `run_steps.evidence.visual.verdict==='changed'`.
- Anti-alias-only / sub-pixel / font-hinting differences (same DOM, re-rendered)
  do **not** produce a finding (tier-1/tier-2 filter, no LLM call spent).
- A change fully inside a configured ignore region produces no finding.
- The LLM adjudication tier is invoked **only** for `candidate` diffs and never
  on `match`/draft/suppressed walks (assert call count).
- `gatherWalkReport` returns presigned baseline/actual/heatmap URLs and honors
  `withholdScreenshots` masking.
- `POST .../baseline/accept` supersedes the prior active baseline and is
  IDOR-guarded (project-scoped, member+).
- A diff-engine or LLM failure never fails the step or the walk (verdict
  unchanged; error swallowed like existing capture paths).

## Test plan

Follow the repo TDD + negative-control conventions (`bun test` from
`prototype/`):

- **`visual-diff.test.ts` (pure):** identical PNG → `match`, 0 findings.
  Small injected rect → `candidate`/`changed` with correct bounding box. AA-only
  fixture (re-encode same PNG at different quality) → `match`. Region-ignore
  covering the change → `match`.
- **`visual-baselines.test.ts`:** upsert → active unique per
  (project,trail,step,env,viewport); accept supersedes prior; content-hash short
  circuits identical shots.
- **`visual-adjudicate.test.ts`:** stub `reactFn`; assert it is called **only**
  for `candidate` verdicts and receives cropped region images; noise verdict →
  no finding.
- **Integration (`server.autosims-walks-data`-style, extend existing walk
  test harness):** run a walk with `visualDiff` + a stub browser page returning
  (a) baseline then (b) a mutated frame → assert one `visual` finding + evidence
  shape; run with an identical frame → assert zero findings.
- **NEGATIVE CONTROL:** the *same page rendered twice* (identical DOM, natural
  browser re-render with AA jitter) must yield **zero** visual findings — and
  the test must **fail** if tier-1 tolerance/`includeAA:false` is removed
  (i.e. it reproduces the false-positive-flood the whole feature exists to
  prevent). Second negative control: with `suppressFindings`/draft, a genuine
  visual change captures evidence but files no finding.
- Async/lifecycle (per QA checklist): assert the shot-upload queue `drain()`
  completes before the walk finalizes so a baseline seeded this run is durable;
  assert diff runs off the step deadline path (no walk timeout regression).

## Phasing

- **Phase 1 (ships first):** `visual_baselines` table + `lib/visual-baselines.ts`
  + `lib/visual-diff.ts` (pixelmatch/pngjs, tier-1/2 only, region ignore) +
  full-page PNG capture in `walkTrail` behind `opts.visualDiff` + auto-baseline
  + `kind='visual'` finding + `gatherWalkReport` triptych + accept API. **No LLM
  tier yet** — verdict is deterministic (`changed` if surviving diffFraction >
  threshold). This alone is a shippable visual guard.
- **Phase 2:** LLM adjudication tier (`lib/visual-adjudicate.ts`) gated to
  `candidate` diffs; DOM root-cause via `elementBoxes()`; auto-detected dynamic
  regions (diff N clean runs to learn volatile regions à la ignore-region
  auto-suggestion).
- **Phase 3:** change-scoping cost lever (skip diffing steps on URL-paths with
  no deploy delta — our TurboSnap analogue), multi-viewport baseline matrix,
  per-environment baseline promotion workflows.

## Effort estimate

- Phase 1: **L** (~1.5–2.5 dev-days: table + module + engine + walk wiring +
  report + accept API + tests).
- Phase 2: **L** (LLM tier + root-cause + auto-regions).
- Phase 3: **M**.

## Risks & open questions

- **Determinism of full-page capture.** Long/lazy pages, animations, and web
  fonts cause flakiness. Mitigate with `animations:'disabled'`, a settle wait,
  font-ready wait, and fixed viewport; still expect some flake → the LLM tier is
  the backstop, and auto-region learning reduces it.
- **Storage growth.** A baseline + per-run actual + heatmap per step × trails ×
  environments. Reuse the S3 lifecycle/quotas; consider TTL on non-baseline
  actuals (keep last N runs). Open: retention policy + billing bucket.
- **Cost of LLM tier.** Bounded by tier-1/2 gating + region cropping, but a
  noisy page could spray candidates. Add a per-walk visual-LLM call ceiling
  mirroring `SESSION_CALL_CEIL` in `sim-review.ts`.
- **Baseline poisoning.** Auto-baselining a *broken* first run silently accepts
  a bug as the norm. Mitigate: only auto-baseline on a green (functional) walk,
  and require explicit accept for any subsequent baseline change.
- **`pixelmatch`/`pngjs` under Bun.** Both are pure JS and should be fine; verify
  in a real `bun test`, not just types (per the "over-hardening broke feature
  under Bun" lesson).
- Open: does `baselineRef` on `Trail` get formally deprecated or repurposed as a
  baseline-set version pointer?

## Dependencies on other capabilities

- **Per-step screenshot capture (exists):** `opts.stepShots` /
  `createStepShotUploadQueue` / `defaultShotUploader` in `trails-runner.ts` —
  hard dependency; we extend it.
- **Vision LLM seam (exists):** the injected `reactFn` used by `runSimReviews`
  (`sim-review.ts`) — Phase 2 depends on it.
- **Findings + report pipeline (exists):** `recordFinding`, `gatherWalkReport`,
  connector export.
- **Public API / MCP AutoSim run trigger (`/api/v1/runs`, MEMORY epic):** to
  expose `visualDiff` to agents (soft dependency; the walk-level flag works
  without it).
- **DOM element tree (exists):** `krefSnapshotBody` / `stableSelector` for
  root-cause (Phase 2).
