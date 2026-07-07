# AutoSim / Trails Improvement Spec — functionality, usability, stability

**Date:** 2026-07-07 · **Status:** approved direction, tickets filed in Plane (KLAVITYKLA)
**Source:** 6-area parallel codebase audit (authoring, runner, lifecycle, findings, UI, docs/roadmap) — 83 raw gaps, deduped + re-prioritized to 76 work items.

## 1. Positioning

Competitor: [Momentic](https://momentic.ai) — deterministic YAML tests, self-healing cached selectors, CI-native, network mocking, MCP server. We do **not** compete head-on. Klavity is **Customer-Sim-first QA**: AutoSim walks are judged through customer personas and produce product-improvement insights; deterministic regression verdicts are the retention spine underneath. We still need Momentic's table-stakes (scheduling, CI, queue, evidence) — Phases 1 & 3 — but the wedge is Phase 2.

## 2. Locked decisions (user, 2026-07-07)

| Decision | Choice |
|---|---|
| Target user | **Self-serve external customers** (not just dogfooding) |
| Primary run output | **Insight report first** — customer-walkthrough narrative, then pass/fail |
| Insight engine | **Persona-judged walks** (Plan H v1) — existing Sims judge each walk |
| Auth for gated apps | Email+password test accounts now; support app test-mode conventions (e.g. `?test_mode=true` accepts any password) via a per-project **instructions.md** the author model reads |
| Run triggers | **Full matrix**: manual + scheduled + deploy-webhook/CI |
| Run infrastructure | **Steel.dev remote browsers** for all runs via the AUTOSIM_CDP_URL adapter seam (2026-07-04 spike) — prod box orchestrates only |
| Ticket granularity | Individual tickets (76 after merging 6 literal duplicates + 1 subsumed summary; +1 new from auth decision) |

## 3. How the system works today (audit summary)

### AutoSim Trail authoring flow (NL objective → LLM-driven browser → Draft Trail → Verification Walk), files under /Users/vishalkumar/Downloads/qbug/klav-snap/prototype/lib/

Note: the requested `trails-draft-gate.ts` does not exist as a source file — the draft-gate is implemented inside trails-runner.ts (trails-runner.ts:319-321: `suppressFindings` defaults to `trail.status === "draft"`) and is covered by trails-draft-gate.test.ts:68-111.

END-TO-END FLOW:

1. ENTRY (fire-and-poll): `runAuthorNow` (trails-author.ts:239-284) acquires the SINGLE global walk slot via `withWalkSlot` for the WHOLE attempt (drive + verification); a concurrent request rejects synchronously with WalkBusyError (trails-author.ts:252-259). It creates an `author_sessions` DB row (trails-author.ts:187-196), resolves the sessionId back to the caller immediately, and runs `authorTrail` in the background; the UI polls `getAuthorSession` (trails-author.ts:212-230). Step progress is persisted via `onStep → updateAuthorSession` with errors swallowed (trails-author.ts:264).

2. SETUP: `authorTrail` (trails-author.ts:41-176) resolves an optional test account into `{{cred:name:email}}` / `{{cred:name:password}}` placeholders — the model only ever sees placeholders; values are resolved at fill time and never logged (trails-author.ts:50-55, 131, header comment lines 4-6). Browser comes from an adapter seam: local Playwright by default, Puppeteer→Steel over CDP when AUTOSIM_CDP_URL is set (trails-author.ts:67-69). It navigates to baseUrl (20s timeout, line 76) and records the initial navigate as TrajectoryStep 0 (lines 79-82).

3. DRIVE LOOP (max AUTHOR_MAX_STEPS=40, line 20/83): each iteration checks the $0.15 cost cap (lines 21, 84) and a 300s overall drive deadline added after a prod incident where a hung page op held the walk slot indefinitely (lines 60-66, 85). Text-first is the DEFAULT: happy-path calls send only the kref DOM snapshot; a miss escalates by re-attaching a JPEG screenshot (lines 45-48, 86-89; verified by trails-author.textfirst.test.ts:45-72; kill switch KLAV_AUTHOR_TEXT_FIRST=0, test line 73-84). Every per-iteration op (snapshot, screenshot, model call, locator count, fingerprint) is individually time-bounded via a Promise.race helper (lines 65-66, 88-93, 118-126).

4. MODEL CALL: `openRouterAuthorModel` (trails-author-model.ts:90-123) reserves against the daily AI spend cap before calling (line 94), picks a model by weighted roulette with qwen3-vl fallback (lines 88, 95), 90s AbortController timeout (line 96), sends AUTHOR_SYS (one strict-JSON action per call; untrusted-content fencing of page URL/snapshot; kref [data-kref="eN"] selectors preferred; {{cred}} placeholders literal; lines 26-37, 45-46), reconciles estimated→actual spend and records an `ai_calls` ledger row (lines 106-117). `parseAuthorAction` (lines 65-85) strips think-tags/fences, validates op/required fields, and returns a `parseError`-flagged stall sentinel for malformed replies (lines 58-63).

5. ACTION HANDLING: a parse-error stall is a retryable "miss" (up to MAX_CONSECUTIVE_MISSES=3, trails-author.ts:22, 97-104 — KLAVITYKLA-48 fix); a deliberate model stall immediately ends the run as "stalled" with the model's rationale (line 106); "done" breaks the loop (line 107). Element ops require the selector to match EXACTLY ONE element (lines 118-119), capture a multi-signal fingerprint (line 120), and convert ephemeral kref selectors to a stable persisted selector (stableSelector → fp.domPath → original; lines 121-127). `wait` clamps to 500-15,000ms (line 111). Failures append a dekref'd error to model-visible history and count a miss; 3 consecutive misses → stalled (lines 28, 145-153).

6. CRYSTALLIZE: on "done", the trajectory becomes a durable Trail — `crystallize` (trails-crystallize.ts:80-123) creates the trail + ordered steps and seeds a `locator_cache` row (confidence 1.0, source "crystallize") for every step with a resolved selector so the heal path always has a row to update (lines 102-119); `stepCacheKey` is a SHA256 page-state fingerprint (lines 53-62). The trail is set to "draft" (trails-author.ts:162).

7. VERIFICATION WALK: a zero-LLM rehearsal via `walkTrail` with suppressFindings + 180s deadline (trails-author.ts:163-168); draft trails never file findings even without the flag (trails-runner.ts:319-321, trails-draft-gate.test.ts:68-90). A "skip" verdict maps to amber so an empty walk never looks like a regression (trails-author.ts:169-171). Outcome statuses: "crystallized" | "stalled" (with exact stallReason for stop-show-refine UX) | "failed" (lines 32-37).

8. EXPORT: `generatePlaywright` (trails-codegen.ts:14-65) emits a standalone @playwright/test file string from trail + steps + selector map — the "no lock-in" artifact (header lines 1-3), via `crystallizeToCode` (trails-crystallize.ts:129-136).

### AutoSim run/execution engine (Trail walker): klav-snap/prototype/lib/trails-runner.ts + trails-browser-page.ts, trails-browser.ts, trails-click.ts, trails-vision.ts, trails-replay.ts, trails-trigger.ts

EXECUTION MODES. The engine has three tiers of "how a step's target gets resolved" plus a separate LLM author drive. (1) Deterministic replay (Tier 0): each actionable step looks up its cached concrete selector in locator_cache (trails-runner.ts:483-487) and uses it verbatim if it matches exactly one element (trails-runner.ts:237-246). Zero LLM. (2) Deterministic self-heal (Tier 1): if the cached selector matches 0 elements, a no-LLM candidate ladder tries role+accessible-name (conf 0.95) → visible text with role-consistency check (0.88) → data-testid (0.92) → structural domPath (0.80) (trails-runner.ts:135-140, 249-281). A Tier-1 hit executes the action, marks the step AMBER (never green, spec §6.3, trails-runner.ts:636), and persists the healed selector back to locator_cache so the next walk is Tier-0 again ("heal-as-cache-update", trails-runner.ts:621-632). An ambiguous cached selector (>1 match) fails RED immediately with an 'ambiguous_selector' finding rather than healing arbitrarily (trails-runner.ts:158-162, 507-533). (3) Vision Tier 2: only when a VisionResolver is injected via WalkOptions.vision (trails-runner.ts:35, 551-552). It sends a PNG screenshot + a kref element-tree snapshot + step intent/fingerprint/failed-candidate-selectors to an OpenRouter vision model (buildVisionMessages, trails-vision.ts:53-67; 90s AbortController timeout at trails-vision.ts:103) and maps the JSON reply through a pure decision core decideFromVision with a >=0.9 confidence gate: 'removed' → regression RED + deduped finding; found+selector+conf>=gate → heal (re-verified for unique match + role consistency, acted on, AMBER, persisted); else amber_low_conf → AMBER queue-only finding, never acted on (trails-vision.ts:28-36; trails-runner.ts:753-851). An assert whose target is gone short-circuits to RED before any model call — healing never overrides a checkpoint (trails-runner.ts:691-706). Unparseable model output degrades to a safe sentinel instead of throwing (trails-vision.ts:71-91). KREF ELEMENT TREE: captureKrefSnapshot/krefSnapshotBody walks the visible DOM and emits a compact indented text tree of roles + accessible names, stamping interactive elements with data-kref="eN" attrs the model can reference as [data-kref="eN"] (trails-browser-page.ts:15-84), capped at KREF_SNAPSHOT_CAP=24,000 chars (trails-snapshot.ts:11). krefs are never persisted to cache — a kref heal is converted to a stable selector (#id/[data-testid]/[aria-label]) or domPath or a live structural path, else persistence is skipped and the next walk re-heals (trails-runner.ts:793-804). DEADLINES: WalkOptions.deadlineMs is a wall-clock budget checked at the TOP of each step; blowing it breaks the loop and finalizes RED with summary.error="deadline_exceeded" (trails-runner.ts:337, 382, 424). Every page operation is additionally bounded by opTimeout = clamp(3s..15s, deadlineMs) via setDefaultTimeout/setDefaultNavigationTimeout so nothing falls back to Playwright's 30s default (trails-runner.ts:344, 368-370). Actions use a hard-coded ACTION_TIMEOUT=5000 (trails-runner.ts:577). Prod-triggered walks use WALK_DEADLINE_MS=120,000 (trails-trigger.ts:18, 28); the author drive uses 180s (trails-author.ts:166). Authored 'wait' steps honor actionValue as a minimum (capped 15s) then settle on networkidle (trails-runner.ts:470-480). BROWSER LIFECYCLE & CONCURRENCY: each walk launches a fresh local chromium (trails-runner.ts:328) closed in a finally (trails-runner.ts:445); prod passes CHROMIUM_PROD_ARGS (--single-process --no-sandbox --disable-dev-shm-usage --disable-gpu --no-zygote) for the 1GB box (trails-browser.ts:22-24). Concurrency is a per-process boolean mutex — withWalkSlot throws WalkBusyError if a walk is in flight (trails-browser.ts:11-18), surfaced as HTTP 409 (server.ts:2921); the comment itself notes >1 worker would break the invariant (trails-browser.ts:9-10). runWalkNow reserves the slot, creates the Walk row, returns runId immediately, and drives the walk in the background with crash isolation (a throw finalizes RED, never propagates) (trails-trigger.ts:39-81). A separate BrowserPage adapter (Playwright local vs Puppeteer-over-CDP/Steel when AUTOSIM_CDP_URL is set) exists but serves only the AUTHOR drive — the runner is still hard-coupled to local Playwright (trails-browser-page.ts:1-7, 202-223). CLICKS: clickWithTransitionFallback does the real Playwright click, then for Klavity shell pages sniffs inline onclick source for go()/chooseGoal()/setView() intents; if the expected state didn't appear after 200ms it invokes the page's own transition function directly as a fallback (trails-click.ts:14-98). EVIDENCE & REPLAY: every step writes exactly one run_step row with tier/verdict/confidence/diagnosis/evidence (reason codes like ambiguous_selector, element_gone, checkpoint_failed, action_failed, vision_error, vision_regression, vision_low_confidence); every RED accumulates a human-readable reason so a red walk is never silent (KLAVITYKLA-48, trails-runner.ts:333-335, 396, 433). Opt-in per-step JPEG(q45) screenshots upload to S3 and land in evidence.screenshotKey (best-effort try/catch, skipped for navigate/wait, trails-runner.ts:297-309); prod trigger enables stepShots and rrweb replay (trails-trigger.ts:28-29). rrweb capture injects the recorder per-document via addInitScript with an in-page buffer + 250ms drain timer (deadlock avoidance), seals per-page segments at navigation boundaries, and gzips the segment array into walk_replays after finishWalk — all best-effort (trails-replay.ts:104-184, 27-35; trails-runner.ts:349-361, 398-419, 427-432). Vision cost is ledgered in ai_calls only on 2xx responses (trails-vision.ts:117-123; trails-runner.ts:113-118). Draft trails suppress findings but keep run_steps (trails-runner.ts:319-321). Credential placeholders {{cred:...}} resolve only at fill time; evidence keeps the placeholder (trails-runner.ts:582-583).

### Klavity OS Trails / AutoSims — data model, run lifecycle, triggering, credentials, expectations spine (root: /Users/vishalkumar/Downloads/qbug/klav-snap/prototype)

All paths relative to /Users/vishalkumar/Downloads/qbug/klav-snap/prototype. Note: lib/trails-status-backfill.ts does not exist; that logic is backfillTrailStatus() in lib/db.ts:692-704.

(1) DATA MODEL & LIFECYCLE. Core tables in lib/db.ts: trails (261-274; status TEXT default 'draft', base_url, baseline_ref, author_kind llm|human|mixed, intent), trail_steps (275-286; idx-ordered, action + action_value + target_json fingerprint + checkpoint_json), locator_cache (287-303; one resolved selector per (project, step), source crystallize|heal, confidence), trail_runs aka Walks (304-315; trigger default 'manual', status running|green|amber|red|skip, llm_calls, summary_json), run_steps (316-331; per-step tier cache|candidate|vision|none, verdict, diagnosis FailureClass, healed flag, evidence_json), findings (332-350; kind regression|visual|amber_heal, dedup_key, recurrence, status queued|auto_filed|filed|dismissed, connector_ref), walk_replays (354-363; gzipped rrweb), walk_share_tokens (445-454; expiring no-login PDF links), author_sessions (432-439; one row per LLM "New Trail" authoring attempt, polled by UI, tracks verification_run_id/verdict + cost_usd). Types in lib/trails-types.ts: TrailStatus = draft|active|archived (:3), StepAction navigate|click|type|select|assert|wait (:5), Walk.trigger typed literally "manual" (:43).

Lifecycle: createTrail always inserts status='draft' (lib/trails.ts:16-27). Trails become 'active' three ways: (a) human approval endpoint POST approve — "only Active trails file findings" (server.ts:2951), (b) demo seed explicitly activates its 4 seeded trails (lib/trails-demo-seed.ts:91-93), (c) a one-time guarded migration promoted pre-existing drafts that weren't LLM-authored (lib/db.ts:685-704, key 'trails_status_backfill_2026_07_03' — added because default-draft silently suppressed ALL findings for ALL live trails). Draft-gate at run time: walkTrail sets suppressFindings when trail.status==='draft', and verification walks always suppress (lib/trails-runner.ts:319-321). Runs: startWalk inserts trail_runs with trigger hardcoded to "manual" (lib/trails.ts:129-137), addRunStep records per-step verdict/tier/heal evidence (:139-150), finishWalk finalizes status+llm_calls+summary (:152-157). Dashboard aggregates trails + last 20 walks + queued findings + precision metric (lib/trails-dashboard.ts:16-24, lib/trails.ts:175-178). Enforce graduation: insertAssertStep splices a deterministic assert step into an existing trail at afterStepIdx+1, shifting later idx values in place (lib/trails.ts:247-266).

(2) SCHEDULING/TRIGGERING: there is NO cron, NO CI integration, NO webhook. The only trigger is on-demand: POST /api/trails/:id/walk (server.ts:2911-2918) calls runWalkNow (lib/trails-trigger.ts:39-81), which reserves a SINGLE global walk slot (withWalkSlot; a concurrent call throws WalkBusyError → HTTP 409 "AutoSim busy", server.ts:2689, 2942, 2982), creates the Walk row, returns runId immediately, and drives the walk in the background with a fixed 120s deadline (WALK_DEADLINE_MS, lib/trails-trigger.ts:18). Crashes are isolated: a walk throw finalizes the run red with {error} in summary_json and never propagates (lib/trails-trigger.ts:67-70). The trail_runs.trigger column (db.ts:308) anticipates other trigger kinds but the type system only allows "manual" (trails-types.ts:43). A grep for cron/schedule/setInterval/webhook/CI across lib/trails*.ts confirms nothing else exists (only an unrelated rrweb drain interval in trails-replay.ts:148).

(3) TEST-ACCOUNT CREDENTIALS (ADR-0001): test_accounts stores password_enc AES-GCM-encrypted via lib/crypto.ts with the KLAV_SECRET envelope key (lib/test-accounts.ts:1-5, 24-29; db.ts:364-371, UNIQUE(project_id,name)). Only getTestAccountSecret decrypts (lib/test-accounts.ts:51-62) — "run-time only (runner / authoring engine). Never expose through a route"; list/get APIs return metadata only (server.ts:3719 "Secret write-only; never returned"). Trails never persist secrets: step values store placeholders {{cred:<account>:email|password}} (CRED_RE, lib/trails-creds.ts:6), resolved live at run time by resolveCredRefs (lib/trails-creds.ts:15-25); evidence keeps the placeholder and screenshots dot passwords (:1-3).

(4) FINDINGS → EXPECTATIONS SPINE: recordFinding (lib/trails.ts:192-228) dedups against any prior open OR dismissed row for (project, dedup_key) — a human dismissal permanently suppresses recurrence (§6 anti-slop, :196-215). Both the new-finding path and the dedup-bump path do a best-effort ingestFinding into the spine (:210-214, :222-226; failures only warn). ingestFinding (lib/expectations-ingest.ts:42-60) → upsertExpectation (lib/expectations-db.ts:34-67): tries exact dedup_key match, else lexical title similarity ≥0.82 across the project's expectations (matchExpectation, lib/expectations.ts:29-40) — this lexical fallback is how AutoSim findings (their own dedup keyspace) collapse onto Snap/Sim-originated expectations. mergeSource records corroboration {snap, sim, recurrence} — note kind 'finding' sets NEITHER flag, only bumps recurrence (lib/expectations.ts:12-18). Status graduates candidate→validated when (snap && sim) || recurrence ≥ 3 (:20-27). validated→enforced is human-confirmed: setExpectationEnforced stores the enforced_step_id (lib/expectations-db.ts:73-75) of the assert step crystallized via insertAssertStep. Separately, the findings gate (lib/trails-findings-gate.ts) defines auto-file policy (regression + confidence ≥ 0.9, :21-33) and files tickets to the project's auto-copy connector (realFiler, :147-170; buildTicketFromFinding :119-142), publishes precision = filed/(filed+dismissed) (:38-46) — but the auto-file executor processWalkFindings is INTENTIONALLY INERT, not wired into the runner (:57-60); the live path today is the human review queue (fileFindingById/dismissFinding, :87-109).

### AutoSim (Klavity OS Trails) findings pipeline: gating, classification, reports, sharing, per-step screenshots

NOTE: `trails-stepshots.ts` does not exist as a module — only the test file `prototype/lib/trails-stepshots.test.ts`; the step-screenshot implementation lives inside `trails-runner.ts`. All paths below are under /Users/vishalkumar/Downloads/qbug/klav-snap/prototype/.

FINDING CREATION (runner). A Walk emits findings via recordFinding at exactly 4 points in lib/trails-runner.ts: (a) ambiguous selector → kind "regression", confidence 1.0, dedupKey `ambiguous_selector:${trailId}:${step.id}` (trails-runner.ts:511-519); (b) checkpoint target gone (assert reached vision tier) → hard "regression", confidence 1, dedupKey `${trailId}:${step.id}:checkpoint-gone`, no model call (trails-runner.ts:690-706); (c) vision model classifies "regression" → grounded finding with rationale as groundQuote, dedupKey `${trailId}:${step.id}:gone` (trails-runner.ts:754-770); (d) low-confidence/unconfirmed heal → kind "amber_heal", dedupKey `${trailId}:${step.id}:lowconf`, queue-only (trails-runner.ts:855-873). Draft-trail verification walks suppress all findings via suppressFindings (trails-runner.ts:80-84). FindingKind is regression|visual|amber_heal and FindingStatus queued|auto_filed|filed|dismissed (lib/trails-types.ts:11-12).

DEDUP AT RECORD TIME. lib/trails.ts:192-228 recordFinding collapses onto ANY prior row for (project, dedupKey) in states queued/auto_filed/filed/dismissed: it bumps recurrence + updated_at and never changes status — so a human dismissal permanently suppresses that dedupKey (anti-slop guarantee, trails.ts:196-208). Every insert/dedup also best-effort feeds the expectations spine via ingestFinding (trails.ts:210-213, 222-226).

GATING. lib/trails-findings-gate.ts: decideFindingAction returns "auto_file" iff kind==="regression" AND confidence >= 0.9 (AUTO_FILE_THRESHOLD, lines 21, 28-33); everything subjective queues. CRITICALLY, the auto-file executor processWalkFindings (lines 61-81) is INTENTIONALLY INERT — the comment at lines 56-60 states it is NOT wired into walkTrail/the runner; the live path today is the human review queue only: fileFindingById (lines 87-98, only files still-'queued' findings, never dismissed/already-filed) and dismissFinding (lines 104-109). A published precision metric = filed/(filed+dismissed), queued excluded (projectPrecision, lines 38-46), surfaced on the dashboard aggregate (lib/trails-dashboard.ts:16-24: trails + last-20 walks + queued findings + precision).

TICKET CONNECTOR. buildTicketFromFinding (trails-findings-gate.ts:119-142) shapes a TicketPayload with rationale + groundQuote + heal from→to diff + run/step ids; severity is derived ONLY from kind: regression→"high", visual→"low", else "medium" (lines 115-117); url is null and klavityUrl is just the trails page. realFiler (lines 147-170) takes the project's FIRST auto-copy connector, decrypts secret fields, calls adapter.createIssue, returns "type:externalKey"; all errors are swallowed (empty catch, lines 165-167) and the finding stays queued. HTTP surface: POST /api/trails/findings/:id/file and /:id/dismiss (server.ts:2884-2900).

REPORTS. lib/trails-report.ts: gatherWalkReport (lines 21-78) loads walk (IDOR-guarded, line 29), trail, run steps, and findings filtered to the runId (lines 63-65); each step's evidence.screenshotKey is presigned to an S3 URL (1h TTL) with a silent "" fallback when S3 env is absent (lines 38-46). renderWalkReportHtml (lines 98-346) renders a branded, script-free, HTML-escaped report: verdict banner, objective, meta row (duration/LLM calls/heal count, lines 304-314), step timeline with selector, heal from→to diff, checkpoint, rationale and inline screenshot (lines 162-215), and findings cards with kind pill, confidence %, and grounded quote (lines 229-246).

SHARING + PDF. lib/trails-share.ts: mintShareToken stores only the sha256 of a 32-byte random token in walk_share_tokens with a default 30-day TTL (lines 25-50); resolveShareToken hash-lookups and checks expiry (lines 56-73). renderWalkPdf (lines 79-133) gathers + renders the HTML then launches headless Chromium UNDER withWalkSlot with a 30s deadline, waiting for all <img> to settle before page.pdf (lines 101-131). Routes: POST /api/trails/walks/:runId/share mints the link (server.ts:2987-2996); GET /shared/walk-report/:token serves the PDF anonymously, rate-limited 30/min/IP (server.ts:2670-2676).

PER-STEP SCREENSHOTS. Opt-in WalkOptions.stepShots + injectable shotUploader (trails-runner.ts:86-99). maybeShot (trails-runner.ts:297-309) captures a JPEG quality-45 AFTER each actionable step settles (also on failure states: lines 492, 522, 557, 601, 639), skips navigate/wait, uploads via defaultShotUploader→uploadScreenshotMeta/S3 (lines 287-290), and merges the key into run_step evidence as screenshotKey; any capture/upload failure is best-effort swallowed. Production walks DO enable this: realWalk in lib/trails-trigger.ts:27-30 passes stepShots:true and replay:true, with a 120s walk deadline (trails-trigger.ts:18). Concurrency: a per-process boolean mutex allows exactly ONE browser at a time on the 1GB box (lib/trails-browser.ts:8-18) with low-memory Chromium args (lines 22-24).

REPLAY (not video). lib/trails-replay.ts stores rrweb event segments (one per navigated document) gzipped+base64 in walk_replays (lines 27-35, "gzip ~20-100x smaller than video"); capture is opt-in and best-effort via context.addInitScript (lines 8-12); runsWithReplay powers a per-walk Replay affordance (lines 51-61).

SIM-SIDE CLASSIFIER (separate track from Trails). lib/sim-bug-classify.ts is a pure regex heuristic over a Sim's free-text observation: HARD breakage signals (never loads/stuck/broken/crash/404..., lines 23-37) → severity "high" auto-accepted straight to an OPEN bug; SOFT signals (spinner/skeleton/empty/blank..., lines 41-50) → "medium" into triage, suppressed by positive context/sentiment (lines 56-60, 84-89); recurrence_count >= 3 later promotes (header comment lines 10-14). It is invoked in lib/sim-review.ts:266-272 only when the LLM didn't already attach a suggestedBug, then flows through findDuplicateFeedback/bumpFeedbackRecurrence dedup and expectations-spine ingest (sim-review.ts:279-310).

INSIGHTS VS PASS/FAIL TODAY: AutoSim Trails produce only mechanical regression/heal findings — the "visual" FindingKind is declared (trails-types.ts:11) and styled in reports (trails-report.ts:218-227) but NO production code ever records one (grep: only trails.test.ts:146 and trails-report.test.ts:207). The only meta-insights are the precision (legit-bug rate) scalar and the cross-source expectations-spine ingest. Product-improvement-style observations (sentiment, UX friction, empty states) exist only on the Sims track (sim-review + sim-bug-classify), not on AutoSim walks.

### AutoSims / Trails (Klavity OS) — pages, authoring wizard, walk runs, replay, findings review, and the trails API surface

PAGES (all session-gated, redirect to /login when anon — server.ts:2666-2668): (1) /trails and alias /autosims serve public/trails.html — the main AutoSims dashboard; (2) /autosims/walks serves autosims-walks.html (all-walks list with verdict filters); (3) /autosims/walk/:id serves autosims-walk.html (full-page walk detail); (4) /shared/walk-report/:token is an unauthenticated, rate-limited 30-day share link that renders the walk PDF (server.ts:2672-2692). A marketing page exists at GET /autosim (server.ts:1157).

MAIN DASHBOARD (trails.html): shows a precision banner (legit-bug rate), Trails list with Run buttons, recent Walks (20, from lib/trails-dashboard.ts:16-24), a findings Review queue (File/Dismiss → POST /api/trails/findings/:id/file|dismiss, server.ts:2884-2909), and an Expectations kanban (candidate/validated/enforced) wired to /api/expectations enforce → confirm flow (server.ts:2752-2822, trails.html:646-817).

CREATION WIZARD ("+ New Trail" modal, trails.html:261-276, 910-925): name + start URL + NL objective + optional encrypted Test Account. POST /api/trails/author (server.ts:2928-2945) validates (objective 10-2000 chars, http(s) URL), returns 202 {sessionId}; lib/trails-author.ts runs the LLM-drive loop (max 40 steps, $0.15 cap, text-first kref snapshots) → crystallizes a DRAFT trail → runs a zero-LLM verification walk. The client POLLS GET /api/trails/author/:sessionId every 2s up to 200 iterations (trails.html:845-908), rendering per-step op/selector/rationale lines. On "crystallized" it shows verification verdict + "Looks right — activate" (POST /api/trails/:id/approve flips draft→active, only active trails file findings, server.ts:2951-2961) + PDF/Share for the verification run. On stall it shows the stallReason and invites objective refinement.

RUNS: POST /api/trails/:id/walk (server.ts:2911-2925) reserves the SINGLE global walk slot (lib/trails-trigger.ts — WalkBusyError→409, 120s deadline, crash-isolated background walk), returns runId immediately; the UI polls /api/trails/dashboard at 1.5s cadence up to 80 iterations (trails.html:431-454). LIVE PROGRESS IS POLLING ONLY — no SSE/WebSocket anywhere in the flow, and no live browser view/screencast (memory notes F1.5 CDP screencast is a planned next step).

RUN VIEWS: walk detail page (autosims-walk.html) shows steps sidebar with verdict dots, per-step rationale + heal-diff (fromSelector→toSelector), duration, LLM-call count, PDF button, and an rrweb session replay with per-page "chapter" tabs that auto-seeks to the first amber/red step (GET /api/trails/walks/:runId and /replay, server.ts:2849-2882). PDF report (GET .../report.pdf, server.ts:2963-2985) and share-link minting (POST .../share, server.ts:2987-3000) exist. Auth accepts session cookie OR Bearer extension token (server.ts:2829, bearerEmail server.ts:727-740).

### AutoSim / Trails (Klavity Phase 3, formerly "Klavity OS") — vision, roadmap status, known issues, cost benchmarks

VOCABULARY (/Users/vishalkumar/Downloads/qbug/klav-snap/CONTEXT.md): an **AutoSim** is the autonomous actor; a **Trail** is the authored journey artifact; a **Walk** is one execution ending in a Verdict (GREEN/AMBER/RED); a **Verification Walk** is the automatic zero-LLM rehearsal of a Draft Trail; **Checkpoints** are human-confirmed assertions immutable to healing; **Test Accounts** are named, project-scoped encrypted credentials Trails reference via `{{cred:...}}`.

CORE LOOP (design: /Users/vishalkumar/Downloads/qbug/klav-snap/docs/superpowers/specs/2026-06-20-klavity-os-trails-design.md §2): author once (LLM drives a real browser from a natural-language objective) → **crystallize** into a Trail spec + exportable Playwright code + seeded locator cache → **replay deterministically with zero LLM** on green → on break, **diagnose first** (drift vs regression), heal via a 3-tier ladder (Tier-0 cached replay, Tier-1 multi-signal semantic fallback no-LLM, Tier-2 vision-LLM re-resolution persisted as a reviewable diff), and **never silently heal green** — AMBER (healed-but-unconfirmed) and RED verdicts flow to a findings gate that auto-files only hard evidence-typed findings (element gone after heal exhausted, 5xx, failed explicit checkpoint) and queues everything subjective (§6). The philosophical inversion vs the field: AI-on-break decides "drift to heal, or bug to report?" (§2.4), because research over 147 products found the silent false-green is the industry failure mode (§1).

ROADMAP TERMS the caller asked about (sequencing locked 2026-07-03 in /Users/vishalkumar/Downloads/qbug/klav-snap/docs/superpowers/specs/2026-07-03-autosims-f1-authoring-decisions.md, "F1 → F1.5 screencast → CI v1 → F2 recorder/hybrid-auth → Plan H Client Sims", corroborated by /Users/vishalkumar/Downloads/qbug/klav-snap/docs/superpowers/research/2026-07-03-autosims-cicd-livewatch-landscape.md §4):
- **F1 = server-side LLM-drive Trail authoring.** "New Trail" modal (start URL + NL objective + optional Test Account) → agent drives via screenshot+DOM→LLM-action loop (`prototype/lib/trails-author.ts`) → Draft → automatic zero-LLM Verification Walk → user approves → Active; only Active Trails file Findings. Caps ~40 steps / ~$0.15 per attempt, logged as `author-drive` in ai_calls. Stall UX = stop-show-refine (agent stalls ~35–45% of attempts). Auth = stored encrypted Test Accounts per ADR-0001 (/Users/vishalkumar/Downloads/qbug/klav-snap/docs/adr/0001-stored-test-account-credentials.md): secret never enters the Trail/evidence/prompts, encrypted at rest with envelope key in /etc/klav/klav.env, password logins only. **STATUS: SHIPPED** (implementation plan /Users/vishalkumar/Downloads/qbug/klav-snap/docs/superpowers/plans/2026-07-03-autosims-f1-authoring.md; code exists: trails-author.ts, test-accounts backend, trails-creds.ts).
- **F1.5 = live screencast view.** CDP `Page.startScreencast` → Bun WS relay → client canvas (JPEG q60 @1024w, everyNthFrame:2, per-frame ack backpressure, <10MB marginal on the 1GB box, on-demand only), for watching the AI author a Trail live (the trust/demo moment) + mid-run heal debugging; VNC/noVNC explicitly rejected as too heavy for 1GB (research doc §3). **STATUS: NOT BUILT** — grep for `startScreencast` across prototype/ returns nothing.
- **CI v1.** `POST /api/runs {suite|trail_ids, base_url, git_sha}` over the existing walk-trigger + `GET /api/runs/:id` + `junit.xml` + ~40-line composite GitHub Action (curl→poll→JUnit→exit 1 on RED) + optional commit-status callback + `POST /api/hooks/deploy`; advisory-by-default with flake quarantine (flip-rate >0.2–0.3 = flaky); **AMBER must never pass a blocking gate silently** (research doc §2). **STATUS: NOT BUILT** — no `/api/runs` or junit anywhere in prototype/.
- **F2 = extension recorder + hybrid auth.** Human-demo fallback: MV3 extension captures semantic actions + multi-signal fingerprints + `storageState` export so thorny OTP/OAuth/MFA auth happens once locally (trails design §4 "Recorder"). **STATUS: NOT BUILT**, deliberately sequenced last-but-one because it is gated on manual Chrome Web Store review (decisions doc §2, ADR-0001).
- **Plan H = Client Sims (personas-as-oracle).** A **User Persona** walks the Trail (binds to a Test Account, shapes authoring choices); **Client Sims** are stakeholder *lenses* (price-sensitive client, enterprise client) that watch the SAME Walk's evidence and give feedback — "lenses multiply feedback, never Walks" (decisions doc "Deferred / sequenced"). This is the persona differentiation the whole research corpus says is Klavity's moat. **STATUS: NOT BUILT** (design deferred until F1 has real output).

ALREADY-SHIPPED SUBSTRATE: Engine A–G (Plans A–E2 + G in docs/superpowers/plans/2026-06-20-klavity-os-trails-plan-*.md): data backbone (`trails`, `trail_steps`, `locator_cache`, `trail_runs`, `run_steps`, `findings`, `walk_replays`), crystallizer, runner with heal ladder, vision heal, findings gate + /trails dashboard, rrweb replay, and the Plan-G server-side walk trigger (`POST /api/trails/:id/walk`, single-walk mutex, low-memory Chromium flags, 120s hard timeout, idempotent demo seeds — plan-g spec §3–5). Walk Report PDF + share links also built (plan 2026-07-03-autosims-walk-report-pdf.md; prototype/lib/trails-report.ts, trails-share.ts, trails-stepshots exist). **kref snapshot** (spec /Users/vishalkumar/Downloads/qbug/klav-snap/docs/superpowers/specs/2026-07-04-autosim-kref-snapshot-design.md) SHIPPED: `lib/trails-snapshot.ts` emits a ref-annotated visible-element tree stamped `data-kref="eN"` replacing the raw 16KB `page.content()` dump in authoring + Tier-2 vision, with the invariant that kref selectors never persist (converted to stable selectors before cache/evidence). **Text-first authoring** (screenshot only after a miss) was built behind `KLAV_AUTHOR_TEXT_FIRST` and per the bench doc **the owner flipped it to DEFAULT on 2026-07-04** (prototype/docs/bench-autosim-cost.md:111-114; kill-switch `KLAV_AUTHOR_TEXT_FIRST=0`). **Steel/remote-browser seam IS built for the author drive**: prototype/lib/trails-browser-page.ts:196-206 — `acquireBrowser()` uses local Playwright chromium by default, or Puppeteer-over-CDP when `AUTOSIM_CDP_URL` is set (with `STEEL_API_KEY` it creates/releases a Steel session); the runner (trails-runner.ts) deliberately stays on local Playwright because its heal ladder is deeply coupled (file header comment, lines 1-6).

DOGFOODING (/Users/vishalkumar/Downloads/qbug/klav-snap/prototype/lib/dogfood-autosim.ts + findings at /Users/vishalkumar/Downloads/qbug/klav-snap/docs/autosim-dogfood-findings.md): the runner script spins an ephemeral file-backed SQLite DB (lines 13-20), then crystallizes and walks two real Trails against prod — Trail 1 (home hero-heading assert, dogfood-autosim.ts:31-51) and Trail 2 (onboarding intro→click "Get started"→wait→assert #email, lines 82-131) — printing per-step tier/verdict/heal/evidence and the findings queue. Result 2026-06-28: Trail 1 GREEN in ~2.8s, 0 LLM calls, Tier-0; Trail 2 RED at step 3 because the inline `onclick="go(1)"` panel transition doesn't update the DOM under headless Playwright click (findings doc §3c), plus a real product finding: duplicate `.hero-cta` on the home page makes hero selectors ambiguous (§3b).

COST BENCHMARK CONCLUSIONS (prototype/docs/bench-autosim-cost.md, all real OpenRouter usage.cost): (1) the raw-HTML 16KB dump was both the cost AND the #1 quality problem — the cap is eaten by <head>/CSS so the model hallucinates selectors from the screenshot: only 2/6 variant-A steps produced valid selectors vs 17/18 with the kref tree; app pages shrink 90–97% (klavity.in home 87,305→1,638 chars). (2) Per-step: A current $0.001381 → B kref+screenshot $0.000502 (−64%) → C text-only qwen3-vl $0.000195 (−86%, ~2x faster) → D flash-lite $0.000097 (−93% but 5/6 valid). Dropping the screenshot (~4–5k input tokens) is the single biggest cost lever. (3) Full authored-Trail A/B (3 runs, same objective): arm A $0.02218 vs text-first arm B $0.01109 → exactly 50.0% cheaper, verdicts equal 6/6 green → owner flipped text-first to default 2026-07-04. (4) Stability is a separate lever LLM savings don't touch: dead-Chromium-on-1GB → Steel.dev Launch ≈$4.50/mo at current volume via the AUTOSIM_CDP_URL seam, cheaper than upgrading the Vultr box. Caveats recorded: single-step bench doesn't cover history growth/mid-flow; kref serializer minimal (assertions may need a visible-text digest); per-snapshot ~24KB cap needed for dense pages.

## 4. Prioritized improvement backlog

Order below = ticket-filing order = dev priority order. Plane priority mapping: P0→urgent, P1→high, P2→medium, P3→low.

### Phase 1 — Trust the core loop (stability)

A self-serve stranger's first AutoSim run must never lie (silent green), hang (stuck "running"), or block another tenant. Everything here is a prerequisite for charging money: run queue, Steel remote browsers, crash recovery, retries, and the known walk-breaking bugs.

#### 1. [P0] /autosims/walks (All Walks) page is broken — always empty

*Category: functionality · Areas: ui*

autosims-walks.html:134 fetches /api/dashboard and reads d.recentWalks (line 153), but the /api/dashboard handler (server.ts:3017-3060+) never returns recentWalks — only /api/trails/dashboard does (server.ts:2836-2847). state.walks is always [], so the page permanently renders 'No Walks yet' regardless of history, and the hasReplay badge can never appear. Fix: fetch /api/trails/dashboard (and keep /api/dashboard only for the project switcher), or add walks to /api/dashboard. This is a shipped dead page linked prominently from the AutoSims nav (trails.html:191).

#### 2. [P0] Replace the single global walk slot with a per-project run queue (parallel runs, no cross-tenant blocking)

*Category: functionality/stability · Areas: authoring, lifecycle, runner, ui*

`runAuthorNow` holds the one walk slot for the entire attempt — up to ~300s drive + 180s verification (trails-author.ts:232-238, 252, 64, 166) — and a second user/project gets a synchronous WalkBusyError (surfaced as 409 per the header comment, lines 60-63). There is no queueing, no per-project slots, no ETA. For a multi-tenant product this means one customer's 8-minute authoring run blocks every other customer's scheduled walk and authoring attempt. Better: per-project concurrency with a FIFO queue and 'queued, position N' session status; the Steel/AUTOSIM_CDP_URL seam (trails-author.ts:67-69) already removes the 1GB-box constraint that motivated the single slot.

Exactly one walk can run at a time per process: withWalkSlot is a module-scoped boolean that throws WalkBusyError on a second call (trails-browser.ts:11-18), surfaced to users as HTTP 409 'A walk is already running' (server.ts:2921, 2942). There is no queue — a colliding trigger is simply rejected and the user must retry manually. The comment at trails-browser.ts:9-10 admits the invariant silently breaks if klav.service ever runs >1 worker (two browsers on the 1GB box; needs a DB advisory lock). Momentic runs suites in parallel across cloud workers. Better: a persistent walk queue (DB-backed, FIFO) so triggers never 409, plus remote-browser workers (the Steel/AUTOSIM_CDP_URL seam already exists at trails-browser-page.ts:202-223 — but only the author drive uses it; the runner is still hard-coupled to local chromium.launch at trails-runner.ts:328, acknowledged as 'a separate, larger effort' at trails-browser-page.ts:6-7).

runWalkNow serializes ALL walks across ALL projects through one slot; a second request gets WalkBusyError → HTTP 409 'AutoSim busy' (lib/trails-trigger.ts:1-4, 54; server.ts:2689, 2942, 2982). There is no queue, no retry — the caller's action simply fails. Acceptable for one-user manual use on the 1GB box, but incompatible with scheduling (overlapping schedules would drop runs) and with multi-tenant use. Better: a persistent run queue (enqueue → drain in order) so triggers never 409, plus the Steel.dev remote-browser path (AUTOSIM_CDP_URL, per project memory) to lift the concurrency ceiling off the 1GB host.

withWalkSlot (lib/trails-browser.ts, used in trails-trigger.ts:54 and trails-author.ts) is one slot per server process — any walk, author session, or even PDF render (renderWalkPdf can throw WalkBusyError → 409 'AutoSim busy', server.ts:2689,2982) blocks every other project's runs. Fine for the 1GB box today, but it means a user clicking 'PDF' during someone else's walk gets a 409 with no retry affordance, and scheduled runs (when built) would starve. The already-benched Steel.dev remote-CDP path (AUTOSIM_CDP_URL) is the known lever and is not built.

#### 3. [P0] Extend Steel remote-browser seam (AUTOSIM_CDP_URL) to ALL walks — get Chromium off the 1GB box

*Category: stability · Areas: docs*

Plan-G prod safety (§5 of specs/2026-06-20-klavity-os-trails-plan-g-walktrigger-design.md) is a global max-1 walk mutex with 409 on contention and a documented-but-unbuilt escape hatch ('move walks to a separate worker box'). The bench doc's stability recommendation (prototype/docs/bench-autosim-cost.md 'Recommendation') is Steel.dev via AUTOSIM_CDP_URL ≈$4.50/mo; the adapter IS built but only for the author drive — prototype/lib/trails-browser-page.ts:1-6 states the runner (trails-runner.ts) stays on local Playwright because the heal ladder is deeply coupled. So every customer Walk still launches Chromium beside klav.service on the 1GB box, one at a time — incompatible with CI v1 (parallel PR-triggered runs) and with multi-tenant scheduled walks. Scheduled/cron Walks themselves remain deferred (decisions doc; plan-g §8), so there is also no continuous monitoring story yet.

#### 4. [P1] Crash reaper + heartbeat: runs and author sessions orphaned as "running" forever after process death

*Category: observability/stability · Areas: authoring, runner*

The Walk row is created by startWalk and only finalized by finishWalk in the same process (trails-runner.ts:326, 421-425, 438-443; trails-trigger.ts:57-70). If the Bun process is OOM-killed or restarted mid-walk (a real risk: --single-process Chromium + Bun + rrweb buffers on a 1GB box), no code path finalizes the run — it stays status='running' indefinitely, and the in-memory slot boolean resets on restart while the DB still shows a phantom run. Nothing in these files does startup reconciliation ('mark runs older than deadline as red/aborted') or writes a heartbeat/last-step timestamp the UI could use to detect a dead run. Better: stamp updated_at per run_step, reconcile stale 'running' rows at boot and/or on read (age > deadline → red with error='orphaned').

The session row is created with status 'running' (trails-author.ts:190-193) and only updated when authorTrail settles in-process (lines 266-273). A server restart/crash mid-drive leaves the row 'running' forever — the polling UI spins with no reaper, heartbeat, or startup sweep marking stale sessions failed. Additionally every step-progress write swallows errors (`.catch(() => {})`, lines 264, 272), so a DB blip silently freezes the visible step log while the drive continues. Better: heartbeat column + boot-time sweep ('running' older than driveDeadline+verification → 'failed: interrupted'), and surface persist errors at least to server logs.

#### 5. [P1] No retry on transient model/API errors — one failed HTTP call kills the whole run

*Category: stability · Areas: authoring*

Any throw from the model adapter immediately ends the session as 'stalled' (trails-author.ts:92-94: `catch (e) { return await stall(...) }`). The adapter throws on ANY non-OK HTTP status (trails-author-model.ts:106 `throw new Error(\`author model ${res.status}\`)`), on the 90s abort (line 96), on missing key, and on daily-budget exhaustion (line 94) — with zero retry/backoff. A single OpenRouter 502/429 mid-run discards a 30-step authoring attempt and all the money spent on it. Contrast: parse-error stalls DO get 3 retries (trails-author.ts:97-104), so the retry philosophy exists but doesn't cover the far more common transient-network class. Better: classify errors (retryable 429/5xx/timeout vs fatal auth/budget), retry with backoff inside the loop counting a miss, and distinguish 'budget exhausted' from 'model broke' in the surfaced reason.

#### 6. [P1] No resumability or checkpointing — stall/failure discards ALL trajectory progress

*Category: stability · Areas: authoring*

On stall the outcome carries `trailId: null` and only a text stallReason (trails-author.ts:70-73); the accumulated `traj` steps (which succeeded!) are thrown away, and 'stop-show-refine' means the user restarts from step 0, re-spending budget and re-rolling every earlier step (each of which can newly fail). A run that stalls at step 25/40 after $0.12 of spend yields nothing durable. Better: persist the partial trajectory (crystallize-as-far-as-we-got into an editable draft, or store a resumable checkpoint on the author_session) and offer 'resume from step N with a refined objective' — this compounds with the cost cap (a capped run currently = pure loss).

#### 7. [P1] Headless inline-JS panel transitions break multi-step Walks (blocks wizard/onboarding flows)

*Category: stability · Areas: docs*

Dogfood 2026-06-28 (/Users/vishalkumar/Downloads/qbug/klav-snap/docs/autosim-dogfood-findings.md §3c, §4): clicking a button with onclick="go(1)" returns GREEN from Playwright but the target panel never un-hides, so the next assert (#email visible) times out → false RED on the entire Klavity onboarding funnel and any wizard UI. Documented as "the single most important blocker to fix first" with two proposed fixes ((a) investigate let-scoped handler dispatch in headless, (b) waitForFunction after transition clicks); no doc records it fixed. Better looks like: a diagnostic + regression test proving wizard-style inline-JS transitions replay GREEN, since this failure class produces exactly the false-RED noise the trust guardrails exist to prevent.

#### 8. [P1] PDF rendering contends with the single walk slot — share links 500 while any walk runs

*Category: stability · Areas: findings*

renderWalkPdf executes inside withWalkSlot (trails-share.ts:101), and withWalkSlot throws WalkBusyError synchronously when the slot is held (trails-browser.ts:14-18). Any recipient opening GET /shared/walk-report/:token while a walk (up to 120s, trails-trigger.ts:18) is in flight gets an error — the worst possible moment for a share link to fail is right after the run that generated it. The mutex is also per-process only (trails-browser.ts:8-11), so running >1 worker silently allows two Chromiums on the 1GB box. Better: cache rendered PDFs per runId (walks are immutable once finished), or render once at share-mint time and serve bytes from S3; move to a DB advisory lock before any multi-worker deploy.

#### 9. [P1] rrweb input-masking invariant for authed Walks not verifiably enforced

*Category: stability · Areas: docs*

ADR-0001 consequence #2 is non-negotiable: 'rrweb input-masking becomes mandatory before authed Walks ship; typed secrets are scrubbed from console/network evidence'. F1 (authed Walks via Test Accounts) has shipped, but no doc read in this pass records the masking/scrubbing being verified as mandatory on the Walk-replay capture path (the widget-side rrweb recorder masks inputs per CHANGELOG:674, a different surface). Given replays, step screenshots (walk-report plan notes password fields render dotted — acceptable), console and network evidence are all persisted and now shareable via unauthenticated PDF share links (plans/2026-07-03-autosims-walk-report-pdf.md), the spec should include an explicit audit/test that a typed {{cred}} password never appears in walk_replays events, run_steps evidence, or exported reports.

#### 10. [P2] Deadline is not enforced inside a step: a walk can overrun its 120s budget by ~2 minutes

*Category: stability · Areas: runner*

The wall-clock deadline is checked only at the top of each step (trails-runner.ts:382). A single step can legally consume: opTimeout up to 15s (resolve/nav) + ACTION_TIMEOUT 5s + a Tier-2 vision call with its own independent 90s abort timer (trails-vision.ts:103) + screenshot/content capture — so the last step admitted before the deadline can run ~110s past it, pinning the single walk slot and the browser on the 1GB box well beyond the advertised 120s ceiling (trails-trigger.ts:18). ACTION_TIMEOUT is also hard-coded (trails-runner.ts:577) with no per-step or per-trail override for slow apps, causing false REDs. Better: derive remaining-budget per operation (min(opTimeout, deadline - now)), pass it into the vision resolver's AbortController, and make action timeout configurable per trail.

#### 11. [P2] Browser/session cleanup can hang or leak: unbounded browser.close(), Steel session leak on failed connect

*Category: stability · Areas: runner*

(a) trails-runner.ts:445 awaits browser.close() in the finally with no timeout or catch; single-process headless Chromium is known to occasionally hang at shutdown, which would hold the walk slot forever (the slot releases only when withWalkSlot's fn settles, trails-browser.ts:17) — every subsequent trigger 409s until service restart. (b) In the Steel path, the session is created via REST first and released only through handle.close(); if puppeteer.connect throws (trails-browser-page.ts:217) the release closure is never invoked — a billed remote session leaks until Steel's own timeout. (c) PuppeteerHandle.newPage() reuses pages[0] (trails-browser-page.ts:188), inheriting any prior state in a reused browser. Better: race close() against a ~5s timer then process-kill; wrap Steel connect in try/catch that releases the session; always open a fresh page/context.

#### 12. [P2] rrweb capture buffers unbounded event arrays in process memory

*Category: stability · Areas: runner*

Replay events accumulate in the Node-side `current` array with no size cap (trails-replay.ts:115-121, 180-182); heavy/animated pages emit large rrweb streams (full DOM snapshot per document + mutation events), and prod enables replay on every triggered walk (trails-trigger.ts:28). Compression happens only at saveReplay after the walk ends (trails-replay.ts:27-35). On the 1GB box this stacks on top of Chromium (--single-process), a base64 PNG screenshot (trails-runner.ts:717), full page.content() HTML (trails-runner.ts:720), and the 24KB kref snapshot — OOM risk grows with page weight and walk length, and OOM produces the orphaned-run failure above. Better: cap events per segment (drop + mark truncated), stream-compress segments as they seal, and skip full-snapshot-heavy pages over a byte threshold.

#### 13. [P2] Verification-walk exception orphans an already-created draft Trail

*Category: stability · Areas: authoring*

By the time `walkTrail` runs, the trail is already crystallized and set to draft (trails-author.ts:161-162). If walkTrail (or handle.close, or setTrailStatus) throws, the outer catch returns status 'failed' with `trailId: null` (trails-author.ts:172-175) — the session row never learns the trail exists, leaving an orphan draft trail in the DB that no UI links to. Better: narrow the try scope or carry the trailId into the catch so a post-crystallize failure returns 'crystallized with verification error' (trail preserved, verdict null) instead of a fake total failure.

#### 14. [P2] Triggered runs finalize twice: runWalkNow's finishWalk clobbers walkTrail's richer summary

*Category: observability · Areas: runner*

walkTrail finalizes the run itself with summary {healedCount, stepCount, error:'deadline_exceeded'} (trails-runner.ts:421-425), then returns; realWalk maps that to {verdict, summary:{reasons}} and runWalkNow calls finishWalk AGAIN on the same runId (trails-trigger.ts:31, 66). The second write carries only `reasons` — healedCount, stepCount and, critically, the deadline_exceeded marker are overwritten/lost on every prod-triggered run (unless finishWalk merges summaries, which nothing here indicates). Users of the run detail view therefore can't distinguish 'red because deadline' from 'red because step failed' on triggered walks. Better: make walkTrail skip finalize when it adopted an external runId (the opts.runId seam already exists, trails-runner.ts:64-71), or merge summaries in finishWalk.

#### 15. [P2] Transition fallback can silently mask a real click regression

*Category: stability · Areas: runner*

clickWithTransitionFallback (trails-click.ts:86-98) verifies the expected state after a click on Klavity shell pages and, if the transition didn't happen, calls the page's own go()/setView() JS directly. That means a genuinely broken click handler (the exact regression class AutoSim exists to catch) is repaired in-flight and the step reports GREEN — a silent-green of a real UI bug, contradicting the engine's own fail-loud doctrine (trails-runner.ts:4-8). It is also app-specific and fragile: it regex-sniffs inline onclick source (trails-click.ts:21-45), which breaks on minified/framework (React/Vue) handlers. Better: when the fallback fires, downgrade the step to AMBER with evidence.transitionFallback=true so a human reviews it; longer-term replace with a generic post-click settledness check.

#### 16. [P2] Hardcoded 5s ACTION_TIMEOUT races CSS-animated transitions

*Category: stability · Areas: docs*

Dogfood finding §3e: waitFor({state:'visible'}) at 5000ms is tight for animated panel reveals; any fade >0ms can race the window and produce flaky RED. The trails design mandates 'condition-based / vision wait-until-X waits, never sleeps' (§8 of /Users/vishalkumar/Downloads/qbug/klav-snap/docs/superpowers/specs/2026-06-20-klavity-os-trails-design.md), and the CI v1 spec depends on low flake rates (healthy suites <1–2%, research doc §2.5). Better: per-step or per-Trail configurable action timeout + transition-aware waiting before CI gating ships, otherwise the flake quarantine will be doing the timeout's job.

#### 17. [P2] No retries, no flake detection, no quarantine — one attempt per step, one attempt per walk

*Category: stability · Areas: runner*

Every step gets exactly one resolution + one action attempt; a transient failure (late-hydrating SPA, one slow API response, exact-text mismatch from a trailing space — getByText uses exact:true at trails-runner.ts:261) is a hard RED with a finding. There is no step retry, no walk-level auto-rerun to confirm a red, no flake-rate tracking per trail/step, and no quarantine state for known-flaky trails. Momentic and mature CI runners all re-run reds once before alerting. On live-network prod walks (trails-trigger.ts:28 drives trail.baseUrl) this converts ordinary latency variance into false regression findings that erode trust in the product's core promise. Better: confirm-red-with-one-rerun before recordFinding files a regression, plus per-step flake stats to drive selector refresh.

#### 18. [P2] A deliberate model 'stall' is accepted on the first roll — no second opinion

*Category: stability · Areas: authoring*

One valid-JSON `{"op":"stall"}` reply ends the run immediately (trails-author.ts:106), while malformed replies get 3 retries (lines 97-104). Given the roulette model picker (trails-author-model.ts:95) a weak model roll can lazily stall on a page a stronger model would progress through — the same 'one bad roll kills a good attempt' failure KLAVITYKLA-48 fixed for parse errors. Better: on first deliberate stall, escalate once (attach screenshot like the miss path, or re-roll a stronger model) before giving up; only accept stall when confirmed.

#### 19. [P3] recordFinding dedup has a check-then-act race

*Category: stability · Areas: lifecycle*

recordFinding does SELECT (existing dedup row) then UPDATE-or-INSERT non-atomically (lib/trails.ts:201-220), and findings has only a non-unique index on (project_id, dedup_key) (db.ts:350). Today the single walk slot serializes writers so it can't fire, but the moment concurrent walks/queue workers exist, two simultaneous identical findings insert duplicate rows — silently breaking the §6 dismissed-suppression guarantee. Better: UNIQUE(project_id, dedup_key) partial/index + INSERT ... ON CONFLICT upsert, mirroring the locator_cache pattern (db.ts:303).

#### 20. [P3] Tier-1 heal candidates skip role-consistency on the strongest signal and can heal cross-page

*Category: stability · Areas: runner*

The role+name candidate returns without a roleConsistent() check (trails-runner.ts:252-256) — safe-ish since role is part of the query, but getByRole with exact:true name can still land on a different same-named control elsewhere on the page (e.g. two 'Submit' buttons where one is in a hidden-but-measurable container). More broadly, resolution has no page-context guard: after an unexpected redirect (session expiry mid-walk), Tier 1 will happily 'heal' onto the login page's elements (e.g. text 'Email') and type into them, producing a confusing AMBER trail instead of a crisp 'unexpected navigation to /login' RED. Better: record the expected URL (or URL pattern) per step at crystallize time and fail fast with reason 'unexpected_page' when it mismatches before attempting any heal.

#### 21. [P3] Findings operations load the whole project's findings into memory

*Category: stability · Areas: lifecycle*

processWalkFindings, fileFindingById and dismissFinding all call listFindings(projectId) (full table scan for the project, ORDER BY updated_at) then filter in JS for one runId or one findingId (lib/trails-findings-gate.ts:66, 92, 105; lib/trails.ts:230-235). Same pattern in upsertExpectation's lexical fallback, which loads ALL project expectations per ingest (lib/expectations-db.ts:43-45). Fine at demo scale; O(n) per finding once scheduled runs accumulate history (compounded by the no-pruning gap). Better: WHERE run_id=? / WHERE id=? queries, and a bounded candidate set (e.g. recent or same-area expectations) for lexical matching.

### Phase 2 — Insight engine: persona-judged walks (the moat)

The differentiator vs Momentic. Every walk becomes a customer-insight artifact: a chosen Sim (persona core: goals/temperament/voice/watchFor) narrates and judges the journey — friction, confusion, delight, abandonment-risk — with regression pass/fail as the underlying spine. Requires the evidence layer (console/network/timings, step artifacts, trends) that also fixes today's opaque failures.

#### 22. [P0] Persona-judged walks (Plan H v1): a chosen Sim narrates + judges every walk into a customer-insight report

*Category: competitive · Areas: docs, findings*

AutoSim findings are limited to regression|amber_heal; the 'visual' kind exists in types (trails-types.ts:11) and report styling (trails-report.ts:218-227) but is never produced by any production code (only test fixtures trails.test.ts:146, trails-report.test.ts:207). The runner never emits UX observations, perf timings, copy/empty-state issues, or 'this flow got slower/clunkier' insights — everything is locator-drift mechanics. The Sims track has exactly this capability (sim-bug-classify.ts HARD/SOFT signals + sentiment, sim-review.ts:266-272) but it's not wired to walk evidence. Better: after each walk, run the step screenshots/kref snapshots/timings through a cheap classifier to emit 'insight'-kind findings (kind='visual' or new 'insight'), reusing the same recordFinding dedup + review queue. This is the difference between a test runner (Checkly-class) and the promised 'customers in the room' product.

The 2026-06-20 research (trails design §1) concludes self-healing alone is not a moat (Octomind died May 2026) and the 2026-07-03 landscape delta (research doc §1) confirms the cache-replay-heal loop is now commodity (Stagehand v3, Skyvern, midscene, browser-use all converged); what remains 'ours' = never-silent-heal review workflow + provenance-grounded personas. Plan H (User Persona walks + Client Sim lenses judging the same Walk's evidence; decisions doc 'Deferred / sequenced') is the persona half and is not built. The longer it waits, the more AutoSim competes purely on the commoditized loop. Also unbuilt from the same differentiation bucket: the visual-diff 'judge' oracle (trails design §4 'Oracle') — the cheap perceptual oracle named as one of the two defensible assets — explicitly deferred in the F1 decisions doc.

#### 23. [P1] User-facing failure evidence is thin: no console logs, no network log, no page errors, no timings

*Category: observability · Areas: runner*

When a run fails, the user gets: per-step run_step rows with a reason code + selector info (trails-runner.ts:523-532, 558-569, 602-610), red-reason strings like 'step 3 (click "Submit"): RED' (trails-runner.ts:396), an opt-in JPEG screenshot (trails-runner.ts:297-309), and an rrweb replay. Missing versus what a developer needs to actually diagnose: (a) browser console errors/warnings — never captured (no page.on('console'/'pageerror') anywhere); (b) network request/response log or failed-request capture — absent; (c) per-step durations — evidence has no elapsed-ms, so slow-step diagnosis is impossible; (d) a screenshot on the walk-level catch path — the catch at trails-runner.ts:434-443 records only String(e) while the browser is still open, taking no final screenshot; (e) navigate/wait steps never get screenshots by design (trails-runner.ts:89), so a failed navigation's landing state is invisible; (f) screenshot/replay failures are silent to the user (empty catch at trails-runner.ts:306-308; console.warn only at trails-replay callsites trails-runner.ts:409, 417, 430). Better: attach console+pageerror+failed-request collectors per page, record step start/end timestamps, always capture a terminal failure screenshot, and surface artifact-capture failures in evidence.

#### 24. [P1] No step artifacts (screenshots/DOM) in the session log — failures are text-only

*Category: observability · Areas: authoring*

AuthorStepLog carries only op/selector/value/url/rationale/error text (trails-author.ts:31); the screenshots and kref snapshots captured each iteration (lines 86-90) are discarded. When a run stalls, the user gets 'stuck after 3 failed attempts; last: selector ... matched 0 elements' (line 153) with no picture of what the page looked like — for the stop-show-refine UX there is nothing to 'show'. Similarly the Verification Walk verdict arrives without visuals. Better: persist a per-step screenshot (or at least the final-miss screenshot + snapshot excerpt) on the session, and a replay/filmstrip view; F1.5 CDP screencast is the roadmap answer but even static per-step JPEGs would transform debuggability today.

#### 25. [P1] 'done' is trusted without verifying the objective was actually achieved

*Category: functionality · Areas: authoring*

When the model says done, the loop breaks with no check that the final page state satisfies the objective (trails-author.ts:107); the prompt merely asks the model to be honest (trails-author-model.ts:35). The zero-LLM Verification Walk (trails-author.ts:165-168) only replays the SAME steps — a prematurely-'done' or wrong-path trail replays perfectly and verifies green, so the human reviewer is the only quality gate. Unless the model happened to emit an `assert` checkpoint, a trail can contain zero assertions at all (assert is optional, trails-author.ts:133-137). Better: a final LLM/vision judge step ('does this end state satisfy the objective?') feeding the verdict, plus a crystallize-time rule requiring ≥1 checkpoint (auto-suggest one from the objective if absent). Mature tools (Momentic 'AI assertions') treat goal-satisfaction as a first-class check.

#### 26. [P1] Findings dedup is trail+step scoped — same bug across trails/re-crystallizations creates duplicates

*Category: functionality · Areas: findings*

All 4 dedupKey shapes embed trailId and step.id (trails-runner.ts:518, 697, 761, 864). recordFinding (trails.ts:192-228) correctly collapses recurrences of the SAME trail step across runs, but the same underlying page regression hit by two different Trails (e.g. login broken affects every trail) produces N separate findings, and re-authoring/re-crystallizing a trail mints new step ids that orphan prior dedup history (a previously dismissed finding resurfaces under a new key, defeating the §6 anti-slop guarantee). No content/semantic dedup exists on the Trails side, even though the Sim side already has obsIsNearDup near-dup matching (sim-review.ts:259-261). Better: add a secondary content-level dedup key (normalized selector/URL/groundQuote embedding) checked at recordFinding, and carry dedup keys through re-crystallization.

#### 27. [P1] No trends over time — dashboard shows only last 20 walks and a single precision scalar

*Category: functionality · Areas: findings*

trailsDashboardData (trails-dashboard.ts:16-24) returns trails, last-20 walks, queued findings, and one precision number (trails-findings-gate.ts:38-46). There is no per-trail pass-rate history, no flakiness detection (green/red alternation), no heal-rate trend (heals are counted per report at trails-report.ts:131 but never aggregated), no walk-duration regression tracking, and no findings-over-time series despite recurrence and updated_at being stored (trails.ts:206-208). Finding.recurrence is bumped but never surfaced or used to sort/prioritize the queue. Better: per-trail rolling pass-rate + duration sparkline, 'flaky' badge, and a recurrence-sorted queue — this is table stakes vs Checkly/Datadog Synthetics dashboards.

#### 28. [P1] F1.5 CDP screencast (live-watch) not built

*Category: observability · Areas: docs*

Locked as the immediate fast-follow to F1 (/Users/vishalkumar/Downloads/qbug/klav-snap/docs/superpowers/specs/2026-07-03-autosims-f1-authoring-decisions.md 'Deferred / sequenced'; design in research doc §3: Page.startScreencast → Bun WS relay, JPEG q60@1024w, on-demand, VNC rejected). grep for startScreencast across prototype/ returns nothing. Impact: users cannot watch the AI author a Trail live — the research doc calls this 'the trust/demo moment' (same philosophy as live Sims 'customers in the room') — and stuck heals can't be debugged mid-run; today only step-poll progress (Plan-G pattern) and post-hoc rrweb replay exist. Vercel agent-browser has an Apache-2.0 reference implementation to borrow.

#### 29. [P1] No live progress feedback during a run

*Category: observability · Areas: runner*

runWalkNow returns the runId immediately and the dashboard 'polls for the verdict' (trails-trigger.ts:35-37); run_steps land incrementally via addRunStep (trails-runner.ts:660) but there is no SSE/websocket step stream, no current-step indicator, and no ETA. During a 2-minute walk (or a 3-minute author drive) the user watches a spinner with no signal whether the run is on step 2 or hung — and given the orphaned-run gap, a dead run is indistinguishable from a slow one. Better: poll run_steps for the run (they already exist row-by-row) or push step events over the existing dashboard channel; show step k/N + last screenshot thumbnail live.

#### 30. [P2] No real severity model — severity is a fixed function of kind, computed only at ticket time

*Category: functionality · Areas: findings*

Finding rows have no severity field (trails-types.ts:55-60); severity appears only when building the external ticket and is hardcoded: regression→high, visual→low, else medium (trails-findings-gate.ts:115-117). Recurrence count, checkpoint criticality, confidence, and blast radius (how many trails hit it) are never factored, and there is no human severity override in the review queue. Contrast: the Sim path assigns high/medium severity at classification time and uses it to drive triage (sim-bug-classify.ts:10-14). Better: severity on the finding itself (heuristic: checkpoint-gone > element-gone > amber_heal, boosted by recurrence and multi-trail hits), editable in the queue, and passed through to the connector payload.

#### 31. [P2] RED Walks without a vision resolver produce zero Findings

*Category: observability · Areas: docs*

Dogfood finding §3d (/Users/vishalkumar/Downloads/qbug/klav-snap/docs/autosim-dogfood-findings.md): findings are only queued via the Tier-2 vision path (runVisionTier2); the no-resolver Layer-C path records element_gone run_steps but never calls recordFinding — Trail 2 walked 3 RED steps and produced 0 findings. 'By design for Layer C', but the product consequence is a red dashboard with an empty actionable-findings queue for any deployment without an OpenRouter key (including self-hosted open-core users). Better: emit a minimal hard evidence-typed finding (element_gone / 5xx / failed checkpoint) from the non-vision path — those are exactly the kinds §6 of the trails design already deems auto-file-safe.

#### 32. [P2] Per-step screenshot upload is awaited serially inside the walk deadline

*Category: stability · Areas: findings*

maybeShot awaits page.screenshot + the S3 upload inline after every actionable step (trails-runner.ts:297-309, call sites 492/522/557/601/639) with stepShots:true on all prod walks (trails-trigger.ts:29). A slow/flaky S3 endpoint adds hundreds of ms per step consumed from the 120s WALK_DEADLINE_MS, and page.screenshot has no explicit timeout there (unlike the vision path's bounded screenshot, trails-runner.ts:717) — a hung capture rides only on page-level default timeouts. Better: capture bytes synchronously but fire-and-forget the upload (collect promises, settle at walk end before finishWalk), and bound the screenshot call explicitly.

#### 33. [P2] No video/screencast replay; rrweb replay not integrated into reports or share links

*Category: functionality · Areas: findings*

There is no CDP screencast/video capture anywhere (grep 'screencast|video' → only comments comparing gzip size to video, trails-replay.ts:6, feedback-replay.ts:7); memory notes F1.5 CDP screencast as pending. rrweb replay IS captured on prod walks (trails-trigger.ts:28 replay:true) and stored (trails-replay.ts:27-35), but the walk report HTML/PDF (trails-report.ts) and the anonymous share route (server.ts:2670-2676) include only still JPEG screenshots — the replay is reachable only from the internal dashboard (runsWithReplay, trails-replay.ts:51-61). rrweb also cannot capture canvas-heavy or cross-origin-iframe content, where a screencast would. Better: embed a replay link (or scrubbable frame strip built from stepshots) in the shared report, and add optional CDP screencast for the failure window around a red step.

#### 34. [P2] No per-trail walk history or trend view

*Category: observability · Areas: ui*

listWalks(projectId, trailId) exists in lib/trails.ts:169 but has no route or UI. Users see only the project-wide last 20 walks (trails-dashboard.ts:19); they cannot answer 'when did this trail last go red?', see pass-rate over time, flakiness, or duration trends — table stakes for a monitoring product and the natural payoff of the precision banner already on the page (trails.html:213-219).

#### 35. [P2] Walk failures are opaque: crash-red vs regression-red indistinguishable, no run actor, fixed 120s deadline

*Category: observability · Areas: lifecycle*

Three related weaknesses: (a) a walk crash is finalized as status='red' with only summary_json {error} (lib/trails-trigger.ts:67-70) — the dashboard verdict pill (lib/trails-dashboard.ts) can't distinguish 'infra broke' from 'your app regressed', which poisons trust and any future flake/pass-rate stats; (b) trail_runs records no actor — sim_runs has actor_email (db.ts:426) but trail_runs (db.ts:304-314) does not, so there is no audit of who triggered a run; (c) WALK_DEADLINE_MS is a fixed 120s (lib/trails-trigger.ts:18) with no per-trail override — a long journey with LLM heals over a real network hits the wall as an indistinguishable red. Better: an explicit run outcome field (regression|infra_error|timeout), actor/trigger metadata on trail_runs, per-trail deadline config.

#### 36. [P3] Review queue lacks per-finding visual evidence and recurrence-aware ordering

*Category: usability · Areas: findings*

screenshotKey lives only in run_step evidence (trails-runner.ts:497, 530, 567, 608, 651-657), never on the finding itself — recordFinding evidence at the 4 creation sites (trails-runner.ts:516, 695, 759, 863) omits it, so the queue (trails-dashboard.ts:20) can't show the failure screenshot next to the finding a human must judge; the reviewer has to cross-reference the walk report. Findings are listed by updated_at only (trails.ts:230-234) with recurrence stored but not used for sorting or display. Better: stamp the step's screenshotKey into the finding evidence at record time and sort/badge the queue by recurrence x kind.

### Phase 3 — Full trigger matrix (scheduled / CI / API)

Momentic table-stakes: walks that run themselves. Per-Trail schedules, red-walk alerts, CI v1 (PR/deploy gates), a public API + CLI, trail versioning and environments so scheduled/CI runs are stable references.

#### 37. [P0] Scheduled walks: per-Trail cron schedule so AutoSims actually run automatically

*Category: competitive/functionality · Areas: lifecycle, ui*

The only entry point is manual: POST /api/trails/:id/walk (server.ts:2911-2918) → runWalkNow (lib/trails-trigger.ts:39-81). Walk.trigger is literally typed "manual" (lib/trails-types.ts:43) and startWalk hardcodes it (lib/trails.ts:129). No cron loop, no schedule table, no GitHub Actions/webhook hook, no post-deploy trigger anywhere (grep across lib/trails*.ts confirms). The product promise — continuous autonomous regression enforcement ("Sim=discover, AutoSim=enforce") — is unmet: a regression is only caught when a human clicks Run. Better: per-trail schedule (cron expr or interval) + a deploy webhook trigger (run all active trails on deploy) + optional CI mode (POST run, poll verdict, exit code) — the trail_runs.trigger column (db.ts:308) already anticipates 'scheduled'/'ci'/'webhook' values.

The only trigger is POST /api/trails/:id/walk from a human clicking Run (server.ts:2911); grep shows the single setInterval in server.ts is the GDPR retention sweep (server.ts:4010), and lib/trails-trigger.ts has no scheduler. The page copy promises 'journeys they enforce on every run' (trails.html:203) but nothing runs unless someone clicks. Competing products (Checkly, QA Wolf, Momentic) all offer cron schedules + on-deploy triggers. What better looks like: per-trail schedule (e.g. every N hours / after deploy webhook) with the existing single-walk-slot queueing instead of 409.

#### 38. [P1] Notifications: email/Slack alert on red walks and new findings

*Category: observability · Areas: lifecycle, ui*

Nothing in lib/trails*.ts sends Slack/email on a red verdict or a new queued finding (grep for slack|notify|alert matches only test fixtures). A failed walk lands silently in the dashboard's recentWalks list (lib/trails-dashboard.ts:16-24) and findings sit in a queue nobody is pinged about. The codebase already has the plumbing pattern — signup Slack alerts exist (lib/signup-alert.ts per project memory) — but walks/findings never use it. Once scheduling exists this becomes P0: an unattended red run with no alert is worse than no run. Better: per-project notification config (Slack webhook/email) fired on finishWalk red/amber and on recordFinding new-queued, with a digest option.

grep for notify/slack/mail/webhook across lib/trails-findings-gate.ts and lib/trails-runner.ts returns nothing. A regression detected by an AutoSim sits silently in the review queue until someone happens to open /trails. The codebase already has Slack Block-Kit signup alerts (lib/signup-alert.ts) and per-project widget_notify_email — neither is wired to walk verdicts or findings. What better looks like: red-walk / new-finding alerts to Slack webhook + project email, with a link to the walk detail + replay.

#### 39. [P1] CI v1 not built — AutoSims cannot gate deploys or PRs

*Category: functionality · Areas: docs*

Fully speced in /Users/vishalkumar/Downloads/qbug/klav-snap/docs/superpowers/research/2026-07-03-autosims-cicd-livewatch-landscape.md §2 (POST /api/runs, junit.xml, ~40-line GitHub Action, deploy-hook, advisory-by-default + flake quarantine, AMBER-never-silently-passes) but no /api/runs or junit code exists in prototype/. Without it AutoSim is a dashboard-only monitor; every commercial comparator (Momentic, Checkly, Meticulous) ships this shape. Real Trails now exist (F1 shipped), so the stated prerequisite ('needs real Trails to gate') is satisfied — this is the next unblocked roadmap item after F1.5.

#### 40. [P1] No public API, CLI, or CI hook

*Category: competitive · Areas: ui*

The trail routes accept Bearer auth (server.ts:2829), but the only Bearer credential is an extension/widget token (bearerEmail, server.ts:727-740) — there is no user-facing PAT issuance, no API docs, no CLI, and no CI integration (e.g. 'run trail X on PR, fail the build on red'). POST /walk returning runId + polling GET /api/trails/walks/:runId is technically scriptable but undocumented and unstable as a contract. Memory notes 'CI v1' is the planned next milestone — this confirms it does not exist yet.

#### 41. [P1] No Trail versioning; steps mutate in place and runs can dangle

*Category: functionality · Areas: lifecycle*

trail_steps are edited destructively: insertAssertStep shifts idx of later steps in place (lib/trails.ts:256-258) and deleteTrailStep hard-deletes (lib/trails.ts:268-270). There is no trail revision/version table, no step edit history, and trails.baseline_ref is always inserted NULL and never set (lib/trails.ts:22-23, db.ts:267). Consequences: (a) historic run_steps reference step_ids that may no longer exist, so an old walk's detail can't be faithfully reconstructed against the trail as it was; (b) no diff/rollback when an LLM re-author or enforce-graduation changes a trail; (c) verdict trends across runs are not comparable when the step set silently changed. Better: immutable trail versions (runs pin a version id), or at minimum a trail_step_edits audit log + soft-delete.

#### 42. [P2] No environments — one base_url per trail, no staging/prod separation

*Category: functionality · Areas: lifecycle*

A trail has exactly one base_url (db.ts:266; lib/trails.ts:22-24) and realWalk always drives trail.baseUrl (lib/trails-trigger.ts:24-32). There is no environment entity (staging vs prod URLs, per-env test accounts, per-env locator cache/baselines). Running the same journey against staging requires duplicating the trail, which forks its run history, locator cache, and findings dedup keyspace — and staging findings would file real tickets through the same connector path (lib/trails-findings-gate.ts:147-170). Better: environments as a first-class dimension (trail defines steps once; env supplies base_url + test-account mapping; runs and findings are env-tagged; per-env auto-file policy so staging never pages).

#### 43. [P2] Auto-file executor is intentionally inert — every finding requires human review

*Category: functionality · Areas: lifecycle*

processWalkFindings (auto-file hard regressions ≥0.9 confidence to the connector) is fully built and tested but explicitly NOT wired into walkTrail — 'a Walk never auto-files anything today' pending a per-project opt-in toggle (lib/trails-findings-gate.ts:57-60). The dismissed-dedup suppression it was gated on already shipped in recordFinding (lib/trails.ts:196-215), so the stated precondition is met. Deliberate precision-first choice, but it caps the autonomy story and the precision metric (:38-46) can never prove auto-file quality while auto_filed count is structurally zero. Better: ship the per-project opt-in toggle, call processWalkFindings from finishWalk for active trails, and surface precision per mode.

#### 44. [P2] Corroboration model undercounts AutoSim: 'finding' source sets neither snap nor sim flag, and urlPath is always null

*Category: functionality · Areas: lifecycle*

mergeSource only sets the snap/sim booleans for those two kinds; kind 'finding' just bumps recurrence (lib/expectations.ts:12-18). So an expectation corroborated by a Snap report AND an AutoSim regression (two independent sources — exactly the cross-source signal the spine exists for) does NOT satisfy shouldValidate's (snap && sim) clause (:20-22) and must wait for recurrence ≥ 3. Additionally both ingest call sites for findings pass urlPath: null (lib/trails.ts:212, 225) even though the finding's evidence/trail has a URL, weakening future area/url-based matching. Better: treat corroboration as a set of distinct source kinds (validate on ≥2 distinct kinds) and thread the walk step URL into ingestFinding.

#### 45. [P2] No run-history retention or pruning — trail_runs/run_steps/walk_replays/findings grow unbounded

*Category: stability · Areas: lifecycle*

No DELETE/prune exists for trail_runs, run_steps, walk_replays, or findings anywhere in prototype/ (grep: zero matches for DELETE FROM on those tables). walk_replays rows are gzipped rrweb blobs per walk (db.ts:351-363) and run_steps carry evidence_json per step — with scheduled runs (e.g. hourly x N trails) this becomes megabytes/day in Turso/SQLite on a 1GB box. Reads are capped (listRecentWalks LIMIT 20, lib/trails.ts:175-178) but storage is not. Better: per-project retention policy (e.g. keep last N runs per trail + all runs with findings; expire replays after 30d), plus aggregate stats rows so trend charts survive pruning.

### Phase 4 — Self-serve authoring & UX

Make a stranger able to author, understand, edit, and trust Trails without us in the loop: trail management, draft step review, editable steps, mid-run control, richer auth shapes (incl. the project instructions.md test-mode convention), vocabulary expansion, and the long tail.

#### 46. [P1] Trails are immutable after creation — no view/edit/rename/pause/delete

*Category: functionality · Areas: ui*

There is no trail detail page and no GET route exposing a trail's steps to the UI (listTrailSteps at lib/trails.ts:65 is only consumed by the expectations enforce flow, server.ts:2787). Users cannot: see what steps their draft actually contains before approving (they approve blind off a verdict pill, trails.html:857-869), edit/reorder/delete a step, rename a trail, fix a selector, pause/archive an active trail, or delete a bad one. setTrailStatus is only reachable via draft→active approve (server.ts:2951-2961). insertAssertStep/deleteTrailStep exist in lib (trails.ts:247,268) but only the LLM expectations path uses them. If a trail rots, the only recourse is authoring a new one — and the old one keeps cluttering the list forever.

#### 47. [P1] Draft approval is blind — no step review before Activate

*Category: usability · Areas: ui*

The post-author approval UI (trails.html:853-869) shows only the authoring step log and a GREEN/AMBER/RED verification verdict, then a single 'Looks right — activate' button. The user never sees the crystallized deterministic steps (selectors/assertions) that will actually be enforced, and the draft row in the Trails list (trails.html:484-486) offers only 'Activate' — no inspect, no re-verify, no reject/delete. A wrong assertion approved here files findings forever with no edit path (see the no-edit gap).

#### 48. [P1] Draft steps are not editable — no human-readable spec, one-way export only

*Category: competitive · Areas: authoring*

The crystallized trail is DB rows (trails-crystallize.ts:92-120) reviewable via approve/verify, but there is no editor to fix a single wrong step, insert an assertion, reorder, or change a typed value — any imperfection means a full re-author. The Playwright codegen (trails-codegen.ts:14-65) is explicitly one-way ('exportable artifact', lines 1-3) with no import/round-trip. Momentic's core loop is an editable YAML/step spec where AI drafts and humans refine line-by-line; versioned, diffable, reviewable in PRs. Better: a canonical human-readable Trail spec (YAML/JSON) with a step editor UI (edit selector/value/checkpoint, insert/delete/reorder, re-verify just the edited range), which also unlocks git-versioned trails.

#### 49. [P1] No mid-run control: no cancel, pause, hint, or human takeover

*Category: usability · Areas: authoring*

Once `runAuthorNow` starts, there is no API to abort the background drive (trails-author.ts:252-274 has no cancellation token; the loop checks only cost/deadline, lines 84-85) — a user who typed the wrong baseUrl waits up to 300s+180s while the slot is blocked for everyone. There's also no way to nudge a stuck run ('the login button is in the top-right') or take over manually for a CAPTCHA/OTP wall — the model can only stall (trails-author-model.ts:36) and the user restarts from scratch. Mature agentic-QA tools offer live view + pause/step-through + human-in-the-loop takeover. Better: a cancel endpoint flipping a flag the loop checks each iteration; later, an 'inject hint into history' primitive (the `history` array, trails-author.ts:57/102/144, is already the natural channel).

#### 50. [P1] AI (Tier-2 vision) self-heal fallback is OFF in production walks

*Category: competitive · Areas: runner*

The runner's headline Momentic-parity feature — cached selectors with AI fallback — is only half-enabled in prod. realWalk (the path every dashboard/trigger run takes) never passes a vision resolver: trails-trigger.ts:27-30 builds WalkOptions with replay/launchArgs/deadlineMs/stepShots but no `vision`, and the file comment says so explicitly ('Vision (Tier-2) is OFF in realWalk; a flagged Trail (the regression demo) opts in', trails-trigger.ts:9-10). So a prod step that exhausts Tier 0/1 just goes RED with needsVision:true evidence (trails-runner.ts:554-570) — the user sees a broken run, not a healed one, on exactly the drift cases the vision tier was built for. Better: enable openRouterVisionResolver in realWalk behind a per-project setting + cost cap, since the trust gates (0.9 confidence, AMBER-never-green, assert short-circuit) already exist and are tested.

#### 51. [P2] Project instructions.md: per-project setup guide the author model reads — incl. test-mode auth conventions (e.g. ?test_mode=true accepts any password)

*Category: functionality · Areas: user-decision*

From user decision (2026-07-07): self-serve customers often have app-specific test affordances — e.g. a URL param like ?test_mode=true that accepts any password, seeded demo accounts, or a staging host with auth relaxed. Add a per-project instructions.md (editable in the dashboard, stored on the project) that the authoring model receives as trusted context before driving: how to log in, which test-mode conventions exist, what areas are off-limits, known quirks. Surface it in onboarding ('tell your AutoSim how to get into your app'). This complements the encrypted Test Accounts vault (ADR-0001) rather than replacing it; the instructions text must be fenced as project-owner-provided context, distinct from untrusted page content.

#### 52. [P2] Single test account with email+password shape only; no OTP/passwordless or multi-role flows

*Category: usability · Areas: authoring*

Authoring accepts one testAccountName and exposes exactly two placeholders — email and password (trails-author.ts:51-55). Passwordless/OTP products (including Klavity itself, which needed the KLAV_TEST_OTP=666666 bypass hack for its own e2e) can't be authored without server-side hacks; flows involving two actors (admin invites user; buyer + seller) are impossible. Better: arbitrary named secrets per test account, an inbox/OTP-retrieval primitive (test-mailbox integration), and multiple accounts per authoring request — table stakes for a mature AI QA product testing real auth flows.

#### 53. [P2] F2 recorder / hybrid auth missing — OTP/OAuth/MFA apps can't be tested

*Category: functionality · Areas: docs*

ADR-0001 (/Users/vishalkumar/Downloads/qbug/klav-snap/docs/adr/0001-stored-test-account-credentials.md) limits v1 to password logins; 'OTP/OAuth/MFA still stall until the F2 recorder + hybrid auth land'. F2 (MV3 extension recorder capturing semantic actions + storageState export, trails design §4) is unbuilt and gated on manual Chrome Web Store review. Any prospect whose app uses SSO/Google login/magic links cannot author an authed Trail at all — a hard market-coverage cap the spec should treat as a top-of-funnel constraint, possibly worth an interim server-side workaround (e.g. the shipped KLAV_TEST_OTP-style bypass pattern for the customer's own app is not generalizable).

#### 54. [P2] Stall reasons and errors are raw technical strings shown to non-technical users

*Category: usability · Areas: authoring*

The stop-show-refine UX surfaces stallReason verbatim, e.g. 'selector "#foo" matched 3 elements (need exactly 1)' (trails-author.ts:119), 'locator.count timed out after 10000ms' (lines 65-66, 118), 'author model 502' (trails-author-model.ts:106), or 'authoring budget cap $0.15 reached after 12 model calls' (trails-author.ts:84). dekref (line 28) only masks kref attrs, not Playwright/HTTP jargon. A founder/PM can't turn these into a refined objective. The prompt does ask the model for a user-readable deliberate-stall rationale (trails-author-model.ts:36) — but system-generated stalls (misses, timeouts, caps, HTTP errors) bypass that. Better: a translation layer mapping stall classes to plain language + a suggested next action ('The page has 3 buttons that look like this — describe which one, e.g. "the one in the header"'), keeping the technical detail behind a disclosure.

#### 55. [P2] No modules/reuse or parameterization — every trail re-authors login from scratch

*Category: competitive · Areas: authoring*

A Trajectory is a flat step list (trails-crystallize.ts:20-27); the only variable substitution is the two hard-wired credential placeholders from a single test account (trails-author.ts:50-55, trails-creds resolution at line 131). There is no 'login module' shared across trails, no data-driven runs (same trail, N inputs), no environment variables (baseUrl is baked per trail, trails-crystallize.ts:83), no arbitrary secrets. Momentic ships reusable modules + parameters as a headline feature; without it every authored trail redundantly re-drives (and can flakily fail) the same login prefix, multiplying cost and fragility. Better: sub-trail references (step type 'run trail X'), named variables resolved at walk time, and env/baseUrl overrides per run.

#### 56. [P2] Action vocabulary too narrow for real-world flows (no hover/keys/iframe/tabs/upload/scroll; fixed-ms waits only)

*Category: functionality · Areas: authoring*

The op set is navigate/click/type/select/assert/wait/done/stall (trails-author-model.ts:9, trails-author.ts:39) — no hover, keyboard press (Enter/Escape), drag, scroll-into-view, file upload, iframe or new-tab handling, and no checkbox/radio semantics beyond click. `wait` is a fixed 500-15,000ms sleep (trails-author.ts:111) rather than wait-for-condition (element/network/URL), which both slows runs and bakes flakiness into crystallized trails and exported code (`page.waitForTimeout`, trails-codegen.ts:38-41). Assertions are visibility-only (page.assertVisible, trails-author.ts:133) — no text-equals, URL, count, or value assertions. Datepickers, rich editors, OAuth popups, and drag-to-reorder UIs are currently un-authorable. Better: extend the action schema (press/hover/upload/waitFor{selector,url}) plus richer assert kinds; each new op flows through crystallize/runner/codegen cleanly given the existing StepAction seam.

#### 57. [P2] Assertion vocabulary is visibility-only; action vocabulary is 6 verbs

*Category: functionality · Areas: runner*

An assert step is exactly `locator.waitFor({state:'visible'})` (trails-runner.ts:594) — there are no text-content, input-value, URL, count, attribute, or network-response assertions, and no visual-regression diffing. Actions are limited to navigate/wait/type/click/select/assert (trails-runner.ts:463-481, 579-595): no hover, keyboard shortcuts, drag, file upload, iframe scoping, new-tab handling, or dialog handling. Momentic supports rich AI assertions ('assert the cart total is $42') plus visual checks. This caps what Trails can verify to 'the element exists' — a page that renders the button but shows wrong data walks GREEN. Better: extend TrailStep with assert kinds (text/value/url/ai-visual via the existing vision resolver) and the missing interaction verbs.

#### 58. [P2] Hard-coded, non-configurable caps (40 steps / $0.15 / 300s) preclude long journeys

*Category: functionality · Areas: authoring*

AUTHOR_MAX_STEPS=40, AUTHOR_MAX_COST_USD=0.15, ACTION_TIMEOUT=10s are module constants (trails-author.ts:20-23) and driveDeadline defaults 300s (line 64); `runAuthorNow` passes none of them (lines 262-265), so the HTTP path cannot raise limits per project/plan. A realistic multi-page journey (signup → onboard → configure → verify email) with a few misses exhausts 40 steps or 300s. Combined with no-resume, the cap is a cliff: work is lost, not paused. Better: per-project/plan-configurable budgets, and cap-hit should checkpoint (see resumability gap) rather than discard.

#### 59. [P2] Codegen silently drops steps and exports non-functional credential placeholders

*Category: functionality · Areas: authoring*

generatePlaywright emits click/type/select/assert ONLY `if (sel)` (trails-codegen.ts:30-46) — a step missing from the selectors map vanishes from the exported test with no comment, producing a file that passes while skipping actions. `type` steps embed actionValue verbatim (line 33), and for credential fields that value is the literal '{{cred:acc:password}}' placeholder (kept by design, trails-author.ts:135, header lines 4-6), so any exported login test fills a placeholder string and fails — with no env-var scaffold or warning. Selector-less asserts emit `expect(true).toBeTruthy()` (lines 48-51), a green no-op. Better: emit `// SKIPPED STEP` comments, translate cred placeholders to `process.env.X` reads with a header note, and make selector-less checkpoints at least a soft text assertion.

#### 60. [P2] No network mocking, stubbing, or request interception at all

*Category: competitive · Areas: runner*

There is zero use of page.route()/request interception anywhere in the engine — walks always hit the live network. Momentic offers API mocking/stubbing as a core determinism lever. Consequences here: (a) 'wait' steps settle on networkidle (trails-runner.ts:478), which third-party beacons/analytics can hold open or satisfy spuriously; (b) runs against a real backend mutate real data and depend on real latency; (c) there is no way to simulate error states (500s, slow APIs) to test app behavior. Better: a per-trail network policy (block third-party, stub matched routes with recorded fixtures, optional HAR record/replay) — Playwright supports all of this natively via context.route()/routeFromHAR.

#### 61. [P2] Deterministic replay is selector-deterministic only — no environment determinism, no trace artifact

*Category: competitive · Areas: runner*

'Zero-LLM deterministic replay' (trails-runner.ts:1-2) means the selectors are cached — but the environment is not deterministic: live network, real clock, real backend state, networkidle heuristics (trails-runner.ts:478). The same trail can green/red across runs purely on backend state. There is also no Playwright trace (tracing.start/stop is never used), so there is no step-time-travel artifact beyond rrweb (which records the DOM but not network/console). Momentic sells reproducible runs + rich traces. Better: optional HAR record on first green walk + routeFromHAR replay mode for true determinism; enable Playwright tracing (screenshots+snapshots) gated by a flag, stored like walk_replays.

#### 62. [P2] Authoring progress is 2s-polling with no reattach — closing the modal orphans the session

*Category: usability · Areas: ui*

pollAuthor (trails.html:845-908) polls GET /api/trails/author/:id every 2s; the sessionId lives only in modal-scope JS. There is no list-author-sessions endpoint (only GET by exact id, server.ts:2946-2949), so if the user closes the modal/tab mid-author (runs can take minutes: 40 steps × LLM latency), they cannot re-attach to watch progress — the draft trail just eventually appears in the list with no context. The 200-iteration timeout message even says 'Reopen this page shortly' (trails.html:906) but reopening shows nothing about the in-flight session. No SSE/streaming either — every step line arrives on the next 2s tick. No live screenshot/screencast of what the AutoSim is doing (F1.5 CDP screencast is planned, not built).

#### 63. [P2] Auto-file pipeline intentionally inert; tickets carry no visual evidence

*Category: functionality · Areas: findings*

processWalkFindings is explicitly NOT wired into the runner (trails-findings-gate.ts:56-60) — every finding requires manual file/dismiss via POST /api/trails/findings/:id/file|dismiss (server.ts:2884-2900), so the promised 'auto-file hard regressions' loop doesn't run; the per-project opt-in toggle it's gated on was never shipped. When a human does file, buildTicketFromFinding (trails-findings-gate.ts:119-142) sends text only: url is null, no step screenshotKey/presigned image, no share-link to the walk report or replay — the recipient in Plane/Linear gets no visual proof even though the evidence exists (run_step.evidence.screenshotKey, walk_replays). Better: ship the opt-in auto-file toggle + attach a minted share link and the failing step's screenshot to the ticket body.

#### 64. [P2] Presigned screenshot URLs expire in 1h and fall back silently to empty

*Category: stability · Areas: findings*

gatherWalkReport presigns each screenshotKey for 3600s and silently returns '' when S3 env/require fails (trails-report.ts:38-46, empty catch) — a misconfigured box produces image-less reports with zero signal. The PDF path is safe (images are inlined at render time), but any HTML use of the report and any re-render after 1h yields broken images; the share token itself lives 30 days (trails-share.ts:29) while its underlying evidence links die in an hour unless re-rendered. Also the CommonJS require('./s3') inside an ESM/Bun module (trails-report.ts:41) is fragile. Better: log the presign failure, presign at render time only (already done for PDF) and document that HTML reports are ephemeral, or proxy images through an authenticated route.

#### 65. [P2] Connector/filer failures are swallowed with no observability

*Category: observability · Areas: findings*

realFiler's per-connector createIssue errors are empty-caught (trails-findings-gate.ts:165-167), processWalkFindings catches filer errors to null (line 71), and fileFindingById does the same (line 94) — a failed file returns ok:false with no reason, nothing is logged, and no error/attempt count is stored on the finding. An operator cannot distinguish 'no connector configured' from 'Plane API key expired' from 'network down'. Expectations-spine ingest failures are only console.warn (trails.ts:213, 226). Better: record lastFileError + attemptedAt on the finding row, log with context, and surface the failure reason in the review-queue UI response.

#### 66. [P2] Self-healing is seeded but authoring persists brittle fallback selectors; no AI re-location at author time

*Category: competitive · Areas: authoring*

Crystallize seeds locator_cache with fingerprints so the heal path can update rows (trails-crystallize.ts:102-118 — good foundation, matches Momentic's cached-selector model). But the persisted selector chain is stableSelector → raw domPath → original kref string (trails-author.ts:124-127): domPath is position-based and breaks on any structural change, and a persisted kref selector is dead on arrival (krefs are renumbered every capture, line 27). The multi-signal Fingerprint (role/accessibleName/testId, per trails-draft-gate.test.ts:38-47) is stored but healing quality depends entirely on the runner's tiers. Better: at crystallize time, flag steps whose only handle is domPath/kref as 'fragile' for reviewer attention, and prefer synthesizing a role/name/testid-based selector from the fingerprint before falling back to domPath.

#### 67. [P3] Verification verdict lacks guidance; red/amber drafts leave the user without a next step

*Category: usability · Areas: authoring*

The outcome exposes verdict green/amber/red plus a runId (trails-author.ts:169-171) — the skip→amber mapping thoughtfully avoids false alarms — but a red verification of a just-authored trail (author run succeeded, replay failed: usually non-determinism, one-time state like 'account already exists', or a fragile selector) is delivered with no diagnosis or suggested remedy, and no automatic second verification attempt to distinguish flake from real breakage. Better: on red, auto-diff the failing step against the authoring log (both are step-aligned), classify (selector drift vs state dependence vs timing) and say so in plain language; offer one-click 're-verify' and 're-author from failing step'.

#### 68. [P3] Cross-browser and viewport coverage: Chromium-only, single default viewport

*Category: competitive · Areas: runner*

The runner launches only chromium (trails-runner.ts:11, 328) and never sets viewport/device emulation (browser.newPage() with defaults at trails-runner.ts:364; the Puppeteer path even sets defaultViewport:null, trails-browser-page.ts:217). No firefox/webkit, no mobile viewport runs, no configurable window size per trail — so responsive-layout regressions (the classic 'button hidden under the hamburger at 375px') are undetectable. Momentic supports browser/viewport matrices. Better: per-trail viewport + optional engine field threaded through the existing launch seam (trails-browser.ts is explicitly designed as 'the single seam for where/how browsers launch', trails-browser.ts:1-3).

#### 69. [P3] Walk rows display raw trailId instead of trail name

*Category: usability · Areas: ui*

trails.html:565 and autosims-walks.html:183 render esc(w.trailId) as the row title, so the Walks card shows opaque ids like 'trail_ab12…' instead of 'Login and create a project'. listRecentWalks (lib/trails.ts:175) doesn't join the trail name and the client doesn't map it from d.trails (which it already has in memory). One-line fix client-side; the walk DETAIL page does resolve the name (autosims-walk.html:293).

#### 70. [P3] Run-button polling gives up at exactly the walk deadline; no auto-refresh for running walks

*Category: usability · Areas: ui*

runTrail polls 80 × 1.5s = 120s (trails.html:446) which equals WALK_DEADLINE_MS (lib/trails-trigger.ts:18) — a walk that uses its full deadline shows a stale 'running' state until manual reload. The All Walks page has a 'Running' filter (autosims-walks.html:104) but never re-polls, so a running walk never flips to its verdict without a manual refresh.

#### 71. [P3] Amber heal-diff hint fetches the full rrweb replay payload per trail

*Category: observability · Areas: ui*

healDiffFor (trails.html:456-468) calls GET /api/trails/walks/:id/replay — which returns ALL rrweb segments (potentially MBs) — just to extract fromSelector/toSelector from run_steps. The lighter GET /api/trails/walks/:id endpoint (server.ts:2865-2882) already returns steps without segments and should be used instead. One wasteful call per amber trail on every dashboard render.

#### 72. [P3] Share-token lifecycle gaps: no revocation, no listing, expired rows never purged

*Category: functionality · Areas: findings*

mintShareToken inserts a hashed token with 30-day TTL (trails-share.ts:25-50) but there is no revoke endpoint, no way to list a walk's active links, and resolveShareToken (lines 56-73) only checks expiry — expired rows accumulate forever in walk_share_tokens. The raw token also travels as a URL path segment (server.ts:2672) so it lands in access logs and Referer-stripped only by luck; the PDF is fully anonymous once shared. Acceptable for v1, but a spec should add revoke + list + periodic purge and consider shorter default TTLs for reports containing authenticated-app screenshots.

#### 73. [P3] Cost levers identified but not exhausted: flash-lite model-mix and dense-page snapshot behavior

*Category: functionality · Areas: docs*

Bench key-finding #3 (prototype/docs/bench-autosim-cost.md): gemini-2.5-flash-lite handles single-step action-picking at −93% cost (5/6 valid) and is suggested 'as a weighted mix', but the kref spec scoped model-mix changes out (specs/2026-07-04-autosim-kref-snapshot-design.md 'Out of scope'), so the authoring loop still runs qwen3-vl-only. Bench caveats also flag that the kref serializer may starve text-assert steps (may need a visible-text digest) and dense content pages can exceed raw HTML without the cap — both are recorded ideas without follow-up work items. Cheap wins for a cost-sensitive open-core positioning ('unaffordable continuous testing' is one of the loudest commercial complaints per trails design §1).

#### 74. [P3] Error-path vision calls are invisible in the cost ledger

*Category: observability · Areas: runner*

Only 2xx vision responses write an ai_calls 'reheal' row (trails-vision.ts:111-123); non-2xx/thrown calls are 'intentionally NOT billed or logged' (trails-runner.ts:114-118). OpenRouter still incurs cost/latency on some error classes (e.g. 200-with-garbage is ledgered, but timeouts/5xx after partial processing are not), and more importantly the opsadmin credits dashboard undercounts vision attempts, hiding a misbehaving model/provider (repeated 429/500 storms would show zero spend and zero calls). Better: ledger error-path attempts with costUsd=null and an error tag so call volume and failure rate are observable.

#### 75. [P3] Known prod selector ambiguity (.hero-cta duplicate) flagged by dogfood, fix not recorded

*Category: usability · Areas: docs*

Dogfood §3b: klavity.in home has two .hero-cta containers (hero + footer CTA) so '.hero-cta .btn-indigo' matches 2 elements → uniquelyResolves false → element_gone RED for any Trail crystallized from the hero CTA. Doc recommends renaming the footer div (.final-cta). No doc read here records the rename shipping; dogfood-autosim.ts:78-80 still carries the warning comment. Trivial fix that removes a landmine for the flagship dogfood demo.

#### 76. [P3] Roadmap/status truth is fragmented; PRD is stale and self-contradictory on AutoSim

*Category: usability · Areas: docs*

docs/PRD.md:24 compresses all of Phase 3 to one line ('Self-healing end-to-end testing... Shipped') and its roadmap §5 still says 'Phase 3 ... (shipped; formerly Klavity OS)' with no mention of F1.5/CI/F2/Plan H; the real roadmap lives across a decisions memo (specs/2026-07-03-autosims-f1-authoring-decisions.md), a research delta (research/2026-07-03-autosims-cicd-livewatch-landscape.md §4), an ADR, and bench appendices — e.g. the text-first default flip exists ONLY as an appended DECISION line in prototype/docs/bench-autosim-cost.md:111. Also the checked-out CHANGELOG.md tops out at 0.39.109/2026-06-22 while PRD claims 0.39.326 — F1/kref shipping entries aren't visible here. For a product spec, better looks like one living AutoSim roadmap doc (F1→F1.5→CI v1→F2→Plan H with done/pending status and decision log) referenced from the PRD.

## 5. Success criteria

- **Stability:** zero runs stuck in "running"; two projects can run walks concurrently; a transient OpenRouter 5xx no longer kills an authoring attempt; browser memory off the 1GB box.
- **Insight:** every completed walk yields a persona-voiced insight report a founder would forward to their team; findings dedup across trails; trends visible over ≥30 days.
- **Triggers:** a Trail can run on a schedule and on a deploy webhook, and alert on red — with no human clicking Run.
- **Self-serve:** a new signup can author, review, edit, activate, and schedule a Trail against their own logged-in app (test account or test-mode convention) without founder assistance.

## 6. Out of scope (this iteration)

- Mobile (Android/iOS) runners — Momentic has them; revisit after web self-serve proves out.
- MCP server surface (agent interop) — after public API (Phase 3) lands.
- Cross-browser matrix beyond Chromium (kept as P3 backlog item).
