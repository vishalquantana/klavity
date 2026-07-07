# AutoSim P0 Batch 1 Implementation Plan (KLAVITYKLA-52, 53, 54, closes 59)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make AutoSim runs trustworthy for concurrent self-serve tenants: fix the dead All-Walks page, replace the single global walk slot with a DB-backed FIFO queue, and move walk execution onto the Steel remote-browser adapter so Chromium leaves the 1GB box.

**Architecture:** Three seams already exist and are kept: (1) `withWalkSlot` in `lib/trails-browser.ts` is the only concurrency primitive — it is replaced by `lib/trails-queue.ts` (persistent FIFO, per-project fairness, env-tunable global concurrency); (2) `acquireBrowser()` in `lib/trails-browser-page.ts` is the only place browsers launch — the runner (`trails-runner.ts`) is ported onto its `BrowserPage` interface with the Tier-1 heal ladder moved to shared page-context evaluate bodies so Playwright and Puppeteer-over-CDP behave identically; (3) `runWalkNow`/`runAuthorNow` keep their fire-and-poll contract — they enqueue instead of 409ing.

**Tech Stack:** Bun + TypeScript, libsql/Turso, Playwright (local default), puppeteer-core over CDP (Steel, `AUTOSIM_CDP_URL`), rrweb.

**Worktree/branch:** `/Users/vishalkumar/Downloads/qbug/klav-snap-wt-autosim-improvement-spec`, branch `feat/autosim-improvement-spec`. All paths below relative to `prototype/`.

## Global Constraints

- NEVER touch `master`, never bump versions/CHANGELOG (orchestrator owns those).
- `bun test` green in `prototype/` before each commit (pre-existing flakes: run failing file in isolation to confirm).
- Default behavior with NO new env vars set must be byte-identical to today except where a ticket says otherwise (queue replaces 409s deliberately).
- Concurrency default stays **1** while browsers are local; only `AUTOSIM_CDP_URL` + `KLAV_WALK_CONCURRENCY>1` raises it.
- Keep worker-rule commit style; reference the KLAVITYKLA ticket in each commit message.
- Any pre-existing bug you find but don't fix: note it in the final report (it gets a Plane ticket — do NOT fix inline).

---

### Task 1: Fix /autosims/walks dead page (KLAVITYKLA-52)

**Files:**
- Modify: `public/autosims-walks.html` (the `load()` fn, ~line 129-155)
- Test: `server.autosims-walks-data.test.ts` (create; mirror the hermetic subprocess pattern of `server.autosims-page.test.ts`)

**Bug:** `load()` fetches `/api/dashboard` and reads `d.recentWalks` (line ~153), but only `/api/trails/dashboard` returns `recentWalks` (server.ts:2836-2847, each walk annotated `hasReplay`). `state.walks` is always `[]` → permanent "No Walks yet".

**Interfaces:**
- Consumes: `GET /api/trails/dashboard?project=<id>` → `{ email, project:{id,role}, recentWalks:[{id, trail_id, status, started_at, finished_at, hasReplay, ...}], ... }`; `GET /api/dashboard?project=<id>` → `{ email, active, projects }` (switcher only).
- Produces: working All-Walks page; no API changes.

- [ ] **Step 1: Write failing static-guard test** — new `server.autosims-walks-data.test.ts`: assert `public/autosims-walks.html` source (a) contains `"/api/trails/dashboard"`, (b) does NOT read `recentWalks` off the `/api/dashboard` response (regex: the `d.recentWalks` read must follow the trails-dashboard fetch). Also route-test: authed `GET /autosims/walks` returns 200 serving the file (reuse subprocess pattern).
- [ ] **Step 2: Run it** — `bun test server.autosims-walks-data.test.ts` → FAIL (page still fetches only /api/dashboard).
- [ ] **Step 3: Fix `load()`** — fetch both endpoints in parallel: `/api/dashboard` (email, switcher `projects`/`active` as today) and `/api/trails/dashboard` (walks). `state.walks = t.recentWalks||[]`. Keep the existing 401→/login and error handling; if the trails fetch fails but dashboard succeeds, show "Error loading Walks." in `#lead` rather than dying.
- [ ] **Step 4: Tests pass** — `bun test server.autosims-walks-data.test.ts` → PASS. Also `bun test server.autosims-page.test.ts` still green.
- [ ] **Step 5: Commit** — `fix(autosims): all-walks page reads walks from /api/trails/dashboard (KLAVITYKLA-52)`.

---

### Task 2: DB-backed FIFO walk queue library (KLAVITYKLA-53 part 1)

**Files:**
- Create: `lib/trails-queue.ts`
- Modify: `lib/db.ts` (add `walk_queue` table in the same migration style as `trail_runs`; add `'queued'` as a legal `trail_runs.status`)
- Modify: `lib/trails.ts` `startWalk(projectId, trailId, trigger, opts?: { status?: "running"|"queued" })` — default `'running'` (unchanged); queue passes `'queued'`. Add `markWalkRunning(projectId, runId)` (sets status='running', started_at=now).
- Test: `lib/trails-queue.test.ts`

**Interfaces (Produces — Task 3 depends on these exact signatures):**
```ts
export type QueueJobKind = "walk" | "author"
export interface EnqueueResult { runId: string; position: number } // position: 1-based FIFO position at enqueue time
export function enqueueWalk(projectId: string, trailId: string, runId: string, exec: () => Promise<void>): Promise<EnqueueResult>
export function enqueueAuthor(projectId: string, sessionId: string, exec: () => Promise<void>): Promise<{ position: number }>
export function queueDepth(): number                    // jobs queued+running (for tests/UI)
export function walkConcurrency(): number               // resolved global cap
export function _drainForTest(): Promise<void>          // await until queue empty (tests only)
```
Semantics:
- In-process FIFO backed by a `walk_queue` DB table (`id, project_id, kind, ref_id, status queued|running|done|failed, enqueued_at, started_at, finished_at`) written for observability/recovery; the drain loop itself is in-process (single server worker today — same invariant as the old boolean, documented the same way).
- Global concurrency = `Number(process.env.KLAV_WALK_CONCURRENCY || 1)`; **per-project concurrency = 1 always** (fairness: one tenant can't occupy all slots).
- FIFO order by `enqueued_at` with per-project skip (if a project already has a running job, skip its queued jobs this pass — take the next eligible project's).
- `exec` errors are caught and mark the queue row `failed`; never propagate (crash isolation preserved).
- On module init (server boot), any `walk_queue` rows left `queued|running` from a dead process are marked `failed` and their `trail_runs` rows finalized red `{error:"process restarted"}` — this is the *seed* of the crash-reaper (full reaper = KLAVITYKLA-55, do not build heartbeats here).

- [ ] **Step 1: Failing tests** in `lib/trails-queue.test.ts` (stub execs, temp file DB like `lib/dedup-db.test.ts` pattern): (a) two jobs same project run strictly serially FIFO; (b) two jobs different projects with `KLAV_WALK_CONCURRENCY=2` run concurrently, `=1` serially; (c) exec throw → row `failed`, next job still runs; (d) enqueue returns position (1 for idle, 2 behind one); (e) boot-recovery marks stale rows failed.
- [ ] **Step 2: Run** → FAIL (module missing).
- [ ] **Step 3: Implement `lib/trails-queue.ts`** per semantics above (drain loop: `setTimeout(drain, 0)` after enqueue + after each completion; no polling interval).
- [ ] **Step 4: `bun test lib/trails-queue.test.ts` + `bun test lib/migrate.test.ts`** → PASS.
- [ ] **Step 5: Commit** — `feat(autosims): DB-backed FIFO walk queue with per-project fairness (KLAVITYKLA-53)`.

---

### Task 3: Wire queue into walk trigger, author, PDF; retire 409s (KLAVITYKLA-53 part 2, closes 59)

**Files:**
- Modify: `lib/trails-trigger.ts` (runWalkNow: `withWalkSlot` → `enqueueWalk`; run row created with `status:'queued'`, drain marks running via `markWalkRunning` then calls existing `realWalk`)
- Modify: `lib/trails-author.ts:239-284` (`runAuthorNow`: slot → `enqueueAuthor`; session status `'queued'` until drain starts it — add that status to the session-status union + `updateAuthorSession`)
- Modify: `lib/trails-share.ts:93-101` (`renderWalkPdf`: replace `withWalkSlot` with a dedicated module-scoped single-flight `pdfSlot` mutex — PDF no longer contends with walks → KLAVITYKLA-59)
- Modify: `server.ts:2689,2921,2942,2982` — `WalkBusyError` catch blocks: walk/author paths can no longer throw it (delete those catches, return `{runId, queued:true, position}` / session `{status:'queued', position}`); PDF path keeps a busy catch for its own mutex (map to 429 + `Retry-After: 5`, not 409).
- Modify: `lib/trails-browser.ts` — keep `WalkBusyError` export (PDF mutex reuses it), delete `withWalkSlot`/`isWalkInFlight` once no importers remain (grep first; update `lib/dogfood-autosim.ts` if it imports them).
- Tests: update `server.trails.test.ts` + `lib/trails-trigger.test.ts` (409 expectations → queued-run expectations); extend `lib/trails-author*.test.ts` for `'queued'` session status; new PDF-mutex test in `lib/trails-share.test.ts` (two concurrent renders: second waits or 429s — assert no `WalkBusyError` from a concurrent *walk*).

**Interfaces:**
- Consumes: Task 2's `enqueueWalk/enqueueAuthor/markWalkRunning`.
- Produces: `POST /api/trails/:id/walk` → `{ runId, queued: true, position }` (200, never 409); `POST /api/trails/author` unchanged shape + session status may be `'queued'`; walk pages treat `status:'queued'` like running (label "Queued (#N)" — `public/trails.html` + `public/autosims-walk.html` verdict maps: add `queued` → grey chip).

- [ ] **Step 1: Update/write failing tests** (list above — grep `WalkBusyError|409` in tests to find every expectation; `lib/trails-runner-deadline.test.ts` and `server.walk-report.route.test.ts` may also assert 409).
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** the four file changes.
- [ ] **Step 4: Full `bun test`** → green (isolate pre-existing flakes).
- [ ] **Step 5: Commit** — `feat(autosims): walk/author queueing replaces 409s; PDF renders off the walk slot (KLAVITYKLA-53, KLAVITYKLA-59)`.

---

### Task 4: Page-context heal ladder + BrowserPage extension (KLAVITYKLA-54 part 1)

**Files:**
- Modify: `lib/trails-browser-page.ts` — extend `BrowserPage` with the runner's needs; add shared page-context body `healCandidatesBody(fp)`.
- Test: `lib/trails-browser-page.heal.test.ts` (drive BOTH impls against a local fixture page: Playwright direct + Puppeteer over `--remote-debugging-port` CDP of a locally launched chromium, guarded `test.skipIf(!process.env.KLAV_E2E)` matching existing e2e test conventions — check how `lib/trails-author.e2e.test.ts` gates).

**Interfaces (Produces — Task 5 consumes):**
```ts
export interface HealCandidate { selector: string; signal: "role+name"|"text"|"testid"|"domPath"; roleConsistent: boolean }
export interface BrowserPage {
  // ...existing 12 methods unchanged...
  healResolve(fp: Fingerprint): Promise<HealCandidate | null>  // page-context Tier-1 ladder, first unique match in order role+name→text→testid→domPath; null if none
  waitNetworkIdle(timeoutMs: number): Promise<void>            // Playwright: waitForLoadState("networkidle"); Puppeteer: waitForNetworkIdle
  screenshotPngB64(timeoutMs: number): Promise<string>         // vision tier needs png (runner line ~717)
  content(): Promise<string>                                   // page.content() — used by snapshot/evidence paths (grep runner for page.content())
  setDefaultTimeouts(ms: number): void                          // Playwright: setDefaultTimeout+setDefaultNavigationTimeout; Puppeteer: setDefaultTimeout+setDefaultNavigationTimeout
}
```
`healCandidatesBody` runs IN THE PAGE: computes candidates exactly mirroring `resolveTarget`'s ladder (trails-runner.ts:230-286) — role+accessible-name (approximate accname: aria-label > placeholder > alt > trimmed textContent, matching `fingerprintBody`'s accName so heal matches what crystallize fingerprinted), exact visible text, `[data-testid]`, domPath — each candidate must match EXACTLY ONE element and (for text/testid/domPath) be role-consistent with `fp.role`. Returns a concrete unique CSS selector for the winner (prefer `#id`/`[data-testid]`; else build an nth-of-type path like `fingerprintBody` does). Unit-test the body's logic against a rich fixture HTML covering: unique role+name hit, ambiguous role+name (2 buttons same name → falls to next signal), text hit on wrong role rejected, testid hit, domPath fallback, total miss → null.

- [ ] **Step 1: Failing tests** (fixture HTML file under `test-fixtures/`, both impls parameterized).
- [ ] **Step 2: Run** → FAIL.
- [ ] **Step 3: Implement** interface + both impls (+ `healResolve` calling the shared body via `evaluate`).
- [ ] **Step 4: `bun test lib/trails-browser-page.heal.test.ts` + existing `lib/trails-browser-page.test.ts`** → PASS.
- [ ] **Step 5: Commit** — `feat(autosims): page-context heal ladder + BrowserPage extensions for runner port (KLAVITYKLA-54)`.

---

### Task 5: Port walkTrail onto acquireBrowser (KLAVITYKLA-54 part 2)

**Files:**
- Modify: `lib/trails-runner.ts` — `chromium.launch` (line 328) → `acquireBrowser({ launchArgs })`; `resolveTarget` gains an adapter path: when the handle kind isn't `"local"`, use `page.healResolve(fp)` for Tier 1 and `page.count()` for Tier 0 (local Playwright path stays byte-identical — Locator-based, zero behavior change with no env set); all direct `page.*` Playwright calls in the walk path get bounded adapter equivalents (`goto/url/waitMs/waitNetworkIdle/screenshotJpeg/screenshotPngB64/setDefaultTimeouts/click/fill/selectOption/assertVisible`).
- Modify: `lib/trails-replay.ts` — `setupReplayCapture` gets a Puppeteer twin: `evaluateOnNewDocument` (≙ addInitScript) + `exposeFunction` (≙ exposeBinding). When remote AND replay requested but adaptation fails → warn + walk without replay (existing best-effort contract, trails-runner.ts:353-360).
- Test: extend `lib/trails-runner.e2e.test.ts` conventions: a CDP-mode walk e2e (`KLAV_E2E`-gated): launch local chromium with `--remote-debugging-port=0`, set `AUTOSIM_CDP_URL=ws://…` for the child, walk a 3-step fixture Trail, assert verdict green + run_steps written + Tier-0 cache hits. A drift fixture asserts Tier-1 heal works through the adapter.
- Modify: `lib/trails-trigger.ts` `realWalk` — pass `launchArgs: CHROMIUM_PROD_ARGS` only when local (adapter ignores launchArgs for remote — it connects, doesn't launch).

**Interfaces:**
- Consumes: Task 4's `BrowserPage`/`healResolve`; Task 2's queue (concurrency raise is just env: `KLAV_WALK_CONCURRENCY=3` + `AUTOSIM_CDP_URL` — no code).
- Produces: every Walk honors `AUTOSIM_CDP_URL`; local default unchanged.

- [ ] **Step 1: Failing e2e** (CDP walk test; run with `KLAV_E2E=1 bun test lib/trails-runner.e2e.test.ts` → FAIL: runner ignores AUTOSIM_CDP_URL).
- [ ] **Step 2: Port runner** per above (smallest diff: keep the Playwright fast-path; adapter path behind `handle.kind !== "local"`).
- [ ] **Step 3: Adapt replay capture**, warn-and-degrade on remote failure.
- [ ] **Step 4: Full `bun test` + `KLAV_E2E=1 bun test lib/trails-runner.e2e.test.ts lib/trails-runner-replay.e2e.test.ts`** → green.
- [ ] **Step 5: Commit** — `feat(autosims): walks run on remote CDP browsers via acquireBrowser (KLAVITYKLA-54)`.

---

## Definition of done (batch)

1. All 5 task commits on `feat/autosim-improvement-spec`; full `bun test` green; rebase on `origin/master`.
2. Reviews run at batch end (pipelined concurrent reviewers), findings fixed or ticketed.
3. Plane: KLAVITYKLA-52, 53, 54, 59 → Done with a closing comment naming the commits; any NEW bugs found during work → new Plane tickets (per user 2026-07-07).
