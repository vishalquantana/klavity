# Test-Data Management: Fixtures, Synthetic Seeding, Per-Run Reset

> AutoSim autonomous-QA capability spec. Grounded in `prototype/lib/trails-*`.
> Author: ramesh@quantana.in · 2026-09-11

## Problem & user value

AutoSim replays authored Trails against a live app. Today a walk is only as
reliable as the state that happens to be in the target backend at replay time.
There is **no framework for the data a run needs**: no way to say "this Trail
requires a cart with 2 items and a fresh user", no synthetic generation, no
seed-before / reset-after hooks, and no isolation so two runs don't step on each
other's rows. The consequences we already see:

- **Flaky reds that aren't regressions.** A checkout Trail reds because a coupon
  already got used, or a "create project" Trail reds on a duplicate-name unique
  constraint from a prior run. The product is fine; the *data* drifted. Our
  `FailureClass` type already reserves `"test_data"` (`lib/trails-types.ts:13`)
  for exactly this, but nothing populates it because we have no data layer to
  blame.
- **OTP / email flows can't be tested end-to-end.** We only have the fixed
  `KLAV_TEST_OTP=666666` bypass (`lib/trails-creds.ts:19`,
  `lib/test-otp-gate.ts`). We can't test a *real* per-run OTP inbox, so
  passwordless sign-up, magic links, and "check your email" flows are untestable
  autonomously.
- **No repeatability.** A red walk can't be reproduced because the data it saw
  is gone. There's no seeded, deterministic starting state.
- **Collisions.** `withWalkSlot` serializes walks *per project*
  (`lib/trails-trigger.ts:170`), but different projects / environments run
  concurrently and all hit the same real backend; and a single project's
  sequential runs mutate shared rows.

The value: turn AutoSim from "replays clicks against whatever state exists" into
"provisions the exact state each Trail needs, in an isolated namespace, and
cleans up after" — the difference between a demo and an enterprise QA agent that
teams trust to gate deploys.

## Goals / Non-goals

**Goals**
1. **Named fixture sets** per project: a reusable, versioned description of the
   data a run needs, attachable to a Trail or passed per-run.
2. **Synthetic data generation** that is *deterministic per run* (seeded by
   `runId`) so a red walk is reproducible, yet unique across runs so they don't
   collide.
3. **Seed / reset hooks** run *around* a walk: setup before step 1, teardown in
   the walk's `finally`. Two transports: **HTTP** (call the app's own seeding
   endpoint) in Phase 1; **SQL** against a registered datasource in Phase 3.
4. **Per-run isolation namespace** injected into seeds and synthetic data
   (email prefixes, tenant slugs, record names) so parallel runs never collide.
5. **Ephemeral inbox / OTP per run** (Momentic parity) behind a provider seam.
6. **Placeholder resolution** so step `actionValue`s reference fixture data:
   `{{fixture:cartId}}`, `{{run:namespace}}`, `{{inbox:email}}`, `{{inbox:otp}}`.
7. **Honest reporting**: record which fixture set + namespace a run used;
   classify a setup/teardown failure as `test_data` crash, never a regression.

**Non-goals**
- Not building a general database migration tool. Seeding calls the *app's*
  endpoints/SQL; we don't own the customer schema.
- Not a data-masking/PII product in Phase 1 (enterprise subsetting/masking is
  Phase 3, scoped small).
- Not changing the walk engine's determinism primitives that already exist
  (HAR replay `opts.har`, `networkMocks`) — fixtures compose *with* them.
- Not persisting resolved secrets/inbox values (ADR-0001 in `trails-creds.ts`
  still holds: evidence keeps placeholders).

## Competitor benchmark (concrete)

**Momentic** (`momentic.ai`) — the closest AI-QA benchmark:
- Ephemeral inboxes provisioned *inside a test* via `email.create()`; SMS/phone
  numbers leased from an org pool via `sms.lease()`. The test then waits for and
  reads the OTP and types it back. This is the exact mechanic we lack — our OTP
  is a single fixed bypass code.
- Frames TDM as a lifecycle: **generation, masking, subsetting, provisioning,
  maintenance**, delivered as *self-service, on-demand* data "in the right
  format at the right time." That lifecycle is our north star for the fixture
  model (Phase 1 = generation + provisioning; Phase 3 = masking + subsetting).

**Playwright community TDM patterns** (the concrete implementation playbook we
adopt):
- **Seed over API before the browser opens** — push data straight into the
  backend over HTTP in `globalSetup`, write created ids to a fixture, and
  *reset to a known baseline first*. We map this to a per-run setup hook that
  runs before `walkTrail`'s first step (we don't have a globalSetup — the walk
  is the unit).
- **Per-test data factory with a reset seed** — a fresh factory per test resets
  faker's seed so each test starts clean; we seed faker by `runId`.
- **Teardown in reverse creation order, each delete wrapped in catch** so an
  already-removed row doesn't fail teardown — we mirror this in the teardown
  closure returned by the setup hook.
- **Browser-context isolation is not backend isolation** — Playwright isolates
  cookies/storage per context but *not* your DB; you must namespace data
  yourself. This is exactly why we add a run namespace.

Sources: momentic.ai (TDM guide + OTP/inbox features), dev.to Playwright
backend-seeding, scrolltest.com API-seeding + factory/CI guide, ultimateqa.com
parallel data strategy, firm86.com seed/isolate/cleanup.

## Current state in our codebase

What already exists that we build **on** (do not duplicate):

- **Walk executor** `walkTrail(projectId, trailId, opts: WalkOptions)` —
  `lib/trails-runner.ts:699-1123`. Has a clean `try/finally`, acquires the
  browser *before* the try, and already runs opt-in lifecycle work with
  best-effort cleanup (e.g. `attachmentFixtures` built at
  `:712-716` and cleaned in the `finally`). **This is where setup/teardown
  hooks plug in.**
- **Walk trigger / choke point** `runWalkNow(projectId, trailId, deps)` —
  `lib/trails-trigger.ts:92-175`. The single path for manual + scheduled walks,
  wraps `withWalkSlot` (per-project serialization at `:170`), mints the `runId`
  via `startWalk`, finalizes via `finishWalk`. **Where fixture bindings and the
  run namespace are resolved and passed into the walk.**
- **`WalkOptions`** — `lib/trails-runner.ts:45-201`. Rich opt-in surface:
  `networkMocks` (`:133`), `har`/`harNotFound` (`:180-186`), `injectedSecrets`
  (`:154`), `secretResolver` (`:161`), `fileResolver` (`:168`), `credResolver`
  (`:97`), `signal` (`:126`). **We add `fixtures` + `runNamespace` here.**
- **Credential/placeholder resolution** `resolveCredRefs` and `CRED_RE` /
  `AUTOSIM_AUTH_CRED_RE` — `lib/trails-creds.ts:10-79`. Resolves
  `{{cred:name:field}}` and `{{autosim_auth:field}}` at run time only, fails
  loud on missing. **We add a sibling `{{fixture:…}}` / `{{run:…}}` /
  `{{inbox:…}}` resolver following the same pattern.**
- **Test-account vault** `lib/test-accounts.ts` + `test_accounts` table
  (`lib/db.ts:694-700`): `createTestAccount`, `getTestAccountSecret` (returns
  decrypted secret at run time), `listTestAccounts`, `rotateTestAccountSecret`.
  Encryption via `lib/crypto.ts` `decryptSecret`. **Model for the encrypted
  datasource store.**
- **Encrypted per-project config** `autosim_auth_configs`
  (`lib/db.ts:714-722`, PRIMARY KEY = project_id, `secret_enc`) + short-lived
  write-only setup token `autosim_auth_setup_tokens` (`:702-712`). **Exact
  pattern to reuse for the seed datasource + a write-only "seeding token".**
- **Fixture-Trail seeding** `seedDemoTrails` — `lib/trails-demo-seed.ts:69-99`.
  Idempotent, keyed by name; serves fixture HTML from `/trails-demo/<variant>/`.
  This seeds *Trails*, not *run data* — a naming precedent, not the mechanism.
- **OTP bypass** fixed `TEST_OTP_CODE = "666666"` (`lib/trails-creds.ts:19`)
  gated by `testOtpActiveForTestAccounts()` — the *only* email-auth mechanism
  today; the inbox provider (Phase 2) defaults to it.
- **Failure taxonomy** `FailureClass` includes `"test_data"`
  (`lib/trails-types.ts:13`); `FailureKind` is `crash | regression`
  (`:12`). The crash-vs-regression labelling pattern is proven
  (`browserUnavailable` in `walkTrail` `:731-745`, honest Slack copy in
  `lib/walk-red-alert.ts:109`). **We reuse it for data-setup failures.**
- **Environments** `TrailEnvironment {name, baseUrl}` (`lib/trails-types.ts:41`),
  `resolveEnvironmentUrl` (`lib/trails.ts:34-39`), `opts.environmentName`. A
  fixture set should be environment-aware (never seed prod).
- **Tables owned here**: `trails`, `trail_runs` (`lib/db.ts:626-637`, columns
  `trigger`, `status`, `summary_json`, `paused_secret_key`), `walk_artifacts`
  (`:1608`). Additive columns/tables land in this same idempotent boot DDL.
- **Scheduler** `tickScheduler` / `tryLaunchScheduled` →
  `runWalkNow(..., {trigger:"scheduled"})` (`lib/trails-scheduler.ts:201-293`)
  — scheduled walks must also seed, so binding resolution lives in `runWalkNow`.

**Gap:** there is no step action for HTTP/SQL (step actions are
`navigate|click|type|select|assert|wait|waitForSelector|upload|hover|keyPress|clearField|callModule|pauseForSecret`,
`lib/trails-types.ts:9`) and no data lifecycle around a run. Fixtures are a
*run-scoped* concern, not a step, so they belong in `runWalkNow`/`walkTrail`,
not as a new step action.

## Proposed architecture

New module **`lib/trails-fixtures.ts`** owns the fixture lifecycle. New module
**`lib/trails-fixture-refs.ts`** owns placeholder resolution (sibling to
`trails-creds.ts`). CRUD lives in `lib/trails.ts` alongside Trail CRUD.

### 1. Fixture-set model (`lib/trails-fixtures.ts`)

```ts
type FixtureKind = "synthetic" | "seed_http" | "seed_sql" | "inbox"

interface FixtureSet {
  id: string; projectId: string; name: string
  kind: FixtureKind
  spec: FixtureSpec           // JSON, kind-specific (see below)
  createdBy?: string; createdAt: number; updatedAt: number
}

// resolved, per-run
interface FixtureContext {
  runId: string; projectId: string; namespace: string   // e.g. "run_" + runId.slice(0,8)
  vars: Record<string, string>   // populated by setup; readable via {{fixture:key}}
}
type Teardown = () => Promise<void>
```

**`applyFixtures(projectId, runId, sets: FixtureSet[], deps): Promise<{ctx, teardown}>`**
runs each set's setup, merges emitted `vars` into one `FixtureContext.vars`,
and returns a single composed `teardown` that reverses them (LIFO), each delete
wrapped in try/catch (Playwright teardown discipline). `deps` injects the
synthetic generator, the HTTP client, and the inbox provider so tests fake them.

- **`synthetic`**: `spec.fields` is a template (`{ email: "user+{{ns}}@ex.com",
  company: "faker.company", n: "faker.int:1-99" }`). A deterministic PRNG seeded
  by `runId` drives a tiny faker shim (`lib/synthetic.ts`, ~120 LOC, no dep) so
  the same run reproduces identical values. Emits into `vars`. No teardown.
- **`seed_http`**: POST `spec.payload` (placeholders pre-resolved) to the
  project's registered seeding endpoint (`trail_datasources`, see below) with a
  signed `X-Klavity-Seed` header derived from a write-only seeding token. The
  endpoint returns created ids → `vars`. Teardown = DELETE / a `spec.teardown`
  request. **The app owns its own seed/reset routes; we just call them** — same
  philosophy as the Playwright API-seeding pattern.
- **`seed_sql`** (Phase 3): run `spec.setupSql` / `spec.teardownSql` against a
  registered, encrypted DSN. Env-gated + environment-gated (never `production`).
- **`inbox`** (Phase 2): lease an ephemeral mailbox via `InboxProvider`; emit
  `vars.inbox_email`; `{{inbox:otp}}` polls the provider for the latest code.
  Default provider = the existing `TEST_OTP_CODE` fixed-code path so it works
  with zero external dependency; a real provider (MailSlurp-style) is a seam.

### 2. Lifecycle wiring (grounded edits)

- **`WalkOptions`** (`lib/trails-runner.ts:45-201`): add
  `fixtures?: FixtureSet[]`, `runNamespace?: string`,
  `fixtureDeps?: FixtureDeps` (injectable). All default-off → byte-identical
  behavior when absent (matches the file's established opt-in convention).
- **`walkTrail`** (`:699-1123`): right after the browser is acquired and the
  `runId` is known (`:722` area), if `opts.fixtures?.length`, call
  `applyFixtures(...)`. On setup failure, finalize RED as a **crash** with
  `summary.failureKind="crash"`, `summary.failureClass="test_data"`, and a
  clear reason — *exactly mirroring* the `browserUnavailable` finalize at
  `:731-745` so a data problem is never mislabelled a regression. Register the
  returned `teardown` to run in the existing `finally` block, next to
  `attachmentFixtures.cleanup` (`:715`).
- **Placeholder resolution**: extend the resolver chain used for type-step
  `actionValue`. `resolveCredRefs` (`trails-creds.ts:23`) already runs at fill
  time; add `resolveFixtureRefs(ctx, value)` in `lib/trails-fixture-refs.ts`
  and compose them (creds first, then fixtures) at the same call site. New
  regexes `FIXTURE_RE = /\{\{fixture:([a-z0-9_]+)\}\}/g`,
  `RUN_RE = /\{\{run:(namespace|id)\}\}/g`,
  `INBOX_RE = /\{\{inbox:(email|otp|latest)\}\}/g`. Resolution reads only
  `ctx.vars` + the inbox provider — never persisted (ADR-0001).
- **`runWalkNow`** (`lib/trails-trigger.ts:92-175`): after `startWalk` yields
  `runId` (`:135`), resolve the Trail's bound fixture sets (+ any per-call
  override) and compute `runNamespace = "run_" + runId.slice(0,8)`, then pass
  both into the `walk(...)` call. Scheduled walks get this for free since the
  scheduler routes through here.

### 3. Datasource + seeding-token store

- **`lib/trails-datasources.ts`** + table `trail_datasources` (see below):
  `registerDatasource`, `getDatasource` (decrypts at run time via
  `crypto.decryptSecret`), `listDatasources`, `deleteDatasource` — cloned from
  `lib/test-accounts.ts` shape. A datasource is `{kind: "http"|"sql", target,
  secret_enc, allowed_environments}`. **Never resolvable against an environment
  not in `allowed_environments`** (prod-safety), checked in `applyFixtures`.
- Reuse the **write-only setup-token** pattern (`autosim_auth_setup_tokens`,
  `db.ts:702`) so a customer registers a seed endpoint's shared secret without
  it being readable back.

## Data-model changes

All additive, in the idempotent boot DDL (`lib/db.ts`, alongside `test_accounts`
~`:694`):

```sql
CREATE TABLE IF NOT EXISTS trail_fixtures (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL,
  kind TEXT NOT NULL,                 -- synthetic|seed_http|seed_sql|inbox
  spec_json TEXT NOT NULL,
  created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  UNIQUE(project_id, name));
CREATE INDEX IF NOT EXISTS trail_fixtures_proj_idx ON trail_fixtures(project_id);

CREATE TABLE IF NOT EXISTS trail_datasources (      -- Phase 1 (http) / 3 (sql)
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL,
  kind TEXT NOT NULL,                 -- http|sql
  target TEXT NOT NULL,               -- endpoint URL or DSN host (non-secret)
  secret_enc TEXT NOT NULL,           -- encrypted token / DSN password
  allowed_environments TEXT NOT NULL DEFAULT '[]',  -- JSON array of env names
  created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
  UNIQUE(project_id, name));

CREATE TABLE IF NOT EXISTS run_fixtures (           -- audit: what a run seeded
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, run_id TEXT NOT NULL,
  fixture_set TEXT NOT NULL, namespace TEXT NOT NULL,
  setup_status TEXT NOT NULL, teardown_status TEXT,   -- ok|failed|skipped
  vars_json TEXT,                     -- NON-SECRET emitted vars only (ids, names)
  created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS run_fixtures_run_idx ON run_fixtures(project_id, run_id);
```

Column adds (via the `needCol` ALTER pattern used at `db.ts:1628`):
- `trails.fixture_set_id TEXT` — a Trail's default bound fixture set.
- `trail_runs.run_namespace TEXT` and `trail_runs.fixture_set TEXT` — stamped
  by `finishWalk`/`startWalk` for reporting.

`spec_json` shapes are validated on write; secrets never live in
`trail_fixtures` (only in `trail_datasources.secret_enc`).

## API / MCP / CLI surface

- **REST CRUD** (new routes in `server.ts`, mirroring the test-accounts routes
  proven in `server.test-accounts.route.test.ts`):
  - `GET/POST /api/trails/fixtures` · `DELETE /api/trails/fixtures/:id`
  - `GET/POST /api/trails/datasources` · `DELETE .../:id` (write-only secret)
  - `POST /api/trails/:id/fixtures` — bind/unbind a fixture set to a Trail.
- **Trigger extension**: `POST /api/v1/runs` (public API, see
  `server.v1-runs.test.ts`) and the internal run-now route accept optional
  `fixtureSet` (name) and `namespace` (override) — resolved in `runWalkNow`.
- **MCP**: extend the runs tool (`server.mcp.test.ts`) so an agent can list
  fixture sets and trigger a run with a chosen fixture set.
- **CLI/authoring**: the Trail author UI gains a "Test data" section to pick a
  fixture set; `authorRun` (`trails-author.ts`) accepts a fixture binding so an
  authored dry-run seeds too.

## UX / reporting

- **Walk report**: a "Test data" card showing the fixture set + `namespace`
  used, seed status (ok/failed), and emitted non-secret vars (ids/names). Reads
  from `run_fixtures`.
- **Red alert** (`lib/walk-red-alert.ts:109`): when `failureClass==="test_data"`
  the Slack copy says *"data setup failed — not a product regression,"* mirroring
  the existing infra-vs-regression honesty split.
- **Fixtures manager** page under project settings (CRUD + "test run" button
  that seeds into a throwaway namespace and reports what got created).

## Acceptance criteria

1. A Trail bound to a `synthetic` fixture set walks with `{{fixture:email}}`
   resolving to a deterministic value seeded by `runId`; re-running the *same*
   run id reproduces identical values, different runs produce different ones.
2. A `seed_http` fixture calls the registered endpoint before step 1, injects
   returned ids into `vars`, and runs its teardown request in `walkTrail`'s
   `finally` even when the walk reds mid-way.
3. Two concurrent walks (different projects/environments) using the same fixture
   set get distinct `namespace`s and do not collide (negative control below).
4. A setup-hook failure finalizes the run RED with `failureKind:"crash"` +
   `failureClass:"test_data"` and a human reason — **never** a false regression;
   the red alert labels it as a data issue.
5. Resolved fixture/inbox/cred values never appear in `run_steps` evidence,
   `run_fixtures.vars_json` (only non-secret ids), logs, or the report
   (ADR-0001 preserved).
6. A fixture set / datasource whose `allowed_environments` excludes the run's
   environment refuses to seed (fails loud before the browser is used).
7. `bun test` green including a new `lib/trails-fixtures.test.ts` and
   `server.trails-fixtures.route.test.ts`.

## Test plan

- **Unit** `lib/trails-fixtures.test.ts`: synthetic determinism (same runId →
  same vars); LIFO teardown with one delete throwing (later deletes still run);
  `allowed_environments` gate rejects a disallowed env; `applyFixtures` composes
  vars from multiple sets.
- **Unit** `lib/trails-fixture-refs.test.ts`: `{{fixture:}}`/`{{run:}}`/
  `{{inbox:}}` resolution + fail-loud on unknown key; composition with
  `resolveCredRefs` (creds resolved first).
- **Engine** extend a `trails-runner` e2e: a Trail whose type step uses
  `{{fixture:email}}` walks green against a served fixture page; assert the
  injected value hit `locator.fill` but the `run_step` evidence keeps the
  placeholder.
- **Route** `server.trails-fixtures.route.test.ts`: CRUD authz (project-scoped),
  write-only datasource secret, bind/unbind.
- **Negative control (isolation, the load-bearing test):** seed the *same*
  fixture set for two runs **without** the namespace feature (inject a fixed
  namespace) and assert the second run's `seed_http` collides (e.g. unique-name
  409 from the fake endpoint) → run reds `test_data`. Then enable per-run
  namespacing and assert *both* runs seed cleanly and green. This proves the
  isolation actually does something and would fail if namespacing regressed.
- **Negative control (labelling):** force the setup hook to throw and assert the
  run finalizes `failureKind:"crash"`/`failureClass:"test_data"`, that
  `notifyWalkRed` is called with the data-issue copy, and that **no Finding** is
  filed (mirrors the `browserUnavailable` guarantee).

## Phasing (what ships first)

- **Phase 1 (foundation):** `trail_fixtures` model + `applyFixtures` lifecycle
  in `walkTrail`/`runWalkNow` + run namespace + deterministic **synthetic**
  generator + `{{fixture:}}`/`{{run:}}` resolution + `seed_http` transport +
  reporting + `test_data` failure labelling. This alone kills the "flaky-red
  from data drift" class and gives repeatable, isolated runs.
- **Phase 2:** ephemeral **inbox / OTP-per-run** provider seam (`InboxProvider`,
  `{{inbox:*}}`), defaulting to the existing fixed-OTP path, with a real
  provider adapter — Momentic `email.create()` parity.
- **Phase 3:** `seed_sql` datasource (encrypted DSN, env-gated) + light
  enterprise TDM (subset/mask helpers in the synthetic generator) + teardown
  verification (assert the namespace is empty post-walk).

## Effort estimate

- Phase 1: **L–XL** (model + two new modules + walk/trigger wiring + 3 routes +
  reporting + tests). ~1–1.5 eng-weeks.
- Phase 2: **M** (provider interface + inbox refs + one adapter). ~3–4 days.
- Phase 3: **L** (SQL execution safety is the hard part). ~1 week.

## Risks & open questions

- **Prod-safety of SQL seeding** is the biggest risk — a mis-scoped teardown
  could delete real data. Mitigation: `allowed_environments` gate, env-flag
  double-lock, dry-run/preview, and *never* default-on. Consider deferring SQL
  entirely if HTTP seeding covers the demand.
- **Teardown on crash / process death:** if the box dies mid-walk, teardown
  won't run and the namespace leaks. Mitigation: namespaced data is disposable
  by design; add a periodic reaper keyed on `run_fixtures` for old namespaces.
- **Where does app-side seeding logic live?** We call the *customer's* seed
  endpoint. Open question: do we ship a tiny reference seed-route helper in the
  SDK so customers can stand one up quickly?
- **Inbox provider choice** (build vs MailSlurp/Mailosaur) — decide in Phase 2.
- **HAR interplay:** if `opts.har` replay is on, seeded backend state may be
  masked by replayed network. Document that HAR-replay and live-seed are
  mutually exclusive per Trail; validate on bind.

## Dependencies on other capabilities

- **Cred vault / test accounts** (`trails-creds`, `test-accounts`) — reuses its
  encryption + write-only-secret patterns; the fixture resolver composes with
  `resolveCredRefs`.
- **Environments** (`resolveEnvironmentUrl`) — fixtures are environment-scoped.
- **Walk determinism** (`har`, `networkMocks`) — composes with, must not
  conflict.
- **Auth onboarding / OTP** (`autosim_auth_configs`, `test-otp-gate`) — the
  Phase 2 inbox provider builds on the fixed-OTP path.
- **Public API / MCP runs** (`/api/v1/runs`, MCP) — the surface that exposes
  per-run fixture selection to external agents.
