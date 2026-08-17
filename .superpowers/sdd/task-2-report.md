# Task 2 report — client-error-ticket.ts

Status: DONE

Commit: a219877b "feat(errors): client-error fingerprint + create/bump/mask recorder"

## What was built

- `prototype/lib/client-error-ticket.ts`: `ClientError` type, `clientErrorSignature(projectId, e)`
  (sha256hex over [projectId, kind, normalized message, normalized pathname, normalized top
  stack frame, selector], truncated to 32 hex chars), `severityFor(e)` (error/unhandledrejection
  → high; network with status>=500 or status===0 → medium, else low; console.error → low),
  and `recordClientError(projectId, e, ctx, opts?)` which:
  - computes signature, looks up `findFeedbackBySignature`
  - if found: `bumpFeedbackRecurrence(id, atMs)`, returns `{ id, created: false }`
  - if not found and `opts.overCap`: returns `{ id: "", created: false }` (drop, caller logs)
  - else: masks message via `maskPii`, masks `ctx` via `maskDeep`, calls `insertFeedback` with
    `source: "auto-error"`, `signature`, derived `urlHost`/`urlPath`, returns `{ id, created: true }`
- `prototype/lib/client-error-ticket.test.ts`: hermetic libsql-file harness (same pattern as
  `db.client-error-signature.test.ts` / `db.sso-state.test.ts`) covering:
  - signature stability under trivial whitespace/number changes in the message, and
    project-scoping (p1 != p2 for identical error)
  - severity ordering (uncaught error/unhandledrejection = high, network 5xx/0 = medium,
    network non-5xx = low, console.error = low)
  - first occurrence creates a ticket (id starts with `fb_`), identical second call bumps
    (created:false, same id)
  - PII (email) in the message is masked in the persisted `observation` column, verified via a
    raw `SELECT observation FROM feedback WHERE id=?` against the exported `db` client

## Test results

`bun test lib/client-error-ticket.test.ts` → 4 pass, 0 fail, 15 expect() calls.
Also re-ran `bun test lib/db.client-error-signature.test.ts` (Task 1's tests) → 2 pass, 0 fail,
to confirm no regression in the consumed interfaces.

No TDD detour needed — implementation matched the brief's pseudocode; test written first,
confirmed the module-missing failure conceptually (file didn't exist), then implementation and
test were added together and passed on first run.

## Notes / non-goals

- Connector auto-copy is explicitly NOT this task's job (per brief) — `recordClientError` only
  returns `{ id, created }`; a later task's endpoint calls `autoCopyFeedback`.
- No emoji in source. No version/CHANGELOG/manifest files touched. Committed only on
  `feat/bugherd-autocapture` in this worktree.

## Blocking concerns

None.

## Follow-up: coordinator review — test-coverage strengthening

Coordinator review confirmed the implementation was correct but flagged two gaps in
`prototype/lib/client-error-ticket.test.ts`:

1. IMPORTANT — the dedup test only asserted return values (`b.created===false`,
   `b.id===a.id`), not an actual DB row count. Added `countBySignature(projectId, signature)`
   helper (`SELECT COUNT(*) AS n FROM feedback WHERE project_id=? AND signature=?`) and, after
   the second `recordClientError` call in the dedup test, assert
   `countBySignature(pid, clientErrorSignature(pid, e)) === 1` — proving the bump path did not
   insert a duplicate row.
2. MINOR — added a new test `"overCap drop path: new signature, no prior ticket -> no row
   inserted"`: computes the signature for a fresh error with no prior ticket, asserts count is 0
   before, calls `recordClientError(pid, e, {}, { atMs: 1, overCap: true })`, asserts
   `result.created === false` and `result.id === ""`, then asserts count is still 0 after — no
   row was ever inserted for the dropped signature.

### Re-run

Command: `cd prototype && bun test lib/client-error-ticket.test.ts`

Output:
```
bun test v1.3.14 (0d9b296a)

 5 pass
 0 fail
 20 expect() calls
Ran 5 tests across 1 file. [177.00ms]
```

(Previously 4 pass / 15 expect() calls; now 5 pass / 20 expect() calls after adding the
DB-row-count assertion to the dedup test and the new overCap test.)
