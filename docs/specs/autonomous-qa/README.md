# Autonomous QA — Epic Overview

**North star:** turn AutoSim from an *objective-driven Trail runner* into a
**fully-autonomous, all-bug-catching AI QA agent** — point it at an app (a URL,
optional creds) and it maps the app, exercises real flows, and files grounded,
deduped, severity-scored bugs with zero authored tests. Everything here composes
toward two JTBD complaints we exist to kill: *"I told you about this multiple
times"* (lost reports) and *"you fixed it and it broke again"* (regressions).

Today AutoSim can only test a flow **someone wrote a Trail for**. This epic
removes that ceiling along five axes at once:

1. **Observe** real usage instead of only authored objectives
   (continuous session capture → derive Trails).
2. **Explore** the whole app goal-free, not just authored paths
   (invariant explorer + LLM state exploration + form-fuzz).
3. **Assert without authored checkpoints** (deterministic base-vs-head diffing,
   visual-regression baselines) so *any* divergence is caught.
4. **Cover new bug classes cheaply** (WCAG/a11y, visual regression) at
   near-zero marginal cost per walk.
5. **Stay trustworthy at scale** (gated self-healing, root-cause clustering,
   flake analytics/quarantine, per-run test-data isolation, CI/PR gating).

The unifying design principle across every spec: **reuse the existing seams,
don't duplicate them.** The browser/Steel CDP seam (`acquireWalkBrowser`), the
kref semantic snapshot (`captureKrefSnapshot`), the findings pipeline
(`recordFinding` → dedup → severity → `decideFindingAction` → filer), the walk
report, the `/api/v1/runs` + MCP surface, the rrweb capture stack, and the
gzip+S3 replay store are all load-bearing and shared. New capabilities plug into
them so a bug found by *any* mode lands in the *same* review queue.

---

## Capability map

| # | Workstream | What it adds toward the north star |
|---|-----------|-------------------------------------|
| 1 | **session-record-replay** | Persist real rrweb sessions continuously (not just at bug-submit) → derive replayable draft Trails → deterministic replay engine → base-vs-head assertion-free diffing + CI gate. Coverage becomes *observed*, not just authored. |
| 2 | **autonomous-exploration** | Goal-free Explorer over the same-origin link graph → LLM state exploration + form-fuzz with a structural state frontier → discovered flows promotable to scheduled Trails. Whole-app QA before any Trail exists. |
| 3 | **accessibility-wcag-audit** | axe-core scan once per unique page during walks → `accessibility` Finding kind → report/dashboard/API summary. High-value, legally-relevant, deterministic, near-zero marginal cost. |
| 4 | **visual-regression-baseline-diffing** | Baseline store + perceptual pixel diff engine — catches visual drift with no authored assertion. |
| 5 | **autosim-maintenance-intelligence** | Human-approval-gated healing (real-vs-cosmetic classifier) + root-cause clustering on *every* red + flake analytics/auto-retry/quarantine. Keeps signal trustworthy as coverage explodes. |
| 6 | **test-data-management** | Per-run fixture sets + deterministic synthetic generation seeded by runId + HTTP/SQL seed/reset hooks + isolation namespace + ephemeral inbox/OTP. Removes the single biggest source of false reds. |
| 7 | **cicd-pr-gating** | Per-PR batch runs with git provenance over `/api/ci` + `/api/v1/runs`. Makes AutoSim a merge gate, not just a monitor. |
| 8 | **requirements-to-tests** | (Spec present, ticket set still a stub) NL requirement → generated Trail/checkpoint. The "author from intent" complement to "observe/explore". |

Grouping by role in the QA loop:

- **Generate coverage:** session-record-replay (observe), autonomous-exploration
  (explore), requirements-to-tests (intent).
- **Assert / oracle:** deterministic diff (session-record-replay P2/P3),
  visual-regression, accessibility.
- **Trust & operate at scale:** maintenance-intelligence, test-data-management,
  cicd-pr-gating.

---

## Dependency-ordered roadmap (reconciled into one sequence)

The per-ticket `phase` hints are *within-workstream*. Reconciled across all
eight workstreams into three global phases by **(a) dependency edges and (b)
signal-per-unit-effort**:

### Phase 1 — Foundation (ship coverage + protect signal)
Everything with no cross-workstream prerequisite, plus the two "root" tickets
that unblock long chains. This phase makes AutoSim catch materially more bugs
*and* stops it from lying to itself.

- **a11y axe-core scan** (accessibility P1) — no deps, cheap, new bug class.
- **Invariant Explorer** (exploration P1) — goal-free whole-app coverage today.
- **Gated healing + change classifier** (maintenance P1) — stops silent
  regression-masking; a data-integrity prerequisite before we scale coverage.
- **Root-cause classification + clustering on every red** (maintenance P1) —
  cheap adapter over the existing classifier; feeds Phase-2 flake/quarantine.
- **Continuous session capture** (session P1) — the *root* of the entire
  record/replay/diff chain; three downstream tickets block on it.
- **Fixture model + lifecycle hooks + isolation namespace** (test-data P1, XL)
  and **HTTP seed/reset + placeholder resolution** (test-data P1) — removes the
  #1 cause of false reds; the explorer and derived Trails need reproducible
  state to be trustworthy.
- **Baseline store + diff engine** (visual-regression P1) — the pixel oracle
  primitive reused by deterministic diffing.
- **CI batch runs with provenance** (cicd P1) — makes any of the above gate a PR.

**Rationale:** Phase 1 is deliberately *coverage + trust*, not the deterministic
replay engine. The engine is high-value but deep; shipping a11y + explorer +
gated healing first gives immediate bug-catching lift on the existing walk
pipeline while the session-capture root matures.

### Phase 2 — Mid (turn observation into replayable, deduped assets)
Depends on Phase-1 roots.

- **Derive draft Trails from sessions** (session P1-within, global P2) — needs
  continuous capture.
- **Deterministic replay engine** (session P2) — needs capture + derivation.
- **LLM state exploration + form-fuzz** (exploration P2) — needs the explorer.
- **Flake analytics + auto-retry + quarantine** (maintenance P2) — needs
  root-cause classification.
- **a11y report/dashboard/API surface** (accessibility P2) — needs the scan.
- **Fixtures CRUD + trigger binding + report surfacing** (test-data P2).

### Phase 3 — Advanced (assertion-free oracle + durable discovered value)
The payoff tier: catch *unasserted* regressions and make exploration
self-sustaining.

- **Base-vs-head assertion-free diffing + CI gate + MCP run kind**
  (session P3) — needs the deterministic engine + visual diff.
- **Discovered flows → promotable Trails + scheduled explorer** (exploration P3).
- **Ephemeral inbox/OTP + gated SQL seeding** (test-data P3).

---

## Ticket summary

| Workstream | Ticket | Effort | Phase* | Priority |
|-----------|--------|--------|--------|----------|
| requirements-to-tests | T1 (stub) | L | 1 | high |
| session-record-replay | Continuous real-user session capture + streaming ingest/storage | L | 1 | high |
| session-record-replay | Derive draft Trails from recorded sessions via crystallize | L | 2 | high |
| session-record-replay | Deterministic replay engine (event scheduling + network mock + per-event snapshot) | L | 2 | medium |
| session-record-replay | Base-vs-head assertion-free diffing + CI gate + MCP run kind | L | 3 | medium |
| autonomous-exploration | Invariant Explorer over the same-origin link graph | L | 1 | high |
| autonomous-exploration | LLM state exploration + form-fuzz with a structural state frontier | L | 2 | medium |
| autonomous-exploration | Discovered flows → promotable suggested Trails + scheduled explorer runs | M | 3 | medium |
| visual-regression-baseline-diffing | Baseline store and diff engine | L | 1 | high |
| accessibility-wcag-audit | axe-core scan + accessibility Finding kind wired into the walk | M | 1 | high |
| accessibility-wcag-audit | Accessibility summary in walk report, dashboard, public run API/MCP | M | 2 | medium |
| autosim-maintenance-intelligence | Human-approval-gated locator healing with real-vs-cosmetic classification | M | 1 | high |
| autosim-maintenance-intelligence | Root-cause classification and clustering on every walk red | M | 1 | high |
| autosim-maintenance-intelligence | Flake analytics, transient-red auto-retry, and quarantine | L | 2 | medium |
| cicd-pr-gating | CI batch runs with provenance | L | 1 | high |
| test-data-management | Fixture-set model, per-run lifecycle hooks, isolation namespace | XL | 1 | high |
| test-data-management | Fixture placeholder resolution + HTTP seed/reset datasource | L | 1 | high |
| test-data-management | Fixtures CRUD, trigger binding, walk-report surfacing | M | 2 | medium |
| test-data-management | Ephemeral inbox/OTP + gated SQL seeding with light TDM | L | 3 | medium |

\* *Phase = the reconciled global phase above, not the raw within-workstream hint.*

---

## What to build FIRST (and why)

Ordered by leverage = *(unblocks-others × signal) ÷ effort*:

1. **axe-core scan + accessibility Finding kind** (accessibility P1, M) —
   *cheapest high-signal.* No new browser/LLM calls, no new deps beyond bundled
   axe-core, reuses the role/accName we already compute and the whole findings
   pipeline. Default-off, advisory (never reddens a walk), so zero risk to
   existing runs. Ships a whole legally-relevant bug class in one M ticket.

2. **Invariant Explorer over the link graph** (exploration P1, L) —
   *highest coverage unlock.* Turns AutoSim from "tests authored Trails" into
   "QAs the whole app" using only building blocks that already exist
   (`sameOriginCrawlTargets`, `WalkEvidenceCollector`, `brokenLinkFindings`,
   `recordFinding`). Catches 500s/broken links/console errors on pages nobody
   ever wrote a Trail for — the exact gaps behind "you broke it again."

3. **Gated healing + real-vs-cosmetic classifier** (maintenance P1, M) —
   *protects the integrity of everything else.* Before we multiply coverage we
   must stop the existing unconditional heal from silently re-pointing onto a
   look-alike element and masking a real regression. Pure-module classifier +
   one branch in `runOneStep`; negative control proves auto-mode stays
   byte-identical to today.

4. **Continuous real-user session capture** (session P1, L) — *the root that
   unblocks the longest chain* (derive → deterministic replay → base-vs-head
   diff). Start it early so the deterministic-diff payoff in Phase 3 isn't
   gated on a late start. Builds directly on the existing rrweb + gzip/S3 stack.

5. **Root-cause classification + clustering on every red** (maintenance P1, M) —
   *cheap adapter, compounding value.* Wraps the existing `classifyRedCause`
   onto scheduled/manual reds and clusters recurring breaks; it's the
   prerequisite for Phase-2 flake/auto-retry/quarantine and immediately makes
   red triage far cheaper.

Start these five in parallel across worktrees (disjoint files, per the workspace
worker rules). The two test-data Phase-1 tickets and the visual-baseline +
CI-provenance tickets follow immediately behind, since Phase-2/3 assertion-free
diffing and trustworthy exploration depend on reproducible data and a pixel
oracle.
