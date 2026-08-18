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
commit: a4d1a08a
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
