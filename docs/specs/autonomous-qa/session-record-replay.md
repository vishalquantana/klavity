# Record real user sessions → auto-generated trails + deterministic replay

**Capability owner:** AutoSim / Trails
**Field checklist items:** 4, 10
**Status:** Spec (buildable)
**Author:** ramesh@quantana.in

---

## Problem & user value

Today an AutoSim Trail only exists if a human writes an objective and the LLM
author (`authorTrail`) drives the page, or a human hand-edits steps. That is
slow, biased toward flows we *think* matter, and misses the long tail of real
usage. Meanwhile our SDK/widget/extension **already record real user browser
sessions** as rrweb event streams (`packages/sdk/src/session-replay.ts`) — but
we throw all of them away unless a user files a bug, and even then we only keep
a rolling ~60 s tail and only use it as a human-watchable replay video, never as
an executable test.

Two gaps follow, both directly on the north star ("catch nearly all bugs,
autonomously"):

1. **Coverage is authored, not observed.** The flows our users actually run
   (the ones that, if broken, generate the "you broke it again" complaint from
   `klavity_jtbd_north_star`) are invisible to AutoSim unless someone thinks to
   author them.
2. **Replay is selector-walk + LLM-heal, which is non-deterministic and
   assertion-shaped.** `walkTrail` resolves each step's element live and can
   escalate to a vision-tier LLM heal. That's powerful for self-healing but it
   is (a) slow/expensive per run, (b) inherently flake-prone at the margin, and
   (c) only checks the specific `checkpoint`s an author wrote — it cannot catch
   an *unasserted* regression three steps away.

**User value:** a customer drops in our widget, keeps using their product
normally, and within a day AutoSim has (a) auto-proposed replayable Trails from
their real traffic and (b) a deterministic, assertion-free replay that flags
*any* visual/behavioral divergence between two builds — the "your users write
your tests" model, grounded in flows that provably happen.

---

## Goals / Non-goals

### Goals
- **G1 — Persist real sessions (not just bug-time tails).** Continuous, sampled,
  privacy-masked rrweb capture streamed to the backend and stored, reusing the
  existing gzip+S3 offload scheme.
- **G2 — Auto-derive draft Trails from a recorded session.** Convert an rrweb
  event stream into a `Trajectory` and `crystallize` it into a `draft` Trail
  (steps + fingerprints + locator cache) with zero human authoring.
- **G3 — Deterministic replay engine (item 10).** A NEW replay mode, *distinct
  from `walkTrail`'s selector-walk*: dispatch recorded events on a deterministic
  scheduler against the live app, mock network from recorded responses, and take
  a DOM+pixel snapshot after each event.
- **G4 — Base-vs-head diffing with no author-written assertions.** Replay the
  same session against two builds and diff the per-event snapshots; surface
  divergences as Findings without requiring a `checkpoint`.
- **G5 — Keep everything project-scoped, consent-gated, and masked by default**,
  matching the existing capture privacy posture.

### Non-goals
- Not replacing `walkTrail` — deterministic replay is additive; authored Trails
  with checkpoints still run the selector-walk + heal path.
- Not building a general time-travel debugger (Replay.io scope). We snapshot at
  event boundaries, not full VM state.
- Not recording native mobile apps — web only (our capture surface).
- No new video/screen-recording pipeline; this rides the rrweb DOM stream, not
  `packages/sdk/src/recorder.ts` (getDisplayMedia MediaRecorder).

---

## Competitor benchmark (concrete mechanics)

**Meticulous** ([how-it-works](https://www.meticulous.ai/how-it-works),
[let-users-write-tests](https://www.meticulous.ai/blog/let-users-write-tests-for-you)):
- Instruments the app to capture DOM mutations, JS events, and network traffic
  (functionally what our rrweb + `installCapture` already collect).
- Replays with a **deterministic scheduling engine built from Chromium up** — the
  recorded events are dispatched in the exact record-time sequence; they claim
  zero flakes because timing/order is controlled, not wall-clock.
- **Backend responses are mocked** from the recorded responses → side-effect-free,
  no test accounts, no data drift.
- **No assertions.** On a PR it replays each session **twice — once on base,
  once on head** — captures a **visual snapshot after each dispatched event**,
  and diffs base-vs-head. Base screenshots are taken *at replay time*, not record
  time, so styling refactors on both sides cancel out. This catches visual *and*
  behavioral/logic changes (a dead button, a wrong computed value).

**Checksum.ai** ([overview](https://checksum.ai/docs/overview),
[runtime](https://github.com/checksum-ai/checksum-ai-runtime)):
- 3-line JS SDK records sessions; **inner text is hashed** and sensitive elements
  are maskable (privacy model close to ours: `maskAllInputs`/`maskTextFn`).
- Auto-detects user flows from recorded sessions, then a **multi-phase LLM
  pipeline (plan → implement → review → verify)** emits runnable **Playwright/
  Cypress code**, delivered as a PR.
- Records **network responses as HAR** and replays tests in that same context.

**What we take:** Meticulous's determinism + base-vs-head no-assertion diffing
(G3/G4) and network mocking; Checksum's "session → flow → generated test"
derivation (G2) and HAR-based network context. **Where we already lead:** we
have the capture stack, a durable Trail data model with fingerprints + locator
cache, a self-healing selector walk, and a `kref` semantic DOM digest — so we can
offer *both* a deterministic diff replay AND a healing semantic replay of the
same derived flow, which neither competitor does.

---

## Current state in our codebase

**Client capture (exists, reuse):**
- `packages/sdk/src/session-replay.ts:95` `createSessionReplay()` — wires rrweb;
  inline mode (npm/extension) or lazy `injectRecorderScript(backendUrl)` (widget).
- `packages/sdk/src/replay-recorder.ts:133` `startReplayRecording()` +
  `ReplayRingBuffer` — rolling `windowMs` (default 60 s) / `maxEvents` (2000)
  buffer, periodic FullSnapshot re-checkout (`checkoutEveryNms`), masking
  (`maskAllInputs`, `maskTextFn` → `*`), `blockClass/ignoreClass:'klavity-no-record'`,
  `inlineStylesheet:true`. **Currently snapshot-on-submit only; no streaming.**
- `packages/core/src/capture.ts:94` `installCapture()` — wraps
  console/`fetch`/XHR into bounded buffers (this is our network-capture seam for
  HAR/mocking).
- Widget wiring: `packages/sdk/src/widget.ts:666` `mount()` (creates the
  `SessionReplay`, `data-replay="off"` kill-switch). Extension parity via
  `packages/extension/src/content.ts` + `evidence-store.ts`.

**Ingest & storage (exists, extend):**
- `packages/core/src/integrations/backend.ts:86` `buildFeedbackFormData()` and
  `packages/sdk/src/widget-lib.ts:211` `buildFeedbackForm()` attach
  `replay_events` on bug submit.
- `prototype/lib/feedback-replay.ts` — `capReplayEvents()` (keeps [Meta,Full]+tail
  under a byte cap), `saveFeedbackReplay()` (gzip → `feedback_replays.events_gz`,
  S3 offload via `s3_key`), `getFeedbackReplayGz()`/`getFeedbackReplay()`,
  `pruneOldFeedbackReplays()`.
- Schema: `prototype/lib/db.ts:738` `feedback_replays` table + index (L748);
  `s3_key` ALTER at L1198. This is the template for a new `session_recordings`
  table.
- Route (exists): `POST /api/feedback` ingests `replay_events`; `GET
  …/feedback/:id/replay` serves them back (see `prototype/server.feedback-replay.test.ts`).

**Trail model & runtime (exists, reuse):**
- Types: `prototype/lib/trails-types.ts` — `StepAction` (L9:
  navigate|click|type|select|assert|wait|waitForSelector|upload|hover|keyPress|
  clearField|callModule|pauseForSecret), `Fingerprint` (L28: role/accessibleName/
  text/testId/domPath/bbox/inputType), `Checkpoint` (L98), `TrailStep` (L107).
- `prototype/lib/trails-crystallize.ts:93` `crystallize(projectId, Trajectory)` —
  turns a `Trajectory` (`TrajectoryStep{action,actionValue,target:Fingerprint&{resolvedSelector},checkpoint,url,domHash}`)
  into a Trail + steps + seeded `locator_cache`. **This is the exact plug-in
  point for G2.** Existing callers that build a Trajectory then crystallize:
  `prototype/lib/dogfood-autosim.ts:22`, `prototype/lib/trails-demo-seed.ts:92`.
- `prototype/lib/trails-runner.ts:699` `walkTrail()` — the selector-walk +
  Tier-2 vision heal replay (the engine we are *complementing*, not changing).
- `prototype/lib/trails-snapshot.ts:70` `captureKrefSnapshot()` — semantic
  DOM digest (roles + accessible names + `data-kref` refs); reuse for behavioral
  diffing and for deriving fingerprints.
- Authoring: `prototype/lib/trails-author.ts:273` `authorTrail()` (LLM drive),
  `runAuthorNow` orchestration; MCP/REST run surface per memory
  `klavity_public_api_mcp` (`/api/v1/runs`, `/api/v1/authored-runs`).

**Bottom line:** capture, gzip+S3 replay storage, and Trajectory→Trail
crystallization all exist. What's missing is (a) *continuous* session persistence
independent of a bug submit, (b) a session→Trajectory *deriver*, and (c) a
*deterministic diff replay* engine alongside `walkTrail`.

---

## Proposed architecture

Three layers, each building on named existing modules.

### Layer 1 — Continuous session capture (client) + ingest/storage (server)

**Client (`packages/sdk`):** add a streaming mode to `createSessionReplay`.
- New option `stream?: { sampleRate: number; flushMs?: number; maxSessionMs?: number }`.
  When set (and `enabled`, consent present), instead of only exposing
  `snapshot()` for on-submit attach, `startReplayRecording` also flushes buffered
  events in chunks to the backend. Reuse the *same* rrweb config (masking,
  `blockClass`, `checkoutEveryNms`) — privacy posture is unchanged.
- Sampling decision is per page-load, deterministic on a session id, so we don't
  record everyone. Default `sampleRate` small (e.g. 0.05), project-configurable
  via the existing project-config fetch in `widget.ts:mount`.
- Network context: extend `installCapture` buffers (`packages/core/src/capture.ts`)
  to also retain response *bodies* for same-origin JSON/text under a size cap
  (new opt-in `captureBodies`), serialized to a HAR-lite alongside the events.
  Off by default; required only for deterministic network mocking (Layer 2).
- New transport `packages/sdk/src/session-uploader.ts`: chunked
  `POST /api/projects/:pid/sessions/:sid/chunk` (append) + `…/finalize`.
  `navigator.sendBeacon` on `pagehide`. Extension parity via `content.ts`.

**Server (`prototype`):**
- New module `prototype/lib/session-recordings.ts`, mirroring `feedback-replay.ts`:
  `appendSessionChunk()`, `finalizeSession()` (gzip via the same encode path,
  S3 offload via `s3_key`, `capReplayEvents`-style cap), `getSessionReplayGz()`,
  `listSessions()`, `pruneOldSessions()` (retention parallel to
  `pruneOldFeedbackReplays`).
- New table `session_recordings` (see Data-model). Schema added in
  `prototype/lib/db.ts` `applySchema` next to `feedback_replays` (L738),
  including the `s3_key` column from the start.
- Routes in `server.ts`: `POST /api/projects/:pid/sessions/:sid/chunk`,
  `POST …/finalize`, `GET /api/projects/:pid/sessions`, `GET …/sessions/:sid/replay`
  (serves gz for the rrweb-player, same as the feedback replay route).
- All routes project-scoped and consent-gated; anonymous sessions stay untrusted
  (aligns with `klavity_anon_intake_invariant`).

### Layer 2 — Session → Trajectory deriver → `crystallize`

New module `prototype/lib/session-to-trajectory.ts`:
- Input: a decoded rrweb event array (from `getSessionReplayGz`) + optional HAR.
- **Reconstruct the DOM** from the rrweb FullSnapshot, then walk the incremental
  events (rrweb `IncrementalSource`): `MouseInteraction` type=Click → `click`;
  `Input` on a text field → `type` (masked value → placeholder, real value only
  if the project opted out of masking for that field); `Input` on select →
  `select`; navigation (Meta/URL change) → `navigate`; focus/blur+Enter →
  `keyPress`. This is a deterministic mapping table, not an LLM.
- For each actioned node, resolve a `Fingerprint` from the reconstructed DOM node
  the same way `captureKrefSnapshot` computes role/accessibleName/testId/domPath
  (`prototype/lib/trails-snapshot.ts`) — reuse that logic so derived fingerprints
  match what the walker resolves at replay. Compute `resolvedSelector` (prefer
  `[data-testid]`, then a stable CSS path) and `domHash` (hash of the semantic
  digest) so `crystallize` seeds the locator cache correctly.
- **Flow segmentation:** split one raw session into candidate Trails at natural
  boundaries (full page navigations, long idle gaps). Dedupe near-identical
  flows across sessions by a normalized step signature so we propose *one* Trail
  per distinct flow, not one per visitor.
- Optional LLM pass (reuse `trails-author-model.ts`) only to *name* the Trail and
  optionally suggest `checkpoint`s on terminal steps — the steps themselves are
  derived deterministically. Kept behind a flag; the base path is LLM-free.
- Emit a `Trajectory` (`prototype/lib/trails-crystallize.ts`), then call
  `crystallize(projectId, traj)` → a `draft` Trail. Set a new
  `trails.source_recording_id` so the UI can trace a Trail back to its session.
- Verification: immediately run `walkTrail(projectId, trailId, {suppressFindings:true})`
  (draft-gate already suppresses Findings) once to confirm the derived steps are
  replayable before proposing the Trail to the user.

### Layer 3 — Deterministic base-vs-head replay engine (distinct from selector-walk)

New module `prototype/lib/trails-det-replay.ts` (sibling to `trails-runner.ts`,
sharing `trails-browser-page.ts` for browser acquisition):
- `detReplay(projectId, recordingOrTrailId, { targetUrl, networkMode })` replays
  the **recorded rrweb/DOM-mutation + input event stream** against a live page,
  NOT by re-resolving selectors per authored step. Mechanics:
  1. Launch via the existing seam (`acquireWalkBrowser` in `trails-runner.ts` —
     local Playwright or Steel CDP).
  2. Install a **deterministic clock/RNG/network shim** in the page (seed
     `Date.now`, `Math.random`, `performance.now`; intercept `fetch`/XHR via
     Playwright `route` and serve recorded HAR responses when `networkMode:'mock'`).
     Reuse the SSRF-safe `route.fetch({maxRedirects:0})` guard
     (`klavity_ssrf_redirect_guard`) for any pass-through.
  3. **Dispatch** the recorded interaction events in record order against the
     live DOM (resolve each event's target by the rrweb node id → live node via a
     replayed id map; fall back to the derived `Fingerprint`/`kref` when the id
     map breaks). This is event-scheduling replay, Meticulous-style — timing is
     controlled, not wall-clock.
  4. After each dispatched event, capture a **snapshot pair**: a pixel screenshot
     (`page.screenshot`) + a semantic digest (`captureKrefSnapshot`).
- **Base-vs-head:** `detReplayDiff(projectId, recordingId, {baseUrl, headUrl})`
  runs `detReplay` twice (against two deployed URLs / two commits) and diffs the
  per-event snapshot sequences:
  - **Visual:** perceptual pixel diff of aligned screenshots (region-level; ignore
    masked regions). Base frames captured at replay time (Meticulous parity).
  - **Behavioral:** diff the `kref` semantic digests — a disappeared control, a
    changed accessible name, a new/absent element, a differing count.
  - No author-written `checkpoint` required — the recorded base *is* the oracle.
- Divergences become Findings via the existing `recordFinding` path in
  `trails-runner.ts` (kind `visual`/`regression`), so they land in the same
  review queue, dedupe, and connector export. A diff run writes a
  `trail_runs` row (reuse `startWalk`/`finishWalk`) with a new `run_kind:'det_diff'`
  so cost/verdict/reporting reuse the existing pipeline.

**Why two engines coexist:** `walkTrail` = semantic, self-healing, checkpoint-
oriented (great for authored acceptance flows and surviving intentional
refactors). `detReplay` = deterministic, assertion-free, catches *any* drift
between two builds of the *same* recorded interaction (great for pre-merge
regression gating). A derived Trail can be run through either.

---

## Data-model changes

New table (mirrors `feedback_replays`, `prototype/lib/db.ts` `applySchema`):

```sql
CREATE TABLE IF NOT EXISTS session_recordings (
  id           TEXT PRIMARY KEY,
  project_id   TEXT NOT NULL,
  session_id   TEXT NOT NULL,           -- client-generated, groups chunks
  page_url     TEXT NOT NULL,
  events_gz    TEXT,                     -- gzip(base64) rrweb events (nullable when offloaded)
  s3_key       TEXT,                     -- object-store offload (parity with feedback_replays.s3_key)
  har_key      TEXT,                     -- optional network HAR-lite object key
  n_events     INTEGER NOT NULL,
  bytes        INTEGER NOT NULL,
  duration_ms  INTEGER,
  viewport_json TEXT,
  reporter_json TEXT,                    -- identity if identify()'d; null = anon
  consent      INTEGER NOT NULL DEFAULT 0,
  trimmed      INTEGER NOT NULL DEFAULT 0,
  derived_trail_id TEXT,                 -- set once a Trail is crystallized from it
  status       TEXT NOT NULL DEFAULT 'recorded', -- recorded|derived|dismissed
  created_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS session_recordings_idx ON session_recordings(project_id, created_at);
CREATE INDEX IF NOT EXISTS session_recordings_flow_idx ON session_recordings(project_id, status);
```

Column additions:
- `trails.source_recording_id TEXT` (nullable) — provenance from session to Trail;
  ALTER in `applySchema` like the existing `feedback_replays.s3_key` ALTER (L1198).
- `trail_runs.run_kind TEXT DEFAULT 'walk'` — `'walk' | 'det_diff'`; lets the
  deterministic diff runs reuse the run row / verdict / cost pipeline.

Optional (Phase 3) diff artifact table:

```sql
CREATE TABLE IF NOT EXISTS replay_diff_frames (
  id TEXT PRIMARY KEY, run_id TEXT NOT NULL, project_id TEXT NOT NULL,
  event_idx INTEGER NOT NULL, kind TEXT NOT NULL,          -- visual|behavioral
  base_shot_key TEXT, head_shot_key TEXT, score REAL,      -- 0..1 divergence
  detail_json TEXT, created_at INTEGER NOT NULL
);
```

Retention: reuse the `pruneOldFeedbackReplays` pattern; sessions expire faster
than authored Trails (raw sessions are transient; the derived Trail is durable).

---

## API / MCP / CLI surface

**Client SDK:**
- `createSessionReplay({ stream: { sampleRate, flushMs, maxSessionMs }, captureBodies })`
  (`packages/sdk/src/session-replay.ts`). Project config gates it (widget.ts).
- `data-replay="off"` continues to disable everything; add `data-session-record`
  granular control.

**Server REST (project-scoped, in `server.ts`):**
- `POST /api/projects/:pid/sessions/:sid/chunk` — append rrweb chunk (+ HAR).
- `POST /api/projects/:pid/sessions/:sid/finalize` — close + gzip + S3 offload.
- `GET  /api/projects/:pid/sessions` — list (dashboard).
- `GET  /api/projects/:pid/sessions/:sid/replay` — serve gz for rrweb-player.
- `POST /api/projects/:pid/sessions/:sid/derive-trail` — run the deriver +
  `crystallize` → returns draft trailId.
- `POST /api/projects/:pid/trails/:tid/det-replay` — one deterministic replay.
- `POST /api/projects/:pid/trails/:tid/det-diff` — base-vs-head diff run.

**MCP / public API** (extend `/api/v1/runs` family, memory `klavity_public_api_mcp`):
- New run kind `det_diff` on the runs endpoint (trigger a base-vs-head diff for a
  Trail/recording; poll verdict + Findings like existing runs).
- Tool `derive_trail_from_session(project, session_id)` → draft Trail.

**CLI / CI:**
- `klav replay-diff --project <id> --trail <id> --base <url|sha> --head <url|sha>`
  — a CI gate that fails the PR when divergence Findings exceed a threshold
  (the Meticulous PR-check analogue). Wraps `POST …/det-diff`.

---

## UX / reporting
- **Dashboard "Sessions" tab** (per project): list of recorded sessions with the
  rrweb-player (the player already exists for feedback replays), a masked-preview,
  and a one-click **"Propose Trail"** (calls derive-trail). Derived Trails land in
  the existing Trails list as `draft` with a "from real session" badge and
  `source_recording_id` link back.
- **Diff run report:** reuse the walk report UI; a `det_diff` run shows the
  per-event filmstrip with base|head side-by-side and the diverging frames
  highlighted. Behavioral diffs render as the `kref` line delta.
- Findings from diffs flow into the **same review queue / connectors / dedupe**
  as walk Findings (severity per `klavity_severity_taxonomy`).
- Consent surface: a project setting "Record real user sessions for QA" (default
  off; on = documented in the widget privacy copy), masked-by-default reaffirmed.

---

## Acceptance criteria
- **AC1:** With streaming enabled + consent, a real browser session is chunk-
  uploaded and a `session_recordings` row exists with `n_events>0`, retrievable
  and playable via `GET …/sessions/:sid/replay` (gz round-trips through the
  rrweb-player). Masking (`maskAllInputs`/`maskTextFn`) is preserved end-to-end.
- **AC2:** `derive-trail` on a recorded checkout/login-style session produces a
  `draft` Trail whose steps' actions + fingerprints match the recorded
  interactions, and `walkTrail(..., {suppressFindings:true})` replays it green on
  the unchanged app.
- **AC3:** `det-replay` dispatches the recorded events deterministically (same
  screenshot/kref sequence across two runs of the *same* build — byte-stable kref,
  visual diff below noise threshold), with network mocked from HAR.
- **AC4:** `det-diff` against a build with an *injected* regression (e.g. a
  button removed / label changed / control hidden) produces a Finding at the
  correct event index **without any author-written checkpoint**; against an
  identical build it produces **zero** Findings (no flakes across 10 repeats).
- **AC5:** Sampling honored (unsampled loads upload nothing); anonymous sessions
  stay untrusted; retention prune removes expired sessions.
- **AC6:** All project-scoped; no cross-project leakage (parity with existing
  `feedback_replays` project-scope tests).

## Test plan
- **Unit (`bun test`):**
  - `session-recordings.test.ts` — chunk append/finalize/gzip/S3-offload round-trip
    + cap + project scope (mirror `feedback-replay.test.ts`).
  - `session-to-trajectory.test.ts` — golden rrweb fixtures → expected Trajectory
    (assert action mapping + fingerprint shape); include a masked-input fixture.
  - `trails-det-replay.test.ts` — deterministic clock/RNG/network shim produces a
    stable snapshot sequence; id-map fallback to fingerprint works.
- **E2E (`journey/` + hermetic Playwright, like `trails-runner-replay.e2e.test.ts`):**
  - Record → derive → `walkTrail` green on unchanged app (AC2).
  - `det-diff` base==head → 0 findings; base vs mutated head → exactly the
    injected finding (AC4).
- **Negative control (memory `klavity_qa_negative_control`):** the AC4 diff test
  MUST fail (produce no finding, or a false finding) if the diff comparator is
  stubbed to always-equal — i.e. prove the diff, not the plumbing, catches the
  regression. Also assert the identical-build repeat (×10) yields zero findings so
  we're not just detecting noise.
- **Real-browser integration under Bun** (memory `klavity_over_hardening_bun_playwright`):
  det-replay must be exercised against a *real* Chromium under Bun, not only
  fake-injected events — the determinism shim is the risky part.

## Phasing
- **Phase 1 (ships first — value without the hard engine):** Layer 1 (continuous
  capture + `session_recordings` + routes + dashboard Sessions tab) **+** Layer 2
  (derive-trail → `crystallize` → draft Trail, verified via existing `walkTrail`).
  This alone turns real traffic into proposed AutoSims — high value, reuses the
  most existing code.
- **Phase 2:** Layer 3 deterministic `detReplay` (event scheduling + network mock
  + per-event snapshot), single-build. Adds a fast, flake-free re-run of derived
  flows.
- **Phase 3:** base-vs-head `detReplayDiff` + `replay_diff_frames` + filmstrip
  report + `klav replay-diff` CI gate + MCP `det_diff` run kind.

## Effort estimate
- Phase 1: **L** (client streaming + uploader + extension parity, new table/module
  mirroring feedback-replay, deriver, dashboard tab).
- Phase 2: **L** (determinism shim + event dispatch + id-map is genuinely hard).
- Phase 3: **L** (diff comparators + filmstrip UI + CI gate).
- Full capability: **XL**.

## Risks & open questions
- **Determinism is the hard part.** Chromium-level determinism (Meticulous) is a
  moat they built from the browser up; we operate at the Playwright/CDP layer, so
  perfect determinism isn't free. Mitigate by mocking network + seeding clock/RNG
  and snapshotting at event boundaries; accept a small visual noise threshold.
  Open: is CDP-level input dispatch + rrweb id-map robust enough, or do we need a
  thin injected replayer in-page?
- **rrweb id → live-DOM mapping** breaks when the head build changes structure;
  the `Fingerprint`/`kref` fallback must be solid, and a broken map must degrade
  to a Finding, not a crash (reuse the walk's infra-vs-regression discipline in
  `trails-runner.ts`).
- **Privacy/consent + compliance** (`klavity_casa_tier2`, GDPR retention/erasure):
  recording real users continuously raises the bar vs bug-time capture. Default
  off, masked, consent-gated, short retention, erasure honored.
- **Cost/volume:** continuous capture must be sampled and capped or it dwarfs
  `feedback_replays` storage; S3 offload from day one.
- **Network mocking of same-origin bodies** may capture secrets — size-cap +
  mask, opt-in only.

## Dependencies on other capabilities
- **Trails / crystallize + walkTrail** (exists) — G2 verification and the shared
  run/report/finding pipeline.
- **kref semantic snapshot** (exists) — behavioral diff oracle + fingerprint
  derivation.
- **S3 offload + replay storage** (exists, `feedback-replay.ts` / `s3.ts`).
- **Consent / privacy settings + CASA Tier-2 retention/erasure** (partial) — must
  extend to `session_recordings`.
- **Public API / MCP `/api/v1/runs`** (exists) — extend with `det_diff` run kind.
- **AutoSim auth onboarding** (exists) — deterministic replay of authed flows
  needs the registered auth method, same as walks.
