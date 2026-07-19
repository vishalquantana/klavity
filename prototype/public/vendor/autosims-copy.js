// Canonical AutoSims surface copy — SINGLE SOURCE OF TRUTH (KLAVITYKLA-269).
//
// The standalone /autosims page (public/trails.html) and the in-dashboard AutoSims
// view (public/dashboard.html) used to hard-code their own hero + banner strings, so
// the two surfaces drifted (divergent lead text, precision-banner label, load-error).
// Both pages now read these strings from window.KLAV_AUTOSIMS_COPY so users see ONE
// consistent surface and the copy can never fork again. Edit copy here, once.
;(function (w) {
  w.KLAV_AUTOSIMS_COPY = Object.freeze({
    title: "AutoSims",
    // Hero sub-headline shown under the "AutoSims" H1 on both surfaces.
    lead: "Your AutoSims run on a schedule and flag regressions before your users do.",
    // Signal-quality (precision) banner label — shown only once real review data exists.
    precisionLabel: "Signal quality · % of real bugs found",
    // Shown when the AutoSims dashboard payload fails to load.
    loadError: "Couldn't load AutoSims.",
  })
})(window)
