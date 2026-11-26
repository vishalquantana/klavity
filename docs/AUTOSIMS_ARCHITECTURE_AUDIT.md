# AutoSims Architecture Audit (Phase 0, no code changes)

Branch `Balaji_autosim-multiple-inputerror` @ 69551e13. Paths relative to `prototype/`. Line numbers are from this commit.
Method: targeted reads and greps of `lib/trails-author.ts`, `trails-author-model.ts`, `trails-browser-page.ts`, `trails-snapshot.ts`, `trails-crystallize.ts`, `trails-runner.ts`, `trails-browser.ts`, `trails-reaper.ts`, `db.ts`, plus live-run evidence from dev v15–v17 (qa2 PX4). **Not read line-by-line:** the 1,600-line drive loop body, `trails-scheduler.ts`, recording/HAR/report modules. Rows marked *needs investigation* are those gaps.

Headline: **most of the "missing" features already exist in some form** (guards, checkpoints, resume, heartbeat, watchdog, model mix, classification of red causes). The real gaps are narrow: selector strategy (F11), snapshot hang handling (F02/F19), pre-crystallize validation (F07), metrics (F13/F22/F23), and a unified error classifier (F17). Per your rule, nothing below should be rebuilt; only the gaps should be closed.

## 1. Lifecycle as implemented

| # | Stage | Where | Notes |
|---|---|---|---|
| 1 | Request | `server.ts` `POST /api/trails/author` | plan/quota gate, attachments upload |
| 2 | Session init | `createAuthorSession`, `runAuthorNow` (author.ts:1607, 1779) | row in `author_sessions`; author slot |
| 3 | Browser + observe | `acquireBrowser`; `snapshotPatiently` (616) → `krefSnapshot` (cap 24,000 chars, `KREF_SNAPSHOT_CAP`) | 4 attempts × ≤3 s, whole call bounded 15 s |
| 4 | LLM decision | `buildAuthorMessages`, `openRouterAuthorModel`, `selectAuthorWeights` | history = list of all prior actions as text |
| 5 | Action | op handlers in `authorTrail` (~1280–1420) | guards listed under F03/F06 |
| 6 | Result check | no-op/stagnation guard, settle (`POST_ACTION_SETTLE_MS` 4 s), proactive read-back verify | see F05 |
| 7 | Checkpoint | `snapshotCheckpoint` + `saveCheckpoint` per step (1093, ~1510) | stored as `checkpoint_json` |
| 8 | Objective verify | `ObjectiveVerifier` (~1106–1195) | sets `objectiveVerified` |
| 9 | Crystallize | `crystallize()` (now with `retryTransient`) | no quality gate found |
| 10 | Verification Walk | `walkTrail` via `withHeartbeat` pulse (30 s) | |
| 11 | Recovery | reaper 60 s tick / 3 min window; `POST …/resume`; `resumeEligibilityError`, `claimAuthorResumeSession` | |
| 12 | Feedback | `classifyRedCause`, session fields, live SSE, report PDF | |

## 2. Feature classification

Legend: **IMPL** already implemented and working · **PART** partial · **MISS** missing · **UNREL** implemented but unreliable · **PERF** performance bottleneck · **INV** needs investigation.

| ID | Feature | Class | Evidence / gap |
|---|---|---|---|
| F01 | Objective planning | **MISS** | No plan/decompose step exists. The model gets the raw objective every step (`buildAuthorMessages`, `AUTHOR_SYS`). Only `assert` checkpoints (model-authored) mark milestones (model.ts:132). Cost of adding: one extra LLM call per run. |
| F02 | State-aware observation | **PART** | `krefSnapshot` lists interactive elements with refs and handles empty/mid-navigation pages (`recaptureUntilContent`, 8 × 1 s). No region/modal prioritisation, capped by truncation at 24k chars. **UNREL:** `snapshotPatiently` throws "snapshot attempt hung" after ~4 rounds and the outer catch fails the run (seen on dev v17 run 1). |
| F03 | Intelligent action execution | **PART/IMPL** | Implemented: `targetCheck` (label vs element), already-filled field skip via `fieldValue` (~1329), toggle-checkbox skip via `isChecked`/`clickedToggleKeys` (468–470, 1299–1314), select-all rejection. Gap: no general "is this action still needed" check for non-checkbox clicks. |
| F04 | Page readiness | **PART** | `settleNetwork` (Playwright `networkidle`, Puppeteer `waitForNetworkIdle` 500 ms) bounded 4 s after commits; empty-snapshot re-capture. No detection of loading spinners/overlays; the fixed 4 s bound can end before a slow SPA renders. |
| F05 | Action verification | **PART** | Implemented: no-op stagnation guard (~879–936), proactive read-back after a commit that left the DOM unchanged (KLA-786), final `ObjectiveVerifier`. Gap: no per-action expected-outcome check (e.g. "after click, URL/element X changed"); verification is state-diff + final objective. |
| F06 | Duplicate action prevention | **PART** | Implemented: repeated-action guard (`KLA-129`, stalls on N identical actions), `clickedToggleKeys`, `skipRepeatNote`, `unconfirmedCommitPending` persisted in checkpoint, auto-submit suppression while a commit is unconfirmed. Gap: no read-only vs side-effecting classification and no generic "final link already clicked" check; v16 showed the Completed Actions link clicked repeatedly (steps 16–17). |
| F07 | Trail quality validation | **MISS** | After the loop, only `if (!traj.length) stall` (1524) precedes `crystallize`. `objectiveVerified` is stored on the trail but I found **no gate** that blocks or flags an unverified/duplicate/positional-heavy trail. INV: confirm whether the UI surfaces `objective_verified=false`. |
| F08 | Adaptive model routing | **IMPL (limited)** | `selectAuthorWeights`/`isSimpleAuthorStep`/`selectVerifierWeights`, env `KLAV_AUTHOR_MODEL_MIX=1`; fallback model `qwen3-vl`. Off by default; rule is crude (history ≤3, DOM ≤6,000 chars, no cred fields). No deterministic bypass of the LLM. |
| F09 | Incremental DOM snapshots | **MISS** | Every iteration re-captures the whole snapshot; `sha256hex(dom)` is computed per step only for the cache key. No reuse/diff. Risk: correctness cost of stale refs; benefit unmeasured. |
| F10 | Context optimization | **PART/PERF** | History is the full list of prior actions every step (model.ts:165), no windowing/summarisation; DOM is truncated at 24k. Long runs (40 steps) grow the prompt linearly. No baseline token data collected. |
| F11 | Selector optimisation | **PART — main confirmed gap** | `stableSelectorBody` order: id → data-testid → name → aria-label → placeholder → input type → shortest unique `nth-of-type` path. **Missing vs your priority list:** (4) role + accessible name, (7) scoped text. Links/buttons without those attributes fall to positional paths (v17 step 14: `li:nth-of-type(13)>a`, healed in 16 s; company row `tr:nth-of-type(2)>td:nth-of-type(2)>button`). Replay heals via role+name/text/testid/domPath (`resolveTarget`, runner.ts:515–575), so those signals exist at replay but are not used at save time. Fingerprint already stores `role`, `accessibleName`, `text`. |
| F12 | Browser session optimisation | **PART/INV** | Browser per author run and per walk, closed in `closeHandle`; remote Steel via CDP with fallback to `local-fallback`; `walkTrailWithBrowserRetry` retries once. Reuse across runs: not done, and likely unsafe. Leak tests: INV. |
| F13 | Performance monitoring | **PART** | Replay: `durationMs` per step in `evidence_json`, `recordBrowserMinutes`, `autosim_walk` usage meter. Authoring: heartbeat/watchdog stage names only; **no persisted timings** for launch/snapshot/LLM/verify. Walk total is derivable from `trail_runs`. |
| F14 | Structured checkpointing | **IMPL** | `AuthorCheckpoint {traj, history, stepIdx, llmCalls, costUsd, lastUrl, autoAdvanceClicks, unconfirmedCommitPending…}` written each step, bounded by 15 s `SAVE_TIMEOUT_MS`, back-compatible. Gap: write is one blob, no atomicity/version field (INV: partial write on crash). |
| F15 | Recovery reconciliation | **PART** | Resume opens a fresh browser at `lastUrl`, `resumeLostSession` detects bounce to a login page; persisted flags prevent a second save. **Gap:** no check that the previous side-effecting action actually completed in the application (resume just continues from `stepIdx`). |
| F16 | Browser recovery manager | **PART** | Replay: `walkTrailWithBrowserRetry`; acquire retry with jitter; Steel→local fallback. Authoring: browser death → outer catch → stall/failed (no reconnect). |
| F17 | Error classification | **PART** | `FailureKind` (crash/regression), `FailureClass`, `ModelCallError.retryable`, `isTransientNetworkError`, `classifyRedCause` (regex on text). **No single classifier** with a strategy per class; regexes are scattered (RED_*_RE, `isTransientSnapshotError`, `isTransientNetworkError`). |
| F18 | Adaptive retry | **PART** | Present: `withStepRetry` (replay, 2 retries), `retryTransient` (DB writes, 4 tries), model-call retry with backoff (KLA-56), `MAX_CONSECUTIVE_MISSES`. Gap: retry decisions for side-effecting author actions rely on the stagnation guards, not on explicit idempotency classification. |
| F19 | Session lifecycle / heartbeat | **PART — fix partly done** | `last_beat_at` + reaper (3 min). Progress-based heartbeat, step watchdog and `withHeartbeat` (30 s) for the walk were added; `crystallize` now beats. Still: `snapshotPatiently` max wait is not covered by a stall-with-resume path, and the reaper marks `running` rows `failed` (no `stalled`). Sweep only touches `status='running'`. |
| F20 | Concurrency | **IMPL** | Walk pool (`KLAV_WALK_CONCURRENCY`=1), per-project round-robin queue (`KLAV_WALK_QUEUE`=10), author admission, release in `finally` (INV: verify under failures). |
| F21 | Observability | **PART** | Session `steps` log, `stallReason`, SSE live frames, per-step screenshots, `/author/active`. Missing: explicit phase, retry count, recovery status, elapsed in the API. |
| F22 | Authoring analytics | **MISS** | Dashboard only computes finding precision and trail/walk lists. Data to derive success rate exists in `author_sessions` (status, timestamps, llm_calls, cost), so no new table needed. |
| F23 | Selector analytics | **MISS/PART** | `run_steps.tier/healed` and `locator_cache.source` can give heal and cache-hit rates; positional share requires parsing selectors. No endpoint. |
| F24 | Resource management | **PART** | `recordBrowserMinutes`, `ai_calls`/`llm_calls`/`cost_usd`, daily spend reservation. No browser memory/process/context metrics. |
| F25 | Regression framework | **IMPL (large)** | 89 trails/author test files incl. loop-recovery (40 tests), selectors, walk retry, resume, queue. Gaps: no fixture app covering login+table+modal+slow SPA end to end; 8 loop-recovery tests exceed the 5 s default on this machine (pass at 30 s). |

## 3. Confirmed root causes (with evidence)

1. **Positional selectors** — `stableSelectorBody` has no role/name/text tier, so bare links/buttons/cells fall to the `nth-of-type` path (browser-page.ts:518–560). Shortest-suffix (1ad510fa) reduced but cannot remove positional drift. Evidence: v15 93 s vision heal, v17 step 14 heal 16.3 s.
2. **Hung snapshot fails the run** — `snapshotPatiently` throws after ~60 s; the outer catch marks `failed` because it is not classed as transient-stall (v17 run 1, "snapshot attempt hung").
3. **Dropped DB connection lost a finished run** — fixed in 69551e13 (retry + stall instead of fail). Verified by unit test, **not yet seen on dev** (v17 rerun had no network error).
4. **Duplicate final action** — model re-clicks the last link; repeated-action guard only trips on identical consecutive actions with no state change (v16 steps 16–17). No "goal already met" short-circuit after `objectiveVerified`.
5. **Slow cache-tier step (~90 s, v17 step 8)** — **cause unknown**. Candidates: page/network slowness on qa2, `roleConsistent` waits, actionability wait on an overlay. Needs per-step timing breakdown (F13) before any fix.
6. **Steel unreachable from dev** — all dev replays are `local-fallback`; cause (network/credentials/region) unknown; no server log access from here.

## 4. Impact summary

| Issue | Reliability | Time | Side effects on QA data |
|---|---|---|---|
| Positional selectors | amber/red replays | +16–93 s per heal (vision tier) | none |
| Hung snapshot | run fails (non-resumable currently) | lost run (~4–5 min) | may leave a record half-completed |
| Duplicate final action | extra steps in trail, fragile replay | +steps | a repeated Save could complete a second record |
| No quality gate | incomplete trail looks successful | — | — |
| No metrics | blind tuning | — | — |

## 5. Recommended implementation order (smallest safe increments)

| # | Increment | Features | Complexity | Notes |
|---|---|---|---|---|
| 1 | Text/role-name selector tier for links, buttons, row buttons with visible text, validated for uniqueness, kept in `stableSelectorBody` before the positional path; positional selectors flagged in the step | F11 (F23 data) | S–M | Pure browser-side function, testable with existing real-browser tests (`KLAV_E2E=1`). No migration. Back-compat: existing trails untouched. |
| 2 | Snapshot hang: wait longer with heartbeat, then **stall with Resume** (not fail) | F02, F19, F18 | S | Reuses `stall()` and the transient path already added. |
| 3 | Pre-crystallize validation: flag (not block) duplicate consecutive steps, positional-only targets, unverified objective; surface in session `stallReason`/trail status | F07 | M | Needs your decision: block vs flag (see §6). |
| 4 | Stop after objective verified: ignore further clicks once `objectiveVerified` and the last action is a nav link | F06 | S–M | Touches drive loop; needs careful tests. |
| 5 | Authoring timing metrics into `steps_json`/log (no schema change) + derived analytics endpoint | F13, F22, F23 | M | Required before claiming any performance improvement. |
| 6 | Central error classifier (`classifyAuthorError` → {transient, retry, stall, fail}) replacing scattered regexes | F17, F18 | M | Refactor limited to author.ts/crystallize.ts. |
| 7 | Resume reconciliation: before continuing, compare current page to expected state of the last step | F15 | L | Highest risk; depends on 4 and 6. |
| 8 | Planning step | F01 | M–L | Design decision needed (cost, prompt change). Defer. |
| 9 | Incremental snapshots, context windowing | F09, F10 | M–L | Only with baseline metrics from #5. Defer. |

Dependencies: 5 before 8/9; 6 before 7; 2 before 7.

## 6. Decisions I need from you

1. **F07:** block crystallization of unverified/duplicate-step trails, or save as draft with a visible warning? (I recommend flag + draft, because blocking loses the run.)
2. **F01/F09/F10:** accept deferral until timing/token baselines exist?
3. **QA data:** each authoring + replay run on qa2 completes real records. Every verification of increments 1–4 on dev costs actions. How many may I use, and should I prefer local fixture tests first? (I recommend fixture tests first, dev only to confirm.)
4. **Docs:** you listed five deliverables; this is #1. Create the other four now or per increment? (I recommend per increment, to avoid empty files.)

## 7. Risks

- Drive loop is ~1,200 lines of interacting guards (KLA-129, KLA-786 rounds); changes to F06/F05 can regress login or save flows. Mitigation: add the failing test first; run the 40 loop-recovery tests with `--timeout 30000`.
- Selector change affects only newly authored trails; old trails keep working. Replay uses cache → candidate → vision, so a new selector form must remain resolvable by `resolveTarget` (check `roleConsistent`).
- Unverified: whether 69551e13's retry/stall path works against the real flaky dev DB.

## 8. Tests required (by increment)

1: real-browser tests for link/button/row-button selectors across repeated lists, shifted body-level nodes, hidden duplicates. 2: loop-recovery test with a hanging `krefSnapshot` → stall, resume succeeds. 3: unit tests on a pure `validateTrajectory`. 4: loop test where model clicks again after verified objective. 5: unit tests on metric aggregation. 6: table-driven classifier tests. 7: resume tests with a fake page state.
