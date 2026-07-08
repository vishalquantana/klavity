# Klavity Pricing Proposal

> Date: 2026-07-08 · Status: **Proposed** (billing enforcement gated on AutoSim Phase-1 stability, per
> `docs/superpowers/specs/2026-07-07-autosim-improvements-design.md` — "prerequisite for charging money")
>
> Grounded in a 4-angle research workflow (2026-07-08): bug-reporter pricing refresh, AI-QA-agent pricing,
> AI-SaaS pricing patterns, and measured local COGS from the `ai_calls` ledger + `prototype/docs/bench-autosim-cost.md`.
> Builds on `docs/competitor-marker-io-plg.md` (the "commoditize plumbing, monetize AI" strategy) and
> `docs/superpowers/specs/2026-06-16-klav-gtm-brief.md` (superseded price points — those were Sonnet-era COGS estimates).

---

## 1. Strategy recap (already locked, 2026-06-21)

Everything Marker.io charges $149/mo for (widget, dev-tools capture, session replay, 2-way sync, branding)
is **free** in Klavity — the acquisition wedge. Revenue comes from the AI layer they structurally can't match:
**Sims** (personas that find bugs nobody filed) and **AutoSims** (flows kept green autonomously).
This doc locks the previously-open decision: **the meter**.

## 2. Market findings (mid-2026)

### Bug-reporting plumbing (Snap's category)
- Entry plans cluster **$29–50/mo** (Userback $29, Marker $39, BugHerd $42, Gleap $49, Bird $50); "most popular" tiers $67–159; Marker Team now **$149 annual / $199 monthly**.
- Universal norms: external reporters/viewers **always free**; session replay + 2-way sync are the mid-tier hooks; SSO/audit/remove-branding held hostage until $159–999+.
- Prices are moving **up** (Marker restructure, Markup.io +172%, BugHerd complaints) → an **under-$30 gap** served only by Ybug (€10–23) and Jam ($14/creator).
- Nobody outcome-prices AI. Jam meters AI as credits inside seats (200 uses/user/mo); Gleap bills raw tokens (~$0.04/msg).

### AI QA agents (AutoSim's category)
- Managed "we keep N tests green" = **$40–70 per test/month** (QA Wolf ~$90K median ACV; Ranger, Spur $4–8K/mo, Bug0 $2.5K flat). All sales-gated; all anchor on a loaded QA-engineer salary ($102–196K/yr).
- Self-serve credits = **$0.05–0.20 per AI test run** (Momentic ~$0.019/step, Stably pass-through).
- Cleanest public midpoint: **Checkly $32/mo per always-on "Agentic Check."**
- ⚠️ Shakeout: **Octomind discontinued May 2026** at $299/mo self-serve flat — the mid-tier dead zone without a managed moat or PLG unit economics.

### AI SaaS pricing meta
- **Hybrid won**: platform fee + included usage + capped overage jumped to ~40% of market (Growth Unhinged 2026); credits at 29% adoption; GitHub Copilot went usage-based June 2026. Pure outcome pricing stays narrow (Intercom Fin $0.99/resolution).
- Failure modes to design around: **bill shock** (Replit effort-billing), **credit anxiety** (Lovable: "a bug loop burns a month of credits"), **silent repricing** (Cursor backlash).
- Mechanics worth copying: Fin's once-per-conversation charge cap; Outset's "iteration is free"; Devin's legible effort unit (ACU).

## 3. Our measured COGS (ai_calls ledger + 2026-07-04 bench — NOT the old Sonnet estimates)

| Unit | Real cost | Evidence |
|---|---|---|
| Sim reaction (per persona per page) | **$0.0014–0.005** | `prototype/lib/db.ts:1680`, bench-sim-review |
| Transcript → persona extraction | ~$0.002–0.013 | 100k-char cap + model-mix token math |
| AutoSim Trail authoring run | **$0.002–0.007** (hard cap $0.15/40 steps) | `prototype/docs/bench-autosim-cost.md` |
| Crystallized replay, green path | **$0 LLM** (Tier-0/1 zero-LLM); heal ~$0.0005–0.0014/step | `docs/autosim-dogfood-findings.md` |
| Steel browser time | ≤$0.0033/walk (120s cap × $0.10/hr) | `docs/steel-remote-browser.md` |
| Fixed infra | ~$5–12/mo total (Vultr + Steel + Turso/S3 free-tier) | deploy docs |

Guardrails already shipped: $0.01/call fail-closed reservation, atomic daily cap, `OPS_DAILY_CAP_USD=50`, 20-call session ceiling.

## 4. The value metric

**Sell legible units, not credits or seats:**

1. **Sims** — personas actively watching your product (with a fair-use reactions/mo allowance inside).
2. **Guarded flows** — AutoSim Trails kept green on a schedule (runs are fair-use, not a visible currency).

Rationale: dodges credit anxiety and bill shock; maps 1:1 to the proven "per always-on check" (Checkly) /
"per test maintained" (QA Wolf) metric at a fraction of their price; scales with customer value; the
`ai_calls` ledger gives exact per-unit COGS to police margins.

## 5. Proposed tiers

| | **Free** | **Pro — $29/mo** | **Team — $99/mo** | **Scale — custom** |
|---|---|---|---|---|
| Snap: widget, extension, all connectors, replay*, dedup, unlimited reports & reporters | ✅ all of it | ✅ | ✅ | ✅ |
| Seats | Unlimited | Unlimited | Unlimited | Unlimited |
| Projects | 1 | 5 | Unlimited | Unlimited |
| Sims | 1 · 25 reactions/mo | 5 · 500 reactions/mo | 20 · 2,500 reactions/mo | Custom |
| AutoSim guarded flows | 1 · weekly runs | 5 · daily runs | 20 · on-deploy/hourly + CI | Custom · +$5/extra flow/mo |
| Widget branding | "Powered by Klavity" badge | Removable + custom themes | ✅ | ✅ |
| SSO / audit / data masking / self-host support+SLA | — | — | Google/MS SSO | ✅ SAML/SCIM (anchor $500+/mo) |

*Session replay is a build gap (G1 in `docs/competitor-marker-io-plg.md`) — ships into Free when built.

- **Annual = 2 months free (~17%)**, category standard.
- **Free** = the Marker-killer wedge + a taste of AI (the "bugs nobody filed" aha). Badge = zero-CAC viral loop, removable on paid.
- **$29 Pro** lands in the documented under-$30 gap; solo devs/freelancers whom incumbents price out. Worst-case COGS at full utilization ≈ $4–5 → ~85% margin floor, 95%+ typical.
- **$99 Team** undercuts Marker $149 while including a category they don't sell. Headline: **20 flows ≈ $5/flow/mo vs Checkly $32/check vs QA Wolf $40–70/test.** Flat unlimited seats = the 2026 marketing weapon (Userback just moved there).
- **No $299 tier** — that's Octomind's grave. Above Team, sales-assisted Scale with the salary anchor ("a fraction of half a QA engineer").

## 6. Risk-capping mechanics (day-one requirements)

1. **Iteration is free**: authoring/editing/verification runs never count against quota — only scheduled/triggered guard runs do.
2. Hitting a cap **degrades cadence** (daily→weekly), never hard-stops mid-month, never silent overage billing.
3. **Live usage meter** on the dashboard (backed by the existing `ai_calls` ledger).
4. Any future pricing change: **grandfather generously, announce loudly** (Cursor lesson).

## 7. Sequencing

1. **Now**: publish the pricing page + free tier (pure positioning ammo vs Marker; "free forever" already on site).
2. **Then**: Stripe billing plumbing (checkout, plan state, quota enforcement) — dark until…
3. **Enforce paid tiers only after AutoSim Phase-1 stability** (run queue, Steel, crash recovery) per the 2026-07-07 spec.
4. Continuous: **cost audit log** proving per-tenant COGS < plan revenue (see ticket).

## 8. Open decisions

- Pro at $29 vs $19 (deeper wedge). **Lean $29** — the gap is unserved at $29 and margin headroom doubles.
- Free tier includes 1 weekly AutoSim flow vs Sims-only. **Lean include** — a stranger's first green/red run is the conversion moment.
- Agency plan (multi-project flat, Marker Agency $99 analog) — revisit after first 10 paying teams.
