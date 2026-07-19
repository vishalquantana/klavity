#!/usr/bin/env bash
set -euo pipefail

# Run from the repo root (klav-snap-wt-* or klav-snap)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SITE="$REPO_ROOT/site"
FAVICON="$SITE/favicon.svg"

echo "==> Generating brand assets from $FAVICON"

# Font paths (macOS system fonts; TTF preferred for magick compatibility)
FONT_BOLD="/System/Library/Fonts/Supplemental/Verdana Bold.ttf"
FONT_REG="/System/Library/Fonts/Supplemental/Verdana.ttf"

# ── 1. apple-touch-icon.png (180×180) ────────────────────────────────────────
rsvg-convert -w 180 -h 180 "$FAVICON" -o "$SITE/apple-touch-icon.png"
echo "    apple-touch-icon.png  ✓"

# ── 2. app-icon-1024.png (1024×1024) ─────────────────────────────────────────
rsvg-convert -w 1024 -h 1024 "$FAVICON" -o "$SITE/app-icon-1024.png"
echo "    app-icon-1024.png  ✓"

# ── 3. logo.png (400×400 transparent — mark only, no background rect) ────────
# Write a stripped SVG that removes the background <rect> and recolours the
# mark from white to indigo (#6366f1) so it's visible on light backgrounds.
cat > "$SITE/logo-source.svg" <<'SVG'
<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <g fill="#6366f1">
    <circle cx="15" cy="9" r="2"/>
    <circle cx="11" cy="16" r="2"/>
    <circle cx="10" cy="24" r="2"/>
    <circle cx="11" cy="32" r="2"/>
    <circle cx="15" cy="39" r="2"/>
    <circle cx="33" cy="9" r="2"/>
    <circle cx="37" cy="16" r="2"/>
    <circle cx="38" cy="24" r="2"/>
    <circle cx="37" cy="32" r="2"/>
    <circle cx="33" cy="39" r="2"/>
  </g>
  <g stroke="#6366f1" stroke-width="1.6" stroke-linecap="round" opacity="0.35">
    <line x1="15" y1="9" x2="33" y2="9"/>
    <line x1="11" y1="16" x2="37" y2="16"/>
    <line x1="10" y1="24" x2="38" y2="24"/>
    <line x1="11" y1="32" x2="37" y2="32"/>
    <line x1="15" y1="39" x2="33" y2="39"/>
  </g>
</svg>
SVG
rsvg-convert -w 400 -h 400 "$SITE/logo-source.svg" -o "$SITE/logo.png"
echo "    logo.png  ✓"

# ── 4. og.png (1200×630 designed social card) ────────────────────────────────
# Render the brand mark at 220×220 to a temp file, then compose the card.
TMPMARK=$(mktemp /tmp/klavity-mark-XXXXXX.png)
rsvg-convert -w 220 -h 220 "$FAVICON" -o "$TMPMARK"

magick \
  -size 1200x630 "xc:#1a1023" \
  \( -size 6x630 "xc:#6366f1" \) -geometry +0+0 -composite \
  "$TMPMARK" -geometry +60+205 -composite \
  -fill white -font "$FONT_BOLD" -pointsize 96 \
  -annotate +320+300 "Klavity" \
  -fill "#6366f1" -font "$FONT_REG" -pointsize 34 \
  -annotate +322+368 "AI bug reporter. Self-healing tests." \
  -fill "rgba(255,255,255,0.45)" -font "$FONT_REG" -pointsize 26 \
  -annotate +324+430 "klavity.in" \
  "$SITE/og.png"

rm -f "$TMPMARK"
echo "    og.png  ✓"

echo "==> All brand assets generated."
echo "    apple-touch-icon.png  $(du -sh "$SITE/apple-touch-icon.png" | cut -f1)"
echo "    app-icon-1024.png     $(du -sh "$SITE/app-icon-1024.png"    | cut -f1)"
echo "    logo.png              $(du -sh "$SITE/logo.png"              | cut -f1)"
echo "    og.png                $(du -sh "$SITE/og.png"                | cut -f1)"
