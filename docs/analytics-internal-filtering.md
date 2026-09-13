# Analytics: signup funnel + internal-traffic filtering (KLA-839 / KLA-840)

This is the single source of truth for how signup conversion is tracked and how internal
Quantana traffic is excluded. It covers both the **code** (already shipped in this repo) and
the **PostHog / GA4 dashboard actions** the growth team must apply once (they cannot be done
from code).

## KLA-839 — one canonical PostHog signup event: `signup_completed`

**Root cause of the 0% funnel:** the app emitted the signup conversion under *two different
PostHog event names*:

- **Server** (`prototype/lib/posthog.ts`, fired from `server.ts` on genuinely-new accounts):
  `signup_completed` — this is the source of the ~23 events already in PostHog.
- **Client** (`site/onboarding.html`, `prototype/public/login.html`): fired `sign_up`.

The PostHog funnel filtered on one name; the reliably-firing events carried the other, so the
signup step matched nothing → **0% conversion**.

**Fix (code):** the client now fires **`signup_completed`** too, so client and server speak one
name. GA4 keeps its own recommended `sign_up` event name (that is GA4's convention — do not
rename it).

**Fix (PostHog UI — do this once):**
1. Open the signup / GTM conversion funnel.
2. Set the **signup step's event to `signup_completed`**.
3. The ~23 existing events already carry this exact name, so they appear in the funnel
   immediately — confirm the step count goes from 0 to the real number.

> Note on person-stitching: the client event fires after `posthog.identify(email)`, so it is tied
> to the same distinct_id as the anonymous pre-signup pageviews. That is what lets the funnel
> connect *traffic source → signup*. The server event (distinct_id = email) is the reliable
> belt-and-braces copy. A person firing both counts once in a funnel, so there is no double-count
> in conversion rate (raw event **trends** will roughly double — filter on `$lib = klavity-server`
> if you want the server-only series).

## KLA-840 — exclude internal Quantana traffic

Internal = any `@quantana.*` email — every Quantana domain and subdomain (`quantana.in`,
`quantana.com.au`, `quantana.com`, `quantana.top`, `foo.quantana.in`, …) — plus anything in the
`KLAV_INTERNAL_DOMAINS` env var. Single source of truth: `isInternalEmail()` in
`prototype/lib/auth.ts` (regex `(^|\.)quantana\.`). The PostHog project `test_account_filters`
and the "Internal Quantana (exclude)" cohort use the same `quantana.` match.

### PostHog

**Code (shipped):**
- `capturePosthog()` stamps every server event from an internal email with an event property
  `is_internal: true` **and** sets a durable **person property** via `$set: { is_internal: true }`.
- Logged-in app pages (`posthog.identify` snippet) and the signup handlers set the same
  `is_internal: true` person property client-side, so internal pageviews/autocapture are covered
  too — not just server events.

Because `is_internal` is a **person property**, it sticks to the whole person across every event
and stream. That means the growth team only has to add **one filter**, not a per-event
`email contains …` clause.

**PostHog UI — do this once:**
1. **Funnels / insights / dashboards:** add a global filter `Person property → is_internal → is
   not set` (or `is not equal to true`). Apply it to every conversion dashboard.
2. **(Optional) Cohort:** create a static/dynamic cohort "Internal Quantana" = `is_internal = true`
   and exclude it at the dashboard level for convenience.
3. **(Optional) Ingestion drop:** if internal volume is large enough to matter for billing, add a
   PostHog ingestion **transformation / filter** dropping events where
   `properties.is_internal = true`. Leave this off unless volume justifies it — keeping the events
   (just flagged) means we can still audit internal activity when we want to.

### GA4

GA4 has no server-side ingestion here, and marketing-site pageviews are anonymous (no email), so
GA4's built-in exclusion is primarily **IP-based** and must be configured in the GA4 Admin UI.

**Code (shipped):** where an email *is* known (the signup conversion), internal users get
`gtag('set', { traffic_type: 'internal' })` before the `sign_up` event, so that conversion event
carries GA4's internal-traffic marker.

**GA4 UI — do this once (property: `G-Q9H005LW9K`):**
1. **Admin → Data Streams → (web stream) → Configure tag settings → Show all → Define internal
   traffic.** Add a rule `traffic_type = internal` matching the office / team IP addresses.
2. **Admin → Data Settings → Data Filters.** Set the built-in **Internal Traffic** filter to
   **Active** (it ships as *Testing*, which does not actually exclude anything). This filter keys
   on `traffic_type = internal`, which is both the IP rule above and the `gtag('set')` we emit.
3. Confirm the baseline signup count before/after so the real external number is known
   (KLA-839 / KLA-840 acceptance).

## Files touched

- `prototype/lib/posthog.ts` — `is_internal` event + `$set` person property at ingestion.
- `prototype/lib/posthog.test.ts` — internal-flagging tests.
- `prototype/server.ts` — `/api/me` and `/api/auth/verify` now return `internal`.
- `site/onboarding.html`, `prototype/public/login.html` — client fires `signup_completed`
  (was `sign_up`); tags internal traffic for GA4/PostHog.
- `prototype/public/{dashboard,inbox,trails,sim-runs,sim-profile,auth-router,autosims-walk,autosims-walks,autosims-walk-report}.html`
  — identify snippet sets the `is_internal` person property for internal users.
