# AutoSims Implementation Tracker

Baseline: `docs/AUTOSIMS_IMPLEMENTATION_STATUS.md` (do not edit; it is the audit record). Created 2026-11-20.
This tracker is the working plan. **No increment below is approved.** Production implementation starts only after the user explicitly approves one named increment.

Baseline integrity (sha256 prefix, so later edits are detectable):
`AUTOSIMS_IMPLEMENTATION_STATUS.md` = `eed8dc1295d54b4a…` (400 lines) · `AUTOSIMS_ARCHITECTURE_AUDIT.md` = `d119eb53621b9d6e…`

---

## 1. Decisions on record (from the user, 2026-11-20)

| # | Decision | Consequence |
|---|---|---|
| D1 | **F07 is flag-only.** Never block Trail activation. Distinguish **verified / unverified / RED / GREEN** verification states. Missing verification is never treated as successful verification. | INC-Q1 defines a 4-state verification model; the unconfigured verifier must stop reporting `achieved:true` |
| D2 | **F01, F09, F10 deferred.** Establish author timing and performance baselines first. | Not scheduled. INC-M1 (metrics) is their prerequisite |
| D3 | **QA2 verification:** local fixture tests must pass first; **max 5 explicitly approved QA2 scenarios per increment**; no production business actions or destructive operations without separate approval. | Each increment lists proposed QA2 scenarios as *proposals only*; none is approved |

Working rules: do not rebuild existing functionality · do not touch unrelated modules · one increment at a time, never combined · test-first (failing test committed/shown before the fix) · report exact changed files and test results · stop for approval after each increment.

---

## 2. Git reconciliation (verified 2026-11-20)

**Current state**
* Branch `Balaji_autosim-multiple-inputerror` @ `b0b5a7bb`; identical to `origin/Balaji_autosim-multiple-inputerror` (0 ahead / 0 behind).
* Tracked working-tree changes: only `prototype/local.db`, `-shm`, `-wal` (local dev database; not part of any increment).
* Untracked, not committed: `docs/AUTOSIMS_ARCHITECTURE_AUDIT.md`, `docs/AUTOSIMS_IMPLEMENTATION_STATUS.md`, this tracker, plus pre-existing scratch files (`autosim-lld.md`, `investigation-sims-autosim.html`, `plan-*.html`, `prototype/server*.log`, …).

**Was Increment 1 (F11) committed? Yes.** History:

| Commit | Date (2026) | What | In `origin/Dev`? | In `origin/master`? |
|---|---|---|---|---|
| `69551e13` | 11-16 16:58 | "retry dropped DB connections while saving a finished run; pause instead of failing". **The commit the architecture audit was recorded against** | No | No |
| `e7cf3c25` | 11-17 15:02 | **Increment 1 (F11)**: role+name and row-scoped selectors (5 files, +539/−8) | No | No |
| `2fcae2b2` | 11-17 15:48 | `Revert` of `e7cf3c25` (46 min later, by the author) | No | No |
| `b0b5a7bb` | 11-20 08:11 | `Reapply` of F11 (revert-of-the-revert, at the user's request this session). **HEAD** | No | No |

* The F11 files at HEAD are byte-identical to `e7cf3c25` (`git diff e7cf3c25 HEAD` on the 5 files is empty).
* `docs/AUTOSIMS_IMPLEMENTATION_PROGRESS.md` says "Nothing committed yet" — **stale**; it is tracked (re-added by the reapply) and F11 is committed. It was updated on 2026-11-20 with an update note and a commit-history table; its original implementation and test details are preserved unchanged.
* **None of the AutoSim reliability/selector work (`69551e13`, F11) is on `Dev` or `master`.** It lives only on this branch. Any increment that should reach Dev needs a PR from this branch (or a decision to branch from it).

**Reconciling the audit's recorded commit with HEAD**
* The audit (`ARCHITECTURE_AUDIT`) was written at `69551e13`; the status report was generated at `b0b5a7bb`. Between them there are **57 commits** (27 non-merge, of which 3 are F11/revert/reapply and 24 are unrelated Snap/dashboard work; the rest are Dev merges).
* AutoSim-relevant code changed between the two commits in exactly these files: `prototype/lib/trails-browser-page.ts` (+151, F11), `prototype/lib/trails-semantic-selectors.test.ts` (new), `prototype/lib/trails-pw-check.cjs` (new), `prototype/lib/trails-page-role-selectors.test.ts` (fixtures), `docs/AUTOSIMS_IMPLEMENTATION_PROGRESS.md`, and ~200 lines of `prototype/lib/db.ts` with **no** trail/author/walk/locator/findings/run_steps/autosim lines (checked by grep) and 5 unrelated lines in `prototype/server.ts`.
* **Conclusion:** line numbers in the *status report* are valid for HEAD. Line numbers in the older *architecture audit* are valid for everything except `trails-browser-page.ts` (shifted by F11). The status report supersedes the architecture audit wherever they differ.
* Relation to `Dev`: this branch is **27 ahead / 32 behind** `origin/Dev` and 27 ahead / 83 behind `origin/master`. Dev has since gained the KD-3121 and other work; do not assume the audit's test results hold on Dev.

**Open Git hygiene items (need your call, not done)**
1. Commit the two audit docs + this tracker as the baseline? (they are untracked; "preserve" is currently only a file on disk). Recommended: commit only these three docs in one docs-only commit.
2. Branch/PR strategy: keep adding increments on `Balaji_autosim-multiple-inputerror`, or one branch per increment off this branch (recommended: one branch per increment so each can be reviewed/reverted alone, as with e7cf3c25's revert).

---

## 3. Issue register (every issue identified in the audit)

IDs map to `AUTOSIMS_IMPLEMENTATION_STATUS.md` §7 (A–F) and the F01–F25 matrix. Severity: **H** loses work / security / wrong result, **M** degrades reliability or correctness, **L** hygiene. "Inc" is the proposed increment (§4).

### Reliability
| ID | Issue | Sev | Inc |
|---|---|---|---|
| A1 | Stale/boot sweep marks author sessions `failed` even with a checkpoint → not resumable | H | R1 |
| A2 | Snapshot exhaustion, browser death, watchdog-race → `failed` not `stalled` (F02, F16, F19) | H | R1 |
| A4 | Blue/green boot sweep fails the other slot's in-flight runs (no heartbeat/owner check) | H | R1 |
| A3 | `resuming` claim leak strands the original session (F15) | H | R2 |
| A5 | REST resume rejects `needs_auth` the engine allows | M | R2 |
| A9 | Checkpoint saves silent on failure; late save can overwrite newer; no version/seq (F14) | M | R2 |
| A8 | `acquireBrowser` (author) has no timeout/retry/fallback; late launch not closed; Steel fetch unbounded (F12) | M | R3 |
| A6 | Reaper does not free in-memory slot/browser; queued waiters never time out (F20) | M | R3 |
| A7 | Scheduler `touchScheduledLastRunAt` not a CAS; busy-retry in memory; UTC deadline for tz; `runWalkNow` blocks while queued | M | R3 |
| F17/F18 | `failureKindForThrownError` constant; scattered transient regexes; blind step retry (double-submit risk) (B6) | M | R4 |
| B10 | v1 API maps `stalled`/`failed` identically, never "cancelled"; `paused` walk not cancellable; `paused` never swept | L | R4 |

### Replay correctness
| ID | Issue | Sev | Inc |
|---|---|---|---|
| B1 | `waitForSelector` selector stripped at crystallize → replay RED (probable; not reproduced) | H | C1 |
| B2 | Tier 0 accepts `count===1` without identity check (wrong element goes GREEN) | H | C2 |
| B3 | Semantic/text heals never re-persisted (only id/testid/aria-label) → re-heal AMBER every walk; weak `domPath` persisted | M | C2 |
| B7 | `crystallize` not atomic (orphan trail); N+1 writes; `deleteTrailStep` orphans `locator_cache` | M | C3 |
| E | Duplicate selector builders (3), duplicate snapshot impls (2) | L | Q3 (cleanup, only after C2) |

### Security / authorization
| ID | Issue | Sev | Inc |
|---|---|---|---|
| C1 | Share passcode not enforced on live view and public finding create/file/dismiss | H | S1 |
| C2 | Share revoke not scoped by project/run | H | S1 |
| C4 | Public `/data` returns unmasked `walk`/`trail`; `realFiler` attaches 7-day presigned screenshot ignoring masking | M | S1 |
| B9 | CI status poll mints a 30-day share token per call | M | S1 |
| C3 | No SSRF guard on AutoSim start URL / navigations (`guardNavigations` never called) | H | S2 |
| C5 | `kci_` tokens not re-checked against live membership; MCP `start_authored_run` lacks `snapLocked`/quota; attachments + judge lack 402; snap-locked CI trigger → 500; `PATCH /api/trails/:id status:"active"` skips `/approve`'s `snapLocked` | H | S3 |
| C6 | Passcode unsalted SHA-256; unauthenticated `/api/health/busy`; no role check in `/api/trails/*` | M | S4 (needs a policy decision first) |
| F24 | Judge path unmetered (no `ai_calls`, daily cap, tenant budget, `snapLocked`; different env key) | M | S3 |

### Quality / verification (flag-only per D1)
| ID | Issue | Sev | Inc |
|---|---|---|---|
| F07 | No trail quality validation; `isPositionalSelector` dead; `objective_verified` unseen in UI | H | Q1 |
| B4 | Unconfigured verifier returns `achieved:true` → `objectiveVerified=true` | H | Q1 |
| B5 | Verification Walk verdict is returned but not recorded as a distinct state; RED walk still reported `crystallized` | M | Q1 |
| F05/F06 | No per-action outcome check; no stop-after-verified; no read-only/side-effecting class | M | Q2 |
| F08 | Per-step random model even with mix off; no escalation after a miss | L | Q2 |

### Metrics / observability (prerequisite for deferred F01/F09/F10)
| ID | Issue | Sev | Inc |
|---|---|---|---|
| F13 | No authoring timings persisted (launch/snapshot/LLM/verify) | M | M1 |
| F22 | No authoring analytics | M | M1 |
| F23 | No selector analytics | M | M1 |
| F21 | API lacks phase, retry count, elapsed | L | M1 |

### Performance / data hygiene
D1 unbounded history & per-step full snapshot (→ deferred F09/F10) · D2 `projectPrecision` loads 500 rows · D3 quadratic author-session poll payload · D4 recording RAM / video route buffering · D5 live-watch `states` leak · D6 missing indexes (`trail_runs(project_id, started_at)`, `findings(project_id, run_id)`, `walk_share_tokens(project_id, run_id)`) · D7 no retention for `walk_artifacts`/S3 · D8 scoped-tier CPU cost · B8 PDF findings capped at 500 → **Inc H1** (hygiene), except D1 (deferred).

### Test debt
29 failures in run A: 23 browser-launch (environment), 4 stale `dashboard.html` string pins, 1 `buildAuthorMessages` "PROJECT INSTRUCTIONS:" (unresolved), 1 Content-Length 413. Gated suites (`KLAV_E2E`/`RUN_BROWSER`/named-file-only) never run in default CI. No `snapshotPatiently`, loop-level guard, `resumeLostSession`, real-`resolveTarget`-with-semantic-selector, or share-route passcode tests → **Inc T1** (and each increment adds its own tests).

### Deferred (not scheduled)
F01 planning · F09 incremental snapshots · F10 context windowing · F15 resume reconciliation (L, depends on R1+R4) — revisit only after M1 produces baselines.

---

## 4. Proposed increments (isolated; none approved)

Order is a recommendation. Each increment is independent unless a dependency is stated, touches only the listed area, and ends with a stop for approval. Recommended order: **R1 → R2 → C1 → S1 → S2 → S3 → Q1 → C2 → M1 → R3 → R4 → C3 → H1 → T1 → S4 → Q2/Q3**.

**Common to every increment:** (1) write failing tests first and show them failing; (2) implement the minimum; (3) run the increment's tests and `trails-author-loop-recovery.test.ts` with `--timeout 30000` where the loop is touched; (4) full AutoSim suite vs the recorded baseline (§5) to prove no new failures; (5) report exact files changed + results; (6) stop. QA2 scenarios (max 5, user-approved, non-destructive) only after (3)-(4) pass.

### INC-R1: Recoverable author exits  (A1, A2, A4)  — Reliability, H
* **Change:** author exits that have a checkpoint (snapshot exhaustion, `wd.tripped`, browser-closed errors) go through `stall()`; stale-heartbeat reaper and boot sweep set `stalled` (not `failed`) when `checkpoint_json` exists; boot sweep skips rows with a fresh heartbeat.
* **Likely files:** `lib/trails-author.ts` (outer catch), `lib/db.ts` (`sweepStaleAuthorSessions`, `sweepOrphanedAuthorSessions`), `lib/trails-reaper.ts`; tests in `trails-author-loop-recovery.test.ts`, `trails-reaper.test.ts`, `trails-author-resume.test.ts`.
* **Tests first:** hanging `krefSnapshot` → stalled + resumable; "Target closed" with checkpoint → stalled; reaper/boot sweep with and without checkpoint; fresh heartbeat not swept.
* **Local gates:** loop-recovery 40/40, reaper, resume, E2E subset that can run here.
* **Proposed QA2 scenarios (not approved):** none required if fixture tests are green; at most 1 read-only author run on a non-business page to confirm resume offer.
* **Out of scope:** resume reconciliation (F15), claim release (R2), classifier (R4).

### INC-R2: Resume claim integrity  (A3, A5, A9)  — Reliability, H
* **Change:** release the prior `resuming` claim when the child ends `failed`/throws before a checkpoint; sweep stale `resuming`; align REST resume with engine on `needs_auth`; checkpoint `v`/`seq` + log failed saves, reject out-of-order writes.
* **Files:** `lib/trails-author.ts` (claim/release), `lib/db.ts`, `server.ts` resume route (`:12013` check only); tests in `trails-author-resume.test.ts` (update the assertion at `:270`), a new route test for `/resume`.
* **Depends on:** none (independent of R1; do after to share the sweep code).

### INC-C1: `waitForSelector` crystallize/replay mismatch  (B1)  — Replay correctness, H
* **Change:** first **reproduce** with a failing test that asserts the Verification Walk/replay verdict for a `waitForSelector` trail; then persist the selector (read `locator_cache` at `runner:1372` or keep it in `actionValue`/target). Smallest of the fixes.
* **Files:** `lib/trails-crystallize.ts` and/or `lib/trails-runner.ts:1368-1386`; test beside `trails-author.upload-chatbot.e2e.test.ts` (must run without Chromium: use a fake page so it runs here).
* If the failing test passes (bug not real), record that and close without code.

### INC-S1: Share-link hardening  (C1, C2, C4, B9)  — Security, H
* **Change:** enforce `checkSharePasscode` on `/shared/walk-live/:tok` and the public findings routes; scope `revokeShareToken` by project+run; mask `walk`/`trail` in public `/data` and stop attaching a presigned screenshot URL under masking; stop minting a token per CI poll.
* **Files:** `server.ts` (public share routes ~9373-9540, CI poll ~10208-10238), `lib/trails-share.ts`, `lib/trails-findings-gate.ts` (`realFiler`), `lib/data-masking.ts`.
* **Tests first:** route tests with a passcoded token for each route; cross-project revoke → 404; masked `/data` snapshot test.
* **QA2:** none needed (fixture routes); any live check must be read-only.

### INC-S2: SSRF guard on the AutoSim browser  (C3)  — Security, H
* **Change:** validate start URL (`assertSafeUrl`, https-only, no private/link-local/metadata) at `/api/trails/author`, `/api/sims/:id/autosim`, `/api/v1/authored-runs`, MCP; wire `guardNavigations` into the author and walk browsers for in-flow navigations. Decide first whether internal/staging hosts need an allowlist (customers testing `localhost`/private environments is a product decision: **ask before implementing**).
* **Files:** `server.ts` start routes, `lib/trails-author.ts`, `lib/trails-runner.ts`, `lib/url-guard.ts` (reuse).

### INC-S3: Plan gates and token authorization  (C5, F24-judge, `PATCH status:"active"` snapLocked bypass)  — Security/billing, H
* **Change:** live-membership recheck for `kci_` tokens on `/api/ci/*`, `/api/v1/runs*`, `/api/v1/authored-runs*`; `snapLocked` + flow quota on MCP `start_authored_run`, attachments upload and judge; snap-locked CI trigger → 402 not 500; `PATCH /api/trails/:id` setting `active` applies the same `snapLocked` check as `/approve` (**does not block activation** otherwise, per D1); route the judge call through `recordAiCall` + daily cap.
* **Files:** `server.ts` (listed routes), `mcp/tools.ts:122`, `lib/trails-trigger.ts:112`, `lib/trails-judge.ts`.

### INC-Q1: F07 flag-only verification state  (F07, B4, B5)  — Quality, H
* **Change (flag only, never blocks):** introduce an explicit verification state on the trail/session, e.g. `objectiveVerified: verified | unverified | unavailable` and `verificationWalk: green | red | not_run`, stored in existing columns/JSON where possible (migration only if unavoidable, to be approved separately). Pure `validateTrajectory` returns `{positionalSteps, consecutiveDuplicateSteps, objectiveVerified, walkVerdict}`; unconfigured verifier returns `achieved:false` with `reason:"unverified"` (**missing verification is never success**); surface the flags in the draft review UI and v1 API. Wire the unused `isPositionalSelector`.
* **Tests first:** pure `validateTrajectory` table tests; verifier stub → unverified; a RED Verification Walk is recorded as RED, not hidden by `crystallized`.
* **Files:** `lib/trails-author.ts` (post-loop, ~1523-1574), `lib/trails-author-model.ts:383`, `lib/trails.ts`, `lib/v1-authored.ts`, `dashboard.html` draft-review block.
* **Explicit non-goals:** no blocking of approve/activate; no change to crystallization.

### INC-C2: Replay selector correctness  (B2, B3)  — Replay correctness, H
* **Change:** Tier 0 hit with `fp.role/accessibleName` mismatch falls through to Tier 1 (evidence-logged, not RED); heal write-back persists role+name/text selectors; stop persisting the weak 4-level `domPath`. **Depends on:** a test that calls the real `resolveTarget` against semantic selectors (new), and on F11 being verified on a machine where Playwright launches.
* **Files:** `lib/trails-runner.ts:481-581, 1596`. Highest regression risk in the list; QA2 only after the fixture suite is green.

### INC-M1: Authoring timing and analytics  (F13, F21, F22, F23)  — Metrics, M
* **Change:** per-iteration `{tMs, stage}` appended to `AuthorStepLog` (`steps_json`, no schema change); `GET /api/trails/author/stats` (`GROUP BY status` over `author_sessions`); selector-tier stats query over `run_steps`/`locator_cache`; expose stage/retries/elapsed on `GET /api/trails/author/:id`. **This produces the baselines D2 requires before F01/F09/F10.**
* **Files:** `lib/trails-author.ts`, `server.ts` (new read-only routes), a small aggregation module; unit tests on aggregation.

### INC-R3: Browser acquire and slot lifecycle  (A6, A7, A8)  — Reliability, M
* `withAcquireTimeout` + close-late-handle on the author path, AbortSignal on the Steel fetch, queue-wait timeout, scheduler CAS (`WHERE scheduled_last_run_at < ?`), tz-aware deadline, non-blocking busy check. Tests with injected fakes (exists in `trails-browser-page.test.ts`).

### INC-R4: Error classification and idempotent retry  (F17, F18, B6, B10)  — Reliability, M
* One `isTransient(err)` table; `failureKindForThrownError` inspects the error; `withStepRetry` retries only pre-action failures (locator/visibility), never a possibly-fired click/type/select; v1 status mapping; allow cancelling `paused`; sweep `paused`. Depends on R1/R2 landing first.

### INC-C3: Crystallize atomicity  (B7)  — Replay correctness, M
* Single-transaction (or compensating delete) crystallize; batch inserts; delete the `locator_cache` row with the step.

### INC-H1: Data/perf hygiene  (D2–D8, B8)  — M/L
* Retention for `walk_artifacts`/S3, indexes, live-watch cleanup + caps, findings-by-run query for the PDF, precision count query, poll payload slimming. Split further if it grows; each sub-item must stay test-first.

### INC-T1: Test debt  — L
* Fix or delete stale `dashboard.html` string pins (4), resolve `buildAuthorMessages` "PROJECT INSTRUCTIONS:" (determine stale vs real regression first), diagnose the 413 test, add the missing tests listed in the audit (`snapshotPatiently`, loop-level guards, `resumeLostSession`, share passcode routes), make the gated suites runnable in CI (Linux) and document how.

### INC-S4: Policy-dependent security  (C6)  — needs a decision before scoping
* Role model for `/api/trails/*` (who may approve/share/file), passcode hashing (salted/slow), `/api/health/busy` auth. Not startable until the policy is decided.

### INC-Q2 / INC-Q3: Later quality  (F05/F06/F08; duplicate selector/snapshot cleanup)
* After R/C/Q1 and M1. Q3 (consolidating the three selector builders and two snapshot implementations) only after C2 and with the real-browser suites runnable.

---

## 5. Test baseline for regression comparison (from the audit, run A, default flags)
1,124 tests / 107 files: 955 pass · 140 skip · **29 fail** (936 s). The 29 are listed in `AUTOSIMS_IMPLEMENTATION_STATUS.md` §6.2 and saved outside the repo at the scratchpad (`fails-default.txt`). **Rule:** an increment passes the regression check only if its failing set is a subset of this list (same names) and it adds no new failures. The `KLAV_E2E=1` run did not complete (53 failures seen, killed at 1,500 s); a complete E2E baseline requires a machine where Playwright launches, and until then E2E results are not comparable.

## 6. Status board

| Increment | Issues | Approval | Status |
|---|---|---|---|
| (git) commit audit docs + tracker | baseline | **needs your OK** | not committed |
| R1 Recoverable author exits | A1 A2 A4 | not approved | proposed |
| R2 Resume claim integrity | A3 A5 A9 | not approved | proposed |
| C1 `waitForSelector` mismatch | B1 | not approved | proposed |
| S1 Share-link hardening | C1 C2 C4 B9 | not approved | proposed |
| S2 SSRF guard | C3 | not approved (policy question first) | proposed |
| S3 Plan gates / token auth | C5 F24 | not approved | proposed |
| Q1 F07 flag-only verification state | F07 B4 B5 | not approved | proposed |
| C2 Replay selector correctness | B2 B3 | not approved | proposed |
| M1 Timing and analytics | F13 F21 F22 F23 | not approved | proposed |
| R3 Acquire / slot lifecycle | A6 A7 A8 | not approved | proposed |
| R4 Classification / idempotent retry | F17 F18 B6 B10 | not approved | proposed |
| C3 Crystallize atomicity | B7 | not approved | proposed |
| H1 Data/perf hygiene | D2–D8 B8 | not approved | proposed |
| T1 Test debt | — | not approved | proposed |
| S4 Policy-dependent security | C6 | blocked on policy decision | proposed |
| Q2 / Q3 | F05 F06 F08 / dup cleanup | not approved | later |
| F01 F09 F10 | — | **deferred (D2)** | deferred |
| F15 reconciliation | F15 | deferred until R1+R4 | deferred |

QA2 scenarios approved so far: **0**. Production business actions approved: **none**.
