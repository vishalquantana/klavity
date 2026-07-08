#!/bin/bash
# prod-deploy — safe production pull/install/restart with health rollback.
# Intended to run on the prod host as the klav deploy user.
set -euo pipefail

REPO="${KLAV_REPO:-/opt/klav/klav-snap}"
SERVICE="${KLAV_SERVICE:-klav.service}"
BUN_BIN="${BUN_BIN:-/home/klav/.bun/bin/bun}"
HEALTH_URL="${KLAV_HEALTH_URL:-http://127.0.0.1:4317/api/health}"
HEALTH_ATTEMPTS="${KLAV_HEALTH_ATTEMPTS:-20}"
HEALTH_SLEEP="${KLAV_HEALTH_SLEEP:-2}"

log(){ echo "[$(date '+%F %T')] [prod-deploy] $*"; }

run_systemctl(){
  systemctl "$@"
}

poll_health(){
  local i
  for i in $(seq 1 "$HEALTH_ATTEMPTS"); do
    if curl -fsS --max-time 3 "$HEALTH_URL" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$HEALTH_SLEEP"
  done
  return 1
}

install_deps(){
  if [ ! -x "$BUN_BIN" ]; then
    log "missing bun binary at $BUN_BIN"
    return 1
  fi
  ( cd "$REPO/prototype" && "$BUN_BIN" install )
}

rollback(){
  local why="$1"
  log "$why; rolling back to $previous"
  git reset -q --hard "$previous"
  install_deps || log "rollback dependency install failed"
  run_systemctl restart "$SERVICE" || log "rollback restart failed"
  if poll_health; then
    log "rollback healthy at $HEALTH_URL"
  else
    log "rollback health check still failing"
  fi
  exit 1
}

[ -d "$REPO/.git" ] || { log "repo not found: $REPO"; exit 1; }
[ -d "$REPO/prototype" ] || { log "prototype dir not found: $REPO/prototype"; exit 1; }

cd "$REPO"
previous="$(git rev-parse HEAD)"
log "deploying origin/master from $previous"

git fetch -q origin master
git reset -q --hard origin/master

new_head="$(git rev-parse HEAD)"
log "checked out $new_head; installing prototype dependencies"
install_deps || rollback "dependency install failed"

log "restarting $SERVICE"
run_systemctl restart "$SERVICE" || rollback "restart failed"

if poll_health; then
  log "healthy at $HEALTH_URL"
  exit 0
fi

rollback "health check failed"
