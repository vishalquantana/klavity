# Accessibility / WCAG audit as a first-class AutoSim check

## Problem & user value

AutoSim walks a real page in a real Chromium and already reasons about the page
structurally (it computes roles + accessible names for every visible element to
build the kref snapshot in `lib/trails-browser-page.ts`). But it currently only
reports **functional regressions** (`regression`), **heals** (`amber_heal`), and
**visual** findings. It never tells the team that the page they just shipped is
inaccessible — missing form labels, images without alt text, buttons with no
accessible name, insufficient colour contrast, broken heading order, ARIA
misuse, low-contrast text over a gradient.

Accessibility is (a) legally required for a growing share of our target
customers (ADA / EN 301 549 / WCAG 2.1 AA), (b) something *every* page has and
*every* walk visits, and (c) deterministic and cheap to detect with a mature
open-source engine (axe-core). That makes it the highest signal-per-dollar
differentiator we can add: one axe scan per unique page in a walk we are already
paying to run, surfaced as Findings with real severities, grounded in the exact
failing node. No extra LLM calls, no extra browser, no extra walk.

**User value:** "AutoSim caught 7 WCAG AA violations on /checkout, including an
unlabelled card-number field and a 2.9:1 contrast on the pay button — here's the
exact element and the rule." Every scheduled walk becomes a continuous a11y
regression gate for free.

## Goals / Non-goals

**Goals**
- Run axe-core against the live DOM once per unique page reached during a walk
  (and during authoring drives), with a curated ruleset (WCAG 2.1 A + AA +
  Deque best-practices, experimental rules off — matches Mabl's default).
- Add a first-class `accessibility` Finding kind with severity derived from
  axe's `impact` (critical/serious/moderate/minor), grounded in the failing
  node's HTML + selector + WCAG tags + help URL.
- Surface a per-walk accessibility summary (counts by impact + top rules) in the
  walk report, dashboard, walk-report JSON, and the public run API/MCP.
- Add a **rendered-contrast** check (Applitools-style) for the text/regions axe
  can't judge from computed styles — text over images/gradients — using the
  step screenshot we already capture. (Phase 2.)
- Default-OFF per project, one toggle to enable; zero behaviour change when off.

**Non-goals**
- a11y findings do **not** turn a walk RED and do **not** block/auto-file by
  default (they are advisory quality signals, not test-step regressions). A
  project may opt into auto-filing `critical` a11y findings later.
- No manual/assistive-tech audit (screen-reader transcript, focus-order replay)
  in v1 — axe covers ~40-50% of WCAG programmatically; we do not claim full
  conformance.
- No new browser/engine. No CDN fetch of axe (bundle it — SSRF/offline safety).

## Competitor benchmark (concrete mechanics)

**Mabl** ([overview](https://help.mabl.com/docs/accessibility-testing-overview),
[rules/tags](https://help.mabl.com/hc/en-us/articles/25101592214804-Accessibility-rules-and-tags)):
runs **axe-core** with its default config (all rules except `experimental`).
Teams toggle tags (`wcag2a`, `wcag2aa`, `wcag21aa`, `best-practice`). Each
violation carries axe's **impact** — critical / serious / moderate / minor
(Deque's user-impact scale, *not* WCAG-defined). The team configures **which
impact level fails the test**. Reports show per-violation: severity, rule ID,
instance count, URL path, violated tags. Accessibility and functional testing
live in one run — exactly our thesis.

**Applitools Contrast Advisor**
([platform](https://applitools.com/platform/validate/accessibility/),
[docs](https://applitools.com/docs/eyes/concepts/test-execution/accessibility-testing)):
Visual-AI over the **rendered screenshot**. During a normal checkpoint Eyes
classifies each element (text vs image), measures the actual contrast ratio from
pixels, and flags those below the WCAG **AA (4.5:1 / 3:1)** or **AAA** minimum.
The key differentiator vs axe: it catches contrast on **text over images,
gradients, and icons** — cases a computed-style engine (axe's `color-contrast`)
skips or marks "incomplete". No workflow change; enabled per-config on top of
existing tests.

**Our synthesis:** axe-core for the deterministic structural + computed-contrast
majority (the Mabl model), plus a lightweight rendered-pixel contrast pass over
the screenshot we already have (the Applitools differentiator) for what axe
punts on. Both fold into our existing Findings pipeline — no new report surface,
no new store.

## Current state in our codebase

- **We already compute roles + accessible names in the page.** `krefSnapshotBody`
  (`lib/trails-browser-page.ts:85-223`) walks the DOM in page context computing
  `roleOf`, `nameOf`, `labelFor`, `visible` for every element — the same signals
  axe needs. `PlaywrightPage.krefSnapshot()` (`lib/trails-browser-page.ts:378`)
  is the injection pattern to copy: a stringified function run via
  `page.evaluate`. The `BrowserPage` interface (`:272-338`) is where a new
  `axeScan()` method belongs, implemented by `PlaywrightPage` (`:358-490`).
- **Findings are a first-class, deduped, severity-scored model.**
  `FindingKind = "regression" | "visual" | "amber_heal"`
  (`lib/trails-types.ts:16`); `Finding` interface (`:140-151`).
  `recordFinding` (`lib/trails.ts:514-591`) inserts into the `findings` table
  with atomic `(project_id, dedup_key)` dedup + cross-trail `content_sig`
  collapse + recurrence bump, and stores arbitrary evidence in `evidence_json`
  (no schema change needed for new evidence). Severity:
  `computeFindingSeverity` + `BASE_SEVERITY` (`lib/trails-findings-severity.ts:26-54`).
- **The walk loop is where a scan hooks in.** `walkTrail`
  (`lib/trails-runner.ts:699`) drives steps via `runOneStep` (`:1203`) and
  `runVisionTier2` (`:1656`); `recordFinding` is already called from the runner
  at `:1385/:1438/:1576/:1687/:1764/:1883`. `WalkOptions`
  (`lib/trails-runner.ts:45-201`) is where a new `a11y?` option goes, mirroring
  the existing `replay?` opt-in flag (`:70`) and `suppressFindings` gate (`:104`).
- **The auto-file gate already classifies by kind + confidence.**
  `decideFindingAction` (`lib/trails-findings-gate.ts:28-33`) only auto-files
  high-confidence `regression`; everything else queues. a11y findings will
  queue by the same rule with no change.
- **The report already aggregates findings by run.** `gatherWalkReport`
  (`lib/trails-report.ts:31-85`) collects `findings.filter(f => f.runId===runId)`;
  masking in `maskWalkReportData` (`lib/data-masking.ts:324`). Slack alert
  builder `buildWalkRedSlackPayload` (`lib/walk-red-alert.ts:109`).
- **No axe dependency yet.** `package.json` has `playwright ^1.61.0` but no
  `axe-core` / `@axe-core/playwright`. Playwright's `page.addScriptTag` /
  `page.evaluate` are available for injection.

## Proposed architecture

Build **on** the existing walk → recordFinding → report pipeline. Four new/changed
pieces.

### 1. axe injection + scan — new `lib/trails-a11y.ts`
- Add `axe-core` to `prototype/package.json` deps. Load its bundled source
  string once at module init: `import axeSource from "axe-core/axe.min.js?..."`
  or read `require.resolve("axe-core/axe.min.js")` into a string constant
  `AXE_SOURCE` (bundled, **never** fetched from a CDN — consistent with our
  SSRF posture).
- New `BrowserPage.axeScan(opts)` method on the interface
  (`lib/trails-browser-page.ts:272-338`) + `PlaywrightPage` impl (`:358-490`):
  ```
  async axeScan(opts: { tags: string[]; timeoutMs: number }): Promise<AxeResultRaw>
  ```
  Implementation: `await this.page.evaluate(AXE_SOURCE)` to define `window.axe`
  (idempotent), then `await this.page.evaluate((cfg) => axe.run(document, cfg),
  { runOnly: { type: "tag", values: opts.tags }, resultTypes: ["violations"] })`.
  Bounded by a Playwright timeout; try/caught so an axe throw yields zero
  findings and never fails the walk (same discipline as `replay`).
- `runA11yScan(page, { projectId, runId, trailId, stepId, urlPath, tags })` in
  `trails-a11y.ts`: calls `page.axeScan`, maps each `violation.nodes[]` to a
  normalized `A11yFinding` (ruleId, impact, wcagTags, helpUrl, target selector,
  html snippet, failureSummary, and for `color-contrast` the measured/expected
  ratio + fg/bg from `node.any[].data`), and records via `recordFinding`.

### 2. New Finding kind + severity mapping
- Extend `FindingKind` (`lib/trails-types.ts:16`) →
  `"regression" | "visual" | "amber_heal" | "accessibility"`.
- Extend `BASE_SEVERITY` (`lib/trails-findings-severity.ts:26`) with
  `accessibility: "low"`. But a11y severity is driven by axe **impact**, not the
  generic kind floor — so map impact → priority *before* calling recordFinding,
  passing a confidence that lands the right level through the existing formula,
  OR add an `impactSeverity?` override path in `computeFindingSeverity`. Cleanest:
  map `critical→urgent, serious→high, moderate→medium, minor→low` in
  `trails-a11y.ts` and pass it as the finding's initial `priority` (recordFinding
  already writes a `priority` column). Keep `confidence: 1` (axe is
  deterministic) so recurrence/report logic behaves.
- `dedupKey = a11y:${urlPath}:${ruleId}:${targetSelector}` (stable across
  walks of the same page → recurrence bumps, no dupes). `contentSig` =
  hash(ruleId + targetSelector-normalized + urlPath) for cross-trail collapse,
  reusing the existing `contentSigFor` discipline in `recordFinding`.
- `evidence_json`: `{ a11y: { ruleId, impact, wcagTags, helpUrl, target, html,
  failureSummary, contrast?: { ratio, expected, fg, bg, fontSizePt, bold } } }`.
  `groundQuote` = the failing node's HTML snippet (already-verified DOM text →
  `groundQuoteVerified: true`).

### 3. Wiring into the walk (and authoring drive)
- Add `WalkOptions.a11y?: { enabled: boolean; tags?: string[]; scanEveryPage?:
  boolean }` (`lib/trails-runner.ts:45`). Resolve default from a new
  `project.a11yAuditEnabled` flag (mirrors `trailsAutofileEnabled`).
- In `walkTrail`, after each **navigation/settle** (i.e. when the current URL
  changes vs the last-scanned URL), if `opts.a11y?.enabled && !suppressFindings`,
  call `runA11yScan` for that page. Dedupe by **normalized URL path** in a
  `Set<string>` so a 10-step trail on one SPA route scans once, not ten times
  (cost control; a route change re-scans). Best-effort + time-boxed; wrapped so a
  scan error is logged and swallowed.
- Same hook available in `authorTrail` (`lib/trails-author.ts:273`) drive loop so
  authored objective runs also emit a11y findings — but respect `suppressFindings`
  for drafts/verification (evidence only).
- a11y findings are recorded with `status: "queued"` and **never** mutate the
  walk verdict (`walkVerdict`/`redReasons` untouched) — enforced by not touching
  the verdict ledger from the a11y path.

### 4. Reporting surface
- `gatherWalkReport` (`lib/trails-report.ts:31`) already returns all
  runId-scoped findings; add a derived `a11ySummary` to `WalkReportData`:
  `{ total, byImpact: {critical,serious,moderate,minor}, topRules: [{ruleId,
  count, wcagTags}], pagesScanned }`. `maskWalkReportData` (`lib/data-masking.ts:324`)
  masks a11y evidence HTML like other findings.
- Walk report page: new collapsible "Accessibility (n)" section grouping a11y
  findings by impact, each row = rule name + WCAG tag chips + affected selector +
  "learn more" (helpUrl) + on-page jump (reuse existing finding jump).
- Slack: extend the walk summary (not the RED path) with a one-line "+N
  accessibility issues (X critical)" when count>0.

## Data-model changes

- **No new table.** Reuse `findings` (evidence in `evidence_json`, priority in
  existing `priority` column). `FindingKind` union widened (TS-only; SQLite
  `kind` is TEXT — no migration).
- **New project flag** `a11y_audit_enabled INTEGER DEFAULT 0` on `projects`
  (migration in `applySchema`, `lib/db.ts`), read into the `Project` type as
  `a11yAuditEnabled?: boolean` alongside `trailsAutofileEnabled`.
- **Optional index** `CREATE INDEX IF NOT EXISTS findings_kind_run ON
  findings(project_id, run_id, kind)` to make the report's per-run a11y filter
  cheap (mirrors existing findings indices in `db.ts`).
- `BASE_SEVERITY` gains an `accessibility` entry; severity primarily driven by
  axe impact → priority mapping.

## API / MCP / CLI surface

- **Walk-report JSON** (existing route that serves `gatherWalkReport`): add
  `a11ySummary` + a11y findings already present in `findings[]` with
  `kind:"accessibility"` and `evidence.a11y`.
- **Public run API / MCP** (`/api/v1/runs`, per the public-API epic): the run
  detail response gains `accessibility: { total, byImpact, topRules }`. No new
  endpoint needed — a11y findings ride the existing findings list. MCP: existing
  "get run" tool surfaces the a11y block so an agent can ask "what WCAG issues did
  the last walk find on /pricing?".
- **CLI/toggle:** project setting "Run accessibility (WCAG) audit during walks"
  in project settings UI → sets `a11yAuditEnabled`. Optional advanced: tag set
  (default `["wcag2a","wcag2aa","wcag21a","wcag21aa","best-practice"]`).

## UX / reporting

- Walk report: "Accessibility (7)" section, grouped **critical → minor**, each
  row: `<rule name>` · WCAG chips (`WCAG 2.1 AA`, `1.4.3`) · affected selector ·
  measured contrast (for contrast rules) · "How to fix →" (axe helpUrl) · "Jump
  to on page".
- Dashboard walk card: small "a11y: 7 (2 critical)" badge when >0.
- Findings queue: a11y findings appear as advisory (queued), filterable by kind;
  a project can bulk-track selected ones to the connector.
- Honest framing: a footer note "Automated checks catch ~40-50% of WCAG issues;
  a green result is not a conformance guarantee" (avoids over-claiming — matches
  our negative-control/honesty memory).

## Acceptance criteria

- With `a11yAuditEnabled` ON, a walk over a page with a known violation (e.g. an
  `<img>` with no alt, an unlabelled `<input>`, a 2.9:1-contrast button) records
  `accessibility` findings with the correct `ruleId`, `impact`-derived priority,
  WCAG tags, target selector, and node HTML in evidence.
- The same page walked twice bumps `recurrence` and does **not** create duplicate
  findings (dedupKey stable).
- a11y findings **never** change the walk verdict (a walk that is functionally
  green with a11y issues stays GREEN) and are **not** auto-filed by default
  (stay `queued`).
- With `a11yAuditEnabled` OFF (default) a walk produces **byte-identical**
  behaviour to today (no axe injection, no findings, no report section) — proven
  by the existing engine suite staying green unchanged.
- A 10-step trail on one SPA route triggers exactly one axe scan for that route
  (URL-dedupe), verified by a scan-count assertion.
- An axe injection/scan failure logs a warning and yields zero a11y findings
  without failing or reddening the walk.
- Walk report JSON includes `a11ySummary.byImpact` with counts matching recorded
  findings.

## Test plan (incl. negative control)

- **Unit (`trails-a11y.test.ts`):** feed a canned `axe.run` result (fake
  `page.axeScan`) with one critical + one moderate violation → assert
  `runA11yScan` records two findings with correct kind/priority/dedupKey/evidence
  via a fake recordFinding. Assert impact→priority map
  (critical→urgent…minor→low).
- **Fixture integration:** a static `file://` fixture HTML with deterministic
  violations (missing alt, unlabelled input, low-contrast text) walked with a
  real `PlaywrightPage.axeScan` → assert exact rule IDs
  (`image-alt`, `label`, `color-contrast`) appear.
- **Dedup:** walk the same fixture twice → assert one finding row per violation,
  recurrence incremented.
- **URL-dedupe:** multi-step trail that stays on one route → assert `axeScan`
  called once.
- **Negative control (required):** (a) a fixture with **no** violations →
  `runA11yScan` records **zero** a11y findings and the walk stays green — proves
  we aren't inventing issues; (b) run the *same* fixture that has a violation
  with `a11yAuditEnabled: false` → **zero** a11y findings — proves the finding
  only exists because the audit ran and the real violation is present, not from
  the plumbing. (c) Fix the violation in the fixture (add the alt attribute) and
  re-walk → the previously-recorded rule no longer recurs — proves the check
  tracks the real DOM, not a cached verdict.
- **Failure isolation:** stub `axeScan` to throw → walk completes green, warning
  logged, zero a11y findings.
- **Report:** `gatherWalkReport` returns `a11ySummary` with correct byImpact
  counts; masking test confirms a11y evidence HTML is PII-masked.
- Run `bun test` green before done.

## Phasing (what ships first)

- **Phase 1 (MVP, ships first):** axe injection (`trails-a11y.ts` +
  `BrowserPage.axeScan`), `accessibility` FindingKind + severity map, walk-loop
  wiring behind `a11yAuditEnabled` (default off) with URL-dedupe, findings
  recorded + shown in the walk report + JSON, project toggle. Full test suite
  incl. negative controls.
- **Phase 2:** rendered-pixel contrast pass (Applitools-style) over the step
  screenshot for text-over-image/gradient that axe marks "incomplete"; dashboard
  badge + Slack summary line; MCP/run-API `accessibility` block.
- **Phase 3:** per-project tag configuration UI, opt-in auto-file of `critical`
  a11y findings, trend/regression view ("new since last walk"), and authored-run
  (drive-loop) a11y coverage.

## Effort estimate

- Phase 1: **M** (~2-3 days) — one new module + interface method, a union widen,
  one migration, one report field, and the test matrix.
- Phase 2: **M** — pixel contrast is the real work (screenshot sampling +
  element bbox mapping we partly have via `fingerprint`).
- Phase 3: **S-M**.

## Risks & open questions

- **axe bundle size / injection cost:** `axe.min.js` is ~500KB; `page.evaluate`
  of the source per new URL adds latency. Mitigation: inject once per page
  context via `addInitScript` when a11y is enabled, and URL-dedupe scans.
- **Perf on the 1GB prod box:** axe.run on a heavy DOM can take 1-3s. It runs
  after settle, time-boxed, and only on route changes; a11y must never eat the
  Plan-G walk deadline — budget it separately / skip if the walk deadline is
  near.
- **Contrast false-negatives:** axe's `color-contrast` returns "incomplete" for
  text over images/gradients — Phase 1 will *under*-report contrast (honest, not
  wrong). Phase 2 closes it; the UI honesty note covers the gap meanwhile.
- **Noise:** best-practice rules can be chatty. Default to WCAG A/AA + best
  practice but let projects trim tags (Phase 3); keep a11y advisory (queued) so
  it never blocks a deploy.
- **Version drift:** axe rule IDs/tags change across versions — pin `axe-core`
  and snapshot the rule map in a test.
- **Open:** should a `critical` a11y issue ever be allowed to fail a walk for
  projects that want a hard a11y gate? (Deferred to Phase 3 opt-in.)

## Dependencies on other capabilities

- The walk/authoring engine (`walkTrail`, `authorTrail`) and the Findings
  pipeline (`recordFinding`, findings gate, report) — all present; this builds
  on them.
- Public run API / MCP epic (KLA-550) for the Phase 2 `accessibility` block in
  the run response.
- Screenshot capture (`stepShots`/`screenshotJpeg`) already in the walk — reused
  by Phase 2 rendered-contrast.
