# Klavity — Developer Handover

Last updated: 2026-07-21

---

## 1. What this is

Klavity is an AI-powered QA platform. Three product surfaces:

- **Snap** — right-click widget + Chrome extension; users file bug reports
- **Sims** — AI personas that review pages and surface friction/regressions
- **AutoSim (Trails)** — autonomous AI agent that runs through step-by-step flows and regresses them on a schedule

Stack: Bun + TypeScript server (`prototype/server.ts`), Turso (libSQL/SQLite in the cloud), S3 for screenshots, SendGrid for email, OpenRouter for LLM calls, Stripe for billing, PostHog for analytics.

---

## 2. Repositories and access

| Resource | Location |
|----------|----------|
| Main repo | `github.com/vishalquantana/klavity` (was `klav-snap`; old URL redirects) |
| Prod server | Vultr VPS — `66.135.20.62` (root SSH) |
| Project tracker | Self-hosted Plane at `plane.qbuilder.dev`, project `KLAVITYKLA` |
| Domain | `klavity.in` (Cloudflare DNS → Vultr) |

### Cloning and initial setup
```bash
git clone git@github.com:vishalquantana/klavity.git klav-snap
cd klav-snap/prototype
cp .env.example .env   # fill in secrets (see §3)
bun install
bun run server.ts      # starts on PORT (default 3000)
```

Run tests:
```bash
cd prototype
bun test               # ~3,000 tests, should be green
```

---

## 3. Environment variables

All production secrets live in `/etc/klav/klav.env` on the prod server. For local dev, copy to `prototype/.env`.

### Core app

| Variable | Purpose |
|----------|---------|
| `KLAV_SECRET` | Session-cookie signing key (random 32-char string) |
| `KLAV_BASE_URL` | Public URL e.g. `https://klavity.in` |
| `KLAV_ALLOWED_DOMAINS` | CORS allowlist (comma-separated) |
| `PORT` | HTTP port (prod blue=4317, green=4318) |

### Database

| Variable | Purpose |
|----------|---------|
| `TURSO_DATABASE_URL` | libSQL URL e.g. `libsql://klavity-xxx.turso.io` |
| `TURSO_AUTH_TOKEN` | Turso JWT token |

### Email (SendGrid)

| Variable | Purpose |
|----------|---------|
| `SENDGRID_API_KEY` | SendGrid API key |
| `KLAV_MAIL_FROM` | FROM address — should be `noreply@klavity.in` |

> **DNS action needed:** Add `klavity.in` as an authenticated sender domain in SendGrid → Sender Authentication so DKIM/SPF pass. Without this OTP emails land in spam.

### AI / LLM

| Variable | Purpose |
|----------|---------|
| `OPENROUTER_API_KEY` | OpenRouter key — all LLM calls route through here |
| `KLAV_MODEL` | Default model e.g. `anthropic/claude-3-5-sonnet` |
| `OPS_DAILY_CAP_USD` | Display-only daily AI spend cap (not enforced yet) |

### Storage (S3-compatible)

| Variable | Purpose |
|----------|---------|
| `AWS_ACCESS_KEY_ID` | S3 key |
| `AWS_SECRET_ACCESS_KEY` | S3 secret |
| `S3_BUCKET` | Bucket name |
| `S3_ENDPOINT` | S3-compatible endpoint URL |
| `S3_REGION` | Region |
| `S3_FOLDER` | Key prefix |

### Billing (Stripe)

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |

### Plane (ticket tracker)

Two sets — one for the Klavity-internal self-hosted Plane, one for the Klavity product's own connector feature:

| Variable | Purpose |
|----------|---------|
| `PLANE_API_KEY` | Key for `plane.qbuilder.dev` (dev issue tracker) |
| `PLANE_API_HOST` | `https://plane.qbuilder.dev` |
| `PLANE_PROJECT_ID` | `05ea72ad-a53f-46d5-b37e-7874ce2a65b4` |
| `PLANE_WORKSPACE` | `qbuilder` |
| `KLAV_TICKETS_PLANE_KEY` | Key the server uses for the *product's* Plane connector |
| `KLAV_TICKETS_PLANE_HOST` | Host for the product's connector |
| `KLAV_TICKETS_PLANE_PROJECT` | Project UUID for the product connector |
| `KLAV_TICKETS_PLANE_WORKSPACE` | Workspace slug for the product connector |

### Observability / Alerts

| Variable | Purpose |
|----------|---------|
| `SLACK_SIGNUP_WEBHOOK_URL` | Slack webhook — fires on every new signup |
| `SLACK_ERROR_WEBHOOK_URL` | Slack webhook — fires on server errors |
| `KLAV_POSTHOG_KEY` | PostHog project API key (server-side events) |
| `OPS_ADMIN_EMAILS` | Comma-separated emails with `/opsadmin` access |

### AutoSim / Steel browser

| Variable | Purpose |
|----------|---------|
| `AUTOSIM_CDP_URL` | `wss://connect.steel.dev` — activates Steel.dev cloud browser |
| `STEEL_API_KEY` | Steel.dev API key |
| `STEEL_REGION` | Steel region e.g. `iad` |
| `TRAILS_DEMO_PROJECT_ID` | Project ID used for the public demo AutoSim |

### Feature flags / gates

| Variable | Purpose | Default |
|----------|---------|---------|
| `KLAV_TEST_OTP` | Enables fixed OTP `666666` for test accounts | OFF |
| `KLAV_TEST_OTP_EMAILS` | Comma-separated emails that get the test OTP | — |
| `KLAV_DEV_SHOW_OTP` | Logs OTP to console (never enable on prod) | OFF |
| `KLAV_ERROR_AUTOTICKET` | Auto-files JS errors as Plane tickets | OFF |
| `KLAV_PARTNER_CODES` | Comma-separated partner promo codes | — |

---

## 4. Deployment process

### How deploys happen (fully automated)

**You never SSH to deploy.** The flow is:

```
Commit on feat/* branch
        ↓
Merge-train (laptop) — integrates feat/* → master, bumps version, pushes
        ↓
Prod server's autodeploy loop — polls origin/master every 12s, zero-downtime blue/green flip
        ↓
Live within ~30s of your last push
```

### Merge-train (runs on your laptop)

The merge-train script is the SOLE writer of `master`. Start it once and leave it:

```bash
# Start (one instance only — check pgrep first)
pgrep -fl merge-loop || python3 -c "
import subprocess, os
subprocess.Popen(
  ['bash', '/path/to/klav-snap/scripts/merge-loop.sh'],
  stdout=open(os.path.expanduser('~/.config/klav-orchestrator/merge-loop.out'), 'a'),
  stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, start_new_session=True
)"

# Watch the log
tail -f /tmp/merge-loop.log
```

The merge-train:
1. Detects every `feat/*` branch with new commits
2. Merges onto master (theirs-wins strategy)
3. Runs integrity gates: boot-smoke, TS2304 binding check, DB schema audit
4. Bumps patch version in `package.json` and 4 other manifest files
5. Pushes to origin/master → prod picks it up in ≤12s

**Never commit directly to master.** A git hook blocks it.

### Prod autodeploy (runs on the server, always on)

Service: `klav-autodeploy.service` (systemd). Every 12s it runs `scripts/autodeploy.sh`:

1. `git fetch origin master` — if nothing new, exits immediately
2. `git reset --hard origin/master` + `bun install`
3. Starts the **inactive** slot (blue or green) on its port
4. Waits for `/api/health` 200 from the new slot
5. Flips Caddy to route traffic to the new slot
6. Drains the old slot (waits up to 120s for in-flight AutoSim/Sim work to finish)
7. Stops the old slot
8. If post-flip health fails → rolls Caddy back to the old slot

Slots and ports:
- `klav@blue.service` → port 4317
- `klav@green.service` → port 4318
- Caddy proxies `klavity.in` → whichever slot is active

### Watching prod

```bash
# Autodeploy logs (NOT /var/log — use journalctl)
journalctl -u klav-autodeploy -f

# App logs (active slot)
journalctl -u klav@blue -f

# Current version
ssh root@66.135.20.62 'cd /opt/klav && git rev-parse --short HEAD && grep -m1 version package.json'
```

### Manual emergency intervention

Only if the autodeploy loop itself is broken:

```bash
ssh root@66.135.20.62
systemctl stop klav-autodeploy          # pause the loop
cd /opt/klav
git fetch origin master && git reset --hard origin/master
bun install --cwd prototype
systemctl restart klav@blue             # or klav@green
systemctl start klav-autodeploy         # resume
```

---

## 5. Codebase map

```
klav-snap/
├── prototype/              # The app (Bun server + all frontend)
│   ├── server.ts           # Main server — all API routes (~5000 lines)
│   ├── lib/
│   │   ├── db.ts           # DB schema (Turso/libSQL, applySchema array)
│   │   ├── billing.ts      # Plan quotas, usage meters
│   │   ├── mail.ts         # Email via SendGrid
│   │   ├── trails.ts       # AutoSim core logic
│   │   ├── audit-log.ts    # Security audit log
│   │   └── ...
│   └── public/
│       ├── dashboard.html  # Main app UI (~700KB compiled)
│       ├── trails.html     # AutoSim authoring UI
│       ├── login.html      # Login / OTP flow
│       └── ...
├── packages/
│   ├── core/src/modal.ts   # Shared modal (widget + extension)
│   └── sdk/dist/           # Built widget bundle — COMMITTED, served verbatim
│       └── klavity-widget.iife.js
├── site/                   # Marketing site HTML
│   ├── index.html          # Homepage
│   ├── pricing.html
│   ├── bug-check.html      # Free QA tool
│   └── ...
└── scripts/
    ├── merge-train.sh      # Integration + version bump + push
    ├── merge-loop.sh       # Wraps merge-train in a resilient while-loop
    ├── autodeploy.sh       # Zero-downtime prod deploy (blue/green)
    ├── new-worktree.sh     # Create a new feat/* worktree + bun install
    ├── check-ts-bindings.mjs  # Integrity gate: catches merge-eaten imports
    └── check-db-integrity.mjs # Integrity gate: catches missing DB tables
```

### DB schema

The schema is entirely in `prototype/lib/db.ts` → `applySchema()` — a flat array of `CREATE TABLE IF NOT EXISTS` statements. Migrations are additive (new tables appended at the end). Turso runs the schema on every boot.

**Never reorder or delete entries** from the applySchema array. Always append new tables at the very end.

---

## 6. Worker / agent rules

If you're running as a sub-agent in the multi-agent orchestrator setup:

1. **Never commit or push to master.** A git hook blocks it.
2. Always work in a dedicated worktree:
   ```bash
   bash scripts/new-worktree.sh <short-task-name>
   cd ../klav-snap-wt-<name>
   ```
3. Commit freely on your `feat/<name>` branch.
4. Run `bun test` in `prototype/` before calling a task done.
5. Rebase before finishing: `git fetch origin master && git rebase origin/master`
6. Never edit `package.json` version, `CHANGELOG.md`, or manifest files — the merge-train owns those.
7. Leave the branch. The merge-train integrates it within ~90s.

---

## 7. Key gotchas

| Gotcha | Detail |
|--------|--------|
| **widget bundle** | `packages/sdk/dist/klavity-widget.iife.js` is committed and served verbatim. If you change `modal.ts`, rebuild the bundle (`cd packages/sdk && bun run build`) and commit it. Always run `node --check` on the built file. |
| **merge-eaten imports** | Theirs-wins merges silently drop imports while keeping call sites. The `check-ts-bindings.mjs` gate catches this. If you see TS2304 errors in the merge-train log, find the missing import and add it back. |
| **server.ts not in tsc** | `bunx tsc --noEmit` does NOT cover `server.ts`. The `check-ts-bindings.mjs` script works around this explicitly. |
| **DB table append-only** | Always add new tables at the END of the `applySchema` array. Concurrent agents edit db.ts; inserting in the middle causes conflicts and dropped tables. |
| **autodeploy restart trap** | Never `systemctl restart klav@blue` while autodeploy is running — it flaps. Stop autodeploy first, then restart. |
| **KLAV_TEST_OTP** | If enabled, fixed OTP `666666` lets anyone log in as any of the listed emails. Remove from `/etc/klav/klav.env` after testing. |
| **Plane UUIDs** | Always use the FULL UUID for project IDs — truncated ones match nothing. |

---

## 8. Contacts / accounts

| Service | Who has access |
|---------|----------------|
| Vultr (VPS) | vishal@quantana.com.au |
| GitHub repo | vishalquantana |
| Turso DB | vishal@quantana.com.au |
| SendGrid | vishal@quantana.com.au |
| Stripe | vishal@quantana.com.au |
| Steel.dev | vishal@quantana.com.au |
| PostHog | vishal@quantana.com.au |
| Cloudflare (DNS) | vishal@quantana.com.au |

**Test account for any smoke tests:** `vishal@quantana.com.au`

---

## 9. Common tasks

### Add a new API route
Edit `prototype/server.ts`. Find the relevant `if (req.method === "GET" && path === "/api/...")` block. Add yours before the final catch-all.

### Add a DB table
Append a `CREATE TABLE IF NOT EXISTS ...` entry at the very end of the `applySchema` array in `prototype/lib/db.ts`. Turso applies it on next boot.

### Ship a fix
```bash
bash scripts/new-worktree.sh my-fix
cd ../klav-snap-wt-my-fix/prototype
# make changes
bun test
git add <files>
git commit -m "fix: description (KLAVITYKLA-NNN)"
git fetch origin master && git rebase origin/master
# done — merge-train picks it up automatically
```

### Rebuild the widget bundle
```bash
cd packages/sdk
bun run build
node --check dist/klavity-widget.iife.js   # must pass
cd ../../
git add packages/sdk/dist/klavity-widget.iife.js packages/core/src/
git commit -m "build(widget): rebuild bundle"
```

### Check prod health
```bash
curl https://klavity.in/api/health
ssh root@66.135.20.62 'cd /opt/klav && git rev-parse --short HEAD'
journalctl -u klav-autodeploy --no-pager -n 10
```
