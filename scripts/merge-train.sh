#!/bin/bash
# merge-train — the orchestrator's single-writer integration pass.
# Assembles every feat/* branch with new commits into master (theirs-wins),
# stamps ONE version, and pushes. Only this script writes master (KLAV_ORCHESTRATOR=1).
set -uo pipefail
export KLAV_ORCHESTRATOR=1
REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO" || exit 1
log(){ echo "[$(date '+%F %T')] [merge-train] $*"; }

# BOOT SMOKE (2026-07-09): the tsc gate catches syntax/type errors but NOT a runtime
# boot-crash (bad migration, startup exception, import that only fails at run). Two prod
# outages tonight shipped exactly that (a bad -X theirs merge that PARSED but crash-looped
# on boot). A bad MASTER defeats prod's health-rollback (it just re-pulls the bad master),
# so we must catch it HERE, before pushing. Actually start the server, wait for its ready
# log, confirm it serves 200, then kill it. Known-good master boots in ~4s locally.
boot_smoke(){
  command -v bun >/dev/null 2>&1 || { log "boot-smoke: bun unavailable — skipping"; return 0; }
  local port=9187 lf pid wd i ok=0 code
  lf="$(mktemp)"
  # Free the port ROBUSTLY before booting: kill by pattern AND by whoever holds the port.
  # A stray process on this port makes the server EADDRINUSE → a FALSE boot-fail that blocks
  # EVERY branch (a real bug hit 2026-07-09). lsof catches what the pattern-pkill misses.
  free_port(){ pkill -f "PORT=$port bun run server.ts" 2>/dev/null; command -v lsof >/dev/null 2>&1 && lsof -ti:"$port" 2>/dev/null | xargs -r kill -9 2>/dev/null; }
  local attempt
  for attempt in 1 2; do
    free_port; sleep 1; ok=0; : >"$lf"
    ( cd "$REPO/prototype" && PORT=$port bun run server.ts >"$lf" 2>&1 ) & pid=$!
    ( sleep 55 && kill -9 "$pid" 2>/dev/null ) & wd=$!
    for i in $(seq 1 50); do
      kill -0 "$pid" 2>/dev/null || { log "boot-smoke: process EXITED at ~${i}s (attempt $attempt)"; break; }
      grep -qE "Klavity app|→ http|listening" "$lf" 2>/dev/null && { ok=1; break; }
      sleep 1
    done
    # EADDRINUSE = port conflict, NOT a code problem — retry once with a harder port free.
    if [ "$ok" -ne 1 ] && grep -q "EADDRINUSE" "$lf" 2>/dev/null && [ "$attempt" -eq 1 ]; then
      log "boot-smoke: EADDRINUSE on port $port (stray process) — freeing + retrying"
      kill "$pid" 2>/dev/null; kill "$wd" 2>/dev/null
      continue
    fi
    break
  done
  if [ "$ok" -eq 1 ]; then
    code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/" 2>/dev/null || echo 000)
    [ "$code" = "200" ] || { ok=0; log "boot-smoke: ready but curl / = $code"; }
  fi
  kill "$pid" 2>/dev/null; kill "$wd" 2>/dev/null; pkill -f "PORT=$port bun run server.ts" 2>/dev/null; wait "$pid" 2>/dev/null
  if [ "$ok" -ne 1 ]; then
    log "!!! BOOT SMOKE FAILED — server did not come up. last log:"
    tail -12 "$lf" 2>/dev/null | while IFS= read -r l; do log "  $l"; done
    rm -f "$lf"; return 1
  fi
  rm -f "$lf"; log "boot-smoke: server came up (200) ✓"; return 0
}

git fetch -q origin master 2>/dev/null
# Self-heal a WEDGED checkout: a 120s-killed mid-merge can leave unmerged files
# ("cannot checkout master / dashboard.html: needs merge") that froze integration
# until a human reset it. Force through it so the loop NEVER needs an orchestrator.
git merge --abort 2>/dev/null
git checkout -qf master 2>/dev/null || { git reset -q --hard 2>/dev/null; git clean -fdq 2>/dev/null; git checkout -qf master 2>/dev/null || { log "cannot checkout master after self-heal"; exit 1; }; }
git reset -q --hard origin/master 2>/dev/null   # single writer ⇒ align to origin
git clean -fdq 2>/dev/null                       # drop any stray untracked from a killed cycle

base_ver=$(sed -n 's/.*"version": *"\([0-9]*\.[0-9]*\.[0-9]*\)".*/\1/p' package.json | head -1)
[ -z "$base_ver" ] && base_ver="0.0.0"

# Branches to never auto-ship (locked research / explicitly held). Edit freely.
EXCLUDE_RE='^feat/klavity-os-trails'
QUIET_MIN=45   # don't merge a branch whose last commit is younger than this (mid-burst)
now=$(date +%s)

# --- Post-merge integrity gate -------------------------------------------
# WHY: we merge -X theirs. A worker branch on a STALE base then silently wins
# its old copy of any file master fixed since — NOT a conflict, so it ships
# corruption (this reverted kanban-search, embedCopy, sim-widget repeatedly).
# After each merge we re-check protected invariants vs the PRE-merge tree and
# REVERT just that branch if it regressed any. Good branches in the same cycle
# are kept. Extend PROTECTED_* freely.
DASH="prototype/public/dashboard.html"
WIDGET_BUNDLE="packages/sdk/dist/klavity-widget.iife.js"
# "feature markers" whose count in $DASH must never DROP across a merge.
# Retired kanbanSearch|kb-toolbar 2026-07-09: the Tracker epic (KLA-170+) INTENTIONALLY
# reworks the tickets/kanban UI in dashboard.html, so a legit refactor drops those marker
# counts and false-blocked KLA-170 (verified: it boots + works, +137 lines of kanban).
# embedCopy stays; boot_smoke now covers real breakage.
PROTECTED_PATTERNS=('embedCopy')
dash_count(){ [ -f "$DASH" ] && grep -c "$1" "$DASH" 2>/dev/null || echo 0; }
typecheck_changed_ts(){
  local pre="$1" tmpd logf failed=0 f
  local changed=()
  while IFS= read -r f; do
    # skip *.test.* — they import bun:test (unresolvable by tsc; validated by `bun test`, not the type gate)
    case "$f" in *.test.ts|*.test.tsx|*.test.mts|*.test.cts) continue;; esac
    [ -f "$f" ] && changed+=("$f")
  done < <(git diff --name-only "$pre"..HEAD -- '*.ts' '*.tsx' '*.mts' '*.cts')
  [ "${#changed[@]}" -eq 0 ] && return 0
  if ! command -v bunx >/dev/null 2>&1 && ! command -v bun >/dev/null 2>&1; then
    log "tsc gate cannot run: bunx/bun unavailable"
    return 1
  fi
  tmpd="$(mktemp -d 2>/dev/null || mktemp -d -t klav-merge-tsc)"
  logf="$tmpd/tsc.log"
  cat > "$tmpd/merge-train-globals.d.ts" <<'EOF'
declare const process: any;
declare const Bun: any;
declare const Buffer: any;
declare module "bun" { export class S3Client { constructor(...args: any[]) } }
interface ImportMeta { dir: string; }
declare module "node:async_hooks" { export class AsyncLocalStorage<T = any> { constructor(); run<R>(store: T, callback: () => R): R; getStore(): T | undefined; } }
declare module "node:crypto" { export const createHmac: any; export const timingSafeEqual: any; export const randomUUID: any; }
declare module "node:dns/promises" { export const lookup: any; }
declare module "node:net" { export const isIP: any; }
EOF
  local runner="bunx"; command -v bunx >/dev/null 2>&1 || runner="bun x"
  local TSC="--noEmit --pretty false --strict false --noImplicitAny false --skipLibCheck --moduleResolution bundler --module esnext --target es2022 --lib es2022,dom"
  # (1) errors in the changed files AS MERGED (current working tree)
  $runner tsc $TSC "$tmpd/merge-train-globals.d.ts" "${changed[@]}" >"$tmpd/head.log" 2>&1 || true
  # (2) BASELINE: same files on origin/master in a clean throwaway worktree, so sibling/cross-file
  #     imports resolve identically. This codebase carries pre-existing tsc noise (bun-isms,
  #     isolated-file cross-module misses) — tolerate those; only block NET-NEW errors.
  local basewt="$tmpd/basewt" basefiles=() f2
  if git worktree add -q --detach "$basewt" origin/master 2>/dev/null; then
    for f2 in "${changed[@]}"; do [ -f "$basewt/$f2" ] && basefiles+=("$f2"); done
    if [ "${#basefiles[@]}" -gt 0 ]; then
      ( cd "$basewt" && $runner tsc $TSC "$tmpd/merge-train-globals.d.ts" "${basefiles[@]}" ) >"$tmpd/base.log" 2>&1 || true
    else
      : >"$tmpd/base.log"
    fi
    git worktree remove --force "$basewt" 2>/dev/null || true
  else
    log "tsc gate: could not create baseline worktree; skipping type gate for this branch"
    : >"$tmpd/base.log"; cp "$tmpd/head.log" "$tmpd/base.log" 2>/dev/null || true
  fi
  local n_head n_base
  # HARD SYNTAX GATE (must run BEFORE the count check): a fatal parse error (unbalanced
  # brace / "Unexpected end of file") makes tsc bail early and emit FEWER total errors than
  # the pre-existing baseline noise — so a net-new syntax break can SLIP the count comparison
  # and ship a file that won't even parse (crash-loops prod at boot). 2026-07-09: exactly this
  # shipped KLA-145 via a -X theirs merge that dropped a closing brace → prod 502 crash-loop.
  # Syntax errors are TS1xxx; block on ANY net-new one, regardless of total count.
  local syn_head syn_base
  syn_head=$(grep -cE "error TS1[0-9]{3}" "$tmpd/head.log" 2>/dev/null); syn_head=${syn_head:-0}
  syn_base=$(grep -cE "error TS1[0-9]{3}" "$tmpd/base.log" 2>/dev/null); syn_base=${syn_base:-0}
  if [ "$syn_head" -gt "$syn_base" ]; then
    log "!!! INTEGRITY GATE: $b introduced a SYNTAX error (TS1xxx ${syn_base} -> ${syn_head}) — file won't parse, reverting. This can be a -X theirs merge mangle; the branch must rebase onto master."
    grep -E "error TS1[0-9]{3}" "$tmpd/head.log" 2>/dev/null | head -8 | while IFS= read -r l; do log "  ${l}"; done
    rm -rf "$tmpd"
    return 1
  fi
  n_head=$(grep -c "error TS" "$tmpd/head.log" 2>/dev/null); n_head=${n_head:-0}
  n_base=$(grep -c "error TS" "$tmpd/base.log" 2>/dev/null); n_base=${n_base:-0}
  if [ "$n_head" -gt "$n_base" ]; then
    log "!!! INTEGRITY GATE: branch INCREASED tsc errors in changed files (${n_base} -> ${n_head}) — likely a real regression, blocking. New errors:"
    diff <(grep "error TS" "$tmpd/base.log" 2>/dev/null | sed -E 's/\([0-9]+,[0-9]+\)/()/' | sort) \
         <(grep "error TS" "$tmpd/head.log" 2>/dev/null | sed -E 's/\([0-9]+,[0-9]+\)/()/' | sort) 2>/dev/null \
      | grep '^>' | head -20 | while IFS= read -r l; do log "  ${l#> }"; done
    rm -rf "$tmpd"
    return 1
  fi
  [ "$n_base" -gt 0 ] && log "tsc gate: tolerated ${n_base} pre-existing error(s) in changed files (no net increase)"
  rm -rf "$tmpd"
  return 0
}

changed=0; merged=""
for b in $(git for-each-ref --format='%(refname:short)' refs/heads/ | grep -E '^feat/'); do
  echo "$b" | grep -qE "$EXCLUDE_RE" && continue
  ahead=$(git rev-list --count "master..$b" 2>/dev/null || echo 0)
  [ "${ahead:-0}" -eq 0 ] && continue
  ct=$(git log -1 --format=%ct "$b" 2>/dev/null || echo 0)
  age=$(( now - ct ))
  [ "$age" -lt "$QUIET_MIN" ] && { log "skip $b (committed ${age}s ago, still hot)"; continue; }

  pre=$(git rev-parse HEAD)
  pre_counts=(); for p in "${PROTECTED_PATTERNS[@]}"; do pre_counts+=("$(dash_count "$p")"); done

  if git merge --no-edit -X theirs "$b" >/dev/null 2>&1; then
    why=""
    # 1) protected dashboard feature counts must not drop below pre-merge
    for i in "${!PROTECTED_PATTERNS[@]}"; do
      post=$(dash_count "${PROTECTED_PATTERNS[$i]}")
      [ "$post" -lt "${pre_counts[$i]}" ] && why="$why ${PROTECTED_PATTERNS[$i]}(${pre_counts[$i]}->$post)"
    done
    # 2) committed widget bundle must stay valid JS (a broken bundle ships silently)
    if command -v node >/dev/null && [ -f "$WIDGET_BUNDLE" ] && ! node --check "$WIDGET_BUNDLE" >/dev/null 2>&1; then
      why="$why widget-bundle-syntax"
    fi
    # 3) changed TypeScript must pass a tsc --noEmit binding/type pass. If a branch introduces a
    # scope/name error, revert it before it reaches master.
    if ! typecheck_changed_ts "$pre"; then
      why="$why tsc-noEmit"
    fi
    if [ -n "$why" ]; then
      log "!!! INTEGRITY GATE BLOCKED $b — reverting (stale-base regressed:$why). Branch must rebase onto master."
      git reset -q --hard "$pre"
    else
      log "merged $b (+$ahead)"; changed=1; merged="$merged $b"
    fi
  else
    log "CONFLICT on $b — aborting that merge, skipping (radar should warn)"
    git merge --abort 2>/dev/null
  fi
done

[ "$changed" -eq 0 ] && { log "nothing to integrate"; exit 0; }

# ── Deploy spacing ────────────────────────────────────────────────────────────
# Prod restarts on every version bump and takes ~34s to boot (Turso schema check),
# during which the whole site 502s. Pushing two versions back-to-back overlaps those
# dark windows and flaps prod. So keep successive pushes ≥ MIN_DEPLOY_GAP apart: if we
# pushed too recently, HOLD this cycle (undo the in-tree merges; branches re-integrate
# next cycle — idempotent since we reset to origin/master at the top of every run).
MIN_DEPLOY_GAP=75
STAMP="$HOME/.config/klav-orchestrator/last-push.epoch"
last_push=$(cat "$STAMP" 2>/dev/null || echo 0)
gap=$((now - last_push))
if [ "$last_push" -gt 0 ] && [ "$gap" -lt "$MIN_DEPLOY_GAP" ]; then
  log "deploy spacing: last push ${gap}s ago (<${MIN_DEPLOY_GAP}s) — holding this cycle (retry in ~$((MIN_DEPLOY_GAP - gap))s):$merged"
  git reset -q --hard origin/master 2>/dev/null
  exit 0
fi

# Single monotonic version stamp (base patch + 1), forced across all manifests + PRD.
maj=${base_ver%%.*}; rest=${base_ver#*.}; min=${rest%%.*}; pat=${rest##*.}
next="$maj.$min.$((pat+1))"
for f in package.json packages/core/package.json packages/extension/package.json \
         packages/extension/manifest.json packages/sdk/package.json; do
  [ -f "$f" ] && sed -i '' "s/\"version\": *\"[0-9][0-9.]*\"/\"version\": \"$next\"/" "$f"
done
[ -f docs/PRD.md ] && sed -i '' "s/\(\*\*Version:\*\* \)\`[0-9][0-9.]*\`/\1\`$next\`/" docs/PRD.md

git add -A
pre_push_base=$(git rev-parse 'HEAD@{u}' 2>/dev/null || echo "")
git commit -q -m "orchestrator: integrate$merged → v$next" 2>/dev/null
# Final gate before publish: does the integrated tree actually BOOT? If not, do NOT push
# a crash-looping master (prod's autodeploy can't self-heal from a bad master).
if ! boot_smoke; then
  log "!!! NOT PUSHING v$next — integrated set failed boot smoke. Reverting to origin/master; branches stay unmerged (rebase/fix needed):$merged"
  git reset -q --hard "${pre_push_base:-origin/master}" 2>/dev/null || git reset -q --hard origin/master 2>/dev/null
  exit 1
fi
if git push -q origin master 2>/dev/null; then
  date +%s > "$STAMP" 2>/dev/null   # stamp the deploy so the next push waits MIN_DEPLOY_GAP
  log "pushed v$next ($(git rev-parse --short HEAD)) — integrated:$merged"
  # Slack deploy notification — fail-safe: missing hook file or curl error never blocks the train.
  # Webhook is a SECRET; lives only in ~/.config/klav-orchestrator/slack-deploy-webhook (0600), never in-repo.
  hookf="$HOME/.config/klav-orchestrator/slack-deploy-webhook"
  if [ -r "$hookf" ]; then
    # Build subjects as JSON \n escapes via pure bash concat (printf/awk/sed all mangle backslashes).
    subjects=""
    if [ -n "$pre_push_base" ]; then
      while IFS= read -r subj; do
        [ -n "$subj" ] && subjects="${subjects}\\n• ${subj}"
      done < <(git log --no-merges --format='%s' "$pre_push_base..HEAD" 2>/dev/null \
               | grep -v '^orchestrator:' | head -10 | tr -d '"\\' | tr -d '\r')
    fi
    payload='{"text":"🚀 *Klavity v'"$next"'* pushed — prod auto-deploys in ~30s (health-rollback armed)\n'
    payload="${payload}Integrated:${merged}${subjects}\"}"
    curl -sf -m 8 -X POST -H 'Content-Type: application/json' -d "$payload" "$(cat "$hookf")" >/dev/null 2>&1 \
      || log "slack notify failed (non-fatal)"
  fi
else
  log "PUSH FAILED (will retry next cycle)"
fi
