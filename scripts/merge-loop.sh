#!/bin/bash
# Minimal, hang-resistant merge loop — the SOLE runner of merge-train.
# Each merge-train runs in a child with a hard 120s kill, so one stuck git op
# can never freeze the loop. Deploy is owned by the server's autodeploy loop
# (polls origin/master every 12s), so nothing here needs to ssh/deploy.
REPO=/Users/vishalkumar/Downloads/qbug/klav-snap
LOG="$HOME/.config/klav-orchestrator/merge-loop.log"
PIDF="$HOME/.config/klav-orchestrator/merge-loop.pid"
mkdir -p "$(dirname "$LOG")"
echo $$ > "$PIDF"
echo "[$(date '+%F %T')] merge-loop started (pid $$)" >> "$LOG"

# Worktree GC — the merge-train integrates feat/* branches but never removed their
# worktree dirs, so they accumulated (hundreds). Self-throttled to hourly. `git worktree
# remove` WITHOUT --force refuses a dirty worktree, so an agent's in-progress edits are
# never destroyed; a clean worktree loses nothing (its branch + commits stay in git and
# it can be re-added). Skips: the main checkout, temp/scratch dirs, .claude/worktrees, and
# any wip/* branch (an ACTIVE gated lane — e.g. a fix still in cross-model QA).
GC_STAMP="$HOME/.config/klav-orchestrator/last-worktree-gc"
worktree_gc() {
  local now last=0; now=$(date +%s)
  [ -f "$GC_STAMP" ] && last=$(cat "$GC_STAMP" 2>/dev/null || echo 0)
  [ $((now - last)) -lt 3600 ] && return   # at most once per hour
  echo "$now" > "$GC_STAMP"
  cd "$REPO" || return
  git fetch origin master --quiet 2>/dev/null   # so the merged check below is accurate
  git worktree prune 2>/dev/null
  local removed=0 path="" branch=""
  while IFS= read -r line; do
    case "$line" in
      "worktree "*) path="${line#worktree }" ;;
      "branch "*)   branch="${line#branch refs/heads/}" ;;
      "")  # end of a record — decide on (path,branch)
        if [ -n "$path" ]; then
          case "$path" in
            "$REPO") : ;;                                             # main checkout
            *T/tmp.*|*/.jcode/*|*/scratch/*|*/.claude/worktrees/*) : ;; # transient/session
            *) case "$branch" in
                 wip/*) : ;;                                          # active gated lane — keep
                 *)
                   # If the branch is fully merged into origin/master, every commit is
                   # already safe in master, so --force is loss-free (only disposable
                   # artifact-dirt — .gitignore tweaks, agent tool dirs, .build-* scratch —
                   # is discarded). WITHOUT this, agent tooling makes every worktree look
                   # dirty forever and plain `remove` refuses them → hundreds accumulate.
                   # Unmerged (or detached) worktrees fall back to a non-force remove, so a
                   # clean one is reclaimed but in-progress unmerged edits are never destroyed.
                   if [ -n "$branch" ] && git merge-base --is-ancestor "$branch" origin/master 2>/dev/null; then
                     git worktree remove --force "$path" 2>/dev/null && removed=$((removed+1))
                   else
                     git worktree remove "$path" 2>/dev/null && removed=$((removed+1))
                   fi ;;
               esac ;;
          esac
        fi
        path=""; branch="" ;;
    esac
  done < <(git worktree list --porcelain; echo "")
  git worktree prune 2>/dev/null
  [ "$removed" -gt 0 ] && echo "[$(date '+%F %T')] [worktree-gc] removed $removed merged/clean worktree(s)" >> "$LOG"
}

while true; do
  ( bash "$REPO/scripts/merge-train.sh" ) >> "$LOG" 2>&1 &
  p=$!
  ( sleep 120 && kill -9 "$p" 2>/dev/null ) &
  k=$!
  wait "$p" 2>/dev/null
  kill "$k" 2>/dev/null
  worktree_gc
  sleep 25
done
