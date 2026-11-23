# AutoSims Implementation Status (audit only, no production changes)

Date: 2026-11-20. Branch `Balaji_autosim-multiple-inputerror` @ `b0b5a7bb` (includes the re-applied Increment 1, F11). Paths are relative to `prototype/` unless stated.
Nothing was committed, pushed, or changed in production code. No QA2 or other live environment was touched. The only files created are this report (and scratch output outside the repo).

## 0. How to read this report (evidence levels)

| Tag | Meaning |
|---|---|
| **[CODE]** | Read in the source at the cited `file:line` (line numbers from this commit). |
| **[CODE✔]** | A claim a read-only sub-agent made that I **re-checked myself** in the source (listed in §0.2). |
| **[TEST]** | An automated test that exercises the behaviour was read (and, where stated, its result in §6). |
| **[RUN]** | Result of running the test suite on this Windows dev machine in this audit (§6). |
| **[LIVE]** | Verified on a running server / real site. **Nothing in this report is [LIVE].** |

Status classes (as requested): **FULLY IMPLEMENTED**, **PARTIALLY IMPLEMENTED**, **IMPLEMENTED BUT NOT VERIFIED**, **NOT IMPLEMENTED**, **BROKEN / REGRESSION**. A feature is "fully implemented" only when working code *and* a test that really exercises the behaviour exist and (where it can run here) passes. Almost everything fails that bar because the author drive loop is tested only against fake pages and the real-browser suites are gated behind `KLAV_E2E=1` and do not launch reliably under Bun on Windows.

### 0.1 Method
1. Read the prior documents `docs/AUTOSIMS_ARCHITECTURE_AUDIT.md` and `docs/AUTOSIMS_IMPLEMENTATION_PROGRESS.md` as **claims to verify**, not facts.
2. Four independent read-only code audits (authoring engine; replay + selectors + crystallize; recovery + lifecycle; observability + API + DB + UI), each told to grep before declaring anything missing.
3. I spot-checked the highest-impact claims (§0.2) and ran the AutoSim-related test files (§6).

### 0.2 Claims I re-verified in the source myself
| # | Claim | Result |
|---|---|---|
| 1 | `openRouterObjectiveVerifier` returns `achieved:true` when `OPENROUTER_API_KEY` is unset (`lib/trails-author-model.ts:383-385`) | Confirmed |
| 2 | Public share routes `/shared/walk-live`, `POST /shared/walk/:tok/findings`, `.../findings/:id/(file\|dismiss)` do not call `checkSharePasscode` (only `server.ts:9397, 9519, 9542` do) | Confirmed by grep: the passcode check appears only on `/data`, replay and PDF |
| 3 | `revokeShareToken(tokenId)` updates by id only (`lib/trails-share.ts:138-146`) | Confirmed |
| 4 | `isPositionalSelector` has no non-test caller | Confirmed (only its definition, `lib/trails-browser-page.ts:516`) |
| 5 | `guardNavigations` (SSRF hook on the page adapters, `lib/trails-browser-page.ts:818/960/1170`) is never called from AutoSim author/runner/server code | Confirmed: no non-test caller outside the adapter file |
| 6 | `waitForSelector` steps lose their selector at crystallize: author stores it only as `target.resolvedSelector` (`lib/trails-author.ts:1224`), crystallize strips `resolvedSelector` from `target_json` (`lib/trails-crystallize.ts:82-87`) and the step has no `actionValue`; replay reads `step.target?.resolvedSelector ?? step.actionValue` (`lib/trails-runner.ts:1372`) and throws "no recorded selector" | Confirmed by reading; **not reproduced by running** (see §7, B1) |

All other findings below are the sub-agents' reads and are tagged only [CODE]/[TEST]; treat them as high-confidence leads, not proofs.

---

## 1. Executive summary

* **The system is far more built-out than "missing features" suggested.** Authoring, replay with three-tier healing, checkpoint/resume, heartbeat + reaper, a per-project walk queue, findings gate with dedup, evidence/recording/PDF/share, usage metering, and a dashboard UI all exist.
* **Verified strength:** the pure/DB-level logic (resume claim CAS, reaper sweeps, queue fairness, findings dedup/gate, usage meters, crystallize persistence, step-edit routes, loop-recovery guards against a fake page) has real tests.
* **Verified weakness:** *nothing that needs a real browser is verified on this machine.* The author loop's real model + real browser path, the Playwright selector cross-check, replay healing, vision tier, step screenshots, recording, and PDF rendering are either gated behind `KLAV_E2E=1`, named-file-only, mocked, or failing here (§6).
* **Genuinely NOT implemented:** F01 (planning), F07 (trail quality gate), F09 (incremental snapshots), F22 (authoring analytics), F23 (selector analytics).
* **Highest-risk defects found (details §7):**
  1. A crashed/hung authoring run is marked `failed`, not `stalled`, so it **cannot be resumed** (reaper, boot sweep, snapshot-exhaustion, "Target closed"). Resume claims can also leak, leaving the *original* session stuck in `resuming` forever.
  2. `waitForSelector` steps appear to **replay RED** after crystallize (selector stripped) and no test checks the verification verdict.
  3. Replay Tier 0 accepts any single match without identity checking; semantic selectors are **never re-persisted when healed** (heal write-back only keeps id/testid/aria-label).
  4. Security gaps on the share/live path (passcode not enforced on live view, finding create/file/dismiss), share-revoke not project-scoped, no SSRF guard on the AutoSim browser, shared-link report data partly unmasked, `kci_` tokens not re-checked against live membership.
  5. Unconfigured objective verifier certifies `objectiveVerified=true`; a trail is crystallized/activatable even when unverified or when the Verification Walk is RED; `PATCH /api/trails/:id` can set `active` and skip `/approve`'s checks.
  6. Blue/green boot sweep can mark the *other* slot's in-flight runs failed.
* **Recommended next increment:** a small reliability pack (§9): stall-instead-of-fail for author exits that have a checkpoint, release leaked resume claims, `waitForSelector` crystallize fix, then the flag-only F07 validator, then a minimal metrics endpoint. Do **not** start F01/F09/F10 until timing baselines exist.

---

## 2. Existing architecture (as implemented)

```
Dashboard (dashboard.html AutoSims view)  /  /api/v1 (kci_ token)  /  MCP  /  Sim→AutoSim conversion
        │  POST /api/trails/author  (plan/quota gate, snapLocked 402, attachments)
        ▼
runAuthorNow → createAuthorSession (author_sessions) → withAuthorSlot + withWalkSlot
        ▼
authorTrail  (lib/trails-author.ts, ~1,900 lines — "explore mode")
   acquireBrowser (Puppeteer-style handle; remote Steel via CDP or local)
   loop: heartbeat → [screenshot only after a miss] → snapshotPatiently/krefSnapshot (≤24k chars)
         → LLM decision (OpenRouter, lib/trails-author-model.ts; JSON ops)
         → guards (target check, select check, already-filled, toggle/position dedupe, repeat-action stall, no-op stagnation)
         → execute op → settle (≤4 s networkidle) → proactive read-back verify → ObjectiveVerifier on "done"
         → saveCheckpoint (author_sessions.checkpoint_json) each step
   watchdog (45 s warn / 90 s abort), cost cap ($0.15 default), 300 s / 40 step budget
        ▼
crystallize (trails-crystallize.ts, retryTransient) → trails + trail_steps (fingerprint only) + locator_cache (resolved selector)
        ▼  status = draft
Verification Walk  (walkTrailWithBrowserRetry, replay:true, zero-LLM)  → verdict returned, not a gate
        ▼
approve (POST /api/trails/:id/approve, snapLocked) → active → scheduler / manual / CI trigger
        ▼
walkTrail (lib/trails-runner.ts, "replay mode", Playwright, per-project queue)
   resolveTarget: Tier 0 cached selector (count===1) → Tier 1 role+name/text/testid/domPath → Tier 2 vision (optional)
   step_runs (run_steps) + evidence_json + step screenshots + rrweb replay + HAR/trace/recording artifacts
   findings gate (confidence ≥0.9 auto-file to connectors; dedup) → report PDF / share link
Recovery: reaper (60 s tick, 3 min stale) · boot sweep · /author/:id/resume (CAS claim) · browser retry (walk) · Steel→local fallback (walk only)
```

**SIM personas** do not drive authoring. `judgePersonaId` / `sourceSimId` are passed through to the crystallized trail (`lib/trails-author.ts:696-697`, `lib/trails-crystallize.ts:122-125`); the persona is used at judge time (`POST /api/trails/walks/:id/judge`, `lib/trails-judge.ts`). Sim→AutoSim conversion (`POST /api/sims/:id/autosim`, `server.ts:8641`) calls the same `runAuthorNow`. The `/bug-check` Sim walk (`sim-walk.ts`) is a separate pipeline. [CODE]

**Browser adapters:** authoring uses a Puppeteer-style `BrowserPage` (`lib/trails-browser-page.ts:1047`, plain-CSS `count/click`); replay/Verification Walk use Playwright (`acquireWalkBrowser`, `:1601`). On Bun+Windows the walk runs in a Node child (`lib/walk-node-bridge.ts`) because Playwright hangs under Bun. [CODE]

**AI model integration:** OpenRouter via `fetch` (`lib/trails-author-model.ts:231-318`), JSON mode, 90 s abort, daily-budget reservation (`tryReserveDailySpend`), `ai_calls` ledger. Model chosen per step by weighted random (`pickModel`), with an opt-in simple-step mix (`KLAV_AUTHOR_MODEL_MIX=1`). [CODE]

---

## 3. F01–F25 implementation matrix

| ID | Feature | Status | One-line evidence |
|---|---|---|---|
| F01 | Objective planning | **NOT IMPLEMENTED** | No decompose/plan step; raw objective re-sent each step (`trails-author-model.ts:161`) |
| F02 | State-aware observation | **PARTIAL** | `krefSnapshotBody` rich (modals, notices, select2) but no region ranking; `snapshotPatiently` untested and its exhaustion fails the run |
| F03 | Intelligent action execution | **PARTIAL** | Many guards implemented; several have no loop-level test |
| F04 | Page readiness | **PARTIAL** | 4 s `networkidle` settle after click/key/select/upload only; no spinner/overlay detection |
| F05 | Action verification | **PARTIAL** (+ risk) | DOM-diff stagnation, read-back, ObjectiveVerifier exist; no per-action outcome check; unconfigured verifier returns `achieved:true` [CODE✔] |
| F06 | Duplicate action prevention | **PARTIAL** | Repeat-action stall (N=3), toggle/position dedupe; no read-only vs side-effecting class; no stop-after-verified |
| F07 | Trail quality validation | **NOT IMPLEMENTED** | No gate on unverified/duplicate/positional trails; `isPositionalSelector` is dead code [CODE✔] |
| F08 | Adaptive model routing | **PARTIAL** | Works, default OFF; model is picked **at random per step** even with mix off; no escalation after a miss |
| F09 | Incremental DOM snapshots | **NOT IMPLEMENTED** | Full snapshot every iteration |
| F10 | Context optimization | **PARTIAL** | Text-first (no screenshot unless a miss), 24k snapshot cap, 600 max_tokens; action history unbounded |
| F11 | Selector optimisation | **IMPLEMENTED BUT NOT VERIFIED** | Role+name and scoped tiers coded; all 26 tests are `KLAV_E2E`-gated; Playwright cross-check never run here; heal never re-persists them |
| F12 | Browser session optimisation | **PARTIAL** | New browser per run, no reuse; Steel→local fallback + acquire retry on walk path only |
| F13 | Performance monitoring | **PARTIAL** | Replay `durationMs` + browser-minutes + walk meter; **no authoring timings persisted** |
| F14 | Structured checkpointing | **IMPLEMENTED BUT NOT VERIFIED** | `AuthorCheckpoint` persisted per step; DB round-trip tested; no version/seq; fire-and-forget saves |
| F15 | Recovery reconciliation | **PARTIAL** | Resume continues from `stepIdx`; only lost-session URL check, no "did last action commit" check |
| F16 | Browser recovery manager | **PARTIAL** | Walk: one retry on browser-lost; Authoring: none; typical "Target closed" → `failed` |
| F17 | Error classification | **PARTIAL** | Several scattered regex classifiers; `failureKindForThrownError` always returns `crash` |
| F18 | Adaptive retry | **PARTIAL** | Step retry (2×, blind for click/type/select), DB retry, model retry; no idempotency classification |
| F19 | Session lifecycle / heartbeat | **PARTIAL** | Heartbeat + watchdog + reaper exist; reaper/boot sweep set `failed` not `stalled` |
| F20 | Concurrency | **PARTIAL** | Walk pool/queue well tested; author slot global; queued waiters have no timeout |
| F21 | Observability | **PARTIAL** | Session/steps/SSE/screenshots/`/health/busy`; no phase, retry count, elapsed in API |
| F22 | Authoring analytics | **NOT IMPLEMENTED** | Data exists in `author_sessions`; no aggregation/endpoint |
| F23 | Selector analytics | **NOT IMPLEMENTED** | `run_steps.tier/healed` captured; no aggregation/endpoint |
| F24 | Resource management | **PARTIAL** | Spend reservation, `ai_calls`, minutes, S3 ledgers; judge path unmetered; per-tenant budget not on author/vision |
| F25 | Regression framework | **PARTIAL** | Large suite (see §6); real-browser/E2E suites gated or failing on this machine |

Summary counts: Fully implemented **0** · Partial **17** · Implemented but not verified **2** (F11, F14) · Not implemented **5** (F01, F07, F09, F22, F23) · Broken/regression **0 whole features** (but several specific defects, §7).

---

## 4. Feature-level evidence

Format per feature: Source · API/DB · Tests · Verified · Missing/limits · Next.

### F01 Objective planning: NOT IMPLEMENTED
* Source: none; `buildAuthorMessages` (`lib/trails-author-model.ts:161`), prompt line "Work through numbered OBJECTIVE steps in order" (`:124`), model-authored `assert` (`:132`). [CODE]
* Tests: none. Next: defer; collect baselines first (F13).

### F02 State-aware observation: PARTIAL
* Source: `krefSnapshotBody` (`lib/trails-browser-page.ts:85`; visibility gate, aria-hidden/inert, notice/modal text, select2, 24k cap), wrapped by `retryNavRace`; loop adds `snapshotPatiently` (`lib/trails-author.ts:~600`, 4 rounds ≤15 s) and `recaptureUntilContent` (`:130`, 8×1 s). [CODE]
* Tests: `trails-author-empty-snapshot.test.ts` (pure fns); `trails-target-check.e2e.test.ts`, `trails-select-widget.e2e.test.ts` (real browser, gated). **`snapshotPatiently` has no test.** [TEST]
* Limits: after 4 failed rounds it throws; the outer catch returns `failed` (`:~1577`), which is not resumable (the transient regex `isTransientNetworkError`, `lib/trails-crystallize.ts:94-96`, does not match "hung/timed out"). Duplicate snapshot implementation: replay vision tier still uses the older `captureKrefSnapshot` (`lib/trails-snapshot.ts:72`, called only at `lib/trails-runner.ts:1810`), whose e2e test covers the old copy. [CODE]
* Next: on snapshot exhaustion call `stall()` + one test (prior audit increment 2 still open).

### F03 Intelligent action execution: PARTIAL
* Source: `lib/trails-author.ts` ~1205-1360: exact-1 match, kref fallback, select-all rejection, `targetCheck`/`selectCheck` (`lib/trails-browser-page.ts:328/420`), un-toggle skip, already-filled skip, checkbox-shape dedupe, 18 s per-action hard timeout, click-timeout page-changed recovery. [CODE]
* Tests: loop-recovery (I1)-(I3), (H) on a fake page; page-body target-check tests are real-browser (gated). **No test drives the loop through target-mismatch, select-mismatch, already-filled skip, or select-all rejection.** [TEST]
* Next: one loop-level test per guard using the existing MockPage.

### F04 Page readiness: PARTIAL
* `settleNetwork` ≤4 s only after click/key/select/upload (`:60, ~1350`; Playwright `networkidle` `bpage:939`, Puppeteer `waitForNetworkIdle` 500 ms `:1144`). Loop-recovery L105/L173 assert the call against a fake. No spinner/overlay/skeleton detection; not after type/navigate/hover. [CODE][TEST]

### F05 Action verification: PARTIAL (strongest of the authoring guards)
* Source: iteration DOM+URL key / stagnation guard (`~854-960`), proactive read-back after unconfirmed commit (KLA-786), `ObjectiveVerifier` gate on every `done` (`~1115-1190`, `openRouterObjectiveVerifier` `trails-author-model.ts:381`), failed-verify caps. [CODE]
* Tests: loop-recovery (E),(G),(H),(L),(T),(W),(X),(Y),(R10-A/B), KLA-788; `trails-author.e2e` "done on wrong page yields stall" / "done on right page crystallizes with objectiveVerified". All use stubbed model/verifier: they prove loop logic, not LLM accuracy. [TEST]
* Defect: with no API key the verifier returns `achieved:true` and `objectiveVerified` is stored `true` [CODE✔]. Only the post-read-back path refuses the stub (`~1139`).
* Next: make the unconfigured verifier return `achieved:false` (or `reason:"unverified"`), one test.

### F06 Duplicate action prevention: PARTIAL
* Source: successKey `op|selector|value|url`, `LOOP_STALL_N=3` (`:145, ~1371-1440`), survives kref renumbering; toggle/position dedupe; auto-advance submit capped once per key. [CODE]
* Tests: loop-recovery (A)-(H),(B2),(I1)-(I3); `trails-author.textfirst.test.ts` repeat tests (this file is in the failing set, §6). [TEST]
* Missing: read-only vs side-effecting classification; "stop once objective verified" (v16 Completed-Actions repeat). `objectiveVerified` is only set when the model proposes `done`.

### F07 Trail quality validation: NOT IMPLEMENTED
* After the loop only `if (!traj.length) stall` (`:1524`) precedes `crystallize` (`:1527`); trail is set `draft` (`:1528`); Verification Walk verdict is returned (`:1566-1574`) but is not a gate. `trails.objective_verified` is stored and exposed in v1 API (`lib/v1-authored.ts:30`) but nothing in `dashboard.html` reads it. `isPositionalSelector` is unused [CODE✔]. Approval (`server.ts:12151-12163`) only checks draft + `snapLocked`. [CODE]
* Next: pure `validateTrajectory` returning `{positionalSteps, consecutiveDuplicates, objectiveVerified}`; **flag, do not block** (store in session metadata, surface in UI). Unit-testable, no browser.

### F08 Adaptive model routing: PARTIAL
* `isSimpleAuthorStep` (`trails-author-model.ts:35`), `selectAuthorWeights` (`:49`), `selectVerifierWeights` (`:58`), `selectVerifierModel` (`:357`), env `KLAV_AUTHOR_MODEL_MIX=1`; pick is `pickModel(weights,…,Math.random())` (`models.ts:25`) from static `DEFAULT_WEIGHTS` (`models.ts:17`). [CODE]
* Tests: `trails-author-model-mix.test.ts` (A)-(G) pure selection; nothing proves `openRouterAuthorModel` uses them. [TEST]
* Limits: non-deterministic per step even when mix is off; no escalation after a miss.

### F09 Incremental DOM snapshots: NOT IMPLEMENTED
* Full `querySelectorAll` + re-stamp each iteration (`bpage:85`); DOM hash only for no-op detection. No tests. Defer until F13 baselines.

### F10 Context optimization: PARTIAL
* Done: text-first (no screenshot unless a miss; `KLAV_AUTHOR_TEXT_FIRST=0` disables), 24k cap (duplicated at `trails-snapshot.ts:12` and `bpage:85`), `max_tokens` 600, verifier last-60 actions. Not done: author history is the full list (`trails-author-model.ts:161-170`); cost cap $0.15 / 40 steps / 300 s (`:39`). Tests: `trails-author.textfirst.test.ts` (in failing set). [CODE][TEST]

### F11 Selector optimisation: IMPLEMENTED BUT NOT VERIFIED
* Source: `stableSelectorBody` (`bpage:533`): id → testid → `tag[name]` → aria-label → placeholder → input type → **role+name leaf `role=link[name="X"s]`** → **scoped `container:has-text("label") >> role=…`** (`:559-646`) → shortest positional path (`:647-670`). Every tier requires uniqueness **and** identity. Roles: link/button/tab/menuitem; names >80 chars skipped; scoped tier capped (`SCOPED_TIER_MAX_CANDIDATES=3000`). Playwright adapter cross-checks with the real engine (`:875-888`); Puppeteer adapter cross-checks via the accessibility tree (`:1069-1087`). Only callers: author (`lib/trails-author.ts:899, 1222, 1251`). Persisted as `locator_cache.resolved_selector`. [CODE]
* Tests: `lib/trails-semantic-selectors.test.ts` 26 tests, **all `describe.skipIf(!KLAV_E2E)`**; helper `lib/trails-pw-check.cjs` runs real Playwright under Node; T9 re-implements Tier 0 rather than calling `resolveTarget`. `trails-page-role-selectors.test.ts` 9 tests (gated; 3 fixtures changed, see progress doc). [TEST]
* Verified: replay `resolveTarget` Tier 0 uses `page.locator(cached)` so Playwright's `role=` engine resolves the new form (`lib/trails-runner.ts:524`). [CODE]
* Missing/limits: heal never re-persists a semantic selector (§7 B3); three separate selector builders (`bpage:533`, `runner:481 persistableSelector`, `trails-snapshot.ts:226`); only newly-authored trails benefit; plain `div` cards fall back to positional; Puppeteer `count/click` cannot run `role=` selectors (safe today, trap for new callers).
* Next: run the gated suite on a machine where Playwright launches; add one test that calls real `resolveTarget`.

### F12 Browser session optimisation: PARTIAL
* Per-run browser, no reuse. `acquireBrowser` (author, `bpage:1355`) has **no** acquire timeout, retry or local fallback; `acquirePlaywrightBrowser` (`:1513`, Steel→`local-fallback`) and `acquireWalkBrowser` (`:1601`, 3 tries with jitter) are walk-only. Local SIGKILL watchdog (360 s walk / `deadline+30 s` author). `withAcquireTimeout` abandons a late launch without closing it (`:1241-1247`); Steel `fetch` has no abort (`:1290`). Tests hermetic (`trails-browser-page.test.ts:217-266`, `safeClose`, Steel release). [CODE][TEST]

### F13 Performance monitoring: PARTIAL
* Replay: `durationMs` + console/page-error/failed-request slices into `run_steps.evidence_json` (`lib/trails-runner.ts:1306-1311`, `lib/trails-walk-evidence.ts`), `recordBrowserMinutes` (`lib/cost-events.ts:57`), `autosim_walk` meter (`:1167`). Authoring: watchdog stage is local only (`lib/trails-author.ts:581-583`); `AuthorStepLog` (`:193`) has no timing. Tests: `trails-walk-evidence.test.ts` (29), `usage-meters.test.ts` (14), `cost-events.test.ts`; none asserts `durationMs` lands in `run_steps` outside E2E. [CODE][TEST]
* Next: append `{tMs, stage}` per iteration to `AuthorStepLog` (goes into `steps_json`, no schema change).

### F14 Structured checkpointing: IMPLEMENTED BUT NOT VERIFIED
* `AuthorCheckpoint` (`:323-362`), `snapshotCheckpoint` (`:542`), saved each step and at commit/verify sites and in `stall`; stored `author_sessions.checkpoint_json`. Saves are fire-and-forget (`.catch(()=>{})` `:1843`), bounded by 15 s `SAVE_TIMEOUT_MS` (`:607`) with no sequence guard (a late save can overwrite a newer one); corrupt JSON swallowed to `null` (`:1643`); no version field. Tests: `trails-author-resume.test.ts:170-205` (real sqlite round trip), loop-recovery (J)/(K)/(N)/(W1). [CODE][TEST]

### F15 Recovery reconciliation: PARTIAL
* After resume the loop continues from `cp.stepIdx` (`:540, :740`); `resumeLostSession` is a URL/regex check (`:99, :719-727`). Only KLA-786 flags are carried over. No check that the last side-effecting action committed. Tests: loop-recovery (J),(K) (stub page); I found no test of `resumeLostSession` in the files read. [CODE][TEST]

### F16 Browser recovery manager: PARTIAL
* Walk: `walkTrailWithBrowserRetry` (`lib/trails-runner.ts:740`) retries once on browser-lost via `resetWalkForRetry`. Authoring: dead browser → outer catch → `failed` unless `isTransientNetworkError` matches and `traj.length>0` (`lib/trails-author.ts:1576-1584`); a hung await that rejects "Target closed" before the loop-top watchdog check also lands in `failed`. Tests: `trails-walk-browser-retry.test.ts` (5, injected `walkFn`), `autosim-walk-resilience.test.ts` (stubs). [CODE][TEST]

### F17 Error classification: PARTIAL
* Classifiers: `isInfraTransportError` (`bpage:1553`), `isTransientNetworkError` (`trails-crystallize.ts:94`), `isTransientSnapshotError` (`trails-author.ts:113`), `ModelCallError` (`trails-author-model.ts:66-77`), `classifyRedCause` (`trails-author.ts:260`, authoring only → `author_sessions.red_cause_json`). `failureKindForThrownError(_e)` ignores its argument and always returns `"crash"` (`lib/trails-runner.ts:373`). Tests: `trails-failure-kind.test.ts`, `autosim-walk-resilience.test.ts:22-44`, `trails-author-retry.test.ts` (error class only), `trails-author-red-cause.test.ts` (7). [CODE][TEST]

### F18 Adaptive retry: PARTIAL
* `withStepRetry` (`runner:304`, 2×, fixed 500 ms) retries click/type/select blindly (`:1566-1580`) so a non-idempotent submit can fire twice on replay; `retryTransient` (`crystallize:100`, 4 tries); author model retry 3× exponential, no `Retry-After` (`author:983-1000`). Tests: `trails-runner-step-retry.test.ts` (6), loop-recovery (N2). No test of the loop's model-retry behaviour found. [CODE][TEST]

### F19 Session lifecycle / heartbeat: PARTIAL
* `touchAuthorHeartbeat`/`touchWalkHeartbeat` (`lib/db.ts:2225/2221`), step watchdog 45/90 s (`author:664-679`), `withHeartbeat` 30 s (`:75`), `startCrashReaper` 60 s (`lib/trails-reaper.ts:19`, started `server.ts:16911`), `sweepStale*` 3 min (`db.ts:2234/2248`), boot sweeps (`db.ts:127-128, 2191, 2206`). **Stale/boot sweeps set `failed` even with a checkpoint** (author.ts:1679 comment calls `stalled` semantics "future"). Tests: `trails-reaper.test.ts` (15 DB-level; `startCrashReaper` only asserted to return `stop()`), loop-recovery (W1),(W2). [CODE][TEST]

### F20 Concurrency: PARTIAL (walk path good)
* `withWalkSlot` (`lib/trails-browser.ts:270`, release in `finally`), `_dispatch` round-robin, `withAuthorSlot` (global, `:291`), env `KLAV_WALK_CONCURRENCY`=1, `KLAV_WALK_QUEUE`=10, `KLAV_WALK_PER_PROJECT`. Tests: `trails-walk-queue.test.ts` (6, real pool, stub fns), `trails-browser.test.ts:114,128`. Limits: in-memory per process (blue/green = 2 pools); queued waiters never time out; `runWalkNow` blocks while queued, so the scheduler's busy-retry path is only reached when 10 are queued. [CODE][TEST]

### F21 Observability: PARTIAL
* `GET /api/trails/author/:id` and `/active` return steps/stallReason/checkpoint/limitMs/cost/llmCalls; SSE `/author/:id/live` and `/walks/:id/live`; per-step screenshot routes; `last_beat_at`; unauthenticated `GET /api/health/busy` (`server.ts:3861`). Missing: stage, retry count, elapsed; no memory/process metrics. Tests: `server.trails.test.ts:281,291`, `trails-author-resume.test.ts`, `trails-reaper.test.ts`, `trails-live-watch.test.ts` (1). [CODE][TEST]

### F22 Authoring analytics: NOT IMPLEMENTED
* `author_sessions` is only CRUD'd; no aggregation. Walk-level analytics exist (`walkTrends`, `GET /api/trails/trends`, `listTrailRunHistory`, `computeScheduleCoverage`). Next: `GET /api/trails/author/stats` = `GROUP BY status` over existing columns (no new table).

### F23 Selector analytics: NOT IMPLEMENTED
* Data exists (`run_steps.tier/healed/evidence_json`, `locator_cache.source/confidence`); only per-walk PDF "(healed)" diff and walk-detail diff UI surface it. The ops "self-healed" figure (`server.ts:1892`) counts AI re-heal cost rows, not selector tiers. Next: one read-only query grouping `run_steps` by tier/healed + `isPositionalSelector` over `locator_cache`.

### F24 Resource management: PARTIAL
* Walk pool/queue, deadlines (walk 600 s `runner:723`, author 300 s), `tryReserveDailySpend`/`reconcileDailySpend` (`db.ts:6123/6145`) used by author model and vision, `recordAiCall` ledger, credits soft-reserve, S3 ledgers. Gaps: judge route (`server.ts:11677-11695`) uses raw `fetch`, skips `ai_calls`, daily cap, tenant budget and `snapLocked`, and reads `KLAV_OPENROUTER_KEY` while author/vision read `OPENROUTER_API_KEY`; `lib/tenant-budget.ts` is wired only into `chat()` (`server.ts:744`); `author-drive` `ai_calls` rows have no session/run id. Tests: `db.spend.test.ts` (8), `usage-meters.test.ts` (14), `quota-meter-agreement.test.ts` (5), `trails-walk-queue/deadline`. [CODE][TEST]

### F25 Regression framework: PARTIAL
* See §6. 107 AutoSim-related test files exist. The loop-recovery file (40 tests) is a strong regression net but runs on a fake page. Real-browser suites are gated (`KLAV_E2E` / `RUN_BROWSER`), `trails-runner.e2e.test.ts` only runs when named explicitly on the command line (`RUN_RUNNER_E2E`, line 26). No fixture app covering login + table + modal + slow SPA end to end.

### Other areas requested
| Area | Status | Notes |
|---|---|---|
| Replay mode (`walkTrail`, `resolveTarget`) | PARTIAL | Tiers 0/1/2 coded; Tier 0 `count===1` has no identity check (`lib/trails-runner.ts:533-536`); ambiguous → RED with finding; heal → AMBER; semantic form not re-persisted (`persistableSelector` `:481-496`). Tests mostly gated/named-only/vision suite failing on Windows |
| Trail generation/crystallization | PARTIAL | `crystallize` persists steps (fingerprint only) + `locator_cache`; N+1 writes; **not atomic** (orphan trail on mid-failure); `waitForSelector` defect (B1); draft gate + step edit routes tested (`server.trails-step-edit.test.ts` 16 tests, `trails-crystallize.test.ts` 6) |
| Findings gate / `classifyRedCause` | FULLY IMPLEMENTED for the gate logic (pure + DB tests: `trails-findings-gate.test.ts` 25, `-dedup` 14, `-severity` 7, route tests) | `realFiler` (real connector) is injected-only in tests → IMPLEMENTED BUT NOT VERIFIED; it attaches a 7-day presigned screenshot URL to external tickets regardless of PII masking |
| Evidence / step screenshots | PARTIAL | upload queue best-effort (silent drop at 64 buffered); step shots opt-in (runner default off, `runWalkNow` turns on); tests `trails-stepshots.test.ts` are 5/5 gated, S3 faked |
| Recording / HAR / PDF | IMPLEMENTED BUT NOT VERIFIED | ffmpeg, real S3 and real Chromium PDF never exercised (routes use `KLAV_TEST_FAKE_PDF=1`); recording route claims `Accept-Ranges` but returns whole object |
| Live SSE frames | PARTIAL | `states` map in `lib/trails-live-watch.ts:28` has no delete (memory grows per run); no backpressure; no connection cap |
| Usage metering / spend | meters FULLY IMPLEMENTED (tested); judge path unmetered | |
| Dashboard / UI | PARTIAL | AutoSims view live in `dashboard.html`; `public/trails.html` (3,227 lines) and `autosims-walks.html` (419) are orphaned (no route); `/api/trails/trends`, paged `/walks` and `/:id/runs` have no UI caller |
| Share links | PARTIAL | tokens 256-bit, hash-only, expiry/revoke/extend/views tested; passcode unsalted SHA-256; gaps in §7 |
| Scheduler | PARTIAL | `tickScheduler` 60 s; `touchScheduledLastRunAt` is not a CAS; busy-retry queue in memory; deadline uses `"UTC"` for tz schedules |

---

## 5. API and database mapping

### 5.1 API (all in `server.ts`; auth **S** = session/bearer + `resolveProject`; **402** = `snapLocked`)
Block gate `resolveProject` at `:11467-11470`. **No role check inside the `/api/trails/*` block: any project member can approve, share, dismiss, file.**

| Area | Routes (line) | Gating notes |
|---|---|---|
| Dashboard/data | GET `/api/trails/dashboard` 11474 · `/trends` 11500 · `/walks` 11515 · `/walks/:id` 11636 · `/walks/:id/progress` 11605 · `/:id/runs` 11826 · `/:id/steps` 12075 | S |
| Authoring | POST `/api/trails/author` 11899 (+402, flow quota) · `/author/attachments` 11866 (no 402) · GET `/author/active` 11980 · `/author/stalled` 11991 · POST `/author/:id/cancel` 11998 · `/author/:id/resume` 12010 · GET `/author/:id/live` 12032 · `/author/:id/steps/:idx/screenshot` 12049 · `/author/:id` 12067 | resume REST requires `stalled` only; engine also accepts `needs_auth` |
| Trail lifecycle | PATCH `/api/trails/:id` 11758 (+402; allows `status:"active"` directly) · POST `/:id/approve` 12153 (+402) · POST `/:id/walk` 11846 (+402; 409 busy) · steps reorder/PATCH/DELETE 12088/12109/12137 (draft-only, 409) · PATCH `/:id/judge-persona` 11707 | |
| Walk detail | GET `/walks/:id/live` 11532 · `/replay` 11543 · `/recording` 11559 · `/recording/video` 11585 · `/walks/:id/steps/:stepId/screenshot` 12230 · `/report.pdf` 12168 (429 busy) · POST `/walks/:id/cancel` 12255 · `/resume` 12268 · `/judge` 11661 (no 402, unmetered) · `/findings` 12205 | cancel returns 409 unless `running` (a `paused` walk cannot be cancelled) |
| Findings | POST `/api/trails/findings/:id/file` 11728 · `/dismiss` 11743 | S |
| Share | GET/POST `/walks/:id/share` 12285 · DELETE `/share/:tid` 12325 (**not project-scoped**) · PATCH `/share/:tid` 12335 · public `/shared/walk/:tok` 9373, `/data` 9390, `/walk-live/:tok` 9443, `/walk-replay/:tok` 9513, `/walk-report/:tok` 9536, POST `/shared/walk/:tok/findings` 9455, `.../findings/:id/(file\|dismiss)` 9486 | passcode enforced on data/replay/PDF only |
| CI / v1 / MCP | POST `/api/ci/token` 10159 · `/api/ci/trails/:id/trigger` 10181 · GET `/api/ci/runs/:id` 10208 (mints a share token per poll) · `/api/v1/authored-runs*` 10479-10549 · `/api/v1/runs*` 10574-10707 · POST `/mcp` 10268 | `kci_` bearer; **no live membership re-check** except `/mcp` and `/api/v1/tickets`; MCP `start_authored_run` has no `snapLocked`/quota (`mcp/tools.ts:122`) |
| Sim→AutoSim | POST `/api/sims/:id/autosim-objective` 8607 · `/api/sims/:id/autosim` 8641 (+402, quota) | |
| Auth config | POST `/api/autosim/auth-config` 5142 (setup-token bearer) · GET `/api/projects/:id/autosim-auth` 15530 · POST `.../setup-token` 15578 (admin) | |
| Projects/test cases | `/api/autosim-projects[/...]` 11294-11455 · `/api/projects/:id/test-accounts`, `/trails-autofile`, `/ci-tokens`, `/regression-events` | |
| Health | GET `/api/health/busy` 3861 (**unauthenticated**) | counters only |
| Pages | `/autosims/walk/:id` 9352 · `/autosims/auth` 9354 · `/sim-runs` 9367 · `/trails`, `/autosims`, `/autosims/walks` redirect to dashboard | |

### 5.2 Database (`lib/db.ts` `applySchema`; ALTERs via `needCol`)
| Table | Created (db.ts) | Notable columns / migrations | Writers → readers |
|---|---|---|---|
| `trails` | 599 | viewport, `step_version`, `schedule_cron/tz`, `scheduled_last_run_at`, `judge_persona_id`, `source_sim_id`, `test_case_id`, `objective_verified`, `environments_json` (ALTERs 1419-1537) | crystallize, author route, PATCH, approve → trails.ts, dashboard |
| `trail_steps` | 615 | `timeout_ms` (1534); `target_json` = fingerprint only | crystallize, step edits → runner |
| `trail_modules`, `trail_module_steps` | 628, 637 | | `trails-modules.ts` → runner |
| `locator_cache` | 649 | unique `lc_key_uq` (project, step) 665; `resolved_selector`, `source` (`crystallize`/`heal`), `confidence` | runner, crystallize |
| `trail_runs` | 666 | `trail_version`, `last_beat_at` (1510), `paused_secret_key`, `replay_cost_usd`, `git_json`; index only `(trail_id, started_at)` (678) | `startWalk`/`finishWalk`/reaper |
| `run_steps` | 679 | `tier`, `healed`, `verdict`, `evidence_json` (durationMs, screenshotKey, from/toSelector) | `addRunStep`, `mergeRunStepEvidence` |
| `findings` | 695 | `content_sig`, severity, priority, unique `finding_dedup_uq` (1448); no `(project_id, run_id)` index | `recordFinding`, status setters |
| `walk_replays`, `walk_judgments`, `walk_artifacts` (har/trace/recording, base64 in DB), `walk_share_tokens` | 720, 1496, 1761, 913 | share: `passcode_hash`, `revoked_at`, `view_count` | trails-share/har/recording |
| `author_sessions` | 899 | `steps_json`, `stall_reason`, `llm_calls`, `cost_usd`, `objective_verified`, `checkpoint_json` (1516), `last_beat_at` (1512), `resumed_from/resumed_by` (1519), `red_cause_json` (1868); `status` is free TEXT, no CHECK | `trails-author.ts`, `touchAuthorHeartbeat` → routes, reaper |
| `autosim_projects`, `_test_case_groups`, `_test_cases`, `test_accounts` | 746, 751, 756, 734 | | `autosim-projects.ts` |
| `autosim_auth_setup_tokens/configs/probe_queue` | 766, 778, 787 | | `autosim-auth-*.ts`, `server.ts:5142` |
| `ai_calls`, `cost_events`, `usage_meters`, `daily_ai_spend`, `tenant_ai_budgets`, `api_idempotency` | 444, 492, 554, 463, 545, 1877 | `ai_calls.run_id` | spend/usage code |

There is **no** `trail_versions` table (versioning is `trails.step_version` + `trail_runs.trail_version`).

**State machines** (no CHECK constraints; terminal writes are unconditional):
`author_sessions.status`: `running → crystallized | stalled | needs_auth | failed`; `stalled|needs_auth → resuming` (atomic CAS `author.ts:1739-1755`); `resuming → stalled|needs_auth` only via `releaseAuthorResumeClaim` when the claim/session-insert throws (`:1820`); `running → failed` by stale sweep (`db.ts:2248`) and boot sweep (`:2191`). Nothing ever reverts a stuck `resuming` row.
`trail_runs.status`: `running ↔ paused`; `running → green|amber|red` (`finishWalk`, unconditional); `red → running` (`resetWalkForRetry`); `running → red` by reaper/boot sweep. `needs_auth` is declared in the type but nothing writes it. Nothing sweeps `paused`.

---

## 6. Test coverage and results

### 6.1 What was run
Machine: Windows 11, Bun 1.3.14. Branch `Balaji_autosim-multiple-inputerror` @ `b0b5a7bb` (does **not** yet contain the later Dev/KD-3121 work). Files: the 107 AutoSim-related test files (`*trail*`, `*autosim*`, `*author*`, `*walk*`, `*crystal*`, `*reaper*`, `*steel*` under `prototype/` and `prototype/lib/`), `--timeout 30000`, local fixtures and temp databases only. No QA2/production URL, data or connector was used and `local.db` was not used by the tests.

| Run | Result [RUN] |
|---|---|
| **A. Default** (no flags) | **completed**: 1,124 tests in 107 files, **955 pass · 140 skip · 29 fail**, 936 s |
| **B. `KLAV_E2E=1`** | **did not complete**: killed by the 1,500 s cap (exit 124) before printing totals. **53 failures observed** (a lower bound; the tests after the kill point never ran) |

Run B is therefore **incomplete evidence**. The progress doc's earlier complete `KLAV_E2E=1` run (81 files, 795 tests: 699 pass / 44 skip / 52 fail, later 82 files / 821 tests: 725 / 44 / 52) is a prior-session figure, not reproduced here.

### 6.2 Failing tests (run A, 29)
| Group | Count | Files / tests | Likely cause (my read; not individually diagnosed) |
|---|---|---|---|
| Real-browser `beforeAll` timeouts, listed as `(unnamed)` | 7 | e.g. `trails-select-widget.e2e`, `trails-snapshot.e2e`, `trails-target-check.e2e`, plus 4 more files | Chromium/Playwright launch hangs under Bun on Windows (the same cause the progress doc and `lib/walk-node-bridge.ts` document). The F02 real-browser tests therefore **did not run** |
| Tier-2 vision / replay / rrweb end-to-end | 16 | `trails-runner-vision.e2e` (Tier-2 heal AMBER, regression RED, low confidence, kref heal, throwing resolver, gone ASSERT ×2, no-resolver RED, demo trail), `trails-runner-replay.e2e` (rrweb ×2, "replays do NOT record real input values or credentials (KLA-60)"), KLA-790 late-rendered target, injectedSecrets | Same: real Chromium. **Tier 0/1/2 healing is unverified on this machine**, not shown broken |
| Stale source-pin tests against `dashboard.html` | 4 | `autosim-nav-disambiguation` (Sims Studio `aria-label`), `autosims-copy-unified` (hero lead, share-link manager `projQ()`), `/autosims no longer shows the dead '—' precision state` | `dashboard.html` was reformatted (attributes now split across lines / spacing), so exact-string assertions no longer match. Test-quality debt, not a product failure |
| `buildAuthorMessages` project instructions | 1 | `trails-author.textfirst.test.ts:51` expects `"PROJECT INSTRUCTIONS:"` in the system prompt | **Unresolved**: either a stale assertion or a real prompt regression. Needs a 5-minute look before any F10/F06 claim relies on this file |
| Content-Length 413 | 1 | `server.trails-author-attachments.route.test.ts:158` ("socket connection was closed unexpectedly") | Likely Bun/Windows socket behaviour on an early reject; not diagnosed |

### 6.3 Additional failures only in run B (`KLAV_E2E=1`, 24 beyond run A)
Author loop with a real browser: `authorTrail textFirst default/kill-switch/opt-out`, `loop guard resets on action change`, `KLA-69 first-roll stall`, `single 429 … not a miss`, `generic Error … retryable miss`, `onCheckpoint is called at least once`; browser-adapter tests (`PlaywrightPage adapter … local handle`, `acquirePlaywrightBrowser` ×3); walker deadline tests (`hung initial-goto`, `deadlineMs finalizes`, `slow wait step`, `starts with under 1s`); draft-gate/findings (`draft Trail's RED walk files NO findings`, `same RED walk on an ACTIVE trail records the finding`, `explicit suppressFindings`); step shots (`shots-1`, `shots-2`), PDF (`pdf-e2e`), `5xx … third attempt`, `POST /api/trails/author validates and returns a pollable session`, `walk resolves cred at fill time`. One A-failure (`regression demo trail → Tier-2 vision`) did not fail in B (flaky or timing-dependent).

### 6.4 Passing / skipped / flaky / uncovered
* **Passing [RUN] (run A, 955):** the hermetic and DB-level tests, including the loop-recovery net (`trails-author-loop-recovery.test.ts`, 40 tests on a fake page), `trails-author-resume` (non-gated parts), `trails-reaper`, `trails-walk-queue`, `trails-crystallize`, `trails-findings-gate/dedup/severity`, `server.trails-step-edit`, `usage-meters`, `db.spend`, `trails-walk-evidence`, `trails-runner-step-retry`, `trails-share*`, `server.walk-report.route`, and the gated-off semantic-selector file reported as skipped (see below).
* **Skipped [RUN] (run A, 140):** includes the entire `trails-semantic-selectors.test.ts` (26) and `trails-page-role-selectors.test.ts` (9) (`KLAV_E2E`/`RUN_BROWSER` gates), most of `trails-stepshots` and `trails-draft-gate`, and `trails-runner.e2e.test.ts` (runs only when named explicitly on the CLI). So **F11's own tests did not execute in run A**; in run B none of the semantic-selector failures appeared among the 53, but the run was killed before completion so this is not a pass.
* **Flaky (reported, not re-measured here):** `trails-author-resume` "picks up from checkpoint stepIdx" (progress doc, intermittent); `regression demo trail → Tier-2 vision` (failed in A, not in B).
* **Features with no meaningful real-behaviour test:** `snapshotPatiently` (F02), loop-level target/select-mismatch / already-filled / select-all guards (F03), `resumeLostSession` (F15), loop-level model-retry (F18), `startCrashReaper` against a live walk (F19), real `resolveTarget` against new semantic selectors (F11, T9 re-implements Tier 0), Verification-Walk verdict for `waitForSelector` trails (B1), recording with real ffmpeg / PDF with real Chromium / video 200 route (evidence), passcode on live/finding share routes (C1), cross-project share revoke (C2), F13/F22/F23 (no code).
* **Not claimed as production behaviour:** every pass above is a unit/fixture result. Nothing here proves behaviour on a deployed server or against a real site (**no [LIVE] evidence**).

---

## 7. Known bugs and limitations (ranked)

**A. Reliability: loses or blocks recoverable work**
| # | Defect | Evidence |
|---|---|---|
| A1 | Crash/OOM/hang → stale or boot sweep sets author session `failed` even when a checkpoint exists; REST resume needs `stalled`. | `lib/db.ts:2191, 2248`; `server.ts:12013` [CODE] |
| A2 | Snapshot exhaustion, browser death ("Target closed"), or a watchdog-tripped hung await that rejects first → outer catch → `failed`, not `stalled`. | `lib/trails-author.ts:1576-1584`, `trails-crystallize.ts:94-96` [CODE] |
| A3 | `resuming` claim leak: if the resumed drive fails or the process dies between claim and child insert, the *prior* session stays `resuming` forever and disappears from the stalled list (the progress is unreachable). | `author.ts:1739-1759, 1820, 1879` [CODE]; test at `trails-author-resume.test.ts:270` even asserts `resuming` after the child stalls |
| A4 | Blue/green: new slot's boot sweep (`db.ts:127-128`) marks the old slot's in-flight runs failed with no heartbeat/owner check; old process's late write overwrites. Assumes shared DB (not verified in deploy scripts). | [CODE-inferred] |
| A5 | REST resume rejects `needs_auth` while the engine allows it (only auto-resume reaches it). | `server.ts:12013` vs `author.ts:1725` [CODE] |
| A6 | Reaper does not release the in-memory slot or close the browser; hung Steel CDP await holds the slot; queued waiters never time out. | `lib/trails-reaper.ts:19-24`, `trails-browser.ts:277-283` [CODE] |
| A7 | Scheduler `touchScheduledLastRunAt` not a CAS (double-fire across slots); busy-retry queue in memory; `"UTC"` deadline for tz schedules; `runWalkNow` blocks while queued. | `lib/trails-scheduler.ts`, `trails.ts:128` [CODE] |
| A8 | `acquireBrowser` (author) has no timeout/retry/fallback; late-resolving launch never closed. | `bpage:1355, 1241-1247, 1290` [CODE] |
| A9 | Checkpoint writes are silent on failure and can be overwritten by a late save. | `author.ts:607, 1843` [CODE] |

**B. Correctness**
| # | Defect | Evidence |
|---|---|---|
| B1 | `waitForSelector` steps lose their selector at crystallize → replay throws "no recorded selector" → RED. Not reproduced; the only test (`trails-author.upload-chatbot.e2e.test.ts:73`) asserts `crystallized`, not the walk verdict. | §0.2 #6 [CODE✔] |
| B2 | Replay Tier 0 returns a hit on `count===1` with no identity check, so a drifted positional selector acts on the wrong element and the step is GREEN. | `runner:533-536` [CODE] |
| B3 | Healing via role+name/text never re-persists (only id/testid/aria-label are persistable), so those steps re-heal AMBER on every walk; `domPath` heals persist the weak 4-level path. | `runner:481-496, 1596` [CODE] |
| B4 | Unconfigured verifier certifies `objectiveVerified=true`. | `trails-author-model.ts:383-385` [CODE✔] |
| B5 | A trail is crystallized/draft/activatable when unverified, step-limit-exited, or when the Verification Walk is RED; `PATCH /api/trails/:id` with `status:"active"` skips `/approve` (and its `snapLocked`). | `author:1523-1574`, `server.ts:11780-11787, 12151-12163` [CODE] |
| B6 | `failureKindForThrownError` always returns `"crash"`; `withStepRetry` retries click/type/select blindly (possible double submit on replay). | `runner:373, 1566-1580` [CODE] |
| B7 | `crystallize` not atomic (orphan trail on mid-failure); N+1 writes; `deleteTrailStep` orphans its `locator_cache` row. | `trails-crystallize.ts`, `trails.ts:729` [CODE] |
| B8 | `gatherWalkReport` filters findings in JS from a 500-row, recurrence-ranked list: a run's findings beyond 500 are missing from the PDF (`findingsByRunId` exists). | `lib/trails-report.ts:64-65` [CODE] |
| B9 | CI status poll mints a new 30-day share token per call. | `server.ts:10238` [CODE] |
| B10 | v1 API maps `stalled` and `failed` both to "failed", never "cancelled". | `lib/v1-authored.ts:5-20` [CODE] |

**C. Security**
| # | Risk | Evidence |
|---|---|---|
| C1 | Share passcode not enforced on live view and on public finding create/file/dismiss (a token holder can push findings to the customer's connectors). | `server.ts:9443-9451, 9455, 9486-9507` [CODE✔] |
| C2 | Share revoke by token id only (not project/run scoped). | `lib/trails-share.ts:138-146` [CODE✔] |
| C3 | No SSRF guard on the AutoSim author/walk browser: only an `^https?://` check (`server.ts:11943, 8658`); `guardNavigations` exists on the adapters but is never called by AutoSim code [CODE✔]. Results are exposed via SSE, screenshots, recording, PDF. | |
| C4 | Public `/data` returns `walk` summary (console logs, failed-request URLs) and `trail` unmasked; `realFiler` attaches a 7-day presigned screenshot URL regardless of masking. | `server.ts:9425-9435`, `trails-findings-gate.ts:366-376` [CODE] |
| C5 | `kci_` tokens (`/api/ci/*`, `/api/v1/runs*`, `/api/v1/authored-runs*`) not re-checked against live membership; MCP `start_authored_run` lacks `snapLocked`/quota; attachments upload and judge lack 402; snap-locked CI trigger returns 500. | `server.ts:10278, 10493, 11866, 11661`; `trails-trigger.ts:112` [CODE] |
| C6 | Passcode is unsalted SHA-256; `/api/health/busy` unauthenticated; no per-role check in `/api/trails/*` (any member can approve/share/file). | [CODE] |

**D. Performance / resources**
D1 Full snapshot + unbounded history each step (F09/F10). D2 `projectPrecision` loads up to 500 full finding rows per dashboard load (`trails-findings-gate.ts:38-46`). D3 Author session write path rewrites `steps_json` + checkpoint each step and the 2 s UI poll returns all of it (quadratic payload). D4 Recording holds ≤600 frames in RAM; video route buffers the full webm. D5 Live-watch `states` map never freed. D6 Missing indexes: `trail_runs(project_id, started_at)`, `findings(project_id, run_id)`, `walk_share_tokens(project_id, run_id)`. D7 **Retention:** `pruneRunHistory` never deletes `walk_artifacts` (HAR/trace base64 in DB) or S3 screenshots/recordings, so storage grows without bound. D8 Scoped selector tier ≈ rows × labels (1.4 s at 3k rows, 8.9 s at 10k per progress doc); role+name tier uncapped. [CODE]

**E. Duplicates / dead code**
Two snapshot implementations (author `krefSnapshotBody` vs replay-vision `captureKrefSnapshot`); three stable-selector builders (`bpage:533`, `runner:481`, `trails-snapshot.ts:226`); three transient-error regexes; two browser-acquisition seams with different retry/timeout behaviour; two copies of the screenshot-serving route (`server.ts:12048` and `:12229`); `isPositionalSelector` dead; orphaned `public/trails.html` and `autosims-walks.html` (and three API routes with no UI caller); stale comments about a single walk slot (`server.ts:11842-11845`). The `/trails` page tests pass only because the redirect lands on `dashboard.html`.

**F. Error handling**
Metering/credit failures are swallowed by design with `console.warn` (`runner:1177-1186`); step-shot overflow/S3 failures silent; share view counting fire-and-forget; `bounded()` abandons the underlying promise without aborting it (a hung call may still mutate the page).

---

## 8. Missing functionality (net of what already exists)
F01 planning · F07 quality validation (flag) · F09 incremental snapshots · F22 authoring analytics · F23 selector analytics · authoring timing metrics · stall-instead-of-fail on author exits · resume reconciliation (did the last commit persist?) · idempotency classification for retries · per-tenant spend on author/vision/judge · retention for artifacts/S3 · live-watch lifecycle/caps · selector re-persist on heal · fixture app for end-to-end browser regression · an UI surface for `objective_verified`.

---

## 9. Recommended priorities
| P | Item | Why | Size |
|---|---|---|---|
| P0 | Stall (not fail) on author exits that have a checkpoint: snapshot exhaustion, `wd.tripped`, browser death; reaper + boot sweep set `stalled` when `checkpoint_json` present and skip rows with a fresh heartbeat | A1, A2, A4: stops losing runs | S–M |
| P0 | Release a leaked `resuming` claim when the child ends `failed`/throws; sweep stale `resuming` | A3 | S |
| P0 | Fix `waitForSelector` crystallize/replay mismatch + test that asserts the verification verdict | B1 | S |
| P0 | Security: enforce passcode on live/finding routes; scope share revoke by project+run; SSRF guard (`assertSafeUrl`) on author/walk start URLs and navigations; re-check `kci_` membership | C1-C3, C5 | S–M |
| P1 | F07 flag-only validator + surface `objective_verified`; verifier stub returns `achieved:false`; stop `PATCH status:"active"` bypassing approve | B4, B5 | M |
| P1 | Heal write-back re-persists semantic selectors; Tier 0 identity check falls through to Tier 1 | B2, B3 | M |
| P1 | Authoring timing in `steps_json` + `GET /api/trails/author/stats` (F13/F22) and selector stats (F23) | prerequisite for any performance claim | M |
| P2 | Central `isTransient(err)` table; make `failureKindForThrownError` inspect the error; idempotent-only step retry | F17/F18, B6 | M |
| P2 | Retention for `walk_artifacts`/S3; indexes; live-watch cleanup; findings query for PDF | D5-D7, B8 | M |
| P3 | F01, F09, F10, resume reconciliation | only after baselines | L |

---

## 10. Proposed next increments (smallest safe, test-first)
1. **Recoverable author exits** (P0): a failing test per path (snapshot exhaustion, `wd.tripped` + "Target closed", reaper with checkpoint) → route to `stall()`; reaper/boot sweep use `stalled` when a checkpoint exists. Reuses `stall()`; run the 40 loop-recovery tests with `--timeout 30000`.
2. **Resume-claim release** (P0): child terminal `failed` → `releaseAuthorResumeClaim`; boot sweep releases stale `resuming`; update the test at `trails-author-resume.test.ts:270`.
3. **`waitForSelector` selector persistence** (P0): crystallize keeps the selector (e.g. into `actionValue` or reads `locator_cache` at `runner:1372`) + a walk-verdict assertion.
4. **Share/SSRF hardening** (P0): passcode on live + findings routes, scoped revoke, `assertSafeUrl` on start URLs; route tests for each.
5. **Flag-only `validateTrajectory`** (P1) + UI badge; verifier stub honesty; `PATCH` cannot set `active` from `draft`.
6. **Heal persistence + Tier 0 identity** (P1) with a test that calls the real `resolveTarget` (currently only re-implemented in T9).
7. **Metrics** (P1): per-iteration `{tMs, stage}` into `AuthorStepLog`; `GET /api/trails/author/stats`; selector-tier stats query.

**Decisions still needed from you** (carried from the prior audit): F07 flag-vs-block (recommend flag + draft); accept deferral of F01/F09/F10 until baselines exist; how many QA2 verification actions are allowed after each increment (recommend fixture tests first); and whether to add the other deliverable documents per increment rather than now.

---
*Audit-only: no production code, schema, or data was changed. All sub-agent findings not listed in §0.2 are unverified reads and should be confirmed by a failing test before a fix is written.*
