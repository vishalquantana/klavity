# AutoSims F1 — Trail Authoring: grilled decisions (2026-07-03)

Output of a grilling + domain-modeling session. Vocabulary lives in
`CONTEXT.md` (AutoSim = actor, Trail = artifact, User Persona = walker,
Client Sim = lens/judge, Test Account, Verification Walk). The stored-creds
decision has its own ADR (`docs/adr/0001`). Engine A–G is already live
(v0.28.x): crystallize → zero-LLM Walk → Tier-1/2 heal → findings gate →
/trails dashboard + on-demand walk trigger — but only demo Trails exist.
F1 closes the gap: **users can create real Trails.**

## Locked decisions

1. **Naming.** AutoSim = the autonomous actor; a Trail = the journey it
   walks. UI: nav/page says **AutoSims**; journeys inside are Trails
   ("Your AutoSims walk these Trails"). `/trails` keeps working; add
   `/autosims` as canonical route.

2. **F1 scope = server-side LLM-drive authoring only.** Extension recorder
   (human-demo fallback) + `storageState` hybrid auth = **F2** (blocked on
   manual Web Store review anyway). Client-Sim review = **Plan H** (below).

3. **Auth: stored project creds.** Named **Test Accounts** per project
   (e.g. "admin", "free-user"), email+password encrypted at rest; login is
   ordinary Trail steps typed fresh each Walk via `{{cred:...}}` references.
   Password logins only; OTP/OAuth/MFA stall gracefully until F2. Full
   invariants in ADR-0001. Test Accounts CRUD lives in project settings.

4. **Front door.** "New Trail" button on the AutoSims page → modal (styled
   like Add-a-Sim): start URL + natural-language objective + optional Test
   Account picker. User watches live step-by-step progress (poll, like the
   Plan-G Run button).

5. **New-Trail gate: Draft → verify → approve.** Crystallize → `draft` →
   automatic zero-LLM **Verification Walk** (proves determinism) → user
   reviews step list + filmstrip → approves → `active`. Only active Trails
   produce Findings; draft Walks never file anything.

6. **Stall UX: stop, show, refine.** On agent stall (~35-45% of attempts per
   research), stop; show where it got stuck + screenshots of completed
   steps; user refines the objective wording and retries. No autonomous
   retry loops. Caps per attempt: ~40 steps, ~$0.15, logged in `ai_calls`
   as `author-drive` under the model-mix.

7. **Side effects: journeys are round-trips.** Walks mutate real data
   (create/update/chat), so the authoring convention is cleanup-included
   objectives ("…then delete the project and log out"); the modal nudges
   this. No auto-rollback machinery in v1 — the Trail restoring state also
   tests the delete flow.

## Deferred / sequenced

- **F2**: extension recorder (human demo), `storageState` hybrid auth,
  OTP/OAuth flows.
- **Plan H — Client Sims (personas-as-oracle, user vision 2026-07-03):**
  a **User Persona** walks (binds to a Test Account; shapes authoring
  choices); **Client Sims** are stakeholder *lenses* (e.g. price-sensitive
  client, enterprise client) that watch the SAME Walk's evidence and give
  feedback — lenses multiply feedback, never Walks (explicitly NOT
  tenant-multiplied walks). Design against F1's real output.
- **F1.5 — live screencast view** (locked 2026-07-03): F1 ships with
  step-poll progress (proven Plan-G pattern); the CDP
  `Page.startScreencast` → Bun-WS relay is the immediate fast-follow,
  serving both authoring live-watch and Walk debugging. VNC rejected
  (see research doc 2026-07-03).
- **CI v1** (after F1, needs real Trails to gate): `POST /api/runs` over
  the walk-trigger + poll + `junit.xml` + ~40-line GitHub Action +
  optional commit-status callback; advisory-by-default + flake
  quarantine; AMBER never passes a blocking gate silently.
- Scheduled/cron Walks; Steel infra; visual-diff judge oracle.

**Sequencing: F1 → F1.5 screencast → CI v1 → F2 recorder/hybrid-auth →
Plan H Client Sims.**
