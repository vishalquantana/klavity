# Deploying Klav to `klavity.in` (1 GB Vultr)

Serves the Bun prototype (the live core-loop demo: `/`, `/home`, `/onboarding`) behind
Caddy with automatic HTTPS. The box is a stateless proxy to OpenRouter — 1 GB is comfortable.

## 0. DNS (do this first, it propagates while you set up)

Add an **A record**: `klavity.in → <SERVER_IP>` (proxy off / "DNS only").
Caddy needs the name to resolve to the box to issue the Let's Encrypt cert.

## 1. Base box (as root)

```bash
apt update && apt -y upgrade
apt -y install git ufw
adduser --disabled-password --gecos "" klav
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable
```

## 2. Install Bun (as the klav user)

```bash
su - klav
curl -fsSL https://bun.sh/install | bash
~/.bun/bin/bun --version   # confirm; note the path for the systemd unit
exit
```

## 3. Clone + first deploy (as klav)

```bash
su - klav
curl -fsSL https://raw.githubusercontent.com/vishalquantana/klav-snap/master/deploy/deploy.sh -o deploy.sh
bash deploy.sh        # clones into /opt/klav (service restart is skipped until step 5)
exit
```

## 4. Secret (as root)

```bash
mkdir -p /etc/klav
cp /opt/klav/deploy/klav.env.example /etc/klav/klav.env
nano /etc/klav/klav.env          # paste the real OPENROUTER_API_KEY
chown klav:klav /etc/klav/klav.env && chmod 600 /etc/klav/klav.env
```

## 5. systemd service (as root)

```bash
cp /opt/klav/deploy/klav.service /etc/systemd/system/klav.service
# edit ExecStart to match `which bun` for the klav user if it differs from /home/klav/.bun/bin/bun
systemctl daemon-reload && systemctl enable --now klav
systemctl status klav --no-pager        # should be active (running)
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4317/   # → 200
```

## 6. Caddy (TLS + reverse proxy, as root)

```bash
apt -y install debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt -y install caddy
cp /opt/klav/deploy/Caddyfile /etc/caddy/Caddyfile
systemctl reload caddy
```

Visit **https://klavity.in** — Caddy auto-issues the cert on first request.

## 7. Lock down the public demo (strongly recommended)

It's a public URL on a **paid** API key. Before sharing:
- **Gate it:** `caddy hash-password --plaintext 'somepass'`, paste into the `basic_auth` block in `/etc/caddy/Caddyfile`, `systemctl reload caddy`.
- **Cap spend:** set a hard monthly credit limit on the OpenRouter key.
- Optional: switch `KLAV_MODEL` to `anthropic/claude-haiku-4.5` for the cheapest demo reactions.

## Updating later

```bash
su - klav -c 'bash /opt/klav/deploy/deploy.sh'   # pull + restart
```

## Zero-Downtime Deployments (blue/green)

Eliminates the ~2–5 s 502 window during `systemctl restart`. Uses two Bun
slots (blue on 4317, green on 4318); Caddy is flipped between them gracefully.

### One-time setup (run once as root at low traffic)

```bash
cp /opt/klav/klav-snap/deploy/klav@.service /etc/systemd/system/klav@.service
bash /opt/klav/klav-snap/deploy/zdt-setup.sh
```

This installs the `klav@.service` template, creates `/etc/klav/klav-blue.env`
and `klav-green.env`, migrates the live process from `klav.service` to
`klav@blue.service`, and sets the initial active-slot state. Caddy is untouched
if already pointed at port 4317.

Verify:
```bash
systemctl show "klav@blue" -p ExecStart   # should show bun run server.ts
curl -s http://127.0.0.1:4317/api/health  # → {"status":"ok"}
cat /var/lib/klav/active-slot             # → blue
```

### Every deploy after that

```bash
bash /opt/klav/klav-snap/scripts/prod-deploy.sh --zero-downtime
```

What happens:
1. `git pull` + `bun install` — new code on disk
2. Start inactive slot (e.g. `klav@green.service` on port 4318)
3. Health-check green; abort + leave blue running if unhealthy
4. `sed` Caddyfile to new port + `systemctl reload caddy` (graceful — no drops)
5. Stop old slot (`klav@blue.service`)
6. Write new active-slot state

The standard `prod-deploy.sh` (no flag) still works unchanged — falls back to
`systemctl restart` with health-rollback.

### How it maps to the spec's Gunicorn approach

| Gunicorn/nginx (spec)          | This implementation (Bun/Caddy)         |
|--------------------------------|-----------------------------------------|
| `SIGHUP` to Gunicorn master    | Start inactive slot on new port         |
| New workers boot with new code | `klav@green.service` imports new code   |
| Old workers drain              | Old slot gets `systemctl stop` (SIGTERM)|
| `nginx -s reload` proxy flip   | Caddy Caddyfile sed + `systemctl reload`|
| `--preload off` requirement    | N/A — Bun starts fresh each time        |

Bun starts in ~1–2 s so the overlap window is short. The socket/port that
Caddy proxies to **never goes to zero workers** between the health-check and
the Caddy flip.

## Logs

```bash
journalctl -u klav -f          # app (standard deploy)
journalctl -u "klav@blue" -f   # blue slot (ZDT)
journalctl -u "klav@green" -f  # green slot (ZDT)
journalctl -u caddy -f         # TLS / proxy
cat /var/lib/klav/active-slot  # which slot is live right now
```
