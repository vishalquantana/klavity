# AutoSim auth gates — pause, don't fail (KLA-179)

When an AutoSim run (an **author session**) is exploring and hits a login screen — a password form,
an OTP prompt, or an OAuth-button-only wall — and the project has **no verified auth method** to get
past it, the run must **pause**, not fail.

## How it works

1. **Classification (one extra field, no extra call).** The drive model already returns a structured
   action for each step. We added `isAuthGate: boolean` to that JSON
   (`lib/trails-author-model.ts`). The model sets it `true` when the page it's already looking at is
   an auth gate. No separate LLM round-trip — it's classified off the page state it already sees.

2. **Resumable `needs_auth` state.** When `isAuthGate` is true, the driver suspends via the same
   `stall()` path used for stalls, but with the distinct status **`needs_auth`** (not `failed`,
   not `stalled`). `stall()` persists the checkpoint first — step position, trajectory, current URL,
   and accumulated cost — so the run is resumable from exactly where it stopped
   (`lib/trails-author.ts`). The status flows through `AuthorOutcome` → `AuthorSession`
   (`author_sessions.status`) and the walk `TrailRun.status` union (`lib/trails-types.ts`).
   `listStalledAuthorSessions` surfaces `needs_auth` alongside `stalled` so the **AT2 router at
   `/autosims`** can offer "give it a key and resume".

3. **Founder-style alert, throttled 1/project/day.** `lib/autosim-auth-alert.ts` sends an email
   (owner/admins) + Slack alert — *"Your Sim got stopped at the door, give it a key"* — with a deep
   link to the AT2 router screen at `/autosims?project=<id>`. Both channels share **one throttle
   slot: max one alert per project per day** for this cause (the situation is sticky — the run stays
   paused until a human acts — so re-alerting every run is just noise). Throttle state lives in the
   `autosim_auth_alert_state` table so it survives deploy restarts. The alert is fire-and-forget: a
   notification failure never affects the run or its persisted status.

## Guards and future work

- **Zombie-resume guard / pause-TTL.** A `needs_auth` session is intentionally paused, so the stale
  reaper (`sweepStaleAuthorSessions`, which only touches `status='running'`) will *not* falsely mark
  it `failed`. Resumability is bounded by the 7-day recency window in `listStalledAuthorSessions`, so
  an abandoned pause ages out of the resume surface rather than lingering as a live "run" forever.
  **TODO:** add an explicit pause-TTL that transitions very old `needs_auth` rows to an `expired`
  state, and a resume guard so a session that has already been `resumed_from`-linked can't spawn a
  second concurrent drive off the same checkpoint (double-resume).

- **Sim-public-pages-only opt-out (future).** A project should be able to opt its Sims into
  public-pages-only exploration. Under that mode an auth gate is an *expected boundary*, not a
  blocker — the run should end cleanly ("done exploring the public surface") instead of pausing and
  alerting. Not wired yet; the current default for every project is pause + alert.
