# Autonomous Flow Discovery + Unprompted Exploratory Bug-Finding

> AutoSim capability spec. Field-checklist items 5 & 6. Ground: `authorTrail`
> drive loop + `krefSnapshot` + the `findings` filing gate. Complements (does not
> replace) persona Sims.

## Problem & user value

Today every AutoSim run is **objective-driven**: a human writes a Trail objective
(`AuthorRequest.objective`) or converts a persona Sim, then `authorTrail` drives a
browser toward that goal and `walkTrail` replays it on a schedule. That catches
regressions on flows a human already thought to describe. It cannot catch a bug on
a flow **nobody wrote a Trail for** — a broken link three clicks deep, a 500 on a
settings sub-tab, a console explosion on an edge state, a form that silently eats
input. The north star ("catch nearly all bugs") requires an agent that, given only
a base URL (and optional creds), **maps the app itself and hunts bugs with no
objective** — crawl, form-fuzz, state exploration, and universal invariant checks
(no-console-errors / no-broken-links / no-500s / no-unhandled-rejections).

User value: point Klavity at your app, and before you have authored a single
Trail you get a triaged list of real, grounded defects — plus a set of
**suggested Trails** (the discovered flows) you can promote to scheduled AutoSims
with one click. It turns AutoSim from "watches the flows you described" into
"finds the flows and the bugs on them."

## Goals / Non-goals

**Goals**
- A new run kind — an **Explorer walk** — that takes a base URL + optional test
  account and autonomously visits N states, exercising links/forms/buttons.
- Per-state **invariant checks** that need no objective: console errors, page
  errors / unhandled rejections, failed requests, HTTP ≥ 500 on the document or
  same-origin XHR/fetch, broken same-origin links, and (LLM-judged) "page looks
  broken / empty / error state".
- Bounded, cost-capped exploration (max states, wall-clock deadline, same-origin
  only, SSRF-guarded) reusing the existing walk slot + Steel/CDP seam.
- **Findings filed through the existing gate** (`recordFinding` → dedup →
  `findings` table → `processWalkFindings` auto-file/queue → connector), so
  Explorer bugs land in the same inbox/tickets as regression findings, deduped
  against them.
- **Suggested Trails**: each discovered flow (a click-path that reached a new
  state) is persisted so the user can promote it to a real scheduled Trail.
- Surfaced on the same v1 API / MCP surface (`/api/v1/...`, `klavity-autosim`
  MCP server) as authored runs.

**Non-goals**
- Not replacing persona Sims or authored Trails — this is additive coverage.
- No destructive fuzzing of prod data by default (no bulk-delete, no payment
  submit) — mutation actions are gated behind an allowlist / dry-run per phase 1.
- No cross-origin crawling; no auth bypass; no re-implementation of the browser
  driver, snapshotting, findings, dedup, or connector layers (all reused).
- Not a general web crawler for SEO — coverage is app-state coverage for QA.

## Competitor benchmark (concrete)

- **QA.tech — Plan-Act-Verify loop.** Continuous perceive→plan→act→verify→learn
  loop against the *live* app; re-reads state after each action and decides
  continue / retry-differently / report-failure. Exploratory mode: when a PR or
  area is flagged, it **crawls just the changed part**, identifies new UI
  patterns, and *generates concrete candidate cases* ("a dark-mode toggle was
  added — verify it activates, persists on reload, is consistent across pages")
  that a human reviews and promotes into a plan. Takeaway for us: our drive loop
  in `authorTrail` is already a perceive(kref/screenshot)→plan(LLM)→act loop; we
  add the "no objective, report invariant violations + emit candidate flows"
  mode and a promote-to-Trail review step.
- **Propolis (now Datadog) — swarms of autonomous browser agents.** Agents learn
  the product by exploration with no script/setup, **auto-identify real user
  journeys and goals**, run hundreds of user-like sessions in parallel to cover
  edge cases, self-heal, keep coverage current across runs, and send detailed
  traces to engineering. Takeaway: coverage comes from *breadth of sessions* +
  auto-discovered journeys, and the output is (a) bugs and (b) durable
  journeys/tests. We mirror this with the Explorer walk (breadth via a
  state-frontier crawl within one bounded run) and **discovered_flows** →
  suggested Trails as the durable artifact. We keep our differentiator: every
  finding is *grounded* (mechanical verification or `groundQuote`) and deduped,
  where Propolis leans on volume.

Both converge on: no-script goal-free exploration → report bugs → emit reusable
journeys. Our edge is the grounding/dedup/anti-slop gate that already ships.

## Current state in our codebase (file refs)

The building blocks exist; nothing today runs goal-free.

- **Drive loop** (perceive→plan→act): `authorTrail(...)` at
  `lib/trails-author.ts:273` — LLM drives a real browser step-by-step toward
  `AuthorRequest.objective` (`lib/trails-author.ts:104`). It already has:
  live-frame callback, checkpoints, abort signal, auth-gate handling
  (`onNeedsAuth`), per-project auth (KLA-184), cost/deadline caps.
- **Replay/verdict engine**: `walkTrail(...)` at `lib/trails-runner.ts:699` —
  runs a Trail's steps, acquires browser via the local/Steel CDP seam, records
  `run_steps`, computes verdict, and drives findings on non-draft trails.
- **Page-state snapshot**: `krefSnapshot` (`lib/trails-browser-page.ts:378`) and
  `captureKrefSnapshot` (`lib/trails-snapshot.ts:70`) — the compact,
  ref-annotated element tree (`role "name" [ref=eN]`) that shrinks page state
  90-97% and is the substrate for both driving and asserting.
- **Invariant primitives — ALREADY BUILT, not yet wired to goal-free exploration:**
  - `WalkEvidenceCollector` (`lib/trails-walk-evidence.ts:44`) — attaches to a
    Playwright page and collects console entries, page errors, failed requests,
    failed responses per step. This *is* our console/500/unhandled-rejection
    invariant source.
  - `bugcheck.ts`: `extractLinks` (`lib/bugcheck.ts:101`),
    `sameOriginCrawlTargets` (`lib/bugcheck.ts:167`), `verifyLinks`
    (`lib/bugcheck.ts:242`), `brokenLinkFindings` (`lib/bugcheck.ts:305`,
    ships as `confidence: "verified"`), plus grounding helpers `isGrounded`,
    `filterModelFindings`, `classifyModelFinding`, `applyProspectSafety`.
    `sameOriginCrawlTargets` already computes a crawl frontier — it is currently
    only used for the marketing/site scan, not an authenticated app Explorer.
- **Findings pipeline**: `recordFinding(...)` (`lib/trails.ts:514`) with
  cross-trail content dedup (KLA-77) + atomic per-step dedup, writing the
  `findings` table (`lib/db.ts:655`; `FindingKind = "regression" | "visual" |
  "amber_heal"`, `lib/trails-types.ts:16`). Filing gate:
  `processWalkFindings` / `maybeAutoFileWalkFindings` /
  `decideFindingAction` (`lib/trails-findings-gate.ts:79/118/28`) → `realFiler`
  (`:342`) → connector. Alerts: `notifyWalkRed` (`lib/walk-red-alert.ts:147`).
- **Trigger + scheduler**: `runWalkNow` (`lib/trails-trigger.ts:92`, single walk
  slot, snap-only gating, milestone) and `tickScheduler` (`lib/trails-scheduler.ts:248`).
- **API/MCP surface**: authored runs `lib/v1-authored.ts` + `buildAuthoredRunStatus`
  (`:23`); walk runs `lib/v1-runs.ts` (`buildV1RunStatus`, `mapFindingToIssue`,
  `buildV1Report`); MCP tools `lib/mcp/tools.ts` dispatched by
  `handleMcpMessage` (`lib/mcp/rpc.ts:39`, server name `klavity-autosim`).
- **Trail model**: `Trail` (`lib/trails-types.ts:46`, has `authorKind`, `schedule`,
  `sourceSimId`), `AuthorKind = "llm" | "human" | "mixed"` (`:4`), steps in
  `trail_steps`, runs in `trail_runs`.

Gap: there is **no run mode that takes only a base URL and explores**. All entry
points require a `trailId` with authored steps or an `objective`.

## Proposed architecture

Add an **Explorer** mode that reuses the drive loop for local decisions but adds a
BFS-style state frontier and per-state invariant assertions, and files through the
existing findings gate. Three new modules + surgical wiring; no rewrite of the
driver/snapshot/findings layers.

### 1. `lib/explorer-run.ts` — orchestrator (new)
`exploreApp(projectId, req: ExploreRequest, opts): Promise<ExploreOutcome>`
- `ExploreRequest = { baseUrl; testAccountName?; viewport?; maxStates?;
  deadlineMs?; allowMutations?: boolean; createdBy }`.
- Acquire the browser through the **same seam** used by `walkTrail`
  (`acquireWalkBrowser` in `lib/trails-runner.ts`) so local/Steel and the retry
  wrapper are inherited. Run inside `withWalkSlot(..., projectId)` via a new
  trigger path in `runWalkNow` (see wiring) so we keep per-project fairness, the
  deadline ceiling, snap-only gating, and crash isolation for free.
- If `testAccountName` set, perform the project's registered auth exactly as
  `authorTrail` does (reuse the KLA-184 auth block / `autosim-auth-probe.ts`
  helpers) so exploration runs authenticated.
- Attach a `WalkEvidenceCollector` (`lib/trails-walk-evidence.ts`) to the page for
  the whole run — this is the console/pageerror/failed-request/failed-response
  source.

### 2. `lib/explorer-frontier.ts` — state model + planner (new)
- **State key**: `stateKey(url, kref)` = normalized pathname (strip volatile
  query/id segments) + a structural hash of the `captureKrefSnapshot` role/name
  tree (reuse the snapshot; hash roles+names, not values). Dedupes "same screen,
  different data".
- **Frontier**: BFS queue of `{ stateKey, url, actionPath }`. Seed with
  `sameOriginCrawlTargets(extractLinks(html, baseUrl), baseUrl, cap)`
  (`lib/bugcheck.ts:167/101`) so link-graph coverage is mechanical/cheap, and
  interleave LLM-chosen interactive elements from the kref (`[ref=eN]`) for
  behind-a-click states forms/menus/tabs the link scan can't see.
- **Action selection**: one LLM call per state (reuse the `AuthorModel` seam from
  `authorTrail`) with a *goal-free* system prompt: "list the untried interactive
  refs worth exercising to increase coverage; classify each as safe-navigation /
  form-fill / destructive". Destructive stays queued and is skipped unless
  `allowMutations`. Form-fill uses a small deterministic fuzz vocabulary (empty,
  very-long, XSS-ish `"><script>`, unicode, wrong-type) — this is the form-fuzz
  primitive. Cap actions/state and total states (`maxStates`, default 40).

### 3. `lib/explorer-invariants.ts` — universal checks (new)
Pure functions over the evidence slice + page, producing `BugFinding[]` in the
`bugcheck.ts` shape so `classifyModelFinding` / grounding reuse applies:
- `consoleErrorFindings(slice)` — from `WalkEvidenceCollector` console `error`
  entries (severity high; dedup by normalized message).
- `pageErrorFindings(slice)` — unhandled exceptions / promise rejections (high).
- `httpFailureFindings(slice)` — same-origin responses with status ≥ 500 (high),
  document-level 4xx (medium); reuse `verifyLinks` semantics for classification.
- `brokenLinkFindings(verifyLinks(...))` — **already exists**, `verified`.
- `blankOrErrorStateFinding(kref, screenshot)` — one cheap LLM/heuristic judge for
  "empty/blank/error page" only when the kref is suspiciously small or an error
  keyword appears; grounded via `groundQuote` against captured page text
  (`isGrounded`, `lib/bugcheck.ts:357`).
Each finding carries `evidence` = { stateKey, url, actionPath, consoleTail,
statusCode }, a `dedupKey` = `explore:<kind>:<normalizedSig>`, and a `contentSig`
so cross-run/cross-trail dedup (KLA-77) collapses repeats.

### 4. Wiring into existing pipeline
- **New `FindingKind`**: extend `type FindingKind` (`lib/trails-types.ts:16`) with
  `"explore"`. `severityForKind` (`lib/trails-findings-gate.ts:185`) and
  `computeFindingSeverity` get an `explore` case. `decideFindingAction`
  (`:28`) already keys off kind+confidence — mechanical explore findings
  (verified: broken link / 500 / console error) auto-file; LLM-judged ones queue.
- **File via `recordFinding`** (`lib/trails.ts:514`) with `runId` = the explorer
  run, `trailId` = a synthetic per-run explorer trail id (see data model),
  `urlPath` set so expectations ingest works. Dedup + expectations spine come free.
- **Trigger**: add `trigger: "explore"` to `runWalkNow` (`lib/trails-trigger.ts:92`)
  or a sibling `runExploreNow` that shares `withWalkSlot`; on completion call the
  existing `maybeAutoFileWalkFindings(projectId, runId)` unchanged.
- **Alerts**: reuse `notifyWalkRed` for a run that produced high-severity explore
  findings.

### 5. Discovered flows → suggested Trails
Persist each frontier edge that reached a *new* state as a `discovered_flow` row
(actionPath = ordered list of `{action, ref, kref-name, url}`). A promote step
converts a `discovered_flow` into a real `Trail` + `trail_steps` (authorKind
`"llm"`, status `draft`) by mapping each action to the existing `TrailStep`
shape — reusing `recordedStepState` (`lib/trails-snapshot.ts:47`) selector/target
capture so the promoted Trail is replayable and schedulable like any other.

## Data-model changes

Additive migrations in `applySchema` (`lib/db.ts`), mirroring existing patterns.

1. **Reuse `trail_runs`** for explorer runs — add a synthetic trail per project
   ("Explorer" trail, `authorKind='llm'`, `status='draft'`, no steps) so
   `run_id`/`findings`/`run_steps`/replay all key off the existing FKs with no new
   run table. Store `trigger='explore'` (extend the trigger CHECK/enum usage).
2. **`explore_states`** (new): `id, project_id, run_id, state_key, url,
   action_path_json, kref_sig, first_seen_at`. One row per distinct visited state;
   powers the coverage map + dedup audit. Index `(project_id, run_id)`.
3. **`discovered_flows`** (new): `id, project_id, run_id, title, steps_json,
   state_key, promoted_trail_id, created_at`. `promoted_trail_id` NULL until the
   user promotes. Index `(project_id, created_at)`.
4. **`findings`**: no column change — add `'explore'` to the `kind` value domain
   only (kind is free TEXT, `lib/db.ts:661`). `FindingKind` type widened.

## API / MCP / CLI surface

- **REST**: `POST /api/v1/explore` `{ base_url, test_account?, max_states?,
  allow_mutations? }` → `{ explore_run_id }` (mirrors `/api/v1/runs`; reuses
  `buildV1RunStatus` shape from `lib/v1-runs.ts`). `GET /api/v1/explore/:id`
  status; `GET /api/v1/explore/:id/report` → issues via `buildV1Report`
  (`mapFindingToIssue` unchanged) + a `coverage` block (states visited, flows
  discovered). `GET /api/v1/explore/:id/flows` and `POST
  /api/v1/explore/flows/:flowId/promote` → new draft Trail.
- **MCP** (`lib/mcp/tools.ts`, server `klavity-autosim`): add `explore_app`
  (args: base_url, test_account?, max_states?), `get_explore_report`,
  `promote_flow`. Same `requireProject` / `ToolError` / entitlement conventions;
  busy-slot surfaces the existing retryable message via `handleMcpMessage`.
- **Dashboard/CLI**: an "Explore my app" button on the AutoSims page that hits
  `POST /api/v1/explore`; scheduled explorer runs reuse `tickScheduler` by giving
  the synthetic Explorer trail a `schedule` cron.

## UX / reporting

- **AutoSims page**: "Explore my app" CTA (URL prefilled from project baseUrl,
  optional test account). Live run shows the existing screencast frames
  (`onLiveFrame`) + a growing **coverage map** (states visited / links checked /
  forms exercised) and a live findings count.
- **Report view**: reuse the walk-report UI — issues grouped by severity with
  grounded evidence (console tail, failing URL+status, screenshot), each linking
  to the state + action path that produced it. A **"Discovered flows"** tab lists
  candidate journeys with a one-click **Promote to Trail** (→ draft, scheduled
  like any AutoSim).
- **Filing**: auto-filed / queued exactly as regression findings; same inbox,
  same connector, deduped against existing findings so an explorer 500 that a
  Trail already caught collapses (KLA-77 content dedup).

## Acceptance criteria

- Given only a base URL + a valid test account, an explorer run visits ≥ 1
  authenticated state beyond the entry page and terminates within `deadlineMs` and
  under `maxStates` without manual input.
- A seeded broken same-origin link, a seeded document 500, and a seeded
  `console.error` each produce exactly one `findings` row with `kind='explore'`,
  correct severity, and grounded evidence (URL/status/message).
- Re-running against an unchanged app produces **zero new** findings (all dedupe
  onto prior rows) — anti-slop guarantee holds via `recordFinding` dedup.
- Mechanical findings (broken link / 500 / console error) auto-file per
  `decideFindingAction`; the LLM "looks broken" judgment queues for review.
- Each distinct reached state is recorded once in `explore_states`; each new-state
  edge yields a `discovered_flows` row; promoting one creates a replayable draft
  `Trail` with `trail_steps` that a subsequent `walkTrail` can run green.
- Cross-origin URLs, SSRF-guarded hosts, and destructive actions (when
  `allow_mutations=false`) are never navigated/executed (assert via evidence log).
- `POST /api/v1/explore` + MCP `explore_app` return an id; report endpoints return
  issues in the existing v1 shape; a busy slot returns the retryable message.

## Test plan

- **Unit**: `explorer-frontier` state-key normalization (same screen/different
  data → same key; different tab → different key); `explorer-invariants` maps a
  synthetic evidence slice to the right `BugFinding[]` (console/pageerror/500/
  broken-link) with correct severity; frontier respects `maxStates` and
  same-origin-only.
- **Integration** (fixture app, like `server.trails.test.ts` harness with the
  in-memory `findings` table): a fixture site with (a) a broken link, (b) a route
  that 500s, (c) a page that throws in console, (d) a clean page. Assert exactly 3
  findings, correct kinds/severity, `explore_states` count, and ≥1
  `discovered_flow`. Then re-run → assert 0 new findings (dedup).
- **Promote**: promote a discovered flow → assert a draft Trail + ordered
  `trail_steps`; run `walkTrail` on it → green.
- **Negative control**: point the explorer at a fixture site with **no** broken
  links, no 500s, no console errors, no blank states → assert **zero** findings
  filed (proves invariants aren't hallucinating and the LLM "looks broken" judge
  doesn't fire on a healthy page). Also assert a cross-origin link in the fixture
  is enumerated but **never navigated** and produces no finding.
- **Auth**: with `KLAV_TEST_OTP=1` + `vishal@quantana.com.au` test account, an
  explorer run reaches a page behind the login wall (proves the KLA-184 auth reuse
  works in Explorer mode).
- Run `bun test` green before done; add an e2e under `journey/` for the explore →
  report → promote path.

## Phasing (what ships first)

- **Phase 1 (ships first) — Invariant Explorer over the link graph.** `exploreApp`
  + `explorer-invariants`, seeding the frontier from `sameOriginCrawlTargets` only
  (no LLM action selection yet), authenticated via test account, findings filed
  as `kind='explore'`, `POST /api/v1/explore` + report. This alone catches broken
  links / 500s / console errors across the whole reachable link graph — high value,
  low risk, mostly wiring existing primitives.
- **Phase 2 — LLM state exploration + form-fuzz.** Add `explorer-frontier` LLM
  action selection, form-fuzz vocabulary, `explore_states`, kref-structural state
  keys, coverage map UX, MCP `explore_app`.
- **Phase 3 — Discovered flows → suggested Trails.** `discovered_flows`, promote
  endpoint/UI, scheduled explorer runs via `tickScheduler`, and "explore the
  changed area on deploy" (QA.tech-style PR-scoped exploration) if a deploy hook
  exists.

## Effort estimate

- Phase 1: **M–L** (~1 wk) — new orchestrator + invariants module + one REST route
  + tests; heavy reuse of browser seam, evidence collector, bugcheck, findings gate.
- Phase 2: **L** (~1.5 wk) — frontier planner, LLM action loop, form-fuzz,
  state table, coverage UX.
- Phase 3: **M** (~1 wk) — flows table, promote (flow→Trail mapping), scheduling.

## Risks & open questions

- **Cost blow-up**: goal-free LLM per state can be expensive. Mitigation: Phase 1
  is LLM-free (mechanical link graph); Phase 2 caps states/actions and reuses the
  text-first driver economics from `authorTrail`. Reuse `maxStates`/`deadlineMs`
  and per-session call ceilings.
- **Destructive actions on prod data**: default `allow_mutations=false` +
  destructive-classification gate; recommend exploration against a named
  `TrailEnvironment` (staging) using existing environments support.
- **Finding slop / flakiness**: invariants must be grounded and deduped;
  transient console noise (3rd-party scripts) should be filtered to same-origin /
  allowlisted. Open question: threshold for the LLM "looks broken" judge before it
  auto-files vs always-queue.
- **State explosion / non-determinism**: BFS with a structural state key + hard
  caps; open question on how aggressively to normalize dynamic content in the key.
- **Overlap with persona Sims**: Explorer is invariant/coverage-driven, Sims are
  persona-opinion-driven — keep findings tagged by kind so the inbox distinguishes.

## Dependencies on other capabilities

- Browser/Steel CDP seam + walk slot (`trails-runner.ts`, `trails-trigger.ts`) —
  exists.
- Findings gate + connector export failsafe (KLA-551) — exists; explorer reuses it.
- Per-project AutoSim auth (KLA-184) for authenticated exploration — exists.
- Expectations spine (`expectations-ingest.ts`) — exists; explorer findings ingest
  automatically via `recordFinding`.
- Complements persona Sim reviews (`sim-review.ts`) — independent; no hard dep.
