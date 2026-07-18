# Weekly GTM Scorecard — framing (KLAVITYKLA-332)

_The one dashboard the team reads every Monday. Data sources are LIVE: `funnel_events` (327), `accounts.first_*` attribution (326), PostHog activation events (335). SQL below is SQLite/Turso and runs today._

## The 9 columns

| Column | Definition | Why |
|---|---|---|
| **Reach** | posts / comments / impressions (manual entry for now) | top of funnel |
| **Runs** | `check_started` count | demand |
| **Completion %** | `check_completed / check_started` | tool works + is compelling |
| **Leads** | `lead_captured` count | email captured |
| **Activation %** (count) | distinct accounts with `app_connected` OR `continuous_enabled` ÷ leads | **leading indicator** |
| **New Paid** | `subscription_created` count | **the number** |
| **MRR** | active pro/team accounts × price | revenue |
| **D30 Retained %** | paid cohort still active 30d later | **truth serum** |
| **Best channel** | New Paid grouped by `source` | where to double down |

**Rules of thumb:** New Paid is the number, Activation% is the leading signal, D30 Retained is the truth serum. If D30 < 85%, fix retention before scaling spend.

## SQL (weekly buckets; `created_at` is epoch-ms → `/1000`)

### A. Weekly funnel counts
```sql
SELECT strftime('%Y-W%W', created_at/1000, 'unixepoch') AS week,
  SUM(event='check_started')        AS runs,
  SUM(event='check_completed')      AS completed,
  SUM(event='lead_captured')        AS leads,
  COUNT(DISTINCT CASE WHEN event IN ('app_connected','continuous_enabled')
                      THEN COALESCE(account_id, email, anon_id) END) AS activated,
  SUM(event='subscription_created') AS new_paid,
  SUM(event='subscription_canceled')AS churned
FROM funnel_events
GROUP BY week ORDER BY week DESC;
```
Completion% = `completed/runs`; Activation% = `activated/leads`.

### B. New Paid by channel (attribution)
```sql
-- Prefer the funnel row's own source; fall back to the account's first-touch.
SELECT strftime('%Y-W%W', fe.created_at/1000, 'unixepoch') AS week,
       COALESCE(NULLIF(fe.source,''), a.first_source, 'direct') AS channel,
       COUNT(*) AS new_paid
FROM funnel_events fe
LEFT JOIN accounts a ON a.id = fe.account_id
WHERE fe.event = 'subscription_created'
GROUP BY week, channel ORDER BY week DESC, new_paid DESC;
```

### C. MRR (from billing state, not funnel)
```sql
SELECT SUM(CASE plan WHEN 'pro' THEN 29 WHEN 'team' THEN 99 ELSE 0 END) AS mrr_usd
FROM accounts
WHERE billing_status = 'active' AND plan IN ('pro','team');
```

### D. D30 retention of a weekly paid cohort
```sql
WITH created AS (
  SELECT COALESCE(account_id, email) AS acct, MIN(created_at) AS started_at
  FROM funnel_events WHERE event='subscription_created' GROUP BY acct),
canceled AS (
  SELECT COALESCE(account_id, email) AS acct, MIN(created_at) AS canceled_at
  FROM funnel_events WHERE event='subscription_canceled' GROUP BY acct)
SELECT strftime('%Y-W%W', c.started_at/1000, 'unixepoch') AS cohort_week,
       COUNT(*) AS cohort,
       SUM(CASE WHEN x.canceled_at IS NULL
                 OR x.canceled_at > c.started_at + 30*86400000 THEN 1 ELSE 0 END) AS retained_d30
FROM created c LEFT JOIN canceled x ON x.acct = c.acct
GROUP BY cohort_week ORDER BY cohort_week DESC;
```
D30 Retained% = `retained_d30/cohort` (only meaningful for cohorts ≥30d old).

## Build options (332)

- **Fast (recommended):** add a **"Growth" tab to `/opsadmin`** (already gated by `OPS_ADMIN_EMAILS`). Run queries A–D + the PostHog activation counts, render the 9 columns for the last 8 weeks + a paid-by-channel breakdown.
- **Alt:** a **PostHog dashboard** (funnel insight over `check_started…subscription_created`, retention, breakdown by `source`) — leans on activation events already flowing (335).

**DoD:** the 9 columns render for the last 8 weeks; paid-by-source breakdown shows; access gated to ops admins.

## Cadence

Read weekly. Each week, act on the diagnostic: low Activation% → fix the wedge/message; high Activation but low Paid → pricing/packaging; high Paid but low D30 → retention. Track **paid-per-channel**, not runs-per-channel — a channel that drives runs but no paid is a vanity channel.
