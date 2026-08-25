# Klavity — Unified "Klavity Credits" Monetization — Design Spec

**Status:** approved direction (founder, 2026-08-25) · numbers are RECOMMENDED DEFAULTS pending founder sign-off (see §12)
**Author:** product/pricing strategy pass, 2026-08-25

---

## 1. Thesis

**Meter the AI, never the reporting.** Capturing and submitting a bug is the viral, near-zero-COGS top of the funnel and must stay free forever. Everything that spends an LLM/STT/vision/browser call is metered through **one wallet of "Klavity Credits."** Give everyone enough free credits to fall in love with the AI, then let the habit outgrow the grant — the person who *feels the pinch* (often a free guest/reporter, not the buyer) becomes the pressure that converts the buyer.

Klavity already owns the hard plumbing: the **`ai_calls` ledger** logs every model call with its real cost, **`cost_events`** tracks S3/browser/email, `chat()` already routes through `tryReserveDailySpend` + `recordAiCall`, and `/opsadmin` renders the per-workspace P&L. Credits are a productized markup layer on top of that existing COGS truth.

---

## 2. Goals / Non-goals

**Goals**
- One legible currency ("Klavity Credits") that funds ALL AI: Snap AI (Enhance, transcript, keyframes) AND Sims/AutoSim.
- Free, unmetered core reporting (capture + submit) — inviolable.
- A monthly free grant per tier generous enough to hook, tight enough to convert.
- The **guest-pinch → admin-nudge** PLG loop: guests can *want* AI and *request* it; only owners/admins pay.
- Top-up (à-la-carte) AND upgrade (plan) as the two relief valves.
- Margin protected: credit price pegged to a healthy multiple of real COGS, visible in `/opsadmin`.

**Non-goals**
- Re-pricing the base plans (Free / Solo $49 / Team $249 / Scale $599 / Founding Ten $299 stay as-is; credits are the metered dimension inside them).
- Metering the cheap quality helpers (clarity coach, auto-title) — bundled free (§6).
- Charging guests directly (they can never pay; they request).
- Blocking the core bug submit under any circumstance.

---

## 3. The free ↔ metered boundary

| Action | Cost | Rationale |
|---|---|---|
| Right-click / widget / extension **capture + submit** (screenshot, video, logs) | **FREE, unmetered** | Viral top-of-funnel; bounded S3 COGS; JTBD "never lose a report" |
| **Clarity coach** + **AI auto-title** | **FREE (bundled)** | Cheap; makes Klavity look smart; drives report quality — don't nickel-and-dime |
| **AI Enhance** (vision draft) | metered | Vision LLM call |
| **Video transcript** (STT) | metered per-minute | STT cost scales with length |
| **Keyframe extraction + summary** | metered | ffmpeg (free CPU) + a vision summary call |
| **Voice dictation** (STT) | metered (light) OR bundled — see §12 open decision | STT per clip |
| **Sim** (persona review) | metered | Multiple LLM calls |
| **AutoSim run** | metered (heaviest) | Browser automation + many vision/LLM calls |

Storage quota (Free 2GB / Solo 25 / Team 150 / Scale 500 GB, per the KLA-594 decision) is a **separate** meter — credits fund AI, quota bounds storage. Do not conflate.

---

## 4. The unified currency — "Klavity Credits"

**Peg:** `1 credit ≈ $0.01 of list AI value`. Internally, an action's credit cost = `ceil( COGS × MARKUP / $0.01 )` where `MARKUP ≈ 4–5×` (protects blended margin after model/browser cost). The `ai_calls` ledger gives the live COGS, so credit costs are **derived, not guessed**, and can be re-tuned centrally.

**Recommended per-action costs (illustrative — sign-off in §12):**

| Action | ~COGS | Credits |
|---|---|---|
| AI Enhance (1 vision call) | ~$0.002 | **1** |
| Video transcript | ~$0.001–0.006 / min | **1 / min** |
| Keyframes + summary | ~$0.003 | **2** |
| Voice dictation | ~$0.001 / clip | **0 (bundled) or 1** |
| Sim | ~$0.05–0.15 | **15** |
| AutoSim run | ~$0.30–0.50 | **75** |

Costs are **config-driven constants** (one table), never hard-coded at call sites, so they re-tune without a deploy chain.

---

## 5. Grants, top-ups, upgrades

**Monthly grant per tier (resets monthly; recommended):**

| Plan | Monthly credits | ≈ what that buys |
|---|---|---|
| **Free** | **100** | ~100 Enhances, or ~1 AutoSim — a real taste |
| **Solo $49** | **1,500** | daily Enhance habit + light Sims |
| **Team $249** | **10,000** | a team's steady AI use |
| **Scale $599** | **40,000** | heavy/CI AutoSim cadence |
| **Founding Ten $299** | Team-level (10,000) locked-for-life | founder loyalty |

- **Reset:** monthly grant does NOT roll over (keeps it a habit meter); **purchased top-up credits DO roll over** and are spent *after* the monthly grant (grant first, then top-up balance).
- **Top-up:** à-la-carte packs, e.g. **$10 / 1,000 credits** (retail $0.01/credit), with volume tiers. For bursts without a plan change. Owner/admin only.
- **Upgrade:** moving up a plan for a bigger monthly grant. Owner/admin only.

---

## 6. The pinch — show the value, then the wall

Never gate the *button*. The sequence at zero balance:
1. Reporter clicks **Enhance** (or a video finishes uploading).
2. Klavity **produces and shows the result** if — and only if — this is affordable; if the wallet is empty, it still lets the *first* one through occasionally (a "last free taste" grace) then shows:
   > "✨ That was your last AI Enhance this month. **Upgrade or top up** to keep AI-drafting your bugs."
3. The **core report still submits** with the plain description — the wall never blocks reporting.

Loss aversion after tasting >> a locked button before. Enhance/transcript are **pre-checked for affordability** and **debited on success** (never charge for a failed/empty draft).

---

## 7. The guest-pinch → admin-nudge loop (the sharpest lever)

The person who wants the AI is frequently a **free guest viewer or anonymous reporter**, not the payer. Engineer that gap:

- A guest/anon who triggers a metered AI action draws from the **workspace's** wallet (rate-capped per §10). When the wallet is empty they see:
  > "This workspace is out of AI credits — **ask your admin to upgrade.**"
- The workspace **owner/admin gets an attributed nudge** (in-app + digest + optionally the new per-project Slack/email from KLA-608):
  > "3 people on **KLAV-88** wanted AI Enhance this week, but you're out of credits. **Top up →**"
- The owner *feels* demand as a draining balance and a queue of unmet AI requests — Figma's "your teammate needs a seat," applied to AI value.

This turns viral free guests into **internal upsell pressure** without ever asking a guest to pay.

---

## 8. Data model

Additive; reuses the existing ledger where possible.

- **`workspace_credits`** (or on the workspace row): `granted_balance INTEGER` (monthly, reset), `topup_balance INTEGER` (rolls over), `grant_period_start`, `plan_grant INTEGER` (the tier's monthly grant), `updated_at`.
- **`credit_ledger`** — append-only: `id, workspace_id, action ('enhance'|'transcript'|'keyframes'|'sim'|'autosim'|'topup'|'grant'|'refund'), credits (signed), ref_feedback_id?, ref_run_id?, actor_email?, is_guest bool, ai_call_id? (FK to ai_calls), created_at`. This is the audit trail + the source for `/opsadmin` credit P&L and the admin nudge ("who wanted what").
- **`credit_action_costs`** — the config table of `action → credits` (§4), editable centrally.
- **Grant reset job:** monthly, sets `granted_balance = plan_grant`, `grant_period_start = now`; on plan change, re-grant pro-rata or next cycle (decision §12).

Spend order: **granted_balance first, then topup_balance.** A debit that can't be fully covered is rejected *before* the model call (so we never spend COGS we can't bill), except the one "last taste" grace.

---

## 9. Enforcement — where credits are checked/debited

Reuse the existing budget choke-points; add a credit gate alongside the COGS gate:

- **`chat()` / the AI call sites** already call `tryReserveDailySpend` + `recordAiCall`. Add a thin **`reserveCredits(workspaceId, action)`** that: (a) resolves the action's credit cost, (b) checks `granted+topup ≥ cost`, (c) on success proceeds and, after the call, **debits + writes `credit_ledger`** linked to the `ai_calls` row; (d) on insufficient, returns a typed `InsufficientCreditsError` the caller surfaces as the §6 pinch (never a 500, never a blocked submit).
- **Enhance** (`/api/report/enhance`): reserve 1 credit before the vision call; debit on a non-null draft.
- **Transcript / keyframes** (the KLA-603 post-submit enrichment): reserve per-minute / per-keyframe-batch; debit on success; if insufficient, skip enrichment (the video + report still land) and enqueue the admin nudge.
- **Sim / AutoSim:** reserve at run start; debit on completion (partial refund on hard failure).
- **Guest/anon actions:** same reserve against the workspace wallet, tagged `is_guest`, behind the §10 cap.

The COGS-cap (`OPS_DAILY_CAP_USD` / tenant budget) stays as the hard backstop *underneath* credits — credits are the customer-facing meter, the COGS cap is the platform safety net.

---

## 10. Guardrails & anti-abuse

- **Core submit never blocked** — zero credits ⇒ plain report still files.
- **Cheap helpers stay free** — clarity coach, auto-title bundled; only heavy AI meters.
- **Guest/anon rate cap** — metered AI from guests/anon capped per (workspace, ticket) and per IP, so a public teaser can't be spammed to drain a wallet. Over the cap → "ask your admin," no debit.
- **Reserve-before-spend** — never make a paid model call we can't bill (except the single "last taste" grace, capped per period).
- **Refund on failure** — a failed/empty AI result refunds its reserved credits (write a negative `credit_ledger` row).
- **Margin visibility** — `/opsadmin` gains a credits panel: granted vs topup consumed, credit revenue vs `ai_calls` COGS = credit margin per workspace.

---

## 11. Back-compat with today's Sim metering

Current meter = "Sims + guarded AutoSim." Migrate that into the unified wallet: a plan's existing Sim quota becomes its credit grant (Sim=15cr, AutoSim=75cr) sized so no current customer is worse off at launch (grandfather generously). Founding Ten keeps daily-AutoSim cadence via a large locked grant. Communicate as "your Sims now spend from one simple AI-credit balance you can also use for AI Enhance & transcripts."

---

## 12. Open decisions (founder sign-off)

1. **Credit peg + markup** — is `1cr ≈ $0.01`, `~4–5× COGS` the right margin? (drives all costs/grants)
2. **Monthly grants** — Free 100 / Solo 1,500 / Team 10,000 / Scale 40,000 — generous enough / too generous?
3. **Voice dictation** — bundle free (like clarity) or meter at 1cr?
4. **Grant rollover** — confirm: monthly grant resets (no rollover), top-ups roll over.
5. **Top-up price** — $10/1,000 credits + volume tiers?
6. **"Last taste" grace** — allow one over-limit AI action per period, or hard stop at zero?
7. **Plan-change re-grant** — pro-rata immediately vs next cycle.

---

## 13. Phasing

- **Phase 1 (meter + wallet, invisible cap):** `credit_action_costs` + `workspace_credits` + `credit_ledger` + `reserveCredits` wired into Enhance/transcript/keyframes/Sim/AutoSim; monthly grant + reset job; `/opsadmin` credits panel. Enforce softly (log, don't block) to validate consumption vs COGS on real traffic.
- **Phase 2 (the pinch + relief):** the §6 show-value-then-wall UX, owner top-up + upgrade flows, the balance meter in the dashboard.
- **Phase 3 (the guest loop):** guest/anon AI draws + "ask your admin," the attributed admin nudge (in-app + digest + Slack/email via KLA-608).

---

## 14. Testing

- `reserveCredits`: sufficient → debit + ledger row linked to `ai_calls`; insufficient → typed error, NO model call, NO debit; grant-before-topup spend order; refund on failure writes the negative row.
- Core submit files at zero credits (never blocked).
- Enhance/transcript skip cleanly + enqueue nudge when insufficient; the report/video still land.
- Guest AI draws from the workspace wallet, respects the per-(workspace,ticket,IP) cap, and shows "ask your admin" at zero.
- Monthly reset restores `granted_balance = plan_grant`; top-up balance survives reset.
- `/opsadmin` credit margin = credit-revenue − `ai_calls` COGS reconciles.
