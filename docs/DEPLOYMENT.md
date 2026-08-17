# Deployment

How code moves from a worker's laptop to `klavity.in` in production, with the
scripts that implement each step. There is no manual deploy step in the
common case — get a commit onto your `feat/*` branch and the rest is
automatic within roughly 30-90 seconds.

```
worker commits on feat/*
        |
        v
merge-train (laptop, scripts/merge-loop.sh -> scripts/merge-train.sh)
  - theirs-wins merge into master
  - quality gates
  - stamps one version, pushes origin/master
        |
        v
klav-autodeploy.service (prod host, scripts/autodeploy.sh, polls every ~12s)
  - git reset --hard origin/master, bun install
  - blue/green zero-downtime flip (health check -> flip Caddy -> drain -> stop old slot)
  - rolls back automatically if the new slot never becomes healthy
```

## 1. Developer workflow

1. Never commit to `master` directly. The shared git hook
   (`.git/hooks/pre-commit`, installed repo-wide) checks the current branch
   and rejects the commit unless `KLAV_ORCHESTRATOR=1` is set (only the
   merge-train sets that).
2. Work in a dedicated worktree on a `feat/<name>` branch:
   ```bash
   bash scripts/new-worktree.sh <short-task-name>
   cd ../klav-snap-wt-<name>
   ```
   `scripts/new-worktree.sh` fetches `origin/master`, creates
   `../klav-snap-wt-<slug>` on a fresh `feat/<slug>` branch off
   `origin/master`, and runs `bun install --frozen-lockfile` in
   `prototype/`. Commit freely there.
3. Run tests yourself before walking away from a branch — the merge-train
   does **not** run the full `bun test` suite (see gates below). From
   `prototype/`: `bun test`, plus any relevant `journey/` e2e.
4. Before finishing, bring the branch current so the merge-train integrates
   something recent: `git fetch origin master && git rebase origin/master`,
   then re-run `bun test`.
5. Do not edit the files the merge-train stamps: `package.json`,
   `packages/core/package.json`, `packages/extension/package.json`,
   `packages/extension/manifest.json`, `packages/sdk/package.json`, and the
   `**Version:**` line in `docs/PRD.md` (see "Version stamping" below). A
   normal `CHANGELOG.md` entry under your own feature is fine — it
   union-merges.

## 2. Merge-train (integration, runs on the orchestrator's laptop)

- `scripts/merge-loop.sh` is the sole runner of `scripts/merge-train.sh`. It
  loops forever: run `merge-train.sh` in a child process with a hard 120s
  kill guard (so one stuck git operation can't wedge the loop), then sleep
  25s, repeat. Higher-level supervision (watching worker panes, nudging
  stalled agents, restarting the loop) lives in
  `scripts/klav-orchestrator.py`.
- Each cycle, `merge-train.sh`:
  1. Fetches `origin/master` and finds every `feat/*` branch with commits not
     yet in master.
  2. Merges each onto a working copy of master with a **theirs-wins**
     strategy. A branch that conflicts is aborted for that cycle (`git merge
     --abort`) and retried next cycle — it is not force-integrated.
  3. Runs quality gates on the merged tree, in order:
     - **`tsc` type gate** — compiles the changed files (skipping
       `*.test.*`, which import `bun:test` and aren't resolvable by `tsc`;
       those are covered by `bun test` instead) and compares error counts
       against a baseline worktree of the pre-merge base commit. A branch
       that introduces a new syntax error (TS1xxx), a new unresolved name
       (TS2304 — the "merge-eaten import" failure mode), or otherwise
       increases the error count is rejected via the integrity gate below.
     - **Boot smoke** — actually starts the real Bun server against the
       merged tree and curls `/` expecting HTTP 200 (`boot_smoke()` in
       `merge-train.sh`). This exists because `tsc` catches type/syntax
       errors but not startup-time breakage; it is the final gate run again
       right before every push.
     - **Emoji guard** — `node scripts/check-no-emoji.mjs`.
     - **Inline-JS guard** — `node scripts/check-inline-js.mjs` (parses
       inline `<script>` blocks for validity).
     - **Inline-defs guard** — `node scripts/check-inline-defs.mjs`, compared
       against a baseline worktree the same way as the `tsc` gate: a branch
       that introduces a *new* bare call to an undefined inline function is
       rejected; pre-existing undefined calls are tolerated (not the
       branch's fault).
  4. **Integrity/rebase gate** — the baseline comparisons above mean a branch
     built on a stale base can look like it "introduced" a regression that's
     actually already on master, or vice versa hide one; branches must be
     able to rebase cleanly onto master's guard baseline for the gate to be
     meaningful. A branch that fails is reverted out of the integration for
     that cycle rather than force-pushed.
  5. **Deploy spacing** — prod takes ~34s to boot (Turso schema check) and
     502s the whole site while doing so, so pushes are throttled to at least
     `MIN_DEPLOY_GAP=75` seconds apart. If a push happened too recently this
     cycle, the in-tree merges are undone (`git reset --hard origin/master`)
     and retried next cycle — this is idempotent since every cycle starts by
     resetting to `origin/master`.
  6. **Version stamping** — computes `next = base_patch + 1` and stamps that
     single version string into `package.json`,
     `packages/core/package.json`, `packages/extension/package.json`,
     `packages/extension/manifest.json`, `packages/sdk/package.json`, and
     the `**Version:**` line of `docs/PRD.md`, then commits
     `orchestrator: integrate ... -> vX.Y.Z`.
  7. **Final boot smoke**, then `git push origin master`. If boot smoke fails
     at this point, the push is skipped entirely and the tree is reset back
     to `origin/master` (or the pre-push base) — a broken master is never
     pushed, because prod's autodeploy loop cannot self-heal from a
     crash-looping master.
  8. On successful push, a Slack notification is posted (webhook read from
     `~/.config/klav-orchestrator/slack-deploy-webhook`, never committed) and
     the push timestamp is recorded for the deploy-spacing check.
- **Caveat to know:** the merge-train does *not* run the full `bun test`
  suite. It only runs `tsc`, boot smoke, and the guard scripts above — a
  logic regression with valid syntax and a server that still boots can ship.
  Running `bun test` yourself before leaving a branch is the only thing that
  catches that class of bug.

## 3. Production (how master reaches prod)

- Host: Vultr `66.135.20.62`. Repo lives at `/opt/klav` (flattened checkout,
  not `/opt/klav/klav-snap` — `scripts/autodeploy.sh` defaults `REPO` to its
  own script directory's parent, overridable via `KLAV_REPO`).
- The app runs as a systemd blue/green pair, `klav@blue.service` (port 4317)
  and `klav@green.service` (port 4318), templated from
  `deploy/klav@.service`; only one slot is "active" at a time
  (`/var/lib/klav/active-slot`). Caddy fronts TLS on 443 and reverse-proxies
  to whichever slot is active (`deploy/Caddyfile`). nginx is disabled on
  boot on this host because it would grab port 80 and break Caddy.
- `klav-autodeploy.service` (systemd) polls `origin/master` roughly every
  12s and runs `scripts/autodeploy.sh`. On a new commit it:
  1. `git fetch origin master`; exits immediately if there's nothing new.
  2. `git reset --hard origin/master`, then `bun install` in `prototype/`.
  3. Starts the **inactive** slot on its port.
  4. Polls that slot's `/api/health` until it returns 200 (or gives up and
     aborts, leaving the previously-active slot untouched — no downtime).
  5. Flips Caddy's upstream to the new slot's port and reloads Caddy
     gracefully (`systemctl reload caddy`, SIGUSR1 — no dropped
     connections).
  6. **Drains** the old slot: polls its `/api/health/busy` endpoint until
     `busy == 0` (in-flight AutoSim/Sim/author/PDF work finishes) or until
     `DRAIN_MAX_SECS` (default 120s) elapses, whichever comes first. Traffic
     has already moved off the old slot by this point, so draining costs no
     downtime.
  7. Stops the old slot (`systemctl stop`) and records the new active slot.
  8. Re-checks health through the new port; if that final check fails, it
     rolls Caddy and the active-slot state back to the previous slot and
     restarts it.
  - This is the same blue/green flip logic as `scripts/prod-deploy.sh
    --zero-downtime` (used for manual/first-time setup per
    `deploy/README.md` and `deploy/zdt-setup.sh`) — `autodeploy.sh` is the
    canonical copy that actually runs unattended on the box, plus the drain
    step.
  - So to ship: just get your branch committed on `feat/*` and current. The
    merge-train integrates and pushes; autodeploy on the host does the rest
    — usually within about 30 seconds of your last commit, though the
    75-second deploy-spacing gate above can add a short queueing delay when
    pushes land close together.
- Deploy logs are **not** under `/var/log`. Use journalctl:
  ```bash
  journalctl -u klav-autodeploy -f   # the polling/flip loop itself
  journalctl -u klav@blue -f         # app logs, active slot (or klav@green)
  journalctl -u caddy -f             # TLS/proxy
  ```
- Secrets and environment live in `/etc/klav/klav.env` (per-slot overrides in
  `/etc/klav/klav-blue.env` / `klav-green.env` for `PORT`), never in git.
  **Env changes are not picked up by autodeploy's git pull** — they require
  a manual `systemctl restart klav@blue.service` (or `klav@green`, whichever
  is active) on the host after editing the env file.

## 4. Checking what's live

```bash
# Head commit + version currently deployed on prod
ssh root@66.135.20.62 'cd /opt/klav && git rev-parse --short HEAD && grep -m1 version package.json'

# Served health/version
curl https://klavity.in/api/health

# What the merge-train has pushed to origin/master lately
git log origin/master -5 --oneline
```

## 5. Golden rule

**Never manually `git reset`/restart prod, and never ssh in to deploy by
hand.** Doing so fights `klav-autodeploy.service`, which is polling and
flipping slots on its own every ~12s, and can flap prod (this has caused a
real outage before). If you must intervene directly on the host:

```bash
systemctl stop klav-autodeploy   # pause the loop first
# ... do whatever manual recovery is needed ...
systemctl start klav-autodeploy  # resume once done
```

Otherwise: commit on your `feat/*` branch, keep it rebased on
`origin/master`, and let the merge-train + autodeploy pipeline do the rest.

## References

- `scripts/new-worktree.sh` — creates an isolated worktree/branch for workers
- `scripts/merge-loop.sh` — the always-on loop that invokes the merge-train
- `scripts/merge-train.sh` — merge, gates, version stamp, push
- `scripts/klav-orchestrator.py` — higher-level supervision of workers
- `scripts/autodeploy.sh` — canonical prod polling/blue-green-flip/drain loop
- `scripts/prod-deploy.sh` — manual standard/zero-downtime deploy entry point
- `deploy/klav@.service`, `deploy/zdt-setup.sh`, `deploy/Caddyfile`,
  `deploy/README.md` — blue/green systemd + Caddy setup and manual runbook
- `devhandover.md` — broader handover notes this doc was cross-checked against
