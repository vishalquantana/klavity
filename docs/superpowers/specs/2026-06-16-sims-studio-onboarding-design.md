# Sims Studio Onboarding Redesign (Option B)

**Date:** 2026-06-16
**File:** `klav-snap/prototype/public/index.html`
**Mockup:** `klav-snap/prototype/public/onboarding-mockup.html`

## Problem

The current Sims Studio onboarding is confusing because the page uses **two competing numbering systems**:

1. **Panel headers** number setup inputs: `① Transcript → Sims`, `② The page your Sims review`.
2. **A dismissible "Three steps" banner** numbers the actual flow: `1 Add a Sim → 2 Have a Sim review → 3 Save drafts`.

These don't align — banner "step 2" is the *unnumbered* "Your Sims" panel on the right, while panel "②" is just a prerequisite. The flow also runs in a non-obvious spatial order (left-middle → top-right → bottom-right), the hardest input (transcript) dominates the top, and "Sim" is undefined jargon.

## Solution — Option B: one number line, flow-ordered single page

Keep the dense single-page dashboard, but make the 3 steps unmistakable.

### 1. One progress rail (the only numbering)
Replace the dismissible banner with a persistent top **progress rail**: `1 → 2 → 3`, each with a title + one-line description. "Sim" is defined inline ("A simulated user who reviews like a real one"). This is the *only* place numbers appear; the old panel `①②` glyphs are removed.

### 2. Three flow-ordered lanes (left → right = 1 → 2 → 3)
A 3-column grid carrying the same numbers as the rail:

- **Step 1 — Add a Sim** (left): **transcript box stays primary at the top** (textarea + Extract Sims), then a `— or, no transcript yet? —` divider drops to preset chips, then describe-in-a-sentence. When Sims exist, a green `✅ N Sims ready → step 2` confirmation appears at the top of the lane.
- **Step 2 — Have a Sim review the page** (center, the focus): the page being reviewed (demo dashboard / replace-with-screenshot) on top, and directly below it the **reviewer cards** — each Sim with avatar, name, role, full **pain / want / love** insights, and a per-Sim `Review this page →` button + live status. (This is the existing `#dock`, relocated here.)
- **Step 3 — Save the feedback** (right): the draft queue + Save-to-Klavity (unchanged behavior).

### 3. First-run gating (auto-unlocks permanently)
On a brand-new account, steps 2 & 3 are visually locked (🔒 + "do step N first") and the active step is highlighted — this teaches the order. After the **first completed review-and-save loop**, gating is turned off permanently (persisted in `localStorage`); thereafter every step stays open and the rail/lane highlight simply follows the user's current focus.

## DOM / JS contract to preserve

All existing IDs and wiring stay intact so the live backend keeps working:
`#transcript, #extractBtn, #clearBtn, #extractStatus, #presets, #brief, #micBtn, #briefBtn, #briefStatus, #stage, #stageWrap, #upload, #resetStage, #dock, #reactStatus, #drafts, #draftEmpty, #draftCount, #saveDrafts, #draftStatus`.

The `guide()` / `finishGuide()` logic is generalized into a single `updateFlow()` that derives state from `sims.length` and `drafts.length`, drives both the rail and the lane locks (respecting the `localStorage` "guide done" flag), and pulses the current step's primary CTA. Call sites (`renderDock`, `review`, `saveDrafts`, init) repoint to it.

### Derived state
- step 1 done when `sims.length > 0`
- step 2 done when `drafts.length > 0`
- active = first not-done step
- locks (only when not yet "guide done"): step 2 locked if `sims.length === 0`; step 3 locked if `drafts.length === 0`
- `finishGuide()` (first successful save) sets `localStorage.klav_guide_done` → no further gating

## Out of scope
- No backend/API changes.
- No change to the Sim character animation, screenshot/vision pipeline, or draft-save/file-as-bug behavior.
- `#stage` becomes width-responsive (was fixed 740px) to fit the center lane; screenshot capture already uses `clientWidth/Height`.
