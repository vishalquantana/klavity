# Klavity — Production Deploy Runbook

Everything a new engineer needs to deploy, operate, and recover the Klavity
production service. If you read one file before touching prod, read this one.

- **Live site:** https://klavity.in
- **Host:** Vultr VPS, `66.135.20.62` (1 GB box; stateless proxy — DB is Turso, files are S3)
- **App:** a single Bun server — `prototype/server.ts` — served behind Caddy (auto-HTTPS)
- **Repo:** https://github.com/vishalquantana/klavity.git (checked out on the box at `/opt/klav`)
- **Deploy user:** `klav` · **Secrets:** `/etc/klav/klav.env` (chmod 600, owned by `klav`)

> **The golden rule:** you almost never deploy by hand. **Push to `master` and prod
> deploys itself** within ~30s via the autodeploy loop (zero-downtime blue/green with
> health-rollback). Manual steps below are for first-time setup and incident recovery only.

---

## 1. Architecture at a glance

```
 developer push ──► GitHub origin/master
                          │
                          ▼   (autodeploy loop on the box polls every ~12s)
   ┌──────────────────────────────────────────────────────────────┐
   │  Vultr box (66.135.20.62)                                      │
   │                                                                │
   │   Caddy :443  ──reverse_proxy──►  127.0.0.1:4317  (blue slot)  │
   │   (auto-TLS)                       or :4318       (green slot)  │
   │                                        │                       │
   │                             bun run prototype/server.ts        │
   │                                        │                       │
   └────────────────────────────────────────┼───────────────────────┘
                                             ▼
        Turso/libSQL (DB)  ·  S3 (screenshots/replays)  ·  OpenRouter (AI)
        SendGrid (OTP mail) ·  PostHog (analytics)  ·  Slack (signup alerts)
```

- **One process, no build step.** `server.ts` runs directly under Bun. Deploy = `git pull` +
  `bun install` + restart. There is no bundler/transpile stage for the server.
- **Stateless box.** All state is external (Turso DB, S3 files). You can rebuild the box from
  scratch with §7 and lose nothing but uptime.
- **Blue/green slots.** Two systemd units — `klav@blue` (port 4317) and `klav@green` (4318).
  Only one is live at a time; Caddy points at the live one. Deploys flip between them.

---

## 2. Everyday deploy — just push

The prod box runs an **autodeploy loop** that polls `origin/master` every ~12s. On a new
commit it runs `scripts/autodeploy.sh`:

1. `git fetch` + `git reset --hard origin/master` (theirs-wins; box never diverges)
2. `bun install` in `prototype/`
3. Start the **inactive** slot on its port with the new code
4. Health-check it (`/api/health`), then **verify the served commit matches** the deployed
   commit (`/api/version`) — guards against a stale orphan squatting the port
5. Flip Caddy to the new slot (graceful reload — no dropped connections)
6. **Drain** the old slot (wait for in-flight AutoSim/Sim work to finish, capped at 120s)
7. Stop the old slot; write the new active slot to `/var/lib/klav/active-slot`
8. If any step fails, it **aborts before the flip** and leaves the old slot serving — no downtime

So the normal workflow is simply:

```bash
git push origin master     # (or let the merge-train do it — see §3)
# ~30s later prod is live on the new commit
```

**Confirm it actually shipped** (never trust git HEAD or a log line — verify the serving process):

```bash
curl -s https://klavity.in/api/version    # → {"commit":"<sha>","startedAt":...,"pid":...}
curl -s https://klavity.in/api/health     # → {"status":"ok"}
```

The `commit` returned must match the sha you pushed. `startedAt` should be recent.

---

## 3. How code gets to `master` (the merge-train)

This repo is a **multi-agent workspace**. Nobody commits to `master` directly — a shared git
hook rejects it. Instead:

- Work happens in **worktrees** on `feat/*` branches (`bash scripts/new-worktree.sh <name>`).
- A **merge-train** (`scripts/merge-loop.sh` → `scripts/merge-train.sh`, running on the
  orchestrator's laptop) integrates every `feat/*` branch into `master`, stamps a single
  version bump, and pushes. It is the **only writer** of `master`.
- Prod's autodeploy loop (§2) picks up that push and deploys.

If you are a solo dev without the merge-train, you can push to `master` yourself from a
machine where the hook isn't installed, or disable the hook — but keep **one writer** to avoid
clobbering. Two independent writers to `master` is the classic way to ship stale code.

**Version stamping:** `package.json` `version` is the single source of truth
(`__APP_VERSION__` placeholder is injected into HTML at serve time). The merge-train owns the
bump — don't hand-edit versions in `package.json` / `CHANGELOG.md` / `docs/PRD.md`.

---

## 4. Before you ship — quality gate

The autodeploy loop does **not** run your tests. Own quality on your branch:

```bash
cd prototype
bun test                     # unit/integration — must be green
# run the relevant journey/ e2e if your change touches those flows
```

Repo-level static checks (the merge-train / CI enforce some of these — run them if your change
touches HTML/inline JS, pricing JSON-LD, icons, or DB):

```bash
node scripts/check-inline-js.mjs        # curly-quote / broken inline <script> guard
node scripts/check-inline-defs.mjs
node scripts/check-no-emoji.mjs
node scripts/check-jsonld-pricing.mjs
node scripts/check-ts-bindings.mjs      # TS2304-style missing-binding sweep
```

TypeScript gotcha: `server.ts` is **not** in the Bun tsconfig. Net-new `tsc`/TS2304 errors get
silently reverted by the merge-train's tsc gate — new `chrome.*` refs in the extension need a
`chrome-global.d.ts` entry **in the same branch diff**.

---

## 5. Environment / secrets

All runtime config is in **`/etc/klav/klav.env`** on the box (loaded by systemd into
`server.ts` via `process.env.*`). The committed template with every variable documented is
**`deploy/klav.env.example`**. Never commit the real file.

Required to boot:

| Var | Purpose |
|-----|---------|
| `PORT` | 4317 (blue) / 4318 (green) — set per-slot in `klav-blue.env` / `klav-green.env` |
| `KLAV_BASE_URL` | `https://klavity.in` — used for OTP links, callbacks, presigned hosts |
| `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Turso/libSQL database (all app data) |
| `KLAV_SECRET` | AES-GCM-256 key (base64 → **exactly 32 bytes**) for connector-secret encryption. Rotating it **orphans existing ciphertext** — see `docs/security/SECRET-ROTATION.md` |
| `OPENROUTER_API_KEY` | AI (Sims/AutoSim vision). Set a **hard monthly credit cap** on this key |
| `SENDGRID_API_KEY`, `KLAV_MAIL_FROM` | OTP login email + lead alerts. Must be from an account whose DKIM matches `klavity.in` |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_FOLDER`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Screenshot/replay storage |

Useful optionals: `KLAV_MODEL` (AI model), `OPS_ADMIN_EMAILS` (unlocks `/opsadmin`),
`OPS_DAILY_CAP_USD`, `KLAV_ALLOWED_DOMAINS`/`KLAV_ALLOWED_EMAILS` (OTP allowlist),
`SLACK_SIGNUP_WEBHOOK_URL`, `KLAV_POSTHOG_KEY`, `KLAV_INTERNAL_DOMAINS`.

**Never set in prod** (dev/test toggles): `KLAV_DEV_SHOW_OTP`, `KLAV_TEST_ALLOW_LOOPBACK`,
`KLAV_TEST_OTP`. Each weakens auth or the SSRF guard.

After editing `klav.env`, restart the live slot (see §6) — env is read at boot only.

> **Connector secrets** (Plane/Jira/GitHub/Linear tokens) are **not** env vars — they're
> entered per-project in the UI and stored AES-GCM-encrypted in the DB using `KLAV_SECRET`.

---

## 6. Manual operations cheat-sheet

SSH in as needed; the app runs as user `klav`. Find the live slot first:

```bash
cat /var/lib/klav/active-slot          # → blue | green
```

**Manual zero-downtime deploy** (what the loop does, run by hand):

```bash
bash /opt/klav/scripts/autodeploy.sh                 # blue/green flip + drain (canonical)
# or, equivalently:
bash /opt/klav/klav-snap/scripts/prod-deploy.sh --zero-downtime
```

**Restart the live slot** (e.g. after editing `klav.env`):

```bash
systemctl restart klav@$(cat /var/lib/klav/active-slot)      # as root
curl -s http://127.0.0.1:$(cat /var/lib/klav/active-slot | grep -q blue && echo 4317 || echo 4318)/api/health
```

**Logs:**

```bash
journalctl -u klav@blue -f       # blue slot
journalctl -u klav@green -f      # green slot
journalctl -u caddy -f           # TLS / proxy
```

**Health / identity probes** (loopback, no auth):

```bash
curl -s http://127.0.0.1:4317/api/health        # {"status":"ok"}
curl -s http://127.0.0.1:4317/api/version       # {"commit":...} — which sha this PID runs
curl -s http://127.0.0.1:4317/api/health/busy   # {"busy":N} — in-flight Sim/AutoSim work
```

**Caddy** is at `/etc/caddy/Caddyfile` (a `reverse_proxy 127.0.0.1:<port>` line the deploy
scripts rewrite). Reload after manual edits: `systemctl reload caddy`.

---

## 7. First-time / rebuild-from-scratch setup

Full detail lives in **`deploy/README.md`** — that is the authoritative provisioning guide.
Summary of the sequence:

1. **DNS:** A record `klavity.in → <SERVER_IP>` (DNS-only). Cert issuance needs it to resolve.
2. **Base box (root):** `apt update && apt upgrade`, install `git ufw`, create user `klav`,
   `ufw allow OpenSSH/80/443 && ufw enable`.
3. **Bun (as klav):** `curl -fsSL https://bun.sh/install | bash` — note `~/.bun/bin/bun`.
4. **Clone + first deploy (as klav):** run `deploy/deploy.sh` — clones into `/opt/klav`.
5. **Secret (root):** create `/etc/klav/klav.env` from `deploy/klav.env.example`, paste real
   values, `chown klav:klav`, `chmod 600`.
6. **systemd (root):** install `deploy/klav.service`, `systemctl enable --now klav`, verify
   `curl 127.0.0.1:4317/api/health` → 200.
7. **Caddy (root):** install Caddy, copy `deploy/Caddyfile`, `systemctl reload caddy`. Visit
   https://klavity.in (auto-issues cert on first request).
8. **Enable zero-downtime (root, once at low traffic):**
   ```bash
   cp /opt/klav/klav-snap/deploy/klav@.service /etc/systemd/system/klav@.service
   bash /opt/klav/klav-snap/deploy/zdt-setup.sh
   ```
   This writes `klav-blue.env` (4317) / `klav-green.env` (4318), migrates the live process to
   `klav@blue`, points Caddy at 4317, and seeds `/var/lib/klav/active-slot`.
9. **Wire the autodeploy loop.** The loop that polls `origin/master` and runs
   `scripts/autodeploy.sh` runs on the box (a systemd timer/service or a `while` loop as user
   `klav`) — it is **configured on the box, not in the repo**. Verify it's running:
   `pgrep -af autodeploy` / `systemctl status 'klav-autodeploy*'`. Point it at
   `/opt/klav/scripts/autodeploy.sh` and give it push access to fetch `origin/master`.

Verify ZDT is healthy:

```bash
systemctl show klav@blue -p ExecStart      # → bun run server.ts
curl -s http://127.0.0.1:4317/api/health   # → ok
cat /var/lib/klav/active-slot              # → blue
```

---

## 8. Rollback & incident recovery

**Fast rollback (bad commit shipped):** revert on `master` and let the loop redeploy —
forward-fix is preferred because the box always tracks `origin/master`.

```bash
git revert <bad-sha> && git push origin master     # loop redeploys the revert in ~30s
```

The deploy scripts also **self-rollback**: if the new slot fails health/version/restart checks,
they abort before flipping Caddy (old slot keeps serving), or flip Caddy back if a post-flip
health check fails.

**Manual pin to a known-good commit on the box:**

```bash
cd /opt/klav && git reset --hard <good-sha>
bash /opt/klav/scripts/autodeploy.sh || systemctl restart klav@$(cat /var/lib/klav/active-slot)
curl -s https://klavity.in/api/version    # confirm the good sha is now served
```

### Known failure modes (learned the hard way)

- **Prod serving stale code despite a green deploy.** Almost always a **port squatter** — a
  manually-started `bun run server.ts` orphan holding 4317/4318. Caddy hits the orphan (returns
  200) while the real systemd slot crash-loops on `EADDRINUSE`. The KLA-750 guards in
  `autodeploy.sh` now kill non-systemd squatters and assert served-commit == deployed-commit
  before flipping. Diagnose: `ss -ltnp 'sport = :4317'` / `:4318`, compare PIDs to
  `systemctl show -p MainPID klav@blue`. Fix: kill the orphan, `systemctl restart klav@<slot>`.
- **Verify at the process level, not git HEAD.** A passing git HEAD, autodeploy log line, or
  on-disk file can all be green while an orphan serves old bytes. The truth is
  `curl /api/version` (the sha the live PID booted with) + `ss/ps`.
- **A deploy script can't fix its own bug in the same cycle** — it parses the *old* functions
  before it `git reset`s to the fix. If the deploy mechanism itself is broken, fix it, then run
  it **manually once** to bootstrap the corrected version.
- **nginx vs Caddy port fight.** On reboot nginx can grab `:80` before Caddy, breaking TLS
  renewal. nginx should be disabled on boot; if TLS breaks: `systemctl stop nginx && systemctl
  restart caddy`.
- **OTP mail outage.** SendGrid key must be from the account whose DKIM matches `klavity.in`.
  A key from the wrong account silently fails delivery — swap the key and restart.

---

## 9. Extension (separate deploy path)

The Chrome extension in `packages/extension` does **not** auto-deploy with the server. Any
change there requires a **manual Chrome Web Store re-upload** of the built zip. The server and
extension are kept at feature parity (shared `buildModal`) — if you change one modal/menu path,
change both, and remember the store upload. See `docs/chrome-web-store-listing.md`.

---

## 10. Quick reference

| Thing | Where |
|-------|-------|
| Provisioning guide (authoritative) | `deploy/README.md` |
| Env template (every var documented) | `deploy/klav.env.example` |
| Live env (secrets) | `/etc/klav/klav.env` on box (chmod 600, user `klav`) |
| Canonical deploy loop logic | `scripts/autodeploy.sh` |
| Manual deploy (with fallback) | `scripts/prod-deploy.sh [--zero-downtime]` |
| One-time ZDT setup | `deploy/zdt-setup.sh` |
| systemd units | `deploy/klav.service`, `deploy/klav@.service` |
| Caddy config | `deploy/Caddyfile` → `/etc/caddy/Caddyfile` on box |
| Active slot | `/var/lib/klav/active-slot` |
| Health / version / busy | `/api/health`, `/api/version`, `/api/health/busy` |
| Secret rotation | `docs/security/SECRET-ROTATION.md` |
| Merge-train (master writer) | `scripts/merge-loop.sh`, `scripts/merge-train.sh` |

**One-liner to confirm prod is healthy and current:**

```bash
curl -s https://klavity.in/api/version && echo && curl -s https://klavity.in/api/health
```
