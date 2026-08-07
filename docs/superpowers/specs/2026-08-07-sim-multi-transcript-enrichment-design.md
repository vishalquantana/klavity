# Enriching Sims from multiple transcripts over time

**Date:** 2026-08-07
**Branch:** `feat/sim-transcripts`
**Status:** Design — approved for planning

## Problem

A client relationship spans many meetings. Different client team members say
different things across a weekly cadence. Today a Sim is effectively born from a
single call and its likes/dislikes are frozen at extraction time. We want:

1. **Stack transcripts onto one Sim over time.** Upload week 2's meeting minutes
   and have Sarah's persona *enrich* — new likes/dislikes added, existing ones
   reinforced, reversals recorded — instead of creating a duplicate Sim.
2. **New people join.** If a transcript introduces a client member we've never
   seen, offer to create a new Sim for them (same upload flow).
3. **Human-in-the-loop merge.** When adding to an existing Sim, *preview* the
   proposed changes and approve before anything is written.
4. **Timestamped provenance.** When a Sim gives feedback, show *when* the client
   said the thing that grounds it — the in-meeting time from the notes if
   present, otherwise the transcript's upload time — and link back to that line.

## What already exists (build ON this, don't rebuild)

The reconcile pipeline is already implemented server-side:

- `POST /api/transcripts` (`prototype/server.ts:4437`) → `extractPersonas`
  (`server.ts:473`) splits a transcript into one persona per client speaker →
  `matchPersonaToSim` (`server.ts:603`) name-matches to an existing Sim →
  `reconcileSim` (`server.ts:552`, prompt `RECONCILE_SYS` at `:316`) emits
  minimal ops → `applyReconcileOps` (**pure**, `prototype/lib/provenance.ts:187`)
  → persisted to `sim_traits` + append-only `trait_events`
  (`prototype/lib/db.ts:316-329`), cost-guarded by `reconcile_runs`
  (`db.ts:332`).
- Quotes are grounded to a **character offset** in `raw_text` via `groundQuote`
  (`provenance.ts:142`).
- Feedback already cites the source quote/speaker/date via `resolveCitations`
  (`server.ts:633`) in `POST /api/sim/review` (`server.ts:4129`).

The gaps this spec fills: (a) the append path applies immediately with no
preview, (b) there are no per-line timestamps anywhere — only a whole-transcript
`source_date`, (c) the live Studio upload (`prototype/public/index.html`, route
`/app`) posts and shows only a toast.

## Design

### A. Transcript timestamp parsing

New module `prototype/lib/transcript-parse.ts`:

- `parseTranscript(rawText): ParsedLine[]` where
  `ParsedLine = { speaker: string|null, text: string, tsSeconds: number|null,
  charStart: number, charEnd: number }`.
- Recognises common exported formats, in priority order:
  - `00:12:45  Sarah:` and `01:02:03` (h:mm:ss)
  - `[00:12:45] Sarah:` / `[12:45]` bracketed
  - `12:45  Sarah:` (mm:ss)
  - Speaker-only `Sarah:` with no time → `tsSeconds: null`
  - Free prose / no speaker → one line, `tsSeconds: null`
- `charStart`/`charEnd` are offsets into the ORIGINAL `raw_text` so existing
  offset-based grounding keeps working unchanged.
- Persisted as `transcripts.lines_json` at upload time.

**Offset → time resolution.** `offsetToTime(lines, offset): number|null` returns
the `tsSeconds` of the line containing a character offset. Used to stamp any
grounded quote. **Fallback when a line has no in-note time: use the transcript's
upload time** (`transcripts.created_at`) — never a synthesized/interpolated
clock time. Feedback formats as `mm:ss` (or `h:mm:ss`) when an in-meeting time
exists, else "(uploaded <date>)".

### B. Preview → approve → apply (enriching existing Sims)

Split the write path in two. Reuse the whole existing extract/match/reconcile
chain; only defer persistence.

1. `POST /api/transcripts/preview` — body `{ transcript, title }`.
   - Parses lines, extracts personas (auto-split by speaker), matches each to an
     existing Sim.
   - For **matched** speakers: runs `reconcileSim` and returns the proposed ops
     WITHOUT calling `applyReconcileOps` / touching the DB.
   - For **unmatched** speakers (new client member): returns a
     `newSim` proposal (name/role/initial insights) — not yet created.
   - Stashes everything (parsed lines, extracted personas, per-Sim ops, raw
     text, title) in a short-lived **`pending_transcripts`** row keyed by a
     `previewId` (LLM output isn't deterministically re-derivable, so we stash
     rather than recompute). TTL cleanup on read/expiry.
   - Response shape (grouped for the UI):
     ```
     { previewId,
       groups: [
         { simId, simName, kind: "existing",
           ops: [{ opId, op, kind, text, before?, quote, tsSeconds, speaker }] },
         { kind: "new", proposedName, role, insights: [...] }
       ] }
     ```
2. `POST /api/transcripts/apply` — body
   `{ previewId, approvedOpIds: [...], approvedNewSims: [...] }`.
   - Loads the pending row, filters ops to the approved subset, then:
     persists the transcript row (with `lines_json`), creates approved new Sims,
     applies approved ops via `applyReconcileOps`, writes `trait_events`, records
     `reconcile_runs`, and stamps `src_quote_ts` on each affected trait via
     `offsetToTime`.
   - Deletes the pending row. Returns `{ transcriptId, applied: {...} }`.

`POST /api/transcripts` (legacy, fire-and-forget) is kept for backward compat /
the sim-profile attach path, but now also parses + stores `lines_json` and
stamps timestamps.

**New-Sim rule:** brand-new Sims created from a *first-ever* transcript on the
legacy path auto-create with no gate. In the preview flow, a new person is a
proposal the user approves in the same panel as the enrichments.

### C. Timestamped provenance in feedback

- Add nullable `src_quote_ts` to `sim_traits` and `quote_ts` to `trait_events`
  (seconds; NULL = no in-note time, fall back to upload time at render).
- `resolveCitations` (`server.ts:633`) gains `sourceTime` (formatted) +
  `sourceLineOffset` so `/api/sim/review` feedback reads
  `"Sarah — weekly sync 2026-06-12 @ 12:45"` and can deep-link to the line.

### D. UI (Sim Studio, `prototype/public/index.html`, route `/app`)

- The existing **"+ Upload"** transcript button (`index.html:1083`) now calls
  `/api/transcripts/preview` and renders a **preview card** grouped by person:
  per group a header ("Sarah — 2 new dislikes · 1 reinforced · 1 changed her
  mind" / "New person: Raj — create Sim?") and a checklist of proposed items
  (default checked), each showing the grounding quote + time. Buttons:
  **Approve selected** → `/api/transcripts/apply`; **Cancel**.
- The transcript viewer gains a **time column** (`mm:ss`, blank when untimed).
- Feedback/citation UI shows the timestamp and links to the transcript line.

Follow existing Studio render/fetch idioms (`renderStudio`, `pq()` helper,
`ssToast`). Keep new markup consistent with current Studio styling and the
button micro-animation standard.

## Data changes

| Table | Change |
|-------|--------|
| `transcripts` | + `lines_json TEXT` (parsed timestamped lines) |
| `sim_traits` | + `src_quote_ts INTEGER NULL` (seconds into meeting) |
| `trait_events` | + `quote_ts INTEGER NULL` |
| `pending_transcripts` (new) | `id`, `project_id`, `payload_json` (lines+personas+ops+raw+title), `created_at`; short TTL |

All additive; migrations follow the existing `CREATE TABLE IF NOT EXISTS` /
`ALTER TABLE` pattern in `db.ts`.

## Components (isolated units)

- `transcript-parse.ts` — pure: raw text → timestamped lines; offset→time. No
  DB, no LLM. Independently unit-testable.
- Preview/apply endpoints — orchestration only; reuse existing extract/match/
  reconcile/apply functions.
- Citation timestamp resolution — extends `resolveCitations`, pure mapping.

## Testing

**Unit (`bun test`, `prototype/`):**
- `transcript-parse`: each format (h:mm:ss, [mm:ss], mm:ss, speaker-only,
  untimed prose); `charStart/charEnd` line up with `raw_text`; `offsetToTime`
  returns the containing line's time and `null` past the last timed line.
- Preview returns ops with **zero DB writes** (assert tables unchanged).
- Apply persists ONLY approved ops; unapproved ops leave no trait/event;
  `src_quote_ts` stamped correctly (in-note time vs upload-time fallback).
- New-person proposal creates a Sim only when approved.

**E2e (`journey/`):** seed a Sim from transcript #1 → upload transcript #2 (same
speaker + a new speaker) → preview shows enrichments + new-person proposal →
approve → traits grow, new Sim created → run `/api/sim/review` → citation shows
the in-meeting timestamp and links to the line.

## Out of scope (YAGNI)

- Editing/adjusting parsed timestamps by hand.
- Interpolating times for untimed lines beyond the upload-time fallback.
- Reconciling more than one new transcript in a single preview batch (upload one
  at a time; the weekly cadence is naturally one-per-week).
- Speaker-identity disambiguation beyond existing name matching (ambiguous
  matches still flow to the existing `pending_sim_matches` queue).
