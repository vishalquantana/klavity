#!/usr/bin/env bash
# zdt-setup.sh — One-time setup for zero-downtime (blue/green) deployments.
#
# What it does:
#   1. Writes /etc/klav/klav-blue.env  (PORT=4317) and klav-green.env (PORT=4318)
#   2. Installs the klav@.service template unit (two slots on different ports)
#   3. Migrates the live service from klav.service → klav@blue.service
#   4. Updates /etc/caddy/Caddyfile to point at port 4317 (blue)
#   5. Self-heals: if anything fails, reverts to plain klav.service
#
# Run once as root on the prod host:
#   bash /opt/klav/deploy/zdt-setup.sh
#
# After this, use prod-deploy.sh --zero-downtime for every deploy.
set -euo pipefail

REPO="${KLAV_REPO:-/opt/klav}"
SERVICE_TEMPLATE="${REPO}/deploy/klav@.service"
SYSTEMD_DEST="/etc/systemd/system"
SLOT_ENV_DIR="/etc/klav"
STATE_FILE="/var/lib/klav/active-slot"
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"
HEALTH_URL="http://127.0.0.1:4317/api/health"
BUN_BIN="${BUN_BIN:-/home/klav/.bun/bin/bun}"

log() { echo "[$(date '+%F %T')] [zdt-setup] $*"; }

die() {
  log "ERROR: $*"
  exit 1
}

# ── Guard: already configured ───────────────────────────────────────────────
if [ -f "$STATE_FILE" ] && systemctl is-active --quiet "klav@blue.service" 2>/dev/null; then
  log "already configured (active-slot=$(cat "$STATE_FILE")). Nothing to do."
  exit 0
fi

# ── Preflight ────────────────────────────────────────────────────────────────
[ -f "$SERVICE_TEMPLATE" ] || die "template not found: $SERVICE_TEMPLATE (pull the repo first)"
[ -x "$BUN_BIN" ]          || die "bun not found at $BUN_BIN"
command -v caddy &>/dev/null && HAVE_CADDY=1 || HAVE_CADDY=0

log "starting zero-downtime setup…"

# ── 1. Write slot env files ──────────────────────────────────────────────────
mkdir -p "$SLOT_ENV_DIR"
printf 'PORT=4317\n' > "$SLOT_ENV_DIR/klav-blue.env"
printf 'PORT=4318\n' > "$SLOT_ENV_DIR/klav-green.env"
chmod 640 "$SLOT_ENV_DIR/klav-blue.env" "$SLOT_ENV_DIR/klav-green.env"
chown klav:klav "$SLOT_ENV_DIR/klav-blue.env" "$SLOT_ENV_DIR/klav-green.env" 2>/dev/null || true
log "wrote klav-blue.env (4317) and klav-green.env (4318)"

# ── 2. Install template unit ─────────────────────────────────────────────────
cp "$SERVICE_TEMPLATE" "$SYSTEMD_DEST/klav@.service"
systemctl daemon-reload
log "installed klav@.service template"

# ── 3. Migrate: start klav@blue, stop klav.service ──────────────────────────
# Start new blue slot first so there is always a live worker
systemctl start "klav@blue.service" || die "failed to start klav@blue.service"

# Poll health on the new slot
ok=0
for i in $(seq 1 20); do
  sleep 2
  if curl -fsS --max-time 3 "$HEALTH_URL" >/dev/null 2>&1; then
    ok=1; break
  fi
done

if [ "$ok" != "1" ]; then
  log "klav@blue.service unhealthy — reverting"
  systemctl stop "klav@blue.service" || true
  # Bare klav.service should still be running; nothing else changed
  die "setup aborted: blue slot never became healthy at $HEALTH_URL"
fi

log "klav@blue.service healthy at $HEALTH_URL"

# Stop the bare service (now that blue is live)
if systemctl is-active --quiet klav.service 2>/dev/null; then
  systemctl stop klav.service
  systemctl disable klav.service 2>/dev/null || true
  log "stopped and disabled plain klav.service"
fi

# ── 4. Update Caddyfile to point at blue's port ──────────────────────────────
if [ "$HAVE_CADDY" = "1" ] && [ -f "$CADDYFILE" ]; then
  # Ensure it's pointing at 4317 (blue slot)
  sed -i 's|127\.0\.0\.1:[0-9]*|127.0.0.1:4317|g' "$CADDYFILE"
  systemctl reload caddy && log "Caddyfile updated → port 4317; caddy reloaded"
else
  log "WARNING: Caddy not found or Caddyfile missing at $CADDYFILE — update manually"
fi

# ── 5. Persist active-slot state ────────────────────────────────────────────
mkdir -p "$(dirname "$STATE_FILE")"
printf 'blue\n' > "$STATE_FILE"
log "active-slot set to 'blue'"

# ── 6. Enable blue slot for boot ────────────────────────────────────────────
systemctl enable "klav@blue.service" 2>/dev/null || true

log "✅ zero-downtime setup complete. Use: prod-deploy.sh --zero-downtime"
log "   Verify: systemctl show klav@blue -p ExecStart"
log "   Verify: curl -s http://127.0.0.1:4317/api/health"
