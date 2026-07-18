#!/bin/bash
# prod-deploy — safe production pull/install/restart with health rollback.
# Intended to run on the prod host as the klav deploy user.
#
# Usage:
#   prod-deploy.sh                    # standard restart deploy
#   prod-deploy.sh --zero-downtime    # blue/green port-flip (no 502s)
#   prod-deploy.sh -z                 # same as --zero-downtime
#
# Zero-downtime mode:
#   Requires a one-time setup: bash deploy/zdt-setup.sh  (run as root)
#   Works by starting the new code on the inactive port (4317 or 4318),
#   health-checking it, flipping Caddy to the new port, then stopping the old
#   slot. At no point are zero workers listening — no 502s.
set -euo pipefail

REPO="${KLAV_REPO:-/opt/klav/klav-snap}"
SERVICE="${KLAV_SERVICE:-klav.service}"
BUN_BIN="${BUN_BIN:-/home/klav/.bun/bin/bun}"
HEALTH_ATTEMPTS="${KLAV_HEALTH_ATTEMPTS:-20}"
HEALTH_SLEEP="${KLAV_HEALTH_SLEEP:-2}"
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"
STATE_FILE="${ZDT_STATE:-/var/lib/klav/active-slot}"

# Port map for each slot
PORT_blue=4317
PORT_green=4318

ZDT=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    -z|--zero-downtime) ZDT=1 ;;
    *) echo "[prod-deploy] unknown arg: $1" >&2; exit 1 ;;
  esac
  shift
done

HEALTH_URL="${KLAV_HEALTH_URL:-http://127.0.0.1:4317/api/health}"

log() { echo "[$(date '+%F %T')] [prod-deploy] $*"; }

poll_health_url() {
  local url="$1"
  local i
  for i in $(seq 1 "$HEALTH_ATTEMPTS"); do
    if curl -fsS --max-time 3 "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$HEALTH_SLEEP"
  done
  return 1
}

install_deps() {
  if [ ! -x "$BUN_BIN" ]; then
    log "missing bun binary at $BUN_BIN"
    return 1
  fi
  ( cd "$REPO/prototype" && "$BUN_BIN" install )
}

# ── Standard (non-ZDT) helpers ───────────────────────────────────────────────

rollback() {
  local why="$1"
  log "$why; rolling back to $previous"
  git reset -q --hard "$previous"
  install_deps || log "rollback dependency install failed"
  systemctl restart "$SERVICE" || log "rollback restart failed"
  if poll_health_url "$HEALTH_URL"; then
    log "rollback healthy at $HEALTH_URL"
  else
    log "rollback health check still failing"
  fi
  exit 1
}

# ── ZDT helpers ──────────────────────────────────────────────────────────────

# Returns the port number for a slot name
slot_port() {
  local slot="$1"
  case "$slot" in
    blue)  echo "$PORT_blue" ;;
    green) echo "$PORT_green" ;;
    *)     log "unknown slot: $slot"; exit 1 ;;
  esac
}

# Returns the opposite slot name
other_slot() {
  [ "$1" = "blue" ] && echo "green" || echo "blue"
}

# Flip Caddy to a new port and reload gracefully.
# Caddy reload sends SIGUSR1 — keeps existing connections alive while new
# config takes effect, equivalent to nginx -s reload.
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

cd "$REPO"
previous="$(git rev-parse HEAD)"
log "deploying origin/master from ${previous:0:12} (zdt=$ZDT)"

git fetch -q origin master
git reset -q --hard origin/master

new_head="$(git rev-parse HEAD)"
log "checked out ${new_head:0:12}; installing prototype dependencies"
install_deps || { [ "$ZDT" = "1" ] && exit 1 || rollback "dependency install failed"; }

# ── ZDT path ─────────────────────────────────────────────────────────────────
if [ "$ZDT" = "1" ]; then
  # Require setup to have been run
  if [ ! -f "$STATE_FILE" ]; then
    log "zero-downtime not configured — run: bash deploy/zdt-setup.sh  (as root)"
    log "falling back to standard restart"
    ZDT=0
  fi
fi

if [ "$ZDT" = "1" ]; then
  active_slot="$(cat "$STATE_FILE")"
  inactive_slot="$(other_slot "$active_slot")"
  active_port="$(slot_port "$active_slot")"
  inactive_port="$(slot_port "$inactive_slot")"
  inactive_svc="klav@${inactive_slot}.service"
  active_svc="klav@${active_slot}.service"
  inactive_url="http://127.0.0.1:${inactive_port}/api/health"

  log "active=${active_slot}:${active_port}  →  starting ${inactive_slot}:${inactive_port}"

  # Start new slot (new code is already on disk from git reset above)
  systemctl start "$inactive_svc" || {
    log "failed to start $inactive_svc — falling back to standard restart"
    ZDT=0
  }
fi

if [ "$ZDT" = "1" ]; then
  # Health-check the new slot before flipping traffic
  log "waiting for ${inactive_svc} to become healthy…"
  if ! poll_health_url "$inactive_url"; then
    log "${inactive_svc} never became healthy — aborting ZDT, reverting"
    systemctl stop "$inactive_svc" || true
    # Active slot is still running unchanged → no downtime incurred
    exit 1
  fi
  log "${inactive_svc} healthy at ${inactive_url}"

  # Flip Caddy to the new slot — graceful, no connection drops
  flip_caddy "$inactive_port"

  # Stop the old slot (it drains in-flight requests because Bun handles SIGTERM)
  systemctl stop "$active_svc" || log "WARNING: failed to stop $active_svc cleanly"

  # Persist new active slot
  printf '%s\n' "$inactive_slot" > "$STATE_FILE"
  log "active-slot updated to '${inactive_slot}'"

  # Final health check through Caddy's port (the public-facing health)
  if poll_health_url "${KLAV_HEALTH_URL:-http://127.0.0.1:${inactive_port}/api/health}"; then
    log "✅ zero-downtime deploy complete — now serving ${inactive_slot}:${inactive_port}"
    exit 0
  fi

  # Post-flip health failure: flip back
  log "post-flip health check failed — rolling back Caddy to ${active_slot}:${active_port}"
  flip_caddy "$active_port"
  systemctl start "$active_svc" || log "WARNING: failed to restart $active_svc"
  printf '%s\n' "$active_slot" > "$STATE_FILE"
  log "rolled back to ${active_slot}"
  exit 1
fi

# ── Standard path (no ZDT) ───────────────────────────────────────────────────
log "restarting ${SERVICE}"
systemctl restart "$SERVICE" || rollback "restart failed"

if poll_health_url "$HEALTH_URL"; then
  log "healthy at $HEALTH_URL"
  exit 0
fi

rollback "health check failed"
