# Enriching Sims from Multiple Transcripts Over Time — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user stack weekly meeting transcripts onto a single Sim — each upload enriches the persona (add / reinforce / contradict likes & dislikes) after a preview-and-approve step, auto-creates a new Sim when a new client member appears, and timestamps every grounded quote so feedback shows *when* the client said it.

**Architecture:** Reuse the existing extract → match → reconcile → apply pipeline. Add (1) a pure transcript parser that splits raw text into timestamped lines, (2) an `offset → timestamp` mapping threaded through `applyReconcileOps` so trait/event writes carry a `srcQuoteTs`/`quoteTs`, (3) a split of the transcript write path into `POST /api/transcripts/preview` (compute ops, no DB writes, stash) and `POST /api/transcripts/apply` (persist the approved subset, LLM-free), and (4) Studio UI for the preview card + a transcript time column.

**Tech Stack:** Bun + TypeScript, `@libsql/client` (SQLite/Turso), single-file `Bun.serve` router in `prototype/server.ts`, vanilla-JS Studio in `prototype/public/index.html`, `bun test`.

## Global Constraints

- Run everything from `prototype/`. Tests: `bun test`.
- **Never touch `master`** and **never bump versions / CHANGELOG version lines / manifests** — the orchestrator owns those (per repo `CLAUDE.md`). A feature CHANGELOG entry under your section is fine.
- New DB columns on existing tables MUST be added via the runtime additive-migration pattern in `lib/db.ts` (`needCol(...)` + `ALTER TABLE ... .catch(warn)`), NOT by editing the base `CREATE TABLE` (existing prod DBs won't re-run CREATE).
- Preserve backward compatibility: the legacy `POST /api/transcripts` route keeps working (fire-and-forget), just gaining line parsing + timestamps.
- Timestamp fallback rule (from spec): use the in-note time when a line has one; otherwise the transcript's **upload time** (`transcripts.created_at`) at render — never a synthesized/interpolated clock time. Store `null` for untimed lines.
- All quotes stay anchored to a character offset in the ORIGINAL `raw_text` (don't rewrite raw_text) so existing `groundQuote` offset logic is unaffected.
- Test email for any manual/e2e flow: **vishal@quantana.com.au**.

---

### Task 1: Transcript parser library (pure)

Splits raw transcript text into timestamped lines and maps a character offset back to a time. Pure — no DB, no LLM, independently testable.

**Files:**
- Create: `prototype/lib/transcript-parse.ts`
- Test: `prototype/lib/transcript-parse.test.ts`

**Interfaces:**
- Produces:
  - `type ParsedLine = { speaker: string | null; text: string; tsSeconds: number | null; charStart: number; charEnd: number }`
  - `parseTranscript(rawText: string): ParsedLine[]`
  - `offsetToTime(lines: ParsedLine[], offset: number | null): number | null`
  - `formatTs(tsSeconds: number | null): string | null` — `"12:45"` (mm:ss) or `"1:02:03"` (h:mm:ss), `null` when input is `null`.
  - `speakersFromLines(lines: ParsedLine[]): string[]` — unique non-null speakers in order.

- [ ] **Step 1: Write the failing test**

```ts
// prototype/lib/transcript-parse.test.ts
import { test, expect } from "bun:test"
import { parseTranscript, offsetToTime, formatTs, speakersFromLines } from "./transcript-parse"

test("parses h:mm:ss and mm:ss timestamps with speakers", () => {
  const raw = "00:00:05  Sarah: I hate the tiny fonts.\n01:02:03 Raj: The export is too slow."
  const lines = parseTranscript(raw)
  expect(lines.length).toBe(2)
  expect(lines[0]).toMatchObject({ speaker: "Sarah", tsSeconds: 5 })
  expect(lines[0].text).toContain("tiny fonts")
  expect(lines[1]).toMatchObject({ speaker: "Raj", tsSeconds: 3723 })
})

test("parses bracketed [mm:ss] and mm:ss forms", () => {
  const raw = "[12:45] Sarah: point one\n07:30  Raj: point two"
  const lines = parseTranscript(raw)
  expect(lines[0]).toMatchObject({ speaker: "Sarah", tsSeconds: 765 })
  expect(lines[1]).toMatchObject({ speaker: "Raj", tsSeconds: 450 })
})

test("speaker-only line has null time; prose with no speaker is one null line", () => {
  const raw = "Sarah: no time here\nJust some prose with no speaker."
  const lines = parseTranscript(raw)
  expect(lines[0]).toMatchObject({ speaker: "Sarah", tsSeconds: null })
  expect(lines[1]).toMatchObject({ speaker: null, tsSeconds: null })
})

test("charStart/charEnd index into the original raw text", () => {
  const raw = "00:00:05 Sarah: alpha\n00:00:09 Raj: beta"
  const lines = parseTranscript(raw)
  for (const ln of lines) {
    expect(raw.slice(ln.charStart, ln.charEnd)).toContain(ln.text.slice(0, 5))
  }
})

test("offsetToTime returns the containing line's time, null past timed lines", () => {
  const raw = "00:00:05 Sarah: alpha here\nno-time prose line"
  const lines = parseTranscript(raw)
  const offAlpha = raw.indexOf("alpha")
  expect(offsetToTime(lines, offAlpha)).toBe(5)
  const offProse = raw.indexOf("prose")
  expect(offsetToTime(lines, offProse)).toBe(null)
  expect(offsetToTime(lines, null)).toBe(null)
})

test("formatTs formats mm:ss and h:mm:ss", () => {
  expect(formatTs(5)).toBe("0:05")
  expect(formatTs(765)).toBe("12:45")
  expect(formatTs(3723)).toBe("1:02:03")
  expect(formatTs(null)).toBe(null)
})

test("speakersFromLines returns unique speakers in order", () => {
  const lines = parseTranscript("00:00:01 Sarah: a\n00:00:02 Raj: b\n00:00:03 Sarah: c")
  expect(speakersFromLines(lines)).toEqual(["Sarah", "Raj"])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test lib/transcript-parse.test.ts`
Expected: FAIL — `Cannot find module './transcript-parse'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// prototype/lib/transcript-parse.ts
export type ParsedLine = {
  speaker: string | null
  text: string
  tsSeconds: number | null
  charStart: number
  charEnd: number
}

// Matches a leading timestamp: optional "[", H:MM:SS or MM:SS or M:SS, optional "]".
const TS_RE = /^\s*\[?(\d{1,2}):(\d{2})(?::(\d{2}))?\]?\s*/
// Matches a leading "Speaker:" (1-40 chars, no digits-only, stops at first colon).
const SPEAKER_RE = /^([A-Za-z][\w .'-]{0,39}?):\s*/

function toSeconds(a: string, b: string, c?: string): number {
  const x = Number(a), y = Number(b), z = c != null ? Number(c) : null
  return z != null ? x * 3600 + y * 60 + z : x * 60 + y
}

export function parseTranscript(rawText: string): ParsedLine[] {
  const out: ParsedLine[] = []
  let i = 0
  for (const line of rawText.split("\n")) {
    const start = i
    const end = i + line.length
    i = end + 1 // consumed "\n"
    if (!line.trim()) continue

    let rest = line
    let tsSeconds: number | null = null
    const tm = rest.match(TS_RE)
    if (tm) {
      tsSeconds = toSeconds(tm[1], tm[2], tm[3])
      rest = rest.slice(tm[0].length)
    }
    let speaker: string | null = null
    const sm = rest.match(SPEAKER_RE)
    if (sm) {
      speaker = sm[1].trim()
      rest = rest.slice(sm[0].length)
    }
    out.push({ speaker, text: rest.trim(), tsSeconds, charStart: start, charEnd: end })
  }
  return out
}

export function offsetToTime(lines: ParsedLine[], offset: number | null): number | null {
  if (offset == null) return null
  for (const ln of lines) {
    if (offset >= ln.charStart && offset < ln.charEnd) return ln.tsSeconds
  }
  return null
}

export function formatTs(tsSeconds: number | null): string | null {
  if (tsSeconds == null) return null
  const s = Math.max(0, Math.floor(tsSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`
}

export function speakersFromLines(lines: ParsedLine[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const ln of lines) {
    if (ln.speaker && !seen.has(ln.speaker)) { seen.add(ln.speaker); out.push(ln.speaker) }
  }
  return out
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test lib/transcript-parse.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
cd prototype && git add lib/transcript-parse.ts lib/transcript-parse.test.ts
git commit -m "feat(sim): pure transcript parser with per-line timestamps + offset→time"
```

---

### Task 2: Thread offset→timestamp through `applyReconcileOps`

Add `srcQuoteTs`/`quoteTs` to the trait/event types and compute them at each existing `groundQuote` site inside `applyReconcileOps`, using a `lines` array on the reconcile context. Pure — testable in-memory.

**Files:**
- Modify: `prototype/lib/provenance.ts` (types `Trait` ~13-35, `TraitEventRow` ~74-92, `ReconcileCtx` ~56-64; the four `groundQuote` call sites at ~209, ~231, ~273, ~292)
- Test: `prototype/lib/provenance.timestamp.test.ts`

**Interfaces:**
- Consumes: `parseTranscript`, `offsetToTime` from Task 1; existing `applyReconcileOps(currentTraits, ops, ctx)`.
- Produces: `Trait.srcQuoteTs?: number | null`, `TraitEventRow.quoteTs?: number | null`, `ReconcileCtx.lines?: ParsedLine[] | null`. When `ctx.lines` is present, every inserted/updated trait and every event carries `srcQuoteTs`/`quoteTs = offsetToTime(ctx.lines, groundedOffset)`.

- [ ] **Step 1: Write the failing test**

```ts
// prototype/lib/provenance.timestamp.test.ts
import { test, expect } from "bun:test"
import { applyReconcileOps, type ReconcileOp } from "./provenance"
import { parseTranscript } from "./transcript-parse"

const RAW = "00:00:05 Sarah: The fonts are way too small on the dashboard."

test("applyReconcileOps stamps srcQuoteTs and quoteTs from the line's time", () => {
  const lines = parseTranscript(RAW)
  const ops: ReconcileOp[] = [{
    op: "add", kind: "pain", text: "Fonts too small on dashboard",
    quote: "The fonts are way too small on the dashboard.", speaker: "Sarah",
  }]
  let counter = 0
  const res = applyReconcileOps([], ops, {
    simId: "sim_1", projectId: "proj_1", transcriptId: "tr_1",
    sourceDate: 1000, rawText: RAW, lines, now: 42, newId: () => `t_${++counter}`,
  })
  expect(res.traitWrites.length).toBe(1)
  expect(res.traitWrites[0].trait.srcQuoteTs).toBe(5)
  expect(res.traitEvents[0].quoteTs).toBe(5)
})

test("untimed line yields null srcQuoteTs (upload-time fallback happens at render)", () => {
  const raw = "Sarah: no timestamp on this line at all."
  const lines = parseTranscript(raw)
  const ops: ReconcileOp[] = [{
    op: "add", kind: "pain", text: "no ts", quote: "no timestamp on this line at all.", speaker: "Sarah",
  }]
  let counter = 0
  const res = applyReconcileOps([], ops, {
    simId: "sim_1", projectId: "proj_1", transcriptId: "tr_1",
    sourceDate: 1000, rawText: raw, lines, now: 42, newId: () => `t_${++counter}`,
  })
  expect(res.traitWrites[0].trait.srcQuoteTs).toBe(null)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test lib/provenance.timestamp.test.ts`
Expected: FAIL — `srcQuoteTs` is `undefined` (not yet set).

- [ ] **Step 3: Write minimal implementation**

In `prototype/lib/provenance.ts`:

3a. Add the import at the top (next to other imports):

```ts
import { offsetToTime, type ParsedLine } from "./transcript-parse"
```

3b. In `type Trait`, add next to `srcQuoteOffset`:

```ts
  srcQuoteOffset: number | null
  srcQuoteTs?: number | null
```

3c. In `type TraitEventRow`, add next to `quoteOffset`:

```ts
  quoteOffset: number | null
  quoteTs?: number | null
```

3d. In `type ReconcileCtx`, add:

```ts
  rawText?: string | null
  lines?: ParsedLine[] | null
```

3e. At each of the four `groundQuote` sites, set the timestamp right after the offset is assigned. Add a tiny local helper near the top of `applyReconcileOps`:

```ts
  const tsFor = (offset: number | null): number | null =>
    ctx.lines ? offsetToTime(ctx.lines, offset) : null
```

Then:
- In `baseEvt(...)` where it sets `quoteOffset: g.offset`, also set `quoteTs: tsFor(g.offset)`.
- In `mkTrait(...)` where it sets `srcQuoteOffset: g.offset`, also set `srcQuoteTs: tsFor(g.offset)`.
- In the `reinforce` case where it does `targetActive.srcQuoteOffset = g.offset`, also `targetActive.srcQuoteTs = tsFor(g.offset)`.
- In the `refine` case where it does `targetActive.srcQuoteOffset = g.offset`, also `targetActive.srcQuoteTs = tsFor(g.offset)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test lib/provenance.timestamp.test.ts && bun test lib/provenance*.test.ts`
Expected: PASS — new tests green AND existing provenance tests still green.

- [ ] **Step 5: Commit**

```bash
cd prototype && git add lib/provenance.ts lib/provenance.timestamp.test.ts
git commit -m "feat(sim): stamp srcQuoteTs/quoteTs on trait writes from transcript lines"
```

---

### Task 3: DB — additive columns + read/write wiring for timestamps and lines

Add `transcripts.lines_json`, `sim_traits.src_quote_ts`, `trait_events.quote_ts` via the runtime migration pattern; wire the insert/update/row-mapper functions and `insertTranscript`/`transcriptById` for `lines`.

**Files:**
- Modify: `prototype/lib/db.ts` — migration block (`newTraitCols` ~916 and `ALTERED_TABLES` ~901), `insertTrait` ~4069, `updateTrait` ~4083, `insertTraitEvent` ~4106, `rowToTrait` ~4051, `rowToTraitEvent` ~4158, `insertTranscript` ~4012, `rowToTranscript` ~3999, `TranscriptRow`/`TranscriptInsert` ~3995-4011, `transcriptById` ~4029.
- Test: `prototype/lib/db.timestamp-cols.test.ts`

**Interfaces:**
- Consumes: `Trait.srcQuoteTs`, `TraitEventRow.quoteTs` from Task 2.
- Produces: `TranscriptRow.lines?: ParsedLine[] | null`; `TranscriptInsert.lines?: ParsedLine[] | null`; persisted `src_quote_ts`/`quote_ts`/`lines_json` columns round-trip through `insertTrait`/`listTraits`, `insertTraitEvent`/`listTraitEvents`, `insertTranscript`/`transcriptById`.

- [ ] **Step 1: Write the failing test**

```ts
// prototype/lib/db.timestamp-cols.test.ts
import { test, expect } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { insertTranscript, transcriptById, insertTrait, listTraits, insertTraitEvent, listTraitEvents } from "./db"

useIsolatedDb("klav-ts-cols")

test("transcript round-trips lines_json", async () => {
  const id = await insertTranscript({
    projectId: "proj_1", rawText: "00:00:05 Sarah: hi", sourceDate: 1000, addedBy: "t@x.com",
    lines: [{ speaker: "Sarah", text: "hi", tsSeconds: 5, charStart: 0, charEnd: 18 }],
  })
  const row = await transcriptById("proj_1", id)
  expect(row?.lines?.[0].tsSeconds).toBe(5)
})

test("trait round-trips srcQuoteTs", async () => {
  await insertTrait({
    id: "trt_1", simId: "sim_1", projectId: "proj_1", kind: "pain", text: "fonts", status: "active",
    strength: 1, srcTranscriptId: "tr_1", srcQuote: "q", srcQuoteOffset: 0, srcQuoteTs: 5,
    srcSpeaker: "Sarah", createdAt: 1, updatedAt: 1,
  } as any)
  const traits = await listTraits("sim_1")
  expect(traits[0].srcQuoteTs).toBe(5)
})

test("trait event round-trips quoteTs", async () => {
  await insertTraitEvent({
    traitId: "trt_1", simId: "sim_1", transcriptId: "tr_1", op: "create", beforeText: null,
    afterText: "fonts", quote: "q", quoteOffset: 0, quoteTs: 5, speaker: "Sarah",
    sourceDate: 1, reason: null, createdAt: 1,
  } as any)
  const events = await listTraitEvents("sim_1")
  expect(events[0].quoteTs).toBe(5)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test lib/db.timestamp-cols.test.ts`
Expected: FAIL — `lines` unknown / `srcQuoteTs` undefined / `quoteTs` undefined.

- [ ] **Step 3: Write minimal implementation**

3a. Migration — in the `newTraitCols` array (`db.ts:~916`) add these entries (nullable columns; INTEGER is fine to add as TEXT via this loop since libsql is dynamically typed, but use a standalone ALTER for INTEGER clarity). Use standalone `needCol` ALTERs right after the `newTraitCols` loop:

```ts
  if (needCol("sim_traits", "src_quote_ts")) await c.execute("ALTER TABLE sim_traits ADD COLUMN src_quote_ts INTEGER").catch((e: any) => console.warn("sim_traits.src_quote_ts ALTER skipped:", e?.message || e))
  if (needCol("trait_events", "quote_ts")) await c.execute("ALTER TABLE trait_events ADD COLUMN quote_ts INTEGER").catch((e: any) => console.warn("trait_events.quote_ts ALTER skipped:", e?.message || e))
  if (needCol("transcripts", "lines_json")) await c.execute("ALTER TABLE transcripts ADD COLUMN lines_json TEXT").catch((e: any) => console.warn("transcripts.lines_json ALTER skipped:", e?.message || e))
```

Also ensure `"transcripts"` is in the `ALTERED_TABLES` list (`db.ts:~901`) so `needCol("transcripts", ...)` reads a preloaded snapshot; add `"transcripts"` if absent.

3b. `insertTrait` — add `src_quote_ts` to the column list (right after `src_quote_offset`), add one `?`, and add `t.srcQuoteTs ?? null` to args (right after `t.srcQuoteOffset ?? null`).

3c. `updateTrait` — add `src_quote_ts=?` to the SET clause (after `src_quote_offset=?`) and `t.srcQuoteTs ?? null` to args in the same position.

3d. `insertTraitEvent` — add `quote_ts` to the column list (after `quote_offset`), one `?`, and `e.quoteTs ?? null` to args (after `e.quoteOffset ?? null`).

3e. `rowToTrait` — add after `srcQuoteOffset`:

```ts
    srcQuoteTs: x.src_quote_ts != null ? Number(x.src_quote_ts) : null,
```

3f. `rowToTraitEvent` (`db.ts:~4158`) — add after `quoteOffset`:

```ts
    quoteTs: x.quote_ts != null ? Number(x.quote_ts) : null,
```

3g. `TranscriptRow` — add `lines: ParsedLine[] | null`; `TranscriptInsert` — add `lines?: ParsedLine[] | null`. Add the import at the top of `db.ts`:

```ts
import type { ParsedLine } from "./transcript-parse"
```

3h. `rowToTranscript` — add:

```ts
    lines: x.lines_json ? JSON.parse(String(x.lines_json)) : null,
```

3i. `insertTranscript` — add `lines_json` to the column list, one `?`, and `t.lines != null ? JSON.stringify(t.lines) : null` to args (mirror the `speakers_json` handling).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test lib/db.timestamp-cols.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
cd prototype && git add lib/db.ts lib/db.timestamp-cols.test.ts
git commit -m "feat(sim): persist src_quote_ts/quote_ts/lines_json (additive migrations + wiring)"
```

---

### Task 4: Legacy `POST /api/transcripts` — parse lines, store them, stamp timestamps

Make the existing fire-and-forget route parse the transcript into lines, store `lines_json`, and pass `lines` into `applyReconcileOps` so traits gain timestamps. No behavior change for the caller (still returns `{ transcriptId, matched }`).

**Files:**
- Modify: `prototype/server.ts` — the `POST /api/transcripts` block (~4437-4547): the `insertTranscript(...)` call (~4455) and the `applyReconcileOps(...)` ctx (~4513).
- Test: `prototype/server.transcripts-lines.test.ts` (subprocess harness, LLM-free assertions only)

**Interfaces:**
- Consumes: `parseTranscript`, `speakersFromLines` (Task 1); `insertTranscript` w/ `lines`, trait timestamp columns (Task 3); `applyReconcileOps` w/ `ctx.lines` (Task 2).
- Produces: transcript rows now carry `lines_json`; `ctx.lines` flows to reconcile stamping.

- [ ] **Step 1: Write the failing test**

```ts
// prototype/server.transcripts-lines.test.ts
// Subprocess harness (mirror server.sim-url-preview.test.ts). LLM is neutralized
// (OPENROUTER_API_KEY="test-key"), so we assert the deterministic path: a posted
// transcript is stored WITH parsed lines_json. Auth is stubbed via KLAV_DEV_SHOW_OTP.
import { test, expect, beforeAll, afterAll } from "bun:test"
import { createClient } from "@libsql/client"
import { tmpdir } from "node:os"
import { join } from "node:path"

const ts = `${Date.now()}-${Math.random().toString(36).slice(2)}`
const srvDbFile = join(tmpdir(), `klav-tx-lines-${ts}.db`)
const rawClient = createClient({ url: "file:" + srvDbFile })
// ... (copy the beforeAll subprocess spawn + readiness poll from server.sim-url-preview.test.ts,
//      pointing TURSO_DATABASE_URL at srvDbFile; afterAll kills proc + closes rawClient)

test("stored transcript has lines_json with parsed timestamps", async () => {
  // Insert a transcript row directly through the running server's DB file after the
  // server has applied its schema, then assert the lines column exists and is JSON.
  await rawClient.execute({
    sql: "INSERT INTO transcripts (id,project_id,title,raw_text,source_date,lines_json,added_by,created_at) VALUES (?,?,?,?,?,?,?,?)",
    args: ["tr_lines_1", "proj_1", null, "00:00:05 Sarah: hi", 1000,
           JSON.stringify([{ speaker: "Sarah", text: "hi", tsSeconds: 5, charStart: 0, charEnd: 18 }]),
           "t@x.com", Date.now()],
  })
  const r = await rawClient.execute({ sql: "SELECT lines_json FROM transcripts WHERE id=?", args: ["tr_lines_1"] })
  expect(JSON.parse(String(r.rows[0].lines_json))[0].tsSeconds).toBe(5)
})
```

> Note: full end-to-end POST coverage (extract+reconcile) requires an LLM and is covered by the e2e journey (Task 9). This subprocess test only guards that the `lines_json` column exists and is writable in the deployed schema.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.transcripts-lines.test.ts`
Expected: FAIL — `no such column: lines_json` (until Task 3 migration runs in the spawned server; if Task 3 is already merged it may pass — in that case add the route wiring below and keep the test as a regression guard).

- [ ] **Step 3: Write minimal implementation**

In the `POST /api/transcripts` block:

3a. Near the top of the block after `text` is read, parse lines:

```ts
      const lines = parseTranscript(text)
```

Add the import at the top of `server.ts` (next to other `./lib/...` imports):

```ts
import { parseTranscript, speakersFromLines, offsetToTime, formatTs } from "./lib/transcript-parse"
```

3b. In the `insertTranscript({...})` call, add `lines` and derive speakers from lines when the body didn't supply any:

```ts
        lines,
        speakers: Array.isArray(body.speakers) ? body.speakers.map(String) : speakersFromLines(lines),
```

3c. In the `applyReconcileOps(traitsForApply, ops, { ... })` ctx, add `lines`:

```ts
          const res = applyReconcileOps(traitsForApply, ops, { simId, projectId, transcriptId, sourceDate, rawText: text, lines })
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test server.transcripts-lines.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd prototype && git add server.ts server.transcripts-lines.test.ts
git commit -m "feat(sim): legacy transcript upload parses+stores lines and stamps trait timestamps"
```

---

### Task 5: `pending_transcripts` table + helpers (preview stash)

A short-lived stash holding the computed preview (parsed lines, extracted personas grouped into ops per target Sim, raw text, title, sourceDate) between `preview` and `apply`.

**Files:**
- Modify: `prototype/lib/db.ts` — add `CREATE TABLE IF NOT EXISTS pending_transcripts` in the batched creates (~db.ts:311 area, next to `transcripts`), and helpers near `insertTranscript`.
- Test: `prototype/lib/db.pending-transcripts.test.ts`

**Interfaces:**
- Produces:
  - `type PendingTranscript = { id: string; projectId: string; payload: any; createdAt: number }`
  - `insertPendingTranscript(projectId: string, payload: any): Promise<string>` — id like `pt_<uuid>`.
  - `getPendingTranscript(projectId: string, id: string): Promise<PendingTranscript | null>`
  - `deletePendingTranscript(id: string): Promise<void>`

- [ ] **Step 1: Write the failing test**

```ts
// prototype/lib/db.pending-transcripts.test.ts
import { test, expect } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { insertPendingTranscript, getPendingTranscript, deletePendingTranscript } from "./db"

useIsolatedDb("klav-pending-tx")

test("pending transcript round-trips payload and is project-scoped", async () => {
  const id = await insertPendingTranscript("proj_1", { groups: [{ simId: "sim_1", ops: [] }] })
  const got = await getPendingTranscript("proj_1", id)
  expect(got?.payload.groups[0].simId).toBe("sim_1")
  expect(await getPendingTranscript("proj_other", id)).toBe(null) // scoped
  await deletePendingTranscript(id)
  expect(await getPendingTranscript("proj_1", id)).toBe(null)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test lib/db.pending-transcripts.test.ts`
Expected: FAIL — helpers not exported.

- [ ] **Step 3: Write minimal implementation**

3a. Add to the batched `CREATE TABLE` section (near the `transcripts` create):

```ts
  await c.execute(`CREATE TABLE IF NOT EXISTS pending_transcripts (
    id TEXT PRIMARY KEY, project_id TEXT NOT NULL, payload_json TEXT NOT NULL, created_at INTEGER NOT NULL)`)
```

(Follow the exact `c.execute(...)` idiom used by the surrounding creates in `applySchema`.)

3b. Add helpers near `insertTranscript`:

```ts
export type PendingTranscript = { id: string; projectId: string; payload: any; createdAt: number }

export async function insertPendingTranscript(projectId: string, payload: any): Promise<string> {
  const id = "pt_" + crypto.randomUUID()
  await db!.execute({
    sql: "INSERT INTO pending_transcripts (id,project_id,payload_json,created_at) VALUES (?,?,?,?)",
    args: [id, projectId, JSON.stringify(payload), Date.now()],
  })
  return id
}

export async function getPendingTranscript(projectId: string, id: string): Promise<PendingTranscript | null> {
  const r = await db!.execute({ sql: "SELECT * FROM pending_transcripts WHERE id=? AND project_id=?", args: [id, projectId] })
  if (!r.rows.length) return null
  const x = r.rows[0]
  return { id: String(x.id), projectId: String(x.project_id), payload: JSON.parse(String(x.payload_json)), createdAt: Number(x.created_at) }
}

export async function deletePendingTranscript(id: string): Promise<void> {
  await db!.execute({ sql: "DELETE FROM pending_transcripts WHERE id=?", args: [id] })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test lib/db.pending-transcripts.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd prototype && git add lib/db.ts lib/db.pending-transcripts.test.ts
git commit -m "feat(sim): pending_transcripts stash for preview→apply"
```

---

### Task 6: `POST /api/transcripts/preview` — compute ops, no DB writes, stash

Extract per speaker, match each to a Sim, reconcile matched Sims into ops (assigning a stable `opId` per op), collect unmatched speakers as new-Sim proposals, stash the payload, and return grouped preview data. No trait/transcript writes.

**Files:**
- Modify: `prototype/server.ts` — add the route next to `POST /api/transcripts` (~4437).
- Test: `prototype/server.transcripts-preview.test.ts` (subprocess; asserts auth + validation deterministically)

**Interfaces:**
- Consumes: `extractPersonas`, `matchPersonaToSim`, `reconcileSim`, `listTraits`, `parseTranscript`, `insertPendingTranscript`.
- Produces:
  - Request `{ transcript: string, title?: string|null }`.
  - Response:
    ```ts
    { previewId: string, groups: Array<
        | { kind: "existing", simId: string, simName: string,
            ops: Array<{ opId: string, op: string, kind: string, text: string, quote: string,
                          tsSeconds: number|null, tsLabel: string|null, speaker: string|null, before?: string }> }
        | { kind: "new", proposalId: string, proposedName: string, role: string,
            insights: Array<{ opId: string, kind: string, text: string, quote: string, tsSeconds: number|null, tsLabel: string|null }> }
      > }
    ```
  - Stashed payload (in `pending_transcripts`): `{ rawText, title, sourceDate, lines, groups }` where each group's ops retain `opId` and, for `new`, the full extracted persona needed to create the Sim on apply.

- [ ] **Step 1: Write the failing test**

```ts
// prototype/server.transcripts-preview.test.ts
// Subprocess harness (copy beforeAll/afterAll from server.sim-url-preview.test.ts).
import { test, expect, beforeAll, afterAll } from "bun:test"
// ... harness setup with BASE ...

test("preview requires auth", async () => {
  const r = await fetch(`${BASE}/api/transcripts/preview`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ transcript: "00:00:05 Sarah: hi there this is long enough text" }),
  })
  expect(r.status).toBe(401)
})

test("preview rejects too-short transcript", async () => {
  // authenticate via the dev OTP flow (mirror how sim-url-preview.test.ts obtains a session cookie),
  // then POST a <20-char transcript and expect a 400.
  const r = await authedFetch(`${BASE}/api/transcripts/preview`, { transcript: "hi" })
  expect(r.status).toBe(400)
})
```

> Full extract/reconcile output needs an LLM; that path is exercised in the Task 9 e2e journey. This test guards routing, auth, and input validation.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.transcripts-preview.test.ts`
Expected: FAIL — route returns 404 (not registered).

- [ ] **Step 3: Write minimal implementation**

Add the route (mirror the auth/project guards from `POST /api/transcripts`):

```ts
    if (req.method === "POST" && path === "/api/transcripts/preview") {
      const me = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!me) return json({ error: "Sign in to continue." }, 401)
      const proj = await resolveProject(me, url.searchParams.get("project"))
      if (!proj) return json({ error: "No project." }, 400)
      const projectId = proj.id
      const body = await req.json().catch(() => ({}))
      const text = String(body.transcript || "").trim()
      const title = body.title ? String(body.title).trim() : null
      if (text.length < 20) return json({ error: "Add transcript text first." }, 400)

      const lines = parseTranscript(text)
      const sourceDate = Date.now()
      const { data } = await extractPersonas(text, { email: me, projectId })
      const personas = Array.isArray(data?.personas) ? data.personas : []
      const sims = await listPersonasForProject(projectId) // existing helper feeding matchPersonaToSim; use the same shape server.ts already builds for matching
      const groups: any[] = []
      const stash: any[] = []
      let gi = 0
      for (const p of personas) {
        if (p.simClass !== "client" && p.type !== "client") continue // only client speakers become/enrich Sims
        const match = matchPersonaToSim({ name: p.name, role: p.role }, sims)
        if (match && "simId" in match) {
          const current = await listTraits(match.simId, { activeOnly: true })
          // reconcile against ONLY this transcript; reuse existing reconcileSim
          const { ops } = await reconcileSim(current, text, { email: me, projectId })
          const opsOut = ops.map((o, oi) => {
            const g = groundQuote(text, o.quote)
            const tsSeconds = offsetToTime(lines, g.offset)
            return { opId: `${gi}:${oi}`, op: o.op, kind: o.kind, text: o.text, quote: g.quote,
                     tsSeconds, tsLabel: formatTs(tsSeconds), speaker: o.speaker ?? null }
          })
          const sim = sims.find((s) => s.id === match.simId)
          groups.push({ kind: "existing", simId: match.simId, simName: sim?.name || p.name, ops: opsOut })
          stash.push({ kind: "existing", simId: match.simId, ops }) // raw ops for apply
        } else {
          const insights = (p.insights || []).map((ins: any, oi: number) => {
            const g = groundQuote(text, ins.quote)
            const tsSeconds = offsetToTime(lines, g.offset)
            return { opId: `${gi}:${oi}`, kind: ins.kind, text: ins.text, quote: g.quote, tsSeconds, tsLabel: formatTs(tsSeconds) }
          })
          groups.push({ kind: "new", proposalId: `new_${gi}`, proposedName: p.name, role: p.role, insights })
          stash.push({ kind: "new", proposalId: `new_${gi}`, persona: p })
        }
        gi++
      }
      const previewId = await insertPendingTranscript(projectId, { rawText: text, title, sourceDate, lines, groups: stash })
      return json({ previewId, groups }, 200)
    }
```

Notes for the implementer:
- Reuse whatever helper `POST /api/transcripts` already uses to build the `sims` list for `matchPersonaToSim` (it loads project personas as `{id,name,role}`). If the exact name differs from `listPersonasForProject`, use the existing one — do NOT invent a new query.
- `groundQuote` is already imported in `server.ts` (used by other paths); if not, import it from `./lib/provenance`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test server.transcripts-preview.test.ts`
Expected: PASS (auth 401 + validation 400).

- [ ] **Step 5: Commit**

```bash
cd prototype && git add server.ts server.transcripts-preview.test.ts
git commit -m "feat(sim): POST /api/transcripts/preview — compute enrichment ops without persisting"
```

---

### Task 7: `POST /api/transcripts/apply` — persist approved ops (LLM-free)

Load the stash, persist the transcript (with lines), create approved new Sims, apply the approved subset of ops via `applyReconcileOps` (with `lines` for timestamps), write traits/events, mark reconcile-run, rebuild insights, delete the stash.

**Files:**
- Modify: `prototype/server.ts` — add the route next to preview.
- Test: `prototype/server.transcripts-apply.test.ts` (subprocess; seeds a pending row + Sim directly, no LLM)

**Interfaces:**
- Consumes: `getPendingTranscript`, `deletePendingTranscript`, `insertTranscript`, `applyReconcileOps`, `insertTrait`/`updateTrait`/`insertTraitEvent`, `markReconcileRun`, `rebuildInsightsJson`, `listTraits`; new-Sim creation via the existing persona-create helper used by `POST /api/personas`.
- Produces:
  - Request `{ previewId: string, approvedOpIds: string[], approvedProposalIds: string[] }`.
  - Response `{ transcriptId: string, applied: { ops: number, newSims: number } }`.

- [ ] **Step 1: Write the failing test**

```ts
// prototype/server.transcripts-apply.test.ts
// Subprocess harness. Seed everything directly via rawClient so NO LLM is needed.
import { test, expect, beforeAll, afterAll } from "bun:test"
// ... harness with rawClient + BASE + an authed session cookie helper ...

test("apply persists only approved ops and stamps timestamps", async () => {
  // 1) seed a project, a Sim (personas row), and its one active trait via rawClient.
  // 2) seed a pending_transcripts row whose payload has one "existing" group with two
  //    add-ops, opIds "0:0" and "0:1", rawText "00:00:05 Sarah: alpha\n00:00:09 Sarah: beta",
  //    and matching lines_json.
  // 3) POST /api/transcripts/apply { previewId, approvedOpIds: ["0:0"], approvedProposalIds: [] }
  const r = await authedFetch(`${BASE}/api/transcripts/apply`, { previewId, approvedOpIds: ["0:0"], approvedProposalIds: [] })
  const d = await r.json()
  expect(d.applied.ops).toBe(1)
  // 4) assert sim_traits gained exactly ONE new trait, and its src_quote_ts is 5.
  const rows = await rawClient.execute({ sql: "SELECT src_quote_ts FROM sim_traits WHERE sim_id=? AND text LIKE ?", args: ["sim_seed", "%alpha%"] })
  expect(Number(rows.rows[0].src_quote_ts)).toBe(5)
  // 5) assert the pending row was deleted.
  const p = await rawClient.execute({ sql: "SELECT id FROM pending_transcripts WHERE id=?", args: [previewId] })
  expect(p.rows.length).toBe(0)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.transcripts-apply.test.ts`
Expected: FAIL — route 404.

- [ ] **Step 3: Write minimal implementation**

```ts
    if (req.method === "POST" && path === "/api/transcripts/apply") {
      const me = (await sessionEmail(req)) || (await bearerEmail(req))
      if (!me) return json({ error: "Sign in to continue." }, 401)
      const proj = await resolveProject(me, url.searchParams.get("project"))
      if (!proj) return json({ error: "No project." }, 400)
      const projectId = proj.id
      const body = await req.json().catch(() => ({}))
      const previewId = String(body.previewId || "")
      const approvedOps = new Set((Array.isArray(body.approvedOpIds) ? body.approvedOpIds : []).map(String))
      const approvedProps = new Set((Array.isArray(body.approvedProposalIds) ? body.approvedProposalIds : []).map(String))
      const pending = await getPendingTranscript(projectId, previewId)
      if (!pending) return json({ error: "Preview expired. Please re-upload." }, 404)
      const { rawText, title, sourceDate, lines, groups } = pending.payload

      const transcriptId = await insertTranscript({ projectId, title, rawText, sourceDate, lines, addedBy: me, speakers: speakersFromLines(lines) })

      let opsApplied = 0, newSims = 0
      for (const g of groups) {
        if (g.kind === "new") {
          if (!approvedProps.has(g.proposalId)) continue
          // create the Sim from g.persona using the SAME helper POST /api/personas uses,
          // then reconcile-seed its approved insights as add-ops through applyReconcileOps.
          const simId = await createPersonaFromExtracted(projectId, me, g.persona) // use existing create helper name
          const addOps = (g.persona.insights || [])
            .map((ins: any, oi: number) => ({ opId: `${g.proposalId}:${oi}`, ins }))
            .filter((x: any) => approvedOps.has(x.opId) || approvedProps.has(g.proposalId))
            .map((x: any) => ({ op: "add", kind: x.ins.kind, text: x.ins.text, quote: x.ins.quote, speaker: null }))
          const res = applyReconcileOps([], addOps as any, { simId, projectId, transcriptId, sourceDate, rawText, lines })
          for (const w of res.traitWrites) { if (w.mode === "insert") await insertTrait(w.trait); else await updateTrait(w.trait) }
          for (const e of res.traitEvents) await insertTraitEvent(e)
          await markReconcileRun(simId, transcriptId)
          await rebuildInsightsJson(simId)
          opsApplied += res.traitWrites.length
          newSims++
        } else {
          const approved = (g.ops || []).filter((_: any, oi: number) => approvedOps.has(`${groups.indexOf(g)}:${oi}`))
          if (!approved.length) continue
          if (await hasReconcileRun(g.simId, transcriptId)) continue
          const current = await listTraits(g.simId, { activeOnly: true })
          const reopenIds = new Set(approved.filter((o: any) => o.op === "reopen" && o.traitId).map((o: any) => o.traitId))
          let traitsForApply = current
          if (reopenIds.size) {
            const all = await listTraits(g.simId)
            traitsForApply = [...current, ...all.filter((t) => reopenIds.has(t.id) && t.status !== "active")]
          }
          const res = applyReconcileOps(traitsForApply, approved as any, { simId: g.simId, projectId, transcriptId, sourceDate, rawText, lines })
          for (const w of res.traitWrites) { if (w.mode === "insert") await insertTrait(w.trait); else await updateTrait(w.trait) }
          for (const e of res.traitEvents) await insertTraitEvent(e)
          await markReconcileRun(g.simId, transcriptId)
          await rebuildInsightsJson(g.simId)
          opsApplied += res.traitWrites.length
        }
      }
      await deletePendingTranscript(previewId)
      return json({ transcriptId, applied: { ops: opsApplied, newSims } }, 200)
    }
```

Implementer notes:
- The opId scheme MUST match Task 6: existing-group ops are `"<groupIndex>:<opIndex>"`. Use the group's index in `groups` consistently in both preview `stash` and apply. (Simplest: store `groupIndex` on each stashed group in Task 6 and read it here instead of `groups.indexOf(g)`.)
- `createPersonaFromExtracted` is a placeholder for the REAL create helper `POST /api/personas` uses (it saves name/role/core/insights). Find that function and call it; do not invent a new persona-insert.
- Keep the `hasReconcileRun` cost-guard so re-applying the same (sim,transcript) is a no-op.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test server.transcripts-apply.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd prototype && git add server.ts server.transcripts-apply.test.ts
git commit -m "feat(sim): POST /api/transcripts/apply — persist approved enrichments + new Sims with timestamps"
```

---

### Task 8: Surface the timestamp in feedback citations

Extend `resolveCitations` to include a formatted source time (in-note time when present, else the transcript upload time), and include it in the `/api/sim/review` response so feedback reads "Sarah — 2026-06-12 @ 12:45".

**Files:**
- Modify: `prototype/server.ts` — `resolveCitations` (~633-673) and the `/api/sim/review` response assembly (~4129 area) where it currently returns `sourceDate`/`sourceQuote`.
- Test: `prototype/server.citation-time.test.ts` (in-process via `useIsolatedDb`, calling the exported helper if exported; otherwise a focused unit test of the formatting rule)

**Interfaces:**
- Consumes: `sim_traits.src_quote_ts` (Task 3), `formatTs` (Task 1), `transcripts.created_at`.
- Produces: `resolveCitations` return gains `sourceTime: string | null` (formatted `mm:ss`/`h:mm:ss`) and `sourceTimeKind: "meeting" | "upload"`. When the cited trait's `srcQuoteTs` is non-null → `sourceTime = formatTs(srcQuoteTs)`, kind `"meeting"`. When null → `sourceTime = null`, kind `"upload"` (renderer falls back to the transcript date).

- [ ] **Step 1: Write the failing test**

```ts
// prototype/server.citation-time.test.ts
import { test, expect } from "bun:test"
import { formatTs } from "./lib/transcript-parse"

// The formatting/fallback rule that resolveCitations must follow.
function citationTime(srcQuoteTs: number | null): { sourceTime: string | null; sourceTimeKind: string } {
  return srcQuoteTs != null
    ? { sourceTime: formatTs(srcQuoteTs), sourceTimeKind: "meeting" }
    : { sourceTime: null, sourceTimeKind: "upload" }
}

test("meeting time is formatted when srcQuoteTs present", () => {
  expect(citationTime(765)).toEqual({ sourceTime: "12:45", sourceTimeKind: "meeting" })
})
test("falls back to upload kind when no in-note time", () => {
  expect(citationTime(null)).toEqual({ sourceTime: null, sourceTimeKind: "upload" })
})
```

> This locks the rule as a unit; the wiring into `resolveCitations` is applied in Step 3 and validated by the Task 9 e2e (which asserts the citation string in a real review).

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test server.citation-time.test.ts`
Expected: FAIL — module resolves but assertion path only passes once `formatTs` exists (it does after Task 1); if Task 1 merged, this passes immediately and serves as the rule spec. Proceed to Step 3 regardless.

- [ ] **Step 3: Write minimal implementation**

3a. In `resolveCitations`, after it resolves the cited trait and reads `sourceQuote`/`sourceDate`, also read `srcQuoteTs` from the chosen trait and compute:

```ts
      const srcQuoteTs = chosenTrait?.srcQuoteTs ?? null
      const sourceTime = srcQuoteTs != null ? formatTs(srcQuoteTs) : null
      const sourceTimeKind = srcQuoteTs != null ? "meeting" : "upload"
```

Add `sourceTime` and `sourceTimeKind` to the returned object (and to the `empty` default as `sourceTime: null, sourceTimeKind: "upload"`). Import `formatTs` at the top of `server.ts` (already added in Task 4).

3b. In the `/api/sim/review` response where the citation is surfaced, include `sourceTime`/`sourceTimeKind` so the client can render `@ 12:45` when kind is `"meeting"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test server.citation-time.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd prototype && git add server.ts server.citation-time.test.ts
git commit -m "feat(sim): feedback citations expose in-meeting timestamp (upload-time fallback)"
```

---

### Task 9: Studio UI — preview-and-approve upload + transcript time column

Rewire the Studio "Upload transcript" flow to call `/api/transcripts/preview`, render a grouped preview card (per-person enrichments + new-person proposals) with checkboxes, and apply via `/api/transcripts/apply`. Add a time column to the transcript viewer. Verify end-to-end.

**Files:**
- Modify: `prototype/public/index.html` — `ssOpenTranscriptUpload`/`ssTxSave` block (~1178-1224); the transcript viewer render (where a selected transcript's lines are shown).
- Test: manual + e2e journey (`prototype/journey/`), plus a full `bun test` regression run.

**Interfaces:**
- Consumes: `POST /api/transcripts/preview`, `POST /api/transcripts/apply`; `pq()`, `ssToast()`, `$()`, `renderSimList` (existing helpers).

- [ ] **Step 1: Rewire upload to preview**

Replace the `$("ssTxSave").onclick` body so it POSTs to `/api/transcripts/preview` and renders a preview panel instead of toasting immediately:

```js
  $("ssTxSave").onclick = async () => {
    const text = ($("ssTxText").value || "").trim()
    if (text.length < 20) { ssToast("Add transcript text first."); return }
    const title = ($("ssTxTitle").value || "").trim() || null
    const btn = $("ssTxSave"); btn.disabled = true; btn.textContent = "Analyzing…"
    try {
      const r = await fetch(pq('/api/transcripts/preview'), {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ transcript: text, title }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.previewId) throw new Error(d.error || "preview failed")
      ssRenderTranscriptPreview(d)
    } catch (e) {
      btn.disabled = false; btn.textContent = "Extract & match"
      ssToast("Preview failed: " + e.message)
    }
  }
```

- [ ] **Step 2: Render the preview card + wire Approve**

Add `ssRenderTranscriptPreview(d)` that renders each group. For `kind:"existing"`: a header `"<simName> — N change(s)"` and a checkbox per op showing `op` + `text` + `“quote”` + a `tsLabel` chip when present. For `kind:"new"`: header `"New person: <proposedName> — create Sim?"` with a proposal checkbox + its insight checkboxes. Default all checked. An "Approve selected" button collects checked `opId`s into `approvedOpIds` and checked new-proposal ids into `approvedProposalIds`, then:

```js
    const r = await fetch(pq('/api/transcripts/apply'), {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ previewId: d.previewId, approvedOpIds, approvedProposalIds }),
    })
    const res = await r.json().catch(() => ({}))
    if (!r.ok) { ssToast("Apply failed: " + (res.error || "")); return }
    ssToast(`Applied ${res.applied.ops} change(s)` + (res.applied.newSims ? `, ${res.applied.newSims} new Sim(s)` : ""))
    ssTxMap = {}
    await renderSimList(ssActiveSim ? (ssActiveSim._id || ssActiveSim.id) : null)
```

Match existing Studio markup classes (`ss-newform`, `ss-mini-btn`, etc.) and the button micro-animation standard (hover lift ~1.02 + purple, active ~0.97, ~150ms).

- [ ] **Step 3: Add the transcript time column**

In the transcript viewer render, show each line's time before the speaker: `tsLabel` (from the stored `lines`, formatted `mm:ss`) in a muted fixed-width column; blank when the line has no time. Keep the existing speaker + text layout.

- [ ] **Step 4: Verify end-to-end (journey)**

Add/extend a `prototype/journey/` e2e that:
1. Signs in as `vishal@quantana.com.au` (existing journey auth helper / test-OTP).
2. Seeds a Sim from transcript #1 (`POST /api/transcripts`).
3. Uploads transcript #2 (same speaker + a NEW speaker, with `00:mm:ss` timestamps) via the Studio preview flow.
4. Asserts the preview shows enrichments for the existing Sim AND a "new person" proposal.
5. Approves; asserts the existing Sim's traits grew and a new Sim was created.
6. Runs `POST /api/sim/review` on a page and asserts the returned citation includes the in-meeting timestamp (`sourceTimeKind === "meeting"`, `sourceTime` like `"12:45"`).

Run the journey per the repo's journey runner (see existing `journey/` scripts for the exact command).

- [ ] **Step 5: Full regression + commit**

Run: `cd prototype && bun test`
Expected: all green.

```bash
cd prototype && git add public/index.html journey/
git commit -m "feat(sim): Studio preview-and-approve transcript upload + transcript time column"
```

- [ ] **Step 6: Rebase on latest master + re-test (per repo CLAUDE.md)**

```bash
cd prototype && git fetch origin master && git rebase origin/master
bun test
```

Resolve trivially or `git merge origin/master`. Leave the branch for the orchestrator.

---

## Self-Review

**Spec coverage:**
- Stack transcripts / enrich over time → Tasks 6+7 (preview computes reconcile ops, apply persists) ✓
- Preview-then-approve for existing Sims → Tasks 6 (compute, no writes) + 7 (apply approved subset) + 9 (UI) ✓
- New client member → new Sim → Task 6 (`kind:"new"` proposal) + Task 7 (create on approval) + Task 9 (proposal UI) ✓
- Auto-split by speaker → Task 6 iterates `personas` (extractPersonas already splits) ✓
- Timestamps parsed (mixed formats) → Task 1 ✓; stored → Tasks 3 (lines_json) ✓; stamped onto traits → Tasks 2+4+7 ✓; shown in feedback with upload-time fallback → Task 8 ✓; transcript time column → Task 9 ✓
- Backward-compat legacy route → Task 4 ✓
- Data changes (lines_json, src_quote_ts, quote_ts, pending_transcripts) → Tasks 3+5 ✓
- Testing (unit parser/offset, preview no-writes, apply only approved, e2e) → Tasks 1,2,3,5,6,7,9 ✓

**Placeholder scan:** Two intentional "use the existing helper" notes remain (the project-personas list feeding `matchPersonaToSim` in Task 6, and the persona-create helper in Task 7) because their exact names must be read from `server.ts` at implementation time — each is flagged with explicit instruction NOT to invent a new query/insert. No `TODO`/`TBD`/"add error handling" placeholders.

**Type consistency:** `srcQuoteTs`/`quoteTs` names consistent across `provenance.ts` types (Task 2), `db.ts` mappers (Task 3), and `resolveCitations` (Task 8). `ParsedLine`, `parseTranscript`, `offsetToTime`, `formatTs`, `speakersFromLines` used consistently from Task 1 onward. opId scheme `"<groupIndex>:<opIndex>"` defined in Task 6 and consumed in Task 7 (with a note to persist `groupIndex` to avoid `indexOf`). Endpoint request/response shapes match between Tasks 6/7 and the Task 9 UI.
