# Klavity

AI bug reporting and autonomous QA: humans report bugs (Snap), persona actors
review pages (Sims), and autonomous actors walk and enforce user journeys
(AutoSims / Klavity OS).

## Language

### Actors

**Sim**:
A persona actor that *discovers* — reviews a page or flow as a simulated
customer and produces insights/feedback.
_Avoid_: agent, persona-bot, reviewer

**AutoSim**:
The autonomous actor that *enforces* — it walks a Trail without a human
driving, heals drift, and raises Findings. An AutoSim walks Trails; it is not
the Trail itself. (Resolved 2026-07-03: user-facing name for the Klavity OS
autonomous track.)
_Avoid_: Trail (for the actor), bot, test runner

**User Persona**:
The simulated end-user an AutoSim walks *as*. Its character shapes the
journey at authoring time (which options it picks) and it binds to a Test
Account for authed flows. A walker, not a judge.
_Avoid_: user (bare — ambiguous with Klavity's own users), client

**Client Sim**:
A stakeholder-lens Sim that *watches* Walks rather than driving them — it
reviews a Walk's evidence and produces feedback from its perspective (e.g.
the price-sensitive client, the enterprise client). Many Client Sims can
review the same Walk; they never multiply Walks. A judge, not a walker.
_Avoid_: client (bare), observer, tenant

**Test Account**:
A named, project-scoped login identity (e.g. "admin", "free-user") that a
Trail's login steps reference. Trails hold references to a Test Account,
never its secret.
_Avoid_: creds, test user

### Journeys

**Trail**:
A crystallized, deterministically replayable user journey — the artifact an
AutoSim walks. Authored once (by AI drive or human demo), then replayed
without an LLM while green. Lifecycle: Draft (just crystallized, files
nothing) → Active (human-approved, may produce Findings).
_Avoid_: test, script, scenario, AutoSim (for the artifact)

**Verification Walk**:
The automatic rehearsal Walk of a Draft Trail that proves it replays
deterministically before a human is asked to approve it. Never produces
Findings.
_Avoid_: dry run, smoke test

**Walk**:
One execution of a Trail by an AutoSim, ending in a Verdict.
_Avoid_: run (ambiguous with AI model runs), replay (that's the recording)

**Step**:
A single intent-level action inside a Trail (click, fill, navigate, assert).

**Crystallize**:
To convert a driven/demonstrated journey into a Trail — fixed steps plus a
locator cache — so future Walks need no LLM.
_Avoid_: record, compile

**Checkpoint**:
An explicit human-confirmed assertion inside a Trail. Immutable to healing —
an AutoSim may never heal a Checkpoint away.
_Avoid_: assertion (generic), expectation (that's the spine concept)

### Outcomes

**Heal**:
An AutoSim's repair of locator/UI drift during a Walk, always surfaced as a
reviewable diff. A Heal is never silent and never yields GREEN on its own.

**Verdict**:
The outcome of a Walk: GREEN (deterministic pass, zero LLM), AMBER (healed
but unconfirmed — never green), or RED (regression or hard failure).

**Finding**:
Evidence-grounded output of a non-green Walk (element gone after heal,
network 5xx, failed Checkpoint). Hard high-confidence Findings can be filed
as tickets; subjective ones are queued for human review.
_Avoid_: bug report (that's Snap's human-authored artifact), insight (Sims)

### Spine

**Expectation**:
A cross-source claim about how the product should behave, with lifecycle
candidate → validated → enforced. Sims and Snap discover Expectations;
enforcement means a human confirms it into a Trail Checkpoint.
