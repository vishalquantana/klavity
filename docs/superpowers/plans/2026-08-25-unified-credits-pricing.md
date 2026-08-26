# Unified "Klavity Credits" Monetization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single per-workspace "Klavity Credits" wallet that meters every AI action (Enhance, transcript, keyframes, voice, Sim, AutoSim) on top of the existing COGS ledger, enforced *softly* (log + debit, never block) in Phase 1 so we can validate consumption-vs-COGS on real traffic.

**Architecture:** A thin credits layer sits *alongside* the existing `chat()` → `tryReserveDailySpend`/`recordAiCall`/`reconcileDailySpend` COGS plumbing. A new `lib/credits.ts` module owns `reserveCredits()` (resolve cost from a config table → check granted+topup balance → hold → settle/refund on the AI result), backed by three additive SQLite tables (`credit_action_costs`, `workspace_credits`, `credit_ledger`) added with the codebase's existing `CREATE TABLE IF NOT EXISTS` + `needCol` patterns in `prototype/lib/db.ts`. Each existing AI call site gains one `reserveCredits`/`settle` pair next to its current `recordAiCall`. `/opsadmin` (via `lib/superadmin.ts`) gains a credits-margin panel. "Workspace" == the billing `accounts` row; its id is the `account_id` already resolved by `accountIdForAiCall()`.

**Tech Stack:** Bun + TypeScript, `@libsql/client` (SQLite/Turso), `bun test` (bun:test). No new dependencies. Tests use the existing `useIsolatedDb()` harness (`prototype/lib/test-db-isolation.ts`).

## Global Constraints

- **Never touch `master`.** Work only on `feat/credits-pricing-spec` in this worktree. The orchestrator owns merges.
- **Do not bump versions** — no edits to `package.json` version / `CHANGELOG.md` version lines / `docs/PRD.md`.
- **Additive schema only.** New tables via `CREATE TABLE IF NOT EXISTS` in the `initTables` DDL array; new columns via the `needCol("table","col")` guard + `ALTER TABLE … ADD COLUMN`. Never drop/rename a column. Follow the exact pattern already in `prototype/lib/db.ts` (e.g. `projects.plan_override`).
- **Store MILLICREDITS as INTEGER.** `1 credit = 1000 millicredits` (`MC_PER_CREDIT = 1000`). Never store fractional credits as floats. Voice = 100 mc/dictation (= 0.1cr) is therefore exact.
- **Locked numbers (spec §12).** Peg `1cr ≈ $0.01`, markup `~4–5× COGS`. Per-action costs: Enhance **1cr**, transcript **1cr/min**, keyframes **2cr**, voice **1cr per 10 dictations** (0.1cr each), Sim **15cr**, AutoSim **75cr**. Monthly grants: Free **100** / Solo **1,500** / Team **10,000** / Scale **40,000** / Founding Ten **Team-level 10,000 locked-for-life**. Top-up **~$10 / 1,000cr**. Grant resets monthly (no rollover); top-ups roll over; **spend grant-first, then top-up**. One "last taste" grace per period, then hard stop. Plan change re-grants next cycle.
- **NEVER block the core bug submit.** Capture + submit is free forever. No credit check may sit on the report-submit path.
- **Reserve-before-spend.** Never make a paid model call we can't bill — EXCEPT the single "last taste" grace per period. (In Phase 1 soft mode the block is *logged, not enforced*; the reserve decision is still computed and the debit still recorded so we get real consumption data.)
- **Credits layer is ON TOP of the existing COGS cap, not a replacement.** `tryReserveDailySpend` / `OPS_DAILY_CAP_USD` / per-tenant budget stay exactly as-is underneath as the platform safety net.
- **Phase 1 = SOFT enforce.** `reserveCredits` computes the decision and records the ledger + debit, but callers proceed regardless of insufficiency. Env flag `KLAV_CREDITS_ENFORCE` (default off) is the future switch that Phase 2 flips to hard-enforce. Do not surface any pinch UX in Phase 1.

### Resolved spec ambiguities (decided for this plan)

1. **"Workspace" = `accounts` row.** The wallet key is `account_id` (the billing unit `buildSuperadminPL` already uses). Call sites resolve it with the existing `accountIdForAiCall(projectId, accountId, actorEmail)`.
2. **Ledger sign convention = effect on balance.** `credit_ledger.millicredits` is signed: grants/top-ups/refunds are **positive**, spends are **negative**. The spec's phrase "refund … negative row" (§10/§14) refers to the *spend/debit* rows being the negative ones; a **refund is the compensating positive row** (`action='refund'`) that nets a failed spend back to zero. Tests assert on balance restoration + net ledger sum, which is unambiguous.
3. **Plan-slug → grant mapping.** Internal slugs (`lib/billing.ts` `BillingPlan`): `free`→100, `pro`(=Solo)→1,500, `team`→10,000, `founding`→10,000 (Team-level, locked), `scale`→40,000, `agency`→40,000 (Scale-level; agency sits above Team in `PLAN_QUOTAS`), `partner`→unlimited (metering short-circuited via existing `planIsUnlimited('partner')===true`: sufficient, cost 0, no debit).
4. **Transcript per-minute unit** is derived from the clip's `durationMs` (recordings/attachments carry it); cost = `1cr × ceil(minutes)`, floor 1cr for any non-empty clip. `ai_calls` has no seconds column, so the caller passes `units` (minutes) into `reserveCredits`.
5. **Grant reset is lazy + jobbable.** Balances re-grant lazily on first touch of a new UTC month (like `usagePeriod()`), and a callable idempotent `runMonthlyGrantReset()` exists for the scheduler / warm-up. First-ever touch of an account seeds `granted = plan_grant` — this *is* the §11 back-compat migration (every existing customer starts a full wallet, nobody worse off).

---

## File Structure

- **`prototype/lib/credits.ts`** (new) — the credits domain: constants (`MC_PER_CREDIT`, `PLAN_GRANT_CREDITS`, default costs), `creditCostFor()`, `reserveCredits()` + `CreditReservation` + `InsufficientCreditsError`, `runMonthlyGrantReset()`. Pure-ish; all DB access via helpers imported from `./db`.
- **`prototype/lib/db.ts`** (modify) — three new tables in the `initTables` DDL array; new low-level helpers: `getCreditActionCost`, `seedCreditActionCosts`, `getWorkspaceCredits`, `ensureWorkspaceCredits`, `debitWorkspaceCredits`, `creditWorkspaceCredits`, `insertCreditLedger`, `listCreditLedgerForWorkspace`, `creditConsumptionByWorkspace`.
- **`prototype/lib/superadmin.ts`** (modify) — `creditsMarginByWorkspace()` folded into `buildSuperadminPL` output (or a sibling exported fn) for the `/opsadmin` + `/superadmin` credits panel.
- **`prototype/server.ts`** (modify) — one `reserveCredits`/`settle` pair at each AI call site (Enhance route, `enrichReportFromTranscript`, voice route); wire the credits panel into `renderOpsAdmin` / the `/api/superadmin/pl` payload.
- **`prototype/lib/transcribe.ts`** (modify) — reserve/settle around the STT `recordAiCall` in `transcribeFeedbackRecordings` + `transcribeFeedbackAttachments`.
- **`prototype/lib/sim-review.ts`** (modify) — reserve/settle next to the existing `incrementUsageMeter({metric:"sim_review"})`.
- **`prototype/lib/trails-runner.ts`** (modify) — reserve/settle next to the existing `incrementUsageMeter({metric:"autosim_walk"})`.
- **Test files** (new): `prototype/lib/credits.test.ts`, `prototype/lib/credits-db.test.ts`, `prototype/lib/credits-reset.test.ts`, `prototype/lib/credits-opsadmin.test.ts`, `prototype/lib/credits-core-submit-safety.test.ts`.

### Grounding — real signatures this plan builds on (verified in code)

```ts
// prototype/server.ts (the shared LLM helper — DO NOT change its signature)
async function chat(messages: any[], maxTokens: number, jsonMode = false,
  ctx?: { type: string; feature?: string|null; email?: string|null; projectId?: string|null; model?: string; temperature?: number })
  : Promise<{ content: string; usage: { input_tokens: any; output_tokens: any } }>

// prototype/lib/db.ts
export const DEFAULT_AI_CALL_EST_USD = 0.01
export async function tryReserveDailySpend(estUsd: number, capUsd: number): Promise<boolean>
export async function reconcileDailySpend(estUsd: number, actualUsd: number): Promise<void>
export async function recordAiCall(a: AiCallInsert): Promise<void>   // AiCallInsert: {type,model,feature?,actorEmail?,projectId?,accountId?,inputTokens?,outputTokens?,costUsd?,ok?,runId?}
export async function accountIdForAiCall(projectId?: string|null, accountId?: string|null, actorEmail?: string|null): Promise<string|null>
export function usagePeriod(atMs?: number): string   // 'YYYY-MM'
export async function incrementUsageMeter(inc: UsageMeterInc): Promise<void>

// prototype/lib/billing.ts
export type BillingPlan = "free"|"pro"|"team"|"agency"|"founding"|"scale"|"partner"
export function normalizePlan(plan: string|null|undefined): BillingPlan
// prototype/lib/db.ts
export function planIsUnlimited(plan: string): boolean   // true for 'partner'

// prototype/lib/superadmin.ts
export async function buildSuperadminPL(now?: number): Promise<SuperadminPL>
// prototype/server.ts
function renderOpsAdmin(d: {...}): string          // /opsadmin HTML (line ~1322)
// routes: GET /opsadmin (~7689), GET /superadmin (~7694), GET /api/superadmin/pl (~7698)
```

Existing call sites to wire (verified):
- **Enhance:** `server.ts` `POST /api/report/enhance` (~3530), `chat(..., {type:"report-enhance", projectId, email:null})`.
- **Video-enrich (walkthrough summary + keyframes):** `server.ts` `enrichReportFromTranscript()` (~642); the summary uses `chat(..., {type:"video-enrich", projectId, email:fb.actorEmail})`.
- **Transcript STT:** `lib/transcribe.ts` `transcribeFeedbackRecordings` (~197) + `transcribeFeedbackAttachments` (~264), each ending in `recordAiCall({type:"transcribe", ...})`.
- **Voice dictation:** `server.ts` `POST /api/voice/transcribe` (~3606), `transcribeAudioBytes()`.
- **Sim:** `lib/sim-review.ts` (~412) `void incrementUsageMeter({ metric:"sim_review", projectId, actorEmail })`.
- **AutoSim:** `lib/trails-runner.ts` (~1061) `void incrementUsageMeter({ metric:"autosim_walk", projectId })`.

---

# PHASE 1 — Metering layer, enforced SOFTLY (detailed / build-ready)

## Task 1: `credit_action_costs` config table + `creditCostFor()`

**Files:**
- Modify: `prototype/lib/db.ts` (DDL array near the other `CREATE TABLE IF NOT EXISTS` block ~L340–435; helper functions near `recordAiCall` ~L4230)
- Create: `prototype/lib/credits.ts`
- Test: `prototype/lib/credits.test.ts`

**Interfaces:**
- Produces:
  - `MC_PER_CREDIT = 1000` (const in `lib/credits.ts`)
  - `export type CreditAction = "enhance" | "transcript" | "keyframes" | "voice" | "sim" | "autosim"`
  - `export const DEFAULT_ACTION_COST_MC: Record<CreditAction, number>` = `{ enhance:1000, transcript:1000, keyframes:2000, voice:100, sim:15000, autosim:75000 }`
  - `export function creditCostFor(action: CreditAction, units = 1, baseMc?: number): number` — resolves millicredit cost. `transcript`: `base × max(1, ceil(units))` (units = minutes). `voice`: `base × max(1, units)` (units = dictation count). All others: `base` (units ignored). `baseMc` overrides the default (used to pass the DB-config value).
  - `db.ts`: `export async function getCreditActionCost(action: string): Promise<number | null>` and `export async function seedCreditActionCosts(): Promise<void>`.

- [ ] **Step 1: Write the failing test** — `prototype/lib/credits.test.ts`

```ts
import { expect, test } from "bun:test"
import { creditCostFor, DEFAULT_ACTION_COST_MC, MC_PER_CREDIT } from "./credits"

test("MC_PER_CREDIT is 1000 (millicredits are integers)", () => {
  expect(MC_PER_CREDIT).toBe(1000)
})

test("flat actions cost their default millicredits", () => {
  expect(creditCostFor("enhance")).toBe(1000)          // 1 credit
  expect(creditCostFor("keyframes")).toBe(2000)        // 2 credits
  expect(creditCostFor("sim")).toBe(15000)             // 15 credits
  expect(creditCostFor("autosim")).toBe(75000)         // 75 credits
})

test("voice is 0.1 credit per dictation and stays an integer", () => {
  expect(DEFAULT_ACTION_COST_MC.voice).toBe(100)
  expect(creditCostFor("voice", 1)).toBe(100)          // 0.1cr
  expect(creditCostFor("voice", 10)).toBe(1000)        // 10 dictations = exactly 1cr
})

test("transcript is 1 credit per started minute, floor 1 credit", () => {
  expect(creditCostFor("transcript", 0)).toBe(1000)    // any non-empty clip ≥ 1cr
  expect(creditCostFor("transcript", 0.4)).toBe(1000)  // ceil → 1 min
  expect(creditCostFor("transcript", 3)).toBe(3000)    // 3 min
  expect(creditCostFor("transcript", 3.2)).toBe(4000)  // ceil → 4 min
})

test("baseMc override (DB-config value) is respected", () => {
  expect(creditCostFor("enhance", 1, 2500)).toBe(2500)
  expect(creditCostFor("transcript", 3, 500)).toBe(1500)  // 500 × 3
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd prototype && bun test lib/credits.test.ts`
Expected: FAIL — `Cannot find module './credits'`.

- [ ] **Step 3: Create `prototype/lib/credits.ts` with the constants + `creditCostFor`**

```ts
// Unified "Klavity Credits" — the metered-AI wallet layer (spec 2026-08-25). Sits ALONGSIDE the
// existing COGS plumbing (chat() → tryReserveDailySpend/recordAiCall). MILLICREDITS everywhere:
// 1 credit = 1000 millicredits, so voice (0.1cr) is an exact integer (100 mc).
export const MC_PER_CREDIT = 1000

export type CreditAction = "enhance" | "transcript" | "keyframes" | "voice" | "sim" | "autosim"

// Locked per-action costs (spec §4/§12), in millicredits. Config-driven at runtime via
// credit_action_costs; these are the seed/fallback defaults, NEVER hard-coded at call sites.
export const DEFAULT_ACTION_COST_MC: Record<CreditAction, number> = {
  enhance: 1_000,    // 1cr  — one vision call
  transcript: 1_000, // 1cr per started minute (× minutes)
  keyframes: 2_000,  // 2cr  — ffmpeg + a vision summary
  voice: 100,        // 0.1cr per dictation → 10 dictations = 1cr (exact)
  sim: 15_000,       // 15cr — persona review
  autosim: 75_000,   // 75cr — full browser walk
}

// Resolve the millicredit cost of an action. `units` = minutes (transcript) or dictation count
// (voice); ignored for flat actions. `baseMc` overrides the default (pass the DB-config value).
export function creditCostFor(action: CreditAction, units = 1, baseMc?: number): number {
  const base = typeof baseMc === "number" && Number.isFinite(baseMc) ? baseMc : DEFAULT_ACTION_COST_MC[action]
  if (action === "transcript") return base * Math.max(1, Math.ceil(units || 0))
  if (action === "voice") return base * Math.max(1, Math.floor(units || 1))
  return base
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd prototype && bun test lib/credits.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Add the `credit_action_costs` table + DB helpers in `db.ts`**

In the `initTables` DDL array (right after the `cost_events` block ~L435), add:

```ts
    // KLAVITY CREDITS (spec 2026-08-25) — config table of action → millicredit cost. Editable
    // centrally so per-action prices re-tune WITHOUT a code deploy. Seeded from DEFAULT_ACTION_COST_MC
    // (lib/credits.ts) on boot via seedCreditActionCosts(); only fills missing rows (never clobbers a
    // hand-edited price). Millicredits: 1 credit = 1000 mc.
    `CREATE TABLE IF NOT EXISTS credit_action_costs (
       action TEXT PRIMARY KEY, millicredits INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
```

Add helpers near `recordAiCall` (~L4238):

```ts
// ── Klavity Credits: action-cost config ──────────────────────────────────────────────────────────
export async function getCreditActionCost(action: string): Promise<number | null> {
  try {
    const r = await db!.execute({ sql: "SELECT millicredits FROM credit_action_costs WHERE action=?", args: [action] })
    if (!r.rows.length) return null
    const v = Number((r.rows[0] as any).millicredits)
    return Number.isFinite(v) ? v : null
  } catch { return null }
}

// Fill any missing action rows from the code defaults. Idempotent (INSERT OR IGNORE) — a price a human
// edited in the table is preserved. Call once at boot AFTER initTables.
export async function seedCreditActionCosts(): Promise<void> {
  const now = Date.now()
  const defaults: Array<[string, number]> = [
    ["enhance", 1000], ["transcript", 1000], ["keyframes", 2000],
    ["voice", 100], ["sim", 15000], ["autosim", 75000],
  ]
  for (const [action, mc] of defaults) {
    await db!.execute({
      sql: "INSERT OR IGNORE INTO credit_action_costs (action, millicredits, updated_at) VALUES (?,?,?)",
      args: [action, mc, now],
    }).catch((e: any) => console.warn(`seedCreditActionCosts ${action} skipped:`, e?.message || e))
  }
}
```

Wire `seedCreditActionCosts()` into boot: find where `initTables`/`initDb` finishes (the same place other post-table seeds run) and add `await seedCreditActionCosts().catch(()=>{})`. If unsure, call it at the top of the first `reserveCredits()` invocation is NOT acceptable — seed at boot. Grep for an existing `await migrateV2` / end-of-init call and place it immediately after.

- [ ] **Step 6: Write the DB helper test** — append to `prototype/lib/credits-db.test.ts`

```ts
import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { seedCreditActionCosts, getCreditActionCost } from "./db"

useIsolatedDb("klav-credits-db-costs")

test("seedCreditActionCosts fills defaults and is idempotent", async () => {
  await seedCreditActionCosts()
  expect(await getCreditActionCost("enhance")).toBe(1000)
  expect(await getCreditActionCost("autosim")).toBe(75000)
  expect(await getCreditActionCost("voice")).toBe(100)
  await seedCreditActionCosts() // second call must not throw or double-count
  expect(await getCreditActionCost("sim")).toBe(15000)
  expect(await getCreditActionCost("nope")).toBeNull()
})
```

- [ ] **Step 7: Run tests**

Run: `cd prototype && bun test lib/credits.test.ts lib/credits-db.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add prototype/lib/credits.ts prototype/lib/credits.test.ts prototype/lib/credits-db.test.ts prototype/lib/db.ts
git commit -m "feat(credits): action-cost config table + creditCostFor (millicredits)"
```

---

## Task 2: `workspace_credits` wallet table + lazy grant + `PLAN_GRANT_CREDITS`

**Files:**
- Modify: `prototype/lib/db.ts` (DDL array; helpers)
- Modify: `prototype/lib/credits.ts` (grant map)
- Test: `prototype/lib/credits-db.test.ts` (append)

**Interfaces:**
- Consumes: `usagePeriod()`, `normalizePlan()`, `planIsUnlimited()`, `MC_PER_CREDIT`.
- Produces:
  - `lib/credits.ts`: `export const PLAN_GRANT_CREDITS: Record<BillingPlan, number>` = `{ free:100, pro:1500, team:10000, founding:10000, scale:40000, agency:40000, partner:40000 }`; `export function planGrantMillicredits(plan: string|null|undefined): number` (= `PLAN_GRANT_CREDITS[normalizePlan(plan)] × MC_PER_CREDIT`).
  - `db.ts`: `export type WorkspaceCredits = { workspaceId: string; grantedMc: number; topupMc: number; planGrantMc: number; grantPeriod: string; lastGracePeriod: string|null; updatedAt: number }`
  - `db.ts`: `export async function getWorkspaceCredits(workspaceId: string): Promise<WorkspaceCredits | null>`
  - `db.ts`: `export async function ensureWorkspaceCredits(workspaceId: string, planGrantMc: number, atMs?: number): Promise<WorkspaceCredits>` — creates the row seeded to `granted=planGrantMc` on first touch; re-grants `granted=planGrantMc` (top-up untouched, `lastGracePeriod` cleared) when the UTC month rolled past `grantPeriod`.

- [ ] **Step 1: Write the failing test** — append to `prototype/lib/credits-db.test.ts`

```ts
import { ensureWorkspaceCredits, getWorkspaceCredits } from "./db"

test("ensureWorkspaceCredits seeds a full wallet on first touch (§11 back-compat)", async () => {
  const w = await ensureWorkspaceCredits("acct_wc_1", 10000 * 1000) // team grant, in mc
  expect(w.grantedMc).toBe(10_000_000)
  expect(w.topupMc).toBe(0)
  expect(w.planGrantMc).toBe(10_000_000)
  const again = await getWorkspaceCredits("acct_wc_1")
  expect(again?.grantedMc).toBe(10_000_000)
})

test("ensureWorkspaceCredits re-grants on a new month, keeps top-up, clears grace", async () => {
  const jan = Date.UTC(2026, 0, 15)
  const feb = Date.UTC(2026, 1, 2)
  const w0 = await ensureWorkspaceCredits("acct_wc_2", 1500 * 1000, jan)
  // simulate mid-month spend + a top-up + a used grace by writing the row directly
  const { db } = await import("./db")
  await db!.execute({
    sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=?, last_grace_period=? WHERE workspace_id=?",
    args: [200_000, 5000 * 1000, "2026-01", "acct_wc_2"],
  })
  const w1 = await ensureWorkspaceCredits("acct_wc_2", 1500 * 1000, feb)
  expect(w1.grantedMc).toBe(1_500_000)      // re-granted to plan grant
  expect(w1.topupMc).toBe(5_000_000)        // top-up rolled over untouched
  expect(w1.grantPeriod).toBe("2026-02")
  expect(w1.lastGracePeriod).toBeNull()     // grace reset for the new period
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `cd prototype && bun test lib/credits-db.test.ts`
Expected: FAIL — `ensureWorkspaceCredits is not a function`.

- [ ] **Step 3: Add the table + helpers**

DDL array (after `credit_action_costs`):

```ts
    // KLAVITY CREDITS — per-workspace (=account) wallet. granted resets monthly (no rollover);
    // topup rolls over; spend is grant-first (see lib/credits.ts). grant_period = 'YYYY-MM' of the
    // active grant; last_grace_period = the period in which the one "last taste" grace was consumed
    // (spec §6/§12 decision 6). Millicredits (integer).
    `CREATE TABLE IF NOT EXISTS workspace_credits (
       workspace_id TEXT PRIMARY KEY,
       granted_millicredits INTEGER NOT NULL DEFAULT 0,
       topup_millicredits INTEGER NOT NULL DEFAULT 0,
       plan_grant_millicredits INTEGER NOT NULL DEFAULT 0,
       grant_period TEXT NOT NULL,
       last_grace_period TEXT,
       updated_at INTEGER NOT NULL)`,
```

Helpers (in `db.ts`, near the credit-cost helpers):

```ts
export type WorkspaceCredits = {
  workspaceId: string; grantedMc: number; topupMc: number; planGrantMc: number
  grantPeriod: string; lastGracePeriod: string | null; updatedAt: number
}

function mapWorkspaceCredits(x: any): WorkspaceCredits {
  return {
    workspaceId: String(x.workspace_id),
    grantedMc: Number(x.granted_millicredits) || 0,
    topupMc: Number(x.topup_millicredits) || 0,
    planGrantMc: Number(x.plan_grant_millicredits) || 0,
    grantPeriod: String(x.grant_period),
    lastGracePeriod: x.last_grace_period != null ? String(x.last_grace_period) : null,
    updatedAt: Number(x.updated_at) || 0,
  }
}

export async function getWorkspaceCredits(workspaceId: string): Promise<WorkspaceCredits | null> {
  if (!workspaceId) return null
  const r = await db!.execute({ sql: "SELECT * FROM workspace_credits WHERE workspace_id=?", args: [workspaceId] })
  return r.rows.length ? mapWorkspaceCredits(r.rows[0]) : null
}

// Create-on-first-touch (seeded to a full grant — the §11 launch migration: nobody worse off) and
// lazily re-grant when the UTC month has rolled. Top-up survives; grace resets each period.
export async function ensureWorkspaceCredits(workspaceId: string, planGrantMc: number, atMs: number = Date.now()): Promise<WorkspaceCredits> {
  const period = usagePeriod(atMs)
  const now = atMs
  await db!.execute({
    sql: `INSERT INTO workspace_credits
            (workspace_id, granted_millicredits, topup_millicredits, plan_grant_millicredits, grant_period, last_grace_period, updated_at)
          VALUES (?,?,?,?,?,NULL,?)
          ON CONFLICT(workspace_id) DO NOTHING`,
    args: [workspaceId, planGrantMc, 0, planGrantMc, period, now],
  })
  // Lazy re-grant: only when the stored period is strictly older than the current one.
  await db!.execute({
    sql: `UPDATE workspace_credits
             SET granted_millicredits = ?, plan_grant_millicredits = ?, grant_period = ?,
                 last_grace_period = NULL, updated_at = ?
           WHERE workspace_id = ? AND grant_period < ?`,
    args: [planGrantMc, planGrantMc, period, now, workspaceId, period],
  })
  const w = await getWorkspaceCredits(workspaceId)
  return w! // row is guaranteed to exist after the upsert
}
```

Add `workspace_credits` to `ALTERED_TABLES` preload list is NOT required (no `needCol` columns). Skip.

In `lib/credits.ts` add:

```ts
import { normalizePlan, type BillingPlan } from "./billing"

// Monthly grant per tier in CREDITS (spec §5/§12). Internal slugs: pro=Solo, founding=Team-level
// locked-for-life, agency=Scale-level, partner=unlimited (metering short-circuited elsewhere).
export const PLAN_GRANT_CREDITS: Record<BillingPlan, number> = {
  free: 100, pro: 1_500, team: 10_000, founding: 10_000, scale: 40_000, agency: 40_000, partner: 40_000,
}

export function planGrantMillicredits(plan: string | null | undefined): number {
  return PLAN_GRANT_CREDITS[normalizePlan(plan)] * MC_PER_CREDIT
}
```

- [ ] **Step 4: Run tests** — `cd prototype && bun test lib/credits-db.test.ts` → PASS.

- [ ] **Step 5: Add a grant-map test** — append to `prototype/lib/credits.test.ts`

```ts
import { PLAN_GRANT_CREDITS, planGrantMillicredits } from "./credits"

test("plan grants match the locked numbers (spec §5/§12)", () => {
  expect(PLAN_GRANT_CREDITS.free).toBe(100)
  expect(PLAN_GRANT_CREDITS.pro).toBe(1500)     // Solo
  expect(PLAN_GRANT_CREDITS.team).toBe(10000)
  expect(PLAN_GRANT_CREDITS.founding).toBe(10000) // Team-level, locked
  expect(PLAN_GRANT_CREDITS.scale).toBe(40000)
  expect(planGrantMillicredits("pro")).toBe(1_500_000) // millicredits
})
```

Run: `cd prototype && bun test lib/credits.test.ts` → PASS.

- [ ] **Step 6: Commit**

```bash
git add prototype/lib/credits.ts prototype/lib/credits.test.ts prototype/lib/credits-db.test.ts prototype/lib/db.ts
git commit -m "feat(credits): workspace_credits wallet + lazy monthly grant + plan grant map"
```

---

## Task 3: `credit_ledger` append-only audit table

**Files:**
- Modify: `prototype/lib/db.ts` (DDL array; helpers)
- Test: `prototype/lib/credits-db.test.ts` (append)

**Interfaces:**
- Produces:
  - `db.ts`: `export type CreditLedgerInsert = { workspaceId: string; action: string; millicredits: number; refFeedbackId?: string|null; refRunId?: string|null; actorEmail?: string|null; isGuest?: boolean; aiCallId?: string|null; atMs?: number }`
  - `db.ts`: `export async function insertCreditLedger(e: CreditLedgerInsert): Promise<string>` (returns the row id)
  - `db.ts`: `export async function listCreditLedgerForWorkspace(workspaceId: string, limit?: number): Promise<CreditLedgerRow[]>` where `CreditLedgerRow = CreditLedgerInsert & { id: string; createdAt: number }` (normalized).

- [ ] **Step 1: Write the failing test** — append to `prototype/lib/credits-db.test.ts`

```ts
import { insertCreditLedger, listCreditLedgerForWorkspace } from "./db"

test("credit_ledger stores signed millicredits with refs + ai_call linkage", async () => {
  const id = await insertCreditLedger({
    workspaceId: "acct_led_1", action: "enhance", millicredits: -1000,
    refFeedbackId: "fb_9", actorEmail: "vishal@quantana.com.au", isGuest: false, aiCallId: "ai_abc",
  })
  expect(id).toStartWith("cl_")
  await insertCreditLedger({ workspaceId: "acct_led_1", action: "refund", millicredits: 1000, refFeedbackId: "fb_9", aiCallId: "ai_abc" })
  const rows = await listCreditLedgerForWorkspace("acct_led_1")
  expect(rows.length).toBe(2)
  const net = rows.reduce((s, r) => s + r.millicredits, 0)
  expect(net).toBe(0) // spend −1000 + refund +1000 nets to zero
  const spend = rows.find(r => r.action === "enhance")!
  expect(spend.aiCallId).toBe("ai_abc")
  expect(spend.isGuest).toBe(false)
})
```

- [ ] **Step 2: Run to verify it fails** — FAIL `insertCreditLedger is not a function`.

- [ ] **Step 3: Add the table + helpers**

DDL array (after `workspace_credits`):

```ts
    // KLAVITY CREDITS — append-only audit ledger. One row per credit movement: grants/top-ups/refunds
    // are POSITIVE, spends are NEGATIVE (millicredits). Links to the ai_calls row it paid for (ai_call_id)
    // for the /opsadmin credit-margin panel, and to the feedback/run + actor for the future admin nudge.
    `CREATE TABLE IF NOT EXISTS credit_ledger (
       id TEXT PRIMARY KEY,
       workspace_id TEXT NOT NULL,
       action TEXT NOT NULL,            -- enhance|transcript|keyframes|voice|sim|autosim|topup|grant|refund
       millicredits INTEGER NOT NULL,   -- signed: + credits in, − spends
       ref_feedback_id TEXT,
       ref_run_id TEXT,
       actor_email TEXT,
       is_guest INTEGER NOT NULL DEFAULT 0,
       ai_call_id TEXT,
       created_at INTEGER NOT NULL)`,
    `CREATE INDEX IF NOT EXISTS credit_ledger_ws_idx ON credit_ledger (workspace_id, created_at)`,
    `CREATE INDEX IF NOT EXISTS credit_ledger_action_idx ON credit_ledger (action, created_at)`,
```

Helpers:

```ts
export type CreditLedgerInsert = {
  workspaceId: string; action: string; millicredits: number
  refFeedbackId?: string | null; refRunId?: string | null
  actorEmail?: string | null; isGuest?: boolean; aiCallId?: string | null; atMs?: number
}
export type CreditLedgerRow = {
  id: string; workspaceId: string; action: string; millicredits: number
  refFeedbackId: string | null; refRunId: string | null; actorEmail: string | null
  isGuest: boolean; aiCallId: string | null; createdAt: number
}

export async function insertCreditLedger(e: CreditLedgerInsert): Promise<string> {
  const id = "cl_" + crypto.randomUUID()
  await db!.execute({
    sql: `INSERT INTO credit_ledger
            (id, workspace_id, action, millicredits, ref_feedback_id, ref_run_id, actor_email, is_guest, ai_call_id, created_at)
          VALUES (?,?,?,?,?,?,?,?,?,?)`,
    args: [id, e.workspaceId, e.action, Math.trunc(e.millicredits),
           e.refFeedbackId ?? null, e.refRunId ?? null, e.actorEmail ?? null,
           e.isGuest ? 1 : 0, e.aiCallId ?? null, e.atMs ?? Date.now()],
  })
  return id
}

export async function listCreditLedgerForWorkspace(workspaceId: string, limit = 200): Promise<CreditLedgerRow[]> {
  const r = await db!.execute({
    sql: "SELECT * FROM credit_ledger WHERE workspace_id=? ORDER BY created_at DESC LIMIT ?",
    args: [workspaceId, limit],
  })
  return r.rows.map((x: any) => ({
    id: String(x.id), workspaceId: String(x.workspace_id), action: String(x.action),
    millicredits: Number(x.millicredits) || 0,
    refFeedbackId: x.ref_feedback_id != null ? String(x.ref_feedback_id) : null,
    refRunId: x.ref_run_id != null ? String(x.ref_run_id) : null,
    actorEmail: x.actor_email != null ? String(x.actor_email) : null,
    isGuest: Number(x.is_guest) === 1,
    aiCallId: x.ai_call_id != null ? String(x.ai_call_id) : null,
    createdAt: Number(x.created_at) || 0,
  }))
}
```

- [ ] **Step 4: Run tests** — `cd prototype && bun test lib/credits-db.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype/lib/db.ts prototype/lib/credits-db.test.ts
git commit -m "feat(credits): append-only credit_ledger + insert/list helpers"
```

---

## Task 4: atomic balance mutators (grant-first debit + credit-back)

**Files:**
- Modify: `prototype/lib/db.ts`
- Test: `prototype/lib/credits-db.test.ts` (append)

**Interfaces:**
- Consumes: `workspace_credits` row from Task 2.
- Produces:
  - `db.ts`: `export type DebitSplit = { grantMc: number; topupMc: number }`
  - `db.ts`: `export async function debitWorkspaceCredits(workspaceId: string, amountMc: number, opts?: { allowNegative?: boolean }): Promise<DebitSplit | null>` — spends **grant-first, then top-up**. Returns the split actually taken, or `null` if `!allowNegative` and the balance can't cover it (no mutation). With `allowNegative:true` (Phase-1 soft mode) it always debits, taking grant down to 0 then top-up (which may go negative) so consumption is still recorded truthfully.
  - `db.ts`: `export async function creditWorkspaceCredits(workspaceId: string, split: DebitSplit): Promise<void>` — restores a prior debit (refund) into the same buckets it came from.
  - `db.ts`: `export async function markGraceUsed(workspaceId: string, period: string): Promise<void>`

- [ ] **Step 1: Write the failing test** — append to `prototype/lib/credits-db.test.ts`

```ts
import { debitWorkspaceCredits, creditWorkspaceCredits } from "./db"

test("debit spends grant-first, then top-up", async () => {
  await ensureWorkspaceCredits("acct_dbt_1", 0) // seed empty
  await (await import("./db")).db!.execute({
    sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=? WHERE workspace_id=?",
    args: [1000, 5000, "acct_dbt_1"],
  })
  const split = await debitWorkspaceCredits("acct_dbt_1", 1500)
  expect(split).toEqual({ grantMc: 1000, topupMc: 500 }) // grant emptied first
  const w = await getWorkspaceCredits("acct_dbt_1")
  expect(w!.grantedMc).toBe(0)
  expect(w!.topupMc).toBe(4500)
})

test("debit without allowNegative returns null and does not mutate when short", async () => {
  await ensureWorkspaceCredits("acct_dbt_2", 500)
  const split = await debitWorkspaceCredits("acct_dbt_2", 1000) // 1000 > 500
  expect(split).toBeNull()
  const w = await getWorkspaceCredits("acct_dbt_2")
  expect(w!.grantedMc).toBe(500) // untouched
})

test("credit restores a prior debit split (refund)", async () => {
  await ensureWorkspaceCredits("acct_dbt_3", 0)
  await (await import("./db")).db!.execute({
    sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=? WHERE workspace_id=?",
    args: [1000, 1000, "acct_dbt_3"],
  })
  const split = await debitWorkspaceCredits("acct_dbt_3", 1500) // {grant:1000, topup:500}
  await creditWorkspaceCredits("acct_dbt_3", split!)
  const w = await getWorkspaceCredits("acct_dbt_3")
  expect(w!.grantedMc).toBe(1000)
  expect(w!.topupMc).toBe(1000) // fully restored
})
```

- [ ] **Step 2: Run to verify it fails** — FAIL `debitWorkspaceCredits is not a function`.

- [ ] **Step 3: Implement the mutators**

```ts
export type DebitSplit = { grantMc: number; topupMc: number }

// Spend grant-first, then top-up. Atomic read-modify-write inside a single transaction so concurrent
// debits on one workspace serialize. Returns the actual split; null when short and allowNegative is off.
export async function debitWorkspaceCredits(workspaceId: string, amountMc: number, opts: { allowNegative?: boolean } = {}): Promise<DebitSplit | null> {
  const amt = Math.max(0, Math.trunc(amountMc))
  if (amt === 0) return { grantMc: 0, topupMc: 0 }
  const tx = await db!.transaction("write")
  try {
    const r = await tx.execute({ sql: "SELECT granted_millicredits AS g, topup_millicredits AS t FROM workspace_credits WHERE workspace_id=?", args: [workspaceId] })
    if (!r.rows.length) { await tx.rollback(); return null }
    const g = Number((r.rows[0] as any).g) || 0
    const t = Number((r.rows[0] as any).t) || 0
    if (!opts.allowNegative && g + t < amt) { await tx.rollback(); return null }
    const grantMc = Math.min(g, amt)
    const topupMc = amt - grantMc // remainder off top-up (may exceed t → t goes negative in soft mode)
    await tx.execute({
      sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=?, updated_at=? WHERE workspace_id=?",
      args: [g - grantMc, t - topupMc, Date.now(), workspaceId],
    })
    await tx.commit()
    return { grantMc, topupMc }
  } catch (e) { await tx.rollback().catch(() => {}); throw e }
}

export async function creditWorkspaceCredits(workspaceId: string, split: DebitSplit): Promise<void> {
  await db!.execute({
    sql: "UPDATE workspace_credits SET granted_millicredits = granted_millicredits + ?, topup_millicredits = topup_millicredits + ?, updated_at=? WHERE workspace_id=?",
    args: [Math.trunc(split.grantMc), Math.trunc(split.topupMc), Date.now(), workspaceId],
  })
}

export async function markGraceUsed(workspaceId: string, period: string): Promise<void> {
  await db!.execute({
    sql: "UPDATE workspace_credits SET last_grace_period=?, updated_at=? WHERE workspace_id=?",
    args: [period, Date.now(), workspaceId],
  })
}
```

> Note: `db!.transaction("write")` is the libSQL client transaction API. If the isolated-DB test harness does not support interactive transactions, fall back to the same conditional-UPDATE pattern used by `tryReserveDailySpend` (read split, then `UPDATE … WHERE granted_millicredits=? AND topup_millicredits=?` optimistic guard, retry once). Verify against `@libsql/client` 0.17 in this repo before choosing.

- [ ] **Step 4: Run tests** — `cd prototype && bun test lib/credits-db.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype/lib/db.ts prototype/lib/credits-db.test.ts
git commit -m "feat(credits): grant-first atomic debit + refund credit-back + grace marker"
```

---

## Task 5: `reserveCredits()` orchestrator + `InsufficientCreditsError` + grace

**Files:**
- Modify: `prototype/lib/credits.ts`
- Test: `prototype/lib/credits.test.ts` (append — uses `useIsolatedDb`)

**Interfaces:**
- Consumes: `ensureWorkspaceCredits`, `getCreditActionCost`, `debitWorkspaceCredits`, `creditWorkspaceCredits`, `insertCreditLedger`, `markGraceUsed`, `usagePeriod`, `planIsUnlimited`, `creditCostFor`, `planGrantMillicredits`.
- Produces:
  - `export class InsufficientCreditsError extends Error { readonly action: CreditAction; readonly neededMc: number; readonly availableMc: number }`
  - `export type ReserveOpts = { plan: string|null|undefined; units?: number; actorEmail?: string|null; isGuest?: boolean; refFeedbackId?: string|null; refRunId?: string|null; enforce?: boolean }`
  - `export type CreditReservation = { workspaceId: string; action: CreditAction; costMc: number; sufficient: boolean; usedGrace: boolean; wouldBlock: boolean; split: DebitSplit | null; settle(r: { ok: boolean; aiCallId?: string|null }): Promise<void> }`
  - `export async function reserveCredits(workspaceId: string, action: CreditAction, opts: ReserveOpts): Promise<CreditReservation>`

Behaviour:
1. Resolve plan grant → `ensureWorkspaceCredits(workspaceId, planGrantMillicredits(plan))` (also does lazy re-grant).
2. `planIsUnlimited(plan)` → return `{ costMc:0, sufficient:true, wouldBlock:false, split:null, settle: no-op }` (partner/internal never meters).
3. Resolve `baseMc = await getCreditActionCost(action)` (fallback to default) → `costMc = creditCostFor(action, units, baseMc)`.
4. Compute `sufficient = granted+topup ≥ costMc`. If not sufficient, `graceEligible = lastGracePeriod !== currentPeriod`.
5. **Hard mode (`enforce:true`)**: if `!sufficient && !graceEligible` → `throw InsufficientCreditsError` (NO debit, NO call). If grace → `markGraceUsed`, proceed.
6. **Soft mode (`enforce:false`, Phase-1 default)**: never throw. Set `wouldBlock = !sufficient && !graceEligible`. If `!sufficient && graceEligible` mark grace.
7. **Reserve (hold):** `split = await debitWorkspaceCredits(workspaceId, costMc, { allowNegative: !enforce })`. In hard mode with grace, `allowNegative:true` for that one action.
8. Return the reservation. `settle({ok:true, aiCallId})` → `insertCreditLedger({ workspaceId, action, millicredits: -costMc, aiCallId, refs, actorEmail, isGuest })`. `settle({ok:false})` → `creditWorkspaceCredits(workspaceId, split)` (restore) + `insertCreditLedger({ action:"refund", millicredits: +costMc, ... })`.

- [ ] **Step 1: Write the failing test** — append to `prototype/lib/credits.test.ts`

```ts
import { useIsolatedDb } from "./test-db-isolation"
import { reserveCredits, InsufficientCreditsError } from "./credits"
import { getWorkspaceCredits, listCreditLedgerForWorkspace, ensureWorkspaceCredits } from "./db"

const { getClient } = useIsolatedDb("klav-credits-reserve")

async function seedWallet(id: string, grantMc: number, topupMc = 0) {
  await ensureWorkspaceCredits(id, grantMc)
  await getClient().execute({
    sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=? WHERE workspace_id=?",
    args: [grantMc, topupMc, id],
  })
}

test("sufficient → debit + a ledger spend row linked to the ai_call", async () => {
  await seedWallet("acct_r1", 5000)
  const rv = await reserveCredits("acct_r1", "enhance", { plan: "pro" })
  expect(rv.sufficient).toBe(true)
  expect(rv.costMc).toBe(1000)
  await rv.settle({ ok: true, aiCallId: "ai_1" })
  const w = await getWorkspaceCredits("acct_r1")
  expect(w!.grantedMc).toBe(4000) // 5000 − 1000
  const rows = await listCreditLedgerForWorkspace("acct_r1")
  expect(rows[0].millicredits).toBe(-1000)
  expect(rows[0].aiCallId).toBe("ai_1")
})

test("hard-enforce insufficient → throws, NO debit, NO ledger row", async () => {
  await seedWallet("acct_r2", 500) // < 1000
  await expect(reserveCredits("acct_r2", "enhance", { plan: "pro", enforce: true }))
    .rejects.toBeInstanceOf(InsufficientCreditsError)
  const w = await getWorkspaceCredits("acct_r2")
  expect(w!.grantedMc).toBe(500) // untouched
  expect((await listCreditLedgerForWorkspace("acct_r2")).length).toBe(0)
})

test("one last-taste grace per period, then hard stop", async () => {
  await seedWallet("acct_r3", 0)
  const g = await reserveCredits("acct_r3", "enhance", { plan: "pro", enforce: true })
  expect(g.usedGrace).toBe(true)         // first over-limit action allowed
  await g.settle({ ok: true, aiCallId: "ai_g" })
  await expect(reserveCredits("acct_r3", "enhance", { plan: "pro", enforce: true }))
    .rejects.toBeInstanceOf(InsufficientCreditsError) // second → blocked
})

test("soft mode never throws and records consumption even when short (wouldBlock=true)", async () => {
  await seedWallet("acct_r4", 0)
  const rv = await reserveCredits("acct_r4", "sim", { plan: "free" }) // enforce omitted → soft
  expect(rv.wouldBlock).toBe(true)
  expect(rv.sufficient).toBe(false)
  await rv.settle({ ok: true, aiCallId: "ai_s" })
  const rows = await listCreditLedgerForWorkspace("acct_r4")
  expect(rows[0].millicredits).toBe(-15000) // real consumption still recorded
})

test("refund on failure restores balance and nets the ledger to zero", async () => {
  await seedWallet("acct_r5", 5000)
  const rv = await reserveCredits("acct_r5", "keyframes", { plan: "pro" })
  await rv.settle({ ok: false }) // failed/empty AI result
  const w = await getWorkspaceCredits("acct_r5")
  expect(w!.grantedMc).toBe(5000) // fully restored
  const net = (await listCreditLedgerForWorkspace("acct_r5")).reduce((s, r) => s + r.millicredits, 0)
  expect(net).toBe(0)
})

test("grant-before-topup spend order via reserve", async () => {
  await seedWallet("acct_r6", 1000, 9000) // grant 1000 + topup 9000
  const rv = await reserveCredits("acct_r6", "sim", { plan: "team" }) // 15000 > 10000
  // team wallet actually seeded above to 1000/9000 (10000 total) → grant emptied first
  await rv.settle({ ok: true, aiCallId: "ai_x" })
  const w = await getWorkspaceCredits("acct_r6")
  expect(w!.grantedMc).toBe(0)      // grant spent first
  expect(w!.topupMc).toBe(-5000)    // soft mode allowed the overspend off top-up
})

test("partner (unlimited) short-circuits: cost 0, no debit, settle is a no-op", async () => {
  await seedWallet("acct_r7", 0)
  const rv = await reserveCredits("acct_r7", "autosim", { plan: "partner" })
  expect(rv.costMc).toBe(0)
  expect(rv.sufficient).toBe(true)
  await rv.settle({ ok: true, aiCallId: "ai_p" })
  expect((await listCreditLedgerForWorkspace("acct_r7")).length).toBe(0)
})
```

- [ ] **Step 2: Run to verify it fails** — FAIL `reserveCredits is not a function`.

- [ ] **Step 3: Implement `reserveCredits` in `lib/credits.ts`**

```ts
import {
  ensureWorkspaceCredits, getCreditActionCost, debitWorkspaceCredits, creditWorkspaceCredits,
  insertCreditLedger, markGraceUsed, usagePeriod, type DebitSplit,
} from "./db"
import { planIsUnlimited } from "./db" // planIsUnlimited lives in db.ts

export class InsufficientCreditsError extends Error {
  readonly action: CreditAction; readonly neededMc: number; readonly availableMc: number
  constructor(action: CreditAction, neededMc: number, availableMc: number) {
    super(`Insufficient credits for ${action}: need ${neededMc}mc, have ${availableMc}mc`)
    this.name = "InsufficientCreditsError"
    this.action = action; this.neededMc = neededMc; this.availableMc = availableMc
  }
}

export type ReserveOpts = {
  plan: string | null | undefined
  units?: number
  actorEmail?: string | null
  isGuest?: boolean
  refFeedbackId?: string | null
  refRunId?: string | null
  enforce?: boolean // default: env KLAV_CREDITS_ENFORCE === "1"
}

export type CreditReservation = {
  workspaceId: string; action: CreditAction; costMc: number
  sufficient: boolean; usedGrace: boolean; wouldBlock: boolean; split: DebitSplit | null
  settle(r: { ok: boolean; aiCallId?: string | null }): Promise<void>
}

export function creditsEnforceDefault(): boolean {
  return process.env.KLAV_CREDITS_ENFORCE === "1"
}

const NOOP_RESERVATION = (workspaceId: string, action: CreditAction): CreditReservation => ({
  workspaceId, action, costMc: 0, sufficient: true, usedGrace: false, wouldBlock: false, split: null,
  async settle() { /* unlimited plan — nothing to record */ },
})

export async function reserveCredits(workspaceId: string, action: CreditAction, opts: ReserveOpts): Promise<CreditReservation> {
  const enforce = typeof opts.enforce === "boolean" ? opts.enforce : creditsEnforceDefault()
  const plan = opts.plan
  // Unlimited/internal (partner) never meters.
  if (planIsUnlimited(String(plan ?? ""))) return NOOP_RESERVATION(workspaceId, action)

  const w = await ensureWorkspaceCredits(workspaceId, planGrantMillicredits(plan))
  const baseMc = (await getCreditActionCost(action)) ?? undefined
  const costMc = creditCostFor(action, opts.units ?? 1, baseMc)
  const available = w.grantedMc + w.topupMc
  const period = usagePeriod()
  const sufficient = available >= costMc
  const graceEligible = !sufficient && w.lastGracePeriod !== period

  if (enforce && !sufficient && !graceEligible) {
    throw new InsufficientCreditsError(action, costMc, available)
  }
  const usedGrace = !sufficient && graceEligible
  if (usedGrace) await markGraceUsed(workspaceId, period)

  // Reserve (hold). allowNegative when soft OR when this is the granted grace action.
  const split = await debitWorkspaceCredits(workspaceId, costMc, { allowNegative: !enforce || usedGrace })

  const wouldBlock = !sufficient && !graceEligible
  const settle: CreditReservation["settle"] = async ({ ok, aiCallId }) => {
    if (ok) {
      await insertCreditLedger({
        workspaceId, action, millicredits: -costMc, aiCallId: aiCallId ?? null,
        refFeedbackId: opts.refFeedbackId ?? null, refRunId: opts.refRunId ?? null,
        actorEmail: opts.actorEmail ?? null, isGuest: opts.isGuest ?? false,
      })
    } else if (split) {
      await creditWorkspaceCredits(workspaceId, split) // restore the hold
      await insertCreditLedger({
        workspaceId, action: "refund", millicredits: costMc, aiCallId: aiCallId ?? null,
        refFeedbackId: opts.refFeedbackId ?? null, refRunId: opts.refRunId ?? null,
        actorEmail: opts.actorEmail ?? null, isGuest: opts.isGuest ?? false,
      })
    }
  }
  return { workspaceId, action, costMc, sufficient, usedGrace, wouldBlock, split, settle }
}
```

> `planIsUnlimited` is exported from `db.ts` (verified L2517). If importing it from `db.ts` risks a circular import with the helpers already imported, re-export or inline `plan === "partner"` — but prefer reuse.

- [ ] **Step 4: Run tests** — `cd prototype && bun test lib/credits.test.ts` → PASS (all reserve tests).

- [ ] **Step 5: Commit**

```bash
git add prototype/lib/credits.ts prototype/lib/credits.test.ts
git commit -m "feat(credits): reserveCredits orchestrator + grace + typed InsufficientCreditsError"
```

---

## Task 6: monthly grant reset job

**Files:**
- Modify: `prototype/lib/credits.ts`
- Test: `prototype/lib/credits-reset.test.ts` (new)

**Interfaces:**
- Consumes: `db` (raw), `ensureWorkspaceCredits`, `planGrantMillicredits`, account rows (`accounts.id`, `accounts.plan`).
- Produces: `export async function runMonthlyGrantReset(atMs?: number): Promise<{ scanned: number; regranted: number }>` — iterates all `accounts`, calls `ensureWorkspaceCredits(id, planGrantMillicredits(plan), atMs)` (which lazily re-grants stale periods), returns counts. Idempotent within a period.

- [ ] **Step 1: Write the failing test** — `prototype/lib/credits-reset.test.ts`

```ts
import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { runMonthlyGrantReset } from "./credits"
import { getWorkspaceCredits } from "./db"

const { getClient } = useIsolatedDb("klav-credits-reset")

async function acct(id: string, plan: string) {
  await getClient().execute({ sql: "INSERT INTO accounts (id,name,owner_email,plan,created_at) VALUES (?,?,?,?,?)", args: [id, id, `${id}@quantana.com.au`, plan, Date.now()] })
}

test("runMonthlyGrantReset restores granted=plan_grant, keeps top-up across a month boundary", async () => {
  await acct("acct_reset_1", "team")
  const jan = Date.UTC(2026, 0, 10)
  await runMonthlyGrantReset(jan)
  // spend the grant down + add a top-up
  await getClient().execute({ sql: "UPDATE workspace_credits SET granted_millicredits=?, topup_millicredits=? WHERE workspace_id=?", args: [123, 7000 * 1000, "acct_reset_1"] })
  const feb = Date.UTC(2026, 1, 1)
  const res = await runMonthlyGrantReset(feb)
  expect(res.scanned).toBeGreaterThanOrEqual(1)
  const w = await getWorkspaceCredits("acct_reset_1")
  expect(w!.grantedMc).toBe(10_000_000) // team re-grant
  expect(w!.topupMc).toBe(7_000_000)    // top-up survived the reset
})
```

- [ ] **Step 2: Run to verify it fails** — FAIL `runMonthlyGrantReset is not a function`.

- [ ] **Step 3: Implement**

```ts
import { db } from "./db"

export async function runMonthlyGrantReset(atMs: number = Date.now()): Promise<{ scanned: number; regranted: number }> {
  if (!db) return { scanned: 0, regranted: 0 }
  const r = await db.execute("SELECT id, plan FROM accounts")
  let regranted = 0
  for (const row of r.rows as any[]) {
    const before = await getWorkspaceCredits(String(row.id))
    await ensureWorkspaceCredits(String(row.id), planGrantMillicredits(row.plan), atMs)
    const after = await getWorkspaceCredits(String(row.id))
    if (!before || before.grantPeriod !== after!.grantPeriod) regranted++
  }
  return { scanned: r.rows.length, regranted }
}
```

Add `getWorkspaceCredits` to the `./db` import list in `credits.ts`.

Optionally register a daily tick in the scheduler that calls `runMonthlyGrantReset()` — search `server.ts` for the existing `setInterval`/scheduler loop that already runs periodic jobs and add `void runMonthlyGrantReset().catch(()=>{})` on a daily cadence. Lazy re-grant already covers correctness; the job is a warm-up. If no clean scheduler hook exists, skip the wiring (lazy path suffices) and note it.

- [ ] **Step 4: Run tests** — `cd prototype && bun test lib/credits-reset.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add prototype/lib/credits.ts prototype/lib/credits-reset.test.ts
git commit -m "feat(credits): idempotent monthly grant-reset job (lazy re-grant + batch)"
```

---

## Task 7: wire Enhance (soft) + core-submit-safety guard

**Files:**
- Modify: `prototype/server.ts` (`POST /api/report/enhance` ~3530)
- Test: `prototype/lib/credits-core-submit-safety.test.ts` (new — route-contract style)

**Interfaces:**
- Consumes: `reserveCredits`, `accountIdForAiCall`, the account's plan (resolve via `projectById(projectId)` → account → plan; reuse whatever helper the enhance route can reach, e.g. `accountById`/`planForProject`). Grep for how other routes read a project's plan (`normalizePlan`, `accountById`) and reuse it.

Wire (soft — never change control flow): inside the `try` around `generateEnhancedDraft`, before the `chat()` call resolve the wallet + reserve, and settle on the result. The draft still returns even when short.

```ts
// Resolve workspace + plan for credits (best-effort; a resolution miss must NOT block Enhance).
const wsId = await accountIdForAiCall(projectId, null, null)
const acct = wsId ? await accountById(wsId) : null            // reuse existing accountById
const plan = acct?.plan ?? proj?.plan ?? null
let reservation: Awaited<ReturnType<typeof reserveCredits>> | null = null
try {
  if (db && wsId) reservation = await reserveCredits(wsId, "enhance", { plan, refFeedbackId: null })
  // Phase 1 SOFT: log the decision, do NOT block.
  if (reservation?.wouldBlock) console.log(`[credits] enhance wouldBlock ws=${wsId} (soft)`)
} catch (e: any) { console.warn("[credits] enhance reserve skipped (non-fatal):", e?.message || e) }

const draft = await generateEnhancedDraft(text, { /* …existing llm closure unchanged… */ })
try { await reservation?.settle({ ok: !!draft, aiCallId: null }) } catch {}
return wjson({ draft })
```

> `aiCallId` is null here because `recordAiCall` is fire-and-forget inside `chat()` and does not return the id. Linking to the exact `ai_calls` row is a Phase-2 refinement (thread the id back from `chat`); Phase-1 ledger rows carry the action + refs + workspace, which is enough for the opsadmin margin panel (matched by workspace + time window). Note this in the panel query.

- [ ] **Step 1: Write the failing safety test** — `prototype/lib/credits-core-submit-safety.test.ts`

```ts
import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"

// The core report-SUBMIT path must NEVER call reserveCredits — capture+submit is free forever.
// Static contract test (mirrors lib/route-contract.test.ts): assert no credit gate sits on submit.
const server = readFileSync(new URL("../server.ts", import.meta.url), "utf8")

test("core bug submit route does not reference reserveCredits", () => {
  // Grab the POST /api/report handler block heuristically: from its route guard to the next route.
  const start = server.indexOf('path === "/api/report"')
  expect(start).toBeGreaterThan(-1)
  const slice = server.slice(start, start + 6000)
  expect(slice.includes("reserveCredits")).toBe(false)
})

test("enhance route reserves credits softly (returns draft regardless)", () => {
  const start = server.indexOf('path === "/api/report/enhance"')
  const slice = server.slice(start, start + 4000)
  expect(slice.includes("reserveCredits")).toBe(true)
  expect(slice.includes('"enhance"')).toBe(true)
})
```

Adjust the `indexOf` anchors to the exact route-guard strings present in `server.ts` (verify with grep — the submit route may be `path === "/api/report"` or `path.startsWith("/api/feedback")`; use the real one).

- [ ] **Step 2: Run to verify it fails** — `cd prototype && bun test lib/credits-core-submit-safety.test.ts` → FAIL (enhance test: no `reserveCredits` yet).

- [ ] **Step 3: Implement the enhance wiring** (above). Confirm `accountById` exists (grep; if the helper is named differently, use the real one) and imports resolve.

- [ ] **Step 4: Run tests** — `cd prototype && bun test lib/credits-core-submit-safety.test.ts` → PASS. Then `cd prototype && bun test` to confirm no regressions.

- [ ] **Step 5: Commit**

```bash
git add prototype/server.ts prototype/lib/credits-core-submit-safety.test.ts
git commit -m "feat(credits): wire Enhance to soft credit reserve; assert core submit ungated"
```

---

## Task 8: wire video-enrich (walkthrough summary + keyframes) soft

**Files:**
- Modify: `prototype/server.ts` (`enrichReportFromTranscript` ~642)

Wire two reserves (both soft, both best-effort — a credits miss must never touch the report):
- Around the **walkthrough summary** `chat()` (action `"transcript"`? No — this is a *vision summary of the transcript*; treat as the **`transcript`** enrichment per spec §9 "transcript/keyframes … the KLA-603 post-submit enrichment". Use action `"transcript"` with `units` = total transcript minutes from `gatherTranscriptText`/segments; if minutes unknown, `units=1`).
- Around the **keyframes** extraction block, action `"keyframes"` (flat 2cr), settled on `newAtts.length > 0`.

Resolve `wsId = await accountIdForAiCall(projectId, null, fb.actorEmail)` and `plan` once at the top of the function.

```ts
// (top of enrichReportFromTranscript, after fb is loaded)
const wsId = db ? await accountIdForAiCall(projectId, null, fb.actorEmail ?? null) : null
const acct = wsId ? await accountById(wsId) : null
const plan = acct?.plan ?? null

// (summary block, just before the generateEnhancedDraft call)
let transcriptMinutes = 1
try { const totalMs = transcripts.reduce((s, t) => s + (t.durationMs || 0), 0); if (totalMs > 0) transcriptMinutes = totalMs / 60000 } catch {}
let rv: Awaited<ReturnType<typeof reserveCredits>> | null = null
try { if (wsId) rv = await reserveCredits(wsId, "transcript", { plan, units: transcriptMinutes, refFeedbackId: feedbackId, actorEmail: fb.actorEmail ?? null }) } catch {}
if (rv?.wouldBlock) console.log(`[credits] video-enrich transcript wouldBlock ws=${wsId} (soft)`)
// … existing draft generation …
try { await rv?.settle({ ok: !!draft, aiCallId: null }) } catch {}

// (keyframes block)
let kfRv: Awaited<ReturnType<typeof reserveCredits>> | null = null
try { if (wsId) kfRv = await reserveCredits(wsId, "keyframes", { plan, refFeedbackId: feedbackId, actorEmail: fb.actorEmail ?? null }) } catch {}
// … existing extraction …
try { await kfRv?.settle({ ok: newAtts.length > 0, aiCallId: null }) } catch {}
```

- [ ] **Step 1: Write the failing test** — append to `prototype/lib/credits-core-submit-safety.test.ts`

```ts
test("enrichReportFromTranscript reserves transcript + keyframes credits (soft)", () => {
  const start = server.indexOf("async function enrichReportFromTranscript")
  const slice = server.slice(start, start + 8000)
  expect(slice.includes('reserveCredits')).toBe(true)
  expect(slice.includes('"transcript"')).toBe(true)
  expect(slice.includes('"keyframes"')).toBe(true)
})
```

- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement the wiring** (above). Ensure the `keyframes` reserve only spends when a source video is actually processed (guard the reserve behind the same `if (!hasKeyframes && src && src.key)` condition — do not reserve when the block no-ops).
- [ ] **Step 4: Run** `cd prototype && bun test lib/credits-core-submit-safety.test.ts` → PASS; then `bun test` full → green.
- [ ] **Step 5: Commit**

```bash
git add prototype/server.ts prototype/lib/credits-core-submit-safety.test.ts
git commit -m "feat(credits): soft-meter video-enrich transcript summary + keyframes"
```

---

## Task 9: wire transcript STT + voice dictation soft

**Files:**
- Modify: `prototype/lib/transcribe.ts` (`transcribeFeedbackRecordings` ~197, `transcribeFeedbackAttachments` ~264)
- Modify: `prototype/server.ts` (`POST /api/voice/transcribe` ~3606)

**transcribe.ts** — next to each existing `recordAiCall({ type:"transcribe", … })`, add a per-clip reserve keyed on the clip's minutes. `outcome.status === "done"` → the STT actually ran → settle ok. The clip duration: recordings/attachments carry `contentType`; if a `durationMs` is available in the record pass it, else `units=1` (floor 1cr). Resolve `wsId`/`plan` once per function via `accountIdForAiCall(projectId, null, null)` + `accountById`.

```ts
// inside the loop, replacing the recordAiCall-only block, still after the transcript is stored:
if (outcome.status !== "skipped") {
  let rv: Awaited<ReturnType<typeof reserveCredits>> | null = null
  try {
    if (wsId) {
      const mins = outcome.status === "done" ? Math.max(1, (approxDurationMs(rec) || 60000) / 60000) : 1
      rv = await reserveCredits(wsId, "transcript", { plan, units: mins, refFeedbackId: feedbackId })
      if (rv.wouldBlock) console.log(`[credits] transcript wouldBlock ws=${wsId} (soft)`)
    }
  } catch {}
  await recordAiCall({ type: "transcribe", model: TRANSCRIBE_MODEL, projectId, feature: "transcribe",
    costUsd: outcome.status === "done" ? (outcome.result.usage.cost ?? null) : null, ok: outcome.status === "done" }).catch(() => null)
  try { await rv?.settle({ ok: outcome.status === "done", aiCallId: null }) } catch {}
}
```

`approxDurationMs` = read from the record if present, else null. Keep it best-effort; do NOT add new STT work. Import `reserveCredits` from `./credits`, `accountIdForAiCall`/`accountById` from `./db`.

**server.ts voice route** — after a successful `transcribeAudioBytes`, reserve `"voice"` (0.1cr per dictation, `units=1`) softly and settle on success:

```ts
// after `outcome` resolves, before returning the text:
try {
  const wsId = await accountIdForAiCall(projectId, null, null)
  const acct = wsId ? await accountById(wsId) : null
  if (wsId) {
    const rv = await reserveCredits(wsId, "voice", { plan: acct?.plan ?? null, units: 1 })
    if (rv.wouldBlock) console.log(`[credits] voice wouldBlock ws=${wsId} (soft)`)
    await rv.settle({ ok: outcome.status === "done", aiCallId: null })
  }
} catch (e: any) { console.warn("[credits] voice reserve skipped (non-fatal):", e?.message || e) }
```

- [ ] **Step 1: Write the failing test** — new `prototype/lib/credits-wiring.test.ts` (static contract, like Task 7)

```ts
import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
const transcribe = readFileSync(new URL("./transcribe.ts", import.meta.url), "utf8")
const server = readFileSync(new URL("../server.ts", import.meta.url), "utf8")

test("transcribe records reserve transcript credits softly", () => {
  expect(transcribe.includes("reserveCredits")).toBe(true)
  expect(transcribe.includes('"transcript"')).toBe(true)
})
test("voice route reserves voice credits (0.1cr) softly", () => {
  const start = server.indexOf('path === "/api/voice/transcribe"')
  const slice = server.slice(start, start + 5000)
  expect(slice.includes("reserveCredits")).toBe(true)
  expect(slice.includes('"voice"')).toBe(true)
})
```

- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement both wirings.** Run `bun test lib/transcribe.test.ts` to confirm the existing STT tests still pass (the reserve is additive + guarded).
- [ ] **Step 4: Run** `cd prototype && bun test lib/credits-wiring.test.ts lib/transcribe.test.ts` → PASS; then full `bun test`.
- [ ] **Step 5: Commit**

```bash
git add prototype/lib/transcribe.ts prototype/server.ts prototype/lib/credits-wiring.test.ts
git commit -m "feat(credits): soft-meter transcript STT (per-min) + voice dictation (0.1cr)"
```

---

## Task 10: wire Sim (soft)

**Files:**
- Modify: `prototype/lib/sim-review.ts` (~412, next to `incrementUsageMeter({ metric:"sim_review" })`)

Add a `reserveCredits(wsId, "sim", …)` alongside the meter. `runSimReviews` runs once per review batch; the existing meter increments once per Sim reaction persisted (verify the loop granularity at L412 — reserve **once per persisted Sim review** to match the 15cr = one Sim). Resolve `wsId` via `accountIdForAiCall(projectId, null, actorEmail)`; the plan via `accountById`. Settle ok when the review produced a reaction.

```ts
// near the existing: void incrementUsageMeter({ metric: "sim_review", projectId, actorEmail })
try {
  const wsId = await accountIdForAiCall(projectId, null, actorEmail ?? null)
  if (wsId) {
    const acct = await accountById(wsId)
    const rv = await reserveCredits(wsId, "sim", { plan: acct?.plan ?? null, actorEmail: actorEmail ?? null, refFeedbackId: feedbackId ?? null })
    if (rv.wouldBlock) console.log(`[credits] sim wouldBlock ws=${wsId} (soft)`)
    await rv.settle({ ok: true, aiCallId: null })
  }
} catch (e: any) { console.warn("[credits] sim reserve skipped (non-fatal):", e?.message || e) }
```

Keep it fire-safe: wrap in try/catch, never throw into the Sim pipeline. Import `reserveCredits` from `./credits`; `accountIdForAiCall`/`accountById` are already in the `./db` import (extend it).

- [ ] **Step 1: Write the failing test** — append to `prototype/lib/credits-wiring.test.ts`

```ts
const simReview = readFileSync(new URL("./sim-review.ts", import.meta.url), "utf8")
test("sim-review reserves 'sim' credits alongside the usage meter", () => {
  expect(simReview.includes("reserveCredits")).toBe(true)
  expect(simReview.includes('"sim"')).toBe(true)
})
```

- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement.** Run `bun test lib/sims-onpage-journey.e2e.test.ts lib/usage-meters.test.ts` to confirm the Sim pipeline + meter tests still pass.
- [ ] **Step 4: Run** `cd prototype && bun test lib/credits-wiring.test.ts` → PASS; then full `bun test`.
- [ ] **Step 5: Commit**

```bash
git add prototype/lib/sim-review.ts prototype/lib/credits-wiring.test.ts
git commit -m "feat(credits): soft-meter Sim reviews (15cr) alongside usage meter"
```

---

## Task 11: wire AutoSim (soft)

**Files:**
- Modify: `prototype/lib/trails-runner.ts` (~1061, next to `incrementUsageMeter({ metric:"autosim_walk" })`)

Mirror Task 10 with action `"autosim"` (75cr), keyed on `refRunId` (the walk/run id available at that call site). Resolve `wsId` via `accountIdForAiCall(projectId, …)`. Settle ok when the walk completed (the same condition under which `incrementUsageMeter` fires).

```ts
// near the existing: void incrementUsageMeter({ metric: "autosim_walk", projectId })
try {
  const wsId = await accountIdForAiCall(projectId, null, null)
  if (wsId) {
    const acct = await accountById(wsId)
    const rv = await reserveCredits(wsId, "autosim", { plan: acct?.plan ?? null, refRunId: runId ?? null })
    if (rv.wouldBlock) console.log(`[credits] autosim wouldBlock ws=${wsId} (soft)`)
    await rv.settle({ ok: true, aiCallId: null })
  }
} catch (e: any) { console.warn("[credits] autosim reserve skipped (non-fatal):", e?.message || e) }
```

Verify the local variable name for the run id at that site (likely `runId` / `run.id`); use the real one.

- [ ] **Step 1: Write the failing test** — append to `prototype/lib/credits-wiring.test.ts`

```ts
const trailsRunner = readFileSync(new URL("./trails-runner.ts", import.meta.url), "utf8")
test("trails-runner reserves 'autosim' credits alongside the usage meter", () => {
  expect(trailsRunner.includes("reserveCredits")).toBe(true)
  expect(trailsRunner.includes('"autosim"')).toBe(true)
})
```

- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement.** Run the AutoSim tests that touch this path (`bun test lib/autosim-walk-resilience.test.ts` and any `trails-*` test) to confirm no regression.
- [ ] **Step 4: Run** full `cd prototype && bun test` → green.
- [ ] **Step 5: Commit**

```bash
git add prototype/lib/trails-runner.ts prototype/lib/credits-wiring.test.ts
git commit -m "feat(credits): soft-meter AutoSim walks (75cr) alongside usage meter"
```

---

## Task 12: `/opsadmin` credits margin panel

**Files:**
- Modify: `prototype/lib/superadmin.ts` (add credits rollup to `buildSuperadminPL`)
- Modify: `prototype/server.ts` (`renderOpsAdmin` panel + include in the `/api/superadmin/pl` payload)
- Test: `prototype/lib/credits-opsadmin.test.ts` (new)

**Interfaces:**
- Produces:
  - `superadmin.ts`: `export type CreditsPLRow = { workspaceId: string; grantedConsumedMc: number; topupConsumedMc: number; creditRevenueUsd: number; llmCogsUsd: number; creditMarginUsd: number }`
  - `superadmin.ts`: `export async function creditsMarginByWorkspace(now?: number): Promise<CreditsPLRow[]>`

Definitions (peg `1cr = $0.01`, so `USD = millicredits / MC_PER_CREDIT × 0.01 = mc / 100000`):
- `grantedConsumedMc` / `topupConsumedMc`: sum of **negative** `credit_ledger.millicredits` for spend actions, per workspace (absolute value). (Grant vs top-up split is not stored on the ledger row; report combined *consumed* + separately the current wallet balances from `workspace_credits`. For the panel, "granted vs topup consumed" is approximated as: consumed against grant = min(consumed, plan_grant), remainder against top-up. Document this approximation in the panel; exact per-bucket attribution is a Phase-2 refinement.)
- `creditRevenueUsd`: consumed credits × $0.01/cr (what the metered value is *worth* at retail) — the productized markup value.
- `llmCogsUsd`: the workspace's `ai_calls` COGS over the same window (reuse the `llmByAcct` map already built in `buildSuperadminPL`).
- `creditMarginUsd = creditRevenueUsd − llmCogsUsd`.

`creditsMarginByWorkspace` query:

```ts
export type CreditsPLRow = {
  workspaceId: string; grantedConsumedMc: number; topupConsumedMc: number
  creditRevenueUsd: number; llmCogsUsd: number; creditMarginUsd: number
}

const MC_PER_CREDIT = 1000
const USD_PER_CREDIT = 0.01

export async function creditsMarginByWorkspace(now: number = Date.now()): Promise<CreditsPLRow[]> {
  // consumed = −SUM(negative spend rows) per workspace
  const consumed = new Map<string, number>()
  for (const r of await q(
    `SELECT workspace_id AS ws, COALESCE(SUM(-millicredits),0) AS mc
       FROM credit_ledger WHERE millicredits < 0 GROUP BY workspace_id`)) {
    consumed.set(String(r.ws), Number(r.mc) || 0)
  }
  const planGrant = new Map<string, number>()
  for (const r of await q(`SELECT workspace_id AS ws, plan_grant_millicredits AS pg FROM workspace_credits`)) {
    planGrant.set(String(r.ws), Number(r.pg) || 0)
  }
  const llm = new Map<string, number>()
  for (const r of await q(`SELECT account_id AS aid, COALESCE(SUM(cost_usd),0) AS c FROM ai_calls WHERE account_id IS NOT NULL GROUP BY account_id`)) {
    llm.set(String(r.aid), Number(r.c) || 0)
  }
  const rows: CreditsPLRow[] = []
  for (const [ws, mc] of consumed) {
    const grantedConsumedMc = Math.min(mc, planGrant.get(ws) ?? mc)
    const topupConsumedMc = Math.max(0, mc - grantedConsumedMc)
    const creditRevenueUsd = (mc / MC_PER_CREDIT) * USD_PER_CREDIT
    const llmCogsUsd = llm.get(ws) ?? 0
    rows.push({ workspaceId: ws, grantedConsumedMc, topupConsumedMc, creditRevenueUsd, llmCogsUsd, creditMarginUsd: creditRevenueUsd - llmCogsUsd })
  }
  return rows.sort((a, b) => b.creditRevenueUsd - a.creditRevenueUsd)
}
```

`q` is the existing private query helper in `superadmin.ts` (verify its name; it wraps `db.execute` and returns `.rows`). Fold the result into the `SuperadminPL` return type (add `credits: CreditsPLRow[]`) OR expose it directly on `/api/superadmin/pl`. Then render a table in `renderOpsAdmin` (or the `/superadmin.html` client — check which surface actually renders `buildSuperadminPL`; the JSON is consumed by `public/superadmin.html`, so add the panel there, and/or add a compact summary block to `renderOpsAdmin` in server.ts).

- [ ] **Step 1: Write the failing test** — `prototype/lib/credits-opsadmin.test.ts`

```ts
import { expect, test } from "bun:test"
import { useIsolatedDb } from "./test-db-isolation"
import { creditsMarginByWorkspace } from "./superadmin"
import { ensureWorkspaceCredits, insertCreditLedger, recordAiCall } from "./db"

const { getClient } = useIsolatedDb("klav-credits-opsadmin")

test("credit margin = credit revenue − ai_calls COGS, reconciles per workspace", async () => {
  const c = getClient()
  await c.execute({ sql: "INSERT INTO accounts (id,name,owner_email,plan,created_at) VALUES (?,?,?,?,?)", args: ["ws_pl_1", "W", "w@quantana.com.au", "team", Date.now()] })
  await c.execute({ sql: "INSERT INTO projects (id,account_id,name,created_at,updated_at) VALUES (?,?,?,?,?)", args: ["proj_pl_1", "ws_pl_1", "P", Date.now(), Date.now()] })
  await ensureWorkspaceCredits("ws_pl_1", 10000 * 1000)
  // consume 15 credits (one Sim) → revenue = 15 × $0.01 = $0.15
  await insertCreditLedger({ workspaceId: "ws_pl_1", action: "sim", millicredits: -15000, aiCallId: "ai_1" })
  // real COGS for that account = $0.05
  await recordAiCall({ type: "extract", model: "m", projectId: "proj_pl_1", costUsd: 0.05 })
  const rows = await creditsMarginByWorkspace()
  const row = rows.find(r => r.workspaceId === "ws_pl_1")!
  expect(row.creditRevenueUsd).toBeCloseTo(0.15, 6)
  expect(row.llmCogsUsd).toBeCloseTo(0.05, 6)
  expect(row.creditMarginUsd).toBeCloseTo(0.10, 6)
  expect(row.grantedConsumedMc).toBe(15000) // under the 10,000-cr grant
})
```

- [ ] **Step 2: Run to verify it fails** — FAIL `creditsMarginByWorkspace is not a function`.
- [ ] **Step 3: Implement `creditsMarginByWorkspace`** in `superadmin.ts` (above). Verify the `q()` helper name.
- [ ] **Step 4: Run tests** — `cd prototype && bun test lib/credits-opsadmin.test.ts` → PASS.
- [ ] **Step 5: Render the panel.** Add a "Credits margin" table to whichever surface renders the P&L (`public/superadmin.html` reads `/api/superadmin/pl`; add `credits` to that JSON and a table in the HTML; optionally a summary line in `renderOpsAdmin`). Keep it read-only, OPS_ADMIN-gated (the route already is).
- [ ] **Step 6: Run full suite** — `cd prototype && bun test` → green.
- [ ] **Step 7: Commit**

```bash
git add prototype/lib/superadmin.ts prototype/server.ts prototype/public/superadmin.html prototype/lib/credits-opsadmin.test.ts
git commit -m "feat(credits): /opsadmin credit-margin panel (revenue − ai_calls COGS per workspace)"
```

---

## Phase 1 wrap-up

- [ ] Run the full suite once more: `cd prototype && bun test` — confirm green.
- [ ] Pull latest and rebase per the worker rules: `git fetch origin master && git rebase origin/master` (or `git merge origin/master`; on conflict `git merge --abort` and leave the branch). Re-run `bun test`.
- [ ] Leave the branch for the orchestrator. **Do not** push to master.

---

# PHASE 2 — The pinch UX (OUTLINE ONLY — needs founder go)

> **Gate:** Phase 2 flips Phase-1 SOFT enforcement to HARD by defaulting `KLAV_CREDITS_ENFORCE=1` and surfacing the pinch. **This changes customer-visible behavior and gates revenue — do not start it without a founder checkpoint.** A dedicated detailed TDD plan will be written after Phase-1 consumption data validates the cost/COGS multiples on real traffic.

Scope to detail later:
- **Show-value-then-wall (spec §6):** Enhance/transcript pre-check affordability; when `wouldBlock` and no grace, still produce the *first* result (grace), then return a typed pinch payload the composer renders as "that was your last AI Enhance this month — Upgrade or top up." Core submit still files the plain report.
- **Surface the "last taste" grace** in the UI copy; ensure `usedGrace` is echoed to the client.
- **Owner/admin top-up + upgrade flows:** Stripe checkout for à-la-carte packs (~$10/1,000cr, volume tiers) writing a `+topup` `credit_ledger` row and incrementing `workspace_credits.topup_millicredits` (rolls over); plan-upgrade → bigger monthly grant next cycle. Owner/admin-gated.
- **Dashboard balance meter:** granted-vs-topup remaining, this-period consumption, a small "X credits left" chip; reuse `getWorkspaceCredits` + `listCreditLedgerForWorkspace`.
- **Flip enforcement:** default `enforce` true; wire `InsufficientCreditsError` → the pinch response at each call site; keep core submit ungated (Task-7 safety test stays green).

# PHASE 3 — The guest loop (OUTLINE ONLY)

> A separate detailed plan; depends on Phase 2 relief valves existing.

Scope to detail later:
- **Guest/anon AI draws from the workspace wallet** (`isGuest:true` already threaded through `reserveCredits`/`credit_ledger`), rate-capped per (workspace, ticket, IP) — reuse the `rlAllow` + `freetool_usage`-style counters; over the cap → "ask your admin," no debit.
- **"Ask your admin" at zero** — guest-facing copy when the workspace wallet is empty.
- **Attributed admin nudge** — aggregate `credit_ledger` guest rows ("3 people on KLAV-88 wanted AI Enhance") into an in-app banner + digest + per-project Slack/email via KLA-608. Owner/admin sees demand as a draining balance + a queue of unmet AI requests.

---

## Self-Review (writing-plans checklist)

**1. Spec coverage.** §3 free/metered boundary → costs table Task 1 + core-submit-safety Task 7. §4 unified currency/millicredits → Task 1 (`creditCostFor`, millicredits). §5 grants/reset/top-up-rollover/grant-first → Tasks 2, 4, 6. §6 pinch → Phase 2 (outlined, gated). §7 guest loop → Phase 3 (outlined). §8 data model (`workspace_credits`, `credit_ledger`, `credit_action_costs`, reset job) → Tasks 1–3, 6. §9 enforcement at each call site (Enhance/transcript/keyframes/Sim/AutoSim + `reserveCredits` linked to `ai_calls`) → Tasks 5, 7–11. §10 guardrails (core-submit-never-blocked Task 7, refund-on-failure Task 5, margin visibility Task 12, reserve-before-spend Task 5); guest rate cap → Phase 3. §11 back-compat (seed full wallet on first touch; Founding Team-level) → Task 2 + grant map. §13 phasing → Phase-1 detailed, 2/3 outlined. §14 testing → all eight bullets have a named test (reserve sufficient/insufficient/grace/grant-first/refund Task 5; core-submit Task 7; monthly reset Task 6; voice millicredit exactness Task 1; opsadmin margin Task 12). **No gaps.**

**2. Placeholder scan.** No "TBD"/"handle edge cases"/"similar to Task N". Every code step shows real code. Two explicit *implementer verifications* remain (real variable/helper names to confirm by grep: `accountById`, the submit-route guard string, the run-id local in `trails-runner.ts`, the `q()` helper name, the scheduler hook, and the libSQL transaction API) — these are grounding confirmations, not deferred design.

**3. Type consistency.** `CreditAction`, `CreditReservation`, `ReserveOpts`, `DebitSplit`, `WorkspaceCredits`, `CreditLedgerInsert/Row`, `CreditsPLRow` are defined once and reused verbatim. `millicredits` is the field name everywhere; `costMc`/`grantMc`/`topupMc` suffix `Mc` marks millicredit integers consistently. `reserveCredits(workspaceId, action, opts)` signature is identical across Tasks 5, 7–11. `MC_PER_CREDIT = 1000` and `USD_PER_CREDIT = 0.01` are the only magic numbers, both named.
