# Design spec — Onboarding → submit-transcript → Sim self-test (Klavity dogfoods Klavity)

**Date:** 2026-07-04 · **Branch:** `feat/onboarding-transcript-test`
**Deliverable:** `prototype/lib/dogfood-onboarding-transcript.ts` (+ fixture)

## One line
A Klavity **AutoSim Trail** that walks the *real* onboarding → submit-a-call-transcript → get-a-Sim
journey against a **locally spawned server** using the **real AutoSim runner** and a **real LLM**,
asserting the *journey* works (transcript accepted → a Sim appears). Klavity testing Klavity.

## Locked decisions (from brainstorming — see RESUME doc)
1. **Scope:** testability seams (B) + coverage (A), seams-first, minimal / dogfood-honest.
2. **Journey:** onboarding → submit a new (call) transcript → get a Sim.
3. **Target:** local spawned server, REAL LLM. Assert the JOURNEY, not exact traits. No prod side-effects.
4. **Fixture:** canned, committed transcript (stable) — `test-fixtures/onboarding-call-transcript.txt`.
5. Prod-dogfood + scheduling is Phase 2 (follow-on), not this deliverable.

## The journey — re-verified against CURRENT master (v0.39.305)
The RESUME doc's earlier trace assumed the `#add-transcript` handoff opened the Sim-Studio paste
form (`ssTxSave` → `POST /api/transcripts`). **The code has since evolved.** The current handoff is:

1. `GET /onboarding` → `site/onboarding.html`. Step 0 now has a **goal fork**:
   `#goalSnap` / `#goalSims` (`onboarding.html:251,257`). `chooseGoal('sims')` → `go(1)`; the Sims goal
   is the full 3-step path that ends at the Studio (Snap is a 2-step widget-only path).
2. **Step 1** (`data-s=1`): `#email`, `#projectName` (required), `#domain` (optional) →
   `#createBtn` `requestCode()` → `POST /api/auth/request`. Reveals the code sub-panel:
   `#code` → `#verifyBtn` `verifyCode()` → `POST /api/auth/verify` → sets session cookie →
   `applyProjectName()` (resolves + renames the default project) → `go(2)`.
3. **Step 2** (`data-s=2`, "add to your site"): for the Sims goal the CTA `#s2continue` → `go(3)`.
4. **Step 3** (`data-s=3`, pick starting Sims): `#intentTranscript` tile is **selected by default**
   (`pickIntent('transcript')`). "Open the Studio →" (`openStudio()`, `onboarding.html:794`) →
   `window.location.href = '/app?project=<id>&goal=sims#add-transcript'`.
5. `GET /app` (authed) → `prototype/public/index.html`. The `onboardingHandoff()` IIFE
   (`public/index.html:2064`) sees `location.hash === '#add-transcript'` → `switchL1Tab('import')`
   and focuses `#transcript`.
6. Paste transcript into `#transcript` → click `#extractBtn` ("Extract Sims") →
   `POST /api/extract` (`server.ts:3856`, **no auth required**, one real LLM call via
   `extractPersonas` → `chat()`) → returns `{ personas, usage }`. Client sets `sims = personas`,
   `renderDock()`, `switchL1Tab('sims')`.

So the honest, real onboarding path files the transcript through **`/api/extract`** (the Studio
import extractor), **not** `/api/transcripts`. This spec/tool targets the path a real founder walks.

### Journey assertion (not trait content)
After a successful extract the client switches to the "Your Sims" tab and renders sim cards:
- `#pane-sims.on` becomes the active (visible) pane — only reached on extract success.
- `#l1SimBadge` flips from `display:none` to visible (set by `updateFlow()` when `sims.length > 0`).
- `#dock .dock-sim` cards render (one per Sim).

We assert on `#pane-sims.on` (unambiguous, visible-only-on-success) and `#l1SimBadge` (proves
`sims.length > 0`). Both are single-match selectors — no `.dock-sim` ambiguity, no dependence on
the LLM-generated Sim name/traits. That is the "journey works" checkpoint.

## Reused seams (build nothing new)
- **Test-OTP bypass** (shipped v0.39.210): `KLAV_TEST_OTP=1` + `KLAV_TEST_OTP_EMAILS=<email>` →
  fixed OTP `666666` accepted by `/api/auth/verify` (`server.ts:1480`). Log in as
  `vishal@quantana.com.au` with no live OTP.
- **Email allowlist** (`lib/auth.ts:16` `emailAllowed`): allow-all when no allowlist env is set →
  `/api/auth/request` returns `{ ok:true }` even if SMTP send fails (caught, `emailed:false`).
- **AutoSim runner** (`lib/trails-runner.ts`): `walkTrail(project, trailId, {fixtureUrl, ...})` drives
  a real Playwright chromium. Supports `navigate|click|type|select|assert|wait`; `type` fills via
  `actionValue` (`:571`). Self-heal (Tier 1) exercises real product resilience.
- **Crystallize** (`lib/trails-crystallize.ts`): `crystallize(project, trajectory)` stores steps +
  seeds `locator_cache` from `target.resolvedSelector` → Tier 0 deterministic replay.
- **Reference shape:** `lib/dogfood-autosim.ts` (prod, assert-only). Ours differs: **spawn a LOCAL
  server** + `type` steps + `KLAV_TEST_OTP` + a real extract call.

## Architecture of the tool
Two independent SQLite DBs (no cross-process lock contention):
- **Server DB** (ephemeral `file:` in tmp) — the spawned `server.ts` gets its own fresh DB; it
  auto-runs `applySchema`+`migrateV2` on boot (`initDb`, `db.ts:31`). Holds auth/projects.
- **Dogfood DB** (ephemeral `file:` in tmp) — this process imports `./db` for trail/walk
  bookkeeping (crystallize, run_steps, findings). Same pattern as `dogfood-autosim.ts`.

Steps:
1. Resolve `OPENROUTER_API_KEY` from env (Bun auto-loads `prototype/.env`); **fail loud** if missing
   (real-LLM run is a locked requirement).
2. Spawn `bun server.ts` with env: fresh `TURSO_DATABASE_URL=file:<serverDb>`, `PORT=<free>`,
   `KLAV_TEST_OTP=1`, `KLAV_TEST_OTP_EMAILS=<email>`, `OPENROUTER_API_KEY`, `KLAV_BASE_URL=http://localhost:<port>`.
   Poll `GET /` until it answers (boot ≈ schema init).
3. Point this process's `./db` at a separate `file:<dogfoodDb>`; `crystallize` the trail.
4. `walkTrail(project, trailId, { fixtureUrl: http://localhost:<port>/onboarding, replay:false,
   deadlineMs })` — a generous deadline because step 6 is a real LLM call (10–30s).
5. Inspect `result.verdict` + per-step verdicts; print a summary; kill the server; clean temp DBs.
   Exit non-zero on a non-green verdict so it can gate CI later.

### Trail steps (crystallized trajectory)
`navigate /onboarding` (implicit via fixtureUrl) →
`click #goalSims` → `wait` → `type #email` → `type #projectName` → `click #createBtn` →
`wait` (auth round-trip + reveal code panel) → `type #code = 666666` → `click #verifyBtn` →
`wait` (verify + applyProjectName + go(2)) → `click #s2continue` → `wait` →
`click #intentTranscript` → `click [openStudio button, by text "Open the Studio"]` →
`wait` (full nav to /app + module boot + handoff) → `type #transcript = <fixture>` →
`click #extractBtn` → `wait` (real LLM 10–30s) →
`assert #pane-sims.on visible` → `assert #l1SimBadge visible`.

Selectors are stable IDs already in the markup — **no new product seams needed** unless a walk
proves it can't resolve one (dogfood-honest). Known prior gotcha: `.hero-cta` ambiguity on home —
not on our path. The "Open the Studio →" button has no id → resolve by role=button + text.

## Non-goals / out of scope
- Asserting specific extracted traits/persona content (non-deterministic real LLM).
- Prod side-effects, scheduling, findings→Slack/Plane routing (Phase 2).
- Adding this to `bun test` (it needs a real LLM + browser + spawned server) — it is a standalone
  `bun run` script, matching `dogfood-autosim.ts`.

## Risks & mitigations
- **Flaky LLM latency** → generous `deadlineMs`; assert journey only.
- **Selector drift** → AutoSim self-heal (Tier 1) is expected to absorb minor drift; the run reports
  `healedCount`. If a step goes RED on drift, that is a real finding to fix (honest dogfood).
- **No key in CI** → fail-loud message; script is opt-in, not part of `bun test`.
