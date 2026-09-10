# CI/CD Integration + PR Gating (GitHub Action, per-PR runs, status checks)

_Spec owner: platform. Status: draft. Last updated: 2026-09-11._

## Problem & user value

AutoSim can already walk a web app and produce a green/amber/red verdict with
grounded findings. But today the only ways to launch a walk are the dashboard
button, the scheduler, the MCP `start_qa_run` tool, the `POST /api/v1/runs` REST
create, and a bare-bones `scripts/klav-ci.ts` poller. None of these close the
loop that a QA-in-CI buyer actually wants:

> "On every pull request, run AutoSim against **this PR's preview deployment**,
> post a **pass/fail status check** that can **block merge**, and drop a
> **summary comment** with the findings and a replay link — with zero glue code."

That is the wedge competitors (Momentic, Checksum, Relicx, Mabl) lead with. Our
north star is a fully-autonomous QA agent that catches (nearly) all bugs; a bug
caught **after** merge is worth a fraction of one caught **on the PR**. This
capability makes AutoSim a required merge gate, which is both the highest-value
placement in the SDLC and the stickiest (removing a required check is a
deliberate act).

We already have ~80% of the plumbing. This spec is mostly about (a) a published,
one-line **GitHub Action** wrapper, (b) capturing **git/PR metadata** and an
**ephemeral preview URL** on the trigger, and (c) writing back a **commit status
/ check-run + PR comment**. It builds on the existing `/api/ci/*` and
`/api/v1/runs` surfaces — it does not duplicate them.

## Goals

- A published **GitHub Action** (`klavity/autosim-action@v1`) that runs one or
  more Trails against a caller-supplied **preview URL** on a PR/commit and fails
  the job on a configurable verdict threshold.
- A **thin CLI** (`klav-ci`, evolved from `scripts/klav-ci.ts`) that the Action
  wraps and that also works standalone in any CI (CircleCI, GitLab, Jenkins).
- **Git/PR provenance** stored on the run (commit SHA, branch, PR number, repo,
  base ref) and surfaced through the existing `git` field in
  `buildV1RunStatus` / OpenAPI `RunStatus`.
- **Ephemeral preview-URL override** per run (Vercel/Netlify deploy previews are
  not pre-registered environments), reusing the existing `environmentName`
  resolution path.
- A **GitHub commit status + check-run** and a **PR summary comment** posted by
  Klavity when a run finishes, using the existing GitHub connector credentials.
- **Configurable gating policy**: which verdicts fail the check, and severity
  thresholds (e.g. "block on any C1; warn on C2/C3").
- **Run a set** of Trails per PR (all active, or tag-filtered), with an
  aggregate verdict — not just a single `trailId`.

## Non-goals

- Building the preview deployment itself (the customer's existing CI does that;
  we consume the URL).
- Native GitLab CI / Bitbucket **apps** (the CLI already works there via exit
  codes; app-level status write-back is a phase 3 follow-up).
- Auto-authoring new Trails from a PR diff (that is the "objective → authored
  run" capability, separate epic — see Dependencies).
- Sharding/parallelism across CI runners (Momentic-style `--shard-index`) — the
  walk slot is a single global resource today (`withWalkSlot`); parallel walks
  are a separate scaling epic.

## Competitor benchmark (concrete)

- **Momentic** ships a marketplace Action that is a thin wrapper over
  `npx momentic run`. Auth is a `MOMENTIC_API_KEY` repo secret injected as env.
  Results write to `--output-dir`; a later `momentic results merge` + `results
  upload` step collates a run group in their cloud. Gating is via the CLI
  process exit code (non-zero fails the job). Sharding via `--shard-index /
  --shard-count`. Takeaway: **API-key-as-secret + CLI-exit-code gating + a
  published Action that is a one-liner** is the table-stakes shape.
- **Checksum.ai** triggers suites "from a PR, the API, or MCP", auto-heals, and
  emits standard Playwright. It marks the commit's status so the PR reflects
  pass/fail. Takeaway: **multiple trigger surfaces feeding one run**, plus
  **commit-status write-back** as the gate.
- **GitHub mechanics** (the primitive both use): the
  [Commit Statuses API](https://developer.github.com/v3/repos/statuses/) sets a
  `state` of `error | failure | pending | success` on a SHA with a `context`
  (e.g. `klavity/autosim`), a `description`, and a `target_url` (deep link to
  the run report). Branch protection can require the `context` to pass before
  merge. The richer **Checks API** (`check-runs`) additionally renders
  annotations and a markdown summary in the PR "Checks" tab. We will use commit
  statuses in phase 1 (simplest, only needs a token) and add check-runs +
  annotations in phase 2.

Sources: [Momentic GitHub Actions](https://momentic.ai/docs/ci/github-actions),
[Momentic Action](https://github.com/marketplace/actions/momentic-run-tests),
[Checksum.ai](https://github.com/checksum-ai),
[GitHub Commit Statuses API](https://developer.github.com/v3/repos/statuses/),
[GitHub status checks](https://docs.github.com/en/pull-requests/reference/status-checks).

## Current state in our codebase (file refs)

Already built (this spec builds ON these — do not duplicate):

- **CI token mint** — `POST /api/ci/token`, session-gated, returns a
  project-bound `kci_` token. Tested in
  `prototype/server.ci-trigger.test.ts:134-176`.
- **CI trigger + poll** — `POST /api/ci/trails/:id/trigger?project=` → `202
  {runId}` (IDOR-guarded), and `GET /api/ci/runs/:runId?project=` returns an
  **enriched** body with `status`, `verdict`, `reportUrl`, `shareUrl`, and
  `failingStep`. Tested in `prototype/server.ci-trigger.test.ts:178-333`. Route
  handlers live in `prototype/server.ts` (grep `/api/ci/`).
- **Bare CLI runner** — `prototype/scripts/klav-ci.ts` (74 lines): triggers one
  `trailId`, polls every 5s up to 5m, `process.exit(walk.status==="green"?0:1)`.
  Single-trail only; no URL override, no suite, no git metadata, no status-check
  write-back, no CI-friendly output.
- **v1 REST create/status/report** — `prototype/lib/v1-runs.ts`:
  `buildV1RunStatus(projectId, walk, git)` at `:47-77` **already emits a `git`
  field** (`Record<string,unknown> | null`); `buildV1Report` at `:202-236` maps
  findings → issues with `severity` `C1|C2|C3` and cursor pagination.
  `POST /api/v1/runs` supports an `Idempotency-Key` header
  (`prototype/server.v1-runs.test.ts:187,203`).
- **OpenAPI** — `prototype/lib/openapi.ts:buildOpenApiSpec` (`:67-642`) already
  documents `RunStatus` with a `git` object field and `kci_` bearer security.
- **The single trigger choke point** — `runWalkNow(projectId, trailId, {trigger,
  environmentName})` in `prototype/lib/trails-trigger.ts:92-175`. `trigger` is
  currently `"manual" | "scheduled"` (see `SimRunTrigger` in
  `prototype/lib/posthog.ts:41`). It calls `startWalk(...)` then `walkTrail`.
- **Preview-URL resolution** — `resolveEnvironmentUrl(trail, environmentName)`
  in `prototype/lib/trails.ts:34-39` and `TrailEnvironment {name, baseUrl}` in
  `prototype/lib/trails-types.ts:41-44`; `walkTrail` applies it at
  `prototype/lib/trails-runner.ts:705-708` (KLA-93). Environments are
  **pre-registered by name** — there is no ephemeral one-off URL path yet.
- **GitHub connector** — `prototype/lib/connectors/github.ts` (issue/comment
  filing via a stored token). It files **tickets**; it does **not** write commit
  statuses or check-runs.
- **MCP** — `start_qa_run` tool in `prototype/lib/mcp/tools.ts`, dispatched via
  `handleMcpMessage` in `prototype/lib/mcp/rpc.ts:39-81`, `kci_`-authed.

Gaps this spec fills: (1) no published Action; (2) no git/PR metadata on the
trigger path (the `git` field is emitted but never populated from CI); (3) no
ephemeral preview-URL override; (4) no commit-status / check-run / PR-comment
write-back; (5) no multi-Trail "suite" run per PR; (6) no gating-policy config.

## Proposed architecture

Five layers, each grounded in an existing module.

### 1. Data model (see next section)
Add git/PR provenance columns to `trail_runs`, a `ci_run_batches` table for a
per-PR suite, and a per-project `ci_gating_policy` JSON column on `projects`.

### 2. Trigger: extend `runWalkNow` + a new batch entrypoint
- Extend `runWalkNow` (`prototype/lib/trails-trigger.ts:92`) `deps` with an
  optional `ci?: CiRunContext` (`{ url?: string; git?: GitProvenance }`) and add
  `"ci"` to the trigger union (`SimRunTrigger` in `posthog.ts:41`, plus the
  `startWalk` trigger param). The `url` is an **ephemeral preview override**:
  thread it into `walkTrail`'s `opts.fixtureUrl` alongside the existing
  `environmentName` path in `trails-runner.ts:705`, guarded by an SSRF/allowlist
  check (see Risks). `git` is persisted on the run row (below) so
  `buildV1RunStatus`'s existing `git` field is finally populated.
- New `runCiBatch(projectId, { trailIds | tag, url, git, gatingPolicy })` in a
  new `prototype/lib/ci-batch.ts`: resolves the Trail set (all active, or
  tag-filtered — reuse the trail listing already used by the scheduler), creates
  a `ci_run_batches` row, calls `runWalkNow` per trail, and returns
  `{ batchId, runIds }`. Verdict aggregation is `worst-of` across child runs.

### 3. HTTP surface (server.ts, next to existing `/api/ci/*`)
- `POST /api/ci/runs` (batch create) — `kci_` bearer, body `{ trailId? | tag? |
  all?, url?, git?, wait?, gating? }`. Returns `202 { batchId, runIds }`. Reuses
  the existing `kci_` auth + project-IDOR guard already applied to
  `/api/ci/trails/:id/trigger`.
- `GET /api/ci/batches/:batchId?project=` — aggregate status: `{ status,
  verdict, runs: [enriched /api/ci/runs shape], reportUrl }`. Reuses the
  enrichment builder behind `GET /api/ci/runs/:runId`.
- Keep the existing single-trail `/api/ci/trails/:id/trigger` working (the batch
  route is additive).

### 4. Write-back: commit status / check-run + PR comment
New `prototype/lib/ci-github-status.ts`:
- `postCommitStatus(cfg, { sha, state, context, description, targetUrl })` →
  `POST /repos/{owner}/{repo}/statuses/{sha}` using the token from the project's
  existing GitHub connector config (`prototype/lib/connectors/github.ts` already
  holds `{ token, repo }`).
- `postPrComment(cfg, { prNumber, markdown })` for the summary comment (upsert:
  find a prior comment with a hidden `<!-- klavity-autosim -->` marker and edit
  it, so re-runs don't spam the PR — mirrors the blog-publish idempotency
  pattern in `blog-publish.ts`).
- Phase 2: `postCheckRun(...)` → Checks API with markdown summary + per-finding
  annotations (file/line unavailable, but URL + selector + ground-quote render
  well as a summary table).
- Trigger point: on walk finalize. `runWalkNow`'s completion path already calls
  `finishWalk` + `maybeAutoFileWalkFindings` (`trails-trigger.ts:150-156`). Add
  a best-effort `maybeReportCiStatus(projectId, runId)` beside it that fires only
  when the run has CI git provenance, so it never touches the dashboard/schedule
  paths. Fully swallowed like the existing fire-and-forget calls.

Write-back can happen **two ways**, both supported:
1. **Klavity-side** (above) when the project's GitHub connector is configured —
   zero secrets in the customer's CI beyond `kci_`.
2. **Action-side** — when the Action runs with a `github-token` input, the CLI
   emits a machine-readable result and the Action posts the status itself via
   the workflow token. This is the default because it needs no Klavity→GitHub
   credentials and works on the first run.

### 5. Packaging: the GitHub Action + CLI
- Evolve `scripts/klav-ci.ts` into a real CLI (`klav-ci`): flags `--trail`,
  `--tag`, `--all`, `--url <previewUrl>`, `--project`, `--fail-on
  red|amber|c1|c2` (default `red`), `--timeout`, `--comment/--no-comment`,
  `--wait`. It hits `POST /api/ci/runs` + `GET /api/ci/batches/:id`, prints a
  human summary, writes `$GITHUB_STEP_SUMMARY` markdown when present, and exits
  non-zero per the gating policy. Auto-detects git/PR provenance from CI env
  (`GITHUB_SHA`, `GITHUB_REF_NAME`, `GITHUB_HEAD_REF`, the PR number from
  `GITHUB_REF`/event payload) and sends it in the request body.
- New `action.yml` (composite Action) at repo root `action/` (published to
  Marketplace as `klavity/autosim-action`). Inputs: `api-token`, `project`,
  `preview-url`, `trail`/`tag`/`all`, `fail-on`, `github-token` (optional, for
  Action-side status write-back), `comment`. It installs Bun, runs the CLI, and
  (if `github-token` given) posts the commit status + PR comment via
  `actions/github-script` or a small step.
- A `README` + copy-paste workflow example (also surfaced in the dashboard
  "Connect your AI / CI" drawer and `/llms.txt`, per the API-docs memory).

## Data-model changes

`prototype/lib/db.ts` migrations (follow the existing numbered-migration
pattern):

1. `trail_runs` add columns (nullable, backward-compatible):
   - `ci_source TEXT` (`github` | `gitlab` | `cli` | null)
   - `ci_commit_sha TEXT`, `ci_branch TEXT`, `ci_base_ref TEXT`
   - `ci_pr_number INTEGER`, `ci_repo TEXT` (`owner/name`)
   - `ci_preview_url TEXT` (the ephemeral URL actually walked)
   - `ci_batch_id TEXT` (FK to `ci_run_batches.id`, null for standalone)
   These back-fill the `git` object in `buildV1RunStatus`
   (`v1-runs.ts:47-77`) — add a `gitFromWalk(walk)` helper there.
2. New `ci_run_batches`: `id`, `project_id`, `trigger` (`ci`), `commit_sha`,
   `branch`, `pr_number`, `repo`, `preview_url`, `gating_policy TEXT (JSON)`,
   `status`, `verdict`, `created_at`, `finished_at`. One row per PR/commit
   invocation; children are `trail_runs` with matching `ci_batch_id`.
3. `projects` add `ci_gating_policy TEXT (JSON)` — default
   `{ "failOn": "red", "blockSeverities": ["C1"] }`. Editable from Settings.
4. Reuse existing `github` connector row for the write-back token; no new creds
   table.

## API / MCP / CLI surface

**REST (new, `kci_`-authed, alongside existing `/api/ci/*`):**
- `POST /api/ci/runs` → `202 { batchId, runIds }`. Body: `{ trailId? | tag? |
  all?, url?, git?: { sha, branch, baseRef, prNumber, repo, source }, gating?,
  wait? }`. Honors `Idempotency-Key` (mirror `/api/v1/runs`) keyed on
  `sha+trailSet` so a re-triggered PR job dedupes.
- `GET /api/ci/batches/:batchId?project=` → aggregate verdict + child run
  summaries.
- Extend `GET /api/ci/runs/:runId` response with a `git` object (populated from
  the new columns).

**MCP:** extend `start_qa_run` (`prototype/lib/mcp/tools.ts`) to accept optional
`url` and `git` args and route through the same `runWalkNow` `ci` context, so an
agent-driven PR check has parity with the Action.

**OpenAPI:** add the `/api/ci/runs` + `/api/ci/batches/:id` paths and a
`CiRunBatch` schema to `buildOpenApiSpec` (`prototype/lib/openapi.ts`), and note
the `git` fields (the `RunStatus.git` object is already declared there).

**CLI (`klav-ci`):** flags as in Architecture §5; exit `0` on pass, `1` on gate
failure, `2` on infra/timeout error (distinct so CI can retry infra without
retrying a real regression).

**GitHub Action (`action.yml`):** inputs `api-token`, `project`, `preview-url`,
`trail`/`tag`/`all`, `fail-on`, `github-token?`, `comment?`.

## UX / reporting

- **Commit status**: `context = "klavity/autosim"`, `state` mapped from verdict
  (`green→success`, `amber→success|failure` per policy, `red→failure`,
  crash/timeout→`error`), `description = "3 findings (1 C1, 2 C2)"`, `target_url
  = reportUrl` (existing enriched field).
- **PR comment** (upserted): verdict badge, per-Trail row (name, verdict,
  findings count), a table of findings (severity, title, page URL, ground-quote,
  replay/share link — reuse `reportUrl`/`shareUrl` from the enriched CI run
  response), and a "diff vs base" line reusing `diffSimRuns`
  (`prototype/lib/sim-review-pure.ts:311`) where a prior run on the base branch
  exists (`previousSimRunForUrl` in `db.ts:8229` is the analogous primitive for
  Trails).
- **`$GITHUB_STEP_SUMMARY`**: the CLI writes the same markdown so it renders in
  the Actions run even without the PR comment.
- **Dashboard**: a "CI" tab on the project showing recent `ci_run_batches` keyed
  by PR/commit, and a Settings pane to edit `ci_gating_policy`. Show white cards
  on beige per the standing UI rule.

## Acceptance criteria

- Given a `kci_` token, `POST /api/ci/runs` with `{ all: true, url: "<preview>",
  git: {...} }` returns `202 { batchId, runIds }`, and each child `trail_run`
  persists the preview URL + git provenance.
- `GET /api/ci/batches/:id` returns a `worst-of` aggregate verdict once all
  children finalize; verdict is `null` while any child is still running.
- The preview-URL override actually changes the walked URL (a run against
  `url=https://preview-x` hits that origin, not the trail's stored `baseUrl`),
  and a disallowed URL (non-http(s), private IP, or off-allowlist host) is
  rejected `400` without launching a walk.
- IDOR: a project-A `kci_` token cannot create a batch, read a batch, or trigger
  a trail in project B (403/404) — same guard as the existing
  `/api/ci/trails/:id/trigger` tests.
- With a configured GitHub connector, a finished CI run posts a commit status
  with `context=klavity/autosim` and the mapped `state`, and upserts (not
  duplicates) a single PR comment across re-runs.
- The CLI exits `0` on `green`, `1` when the verdict trips the `--fail-on`
  policy, and `2` on timeout/infra crash; it writes `$GITHUB_STEP_SUMMARY`.
- Gating policy is honored: `blockSeverities: ["C1"]` fails the check on a C1
  even if the overall verdict is `amber`.
- The Action, run against a live preview URL in a smoke workflow, sets a
  required status check that blocks merge on `red`.

## Test plan

Unit / route (Bun, mirroring `server.ci-trigger.test.ts`, new
`server.ci-batch.test.ts`, port band distinct from 43xxx/44xxx):
- Batch create returns runIds; provenance columns persisted; git object appears
  in `GET /api/ci/runs/:id` and `/api/ci/batches/:id`.
- Verdict aggregation `worst-of` (green+red→red; green+amber→amber;
  all-green→green; any-running→null).
- Idempotency-Key on `POST /api/ci/runs` returns the same batchId.
- IDOR matrix (create/read/trigger cross-project) → 403/404.
- Preview-URL SSRF guard: `file://`, `http://169.254.169.254`,
  `http://localhost`, and an off-allowlist host all rejected `400` **without**
  a walk being started (assert `runWalkNow`/`startWalk` not called via the test
  seam).
- `ci-github-status.ts` with a mocked GitHub fetch: correct verdict→state
  mapping; PR-comment upsert edits the marked comment instead of creating a
  second.
- CLI (`klav-ci`) exit-code matrix against a stubbed server: green→0,
  policy-trip→1, timeout→2; `$GITHUB_STEP_SUMMARY` written.
- Gating policy: `blockSeverities:["C1"]` trips on a C1 within an amber verdict.

**Negative control (required):** a test where the walk finalizes **red** but the
assertion is inverted — the CI check must go `failure`/exit `1`. The control is
that with the **gating write-back stubbed out / disabled**, the same red run
yields **no status write** and the CLI still exits non-zero purely on verdict
(proving the gate depends on the real verdict, not on the presence of the
write-back), and conversely that a forced-green stub does **not** produce a
`failure` state. This guards against the classic "check always passes / always
fails regardless of verdict" false-green.

E2E (`journey/`): a workflow-shaped test that mints a `kci_`, posts a batch
against a fixture preview URL, polls the batch to a terminal verdict, and asserts
the enriched report + (mocked) commit status.

## Phasing (what ships first)

- **Phase 1 (foundation, ships first):** git/PR provenance columns +
  `ci_run_batches` + `POST /api/ci/runs` / `GET /api/ci/batches/:id` + preview-URL
  override (SSRF-guarded) + populate the `git` field. Evolve `klav-ci.ts` into
  the real CLI with gating exit codes and `$GITHUB_STEP_SUMMARY`. No GitHub
  write-back yet (gating is via CLI exit code — already enough to block merge
  when the workflow step fails). This alone matches Momentic's shape.
- **Phase 2 (write-back + Action):** `ci-github-status.ts` commit status + PR
  comment upsert (Klavity-side and Action-side), the published `action.yml`,
  gating policy config + Settings UI, dashboard CI tab, OpenAPI + `/llms.txt`
  docs.
- **Phase 3 (advanced):** GitHub Checks API with per-finding annotations,
  base-vs-PR diff comment via `diffSimRuns`, tag-filtered suites, GitLab/Bitbucket
  status write-back.

## Effort estimate

- Phase 1: **L** (migrations + batch lib + 2 routes + SSRF guard + CLI rewrite +
  tests).
- Phase 2: **L** (GitHub write-back + Action packaging + Settings/dashboard +
  docs).
- Phase 3: **M** (Checks API + diff + other providers).

## Risks & open questions

- **SSRF via preview URL** is the top risk: an attacker with a `kci_` could point
  a walk at internal infra. Reuse the SSRF-redirect guard pattern
  (memory: `klavity_ssrf_redirect_guard` — `route.fetch({maxRedirects:0})` +
  Location validation) and add a per-project allowlist of preview host patterns
  (e.g. `*.vercel.app`, the customer's own domains) configured alongside the
  gating policy. Fail closed.
- **Walk-slot contention:** `withWalkSlot` is a single global slot; a PR firing N
  trails serializes them, and busy CI could starve scheduled walks. Batch runs
  should respect the existing per-project queue (`trails-trigger.ts` keys by
  project) and expose a `maxTrails` cap. Parallelism is out of scope (non-goal).
- **Cost/abuse:** every PR push could trigger a full suite. Respect existing
  Snap-only entitlement gating (`projectEntitlement(...).snapOnly` already blocks
  in `runWalkNow`) and add a per-project CI run/day cap; surface COGS via the
  existing `ai_calls`/`cost_events` ledger.
- **Amber semantics:** should amber block by default? Proposed default `failOn:
  red` (amber = success with a warning comment), overridable per project.
- **Which write-back token?** Action-side (workflow `github-token`) is the safe
  default (no stored creds, least privilege, works run-1). Klavity-side requires
  the GitHub connector already be configured; document both.
- **Ephemeral vs named environments:** do we persist an ad-hoc preview URL as a
  transient `TrailEnvironment`, or keep it purely per-run? Proposed: per-run only
  (`ci_preview_url` column), no environment mutation.
- **PR number discovery** differs by CI provider; the CLI must parse the GitHub
  event payload for `pull_request.number` (not derivable from `GITHUB_REF` on all
  event types).

## Dependencies on other capabilities

- **v1 REST runs + `kci_` tokens** (shipped) — this wraps them; hard dependency.
- **GitHub connector** (shipped, `lib/connectors/github.ts`) — reused for
  write-back credentials.
- **Findings → issues mapping / verdict engine** (shipped, `v1-runs.ts`,
  `trails-runner.ts`) — the source of the gate signal.
- **Trail environments (KLA-93)** — the resolution path the preview-URL override
  extends.
- **Objective → authored-run** (separate epic) — a future enhancement could
  auto-author a Trail from a PR diff; explicitly out of scope here.
- **Public API docs / `/llms.txt`** (memory: `klavity_agent_docs`) — the Action
  + CLI usage must be added there as a single source to avoid drift.
