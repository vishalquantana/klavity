# AutoSim kref snapshot + text-first authoring — design

**Date:** 2026-07-04 · **Basis:** `prototype/docs/bench-autosim-cost.md` (real-cost bench, v0.39.307)

## Problem

The authoring loop (`lib/trails-author.ts`) and Tier-2 vision reheal (`lib/trails-runner.ts` →
`lib/trails-vision.ts`) send a raw `page.content()` dump capped at 16KB per model call. Benchmarked
consequences: (a) ~$0.0014/step — 6.9k input tokens, mostly `<head>`/CSS; (b) the cap starves the
model of actual page structure, so it hallucinates selectors from the screenshot — 4/6 bench steps
produced non-resolving selectors, matching the `:has-text` roll-variance seen during live authoring
(KLAVITYKLA-48). A compact ref-annotated element tree fixed selector validity (17/18) and cut cost
64% (with screenshot) to 86–93% (text-only).

## Scope

1. **Adopt now:** kref element tree replaces the raw-DOM model payload in authoring + vision reheal
   (screenshot kept).
2. **Build behind a default-OFF flag:** text-first authoring with screenshot escalation, plus an
   A/B harness; flipping the default is a separate decision after a full authored-Trail A/B.

Out of scope: hosted-browser/CDP work (`AUTOSIM_CDP_URL`), model-mix changes, runner Tier-0/1
behavior, evidence/groundQuote formats.

## Design

### 1. `lib/trails-snapshot.ts` (new module)

- `captureKrefSnapshot(page, cap = 24_000): Promise<string>` — in-page walker (single
  `page.evaluate`) emitting one line per **visible** semantic element, indented by depth (max 6):
  - interactive (`a[href]`, `button`, `input`, `select`, `textarea`, `summary`, `[role]`):
    `role "accessible name" {disabled?} [ref=eN]` — and stamps `data-kref="eN"` on the element,
    so `[data-kref="eN"]` is a real, unique CSS selector for this page state.
  - structural text (headings, labels, img[alt], short visible `p`/`li` capped 80 chars):
    emitted WITHOUT refs — gives assert steps page text to target conceptually.
  - skips `script/style/noscript/svg/template/iframe`; accessible name = aria-label → placeholder
    → alt → textContent → name → title → value, 80-char cap.
  - output capped at `cap` chars with a trailing `…[snapshot truncated]` marker (dense-page guard;
    bench: app pages are 0.5–2KB, HN-style pages can exceed raw HTML).
- `stableSelectorFor(loc): Promise<string | null>` — in-page ladder `#id` → `[data-testid]` →
  `tag[aria-label]` (same ladder as the runner's `persistableSelector`); callers fall back to the
  fingerprint `domPath`.
- `isKrefSelector(s)` — `/^\[data-kref="e\d+"\]$/` guard.

**Invariant: `data-kref` selectors never persist.** Refs are stamped per-snapshot and vanish on
navigation/reload, and are renumbered on every capture. Any code path that stores a selector
beyond the current page state (trajectory `resolvedSelector`, `locator_cache`, heal `toSelector`
evidence) must convert kref → stable selector first.

### 2. Authoring (`trails-author.ts`, `trails-author-model.ts`)

- Loop capture: `captureKrefSnapshot(page)` (bounded, 15s/20s like today) replaces
  `page.content().slice(16k)` as `AuthorStepInput.domSnapshot` (field name kept; prompt label
  becomes `ELEMENT SNAPSHOT`). `domHash = sha256hex(snapshot)` — identity/drift marker only;
  implementation must verify no replay path recomputes it from live DOM (cache identity is
  `UNIQUE(project_id, step_id)`).
- `AUTHOR_SYS`: selector rule becomes — prefer the target's `[data-kref="eN"]` from the snapshot;
  otherwise standard CSS with stable attributes; **never Playwright pseudo-classes**
  (`:has-text()`, `:visible`, …) — plain CSS only.
- Post-action persistence: when the executed selector is a kref, `resolvedSelector =
  stableSelectorFor(loc) ?? fp.domPath` (fingerprint is already captured pre-action and always
  has `domPath`). History lines record the stable form + accessible name — never the kref
  (refs renumber next step and would poison model context).
- Initial-navigate trajectory step hashes the snapshot too (replaces the 16k `page.content()`).

### 3. Vision reheal (`trails-runner.ts`, `trails-vision.ts`)

- Tier-2 model input: `domSnapshot = captureKrefSnapshot(page)` (cap constant reused) instead of
  `page.content().slice(VISION_DOM_MODEL_CAP)`. The RAW `page.content()` capture stays for
  `evidence.domExcerpt` (2,000 chars) and groundQuote verbatim-line grounding — human-facing
  contracts, unchanged.
- `VISION_SYS`/prompt: the model may return the replacement element's `[data-kref="eN"]` or a
  stable CSS selector.
- Heal path: after `uniquelyResolves` + `roleConsistent` + act succeed on a kref selector, convert
  via `stableSelectorFor(loc) ?? fp.domPath` BEFORE `upsertLocatorCache` and the
  `evidence.toSelector` diff (a kref in the cache would force a re-heal on every subsequent walk).

### 4. Text-first authoring with screenshot escalation (flag, default OFF)

- Env `KLAV_AUTHOR_TEXT_FIRST=1` (read in `authorTrail` via opts override for testability:
  `opts.textFirst ?? env`).
- When on: `includeShot = misses > 0` per iteration — the happy path skips the screenshot
  Playwright op AND the image part in `buildAuthorMessages` (`AuthorStepInput.screenshotB64: ""`
  → no `image_url` part); any miss (failed action, invalid selector, parse-error stall) makes the
  next attempt for that step vision-assisted. Misses reset on success (existing counter).
- Model mix unchanged (VL models accept text-only messages).
- A/B harness `scripts/bench-author-ab.ts`: authors the same cred-free objective (klavity.in home
  → blog → assert) twice — flag off vs on — via `authorTrail` with the real OpenRouter model;
  reports per-arm cost, llmCalls, steps, misses, outcome + verification verdict. Manual opt-in
  (real spend ≈ $0.05–0.15/run); results appended to `prototype/docs/bench-autosim-cost.md`.
  Flipping the default = separate decision on that evidence.

## Error handling

- Snapshot capture failures degrade like today's `page.content()` failures (bounded op → miss/
  stall path); an empty snapshot (blank page) is passed through as-is — the model can `wait` or
  `navigate`.
- `stableSelectorFor` returning null falls back to fingerprint `domPath` (always present); if the
  element detached post-action (navigation click), conversion is skipped and the pre-captured
  fingerprint's `domPath` is used — same information the Tier-1 ladder heals from.
- Text-first: a step that keeps missing escalates to screenshot on attempt 2+, then hits the
  existing `MAX_CONSECUTIVE_MISSES = 3` stall — no new failure modes.

## Testing

- **Serializer unit tests** (fixture HTML, real chromium like existing e2e): stamping uniqueness,
  visibility filtering, name ladder, disabled state, text lines have no refs, cap + truncation
  marker, idempotent re-capture renumbers cleanly.
- **Authoring flow** (mocked model returning kref selectors on a fixture page): action executes;
  trajectory `resolvedSelector` and history contain NO `data-kref`; falls back to domPath when no
  stable handle exists.
- **Vision heal** (mocked resolver returning kref): `locator_cache.resolved_selector` and
  `toSelector` evidence are stable selectors.
- **Text-first**: message-shape tests (no image part when flag on + no misses; image present after
  a miss); screenshot op skipped (spy/counter).
- Existing suite green; update tests that assert on `DOM SNAPSHOT` prompt text or 16k cap.

## Rollout

Kref adoption ships on by default (it replaces a strictly-worse payload; verified by bench +
suite). Text-first ships dark behind the flag. A/B run + doc update follow; default flip is its
own future change. No version bumps (orchestrator owns them).
