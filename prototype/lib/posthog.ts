// PostHog server-side capture helper — KLAVITYKLA-335.
// Fire-and-forget activation events sent directly to the PostHog /capture endpoint.
// The helper is a thin wrapper: it builds the payload, fires a best-effort POST, and
// swallows any errors so a PostHog outage never impacts the request path.
//
// Usage:
//   void capturePosthog("user@example.com", "signup_completed", { email: "user@example.com" })
//
// The function is a no-op when KLAV_POSTHOG_KEY is not set (local dev / CI).

const POSTHOG_ENDPOINT = "https://us.i.posthog.com/capture/"

// ── Per-occurrence volume events (KLAVITYKLA-372) ───────────────────────────────
// Everything PostHog had before this was a `first_*` milestone: by construction each of
// those fires AT MOST ONCE per user/project, so they answer "did they ever activate?" and
// can never answer "how much is happening?". Volume, growth and per-account activity were
// therefore unqueryable.
//
// These events fire on EVERY occurrence. They are deliberately few — one per real unit of
// product work — so the analytics surface stays legible:
//
//   bug_filed          — a bug report was persisted through the human reporting path
//                        (widget / extension / Snap), including a repeat report that
//                        deduped onto an existing cluster (a repeat IS a filed report and
//                        the `deduped` property lets you exclude it if you want net-new).
//                        Sim-authored findings deliberately do NOT fire this: they are
//                        machine-discovered, not user-filed, and mixing them would make
//                        "how many bugs did our users actually report" unanswerable. That
//                        volume is carried by sim_run_completed.observation_count instead.
//   sim_run_completed  — a Sim run finished and its sim_runs row was persisted. Carries
//                        duration_ms (KLAVITYKLA-371 gave runs true start/finish stamps),
//                        which is the whole point: run latency is finally queryable.
export const OCCURRENCE_EVENTS = ["bug_filed", "sim_run_completed"] as const
export type OccurrenceEvent = (typeof OCCURRENCE_EVENTS)[number]

/** Where a filed bug came from. Closed enum — never free text off a request. */
export type BugFiledSurface = "widget" | "extension" | "sim" | "api"
const BUG_SURFACES: readonly string[] = ["widget", "extension", "sim", "api"]

/** What kicked off a Sim run. Closed enum. */
export type SimRunTrigger = "manual" | "scheduled"

// Enum-ish free-text fields (priority / sentiment / plan) are normalized: lowercased,
// trimmed and hard-capped. They are model/DB-controlled vocabularies, never reporter text,
// so they cannot smuggle PII — the cap is belt-and-braces against a future schema change.
function enumProp(v: unknown): string | null {
  if (v == null) return null
  const s = String(v).trim().toLowerCase().slice(0, 32)
  return s || null
}

export interface BugFiledInput {
  projectId: string
  feedbackId: string
  /** widget | extension | sim | api — anything else is coerced to "api". */
  source: string
  /** true when this report deduped onto an existing cluster (a recurrence, still a filing). */
  deduped: boolean
  priority?: string | null
  sentiment?: string | null
  hasScreenshot?: boolean
  /** account plan tier, e.g. "free" / "pro" / "founding". */
  plan?: string | null
}

/**
 * Build the `bug_filed` property bag.
 *
 * PII posture — every property here is an opaque internal id, a boolean, or a closed
 * vocabulary. Deliberately ABSENT: the reporter's email, the observation/description text,
 * the screenshot, and the customer's page URL (host or path — a path routinely carries
 * account ids, order numbers and tokens). Identity lives in PostHog's `distinct_id`, which
 * is the same field the existing first_* events already use.
 */
export function buildBugFiledProps(input: BugFiledInput): Record<string, unknown> {
  const source = BUG_SURFACES.includes(input.source) ? input.source : "api"
  return {
    project_id: input.projectId,
    feedback_id: input.feedbackId,
    source,
    deduped: !!input.deduped,
    priority: enumProp(input.priority),
    sentiment: enumProp(input.sentiment),
    has_screenshot: !!input.hasScreenshot,
    plan: enumProp(input.plan) ?? "free",
  }
}

export interface SimRunCompletedInput {
  projectId: string
  simRunId: string
  /** manual (/api/sim/review) or scheduled (cron tick). */
  trigger: SimRunTrigger
  /** wall-clock ms from true run start to true finish — KLAVITYKLA-371. */
  durationMs: number | null
  /** how many Sims actually produced a review in this run. */
  simCount: number
  /** how many observations those Sims produced. */
  observationCount: number
  status?: string | null
  plan?: string | null
}

/**
 * Build the `sim_run_completed` property bag.
 *
 * PII posture — ids, counts, a duration and closed vocabularies only. Deliberately ABSENT:
 * the reviewed page URL, the screenshot, the actor's email and the observation text (which
 * quotes real page content). duration_ms is clamped non-negative and dropped if not finite,
 * so a clock skew can't poison the latency series.
 */
export function buildSimRunCompletedProps(input: SimRunCompletedInput): Record<string, unknown> {
  const dur = input.durationMs
  return {
    project_id: input.projectId,
    sim_run_id: input.simRunId,
    trigger: input.trigger === "scheduled" ? "scheduled" : "manual",
    duration_ms: typeof dur === "number" && Number.isFinite(dur) ? Math.max(0, Math.round(dur)) : null,
    sim_count: Number.isFinite(input.simCount) ? Math.max(0, Math.trunc(input.simCount)) : 0,
    observation_count: Number.isFinite(input.observationCount) ? Math.max(0, Math.trunc(input.observationCount)) : 0,
    status: enumProp(input.status) ?? "done",
    plan: enumProp(input.plan) ?? "free",
  }
}

/**
 * Best-effort plan-tier lookup for an event property. Never throws, never blocks the
 * caller's happy path (callers `void` the whole emit), and returns null if anything is
 * missing so the event still fires without a plan rather than being dropped.
 *
 * Deps are injected so this is hermetically testable and posthog.ts stays free of a
 * db.ts import (which would drag the whole schema bootstrap into the analytics module).
 */
export async function planTierForProject(
  projectId: string,
  deps: {
    accountIdForProject: (projectId: string) => Promise<string | null>
    accountPlan: (accountId: string) => Promise<string>
  },
): Promise<string | null> {
  try {
    const accountId = await deps.accountIdForProject(projectId)
    if (!accountId) return null
    return (await deps.accountPlan(accountId)) || null
  } catch {
    return null
  }
}

/** Fire-and-forget `bug_filed`. Never throws. */
export async function captureBugFiled(distinctId: string, input: BugFiledInput): Promise<void> {
  await capturePosthog(distinctId, "bug_filed", buildBugFiledProps(input))
}

/** Fire-and-forget `sim_run_completed`. Never throws. */
export async function captureSimRunCompleted(distinctId: string, input: SimRunCompletedInput): Promise<void> {
  await capturePosthog(distinctId, "sim_run_completed", buildSimRunCompletedProps(input))
}

// ── Session-replay gating (KLAVITYKLA-329) ──────────────────────────────────────
// GTM P1-5: we want PostHog session replay (masked) for roughly the first ~50 tool
// users only — enough to watch the earliest activation journeys without recording
// forever. The client SDK arms recording; the SERVER decides whether to arm it by
// substituting a flag into the app-page HTML, gated on this cap. Client-side we also
// respect Do-Not-Track / opt-out (posthog `respect_dnt`), so this is only the volume gate.
export const POSTHOG_REPLAY_USER_CAP = 50

/**
 * Decide whether masked session replay should be armed for this page load.
 * Off unless PostHog is configured AND we're still under the tool-user cap.
 * Kept pure + injectable so it's hermetically testable and callers pass the count.
 *
 * @param opts.hasKey        whether KLAV_POSTHOG_KEY is configured (no key → no PostHog)
 * @param opts.toolUserCount current count of tool users (e.g. rows in `users`)
 * @param opts.cap           override the default ~50 cap (tests / tuning)
 */
export function posthogReplayEnabled(opts: {
  hasKey: boolean
  toolUserCount: number
  cap?: number
}): boolean {
  const cap = opts.cap ?? POSTHOG_REPLAY_USER_CAP
  if (!opts.hasKey) return false
  if (!Number.isFinite(opts.toolUserCount) || opts.toolUserCount < 0) return false
  return opts.toolUserCount < cap
}

/**
 * Fire-and-forget PostHog server-side capture.
 * @param distinctId - the user's email or a stable anonymous id
 * @param event - the PostHog event name
 * @param properties - arbitrary event properties (merged with $lib marker)
 */
export async function capturePosthog(
  distinctId: string,
  event: string,
  properties: Record<string, unknown> = {},
): Promise<void> {
  const key = process.env.KLAV_POSTHOG_KEY
  if (!key) return

  try {
    await fetch(POSTHOG_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        distinct_id: distinctId,
        event,
        properties: {
          $lib: "klavity-server",
          ...properties,
        },
      }),
    })
  } catch {
    // Silently swallow — PostHog capture must never affect the request path.
  }
}
