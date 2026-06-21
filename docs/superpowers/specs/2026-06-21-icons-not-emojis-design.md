# Design — "Icons, not emojis" UI standard

**Date:** 2026-06-21
**Status:** Approved (design); implementation pending plan
**Branch:** `feat/icons-not-emojis`

## Problem

There is no icon system in Klavity today. Emoji glyphs are the de-facto icons across
every user-facing surface — ~600 occurrences in user-facing source. Emoji render
inconsistently across OS/browser, can't inherit theme color, don't scale crisply, and
read as informal. We want one deliberate icon standard applied across the whole product.

## The Standard (the rule we are establishing)

> **User-facing UI renders icons as inline Lucide outline SVGs using
> `stroke="currentColor"`. It never uses emoji glyphs.**

- **In scope (must convert):** the marketing site (`site/**`), the dashboard/app pages
  (`prototype/public/**` — dashboard, login, snap-popup, sim-studio), the embeddable
  widget/SDK (`packages/sdk/src/**`), and the extension (`packages/extension/src/**`,
  `packages/core/src/**` UI incl. `modal.ts`).
- **Out of scope (emoji allowed):** `CHANGELOG.md`, `README.md`, everything under
  `docs/`, commit messages, and the `dna-logo-*.html` / `prototype/**` throwaways.
- **Semantic emojis convert too:** status (✓ ✅ ❌) and mood reactions (😍 🤔 😤 😕)
  become icons, not just decorative ones.

## Approach (chosen: A — centralized module + CI guard)

A single source of truth holds the icon set; every surface consumes it; a CI guard
prevents regressions. Rejected alternatives: (B) ad-hoc per-surface inline SVG —
guarantees drift and inconsistent sizing/stroke; (C) icon font / SVG sprite — adds an
external asset the self-contained widget can't reliably load.

## Components

### 1. Core icon module — `packages/core/src/icons.ts`
- Exports `ICONS: Record<IconName, string>` where each value is the **inner** SVG
  markup (the `<path>`/`<circle>` elements) of a Lucide outline icon, copied verbatim
  from Lucide (ISC licensed). Only the icons we actually use are included — no full
  library import, keeping the widget bundle small.
- Exports `icon(name, opts?)` → an `<svg>` string with a consistent wrapper:
  `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`,
  `stroke-linecap="round"`, `stroke-linejoin="round"`, `class="icon"`.
  - `opts.size` (px, default 18) sets width/height.
  - `opts.label`: if provided → `role="img"` + nested `<title>{label}</title>`
    (semantic icons). If omitted → `aria-hidden="true"` (decorative).
  - `opts.class`: extra classes appended.
- This module has **zero runtime dependencies** so the SDK/widget bundle stays
  self-contained (a hard requirement — see widget memory).

### 2. Static-site helper — `site/kit.js` + `site/kit.css`
- `site/kit.js` exposes `window.Klav.icon(name, opts)` mirroring the core helper, so
  dynamically-rendered marketing HTML (mood widget, tour toggle, theme toggle) can emit
  icons. The icon map in `kit.js` is generated from the same Lucide source as the core
  module (kept in sync; the CI guard catches stale emoji if anything is missed).
- `site/kit.css` adds `.icon` (inline-flex alignment, `width/height:1em` default,
  `vertical-align:-0.125em`, `flex:none`) and size modifiers, all using `currentColor`.
- Marketing HTML with emoji **baked into static markup** gets the `<svg>` inlined
  directly at the call site (no JS needed for first paint / SEO).

### 3. Icon mapping
Every emoji currently in user-facing source maps to a Lucide name. The full table is
enumerated during implementation (P2–P4) by sweeping each file; representative entries:

| Emoji | Role | Lucide |
|---|---|---|
| 📝 | extract step / submissions | `file-text` |
| 📋 | view submissions | `clipboard-list` |
| 🧬 | review / analyze | `dna` |
| 🐛 | file bug | `bug` |
| 🔎 | inspect | `search` |
| ⚡ | report a bug | `zap` |
| 💡 | request a feature | `lightbulb` |
| 🌙 / ☀️ | theme toggle | `moon` / `sun` |
| 👆 / 👀 | pointer / watching | `mouse-pointer-2` / `eye` |
| 😍 / 🤔 / 😤 / 😕 | mood: love/neutral/frustrated/confused | `heart` / `meh` / `angry` / `frown` |
| ✓ ✅ | status ok | `check` / `check-circle` |
| ❌ | status fail | `x-circle` |

Any emoji discovered without an obvious mapping is resolved during its phase and added
to the table; the spec table is the canonical record.

### 4. Regression guard — `scripts/check-no-emoji.mjs`
- Scans in-scope globs (`site/**`, `prototype/public/**`,
  `packages/{core,sdk,extension}/src/**`) for emoji codepoints (ranges `1F000–1FAFF`, `2600–27BF`, `2B00–2BFF`,
  `FE0F`, plus `2190–21FF` arrows) and exits non-zero with file:line on any hit.
- Honors an inline allow comment (`// emoji-ok`) for the rare deliberate case.
- Wired into the existing CI workflow (`.github/workflows`) and runnable locally via a
  `package.json` script (`pnpm check:emoji`).

## Accessibility
- Decorative icons: `aria-hidden="true"`, adjacent visible text carries meaning.
- Semantic icons (moods, standalone status, icon-only buttons): `role="img"` +
  `<title>` (via `icon(name, {label})`), matching the existing pattern where the theme
  toggle already has `aria-label`.

## Testing
- **Unit (core):** `icon()` emits expected wrapper attrs; `label` toggles
  `role/aria-hidden`; unknown name throws (catches typos).
- **Guard test:** `check-no-emoji.mjs` flags a fixture containing an emoji and passes a
  clean fixture.
- **Build/visual:** each phase builds the affected package and spot-checks the rendered
  surface (marketing page, widget modal, extension popup) so no icon is missing/oversized.
- **Parity:** extension + widget must stay at feature parity (shared `buildModal`) — both
  pull from the same core icon module.

## Execution phases
1. **P1 — Foundation:** standard doc (this), `packages/core/src/icons.ts` + helper,
   `Klav.icon` in `kit.js`, `.icon` styles in `kit.css`, `scripts/check-no-emoji.mjs`
   + CI wiring + `pnpm check:emoji`. Guard starts in *report-only* until P4 completes,
   then flips to *failing*.
2. **P2 — Marketing site:** convert all emoji in `site/*.html` (incl. dynamic JS).
3. **P3 — Widget/SDK:** convert `packages/sdk/src/**`; verify zero-dep bundle + modal.
4. **P4 — Extension + dashboard:** convert `packages/extension/src/**`,
   `packages/core/src/**` UI (incl. `modal.ts`), and the `prototype/public/**`
   dashboard/app pages; flip the CI guard to failing.

Versioning per SemVer memory: bump CHANGELOG + PRD + manifests together (likely a minor,
e.g. `v0.40.0`). Ship via the standard deploy path once green.
