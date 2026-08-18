# Snap-only project gating — design

**Status:** approved (brainstorm + mockup approved 2026-08-18) → implementation
**Mockup:** `/tmp/klavity-snap-plan-mock.html` (teaser + upgrade overlay)

## Problem / goal
Let an admin put a specific project on a **Snap-only** footing: the Snap bug-reporter + tickets stay fully usable, but **Sims, AutoSims, and AI-related settings are walled** behind an upgrade overlay. Billing is account-level today; this adds a **per-project override** on top of the account plan.

## Decisions (from brainstorm)
- **Model:** account plan = baseline; a project can **override down** to Snap-only. Effective entitlement = the more restrictive of (account plan, project override). The override is the trigger for the hard wall.
- **Wall UX:** teaser + upgrade overlay — nav items stay visible with a lock; opening a walled view renders the real page **blurred** behind a centered "Upgrade to unlock" card (benefits + Upgrade → existing plan drawer).
- **Gated in Snap-only:** Sims (create + view), AutoSims, AI-related settings (review mode, budgets, autofile, monitored URLs). **Open:** Snap widget/extension, New reports, Tickets, tracker sync, Team, basic project + widget settings.

## Out of scope (explicit)
- A new account-level **"Snap" Stripe plan tier** (this ships the per-project override mechanism; an account-plan Snap tier + Stripe price is a follow-up).
- Changing existing account-plan quotas or the Free-plan behavior.
- Metering/billing changes.

## Data model
- `projects.plan_override TEXT` — `NULL` = inherit account plan; `"snap"` = Snap-only. Idempotent `needCol` migration (mirror existing `projects` column adds in db.ts).
- `projectById()` already `SELECT *`s, so the column flows through `rowToProject` → expose as `planOverride` on the project object.

## Entitlement predicate (single source of truth)
New `prototype/lib/entitlement.ts`:
```ts
export type ProjectEntitlement = { snapOnly: boolean; canSims: boolean; canAutoSim: boolean; canAiSettings: boolean }
export function projectEntitlement(planOverride: string | null | undefined): ProjectEntitlement {
  const snapOnly = planOverride === "snap"
  return { snapOnly, canSims: !snapOnly, canAutoSim: !snapOnly, canAiSettings: !snapOnly }
}
```
Consumed by both the server routes and the client (returned in payloads). Keeps the gate in ONE place.

## Server — gating (402, reuse existing pattern)
- A helper `snapLocked(project)` → returns `{ error, code: "snap_locked", upgradeUrl: "/dashboard?upgrade=pro&project=<id>" }` (mirrors `quotaExceeded` at server.ts:1312) when `projectEntitlement(project.planOverride).snapOnly`.
- Apply at the entry of the project-scoped **Sims** endpoints (create/list/review — near the existing sim quota check server.ts:3875), **AutoSim** endpoints (near flow quota server.ts:6693), and **AI-settings** writes (review mode / budget / autofile / monitored-urls). Return `402` with the snap_locked payload. Snap/feedback/ticket/team/widget-config endpoints are untouched.
- **Admin control endpoint:** `POST /api/projects/:id/plan` `{ override: "snap" | null }` — admin-only (`access === "admin"`); validates override ∈ {"snap", null}; calls `setProjectPlanOverride(pid, override)`; audit-logs `plan_override_change`; returns the updated project. New db helper `setProjectPlanOverride(projectId, override)` → `UPDATE projects SET plan_override=?, updated_at=? WHERE id=?`.
- Expose entitlement to the client: include `planOverride` + `entitlement` (from `projectEntitlement`) in the project payloads the dashboard reads (`GET /api/projects/:id` at server.ts:9549 and `GET /api/dashboard`).

## Client — walls + admin toggle (dashboard.html)
- **Nav:** when `state.active`/current project entitlement `snapOnly`, add a lock badge to the Sims + AutoSims nav items (no emoji — use the kicon/Lucide lock the repo uses).
- **Walled views:** when the user opens Sims / AutoSims on a snapOnly project, render the existing view **blurred + non-interactive** behind a centered upgrade card (mirror the mockup: title "Unlock Sims on {project}", 3 benefit bullets, "Upgrade to unlock" button → `openPlanDrawer()`, note "Admins can switch a project's plan in Settings"). One reusable `renderUpgradeWall(feature)` overlay.
- **AI settings:** the review-mode/budget/autofile/monitored-URL sections show an inline "Upgrade to unlock" note + disabled controls when snapOnly.
- **Admin toggle:** in project Settings, an admin-only control **"Project plan: Full ▾ / Snap-only"** that POSTs `/api/projects/:id/plan` and re-renders. Non-admins never see it.
- **Snap-plan pill:** the existing "Free plan · Upgrade" pill copy adapts to "Snap plan · Upgrade" when the active project is snapOnly.

## Testing
- `entitlement.test.ts` (unit): snapOnly true only for "snap"; canSims/canAutoSim/canAiSettings false when snapOnly, true otherwise.
- `server.snap-plan.test.ts` (bun, boot server): admin sets override→snap (200); Sims/AutoSim/AI-settings endpoints return 402 `snap_locked` for that project; Snap/feedback/tickets still 200; non-admin can't set override (403); clearing override re-enables (200). `GET /api/projects/:id` echoes `planOverride` + `entitlement`.
- Client: inline-js + inline-defs + emoji guards; a browser smoke (seed a snapOnly project, confirm the Sims nav shows the lock and the Sims view renders the upgrade overlay, and the admin toggle flips it).

## Rollout
- Default `plan_override = NULL` for all projects → **zero behavior change** until an admin sets a project to Snap-only. Ship, then set PX4's projects to `snap` (via the new toggle or a one-off).
