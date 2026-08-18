# Snap-only project gating — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`).

**Goal:** Let an admin put a project on Snap-only — Snap + tickets stay open; Sims, AutoSims, and AI-settings are walled behind an upgrade overlay.

**Architecture:** A per-project `plan_override` column drives a single `projectEntitlement()` predicate, consumed by (a) server routes that 402 gated endpoints and (b) the dashboard that walls the nav/views. An admin toggle sets/clears the override.

**Tech Stack:** Bun+TS server (`prototype/`), libsql/Turso, vanilla-JS dashboard (`prototype/public/dashboard.html`). Tests: `bun test` from `prototype/`.

## Global Constraints
- Never touch `master`; branch `feat/snap-plan-gating` only. Do NOT edit version/CHANGELOG/manifest files.
- No emoji in source (emoji guard) — use the repo's icon system (kicon / Lucide) for the lock. Inline JS must parse (inline-js + inline-defs guards).
- Default `plan_override = NULL` → zero behavior change until an admin opts a project in.
- Reuse the existing 402 pattern (`quotaExceeded` at server.ts:1312, shape `{ error, code, upgradeUrl }`) and `openPlanDrawer()` for upgrade.
- Snap/feedback/ticket/team/widget-config endpoints must stay fully open.

---

### Task 1: DB column + entitlement predicate

**Files:**
- Modify: `prototype/lib/db.ts` (needCol migration near other `projects` column adds; `setProjectPlanOverride`; ensure `planOverride` maps through `projectById`/`rowToProject`)
- Create: `prototype/lib/entitlement.ts`
- Test: `prototype/lib/entitlement.test.ts`

**Interfaces:**
- Produces: `projectEntitlement(planOverride: string | null | undefined): { snapOnly, canSims, canAutoSim, canAiSettings }`
- Produces: `setProjectPlanOverride(projectId: string, override: "snap" | null): Promise<void>`
- Produces: `projectById(id)` result now carries `planOverride: string | null`.

- [ ] **Step 1: Write the failing test** (`prototype/lib/entitlement.test.ts`)
```ts
import { test, expect } from "bun:test"
import { projectEntitlement } from "./entitlement"
test("snap override locks Sims/AutoSim/AI-settings; null inherits (all open)", () => {
  const s = projectEntitlement("snap")
  expect(s).toEqual({ snapOnly: true, canSims: false, canAutoSim: false, canAiSettings: false })
  const n = projectEntitlement(null)
  expect(n).toEqual({ snapOnly: false, canSims: true, canAutoSim: true, canAiSettings: true })
  expect(projectEntitlement(undefined).snapOnly).toBe(false)
  expect(projectEntitlement("pro").snapOnly).toBe(false)
})
```
- [ ] **Step 2: Run → FAIL** — `cd prototype && bun test lib/entitlement.test.ts` (module missing).
- [ ] **Step 3: Create `entitlement.ts`**
```ts
export type ProjectEntitlement = { snapOnly: boolean; canSims: boolean; canAutoSim: boolean; canAiSettings: boolean }
export function projectEntitlement(planOverride: string | null | undefined): ProjectEntitlement {
  const snapOnly = planOverride === "snap"
  return { snapOnly, canSims: !snapOnly, canAutoSim: !snapOnly, canAiSettings: !snapOnly }
}
```
- [ ] **Step 4: Migration + helper + mapping in db.ts** — add `if (needCol("projects","plan_override")) ALTER TABLE projects ADD COLUMN plan_override TEXT` (mirror the sibling `needCol("projects",...)` pattern; grep one to copy the exact `.catch(...)` form). Add `export async function setProjectPlanOverride(projectId, override){ await db!.execute({ sql:"UPDATE projects SET plan_override=?, updated_at=? WHERE id=?", args:[override==="snap"?"snap":null, Date.now(), projectId] }) }`. Confirm `projectById`/`rowToProject` uses `SELECT *` and maps snake→camel so `plan_override`→`planOverride` (grep how `review_mode`→`reviewMode` is mapped and mirror; if mapping is explicit, add `planOverride`).
- [ ] **Step 5: Run → PASS** — `bun test lib/entitlement.test.ts`.
- [ ] **Step 6: Commit** — `git add prototype/lib/entitlement.ts prototype/lib/entitlement.test.ts prototype/lib/db.ts && git commit -m "feat(snap-plan): projects.plan_override + projectEntitlement predicate"`

---

### Task 2: Server gating (402) + admin endpoint + expose entitlement

**Files:**
- Modify: `prototype/server.ts` (import `projectEntitlement` + `setProjectPlanOverride`; add `snapLocked()` helper; apply at Sims/AutoSim/AI-settings routes; add `POST /api/projects/:id/plan`; include entitlement in project payloads)
- Test: `prototype/server.snap-plan.test.ts`

**Interfaces:**
- Consumes: Task 1's `projectEntitlement`, `setProjectPlanOverride`, `projectById().planOverride`.
- Produces: gated endpoints return `402 { error, code:"snap_locked", upgradeUrl }`; `POST /api/projects/:id/plan { override }`; project GET payloads carry `planOverride` + `entitlement`.

- [ ] **Step 1: Write the failing test** (boot server — mirror `prototype/server.workspace-rename.test.ts` harness; seed admin+member+project). Cover:
```ts
// admin sets override → snap
// POST /api/projects/:pid/plan {override:"snap"} as admin → 200
// then: a Sims create/list endpoint for pid → 402 with body.code==="snap_locked"
// an AutoSim endpoint for pid → 402 snap_locked
// an AI-settings write (e.g. review-mode) for pid → 402 snap_locked
// a Snap path (POST /api/feedback or GET tickets) for pid → NOT 402 (still works)
// GET /api/projects/:pid → body.project.planOverride==="snap" and body.entitlement.snapOnly===true (or project.entitlement)
// non-admin POST /api/projects/:pid/plan → 403
// clear: POST {override:null} → 200, then Sims endpoint no longer 402
```
(Pick the concrete Sims/AutoSim/AI-settings endpoints by grepping server.ts near the sim quota check `server.ts:3875`, flow quota `6693`, and the review-mode/setReviewMode write. Assert against those exact paths.)
- [ ] **Step 2: Run → FAIL** — `cd prototype && bun test server.snap-plan.test.ts`.
- [ ] **Step 3: Add `snapLocked` helper** (near `quotaExceeded`, ~server.ts:1312)
```ts
function snapLocked(project: { id: string; planOverride?: string | null }): { error: string; code: "snap_locked"; upgradeUrl: string } | null {
  if (projectEntitlement(project.planOverride).snapOnly) {
    return { error: "This project is on the Snap plan. Sims and AutoSims are a Pro feature — upgrade to unlock.", code: "snap_locked", upgradeUrl: `/dashboard?upgrade=pro&project=${encodeURIComponent(project.id)}` }
  }
  return null
}
```
- [ ] **Step 4: Apply the gate** — at the ENTRY of each project-scoped Sims endpoint (create/list/review — where `simQuota` is checked ~3875, add `const sl = snapLocked(proj); if (sl) return json(sl, 402)` using the already-resolved project), each AutoSim endpoint (~6693), and each AI-settings write (review mode, review budget, trails-autofile, monitored-urls add/remove). Do NOT gate feedback/ticket/team/widget-config/branding/rename. Import `projectEntitlement`, `setProjectPlanOverride` from `./lib/db`/`./lib/entitlement` (add to imports; `projectEntitlement` lives in entitlement.ts).
- [ ] **Step 5: Admin endpoint** — add `POST /api/projects/:id/plan` among the project subroutes (near `/rename`, grep `sub === "/rename"`): admin-gated (`access !== "admin"` → 403); `const { override } = body; const val = override === "snap" ? "snap" : null; await setProjectPlanOverride(pid, val); logAudit({ action:"plan_override_change", ... , meta:{ override: val } }); return json({ ok:true, project: await projectById(pid) })`.
- [ ] **Step 6: Expose entitlement** — in `GET /api/projects/:id` (server.ts:9549) and `GET /api/dashboard`, include `planOverride: proj.planOverride` and `entitlement: projectEntitlement(proj.planOverride)` on the returned project object.
- [ ] **Step 7: Run → PASS** — `bun test server.snap-plan.test.ts`. Server must boot (the test is the syntax gate for server.ts).
- [ ] **Step 8: Commit** — `git add prototype/server.ts prototype/server.snap-plan.test.ts && git commit -m "feat(snap-plan): 402 snap_locked gating on Sims/AutoSim/AI-settings + admin plan override endpoint"`

---

### Task 3: Client — nav locks, upgrade wall, AI-settings note, admin toggle

**Files:**
- Modify: `prototype/public/dashboard.html`

**Interfaces:**
- Consumes: the active project's `entitlement.snapOnly` (from Task 2's project/dashboard payload), `openPlanDrawer()`.

- [ ] **Step 1: Read entitlement into state** — where the dashboard stores the active project (grep `state.active`), also capture `state.entitlement` (or `state.active.entitlement`) from the payload. Add a helper `snapOnly()` returning `!!(state.entitlement && state.entitlement.snapOnly)`.
- [ ] **Step 2: Nav locks** — in the render that toggles nav/admin visibility (~dashboard.html:3522 `renderMembers`/render block), when `snapOnly()` add a lock badge to the Sims + AutoSims nav items (use `kicon('lock')` or the repo's Lucide lock — grep `kicon(`). No emoji.
- [ ] **Step 3: Upgrade wall overlay** — add one reusable function:
```js
function renderUpgradeWall(feature, projectName){
  return `<div class="upgrade-wall"><div class="uw-card">
    <div class="uw-lock">${kicon('lock')}</div>
    <h2>Unlock ${feature} on ${esc(projectName||'this project')}</h2>
    <p class="uw-sub">This project is on the <b>Snap plan</b> — the bug reporter is fully yours. Sims &amp; AutoSims are a Pro feature.</p>
    <div class="uw-benefits">
      <div>AI customer personas built from your real call transcripts</div>
      <div>They browse your live site and file grounded bugs</div>
      <div>AutoSim re-runs your key flows so fixed things stay fixed</div>
    </div>
    <button class="btn btn-indigo" onclick="openPlanDrawer()">Upgrade to unlock</button>
    <div class="uw-note">Admins can switch a project's plan in Settings.</div>
  </div></div>`
}
```
Add matching CSS (`.upgrade-wall` absolute overlay, blurred content behind — mirror the mockup at `/tmp/klavity-snap-plan-mock.html`; grep existing card/btn classes to reuse). When the user opens the **Sims** or **AutoSims** view and `snapOnly()`, render the existing view content wrapped/blurred and append the wall (or short-circuit the view renderer to show the wall over a static blurred preview). Keep it inline-js-guard-safe (every called fn defined/global).
- [ ] **Step 4: AI-settings note** — in the settings drawer sections tied to Sims/AutoSim (review mode, budgets, autofile, monitored URLs — grep their ids), when `snapOnly()` disable the controls and show an inline "Upgrade to unlock — this project is on the Snap plan" line linking to `openPlanDrawer()`.
- [ ] **Step 5: Admin toggle** — in project Settings, add an admin-only control "Project plan" with options Full / Snap-only that POSTs `/api/projects/<pid>/plan` `{override: 'snap'|null}` and reloads the dashboard state on success (mirror how the workspace-rename Save or widget-config Save wires fetch+refresh). Only shown when `state.active.role==='admin'`.
- [ ] **Step 6: Pill copy** — when `snapOnly()`, the side "Free plan · Upgrade" pill (id `planPill`, ~dashboard.html:1651) reads "Snap plan · Upgrade".
- [ ] **Step 7: Guards** — `node scripts/check-inline-js.mjs && node scripts/check-inline-defs.mjs && node scripts/check-no-emoji.mjs` → all pass.
- [ ] **Step 8: Commit** — `git add prototype/public/dashboard.html && git commit -m "feat(snap-plan): nav locks + upgrade wall + AI-settings note + admin project-plan toggle"`

---

## Verification (whole feature)
- [ ] `bun test lib/entitlement.test.ts server.snap-plan.test.ts` green; the three guard scripts pass.
- [ ] Browser smoke: seed a project with `plan_override='snap'` + an admin session; confirm the Sims/AutoSims nav shows a lock, opening Sims shows the blurred preview + upgrade card, AI-settings are disabled with the note, and the Settings admin toggle flips Full↔Snap-only and re-renders. Confirm Snap/tickets are unaffected.
- [ ] CHANGELOG entry under the feature (union-merges; do NOT bump version). Pull latest master, rebase, re-run tests before leaving the branch.
