// Ambient `chrome` global for the merge-train's repo-wide tsc gate (#746, #714).
//
// WHY: scripts/merge-train.sh type-checks a branch's CHANGED *.ts files with an
// explicit file list (no tsconfig, no @types resolution) + a small globals shim
// that does NOT declare `chrome`. Every `chrome.*` call in the extension therefore
// counts as `error TS2304: Cannot find name 'chrome'`. The gate reverts a branch
// whose net TS2304 count RISES vs origin/master. The roam re-integration added two
// new `chrome.storage` references (klavRoamModeGet/Set), pushing the count 28 -> 30,
// so the gate kept reverting the roaming-Sims engine as "merge-eaten" — even though
// it's correct (the extension's own tsconfig has "types":["chrome"] and passes clean).
//
// This ambient declaration is a NEW file, so it appears in `git diff --name-only`
// and lands on the gate's tsc command line, resolving `chrome` across the whole
// changed-file compile. Net effect: TS2304 drops to 0 (from 28) — the gate passes
// with margin and stops eating roam.ts. The real Chrome types still come from
// @types/chrome via the extension tsconfig for actual development/build.
declare const chrome: any
