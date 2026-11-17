# AutoSims Implementation Progress

Audit: `docs/AUTOSIMS_ARCHITECTURE_AUDIT.md`. Branch `Balaji_autosim-multiple-inputerror` (base 69551e13). Nothing committed yet.

## Increment 1 — F11 Selector optimisation (role + accessible name, scoped text)

**Status:** implemented and tested locally; not committed. No QA2 actions used (local fixtures only).

### Existing behaviour
`stableSelectorBody` (`lib/trails-browser-page.ts`) tried id → data-testid → name → aria-label → placeholder → input type, then the shortest unique `nth-of-type` path. Bare links, buttons and row buttons therefore got positional paths.

### Confirmed problem and root cause
No role/name or text tier existed at save time, although replay's heal tier (`resolveTarget`) already resolves by role + name. Positional selectors drift when a list/sidebar gains items or a wrapper shifts.
Evidence from the new failing-first tests (before the change), on a drifted page: the saved positional selector matched **exactly one element, but the wrong one** (T6, T7, T9). Replay's Tier 0 accepts `count === 1` and does not check identity (see follow-up risk below).
Field evidence: dev v15 (93 s vision heal), v17 step 14 (16 s heal, `li:nth-of-type(13)>a`).

### Selector priority implemented
1. `#id` 2. `[data-testid]` 3. `tag[name]` 4. `tag[aria-label]` 5. `tag[placeholder]` 6. `input[type]` (all unchanged, each must be unique and equal the element)
7. **NEW** `role=<role>[name="<accessible name>"s]` — links, buttons, `input[type=button|submit|reset|image]`, `role=link|button|tab|menuitem`; must match exactly this element among visible elements of that role
8. **NEW** scoped: `<container>:has-text("<label>") >> role=<role>[name="…"s]` — container = nearest of `tr, li, article, dialog, [role=row|listitem|dialog]` (up to 3 levels); label = visible text in the container that is not the target; used only when the name alone is ambiguous
9. Shortest unique positional path (unchanged fallback); `isPositionalSelector(sel)` identifies it.

Checkboxes, radios and text fields never get tiers 7–8.

### Validation before saving (no `count === 1` alone)
- In page: exactly one visible, non-aria-hidden element of that role has that computed name, and it is the target (identity check, not just count). Name computation: `aria-labelledby`, `aria-label`, `img alt`, input `value`, content (hidden / aria-hidden subtrees skipped, block children space-separated, whitespace normalised), `title`; names over 80 chars are not used.
- **Playwright adapter:** the real selector engine must resolve the candidate to the same element handle.
- **Puppeteer adapter (Steel, and local under Bun on Windows):** Chrome's accessibility tree for that element must report the same role and name. Any mismatch or error → positional path, with a console warning.

### Files changed
- `lib/trails-browser-page.ts` — `isPositionalSelector` (exported), `isSemanticSelector`, `skipSemantic` parameter and tiers 7–8 in `stableSelectorBody`, cross-checks in both adapters' `stableSelector`.
- `lib/trails-semantic-selectors.test.ts` (new) — 26 tests (T1–T11, where T10 = 12 accessible-name cases, plus 4 large-page tests in T12).
- `lib/trails-pw-check.cjs` (new) — test helper that evaluates selectors in real Playwright under Node.
- `lib/trails-page-role-selectors.test.ts` — 3 fixtures changed (see below).
Not touched: author loop, replay resolver, `crystallize`, DB schema, fingerprint, S3, unrelated modules.

### Tests
| Run | Result |
|---|---|
| New file before implementation | 1 pass / 21 fail (all for the missing behaviour; the 1 pass is a guard that an existing aria-label selector still wins) |
| New file after the main change | **22 / 22 pass** (26 / 26 after the large-page guard and its 4 tests) |
| Existing `trails-page-role-selectors` | 9 / 9 before; 3 failed after the change; fixed (below); 9 / 9 now |
| `trails-author-loop-recovery` (`--timeout 30000`) | 40 / 40 before and after |
| Full suite, command `KLAV_E2E=1 bun test lib/trails-*.test.ts lib/autosim-*.test.ts --timeout 30000` | see the three-run table below |

**Full-suite runs (same command each time; failures keyed by file + test name):**

| Run | Files | Tests | Pass | Skip | Fail | Failure list |
|---|---|---|---|---|---|---|
| A. Original baseline (before any change) | 81 | 795 | 699 | 44 | 52 | reference list |
| B. Increment 1 before the large-page guard (earlier result) | 82 | 817 | 720 | 44 | 53 | A + 1: `trails-author-resume` "picks up from checkpoint stepIdx" (judged flaky, see below) |
| C. **Final, after the large-page guard** | 82 | 821 | **725** | 44 | **52** | **identical to A** (`diff` exit 0) |

Run C vs A: +1 file, +26 tests (all pass, = the 26 new semantic-selector tests), fail count and the failing test list unchanged, so the guard and Increment 1 introduced no failures. Run C vs B: the single extra failure in B did not recur, which fits the earlier finding that this test is intermittent (it also failed on the committed code, and its sibling tests fail intermittently). The 52 pre-existing failures are unchanged and not fixed by this work.

**Change to existing tests (disclosed):** three tests in `trails-page-role-selectors.test.ts` call `page.count(savedSelector)` through the Puppeteer adapter, which evaluates plain CSS only. Their fixtures had uniquely named links, which now (by design) get `role=` selectors, so `count()` threw. I gave the fixture links identical names so they keep exercising the positional path as before. Their assertions are unchanged. Semantic behaviour is covered in the new file.

### Baseline regression comparison (`scratchpad/baseline-fails.txt` vs `after-fails.txt`)
- **Fixed by this change:** none. **Hidden:** none.
- **Pre-existing failures: 52, all still failing** (not caused by this work). They are concentrated in browser-driven suites (`trails-runner-vision.e2e` 10, `trails-author.textfirst` 5, `trails-stepshots` 4, `trails-runner-replay.e2e` 4, `trails-runner-deadline` 4, `trails-browser-page` 4, `trails-author-retry` 4, `trails-draft-gate` 3, and smaller ones). Playwright's `chromium.launch()` hangs under Bun on Windows, which explains some, but I did not diagnose each one.
- **Newly failing in the full run: 1** — `trails-author-resume`: "resume: authorTrail picks up from checkpoint stepIdx". **Judged flaky, not a regression:** that file has a baseline failure ("onCheckpoint is called at least once…") and a second test that fails intermittently. Repeated runs of that file: with my change 6 runs, failures {A+B}, {A}, {A}, {A}, {none}, {A} (A = onCheckpoint, B = checkpoint traj); with `trails-browser-page.ts` swapped back to the committed version, 4 runs, failures {A + "picks up from checkpoint stepIdx" + B}, {A}, {A}, {A}. The committed code produces the same intermittent failures, including the one reported as new.

### Large-page safeguard for the scoped tier (added after review)
- **Why:** the scoped tier's cost grows with rows × labels. Measured on a local fixture (one Edit button per row, target in the last row): 3,000 rows 1.4 s, 10,000 rows **8.9 s**, close to the author's 8–10 s `stableSelector` bound. When that bound is hit the author falls back to the fingerprint `domPath` (not guaranteed unique), which is worse than the positional path we had.
- **Cap:** `SCOPED_TIER_MAX_CANDIDATES = 3000` (exported from `trails-browser-page.ts`). A "candidate" = an element matching `a[href], button, input, [role]` whose role equals the target's role (link / button / tab / menuitem), counted with no style work.
- **Behaviour:** at or above the threshold the scoped tier is skipped and the existing positional path is used (the same unique positional selector the code produced before Increment 1). Fingerprint `domPath` is **not** used as a fallback. The role + accessible-name tier is **not** capped (measured 0.8 s at 3,000 and 2.3 s at 10,000 unique links). Below the threshold nothing changes.
- **Mechanism:** `stableSelectorBody(el, opts?: { skipSemantic?, maxScoped? })`; both adapters pass `{ maxScoped: SCOPED_TIER_MAX_CANDIDATES }` (the in-page function cannot see module constants). The only other change is the `skipSemantic` call sites now pass `{ skipSemantic: true }`. No watchdog change, no instrumentation.
- **Tests (T12, in `trails-semantic-selectors.test.ts`):** 2,999 candidates → scoped selector `tr:has-text("Row 2998") >> role=button[name="Edit"s]`, resolves in Playwright; 3,000 → positional selector, no `:has-text`, resolves to the target; 3,500 → positional (`tr:nth-of-type(3500)>…`), resolves to the target; 3,500 rows plus one uniquely named button → `role=button[name="Archive everything"s]` (role tier preserved). Before the guard: the 3,000 and 3,500 tests failed (scoped selector still produced), the other two passed.
- **Results after the guard:** semantic file 26 / 26 (22 original + 4 new), existing selector file 9 / 9, `trails-author-loop-recovery` 40 / 40 (`--timeout 30000`). 18 related author / replay / walk files (186 tests): 141 pass / 24 fail, and the 24 are exactly the pre-existing baseline failures in those files (none new, none fixed; the intermittent `trails-author-resume` failure did not occur in this run).

### Known limitations
- Only newly authored Trails get the new selectors; existing Trails are unchanged (no migration).
- The Playwright adapter's cross-check (used where Playwright launches locally on Linux/dev) could not be run on this machine, because Playwright cannot launch under Bun on Windows. The selector engine itself was verified through the Node helper, and the Puppeteer path (what runs here and on Steel) is covered by the tests.
- The scoped tier's label is visible text in the row/card, chosen from the first distinguishing text found. If that text later changes, the step heals through the existing tiers.
- The Puppeteer path cannot validate the `:has-text` scope with a real engine; correctness of the scoped form is checked in page and judged by Playwright in the tests.
- Scopes are limited to `tr, li, article, dialog, [role=row|listitem|dialog]` (`section` / `fieldset` deferred by decision). A repeated link in plain `div`/`section` cards still falls back to positional.
- `T9` replicates `resolveTarget`'s Tier 0 (attach wait, then `count === 1`) in a Node helper instead of calling the function: `trails-runner.ts` imports `s3.ts`, which imports Bun's builtin.
- The author loop's history text now shows `role=…` selectors for these steps. The model is told to use `[data-kref]` markers, so I expect no effect, but this was not observed on a live run.
- Repeated-action guard keys (`op|selector|value|url`) use the saved selector; a semantic selector is stable across list reloads, so a legitimate second action on the same-named control in a refreshed list can look like a repeat. Not observed; to be watched on the next dev run.

### Follow-up risk (separate item, not addressed here): replay accepts the wrong element
`resolveTarget` Tier 0 returns a cache hit when `page.locator(cachedSelector).count() === 1` and does not verify identity (no `roleConsistent`, no fingerprint check). A positional selector can therefore resolve to exactly one element that is the wrong record and the walk acts on it with no heal and no warning. Reproduced locally in T6, T7 and T9 against the old selectors. Proposed future increment: identity validation at replay (role / accessible-name / text consistency against the stored fingerprint on a cache hit, falling through to the heal tiers on mismatch) and a Trail-quality flag for positional-only steps via `isPositionalSelector`.
