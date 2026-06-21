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
while true; do
  ( bash "$REPO/scripts/merge-train.sh" ) >> "$LOG" 2>&1 &
  p=$!
  ( sleep 120 && kill -9 "$p" 2>/dev/null ) &
  k=$!
  wait "$p" 2>/dev/null
  kill "$k" 2>/dev/null
  sleep 25
done
