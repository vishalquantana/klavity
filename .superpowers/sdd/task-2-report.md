status: done
commit: 78589be6
test summary: `bun test server.snap-plan.test.ts` — 9 pass / 0 fail. Covered POST /api/projects/:pid/plan (admin sets override="snap" -> 200, project.planOverride echoed; non-admin -> 403; clearing override -> 200); GET /api/projects/:pid (planOverride + entitlement.snapOnly/canSims/canAutoSim/canAiSettings); POST /api/personas?project=:pid (Sims create) -> 402 snap_locked when locked, non-402 before lock and after clearing; POST /api/trails/author?project=:pid (AutoSim create) -> 402 snap_locked; POST /api/projects/:pid/pause (review-mode/AI-settings write) -> 402 snap_locked; GET /api/projects/:pid/tickets stays non-402 while locked (Snap path not gated). Also gated POST /api/trails/:id/walk (AutoSim run), monitored-urls writes, and trails-autofile writes with the same snapLocked() helper, and exposed planOverride+entitlement on GET /api/dashboard's active project. Full repo `bun test` run: 3489 pass / 15 fail / 1 error, all pre-existing and unrelated (verified identical failures with `git stash` applied — db-boot-speed ALTER idempotency, quota.test.ts grandfathering, simulated network-down connector/autosim-auth tests).
blocking concerns: none.

---

## Follow-up: closed gating gaps found in review (2026-08-19)

Review found several Sims/AutoSim surfaces still ungated, letting a Snap-locked project keep
running Sims/AutoSim. Closed with the same `snapLocked(project)` 402 pattern:

1. `POST /api/sim/review` (server.ts, extension live auto-review hot path) — gated right after
   `projectId` is resolved, via `projectById(projectId)` + `snapLocked`, returning `wjson(reviewLock, 402)`.
2. `GET /api/personas` (Sims list) — gated via `projectById(wid)` at the top of the GET branch.
3. `POST /api/trails/:id/approve` — resolves the trail then `projectById(trail.projectId)`, gates
   before the draft→active status check.
4. `PATCH /api/trails/:id` — same trail→project resolution; gates the entire PATCH (rename, status,
   schedule, viewport) once the trail's project is Snap-locked, since status/schedule changes bypass
   the /author and /walk gates.
5. `POST /api/projects/:id/sim-review-schedules` (create) — gated via `projectById(srsProj.id)`
   before creating the recurring schedule.

Extended `prototype/server.snap-plan.test.ts` with 5 new tests (all locked-state, 402 `snap_locked`):
Sims list, sim/review, trail approve, trail PATCH (schedule), sim-review-schedules create. Added a
pre-seeded draft trail row (`trails` table insert) since `/api/trails/author` is itself gated and
requires a live LLM-driven authoring run, unsuitable for a unit test fixture.

status: done
commit: 158671fd
test summary: `bun test server.snap-plan.test.ts` — 14 pass / 0 fail. Newly gated endpoints:
`POST /api/sim/review`, `GET /api/personas`, `POST /api/trails/:id/approve`,
`PATCH /api/trails/:id`, `POST /api/projects/:id/sim-review-schedules` — each returns 402 with
`body.code==="snap_locked"` on a Snap-locked project. Combined with task-2's original gates
(`POST /api/personas` create, `POST /api/trails/author`, `POST /api/trails/:id/walk`,
`POST /api/projects/:id/pause`, monitored-urls writes, trails-autofile writes, admin
`POST /api/projects/:id/plan`), the full endpoint list gated is now: sim/review, personas
list+create, trails/author, trails/:id/walk, trails/:id/approve, trails/:id PATCH,
sim-review-schedules create, project pause (review-mode), monitored-urls add/remove/rename/toggle,
trails-autofile toggle. Full repo `bun test`: 3494 pass / 15 fail / 1 error — same pre-existing
unrelated failures as before (verified via `git stash`), 5 more passing tests than the prior run.
blocking concerns: none.

---

## Follow-up 2: closed remaining bypasses, incl. autonomous engines (2026-08-19)

A whole-feature review found more surfaces still able to run Sims/AutoSim on a Snap-locked
project — most importantly the two autonomous engines that run in prod unattended, which is the
real billing-spend risk (a locked project would otherwise keep costing money even with every HTTP
route gated).

### HTTP endpoints gated (same `snapLocked(project)` 402 pattern, `proj` from a fresh `projectById`)

- `POST /api/sim/preview` (server.ts) — gated the authenticated `projectId` branch, right after
  `resolveProject` succeeds and before the SSRF preflight/screenshot are ever attempted. The
  anonymous/no-project demo branch (`pvProj` null) is untouched.
- `POST /api/transcripts`, `POST /api/transcripts/preview`, `POST /api/transcripts/apply` — the
  full transcript→Sim create/enrich/reconcile family; gated right after `projectId` is resolved,
  before the rate-limit checks and any LLM call.
- `POST /api/projects/:id/sim-matches/:mid/confirm` — gated at the top of the confirm branch
  (`proj` already in scope from the shared `/api/projects/:id` subroute block).
- `PATCH /api/projects/:id/sim-review-schedules/:id` — gated only the **re-enable** case
  (`body.enabled === true`); pausing a schedule stays allowed even when locked.
- `POST /api/sim-review-schedules/tick` — intentionally left ungated at the HTTP layer; the fix is
  in the engine (`runDueSchedules`/`runOneSchedule`, below), so /tick simply never fires a locked
  project's schedule regardless of who calls it.

### Execution engines (the critical fix — these run autonomously in prod)

- `lib/trails-trigger.ts` `runWalkNow(projectId, trailId, ...)` — added a `projectById` +
  `projectEntitlement(...).snapOnly` guard right after the existing "trail is paused" check; throws
  `Error("trail is snap-locked")` before the walk slot or `startWalk` are ever touched. This is the
  single choke point both the manual `/api/trails/:id/walk` route and the cron scheduler call, so
  it covers both callers.
- `lib/trails-scheduler.ts` `tickScheduler()` — added an explicit skip (`projectById` +
  `projectEntitlement`) in the per-trail loop, BEFORE `touchScheduledLastRunAt`/`tryLaunchScheduled`,
  so a permanently-locked project's Trail doesn't churn a launch-attempt + skipped-run DB write every
  minute forever (defense in depth on top of the `runWalkNow` guard).
- `lib/sim-review-schedule.ts` `runOneSchedule()` — added the same guard right before loading the
  project's Sims; a locked schedule is returned as `{ skipped: "snap-locked" }` and
  `touchSimReviewScheduleRan` is still called (advances `next_run_at`) so it doesn't get re-picked-up
  every tick — mirrors the existing "no Sims" skip pattern exactly. No screenshot, no LLM call, no
  `sim_runs` row.

### Tests added

- `prototype/server.snap-plan.test.ts`: 3 new 402 assertions (`/api/sim/preview` with a real
  `projectId`, `/api/transcripts`, `/api/projects/:id/sim-matches/:mid/confirm`); strengthened the
  stays-open assertions from `.not.toBe(402)` to exact status codes (`toBe(201)` for Sim creation,
  `toBe(200)` for the tickets read) since a loose `.not.toBe(402)` could hide an unrelated 4xx/5xx.
  17 tests total in the file.
- `prototype/lib/sim-review-schedule.test.ts`: new test proving `runDueSchedules` skips a
  Snap-locked project's due schedule — `skipped==="snap-locked"`, `simRunId` null, the mock
  `takeScreenshot` never called, and zero rows land in `sim_runs` for that project.
- `prototype/lib/trails-scheduler.test.ts`: new test proving `tickScheduler` never stamps
  `scheduledLastRunAt` nor creates any walk row for a Snap-locked project's active scheduled Trail.
- `prototype/lib/trails-trigger.test.ts`: new test proving `runWalkNow` rejects
  (`toThrow("snap-locked")`) for a Snap-locked project and creates zero walk rows — this is the
  shared choke point for both the manual route and the scheduler.

status: done
commit: 744dde3
test summary: `bun test server.snap-plan.test.ts lib/entitlement.test.ts lib/sim-review-schedule.test.ts lib/trails-scheduler.test.ts lib/trails-trigger.test.ts server.workspace-rename.test.ts` — 85 pass / 0 fail. Newly-gated surfaces this round: `POST /api/sim/preview` (authed projectId branch), `POST /api/transcripts`, `POST /api/transcripts/preview`, `POST /api/transcripts/apply`, `POST /api/projects/:id/sim-matches/:mid/confirm`, `PATCH /api/projects/:id/sim-review-schedules/:id` (re-enable only), plus engine-level guards in `runWalkNow` (lib/trails-trigger.ts), `tickScheduler` (lib/trails-scheduler.ts), and `runOneSchedule`/`runDueSchedules` (lib/sim-review-schedule.ts). Full repo `bun test` (356 files, ~3600+ tests): consistently 15 pre-existing failures both with and without my changes (`git stash` diff-tested) — the specific failing test NAMES vary between runs due to pre-existing cross-file env-var leakage in the full-suite run (several lib test files mutate `process.env.TURSO_DATABASE_URL` directly and bun test shares one process across files), not from anything touched here; the individually-run gating test files above are 100% deterministic and green.
blocking concerns: none. Note for future work: the full-suite flakiness from shared `process.env` mutations across test files is a pre-existing repo issue independent of this task and may be worth a follow-up ticket (per-file env isolation or a `TURSO_DATABASE_URL` reset in `afterAll`).
