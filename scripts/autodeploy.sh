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

# Default the repo root to this script's parent dir (…/scripts/autodeploy.sh -> repo root),
# so it works regardless of where the checkout lives (prod flattens it at /opt/klav, not
# /opt/klav/klav-snap). Override with KLAV_REPO if needed.
REPO="${KLAV_REPO:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
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

# ── KLA-750 deploy-slot hardening ──────────────────────────────────────────────
# Incident (2026-09-01): a manually-started `bun run server.ts` orphan squatted prod port 4317 for
# ~28h. Caddy routes prod → :4317, so every "flip to blue:4317" landed on the ORPHAN, whose /api/health
# returned 200 → the deploy reported success. Meanwhile the real systemd slot crash-looped on
# EADDRINUSE (restart counter 400+), silently, and prod served 28h-stale code. The three helpers below
# close that gap: (1) kill non-systemd squatters before starting the slot, (2) verify the responding
# process is the just-deployed commit before flipping Caddy, (3) detect an EADDRINUSE restart-loop.

# List the PIDs currently listening on a TCP port (empty when the port is free). Uses ss -ltnp and
# parses the `pid=NNN` field; sorted-unique so a multi-fd process appears once.
port_listeners() {
  local port="$1"
  ss -H -ltnp "sport = :${port}" 2>/dev/null \
    | grep -oE 'pid=[0-9]+' | grep -oE '[0-9]+' | sort -u
}

# (1) Free the slot's port of any listener that is NOT this slot's own systemd process. Compares each
# listener PID against the unit's MainPID (0/empty when the unit is stopped, which is the expected
# pre-start state). SIGTERM first, then SIGKILL for survivors. Returns non-zero (fail loudly) if a
# non-systemd squatter still holds the port after both — the deploy MUST NOT proceed onto an orphan.
free_slot_port() {
  local port="$1" svc="$2" unit_pid pid waited=0 leftover
  unit_pid="$(systemctl show -p MainPID --value "$svc" 2>/dev/null || echo 0)"
  [ -z "$unit_pid" ] && unit_pid=0
  local squatters=""
  for pid in $(port_listeners "$port"); do
    [ "$pid" = "$unit_pid" ] && continue   # legit: the slot's own process already holds the port
    squatters="$squatters $pid"
  done
  if [ -z "${squatters// }" ]; then
    log "slot port ${port} clear of non-systemd squatters (unit MainPID=${unit_pid})"
    return 0
  fi
  for pid in $squatters; do
    log "KLA-750: NON-SYSTEMD squatter pid=${pid} on slot port ${port} (unit ${svc} MainPID=${unit_pid}) — SIGTERM"
    kill -TERM "$pid" 2>/dev/null || true
  done
  # Give SIGTERM up to 5s to release the port.
  while [ "$waited" -lt 5 ]; do
    sleep 1; waited=$((waited + 1))
    leftover=""
    for pid in $(port_listeners "$port"); do [ "$pid" = "$unit_pid" ] || leftover="$leftover $pid"; done
    [ -z "${leftover// }" ] && { log "KLA-750: slot port ${port} freed after ${waited}s"; return 0; }
  done
  # SIGKILL fallback for anything still squatting.
  for pid in $leftover; do
    log "KLA-750: squatter pid=${pid} survived SIGTERM on port ${port} — SIGKILL"
    kill -KILL "$pid" 2>/dev/null || true
  done
  sleep 1
  leftover=""
  for pid in $(port_listeners "$port"); do [ "$pid" = "$unit_pid" ] || leftover="$leftover $pid"; done
  if [ -n "${leftover// }" ]; then
    log "KLA-750: FATAL — could not free slot port ${port} (still held by:${leftover}); aborting deploy (old slot untouched)"
    return 1
  fi
  log "KLA-750: slot port ${port} freed via SIGKILL"
  return 0
}

# (2) Read the commit a running slot reports at /api/version (empty if unreachable / no such endpoint).
served_commit() {
  local url="$1" body
  body="$(curl -fsS --max-time 3 "$url" 2>/dev/null || echo '')"
  [ -z "$body" ] && { echo ""; return; }
  # Capture ONLY the quoted value. A second `grep -oE '[0-9a-fA-F]+'` would match the 'c' in the
  # word "commit" FIRST (both are hex chars) and `head -n1` returned "c" — a false mismatch that
  # aborted every Caddy flip (KLA-750 parse bug: prod froze on old code). sed extracts the group.
  echo "$body" | sed -nE 's/.*"commit"[[:space:]]*:[[:space:]]*"([0-9a-fA-F]+)".*/\1/p' | head -n1
}

# Assert the slot at $1 (health url base host:port) is serving the commit we just checked out ($2).
# Aborts (returns non-zero) on a missing endpoint OR a mismatch — the caller stops the slot and exits
# BEFORE flip_caddy, so a stale orphan can never be promoted to live.
assert_served_commit() {
  local ver_url="$1" expected="$2" served
  served="$(served_commit "$ver_url")"
  if [ -z "$served" ]; then
    log "KLA-750: ${ver_url} exposed no commit — cannot prove the responder is the deployed build; aborting flip"
    return 1
  fi
  # Compare 12-char prefixes (server may report full or abbreviated sha).
  if [ "${served:0:12}" != "${expected:0:12}" ]; then
    log "KLA-750: SERVED-COMMIT MISMATCH at ${ver_url} — served=${served:0:12} expected=${expected:0:12} (stale orphan/squatter?). Aborting BEFORE Caddy flip."
    return 1
  fi
  log "KLA-750: served commit ${served:0:12} matches deployed ${expected:0:12}"
  return 0
}

# (3) systemd restart counter for a unit (0 when unknown). A climb across the deploy window means the
# slot is crash-looping (classically EADDRINUSE against a squatter) rather than starting cleanly.
nrestarts() {
  local n
  n="$(systemctl show -p NRestarts --value "$1" 2>/dev/null || echo 0)"
  [ -z "$n" ] && n=0
  echo "$n"
}

# ── Preflight ────────────────────────────────────────────────────────────────
[ -d "$REPO/.git" ]      || { log "repo not found: $REPO"; exit 1; }
[ -d "$REPO/prototype" ] || { log "prototype dir not found: $REPO/prototype"; exit 1; }
[ -f "$STATE_FILE" ]     || { log "ZDT not configured (no $STATE_FILE) — run deploy/zdt-setup.sh"; exit 1; }
[ -x "$BUN_BIN" ]        || { log "missing bun binary at $BUN_BIN"; exit 1; }

cd "$REPO"
# Under systemd, HOME may be unset and the checkout is owned by the deploy user, so git
# refuses with "dubious ownership". Pin HOME and mark the repo safe so git ops work headless.
export HOME="${HOME:-/root}"
git config --global --add safe.directory "$REPO" 2>/dev/null || true

previous="$(git rev-parse HEAD)"

git fetch -q origin master
target="$(git rev-parse origin/master)"
# Nothing new on origin/master -> exit silently. This loop runs every ~12s; without this
# guard it would ZDT-flip the blue/green slots on EVERY tick (constant restarts). Only
# deploy when there is an actual new commit to ship.
if [ "$previous" = "$target" ]; then
  exit 0
fi
log "deploying origin/master ${target:0:12} from ${previous:0:12}"

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
inactive_ver_url="http://127.0.0.1:${inactive_port}/api/version"
active_busy_url="http://127.0.0.1:${active_port}/api/health/busy"

# KLA-750 (1): kill any non-systemd squatter on the target slot port BEFORE starting the slot, so the
# unit binds cleanly instead of crash-looping on EADDRINUSE behind an orphan that squats the port.
if ! free_slot_port "$inactive_port" "$inactive_svc"; then
  log "aborting: slot port ${inactive_port} could not be freed for ${inactive_slot} (old slot still serving)"
  exit 1
fi

# KLA-750 (3): snapshot the slot's restart counter so we can detect an EADDRINUSE crash-loop that
# would otherwise pass silently (systemd keeps restarting while the health check hits a squatter).
restarts_before="$(nrestarts "$inactive_svc")"

log "active=${active_slot}:${active_port}  →  starting ${inactive_slot}:${inactive_port}"
systemctl start "$inactive_svc" || { log "failed to start $inactive_svc — aborting (old slot untouched)"; exit 1; }

log "waiting for ${inactive_svc} to become healthy…"
if ! poll_health_url "$inactive_url"; then
  log "${inactive_svc} never became healthy — aborting ZDT, reverting (no downtime, old slot still serving)"
  systemctl stop "$inactive_svc" || true
  exit 1
fi
log "${inactive_svc} healthy at ${inactive_url}"

# KLA-750 (3): a climbing restart counter during the deploy window == crash-loop (EADDRINUSE etc.).
# The 200 above may have come from a squatter while systemd keeps restarting the real slot — fail loud.
restarts_after="$(nrestarts "$inactive_svc")"
if [ "$restarts_after" -gt "$restarts_before" ]; then
  log "KLA-750: ${inactive_svc} restart counter climbed ${restarts_before}→${restarts_after} during deploy — crash-loop (EADDRINUSE?). Aborting BEFORE flip; old slot untouched."
  systemctl stop "$inactive_svc" || true
  exit 1
fi

# KLA-750 (2): confirm the process answering on the slot is the commit we just deployed — not a stale
# orphan that happens to return 200. Abort BEFORE the Caddy flip on mismatch/missing endpoint.
if ! assert_served_commit "$inactive_ver_url" "$target"; then
  log "aborting ZDT: ${inactive_slot}:${inactive_port} is not serving the deployed commit (old slot still serving)"
  systemctl stop "$inactive_svc" || true
  exit 1
fi

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
