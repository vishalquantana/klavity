# Klav — Onboarding & Activation Flow

> **Status:** Design addendum to `2026-06-16-klav-sims-design.md` (resolves the completeness-critic gap "zero-to-first-Sim onboarding"). **Date:** 2026-06-16.
> Read alongside main spec §3 (surfaces), §5 (data model: `org`, `membership`, `push_assignment`), §8 (auth, roles, push).

## 1. The activation thesis

The product's magic moment is **a real customer reacting to your real product, in their own words**. Everything in onboarding exists to reach that moment as fast as possible — ideally in **under two minutes**, before the user has connected anything or uploaded their own data.

Two emotional beats, in order:
1. **"That's actually them."** — the first Sim is revealed from a transcript (persona card + verbatim quotes). Recognition.
2. **"It's looking at *my* screen."** — the first in-product Sim reaction on a real page, with a one-click bug filed. Magic.

**North-star activation event:** *first Sim review on a page the user navigated to* (not the sample). **Secondary:** *first Sim-filed bug into a connected tracker.*

## 2. The two entry paths

| Path | Who | Goal | Length |
|---|---|---|---|
| **A — Founder/PM setup** | The buyer who creates the workspace | Reach both aha beats; leave with a tracker connected and the team invited | 5 steps |
| **B — Invited teammate** | An employee a PM pushed Sims to | Install the surface, see the pushed Sims, run one review | 3 steps |

Both share the **sample fast-path** (§4) so the first aha never depends on the user having their own transcript or tracker yet.

## 3. Path A — Founder/PM wizard (zero → first Sim → first review)

Each step is one screen. A persistent progress rail shows the five milestones. Nothing is a hard gate except step 1 — every later step has a "skip / do later" that still lets the user reach the aha.

**Step 1 — Create your workspace** *(only hard gate)*
- Magic-link sign-in (spec §8.5 defaults to magic-link for MVP; no password).
- Capture: workspace name, **org email domain** (used later to auto-classify transcript speakers as `internal` vs `client` — main spec §6.1).
- Output: `org` + owner `membership` (role `pm`).

**Step 2 — Meet your first Sim** *(the first aha — front-loaded, before any integration)*
- Primary: **drop a transcript** (`.txt`/`.vtt` in MVP). Secondary, equal weight: **"Use a sample call"** → loads the bundled Acme finance transcript.
- Extraction runs with a live "reading the call…" state, then a **reveal**: the Sim's persona card animates in — name, role, Client/Internal tag, and 3 insights each with its verbatim quote. Copy: *"Meet Sarah. Everything she says comes from what she actually said."*
- Output: first `persona` + `persona_insight[]`. Milestone: **first Sim extracted.**

**Step 3 — Put a Sim on your product** *(the magic moment)*
- Two install options side by side:
  - **Chrome extension** — "Add to Chrome" + a 1-frame "pin me" nudge. (The merged Snap+Sims extension.)
  - **Embed the widget** — a copy-paste `<script>` snippet (post-MVP surface; show as "coming soon" if widget is deferred per main spec §14).
- Then a guided first review: *"Open your product in a tab, click the Klav icon, and pick 'Have Sarah review this page.'"* For users with nothing to point at yet, a **"review the sample product"** button runs the loop on a bundled demo page in-wizard.
- Output: first `sim_reaction`. Milestone (north-star): **first Sim review.**

**Step 4 — Wire the bug loop** *(deferred-until-now on purpose)*
- Connect **Jira / Linear / GitHub / Plane** (reuses the Snap integration config from `@klav/core`). Token + project. "Skip — use the built-in Klav tracker" is always available.
- The first review's reaction is shown with a live **"→ File this as a bug"** so connecting a tracker pays off immediately. Milestone: **first Sim-filed bug.**

**Step 5 — Bring your team**
- Invite teammates by email; choose which Sims to **push** to whom for which project (main spec §8 push). Each invite triggers Path B.
- Exit to the workspace home (tracker + persona library + activity feed).

## 4. The sample fast-path (the most important activation lever)

A bundled **sample transcript + sample product page** ship with every workspace. A brand-new, solo user can: extract a sample Sim → have it review the sample page → see a filed bug — **without connecting a tracker, installing anything, or having their own call.** This is exactly what the prototype already does (`/prototype`); productionizing it as the default empty-state is the single highest-leverage onboarding investment.

Every empty state offers the sample:
- No transcripts → "Upload your first call **or** try a sample."
- No Sims pushed (teammate) → "Your PM hasn't shared Sims yet — meet a sample Sim while you wait."
- No tracker connected → reactions still file to the built-in Klav tracker.

## 5. Path B — Invited teammate (3 steps)

1. **Accept invite** (magic link) → joins the `org` with role `employee`.
2. **Install the surface** — Add the extension (or confirm the widget is on the team's app). One screen, one button.
3. **Your Sims are ready** — shows the Sims the PM pushed (their cards + who they are), then *"Open your product and let one review this page."* First review = activated.

Teammates never see transcript upload, persona editing, or tracker config — their job is to **consume** pushed Sims (main spec §8 role model).

## 6. Activation milestones (instrument these)

Ordered funnel, emitted as events for analytics + lifecycle nudges:

`workspace_created` → `first_sim_extracted` → `surface_installed` → `first_sim_review` *(north-star)* → `first_sim_bug_filed` → `team_invited`

Stall nudges (email, only if a step is skipped and not completed within a day):
- Extracted a Sim but never reviewed → "Sarah's waiting — point her at your product (2 min)."
- Reviewed but no tracker → "Connect Jira to turn Sarah's findings into tickets."
- PM invited nobody after 3 days → "Sims are better with your team — invite them."

## 7. Friction rules (what we deliberately *don't* do)

- **No tracker gate before the aha.** Integration is step 4, after the magic — never a prerequisite to meeting a Sim or running a review.
- **No empty dashboard on first load.** The wizard *is* the first screen; the dashboard only appears once at least one Sim exists.
- **No "watch a 5-min video."** The sample fast-path is the demo.
- **One required field per step, max.** Everything else has a sane default or a skip.

## 8. Where this plugs into the build

- Belongs to the **web app** (main spec §10) as the `/welcome` route group, gated on `org` having zero `persona`s.
- Reuses: extraction pipeline (§6.1), reaction engine (§6.2), the `@klav/character` dock (§9), integration config (§7), push (§8).
- **Plan placement:** onboarding is a **web-app-phase deliverable**, built after the targeting spike (Plan 1) clears and the core loop + web app exist. The sample fast-path should be built early (it doubles as the demo and the first test fixture).
