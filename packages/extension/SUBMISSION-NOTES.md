# Klavity Extension Submission Notes

## Version
`0.39.166`

## Summary of Changes (Since v0.37.0)

Derived from the extension package git log history since tag `v0.37.0`:

### Major Additions & Features
* **Full-Page Scroll-Stitch Screenshot capturing (GoFullPage-style)**: Added native high-fidelity full-page stitching capture to capture long pages and deal with sticky/floating headers cleanly.
* **Native Right-Click Context Menu Integration**: Added a native browser submenu for Klavity actions ("Report a bug", "Request a feature", etc.) integrated directly into the browser context menus.
* **Review Replay Support**: Added support to replay the last Sim review directly from the extension popup.
* **Visual Progress Ring**: Added a thinking/progress ring animation to the 'Sims reviewing' indicator within the extension popup.

### UX & Interface Refinements
* **SVG Icon Migration**: Cleaned up the extension options and popups by replacing emojis with crisp SVG icons and plain text.
* **"Analyse with Sims" Action renaming**: Re-labeled popup actions to be more descriptive and eliminated silent no-ops when no active sims are deployed.
* **Settle Latency optimization**: Reduced DOM mutation review latency from ~2s to ~1s for faster observation delivery.

### Stability & Security Hardening
* **Data Sanitization**: Escaped user-supplied HTML parameters in options templates.
* **Resource Resiliency**: Shifted core package naming to ensure session-replay assets (rrweb dependencies) aren't blocked by aggressive client-side ad-blockers.
* **General fixes**: Corrected "Open tracker" link to point directly to the Klavity dashboard in Cloud mode.
