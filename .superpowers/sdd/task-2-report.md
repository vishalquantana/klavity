# Task 2 Report: Authoring adopts kref snapshot

## Status: DONE

## What was done

### domHash safety grep (pre-change check)
Ran `grep -rn "domHash" prototype/lib/ | grep -v test` as required. Confirmed: no replay-time recomputation of domHash from live DOM. The `domHash` field is:
- Stored as a page-state fingerprint at authoring time
- Used as a cache-key salt component from the stored `TrajectoryStep.domHash`
- Never recomputed from live DOM at replay

Result: CLEAR — implementation proceeded.

### Step 1: Failing test written
Created `prototype/lib/trails-author.kref.e2e.test.ts` with two tests:
1. "kref action executes; trajectory + step log persist stable selectors only" — scripted model answers with a kref selector parsed from the snapshot, verifies the click executes, checks nothing persisted is a kref, checks `#go` stable selector in locator_cache.
2. "AUTHOR_SYS teaches kref + bans Playwright pseudo-classes; label is ELEMENT SNAPSHOT" — asserts AUTHOR_SYS contains `data-kref`, pseudo-class mention, and buildAuthorMessages emits `ELEMENT SNAPSHOT (untrusted)`.

Initial run: 2 fail (expected).

### Step 2: trails-author-model.ts updated
- First sentence: "screenshot and DOM snapshot" → "screenshot and ELEMENT SNAPSHOT (a compact accessibility-style tree)"
- Selector rule (line 31): replaced with kref-prefer rule including the `[data-kref="eN"]` instruction and explicit ban on Playwright pseudo-classes (`:has-text`, `:visible`, `:text`) with "plain CSS only" note
- buildAuthorMessages: "DOM SNAPSHOT (untrusted):" → "ELEMENT SNAPSHOT (untrusted):"

### Step 3: trails-author.ts updated
- Added import: `captureKrefSnapshot, stableSelectorFor, isKrefSelector` from `./trails-snapshot`
- Removed `DOM_CAP = 16_000` constant (no longer needed; snapshot module owns its cap)
- Initial-nav step: `page.content().slice(0, DOM_CAP)` → `captureKrefSnapshot(page)` via `bounded()`
- Loop capture: `page.content().slice(0, DOM_CAP)` → `captureKrefSnapshot(page)` via `bounded()`
- Selector-op branch (before the click): added `persistSelector` conversion via `stableSelectorFor(loc)` with fallback to `fp.domPath ?? a.selector!`
- traj.push: `resolvedSelector: a.selector!` → `resolvedSelector: persistSelector`
- entry.selector: updated to `persistSelector` after computation
- history.push: uses `entry.selector` (stable) instead of `a.selector` (potentially kref)

### Deviation: locator_cache assertion
The brief's test asserts `expect(json).toContain("#go")` on `JSON.stringify(getTrail + listTrailSteps)`. However, `crystallize` stores `target_json` as fingerprint-only (strips `resolvedSelector` via `fingerprintOnly()`); the selector lives exclusively in `locator_cache`. The test was updated to also query `T.getCacheForStep(PROJECT_ID, clickStep!.id)` and include the cache row in the JSON assertion. This is the correct place to verify stable selectors and matches what `trails-runner.e2e.test.ts` does (it uses `T.getCacheForStep` for selector assertions).

## Test commands + counts

```
cd prototype && bun test lib/trails-author.kref.e2e.test.ts server.trails-author.route.test.ts lib/trails-runner.e2e.test.ts
```

Result: **13 pass, 1 fail**

The 1 failing test is "POST /api/trails/author validates and returns a pollable session" in `server.trails-author.route.test.ts` — the pre-existing env-dependent failure (OPENROUTER_API_KEY is set in .env, so the model runs and stalls for a page-content reason instead of failing with "OPENROUTER"). This is the exact failure profile described in the brief as "same-profile = OK".

Additional runs confirming no regressions:
- `bun test lib/trails-author.e2e.test.ts lib/trails-author-model.test.ts`: **16 pass, 0 fail**

## Commit

- SHA: `232960b`
- Message: `feat(autosims): authoring drives on kref element snapshot; stable selectors persisted`
- Branch: `feat/autosim-cost-bench`

## Self-review

- Persistence invariant holds: no `data-kref` string in crystallized trail steps, locator_cache, step log, or history. Verified by test.
- `stableSelectorFor` is called BEFORE the click action (brief ordering requirement), so the kref attr is still present on the DOM element.
- `bounded()` wrapping added for `stableSelectorFor` call with 10_000ms timeout and `.catch(() => null)` fallback.
- History now shows stable selectors, preventing kref refs from poisoning model context on future turns.
- All wait/navigate paths are untouched (as specified).
- No version bumps, no CHANGELOG edits.

---

## Review-findings fix (commit 02a3f31)

### Findings addressed

1. **[Important] FAILED-action path leaked krefs into `history`**: The catch block pushed raw `a.selector` (a kref like `[data-kref="e3"]`) into `history[]`, and the error message from the `n !== 1` throw also embedded it. Both now sanitized.
2. **[Important] No test covered the failure path**: Added a new test in `trails-author.kref.e2e.test.ts`.
3. **[Important] `entry.selector`/`entry.error` on failed steps kept raw kref**: Both now sanitized before persistence.

### What changed

**`prototype/lib/trails-author.ts`**
- Added `dekref` sanitizer near the top (after constants, before interface declarations):
  ```ts
  const dekref = (s: string) => s.replace(/\[data-kref="(e\d+)"\]/g, "snapshot ref $1")
  ```
- In the catch block: compute `safeMsg = dekref(msg)` and `safeSelector = a.selector && isKrefSelector(a.selector) ? dekref(a.selector) : a.selector`; assign both to `entry.error` and `entry.selector`; use `safeSelector`/`safeMsg` in `history.push` and the stall message.
- The `n !== 1` throw (line 127) is left unmodified — `dekref` applied at consumption points (history/entry.error) is sufficient as instructed.

**`prototype/lib/trails-author.kref.e2e.test.ts`**
- Added third test: "failed kref action: data-kref never reaches step log or history"
  - Scripted model call 1 returns `{op:"click", selector:'[data-kref="e999"]', ...}` — matches 0 elements → FAILED
  - Call 2 captures `input.history` and returns done
  - Asserts: `JSON.stringify(out.steps)` does NOT contain `data-kref`, DOES contain `snapshot ref e999`
  - Asserts: `JSON.stringify(historyOnCall2)` does NOT contain `data-kref`

### Test command + counts

```
cd prototype && bun test lib/trails-author.kref.e2e.test.ts lib/trails-author.textfirst.test.ts 2>/dev/null; bun test lib/trails-author.kref.e2e.test.ts
```

Result: **3 pass, 0 fail** (textfirst file absent — silently skipped as expected)
