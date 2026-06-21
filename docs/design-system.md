# Klavity Design System

One small, intentional design language shared across every surface (dashboard,
Sim Studio, future panels). The canonical tokens live in
**`prototype/public/tokens.css`** and were extracted from the dashboard
(`prototype/public/dashboard.html`), which is the visual source of truth.

To adopt the system on any page, load the two stylesheets in this order, then
your page styles:

```html
<link rel="stylesheet" href="/fonts/fonts.css" />
<link rel="stylesheet" href="/tokens.css" />
<style>/* page-specific styles, using the vars below */</style>
```

`/tokens.css` is served by `prototype/server.ts` (mirrors the `/fonts/fonts.css`
route). Static files are not auto-served, so each asset needs its own route.

---

## Color tokens

Warm "paper on ink" palette. Light is the default; dark is set with
`<html data-theme="dark">`. Same warm family in both themes — never a cool/blue
dark.

| Token | Role |
| --- | --- |
| `--ink` | App background (deepest surface) |
| `--ink-2` | Cards, panels, bars (raised) |
| `--ink-3` | Subtle insets, chips, hovers |
| `--ink-4` | Deeper insets, type pills |
| `--paper` | Primary text |
| `--paper-dim` | Secondary text |
| `--paper-faint` | Muted text, labels, meta |
| `--line` | Standard 1px hairline |
| `--line-2` | Stronger border (inputs, scrollbar) |
| `--indigo` / `--indigo-deep` / `--indigo-soft` | Primary brand |
| `--green` | Positive / success |
| `--rose` | Negative / pain |
| `--amber` | Want / attention |
| `--blue` | Informational link |

Accents lighten in dark mode so they keep contrast on the dark ink.

## Type scale

Three families, each with a job. Set them via the font-stack tokens — never
hard-code `system-ui` or `ui-monospace`.

| Token | Family | Use |
| --- | --- | --- |
| `--display` | Fraunces (serif) | Headings, big numbers. Set roman/light (weight 450–560), tight tracking (`-.02em`). Not bold. |
| `--body` | Hanken Grotesk | All UI and prose. |
| `--mono` | JetBrains Mono | Eyebrows, labels, meta, counts, code. Usually uppercase with `.08em` letter-spacing. |

Rough scale (px): page title 22–32 (display) · section title 16–19 (display) ·
body 13–15 (body) · meta/labels 9–11 (mono, uppercase).

## Spacing

4px base. Use the scale; don't invent one-off gaps.

`--space-1` 4 · `--space-2` 8 · `--space-3` 12 · `--space-4` 16 ·
`--space-5` 22 (default card padding) · `--space-6` 26 (page gutter / column gap) ·
`--space-8` 40.

## Radius

`--radius-sm` 10px (inputs, buttons) · `--radius-md` 14px (tiles) ·
`--radius-lg` 18px (cards) · `--radius-pill` 20px (chips).

## Elevation

`--shadow-card` resting panel · `--shadow-pop` floating bubbles / menus.

---

## Do / Don't

**Do**
- Load `fonts.css` then `tokens.css`, then page styles.
- Use the font-stack tokens for every `font-family`.
- Headings in `--display`, set light (450–560) with negative tracking.
- Labels/eyebrows in `--mono`, uppercase, `.08em` tracking, `--paper-faint`.
- Reach for `--ink-2` cards on an `--ink` page, with a `--line` border and
  `--radius-lg`.
- Add page-specific tokens *after* `tokens.css` only when the canonical set
  doesn't cover a need.

**Don't**
- Don't hard-code hex colors, `system-ui`, or `ui-monospace` — use tokens.
- Don't redefine the canonical tokens per page (it forks the system).
- Don't bold the display font; use weight + tracking, not 700/800.
- Don't introduce a cool/blue dark theme — the dark theme stays warm.
- Don't invent spacing/radius values outside the scales above.
