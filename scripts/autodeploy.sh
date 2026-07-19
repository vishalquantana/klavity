#!/bin/bash
# autodeploy — version-controlled zero-downtime blue/green deploy for prod (KLAVITYKLA-346).
#
# This is the canonical, in-repo copy of the prod autodeploy loop's flip logic. Prod pulls this file
# (/opt/klav/scripts/autodeploy.sh) rather than keeping a drifting local copy. It mirrors the
# blue/green port-flip in scripts/prod-deploy.sh --zero-downtime, with ONE addition:
#
#   ── DRAIN STEP ──
#   Before `systemctl stop klav@<old-slot>`, poll the OLD slot's /api/health/busy endpoint and WAIT
#   until it reports idle (busy == 0) — or until a cap (DRAIN_MAX_SECS, default 120s) elapses. This
#   prevents a slot flip from killing an in-flight AutoSim / Sim / author / PDF run mid-execution.
#   Traffic has ALREADY been flipped to the new slot by this point, so draining the old slot costs no
#   downtime — it only lets already-running background work finish before the process is stopped.
#
# Usage:  bash scripts/autodeploy.sh          # blue/green flip with drain
#         DRAIN_MAX_SECS=180 bash scripts/autodeploy.sh
#
# Requires the one-time ZDT setup (deploy/zdt-setup.sh) — same as prod-deploy.sh --zero-downtime.
set -euo pipefail

REPO="${KLAV_REPO:-/opt/klav/klav-snap}"
BUN_BIN="${BUN_BIN:-/home/klav/.bun/bin/bun}"
HEALTH_ATTEMPTS="${KLAV_HEALTH_ATTEMPTS:-20}"
HEALTH_SLEEP="${KLAV_HEALTH_SLEEP:-2}"
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"
STATE_FILE="${ZDT_STATE:-/var/lib/klav/active-slot}"

# Drain caps: how long to wait for the OLD slot to go idle before stopping it, and how often to poll.
DRAIN_MAX_SECS="${DRAIN_MAX_SECS:-120}"
DRAIN_POLL_SECS="${DRAIN_POLL_SECS:-2}"

# Port map for each slot (must match prod-deploy.sh)
PORT_blue=4317
PORT_green=4318

log() { echo "[$(date '+%F %T')] [autodeploy] $*"; }

slot_port() {
  case "$1" in
    blue)  echo "$PORT_blue" ;;
    green) echo "$PORT_green" ;;
    *)     log "unknown slot: $1"; exit 1 ;;
  esac
}

other_slot() { [ "$1" = "blue" ] && echo "green" || echo "blue"; }

poll_health_url() {
  local url="$1" i
  for i in $(seq 1 "$HEALTH_ATTEMPTS"); do
    if curl -fsS --max-time 3 "$url" >/dev/null 2>&1; then return 0; fi
    sleep "$HEALTH_SLEEP"
  done
  return 1
}

# Return the OLD slot's in-flight busy count (0 == idle). Fails OPEN to 0: if the busy endpoint is
# unreachable/old build (pre-KLAVITYKLA-346), we treat the slot as idle rather than block the deploy.
busy_count() {
  local url="$1" body
  body="$(curl -fsS --max-time 3 "$url" 2>/dev/null || echo '')"
  if [ -z "$body" ]; then echo 0; return; fi
  # Extract the integer value of "busy":N without needing jq.
  echo "$body" | grep -oE '"busy"[[:space:]]*:[[:space:]]*[0-9]+' | grep -oE '[0-9]+$' | head -n1 || echo 0
}

# Wait for the OLD slot to finish in-flight AutoSim/Sim work before we stop it. Capped so a stuck run
# can never wedge the deploy forever — after DRAIN_MAX_SECS we proceed and stop the slot anyway (Bun's
# SIGTERM handler still gets a chance to finish the current request).
drain_slot() {
  local busy_url="$1" waited=0 n
  log "draining old slot via ${busy_url} (cap ${DRAIN_MAX_SECS}s)…"
  while [ "$waited" -lt "$DRAIN_MAX_SECS" ]; do
    n="$(busy_count "$busy_url")"
    [ -z "$n" ] && n=0
    if [ "$n" -eq 0 ]; then
      log "old slot idle after ${waited}s — safe to stop"
      return 0
    fi
    log "old slot busy (${n} in flight) — waited ${waited}s / ${DRAIN_MAX_SECS}s"
    sleep "$DRAIN_POLL_SECS"
    waited=$((waited + DRAIN_POLL_SECS))
  done
  log "drain cap ${DRAIN_MAX_SECS}s reached — proceeding to stop old slot anyway"
  return 0
}

flip_caddy() {
  local new_port="$1"
  if [ ! -f "$CADDYFILE" ]; then
    log "WARNING: Caddyfile not found at $CADDYFILE — update proxy manually"
    return 0
  fi
  sed -i "s|127\\.0\\.0\\.1:[0-9]*|127.0.0.1:${new_port}|g" "$CADDYFILE"
  systemctl reload caddy
  log "Caddyfile flipped to port ${new_port}; caddy graceful reload done"
}

# ── Preflight ────────────────────────────────────────────────────────────────
[ -d "$REPO/.git" ]      || { log "repo not found: $REPO"; exit 1; }
[ -d "$REPO/prototype" ] || { log "prototype dir not found: $REPO/prototype"; exit 1; }
[ -f "$STATE_FILE" ]     || { log "ZDT not configured (no $STATE_FILE) — run deploy/zdt-setup.sh"; exit 1; }
[ -x "$BUN_BIN" ]        || { log "missing bun binary at $BUN_BIN"; exit 1; }

cd "$REPO"
previous="$(git rev-parse HEAD)"
log "deploying origin/master from ${previous:0:12}"

git fetch -q origin master
git reset -q --hard origin/master
log "checked out $(git rev-parse HEAD | cut -c1-12); installing prototype dependencies"
( cd "$REPO/prototype" && "$BUN_BIN" install )

active_slot="$(cat "$STATE_FILE")"
inactive_slot="$(other_slot "$active_slot")"
active_port="$(slot_port "$active_slot")"
inactive_port="$(slot_port "$inactive_slot")"
inactive_svc="klav@${inactive_slot}.service"
active_svc="klav@${active_slot}.service"
inactive_url="http://127.0.0.1:${inactive_port}/api/health"
active_busy_url="http://127.0.0.1:${active_port}/api/health/busy"

log "active=${active_slot}:${active_port}  →  starting ${inactive_slot}:${inactive_port}"
systemctl start "$inactive_svc" || { log "failed to start $inactive_svc — aborting (old slot untouched)"; exit 1; }

log "waiting for ${inactive_svc} to become healthy…"
if ! poll_health_url "$inactive_url"; then
  log "${inactive_svc} never became healthy — aborting ZDT, reverting (no downtime, old slot still serving)"
  systemctl stop "$inactive_svc" || true
  exit 1
fi
log "${inactive_svc} healthy at ${inactive_url}"

# Flip traffic to the new slot FIRST (graceful, no dropped connections)…
flip_caddy "$inactive_port"

# …THEN drain the old slot until in-flight AutoSim/Sim work finishes (capped), so we never SIGTERM a
# run mid-flight. New requests already go to the new slot, so this drain is invisible to users.
drain_slot "$active_busy_url"

# Now stop the old slot. Bun's SIGTERM handler still drains any straggler HTTP request.
systemctl stop "$active_svc" || log "WARNING: failed to stop $active_svc cleanly"

printf '%s\n' "$inactive_slot" > "$STATE_FILE"
log "active-slot updated to '${inactive_slot}'"

if poll_health_url "http://127.0.0.1:${inactive_port}/api/health"; then
  log "zero-downtime deploy complete — now serving ${inactive_slot}:${inactive_port}"
  exit 0
fi

# Post-flip health failure: flip back to the old slot.
log "post-flip health check failed — rolling back Caddy to ${active_slot}:${active_port}"
flip_caddy "$active_port"
systemctl start "$active_svc" || log "WARNING: failed to restart $active_svc"
printf '%s\n' "$active_slot" > "$STATE_FILE"
log "rolled back to ${active_slot}"
exit 1
