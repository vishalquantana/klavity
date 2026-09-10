# Generate test objectives / cases from requirements & design artifacts

_Autonomous-QA capability spec · checklist items 2,3 · 2026-09-11_

## Problem & user value

Today an AutoSim starts from a **single, hand-typed** natural-language objective
+ URL. `start_authored_run` (MCP) / `POST /api/v1/authored-runs` (REST) both take
exactly one `objective` string that a human must write
(`prototype/lib/mcp/tools.ts:112`, `prototype/lib/trails-author.ts:104`
`AuthorRequest.objective`). That is the bottleneck to "catch (nearly) all bugs":
coverage is capped by how many objectives a person bothers to type, and those
objectives drift from the actual requirement/design they are supposed to verify.

Every team already has the source of truth for *what the product should do* — Jira
/ Plane tickets, user stories, PRDs, Confluence pages, and Figma frames /
screenshots. Best-in-class competitors (Testsigma Copilot, QA.tech, BrowserStack's
Test Case Generator, Quash) turn those artifacts directly into structured test
cases with steps, preconditions, and **positive + negative + edge** scenarios.

This capability adds **input adapters** that read a requirement or design artifact,
derive **one or more** candidate objectives (each with an expected outcome and a
category), let the user review/accept them, and feed the accepted ones into our
**existing** authoring pipeline (`runAuthorNow` → `authorTrail` → crystallized
Trail). It does not replace the drive loop — it feeds it.

## Goals / Non-goals

**Goals**
- One artifact → N candidate objectives, each `{ title, objective_nl,
  expected_outcome, category (happy|negative|edge), precondition, source_ref }`.
- Adapters for: pasted text / user story; an issue pulled through an existing
  connector (Jira/Plane/GitHub/Linear); a PDF/doc; a screenshot/Figma frame (image);
  a Figma file URL.
- A review surface (candidate → accept/edit/reject); accept authors a **draft**
  Trail via the existing engine and stamps traceability back to the source.
- Traceability: every generated objective and every resulting Trail records which
  artifact + which line/frame it came from.
- Dedupe against existing Trails so re-running on the same ticket doesn't spam
  duplicates.
- Surfaces: MCP tool, REST route, wizard UI, and a "Generate AutoSims from this
  ticket" action on imported feedback.

**Non-goals**
- No new drive/verification loop — reuse `authorTrail`/`walkTrail` unchanged.
- Not building a full Figma design-diff engine (frames in → objectives out only).
- No auto-merge of generated tests to a schedule in phase 1 (accept is explicit).
- Not changing pricing/metering semantics (generation is a metered AI call like
  any other, logged to the existing `ai_calls` ledger).

## Competitor benchmark (concrete mechanics)

- **Testsigma Copilot** — NLP parses user stories, PRDs, Figma flows, screenshots
  and user-journey videos; emits plain-English test cases with **preconditions,
  detailed steps, and both positive and negative scenarios**. Figma integration:
  connect account, select frames, "generate multiple test cases with a click". Also
  generates from a Swagger schema. (testsigma.com/docs/atto/generative-ai/…)
- **QA.tech / BrowserStack Test Case Generator / TestCollab** — accept Jira story +
  description + **acceptance criteria**, plus PRD (PDF/TXT/XLSX/PPT), Confluence,
  Figma, images. Emphasis on: **operate as a reasoning loop, not a zero-shot
  button**; **context-aware** (pull related requirements + existing test repo);
  **coverage/gap analysis** vs what's already tested; and **auto-link each accepted
  case back to the source Jira issue** for a live traceability matrix.
- **Figma Make AI test generator** — describe a feature in NL → structures user
  stories, acceptance criteria, edge cases; multi-step journey tests; explicit
  "What could go wrong?" prompt to enumerate error/permission edge states; prompts
  re-run when the design changes so tests stay aligned.

Takeaways we adopt: (1) multi-format adapters behind one derive step; (2) always
emit positive **and** negative/edge candidates; (3) source→test traceability as a
first-class field; (4) dedupe/coverage against existing Trails; (5) review-before-
author, not silent creation.

## Current state in our codebase

- **Authoring engine (reuse as-is).** `authorTrail(projectId, req: AuthorRequest, …)`
  drives an NL objective to a crystallized Trail with verification
  (`prototype/lib/trails-author.ts:273`). Entry point `runAuthorNow(projectId, req,
  deps)` handles snap-gating, the global author slot, session row, live-watch,
  checkpoint/resume (`prototype/lib/trails-author.ts:1471`). `AuthorRequest` =
  `{ name, objective, baseUrl, viewport?, testAccountName?, judgePersonaId?, … }`
  (`prototype/lib/trails-author.ts:104`).
- **Existing single-objective surfaces.** MCP `start_authored_run`
  (`prototype/lib/mcp/tools.ts:112`) and REST `/api/v1/authored-runs`
  (`prototype/lib/openapi.ts:213`, server route + tests in
  `prototype/server.v1-authored.test.ts`). Both accept exactly one `objective`.
- **Trail model & table.** `Trail` (`prototype/lib/trails-types.ts:46`) already has a
  precedent for provenance: `sourceSimId` ("converted from Sim"). `createTrail`
  (`prototype/lib/trails.ts:41`) + `trails` DDL (`prototype/lib/db.ts:559`).
- **Connector issue ingestion (partial, reuse).** `makeImportExternalIssues`
  (`prototype/lib/connectors/import.ts:123`) already lists issues from a configured
  connector via `adapter.listIssues(cfg,{limit})`, decrypts secrets, dedupes by
  `externalKey`, and creates a **feedback ticket** per issue. It does **not** derive
  test objectives — that's the gap. Connector adapters + config/secret decrypt live
  under `prototype/lib/connectors/`.
- **Image→structured-LLM path (reuse for design artifacts).** `openRouterVisionResolver`
  / `configuredVisionResolver` + `buildVisionMessages`
  (`prototype/lib/trails-vision.ts:98,104`) already send a screenshot + prompt to an
  OpenRouter vision model, reserve/reconcile AI spend, and log an `ai_calls` row.
  `/api/persona/site` is our SSRF-guarded "scan a URL, return structured JSON"
  precedent.
- **LLM call + spend pattern.** `openRouterAuthorModel` / `openRouterObjectiveVerifier`
  (`prototype/lib/trails-author-model.ts:182,323`) show the house style: build
  messages, call OpenRouter, `parse*` the JSON reply, record cost/failure. New
  derive calls follow this exactly.
- **Attachments/S3.** `AuthorRequest.attachments` + `shotUploader`/`defaultShotUploader`
  give us the S3 upload seam for uploaded PDFs/screenshots.

Nothing today turns an artifact into multiple objectives; this is net-new glue on
top of the above.

## Proposed architecture

New module dir `prototype/lib/test-gen/`.

### 1. Core derive step (LLM), format-agnostic
`test-gen/derive.ts`:
```ts
export interface CandidateObjective {
  title: string
  objectiveNl: string          // feeds AuthorRequest.objective
  expectedOutcome: string      // "expected result" for the reviewer + verifier hint
  category: "happy" | "negative" | "edge"
  precondition: string | null
  sourceRef: SourceRef         // {kind, ref, url?, locator?} — e.g. line no / figma node id
  confidence: number
}
export type DeriveResult = { candidates: CandidateObjective[]; coverageNote: string }
export async function deriveObjectives(
  input: { artifactText: string; images?: {b64:string; mediaType:string}[]; baseUrlHint?: string; existingTrailTitles?: string[] },
  ctx: { projectId: string; email?: string|null },
): Promise<DeriveResult>
```
Implementation mirrors `openRouterObjectiveVerifier`: `buildDeriveMessages()` (system
prompt demanding positive+negative+edge, JSON-only, "return [] if nothing testable"),
OpenRouter call via the same client, `parseDeriveResult()` (reject non-JSON → `[]`,
never throw), reserve/reconcile spend + `ai_calls` row. `existingTrailTitles` is
passed so the model is told to skip already-covered flows (cheap coverage nudge).
Images use the vision-capable model path from `trails-vision.ts`.

### 2. Input adapters (artifact → {text, images})
`test-gen/adapters.ts` — each returns a normalized `ArtifactBundle {text, images[], sourceRef}`:
- `fromText(text)` — pasted user story / PRD snippet.
- `fromExternalIssue(projectId, connectorId, externalKey)` — add a
  `getIssue(cfg, key)` method to the connector adapter interface (sibling to the
  existing `listIssues`); reuse the decrypt-secrets logic factored out of
  `makeImportExternalIssues`. Title + body + acceptance-criteria → text.
- `fromDocument(fileRef)` — PDF/DOCX/XLSX → text. PDF via a lightweight extractor
  (e.g. `pdf-parse`/`unpdf`); scanned PDFs fall back to rendering pages as images →
  `images[]`.
- `fromImage(fileRef|b64)` — screenshot / exported Figma frame → `images[]`
  (verbatim to the vision model).
- `fromFigma(projectId, figmaUrl)` — parse file key + node id, call Figma REST
  `GET /v1/images/:key?ids=…` (PAT from a new `figma` connector row) → rendered PNG →
  `fromImage`. SSRF/host allowlist reuses the `/api/persona/site` guard pattern.

### 3. Orchestration + persistence
`test-gen/generate.ts`:
```ts
generateObjectives(projectId, source, opts): Promise<{ batchId; candidates: StoredObjective[] }>
acceptObjective(projectId, objectiveId, { baseUrl, autoAuthor }): Promise<{ trailId?, authoredRunId? }>
```
`generateObjectives` = pick adapter → bundle → `deriveObjectives` → persist a
`test_gen_batch` + one `generated_objective` row per candidate (status `candidate`),
with dedupe (skip a candidate whose `dedupe_hash` matches an existing objective or a
`normalize(trail.name/intent)`). `acceptObjective` marks the row `accepted` and calls
the **existing** `runAuthorNow(projectId, { name, objective: objectiveNl, baseUrl })`,
then writes the returned `authored_run_id` and (on crystallize) `trail_id` back onto
the row, and stamps `trails.source_objective_id`. Snap-gate is already enforced
inside `runAuthorNow` — no bypass.

### 4. Traceability
Add `source_objective_id` to `trails` (mirrors `sourceSimId` in
`trails-types.ts:46` / `createTrail` / DDL). A crystallized Trail therefore points
back to the requirement it verifies; the objective row points forward to the Trail
and its runs. The verifier already receives the objective (`ObjectiveVerificationInput`)
— we additionally pass `expected_outcome` as the pass/fail rubric.

## Data-model changes (`prototype/lib/db.ts` `applySchema`)

```sql
CREATE TABLE IF NOT EXISTS test_gen_batches (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL,
  source_kind TEXT NOT NULL,            -- text|jira|plane|github|linear|pdf|figma|screenshot
  source_ref TEXT, source_url TEXT,
  model TEXT, cost_usd REAL NOT NULL DEFAULT 0,
  coverage_note TEXT, candidate_count INTEGER NOT NULL DEFAULT 0,
  created_by TEXT, created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS tgb_proj_idx ON test_gen_batches(project_id, created_at);

CREATE TABLE IF NOT EXISTS generated_objectives (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, batch_id TEXT NOT NULL,
  title TEXT NOT NULL, objective_nl TEXT NOT NULL,
  expected_outcome TEXT, category TEXT NOT NULL DEFAULT 'happy',
  precondition TEXT, source_ref TEXT, source_url TEXT,
  status TEXT NOT NULL DEFAULT 'candidate',   -- candidate|accepted|rejected|authored
  dedupe_hash TEXT, confidence REAL,
  trail_id TEXT, authored_run_id TEXT,
  created_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS gobj_proj_idx ON generated_objectives(project_id, status);
CREATE INDEX IF NOT EXISTS gobj_batch_idx ON generated_objectives(batch_id);
```
Plus: `ALTER TABLE trails ADD COLUMN source_objective_id TEXT` (idempotent add in
`applySchema`, matching how existing nullable columns were introduced), threaded
through `rowToTrail`/`createTrail`/`Trajectory`. Figma PAT stored as a new connector
`type: "figma"` row (existing connectors table + secret encryption) — no new table.

## API / MCP / CLI surface

- **MCP** (`prototype/lib/mcp/tools.ts`, register beside `start_authored_run`):
  - `generate_test_objectives` — input `{ project_id, source: { kind, text?|issue_key?|
    connector_id?|figma_url?|image_ref?|doc_ref? }, base_url?, auto_author? }` → returns
    `{ batch_id, candidates:[{id,title,objective,expected_outcome,category}] }` (and
    `authored_run_id`s when `auto_author`).
  - `list_generated_objectives` / `accept_generated_objective` (accept → authors).
- **REST** (add to `prototype/lib/openapi.ts` + server route, tested like
  `server.v1-authored.test.ts`):
  - `POST /api/v1/test-objectives:generate`
  - `GET  /api/test-objectives?project=…&status=candidate`
  - `POST /api/test-objectives/:id/accept`  (body `{ base_url }`)
  - `POST /api/test-objectives/:id/reject`
- **CLI/script**: `prototype/scripts/gen-objectives.ts` (paste text/file → print
  candidates) for dogfood + bench, mirroring `scripts/smoke-vision.ts`.

## UX / reporting

- **AutoSim wizard — new first step "Start from a requirement".** Tabs: Paste text ·
  Pick a connector issue · Upload PDF/screenshot · Figma URL. On submit → spinner →
  a **candidate review table**: columns Title · Category badge (green/amber/edge) ·
  Expected outcome · Precondition · Source chip (links to Jira/Plane/Figma). Each row
  has Accept / Edit / Reject. "Accept all happy-path", bulk actions, and a coverage
  banner ("6 candidates: 3 happy, 2 negative, 1 edge · 1 skipped as duplicate of
  Trail 'Checkout'"). Accept → row shows the authoring live-watch (reuses existing
  author session live channel).
- **Feedback ticket action.** On an imported issue (source `import:*`), a "Generate
  AutoSims from this ticket" button → same review table pre-seeded from that ticket.
- **Trail detail.** A "Derived from" chip linking to the source artifact
  (`source_objective_id` → `generated_objectives.source_url`), giving the live
  traceability matrix competitors advertise.

## Acceptance criteria

- Given a Jira/Plane issue with a description + acceptance criteria, `generate_test_objectives`
  returns ≥1 candidate whose `objective_nl` is executable by `authorTrail` and at
  least one `negative`/`edge` candidate when the text implies error paths.
- Accepting a candidate creates a **draft** Trail via `runAuthorNow` with
  `trails.source_objective_id` set, and the objective row transitions
  candidate→accepted→authored with `trail_id`/`authored_run_id` populated.
- Re-generating from the same artifact does not create duplicate candidates for a
  flow already covered by an existing Trail (dedupe by `dedupe_hash`).
- A screenshot/Figma frame produces candidates via the vision path and logs an
  `ai_calls` row with non-zero cost.
- Snap-locked projects cannot author from a candidate (the existing
  `projectEntitlement(...).snapOnly` throw in `runAuthorNow` fires).
- OpenAPI drift test stays green after adding the new paths.

## Test plan (incl. negative control)

- **Unit (pure, mock the model):** `parseDeriveResult` handles valid JSON, extra
  prose, and garbage (→ `[]`, never throws). `deriveObjectives` with an injected fake
  model asserts positive+negative+edge split and source-ref threading. Dedupe:
  candidate matching an existing trail title is dropped.
- **Adapter unit:** `fromExternalIssue` with a fake connector `getIssue`; `fromFigma`
  URL parse + host-guard (reject non-figma host — SSRF negative control).
- **Route/MCP (subprocess harness like `server.v1-authored.test.ts`):** generate →
  list → accept → assert a draft trail + `source_objective_id`; IDOR (accept an
  objective from another project → 404/denied).
- **Negative controls (must fail without the feature / must NOT hallucinate):**
  1. Feed an artifact with **no testable behavior** (e.g. a marketing paragraph) →
     `candidates == []` and coverage note says so; the pipeline must not invent
     objectives.
  2. Feed **two different** tickets → the generated objectives must differ (guard
     against a cached/echoed prompt); assert objective text is grounded in each
     ticket's tokens.
  3. Accept must actually invoke `runAuthorNow` (spy) — a green "authored" status
     with no author session row is a fail (mirrors the "green test ≠ proof" memory
     lesson).
- **E2E dogfood:** generate from a real Plane KLAVITYKLA issue → accept → Trail
  crystallizes green against klavity.in. Test email `vishal@quantana.com.au`.

## Phasing

- **Phase 1 (foundation, ships first):** `deriveObjectives` + `fromText` +
  `fromExternalIssue` adapters, `test_gen_batches`/`generated_objectives` tables +
  `trails.source_objective_id`, MCP `generate_test_objectives` + `accept_generated_objective`,
  REST generate/list/accept, minimal review UI in the wizard, dedupe. This alone
  covers the highest-value input (tickets/user stories).
- **Phase 2:** image + PDF adapters (`fromImage`/`fromDocument` on the vision path)
  and the Figma connector (`fromFigma`), plus screenshot upload in the wizard.
- **Phase 3:** coverage/gap analysis against existing Trails + the expectations
  spine, `auto_author` mode (author top-N happy-path automatically), and scheduled
  re-generation when a linked ticket changes (hook into connector sync).

## Effort estimate

- Phase 1: **L** (~4–6 dev-days: derive core + 2 adapters + tables + MCP/REST +
  wizard review table + tests).
- Phase 2: **M** (vision/PDF adapters reuse existing paths; Figma connector is the
  new surface).
- Phase 3: **M**. Total capability ≈ **L/XL**.

## Risks & open questions

- **Objective quality / hallucination** — an ungrounded objective wastes an author
  drive (real $). Mitigate with the "return [] if nothing testable" contract,
  confidence scores, review-before-author default, and negative control #1.
- **Cost** — derive is one LLM call per artifact (image calls pricier). Log to
  `ai_calls`, respect the daily budget fail-closed like `openRouterVisionResolver`.
- **base_url ambiguity** — a PRD rarely names a URL. Require `base_url` at accept
  time (wizard field / connector project default); don't guess.
- **Figma auth** — needs a PAT/connector; scope to read-only, encrypt like other
  connector secrets. SSRF guard on image fetch.
- **PDF extraction dependency** — pick a Bun-compatible extractor; scanned PDFs need
  the image fallback (verify under Bun, per the "real integration test" memory).
- Open: should accepted candidates auto-schedule a recurring walk, or stay one-shot
  drafts until a human sets a cron? (Deferred to Phase 3.)

## Dependencies on other capabilities

- **Objective verification / expected-outcome grounding** — Phase 3 coverage
  analysis leans on the expectations spine.
- **Connector framework** — `fromExternalIssue` needs a `getIssue` method added to
  the connector adapter contract (small extension of `prototype/lib/connectors/`).
- Reuses (no new build): `authorTrail`/`runAuthorNow`, `trails-vision`, `ai_calls`
  ledger, S3 shot uploader, connectors secret-decrypt.
