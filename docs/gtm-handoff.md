# Klavity GTM — Growth Handoff

_Owner: growth agent. Companion docs: [`gtm-scorecard.md`](./gtm-scorecard.md) (what to track) · [`gtm-outreach.md`](./gtm-outreach.md) (how to seed the first users)._

## 1. Strategy (locked)

**Two ICPs, two front doors, one engine.** Klavity's Sims (AI personas that use your product like a real customer) power both:

- **CRO Sim** → _marketers_: "Why isn't your site converting?" Paste a URL, an AI customer tries to convert and reports the friction.
- **Vibe Check** → _vibe coders_ (bigger, more urgent market): people who can now **build** anything with AI but can't **verify** it works or is safe. Wedge = **"Does it work?"** — Sims attempt the core jobs and report what's broken/confusing, with the fix.

**Positioning:** _"You can build anything now. Klavity makes sure it actually works — and keeps working."_ The senior engineer / QA teammate over the builder's shoulder. Maps 1:1 to the north-star JTBD ("I told you multiple times" + "why are fixed things breaking again").

**Acquire vs. retain:** the free one-time audit **acquires**; continuous Sims on every deploy (a "still works ✓ / just broke ✗" heartbeat) **retains**. The front door is a standalone branded page that funnels into signup, so it doesn't muddy the core QA positioning.

## 2. What is LIVE on prod (v0.39.636)

| Capability | Ticket | Notes |
|---|---|---|
| Free CRO / Vibe Check tool | — | `klavity.in/cro` (+ `/roast`): URL → AI persona → top-2 frictions free → **email gate** → full report + "one fix now" → CTA to `/onboarding?ref=cro` |
| PostHog on all pages | 325 | incl. the CRO front door (was the only page missing it — fixed) |
| PostHog **activation events** | 335 | Project 99843. Fires `signup_completed`, `first_sim_run`, `first_bug_filed`, `first_widget_report` |
| **UTM first-touch attribution** | 326 / 324 | `site/attr.js` captures utm/referrer → persisted to `accounts.first_source/medium/campaign/referrer` via `/api/auth/verify` |
| **Funnel events** | 327 | `funnel_events` table + `POST /api/track`; full journey (see §3) |
| **Lead-nurture sequence** | 330 | auto-enrolls CRO leads on `lead_captured` |

**Net:** acquisition → funnel → attribution → activation → nurture are all instrumented and live. You can now see the funnel *and* attribute paid users to channel.

## 3. The funnel (canonical event spine)

`funnel_events` table records, in order:

```
check_started → check_completed → lead_captured → app_connected
→ continuous_enabled → checkout_started → subscription_created → subscription_canceled
```

Join keys: **anon_id → email → account_id** (anonymous run stitches to the paid account). Every row carries `source / medium / campaign / referrer` so paid attributes to channel. `check_started` is the only client-fired event (`/api/track`); everything from `check_completed` on is server-trusted.

## 4. The plan to first 100 paid

- **Funnel math:** run→paid ≈ 2% → **100 paid ≈ ~5,000 completed runs.**
- **Leading indicator:** weekly **activated** users (`app_connected` / `continuous_enabled`) — value is felt here, and it precedes paid + retention.
- **Truth serum:** **D30 retention > 85%.** Below that, do not scale spend.

**Diagnostic patterns (the market signal):**
- High runs, low activation → wedge/message wrong.
- High activation, low paid → pricing/packaging gap.
- High paid, high churn → product not sticky yet.

**Milestones:** 0→10 (manual, hand-held design partners) · 10→40 (find the one repeatable channel) · 40→100 (double down + share/referral loops).

## 5. Ticket status (Plane / KLAVITYKLA)

- **P0:** 325 ✅ · 326 ✅ · 327 ✅ · 335 ✅ · **328 (Stripe billing events → funnel) OPEN** — last P0.
- **P1:** 330 ✅ · **329 (session replay) · 331 (Cal.com booking) · 332 (weekly scorecard) OPEN.**

## 6. Immediate next actions (growth agent)

1. **Stand up the weekly scorecard** — framing + SQL ready in [`gtm-scorecard.md`](./gtm-scorecard.md) (ticket 332).
2. **Start design-partner outreach now** — the tool is live; seed the first runs while 328/329/331 land. Playbook + UTM conventions + message templates in [`gtm-outreach.md`](./gtm-outreach.md).
3. **Watch activation%, not runs** — earliest signal the wedge is right.
4. **Land 328** so paid + churn sit in the funnel stream and the scorecard's paid-by-source is complete.

_Caveat unrelated to GTM: 2 pre-existing test failures in the expectations/Trails feature on master (not from any growth work) — flagged for that feature's owner._
