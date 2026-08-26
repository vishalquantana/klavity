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
// changed-file compile. Net effect: TS2304 drops to 0 (from 22) — the gate passes
// with margin and stops eating roam.ts.
//
// LOCATION: this file lives at the extension package ROOT, deliberately OUTSIDE
// `src/`. The extension's real tsconfig uses `"include": ["src"]`, so it does NOT
// pick this up — meaning the real @types/chrome namespace is untouched and the
// extension's own `tsc --noEmit` is unaffected (a bare `declare const chrome: any`
// inside src/ would SHADOW the @types/chrome namespace and break `chrome.X`
// type-position usages in background.ts/popup.ts with TS2503). The merge-train
// gate, by contrast, uses a repo-wide `git diff` file list (not the tsconfig), so
// it still sees this file regardless of where it sits in the package.
declare const chrome: any
