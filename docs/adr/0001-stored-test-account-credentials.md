# Store Test Account credentials server-side for AutoSim Walks

AutoSim Trails must walk login-protected journeys, and every Walk needs a
live session — sessions expire, so replay can't rely on a one-time capture.
We decided (2026-07-03) to store **named, project-scoped Test Account
credentials** (email + password) server-side, encrypted at rest, so login
becomes ordinary replayable Trail steps typed fresh on every Walk.

## Considered options

- **Public-pages-only v1** — no secret storage, but blocks the core ask
  (login → create → update → chat → logout journeys).
- **`storageState` captured locally via the extension** — no stored secrets,
  but gated on manual Chrome Web Store review, and expires → Walk noise.
- **Ephemeral authoring-only creds** — authors authed Trails it can't walk.
- **Stored project creds** ← chosen: works headlessly on every Walk;
  password logins only (OTP/OAuth/MFA still stall until the F2 recorder +
  hybrid auth land).

## Consequences (non-negotiable invariants)

1. **The secret never enters the Trail.** Steps store a reference
   (`{{cred:<account>:password}}`), never the value — exported Playwright
   code, run_steps evidence, heal diffs, and vision-LLM prompts stay clean.
   The runner resolves references only at Walk time.
2. **Masked downstream.** rrweb input-masking becomes mandatory before
   authed Walks ship; typed secrets are scrubbed from console/network
   evidence.
3. **Encrypted at rest** with an envelope key in `/etc/klav/klav.env` (never
   in Turso); decrypted server-side at Walk time only; no GET API ever
   returns a secret.
