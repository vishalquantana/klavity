# Test-Maintenance Intelligence: Gated Healing, Flake Analytics, Root-Cause Triage

Checklist items **16, 17, 18** of the Autonomous-QA program.

## Problem & user value

AutoSim already self-heals locators and runs Trails on a schedule, but the
"keep the suite honest over time" layer is thin:

1. **Healing is silent and unconditional.** When `runOneStep` heals a locator it
   writes the new selector straight into `locator_cache` (`source:"heal"`) on the
   very next line after computing the diff (`prototype/lib/trails-runner.ts:1601-1619`).
   The reviewable `from→to` diff is stored in run-step evidence, but nobody has to
   approve it, and a heal that quietly re-points a "Delete account" button onto a
   look-alike element can **mask a real regression** — the exact failure mode Autify
   and Testsigma call out. There is no "real change vs cosmetic change" signal.
2. **No flake analytics.** `listTrailRunHistory` (`prototype/lib/trails.ts:469-494`)
   lists the last N runs, but nothing computes a flakiness rate per trail/step, there
   is no auto-retry-on-transient-red policy, and no way to quarantine a chronically
   flaky Trail so it stops paging the team. The scheduler retry queue
   (`prototype/lib/trails-scheduler.ts:248-293`) only retries a *busy slot*, never a
   red result.
3. **Reds are not triaged or clustered.** `classifyRedCause`
   (`prototype/lib/trails-author.ts:172-230`) already labels a red as
   `selector-drift | state-dependence | timing-flake | unknown` with an explanation
   and remedy — but it is wired **only** at authoring-time verification
   (`authorTrail`, line 1273). Scheduled/manual walk reds get a raw reason string and
   nothing else. There is no grouping of many reds by shared cause, no dedupe of "same
   break seen 12 times", and no link to the likely offending change.

User value: cut Trail-maintenance toil to near-zero, stop false-green heals from
hiding bugs, and turn a wall of red runs into a short ranked list of "here are the 3
things actually broken, here's the likely cause, approve these 5 safe heals."

## Goals / Non-goals

**Goals**
- Human-approval-gated healing with a **real-vs-cosmetic change classification** and an
  approve/reject flow that only then writes to `locator_cache`.
- Flakiness rate per trail and per step over a rolling window, an **auto-retry policy**
  for transient reds, and **quarantine** of chronically flaky Trails.
- Run-level **root-cause classification on every red** (reuse `classifyRedCause`),
  **clustering** of reds by shared cause + dedupe, and a link to the likely change
  (deploy/version correlation).

**Non-goals**
- Rewriting the healing tiers in `resolveTarget` — we build *on* the existing
  Tier-0/1/2 ladder, not replace it.
- Changing how Findings are filed to Plane/Jira (the `findings` table + connector path
  stay as-is; clustering is a read/rollup layer + a new reds table).
- Auto-fixing application code. We link a red cluster to a likely change; we do not
  patch the product.
- ML models. Classification stays deterministic/rule-based (+ optional LLM re-rank
  later), matching the existing `classifyRedCause` design.

## Competitor benchmark (concrete mechanics)

- **Testsigma** runs two agents: a *Healer* fixes locators at runtime, and every healed
  step lands in **Auto-Heal Insights** showing *which element changed and how the locator
  was updated*; a tester clicks **Update** to make it permanent or leaves it as a one-time
  fix — **nothing is overwritten without someone seeing it first**. Their *Analyzer* agent
  classifies each failure as *real defect / flaky / environment* before a human opens a log,
  producing a sorted breakdown instead of 40 raw reports.
- **Autify "Fix with AI"** deliberately lets you decide **after** the run whether to apply
  the AI-suggested fix, precisely because "automated healing can mask application changes
  that teams should know about." This is our design north star for item 16.
- **Mabl Auto-TFA** sends the failed run output to an LLM that returns a suggested failure
  reason *the instant you land on the run*, classifies (bug / flake / env / locator drift),
  **clusters related failures by root cause**, and collects DOM snapshot + HAR + perf trace
  at every step to accelerate MTTR. This is our north star for items 17/18.

Net: gate the write (Autify/Testsigma), classify + cluster every red (Mabl/Testsigma),
show the element diff (Testsigma), and quarantine the noisy ones.

Sources: [Testsigma auto-healing](https://testsigma.com/docs/auto-healing/intro/),
[Autify self-healing](https://autify.com/blog/self-healing-test-automation),
[mabl Auto-TFA](https://help.mabl.com/hc/en-us/articles/33764838012692-Auto-TFA-Use-generative-AI-to-review-failed-runs),
[mabl auto-heal](https://help.mabl.com/hc/en-us/articles/19078583792404-How-auto-heal-works).

## Current state in our codebase

| Concern | Where it lives today | Gap |
|---|---|---|
| Healing tiers | `resolveTarget` `prototype/lib/trails-runner.ts:495-561` (Tier 0 cache → Tier 1 role/text/testid/domPath candidates → Tier 2 `runVisionTier2` L1656-1872) | none — reuse; `candidateSignal` already tells us which signal matched |
| Heal write-back | `runOneStep` `prototype/lib/trails-runner.ts:1601-1619` → `upsertLocatorCache(...source:"heal")` `prototype/lib/trails.ts:188-206` | **unconditional**; no approval, no change-class |
| Reviewable diff | run-step `evidence_json` `{healed, fromSelector, toSelector, tier, confidence, candidateSignal}` L1626-1634 | data exists but is display-only; heal already landed in cache |
| Locator cache | table `locator_cache` `prototype/lib/db.ts:609-621`, unique `(project_id, step_id)`; `LocatorCacheRow` `prototype/lib/trails-types.ts:115-119` | need a *pending* holding area distinct from the live cache |
| Run history | `trail_runs`/`run_steps` `prototype/lib/db.ts:626-653`; `listTrailRunHistory` `prototype/lib/trails.ts:469-494`; retention `pruneRunHistory` `prototype/lib/trails-run-retention.ts:40-113` | no flake rate, no retry, no quarantine columns |
| Red classification | `classifyRedCause` `prototype/lib/trails-author.ts:172-230`, `RedCauseDiagnosis` L131-141, `RedCauseWalkInput` L144-154 | only called at authoring verification (`authorTrail` L1273), never on walk reds |
| Finding dedup/recurrence | `recordFinding` `prototype/lib/trails.ts:514-591` (content_sig + `dedup_key` + `recurrence`), gate `maybeAutoFileWalkFindings` `prototype/lib/trails-findings-gate.ts:118-141` | clusters *findings*, not run-level reds by cause |
| Walk finalize + alert | `walkTrail`/`finishWalk` `prototype/lib/trails-runner.ts:699-1123`, `runWalkNow` `prototype/lib/trails-trigger.ts:92-175`, `notifyWalkRed`/`buildWalkRedSlackPayload` `prototype/lib/walk-red-alert.ts:109-145` | red reasons only; no cause persisted, no quarantine suppression |
| Report data | `gatherWalkReport` `prototype/lib/trails-report.ts:31-85` (`WalkReportData` = trail/walk/steps/findings/judgment) | no pending-heals, no flake/cluster surfaces |
| Scheduler | `tickScheduler` `prototype/lib/trails-scheduler.ts:248-293` (retry queue for *busy* only) | no auto-retry on flaky red |

## Proposed architecture

Three coherent additions that share the run history and the existing classifier.

### Item 16 — Gated self-healing

New module `prototype/lib/heal-change-class.ts`:
```ts
export type HealChangeClass = "cosmetic" | "structural" | "semantic-risk"
// Pure, deterministic. Mirrors resolveTarget's candidateSignal + fingerprint deltas.
export function classifyHealChange(input: {
  fromSelector: string | null
  toSelector: string
  fromFingerprint: Fingerprint | null
  toFingerprint: Fingerprint | null
  candidateSignal?: "role+name" | "text" | "testid" | "domPath" | "vision"
  tier: "cache" | "candidate" | "vision"
}): { cls: HealChangeClass; rationale: string }
```
Rules (ground in `resolveTarget`): same `role` **and** same `accessibleName` and only the
concrete selector/id/class changed → `cosmetic` (safe, the element is the same thing);
`domPath`-only re-anchor with unchanged role → `structural`; **role or accessibleName
changed, or Tier-2 vision heal** → `semantic-risk` (likely a real change — the thing we
must not auto-apply, per Autify).

New table `locator_heals` (proposed heals awaiting decision), created in `applySchema`
`prototype/lib/db.ts` next to `locator_cache`:
```
locator_heals(
  id TEXT PK, project_id, trail_id, step_id, run_id,
  from_selector TEXT, to_selector TEXT NOT NULL,
  from_fingerprint_json TEXT, to_fingerprint_json TEXT,
  tier TEXT, candidate_signal TEXT, confidence REAL,
  change_class TEXT NOT NULL,          -- cosmetic | structural | semantic-risk
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected | auto_applied | superseded
  decided_by TEXT, decided_at INTEGER, created_at INTEGER NOT NULL )
UNIQUE(project_id, step_id, to_selector)   -- collapse the same proposed heal across reruns
```
Change `runOneStep` (`prototype/lib/trails-runner.ts:1608-1619`): the healed-and-selector
branch reads a new project setting `autosimHealMode` (`'auto' | 'gated'`, default `'auto'`
to preserve today's behavior). When `gated`, **record a `locator_heals` row instead of
calling `upsertLocatorCache`** — the cache is untouched, the step stays AMBER, and the next
walk deterministically re-heals to the *same* selector (idempotent via the UNIQUE key) until
someone decides. When `auto`, keep the existing upsert **and** additionally log a
`locator_heals` row with `status='auto_applied'` so the Auto-Heal Insights view is complete
either way. `semantic-risk` heals are always held for review even in `auto` mode and
optionally raise a `finding` (kind `heal-masked-change`) so a masked bug surfaces.

New helpers in `prototype/lib/trails.ts` beside `upsertLocatorCache`:
`listPendingHeals(projectId, {trailId?})`, `getHeal(projectId, id)`,
`decideHeal(projectId, id, 'approved'|'rejected', by)`. `approved` → `upsertLocatorCache(...source:"heal")`
with the stored selector/fingerprint, then mark row `approved`. `rejected` → mark rejected;
if `change_class==='semantic-risk'`, spawn a `recordFinding` regression so the real break is
tracked.

### Item 17 — Flake analytics + auto-retry + quarantine

New module `prototype/lib/trails-flake.ts`:
```ts
export async function computeTrailFlakiness(projectId, trailId, windowN = 20): Promise<{
  trailFlakeRate: number; runs: number; reds: number; healRuns: number
  perStep: Array<{ stepId: string; idx: number; reds: number; heals: number; flakeRate: number }>
}>
```
computed over `trail_runs` + `run_steps` (join on `run_id`, read `verdict`/`healed`).
"Flake" = a step that healed, or a run that went red with cause `timing-flake`, or a
red→green verdict flip within the window with no intervening trail edit.

New rollup table `trail_flake_stats(project_id, trail_id, window, runs, reds, flakes,
flake_rate REAL, quarantined INTEGER DEFAULT 0, quarantine_reason TEXT, updated_at)` refreshed
at the end of `finishWalk`. Add columns to `trails` (via `applySchema` ALTER path):
`quarantined INTEGER DEFAULT 0`, `auto_retry INTEGER DEFAULT 1`.

**Auto-retry**: in `runWalkNow` (`prototype/lib/trails-trigger.ts:92-175`), after the walk
returns `red`, if the persisted red cause (item 18) is `timing-flake` and `trail.auto_retry`
and the run wasn't already a retry, launch exactly one re-walk before finalizing/alerting;
if the retry is green, finalize green and mark the original as `flaked`. This is the
`re-verify once` remedy `classifyRedCause` already recommends, made automatic.

**Quarantine**: a Trail auto-quarantines when `flake_rate` exceeds a threshold (default 0.4
over the window) or can be toggled manually. A quarantined Trail still runs, but
`notifyWalkRed` (`prototype/lib/walk-red-alert.ts`) suppresses the page for its reds (routes
to a digest instead), `maybeAutoFileWalkFindings` skips auto-file, and its reds are excluded
from any "suite green" rollup. Enforced at those three call sites (single predicate
`isQuarantined(trail)`).

### Item 18 — Root-cause triage clustering

**Classify every red**: `RedCauseWalkInput` (`trails-author.ts:144-154`) is already
structurally satisfiable from `run_steps` (`{idx, verdict, healed, failureKind}`) + the walk
`summary_json.reasons`/evidence. Add a thin adapter `classifyWalkRedCause(projectId, runId)`
in a new `prototype/lib/trails-red-triage.ts` that loads the run + steps and calls the
existing `classifyRedCause`. Call it from `finishWalk` when status is red and persist onto
`trail_runs` via new columns `red_cause_kind TEXT, red_cause_step_id TEXT, red_cause_json TEXT`
(ALTER in `applySchema`). This makes the diagnosis a first-class run attribute, not an
authoring-only artifact.

**Cluster + dedupe**: `redClusterKey(diagnosis, trailId, stepId, normalizedErrorSig)` (hash of
`kind|trailId|failing-step|first-error-line-normalized`) — reuse the normalization approach in
`recordFinding`'s content-sig dedup. New table
`red_clusters(id, project_id, cluster_key UNIQUE(project_id,cluster_key), trail_id, step_id,
kind, title, explanation, remedy, first_run_id, first_seen_at, last_run_id, last_seen_at,
occurrences INTEGER DEFAULT 1, status TEXT DEFAULT 'open')`. On each red, upsert the cluster
(occurrences+1, last_seen), mirroring the `ON CONFLICT ... recurrence+1` pattern in
`recordFinding`.

**Link to likely change**: store the served version/commit at `first_seen_at` (we already
stamp a version per deploy) so a cluster shows "first appeared in run X around <deploy time /
version>", giving the human the probable offending change. Surface `first_seen`→`last_seen`
window + occurrences.

## Data-model changes

All additive; greenfield tables via `CREATE TABLE IF NOT EXISTS` in `applySchema`, new columns
via the existing idempotent ALTER/migration path in `prototype/lib/db.ts`.

- **New** `locator_heals` (item 16) — schema above.
- **New** `trail_flake_stats` (item 17) — schema above.
- **New** `red_clusters` (item 18) — schema above.
- **ALTER `trails`**: `quarantined INTEGER DEFAULT 0`, `auto_retry INTEGER DEFAULT 1`.
- **ALTER `trail_runs`**: `red_cause_kind TEXT`, `red_cause_step_id TEXT`, `red_cause_json TEXT`,
  `retry_of TEXT` (nullable → original run id when this run is an auto-retry).
- **ALTER `projects`**: `autosim_heal_mode TEXT DEFAULT 'auto'`.
- Wire all three new tables into `pruneRunHistory` (`prototype/lib/trails-run-retention.ts`)
  so retention cascades (delete `locator_heals`/`red_clusters` rows for pruned runs;
  `trail_flake_stats` is a rollup, recomputed).

## API / MCP / CLI surface

Add to the Trails HTTP routes in `prototype/server.ts` (project-scoped, IDOR-guarded like
`gatherWalkReport`):
- `GET /api/trails/:trailId/heals?status=pending` → pending/auto-applied heals with diff +
  `change_class`.
- `POST /api/trails/:trailId/heals/:healId/decision` `{decision:'approve'|'reject'}` →
  `decideHeal`.
- `GET /api/trails/:trailId/flake` → `computeTrailFlakiness` + quarantine state.
- `POST /api/trails/:trailId/quarantine` `{quarantined:boolean}`.
- `GET /api/projects/:projectId/red-clusters?status=open` → ranked clusters.
- Extend the walk-report payload (`gatherWalkReport`) with `pendingHeals` + `redCause`.

MCP/CLI: extend the existing `/api/v1/runs` surface (public API epic) with read-only
`red_cause` + `flake_rate` fields on a run, and an MCP tool `autosim_review_heals` (list +
approve) so an agent can drive maintenance. Follows the single-source `lib/openapi.ts` +
drift-test convention.

## UX / reporting

- **Auto-Heal Insights** panel on the walk report (extends the report page fed by
  `gatherWalkReport`): each healed step shows the `from→to` selector diff (already in
  evidence), the `change_class` badge (cosmetic/structural/semantic-risk), confidence, and
  **Approve / Reject** buttons for gated heals. Optimistic save (per the standing UX rule),
  white card on beige, button micro-animations.
- **Flake dashboard** per Trail: flakiness rate, sparkline over the window, per-step flake
  table, quarantine toggle + reason.
- **Red-cluster triage view** per project: ranked list (occurrences × severity), each row =
  cause badge + one-line `explanation` + `remedy` (straight from `RedCauseDiagnosis`) +
  first-seen version link + affected runs. Dedup collapses N reds into one row.
- Quarantined Trail reds go to a **digest** (batched Slack section via
  `buildWalkRedSlackPayload`), not an individual page.

## Acceptance criteria

- With `autosimHealMode='gated'`, a healed step does **not** mutate `locator_cache`; a
  `locator_heals` row is created `pending`; approving it writes the selector via
  `upsertLocatorCache(source:"heal")` and a rejolt walk is Tier-0 green; rejecting leaves the
  cache untouched.
- `classifyHealChange` labels a role+name-preserving id swap `cosmetic`, a domPath re-anchor
  `structural`, and a role/accName change or vision heal `semantic-risk`; semantic-risk heals
  are held for review even in `auto` mode.
- `computeTrailFlakiness` returns correct per-trail/per-step rates over a known fixture of
  runs; a Trail crossing the threshold auto-quarantines and its subsequent reds are suppressed
  from paging + auto-file.
- A red walk with a transient cause and `auto_retry` on triggers exactly one re-walk; a green
  retry finalizes green with the original marked `flaked`; a second red finalizes red.
- Every red walk persists `red_cause_kind` on `trail_runs`; repeated identical reds collapse
  into one `red_clusters` row with `occurrences` incrementing; the cluster shows first-seen
  version.
- All new tables are covered by `pruneRunHistory`.

## Test plan (incl. negative control)

Bun unit/integration tests under `prototype/`, mirroring existing `trails*.test.ts`:
- `heal-change-class.test.ts` — pure classifier truth table.
- `trails-gated-heal.test.ts` — gated mode: assert `locator_cache` is **unchanged** after a
  heal and one `locator_heals` pending row exists; approve → cache updated; reject → not.
- `trails-flake.test.ts` — flake-rate math over seeded `trail_runs`/`run_steps`; quarantine
  threshold crossing.
- `trails-auto-retry.test.ts` — inject a walk fn that returns red-then-green; assert exactly
  one retry and green finalize; inject red-then-red; assert no infinite loop.
- `trails-red-triage.test.ts` — classify a seeded red run; assert cluster upsert dedupes.
- **Negative control (per the QA rule):** run the *same* suite with the feature OFF
  (`autosimHealMode='auto'`, auto-retry off, quarantine off) and assert behavior is
  byte-identical to today — cache still upserts on heal, reds still page, no retry — proving
  the tests exercise the new gate rather than passing vacuously. Second negative control:
  a **semantic-risk heal that masks a genuine regression** must produce a `heal-masked-change`
  finding and NOT be auto-applied; assert the test fails if the change-class guard is removed.
- Relevant e2e in `journey/` for the report Approve/Reject flow.

## Phasing

1. **Phase 1 (ships first):** Item 18 classify-every-red + persist `red_cause_*` on
   `trail_runs` (smallest, reuses `classifyRedCause` wholesale, immediate triage value) and
   Item 16 gated healing (highest-risk gap — silent masking). These unlock the report UX.
2. **Phase 2:** Item 17 flake analytics + auto-retry + quarantine (depends on red causes from
   Phase 1 to distinguish flake from real).
3. **Phase 3:** Red-cluster dedupe table + triage dashboard + version-linking + MCP
   `autosim_review_heals` tool.

## Effort estimate

- Item 16 gated healing: **M** (new table + `runOneStep` branch + classifier + 2 routes + UI).
- Item 17 flake/retry/quarantine: **L** (rollup + retry control-flow in `runWalkNow` + 3
  suppression call sites + dashboard).
- Item 18 classify + cluster: **M** (adapter is thin; cluster table + dashboard is the bulk).
- Total ≈ **L–XL** across three tickets.

## Risks & open questions

- **Auto-retry doubles COGS** on genuinely-red runs. Mitigate: retry only for
  `timing-flake` cause, cap at one, honor the per-walk deadline + Snap-only gating already in
  `runWalkNow`.
- **Gated mode can stall a Trail** if heals pile up unreviewed (every walk stays AMBER).
  Mitigate: digest reminder + optional "auto-approve cosmetic, gate semantic-risk" middle mode.
- **Retry re-entrancy vs the walk slot** (`withWalkSlot`) — the retry must reuse the slot,
  not deadlock. Decide: retry inside the same `slotHeld` closure.
- Version/commit at first-seen: confirm the served version is queryable at walk time (we stamp
  `/api/version`), else store the run's started_at only.
- Cluster key normalization must not over-merge distinct bugs (mirror `recordFinding`
  content-sig care).

## Dependencies on other capabilities

- Reuses **`classifyRedCause`** (item 18 core) and the **healing tiers** in `resolveTarget`.
- Shares the **run history** schema with retention (`pruneRunHistory`) and the walk-report
  pipeline (`gatherWalkReport`).
- MCP/CLI surface piggybacks on the **Public API + MCP** epic (`/api/v1/runs`, `lib/openapi.ts`).
- Digest alerting builds on **walk-red alert** (`walk-red-alert.ts`).
- Quarantine interacts with **scheduler** (`tickScheduler`) and **findings gate**
  (`maybeAutoFileWalkFindings`).
