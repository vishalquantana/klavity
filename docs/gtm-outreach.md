# Design-Partner Outreach — seed the first 10–20 (then 100)

_Goal for this phase: not a marketing machine — a repeatable channel + message + activation. Do things that don't scale. Talk to every early user._

## Who to target (in priority order)

1. **Vibe coders** — building real apps with AI (Lovable / Replit / Cursor / Bolt / v0), not trained engineers. Pain: can **build** but can't **verify** it works or is safe. This is the sharpest, most urgent ICP.
2. **Solo founders / 2–15-person PLG SaaS teams** with no dedicated QA — feel both trust complaints ("users hit stuff I didn't catch" + "I fixed that, why's it broken again").
3. **Web/CRO agencies & freelancers** — run the tool on client sites daily; highest LTV, natural path to Team ($99) + reseller.

## Where they are

- **X / build-in-public**, **r/vibecoding**, **r/SaaS**, **r/startups**, **r/indiehackers**, **Indie Hackers**
- **Lovable / Replit / Cursor / Bolt Discords & forums**
- Warm: founder network, incl. the "vibe-coded a wellness platform" friend as design partner #1.

## The move: give the audit away, don't link-drop

In "roast my landing page" / "check my app" threads and DMs, **run the tool yourself and paste a genuinely specific critique** (the Sim's persona + top frictions). Value first. When they ask "how'd you do that so fast?" → then mention `klavity.in/cro`. Reddit/Discord punish overt promotion; earned value compounds.

## Message templates

**Reddit/Discord comment (value-first, no link):**
> Ran an AI "first-time visitor" over your page — it bounced at the hero because it couldn't tell what you actually sell in 5s, and the CTA ("Submit") gave it nothing to expect. Biggest fix: lead with the outcome, not the feature. Happy to share the full friction list if useful.

**X post (shareable, use a well-known site):**
> I sent an AI customer to [famous site] and watched where it gave up trying to convert. Here's the friction list 👇 [screenshot] — you can run yours free at klavity.in/cro?utm_source=x&utm_medium=post&utm_campaign=roast

**Cold DM to a vibe coder:**
> Saw you shipped [app] — love it. I built a thing that sends an AI user through your app and tells you what's broken / confusing / unsafe before real users hit it. Want me to run yours? Free, takes ~15s.

**Agency cold email (subject: "an AI user found 5 things on [client] site"):**
> Ran [client].com through our AI CRO check — 5 ranked conversion frictions, each with the fix. Thought your team could use it on every client. Free to try: [link]. Reply and I'll send [client]'s full report.

## UTM conventions — REQUIRED (this is how attribution works)

The tool + signup persist first-touch `utm_*` → `accounts.first_source/medium/campaign` (326), and every `funnel_events` row carries `source`. **Every link you post MUST carry UTMs** or the channel shows up as `direct` and the scorecard can't tell you what's working.

Format: `klavity.in/cro?utm_source=<channel>&utm_medium=<format>&utm_campaign=<play>`

| Channel | utm_source | utm_medium | example utm_campaign |
|---|---|---|---|
| Reddit | `reddit` | `comment` / `post` | `roast` , `vibecheck` |
| X | `x` | `post` / `dm` | `roast` , `buildinpublic` |
| Discord | `discord` | `message` | `lovable` , `replit` |
| Cold email | `email` | `cold` | `agencies` |
| Direct DM | `dm` | `x` / `li` | `founders` |

Keep `utm_source` values from the fixed set above so the scorecard's "Best channel" grouping stays clean.

## Cadence & targets (weeks 1–3, the 0→10)

- **Daily:** 5–10 value comments/DMs across the channels above; 10 free deep audits offered.
- **Weekly:** book calls with every activated user (Cal.com link once 331 lands); ask "would you pay for this to run continuously?"
- **Target:** 10 paying + 15–20 real conversations. Optimize for **activation** (did they connect a real app?), not raw runs.

## What to record (feeds the scorecard)

- Reach (posts/comments) per channel — manual, weekly.
- Everything else is auto-captured via UTMs → `funnel_events` + `accounts`. Read it in the [scorecard](./gtm-scorecard.md).
- Qualitative: log every call's "would you pay?" + top objection. These become the next message iteration.
